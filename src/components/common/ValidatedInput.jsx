import React, { useState, useEffect } from 'react';
import { validateField, getFieldInfo } from '../../utils/validation';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * ValidatedInput Component
 * Reusable input component with built-in validation, error display, and accessibility
 */
const ValidatedInput = ({
  fieldName,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  rows = 4, // For textarea
  showCharCount = false,
  showWordCount = false,
  helpText = '',
  icon = null,
  onValidation = null, // Callback for validation state changes
  showValidationErrors = false // New prop to control when to show errors
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [fieldInfo, setFieldInfo] = useState(null);

  // Validate field whenever value changes
  useEffect(() => {
    const validation = validateField(fieldName, value);
    const info = getFieldInfo(value, fieldName);
    
    // Only show errors when explicitly requested (form submission) or when field has been touched and showValidationErrors is true
    const shouldShowError = showValidationErrors && validation.error;
    setError(shouldShowError ? validation.error : '');
    setFieldInfo(info);
    
    // Notify parent component of validation state
    if (onValidation) {
      onValidation(fieldName, validation.isValid, validation.error);
    }
  }, [value, touched, fieldName, onValidation, showValidationErrors]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const getStatusColor = () => {
    if (error) return 'border-orange-300 focus:border-orange-400 focus:ring-orange-400/20';
    if (fieldInfo?.status === 'success' && touched) return 'border-green-300 focus:border-green-400 focus:ring-green-400/20';
    if (fieldInfo?.status === 'warning') return 'border-amber-300 focus:border-amber-400 focus:ring-amber-400/20';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400';
  };

  const getErrorIconColor = () => {
    // Skip red error styling for audienceClass and audienceAge fields
    if (error && fieldName !== 'audienceClass' && fieldName !== 'audienceAge') return 'text-orange-500';
    if (fieldInfo?.status === 'success' && touched) return 'text-green-500';
    if (fieldInfo?.status === 'warning') return 'text-amber-500';
    return 'text-gray-400';
  };

  const baseInputClasses = `
    w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
    rounded-lg transition-colors duration-200
    ${getStatusColor()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  const inputId = `input-${fieldName}`;
  const errorId = `error-${fieldName}`;
  const helpId = `help-${fieldName}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${baseInputClasses} resize-none`}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
          aria-invalid={!!error}
        />
      );
    }

    return (
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={baseInputClasses}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
        aria-invalid={!!error}
      />
    );
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`h-5 w-5 ${getErrorIconColor()}`}>
              {icon}
            </div>
          </div>
        )}

        {/* Input Field */}
        {renderInput()}

        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {error && fieldName !== 'audienceClass' && fieldName !== 'audienceAge' && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          {!error && fieldInfo?.status === 'success' && touched && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {!error && fieldInfo?.status === 'warning' && (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Character/Word Count */}
      {(showCharCount || showWordCount) && fieldInfo && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            {showCharCount && (
              <span className={fieldInfo.charCount > (fieldInfo.maxLength || Infinity) ? 'text-red-500' : ''}>
                {fieldInfo.charCount}
                {fieldInfo.maxLength && `/${fieldInfo.maxLength}`} characters
              </span>
            )}
            {showCharCount && showWordCount && ' • '}
            {showWordCount && (
              <span>{fieldInfo.wordCount} words</span>
            )}
          </div>
          {fieldInfo.message && (
            <span className={
              fieldInfo.status === 'error' ? 'text-red-500' :
              fieldInfo.status === 'warning' ? 'text-yellow-500' :
              fieldInfo.status === 'success' ? 'text-green-500' :
              'text-gray-500'
            }>
              {fieldInfo.message}
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p id={errorId} className="text-sm text-orange-600 dark:text-orange-400" role="alert">
          {error}
        </p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p id={helpId} className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;
