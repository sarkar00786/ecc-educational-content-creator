// ChatEnhancementIntegration.js - Integration layer for enhanced chat features
// Brings together entity recognition, user preferences, and Roman Urdu support

import { extractEntities, extractEntitiesFromHistory } from './EntityRecognition.js';
import { EnhancedUserPreferences } from './EnhancedUserPreferences.js';
import { analyzeMessage } from './messageClassifier.js';
import { filterHindiContent, containsRomanUrdu } from './languageFilter.js';

/**
 * Enhanced Chat Integration System
 * Coordinates entity recognition, user preferences, and language processing
 */
export class ChatEnhancementIntegration {
  constructor() {
    this.userPreferences = new EnhancedUserPreferences();
    this.initialized = false;
  }

  /**
   * Initialize the system with user data
   * @param {Object} userData - Existing user data from database
   */
  initialize(userData = null) {
    if (userData && userData.preferences) {
      this.userPreferences.importProfile(userData.preferences);
    }
    this.initialized = true;
  }

  /**
   * Process an incoming user message
   * @param {string} message - User message text
   * @param {Array} conversationHistory - Recent conversation history
   * @returns {Object} - Enhanced message processing results
   */
  processUserMessage(message, conversationHistory = []) {
    if (!this.initialized) {
      this.initialize();
    }

    // 1. Language processing - filter Hindi while preserving Roman Urdu
    const filteredMessage = filterHindiContent(message);
    const hasRomanUrdu = containsRomanUrdu(message);

    // 2. Entity extraction
    const entities = extractEntities(filteredMessage);
    const historicalEntities = extractEntitiesFromHistory(conversationHistory);

    // 3. Message analysis
    const messageAnalysis = analyzeMessage(filteredMessage, conversationHistory);

    // 4. Update user preferences
    this.userPreferences.processMessage(filteredMessage, messageAnalysis, conversationHistory);

    // 5. Get personalized recommendations
    const recommendations = this.userPreferences.getPersonalizedRecommendations();

    // 6. Generate enhanced context
    const enhancedContext = this.generateEnhancedContext(
      entities,
      historicalEntities,
      messageAnalysis,
      recommendations
    );

    return {
      processedMessage: filteredMessage,
      originalMessage: message,
      hasRomanUrdu,
      entities,
      historicalEntities,
      messageAnalysis,
      recommendations,
      enhancedContext,
      userProfile: this.userPreferences.getProfileSummary()
    };
  }

  /**
   * Generate enhanced context for AI response
   * @param {Object} entities - Current message entities
   * @param {Object} historicalEntities - Historical entities
   * @param {Object} messageAnalysis - Message analysis results
   * @param {Object} recommendations - Personalized recommendations
   * @returns {Object} - Enhanced context object
   */
  generateEnhancedContext(entities, historicalEntities, messageAnalysis, recommendations) {
    const context = {
      // Personal context from entities
      personalContext: {
        knownNames: Array.from(new Set([
          ...entities.names || [],
          ...historicalEntities.names || []
        ])),
        mentionedPlaces: Array.from(new Set([
          ...entities.places || [],
          ...historicalEntities.places || []
        ])),
        discussedSubjects: Array.from(new Set([
          ...entities.subjects || [],
          ...historicalEntities.subjects || []
        ])),
        recentEvents: entities.events || [],
        emotionalState: entities.emotions || []
      },

      // Communication preferences
      communicationStyle: {
        preferredFormality: recommendations.responseStyle.formality,
        useRomanUrdu: recommendations.responseStyle.useRomanUrdu,
        responseLength: recommendations.responseStyle.length,
        encouragementLevel: recommendations.responseStyle.encouragementLevel
      },

      // Learning context
      learningContext: {
        preferredSubjects: recommendations.contentSuggestions.preferredSubjects,
        difficultyLevel: recommendations.contentSuggestions.difficultyLevel,
        questioningStyle: recommendations.contentSuggestions.questioningStyle,
        learningPattern: recommendations.interactionApproach.conversationFlow
      },

      // Interaction guidance
      interactionGuidance: {
        userIntent: messageAnalysis.intent?.intent,
        emotionalState: messageAnalysis.userState?.state,
        engagementLevel: recommendations.interactionApproach.engagementLevel,
        helpSeekingStyle: recommendations.interactionApproach.helpStyle
      },

      // Cultural context
      culturalContext: {
        romanUrduUsage: messageAnalysis.culturalContext?.isUrduEnglishMix || false,
        formalityLevel: messageAnalysis.culturalContext?.formalityLevel || 'neutral',
        culturalMarkers: messageAnalysis.culturalContext?.urduMarkers || []
      }
    };

    return context;
  }

