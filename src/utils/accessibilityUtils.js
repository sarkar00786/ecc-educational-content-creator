/**
 * Accessibility Utilities for ECC App
 * Provides comprehensive accessibility enhancements and WCAG compliance
 */

// Focus management utilities
export const focusManager = {
  // Set focus trap within a container
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
      
      if (e.key === 'Escape') {
        container.dispatchEvent(new CustomEvent('focusTrapEscape'));
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
  
  // Restore focus to previously focused element
  restoreFocus: (previousElement) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },
  
  // Get all focusable elements within a container
  getFocusableElements: (container) => {
    return container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  },
  
  // Set focus to first focusable element
  focusFirst: (container) => {
    const focusable = focusManager.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  },
  
  // Set focus to last focusable element
  focusLast: (container) => {
    const focusable = focusManager.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  }
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },
  
  // Create hidden label for screen readers
  createHiddenLabel: (text, id) => {
    const label = document.createElement('span');
    label.id = id;
    label.className = 'sr-only';
    label.textContent = text;
    return label;
  },
  
  // Update aria-label dynamically
  updateAriaLabel: (element, newLabel) => {
    element.setAttribute('aria-label', newLabel);
  },
  
  // Update aria-describedby dynamically
  updateAriaDescribedBy: (element, descriptionId) => {
    element.setAttribute('aria-describedby', descriptionId);
  }
};

// Color contrast utilities
export const colorContrast = {
  // Calculate contrast ratio between two colors
  calculateContrastRatio: (color1, color2) => {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(val => {
        const normalized = parseInt(val) / 255;
        return normalized <= 0.03928 
          ? normalized / 12.92 
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },
  
  // Check if color combination meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA') => {
    const ratio = colorContrast.calculateContrastRatio(color1, color2);
    return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
  },
  
  // Suggest better color combination
  suggestBetterColors: (foreground, background) => {
    const ratio = colorContrast.calculateContrastRatio(foreground, background);
    
    if (ratio < 4.5) {
      return {
        current: ratio,
        recommendation: 'Consider using darker foreground or lighter background colors',
        minimumRatio: 4.5
      };
    }
    
    return { current: ratio, status: 'Good contrast' };
  }
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Common keyboard event handlers
  handleArrowKeys: (e, items, currentIndex, onSelectionChange) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    onSelectionChange(newIndex);
  },
  
  // Handle Enter and Space key for activation
  handleActivationKeys: (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  },
  
  // Handle Escape key for closing
  handleEscapeKey: (e, callback) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  }
};

// ARIA utilities
export const ariaUtils = {
  // Generate unique IDs for ARIA attributes
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Set ARIA attributes for form validation
  setValidationAttributes: (input, isValid, errorMessage) => {
    input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
    
    if (!isValid && errorMessage) {
      const errorId = ariaUtils.generateId('error');
      const errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'sr-only';
      errorElement.textContent = errorMessage;
      
      input.parentNode.appendChild(errorElement);
      input.setAttribute('aria-describedby', errorId);
    } else {
      const existingError = input.getAttribute('aria-describedby');
      if (existingError) {
        const errorElement = document.getElementById(existingError);
        if (errorElement) {
          errorElement.remove();
        }
        input.removeAttribute('aria-describedby');
      }
    }
  },
  
  // Set ARIA attributes for loading states
  setLoadingAttributes: (element, isLoading, loadingText = 'Loading...') => {
    if (isLoading) {
      element.setAttribute('aria-busy', 'true');
      element.setAttribute('aria-label', loadingText);
    } else {
      element.removeAttribute('aria-busy');
      element.removeAttribute('aria-label');
    }
  },
  
  // Set ARIA attributes for expandable content
  setExpandableAttributes: (trigger, content, isExpanded) => {
    const contentId = content.id || ariaUtils.generateId('content');
    content.id = contentId;
    
    trigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    trigger.setAttribute('aria-controls', contentId);
    
    content.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
  }
};

// Touch and gesture utilities for mobile accessibility
export const touchAccessibility = {
  // Ensure touch targets are large enough (minimum 44px)
  validateTouchTargets: (container) => {
    const interactiveElements = container.querySelectorAll(
      'button, [role="button"], a, input, select, textarea'
    );
    
    const issues = [];
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        issues.push({
          element,
          size: { width: rect.width, height: rect.height },
          recommendation: 'Increase touch target size to at least 44x44px'
        });
      }
    });
    
    return issues;
  },
  
  // Add touch feedback for better UX
  addTouchFeedback: (element) => {
    const addFeedback = () => {
      element.classList.add('touch-feedback');
      setTimeout(() => {
        element.classList.remove('touch-feedback');
      }, 150);
    };
    
    element.addEventListener('touchstart', addFeedback);
    element.addEventListener('click', addFeedback);
    
    return () => {
      element.removeEventListener('touchstart', addFeedback);
      element.removeEventListener('click', addFeedback);
    };
  }
};

