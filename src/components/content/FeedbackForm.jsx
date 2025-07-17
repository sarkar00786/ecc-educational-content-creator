import React, { useState } from 'react';

const FeedbackForm = ({ user, onSuccess, onError }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      onError('Feedback cannot be empty.');
      return;
    }
    
    if (feedbackText.trim().length < 10) {
      onError('Feedback must be at least 10 characters long.');
      return;
    }
    
    if (!user) {
      onError('Please log in to submit feedback.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/.netlify/functions/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email || 'anonymous@eccapp.com',
          message: `Type: ${feedbackType}\nRating: ${rating}/5\n\nFeedback: ${feedbackText}`,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess('Feedback submitted successfully! Thank you for your input.');
        setFeedbackText('');
        setFeedbackType('general');
        setRating(0);
      } else {
        throw new Error(result.error || 'Something went wrong!');
      }
    } catch (error) {
      onError(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<div className="p-6 w-full bg-white dark:bg-gray-800">
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Give Us Feedback
        </h3>
      
      {/* Feedback Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Feedback Type
        </label>
        <select
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="general">General Feedback</option>
          <option value="clarity">Content Clarity</option>
          <option value="engagement">Engagement Level</option>
          <option value="cultural">Cultural Relevance</option>
          <option value="application">Application Opportunities</option>
          <option value="assessment">Assessment Quality</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="ui">User Interface</option>
        </select>
      </div>
      
      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Overall Rating
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-8 h-8 rounded ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              } hover:text-yellow-400 transition-colors`}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      
      {/* Feedback Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Feedback
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition duration-200 h-24 resize-y"
          placeholder="Help us improve! Share feedback on content clarity, engagement, cultural relevance, or practical application opportunities. Report bugs, suggest features, or tell us how well the content met your learning objectives... (minimum 10 characters)"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {feedbackText.length}/10 characters minimum
        </div>
      </div>
      
      <button
        onClick={handleSubmitFeedback}
        disabled={isSubmitting || !user || !feedbackText.trim() || feedbackText.trim().length < 10}
        className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Feedback'
        )}
      </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
