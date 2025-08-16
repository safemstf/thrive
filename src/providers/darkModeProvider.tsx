// src\providers\darkModeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoaded: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference only on client side
  useEffect(() => {
    try {
      // Prevent hydration mismatch by only running on client
      const saved = localStorage.getItem('dark-mode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      console.log('🌙 Loading saved theme:', saved);
      console.log('🌙 System prefers dark:', prefersDark);
      
      // Use saved preference, or fall back to system preference
      const shouldBeDark = saved ? saved === 'true' : prefersDark;
      
      setIsDarkMode(shouldBeDark);
      
      // Apply class immediately
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      setIsLoaded(true);
      console.log('🌙 Applied initial theme, dark class:', document.documentElement.classList.contains('dark'));
    } catch (error) {
      console.warn('Error initializing dark mode:', error);
      setIsLoaded(true); // Still mark as loaded to prevent infinite loading
    }
  }, []);

  const toggleDarkMode = () => {
    console.log('🌙 Toggle button clicked! Current mode:', isDarkMode);
    
    setIsDarkMode(prev => {
      const next = !prev;
      console.log('🌙 Switching to:', next ? 'dark' : 'light');
      
      try {
        // Save preference
        localStorage.setItem('dark-mode', String(next));
        
        // Apply class immediately
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        console.log('🌙 HTML classes after toggle:', document.documentElement.className);
        console.log('🌙 Contains dark class:', document.documentElement.classList.contains('dark'));
      } catch (error) {
        console.warn('Error toggling dark mode:', error);
      }
      
      return next;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isLoaded }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
}