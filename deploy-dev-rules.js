import fs from 'fs';

// Simple rule deployment script
console.log('🔧 Firebase Rules Deployment Helper');
console.log('');
console.log('To deploy the development rules:');
console.log('');
console.log('1. Install Firebase CLI:');
console.log('   npm install -g firebase-tools');
console.log('');
console.log('2. Login to Firebase:');
console.log('   firebase login');
console.log('');
console.log('3. Initialize Firebase in your project (if not done):');
console.log('   firebase init firestore');
console.log('');
console.log('4. Copy the development rules:');
console.log('   cp firestore-dev.rules firestore.rules');
console.log('');
console.log('5. Deploy the rules:');
console.log('   firebase deploy --only firestore:rules');
console.log('');
console.log('⚠️  IMPORTANT: These are development rules for debugging only!');
console.log('   Replace with production rules before going live.');
console.log('');

// Check if firestore.rules exists
if (fs.existsSync('firestore.rules')) {
    console.log('✅ firestore.rules file exists');
} else {
    console.log('❌ firestore.rules file not found');
    console.log('   You may need to run: firebase init firestore');
}

// Check if firebase.json exists
if (fs.existsSync('firebase.json')) {
    console.log('✅ firebase.json file exists');
} else {
    console.log('❌ firebase.json file not found');
    console.log('   You may need to run: firebase init');
}

console.log('');
console.log('Current directory contents:');
const files = fs.readdirSync('.');
files.forEach(file => {
    if (file.includes('firebase') || file.includes('firestore') || file.includes('.rules')) {
        console.log(`  - ${file}`);
    }
});

console.log('');
console.log('If you need to quickly copy the development rules:');
console.log('');

// Try to copy the rules file automatically
try {
    const devRules = fs.readFileSync('firestore-dev.rules', 'utf8');
    fs.writeFileSync('firestore.rules', devRules);
    console.log('✅ Development rules copied to firestore.rules');
    console.log('   Now run: firebase deploy --only firestore:rules');
} catch (_error) {
    console.log('❌ Could not copy rules automatically');
    console.log('   Please copy manually: cp firestore-dev.rules firestore.rules');
}

console.log('');
console.log('🚀 After deploying, your app should work without permission errors!');
