import React from 'react';

// This component helps verify that React is properly loaded
const ReactDebug = () => {
  // Add React instance to window for debugging
  if (typeof window !== 'undefined') {
    window.ReactDebugInstance = React;
    console.log('React Debug:', {
      hasReact: !!React,
      reactVersion: React.version,
      reactInstance: React
    });
  }

  return null; // This component doesn't render anything
};

export default ReactDebug;
