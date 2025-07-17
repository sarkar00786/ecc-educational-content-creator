// Enhanced Conversation Engine - Central Integration Module
// Brings together conviction layer, persona system, and message classification

import { 
  analyzeMessageWithEntities, 
  updateAdaptivePatterns, 
  analyzeConversationFlow,
  MESSAGE_INTENTS,
  USER_STATES
} from './messageClassifier.js';

import { 
  updatePersona, 
  trackPersonaFeedback,
  getUserPersonaHistory,
  aiPersonasConfig
} from './aiPersonas.js';

import { 
  processConvictionTrigger,
  CONVICTION_SCENARIOS,
  CONVICTION_INTENSITIES
} from './convictionLayer.js';

// Central conversation state management
let conversationState = {
  userId: null,
  currentPersona: null,
  convictionActive: false,
  learningPath: [],
  culturalContext: {},
  sessionMetrics: {
    messageCount: 0,
    engagementScore: 0,
    learningProgress: 0,
    convictionTriggers: 0,
    personaSwitches: 0
  }
};

// Main conversation processing engine
export const processConversation = async (message, conversationHistory = [], userId = null) => {
  // Update conversation state
  conversationState.userId = userId;
  conversationState.sessionMetrics.messageCount++;
  
  // Comprehensive message analysis
  const messageAnalysis = analyzeMessageWithEntities(message, conversationHistory, userId);
  
  // Check for conviction triggers
  const convictionResult = processConvictionTrigger(message, {
    userState: messageAnalysis.userState.state,
    conversationHistory: conversationHistory,
    culturalContext: messageAnalysis.culturalContext
  });
  
  // Update conviction state
  if (convictionResult.shouldTrigger) {
    conversationState.convictionActive = true;
    conversationState.sessionMetrics.convictionTriggers++;
  }
  
  // Determine appropriate persona
  const personaContext = {
    urgency: determineUrgency(messageAnalysis),
    complexity: determineComplexity(messageAnalysis),
    familiarity: determineFamiliarity(conversationHistory),
    message: message,
    userHistory: getUserPersonaHistory()
  };
  
  const personaResult = updatePersona(
    messageAnalysis.intent.intent,
    messageAnalysis.userState.state,
    personaContext
  );
  
  // Track persona switches
  if (conversationState.currentPersona && conversationState.currentPersona !== personaResult.id) {
    conversationState.sessionMetrics.personaSwitches++;
  }
  conversationState.currentPersona = personaResult.id;
  
  // Update cultural context
  conversationState.culturalContext = {
    ...conversationState.culturalContext,
    ...messageAnalysis.culturalContext
  };
  
  // Calculate engagement score
  const engagementScore = calculateEngagementScore(messageAnalysis);
  conversationState.sessionMetrics.engagementScore = 
    (conversationState.sessionMetrics.engagementScore + engagementScore) / 2;
  
  // Generate response strategy
  const responseStrategy = generateResponseStrategy({
    messageAnalysis,
    convictionResult,
    personaResult,
    conversationState,
    conversationHistory
  });
  
  // Return comprehensive conversation processing result
  return {
    messageAnalysis,
    convictionResult,
    personaResult,
    responseStrategy,
    conversationState: { ...conversationState },
    recommendations: generateSystemRecommendations(messageAnalysis, conversationState)
  };
};

// Determine urgency level from message analysis
const determineUrgency = (messageAnalysis) => {
  const urgencyIndicators = {
    high: ['urgent', 'asap', 'quickly', 'emergency', 'deadline'],
    medium: ['soon', 'fast', 'priority', 'important'],
    low: ['later', 'eventually', 'whenever', 'no rush']
  };
  
  // Safe access to indicators with fallback
  const indicators = messageAnalysis?.intent?.indicators || [];
  const messageText = Array.isArray(indicators) ? indicators.join(' ').toLowerCase() : '';
  
  for (const [level, urgencyWords] of Object.entries(urgencyIndicators)) {
    if (urgencyWords.some(word => messageText.includes(word))) {
      return level;
    }
  }
  
  // Default urgency based on user state
  if (messageAnalysis.userState?.state === USER_STATES.FRUSTRATED) {
    return 'high';
  } else if (messageAnalysis.userState?.state === USER_STATES.CONFUSED) {
    return 'medium';
  }
  
  return 'low';
};

