import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const PartyCelebration = ({ 
  isActive = false, 
  onComplete = null, 
  intensity = 'moderate', // 'subtle', 'moderate', 'festive'
  duration = 4000 // milliseconds
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const startTimeRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  // Configuration based on intensity
  const getConfig = () => {
    switch (intensity) {
      case 'subtle':
        return {
          particleCount: 60,
          maxParticles: 30,
          emissionRate: 20,
          sizeRange: { min: 0.05, max: 0.15 },
          velocityRange: { min: 8, max: 12 },
          spreadAngle: 25
        };
      case 'festive':
        return {
          particleCount: 200,
          maxParticles: 100,
          emissionRate: 50,
          sizeRange: { min: 0.08, max: 0.25 },
          velocityRange: { min: 10, max: 16 },
          spreadAngle: 35
        };
      default: // moderate
        return {
          particleCount: 120,
          maxParticles: 60,
          emissionRate: 30,
          sizeRange: { min: 0.06, max: 0.2 },
          velocityRange: { min: 9, max: 14 },
          spreadAngle: 30
        };
    }
  };

  // Particle types with different shapes and colors
  const particleTypes = [
    {
      name: 'confetti',
      geometries: [
        new THREE.PlaneGeometry(0.1, 0.1),
        new THREE.PlaneGeometry(0.1, 0.05),
        new THREE.PlaneGeometry(0.05, 0.1)
      ],
      colors: [0x3b82f6, 0x8b5cf6, 0xf59e0b, 0xef4444, 0x10b981, 0xf97316],
      material: new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
    },
    {
      name: 'stars',
      geometries: [
        new THREE.ConeGeometry(0.05, 0.1, 5),
        new THREE.ConeGeometry(0.04, 0.08, 6)
      ],
      colors: [0xffd700, 0xffffff, 0x87ceeb, 0xdda0dd],
      material: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8 })
    },
    {
      name: 'bubbles',
      geometries: [
        new THREE.SphereGeometry(0.04, 8, 6),
        new THREE.SphereGeometry(0.06, 8, 6)
      ],
      colors: [0x87ceeb, 0xdda0dd, 0x98fb98, 0xffd700],
      material: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6 })
    },
    {
      name: 'books',
      geometries: [
        new THREE.BoxGeometry(0.06, 0.08, 0.01),
        new THREE.BoxGeometry(0.05, 0.07, 0.01)
      ],
      colors: [0x8b4513, 0x2e8b57, 0x4682b4, 0x9932cc],
      material: new THREE.MeshBasicMaterial()
    }
  ];

  // Create particle system
  const createParticle = (side, config) => {
    const typeIndex = Math.floor(Math.random() * particleTypes.length);
    const type = particleTypes[typeIndex];
    
    const geometry = type.geometries[Math.floor(Math.random() * type.geometries.length)];
    const material = type.material.clone();
    material.color.setHex(type.colors[Math.floor(Math.random() * type.colors.length)]);
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Position: Start from small areas at both sides
    const startX = side === 'left' ? -window.innerWidth * 0.45 : window.innerWidth * 0.45;
    const startY = window.innerHeight * 0.4; // Upper area
    const startZ = Math.random() * 5 - 2.5; // Some depth variation
    
    particle.position.set(
      startX + (Math.random() - 0.5) * 50, // Small spawn area
      startY + (Math.random() - 0.5) * 30,
      startZ
    );
    
    // Initial velocity and physics properties
    const baseVelocity = config.velocityRange.min + Math.random() * (config.velocityRange.max - config.velocityRange.min);
    const launchAngle = 45 + Math.random() * 35; // 45-80 degrees
    const launchAngleRad = (launchAngle * Math.PI) / 180;
    
    // Direction based on side
    const directionMultiplier = side === 'left' ? 1 : -1;
    
    particle.userData = {
      velocity: {
        x: Math.cos(launchAngleRad) * baseVelocity * directionMultiplier,
        y: Math.sin(launchAngleRad) * baseVelocity,
        z: (Math.random() - 0.5) * 2
      },
      angularVelocity: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1
      },
      gravity: -15,
      life: 1.0,
      maxLife: 1.0,
      initialSize: Math.random() * (config.sizeRange.max - config.sizeRange.min) + config.sizeRange.min,
      side: side,
      type: type.name
    };
    
    // Set initial scale
    particle.scale.setScalar(particle.userData.initialSize);
    
    return particle;
  };

  // Initialize Three.js scene
  const initScene = () => {
    if (!mountRef.current) {
      console.error('PartyCelebration: Mount ref not available');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('PartyCelebration: Initializing Three.js scene...');
      
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = null; // Transparent background
      
      // Camera setup
      const camera = new THREE.OrthographicCamera(
        -window.innerWidth / 2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        -window.innerHeight / 2,
        0.1,
        1000
      );
      camera.position.z = 10;
      
      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.sortObjects = false; // Optimize for particles
      renderer.setClearColor(0x000000, 0); // Transparent background
      
      // Clear any existing canvas
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
      
      mountRef.current.appendChild(renderer.domElement);
      
      sceneRef.current = scene;
      rendererRef.current = renderer;
      
      // Attach the camera to renderer explicitly
      rendererRef.current.camera = camera;
      
      console.log('PartyCelebration: Three.js scene initialized successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('PartyCelebration: Error initializing scene:', error);
      setIsLoading(false);
    }
  };

  // Animation loop
  const animate = () => {
    if (!sceneRef.current || !rendererRef.current) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - startTimeRef.current) / 1000; // Convert to seconds
    const elapsedTime = currentTime - startTimeRef.current;
    
    if (elapsedTime > duration) {
      // Animation complete
      cleanup();
      if (onComplete) onComplete();
      return;
    }
    
    const config = getConfig();
    
    // Emit new particles
    if (elapsedTime < duration * 0.6) { // Emit particles for first 60% of animation
      // const emissionInterval = 1000 / config.emissionRate; // Commented out unused variable
      const particlesToEmit = Math.floor(deltaTime * config.emissionRate);
      
      for (let i = 0; i < particlesToEmit && particlesRef.current.length < config.maxParticles; i++) {
        // Emit from both sides
        const leftParticle = createParticle('left', config);
        const rightParticle = createParticle('right', config);
        
        sceneRef.current.add(leftParticle);
        sceneRef.current.add(rightParticle);
        
        particlesRef.current.push(leftParticle, rightParticle);
      }
    }
    
    // Update existing particles
    particlesRef.current.forEach((particle, index) => {
      const userData = particle.userData;
      
      // Update position based on velocity
      particle.position.x += userData.velocity.x * deltaTime;
      particle.position.y += userData.velocity.y * deltaTime;
      particle.position.z += userData.velocity.z * deltaTime;
      
      // Apply gravity
      userData.velocity.y += userData.gravity * deltaTime;
      
      // Apply air resistance
      userData.velocity.x *= 0.99;
      userData.velocity.z *= 0.99;
      
      // Rotation
      particle.rotation.x += userData.angularVelocity.x;
      particle.rotation.y += userData.angularVelocity.y;
      particle.rotation.z += userData.angularVelocity.z;
      
      // Size animation (grow slightly then shrink)
      const lifeProgress = 1 - userData.life;
      let sizeMultiplier = 1;
      if (lifeProgress < 0.3) {
        sizeMultiplier = 1 + lifeProgress * 0.5; // Grow
      } else {
        sizeMultiplier = 1.15 - (lifeProgress - 0.3) * 0.15; // Shrink
      }
      particle.scale.setScalar(userData.initialSize * sizeMultiplier);
      
      // Update life and opacity
      userData.life -= deltaTime / 4; // 4 second lifetime
      
      // Fade out as particle reaches bottom or dies
      const fadeStart = window.innerHeight * 0.2;
      const fadeEnd = -window.innerHeight * 0.1;
      
      let opacity = userData.life;
      if (particle.position.y < fadeStart) {
        const fadeProgress = (fadeStart - particle.position.y) / (fadeStart - fadeEnd);
        opacity *= Math.max(0, 1 - fadeProgress);
      }
      
      particle.material.opacity = Math.max(0, opacity);
      
      // Remove dead particles
      if (userData.life <= 0 || particle.position.y < -window.innerHeight * 0.6) {
        sceneRef.current.remove(particle);
        particlesRef.current.splice(index, 1);
        
        // Dispose of geometry and material to free memory
        particle.geometry.dispose();
        particle.material.dispose();
      }
    });
    
    // Render
    rendererRef.current.render(sceneRef.current, rendererRef.current.camera);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup function
  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (sceneRef.current) {
      // Dispose of all particles
      particlesRef.current.forEach(particle => {
        sceneRef.current.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
      });
      particlesRef.current = [];
      
      // Dispose of geometries and materials
      particleTypes.forEach(type => {
        type.geometries.forEach(geo => geo.dispose());
        type.material.dispose();
      });
    }
    
    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    sceneRef.current = null;
  };

  // Start animation
  useEffect(() => {
    if (isActive) {
      console.log('🎬 PartyCelebration: Starting animation...');
      initScene();
      startTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      console.log('🛑 PartyCelebration: Animation not active');
    }
    
    return cleanup;
  }, [isActive]); // Remove animate and cleanup from dependencies to prevent infinite loops

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && sceneRef.current) {
        const camera = rendererRef.current.camera;
        camera.left = -window.innerWidth / 2;
        camera.right = window.innerWidth / 2;
        camera.top = window.innerHeight / 2;
        camera.bottom = -window.innerHeight / 2;
        camera.updateProjectionMatrix();
        
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <div 
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        background: 'transparent',
        overflow: 'hidden'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="text-white text-sm">Preparing celebration...</div>
        </div>
      )}
    </div>
  );
};

export default PartyCelebration;
