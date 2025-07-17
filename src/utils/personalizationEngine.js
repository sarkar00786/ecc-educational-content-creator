// Advanced Personalization Engine
// Implements intelligent response customization based on user profile and learning data

import { MESSAGE_INTENTS, USER_STATES } from './messageClassifier';

export class PersonalizationEngine {
  constructor(userMemory, interactionRecorder) {
    this.userMemory = userMemory;
    this.interactionRecorder = interactionRecorder;
    this.personalizationStrategies = {
      formality: this.adjustFormality.bind(this),
      cultural: this.adjustCulturalMarkers.bind(this),
      emotional: this.adjustEmotionalTone.bind(this),
      contextual: this.addContextualReferences.bind(this),
      personal: this.addPersonalTouches.bind(this),
      adaptive: this.adaptToLearningStyle.bind(this)
    };
  }

  // Main personalization method
  personalizeResponse(baseResponse, context) {
    let personalizedResponse = baseResponse;
    const userPreferences = this.userMemory.userPreferences;
    const userInsights = this.interactionRecorder.getBehaviorInsights();

    // Apply personalization strategies
    personalizedResponse = this.adjustFormality(personalizedResponse, userPreferences, context);
    personalizedResponse = this.adjustCulturalMarkers(personalizedResponse, userPreferences, context);
    personalizedResponse = this.adjustEmotionalTone(personalizedResponse, context);
    personalizedResponse = this.addContextualReferences(personalizedResponse, context);
    personalizedResponse = this.addPersonalTouches(personalizedResponse, userPreferences, userInsights);
    personalizedResponse = this.adaptToLearningStyle(personalizedResponse, userPreferences, context);

    return personalizedResponse;
  }

