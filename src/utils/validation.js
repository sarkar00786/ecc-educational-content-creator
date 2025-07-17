/**
 * Comprehensive Input Validation Utilities
 * Provides client-side validation for all form fields across the 4-step content generation process
 */

/**
 * Validation rules and error messages
 */
export const VALIDATION_RULES = {
  bookContent: {
    minLength: 0,
    maxLength: 10000,
    required: true
  },
  audienceClass: {
    minLength: 2,
    maxLength: 100,
    required: true,
    pattern: /^[a-zA-Z0-9\s\-.,()]+$/
  },
  audienceAge: {
    minLength: 1,
    maxLength: 50,
    required: true,
    pattern: /^[a-zA-Z0-9\s\-,]+$/
  },
  audienceRegion: {
    minLength: 2,
    maxLength: 100,
    required: true,
    pattern: /^[a-zA-Z\s\-.,()]+$/
  },
  outputWordCount: {
    min: 50,
    max: 5000,
    required: false,
    pattern: /^\d+$/
  },
  customInstructions: {
    minLength: 0,
    maxLength: 2000,
    required: false
  }
};

/**
 * Subtle error messages for different validation failures
 */
export const ERROR_MESSAGES = {
  required: (fieldName) => `Please fill in this field`,
  minLength: (fieldName, min) => `At least ${min} characters needed`,
  maxLength: (fieldName, max) => `Please keep under ${max} characters`,
  pattern: (fieldName) => `Please use only letters, numbers, and basic punctuation`,
  min: (fieldName, min) => `Minimum value is ${min}`,
  max: (fieldName, max) => `Maximum value is ${max}`,
  invalidNumber: (fieldName) => `Please enter a valid number`
};

/**
 * Field display names for user-friendly error messages
 */
export const FIELD_NAMES = {
  bookContent: 'Book Content',
  audienceClass: 'Audience Class',
  audienceAge: 'Audience Age',
  audienceRegion: 'Audience Region',
  outputWordCount: 'Output Word Count',
  customInstructions: 'Custom Instructions'
};

/**
 * Validates a single field based on its rules
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value to validate
 * @returns {object} Validation result with isValid and error message
 */
export const validateField = (fieldName, value) => {
  const rules = VALIDATION_RULES[fieldName];
  const fieldDisplayName = FIELD_NAMES[fieldName] || fieldName;
  
  if (!rules) {
    return { isValid: true, error: null };
  }

  // Check if field is required and empty
  if (rules.required && (!value || value.trim() === '')) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.required(fieldDisplayName)
    };
  }

  // Skip other validations if field is not required and empty
  if (!rules.required && (!value || value.trim() === '')) {
    return { isValid: true, error: null };
  }

  const trimmedValue = value.trim();

  // Check minimum length
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.minLength(fieldDisplayName, rules.minLength)
    };
  }

  // Check maximum length
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.maxLength(fieldDisplayName, rules.maxLength)
    };
  }

  // Check pattern (for text fields)
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.pattern(fieldDisplayName)
    };
  }

  // Check numeric fields
  if (fieldName === 'outputWordCount' && trimmedValue !== '') {
    const numValue = parseInt(trimmedValue, 10);
    
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.invalidNumber(fieldDisplayName)
      };
    }

    if (rules.min && numValue < rules.min) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.min(fieldDisplayName, rules.min)
      };
    }

    if (rules.max && numValue > rules.max) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.max(fieldDisplayName, rules.max)
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validates all form data for the content generation process
 * @param {object} formData - Form data object to validate
 * @returns {object} Validation result with overall validity and field errors
 */
export const validateFormData = (formData) => {
  const errors = {};
  let isFormValid = true;

  Object.keys(VALIDATION_RULES).forEach(fieldName => {
    const validation = validateField(fieldName, formData[fieldName] || '');
    if (!validation.isValid) {
      errors[fieldName] = validation.error;
      isFormValid = false;
    }
  });

  return {
    isValid: isFormValid,
    errors
  };
};

/**
 * Validates data for a specific step in the generation process
 * @param {number} step - Step number (1-4)
 * @param {object} formData - Form data object
 * @returns {object} Validation result for the step
 */
