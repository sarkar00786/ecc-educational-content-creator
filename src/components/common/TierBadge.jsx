import React from 'react';
import { Shield, Star, Crown } from 'lucide-react';

const TierBadge = ({ 
  tier = 'Advanced', 
  size = 'sm', 
  className = '', 
  position = 'inline',
  showIcon = true,
  interactive = false,
  onClick = null 
}) => {
  const badgeSizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const positionClasses = {
    'top-right': 'absolute -top-2 -right-2 z-20',
    'top-left': 'absolute -top-2 -left-2 z-20',
    'bottom-right': 'absolute -bottom-2 -right-2 z-20',
    'bottom-left': 'absolute -bottom-2 -left-2 z-20',
    'inline': 'relative z-10'
  };

  // Define tier-specific styles and icons
  const tierConfig = {
    'Advanced': {
      gradient: 'from-blue-500 to-cyan-600',
      icon: Shield,
      title: 'Advanced Mode - Free tier with General chat access'
    },
    'PRO': {
      gradient: 'pro-gradient-primary',
      icon: Crown,
      title: 'PRO Mode - Premium subscription with full features'
    }
  };

  const config = tierConfig[tier] || tierConfig['Advanced'];
  const IconComponent = config.icon;

  const baseClasses = `
    ${positionClasses[position]} 
    ${config.gradient.startsWith('pro-') ? config.gradient : `bg-gradient-to-r ${config.gradient}`} 
    text-white font-semibold rounded-full 
    ${badgeSizes[size]} 
    ${interactive ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
    ${className}
  `;

  const handleClick = (e) => {
    if (interactive && onClick) {
      e.preventDefault();
      onClick(tier);
    }
  };

  return (
    <span 
      className={baseClasses.trim()}
      title={config.title}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      } : undefined}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} mr-1 inline`} />
      )}
      {tier}
    </span>
  );
};

export default TierBadge;
