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
  updateDoc,
  getDocs
} from 'firebase/firestore';

import { Routes, Route } from 'react-router-dom';
import PublicViewer from './PublicViewer'; // Assuming PublicViewer is a separate component
import Layout from './components/Layout'; // Import the new Layout component
import ModernHeader from './components/ModernHeader';
import ModernContentGenerator from './components/ModernContentGenerator';
import ModernContentHistory from './components/ModernContentHistory';

// Chakra UI Components
import {
  Box,
  Button,
  Input,
  InputGroup,
  Textarea,
  Flex,
  Stack,
  Heading,
  Text,
  Spinner,
  Link,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spacer,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Icon
} from '@chakra-ui/react';
import {
  RadioGroup,
  Radio
} from '@chakra-ui/radio';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LogOut, Copy, Share2, FileText, Search, Edit, Send, HelpCircle, Loader2, User, Mail, CheckCircle, XCircle
} from 'lucide-react';

// Ensure html2pdf is loaded in the public/index.html or similar entry point
// For Canvas environment, external scripts are typically loaded globally.
// If not, you might need to add a script tag for html2pdf in your public/index.html
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

// Firebase configuration for local development fallback
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
let appId;
if (typeof __app_id !== 'undefined') {
  appId = __app_id;
} else if (firebaseConfig?.appId) {
  appId = firebaseConfig.appId;
} else {
  console.error("❌ App ID is missing. Please check Firebase config or __app_id.");
  // Fallback to a default if __app_id is not available and no appId in config
  appId = 'default-app-id';
}

const initialAuthToken =
  typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Firebase Initialization (Global instances for easy access) ---
let firebaseApp;
let auth;
let db;

const GoogleIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.355-7.439-7.45C4.801 6.845 8.146 3.5 12.24 3.5c2.115 0 3.863.755 5.201 2.075l2.83-2.83C17.711 2.062 15.207 1 12.24 1 7.043 1 2.5 5.48 2.5 10.935c0 5.453 4.543 9.935 9.74 9.935 5.568 0 9.248-3.906 9.248-9.795 0-.668-.07-1.303-.18-1.915H12.24z"
      fill="currentColor"
    />
  </Icon>
);

// Landing Page Component (Onboarding Tutorial/Walkthrough)
const LandingPage = ({ setAuthMode }) => (
  <Flex
    minH="100vh"
    bgGradient="linear(to-br, gray.900, gray.800)"
    align="center"
    justify="center"
    p={4}
    fontFamily="Inter, sans-serif"
  >
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ width: '100%', maxWidth: 'md' }}
    >
      <Card bg="gray.800" color="white" shadow="2xl" borderRadius="2xl" p={6} border="1px" borderColor="gray.700">
        <CardHeader textAlign="center" pb={6}>
          <Heading as="h1" size="2xl" fontWeight="extrabold" color="blue.400">
            ECC App
          </Heading>
          <Text mt={2} color="gray.300">
            Your AI-powered tool for creating tailored educational content. Simplify complex topics and generate text effortlessly.
          </Text>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <Button
              onClick={() => setAuthMode('login')}
              colorScheme="blue"
              size="lg"
              py={3}
              rounded="lg"
              shadow="md"
              _hover={{ transform: 'scale(1.02)' }}
            >
              Login
            </Button>
            <Button
              onClick={() => setAuthMode('signup')}
              variant="ghost"
              color="blue.400"
              _hover={{ color: 'blue.200' }}
              size="lg"
              py={2}
            >
              Sign Up
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </motion.div>
  </Flex>
);


// Notification Component
const Notification = ({ message, status, onClose }) => {
  const statusColors = {
    success: 'green.500',
    error: 'red.500',
    info: 'blue.500',
    warning: 'yellow.500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <Box
        bg={statusColors[status] || 'gray.500'}
        color="white"
        p={4}
        rounded="lg"
        shadow="lg"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text>{message}</Text>
        <Button size="sm" onClick={onClose} ml={4}>
          Close
        </Button>
      </Box>
    </motion.div>
  );
};

