import React from 'react';
import { Loader2, Sparkles, BookOpen, Brain, Zap, Cpu, Heart, RefreshCw } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default', 
  message = 'Loading...', 
  showMessage = true,
  className = '',
  icon = 'loader'
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      container: 'w-8 h-8',
      text: 'text-sm',
      spacing: 'space-y-2'
    },
    md: {
      icon: 'w-6 h-6',
      container: 'w-12 h-12',
      text: 'text-base',
      spacing: 'space-y-3'
    },
    lg: {
      icon: 'w-8 h-8',
      container: 'w-16 h-16',
      text: 'text-lg',
      spacing: 'space-y-4'
    },
    xl: {
      icon: 'w-12 h-12',
      container: 'w-20 h-20',
      text: 'text-xl',
      spacing: 'space-y-6'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-gray-700 dark:text-gray-300',
      animation: 'animate-spin'
    },
    primary: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      animation: 'animate-spin'
    },
    success: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      animation: 'animate-spin'
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      animation: 'animate-spin'
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      animation: 'animate-spin'
    },
    gradient: {
      bg: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-gray-700 dark:text-gray-300',
      animation: 'animate-pulse'
    },
    minimal: {
      bg: 'bg-transparent',
      iconColor: 'text-gray-600 dark:text-gray-400',
      textColor: 'text-gray-600 dark:text-gray-400',
      animation: 'animate-spin'
    }
  };

  // Icon mapping
  const iconMap = {
    loader: Loader2,
    sparkles: Sparkles,
    book: BookOpen,
    brain: Brain,
    zap: Zap,
    cpu: Cpu,
    heart: Heart,
    refresh: RefreshCw
  };

  const config = sizeConfig[size];
  const variantStyle = variantConfig[variant];
  const IconComponent = iconMap[icon] || Loader2;

  // Custom animations for specific icons
  const getIconAnimation = () => {
    switch (icon) {
      case 'sparkles':
        return 'animate-pulse';
      case 'heart':
        return 'animate-bounce';
      case 'zap':
        return 'animate-pulse';
      case 'brain':
        return 'animate-pulse';
      default:
        return variantStyle.animation;
    }
  };

  const Spinner = () => (
    <div className={`flex items-center justify-center ${config.container} ${variantStyle.bg} rounded-full`}>
      <IconComponent 
        className={`${config.icon} ${variantStyle.iconColor} ${getIconAnimation()}`}
        strokeWidth={2}
      />
    </div>
  );

  const InlineSpinner = () => (
    <IconComponent 
      className={`${config.icon} ${variantStyle.iconColor} ${getIconAnimation()}`}
      strokeWidth={2}
    />
  );

  // For inline usage (when showMessage is false and no additional styling)
  if (!showMessage && !className) {
    return <InlineSpinner />;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${config.spacing} ${className}`}>
      <Spinner />
      {showMessage && (
        <p className={`${config.text} ${variantStyle.textColor} font-medium text-center`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Specialized loading components for different contexts
export const AuthLoadingSpinner = ({ message = 'Authenticating...', provider }) => (
  <LoadingSpinner 
    variant="primary" 
    size="md" 
    message={message}
    icon="zap"
    className="py-2"
  />
);

export const ContentLoadingSpinner = ({ message = 'Generating content...', size = 'lg' }) => (
  <LoadingSpinner 
    variant="gradient" 
    size={size} 
    message={message}
    icon="brain"
    className="py-8"
  />
);

export const PageLoadingSpinner = ({ message = 'Loading page...', componentName }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner 
      variant="primary" 
      size="lg" 
      message={componentName ? `Loading ${componentName}...` : message}
      icon="loader"
      className="py-8"
    />
  </div>
);

export const ButtonLoadingSpinner = ({ size = 'sm' }) => (
  <LoadingSpinner 
    variant="minimal" 
    size={size} 
    showMessage={false}
    icon="loader"
  />
);

export const HistoryLoadingSpinner = ({ message = 'Loading history...', size = 'md' }) => (
  <LoadingSpinner 
    variant="default" 
    size={size} 
    message={message}
    icon="book"
    className="py-4"
  />
);

export const AppInitializationSpinner = ({ message = 'Initializing application...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center font-sans">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
      <h1 className="text-3xl font-extrabold mb-6">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">ECC</span> <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">App</span>
      </h1>
      <LoadingSpinner 
        variant="primary" 
        size="xl" 
        message={message}
        icon="sparkles"
        className="py-4"
      />
      <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
        Please wait while we prepare your experience
      </p>
    </div>
  </div>
);

export default LoadingSpinner;
