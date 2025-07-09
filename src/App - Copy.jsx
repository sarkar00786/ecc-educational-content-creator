import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

import { orderBy } from 'firebase/firestore';
import { Routes, Route } from 'react-router-dom';
import PublicViewer from './PublicViewer';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

function App() {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg">
      Tailwind is working!
    </div>
  );
}

// Firebase configuration for local development fallback
// This will be used if __firebase_config is not provided by the Canvas environment.
const localFirebaseConfig = {
  apiKey: "AIzaSyC0Mx48gIXYN81RT3S_Dixr2w2nsqleEzU",
  authDomain: "ecc-app-ab284.firebaseapp.com",
  projectId: "ecc-app-ab284",
  storageBucket: "ecc-app-ab284.firebaseapp.com",
  messagingSenderId: "182753260281",
  appId: "1:182753260281:web:03449c99b6b6530416e828",
  measurementId: "G-PW5ZCJKP9K"
};

// Determine which firebaseConfig to use: Canvas-provided or local fallback
const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : localFirebaseConfig;

// --- GLOBAL VARIABLES (Provided by Canvas Environment) ---
// These variables are automatically available in the Canvas runtime.
// DO NOT modify these lines.
let appId;

if (typeof __app_id !== 'undefined') {
  appId = __app_id;
} else if (firebaseConfig?.appId) {
  appId = firebaseConfig.appId;
} else {
  throw new Error("❌ App ID is missing. Please check Firebase config or __app_id.");
}

// FIX: Correctly initialize initialAuthToken without calling useState globally
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Firebase Initialization (Global instances for easy access) ---
let firebaseApp;
let auth;
let db;

// Modal Component for messages (Error Handling & User Feedback)
const Modal = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
  const borderColor = type === 'error' ? 'border-red-400' : 'border-green-400';
  const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';
  const title = type === 'error' ? 'Error!' : 'Success!';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-modal-in">
      <div
        className={`relative ${bgColor} ${borderColor} ${textColor} px-6 py-5 rounded-xl shadow-lg max-w-md w-full border transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in`}
      >
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};


// Landing Page Component (Onboarding Tutorial/Walkthrough)
const LandingPage = ({ setAuthMode }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans animate-fade-in">
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-gray-200 text-center animate-slide-up">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
        <span className="text-blue-600">ECC</span> App
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


// Main App component for the educational content generator
const App = () => {
  // --- Authentication & User State (User Authentication, User Profile Management) ---
  const [user, setUser] = useState(null); // Firebase User object
  const [isAuthReady, setIsAuthReady] = useState(false); // Indicates if Firebase Auth is initialized
  const [authMode, setAuthMode] = useState('landing'); // 'landing', 'login', or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userIdDisplay, setUserIdDisplay] = useState(''); // To display user ID for multi-user apps

  // --- App-specific State Variables (Content Generation/Creation) ---
  const [bookContent, setBookContent] = useState('');
  const [audienceClass, setAudienceClass] = useState('');
  const [audienceAge, setAudienceAge] = useState('');
  const [audienceRegion, setAudienceRegion] = useState('');

  // --- New Feature State Variables (Content Editing/Modification, Tiered Feature Access) ---
  const [outputWordCount, setOutputWordCount] = useState(''); // For specific word length control
  const [customInstructions, setCustomInstructions] = useState(''); // For multi-step instructions
  const [controlTier, setControlTier] = useState('basic'); // 'basic', 'advanced', 'pro' (for future)

  // --- Output & Loading Status (Error Handling & User Feedback) ---
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalError, setModalError] = useState(''); // For error modal
  const [modalMessage, setModalMessage] = useState(''); // For success modal

  // --- Content History (Content Saving & History, Search & Filtering) ---
const [contentHistory, setContentHistory] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [feedbackText, setFeedbackText] = useState('');

// --- Content Naming & Renaming ---
const [currentContentId, setCurrentContentId] = useState(null);
const [currentContentName, setCurrentContentName] = useState('');
const [isRenaming, setIsRenaming] = useState(false);

// --- Quiz State ---
const [quizzes, setQuizzes] = useState([]);
const [quizAnswers, setQuizAnswers] = useState({});
const [quizFeedback, setQuizFeedback] = useState({});

// --- Firebase Auth Init ---
useEffect(() => {
  if (!firebaseApp) {
    console.log("Firebase Config received by App:", firebaseConfig);
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }

  const signInUser = async () => {
    try {
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.error("Firebase initial sign-in error:", err);
      setModalError(`Authentication error: ${err.message}`);
    } finally {
      setIsAuthReady(true);
    }
  };

  signInUser();

  const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      setUserIdDisplay(currentUser.uid);
      setModalMessage(`Welcome, ${currentUser.email || 'Guest User'}!`);
      setAuthMode('app');
    } else {
      setUserIdDisplay('Not Logged In');
      setAuthMode('landing');
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
        collection(db, `artifacts/${appId}/users/${user.uid}/generatedContent`),
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
}, [db, user, authMode]);

// --- Real-time Firestore Listener ---
useEffect(() => {
  if (!db || !user?.uid || !isAuthReady || authMode !== 'app') return;

  const path = `artifacts/${appId}/users/${user.uid}/generatedContent`;
  const q = query(collection(db, path));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    history.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
    setContentHistory(history);
  }, (err) => {
    console.error("📛 Firestore listener error:", err);
    setModalError(`Failed to load history: ${err.message}`);
  });

  return () => unsubscribe();
}, [db, user, isAuthReady, authMode]);

