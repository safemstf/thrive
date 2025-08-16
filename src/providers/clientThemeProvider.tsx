// src/components/providers/ClientThemeProvider.tsx
'use client';

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { GlobalStyles, generateTheme } from '@/styles/theme';
import { useDarkMode } from '@/providers/darkModeProvider';

interface ClientThemeProviderProps {
  children: React.ReactNode;
}

export function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  const { isDarkMode, isLoaded } = useDarkMode();
  
  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return <div style={{ opacity: 0 }}>{children}</div>;
  }
  
  const theme = generateTheme(isDarkMode ? 'dark' : 'light');
  
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles $isDark={isDarkMode} />
      {children}
    </StyledThemeProvider>
  );
}