import { CHAT_LIMITS, compressMessageHistory, calculateContextSize, needsContextOptimization } from '../config/chatLimits.js';
import { processConviction, formatConvictionForAPI } from './convictionLayer.js';

import { detectAndAdaptFormality, injectCulturalMarkers } from '../config/languageTemplates.js';
import { analyzeMessage } from './messageClassifier.js';
import { memoryManager } from './conversationMemory.js';
// Rate limiting for API calls
class RateLimiter {
  constructor(maxCalls, windowMs) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
    this.calls = [];
  }

  canMakeCall() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    return this.calls.length < this.maxCalls;
  }

  recordCall() {
    this.calls.push(Date.now());
  }
}

// Initialize rate limiter: 60 calls per hour
const apiRateLimiter = new RateLimiter(60, 60 * 60 * 1000);

// Context cache to avoid re-processing
const contextCache = new Map();

// Optimize chat history for API calls
export const optimizeForAPI = (messages, linkedContexts = []) => {
  // Check cache first
  const cacheKey = `${messages.length}-${linkedContexts.length}`;
  if (contextCache.has(cacheKey)) {
    return contextCache.get(cacheKey);
  }

  let optimizedMessages = [...messages];
  let optimizedLinkedContexts = [...linkedContexts];

  // 1. Compress message history if needed
  if (optimizedMessages.length > CHAT_LIMITS.MAX_CONTEXT_MESSAGES) {
    optimizedMessages = compressMessageHistory(optimizedMessages);
  }

  // 2. Limit linked context size
  optimizedLinkedContexts = optimizedLinkedContexts.slice(0, CHAT_LIMITS.MAX_LINKED_CHATS);
  optimizedLinkedContexts = optimizedLinkedContexts.map(ctx => ({
    ...ctx,
    messages: ctx.messages.slice(-5) // Only last 5 messages from each linked chat
  }));

  // 3. Truncate very long messages
  optimizedMessages = optimizedMessages.map(msg => ({
    ...msg,
    text: msg.text?.slice(0, CHAT_LIMITS.MAX_MESSAGE_LENGTH) || ''
  }));

  // 4. Remove large files from context (keep only metadata)
  optimizedMessages = optimizedMessages.map(msg => ({
    ...msg,
    files: msg.files ? msg.files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    })) : []
  }));

  const result = {
    messages: optimizedMessages,
    linkedContexts: optimizedLinkedContexts,
    totalSize: calculateContextSize(optimizedMessages, optimizedLinkedContexts),
    compressed: optimizedMessages.length !== messages.length
  };

  // Cache the result
  contextCache.set(cacheKey, result);
  
  // Clean old cache entries
  if (contextCache.size > 100) {
    const firstKey = contextCache.keys().next().value;
    contextCache.delete(firstKey);
  }

  return result;
};

