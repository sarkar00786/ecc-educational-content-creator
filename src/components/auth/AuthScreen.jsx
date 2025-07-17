import React, { useState, useCallback } from 'react';
import { 
  signInWithGoogle 
} from '../../services/firebase';
import { handleError } from '../../utils/errorHandler';
import { measureAsync } from '../../utils/performanceMonitor';
import EmailAuthForm from './EmailAuthForm';
import { AuthLoadingSpinner, ButtonLoadingSpinner } from '../common/LoadingSpinner';

const AuthScreen = ({ onAuthSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [authMode, setAuthMode] = useState('social'); // 'social' or 'email'

  const handleSocialSignIn = useCallback(async (provider) => {
    setIsLoading(true);
    setLoadingProvider(provider);
    
    try {
      const user = await measureAsync(`auth_${provider}`, async () => {
        switch (provider) {
          case 'google':
            return await signInWithGoogle();
          default:
            throw new Error('Invalid provider');
        }
      }, { provider });
      
      onAuthSuccess(user);
    } catch (error) {
      const appError = handleError(error, `Social Auth: ${provider}`);
      onError(appError.message);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }, [onAuthSuccess, onError]);

  /**
   * Renders appropriate authentication interface based on current mode
   * Handles seamless switching between social and email authentication
   */
  if (authMode === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 font-sans animate-fade-in">
        <EmailAuthForm
          onAuthSuccess={onAuthSuccess}
          onError={onError}
          onBackToSocial={() => setAuthMode('social')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 text-center animate-slide-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">ECC</span> <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">App</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Choose your preferred sign-in method to continue
        </p>
        
        <div className="space-y-4">
          {/* Google Sign-In Button */}
          <button
            onClick={() => handleSocialSignIn('google')}
            disabled={isLoading}
            aria-label="Sign in with Google"
            className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loadingProvider === 'google' ? (
              <div className="mr-3">
                <ButtonLoadingSpinner size="sm" />
              </div>
            ) : (
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
            </div>
          </div>
          
          {/* Email Authentication Button */}
          <button
            onClick={() => setAuthMode('email')}
            disabled={isLoading}
            aria-label="Sign in with Email"
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            Continue with Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
