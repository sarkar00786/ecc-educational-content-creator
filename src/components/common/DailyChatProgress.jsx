import React from 'react';
import { MessageSquare } from 'lucide-react';

const DailyChatProgress = ({ dailyChatsUsed = 0, maxDailyChats = 25, onClick = null, compact = false }) => {
  // Calculate percentage usage
  const percentage = Math.min((dailyChatsUsed / maxDailyChats) * 100, 100);
  
  // Get color based on your specification
  const getColor = () => {
    if (percentage >= 76) return 'red';    // 19-25 chats (76-100%)
    if (percentage >= 44) return 'yellow'; // 11-18 chats (44-72%)
    return 'green';                        // 0-10 chats (0-40%)
  };

  const color = getColor();
  
  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          progress: 'bg-red-500',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-700'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          progress: 'bg-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-700'
        };
      default:
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          progress: 'bg-green-500',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-200 dark:border-green-700'
        };
    }
  };

  const colorClasses = getColorClasses();

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
        }`}
        title={`Daily chats: ${dailyChatsUsed}/${maxDailyChats} (${Math.round(percentage)}%)`}
      >
        {/* Mini progress bar */}
        <div className="relative w-8 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${colorClasses.progress} transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Count */}
        <span className={`text-xs font-medium ${colorClasses.text}`}>
          {dailyChatsUsed}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3 px-3 py-2 rounded-lg border transition-all duration-200 ${colorClasses.bg} ${colorClasses.border} ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
      title={`Daily chats: ${dailyChatsUsed}/${maxDailyChats} (${Math.round(percentage)}%)`}
    >
      {/* Icon */}
      <MessageSquare className={`w-4 h-4 ${colorClasses.text}`} />
      
      {/* Progress bar */}
      <div className="flex items-center space-x-2">
        <div className="relative w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${colorClasses.progress} transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Count */}
        <span className={`text-sm font-medium ${colorClasses.text} min-w-0`}>
          {dailyChatsUsed}/{maxDailyChats}
        </span>
      </div>
    </div>
  );
};

export default DailyChatProgress;
