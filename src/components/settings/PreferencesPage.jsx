import React, { useReducer, useEffect, useCallback } from 'react';
import { auth, db, getAppId } from '../../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { preferencesManager } from '../../utils/settings';
import { useSettings } from '../../contexts/SettingsContext';

const PreferencesPage = ({ user, onBack }) => {
  const { preferences: contextPreferences, updatePreferences, resetPreferences } = useSettings();

  const initialState = {
    preferences: {
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
    },
    isLoading: false,
    message: '',
    error: ''
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_PREFERENCES':
        return { ...state, preferences: action.payload };
      case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
      case 'SET_MESSAGE':
        return { ...state, message: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };

  const [{ preferences, isLoading, message, error }, dispatch] = useReducer(reducer, initialState);

  // Load preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user || !db) {
        const loadedPreferences = contextPreferences || preferencesManager.load();
        dispatch({ type: 'SET_PREFERENCES', payload: loadedPreferences });
        return;
      }

      try {
        const appId = getAppId();
        const prefsRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/preferences`);
        const prefsDoc = await getDoc(prefsRef);

        if (prefsDoc.exists()) {
          const firestorePrefs = prefsDoc.data();
          dispatch({ type: 'SET_PREFERENCES', payload: {
            theme: firestorePrefs.theme || 'light',
            language: firestorePrefs.language || 'en',
            notifications: {
              email: firestorePrefs.notifications?.email ?? true,
              contentGeneration: firestorePrefs.notifications?.contentGeneration ?? true,
              updates: firestorePrefs.notifications?.updates ?? true
            },
            accessibility: {
              fontSize: firestorePrefs.accessibility?.fontSize || 'medium',
              highContrast: firestorePrefs.accessibility?.highContrast ?? false,
              reduceMotion: firestorePrefs.accessibility?.reduceMotion ?? false
            }
          }});
        } else {
          const defaultPreferences = contextPreferences || preferencesManager.load();
          dispatch({ type: 'SET_PREFERENCES', payload: defaultPreferences });
        }
      } catch (error) {
        console.error('Error loading preferences from Firestore:', error);
        const loadedPreferences = contextPreferences || preferencesManager.load();
        dispatch({ type: 'SET_PREFERENCES', payload: loadedPreferences });
      }
    };

    loadPreferences();
  }, [user, contextPreferences]);

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_MESSAGE', payload: '' });
    dispatch({ type: 'SET_ERROR', payload: '' });

    try {
      if (user && db) {
        const appId = getAppId();
        const prefsRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/preferences`);

        await setDoc(prefsRef, {
          ...preferences,
          updatedAt: new Date(),
          createdAt: new Date()
        }, { merge: true });
      }

      updatePreferences(preferences);
      dispatch({ type: 'SET_MESSAGE', payload: 'Preferences saved successfully!' });
      setTimeout(() => dispatch({ type: 'SET_MESSAGE', payload: '' }), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      dispatch({ type: 'SET_ERROR', payload: 'An error occurred while saving preferences.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [preferences, user, db, updatePreferences]);

  const handleReset = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      resetPreferences();
      const defaultPreferences = preferencesManager.load();
      dispatch({ type: 'SET_PREFERENCES', payload: defaultPreferences });

      if (user && db) {
        const appId = getAppId();
        const prefsRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/preferences`);

        await setDoc(prefsRef, {
          ...defaultPreferences,
          updatedAt: new Date(),
          createdAt: new Date()
        }, { merge: true });
      }

      dispatch({ type: 'SET_MESSAGE', payload: 'Preferences reset to default!' });
      setTimeout(() => dispatch({ type: 'SET_MESSAGE', payload: '' }), 3000);
    } catch (err) {
      console.error('Error resetting preferences:', err);
      dispatch({ type: 'SET_ERROR', payload: 'An error occurred while resetting preferences.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, db, resetPreferences]);

  // Memoized change handlers
  const handleThemeChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { ...preferences, theme: e.target.value } });
  }, [preferences]);

  const handleLanguageChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { ...preferences, language: e.target.value } });
  }, [preferences]);

  const handleEmailNotificationChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: {
      ...preferences,
      notifications: { ...preferences.notifications, email: e.target.checked }
    } });
  }, [preferences]);

  const handleContentGenerationChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: {
      ...preferences,
      notifications: { ...preferences.notifications, contentGeneration: e.target.checked }
    } });
  }, [preferences]);

  const handleUpdatesChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: {
      ...preferences,
      notifications: { ...preferences.notifications, updates: e.target.checked }
    } });
  }, [preferences]);

  const handleFontSizeChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: {
      ...preferences,
      accessibility: { ...preferences.accessibility, fontSize: e.target.value }
    } });
  }, [preferences]);

  const handleHighContrastChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: {
      ...preferences,
      accessibility: { ...preferences.accessibility, highContrast: e.target.checked }
    } });
  }, [preferences]);

  const handleReduceMotionChange = useCallback((e) => {
    dispatch({ type: 'SET_PREFERENCES', payload: {
      ...preferences,
      accessibility: { ...preferences.accessibility, reduceMotion: e.target.checked }
    } });
  }, [preferences]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preferences</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={handleThemeChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={handleLanguageChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.email ?? true}
                      onChange={handleEmailNotificationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Content generation alerts</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.contentGeneration ?? true}
                      onChange={handleContentGenerationChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Product updates</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notifications?.updates ?? true}
                      onChange={handleUpdatesChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Accessibility
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size
                  </label>
                  <select
                    value={preferences.accessibility?.fontSize ?? 'medium'}
                    onChange={handleFontSizeChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">High contrast mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility?.highContrast ?? false}
                      onChange={handleHighContrastChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Reduce motion</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility?.reduceMotion ?? false}
                      onChange={handleReduceMotionChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset to Default
              </button>
              <button
                onClick={onBack}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
