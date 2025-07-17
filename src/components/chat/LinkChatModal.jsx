import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Link, Check, AlertCircle } from 'lucide-react';
import ChatCard from './ChatCard';
import { isGeneralMode } from '../../config/chatLimits';
import { dailyQuotaManager } from '../../utils/quotaManager';

const LinkChatModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  chatHistoryList, 
  currentChatId,
  currentlyLinkedChats = [],
  chatData = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChats, setSelectedChats] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState({ canLink: true, remainingSlots: 2 });

  // Reset state when modal opens and check quota
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedChats([]);
      setIsConfirming(false);
      
      // Check quota status
      const isGeneral = isGeneralMode(chatData);
      const currentLinkedCount = currentlyLinkedChats.length;
      const remainingSlots = 2 - currentLinkedCount;
      const canLink = isGeneral || remainingSlots > 0;
      
      setQuotaStatus({
        canLink,
        remainingSlots,
        isGeneral,
        currentLinkedCount
      });
    }
  }, [isOpen, chatData, currentlyLinkedChats]);

  // Filter available chats (exclude current chat, already linked chats, and general chat)
  const availableChats = useMemo(() => {
    return chatHistoryList.filter(chat => 
      chat.id !== currentChatId && 
      !currentlyLinkedChats.includes(chat.id) &&
      !chat.isGeneral &&
      !chat.isArchived
    );
  }, [chatHistoryList, currentChatId, currentlyLinkedChats]);

  // Filter chats based on search term
  const filteredChats = useMemo(() => {
    if (!searchTerm) return availableChats;
    
    return availableChats.filter(chat =>
      chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.messages?.some(msg => msg.text?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [availableChats, searchTerm]);

  const handleChatSelect = useCallback((chatId) => {
    setSelectedChats(prev => {
      if (prev.includes(chatId)) {
        // Allow deselecting
        return prev.filter(id => id !== chatId);
      } else {
        // Check if we can add more chats based on quota
        const totalAfterSelection = prev.length + currentlyLinkedChats.length + 1;
        
        // For general mode, allow unlimited linking
        if (quotaStatus.isGeneral) {
          return [...prev, chatId];
        }
        
        // For other modes, respect the 2-chat limit
        if (totalAfterSelection <= 2) {
          return [...prev, chatId];
        }
      }
      return prev; // Cannot add more due to quota limits
    });
  }, [currentlyLinkedChats.length, quotaStatus.isGeneral]);

  const handleConfirm = useCallback(async () => {
    if (selectedChats.length === 0) return;
    
    setIsConfirming(true);
    try {
      await onConfirm(selectedChats);
      onClose();
    } catch (error) {
      console.error('Error linking chats:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [selectedChats, onConfirm, onClose]);

  const getPreviewText = useCallback((chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const aiMessage = chat.messages.find(msg => msg.role === 'model' || msg.role === 'assistant');
    if (aiMessage) {
      return aiMessage.text.slice(0, 100) + (aiMessage.text.length > 100 ? '...' : '');
    }
    
    const firstMessage = chat.messages[0];
    return firstMessage.text.slice(0, 100) + (firstMessage.text.length > 100 ? '...' : '');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Link Previous Chats
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Select up to 2 previous chats to provide context for your AI conversations. 
            The AI will use these as background knowledge while staying focused on your current subject.
          </p>
          <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
            <span>Selected: {selectedChats.length}/2</span>
            <span>Available: {availableChats.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats by title, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No chats match your search' : 'No chats available to link'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedChats.includes(chat.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-3 right-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedChats.includes(chat.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedChats.includes(chat.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Chat Info */}
                  <div className="pr-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {chat.title || 'Untitled Chat'}
                      </h3>
                      {chat.subject && (
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                          {chat.subject}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {getPreviewText(chat)}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {chat.messages?.length || 0} messages • {
                        chat.lastUpdated?.toDate 
                          ? chat.lastUpdated.toDate().toLocaleDateString()
                          : new Date(chat.lastUpdated).toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedChats.length === 2 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                Maximum of 2 chats selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedChats.length === 0 || isConfirming}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Linking...</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  <span>Link {selectedChats.length} Chat{selectedChats.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkChatModal;
