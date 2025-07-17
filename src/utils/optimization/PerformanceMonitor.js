// Performance Monitoring System
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      chatLoadTime: [],
      messageResponseTime: [],
      dbQueryTime: [],
      cacheHitRate: 0,
      memoryUsage: [],
      errorRate: 0,
      userSatisfactionScore: 0,
      contentGenerationTime: [],
      apiCalls: [],
      userInteractions: [],
      pageViews: []
    };
    
    this.thresholds = {
      chatLoadTime: 2000, // 2 seconds
      messageResponseTime: 5000, // 5 seconds
      dbQueryTime: 1000, // 1 second
      cacheHitRate: 0.8, // 80%
      memoryUsage: 100, // 100MB
      errorRate: 0.05, // 5%
      contentGenerationTime: 10000, // 10 seconds
      apiResponseTime: 3000 // 3 seconds
    };
    
    this.listeners = new Set();
    this.startTime = performance.now();
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObserver();
    this.startPerformanceTracking();
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start continuous performance tracking
  startPerformanceTracking() {
    // Track memory usage every 30 seconds
    setInterval(() => {
      this.trackMemoryUsage();
    }, 30000);

    // Track page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.recordMetric('pageVisibility', document.hidden ? 'hidden' : 'visible');
      });
    }
  }

  // Setup performance observer for Core Web Vitals
  setupPerformanceObserver() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          this.recordMetric('CLS', entry.value);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Record performance metrics
  recordMetric(name, value, metadata = {}) {
    const timestamp = Date.now();
    const metric = {
      name,
      value,
      timestamp,
      metadata
    };

    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }

    this.metrics[name].push(metric);
    
    // Keep only last 100 entries for each metric
    if (this.metrics[name].length > 100) {
      this.metrics[name] = this.metrics[name].slice(-100);
    }

    // Check thresholds and alert if necessary
    this.checkThresholds(name, value);
    
    // Notify listeners
    this.notifyListeners(name, metric);
  }

  // Measure chat loading performance
  async measureChatLoad(chatId, loadFunction) {
    const startTime = performance.now();
    
    try {
      const result = await loadFunction();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      this.recordMetric('chatLoadTime', loadTime, { chatId });
      
      return result;
    } catch (error) {
      this.recordMetric('chatLoadError', 1, { chatId, error: error.message });
      throw error;
    }
  }

  // Measure message response time
  async measureMessageResponse(messageText, responseFunction) {
    const startTime = performance.now();
    
    try {
      const result = await responseFunction();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordMetric('messageResponseTime', responseTime, {
        messageLength: messageText.length,
        responseLength: result?.length || 0
      });
      
      return result;
    } catch (error) {
      this.recordMetric('messageResponseError', 1, { 
        messageLength: messageText.length,
        error: error.message 
      });
      throw error;
    }
  }

  // Measure database query performance
  async measureDbQuery(queryName, queryFunction) {
    const startTime = performance.now();
    
    try {
      const result = await queryFunction();
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      this.recordMetric('dbQueryTime', queryTime, { queryName });
      
      return result;
    } catch (error) {
      this.recordMetric('dbQueryError', 1, { queryName, error: error.message });
      throw error;
    }
  }

  // Memory usage tracking
  trackMemoryUsage() {
    if (typeof window === 'undefined' || !window.performance.memory) return;

    const memory = window.performance.memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    
    this.recordMetric('memoryUsage', usedMB);
    
    // Alert if memory usage is high
    if (usedMB > this.thresholds.memoryUsage) {
      console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
    }
  }

  // Track content generation performance
  async measureContentGeneration(payload, generationFunction) {
    const startTime = performance.now();
    
    try {
      const result = await generationFunction();
      const endTime = performance.now();
      const generationTime = endTime - startTime;
      
      this.recordMetric('contentGenerationTime', generationTime, {
        payloadSize: JSON.stringify(payload).length,
        contentLength: result?.length || 0,
        requestType: payload.requestType || 'unknown'
      });
      
      return result;
    } catch (error) {
      this.recordMetric('contentGenerationError', 1, { 
        payloadSize: JSON.stringify(payload).length,
        error: error.message,
        requestType: payload.requestType || 'unknown'
      });
      throw error;
    }
  }

  // Track API call performance
  async measureApiCall(url, method, payload, apiFunction) {
    const startTime = performance.now();
    
    try {
      const result = await apiFunction();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordMetric('apiCalls', responseTime, {
        url,
        method,
        payloadSize: payload ? JSON.stringify(payload).length : 0,
        responseSize: result ? JSON.stringify(result).length : 0,
        success: true
      });
      
      return result;
    } catch (error) {
      this.recordMetric('apiCalls', -1, {
        url,
        method,
        payloadSize: payload ? JSON.stringify(payload).length : 0,
        error: error.message,
        success: false
      });
      throw error;
    }
  }

  // Track user interactions
  recordUserInteraction(interactionType, details = {}) {
    this.recordMetric('userInteractions', 1, {
      type: interactionType,
      timestamp: Date.now(),
      ...details
    });
  }

  // Track page views
  recordPageView(page, metadata = {}) {
    this.recordMetric('pageViews', 1, {
      page,
      timestamp: Date.now(),
      ...metadata
    });
  }

  // User satisfaction tracking
  recordUserSatisfaction(score, context = {}) {
    this.recordMetric('userSatisfaction', score, context);
    
    // Update overall satisfaction score (rolling average)
    const recentScores = this.metrics.userSatisfaction.slice(-20);
    const averageScore = recentScores.reduce((sum, m) => sum + m.value, 0) / recentScores.length;
    this.metrics.userSatisfactionScore = averageScore;
  }

  // Error rate tracking
  recordError(error, context = {}) {
    this.recordMetric('error', 1, { 
      message: error.message,
      stack: error.stack,
      ...context 
    });
    
    // Calculate error rate over last 100 operations
    const recentErrors = this.metrics.error?.slice(-100) || [];
    this.metrics.errorRate = recentErrors.length / 100;
  }

  // Check performance thresholds
  checkThresholds(metricName, value) {
    const threshold = this.thresholds[metricName];
    if (!threshold) return;

    if (value > threshold) {
      console.warn(`Performance threshold exceeded for ${metricName}: ${value} > ${threshold}`);
      
      // Trigger optimization suggestions
      this.triggerOptimizationSuggestions(metricName, value);
    }
  }

  // Optimization suggestions based on metrics
  triggerOptimizationSuggestions(metricName, value) {
    const suggestions = {
      chatLoadTime: [
        'Consider enabling chat pagination',
        'Implement lazy loading for chat history',
        'Use database indexing for faster queries'
      ],
      messageResponseTime: [
        'Enable context compression',
        'Implement response caching',
        'Consider using streaming responses'
      ],
      dbQueryTime: [
        'Add database indexes',
        'Implement query result caching',
        'Consider query optimization'
      ],
      memoryUsage: [
        'Clear old cached data',
        'Implement memory cleanup routines',
        'Reduce context window size'
      ]
    };

    if (suggestions[metricName]) {
      console.log(`Optimization suggestions for ${metricName}:`, suggestions[metricName]);
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {};
    
    for (const [key, values] of Object.entries(this.metrics)) {
      if (Array.isArray(values) && values.length > 0) {
        const recentValues = values.slice(-20).map(v => v.value);
        summary[key] = {
          current: recentValues[recentValues.length - 1],
          average: recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length,
          min: Math.min(...recentValues),
          max: Math.max(...recentValues),
          count: values.length
        };
      } else {
        summary[key] = values;
      }
    }
    
    return summary;
  }

  // Performance optimization recommendations
  getOptimizationRecommendations() {
    const recommendations = [];
    const summary = this.getPerformanceSummary();

    // Chat load time recommendations
    if (summary.chatLoadTime?.average > this.thresholds.chatLoadTime) {
      recommendations.push({
        type: 'chat-loading',
        priority: 'high',
        message: 'Chat loading is slow. Consider implementing pagination or lazy loading.',
        impact: 'user-experience'
      });
    }

    // Message response time recommendations
    if (summary.messageResponseTime?.average > this.thresholds.messageResponseTime) {
      recommendations.push({
        type: 'message-response',
        priority: 'high',
        message: 'AI response times are slow. Consider context optimization or caching.',
        impact: 'user-experience'
      });
    }

    // Database performance recommendations
    if (summary.dbQueryTime?.average > this.thresholds.dbQueryTime) {
      recommendations.push({
        type: 'database',
        priority: 'medium',
        message: 'Database queries are slow. Consider adding indexes or caching.',
        impact: 'performance'
      });
    }

    // Memory usage recommendations
    if (summary.memoryUsage?.current > this.thresholds.memoryUsage) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'High memory usage detected. Consider cleanup routines.',
        impact: 'stability'
      });
    }

    // Error rate recommendations
    if (this.metrics.errorRate > this.thresholds.errorRate) {
      recommendations.push({
        type: 'error-handling',
        priority: 'high',
        message: 'High error rate detected. Review error handling and validation.',
        impact: 'reliability'
      });
    }

    return recommendations;
  }

  // Add performance listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove performance listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify listeners of metric updates
  notifyListeners(metricName, metric) {
    this.listeners.forEach(callback => {
      try {
        callback(metricName, metric);
      } catch (error) {
        console.error('Error in performance listener:', error);
      }
    });
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      thresholds: this.thresholds,
      summary: this.getPerformanceSummary(),
      recommendations: this.getOptimizationRecommendations(),
      sessionDuration: performance.now() - this.startTime
    };
  }

  // Start continuous monitoring
  startMonitoring(interval = 30000) {
    this.monitoringInterval = setInterval(() => {
      this.trackMemoryUsage();
      
      // Trigger cleanup if needed
      if (this.metrics.memoryUsage.length > 100) {
        this.performCleanup();
      }
    }, interval);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Performance cleanup
  performCleanup() {
    // Clear old metrics
    for (const key in this.metrics) {
      if (Array.isArray(this.metrics[key])) {
        this.metrics[key] = this.metrics[key].slice(-50);
      }
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}
