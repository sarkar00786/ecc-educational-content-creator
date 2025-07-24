import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';

const AttachmentProgress = ({ 
  isVisible, 
  contentName, 
  onComplete, 
  // onError, // Commented out unused prop
  duration = 2000 
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('attaching'); // 'attaching', 'success', 'error'
  // const [isAnimating, setIsAnimating] = useState(false); // Commented out unused state

  useEffect(() => {
    if (isVisible) {
      setProgress(0);
      setStatus('attaching');
      // setIsAnimating(true); // Commented out since state is unused
      
      // Simulate progress with smooth animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('success');
            // setIsAnimating(false); // Commented out since state is unused
            
            // Call onComplete after a brief delay to show success state
            setTimeout(() => {
              onComplete?.();
            }, 1500);
            
            return 100;
          }
          return prev + (100 / (duration / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'attaching':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'attaching':
        return `Attaching "${contentName}" to chat...`;
      case 'success':
        return `Content "${contentName}" attached successfully!`;
      case 'error':
        return `Failed to attach "${contentName}"`;
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'attaching':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-80 max-w-sm">
      <div className="flex items-center space-x-3 mb-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      {status === 'attaching' && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Progress Percentage */}
      {status === 'attaching' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default AttachmentProgress;
