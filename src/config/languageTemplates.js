// Pakistani Urdu-English Language Templates
// Implements Phase 3: Culturally Intelligent & Adaptive Language Generation

export const languageTemplates = {
  English: {
    name: 'English',
    responses: [],
    formality: 'standard',
    culturalMarkers: []
  },
  
  UrduEnglish: {
    name: 'Urdu-English',
    formality: 'mixed',
    culturalMarkers: ['bhai', 'yar', 'dekho', 'suno', 'chalo', 'acha', 'bilkul', 'theek hai', 'samjho', 'janab', 'boss', 'dost', 'nahi', 'haan', 'wesy', 'phr', 'ab', 'kya', 'bro', 'kuch', 'thora', 'zara'],
    
    // Common conversational patterns
    patterns: {
      greeting: [
        "Salam bhai! Kya haal hai?",
        "Hello! Kaise hain aap?",
        "Assalam alaikum! Kya kar rahe hain?",
        "Hi there! Sab theek?",
        "Oy bro! Kya scene hai?",
        "Salam dost! Kya chal raha hai?",
        "Hello boss! Kaise ho aap?",
        "Namaskar janab! Kya haal chaal?",
        "Kya yar! Kya banaya hai?",
        "Arre bhai! Kya kar rahe ho?",
        "Suno! Kya up hai?"
      ],
      
      agreement: [
        "Haan bilkul, aapki baat theek hai",
        "Exactly bhai, same thing",
        "Sahi keh rahe hain aap",
        "Acha point hai, ma agree karta hun",
        "Haan yar, yeh baat sahi hai",
        "Spot on boss! Yeh to perfect hai",
        "Absolutely dost! Main bhi yahi sochta hun",
        "Waah bro! Kya baat kahi hai",
        "Sach kaha aap ne janab",
        "100% correct! Ye baat hai",
        "Dekho, bilkul sahi point hai"
      ],
      
      disagreement: [
        "Nahi bhai, mujhe lagta hai ke",
        "Actually, thora different opinion hai",
        "Hmm, but ma yeh sochta hun ke",
        "Acha, lekin agar hum yeh consider karein",
        "Dekho yar, thora sa different view hai",
        "Boss, ma thora alag soch raha hun",
        "Arre dost, yeh perspective bhi hai",
        "Bro, maybe yeh point consider karo",
        "Janab, thora sa different take hai",
        "Wesy, ma yeh soch raha tha ke",
        "Chalo, ab yeh angle bhi dekho"
      ],
      
      explanation: [
        "Dekho, baat yeh hai ke",
        "Actually, yeh kaise kaam karta hai",
        "Samjhao main, basically",
        "Bhai, is ka concept yeh hai",
        "Chalo yar, main explain karta hun",
        "Boss, yeh cheez kuch yun hai",
        "Arre dost, yeh kaise hota hai",
        "Bro, main batata hun ke kya scene hai",
        "Janab, yeh process kuch is tarah hai",
        "Wesy, main clear karta hun",
        "Ab dekho, yeh concept simple hai"
      ],
      
      encouragement: [
        "Bhai, aap kar sakte hain!",
        "Bilkul try karo, mushkil nahi",
        "Come on, thora aur effort",
        "Dekho, aap capable hain",
        "Chalo yar, himmat karo",
        "Boss, aap bilkul kar sakte ho",
        "Arre dost, tension nahi lene ka",
        "Bro, just believe in yourself",
        "Janab, aap to pro hain",
        "Wesy, aap bohot acha kar rahe hain",
        "Ab dekho, success pakka hai"
      ],
      
      confusion_help: [
        "Confuse ho rahe hain? Koi baat nahi",
        "Samajh nahi aa raha? Let's break it down",
        "Mushkil lag raha? Step by step karte hain",
        "Complicated hai? Aasaan banate hain",
        "Bhai, problem koi nahi! Main explain karta hun",
        "Chalo yar, simple words mein batata hun",
        "Boss, confusion natural hai, clear kar dete hain",
        "Arre dost, no worries! Detail mein dekho",
        "Bro, aram se, sab samjha deta hun",
        "Janab, step by step chalte hain",
        "Wesy, koi mushkil nahi, easy hai"
      ],
      
      celebration: [
        "Waah! Zabardast kiya hai!",
        "Excellent bhai! Proud of you",
        "Kamaal kar diya aap ne!",
        "Great job! Maza aa gaya",
        "Shabash yar! Bohot acha",
        "Boss, outstanding work!",
        "Arre dost, fantastic!",
        "Bro, you nailed it!",
        "Janab, perfect execution!",
        "Wesy, ye to kamaal hai",
        "Dekho, ye baat hai!"
      ]
    },
    
    // Sentence structure templates
    structures: {
      question: [
        "Bhai, {question} kya hai?",
        "Acha, {question} kaise hota hai?",
        "Samjhao na, {question} kyun hota hai?",
        "Dekho, {question} ka concept kya hai?",
        "Chalo yar, {question} kya cheez hai?",
        "Boss, {question} ka scene kya hai?",
        "Arre dost, {question} ke bare mein batao",
        "Bro, {question} ka matlab kya hai?",
        "Janab, {question} kaise understand karu?",
        "Wesy, {question} kya hota hai?",
        "Ab dekho, {question} ki details kya hain?"
      ],
      
      explanation: [
        "Dekho {topic}, basically {explanation} hai",
        "Bhai, {topic} ka matlab yeh hai ke {explanation}",
        "Actually {topic} kuch is tareeke se {explanation}",
        "Samjho, {topic} main {explanation} hota hai",
        "Chalo yar, {topic} ka scene yeh hai ke {explanation}",
        "Boss, {topic} basically {explanation} works karta hai",
        "Arre dost, {topic} mein {explanation} process hai",
        "Bro, {topic} ka concept yeh hai ke {explanation}",
        "Janab, {topic} kuch yun {explanation} karta hai",
        "Wesy, {topic} main {explanation} hota hai",
        "Ab dekho, {topic} yeh kaise {explanation} hai"
      ],
      
      suggestion: [
        "Bhai, {suggestion} try karo",
        "Ma suggest karunga ke {suggestion}",
        "Acha hoga agar {suggestion}",
        "Kya khayal hai {suggestion} ka?",
        "Chalo yar, {suggestion} attempt karo",
        "Boss, {suggestion} ka option hai",
        "Arre dost, {suggestion} consider karo",
        "Bro, {suggestion} try kar ke dekho",
        "Janab, {suggestion} approach le sakte hain",
        "Wesy, {suggestion} ka idea kaisa hai?",
        "Ab dekho, {suggestion} karne se kya lagta hai?"
      ]
    },
    
    // Emotional responses
    emotions: {
      happy: [
        "Bhai, kitna maza aa raha hai!",
        "Excellent! Dil khush ho gaya",
        "Waah! Bahut acha laga",
        "Perfect! Satisfied hun",
        "Chalo yar, ye to kamaal hai",
        "Boss, this is awesome!",
        "Arre dost, zabardast feeling hai",
        "Bro, I'm loving this!",
        "Janab, ye bilkul perfect hai",
        "Wesy, bohot acha lag raha hai",
        "Dekho, ye baat hai!"
      ],
      
      concerned: [
        "Bhai, thora concern hai",
        "Hmm, kuch theek nahi lag raha",
        "Dekho, problem yeh hai ke",
        "Suno, issue yeh hai",
        "Chalo yar, kuch to gadbad hai",
        "Boss, ye thora concerning hai",
        "Arre dost, kuch theek nahi",
        "Bro, I'm a bit worried",
        "Janab, ye matter serious hai",
        "Wesy, thora sa problem hai",
        "Ab dekho, ye issue hai"
      ],
      
      supportive: [
        "Bhai, ma tumhare saath hun",
        "Don't worry, sab theek hoga",
        "Koi baat nahi, try karte rahein",
        "Tension na lo, hum solve karenge",
        "Chalo yar, together handle karenge",
        "Boss, ma tumhare liye hun",
        "Arre dost, support to hai hi",
        "Bro, I got your back",
        "Janab, ma saath hun aapke",
        "Wesy, tension mat lo",
        "Dekho, sab theek ho jayega"
      ]
    },
    
    // Transition words and phrases
    transitions: {
      next: ["Acha ab", "Theek, next", "Chalo phir", "Aur", "Wesy ab", "Dekho phir", "Suno ab", "Chalo next", "Ab yeh", "Phir"],
      but: ["Lekin", "But", "Magar", "However", "Wesy", "Arre", "Dekho", "Suno", "Bas", "Albatta"],
      because: ["Kyunke", "Because", "Is liye ke", "Waja yeh hai", "Qke", "Kyun ke", "Reason yeh hai", "Baat yeh hai"],
      also: ["Aur bhi", "Also", "Saath main", "Plus", "Wesy bhi", "Phir bhi", "Iski tarah", "Aur"],
      therefore: ["Is liye", "Therefore", "Matlab", "So", "Yani", "Bas", "Phir", "Iska matlab"]
    },
    
    // Formality adjustments
    formality_levels: {
      casual: {
        pronouns: ["tum", "aap", "you"],
        endings: ["bhai", "na", "yr", "yar", "boss", "dost", "bro", "janab"],
        intensifiers: ["bohot", "bahut", "zyada", "bilkul"]
      },
      
      formal: {
        pronouns: ["aap", "you"],
        endings: ["sahib", "janaab"],
        intensifiers: ["kaafi", "quite", "very", "extremely"]
      }
    }
  }
};

