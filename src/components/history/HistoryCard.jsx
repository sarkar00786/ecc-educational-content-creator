import React from 'react';
import ProBadge from '../common/ProBadge';

const HistoryCard = ({ content, onClick, onLoadToEditor, onDelete, onLinkToChat, isSelected }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-4 cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
          {content.name || 'Untitled Content'}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
          {formatDate(content.timestamp)}
        </span>
      </div>

      {/* Audience Info */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {content.audienceClass || 'N/A'}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Age: {content.audienceAge || 'N/A'}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {content.audienceRegion || 'N/A'}
        </span>
      </div>

      {/* Content Preview */}
      <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
        {content.generatedContent 
          ? content.generatedContent.length > 200 
            ? content.generatedContent.substring(0, 200) + '...'
            : content.generatedContent
          : 'No content available'
        }
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoadToEditor();
            }}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium transition-colors flex items-center space-x-1"
            title="Load to Editor"
            aria-label="Load to Editor"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Load</span>
          </button>
          
          {onLinkToChat && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLinkToChat(content);
                }}
                className="bg-gradient-to-r from-purple-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:from-purple-600 hover:to-orange-600 hover:shadow-md hover:scale-105 shadow-sm flex items-center space-x-1"
                title="Discuss in Chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.418-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Discuss</span>
              </button>
            </div>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors flex items-center space-x-1"
              title="Delete Content"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;
