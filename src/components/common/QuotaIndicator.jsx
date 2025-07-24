import React, { useMemo } from 'react';
import { AlertTriangle, Info, FileText, Clock } from 'lucide-react';

// Simple content generation quota indicator (Chat functionality moved to Magic-Chat folder)
const ContentQuotaIndicator = React.memo(({ 
  contentGenerated = 0, 
  generationsUsed = 0,
  showDetails = false,
  onClick = null 
}) => {
  // const [showTooltip, setShowTooltip] = useState(false); // Commented out as tooltip is not implemented yet
  
  // Default content limits
  const CONTENT_LIMITS = {
    MAX_DAILY_CONTENT: 50,
    MAX_DAILY_GENERATIONS: 200
  };
  
  // Calculate percentage usage
  const getUsagePercentage = (used, max) => Math.min((used / max) * 100, 100);
  
  // Get status color based on usage
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 70) return 'orange';
    if (percentage >= 50) return 'yellow';
    return 'green';
  };
  
  // Get progress bar color classes
  const getProgressColor = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };
  
  // Calculate usage statistics
  const stats = useMemo(() => [
    {
      label: 'Content Generated',
      used: contentGenerated,
      max: CONTENT_LIMITS.MAX_DAILY_CONTENT,
      icon: FileText,
      type: 'content'
    },
    {
      label: 'Daily Generations',
      used: generationsUsed,
      max: CONTENT_LIMITS.MAX_DAILY_GENERATIONS,
      icon: Clock,
      type: 'generations'
    }
  ], [contentGenerated, generationsUsed, CONTENT_LIMITS.MAX_DAILY_CONTENT, CONTENT_LIMITS.MAX_DAILY_GENERATIONS]);
  
  // Find the most critical (highest percentage) stat
  const criticalStat = useMemo(() => {
    return stats.reduce((max, stat) => {
      const percentage = getUsagePercentage(stat.used, stat.max);
      const maxPercentage = getUsagePercentage(max.used, max.max);
      return percentage > maxPercentage ? stat : max;
    });
  }, [stats]);
  
  const criticalPercentage = useMemo(() => getUsagePercentage(criticalStat.used, criticalStat.max), [criticalStat]);
  const criticalColor = useMemo(() => getStatusColor(criticalPercentage), [criticalPercentage]);
  
  if (!showDetails) {
    // Compact view - show only critical warning if approaching limits
    if (criticalPercentage < 70) return null;
    
    const isLimitReached = criticalStat.used === criticalStat.max;
    
    return (
      <div 
        className={`relative group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:shadow-md' : ''
        } ${
          isLimitReached
            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : criticalColor === 'red'
            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            : criticalColor === 'orange'
            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
        }`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        aria-label={onClick ? 'Click to view detailed usage information' : undefined}
      >
        <AlertTriangle className="w-4 h-4" />
        <span>
          {criticalStat.label}: {criticalStat.used}/{criticalStat.max} ({Math.round(criticalPercentage)}%)
        </span>
        {isLimitReached && (
          <div className="absolute bottom-full mb-2 w-64 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            You've reached your daily {criticalStat.label.toLowerCase()} limit. The limit resets at midnight.
          </div>
        )}
      </div>
    );
  }
  
  // Detailed view - show all statistics
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Generation Limits</h3>
      </div>
      
      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = getUsagePercentage(stat.used, stat.max);
          const color = getStatusColor(percentage);
          const Icon = stat.icon;
          
          return (
            <div key={stat.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.label}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  color === 'red' 
                    ? 'text-red-600 dark:text-red-400' 
                    : color === 'orange'
                    ? 'text-orange-600 dark:text-orange-400'
                    : color === 'yellow'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {stat.used}/{stat.max} ({Math.round(percentage)}%)
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(color)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Warning messages */}
              {percentage >= 90 && (
                <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Limit almost reached!</span>
                </div>
              )}
              {percentage >= 70 && percentage < 90 && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Approaching daily limit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Limits reset daily at midnight. Content generation focuses on creating educational materials.
        </p>
      </div>
    </div>
  );
});

ContentQuotaIndicator.displayName = 'ContentQuotaIndicator';

export default ContentQuotaIndicator;
