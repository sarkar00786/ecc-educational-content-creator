import { useState, useEffect, useCallback, useMemo, Suspense, useReducer } from 'react';
import React from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  orderBy,
  getDocs,
  query
} from 'firebase/firestore';
import ErrorBoundary from './components/common/ErrorBoundary';
import {
  AppInitializationSpinner,
  ContentLoadingSpinner,
  PageLoadingSpinner
} from './components/common/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import AuthScreen from './components/auth/AuthScreen';
import Header from './components/layout/Header';
import ToastNotification from './components/common/ToastNotification';
import useVoiceControl from './hooks/useVoiceControl';
import VoiceFeedback from './components/common/VoiceFeedback';
import useNotificationManager from './hooks/useNotificationManager';
import NotificationCenter from './components/common/NotificationCenter';
import InlineNotification from './components/common/InlineNotification';
import AnimatedIcon from './components/common/AnimatedIcon';
import { NOTIFICATION_CONTEXTS } from './services/notificationService';
import { progressiveOnboardingService } from './services/progressiveOnboardingService';
import FeedbackForm from './components/content/FeedbackForm';
import WelcomeTrialBanner from './components/common/WelcomeTrialBanner';
import RateLimitNotification from './components/common/RateLimitNotification';
import { userTierManager } from './config/userTiers';

// Lazy-loaded components for better performance
const ContentGenerationPage = React.lazy(() => import('./components/content/ContentGenerationPage'));
// Temporary static import for ContentHistoryPage to fix dynamic import issue
import ContentHistoryPage from './components/history/ContentHistoryPage';
const GeneratedContentDisplay = React.lazy(() => import('./components/content/GeneratedContentDisplay'));
const MyProfilePage = React.lazy(() => import('./components/settings/MyProfilePage'));
const AdvancedSettingsPage = React.lazy(() => import('./components/settings/AdvancedSettingsPage'));
const PreferencesPage = React.lazy(() => import('./components/settings/PreferencesPage'));
const PurchasePage = React.lazy(() => import('./components/pages/PurchasePage'));

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNvDI9g6rQdwsPj7muECmr7RKaby6qyQc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-q-34d01.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-q-34d01",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-q-34d01.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "910875870805",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:910875870805:web:e8a5396a8c91825e3fb6dc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-00GVMJ9MEE"
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('🔥 Firebase configuration is incomplete:', firebaseConfig);
  throw new Error('Firebase configuration is missing required fields');
}

console.log('🔥 Firebase configuration loaded for project:', firebaseConfig.projectId);

// --- GLOBAL VARIABLES (Provided by Canvas Environment) ---
const appId = firebaseConfig?.appId || 'defaultAppId';
const initialAuthToken = null; // No initial auth token for now

// --- Firebase Initialization (Global instances for easy access) ---
let firebaseApp;
let auth;
let db;



// Landing Page Component (Onboarding Tutorial/Walkthrough)
const LandingPage = ({ setAuthMode }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans animate-fade-in">
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-gray-200 text-center animate-slide-up">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ECC</span> <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">App</span>
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Your AI-powered tool for creating tailored educational content. Simplify complex topics and generate text effortlessly.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => setAuthMode('login')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Login
        </button>
        <button
          onClick={() => setAuthMode('signup')}
          className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2 transition duration-200"
        >
          Sign Up
        </button>
      </div>
    </div>
  </div>
);


