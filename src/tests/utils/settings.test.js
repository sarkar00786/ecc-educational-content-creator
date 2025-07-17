import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  preferencesManager, 
  advancedSettingsManager, 
  settingsManager,
  DEFAULT_PREFERENCES,
  DEFAULT_ADVANCED_SETTINGS 
} from '../../utils/settings';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = mockLocalStorage;

describe('Settings Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('preferencesManager', () => {
    it('should load default preferences when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const preferences = preferencesManager.load();
      expect(preferences).toEqual(DEFAULT_PREFERENCES);
    });

    it('should load saved preferences from localStorage', () => {
      const savedPrefs = { theme: 'dark', language: 'es' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPrefs));
      
      const preferences = preferencesManager.load();
      expect(preferences.theme).toBe('dark');
      expect(preferences.language).toBe('es');
      expect(preferences.notifications).toEqual(DEFAULT_PREFERENCES.notifications);
    });

    it('should save preferences to localStorage', () => {
      const newPrefs = { theme: 'dark', language: 'fr' };
      preferencesManager.save(newPrefs);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ecc_user_preferences',
        JSON.stringify(newPrefs)
      );
    });

    it('should reset preferences to default', () => {
      const defaultPrefs = preferencesManager.reset();
      expect(defaultPrefs).toEqual(DEFAULT_PREFERENCES);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ecc_user_preferences');
    });

    it('should handle JSON parse errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const preferences = preferencesManager.load();
      expect(preferences).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('advancedSettingsManager', () => {
    it('should load default advanced settings when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const settings = advancedSettingsManager.load();
      expect(settings).toEqual(DEFAULT_ADVANCED_SETTINGS);
    });

    it('should merge saved settings with defaults', () => {
      const savedSettings = { 
        modelSettings: { temperature: 0.8 }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));
      
      const settings = advancedSettingsManager.load();
      expect(settings.modelSettings.temperature).toBe(0.8);
      expect(settings.modelSettings.maxTokens).toBe(DEFAULT_ADVANCED_SETTINGS.modelSettings.maxTokens);
    });

    it('should save advanced settings to localStorage', () => {
      const newSettings = { 
        defaultOutputLength: '1000',
        modelSettings: { temperature: 0.9, maxTokens: 2000 }
      };
      advancedSettingsManager.save(newSettings);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ecc_advanced_settings',
        JSON.stringify(newSettings)
      );
    });
  });

  describe('settingsManager', () => {
    it('should load all settings', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const allSettings = settingsManager.loadAll();
      
      expect(allSettings.preferences).toEqual(DEFAULT_PREFERENCES);
      expect(allSettings.advanced).toEqual(DEFAULT_ADVANCED_SETTINGS);
    });

    it('should save all settings', () => {
      const preferences = { theme: 'dark' };
      const advanced = { defaultOutputLength: '500' };
      
      settingsManager.saveAll(preferences, advanced);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should reset all settings', () => {
      const resetSettings = settingsManager.resetAll();
      
      expect(resetSettings.preferences).toEqual(DEFAULT_PREFERENCES);
      expect(resetSettings.advanced).toEqual(DEFAULT_ADVANCED_SETTINGS);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
    });
  });
});
