import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Database, 
  Users, 
  Bell, 
  Star,
  TrendingUp,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

// Content-focused Performance Dashboard (Chat features moved to Magic-Chat/extracted/)
const PerformanceDashboard = ({ isVisible, onClose }) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [metrics, setMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      loadPerformanceMetrics();
    }
  }, [isVisible]);

  const loadPerformanceMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate loading content-focused metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        contentLoadTime: { average: 1200, current: 1100, count: 45 },
        contentGenerationTime: { average: 8500, current: 7800, count: 23 },
        dbQueryTime: { average: 850, current: 920, count: 156 },
        memoryUsage: { current: 65.2, average: 58.3, count: 200 },
        cacheHitRate: 0.84,
        errorRate: 0.02,
        userSatisfaction: { averageScore: 4.3, count: 89 },
        contentGeneration: {
          totalGenerated: 156,
          averageWordCount: 450,
          totalWords: 70200
        }
      });
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  const formatTime = (ms) => ms ? `${ms.toFixed(0)}ms` : 'N/A';
  const formatBytes = (mb) => mb ? `${mb.toFixed(1)}MB` : 'N/A';

  const MetricCard = ({ title, value, threshold, icon: Icon, formatter }) => {
    const isAboveThreshold = value > threshold;
    const formattedValue = formatter ? formatter(value) : value?.toFixed(2) || 'N/A';
    
    return (
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg border-2 transition-colors ${
        isAboveThreshold 
          ? 'border-red-200 dark:border-red-800' 
          : 'border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 ${
            isAboveThreshold 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          }`} />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className={`text-2xl font-semibold ${
              isAboveThreshold 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {formattedValue}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const PerformanceChart = ({ data, title }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        📊 Chart visualization for {title.toLowerCase()}
        <br />
        <span className="text-sm">Data points: {data.length}</span>
      </div>
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
              Content Performance Dashboard
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
            { id: 'content', name: 'Content Generation', icon: FileText },
            { id: 'database', name: 'Database', icon: Database },
            { id: 'satisfaction', name: 'User Satisfaction', icon: Star }
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
                    title="Content Load Time"
                    value={metrics.contentLoadTime?.average}
                    threshold={2000}
                    icon={Clock}
                    formatter={formatTime}
                  />
                  <MetricCard
                    title="Generation Time"
                    value={metrics.contentGenerationTime?.average}
                    threshold={10000}
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

              {selectedMetric === 'content' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                      title="Total Generated"
                      value={metrics.contentGeneration?.totalGenerated}
                      threshold={1000}
                      icon={FileText}
                      formatter={(v) => `${v} items`}
                    />
                    <MetricCard
                      title="Average Word Count"
                      value={metrics.contentGeneration?.averageWordCount}
                      threshold={500}
                      icon={FileText}
                      formatter={(v) => `${v} words`}
                    />
                    <MetricCard
                      title="Total Words Generated"
                      value={metrics.contentGeneration?.totalWords}
                      threshold={100000}
                      icon={FileText}
                      formatter={(v) => `${v.toLocaleString()} words`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PerformanceChart
                      data={Array.from({length: 20}, () => Math.random() * 10000)}
                      title="Content Generation Times"
                    />
                    <PerformanceChart
                      data={Array.from({length: 20}, () => Math.random() * 2000)}
                      title="Content Load Times"
                    />
                  </div>
                </div>
              )}

              {selectedMetric === 'database' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PerformanceChart
                      data={Array.from({length: 20}, () => Math.random() * 1500)}
                      title="Database Query Times"
                    />
                    <PerformanceChart
                      data={Array.from({length: 20}, () => Math.random() * 100)}
                      title="Memory Usage"
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
                      value={metrics.userSatisfaction?.count || 0}
                      threshold={50}
                      icon={Users}
                      formatter={(v) => `${v} ratings`}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
