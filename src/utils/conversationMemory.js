// Conversation Memory & Learning System
// Implements Phase 4: Continuous Learning & Human-in-the-Loop Feedback

import { MESSAGE_INTENTS, USER_STATES } from './messageClassifier';

// Conversation patterns and memory storage
export class ConversationMemory {
  constructor(userId) {
    this.userId = userId;
    this.sessionMemory = new Map();
    this.longTermMemory = new Map();
    this.userPreferences = {
      preferredFormality: 'casual',
      responseLength: 'medium',
      culturalMarkerDensity: 'medium',
      preferredPersonas: [],
      learningStyle: 'visual',
      commonTopics: [],
      likes: new Set(),
      dislikes: new Set(),
      linguisticPatterns: {
        urduUsage: 0.5,
        englishUsage: 0.5,
        commonPhrases: []
      }
    };
    this.conversationStats = {
      totalMessages: 0,
      averageResponseTime: 0,
      satisfactionScore: 0.7,
      completionRate: 0.8,
      topicSwitchFrequency: 0.3,
      confusionIncidents: 0,
      successfulResolutions: 0
    };
  }

  // Add user likes and dislikes to preferences
  updateLikesAndDislikes(message) {
    const likePatterns = [
      /love|like|enjoy|prefer|favour|especially/gi,
    ];
    const dislikePatterns = [
      /hate|dislike|can't stand|avoid|never/gi,
    ];
    
    likePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.userPreferences.likes.add(match);
        });
      }
    });

    dislikePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.userPreferences.dislikes.add(match);
        });
      }
    });
  }

  // Track user interaction patterns
  recordInteraction(message, response, metadata) {
    const interaction = {
      timestamp: new Date(),
      userMessage: message,
      aiResponse: response,
      userIntent: metadata.intent,
      userState: metadata.userState,
      convictionUsed: metadata.convictionUsed,
      formalityLevel: metadata.formalityLevel,
      responseTime: metadata.responseTime,
      feedback: null // Will be populated if user provides feedback
    };

    // Store in session memory
    const sessionKey = `session_${Date.now()}`;
    this.sessionMemory.set(sessionKey, interaction);

    // Update likes and dislikes
    this.updateLikesAndDislikes(message);

    // Update conversation stats
    this.conversationStats.totalMessages++;
    this.updateUserPreferences(message, response, metadata);
    
    return sessionKey;
  }

  // Update user preferences based on interaction patterns
  updateUserPreferences(userMessage, aiResponse, metadata) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Track formality preference
    const casualMarkers = ['yaar', 'bhai', 'yr', 'tum'];
    const formalMarkers = ['aap', 'sir', 'please', 'thank you'];
    
    const casualCount = casualMarkers.filter(marker => lowerMessage.includes(marker)).length;
    const formalCount = formalMarkers.filter(marker => lowerMessage.includes(marker)).length;
    
    if (casualCount > formalCount) {
      this.userPreferences.preferredFormality = 'casual';
    } else if (formalCount > casualCount) {
      this.userPreferences.preferredFormality = 'formal';
    }

    // Track linguistic patterns
    const urduWords = ['hai', 'ho', 'ke', 'ka', 'ki', 'mein', 'se', 'ko'];
    const urduCount = urduWords.filter(word => lowerMessage.includes(word)).length;
    const totalWords = lowerMessage.split(/\s+/).length;
    
    if (totalWords > 0) {
      this.userPreferences.linguisticPatterns.urduUsage = 
        (this.userPreferences.linguisticPatterns.urduUsage + (urduCount / totalWords)) / 2;
    }

    // Track response length preference
    if (userMessage.length > 100) {
      this.userPreferences.responseLength = 'detailed';
    } else if (userMessage.length < 20) {
      this.userPreferences.responseLength = 'concise';
    }

    // Track preferred personas based on positive interactions
    if (metadata.userState === USER_STATES.ENGAGED || metadata.userState === USER_STATES.SATISFIED) {
      const currentPersona = metadata.selectedPersona;
      if (currentPersona && !this.userPreferences.preferredPersonas.includes(currentPersona)) {
        this.userPreferences.preferredPersonas.push(currentPersona);
      }
    }
  }

  // Update interaction memory with enhanced data
  updateInteractionMemory(interactionData) {
    const { messageContent, analysis, timestamp, chatContext } = interactionData;
    
    // Create interaction record
    const interaction = {
      timestamp: timestamp || new Date(),
      userMessage: messageContent,
      messageAnalysis: analysis,
      chatContext: chatContext || {},
      userIntent: analysis?.intent || MESSAGE_INTENTS.VAGUE_UNCLEAR,
      userState: analysis?.userState?.state || USER_STATES.NEUTRAL,
      messageComplexity: analysis?.complexity || 'medium',
      sentiment: analysis?.sentiment || 'neutral'
    };

    // Store in session memory
    const sessionKey = `interaction_${timestamp?.getTime() || Date.now()}`;
    this.sessionMemory.set(sessionKey, interaction);

    // Update user preferences based on interaction
    this.updateUserPreferences(messageContent, '', {
      userState: interaction.userState,
      selectedPersona: chatContext?.aiPersona
    });

    // Update conversation stats
    this.conversationStats.totalMessages++;
    
    // Update likes and dislikes based on message content
    if (typeof messageContent === 'string') {
      this.updateLikesAndDislikes(messageContent);
    }
    
    return sessionKey;
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(currentContext) {
    const recommendations = {
      suggestedPersona: null,
      suggestedFormality: this.userPreferences.preferredFormality,
      suggestedResponseLength: this.userPreferences.responseLength,
      culturalMarkerDensity: this.userPreferences.culturalMarkerDensity,
      proactiveQuestions: [],
      followUpSuggestions: []
    };

    // Recommend persona based on context and preferences
    if (currentContext.userState === USER_STATES.CONFUSED) {
      recommendations.suggestedPersona = 'friendly';
    } else if (currentContext.intent === MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE) {
      recommendations.suggestedPersona = 'socratic';
    } else if (this.userPreferences.preferredPersonas.length > 0) {
      recommendations.suggestedPersona = this.userPreferences.preferredPersonas[0];
    }

    // Generate proactive questions based on conversation history
    const recentTopics = this.getRecentTopics();
    if (recentTopics.length > 0) {
      recommendations.proactiveQuestions = this.generateProactiveQuestions(recentTopics);
    }

    return recommendations;
  }

  // Generate proactive conversation starters
  generateProactiveQuestions(recentTopics) {
    const questions = [];
    const formality = this.userPreferences.preferredFormality;
    
    recentTopics.forEach(topic => {
      if (formality === 'casual') {
        questions.push(`Yaar, ${topic} ka follow-up kaise chal raha hai?`);
        questions.push(`Kya ${topic} wala concept clear ho gaya tha?`);
        questions.push(`${topic} mein aur kuch help chahiye?`);
      } else {
        questions.push(`How is your progress with ${topic}?`);
        questions.push(`Do you need further clarification on ${topic}?`);
        questions.push(`Would you like to explore ${topic} in more depth?`);
      }
    });

    return questions.slice(0, 3); // Limit to 3 suggestions
  }

  // Get recent conversation topics
  getRecentTopics(limit = 5) {
    const topics = [];
    const recentInteractions = Array.from(this.sessionMemory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    // Extract topics from messages (simplified topic extraction)
    recentInteractions.forEach(interaction => {
      const message = interaction.userMessage.toLowerCase();
      const words = message.split(/\s+/);
      
      // Look for potential topics (nouns, subjects)
      const potentialTopics = words.filter(word => 
        word.length > 4 && 
        !['this', 'that', 'with', 'have', 'been', 'were', 'they', 'what', 'when', 'where'].includes(word)
      );
      
      topics.push(...potentialTopics);
    });

    // Return unique topics
    return [...new Set(topics)];
  }

  // Record user feedback
  recordFeedback(interactionId, feedback) {
    if (this.sessionMemory.has(interactionId)) {
      const interaction = this.sessionMemory.get(interactionId);
      interaction.feedback = {
        ...feedback,
        timestamp: new Date()
      };
      this.sessionMemory.set(interactionId, interaction);
      
      // Update satisfaction score
      if (feedback.rating) {
        const adjustedScore = feedback.rating * (feedback.importance || 1);
        this.conversationStats.satisfactionScore = 
          (this.conversationStats.satisfactionScore + adjustedScore) / 2;
      }
      
      // Learn from negative feedback
      if (feedback.rating < 3) {
        this.learnFromNegativeFeedback(interaction, feedback);
      }
      
      // Learn from positive feedback
      if (feedback.rating > 3) {
        this.learnFromPositiveFeedback(interaction, feedback);
      }
    }
  }

  // Learn from positive feedback
  learnFromPositiveFeedback(interaction, feedback) {
    if (feedback.appreciatedFeature) {
      if (!this.userPreferences.commonTopics.includes(feedback.appreciatedFeature)) {
        this.userPreferences.commonTopics.push(feedback.appreciatedFeature);
      }
    }
  }

  // Learn from negative feedback
  learnFromNegativeFeedback(interaction, feedback) {
    // Adjust preferences based on feedback
    if (feedback.issue === 'too_formal') {
      this.userPreferences.preferredFormality = 'casual';
      this.userPreferences.culturalMarkerDensity = 'high';
    } else if (feedback.issue === 'too_casual') {
      this.userPreferences.preferredFormality = 'formal';
      this.userPreferences.culturalMarkerDensity = 'low';
    } else if (feedback.issue === 'too_long') {
      this.userPreferences.responseLength = 'concise';
    } else if (feedback.issue === 'too_short') {
      this.userPreferences.responseLength = 'detailed';
    } else if (feedback.issue === 'wrong_persona') {
      // Remove persona from preferred list
      const persona = interaction.metadata?.selectedPersona;
      if (persona) {
        this.userPreferences.preferredPersonas = 
          this.userPreferences.preferredPersonas.filter(p => p !== persona);
      }
    }
  }

  // Get conversation analytics
  getAnalytics() {
    return {
      ...this.conversationStats,
      userPreferences: this.userPreferences,
      recentTopics: this.getRecentTopics(),
      memorySize: this.sessionMemory.size,
      lastInteraction: this.getLastInteraction()
    };
  }

  // Get last interaction
  getLastInteraction() {
    const interactions = Array.from(this.sessionMemory.values());
    return interactions.length > 0 ? 
      interactions[interactions.length - 1] : null;
  }

  // Add missing methods used by updateInteractionMemory
  addInteraction(timestamp, message, response, metadata) {
    const interaction = {
      timestamp,
      userMessage: message,
      aiResponse: response,
      metadata: metadata || {}
    };
    
    const sessionKey = `interaction_${timestamp.getTime ? timestamp.getTime() : Date.now()}`;
    this.sessionMemory.set(sessionKey, interaction);
    return sessionKey;
  }

  saveToStorage() {
    // Use the existing persistMemory method
    this.persistMemory();
  }

  // Persist memory to storage
  async persistMemory() {
    const memoryData = {
      userPreferences: this.userPreferences,
      conversationStats: this.conversationStats,
      recentInteractions: Array.from(this.sessionMemory.entries()).slice(-20), // Keep last 20
      lastUpdated: new Date()
    };

    // Store in localStorage for now (could be extended to Firebase)
    try {
      localStorage.setItem(`conversation_memory_${this.userId}`, JSON.stringify(memoryData));
      return true;
    } catch (error) {
      console.error('Failed to persist memory:', error);
      return false;
    }
  }

  // Load memory from storage
  async loadMemory() {
    try {
      const stored = localStorage.getItem(`conversation_memory_${this.userId}`);
      if (stored) {
        const memoryData = JSON.parse(stored);
        this.userPreferences = { ...this.userPreferences, ...memoryData.userPreferences };
        this.conversationStats = { ...this.conversationStats, ...memoryData.conversationStats };
        
        // Restore recent interactions
        if (memoryData.recentInteractions) {
          memoryData.recentInteractions.forEach(([key, interaction]) => {
            this.sessionMemory.set(key, interaction);
          });
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
    return false;
  }

  // Clear memory (for privacy/reset)
  clearMemory() {
    this.sessionMemory.clear();
    this.longTermMemory.clear();
    this.userPreferences = {
      preferredFormality: 'casual',
      responseLength: 'medium',
      culturalMarkerDensity: 'medium',
      preferredPersonas: [],
      learningStyle: 'visual',
      commonTopics: [],
      linguisticPatterns: {
        urduUsage: 0.5,
        englishUsage: 0.5,
        commonPhrases: []
      }
    };
    this.conversationStats = {
      totalMessages: 0,
      averageResponseTime: 0,
      satisfactionScore: 0.7,
      completionRate: 0.8,
      topicSwitchFrequency: 0.3,
      confusionIncidents: 0,
      successfulResolutions: 0
    };
    
    // Clear from storage
    localStorage.removeItem(`conversation_memory_${this.userId}`);
  }
}

// Global memory manager
export class ConversationMemoryManager {
  constructor() {
    this.userMemories = new Map();
  }

  // Get or create memory for user
  getUserMemory(userId) {
    if (!this.userMemories.has(userId)) {
      const memory = new ConversationMemory(userId);
      this.userMemories.set(userId, memory);
      // Load existing memory
      memory.loadMemory();
    }
    return this.userMemories.get(userId);
  }

  // Persist all user memories
  async persistAllMemories() {
    const promises = Array.from(this.userMemories.values()).map(memory => 
      memory.persistMemory()
    );
    return Promise.all(promises);
  }

  // Get system-wide analytics
  getSystemAnalytics() {
    const allMemories = Array.from(this.userMemories.values());
    const totalUsers = allMemories.length;
    
    if (totalUsers === 0) return null;

    const avgSatisfaction = allMemories.reduce((sum, memory) => 
      sum + memory.conversationStats.satisfactionScore, 0) / totalUsers;
    
    const avgMessages = allMemories.reduce((sum, memory) => 
      sum + memory.conversationStats.totalMessages, 0) / totalUsers;

    const commonPreferences = {
      formality: this.getMostCommonPreference(allMemories, 'preferredFormality'),
      responseLength: this.getMostCommonPreference(allMemories, 'responseLength'),
      culturalMarkerDensity: this.getMostCommonPreference(allMemories, 'culturalMarkerDensity')
    };

    return {
      totalUsers,
      avgSatisfaction,
      avgMessages,
      commonPreferences
    };
  }

  // Get most common preference across users
  getMostCommonPreference(memories, preferenceKey) {
    const preferences = memories.map(memory => memory.userPreferences[preferenceKey]);
    const counts = preferences.reduce((acc, pref) => {
      acc[pref] = (acc[pref] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }
}

// Export singleton instance
export const memoryManager = new ConversationMemoryManager();
