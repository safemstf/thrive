// src/utils/index.ts - Comprehensive Utilities System
'use client';

import { BarChart3, Building2, Download, ExternalLink, Eye, FileCheck, Settings, Share2, Shield, Users } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { css } from 'styled-components';

// ==============================================
// 1. THEME UTILITIES
// ==============================================

export const themeUtils = {
  // Generate alpha color
  alpha: (color: string, opacity: number) => {
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    if (color.startsWith('#')) {
      let hex = color.replace('#', '');
      
      // Handle short hex like #fff
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }

      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },

  // Get glow color CSS variable
  getGlowColor: (isDark: boolean, baseColor: string = 'blue') => {
    const colorMap = {
      blue: isDark ? '147, 51, 234' : '59, 130, 246',
      purple: isDark ? '139, 92, 246' : '124, 58, 237',
      green: isDark ? '16, 185, 129' : '34, 197, 94',
      red: isDark ? '239, 68, 68' : '220, 38, 38'
    };
    return colorMap[baseColor as keyof typeof colorMap] || colorMap.blue;
  },

  // Generate gradient background
  generateGradient: (isDark: boolean, variant: 'subtle' | 'vibrant' | 'glass' = 'subtle') => {
    const gradients = {
      subtle: isDark 
        ? 'linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-tertiary) 100%)'
        : 'linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-tertiary) 100%)',
      vibrant: isDark
        ? `radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
           radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
           linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)`
        : `radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
           radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
           linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%, #ffffff 100%)`,
      glass: 'var(--glass-background)'
    };
    return gradients[variant];
  },

  // Optional: text gradient CSS helper
  textGradient: 'background: linear-gradient(90deg, #06b6d4, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
};

// ==============================================
// 2. ANIMATION UTILITIES
// ==============================================

