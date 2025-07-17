// Settings utility for managing user preferences and advanced settings
// This provides a centralized way to save, load, and manage user settings

const SETTINGS_KEYS = {
  PREFERENCES: 'ecc_user_preferences',
  ADVANCED_SETTINGS: 'ecc_advanced_settings'
};

// Default settings
const DEFAULT_PREFERENCES = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: false,
    contentGeneration: true,
    updates: true
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false
  }
};

const DEFAULT_ADVANCED_SETTINGS = {
  defaultOutputLength: '',
  defaultInstructions: '',
  promptTemplates: [],
  modelSettings: {
    temperature: 0.7,
    maxTokens: 1000
  }
};

// Utility functions for localStorage operations
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
};

// Deep merge utility for nested objects
const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

// Preferences management
export const preferencesManager = {
  load: () => {
    const stored = storage.get(SETTINGS_KEYS.PREFERENCES);
    return stored ? deepMerge(DEFAULT_PREFERENCES, stored) : DEFAULT_PREFERENCES;
  },

  save: (preferences) => {
    const success = storage.set(SETTINGS_KEYS.PREFERENCES, preferences);
    if (success) {
      // Dispatch custom event for components to listen to preference changes
      window.dispatchEvent(new CustomEvent('preferencesChanged', { detail: preferences }));
    }
    return success;
  },

  reset: () => {
    storage.remove(SETTINGS_KEYS.PREFERENCES);
    window.dispatchEvent(new CustomEvent('preferencesChanged', { detail: DEFAULT_PREFERENCES }));
    return DEFAULT_PREFERENCES;
  }
};

// Advanced settings management
export const advancedSettingsManager = {
  load: () => {
    const stored = storage.get(SETTINGS_KEYS.ADVANCED_SETTINGS);
    return stored ? deepMerge(DEFAULT_ADVANCED_SETTINGS, stored) : DEFAULT_ADVANCED_SETTINGS;
  },

  save: (settings) => {
    const success = storage.set(SETTINGS_KEYS.ADVANCED_SETTINGS, settings);
    if (success) {
      // Dispatch custom event for components to listen to settings changes
      window.dispatchEvent(new CustomEvent('advancedSettingsChanged', { detail: settings }));
    }
    return success;
  },

  reset: () => {
    storage.remove(SETTINGS_KEYS.ADVANCED_SETTINGS);
    window.dispatchEvent(new CustomEvent('advancedSettingsChanged', { detail: DEFAULT_ADVANCED_SETTINGS }));
    return DEFAULT_ADVANCED_SETTINGS;
  }
};

// Combined settings management
export const settingsManager = {
  loadAll: () => ({
    preferences: preferencesManager.load(),
    advanced: advancedSettingsManager.load()
  }),

  saveAll: (preferences, advanced) => {
    const prefSuccess = preferencesManager.save(preferences);
    const advSuccess = advancedSettingsManager.save(advanced);
    return prefSuccess && advSuccess;
  },

  resetAll: () => {
    preferencesManager.reset();
    advancedSettingsManager.reset();
    return {
      preferences: DEFAULT_PREFERENCES,
      advanced: DEFAULT_ADVANCED_SETTINGS
    };
  }
};

// Export defaults for use in components
export { DEFAULT_PREFERENCES, DEFAULT_ADVANCED_SETTINGS };
