'use client';
// src/styles/theme.ts - Keep Your Blue Scheme
import { createGlobalStyle } from 'styled-components';

// ==============================================
// 1. DESIGN TOKENS - Keep Exactly What You Have
// ==============================================

export const designTokens = {
  colors: {
    primary: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b'
    },
    accent: {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      cyan: '#06b6d4',
      indigo: '#6366f1',
      pink: '#ec4899',
      red: '#ef4444'
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  typography: {
    fonts: {
      display: 'Cormorant Garamond, serif',
      body: 'Work Sans, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease'
  }
};

// ==============================================
// 2. SINGLE THEME - Keep Current Working Theme
// ==============================================

export function generateTheme() {
  return {
    colors: {
      primary: designTokens.colors.primary,
      accent: {
        blue: designTokens.colors.accent.blue,
        lightBlue: designTokens.colors.accent.cyan,
        muted: designTokens.colors.primary[400]
      },
      background: {
        primary: designTokens.colors.primary[50],
        secondary: '#ffffff',
        tertiary: designTokens.colors.primary[100]
      },
      text: {
        primary: designTokens.colors.primary[900],
        secondary: designTokens.colors.primary[700],
        muted: designTokens.colors.primary[400],
        light: designTokens.colors.primary[300]
      },
      border: {
        light: designTokens.colors.primary[200],
        medium: designTokens.colors.primary[300],
        dark: designTokens.colors.primary[400]
      }
    },
    typography: {
      fonts: {
        display: designTokens.typography.fonts.display,
        body: designTokens.typography.fonts.body,
        accent: designTokens.typography.fonts.display
      },
      sizes: designTokens.typography.sizes,
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: designTokens.spacing.xs,
      sm: designTokens.spacing.sm,
      md: designTokens.spacing.md,
      lg: designTokens.spacing.lg,
      xl: designTokens.spacing.xl,
      '2xl': designTokens.spacing['2xl'],
      '3xl': designTokens.spacing['3xl']
    },
    borderRadius: {
      sm: designTokens.borderRadius.sm,
      md: designTokens.borderRadius.md,
      lg: designTokens.borderRadius.lg,
      xl: designTokens.borderRadius.xl,
      full: designTokens.borderRadius.full
    },
    shadows: {
      sm: designTokens.shadows.sm,
      md: designTokens.shadows.md,
      lg: designTokens.shadows.lg,
      glass: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    transitions: {
      fast: designTokens.transitions.fast,
      normal: designTokens.transitions.normal,
      slow: designTokens.transitions.slow
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(255, 255, 255, 0.3)',
      blur: '20px'
    }
  };
}

// ==============================================
// 3. CSS VARIABLES - Keep Your Current Names
// ==============================================

export function generateCSSVariables() {
  const theme = generateTheme();
  return `
    :root {
      /* Background colors */
      --color-background-primary: ${theme.colors.background.primary};
      --color-background-secondary: ${theme.colors.background.secondary};
      --color-background-tertiary: ${theme.colors.background.tertiary};
      
      /* Text colors */
      --color-text-primary: ${theme.colors.text.primary};
      --color-text-secondary: ${theme.colors.text.secondary};
      --color-text-muted: ${theme.colors.text.muted};
      
      /* Border colors */
      --color-border-light: ${theme.colors.border.light};
      --color-border-medium: ${theme.colors.border.medium};
      --color-border-dark: ${theme.colors.border.dark};
      
      /* Primary colors */
      --color-primary-500: ${theme.colors.primary[500]};
      --color-primary-600: ${theme.colors.primary[600]};
      
      /* Typography */
      --font-display: ${theme.typography.fonts.display};
      --font-body: ${theme.typography.fonts.body};
      --font-mono: ${theme.typography.fonts.accent};
      
      /* Spacing */
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      --spacing-2xl: ${theme.spacing['2xl']};
      --spacing-3xl: ${theme.spacing['3xl']};
      
      /* Border Radius */
      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      
      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      
      /* Transitions */
      --transition-fast: ${theme.transitions.fast};
      --transition-normal: ${theme.transitions.normal};
      --transition-slow: ${theme.transitions.slow};
      
      /* Glass effects */
      --glass-background: ${theme.glass.background};
      --glass-border: ${theme.glass.border};
      --glass-blur: ${theme.glass.blur};
    }
  `;
}

// ==============================================
// 4. GLOBAL STYLES - Simplified
// ==============================================

export const GlobalStyles = createGlobalStyle`
  ${generateCSSVariables()}
  
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    scroll-behavior: smooth;
    font-size: 16px;
    height: 100%;
    overflow-x: hidden;
  }
  
  body {
    font-family: var(--font-body);
    background: var(--color-background-primary);
    color: var(--color-text-primary);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
`;

// ==============================================
// 5. EXPORTS - Keep Compatibility
// ==============================================

export { designTokens as tokens };
export const lightTheme = generateTheme();
export const darkTheme = generateTheme(); // Same as light to maintain compatibility