import React, { useState } from 'react';
import PartyCelebration from './PartyCelebration';
import usePartyCelebration from '../../hooks/usePartyCelebration';

const PartyCelebrationDemo = () => {
  const [intensity, setIntensity] = useState('moderate');
  const [duration, setDuration] = useState(4000);
  
  const partyCelebration = usePartyCelebration({ 
    intensity, 
    duration,
    cooldownPeriod: 3000 // Shorter cooldown for demo
  });

  const handleStartCelebration = () => {
    const started = partyCelebration.startCelebration();
    if (!started) {
      console.log('Could not start celebration - either on cooldown or already active');
    }
  };

  const handleForceStart = () => {
    partyCelebration.forceStartCelebration();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Magic Chat Party Celebration
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Experience the magical entrance animation for Magic Chat!
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Animation Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intensity Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intensity Level
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="subtle">Subtle (30 particles)</option>
                <option value="moderate">Moderate (60 particles)</option>
                <option value="festive">Festive (100 particles)</option>
              </select>
            </div>

            {/* Duration Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (milliseconds)
              </label>
              <input
                type="range"
                min="2000"
                max="8000"
                step="500"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {duration}ms ({(duration / 1000).toFixed(1)}s)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={handleStartCelebration}
              disabled={partyCelebration.isActive}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                partyCelebration.isActive
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'pro-gradient-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {partyCelebration.isActive ? 'Celebration Active...' : '🎉 Start Celebration'}
            </button>

            <button
              onClick={handleForceStart}
              className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Force Start (Ignore Cooldown)
            </button>

            <button
              onClick={partyCelebration.stopCelebration}
              disabled={!partyCelebration.isActive}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !partyCelebration.isActive
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ⏹️ Stop Celebration
            </button>
          </div>

          {/* Status */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${partyCelebration.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Animation: {partyCelebration.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${partyCelebration.isOnCooldown ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Cooldown: {partyCelebration.isOnCooldown ? 'Active' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🎯 How It Works
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>Physics:</strong> Particles launch from both sides at 45-80° angles, rise up, then fall with gravity
            </div>
            <div>
              <strong>Spawn Areas:</strong> Small concentrated areas at upper left and right corners
            </div>
            <div>
              <strong>Particle Types:</strong> Confetti, stars, bubbles, and books with educational themes
            </div>
            <div>
              <strong>Size Animation:</strong> Particles grow slightly then shrink as they fall
            </div>
            <div>
              <strong>Fade Effect:</strong> Opacity reduces to zero as particles reach the bottom
            </div>
            <div>
              <strong>Performance:</strong> Optimized with disposal of resources and frame rate management
            </div>
          </div>
        </div>

        {/* Simulated Magic Chat Button */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Simulated Magic Chat Entry
            </h3>
            <button
              onClick={handleStartCelebration}
              className="inline-flex items-center space-x-2 px-8 py-4 pro-gradient-primary text-white rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>✨</span>
              <span>Enter Magic Discussion</span>
              <span>🎭</span>
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Click to trigger the celebration animation
            </p>
          </div>
        </div>
      </div>

      {/* The actual celebration component */}
      <PartyCelebration {...partyCelebration.celebrationProps} />
    </div>
  );
};

export default PartyCelebrationDemo;
