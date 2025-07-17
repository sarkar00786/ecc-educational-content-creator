// Enhanced User Interaction Recording System
// Captures detailed user behaviors, events, preferences, and learning patterns

import { MESSAGE_INTENTS, USER_STATES } from './messageClassifier';

export class UserInteractionRecorder {
  constructor(userId) {
    this.userId = userId;
    this.interactions = new Map();
    this.eventHistory = [];
    this.behaviorPatterns = {
      timeOfDayPreference: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      sessionDuration: [],
      topicProgression: [],
      questionTypes: {
        conceptual: 0,
        practical: 0,
        clarification: 0,
        exploration: 0
      },
      responsePreferences: {
        detailed: 0,
        concise: 0,
        examples: 0,
        stepByStep: 0
      },
      emotionalPatterns: {
        frustrationTriggers: [],
        motivationSources: [],
        confusionPoints: [],
        successIndicators: []
      }
    };
    this.userEvents = {
      personalEvents: [],
      academicEvents: [],
      achievementEvents: [],
      challengeEvents: []
    };
    this.contextualMemory = {
      recentTopics: [],
      ongoingProjects: [],
      recurringChallenges: [],
      preferredExamples: [],
      mentionedNames: new Set(),
      locations: new Set(),
      interests: new Set()
    };
  }

  // Record detailed interaction with context
  recordInteraction(messageOrData, response, metadata = {}) {
    const timestamp = new Date();
    const interactionId = `interaction_${timestamp.getTime()}`;
    
    // Handle both old and new calling patterns
    let message, actualResponse, actualMetadata;
    
    if (typeof messageOrData === 'string') {
      // Old calling pattern: recordInteraction(message, response, metadata)
      message = messageOrData;
      actualResponse = response || '';
      actualMetadata = metadata;
    } else {
      // New calling pattern: recordInteraction(interactionData)
      const data = messageOrData;
      message = data.content || data.userMessage || '';
      actualResponse = data.aiResponse || '';
      actualMetadata = {
        intent: data.analysis?.intent || MESSAGE_INTENTS.VAGUE_UNCLEAR,
        userState: data.analysis?.userState?.state || USER_STATES.CURIOUS,
        sessionId: data.sessionId,
        topicContext: data.subject || 'general',
        responseTime: data.responseTime || 0,
        sentiment: data.analysis?.sentiment || 'neutral',
        personasUsed: data.aiPersona ? [data.aiPersona] : [],
        followUpGenerated: data.followUpGenerated || false,
        ...data.metadata
      };
    }
    
    // Ensure message is a string
    if (typeof message !== 'string') {
      message = String(message || '');
    }
    
    const interaction = {
      id: interactionId,
      timestamp,
      userMessage: message,
      aiResponse: actualResponse,
      metadata: {
        intent: actualMetadata.intent || MESSAGE_INTENTS.VAGUE_UNCLEAR,
        userState: actualMetadata.userState || USER_STATES.CURIOUS,
        sessionId: actualMetadata.sessionId,
        topicContext: actualMetadata.topicContext || 'general',
        responseTime: actualMetadata.responseTime || 0,
        messageLength: message.length,
        complexity: this.assessMessageComplexity(message),
        sentiment: actualMetadata.sentiment || 'neutral',
        culturalMarkers: this.extractCulturalMarkers(message),
        personasUsed: actualMetadata.personasUsed || [],
        followUpGenerated: actualMetadata.followUpGenerated || false
      },
      userBehavior: {
        timeOfDay: this.getTimeOfDay(timestamp),
        sessionPosition: actualMetadata.sessionPosition || 'middle',
        typingSpeed: actualMetadata.typingSpeed || 0,
        correctionsMade: actualMetadata.correctionsMade || 0,
        attachmentsUsed: actualMetadata.attachmentsUsed || []
      },
      contextualData: {
        previousTopic: actualMetadata.previousTopic,
        topicSwitch: actualMetadata.topicSwitch || false,
        referencesMade: this.extractReferences(message),
        questionsAsked: this.countQuestions(message),
        examplesRequested: this.detectExampleRequests(message)
      }
    };

    this.interactions.set(interactionId, interaction);
    this.updateBehaviorPatterns(interaction);
    this.extractAndStoreEvents(message, timestamp);
    this.updateContextualMemory(message, interaction);
    
    return interactionId;
  }

