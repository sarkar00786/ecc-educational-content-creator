// Proactive Engagement Component
// Implements proactive conversation starters and follow-up questions

import React, { useState, useEffect } from 'react';
import { MessageCircle, HelpCircle, ChevronRight, X } from 'lucide-react';
import { memoryManager } from '../../utils/conversationMemory';

const ProactiveEngagement = ({ 
  userId, 
  currentChatId, 
  onSendMessage, 
  isVisible = true,
  conversationContext 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userMemory, setUserMemory] = useState(null);

  useEffect(() => {
    if (userId && isVisible) {
      loadUserSuggestions();
    }
  }, [userId, isVisible, conversationContext]);

  const loadUserSuggestions = async () => {
    try {
      const memory = memoryManager.getUserMemory(userId);
      setUserMemory(memory);
      
      const recommendations = memory.getPersonalizedRecommendations(conversationContext);
      setSuggestions(recommendations.proactiveQuestions || []);
    } catch (error) {
      console.error('Error loading user suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSendMessage(suggestion);
    // Hide suggestions after use
    setIsExpanded(false);
  };

  const generateContextualSuggestions = () => {
    const contextualSuggestions = [];
    
    if (conversationContext?.confusionLevel > 0.5) {
      contextualSuggestions.push({
        text: "Yaar, kya main is topic ko aur simple way mein explain kar sakta hun?",
        type: "clarification",
        icon: HelpCircle
      });
    }
    
    if (conversationContext?.engagementLevel < 0.3) {
      contextualSuggestions.push({
        text: "Kya aap ko yeh approach interesting laga? Aur kya try karna chahte hain?",
        type: "engagement",
        icon: MessageCircle
      });
    }

    if (conversationContext?.recentIntents?.includes('learning_focused')) {
      contextualSuggestions.push({
        text: "Yeh topic practice karne ke liye koi exercise chahiye?",
        type: "practice",
        icon: ChevronRight
      });
    }

    return contextualSuggestions;
  };

  const allSuggestions = [...suggestions.map(text => ({ text, type: 'proactive' })), ...generateContextualSuggestions()];

  if (!isVisible || allSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="proactive-engagement bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Suggestions
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {isExpanded ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-2">
          {allSuggestions.slice(0, 3).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="w-full text-left p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
            >
              <div className="flex items-start space-x-2">
                {suggestion.icon && (
                  <suggestion.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  {suggestion.text}
                </span>
              </div>
            </button>
          ))}
          
          {userMemory && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Based on your conversation history
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed view - show one suggestion */}
      {!isExpanded && allSuggestions.length > 0 && (
        <div className="p-3">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-left p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {allSuggestions[0].text.length > 50 
                  ? `${allSuggestions[0].text.substring(0, 50)}...` 
                  : allSuggestions[0].text}
              </span>
              <ChevronRight className="w-4 h-4 text-blue-500" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProactiveEngagement;
