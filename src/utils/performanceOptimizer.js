// Performance Optimization Utilities for ECC App
import React from 'react';
import { performanceMonitor } from './performanceMonitor';

// Debounce function to limit function calls
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization for expensive computations
export const memoize = (fn) => {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Virtual scrolling implementation for large lists
export class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.scrollTop = 0;
    this.containerHeight = container.offsetHeight;
    this.totalItems = 0;
    this.visibleItems = [];
    this.buffer = 5; // Extra items to render for smooth scrolling
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.container.addEventListener('scroll', 
      throttle(() => this.handleScroll(), 16) // ~60fps
    );
    
    window.addEventListener('resize', 
      debounce(() => this.handleResize(), 250)
    );
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.updateVisibleItems();
  }
  
  handleResize() {
    this.containerHeight = this.container.offsetHeight;
    this.updateVisibleItems();
  }
  
  updateData(items) {
    this.totalItems = items.length;
    this.updateVisibleItems();
  }
  
  updateVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + this.buffer,
      this.totalItems
    );
    
    this.visibleItems = {
      startIndex: Math.max(0, startIndex - this.buffer),
      endIndex: endIndex,
      offsetY: startIndex * this.itemHeight
    };
    
    this.render();
  }
  
  render() {
    // This would be called by React component using this scroller
    if (this.onUpdate) {
      this.onUpdate(this.visibleItems);
    }
  }
}

// Intersection Observer for lazy loading
export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.loadingElements = new Set();
  }
  
  observe(element, loadCallback) {
    element.loadCallback = loadCallback;
    this.observer.observe(element);
  }
  
  unobserve(element) {
    this.observer.unobserve(element);
    this.loadingElements.delete(element);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loadingElements.has(entry.target)) {
        this.loadingElements.add(entry.target);
        
        if (entry.target.loadCallback) {
          entry.target.loadCallback();
        }
        
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  disconnect() {
    this.observer.disconnect();
    this.loadingElements.clear();
  }
}

// Image optimization utilities
export const imageOptimizer = {
  // Compress image before upload
  compressImage: (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },
  
  // Generate responsive image sizes
  generateResponsiveImages: (file) => {
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 }
    ];
    
    return Promise.all(
      sizes.map(size => 
        imageOptimizer.compressImage(file, 0.8, size.width, size.height)
          .then(blob => ({ ...size, blob }))
      )
    );
  }
};

// Bundle splitting utilities
export const bundleOptimizer = {
  // Dynamic import with loading state
  loadComponent: async (importFunc, setLoading) => {
    setLoading(true);
    try {
      const module = await importFunc();
      return module.default || module;
    } finally {
      setLoading(false);
    }
  },
  
  // Preload components
  preloadComponent: (importFunc) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = importFunc.toString().match(/import\(['"](.+?)['"]\)/)?.[1];
    document.head.appendChild(link);
  },
  
  // Service worker registration
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
};

// Memory optimization utilities
export const memoryOptimizer = {
  // Cleanup unused resources
  cleanup: () => {
    // Clear unused images
    const images = document.querySelectorAll('img[data-cleanup="true"]');
    images.forEach(img => {
      if (!img.getBoundingClientRect().width) {
        img.src = '';
      }
    });
    
    // Clear unused event listeners
    const elements = document.querySelectorAll('[data-cleanup-listeners="true"]');
    elements.forEach(el => {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });
  },
  
  // Monitor memory usage
  monitorMemory: () => {
    if (performance.memory) {
      const memInfo = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      
      console.log('Memory usage:', memInfo);
      
      // Warn if memory usage is high
      if (memInfo.used / memInfo.limit > 0.8) {
        console.warn('High memory usage detected:', memInfo);
        memoryOptimizer.cleanup();
      }
      
      return memInfo;
    }
  },
  
  // Weak references for temporary data
  createWeakCache: () => {
    const cache = new WeakMap();
    return {
      set: (key, value) => cache.set(key, value),
      get: (key) => cache.get(key),
      has: (key) => cache.has(key),
      delete: (key) => cache.delete(key)
    };
  }
};

// Network optimization utilities
export const networkOptimizer = {
  // Request batching
  batchRequests: (requests, batchSize = 5) => {
    const batches = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    return batches.reduce(async (prev, batch) => {
      await prev;
      return Promise.all(batch);
    }, Promise.resolve());
  },
  
  // Request caching with expiration
  createRequestCache: (ttl = 300000) => { // 5 minutes default
    const cache = new Map();
    
    return {
      async get(key, fetchFn) {
        const cached = cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
          return cached.data;
        }
        
        const data = await fetchFn();
        cache.set(key, { data, timestamp: Date.now() });
        return data;
      },
      
      clear() {
        cache.clear();
      },
      
      delete(key) {
        cache.delete(key);
      }
    };
  },
  
  // Connection quality detection
  detectConnectionQuality: () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return null;
  },
  
  // Adaptive loading based on connection
  adaptiveLoad: (highQualityResource, lowQualityResource) => {
    const connection = networkOptimizer.detectConnectionQuality();
    
    if (connection && (connection.saveData || connection.effectiveType === 'slow-2g')) {
      return lowQualityResource;
    }
    
    return highQualityResource;
  }
};

