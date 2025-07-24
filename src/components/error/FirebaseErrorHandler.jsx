import React from 'react';
import { AlertCircle, RefreshCw, Shield, Wifi, Database } from 'lucide-react';

const FirebaseErrorHandler = ({ 
  error, 
  onRetry, 
  onAuthRefresh,
  showDetails = false,
  className = "" 
}) => {
  const getErrorInfo = (error) => {
    if (!error) return null;

    const errorCode = error.code || error.message;
    const errorMessage = error.message || error.toString();

    // Firebase permission errors
    if (errorCode.includes('permission-denied') || errorCode.includes('insufficient permissions')) {
      return {
        type: 'permission',
        title: 'Permission Denied',
        message: 'You don\'t have permission to access this resource. Please ensure you\'re logged in with the correct account.',
        icon: Shield,
        color: 'red',
        suggestions: [
          'Check if you\'re logged in with the correct account',
          'Verify your account has the necessary permissions',
          'Try refreshing your authentication',
          'Contact support if the issue persists'
        ]
      };
    }

    // Network/connection errors
    if (errorCode.includes('network') || errorCode.includes('offline') || errorCode.includes('timeout')) {
      return {
        type: 'network',
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        icon: Wifi,
        color: 'orange',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable any VPN or proxy',
          'Try again in a few moments'
        ]
      };
    }

    // Firestore specific errors
    if (errorCode.includes('firestore') || errorCode.includes('cancelled') || errorCode.includes('unavailable')) {
      return {
        type: 'firestore',
        title: 'Database Error',
        message: 'There was an issue connecting to the database. This might be temporary.',
        icon: Database,
        color: 'blue',
        suggestions: [
          'Try refreshing the page',
          'Check if the service is experiencing issues',
          'Try again in a few moments',
          'Contact support if the issue persists'
        ]
      };
    }

    // Authentication errors
    if (errorCode.includes('auth') || errorCode.includes('unauthenticated') || errorCode.includes('token')) {
      return {
        type: 'auth',
        title: 'Authentication Error',
        message: 'Your authentication session has expired or is invalid.',
        icon: Shield,
        color: 'yellow',
        suggestions: [
          'Try logging out and logging back in',
          'Clear your browser cache and cookies',
          'Check if your account is still active',
          'Contact support if needed'
        ]
      };
    }

    // Generic error
    return {
      type: 'generic',
      title: 'An Error Occurred',
      message: errorMessage,
      icon: AlertCircle,
      color: 'red',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the issue persists'
      ]
    };
  };

  const errorInfo = getErrorInfo(error);

  if (!errorInfo) return null;

  const { type, title, message, icon: Icon, color, suggestions } = errorInfo;

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    orange: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
  };

  const buttonColorClasses = {
    red: 'bg-red-600 hover:bg-red-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className="w-6 h-6 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm mb-4">{message}</p>
          
          {showDetails && error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Technical Details
              </summary>
              <pre className="text-xs bg-black/10 dark:bg-white/10 p-2 rounded overflow-x-auto">
                {error.stack || error.message || error.toString()}
              </pre>
            </details>
          )}

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
            <ul className="text-sm list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonColorClasses[color]} flex items-center space-x-2`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
            
            {(type === 'permission' || type === 'auth') && onAuthRefresh && (
              <button
                onClick={onAuthRefresh}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonColorClasses[color]} flex items-center space-x-2`}
              >
                <Shield className="w-4 h-4" />
                <span>Refresh Authentication</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseErrorHandler;
