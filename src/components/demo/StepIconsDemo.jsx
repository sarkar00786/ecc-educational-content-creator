import React from 'react';
import { DocumentIcon, PersonIcon, SettingsIcon, GenerateIcon, LightningIcon, SparkleIcon } from '../icons/StepIcons';

const StepIconsDemo = () => {
  const steps = [
    {
      id: 'content-input',
      title: 'Content Input',
      description: 'Add educational content',
      icon: DocumentIcon,
      code: 'To',
    },
    {
      id: 'audience-setup',
      title: 'Audience Setup',
      description: 'Define target audience',
      icon: PersonIcon,
      code: 'Ro',
    },
    {
      id: 'advanced-settings',
      title: 'Advanced Settings',
      description: 'Customize generation options',
      icon: SettingsIcon,
      code: 'U0',
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'Create content',
      icon: SparkleIcon,
      code: 'Dl',
    },
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ECC Content Generation Workflow
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Canva-like branding with step-by-step icons
          </p>
        </div>

        {/* Step Icons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Step Number */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="relative group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent size={32} className="icon-pulse" />
                    </div>
                  </div>
                  
                  {/* Code Label */}
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {step.code}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alternative Lightning Icon Example */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Alternative Generate Icon
            </h3>
            <div className="flex justify-center space-x-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                  <GenerateIcon size={32} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Checkmark</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                  <LightningIcon size={32} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Lightning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Colors Reference */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Brand Color Reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Primary Colors</h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Blue (#3B82F6)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Purple (#8B5CF6)</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Gradient Examples</h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Primary Gradient</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 brand-gradient rounded-lg"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Brand Gradient (HSL)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepIconsDemo;