// Internal App component that uses SettingsProvider
const AppContent = () => {
  // --- Authentication & User State (User Authentication, User Profile Management) ---
  const [user, setUser] = useState(null); // Firebase User object
  const [isAuthReady, setIsAuthReady] = useState(false); // Indicates if Firebase Auth is initialized
  const [authMode, setAuthMode] = useState('auth'); // 'auth' or 'app'
  const [currentPage, setCurrentPage] = useState('generation');
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const [currentSettingsPage, setCurrentSettingsPage] = useState(null); // settings page state
  
// Voice control state
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [voiceFeedbackType, setVoiceFeedbackType] = useState('success');
  
// --- Access SettingsContext ---
  const { preferences } = useSettings();
  // Suppress unused variable warning
  console.log('Settings preferences loaded:', preferences);

  // --- Content Generation Form Data Reducer ---
  const formDataReducer = (state, action) => {
    switch (action.type) {
      case 'SET_BOOK_CONTENT':
        return { ...state, bookContent: action.payload };
      case 'SET_AUDIENCE_CLASS':
        return { ...state, audienceClass: action.payload };
      case 'SET_AUDIENCE_AGE':
        return { ...state, audienceAge: action.payload };
      case 'SET_AUDIENCE_REGION':
        return { ...state, audienceRegion: action.payload };
      case 'SET_OUTPUT_WORD_COUNT':
        return { ...state, outputWordCount: action.payload };
      case 'SET_CUSTOM_INSTRUCTIONS':
        return { ...state, customInstructions: action.payload };
      case 'SET_SELECTED_SUBJECT':
        return { ...state, selectedSubject: action.payload };
      case 'SET_SELECTED_PERSONA':
        return { ...state, selectedPersona: action.payload };
      case 'RESET_FORM':
        return {
          bookContent: '',
          audienceClass: '',
          audienceAge: '',
          audienceRegion: '',
          outputWordCount: '',
          customInstructions: '',
          selectedSubject: '',
          selectedPersona: 'educator'
        };
      case 'LOAD_FROM_HISTORY':
        return {
          ...state,
          bookContent: action.payload.bookContent || '',
          audienceClass: action.payload.audienceClass || '',
          audienceAge: action.payload.audienceAge || '',
          audienceRegion: action.payload.audienceRegion || '',
          outputWordCount: action.payload.outputWordCount || '',
          customInstructions: action.payload.customInstructions || '',
          selectedSubject: action.payload.selectedSubject || '',
          selectedPersona: action.payload.selectedPersona || 'educator'
        };
      case 'UPDATE_FROM_SETTINGS':
        return {
          ...state,
          selectedPersona: action.payload.selectedPersona || state.selectedPersona,
          outputWordCount: action.payload.defaultOutputLength || state.outputWordCount,
          customInstructions: action.payload.defaultInstructions || state.customInstructions
        };
      default:
        return state;
    }
  };

  // --- Consolidated Content Generation Form Data ---
  const [formData, dispatchFormData] = useReducer(formDataReducer, {
    bookContent: '',
    audienceClass: '',
    audienceAge: '',
    audienceRegion: '',
    outputWordCount: '',
    customInstructions: '',
    selectedSubject: '',
    selectedPersona: 'educator'
  });

  // --- Legacy state getters for backward compatibility ---
  const bookContent = formData.bookContent;
  const audienceClass = formData.audienceClass;
  const audienceAge = formData.audienceAge;
  const audienceRegion = formData.audienceRegion;
  const outputWordCount = formData.outputWordCount;
  const customInstructions = formData.customInstructions;
  const selectedSubject = formData.selectedSubject;
  const selectedPersona = formData.selectedPersona;

  // --- Legacy state setters for backward compatibility ---
  const setBookContent = useCallback((value) => dispatchFormData({ type: 'SET_BOOK_CONTENT', payload: value }), []);
  const setAudienceClass = useCallback((value) => dispatchFormData({ type: 'SET_AUDIENCE_CLASS', payload: value }), []);
  const setAudienceAge = useCallback((value) => dispatchFormData({ type: 'SET_AUDIENCE_AGE', payload: value }), []);
  const setAudienceRegion = useCallback((value) => dispatchFormData({ type: 'SET_AUDIENCE_REGION', payload: value }), []);
  const setOutputWordCount = useCallback((value) => dispatchFormData({ type: 'SET_OUTPUT_WORD_COUNT', payload: value }), []);
  const setCustomInstructions = useCallback((value) => dispatchFormData({ type: 'SET_CUSTOM_INSTRUCTIONS', payload: value }), []);
  const setSelectedSubject = useCallback((value) => dispatchFormData({ type: 'SET_SELECTED_SUBJECT', payload: value }), []);
  const setSelectedPersona = useCallback((value) => dispatchFormData({ type: 'SET_SELECTED_PERSONA', payload: value }), []);

  // --- Other State Variables ---
  const [controlTier, setControlTier] = useState('basic'); // 'basic', 'advanced', 'pro' (for future)

// --- PRO Tier Management ---
const isProUser = controlTier === 'pro';

// --- User Settings Management ---
const [userSettings, setUserSettings] = useState({
  selectedPersona: 'educator',
  defaultOutputLength: '',
  defaultInstructions: '',
  modelSettings: {
    temperature: 0.7,
    maxTokens: 1000
  }
});


  // --- Output & Loading Status (Error Handling & User Feedback) ---
  const [generatedContent, setGeneratedContent] = useState('');
  const [modalError, setModalError] = useState(''); // For error modal
  const [modalMessage, setModalMessage] = useState(''); // For success modal

// --- Content History (Content Saving & History, Search & Filtering) ---
const [contentHistory, setContentHistory] = useState([]);
const [feedbackText, setFeedbackText] = useState('');
const [_searchTerm, _setSearchTerm] = useState('');

// --- Content Naming & Renaming ---
const [currentContentId, setCurrentContentId] = useState(null);
const [currentContentName, setCurrentContentName] = useState('');

// --- Quiz State ---
const [quizzes, setQuizzes] = useState([]);
const [quizAnswers, setQuizAnswers] = useState({});
const [_quizFeedback, setQuizFeedback] = useState({});
const [_isLoading, setIsLoading] = useState(false);
const [_isRenaming, setIsRenaming] = useState(false);

// --- Voice Control Integration ---
const {
  isListening: isVoiceListening,
  transcript,
  error: voiceError,
  isSupported: isVoiceSupported,
  startListening,
  stopListening
} = useVoiceControl();

// --- Notification Manager Hook ---
const {
  notifications,
  // showAchievement, // Unused - commented out
  removeNotification,
  updateContext
  // showError,     // Unused - commented out
  // showSuccess,   // Unused - commented out
  // showInfo       // Unused - commented out
} = useNotificationManager({
  maxNotifications: 5,
  enableKeyboardNavigation: true,
  enableSounds: false,
  defaultContext: NOTIFICATION_CONTEXTS.GLOBAL
});


// --- Notification Center State ---
const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

// --- Onboarding ---
useEffect(() => {
  if (user?.uid) {
    progressiveOnboardingService.initialize(user.uid, { name: user.displayName || 'User' });
  }
}, [user]);


// --- Rate Limit Notification State ---
const [showRateLimitNotification, setShowRateLimitNotification] = useState(false);

// --- Rate Limit Notification Handlers ---
const handleShowRateLimitNotification = useCallback(() => {
  setShowRateLimitNotification(true);
}, []);

const handleHideRateLimitNotification = useCallback(() => {
  setShowRateLimitNotification(false);
}, []);

const handleUpgradeClick = useCallback(() => {
  setCurrentPage('purchase');
  setShowRateLimitNotification(false);
}, []);

// --- Callback Handlers (Must be declared before any early returns) ---


// --- Firebase Auth Init ---
useEffect(() => {
  if (!firebaseApp) {
    console.log("Firebase Config received by App:", firebaseConfig);
    // Use getApps() to check if Firebase is already initialized
    const apps = getApps();
    firebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }

  // Only proceed with authentication if there's an initial token
  if (initialAuthToken) {
    const signInUser = async () => {
      try {
        await signInWithCustomToken(auth, initialAuthToken);
      } catch (err) {
        console.error("Firebase initial sign-in error:", err);
        setModalError(`Authentication error: ${err.message}`);
      } finally {
        setIsAuthReady(true);
      }
    };
    signInUser();
  } else {
    setIsAuthReady(true);
  }

  const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      // Check if this is a new user and initialize welcome trial
      const initializeNewUser = async () => {
        try {
          // Check if user tier is already set
          const tierMetadata = userTierManager.getTierMetadata();
          
          // If no tier metadata exists, this is a new user
          if (!tierMetadata.setAt) {
            // Initialize new user with PRO welcome trial
            const success = userTierManager.initializeNewUser();
            if (success) {
              const trialStatus = userTierManager.getTrialStatus();
              setModalMessage(`🎉 Welcome to ECC! You have ${trialStatus.daysRemaining} days of PRO access to explore all features!`);
            }
          } else {
            // Existing user - check if trial has expired
            const expiredStatus = userTierManager.checkTrialExpiration();
            if (expiredStatus.trialExpired) {
              setModalMessage(expiredStatus.message);
            } else {
              setModalMessage(`🎉 Welcome back, ${currentUser.email || currentUser.displayName || 'User'}!`);
            }
          }
        } catch (error) {
          console.error('Error initializing user:', error);
          setModalMessage(`🎉 Welcome, ${currentUser.email || currentUser.displayName || 'User'}!`);
        }
      };
      
      initializeNewUser();
      setAuthMode('app');
    } else {
      // User ID display removed for cleanup
      setAuthMode('auth');
    }
  });

  return () => unsubscribeAuth();
}, []);

