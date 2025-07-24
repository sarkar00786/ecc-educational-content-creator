/**
 * ECC Notification Service - Content Creation Focused
 * Chat-related functionality moved to Magic-Chat/extracted/notificationService.js
 */

// Notification Priority Levels
export const NOTIFICATION_PRIORITY = {
  CRITICAL: 'CRITICAL',    // System errors, security alerts
  HIGH: 'HIGH',           // Feature restrictions, trial expiry
  MEDIUM: 'MEDIUM',       // Success operations, completions
  LOW: 'LOW'              // Tips, suggestions
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

// Content-focused notification categories
export const NOTIFICATION_CATEGORIES = {
  SYSTEM: 'system',
  CONTENT_OPERATIONS: 'content_operations',
  TIER_MANAGEMENT: 'tier_management',
  AUTHENTICATION: 'authentication',
  SETTINGS: 'settings',
  ONBOARDING: 'onboarding'
};

// Notification positioning contexts (no chat)
export const NOTIFICATION_CONTEXTS = {
  GLOBAL: 'global',
  CONTENT_GENERATION: 'content_generation',
  SETTINGS: 'settings',
  INLINE: 'inline'
};

// Celebration levels for content generation
export const CELEBRATION_LEVELS = {
  MILESTONE: 'milestone',     // Full party celebration
  ACHIEVEMENT: 'achievement', // Sparkles and light glow
  PROGRESS: 'progress',       // Progressive fill animations
  SUBTLE: 'subtle'           // Minimal micro-animations
};

// Do Not Disturb modes (content-focused)
export const DND_MODES = {
  OFF: 'off',
  CONTENT_ONLY: 'content_only',
  CRITICAL_ONLY: 'critical_only',
  SILENT: 'silent'
};

class NotificationService {
  constructor() {
    this.notifications = new Map();
    this.currentContext = NOTIFICATION_CONTEXTS.GLOBAL;
    this.startTime = Date.now();
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
    
    console.log('NotificationService: Initialized for content creation (chat features disabled)');
  }

  // Stub methods for content generation notifications
  show(notificationData) {
    const { message, type = NOTIFICATION_TYPES.INFO } = notificationData;
    console.log(`Notification: ${type.toUpperCase()} - ${message}`);
    
    // Simple browser notification for now
    if (this.preferences.enabledTypes[type]) {
      // Could implement toast notifications here
      return this.createContentNotification(notificationData);
    }
    
    return null;
  }

  createContentNotification(data) {
    const id = `notification_${Date.now()}`;
    const notification = {
      id,
      ...data,
      timestamp: new Date(),
      priority: this.determinePriority(data),
      category: NOTIFICATION_CATEGORIES.CONTENT_OPERATIONS
    };

    this.notifications.set(id, notification);
    return id;
  }

  determinePriority(data) {
    const { type, metadata = {} } = data;

    if (type === NOTIFICATION_TYPES.ERROR && metadata.isBlocking) {
      return NOTIFICATION_PRIORITY.CRITICAL;
    }

    if (type === NOTIFICATION_TYPES.WARNING && metadata.requiresAction) {
      return NOTIFICATION_PRIORITY.HIGH;
    }

    if (type === NOTIFICATION_TYPES.SUCCESS || type === NOTIFICATION_TYPES.INFO) {
      return NOTIFICATION_PRIORITY.MEDIUM;
    }

    return NOTIFICATION_PRIORITY.LOW;
  }

  // Add notification processing method
  processNotification(notificationData) {
    const id = this.createContentNotification(notificationData);
    const notification = this.notifications.get(id);
    return notification;
  }

  // Get active notifications
  getActiveNotifications() {
    return Array.from(this.notifications.values()).filter(n => !n.dismissed);
  }

  // Remove notification by ID
  removeNotification(id) {
    this.notifications.delete(id);
  }

  // Update current context
  updateCurrentContext(context) {
    this.currentContext = context;
  }

  // Set Do Not Disturb mode
  setDndMode(mode) {
    this.dndMode = mode;
    console.log(`DND mode set to: ${mode}`);
  }

  // Set quiet hours
  setQuietHours(start, end) {
    this.quietHours = { start, end };
    console.log(`Quiet hours set to: ${start} - ${end}`);
  }

  // Stub methods to prevent errors
  dismiss(id) {
    this.notifications.delete(id);
  }

  clear() {
    this.notifications.clear();
  }

  clearAll() {
    this.notifications.clear();
  }

  getNotifications() {
    return Array.from(this.notifications.values());
  }

  // Get service performance stats
  getStats() {
    const notifications = this.getNotifications();
    const now = new Date();
    const hourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    
    return {
      total: notifications.length,
      active: notifications.filter(n => !n.dismissed).length,
      byPriority: {
        critical: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.CRITICAL).length,
        high: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.HIGH).length,
        medium: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.MEDIUM).length,
        low: notifications.filter(n => n.priority === NOTIFICATION_PRIORITY.LOW).length
      },
      byType: {
        success: notifications.filter(n => n.type === NOTIFICATION_TYPES.SUCCESS).length,
        error: notifications.filter(n => n.type === NOTIFICATION_TYPES.ERROR).length,
        warning: notifications.filter(n => n.type === NOTIFICATION_TYPES.WARNING).length,
        info: notifications.filter(n => n.type === NOTIFICATION_TYPES.INFO).length
      },
      recentActivity: notifications.filter(n => new Date(n.timestamp) > hourAgo).length,
      serviceUptime: Date.now() - this.startTime
    };
  }

  // Add method to track service stats
  getMetrics() {
    return this.getStats();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default NotificationService;
