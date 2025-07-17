import React, { useState, useEffect, useCallback } from 'react';

const ToastNotification = React.memo(({
  message, 
  type = 'success', 
  duration = 5000,
  title,
  onClose,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = '',
  isLoading = false,
  persistent = false, // For confirmation toasts that don't auto-dismiss
  position = 'default', // 'default', 'chat'
  displayPosition, // For vertical stacking
  stackIndex = 0, // For z-index management
  // Support for extended confirmation options
  ...confirmOptions
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto-dismiss for non-confirmation types unless persistent
      if (type !== 'confirmation' && !persistent && duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [message, type, duration, persistent, handleClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && onClose) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose, handleClose]);

  if (!message || !isVisible) return null;

  const isConfirmation = type === 'confirmation';

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      case 'confirmation':
        return 'bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="flex items-center mr-2 flex-shrink-0">
            <span className="text-lg mr-1">✅</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center mr-2 flex-shrink-0">
            <span className="text-lg mr-1">❌</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="flex items-center mr-2 flex-shrink-0">
            <span className="text-lg mr-1">ℹ️</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center mr-2 flex-shrink-0">
            <span className="text-lg mr-1">⚠️</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'confirmation':
        return (
          <div className="flex items-center mr-2 flex-shrink-0">
            <span className="text-lg mr-1">🤔</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center mr-2 flex-shrink-0">
            <span className="text-lg mr-1">📢</span>
          </div>
        );
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error!';
      case 'info':
        return 'Information';
      case 'warning':
        return 'Warning!';
      case 'confirmation':
        return 'Confirm Action';
      default:
        return 'Notification';
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'fixed right-4 transition-all duration-300 ease-out';
    
    // Use displayPosition if available for vertical stacking
    if (displayPosition) {
      const zIndex = displayPosition.zIndex || (1000 - stackIndex);
      return `${baseClasses} z-[${zIndex}]`;
    }
    
    // Fallback to original positioning
    switch (position) {
      case 'chat':
        return `${baseClasses} top-32 z-50`;
      default:
        return `${baseClasses} top-20 z-50`;
    }
  };
  
  const getPositionStyles = () => {
    if (displayPosition) {
      return {
        top: `${displayPosition.offsetY || 20}px`
      };
    }
    return {};
  };

  return (
    <div 
      className={`${getPositionClasses()} ${
        isLeaving ? 'animate-slide-out-right opacity-0 scale-95' : 'animate-slide-in-right'
      }`}
      style={getPositionStyles()}
    >
      <div className={`border px-4 py-3 rounded-lg shadow-lg ${getTypeStyles()} ${position === 'chat' ? 'max-w-sm w-80' : ''}`}>
        {/* Header with title and close button */}
        {(title || isConfirmation) && (
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              {getIcon()}
              <h3 className="text-sm font-semibold">{title || getDefaultTitle()}</h3>
            </div>
            {onClose && (
              <button
                onClick={handleClose}
                className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Simple message for non-titled toasts */}
        {!title && !isConfirmation && (
          <div className="flex items-center">
            {getIcon()}
            <span className="text-sm font-medium">{message}</span>
            {onClose && (
              <button
                onClick={handleClose}
                className="ml-auto text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Message content for titled toasts */}
        {(title || isConfirmation) && (
          <div>
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {/* Action buttons for confirmation type */}
        {isConfirmation && (
          <div className="flex space-x-3 justify-end mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onCancel || handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                confirmButtonClass || 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {confirmText}
            </button>
          </div>
        )}

        {/* ESC key hint for confirmation dialogs */}
        {isConfirmation && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-center">
              Press ESC to cancel
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ToastNotification.displayName = 'ToastNotification';

export default ToastNotification;