// Main App component for the educational content generator
const App = () => {
  const [notifications, setNotifications] = useState([]);

  const toast = useCallback((config) => {
    const id = Date.now();
    const message = config.title + (config.description ? `: ${config.description}` : '');
    setNotifications(prev => [...prev, { id, message, status: config.status }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, config.duration || 3000);
  }, []);

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
        }
      } catch (err) {
        console.error("Firebase initial sign-in error:", err);
        // Only show error if it's not a common auth error
        if (err.code !== 'auth/invalid-custom-token' && err.code !== 'auth/custom-token-mismatch') {
          toast({
            title: "Authentication Error",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setIsAuthReady(true);
      }
    };

    signInUser();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? 'User logged in' : 'User logged out');
      setUser(currentUser);
      
      if (currentUser) {
        setUserIdDisplay(currentUser.uid);
        // Only show welcome message if user just logged in (not on app load)
        if (authMode !== 'app') {
          toast({
            title: "Welcome!",
            description: `Logged in as: ${currentUser.email || currentUser.displayName || 'Guest User'}`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
        setAuthMode('app');
      } else {
        setUserIdDisplay('Not Logged In');
        // Only redirect to landing if user was previously logged in
        if (authMode === 'app') {
          setAuthMode('landing');
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);


  // --- Real-time Firestore Listener ---
  useEffect(() => {
    if (!db || !user?.uid || !isAuthReady || authMode !== 'app') return;

    const path = `artifacts/${appId}/users/${user.uid}/generatedContent`;
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side to avoid Firestore index issues
      history.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
      setContentHistory(history);
    }, (err) => {
      console.error("📛 Firestore listener error:", err);
      toast({
        title: "Firestore Error",
        description: `Failed to load history: ${err.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    });

    return () => unsubscribe();
  }, [db, user, isAuthReady, authMode, toast]);

  // --- Handle Email Auth ---
  const handleAuth = async (isSignUp) => {
    setIsLoading(true);

    if (isSignUp && password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password should be at least 6 characters.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
        toast({
          title: "Account created!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Logged in successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      setAuthMode('app');
    } catch (err) {
      console.error("Auth error:", err);
      let msg = `Authentication failed: ${err.message}`;
      if (err.code === 'auth/operation-not-allowed') {
        msg += " (Enable Email/Password auth in Firebase)";
      }
      toast({
        title: "Authentication Error",
        description: msg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Call this when user clicks Export
  const handleExportToPDF = (contentToExport, fileName = "ECC-Export") => {
    if (typeof html2pdf === 'undefined') {
      toast({
        title: "PDF Export Error",
        description: "PDF export library not loaded. Please ensure html2pdf.js is correctly linked.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("html2pdf.js is not loaded.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: sans-serif;
              color: black;
              background-color: white;
            }
          </style>
        </head>
        <body>
          ${contentToExport.replace(/\n/g, '<br />')}
        </body>
      </html>
    `;

    html2pdf().from(htmlContent).set({
      margin: 1,
      filename: `${fileName}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }).save();
  };


  // --- Google Auth ---
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters to avoid popup blocking
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        // If popup is blocked or closed, try redirect method
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          console.log('Popup blocked or closed, showing user-friendly message');
          toast({
            title: "Popup Blocked or Closed",
            description: "Please allow popups for this site and try again, or use email/password login.",
            status: "warning",
            duration: 7000,
            isClosable: true,
          });
          return;
        }
        throw popupError;
      }
      
      const user = result.user;
      const userRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
      
      // Wait a bit to ensure auth state is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });
      
      toast({
        title: "Google Sign-In successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setAuthMode('app');
    } catch (err) {
      console.error("Google Sign-In error:", err);
      
      let errorMessage = err.message;
      let errorTitle = "Google Sign-In Failed";
      
      // Handle specific error codes
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          errorTitle = "Sign-In Cancelled";
          errorMessage = "The sign-in popup was closed. Please try again.";
          break;
        case 'auth/popup-blocked':
          errorTitle = "Popup Blocked";
          errorMessage = "Please allow popups for this site and try again.";
          break;
        case 'auth/cancelled-popup-request':
          errorTitle = "Sign-In Cancelled";
          errorMessage = "Another sign-in popup was opened. Please try again.";
          break;
        case 'auth/network-request-failed':
          errorTitle = "Network Error";
          errorMessage = "Please check your internet connection and try again.";
          break;
        case 'auth/too-many-requests':
          errorTitle = "Too Many Attempts";
          errorMessage = "Too many failed sign-in attempts. Please try again later.";
          break;
        case 'auth/operation-not-allowed':
          errorTitle = "Google Sign-In Disabled";
          errorMessage = "Google sign-in is not enabled. Please use email/password login.";
          break;
        default:
          break;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
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
      toast({
        title: "Logged out successfully.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setAuthMode('landing'); // Go back to landing page
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Logout Failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
    setCurrentContentId(null); // Reset current content ID
    setCurrentContentName(''); // Reset current content name
    setQuizzes([]); // Clear previous quizzes
    setQuizAnswers({}); // Clear previous answers
    setQuizFeedback({}); // Clear previous feedback

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to generate content.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Feature 20: Input Validation
    if (!bookContent || !audienceClass || !audienceAge || !audienceRegion) {
      toast({
        title: "Missing Information",
        description: "Please fill in all core fields (Book Content, Class, Age, Region) to generate content.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Content generated and saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      console.error('Error generating content:', err);
      toast({
        title: "Content Generation Failed",
        description: `${err.message}. Please ensure you are logged in and have sufficient usage limits.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
    setCurrentContentName(item.name || `Content - ${item.timestamp ? new Date(item.timestamp?.toDate()).toLocaleString() : 'N/A'}`); // Set the name
    setQuizzes(item.quizzes || []); // Load quizzes
    setQuizAnswers({}); // Clear quiz answers when loading new content
    setQuizFeedback({}); // Clear quiz feedback
    setIsRenaming(false); // Hide renaming input when loading
    toast({
      title: "Content loaded from history!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Handles renaming the currently displayed content.
   * (Renaming Capability)
   */
  const handleRenameContent = async () => {
    if (!currentContentId || !currentContentName.trim()) {
      toast({
        title: "Rename Error",
        description: "No content selected or name is empty.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rename content.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const contentDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/generatedContent`, currentContentId);
      await updateDoc(contentDocRef, {
        name: currentContentName.trim(),
      });
      setIsRenaming(false); // Hide input after saving
      toast({
        title: "Content renamed successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error renaming content:', err);
      toast({
        title: "Rename Failed",
        description: 'Failed to rename content: ' + err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: "Content copied to clipboard!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "No content to copy.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 🔗 Share current content by saving to Firestore publicContent/{id}
  const handleSharePublicLink = async () => {
    if (!generatedContent || !currentContentId || !user) {
      toast({
        title: "Share Failed",
        description: "Generate and save content before sharing.",
        status: "warning",
      });
      return;
    }

    // Additional auth validation
    if (!user.uid || !auth.currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you're logged in before sharing.",
        status: "warning",
      });
      return;
    }

    try {
      console.log("User object before sharing:", user);
      console.log("Auth current user:", auth.currentUser);
      
      // Wait for auth state to be ready
      await new Promise(resolve => {
        if (auth.currentUser) {
          resolve();
        } else {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              unsubscribe();
              resolve();
            }
          });
        }
      });
      
      const publicDocRef = doc(db, `artifacts/${appId}/public/data/sharedContent`, currentContentId);
      await setDoc(publicDocRef, {
        uid: user.uid,
        name: currentContentName || 'Shared Educational Content',
        generatedContent,
        timestamp: new Date()
      });

      const publicURL = `${window.location.origin}/view/${currentContentId}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(publicURL).then(() => {
          toast({ title: "Public share link copied to clipboard!", status: "success" });
        }, (err) => {
          console.error('Failed to copy public link with navigator: ', err);
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = publicURL;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          toast({ title: "Public share link copied to clipboard!", status: "success" });
        });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = publicURL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast({ title: "Public share link copied to clipboard!", status: "success" });
      }
    } catch (err) {
      console.error('Error creating public share link:', err);
      toast({
        title: "Share Failed",
        description: 'Failed to create shareable link.',
        status: "error",
      });
    }
  };

  /**
   * Handles submitting user feedback to Firestore.
   * (Feedback Mechanism)
   */
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback Empty",
        description: "Feedback cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

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
        toast({
          title: "Feedback submitted successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setFeedbackText('');
      } else {
        throw new Error(result.error || 'Something went wrong!');
      }
    } catch (error) {
      console.error("Feedback Error:", error);
      toast({
        title: "Feedback Submission Failed",
        description: `Failed to submit feedback: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
    toast({
      title: "Quiz answers checked!",
      description: "See feedback below.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
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
      <Flex
        minH="100vh"
        bgGradient="linear(to-br, gray.900, gray.800)"
        align="center"
        justify="center"
        fontFamily="Inter, sans-serif"
      >
        <Card
          w="full"
          maxW="md"
          bg="gray.800"
          color="white"
          shadow="2xl"
          borderRadius="2xl"
          p={8}
          textAlign="center"
          border="1px"
          borderColor="gray.700"
        >
          <CardHeader>
            <Heading as="h2" size="xl" fontWeight="extrabold" color="blue.400" mb={4}>
              Loading App...
            </Heading>
            <Text color="gray.300" mb={6}>
              Please wait while we prepare your experience.
            </Text>
          </CardHeader>
          <CardBody>
            <Spinner size="xl" color="blue.500" />
          </CardBody>
        </Card>
      </Flex>
    );
  }

  if (authMode === 'landing') {
    return <LandingPage setAuthMode={setAuthMode} />;
  }

  // Feature 15: Protected Routes (Auth screen)
  if (authMode === 'login' || authMode === 'signup') {
    return (
      <Flex
        minH="100vh"
        bgGradient="linear(to-br, gray.900, gray.800)"
        align="center"
        justify="center"
        p={4}
        fontFamily="Inter, sans-serif"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 'md' }}
        >
          <Card bg="gray.800" color="white" shadow="2xl" borderRadius="2xl" p={6} border="1px" borderColor="gray.700">
            <CardHeader textAlign="center" pb={6}>
              <Heading as="h2" size="xl" fontWeight="extrabold" color="blue.400">
                {authMode === 'login' ? 'Login to ECC App' : 'Sign Up for ECC App'}
              </Heading>
              <Text mt={2} color="gray.300">
                {authMode === 'login' ? 'Log in to continue or sign up for a new account.' : 'Create your account to get started.'}
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel htmlFor="email" color="gray.200">Email:</FormLabel>
                  <Input
                    type="email"
                    id="email"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    focusBorderColor="blue.500"
                    placeholder="your@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    rounded="md"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password" color="gray.200">Password:</FormLabel>
                  <Input
                    type="password"
                    id="password"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    focusBorderColor="blue.500"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    rounded="md"
                  />
                </FormControl>
                <Button
                  onClick={() => handleAuth(authMode === 'signup')}
                  disabled={isLoading}
                  colorScheme="blue"
                  size="lg"
                  py={3}
                  rounded="lg"
                  shadow="md"
                  _hover={{ transform: 'scale(1.02)' }}
                >
                  {isLoading ? (
                    <Spinner size="sm" mr={2} />
                  ) : (
                    authMode === 'login' ? 'Login' : 'Sign Up'
                  )}
                </Button>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  colorScheme="red"
                  size="lg"
                  py={3}
                  rounded="lg"
                  shadow="md"
                  _hover={{ transform: 'scale(1.02)' }}
                  leftIcon={<GoogleIcon />}
                >
                  Sign In with Google
                </Button>
                <Button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  variant="link"
                  color="blue.400"
                  _hover={{ color: 'blue.200' }}
                  size="lg"
                  py={2}
                >
                  {authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </Button>
                <Button
                  onClick={() => setAuthMode('landing')}
                  variant="link"
                  color="gray.400"
                  _hover={{ color: 'gray.200' }}
                  size="lg"
                  py={2}
                >
                  Back to Welcome
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </motion.div>
      </Flex>
    );
  }

  // --- Main Application UI (Logged In State) ---
  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)">
      {/* Modern Header */}
      <ModernHeader
        user={user}
        onLogout={handleLogout}
        contentHistory={contentHistory}
        isGenerating={isLoading}
        generationProgress={isLoading ? 45 : 0} // You can make this dynamic
      />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map(note => (
          <Notification
            key={note.id}
            message={note.message}
            status={note.status}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== note.id))}
          />
        ))}
      </AnimatePresence>

      {/* Routes for public viewing */}
      <Routes>
        <Route path="/" element={
          <Box maxW="8xl" mx="auto" p={6}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
              <GridItem>
                <ModernContentGenerator
                  bookContent={bookContent}
                  setBookContent={setBookContent}
                  audienceClass={audienceClass}
                  setAudienceClass={setAudienceClass}
                  audienceAge={audienceAge}
                  setAudienceAge={setAudienceAge}
                  audienceRegion={audienceRegion}
                  setAudienceRegion={setAudienceRegion}
                  outputWordCount={outputWordCount}
                  setOutputWordCount={setOutputWordCount}
                  customInstructions={customInstructions}
                  setCustomInstructions={setCustomInstructions}
                  controlTier={controlTier}
                  setControlTier={setControlTier}
                  onGenerate={handleGenerateContent}
                  isLoading={isLoading}
                  user={user}
                />
              </GridItem>
              <GridItem>
                <ModernContentHistory
                  contentHistory={contentHistory}
                  onLoadHistoryItem={handleLoadHistoryItem}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isLoading={false}
                />
              </GridItem>
            </Grid>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ marginTop: '2rem' }}
              >
                <Card bg="white" shadow="xl" rounded="2xl" p={6} border="1px solid" borderColor="gray.200">
                  <CardHeader display="flex" justifyContent="space-between" alignItems="center" p={0} mb={4}>
                    <Heading as="h3" size="md" color="gray.800" display="flex" alignItems="center">
                      <FileText size={20} style={{ marginRight: '0.5rem', color: 'var(--chakra-colors-blue-500)' }} />
                      {isRenaming ? (
                        <InputGroup>
                          <Input
                            type="text"
                            value={currentContentName}
                            onChange={(e) => setCurrentContentName(e.target.value)}
                            onBlur={handleRenameContent}
                            onKeyPress={(e) => { if (e.key === 'Enter') handleRenameContent(); }}
                            p={1}
                            bg="white"
                            borderColor="gray.300"
                            color="gray.800"
                            focusBorderColor="blue.500"
                            autoFocus
                            rounded="md"
                          />
                        </InputGroup>
                      ) : (
                        <Text>{currentContentName || 'Generated Educational Content'}</Text>
                      )}
                    </Heading>
                    {currentContentId && (
                      <Button
                        onClick={() => setIsRenaming(!isRenaming)}
                        ml={4}
                        variant="outline"
                        size="sm"
                        colorScheme="blue"
                      >
                        <Edit size={16} style={{ marginRight: '0.5rem' }} />
                        {isRenaming ? 'Save' : 'Rename'}
                      </Button>
                    )}
                  </CardHeader>
                  <CardBody p={0}>
                    <Textarea
                      bg="gray.50"
                      borderColor="gray.300"
                      color="gray.800"
                      _placeholder={{ color: 'gray.400' }}
                      focusBorderColor="blue.500"
                      h="256px"
                      resize="vertical"
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      rows={10}
                      rounded="lg"
                    />
                    <Flex flexWrap="wrap" justifyContent="flex-end" gap={2} mt={4}>
                      <Button
                        onClick={() => handleExportToPDF(generatedContent, currentContentName || "ECC-Export")}
                        colorScheme="green"
                        size="sm"
                        rounded="lg"
                      >
                        <FileText size={16} style={{ marginRight: '0.5rem' }} />
                        Export as PDF
                      </Button>
                      <Button
                        onClick={handleCopyToClipboard}
                        colorScheme="blue"
                        size="sm"
                        rounded="lg"
                      >
                        <Copy size={16} style={{ marginRight: '0.5rem' }} />
                        Copy to Clipboard
                      </Button>
                      <Button
                        onClick={handleSharePublicLink}
                        colorScheme="purple"
                        size="sm"
                        rounded="lg"
                      >
                        <Share2 size={16} style={{ marginRight: '0.5rem' }} />
                        Share Public Link
                      </Button>
                    </Flex>
                  </CardBody>
                </Card>
              </motion.div>
            )}
            {controlTier === 'pro' && quizzes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ marginTop: '2rem' }}
              >
                <Card bg="orange.50" borderColor="orange.200" shadow="lg" p={6} borderRadius="xl">
                  <CardHeader p={0} mb={4}>
                    <Heading as="h3" size="md" color="orange.800">Interactive Quiz (Pro Feature):</Heading>
                  </CardHeader>
                  <CardBody p={0}>
                    <Stack spacing={6}>
                      {quizzes.map((q, qIndex) => (
                        <Box key={q.id} p={4} bg="white" rounded="lg" shadow="sm" border="1px" borderColor="orange.200">
                          <Text fontWeight="semibold" color="gray.800" mb={3}>Question {qIndex + 1}: {q.question}</Text>
                          <InputGroup>
                            <Input
                              type="text"
                              bg="gray.50"
                              borderColor="gray.300"
                              color="gray.800"
                              _placeholder={{ color: 'gray.400' }}
                              focusBorderColor="orange.500"
                              placeholder="Your answer"
                              value={quizAnswers[q.id] || ''}
                              onChange={(e) => handleQuizAnswerChange(q.id, e.target.value)}
                              rounded="lg"
                            />
                          </InputGroup>
                          {quizFeedback[q.id] !== undefined && (
                            <Flex mt={3} fontWeight="semibold" alignItems="center" color={quizFeedback[q.id] ? 'green.500' : 'red.500'}>
                              {quizFeedback[q.id] ? <CheckCircle size={16} style={{ marginRight: '0.5rem' }} /> : <XCircle size={16} style={{ marginRight: '0.5rem' }} />}
                              {quizFeedback[q.id] ? 'Correct!' : `Incorrect. Correct answer: ${q.correctAnswer}`}
                            </Flex>
                          )}
                        </Box>
                      ))}
                      <Button
                        onClick={checkTextQuizAnswers}
                        colorScheme="orange"
                        size="lg"
                        rounded="lg"
                      >
                        Check Answers
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ marginTop: '2rem' }}
            >
              <Card bg="white" shadow="lg" p={6} borderRadius="xl" border="1px solid" borderColor="gray.200">
                <CardHeader p={0} mb={4}>
                  <Heading as="h3" size="md" color="gray.800">Give Us Feedback:</Heading>
                </CardHeader>
                <CardBody p={0}>
                  <Textarea
                    bg="gray.50"
                    borderColor="gray.300"
                    color="gray.800"
                    _placeholder={{ color: 'gray.400' }}
                    focusBorderColor="blue.500"
                    h="112px"
                    resize="vertical"
                    placeholder="Share your thoughts, suggestions, or report any issues here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rounded="lg"
                  />
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isLoading || !user || !feedbackText.trim()}
                    mt={4}
                    colorScheme="blue"
                    w="full"
                    size="lg"
                    rounded="lg"
                  >
                    {isLoading ? (
                      <Spinner size="sm" mr={2} />
                    ) : (
                      <>
                        <Send size={16} style={{ marginRight: '0.5rem' }} />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ marginTop: '2rem' }}
            >
              <Card bg="white" shadow="lg" p={6} borderRadius="xl" border="1px solid" borderColor="gray.200">
                <CardHeader p={0} mb={4} textAlign="center">
                  <Heading as="h3" size="md" color="gray.800" display="flex" alignItems="center" justifyContent="center">
                    <HelpCircle size={20} style={{ marginRight: '0.5rem' }} />
                    Need Help?
                  </Heading>
                </CardHeader>
                <CardBody p={0} textAlign="center">
                  <Text color="gray.600" mb={4}>
                    For support, please contact us at{' '}
                    <Link href="mailto:azkabloch786@gmail.com" color="blue.500" _hover={{ textDecoration: 'underline' }} display="inline-flex" alignItems="center">
                      <Mail size={16} style={{ marginRight: '0.5rem' }} /> azkabloch786@gmail.com
                    </Link>
                    .
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    (This is a placeholder for a future comprehensive help center or FAQ.)
                  </Text>
                </CardBody>
              </Card>
            </motion.div>
          </Box>
        } />
        <Route path="/view/:id" element={<PublicViewer />} />
      </Routes>
    </Box>
  );
};

export default App;
