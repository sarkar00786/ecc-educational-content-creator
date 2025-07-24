import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HistoryCard from './HistoryCard';
import ContentDetailView from './ContentDetailView';
import ToastNotification from '../common/ToastNotification';
import { doc, deleteDoc } from 'firebase/firestore';
import { getAppId } from '../../services/firebase';

const ContentHistoryPage = ({ 
  db, 
  user, 
  onError, 
  onSuccess, 
  contentHistory, 
  onLoadToEditor, 
  selectedContentId, 
  onContentSelectionHandled 
}) => {
  const [state, setState] = useState({
    currentSelectedContentId: null,
    isDetailViewOpen: false,
    isFullScreenMode: false,
    searchTerm: '',
    deleteConfirmation: { isOpen: false, contentId: null, contentName: '' },
    isDeleting: false,
    isMobile: window.innerWidth < 768
  });

  // Use the contentHistory passed from App instead of fetching separately
  const contentHistoryList = useMemo(() => contentHistory || [], [contentHistory]);

  // Define handleCardClick before useEffect that uses it - memoized to prevent recreations
  const handleCardClick = useCallback((contentId) => {
    setState(prev => ({
      ...prev,
      currentSelectedContentId: contentId,
      isDetailViewOpen: true,
      isFullScreenMode: prev.isMobile
    }));
  }, []);

  // Handle window resize for mobile detection - memoized handler
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setState(prev => {
      const newState = { ...prev, isMobile: mobile };
      
      // If switching to mobile and detail view is open, force full screen
      if (mobile && prev.isDetailViewOpen && !prev.isFullScreenMode) {
        newState.isFullScreenMode = true;
      }
      
      return newState;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Auto-open content when selectedContentId is provided from navigation
  useEffect(() => {
    if (selectedContentId && contentHistoryList.length > 0) {
      const content = contentHistoryList.find(c => c.id === selectedContentId);
      if (content) {
        handleCardClick(selectedContentId);
        // Notify parent that we've handled the selection
        if (onContentSelectionHandled) {
          onContentSelectionHandled();
        }
      }
    }
  }, [selectedContentId, contentHistoryList, onContentSelectionHandled, handleCardClick]);

  const handleFullScreenToggle = useCallback(() => {
    // Don't allow exit from full screen on mobile
    if (state.isMobile && state.isFullScreenMode) return;
    setState(prev => ({ ...prev, isFullScreenMode: !prev.isFullScreenMode }));
  }, [state.isMobile, state.isFullScreenMode]);

  const handleBackToList = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDetailViewOpen: false,
      currentSelectedContentId: null,
      isFullScreenMode: false
    }));
  }, []);

  const handleDeleteRequest = useCallback((contentId, contentName) => {
    setState(prev => ({
      ...prev,
      deleteConfirmation: { isOpen: true, contentId, contentName }
    }));
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!state.deleteConfirmation.contentId) return;
    
    setState(prev => ({ ...prev, isDeleting: true }));
    try {
      await deleteDoc(
        doc(db, `artifacts/${getAppId()}/users/${user.uid}/generatedContent`, state.deleteConfirmation.contentId)
      );
      
      // Close detail view if the deleted item was selected
      if (state.currentSelectedContentId === state.deleteConfirmation.contentId) {
        handleBackToList();
      }
      
      onSuccess('🗑️ Content deleted successfully!');
    } catch (error) {
      console.error('Error deleting content:', error);
      onError('Failed to delete content. Please try again.');
    } finally {
      setState(prev => ({
        ...prev,
        isDeleting: false,
        deleteConfirmation: { isOpen: false, contentId: null, contentName: '' }
      }));
    }
  }, [state.deleteConfirmation.contentId, state.currentSelectedContentId, db, user.uid, onSuccess, onError, handleBackToList]);

  const handleDeleteCancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      deleteConfirmation: { isOpen: false, contentId: null, contentName: '' }
    }));
  }, []);

  const handleLoadToEditor = (content) => {
    if (onLoadToEditor) {
      onLoadToEditor({
        bookContent: content.bookContent || '',
        audienceClass: content.audienceClass || '',
        audienceAge: content.audienceAge || '',
        audienceRegion: content.audienceRegion || '',
        outputWordCount: content.outputWordCount || '',
        customInstructions: content.customInstructions || ''
      });
      onSuccess('📝 Content loaded to editor!');
    }
  };

  const filteredContentHistoryList = useMemo(() => {
    return contentHistoryList.filter(item => {
      if (!item) return false;
      const name = item.name || '';
      const generatedContent = item.generatedContent || '';
      const searchLower = state.searchTerm.toLowerCase();
      
      return name.toLowerCase().includes(searchLower) ||
             generatedContent.toLowerCase().includes(searchLower);
    });
  }, [contentHistoryList, state.searchTerm]);

  return (
<div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* History Page Content */}
      <div className={`flex flex-1 transition-all duration-300 ${
        state.isFullScreenMode ? 'hidden' : 'flex'
      }`}>
        {/* History List Section */}
        <div className={`${
          state.isDetailViewOpen && !state.isMobile 
            ? 'w-2/5 lg:w-1/3' 
            : 'flex-1'
        } flex flex-col transition-all duration-300`}>
          {/* Search Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mr-4">Content History</h1>
              <input
                type="text"
                placeholder="Search history..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* History Cards */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {filteredContentHistoryList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {state.searchTerm ? 'No content found matching your search.' : 'No content generated yet. Create some content to see it here!'}
                </p>
              </div>
            ) : (
              filteredContentHistoryList.map(content => (
                <HistoryCard
                  key={content.id}
                  content={content}
                  onClick={() => handleCardClick(content.id)}
                  onLoadToEditor={() => handleLoadToEditor(content)}
                  onDelete={() => handleDeleteRequest(content.id, content.name || 'Untitled Content')}
                  isSelected={state.currentSelectedContentId === content.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail View Section - Desktop Side View */}
        {state.isDetailViewOpen && state.currentSelectedContentId && !state.isMobile && (
          <div className="w-3/5 lg:w-2/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300">
            <ContentDetailView
              contentId={state.currentSelectedContentId}
              onClose={handleBackToList}
              onFullScreenToggle={handleFullScreenToggle}
              onDelete={() => {
                const content = contentHistoryList.find(c => c.id === state.currentSelectedContentId);
                handleDeleteRequest(state.currentSelectedContentId, content?.name || 'Untitled Content');
              }}
              isFullScreenMode={false}
              isSideView={true}
              isMobile={false}
              db={db}
              user={user}
              onError={onError}
              onSuccess={onSuccess}
            />
          </div>
        )}
      </div>

      {/* Full Screen Detail View */}
      {state.isDetailViewOpen && state.currentSelectedContentId && (state.isFullScreenMode || state.isMobile) && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 transition-all duration-300">
          <ContentDetailView
            contentId={state.currentSelectedContentId}
            onClose={handleBackToList}
            onFullScreenToggle={handleFullScreenToggle}
            onDelete={() => {
              const content = contentHistoryList.find(c => c.id === state.currentSelectedContentId);
              handleDeleteRequest(state.currentSelectedContentId, content?.name || 'Untitled Content');
            }}
            isFullScreenMode={true}
            isSideView={false}
            isMobile={state.isMobile}
            db={db}
            user={user}
            onError={onError}
            onSuccess={onSuccess}
          />
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {state.deleteConfirmation.isOpen && (
        <ToastNotification
          type="confirmation"
          title="Delete Content"
          message={`Are you sure you want to delete "${state.deleteConfirmation.contentName}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          onClose={handleDeleteCancel}
          confirmText={state.isDeleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          isLoading={state.isDeleting}
          persistent={true}
        />
      )}
    </div>
  );
};

export default ContentHistoryPage;
