// EntityRecognition.js - Comprehensive Entity Recognition for ECC
// Extracts entities like names, dates, places, subjects, and more from text
// Supports Roman Urdu and English mixed content

// Entity patterns and common terms
const ENTITY_PATTERNS = {
  // Pakistani names (common first names)
  pakistaniNames: [
    'Ahmad', 'Ali', 'Hassan', 'Hussain', 'Muhammad', 'Ahmed', 'Usman', 'Omar', 'Asad',
    'Fatima', 'Aisha', 'Zainab', 'Khadija', 'Maryam', 'Sana', 'Ayesha', 'Rabia',
    'Bilal', 'Tariq', 'Imran', 'Kashif', 'Saad', 'Hamza', 'Umar', 'Faisal',
    'Saba', 'Hina', 'Nadia', 'Samina', 'Farah', 'Uzma', 'Shazia', 'Rubina'
  ],
  
  // Pakistani cities
  pakistaniCities: [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar',
    'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sargodha', 'Bahawalpur',
    'Sukkur', 'Larkana', 'Abbottabad', 'Mardan', 'Mingora', 'Dera Ghazi Khan'
  ],
  
  // Educational subjects
  subjects: [
    'Math', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Urdu',
    'Computer Science', 'History', 'Geography', 'Economics', 'Psychology',
    'Literature', 'Science', 'Social Studies', 'Islamic Studies', 'Pakistan Studies'
  ],
  
  // Educational institutions
  institutions: [
    'University', 'College', 'School', 'Institute', 'Academy', 'LUMS', 'NUST',
    'IBA', 'UET', 'Punjab University', 'Karachi University', 'FAST', 'COMSATS'
  ],
  
  // Time expressions (Roman Urdu and English)
  timeExpressions: [
    'today', 'tomorrow', 'yesterday', 'aaj', 'kal', 'parson', 'next week',
    'last week', 'this month', 'next month', 'agla hafte', 'pichla hafte'
  ],
  
  // Emotions and feelings
  emotions: [
    'happy', 'sad', 'excited', 'worried', 'confused', 'proud', 'disappointed',
    'khush', 'udaas', 'pareshan', 'confuse', 'proud', 'disappointed'
  ],
  
  // Events and activities
  events: [
    'exam', 'test', 'quiz', 'assignment', 'project', 'presentation', 'interview',
    'meeting', 'class', 'lecture', 'workshop', 'seminar', 'wedding', 'party',
    'imtihan', 'test', 'assignment', 'project', 'presentation', 'interview'
  ]
};

/**
 * Extracts entities from a given text
 * Supports multiple entity types and Roman Urdu
 * @param {string} text - Input text to extract entities from
 * @returns {Object} - Extracted entities categorized by type
 */
