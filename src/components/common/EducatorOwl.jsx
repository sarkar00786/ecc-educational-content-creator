import React, { useState, useEffect } from 'react';

const EducatorOwl = ({ size = 'md', animated = true, className = '' }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const magicStickLength = {
    xs: '8',
    sm: '10',
    md: '16',
    lg: '20',
    xl: '24',
  };

  // Animation effects
  useEffect(() => {
    if (!animated) return;

    // Blinking animation
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 2000); // Random blink every 2-6 seconds

    // Wave animation
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1000);
    }, Math.random() * 8000 + 5000); // Random wave every 5-13 seconds

    return () => {
      clearInterval(blinkInterval);
      clearInterval(waveInterval);
    };
  }, [animated]);

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className} flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800 dark:to-orange-800 rounded-full overflow-hidden border-2 border-amber-200 dark:border-amber-600 shadow-lg`}
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fbbf24 100%)'
      }}
    >
      {/* Animated sparkles background */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" 
               style={{ animationDelay: '0s', animationDuration: '2s' }} />
          <div className="absolute top-2 right-1 w-0.5 h-0.5 bg-white rounded-full animate-pulse" 
               style={{ animationDelay: '0.5s', animationDuration: '1.5s' }} />
          <div className="absolute bottom-2 left-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse" 
               style={{ animationDelay: '1s', animationDuration: '2.5s' }} />
        </div>
      )}

      {/* SVG Owl */}
      <svg 
        viewBox="0 0 64 64" 
        className={`w-full h-full transform ${animated ? 'transition-transform duration-300 hover:scale-110' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Owl Body */}
        <ellipse cx="32" cy="40" rx="18" ry="20" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        
        {/* Owl Head */}
        <circle cx="32" cy="26" r="16" fill="#A0522D" stroke="#654321" strokeWidth="1"/>
        
        {/* Feather tufts on head */}
        <path d="M20 18 Q18 12 22 16" fill="#8B4513" stroke="#654321" strokeWidth="0.5"/>
        <path d="M44 18 Q46 12 42 16" fill="#8B4513" stroke="#654321" strokeWidth="0.5"/>
        
        {/* Eyes */}
        <circle cx="27" cy="24" r="5" fill="white" stroke="#333" strokeWidth="1"/>
        <circle cx="37" cy="24" r="5" fill="white" stroke="#333" strokeWidth="1"/>
        
        {/* Eye pupils with blinking animation */}
        <circle cx="27" cy="24" r={isBlinking ? "0.5" : "3"} fill="#1a1a1a" 
                className={animated ? "transition-all duration-150" : ""} />
        <circle cx="37" cy="24" r={isBlinking ? "0.5" : "3"} fill="#1a1a1a" 
                className={animated ? "transition-all duration-150" : ""} />
        
        {/* Eye shine */}
        <circle cx="28" cy="22" r="1" fill="white" opacity="0.8"/>
        <circle cx="38" cy="22" r="1" fill="white" opacity="0.8"/>
        
        {/* Beak */}
        <path d="M32 28 L30 32 L34 32 Z" fill="#FFA500" stroke="#FF8C00" strokeWidth="0.5"/>
        
        {/* Wings */}
        <ellipse cx="22" cy="35" rx="6" ry="12" fill="#8B4513" stroke="#654321" strokeWidth="1" 
                 transform="rotate(-15 22 35)"/>
        <ellipse cx="42" cy="35" rx="6" ry="12" fill="#8B4513" stroke="#654321" strokeWidth="1" 
                 transform="rotate(15 42 35)"/>
        
        {/* Wing details */}
        <path d="M22 30 Q18 35 22 40" fill="#654321" strokeWidth="0.5"/>
        <path d="M42 30 Q46 35 42 40" fill="#654321" strokeWidth="0.5"/>
        
        {/* Chest pattern */}
        <ellipse cx="32" cy="38" rx="8" ry="10" fill="#CD853F" opacity="0.7"/>
        <path d="M28 35 Q32 38 36 35" stroke="#654321" strokeWidth="0.5" fill="none"/>
        <path d="M28 40 Q32 43 36 40" stroke="#654321" strokeWidth="0.5" fill="none"/>
        
        {/* Feet */}
        <ellipse cx="28" cy="58" rx="3" ry="2" fill="#FFA500"/>
        <ellipse cx="36" cy="58" rx="3" ry="2" fill="#FFA500"/>
        
        {/* Graduation Cap */}
        <rect x="22" y="12" width="20" height="4" rx="2" fill="#1a1a1a"/>
        <rect x="20" y="16" width="24" height="2" rx="1" fill="#1a1a1a"/>
        
        {/* Cap tassel */}
        <line x1="38" y1="16" x2="42" y2="22" stroke="#FFD700" strokeWidth="2"/>
        <circle cx="42" cy="22" r="1.5" fill="#FFD700"/>
        
        {/* Magic Stick/Wand */}
        <g className={isWaving && animated ? "animate-pulse" : ""}>
          <line x1="12" y1="45" x2={12 + parseInt(magicStickLength[size])} y2="40" 
                stroke="#8B4513" strokeWidth="2" strokeLinecap="round"
                transform={isWaving && animated ? "rotate(15 16 42)" : ""}
                className={animated ? "transition-transform duration-500" : ""} />
          
          {/* Magic wand tip star */}
          <g transform={`translate(${12 + parseInt(magicStickLength[size])}, 40) ${isWaving && animated ? "rotate(15)" : ""}`}
             className={animated ? "transition-transform duration-500" : ""}>
            <path d="M0,-3 L1,0 L3,0 L1,1 L1,3 L0,1 L-1,3 L-1,1 L-3,0 L-1,0 Z" 
                  fill="#FFD700" stroke="#FFA500" strokeWidth="0.5"/>
            
            {/* Sparkles from wand */}
            {animated && (
              <>
                <circle cx="-2" cy="-2" r="0.5" fill="#FFD700" opacity="0.8" 
                        className="animate-ping" style={{ animationDuration: '1.5s' }} />
                <circle cx="2" cy="1" r="0.3" fill="#FFF" opacity="0.6" 
                        className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                <circle cx="-1" cy="2" r="0.4" fill="#FFD700" opacity="0.7" 
                        className="animate-ping" style={{ animationDelay: '0.7s', animationDuration: '2s' }} />
              </>
            )}
          </g>
        </g>
        
        {/* Glasses (optional scholarly touch) */}
        <circle cx="27" cy="24" r="6" fill="none" stroke="#333" strokeWidth="1" opacity="0.3"/>
        <circle cx="37" cy="24" r="6" fill="none" stroke="#333" strokeWidth="1" opacity="0.3"/>
        <line x1="33" y1="24" x2="31" y2="24" stroke="#333" strokeWidth="1" opacity="0.3"/>
        
        {/* Scholar scroll in other wing */}
        <g opacity="0.8">
          <rect x="45" y="38" width="8" height="12" rx="1" fill="#F5F5DC" stroke="#DDD" strokeWidth="0.5"/>
          <line x1="47" y1="41" x2="51" y2="41" stroke="#333" strokeWidth="0.3"/>
          <line x1="47" y1="43" x2="51" y2="43" stroke="#333" strokeWidth="0.3"/>
          <line x1="47" y1="45" x2="49" y2="45" stroke="#333" strokeWidth="0.3"/>
        </g>
      </svg>

      {/* Floating wisdom particles */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce" 
               style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute top-1/4 right-1/4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-bounce" 
               style={{ animationDelay: '2s', animationDuration: '2.5s' }} />
        </div>
      )}
    </div>
  );
};

export default EducatorOwl;
