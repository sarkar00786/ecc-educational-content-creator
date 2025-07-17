import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, Check, FileText, Image, Download, ExternalLink, 
  Lightbulb, Brain, Target, BookOpen, Zap, Eye, 
  ChevronRight, Info, AlertCircle, CheckCircle2,
  PlayCircle, PauseCircle, RotateCcw
} from 'lucide-react';

// Educational Response Renderer implementing pedagogical principles
const EducationalResponseRenderer = ({ message, isUser = false, files = [], subject = 'general' }) => {
  const [copiedStates, setCopiedStates] = useState({});
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [keyConceptsHighlighted, setKeyConceptsHighlighted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const contentRef = useRef(null);

  // Pedagogical principles implementation
  const pedagogicalConfig = {
    // Cognitive Load Theory - chunking information
    chunkSize: 3,
    // Dual Coding Theory - visual + textual
    visualSupport: true,
    // Spacing Effect - distributed practice
    reviewPrompts: true,
    // Active Learning - engagement elements
    interactiveElements: true,
    // Bloom's Taxonomy - progressive complexity
    scaffolding: true
  };

  // Track reading progress for psychological engagement
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadingProgress(Math.min(progress, 100));
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Enhanced code copy functionality
  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Toggle section expansion for progressive disclosure
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Identify key concepts for highlighting
  const identifyKeyConcepts = (text) => {
    const keywordPatterns = [
      /\b(algorithm|function|method|process|principle|theory|concept|definition|formula|equation)\b/gi,
      /\b(important|crucial|key|essential|fundamental|critical|significant|primary)\b/gi,
      /\b(remember|note|observe|consider|understand|realize|recognize)\b/gi
    ];
    
    return keywordPatterns.some(pattern => pattern.test(text));
  };

  // Enhanced markdown components with pedagogical principles
  const components = {
    // Structured headings with cognitive hierarchy
    h1: ({ children }) => (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {children}
          </h1>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4" />
      </div>
    ),

    h2: ({ children }) => (
      <div className="mb-5 mt-8">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {children}
          </h2>
        </div>
        <div className="w-20 h-0.5 bg-purple-500 rounded-full" />
      </div>
    ),

    h3: ({ children }) => (
      <div className="mb-4 mt-6">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {children}
          </h3>
        </div>
      </div>
    ),

    // Enhanced paragraphs with reading psychology
    p: ({ children }) => {
      const textContent = typeof children === 'string' ? children : 
        React.Children.toArray(children).map(child => 
          typeof child === 'string' ? child : child.props?.children || ''
        ).join(' ');
      
      const isKeyConcept = identifyKeyConcepts(textContent);
      
      return (
        <div className={`mb-4 ${isKeyConcept ? 'relative' : ''}`}>
          {isKeyConcept && (
            <div className="absolute -left-3 top-0 w-1 h-full bg-yellow-400 rounded-full" />
          )}
          <p className={`leading-relaxed text-gray-700 dark:text-gray-300 ${
            isKeyConcept ? 'bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border-l-4 border-yellow-400' : ''
          }`}>
            {children}
          </p>
        </div>
      );
    },

    // Enhanced lists with cognitive chunking
    ul: ({ children, ...props }) => {
      const items = React.Children.toArray(children);
      const chunks = [];
      
      // Apply chunking principle (3-5 items per chunk)
      for (let i = 0; i < items.length; i += pedagogicalConfig.chunkSize) {
        chunks.push(items.slice(i, i + pedagogicalConfig.chunkSize));
      }
      
      return (
        <div className="my-4 space-y-4">
          {chunks.map((chunk, chunkIndex) => (
            <ul key={chunkIndex} className="space-y-2" {...props}>
              {chunk.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1 leading-relaxed text-gray-700 dark:text-gray-300">
                    {item}
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      );
    },

    ol: ({ children, ...props }) => {
      const items = React.Children.toArray(children);
      
      return (
        <div className="my-4">
          <ol className="space-y-3" {...props}>
            {items.map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 leading-relaxed text-gray-700 dark:text-gray-300 pt-0.5">
                  {item}
                </div>
              </li>
            ))}
          </ol>
        </div>
      );
    },

    // Remove default li styling since we handle it in ul/ol
    li: ({ children }) => <>{children}</>,

    // Enhanced tables with visual hierarchy
    table: ({ children }) => (
      <div className="my-6">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Reference Table
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border-collapse bg-white dark:bg-gray-800">
            {children}
          </table>
        </div>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        {children}
      </thead>
    ),

    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </tbody>
    ),

    th: ({ children }) => (
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
        {children}
      </td>
    ),

    tr: ({ children }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        {children}
      </tr>
    ),

    // Enhanced blockquotes for key insights
    blockquote: ({ children }) => (
      <div className="my-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
        <blockquote className="ml-6 pl-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-r-lg border-l-4 border-transparent">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-gray-700 dark:text-gray-300 italic">
              {children}
            </div>
          </div>
        </blockquote>
      </div>
    ),

    // Enhanced code blocks with learning features
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');
      const codeIndex = `${code.substring(0, 50)}-${Date.now()}`;

      if (!inline && language) {
        return (
          <div className="my-6">
            <div className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">
                  {language.toUpperCase()} Code
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(code, codeIndex)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
                title="Copy code"
              >
                {copiedStates[codeIndex] ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
            <SyntaxHighlighter
              style={tomorrow}
              language={language}
              PreTag="div"
              className="!mt-0 !rounded-t-none !rounded-b-lg"
              {...props}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code 
          className={`${className} px-2 py-1 rounded text-sm font-mono ${
            isUser 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`} 
          {...props}
        >
          {children}
        </code>
      );
    },

    // Enhanced links with security and UX
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center space-x-1 underline hover:no-underline transition-colors ${
          isUser
            ? 'text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100'
            : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
        }`}
      >
        <span>{children}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    ),

    // Enhanced horizontal rules
    hr: () => (
      <div className="my-8 flex items-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        <div className="px-4">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
      </div>
    ),

    // Enhanced emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/20 px-1 rounded">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic text-blue-700 dark:text-blue-300 font-medium">
        {children}
      </em>
    )
  };

  // Render learning progress indicator
  const renderProgressIndicator = () => (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Reading Progress
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(readingProgress)}%
          </span>
        </div>
      </div>
    </div>
  );

  // Render file attachments with educational context
  const renderFileAttachments = () => {
    if (files.length === 0) return null;
    
    return (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Learning Resources
          </h4>
        </div>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              {file.type.includes('image') ? (
                <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
              <div className="flex-1 min-w-0">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {file.name}
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <a 
                  href={file.url} 
                  download 
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="educational-response-container">
      {!isUser && renderProgressIndicator()}
      
      <div 
        ref={contentRef}
        className="prose prose-sm max-w-none dark:prose-invert educational-content"
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '1.5rem',
          lineHeight: '1.7',
          fontSize: '16px'
        }}
      >
        <ReactMarkdown components={components}>
          {message}
        </ReactMarkdown>
        
        {renderFileAttachments()}
      </div>

      {/* Educational footer with learning tips */}
      {!isUser && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Learning Tip
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Take a moment to reflect on key concepts. Try explaining them in your own words to reinforce understanding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalResponseRenderer;
