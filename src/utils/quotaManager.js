import { CHAT_LIMITS } from '../config/chatLimits';
import { isSuperUser, hasAdminPrivileges } from '../config/adminConfig';

// Daily quota management utility
export class DailyQuotaManager {
  constructor() {
    this.storageKey = 'eccApp_dailyQuota';
    this.perChatStorageKey = 'eccApp_perChatLimits';
    this.todayKey = this.getTodayKey();
  }

  // Check if chat is in general mode (exempt from most limitations)
  isGeneralMode(chatData) {
    return chatData?.isGeneral === true || chatData?.subject === 'General';
  }

  // Get per-chat limitation data
  getPerChatData() {
    const stored = localStorage.getItem(this.perChatStorageKey);
    return stored ? JSON.parse(stored) : {};
  }

  // Save per-chat limitation data
  savePerChatData(perChatData) {
    localStorage.setItem(this.perChatStorageKey, JSON.stringify(perChatData));
  }

  // Initialize chat limitations
  initializeChatLimits(chatId, chatData) {
    if (!chatData) {
      // Skip initialization if chatData is undefined or null
      return;
    }
    if (this.isGeneralMode(chatData)) {
      return; // General mode is exempt from per-chat limits
    }

    const perChatData = this.getPerChatData();
    if (!perChatData[chatId]) {
      perChatData[chatId] = {
        filesUploaded: 0,
        contentLinked: 0,
        chatsLinked: 0,
        createdAt: new Date().toISOString(),
        subject: chatData.subject || 'Unknown'
      };
      this.savePerChatData(perChatData);
    }
  }

  // Get chat-specific usage
  getChatUsage(chatId) {
    const perChatData = this.getPerChatData();
    return perChatData[chatId] || {
      filesUploaded: 0,
      contentLinked: 0,
      chatsLinked: 0,
      createdAt: new Date().toISOString(),
      subject: 'Unknown'
    };
  }

