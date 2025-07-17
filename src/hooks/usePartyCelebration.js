import { useState, useCallback, useRef, useEffect } from 'react';

// Device capability detection for performance optimization
const detectDeviceCapability = () => {
  try {
    // Check if we're in a test environment
    if (typeof window === 'undefined' || !window.document) {
      return 'low';
    }
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl || typeof gl.getExtension !== 'function') {
      return 'low'; // No WebGL support
    }
    
    // Check memory and other performance indicators
    const memoryInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = memoryInfo ? gl.getParameter(memoryInfo.UNMASKED_RENDERER_WEBGL) : '';
    const vendor = memoryInfo ? gl.getParameter(memoryInfo.UNMASKED_VENDOR_WEBGL) : '';
    
    // Basic heuristics for device capability
    const isHighEnd = /nvidia|amd|intel/i.test(renderer) || /apple|qualcomm/i.test(vendor);
    const isMobile = /mobile|android|ios/i.test(navigator.userAgent);
    
    if (isHighEnd && !isMobile) {
      return 'high';
    } else if (isMobile) {
      return 'low';
    } else {
      return 'medium';
    }
  } catch (error) {
    console.warn('WebGL detection failed:', error);
    return 'low';
  }
};

const usePartyCelebration = ({ 
  intensity = 'moderate', 
  duration = 4000,
  cooldownPeriod = 10000, // 10 seconds cooldown between celebrations
  enablePerformanceOptimization = true,
  respectReducedMotion = true
} = {}) => {
  const [isActive, setIsActive] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [deviceCapability, setDeviceCapability] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const lastCelebrationRef = useRef(0);
  const cooldownTimeoutRef = useRef(null);
  const performanceMonitorRef = useRef(null);

  // Initialize device capability detection and reduced motion preference
  useEffect(() => {
    if (enablePerformanceOptimization) {
      setDeviceCapability(detectDeviceCapability());
    }
    
    if (respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      
      const handleChange = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [enablePerformanceOptimization, respectReducedMotion]);

  const startCelebration = useCallback(() => {
    const now = Date.now();
    
    // Check if we're on cooldown
    if (isOnCooldown || (now - lastCelebrationRef.current) < cooldownPeriod) {
      console.log('Party celebration on cooldown');
      return false;
    }

    // Check if animation is already active
    if (isActive) {
      console.log('Party celebration already active');
      return false;
    }

    // Start the celebration
    setIsActive(true);
    setIsOnCooldown(true);
    lastCelebrationRef.current = now;

    // Clear any existing cooldown timeout
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }

    // Set cooldown timeout
    cooldownTimeoutRef.current = setTimeout(() => {
      setIsOnCooldown(false);
      cooldownTimeoutRef.current = null;
    }, cooldownPeriod);

    console.log('Party celebration started successfully');
    return true;
  }, [isActive, isOnCooldown, cooldownPeriod]);

  const stopCelebration = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleCelebrationComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  // Force start celebration (ignores cooldown)
  const forceStartCelebration = useCallback(() => {
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }
    
    setIsActive(true);
    lastCelebrationRef.current = Date.now();
    
    // Only set cooldown if cooldownPeriod is greater than 0
    if (cooldownPeriod > 0) {
      setIsOnCooldown(true);
      cooldownTimeoutRef.current = setTimeout(() => {
        setIsOnCooldown(false);
        cooldownTimeoutRef.current = null;
      }, cooldownPeriod);
    } else {
      setIsOnCooldown(false);
    }
    
    console.log('🎉 Force celebration started - cooldown period:', cooldownPeriod);
  }, [cooldownPeriod]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }
    setIsActive(false);
    setIsOnCooldown(false);
  }, []);

  return {
    isActive,
    isOnCooldown,
    deviceCapability,
    reducedMotion,
    startCelebration,
    stopCelebration,
    forceStartCelebration,
    handleCelebrationComplete,
    cleanup,
    celebrationProps: {
      isActive,
      onComplete: handleCelebrationComplete,
      intensity: reducedMotion ? 'minimal' : intensity,
      duration: reducedMotion ? Math.min(duration, 2000) : duration,
      deviceCapability,
      reducedMotion
    }
  };
};

export default usePartyCelebration;
