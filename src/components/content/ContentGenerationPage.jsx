import React, { useState, useEffect, useCallback, forwardRef, useRef, useImperativeHandle, useMemo, useReducer } from 'react';
import StepSidebar from './StepSidebar';
import StepView from './StepView';
import GeneratedContentDisplay from './GeneratedContentDisplay';
import SubjectPrompting from '../common/SubjectPrompting';
import CelebrationAnimation from '../common/CelebrationAnimation';
import { validateStep, canNavigateToNextStep } from '../../utils/validation';
import ButtonFireworks from '../common/ButtonFireworks';
import { subjectPromptsConfig } from '../../utils/subjectPrompts';
import { aiPersonasConfig } from '../../utils/aiPersonas';
import { isPROUser } from '../../config/userTiers';

// Consolidated state using useReducer for better performance
const initialState = {
  currentStep: 1,
  formData: {
    bookContent: '',
    subject: '',
    audienceClass: '',
    audienceAge: '',
    audienceRegion: '',
    outputWordCount: '',
    customInstructions: '',
    fileUploadData: null
  },
  stepValidationStates: {
    1: { isValid: false, errors: {} },
    2: { isValid: false, errors: {} },
    3: { isValid: false, errors: {} },
    4: { isValid: false, errors: {} }
  },
  generationState: {
    isGenerating: false,
    generationStage: 'idle',
    showGeneratedContent: false,
    showGenerateCelebration: false
  },
  uiState: {
    isMobile: window.innerWidth < 1024
  }
};

const stateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value }
      };
    case 'SET_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'UPDATE_VALIDATION_STATE':
      return {
        ...state,
        stepValidationStates: {
          ...state.stepValidationStates,
          [action.step]: { isValid: action.isValid, errors: action.errors }
        }
      };
    case 'SET_GENERATION_STATE':
      return {
        ...state,
        generationState: { ...state.generationState, ...action.payload }
      };
    case 'SET_UI_STATE':
      return {
        ...state,
        uiState: { ...state.uiState, ...action.payload }
      };
    case 'RESET_GENERATION':
      return {
        ...state,
        generationState: {
          isGenerating: false,
          generationStage: 'idle',
          showGeneratedContent: false,
          showGenerateCelebration: false
        }
      };
    default:
      return state;
  }
};

