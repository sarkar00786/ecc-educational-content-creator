// Advanced Message Classification System for ECC Chat
// Implements Phase 1: Advanced Intent & Emotional Understanding

// Message Intent Types (Fine-grained Classification)
export const MESSAGE_INTENTS = {
  EXPLORATORY_PLAYFUL: 'exploratory_playful',
  FRUSTRATED_SEEKING_HELP: 'frustrated_seeking_help',
  BRAINSTORMING_COLLABORATIVE: 'brainstorming_collaborative',
  DIRECT_TASK_ORIENTED: 'direct_task_oriented',
  EMOTIONAL_SHARING: 'emotional_sharing',
  VAGUE_UNCLEAR: 'vague_unclear',
  CHALLENGING_SKEPTICAL: 'challenging_skeptical',
  GREETING_CASUAL: 'greeting_casual',
  LEARNING_FOCUSED: 'learning_focused',
  TESTING_SYSTEM: 'testing_system',
  EVENT_SHARING: 'event_sharing',
  PERSONAL_UPDATE: 'personal_update',
  ACHIEVEMENT_ANNOUNCEMENT: 'achievement_announcement',
  CHALLENGE_DESCRIPTION: 'challenge_description',
  MEMORY_REFERENCE: 'memory_reference',
  PREFERENCE_EXPRESSION: 'preference_expression'
};

// User Emotional States
export const USER_STATES = {
  CONFIDENT: 'confident',
  CONFUSED: 'confused',
  FRUSTRATED: 'frustrated',
  CURIOUS: 'curious',
  ENGAGED: 'engaged',
  DISINTERESTED: 'disinterested',
  OVERWHELMED: 'overwhelmed',
  SATISFIED: 'satisfied',
  EXCITED: 'excited',
  PROUD: 'proud',
  DISAPPOINTED: 'disappointed',
  NOSTALGIC: 'nostalgic',
  ANXIOUS: 'anxious',
  GRATEFUL: 'grateful',
  NEUTRAL: 'neutral'
};

