const crypto = require('crypto');

// Environment variables
const OTP_SECRET_KEY = process.env.OTP_SECRET_KEY;

// In-memory storage for OTP codes (should match send-otp.js)
const otpStorage = new Map();

// Decrypt OTP for verification
function decryptOTP(encryptedOtp) {
  const decipher = crypto.createDecipher('aes-256-cbc', OTP_SECRET_KEY);
  let decrypted = decipher.update(encryptedOtp, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// eslint-disable-next-line no-unused-vars
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and OTP are required' })
      };
    }

    // Check if OTP exists for this email
    const otpData = otpStorage.get(email);
    if (!otpData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'OTP not found or expired' })
      };
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(email);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'OTP has expired' })
      };
    }

    // Check attempt limit (max 3 attempts)
    if (otpData.attempts >= 3) {
      otpStorage.delete(email);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Too many attempts. Please request a new OTP' })
      };
    }

    // Decrypt and verify OTP
    const decryptedOtp = decryptOTP(otpData.otp);
    if (otp !== decryptedOtp) {
      // Increment attempts
      otpData.attempts += 1;
      otpStorage.set(email, otpData);
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid OTP',
          attemptsLeft: 3 - otpData.attempts
        })
      };
    }

    // OTP is valid, remove from storage
    otpStorage.delete(email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'OTP verified successfully',
        verified: true
      })
    };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to verify OTP' })
    };
  }
};
