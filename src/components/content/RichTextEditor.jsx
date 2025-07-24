import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import '../../styles/tiptap.css';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Image as ImageIcon, 
  Undo, 
  Redo, 
  Palette,
  Maximize,
  Minimize
} from 'lucide-react';

const RichTextEditor = ({ content, onContentChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMathSymbols, setShowMathSymbols] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const mathDropdownRef = useRef(null);
  const subjectSelectRef = useRef(null);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  const toggleMathSymbols = useCallback(() => {
    setShowMathSymbols(!showMathSymbols);
  }, [showMathSymbols]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mathDropdownRef.current && !mathDropdownRef.current.contains(event.target)) {
        setShowMathSymbols(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Mathematical symbols organized by categories
  const mathSymbols = {
    'Basic Operations': {
      symbols: ['+', '−', '×', '÷', '±', '∓', '=', '≠', '≈', '≡'],
      description: 'Addition, subtraction, multiplication, division'
    },
    'Comparison': {
      symbols: ['<', '>', '≤', '≥', '≪', '≫', '≺', '≻', '⊂', '⊃'],
      description: 'Less than, greater than, subset'
    },
    'Fractions & Powers': {
      symbols: ['½', '⅓', '¼', '¾', '⅕', '⅖', '⅗', '⅘', '⅙', '⅛', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁰', '¹'],
      description: 'Common fractions and superscripts'
    },
    'Greek Letters': {
      symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
      description: 'Greek alphabet (lowercase)'
    },
    'Greek Letters (Uppercase)': {
      symbols: ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'],
      description: 'Greek alphabet (uppercase)'
    },
    'Calculus & Analysis': {
      symbols: ['∫', '∮', '∯', '∰', '∇', '∂', '∆', '∞', '∑', '∏', '∐', '√', '∛', '∜', '∝', '∴', '∵'],
      description: 'Integration, differentiation, limits'
    },
    'Set Theory': {
      symbols: ['∅', '∈', '∉', '∋', '∌', '∩', '∪', '∁', '∖', '⊆', '⊇', '⊊', '⊋', '⊄', '⊅', '℘'],
      description: 'Sets, membership, union, intersection'
    },
    'Logic': {
      symbols: ['∧', '∨', '¬', '→', '↔', '⇒', '⇔', '∀', '∃', '∄', '⊤', '⊥', '⊢', '⊨', '∴', '∵'],
      description: 'Logical operators and quantifiers'
    },
    'Geometry': {
      symbols: ['°', '∠', '⊥', '∥', '≅', '∼', '△', '▢', '○', '◯', '⊙', '⌐', '∟', '⊿', '∡', '∢'],
      description: 'Angles, shapes, parallel, perpendicular'
    },
    'Advanced': {
      symbols: ['ℵ', '℧', '℩', '∲', '∳', '⊗', '⊕', '⊖', '⊘', '⊙', '⊚', '⊛', '⊜', '⊝', '⊞', '⊟', '⊠', '⊡'],
      description: 'Advanced mathematical symbols'
    },
    'Arrows': {
      symbols: ['←', '→', '↑', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕'],
      description: 'Directional arrows'
    },
    'Miscellaneous': {
      symbols: ['∼', '≈', '≃', '≄', '≅', '≆', '≇', '≈', '≉', '≊', '≋', '≌', '≍', '≎', '≏', '≐', '≑', '≒'],
      description: 'Other mathematical symbols'
    }
  };
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Remove the Strike extension from StarterKit if it conflicts
        strike: false,
        // Disable underline from StarterKit to avoid duplication
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      Color,
      TextStyle,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        'data-placeholder': 'Start writing your book content here...',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
    autofocus: true,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Cleanup effect to destroy editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const insertMathSymbol = useCallback((symbol) => {
    if (editor) {
      editor.chain().focus().insertContent(symbol).run();
      setShowMathSymbols(false);
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml';
    
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result;
          if (imageUrl) {
            // Insert image at the beginning of the editor content
            editor.chain().focus().setContent(
              `<div style="text-align: center; margin-bottom: 1rem;"><img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 0.5rem;" /></div>` +
              editor.getHTML()
            ).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [editor]);

  const setColor = useCallback(() => {
    const color = window.prompt('Color (hex)');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const handleSubjectChange = useCallback((e) => {
    const value = e.target.value;
    if (value) {
      setSelectedSubject(value);
      onContentChange(value);
      // Blur the select element to remove focus and blue outline
      setTimeout(() => {
        if (subjectSelectRef.current) {
          subjectSelectRef.current.blur();
        }
      }, 100);
    }
  }, [onContentChange]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-editor ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col' : ''}`}>
      {!isFullscreen && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📖 Book Content
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Use the toolbar below to format your content with headings, lists, images, and more.
          </p>
        </div>
      )}
      
      {/* Toolbar */}
      <div className={`border border-gray-300 dark:border-gray-600 ${isFullscreen ? 'rounded-none' : 'rounded-t-lg'} bg-gray-50 dark:bg-gray-700 p-2 flex flex-wrap gap-1 ${isFullscreen ? 'flex-shrink-0' : ''}`}>
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('underline') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Image Upload */}
        <button
          onClick={addImage}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Color */}
        <button
          onClick={setColor}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        
        {/* Spacer to push right-side buttons to the right */}
        <div className="flex-1" />
        
        {/* Mathematical Symbols Dropdown */}
        <div className="relative" ref={mathDropdownRef}>
          <button
          onClick={toggleMathSymbols}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            showMathSymbols ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Mathematical Symbols"
        >
          <span className="w-4 h-4 flex items-center justify-center text-sm font-bold">Σ</span>
        </button>

        {/* Subject Selection Dropdown */}
        <select
          ref={subjectSelectRef}
          className="p-1.5 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          title="Select Subject for Enhanced AI Prompting"
          onChange={handleSubjectChange}
          value={selectedSubject}
        >
          <option value="" disabled>📚 Select Subject</option>
          <option value="Accounting & Finance">💰 Accounting & Finance</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Physics">⚡ Physics</option>
          <option value="Chemistry">🧪 Chemistry</option>
          <option value="History">📜 History</option>
          <option value="Literature">📖 Literature</option>
        </select>
          
          {/* Math Symbols Dropdown */}
          {showMathSymbols && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mathematical Symbols</h3>
                {Object.entries(mathSymbols).map(([category, data]) => (
                  <div key={category} className="mb-3">
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{category}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{data.description}</p>
                    <div className="grid grid-cols-10 gap-1">
                      {data.symbols.map((symbol, index) => (
                        <button
                          key={`${category}-${index}`}
                          onClick={() => insertMathSymbol(symbol)}
                          className="w-6 h-6 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center transition-colors"
                          title={symbol}
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Editor Content */}
      <div 
        className={`border border-gray-300 dark:border-gray-600 border-t-0 ${isFullscreen ? 'rounded-none flex-1' : 'rounded-b-lg'} cursor-text`}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent 
          editor={editor}
          className={`p-4 focus:outline-none ${isFullscreen ? 'h-full' : 'min-h-[300px]'}`}
          style={{
            outline: 'none',
            border: 'none'
          }}
        />
      </div>
      
    </div>
  );
};

export default RichTextEditor;

