// User Tier Configuration for PRO vs Advanced Mode
export const USER_TIERS = {
  ADVANCED: {
    name: 'Advanced',
    displayName: 'Advanced Mode',
    price: 'Free',
    features: {
      // Chat creation restrictions
      CHAT_CREATION: {
        GENERAL_MODE_ONLY: true,
        SUBJECT_SPECIFIC_CHATS: false,
        UNLIMITED_GENERAL_CHATS: true,
        MAX_DAILY_CHATS: 0, // No subject-specific chats allowed
        AVAILABLE_SUBJECTS: ['General'] // Only General mode available
      },
      
      // Chat opening restrictions
      CHAT_ACCESS: {
        CAN_OPEN_ALL_CHATS: false,
        CAN_OPEN_GENERAL_CHATS: true,
        CAN_OPEN_SUBJECT_CHATS: false,
        CAN_VIEW_CHAT_HISTORY: true
      },
      
      // Feature limitations
      FEATURES: {
        UNLIMITED_MESSAGING: true, // In General mode only
        CONTENT_CARD_LINKING: true, // 1 per chat
        FILE_UPLOADS: false, // No file uploads
        CHAT_LINKING: false, // No chat linking
        ADVANCED_FEATURES: false
      },
      
      // UI/UX restrictions
      UI_RESTRICTIONS: {
        SHOW_SUBJECT_SELECTION: false,
        SHOW_PREMIUM_FEATURES: false,
        SHOW_UPGRADE_PROMPTS: true,
        HIDE_DISABLED_SUBJECTS: true
      }
    }
  },
  
  PRO: {
    name: 'PRO',
    displayName: 'PRO Mode',
    price: '$9.99/month',
    features: {
      // Full chat creation access
      CHAT_CREATION: {
        GENERAL_MODE_ONLY: false,
        SUBJECT_SPECIFIC_CHATS: true,
        UNLIMITED_GENERAL_CHATS: true,
        MAX_DAILY_CHATS: 25, // Full daily limit
        AVAILABLE_SUBJECTS: [
          'General',
          'Mathematics',
          'Science',
          'Physics',
          'Chemistry',
          'History',
          'Literature',
          'Accounting & Finance'
        ]
      },
      
      // Full chat access
      CHAT_ACCESS: {
        CAN_OPEN_ALL_CHATS: true,
        CAN_OPEN_GENERAL_CHATS: true,
        CAN_OPEN_SUBJECT_CHATS: true,
        CAN_VIEW_CHAT_HISTORY: true
      },
      
      // Full feature access
      FEATURES: {
        UNLIMITED_MESSAGING: true, // In all modes
        CONTENT_CARD_LINKING: true,
        FILE_UPLOADS: true,
        CHAT_LINKING: true,
        ADVANCED_FEATURES: true
      },
      
      // Full UI access
      UI_RESTRICTIONS: {
        SHOW_SUBJECT_SELECTION: true,
        SHOW_PREMIUM_FEATURES: true,
        SHOW_UPGRADE_PROMPTS: false,
        HIDE_DISABLED_SUBJECTS: false
      }
    }
  }
};

// Schema versioning and migration system
const SCHEMA_VERSION = 2; // Current schema version

const MIGRATION_FUNCTIONS = {
  // Migration from version 1 to 2
  '1_to_2': (data) => {
    // Example: Add new fields, rename existing fields, etc.
    return {
      ...data,
      version: 2,
      metadata: {
        ...data.metadata,
        schemaVersion: 2,
        migrationDate: new Date().toISOString()
      }
    };
  },
  
  // Future migrations can be added here
  // '2_to_3': (data) => { ... },
  // '3_to_4': (data) => { ... },
};

// Data migration utilities
class DataMigrationManager {
  static migrateData(data, currentVersion = SCHEMA_VERSION) {
    let workingData = { ...data };
    const dataVersion = workingData.version || 1; // Default to version 1 for legacy data
    
    // If data is already at current version, no migration needed
    if (dataVersion >= currentVersion) {
      return workingData;
    }
    
    // Apply migrations sequentially
    for (let version = dataVersion; version < currentVersion; version++) {
      const migrationKey = `${version}_to_${version + 1}`;
      const migrationFunction = MIGRATION_FUNCTIONS[migrationKey];
      
      if (migrationFunction) {
        try {
          workingData = migrationFunction(workingData);
          console.log(`Successfully migrated tier data from version ${version} to ${version + 1}`);
        } catch (error) {
          console.error(`Migration failed from version ${version} to ${version + 1}:`, error);
          // Return original data on migration failure
          return data;
        }
      } else {
        console.warn(`No migration function found for version ${version} to ${version + 1}`);
      }
    }
    
    return workingData;
  }
  
