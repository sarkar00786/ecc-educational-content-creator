import React, { useState, useEffect, useCallback } from 'react';
import { performanceMonitor } from '../../utils/optimization/PerformanceMonitor';
import { chatAnalytics } from '../../utils/chatAnalytics';
import { dailyQuotaManager } from '../../utils/quotaManager';
import { notificationService } from '../../services/notificationService';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Zap, Database, Clock, BarChart3, Users, MessageCircle, FileText, Star, Bell } from 'lucide-react';

const PerformanceDashboard = ({ isVisible = false, onClose }) => {
  const [metrics, setMetrics] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const performanceSummary = performanceMonitor.getPerformanceSummary();
      const chatSummary = chatAnalytics.getPerformanceSummary();
      const quotaStats = dailyQuotaManager.getUsageStats();
      const notificationMetrics = notificationService.getMetrics();
      const recs = performanceMonitor.getOptimizationRecommendations();
      
      // Combine all metrics
      const combinedMetrics = {
        ...performanceSummary,
        chat: chatSummary,
        quota: quotaStats,
        notifications: notificationMetrics,
        userSatisfaction: chatAnalytics.getUserSatisfactionMetrics(),
        errorAnalysis: chatAnalytics.getErrorAnalysis()
      };
      
      setMetrics(combinedMetrics);
      setRecommendations(recs);
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Performance status indicator
  const getStatusColor = (value, threshold) => {
    if (!value || !threshold) return 'text-gray-500';
    
    if (value > threshold * 1.5) return 'text-red-500';
    if (value > threshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (value, threshold) => {
    if (!value || !threshold) return CheckCircle;
    
    if (value > threshold * 1.5) return AlertTriangle;
    if (value > threshold) return AlertTriangle;
    return CheckCircle;
  };

  // Format milliseconds to readable time
  const formatTime = (ms) => {
    if (!ms) return '0ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format bytes to readable size
  const formatBytes = (bytes) => {
    if (!bytes) return '0B';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Metric card component
  const MetricCard = ({ title, value, threshold, icon: Icon, formatter = (v) => v }) => {
    const StatusIcon = getStatusIcon(value, threshold);
    const statusColor = getStatusColor(value, threshold);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatter(value)}
              </p>
            </div>
          </div>
          <StatusIcon className={`w-5 h-5 ${statusColor}`} />
        </div>
        {threshold && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Threshold: {formatter(threshold)}
          </div>
        )}
      </div>
    );
  };

  // Performance chart component (simplified)
  const PerformanceChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const chartHeight = 100;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
        <div className="flex items-end space-x-1" style={{ height: chartHeight }}>
          {data.slice(-20).map((value, index) => (
            <div
              key={index}
              className="bg-blue-500 dark:bg-blue-400 rounded-t"
              style={{
                height: `${(value / max) * chartHeight}px`,
                width: '100%',
                minWidth: '4px'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Recommendations component
  const RecommendationsList = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Performance Recommendations
      </h3>
      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-2" />
          <p>All systems performing well!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                rec.priority === 'high'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : rec.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    rec.priority === 'high' ? 'text-red-500' : 
                    rec.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <span className="font-medium text-sm">{rec.type}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.priority === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {rec.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Impact: {rec.impact}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance Dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'chat', name: 'Chat Performance', icon: Clock },
            { id: 'database', name: 'Database', icon: Database },
            { id: 'usage', name: 'Usage & Quotas', icon: Users },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'satisfaction', name: 'User Satisfaction', icon: Star },
            { id: 'recommendations', name: 'Recommendations', icon: TrendingUp }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedMetric(id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                selectedMetric === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {selectedMetric === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricCard
                    title="Average Chat Load Time"
                    value={metrics.chatLoadTime?.average}
                    threshold={2000}
                    icon={Clock}
                    formatter={formatTime}
                  />
                  <MetricCard
                    title="Average Response Time"
                    value={metrics.messageResponseTime?.average}
                    threshold={5000}
                    icon={Zap}
                    formatter={formatTime}
                  />
                  <MetricCard
                    title="Database Query Time"
                    value={metrics.dbQueryTime?.average}
                    threshold={1000}
                    icon={Database}
                    formatter={formatTime}
                  />
                  <MetricCard
                    title="Memory Usage"
                    value={metrics.memoryUsage?.current}
                    threshold={100}
                    icon={Activity}
                    formatter={formatBytes}
                  />
                  <MetricCard
                    title="Cache Hit Rate"
                    value={metrics.cacheHitRate}
                    threshold={0.8}
                    icon={CheckCircle}
                    formatter={(v) => `${Math.round(v * 100)}%`}
                  />
                  <MetricCard
                    title="Error Rate"
                    value={metrics.errorRate}
                    threshold={0.05}
                    icon={AlertTriangle}
                    formatter={(v) => `${Math.round(v * 100)}%`}
                  />
                </div>
              )}

              {selectedMetric === 'chat' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PerformanceChart
                      data={metrics.chatLoadTime?.slice(-20).map(m => m.value) || []}
                      title="Chat Load Times"
                    />
                    <PerformanceChart
                      data={metrics.messageResponseTime?.slice(-20).map(m => m.value) || []}
                      title="Message Response Times"
                    />
                  </div>
                </div>
              )}

              {selectedMetric === 'database' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PerformanceChart
                      data={metrics.dbQueryTime?.slice(-20).map(m => m.value) || []}
                      title="Database Query Times"
                    />
                    <PerformanceChart
                      data={metrics.memoryUsage?.slice(-20).map(m => m.value) || []}
                      title="Memory Usage"
                    />
                  </div>
                </div>
              )}

              {selectedMetric === 'usage' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MetricCard
                      title="Daily Chats Created"
                      value={metrics.quota?.dailyChats?.used || 0}
                      threshold={metrics.quota?.dailyChats?.max || 20}
                      icon={MessageCircle}
                      formatter={(v) => `${v}/${metrics.quota?.dailyChats?.max || 20}`}
                    />
                    <MetricCard
                      title="Daily Messages Sent"
                      value={metrics.quota?.dailyMessages?.used || 0}
                      threshold={metrics.quota?.dailyMessages?.max || 100}
                      icon={MessageCircle}
                      formatter={(v) => `${v}/${metrics.quota?.dailyMessages?.max || 100}`}
                    />
                    <MetricCard
                      title="Content Files Linked"
                      value={metrics.quota?.contentFiles?.used || 0}
                      threshold={50}
                      icon={FileText}
                      formatter={(v) => `${v} files`}
                    />
                    <MetricCard
                      title="API Calls Made"
                      value={metrics.chat?.apiCalls || 0}
                      threshold={500}
                      icon={Activity}
                      formatter={(v) => `${v} calls`}
                    />
                    <MetricCard
                      title="Total Tokens Used"
                      value={metrics.chat?.totalTokens || 0}
                      threshold={50000}
                      icon={Database}
                      formatter={(v) => `${v.toLocaleString()} tokens`}
                    />
                    <MetricCard
                      title="Session Duration"
                      value={metrics.chat?.sessionTime || 0}
                      threshold={120}
                      icon={Clock}
                      formatter={(v) => `${Math.round(v)} min`}
                    />
                  </div>
                </div>
              )}

              {selectedMetric === 'satisfaction' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard
                      title="Average User Rating"
                      value={metrics.userSatisfaction?.averageScore || 0}
                      threshold={4.0}
                      icon={Star}
                      formatter={(v) => `${v.toFixed(1)}/5.0`}
                    />
                    <MetricCard
                      title="Total Ratings"
                      value={metrics.userSatisfaction?.totalRatings || 0}
                      threshold={10}
                      icon={Users}
                      formatter={(v) => `${v} ratings`}
                    />
                  </div>
                  
                  {/* User Satisfaction Distribution */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = metrics.userSatisfaction?.distribution?.[rating] || 0;
                        const total = metrics.userSatisfaction?.totalRatings || 1;
                        const percentage = (count / total) * 100;
                        
                        return (
                          <div key={rating} className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            </div>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Error Analysis */}
                  {metrics.errorAnalysis?.totalErrors > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Error Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Errors:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.errorAnalysis.totalErrors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Most Common Error:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.errorAnalysis.mostCommonError || 'None'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedMetric === 'recommendations' && (
                <RecommendationsList />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