// Determine complexity level from message analysis
const determineComplexity = (messageAnalysis) => {
  const complexityIndicators = {
    high: ['complex', 'advanced', 'sophisticated', 'detailed', 'comprehensive'],
    medium: ['moderate', 'intermediate', 'regular', 'standard'],
    low: ['simple', 'basic', 'easy', 'quick', 'brief']
  };
  
  // Safe access to indicators and entities with fallbacks
  const indicators = messageAnalysis?.intent?.indicators || [];
  const messageText = Array.isArray(indicators) ? indicators.join(' ').toLowerCase() : '';
  const subjectCount = messageAnalysis?.entities?.subjects?.length || 0;
  const wordCount = messageAnalysis?.metadata?.wordCount || 0;
  
  for (const [level, complexityWords] of Object.entries(complexityIndicators)) {
    if (complexityWords.some(word => messageText.includes(word))) {
      return level;
    }
  }
  
  // Determine complexity based on entities and message length
  if (subjectCount > 2 || wordCount > 50) {
    return 'high';
  } else if (subjectCount > 0 || wordCount > 20) {
    return 'medium';
  }
  
  return 'low';
};

// Determine familiarity level from conversation history
const determineFamiliarity = (conversationHistory) => {
  const messageCount = conversationHistory.length;
  const recentMessages = conversationHistory.slice(-5);
  
  // Check for repeated topics or entities
  const topics = new Set();
  recentMessages.forEach(msg => {
    if (msg && msg.analysisMetadata?.entities?.subjects) {
      msg.analysisMetadata.entities.subjects.forEach(subject => topics.add(subject));
    }
  });
  
  if (messageCount > 20 && topics.size > 0) {
    return 'high';
  } else if (messageCount > 5) {
    return 'medium';
  }
  
  return 'low';
};

// Calculate engagement score based on message analysis
const calculateEngagementScore = (messageAnalysis) => {
  let score = 0.5; // Base score
  
  // Adjust based on user state
  const stateScores = {
    [USER_STATES.ENGAGED]: 1.0,
    [USER_STATES.EXCITED]: 0.9,
    [USER_STATES.CURIOUS]: 0.8,
    [USER_STATES.CONFIDENT]: 0.7,
    [USER_STATES.SATISFIED]: 0.6,
    [USER_STATES.CONFUSED]: 0.4,
    [USER_STATES.FRUSTRATED]: 0.3,
    [USER_STATES.DISINTERESTED]: 0.2
  };
  
  score = stateScores[messageAnalysis.userState.state] || 0.5;
  
  // Adjust based on message content
  if (messageAnalysis.moodPatterns.intensity === 'high') {
    score += 0.2;
  } else if (messageAnalysis.moodPatterns.intensity === 'medium') {
    score += 0.1;
  }
  
  // Adjust based on cultural context
  if (messageAnalysis.culturalContext.isUrduEnglishMix) {
    score += 0.1; // Cultural comfort indicates engagement
  }
  
  // Adjust based on conversation flow
  if (messageAnalysis.conversationFlow.flow === 'deep_learning') {
    score += 0.2;
  } else if (messageAnalysis.conversationFlow.flow === 'building_engagement') {
    score += 0.15;
  }
  
  return Math.max(0, Math.min(1, score));
};

