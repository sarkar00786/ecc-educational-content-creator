// Integration Tests for Human-Like Conversation System
// Tests the complete flow from message analysis to culturally adapted response

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  analyzeMessage, 
  classifyMessageIntent, 
  MESSAGE_INTENTS, 
  USER_STATES 
} from '../../utils/messageClassifier';
import { processConviction, CONVICTION_SCENARIOS } from '../../utils/convictionLayer';
import { 
  detectAndAdaptFormality, 
  injectCulturalMarkers, 
  generateContextualResponse 
} from '../../config/languageTemplates';
import { ConversationMemory, memoryManager } from '../../utils/conversationMemory';
import { updatePersona } from '../../utils/aiPersonas';

describe('Human-Like Conversation System Integration', () => {
  let testUserId;
  let conversationMemory;

  beforeEach(() => {
    testUserId = 'test-user-' + Date.now();
    conversationMemory = new ConversationMemory(testUserId);
    // Clear localStorage for clean test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Message Classification and Intent Recognition', () => {
    it('should correctly identify Pakistani Urdu frustration patterns', () => {
      const messages = [
        'yaar dimagh kharab ho gaya hai',
        'samajh nahi aa raha kya kar raha hun',
        'mushkil hai yeh problem'
      ];

      messages.forEach(message => {
        const analysis = analyzeMessage(message, []);
        expect(analysis.intent.intent).toBe(MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP);
        expect(analysis.userState.state).toBe(USER_STATES.FRUSTRATED);
        expect(analysis.culturalContext.isUrduEnglishMix).toBe(true);
      });
    });

    it('should detect exploratory and playful intents', () => {
      const messages = [
        'kya hai ye interesting lagta hai',
        'try karna chahta hun yeh',
        'maza aa raha hai experiment karte'
      ];

      messages.forEach(message => {
        const analysis = analyzeMessage(message, []);
        expect(analysis.intent.intent).toBe(MESSAGE_INTENTS.EXPLORATORY_PLAYFUL);
        expect(analysis.culturalContext.isUrduEnglishMix).toBe(true);
      });
    });

    it('should recognize help-seeking patterns', () => {
      const messages = [
        'help karo yaar',
        'samjhao na please',
        'madad chahiye'
      ];

      messages.forEach(message => {
        const analysis = analyzeMessage(message, []);
        expect(analysis.intent.intent).toBe(MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP);
        expect(analysis.intent.confidence).toBeGreaterThan(0.7);
      });
    });
  });

  describe('Conviction Layer', () => {
    it('should identify inefficient learning approaches', () => {
      const message = 'I will just memorize all the formulas';
      const convictionAnalysis = processConviction(message, [], 'math', USER_STATES.CONFIDENT);
      
      expect(convictionAnalysis).not.toBeNull();
      expect(convictionAnalysis.scenario).toBe(CONVICTION_SCENARIOS.INEFFICIENT_APPROACH);
      expect(convictionAnalysis.confidence).toBeGreaterThan(0.7);
    });

    it('should detect giving up patterns in Urdu', () => {
      const message = 'impossible hai yeh, give up karta hun';
      const convictionAnalysis = processConviction(message, [], 'physics', USER_STATES.FRUSTRATED);
      
      expect(convictionAnalysis).not.toBeNull();
      expect(convictionAnalysis.scenario).toBe(CONVICTION_SCENARIOS.DEAD_END_PATH);
      expect(convictionAnalysis.conviction_level).toBe('gentle'); // Should be gentler for frustrated users
    });

    it('should adjust conviction level based on user state', () => {
      const message = 'ratta maar deta hun sab';
      
      // Test with confident user
      const confidentResponse = processConviction(message, [], 'math', USER_STATES.CONFIDENT);
      expect(confidentResponse.conviction_level).toBe('firm');
      
      // Test with frustrated user
      const frustratedResponse = processConviction(message, [], 'math', USER_STATES.FRUSTRATED);
      expect(frustratedResponse.conviction_level).toBe('gentle');
    });
  });

  describe('Cultural Language Adaptation', () => {
    it('should detect formality levels correctly', () => {
      const casualMessage = 'yaar help karo na';
      const formalMessage = 'Could you please help me sir?';
      
      expect(detectAndAdaptFormality(casualMessage)).toBe('casual');
      expect(detectAndAdaptFormality(formalMessage)).toBe('formal');
    });

    it('should inject cultural markers appropriately', () => {
      const text = 'This is a good solution.';
      const culturalText = injectCulturalMarkers(text, 'medium');
      
      // Should contain the original text
      expect(culturalText).toContain('good solution');
      // May contain cultural markers (depends on randomization)
      expect(culturalText.length).toBeGreaterThanOrEqual(text.length);
    });

    it('should generate contextual responses with Pakistani patterns', () => {
      const greetingResponse = generateContextualResponse('greeting', 'casual', 'happy');
      expect(greetingResponse).toMatch(/salam|hello|kya haal|kaise/i);
      
      const helpResponse = generateContextualResponse('confusion_help', 'casual', 'supportive');
      expect(helpResponse).toMatch(/confuse|samajh|mushkil|step by step/i);
    });
  });

  describe('Dynamic Persona System', () => {
    it('should recommend appropriate persona based on intent and state', () => {
      // Frustrated user should get friendly persona
      const frustratedPersona = updatePersona(
        MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP, 
        USER_STATES.CONFUSED
      );
      expect(frustratedPersona.id).toBe('friendly');
      
      // Brainstorming should get socratic persona
      const brainstormingPersona = updatePersona(
        MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE, 
        USER_STATES.ENGAGED
      );
      expect(brainstormingPersona.id).toBe('socratic');
      
      // Direct task should get concise persona
      const directPersona = updatePersona(
        MESSAGE_INTENTS.DIRECT_TASK_ORIENTED, 
        USER_STATES.CONFIDENT
      );
      expect(directPersona.id).toBe('concise');
    });
  });

  describe('Conversation Memory and Learning', () => {
    it('should track user preferences over time', () => {
      const messages = [
        'yaar help karo',
        'bhai samjhao na',
        'yr explain karo'
      ];
      
      messages.forEach(message => {
        const analysis = analyzeMessage(message, []);
        conversationMemory.recordInteraction(message, 'AI response', {
          intent: analysis.intent.intent,
          userState: analysis.userState.state,
          formalityLevel: 'casual'
        });
      });
      
      expect(conversationMemory.userPreferences.preferredFormality).toBe('casual');
      expect(conversationMemory.conversationStats.totalMessages).toBe(3);
    });

    it('should generate proactive questions based on history', () => {
      // Simulate conversation about physics
      conversationMemory.recordInteraction(
        'physics mein help chahiye',
        'Sure, physics ka kya topic?',
        { intent: MESSAGE_INTENTS.LEARNING_FOCUSED, userState: USER_STATES.CURIOUS }
      );
      
      const recommendations = conversationMemory.getPersonalizedRecommendations({
        userState: USER_STATES.CURIOUS,
        intent: MESSAGE_INTENTS.LEARNING_FOCUSED
      });
      
      expect(recommendations.proactiveQuestions.length).toBeGreaterThan(0);
      expect(recommendations.proactiveQuestions[0]).toMatch(/physics/i);
    });

    it('should learn from negative feedback', () => {
      const interactionId = conversationMemory.recordInteraction(
        'test message',
        'AI response',
        { formalityLevel: 'formal' }
      );
      
      conversationMemory.recordFeedback(interactionId, {
        rating: 2,
        issue: 'too_formal',
        type: 'detailed'
      });
      
      expect(conversationMemory.userPreferences.preferredFormality).toBe('casual');
      expect(conversationMemory.userPreferences.culturalMarkerDensity).toBe('high');
    });

    it('should persist and load memory correctly', async () => {
      // Record some interactions
      conversationMemory.recordInteraction('test', 'response', {
        intent: MESSAGE_INTENTS.LEARNING_FOCUSED,
        userState: USER_STATES.ENGAGED
      });
      
      // Persist to localStorage
      await conversationMemory.persistMemory();
      
      // Create new instance and load
      const newMemory = new ConversationMemory(testUserId);
      const loaded = await newMemory.loadMemory();
      
      expect(loaded).toBe(true);
      expect(newMemory.conversationStats.totalMessages).toBe(1);
    });
  });

  describe('Memory Manager Integration', () => {
    it('should manage multiple user memories', () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      
      const memory1 = memoryManager.getUserMemory(userId1);
      const memory2 = memoryManager.getUserMemory(userId2);
      
      expect(memory1).not.toBe(memory2);
      expect(memory1.userId).toBe(userId1);
      expect(memory2.userId).toBe(userId2);
    });

    it('should provide system-wide analytics', () => {
      // Add some users with different preferences
      const memory1 = memoryManager.getUserMemory('user1');
      const memory2 = memoryManager.getUserMemory('user2');
      
      memory1.userPreferences.preferredFormality = 'casual';
      memory2.userPreferences.preferredFormality = 'formal';
      
      memory1.conversationStats.satisfactionScore = 0.8;
      memory2.conversationStats.satisfactionScore = 0.9;
      
      const analytics = memoryManager.getSystemAnalytics();
      
      expect(analytics).not.toBeNull();
      expect(analytics.totalUsers).toBe(2);
      expect(analytics.avgSatisfaction).toBeCloseTo(0.85);
    });
  });

  describe('End-to-End Conversation Flow', () => {
    it('should handle complete conversation flow with cultural adaptation', () => {
      const userMessage = 'yaar dimagh kharab ho gaya, samajh nahi aa raha physics ka concept';
      const conversationHistory = [];
      
      // Step 1: Analyze message
      const analysis = analyzeMessage(userMessage, conversationHistory);
      expect(analysis.intent.intent).toBe(MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP);
      expect(analysis.userState.state).toBe(USER_STATES.FRUSTRATED);
      expect(analysis.culturalContext.isUrduEnglishMix).toBe(true);
      
      // Step 2: Check for conviction
      const conviction = processConviction(userMessage, conversationHistory, 'physics', analysis.userState.state);
      expect(conviction).toBeNull(); // No conviction needed for help-seeking
      
      // Step 3: Adapt persona
      const personaUpdate = updatePersona(analysis.intent.intent, analysis.userState.state);
      expect(personaUpdate.id).toBe('friendly');
      
      // Step 4: Determine formality
      const formality = detectAndAdaptFormality(userMessage);
      expect(formality).toBe('casual');
      
      // Step 5: Generate appropriate response pattern
      const responsePattern = generateContextualResponse('confusion_help', formality, 'supportive');
      expect(responsePattern).toMatch(/confuse|samajh|mushkil/i);
      
      // Step 6: Record interaction
      const memory = memoryManager.getUserMemory(testUserId);
      const interactionId = memory.recordInteraction(userMessage, responsePattern, {
        intent: analysis.intent.intent,
        userState: analysis.userState.state,
        formalityLevel: formality
      });
      
      expect(interactionId).toBeDefined();
      expect(memory.conversationStats.totalMessages).toBe(1);
    });

    it('should handle conviction scenario with cultural sensitivity', () => {
      const userMessage = 'bas ratta maar deta hun formulas, easy ho jayega';
      const conversationHistory = [];
      
      // Analyze message
      const analysis = analyzeMessage(userMessage, conversationHistory);
      
      // Check conviction (should trigger for inefficient approach)
      const conviction = processConviction(userMessage, conversationHistory, 'math', analysis.userState.state);
      expect(conviction).not.toBeNull();
      expect(conviction.scenario).toBe(CONVICTION_SCENARIOS.INEFFICIENT_APPROACH);
      
      // Should use Pakistani cultural phrases in conviction response
      expect(conviction.structure).toContain('Acha, aapka point theek hai yaar');
      expect(conviction.culturalMarkers).toContain('yaar');
      
      // Record with conviction flag
      const memory = memoryManager.getUserMemory(testUserId);
      memory.recordInteraction(userMessage, 'AI conviction response', {
        intent: analysis.intent.intent,
        userState: analysis.userState.state,
        convictionUsed: true
      });
      
      expect(memory.conversationStats.totalMessages).toBe(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty or invalid messages gracefully', () => {
      const emptyAnalysis = analyzeMessage('', []);
      expect(emptyAnalysis.intent.intent).toBe(MESSAGE_INTENTS.TESTING_SYSTEM);
      
      const spacesAnalysis = analyzeMessage('   ', []);
      expect(spacesAnalysis.intent.intent).toBe(MESSAGE_INTENTS.TESTING_SYSTEM);
    });

    it('should handle memory persistence failures', async () => {
      // Mock localStorage to fail
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
      
      const result = await conversationMemory.persistMemory();
      expect(result).toBe(false);
      
      // Restore
      localStorage.setItem = originalSetItem;
    });

    it('should handle corrupted memory data', async () => {
      // Store corrupted data
      localStorage.setItem(`conversation_memory_${testUserId}`, 'invalid json');
      
      const result = await conversationMemory.loadMemory();
      expect(result).toBe(false);
      
      // Should still function with defaults
      expect(conversationMemory.userPreferences.preferredFormality).toBe('casual');
    });
  });
});

describe('Performance and Scalability', () => {
  it('should handle large conversation histories efficiently', () => {
    const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
      role: 'user',
      text: `Message ${i}`,
      timestamp: new Date()
    }));
    
    const start = performance.now();
    const analysis = analyzeMessage('test message', largeHistory);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    expect(analysis.intent.intent).toBeDefined();
  });

  it('should manage memory efficiently with many users', () => {
    const userCount = 100;
    const memories = [];
    
    for (let i = 0; i < userCount; i++) {
      const memory = memoryManager.getUserMemory(`user${i}`);
      memory.recordInteraction('test', 'response', {
        intent: MESSAGE_INTENTS.LEARNING_FOCUSED,
        userState: USER_STATES.ENGAGED
      });
      memories.push(memory);
    }
    
    const analytics = memoryManager.getSystemAnalytics();
    expect(analytics.totalUsers).toBe(userCount);
    expect(analytics.avgMessages).toBe(1);
  });
});
