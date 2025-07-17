/**
 * ECC Notification Service - Phase 1 Implementation
 * 
 * This service provides intelligent notification management with:
 * - Dynamic priority assignment (CRITICAL, HIGH, MEDIUM, LOW)
 * - Smart grouping and batching of related notifications
 * - Contextual timing and positioning logic
 * - Performance optimization with minimal client-side processing
 */

// Notification Priority Levels
export const NOTIFICATION_PRIORITY = {
  CRITICAL: 'CRITICAL',    // System errors, payment failures, security alerts
  HIGH: 'HIGH',           // Feature restrictions, trial expiry, new messages
  MEDIUM: 'MEDIUM',       // Success operations, completions, info messages
  LOW: 'LOW'              // Tips, suggestions, feature discovery
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  CONFIRMATION: 'confirmation',
  ACHIEVEMENT: 'achievement',
  FEATURE_HIGHLIGHT: 'feature_highlight',
  ONBOARDING: 'onboarding'
};

// Notification Categories for grouping
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  CONTENT_OPERATIONS: 'content_operations',
  CHAT: 'chat',
  TIER_MANAGEMENT: 'tier_management',
  AUTHENTICATION: 'authentication',
  SETTINGS: 'settings',
  ONBOARDING: 'onboarding'
};

// Notification positioning contexts
export const NOTIFICATION_CONTEXTS = {
  GLOBAL: 'global',
  CHAT: 'chat',
  CONTENT_GENERATION: 'content_generation',
  SETTINGS: 'settings',
  INLINE: 'inline'
};

// Celebration levels for emotional design
export const CELEBRATION_LEVELS = {
  MILESTONE: 'milestone',     // Full party celebration (Three.js)
  ACHIEVEMENT: 'achievement', // Sparkles and light glow
  PROGRESS: 'progress',       // Progressive fill animations
  SUBTLE: 'subtle'           // Minimal micro-animations
};

// Do Not Disturb modes
export const DND_MODES = {
  OFF: 'off',
  QUIET_HOURS: 'quiet_hours',
  CRITICAL_ONLY: 'critical_only',
  FOCUS_MODE: 'focus_mode'
};

class NotificationService {
  constructor() {
    this.notifications = new Map();
    this.groupingRules = new Map();
    this.contextHistory = [];
    this.dndMode = DND_MODES.OFF;
    this.quietHours = { start: '22:00', end: '08:00' };
    this.currentContext = NOTIFICATION_CONTEXTS.GLOBAL;
    this.lastInteractionTime = Date.now();
    this.preferences = {
      soundEnabled: false,
      autoDismiss: true,
      maxNotifications: 5,
      enabledTypes: {
        success: true,
        error: true,
        warning: true,
        info: true,
        achievement: true
      },
      celebrationLevel: CELEBRATION_LEVELS.ACHIEVEMENT,
      reducedMotion: false
    };
    
    // Initialize service
    this.setupGroupingRules();
    this.setupDynamicPrioritization();
    this.loadPreferences();
    this.loadDndSettings();
    this.processScheduledNotifications();
  }

  /**
   * Setup intelligent grouping rules for related notifications
   */
  setupGroupingRules() {
    // Content operations grouping: 3+ similar operations within 30 seconds
    this.groupingRules.set(NOTIFICATION_CATEGORIES.CONTENT_OPERATIONS, {
      maxCount: 3,
      timeWindow: 30000, // 30 seconds
      groupMessage: (count) => `${count} content operations completed`,
      shouldGroup: (notifications) => notifications.length >= 3
    });

    // Chat message grouping: 5+ messages within 10 seconds
    this.groupingRules.set(NOTIFICATION_CATEGORIES.CHAT, {
      maxCount: 5,
      timeWindow: 10000, // 10 seconds
      groupMessage: (count) => `${count} new messages received`,
      shouldGroup: (notifications) => notifications.length >= 5
    });

    // System notifications: Don't group critical system messages
    this.groupingRules.set(NOTIFICATION_CATEGORIES.SYSTEM, {
      maxCount: 1,
      timeWindow: 0,
      shouldGroup: () => false
    });
  }

