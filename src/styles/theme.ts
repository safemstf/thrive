// src/styles/theme.ts - Modern Glassmorphism Design System (Matching Taskbar)
export const theme = {
  colors: {
    // Primary brand colors - matching taskbar's minimal aesthetic
    primary: {
      50: '#fafafa',
      100: '#f8f8f8',
      200: '#f0f0f0',
      300: '#e0e0e0',
      400: '#999999',
      500: '#666666',
      600: '#2c2c2c',
      700: '#1a1a1a',
      800: '#0f0f0f',
      900: '#000000'
    },
    
    // Accent colors - GREYSCALE ONLY (matching taskbar aesthetic)
    accent: {
      blue: '#666666',       // Medium grey
      purple: '#555555',     // Darker grey  
      emerald: '#777777',    // Light grey
      amber: '#888888',      // Lighter grey
      rose: '#999999',       // Very light grey
      cyan: '#444444',       // Dark grey
      indigo: '#333333',     // Very dark grey
      pink: '#aaaaaa',       // Pale grey
      red: '#2c2c2c'         // Primary dark (matching logout button)
    },
    
    // State colors - GREYSCALE ONLY
    states: {
      hover: '#f8f8f8',      // Hover backgrounds
      active: '#2c2c2c',     // Active backgrounds (matching taskbar)
      focus: '#666666',      // Focus outlines (greyscale)
      disabled: '#f5f5f5',   // Disabled backgrounds
      error: '#2c2c2c',      // Error states (dark grey)
      success: '#666666',    // Success states (medium grey)
      warning: '#888888'     // Warning states (light grey)
    },
    
    // Glass morphism system
    glass: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.85)',
      tertiary: 'rgba(255, 255, 255, 0.75)',
      dark: 'rgba(44, 44, 44, 0.9)',
      subtle: 'rgba(248, 248, 248, 0.8)',
      card: 'rgba(255, 255, 255, 0.9)',
      overlay: 'rgba(0, 0, 0, 0.4)',
      border: 'rgba(255, 255, 255, 0.3)'
    },
    
    // Background system - matching taskbar
    background: {
      primary: '#fafafa',    // Main page background
      secondary: '#ffffff',  // Card backgrounds
      tertiary: '#f8f8f8',   // Subtle backgrounds (like user info)
      quaternary: '#f5f5f5', // Even more subtle
      glass: 'rgba(255, 255, 255, 0.9)', // Glass backgrounds
      glassDark: 'rgba(44, 44, 44, 0.05)' // Very subtle dark glass
    },
    
    // Text system - matching taskbar typography
    text: {
      primary: '#2c2c2c',    // Main text (matching taskbar buttons)
      secondary: '#666666',  // Secondary text (matching user info)
      tertiary: '#999999',   // Muted text
      quaternary: '#bbbbbb', // Very muted
      inverse: '#f8f8f8',    // Light text on dark backgrounds
      white: '#ffffff',      // Pure white text
      light: '#627d98',      // Alias for lighter text
      muted: '#999999'       // Alias for tertiary
    },
    
    // Border system - matching taskbar's clean borders
    border: {
      light: '#f0f0f0',      // Very light borders
      medium: '#e0e0e0',     // Standard borders (matching taskbar)
      dark: '#d0d0d0',       // Darker borders
      primary: '#2c2c2c',    // Primary color borders
      glass: 'rgba(224, 224, 224, 0.6)', // Glass borders
      subtle: 'rgba(44, 44, 44, 0.1)'    // Very subtle borders
    },
    
  },
  
  // Typography system - matching taskbar's Work Sans usage
  typography: {
    fonts: {
      primary: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      secondary: "'Cormorant Garamond', 'Times New Roman', serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
      display: "'Cormorant Garamond', serif", // For special headings
      body: "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" // Alias for primary
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px - taskbar button size
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    weights: {
      thin: 100,
      light: 300,     // Matching taskbar's light weight
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      uppercase: '1px'  // Matching taskbar's letter spacing
    }
  },
  
  // Spacing system - matching taskbar's compact spacing
  spacing: {
    px: '1px',
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px - taskbar gap
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
    '6xl': '8rem'     // 128px
  },
  
  // Border radius - clean and minimal like taskbar
  borderRadius: {
    none: '0',
    xs: '2px',        // Matching taskbar's subtle radius
    sm: '4px',
    md: '8px',        // Mobile elements
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px'    // Circular elements like user avatar
  },
  
  // Shadow system - subtle like taskbar hovers
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px rgba(44, 44, 44, 0.1)',  // Matching taskbar hover
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 8px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glassSubtle: '0 4px 16px rgba(0, 0, 0, 0.05)',
    taskbarHover: '0 2px 4px rgba(44, 44, 44, 0.1)' // Exact taskbar hover shadow
  },
  
  // Transition system - matching taskbar's smooth animations
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',    // Matching taskbar transitions
    slow: '0.5s ease',
    spring: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  // Glass morphism effects
  glass: {
    background: 'rgba(255, 255, 255, 0.9)',
    backgroundDark: 'rgba(44, 44, 44, 0.9)',
    border: 'rgba(255, 255, 255, 0.3)',
    borderDark: 'rgba(255, 255, 255, 0.1)',
    blur: '20px',
    blurSubtle: '10px',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  
  // Layout breakpoints
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',   // Taskbar responsive breakpoint
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    skipLink: 1070,
    toast: 1080,
    tooltip: 1090
  },
  
  // Animation system
  animations: {
    fadeIn: 'fadeIn 0.3s ease',
    fadeOut: 'fadeOut 0.3s ease',
    slideUp: 'slideUp 0.3s ease',
    slideDown: 'slideDown 0.3s ease',
    scaleIn: 'scaleIn 0.2s ease',
    scaleOut: 'scaleOut 0.2s ease',
    spin: 'spin 1s linear infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite'
  }
};

// CSS Custom Properties for dynamic theming
export const cssVariables = `
  :root {
    --color-primary-50: ${theme.colors.primary[50]};
    --color-primary-500: ${theme.colors.primary[500]};
    --color-primary-600: ${theme.colors.primary[600]};
    --color-background-primary: ${theme.colors.background.primary};
    --color-background-secondary: ${theme.colors.background.secondary};
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-border-medium: ${theme.colors.border.medium};
    --shadow-taskbar-hover: ${theme.shadows.taskbarHover};
    --transition-normal: ${theme.transitions.normal};
    --font-primary: ${theme.typography.fonts.primary};
    --spacing-md: ${theme.spacing.md};
    --border-radius-xs: ${theme.borderRadius.xs};
  }
`;

// Utility functions for common theme operations
export const themeUtils = {
  // Get color with opacity
  alpha: (color: string, opacity: number) => {
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  // Get responsive value
  responsive: (mobile: string, desktop: string) => `
    ${mobile};
    @media (min-width: ${theme.breakpoints.lg}) {
      ${desktop};
    }
  `,
  
  // Glass effect mixin
  glass: (opacity = 0.9) => `
    background: ${themeUtils.alpha(theme.glass.background, opacity)};
    backdrop-filter: blur(${theme.glass.blur});
    border: 1px solid ${theme.glass.border};
    box-shadow: ${theme.shadows.glass};
  `,
  
  // Hover lift effect (like taskbar buttons)
  hoverLift: `
    transition: ${theme.transitions.normal};
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.taskbarHover};
    }
    &:active {
      transform: translateY(0);
    }
  `
};