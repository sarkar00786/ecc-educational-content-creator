import React, { useRef, useEffect } from 'react';
import { MessageSquare, Plus, ChevronDown, Check, X, Edit2, Maximize, Minimize, Save, FileText, Link, User, GraduationCap, HelpCircle, Zap, BookOpen, Heart, Briefcase } from 'lucide-react';
import QuotaIndicator from '../common/QuotaIndicator';
import { canPerformAction } from '../../config/chatLimits';

const ChatHeader = ({
  chatTitle,
  currentSubject,
  currentChatId,
  aiPersona,
  isFullScreen,
  isMobile,
  sidebarWidth,
  linkedContentForChat,
  chatHistoryList,
  messages,
  linkedContent,
  linkedChats,
  isSelectionMode,
  isEditingTitle,
  editTitleValue,
  setEditTitleValue,
  // setIsEditingTitle,
  // setShowPersonaSelector,
  // showPersonaSelector,
  onToggleFullScreen,
  onNewChat,
  onTitleEdit,
  onTitleSave,
  onTitleCancel,
  // onPersonaChange,
  onToggleSelectionMode,
  onLinkContent,
  onLinkChats,
  onShowQuotaModal
}) => {
  const titleInputRef = useRef(null);

  // AI Persona definitions
  // const aiPersonas = [
  //   { id: 'Educator', name: 'Educator', description: 'Comprehensive explanations with examples' },
  //   { id: 'Socratic', name: 'Socratic', description: 'Guides you to answers through questions' },
  //   { id: 'Concise', name: 'Concise', description: 'Brief, direct responses' },
  //   { id: 'Detailed', name: 'Detailed', description: 'In-depth, thorough explanations' },
  //   { id: 'Friendly', name: 'Friendly', description: 'Warm, encouraging tone' },
  //   { id: 'Formal', name: 'Formal', description: 'Professional, academic style' }
  // ];

  // Function to get styling for AI personas
  const getPersonaStyle = (personaId) => {
    switch (personaId) {
      case 'Educator':
        return {
          icon: GraduationCap,
          colors: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
          hoverColors: 'hover:bg-blue-200 dark:hover:bg-blue-800/40',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'Socratic':
        return {
          icon: HelpCircle,
          colors: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
          hoverColors: 'hover:bg-purple-200 dark:hover:bg-purple-800/40',
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'Concise':
        return {
          icon: Zap,
          colors: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
          hoverColors: 'hover:bg-yellow-200 dark:hover:bg-yellow-800/40',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'Detailed':
        return {
          icon: BookOpen,
          colors: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
          hoverColors: 'hover:bg-indigo-200 dark:hover:bg-indigo-800/40',
          iconColor: 'text-indigo-600 dark:text-indigo-400'
        };
      case 'Friendly':
        return {
          icon: Heart,
          colors: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
          hoverColors: 'hover:bg-pink-200 dark:hover:bg-pink-800/40',
          iconColor: 'text-pink-600 dark:text-pink-400'
        };
      case 'Formal':
        return {
          icon: Briefcase,
          colors: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
          hoverColors: 'hover:bg-gray-200 dark:hover:bg-gray-600',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
      default:
        return {
          icon: User,
          colors: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
          hoverColors: 'hover:bg-gray-200 dark:hover:bg-gray-600',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  // Effect to focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handles key down events for title input
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onTitleSave();
    } else if (e.key === 'Escape') {
      onTitleCancel();
    }
  };

  return (
    <div 
      className={`fixed z-30 bg-white dark:bg-gray-800 p-4 shadow-md border-b border-gray-200 dark:border-gray-700`}
      style={{
        top: isFullScreen 
          ? (linkedContentForChat ? '3rem' : '0') 
          : (isMobile ? (linkedContentForChat ? '7rem' : '4rem') : (linkedContentForChat ? '7rem' : '4rem')),
        left: isFullScreen || isMobile ? '0' : `${sidebarWidth + 4}px`,
        right: '0',
        width: isFullScreen || isMobile ? '100%' : `calc(100% - ${sidebarWidth + 4}px)`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Full Screen Toggle Button (Desktop only) */}
          {!isMobile && onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
          <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              // Title editing input field
              <div className="flex items-center space-x-2 mb-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  className="flex-1 text-xl font-semibold bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter chat title"
                  aria-label="Edit chat title"
                />
                <button
                  onClick={onTitleSave}
                  className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  title="Save title"
                  aria-label="Save chat title"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={onTitleCancel}
                  className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="Cancel editing"
                  aria-label="Cancel title editing"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // Display chat title and edit button
              <div className="flex items-center space-x-2 mb-1 group">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {chatTitle || 'Select a Chat'}
                </h1>
                {/* Conditionally render edit title button */}
                {currentChatId && canPerformAction(chatHistoryList.find(c => c.id === currentChatId), 'edit_title') && (
                  <button
                    onClick={onTitleEdit}
                    className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                    title="Edit title"
                    aria-label="Edit chat title"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {/* Compact Quota Indicator */}
                <QuotaIndicator 
                  currentMessages={messages.length}
                  filesUploaded={messages.reduce((count, msg) => count + (msg.files?.length || 0), 0)}
                  totalFileSize={messages.reduce((size, msg) => size + (msg.files?.reduce((fileSize, file) => fileSize + (file.size || 0), 0) || 0), 0)}
                  dailyChatsUsed={chatHistoryList.length}
                  contentFilesUsed={linkedContent ? 1 : 0}
                  chatCardsUsed={linkedChats.length}
                  showDetails={false}
                  onClick={onShowQuotaModal}
                />
              </div>
            )}
            {currentSubject && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentSubject}</p>
            )}
          </div>
        </div>
        
        {/* Header Controls */}
        <div className="flex items-center space-x-2">
          {/* Start New Chat Button */}
          <button
            onClick={() => onNewChat && onNewChat()}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            title="Start New Chat"
            aria-label="Start a new chat"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
          
          {/* AI Persona Indicator (Read-Only) */}
          {currentChatId && (
            <div className="relative">
              {(() => {
                const currentPersonaStyle = getPersonaStyle(aiPersona);
                const PersonaIcon = currentPersonaStyle?.icon || User;
                
                return (
                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-sm ${
                      currentPersonaStyle
                        ? `${currentPersonaStyle.colors} border-current`
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                    }`}
                    title={`Current AI Persona: ${aiPersona} (Auto-Selected)`}
                    aria-label="Current AI Persona"
                  >
                    <PersonaIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{aiPersona}</span>
                    <div className="text-xs opacity-60 ml-1">(Auto)</div>
                  </div>
                );
              })()} 
            </div>
          )}

          {/* Save Segment Button */}
          <button
            onClick={() => currentChatId && onToggleSelectionMode()}
            disabled={!currentChatId}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              !currentChatId
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : isSelectionMode
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60'
            }`}
            title={!currentChatId ? 'Select a chat to save messages' : (isSelectionMode ? 'Exit Selection Mode' : 'Select Messages to Save')}
            aria-label={isSelectionMode ? 'Exit selection mode' : 'Select messages to save'}
          >
            <Save className="w-4 h-4" />
            <span className="text-sm">{isSelectionMode ? 'Cancel' : 'Select'}</span>
          </button>

          {/* Link Content Button */}
          {(() => {
            const currentChat = chatHistoryList.find(c => c.id === currentChatId);
            const canLinkContentAction = currentChatId && canPerformAction(currentChat, 'link_content');
            
            return (
              <button
                onClick={() => canLinkContentAction && onLinkContent()}
                disabled={!canLinkContentAction}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  canLinkContentAction
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                title={
                  !currentChatId 
                    ? 'Select a chat to link content' 
                    : !canLinkContentAction
                      ? 'Content linking not available in this mode'
                      : 'Link Content History'
                }
                aria-label="Link content"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">Content</span>
              </button>
            );
          })()}
          
          {/* Link Chat Button */}
          {(() => {
            const currentChat = chatHistoryList.find(c => c.id === currentChatId);
            const canLinkChatAction = currentChatId && canPerformAction(currentChat, 'link_chat');
            
            return (
              <button
                onClick={() => canLinkChatAction && onLinkChats()}
                disabled={!canLinkChatAction}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  canLinkChatAction
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                title={
                  !currentChatId 
                    ? 'Select a chat to link other chats' 
                    : !canLinkChatAction
                      ? 'Chat linking not available in General Mode (keeps discussions focused)'
                      : 'Link Previous Chats'
                }
                aria-label="Link previous chats"
              >
                <Link className="w-4 h-4" />
                <span className="text-sm">Link</span>
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
