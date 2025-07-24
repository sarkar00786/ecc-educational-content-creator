import React from 'react';
import { 
  FileText,     // Content Input
  Users,        // Audience Setup
  Settings,     // Advanced Settings
  Sparkles      // Generate with sparkle effect
} from 'lucide-react';

const StepSidebar = ({ steps, currentStep, onStepChange, validationStates = {} }) => {
  // Map step IDs to their corresponding icons
  const getStepIcon = (stepId) => {
    const iconMap = {
      1: FileText,    // Content Input - Document/Text icon
      2: Users,       // Audience Setup - Users icon  
      3: Settings,    // Advanced Settings - Settings/Gear icon
      4: Sparkles,    // Generate - Sparkles icon
    };
    return iconMap[stepId] || FileText;
  };

  // Check if ready to generate (all previous steps completed)
  const isReadyToGenerate = (stepId) => {
    if (stepId !== 4) return false;
    const completedSteps = Object.values(validationStates).filter(state => state?.isValid).length;
    return completedSteps >= 3; // Steps 1, 2, 3 must be completed
  };
  return (
    <div className="h-full p-6 border-r border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6">
        Content Generation
      </h2>
      
      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = validationStates[step.id]?.isValid || false;
          const StepIconComponent = getStepIcon(step.id);

          return (
            <div key={step.id} className="relative">
              
              <button
                onClick={() => onStepChange(step.id)}
                className={`flex items-start space-x-3 w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-md' 
                    : isCompleted 
                      ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                }`}
              >
                {/* Step icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-110' 
                    : isCompleted 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-600'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id === 4 ? (
                    <Sparkles 
                      size={16} 
                      className={`text-current ${isReadyToGenerate(step.id) ? 'animate-pulse-sparkle' : ''}`}
                    />
                  ) : (
                    <StepIconComponent size={16} className="text-current" />
                  )}
                </div>
                
                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${
                    isActive 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : isCompleted 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-gray-900 dark:text-white'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    isActive 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : isCompleted 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Progress indicator */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Object.values(validationStates).filter(state => state?.isValid).length}/4 completed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.values(validationStates).filter(state => state?.isValid).length / 4) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Current: Step {currentStep}
        </div>
      </div>
    </div>
  );
};

export default StepSidebar;
