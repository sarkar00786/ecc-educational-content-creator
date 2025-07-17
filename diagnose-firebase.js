import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Read environment variables (you'll need to set these)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Alternative: Use project-specific config if env vars are not set
const fallbackConfig = {
  apiKey: "your-api-key",
  authDomain: "project-q-34d01.firebaseapp.com",
  projectId: "project-q-34d01",
  storageBucket: "project-q-34d01.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Use fallback if env vars are not available
const config = firebaseConfig.apiKey ? firebaseConfig : fallbackConfig;

console.log('🔧 Firebase Diagnostic Tool');
console.log('===========================');

try {
  // Initialize Firebase
  const app = initializeApp(config);
  const db = getFirestore(app);
  // eslint-disable-next-line no-unused-vars
  const auth = getAuth(app);
  
  console.log('✅ Firebase initialized successfully');
  console.log('📋 Project ID:', config.projectId);
  
  // Function to check content history for a specific user
  const checkContentHistory = async (userId) => {
    try {
      const appId = config.appId;
      const contentPath = `artifacts/${appId}/users/${userId}/generatedContent`;
      
      console.log(`\n📁 Checking content history path: ${contentPath}`);
      
      const contentRef = collection(db, contentPath);
      const q = query(contentRef, orderBy('timestamp', 'desc'));
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('❌ No content found for user:', userId);
        return [];
      }
      
      console.log(`✅ Found ${snapshot.docs.length} content items for user:`, userId);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n📄 Content ${index + 1}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Name: ${data.name || 'Untitled'}`);
        console.log(`   Timestamp: ${data.timestamp ? data.timestamp.toDate().toLocaleString() : 'No timestamp'}`);
        console.log(`   Audience Class: ${data.audienceClass || 'Not specified'}`);
        console.log(`   Has Generated Content: ${data.generatedContent ? 'Yes' : 'No'}`);
        console.log(`   Content Length: ${data.generatedContent ? data.generatedContent.length : 0} characters`);
      });
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error checking content history:', error);
      return [];
    }
  };
  
  // Function to check user data
  const checkUserData = async (userId) => {
    try {
      const appId = config.appId;
      const userPath = `artifacts/${appId}/users/${userId}`;
      
      console.log(`\n👤 Checking user data path: ${userPath}`);
      
      const userRef = doc(db, userPath);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('✅ User data found');
        const userData = userSnap.data();
        console.log('   User settings:', Object.keys(userData));
      } else {
        console.log('❌ No user data found');
      }
    } catch (error) {
      console.error('❌ Error checking user data:', error);
    }
  };
  
  // Function to check Firebase rules
  const checkFirebaseRules = () => {
    console.log('\n🔐 Firebase Rules Check:');
    console.log('   - Make sure you are authenticated');
    console.log('   - Check that your user ID matches the path structure');
    console.log('   - Verify that firestore.rules allow read/write access');
    console.log('   - Path pattern: artifacts/{appId}/users/{userId}/generatedContent');
  };
  
  // Main diagnostic function
  const runDiagnostics = async (userId) => {
    console.log('\n🚀 Starting Firebase Diagnostics...');
    
    if (!userId) {
      console.log('❌ No user ID provided. Please provide a user ID to check.');
      console.log('Usage: node diagnose-firebase.js YOUR_USER_ID');
      return;
    }
    
    await checkUserData(userId);
    await checkContentHistory(userId);
    checkFirebaseRules();
    
    console.log('\n✨ Diagnostics complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Verify your Firebase environment variables are set correctly');
    console.log('2. Check that your user is properly authenticated');
    console.log('3. Ensure content is being saved with proper timestamp fields');
    console.log('4. Verify that the real-time listener is properly subscribed');
  };
  
  // Get user ID from command line arguments
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('❌ Please provide a user ID as an argument');
    console.log('Usage: node diagnose-firebase.js YOUR_USER_ID');
    process.exit(1);
  }
  
  runDiagnostics(userId);
  
} catch (error) {
  console.error('❌ Fatal error initializing Firebase:', error);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your Firebase configuration');
  console.log('2. Verify your project ID is correct');
  console.log('3. Ensure you have proper permissions');
  console.log('4. Check your network connection');
}
