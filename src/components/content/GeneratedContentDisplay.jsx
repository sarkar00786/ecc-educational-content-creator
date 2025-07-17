import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import FeedbackForm from './FeedbackForm';
import RichTextEditor from '../common/RichTextEditor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GeneratedContentDisplay = forwardRef(({ 
  generatedContent, 
  onBack, 
  onSave, 
  onCopy, 
  isFullScreen = false,
  user,
  onSuccess,
  onError
}, ref) => {
  const [editedContent, setEditedContent] = useState(generatedContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const scrollableRef = useRef(null);
  const contentRef = useRef(null);

  // Expose scroll methods to parent via ref
  useImperativeHandle(ref, () => ({
    scrollDown: () => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollBy({ top: 200, behavior: 'smooth' });
      }
    },
    scrollUp: () => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollBy({ top: -200, behavior: 'smooth' });
      }
    }
  }), []);

  const handleContentChange = (newValue) => {
    setEditedContent(newValue);
    setHasUnsavedChanges(newValue !== generatedContent);
  };

  // Utility function to strip HTML tags and get plain text
  const stripHtmlTags = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Enhanced copy function that handles rich text content
  const handleCopy = async () => {
    try {
      // Get plain text version of the content
      const plainText = stripHtmlTags(editedContent);
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(plainText);
        onSuccess('Content copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = plainText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        onSuccess('Content copied to clipboard!');
      }
      
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy:', error);
      onError('Failed to copy content to clipboard');
    }
  };

  // PDF download function
  const handleDownloadPDF = async () => {
    if (!editedContent) {
      onError('No content to download');
      return;
    }

    setIsDownloadingPDF(true);
    try {
      // Create a temporary div with the content for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editedContent;
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      
      document.body.appendChild(tempDiv);

      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Clean up temporary div
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit content on page
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `generated-content-${timestamp}.pdf`;
      
      pdf.save(filename);
      onSuccess('PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      onError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      onSuccess('No changes to save.');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(editedContent);
      setHasUnsavedChanges(false);
      onSuccess('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      onError('Failed to save content: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Generated Content
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isDownloadingPDF ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            )}
            <span>{isDownloadingPDF ? 'Generating...' : 'PDF'}</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSaving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-3m-9-4h4l3 3m0 0l3-3m-3 3V4" />
              </svg>
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div ref={scrollableRef} className="flex-1 p-6 overflow-y-auto">
        <div className="w-full">
          <RichTextEditor
            value={editedContent}
            onChange={handleContentChange}
            placeholder="Generated content will appear here..."
            minHeight="500px"
            className="w-full"
          />
          
          {/* Content Stats */}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
            <div>
              <span className="mr-4">{editedContent.length} characters</span>
              <span>{editedContent.split(/\s+/).filter(word => word.length > 0).length} words</span>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Form - positioned at bottom on desktop */}
      {!isFullScreen && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <FeedbackForm user={user} onSuccess={onSuccess} onError={onError} />
        </div>
      )}

      {/* Mobile Back Button */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
});

export default GeneratedContentDisplay;