export const extractEntities = (text) => {
  if (!text || typeof text !== 'string') return {};

  const entities = {
    names: [],
    places: [],
    dates: [],
    subjects: [],
    institutions: [],
    timeExpressions: [],
    emotions: [],
    events: [],
    numbers: [],
    emails: [],
    phones: []
  };

  const lowerText = text.toLowerCase();
  
  // Extract Pakistani names
  ENTITY_PATTERNS.pakistaniNames.forEach(name => {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.names = [...entities.names, ...matches];
    }
  });
  
  // Extract Pakistani cities
  ENTITY_PATTERNS.pakistaniCities.forEach(city => {
    const regex = new RegExp(`\\b${city}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.places = [...entities.places, ...matches];
    }
  });
  
  // Extract subjects
  ENTITY_PATTERNS.subjects.forEach(subject => {
    const regex = new RegExp(`\\b${subject}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.subjects = [...entities.subjects, ...matches];
    }
  });
  
  // Extract institutions
  ENTITY_PATTERNS.institutions.forEach(institution => {
    const regex = new RegExp(`\\b${institution}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.institutions = [...entities.institutions, ...matches];
    }
  });
  
  // Extract time expressions
  ENTITY_PATTERNS.timeExpressions.forEach(timeExp => {
    const regex = new RegExp(`\\b${timeExp}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.timeExpressions = [...entities.timeExpressions, ...matches];
    }
  });
  
  // Extract emotions
  ENTITY_PATTERNS.emotions.forEach(emotion => {
    const regex = new RegExp(`\\b${emotion}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.emotions = [...entities.emotions, ...matches];
    }
  });
  
  // Extract events
  ENTITY_PATTERNS.events.forEach(event => {
    const regex = new RegExp(`\\b${event}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      entities.events = [...entities.events, ...matches];
    }
  });
  
  // Extract dates (various formats)
  const datePatterns = [
    /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12][0-9]|3[01])[\/\-](?:\d{2,4})\b/g,
    /\b(?:0?[1-9]|[12][0-9]|3[01])\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{2,4}\b/gi,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s(?:0?[1-9]|[12][0-9]|3[01]),?\s\d{2,4}\b/gi
  ];
  
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.dates = [...entities.dates, ...matches];
    }
  });
  
  // Extract numbers
  const numberPattern = /\b\d+(?:\.\d+)?\b/g;
  entities.numbers = text.match(numberPattern) || [];
  
  // Extract emails
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  entities.emails = text.match(emailPattern) || [];
  
  // Extract phone numbers (Pakistani format)
  const phonePattern = /\b(?:\+92|0)?[0-9]{10,11}\b/g;
  entities.phones = text.match(phonePattern) || [];
  
  // Remove duplicates from all arrays
  Object.keys(entities).forEach(key => {
    entities[key] = [...new Set(entities[key])];
  });
  
  return entities;
};

/**
 * Extracts specific entity types from text
 * @param {string} text - Input text
 * @param {Array} entityTypes - Array of entity types to extract
 * @returns {Object} - Filtered entities
 */
export const extractSpecificEntities = (text, entityTypes) => {
  const allEntities = extractEntities(text);
  const filtered = {};
  
  entityTypes.forEach(type => {
    if (allEntities[type]) {
      filtered[type] = allEntities[type];
    }
  });
  
  return filtered;
};

/**
 * Checks if text contains entities of specific types
 * @param {string} text - Input text
 * @param {Array} entityTypes - Array of entity types to check
 * @returns {boolean} - True if any of the specified entity types are found
 */
export const containsEntities = (text, entityTypes) => {
  const entities = extractSpecificEntities(text, entityTypes);
  return Object.values(entities).some(entityList => entityList.length > 0);
};

/**
 * Gets entity statistics from text
 * @param {string} text - Input text
 * @returns {Object} - Entity count statistics
 */
export const getEntityStats = (text) => {
  const entities = extractEntities(text);
  const stats = {};
  
  Object.keys(entities).forEach(type => {
    stats[type] = entities[type].length;
  });
  
  return stats;
};

/**
 * Extracts entities from conversation history
 * @param {Array} messages - Array of message objects
 * @returns {Object} - Aggregated entities from all messages
 */
export const extractEntitiesFromHistory = (messages) => {
  const aggregatedEntities = {
    names: [],
    places: [],
    dates: [],
    subjects: [],
    institutions: [],
    timeExpressions: [],
    emotions: [],
    events: [],
    numbers: [],
    emails: [],
    phones: []
  };
  
  messages.forEach(message => {
    if (message.text && message.role === 'user') {
      const entities = extractEntities(message.text);
      
      Object.keys(entities).forEach(type => {
        if (entities[type] && entities[type].length > 0) {
          aggregatedEntities[type] = [...aggregatedEntities[type], ...entities[type]];
        }
      });
    }
  });
  
  // Remove duplicates from aggregated entities
  Object.keys(aggregatedEntities).forEach(key => {
    aggregatedEntities[key] = [...new Set(aggregatedEntities[key])];
  });
  
  return aggregatedEntities;
};

// Export entity patterns for use in other modules
export { ENTITY_PATTERNS };

