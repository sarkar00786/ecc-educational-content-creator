import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { uploadFile } from '../../services/firebase';
import useVoiceControl from '../../hooks/useVoiceControl';
import { MessageSquare, Send, Mic, MicOff, Plus, Link, X, Settings, User, ChevronDown, Save, CheckSquare, Square, FileText, Menu, ArrowLeft, Edit2, Check, Maximize, Minimize, GraduationCap, HelpCircle, Zap, BookOpen, Heart, Briefcase } from 'lucide-react';
import LinkChatModal from './LinkChatModal';
import LinkContentModal from './LinkContentModal';
import ChatInput from './ChatInput';
import ChatMessageRenderer from './ChatMessageRenderer';
import SaveSegmentModal from './SaveSegmentModal';
import { HybridChatOptimizer } from '../../utils/optimization/HybridChatOptimizer';
import { CHAT_LIMITS, isGeneralMode, getEffectiveLimits, canPerformAction } from '../../config/chatLimits';
import QuotaIndicator from '../common/QuotaIndicator';
import QuotaModal from '../common/QuotaModal';
import PersonalizationEngine from '../../utils/personalizationEngine';
import UserInteractionRecorder from '../../utils/userInteractionRecorder';
import { memoryManager } from '../../utils/conversationMemory';
import { analyzeMessage } from '../../utils/messageClassifier';
import { 
  dailyQuotaManager, 
  canSendMessage, 
  recordMessage, 
  getUsageStats,
  initializeChatLimits,
  canUploadFiles,
  canLinkContent,
  canLinkChats,
  recordFileUpload,
  recordContentLinking,
  recordChatLinking,
  getChatLimitationsStatus
} from '../../utils/quotaManager';
import { subjects } from '../../config/subjects';
import { aiPersonasConfig } from '../../config/aiPersonas';
import { analyzePersonaForMessage } from '../../utils/aiPersonas';

