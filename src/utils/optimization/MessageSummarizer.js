// MessageSummarizer.js - AI-powered summarization
export class MessageSummarizer {
  constructor(options = {}) {
    this.targetReduction = options.targetReduction || 0.55;
    this.maxRetries = options.maxRetries || 2;
    this.cache = new Map();
    this.maxCacheSize = options.maxCacheSize || 100;
    this.keepFirstMessages = options.keepFirstMessages || 2;
    this.keepLastMessages = options.keepLastMessages || 5;
  }

  // Main summarization method
  async summarize(messages, detailLevel = 'concise') {
    if (messages.length <= 10) {
      return {
        summarizedMessages: messages,
        wasSummarized: false,
        originalCount: messages.length,
        summarizedCount: messages.length,
        reductionRatio: 0,
        cacheHit: false
      };
    }

    try {
      const cacheKey = this.generateCacheKey(messages);
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cachedResult = this.cache.get(cacheKey);
        return {
          ...cachedResult,
          cacheHit: true
        };
      }

      // Perform summarization
      const result = await this.performSummarization(messages);
      
      // Cache the result
      this.cacheResult(cacheKey, result);
      
      return {
        ...result,
        cacheHit: false
      };

    } catch (error) {
      console.error('Summarization failed:', error);
      return {
        summarizedMessages: messages,
        wasSummarized: false,
        originalCount: messages.length,
        summarizedCount: messages.length,
        reductionRatio: 0,
        cacheHit: false,
        error: error.message
      };
    }
  }

  // Perform the actual summarization
  async performSummarization(messages) {
    // Identify messages to summarize (middle section)
    const messagesToSummarize = messages.slice(this.keepFirstMessages, -this.keepLastMessages);
    
    if (messagesToSummarize.length === 0) {
      return {
        summarizedMessages: messages,
        wasSummarized: false,
        originalCount: messages.length,
        summarizedCount: messages.length,
        reductionRatio: 0
      };
    }

    // Generate summary with specified detail level
    const summary = await this.generateSummary(messagesToSummarize, detailLevel);
    
    // Create summarized message list
    const summarizedMessages = [
      ...messages.slice(0, this.keepFirstMessages), // Keep first messages
      {
        role: 'system',
        text: `[SUMMARY] Previous conversation summary (${messagesToSummarize.length} messages): ${summary}`,
        timestamp: new Date(),
        isSummary: true,
        originalMessageCount: messagesToSummarize.length
      },
      ...messages.slice(-this.keepLastMessages) // Keep last messages
    ];

    const originalLength = this.calculateTotalLength(messages);
    const summarizedLength = this.calculateTotalLength(summarizedMessages);
    const reductionRatio = ((originalLength - summarizedLength) / originalLength * 100).toFixed(1);

    return {
      summarizedMessages,
      wasSummarized: true,
      originalCount: messages.length,
      summarizedCount: summarizedMessages.length,
      reductionRatio: parseFloat(reductionRatio),
      summary: summary
    };
  }

  // Generate summary using AI
  async generateSummary(messages, detailLevel = 'concise') {
    const conversationText = this.formatMessagesForSummary(messages);
    const maxLength = Math.floor(conversationText.length * (1 - this.targetReduction));
    
    // Adjust reduction and instructions based on detail level
    const summaryInstructions = this.getSummaryInstructions(detailLevel);
    const adjustedReduction = detailLevel === 'detailed' ? 0.40 : this.targetReduction; // Less reduction for detailed summaries

    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch('/.netlify/functions/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: conversationText,
            targetReduction: adjustedReduction,
            maxLength: detailLevel === 'detailed' ? Math.floor(maxLength * 1.5) : maxLength,
            detailLevel: detailLevel,
            instructions: summaryInstructions
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        return data.summary;

      } catch (error) {
        lastError = error;
        console.warn(`Summarization attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt < this.maxRetries - 1) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  }

  // Format messages for summary generation
  formatMessagesForSummary(messages) {
    return messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'AI';
      const text = msg.text.slice(0, 1000); // Limit message length for summary
      const files = msg.files && msg.files.length > 0 ? ` [Files: ${msg.files.length}]` : '';
      return `${role}: ${text}${files}`;
    }).join('\n\n');
  }

  // Calculate total text length
  calculateTotalLength(messages) {
    return messages.reduce((total, msg) => total + (msg.text?.length || 0), 0);
  }

  // Generate cache key
  generateCacheKey(messages) {
    // Use last message timestamp and total message count as cache key
    const lastMessage = messages[messages.length - 1];
    const firstMessage = messages[0];
    return `${messages.length}-${firstMessage?.timestamp?.getTime()}-${lastMessage?.timestamp?.getTime()}`;
  }

  // Cache result
  cacheResult(key, result) {
    // Clean old cache entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, result);
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) * 100 || 0
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get summary instructions based on detail level
  getSummaryInstructions(detailLevel) {
    switch (detailLevel) {
      case 'detailed':
        return 'Create a comprehensive summary that preserves important details, examples, explanations, and context. Include specific information that might be referenced later.';
      case 'concise':
      default:
        return 'Create a concise summary focusing on key points and main topics discussed.';
    }
  }

  // Get summarizer statistics
  getStats() {
    return {
      targetReduction: this.targetReduction,
      maxRetries: this.maxRetries,
      keepFirstMessages: this.keepFirstMessages,
      keepLastMessages: this.keepLastMessages,
      ...this.getCacheStats()
    };
  }
}