  // Assess message complexity
  assessMessageComplexity(message) {
    // Ensure message is a string
    if (typeof message !== 'string') {
      message = String(message || '');
    }
    
    if (!message.trim()) {
      return 'simple';
    }
    
    const words = message.split(/\s+/).length;
    const sentences = message.split(/[.!?]+/).length;
    const technicalTerms = this.countTechnicalTerms(message);
    const questionCount = this.countQuestions(message);
    
    let complexity = 'simple';
    if (words > 50 || sentences > 3 || technicalTerms > 2 || questionCount > 2) {
      complexity = 'complex';
    } else if (words > 20 || sentences > 1 || technicalTerms > 0 || questionCount > 1) {
      complexity = 'medium';
    }
    
    return complexity;
  }

  // Extract cultural markers from message
  extractCulturalMarkers(message) {
    // Ensure message is a string
    if (typeof message !== 'string') {
      message = String(message || '');
    }
    
    if (!message.trim()) {
      return {
        urduMarkers: [],
        formalMarkers: [],
        casualMarkers: [],
        culturalDensity: 0
      };
    }
    
    const urduMarkers = ['yaar', 'bhai', 'yr', 'na', 'hai', 'ho', 'ke', 'ka', 'ki', 'mein', 'se', 'ko'];
    const formalMarkers = ['sir', 'madam', 'please', 'thank you', 'kindly', 'aap'];
    const casualMarkers = ['bro', 'dude', 'man', 'sup', 'hey', 'yo'];
    
    const foundUrdu = urduMarkers.filter(marker => message.toLowerCase().includes(marker));
    const foundFormal = formalMarkers.filter(marker => message.toLowerCase().includes(marker));
    const foundCasual = casualMarkers.filter(marker => message.toLowerCase().includes(marker));
    
    return {
      urduMarkers: foundUrdu,
      formalMarkers: foundFormal,
      casualMarkers: foundCasual,
      culturalDensity: (foundUrdu.length + foundCasual.length) / message.split(/\s+/).length
    };
  }

