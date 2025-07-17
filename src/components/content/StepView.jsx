import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import ValidatedInput from '../common/ValidatedInput';
import FileUploadZone from '../common/FileUploadZone';
import RichTextEditor from './RichTextEditor';
import { validateStep } from '../../utils/validation';
import { aiPersonasConfig } from '../../utils/aiPersonas';
import { isPROUser, getRestrictionReason, shouldShowUpgradePrompts } from '../../config/userTiers';

const StepView = forwardRef(({ 
  currentStep, 
  formData, 
  onFormDataChange, 
  onGenerate, 
  onGenerateQuiz,
  onValidationChange,
  showValidationErrors = false, // New prop to control when to show validation errors
  generateButtonRef, // New prop for the generate button ref
  selectedPersona, // AI Persona prop
  isProUser // PRO user status prop
}, ref) => {
  const [validationErrors, setValidationErrors] = useState({});
  // Suppress unused variable warning - validationErrors is used for future expansion
  console.log('Current validation errors:', validationErrors);
  const [isStepValid, setIsStepValid] = useState(true);
  const bookContentRef = useRef(null);
  
  // Custom preset state
  const [customPresets, setCustomPresets] = useState([]);
  const [showCustomPresetModal, setShowCustomPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Load custom presets from localStorage on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('customAudiencePresets');
    if (savedPresets) {
      try {
        setCustomPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Error loading custom presets:', error);
      }
    }
  }, []);
  
  // Save custom presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customAudiencePresets', JSON.stringify(customPresets));
  }, [customPresets]);
  
  // Custom preset functions
  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    
    const newPreset = {
      id: Date.now(),
      name: newPresetName.trim(),
      audienceClass: formData.audienceClass || '',
      audienceAge: formData.audienceAge || '',
      audienceRegion: formData.audienceRegion || ''
    };
    
    setCustomPresets(prev => [...prev, newPreset]);
    setNewPresetName('');
    setShowCustomPresetModal(false);
  };
  
  const loadCustomPreset = (preset) => {
    handleFieldChange('audienceClass', preset.audienceClass);
    handleFieldChange('audienceAge', preset.audienceAge);
    handleFieldChange('audienceRegion', preset.audienceRegion);
  };
  
  const deleteCustomPreset = (presetId) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId));
    setShowDeleteConfirm(null);
  };

  // Expose scroll methods to parent via ref
  useImperativeHandle(ref, () => ({
    scrollBookContentDown: () => {
      if (currentStep === 1 && bookContentRef.current) {
        const element = bookContentRef.current.querySelector('textarea');
        if (element) {
          element.scrollTop += 200;
        }
      } else {
        // Fallback: scroll the main content area
        const mainContent = document.querySelector('.flex-1.overflow-y-auto');
        if (mainContent) {
          mainContent.scrollBy({ top: 200, behavior: 'smooth' });
        } else {
          // Final fallback: scroll window
          window.scrollBy({ top: 200, behavior: 'smooth' });
        }
      }
    },
    scrollBookContentUp: () => {
      if (currentStep === 1 && bookContentRef.current) {
        const element = bookContentRef.current.querySelector('textarea');
        if (element) {
          element.scrollTop -= 200;
        }
      } else {
        // Fallback: scroll the main content area
        const mainContent = document.querySelector('.flex-1.overflow-y-auto');
        if (mainContent) {
          mainContent.scrollBy({ top: -200, behavior: 'smooth' });
        } else {
          // Final fallback: scroll window
          window.scrollBy({ top: -200, behavior: 'smooth' });
        }
      }
    }
  }), [currentStep]);

  // Memoize form data to prevent unnecessary re-renders
  const memoizedFormData = useMemo(() => formData, [formData]);

  // Prevent infinite loops by using a ref to track previous values
  const previousValidationRef = useRef({ errors: {}, isValid: true });
  
  // Validate current step whenever form data changes
  useEffect(() => {
    const stepValidation = validateStep(currentStep, memoizedFormData);
    const errorsChanged = JSON.stringify(previousValidationRef.current.errors) !== JSON.stringify(stepValidation.errors);
    const validityChanged = previousValidationRef.current.isValid !== stepValidation.isValid;
    
    if (errorsChanged || validityChanged) {
      setValidationErrors(stepValidation.errors);
      setIsStepValid(stepValidation.isValid);
      
      // Update ref with current values
      previousValidationRef.current = {
        errors: stepValidation.errors,
        isValid: stepValidation.isValid
      };
      
      // Only notify parent if there's an actual change
      if (onValidationChange) {
        onValidationChange(currentStep, stepValidation.isValid, stepValidation.errors);
      }
    }
  }, [currentStep, memoizedFormData, onValidationChange]);

  const handleFieldChange = (fieldName, value) => {
    onFormDataChange(fieldName, value);
  };

  const renderValidationSummary = () => {
    // Keep validation logic but don't render the warning box
    // Validation errors are still tracked and used for button states
    return null;
  };

  switch (currentStep) {
    case 1:
      return (
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📚 Step 1: Input Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              📄 Provide the source material that will be transformed into educational content
            </p>
          </div>
          
          {renderValidationSummary()}
          
          <div className="space-y-6">
            <div ref={bookContentRef}>
              <RichTextEditor
                content={formData.bookContent || ''}
                onContentChange={(value) => {
                  if (['Accounting & Finance', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'History', 'Literature'].includes(value)) {
                    handleFieldChange('subject', value);
                  } else {
                    handleFieldChange('bookContent', value);
                  }
                }}
              />
            </div>
            
            <FileUploadZone 
              onFileChange={(file) => onFormDataChange('fileUploadData', file)}
              acceptedTypes=".txt,.pdf,.doc,.docx"
            />
          </div>
        </div>
      );
      
    case 2:
      return (
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              👨‍👩‍👧‍👦 Step 2: Define Audience
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              🌈 Specify your target audience to tailor the content appropriately
            </p>
          </div>
          
          {renderValidationSummary()}
          
          <div className="space-y-6">
            {/* Audience Presets */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Audience Presets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('audienceClass', 'Elementary School (K-5)');
                    handleFieldChange('audienceAge', '5-11 years');
                    handleFieldChange('audienceRegion', 'United States');
                  }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">🎒</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">Elementary School</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">K-5 • Ages 5-11 • US</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('audienceClass', 'Middle School (6-8)');
                    handleFieldChange('audienceAge', '11-14 years');
                    handleFieldChange('audienceRegion', 'United States');
                  }}
                  className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">📚</span>
                    <span className="font-medium text-green-900 dark:text-green-200">Middle School</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">6-8 • Ages 11-14 • US</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('audienceClass', 'High School (9-12)');
                    handleFieldChange('audienceAge', '14-18 years');
                    handleFieldChange('audienceRegion', 'United States');
                  }}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">🎓</span>
                    <span className="font-medium text-purple-900 dark:text-purple-200">High School</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">9-12 • Ages 14-18 • US</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('audienceClass', 'University Level');
                    handleFieldChange('audienceAge', '18-25 years');
                    handleFieldChange('audienceRegion', 'Global English');
                  }}
                  className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">🏛️</span>
                    <span className="font-medium text-orange-900 dark:text-orange-200">University</span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">College • Ages 18-25 • Global</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('audienceClass', 'Adult Education');
                    handleFieldChange('audienceAge', '25+ years');
                    handleFieldChange('audienceRegion', 'Global English');
                  }}
                  className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">👩‍💼</span>
                    <span className="font-medium text-indigo-900 dark:text-indigo-200">Adult Learning</span>
                  </div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">Professional • Ages 25+ • Global</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleFieldChange('audienceClass', 'Professional Training');
                    handleFieldChange('audienceAge', '25-55 years');
                    handleFieldChange('audienceRegion', 'Global English');
                  }}
                  className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors text-left"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">💼</span>
                    <span className="font-medium text-teal-900 dark:text-teal-200">Professional</span>
                  </div>
                  <p className="text-sm text-teal-700 dark:text-teal-300">Training • Ages 25-55 • Global</p>
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Preset Selection</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Click a preset to auto-fill all audience fields, or customize them manually below.
                </p>
              </div>
            </div>
            
            {/* Custom Presets Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Presets</h3>
                <button
                  type="button"
                  onClick={() => setShowCustomPresetModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Preset</span>
                </button>
              </div>
              
              {customPresets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customPresets.map((preset) => (
                    <div key={preset.id} className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{preset.name}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => loadCustomPreset(preset)}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(preset.id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>{preset.audienceClass} • {preset.audienceAge}</p>
                        <p className="text-xs">{preset.audienceRegion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No custom presets yet. Create your first preset to save your audience settings for future use.
                  </p>
                </div>
              )}
            </div>
            
            {/* Custom Preset Modal */}
            {showCustomPresetModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Custom Preset</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preset Name
                    </label>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., My High School Class"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Settings:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Class:</strong> {formData.audienceClass || 'Not set'}</p>
                      <p><strong>Age:</strong> {formData.audienceAge || 'Not set'}</p>
                      <p><strong>Region:</strong> {formData.audienceRegion || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomPresetModal(false);
                        setNewPresetName('');
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveCustomPreset}
                      disabled={!newPresetName.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save Preset
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Preset</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this custom preset? This action cannot be undone.
                  </p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomPreset(showDeleteConfirm)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Original Form Fields */}
            <ValidatedInput
              fieldName="audienceClass"
              label="Audience Class/Grade Level"
              value={formData.audienceClass || ''}
              onChange={(value) => handleFieldChange('audienceClass', value)}
              placeholder="e.g., Grade 5, High School, University Level, Adult Education"
              required={true}
              helpText="Educational level or grade of your target audience"
              showValidationErrors={showValidationErrors}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            
            <ValidatedInput
              fieldName="audienceAge"
              label="Audience Age Range"
              value={formData.audienceAge || ''}
              onChange={(value) => handleFieldChange('audienceAge', value)}
              placeholder="e.g., 10-12 years, 16-18 years, Adults"
              required={true}
              helpText="Age range determines language complexity and examples"
              showValidationErrors={showValidationErrors}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            
            <ValidatedInput
              fieldName="audienceRegion"
              label="Audience Region/Cultural Context"
              value={formData.audienceRegion || ''}
              onChange={(value) => handleFieldChange('audienceRegion', value)}
              placeholder="e.g., United States, United Kingdom, Global English"
              required={true}
              helpText="Regional context for relevant examples and cultural references"
              showValidationErrors={showValidationErrors}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200">Pro Tip</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                    Be specific with audience details. The more precise your audience definition, the better the AI can tailor the content's complexity, examples, and tone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 3:
      return (
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🚀 Step 3: Customize Output
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              🎨 Fine-tune the generated content to meet your specific requirements
            </p>
          </div>
          
          {renderValidationSummary()}
          
          <div className="space-y-6">
            <ValidatedInput
              fieldName="outputWordCount"
              label="Target Word Count (Optional)"
              type="number"
              value={formData.outputWordCount || ''}
              onChange={(value) => handleFieldChange('outputWordCount', value)}
              placeholder="e.g., 500"
              helpText="Approximate word count (50-5000 words)"
              showValidationErrors={showValidationErrors}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            
            <ValidatedInput
              fieldName="customInstructions"
              label="Custom Instructions (Optional)"
              type="textarea"
              value={formData.customInstructions || ''}
              onChange={(value) => handleFieldChange('customInstructions', value)}
              placeholder="Add specific instructions for content generation, such as:\n• Include practical examples\n• Focus on key concepts\n• Use simple language\n• Include interactive elements"
              rows={6}
              showCharCount={true}
              helpText="Additional guidance for content generation (up to 2000 characters)"
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            
            {/* AI Persona Guidance */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">AI Persona Guidance</h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">Content tone and style influence</p>
                </div>
                {isProUser && (
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">PRO</span>
                )}
              </div>
              
              {isProUser ? (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Active Persona: {aiPersonasConfig.find(p => p.id === selectedPersona)?.name || 'Educator'}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {aiPersonasConfig.find(p => p.id === selectedPersona)?.description || 'Structured, comprehensive, example-rich.'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3">
                    <p className="text-sm text-indigo-800 dark:text-indigo-300">
                      ✨ This persona will influence how your content is generated, affecting the tone, style, and approach used in the educational material.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Unlock AI Personas to customize the tone and style of your generated content. Choose from various teaching personas to match your educational approach.
                  </p>
                  <button className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Upgrade to PRO
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Good Instructions</h4>
                <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                  <li>• Include real-world examples</li>
                  <li>• Use bullet points for key concepts</li>
                  <li>• Add discussion questions</li>
                  <li>• Focus on practical applications</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-2">Avoid</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                  <li>• Overly complex language</li>
                  <li>• Too many restrictions</li>
                  <li>• Contradictory requirements</li>
                  <li>• Vague instructions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 4:
      return (
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ✨ Step 4: Generate Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              🎯 Review your settings and generate your educational content
            </p>
          </div>
          
          {/* Summary of inputs */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Audience:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData.audienceClass} • {formData.audienceAge} • {formData.audienceRegion}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Content Length:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData.bookContent?.length || 0} characters
                  {formData.outputWordCount && ` • Target: ${formData.outputWordCount} words`}
                </p>
              </div>
            </div>
            {formData.customInstructions && (
              <div className="mt-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">Custom Instructions:</span>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {formData.customInstructions}
                </p>
              </div>
            )}
          </div>
          
          {renderValidationSummary()}
          
          <div className="space-y-4">
            <button
              ref={generateButtonRef}
              onClick={onGenerate}
              disabled={!isStepValid}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Educational Content</span>
            </button>
            
              {/* Enhanced Quiz Generation Section */}
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/40 dark:to-orange-900/40 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-violet-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">Interactive Quiz Generator</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Premium Feature • Create engaging assessments</p>
                </div>
                <div className="ml-auto">
                  <span className="pro-gradient-primary text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">PRO</span>
                </div>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
                Generate interactive quizzes with multiple-choice questions, instant feedback, and detailed explanations based on your content.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="flex items-center text-purple-700 dark:text-purple-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5-10 Questions
                </div>
                <div className="flex items-center text-purple-700 dark:text-purple-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multiple Choice
                </div>
                <div className="flex items-center text-purple-700 dark:text-purple-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant Feedback
                </div>
                <div className="flex items-center text-purple-700 dark:text-purple-300">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Smart Difficulty
                </div>
              </div>
              {isPROUser() ? (
                <button
                  onClick={onGenerateQuiz}
                  disabled={!isStepValid}
                  className="w-full px-6 py-4 pro-gradient-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate Interactive Quiz</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    disabled={true}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg cursor-not-allowed opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Generate Interactive Quiz</span>
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {getRestrictionReason('quiz_generation')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {!isStepValid && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please complete all required fields in the previous steps to enable content generation.
              </p>
            </div>
          )}
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200">What happens next?</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Your content will be processed through our AI system, which analyzes your source material and creates engaging, audience-appropriate educational content. This typically takes 10-30 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return null;
  }
});

StepView.displayName = 'StepView';
export default StepView;
