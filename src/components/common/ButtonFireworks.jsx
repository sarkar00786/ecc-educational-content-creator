import React, { useState, useEffect } from 'react';

const ButtonFireworks = ({ 
  isActive = false, 
  onComplete = null, 
  buttonRef = null,
  intensity = 'festive', 
  duration = 2000 
}) => {
  const [particles, setParticles] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  // Particle configurations
  const getConfig = () => {
    switch (intensity) {
      case 'subtle':
        return { count: 12, colors: ['#3b82f6', '#8b5cf6', '#10b981'] };
      case 'festive':
        return { count: 20, colors: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#e11d48', '#7c3aed', '#059669'] };
      default:
        return { count: 15, colors: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'] };
    }
  };

  // Party celebration particles with fireworks, poppers, and streamers
  const fireworksTypes = ['🎆', '🎇', '✨', '🌟', '💫', '⭐', '🔥', '💥'];
  const partyPoppers = ['🎉', '🎊', '🎈', '🎁', '🎀', '🎗️'];
  const streamers = ['🎀', '🎗️', '🎈', '🎊', '🎉'];
  const bookEmojis = ['📚', '📖', '🎓', '✏️', '📝', '📄'];
  const allParticles = [...fireworksTypes, ...partyPoppers, ...streamers, ...bookEmojis];

  // Get button position
  const getButtonPosition = () => {
    if (buttonRef && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    return { x: 0, y: 0 };
  };

  // Create particles
  const createParticles = () => {
    const config = getConfig();
    const newParticles = [];
    const position = getButtonPosition();
    
    for (let i = 0; i < config.count; i++) {
      // Random angle for fireworks burst with smooth distribution
      const angle = (i / config.count) * 360 + Math.random() * 20 - 10; // Even spread with subtle randomness
      const radian = (angle * Math.PI) / 180;
      
      // Random distance for fireworks spread with variation
      const distance = 60 + Math.random() * 90; // 60-150px spread with better distribution
      
      // Calculate end positions
      const endX = Math.cos(radian) * distance;
      const endY = Math.sin(radian) * distance;
      
      newParticles.push({
        id: i,
        emoji: allParticles[Math.floor(Math.random() * allParticles.length)],
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        startX: position.x,
        startY: position.y,
        endX: position.x + endX,
        endY: position.y + endY,
        angle,
        distance,
        duration: 2000, // Fixed duration for synchronized animation
        size: 16 + Math.random() * 8, // 16-24px size
        rotation: Math.random() * 360,
      });
    }
    
    return newParticles;
  };

  // Start animation
  useEffect(() => {
    if (isActive) {
      console.log('🎆 ButtonFireworks: Starting fireworks animation...');
      const newParticles = createParticles();
      setParticles(newParticles);
      setShowAnimation(true);
      
      // Complete animation after duration
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setParticles([]);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  // Update button position on window resize
  useEffect(() => {
    const handleResize = () => {
      setButtonPosition(getButtonPosition());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buttonRef]);

  if (!showAnimation || particles.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes buttonFireworks {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(0.1);
            opacity: 0.8;
          }
          15% {
            transform: translate3d(calc(var(--end-x) * 0.25), calc(var(--end-y) * 0.25), 0) rotate(72deg) scale(1.3);
            opacity: 1;
          }
          35% {
            transform: translate3d(calc(var(--end-x) * 0.55), calc(var(--end-y) * 0.55), 0) rotate(144deg) scale(1.1);
            opacity: 1;
          }
          55% {
            transform: translate3d(calc(var(--end-x) * 0.8), calc(var(--end-y) * 0.8), 0) rotate(216deg) scale(1);
            opacity: 0.9;
          }
          75% {
            transform: translate3d(calc(var(--end-x) * 1), calc(var(--end-y) * 1), 0) rotate(288deg) scale(0.85);
            opacity: 0.6;
          }
          90% {
            transform: translate3d(calc(var(--end-x) * 1.15), calc(var(--end-y) * 1.15), 0) rotate(360deg) scale(0.6);
            opacity: 0.3;
          }
          100% {
            transform: translate3d(calc(var(--end-x) * 1.3), calc(var(--end-y) * 1.3), 0) rotate(432deg) scale(0.2);
            opacity: 0;
          }
        }
        
        .fireworks-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
          transform: translateZ(0);
        }
        
        .fireworks-particle {
          position: absolute;
          animation: buttonFireworks var(--duration) cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          transform: translateZ(0);
          contain: layout style paint;
        }
      `}</style>
      
      <div className="fireworks-container">
        {particles.map((particle) => {
          const deltaX = particle.endX - particle.startX;
          const deltaY = particle.endY - particle.startY;
          
          return (
            <div
              key={particle.id}
              className="fireworks-particle"
              style={{
                left: `${particle.startX}px`,
                top: `${particle.startY}px`,
                fontSize: `${particle.size}px`,
                color: particle.color,
                textShadow: `0 0 8px ${particle.color}60`,
                filter: 'brightness(1.1)',
                '--duration': `${particle.duration}ms`,
                '--end-x': `${deltaX}px`,
                '--end-y': `${deltaY}px`,
              }}
            >
              {particle.emoji}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ButtonFireworks;
