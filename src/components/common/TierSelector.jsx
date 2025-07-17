import React, { useState, useEffect } from 'react';
import TierBadge from './TierBadge';
import { userTierManager } from '../../config/userTiers';

const TierSelector = ({ onTierChange }) => {
  const [selectedTier, setSelectedTier] = useState('Advanced');

  // Initialize with current tier from storage
  useEffect(() => {
    const currentTier = userTierManager.getCurrentTier();
    setSelectedTier(currentTier.name);
  }, []);

  const handleTierChange = (newTier) => {
    setSelectedTier(newTier);
    // Update tier in UserTierManager
    const success = userTierManager.setUserTier(newTier);
    if (success) {
      console.log(`Tier successfully changed to: ${newTier}`);
    } else {
      console.error(`Failed to change tier to: ${newTier}`);
      // Revert to previous tier on failure
      const currentTier = userTierManager.getCurrentTier();
      setSelectedTier(currentTier.name);
    }
    // Call parent callback if provided
    if (onTierChange) {
      onTierChange(newTier);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <TierBadge 
        tier="Advanced" 
        interactive={true}
        onClick={handleTierChange}
        className={selectedTier === 'Advanced' ? 'ring-2 ring-blue-400/50' : ''}
      />
      <TierBadge 
        tier="PRO" 
        interactive={true}
        onClick={handleTierChange}
        className={selectedTier === 'PRO' ? 'ring-2 ring-purple-400/50' : ''}
      />
    </div>
  );
};

export default TierSelector;

