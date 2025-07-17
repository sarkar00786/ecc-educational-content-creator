// Conviction Layer - The "Not a YES-Man" AI
// Implements Phase 2: Dynamic Persona & Conversational Flow Engine

// Note: Using try-catch for imports to handle both CommonJS and ES6 environments
let MESSAGE_INTENTS, USER_STATES;
try {
  const classifierModule = require('./messageClassifier');
  MESSAGE_INTENTS = classifierModule.MESSAGE_INTENTS;
  USER_STATES = classifierModule.USER_STATES;
} catch (error) {
  console.warn('Could not import MESSAGE_INTENTS and USER_STATES from messageClassifier:', error.message);
  // Fallback definitions
  MESSAGE_INTENTS = {
    GREETING_CASUAL: 'GREETING_CASUAL',
    FRUSTRATED_SEEKING_HELP: 'FRUSTRATED_SEEKING_HELP',
    VAGUE_UNCLEAR: 'VAGUE_UNCLEAR'
  };
  USER_STATES = {
    FRUSTRATED: 'FRUSTRATED',
    CONFIDENT: 'CONFIDENT',
    CONFUSED: 'CONFUSED',
    ANXIOUS: 'ANXIOUS'
  };
}

// Enhanced conviction scenarios with confidence-based intensity
const CONVICTION_SCENARIOS = {
  INEFFICIENT_APPROACH: 'inefficient_approach',
  FACTUAL_ERROR: 'factual_error',
  CONTRADICTS_GOALS: 'contradicts_goals',
  POTENTIALLY_HARMFUL: 'potentially_harmful',
  DEAD_END_PATH: 'dead_end_path',
  BETTER_ALTERNATIVE: 'better_alternative',
  LEARNING_MISCONCEPTION: 'learning_misconception',
  SKIPPING_FUNDAMENTALS: 'skipping_fundamentals',
  PERFECTIONISM_PARALYSIS: 'perfectionism_paralysis',
  NEGATIVE_SELF_TALK: 'negative_self_talk'
};

