import React, { useState, useRef, useCallback } from 'react';

/**
 * Basic Rich Text Editor Component
 * Provides simple formatting capabilities for text editing
 * Features:
 * - Bold, Italic, Underline formatting
 * - Bullet points and numbered lists
 * - Link insertion
 * - Text alignment
 * - Undo/Redo functionality
 * - Keyboard shortcuts support
 */
const RichTextEditor = ({ 
  value = '', 
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  className = '',
  minHeight = '300px'
}) => {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  /**
   * Executes formatting commands on the selected text
   * @param {string} command - The formatting command to execute
   * @param {string} value - Optional value for the command
   */
  const executeCommand = useCallback((command, value = null) => {
    if (disabled) return;
    
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Trigger onChange with updated content
    if (onChange) {
      const newContent = editorRef.current?.innerHTML || '';
      onChange(newContent);
    }
  }, [disabled, onChange]);

  /**
   * Handles content changes in the editor
   */
  const handleInput = useCallback(() => {
    if (onChange && editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  /**
   * Handles keyboard shortcuts
   */
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            executeCommand('redo');
          } else {
            executeCommand('undo');
          }
          break;
      }
    }
  }, [disabled, executeCommand]);

  /**
   * Gets the current state of a formatting command
   * @param {string} command - The command to check
   * @returns {boolean} - Whether the command is currently active
   */
  const isCommandActive = useCallback((command) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  /**
   * Inserts a link at the current selection
   */
  const insertLink = useCallback(() => {
    if (disabled) return;
    
    const url = prompt('Enter the URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  }, [disabled, executeCommand]);

  /**
   * Format button component
   */
  const FormatButton = ({ command, icon, title, onClick, isActive: active }) => (
    <button
      type="button"
      onClick={onClick || (() => executeCommand(command))}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors duration-150 ${
        active || isCommandActive(command)
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 mr-4">
          <FormatButton
            command="bold"
            title="Bold (Ctrl+B)"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3h5.5a1.5 1.5 0 010 3H5v2h5.5a3.5 3.5 0 100-7H5zM3 2a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h7.5a5.5 5.5 0 110 11H10.5a5.5 5.5 0 010-11H3z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="italic"
            title="Italic (Ctrl+I)"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 2a1 1 0 011 1v1h2a1 1 0 110 2h-1v8h1a1 1 0 110 2H9a1 1 0 01-1-1v-1H6a1 1 0 110-2h1V6H6a1 1 0 110-2h1V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="underline"
            title="Underline (Ctrl+U)"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v6a5 5 0 1010 0V3a1 1 0 112 0v6a7 7 0 11-14 0V3a1 1 0 011-1zM3 18a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 mr-4">
          <FormatButton
            command="insertUnorderedList"
            title="Bullet List"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h1a1 1 0 010 2H4a1 1 0 01-1-1zm3 0a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1zm-3 4a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm3 0a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1zm-3 4a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm3 0a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1zm-3 4a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm3 0a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="insertOrderedList"
            title="Numbered List"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 mr-4">
          <FormatButton
            command="justifyLeft"
            title="Align Left"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="justifyCenter"
            title="Align Center"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm2 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm2 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="justifyRight"
            title="Align Right"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Link and Utilities */}
        <div className="flex gap-1">
          <FormatButton
            onClick={insertLink}
            title="Insert Link"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="undo"
            title="Undo (Ctrl+Z)"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 110 14H9a1 1 0 110-2h2a5 5 0 100-10H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            }
          />
          <FormatButton
            command="redo"
            title="Redo (Ctrl+Shift+Z)"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 100 10h2a1 1 0 110 2H9A7 7 0 119 7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        style={{ minHeight }}
        className={`p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'cursor-text'
        }`}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      {/* Character/Word Count */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <div>
          {disabled ? 'Read-only mode' : 'Use toolbar above for formatting'}
        </div>
        <div>
          {value ? `${value.replace(/<[^>]*>/g, '').length} characters` : '0 characters'}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {isActive && (
        <div className="absolute z-10 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <div>Ctrl+B: Bold</div>
            <div>Ctrl+I: Italic</div>
            <div>Ctrl+U: Underline</div>
            <div>Ctrl+Z: Undo</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
