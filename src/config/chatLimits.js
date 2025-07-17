// Chat Performance Configuration
export const CHAT_LIMITS = {
  // Message limits (120 user + 120 AI = 240 total)
  MAX_MESSAGES_PER_CHAT: 240,
  MAX_CONTEXT_MESSAGES: 20, // Only send last 20 messages to AI
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB total per chat
  MAX_FILES_PER_MESSAGE: 3, // 3 files per message
  MAX_TOTAL_FILES_PER_CHAT: 25 * 1024 * 1024, // 25MB total per chat
  SUPPORTED_FILE_TYPES: ['txt', 'pdf', 'docx', 'jpg', 'png', 'gif'],
  
  // Content and Chat Card limits
  MAX_CONTENT_FILES_PER_CHAT: 1, // Only 1 content file per chat
  MAX_CHAT_CARDS_PER_CHAT: 2, // Only 2 chat cards per chat
  
  // General Mode specific limits (optimized for educational content discussion)
  GENERAL_MODE: {
    MAX_MESSAGES_PER_CHAT: Infinity, // No message limit in general mode
    MAX_FILES_PER_MESSAGE: 0, // No file uploads in general mode (use content cards instead)
    MAX_CONTENT_FILES_PER_CHAT: 1, // 1 content card per chat for focused discussion
    MAX_CHAT_CARDS_PER_CHAT: 0, // No chat linking in general mode (keeps discussions focused)
    SUPPORTED_FILE_TYPES: [], // No file uploads supported
    CAN_PIN: false, // Cannot pin general mode chats
    CAN_ARCHIVE: false, // Cannot archive general mode chats
    CAN_EDIT_TITLE: false, // Cannot edit title in general mode
    CAN_DELETE: false, // Cannot delete general mode chats
    FOCUS_ON_CONTENT_CARDS: true, // Emphasize content card usage
    UNLIMITED_MESSAGING: true, // Key benefit of general mode
    EXEMPT_FROM_DAILY_LIMITS: true // Not counted towards daily quotas
  },
  
  // Content limits
  MAX_MESSAGE_LENGTH: 4000, // Characters
  MAX_LINKED_CHATS: 2, // Only 2 linked chats at once (reduced from 3)
  MAX_LINKED_CONTENT_SIZE: 50000, // 50KB content
  
  // Daily usage limits
  MAX_DAILY_CHATS: 25, // 25 chats per day
  MAX_DAILY_MESSAGES: 6000, // 6000 messages per day (25 chats × 240 messages)
  
  // API limits
  MAX_API_CALLS_PER_HOUR: 60,
  MAX_TOKENS_PER_REQUEST: 8000,
  
  // Storage limits
  MAX_CHATS_PER_USER: 50,
  ARCHIVE_AFTER_DAYS: 30,
  
  // Performance thresholds
  CONTEXT_COMPRESSION_THRESHOLD: 15, // Start compressing after 15 messages
  PAGINATION_SIZE: 10, // Load messages in chunks
  
  // Warning thresholds (percentages)
  WARNING_THRESHOLD: 70, // Show warning at 70% usage
  CRITICAL_THRESHOLD: 90, // Show critical warning at 90% usage
};

// Message compression for context
export const compressMessageHistory = (messages, maxMessages = CHAT_LIMITS.MAX_CONTEXT_MESSAGES) => {
  if (messages.length <= maxMessages) return messages;
  
  // Keep first 2 messages (for context) + last N messages
  const firstMessages = messages.slice(0, 2);
  const recentMessages = messages.slice(-maxMessages + 2);
  
  return [
    ...firstMessages,
    {
      role: 'system',
      text: `[${messages.length - maxMessages} previous messages compressed for context]`,
      timestamp: new Date(),
      isCompressed: true
    },
    ...recentMessages
  ];
};

// Context size calculation
export const calculateContextSize = (messages, linkedContexts = []) => {
  const messageSize = messages.reduce((total, msg) => total + (msg.text?.length || 0), 0);
  const linkedSize = linkedContexts.reduce((total, ctx) => 
    total + ctx.messages.reduce((sum, msg) => sum + (msg.text?.length || 0), 0), 0
  );
  return messageSize + linkedSize;
};

// Check if context needs optimization
export const needsContextOptimization = (messages, linkedContexts = []) => {
  const totalSize = calculateContextSize(messages, linkedContexts);
  return totalSize > CHAT_LIMITS.MAX_TOKENS_PER_REQUEST * 4; // Rough token estimation
};

// General Mode utility functions
export const isGeneralMode = (chatData) => {
  return chatData?.isGeneral === true || chatData?.subject === 'General';
};

export const getEffectiveLimits = (chatData) => {
  if (isGeneralMode(chatData)) {
    return {
      ...CHAT_LIMITS,
      ...CHAT_LIMITS.GENERAL_MODE,
      MAX_MESSAGES_PER_CHAT: CHAT_LIMITS.GENERAL_MODE.MAX_MESSAGES_PER_CHAT,
      MAX_FILES_PER_MESSAGE: CHAT_LIMITS.GENERAL_MODE.MAX_FILES_PER_MESSAGE,
      MAX_CONTENT_FILES_PER_CHAT: CHAT_LIMITS.GENERAL_MODE.MAX_CONTENT_FILES_PER_CHAT,
      MAX_CHAT_CARDS_PER_CHAT: CHAT_LIMITS.GENERAL_MODE.MAX_CHAT_CARDS_PER_CHAT,
      SUPPORTED_FILE_TYPES: CHAT_LIMITS.GENERAL_MODE.SUPPORTED_FILE_TYPES
    };
  }
  return CHAT_LIMITS;
};

export const canPerformAction = (chatData, action) => {
  if (!isGeneralMode(chatData)) {
    return true; // All actions allowed in regular chat mode
  }
  
  const generalLimits = CHAT_LIMITS.GENERAL_MODE;
  
  switch (action) {
    case 'pin':
      return generalLimits.CAN_PIN;
    case 'archive':
      return generalLimits.CAN_ARCHIVE;
    case 'edit_title':
      return generalLimits.CAN_EDIT_TITLE;
    case 'delete':
      return generalLimits.CAN_DELETE;
    case 'upload_file':
      return generalLimits.MAX_FILES_PER_MESSAGE > 0;
    case 'link_chat':
      return generalLimits.MAX_CHAT_CARDS_PER_CHAT > 0;
    case 'link_content':
      return generalLimits.MAX_CONTENT_FILES_PER_CHAT > 0;
    default:
      return true;
  }
};

export const getGeneralModeRestrictions = () => {
  return {
    noFileUploads: true,
    noChatLinking: true,
    limitedContentLinking: true,
    noTitleEditing: true,
    noPinning: true,
    noArchiving: true,
    noDeleting: true,
    unlimitedMessages: true,
    exemptFromDailyLimits: true
  };
};
