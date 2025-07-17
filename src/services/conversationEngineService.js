// Enhanced Conversation Engine Service
// Integration layer for existing chat components

import React, { useState, useEffect } from 'react';
import { 
  processConversation, 
  processFeedback, 
  getConversationAnalytics,
  getAdvancedMetrics,
  resetConversationState,
  MESSAGE_INTENTS,
  USER_STATES,
  CONVICTION_SCENARIOS,
  CONVICTION_INTENSITIES
} from '../utils/conversationEngine.js';

import { 
  exportLearningData,
  importLearningData,
  resetLearningData,
  persistMemoryToStorage,
  startAutoSave,
  stopAutoSave
} from '../utils/messageClassifier.js';

import { 
  getUserPersonaHistory,
  trackPersonaFeedback
} from '../utils/aiPersonas.js';

// Service class for conversation engine integration
class ConversationEngineService {
  constructor() {
    this.isInitialized = false;
    this.currentUserId = null;
    this.conversationHistory = [];
    this.analytics = null;
    this.listeners = new Set();
    this.sessionMetrics = {
      messagesProcessed: 0,
      convictionTriggered: 0,
      personaSwitches: 0,
      averageConfidence: 0,
      engagementScore: 0
    };
  }

  // Initialize the service for a specific user
  async initialize(userId) {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      resetConversationState(userId);
      this.conversationHistory = [];
      this.sessionMetrics = {
        messagesProcessed: 0,
        convictionTriggered: 0,
        personaSwitches: 0,
        averageConfidence: 0,
        engagementScore: 0
      };
    }
    
    // Start auto-save for learning data persistence
    startAutoSave();
    