// --- Fetch Once (on Login) ---
useEffect(() => {
  const fetchContentHistory = async () => {
    if (!db || !user || authMode !== 'app') return;

    try {
      const q = query(
        collection(db, `artifacts/${appId}/users/${user?.uid}/generatedContent`),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContentHistory(list);
    } catch (err) {
      console.error('🔥 Failed to fetch content history:', err);
    }
  };

  fetchContentHistory();
}, [user?.uid, authMode, user]);

// --- Real-time Firestore Listener with Enhanced Error Handling ---
useEffect(() => {
  if (!db || !user?.uid || !isAuthReady || authMode !== 'app') return;

  let unsubscribe = null;
  let isComponentMounted = true;

  const setupListener = async () => {
    try {
      const path = `artifacts/${appId}/users/${user.uid}/generatedContent`;
      const q = query(collection(db, path));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isComponentMounted) return;
        
        try {
          const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          history.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
          setContentHistory(history);
        } catch (processingError) {
          console.error("📛 Error processing snapshot:", processingError);
        }
      }, (err) => {
        if (!isComponentMounted) return;
        
        console.error("📛 Firestore listener error:", err);
        // Don't show error for permission issues during cleanup
        if (err.code !== 'permission-denied') {
          setModalError(`Failed to load history: ${err.message}`);
        }
      });
    } catch (error) {
      console.error("📛 Error setting up listener:", error);
    }
  };

  setupListener();

  return () => {
    isComponentMounted = false;
    if (unsubscribe) {
      try {
        unsubscribe();
      } catch (error) {
        console.warn("Warning: Error during listener cleanup:", error);
      }
    }
  };
}, [user?.uid, isAuthReady, authMode]);

// --- User Settings Firestore Listener ---
useEffect(() => {
  if (!db || !user?.uid || !isAuthReady || authMode !== 'app') return;

  const userRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
  const unsubscribe = onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const settings = docSnap.data();
      setUserSettings(prevSettings => ({ ...prevSettings, ...settings }));
      // Update form data using the reducer
      dispatchFormData({
        type: 'UPDATE_FROM_SETTINGS',
        payload: settings
      });
    }
  }, (err) => {
    console.error("📛 User settings listener error:", err);
  });

  return () => unsubscribe();
}, [user, isAuthReady, authMode]);

// Enhanced navigation handler to reset settings state
const handlePageNavigation = useCallback((page) => {
  const previousPage = currentPage;
  console.log(`🎯 handlePageNavigation called: ${previousPage} -> ${page}`);
  
  setCurrentPage(page);
  setCurrentSettingsPage(null); // Reset settings page when navigating to main pages

  // Update notification context based on current page
  const contextMap = {
    'generation': NOTIFICATION_CONTEXTS.CONTENT_GENERATION,
    'history': NOTIFICATION_CONTEXTS.GLOBAL,
    'purchase': NOTIFICATION_CONTEXTS.GLOBAL
  };
  
  updateContext(contextMap[page] || NOTIFICATION_CONTEXTS.GLOBAL);

  // Last navigated page tracking removed for cleanup
  console.log(`Navigating from ${previousPage} to ${page}`);
}, [currentPage, updateContext]);