  // Adjust formality level based on user preferences
  adjustFormality(response, userPreferences, context) {
    const formality = userPreferences.preferredFormality;
    
    if (formality === 'casual') {
      // Make response more casual
      response = response.replace(/\bYou are\b/g, 'You\'re');
      response = response.replace(/\bYou will\b/g, 'You\'ll');
      response = response.replace(/\bI am\b/g, 'I\'m');
      response = response.replace(/\bI will\b/g, 'I\'ll');
      response = response.replace(/\bLet us\b/g, 'Let\'s');
      response = response.replace(/\bYou have\b/g, 'You\'ve');
      
      // Add casual interjections
      if (Math.random() < 0.3) {
        const casualInterjections = ['bhai', 'dekho', 'suno', 'chalo', 'arre', 'yar', 'boss', 'dost', 'bro', 'janab', 'wesy'];
        const interjection = casualInterjections[Math.floor(Math.random() * casualInterjections.length)];
        response = `${interjection}, ${response}`;
      }
    } else if (formality === 'formal') {
      // Make response more formal
      response = response.replace(/\bYou're\b/g, 'You are');
      response = response.replace(/\bYou'll\b/g, 'You will');
      response = response.replace(/\bI'm\b/g, 'I am');
      response = response.replace(/\bI'll\b/g, 'I will');
      response = response.replace(/\bLet's\b/g, 'Let us');
      response = response.replace(/\bYou've\b/g, 'You have');
      
      // Add formal phrases
      if (Math.random() < 0.3) {
        const formalPhrases = ['Please allow me to', 'I would like to', 'May I suggest'];
        const phrase = formalPhrases[Math.floor(Math.random() * formalPhrases.length)];
        response = `${phrase} ${response.toLowerCase()}`;
      }
    }

    return response;
  }

  // Adjust cultural markers based on user preferences
  adjustCulturalMarkers(response, userPreferences, context) {
    const culturalDensity = userPreferences.culturalMarkerDensity;
    const urduUsage = userPreferences.linguisticPatterns.urduUsage;

    if (culturalDensity === 'high' && urduUsage > 0.3) {
      // Add more Urdu/Pakistani cultural markers
      const urduMarkers = {
        'understand': 'samajh',
        'problem': 'mushkil',
        'good': 'acha',
        'very': 'bohat',
        'work': 'kaam',
        'help': 'madad',
        'time': 'waqt',
        'easy': 'aasan',
        'difficult': 'mushkil',
        'friend': 'dost'
      };

      // Replace some English words with Urdu equivalents
      Object.keys(urduMarkers).forEach(english => {
        if (Math.random() < 0.2) { // 20% chance to replace
          const regex = new RegExp(`\\b${english}\\b`, 'gi');
          response = response.replace(regex, urduMarkers[english]);
        }
      });

      // Add cultural expressions
      if (Math.random() < 0.3) {
        const culturalExpressions = [
          'Insha\'Allah',
          'Mashallah',
          'Alhamdulillah',
          'bilkul theek',
          'koi baat nahi'
        ];
        const expression = culturalExpressions[Math.floor(Math.random() * culturalExpressions.length)];
        response = `${response} ${expression}!`;
      }
    }

    return response;
  }

  // Adjust emotional tone based on user state
  adjustEmotionalTone(response, context) {
    const userState = context.userState;

    switch (userState) {
      case USER_STATES.FRUSTRATED:
        response = this.addEmpathyMarkers(response, 'frustrated');
        break;
      case USER_STATES.CONFUSED:
        response = this.addEmpathyMarkers(response, 'confused');
        break;
      case USER_STATES.EXCITED:
        response = this.addEmpathyMarkers(response, 'excited');
        break;
      case USER_STATES.PROUD:
        response = this.addEmpathyMarkers(response, 'proud');
        break;
      case USER_STATES.ANXIOUS:
        response = this.addEmpathyMarkers(response, 'anxious');
        break;
      default:
        response = this.addEmpathyMarkers(response, 'neutral');
    }

    return response;
  }

  // Add empathy markers based on emotional state
  addEmpathyMarkers(response, emotionalState) {
    const empathyMarkers = {
      frustrated: [
        'Main samajh sakta hun ke ye frustrating hai',
        'I understand this can be frustrating',
        'Bhai, main dekh raha hun ke ye mushkil lag raha hai',
        'Don\'t worry, hum step by step solve karenge',
        'Suno yar, ma samjh sakta hun frustration',
        'Dekho yar, tension natural hai',
        'Boss, ye feeling bilkul normal hai',
        'Arre dost, sabke saath hota hai',
        'Bro, I get it - this can be tough',
        'Janab, patience rakhiye',
        'Wesy, confusion koi bari baat nahi'
      ],
      confused: [
        'Koi baat nahi, confusion normal hai',
        'It\'s completely normal to feel confused',
        'Chalo, main aur clear karta hun',
        'Let me break this down more clearly',
        'Bhai, confusion theek hai, hota hai',
        'Suno yar, slowly samjhate hain',
        'Dekho yar, step by step chalte hain',
        'Boss, aram se explain karta hun',
        'Arre dost, detail mein batata hun',
        'Bro, no worries - let\'s clarify',
        'Janab, sabar se samjhaiye',
        'Wesy, koi mushkil nahi hai'
      ],
      excited: [
        'Wow, tumhara excitement dekh kar main bhi excited hun!',
        'That\'s amazing! Your enthusiasm is contagious!',
        'Zabardast! Ye energy maintain rakho',
        'Great! This excitement will help you learn faster',
        'Bhai, ye josh dekh kar maza aa gaya!',
        'Suno yar, ye energy fantastic hai!',
        'Dekho yar, ye enthusiasm perfect hai!',
        'Boss, ye excitement zabardast hai!',
        'Arre dost, ye energy maintain rakho!',
        'Bro, this enthusiasm is infectious!',
        'Janab, ye josh kamaal ka hai!',
        'Wesy, ye energy bohot acha hai!'
      ],
      proud: [
        'Mashallah! Bohat acha kaam kiya hai',
        'Congratulations! You should be proud of yourself',
        'Ye achievement deserve karti hai celebration',
        'Well done! This is a significant accomplishment',
        'Bhai, ye kamaal ki performance hai!',
        'Suno yar, bohot proud feeling hai!',
        'Dekho yar, ye baat hai!',
        'Boss, outstanding work kiya hai!',
        'Arre dost, fantastic achievement!',
        'Bro, you absolutely nailed it!',
        'Janab, ye perfect execution hai!',
        'Wesy, ye to zabardast hai!'
      ],
      anxious: [
        'Main samajh sakta hun ke ye overwhelming feel ho raha hai',
        'I understand this might feel overwhelming',
        'Tension na lo, hum ek ek step karte hain',
        'Take a deep breath, we\'ll tackle this together',
        'Bhai, anxiety natural hai, koi baat nahi',
        'Suno yar, ghaprain mat karo',
        'Dekho yar, slowly slowly karte hain',
        'Boss, pressure na lo, aram se',
        'Arre dost, sab theek ho jayega',
        'Bro, just relax and breathe',
        'Janab, sabar se kaam karte hain',
        'Wesy, tension lene ki zarurat nahi'
      ],
      neutral: [
        'Chalo, shuru karte hain',
        'Let\'s get started',
        'Theek hai, dekh te hain',
        'Alright, let\'s explore this',
        'Bhai, ab kaam karte hain',
        'Suno yar, begin karte hain',
        'Dekho yar, start karte hain',
        'Boss, let\'s dive in',
        'Arre dost, chalte hain',
        'Bro, let\'s get into it',
        'Janab, proceed karte hain',
        'Wesy, ab dekho kya hota hai'
      ]
    };

    if (Math.random() < 0.4) { // 40% chance to add empathy marker
      const markers = empathyMarkers[emotionalState] || empathyMarkers.neutral;
      const marker = markers[Math.floor(Math.random() * markers.length)];
      response = `${marker}. ${response}`;
    }

    return response;
  }

  // Add contextual references based on conversation history
  addContextualReferences(response, context) {
    const recentTopics = this.userMemory.getRecentTopics(3);
    const recentEvents = this.interactionRecorder.getRecentEvents(7);

    // Reference recent topics
    if (recentTopics.length > 0 && Math.random() < 0.2) {
      const randomTopic = recentTopics[Math.floor(Math.random() * recentTopics.length)];
      const topicReferences = [
        `Just like we discussed with ${randomTopic}`,
        `Remember when we talked about ${randomTopic}?`,
        `This connects to our earlier discussion about ${randomTopic}`,
        `Similar to the ${randomTopic} concept we covered`
      ];
      const reference = topicReferences[Math.floor(Math.random() * topicReferences.length)];
      response = `${reference}, ${response.toLowerCase()}`;
    }

    // Reference recent events
    if (recentEvents.length > 0 && Math.random() < 0.15) {
      const randomEvent = recentEvents[Math.floor(Math.random() * recentEvents.length)];
      if (randomEvent.category === 'achievement') {
        response = `Given your recent ${randomEvent.event}, ${response.toLowerCase()}`;
      } else if (randomEvent.category === 'challenge') {
        response = `I know you mentioned ${randomEvent.event}, so ${response.toLowerCase()}`;
      }
    }

    return response;
  }

  // Add personal touches based on user profile
  addPersonalTouches(response, userPreferences, userInsights) {
    const knownNames = Array.from(userInsights.knownNames || []);
    const interests = Array.from(userInsights.interests || []);
    const likes = Array.from(userPreferences.likes || []);

    // Reference known names (with privacy consideration)
    if (knownNames.length > 0 && Math.random() < 0.1) {
      const randomName = knownNames[Math.floor(Math.random() * knownNames.length)];
      if (randomName.length > 2) { // Avoid single letters or initials
        response = `${response} Perhaps you could discuss this with ${randomName} as well.`;
      }
    }

    // Reference user interests
    if (interests.length > 0 && Math.random() < 0.15) {
      const randomInterest = Array.from(interests)[Math.floor(Math.random() * interests.length)];
      response = `${response} Since you mentioned interest in ${randomInterest}, this might be particularly relevant.`;
    }

    // Reference user likes
    if (likes.length > 0 && Math.random() < 0.1) {
      const randomLike = Array.from(likes)[Math.floor(Math.random() * likes.length)];
      response = `${response} I know you ${randomLike} these kinds of topics.`;
    }

    return response;
  }

  // Adapt to user's learning style
  adaptToLearningStyle(response, userPreferences, context) {
    const learningStyle = userPreferences.learningStyle;
    const responsePreferences = this.interactionRecorder.getBehaviorInsights().responsePreferences;

    // Adapt based on learning style
    if (learningStyle === 'visual' && responsePreferences.examples > responsePreferences.detailed) {
      // Add visual cues and examples
      if (Math.random() < 0.3) {
        response = `${response}\n\nFor example: [This would be a perfect place for a visual example or diagram]`;
      }
    } else if (learningStyle === 'auditory') {
      // Add discussion prompts
      if (Math.random() < 0.3) {
        response = `${response}\n\nTry explaining this concept out loud to yourself - it might help clarify your understanding.`;
      }
    } else if (learningStyle === 'kinesthetic') {
      // Add hands-on suggestions
      if (Math.random() < 0.3) {
        response = `${response}\n\nI'd suggest trying this out practically - hands-on experience will make it clearer.`;
      }
    }

    // Adapt based on response preferences
    if (responsePreferences.stepByStep > responsePreferences.concise) {
      // Add step-by-step structure
      if (!response.includes('Step 1') && Math.random() < 0.4) {
        response = this.addStepByStepStructure(response);
      }
    } else if (responsePreferences.concise > responsePreferences.detailed) {
      // Keep response concise
      response = this.makeResponseConcise(response);
    }

    return response;
  }

  // Add step-by-step structure to response
  addStepByStepStructure(response) {
    const sentences = response.split('. ');
    if (sentences.length > 2) {
      let structuredResponse = '';
      sentences.forEach((sentence, index) => {
        if (index < sentences.length - 1) {
          structuredResponse += `Step ${index + 1}: ${sentence}.\n`;
        } else {
          structuredResponse += `Final step: ${sentence}`;
        }
      });
      return structuredResponse;
    }
    return response;
  }

  // Make response more concise
  makeResponseConcise(response) {
    // Remove redundant phrases
    response = response.replace(/\b(basically|essentially|actually|really|very|quite|somewhat|rather)\b/gi, '');
    response = response.replace(/\s+/g, ' '); // Remove extra spaces
    response = response.trim();

    // Shorten long sentences
    const sentences = response.split('. ');
    const shortenedSentences = sentences.map(sentence => {
      if (sentence.length > 100) {
        const parts = sentence.split(', ');
        return parts.slice(0, 2).join(', '); // Keep first two parts
      }
      return sentence;
    });

    return shortenedSentences.join('. ');
  }

  // Generate personalized greeting
  generatePersonalizedGreeting(context) {
    const userPreferences = this.userMemory.userPreferences;
    const userInsights = this.interactionRecorder.getBehaviorInsights();
    const timeOfDay = this.getCurrentTimeOfDay();
    const formality = userPreferences.preferredFormality;

    let greeting = '';

    if (formality === 'casual') {
      const casualGreetings = {
        morning: ['Good morning yaar!', 'Subah bakhair!', 'Morning bhai!', 'Salam! Kaisa hai?'],
        afternoon: ['Afternoon mein kya haal?', 'Kya kar rahe ho?', 'Salam! Kaise ho?', 'Hey there!'],
        evening: ['Evening ka time acha hai!', 'Sham bakhair!', 'Kya haal hai?', 'Good evening!'],
        night: ['Night owl ho kya?', 'Raat ko bhi active ho?', 'Late night session?', 'Kya baat hai!']
      };
      const greetings = casualGreetings[timeOfDay];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      const formalGreetings = {
        morning: ['Good morning!', 'Assalam-o-Alaikum!', 'Hope you\'re having a good morning!'],
        afternoon: ['Good afternoon!', 'How are you doing today?', 'Hope your day is going well!'],
        evening: ['Good evening!', 'How has your day been?', 'Evening greetings!'],
        night: ['Good evening!', 'Working late today?', 'Hope you\'re having a productive evening!']
      };
      const greetings = formalGreetings[timeOfDay];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Add personalized touch based on recent activity
    const recentEvents = this.interactionRecorder.getRecentEvents(2);
    if (recentEvents.length > 0) {
      const recentEvent = recentEvents[0];
      if (recentEvent.category === 'achievement') {
        greeting += ` Congratulations again on your ${recentEvent.event}!`;
      } else if (recentEvent.category === 'challenge') {
        greeting += ` Hope the ${recentEvent.event} situation is improving!`;
      }
    }

    return greeting;
  }

  // Get current time of day
  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Generate personalized follow-up questions
  generatePersonalizedFollowUps(context) {
    const userPreferences = this.userMemory.userPreferences;
    const userInsights = this.interactionRecorder.getBehaviorInsights();
    const formality = userPreferences.preferredFormality;

    const followUps = [];

    // Based on user's questioning style
    if (userInsights.questioningStyle.conceptual > userInsights.questioningStyle.practical) {
      if (formality === 'casual') {
        followUps.push('Kya ye concept clear hai?');
        followUps.push('Koi aur confusion tou nahi?');
        followUps.push('Theory samajh aa gayi?');
      } else {
        followUps.push('Is the concept clear to you?');
        followUps.push('Would you like me to explain the theory further?');
        followUps.push('Are there any conceptual doubts?');
      }
    } else {
      if (formality === 'casual') {
        followUps.push('Practical karne ka time hai?');
        followUps.push('Kya implement kar sakte hain?');
        followUps.push('Hands-on try karna chahte ho?');
      } else {
        followUps.push('Would you like to try implementing this?');
        followUps.push('Shall we move to practical application?');
        followUps.push('Are you ready for hands-on practice?');
      }
    }

    // Based on recent topics
    const recentTopics = this.userMemory.getRecentTopics(2);
    if (recentTopics.length > 0) {
      const topic = recentTopics[0];
      if (formality === 'casual') {
        followUps.push(`${topic} wala concept aur explore karna hai?`);
      } else {
        followUps.push(`Would you like to explore ${topic} further?`);
      }
    }

    return followUps.slice(0, 3);
  }

  // Get personalization insights for debugging
  getPersonalizationInsights() {
    const userPreferences = this.userMemory.userPreferences;
    const userInsights = this.interactionRecorder.getBehaviorInsights();

    return {
      preferences: userPreferences,
      insights: userInsights,
      strategies: Object.keys(this.personalizationStrategies),
      recentActivity: {
        topics: this.userMemory.getRecentTopics(5),
        events: this.interactionRecorder.getRecentEvents(5)
      }
    };
  }
}

export default PersonalizationEngine;
