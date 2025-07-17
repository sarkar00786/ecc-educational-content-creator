import { MessageCompressor } from './MessageCompressor.js';
import { MessageSummarizer } from './MessageSummarizer.js';
import { ContextInspector } from './ContextInspector.js';

export class HybridChatOptimizer {
  constructor() {
    this.compressor = new MessageCompressor();
    this.summarizer = new MessageSummarizer();
    this.inspector = new ContextInspector();
  }

  // Main optimization method
  async optimize(messages, linkedContexts = [], userMessage = null) {
    // Step 1: Analyze user message for context requirements
    let contextAnalysis = null;
    if (userMessage) {
      contextAnalysis = this.inspector.inspectUserMessage(userMessage, messages);
      console.log('Context Analysis:', this.inspector.generateContextExplanation(contextAnalysis, this.inspector.getContextRecommendations(contextAnalysis, messages)));
    }

    // Step 2: Apply smart message selection based on analysis
    let selectedMessages = messages;
    if (contextAnalysis) {
      const recommendations = this.inspector.getContextRecommendations(contextAnalysis, messages);
      selectedMessages = this.selectMessagesBasedOnRecommendations(messages, recommendations);
    }

    // Step 3: Basic compression
    const { compressedMessages, wasCompressed } = this.compressor.compress(selectedMessages);
    
    // Step 4: Conditional summarization with detail level
    let finalMessages = compressedMessages;
    let wasSummarized = false;
    const detailLevel = contextAnalysis?.summaryDetail || 'concise';

    if (wasCompressed && this.needsSummarization(compressedMessages)) {
      const { summarizedMessages, wasSummarized: summaryFlag } = await this.summarizer.summarize(compressedMessages, detailLevel);
      finalMessages = summarizedMessages;
      wasSummarized = summaryFlag;
    }

    // Step 5: Optimize linked contexts
    const optimizedLinkedContexts = this.optimizeLinkedContexts(linkedContexts);

    return {
      messages: finalMessages,
      linkedContexts: optimizedLinkedContexts,
      optimized: wasCompressed || wasSummarized,
      method: wasSummarized ? 'hybrid' : 'compression',
      contextAnalysis: contextAnalysis,
      detailLevel: detailLevel
    };
  }

  // Determine if summarization is needed
  needsSummarization(messages) {
    const totalLength = messages.reduce((sum, msg) => sum + (msg.text.length || 0), 0);
    return totalLength > 4000; // Threshold for summarization
  }

  // Select messages based on context inspector recommendations
  selectMessagesBasedOnRecommendations(messages, recommendations) {
    if (!recommendations.includeMessages.length) {
      return messages;
    }

    // Get messages at recommended indices
    const selectedMessages = recommendations.includeMessages
      .filter(idx => idx >= 0 && idx < messages.length)
      .map(idx => messages[idx]);

    // Ensure we have at least some messages
    if (selectedMessages.length === 0) {
      return messages.slice(-10); // Fallback to last 10 messages
    }

    return selectedMessages;
  }

  // Optimize linked contexts
  optimizeLinkedContexts(linkedContexts) {
    return linkedContexts.map(ctx => ({
      ...ctx,
      messages: ctx.messages.slice(-3) // Last 3 messages for context
    }));
  }
}