  /**
   * Setup dynamic prioritization rules for adaptive intelligence
   */
  setupDynamicPrioritization() {
    // Extend prioritization logic with contextual adaptation
    this.dynamicRules = {
      learningPatterns: [], // Placeholder for future pattern learning
      featureUsageHistory: [], // Placeholder for usage-based adaptations
    };
  }

  /**
   * Intelligent priority assignment based on notification content and context
   */
  determinePriority(notificationData) {
    const { type, category, context, metadata = {} } = notificationData;

    // CRITICAL priority conditions
    if (type === NOTIFICATION_TYPES.ERROR && (
      category === NOTIFICATION_CATEGORIES.SYSTEM ||
      metadata.isBlocking ||
      metadata.isSecurityRelated
    )) {
      return NOTIFICATION_PRIORITY.CRITICAL;
    }

    // HIGH priority conditions
    if (
      (type === NOTIFICATION_TYPES.WARNING && category === NOTIFICATION_CATEGORIES.TIER_MANAGEMENT) ||
      (category === NOTIFICATION_CATEGORIES.CHAT && metadata.isDirectMessage) ||
      (category === NOTIFICATION_CATEGORIES.AUTHENTICATION && type === NOTIFICATION_TYPES.ERROR) ||
      (metadata.requiresAction && metadata.isUrgent)
    ) {
      return NOTIFICATION_PRIORITY.HIGH;
    }

    // MEDIUM priority conditions
    if (
      type === NOTIFICATION_TYPES.SUCCESS ||
      type === NOTIFICATION_TYPES.INFO ||
      (type === NOTIFICATION_TYPES.WARNING && !metadata.isUrgent)
    ) {
      return NOTIFICATION_PRIORITY.MEDIUM;
    }

    // LOW priority (default for tips, suggestions, onboarding)
    return NOTIFICATION_PRIORITY.LOW;
  }

  /**
   * Smart positioning based on current context and notification priority
   */
  determinePosition(notificationData, currentContext) {
    const { priority, category, metadata = {} } = notificationData;

    // CRITICAL notifications always get center modal
    if (priority === NOTIFICATION_PRIORITY.CRITICAL) {
      return { 
        type: 'modal',
        position: 'center',
        blocking: true,
        dismissible: false
      };
    }

    // Context-specific positioning
    switch (currentContext) {
      case NOTIFICATION_CONTEXTS.CHAT:
        return {
          type: 'toast',
          position: 'top-right',
          offsetY: 32, // Account for chat header
          maxWidth: 'sm'
        };

      case NOTIFICATION_CONTEXTS.CONTENT_GENERATION:
        if (category === NOTIFICATION_CATEGORIES.CONTENT_OPERATIONS) {
          return {
            type: 'inline',
            position: 'below-form',
            contextual: true
          };
        }
        break;

      case NOTIFICATION_CONTEXTS.SETTINGS:
        return {
          type: 'toast',
          position: 'top-right',
          offsetY: 20
        };

      default:
        return {
          type: 'toast',
          position: 'top-right',
          offsetY: 20
        };
    }

    // Default positioning
    return {
      type: 'toast',
      position: 'top-right',
      offsetY: 20
    };
  }

  /**
   * Create optimized notification payload for client
   */
  createNotification(notificationData) {
    const id = this.generateId();
    const timestamp = Date.now();
    const priority = this.determinePriority(notificationData);
    const position = this.determinePosition(notificationData, notificationData.context);

    // Enhanced notification object
    const notification = {
      id,
      timestamp,
      priority,
      position,
      type: notificationData.type,
      category: notificationData.category,
      message: notificationData.message,
      title: notificationData.title,
      
      // Display configuration
      duration: this.calculateDuration(priority, notificationData.type),
      dismissible: priority !== NOTIFICATION_PRIORITY.CRITICAL,
      persistent: notificationData.persistent || false,
      
      // Interaction configuration
      actions: notificationData.actions || [],
      onConfirm: notificationData.onConfirm,
      onCancel: notificationData.onCancel,
      
      // Animation configuration
      animations: this.getAnimationConfig(notificationData.type, priority),
      
      // Metadata
      metadata: {
        ...notificationData.metadata,
        userContext: notificationData.context,
        isGrouped: false,
        groupId: null
      }
    };

    return notification;
  }

