import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, FileText, Calendar, User, MapPin, Hash, Loader2, CheckCircle, XCircle } from 'lucide-react';

const LinkContentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  contentHistory = [],
  currentChatId,
  currentlyLinkedContent = null,
  contentAttachmentProgress,
  contentAttachmentStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [filteredContent, setFilteredContent] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedContent(currentlyLinkedContent);
    }
  }, [isOpen, currentlyLinkedContent]);

  useEffect(() => {
    const filtered = contentHistory.filter(item =>
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.generatedContent && item.generatedContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.bookContent && item.bookContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.audienceClass && item.audienceClass.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.audienceAge && item.audienceAge.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.audienceRegion && item.audienceRegion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredContent(filtered);
  }, [searchTerm, contentHistory]);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedContent);
    onClose();
  }, [selectedContent, onConfirm, onClose]);

  const handleRemoveLink = useCallback(() => {
    setSelectedContent(null);
    onConfirm(null);
    onClose();
  }, [onConfirm, onClose]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleContentSelection = useCallback((content) => {
    setSelectedContent(content);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Link Content History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search content by name, content, audience details..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No content found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'Generate some content first to link it here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContent.map((content) => (
                <div
                  key={content.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedContent?.id === content.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                  onClick={() => handleContentSelection(content)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {content.name || 'Untitled Content'}
                      </h3>
                      
                      {/* Audience Info */}
                      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {content.audienceClass && (
                          <div className="flex items-center space-x-1">
                            <Hash className="w-4 h-4" />
                            <span>Class: {content.audienceClass}</span>
                          </div>
                        )}
                        {content.audienceAge && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Age: {content.audienceAge}</span>
                          </div>
                        )}
                        {content.audienceRegion && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>Region: {content.audienceRegion}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Preview */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                        {content.generatedContent?.substring(0, 200)}...
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(content.timestamp)}</span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {selectedContent?.id === content.id && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachment Progress */}
        {contentAttachmentProgress && (
          <div className="p-6">
            {contentAttachmentProgress === 'attaching' && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Attaching content...
              </div>
            )}
            {contentAttachmentProgress === 'success' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" /> Content attached successfully
              </div>
            )}
            {contentAttachmentProgress === 'error' && (
              <div className="flex items-center text-red-600">
                <XCircle className="w-5 h-5 mr-2" /> Failed to attach content
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedContent ? (
                <span>Selected: <strong>{selectedContent.name || 'Untitled Content'}</strong></span>
              ) : (
                <span>Select content to link to this chat</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {currentlyLinkedContent && (
                <button
                  onClick={handleRemoveLink}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Remove Link
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={!selectedContent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Link Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkContentModal;
