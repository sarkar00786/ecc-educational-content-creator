import React, { useState, useCallback } from 'react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword 
} from '../../services/firebase';
import { handleError, validateInput, sanitizeInput } from '../../utils/errorHandler';
import { measureAsync } from '../../utils/performanceMonitor';
import ValidatedInput from '../common/ValidatedInput';
import OTPVerification from './OTPVerification';

/**
 * EmailAuthForm Component
 * Provides email/password authentication functionality including:
 * - Sign in with email/password
 * - Sign up with email/password
 * - OTP verification during signup
 * - Password reset functionality
 * - Comprehensive validation and error handling
 * - Accessibility features for keyboard navigation
 */
const EmailAuthForm = ({ onAuthSuccess, onError, onBackToSocial }) => {
  // Form state management
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Handles email authentication (sign in or sign up)
   * Implements comprehensive validation, sanitization, and error handling
   * @param {string} authType - 'signin' or 'signup'
   */
  const handleEmailAuth = useCallback(async (authType) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Validate inputs
      validateInput('Email', email, { required: true, type: 'email' });
      validateInput('Password', password, { required: true, minLength: 6 });
      
      if (authType === 'signup') {
        validateInput('Confirm Password', confirmPassword, { required: true });
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      
      // Request to send OTP on signup
      if (authType === 'signup') {
        try {
          await fetch('/.netlify/functions/send-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: sanitizedEmail })
          });
        } catch {
          throw new Error('Failed to send OTP. Please try again.');
        }
        setMode('otp');
        return;
      }
      // Perform authentication with performance monitoring
      const user = await measureAsync(`auth_email_${authType}`, async () => {
        return authType === 'signin' 
          ? await signInWithEmail(sanitizedEmail, sanitizedPassword)
          : await signUpWithEmail(sanitizedEmail, sanitizedPassword);
      }, { type: authType, email: sanitizedEmail });
      
      // Show success message for sign up
      if (authType === 'signup') {
        setMessage('Account created successfully! Please check your email for verification.');
      }
      
      onAuthSuccess(user);
    } catch (error) {
      const appError = handleError(error, `Email Auth: ${authType}`);
      onError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, onAuthSuccess, onError]);

  /**
   * Handles password reset functionality
   * Sends password reset email with proper validation and feedback
   */
  const handlePasswordReset = useCallback(async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      validateInput('Email', email, { required: true, type: 'email' });
      const sanitizedEmail = sanitizeInput(email);
      
      await measureAsync('auth_password_reset', async () => {
        return await resetPassword(sanitizedEmail);
      }, { email: sanitizedEmail });
      
      setMessage('Password reset email sent! Check your inbox and follow the instructions.');
      
      // Return to sign in mode after 3 seconds
      setTimeout(() => {
        setMode('signin');
        setMessage('');
      }, 3000);
    } catch (error) {
      const appError = handleError(error, 'Password Reset');
      onError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [email, onError]);

  /**
   * Handles form submission based on current mode
   * Prevents default form submission and routes to appropriate handler
   * @param {Event} e - Form submission event
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (mode === 'reset') {
      handlePasswordReset();
    } else {
      handleEmailAuth(mode);
    }
  }, [mode, handleEmailAuth, handlePasswordReset]);

  /**
   * Handles keyboard navigation for form switching
   * Implements accessibility best practices for keyboard users
   * @param {KeyboardEvent} e - Keyboard event
   * @param {string} targetMode - Mode to switch to
   */
  const handleKeyDown = useCallback((e, targetMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMode(targetMode);
      setMessage('');
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-6">
        <button
          onClick={onBackToSocial}
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
          aria-label="Back to social login options"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to social login
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'signin' && 'Sign In'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'reset' && 'Reset Password'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {mode === 'signin' && 'Enter your email and password to continue'}
          {mode === 'signup' && 'Create a new account to get started'}
          {mode === 'reset' && 'Enter your email to receive reset instructions'}
        </p>
      </div>

      {/* Success/Info Message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">{message}</p>
        </div>
      )}

      {/* OTP Verification Mode */}
      {mode === 'otp' && (
        <OTPVerification
          email={email}
          password={password}
          onVerified={async () => {
            try {
              // Create Firebase account after OTP verification
              const user = await signUpWithEmail(email, password);
              setMessage('Account created successfully!');
              onAuthSuccess(user);
            } catch (error) {
              onError('Failed to create account: ' + error.message);
            }
          }}
          onBack={() => setMode('signup')}
          onError={onError}
          onResendOTP={async () => {
            await fetch('/.netlify/functions/send-otp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email })
            });
          }}
        />
      )}

      {/* Email Auth Form */}
      {mode !== 'otp' && (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <ValidatedInput
          fieldName="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email address"
          required={true}
          disabled={isLoading}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Password Field */}
        {mode !== 'reset' && (
          <ValidatedInput
            fieldName="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required={true}
            disabled={isLoading}
            helpText={mode === 'signup' ? 'Password must be at least 6 characters' : ''}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
        )}

        {/* Confirm Password Field (Sign Up Only) */}
        {mode === 'signup' && (
          <ValidatedInput
            fieldName="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm your password"
            required={true}
            disabled={isLoading}
            helpText="Re-enter your password to confirm"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isLoading && (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {mode === 'signin' && (isLoading ? 'Signing In...' : 'Sign In')}
          {mode === 'signup' && (isLoading ? 'Creating Account...' : 'Create Account')}
          {mode === 'reset' && (isLoading ? 'Sending Reset Email...' : 'Send Reset Email')}
        </button>
      </form>
      )}

      {/* Mode Switching Links */}
      {mode !== 'otp' && (
      <div className="mt-6 text-center space-y-2">
        {mode === 'signin' && (
          <>
            <button
              type="button"
              onClick={() => setMode('reset')}
              onKeyDown={(e) => handleKeyDown(e, 'reset')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              tabIndex={0}
            >
              Forgot your password?
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                onKeyDown={(e) => handleKeyDown(e, 'signup')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                tabIndex={0}
              >
                Sign up
              </button>
            </div>
          </>
        )}
        
        {mode === 'signup' && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              onKeyDown={(e) => handleKeyDown(e, 'signin')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              tabIndex={0}
            >
              Sign in
            </button>
          </div>
        )}
        
        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => setMode('signin')}
            onKeyDown={(e) => handleKeyDown(e, 'signin')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            tabIndex={0}
          >
            Back to sign in
          </button>
        )}
      </div>
      )}
    </div>
  );
};

export default EmailAuthForm;
