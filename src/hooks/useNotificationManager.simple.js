/**
 * Simplified Notification Manager Hook - Temporary Fix
 * This is a minimal implementation to bypass the React hooks issue
 */

import React from 'react';

// Simple constants
const NOTIFICATION_CONTEXTS = {
  GLOBAL: 'global',
  CONTENT: 'content',
  USER: 'user'
};

const DND_MODES = {
  OFF: 'off',
  ON: 'on',
  SCHEDULED: 'scheduled'
};

export const useNotificationManager = (options = {}) => {
  // Return static methods that don't use hooks for now
  return {
    // Core state - empty for now
    notifications: [],
    displayQueue: [],
    currentContext: NOTIFICATION_CONTEXTS.GLOBAL,
    
    // Actions - stub functions
    addNotification: (notificationData) => {
      console.log('Notification would be added:', notificationData);
      return { id: Date.now(), ...notificationData };
    },
    removeNotification: (id) => {
      console.log('Notification would be removed:', id);
    },
    updateContext: (newContext) => {
      console.log('Context would be updated to:', newContext);
    },
    clearAll: () => {
      console.log('All notifications would be cleared');
    },
    
    // DND and Preferences - stub
    dndMode: DND_MODES.OFF,
    updateDndMode: (mode) => {
      console.log('DND mode would be updated to:', mode);
    },
    quietHoursState: { start: '22:00', end: '08:00' },
    updateQuietHours: (start, end) => {
      console.log('Quiet hours would be updated to:', start, '-', end);
    },
    
    // Convenience methods - stub functions
    showSuccess: (message, options = {}) => {
      console.log('Success notification:', message, options);
      return { id: Date.now(), type: 'success', message, ...options };
    },
    showError: (message, options = {}) => {
      console.log('Error notification:', message, options);
      return { id: Date.now(), type: 'error', message, ...options };
    },
    showWarning: (message, options = {}) => {
      console.log('Warning notification:', message, options);
      return { id: Date.now(), type: 'warning', message, ...options };
    },
    showInfo: (message, options = {}) => {
      console.log('Info notification:', message, options);
      return { id: Date.now(), type: 'info', message, ...options };
    },
    showConfirmation: (message, options = {}) => {
      console.log('Confirmation notification:', message, options);
      return { id: Date.now(), type: 'confirmation', message, ...options };
    },
    showAchievement: (message, options = {}) => {
      console.log('Achievement notification:', message, options);
      return { id: Date.now(), type: 'achievement', message, ...options };
    },
    
    // Performance and debugging - empty
    performanceStats: {
      totalShown: 0,
      totalDismissed: 0,
      averageDisplayTime: 0,
      activeCount: 0,
      queuedCount: 0,
      totalActive: 0
    },
    
    // Configuration
    maxNotifications: options.maxNotifications || 5,
    enableKeyboardNavigation: options.enableKeyboardNavigation !== false,
    enableSounds: options.enableSounds || false
  };
};

export default useNotificationManager;
