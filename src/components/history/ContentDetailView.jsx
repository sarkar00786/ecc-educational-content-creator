import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAppId } from '../../services/firebase';

const ContentDetailView = ({ 
  contentId, 
  onClose, 
  onFullScreenToggle, 
  onDelete, 
  isFullScreenMode, 
  isSideView = false, 
  db, 
  user, 
  onError, 
  onSuccess 
}) => {
  const [content, setContent] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentDoc = await getDoc(
          doc(db, `artifacts/${getAppId()}/users/${user.uid}/generatedContent`, contentId)
        );
        
        if (contentDoc.exists()) {
          const contentData = contentDoc.data();
          setContent(contentData);
          setEditedContent(contentData.generatedContent || '');
        } else {
          onError('Content not found');
        }
      } catch {
        onError('Failed to fetch content details');
      } finally {
        setIsLoading(false);
      }
    };

    if (contentId && db && user) {
      fetchContent();
    }
  }, [contentId, db, user, onError]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await updateDoc(
        doc(db, `artifacts/${getAppId()}/users/${user.uid}/generatedContent`, contentId),
        { generatedContent: editedContent }
      );
      
      setContent(prev => ({ ...prev, generatedContent: editedContent }));
      setIsEditing(false);
    } catch {
      onError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = editedContent || content?.generatedContent || '';
    navigator.clipboard.writeText(textToCopy).then(() => {
      if (onSuccess) onSuccess('Content copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (onSuccess) onSuccess('Content copied to clipboard!');
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Content not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {content.name || 'Untitled Content'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="Delete Content"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          
          {!isFullScreenMode && isSideView && (
            <button
              onClick={onFullScreenToggle}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Full Screen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
          
          {isFullScreenMode && (
            <button
              onClick={onFullScreenToggle}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Exit Full Screen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleCopyToClipboard}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Copy to Clipboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Content Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Audience Class</h4>
              <p className="text-gray-600 dark:text-gray-400">{content.audienceClass || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Age Group</h4>
              <p className="text-gray-600 dark:text-gray-400">{content.audienceAge || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Region</h4>
              <p className="text-gray-600 dark:text-gray-400">{content.audienceRegion || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Generated Content</h3>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              placeholder="Enter your content here..."
            />
          ) : (
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <pre className="whitespace-pre-wrap text-gray-900 dark:text-white font-sans leading-relaxed">
                {content.generatedContent || 'No content available'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentDetailView;