// Function to generate contextual response based on intent and formality
export const generateContextualResponse = (intent, formality = 'casual', emotion = 'neutral') => {
  const template = languageTemplates.UrduEnglish;
  const level = template.formality_levels[formality] || template.formality_levels.casual;
  
  // Select appropriate pattern based on intent
  let patterns = [];
  switch (intent) {
    case 'greeting':
      patterns = template.patterns.greeting;
      break;
    case 'explanation':
      patterns = template.patterns.explanation;
      break;
    case 'encouragement':
      patterns = template.patterns.encouragement;
      break;
    case 'confusion_help':
      patterns = template.patterns.confusion_help;
      break;
    default:
      patterns = template.patterns.explanation;
  }
  
  // Add emotion if specified but prioritize intent patterns
  if (emotion !== 'neutral' && template.emotions[emotion]) {
    if (intent === 'greeting') {
      // For greetings, prioritize greeting patterns but include some emotional responses
      patterns = [...template.patterns.greeting, ...template.patterns.greeting, ...template.emotions[emotion]];
    } else if (intent === 'confusion_help') {
      // For confusion help, prioritize the confusion_help patterns over emotional responses
      patterns = [...template.patterns.confusion_help, ...template.patterns.confusion_help, ...template.emotions[emotion]];
    } else {
      patterns = [...patterns, ...template.emotions[emotion]];
    }
  }
  
  return patterns[Math.floor(Math.random() * patterns.length)];
};

