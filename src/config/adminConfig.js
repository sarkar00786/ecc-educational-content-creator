// Admin configuration for super users
export const ADMIN_CONFIG = {
  // Super user emails that bypass all quota limitations
  SUPER_USER_EMAILS: [
    'azkabloch786@gmail.com',
    'azkabloch786@gmail.com'.toLowerCase()
  ],
  
  // Admin features
  ADMIN_FEATURES: {
    BYPASS_DAILY_LIMITS: true,
    BYPASS_CHAT_LIMITS: true,
    BYPASS_FILE_LIMITS: true,
    BYPASS_CONTENT_LIMITS: true,
    UNLIMITED_MESSAGES: true,
    UNLIMITED_CHATS: true,
    UNLIMITED_FILES: true,
    BYPASS_QUOTA_LIMITS: true,
    BYPASS_SUBSCRIPTION_LIMITS: true,
    FULL_TIER_ACCESS: true
  },
  
  // Admin UI features
  ADMIN_UI_FEATURES: {
    SHOW_ADMIN_BADGE: true,
    SHOW_UNLIMITED_STATUS: true,
    SHOW_QUOTA_RESET_BUTTON: true,
    SHOW_SYSTEM_STATS: true,
    SHOW_TIER_OVERRIDE_CONTROLS: true
  }
};

// Check if user is a super user
export const isSuperUser = (userEmail) => {
  if (!userEmail) return false;
  return ADMIN_CONFIG.SUPER_USER_EMAILS.includes(userEmail.toLowerCase());
};

// Check if user has admin privileges
export const hasAdminPrivileges = (userEmail) => {
  return isSuperUser(userEmail);
};

// Get admin features for user
export const getAdminFeatures = (userEmail) => {
  if (!hasAdminPrivileges(userEmail)) {
    return null;
  }
  
  return ADMIN_CONFIG.ADMIN_FEATURES;
};

// Get admin UI features for user
export const getAdminUIFeatures = (userEmail) => {
  if (!hasAdminPrivileges(userEmail)) {
    return null;
  }
  
  return ADMIN_CONFIG.ADMIN_UI_FEATURES;
};

export default ADMIN_CONFIG;
