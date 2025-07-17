#!/usr/bin/env node

/**
 * Firebase Rules Deployment Script
 * 
 * This script helps deploy Firestore security rules to Firebase.
 * Run this script after updating firestore.rules to apply the new rules.
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Configuration
const PROJECT_ID = 'project-q-34d01';
const RULES_FILE = 'firestore.rules';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRequirements() {
  log('🔍 Checking requirements...', 'blue');
  
  // Check if firestore.rules exists
  if (!fs.existsSync(RULES_FILE)) {
    log(`❌ Error: ${RULES_FILE} not found!`, 'red');
    log('Please create firestore.rules file with your security rules.', 'yellow');
    process.exit(1);
  }
  
  // Check if firebase-tools is installed
  return new Promise((resolve, reject) => {
    const firebase = spawn('firebase', ['--version'], { stdio: 'pipe' });
    
    firebase.on('close', (code) => {
      if (code === 0) {
        log('✅ Firebase CLI is installed', 'green');
        resolve();
      } else {
        log('❌ Firebase CLI is not installed', 'red');
        log('Please install it with: npm install -g firebase-tools', 'yellow');
        reject(new Error('Firebase CLI not found'));
      }
    });
    
    firebase.on('error', (err) => {
      log('❌ Firebase CLI is not installed', 'red');
      log('Please install it with: npm install -g firebase-tools', 'yellow');
      reject(err);
    });
  });
}

function loginToFirebase() {
  return new Promise((resolve, reject) => {
    log('🔐 Checking Firebase authentication...', 'blue');
    
    const firebase = spawn('firebase', ['projects:list'], { stdio: 'pipe' });
    
    firebase.on('close', (code) => {
      if (code === 0) {
        log('✅ Already logged in to Firebase', 'green');
        resolve();
      } else {
        log('🔐 Please login to Firebase...', 'yellow');
        
        // Start login process
        const loginProcess = spawn('firebase', ['login'], { stdio: 'inherit' });
        
        loginProcess.on('close', (loginCode) => {
          if (loginCode === 0) {
            log('✅ Successfully logged in to Firebase', 'green');
            resolve();
          } else {
            log('❌ Failed to login to Firebase', 'red');
            reject(new Error('Firebase login failed'));
          }
        });
      }
    });
    
    firebase.on('error', (err) => {
      reject(err);
    });
  });
}

function initializeFirebase() {
  return new Promise((resolve) => {
    log('🚀 Initializing Firebase project...', 'blue');
    
    // Check if firebase.json exists
    if (!fs.existsSync('firebase.json')) {
      log('📝 Creating firebase.json...', 'yellow');
      
      const firebaseConfig = {
        firestore: {
          rules: RULES_FILE,
          indexes: "firestore.indexes.json"
        }
      };
      
      fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
      log('✅ Created firebase.json', 'green');
    }
    
    // Check if firestore.indexes.json exists
    if (!fs.existsSync('firestore.indexes.json')) {
      log('📝 Creating firestore.indexes.json...', 'yellow');
      
      const indexesConfig = {
        indexes: [],
        fieldOverrides: []
      };
      
      fs.writeFileSync('firestore.indexes.json', JSON.stringify(indexesConfig, null, 2));
      log('✅ Created firestore.indexes.json', 'green');
    }
    
    resolve();
  });
}

function validateRules() {
  return new Promise((resolve, reject) => {
    log('🔍 Validating Firestore rules...', 'blue');
    
    const firebase = spawn('firebase', ['firestore:rules', 'validate', '--project', PROJECT_ID], { stdio: 'pipe' });
    
    let errorOutput = '';
    
    firebase.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    firebase.on('close', (code) => {
      if (code === 0) {
        log('✅ Firestore rules are valid', 'green');
        resolve();
      } else {
        log('❌ Firestore rules validation failed:', 'red');
        log(errorOutput, 'red');
        reject(new Error('Rules validation failed'));
      }
    });
    
    firebase.on('error', (err) => {
      reject(err);
    });
  });
}

function deployRules() {
  return new Promise((resolve, reject) => {
    log('🚀 Deploying Firestore rules...', 'blue');
    
    const firebase = spawn('firebase', ['deploy', '--only', 'firestore:rules', '--project', PROJECT_ID], { stdio: 'pipe' });
    
    let errorOutput = '';
    
    firebase.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    firebase.on('close', (code) => {
      if (code === 0) {
        log('✅ Firestore rules deployed successfully!', 'green');
        log('🎉 Your rules are now active in Firebase', 'cyan');
        resolve();
      } else {
        log('❌ Failed to deploy Firestore rules:', 'red');
        log(errorOutput, 'red');
        reject(new Error('Rules deployment failed'));
      }
    });
    
    firebase.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    log('🔥 Firebase Rules Deployment Script', 'magenta');
    log('=====================================', 'magenta');
    
    await checkRequirements();
    await loginToFirebase();
    await initializeFirebase();
    await validateRules();
    await deployRules();
    
    log('', 'reset');
    log('✅ All done! Your Firestore rules are now deployed.', 'green');
    log('🌐 You can view your rules in the Firebase Console:', 'cyan');
    log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/rules`, 'cyan');
    
  } catch (error) {
    log('', 'reset');
    log('❌ Deployment failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
