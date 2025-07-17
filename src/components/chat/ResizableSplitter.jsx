import React, { useState, useEffect, useRef } from 'react';

const ResizableSplitter = ({ 
  onResize, 
  initialWidth = 256, 
  minWidth = 200, 
  maxWidth = 500,
  className = "",
  isVisible = true,
  currentWidth = initialWidth // Add currentWidth prop for proper state sync
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(currentWidth);
  const splitterRef = useRef(null);

  // Update startWidth when currentWidth changes
  useEffect(() => {
    if (!isResizing) {
      setStartWidth(currentWidth);
    }
  }, [currentWidth, isResizing]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      // Prevent text selection and other default behaviors
      e.preventDefault();
      
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      
      console.log('ResizableSplitter: Mouse move', {
        clientX: e.clientX,
        startX,
        deltaX,
        startWidth,
        newWidth,
        minWidth,
        maxWidth
      });
      
      // Only call onResize if we have a valid callback and the width actually changed
      if (onResize && typeof onResize === 'function') {
        onResize(newWidth);
      }
    };

    const handleMouseUp = (e) => {
      if (!isResizing) return;
      
      e.preventDefault();
      console.log('ResizableSplitter: Mouse up, stopping resize');
      setIsResizing(false);
      
      // Reset cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // Add event listeners for mouse leave to handle edge cases
    const handleMouseLeave = (e) => {
      if (isResizing) {
        // Continue tracking even when mouse leaves the window
        handleMouseMove(e);
      }
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      document.addEventListener('mouseleave', handleMouseLeave, { passive: false });
      
      // Handle escape key to cancel resize
      const handleEscape = (e) => {
        if (e.key === 'Escape' && isResizing) {
          setIsResizing(false);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      // Cleanup in case component unmounts during resize
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startX, startWidth, minWidth, maxWidth, onResize]);

  const handleMouseDown = (e) => {
    if (!isVisible) return;
    
    console.log('ResizableSplitter: Mouse down', {
      clientX: e.clientX,
      isVisible,
      currentWidth: currentWidth
    });
    
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(currentWidth); // Use currentWidth instead of parent element width
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={splitterRef}
      className={`relative group ${className}`}
      style={{ width: '4px', flexShrink: 0 }}
    >
      {/* Invisible wider area for easier mouse interaction */}
      <div
        className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize"
        onMouseDown={handleMouseDown}
      />
      
      {/* Visual splitter line */}
      <div 
        className={`absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-300 dark:bg-gray-600 transition-all duration-200 ${
          isResizing 
            ? 'bg-blue-500 dark:bg-blue-400 shadow-lg' 
            : 'group-hover:bg-gray-400 dark:group-hover:bg-gray-500'
        }`}
      />
      
      {/* Hover indicator */}
      <div 
        className={`absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-blue-500 dark:bg-blue-400 opacity-0 transition-opacity duration-200 ${
          isResizing ? 'opacity-100' : 'group-hover:opacity-50'
        }`}
      />
      
      {/* Resize handle dots (visible on hover) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex flex-col space-y-1">
          <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ResizableSplitter;