const ContentGenerationPage = forwardRef(({ user, onSuccess, onError, generatedContent, setGeneratedContent, selectedSubject, setSelectedSubject, bookContent, setBookContent, selectedPersona, callGeminiAPI, isProUser }, ref) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const stepViewRef = useRef(null);
  const generatedContentRef = useRef(null);
  const generateButtonRef = useRef(null);

  // Destructure state for easier access
  const { currentStep, formData, stepValidationStates, generationState, uiState } = state;
  const { isGenerating, generationStage, showGeneratedContent, showGenerateCelebration } = generationState;
  const { isMobile } = uiState;

  // Expose scroll methods to parent via ref
  useImperativeHandle(ref, () => ({
    scrollBookContentDown: () => {
      if (stepViewRef.current) {
        stepViewRef.current.scrollBookContentDown();
      }
    },
    scrollBookContentUp: () => {
      if (stepViewRef.current) {
        stepViewRef.current.scrollBookContentUp();
      }
    },
    scrollGeneratedContentDown: () => {
      if (generatedContentRef.current) {
        generatedContentRef.current.scrollDown();
      }
    },
    scrollGeneratedContentUp: () => {
      if (generatedContentRef.current) {
        generatedContentRef.current.scrollUp();
      }
    }
  }), []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      dispatch({ type: 'SET_UI_STATE', payload: { isMobile: window.innerWidth < 1024 } });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show generated content if it exists
  useEffect(() => {
    if (generatedContent) {
      dispatch({ type: 'SET_GENERATION_STATE', payload: { showGeneratedContent: true } });
    }
  }, [generatedContent]);

  // Sync bookContent from App.jsx with local formData
  useEffect(() => {
    if (bookContent) {
      dispatch({ type: 'UPDATE_FORM_DATA', field: 'bookContent', value: bookContent });
    }
  }, [bookContent]);

  // Sync selectedSubject from App.jsx with local formData
  useEffect(() => {
    if (selectedSubject) {
      dispatch({ type: 'UPDATE_FORM_DATA', field: 'subject', value: selectedSubject });
    }
  }, [selectedSubject]);

  // Memoized handlers
  const handleStepChange = useCallback((step) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep < 4) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
    }
  }, [currentStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep - 1 });
    }
  }, [currentStep]);

  const handleFormDataChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FORM_DATA', field, value });
  }, []);

  const handleValidationChange = useCallback((step, isValid, errors) => {
    dispatch({ type: 'UPDATE_VALIDATION_STATE', step, isValid, errors });
    
    // Check if we've reached step 4 and all previous steps are valid
    if (step === 4 && isValid && 
        stepValidationStates[1]?.isValid && 
        stepValidationStates[2]?.isValid && 
        stepValidationStates[3]?.isValid) {
      dispatch({ type: 'SET_GENERATION_STATE', payload: { showGenerateCelebration: true } });
    }
  }, [stepValidationStates]);

  const handleGenerate = useCallback(async () => {
    dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: true, generationStage: 'analyzing' } });
    
    try {
      // Check if user has provided content either through textarea or file upload
      const hasBookContent = formData.bookContent && formData.bookContent.trim() !== '';
      const hasFileUpload = formData.fileUploadData !== null;
      
      if (!hasBookContent && !hasFileUpload) {
        dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, generationStage: 'idle' } });
        onError('Please provide content either by typing in the text editor or uploading a file.');
        return;
      }
      
      // Final validation before generation
      const finalValidation = validateStep(4, formData);
      if (!finalValidation.isValid) {
        dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, generationStage: 'idle' } });
        onError('Please complete all required fields before generating content.');
        return;
      }

      // Simulate progress if no backend updates
      dispatch({ type: 'SET_GENERATION_STATE', payload: { generationStage: 'crafting' } });

      // Create comprehensive payload for multi-step LLM orchestration
      const payload = {
        bookContent: formData.bookContent,
        audienceClass: formData.audienceClass,
        audienceAge: formData.audienceAge,
        audienceRegion: formData.audienceRegion,
        outputWordCount: formData.outputWordCount,
        customInstructions: formData.customInstructions,
        selectedSubject: formData.subject,
        selectedPersona: selectedPersona,
        requestType: 'generateContent'
      };

      // Call the centralized LLM API function
      const generatedContent = await callGeminiAPI(payload);

      dispatch({ type: 'SET_GENERATION_STATE', payload: { generationStage: 'finalizing' } });
      setGeneratedContent(generatedContent);
      dispatch({ type: 'SET_GENERATION_STATE', payload: { showGeneratedContent: true, showGenerateCelebration: true } });
      onSuccess(generatedContent, formData);
    } catch (error) {
      onError(error.message);
    } finally {
      dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, generationStage: 'idle' } });
    }
  }, [formData, selectedPersona, callGeminiAPI, onError, onSuccess, setGeneratedContent]);

  const handleGenerateQuiz = useCallback(async () => {
    try {
      // Check if user has PRO access for quiz generation
      if (!isPROUser()) {
        onError('Quiz generation is a PRO feature. Upgrade to create interactive assessments!');
        return;
      }

      // Validate inputs for quiz
      if (!formData.bookContent || !formData.audienceClass) {
        onError('Please fill in all necessary fields for quiz generation (Book Content, Audience Class)');
        return;
      }

      // Create comprehensive payload for revolutionary quiz generation
      const payload = {
        bookContent: formData.bookContent,
        audienceClass: formData.audienceClass,
        audienceAge: formData.audienceAge,
        audienceRegion: formData.audienceRegion,
        selectedSubject: formData.subject,
        selectedPersona: selectedPersona, // Include persona for quiz generation
        requestType: 'generateQuiz'
      };

      // Call the new multi-step quiz generation API
      const result = await callGeminiAPI(payload);
      onSuccess(result, { ...formData, contentType: 'quiz' });
    } catch (error) {
      onError(error.message);
    }
  }, [formData, selectedPersona, callGeminiAPI, onError, onSuccess]);

  const handleBackFromGenerated = useCallback(() => {
    dispatch({ type: 'SET_GENERATION_STATE', payload: { showGeneratedContent: false } });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 }); // Reset to first step
  }, []);

  const handleSaveContent = async (editedContent) => {
    try {
      // Here you would typically save to Firestore
      // For now, just update the local state
      setGeneratedContent(editedContent);
      // Use a separate success handler for save operations
      console.log('Content saved successfully!');
    } catch (error) {
      onError('Failed to save content: ' + error.message);
    }
  };

  const handleCopyContent = () => {
    // This is called after successful copy operation
    console.log('Content copied to clipboard!');
  };

  // Get subject data for PRO benefits
  const getSubjectData = (subject) => {
    switch (subject) {
      case 'Mathematics':
        return {
          benefits: [
            'Better problem-solving skills',
            'Enhanced logical thinking',
            'Improved mathematical confidence',
            'Better exam preparation'
          ]
        };
      case 'Science':
        return {
          benefits: [
            'Enhanced critical thinking',
            'Better scientific reasoning',
            'Improved research skills',
            'Deeper understanding of concepts'
          ]
        };
      case 'Physics':
        return {
          benefits: [
            'Better understanding of natural phenomena',
            'Enhanced analytical thinking',
            'Improved problem-solving abilities',
            'Better exam performance'
          ]
        };
      case 'Chemistry':
        return {
          benefits: [
            'Better understanding of chemical processes',
            'Enhanced laboratory skills',
            'Improved safety awareness',
            'Better exam preparation'
          ]
        };
      case 'History':
        return {
          benefits: [
            'Better understanding of historical context',
            'Enhanced critical thinking',
            'Improved analytical skills',
            'Better exam preparation'
          ]
        };
      case 'Literature':
        return {
          benefits: [
            'Enhanced reading comprehension',
            'Better analytical writing',
            'Improved critical thinking',
            'Deeper understanding of texts'
          ]
        };
      case 'Accounting & Finance':
        return {
          benefits: [
            'Better financial decision-making',
            'Enhanced analytical skills',
            'Improved business understanding',
            'Better career preparation'
          ]
        };
      default:
        return { benefits: [] };
    }
  };

  const steps = [
    { id: 1, title: '📚 Input Content', description: 'Add your source material' },
    { id: 2, title: '👨‍👩‍👧‍👦 Define Audience', description: 'Specify target audience' },
    { id: 3, title: '🚀 Customize Output', description: 'Set preferences' },
    { id: 4, title: '✨ Generate', description: 'Create content' }
  ];

  // Show generated content display
  if (showGeneratedContent && generatedContent) {
    return (
      <GeneratedContentDisplay
        ref={generatedContentRef}
        generatedContent={generatedContent}
        onBack={handleBackFromGenerated}
        onSave={handleSaveContent}
        onCopy={handleCopyContent}
        isFullScreen={isMobile}
        user={user}
        onSuccess={onSuccess}
        onError={onError}
      />
    );
  }

  // Show loading state during generation
  if (isGenerating) {
    return (
      <div className="flex h-full bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Multi-Step Content Generation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Our AI is working through multiple stages to create personalized, neurologically-optimized content for your audience.
          </p>
          
          {/* Multi-step progress indicators */}
<div className="space-y-3 mb-6">
            <div className={"flex items-center space-x-3 text-sm" + (generationStage === 'analyzing' ? ' text-blue-600 dark:text-blue-300' : ' text-gray-500 dark:text-gray-500')}>
              <div className={`w-2 h-2 rounded-full ${generationStage === 'analyzing' ? 'bg-blue-600' : 'bg-gray-300'} animate-pulse`}></div>
              <span>Analyzing Content & Learning Objectives...</span>
            </div>
            <div className={"flex items-center space-x-3 text-sm" + (generationStage === 'crafting' ? ' text-blue-600 dark:text-blue-300' : ' text-gray-500 dark:text-gray-500')}>
              <div className={`w-2 h-2 rounded-full ${generationStage === 'crafting' ? 'bg-blue-600' : 'bg-gray-300'} animate-pulse`}></div>
              <span>Crafting Neurologically-Optimized Content...</span>
            </div>
            <div className={"flex items-center space-x-3 text-sm" + (generationStage === 'finalizing' ? ' text-blue-600 dark:text-blue-300' : ' text-gray-500 dark:text-gray-500')}>
              <div className={`w-2 h-2 rounded-full ${generationStage === 'finalizing' ? 'bg-blue-600' : 'bg-gray-300'} animate-pulse`}></div>
              <span>Finalizing Content and Preparing for Display...</span>
            </div>
          </div>
          
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse transition-all duration-1000" style={{ 
              width: generationStage === 'analyzing' ? '33%' : 
                     generationStage === 'crafting' ? '66%' : 
                     generationStage === 'finalizing' ? '100%' : '10%' 
            }}></div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            This may take 30-60 seconds depending on content complexity
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Celebration Animation for Generate Button Ready */}
      <CelebrationAnimation 
        isVisible={showGenerateCelebration}
        type="generate"
        onComplete={() => dispatch({ type: 'SET_GENERATION_STATE', payload: { showGenerateCelebration: false } })}
      />
      
      {/* ButtonFireworks for Generate Button Success */}
      <ButtonFireworks 
        isActive={showGenerateCelebration}
        buttonRef={generateButtonRef}
      />
      
      <div className="flex h-full bg-gray-50 dark:bg-gray-900">
        {/* Desktop: Left Sidebar */}
        <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 shadow-lg">
          <StepSidebar
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            validationStates={stepValidationStates}
          />
        </div>

      {/* Main Content Area */}
<div className="flex-1 flex flex-col w-full min-w-0">
        {/* Mobile: Step indicator */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Step {currentStep} of 4: {steps[currentStep - 1].title}
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                stepValidationStates[currentStep]?.isValid ? 'bg-green-600' : 'bg-blue-600'
              }`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep}/4
              </span>
            </div>
          </div>
        </div>

        {/* Step Content */}
<div className="flex-1 overflow-y-auto w-full">
<div className="h-full px-6 py-6 w-full">
            <StepView
              ref={stepViewRef}
              currentStep={currentStep}
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onGenerate={handleGenerate}
              onGenerateQuiz={handleGenerateQuiz}
              onValidationChange={handleValidationChange}
              generateButtonRef={generateButtonRef}
              selectedPersona={selectedPersona}
              isProUser={isProUser}
            />
{/* Subject Prompting */}
            {formData.subject && (
              <div className="mt-4">
                <SubjectPrompting subject={formData.subject} />
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Navigation Buttons */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-lg p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!stepValidationStates[4]?.isValid}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Generate
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
    </>
  );
});

ContentGenerationPage.displayName = 'ContentGenerationPage';
export default ContentGenerationPage;