const ChatWindow = ({ user, db, currentChatId, onError, onSuccess, chatHistoryList = [], linkedContentForChat, setLinkedContentForChat, contentHistory = [], onToggleSidebar, onToggleFullScreen, isMobile, isFullScreen, onNewChat, sidebarWidth, onNavigateToChat, onNavigateToContent, callGeminiAPI }) => {
  // Consolidated state management using useReducer
  const initialChatState = {
    currentSubject: '',
    messages: [],
    isTyping: false,
    inputValue: '',
    chatTitle: '',
    linkedChats: [],
    linkedContent: null,
    aiPersona: 'Educator',
    selectedMessages: new Set(),
    isSelectionMode: false,
    showSaveModal: false,
    isSaving: false,
    isEditingTitle: false,
    editTitleValue: '',
    isLoading: false
  };

  function chatReducer(state, action) {
    switch (action.type) {
      case 'SET_CURRENT_SUBJECT':
        return { ...state, currentSubject: action.payload };
      case 'SET_MESSAGES':
        return { ...state, messages: action.payload };
      case 'ADD_MESSAGE':
        return { ...state, messages: [...state.messages, action.payload] };
      case 'SET_INPUT_VALUE':
        return { ...state, inputValue: action.payload };
      case 'SET_TYPING':
        return { ...state, isTyping: action.payload };
      case 'SET_CHAT_TITLE':
        return { ...state, chatTitle: action.payload };
      case 'SET_LINKED_CHATS':
        return { ...state, linkedChats: action.payload };
      case 'SET_LINKED_CONTENT':
        return { ...state, linkedContent: action.payload };
      case 'SET_AI_PERSONA':
        return { ...state, aiPersona: action.payload };
      case 'SET_SELECTED_MESSAGES':
        return { ...state, selectedMessages: action.payload };
      case 'SET_SELECTION_MODE':
        return { ...state, isSelectionMode: action.payload };
      case 'SET_SHOW_SAVE_MODAL':
        return { ...state, showSaveModal: action.payload };
      case 'SET_SAVING':
        return { ...state, isSaving: action.payload };
      case 'SET_EDITING_TITLE':
        return { ...state, isEditingTitle: action.payload };
      case 'SET_EDIT_TITLE_VALUE':
        return { ...state, editTitleValue: action.payload };
      case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
      case 'RESET_CHAT':
        return {
          ...initialChatState,
          // Keep certain values that shouldn't reset
          currentSubject: state.currentSubject,
          aiPersona: state.aiPersona
        };
      default:
        return state;
    }
  }

  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);

  // Refs for DOM elements
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const titleInputRef = useRef(null);

  // Voice control hook
  const { startListening, stopListening, transcript, isListening, isSupported } = useVoiceControl();

  // Additional state variables for modal and UI control
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkContentModal, setShowLinkContentModal] = useState(false);
  // Removed persona selector - now auto-selected based on context
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [contentAttachmentProgress, setContentAttachmentProgress] = useState(null);
  const [contentAttachmentStatus, setContentAttachmentStatus] = useState(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendingController, setSendingController] = useState(null);
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Initialize personalization system
  const userMemory = useMemo(() => {
    return user ? memoryManager.getUserMemory(user.uid) : null;
  }, [user]);

  const interactionRecorder = useMemo(() => {
    return user ? new UserInteractionRecorder(user.uid) : null;
  }, [user]);

  const personalizationEngine = useMemo(() => {
    return (userMemory && interactionRecorder) ? 
      new PersonalizationEngine(userMemory, interactionRecorder) : null;
  }, [userMemory, interactionRecorder]);

  // App ID for Firestore paths
  const appId = 'ecc-app-ab284';

  // Intelligent persona selection based on context - optimized to prevent excessive re-renders
  const selectPersonaBasedOnContext = useCallback((userMessage, userState, currentSubject) => {
    // Import persona analysis and blending - moved to dynamic import
    // const { analyzePersonaForMessage, blendPersonaCharacteristics } = require('../../utils/aiPersonas');
    
    try {
      // Analyze the message for persona recommendations
      const analysis = analyzePersonaForMessage(userMessage, {
        userState,
        currentSubject,
        conversationHistory: chatState.messages,
        userPreferences: userMemory?.userPreferences || {}
      });
      
      // Select the best persona based on analysis
      const selectedPersona = analysis.recommendedPersona || 'Educator';
      
      // Update the persona if it's different from current
      if (selectedPersona !== chatState.aiPersona) {
        console.log(`Auto-selecting persona: ${selectedPersona} based on context analysis`);
        chatDispatch({ type: 'SET_AI_PERSONA', payload: selectedPersona });
        
        // Update Firestore with the new persona - use setTimeout to prevent blocking
        if (currentChatId && user && db) {
          setTimeout(() => {
            const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
            updateDoc(chatRef, {
              aiPersona: selectedPersona,
              lastUpdated: serverTimestamp()
            }).catch(error => {
              console.error('Error updating persona in Firestore:', error);
            });
          }, 0);
        }
      }
      
      return selectedPersona;
    } catch (error) {
      console.error('Error in persona selection:', error);
      return chatState.aiPersona || 'Educator';
    }
  }, [chatState.aiPersona, userMemory?.userPreferences, currentChatId, user, db]); // Removed chatState.messages to prevent frequent re-creation

  // Memoized function to get styling for AI personas using external config
  const getPersonaStyle = useMemo(() => {
    return (personaId) => {
      const persona = aiPersonasConfig.find(p => p.id === personaId);
      if (!persona) {
        return {
          icon: User,
          colors: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
          hoverColors: 'hover:bg-gray-200 dark:hover:bg-gray-600',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
      }
      return persona;
    };
  }, []);

  // Memoized current persona style to prevent recalculation
  const currentPersonaStyle = useMemo(() => {
    return currentChatId ? getPersonaStyle(chatState.aiPersona) : null;
  }, [currentChatId, chatState.aiPersona, getPersonaStyle]);

  // Memoized current chat for button states
  const currentChat = useMemo(() => {
    return chatHistoryList.find(c => c.id === currentChatId);
  }, [chatHistoryList, currentChatId]);

  // Memoized button states to prevent recalculation
  const buttonStates = useMemo(() => {
    const canLinkContentAction = currentChatId && canPerformAction(currentChat, 'link_content');
    const canLinkChatAction = currentChatId && canPerformAction(currentChat, 'link_chat');
    
    return {
      canLinkContent: canLinkContentAction,
      canLinkChat: canLinkChatAction,
      isGeneral: isGeneralMode(currentChat)
    };
  }, [currentChatId, currentChat, canPerformAction, isGeneralMode]);

  // Scrolls the chat messages to the bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end",
          inline: "nearest"
        });
      });
    }
  }, []);
  
  // Scrolls to show user message under header (like Gemini)
  const scrollToShowUserMessage = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const headerHeight = 120; // Approximate header height
      const bannerHeight = linkedContentForChat ? 48 : 0;
      const totalHeaderHeight = headerHeight + bannerHeight;
      
      // Scroll to show user message just under the header
      container.scrollTop = container.scrollHeight - container.clientHeight + totalHeaderHeight;
    }
  }, [linkedContentForChat]);

  // Check if the user is scrolled to the bottom
  const checkIfScrolledToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      setIsScrolledToBottom(isAtBottom);
    }
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    checkIfScrolledToBottom();
  }, [checkIfScrolledToBottom]);

  // Effect to add scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Effect to handle scrolling behavior - only scroll when user is at bottom
  useEffect(() => {
    if (chatState.messages.length === 0) return;
    
    // Only auto-scroll if user is already at the bottom
    if (isScrolledToBottom) {
      const lastMessage = chatState.messages[chatState.messages.length - 1];
      
      if (lastMessage && lastMessage.role === 'user') {
        // For user messages, show them under the header immediately
        requestAnimationFrame(() => {
          scrollToShowUserMessage();
        });
      } else if (lastMessage && lastMessage.role === 'model') {
        // For AI messages, scroll to bottom to show the response
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }
  }, [chatState.messages.length, isScrolledToBottom]); // Reduced dependencies to only length
  
  // Effect for forced scrolling when needed
  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, scrollToBottom]);

  // Effect to check scroll position on mount
  useEffect(() => {
    checkIfScrolledToBottom();
  }, [checkIfScrolledToBottom]);

  // Function to load chat data from Firestore
  const loadChat = useCallback(async (chatId) => {
    chatDispatch({ type: 'SET_LOADING', payload: true });
    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // Ensure messages are properly formatted with timestamps if they are Firestore Timestamps
        const loadedMessages = (chatData.messages || []).map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : msg.timestamp // Convert Firestore Timestamp to Date object
        }));
        chatDispatch({ type: 'SET_MESSAGES', payload: loadedMessages });
        chatDispatch({ type: 'SET_CURRENT_SUBJECT', payload: chatData.subject || '' });
        const title = chatData.title || 'Untitled Chat';
        chatDispatch({ type: 'SET_CHAT_TITLE', payload: title });
        chatDispatch({ type: 'SET_EDIT_TITLE_VALUE', payload: title });
        chatDispatch({ type: 'SET_LINKED_CHATS', payload: chatData.linkedChats || [] });
        chatDispatch({ type: 'SET_LINKED_CONTENT', payload: chatData.linkedContent || null });
        chatDispatch({ type: 'SET_AI_PERSONA', payload: chatData.aiPersona || 'Educator' });
      } else {
        onError('Chat not found');
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      onError('Failed to load chat');
    } finally {
      chatDispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [db, user, onError]);

  // Effect to load chat data when currentChatId, user, or db changes
  useEffect(() => {
    if (currentChatId && user && db) {
      loadChat(currentChatId);
      initializeChatLimits(currentChatId); // Initialize per-chat limitations tracking
    } else {
      // Reset state when no chat is selected
      chatDispatch({ type: 'RESET_CHAT' });
    }
  }, [currentChatId, user, db, loadChat]);

  // Formats chat messages for the AI API
  const formatChatHistoryForAPI = (msgs) => {
    return msgs.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
  };

  // Effect to focus title input when editing starts
  useEffect(() => {
    if (chatState.isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [chatState.isEditingTitle]);

  // Effect to update edit title value when chatTitle changes
  useEffect(() => {
    chatDispatch({ type: 'SET_EDIT_TITLE_VALUE', payload: chatState.chatTitle });
  }, [chatState.chatTitle]);

  // Effect to handle linkedContentForChat initialization (for new chats with linked content)
  useEffect(() => {
    if (linkedContentForChat && !currentChatId && user && db) {
      const initializeChatWithContent = async () => {
        try {
          const newChatData = {
            userId: user.uid,
            subject: 'Content Discussion',
            title: `Discussion: ${linkedContentForChat.name}`,
            isGeneral: false,
            isPinned: false,
            isArchived: false,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            messages: []
          };

          const chatsPath = `artifacts/${appId}/users/${user.uid}/chats`;
          const docRef = await addDoc(collection(db, chatsPath), newChatData);
          
          // Initial message to AI with linked content details
          const initialHistory = [
            {
              role: 'user',
              text: `I've linked this content for discussion: "${linkedContentForChat.name}". Here's the content:\n\n${linkedContentForChat.generatedContent}\n\nI'd like to discuss this content with you. What are your initial thoughts or questions, and how can we start working on it?`,
              timestamp: new Date()
            }
          ];

          chatDispatch({ type: 'SET_MESSAGES', payload: initialHistory });
          chatDispatch({ type: 'SET_CURRENT_SUBJECT', payload: 'Content Discussion' });
          chatDispatch({ type: 'SET_CHAT_TITLE', payload: `Discussion: ${linkedContentForChat.name}` });
          
          // Send initial message to AI to get its response
          const chatHistory = formatChatHistoryForAPI(initialHistory);
          const response = await fetch('/.netlify/functions/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents: chatHistory,
              currentSubject: 'Content Discussion',
              aiPersona: 'Educator'
            })
          });

          if (response.ok) {
            const { generatedContent } = await response.json();
            const aiMessage = { role: 'model', text: generatedContent, timestamp: new Date() };
            const finalMessages = [...initialHistory, aiMessage];
            
            chatDispatch({ type: 'SET_MESSAGES', payload: finalMessages });

            // Update Firestore with the conversation
            await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/chats`, docRef.id), {
              messages: finalMessages.map(msg => ({
                role: msg.role,
                text: msg.text,
                timestamp: msg.timestamp,
                files: msg.files || []
              })),
              lastUpdated: serverTimestamp()
            });
          } else {
            throw new Error('Failed to get AI response for initial content discussion');
          }
          
          // Clear the linked content after successful initialization
          setLinkedContentForChat(null);
          onSuccess(`Started discussion about "${linkedContentForChat.name}"`);
        } catch (error) {
          console.error('Error initializing chat with linked content:', error);
          onError('Failed to start discussion with linked content');
        }
      };
      
      initializeChatWithContent();
    }
  }, [linkedContentForChat, currentChatId, user, db, setLinkedContentForChat, onSuccess, onError, formatChatHistoryForAPI]);

  // Fetches contexts from linked chats for the AI API
  const getLinkedChatContexts = useCallback(async () => {
    if (!chatState.linkedChats.length) return [];
    
    const contexts = [];
    for (const chatId of chatState.linkedChats) {
      try {
        const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          contexts.push({
            chatId,
            subject: chatData.subject || 'General',
            messages: formatChatHistoryForAPI(chatData.messages || [])
          });
        }
      } catch (error) {
        console.error(`Error fetching linked chat ${chatId}:`, error);
      }
    }
    return contexts;
  }, [chatState.linkedChats, db, user, formatChatHistoryForAPI]);

  // Handles sending messages and interacting with the AI
const handleSendMessage = useCallback(async (text, files = []) => {
    const optimizer = new HybridChatOptimizer();
    if (!currentChatId) {
      onError('Please select a chat or start a new one.');
      return;
    }

    if (!text?.trim() && files.length === 0) return;

    const currentChat = chatHistoryList.find(c => c.id === currentChatId);
    const isGeneral = isGeneralMode(currentChat);
    const effectiveLimits = getEffectiveLimits(currentChat);
    
    // Check message limit for non-general mode chats
    if (!isGeneral && chatState.messages.length >= effectiveLimits.MAX_MESSAGES_PER_CHAT) {
      onError('Maximum message limit reached for this chat. Please start a new chat.');
      return;
    }
    
    // Check daily quota limits (general mode is exempt)
    if (!canSendMessage(isGeneral)) {
      onError('Daily message limit reached. Try General Mode for unlimited messaging or upgrade.');
      return;
    }

    // Handle file uploads
    if (files.length > 0) {
      if (!canPerformAction(currentChat, 'upload_file')) {
        onError('File uploads are not allowed in General Mode.');
        return;
      }
      
      if (!canUploadFiles(currentChatId)) {
        onError('Upload limit exceeded for this chat. You can only upload files once per chat.');
        return;
      }
      
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (files.length > effectiveLimits.MAX_FILES_PER_MESSAGE || totalSize > effectiveLimits.MAX_FILE_SIZE) {
        onError(`Files exceed limit. Max ${effectiveLimits.MAX_FILES_PER_MESSAGE} files and ${effectiveLimits.MAX_FILE_SIZE / (1024 * 1024)}MB total allowed.`);
        return;
      }
    }

    const userMessage = { role: 'user', text: text.trim(), timestamp: new Date(), files: [] };
    chatDispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    chatDispatch({ type: 'SET_INPUT_VALUE', payload: '' });
    chatDispatch({ type: 'SET_TYPING', payload: true });
    setIsSending(true);

    // Create an AbortController for this request
    const controller = new AbortController();
    setSendingController(controller);

    try {
      // Upload files if present
      if (files.length > 0) {
        const uploadedFiles = await Promise.all(
          files.map(async (file, index) => {
            const fileId = `${userMessage.timestamp.getTime()}-${index}`;
            return await uploadFile(file, user.uid, currentChatId, fileId);
          })
        );
        userMessage.files = uploadedFiles;
        
        recordFileUpload(currentChatId); // Record file upload for per-chat limits
        
        // Update the message in the UI with uploaded files
        chatDispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      }

      // Personalization system integration and intelligent persona selection
      if (userMemory && interactionRecorder && personalizationEngine) {
        try {
          // Analyze user message to extract insights
          const messageAnalysis = await analyzeMessage(userMessage.text);
          
          // Auto-select persona based on message context and user state
          const selectedPersona = selectPersonaBasedOnContext(
            userMessage.text,
            messageAnalysis.userState?.state,
            chatState.currentSubject
          );
          
          // Record the interaction
          await interactionRecorder.recordInteraction({
            type: 'message_sent',
            content: userMessage.text,
            timestamp: userMessage.timestamp,
            chatId: currentChatId,
            subject: chatState.currentSubject,
            aiPersona: selectedPersona,
            analysis: messageAnalysis
          });
          
          // Update user memory with the interaction
          userMemory.updateInteractionMemory({
            messageContent: userMessage.text,
            analysis: messageAnalysis,
            timestamp: userMessage.timestamp,
            chatContext: {
              chatId: currentChatId,
              subject: chatState.currentSubject,
              aiPersona: selectedPersona,
              messageCount: chatState.messages.length + 1
            }
          });
        } catch (error) {
          console.error('Error in personalization analysis:', error);
          // Continue with normal flow if personalization fails
        }
      }

      const linkedChatContexts = await getLinkedChatContexts();
      
      // Optimize message context using HybridChatOptimizer
      const optimizedContext = await optimizer.optimize([...chatState.messages, userMessage], linkedChatContexts, userMessage.text);

      // Check if request was cancelled
      if (controller.signal.aborted) {
        return;
      }

      // Send message to AI
      const payload = {
        contents: formatChatHistoryForAPI(optimizedContext.messages),
        currentSubject: chatState.currentSubject,
        aiPersona: chatState.aiPersona,
        linkedChatContexts: optimizedContext.linkedContexts,
        requestType: 'generateContent'
      };
      const generatedContent = await callGeminiAPI(payload);
      
      // Check again if request was cancelled
      if (controller.signal.aborted) {
        return;
      }
      
      let aiMessage = { role: 'model', text: generatedContent, timestamp: new Date() };

      // Apply personalization to AI response
      if (personalizationEngine) {
        try {
          const personalizationContext = {
            userMessage: userMessage.text,
            aiResponse: generatedContent,
            chatHistory: chatState.messages,
            currentSubject: chatState.currentSubject,
            aiPersona: chatState.aiPersona
          };
          
          const personalizedResponse = await personalizationEngine.personalizeResponse(
            generatedContent,
            personalizationContext
          );
          
          if (personalizedResponse && personalizedResponse !== generatedContent) {
            aiMessage.text = personalizedResponse;
          }
        } catch (error) {
          console.error('Error personalizing AI response:', error);
          // Use original response if personalization fails
        }
      }

      chatDispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      
      // Clear typing indicator immediately after AI response is received
      chatDispatch({ type: 'SET_TYPING', payload: false });
      
      recordMessage(isGeneral); // Record message usage for quota tracking

      // Update Firestore with new messages and potentially a new title
      if (currentChatId && user && db) {
        const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
        const updatedMessages = [...chatState.messages, userMessage, aiMessage];
        
        const updateData = {
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            text: msg.text,
            files: msg.files || [],
            timestamp: msg.timestamp // Store Date objects directly for Firestore
          })),
          lastUpdated: serverTimestamp()
        };
        
        // Auto-title chat after first message exchange or if title is default
        if ((updatedMessages.length === 2 || chatState.chatTitle === 'New Chat' || chatState.chatTitle === 'Untitled Chat') && updatedMessages.length >= 2) {
          try {
            const titleResponse = await generateChatTitle(updatedMessages, chatState.currentSubject);
            updateData.title = titleResponse;
            chatDispatch({ type: 'SET_CHAT_TITLE', payload: titleResponse });
          } catch (error) {
            console.error('Error generating chat title:', error);
          }
        }

        await updateDoc(chatRef, updateData);
        
        // The Firebase listener in ChatHistorySidebar will automatically update the chat history
        // but we can also dispatch a custom event to immediately update the parent component
        // This ensures the sidebar updates immediately even if Firebase is slow
        // Use requestAnimationFrame to prevent blocking the main thread and reduce re-renders
        // Only dispatch if there are actual changes to prevent unnecessary re-renders
        const hasActualChanges = updatedMessages.length > 0 || updateData.title;
        if (hasActualChanges) {
          requestAnimationFrame(() => {
            const updateEvent = new CustomEvent('chatUpdated', {
              detail: {
                chatId: currentChatId,
                updates: {
                  messages: updatedMessages,
                  title: updateData.title || chatState.chatTitle,
                  lastUpdated: new Date()
                }
              }
            });
            window.dispatchEvent(updateEvent);
          });
        }
      }

    } catch (err) {
      console.error('Error sending message:', err);
      if (!controller.signal.aborted) {
        onError('Failed to get response from AI. Please try again.');
      }
    } finally {
      // Ensure typing indicator is cleared in all cases
      chatDispatch({ type: 'SET_TYPING', payload: false });
      setIsSending(false);
      setSendingController(null);
    }
  }, [chatState.messages, chatState.currentSubject, chatState.aiPersona, chatState.linkedChats, currentChatId, user, db, onError, chatHistoryList, getLinkedChatContexts, callGeminiAPI, userMemory, interactionRecorder, personalizationEngine]);

  // Effect to send message when voice transcript is available
  useEffect(() => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  }, [handleSendMessage, transcript]);

  // Handles pausing/cancelling a message
  const handlePauseMessage = useCallback(() => {
    if (sendingController) {
      sendingController.abort();
      setSendingController(null);
    }
    setIsSending(false);
    chatDispatch({ type: 'SET_TYPING', payload: false });
    onSuccess('Message cancelled');
  }, [sendingController, onSuccess]);

  // Handles key presses in the input field (e.g., Enter to send message)
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(chatState.inputValue);
    }
  }, [handleSendMessage, chatState.inputValue]);

  // Handles linking other chats to the current chat
  const handleLinkChats = useCallback(async (selectedChatIds) => {
    if (!currentChatId || !user || !db) {
      onError('Please select a chat to link other chats.');
      return;
    }

    try {
      const currentChat = chatHistoryList.find(c => c.id === currentChatId);
      const maxAllowed = CHAT_LIMITS.MAX_CHAT_CARDS_PER_CHAT;
      
      const updatedLinkedChats = [...new Set([...chatState.linkedChats, ...selectedChatIds])];
      
      if (updatedLinkedChats.length > maxAllowed) {
        onError(`Cannot link more than ${maxAllowed} chats. Currently linked: ${chatState.linkedChats.length}. Please remove some existing links first.`);
        return;
      }
      
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
      await updateDoc(chatRef, {
        linkedChats: updatedLinkedChats,
        lastUpdated: serverTimestamp()
      });
      
chatDispatch({ type: 'SET_LINKED_CHATS', payload: updatedLinkedChats });
      
      recordChatLinking(currentChatId, currentChat, updatedLinkedChats.length);
      
      const newChatCount = selectedChatIds.length;
      const totalLinkedCount = updatedLinkedChats.length;
      const remainingSlots = maxAllowed - totalLinkedCount;
      
      onSuccess(`${newChatCount} chat${newChatCount !== 1 ? 's' : ''} linked successfully! Total: ${totalLinkedCount}/${maxAllowed} (${remainingSlots} remaining)`);
    } catch (error) {
      console.error('Error linking chats:', error);
      onError('Failed to link chats');
    }
  }, [currentChatId, user, db, onError, chatHistoryList, chatState.linkedChats, onSuccess]);

  // Handles removing a linked chat
  const handleRemoveLinkedChat = useCallback(async (chatIdToRemove) => {
    if (!currentChatId || !user || !db) {
      onError('No chat selected to remove linked chat from.');
      return;
    }

    try {
      const updatedLinkedChats = chatState.linkedChats.filter(id => id !== chatIdToRemove);
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
      await updateDoc(chatRef, {
        linkedChats: updatedLinkedChats,
        lastUpdated: serverTimestamp()
      });
      
      chatDispatch({ type: 'SET_LINKED_CHATS', payload: updatedLinkedChats });
      onSuccess('Linked chat removed successfully.');
    } catch (error) {
      console.error('Error removing linked chat:', error);
      onError('Failed to remove linked chat');
    }
  }, [currentChatId, user, db, chatState.linkedChats, onError, onSuccess]);

  // Handles linking content to the current chat
  const handleLinkContent = useCallback(async (selectedContent) => {
    if (!currentChatId || !user || !db) {
      onError('Please select a chat to link content to.');
      return;
    }

    setContentAttachmentProgress('attaching');
    setContentAttachmentStatus(null);

    try {
      // Create linkedContent object, ensuring only defined values are included
      const linkedContentData = {
        id: selectedContent.id,
        name: selectedContent.name,
        linkedAt: serverTimestamp()
      };
      
      if (selectedContent.audience !== undefined) linkedContentData.audience = selectedContent.audience;
      if (selectedContent.class !== undefined) linkedContentData.class = selectedContent.class;
      if (selectedContent.age !== undefined) linkedContentData.age = selectedContent.age;
      if (selectedContent.region !== undefined) linkedContentData.region = selectedContent.region;
      if (selectedContent.generatedContent !== undefined) linkedContentData.generatedContent = selectedContent.generatedContent;
      
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
      await updateDoc(chatRef, {
        linkedContent: linkedContentData,
        lastUpdated: serverTimestamp()
      });
      
      chatDispatch({ type: 'SET_LINKED_CONTENT', payload: selectedContent });
      
      recordContentLinking(currentChatId);
      
      setContentAttachmentProgress('success');
      setContentAttachmentStatus('success');
      
      setTimeout(() => {
        setShowLinkContentModal(false);
        setContentAttachmentProgress(null);
        setContentAttachmentStatus(null);
      }, 1500);
      
      onSuccess(`Content "${selectedContent.name}" attached successfully!`);
    } catch (error) {
      console.error('Error linking content:', error);
      setContentAttachmentProgress('error');
      setContentAttachmentStatus('error');
      
      setTimeout(() => {
        setContentAttachmentProgress(null);
        setContentAttachmentStatus(null);
      }, 3000);
      
      onError('Failed to attach content');
    }
  }, [currentChatId, user, db, onError, onSuccess]);

  // Handles removing linked content
  const handleRemoveLinkedContent = useCallback(async () => {
    if (!currentChatId || !user || !db) {
      onError('No chat selected to remove linked content from.');
      return;
    }

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
      await updateDoc(chatRef, {
        linkedContent: null,
        lastUpdated: serverTimestamp()
      });
      
      chatDispatch({ type: 'SET_LINKED_CONTENT', payload: null });
      onSuccess('Linked content removed successfully.');
    } catch (error) {
      console.error('Error removing linked content:', error);
      onError('Failed to remove linked content');
    }
  }, [currentChatId, user, db, onError, onSuccess]);

  // Handles changing the AI persona for the current chat
  const handlePersonaChange = useCallback(async (newPersona) => {
    if (!currentChatId || !user || !db) {
      onError('Please select a chat to change AI persona.');
      return;
    }

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
      await updateDoc(chatRef, {
        aiPersona: newPersona,
        lastUpdated: serverTimestamp()
      });
      
      chatDispatch({ type: 'SET_AI_PERSONA', payload: newPersona });
      setShowPersonaSelector(false);
      onSuccess(`AI persona changed to ${newPersona}.`);
    } catch (error) {
      console.error('Error changing AI persona:', error);
      onError('Failed to change AI persona');
    }
  }, [currentChatId, user, db, onError, onSuccess]);

  // Generates a chat title using the AI
  const generateChatTitle = async (messages, subject) => {
    try {
      const titlePrompt = `Generate a concise, descriptive title (max 6 words) for this chat conversation about ${subject}. First user message: "${messages[0]?.text || ''}" First AI response: "${messages[1]?.text?.slice(0, 100) || ''}..."`;
      
      const response = await fetch('/.netlify/functions/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{
            role: 'user',
            parts: [{ text: titlePrompt }]
          }],
          currentSubject: 'General',
          aiPersona: 'Concise'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate title from AI');
      }
      
      const { generatedContent } = await response.json();
      return generatedContent.replace(/["']/g, '').trim();
    } catch (error) {
      console.error('Error generating chat title:', error);
      return `${subject} Discussion`; // Fallback title
    }
  };

  // Memoized retrieval of linked chat details for display
  const linkedChatDetails = useMemo(() => {
    return chatState.linkedChats.map(chatId => {
      const chat = chatHistoryList.find(c => c.id === chatId);
      return chat ? {
        id: chatId,
        title: chat.title || 'Untitled Chat',
        subject: chat.subject
      } : null;
    }).filter(Boolean); // Filter out any nulls if a linked chat is not found
  }, [chatState.linkedChats, chatHistoryList]);

  // Toggles message selection mode
  const handleToggleSelectionMode = () => {
    chatDispatch({ type: 'SET_SELECTION_MODE', payload: !chatState.isSelectionMode });
    chatDispatch({ type: 'SET_SELECTED_MESSAGES', payload: new Set() }); // Clear selection when toggling mode
  };

  // Handles selecting/deselecting individual messages
  const handleMessageSelect = (messageIndex) => {
    const newSelection = new Set(chatState.selectedMessages);
    if (newSelection.has(messageIndex)) {
      newSelection.delete(messageIndex);
    } else {
      newSelection.add(messageIndex);
    }
    chatDispatch({ type: 'SET_SELECTED_MESSAGES', payload: newSelection });
  };

  // Opens the save segment modal
  const handleSaveSegment = () => {
    if (chatState.selectedMessages.size === 0) {
      onError('Please select at least one message to save.');
      return;
    }
    chatDispatch({ type: 'SET_SHOW_SAVE_MODAL', payload: true });
  };

  // Handles saving selected messages as new content
  const handleSaveAsContent = async (contentText) => {
    chatDispatch({ type: 'SET_SAVING', payload: true });
    try {
      // Dispatch a custom event to navigate to content generation page with pre-filled content
      window.dispatchEvent(new CustomEvent('navigateToContentGeneration', {
        detail: { bookContent: contentText, subject: chatState.currentSubject }
      }));
      
    chatDispatch({ type: 'SET_SHOW_SAVE_MODAL', payload: false });
    chatDispatch({ type: 'SET_SELECTION_MODE', payload: false });
    chatDispatch({ type: 'SET_SELECTED_MESSAGES', payload: new Set() });
      onSuccess('Content saved to Content Generation page!');
    } catch (error) {
      console.error('Error saving content:', error);
      onError('Failed to save content');
    } finally {
    chatDispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Handles saving selected messages as a note
  const handleSaveAsNote = async (contentText, title) => {
    chatDispatch({ type: 'SET_SAVING', payload: true });
    try {
      const noteData = {
        userId: user.uid,
        title: title,
        content: contentText,
        isNote: true,
        source: 'chat',
        sourceId: currentChatId,
        subject: chatState.currentSubject || 'General',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };
      
      const notesPath = `artifacts/${appId}/users/${user.uid}/generatedContent`;
      await addDoc(collection(db, notesPath), noteData);
      
    chatDispatch({ type: 'SET_SHOW_SAVE_MODAL', payload: false });
    chatDispatch({ type: 'SET_SELECTION_MODE', payload: false });
    chatDispatch({ type: 'SET_SELECTED_MESSAGES', payload: new Set() });
      onSuccess('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      onError('Failed to save note');
    } finally {
    chatDispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Retrieves the data for selected messages
  const getSelectedMessagesData = () => {
    return Array.from(chatState.selectedMessages)
      .sort((a, b) => a - b) // Sort by index to maintain original order
      .map(index => chatState.messages[index])
      .filter(Boolean); // Filter out any undefined messages
  };

  // Initiates editing of the chat title
  const handleTitleEdit = () => {
    // Only allow editing if a chat is selected and it's not a 'General' mode chat
    if (currentChatId && chatState.currentSubject !== 'General') {
      chatDispatch({ type: 'SET_EDITING_TITLE', payload: true });
    } else if (!currentChatId) {
      onError('Please select a chat to edit its title.');
    } else if (chatState.currentSubject === 'General') {
      onError('Title editing is not available for General Mode chats.');
    }
  };

  // Saves the edited chat title to Firestore
  const handleTitleSave = async () => {
    if (!currentChatId || !user || !db) {
      onError('Cannot save title without a selected chat.');
      return;
    }

    const trimmedTitle = chatState.editTitleValue.trim();
    if (!trimmedTitle || trimmedTitle === chatState.chatTitle) {
      chatDispatch({ type: 'SET_EDITING_TITLE', payload: false }); // Exit editing if title is empty or unchanged
      return;
    }

    try {
      const chatRef = doc(db, `artifacts/${appId}/users/${user.uid}/chats`, currentChatId);
      await updateDoc(chatRef, {
        title: trimmedTitle,
        lastUpdated: serverTimestamp()
      });
      
      chatDispatch({ type: 'SET_CHAT_TITLE', payload: trimmedTitle });
      chatDispatch({ type: 'SET_EDITING_TITLE', payload: false });
      onSuccess('Chat title updated successfully!');
    } catch (error) {
      console.error('Error updating chat title:', error);
      onError('Failed to update chat title');
    }
  };

  // Cancels title editing and reverts to original title
  const handleTitleCancel = () => {
    chatDispatch({ type: 'SET_EDIT_TITLE_VALUE', payload: chatState.chatTitle });
    chatDispatch({ type: 'SET_EDITING_TITLE', payload: false });
  };

  // Handles key down events for title input (Enter to save, Escape to cancel)
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  // Displays a loading spinner while chat data is being loaded
  if (chatState.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Linked Content Banner - Fixed header, adapts position based on full screen/mobile */}
      {linkedContentForChat && (
        <div 
          className={`fixed z-40 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 text-sm text-center border-b border-blue-200 dark:border-blue-800`}
          style={{
            top: isFullScreen ? '0' : (isMobile ? '4rem' : '4rem'), // Adjust top based on full screen and mobile
            left: isFullScreen || isMobile ? '0' : `${sidebarWidth + 4}px`,
            right: '0',
            width: isFullScreen || isMobile ? '100%' : `calc(100% - ${sidebarWidth + 4}px)`
          }}
        >
          <strong>Currently discussing:</strong> {linkedContentForChat.name}
        </div>
      )}
      
      {/* Header - Fixed header, adapts position and padding based on linked content, full screen, and mobile */}
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
              {chatState.isEditingTitle ? (
                // Title editing input field
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={chatState.editTitleValue}
                    onChange={(e) => chatDispatch({ type: 'SET_EDIT_TITLE_VALUE', payload: e.target.value })}
                    onKeyDown={handleTitleKeyDown}
                    className="flex-1 text-xl font-semibold bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter chat title"
                    aria-label="Edit chat title"
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    title="Save title"
                    aria-label="Save chat title"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleTitleCancel}
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
                    {chatState.chatTitle || 'Select a Chat'}
                  </h1>
                  {/* Conditionally render edit title button based on chat type and permissions */}
                  {currentChatId && canPerformAction(chatHistoryList.find(c => c.id === currentChatId), 'edit_title') && (
                    <button
                      onClick={handleTitleEdit}
                      className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
                      title="Edit title"
                      aria-label="Edit chat title"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Compact Quota Indicator */}
                  <QuotaIndicator 
                    currentMessages={chatState.messages.length}
                    filesUploaded={chatState.messages.reduce((count, msg) => count + (msg.files?.length || 0), 0)}
                    totalFileSize={chatState.messages.reduce((size, msg) => size + (msg.files?.reduce((fileSize, file) => fileSize + (file.size || 0), 0) || 0), 0)}
                    dailyChatsUsed={chatHistoryList.length}
                    contentFilesUsed={chatState.linkedContent ? 1 : 0}
                    chatCardsUsed={chatState.linkedChats.length}
                    showDetails={false}
                    onClick={() => setShowQuotaModal(true)}
                  />
                </div>
              )}
              {chatState.currentSubject && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{chatState.currentSubject}</p>
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
                  const currentPersonaStyle = getPersonaStyle(chatState.aiPersona);
                  const PersonaIcon = currentPersonaStyle?.icon || User;
                  
                  return (
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border shadow-sm ${
                        currentPersonaStyle
                          ? `${currentPersonaStyle.colors} border-current`
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
                      }`}
                      title={`Current AI Persona: ${chatState.aiPersona} (Auto-Selected)`}
                      aria-label="Current AI Persona"
                    >
                      <PersonaIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{chatState.aiPersona}</span>
                      <div className="text-xs opacity-60 ml-1">(Auto)</div>
                    </div>
                  );
                })()} 
              </div>
            )}

            {/* Save Segment Button */}
            <button
              onClick={() => currentChatId && handleToggleSelectionMode()}
              disabled={!currentChatId}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                !currentChatId
                  ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : chatState.isSelectionMode
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60'
              }`}
              title={!currentChatId ? 'Select a chat to save messages' : (chatState.isSelectionMode ? 'Exit Selection Mode' : 'Select Messages to Save')}
              aria-label={chatState.isSelectionMode ? 'Exit selection mode' : 'Select messages to save'}
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">{chatState.isSelectionMode ? 'Cancel' : 'Select'}</span>
            </button>

            {/* Link Content Button */}
            {(() => {
              const currentChat = chatHistoryList.find(c => c.id === currentChatId);
              const canLinkContentAction = currentChatId && canPerformAction(currentChat, 'link_content');
              
              return (
                <button
                  onClick={() => canLinkContentAction && setShowLinkContentModal(true)}
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
                        : isGeneralMode(currentChat)
                          ? 'Link 1 content card for focused discussion'
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
                  onClick={() => canLinkChatAction && setShowLinkModal(true)}
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

        {/* Linked Chats and Content Display - Combined in single row */}
        {(linkedChatDetails.length > 0 || chatState.linkedContent) && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              {linkedChatDetails.length > 0 && chatState.linkedContent ? 'Attachments:' :
               linkedChatDetails.length > 0 ? `Linked Chat${linkedChatDetails.length > 1 ? 's' : ''} (${linkedChatDetails.length}/${CHAT_LIMITS.MAX_CHAT_CARDS_PER_CHAT}):` : 
               'Linked Content:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Linked Chats */}
              {linkedChatDetails.map(chat => {
              const linkedChatData = chatHistoryList.find(c => c.id === chat.id);
              const previewText = linkedChatData?.messages?.[0]?.text?.slice(0, 100) || 'No messages preview available.';
              
              return (
                <div
                  key={chat.id}
                  className="relative flex items-center space-x-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-full text-sm group cursor-pointer"
                  onClick={() => onNavigateToChat(chat.id)}
                  role="button"
                  tabIndex="0"
                  aria-label={`Navigate to linked chat: ${chat.title}`}
                >
                  <Link className="w-3 h-3" aria-hidden="true" />
                  <span className="truncate max-w-20">{chat.title}</span>
                  {chat.subject && (
                    <span className="text-xs opacity-75">({chat.subject})</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating to chat when clicking remove button
                      handleRemoveLinkedChat(chat.id);
                    }}
                    className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                    title="Remove linked chat"
                    aria-label={`Remove linked chat ${chat.title}`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                  
                  {/* Hover Tooltip for linked chats */}
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64 pointer-events-none">
                    <div className="font-medium mb-1">{chat.title}</div>
                    <div className="text-gray-300">{previewText}{previewText.length === 100 ? '...' : ''}</div>
                  </div>
                </div>
              );
            })}
            
            {/* Linked Content */}
            {chatState.linkedContent && (
              <div 
                className="relative flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-sm group cursor-pointer" 
                onClick={() => onNavigateToContent(chatState.linkedContent.id)}
                role="button"
                tabIndex="0"
                aria-label={`Navigate to linked content: ${chatState.linkedContent.name}`}
              >
                <FileText className="w-3 h-3" aria-hidden="true" />
                <span className="truncate max-w-32">{chatState.linkedContent.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating to content when clicking remove button
                    handleRemoveLinkedContent();
                  }}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  title="Remove linked content"
                  aria-label={`Remove linked content ${chatState.linkedContent.name}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
                
                {/* Hover Tooltip for linked content */}
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64 pointer-events-none">
                  <div className="font-medium mb-1">{chatState.linkedContent.name}</div>
                  <div className="text-gray-300">{chatState.linkedContent.generatedContent?.slice(0, 100) || 'No content preview available.'}{chatState.linkedContent.generatedContent?.length > 100 ? '...' : ''}</div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages Area - Main scrollable content */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
        style={{ 
          // Dynamic padding to account for fixed header and input area
          paddingTop: (linkedContentForChat ? 1 : 0) * 48 + 120 + 'px', // 48px for banner, 120px for header. Adjust as needed.
          paddingBottom: '100px', // Space for the fixed input area
          scrollBehavior: 'smooth' // Smooth scrolling behavior
        }}
      >
        {!currentChatId ? (
          // Welcome / Getting Started message when no chat is selected
          <div className="flex justify-center items-start h-full overflow-y-auto">
            <div className="text-center max-w-2xl mx-auto px-6 py-8">
              {/* Welcome Header */}
              <div className="mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="pro-text-gradient font-bold text-lg px-4 py-2 rounded-lg shadow-lg">
                    🧠 Smartness is PRO, Where Genius Begins Next Level Learnings
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  ✨ Welcome to Magic Discussion! 🎓
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-3">
                  🌟 Your exceptional AI-powered educational companion! 🌟
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Experience the <span className="font-semibold text-violet-600 dark:text-cyan-400">real magic</span> in the world of education! 🪄
                  Our intelligent discussion platform transforms learning into an engaging, personalized journey. 
                  Whether you're exploring complex concepts, seeking explanations, or diving deep into any subject, 
                  Magic Discussion adapts to your learning style and guides you every step of the way! 🚀
                </p>
              </div>

              {/* Getting Started Guide */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 mb-5">
                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                  <span className="text-xl mr-2" role="img" aria-label="Rocket emoji">🚀</span>
                  Quick Start Guide
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-800/50 p-1.5 rounded-full flex-shrink-0">
                      <span className="text-sm" role="img" aria-label="Number one emoji">1️⃣</span>
                    </div>
                    <div className="text-left">
                      <p className="text-blue-700 dark:text-blue-300 font-medium text-sm">Click the "New Chat" button</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Start a fresh conversation about any topic you'd like to explore</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-800/50 p-1.5 rounded-full flex-shrink-0">
                      <span className="text-sm" role="img" aria-label="Number two emoji">2️⃣</span>
                    </div>
                    <div className="text-left">
                      <p className="text-blue-700 dark:text-blue-300 font-medium text-sm">Choose your subject & AI persona</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Select from various subjects and AI teaching styles that match your learning preference</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-800/50 p-1.5 rounded-full flex-shrink-0">
                      <span className="text-sm" role="img" aria-label="Number three emoji">3️⃣</span>
                    </div>
                    <div className="text-left">
                      <p className="text-blue-700 dark:text-blue-300 font-medium text-sm">Start learning & exploring!</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Ask questions, get explanations, and discover the magic of personalized education</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <span className="text-xl mb-1 block" role="img" aria-label="Target emoji">🎯</span>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1 text-sm">Personalized Learning</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400">AI adapts to your unique learning style</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-xl mb-1 block" role="img" aria-label="Link emoji">🔗</span>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1 text-sm">Connected Learning</h3>
                  <p className="text-xs text-green-600 dark:text-green-400">Link chats and content for deeper understanding</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <span className="text-xl mb-1 block" role="img" aria-label="Floppy disk emoji">💾</span>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1 text-sm">Save & Organize</h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Keep track of your learning journey</p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">
                  Ready to experience the magic? ✨
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click the <span className="font-semibold text-blue-600 dark:text-blue-400">"New Chat"</span> button above to get started! 🎯
                </p>
              </div>
            </div>
          </div>
        ) : chatState.messages.length === 0 ? (
          // Prompt to start conversation if chat is empty
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p className="text-base mb-1">Start the conversation!</p>
              <p className="text-sm">Type a message below to begin chatting.</p>
            </div>
          </div>
        ) : (
          // Render chat messages
          <>
            {chatState.messages.map((msg, index) => {
              const timestamp = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
              const isSelected = chatState.selectedMessages.has(index);
              
              return (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Selection checkbox for non-user messages or when in selection mode */}
                  {chatState.isSelectionMode && (
                    <div className="flex items-start pt-2 mr-2">
                      <button
                        onClick={() => handleMessageSelect(index)}
                        className={`p-1 rounded transition-colors ${
                          isSelected 
                            ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title={isSelected ? 'Deselect message' : 'Select message'}
                        aria-checked={isSelected}
                        role="checkbox"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4" aria-hidden="true" /> : <Square className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  } ${
                    isSelected ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''
                  }`}>
                    <div className="text-sm">
                      <ChatMessageRenderer 
                        message={msg.text} 
                        isUser={msg.role === 'user'} 
                        files={msg.files || []}
                      />
                    </div>
                    <div className={`text-xs mt-1 ${
                      msg.role === 'user' 
                        ? 'text-blue-200' 
                        : 'text-gray-500 dark:text-gray-400'
                    } text-right`}>
                      {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Selection Mode Action Bar */}
            {chatState.isSelectionMode && chatState.selectedMessages.size > 0 && (
              <div className="sticky bottom-4 left-1/2 transform -translate-x-1/2 w-fit">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {chatState.selectedMessages.size} message{chatState.selectedMessages.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleSaveSegment}
                    className="flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    aria-label="Save selected messages segment"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Save Segment</span>
                  </button>
                  <button
                    onClick={() => chatDispatch({ type: 'SET_SELECTED_MESSAGES', payload: new Set() })}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Clear message selection"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Clear</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* AI Typing Indicator */}
        {chatState.isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1" aria-label="AI is typing">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm font-medium">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} /> {/* Scroll target for new messages */}
      </div>

      {/* Chat Input Area - Fixed at bottom */}
      <div 
        className={`fixed bottom-0 z-30 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg`}
        style={{ 
          left: isFullScreen || isMobile ? '0' : `${sidebarWidth + 4}px`, 
          right: '0',
          width: isFullScreen || isMobile ? '100%' : `calc(100% - ${sidebarWidth + 4}px)`
        }}
      >
        <ChatInput
          value={chatState.inputValue}
          onChange={(value) => chatDispatch({ type: 'SET_INPUT_VALUE', payload: value })}
          onSend={handleSendMessage}
          onVoiceToggle={isListening ? stopListening : startListening}
          isVoiceListening={isListening}
          isVoiceSupported={isSupported}
          disabled={!currentChatId || chatState.isTyping}
          placeholder={currentChatId ? "Type a message..." : "Select a chat to start messaging"}
          autoFocus={true}
          onPauseMessage={handlePauseMessage}
          isExternallySending={isSending}
        />
      </div>

      {/* Modals for various functionalities */}
      {chatState.showSaveModal && (
        <SaveSegmentModal
          isOpen={chatState.showSaveModal}
          onClose={() => chatDispatch({ type: 'SET_SHOW_SAVE_MODAL', payload: false })}
          onSaveAsContent={handleSaveAsContent}
          onSaveAsNote={handleSaveAsNote}
          selectedMessages={getSelectedMessagesData()}
          isLoading={chatState.isSaving}
        />
      )}

      {showLinkModal && (
        <LinkChatModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onConfirm={handleLinkChats}
          chatHistoryList={chatHistoryList}
          currentChatId={currentChatId}
          currentlyLinkedChats={chatState.linkedChats}
        />
      )}

      {showLinkContentModal && (
        <LinkContentModal
          isOpen={showLinkContentModal}
          onClose={() => setShowLinkContentModal(false)}
          onConfirm={handleLinkContent}
          contentHistory={contentHistory}
          currentLinkedContent={chatState.linkedContent}
          contentAttachmentProgress={contentAttachmentProgress}
          contentAttachmentStatus={contentAttachmentStatus}
        />
      )}

      {showQuotaModal && (
        <QuotaModal
          isOpen={showQuotaModal}
          onClose={() => setShowQuotaModal(false)}
          currentMessages={chatState.messages.length}
          filesUploaded={chatState.messages.reduce((count, msg) => count + (msg.files?.length || 0), 0)}
          totalFileSize={chatState.messages.reduce((size, msg) => size + (msg.files?.reduce((fileSize, file) => fileSize + (file.size || 0), 0) || 0), 0)}
          dailyChatsUsed={chatHistoryList.length}
          contentFilesUsed={chatState.linkedContent ? 1 : 0}
          chatCardsUsed={chatState.linkedChats.length}
        />
      )}

    </div>
  );
};

export default ChatWindow;
