import React, { useState, useEffect, useCallback } from 'react';
import { handleError } from '../../utils/errorHandler';
import { measureAsync } from '../../utils/performanceMonitor';

/**
 * OTPVerification Component
 * Handles OTP verification for email signup process
 * Features:
 * - 6-digit OTP input with automatic focus management
 * - Countdown timer for OTP expiration
 * - Resend OTP functionality
 * - Error handling and validation
 * - Accessibility features
 */
const OTPVerification = ({ 
  email, 
  // password,
  onVerified, 
  onBack, 
  onError,
  onResendOTP 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOTPChange = useCallback((index, value) => {
    if (value.length > 1) {
      // Handle paste functionality
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedValue.length && i < 6; i++) {
        newOtp[i] = pastedValue[i];
      }
      setOtp(newOtp);
      
      // Focus on the next empty input or the last input
      const nextIndex = Math.min(pastedValue.length, 5);
      const nextInput = document.querySelector(`input[name="otp-${nextIndex}"]`);
      if (nextInput) nextInput.focus();
      return;
    }

    // Handle single character input
    if (value.match(/[0-9]/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (index < 5) {
        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  }, [otp]);

  // Handle backspace
  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  }, [otp]);

  // Verify OTP
  const handleVerifyOTP = useCallback(async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      onError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await measureAsync('otp_verification', async () => {
        return await fetch('/.netlify/functions/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp: otpCode
          }),
        });
      }, { email });

      const result = await response.json();

      if (response.ok) {
        setMessage('Email verified successfully!');
        onVerified();
      } else {
        if (result.attemptsLeft !== undefined) {
          setAttemptsLeft(result.attemptsLeft);
        }
        throw new Error(result.error || 'Verification failed');
      }
    } catch (error) {
      const appError = handleError(error, 'OTP Verification');
      onError(appError.message);
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.querySelector(`input[name="otp-0"]`);
      if (firstInput) firstInput.focus();
    } finally {
      setIsLoading(false);
    }
  }, [otp, email, onVerified, onError]);

  // Resend OTP
  const handleResendOTP = useCallback(async () => {
    if (!canResend) return;

    setIsLoading(true);
    setMessage('');

    try {
      await onResendOTP();
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setAttemptsLeft(3);
      setOtp(['', '', '', '', '', '']);
      setMessage('New verification code sent!');
      
      // Focus first input
      const firstInput = document.querySelector(`input[name="otp-0"]`);
      if (firstInput) firstInput.focus();
    } catch (error) {
      const appError = handleError(error, 'Resend OTP');
      onError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [canResend, onResendOTP, onError]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== '') && !isLoading) {
      handleVerifyOTP();
    }
  }, [otp, isLoading, handleVerifyOTP]);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
          aria-label="Back to signup form"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to signup
        </button>
        
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
          {email}
        </p>
      </div>

      {/* Success/Info Message */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
        </div>
      )}

      {/* OTP Input */}
      <div className="mb-6">
        <div className="flex justify-center space-x-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              name={`otp-${index}`}
              maxLength="1"
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              disabled={isLoading}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Timer and Attempts */}
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Code expired'}
          </span>
          <span>
            {attemptsLeft} attempts left
          </span>
        </div>
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerifyOTP}
        disabled={isLoading || otp.join('').length !== 6}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mb-4"
      >
        {isLoading && (
          <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </button>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendOTP}
          disabled={!canResend || isLoading}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
