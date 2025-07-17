import React, { useState, useEffect, useCallback } from 'react';
import { db, getAppId } from '../../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { advancedSettingsManager } from '../../utils/settings';
import { aiPersonasConfig } from '../../utils/aiPersonas';

const AdvancedSettingsPage = ({ user, onBack, userSettings, onUpdateSettings, isProUser }) => {
  const [settings, setSettings] = useState({
    defaultOutputLength: '',
    defaultInstructions: '',
    promptTemplates: [],
    modelSettings: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      topK: 40,
      responseStyle: 'balanced',
      modelVersion: 'gemini-pro'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [localSelectedPersona, setLocalSelectedPersona] = useState(userSettings?.selectedPersona || 'educator');
  
  useEffect(() => {
    setLocalSelectedPersona(userSettings?.selectedPersona || 'educator');
  }, [userSettings?.selectedPersona]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !db) {
        const loadedSettings = advancedSettingsManager.load();
        setSettings(loadedSettings);
        return;
      }
      try {
        const appId = getAppId();
        const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/advanced`);
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          const firestoreSettings = settingsDoc.data();
          setSettings({
            defaultOutputLength: firestoreSettings.defaultOutputLength || '',
            defaultInstructions: firestoreSettings.defaultInstructions || '',
            promptTemplates: firestoreSettings.promptTemplates || [],
            modelSettings: {
              temperature: firestoreSettings.modelSettings?.temperature || 0.7,
              maxTokens: firestoreSettings.modelSettings?.maxTokens || 1000,
              topP: firestoreSettings.modelSettings?.topP || 0.9,
              topK: firestoreSettings.modelSettings?.topK || 40,
              responseStyle: firestoreSettings.modelSettings?.responseStyle || 'balanced',
              modelVersion: firestoreSettings.modelSettings?.modelVersion || 'gemini-pro'
            }
          });
        } else {
          const defaultSettings = advancedSettingsManager.load();
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading advanced settings from Firestore:', error);
        const loadedSettings = advancedSettingsManager.load();
        setSettings(loadedSettings);
      }
    };
    
    loadSettings();
  }, [user]);

  const validateSettings = () => {
    if (settings.defaultOutputLength && (isNaN(settings.defaultOutputLength) || settings.defaultOutputLength < 1 || settings.defaultOutputLength > 10000)) {
      setError('Default output length must be a number between 1 and 10,000');
      return false;
    }
    if (settings.modelSettings.temperature < 0 || settings.modelSettings.temperature > 1) {
      setError('Temperature must be between 0 and 1');
      return false;
    }
    if (settings.modelSettings.maxTokens < 1 || settings.modelSettings.maxTokens > 4000) {
      setError('Max tokens must be between 1 and 4,000');
      return false;
    }
    return true;
  };

  const handleSave = useCallback(async () => {
    if (!validateSettings()) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      if (user && db) {
        const appId = getAppId();
        const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/advanced`);
        await setDoc(settingsRef, {
          ...settings,
          updatedAt: new Date(),
          createdAt: new Date()
        }, { merge: true });
        advancedSettingsManager.save(settings);
        setMessage('Advanced settings saved successfully!');
      } else {
        const success = advancedSettingsManager.save(settings);
        if (success) {
          setMessage('Advanced settings saved successfully!');
        } else {
          setError('Failed to save advanced settings. Please try again.');
        }
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving advanced settings:', err);
      setError('An error occurred while saving advanced settings.');
    } finally {
      setIsLoading(false);
    }
  }, [settings, user, db]);

  const handleReset = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const defaultSettings = advancedSettingsManager.reset();
      setSettings(defaultSettings);
      if (user && db) {
        const appId = getAppId();
        const settingsRef = doc(db, `artifacts/${appId}/users/${user.uid}/settings/advanced`);
        await setDoc(settingsRef, {
          ...defaultSettings,
          updatedAt: new Date(),
          createdAt: new Date()
        }, { merge: true });
      }
      setMessage('Advanced settings reset to default!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('An error occurred while resetting settings.');
    } finally {
      setIsLoading(false);
    }
  }, [user, db]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Settings</h1>
            <button onClick={onBack} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              ← Back
            </button>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Content Generation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Output Word Count</label>
                  <input
                    type="number"
                    value={settings.defaultOutputLength}
                    onChange={(e) => setSettings({...settings, defaultOutputLength: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Custom Instructions</label>
                  <textarea
                    value={settings.defaultInstructions}
                    onChange={(e) => setSettings({...settings, defaultInstructions: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32"
                    placeholder="Enter your default instructions here..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Model Settings</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">About AI Model Parameters</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    These settings control how the AI generates content. Higher temperature creates more creative but less predictable outputs.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Temperature (Creativity Level): <span className="font-bold text-blue-600 dark:text-blue-400">{settings.modelSettings.temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.modelSettings.temperature}
                    onChange={(e) => setSettings({
                      ...settings, 
                      modelSettings: {...settings.modelSettings, temperature: parseFloat(e.target.value)}
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0.0 - Conservative</span>
                    <span>0.5 - Balanced</span>
                    <span>1.0 - Creative</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {settings.modelSettings.temperature <= 0.3 && "Conservative: Predictable, factual responses"}
                    {settings.modelSettings.temperature > 0.3 && settings.modelSettings.temperature <= 0.7 && "Balanced: Mix of creativity and accuracy"}
                    {settings.modelSettings.temperature > 0.7 && "Creative: More varied and creative responses"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Output Tokens: <span className="font-bold text-blue-600 dark:text-blue-400">{settings.modelSettings.maxTokens}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={settings.modelSettings.maxTokens}
                    onChange={(e) => setSettings({
                      ...settings, 
                      modelSettings: {...settings.modelSettings, maxTokens: parseInt(e.target.value)}
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>100 - Short</span>
                    <span>2000 - Medium</span>
                    <span>4000 - Long</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Approximate words: {Math.round(settings.modelSettings.maxTokens * 0.75)} words
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Top-p (Nucleus Sampling): <span className="font-bold text-blue-600 dark:text-blue-400">{settings.modelSettings.topP || 0.9}</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.modelSettings.topP || 0.9}
                    onChange={(e) => setSettings({
                      ...settings, 
                      modelSettings: {...settings.modelSettings, topP: parseFloat(e.target.value)}
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0.1 - Focused</span>
                    <span>0.5 - Moderate</span>
                    <span>1.0 - Diverse</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Controls diversity of word choice. Lower values = more focused responses.
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Top-k (Token Limit): <span className="font-bold text-blue-600 dark:text-blue-400">{settings.modelSettings.topK || 40}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={settings.modelSettings.topK || 40}
                    onChange={(e) => setSettings({
                      ...settings, 
                      modelSettings: {...settings.modelSettings, topK: parseInt(e.target.value)}
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 - Very focused</span>
                    <span>40 - Balanced</span>
                    <span>100 - Very diverse</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Limits vocabulary to top-k most likely tokens. Lower values = more predictable responses.
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Style
                  </label>
                  <select
                    value={settings.modelSettings.responseStyle || 'balanced'}
                    onChange={(e) => setSettings({
                      ...settings, 
                      modelSettings: {...settings.modelSettings, responseStyle: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="concise">Concise - Brief and to the point</option>
                    <option value="balanced">Balanced - Moderate detail level</option>
                    <option value="detailed">Detailed - Comprehensive explanations</option>
                    <option value="creative">Creative - Engaging and imaginative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model Version
                  </label>
                  <select
                    value={settings.modelSettings.modelVersion || 'gemini-pro'}
                    onChange={(e) => setSettings({
                      ...settings, 
                      modelSettings: {...settings.modelSettings, modelVersion: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="gemini-pro">Gemini Pro - Balanced performance</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision - Image understanding</option>
                    <option value="gemini-ultra">Gemini Ultra - Highest quality (when available)</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Choose the AI model version for content generation. Higher tier models may have better quality but slower response times.
                  </div>
                </div>
              </div>
            </div>

            {/* AI Persona Selection Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                AI Persona Selection 
                <span className="ml-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">PRO</span>
              </h3>
              
              {!isProUser && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-sm text-yellow-800 dark:text-yellow-300">
                  Upgrade to PRO to unlock AI Persona customization for tailored content generation!
                </div>
              )}
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isProUser ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {aiPersonasConfig.map(persona => (
                  <label key={persona.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    localSelectedPersona === persona.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                  }`}>
                    <input
                      type="radio"
                      name="aiPersona"
                      value={persona.id}
                      checked={localSelectedPersona === persona.id}
                      onChange={(e) => {
                        setLocalSelectedPersona(e.target.value);
                        // Save immediately
                        if (isProUser && onUpdateSettings) {
                          onUpdateSettings({ selectedPersona: e.target.value });
                        }
                      }}
                      className="form-radio h-5 w-5 text-blue-600 dark:text-blue-400"
                      disabled={!isProUser}
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900 dark:text-white">{persona.name}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{persona.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              {isProUser && (
                <button
                onClick={() => onUpdateSettings({ selectedPersona: localSelectedPersona })}
                  disabled={!isProUser || localSelectedPersona === userSettings?.selectedPersona}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Persona
                </button>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prompt Templates
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Custom prompt templates are coming soon. This feature will allow you to save and reuse 
                  custom prompts for different types of content generation.
                </p>
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
                {isLoading ? 'Saving...' : 'Save Settings'}
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

export default AdvancedSettingsPage;

