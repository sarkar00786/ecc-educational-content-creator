import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Stage configuration with progress ranges
const STAGE_CONFIG = {
  idle: { start: 0, end: 0 },
  prep: { start: 0, end: 70 },
  processing: { start: 70, end: 85 },
  handling: { start: 85, end: 90 },
  complete: { start: 90, end: 100 }
};

// Context creation
const GenerationProgressContext = createContext();

// Custom hook to use the context
export const useGenerationProgress = () => {
  const context = useContext(GenerationProgressContext);
  if (!context) {
    throw new Error('useGenerationProgress must be used within a GenerationProgressProvider');
  }
  return context;
};

// Provider component
export const GenerationProgressProvider = ({ children }) => {
  const [stage, setStage] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Internal tweening using useEffect with interval
  useEffect(() => {
    let interval;
    
    if (isActive && stage !== 'idle' && stage !== 'complete') {
      const stageConfig = STAGE_CONFIG[stage];
      const targetProgress = stageConfig.end;
      
      interval = setInterval(() => {
        setProgress(currentProgress => {
          if (currentProgress >= targetProgress) {
            return currentProgress; // Stop at target
          }
          
          // Calculate increment based on stage duration
          // Faster progression for shorter stages
          const progressRange = targetProgress - stageConfig.start;
          const increment = Math.max(0.5, progressRange * 0.02); // 2% of range per tick
          
          return Math.min(currentProgress + increment, targetProgress);
        });
      }, 150); // Update every 150ms for smooth animation
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [stage, isActive]);

  // Helper functions
  const start = useCallback(() => {
    setIsActive(true);
    setStage('prep');
    setProgress(0);
  }, []);

  const advance = useCallback((stageKey) => {
    if (STAGE_CONFIG[stageKey]) {
      setStage(stageKey);
      // Set progress to the start of the new stage
      setProgress(STAGE_CONFIG[stageKey].start);
    }
  }, []);

  const finish = useCallback(() => {
    setStage('complete');
    setProgress(100);
    setIsActive(false);
    
    // Auto-reset after a delay
    setTimeout(() => {
      setStage('idle');
      setProgress(0);
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setStage('idle');
    setProgress(0);
    setIsActive(false);
  }, []);

  // Enhanced setStage function that can accept a function
  const setStageFunction = useCallback((stageOrFunction) => {
    if (typeof stageOrFunction === 'function') {
      setStage(prevStage => {
        const newStage = stageOrFunction(prevStage);
        if (STAGE_CONFIG[newStage]) {
          setProgress(STAGE_CONFIG[newStage].start);
          return newStage;
        }
        return prevStage;
      });
    } else if (STAGE_CONFIG[stageOrFunction]) {
      setStage(stageOrFunction);
      setProgress(STAGE_CONFIG[stageOrFunction].start);
    }
  }, []);

  const value = {
    // Core state
    progress: Math.round(progress),
    stage,
    setStage: setStageFunction,
    
    // Helper functions
    start,
    advance,
    finish,
    reset,
    
    // Additional utilities
    isActive,
    stageConfig: STAGE_CONFIG
  };

  return (
    <GenerationProgressContext.Provider value={value}>
      {children}
    </GenerationProgressContext.Provider>
  );
};

export default GenerationProgressContext;
