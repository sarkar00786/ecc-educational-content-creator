/**
 * Progressive Onboarding Queue Service
 * 
 * Manages gradual feature introduction to prevent notification overload during onboarding.
 * Implements intelligent timing and user context awareness for optimal learning experience.
 */

import { notificationService, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from './notificationService';

class ProgressiveOnboardingService {
  constructor() {
    this.onboardingQueue = [];
    this.completedSteps = new Set();
    this.currentStep = null;
    this.isActive = false;
    this.userProgress = {};
    this.sessionStartTime = Date.now();
    this.lastInteractionTime = Date.now();
    this.interactionTimeout = null;
    this.stepDelay = 3000; // 3 seconds between steps
    this.maxStepsPerSession = 5;
    this.stepsShownInSession = 0;
  }

  /**
   * Initialize onboarding for a new user
   * @param {string} userId - User ID
   * @param {Object} userProfile - User profile data
   */
  initialize(userId, userProfile = {}) {
    this.userId = userId;
    this.userProfile = userProfile;
    this.loadProgress();
    this.setupDefaultOnboardingFlow();
    
    // Start onboarding if user is new
    if (this.completedSteps.size === 0) {
      this.startOnboarding();
    }
  }

  /**
   * Setup default onboarding flow
   */
  setupDefaultOnboardingFlow() {
    const defaultSteps = [
      {
        id: 'welcome',
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '🎉 Welcome to ECC!',
        message: 'Let\'s get you started with a quick tour of the key features.',
        targetContext: 'global',
        priority: 'HIGH',
        actions: [
          { label: 'Start Tour', handler: () => this.nextStep(), primary: true },
          { label: 'Skip', handler: () => this.skipOnboarding() }
        ],
        triggers: ['app_first_load'],
        delay: 1000
      },
      {
        id: 'content_generation',
        type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '✨ Content Generation',
        message: 'Create educational content by filling out the form below. Start with your book content and target audience.',
        targetContext: 'generation',
        targetSelector: '#content-form',
        position: 'inline',
        actions: [
          { label: 'Got it!', handler: () => this.completeStep('content_generation'), primary: true }
        ],
        triggers: ['page_generation'],
        prerequisite: 'welcome',
        delay: 2000
      },
      {
        id: 'subject_selection',
        type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '📚 Subject Selection',
        message: 'Choose your subject to get more targeted content generation.',
        targetContext: 'generation',
        targetSelector: '[data-testid="subject-selector"]',
        position: 'inline',
        actions: [
          { label: 'Understood', handler: () => this.completeStep('subject_selection'), primary: true }
        ],
        triggers: ['form_focus'],
        prerequisite: 'content_generation',
        delay: 1000
      },
      {
        id: 'pro_features',
        type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
        category: NOTIFICATION_CATEGORIES.TIER_MANAGEMENT,
        title: '⭐ PRO Features',
        message: 'You have access to PRO features during your trial! Try advanced personas and longer outputs.',
        targetContext: 'generation',
        targetSelector: '[data-testid="pro-badge"]',
        position: 'inline',
        actions: [
          { label: 'Explore PRO', handler: () => this.completeStep('pro_features'), primary: true }
        ],
        triggers: ['pro_tier_active'],
        prerequisite: 'subject_selection',
        delay: 2000
      },
      {
        id: 'content_history',
        type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '📁 Content History',
        message: 'Access your previously generated content anytime from the History tab.',
        targetContext: 'global',
        targetSelector: '[data-tab="history"]',
        position: 'inline',
        actions: [
          { label: 'Check it out', handler: () => this.completeStep('content_history'), primary: true }
        ],
        triggers: ['content_generated'],
        prerequisite: 'pro_features',
        delay: 3000
      },
      {
        id: 'chat_feature',
        type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '💬 Magic Discussion',
        message: 'Discuss your content with AI! Link any content to start a conversation.',
        targetContext: 'global',
        targetSelector: '[data-tab="chat"]',
        position: 'inline',
        actions: [
          { label: 'Try it now', handler: () => this.completeStep('chat_feature'), primary: true }
        ],
        triggers: ['history_viewed'],
        prerequisite: 'content_history',
        delay: 2000
      },
      {
        id: 'voice_control',
        type: NOTIFICATION_TYPES.FEATURE_HIGHLIGHT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '🎤 Voice Control',
        message: 'Use voice commands to navigate! Click the microphone icon to get started.',
        targetContext: 'global',
        targetSelector: '[data-testid="voice-toggle"]',
        position: 'inline',
        actions: [
          { label: 'Cool!', handler: () => this.completeStep('voice_control'), primary: true }
        ],
        triggers: ['navigation_completed'],
        prerequisite: 'chat_feature',
        delay: 1500
      },
      {
        id: 'completion',
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        category: NOTIFICATION_CATEGORIES.ONBOARDING,
        title: '🎊 Onboarding Complete!',
        message: 'You\'re all set! Explore ECC and create amazing educational content.',
        targetContext: 'global',
        actions: [
          { label: 'Start Creating', handler: () => this.completeOnboarding(), primary: true }
        ],
        triggers: ['all_steps_completed'],
        prerequisite: 'voice_control',
        delay: 1000
      }
    ];

    this.onboardingQueue = defaultSteps.filter(step => !this.completedSteps.has(step.id));
  }

  /**
   * Start the onboarding process
   */
  startOnboarding() {
    this.isActive = true;
    this.stepsShownInSession = 0;
    console.log('🎓 Starting progressive onboarding');
    
    // Show first step
    this.processNextStep();
  }

  /**
   * Process the next step in the onboarding queue
   */
  processNextStep() {
    if (!this.isActive || this.stepsShownInSession >= this.maxStepsPerSession) {
      return;
    }

    const nextStep = this.findNextEligibleStep();
    if (!nextStep) {
      console.log('🎓 No more onboarding steps available');
      return;
    }

    this.currentStep = nextStep;
    this.showStep(nextStep);
  }

  /**
   * Find the next eligible step based on prerequisites and triggers
   */
  findNextEligibleStep() {
    return this.onboardingQueue.find(step => {
      // Check if step is already completed
      if (this.completedSteps.has(step.id)) {
        return false;
      }

      // Check prerequisites
      if (step.prerequisite && !this.completedSteps.has(step.prerequisite)) {
        return false;
      }

      // Check if step should be shown based on current context
      if (step.targetContext && step.targetContext !== this.currentContext) {
        return false;
      }

      return true;
    });
  }

  /**
   * Show an onboarding step
   * @param {Object} step - Onboarding step configuration
   */
  showStep(step) {
    console.log(`🎓 Showing onboarding step: ${step.id}`);
    
    const notification = {
      ...step,
      metadata: {
        isOnboarding: true,
        stepId: step.id,
        sessionStep: this.stepsShownInSession + 1
      }
    };

    // Add completion tracking to actions
    if (step.actions) {
      notification.actions = step.actions.map(action => ({
        ...action,
        handler: () => {
          action.handler();
          this.updateLastInteraction();
        }
      }));
    }

    // Show notification with delay
    setTimeout(() => {
      notificationService.processNotification(notification);
      this.stepsShownInSession++;
      this.updateLastInteraction();
    }, step.delay || 0);
  }

  /**
   * Complete a specific onboarding step
   * @param {string} stepId - Step ID to complete
   */
  completeStep(stepId) {
    console.log(`🎓 Completing onboarding step: ${stepId}`);
    
    this.completedSteps.add(stepId);
    this.currentStep = null;
    this.saveProgress();
    
    // Schedule next step
    setTimeout(() => {
      this.processNextStep();
    }, this.stepDelay);
  }

  /**
   * Skip current step
   */
  skipStep() {
    if (this.currentStep) {
      this.completeStep(this.currentStep.id);
    }
  }

  /**
   * Skip entire onboarding process
   */
  skipOnboarding() {
    console.log('🎓 Skipping onboarding process');
    
    this.isActive = false;
    this.currentStep = null;
    
    // Mark all steps as completed
    this.onboardingQueue.forEach(step => {
      this.completedSteps.add(step.id);
    });
    
    this.saveProgress();
    
    // Show completion notification
    notificationService.processNotification({
      type: NOTIFICATION_TYPES.INFO,
      category: NOTIFICATION_CATEGORIES.ONBOARDING,
      message: 'Onboarding skipped. You can access help anytime from the menu.',
      duration: 3000
    });
  }

  /**
   * Complete the entire onboarding process
   */
  completeOnboarding() {
    console.log('🎓 Onboarding process completed');
    
    this.isActive = false;
    this.currentStep = null;
    this.completedSteps.add('onboarding_complete');
    this.saveProgress();
    
    // Track completion analytics
    this.trackOnboardingCompletion();
  }

  /**
   * Trigger onboarding step based on user action
   * @param {string} trigger - Trigger name
   * @param {Object} context - Additional context
   */
  triggerStep(trigger, context = {}) {
    if (!this.isActive) return;
    
    console.log(`🎓 Onboarding trigger: ${trigger}`);
    
    // Update context
    this.currentContext = context.currentContext || this.currentContext;
    
    // Find steps that match this trigger
    const triggeredSteps = this.onboardingQueue.filter(step => 
      step.triggers && step.triggers.includes(trigger) && 
      !this.completedSteps.has(step.id)
    );
    
    // Process first eligible triggered step
    if (triggeredSteps.length > 0) {
      const step = triggeredSteps[0];
      if (this.isStepEligible(step)) {
        this.showStep(step);
      }
    }
  }

  /**
   * Check if a step is eligible to be shown
   * @param {Object} step - Step to check
   */
  isStepEligible(step) {
    // Check prerequisites
    if (step.prerequisite && !this.completedSteps.has(step.prerequisite)) {
      return false;
    }

    // Check session limits
    if (this.stepsShownInSession >= this.maxStepsPerSession) {
      return false;
    }

    // Check time since last interaction
    const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;
    if (timeSinceLastInteraction < 2000) { // 2 seconds minimum between steps
      return false;
    }

    return true;
  }

  /**
   * Update last interaction time
   */
  updateLastInteraction() {
    this.lastInteractionTime = Date.now();
    
    // Reset interaction timeout
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }
    
    // Pause onboarding if user is inactive
    this.interactionTimeout = setTimeout(() => {
      this.pauseOnboarding();
    }, 30000); // 30 seconds of inactivity
  }

  /**
   * Pause onboarding due to inactivity
   */
  pauseOnboarding() {
    console.log('🎓 Pausing onboarding due to inactivity');
    
    // Can be resumed when user becomes active again
    this.isActive = false;
  }

  /**
   * Resume onboarding
   */
  resumeOnboarding() {
    console.log('🎓 Resuming onboarding');
    
    this.isActive = true;
    this.updateLastInteraction();
  }

  /**
   * Update current context (page/section)
   * @param {string} context - Current context
   */
  updateContext(context) {
    this.currentContext = context;
    
    // Trigger context-specific steps
    this.triggerStep(`page_${context}`, { currentContext: context });
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    const progress = {
      completedSteps: Array.from(this.completedSteps),
      userProgress: this.userProgress,
      sessionStartTime: this.sessionStartTime,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(`onboarding_progress_${this.userId}`, JSON.stringify(progress));
  }

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    const saved = localStorage.getItem(`onboarding_progress_${this.userId}`);
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        this.completedSteps = new Set(progress.completedSteps || []);
        this.userProgress = progress.userProgress || {};
        this.sessionStartTime = progress.sessionStartTime || Date.now();
      } catch (error) {
        console.error('🎓 Error loading onboarding progress:', error);
      }
    }
  }

  /**
   * Track onboarding completion for analytics
   */
  trackOnboardingCompletion() {
    const completionData = {
      userId: this.userId,
      completedSteps: Array.from(this.completedSteps),
      totalDuration: Date.now() - this.sessionStartTime,
      stepsShown: this.stepsShownInSession,
      completedAt: new Date().toISOString()
    };
    
    // Send to analytics service (placeholder)
    console.log('🎓 Onboarding completion tracked:', completionData);
  }

  /**
   * Get onboarding statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      currentStep: this.currentStep?.id,
      completedSteps: Array.from(this.completedSteps),
      totalSteps: this.onboardingQueue.length,
      stepsShownInSession: this.stepsShownInSession,
      progress: Math.round((this.completedSteps.size / this.onboardingQueue.length) * 100)
    };
  }

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  reset() {
    this.completedSteps.clear();
    this.currentStep = null;
    this.isActive = false;
    this.stepsShownInSession = 0;
    this.userProgress = {};
    this.sessionStartTime = Date.now();
    
    if (this.userId) {
      localStorage.removeItem(`onboarding_progress_${this.userId}`);
    }
    
    console.log('🎓 Onboarding reset');
  }
}

// Export singleton instance
export const progressiveOnboardingService = new ProgressiveOnboardingService();