// Enhanced Pakistani Urdu/English Conversational Patterns with Regex and Weighted Scoring
const PAKISTANI_PATTERNS = {
  // Frustration indicators with weights
  frustration: [
    { pattern: /(dimagh|dimaag)\s*(kharab|kharab)/i, weight: 0.9 },
    { pattern: /samajh\s*nahi\s*aa\s*raha/i, weight: 0.8 },
    { pattern: /mushkil\s*hai/i, weight: 0.7 },
    { pattern: /yaar\s*problem/i, weight: 0.6 },
    { pattern: /confused\s*hun/i, weight: 0.7 },
    { pattern: /difficult\s*lagta/i, weight: 0.6 },
    { pattern: /headache\s*ho\s*raha/i, weight: 0.8 },
    { pattern: /bore\s*ho\s*gaya/i, weight: 0.5 },
    { pattern: /kya\s*bakwas/i, weight: 0.7 },
    { pattern: /pagal\s*ho\s*gaya/i, weight: 0.8 },
    { pattern: /stress\s*aa\s*raha/i, weight: 0.7 },
    { pattern: /stuck\s*ho\s*gaya/i, weight: 0.8 }
  ],
  
  // Curiosity/Exploration with weights
  curiosity: [
    { pattern: /kya\s*hai\s*ye/i, weight: 0.8 },
    { pattern: /batao\s*na/i, weight: 0.7 },
    { pattern: /interesting\s*lagta/i, weight: 0.8 },
    { pattern: /try\s*karna\s*chahta/i, weight: 0.7 },
    { pattern: /dekh\s*te\s*hain/i, weight: 0.6 },
    { pattern: /kaise\s*hota/i, weight: 0.8 },
    { pattern: /maza\s*aa\s*raha/i, weight: 0.7 },
    { pattern: /cool\s*hai/i, weight: 0.6 },
    { pattern: /acha\s*concept/i, weight: 0.8 },
    { pattern: /naya\s*cheez/i, weight: 0.7 },
    { pattern: /experiment\s*karte/i, weight: 0.8 }
  ],
  
  // Seeking help with weights
  help_seeking: [
    { pattern: /help\s*karo/i, weight: 0.9 },
    { pattern: /samjhao\s*na/i, weight: 0.8 },
    { pattern: /guide\s*karo/i, weight: 0.8 },
    { pattern: /bata\s*do/i, weight: 0.7 },
    { pattern: /mushkil\s*mein\s*hun/i, weight: 0.8 },
    { pattern: /stuck\s*hun/i, weight: 0.9 },
    { pattern: /madad\s*chahiye/i, weight: 0.9 },
    { pattern: /solve\s*karo/i, weight: 0.7 },
    { pattern: /explain\s*karo/i, weight: 0.8 },
    { pattern: /clear\s*karo/i, weight: 0.7 }
  ],
  
  // Greeting/Casual with weights
  greeting: [
    { pattern: /salam/i, weight: 0.8 },
    { pattern: /assalam/i, weight: 0.9 },
    { pattern: /hello/i, weight: 0.7 },
    { pattern: /\bhi\b/i, weight: 0.6 },
    { pattern: /kya\s*haal/i, weight: 0.8 },
    { pattern: /kaisi\s*ho/i, weight: 0.8 },
    { pattern: /kaise\s*ho/i, weight: 0.8 },
    { pattern: /sup/i, weight: 0.6 },
    { pattern: /whats\s*up/i, weight: 0.6 },
    { pattern: /how\s*are\s*you/i, weight: 0.7 },
    { pattern: /good\s*morning/i, weight: 0.7 },
    { pattern: /good\s*evening/i, weight: 0.7 },
    { pattern: /kya\s*kar\s*rahe/i, weight: 0.7 }
  ],
  
  // Direct task with weights
  direct_task: [
    { pattern: /solve\s*karo/i, weight: 0.8 },
    { pattern: /answer\s*do/i, weight: 0.8 },
    { pattern: /batao/i, weight: 0.7 },
    { pattern: /calculate\s*karo/i, weight: 0.8 },
    { pattern: /find\s*karo/i, weight: 0.7 },
    { pattern: /search\s*karo/i, weight: 0.7 },
    { pattern: /create\s*karo/i, weight: 0.7 },
    { pattern: /make\s*karo/i, weight: 0.7 },
    { pattern: /write\s*karo/i, weight: 0.7 },
    { pattern: /explain\s*this/i, weight: 0.8 },
    { pattern: /show\s*me/i, weight: 0.8 }
  ],
  
  // Brainstorming with weights
  brainstorming: [
    { pattern: /ideas\s*do/i, weight: 0.8 },
    { pattern: /suggestions\s*chahiye/i, weight: 0.8 },
    { pattern: /options\s*kya\s*hain/i, weight: 0.8 },
    { pattern: /alternatives/i, weight: 0.7 },
    { pattern: /different\s*ways/i, weight: 0.7 },
    { pattern: /creative\s*solution/i, weight: 0.8 },
    { pattern: /think\s*karte\s*hain/i, weight: 0.7 },
    { pattern: /brainstorm\s*karte/i, weight: 0.9 },
    { pattern: /possibilities/i, weight: 0.7 }
  ],
  
  // Emotional sharing with weights
  emotional: [
    { pattern: /feel\s*karta\s*hun/i, weight: 0.8 },
    { pattern: /lagta\s*hai/i, weight: 0.6 },
    { pattern: /emotional\s*hun/i, weight: 0.8 },
    { pattern: /happy\s*hun/i, weight: 0.8 },
    { pattern: /sad\s*hun/i, weight: 0.8 },
    { pattern: /excited\s*hun/i, weight: 0.8 },
    { pattern: /worried\s*hun/i, weight: 0.8 },
    { pattern: /proud\s*hun/i, weight: 0.8 },
    { pattern: /disappointed\s*hun/i, weight: 0.8 },
    { pattern: /motivated\s*hun/i, weight: 0.8 }
  ],
  
  // Challenging/Skeptical with weights
  challenging: [
    { pattern: /yaqeen\s*nahi/i, weight: 0.8 },
    { pattern: /sure\s*nahi/i, weight: 0.8 },
    { pattern: /doubt\s*hai/i, weight: 0.8 },
    { pattern: /really\?/i, weight: 0.7 },
    { pattern: /sach\s*mein/i, weight: 0.7 },
    { pattern: /prove\s*karo/i, weight: 0.8 },
    { pattern: /evidence\s*do/i, weight: 0.8 },
    { pattern: /convince\s*karo/i, weight: 0.8 },
    { pattern: /galat\s*lagta/i, weight: 0.7 },
    { pattern: /disagree\s*karta/i, weight: 0.8 },
    { pattern: /question\s*hai/i, weight: 0.6 }
  ],
  
  // Confusion indicators with weights
  confusion: [
    { pattern: /samajh\s*nahi\s*aya/i, weight: 0.8 },
    { pattern: /confuse\s*hun/i, weight: 0.8 },
    { pattern: /clear\s*nahi/i, weight: 0.7 },
    { pattern: /mushkil/i, weight: 0.7 },
    { pattern: /complicated\s*lagta/i, weight: 0.8 },
    { pattern: /mix\s*up\s*ho\s*gaya/i, weight: 0.8 },
    { pattern: /lost\s*hun/i, weight: 0.8 },
    { pattern: /kya\s*matlab/i, weight: 0.7 },
    { pattern: /explain\s*again/i, weight: 0.8 }
  ],
  
  // Event sharing patterns with weights
  event_sharing: [
    { pattern: /exam\s*hua/i, weight: 0.8 },
    { pattern: /test\s*diya/i, weight: 0.8 },
    { pattern: /interview\s*tha/i, weight: 0.8 },
    { pattern: /presentation\s*kiya/i, weight: 0.8 },
    { pattern: /birthday\s*hai/i, weight: 0.7 },
    { pattern: /shaadi\s*mein\s*gaya/i, weight: 0.7 },
    { pattern: /party\s*mein\s*tha/i, weight: 0.7 },
    { pattern: /festival\s*manaya/i, weight: 0.7 },
    { pattern: /holiday\s*par\s*gaya/i, weight: 0.7 },
    { pattern: /trip\s*par\s*tha/i, weight: 0.7 },
    { pattern: /vacation\s*kiya/i, weight: 0.7 },
    { pattern: /meeting\s*thi/i, weight: 0.7 },
    { pattern: /class\s*attend\s*kiya/i, weight: 0.8 },
    { pattern: /lecture\s*suna/i, weight: 0.8 },
    { pattern: /workshop\s*gaya/i, weight: 0.8 }
  ],
  
  // Personal updates with weights
  personal_update: [
    { pattern: /new\s*job\s*mila/i, weight: 0.8 },
    { pattern: /promotion\s*hua/i, weight: 0.8 },
    { pattern: /ghar\s*shift\s*kiya/i, weight: 0.7 },
    { pattern: /course\s*join\s*kiya/i, weight: 0.8 },
    { pattern: /hobby\s*start\s*kiya/i, weight: 0.7 },
    { pattern: /skill\s*seekh\s*raha/i, weight: 0.8 },
    { pattern: /project\s*kar\s*raha/i, weight: 0.8 },
    { pattern: /padh\s*raha\s*hun/i, weight: 0.8 },
    { pattern: /practice\s*kar\s*raha/i, weight: 0.8 },
    { pattern: /work\s*kar\s*raha/i, weight: 0.7 }
  ],
  
  // Achievement announcements with weights
  achievement: [
    { pattern: /pass\s*ho\s*gaya/i, weight: 0.9 },
    { pattern: /clear\s*kar\s*diya/i, weight: 0.9 },
    { pattern: /jeet\s*gaya/i, weight: 0.8 },
    { pattern: /achieve\s*kiya/i, weight: 0.8 },
    { pattern: /complete\s*kiya/i, weight: 0.8 },
    { pattern: /finish\s*kiya/i, weight: 0.8 },
    { pattern: /successful\s*raha/i, weight: 0.8 },
    { pattern: /accomplish\s*kiya/i, weight: 0.8 },
    { pattern: /certificate\s*mila/i, weight: 0.9 },
    { pattern: /award\s*mila/i, weight: 0.9 },
    { pattern: /prize\s*jeeta/i, weight: 0.9 },
    { pattern: /recognition\s*mila/i, weight: 0.8 }
  ],
  
  // Challenge descriptions with weights
  challenges: [
    { pattern: /problem\s*aa\s*rahi/i, weight: 0.8 },
    { pattern: /issue\s*hai/i, weight: 0.7 },
    { pattern: /difficulty\s*face\s*kar\s*raha/i, weight: 0.8 },
    { pattern: /struggle\s*kar\s*raha/i, weight: 0.8 },
    { pattern: /hard\s*time\s*aa\s*raha/i, weight: 0.8 },
    { pattern: /tough\s*situation/i, weight: 0.8 },
    { pattern: /stuck\s*hun/i, weight: 0.8 },
    { pattern: /handle\s*nahi\s*kar\s*pa\s*raha/i, weight: 0.8 },
    { pattern: /manage\s*nahi\s*ho\s*raha/i, weight: 0.8 }
  ],
  
  // Memory references with weights
  memory_reference: [
    { pattern: /remember\s*karo/i, weight: 0.8 },
    { pattern: /yaad\s*hai/i, weight: 0.8 },
    { pattern: /pichli\s*baar/i, weight: 0.8 },
    { pattern: /last\s*time/i, weight: 0.8 },
    { pattern: /jab\s*maine\s*kaha\s*tha/i, weight: 0.8 },
    { pattern: /wo\s*waqt\s*jab/i, weight: 0.8 },
    { pattern: /previously/i, weight: 0.7 },
    { pattern: /before/i, weight: 0.6 },
    { pattern: /earlier\s*maine/i, weight: 0.8 },
    { pattern: /past\s*mein/i, weight: 0.7 },
    { pattern: /history\s*mein/i, weight: 0.7 }
  ],
  
  // Preference expressions with weights
  preference_expression: [
    { pattern: /mujhe\s*pasand/i, weight: 0.8 },
    { pattern: /like\s*karta\s*hun/i, weight: 0.8 },
    { pattern: /prefer\s*karta\s*hun/i, weight: 0.8 },
    { pattern: /favourite\s*hai/i, weight: 0.8 },
    { pattern: /dislike\s*karta\s*hun/i, weight: 0.8 },
    { pattern: /nahi\s*pasand/i, weight: 0.8 },
    { pattern: /avoid\s*karta\s*hun/i, weight: 0.8 },
    { pattern: /hate\s*karta\s*hun/i, weight: 0.8 },
    { pattern: /especially\s*like/i, weight: 0.8 },
    { pattern: /particularly\s*enjoy/i, weight: 0.8 },
    { pattern: /can't\s*stand/i, weight: 0.8 },
    { pattern: /love\s*karta\s*hun/i, weight: 0.8 }
  ]
};

// Pakistani Urdu Conversational Markers
const URDU_MARKERS = {
  casual: ['yaar', 'yr', 'na', 'bhi', 'tou', 'hai na', 'qsm sy'],
  emphasis: ['bilkul', 'ekdum', 'poora', 'bara', 'bohot', 'zyada'],
  questioning: ['kya', 'kyun', 'kaise', 'kab', 'kahan', 'kaun'],
  affirmative: ['han', 'haan', 'theek', 'acha', 'sahi', 'correct'],
  negative: ['nahi', 'na', 'nope', 'galat', 'wrong']
};

// Sentiment Analysis for Pakistani Context
export const analyzeSentiment = (text) => {
  // Handle null/undefined text
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', confidence: 0.5 };
  }
  
  const lowerText = text.toLowerCase();
  let sentiment = 'neutral';
  let confidence = 0.5;
  
  // Positive indicators
  const positiveWords = ['good', 'great', 'excellent', 'awesome', 'perfect', 'love', 'like', 'happy', 'excited', 'maza', 'acha', 'behtar', 'zabardast', 'kamaal'];
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  
  // Negative indicators
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'frustrated', 'angry', 'boring', 'bakwas', 'bura', 'ganda', 'mushkil'];
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.6 + (positiveCount * 0.1));
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.6 + (negativeCount * 0.1));
  }
  
  return { sentiment, confidence };
};

// Enhanced Intent Classification Engine with Regex and Weighted Scoring

// Function to merge patterns with weights
const mergePatternsWithWeight = (base, additionalPatterns) => {
  return Object.entries(base).reduce((acc, [key, patterns]) => {
    acc[key] = [...patterns, ...(additionalPatterns[key] || [])];
    return acc;
  }, { ...base });
};