  /**
   * Generate AI response prompt with enhanced context
   * @param {string} userMessage - User's message
   * @param {Object} enhancedContext - Enhanced context from processing
   * @returns {string} - Enhanced prompt for AI
   */
  generateAIPrompt(userMessage, enhancedContext) {
    const { personalContext, communicationStyle, learningContext, interactionGuidance, culturalContext } = enhancedContext;

    let prompt = `You are an AI educational assistant. Please respond to the user's message considering the following context:\n\n`;

    // User's message
    prompt += `User Message: "${userMessage}"\n\n`;

    // Personal context
    if (personalContext.knownNames.length > 0) {
      prompt += `Known Names: ${personalContext.knownNames.join(', ')}\n`;
    }
    if (personalContext.mentionedPlaces.length > 0) {
      prompt += `Mentioned Places: ${personalContext.mentionedPlaces.join(', ')}\n`;
    }
    if (personalContext.discussedSubjects.length > 0) {
      prompt += `Discussed Subjects: ${personalContext.discussedSubjects.join(', ')}\n`;
    }

    // Communication style
    prompt += `\nCommunication Guidelines:\n`;
    prompt += `- Formality Level: ${communicationStyle.preferredFormality}\n`;
    prompt += `- Response Length: ${communicationStyle.responseLength}\n`;
    prompt += `- Encouragement Level: ${communicationStyle.encouragementLevel}\n`;
    
    if (communicationStyle.useRomanUrdu) {
      prompt += `- Use Roman Urdu: Yes (mix some Roman Urdu words naturally)\n`;
    } else {
      prompt += `- Use Roman Urdu: No (stick to English)\n`;
    }

    // Learning context
    if (learningContext.preferredSubjects.length > 0) {
      prompt += `\nPreferred Subjects: ${learningContext.preferredSubjects.join(', ')}\n`;
    }
    prompt += `Difficulty Level: ${learningContext.difficultyLevel}\n`;
    prompt += `Questioning Style: ${learningContext.questioningStyle}\n`;

    // Interaction guidance
    prompt += `\nInteraction Context:\n`;
    prompt += `- User Intent: ${interactionGuidance.userIntent}\n`;
    prompt += `- Emotional State: ${interactionGuidance.emotionalState}\n`;
    prompt += `- Engagement Level: ${interactionGuidance.engagementLevel}\n`;

    // Cultural context
    if (culturalContext.romanUrduUsage) {
      prompt += `\nCultural Context: User uses Roman Urdu mixed with English\n`;
    }

    prompt += `\nInstructions:\n`;
    prompt += `1. Respond naturally and helpfully to the user's message\n`;
    prompt += `2. Use the preferred communication style\n`;
    prompt += `3. Reference known entities when relevant\n`;
    prompt += `4. Adapt to the user's emotional state and engagement level\n`;
    prompt += `5. Provide appropriate level of detail based on difficulty preference\n`;
    prompt += `6. IMPORTANT: Do not use Hindi words or pronunciation - only Roman Urdu if specified\n`;
    prompt += `7. Be culturally sensitive and supportive\n\n`;

    return prompt;
  }

  /**
   * Get user insights for dashboard/analytics
   * @returns {Object} - User insights and statistics
   */
  getUserInsights() {
    const profile = this.userPreferences.getProfileSummary();
    const recommendations = this.userPreferences.getPersonalizedRecommendations();

    return {
      profile,
      recommendations,
      stats: {
        interactionCount: this.userPreferences.interactionCount,
        romanUrduUsage: profile.language.romanUrduUsage,
        topSubjects: profile.learning.topSubjects,
        dominantEmotion: profile.insights.dominantEmotion,
        engagementLevel: profile.insights.engagementLevel
      }
    };
  }

