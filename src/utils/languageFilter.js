// Enhanced Language Filter System for ECC Chat
// Supports Roman Urdu while filtering Hindi pronunciation patterns

// Hindi-specific words and patterns to filter out (pronunciation-based)
const HINDI_PATTERNS = [
  // Hindi-specific pronunciations and words
  'namaste', 'dhanyawad', 'kripaya', 'maaf', 'kshama', 'punah', 'phir',
  'abhi', 'jaldi', 'dheere', 'zara', 'thoda', 'bahut', 'zyada', 'kaam',
  'ghar', 'paani', 'khana', 'sona', 'uthna', 'baithna', 'chalna',
  'dekhna', 'sunna', 'padhna', 'likhna', 'bolna', 'samjhna', 'karna',
  'hona', 'jana', 'aana', 'lena', 'dena', 'rakhna', 'nikalna',
  // Hindi-specific expressions
  'kya baat hai', 'accha lagta hai', 'bura lagta hai', 'theek lagta hai',
  'samay', 'waqt nahi', 'der ho gayi', 'jaldi karo', 'ruko zara',
  'suniye ji', 'dekhiye ji', 'samjhiye na', 'boliye na', 'kahiye na'
];

// Roman Urdu patterns (allowed - these are Urdu in English letters)
const ROMAN_URDU_PATTERNS = [
  // Common Roman Urdu words (pronunciation-based)
  'salam', 'assalam', 'yaar', 'bhai', 'acha', 'theek', 'hai', 'hain',
  'kya', 'kaise', 'kyun', 'kab', 'kahan', 'kaun', 'tum', 'aap', 'mein', 'se',
  'ka', 'ki', 'ke', 'ho', 'hun', 'hoon', 'lagta', 'raha', 'rahe', 'karta',
  'karte', 'chahiye', 'chahta', 'bilkul', 'zaroor', 'qsm', 'sy', 'yr', 'na',
  'nahi', 'han', 'haan', 'dekho', 'samjho', 'batao', 'sikhao', 'madad',
  'mushkil', 'dimagh', 'kharab', 'bakwas', 'kamaal', 'zabardast', 'waah',
  'maza', 'dilchasp', 'jaaniye', 'suniye', 'dekhiye', 'samjhiye',
  // Roman Urdu expressions
  'kya haal', 'kaisi ho', 'kaise ho', 'kya kar rahe', 'kesy ho', 'sup',
  'qsm sy', 'theek hai', 'samajh nahi', 'confused hun', 'bore ho gaya',
  'pagal ho gaya', 'stress aa raha', 'help karo', 'samjhao na', 'guide karo',
  'bata do', 'stuck hun', 'madad chahiye', 'solve karo', 'explain karo',
  'clear karo', 'ideas do', 'suggestions chahiye', 'options kya hain',
  'different ways', 'think karte hain', 'brainstorm karte', 'feel karta hun',
  'yaqeen nahi', 'sure nahi', 'doubt hai', 'sach mein', 'prove karo',
  'evidence do', 'convince karo', 'galat lagta', 'disagree karta',
  'samajh nahi aya', 'confuse hun', 'clear nahi', 'complicated lagta',
  'mix up ho gaya', 'lost hun', 'kya matlab'
];

// English alternatives for common expressions
const ENGLISH_ALTERNATIVES = {
  'salam': 'Hello',
  'assalam alaikum': 'Hello',
  'namaste': 'Hello',
  'yaar': 'friend',
  'bhai': 'friend',
  'acha': 'good',
  'theek': 'okay',
  'kya': 'what',
  'kaise': 'how',
  'kyun': 'why',
  'kab': 'when',
  'kahan': 'where',
  'kaun': 'who',
  'samjho': 'understand',
  'batao': 'tell me',
  'madad': 'help',
  'mushkil': 'difficult',
  'kamaal': 'amazing',
  'zabardast': 'excellent',
  'maza': 'fun',
  'dilchasp': 'interesting'
};

