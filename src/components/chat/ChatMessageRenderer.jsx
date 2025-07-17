import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileText, Image, Download, ExternalLink } from 'lucide-react';
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

    // Custom list styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 my-2">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1 my-2">
        {children}
      </ol>
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

    // Custom heading styling
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-lg font-semibold mt-3 mb-2 first:mt-0">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-base font-medium mt-3 mb-2 first:mt-0">
        {children}
      </h3>
    ),

    // Custom paragraph styling
    p: ({ children }) => (
      <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">
        {children}
      </p>
    ),

    // Custom table styling
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300 dark:border-gray-600">
          {children}
        </table>
      </div>
    ),

    th: ({ children }) => (
      <th className={`border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium ${
        isUser 
          ? 'bg-blue-100 dark:bg-blue-900/30' 
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
        {children}
      </td>
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
    <div className="prose prose-sm max-w-none dark:prose-invert text-sm whitespace-pre-wrap">
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
