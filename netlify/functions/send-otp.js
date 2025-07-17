const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Environment variables
const OTP_EMAIL_USER = process.env.OTP_EMAIL_USER;
const OTP_EMAIL_PASS = process.env.OTP_EMAIL_PASS;
const OTP_SECRET_KEY = process.env.OTP_SECRET_KEY;

// In-memory storage for OTP codes (in production, use Redis or database)
const otpStorage = new Map();

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Encrypt OTP for storage
function encryptOTP(otp) {
  const cipher = crypto.createCipher('aes-256-cbc', OTP_SECRET_KEY);
  let encrypted = cipher.update(otp, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Create email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: OTP_EMAIL_USER,
    pass: OTP_EMAIL_PASS
  }
});

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
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const encryptedOtp = encryptOTP(otp);

    // Store OTP with expiration (5 minutes)
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    otpStorage.set(email, {
      otp: encryptedOtp,
      expiresAt: expirationTime,
      attempts: 0
    });

    // Email content
    const mailOptions = {
      from: {
        name: 'ECC App',
        address: OTP_EMAIL_USER
      },
      to: email,
      subject: 'ECC App - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ECC App</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Educational Content Creator</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0; text-align: center;">Email Verification Required</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for signing up with ECC App! To complete your registration, please verify your email address by entering the following verification code:
            </p>
            
            <div style="background: white; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #3B82F6; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              <strong>Important:</strong> This verification code will expire in 5 minutes for security reasons.
            </p>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 0;">
              If you didn't request this verification code, please ignore this email. Someone might have accidentally entered your email address.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from ECC App. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'OTP sent successfully',
        expiresIn: 300 // 5 minutes in seconds
      })
    };

  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send OTP' })
    };
  }
};
