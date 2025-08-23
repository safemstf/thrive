// src/hooks/useMatrix.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type MatrixContextType = {
  isMatrixOn: boolean;
  toggleMatrix: () => void;
  setMatrixOn: (v: boolean) => void;
  isHydrated: boolean; // New: to know when we can trust the state
};

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with false to match server-side rendering
  const [isMatrixOn, setIsMatrixOn] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after component mounts (client-side only)
  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem('matrixOn');
      if (storedValue !== null) {
        setIsMatrixOn(storedValue === '1');
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when state changes (but only after hydration)
  useEffect(() => {
    if (!isHydrated) return; // Don't save during initial hydration
    
    try {
      window.localStorage.setItem('matrixOn', isMatrixOn ? '1' : '0');
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }

    // Toggle a global class so CSS can target it too
    const root = document.documentElement;
    if (isMatrixOn) {
      root.classList.add('matrix-active');
    } else {
      root.classList.remove('matrix-active');
    }
  }, [isMatrixOn, isHydrated]);

  const toggleMatrix = () => setIsMatrixOn(v => !v);

  return (
    <MatrixContext.Provider value={{ 
      isMatrixOn, 
      toggleMatrix, 
      setMatrixOn: setIsMatrixOn,
      isHydrated 
    }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = (): MatrixContextType => {
  const ctx = useContext(MatrixContext);
  if (!ctx) throw new Error('useMatrix must be used within MatrixProvider');
  return ctx;
};