// Merge existing patterns with newly introduced ones
const updatedPakistaniPatterns = mergePatternsWithWeight(PAKISTANI_PATTERNS, {
  frustration: [
    { pattern: /sar\s*ho\s*gaya/i, weight: 0.7 },
    { pattern: /nahi\s*samajh/i, weight: 0.8 }
  ],
  help_seeking: [
    { pattern: /madad\s*karna/i, weight: 0.75 }
  ]
});
export const classifyMessageIntent = (message, conversationHistory = []) => {
  // Handle null/undefined message
  if (!message || typeof message !== 'string') {
    return {
      intent: MESSAGE_INTENTS.TESTING_SYSTEM,
      confidence: 0.3,
      indicators: ['null_or_undefined_message'],
      score: 0.3
    };
  }
  
  const lowerMessage = message.toLowerCase();
  const words = lowerMessage.split(/\s+/);
  
  // Check for direct help-seeking patterns first
  if (lowerMessage.includes('help') && (lowerMessage.includes('need') || lowerMessage.includes('with') || lowerMessage.includes('problem'))) {
    return {
      intent: MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP,
      confidence: 0.8,
      indicators: ['direct_help_pattern'],
      score: 0.8
    };
  }
  
  // Collect all pattern matches with scores
  const allMatches = [];
  
  // Check for direct patterns with weighted scoring
  for (const [intent, patterns] of Object.entries(PAKISTANI_PATTERNS)) {
    let totalScore = 0;
    const matchedPatterns = [];
    
    patterns.forEach(patternObj => {
      if (patternObj.pattern.test(message)) {
        totalScore += patternObj.weight;
        matchedPatterns.push(patternObj.pattern.toString());
      }
    });
    
    if (totalScore > 0) {
      const confidence = Math.min(0.95, 0.5 + (totalScore * 0.4));
      
      let mappedIntent;
      switch (intent) {
        case 'frustration':
          mappedIntent = MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP;
          break;
        case 'curiosity':
          mappedIntent = MESSAGE_INTENTS.EXPLORATORY_PLAYFUL;
          break;
        case 'help_seeking':
          mappedIntent = MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP;
          break;
        case 'greeting':
          mappedIntent = MESSAGE_INTENTS.GREETING_CASUAL;
          break;
        case 'direct_task':
          mappedIntent = MESSAGE_INTENTS.DIRECT_TASK_ORIENTED;
          break;
        case 'brainstorming':
          mappedIntent = MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE;
          break;
        case 'emotional':
          mappedIntent = MESSAGE_INTENTS.EMOTIONAL_SHARING;
          break;
        case 'challenging':
          mappedIntent = MESSAGE_INTENTS.CHALLENGING_SKEPTICAL;
          break;
        case 'confusion':
          mappedIntent = MESSAGE_INTENTS.VAGUE_UNCLEAR;
          break;
        case 'event_sharing':
          mappedIntent = MESSAGE_INTENTS.EVENT_SHARING;
          break;
        case 'personal_update':
          mappedIntent = MESSAGE_INTENTS.PERSONAL_UPDATE;
          break;
        case 'achievement':
          mappedIntent = MESSAGE_INTENTS.ACHIEVEMENT_ANNOUNCEMENT;
          break;
        case 'challenges':
          mappedIntent = MESSAGE_INTENTS.CHALLENGE_DESCRIPTION;
          break;
        case 'memory_reference':
          mappedIntent = MESSAGE_INTENTS.MEMORY_REFERENCE;
          break;
        case 'preference_expression':
          mappedIntent = MESSAGE_INTENTS.PREFERENCE_EXPRESSION;
          break;
        default:
          mappedIntent = MESSAGE_INTENTS.LEARNING_FOCUSED;
      }
      
      allMatches.push({
        intent: mappedIntent,
        confidence: confidence,
        indicators: matchedPatterns,
        score: totalScore
      });
    }
  }
  
  // Return the best match if any
  if (allMatches.length > 0) {
    const bestMatch = allMatches.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    return bestMatch;
  }
  
  // Fallback classification based on structure
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'kya', 'kaise', 'kyun', 'kab', 'kahan'];
  const hasQuestion = questionWords.some(word => lowerMessage.includes(word)) || message.includes('?');
  
  if (hasQuestion) {
    return {
      intent: MESSAGE_INTENTS.LEARNING_FOCUSED,
      confidence: 0.6,
      indicators: ['question_structure']
    };
  }
  
  // Check for brainstorming patterns
  if (lowerMessage.includes('brainstorm') || lowerMessage.includes('ideas') || lowerMessage.includes('solutions')) {
    return {
      intent: MESSAGE_INTENTS.BRAINSTORMING_COLLABORATIVE,
      confidence: 0.8,
      indicators: ['brainstorming_pattern']
    };
  }
  
  // Check for greeting patterns
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      intent: MESSAGE_INTENTS.GREETING_CASUAL,
      confidence: 0.7,
      indicators: ['greeting_pattern']
    };
  }
  
  // Check for emotional sharing patterns
  if (lowerMessage.includes('feeling') || lowerMessage.includes('happy') || lowerMessage.includes('sad')) {
    return {
      intent: MESSAGE_INTENTS.EMOTIONAL_SHARING,
      confidence: 0.7,
      indicators: ['emotional_pattern']
    };
  }
  
  // Check for direct task patterns
  if (lowerMessage.includes('calculate') || lowerMessage.includes('solve') || lowerMessage.includes('answer')) {
    return {
      intent: MESSAGE_INTENTS.DIRECT_TASK_ORIENTED,
      confidence: 0.7,
      indicators: ['task_pattern']
    };
  }
  
  // Very short messages or empty/whitespace messages (likely testing or unclear)
  if (words.length <= 3 || lowerMessage.trim() === '') {
    return {
      intent: MESSAGE_INTENTS.TESTING_SYSTEM,
      confidence: 0.7,
      indicators: ['short_message']
    };
  }
  
  // Default to vague/unclear
  return {
    intent: MESSAGE_INTENTS.VAGUE_UNCLEAR,
    confidence: 0.5,
    indicators: ['no_clear_pattern']
  };
};