  /**
   * Calculate optimal display duration based on priority and type
   */
  calculateDuration(priority, type) {
    const baseDurations = {
      [NOTIFICATION_PRIORITY.CRITICAL]: 0, // Never auto-dismiss
      [NOTIFICATION_PRIORITY.HIGH]: 8000,  // 8 seconds
      [NOTIFICATION_PRIORITY.MEDIUM]: 5000, // 5 seconds
      [NOTIFICATION_PRIORITY.LOW]: 3000    // 3 seconds
    };

    // Adjust for confirmation types
    if (type === NOTIFICATION_TYPES.CONFIRMATION) {
      return 0; // Never auto-dismiss confirmations
    }

    // Adjust for achievement types (show longer for celebration)
    if (type === NOTIFICATION_TYPES.ACHIEVEMENT) {
      return Math.max(baseDurations[priority], 6000);
    }

    return baseDurations[priority];
  }

  /**
   * Get animation configuration for notification type and priority
   */
  getAnimationConfig(type, priority) {
    const configs = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        enter: 'bounce-gentle',
        icon: 'checkmark-animate',
        shake: false
      },
      [NOTIFICATION_TYPES.ERROR]: {
        enter: 'shake-subtle',
        icon: 'error-pulse',
        shake: true
      },
      [NOTIFICATION_TYPES.WARNING]: {
        enter: 'pulse-gentle',
        icon: 'warning-glow',
        shake: false
      },
      [NOTIFICATION_TYPES.INFO]: {
        enter: 'slide-smooth',
        icon: 'info-fade',
        shake: false
      },
      [NOTIFICATION_TYPES.ACHIEVEMENT]: {
        enter: 'celebration-bounce',
        icon: 'star-sparkle',
        shake: false,
        particles: true
      }
    };

    return configs[type] || configs[NOTIFICATION_TYPES.INFO];
  }

  /**
   * Process notification with intelligent grouping
   */
  processNotification(notificationData) {
    // Check Do Not Disturb mode
    if (!this.shouldShowNotification(notificationData)) {
      console.log('🔕 Notification blocked by Do Not Disturb mode');
      return null;
    }

    const notification = this.createNotification(notificationData);
    
    // Check for grouping opportunities
    const groupedNotification = this.attemptGrouping(notification);
    
    // Store in notifications map
    this.notifications.set(notification.id, groupedNotification);
    
    // Update context history
    this.updateContextHistory(notificationData.context);
    
    return groupedNotification;
  }

  /**
   * Check if notification should be shown based on DND mode and preferences
   */
  shouldShowNotification(notificationData) {
    const { type, priority } = notificationData;
    
    // Always show CRITICAL notifications
    if (this.determinePriority(notificationData) === NOTIFICATION_PRIORITY.CRITICAL) {
      return true;
    }

    // Check if notification type is enabled
    if (!this.preferences.enabledTypes[type]) {
      return false;
    }

    // Check Do Not Disturb mode
    switch (this.dndMode) {
      case DND_MODES.CRITICAL_ONLY:
        return priority === NOTIFICATION_PRIORITY.CRITICAL;
      
      case DND_MODES.FOCUS_MODE:
        return priority === NOTIFICATION_PRIORITY.CRITICAL || priority === NOTIFICATION_PRIORITY.HIGH;
      
      case DND_MODES.QUIET_HOURS:
        return !this.isQuietHours() || priority === NOTIFICATION_PRIORITY.CRITICAL;
      
      default:
        return true;
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  isQuietHours() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = this.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Set Do Not Disturb mode
   */
  setDndMode(mode) {
    this.dndMode = mode;
    console.log(`🔕 Do Not Disturb mode set to: ${mode}`);
  }

  /**
   * Set quiet hours
   */
  setQuietHours(start, end) {
    this.quietHours = { start, end };
    console.log(`🌙 Quiet hours set: ${start} - ${end}`);
  }

  /**
   * Update user preferences
   */
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    console.log('⚙️ Notification preferences updated');
    
    // Save to localStorage for persistence
    localStorage.setItem('ecc_notification_preferences', JSON.stringify(this.preferences));
  }

  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    const saved = localStorage.getItem('ecc_notification_preferences');
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
        console.log('⚙️ Notification preferences loaded from storage');
      } catch (error) {
        console.warn('Failed to load notification preferences:', error);
      }
    }
  }

  /**
   * Advanced contextual notification scheduling
   * @param {Object} notificationData - Notification data
   * @param {Object} schedule - Schedule configuration
   */
  scheduleNotification(notificationData, schedule) {
    const { delay, conditions, recurring } = schedule;
    
    const scheduleId = this.generateId();
    const scheduledTime = Date.now() + delay;
    
    const scheduleData = {
      id: scheduleId,
      notificationData,
      scheduledTime,
      conditions,
      recurring,
      created: Date.now()
    };
    
    // Store in localStorage for persistence across sessions
    const scheduled = JSON.parse(localStorage.getItem('ecc_scheduled_notifications') || '[]');
    scheduled.push(scheduleData);
    localStorage.setItem('ecc_scheduled_notifications', JSON.stringify(scheduled));
    
    // Set timeout for execution
    setTimeout(() => {
      this.executeScheduledNotification(scheduleId);
    }, delay);
    
    return scheduleId;
  }

  /**
   * Execute scheduled notification
   */
  executeScheduledNotification(scheduleId) {
    const scheduled = JSON.parse(localStorage.getItem('ecc_scheduled_notifications') || '[]');
    const notification = scheduled.find(n => n.id === scheduleId);
    
    if (!notification) return;
    
    // Check conditions before showing
    if (notification.conditions && !this.checkConditions(notification.conditions)) {
      console.log('🕐 Scheduled notification conditions not met:', scheduleId);
      return;
    }
    
    // Process the notification
    this.processNotification(notification.notificationData);
    
    // Handle recurring notifications
    if (notification.recurring) {
      this.scheduleNotification(notification.notificationData, {
        delay: notification.recurring.interval,
        conditions: notification.conditions,
        recurring: notification.recurring
      });
    }
    
    // Remove from scheduled list if not recurring
    if (!notification.recurring) {
      const updated = scheduled.filter(n => n.id !== scheduleId);
      localStorage.setItem('ecc_scheduled_notifications', JSON.stringify(updated));
    }
  }

  /**
   * Check notification conditions
   */
  checkConditions(conditions) {
    const { userActivity, context, timeRange } = conditions;
    
    // Check user activity level
    if (userActivity) {
      const lastActivity = Date.now() - this.lastInteractionTime;
      if (lastActivity > userActivity.maxInactivity) {
        return false;
      }
    }
    
    // Check context requirements
    if (context && context !== this.currentContext) {
      return false;
    }
    
    // Check time range
    if (timeRange) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMinute] = timeRange.start.split(':').map(Number);
      const [endHour, endMinute] = timeRange.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      if (currentTime < startTime || currentTime > endTime) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * A/B Testing framework for notifications
   */
  createABTest(testName, variants, config = {}) {
    const testId = `ab_test_${testName}_${Date.now()}`;
    const { userSegment, duration = 7 * 24 * 60 * 60 * 1000 } = config; // 7 days default
    
    const abTest = {
      id: testId,
      name: testName,
      variants,
      userSegment,
      startTime: Date.now(),
      endTime: Date.now() + duration,
      results: variants.reduce((acc, variant) => {
        acc[variant.id] = { shown: 0, interactions: 0, conversions: 0 };
        return acc;
      }, {})
    };
    
    // Store test configuration
    const tests = JSON.parse(localStorage.getItem('ecc_ab_tests') || '[]');
    tests.push(abTest);
    localStorage.setItem('ecc_ab_tests', JSON.stringify(tests));
    
    return testId;
  }

  /**
   * Get A/B test variant for notification
   */
  getABVariant(testName, userId) {
    const tests = JSON.parse(localStorage.getItem('ecc_ab_tests') || '[]');
    const test = tests.find(t => t.name === testName && Date.now() < t.endTime);
    
    if (!test) return null;
    
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId + testName);
    const variantIndex = hash % test.variants.length;
    
    return test.variants[variantIndex];
  }

  /**
   * Simple hash function for A/B testing
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Track A/B test interaction
   */
  trackABInteraction(testName, variantId, interactionType) {
    const tests = JSON.parse(localStorage.getItem('ecc_ab_tests') || '[]');
    const testIndex = tests.findIndex(t => t.name === testName);
    
    if (testIndex === -1) return;
    
    const test = tests[testIndex];
    if (!test.results[variantId]) return;
    
    test.results[variantId][interactionType]++;
    
    tests[testIndex] = test;
    localStorage.setItem('ecc_ab_tests', JSON.stringify(tests));
  }

  /**
   * Advanced user behavior learning
   */
  learnUserBehavior(interaction) {
    const { type, context, time, response } = interaction;
    
    if (!this.userBehaviorData) {
      this.userBehaviorData = {
        preferences: {},
        patterns: {},
        optimalTimes: {},
        contextualResponses: {}
      };
    }
    
    // Learn preferred notification times
    const hour = new Date(time).getHours();
    if (!this.userBehaviorData.optimalTimes[hour]) {
      this.userBehaviorData.optimalTimes[hour] = { positive: 0, negative: 0 };
    }
    
    if (response === 'positive') {
      this.userBehaviorData.optimalTimes[hour].positive++;
    } else if (response === 'negative') {
      this.userBehaviorData.optimalTimes[hour].negative++;
    }
    
    // Learn contextual preferences
    if (!this.userBehaviorData.contextualResponses[context]) {
      this.userBehaviorData.contextualResponses[context] = {};
    }
    
    if (!this.userBehaviorData.contextualResponses[context][type]) {
      this.userBehaviorData.contextualResponses[context][type] = { positive: 0, negative: 0 };
    }
    
    this.userBehaviorData.contextualResponses[context][type][response]++;
    
    // Save learned data
    localStorage.setItem('ecc_user_behavior_data', JSON.stringify(this.userBehaviorData));
  }

  /**
   * Get optimal notification timing based on learned behavior
   */
  getOptimalTiming(notificationType, context) {
    const behaviorData = JSON.parse(localStorage.getItem('ecc_user_behavior_data') || '{}');
    
    if (!behaviorData.optimalTimes) return null;
    
    // Find hour with highest positive response rate
    let bestHour = null;
    let bestScore = 0;
    
    Object.entries(behaviorData.optimalTimes).forEach(([hour, data]) => {
      const total = data.positive + data.negative;
      if (total > 5) { // Minimum sample size
        const score = data.positive / total;
        if (score > bestScore) {
          bestScore = score;
          bestHour = parseInt(hour);
        }
      }
    });
    
    return bestHour;
  }

  /**
   * Load DND settings from localStorage
   */
  loadDndSettings() {
    const saved = localStorage.getItem('ecc_dnd_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.dndMode = settings.dndMode || DND_MODES.OFF;
        this.quietHours = settings.quietHours || { start: '22:00', end: '08:00' };
        console.log('🔕 DND settings loaded from storage');
      } catch (error) {
        console.warn('Failed to load DND settings:', error);
      }
    }
  }

  /**
   * Save DND settings to localStorage
   */
  saveDndSettings() {
    const settings = {
      dndMode: this.dndMode,
      quietHours: this.quietHours
    };
    localStorage.setItem('ecc_dnd_settings', JSON.stringify(settings));
  }

  /**
   * Process scheduled notifications on startup
   */
  processScheduledNotifications() {
    const scheduled = JSON.parse(localStorage.getItem('ecc_scheduled_notifications') || '[]');
    const now = Date.now();
    
    scheduled.forEach(notification => {
      const timeUntilExecution = notification.scheduledTime - now;
      
      if (timeUntilExecution > 0) {
        // Schedule future notification
        setTimeout(() => {
          this.executeScheduledNotification(notification.id);
        }, timeUntilExecution);
      } else {
        // Process overdue notification immediately
        this.executeScheduledNotification(notification.id);
      }
    });
  }

  /**
   * Update current context
   */
  updateCurrentContext(context) {
    this.currentContext = context;
    this.lastInteractionTime = Date.now();
  }

  /**
   * Get notification history for persistence
   */
  getNotificationHistory() {
    const history = JSON.parse(localStorage.getItem('ecc_notification_history') || '[]');
    return history.slice(-100); // Keep last 100 notifications
  }

  /**
   * Save notification to history
   */
  saveToHistory(notification) {
    const history = this.getNotificationHistory();
    history.push({
      ...notification,
      dismissedAt: Date.now()
    });
    
    // Keep only last 100 notifications
    if (history.length > 100) {
      history.shift();
    }
    
    localStorage.setItem('ecc_notification_history', JSON.stringify(history));
  }

  /**
   * Clear notification history
   */
  clearHistory() {
    localStorage.removeItem('ecc_notification_history');
  }

  /**
   * Attempt to group notification with existing similar notifications
   */
  attemptGrouping(notification) {
    const { category, timestamp } = notification;
    const groupingRule = this.groupingRules.get(category);
    
    if (!groupingRule || !groupingRule.shouldGroup) {
      return notification;
    }

    // Find similar notifications within time window
    const similarNotifications = Array.from(this.notifications.values())
      .filter(n => 
        n.category === category &&
        !n.metadata.isGrouped &&
        (timestamp - n.timestamp) <= groupingRule.timeWindow
      );

    if (groupingRule.shouldGroup(similarNotifications)) {
      // Create grouped notification
      const groupId = this.generateId();
      const count = similarNotifications.length + 1;
      
      // Mark existing notifications as grouped
      similarNotifications.forEach(n => {
        n.metadata.isGrouped = true;
        n.metadata.groupId = groupId;
      });

      // Create new grouped notification
      return {
        ...notification,
        id: groupId,
        message: groupingRule.groupMessage(count),
        metadata: {
          ...notification.metadata,
          isGrouped: true,
          groupId: groupId,
          groupCount: count,
          originalNotifications: similarNotifications.map(n => n.id)
        }
      };
    }

    return notification;
  }

  /**
   * Update context history for better positioning decisions
   */
  updateContextHistory(context) {
    this.contextHistory.push({
      context,
      timestamp: Date.now()
    });

    // Keep only last 10 context changes
    if (this.contextHistory.length > 10) {
      this.contextHistory.shift();
    }
  }

  /**
   * Generate unique notification ID
   */
  generateId() {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all active notifications sorted by priority
   */
  getActiveNotifications() {
    const priorityOrder = [
      NOTIFICATION_PRIORITY.CRITICAL,
      NOTIFICATION_PRIORITY.HIGH,
      NOTIFICATION_PRIORITY.MEDIUM,
      NOTIFICATION_PRIORITY.LOW
    ];

    return Array.from(this.notifications.values())
      .filter(n => !n.metadata.isGrouped || n.metadata.groupId === n.id)
      .sort((a, b) => {
        const aPriorityIndex = priorityOrder.indexOf(a.priority);
        const bPriorityIndex = priorityOrder.indexOf(b.priority);
        
        if (aPriorityIndex !== bPriorityIndex) {
          return aPriorityIndex - bPriorityIndex;
        }
        
        return b.timestamp - a.timestamp;
      });
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id) {
    this.notifications.delete(id);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.clear();
  }

  /**
   * Get notification statistics for performance monitoring
   */
  getStats() {
    const notifications = Array.from(this.notifications.values());
    const stats = {
      total: notifications.length,
      byPriority: {},
      byCategory: {},
      byType: {},
      grouped: notifications.filter(n => n.metadata.isGrouped).length,
      averageLifetime: 0
    };

    notifications.forEach(n => {
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
      stats.byCategory[n.category] = (stats.byCategory[n.category] || 0) + 1;
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Convenience functions for common notification types
export const createSuccessNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export const createErrorNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.ERROR,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export const createWarningNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.WARNING,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export const createInfoNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.INFO,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export const createConfirmationNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.CONFIRMATION,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    persistent: true,
    ...options
  });
};

export const createAchievementNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.ACHIEVEMENT,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export const createContentOperationNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    category: NOTIFICATION_CATEGORIES.CONTENT_OPERATIONS,
    message,
    context: NOTIFICATION_CONTEXTS.CONTENT_GENERATION,
    ...options
  });
};

export const createTierNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.WARNING,
    category: NOTIFICATION_CATEGORIES.TIER_MANAGEMENT,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export const createOnboardingNotification = (message, options = {}) => {
  return notificationService.processNotification({
    type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
    category: NOTIFICATION_CATEGORIES.ONBOARDING,
    message,
    context: NOTIFICATION_CONTEXTS.GLOBAL,
    ...options
  });
};

export default notificationService;