    this.isInitialized = true;
    this.notifyListeners('initialized', { userId });
  }

  // Process a user message through the enhanced conversation engine
  async processUserMessage(message, chatId, currentPersona = null) {
    if (!this.isInitialized) {
      throw new Error('ConversationEngineService not initialized');
    }

    try {
      // Process the message through our enhanced engine
      const result = await processConversation(message, this.conversationHistory, this.currentUserId);
      
      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        text: message,
        timestamp: new Date().toISOString(),
        chatId: chatId,
        analysisMetadata: result.messageAnalysis
      });

      // Update session metrics
      this.sessionMetrics.messagesProcessed++;
      this.sessionMetrics.averageConfidence = 
        (this.sessionMetrics.averageConfidence * (this.sessionMetrics.messagesProcessed - 1) + 
         result.messageAnalysis.intent.confidence) / this.sessionMetrics.messagesProcessed;

      if (result.convictionResult.shouldTrigger) {
        this.sessionMetrics.convictionTriggered++;
      }

      if (currentPersona && currentPersona !== result.personaResult.id) {
        this.sessionMetrics.personaSwitches++;
      }

      this.sessionMetrics.engagementScore = result.conversationState.sessionMetrics.engagementScore;

      // Notify listeners about the processing result
      this.notifyListeners('messageProcessed', {
        message,
        chatId,
        result,
        sessionMetrics: this.sessionMetrics
      });

      return result;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  // Process AI response and add to history
  async processAIResponse(aiResponse, chatId, responseStrategy) {
    if (!this.isInitialized) {
      return;
    }

    this.conversationHistory.push({
      role: 'assistant',
      text: aiResponse,
      timestamp: new Date().toISOString(),
      chatId: chatId,
      responseStrategy: responseStrategy
    });

    // Trim history to keep only recent messages (last 20 for performance)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    this.notifyListeners('aiResponseProcessed', {
      aiResponse,
      chatId,
      responseStrategy
    });
  }

  // Process user feedback for learning
  async processUserFeedback(feedback, messageContext) {
    if (!this.isInitialized) {
      return;
    }

    try {
      const result = processFeedback(feedback, messageContext);
      
      // Persist learning data immediately after feedback to ensure data is saved
      persistMemoryToStorage('ecc_learning_data', result.learningData || {});
      
      this.notifyListeners('feedbackProcessed', {
        feedback,
        result,
        messageContext
      });

      return result;
    } catch (error) {
      console.error('Error processing feedback:', error);
      throw error;
    }
  }

  // Get enhanced message analysis for display
  getMessageAnalysis(message) {
    if (!this.conversationHistory.length) {
      return null;
    }

    const lastUserMessage = this.conversationHistory
      .filter(msg => msg.role === 'user')
      .pop();

    return lastUserMessage?.analysisMetadata || null;
  }

  // Get conversation analytics
  getAnalytics() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      ...getConversationAnalytics(),
      sessionMetrics: this.sessionMetrics,
      conversationHistory: this.conversationHistory
    };
  }

  // Get advanced metrics
  getAdvancedAnalytics() {
    if (!this.isInitialized) {
      return null;
    }

    return getAdvancedMetrics(this.conversationHistory);
  }

  // Get persona history for user
  getPersonaHistory() {
    return getUserPersonaHistory();
  }

  // Track persona feedback
  trackPersonaFeedback(personaId, feedback) {
    trackPersonaFeedback(personaId, feedback);
  }

  // Generate response enhancement based on conviction and persona
  enhanceResponse(originalResponse, convictionResult, personaResult, messageAnalysis) {
    let enhancedResponse = originalResponse;

    // Add conviction phrase if triggered
    if (convictionResult.shouldTrigger) {
      const convictionPhrase = convictionResult.phrase;
      enhancedResponse = `${convictionPhrase}\n\n${enhancedResponse}`;
    }

    // Apply persona-specific enhancements
    if (personaResult.id && messageAnalysis.culturalContext) {
      enhancedResponse = this.applyPersonaEnhancements(
        enhancedResponse, 
        personaResult, 
        messageAnalysis.culturalContext
      );
    }

    return enhancedResponse;
  }

  // Apply persona-specific enhancements
  applyPersonaEnhancements(response, personaResult, culturalContext) {
    let enhancedResponse = response;

    // Apply cultural adaptations
    if (culturalContext.isUrduEnglishMix) {
      if (culturalContext.formalityLevel === 'casual') {
        // Add casual Urdu phrases for friendly interaction
        if (personaResult.id === 'friendly') {
          enhancedResponse += ' 😊';
        }
      } else if (culturalContext.formalityLevel === 'formal') {
        // Make response more formal
        enhancedResponse = enhancedResponse
          .replace(/I'm/g, 'I am')
          .replace(/won't/g, 'will not')
          .replace(/can't/g, 'cannot')
          .replace(/don't/g, 'do not');
      }
    }

    // Apply persona-specific modifications
    switch (personaResult.id) {
      case 'friendly':
        if (!enhancedResponse.includes('😊') && !enhancedResponse.includes('🙂')) {
          enhancedResponse += ' 😊';
        }
        break;
      case 'concise':
        // Keep response concise - no additional modifications needed
        break;
      case 'detailed':
        // Add more detailed explanations marker
        enhancedResponse = `📚 **Detailed Explanation:**\n\n${enhancedResponse}`;
        break;
      case 'socratic':
        // Add thought-provoking questions
        enhancedResponse += '\n\n🤔 What do you think about this? How might you apply this concept?';
        break;
      case 'formal':
        // Ensure formal tone
        enhancedResponse = enhancedResponse
          .replace(/Hi/g, 'Hello')
          .replace(/Thanks/g, 'Thank you');
        break;
    }

    return enhancedResponse;
  }

  // Get conversation insights for UI display
  getConversationInsights() {
    if (!this.isInitialized) {
      return null;
    }

    const analytics = this.getAnalytics();
    const advancedMetrics = this.getAdvancedAnalytics();

    return {
      engagement: {
        score: analytics.sessionSummary.avgEngagement,
        trend: advancedMetrics.engagementAnalysis.trend,
        level: analytics.sessionSummary.avgEngagement > 0.7 ? 'high' : 
               analytics.sessionSummary.avgEngagement > 0.4 ? 'medium' : 'low'
      },
      learning: {
        progression: advancedMetrics.learningProgression.level,
        isProgressing: advancedMetrics.learningProgression.isProgressing,
        score: advancedMetrics.learningProgression.score
      },
      conversation: {
        flow: advancedMetrics.conversationFlow.flow,
        messagesCount: analytics.sessionSummary.totalMessages,
        convictionTriggers: analytics.sessionSummary.convictionTriggers
      },
      cultural: {
        style: advancedMetrics.culturalAdaptation.dominantStyle,
        adaptationNeeded: advancedMetrics.culturalAdaptation.adaptationNeeded
      },
      persona: {
        switches: analytics.sessionSummary.personaSwitches,
        current: analytics.currentState.currentPersona,
        confidence: this.sessionMetrics.averageConfidence
      }
    };
  }

  // Add listener for service events
  addEventListener(callback) {
    this.listeners.add(callback);
  }

  // Remove listener
  removeEventListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in conversation engine listener:', error);
      }
    });
  }

  // Export learning data for backup
  exportLearningData() {
    return exportLearningData();
  }

  // Import learning data from backup
  importLearningData(data) {
    return importLearningData(data);
  }

  // Reset learning data
  resetLearningData() {
    resetLearningData();
  }

  // Get system recommendations
  getSystemRecommendations() {
    const analytics = this.getAnalytics();
    if (!analytics) return [];

    const recommendations = [];

    // Engagement recommendations
    if (analytics.sessionSummary.avgEngagement < 0.3) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        title: 'Low Engagement Detected',
        message: 'Consider using more interactive elements or switching to a friendlier persona',
        action: 'switch_persona',
        target: 'friendly'
      });
    }

    // Learning progression recommendations
    const advancedMetrics = this.getAdvancedAnalytics();
    if (advancedMetrics?.learningProgression && !advancedMetrics.learningProgression.isProgressing) {
      recommendations.push({
        type: 'learning',
        priority: 'medium',
        title: 'Learning Plateau Detected',
        message: 'User may benefit from different learning approaches or more challenging content',
        action: 'adjust_difficulty',
        target: 'increase'
      });
    }

    // Cultural adaptation recommendations
    if (advancedMetrics?.culturalAdaptation?.adaptationNeeded) {
      recommendations.push({
        type: 'cultural',
        priority: 'low',
        title: 'Cultural Adaptation Needed',
        message: 'Consider adjusting language formality to match user\'s communication style',
        action: 'adjust_formality',
        target: advancedMetrics.culturalAdaptation.dominantStyle
      });
    }

    // Persona optimization recommendations
    if (analytics.sessionSummary.personaSwitches > 5) {
      recommendations.push({
        type: 'persona',
        priority: 'medium',
        title: 'Frequent Persona Switches',
        message: 'Consider optimizing persona selection criteria to reduce switches',
        action: 'optimize_persona_selection',
        target: 'stability'
      });
    }

    return recommendations;
  }

  // Clean up service
  cleanup() {
    // Stop auto-save when cleaning up
    stopAutoSave();
    
    this.listeners.clear();
    this.conversationHistory = [];
    this.isInitialized = false;
    this.currentUserId = null;
    this.analytics = null;
  }
}

