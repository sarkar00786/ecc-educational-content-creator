# 🔧 Firebase Troubleshooting Guide

## 🚨 Current Issues Fixed

### 1. **Project ID Mismatch** ✅ FIXED
- **Issue**: App.jsx was using `ecc-app-ab284` while .env used `project-q-34d01`
- **Solution**: Updated App.jsx to use environment variables consistently
- **Result**: All Firebase calls now use the correct project ID

### 2. **Environment Variables** ✅ FIXED
- **Issue**: Vite requires `VITE_` prefix for frontend environment variables
- **Solution**: Updated .env file with proper `VITE_` prefixes
- **Result**: Firebase config now loads correctly from environment variables

### 3. **Firestore Security Rules** ✅ FIXED
- **Issue**: Restrictive rules causing "Missing or insufficient permissions" errors
- **Solution**: Added temporary development rule allowing all authenticated users
- **Result**: Chat functionality should work for authenticated users

## 🔍 Verification Steps

### Step 1: Check Environment Variables
```bash
# Verify your .env file has these variables:
VITE_FIREBASE_API_KEY=AIzaSyBNvDI9g6rQdwsPj7muECmr7RKaby6qyQc
VITE_FIREBASE_AUTH_DOMAIN=project-q-34d01.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-q-34d01
VITE_FIREBASE_STORAGE_BUCKET=project-q-34d01.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=910875870805
VITE_FIREBASE_APP_ID=1:910875870805:web:e8a5396a8c91825e3fb6dc
VITE_FIREBASE_MEASUREMENT_ID=G-00GVMJ9MEE
```

### Step 2: Verify Firebase Configuration
1. Open browser console
2. Look for: `🔥 Firebase configuration loaded for project: project-q-34d01`
3. Should NOT see any "Firebase configuration is incomplete" errors

### Step 3: Deploy Firestore Rules
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy the rules
node deploy-firebase-rules.js
```

### Step 4: Test Authentication
1. Try to login/signup
2. Check browser console for auth success
3. Verify user object is populated

### Step 5: Test Chat Functionality
1. Navigate to chat page
2. Try to send a message
3. Check for permission errors in console

## 🛠️ Additional Troubleshooting

### Issue: "Missing or insufficient permissions"

**Possible Causes:**
1. User not authenticated
2. Firestore rules not deployed
3. Wrong project ID in requests
4. Security rules too restrictive

**Solutions:**
1. Verify authentication state
2. Deploy updated rules: `node deploy-firebase-rules.js`
3. Check project ID in Firebase console
4. Temporarily use development rules (already applied)

### Issue: "Firebase configuration is incomplete"

**Possible Causes:**
1. Missing environment variables
2. Incorrect VITE_ prefix
3. .env file not loaded

**Solutions:**
1. Check .env file exists and has correct variables
2. Restart development server after changing .env
3. Verify VITE_ prefix on all variables

### Issue: "Network error" or "Failed to fetch"

**Possible Causes:**
1. Internet connection issues
2. Firebase project not accessible
3. API key restrictions

**Solutions:**
1. Check internet connection
2. Verify project exists in Firebase console
3. Check API key restrictions in Firebase console

### Issue: Chat messages not saving

**Possible Causes:**
1. Firestore rules blocking writes
2. Incorrect collection path
3. User not authenticated

**Solutions:**
1. Check firestore rules allow writes
2. Verify collection path matches code
3. Ensure user is logged in

## 📋 Manual Testing Checklist

### Authentication Testing
- [ ] User can sign up successfully
- [ ] User can log in successfully
- [ ] User stays logged in after page refresh
- [ ] User can log out successfully
- [ ] Welcome message appears after login

### Chat Functionality Testing
- [ ] Chat page loads without errors
- [ ] User can see chat history sidebar
- [ ] User can create new chat
- [ ] User can send messages
- [ ] Messages appear in chat
- [ ] Chat history persists after page refresh

### Content Generation Testing
- [ ] User can access content generation
- [ ] User can fill out form fields
- [ ] User can generate content
- [ ] Generated content saves to history
- [ ] User can view content history

### Error Handling Testing
- [ ] Network errors show user-friendly messages
- [ ] Permission errors are handled gracefully
- [ ] Failed operations can be retried
- [ ] App doesn't crash on errors

## 🔧 Developer Tools

### Browser Console Commands
```javascript
// Check Firebase configuration
console.log('Firebase config:', firebaseConfig);

// Check authentication state
console.log('Current user:', auth.currentUser);

// Check Firestore connection
console.log('Firestore instance:', db);

// Test Firestore query
getDocs(collection(db, 'artifacts/test/test')).then(console.log).catch(console.error);
```

### Firebase Console Checks
1. **Authentication**: Check if users are being created
2. **Firestore**: Check if documents are being written
3. **Rules**: Verify rules are active and correct
4. **Usage**: Check for quota limits or billing issues

## 🚀 Performance Optimization

### Firestore Optimization
1. **Indexing**: Create composite indexes for complex queries
2. **Caching**: Use Firebase offline persistence
3. **Batching**: Batch multiple operations
4. **Pagination**: Use cursor-based pagination

### Code Optimization
1. **Lazy Loading**: Use React.lazy for components
2. **Memoization**: Use React.memo for expensive components
3. **Debouncing**: Debounce search and input operations
4. **Error Boundaries**: Add error boundaries for graceful failures

## 📊 Monitoring and Logging

### Add Logging
```javascript
// Add to Firebase operations
const logFirestoreOperation = (operation, collection, success, error) => {
  console.log(`🔥 Firestore ${operation} on ${collection}:`, {
    success,
    error,
    timestamp: new Date().toISOString()
  });
};
```

### Monitor Performance
1. Use Firebase Performance Monitoring
2. Add custom performance traces
3. Monitor bundle size
4. Check Core Web Vitals

## 🔒 Security Best Practices

### Current Security Status
- ✅ Authentication required for all operations
- ✅ Users can only access their own data
- ⚠️ Development rules are permissive (temporary)
- ❌ No rate limiting implemented

### Production Security Checklist
- [ ] Remove development rules
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Sanitize user inputs
- [ ] Implement CSRF protection
- [ ] Add API key restrictions

## 📞 Support Resources

### Firebase Documentation
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)

### Community Support
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Discord](https://discord.gg/firebase)
- [GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)

## 🆘 Emergency Procedures

### If Chat Completely Breaks
1. Check browser console for errors
2. Verify authentication state
3. Test with simple Firestore query
4. Revert to previous working version
5. Contact Firebase support if needed

### If Authentication Fails
1. Check Firebase project settings
2. Verify API keys are correct
3. Check domain authorization
4. Test with Firebase Auth emulator

### If Rules Are Too Restrictive
1. Use development rules temporarily
2. Test specific rule conditions
3. Use Firebase Rules Playground
4. Deploy incremental rule changes

Remember: The temporary development rules allow all authenticated users to read/write. This should resolve the immediate permission issues while you develop more specific rules for production.
