/**
 * Contextual Inline Notifications - In-situ UI Notifications
 * 
 * This component provides contextual notifications that appear directly near 
 * relevant UI elements, as specified in the plan for Phase 1 implementation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const InlineNotification = ({
  message,
  type = 'info',
  targetElement, // Element to position relative to
  targetSelector, // CSS selector for target element
  position = 'below', // 'above', 'below', 'left', 'right'
  duration = 5000,
  persistent = false,
  onClose,
  actions = [],
  className = '',
  showArrow = true,
  offset = 8 // Distance from target element
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const notificationRef = useRef(null);
  const targetRef = useRef(null);

  // Find target element
  useEffect(() => {
    if (targetElement) {
      targetRef.current = targetElement;
    } else if (targetSelector) {
      targetRef.current = document.querySelector(targetSelector);
    }
  }, [targetElement, targetSelector]);

  // Calculate position relative to target
  const calculatePosition = () => {
    if (!targetRef.current || !notificationRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const notificationRect = notificationRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;
    let finalPosition = position;

    switch (position) {
      case 'below':
        x = targetRect.left + (targetRect.width / 2) - (notificationRect.width / 2);
        y = targetRect.bottom + offset;
        
        // Check if notification would go off-screen
        if (y + notificationRect.height > viewportHeight) {
          finalPosition = 'above';
          y = targetRect.top - notificationRect.height - offset;
        }
        break;

      case 'above':
        x = targetRect.left + (targetRect.width / 2) - (notificationRect.width / 2);
        y = targetRect.top - notificationRect.height - offset;
        
        if (y < 0) {
          finalPosition = 'below';
          y = targetRect.bottom + offset;
        }
        break;

      case 'right':
        x = targetRect.right + offset;
        y = targetRect.top + (targetRect.height / 2) - (notificationRect.height / 2);
        
        if (x + notificationRect.width > viewportWidth) {
          finalPosition = 'left';
          x = targetRect.left - notificationRect.width - offset;
        }
        break;

      case 'left':
        x = targetRect.left - notificationRect.width - offset;
        y = targetRect.top + (targetRect.height / 2) - (notificationRect.height / 2);
        
        if (x < 0) {
          finalPosition = 'right';
          x = targetRect.right + offset;
        }
        break;
    }

    // Ensure notification stays within viewport bounds
    x = Math.max(8, Math.min(x, viewportWidth - notificationRect.width - 8));
    y = Math.max(8, Math.min(y, viewportHeight - notificationRect.height - 8));

    setCoordinates({ x, y });
    setActualPosition(finalPosition);
  };

  // Show notification
  useEffect(() => {
    if (message && targetRef.current) {
      setIsVisible(true);
      
      // Calculate position after render
      setTimeout(calculatePosition, 50);
      
      // Recalculate on scroll/resize
      const handleReposition = () => calculatePosition();
      window.addEventListener('scroll', handleReposition);
      window.addEventListener('resize', handleReposition);
      
      return () => {
        window.removeEventListener('scroll', handleReposition);
        window.removeEventListener('resize', handleReposition);
      };
    }
  }, [message, targetRef.current]);

  // Auto-dismiss
  useEffect(() => {
    if (isVisible && !persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, persistent, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      case 'hint':
        return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'hint':
        return '💡';
      default:
        return '📢';
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-0 h-0 border-solid';
    
    switch (actualPosition) {
      case 'below':
        return `${baseClasses} border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-current -top-2 left-1/2 transform -translate-x-1/2`;
      case 'above':
        return `${baseClasses} border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-current -bottom-2 left-1/2 transform -translate-x-1/2`;
      case 'right':
        return `${baseClasses} border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-current -left-2 top-1/2 transform -translate-y-1/2`;
      case 'left':
        return `${baseClasses} border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-current -right-2 top-1/2 transform -translate-y-1/2`;
      default:
        return '';
    }
  };

  if (!message || !isVisible) return null;

  const notificationContent = (
    <div
      ref={notificationRef}
      className={`fixed z-50 max-w-sm min-w-0 transition-all duration-300 ease-out ${className}`}
      style={{
        left: coordinates.x,
        top: coordinates.y,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div className={`relative border rounded-lg shadow-lg p-3 ${getTypeStyles()}`}>
        {/* Arrow */}
        {showArrow && (
          <div className={getArrowClasses()}></div>
        )}
        
        {/* Content */}
        <div className="flex items-start space-x-2">
          <span className="text-sm flex-shrink-0">{getIcon()}</span>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">{message}</p>
            
            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex space-x-2 mt-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.handler}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      action.primary 
                        ? 'bg-current text-white opacity-90 hover:opacity-100' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(notificationContent, document.body);
};

export default InlineNotification;