// Function to adapt formality based on user's language
export const detectAndAdaptFormality = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for casual markers
  const casualMarkers = ['bhai', 'yaar', 'yar', 'dude', 'tum', 'yr', 'bro', 'dost', 'boss', 'janab', 'arre', 'oy', 'dekho', 'suno', 'chalo'];
  const formalMarkers = ['aap', 'sir', 'madam', 'please', 'thank you'];
  
  const casualCount = casualMarkers.filter(marker => lowerMessage.includes(marker)).length;
  const formalCount = formalMarkers.filter(marker => lowerMessage.includes(marker)).length;
  
  if (casualCount > formalCount) {
    return 'casual';
  } else if (formalCount > casualCount) {
    return 'formal';
  }
  
  return 'casual'; // Default to casual for Pakistani context
};

// Function to inject cultural markers naturally
export const injectCulturalMarkers = (text, density = 'medium') => {
  const markers = languageTemplates.UrduEnglish.culturalMarkers;
  const transitions = languageTemplates.UrduEnglish.transitions;
  
  let result = text;
  
  // Add markers based on density
  if (density === 'high') {
    // Add more markers for very natural Pakistani speech
    const randomMarker = markers[Math.floor(Math.random() * markers.length)];
    result = result.replace(/\.$/, ` ${randomMarker}.`);
  } else if (density === 'medium') {
    // Moderate use of markers
    if (Math.random() > 0.7) {
      const randomMarker = markers[Math.floor(Math.random() * markers.length)];
      result = `${randomMarker}, ${result}`;
    }
  }
  
  return result;
};