// Generate comprehensive response strategy
const generateResponseStrategy = ({
  messageAnalysis,
  convictionResult,
  personaResult,
  conversationState,
  conversationHistory
}) => {
  const strategy = {
    primary: 'standard_response',
    conviction: convictionResult.shouldTrigger,
    persona: personaResult.id,
    culturalAdaptation: messageAnalysis.culturalContext.formalityLevel,
    engagementLevel: conversationState.sessionMetrics.engagementScore,
    modifications: []
  };
  
  // Handle conviction triggers
  if (convictionResult.shouldTrigger) {
    strategy.primary = 'conviction_response';
    strategy.convictionIntensity = convictionResult.intensity;
    strategy.convictionPhrase = convictionResult.phrase;
    strategy.modifications.push({
      type: 'conviction_integration',
      details: convictionResult
    });
  }
  
  // Handle persona-specific modifications
  if (personaResult.isBlended) {
    strategy.modifications.push({
      type: 'persona_blending',
      details: personaResult
    });
  }
  
  // Handle cultural adaptations
  if (messageAnalysis.culturalContext.isUrduEnglishMix) {
    strategy.modifications.push({
      type: 'cultural_mixing',
      details: {
        formalityLevel: messageAnalysis.culturalContext.formalityLevel,
        urduMarkers: messageAnalysis.culturalContext.urduMarkers
      }
    });
  }
  
  // Handle engagement adjustments
  if (conversationState.sessionMetrics.engagementScore < 0.4) {
    strategy.modifications.push({
      type: 'engagement_boost',
      details: {
        currentScore: conversationState.sessionMetrics.engagementScore,
        recommendations: messageAnalysis.recommendations.engagementBoosts
      }
    });
  }
  
  // Handle learning progression
  if (messageAnalysis.conversationFlow.patterns && messageAnalysis.conversationFlow.patterns.learningProgression && messageAnalysis.conversationFlow.patterns.learningProgression.isProgressing) {
    strategy.modifications.push({
      type: 'learning_advancement',
      details: messageAnalysis.conversationFlow.patterns.learningProgression
    });
  }
  
  return strategy;
};

// Generate system-level recommendations
const generateSystemRecommendations = (messageAnalysis, conversationState) => {
  const recommendations = [];
  
  // Persona optimization recommendations
  if (conversationState.sessionMetrics.personaSwitches > 5) {
    recommendations.push({
      type: 'persona_stability',
      priority: 'medium',
      message: 'Consider optimizing persona selection to reduce frequent switches',
      data: { switches: conversationState.sessionMetrics.personaSwitches }
    });
  }
  
  // Engagement recommendations
  if (conversationState.sessionMetrics.engagementScore < 0.3) {
    recommendations.push({
      type: 'engagement_intervention',
      priority: 'high',
      message: 'User engagement is low - consider switching to friendly persona or adding interactive elements',
      data: { score: conversationState.sessionMetrics.engagementScore }
    });
  }
  
  // Cultural adaptation recommendations
  if (messageAnalysis.culturalContext.isUrduEnglishMix && 
      conversationState.culturalContext.formalityLevel !== messageAnalysis.culturalContext.formalityLevel) {
    recommendations.push({
      type: 'cultural_consistency',
      priority: 'low',
      message: 'Maintain consistent cultural formality level throughout conversation',
      data: { 
        current: messageAnalysis.culturalContext.formalityLevel,
        previous: conversationState.culturalContext.formalityLevel
      }
    });
  }
  
  // Learning path recommendations
  if (messageAnalysis.conversationFlow.patterns && messageAnalysis.conversationFlow.patterns.topicProgression && messageAnalysis.conversationFlow.patterns.topicProgression.isScattered) {
    recommendations.push({
      type: 'learning_focus',
      priority: 'medium',
      message: 'Suggest focusing on fewer topics for better learning outcomes',
      data: { topics: messageAnalysis.entities.subjects }
    });
  }
  
  return recommendations;
};

// Feedback processing system
export const processFeedback = (feedback, context) => {
  const { messageAnalysis, personaResult, convictionResult, userId } = context;
  
  // Update adaptive patterns
  updateAdaptivePatterns(context.message, feedback, {
    userId: userId,
    detectedIntent: messageAnalysis.intent.intent,
    responseType: context.responseType
  });
  
  // Track persona feedback
  if (personaResult && personaResult.id) {
    trackPersonaFeedback(personaResult.id, feedback);
  }
  
  // Update session metrics based on feedback
  if (feedback === 'positive') {
    conversationState.sessionMetrics.engagementScore = 
      Math.min(1, conversationState.sessionMetrics.engagementScore + 0.1);
  } else if (feedback === 'negative') {
    conversationState.sessionMetrics.engagementScore = 
      Math.max(0, conversationState.sessionMetrics.engagementScore - 0.1);
  }
  
  return {
    processed: true,
    updatedState: { ...conversationState },
    improvements: generateImprovementSuggestions(feedback, context)
  };
};

