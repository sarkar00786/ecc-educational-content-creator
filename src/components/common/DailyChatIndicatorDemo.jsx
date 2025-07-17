import React, { useState } from 'react';
import DailyChatBadge from './DailyChatBadge';
import DailyChatRing from './DailyChatRing';
import DailyChatDot from './DailyChatDot';
import DailyChatProgress from './DailyChatProgress';

const DailyChatIndicatorDemo = () => {
  const [dailyChatsUsed, setDailyChatsUsed] = useState(12);
  const maxDailyChats = 25;

  const scenarios = [
    { used: 5, label: 'Low Usage (Green)', description: '5/25 chats - All good!' },
    { used: 12, label: 'Medium Usage (Yellow)', description: '12/25 chats - Moderate usage' },
    { used: 20, label: 'High Usage (Red)', description: '20/25 chats - Critical zone!' },
    { used: 25, label: 'Max Usage (Red)', description: '25/25 chats - Limit reached!' }
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Daily Chat Limit Indicator Options
        </h1>
        
        {/* Live Demo Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Interactive Demo
          </h2>
          
          <div className="flex items-center space-x-4 mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Chats Used:
            </label>
            <input
              type="range"
              min="0"
              max="25"
              value={dailyChatsUsed}
              onChange={(e) => setDailyChatsUsed(parseInt(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-0">
              {dailyChatsUsed}/25
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Badge Style */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Badge Style
              </h3>
              <DailyChatBadge
                dailyChatsUsed={dailyChatsUsed}
                maxDailyChats={maxDailyChats}
                onClick={() => alert('Badge clicked!')}
              />
            </div>
            
            {/* Ring Style */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Ring Style
              </h3>
              <DailyChatRing
                dailyChatsUsed={dailyChatsUsed}
                maxDailyChats={maxDailyChats}
                onClick={() => alert('Ring clicked!')}
              />
            </div>
            
            {/* Dot Style */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Dot Style
              </h3>
              <DailyChatDot
                dailyChatsUsed={dailyChatsUsed}
                maxDailyChats={maxDailyChats}
                onClick={() => alert('Dot clicked!')}
              />
            </div>
            
            {/* Progress Style */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Progress Style
              </h3>
              <DailyChatProgress
                dailyChatsUsed={dailyChatsUsed}
                maxDailyChats={maxDailyChats}
                compact={true}
                onClick={() => alert('Progress clicked!')}
              />
            </div>
          </div>
        </div>
        
        {/* Scenarios Showcase */}
        <div className="space-y-6">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {scenario.label}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {scenario.description}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Badge */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Badge</span>
                  <DailyChatBadge
                    dailyChatsUsed={scenario.used}
                    maxDailyChats={maxDailyChats}
                  />
                </div>
                
                {/* Ring */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ring</span>
                  <DailyChatRing
                    dailyChatsUsed={scenario.used}
                    maxDailyChats={maxDailyChats}
                  />
                </div>
                
                {/* Dot */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Dot</span>
                  <DailyChatDot
                    dailyChatsUsed={scenario.used}
                    maxDailyChats={maxDailyChats}
                  />
                </div>
                
                {/* Progress */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                  <DailyChatProgress
                    dailyChatsUsed={scenario.used}
                    maxDailyChats={maxDailyChats}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Chat Header Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chat Header Preview
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            How these indicators would look in the actual chat header:
          </div>
          
          {/* Simulated Chat Header */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💬</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Physics Discussion
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Physics</p>
                </div>
                
                {/* Different indicator styles */}
                <div className="flex items-center space-x-3">
                  <DailyChatDot
                    dailyChatsUsed={dailyChatsUsed}
                    maxDailyChats={maxDailyChats}
                    showText={false}
                  />
                  <DailyChatProgress
                    dailyChatsUsed={dailyChatsUsed}
                    maxDailyChats={maxDailyChats}
                    compact={true}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                  New Chat
                </button>
                <button className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm">
                  Persona
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-8 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            💡 Recommendations
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Most Subtle:</strong> Dot Style - Minimal visual impact, status-based coloring
            </div>
            <div>
              <strong>Most Informative:</strong> Badge Style - Clear count display with contextual colors
            </div>
            <div>
              <strong>Most Modern:</strong> Ring Style - Circular progress with clean aesthetics
            </div>
            <div>
              <strong>Most Compact:</strong> Progress Style (compact) - Tiny progress bar with count
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChatIndicatorDemo;
