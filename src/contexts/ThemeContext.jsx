import React, { createContext, useContext, useState, useEffect } from 'react';
import { extendTheme } from '@chakra-ui/react';

const ThemeContext = createContext();

// Enhanced color palette with better accessibility
const colors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  }
};

// Enhanced theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors,
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
        lineHeight: '1.6',
        fontSize: '16px',
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: props.colorMode === 'dark' ? '#4A5568 #2D3748' : '#CBD5E0 #F7FAFC',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
        borderRadius: 'lg',
      },
      '::-webkit-scrollbar-thumb': {
        bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.400',
        borderRadius: 'lg',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.500',
      },
    })
  },
  components: {
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          boxShadow: props.colorMode === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        }
      })
    },
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        transition: 'all 0.2s',
      },
      variants: {
        gradient: (props) => ({
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
            transform: 'translateY(-2px)',
            boxShadow: props.colorMode === 'dark'
              ? '0 8px 25px rgba(102, 126, 234, 0.4)'
              : '0 8px 25px rgba(102, 126, 234, 0.3)',
          },
          _active: {
            transform: 'translateY(0px)',
          }
        }),
        glassmorphism: (props) => ({
          bg: props.colorMode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(255, 255, 255, 0.2)',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
          _hover: {
            bg: props.colorMode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-1px)',
          }
        })
      }
    },
    Input: {
      variants: {
        modern: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            border: '2px solid',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 3px ${props.colorMode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
            },
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
            }
          }
        })
      }
    },
    Textarea: {
      variants: {
        modern: (props) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          border: '2px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
          _focus: {
            borderColor: 'brand.500',
            boxShadow: `0 0 0 3px ${props.colorMode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
          },
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
          }
        })
      }
    }
  }
});

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ecc-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('ecc-accent-color') || 'brand';
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    localStorage.setItem('ecc-theme', isDark ? 'dark' : 'light');
    document.documentElement.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('ecc-accent-color', accentColor);
  }, [accentColor]);

  const toggleTheme = () => setIsDark(!isDark);

  const contextValue = {
    isDark,
    toggleTheme,
    accentColor,
    setAccentColor,
    reducedMotion,
    setReducedMotion,
    theme,
    colors: {
      primary: isDark ? colors.brand[400] : colors.brand[600],
      secondary: isDark ? colors.secondary[400] : colors.secondary[600],
      success: isDark ? colors.success[400] : colors.success[600],
      warning: isDark ? colors.warning[400] : colors.warning[600],
      error: isDark ? colors.error[400] : colors.error[600],
      text: {
        primary: isDark ? 'gray.100' : 'gray.900',
        secondary: isDark ? 'gray.300' : 'gray.600',
        muted: isDark ? 'gray.400' : 'gray.500',
      },
      bg: {
        primary: isDark ? 'gray.900' : 'gray.50',
        secondary: isDark ? 'gray.800' : 'white',
        card: isDark ? 'gray.800' : 'white',
        hover: isDark ? 'gray.700' : 'gray.100',
      },
      border: isDark ? 'gray.700' : 'gray.200',
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeProvider, theme };