// Enhanced handleSendMessage with optimization
export const createOptimizedSendMessage = (
  currentChatId,
  user,
  db,
  currentSubject,
  aiPersona,
  linkedChats,
  setMessages,
  setIsTyping,
  setInputValue,
  onError,
  onSuccess,
  formatChatHistoryForAPI,
  getLinkedChatContexts
) => {
  return async (text, files = []) => {
    // Rate limiting check
    if (!apiRateLimiter.canMakeCall()) {
      onError('Rate limit exceeded. Please wait before sending another message.');
      return;
    }

    // Validation
    if (!currentChatId) {
      onError('Please select a chat or start a new one.');
      return;
    }

    if (!text?.trim() && files.length === 0) return;

    // File validation
    if (files.length > CHAT_LIMITS.MAX_FILES_PER_MESSAGE) {
      onError(`Maximum ${CHAT_LIMITS.MAX_FILES_PER_MESSAGE} files allowed per message.`);
      return;
    }

    // Text length validation
    if (text && text.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
      onError(`Message too long. Maximum ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters allowed.`);
      return;
    }

    const userMessage = { 
      role: 'user', 
      text: text.trim(), 
      timestamp: new Date(), 
      files: [] 
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      
      // Auto-archive old messages if chat is getting too long
      if (newMessages.length > CHAT_LIMITS.MAX_MESSAGES_PER_CHAT) {
        return newMessages.slice(-CHAT_LIMITS.MAX_MESSAGES_PER_CHAT);
      }
      
      return newMessages;
    });
    
    setInputValue('');
    setIsTyping(true);

    try {
      // Record API call
      apiRateLimiter.recordCall();

      // File upload handling (with size limits)
      if (files.length > 0) {
        const validFiles = files.filter(file => {
          if (file.size > CHAT_LIMITS.MAX_FILE_SIZE) {
            onError(`File ${file.name} is too large. Maximum size: ${CHAT_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`);
            return false;
          }
          return true;
        });

        if (validFiles.length > 0) {
          const uploadedFiles = await Promise.all(
            validFiles.map(async (file, index) => {
              const fileId = `${userMessage.timestamp.getTime()}-${index}`;
              return await uploadFile(file, user.uid, currentChatId, fileId);
            })
          );
          userMessage.files = uploadedFiles;
        }
      }

      // Get current messages state for optimization
      const currentMessages = await new Promise(resolve => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = userMessage; // Update with files
          resolve(updated);
          return updated;
        });
      });

      // Get linked contexts and optimize
      const linkedChatContexts = await getLinkedChatContexts();
      const optimizedData = optimizeForAPI(currentMessages, linkedChatContexts);

      // Warning if context is still too large
      if (optimizedData.totalSize > CHAT_LIMITS.MAX_TOKENS_PER_REQUEST * 3) {
        console.warn('Context size is still large, consider further optimization');
      }

      // Analyze current message for conviction and cultural adaptation
      const messageAnalysis = analyzeMessage(text, currentMessages);
      
      // Get user memory for personalization
      const memory = memoryManager.getUserMemory(user.uid);
      const recommendations = memory.getPersonalizedRecommendations({
        userState: messageAnalysis?.userState?.state,
        intent: messageAnalysis?.intent?.intent
      });
      const convictionResponse = processConviction(text, currentMessages, currentSubject, messageAnalysis?.userState?.state);
      const formalityLevel = recommendations.suggestedFormality || detectAndAdaptFormality(text);
      
      // Prepare enhanced prompt with conviction and cultural context
      let enhancedPrompt = '';
      if (convictionResponse) {
        enhancedPrompt += formatConvictionForAPI(convictionResponse);
      }
      
      enhancedPrompt += `
        CULTURAL ADAPTATION:
        - Formality Level: ${formalityLevel}
        - User Intent: ${messageAnalysis?.intent?.intent || 'general'}
        - User State: ${messageAnalysis?.userState?.state || 'neutral'}
        - Sentiment: ${messageAnalysis?.sentiment?.sentiment || 'neutral'}
        
        RESPONSE GUIDELINES:
        - Use Pakistani Urdu-English mix naturally
        - Adapt formality to match user's style
        - Include cultural markers appropriately
        - Maintain warm, empathetic tone
        - Be human-like and conversational
      `;
      
      // API call with optimized data and enhanced prompting
      const response = await fetch('/.netlify/functions/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formatChatHistoryForAPI(optimizedData.messages),
          currentSubject,
          aiPersona,
          linkedChatContexts: optimizedData.linkedContexts,
          enhancedPrompt: enhancedPrompt,
          messageAnalysis: messageAnalysis,
          convictionResponse: convictionResponse,
          formalityLevel: formalityLevel,
          contextInfo: {
            totalMessages: currentMessages.length,
            compressed: optimizedData.compressed,
            contextSize: optimizedData.totalSize
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const { generatedContent } = await response.json();
      
      // Apply cultural markers to the AI response
      const culturallyAdaptedContent = injectCulturalMarkers(
        generatedContent, 
        formalityLevel === 'casual' ? 'medium' : 'low'
      );
      
      const aiMessage = { 
        role: 'model', 
        text: culturallyAdaptedContent, 
        timestamp: new Date(),
        metadata: {
          convictionUsed: !!convictionResponse,
          formalityLevel: formalityLevel,
          userIntent: messageAnalysis?.intent?.intent,
          userState: messageAnalysis?.userState?.state
        }
      };

    // Update memory with the latest interaction
    const interactionId = memory.recordInteraction(text, culturallyAdaptedContent, {
      intent: messageAnalysis?.intent?.intent,
      userState: messageAnalysis?.userState?.state,
      convictionUsed: !!convictionResponse,
      formalityLevel: formalityLevel,
      responseTime: Date.now() - userMessage.timestamp
    });

    setMessages((prev) => [...prev, aiMessage]);

      // Firestore update with message limit
      if (currentChatId && user && db) {
        const finalMessages = [...currentMessages, aiMessage];
        const limitedMessages = finalMessages.slice(-CHAT_LIMITS.MAX_MESSAGES_PER_CHAT);
        
        const updateData = {
          messages: limitedMessages.map(msg => ({
            role: msg.role,
            text: msg.text,
            files: msg.files || [],
            timestamp: msg.timestamp
          })),
          lastUpdated: new Date(), // Use regular Date instead of serverTimestamp for better performance
          messageCount: limitedMessages.length
        };

        await updateDoc(doc(db, `artifacts/ecc-app-ab284/users/${user.uid}/chats`, currentChatId), updateData);
      }

      onSuccess('Message sent successfully');

    } catch (err) {
      console.error('Error sending message:', err);
      onError('Failed to get response from AI. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };
};

// Message pagination for large chats
export const paginateMessages = (messages, page = 0, pageSize = CHAT_LIMITS.PAGINATION_SIZE) => {
  const start = page * pageSize;
  const end = start + pageSize;
  return {
    messages: messages.slice(start, end),
    hasMore: end < messages.length,
    totalPages: Math.ceil(messages.length / pageSize),
    currentPage: page
  };
};

// Clean up old messages periodically
export const cleanupOldMessages = async (db, userId, daysOld = CHAT_LIMITS.ARCHIVE_AFTER_DAYS) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  // This would need to be implemented with cloud functions for efficiency
  console.log(`Cleanup messages older than ${cutoffDate.toISOString()}`);
};
