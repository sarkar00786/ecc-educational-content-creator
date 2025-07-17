import React, { useState, useRef, useCallback } from 'react';
import { Bold, Italic, List, Link, Code } from 'lucide-react';

const ChatInputEditor = ({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder = "Type a message...", 
  disabled = false,
  className = "",
  autoFocus = false
}) => {
  const textareaRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const insertMarkdown = useCallback((prefix, suffix = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    if (selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    } else {
      // Insert at cursor position
      newText = value.substring(0, start) + prefix + suffix + value.substring(end);
    }
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + prefix.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)');
          break;
        case '`':
          e.preventDefault();
          insertMarkdown('`', '`');
          break;
      }
    }
    
    // Call parent's onKeyPress
    if (onKeyPress) {
      onKeyPress(e);
    }
  }, [insertMarkdown, onKeyPress]);

  const ToolbarButton = ({ icon, title, onClick, shortcut }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${title} ${shortcut ? `(${shortcut})` : ''}`}
      className="p-1.5 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
    </button>
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-1">
            <ToolbarButton
              icon={<Bold className="w-4 h-4" />}
              title="Bold"
              shortcut="Ctrl+B"
              onClick={() => insertMarkdown('**', '**')}
            />
            <ToolbarButton
              icon={<Italic className="w-4 h-4" />}
              title="Italic"
              shortcut="Ctrl+I"
              onClick={() => insertMarkdown('*', '*')}
            />
            <ToolbarButton
              icon={<Code className="w-4 h-4" />}
              title="Code"
              shortcut="Ctrl+`"
              onClick={() => insertMarkdown('`', '`')}
            />
            <ToolbarButton
              icon={<List className="w-4 h-4" />}
              title="List"
              onClick={() => insertMarkdown('- ', '')}
            />
            <ToolbarButton
              icon={<Link className="w-4 h-4" />}
              title="Link"
              shortcut="Ctrl+K"
              onClick={() => insertMarkdown('[', '](url)')}
            />
          </div>
          
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Markdown
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
          rows={3}
          style={{ minHeight: '80px', maxHeight: '200px' }}
        />

        {/* Markdown Tooltip */}
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-64">
            <div className="font-medium mb-2">Markdown Shortcuts:</div>
            <div className="space-y-1">
              <div>**bold** or Ctrl+B</div>
              <div>*italic* or Ctrl+I</div>
              <div>`code` or Ctrl+`</div>
              <div>- List item</div>
              <div>[link](url) or Ctrl+K</div>
              <div>```code block```</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInputEditor;
