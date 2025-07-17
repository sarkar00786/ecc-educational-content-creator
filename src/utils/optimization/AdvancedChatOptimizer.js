// Advanced Chat Optimizer with Semantic Chunking and Smart Context Management
import { CHAT_LIMITS } from '../../config/chatLimits.js';

export class AdvancedChatOptimizer {
  constructor() {
    this.semanticCache = new Map();
    this.priorityCache = new Map();
    this.contextWindow = 32000; // Extended context window
    this.maxChunkSize = 4000; // Semantic chunk size
    this.relevanceThreshold = 0.7;
  }

  // Semantic chunking for better context understanding
  async semanticChunk(messages, query) {
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const message of messages) {
      const messageSize = this.estimateTokens(message.text);
      
      if (currentSize + messageSize > this.maxChunkSize && currentChunk.length > 0) {
        chunks.push({
          messages: [...currentChunk],
          relevance: await this.calculateRelevance(currentChunk, query),
          timestamp: currentChunk[currentChunk.length - 1].timestamp
        });
        currentChunk = [];
        currentSize = 0;
      }
      
      currentChunk.push(message);
      currentSize += messageSize;
    }
    
    if (currentChunk.length > 0) {
      chunks.push({
        messages: [...currentChunk],
        relevance: await this.calculateRelevance(currentChunk, query),
        timestamp: currentChunk[currentChunk.length - 1].timestamp
      });
    }
    
    return chunks;
  }

  // Calculate semantic relevance using keyword matching and context
  async calculateRelevance(messages, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const messageText = messages.map(m => m.text.toLowerCase()).join(' ');
    
    // Simple relevance scoring (can be enhanced with ML)
    let relevanceScore = 0;
    for (const word of queryWords) {
      if (messageText.includes(word)) {
        relevanceScore += 1;
      }
    }
    
    // Boost recent messages
    const recentBoost = messages.some(m => 
      Date.now() - new Date(m.timestamp).getTime() < 60000 // Last minute
    ) ? 0.2 : 0;
    
    return Math.min(1, (relevanceScore / queryWords.length) + recentBoost);
  }

  // Intelligent context selection
  async optimizeContext(messages, linkedContexts = [], currentQuery = '') {
    const cacheKey = `${messages.length}-${currentQuery.slice(0, 50)}`;
    
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey);
    }

    // Always keep the most recent messages
    const recentMessages = messages.slice(-10);
    const olderMessages = messages.slice(0, -10);
    
    if (olderMessages.length === 0) {
      return {
        messages: recentMessages,
        linkedContexts: this.optimizeLinkedContexts(linkedContexts),
        method: 'no-optimization',
        tokensUsed: this.estimateTokens(recentMessages.map(m => m.text).join(' '))
      };
    }

    // Semantic chunking for older messages
    const chunks = await this.semanticChunk(olderMessages, currentQuery);
    
    // Sort by relevance and recency
    const sortedChunks = chunks.sort((a, b) => {
      const relevanceDiff = b.relevance - a.relevance;
      if (Math.abs(relevanceDiff) < 0.1) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return relevanceDiff;
    });

    // Select most relevant chunks within token limit
    const selectedMessages = [];
    let tokenBudget = CHAT_LIMITS.MAX_TOKENS_PER_REQUEST * 0.6; // 60% for context
    
    // Always include first 2 messages for context
    if (messages.length > 2) {
      selectedMessages.push(...messages.slice(0, 2));
      tokenBudget -= this.estimateTokens(messages.slice(0, 2).map(m => m.text).join(' '));
    }

    // Add relevant chunks
    for (const chunk of sortedChunks) {
      const chunkTokens = this.estimateTokens(chunk.messages.map(m => m.text).join(' '));
      if (tokenBudget - chunkTokens > 0 && chunk.relevance > this.relevanceThreshold) {
        selectedMessages.push(...chunk.messages);
        tokenBudget -= chunkTokens;
      }
    }

    // Add recent messages
    selectedMessages.push(...recentMessages);

    const result = {
      messages: this.deduplicateMessages(selectedMessages),
      linkedContexts: this.optimizeLinkedContexts(linkedContexts),
      method: 'semantic-optimization',
      tokensUsed: this.estimateTokens(selectedMessages.map(m => m.text).join(' ')),
      chunksAnalyzed: chunks.length,
      relevantChunks: sortedChunks.filter(c => c.relevance > this.relevanceThreshold).length
    };

    this.semanticCache.set(cacheKey, result);
    return result;
  }

  // Remove duplicate messages while preserving order
  deduplicateMessages(messages) {
    const seen = new Set();
    return messages.filter(message => {
      const key = `${message.timestamp}-${message.text.slice(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Enhanced token estimation
  estimateTokens(text) {
    if (!text) return 0;
    // More accurate token estimation (words * 1.3 for average)
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  // Optimize linked contexts with prioritization
  optimizeLinkedContexts(linkedContexts) {
    return linkedContexts.slice(0, 2).map(ctx => {
      const recentMessages = ctx.messages.slice(-5);
      const importantMessages = ctx.messages.filter(msg => 
        msg.text.includes('?') || 
        msg.text.includes('important') ||
        msg.text.length > 100
      ).slice(-2);
      
      return {
        ...ctx,
        messages: [...importantMessages, ...recentMessages]
          .filter((msg, index, arr) => 
            arr.findIndex(m => m.text === msg.text) === index
          )
          .slice(-5)
      };
    });
  }

  // Cache management
  clearCache() {
    this.semanticCache.clear();
    this.priorityCache.clear();
  }

  // Memory efficient cleanup
  performMaintenanceCleanup() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Clear old cache entries
    for (const [key, value] of this.semanticCache.entries()) {
      if (value.timestamp && now - value.timestamp > oneHour) {
        this.semanticCache.delete(key);
      }
    }
    
    // Limit cache size
    if (this.semanticCache.size > 100) {
      const entries = Array.from(this.semanticCache.entries());
      entries.slice(0, 50).forEach(([key]) => this.semanticCache.delete(key));
    }
  }
}