  // Get today's date key (YYYY-MM-DD format)
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // Get current quota data
  getQuotaData() {
    const stored = localStorage.getItem(this.storageKey);
    let quotaData = stored ? JSON.parse(stored) : {};
    
    // Reset if it's a new day
    if (quotaData.date !== this.todayKey) {
      quotaData = {
        date: this.todayKey,
        chatsCreated: 0,
        messagesUsed: 0,
        contentFilesLinked: 0,
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

  // Check if user can create new chat
  canCreateChat(isGeneral = false, userEmail = null) {
    // Admin users bypass all limitations
    if (userEmail && isSuperUser(userEmail)) {
      return true;
    }
    
    // General mode chats are exempt from daily chat limits
    if (isGeneral) {
      return true;
    }
    const quota = this.getQuotaData();
    return quota.chatsCreated < CHAT_LIMITS.MAX_DAILY_CHATS;
  }

  // Check if user can send message
  canSendMessage(isGeneral = false, userEmail = null) {
    // Admin users bypass all limitations
    if (userEmail && isSuperUser(userEmail)) {
      return true;
    }
    
    // General mode chats are exempt from daily message limits
    if (isGeneral) {
      return true;
    }
    const quota = this.getQuotaData();
    return quota.messagesUsed < CHAT_LIMITS.MAX_DAILY_MESSAGES;
  }

  // Record new chat creation
  recordNewChat(isGeneral = false) {
    // Don't count general mode chats towards daily limits
    if (isGeneral) {
      return;
    }
    const quota = this.getQuotaData();
    quota.chatsCreated++;
    this.saveQuotaData(quota);
  }

  // Record message usage
  recordMessage(isGeneral = false) {
    // Don't count general mode messages towards daily limits
    if (isGeneral) {
      return;
    }
    const quota = this.getQuotaData();
    quota.messagesUsed++;
    this.saveQuotaData(quota);
  }

  // Record content file linking
  recordContentLink() {
    const quota = this.getQuotaData();
    quota.contentFilesLinked++;
    this.saveQuotaData(quota);
  }

  // Get usage statistics
  getUsageStats() {
    const quota = this.getQuotaData();
    return {
      dailyChats: {
        used: quota.chatsCreated,
        max: CHAT_LIMITS.MAX_DAILY_CHATS,
        remaining: CHAT_LIMITS.MAX_DAILY_CHATS - quota.chatsCreated
      },
      dailyMessages: {
        used: quota.messagesUsed,
        max: CHAT_LIMITS.MAX_DAILY_MESSAGES,
        remaining: CHAT_LIMITS.MAX_DAILY_MESSAGES - quota.messagesUsed
      },
      contentFiles: {
        used: quota.contentFilesLinked,
        max: quota.contentFilesLinked, // No daily limit for content files
        remaining: Infinity
      }
    };
  }

  // Get warning messages
  getWarningMessages() {
    const quota = this.getQuotaData();
    const warnings = [];

    // Check chat limit
    const chatUsage = (quota.chatsCreated / CHAT_LIMITS.MAX_DAILY_CHATS) * 100;
    if (chatUsage >= CHAT_LIMITS.CRITICAL_THRESHOLD) {
      warnings.push({
        type: 'critical',
        message: 'Daily chat limit almost reached!',
        remaining: CHAT_LIMITS.MAX_DAILY_CHATS - quota.chatsCreated
      });
    } else if (chatUsage >= CHAT_LIMITS.WARNING_THRESHOLD) {
      warnings.push({
        type: 'warning',
        message: 'Approaching daily chat limit',
        remaining: CHAT_LIMITS.MAX_DAILY_CHATS - quota.chatsCreated
      });
    }

    // Check message limit
    const messageUsage = (quota.messagesUsed / CHAT_LIMITS.MAX_DAILY_MESSAGES) * 100;
    if (messageUsage >= CHAT_LIMITS.CRITICAL_THRESHOLD) {
      warnings.push({
        type: 'critical',
        message: 'Daily message limit almost reached!',
        remaining: CHAT_LIMITS.MAX_DAILY_MESSAGES - quota.messagesUsed
      });
    } else if (messageUsage >= CHAT_LIMITS.WARNING_THRESHOLD) {
      warnings.push({
        type: 'warning',
        message: 'Approaching daily message limit',
        remaining: CHAT_LIMITS.MAX_DAILY_MESSAGES - quota.messagesUsed
      });
    }

    return warnings;
  }

  // Get smart suggestions based on usage
  getSmartSuggestions() {
    const quota = this.getQuotaData();
    const suggestions = [];

    // Chat usage suggestions
    if (quota.chatsCreated >= CHAT_LIMITS.MAX_DAILY_CHATS * 0.8) {
      suggestions.push({
        type: 'efficiency',
        message: 'Consider using longer conversations instead of creating new chats',
        action: 'Continue in existing chats'
      });
      suggestions.push({
        type: 'alternative',
        message: 'Try General Mode for unlimited conversations',
        action: 'Use General Mode'
      });
    }

    // Message usage suggestions
    if (quota.messagesUsed >= CHAT_LIMITS.MAX_DAILY_MESSAGES * 0.8) {
      suggestions.push({
        type: 'efficiency',
        message: 'Focus on quality over quantity in your messages',
        action: 'Make messages more comprehensive'
      });
      suggestions.push({
        type: 'alternative',
        message: 'Switch to General Mode for unlimited messaging',
        action: 'Use General Mode'
      });
    }

    // General efficiency suggestions
    if (quota.chatsCreated >= 15) {
      suggestions.push({
        type: 'organization',
        message: 'Use chat linking to connect related conversations',
        action: 'Link related chats'
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

  // Check if user can upload files in this chat
  canUploadFiles(chatId, chatData, userEmail = null) {
    // Admin users bypass all limitations
    if (userEmail && isSuperUser(userEmail)) {
      return true;
    }
    
    if (this.isGeneralMode(chatData)) {
      return false; // General mode doesn't allow file uploads
    }

    const usage = this.getChatUsage(chatId);
    return usage.filesUploaded < CHAT_LIMITS.MAX_FILES_PER_MESSAGE;
  }

  // Check if user can link content in this chat
  canLinkContent(chatId, chatData, userEmail = null) {
    // Admin users bypass all limitations
    if (userEmail && isSuperUser(userEmail)) {
      return true;
    }
    
    if (this.isGeneralMode(chatData)) {
      const usage = this.getChatUsage(chatId);
      return usage.contentLinked < CHAT_LIMITS.GENERAL_MODE.MAX_CONTENT_FILES_PER_CHAT;
    }

    const usage = this.getChatUsage(chatId);
    return usage.contentLinked < CHAT_LIMITS.MAX_CONTENT_FILES_PER_CHAT;
  }

  // Check if user can link chats in this chat
  canLinkChats(chatId, chatData, userEmail = null) {
    // Admin users bypass all limitations
    if (userEmail && isSuperUser(userEmail)) {
      return true;
    }
    
    if (this.isGeneralMode(chatData)) {
      return false; // General mode doesn't allow chat linking
    }

    const usage = this.getChatUsage(chatId);
    return usage.chatsLinked < CHAT_LIMITS.MAX_CHAT_CARDS_PER_CHAT;
  }

  // Record file upload
  recordFileUpload(chatId, chatData) {
    if (this.isGeneralMode(chatData)) {
      return false; // General mode doesn't allow file uploads
    }

    const perChatData = this.getPerChatData();
    if (!perChatData[chatId]) {
      this.initializeChatLimits(chatId, chatData);
    }

    if (perChatData[chatId].filesUploaded >= CHAT_LIMITS.MAX_FILES_PER_MESSAGE) {
      return false; // Limit already exceeded
    }

    perChatData[chatId].filesUploaded++;
    this.savePerChatData(perChatData);
    return true;
  }

  // Record content linking
  recordContentLinking(chatId, chatData) {
    const perChatData = this.getPerChatData();
    if (!perChatData[chatId]) {
      this.initializeChatLimits(chatId, chatData);
    }

    const maxAllowed = this.isGeneralMode(chatData) 
      ? CHAT_LIMITS.GENERAL_MODE.MAX_CONTENT_FILES_PER_CHAT
      : CHAT_LIMITS.MAX_CONTENT_FILES_PER_CHAT;

    if (perChatData[chatId].contentLinked >= maxAllowed) {
      return false; // Limit already exceeded
    }

    perChatData[chatId].contentLinked++;
    this.savePerChatData(perChatData);
    return true;
  }

  // Record chat linking
  recordChatLinking(chatId, chatData, numberOfChats) {
    if (this.isGeneralMode(chatData)) {
      return false; // General mode doesn't allow chat linking
    }

    const perChatData = this.getPerChatData();
    if (!perChatData[chatId]) {
      this.initializeChatLimits(chatId, chatData);
    }

    if (numberOfChats > CHAT_LIMITS.MAX_CHAT_CARDS_PER_CHAT) {
      return false; // Trying to link too many chats
    }

    perChatData[chatId].chatsLinked = numberOfChats;
    this.savePerChatData(perChatData);
    return true;
  }

  // Get comprehensive chat limitations status
  getChatLimitationsStatus(chatId, chatData) {
    if (this.isGeneralMode(chatData)) {
      const usage = this.getChatUsage(chatId);
      return {
        isGeneral: true,
        canUploadFiles: false,
        canLinkContent: usage.contentLinked < CHAT_LIMITS.GENERAL_MODE.MAX_CONTENT_FILES_PER_CHAT,
        canLinkChats: false,
        filesUsed: 0,
        filesAllowed: 0,
        contentUsed: usage.contentLinked,
        contentAllowed: CHAT_LIMITS.GENERAL_MODE.MAX_CONTENT_FILES_PER_CHAT,
        chatsUsed: 0,
        chatsAllowed: 0,
        restrictions: {
          noFileUploads: true,
          noChatLinking: true,
          limitedContentLinking: true,
          unlimitedMessages: true
        }
      };
    }

    const usage = this.getChatUsage(chatId);
    return {
      isGeneral: false,
      canUploadFiles: usage.filesUploaded < CHAT_LIMITS.MAX_FILES_PER_MESSAGE,
      canLinkContent: usage.contentLinked < CHAT_LIMITS.MAX_CONTENT_FILES_PER_CHAT,
      canLinkChats: usage.chatsLinked < CHAT_LIMITS.MAX_CHAT_CARDS_PER_CHAT,
      filesUsed: usage.filesUploaded,
      filesAllowed: CHAT_LIMITS.MAX_FILES_PER_MESSAGE,
      contentUsed: usage.contentLinked,
      contentAllowed: CHAT_LIMITS.MAX_CONTENT_FILES_PER_CHAT,
      chatsUsed: usage.chatsLinked,
      chatsAllowed: CHAT_LIMITS.MAX_CHAT_CARDS_PER_CHAT,
      restrictions: {
        noFileUploads: false,
        noChatLinking: false,
        limitedContentLinking: false,
        unlimitedMessages: false
      }
    };
  }
}

// Singleton instance
export const dailyQuotaManager = new DailyQuotaManager();

// Utility functions for easy access
export const canCreateChat = (isGeneral = false) => dailyQuotaManager.canCreateChat(isGeneral);
export const canSendMessage = (isGeneral = false) => dailyQuotaManager.canSendMessage(isGeneral);
export const recordNewChat = (isGeneral = false) => dailyQuotaManager.recordNewChat(isGeneral);
export const recordMessage = (isGeneral = false) => dailyQuotaManager.recordMessage(isGeneral);
export const getUsageStats = () => dailyQuotaManager.getUsageStats();
export const getWarningMessages = () => dailyQuotaManager.getWarningMessages();
export const getSmartSuggestions = () => dailyQuotaManager.getSmartSuggestions();
export const getTimeUntilReset = () => dailyQuotaManager.getTimeUntilReset();

// Per-chat limitation utility functions
export const initializeChatLimits = (chatId, chatData) => dailyQuotaManager.initializeChatLimits(chatId, chatData);
export const canUploadFiles = (chatId, chatData) => dailyQuotaManager.canUploadFiles(chatId, chatData);
export const canLinkContent = (chatId, chatData) => dailyQuotaManager.canLinkContent(chatId, chatData);
export const canLinkChats = (chatId, chatData) => dailyQuotaManager.canLinkChats(chatId, chatData);
export const recordFileUpload = (chatId, chatData) => dailyQuotaManager.recordFileUpload(chatId, chatData);
export const recordContentLinking = (chatId, chatData) => dailyQuotaManager.recordContentLinking(chatId, chatData);
export const recordChatLinking = (chatId, chatData, numberOfChats) => dailyQuotaManager.recordChatLinking(chatId, chatData, numberOfChats);
export const getChatLimitationsStatus = (chatId, chatData) => dailyQuotaManager.getChatLimitationsStatus(chatId, chatData);
export const getChatUsage = (chatId) => dailyQuotaManager.getChatUsage(chatId);