// --- Voice Command Handler ---
const handleVoiceCommand = useCallback((command) => {
  if (!command || !command.trim()) return;

  const normalizedCommand = command.toLowerCase().trim();
  console.log('Processing voice command:', normalizedCommand);

  // Navigation commands
  if (normalizedCommand.includes('content generation') || 
      normalizedCommand.includes('generate content') ||
      normalizedCommand.includes('generation page')) {
    setCurrentPage('generation');
    setCurrentSettingsPage(null);
    setVoiceFeedback('Navigating to Content Generation');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('content history') || 
      normalizedCommand.includes('view history') ||
      normalizedCommand.includes('history page')) {
    setCurrentPage('history');
    setCurrentSettingsPage(null);
    setVoiceFeedback('Navigating to Content History');
    setVoiceFeedbackType('success');
    return;
  }


  // Settings navigation
  if (normalizedCommand.includes('my profile') || 
      normalizedCommand.includes('profile settings')) {
    setCurrentSettingsPage('profile');
    setVoiceFeedback('Opening Profile Settings');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('advanced settings')) {
    setCurrentSettingsPage('advanced');
    setVoiceFeedback('Opening Advanced Settings');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('preferences')) {
    setCurrentSettingsPage('preferences');
    setVoiceFeedback('Opening Preferences');
    setVoiceFeedbackType('success');
    return;
  }

  // Subject selection commands
  if (normalizedCommand.includes('select mathematics') || normalizedCommand.includes('choose mathematics')) {
    setSelectedSubject('Mathematics');
    setVoiceFeedback('Mathematics subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('select science') || normalizedCommand.includes('choose science')) {
    setSelectedSubject('Science');
    setVoiceFeedback('Science subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('select physics') || normalizedCommand.includes('choose physics')) {
    setSelectedSubject('Physics');
    setVoiceFeedback('Physics subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('select chemistry') || normalizedCommand.includes('choose chemistry')) {
    setSelectedSubject('Chemistry');
    setVoiceFeedback('Chemistry subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('select history') || normalizedCommand.includes('choose history')) {
    setSelectedSubject('History');
    setVoiceFeedback('History subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('select literature') || normalizedCommand.includes('choose literature')) {
    setSelectedSubject('Literature');
    setVoiceFeedback('Literature subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  if (normalizedCommand.includes('select finance') || normalizedCommand.includes('choose finance') || 
      normalizedCommand.includes('select accounting') || normalizedCommand.includes('choose accounting')) {
    setSelectedSubject('Accounting & Finance');
    setVoiceFeedback('Accounting & Finance subject selected');
    setVoiceFeedbackType('success');
    return;
  }

  // Scrolling commands - scroll the main page interface
  if (normalizedCommand.includes('scroll down')) {
    window.scrollBy({ top: 300, behavior: 'smooth' });
    setVoiceFeedback('Scrolling page down');
    setVoiceFeedbackType('info');
    return;
  }

  if (normalizedCommand.includes('scroll up')) {
    window.scrollBy({ top: -300, behavior: 'smooth' });
    setVoiceFeedback('Scrolling page up');
    setVoiceFeedbackType('info');
    return;
  }

  // Unknown command
  setVoiceFeedback(`Command not recognized: "${command}"`);
  setVoiceFeedbackType('error');
  }, [handlePageNavigation, setSelectedSubject]);

// --- Voice Command Processing ---
useEffect(() => {
  if (transcript) {
    handleVoiceCommand(transcript);
  }
}, [handleVoiceCommand, transcript]); // Properly formatted

// --- Save Segment Navigation Listener ---
useEffect(() => {
  const handleNavigateToContentGeneration = (event) => {
    const { bookContent, subject } = event.detail;
    setCurrentPage('generation');
    setCurrentSettingsPage(null);
    // Set the content generation data
    setBookContent(bookContent);
    setSelectedSubject(subject || '');
    setVoiceFeedback('Navigating to Content Generation with saved content');
    setVoiceFeedbackType('success');
  };
  
  window.addEventListener('navigateToContentGeneration', handleNavigateToContentGeneration);
  return () => window.removeEventListener('navigateToContentGeneration', handleNavigateToContentGeneration);
  }, [setBookContent, setSelectedSubject]);

// --- Voice Toggle Handler ---
const handleVoiceToggle = useCallback(() => {
  if (isVoiceListening) {
    stopListening();
  } else {
    startListening();
  }
}, [isVoiceListening, startListening, stopListening]);

// --- Clear Voice Feedback ---
useEffect(() => {
  if (voiceFeedback) {
    const timer = setTimeout(() => {
      setVoiceFeedback('');
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [voiceFeedback]);

// --- Handle Email Auth (removed unused function) ---
// This function was not being used anywhere in the app

// --- Google Auth (removed unused function) ---
// This function was not being used anywhere in the app

  const handleLogout = async () => {
    setModalError('');
    setModalMessage('');
    try {
      await signOut(auth);
      setGeneratedContent(''); // Clear content on logout
      setContentHistory([]); // Clear history on logout
      setBookContent('');
      setAudienceClass('');
      setAudienceAge('');
      setAudienceRegion('');
      setOutputWordCount('');
      setCustomInstructions('');
      setControlTier('basic');
      setCurrentContentId(null); // Clear current content ID
      setCurrentContentName(''); // Clear current content name
      setQuizzes([]); // Clear quizzes
      setQuizAnswers({}); // Clear quiz answers
      setQuizFeedback({}); // Clear quiz feedback
      setModalMessage('👋 Logged out successfully.');
      setAuthMode('auth'); // Go back to auth page
    } catch (err) {
      console.error("Logout error:", err);
      setModalError(`Logout failed: ${err.message}`);
    }
  };

  /**
   * Unified and enhanced callGeminiAPI function for all LLM interactions.
   * Handles content generation with comprehensive payload support.
   * @param {Object|Array} data - The payload for the LLM.
   * @returns {Promise<string>} - The text response from the LLM.
   */
  const callGeminiAPI = useCallback(async (data, abortSignal) => {
    const apiUrl = '/.netlify/functions/generate-content';

    if (!data) {
      throw new Error('Invalid argument: data is required for this function.');
    }

      // Enhanced payload processing with comprehensive support
    let payload;
    if (Array.isArray(data)) {
      // Legacy format - backward compatibility
      payload = data.length > 0 ? { contents: data } : null;
    } else if (typeof data === 'object') {
      // New unified payload format - handles all request types
      payload = {
        ...data,
        // Ensure all required fields are present for content generation
        requestType: data.requestType || 'generateContent',
        // Add session info for better context
        sessionId: user?.uid || 'anonymous',
        timestamp: new Date().toISOString(),
        // Include currentSubject and aiPersona if available
        currentSubject: data.currentSubject || null,
        aiPersona: data.aiPersona || null
      };
    } else {
      throw new Error('Invalid data format. Expected object or array.');
    }

    if (!payload) {
      throw new Error('Failed to process payload data.');
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-Source': 'ECC-App' // Add request source identifier
        },
        body: JSON.stringify(payload),
        signal: abortSignal // Add AbortController support
      });

      // Check if request was cancelled
      if (abortSignal && abortSignal.aborted) {
        throw new Error('Request was cancelled');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to parse error response',
          details: response.statusText
        }));
        
        // Check for rate limit errors in the response
        const errorMessage = errorData.error || '';
        const errorDetails = errorData.details || '';
        const statusCode = response.status;
        
        // Enhanced rate limit detection
        const isRateLimit = statusCode === 429 || 
                           errorMessage.toLowerCase().includes('rate limit') ||
                           errorMessage.toLowerCase().includes('too many requests') ||
                           errorMessage.toLowerCase().includes('quota') ||
                           errorDetails.toLowerCase().includes('rate limit') ||
                           errorDetails.toLowerCase().includes('too many requests') ||
                           errorDetails.toLowerCase().includes('quota');
        
        if (isRateLimit) {
          handleShowRateLimitNotification();
          throw new Error('Rate limit exceeded: Please wait a moment before trying again.');
        }
        
        throw new Error(`API error from Netlify Function: ${response.status} - ${errorData.details || errorData.error || errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();

      // Check again if request was cancelled after response
      if (abortSignal && abortSignal.aborted) {
        throw new Error('Request was cancelled');
      }

      // The Netlify Function returns { generatedContent: text }
      if (result.generatedContent) {
        return result.generatedContent;
      } else {
        throw new Error('Failed to get content from API. Unexpected response structure.');
      }
    } catch (fetchError) {
      console.error("Error in callGeminiAPI:", fetchError);
      
      // Handle abort/cancellation
      if (fetchError.name === 'AbortError' || fetchError.message.includes('cancelled')) {
        throw new Error('Request was cancelled');
      }
      
      // Enhanced error handling with user-friendly messages
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the AI service. Please check your internet connection.');
      } else if (fetchError.message.includes('400')) {
        throw new Error('Invalid request: Please check your input and try again.');
      } else if (fetchError.message.includes('401')) {
        throw new Error('Authentication error: Please try logging out and logging in again.');
      } else if (fetchError.message.includes('429') || fetchError.message.includes('Rate limit exceeded')) {
        // Show rate limit notification instead of generic error
        handleShowRateLimitNotification();
        throw new Error('Rate limit exceeded: Please wait a moment before trying again.');
      } else if (fetchError.message.includes('500')) {
        throw new Error('Server error: The AI service is temporarily unavailable. Please try again later.');
      }
      
      throw fetchError;
    }
  }, [user, handleShowRateLimitNotification]);

  /**
   * Enhanced parseTextQuizzes function with better error handling and format support.
   * Parses text-based quiz questions and answers from the generated content.
   * Supports both legacy and new quiz formats from Phase 3.
   * @param {string} text The raw text output from the LLM.
   * @returns {Array<Object>} An array of quiz question objects.
   */
  const parseTextQuizzes = useCallback((text) => {
    const parsedQuizzes = [];
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text provided to parseTextQuizzes');
      return parsedQuizzes;
    }

    const quizBlockRegex = /---QUIZ_START---\s*([\s\S]*?)\s*---QUIZ_END---/g;
    let match;

    while ((match = quizBlockRegex.exec(text)) !== null) {
      const quizContent = match[1];
      if (!quizContent) continue;

      // Enhanced question parsing with better error handling
      const questionBlocks = quizContent.split(/\n\s*\n/).filter(block => {
        const trimmed = block.trim();
        return trimmed.startsWith('Q') || trimmed.match(/^\d+\.|Question\s*\d+/);
      });

      questionBlocks.forEach((block, index) => {
        try {
          // Support multiple question formats
          const questionMatch = block.match(/(?:Q\d+:|Question\s*\d+:|\d+\.)\s*(.*?)(?=\n[A-D]\)|$)/s);
          const optionsMatch = block.match(/A\)\s*(.*)\s*\nB\)\s*(.*)\s*\nC\)\s*(.*)\s*\nD\)\s*(.*)/s);
          const correctMatch = block.match(/Correct:\s*([A-D])/);
          const explanationMatch = block.match(/Explanation:\s*(.*)$/s);

          if (questionMatch && optionsMatch && correctMatch) {
            const quizItem = {
              id: `quiz-${Date.now()}-${index + 1}`, // More unique ID
              question: questionMatch[1].trim(),
              options: {
                A: optionsMatch[1].trim(),
                B: optionsMatch[2].trim(),
                C: optionsMatch[3].trim(),
                D: optionsMatch[4].trim(),
              },
              correctAnswer: correctMatch[1].trim(),
              explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.',
              difficulty: 'medium', // Default difficulty
              category: 'general' // Default category
            };

            // Validate quiz item
            if (quizItem.question.length > 0 && 
                Object.values(quizItem.options).every(opt => opt.length > 0) &&
                ['A', 'B', 'C', 'D'].includes(quizItem.correctAnswer)) {
              parsedQuizzes.push(quizItem);
            }
          }
        } catch (error) {
          console.warn(`Error parsing quiz question ${index + 1}:`, error);
        }
      });
    }

    console.log(`Parsed ${parsedQuizzes.length} quiz questions from content`);
    return parsedQuizzes;
  }, []);

  /**
   * Handles the content generation process using a multi-step prompting architecture.
   * This asynchronous function orchestrates multiple LLM calls to refine the output.
   * (Content Generation/Creation, Automatic Naming, Feature 8 - Quiz Generation)
   */
  const _handleGenerateContent = async () => {
    setGeneratedContent('');
    setModalError('');
    setModalMessage('');
    setCurrentContentId(null); // Reset current content ID
    setCurrentContentName(''); // Reset current content name
    setQuizzes([]); // Clear previous quizzes
    setQuizAnswers({}); // Clear previous answers
    setQuizFeedback({}); // Clear previous feedback

    if (!user) {
      setModalError('Please log in or sign up to generate content.');
      return;
    }

    // Feature 20: Input Validation
    if (!bookContent || !audienceClass || !audienceAge || !audienceRegion) {
      setModalError('Please fill in all core fields (Book Content, Class, Age, Region) to generate content.');
      return;
    }

    const payload = {
      bookContent,
      audienceClass,
      audienceAge,
      audienceRegion,
      outputWordCount,
      customInstructions,
      selectedSubject,
      selectedPersona,
      requestType: 'generateContent'
    };

    setIsLoading(true);
    try {
      const generatedContentResponse = await callGeminiAPI(payload);

      setGeneratedContent(generatedContentResponse);
      // Save to Firestore (Content Saving & History)
      const userContentCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/generatedContent`);
      const newDocRef = await addDoc(userContentCollectionRef, {
        name: `Content - ${new Date().toLocaleString()}`,
        ...payload,
        generatedContent: generatedContentResponse,
        quizzes: parseTextQuizzes(generatedContentResponse),
        timestamp: serverTimestamp(),
      });

      setCurrentContentId(newDocRef.id);
      setCurrentContentName(`Content - ${new Date().toLocaleString()}`);
      setModalMessage('🎆 Content generated and saved successfully!');

    } catch (err) {
      console.error('Error generating content:', err);
      setModalError(`Failed to generate content: ${err.message}. Please ensure you are logged in and have sufficient usage limits.`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles loading a selected history item back into the main input fields and output display.
   * (Content Saving & History, Content Editing/Modification)
   */
const _handleLoadHistoryItem = useCallback((item) => {
  // Load form data using the reducer
  dispatchFormData({
    type: 'LOAD_FROM_HISTORY',
    payload: item
  });
  setGeneratedContent(item.generatedContent || ''); // Load into editable area
  setControlTier(item.controlTier || 'basic');
  setCurrentContentId(item.id); // Set the ID of the loaded document
  setCurrentContentName(item.name || `Content - ${new Date(item.timestamp?.toDate()).toLocaleString()}`); // Set the name
  setQuizzes(item.quizzes || []); // Load quizzes
  setQuizAnswers({}); // Clear quiz answers when loading new content
  setQuizFeedback({}); // Clear quiz feedback
  setIsRenaming(false); // Hide renaming input when loading
  setModalMessage('📁 Content loaded from history!');
  }, []);

  /**
   * Handles renaming the currently displayed content.
   * (Renaming Capability)
   */
  const _handleRenameContent = async () => {
    if (!currentContentId || !currentContentName.trim()) {
      setModalError('No content selected or name is empty.');
      return;
    }
    if (!user) {
      setModalError('Please log in to rename content.');
      return;
    }

    setIsLoading(true);
    try {
      const contentDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/generatedContent`, currentContentId);
      await updateDoc(contentDocRef, {
        name: currentContentName.trim(),
      });
  setIsRenaming(false); // Hide input after saving
      setModalMessage('✏️ Content renamed successfully!');
    } catch (err) {
      console.error('Error renaming content:', err);
      setModalError('Failed to rename content: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Handles copying the generated content to the clipboard.
   * (Data Export/Import, Content Sharing)
   */
  const _handleCopyToClipboard = () => {
    if (generatedContent) {
      // Using document.execCommand('copy') as navigator.clipboard.writeText() may not work due to iFrame restrictions.
      const textarea = document.createElement('textarea');
      textarea.value = generatedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setModalMessage('📋 Content copied to clipboard!');
    } else {
      setModalError('No content to copy.');
    }
  };

  /**
   * Handles submitting user feedback to Firestore.
   * (Feedback Mechanism)
   */
  const _handleSubmitFeedback = async () => {
  if (!feedbackText.trim()) {
    setModalError('Feedback cannot be empty.');
    return;
  }
  if (!user) {
    setModalError('Please log in to submit feedback.');
    return;
  }

  setIsLoading(true);
  setModalMessage('');
  setModalError('');

  try {
    const response = await fetch('/.netlify/functions/send-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user?.email || 'noreply@eccapp.com',
        message: feedbackText,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setModalMessage('📨 Feedback submitted successfully!');
      setFeedbackText('');
    } else {
      throw new Error(result.error || 'Something went wrong!');
    }
  } catch (error) {
    console.error("Feedback Error:", error);
    setModalError(`Failed to submit feedback: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  // Handles user input for text-based quiz answers
  const _handleQuizAnswerChange = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Checks the text-based quiz answers
  const _checkTextQuizAnswers = () => {
    const feedback = {};
    quizzes.forEach(q => {
      const userAnswer = (quizAnswers[q.id] || '').trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      feedback[q.id] = userAnswer === correctAnswer;
    });
    setQuizFeedback(feedback);
    setModalMessage('🧠 Quiz answers checked! See feedback below.');
  };


// Filtered content history for search functionality (Search & Filtering)
const _filteredContentHistory = useMemo(() => {
  if (!_searchTerm || _searchTerm.trim() === '') {
    return contentHistory;
  }
  return contentHistory.filter(item =>
    (item.name && item.name.toLowerCase().includes(_searchTerm.toLowerCase())) ||
    (item.generatedContent && item.generatedContent.toLowerCase().includes(_searchTerm.toLowerCase())) ||
    (item.bookContent && item.bookContent.toLowerCase().includes(_searchTerm.toLowerCase())) ||
    (item.audienceClass && item.audienceClass.toLowerCase().includes(_searchTerm.toLowerCase())) ||
    (item.audienceAge && item.audienceAge.toLowerCase().includes(_searchTerm.toLowerCase())) ||
    (item.audienceRegion && item.audienceRegion.toLowerCase().includes(_searchTerm.toLowerCase()))
  );
}, [contentHistory, _searchTerm]);


  // Enhanced onError handler for better user experience
  const _onError = useCallback((error, type = 'error', options = {}) => {
    console.error('Application error:', error);
    
    // Enhanced error handling with different message types
    if (type === 'confirmation') {
      // Handle confirmation prompts (replacing native alert)
      const confirmationProps = {
        message: error,
        type: 'confirmation',
        onConfirm: options.onConfirm || (() => {}),
        onCancel: options.onCancel || (() => {}),
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmButtonClass: options.confirmButtonClass || 'bg-blue-600 hover:bg-blue-700'
      };
      
      // For now, use modal error with confirmation data
      // In a real implementation, you'd want a separate confirmation modal
      setModalError(`${error} (${confirmationProps.confirmText}/${confirmationProps.cancelText})`);
      
      // Execute confirmation action if provided
      if (options.onConfirm) {
        setTimeout(() => {
          const shouldProceed = window.confirm(error);
          if (shouldProceed) {
            options.onConfirm();
          } else if (options.onCancel) {
            options.onCancel();
          }
        }, 100);
      }
    } else {
      // Handle regular error messages
      if (typeof error === 'string') {
        setModalError(error);
      } else if (error?.message) {
        setModalError(error.message);
      } else {
        setModalError('An unexpected error occurred. Please try again.');
      }
    }
  }, []);

  // Handler for settings navigation
  const handleNavigateToSettings = useCallback((settingsPage) => {
    setCurrentSettingsPage(settingsPage);
  }, []);

// Handler for content generation success
const handleContentGenerationSuccess = useCallback(async (generatedContent, formData = {}) => {
setGeneratedContent(generatedContent);

    // Only update form data if it's provided
    if (formData && typeof formData === 'object') {
      if (formData.bookContent) setBookContent(formData.bookContent);
      if (formData.audienceClass) setAudienceClass(formData.audienceClass);
      if (formData.audienceAge) setAudienceAge(formData.audienceAge);
      if (formData.audienceRegion) setAudienceRegion(formData.audienceRegion);
      if (formData.outputWordCount) setOutputWordCount(formData.outputWordCount);
      if (formData.customInstructions) setCustomInstructions(formData.customInstructions);
      if (formData.subject) setSelectedSubject(formData.subject);
    }

    // Save to Firestore content history
    if (user && db && generatedContent) {
      try {
        const userContentCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/generatedContent`);

        // Parse quiz content if it exists
        const quizzes = parseTextQuizzes(generatedContent);

        // Generate a meaningful name based on content type and subject
        let contentName = 'Generated Content';
        if (formData.subject) {
          contentName = `${formData.subject} Content`;
        }
        if (formData.contentType === 'quiz') {
          contentName = `${formData.subject || 'General'} Quiz`;
        }
        contentName += ` - ${new Date().toLocaleDateString()}`;

        const contentData = {
          name: contentName,
          generatedContent: generatedContent,
          bookContent: formData.bookContent || '',
          audienceClass: formData.audienceClass || '',
          audienceAge: formData.audienceAge || '',
          audienceRegion: formData.audienceRegion || '',
          outputWordCount: formData.outputWordCount || '',
          customInstructions: formData.customInstructions || '',
          selectedSubject: formData.subject || '',
          selectedPersona: formData.selectedPersona || selectedPersona,
          contentType: formData.contentType || 'content',
          quizzes: quizzes,
          timestamp: serverTimestamp(),
          wordCount: generatedContent.split(' ').length,
          characterCount: generatedContent.length
        };

        await addDoc(userContentCollectionRef, contentData);
        console.log('📝 Content saved to history successfully');

        setModalMessage('🎆 Content generated and saved to history!');
      } catch (error) {
        console.error('Error saving content to history:', error);
        setModalError('Content generated but failed to save to history: ' + error.message);
      }
    } else {
      setModalMessage('Content generated successfully!');
    }
  }, [user, selectedPersona, parseTextQuizzes, setAudienceAge, setAudienceClass, setAudienceRegion, setBookContent, setCustomInstructions, setOutputWordCount, setSelectedSubject]);

  // Handler for settings navigation
  const updateUserSettings = useCallback(async (settingsToUpdate) => {
    if (!user || !db) return;
    try {
      const userRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
      await updateDoc(userRef, { ...userSettings, ...settingsToUpdate });
      setModalMessage('Settings updated successfully!');
      
      // Update local state immediately
      if (settingsToUpdate.selectedPersona) {
        setSelectedPersona(settingsToUpdate.selectedPersona);
      }
      if (settingsToUpdate.defaultOutputLength) {
        setOutputWordCount(settingsToUpdate.defaultOutputLength);
      }
      if (settingsToUpdate.defaultInstructions) {
        setCustomInstructions(settingsToUpdate.defaultInstructions);
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
      setModalError('Failed to update settings: ' + error.message);
    }
  }, [user, userSettings, setSelectedPersona, setOutputWordCount, setCustomInstructions]);

  // --- State for selected content navigation ---
  const [selectedContentId, setSelectedContentId] = useState(null);


  // Memoized toast notifications to prevent unnecessary re-renders
  const memoizedToastNotifications = useMemo(() => {
    return notifications.map(notification => (
      <ToastNotification
        key={notification.id}
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        title={notification.title}
        onClose={() => removeNotification(notification.id)}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        position={notification.position?.position || 'default'}
        persistent={notification.persistent}
      />
    ));
  }, [notifications, removeNotification]);


  // --- Conditional Rendering for Auth vs. Main App ---
  if (!isAuthReady) {
    return <AppInitializationSpinner />;
  }

  if (authMode === 'auth') {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setUser(user);
          setModalMessage(`Welcome, ${user.email || user.displayName || 'User'}!`);
          setAuthMode('app');
        }}
        onError={(error) => {
          setModalError(error);
        }}
      />
    );
  }

  // Loading fallback component for Suspense
  const LoadingFallback = ({ componentName = 'Component' }) => (
    <PageLoadingSpinner componentName={componentName} />
  );

  // Render current page content with Suspense
  const renderCurrentPage = () => {
    if (currentSettingsPage === 'profile') {
      return (
        <Suspense fallback={<LoadingFallback componentName="Profile Settings" />}>
          <MyProfilePage 
            user={user} 
            onBack={() => setCurrentSettingsPage(null)}
            onSuccess={setModalMessage}
            onError={setModalError}
          />
        </Suspense>
      );
    }
    if (currentSettingsPage === 'advanced') {
      return (
        <Suspense fallback={<LoadingFallback componentName="Advanced Settings" />}>
          <AdvancedSettingsPage 
            user={user} 
            onBack={() => setCurrentSettingsPage(null)}
            userSettings={userSettings}
            onUpdateSettings={updateUserSettings}
            isProUser={isProUser}
          />
        </Suspense>
      );
    }
    if (currentSettingsPage === 'preferences') {
      return (
        <Suspense fallback={<LoadingFallback componentName="Preferences" />}>
          <PreferencesPage user={user} onBack={() => setCurrentSettingsPage(null)} />
        </Suspense>
      );
    }
    

    if (currentPage === 'generation') {
      return (
        <Suspense fallback={<LoadingFallback componentName="Content Generator" />}>
        <ContentGenerationPage
            user={user}
            onSuccess={handleContentGenerationSuccess}
            onError={(error) => setModalError(error)}
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            bookContent={bookContent}
            setBookContent={setBookContent}
            selectedPersona={selectedPersona}
            callGeminiAPI={callGeminiAPI}
            isProUser={isProUser}
          />
        </Suspense>
      );
    }

    if (currentPage === 'history') {
      return (
        <ContentHistoryPage
          db={db}
          user={user}
          onError={() => setModalError('Failed to load history. Please try again later.')}
          onSuccess={(message) => setModalMessage(message)}
          contentHistory={contentHistory}
          selectedContentId={selectedContentId}
          onContentSelectionHandled={() => setSelectedContentId(null)}
        />
      );
    }

    if (currentPage === 'purchase') {
      return (
        <Suspense fallback={<LoadingFallback componentName="Purchase PRO" />}>
          <PurchasePage
            onBack={() => setCurrentPage('generation')}
          />
        </Suspense>
      );
    }
    
    return null;
  };

  // --- Main Application UI (Logged In State) ---
  return (
    <AuthProvider>
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
        {/* Header */}
        <Header
          currentPage={currentPage}
          setCurrentPage={handlePageNavigation}
          currentSettingsPage={currentSettingsPage}
          theme={theme}
          setTheme={setTheme}
          user={user}
          onLogout={handleLogout}
          onNavigateToSettings={handleNavigateToSettings}
          isVoiceListening={isVoiceListening}
          onVoiceToggle={handleVoiceToggle}
          isVoiceSupported={isVoiceSupported}
          voiceError={voiceError}
          unreadNotifications={notifications.filter(n => !n.read).length}
          onNotificationCenterToggle={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
        />
        
        {/* Enhanced Notification System with In-Situ Notifications - Now Enabled */}
        <InlineNotification
          message="Complete your profile to unlock new features!"
          targetSelector=".profile-completion-target"
          position="right"
          duration={10000}
          actions={[{ label: 'Complete Now', handler: () => { setModalMessage('Navigating to profile...'); handleNavigateToSettings('profile'); }, primary: true }]}
          showArrow
        />

        {/* Notification Center */}
        {isNotificationCenterOpen && (
          <NotificationCenter
            isOpen={isNotificationCenterOpen}
            onClose={() => setIsNotificationCenterOpen(false)}
            notifications={notifications}
            onMarkAsRead={(id) => console.log(`Marked ${id} as read`)}
            onDeleteNotification={(id) => console.log(`Deleted notification ${id}`)}
            preferences={{ soundEnabled: false, autoDismiss: true, maxNotifications: 5 }}
            onUpdatePreferences={(prefs) => console.log('Updated preferences:', prefs)}
          />
        )}
        {/* Optimized Toast Notifications - Memoized to prevent unnecessary re-renders */}
        {memoizedToastNotifications}
        
        {/* Legacy Toast Notifications (Temporary - for backward compatibility) - Optimized */}
        {modalError && (
          <ToastNotification 
            message={modalError} 
            type="error" 
            onClose={() => setModalError('')} 
            position={'default'}
          />
        )}
        {modalMessage && (
          <ToastNotification 
            message={modalMessage} 
            type="success" 
            onClose={() => setModalMessage('')} 
            position={'default'}
          />
        )}
        
        {/* Voice Command Feedback */}
        <VoiceFeedback message={voiceFeedback} type={voiceFeedbackType} />
        
        
        
        {/* Main Content */}
        <main className="flex-1 w-full overflow-hidden pt-16">
          {/* Rate Limit Notification */}
          {showRateLimitNotification && (
            <RateLimitNotification
              onClose={handleHideRateLimitNotification}
              onUpgrade={handleUpgradeClick}
            />
          )}

          {/* Welcome Trial Banner - only shown on content generation interface */}
          {currentPage === 'generation' && !currentSettingsPage && (
            <div className="px-4 pt-4 pb-2">
              <WelcomeTrialBanner 
                onUpgradeClick={() => setCurrentPage('purchase')}
              />
            </div>
          )}
          {renderCurrentPage()}
        </main>
        {/* Feedback Form at Bottom */}
        {currentPage === 'generation' && !currentSettingsPage && (
          <div className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <FeedbackForm 
              user={user}
              onSuccess={setModalMessage}
              onError={setModalError}
            />
          </div>
        )}
      </div>
    </AuthProvider>
  );
};

// Main App component wrapper
const App = () => {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App;
