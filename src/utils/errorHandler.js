/**
 * Enhanced Error Handler Utility
 * Provides comprehensive error handling and user-friendly error messages
 */

export class AppError extends Error {
  constructor(message, type = 'error', code = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorTypes = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  API: 'api',
  FIRESTORE: 'firestore',
  GENERAL: 'general'
};

export const handleError = (error, context = '') => {
  // Log error for debugging
  console.error(`[${context}] Error:`, error);
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return new AppError(
      'Unable to connect to the server. Please check your internet connection and try again.',
      ErrorTypes.NETWORK,
      'NETWORK_ERROR'
    );
  }
  
  // Firebase Auth errors
  if (error.code && error.code.startsWith('auth/')) {
    return handleAuthError(error);
  }
  
  // Firestore errors
  if (error.code && error.code.startsWith('firestore/')) {
    return handleFirestoreError(error);
  }
  
  // API errors
  if (error.message && error.message.includes('API error')) {
    return handleAPIError(error);
  }
  
  // Generic error
  return new AppError(
    error.message || 'An unexpected error occurred. Please try again.',
    ErrorTypes.GENERAL,
    'UNKNOWN_ERROR'
  );
};

const handleAuthError = (error) => {
  const authErrorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up blocked. Please allow pop-ups for this site.',
    'auth/cancelled-popup-request': 'Sign-in cancelled. Please try again.'
  };
  
  const message = authErrorMessages[error.code] || `Authentication error: ${error.message}`;
  return new AppError(message, ErrorTypes.AUTHENTICATION, error.code);
};

const handleFirestoreError = (error) => {
  const firestoreErrorMessages = {
    'firestore/permission-denied': 'You don\'t have permission to access this data.',
    'firestore/not-found': 'The requested data was not found.',
    'firestore/already-exists': 'This data already exists.',
    'firestore/resource-exhausted': 'Service temporarily unavailable. Please try again later.',
    'firestore/failed-precondition': 'Operation failed due to system constraints.',
    'firestore/aborted': 'Operation was aborted. Please try again.',
    'firestore/out-of-range': 'Invalid data range provided.',
    'firestore/unimplemented': 'This feature is not yet implemented.',
    'firestore/internal': 'Internal server error. Please try again later.',
    'firestore/unavailable': 'Service temporarily unavailable. Please try again later.',
    'firestore/data-loss': 'Data corruption detected. Please contact support.',
    'firestore/unauthenticated': 'You must be signed in to perform this action.'
  };
  
  const message = firestoreErrorMessages[error.code] || `Database error: ${error.message}`;
  return new AppError(message, ErrorTypes.FIRESTORE, error.code);
};

const handleAPIError = (error) => {
  if (error.message.includes('API error from Netlify Function')) {
    const statusMatch = error.message.match(/(\d{3})/);
    const status = statusMatch ? statusMatch[1] : '500';
    
    const apiErrorMessages = {
      '400': 'Invalid request. Please check your input and try again.',
      '401': 'Authentication required. Please sign in and try again.',
      '403': 'Access denied. You don\'t have permission for this action.',
      '404': 'Service not found. Please try again later.',
      '429': 'Too many requests. Please wait a moment and try again.',
      '500': 'Server error. Please try again later.',
      '502': 'Service temporarily unavailable. Please try again later.',
      '503': 'Service maintenance in progress. Please try again later.'
    };
    
    const message = apiErrorMessages[status] || 'API service error. Please try again later.';
    return new AppError(message, ErrorTypes.API, `API_${status}`);
  }
  
  return new AppError(
    'Service error. Please try again later.',
    ErrorTypes.API,
    'API_UNKNOWN'
  );
};

export const validateInput = (type, value, options = {}) => {
  const { required = false, minLength = 0, maxLength = Infinity } = options;
  
  if (required && (!value || value.trim() === '')) {
    throw new AppError(
      `${type} is required.`,
      ErrorTypes.VALIDATION,
      'REQUIRED_FIELD'
    );
  }
  
  if (value && value.length < minLength) {
    throw new AppError(
      `${type} must be at least ${minLength} characters long.`,
      ErrorTypes.VALIDATION,
      'MIN_LENGTH'
    );
  }
  
  if (value && value.length > maxLength) {
    throw new AppError(
      `${type} must be less than ${maxLength} characters long.`,
      ErrorTypes.VALIDATION,
      'MAX_LENGTH'
    );
  }
  
  // Email validation
  if (type === 'Email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new AppError(
        'Please enter a valid email address.',
        ErrorTypes.VALIDATION,
        'INVALID_EMAIL'
      );
    }
  }
  
  // Password validation
  if (type === 'Password' && value) {
    if (value.length < 6) {
      throw new AppError(
        'Password must be at least 6 characters long.',
        ErrorTypes.VALIDATION,
        'WEAK_PASSWORD'
      );
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      throw new AppError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        ErrorTypes.VALIDATION,
        'WEAK_PASSWORD'
      );
    }
  }
  
  return true;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Basic XSS protection
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const logError = (error, context = '', userId = null) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    userId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code
    },
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog);
  }
  
  // In production, you might want to send this to a logging service
  // Example: sendToLoggingService(errorLog);
  
  return errorLog;
};

export const isOnline = () => {
  return navigator.onLine;
};

export const handleOfflineError = () => {
  return new AppError(
    'You are currently offline. Please check your internet connection and try again.',
    ErrorTypes.NETWORK,
    'OFFLINE'
  );
};

export default {
  AppError,
  ErrorTypes,
  handleError,
  validateInput,
  sanitizeInput,
  logError,
  isOnline,
  handleOfflineError
};
