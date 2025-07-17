import React, { useState, useRef, useEffect } from 'react';
import { Pin, Archive, Trash2, MoreHorizontal, MessageSquare, PinIcon, Link, Calculator, Atom, FlaskConical, Clock, BookOpen, DollarSign, Edit2, Check, X, FileText } from 'lucide-react';

const ChatCard = React.memo(({ 
  chat, 
  isSelected, 
  onSelect, 
  onDelete, 
  onArchive, 
  onPin,
  onUpdateTitle,
  isGeneral = false,
  // isLinked = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(chat.title || 'Untitled Chat');
  const menuRef = useRef(null);
  const titleInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Update local title when chat prop changes
  useEffect(() => {
    setEditTitleValue(chat.title || 'Untitled Chat');
  }, [chat.title]);

  const handleCardClick = () => {
    if (!isEditingTitle) {
      onSelect(chat.id);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'pin':
        onPin && onPin(chat.id);
        break;
      case 'archive':
        onArchive && onArchive(chat.id);
        break;
      case 'delete':
        onDelete && onDelete(chat.id);
        break;
      case 'edit':
        setIsEditingTitle(true);
        break;
      default:
        break;
    }
  };

  const handleTitleEdit = (e) => {
    e.stopPropagation();
    if (!isGeneral) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = (e) => {
    e.stopPropagation();
    const trimmedTitle = editTitleValue.trim();
    if (trimmedTitle && trimmedTitle !== chat.title && onUpdateTitle) {
      onUpdateTitle(chat.id, trimmedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = (e) => {
    e.stopPropagation();
    setEditTitleValue(chat.title || 'Untitled Chat');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave(e);
    } else if (e.key === 'Escape') {
      handleTitleCancel(e);
    }
  };

  const handleTitleInputClick = (e) => {
    e.stopPropagation();
  };

  // Get the first message from AI as a preview
  const getPreviewText = () => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    // Find the first AI message
    const aiMessage = chat.messages.find(msg => msg.role === 'model' || msg.role === 'assistant');
    if (aiMessage) {
      return aiMessage.text.slice(0, 50) + (aiMessage.text.length > 50 ? '...' : '');
    }
    
    // If no AI message, show first user message
    const firstMessage = chat.messages[0];
    return firstMessage.text.slice(0, 50) + (firstMessage.text.length > 50 ? '...' : '');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'Mathematics':
        return { icon: Calculator, color: 'text-green-600 dark:text-green-400' };
      case 'Science':
        return { icon: Atom, color: 'text-purple-600 dark:text-purple-400' };
      case 'Physics':
        return { icon: Atom, color: 'text-indigo-600 dark:text-indigo-400' };
      case 'Chemistry':
        return { icon: FlaskConical, color: 'text-orange-600 dark:text-orange-400' };
      case 'History':
        return { icon: Clock, color: 'text-amber-600 dark:text-amber-400' };
      case 'Literature':
        return { icon: BookOpen, color: 'text-rose-600 dark:text-rose-400' };
      case 'Accounting & Finance':
        return { icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400' };
      case 'General':
      default:
        return { icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400' };
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative p-1.5 rounded-lg cursor-pointer transition-all duration-200 group ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-900/40 border-l-3 border-blue-600' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${isGeneral ? 'border border-green-200 dark:border-green-800' : ''}`}
    >
      {/* Main Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title with indicators */}
          <div className="flex items-center space-x-1 mb-1">
            {isGeneral && (
              <MessageSquare className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
            )}
            
            {isEditingTitle ? (
              <div className="flex items-center space-x-1 flex-1 min-w-0">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onClick={handleTitleInputClick}
                  className="flex-1 min-w-0 px-1 py-0.5 text-xs bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter chat title"
                />
                <button
                  onClick={handleTitleSave}
                  className="p-0.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex-shrink-0"
                  title="Save title"
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="p-0.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
                  title="Cancel editing"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 flex-1 min-w-0 group">
                <h4 className={`font-medium text-xs truncate ${
                  isSelected 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {chat.title || 'Untitled Chat'}
                </h4>
                {!isGeneral && (
                  <button
                    onClick={handleTitleEdit}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity flex-shrink-0"
                    title="Edit title"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}
            
            {chat.isPinned && (
              <Pin className="w-2.5 h-2.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" data-testid="pin-icon" />
            )}
          </div>

          {/* Preview text */}
          <div className="mb-1">
            <p className={`text-xs truncate ${
              isSelected 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {getPreviewText()}
            </p>
          </div>

          {/* Subject and metadata row */}
          <div className="flex items-center justify-between mb-1">
            {/* Subject Tag */}
            {chat.subject && !isGeneral && (
              <span className={`inline-flex items-center space-x-1 px-1 py-0.5 text-xs rounded ${
                isSelected 
                  ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {(() => {
                  const { icon: SubjectIcon, color } = getSubjectIcon(chat.subject);
                  return (
                    <>
                      <SubjectIcon className={`w-2 h-2 ${color}`} />
                      <span className="text-xs">{chat.subject}</span>
                    </>
                  );
                })()}
              </span>
            )}

            {/* Right side indicators */}
            <div className="flex flex-col items-end space-y-1">
              {/* Attachment indicators container */}
              <div className="flex flex-col items-end space-y-1">
                {/* Linked Chat Indicator */}
                {chat.linkedChats && chat.linkedChats.length > 0 && (
                  <span className={`inline-flex items-center space-x-1 px-1 py-0.5 text-xs rounded ${
                    isSelected 
                      ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' 
                      : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  }`}>
                    <Link className="w-2 h-2" />
                    <span className="text-xs">{chat.linkedChats.length}</span>
                  </span>
                )}
                
                {/* Linked Content Indicator */}
                {chat.linkedContent && (
                  <span className={`inline-flex items-center space-x-1 px-1 py-0.5 text-xs rounded ${
                    isSelected 
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
                      : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  }`}>
                    <FileText className="w-2 h-2" />
                    <span className="text-xs">content</span>
                  </span>
                )}
              </div>
              
              {/* Last Updated */}
              <span className={`text-xs ${
                isSelected 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {formatDate(chat.lastUpdated)}
              </span>
            </div>
          </div>

        </div>

        {/* Action Menu */}
        {!isGeneral && (
          <div className="relative ml-1">
            <button
              onClick={handleMenuClick}
              className={`p-0.5 rounded transition-all duration-200 opacity-100 ${
                isSelected 
                  ? 'hover:bg-blue-200 dark:hover:bg-blue-800' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${
                isSelected 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-800 dark:text-gray-400'
              }`}
              aria-label="More options"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                {onUpdateTitle && (
                  <button
                    onClick={(e) => handleAction('edit', e)}
                    className="w-full text-left px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Title</span>
                  </button>
                )}
                {onPin && (
                  <button
                    onClick={(e) => handleAction('pin', e)}
                    className="w-full text-left px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <Pin className="w-3 h-3" />
                    <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                )}
                {onArchive && (
                  <button
                    onClick={(e) => handleAction('archive', e)}
                    className="w-full text-left px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>{chat.isArchived ? 'Unarchive' : 'Archive'}</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => handleAction('delete', e)}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Special indicator for General chat */}
      {isGeneral && (
        <div className="absolute top-1 right-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
});

export default ChatCard;