export const validateStep = (step, formData) => {
  const stepFields = {
    1: ['bookContent'],
    2: ['audienceClass', 'audienceAge', 'audienceRegion'],
    3: ['outputWordCount', 'customInstructions'],
    4: ['bookContent', 'audienceClass', 'audienceAge', 'audienceRegion'] // Final validation
  };

  const fieldsToValidate = stepFields[step] || [];
  const errors = {};
  let isStepValid = true;

  // Special handling for Step 3 - require at least one optional field to have content
  if (step === 3) {
    const hasWordCount = formData.outputWordCount && formData.outputWordCount.trim() !== '';
    const hasCustomInstructions = formData.customInstructions && formData.customInstructions.trim() !== '';
    
    // Validate individual fields for format/type errors
    fieldsToValidate.forEach(fieldName => {
      const validation = validateField(fieldName, formData[fieldName] || '');
      if (!validation.isValid) {
        errors[fieldName] = validation.error;
        isStepValid = false;
      }
    });
    
    // Step 3 is only valid if at least one field has content AND no format errors
    if (isStepValid && !hasWordCount && !hasCustomInstructions) {
      isStepValid = false;
    }
  } else {
    // Standard validation for other steps
    fieldsToValidate.forEach(fieldName => {
      const validation = validateField(fieldName, formData[fieldName] || '');
      if (!validation.isValid) {
        errors[fieldName] = validation.error;
        isStepValid = false;
      }
    });
  }

  return {
    isValid: isStepValid,
    errors,
    fieldsValidated: fieldsToValidate
  };
};

/**
 * Gets character/word count information for display
 * @param {string} value - Text value to analyze
 * @param {string} fieldName - Name of the field for specific rules
 * @returns {object} Count information and status
 */
export const getFieldInfo = (value, fieldName) => {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) return null;

  const length = value ? value.length : 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(word => word.length > 0).length : 0;

  let status = 'normal';
  let message = '';

  if (rules.required && length === 0) {
    status = 'error';
    message = 'Required field';
  } else if (rules.minLength && length < rules.minLength) {
    status = 'warning';
    message = `${rules.minLength - length} more characters needed`;
  } else if (rules.maxLength && length > rules.maxLength) {
    status = 'error';
    message = `${length - rules.maxLength} characters over limit`;
  } else if (length > 0) {
    status = 'success';
    message = 'Valid';
  }

  return {
    charCount: length,
    wordCount,
    status,
    message,
    maxLength: rules.maxLength,
    minLength: rules.minLength
  };
};

/**
 * Checks if navigation to next step should be allowed
 * @param {number} currentStep - Current step number
 * @param {object} formData - Form data object
 * @returns {boolean} Whether navigation is allowed
 */
export const canNavigateToNextStep = (currentStep, formData) => {
  const stepValidation = validateStep(currentStep, formData);
  return stepValidation.isValid;
};

/**
 * Gets a summary of validation errors for display
 * @param {object} errors - Errors object from validation
 * @returns {string} Summary message
 */
export const getValidationSummary = (errors) => {
  const errorCount = Object.keys(errors).length;
  if (errorCount === 0) return '';
  
  if (errorCount === 1) {
    return `1 field needs attention: ${Object.values(errors)[0]}`;
  }
  
  return `${errorCount} fields need attention. Please check the highlighted fields.`;
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Whether password meets strength requirements
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Password must be at least 8 characters and contain:
  // - At least one lowercase letter
  // - At least one uppercase letter
  // - At least one number
  // - At least one special character
  const minLength = 8;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasLowerCase && 
         hasUpperCase && 
         hasNumber && 
         hasSpecialChar;
};

/**
 * Validates content input object
 * @param {object} input - Content input object to validate
 * @returns {boolean} Whether input is valid
 */
export const validateContentInput = (input) => {
  if (!input || typeof input !== 'object') {
    return false;
  }
  
  const requiredFields = ['bookContent', 'audienceClass', 'audienceAge', 'audienceRegion'];
  
  return requiredFields.every(field => {
    const value = input[field];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
};

/**
 * Sanitizes input by removing dangerous HTML and encoding special characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove other dangerous tags
  sanitized = sanitized.replace(/<(script|object|embed|link|style|img|iframe)[^>]*>/gi, '');
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized;
};