// Generate improvement suggestions based on feedback
const generateImprovementSuggestions = (feedback, context) => {
  const suggestions = [];
  
  if (feedback === 'negative') {
    // Suggest persona adjustments
    if (context.personaResult.confidence < 0.7) {
      suggestions.push({
        type: 'persona_adjustment',
        suggestion: 'Consider using a different persona approach',
        confidence: context.personaResult.confidence
      });
    }
    
    // Suggest conviction adjustments
    if (context.convictionResult.shouldTrigger) {
      suggestions.push({
        type: 'conviction_adjustment',
        suggestion: 'Consider adjusting conviction trigger sensitivity',
        intensity: context.convictionResult.intensity
      });
    }
    
    // Suggest cultural adaptation
    if (context.messageAnalysis.culturalContext.isUrduEnglishMix) {
      suggestions.push({
        type: 'cultural_adaptation',
        suggestion: 'Improve cultural context adaptation',
        formality: context.messageAnalysis.culturalContext.formalityLevel
      });
    }
  }
  
  return suggestions;
};

// Analytics and reporting
export const getConversationAnalytics = () => {
  return {
    currentState: { ...conversationState },
    sessionSummary: {
      totalMessages: conversationState.sessionMetrics.messageCount,
      avgEngagement: conversationState.sessionMetrics.engagementScore,
      convictionTriggers: conversationState.sessionMetrics.convictionTriggers,
      personaSwitches: conversationState.sessionMetrics.personaSwitches
    },
    personaHistory: getUserPersonaHistory(),
    culturalProfile: conversationState.culturalContext,
    performanceMetrics: {
      engagementTrend: conversationState.sessionMetrics.engagementScore > 0.6 ? 'positive' : 'needs_improvement',
      adaptationLevel: conversationState.sessionMetrics.personaSwitches < 3 ? 'stable' : 'adaptive',
      culturalAlignment: conversationState.culturalContext.isUrduEnglishMix ? 'mixed' : 'standard'
    }
  };
};

// Reset conversation state
export const resetConversationState = (userId = null) => {
  conversationState = {
    userId: userId,
    currentPersona: null,
    convictionActive: false,
    learningPath: [],
    culturalContext: {},
    sessionMetrics: {
      messageCount: 0,
      engagementScore: 0,
      learningProgress: 0,
      convictionTriggers: 0,
      personaSwitches: 0
    }
  };
};

// Export conversation state for persistence
export const exportConversationState = () => {
  return JSON.stringify(conversationState);
};

// Import conversation state from persistence
export const importConversationState = (stateData) => {
  try {
    conversationState = JSON.parse(stateData);
    return true;
  } catch (error) {
    console.error('Failed to import conversation state:', error);
    return false;
  }
};

// Advanced conversation metrics
export const getAdvancedMetrics = (conversationHistory) => {
  const flow = analyzeConversationFlow(conversationHistory);
  
  return {
    conversationFlow: flow,
    learningProgression: {
      level: flow.patterns.learningProgression.level,
      score: flow.patterns.learningProgression.score,
      isProgressing: flow.patterns.learningProgression.isProgressing
    },
    engagementAnalysis: {
      trend: flow.patterns.engagementLevel.trend,
      average: flow.patterns.engagementLevel.average,
      current: conversationState.sessionMetrics.engagementScore
    },
    culturalAdaptation: {
      dominantStyle: flow.patterns.culturalAdaptation.dominantStyle,
      adaptationNeeded: flow.patterns.culturalAdaptation.adaptationNeeded
    },
    topicProgression: {
      focus: flow.patterns.topicProgression.isFocused ? 'focused' : 'scattered',
      topicSwitches: flow.patterns.topicProgression.topicSwitches,
      subjects: flow.patterns.topicProgression.topics
    }
  };
};

// Export all constants and utilities
export {
  MESSAGE_INTENTS,
  USER_STATES,
  CONVICTION_SCENARIOS,
  CONVICTION_INTENSITIES,
  conversationState
};
