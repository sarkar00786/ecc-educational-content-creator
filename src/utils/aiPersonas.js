// src/utils/aiPersonas.js

// Define message intents and user states locally
const MESSAGE_INTENTS = {
  FRUSTRATED_SEEKING_HELP: 'frustrated_seeking_help',
  BRAINSTORMING_COLLABORATIVE: 'brainstorming_collaborative',
  DIRECT_TASK_ORIENTED: 'direct_task_oriented',
  EXPLORATORY_PLAYFUL: 'exploratory_playful',
  LEARNING_FOCUSED: 'learning_focused',
  FORMAL_INQUIRY: 'formal_inquiry'
};

const USER_STATES = {
  FRUSTRATED: 'frustrated',
  CONFUSED: 'confused',
  CONFIDENT: 'confident',
  ENGAGED: 'engaged',
  NEUTRAL: 'neutral'
};

// Intelligent persona pattern matching
const PERSONA_PATTERNS = {
  friendly: {
    keywords: ['help', 'confused', 'stuck', 'frustrated', 'don\'t understand', 'struggling'],
    emotional_indicators: ['😕', '😔', '😞', '😣', '😤', '😩'],
    urgency_phrases: ['urgent', 'asap', 'quickly', 'fast'],
    weight: 0.7
  },
  socratic: {
    keywords: ['why', 'how', 'what if', 'explore', 'discover', 'think about'],
    question_patterns: ['what would happen if', 'how might we', 'what are the implications'],
    collaborative_indicators: ['let\'s think', 'brainstorm', 'discuss'],
    weight: 0.6
  },
  detailed: {
    keywords: ['comprehensive', 'thorough', 'detailed', 'complete', 'in-depth'],
    academic_indicators: ['research', 'study', 'analysis', 'documentation'],
    complexity_markers: ['complex', 'advanced', 'sophisticated'],
    weight: 0.8
  },
  concise: {
    keywords: ['quick', 'brief', 'summary', 'short', 'fast'],
    efficiency_indicators: ['tldr', 'bottom line', 'key points', 'main idea'],
    time_constraints: ['deadline', 'urgent', 'limited time'],
    weight: 0.9
  },
  educator: {
    keywords: ['learn', 'teach', 'explain', 'understand', 'guide'],
    learning_indicators: ['beginner', 'new to', 'starting with', 'basics'],
    step_by_step: ['step by step', 'gradually', 'progressively'],
    weight: 0.7
  },
  formal: {
    keywords: ['professional', 'academic', 'scholarly', 'formal'],
    business_context: ['meeting', 'presentation', 'report', 'documentation'],
    academic_context: ['thesis', 'research', 'paper', 'study'],
    weight: 0.6
  }
};

// Analyze message content for persona hints
const analyzeMessageForPersona = (message) => {
  const scores = {};
  const lowerMessage = message.toLowerCase();
  
  Object.entries(PERSONA_PATTERNS).forEach(([persona, patterns]) => {
    let score = 0;
    
    // Check keywords
    patterns.keywords?.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        score += patterns.weight;
      }
    });
    
    // Check emotional indicators
    patterns.emotional_indicators?.forEach(emoji => {
      if (message.includes(emoji)) {
        score += patterns.weight * 0.8;
      }
    });
    
    // Check question patterns
    patterns.question_patterns?.forEach(pattern => {
      if (lowerMessage.includes(pattern)) {
        score += patterns.weight * 1.2;
      }
    });
    
    // Check other pattern types
    ['urgency_phrases', 'collaborative_indicators', 'academic_indicators', 
     'complexity_markers', 'efficiency_indicators', 'time_constraints',
     'learning_indicators', 'step_by_step', 'business_context', 'academic_context'].forEach(patternType => {
      patterns[patternType]?.forEach(pattern => {
        if (lowerMessage.includes(pattern)) {
          score += patterns.weight * 0.9;
        }
      });
    });
    
    scores[persona] = score;
  });
  
  return scores;
};

// User history tracking for adaptive persona selection
let userPersonaHistory = {
  preferences: {},
  effectiveness: {},
  recentPersonas: [],
  conversationContext: []
};

// Adaptive persona blending based on multiple factors
const blendPersonas = (primaryPersona, secondaryPersona, blendRatio = 0.7) => {
  const primary = aiPersonasConfig.find(p => p.id === primaryPersona);
  const secondary = aiPersonasConfig.find(p => p.id === secondaryPersona);
  
  if (!primary || !secondary) return primary || secondary;
  
  return {
    id: `${primaryPersona}_${secondaryPersona}`,
    name: `${primary.name} with ${secondary.name} elements`,
    description: `${primary.description} Enhanced with ${secondary.description}`,
    prompt: `
      PRIMARY PERSONA (${Math.round(blendRatio * 100)}%): ${primary.prompt}
      
      SECONDARY PERSONA (${Math.round((1 - blendRatio) * 100)}%): ${secondary.prompt}
      
      BLENDING INSTRUCTION: Combine these personas naturally, emphasizing the primary while incorporating secondary elements when appropriate.
    `
  };
};