// React-specific optimizations
export const reactOptimizer = {
  // HOC for performance monitoring
  withPerformanceMonitoring: (WrappedComponent, componentName) => {
    return function PerformanceMonitoredComponent(props) {
      React.useEffect(() => {
        performanceMonitor.startTiming(`${componentName}-render`);
        return () => {
          performanceMonitor.endTiming(`${componentName}-render`);
        };
      });
      
      return React.createElement(WrappedComponent, props);
    };
  },
  
  // Optimized memo with custom comparison
  createOptimizedMemo: (Component, compareProps) => {
    return React.memo(Component, compareProps || ((prevProps, nextProps) => {
      // Deep comparison for nested objects
      return JSON.stringify(prevProps) === JSON.stringify(nextProps);
    }));
  },
  
  // Optimized callback with dependencies
  useOptimizedCallback: (callback, deps) => {
    return React.useCallback(callback, deps);
  },
  
  // Optimized state updates
  useOptimizedState: (initialState) => {
    const [state, setState] = React.useState(initialState);
    
    const optimizedSetState = React.useCallback((newState) => {
      setState(prevState => {
        // Only update if state actually changed
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          return newState;
        }
        return prevState;
      });
    }, []);
    
    return [state, optimizedSetState];
  }
};

// Performance monitoring integration
export const performanceIntegration = {
  // Initialize performance monitoring
  init: () => {
    // Web Vitals tracking
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            performanceMonitor.startTiming('LCP', { value: entry.startTime });
          }
          if (entry.entryType === 'first-input') {
            performanceMonitor.startTiming('FID', { value: entry.processingStart - entry.startTime });
          }
          if (entry.entryType === 'layout-shift') {
            performanceMonitor.startTiming('CLS', { value: entry.value });
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
    
    // Memory monitoring
    setInterval(() => {
      memoryOptimizer.monitorMemory();
    }, 30000); // Check every 30 seconds
    
    // Network monitoring
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        const quality = networkOptimizer.detectConnectionQuality();
        console.log('Network quality changed:', quality);
      });
    }
    
    // Quality metrics tracking
    performanceIntegration.startQualityMetricsTracking();
  },
  
  // Start tracking quality metrics for content generation
  startQualityMetricsTracking: () => {
    console.log('Starting quality metrics tracking...');
    
    // Track content generation time
    window.addEventListener('contentGenerationStart', () => {
      performanceMonitor.startTiming('content-generation');
    });
    
    window.addEventListener('contentGenerationComplete', (event) => {
      const result = performanceMonitor.endTiming('content-generation', true, {
        contentLength: event.detail?.contentLength || 0,
        generationType: event.detail?.generationType || 'unknown'
      });
      
      console.log('Content generation performance:', result);
    });
    
    // Track user interaction patterns
    let interactionCount = 0;
    const trackUserInteraction = () => {
      interactionCount++;
      if (interactionCount % 10 === 0) {
        console.log(`User interactions: ${interactionCount}`);
      }
    };
    
    ['click', 'keydown', 'scroll'].forEach(event => {
      document.addEventListener(event, trackUserInteraction, { passive: true });
    });
  },
  
  // Report performance metrics
  reportMetrics: () => {
    const metrics = performanceMonitor.getAllMetrics();
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      memory: memoryOptimizer.monitorMemory(),
      connection: networkOptimizer.detectConnectionQuality(),
      metrics: metrics
    };
    
    console.log('Performance Report:', report);
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_report', {
        custom_parameter: JSON.stringify(report)
      });
    }
    
    return report;
  }
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Start performance monitoring
  performanceIntegration.init();
  
  // Register service worker
  bundleOptimizer.registerServiceWorker();
  
  // Initialize memory monitoring
  memoryOptimizer.monitorMemory();
  
  // Set up cleanup intervals
  setInterval(() => {
    memoryOptimizer.cleanup();
  }, 60000); // Cleanup every minute
  
  console.log('Performance optimizations initialized');
};

export default {
  debounce,
  throttle,
  memoize,
  VirtualScroller,
  LazyLoader,
  imageOptimizer,
  bundleOptimizer,
  memoryOptimizer,
  networkOptimizer,
  reactOptimizer,
  performanceIntegration,
  initializePerformanceOptimizations
};