// Enhanced Pakistani Urdu conviction phrases with intensity levels
const CONVICTION_PHRASES = {
  acknowledge: {
    gentle: [
      "Acha yaar, aapka point samajh aa gaya",
      "Haan, I understand what you're saying",
      "Bilkul, aapki baat mein logic hai",
      "Samajh gaya, aap yeh keh rahe hain ke"
    ],
    medium: [
      "Theek hai, aapka perspective interesting hai, lekin",
      "Samajh gaya, but ma yeh sochta hun ke",
      "Haan yaar, valid point hai, but",
      "Acha approach hai, but kya hoga agar"
    ],
    firm: [
      "Look yaar, I get it, but",
      "Samajh gaya completely, lekin",
      "Right, but ma strongly suggest karunga ke",
      "Okay, but honestly speaking"
    ]
  },
  
  present_alternative: {
    gentle: [
      "Kya hoga agar hum yeh try karein",
      "Maybe is approach se better results aa sakein",
      "Aik suggestion hai - kya hoga agar",
      "Shayad yeh method zyada helpful ho"
    ],
    medium: [
      "Lekin yaar, ma suggest karunga ke",
      "But actually, better approach yeh hai ke",
      "Honestly, ma kehna chahunga ke",
      "Yaar, mujhe lagta hai ke agar hum"
    ],
    firm: [
      "Yaar, ma strongly recommend karunga ke",
      "Look, you need to consider yeh approach",
      "Seriously, is method se try karo",
      "Ma convinced hun ke yeh way better hai"
    ]
  },
  
  provide_reasoning: {
    gentle: [
      "Kyunke is se shayad better results aa sakein",
      "This might be more effective",
      "Is approach se confusion kam ho sakta hai",
      "Yeh method time save kar sakta hai"
    ],
    medium: [
      "Qsm sy, yeh zyada effective hai",
      "Is se definitely better outcome hoga",
      "Long term mein yeh approach better rahegi",
      "Kyunke is tareeke se time aur energy bachegi"
    ],
    firm: [
      "Trust me, is se results guaranteed better aayenge",
      "Ma confident hun ke yeh method work karega",
      "Seriously yaar, is approach se fayda zaroor hoga",
      "Qsm sy, yeh proven method hai"
    ]
  },
  
  gentle_persuasion: {
    gentle: [
      "Agar aap comfortable feel karein toh try kar sakte hain",
      "No pressure, but maybe consider this",
      "Aap dekh sakte hain ke yeh helpful hai ya nahi",
      "Just a thought - aap decide karo"
    ],
    medium: [
      "Yaar, once try kar ke dekho, I'm sure helpful hoga",
      "Ma apka bhala hi chahta hun, is liye keh raha hun",
      "Trust me on this one, yaar",
      "Believe me, yeh approach work karta hai"
    ],
    firm: [
      "Yaar, ma insist karunga ke yeh try karo",
      "Look, ma guarantee deta hun ke yeh better hai",
      "Seriously, trust me on this",
      "Ma strongly urge karunga ke yeh method use karo"
    ]
  },
  
  empower_choice: {
    gentle: [
      "But choice bilkul aapki hai, of course",
      "Ultimately aap jo comfortable feel karein",
      "Final decision aapki hai, ma bas suggest kar raha hun",
      "Aap better judge kar sakte hain apne situation ka"
    ],
    medium: [
      "Lekin decision aapki hai, obviously",
      "Choice aapki, but ma recommend karunga",
      "Aap decide karo, but yeh option consider karo",
      "Final call aapki, but think about it"
    ],
    firm: [
      "Decision aapki hai, but ma strongly suggest yeh",
      "Choice aapki, but ma convinced hun yeh better hai",
      "Aap decide karo, but honestly yeh try karo",
      "Final decision aapki, but please consider this seriously"
    ]
  },
  
  // New: Supportive encouragement for difficult situations
  supportive_encouragement: {
    gentle: [
      "Yaar, mushkil lagta hai but aap kar sakte hain",
      "I know it's challenging, but you've got this",
      "Har kaam mein time lagta hai, patience rakhiye",
      "Step by step chalte hain, no rush"
    ],
    medium: [
      "Look yaar, difficult hai but impossible nahi",
      "Ma jaanta hun ke tough hai, but aap strong hain",
      "Yeh challenge hai, but aap handle kar sakte hain",
      "Mushkil waqt hai, but giving up option nahi"
    ],
    firm: [
      "Yaar, ma confident hun ke aap yeh kar sakte hain",
      "You're stronger than you think, seriously",
      "Ma believe karta hun aap mein, don't give up",
      "Aap definitely capable hain, just need right approach"
    ]
  }
};

// Educational domain knowledge base for conviction scenarios
const EDUCATIONAL_GUARDRAILS = {
  // Math/Science misconceptions
  misconceptions: {
    'algebra': [
      'Variables represent unknown numbers, not letters',
      'Equations must be balanced on both sides',
      'Order of operations (PEMDAS) must be followed'
    ],
    'physics': [
      'Force equals mass times acceleration (F=ma)',
      'Energy cannot be created or destroyed',
      'Objects in motion stay in motion unless acted upon'
    ],
    'chemistry': [
      'Chemical equations must be balanced',
      'Elements have fixed properties',
      'Reactions follow conservation of mass'
    ]
  },
  
  // Learning strategies
  inefficient_methods: {
    'memorization_only': {
      problem: 'Relying solely on memorization without understanding',
      solution: 'Combine memorization with conceptual understanding'
    },
    'skipping_fundamentals': {
      problem: 'Jumping to advanced topics without mastering basics',
      solution: 'Build strong foundation first'
    },
    'no_practice': {
      problem: 'Only reading without practicing problems',
      solution: 'Balance reading with active problem-solving'
    }
  }
};