// User State Tracking
export const trackUserState = (message, conversationHistory = []) => {
  // Handle null/undefined message
  if (!message || typeof message !== 'string') {
    return {
      state: USER_STATES.CURIOUS,
      confidence: 0.3,
      indicators: ['null_or_undefined_message'],
      score: 0.3
    };
  }
  
  const lowerMessage = message.toLowerCase();
  const { sentiment } = analyzeSentiment(message);
  
  // Specific checks for common test patterns
  if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand') || lowerMessage.includes('lost')) {
    return {
      state: USER_STATES.CONFUSED,
      confidence: 0.8,
      indicators: ['direct_confusion_pattern'],
      score: 0.8
    };
  }
  
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('frustrating') || lowerMessage.includes('struggling')) {
    return {
      state: USER_STATES.FRUSTRATED,
      confidence: 0.8,
      indicators: ['direct_frustration_pattern'],
      score: 0.8
    };
  }
  
  // Check for frustration first (higher priority than confusion)
  const frustrationIndicators = PAKISTANI_PATTERNS.frustration;
  let frustrationScore = 0;
  const matchedFrustrationPatterns = [];
  
  frustrationIndicators.forEach(patternObj => {
    if (patternObj.pattern.test(message)) {
      frustrationScore += patternObj.weight;
      matchedFrustrationPatterns.push(patternObj.pattern.toString());
    }
  });
  
  if (frustrationScore > 0) {
    return {
      state: USER_STATES.FRUSTRATED,
      confidence: Math.min(0.9, 0.5 + (frustrationScore * 0.4)),
      indicators: matchedFrustrationPatterns,
      score: frustrationScore
    };
  }
  
  // Check for confusion indicators
  const confusionIndicators = PAKISTANI_PATTERNS.confusion;
  let confusionScore = 0;
  const matchedConfusionPatterns = [];
  
  confusionIndicators.forEach(patternObj => {
    if (patternObj.pattern.test(message)) {
      confusionScore += patternObj.weight;
      matchedConfusionPatterns.push(patternObj.pattern.toString());
    }
  });
  
  if (confusionScore > 0) {
    return {
      state: USER_STATES.CONFUSED,
      confidence: Math.min(0.9, 0.5 + (confusionScore * 0.4)),
      indicators: matchedConfusionPatterns,
      score: confusionScore
    };
  }
  
  // Check for achievement/pride indicators
  const achievementIndicators = PAKISTANI_PATTERNS.achievement;
  let achievementScore = 0;
  const matchedAchievementPatterns = [];
  
  achievementIndicators.forEach(patternObj => {
    if (patternObj.pattern.test(message)) {
      achievementScore += patternObj.weight;
      matchedAchievementPatterns.push(patternObj.pattern.toString());
    }
  });
  
  if (achievementScore > 0) {
    return {
      state: USER_STATES.PROUD,
      confidence: Math.min(0.9, 0.5 + (achievementScore * 0.4)),
      indicators: matchedAchievementPatterns,
      score: achievementScore
    };
  }
  
  // Check for memory reference indicators
  const memoryIndicators = PAKISTANI_PATTERNS.memory_reference;
  let memoryScore = 0;
  const matchedMemoryPatterns = [];
  
  memoryIndicators.forEach(patternObj => {
    if (patternObj.pattern.test(message)) {
      memoryScore += patternObj.weight;
      matchedMemoryPatterns.push(patternObj.pattern.toString());
    }
  });
  
  if (memoryScore > 0) {
    return {
      state: USER_STATES.NOSTALGIC,
      confidence: Math.min(0.9, 0.5 + (memoryScore * 0.4)),
      indicators: matchedMemoryPatterns,
      score: memoryScore
    };
  }
  
  // Check for challenge/difficulty indicators
  const challengeIndicators = PAKISTANI_PATTERNS.challenges;
  let challengeScore = 0;
  const matchedChallengePatterns = [];
  
  challengeIndicators.forEach(patternObj => {
    if (patternObj.pattern.test(message)) {
      challengeScore += patternObj.weight;
      matchedChallengePatterns.push(patternObj.pattern.toString());
    }
  });
  
  if (challengeScore > 0) {
    return {
      state: USER_STATES.ANXIOUS,
      confidence: Math.min(0.9, 0.5 + (challengeScore * 0.4)),
      indicators: matchedChallengePatterns,
      score: challengeScore
    };
  }
  
  // Check for excited state with excitement-specific markers
  const excitementMarkers = ['excited', 'thrilled', 'pumped', 'eager', 'enthusiastic', 'can\'t wait', 'looking forward'];
  const hasExcitement = excitementMarkers.some(marker => 
    lowerMessage.includes(marker.toLowerCase())
  );
  
  if (hasExcitement) {
    return {
      state: USER_STATES.EXCITED,
      confidence: 0.8,
      indicators: excitementMarkers.filter(m => lowerMessage.includes(m.toLowerCase()))
    };
  }
  
  // Check engagement level based on message length and enthusiasm
  const enthusiasmMarkers = ['!', 'awesome', 'great', 'cool', 'amazing', 'zabardast', 'kamaal'];
  const hasEnthusiasm = enthusiasmMarkers.some(marker => 
    lowerMessage.includes(marker.toLowerCase())
  );
  
  if (hasEnthusiasm) {
    return {
      state: USER_STATES.ENGAGED,
      confidence: 0.7,
      indicators: enthusiasmMarkers.filter(m => lowerMessage.includes(m.toLowerCase()))
    };
  }
  
  // Analyze conversation history for patterns
  if (conversationHistory.length > 0) {
    const recentMessages = conversationHistory.slice(-3);
    const repeatedQuestions = recentMessages.filter(msg => 
      msg && msg.role === 'user' && msg.text && msg.text.includes('?')
    ).length;
    
    if (repeatedQuestions >= 2) {
      return {
        state: USER_STATES.CONFUSED,
        confidence: 0.7,
        indicators: ['repeated_questions']
      };
    }
  }
  
  // Default state based on sentiment
  if (sentiment === 'positive') {
    return {
      state: USER_STATES.CONFIDENT,
      confidence: 0.6,
      indicators: ['positive_sentiment']
    };
  } else if (sentiment === 'negative') {
    return {
      state: USER_STATES.FRUSTRATED,
      confidence: 0.6,
      indicators: ['negative_sentiment']
    };
  }
  
  return {
    state: USER_STATES.CURIOUS,
    confidence: 0.5,
    indicators: ['neutral_default']
  };
};

// Enhanced Message Analysis with Context Window (5-7 turns)
export const analyzeMessage = (message, conversationHistory = []) => {
  // Handle null/undefined message
  if (!message || typeof message !== 'string') {
    return {
      intent: { intent: MESSAGE_INTENTS.TESTING_SYSTEM, confidence: 0.3 },
      userState: { state: USER_STATES.CURIOUS, confidence: 0.3 },
      sentiment: { sentiment: 'neutral', confidence: 0.5 },
      stateTransition: { transition: 'initial', confidence: 0.5 },
      moodPatterns: { patterns: [], moodScore: 0, intensity: 'low' },
      entities: { topics: [], names: [], subjects: [], timeReferences: [], locations: [] },
      culturalContext: {
        urduMarkers: [],
        isUrduEnglishMix: false,
        formalityLevel: 'neutral',
        contextualCues: {},
        patternAnalysis: { patterns: [], isStuck: false, needsNewApproach: false }
      },
      metadata: {
        messageLength: 0,
        wordCount: 0,
        hasQuestion: false,
        timestamp: new Date().toISOString(),
        contextWindowSize: conversationHistory.length
      }
    };
  }
  
  // Use context window of last 5-7 turns for better analysis
  const contextWindow = conversationHistory.slice(-7);
  const intentResult = classifyMessageIntent(message, contextWindow);
  const stateResult = trackUserState(message, contextWindow);
  const sentimentResult = analyzeSentiment(message);
  
  // Analyze state transitions
  const stateTransition = analyzeStateTransition(stateResult.state, contextWindow);
  
  // Detect micro-patterns for mood
  const moodPatterns = detectMicroPatterns(message, contextWindow);
  
  // Enhanced entity tracking for context continuity
  const entities = trackEntities(message, contextWindow);
  
  // Detect Pakistani Urdu markers for cultural context
  const urduMarkers = [];
  for (const [category, markers] of Object.entries(URDU_MARKERS)) {
    const foundMarkers = markers.filter(marker => 
      message.toLowerCase().includes(marker.toLowerCase())
    );
    if (foundMarkers.length > 0) {
      urduMarkers.push({ category, markers: foundMarkers });
    }
  }
  
  // Enhanced Urdu detection - check for common Urdu words
  const commonUrduWords = ['hai', 'hain', 'mein', 'se', 'ka', 'ki', 'ke', 'ho', 'hun', 'hoon', 'lagta', 'raha', 'rahe', 'karta', 'karte', 'chahiye', 'chahta', 'maza', 'interesting', 'try', 'experiment'];
  const hasUrduWords = commonUrduWords.some(word => 
    message.toLowerCase().includes(word)
  );
  
  // Check for mixed script indicators
  const isMixedLanguage = urduMarkers.length > 0 || hasUrduWords;
  
  // Detect formality level with more nuanced analysis
  const formalityLevel = detectFormalityLevel(message, urduMarkers);
  
  // Enhanced contextual analysis
  const contextualAnalysis = analyzeContextualCues(message, contextWindow);
  
  // Detect repeated patterns across context window
  const patternAnalysis = detectRepeatedPatterns(message, contextWindow);
  
  return {
    intent: intentResult,
    userState: stateResult,
    sentiment: sentimentResult,
    stateTransition: stateTransition,
    moodPatterns: moodPatterns,
    entities: entities,
    culturalContext: {
      urduMarkers,
      isUrduEnglishMix: isMixedLanguage,
      formalityLevel: formalityLevel,
      contextualCues: contextualAnalysis,
      patternAnalysis: patternAnalysis
    },
    metadata: {
      messageLength: message.length,
      wordCount: message.split(/\s+/).length,
      hasQuestion: message.includes('?'),
      timestamp: new Date().toISOString(),
      contextWindowSize: contextWindow.length
    }
  };
};

