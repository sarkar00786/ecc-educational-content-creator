/**
 * Advanced Notification Preferences Component
 * 
 * Provides comprehensive control over notification behavior including:
 * - Do Not Disturb modes and quiet hours
 * - Celebration level preferences
 * - Notification type filtering
 * - Accessibility settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  notificationService, 
  DND_MODES, 
  CELEBRATION_LEVELS,
  NOTIFICATION_TYPES 
} from '../../services/notificationService';

const NotificationPreferences = ({
  isOpen,
  onClose,
  onSave,
  className = ''
}) => {
  const [preferences, setPreferences] = useState({
    soundEnabled: false,
    autoDismiss: true,
    maxNotifications: 5,
    enabledTypes: {
      success: true,
      error: true,
      warning: true,
      info: true,
      achievement: true
    },
    celebrationLevel: CELEBRATION_LEVELS.ACHIEVEMENT,
    reducedMotion: false
  });

  const [dndMode, setDndMode] = useState(DND_MODES.OFF);
  const [quietHours, setQuietHours] = useState({ start: '22:00', end: '08:00' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load current preferences on mount
  useEffect(() => {
    if (isOpen) {
      const currentPrefs = notificationService.preferences;
      setPreferences(currentPrefs);
      setDndMode(notificationService.dndMode);
      setQuietHours(notificationService.quietHours);
      setHasUnsavedChanges(false);
    }
  }, [isOpen]);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [preferences, dndMode, quietHours]);

  // Handle preference changes
  const handlePreferenceChange = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle enabled types changes
  const handleEnabledTypeChange = useCallback((type, enabled) => {
    setPreferences(prev => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [type]: enabled
      }
    }));
  }, []);

  // Handle quiet hours changes
  const handleQuietHoursChange = useCallback((field, value) => {
    setQuietHours(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Save preferences
  const handleSave = useCallback(() => {
    // Update notification service
    notificationService.updatePreferences(preferences);
    notificationService.setDndMode(dndMode);
    notificationService.setQuietHours(quietHours.start, quietHours.end);

    // Save to persistent storage
    const settingsToSave = {
      preferences,
      dndMode,
      quietHours
    };

    localStorage.setItem('ecc_notification_settings', JSON.stringify(settingsToSave));
    
    setHasUnsavedChanges(false);
    
    if (onSave) {
      onSave(settingsToSave);
    }
    
    onClose();
  }, [preferences, dndMode, quietHours, onSave, onClose]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    const defaultPrefs = {
      soundEnabled: false,
      autoDismiss: true,
      maxNotifications: 5,
      enabledTypes: {
        success: true,
        error: true,
        warning: true,
        info: true,
        achievement: true
      },
      celebrationLevel: CELEBRATION_LEVELS.ACHIEVEMENT,
      reducedMotion: false
    };

    setPreferences(defaultPrefs);
    setDndMode(DND_MODES.OFF);
    setQuietHours({ start: '22:00', end: '08:00' });
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        if (hasUnsavedChanges) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, hasUnsavedChanges, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🔔</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notification Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* General Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  General Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Sound Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sound Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Play sound for new notifications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* Auto-dismiss */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-dismiss Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically hide notifications after a delay
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.autoDismiss}
                      onChange={(e) => handlePreferenceChange('autoDismiss', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* Max Notifications */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Maximum Simultaneous Notifications: {preferences.maxNotifications}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={preferences.maxNotifications}
                      onChange={(e) => handlePreferenceChange('maxNotifications', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>1</span>
                      <span>10</span>
                    </div>
                  </div>

                  {/* Celebration Level */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Celebration Level
                    </label>
                    <select
                      value={preferences.celebrationLevel}
                      onChange={(e) => handlePreferenceChange('celebrationLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                    >
                      <option value={CELEBRATION_LEVELS.SUBTLE}>Subtle - Minimal animations</option>
                      <option value={CELEBRATION_LEVELS.PROGRESS}>Progress - Fill animations</option>
                      <option value={CELEBRATION_LEVELS.ACHIEVEMENT}>Achievement - Sparkles & glow</option>
                      <option value={CELEBRATION_LEVELS.MILESTONE}>Milestone - Full celebrations</option>
                    </select>
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reduced Motion
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Disable decorative animations
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.reducedMotion}
                      onChange={(e) => handlePreferenceChange('reducedMotion', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Types
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'success', label: 'Success Messages', icon: '✅', description: 'Completion confirmations' },
                    { key: 'error', label: 'Error Messages', icon: '❌', description: 'System errors and failures' },
                    { key: 'warning', label: 'Warning Messages', icon: '⚠️', description: 'Important alerts' },
                    { key: 'info', label: 'Information Messages', icon: 'ℹ️', description: 'General information' },
                    { key: 'achievement', label: 'Achievement Messages', icon: '🏆', description: 'Celebrations and milestones' }
                  ].map(type => (
                    <div key={type.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{type.icon}</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {type.label}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {type.description}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.enabledTypes[type.key]}
                        onChange={(e) => handleEnabledTypeChange(type.key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Do Not Disturb Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Do Not Disturb
                </h3>
                
                <div className="space-y-4">
                  {/* DND Mode */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Mode
                    </label>
                    <div className="space-y-2">
                      {[
                        { 
                          value: DND_MODES.OFF, 
                          label: 'Off', 
                          description: 'Show all notifications' 
                        },
                        { 
                          value: DND_MODES.QUIET_HOURS, 
                          label: 'Quiet Hours', 
                          description: 'Respect quiet hours schedule' 
                        },
                        { 
                          value: DND_MODES.FOCUS_MODE, 
                          label: 'Focus Mode', 
                          description: 'Only critical and high priority' 
                        },
                        { 
                          value: DND_MODES.CRITICAL_ONLY, 
                          label: 'Critical Only', 
                          description: 'Only system-critical notifications' 
                        }
                      ].map(mode => (
                        <label key={mode.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="dndMode"
                            value={mode.value}
                            checked={dndMode === mode.value}
                            onChange={(e) => setDndMode(e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {mode.label}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {mode.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Quiet Hours
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      During quiet hours, only critical notifications will be shown
                    </p>
                  </div>

                  {/* Current Status */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        dndMode === DND_MODES.OFF ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {dndMode === DND_MODES.OFF ? 'Notifications Active' : `Do Not Disturb: ${dndMode.replace('_', ' ')}`}
                      </span>
                    </div>
                    {dndMode === DND_MODES.QUIET_HOURS && (
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Quiet hours: {quietHours.start} - {quietHours.end}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Test Notifications
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'success', label: 'Success', icon: '✅' },
                    { type: 'error', label: 'Error', icon: '❌' },
                    { type: 'warning', label: 'Warning', icon: '⚠️' },
                    { type: 'achievement', label: 'Achievement', icon: '🏆' }
                  ].map(test => (
                    <button
                      key={test.type}
                      onClick={() => {
                        // Create test notification
                        const testNotification = {
                          type: test.type,
                          message: `This is a test ${test.type} notification`,
                          title: `Test ${test.label}`,
                          category: 'system',
                          context: 'global'
                        };
                        notificationService.processNotification(testNotification);
                      }}
                      className="flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      <span>{test.icon}</span>
                      <span>{test.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Reset to Defaults
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasUnsavedChanges}
            >
              {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default NotificationPreferences;
