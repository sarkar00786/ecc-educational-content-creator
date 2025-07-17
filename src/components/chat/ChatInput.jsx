import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Mic, MicOff, Paperclip, Image, X, AlertCircle, Pause } from 'lucide-react';

const ChatInput = React.memo(({ 
  value, 
  onChange, 
  onSend, 
  onVoiceToggle,
  isVoiceListening = false,
  isVoiceSupported = false,
  disabled = false,
  placeholder = "Type a message...",
  className = "",
  onFileUpload,
  autoFocus = false,
  onPauseMessage,
  isExternallySending = false
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shouldMaintainFocus, setShouldMaintainFocus] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const focusTimeoutRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [sentFiles, setSentFiles] = useState([]);
  
  // Use external sending state if provided, otherwise use internal state
  const effectiveIsSending = useMemo(() => isExternallySending || isSending, [isExternallySending, isSending]);
  
  // Update internal state when external state changes
  useEffect(() => {
    if (isExternallySending !== undefined) {
      setIsSending(isExternallySending);
    }
  }, [isExternallySending]);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 2) {
      alert("You can only upload a maximum of 2 files.");
      return;
    }

    const validFiles = files.filter(file => file.size <= 250 * 1024);
    if (validFiles.length !== files.length) {
      alert("Some files exceed the 250KB limit and were not added.");
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    // Maintain focus after file selection
    if (textareaRef.current && isFocused) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Maintain focus after file removal
    if (textareaRef.current && isFocused) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  };

  // Focus persistence logic
  const maintainFocus = useCallback(() => {
    if (textareaRef.current && shouldMaintainFocus) {
      // Clear any existing timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      
      // Set focus with a small delay to ensure DOM is ready
      focusTimeoutRef.current = setTimeout(() => {
        if (textareaRef.current && !disabled) {
          textareaRef.current.focus();
        }
      }, 50);
    }
  }, [shouldMaintainFocus, disabled]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the new height
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 36; // Single line height
      const maxHeight = 150; // Maximum height before scroll
      
      // Set the height within bounds
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Show/hide scrollbar based on content
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
      
      // Maintain focus after resize if user was typing
      if (isUserTyping && isFocused) {
        maintainFocus();
      }
    }
  }, [value, isUserTyping, isFocused, maintainFocus]);

  // Prevent unwanted refreshes and maintain focus
  useEffect(() => {
    // Prevent page refresh on form submission
    const handleBeforeUnload = (e) => {
      if (isUserTyping && value.trim()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Prevent accidental navigation
    const handleKeyDown = (e) => {
      // Prevent F5 refresh when typing
      if (e.key === 'F5' && isUserTyping) {
        e.preventDefault();
      }
      
      // Prevent Ctrl+R refresh when typing
      if (e.ctrlKey && e.key === 'r' && isUserTyping) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserTyping, value]);

  // Maintain focus on component updates
  useEffect(() => {
    if (shouldMaintainFocus) {
      maintainFocus();
    }
  }, [shouldMaintainFocus, maintainFocus]);

  // Auto-focus effect when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && textareaRef.current && !disabled) {
      // Clear any existing timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      
      // Set focus with a delay to ensure DOM is ready
      focusTimeoutRef.current = setTimeout(() => {
        if (textareaRef.current && !disabled) {
          textareaRef.current.focus();
          setIsFocused(true);
          setShouldMaintainFocus(true);
        }
      }, 100);
    }
  }, [autoFocus, disabled]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    console.log('ChatInput: handleKeyDown called', { key: e.key, shiftKey: e.shiftKey, value, disabled, onSend: typeof onSend });
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (effectiveIsSending) {
        // If currently sending, pause/cancel the message
        handlePauseMessage();
        return;
      }
      
      if ((value.trim() || selectedFiles.length > 0) && !disabled && onSend) {
        console.log('ChatInput: Calling onSend with value and files:', value, selectedFiles);
        
        // Store the message and files before sending
        setSentMessage(value);
        setSentFiles(selectedFiles);

        // Clear input
        onChange('');
        setSelectedFiles([]);

        // Call onSend
        onSend(value, selectedFiles);

        // Inform user that message is sending
        setIsSending(true);

        return;
      }
    }

    // Persist typing state if user interacts with input
    if (!isUserTyping) {
      setIsUserTyping(true);
    }
  };

  const handlePauseMessage = () => {
    console.log('ChatInput: handlePauseMessage called');
    if (onPauseMessage && effectiveIsSending) {
      onPauseMessage();
    } else {
      setIsSending(false);
      setSentMessage('');
      setSentFiles([]);
    }
  };

  const handleVoiceClick = () => {
    if (onVoiceToggle) {
      onVoiceToggle();
    }
  };

  const handleValueChange = (e) => {
    onChange(e.target.value);
  };

  const handleSendClick = () => {
    if (effectiveIsSending) {
      handlePauseMessage();
    } else if ((value.trim() || selectedFiles.length > 0) && !disabled && onSend) {
      // Store the message and files before sending
      setSentMessage(value);
      setSentFiles(selectedFiles);

      // Clear input
      onChange('');
      setSelectedFiles([]);

      // Call onSend
      onSend(value, selectedFiles);

      // Inform user that message is sending
      setIsSending(true);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">{file.name}</span>
              <button onClick={() => handleRemoveFile(index)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div 
        className={`flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
      >
        {/* Textarea Container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleValueChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShouldMaintainFocus(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setShouldMaintainFocus(false);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-3 py-2 pr-32 bg-transparent text-gray-900 dark:text-white 
              placeholder-gray-500 dark:placeholder-gray-400 
              resize-none border-none outline-none
              focus:outline-none focus:shadow-none
              text-sm leading-5
              min-h-[36px] max-h-[150px]
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
            style={{
              overflowY: 'hidden',
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 transparent'
            }}
            rows={1}
          />
          
          {/* Action buttons positioned absolutely at the right side of textarea */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* File upload button */}
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="p-1.5 rounded-full transition-all duration-200 transform hover:scale-105 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                <Paperclip className="w-4 h-4" />
              </label>
            </div>
            
            {/* Voice button */}
            {isVoiceSupported && (
              <button
                onClick={handleVoiceClick}
                disabled={disabled}
                className={`
                  p-1.5 rounded-full transition-all duration-200 transform hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  ${isVoiceListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }
                `}
                title={isVoiceListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isVoiceListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Send/Pause button */}
            <button
              onClick={handleSendClick}
              disabled={(!value.trim() && selectedFiles.length === 0 && !effectiveIsSending) || disabled}
              className={`
                p-1.5 rounded-full transition-all duration-200 transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${effectiveIsSending
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg animate-pulse'
                  : (value.trim() || selectedFiles.length > 0) && !disabled
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }
              `}
              title={effectiveIsSending ? "Pause message" : "Send message"}
            >
              {effectiveIsSending ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;

