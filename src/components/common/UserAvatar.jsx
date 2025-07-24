import React, { useState, useEffect } from 'react';
import EducatorOwl from './EducatorOwl';

// Simple MD5 implementation for Gravatar
const md5 = (str) => {
  try {
    return require('crypto-js/md5')(str).toString();
  } catch (error) {
    // eslint-disable-next-line no-unused-vars
    const unusedError = error;
    // Fallback if crypto-js fails
    console.warn('crypto-js not available, using fallback');
    return btoa(str).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 32);
  }
};

const UserAvatar = ({ 
  user, 
  size = 'md', 
  showHoverEffect = true, 
  animated = true,
  className = '',
  fallbackToOwl = true,
  onClick = null 
}) => {
  const [gravatarUrl, setGravatarUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const hoverClasses = showHoverEffect 
    ? 'hover:scale-110 hover:shadow-lg transform transition-all duration-300 cursor-pointer' 
    : '';

  // Generate Gravatar URL
  useEffect(() => {
    if (user?.email) {
      const email = user.email.toLowerCase().trim();
      const hash = md5(email).toString();
      
      // Gravatar URL with fallback to 404 (so we can detect if no Gravatar exists)
      const url = `https://www.gravatar.com/avatar/${hash}?s=200&d=404`;
      setGravatarUrl(url);
      setIsLoading(true);
      setImageError(false);
    }
  }, [user?.email]);

  // Handle image loading
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // If we have a photoURL from user profile, use that first
  if (user?.photoURL && !imageError) {
    return (
      <div 
        className={`relative ${sizeClasses[size]} ${hoverClasses} ${className}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(e);
          }
        } : undefined}
      >
        <img
          src={user.photoURL}
          alt={`${user.displayName || user.email || 'User'}'s profile`}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-blue-200 dark:border-blue-600 shadow-md`}
          onError={() => setImageError(true)}
        />
        {/* Online indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full animate-pulse" />
      </div>
    );
  }

  // If we have a Gravatar URL and it hasn't failed, show it
  if (gravatarUrl && !imageError && !isLoading) {
    return (
      <div 
        className={`relative ${sizeClasses[size]} ${hoverClasses} ${className}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(e);
          }
        } : undefined}
      >
        <img
          src={gravatarUrl}
          alt={`${user?.displayName || user?.email || 'User'}'s Gravatar`}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-purple-200 dark:border-purple-600 shadow-md`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {/* Gravatar indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 border-2 border-white dark:border-gray-800 rounded-full" 
             title="Gravatar profile picture" />
      </div>
    );
  }

  // Show loading state while checking for Gravatar
  if (gravatarUrl && isLoading) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse flex items-center justify-center border-2 border-gray-300 dark:border-gray-600`}>
          <div className="w-1/2 h-1/2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" />
        </div>
        {/* Hidden image to test Gravatar availability */}
        <img
          src={gravatarUrl}
          alt=""
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Fallback to animated educator owl
  if (fallbackToOwl) {
    return (
      <div 
        className={`relative ${hoverClasses} ${className}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(e);
          }
        } : undefined}
        title={`${user?.displayName || user?.email || 'User'}'s profile - Educator Owl`}
      >
        <EducatorOwl size={size} animated={animated} />
        {/* Magical indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 border-2 border-white dark:border-gray-800 rounded-full animate-pulse" 
             title="ECC Educator Mascot" />
      </div>
    );
  }

  // Final fallback to simple user icon
  return (
    <div 
      className={`relative ${sizeClasses[size]} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(e);
        }
      } : undefined}
    >
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center border-2 border-gray-400 dark:border-gray-600 shadow-md`}>
        <svg className="w-1/2 h-1/2 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      {/* Default indicator */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full" />
    </div>
  );
};

export default UserAvatar;
