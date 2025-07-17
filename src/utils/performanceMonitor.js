/**
 * Performance Monitor Utility
 * Tracks and measures application performance metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      api: 5000,      // 5 seconds
      database: 3000,  // 3 seconds
      render: 1000,    // 1 second
      navigation: 500  // 0.5 seconds
    };
    this.observers = [];
  }

  // Start timing an operation
  startTiming(key, metadata = {}) {
    this.metrics.set(key, {
      startTime: performance.now(),
      metadata,
      status: 'running'
    });
  }

  // End timing and calculate duration
  endTiming(key, success = true, additionalData = {}) {
    const metric = this.metrics.get(key);
    if (!metric) {
      console.warn(`Performance metric '${key}' not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const result = {
      key,
      duration: Math.round(duration),
      success,
      timestamp: new Date().toISOString(),
      ...metric.metadata,
      ...additionalData
    };

    // Update metric
    this.metrics.set(key, {
      ...metric,
      endTime,
      duration,
      success,
      status: 'completed'
    });

    // Check if duration exceeds threshold
    const threshold = this.getThreshold(key);
    if (duration > threshold) {
      console.warn(`Performance warning: ${key} took ${duration}ms (threshold: ${threshold}ms)`);
      this.notifyObservers('slow_operation', result);
    }

    return result;
  }

  // Get threshold for a metric key
  getThreshold(key) {
    for (const [type, threshold] of Object.entries(this.thresholds)) {
      if (key.includes(type)) {
        return threshold;
      }
    }
    return 10000; // Default 10 seconds
  }

  // Measure a function execution time
  async measureFunction(key, fn, metadata = {}) {
    this.startTiming(key, metadata);
    try {
      const result = await fn();
      this.endTiming(key, true, { result: 'success' });
      return result;
    } catch (error) {
      this.endTiming(key, false, { error: error.message });
      throw error;
    }
  }

  // Measure API call performance
  async measureApiCall(url, options = {}) {
    const key = `api_${url.split('/').pop()}`;
    this.startTiming(key, { url, method: options.method || 'GET' });
    
    try {
      const response = await fetch(url, options);
      const success = response.ok;
      this.endTiming(key, success, { 
        status: response.status,
        statusText: response.statusText 
      });
      return response;
    } catch (error) {
      this.endTiming(key, false, { error: error.message });
      throw error;
    }
  }

  // Measure database operation performance
  async measureDatabaseOperation(operation, fn, metadata = {}) {
    const key = `database_${operation}`;
    return this.measureFunction(key, fn, metadata);
  }

  // Measure component render time
  measureRender(componentName, renderFn) {
    const key = `render_${componentName}`;
    this.startTiming(key, { component: componentName });
    
    try {
      const result = renderFn();
      this.endTiming(key, true);
      return result;
    } catch (error) {
      this.endTiming(key, false, { error: error.message });
      throw error;
    }
  }

  // Get all metrics
  getAllMetrics() {
    return Array.from(this.metrics.entries()).map(([key, metric]) => ({
      key,
      ...metric
    }));
  }

  // Get metrics by type
  getMetricsByType(type) {
    return this.getAllMetrics().filter(metric => metric.key.includes(type));
  }

  // Get slow operations
  getSlowOperations() {
    return this.getAllMetrics().filter(metric => {
      const threshold = this.getThreshold(metric.key);
      return metric.duration > threshold;
    });
  }

  // Calculate average performance
  getAveragePerformance(type = null) {
    const metrics = type ? this.getMetricsByType(type) : this.getAllMetrics();
    const completed = metrics.filter(m => m.status === 'completed');
    
    if (completed.length === 0) return 0;
    
    const total = completed.reduce((sum, metric) => sum + metric.duration, 0);
    return Math.round(total / completed.length);
  }

  // Get performance summary
  getPerformanceSummary() {
    const all = this.getAllMetrics();
    const completed = all.filter(m => m.status === 'completed');
    const successful = completed.filter(m => m.success);
    const failed = completed.filter(m => !m.success);
    const slow = this.getSlowOperations();

    return {
      total: all.length,
      completed: completed.length,
      successful: successful.length,
      failed: failed.length,
      slow: slow.length,
      averageResponseTime: this.getAveragePerformance(),
      successRate: completed.length > 0 ? Math.round((successful.length / completed.length) * 100) : 0,
      slowOperationRate: completed.length > 0 ? Math.round((slow.length / completed.length) * 100) : 0
    };
  }

  // Clear old metrics
  clearMetrics(olderThan = 300000) { // 5 minutes
    const now = Date.now();
    for (const [key, metric] of this.metrics.entries()) {
      if (now - metric.startTime > olderThan) {
        this.metrics.delete(key);
      }
    }
  }

  // Add observer for performance events
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Remove observer
  removeObserver(callback) {
    this.observers = this.observers.filter(observer => observer !== callback);
  }

  // Notify all observers
  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      try {
        observer(event, data);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  // Monitor page load performance
  monitorPageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint()
        };

        this.notifyObservers('page_load', metrics);
        return metrics;
      }
    }
    return null;
  }

  // Get First Paint time
  getFirstPaint() {
    if (typeof window !== 'undefined' && window.performance) {
      const paintEntries = window.performance.getEntriesByType('paint');
      const fp = paintEntries.find(entry => entry.name === 'first-paint');
      return fp ? fp.startTime : null;
    }
    return null;
  }

  // Get First Contentful Paint time
  getFirstContentfulPaint() {
    if (typeof window !== 'undefined' && window.performance) {
      const paintEntries = window.performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : null;
    }
    return null;
  }

  // Monitor memory usage
  getMemoryUsage() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      return {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
        memoryUsagePercentage: Math.round((window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit) * 100)
      };
    }
    return null;
  }

  // Generate performance report
  generateReport() {
    const summary = this.getPerformanceSummary();
    const slowOps = this.getSlowOperations();
    const memory = this.getMemoryUsage();
    const pageLoad = this.monitorPageLoad();

    return {
      timestamp: new Date().toISOString(),
      summary,
      slowOperations: slowOps.slice(0, 10), // Top 10 slow operations
      memoryUsage: memory,
      pageLoadMetrics: pageLoad,
      recommendations: this.getRecommendations(summary, slowOps)
    };
  }

  // Get performance recommendations
  getRecommendations(summary, slowOps) {
    const recommendations = [];

    if (summary.successRate < 95) {
      recommendations.push({
        type: 'reliability',
        message: 'Success rate is below 95%. Consider improving error handling and retry logic.',
        priority: 'high'
      });
    }

    if (summary.slowOperationRate > 20) {
      recommendations.push({
        type: 'performance',
        message: 'More than 20% of operations are slow. Consider optimization.',
        priority: 'medium'
      });
    }

    if (summary.averageResponseTime > 3000) {
      recommendations.push({
        type: 'performance',
        message: 'Average response time is above 3 seconds. Consider caching and optimization.',
        priority: 'high'
      });
    }

    if (slowOps.some(op => op.key.includes('database'))) {
      recommendations.push({
        type: 'database',
        message: 'Database operations are slow. Consider query optimization and indexing.',
        priority: 'medium'
      });
    }

    if (slowOps.some(op => op.key.includes('api'))) {
      recommendations.push({
        type: 'api',
        message: 'API calls are slow. Consider caching, compression, and request optimization.',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions
export const measureAsync = async (key, fn, metadata = {}) => {
  return performanceMonitor.measureFunction(key, fn, metadata);
};

export const measureApiCall = async (url, options = {}) => {
  return performanceMonitor.measureApiCall(url, options);
};

export const measureDatabaseOp = async (operation, fn, metadata = {}) => {
  return performanceMonitor.measureDatabaseOperation(operation, fn, metadata);
};

export const getPerformanceReport = () => {
  return performanceMonitor.generateReport();
};

export default performanceMonitor;
