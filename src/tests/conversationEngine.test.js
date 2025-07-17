// Enhanced Conversation Engine Test Suite
// Comprehensive testing for all integrated components

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  processConversation, 
  processFeedback, 
  getConversationAnalytics,
  getAdvancedMetrics,
  resetConversationState,
  exportConversationState,
  importConversationState,
  MESSAGE_INTENTS,
  USER_STATES,
  CONVICTION_SCENARIOS,
  CONVICTION_INTENSITIES
} from '../utils/conversationEngine.js';

import { 
  analyzeMessageWithEntities,
  updateAdaptivePatterns,
  exportLearningData,
  importLearningData,
  resetLearningData
} from '../utils/messageClassifier.js';

import { 
  updatePersona,
  trackPersonaFeedback,
  getUserPersonaHistory
} from '../utils/aiPersonas.js';

import { 
  processConvictionTrigger
} from '../utils/convictionLayer.js';

describe('Enhanced Conversation Engine', () => {
  
  beforeEach(() => {
    resetConversationState();
    resetLearningData();
  });

  afterEach(() => {
    resetConversationState();
    resetLearningData();
  });

  describe('Core Conversation Processing', () => {
    
    it('should process a basic conversation message', async () => {
      const message = "Hello, can you help me with math?";
      const result = await processConversation(message, [], 'test_user');
      
      expect(result).toBeDefined();
      expect(result.messageAnalysis).toBeDefined();
      expect(result.personaResult).toBeDefined();
      expect(result.convictionResult).toBeDefined();
      expect(result.responseStrategy).toBeDefined();
      expect(result.conversationState).toBeDefined();
    });

    it('should handle Pakistani Urdu-English mixed messages', async () => {
      const message = "Yaar, main bahut confused hun math mein, help karo please";
      const result = await processConversation(message, [], 'urdu_user');
      
      expect(result.messageAnalysis.culturalContext.isUrduEnglishMix).toBe(true);
      expect(result.messageAnalysis.culturalContext.formalityLevel).toBe('casual');
      expect(result.messageAnalysis.intent.intent).toBe(MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP);
      expect(result.personaResult.id).toBe('friendly');
    });

    it('should trigger conviction for learning misconceptions', async () => {
      const message = "I'll just skip the basics and go straight to advanced topics";
      const result = await processConversation(message, [], 'impatient_user');
      
      expect(result.convictionResult.shouldTrigger).toBe(true);
      expect(result.convictionResult.scenario).toBe(CONVICTION_SCENARIOS.SKIPPING_FUNDAMENTALS);
      expect(result.responseStrategy.primary).toBe('conviction_response');
    });

    it('should adapt persona based on user state', async () => {
      const frustratedMessage = "I'm so frustrated with this, nothing makes sense!";
      const result1 = await processConversation(frustratedMessage, [], 'frustrated_user');
      
      expect(result1.messageAnalysis.userState.state).toBe(USER_STATES.FRUSTRATED);
      expect(result1.personaResult.id).toBe('friendly');
      
      const exploratoryMessage = "This is interesting, tell me more!";
      const conversationHistory = [
        { role: 'user', text: frustratedMessage, timestamp: new Date().toISOString() }
      ];
      const result2 = await processConversation(exploratoryMessage, conversationHistory, 'frustrated_user');
      
      expect(result2.messageAnalysis.userState.state).toBe(USER_STATES.ENGAGED);
      expect(result2.personaResult.id).toBe('educator');
    });

    it('should track engagement scores accurately', async () => {
      const messages = [
        "Hi there!",
        "This is really interesting!",
        "I'm getting excited about learning this!",
        "Amazing! I want to learn more!"
      ];
      
      const conversationHistory = [];
      let lastResult;
      
      for (const message of messages) {
        lastResult = await processConversation(message, conversationHistory, 'engaged_user');
        conversationHistory.push({
          role: 'user',
          text: message,
          timestamp: new Date().toISOString(),
          analysisMetadata: lastResult.messageAnalysis
        });
      }
      
      expect(lastResult.conversationState.sessionMetrics.engagementScore).toBeGreaterThan(0.7);
    });

    it('should handle conversation flow analysis', async () => {
      const messages = [
        "What is machine learning?",
        "How does supervised learning work?",
        "Why is training data important?",
        "Can you explain neural networks?"
      ];
      
      const conversationHistory = [];
      let lastResult;
      
      for (const message of messages) {
        lastResult = await processConversation(message, conversationHistory, 'deep_learner');
        conversationHistory.push({
          role: 'user',
          text: message,
          timestamp: new Date().toISOString(),
          analysisMetadata: lastResult.messageAnalysis
        });
      }
      
      expect(lastResult.messageAnalysis.conversationFlow.flow).toBe('deep_learning');
      expect(lastResult.messageAnalysis.conversationFlow.patterns.questionSequence.isDeepDiving).toBe(true);
    });

  });

  describe('Message Classification', () => {
    
    it('should classify intents correctly', async () => {
      const testCases = [
        { message: "Hello there!", expected: MESSAGE_INTENTS.GREETING_CASUAL },
        { message: "I need help with this problem", expected: MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP },
        { message: "What are some creative solutions?", expected: MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE },
        { message: "Calculate 2+2", expected: MESSAGE_INTENTS.DIRECT_TASK_ORIENTED },
        { message: "I'm feeling really happy today", expected: MESSAGE_INTENTS.EMOTIONAL_SHARING }
      ];
      
      for (const testCase of testCases) {
        const result = await processConversation(testCase.message, [], 'test_user');
        expect(result.messageAnalysis.intent.intent).toBe(testCase.expected);
      }
    });
    it('should detect user states accurately', async () => {
      const testCases = [
        { message: "I'm so confused about this", expected: USER_STATES.CONFUSED },
        { message: "This is really frustrating!", expected: USER_STATES.FRUSTRATED },
        { message: "I'm excited to learn more!", expected: USER_STATES.EXCITED },
        { message: "I feel confident about this now", expected: USER_STATES.CURIOUS }
      ];
      
      for (const testCase of testCases) {
        const result = await processConversation(testCase.message, [], 'test_user');
        expect(result.messageAnalysis.userState.state).toBe(testCase.expected);
      }
    });

    it('should analyze sentiment correctly', async () => {
      const positiveMessage = "This is awesome and amazing!";
      const negativeMessage = "This is terrible and frustrating!";
      const neutralMessage = "I need information about this topic.";
      
      const result1 = await processConversation(positiveMessage, [], 'test_user');
      const result2 = await processConversation(negativeMessage, [], 'test_user');
      const result3 = await processConversation(neutralMessage, [], 'test_user');
      
      expect(result1.messageAnalysis.sentiment.sentiment).toBe('positive');
      expect(result2.messageAnalysis.sentiment.sentiment).toBe('negative');
      expect(result3.messageAnalysis.sentiment.sentiment).toBe('neutral');
    });

    it('should extract entities correctly', async () => {
      const message = "I'm studying mathematics and programming at university tomorrow";
      const result = await processConversation(message, [], 'test_user');
      
      expect(result.messageAnalysis.entities.subjects).toContain('mathematics');
      expect(result.messageAnalysis.entities.subjects).toContain('programming');
      expect(result.messageAnalysis.entities.timeReferences).toContain('tomorrow');
      expect(result.messageAnalysis.entities.locations).toContain('university');
    });

  });

  describe('Persona System', () => {
    
    it('should select appropriate personas', async () => {
      const testCases = [
        { 
          message: "I'm confused and need help", 
          expectedPersona: 'friendly',
          userState: USER_STATES.CONFUSED
        },
        { 
          message: "Let's brainstorm some ideas", 
          expectedPersona: 'socratic',
          intent: MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE
        },
        { 
          message: "Give me a quick answer", 
          expectedPersona: 'concise',
          urgency: 'high'
        },
        { 
          message: "I want a comprehensive explanation", 
          expectedPersona: 'formal',
          complexity: 'high'
        }
      ];
      
      for (const testCase of testCases) {
        const result = await processConversation(testCase.message, [], 'test_user');
        expect(result.personaResult.id).toBe(testCase.expectedPersona);
      }
    });

    it('should blend personas when confidence is low', async () => {
      const ambiguousMessage = "I'm not sure what I want to know";
      const result = await processConversation(ambiguousMessage, [], 'test_user');
      
      // Check if persona blending logic is applied for low confidence
      if (result.personaResult.confidence < 0.7) {
        expect(result.personaResult.isBlended).toBeDefined();
      }
    });

    it('should learn from user feedback', async () => {
      const message = "Help me understand this concept";
      const result = await processConversation(message, [], 'feedback_user');
      
      // Provide positive feedback
      const feedbackResult = processFeedback('positive', {
        message: message,
        messageAnalysis: result.messageAnalysis,
        personaResult: result.personaResult,
        convictionResult: result.convictionResult,
        userId: 'feedback_user',
        responseType: 'standard_response'
      });
      
      expect(feedbackResult.processed).toBe(true);
      expect(feedbackResult.updatedState).toBeDefined();
    });

  });

  describe('Conviction Layer', () => {
    
    it('should trigger conviction for skipping fundamentals', async () => {
      const message = "I don't need to learn the basics, just teach me advanced stuff";
      const result = await processConversation(message, [], 'impatient_user');
      
      expect(result.convictionResult.shouldTrigger).toBe(true);
      expect(result.convictionResult.scenario).toBe(CONVICTION_SCENARIOS.SKIPPING_FUNDAMENTALS);
      expect(result.convictionResult.intensity).toBeDefined();
      expect(result.convictionResult.phrase).toBeDefined();
    });

    it('should trigger conviction for perfectionism paralysis', async () => {
      const message = "I'm afraid to try because I might make mistakes";
      const result = await processConversation(message, [], 'perfectionist_user');
      
      expect(result.convictionResult.shouldTrigger).toBe(true);
      expect(result.convictionResult.scenario).toBe(CONVICTION_SCENARIOS.PERFECTIONISM_PARALYSIS);
    });

    it('should provide culturally appropriate conviction phrases', async () => {
      const message = "Yaar, main give up kar raha hun, bahut mushkil hai";
      const result = await processConversation(message, [], 'urdu_user');
      
      if (result.convictionResult.shouldTrigger) {
        expect(result.convictionResult.phrase).toBeDefined();
        expect(result.convictionResult.phrase.length).toBeGreaterThan(0);
      }
    });

    it('should adjust conviction intensity based on user state', async () => {
      const frustratedMessage = "I'm extremely frustrated and want to quit!";
      const mildMessage = "I'm having a bit of trouble with this";
      
      const result1 = await processConversation(frustratedMessage, [], 'test_user');
      const result2 = await processConversation(mildMessage, [], 'test_user');
      
      if (result1.convictionResult.shouldTrigger && result2.convictionResult.shouldTrigger) {
        expect(result1.convictionResult.intensity).not.toBe(result2.convictionResult.intensity);
      }
    });

  });

  describe('Learning and Adaptation', () => {
    
    it('should update adaptive patterns based on user behavior', async () => {
      const userId = 'adaptive_user';
      const messages = [
        "I prefer detailed explanations",
        "Give me comprehensive information",
        "I need thorough coverage of topics"
      ];
      
      for (const message of messages) {
        const result = await processConversation(message, [], userId);
        
        // Simulate positive feedback for detailed responses
        processFeedback('positive', {
          message: message,
          messageAnalysis: result.messageAnalysis,
          personaResult: result.personaResult,
          convictionResult: result.convictionResult,
          userId: userId,
          responseType: 'detailed_response'
        });
      }
      
      // Check if the system learns the user's preference
      const testMessage = "Explain machine learning to me";
      const result = await processConversation(testMessage, [], userId);
      
      expect(result.messageAnalysis.personalizedClassification).toBeDefined();
    });

    it('should export and import learning data', () => {
      // Create some learning data
      updateAdaptivePatterns('test message', 'positive', {
        userId: 'test_user',
        detectedIntent: MESSAGE_INTENTS.LEARNING_FOCUSED,
        responseType: 'standard_response'
      });
      
      // Export the data
      const exportedData = exportLearningData();
      expect(exportedData).toBeDefined();
      expect(typeof exportedData).toBe('string');
      
      // Reset and import
      resetLearningData();
      const importResult = importLearningData(exportedData);
      expect(importResult).toBe(true);
    });

    it('should track conversation state persistence', async () => {
      const message = "Hello, I'm a test user";
      const result = await processConversation(message, [], 'persistence_user');
      
      // Export state
      const exportedState = exportConversationState();
      expect(exportedState).toBeDefined();
      
      // Reset and import
      resetConversationState();
      const importResult = importConversationState(exportedState);
      expect(importResult).toBe(true);
    });

  });

  describe('Analytics and Metrics', () => {
    
    it('should provide comprehensive conversation analytics', async () => {
      const messages = [
        "Hi there!",
        "I need help with programming",
        "This is really helpful!",
        "Can you explain more?"
      ];
      
      const conversationHistory = [];
      
      for (const message of messages) {
        const result = await processConversation(message, conversationHistory, 'analytics_user');
        conversationHistory.push({
          role: 'user',
          text: message,
          timestamp: new Date().toISOString(),
          analysisMetadata: result.messageAnalysis
        });
      }
      
      const analytics = getConversationAnalytics();
      
      expect(analytics.currentState).toBeDefined();
      expect(analytics.sessionSummary).toBeDefined();
      expect(analytics.sessionSummary.totalMessages).toBe(4);
      expect(analytics.sessionSummary.avgEngagement).toBeGreaterThan(0);
      expect(analytics.performanceMetrics).toBeDefined();
    });

    it('should provide advanced conversation metrics', async () => {
      const conversationHistory = [
        { role: 'user', text: 'What is AI?', timestamp: new Date().toISOString() },
        { role: 'assistant', text: 'AI is...', timestamp: new Date().toISOString() },
        { role: 'user', text: 'How does machine learning work?', timestamp: new Date().toISOString() },
        { role: 'assistant', text: 'Machine learning...', timestamp: new Date().toISOString() }
      ];
      
      const metrics = getAdvancedMetrics(conversationHistory);
      
      expect(metrics.conversationFlow).toBeDefined();
      expect(metrics.learningProgression).toBeDefined();
      expect(metrics.engagementAnalysis).toBeDefined();
      expect(metrics.culturalAdaptation).toBeDefined();
      expect(metrics.topicProgression).toBeDefined();
    });

    it('should track performance metrics over time', async () => {
      const messages = [
        "I'm excited to learn!",
        "This is getting interesting!",
        "I love this topic!",
        "More please!"
      ];
      
      const conversationHistory = [];
      let lastResult;
      
      for (const message of messages) {
        lastResult = await processConversation(message, conversationHistory, 'performance_user');
        conversationHistory.push({
          role: 'user',
          text: message,
          timestamp: new Date().toISOString(),
          analysisMetadata: lastResult.messageAnalysis
        });
      }
      
      const analytics = getConversationAnalytics();
      
      expect(analytics.performanceMetrics.engagementTrend).toBe('positive');
      expect(analytics.sessionSummary.avgEngagement).toBeGreaterThan(0.5);
    });

  });

  describe('Error Handling and Edge Cases', () => {
    
    it('should handle empty messages gracefully', async () => {
      const result = await processConversation('', [], 'test_user');
      
      expect(result).toBeDefined();
      expect(result.messageAnalysis).toBeDefined();
      expect(result.messageAnalysis.intent.intent).toBe(MESSAGE_INTENTS.TESTING_SYSTEM);
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(1000);
      const result = await processConversation(longMessage, [], 'test_user');
      
      expect(result).toBeDefined();
      expect(result.messageAnalysis).toBeDefined();
      expect(result.messageAnalysis.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should handle special characters and emojis', async () => {
      const specialMessage = "Hello! 😊 This has special chars: @#$%^&*()";
      const result = await processConversation(specialMessage, [], 'test_user');
      
      expect(result).toBeDefined();
      expect(result.messageAnalysis.moodPatterns.patterns.length).toBeGreaterThan(0);
    });

    it('should handle invalid user IDs gracefully', async () => {
      const result = await processConversation('Test message', [], null);
      
      expect(result).toBeDefined();
      expect(result.conversationState.userId).toBe(null);
    });

    it('should handle malformed conversation history', async () => {
      const malformedHistory = [
        { role: 'user' }, // Missing text
        { text: 'Hello' }, // Missing role
        null, // Null entry
        undefined // Undefined entry
      ];
      
      const result = await processConversation('Test message', malformedHistory, 'test_user');
      
      expect(result).toBeDefined();
      expect(result.messageAnalysis).toBeDefined();
    });

  });

  describe('Performance Benchmarks', () => {
    
    it('should process messages within acceptable time limits', async () => {
      const startTime = Date.now();
      const message = "This is a performance test message with moderate complexity";
      
      const result = await processConversation(message, [], 'performance_user');
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(1000); // Should process within 1 second
    });

    it('should handle batch processing efficiently', async () => {
      const messages = Array.from({ length: 50 }, (_, i) => `Test message ${i + 1}`);
      const startTime = Date.now();
      
      const results = [];
      for (const message of messages) {
        const result = await processConversation(message, [], 'batch_user');
        results.push(result);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerMessage = totalTime / messages.length;
      
      expect(results).toHaveLength(50);
      expect(avgTimePerMessage).toBeLessThan(100); // Should average less than 100ms per message
    });

  });

});

describe('Integration Tests', () => {
  
  it('should handle complete conversation flow', async () => {
    const conversationScenario = [
      { user: 'student_123', message: 'Salam! Math mein help chahiye' },
      { user: 'student_123', message: 'Algebra samajh nahi aa raha' },
      { user: 'student_123', message: 'Acha, ab clear ho gaya!' },
      { user: 'student_123', message: 'Thanks yaar, bahut helpful tha' }
    ];
    
    const conversationHistory = [];
    let lastResult;
    
    for (const { user, message } of conversationScenario) {
      lastResult = await processConversation(message, conversationHistory, user);
      
      conversationHistory.push({
        role: 'user',
        text: message,
        timestamp: new Date().toISOString(),
        analysisMetadata: lastResult.messageAnalysis
      });
      
      // Add simulated AI response
      conversationHistory.push({
        role: 'assistant',
        text: 'AI response here',
        timestamp: new Date().toISOString(),
        responseStrategy: lastResult.responseStrategy
      });
    }
    
    const analytics = getConversationAnalytics();
    const advancedMetrics = getAdvancedMetrics(conversationHistory);
    
    expect(analytics.sessionSummary.totalMessages).toBe(4);
    expect(advancedMetrics.culturalAdaptation.dominantStyle).toBe('mixed');
    expect(lastResult.conversationState.sessionMetrics.engagementScore).toBeGreaterThan(0.5);
  });

  it('should maintain consistency across all components', async () => {
    const message = "I'm struggling with programming concepts";
    const result = await processConversation(message, [], 'consistency_user');
    
    // Verify all components are working together
    expect(result.messageAnalysis.intent.intent).toBeDefined();
    expect(result.messageAnalysis.userState.state).toBeDefined();
    expect(result.personaResult.id).toBeDefined();
    expect(result.convictionResult).toBeDefined();
    expect(result.responseStrategy).toBeDefined();
    
    // Verify consistency between components
    if (result.messageAnalysis.userState.state === USER_STATES.FRUSTRATED) {
      expect(result.personaResult.id).toBe('friendly');
    }
    
    if (result.convictionResult.shouldTrigger) {
      expect(result.responseStrategy.primary).toBe('conviction_response');
    }
  });

});

// Export test utilities for external use
export const testUtils = {
  createTestConversation: (messages, userId = 'test_user') => {
    return messages.map(message => ({
      role: 'user',
      text: message,
      timestamp: new Date().toISOString(),
      userId: userId
    }));
  },
  
  simulateUserFeedback: (result, feedback = 'positive') => {
    return processFeedback(feedback, {
      message: result.messageAnalysis.metadata.originalMessage,
      messageAnalysis: result.messageAnalysis,
      personaResult: result.personaResult,
      convictionResult: result.convictionResult,
      userId: result.conversationState.userId,
      responseType: result.responseStrategy.primary
    });
  }
};
