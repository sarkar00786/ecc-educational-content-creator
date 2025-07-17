import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Menu, X } from 'lucide-react';
import ChatHistorySidebar from './ChatHistorySidebar';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import ResizableSplitter from './ResizableSplitter';
import PartyCelebration from '../common/PartyCelebration';
import usePartyCelebration from '../../hooks/usePartyCelebration';
import { canCreateChat, recordNewChat } from '../../utils/quotaManager';
import { isGeneralMode } from '../../config/chatLimits';

const ChatPage = ({ user, db, onError, onSuccess, linkedContentForChat, setLinkedContentForChat, contentHistory = [], onNavigateToContent, callGeminiAPI }) => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width for sidebar

  // Party celebration for new chat creation
  const partyCelebration = usePartyCelebration({
    intensity: 'festive', // More intense for chat creation
    duration: 4000,
    cooldownPeriod: 5000 // 5 seconds cooldown
  });

  const appId = 'ecc-app-ab284';

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for chat updates from ChatWindow to immediately update sidebar
  useEffect(() => {
    const handleChatUpdate = (event) => {
      const { chatId, updates } = event.detail;
      
      // Only update if the chat actually exists in the list to prevent unnecessary re-renders
      setChatHistoryList(prevList => {
        const chatExists = prevList.some(chat => chat.id === chatId);
        if (!chatExists) return prevList;
        
        // Check if updates actually changed to prevent unnecessary re-renders
        return prevList.map(chat => {
          if (chat.id === chatId) {
            // Only update if there are actual changes
            const hasChanges = Object.keys(updates).some(key => 
              JSON.stringify(chat[key]) !== JSON.stringify(updates[key])
            );
            return hasChanges ? { ...chat, ...updates } : chat;
          }
          return chat;
        });
      });
    };

    window.addEventListener('chatUpdated', handleChatUpdate);
    return () => window.removeEventListener('chatUpdated', handleChatUpdate);
  }, []);

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    if (!user || !db) {
      onError('Please log in to create a new chat');
      return;
    }
    setShowNewChatModal(true);
  };

  const handleCreateChat = async (chatData) => {
    if (!user || !db) {
      onError('Please log in to create a new chat');
      return;
    }

    // Check quota limits based on whether it's general mode
    const isGeneral = isGeneralMode(chatData);
    if (!canCreateChat(isGeneral)) {
      onError('Daily chat limit reached. Try General Mode for unlimited chats.');
      return;
    }

    setIsCreatingChat(true);
    try {
      // Create a new chat document with temporary title
      const newChatData = {
        userId: user.uid,
        subject: chatData.subject,
        title: 'New Chat', // Temporary title - will be auto-generated from first message
        isGeneral: chatData.isGeneral,
        isPinned: false,
        isArchived: false,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        messages: [],
        linkedChats: [],
        linkedContent: null,
        aiPersona: 'Educator'
      };

      const chatsPath = `artifacts/${appId}/users/${user.uid}/chats`;
      const docRef = await addDoc(collection(db, chatsPath), newChatData);
      
      // Record the new chat for quota tracking (general mode is exempt)
      recordNewChat(isGeneral);
      
      // Create a complete chat object for immediate UI update
      const completeNewChat = {
        id: docRef.id,
        ...newChatData,
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      
      // Update the chat history list immediately to show the new chat in sidebar
      setChatHistoryList(prevList => [completeNewChat, ...prevList]);
      
      setCurrentChatId(docRef.id);
      setShowNewChatModal(false);
      if (isMobile) {
        setIsSidebarOpen(false);
      }
      onSuccess(`${chatData.subject} chat created successfully!`);
      
      // Trigger party celebration for new chat creation
      partyCelebration.startCelebration();
      console.log('🎉 Chat creation celebration triggered!');
    } catch (error) {
      console.error('Error creating new chat:', error);
      onError('Failed to create new chat');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleCloseNewChatModal = () => {
    setShowNewChatModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleChatHistoryChange = (chatList) => {
    setChatHistoryList(chatList);
  };

  // Navigation handlers
  const handleNavigateToChat = (chatId) => {
    setCurrentChatId(chatId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleNavigateToContent = (contentId) => {
    if (onNavigateToContent) {
      onNavigateToContent(contentId);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute top-20 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 md:hidden"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden in full screen mode */}
      {!isFullScreen && (
        <div 
          className={`${
            isMobile 
              ? `fixed left-0 top-16 h-[calc(100vh-64px)] z-40 transform transition-transform duration-300 ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : isSidebarOpen 
                ? 'relative h-screen' 
                : 'hidden'
          }`}
          style={{ width: isMobile ? '256px' : `${sidebarWidth}px` }}
        >
          <ChatHistorySidebar
            user={user}
            db={db}
            onSelectChat={handleSelectChat}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onError={onError}
            onSuccess={onSuccess}
            onChatHistoryChange={handleChatHistoryChange}
            onToggleSidebar={toggleSidebar}
            isMobile={isMobile}
            sidebarWidth={sidebarWidth}
          />
        </div>
      )}

      {/* Resizable Splitter */}
      <ResizableSplitter 
        onResize={(newWidth) => setSidebarWidth(newWidth)}
        initialWidth={sidebarWidth}
        currentWidth={sidebarWidth}
        isVisible={!isFullScreen && !isMobile && isSidebarOpen}
        className="bg-gray-200 dark:bg-gray-700"
      />

      {/* Main Chat Window */}
      <div className={`${
        isFullScreen 
          ? 'fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900' 
          : 'flex-1 flex flex-col h-screen'
      }`}>
        <ChatWindow
          user={user}
          db={db}
          currentChatId={currentChatId}
          onError={onError}
          onSuccess={onSuccess}
          chatHistoryList={chatHistoryList}
          linkedContentForChat={linkedContentForChat}
          setLinkedContentForChat={setLinkedContentForChat}
          contentHistory={contentHistory}
          onToggleSidebar={toggleSidebar}
          onToggleFullScreen={toggleFullScreen}
          isMobile={isMobile}
          isFullScreen={isFullScreen}
          onNewChat={handleNewChat}
          sidebarWidth={sidebarWidth}
          onNavigateToChat={handleNavigateToChat}
          onNavigateToContent={handleNavigateToContent}
          callGeminiAPI={callGeminiAPI}
        />
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={handleCloseNewChatModal}
        onCreateChat={handleCreateChat}
        isCreating={isCreatingChat}
      />
    </div>
    
    {/* Party Celebration Animation */}
    <PartyCelebration {...partyCelebration.celebrationProps} />
    </>
  );
};

export default ChatPage;
