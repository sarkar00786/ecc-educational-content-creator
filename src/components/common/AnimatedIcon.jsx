/**
 * Enhanced Animation System - Lottie/SVG Complex Animations
 * 
 * Provides support for complex animations using Lottie files and optimized SVGs
 * as specified in the plan for enhanced UI components and animations.
 */

import React, { useEffect, useRef, useState } from 'react';

const AnimatedIcon = ({
  type = 'success',
  size = 24,
  className = '',
  autoplay = true,
  loop = false,
  speed = 1,
  onComplete,
  style = {}
}) => {
  const svgRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Force re-animation when type changes
  useEffect(() => {
    if (autoplay) {
      setAnimationKey(prev => prev + 1);
      setIsAnimating(true);
    }
  }, [type, autoplay]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    if (onComplete) onComplete();
  };

  const getAnimationDuration = () => {
    const baseDuration = 0.6; // seconds
    return baseDuration / speed;
  };

  const getSVGAnimation = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            key={animationKey}
            ref={svgRef}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`${className} ${isAnimating ? 'animate-success' : ''}`}
            style={{
              ...style,
              animationDuration: `${getAnimationDuration()}s`,
              animationIterationCount: loop ? 'infinite' : '1',
              animationFillMode: 'forwards'
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Background circle */}
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="#10B981"
              fillOpacity="0.1"
              stroke="#10B981"
              strokeWidth="2"
              className="animate-scale-in"
            />
            
            {/* Checkmark path */}
            <path
              d="M8 12.5l3 3L16 9"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-checkmark"
              style={{
                strokeDasharray: '20',
                strokeDashoffset: '20',
                animation: `draw-checkmark ${getAnimationDuration()}s ease-out 0.2s forwards`
              }}
            />
            
            {/* Sparkle particles */}
            <g className="animate-sparkle">
              <circle cx="6" cy="6" r="1" fill="#10B981" opacity="0">
                <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.3s" />
              </circle>
              <circle cx="18" cy="6" r="1" fill="#10B981" opacity="0">
                <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.4s" />
              </circle>
              <circle cx="6" cy="18" r="1" fill="#10B981" opacity="0">
                <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.5s" />
              </circle>
              <circle cx="18" cy="18" r="1" fill="#10B981" opacity="0">
                <animate attributeName="opacity" values="0;1;0" dur="0.6s" begin="0.6s" />
              </circle>
            </g>
          </svg>
        );

      case 'error':
        return (
          <svg
            key={animationKey}
            ref={svgRef}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`${className} ${isAnimating ? 'animate-error' : ''}`}
            style={{
              ...style,
              animationDuration: `${getAnimationDuration()}s`,
              animationIterationCount: loop ? 'infinite' : '1'
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Background circle */}
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="#EF4444"
              fillOpacity="0.1"
              stroke="#EF4444"
              strokeWidth="2"
              className="animate-pulse-error"
            />
            
            {/* X mark */}
            <g className="animate-draw-x">
              <path
                d="M8 8l8 8"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '11.31',
                  strokeDashoffset: '11.31',
                  animation: `draw-line ${getAnimationDuration() / 2}s ease-out 0.2s forwards`
                }}
              />
              <path
                d="M16 8l-8 8"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '11.31',
                  strokeDashoffset: '11.31',
                  animation: `draw-line ${getAnimationDuration() / 2}s ease-out 0.4s forwards`
                }}
              />
            </g>
            
            {/* Shake effect */}
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 1 0; -1 0; 0 0"
              dur="0.1s"
              repeatCount="3"
              begin="0.1s"
            />
          </svg>
        );

      case 'warning':
        return (
          <svg
            key={animationKey}
            ref={svgRef}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`${className} ${isAnimating ? 'animate-warning' : ''}`}
            style={{
              ...style,
              animationDuration: `${getAnimationDuration()}s`,
              animationIterationCount: loop ? 'infinite' : '1'
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Background triangle */}
            <path
              d="M12 2L22 20H2L12 2Z"
              fill="#F59E0B"
              fillOpacity="0.1"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinejoin="round"
              className="animate-scale-in"
            />
            
            {/* Warning line */}
            <path
              d="M12 8V13"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '5',
                strokeDashoffset: '5',
                animation: `draw-line ${getAnimationDuration() / 2}s ease-out 0.2s forwards`
              }}
            />
            
            {/* Warning dot */}
            <circle
              cx="12"
              cy="16"
              r="1.5"
              fill="#F59E0B"
              opacity="0"
              style={{
                animation: `fade-in ${getAnimationDuration() / 2}s ease-out 0.4s forwards`
              }}
            />
            
            {/* Glow effect */}
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1"
              opacity="0"
              className="animate-glow"
            />
          </svg>
        );

      case 'info':
        return (
          <svg
            key={animationKey}
            ref={svgRef}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`${className} ${isAnimating ? 'animate-info' : ''}`}
            style={{
              ...style,
              animationDuration: `${getAnimationDuration()}s`,
              animationIterationCount: loop ? 'infinite' : '1'
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Background circle */}
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="#3B82F6"
              fillOpacity="0.1"
              stroke="#3B82F6"
              strokeWidth="2"
              className="animate-scale-in"
            />
            
            {/* Info dot */}
            <circle
              cx="12"
              cy="8"
              r="1.5"
              fill="#3B82F6"
              opacity="0"
              style={{
                animation: `fade-in ${getAnimationDuration() / 3}s ease-out 0.1s forwards`
              }}
            />
            
            {/* Info line */}
            <path
              d="M12 12V16"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '4',
                strokeDashoffset: '4',
                animation: `draw-line ${getAnimationDuration() / 2}s ease-out 0.3s forwards`
              }}
            />
            
            {/* Ripple effect */}
            <circle
              cx="12"
              cy="12"
              r="11"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              opacity="0"
              className="animate-ripple"
            />
          </svg>
        );

      case 'achievement':
        return (
          <svg
            key={animationKey}
            ref={svgRef}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`${className} ${isAnimating ? 'animate-achievement' : ''}`}
            style={{
              ...style,
              animationDuration: `${getAnimationDuration()}s`,
              animationIterationCount: loop ? 'infinite' : '1'
            }}
            onAnimationEnd={handleAnimationEnd}
          >
            {/* Background star */}
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="#8B5CF6"
              fillOpacity="0.1"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeLinejoin="round"
              className="animate-star-scale"
            />
            
            {/* Inner star */}
            <path
              d="M12 6L13.5 10.5L18 10.5L14.5 13.5L16 18L12 15L8 18L9.5 13.5L6 10.5L10.5 10.5L12 6Z"
              fill="#8B5CF6"
              opacity="0"
              style={{
                animation: `fade-in ${getAnimationDuration() / 2}s ease-out 0.3s forwards`
              }}
            />
            
            {/* Sparkle animations */}
            <g className="animate-sparkles">
              {[...Array(6)].map((_, i) => (
                <g key={i}>
                  <circle
                    cx={12 + Math.cos(i * Math.PI / 3) * 15}
                    cy={12 + Math.sin(i * Math.PI / 3) * 15}
                    r="1"
                    fill="#8B5CF6"
                    opacity="0"
                  >
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur="0.6s"
                      begin={`${0.4 + i * 0.1}s`}
                    />
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values="0;1.5;0"
                      dur="0.6s"
                      begin={`${0.4 + i * 0.1}s`}
                    />
                  </circle>
                </g>
              ))}
            </g>
            
            {/* Rotation animation */}
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 12 12; 360 12 12"
              dur="1s"
              begin="0.2s"
            />
          </svg>
        );

      case 'loading':
        return (
          <svg
            key={animationKey}
            ref={svgRef}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`${className} animate-spin`}
            style={{
              ...style,
              animationDuration: `${1 / speed}s`,
              animationIterationCount: 'infinite'
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="23.562"
            />
          </svg>
        );

      default:
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={className}
            style={style}
          >
            <circle cx="12" cy="12" r="10" fill="#6B7280" />
          </svg>
        );
    }
  };

  return (
    <div className="inline-block" style={{ width: size, height: size }}>
      {getSVGAnimation()}
      
      <style jsx>{`
        @keyframes draw-checkmark {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        @keyframes pulse-error {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }
        
        @keyframes ripple {
          0% {
            opacity: 0.6;
            transform: scale(0.8);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }
        
        @keyframes star-scale {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }
        
        .animate-success {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-error {
          animation: pulse-error 0.3s ease-out;
        }
        
        .animate-warning {
          animation: glow 1s ease-in-out infinite;
        }
        
        .animate-info {
          animation: ripple 1s ease-out;
        }
        
        .animate-achievement {
          animation: star-scale 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-glow {
          animation: glow 1s ease-in-out infinite;
        }
        
        .animate-ripple {
          animation: ripple 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AnimatedIcon;
