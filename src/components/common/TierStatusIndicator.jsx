import React from 'react';
import TierBadge from './TierBadge';
import { userTierManager } from '../../config/userTiers';
import { ArrowRight, Star, Zap } from 'lucide-react';

const TierStatusIndicator = ({ showUpgradePrompt = true, onUpgrade = null }) => {
  const currentTier = userTierManager.getCurrentTier();
  const tierInfo = userTierManager.getTierDisplayInfo();

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade action - set to PRO tier
      userTierManager.upgradeToPRO();
      window.location.reload(); // Refresh to update UI
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <TierBadge tier={currentTier.name} size="md" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {currentTier.displayName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentTier.price}
            </p>
          </div>
        </div>
        
        {showUpgradePrompt && currentTier.name === 'Advanced' && (
          <button
            onClick={handleUpgradeClick}
            className="flex items-center space-x-1 px-3 py-2 pro-gradient-primary text-white text-xs font-medium rounded-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Zap className="w-3 h-3" />
            <span>Upgrade to PRO</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {/* Feature summary */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>
              {currentTier.name === 'PRO' 
                ? 'Full access to all subjects, file uploads, and advanced features'
                : 'General chat mode with unlimited messaging'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierStatusIndicator;
