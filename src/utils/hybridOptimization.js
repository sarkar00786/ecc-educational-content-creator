import { CHAT_LIMITS } from '../config/chatLimits.js';

// Hybrid optimization: Context compression + Summarization
export class HybridChatOptimizer {
  constructor() {
    this.summaryCache = new Map();
    this.contextThreshold = 15; // Start optimization after 15 messages
    this.summaryReduction = 0.55; // 55% reduction target
  }

  // Main optimization method
  async optimizeContext(messages, linkedContexts = []) {
    if (messages.length <= this.contextThreshold) {
      return {
        messages,
        linkedContexts,
        optimized: false,
        method: 'none'
      };
    }

    // Step 1: Basic compression first (fast)
    const compressed = this.compressMessages(messages);
    
    // Step 2: If still too large, apply summarization (slower but more effective)
    if (this.calculateTokens(compressed) > CHAT_LIMITS.MAX_TOKENS_PER_REQUEST * 0.7) {
      const summarized = await this.summarizeMessages(compressed);
      return {
        messages: summarized,
        linkedContexts: this.optimizeLinkedContexts(linkedContexts),
        optimized: true,
        method: 'hybrid'
      };
    }

    return {
      messages: compressed,
      linkedContexts: this.optimizeLinkedContexts(linkedContexts),
      optimized: true,
      method: 'compression'
    };
  }

  // Step 1: Basic compression (keep recent + important messages)
  compressMessages(messages) {
    if (messages.length <= CHAT_LIMITS.MAX_CONTEXT_MESSAGES) {
      return messages;
    }

    // Keep first 2 messages (context) + last 10 messages (recent)
    const firstMessages = messages.slice(0, 2);
    const recentMessages = messages.slice(-10);
    
    // Find important messages in between (questions, errors, key topics)
    const middleMessages = messages.slice(2, -10);
    const importantMessages = middleMessages.filter(msg => 
      msg.text.includes('?') || // Questions
      msg.text.includes('error') || // Errors
      msg.text.includes('important') || // Explicit importance
      msg.text.length > 200 // Long responses (likely detailed)
    ).slice(-3); // Keep last 3 important ones

    return [
      ...firstMessages,
      ...importantMessages,
      ...recentMessages
    ];
  }

  // Step 2: Intelligent summarization
  async summarizeMessages(messages) {
    const cacheKey = this.generateCacheKey(messages);
    
    // Check cache first
    if (this.summaryCache.has(cacheKey)) {
      return this.summaryCache.get(cacheKey);
    }

    // Group messages for summarization
    const messagesToSummarize = messages.slice(2, -5); // Skip first 2 and last 5
    const keepMessages = [...messages.slice(0, 2), ...messages.slice(-5)];

    if (messagesToSummarize.length === 0) {
      return messages;
    }

    try {
      // Create summary of middle messages
      const summary = await this.generateSummary(messagesToSummarize);
      
      const summarizedMessages = [
        ...messages.slice(0, 2), // Keep first 2
        {
          role: 'system',
          text: `[SUMMARY] Previous conversation summary (${messagesToSummarize.length} messages): ${summary}`,
          timestamp: new Date(),
          isSummary: true
        },
        ...messages.slice(-5) // Keep last 5
      ];

      // Cache the result
      this.summaryCache.set(cacheKey, summarizedMessages);
      return summarizedMessages;

    } catch (error) {
      console.error('Summarization failed, falling back to compression:', error);
      return this.compressMessages(messages);
    }
  }

  // Generate summary using AI
  async generateSummary(messages) {
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`
    ).join('\n');

    const response = await fetch('/.netlify/functions/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: conversationText,
        targetReduction: this.summaryReduction,
        maxLength: Math.floor(conversationText.length * (1 - this.summaryReduction))
      })
    });

    if (!response.ok) {
      throw new Error('Summary generation failed');
    }

    const { summary } = await response.json();
    return summary;
  }

  // Optimize linked contexts
  optimizeLinkedContexts(linkedContexts) {
    return linkedContexts.slice(0, 2).map(ctx => ({
      ...ctx,
      messages: ctx.messages.slice(-3) // Only last 3 messages from each linked chat
    }));
  }

  // Token estimation
  calculateTokens(messages) {
    return messages.reduce((total, msg) => {
      return total + Math.ceil((msg.text?.length || 0) / 4); // Rough token estimation
    }, 0);
  }

  // Generate cache key
  generateCacheKey(messages) {
    const lastMessage = messages[messages.length - 1];
    return `${messages.length}-${lastMessage?.timestamp?.getTime()}`;
  }

  // Clear old cache entries
  clearOldCache() {
    if (this.summaryCache.size > 50) {
      const keys = Array.from(this.summaryCache.keys());
      keys.slice(0, 25).forEach(key => this.summaryCache.delete(key));
    }
  }
}

// Enhanced message handler with hybrid optimization
export const createHybridOptimizedHandler = (dependencies) => {
  const optimizer = new HybridChatOptimizer();
  
  return async (text, files = []) => {
    const {
      currentChatId, user, db, currentSubject, aiPersona,
      setMessages, setIsTyping, setInputValue, onError, onSuccess,
      formatChatHistoryForAPI, getLinkedChatContexts
    } = dependencies;

    if (!currentChatId) {
      onError('Please select a chat or start a new one.');
      return;
    }

    if (!text?.trim() && files.length === 0) return;

    const userMessage = { 
      role: 'user', 
      text: text.trim(), 
      timestamp: new Date(), 
      files: files || [] 
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get current context
      const currentMessages = await new Promise(resolve => {
        setMessages(prev => {
          resolve(prev);
          return prev;
        });
      });

      const linkedContexts = await getLinkedChatContexts();
      
      // Apply hybrid optimization
      const optimizedContext = await optimizer.optimizeContext(
        currentMessages, 
        linkedContexts
      );

      console.log(`Context optimized: ${optimizedContext.method}, Messages: ${currentMessages.length} → ${optimizedContext.messages.length}`);

      // Send optimized context to AI
      const response = await fetch('/.netlify/functions/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formatChatHistoryForAPI(optimizedContext.messages),
          currentSubject,
          aiPersona,
          linkedChatContexts: optimizedContext.linkedContexts,
          contextInfo: {
            optimized: optimizedContext.optimized,
            method: optimizedContext.method,
            originalMessageCount: currentMessages.length,
            optimizedMessageCount: optimizedContext.messages.length
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const { generatedContent } = await response.json();
      const aiMessage = { 
        role: 'model', 
        text: generatedContent, 
        timestamp: new Date() 
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update Firestore
      if (currentChatId && user && db) {
        const finalMessages = [...currentMessages, aiMessage];
        await updateChatInFirestore(currentChatId, user, db, finalMessages);
      }

      onSuccess('Message sent successfully');

    } catch (error) {
      console.error('Error sending message:', error);
      onError('Failed to get response from AI. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };
};

// Helper function to update Firestore
async function updateChatInFirestore(chatId, user, db, messages) {
  const limitedMessages = messages.slice(-CHAT_LIMITS.MAX_MESSAGES_PER_CHAT);
  
  const updateData = {
    messages: limitedMessages.map(msg => ({
      role: msg.role,
      text: msg.text,
      files: msg.files || [],
      timestamp: msg.timestamp,
      isSummary: msg.isSummary || false
    })),
    lastUpdated: new Date(),
    messageCount: limitedMessages.length
  };

  const { updateDoc, doc } = await import('firebase/firestore');
  await updateDoc(doc(db, `artifacts/ecc-app-ab284/users/${user.uid}/chats`, chatId), updateData);
}