// Track user response to persona selection
const trackPersonaEffectiveness = (personaId, userFeedback) => {
  if (!userPersonaHistory.effectiveness[personaId]) {
    userPersonaHistory.effectiveness[personaId] = { positive: 0, negative: 0 };
  }
  
  if (userFeedback === 'positive') {
    userPersonaHistory.effectiveness[personaId].positive++;
  } else if (userFeedback === 'negative') {
    userPersonaHistory.effectiveness[personaId].negative++;
  }
};

// Get user's preferred persona based on history
const getUserPreferredPersona = () => {
  const preferences = Object.entries(userPersonaHistory.effectiveness)
    .map(([persona, stats]) => ({
      persona,
      score: stats.positive - stats.negative,
      total: stats.positive + stats.negative
    }))
    .filter(p => p.total > 2) // Only consider personas with sufficient data
    .sort((a, b) => b.score - a.score);
  
  return preferences[0]?.persona || null;
};

// Function to intelligently auto-select persona based on message intent, user state, and context
export const updatePersona = (intent, userState, messageContext = {}) => {
  const { urgency, complexity, familiarity, message, userHistory } = messageContext;
  const personaAdjustments = {
    id: 'educator', // Default persona
    confidence: 0.5,
    intensity: 'medium',
    activationThreshold: 0.6, // Lowered threshold for better activation
    shouldActivate: false,
    isBlended: false
  };
  
  // Update user history if provided
  if (userHistory) {
    userPersonaHistory = { ...userPersonaHistory, ...userHistory };
  }
  
  // Analyze message content for persona hints
  let personaScores = {};
  if (message && typeof message === 'string') {
    personaScores = analyzeMessageForPersona(message);
  }
  
  // Get user's preferred persona from history
  const preferredPersona = getUserPreferredPersona();
  
  // Intent-based persona selection with enhanced context consideration
  let selectedPersona = null;
  let confidence = 0.5;
  
  // Enhanced persona selection with fallback handling
  if (!intent || !userState) {
    // Fallback to pattern-based selection if intent/state are missing
    const topPersona = Object.entries(personaScores || {}).reduce((max, [persona, score]) => {
      return score > max.score ? { persona, score } : max;
    }, { persona: 'educator', score: 0 });
    
    if (topPersona.score > 0.5) {
      selectedPersona = topPersona.persona;
      confidence = Math.min(0.9, topPersona.score * 0.8);
    } else {
      selectedPersona = 'educator';
      confidence = 0.6;
    }
  } else {
  // Handle help-seeking and frustrated messages with high priority
  if (intent === MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP || userState === USER_STATES.FRUSTRATED || userState === USER_STATES.CONFUSED) {
    selectedPersona = 'friendly';
    confidence = 0.9; // High confidence for frustrated users
  } else if (intent === MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE) {
    selectedPersona = 'socratic';
    confidence = 0.8;
  } else if (intent === MESSAGE_INTENTS.DIRECT_TASK_ORIENTED) {
    if (urgency === 'high') {
      selectedPersona = 'concise';
      confidence = 0.85;
    } else {
      selectedPersona = 'concise';
      confidence = 0.7;
    }
  } else if (intent === MESSAGE_INTENTS.EXPLORATORY_PLAYFUL) {
    selectedPersona = 'friendly';
    confidence = 0.7;
  } else if (intent === MESSAGE_INTENTS.LEARNING_FOCUSED) {
    if (complexity === 'high') {
      selectedPersona = 'detailed';
      confidence = 0.75;
    } else {
      selectedPersona = 'educator';
      confidence = 0.6;
    }
  } else if (intent === MESSAGE_INTENTS.FORMAL_INQUIRY || familiarity === 'low') {
    selectedPersona = 'formal';
    confidence = 0.65;
  }
  }
  
  // Additional checks for specific user states
  if (userState === USER_STATES.FRUSTRATED && selectedPersona !== 'friendly') {
    selectedPersona = 'friendly';
    confidence = 0.85;
  }
  
  // Override with help-seeking patterns
  if (message && message.toLowerCase().includes('help')) {
    selectedPersona = 'friendly';
    confidence = 0.8;
  }
  
  // Override with pattern-based selection if strong signals detected
  const topPersona = Object.entries(personaScores).reduce((max, [persona, score]) => {
    return score > max.score ? { persona, score } : max;
  }, { persona: null, score: 0 });
  
  if (topPersona.score > 1.5) {
    selectedPersona = topPersona.persona;
    confidence = Math.max(confidence, Math.min(topPersona.score / 2, 1));
  }
  
  // Determine activation intensity based on user state
  let intensityMultiplier = 1;
  if (userState === USER_STATES.FRUSTRATED || userState === USER_STATES.CONFUSED) {
    intensityMultiplier = 1.3; // Boost intensity for struggling users
  } else if (userState === USER_STATES.CONFIDENT || userState === USER_STATES.ENGAGED) {
    intensityMultiplier = 0.8; // Reduce intensity for confident users
  }
  
  const finalScore = confidence * intensityMultiplier;
  
  // Only activate persona if score exceeds threshold
  if (finalScore >= personaAdjustments.activationThreshold) {
    personaAdjustments.shouldActivate = true;
    personaAdjustments.intensity = finalScore > 0.9 ? 'high' : finalScore > 0.7 ? 'medium' : 'low';
    
    // Consider user preference if confidence is low
    if (confidence < 0.7 && preferredPersona) {
      // Blend with preferred persona
      const blendedPersona = blendPersonas(selectedPersona, preferredPersona, confidence);
      personaAdjustments.persona = blendedPersona;
      personaAdjustments.id = blendedPersona.id;
      personaAdjustments.isBlended = true;
    } else {
      personaAdjustments.id = selectedPersona;
    }
  } else {
    personaAdjustments.shouldActivate = false;
    personaAdjustments.reasoning = 'Activation threshold not met, using neutral approach';
  }
  
  personaAdjustments.confidence = finalScore;
  personaAdjustments.rawConfidence = confidence;
  personaAdjustments.intensityMultiplier = intensityMultiplier;
  personaAdjustments.reasoning = {
    intent,
    userState,
    patternScores: personaScores,
    preferredPersona,
    urgency,
    complexity,
    familiarity,
    selectedPersona,
    finalScore
  };
  
  // Update recent personas history
  userPersonaHistory.recentPersonas.unshift(selectedPersona);
  if (userPersonaHistory.recentPersonas.length > 10) {
    userPersonaHistory.recentPersonas.pop();
  }
  
  return personaAdjustments;
};

