import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { preferencesManager } from '../utils/settings';

const SettingsContext = createContext({
  theme: 'light',
  setTheme: () => {},
  preferences: {},
  updatePreferences: () => {},
  resetPreferences: () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [preferences, setPreferences] = useState({});

  // Apply theme to document element
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Detect system preference if theme is 'system'
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  // Initialize preferences and theme from localStorage
  useEffect(() => {
    const loadedPreferences = preferencesManager.load();
    setPreferences(loadedPreferences);
    setThemeState(loadedPreferences.theme || 'light');

    // Apply theme to document
    applyTheme(loadedPreferences.theme || 'light');

    // Listen for preference changes from other components
    const handlePreferencesChanged = (event) => {
      const newPreferences = event.detail;
      setPreferences(newPreferences);
      if (newPreferences.theme) {
        setThemeState(newPreferences.theme);
        applyTheme(newPreferences.theme);
      }
    };

    window.addEventListener('preferencesChanged', handlePreferencesChanged);
    
    return () => {
      window.removeEventListener('preferencesChanged', handlePreferencesChanged);
    };
  }, [applyTheme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Update preferences
    const updatedPreferences = { ...preferences, theme: newTheme };
    setPreferences(updatedPreferences);
    preferencesManager.save(updatedPreferences);
  }, [preferences, applyTheme]);

  const updatePreferences = useCallback((newPreferences) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    preferencesManager.save(updatedPreferences);

    // Update theme if it changed
    if (newPreferences.theme && newPreferences.theme !== theme) {
      setThemeState(newPreferences.theme);
      applyTheme(newPreferences.theme);
    }
  }, [preferences, theme, applyTheme]);

  const resetPreferences = useCallback(() => {
    const defaultPreferences = preferencesManager.reset();
    setPreferences(defaultPreferences);
    setThemeState(defaultPreferences.theme);
    applyTheme(defaultPreferences.theme);
  }, [applyTheme]);


  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  const value = {
    theme,
    setTheme,
    preferences,
    updatePreferences,
    resetPreferences,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
