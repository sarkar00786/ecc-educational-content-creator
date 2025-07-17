import React from 'react';

const BrainIcon = ({ size = 24, className = '' }) => {
  const iconId = `brain-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Brain icon"
    >
      <defs>
        <linearGradient id={iconId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      
      {/* Brain outline */}
      <path
        d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4-.5 1-1.5 2.5-1.5 4 0 3.5 2.5 6 6 6s6-2.5 6-6c0-1.5-1-3-1.5-4 1-.5 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z"
        fill={`url(#${iconId})`}
        stroke="none"
      />
      
      {/* Brain texture lines */}
      <path
        d="M8.5 7c1 0 2 .5 3 1.5M15.5 7c-1 0-2 .5-3 1.5M9 12c1 0 2 .5 3 1M15 12c-1 0-2 .5-3 1M10 16c.5 0 1 .2 2 .5M14 16c-.5 0-1 .2-2 .5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Central division */}
      <path
        d="M12 4v16"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default BrainIcon;
