import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializePerformanceOptimizations } from './utils/performanceOptimizer.js'
import { errorHandler } from './utils/enhancedErrorHandler.jsx'
import EnhancedErrorBoundary from './components/error/EnhancedErrorBoundary.jsx'

// React duplicate issue fixed! ✅

// Initialize performance optimizations
initializePerformanceOptimizations();

// Add global error listener
errorHandler.addErrorListener((error) => {
  console.log('Global error caught:', error);
});

// Register service worker for offline support (disabled in dev)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Unregister any existing service workers in development
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Unregistering service worker in development');
      registration.unregister();
    }
  }).catch(error => {
    console.log('Failed to unregister service workers:', error);
  });
}

const container = document.getElementById('root');
const root = createRoot(container);

// Temporarily remove StrictMode to prevent React hook duplication issues
root.render(
  <App />
);
