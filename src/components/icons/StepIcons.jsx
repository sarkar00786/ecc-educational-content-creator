import React from 'react';

// Base gradient definition for consistent styling
const GradientDefs = ({ id }) => (
  <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#8B5CF6" />
    </linearGradient>
  </defs>
);

// Step 1: Content Input - Document/Text icon
export const DocumentIcon = ({ size = 20, className = '' }) => {
  const iconId = `document-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Document icon"
    >
      <GradientDefs id={iconId} />
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        fill={`url(#${iconId})`}
      />
      <path
        d="M14 2v6h6"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 13h8M8 17h4"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Step 2: Audience Setup - Person/User icon
export const PersonIcon = ({ size = 20, className = '' }) => {
  const iconId = `person-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Person icon"
    >
      <GradientDefs id={iconId} />
      <circle
        cx="12"
        cy="8"
        r="4"
        fill={`url(#${iconId})`}
      />
      <path
        d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        stroke={`url(#${iconId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

// Step 3: Advanced Settings - Settings/Gear icon
export const SettingsIcon = ({ size = 20, className = '' }) => {
  const iconId = `settings-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Settings icon"
    >
      <GradientDefs id={iconId} />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke={`url(#${iconId})`}
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={`url(#${iconId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

// Step 4: Generate - Checkmark/Generate icon
export const GenerateIcon = ({ size = 20, className = '' }) => {
  const iconId = `generate-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Generate icon"
    >
      <GradientDefs id={iconId} />
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={`url(#${iconId})`}
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Alternative Generate icon - Lightning bolt for generation
export const LightningIcon = ({ size = 20, className = '' }) => {
  const iconId = `lightning-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Lightning icon"
    >
      <GradientDefs id={iconId} />
      <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        fill={`url(#${iconId})`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
    </svg>
  );
};

// Step 4: Generate - Sparkle icon with pulse animation
export const SparkleIcon = ({ size = 20, className = '', shouldPulse = false }) => {
  const iconId = `sparkle-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${shouldPulse ? 'animate-pulse-sparkle' : ''}`}
      aria-label="Sparkle icon"
    >
      <GradientDefs id={iconId} />
      
      {/* Main large sparkle */}
      <path
        d="M12 2l1.5 3.5L17 7l-3.5 1.5L12 12l-1.5-3.5L7 7l3.5-1.5L12 2z"
        fill={`url(#${iconId})`}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
      
      {/* Small sparkle top right */}
      <path
        d="M18 5l0.5 1L20 6.5l-1.5 0.5L18 8l-0.5-1L16 6.5l1.5-0.5L18 5z"
        fill={`url(#${iconId})`}
        opacity="0.8"
      />
      
      {/* Small sparkle bottom left */}
      <path
        d="M6 16l0.5 1L8 17.5l-1.5 0.5L6 20l-0.5-1L4 17.5l1.5-0.5L6 16z"
        fill={`url(#${iconId})`}
        opacity="0.8"
      />
      
      {/* Tiny sparkle bottom right */}
      <circle
        cx="19"
        cy="19"
        r="1"
        fill={`url(#${iconId})`}
        opacity="0.6"
      />
      
      {/* Tiny sparkle top left */}
      <circle
        cx="5"
        cy="5"
        r="0.8"
        fill={`url(#${iconId})`}
        opacity="0.6"
      />
    </svg>
  );
};

// Export all icons as a collection
export const StepIcons = {
  Document: DocumentIcon,
  Person: PersonIcon,
  Settings: SettingsIcon,
  Generate: GenerateIcon,
  Lightning: LightningIcon,
  Sparkle: SparkleIcon,
};
