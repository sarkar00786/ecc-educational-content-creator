import React, { useState } from 'react';
import { AlertTriangle, Info, MessageSquare, FileText, Upload, Clock } from 'lucide-react';
import { CHAT_LIMITS } from '../../config/chatLimits';

const QuotaIndicator = ({ 
  currentMessages = 0, 
  filesUploaded = 0, 
  totalFileSize = 0,
  dailyChatsUsed = 0,
  contentFilesUsed = 0,
  chatCardsUsed = 0,
  showDetails = false,
  onClick = null 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Calculate percentage usage
  const getUsagePercentage = (used, max) => Math.min((used / max) * 100, 100);
  
  // Get status color based on usage
  const getStatusColor = (percentage, type) => {
    // Special color scheme for daily chats (25 limit)
    if (type === 'daily') {
      if (percentage >= 76) return 'red';    // 19-25 chats (76-100%)
      if (percentage >= 44) return 'yellow'; // 11-18 chats (44-72%)
      return 'green';                        // 0-10 chats (0-40%)
    }
    
    // Default color scheme for other limits
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
  const stats = [
    {
      label: 'Messages',
      used: currentMessages,
      max: CHAT_LIMITS.MAX_MESSAGES_PER_CHAT,
      icon: MessageSquare,
      type: 'messages'
    },
    {
      label: 'Files',
      used: filesUploaded,
      max: CHAT_LIMITS.MAX_FILES_PER_MESSAGE,
      icon: Upload,
      type: 'files'
    },
    {
      label: 'Content Files',
      used: contentFilesUsed,
      max: 1,
      icon: FileText,
      type: 'content'
    },
    {
      label: 'Chat Cards',
      used: chatCardsUsed,
      max: 2,
      icon: MessageSquare,
      type: 'cards'
    },
    {
      label: 'Daily Chats',
      used: dailyChatsUsed,
      max: 25,
      icon: Clock,
      type: 'daily'
    }
  ];
  
  // Find the most critical (highest percentage) stat
  const criticalStat = stats.reduce((max, stat) => {
    const percentage = getUsagePercentage(stat.used, stat.max);
    const maxPercentage = getUsagePercentage(max.used, max.max);
    return percentage > maxPercentage ? stat : max;
  });
  
  const criticalPercentage = getUsagePercentage(criticalStat.used, criticalStat.max);
  const criticalColor = getStatusColor(criticalPercentage, criticalStat.type);
  
  if (!showDetails) {
    // Compact view - show only critical warning if approaching limits
    // Temporarily lowered threshold for testing (normally 70)
    if (criticalPercentage < 20) return null;
    
    const isDailyChatsLimitReached = criticalStat.type === 'daily' && criticalStat.used === criticalStat.max;
    
    return (
      <div 
        className={`relative group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:shadow-md' : ''
        } ${
          isDailyChatsLimitReached
            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
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
        {isDailyChatsLimitReached && (
          <div className="absolute bottom-full mb-2 w-64 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
            You've reached your daily chats limit of 25. The limit resets at midnight.
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage & Limits</h3>
      </div>
      
      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = getUsagePercentage(stat.used, stat.max);
          const color = getStatusColor(percentage, stat.type);
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
              {stat.type === 'daily' ? (
                <>
                  {percentage >= 76 && (
                    <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Only {stat.max - stat.used} chats remaining!</span>
                    </div>
                  )}
                  {percentage >= 44 && percentage < 76 && (
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Approaching daily limit</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {percentage >= 90 && (
                    <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Limit almost reached!</span>
                    </div>
                  )}
                  {percentage >= 70 && percentage < 90 && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Approaching limit</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* File Size Information */}
      {totalFileSize > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Total File Size
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {(totalFileSize / (1024 * 1024)).toFixed(1)} MB / 10 MB
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                totalFileSize >= CHAT_LIMITS.MAX_FILE_SIZE * 0.9 
                  ? 'bg-red-500' 
                  : totalFileSize >= CHAT_LIMITS.MAX_FILE_SIZE * 0.7 
                  ? 'bg-orange-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((totalFileSize / CHAT_LIMITS.MAX_FILE_SIZE) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Smart Suggestions */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Smart Tips</h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          {criticalPercentage >= 90 && (
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Consider starting a new chat to continue the conversation.</span>
            </div>
          )}
          {filesUploaded >= CHAT_LIMITS.MAX_FILES_PER_MESSAGE && (
            <div className="flex items-start space-x-2">
              <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Remove some files to upload new ones.</span>
            </div>
          )}
          {currentMessages >= CHAT_LIMITS.MAX_MESSAGES_PER_CHAT * 0.8 && (
            <div className="flex items-start space-x-2">
              <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Save important messages before reaching the limit.</span>
            </div>
          )}
          {dailyChatsUsed >= 19 && (
            <div className="flex items-start space-x-2">
              <Clock className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Only {25 - dailyChatsUsed} chats remaining today!</span>
            </div>
          )}
          {dailyChatsUsed >= 11 && dailyChatsUsed < 19 && (
            <div className="flex items-start space-x-2">
              <Clock className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>Focus on quality conversations - you're approaching daily limit.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotaIndicator;
