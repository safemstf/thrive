// src/hooks/useMatrix.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type MatrixContextType = {
  isMatrixOn: boolean;
  toggleMatrix: () => void;
  setMatrixOn: (v: boolean) => void;
};

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMatrixOn, setIsMatrixOn] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem('matrixOn') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('matrixOn', isMatrixOn ? '1' : '0');
    } catch {}
    // toggle a global class so CSS can target it too
    const root = document.documentElement;
    if (isMatrixOn) root.classList.add('matrix-active');
    else root.classList.remove('matrix-active');
  }, [isMatrixOn]);

  const toggleMatrix = () => setIsMatrixOn(v => !v);

  return (
    <MatrixContext.Provider value={{ isMatrixOn, toggleMatrix, setMatrixOn: setIsMatrixOn }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = (): MatrixContextType => {
  const ctx = useContext(MatrixContext);
  if (!ctx) throw new Error('useMatrix must be used within MatrixProvider');
  return ctx;
};
