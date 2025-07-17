import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChange, validateAuthState } from '../services/firebase';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        // Validate current auth state
        const currentUser = await validateAuthState();
        setUser(currentUser);

        // Set up auth state listener
        unsubscribe = onAuthStateChange((user) => {
          setUser(user);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async (user) => {
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
