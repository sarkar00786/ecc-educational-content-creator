/**
 * Enhanced Notification Manager Hook - Phase 1 Implementation
 * 
 * This hook provides intelligent client-side notification management with:
 * - Centralized state management for all notifications
 * - Smart display queue with priority-based rendering
 * - Performance optimization for smooth UI/UX
 * - Content-focused notification management
 * - Accessibility features and keyboard navigation
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Safety check to ensure React is properly loaded
if (!React || typeof React.useState !== 'function') {
  console.error('React is not properly loaded in useNotificationManager');
  throw new Error('React hooks are not available - React may not be properly initialized');
}
import { notificationService, NOTIFICATION_PRIORITY, NOTIFICATION_CONTEXTS, DND_MODES } from '../services/notificationService';
import { progressiveOnboardingService } from '../services/progressiveOnboardingService';

const MAX_SIMULTANEOUS_NOTIFICATIONS = 5;
const NOTIFICATION_STACK_SPACING = 10; // px between stacked notifications

export const useNotificationManager = (options = {}) => {

  const {
    maxNotifications = MAX_SIMULTANEOUS_NOTIFICATIONS,
    enableKeyboardNavigation = true,
    enableSounds = false,
    defaultContext = NOTIFICATION_CONTEXTS.GLOBAL,
    initialDndMode = DND_MODES.OFF,
    quietHours = { start: '22:00', end: '08:00' }
  } = options;

  // DND Mode state management
  const [dndMode, setDndMode] = useState(initialDndMode);
  const [quietHoursState, setQuietHoursState] = useState(quietHours);

  // Core state management
  const [notifications, setNotifications] = useState([]);
  const [displayQueue, setDisplayQueue] = useState([]);
  const [currentContext, setCurrentContext] = useState(defaultContext);
  const [isQueueProcessing, setIsQueueProcessing] = useState(false);

  // Performance tracking
  const [performance, setPerformance] = useState({
    totalShown: 0,
    totalDismissed: 0,
    averageDisplayTime: 0,
    lastUpdateTime: Date.now()
  });

  // Refs for cleanup and performance
  const timeoutRefs = useRef(new Map());
  const animationRefs = useRef(new Map());
  const audioContext = useRef(null);
  const lastContextUpdate = useRef(Date.now());

  // Notification queue processing
  const processQueue = useCallback(() => {
    if (isQueueProcessing) return;
    
    setIsQueueProcessing(true);
    
    const activeNotifications = notificationService.getActiveNotifications();
    const displayableNotifications = activeNotifications.slice(0, maxNotifications);
    
    // Calculate positions for stacked notifications
    const positionedNotifications = displayableNotifications.map((notification, index) => {
      const baseOffset = notification.position?.offsetY || 20;
      const stackOffset = index * (60 + NOTIFICATION_STACK_SPACING); // 60px estimated height + spacing
      
      return {
        ...notification,
        displayPosition: {
          ...notification.position,
          offsetY: baseOffset + stackOffset,
          zIndex: 1000 - index // Higher priority = higher z-index
        },
        stackIndex: index
      };
    });
    
    setNotifications(positionedNotifications);
    setDisplayQueue(activeNotifications.slice(maxNotifications));
    setIsQueueProcessing(false);
    
    // Update performance metrics
    setPerformance(prev => ({
      ...prev,
      totalShown: prev.totalShown + positionedNotifications.length,
      lastUpdateTime: Date.now()
    }));
  }, [maxNotifications, isQueueProcessing]);

  // Remove notification from system
  const removeNotification = useCallback((id) => {
    // Clear timeout if exists
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    
    // Clear animation if exists
    const animationId = animationRefs.current.get(id);
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationRefs.current.delete(id);
    }
    
    // Remove from service
    notificationService.removeNotification(id);
    
    // Update performance metrics
    setPerformance(prev => ({
      ...prev,
      totalDismissed: prev.totalDismissed + 1
    }));
    
    // Trigger queue processing to show next notification
    processQueue();
  }, [processQueue]);

  // Play notification sound based on type and priority
  const playNotificationSound = useCallback((type, priority) => {
    if (!enableSounds) return;
    
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContext.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Different frequencies for different notification types
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500,
        achievement: 1000
      };
      
      oscillator.frequency.value = frequencies[type] || 500;
      oscillator.type = 'sine';
      
      // Volume based on priority
      const volumes = {
        [NOTIFICATION_PRIORITY.CRITICAL]: 0.8,
        [NOTIFICATION_PRIORITY.HIGH]: 0.6,
        [NOTIFICATION_PRIORITY.MEDIUM]: 0.4,
        [NOTIFICATION_PRIORITY.LOW]: 0.2
      };
      
      gainNode.gain.value = volumes[priority] || 0.4;
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2); // 200ms sound
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [enableSounds]);

  // Add notification to system
  const addNotification = useCallback((notificationData) => {
    const notification = notificationService.processNotification({
      ...notificationData,
      context: currentContext
    });
    
    // Setup auto-dismiss timer if applicable
    if (notification.duration > 0) {
      const timeoutId = setTimeout(() => {
        // Clear timeout if exists
        const currentTimeoutId = timeoutRefs.current.get(notification.id);
        if (currentTimeoutId) {
          clearTimeout(currentTimeoutId);
          timeoutRefs.current.delete(notification.id);
        }
        
        // Clear animation if exists
        const animationId = animationRefs.current.get(notification.id);
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationRefs.current.delete(notification.id);
        }
        
        // Remove from service
        notificationService.removeNotification(notification.id);
        
        // Update performance metrics
        setPerformance(prev => ({
          ...prev,
          totalDismissed: prev.totalDismissed + 1
        }));
        
        // Trigger queue processing
        processQueue();
      }, notification.duration);
      
      timeoutRefs.current.set(notification.id, timeoutId);
    }
    
    // Play notification sound if enabled
    if (enableSounds) {
      playNotificationSound(notification.type, notification.priority);
    }
    
    // Trigger queue processing
    processQueue();
    
    return notification;
  }, [currentContext, enableSounds, processQueue, playNotificationSound]);

  // Update notification context (for intelligent positioning)
  const updateContext = useCallback((newContext) => {
    setCurrentContext(newContext);
    lastContextUpdate.current = Date.now();
    
    // Update context in notification service
    notificationService.updateCurrentContext(newContext);
    
    // Re-process queue with new context
    setTimeout(processQueue, 50); // Small delay to prevent excessive processing
  }, [processQueue]);

  // Clear all notifications
  // Set Do Not Disturb Mode
  const updateDndMode = useCallback((mode) => {
    setDndMode(mode);
    notificationService.setDndMode(mode);
    console.log(`DND mode updated to: ${mode}`);
  }, []);

  // Set Quiet Hours
  const updateQuietHours = useCallback((start, end) => {
    setQuietHoursState({ start, end });
    notificationService.setQuietHours(start, end);
    console.log(`Quiet hours updated to: ${start} - ${end}`);
  }, []);

  const clearAll = useCallback(() => {
    // Clear all timers
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    
    // Clear all animations
    animationRefs.current.forEach(animationId => cancelAnimationFrame(animationId));
    animationRefs.current.clear();
    
    // Clear service
    notificationService.clearAll();
    
    // Reset state
    setNotifications([]);
    setDisplayQueue([]);
    
    // Update performance metrics
    setPerformance(prev => ({
      ...prev,
      totalDismissed: prev.totalDismissed + notifications.length
    }));
  }, [notifications.length]);

  // Keyboard navigation support
  useEffect(() => {
    if (!enableKeyboardNavigation) return;
    
    const handleKeyDown = (event) => {
      if (notifications.length === 0) return;
      
      switch (event.key) {
        case 'Escape':
          // Dismiss highest priority notification
          if (notifications.length > 0) {
            removeNotification(notifications[0].id);
          }
          break;
          
        case 'Enter':
          // Trigger first notification's primary action
          if (notifications.length > 0 && notifications[0].actions?.length > 0) {
            const primaryAction = notifications[0].actions[0];
            if (primaryAction.handler) {
              primaryAction.handler();
            }
          }
          break;
          
        case 'ArrowUp':
          // Navigate to previous notification (future enhancement)
          event.preventDefault();
          break;
          
        case 'ArrowDown':
          // Navigate to next notification (future enhancement)
          event.preventDefault();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [notifications, enableKeyboardNavigation, removeNotification]);

  // Performance monitoring
  const performanceStats = useMemo(() => ({
    ...performance,
    activeCount: notifications.length,
    queuedCount: displayQueue.length,
    totalActive: notifications.length + displayQueue.length,
    serviceStats: notificationService.getStats()
  }), [performance, notifications.length, displayQueue.length]);

  // Context-aware notification helpers
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const showConfirmation = useCallback((message, options = {}) => {
    return addNotification({
      type: 'confirmation',
      message,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const showAchievement = useCallback((message, options = {}) => {
    return addNotification({
      type: 'achievement',
      message,
      ...options
    });
  }, [addNotification]);

  // Content Generation Integration
  useEffect(() => {
    if (options.enableContentNotifications && currentContext) {
      console.log('📝 Content notification system initialized');
      // Content-specific notification handling can be added here
    }
  }, [options.enableContentNotifications, currentContext, addNotification]);
  
  // Progressive Onboarding Integration
  useEffect(() => {
    if (options.enableOnboarding && currentContext) {
      // Update onboarding context when notification context changes
      progressiveOnboardingService.updateContext(currentContext);
      
      // Listen for onboarding notifications
      const handleOnboardingNotification = (notification) => {
        console.log('🎓 Onboarding notification triggered:', notification);
        addNotification({
          ...notification,
          metadata: {
            ...notification.metadata,
            isOnboarding: true
          }
        });
      };
      
      // Set up onboarding service notification handler
      progressiveOnboardingService.addEventListener?.('notification', handleOnboardingNotification);
      
      return () => {
        progressiveOnboardingService.removeEventListener?.('notification', handleOnboardingNotification);
      };
    }
  }, [options.enableOnboarding, currentContext, addNotification]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAll();
      
      // Cleanup content notification system
      console.log('Notification system cleanup completed');
    };
  }, [clearAll]);

  // Auto-process queue when notifications change
  useEffect(() => {
    if (notifications.length < maxNotifications && displayQueue.length > 0) {
      processQueue();
    }
  }, [notifications.length, displayQueue.length, maxNotifications, processQueue]);

  return {
    // Core state
    notifications,
    displayQueue,
    currentContext,
    
    // Actions
    addNotification,
    removeNotification,
    updateContext,
    clearAll,
    
    // DND and Preferences
    dndMode,
    updateDndMode,
    quietHoursState,
    updateQuietHours,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showAchievement,
    
    // Performance and debugging
    performanceStats,
    
    // Configuration
    maxNotifications,
    enableKeyboardNavigation,
    enableSounds
  };
};

export default useNotificationManager;
