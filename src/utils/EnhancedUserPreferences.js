// EnhancedUserPreferences.js - Advanced User Preference Learning System
// Integrates with entity recognition and builds detailed user profiles

import { extractEntities, extractEntitiesFromHistory } from './EntityRecognition.js';
import { MESSAGE_INTENTS, USER_STATES } from './messageClassifier.js';

/**
 * Enhanced User Preference Learning System
 * Learns from user interactions and builds detailed preference profiles
 */
export class EnhancedUserPreferences {
  constructor() {
    this.userProfile = {
      // Language preferences
      language: {
        romanUrduUsage: 0,
        formalityLevel: 'neutral', // casual, neutral, formal
        preferredGreeting: 'general',
        responseLength: 'medium' // short, medium, long
      },
      
      // Learning preferences
      learning: {
        preferredSubjects: {},
        learningStyle: 'mixed', // visual, auditory, kinesthetic, mixed
        difficultyLevel: 'medium',
        questioningPattern: 'balanced', // theoretical, practical, balanced
        feedbackPreference: 'encouraging' // direct, encouraging, detailed
      },
      
      // Personal context
      personal: {
        knownNames: new Set(),
        frequentPlaces: new Set(),
        interests: new Set(),
        institutions: new Set(),
        recentEvents: [],
        emotionalPatterns: {},
        timePatterns: {}
      },
      
      // Interaction patterns
      interaction: {
        sessionLength: 'medium',
        questionFrequency: 'normal',
        helpSeekingStyle: 'direct',
        responseToEncouragement: 'positive',
        engagementLevel: 'moderate'
      },
      
      // Conversation history insights
      insights: {
        dominantIntents: {},
        emotionalStates: {},
        topicPreferences: {},
        conversationFlow: 'structured' // structured, casual, mixed
      }
    };
    
    this.learningWeights = {
      recentWeight: 0.7,
      frequencyWeight: 0.3,
      contextWeight: 0.5
    };
    
    this.updateThreshold = 5; // Minimum interactions before updating preferences
    this.interactionCount = 0;
  }
  
  /**
   * Process a new user message and update preferences
   * @param {string} message - User message text
   * @param {Object} messageAnalysis - Analysis from messageClassifier
   * @param {Array} conversationHistory - Recent conversation history
   */
  processMessage(message, messageAnalysis, conversationHistory = []) {
    this.interactionCount++;
    
    // Extract entities from the message
    const entities = extractEntities(message);
    
    // Update personal context with extracted entities
    this.updatePersonalContext(entities);
    
    // Update language preferences
    this.updateLanguagePreferences(message, messageAnalysis);
    
    // Update learning preferences
    this.updateLearningPreferences(messageAnalysis, entities);
    
    // Update interaction patterns
    this.updateInteractionPatterns(messageAnalysis, conversationHistory);
    
    // Update conversation insights
    this.updateConversationInsights(messageAnalysis, entities);
    
    // Periodic preference refinement
    if (this.interactionCount % this.updateThreshold === 0) {
      this.refinePreferences();
    }
  }
  
  /**
   * Update personal context with extracted entities
   * @param {Object} entities - Extracted entities from message
   */
  updatePersonalContext(entities) {
    // Update known names
    if (entities.names && entities.names.length > 0) {
      entities.names.forEach(name => {
        this.userProfile.personal.knownNames.add(name);
      });
    }
    
    // Update frequent places
    if (entities.places && entities.places.length > 0) {
      entities.places.forEach(place => {
        this.userProfile.personal.frequentPlaces.add(place);
      });
    }
    
    // Update interests based on subjects mentioned
    if (entities.subjects && entities.subjects.length > 0) {
      entities.subjects.forEach(subject => {
        this.userProfile.personal.interests.add(subject);
      });
    }
    
    // Update institutions
    if (entities.institutions && entities.institutions.length > 0) {
      entities.institutions.forEach(institution => {
        this.userProfile.personal.institutions.add(institution);
      });
    }
    
    // Update recent events
    if (entities.events && entities.events.length > 0) {
      const timestamp = new Date().toISOString();
      entities.events.forEach(event => {
        this.userProfile.personal.recentEvents.push({
          event,
          timestamp,
          context: 'mentioned'
        });
      });
      
      // Keep only recent events (last 10)
      this.userProfile.personal.recentEvents = this.userProfile.personal.recentEvents.slice(-10);
    }
    
    // Update emotional patterns
    if (entities.emotions && entities.emotions.length > 0) {
      entities.emotions.forEach(emotion => {
        if (!this.userProfile.personal.emotionalPatterns[emotion]) {
          this.userProfile.personal.emotionalPatterns[emotion] = 0;
        }
        this.userProfile.personal.emotionalPatterns[emotion]++;
      });
    }
  }
  
