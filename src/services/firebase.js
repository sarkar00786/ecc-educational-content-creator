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

// Enhanced file upload function that reads content and uploads to Firebase
export const uploadFileWithContent = async (file, userId, chatId, fileId) => {
  try {
    // Read file content
    const fileContent = await readFileContent(file);
    
    // Create file path
    const filePath = `chats/${userId}/${chatId}/${fileId}-${file.name}`;
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Return file metadata with content
    return {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: downloadURL,
      content: fileContent,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Enhanced file upload error:', error);
    throw error;
  }
};

// File content reader utility
const readFileContent = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        
        // Handle different file types
        if (file.type.startsWith('text/') || file.type === 'application/json') {
          // Text files - return as is
          resolve(content);
        } else if (file.type === 'application/pdf') {
          // For PDF, we'll store a placeholder and handle it differently
          resolve('[PDF Content - This is a PDF file that needs to be processed by the AI]');
        } else if (file.type.startsWith('image/')) {
          // For images, convert to base64 and add description
          const base64Content = content.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(`[Image Content - Base64 Data]\nFile Type: ${file.type}\nFile Name: ${file.name}\nNote: This is an image file that the AI should analyze.`);
        } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // For spreadsheets
          resolve(`[Spreadsheet Content]\nFile Type: ${file.type}\nFile Name: ${file.name}\nNote: This is a spreadsheet file that contains data the AI should analyze.`);
        } else if (file.type.includes('document') || file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          // For documents
          resolve(`[Document Content]\nFile Type: ${file.type}\nFile Name: ${file.name}\nNote: This is a document file that contains text the AI should analyze.`);
        } else {
          // For other file types
          resolve(`[File Content]\nFile Type: ${file.type}\nFile Name: ${file.name}\nFile Size: ${file.size} bytes\nNote: This is a file that the AI should analyze based on its type and name.`);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    // Read file based on type
    if (file.type.startsWith('text/') || file.type === 'application/json') {
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      // For other file types, try to read as text first
      reader.readAsText(file);
    }
  });
};

// Function to fetch file content from URL (fallback)
export const fetchFileContentFromURL = async (fileUrl, fileName, fileType) => {
  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    if (fileType.startsWith('text/') || fileType === 'application/json') {
      const textContent = await response.text();
      return textContent;
    } else if (fileType.startsWith('image/')) {
      return `[Image Content from URL]\nFile Name: ${fileName}\nFile Type: ${fileType}\nURL: ${fileUrl}\nNote: This is an image file that the AI should analyze.`;
    } else {
      return `[File Content from URL]\nFile Name: ${fileName}\nFile Type: ${fileType}\nURL: ${fileUrl}\nNote: This is a file that the AI should analyze based on its type and name.`;
    }
  } catch (error) {
    console.error('Error fetching file content from URL:', error);
    return `[File Content Unavailable]\nFile Name: ${fileName}\nFile Type: ${fileType}\nError: Could not retrieve file content\nNote: The AI should acknowledge that this file was attached but content is not available.`;
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