// Quick classification for fast response routing
export const quickClassify = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Fast pattern matching for immediate routing
  if (PAKISTANI_PATTERNS.greeting.some(patternObj => patternObj.pattern.test(message))) {
    return MESSAGE_INTENTS.GREETING_CASUAL;
  }
  
  if (PAKISTANI_PATTERNS.help_seeking.some(patternObj => patternObj.pattern.test(message))) {
    return MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP;
  }
  
  if (PAKISTANI_PATTERNS.direct_task.some(patternObj => patternObj.pattern.test(message))) {
    return MESSAGE_INTENTS.DIRECT_TASK_ORIENTED;
  }
  
  if (PAKISTANI_PATTERNS.confusion.some(patternObj => patternObj.pattern.test(message))) {
    return MESSAGE_INTENTS.VAGUE_UNCLEAR;
  }
  
  return MESSAGE_INTENTS.LEARNING_FOCUSED; // Default fallback
};

// State transition analysis for better context understanding
export const analyzeStateTransition = (currentState, contextWindow) => {
  if (contextWindow.length < 2) {
    return { transition: 'initial', confidence: 0.5 };
  }
  
  // Extract previous states from context
  const previousStates = contextWindow
    .filter(msg => msg && msg.role === 'user' && msg.analysisMetadata?.userState)
    .map(msg => msg.analysisMetadata.userState)
    .slice(-3);
  
  if (previousStates.length === 0) {
    return { transition: 'initial', confidence: 0.5 };
  }
  
  const lastState = previousStates[previousStates.length - 1];
  
  // Define transition patterns
  const transitionPatterns = {
    'frustrated_to_satisfied': {
      from: USER_STATES.FRUSTRATED,
      to: USER_STATES.SATISFIED,
      confidence: 0.8
    },
    'confused_to_understood': {
      from: USER_STATES.CONFUSED,
      to: USER_STATES.CONFIDENT,
      confidence: 0.8
    },
    'curious_to_engaged': {
      from: USER_STATES.CURIOUS,
      to: USER_STATES.ENGAGED,
      confidence: 0.7
    },
    'engaged_to_satisfied': {
      from: USER_STATES.ENGAGED,
      to: USER_STATES.SATISFIED,
      confidence: 0.7
    }
  };
  
  // Check for valid transitions
  for (const [transitionName, pattern] of Object.entries(transitionPatterns)) {
    if (lastState === pattern.from && currentState === pattern.to) {
      return {
        transition: transitionName,
        confidence: pattern.confidence,
        previousState: lastState,
        currentState: currentState
      };
    }
  }
  
  return {
    transition: 'neutral',
    confidence: 0.6,
    previousState: lastState,
    currentState: currentState
  };
};

// Micro-pattern detection for mood and behavior analysis
export const detectMicroPatterns = (message, contextWindow) => {
  // Add null safety for message
  if (!message || typeof message !== 'string') {
    return {
      patterns: [],
      moodScore: 0,
      silencePattern: { type: 'insufficient_data', confidence: 0.0 },
      intensity: 'low'
    };
  }
  
  const patterns = {
    emojiUsage: {
      pattern: /[😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🤩😏😒😞😔😟😕🙁☹️😣😖😫😩😤😠😡🤬🤯😳😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲😴🤤😪😵🤐🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾]/g,
      weight: 0.3
    },
    allCaps: {
      pattern: /[A-Z]{3,}/g,
      weight: 0.6
    },
    repeatedPunctuation: {
      pattern: /[!?]{2,}/g,
      weight: 0.5
    },
    prolongedVowels: {
      pattern: /[aeiouAEIOU]{3,}/g,
      weight: 0.4
    },
    typingMistakes: {
      pattern: /\b\w*([a-zA-Z])\1{2,}\w*\b/g,
      weight: 0.3
    }
  };
  
  const detectedPatterns = [];
  let moodScore = 0;
  
  for (const [patternName, patternData] of Object.entries(patterns)) {
    const matches = message.match(patternData.pattern);
    if (matches) {
      detectedPatterns.push({
        type: patternName,
        count: matches.length,
        weight: patternData.weight
      });
      moodScore += matches.length * patternData.weight;
    }
  }
  
  // Analyze silence patterns (time between messages)
  const silencePattern = analyzeSilencePattern(contextWindow);
  
  return {
    patterns: detectedPatterns,
    moodScore: Math.min(1, moodScore),
    silencePattern: silencePattern,
    intensity: moodScore > 0.7 ? 'high' : moodScore > 0.3 ? 'medium' : 'low'
  };
};

