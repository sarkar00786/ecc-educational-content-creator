import React from 'react';
import { AlertTriangle, Clock, ExternalLink, Zap } from 'lucide-react';

const RateLimitNotification = ({ isVisible, onClose, onUpgrade }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-orange-100 dark:bg-orange-900/40 rounded-full p-3">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
          API Rate Limit Reached
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
          You've reached your daily AI usage limit. The free tier allows 50 requests per day.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            What you can do:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Wait until tomorrow for your quota to reset</li>
            <li>• Upgrade to a paid tier for higher limits</li>
            <li>• Use the Content Generation feature (separate quota)</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Benefits:
          </h4>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• Up to 1,000 requests per day (Tier 1)</li>
            <li>• Priority support and faster responses</li>
            <li>• Access to advanced AI features</li>
            <li>• No daily interruptions</li>
          </ul>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Upgrade
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Your quota resets daily at midnight UTC
        </p>
      </div>
    </div>
  );
};

export default RateLimitNotification;
