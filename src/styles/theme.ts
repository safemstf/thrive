// src/styles/theme.ts - Unified design system
export const theme = {
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f4f8',
      100: '#d9e2ec',
      500: '#2c2c2c',
      600: '#1a1a1a',
      900: '#102a43'
    },
    // Accent colors
    accent: {
      blue: '#2196f3',
      lightBlue: '#64b5f6',
      muted: '#486581'
    },
    // Semantic colors
    background: {
      primary: '#fafafa',
      secondary: '#ffffff',
      tertiary: '#f8f9fa'
    },
    text: {
      primary: '#2c2c2c',
      secondary: '#666',
      muted: '#999',
      light: '#627d98'
    },
    border: {
      light: '#f0f0f0',
      medium: '#e0e0e0',
      dark: '#d9e2ec'
    }
  },
  
  typography: {
    fonts: {
      display: "'Cormorant Garamond', serif", // For headings and brand
      body: "'Work Sans', sans-serif",        // For body text and UI
      accent: "'Great Vibes', cursive"        // For special elements
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
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 8px 24px rgba(0, 0, 0, 0.12)',
    lg: '0 16px 40px rgba(0, 0, 0, 0.15)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  },
  
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.3)',
    blur: '15px'
  }
};