  /**
   * Update language preferences based on message analysis
   * @param {string} message - Original message
   * @param {Object} messageAnalysis - Message analysis results
   */
  updateLanguagePreferences(message, messageAnalysis) {
    // Check for Roman Urdu usage
    if (messageAnalysis.culturalContext && messageAnalysis.culturalContext.isUrduEnglishMix) {
      this.userProfile.language.romanUrduUsage += 0.1;
      this.userProfile.language.romanUrduUsage = Math.min(1.0, this.userProfile.language.romanUrduUsage);
    }
    
    // Update formality level
    if (messageAnalysis.culturalContext && messageAnalysis.culturalContext.formalityLevel) {
      const currentFormality = messageAnalysis.culturalContext.formalityLevel;
      if (currentFormality === 'informal') {
        this.adjustFormalityLevel('casual');
      } else if (currentFormality === 'formal') {
        this.adjustFormalityLevel('formal');
      }
    }
    
    // Determine preferred response length based on message length
    const messageLength = message.length;
    if (messageLength < 50) {
      this.adjustResponseLength('short');
    } else if (messageLength > 200) {
      this.adjustResponseLength('long');
    } else {
      this.adjustResponseLength('medium');
    }
  }
  
  /**
   * Update learning preferences based on message analysis and entities
   * @param {Object} messageAnalysis - Message analysis results
   * @param {Object} entities - Extracted entities
   */
  updateLearningPreferences(messageAnalysis, entities) {
    // Update preferred subjects
    if (entities.subjects && entities.subjects.length > 0) {
      entities.subjects.forEach(subject => {
        if (!this.userProfile.learning.preferredSubjects[subject]) {
          this.userProfile.learning.preferredSubjects[subject] = 0;
        }
        this.userProfile.learning.preferredSubjects[subject]++;
      });
    }
    
    // Update questioning pattern based on intent
    if (messageAnalysis.intent) {
      switch (messageAnalysis.intent.intent) {
        case MESSAGE_INTENTS.DIRECT_TASK_ORIENTED:
          this.adjustQuestioningPattern('practical');
          break;
        case MESSAGE_INTENTS.EXPLORATORY_PLAYFUL:
          this.adjustQuestioningPattern('theoretical');
          break;
        case MESSAGE_INTENTS.LEARNING_FOCUSED:
          this.adjustQuestioningPattern('balanced');
          break;
      }
    }
    
    // Adjust difficulty level based on user state
    if (messageAnalysis.userState) {
      switch (messageAnalysis.userState.state) {
        case USER_STATES.CONFUSED:
        case USER_STATES.OVERWHELMED:
          this.adjustDifficultyLevel('easier');
          break;
        case USER_STATES.CONFIDENT:
        case USER_STATES.ENGAGED:
          this.adjustDifficultyLevel('harder');
          break;
      }
    }
  }
  
