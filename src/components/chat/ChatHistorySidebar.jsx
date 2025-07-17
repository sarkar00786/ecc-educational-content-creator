import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Plus, ChevronDown, ChevronRight, Pin, Archive, MessageSquare, Trash2, MoreHorizontal } from 'lucide-react';
import ChatCard from './ChatCard';

const ChatHistorySidebar = ({ 
  user, 
  db, 
  onSelectChat, 
  currentChatId, 
  onNewChat, 
  // onDeleteChat, 
  // onArchiveChat, 
  // onPinChat,
  onError,
  onSuccess,
  onChatHistoryChange,
  // onToggleSidebar,
  // isMobile,
  // sidebarWidth = 256
}) => {
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_generalChatId, setGeneralChatId] = useState(null);

  const appId = 'ecc-app-ab284'; // Use the same appId as in ChatPage.jsx - matching the Firebase project

  // Create General chat if it doesn't exist
  const createGeneralChat = useCallback(async () => {
    if (!user || !db) return;

    try {
      const generalChatData = {
        userId: user.uid,
        subject: 'General',
        title: 'General Discussion',
        isGeneral: true,
        isPinned: false,
        isArchived: false,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        messages: []
      };

      const chatsPath = `artifacts/${appId}/users/${user.uid}/chats`;
      const docRef = await addDoc(collection(db, chatsPath), generalChatData);
      setGeneralChatId(docRef.id);
    } catch (error) {
      console.error('Error creating General chat:', error);
      onError('Failed to create General chat');
    }
  }, [user, db, onError]);

  // Real-time listener for chats
  useEffect(() => {
    if (!db || !user?.uid) return;

    const chatsPath = `artifacts/${appId}/users/${user.uid}/chats`;
    const q = query(collection(db, chatsPath), orderBy('lastUpdated', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Only update if chats actually changed to prevent unnecessary re-renders
      setChatHistoryList(prevChats => {
        // Simple comparison - if lengths are different, definitely changed
        if (prevChats.length !== chats.length) {
          return chats;
        }
        
        // Check if any chat has actually changed with more thorough comparison
        let hasChanged = false;
        for (let i = 0; i < chats.length; i++) {
          const newChat = chats[i];
          const oldChat = prevChats[i];
          
          if (!oldChat || newChat.id !== oldChat.id || 
              newChat.title !== oldChat.title || 
              newChat.lastUpdated?.seconds !== oldChat.lastUpdated?.seconds ||
              newChat.messages?.length !== oldChat.messages?.length) {
            hasChanged = true;
            break;
          }
        }
        
        // If no changes detected, return the exact same reference to prevent re-renders
        return hasChanged ? chats : prevChats;
      });
      
      setIsLoading(false);
      onChatHistoryChange?.(chats);

      // Find or create General chat
      const generalChat = chats.find(chat => chat.subject === 'General' && chat.isGeneral);
      if (generalChat) {
        setGeneralChatId(generalChat.id);
      } else {
        createGeneralChat();
      }
    }, (error) => {
      console.error('Error fetching chats:', error);
      onError('Failed to load chat history');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, user?.uid, onError, onChatHistoryChange, createGeneralChat]);

  // Filter chats based on search term
  const filteredChats = useMemo(() => {
    if (!searchTerm) return chatHistoryList;
    
    return chatHistoryList.filter(chat => 
      chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.messages?.some(msg => msg.text?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [chatHistoryList, searchTerm]);

  // Organize chats by category
  const organizedChats = useMemo(() => {
    const pinnedChats = filteredChats.filter(chat => chat.isPinned && !chat.isArchived);
    const recentChats = filteredChats.filter(chat => !chat.isPinned && !chat.isArchived);
    const archivedChats = filteredChats.filter(chat => chat.isArchived);

    return {
      pinnedChats,
      recentChats,
      archivedChats
    };
  }, [filteredChats]);

  const handleNewChat = () => {
    onNewChat();
  };

  const handleSelectChat = useCallback((chatId) => {
    onSelectChat(chatId);
  }, [onSelectChat]);

  const handleDeleteChat = useCallback(async (chatId) => {
    if (!user || !db) return;

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, chatId);
      await deleteDoc(chatRef);
      onSuccess('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      onError('Failed to delete chat');
    }
  }, [user, db, onSuccess, onError]);

  const handleDeleteChatWithConfirmation = useCallback((chatId) => {
    const chat = chatHistoryList.find(c => c.id === chatId);
    const chatTitle = chat?.title || 'Untitled Chat';
    
    onError(
      `Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`,
      'confirmation',
      {
        onConfirm: () => handleDeleteChat(chatId),
        confirmText: 'Delete',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      }
    );
  }, [chatHistoryList, onError, handleDeleteChat]);

  const handleArchiveChat = useCallback(async (chatId) => {
    if (!user || !db) return;

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, chatId);
      const chat = chatHistoryList.find(c => c.id === chatId);
      
      await updateDoc(chatRef, {
        isArchived: !chat.isArchived,
        lastUpdated: serverTimestamp()
      });
      
      onSuccess(chat.isArchived ? 'Chat unarchived' : 'Chat archived');
    } catch (error) {
      console.error('Error archiving chat:', error);
      onError('Failed to archive chat');
    }
  }, [user, db, chatHistoryList, onSuccess, onError]);

  const handlePinChat = useCallback(async (chatId) => {
    if (!user || !db) return;

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, chatId);
      const chat = chatHistoryList.find(c => c.id === chatId);
      
      // Check if we're trying to pin a chat and we already have 3 pinned chats
      if (!chat.isPinned) {
        const pinnedChats = chatHistoryList.filter(c => c.isPinned);
        if (pinnedChats.length >= 3) {
          onError('You can only pin up to 3 chats at a time. Please unpin a chat first.');
          return;
        }
      }
      
      await updateDoc(chatRef, {
        isPinned: !chat.isPinned,
        lastUpdated: serverTimestamp()
      });
      
      onSuccess(chat.isPinned ? 'Chat unpinned' : 'Chat pinned');
    } catch (error) {
      console.error('Error pinning chat:', error);
      onError('Failed to pin chat');
    }
  }, [user, db, chatHistoryList, onError, onSuccess]);

  const handleUpdateTitle = useCallback(async (chatId, newTitle) => {
    if (!user || !db) return;

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, chatId);
      
      await updateDoc(chatRef, {
        title: newTitle,
        lastUpdated: serverTimestamp()
      });
      
      onSuccess('Chat title updated');
    } catch (error) {
      console.error('Error updating chat title:', error);
      onError('Failed to update chat title');
    }
  }, [user, db, onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="progressbar" aria-label="Loading chats"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Search Bar and New Chat Button */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Chats */}
        {organizedChats.pinnedChats.length > 0 && (
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
              Pinned Chats
            </h3>
            <div className="space-y-1">
              {organizedChats.pinnedChats.map((chat) => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  isSelected={currentChatId === chat.id}
                  onSelect={handleSelectChat}
                  onDelete={handleDeleteChatWithConfirmation}
                  onArchive={handleArchiveChat}
                  onPin={handlePinChat}
                  onUpdateTitle={handleUpdateTitle}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        {organizedChats.recentChats.length > 0 && (
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
              Recent Chats
            </h3>
            <div className="space-y-1">
              {organizedChats.recentChats.map((chat) => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  isSelected={currentChatId === chat.id}
                  onSelect={handleSelectChat}
                  onDelete={handleDeleteChatWithConfirmation}
                  onArchive={handleArchiveChat}
                  onPin={handlePinChat}
                  onUpdateTitle={handleUpdateTitle}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archived Chats */}
        {organizedChats.archivedChats.length > 0 && (
          <div className="p-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center space-x-2 w-full text-left px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {showArchived ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Archived ({organizedChats.archivedChats.length})</span>
            </button>
            {showArchived && (
              <div className="space-y-1 mt-2">
                {organizedChats.archivedChats.map((chat) => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    isSelected={currentChatId === chat.id}
                    onSelect={handleSelectChat}
                    onDelete={handleDeleteChatWithConfirmation}
                    onArchive={handleArchiveChat}
                    onPin={handlePinChat}
                    onUpdateTitle={handleUpdateTitle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? 'No chats found' : 'No chats yet'}
            </p>
            {searchTerm && (
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Try adjusting your search
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
