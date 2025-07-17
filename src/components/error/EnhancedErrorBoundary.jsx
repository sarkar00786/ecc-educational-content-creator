import React from 'react';
import { AlertTriangle, RefreshCw, Bug, Info } from 'lucide-react';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('🚨 Error Boundary Caught:', error);
    console.error('🚨 Error Info:', errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to monitoring service (if available)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name
          }
        }
      });
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  getErrorType = (error) => {
    if (!error) return 'unknown';
    
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('Maximum update depth exceeded')) {
      return 'infinite-loop';
    }
    
    if (errorMessage.includes('Cannot read property') || errorMessage.includes('Cannot read properties')) {
      return 'null-reference';
    }
    
    if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
      return 'network';
    }
    
    if (errorMessage.includes('ChunkLoadError') || errorMessage.includes('Loading chunk')) {
      return 'chunk-load';
    }
    
    return 'javascript';
  };

  getErrorDetails = (errorType, error) => {
    switch (errorType) {
      case 'infinite-loop':
        return {
          title: 'Infinite Loop Detected',
          description: 'A component is stuck in an infinite update loop. This usually happens when a useEffect or useState causes continuous re-renders.',
          icon: AlertTriangle,
          color: 'red',
          suggestions: [
            'Check useEffect dependencies for missing or incorrect values',
            'Ensure setState is not called directly in render functions',
            'Verify that object/array dependencies are properly memoized',
            'Check for circular references in component props'
          ]
        };
        
      case 'null-reference':
        return {
          title: 'Null Reference Error',
          description: 'The application tried to access a property or method on a null or undefined value.',
          icon: Bug,
          color: 'orange',
          suggestions: [
            'Check if data is loaded before accessing properties',
            'Use optional chaining (?.) or default values',
            'Verify API responses are properly structured',
            'Add loading states for asynchronous data'
          ]
        };
        
      case 'network':
        return {
          title: 'Network Error',
          description: 'Failed to communicate with the server. This might be a temporary connectivity issue.',
          icon: Info,
          color: 'blue',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Verify server is accessible',
            'Check for CORS issues in development'
          ]
        };
        
      case 'chunk-load':
        return {
          title: 'Resource Load Error',
          description: 'Failed to load application resources. This might happen after a deployment.',
          icon: RefreshCw,
          color: 'purple',
          suggestions: [
            'Refresh the page to load updated resources',
            'Clear browser cache and cookies',
            'Check for network connectivity',
            'Try in a different browser or incognito mode'
          ]
        };
        
      default:
        return {
          title: 'Application Error',
          description: 'An unexpected error occurred in the application.',
          icon: AlertTriangle,
          color: 'red',
          suggestions: [
            'Try refreshing the page',
            'Check browser console for more details',
            'Report this issue if it persists',
            'Try using a different browser'
          ]
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      const errorType = this.getErrorType(error);
      const errorDetails = this.getErrorDetails(errorType, error);
      
      const colorClasses = {
        red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
        orange: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
        blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
        purple: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200'
      };

      const buttonColorClasses = {
        red: 'bg-red-600 hover:bg-red-700 text-white',
        orange: 'bg-orange-600 hover:bg-orange-700 text-white',
        blue: 'bg-blue-600 hover:bg-blue-700 text-white',
        purple: 'bg-purple-600 hover:bg-purple-700 text-white'
      };

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className={`rounded-lg border-2 p-6 ${colorClasses[errorDetails.color]}`}>
              <div className="flex items-start space-x-4">
                <errorDetails.icon className="w-8 h-8 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{errorDetails.title}</h1>
                  <p className="text-sm mb-4">{errorDetails.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2">What you can try:</h3>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {errorDetails.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={this.handleRetry}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonColorClasses[errorDetails.color]} flex items-center space-x-2`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                    
                    <button
                      onClick={this.handleReload}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reload Page</span>
                    </button>
                  </div>

                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium mb-2">
                        Developer Information
                      </summary>
                      <div className="text-xs bg-black/10 dark:bg-white/10 p-3 rounded">
                        <div className="mb-2">
                          <strong>Error ID:</strong> {errorId}
                        </div>
                        <div className="mb-2">
                          <strong>Error Type:</strong> {errorType}
                        </div>
                        <div className="mb-2">
                          <strong>Error Message:</strong>
                          <pre className="whitespace-pre-wrap mt-1">{error?.message}</pre>
                        </div>
                        <div className="mb-2">
                          <strong>Stack Trace:</strong>
                          <pre className="whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">
                            {error?.stack}
                          </pre>
                        </div>
                        {errorInfo && (
                          <div>
                            <strong>Component Stack:</strong>
                            <pre className="whitespace-pre-wrap mt-1 max-h-40 overflow-y-auto">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