// Analyze silence patterns for mood detection
export const analyzeSilencePattern = (contextWindow) => {
  if (contextWindow.length < 2) {
    return { type: 'insufficient_data', confidence: 0.0 };
  }
  
  const userMessages = contextWindow
    .filter(msg => msg && msg.role === 'user' && msg.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  if (userMessages.length < 2) {
    return { type: 'insufficient_data', confidence: 0.0 };
  }
  
  const timeDifferences = [];
  for (let i = 1; i < userMessages.length; i++) {
    const timeDiff = new Date(userMessages[i].timestamp) - new Date(userMessages[i-1].timestamp);
    timeDifferences.push(timeDiff / 1000); // Convert to seconds
  }
  
  const avgTimeDiff = timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length;
  
  // Classify silence patterns
  if (avgTimeDiff > 300) { // 5+ minutes
    return { type: 'prolonged_silence', confidence: 0.8, avgDelay: avgTimeDiff };
  } else if (avgTimeDiff > 60) { // 1-5 minutes
    return { type: 'thoughtful_pause', confidence: 0.7, avgDelay: avgTimeDiff };
  } else if (avgTimeDiff < 10) { // Less than 10 seconds
    return { type: 'rapid_fire', confidence: 0.8, avgDelay: avgTimeDiff };
  } else {
    return { type: 'normal_pace', confidence: 0.6, avgDelay: avgTimeDiff };
  }
};

// Enhanced entity tracking for context continuity
export const trackEntities = (message, contextWindow) => {
  const entities = {
    topics: new Set(),
    names: new Set(),
    subjects: new Set(),
    timeReferences: new Set(),
    locations: new Set()
  };
  
  // Handle null/undefined message
  if (!message || typeof message !== 'string') {
    return {
      topics: Array.from(entities.topics),
      names: Array.from(entities.names),
      subjects: Array.from(entities.subjects),
      timeReferences: Array.from(entities.timeReferences),
      locations: Array.from(entities.locations)
    };
  }
  
  // Extract topics (educational subjects)
  const subjectPatterns = {
    'mathematics': /math|algebra|geometry|calculus|statistics|arithmetic/gi,
    'science': /science|biology|chemistry|physics|experiment/gi,
    'programming': /code|programming|javascript|python|html|css|algorithm/gi,
    'history': /history|historical|ancient|medieval|modern|civilization/gi,
    'literature': /literature|poetry|novel|author|writing|story/gi
  };
  
  for (const [subject, pattern] of Object.entries(subjectPatterns)) {
    if (pattern.test(message)) {
      entities.subjects.add(subject);
    }
  }
  
  // Extract names (capitalized words that aren't common words)
  const words = message.split(/\s+/);
  const commonWords = ['The', 'And', 'But', 'For', 'Not', 'Yet', 'Can', 'May', 'Will', 'Should', 'Could', 'Would', 'This', 'That', 'These', 'Those', 'Here', 'There', 'When', 'Where', 'What', 'How', 'Why'];
  
  words.forEach(word => {
    if (/^[A-Z][a-z]+$/.test(word) && !commonWords.includes(word)) {
      entities.names.add(word);
    }
  });
  
  // Extract time references
  const timePatterns = [
    /yesterday|today|tomorrow|last week|next week|this week/gi,
    /monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi,
    /morning|afternoon|evening|night/gi
  ];
  
  timePatterns.forEach(pattern => {
    const matches = message.match(pattern);
    if (matches) {
      matches.forEach(match => entities.timeReferences.add(match.toLowerCase()));
    }
  });
  
  // Extract locations
  const locationPatterns = /\b(school|college|university|home|office|library|park|restaurant|mall|hospital|airport|station)\b/gi;
  const locationMatches = message.match(locationPatterns);
  if (locationMatches) {
    locationMatches.forEach(match => entities.locations.add(match.toLowerCase()));
  }
  
  return {
    topics: Array.from(entities.topics),
    names: Array.from(entities.names),
    subjects: Array.from(entities.subjects),
    timeReferences: Array.from(entities.timeReferences),
    locations: Array.from(entities.locations)
  };
};

// Detect formality level with nuanced analysis
export const detectFormalityLevel = (message, urduMarkers = []) => {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced casual markers with Pakistani Urdu patterns
  const casualMarkers = ['yaar', 'bhai', 'dude', 'tum', 'yr', 'na', 'bhi', 'hun', 'main', 'mein', 'karo', 'kar', 'hai', 'ho'];
  const formalMarkers = ['aap', 'sir', 'madam', 'please', 'thank you', 'sahib', 'janaab', 'could you', 'would you', 'may i'];
  
  const casualCount = casualMarkers.filter(marker => lowerMessage.includes(marker)).length;
  const formalCount = formalMarkers.filter(marker => lowerMessage.includes(marker)).length;
  
  // Check Urdu markers for formality
  const casualUrduMarkers = urduMarkers.filter(m => m.category === 'casual').length;
  const totalUrduMarkers = urduMarkers.length;
  
  // Calculate formality score with enhanced weighting
  let formalityScore = 0;
  
  if (casualCount > 0 || casualUrduMarkers > 0) {
    formalityScore -= (casualCount + casualUrduMarkers) * 0.5;
  }
  
  if (formalCount > 0) {
    formalityScore += formalCount * 0.4;
  }
  
  // Check for Urdu-English mixed patterns (inherently casual)
  const urduPatterns = /\b(yaar|bhai|bahut|confused|hun|main|mein|karo|please|help)\b/gi;
  const urduMatches = message.match(urduPatterns);
  if (urduMatches && urduMatches.length >= 2) {
    formalityScore -= 0.6; // Strong casual indicator
  }
  
  // Check message structure for formality indicators
  const hasGreetingFormality = /^(dear|respected|honorable)/i.test(message);
  const hasClosingFormality = /(regards|sincerely|respectfully)/i.test(message);
  const hasCompleteWords = message.split(/\s+/).every(word => word.length > 2); // Avoid abbreviations
  
  if (hasGreetingFormality || hasClosingFormality) {
    formalityScore += 0.5;
  }
  
  if (hasCompleteWords && message.length > 50) {
    formalityScore += 0.1; // Reduced weight
  }
  
  // Determine formality level with adjusted thresholds
  if (formalityScore > 0.3) {
    return 'formal';
  } else if (formalityScore < -0.1) {
    return 'casual';
  } else {
    return 'neutral';
  }
};

// Context-aware learning system
let contextualLearningData = {
  userPatterns: {},
  conversationFlows: [],
  adaptivePatterns: {},
  feedbackHistory: []
};

// Conversation flow analysis
export const analyzeConversationFlow = (conversationHistory) => {
  if (conversationHistory.length < 3) {
    return { flow: 'initial', confidence: 0.5, patterns: [] };
  }
  
  const recentHistory = conversationHistory.slice(-10);
  const userMessages = recentHistory.filter(msg => msg && typeof msg === 'object' && msg.role === 'user');
  const aiMessages = recentHistory.filter(msg => msg && typeof msg === 'object' && msg.role === 'assistant');
  
  // Analyze conversation patterns
  const patterns = {
    questionSequence: analyzeQuestionSequence(userMessages),
    topicProgression: analyzeTopicProgression(userMessages),
    engagementLevel: analyzeEngagementLevel(userMessages),
    learningProgression: analyzeLearningProgression(userMessages, aiMessages),
    culturalAdaptation: analyzeCulturalAdaptation(userMessages)
  };
  
  // Determine overall conversation flow
  let flowType = 'exploring';
  let confidence = 0.6;
  
  if (patterns.questionSequence.isDeepDiving) {
    flowType = 'deep_learning';
    confidence = 0.8;
  } else if (patterns.engagementLevel.isIncreasing) {
    flowType = 'building_engagement';
    confidence = 0.7;
  } else if (patterns.learningProgression.isProgressing) {
    flowType = 'structured_learning';
    confidence = 0.8;
  } else if (patterns.topicProgression.isScattered) {
    flowType = 'exploratory_browsing';
    confidence = 0.7;
  }
  
  return {
    flow: flowType,
    confidence: confidence,
    patterns: patterns,
    recommendations: generateFlowRecommendations(patterns)
  };
};

// Analyze question sequence patterns
const analyzeQuestionSequence = (userMessages) => {
  const questions = userMessages.filter(msg => msg && msg.text && msg.text.includes('?'));
  if (questions.length < 2) return { isDeepDiving: false, pattern: 'none' };
  
  const questionTypes = questions.map(q => {
    const text = q.text.toLowerCase();
    if (text.includes('why') || text.includes('kyun')) return 'why';
    if (text.includes('how') || text.includes('kaise')) return 'how';
    if (text.includes('what') || text.includes('kya')) return 'what';
    return 'other';
  });
  
  const isDeepDiving = questionTypes.includes('why') && questionTypes.includes('how');
  const pattern = isDeepDiving ? 'deep_inquiry' : 'surface_inquiry';
  
  return { isDeepDiving, pattern, questionTypes };
};

// Analyze topic progression
const analyzeTopicProgression = (userMessages) => {
  const topics = userMessages.map(msg => {
    const entities = trackEntities(msg.text, []);
    return entities.subjects;
  }).flat();
  
  const uniqueTopics = [...new Set(topics)];
  const isScattered = uniqueTopics.length > userMessages.length * 0.7;
  const isFocused = uniqueTopics.length <= 2;
  
  return {
    topics: uniqueTopics,
    isScattered: isScattered,
    isFocused: isFocused,
    topicSwitches: uniqueTopics.length - 1
  };
};

// Analyze engagement level trends
const analyzeEngagementLevel = (userMessages) => {
  const engagementScores = userMessages.map(msg => {
    const microPatterns = detectMicroPatterns(msg.text, []);
    return microPatterns.moodScore;
  });
  
  const isIncreasing = engagementScores.length > 2 && 
    engagementScores[engagementScores.length - 1] > engagementScores[0];
  const isDecreasing = engagementScores.length > 2 && 
    engagementScores[engagementScores.length - 1] < engagementScores[0];
  
  const avgEngagement = engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length;
  
  return {
    scores: engagementScores,
    isIncreasing: isIncreasing,
    isDecreasing: isDecreasing,
    average: avgEngagement,
    trend: isIncreasing ? 'increasing' : isDecreasing ? 'decreasing' : 'stable'
  };
};

// Analyze learning progression
const analyzeLearningProgression = (userMessages, aiMessages) => {
  const learningIndicators = {
    understanding: ['samajh gaya', 'got it', 'clear hai', 'understand', 'acha'],
    confusion: ['samajh nahi', 'confused', 'mushkil', 'difficult'],
    application: ['try karunga', 'practice', 'apply', 'use']
  };
  
  let progressionScore = 0;
  let lastIndicator = null;
  
  userMessages.forEach(msg => {
    if (!msg || !msg.text) return;
    const text = msg.text.toLowerCase();
    
    for (const [type, indicators] of Object.entries(learningIndicators)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        if (type === 'understanding' && lastIndicator === 'confusion') {
          progressionScore += 2; // Breakthrough moment
        } else if (type === 'application' && lastIndicator === 'understanding') {
          progressionScore += 1.5; // Practical application
        } else if (type === 'confusion' && lastIndicator === 'understanding') {
          progressionScore -= 0.5; // Regression
        }
        lastIndicator = type;
      }
    }
  });
  
  const isProgressing = progressionScore > 0;
  const progressionLevel = progressionScore > 3 ? 'high' : progressionScore > 1 ? 'medium' : 'low';
  
  return {
    isProgressing: isProgressing,
    score: progressionScore,
    level: progressionLevel,
    lastIndicator: lastIndicator
  };
};

// Analyze cultural adaptation patterns
const analyzeCulturalAdaptation = (userMessages) => {
  const culturalMarkers = {
    urdu: 0,
    english: 0,
    mixed: 0,
    formal: 0,
    informal: 0
  };
  
  userMessages.forEach(msg => {
    const analysis = analyzeMessage(msg.text, []);
    if (analysis.culturalContext.isUrduEnglishMix) {
      culturalMarkers.mixed++;
    }
    if (analysis.culturalContext.formalityLevel === 'formal') {
      culturalMarkers.formal++;
    } else {
      culturalMarkers.informal++;
    }
  });
  
  const dominantStyle = Object.entries(culturalMarkers)
    .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: null, value: 0 });
  
  return {
    markers: culturalMarkers,
    dominantStyle: dominantStyle.key,
    adaptationNeeded: dominantStyle.key === 'mixed' || dominantStyle.key === 'informal'
  };
};