// Text and content accessibility utilities
export const textAccessibility = {
  // Check text readability
  checkReadability: (text) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = text.split(/[aeiouAEIOU]/).length - 1;
    
    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    let level = 'Graduate';
    if (fleschScore >= 90) level = 'Very Easy';
    else if (fleschScore >= 80) level = 'Easy';
    else if (fleschScore >= 70) level = 'Fairly Easy';
    else if (fleschScore >= 60) level = 'Standard';
    else if (fleschScore >= 50) level = 'Fairly Difficult';
    else if (fleschScore >= 30) level = 'Difficult';
    
    return {
      score: fleschScore,
      level: level,
      words: words,
      sentences: sentences,
      syllables: syllables
    };
  },
  
  // Suggest simpler alternatives for complex words
  suggestSimpleWords: (text) => {
    const complexWords = {
      'utilize': 'use',
      'demonstrate': 'show',
      'facilitate': 'help',
      'implement': 'do',
      'initiate': 'start',
      'terminate': 'end',
      'subsequent': 'next',
      'preliminary': 'first',
      'additional': 'more',
      'approximately': 'about'
    };
    
    const suggestions = [];
    
    Object.keys(complexWords).forEach(complex => {
      if (text.toLowerCase().includes(complex)) {
        suggestions.push({
          complex: complex,
          simple: complexWords[complex],
          context: text.substring(text.toLowerCase().indexOf(complex) - 20, text.toLowerCase().indexOf(complex) + complex.length + 20)
        });
      }
    });
    
    return suggestions;
  }
};

// Accessibility testing utilities
export const accessibilityTesting = {
  // Run basic accessibility audit
  runBasicAudit: (container = document.body) => {
    const issues = [];
    
    // Check for images without alt text
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        issues.push({
          type: 'missing-alt',
          element: img,
          severity: 'high',
          message: 'Image missing alt text'
        });
      }
    });
    
    // Check for form inputs without labels
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') || 
                     input.getAttribute('aria-labelledby') || 
                     container.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        issues.push({
          type: 'missing-label',
          element: input,
          severity: 'high',
          message: 'Form control missing label'
        });
      }
    });
    
    // Check for heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          element: heading,
          severity: 'medium',
          message: `Heading level ${level} follows level ${previousLevel}, skipping levels`
        });
      }
      previousLevel = level;
    });
    
    // Check for proper button markup
    const buttons = container.querySelectorAll('[role="button"], button');
    buttons.forEach(button => {
      if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
        issues.push({
          type: 'empty-button',
          element: button,
          severity: 'high',
          message: 'Button has no accessible text'
        });
      }
    });
    
    // Check touch target sizes
    const touchIssues = touchAccessibility.validateTouchTargets(container);
    touchIssues.forEach(issue => {
      issues.push({
        type: 'touch-target',
        element: issue.element,
        severity: 'medium',
        message: issue.recommendation
      });
    });
    
    return {
      totalIssues: issues.length,
      highSeverity: issues.filter(i => i.severity === 'high').length,
      mediumSeverity: issues.filter(i => i.severity === 'medium').length,
      lowSeverity: issues.filter(i => i.severity === 'low').length,
      issues: issues
    };
  },
  
  // Generate accessibility report
  generateReport: (auditResults) => {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      summary: {
        total: auditResults.totalIssues,
        high: auditResults.highSeverity,
        medium: auditResults.mediumSeverity,
        low: auditResults.lowSeverity
      },
      details: auditResults.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        element: issue.element.tagName.toLowerCase(),
        xpath: getXPath(issue.element)
      }))
    };
    
    return report;
  }
};

// Helper function to get XPath of an element
function getXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  const parts = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = current.previousSibling;
    
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    
    const tagName = current.tagName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : '';
    parts.unshift(`${tagName}${pathIndex}`);
    
    current = current.parentNode;
  }
  
  return '/' + parts.join('/');
}

// React hook for accessibility
export const useAccessibility = () => {
  const [focusTrap, setFocusTrap] = React.useState(null);
  const [announcements, setAnnouncements] = React.useState([]);
  
  const trapFocus = React.useCallback((container) => {
    if (focusTrap) {
      focusTrap();
    }
    
    const cleanup = focusManager.trapFocus(container);
    setFocusTrap(() => cleanup);
    
    return cleanup;
  }, [focusTrap]);
  
  const releaseFocus = React.useCallback(() => {
    if (focusTrap) {
      focusTrap();
      setFocusTrap(null);
    }
  }, [focusTrap]);
  
  const announce = React.useCallback((message, priority = 'polite') => {
    screenReader.announce(message, priority);
    setAnnouncements(prev => [...prev, { message, priority, timestamp: Date.now() }]);
  }, []);
  
  const runAudit = React.useCallback((container) => {
    return accessibilityTesting.runBasicAudit(container);
  }, []);
  
  return {
    trapFocus,
    releaseFocus,
    announce,
    runAudit,
    announcements,
    focusManager,
    screenReader,
    ariaUtils,
    keyboardNavigation
  };
};

// Export all utilities
export default {
  focusManager,
  screenReader,
  colorContrast,
  keyboardNavigation,
  ariaUtils,
  touchAccessibility,
  textAccessibility,
  accessibilityTesting,
  useAccessibility
};
