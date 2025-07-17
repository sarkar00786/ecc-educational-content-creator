import React, { useState, useEffect } from 'react';

// Chat Performance Analytics
class ChatAnalytics {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      totalTokens: 0,
      averageResponseTime: 0,
      messageCount: 0,
      contextCompressions: 0,
      errors: 0,
      rateLimitHits: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalContentGenerated: 0,
      userSatisfactionScores: []
    };
    
    this.responseTimes = [];
    this.errorTypes = {};
    this.startTime = Date.now();
    this.sessionMetrics = {
      chatsSessions: 0,
      activeTime: 0,
      idleTime: 0,
      lastActivity: Date.now()
    };
  }

  // Track API call performance
  trackAPICall(tokens, responseTime, compressed = false) {
    this.metrics.apiCalls++;
    this.metrics.totalTokens += tokens;
    this.metrics.messageCount++;
    
    if (compressed) {
      this.metrics.contextCompressions++;
    }
    
    this.responseTimes.push(responseTime);
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  // Track errors
  trackError(type = 'general') {
    this.metrics.errors++;
    console.warn(`Chat error tracked: ${type}`);
  }

  // Track rate limiting
  trackRateLimit() {
    this.metrics.rateLimitHits++;
  }

  // Track successful API calls
  trackSuccessfulRequest(tokens, responseTime, contentLength) {
    this.metrics.successfulRequests++;
    this.metrics.totalContentGenerated += contentLength;
    this.trackAPICall(tokens, responseTime);
    this.sessionMetrics.lastActivity = Date.now();
  }

  // Track failed API calls
  trackFailedRequest(errorType, errorMessage) {
    this.metrics.failedRequests++;
    this.errorTypes[errorType] = (this.errorTypes[errorType] || 0) + 1;
    this.trackError(errorType);
  }

  // Track user satisfaction
  trackUserSatisfaction(score, context = {}) {
    this.metrics.userSatisfactionScores.push({
      score,
      timestamp: Date.now(),
      context
    });
  }

  // Track chat session
  trackChatSession(sessionType = 'general') {
    this.sessionMetrics.chatsSessions++;
    this.sessionMetrics.lastActivity = Date.now();
  }

  // Get detailed error analysis
  getErrorAnalysis() {
    const totalErrors = Object.values(this.errorTypes).reduce((sum, count) => sum + count, 0);
    const errorBreakdown = {};
    
    for (const [type, count] of Object.entries(this.errorTypes)) {
      errorBreakdown[type] = {
        count,
        percentage: (count / totalErrors) * 100
      };
    }
    
    return {
      totalErrors,
      errorBreakdown,
      mostCommonError: Object.keys(this.errorTypes).reduce((a, b) => 
        this.errorTypes[a] > this.errorTypes[b] ? a : b
      )
    };
  }

  // Get user satisfaction metrics
  getUserSatisfactionMetrics() {
    if (this.metrics.userSatisfactionScores.length === 0) {
      return {
        averageScore: 0,
        totalRatings: 0,
        distribution: {}
      };
    }
    
    const scores = this.metrics.userSatisfactionScores.map(s => s.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = scores.filter(s => s === i).length;
    }
    
    return {
      averageScore: average,
      totalRatings: scores.length,
      distribution
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    const sessionTime = (Date.now() - this.startTime) / 1000 / 60; // minutes
    
    return {
      ...this.metrics,
      sessionTime,
      messagesPerMinute: this.metrics.messageCount / sessionTime,
      tokensPerMessage: this.metrics.totalTokens / this.metrics.messageCount || 0,
      compressionRate: (this.metrics.contextCompressions / this.metrics.apiCalls) * 100,
      errorRate: (this.metrics.errors / this.metrics.apiCalls) * 100
    };
  }

  // Performance recommendations
  getRecommendations() {
    const summary = this.getPerformanceSummary();
    const recommendations = [];

    if (summary.averageResponseTime > 5000) {
      recommendations.push('Consider reducing context size - response times are slow');
    }

    if (summary.compressionRate > 50) {
      recommendations.push('High compression rate - consider implementing message archiving');
    }

    if (summary.errorRate > 10) {
      recommendations.push('High error rate - check API limits and network connectivity');
    }

    if (summary.tokensPerMessage > 1000) {
      recommendations.push('High token usage - optimize message context');
    }

    if (summary.rateLimitHits > 0) {
      recommendations.push('Rate limiting detected - implement message queuing');
    }

    return recommendations;
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getPerformanceSummary(),
      recommendations: this.getRecommendations()
    };
  }
}

// Global analytics instance
export const chatAnalytics = new ChatAnalytics();

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState(chatAnalytics.getPerformanceSummary());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(chatAnalytics.getPerformanceSummary());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
};

// Warning system for performance issues
export const checkPerformanceWarnings = (metrics) => {
  const warnings = [];
  
  if (metrics.averageResponseTime > 10000) {
    warnings.push({
      type: 'critical',
      message: 'Very slow response times detected',
      action: 'Reduce context size immediately'
    });
  }
  
  if (metrics.tokensPerMessage > 1500) {
    warnings.push({
      type: 'warning',
      message: 'High token usage per message',
      action: 'Consider message compression'
    });
  }
  
  if (metrics.errorRate > 20) {
    warnings.push({
      type: 'critical',
      message: 'High error rate detected',
      action: 'Check API status and limits'
    });
  }
  
  return warnings;
};

// Auto-optimization based on metrics
export const autoOptimize = (metrics) => {
  const optimizations = [];
  
  // Auto-enable compression if response times are slow
  if (metrics.averageResponseTime > 7000 && metrics.compressionRate < 30) {
    optimizations.push({
      type: 'compression',
      action: 'Enable aggressive message compression',
      impact: 'Reduce response time by ~30%'
    });
  }
  
  // Auto-limit context if token usage is high
  if (metrics.tokensPerMessage > 1200) {
    optimizations.push({
      type: 'context_limit',
      action: 'Reduce context window to 15 messages',
      impact: 'Reduce API costs by ~25%'
    });
  }
  
  // Auto-enable caching if lots of similar requests
  if (metrics.apiCalls > 100 && metrics.compressionRate > 40) {
    optimizations.push({
      type: 'caching',
      action: 'Enable response caching',
      impact: 'Reduce API calls by ~15%'
    });
  }
  
  return optimizations;
};