// Generate flow-based recommendations
const generateFlowRecommendations = (patterns) => {
  const recommendations = [];
  
  if (patterns.questionSequence.isDeepDiving) {
    recommendations.push({
      type: 'persona_adjustment',
      suggestion: 'Use detailed or socratic persona for deep inquiry support',
      priority: 'high'
    });
  }
  
  if (patterns.engagementLevel.isDecreasing) {
    recommendations.push({
      type: 'engagement_boost',
      suggestion: 'Switch to friendly persona with more interactive elements',
      priority: 'high'
    });
  }
  
  if (patterns.topicProgression.isScattered) {
    recommendations.push({
      type: 'focus_guidance',
      suggestion: 'Provide topic organization and learning path guidance',
      priority: 'medium'
    });
  }
  
  if (patterns.learningProgression.isProgressing) {
    recommendations.push({
      type: 'progression_support',
      suggestion: 'Increase complexity and provide advanced challenges',
      priority: 'medium'
    });
  }
  
  if (patterns.culturalAdaptation.adaptationNeeded) {
    recommendations.push({
      type: 'cultural_adjustment',
      suggestion: 'Adapt language formality and cultural references',
      priority: 'low'
    });
  }
  
  return recommendations;
};

// Adaptive pattern learning
export const updateAdaptivePatterns = (message, userFeedback, context) => {
  const userId = context.userId || 'anonymous';
  
  if (!contextualLearningData.userPatterns[userId]) {
    contextualLearningData.userPatterns[userId] = {
      preferredIntents: {},
      commonPhrases: new Set(),
      responsePatterns: {},
      learningStyle: 'balanced'
    };
  }
  
  const userPattern = contextualLearningData.userPatterns[userId];
  
  // Update preferred intents based on feedback
  if (userFeedback === 'positive') {
    const intent = context.detectedIntent;
    userPattern.preferredIntents[intent] = (userPattern.preferredIntents[intent] || 0) + 1;
  }
  
  // Learn common phrases
  const words = message.toLowerCase().split(/\s+/);
  words.forEach(word => {
    if (word.length > 3) {
      userPattern.commonPhrases.add(word);
    }
  });
  
  // Update response patterns
  if (context.responseType) {
    userPattern.responsePatterns[context.responseType] = 
      (userPattern.responsePatterns[context.responseType] || 0) + 1;
  }
  
  // Store feedback for future learning
  contextualLearningData.feedbackHistory.push({
    message: message,
    feedback: userFeedback,
    context: context,
    timestamp: new Date().toISOString()
  });
  
  // Keep only recent feedback (last 1000 entries)
  if (contextualLearningData.feedbackHistory.length > 1000) {
    contextualLearningData.feedbackHistory = contextualLearningData.feedbackHistory.slice(-1000);
  }
};

// Get personalized classification adjustments
export const getPersonalizedClassification = (message, userId) => {
  const userPattern = contextualLearningData.userPatterns[userId];
  if (!userPattern) return null;
  
  const baseClassification = classifyMessageIntent(message);
  
  // Check if user has strong preferences for certain intents
  const preferredIntents = Object.entries(userPattern.preferredIntents)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  // Adjust classification based on user preferences
  if (preferredIntents.length > 0) {
    const [topIntent, count] = preferredIntents[0];
    if (count > 5 && baseClassification.confidence < 0.8) {
      return {
        ...baseClassification,
        intent: topIntent,
        confidence: Math.min(0.9, baseClassification.confidence + 0.2),
        personalizedAdjustment: true,
        reason: 'user_preference_pattern'
      };
    }
  }
  
  return baseClassification;
};

// Export enhanced analyze function with all improvements
export const analyzeMessageWithEntities = (message, conversationHistory = [], userId = null) => {
  const baseAnalysis = analyzeMessage(message, conversationHistory);
  const entities = trackEntities(message, conversationHistory);
  const conversationFlow = analyzeConversationFlow(conversationHistory);
  
  // Get personalized classification if user ID is provided
  let personalizedClassification = null;
  if (userId) {
    personalizedClassification = getPersonalizedClassification(message, userId);
  }
  
  return {
    ...baseAnalysis,
    entities: entities,
    conversationFlow: conversationFlow,
    personalizedClassification: personalizedClassification,
    stateTransition: baseAnalysis.stateTransition || { transition: 'initial', confidence: 0.5 },
    moodPatterns: baseAnalysis.moodPatterns || { patterns: [], moodScore: 0, intensity: 'low' },
    recommendations: {
      personaAdjustments: (conversationFlow.recommendations || []).filter(r => r.type === 'persona_adjustment'),
      engagementBoosts: (conversationFlow.recommendations || []).filter(r => r.type === 'engagement_boost'),
      learningSupport: (conversationFlow.recommendations || []).filter(r => r.type.includes('learning') || r.type.includes('progression'))
    }
  };
};

// Export learning data management functions
export const exportLearningData = () => {
  return JSON.stringify(contextualLearningData, (key, value) => {
    if (value instanceof Set) {
      return Array.from(value);
    }
    return value;
  });
};

export const importLearningData = (data) => {
  try {
    const parsed = JSON.parse(data);
    Object.keys(parsed.userPatterns).forEach(userId => {
      if (parsed.userPatterns[userId].commonPhrases) {
        parsed.userPatterns[userId].commonPhrases = new Set(parsed.userPatterns[userId].commonPhrases);
      }
    });
    contextualLearningData = parsed;
    return true;
  } catch (error) {
    console.error('Failed to import learning data:', error);
    return false;
  }
};

export const resetLearningData = () => {
  contextualLearningData = {
    userPatterns: {},
    conversationFlows: [],
    adaptivePatterns: {},
    feedbackHistory: []
  };
};

// Memory persistence utilities with localStorage
export const persistMemoryToStorage = (key, data) => {
  try {
    const serialized = JSON.stringify(data, (key, value) => {
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    });
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Failed to persist memory to localStorage:', error);
    return false;
  }
};

export const loadMemoryFromStorage = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Restore Set objects
      if (parsed.userPatterns) {
        Object.keys(parsed.userPatterns).forEach(userId => {
          if (parsed.userPatterns[userId].commonPhrases) {
            parsed.userPatterns[userId].commonPhrases = new Set(parsed.userPatterns[userId].commonPhrases);
          }
        });
      }
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.error('Failed to load memory from localStorage:', error);
    return defaultValue;
  }
};

export const clearMemoryFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear memory from localStorage:', error);
    return false;
  }
};

// Auto-save contextual learning data every 30 seconds
let autoSaveInterval = null;

export const startAutoSave = (key = 'ecc_learning_data') => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    persistMemoryToStorage(key, contextualLearningData);
  }, 30000); // Save every 30 seconds
};

export const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};

// Load contextual learning data on module initialization
const loadStoredLearningData = () => {
  const stored = loadMemoryFromStorage('ecc_learning_data');
  if (stored) {
    contextualLearningData = stored;
  }
};

// Initialize storage loading
loadStoredLearningData();
startAutoSave();

// Enhanced contextual analysis for better understanding
export const analyzeContextualCues = (message, contextWindow) => {
  const cues = {
    conversationContinuity: analyzeConversationContinuity(message, contextWindow),
    topicRelatedness: analyzeTopicRelatedness(message, contextWindow),
    emotionalProgression: analyzeEmotionalProgression(message, contextWindow),
    learningIndicators: analyzeLearningIndicators(message, contextWindow)
  };
  
  return cues;
};

