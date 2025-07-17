// ContextInspector.js - Detects user references to specific messages or conversation parts
export class ContextInspector {
  constructor() {
    // Patterns for detecting message references
    this.messageReferencePatterns = [
      // Specific message references
      /\b(as per|according to|from|in)\s+(the\s+)?(above|previous|last|recent|earlier|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+(message|response|answer|reply|comment|discussion|explanation)\b/gi,
      /\b(in|from|as)\s+(the\s+)?(last|previous|above|earlier|recent)\s+(\d+\s+)?(message|response|answer|reply|comment|discussion|explanation)s?\b/gi,
      /\b(as\s+you\s+)?(said|mentioned|explained|discussed|stated|told|wrote)\s+(above|before|earlier|previously|in\s+the\s+last|recently)\b/gi,
      /\b(refer|referring|reference)\s+(to\s+)?(the\s+)?(above|previous|last|earlier|recent)\s+(message|response|answer|reply|comment|discussion|explanation)\b/gi,
      
      // Numbered message references
      /\b(message|response|answer|reply|comment)\s+(number\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi,
      /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+(message|response|answer|reply|comment|discussion|explanation)\b/gi,
      
      // Sequential references
      /\b(next|following|subsequent)\s+(message|response|answer|reply|comment|discussion|explanation)\b/gi,
      /\b(back\s+to|return\s+to|continue\s+from)\s+(the\s+)?(previous|earlier|above|last)\s+(message|response|answer|reply|comment|discussion|explanation)\b/gi,
    ];

    // Patterns for detecting full conversation references
    this.fullConversationPatterns = [
      /\b(entire|complete|full|whole|all)\s+(conversation|chat|discussion|thread|history)\b/gi,
      /\b(our\s+)?(entire|complete|full|whole|all)\s+(conversation|chat|discussion|thread|history)\b/gi,
      /\b(everything|all)\s+(we|you|i)\s+(discussed|talked|said|mentioned|covered)\b/gi,
      /\b(summarize|review|recap|overview\s+of)\s+(our\s+)?(entire|complete|full|whole|all)\s+(conversation|chat|discussion|thread|history)\b/gi,
      /\b(from\s+the\s+)?(beginning|start)\s+(of\s+)?(our\s+)?(conversation|chat|discussion|thread|history)\b/gi,
      /\b(throughout|across|during)\s+(our\s+)?(entire|complete|full|whole|all)\s+(conversation|chat|discussion|thread|history)\b/gi,
      /\b(as\s+per|according\s+to)\s+(our\s+)?(entire|complete|full|whole|all)\s+(conversation|chat|discussion|thread|history)\b/gi,
    ];

    // Patterns for detecting broad context needs
    this.broadContextPatterns = [
      /\b(overall|generally|in\s+general|broadly|comprehensively)\b/gi,
      /\b(context|background|full\s+picture|big\s+picture|overall\s+view)\b/gi,
      /\b(detailed|comprehensive|thorough|in-depth)\s+(summary|overview|explanation|analysis)\b/gi,
    ];
  }

  // Main inspection method
  inspectUserMessage(userMessage, messageHistory) {
    const analysis = {
      hasMessageReferences: false,
      hasFullConversationReference: false,
      needsBroadContext: false,
      referencedMessageIndices: [],
      contextStrategy: 'normal',
      recommendedMessages: 10, // Default last 10 messages
      summaryDetail: 'concise' // Default concise summary
    };

    // Check for message references
    const messageReferences = this.detectMessageReferences(userMessage);
    if (messageReferences.length > 0) {
      analysis.hasMessageReferences = true;
      analysis.referencedMessageIndices = this.findReferencedMessages(messageReferences, messageHistory);
      analysis.contextStrategy = 'specific_messages';
      analysis.recommendedMessages = Math.max(15, analysis.referencedMessageIndices.length + 5);
    }

    // Check for full conversation references
    if (this.detectFullConversationReference(userMessage)) {
      analysis.hasFullConversationReference = true;
      analysis.contextStrategy = 'full_conversation';
      analysis.recommendedMessages = Math.min(messageHistory.length, 25); // More messages for full context
      analysis.summaryDetail = 'detailed'; // More detailed summary
    }

    // Check for broad context needs
    if (this.detectBroadContextNeeds(userMessage)) {
      analysis.needsBroadContext = true;
      analysis.summaryDetail = 'detailed';
      analysis.recommendedMessages = Math.max(analysis.recommendedMessages, 15);
    }

    return analysis;
  }

  // Detect message references in user input
  detectMessageReferences(text) {
    const references = [];
    
    this.messageReferencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          references.push({
            type: 'message_reference',
            text: match,
            pattern: pattern.source
          });
        });
      }
    });

    return references;
  }

  // Detect full conversation references
  detectFullConversationReference(text) {
    return this.fullConversationPatterns.some(pattern => pattern.test(text));
  }

  // Detect broad context needs
  detectBroadContextNeeds(text) {
    return this.broadContextPatterns.some(pattern => pattern.test(text));
  }

  // Find specific referenced messages
  findReferencedMessages(references, messageHistory) {
    const indices = new Set();
    
    references.forEach(ref => {
      const refText = ref.text.toLowerCase();
      
      // Handle numbered references
      if (refText.includes('first')) indices.add(0);
      if (refText.includes('second')) indices.add(1);
      if (refText.includes('third')) indices.add(2);
      if (refText.includes('fourth')) indices.add(3);
      if (refText.includes('fifth')) indices.add(4);
      
      // Handle positional references
      if (refText.includes('last') || refText.includes('previous')) {
        indices.add(messageHistory.length - 1);
        indices.add(messageHistory.length - 2);
      }
      
      if (refText.includes('above') || refText.includes('earlier')) {
        // Add last few messages
        for (let i = Math.max(0, messageHistory.length - 5); i < messageHistory.length; i++) {
          indices.add(i);
        }
      }
      
      // Handle numeric references
      const numMatch = refText.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1]);
        if (num > 0 && num <= messageHistory.length) {
          indices.add(num - 1); // Convert to 0-based index
        }
      }
    });

    return Array.from(indices).sort((a, b) => a - b);
  }

  // Get context recommendations
  getContextRecommendations(analysis, messageHistory) {
    const recommendations = {
      includeMessages: [],
      summaryType: analysis.summaryDetail,
      contextWindow: analysis.recommendedMessages,
      strategy: analysis.contextStrategy
    };

    switch (analysis.contextStrategy) {
      case 'specific_messages':
        // Include referenced messages plus surrounding context
        analysis.referencedMessageIndices.forEach(idx => {
          // Add the referenced message and its context
          for (let i = Math.max(0, idx - 1); i <= Math.min(messageHistory.length - 1, idx + 1); i++) {
            recommendations.includeMessages.push(i);
          }
        });
        // Also include recent messages
        for (let i = Math.max(0, messageHistory.length - 5); i < messageHistory.length; i++) {
          recommendations.includeMessages.push(i);
        }
        break;
        
      case 'full_conversation':
        // Include more messages for full context
        recommendations.includeMessages = Array.from(
          {length: Math.min(messageHistory.length, 25)}, 
          (_, i) => i
        );
        break;
        
      default:
        // Normal strategy - last N messages
        recommendations.includeMessages = Array.from(
          {length: Math.min(messageHistory.length, analysis.recommendedMessages)}, 
          (_, i) => messageHistory.length - analysis.recommendedMessages + i
        ).filter(i => i >= 0);
        break;
    }

    // Remove duplicates and sort
    recommendations.includeMessages = [...new Set(recommendations.includeMessages)].sort((a, b) => a - b);

    return recommendations;
  }

  // Generate context explanation for debugging
  generateContextExplanation(analysis, recommendations) {
    let explanation = `Context Analysis:\n`;
    explanation += `- Strategy: ${analysis.contextStrategy}\n`;
    explanation += `- Message References: ${analysis.hasMessageReferences}\n`;
    explanation += `- Full Conversation: ${analysis.hasFullConversationReference}\n`;
    explanation += `- Broad Context: ${analysis.needsBroadContext}\n`;
    explanation += `- Summary Detail: ${analysis.summaryDetail}\n`;
    explanation += `- Recommended Messages: ${analysis.recommendedMessages}\n`;
    explanation += `- Including Message Indices: [${recommendations.includeMessages.join(', ')}]\n`;
    
    return explanation;
  }
}
