import React, { useState, useEffect } from 'react';

const VoiceFeedback = ({ message, type = 'success', duration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!message || !isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="flex items-center mr-2">
            <span className="text-sm mr-1">✅</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center mr-2">
            <span className="text-sm mr-1">❌</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="flex items-center mr-2">
            <span className="text-sm mr-1">🎤</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v-3m-4.5 0h9M19 11A7 7 0 1110.05 4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center mr-2">
            <span className="text-sm mr-1">📢</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className={`border px-4 py-3 rounded-lg shadow-lg flex items-center ${getTypeStyles()}`}>
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default VoiceFeedback;