  /**
   * Update interaction patterns based on message analysis
   * @param {Object} messageAnalysis - Message analysis results
   * @param {Array} conversationHistory - Recent conversation history
   */
  updateInteractionPatterns(messageAnalysis, conversationHistory) {
    // Update help seeking style
    if (messageAnalysis.intent && messageAnalysis.intent.intent === MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP) {
      this.userProfile.interaction.helpSeekingStyle = 'direct';
    }
    
    // Update engagement level based on user state
    if (messageAnalysis.userState) {
      switch (messageAnalysis.userState.state) {
        case USER_STATES.ENGAGED:
        case USER_STATES.EXCITED:
          this.userProfile.interaction.engagementLevel = 'high';
          break;
        case USER_STATES.DISINTERESTED:
        case USER_STATES.BORED:
          this.userProfile.interaction.engagementLevel = 'low';
          break;
        default:
          this.userProfile.interaction.engagementLevel = 'moderate';
      }
    }
    
    // Analyze conversation flow
    if (conversationHistory.length > 3) {
      const recentMessages = conversationHistory.slice(-3);
      const hasStructuredFlow = recentMessages.some(msg => 
        msg.text && (msg.text.includes('step') || msg.text.includes('first') || msg.text.includes('next'))
      );
      
      if (hasStructuredFlow) {
        this.userProfile.insights.conversationFlow = 'structured';
      } else {
        this.userProfile.insights.conversationFlow = 'casual';
      }
    }
  }
  
  /**
   * Update conversation insights
   * @param {Object} messageAnalysis - Message analysis results
   * @param {Object} entities - Extracted entities
   */
  updateConversationInsights(messageAnalysis, entities) {
    // Update dominant intents
    if (messageAnalysis.intent && messageAnalysis.intent.intent) {
      const intent = messageAnalysis.intent.intent;
      if (!this.userProfile.insights.dominantIntents[intent]) {
        this.userProfile.insights.dominantIntents[intent] = 0;
      }
      this.userProfile.insights.dominantIntents[intent]++;
    }
    
    // Update emotional states
    if (messageAnalysis.userState && messageAnalysis.userState.state) {
      const state = messageAnalysis.userState.state;
      if (!this.userProfile.insights.emotionalStates[state]) {
        this.userProfile.insights.emotionalStates[state] = 0;
      }
      this.userProfile.insights.emotionalStates[state]++;
    }
    
    // Update topic preferences
    if (entities.subjects && entities.subjects.length > 0) {
      entities.subjects.forEach(subject => {
        if (!this.userProfile.insights.topicPreferences[subject]) {
          this.userProfile.insights.topicPreferences[subject] = 0;
        }
        this.userProfile.insights.topicPreferences[subject]++;
      });
    }
  }
  
  /**
   * Helper method to adjust formality level
   * @param {string} tendency - 'casual' or 'formal'
   */
  adjustFormalityLevel(tendency) {
    const currentLevel = this.userProfile.language.formalityLevel;
    if (tendency === 'casual' && currentLevel !== 'casual') {
      this.userProfile.language.formalityLevel = currentLevel === 'formal' ? 'neutral' : 'casual';
    } else if (tendency === 'formal' && currentLevel !== 'formal') {
      this.userProfile.language.formalityLevel = currentLevel === 'casual' ? 'neutral' : 'formal';
    }
  }
  
  /**
   * Helper method to adjust response length preference
   * @param {string} length - 'short', 'medium', or 'long'
   */
  adjustResponseLength(length) {
    // Weighted adjustment based on frequency
    const currentPreference = this.userProfile.language.responseLength;
    if (length !== currentPreference) {
      // Gradually adjust preference
      this.userProfile.language.responseLength = length;
    }
  }
  
  /**
   * Helper method to adjust questioning pattern
   * @param {string} pattern - 'theoretical', 'practical', or 'balanced'
   */
  adjustQuestioningPattern(pattern) {
    const currentPattern = this.userProfile.learning.questioningPattern;
    if (pattern !== currentPattern) {
      // Gradually shift toward the new pattern
      this.userProfile.learning.questioningPattern = pattern;
    }
  }
  
  /**
   * Helper method to adjust difficulty level
   * @param {string} direction - 'easier' or 'harder'
   */
  adjustDifficultyLevel(direction) {
    const levels = ['easy', 'medium', 'hard'];
    const currentIndex = levels.indexOf(this.userProfile.learning.difficultyLevel);
    
    if (direction === 'easier' && currentIndex > 0) {
      this.userProfile.learning.difficultyLevel = levels[currentIndex - 1];
    } else if (direction === 'harder' && currentIndex < levels.length - 1) {
      this.userProfile.learning.difficultyLevel = levels[currentIndex + 1];
    }
  }
  