// Export singleton instance
export const conversationEngineService = new ConversationEngineService();

// Export additional utilities
export const ConversationConstants = {
  MESSAGE_INTENTS,
  USER_STATES,
  CONVICTION_SCENARIOS,
  CONVICTION_INTENSITIES
};

// Export message analysis utilities
export const MessageAnalysisUtils = {
  getIntentLabel: (intent) => {
    const labels = {
      [MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP]: 'Seeking Help',
      [MESSAGE_INTENTS.LEARNING_FOCUSED]: 'Learning',
      [MESSAGE_INTENTS.EXPLORATORY_PLAYFUL]: 'Exploring',
      [MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE]: 'Brainstorming',
      [MESSAGE_INTENTS.DIRECT_TASK_ORIENTED]: 'Direct Task',
      [MESSAGE_INTENTS.EMOTIONAL_SHARING]: 'Emotional Sharing',
      [MESSAGE_INTENTS.GREETING_CASUAL]: 'Greeting',
      [MESSAGE_INTENTS.ACHIEVEMENT_ANNOUNCEMENT]: 'Achievement',
      [MESSAGE_INTENTS.CHALLENGE_DESCRIPTION]: 'Challenge',
      [MESSAGE_INTENTS.MEMORY_REFERENCE]: 'Memory Reference',
      [MESSAGE_INTENTS.PREFERENCE_EXPRESSION]: 'Preference',
      [MESSAGE_INTENTS.VAGUE_UNCLEAR]: 'Unclear',
      [MESSAGE_INTENTS.TESTING_SYSTEM]: 'Testing'
    };
    return labels[intent] || 'Unknown';
  },

  getUserStateLabel: (state) => {
    const labels = {
      [USER_STATES.FRUSTRATED]: 'Frustrated',
      [USER_STATES.CONFUSED]: 'Confused',
      [USER_STATES.CURIOUS]: 'Curious',
      [USER_STATES.ENGAGED]: 'Engaged',
      [USER_STATES.EXCITED]: 'Excited',
      [USER_STATES.CONFIDENT]: 'Confident',
      [USER_STATES.SATISFIED]: 'Satisfied',
      [USER_STATES.PROUD]: 'Proud',
      [USER_STATES.DISAPPOINTED]: 'Disappointed',
      [USER_STATES.ANXIOUS]: 'Anxious',
      [USER_STATES.GRATEFUL]: 'Grateful',
      [USER_STATES.NOSTALGIC]: 'Nostalgic',
      [USER_STATES.DISINTERESTED]: 'Disinterested',
      [USER_STATES.OVERWHELMED]: 'Overwhelmed'
    };
    return labels[state] || 'Unknown';
  },

  getConfidenceColor: (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  },

  getEngagementColor: (engagement) => {
    if (engagement >= 0.7) return 'text-green-600';
    if (engagement >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  }
};

// Export React hooks for conversation engine
export const useConversationEngine = (userId) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (userId) {
      conversationEngineService.initialize(userId).then(() => {
        setIsInitialized(true);
        setAnalytics(conversationEngineService.getAnalytics());
        setInsights(conversationEngineService.getConversationInsights());
        setRecommendations(conversationEngineService.getSystemRecommendations());
      });
    }

    const handleEngineEvent = (event, data) => {
      if (event === 'messageProcessed') {
        setAnalytics(conversationEngineService.getAnalytics());
        setInsights(conversationEngineService.getConversationInsights());
        setRecommendations(conversationEngineService.getSystemRecommendations());
      }
    };

    conversationEngineService.addEventListener(handleEngineEvent);

    return () => {
      conversationEngineService.removeEventListener(handleEngineEvent);
    };
  }, [userId]);

  return {
    isInitialized,
    analytics,
    insights,
    recommendations,
    service: conversationEngineService
  };
};

export default conversationEngineService;