// Function to get persona activation prompt based on intensity
export const getPersonaPrompt = (personaId, intensity = 'medium') => {
  const persona = aiPersonasConfig.find(p => p.id === personaId);
  if (!persona) return '';
  
  let intensityModifier = '';
  switch (intensity) {
    case 'high':
      intensityModifier = 'STRONGLY emphasize the following traits:';
      break;
    case 'medium':
      intensityModifier = 'Incorporate these personality traits:';
      break;
    case 'low':
      intensityModifier = 'Subtly include these characteristics:';
      break;
    default:
      intensityModifier = 'Consider these traits:';
  }
  
  return `\n${intensityModifier}\n${persona.prompt}`;
};

// Export function to track persona effectiveness
export const trackPersonaFeedback = (personaId, feedback) => {
  trackPersonaEffectiveness(personaId, feedback);
};

// Export function to get user history
export const getUserPersonaHistory = () => {
  return userPersonaHistory;
};

// Function to analyze persona for message (exported for content generation)
export const analyzePersonaForMessage = (message, context = {}) => {
  const { userState, currentSubject, conversationHistory = [], userPreferences = {} } = context;
  
  // Analyze message content for persona hints
  const personaScores = analyzeMessageForPersona(message);
  
  // Determine message intent and user state
  const messageIntent = determineMessageIntent(message);
  const detectedUserState = userState || detectUserState(message);
  
  // Get persona recommendation using existing logic
  const personaAdjustments = updatePersona(messageIntent, detectedUserState, {
    message,
    urgency: detectUrgency(message),
    complexity: detectComplexity(message),
    familiarity: detectFamiliarity(message, conversationHistory),
    userHistory: userPersonaHistory
  });
  
  // Map persona IDs to standard names
  const personaMapping = {
    'educator': 'Educator',
    'socratic': 'Socratic',
    'detailed': 'Detailed',
    'concise': 'Concise',
    'friendly': 'Friendly',
    'formal': 'Formal'
  };
  
  return {
    recommendedPersona: personaMapping[personaAdjustments.id] || 'Educator',
    confidence: personaAdjustments.confidence,
    reasoning: personaAdjustments.reasoning,
    shouldActivate: personaAdjustments.shouldActivate,
    intensity: personaAdjustments.intensity,
    personaScores,
    messageIntent,
    detectedUserState
  };
};

// Function to blend persona characteristics (exported for content generation)
export const blendPersonaCharacteristics = (primaryPersona, secondaryPersona, ratio = 0.7) => {
  return blendPersonas(primaryPersona, secondaryPersona, ratio);
};

