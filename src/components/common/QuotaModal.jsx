import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import QuotaIndicator from './QuotaIndicator';

const QuotaModal = ({ 
  isOpen, 
  onClose, 
  currentMessages = 0, 
  filesUploaded = 0, 
  totalFileSize = 0,
  dailyChatsUsed = 0,
  contentFilesUsed = 0,
  chatCardsUsed = 0
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
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleEscape, isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quota-modal-title"
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full transform transition-all duration-300 ease-out"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="quota-modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Usage & Limits
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          <QuotaIndicator
            currentMessages={currentMessages}
            filesUploaded={filesUploaded}
            totalFileSize={totalFileSize}
            dailyChatsUsed={dailyChatsUsed}
            contentFilesUsed={contentFilesUsed}
            chatCardsUsed={chatCardsUsed}
            showDetails={true}
          />
        </div>

        {/* ESC key indicator */}
        <div className="absolute top-2 right-10 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Press ESC to close
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuotaModal);
