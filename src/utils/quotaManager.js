import { isSuperUser } from '../config/adminConfig';

// Content generation limits (focused on content creation only)
const CONTENT_LIMITS = {
  MAX_DAILY_CONTENT: 50,
  MAX_DAILY_GENERATIONS: 200,
  WARNING_THRESHOLD: 80, // 80%
  CRITICAL_THRESHOLD: 95 // 95%
};

// Daily quota management utility for content generation only (Chat functionality moved to Magic-Chat folder)
export class DailyQuotaManager {
  constructor() {
    this.storageKey = 'eccApp_dailyQuota_content';
    this.todayKey = this.getTodayKey();
  }

  // Get today's date key (YYYY-MM-DD format)
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // Get current quota data for content generation
  getQuotaData() {
    const stored = localStorage.getItem(this.storageKey);
    let quotaData = stored ? JSON.parse(stored) : {};
    
    // Reset if it's a new day
    if (quotaData.date !== this.todayKey) {
      quotaData = {
        date: this.todayKey,
        contentGenerated: 0,
        generationsUsed: 0,
        lastReset: new Date().toISOString()
      };
      this.saveQuotaData(quotaData);
    }
    
    return quotaData;
  }

  // Save quota data
  saveQuotaData(quotaData) {
    localStorage.setItem(this.storageKey, JSON.stringify(quotaData));
  }

  // Check if user can generate content
  canGenerateContent(userEmail = null) {
    if (userEmail && isSuperUser(userEmail)) {
      return true;
    }
    const quota = this.getQuotaData();
    return quota.generationsUsed < CONTENT_LIMITS.MAX_DAILY_GENERATIONS;
  }

  // Record content generation
  recordContentGeneration() {
    const quota = this.getQuotaData();
    quota.generationsUsed++;
    quota.contentGenerated++;
    this.saveQuotaData(quota);
  }

  // Get usage statistics for content generation
  getUsageStats() {
    const quota = this.getQuotaData();
    return {
      dailyContent: {
        used: quota.contentGenerated || 0,
        max: CONTENT_LIMITS.MAX_DAILY_CONTENT,
        remaining: CONTENT_LIMITS.MAX_DAILY_CONTENT - (quota.contentGenerated || 0)
      },
      dailyGenerations: {
        used: quota.generationsUsed || 0,
        max: CONTENT_LIMITS.MAX_DAILY_GENERATIONS,
        remaining: CONTENT_LIMITS.MAX_DAILY_GENERATIONS - (quota.generationsUsed || 0)
      }
    };
  }

  // Get warning messages for content generation
  getWarningMessages() {
    const quota = this.getQuotaData();
    const warnings = [];

    // Check generation limit
    const generationUsage = (quota.generationsUsed / CONTENT_LIMITS.MAX_DAILY_GENERATIONS) * 100;
    if (generationUsage >= CONTENT_LIMITS.CRITICAL_THRESHOLD) {
      warnings.push({
        type: 'critical',
        message: 'Daily content generation limit almost reached!',
        remaining: CONTENT_LIMITS.MAX_DAILY_GENERATIONS - quota.generationsUsed
      });
    } else if (generationUsage >= CONTENT_LIMITS.WARNING_THRESHOLD) {
      warnings.push({
        type: 'warning',
        message: 'Approaching daily content generation limit',
        remaining: CONTENT_LIMITS.MAX_DAILY_GENERATIONS - quota.generationsUsed
      });
    }

    return warnings;
  }

  // Get smart suggestions for content generation
  getSmartSuggestions() {
    const quota = this.getQuotaData();
    const suggestions = [];

    // Generation usage suggestions
    if (quota.generationsUsed >= CONTENT_LIMITS.MAX_DAILY_GENERATIONS * 0.8) {
      suggestions.push({
        type: 'efficiency',
        message: 'Consider creating more comprehensive content in fewer generations',
        action: 'Create detailed content'
      });
    }

    return suggestions;
  }

  // Reset quota (for testing or admin purposes)
  resetQuota() {
    localStorage.removeItem(this.storageKey);
  }

  // Get time until quota resets
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow - now;
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      hours,
      minutes,
      msUntilReset,
      resetTime: tomorrow.toISOString()
    };
  }
}

// Singleton instance
export const dailyQuotaManager = new DailyQuotaManager();

// Utility functions for easy access to content generation features
export const canGenerateContent = (userEmail = null) => dailyQuotaManager.canGenerateContent(userEmail);
export const recordContentGeneration = () => dailyQuotaManager.recordContentGeneration();
export const getUsageStats = () => dailyQuotaManager.getUsageStats();
export const getWarningMessages = () => dailyQuotaManager.getWarningMessages();
export const getSmartSuggestions = () => dailyQuotaManager.getSmartSuggestions();
export const getTimeUntilReset = () => dailyQuotaManager.getTimeUntilReset();
export const resetQuota = () => dailyQuotaManager.resetQuota();

// Legacy compatibility exports (stub functions that return safe defaults)
// These prevent errors if any components still reference chat functionality
export const canCreateChat = () => false; // Chat disabled
export const canSendMessage = () => false; // Chat disabled
export const recordNewChat = () => {}; // No-op
export const recordMessage = () => {}; // No-op
export const initializeChatLimits = () => {}; // No-op
export const canUploadFiles = () => false; // Chat disabled
export const canLinkContent = () => false; // Chat disabled
export const canLinkChats = () => false; // Chat disabled
export const recordFileUpload = () => false; // Chat disabled
export const recordContentLinking = () => false; // Chat disabled
export const recordChatLinking = () => false; // Chat disabled
export const getChatLimitationsStatus = () => ({ isGeneral: false }); // Safe default
export const getChatUsage = () => ({ filesUploaded: 0, contentLinked: 0, relatedContent: 0 }); // Safe default