  // Extract references (names, places, events)
  extractReferences(message) {
    // Ensure message is a string
    if (typeof message !== 'string') {
      message = String(message || '');
    }
    
    const references = {
      names: [],
      places: [],
      events: [],
      timeReferences: []
    };
    
    if (!message.trim()) {
      return references;
    }
    
    // Extract potential names (capitalized words)
    const words = message.split(/\s+/);
    words.forEach(word => {
      if (/^[A-Z][a-z]+$/.test(word) && !this.isCommonWord(word)) {
        references.names.push(word);
        this.contextualMemory.mentionedNames.add(word);
      }
    });
    
    // Extract time references
    const timePatterns = [
      /yesterday|today|tomorrow|last week|next week|this week/gi,
      /monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi,
      /morning|afternoon|evening|night/gi,
      /\d{1,2}:\d{2}|am|pm/gi
    ];
    
    timePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        references.timeReferences.push(...matches);
      }
    });
    
    // Extract event references
    const eventPatterns = [
      /exam|test|quiz|assignment|project|presentation|interview/gi,
      /birthday|wedding|party|celebration|festival|holiday/gi,
      /meeting|class|lecture|seminar|workshop/gi
    ];
    
    eventPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        references.events.push(...matches);
      }
    });
    
    return references;
  }

  // Count questions in message
  countQuestions(message) {
    const questionMarkers = message.match(/\?/g) || [];
    const questionWords = message.match(/\b(what|how|why|when|where|who|which|kya|kaise|kyun|kab|kahan|kaun)\b/gi) || [];
    return questionMarkers.length + questionWords.length;
  }

  // Detect example requests
  detectExampleRequests(message) {
    const examplePatterns = [
      /example|instance|sample|demonstration/gi,
      /show me|give me|misal|example do|batao/gi,
      /for instance|such as|like/gi
    ];
    
    return examplePatterns.some(pattern => pattern.test(message));
  }

  // Count technical terms
  countTechnicalTerms(message) {
    const technicalPatterns = [
      /\b(algorithm|function|variable|class|object|method|API|database|server|client|framework|library|module|component|interface|protocol|encryption|authentication|authorization|optimization|scalability|architecture|deployment|debugging|testing|validation|integration|configuration|implementation|documentation|specification|requirements|analysis|design|development|maintenance|performance|security|reliability|availability|compatibility|usability|accessibility|portability|maintainability|reusability|extensibility|modularity|abstraction|encapsulation|inheritance|polymorphism|composition|aggregation|association|dependency|coupling|cohesion|complexity|efficiency|effectiveness|productivity|quality|standards|best practices|patterns|principles|methodologies|processes|procedures|guidelines|conventions|styles|formats|structures|models|schemas|templates|frameworks|tools|utilities|libraries|packages|modules|components|services|resources|assets|artifacts|deliverables|milestones|objectives|goals|scope|constraints|assumptions|risks|issues|challenges|opportunities|solutions|alternatives|recommendations|suggestions|proposals|plans|strategies|tactics|approaches|methods|techniques|practices|procedures|steps|stages|phases|cycles|iterations|increments|versions|releases|builds|deployments|installations|configurations|setups|environments|platforms|systems|applications|software|hardware|networks|infrastructure|architecture|design|implementation|development|testing|validation|verification|deployment|maintenance|support|documentation|training|education|learning|teaching|instruction|guidance|assistance|help|support|service|consultation|advice|recommendation|suggestion|proposal|solution|answer|response|feedback|evaluation|assessment|analysis|review|inspection|examination|investigation|research|study|survey|interview|observation|experiment|trial|test|pilot|prototype|proof|concept|demonstration|presentation|report|summary|overview|introduction|background|context|scope|objectives|requirements|specifications|constraints|assumptions|risks|issues|challenges|opportunities|solutions|alternatives|recommendations|suggestions|proposals|plans|strategies|tactics|approaches|methods|techniques|practices|procedures|steps|stages|phases|cycles|iterations|increments|versions|releases|builds|deployments|installations|configurations|setups|environments|platforms|systems|applications)\b/gi
    ];
    
    let count = 0;
    technicalPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) count += matches.length;
    });
    
    return count;
  }

  // Check if word is common
  isCommonWord(word) {
    const commonWords = [
      'The', 'And', 'But', 'For', 'Not', 'Yet', 'Can', 'May', 'Will', 'Should', 'Could', 'Would',
      'This', 'That', 'These', 'Those', 'Here', 'There', 'When', 'Where', 'What', 'How', 'Why',
      'Good', 'Bad', 'Big', 'Small', 'New', 'Old', 'First', 'Last', 'Next', 'Right', 'Left'
    ];
    return commonWords.includes(word);
  }

  // Get time of day
  getTimeOfDay(timestamp) {
    const hour = timestamp.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Update behavior patterns
  updateBehaviorPatterns(interaction) {
    const timeOfDay = interaction.userBehavior.timeOfDay;
    this.behaviorPatterns.timeOfDayPreference[timeOfDay]++;
    
    // Update question types
    const intent = interaction.metadata.intent;
    if (intent === MESSAGE_INTENTS.LEARNING_FOCUSED) {
      this.behaviorPatterns.questionTypes.conceptual++;
    } else if (intent === MESSAGE_INTENTS.DIRECT_TASK_ORIENTED) {
      this.behaviorPatterns.questionTypes.practical++;
    } else if (intent === MESSAGE_INTENTS.VAGUE_UNCLEAR) {
      this.behaviorPatterns.questionTypes.clarification++;
    } else if (intent === MESSAGE_INTENTS.EXPLORATORY_PLAYFUL) {
      this.behaviorPatterns.questionTypes.exploration++;
    }
    
    // Update response preferences
    if (interaction.contextualData.examplesRequested) {
      this.behaviorPatterns.responsePreferences.examples++;
    }
    
    if (interaction.metadata.complexity === 'complex') {
      this.behaviorPatterns.responsePreferences.detailed++;
    } else if (interaction.metadata.complexity === 'simple') {
      this.behaviorPatterns.responsePreferences.concise++;
    }
    
    // Update emotional patterns
    const userState = interaction.metadata.userState;
    if (userState === USER_STATES.FRUSTRATED) {
      this.behaviorPatterns.emotionalPatterns.frustrationTriggers.push({
        topic: interaction.metadata.topicContext,
        trigger: interaction.userMessage,
        timestamp: interaction.timestamp
      });
    } else if (userState === USER_STATES.ENGAGED) {
      this.behaviorPatterns.emotionalPatterns.motivationSources.push({
        topic: interaction.metadata.topicContext,
        source: interaction.userMessage,
        timestamp: interaction.timestamp
      });
    }
  }

  // Extract and store events mentioned in conversation
  extractAndStoreEvents(message, timestamp) {
    const lowerMessage = message.toLowerCase();
    
    // Personal events
    const personalEventPatterns = [
      /birthday|anniversary|graduation|promotion|job|interview|travel|vacation|holiday/gi,
      /wedding|engagement|party|celebration|festival/gi,
      /sick|hospital|doctor|health|medicine|treatment/gi
    ];
    
    personalEventPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.userEvents.personalEvents.push({
            event: match,
            context: message,
            timestamp,
            category: 'personal'
          });
        });
      }
    });
    
    // Academic events
    const academicEventPatterns = [
      /exam|test|quiz|assignment|project|presentation|submission|deadline/gi,
      /class|lecture|seminar|workshop|course|semester|term/gi,
      /grade|result|score|marks|percentage|gpa|cgpa/gi
    ];
    
    academicEventPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.userEvents.academicEvents.push({
            event: match,
            context: message,
            timestamp,
            category: 'academic'
          });
        });
      }
    });
    
    // Achievement events
    const achievementPatterns = [
      /won|achieved|completed|finished|successful|passed|cleared|got|received/gi,
      /certificate|award|prize|recognition|appreciation|honor/gi
    ];
    
    achievementPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.userEvents.achievementEvents.push({
            event: match,
            context: message,
            timestamp,
            category: 'achievement'
          });
        });
      }
    });
    
    // Challenge events
    const challengePatterns = [
      /difficult|hard|tough|challenging|struggling|stuck|confused|failed|problem/gi,
      /can't|cannot|unable|impossible|frustrated|overwhelmed|stressed/gi
    ];
    
    challengePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.userEvents.challengeEvents.push({
            event: match,
            context: message,
            timestamp,
            category: 'challenge'
          });
        });
      }
    });
  }

  // Update contextual memory
  updateContextualMemory(message, interaction) {
    // Update recent topics
    const topic = interaction.metadata.topicContext;
    if (topic && topic !== 'general') {
      this.contextualMemory.recentTopics.unshift({
        topic,
        timestamp: interaction.timestamp,
        userState: interaction.metadata.userState,
        intent: interaction.metadata.intent
      });
      
      // Keep only last 10 topics
      if (this.contextualMemory.recentTopics.length > 10) {
        this.contextualMemory.recentTopics = this.contextualMemory.recentTopics.slice(0, 10);
      }
    }
    
    // Extract interests
    const interestPatterns = [
      /love|like|enjoy|interested|fascinated|passionate|hobby|favorite/gi,
      /hate|dislike|boring|uninterested|avoid|don't like/gi
    ];
    
    interestPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        // Extract context around the interest indicator
        const words = message.split(/\s+/);
        matches.forEach(match => {
          const index = words.findIndex(word => word.toLowerCase().includes(match.toLowerCase()));
          if (index !== -1) {
            const context = words.slice(Math.max(0, index - 3), index + 4).join(' ');
            this.contextualMemory.interests.add(context);
          }
        });
      }
    });
    
    // Update ongoing projects
    const projectPatterns = [
      /project|assignment|work|task|working on|building|creating|developing/gi
    ];
    
    projectPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        this.contextualMemory.ongoingProjects.push({
          project: message,
          timestamp: interaction.timestamp,
          status: 'ongoing'
        });
      }
    });
  }

  // Get user behavior insights
  getBehaviorInsights() {
    const totalInteractions = this.interactions.size;
    
    return {
      totalInteractions,
      timePreferences: this.behaviorPatterns.timeOfDayPreference,
      questioningStyle: this.behaviorPatterns.questionTypes,
      responsePreferences: this.behaviorPatterns.responsePreferences,
      emotionalPatterns: this.behaviorPatterns.emotionalPatterns,
      mostActiveTime: this.getMostActiveTime(),
      averageComplexity: this.getAverageComplexity(),
      culturalDensity: this.getAverageCulturalDensity(),
      learningStyle: this.determineLearningStyle(),
      interests: Array.from(this.contextualMemory.interests),
      knownNames: Array.from(this.contextualMemory.mentionedNames),
      recentTopics: this.contextualMemory.recentTopics
    };
  }

  // Get most active time
  getMostActiveTime() {
    const preferences = this.behaviorPatterns.timeOfDayPreference;
    return Object.keys(preferences).reduce((a, b) => 
      preferences[a] > preferences[b] ? a : b
    );
  }

  // Get average message complexity
  getAverageComplexity() {
    const interactions = Array.from(this.interactions.values());
    const complexityScores = interactions.map(i => {
      switch(i.metadata.complexity) {
        case 'simple': return 1;
        case 'medium': return 2;
        case 'complex': return 3;
        default: return 1;
      }
    });
    
    return complexityScores.length > 0 ? 
      complexityScores.reduce((a, b) => a + b) / complexityScores.length : 1;
  }

  // Get average cultural density
  getAverageCulturalDensity() {
    const interactions = Array.from(this.interactions.values());
    const densities = interactions.map(i => i.metadata.culturalMarkers.culturalDensity);
    return densities.length > 0 ? 
      densities.reduce((a, b) => a + b) / densities.length : 0;
  }

  // Determine learning style
  determineLearningStyle() {
    const preferences = this.behaviorPatterns.responsePreferences;
    const total = Object.values(preferences).reduce((a, b) => a + b, 0);
    
    if (total === 0) return 'balanced';
    
    const dominant = Object.keys(preferences).reduce((a, b) => 
      preferences[a] > preferences[b] ? a : b
    );
    
    return dominant;
  }

  // Get events by category
  getEventsByCategory(category) {
    return this.userEvents[category] || [];
  }

  // Get recent events
  getRecentEvents(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const allEvents = [
      ...this.userEvents.personalEvents,
      ...this.userEvents.academicEvents,
      ...this.userEvents.achievementEvents,
      ...this.userEvents.challengeEvents
    ];
    
    return allEvents.filter(event => event.timestamp >= cutoff);
  }

  // Clear old interactions (privacy)
  clearOldInteractions(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    for (const [id, interaction] of this.interactions.entries()) {
      if (interaction.timestamp < cutoff) {
        this.interactions.delete(id);
      }
    }
  }

  // Export interaction data
  exportInteractionData() {
    return {
      userId: this.userId,
      interactions: Array.from(this.interactions.entries()),
      behaviorPatterns: this.behaviorPatterns,
      userEvents: this.userEvents,
      contextualMemory: {
        ...this.contextualMemory,
        mentionedNames: Array.from(this.contextualMemory.mentionedNames),
        locations: Array.from(this.contextualMemory.locations),
        interests: Array.from(this.contextualMemory.interests)
      },
      exportTimestamp: new Date()
    };
  }
}

export default UserInteractionRecorder;
