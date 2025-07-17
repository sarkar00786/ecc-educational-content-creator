import React, { useState } from 'react';
import { X, Save, BookOpen, FileText } from 'lucide-react';
import Modal from '../common/Modal';

const SaveSegmentModal = ({ 
  isOpen, 
  onClose, 
  onSaveAsContent, 
  onSaveAsNote, 
  selectedMessages,
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [noteTitle, setNoteTitle] = useState('');

  const handleSaveAsContent = () => {
    if (selectedMessages.length === 0) return;
    
    const contentText = selectedMessages.map(msg => msg.text).join('\n\n');
    onSaveAsContent(contentText);
  };

  const handleSaveAsNote = () => {
    if (selectedMessages.length === 0) return;
    
    const contentText = selectedMessages.map(msg => msg.text).join('\n\n');
    const title = noteTitle.trim() || generateDefaultTitle(selectedMessages);
    
    onSaveAsNote(contentText, title);
  };

  const generateDefaultTitle = (messages) => {
    if (messages.length === 0) return 'Untitled Note';
    
    const firstMessage = messages[0];
    const words = firstMessage.text.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.text.split(' ').length > 6 ? '...' : '');
  };

  const getPreviewText = () => {
    if (selectedMessages.length === 0) return 'No messages selected';
    return selectedMessages.map(msg => msg.text).join('\n\n');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'note' && !noteTitle) {
      setNoteTitle(generateDefaultTitle(selectedMessages));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Chat Segment"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('content')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'content'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Save as Content</span>
          </button>
          <button
            onClick={() => handleTabChange('note')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'note'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Save as Note</span>
          </button>
        </div>

        {/* Content Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Content Preview
          </label>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {getPreviewText()}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200">Save as Content</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                    This will populate the Content Generation page with your selected chat segment, 
                    allowing you to transform it into educational content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'note' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note Title
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter a title for your note"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-200">Save as Note</h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    This will save your selected chat segment as a note in your generated content collection 
                    for future reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={activeTab === 'content' ? handleSaveAsContent : handleSaveAsNote}
            disabled={isLoading || selectedMessages.length === 0 || (activeTab === 'note' && !noteTitle.trim())}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
              activeTab === 'content' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save {activeTab === 'content' ? 'as Content' : 'as Note'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveSegmentModal;
