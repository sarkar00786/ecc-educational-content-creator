import React, { useState, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';

/**
 * Enhanced File Upload Zone Component
 * Provides advanced drag-and-drop functionality with comprehensive visual feedback
 * Features:
 * - Drag over, drag enter, and drag leave state management
 * - Visual feedback with border and background color changes
 * - File type validation and error handling
 * - Progress indication and file preview
 * - Accessibility support with keyboard navigation
 * - Comprehensive error handling for unsupported file types
 */
const FileUploadZone = ({ 
  onFileChange, 
  acceptedTypes = ".txt,.pdf,.doc,.docx",
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = ""
}) => {
  const [dragState, setDragState] = useState({
    isDragOver: false,
    isDragEnter: false,
    isDragLeave: false
  });
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    uploadProgress: 0,
    uploadedFile: null,
    error: null
  });
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  /**
   * Validates file type and size
   * @param {File} file - The file to validate
   * @returns {object} - Validation result with isValid and error message
   */
  const validateFile = useCallback((file) => {
    const acceptedExtensions = acceptedTypes.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    // Check file type
    if (!acceptedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type "${fileExtension}" is not supported. Please upload: ${acceptedTypes}`
      };
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`
      };
    }
    
    return { isValid: true, error: null };
  }, [acceptedTypes, maxFileSize]);

  /**
   * Handles file processing and upload simulation
   * @param {File} file - The file to process
   */
  const processFile = useCallback(async (file) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        error: validation.error,
        isUploading: false
      }));
      return;
    }

    // Start upload simulation with progress
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null
    }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadState(prev => {
        if (prev.uploadProgress >= 100) {
          clearInterval(progressInterval);
          return {
            ...prev,
            isUploading: false,
            uploadProgress: 100,
            uploadedFile: file
          };
        }
        return {
          ...prev,
          uploadProgress: prev.uploadProgress + 10
        };
      });
    }, 100);

    // Call parent callback after processing
    setTimeout(() => {
      onFileChange(file);
    }, 1000);
  }, [validateFile, onFileChange]);

  /**
   * Enhanced drag event handlers with comprehensive state management
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      isDragEnter: true,
      isDragOver: true,
      isDragLeave: false
    }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag leave if we're actually leaving the drop zone
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setDragState(prev => ({
        ...prev,
        isDragLeave: true,
        isDragOver: false,
        isDragEnter: false
      }));
      
      // Reset drag leave state after animation
      setTimeout(() => {
        setDragState(prev => ({
          ...prev,
          isDragLeave: false
        }));
      }, 150);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState(prev => ({
      ...prev,
      isDragOver: true,
      isDragEnter: false,
      isDragLeave: false
    }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset all drag states
    setDragState({
      isDragOver: false,
      isDragEnter: false,
      isDragLeave: false
    });

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]); // Process first file only
    }
  }, [disabled, processFile]);

  /**
   * Handles file input change (traditional file picker)
   */
  const handleFileInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  /**
   * Handles click to open file dialog
   */
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  /**
   * Handles keyboard interaction for accessibility
   */
  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  }, [disabled, handleClick]);

  /**
   * Clears uploaded file and resets state
   */
  const handleClearFile = useCallback(() => {
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      uploadedFile: null,
      error: null
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onFileChange(null);
  }, [onFileChange]);

  // Dynamic styling based on drag state
  const getDragStateClasses = () => {
    let classes = "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-150 ease-in-out ";
    
    if (disabled) {
      classes += "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50 ";
    } else if (dragState.isDragOver) {
      classes += "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 transform scale-105 shadow-lg ";
    } else if (dragState.isDragEnter) {
      classes += "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 ";
    } else if (dragState.isDragLeave) {
      classes += "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 ";
    } else if (uploadState.error) {
      classes += "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 ";
    } else if (uploadState.uploadedFile) {
      classes += "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 ";
    } else {
      classes += "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer ";
    }
    
    return classes + className;
  };

  // Render upload icon based on state
  const renderIcon = () => {
    if (uploadState.isUploading) {
      return (
        <svg className="mx-auto h-12 w-12 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3-3m0 0l3 3m-3-3v12" />
        </svg>
      );
    }
    
    if (uploadState.uploadedFile) {
      return (
        <svg className="mx-auto h-12 w-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    if (uploadState.error) {
      return (
        <svg className="mx-auto h-12 w-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
return (
      <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
        <Upload className="w-12 h-12 text-gray-500 dark:text-gray-400" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        ref={dropZoneRef}
        className={getDragStateClasses()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`File upload zone. Drag and drop files here or click to select. Accepted types: ${acceptedTypes}`}
        aria-disabled={disabled}
      >
        {renderIcon()}
        
        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Uploading... {uploadState.uploadProgress}%
            </p>
          </div>
        )}
        
        {/* Success State */}
        {uploadState.uploadedFile && !uploadState.isUploading && (
          <div className="mb-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              ✓ File uploaded successfully!
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {uploadState.uploadedFile.name} ({(uploadState.uploadedFile.size / 1024).toFixed(1)} KB)
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Remove file
            </button>
          </div>
        )}
        
        {/* Error State */}
        {uploadState.error && (
          <div className="mb-4">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              ⚠ Upload Error
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              {uploadState.error}
            </p>
          </div>
        )}
        
        {/* Default State */}
        {!uploadState.isUploading && !uploadState.uploadedFile && !uploadState.error && (
          <div>
            <p className={`text-sm font-medium mb-2 transition-colors duration-150 ${
              dragState.isDragOver ? 'text-blue-600 dark:text-blue-400' :
              dragState.isDragEnter ? 'text-green-600 dark:text-green-400' :
              dragState.isDragLeave ? 'text-red-500 dark:text-red-400' :
              'text-gray-700 dark:text-gray-300'
            }`}>
              {dragState.isDragOver ? 'Drop file here!' :
               dragState.isDragEnter ? 'Release to upload' :
               dragState.isDragLeave ? 'File dropped outside zone' :
               'Drag & drop your file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: {acceptedTypes.replace(/\./g, '').toUpperCase()} • Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      
      {/* Additional file information */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>💡 <strong>Tip:</strong> You can drag files directly from your file explorer into this area</p>
        <p>🔒 <strong>Privacy:</strong> Files are processed locally and securely</p>
      </div>
    </div>
  );
};

export default FileUploadZone;
