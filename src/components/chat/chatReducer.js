// chatReducer.js - Centralized state management for ChatWindow
import { analyzeMessage } from '../../utils/messageClassifier';
import { updatePersona } from '../../utils/aiPersonas';

export const initialState = {
  // Chat state
  currentChatId: null,
  messages: [],
  inputValue: '',
  isTyping: false,
  
  // UI state
  isFullScreen: false,
  showPersonaSelector: false,
  isSelectionMode: false,
  selectedMessages: new Set(),
  
  // AI persona state
  selectedPersona: 'general',
  
  // Message analysis state
  currentMessageAnalysis: null,
  userState: 'curious',
  conversationContext: {
    recentIntents: [],
    dominantTone: 'neutral',
    confusionLevel: 0,
    engagementLevel: 0.5
  },
  
  // Linked content state
  linkedContent: null,
  linkedChats: [],
  contentAttachmentProgress: 0,
  contentAttachmentStatus: null,
  
  // Modal states
  showSaveModal: false,
  showLinkModal: false,
  showLinkContentModal: false,
  showQuotaModal: false,
  
  // Chat editing state
  isEditingTitle: false,
  tempTitle: '',
  
  // Loading states
  isLoading: false,
  isSaving: false,
  
  // Chat history
  chatHistoryList: [],
  contentHistory: [],
  
  // Voice control
  isListening: false,
  isSupported: false,
};

export const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChatId: action.payload,
        messages: [],
        inputValue: '',
        isTyping: false,
        isSelectionMode: false,
        selectedMessages: new Set(),
        linkedContent: null,
        linkedChats: [],
      };
      
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };
      
    case 'ADD_MESSAGE':
      let analysis = null;
      let updatedContext = state.conversationContext;
      let personaAdjustment = {};
      
      // Analyze user messages for intent and emotion
      if (action.payload.role === 'user' && action.payload.text) {
        analysis = analyzeMessage(action.payload.text, state.messages);

        // Adjust persona based on analysis
        personaAdjustment = updatePersona(analysis.intent.intent, analysis.userState.state);
        
        // Update conversation context
        updatedContext = {
          ...state.conversationContext,
          recentIntents: [
            analysis.intent.intent,
            ...state.conversationContext.recentIntents.slice(0, 4)
          ],
          dominantTone: analysis.sentiment.sentiment,
          confusionLevel: analysis.userState.state === 'confused' ? 
            Math.min(1, state.conversationContext.confusionLevel + 0.2) : 
            Math.max(0, state.conversationContext.confusionLevel - 0.1),
          engagementLevel: analysis.userState.state === 'engaged' ? 
            Math.min(1, state.conversationContext.engagementLevel + 0.2) : 
            analysis.userState.state === 'disinterested' ? 
            Math.max(0, state.conversationContext.engagementLevel - 0.2) : 
            state.conversationContext.engagementLevel
        };
      }
      
      return {
        ...state,
        messages: [...state.messages, action.payload],
        currentMessageAnalysis: analysis,
        userState: analysis ? analysis.userState.state : state.userState,
        conversationContext: updatedContext,
        selectedPersona: personaAdjustment.id || state.selectedPersona
      };
      
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, index) => 
          index === action.payload.index ? { ...msg, ...action.payload.updates } : msg
        ),
      };
      
    case 'SET_INPUT_VALUE':
      return {
        ...state,
        inputValue: action.payload,
      };
      
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
      
    case 'SET_FULLSCREEN':
      return {
        ...state,
        isFullScreen: action.payload,
      };
      
    case 'SET_PERSONA_SELECTOR':
      return {
        ...state,
        showPersonaSelector: action.payload,
      };
      
    case 'SET_SELECTED_PERSONA':
      return {
        ...state,
        selectedPersona: action.payload,
        showPersonaSelector: false,
      };
      
    case 'SET_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: action.payload,
        selectedMessages: action.payload ? state.selectedMessages : new Set(),
      };
      
    case 'TOGGLE_MESSAGE_SELECTION':
      const newSelectedMessages = new Set(state.selectedMessages);
      if (newSelectedMessages.has(action.payload)) {
        newSelectedMessages.delete(action.payload);
      } else {
        newSelectedMessages.add(action.payload);
      }
      return {
        ...state,
        selectedMessages: newSelectedMessages,
      };
      
    case 'CLEAR_SELECTED_MESSAGES':
      return {
        ...state,
        selectedMessages: new Set(),
      };
      
    case 'SET_LINKED_CONTENT':
      return {
        ...state,
        linkedContent: action.payload,
      };
      
    case 'SET_LINKED_CHATS':
      return {
        ...state,
        linkedChats: action.payload,
      };
      
    case 'SET_CONTENT_ATTACHMENT_PROGRESS':
      return {
        ...state,
        contentAttachmentProgress: action.payload,
      };
      
    case 'SET_CONTENT_ATTACHMENT_STATUS':
      return {
        ...state,
        contentAttachmentStatus: action.payload,
      };
      
    case 'SET_MODAL':
      return {
        ...state,
        [action.payload.modal]: action.payload.isOpen,
      };
      
    case 'SET_EDITING_TITLE':
      return {
        ...state,
        isEditingTitle: action.payload.isEditing,
        tempTitle: action.payload.title || '',
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload,
      };
      
    case 'SET_CHAT_HISTORY':
      return {
        ...state,
        chatHistoryList: action.payload,
      };
      
    case 'ADD_CHAT_TO_HISTORY':
      return {
        ...state,
        chatHistoryList: [action.payload, ...state.chatHistoryList],
      };
      
    case 'UPDATE_CHAT_IN_HISTORY':
      return {
        ...state,
        chatHistoryList: state.chatHistoryList.map(chat => 
          chat.id === action.payload.id ? { ...chat, ...action.payload.updates } : chat
        ),
      };
      
    case 'SET_CONTENT_HISTORY':
      return {
        ...state,
        contentHistory: action.payload,
      };
      
    case 'SET_VOICE_LISTENING':
      return {
        ...state,
        isListening: action.payload,
      };
      
    case 'SET_VOICE_SUPPORTED':
      return {
        ...state,
        isSupported: action.payload,
      };
      
    case 'RESET_CHAT':
      return {
        ...state,
        currentChatId: null,
        messages: [],
        inputValue: '',
        isTyping: false,
        isSelectionMode: false,
        selectedMessages: new Set(),
        linkedContent: null,
        linkedChats: [],
        showPersonaSelector: false,
        isEditingTitle: false,
        tempTitle: '',
      };
      
    default:
      return state;
  }
};
