import React from 'react';
import { MessageSquare } from 'lucide-react';

const DailyChatRing = ({ dailyChatsUsed = 0, maxDailyChats = 25, onClick = null }) => {
  // Calculate percentage usage
  const percentage = Math.min((dailyChatsUsed / maxDailyChats) * 100, 100);
  
  // Get color based on your specification
  const getColor = () => {
    if (percentage >= 76) return 'red';    // 19-25 chats (76-100%)
    if (percentage >= 44) return 'yellow'; // 11-18 chats (44-72%)
    return 'green';                        // 0-10 chats (0-40%)
  };

  const color = getColor();
  
  // Get stroke color
  const getStrokeColor = () => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'yellow': return '#eab308';
      default: return '#22c55e';
    }
  };

  // Circle properties
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColor = getStrokeColor();

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
      }`}
      title={`Daily chats: ${dailyChatsUsed}/${maxDailyChats} (${Math.round(percentage)}%)`}
    >
      {/* Background circle */}
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-gray-200 dark:text-gray-600"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {/* Count in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${
          color === 'red' ? 'text-red-600 dark:text-red-400' :
          color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
          'text-green-600 dark:text-green-400'
        }`}>
          {dailyChatsUsed}
        </span>
      </div>
    </div>
  );
};

export default DailyChatRing;
