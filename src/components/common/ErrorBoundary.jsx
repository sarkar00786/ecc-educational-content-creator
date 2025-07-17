import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { TriangleAlert } from 'lucide-react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <TriangleAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We're sorry, but something unexpected happened. Please try refreshing the page and check your internet connection.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            <strong>Still having issues?</strong>
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            If the problem persists after refreshing and checking your internet connection, please copy the below Development Report and contact our support team:
          </p>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a 
              href="mailto:azkabloch786@gmail.com" 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              azkabloch786@gmail.com
            </a>
          </div>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Development Report
            </summary>
            <div className="mb-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Please share the error details below when reporting this issue to: 
                <span className="font-medium text-blue-600 dark:text-blue-400">azkabloch786@gmail.com</span>
              </p>
            </div>
            <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-auto text-red-600 dark:text-red-400">
              {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            type="button"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-300"
            type="button"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

const logError = (error, errorInfo) => {
  console.error('Error Boundary caught an error:', error, errorInfo);
  
  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, {
    //   extra: errorInfo,
    //   tags: {
    //     component: 'ErrorBoundary'
    //   }
    // });
  }
};

const ErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