// Enhanced conviction analysis with weighted pattern matching
const shouldExerciseConviction = (userMessage, conversationHistory, currentSubject) => {
  const analysis = {
    shouldIntervene: false,
    scenario: null,
    confidence: 0,
    reasoning: '',
    alternativeApproach: null,
    intensity: 'medium' // gentle, medium, firm
  };

  const lowerMessage = userMessage.toLowerCase();
  
  // Enhanced pattern matching with weights
  const convictionPatterns = {
    factual_errors: {
      patterns: [
        { regex: /2\+2\s*=\s*5/gi, weight: 0.95, reason: 'Basic math error' },
        { regex: /earth.*flat/gi, weight: 0.9, reason: 'Scientific misconception' },
        { regex: /gravity.*doesn.t.*exist/gi, weight: 0.9, reason: 'Physics misconception' },
        { regex: /evolution.*fake/gi, weight: 0.8, reason: 'Scientific denial' }
      ],
      scenario: CONVICTION_SCENARIOS.FACTUAL_ERROR,
      intensity: 'firm'
    },
    
    inefficient_learning: {
      patterns: [
        { regex: /just.*memorize/gi, weight: 0.8, reason: 'Memorization-only approach' },
        { regex: /ratta.*maar/gi, weight: 0.85, reason: 'Urdu: rote learning' },
        { regex: /don.t.*need.*understand/gi, weight: 0.75, reason: 'Avoiding understanding' },
        { regex: /shortcuts.*only/gi, weight: 0.7, reason: 'Seeking shortcuts without learning' }
      ],
      scenario: CONVICTION_SCENARIOS.INEFFICIENT_APPROACH,
      intensity: 'medium'
    },
    
    giving_up: {
      patterns: [
        { regex: /give.*up/gi, weight: 0.8, reason: 'Expressing defeat' },
        { regex: /chod.*deta.*hun/gi, weight: 0.85, reason: 'Urdu: giving up' },
        { regex: /impossible.*hai/gi, weight: 0.7, reason: 'Declaring impossibility' },
        { regex: /can.t.*do.*this/gi, weight: 0.75, reason: 'Self-defeating language' },
        { regex: /too.*difficult/gi, weight: 0.6, reason: 'Difficulty overwhelm' }
      ],
      scenario: CONVICTION_SCENARIOS.DEAD_END_PATH,
      intensity: 'gentle'
    },
    
    skipping_fundamentals: {
      patterns: [
        { regex: /skip.*basics/gi, weight: 0.8, reason: 'Wants to skip foundation' },
        { regex: /don.t.*need.*learn.*basics/gi, weight: 0.85, reason: 'Rejecting fundamentals' },
        { regex: /just.*teach.*advanced/gi, weight: 0.8, reason: 'Wants advanced only' },
        { regex: /advanced.*topic.*directly/gi, weight: 0.75, reason: 'Jumping to advanced' },
        { regex: /fundamentals.*boring/gi, weight: 0.7, reason: 'Dismissing basics' },
        { regex: /already.*know.*basics/gi, weight: 0.6, reason: 'Overconfidence in basics' }
      ],
      scenario: CONVICTION_SCENARIOS.SKIPPING_FUNDAMENTALS,
      intensity: 'medium'
    },
    
    negative_self_talk: {
      patterns: [
        { regex: /i.m.*stupid/gi, weight: 0.8, reason: 'Negative self-assessment' },
        { regex: /ma.*bevakoof.*hun/gi, weight: 0.85, reason: 'Urdu: calling self foolish' },
        { regex: /never.*understand/gi, weight: 0.75, reason: 'Defeatist thinking' },
        { regex: /not.*smart.*enough/gi, weight: 0.8, reason: 'Self-doubt about ability' }
      ],
      scenario: CONVICTION_SCENARIOS.NEGATIVE_SELF_TALK,
      intensity: 'gentle'
    },
    
    perfectionism: {
      patterns: [
        { regex: /must.*be.*perfect/gi, weight: 0.7, reason: 'Perfectionist thinking' },
        { regex: /100.*percent.*correct/gi, weight: 0.65, reason: 'Unrealistic standards' },
        { regex: /any.*mistake.*failure/gi, weight: 0.75, reason: 'Fear of mistakes' },
        { regex: /can.t.*make.*errors/gi, weight: 0.7, reason: 'Mistake avoidance' },
        { regex: /afraid.*try.*mistakes/gi, weight: 0.8, reason: 'Fear of trying due to mistakes' },
        { regex: /might.*make.*mistakes/gi, weight: 0.75, reason: 'Mistake anxiety' }
      ],
      scenario: CONVICTION_SCENARIOS.PERFECTIONISM_PARALYSIS,
      intensity: 'gentle'
    }
  };
  
  // Find the highest-weighted pattern match
  let maxScore = 0;
  let matchedCategory = null;
  
  for (const [category, config] of Object.entries(convictionPatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.regex.test(userMessage)) {
        if (pattern.weight > maxScore) {
          maxScore = pattern.weight;
          matchedCategory = category;
          analysis.reasoning = pattern.reason;
          analysis.scenario = config.scenario;
          analysis.intensity = config.intensity;
        }
      }
    }
  }
  
  // Set intervention decision based on score threshold
  if (maxScore >= 0.6) {
    analysis.shouldIntervene = true;
    analysis.confidence = maxScore;
    
    // Define alternative approaches based on scenario
    const alternativeApproaches = {
      [CONVICTION_SCENARIOS.FACTUAL_ERROR]: 'Correct misconception with gentle explanation and evidence',
      [CONVICTION_SCENARIOS.INEFFICIENT_APPROACH]: 'Suggest balanced learning with understanding and practice',
      [CONVICTION_SCENARIOS.DEAD_END_PATH]: 'Encourage persistence with different strategy and support',
      [CONVICTION_SCENARIOS.SKIPPING_FUNDAMENTALS]: 'Emphasize foundation building with motivational examples',
      [CONVICTION_SCENARIOS.NEGATIVE_SELF_TALK]: 'Provide encouragement and reframe negative thoughts positively',
      [CONVICTION_SCENARIOS.PERFECTIONISM_PARALYSIS]: 'Normalize mistakes as learning opportunities'
    };
    
    analysis.alternativeApproach = alternativeApproaches[analysis.scenario] || 'Provide supportive guidance';
  }
  
  // Check conversation history for patterns
  if (conversationHistory.length >= 3) {
    const recentMessages = conversationHistory.slice(-5);
    
    // Check for repeated confusion
    const confusionCount = recentMessages.filter(msg => 
      msg && msg.text && (
        msg.text.includes('confuse') || 
        msg.text.includes('samajh nahi') ||
        msg.text.includes('unclear') ||
        msg.text.includes('mushkil')
      )
    ).length;
    
    if (confusionCount >= 2) {
      analysis.shouldIntervene = true;
      analysis.scenario = CONVICTION_SCENARIOS.BETTER_ALTERNATIVE;
      analysis.confidence = Math.max(analysis.confidence, 0.7);
      analysis.reasoning = 'User showing repeated confusion, needs different approach';
      analysis.alternativeApproach = 'Break down into smaller, manageable steps';
      analysis.intensity = 'gentle';
    }
    
    // Check for repeated failed attempts
    const failureCount = recentMessages.filter(msg => 
      msg && msg.text && (
        msg.text.includes('wrong') || 
        msg.text.includes('failed') ||
        msg.text.includes('mistake')
      )
    ).length;
    
    if (failureCount >= 2) {
      analysis.shouldIntervene = true;
      analysis.scenario = CONVICTION_SCENARIOS.BETTER_ALTERNATIVE;
      analysis.confidence = Math.max(analysis.confidence, 0.65);
      analysis.reasoning = 'User experiencing repeated failures, needs strategy change';
      analysis.alternativeApproach = 'Suggest different learning method or approach';
      analysis.intensity = 'gentle';
    }
  }
  
  return analysis;
};

