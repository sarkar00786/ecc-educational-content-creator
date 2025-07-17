import React from 'react';

const ProBadge = ({ size = 'sm', className = '', position = 'top-right' }) => {
  const badgeSizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const positionClasses = {
    'top-right': 'absolute -top-2 -right-2 z-20',
    'top-left': 'absolute -top-2 -left-2 z-20',
    'bottom-right': 'absolute -bottom-2 -right-2 z-20',
    'bottom-left': 'absolute -bottom-2 -left-2 z-20',
    'inline': 'relative z-10'
  };

  return (
    <span 
      className={`${positionClasses[position]} pro-gradient-primary text-white font-semibold rounded-full ${badgeSizes[size]} ${className}`}
      title="Pro Feature - Premium subscription required"
    >
      PRO
    </span>
  );
};

export default ProBadge;
