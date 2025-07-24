// Global application constants
export const APP_ID = 'project-q-34d01';

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  DB_QUERY_TIME: 1000, // 1 second
  MEMORY_USAGE: 100, // 100MB
  CACHE_HIT_RATE: 0.8, // 80%
  ERROR_RATE: 0.05 // 5%
};

// UI Constants
export const UI_CONSTANTS = {
  SKELETON_ANIMATION_DURATION: 1500, // milliseconds
  NOTIFICATION_DURATION: 3000, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  PAGINATION_SIZE: 10
};

// Cache configuration
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 200,
  CLEANUP_INTERVAL: 30 * 1000 // 30 seconds
};

// Message types for internal use
export const MESSAGE_TYPES = {
  USER: 'user',
  MODEL: 'model',
  SYSTEM: 'system',
  SUMMARY: 'summary'
};

// Request types for API calls
export const REQUEST_TYPES = {
  GENERATE_CONTENT: 'generateContent',
  GENERATE_QUIZ: 'generateQuiz'
};

// File validation constants
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_MESSAGE: 3,
  SUPPORTED_TYPES: ['txt', 'pdf', 'docx', 'jpg', 'png', 'gif']
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  FADE_DURATION: 200,
  SLIDE_DURATION: 300,
  BOUNCE_DURATION: 400
};