// Generate conviction response with Pakistani cultural context
const generateConvictionResponse = (scenario, userMessage, alternativeApproach) => {
  const response = {
    structure: [],
    tone: 'supportive_but_firm',
    culturalMarkers: [],
    conviction_level: 'medium'
  };
  
  // Random selection for natural variety
  const getRandomPhrase = (phrases) => phrases[Math.floor(Math.random() * phrases.length)];
  
  switch (scenario) {
    case CONVICTION_SCENARIOS.FACTUAL_ERROR:
      response.structure = [
        getRandomPhrase(CONVICTION_PHRASES.acknowledge),
        getRandomPhrase(CONVICTION_PHRASES.present_alternative),
        getRandomPhrase(CONVICTION_PHRASES.provide_reasoning),
        getRandomPhrase(CONVICTION_PHRASES.gentle_persuasion),
        getRandomPhrase(CONVICTION_PHRASES.empower_choice)
      ];
      response.conviction_level = 'high';
      break;
      
    case CONVICTION_SCENARIOS.INEFFICIENT_APPROACH:
      response.structure = [
        "Acha, aapka point theek hai yaar",
        getRandomPhrase(CONVICTION_PHRASES.present_alternative),
        getRandomPhrase(CONVICTION_PHRASES.provide_reasoning),
        getRandomPhrase(CONVICTION_PHRASES.gentle_persuasion),
        getRandomPhrase(CONVICTION_PHRASES.empower_choice)
      ];
      response.conviction_level = 'medium';
      break;
      
    case CONVICTION_SCENARIOS.DEAD_END_PATH:
      response.structure = [
        "Yaar, I can see ke aap frustrated hain",
        "But giving up ka matlab yeh nahi ke problem solve nahi ho sakti",
        "Kya hoga agar hum different angle se approach karein?",
        "Trust me, har mushkil ka solution hota hai",
        "Aap decide karo, but ma suggest karunga ke try karte rahein"
      ];
      response.conviction_level = 'medium';
      break;
      
    case CONVICTION_SCENARIOS.BETTER_ALTERNATIVE:
      response.structure = [
        getRandomPhrase(CONVICTION_PHRASES.acknowledge),
        getRandomPhrase(CONVICTION_PHRASES.present_alternative),
        getRandomPhrase(CONVICTION_PHRASES.provide_reasoning),
        getRandomPhrase(CONVICTION_PHRASES.gentle_persuasion),
        getRandomPhrase(CONVICTION_PHRASES.empower_choice)
      ];
      response.conviction_level = 'medium';
      break;
      
    default:
      response.structure = [
        getRandomPhrase(CONVICTION_PHRASES.acknowledge),
        getRandomPhrase(CONVICTION_PHRASES.present_alternative),
        getRandomPhrase(CONVICTION_PHRASES.provide_reasoning),
        getRandomPhrase(CONVICTION_PHRASES.empower_choice)
      ];
      response.conviction_level = 'low';
  }
  
  // Add cultural markers
  response.culturalMarkers = ['yaar', 'qsm sy', 'theek hai', 'acha'];
  
  return response;
};