// Cultural expressions that maintain warmth without Hindi/Urdu
const CULTURAL_ENGLISH_EXPRESSIONS = {
  greetings: [
    'Hello there!',
    'Hi! How are you doing?',
    'Good to see you!',
    'Welcome! How can I help you today?',
    'Hey! What\'s on your mind?'
  ],
  encouragement: [
    'You can do this!',
    'Great effort! Keep going!',
    'That\'s a wonderful question!',
    'You\'re making excellent progress!',
    'I\'m here to support you!'
  ],
  understanding: [
    'I understand what you mean.',
    'That makes perfect sense.',
    'You\'re absolutely right.',
    'I see your point clearly.',
    'That\'s a great observation!'
  ],
  confusion_help: [
    'No worries, let me explain that differently.',
    'I can see this might be confusing. Let\'s break it down.',
    'That\'s a complex topic. Let me simplify it.',
    'Let me help clarify this for you.',
    'Don\'t worry, we\'ll work through this together.'
  ],
  celebration: [
    'Excellent work!',
    'That\'s fantastic!',
    'You nailed it!',
    'Outstanding achievement!',
    'I\'m so proud of your progress!'
  ]
};

/**
 * Filters out Hindi-specific words while preserving Roman Urdu
 * @param {string} text - Input text to filter
 * @returns {string} - Filtered text with Hindi patterns removed
 */
export const filterHindiContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let filteredText = text;
  
  // Only filter Hindi-specific patterns, preserve Roman Urdu
  HINDI_PATTERNS.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '');
  });
  
  // Clean up extra spaces
  filteredText = filteredText.replace(/\s+/g, ' ').trim();
  
  return filteredText;
};

/**
 * Detects if text contains Roman Urdu (allowed)
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if Roman Urdu is found
 */
export const containsRomanUrdu = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const lowerText = text.toLowerCase();
  return ROMAN_URDU_PATTERNS.some(pattern => 
    lowerText.includes(pattern.toLowerCase())
  );
};

/**
 * Legacy function - now filters only Hindi while preserving Roman Urdu
 * @param {string} text - Input text to filter
 * @returns {string} - Filtered text
 */
export const filterHindiUrduContent = (text) => {
  // Updated to only filter Hindi, preserve Roman Urdu
  return filterHindiContent(text);
};

/**
 * Detects if text contains Hindi content (to be filtered)
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if Hindi content is found
 */
export const containsHindiContent = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const lowerText = text.toLowerCase();
  return HINDI_PATTERNS.some(pattern => 
    lowerText.includes(pattern.toLowerCase())
  );
};

/**
 * Legacy function - now only detects Hindi patterns
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if Hindi content is found
 */
export const containsHindiUrduContent = (text) => {
  return containsHindiContent(text);
};

/**
 * Gets culturally appropriate English expression for a given intent
 * @param {string} intent - The intent type (greeting, encouragement, etc.)
 * @returns {string} - Appropriate English expression
 */
export const getCulturallyAppropriateExpression = (intent) => {
  const expressions = CULTURAL_ENGLISH_EXPRESSIONS[intent] || CULTURAL_ENGLISH_EXPRESSIONS.understanding;
  return expressions[Math.floor(Math.random() * expressions.length)];
};

/**
 * Validates that AI response contains no Hindi/Urdu content
 * @param {string} response - AI response to validate
 * @returns {Object} - Validation result with isValid and issues
 */
export const validateLanguageCompliance = (response) => {
  const issues = [];
  
  if (containsHindiUrduContent(response)) {
    const foundPatterns = HINDI_URDU_PATTERNS.filter(pattern => 
      response.toLowerCase().includes(pattern.toLowerCase())
    );
    issues.push(`Found Hindi/Urdu content: ${foundPatterns.join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    cleanedResponse: issues.length > 0 ? filterHindiUrduContent(response) : response
  };
};

/**
 * Generates human-like, culturally sensitive English responses
 * @param {string} intent - Message intent
 * @param {string} context - Conversation context
 * @returns {string} - Generated response
 */
export const generateHumanLikeResponse = (intent, context = '') => {
  const baseExpression = getCulturallyAppropriateExpression(intent);
  
  // Add conversational elements to make it more human-like
  const conversationalElements = [
    'I appreciate your question!',
    'That\'s a thoughtful approach.',
    'I can help you with that.',
    'Let me think about this with you.',
    'That\'s an interesting perspective.'
  ];
  
  const randomElement = conversationalElements[Math.floor(Math.random() * conversationalElements.length)];
  
  return `${baseExpression} ${randomElement}`;
};

// Export patterns for use in other modules
export { 
  HINDI_PATTERNS, 
  ROMAN_URDU_PATTERNS, 
  ENGLISH_ALTERNATIVES, 
  CULTURAL_ENGLISH_EXPRESSIONS,
  // Legacy exports for backward compatibility
  HINDI_PATTERNS as HINDI_URDU_PATTERNS
};
