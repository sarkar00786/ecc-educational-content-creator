import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const CelebrationAnimation = ({ 
  isVisible = false, 
  onComplete = () => {},
  type = 'default', // 'default', 'magic', 'generate'
  duration = 3000
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShouldRender(false);
          onComplete();
        }, 500); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  if (!shouldRender) return null;

  const getAnimationElements = () => {
    const elements = [];
    const count = type === 'magic' ? 20 : 15;
    
    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 2000;
      const duration = 2000 + Math.random() * 1000;
      const xStart = Math.random() * 100;
      const yStart = type === 'magic' ? 10 + Math.random() * 20 : 50 + Math.random() * 20;
      const rotation = Math.random() * 360;
      const scale = 0.5 + Math.random() * 0.5;
      
      elements.push(
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${xStart}%`,
            top: `${yStart}%`,
            animationDelay: `${delay}ms`,
            animationDuration: `${duration}ms`,
            transform: `rotate(${rotation}deg) scale(${scale})`,
            animation: isAnimating ? `celebration-float ${duration}ms ease-out ${delay}ms forwards` : 'none'
          }}
        >
          {type === 'magic' ? (
            <div className="text-2xl">
              {['✨', '🌟', '⭐', '💫', '🎭', '🎪', '🎨', '🎯'][Math.floor(Math.random() * 8)]}
            </div>
          ) : (
            <div className="text-xl">
              {['🎉', '🎊', '✨', '🌟', '🎆', '🎇', '💥', '🎈'][Math.floor(Math.random() * 8)]}
            </div>
          )}
        </div>
      );
    }
    
    return elements;
  };

  const getContainerPosition = () => {
    if (type === 'magic') {
      return 'top-16 left-0 right-0 h-32'; // Top of screen for magic entry
    } else {
      return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96'; // Center burst
    }
  };

  const animationContent = (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Background overlay for center burst */}
      {type === 'generate' && (
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            isAnimating ? 'opacity-10' : 'opacity-0'
          }`}
        />
      )}
      
      {/* Animation container */}
      <div className={`absolute ${getContainerPosition()}`}>
        {getAnimationElements()}
        
        {/* Central burst effect for generate type */}
        {type === 'generate' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ${
                isAnimating ? 'scale-150 opacity-0' : 'scale-0 opacity-100'
              }`}
              style={{
                boxShadow: isAnimating ? '0 0 50px rgba(59, 130, 246, 0.5)' : 'none'
              }}
            />
          </div>
        )}
        
        {/* Magic sparkle trail for magic type */}
        {type === 'magic' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div 
              className={`text-4xl transition-all duration-2000 ${
                isAnimating ? 'transform translate-y-8 opacity-0' : 'opacity-100'
              }`}
            >
              🪄
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(animationContent, document.body);
};

// Add CSS animations to the document head
const addAnimationStyles = () => {
  const styleId = 'celebration-animation-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes celebration-float {
      0% {
        transform: translateY(0px) rotate(0deg) scale(1);
        opacity: 1;
      }
      50% {
        transform: translateY(-50px) rotate(180deg) scale(1.2);
        opacity: 0.8;
      }
      100% {
        transform: translateY(-100px) rotate(360deg) scale(0.5);
        opacity: 0;
      }
    }
    
    @keyframes celebration-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles when component is first imported
addAnimationStyles();

export default CelebrationAnimation;
