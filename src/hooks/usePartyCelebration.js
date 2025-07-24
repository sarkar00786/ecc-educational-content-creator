// This file has been moved to Magic-Chat integration folder
// See: Magic-Chat/integration/partyCelebrationIntegrationCode.js
// for complete preservation of party celebration hook functionality

const usePartyCelebration = () => {
  // Return a minimal stub to prevent import errors
  return {
    isActive: false,
    isOnCooldown: false,
    deviceCapability: 'medium',
    reducedMotion: false,
    startCelebration: () => false,
    stopCelebration: () => {},
    forceStartCelebration: () => {},
    handleCelebrationComplete: () => {},
    cleanup: () => {},
    celebrationProps: {
      isActive: false,
      onComplete: () => {},
      intensity: 'minimal',
      duration: 0,
      deviceCapability: 'medium',
      reducedMotion: true
    }
  };
};

export default usePartyCelebration;