// Analyze conversation continuity
const analyzeConversationContinuity = (message, contextWindow) => {
  if (contextWindow.length === 0) return { level: 'new', confidence: 0.5 };
  
  const recentMessages = contextWindow.slice(-3);
  const continuityMarkers = [
    'also', 'and', 'but', 'however', 'moreover', 'furthermore',
    'aur', 'lekin', 'bhi', 'tou', 'phir', 'is ke ilawa'
  ];
  
  const hasContinuityMarkers = continuityMarkers.some(marker => 
    message.toLowerCase().includes(marker.toLowerCase())
  );
  
  // Check for pronouns referring to previous context
  const contextualPronouns = ['it', 'this', 'that', 'these', 'those', 'ye', 'wo', 'yeh'];
  const hasContextualPronouns = contextualPronouns.some(pronoun => 
    message.toLowerCase().includes(pronoun.toLowerCase())
  );
  
  let continuityLevel = 'low';
  let confidence = 0.5;
  
  if (hasContinuityMarkers && hasContextualPronouns) {
    continuityLevel = 'high';
    confidence = 0.8;
  } else if (hasContinuityMarkers || hasContextualPronouns) {
    continuityLevel = 'medium';
    confidence = 0.7;
  }
  
  return { level: continuityLevel, confidence, markers: { continuity: hasContinuityMarkers, pronouns: hasContextualPronouns } };
};

// Analyze topic relatedness to previous messages
const analyzeTopicRelatedness = (message, contextWindow) => {
  if (contextWindow.length === 0) return { relatedness: 'new', confidence: 0.5 };
  
  const recentMessages = contextWindow.slice(-3);
  const currentEntities = trackEntities(message, []);
  
  let overlapScore = 0;
  let totalEntities = 0;
  
  recentMessages.forEach(msg => {
    if (!msg || typeof msg !== 'object') return;
    const msgEntities = trackEntities(msg.text || '', []);
    
    // Calculate overlap in subjects
    const subjectOverlap = currentEntities.subjects.filter(s => 
      msgEntities.subjects.includes(s)
    ).length;
    
    // Calculate overlap in names
    const nameOverlap = currentEntities.names.filter(n => 
      msgEntities.names.includes(n)
    ).length;
    
    overlapScore += subjectOverlap * 2 + nameOverlap; // Weight subjects higher
    totalEntities += msgEntities.subjects.length + msgEntities.names.length;
  });
  
  const relatedness = totalEntities > 0 ? overlapScore / totalEntities : 0;
  
  let relatednessLevel = 'low';
  if (relatedness > 0.5) relatednessLevel = 'high';
  else if (relatedness > 0.2) relatednessLevel = 'medium';
  
  return { relatedness: relatednessLevel, score: relatedness, confidence: 0.7 };
};

// Analyze emotional progression through conversation
const analyzeEmotionalProgression = (message, contextWindow) => {
  if (contextWindow.length === 0) return { progression: 'initial', confidence: 0.5 };
  
  const recentMessages = contextWindow.slice(-3);
  const currentSentiment = analyzeSentiment(message);
  
  const sentimentHistory = recentMessages
    .filter(msg => msg && typeof msg === 'object' && msg.text)
    .map(msg => analyzeSentiment(msg.text || ''));
  
  if (sentimentHistory.length === 0) return { progression: 'initial', confidence: 0.5 };
  
  const lastSentiment = sentimentHistory[sentimentHistory.length - 1];
  
  let progression = 'stable';
  let confidence = 0.6;
  
  // Analyze sentiment changes
  if (lastSentiment.sentiment === 'negative' && currentSentiment.sentiment === 'positive') {
    progression = 'improving';
    confidence = 0.8;
  } else if (lastSentiment.sentiment === 'positive' && currentSentiment.sentiment === 'negative') {
    progression = 'declining';
    confidence = 0.8;
  } else if (lastSentiment.sentiment === currentSentiment.sentiment) {
    progression = 'consistent';
    confidence = 0.7;
  }
  
  return { progression, confidence, currentSentiment, previousSentiment: lastSentiment };
};

// Analyze learning indicators
const analyzeLearningIndicators = (message, contextWindow) => {
  const indicators = {
    questionsAsked: 0,
    clarificationRequests: 0,
    understandingConfirmations: 0,
    applicationAttempts: 0
  };
  
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'kya', 'kaise', 'kyun', 'kab', 'kahan'];
  const clarificationPhrases = ['can you explain', 'what do you mean', 'i dont understand', 'samajh nahi aya', 'explain again'];
  const understandingPhrases = ['i see', 'got it', 'makes sense', 'samajh gaya', 'clear hai', 'acha'];
  const applicationPhrases = ['let me try', 'i will', 'practice', 'apply', 'use this', 'try karunga'];
  
  // Check current message
  if (questionWords.some(word => message.toLowerCase().includes(word)) || message.includes('?')) {
    indicators.questionsAsked++;
  }
  
  if (clarificationPhrases.some(phrase => message.toLowerCase().includes(phrase))) {
    indicators.clarificationRequests++;
  }
  
  if (understandingPhrases.some(phrase => message.toLowerCase().includes(phrase))) {
    indicators.understandingConfirmations++;
  }
  
  if (applicationPhrases.some(phrase => message.toLowerCase().includes(phrase))) {
    indicators.applicationAttempts++;
  }
  
  // Analyze context window for learning patterns
  contextWindow.slice(-3).forEach(msg => {
    if (!msg || typeof msg !== 'object') return;
    const text = (msg.text || '').toLowerCase();
    if (questionWords.some(word => text.includes(word)) || msg.text?.includes('?')) {
      indicators.questionsAsked++;
    }
    if (clarificationPhrases.some(phrase => text.includes(phrase))) {
      indicators.clarificationRequests++;
    }
    if (understandingPhrases.some(phrase => text.includes(phrase))) {
      indicators.understandingConfirmations++;
    }
    if (applicationPhrases.some(phrase => text.includes(phrase))) {
      indicators.applicationAttempts++;
    }
  });
  
  // Calculate learning engagement score
  const totalIndicators = Object.values(indicators).reduce((sum, val) => sum + val, 0);
  const engagementScore = totalIndicators / Math.max(1, contextWindow.length + 1);
  
  return {
    indicators,
    engagementScore,
    learningPhase: determineLearningPhase(indicators)
  };
};

// Determine current learning phase
const determineLearningPhase = (indicators) => {
  if (indicators.questionsAsked > indicators.understandingConfirmations) {
    return 'exploring';
  } else if (indicators.clarificationRequests > 0) {
    return 'clarifying';
  } else if (indicators.understandingConfirmations > 0) {
    return 'understanding';
  } else if (indicators.applicationAttempts > 0) {
    return 'applying';
  } else {
    return 'initial';
  }
};

// Detect repeated patterns across context window
export const detectRepeatedPatterns = (message, contextWindow) => {
  const patterns = {
    repeatedQuestions: 0,
    repeatedTopics: 0,
    repeatedEmotions: 0,
    stuckIndicators: 0
  };
  
  if (contextWindow.length === 0) return patterns;
  
  const recentMessages = contextWindow.slice(-5);
  const currentAnalysis = {
    hasQuestion: message.includes('?'),
    topics: trackEntities(message, []).subjects,
    emotion: analyzeSentiment(message).sentiment
  };
  
  // Check for repeated questions
  if (currentAnalysis.hasQuestion) {
    patterns.repeatedQuestions = recentMessages.filter(msg => 
      msg.text?.includes('?')
    ).length;
  }
  
  // Check for repeated topics
  if (currentAnalysis.topics.length > 0) {
    recentMessages.forEach(msg => {
      const msgTopics = trackEntities(msg.text || '', []).subjects;
      const overlap = currentAnalysis.topics.filter(topic => 
        msgTopics.includes(topic)
      ).length;
      if (overlap > 0) patterns.repeatedTopics++;
    });
  }
  
  // Check for repeated emotions
  if (currentAnalysis.emotion !== 'neutral') {
    recentMessages.forEach(msg => {
      const msgEmotion = analyzeSentiment(msg.text || '').sentiment;
      if (msgEmotion === currentAnalysis.emotion) patterns.repeatedEmotions++;
    });
  }
  
  // Check for stuck indicators
  const stuckPhrases = ['still confused', 'still dont understand', 'abhi bhi samajh nahi', 'same problem'];
  if (stuckPhrases.some(phrase => message.toLowerCase().includes(phrase))) {
    patterns.stuckIndicators++;
  }
  
  return {
    patterns,
    isStuck: patterns.stuckIndicators > 0 || (patterns.repeatedQuestions > 2 && patterns.repeatedEmotions > 2),
    needsNewApproach: patterns.repeatedQuestions > 1 && patterns.repeatedTopics > 1
  };
};