// --- Handle Email Auth ---
const handleAuth = async (isSignUp) => {
  setModalError('');
  setModalMessage('');
  setIsLoading(true);

  if (isSignUp && password.length < 6) {
    setModalError('Password should be at least 6 characters.');
    setIsLoading(false);
    return;
  }

  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}`);
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      }, { merge: true });
      setModalMessage('Account created!');
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      setModalMessage('Logged in successfully!');
    }
    setAuthMode('app');
  } catch (err) {
    console.error("Auth error:", err);
    let msg = `Authentication failed: ${err.message}`;
    if (err.code === 'auth/operation-not-allowed') {
      msg += " (Enable Email/Password auth in Firebase)";
    }
    setModalError(msg);
  } finally {
    setIsLoading(false);
  }
};

// Call this when user clicks Export
const handleExportToPDF = (contentToExport, fileName = "ECC-Export") => {
  const element = document.createElement('div');
  element.innerHTML = contentToExport;
  html2pdf().from(element).set({
    margin: 1,
    filename: `${fileName}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }).save();
};


// --- Google Auth ---
const handleGoogleSignIn = async () => {
  setModalError('');
  setModalMessage('');
  setIsLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    const userRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}`);
    await setDoc(userRef, {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL,
      createdAt: serverTimestamp(),
    }, { merge: true });
    setModalMessage('Google Sign-In successful!');
    setAuthMode('app');
  } catch (err) {
    console.error("Google Sign-In error:", err);
    setModalError(`Google Sign-In failed: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};

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
      setModalMessage('Logged out successfully.');
      setAuthMode('landing'); // Go back to landing page
    } catch (err) {
      console.error("Logout error:", err);
      setModalError(`Logout failed: ${err.message}`);
    }
  };

  /**
   * Helper function to make a SECURE API call to the Gemini LLM via a simulated backend.
   * In a real production app, this fetch would go to YOUR serverless function,
   * which then securely calls the Gemini API using your server-side API key.
   * @param {Array} chatHistory - The conversation history/payload for the LLM.
   * @returns {Promise<string>} - The text response from the LLM.
   */
  const callGeminiAPI = async (chatHistory) => {
    // In a real production environment with server-side API key management,
    // you would typically call your own backend endpoint like this:
    const apiUrl = '/.netlify/functions/generate-content'; // THIS IS THE CORRECT ENDPOINT FOR YOUR NETLIFY FUNCTION

    const payload = { contents: chatHistory }; // Corrected: payload key should be 'contents' for the Netlify Function as per generate-content.js

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Feature 20: Enhanced error message from Netlify Function
        throw new Error(`API error from Netlify Function: ${response.status} - ${errorData.details || errorData.error || errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();

      // The Netlify Function returns { generatedContent: text }
      if (result.generatedContent) {
        return result.generatedContent;
      } else {
        throw new Error('Failed to get content from API. Unexpected response structure.');
      }
    } catch (fetchError) {
      console.error("Error in callGeminiAPI:", fetchError);
      throw fetchError; // Re-throw to be caught by handleGenerateContent
    }
  };

  /**
   * Parses text-based quiz questions and answers from the generated content.
   * Expected format for quiz:
   * ---QUIZ_START---
   * Question 1: What is the capital of France?
   * Answer: Paris
   *
   * Question 2: Who wrote "Romeo and Juliet"?
   * Answer: William Shakespeare
   * ---QUIZ_END---
   * @param {string} text The raw text output from the LLM.
   * @returns {Array<Object>} An array of quiz question objects.
   */
  const parseTextQuizzes = (text) => {
    const parsedQuizzes = [];
    const quizBlockRegex = /---QUIZ_START---\s*([\s\S]*?)\s*---QUIZ_END---/g;
    let match;

    while ((match = quizBlockRegex.exec(text)) !== null) {
      const quizContent = match[1];
      const questionAnswerPairs = quizContent.split(/\n\s*\n/).filter(block => block.trim().startsWith('Question'));

      questionAnswerPairs.forEach((pair, index) => {
        const questionMatch = pair.match(/Question \d+:\s*(.*?)[\n\r]/);
        const answerMatch = pair.match(/Answer:\s*(.*)/);

        if (questionMatch && answerMatch) {
          parsedQuizzes.push({
            id: `quiz-${index + 1}`,
            question: questionMatch[1].trim(),
            correctAnswer: answerMatch[1].trim()
          });
        }
      });
    }
    return parsedQuizzes;
  };

  /**
   * Handles the content generation process using a multi-step prompting architecture.
   * This asynchronous function orchestrates multiple LLM calls to refine the output.
   * (Content Generation/Creation, Automatic Naming, Feature 8 - Quiz Generation)
   */
  const handleGenerateContent = async () => {
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

    setIsLoading(true);
    try {
      // --- Step 1: Core Concept Extraction and Audience-Specific Simplification ---
      let step1Prompt = `Given the following 'Book Content', identify the core concepts and simplify them for an audience at the "${audienceClass}" level, aged "${audienceAge}", and from the "${audienceRegion}" region. Focus on making the foundational ideas understandable without losing accuracy. Present these simplified core concepts clearly.`;

      // Integrate outputWordCount and customInstructions into prompts based on controlTier
      if (controlTier === 'advanced' || controlTier === 'pro') {
        if (outputWordCount) {
          step1Prompt += ` Ensure the output is approximately ${outputWordCount} words.`;
        }
        if (customInstructions) {
          step1Prompt += ` Also, follow these specific instructions: ${customInstructions}`;
        }
      }
      step1Prompt += `\n\nBook Content:\n${bookContent}\n\nSimplified Core Concepts:`;

      const simplifiedConcepts = await callGeminiAPI([{ role: "user", parts: [{ text: step1Prompt }] }]);
      console.log('Step 1 (Simplified Concepts):', simplifiedConcepts);

      // --- Step 2: Pedagogical Transformation and Content Generation + Quiz Prompt ---
      let step2Prompt = `You are an expert educator with deep pedagogical knowledge. Your task is to transform the following 'Simplified Core Concepts' into highly engaging and exceptionally effective educational material. Tailor this content specifically for the audience:
-   **Class/Grade Level:** ${audienceClass}
-   **Age Group:** ${audienceAge}
-   **Region/Cultural Context:** ${audienceRegion}

Apply the following advanced pedagogical skills:
1.  **Simplification & Accessibility:** Break down complex ideas further, using language appropriate for the specified age and class.
2.  **Relevance & Contextualization:** Connect the content directly to the audience's real-world experiences, cultural context, and prior knowledge. Use examples relevant to their region.
3.  **Engagement & Interactivity:** Use an engaging, conversational tone. Incorporate rhetorical questions, thought-provoking prompts, and suggestions for simple activities (if applicable) to encourage active learning.
4.  **Clarity & Structure:** Present information logically with clear, concise headings, bullet points, and short paragraphs. Ensure a smooth flow of ideas.
5.  **Examples & Analogies:** Provide concrete, relatable examples and analogies that resonate with the specified age group and cultural background.
6.  **Conceptual Scaffolding:** Build understanding step-by-step, ensuring prerequisites are implicitly covered or introduced.
7.  **Motivation & Curiosity:** Frame the content in a way that sparks curiosity and intrinsic motivation to learn more.

Simplified Core Concepts to Transform:\n${simplifiedConcepts}\n\nPlease generate the refined educational content now, embodying all the pedagogical skills mentioned above.`;

      // Feature 8: Quiz Generation (as a Pro feature)
      if (controlTier === 'pro') {
        step2Prompt += `\n\n---QUIZ_START---\nGenerate 5 to 10 text-based quiz questions and their answers based on the content. Each question should be followed by its correct answer. Format them clearly as "Question X: ..." and "Answer: ...".\nExample:\nQuestion 1: What is the capital of France?\nAnswer: Paris\n\nQuestion 2: Who wrote "Romeo and Juliet"?
Answer: William Shakespeare\n---QUIZ_END---`;
      }

      const finalGeneratedContentRaw = await callGeminiAPI([{ role: "user", parts: [{ text: step2Prompt }] }]);

      // Parse quizzes if in Pro tier
      let extractedQuizzes = [];
      let cleanedContent = finalGeneratedContentRaw;
      if (controlTier === 'pro') {
        extractedQuizzes = parseTextQuizzes(finalGeneratedContentRaw);
        // Remove quiz section from the main content for display
        cleanedContent = finalGeneratedContentRaw.replace(/---QUIZ_START---[\s\S]*?---QUIZ_END---/g, '').trim();
      }

      setGeneratedContent(cleanedContent);
      setQuizzes(extractedQuizzes);

      // Generate a default name for the content
      const defaultContentName = `Content - ${new Date().toLocaleString()}`;

      // Save to Firestore (Content Saving & History)
      const userContentCollectionRef = collection(db, `artifacts/${appId}/users/${user.uid}/generatedContent`);
      const newDocRef = await addDoc(userContentCollectionRef, {
        name: defaultContentName, // Add the generated name
        bookContent,
        audienceClass,
        audienceAge,
        audienceRegion,
        generatedContent: cleanedContent,
        quizzes: extractedQuizzes, // Save quizzes with content
        timestamp: serverTimestamp(),
        outputWordCount,
        customInstructions,
        controlTier,
      });
      setCurrentContentId(newDocRef.id); // Set the ID of the newly created document
      setCurrentContentName(defaultContentName); // Set the name for the current content
      setModalMessage('Content generated and saved successfully!');

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
  const handleLoadHistoryItem = useCallback((item) => {
    setBookContent(item.bookContent || '');
    setAudienceClass(item.audienceClass || '');
    setAudienceAge(item.audienceAge || '');
    setAudienceRegion(item.audienceRegion || '');
    setGeneratedContent(item.generatedContent || ''); // Load into editable area
    setOutputWordCount(item.outputWordCount || '');
    setCustomInstructions(item.customInstructions || '');
    setControlTier(item.controlTier || 'basic');
    setCurrentContentId(item.id); // Set the ID of the loaded document
    setCurrentContentName(item.name || `Content - ${new Date(item.timestamp?.toDate()).toLocaleString()}`); // Set the name
    setQuizzes(item.quizzes || []); // Load quizzes
    setQuizAnswers({}); // Clear quiz answers when loading new content
    setQuizFeedback({}); // Clear quiz feedback
    setIsRenaming(false); // Hide renaming input when loading
    setModalMessage('Content loaded from history!');
  }, []);

  /**
   * Handles renaming the currently displayed content.
   * (Renaming Capability)
   */
  const handleRenameContent = async () => {
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
      setModalMessage('Content renamed successfully!');
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
  const handleCopyToClipboard = () => {
    if (generatedContent) {
      // Using document.execCommand('copy') as navigator.clipboard.writeText() may not work due to iFrame restrictions.
      const textarea = document.createElement('textarea');
      textarea.value = generatedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setModalMessage('Content copied to clipboard!');
    } else {
      setModalError('No content to copy.');
    }
  };

// 🔗 Share current content by saving to Firestore publicContent/{id}
const handleSharePublicLink = async () => {
  if (!generatedContent || !currentContentId || !user) {
    setModalError('Generate and save content before sharing.');
    return;
  }

  try {
    const publicDocRef = doc(db, `publicContent/${currentContentId}`);
    await setDoc(publicDocRef, {
      uid: user.uid,
      name: currentContentName || 'Shared Educational Content',
      generatedContent,
      timestamp: new Date()
    });

    const publicURL = `${window.location.origin}/view/${currentContentId}`;
    await navigator.clipboard.writeText(publicURL);
    setModalMessage('✅ Public share link copied to clipboard!');
  } catch (err) {
    console.error('Error creating public share link:', err);
    setModalError('❌ Failed to create shareable link.');
  }
};

  /**
   * Handles submitting user feedback to Firestore.
   * (Feedback Mechanism)
   */
  const handleSubmitFeedback = async () => {
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
        email: user?.email || 'anonymous@eccapp.com',
        message: feedbackText,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setModalMessage('Feedback submitted successfully!');
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
  const handleQuizAnswerChange = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Checks the text-based quiz answers
  const checkTextQuizAnswers = () => {
    const feedback = {};
    quizzes.forEach(q => {
      const userAnswer = (quizAnswers[q.id] || '').trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      feedback[q.id] = userAnswer === correctAnswer;
    });
    setQuizFeedback(feedback);
    setModalMessage('Quiz answers checked! See feedback below.');
  };


  // Filtered content history for search functionality (Search & Filtering)
  const filteredContentHistory = contentHistory.filter(item =>
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by name
    (item.generatedContent && item.generatedContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.bookContent && item.bookContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.audienceClass && item.audienceClass.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.audienceAge && item.audienceAge.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.audienceRegion && item.audienceRegion.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  // --- Conditional Rendering for Auth vs. Main App ---
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center font-sans">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Loading App...</h1>
          <p className="text-gray-600">Please wait while we prepare your experience.</p>
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mt-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (authMode === 'landing') {
    return <LandingPage setAuthMode={setAuthMode} />;
  }

  // Feature 15: Protected Routes (Auth screen)
  if (authMode === 'login' || authMode === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-gray-200">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
            {authMode === 'login' ? 'Login to ECC App' : 'Sign Up for ECC App'}
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {authMode === 'login' ? 'Log in to continue or sign up for a new account.' : 'Create your account to get started.'}
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">Email:</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-2">Password:</label>
              <input
                type="password"
                id="password"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleAuth(authMode === 'signup')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {authMode === 'login' ? 'Logging In...' : 'Signing Up...'}
                </>
              ) : (
                authMode === 'login' ? 'Login' : 'Sign Up'
              )}
            </button>
            {/* Feature 14: Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="-ml-1 mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.355-7.439-7.45C4.801 6.845 8.146 3.5 12.24 3.5c2.115 0 3.863.755 5.201 2.075l2.83-2.83C17.711 2.062 15.207 1 12.24 1 7.043 1 2.5 5.48 2.5 10.935c0 5.453 4.543 9.935 9.74 9.935 5.568 0 9.248-3.906 9.248-9.795 0-.668-.07-1.303-.18-1.915H12.24z"></path>
              </svg>
              Sign In with Google
            </button>
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2 transition duration-200"
            >
              {authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
            <button
              onClick={() => setAuthMode('landing')}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 transition duration-200"
            >
              Back to Welcome
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Application UI (Logged In State) ---
  // Feature 15: Protected Routes (Main App content is only rendered if authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-sans flex flex-col lg:flex-row gap-8">
      {/* Modal for Error and Success Messages (In-App Notifications, Error Handling & User Feedback) */}
      <Modal message={modalError} type="error" onClose={() => setModalError('')} />
      <Modal message={modalMessage} type="success" onClose={() => setModalMessage('')} />

      {/* Left Panel: Main App Controls */}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 max-w-4xl w-full lg:w-2/3 border border-gray-200 flex-shrink-0 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight">
            <span className="text-blue-600">ECC</span> App
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            Logout
          </button>
        </div>

        {/* User ID Display (User Profile Management) */}
        <p className="text-sm text-gray-600 mb-4">
          Logged in as: <span className="font-semibold">{user?.email || 'Guest'}</span> (ID: {userIdDisplay})
        </p>
        {/* Basic Dashboard/Analytics */}
        <p className="text-sm text-gray-600 mb-6">
          Total content items generated: <span className="font-semibold">{contentHistory.length}</span>
        </p>


        {/* Input Section */}
        <div className="space-y-6 mb-8">
          {/* Tiered Controls (Tiered Feature Access, Subscription Management - Placeholder) */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Content Generation Mode:</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 h-5 w-5"
                  name="controlTier"
                  value="basic"
                  checked={controlTier === 'basic'}
                  onChange={(e) => {
                    setControlTier(e.target.value);
                    if (e.target.value === 'pro') {
                      setModalMessage('Pro features are currently under development and will require a subscription in the future.');
                    }
                  }}
                />
                <span className="ml-2 text-gray-700">Basic</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 h-5 w-5"
                  name="controlTier"
                  value="advanced"
                  checked={controlTier === 'advanced'}
                  onChange={(e) => {
                    setControlTier(e.target.value);
                    if (e.target.value === 'pro') {
                      setModalMessage('Pro features are currently under development and will require a subscription in the future.');
                    }
                  }}
                />
                <span className="ml-2 text-gray-700">Advanced</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 h-5 w-5"
                  name="controlTier"
                  value="pro"
                  checked={controlTier === 'pro'}
                  onChange={(e) => {
                    setControlTier(e.target.value);
                    setModalMessage('Pro features are currently under development and will require a subscription in the future.');
                  }}
                />
                <span className="ml-2 text-gray-700">Pro (Future)</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="bookContent" className="block text-lg font-semibold text-gray-700 mb-2">
              Book Content (Paste text from a book here):
            </label>
            <textarea
              id="bookContent"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 h-40 resize-y text-gray-800"
              placeholder="E.g., 'The Earth is the third planet from the Sun and the only astronomical object known to harbor life...'"
              value={bookContent}
              onChange={(e) => setBookContent(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="audienceClass" className="block text-lg font-semibold text-gray-700 mb-2">
                Audience Class/Grade:
              </label>
              <input
                type="text"
                id="audienceClass"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                placeholder="E.g., 5th Grade, University Level"
                value={audienceClass}
                onChange={(e) => setAudienceClass(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="audienceAge" className="block text-lg font-semibold text-gray-700 mb-2">
                Audience Age Group:
              </label>
              <input
                type="text"
                id="audienceAge"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                placeholder="E.g., 10-11 years old, Adults"
                value={audienceAge}
                onChange={(e) => setAudienceAge(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="audienceRegion" className="block text-lg font-semibold text-gray-700 mb-2">
                Audience Region/Culture:
              </label>
              <input
                type="text"
                id="audienceRegion"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                placeholder="E.g., India, Western Europe, Rural Africa"
                value={audienceRegion}
                onChange={(e) => setAudienceRegion(e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Controls (Conditional Display) */}
          {(controlTier === 'advanced' || controlTier === 'pro') && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <label htmlFor="outputWordCount" className="block text-lg font-semibold text-blue-800 mb-2">
                  Desired Output Word Count (Approximate):
                </label>
                <input
                  type="number"
                  id="outputWordCount"
                  className="w-full p-3 border border-blue-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                  placeholder="E.g., 200, 500"
                  value={outputWordCount}
                  onChange={(e) => setOutputWordCount(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="customInstructions" className="block text-lg font-semibold text-blue-800 mb-2">
                  Multi-Step Instructions/Custom Prompts:
                </label>
                <textarea
                  id="customInstructions"
                  className="w-full p-4 border border-blue-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 h-28 resize-y text-gray-800"
                  placeholder="E.g., 'Ensure a conversational tone. Include 3 bullet points summarizing key takeaways. Avoid technical jargon.'"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}

          {/* Pro Controls (Placeholder for future features like Dynamic Simulations, Personalized Learning Paths) */}
          {(controlTier === 'pro') && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-800">Pro Features (Future Development):</h3>
              <p className="text-gray-700">
                This tier will include advanced features like Dynamic Simulations, Personalized Learning Paths, and more sophisticated Visual/Video Generation.
                These require significant additional development and potentially paid API integrations.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerateContent}
            disabled={isLoading || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Content...
              </>
            ) : (
              'Generate Educational Content'
            )}
          </button>
        </div>

        {/* Output Section (Content Editing/Modification, Data Export/Import, Content Sharing, Renaming) */}
        {generatedContent && (
          <div className="mt-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {isRenaming ? (
                  <input
                    type="text"
                    value={currentContentName}
                    onChange={(e) => setCurrentContentName(e.target.value)}
                    onBlur={handleRenameContent} // Save on blur
                    onKeyPress={(e) => { if (e.key === 'Enter') handleRenameContent(); }} // Save on Enter
                    className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 w-full"
                    autoFocus
                  />
                ) : (
                  <span>{currentContentName || 'Generated Educational Content'}</span>
                )}
              </h2>
              {currentContentId && ( // Only show rename button if content is loaded/generated
                <button
                  onClick={() => setIsRenaming(!isRenaming)}
                  className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl transition duration-200"
                >
                  {isRenaming ? 'Save Name' : 'Rename'}
                </button>
              )}
            </div>
            <textarea
              className="w-full p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-inner max-h-96 overflow-y-auto custom-scrollbar text-gray-800 leading-relaxed resize-y"
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)} // Make it editable
              rows={10} // Adjust rows as needed
            ></textarea>
            <div className="flex justify-end mt-4">
  <button
    onClick={() => handleExportToPDF(generatedContent, currentContentName || "ECC-Export")}
    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition"
  >
    Export as PDF
  </button>
</div>
            <button
              onClick={handleCopyToClipboard}
              className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            >
              <svg className="-ml-1 mr-3 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
              Copy to Clipboard
            </button>
          </div>
        )}
            <button
  onClick={handleSharePublicLink}
  className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
>
  <svg className="-ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 7h.01M6 12h.01M18 12h.01M9 17h.01M12 12h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
  </svg>
  Share Public Link
</button>

        {/* Feature 8: Interactive Quizzes (Pro Feature, Text-based only) */}
        {controlTier === 'pro' && quizzes.length > 0 && (
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">Interactive Quiz (Pro Feature):</h2>
            {quizzes.map((q, qIndex) => (
              <div key={q.id} className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="font-semibold text-gray-800 mb-3">Question {qIndex + 1}: {q.question}</p>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
                  placeholder="Your answer"
                  value={quizAnswers[q.id] || ''}
                  onChange={(e) => handleQuizAnswerChange(q.id, e.target.value)}
                />
                {quizFeedback[q.id] !== undefined && (
                  <div className={`mt-3 font-semibold ${quizFeedback[q.id] ? 'text-green-600' : 'text-red-600'}`}>
                    {quizFeedback[q.id] ? 'Correct!' : `Incorrect. Correct answer: ${q.correctAnswer}`}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={checkTextQuizAnswers}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
            >
              Check Answers
            </button>
          </div>
        )}


        {/* Feedback Mechanism */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Give Us Feedback:</h2>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 h-28 resize-y text-gray-800"
            placeholder="Share your thoughts, suggestions, or report any issues here..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          ></textarea>
          <button
            onClick={handleSubmitFeedback}
            disabled={isLoading || !user || !feedbackText.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:-scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>

        {/* Customer Support/Help Center Placeholder */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
          <p className="text-gray-700 mb-4">
            For support, please contact us at <a href="mailto:azkabloch786@gmail.com" className="text-blue-600 hover:underline">azkabloch786@gmail.com</a>.
          </p>
          <p className="text-sm text-gray-500">
            (This is a placeholder for a future comprehensive help center or FAQ.)
          </p>
        </div>

      </div>

      {/* Right Panel: Content History */}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 max-w-4xl w-full lg:w-1/3 border border-gray-200 flex-shrink-0 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Content History</h2>
        {/* Search & Filtering (Content) */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search history..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredContentHistory.length === 0 ? (
          <p className="text-gray-600">No content generated yet or matching your search. Your saved content will appear here.</p>
        ) : (
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {filteredContentHistory.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100 transition duration-200"
                onClick={() => handleLoadHistoryItem(item)}
              >
                <p className="text-sm font-semibold text-gray-800">
                  <span className="text-blue-600">Name:</span> {item.name || `Content - ${new Date(item.timestamp?.toDate()).toLocaleString()}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Generated on: {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-800 mt-1">
                  <span className="text-blue-600">Class:</span> {item.audienceClass}, <span className="text-blue-600">Age:</span> {item.audienceAge}, <span className="text-blue-600">Region:</span> {item.audienceRegion}
                </p>
                <div className="mt-2 text-gray-700 text-sm max-h-24 overflow-hidden text-ellipsis whitespace-pre-wrap">
                  {item.generatedContent.substring(0, 150)}...
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLoadHistoryItem(item); }}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  View/Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
