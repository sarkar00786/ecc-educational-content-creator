import React, { useEffect, useCallback } from 'react';

const Modal = ({ 
  message, 
  type, 
  title, 
  onClose, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  confirmButtonClass = '', 
  isLoading = false 
}) => {
  // Handle escape key press
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  }, [onClose]);

  // Handle click outside modal
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget && onClose) {
      onClose();
    }
  }, [onClose]);

  // Add escape key listener
  useEffect(() => {
    if (!message) return;
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleEscape, message]);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (!message) return;
    if (type === 'success' && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose, message]);

  if (!message) return null;

  const isConfirmation = type === 'confirmation';
  const bgColor = type === 'error' ? 'bg-red-100' : type === 'confirmation' ? 'bg-white dark:bg-gray-800' : 'bg-green-100';
  const borderColor = type === 'error' ? 'border-red-400' : type === 'confirmation' ? 'border-gray-200 dark:border-gray-700' : 'border-green-400';
  const textColor = type === 'error' ? 'text-red-700' : type === 'confirmation' ? 'text-gray-900 dark:text-white' : 'text-green-700';
  const defaultTitle = type === 'error' ? 'Error!' : type === 'confirmation' ? 'Confirm Action' : 'Success!';

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-modal-in"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className={`relative ${bgColor} ${borderColor} ${textColor} px-6 py-5 rounded-xl shadow-lg max-w-md w-full border transform transition-all duration-300 ease-out animate-fade-in`}
        style={{ 
          transform: 'scale(1)', 
          opacity: '1',
          zIndex: '60'
        }}
      >
        {/* ESC key indicator */}
        <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Press ESC to close
        </div>
        
        <h3 id="modal-title" className="text-xl font-bold mb-3">{title || defaultTitle}</h3>
        <p id="modal-description" className="text-sm mb-4">{message}</p>
        
        {isConfirmation ? (
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel || onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center ${
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
        ) : (
          <button
            onClick={onClose}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(Modal);
