// MessageCompressor.js - Basic compression without AI
export class MessageCompressor {
  constructor(options = {}) {
    this.maxContextMessages = options.maxContextMessages || 20;
    this.keepFirstMessages = options.keepFirstMessages || 2;
    this.keepLastMessages = options.keepLastMessages || 10;
    this.maxImportantMessages = options.maxImportantMessages || 3;
  }

  // Main compression method
  compress(messages) {
    if (messages.length <= this.maxContextMessages) {
      return {
        compressedMessages: messages,
        wasCompressed: false,
        originalCount: messages.length,
        compressedCount: messages.length,
        compressionRatio: 0
      };
    }

    const compressed = this.performCompression(messages);
    
    return {
      compressedMessages: compressed,
      wasCompressed: true,
      originalCount: messages.length,
      compressedCount: compressed.length,
      compressionRatio: ((messages.length - compressed.length) / messages.length * 100).toFixed(1)
    };
  }

  // Perform the actual compression
  performCompression(messages) {
    // Step 1: Keep first messages for context
    const firstMessages = messages.slice(0, this.keepFirstMessages);
    
    // Step 2: Keep last messages for recent context
    const lastMessages = messages.slice(-this.keepLastMessages);
    
    // Step 3: Find important messages in the middle
    const middleMessages = messages.slice(this.keepFirstMessages, -this.keepLastMessages);
    const importantMessages = this.findImportantMessages(middleMessages);
    
    // Step 4: Combine all parts
    const result = [
      ...firstMessages,
      ...importantMessages,
      ...lastMessages
    ];

    // Step 5: Add compression indicator if middle messages were removed
    if (middleMessages.length > importantMessages.length) {
      const compressionMessage = {
        role: 'system',
        text: `[COMPRESSED] ${middleMessages.length - importantMessages.length} messages compressed for context optimization`,
        timestamp: new Date(),
        isCompressed: true
      };
      
      result.splice(this.keepFirstMessages + importantMessages.length, 0, compressionMessage);
    }

    return result;
  }

  // Find important messages in the middle section
  findImportantMessages(messages) {
    const scoredMessages = messages.map((msg, index) => ({
      message: msg,
      index,
      score: this.calculateImportanceScore(msg)
    }));

    // Sort by importance score (descending)
    scoredMessages.sort((a, b) => b.score - a.score);

    // Take top N important messages
    const importantMessages = scoredMessages
      .slice(0, this.maxImportantMessages)
      .sort((a, b) => a.index - b.index) // Restore chronological order
      .map(item => item.message);

    return importantMessages;
  }

  // Calculate importance score for a message
  calculateImportanceScore(message) {
    let score = 0;
    const text = message.text.toLowerCase();

    // Length factor (longer messages might be more important)
    score += Math.min(text.length / 100, 5); // Max 5 points for length

    // Question indicator
    if (text.includes('?')) score += 3;

    // Error or problem indicators
    if (text.includes('error') || text.includes('problem') || text.includes('issue')) {
      score += 4;
    }

    // Important keywords
    const importantKeywords = [
      'important', 'crucial', 'remember', 'note', 'summary', 'conclusion',
      'result', 'solution', 'answer', 'explanation', 'because', 'therefore'
    ];
    
    importantKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 2;
    });

    // Educational content indicators
    const educationalKeywords = [
      'learn', 'understand', 'concept', 'theory', 'principle', 'formula',
      'definition', 'example', 'step', 'process', 'method'
    ];
    
    educationalKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 1.5;
    });

    // Role-based scoring
    if (message.role === 'user') score += 1; // User questions are important
    if (message.role === 'model' && text.length > 200) score += 2; // Long AI responses

    // File attachments add importance
    if (message.files && message.files.length > 0) score += 3;

    return score;
  }

  // Get compression statistics
  getStats() {
    return {
      maxContextMessages: this.maxContextMessages,
      keepFirstMessages: this.keepFirstMessages,
      keepLastMessages: this.keepLastMessages,
      maxImportantMessages: this.maxImportantMessages
    };
  }
}