// Helper function to determine message intent
const determineMessageIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
    return MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP;
  } else if (lowerMessage.includes('brainstorm') || lowerMessage.includes('ideas') || lowerMessage.includes('explore')) {
    return MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE;
  } else if (lowerMessage.includes('quick') || lowerMessage.includes('fast') || lowerMessage.includes('urgent')) {
    return MESSAGE_INTENTS.DIRECT_TASK_ORIENTED;
  } else if (lowerMessage.includes('fun') || lowerMessage.includes('play') || lowerMessage.includes('creative')) {
    return MESSAGE_INTENTS.EXPLORATORY_PLAYFUL;
  } else if (lowerMessage.includes('learn') || lowerMessage.includes('understand') || lowerMessage.includes('explain')) {
    return MESSAGE_INTENTS.LEARNING_FOCUSED;
  } else if (lowerMessage.includes('formal') || lowerMessage.includes('academic') || lowerMessage.includes('professional')) {
    return MESSAGE_INTENTS.FORMAL_INQUIRY;
  }
  
  return MESSAGE_INTENTS.LEARNING_FOCUSED; // Default
};

// Helper function to detect user state from message
const detectUserState = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand') || lowerMessage.includes('lost')) {
    return USER_STATES.CONFUSED;
  } else if (lowerMessage.includes('frustrated') || lowerMessage.includes('annoyed') || lowerMessage.includes('struggling')) {
    return USER_STATES.FRUSTRATED;
  } else if (lowerMessage.includes('confident') || lowerMessage.includes('sure') || lowerMessage.includes('know')) {
    return USER_STATES.CONFIDENT;
  } else if (lowerMessage.includes('interested') || lowerMessage.includes('excited') || lowerMessage.includes('engaged')) {
    return USER_STATES.ENGAGED;
  }
  
  return USER_STATES.NEUTRAL; // Default
};

// Helper function to detect urgency
const detectUrgency = (message) => {
  const lowerMessage = message.toLowerCase();
  const urgencyKeywords = ['urgent', 'asap', 'quickly', 'fast', 'deadline', 'hurry', 'immediate'];
  
  for (const keyword of urgencyKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'high';
    }
  }
  
  return 'low';
};

// Helper function to detect complexity
const detectComplexity = (message) => {
  const lowerMessage = message.toLowerCase();
  const complexityKeywords = ['complex', 'advanced', 'sophisticated', 'detailed', 'comprehensive', 'in-depth'];
  
  for (const keyword of complexityKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'high';
    }
  }
  
  return 'medium';
};

// Helper function to detect familiarity
const detectFamiliarity = (message, conversationHistory) => {
  const lowerMessage = message.toLowerCase();
  const beginnerKeywords = ['beginner', 'new to', 'starting', 'first time', 'basics'];
  
  for (const keyword of beginnerKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'low';
    }
  }
  
  // Check conversation history length as an indicator
  if (conversationHistory.length > 10) {
    return 'high';
  }
  
  return 'medium';
};

export const aiPersonasConfig = [
  {
    id: 'educator',
    name: 'Educator',
    description: 'Structured, comprehensive, example-rich.',
    prompt: `
      EDUCATOR PERSONA ENHANCEMENT:
      - Comprehensive explanations with scaffolded learning
      - Multiple examples and analogies
      - Clear learning objectives and outcomes
      - Structured progression from basic to advanced
      - Encouraging and supportive language
    `
  },
  {
    id: 'socratic',
    name: 'Socratic',
    description: 'Question-driven, discovery-based learning.',
    prompt: `
      SOCRATIC PERSONA ENHANCEMENT:
      - Question-driven content discovery
      - Guided inquiry approach
      - Critical thinking provocations
      - Self-reflection opportunities
      - Open-ended exploration prompts
    `
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Exhaustive coverage, academic depth.',
    prompt: `
      DETAILED PERSONA ENHANCEMENT:
      - Exhaustive concept coverage
      - In-depth background information
      - Multiple perspectives on topics
      - Comprehensive resource suggestions
      - Thorough explanation of nuances
    `
  },
  {
    id: 'concise',
    name: 'Concise',
    description: 'Essential points, efficient learning.',
    prompt: `
      CONCISE PERSONA ENHANCEMENT:
      - Bullet-pointed key concepts
      - Essential information only
      - Quick reference format
      - Streamlined examples
      - Direct, no-fluff language
    `
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Conversational, encouraging, relatable.',
    prompt: `
      FRIENDLY PERSONA ENHANCEMENT:
      - Conversational, warm tone
      - Personal anecdotes and connections
      - Encouraging language throughout
      - Relatable examples and scenarios
      - Celebration of learning milestones
    `
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Academic, scholarly, professional.',
    prompt: `
      FORMAL PERSONA ENHANCEMENT:
      - Academic language and structure
      - Scholarly references and citations
      - Professional presentation format
      - Rigorous analytical approach
      - Objective, evidence-based tone
    `
  }
];