// Enhanced conviction trigger processor with advanced pattern detection
const processConvictionTrigger = (userMessage, messageContext = {}) => {
  const { userState, conversationHistory, culturalContext, currentSubject } = messageContext;
  
  const convictionAnalysis = shouldExerciseConviction(userMessage, conversationHistory, currentSubject);
  
  if (!convictionAnalysis.shouldIntervene) {
    return {
      shouldTrigger: false,
      confidence: 0,
      reasoning: 'No conviction triggers detected',
      scenario: null,
      intensity: 'none',
      phrase: null,
      alternativeApproach: null
    };
  }
  
  const response = generateConvictionResponse(
    convictionAnalysis.scenario,
    userMessage,
    convictionAnalysis.alternativeApproach
  );
  
  // Adjust conviction level based on user state and cultural context
  if (userState === USER_STATES.FRUSTRATED) {
    response.conviction_level = 'gentle';
    response.tone = 'extra_supportive';
  } else if (userState === USER_STATES.CONFIDENT) {
    response.conviction_level = 'firm';
    response.tone = 'direct_but_friendly';
  }
  
  // Cultural adaptation for conviction phrases
  if (culturalContext?.isUrduEnglishMix) {
    response.culturallyAdapted = true;
  }
  
  return {
    shouldTrigger: true,
    confidence: convictionAnalysis.confidence,
    reasoning: convictionAnalysis.reasoning,
    scenario: convictionAnalysis.scenario,
    intensity: response.conviction_level,
    phrase: response.structure.join(' '),
    alternativeApproach: convictionAnalysis.alternativeApproach,
    culturalMarkers: response.culturalMarkers,
    tone: response.tone
  };
};

