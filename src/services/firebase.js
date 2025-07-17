import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Firebase configuration with validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing required Firebase configuration: ${missingFields.join(', ')}`);
  }
  
  return true;
};

// Validate configuration before initializing
validateFirebaseConfig(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Auth state management
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const validateAuthState = async () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Firestore functions
export const saveUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Save user data error:', error);
    throw error;
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Get user data error:', error);
    throw error;
  }
};

export const updateUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Update user data error:', error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Utility functions
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const isUserAuthenticated = () => {
  return !!auth.currentUser;
};

export const getAppId = () => {
  return firebaseConfig.appId || 'defaultAppId';
};

// Content History Functions
export const saveGeneratedContent = async (userId, contentData) => {
  try {
    const appId = getAppId();
    const contentRef = collection(db, `artifacts/${appId}/users/${userId}/generatedContent`);
    
    const docData = {
      ...contentData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(contentRef, docData);
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error('Save generated content error:', error);
    throw error;
  }
};

export const getContentHistory = async (userId) => {
  try {
    const appId = getAppId();
    const contentRef = collection(db, `artifacts/${appId}/users/${userId}/generatedContent`);
    const q = query(contentRef, orderBy('timestamp', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get content history error:', error);
    throw error;
  }
};

export const subscribeToContentHistory = (userId, callback) => {
  try {
    const appId = getAppId();
    const contentRef = collection(db, `artifacts/${appId}/users/${userId}/generatedContent`);
    const q = query(contentRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(history);
    }, (error) => {
      console.error('Content history subscription error:', error);
      throw error;
    });
  } catch (error) {
    console.error('Subscribe to content history error:', error);
    throw error;
  }
};

export const updateGeneratedContent = async (userId, contentId, updates) => {
  try {
    const appId = getAppId();
    const contentRef = doc(db, `artifacts/${appId}/users/${userId}/generatedContent`, contentId);
    
    await updateDoc(contentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Update generated content error:', error);
    throw error;
  }
};

export const deleteGeneratedContent = async (userId, contentId) => {
  try {
    const appId = getAppId();
    const contentRef = doc(db, `artifacts/${appId}/users/${userId}/generatedContent`, contentId);
    
    await deleteDoc(contentRef);
    return true;
  } catch (error) {
    console.error('Delete generated content error:', error);
    throw error;
  }
};

export const getGeneratedContent = async (userId, contentId) => {
  try {
    const appId = getAppId();
    const contentRef = doc(db, `artifacts/${appId}/users/${userId}/generatedContent`, contentId);
    
    const docSnap = await getDoc(contentRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Get generated content error:', error);
    throw error;
  }
};

export default app;