  /**
   * Refine preferences based on accumulated data
   */
  refinePreferences() {
    // Find most frequent subjects
    const subjectCounts = this.userProfile.learning.preferredSubjects;
    const sortedSubjects = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    // Find most common emotional state
    const emotionalCounts = this.userProfile.insights.emotionalStates;
    const dominantEmotion = Object.entries(emotionalCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Adjust learning style based on dominant emotion
    if (dominantEmotion) {
      const [emotion] = dominantEmotion;
      if (emotion === USER_STATES.EXCITED || emotion === USER_STATES.ENGAGED) {
        this.userProfile.learning.feedbackPreference = 'encouraging';
      } else if (emotion === USER_STATES.CONFUSED || emotion === USER_STATES.FRUSTRATED) {
        this.userProfile.learning.feedbackPreference = 'detailed';
      }
    }
  }
  
  /**
   * Get personalized recommendations based on user profile
   * @returns {Object} - Personalized recommendations
   */
  getPersonalizedRecommendations() {
    const recommendations = {
      responseStyle: {},
      contentSuggestions: {},
      interactionApproach: {}
    };
    
    // Response style recommendations
    recommendations.responseStyle = {
      useRomanUrdu: this.userProfile.language.romanUrduUsage > 0.3,
      formality: this.userProfile.language.formalityLevel,
      length: this.userProfile.language.responseLength,
      encouragementLevel: this.userProfile.learning.feedbackPreference
    };
    
    // Content suggestions
    const topSubjects = Object.entries(this.userProfile.learning.preferredSubjects)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([subject]) => subject);
    
    recommendations.contentSuggestions = {
      preferredSubjects: topSubjects,
      difficultyLevel: this.userProfile.learning.difficultyLevel,
      questioningStyle: this.userProfile.learning.questioningPattern
    };
    
    // Interaction approach
    recommendations.interactionApproach = {
      engagementLevel: this.userProfile.interaction.engagementLevel,
      helpStyle: this.userProfile.interaction.helpSeekingStyle,
      conversationFlow: this.userProfile.insights.conversationFlow
    };
    
    return recommendations;
  }
  
  /**
   * Get user profile summary
   * @returns {Object} - Condensed user profile
   */
  getProfileSummary() {
    return {
      language: this.userProfile.language,
      learning: {
        topSubjects: Object.entries(this.userProfile.learning.preferredSubjects)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3),
        style: this.userProfile.learning.learningStyle,
        difficulty: this.userProfile.learning.difficultyLevel
      },
      personal: {
        knownNames: Array.from(this.userProfile.personal.knownNames),
        interests: Array.from(this.userProfile.personal.interests),
        recentEvents: this.userProfile.personal.recentEvents.slice(-3)
      },
      insights: {
        dominantEmotion: Object.entries(this.userProfile.insights.emotionalStates)
          .sort(([,a], [,b]) => b - a)[0],
        conversationFlow: this.userProfile.insights.conversationFlow,
        engagementLevel: this.userProfile.interaction.engagementLevel
      }
    };
  }
  
  /**
   * Export user profile for persistence
   * @returns {Object} - Serializable user profile
   */
  exportProfile() {
    return {
      ...this.userProfile,
      personal: {
        ...this.userProfile.personal,
        knownNames: Array.from(this.userProfile.personal.knownNames),
        frequentPlaces: Array.from(this.userProfile.personal.frequentPlaces),
        interests: Array.from(this.userProfile.personal.interests),
        institutions: Array.from(this.userProfile.personal.institutions)
      },
      interactionCount: this.interactionCount,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Import user profile from persistence
   * @param {Object} profileData - Serialized user profile
   */
  importProfile(profileData) {
    if (profileData) {
      this.userProfile = {
        ...profileData,
        personal: {
          ...profileData.personal,
          knownNames: new Set(profileData.personal.knownNames || []),
          frequentPlaces: new Set(profileData.personal.frequentPlaces || []),
          interests: new Set(profileData.personal.interests || []),
          institutions: new Set(profileData.personal.institutions || [])
        }
      };
      this.interactionCount = profileData.interactionCount || 0;
    }
  }
}

export default EnhancedUserPreferences;
