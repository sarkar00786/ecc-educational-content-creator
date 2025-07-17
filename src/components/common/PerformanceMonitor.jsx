import React, { useState, useEffect, useCallback } from 'react';
import { X, Activity, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const PerformanceMonitor = ({ enabled = false, onClose }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [componentStats, setComponentStats] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    // Monitor component re-renders
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          setRenderCount(prev => prev + 1);
          
          // Track performance data
          const now = Date.now();
          setPerformanceData(prev => {
            const newData = [...prev, { timestamp: now, type: 'render' }];
            // Keep only last 100 entries
            return newData.slice(-100);
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Monitor React component updates
    const originalError = console.error;
    console.error = (...args) => {
      const errorStr = args.join(' ');
      if (errorStr.includes('Warning: Each child in a list should have a unique "key" prop') ||
          errorStr.includes('Warning: validateDOMNesting')) {
        setComponentStats(prev => ({
          ...prev,
          warnings: (prev.warnings || 0) + 1
        }));
      }
      originalError.apply(console, args);
    };

    return () => {
      observer.disconnect();
      console.error = originalError;
    };
  }, [enabled]);

  const getPerformanceScore = useCallback(() => {
    const recentRenders = performanceData.filter(
      entry => Date.now() - entry.timestamp < 5000 // Last 5 seconds
    ).length;
    
    if (recentRenders < 5) return { score: 'good', color: 'text-green-600' };
    if (recentRenders < 15) return { score: 'warning', color: 'text-yellow-600' };
    return { score: 'poor', color: 'text-red-600' };
  }, [performanceData]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!enabled) return null;

  const performanceScore = getPerformanceScore();

  return (
    <>
      {/* Performance Monitor Button */}
      <button
        onClick={toggleVisibility}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-colors ${
          performanceScore.score === 'good' ? 'bg-green-500 hover:bg-green-600' :
          performanceScore.score === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
          'bg-red-500 hover:bg-red-600'
        } text-white`}
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed top-20 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Performance Monitor
            </h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Performance Score */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                {performanceScore.score === 'good' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : performanceScore.score === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className="text-sm font-medium">Performance</span>
              </div>
              <span className={`text-sm font-bold ${performanceScore.color}`}>
                {performanceScore.score.toUpperCase()}
              </span>
            </div>

            {/* Render Count */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium">Total Renders</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {renderCount}
              </span>
            </div>

            {/* Recent Activity */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Recent Activity (5s)
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {performanceData.filter(entry => Date.now() - entry.timestamp < 5000).length} renders
              </div>
            </div>

            {/* Component Stats */}
            {Object.keys(componentStats).length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Component Issues
                </h4>
                {Object.entries(componentStats).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                    <span className="text-red-600 dark:text-red-400">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Performance Tips */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Tips for Better Performance
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Use React.memo for expensive components</li>
                <li>• Optimize useEffect dependencies</li>
                <li>• Minimize inline object/function creation</li>
                <li>• Use useMemo for expensive calculations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;