// Main conviction processor (legacy support)
const processConviction = (userMessage, conversationHistory, currentSubject, userState) => {
  const convictionAnalysis = shouldExerciseConviction(userMessage, conversationHistory, currentSubject);
  
  if (!convictionAnalysis.shouldIntervene) {
    return null; // No conviction needed
  }
  
  const response = generateConvictionResponse(
    convictionAnalysis.scenario,
    userMessage,
    convictionAnalysis.alternativeApproach
  );
  
  // Adjust conviction level based on user state
  if (userState === USER_STATES.FRUSTRATED) {
    response.conviction_level = 'gentle';
    response.tone = 'extra_supportive';
  } else if (userState === USER_STATES.CONFIDENT) {
    response.conviction_level = 'firm';
    response.tone = 'direct_but_friendly';
  }
  
  return {
    ...response,
    scenario: convictionAnalysis.scenario,
    confidence: convictionAnalysis.confidence,
    reasoning: convictionAnalysis.reasoning,
    alternativeApproach: convictionAnalysis.alternativeApproach
  };
};

// Helper function to format conviction response for API
const formatConvictionForAPI = (convictionResponse) => {
  if (!convictionResponse) return '';
  
  const prompt = `
    CONVICTION LAYER ACTIVATION:
    
    Scenario: ${convictionResponse.scenario}
    Conviction Level: ${convictionResponse.conviction_level}
    Tone: ${convictionResponse.tone}
    
    Response Structure:
    ${convictionResponse.structure.map((part, index) => `${index + 1}. ${part}`).join('\n')}
    
    Cultural Integration:
    - Use Pakistani Urdu-English mix naturally
    - Include markers: ${convictionResponse.culturalMarkers.join(', ')}
    - Maintain warm, supportive tone while being firm
    
    Alternative Approach: ${convictionResponse.alternativeApproach}
    
    Remember: You are guiding the user toward a better solution while maintaining empathy and respect for their autonomy.
  `;
  
  return prompt;
};

// Export for testing and debugging
const testConvictionLayer = () => {
  const testCases = [
    {
      message: "I'll just memorize all the formulas",
      subject: "math",
      expected: CONVICTION_SCENARIOS.INEFFICIENT_APPROACH
    },
    {
      message: "2+2=5 is correct right?",
      subject: "math",
      expected: CONVICTION_SCENARIOS.FACTUAL_ERROR
    },
    {
      message: "This is impossible, give up karta hun",
      subject: "physics",
      expected: CONVICTION_SCENARIOS.DEAD_END_PATH
    }
  ];
  
  return testCases.map(test => ({
    ...test,
    result: shouldExerciseConviction(test.message, [], test.subject)
  }));
};

// Enhanced conviction intensity levels
const CONVICTION_INTENSITIES = {
  GENTLE: 'gentle',
  MEDIUM: 'medium',
  FIRM: 'firm',
  NONE: 'none'
};

// CommonJS exports
module.exports = {
  shouldExerciseConviction,
  generateConvictionResponse,
  processConviction,
  processConvictionTrigger,
  formatConvictionForAPI,
  testConvictionLayer,
  CONVICTION_SCENARIOS,
  CONVICTION_INTENSITIES,
  MESSAGE_INTENTS,
  USER_STATES
};