  /**
   * Update user preferences manually
   * @param {Object} preferences - Preference updates
   */
  updatePreferences(preferences) {
    // This allows manual preference updates from UI
    if (preferences.language) {
      Object.assign(this.userPreferences.userProfile.language, preferences.language);
    }
    if (preferences.learning) {
      Object.assign(this.userPreferences.userProfile.learning, preferences.learning);
    }
    if (preferences.interaction) {
      Object.assign(this.userPreferences.userProfile.interaction, preferences.interaction);
    }
  }

  /**
   * Export user data for persistence
   * @returns {Object} - Serializable user data
   */
  exportUserData() {
    return {
      preferences: this.userPreferences.exportProfile(),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Process AI response for additional enhancements
   * @param {string} aiResponse - AI's response
   * @param {Object} enhancedContext - Context used for generation
   * @returns {Object} - Enhanced response object
   */
  processAIResponse(aiResponse, enhancedContext) {
    // 1. Validate language compliance
    const filteredResponse = filterHindiContent(aiResponse);
    const hasRomanUrdu = containsRomanUrdu(aiResponse);

    // 2. Extract entities from AI response
    const responseEntities = extractEntities(filteredResponse);

    // 3. Generate follow-up suggestions
    const followUpSuggestions = this.generateFollowUpSuggestions(enhancedContext, responseEntities);

    return {
      originalResponse: aiResponse,
      processedResponse: filteredResponse,
      hasRomanUrdu,
      responseEntities,
      followUpSuggestions,
      confidence: this.calculateResponseConfidence(enhancedContext)
    };
  }

  /**
   * Generate follow-up suggestions based on context
   * @param {Object} enhancedContext - Enhanced context
   * @param {Object} responseEntities - Entities from AI response
   * @returns {Array} - Array of follow-up suggestions
   */
  generateFollowUpSuggestions(enhancedContext, responseEntities) {
    const suggestions = [];
    const { learningContext, interactionGuidance } = enhancedContext;

    // Subject-based suggestions
    if (learningContext.preferredSubjects.length > 0) {
      const subject = learningContext.preferredSubjects[0];
      suggestions.push(`Would you like to explore more about ${subject}?`);
    }

    // Difficulty-based suggestions
    if (learningContext.difficultyLevel === 'easy') {
      suggestions.push("Need more examples to understand better?");
    } else if (learningContext.difficultyLevel === 'hard') {
      suggestions.push("Want to dive deeper into this topic?");
    }

    // Emotional state suggestions
    if (interactionGuidance.emotionalState === 'confused') {
      suggestions.push("Should I break this down into smaller steps?");
    } else if (interactionGuidance.emotionalState === 'excited') {
      suggestions.push("Ready for the next challenge?");
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Calculate response confidence based on context quality
   * @param {Object} enhancedContext - Enhanced context
   * @returns {number} - Confidence score (0-1)
   */
  calculateResponseConfidence(enhancedContext) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on available context
    if (enhancedContext.personalContext.knownNames.length > 0) confidence += 0.1;
    if (enhancedContext.personalContext.discussedSubjects.length > 0) confidence += 0.1;
    if (enhancedContext.interactionGuidance.userIntent) confidence += 0.1;
    if (enhancedContext.interactionGuidance.emotionalState) confidence += 0.1;
    if (enhancedContext.communicationStyle.preferredFormality !== 'neutral') confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Get system health and performance metrics
   * @returns {Object} - System metrics
   */
  getSystemMetrics() {
    return {
      initialized: this.initialized,
      userInteractionCount: this.userPreferences.interactionCount,
      preferenceUpdateThreshold: this.userPreferences.updateThreshold,
      lastProcessed: new Date().toISOString(),
      features: {
        entityRecognition: true,
        userPreferences: true,
        romanUrduSupport: true,
        hindiFiltering: true
      }
    };
  }
}

export default ChatEnhancementIntegration;
