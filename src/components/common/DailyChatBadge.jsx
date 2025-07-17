import React from 'react';
import { Clock, MessageSquare } from 'lucide-react';

const DailyChatBadge = ({ dailyChatsUsed = 0, maxDailyChats = 25, onClick = null }) => {
  // Calculate percentage usage
  const percentage = Math.min((dailyChatsUsed / maxDailyChats) * 100, 100);
  
  // Get color based on your specification
  const getColor = () => {
    if (percentage >= 76) return 'red';    // 19-25 chats (76-100%)
    if (percentage >= 44) return 'yellow'; // 11-18 chats (44-72%)
    return 'green';                        // 0-10 chats (0-40%)
  };

  const color = getColor();
  
  // Get styling classes based on color
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-300 dark:border-red-700',
          dot: 'bg-red-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'text-yellow-700 dark:text-yellow-300',
          border: 'border-yellow-300 dark:border-yellow-700',
          dot: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-300 dark:border-green-700',
          dot: 'bg-green-500'
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
      title={`Daily chats: ${dailyChatsUsed}/${maxDailyChats} (${Math.round(percentage)}%)`}
    >
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full ${colorClasses.dot}`}></div>
      
      {/* Icon */}
      <MessageSquare className="w-4 h-4" />
      
      {/* Count */}
      <span className="text-sm font-medium">
        {dailyChatsUsed}/{maxDailyChats}
      </span>
    </div>
  );
};

export default DailyChatBadge;
