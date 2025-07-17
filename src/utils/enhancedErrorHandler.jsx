/**
 * Enhanced Error Handler Utility
 * Provides comprehensive error handling, recovery, and monitoring
 */

import React from 'react';
import { AppError, ErrorTypes } from './errorHandler';

export class EnhancedErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.errorStats = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.errorListeners = [];
    this.criticalErrorThreshold = 5;
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, 'unhandled-promise');
      event.preventDefault();
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.handleError(event.error, 'javascript-error');
    });

    // Handle network status changes
    window.addEventListener('online', () => {
      this.retryQueuedErrors();
    });

    window.addEventListener('offline', () => {
      this.handleOfflineState();
    });
  }

  handleError(error, context = '', options = {}) {
    const enhancedError = this.enhanceError(error, context, options);
    
    // Update error statistics
    this.updateErrorStats(enhancedError);
    
    // Add to error queue
    this.errorQueue.push(enhancedError);
    
    // Trim queue if too large
    if (this.errorQueue.length > 100) {
      this.errorQueue.shift();
    }
    
    // Notify listeners
    this.notifyListeners(enhancedError);
    
    // Check for critical error patterns
    this.checkCriticalErrors(enhancedError);
    
    // Attempt automatic recovery
    this.attemptRecovery(enhancedError, options);
    
    return enhancedError;
  }

  enhanceError(error, context, options) {
    const enhanced = error instanceof AppError ? error : new AppError(
      error.message || 'Unknown error occurred',
      ErrorTypes.GENERAL,
      'UNKNOWN'
    );

    // Add enhanced properties
    enhanced.context = context;
    enhanced.sessionId = this.getSessionId();
    enhanced.userId = options.userId || null;
    enhanced.component = options.component || null;
    enhanced.action = options.action || null;
    enhanced.severity = this.calculateSeverity(enhanced);
    enhanced.recoverable = this.isRecoverable(enhanced);
    enhanced.timestamp = new Date().toISOString();
    enhanced.userAgent = navigator.userAgent;
    enhanced.url = window.location.href;
    enhanced.stack = error.stack;

    return enhanced;
  }

  calculateSeverity(error) {
    // Critical errors that break core functionality
    if (error.type === ErrorTypes.AUTHENTICATION || 
        error.type === ErrorTypes.FIRESTORE ||
        error.code === 'NETWORK_ERROR') {
      return 'HIGH';
    }
    
    // Validation errors and API errors
    if (error.type === ErrorTypes.VALIDATION || 
        error.type === ErrorTypes.API) {
      return 'MEDIUM';
    }
    
    // General errors
    return 'LOW';
  }

  isRecoverable(error) {
    const recoverableErrors = [
      'NETWORK_ERROR',
      'API_500',
      'API_502',
      'API_503',
      'firestore/unavailable',
      'firestore/resource-exhausted'
    ];
    
    return recoverableErrors.includes(error.code);
  }

  updateErrorStats(error) {
    const key = `${error.type}-${error.code}`;
    const current = this.errorStats.get(key) || { count: 0, lastOccurrence: null };
    
    this.errorStats.set(key, {
      count: current.count + 1,
      lastOccurrence: new Date().toISOString(),
      error: error
    });
  }

  checkCriticalErrors(error) {
    const key = `${error.type}-${error.code}`;
    const stats = this.errorStats.get(key);
    
    if (stats && stats.count >= this.criticalErrorThreshold) {
      console.warn(`Critical error pattern detected: ${key} occurred ${stats.count} times`);
      
      // Notify monitoring service
      this.reportCriticalError(error, stats);
      
      // Could trigger additional recovery mechanisms
      this.handleCriticalError(error, stats);
    }
  }

  async attemptRecovery(error, options) {
    if (!error.recoverable) {
      return false;
    }

    const retryKey = `${error.type}-${error.code}-${error.context}`;
    const attempts = this.retryAttempts.get(retryKey) || 0;
    
    if (attempts >= this.maxRetries) {
      console.error(`Max retry attempts reached for ${retryKey}`);
      return false;
    }

    // Increment retry count
    this.retryAttempts.set(retryKey, attempts + 1);
    
    // Calculate delay with exponential backoff
    const delay = this.retryDelay * Math.pow(2, attempts);
    
    console.log(`Attempting recovery for ${retryKey}, attempt ${attempts + 1} in ${delay}ms`);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Try to recover based on error type
    switch (error.type) {
      case ErrorTypes.NETWORK:
        return this.recoverFromNetworkError(error, options);
      
      case ErrorTypes.FIRESTORE:
        return this.recoverFromFirestoreError(error, options);
      
      case ErrorTypes.API:
        return this.recoverFromAPIError(error, options);
      
      default:
        return false;
    }
  }

  async recoverFromNetworkError(error, options) {
    // Check if we're back online
    if (!navigator.onLine) {
      return false;
    }

    // Try to retry the original operation
    if (options.retryFunction) {
      try {
        await options.retryFunction();
        console.log(`Network error recovery successful for ${error.context}`);
        return true;
      } catch (retryError) {
        console.error(`Network error recovery failed for ${error.context}:`, retryError);
        return false;
      }
    }

    return false;
  }

  async recoverFromFirestoreError(error, options) {
    // For certain Firestore errors, we can try again
    if (error.code === 'firestore/unavailable' || 
        error.code === 'firestore/resource-exhausted') {
      
      if (options.retryFunction) {
        try {
          await options.retryFunction();
          console.log(`Firestore error recovery successful for ${error.context}`);
          return true;
        } catch (retryError) {
          console.error(`Firestore error recovery failed for ${error.context}:`, retryError);
          return false;
        }
      }
    }

    return false;
  }

  async recoverFromAPIError(error, options) {
    // For server errors, we can try again
    if (error.code === 'API_500' || 
        error.code === 'API_502' || 
        error.code === 'API_503') {
      
      if (options.retryFunction) {
        try {
          await options.retryFunction();
          console.log(`API error recovery successful for ${error.context}`);
          return true;
        } catch (retryError) {
          console.error(`API error recovery failed for ${error.context}:`, retryError);
          return false;
        }
      }
    }

    return false;
  }

  retryQueuedErrors() {
    console.log('Network connection restored, retrying queued errors...');
    
    // Filter errors that can be retried
    const retryableErrors = this.errorQueue.filter(error => 
      error.recoverable && error.type === ErrorTypes.NETWORK
    );

    retryableErrors.forEach(error => {
      this.attemptRecovery(error, { retryFunction: null });
    });
  }

  handleOfflineState() {
    console.log('Device went offline, error handling adjusted for offline mode');
    
    // Clear retry attempts for network errors
    for (const [key, attempts] of this.retryAttempts.entries()) {
      if (key.includes('network')) {
        this.retryAttempts.delete(key);
      }
    }
  }

  handleCriticalError(error, stats) {
    // Could implement circuit breaker pattern
    console.warn(`Implementing circuit breaker for ${error.type}-${error.code}`);
    
    // Could disable certain features temporarily
    this.temporarilyDisableFeature(error.context);
    
    // Could show user a maintenance message
    this.showMaintenanceMessage(error);
  }

  temporarilyDisableFeature(context) {
    // Implementation would depend on app architecture
    console.log(`Temporarily disabling feature: ${context}`);
  }

  showMaintenanceMessage(error) {
    // Implementation would show user-friendly message
    console.log(`Showing maintenance message for: ${error.type}`);
  }

  reportCriticalError(error, stats) {
    const report = {
      timestamp: new Date().toISOString(),
      errorType: error.type,
      errorCode: error.code,
      context: error.context,
      occurrences: stats.count,
      severity: error.severity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    // Send to monitoring service
    console.log('Critical error report:', report);
    
    // Could send to external monitoring service
    // this.sendToMonitoringService(report);
  }

  getSessionId() {
    // Simple session ID generation
    if (!this.sessionId) {
      this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    return this.sessionId;
  }

  addErrorListener(listener) {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener) {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  notifyListeners(error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  getErrorStats() {
    return {
      totalErrors: this.errorQueue.length,
      errorsByType: this.groupErrorsByType(),
      recentErrors: this.getRecentErrors(),
      criticalErrors: this.getCriticalErrors(),
      retryStats: this.getRetryStats()
    };
  }

  groupErrorsByType() {
    const groups = {};
    this.errorQueue.forEach(error => {
      const key = error.type;
      groups[key] = (groups[key] || 0) + 1;
    });
    return groups;
  }

  getRecentErrors(minutes = 5) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errorQueue.filter(error => 
      new Date(error.timestamp) > cutoff
    );
  }

  getCriticalErrors() {
    return this.errorQueue.filter(error => 
      error.severity === 'HIGH'
    );
  }

  getRetryStats() {
    const stats = {};
    for (const [key, attempts] of this.retryAttempts.entries()) {
      stats[key] = attempts;
    }
    return stats;
  }

  clearErrorQueue() {
    this.errorQueue = [];
    this.errorStats.clear();
    this.retryAttempts.clear();
  }

  exportErrorLog() {
    const log = {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      errors: this.errorQueue,
      stats: this.getErrorStats()
    };

    // Convert to JSON and create downloadable file
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const errorHandler = new EnhancedErrorHandler();

// Enhanced error boundary for React components
export class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const enhancedError = errorHandler.handleError(error, 'react-component', {
      component: this.props.componentName || 'Unknown',
      errorInfo: errorInfo
    });

    this.setState({
      error: enhancedError,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      return (
        <div className="error-boundary min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
                <p className="text-sm text-gray-500">An error occurred while loading this component</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{this.state.error?.message}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for error handling
export const withErrorHandling = (WrappedComponent, componentName) => {
  return function ErrorHandledComponent(props) {
    return (
      <EnhancedErrorBoundary componentName={componentName}>
        <WrappedComponent {...props} />
      </EnhancedErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, context, options) => {
    return errorHandler.handleError(error, context, options);
  }, []);

  const clearErrors = React.useCallback(() => {
    errorHandler.clearErrorQueue();
  }, []);

  const getErrorStats = React.useCallback(() => {
    return errorHandler.getErrorStats();
  }, []);

  return {
    handleError,
    clearErrors,
    getErrorStats,
    errorHandler
  };
};

export default {
  EnhancedErrorHandler,
  errorHandler,
  EnhancedErrorBoundary,
  withErrorHandling,
  useErrorHandler
};
