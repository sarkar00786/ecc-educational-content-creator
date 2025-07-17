// Feedback Component for AI Response Quality
// Implements user feedback mechanisms for continuous learning

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, MessageSquare, X, AlertCircle } from 'lucide-react';
import { memoryManager } from '../../utils/conversationMemory';

const FeedbackComponent = ({ 
  userId, 
  interactionId, 
  messageText, 
  isVisible = false,
  onFeedbackSubmitted,
  onClose 
}) => {
  const [rating, setRating] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [customFeedback, setCustomFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);

  const feedbackIssues = [
    { id: 'too_formal', label: 'Bohot formal tha', description: 'Response mein formality zyada thi' },
    { id: 'too_casual', label: 'Bohot casual tha', description: 'Response mein casual tone zyada tha' },
    { id: 'too_long', label: 'Bohot lamba tha', description: 'Response ka length zyada tha' },
    { id: 'too_short', label: 'Bohot chota tha', description: 'Response mein detail kam thi' },
    { id: 'wrong_persona', label: 'Galat style tha', description: 'AI ka approach theek nahi tha' },
    { id: 'cultural_mismatch', label: 'Cultural fit nahi tha', description: 'Pakistani context mein theek nahi tha' },
    { id: 'unhelpful', label: 'Helpful nahi tha', description: 'Response se problem solve nahi hui' },
    { id: 'incorrect_info', label: 'Galat information', description: 'Response mein factual errors thay' }
  ];

  const handleQuickFeedback = async (isPositive) => {
    setIsSubmitting(true);
    try {
      const memory = memoryManager.getUserMemory(userId);
      
      const feedback = {
        rating: isPositive ? 5 : 2,
        type: 'quick',
        isPositive,
        timestamp: new Date()
      };

      await memory.recordFeedback(interactionId, feedback);
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedback);
      }
      
      // Show success message
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedFeedback = async () => {
    setIsSubmitting(true);
    try {
      const memory = memoryManager.getUserMemory(userId);
      
      const feedback = {
        rating,
        issue: selectedIssue,
        customFeedback,
        type: 'detailed',
        timestamp: new Date()
      };

      await memory.recordFeedback(interactionId, feedback);
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedback);
      }
      
      // Show success message
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => setRating(i + 1)}
        className={`p-1 transition-colors ${
          i < rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        <Star className="w-5 h-5" fill={i < rating ? 'currentColor' : 'none'} />
      </button>
    ));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Response ka feedback
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Message preview */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText}
              </p>
            </div>
          </div>

          {!showDetailedForm ? (
            // Quick feedback
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Kya yeh response helpful tha?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleQuickFeedback(true)}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Haan, acha tha</span>
                  </button>
                  <button
                    onClick={() => handleQuickFeedback(false)}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Nahi, theek nahi</span>
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowDetailedForm(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  Detailed feedback dena chahte hain?
                </button>
              </div>
            </div>
          ) : (
            // Detailed feedback form
            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating (1-5 stars):
                </label>
                <div className="flex items-center space-x-1">
                  {renderStars()}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {rating > 0 ? `${rating}/5` : 'Select rating'}
                  </span>
                </div>
              </div>

              {/* Issue selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kya issue tha? (optional):
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {feedbackIssues.map((issue) => (
                    <label key={issue.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="issue"
                        value={issue.id}
                        checked={selectedIssue === issue.id}
                        onChange={(e) => setSelectedIssue(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {issue.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {issue.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aur kuch kehna chahte hain? (optional):
                </label>
                <textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="Yahan apni feedback likhein..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              {/* Submit button */}
              <div className="flex space-x-3">
                <button
                  onClick={handleDetailedFeedback}
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  onClick={() => setShowDetailedForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Success message */}
          {isSubmitting && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Feedback submit ho raha hai...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackComponent;
