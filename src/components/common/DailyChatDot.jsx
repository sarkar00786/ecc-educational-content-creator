import React from 'react';
import { MessageSquare } from 'lucide-react';

const DailyChatDot = ({ dailyChatsUsed = 0, maxDailyChats = 25, onClick = null, showText = true }) => {
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
          dot: 'bg-red-500',
          text: 'text-red-700 dark:text-red-300',
          pulse: 'animate-pulse',
          ring: 'ring-red-400/30'
        };
      case 'yellow':
        return {
          dot: 'bg-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-300',
          pulse: '',
          ring: 'ring-yellow-400/30'
        };
      default:
        return {
          dot: 'bg-green-500',
          text: 'text-green-700 dark:text-green-300',
          pulse: '',
          ring: 'ring-green-400/30'
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
      }`}
      title={`Daily chats: ${dailyChatsUsed}/${maxDailyChats} (${Math.round(percentage)}%)`}
    >
      {/* Status dot with subtle ring for critical state */}
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${colorClasses.dot} ${colorClasses.pulse} ${
            color === 'red' ? `ring-2 ${colorClasses.ring}` : ''
          }`}
        />
        {/* Subtle pulsing ring for critical state */}
        {color === 'red' && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${colorClasses.dot} opacity-30 animate-ping`} />
        )}
      </div>
      
      {/* Optional text */}
      {showText && (
        <span className={`text-xs font-medium ${colorClasses.text}`}>
          {dailyChatsUsed}/{maxDailyChats}
        </span>
      )}
    </div>
  );
};

export default DailyChatDot;