export const animationUtils = {
  // Stagger animations for lists
  staggerDelay: (index: number, baseDelay: number = 100) => css`
    animation-delay: ${index * baseDelay}ms;
  `,

  // Hover lift with customizable height
  hoverLift: (height: number = 4, shadow: string = 'var(--shadow-md)') => css`
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    
    &:hover {
      transform: translateY(-${height}px);
      box-shadow: ${shadow};
    }
    
    &:active {
      transform: translateY(-${Math.max(1, height / 2)}px);
    }
  `,

  // Glow effect with custom color
  glowEffect: (isDark: boolean, color: string = 'blue', intensity: number = 0.3) => css`
    --glow-color: ${themeUtils.getGlowColor(isDark, color)};
    animation: glow 3s ease-in-out infinite;
    filter: drop-shadow(0 0 ${intensity * 20}px rgba(var(--glow-color), ${intensity}));
  `,

  // Loading states
  loadingPulse: css`
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        var(--color-border-light) 25%,
        var(--color-border-medium) 50%,
        var(--color-border-light) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: inherit;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
};

// ==============================================
// 3. CANVAS UTILITIES
// ==============================================

export const canvasUtils = {
  // Setup canvas with proper DPR
  setupCanvas: (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    return { ctx, width: rect.width, height: rect.height, dpr };
  },

  // Draw gradient background
  drawGradientBackground: (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    isDark: boolean
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.1)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 0.1)');
    } else {
      gradient.addColorStop(0, 'rgba(248, 250, 252, 0.1)');
      gradient.addColorStop(1, 'rgba(241, 245, 249, 0.1)');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  },

  // Calculate distance between two points
  distance: (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },

  // Bounce off walls
  bounceOffWalls: (
    entity: { x: number; y: number; vx: number; vy: number; size: number },
    width: number,
    height: number
  ) => {
    const newEntity = { ...entity };
    
    if (newEntity.x <= newEntity.size || newEntity.x >= width - newEntity.size) {
      newEntity.vx = -newEntity.vx;
      newEntity.x = Math.max(newEntity.size, Math.min(width - newEntity.size, newEntity.x));
    }
    
    if (newEntity.y <= newEntity.size || newEntity.y >= height - newEntity.size) {
      newEntity.vy = -newEntity.vy;
      newEntity.y = Math.max(newEntity.size, Math.min(height - newEntity.size, newEntity.y));
    }
    
    return newEntity;
  }
};

// ==============================================
// 4. RESPONSIVE UTILITIES
// ==============================================

export const responsive = {
  // Mobile-first breakpoint system
  above: {
    xs: `@media (min-width: 480px)`,
    sm: `@media (min-width: 640px)`,
    md: `@media (min-width: 768px)`,
    lg: `@media (min-width: 1024px)`,
    xl: `@media (min-width: 1280px)`,
  },
  
  below: {
    xs: `@media (max-width: 479px)`,
    sm: `@media (max-width: 639px)`,
    md: `@media (max-width: 767px)`,
    lg: `@media (max-width: 1023px)`,
    xl: `@media (max-width: 1279px)`,
  },

  // Responsive value helper
  value: (mobile: string, tablet?: string, desktop?: string) => css`
    ${mobile};
    ${tablet && css`${responsive.above.md} { ${tablet}; }`}
    ${desktop && css`${responsive.above.lg} { ${desktop}; }`}
  `,

  // Container queries
  container: (maxWidth: string = '1200px') => css`
    width: 100%;
    max-width: ${maxWidth};
    margin: 0 auto;
    padding: 0 var(--spacing-xl);
    
    ${responsive.below.lg} {
      padding: 0 var(--spacing-lg);
    }
    
    ${responsive.below.md} {
      padding: 0 var(--spacing-md);
    }
    
    ${responsive.below.sm} {
      padding: 0 var(--spacing-sm);
    }
  `
};

// ==============================================
// 5. FORM UTILITIES
// ==============================================

export const formUtils = {
  // Validation helpers
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string, minLength: number = 6) => {
    return {
      isValid: password.length >= minLength,
      hasLength: password.length >= minLength,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  },

  // Form state helper
  useFormState: <T extends Record<string, any>>(initialState: T) => {
    const [values, setValues] = useState<T>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const setValue = useCallback((field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }, [errors]);

    const setError = useCallback((field: keyof T, error: string) => {
      setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const markTouched = useCallback((field: keyof T) => {
      setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const reset = useCallback(() => {
      setValues(initialState);
      setErrors({});
      setTouched({});
    }, [initialState]);

    return {
      values,
      errors,
      touched,
      setValue,
      setError,
      setTouched: markTouched,
      reset,
      isValid: Object.keys(errors).length === 0
    };
  }
};

// ==============================================
// 6. PERFORMANCE UTILITIES
// ==============================================

export const performanceUtils = {
  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },

  // RAF-based animation loop
  useAnimationLoop: (callback: () => void, isRunning: boolean) => {
    const callbackRef = useRef(callback);
    const animationRef = useRef<number | undefined>(undefined);

    useEffect(() => {
      callbackRef.current = callback;
    });

    useEffect(() => {
      if (!isRunning) return;

      const animate = () => {
        callbackRef.current();
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isRunning]);
  }
};

// ==============================================
// 7. COMPONENT UTILITIES
// ==============================================

export const componentUtils = {
  // Generate component variants
  variants: <T extends string>(
    variantMap: Record<T, any>,
    defaultVariant: T
  ) => (variant: T = defaultVariant) => variantMap[variant],

  // Size variants
  sizeVariants: {
    sm: { padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: '0.75rem' },
    md: { padding: 'var(--spacing-md) var(--spacing-xl)', fontSize: '0.875rem' },
    lg: { padding: 'var(--spacing-lg) var(--spacing-2xl)', fontSize: '1rem' }
  },

  // Common prop combinations
  interactiveProps: css`
    cursor: pointer;
    transition: var(--transition-normal);
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    
    &:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  `,

  // Loading state
  loadingState: (isLoading: boolean) => css`
    position: relative;
    ${isLoading && css`
      pointer-events: none;
      
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--color-background-primary);
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
      }
    `}
  `
};

// ==============================================
// 8. ACCESSIBILITY UTILITIES
// ==============================================

export const a11yUtils = {
  // Screen reader only text
  srOnly: css`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `,

  // Focus management
  useFocusManagement: (isOpen: boolean) => {
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isOpen) {
        previousFocusRef.current = document.activeElement as HTMLElement;
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }, [isOpen]);

    const trapFocus = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    }, []);

    return { trapFocus };
  }
};

// ==============================================
// 9. DATA UTILITIES
// ==============================================

export const dataUtils = {
  // Generate ID
  generateId: (prefix: string = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Format numbers
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('en-US', options).format(num);
  },

  // Format dates
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  },

  // Clamp number between min/max
  clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),

  // Linear interpolation
  lerp: (start: number, end: number, factor: number) => start + (end - start) * factor,

  // Random number in range
  randomRange: (min: number, max: number) => Math.random() * (max - min) + min,

  // Shuffle array
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
};

// ==============================================
// 10. ICON UTILITIES
// ==============================================

// Map string icon names to Lucide React components
export const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Shield,
    Users,
    BarChart3,
    Settings,
    Building2,
    FileCheck,
    Download,
    Share2,
    Eye,
    ExternalLink
  };
  
  return iconMap[iconName] || Shield; // Default to Shield if icon not found
};

// ==============================================
// 11. EXPORT ALL UTILITIES
// ==============================================

export const utils = {
  theme: themeUtils,
  animation: animationUtils,
  canvas: canvasUtils,
  responsive,
  form: formUtils,
  performance: performanceUtils,
  component: componentUtils,
  a11y: a11yUtils,
  data: dataUtils
};

// Export everything for easy importing
export default utils;