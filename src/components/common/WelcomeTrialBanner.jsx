import React, { useState, useEffect } from 'react';
import { userTierManager } from '../../config/userTiers';

/**
 * WelcomeTrialBanner Component
 * 
 * Displays the welcome trial status with countdown timer and call-to-action
 * for new users on their 9-day PRO trial period.
 */
const WelcomeTrialBanner = ({ onUpgradeClick }) => {
  const [trialStatus, setTrialStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check trial status on mount and every minute
    const checkTrialStatus = () => {
      const status = userTierManager.getTrialStatus();
      const onboardingInfo = userTierManager.getUserOnboardingInfo();
      
      setTrialStatus({ ...status, ...onboardingInfo });
      
      // Show banner only if user is on trial and hasn't dismissed it
      setIsVisible(status.isOnTrial && !isDismissed);
    };

    checkTrialStatus();
    
    // Update every minute to keep countdown accurate
    const interval = setInterval(checkTrialStatus, 60000);
    
    return () => clearInterval(interval);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    }
  };

  if (!isVisible || !trialStatus?.isOnTrial) {
    return null;
  }

  const { daysRemaining, isExpired } = trialStatus;

  // If trial is expired, show different message
  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 animate-slide-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                📚 PRO Learning Trial Expired
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Your welcome trial has ended. Continue your learning journey with PRO features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpgradeClick}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              Continue Learning
            </button>
            <button
              onClick={handleDismiss}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active trial banner
  return (
    <div className="pro-background-soft border border-violet-200 dark:border-cyan-700 rounded-lg p-4 mb-4 animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-violet-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-violet-800 dark:text-cyan-200 flex items-center">
              🎓 Welcome to PRO Learning! 
              <span className="ml-2 bg-gradient-to-r from-violet-100 to-cyan-100 dark:from-violet-800 dark:to-cyan-800 text-violet-800 dark:text-cyan-200 px-2 py-1 rounded-full text-xs font-semibold">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
              </span>
            </h3>
            <p className="text-sm text-violet-700 dark:text-cyan-300 mt-1">
              You're experiencing the full PRO features! Enjoy unlimited access to all subjects, advanced features, and more.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpgradeClick}
            className="pro-gradient-primary text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Continue with PRO
          </button>
          <button
            onClick={handleDismiss}
            className="text-violet-400 hover:text-violet-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar for trial period */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-violet-600 dark:text-cyan-400 mb-1">
          <span>Trial Progress</span>
          <span>{9 - daysRemaining} of 9 days used</span>
        </div>
        <div className="w-full bg-violet-200 dark:bg-cyan-800 rounded-full h-2">
          <div 
            className="pro-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((9 - daysRemaining) / 9) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeTrialBanner;
