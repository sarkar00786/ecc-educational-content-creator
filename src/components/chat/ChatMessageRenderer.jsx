import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileText, Image, Download, ExternalLink, BookOpen, Lightbulb, Target, Info } from 'lucide-react';
import { useState } from 'react';

const ChatMessageRenderer = ({ message, isUser = false, files = [] }) => {
  const [copiedStates, setCopiedStates] = useState({});

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

  const components = {
    // Custom code block renderer with syntax highlighting
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');
      const codeIndex = `${code.substring(0, 50)}-${Date.now()}`;

      if (!inline && language) {
        return (
          <div className="relative group">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-sm text-gray-300 rounded-t-lg">
              <span className="font-medium">{language}</span>
              <button
                onClick={() => handleCopyCode(code, codeIndex)}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedStates[codeIndex] ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <SyntaxHighlighter
              style={tomorrow}
              language={language}
              PreTag="div"
              className="!mt-0 !rounded-t-none"
              {...props}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code 
          className={`${className} px-1.5 py-0.5 rounded text-sm ${
            isUser 
              ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`} 
          {...props}
        >
          {children}
        </code>
      );
    },

    // Custom blockquote styling
    blockquote: ({ children }) => (
      <blockquote className={`border-l-4 pl-4 my-4 ${
        isUser 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-400 bg-gray-50 dark:bg-gray-700/50'
      }`}>
        {children}
      </blockquote>
    ),

    // Enhanced list styling with proper visibility
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-outside ml-6 space-y-1 my-3" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside ml-6 space-y-1 my-3" {...props}>
        {children}
      </ol>
    ),

    li: ({ children, ...props }) => (
      <li className="leading-normal mb-1 text-inherit" {...props}>
        {children}
      </li>
    ),

    // Custom link styling
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline hover:no-underline transition-colors ${
          isUser
            ? 'text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100'
            : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
        }`}
      >
        {children}
      </a>
    ),

    // Educational headings with visual hierarchy and icons
    h1: ({ children }) => (
      <div className="mt-8 mb-6 first:mt-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {children}
          </h1>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
      </div>
    ),

    h2: ({ children }) => (
      <div className="mt-7 mb-5 first:mt-3">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {children}
          </h2>
        </div>
        <div className="w-24 h-0.5 bg-purple-500 rounded-full ml-9" />
      </div>
    ),

    h3: ({ children }) => (
      <div className="mt-6 mb-4 first:mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            {children}
          </h3>
        </div>
      </div>
    ),

    // Paragraph styling with common practices
    p: ({ children }) => (
      <p className="mb-4 first:mt-2 last:mb-2 leading-normal">
        {children}
      </p>
    ),

    // Better spacing for strong/bold text
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </strong>
    ),

    // Better spacing for emphasis/italic text
    em: ({ children }) => (
      <em className="italic text-gray-800 dark:text-gray-200">
        {children}
      </em>
    ),

    // Enhanced table styling with better appearance
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className={`min-w-full border-collapse rounded-lg shadow-sm ${
          isUser 
            ? 'border border-blue-200 dark:border-blue-800' 
            : 'border border-gray-200 dark:border-gray-700'
        }`}>
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className={`${
        isUser 
          ? 'bg-blue-50 dark:bg-blue-900/20' 
          : 'bg-gray-50 dark:bg-gray-800/50'
      }`}>
        {children}
      </thead>
    ),

    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </tbody>
    ),

    th: ({ children }) => (
      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
        isUser 
          ? 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30' 
          : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
      }`}>
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className={`px-4 py-3 text-sm whitespace-nowrap ${
        isUser 
          ? 'text-blue-900 dark:text-blue-100' 
          : 'text-gray-900 dark:text-gray-100'
      }`}>
        {children}
      </td>
    ),

    tr: ({ children }) => (
      <tr className={`transition-colors ${
        isUser 
          ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}>
        {children}
      </tr>
    ),

    // Custom horizontal rule
    hr: () => (
      <hr className={`my-4 border-0 h-px ${
        isUser 
          ? 'bg-blue-300 dark:bg-blue-700' 
          : 'bg-gray-300 dark:bg-gray-600'
      }`} />
    ),
  };

  const renderFileAttachments = () => {
    if (files.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {files.map((file, index) => (
          <div key={index} className={`flex items-center space-x-2 p-2 rounded border ${
            isUser 
              ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 bg-gray-50 dark:bg-gray-700/50'
          }`}>
            {file.type.includes('image') ? (
              <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <div className="flex-1 min-w-0">
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`font-medium text-sm truncate hover:underline ${
                  isUser
                    ? 'text-blue-800 dark:text-blue-200'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {file.name}
              </a>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <a href={file.url} download title="Download">
                <Download className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </a>
              <a href={file.url} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                <ExternalLink className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert text-sm space-y-4">
      <ReactMarkdown
        components={components}
      >
        {message}
      </ReactMarkdown>
      {renderFileAttachments()}
    </div>
  );
};

export default ChatMessageRenderer;
