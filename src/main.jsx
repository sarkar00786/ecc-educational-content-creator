import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializePerformanceOptimizations } from './utils/performanceOptimizer.js'
import { errorHandler } from './utils/enhancedErrorHandler.jsx'
import EnhancedErrorBoundary from './components/error/EnhancedErrorBoundary.jsx'

// Initialize performance optimizations
initializePerformanceOptimizations();

// Add global error listener
errorHandler.addErrorListener((error) => {
  console.log('Global error caught:', error);
});

// Register service worker for offline support
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
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EnhancedErrorBoundary>
      <App />
    </EnhancedErrorBoundary>
  </StrictMode>,
)