  static validateDataStructure(data) {
    // Basic validation of required fields
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check for required fields
    const requiredFields = ['tier', 'setAt', 'metadata'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return false;
      }
    }
    
    // Validate tier exists
    if (!USER_TIERS[data.tier]) {
      return false;
    }
    
    return true;
  }
  
  static createDataBackup(data) {
    // Create backup of original data before migration
    const backupKey = `eccApp_userTier_backup_${Date.now()}`;
    try {
      localStorage.setItem(backupKey, JSON.stringify(data));
      console.log(`Created backup at: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return null;
    }
  }
  
  static cleanupOldBackups() {
    // Clean up backups older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('eccApp_userTier_backup_')) {
        const timestamp = parseInt(key.split('_').pop());
        if (timestamp < thirtyDaysAgo) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed old backup: ${key}`);
    });
  }
}

// User tier detection and management
export class UserTierManager {
  constructor() {
    this.storageKey = 'eccApp_userTier';
    this.defaultTier = USER_TIERS.ADVANCED;
    this.welcomeTrialDays = 9; // PRO welcome trial period
    this.schemaVersion = SCHEMA_VERSION;
    this.adminOverrideKey = 'eccApp_adminTierOverride';
    
    // Clean up old backups on initialization
    DataMigrationManager.cleanupOldBackups();
  }
  
  
  // Set user tier with versioning
  setUserTier(tierName, metadata = {}) {
    // Validate tier name
    if (!tierName || typeof tierName !== 'string') {
      console.error('Invalid tier name:', tierName);
      return false;
    }
    
    // Convert tierName to uppercase for consistency
    const normalizedTierName = tierName.toUpperCase();
    
    // Handle case-insensitive tier name validation
    const validTierNames = Object.keys(USER_TIERS);
    const matchingTier = validTierNames.find(name => name === normalizedTierName);
    
    if (!matchingTier) {
      console.error('Invalid tier name:', tierName, 'Valid tiers:', validTierNames);
      return false;
    }
    
    const tier = USER_TIERS[matchingTier];
    
    const tierData = {
      tier: matchingTier,
      setAt: new Date().toISOString(),
      version: this.schemaVersion,
      metadata: {
        ...metadata,
        lastUpdated: new Date().toISOString(),
        schemaVersion: this.schemaVersion
      }
    };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tierData));
      return true;
    } catch (error) {
      console.error('Error saving tier data:', error);
      return false;
    }
  }
  
  
  // Get tier metadata
  getTierMetadata() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const tierData = JSON.parse(stored);
        return tierData.metadata || {};
      } catch (error) {
        return {};
      }
    }
    return {};
  }
  
  // Upgrade to PRO
  upgradeToPRO() {
    return this.setUserTier('PRO', {
      upgradeDate: new Date().toISOString(),
      source: 'upgrade_action'
    });
  }
  
  // Downgrade to Advanced
  downgradeToAdvanced() {
    return this.setUserTier('ADVANCED', {
      downgradeDate: new Date().toISOString(),
      source: 'downgrade_action'
    });
  }
  
  // Check if user can create chat with specific subject
  canCreateChatWithSubject(subject) {
    const tier = this.getCurrentTier();
    const availableSubjects = tier.features.CHAT_CREATION.AVAILABLE_SUBJECTS;
    return availableSubjects.includes(subject);
  }
  
  // Check if user can open chat with specific subject
  canOpenChatWithSubject(subject) {
    const tier = this.getCurrentTier();
    
    if (subject === 'General') {
      return tier.features.CHAT_ACCESS.CAN_OPEN_GENERAL_CHATS;
    }
    
    return tier.features.CHAT_ACCESS.CAN_OPEN_SUBJECT_CHATS;
  }
  
  // Get available subjects for chat creation
  getAvailableSubjects() {
    const tier = this.getCurrentTier();
    return tier.features.CHAT_CREATION.AVAILABLE_SUBJECTS;
  }
  
  // Check if user can access specific feature
  canAccessFeature(feature) {
    const tier = this.getCurrentTier();
    return tier.features.FEATURES[feature] || false;
  }
  
  // Get tier display information
  getTierDisplayInfo() {
    const tier = this.getCurrentTier();
    const metadata = this.getTierMetadata();
    
    return {
      name: tier.name,
      displayName: tier.displayName,
      price: tier.price,
      isPRO: this.isPROUser(),
      isAdvanced: this.isAdvancedUser(),
      features: tier.features,
      metadata
    };
  }
  
  // Check if user should see upgrade prompts
  shouldShowUpgradePrompts() {
    const tier = this.getCurrentTier();
    return tier.features.UI_RESTRICTIONS.SHOW_UPGRADE_PROMPTS;
  }
  
  // Get restriction reasons for UI feedback
  getRestrictionReason(action) {
    const tier = this.getCurrentTier();
    
    if (tier.name === 'PRO') {
      return null; // No restrictions for PRO users
    }
    
    const reasons = {
      'create_subject_chat': 'Subject-specific chats are available in PRO mode. Upgrade to access Mathematics, Science, History, and more!',
      'open_subject_chat': 'Opening subject-specific chats requires PRO mode. Upgrade to access all your chat history!',
      'file_upload': 'File uploads are available in PRO mode. Upgrade to share documents, images, and more!',
      'chat_linking': 'Chat linking is available in PRO mode. Upgrade to connect related conversations!',
      'advanced_features': 'Advanced features are available in PRO mode. Upgrade to unlock the full potential!',
      'quiz_generation': 'Interactive Quiz Generation is a PRO feature. Upgrade to create engaging assessments with multiple-choice questions and instant feedback!'
    };
    
    return reasons[action] || 'This feature is available in PRO mode. Upgrade to unlock full access!';
  }
  
  // Initialize new user with PRO welcome trial
  initializeNewUser() {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + this.welcomeTrialDays);
    
    return this.setUserTier('PRO', {
      isWelcomeTrial: true,
      trialStartDate: new Date().toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      trialDaysRemaining: this.welcomeTrialDays,
      source: 'welcome_trial',
      requiresPaymentAfterTrial: true
    });
  }
  
  // Check if user is on welcome trial
  isOnWelcomeTrial() {
    const metadata = this.getTierMetadata();
    return metadata.isWelcomeTrial === true;
  }
  
  // Get trial status information
  getTrialStatus() {
    const metadata = this.getTierMetadata();
    
    if (!metadata.isWelcomeTrial) {
      return {
        isOnTrial: false,
        isExpired: false,
        daysRemaining: 0,
        endDate: null
      };
    }
    
    const trialEndDate = new Date(metadata.trialEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;
    
    return {
      isOnTrial: true,
      isExpired,
      daysRemaining: Math.max(0, daysRemaining),
      endDate: trialEndDate.toISOString(),
      startDate: metadata.trialStartDate
    };
  }
  
  // Check if trial has expired and handle downgrade
  checkTrialExpiration() {
    const trialStatus = this.getTrialStatus();
    
    if (trialStatus.isOnTrial && trialStatus.isExpired) {
      // Trial has expired, downgrade to Basic mode
      this.downgradeToAdvanced();
      return {
        trialExpired: true,
        downgradedToBasic: true,
        message: 'Your PRO welcome trial has expired. Please submit payment to continue with PRO features.'
      };
    }
    
    return {
      trialExpired: false,
      downgradedToBasic: false,
      message: null
    };
  }
  
  // Activate PRO after payment approval
  activatePROAfterPayment() {
    const metadata = this.getTierMetadata();
    return this.setUserTier('PRO', {
      ...metadata,
      isWelcomeTrial: false,
      paidSubscription: true,
      paymentApprovalDate: new Date().toISOString(),
      source: 'payment_approved'
    });
  }
  
  // Get effective tier (considers trial expiration)
  getEffectiveTier() {
    const trialStatus = this.getTrialStatus();
    
    // If trial is expired, return Advanced tier even if stored tier is PRO
    if (trialStatus.isOnTrial && trialStatus.isExpired) {
      return USER_TIERS.ADVANCED;
    }
    
    return this.getCurrentTier();
  }
  
  
  // Get user onboarding status
  getUserOnboardingInfo() {
    const trialStatus = this.getTrialStatus();
    const metadata = this.getTierMetadata();
    
    return {
      isNewUser: !metadata.setAt || (new Date() - new Date(metadata.setAt)) < (24 * 60 * 60 * 1000), // New if set within 24 hours
      hasWelcomeTrial: trialStatus.isOnTrial,
      trialDaysRemaining: trialStatus.daysRemaining,
      needsPaymentSubmission: trialStatus.isExpired && !metadata.paidSubscription,
      isWaitingForApproval: metadata.paymentSubmitted && !metadata.paidSubscription
    };
  }
  
  // Admin override functions
  setAdminTierOverride(tierName, userEmail) {
    const { isSuperUser } = require('./adminConfig');
    
    if (!isSuperUser(userEmail)) {
      console.error('Only super users can set tier overrides');
      return false;
    }
    
    const normalizedTierName = tierName.toUpperCase();
    if (!USER_TIERS[normalizedTierName]) {
      console.error('Invalid tier name for override:', tierName);
      return false;
    }
    
    const overrideData = {
      tier: normalizedTierName,
      setBy: userEmail,
      setAt: new Date().toISOString(),
      active: true
    };
    
    try {
      localStorage.setItem(this.adminOverrideKey, JSON.stringify(overrideData));
      return true;
    } catch (error) {
      console.error('Error setting admin tier override:', error);
      return false;
    }
  }
  
  getAdminTierOverride() {
    const stored = localStorage.getItem(this.adminOverrideKey);
    if (stored) {
      try {
        const overrideData = JSON.parse(stored);
        return overrideData.active ? overrideData : null;
      } catch (error) {
        console.error('Error parsing admin override data:', error);
        return null;
      }
    }
    return null;
  }
  
  clearAdminTierOverride(userEmail) {
    const { isSuperUser } = require('./adminConfig');
    
    if (!isSuperUser(userEmail)) {
      console.error('Only super users can clear tier overrides');
      return false;
    }
    
    localStorage.removeItem(this.adminOverrideKey);
    return true;
  }
  
  // Check if user is admin and has override capabilities
  isAdminUser(userEmail) {
    const { isSuperUser } = require('./adminConfig');
    return isSuperUser(userEmail);
  }
  
  // Override getCurrentTier to check admin override first
  getCurrentTier() {
    // Check for admin override first
    const override = this.getAdminTierOverride();
    if (override) {
      return USER_TIERS[override.tier] || this.defaultTier;
    }
    
    // Otherwise use regular tier logic
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        let tierData = JSON.parse(stored);
        
        // Check if migration is needed
        if (!tierData.version || tierData.version < this.schemaVersion) {
          console.log('Migrating tier data from version', tierData.version || 1, 'to', this.schemaVersion);
          
          // Create backup before migration
          DataMigrationManager.createDataBackup(tierData);
          
          // Migrate data
          tierData = DataMigrationManager.migrateData(tierData, this.schemaVersion);
          
          // Validate migrated data
          if (DataMigrationManager.validateDataStructure(tierData)) {
            // Save migrated data
            localStorage.setItem(this.storageKey, JSON.stringify(tierData));
            console.log('Successfully migrated and saved tier data');
          } else {
            console.error('Migration resulted in invalid data structure, using defaults');
            return this.defaultTier;
          }
        }
        
        return USER_TIERS[tierData.tier] || this.defaultTier;
      } catch (error) {
        console.error('Error parsing user tier:', error);
        return this.defaultTier;
      }
    }
    return this.defaultTier;
  }
  
  // Override isPROUser to check admin override
  isPROUser() {
    const override = this.getAdminTierOverride();
    if (override) {
      return override.tier === 'PRO';
    }
    
    const effectiveTier = this.getEffectiveTier();
    return effectiveTier.name === 'PRO';
  }
  
  // Override isAdvancedUser to check admin override
  isAdvancedUser() {
    const override = this.getAdminTierOverride();
    if (override) {
      return override.tier === 'ADVANCED';
    }
    
    return this.getCurrentTier().name === 'Advanced';
  }
  
  // Get tier display info with admin override consideration
  getTierDisplayInfo() {
    const override = this.getAdminTierOverride();
    const tier = this.getCurrentTier();
    const metadata = this.getTierMetadata();
    
    return {
      name: tier.name,
      displayName: tier.displayName,
      price: tier.price,
      isPRO: this.isPROUser(),
      isAdvanced: this.isAdvancedUser(),
      features: tier.features,
      metadata,
      adminOverride: override ? {
        active: true,
        setBy: override.setBy,
        setAt: override.setAt,
        tier: override.tier
      } : null
    };
  }
  
  // Reset to default tier (for testing)
  resetToDefault() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.adminOverrideKey);
  }
}

// Singleton instance
export const userTierManager = new UserTierManager();

// Utility functions for easy access
export const getCurrentTier = () => userTierManager.getCurrentTier();
export const isPROUser = () => userTierManager.isPROUser();
export const isAdvancedUser = () => userTierManager.isAdvancedUser();
export const canCreateChatWithSubject = (subject) => userTierManager.canCreateChatWithSubject(subject);
export const canOpenChatWithSubject = (subject) => userTierManager.canOpenChatWithSubject(subject);
export const getAvailableSubjects = () => userTierManager.getAvailableSubjects();
export const canAccessFeature = (feature) => userTierManager.canAccessFeature(feature);
export const getTierDisplayInfo = () => userTierManager.getTierDisplayInfo();
export const getRestrictionReason = (action) => userTierManager.getRestrictionReason(action);
export const shouldShowUpgradePrompts = () => userTierManager.shouldShowUpgradePrompts();
