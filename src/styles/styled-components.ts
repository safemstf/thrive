'use client';
// src/styles/styled-components.ts - Remove Dark Mode Logic Only
import styled, { css, keyframes } from 'styled-components';

// ==============================================
// 1. THEME INTEGRATION
// ==============================================

// Re-export theme utilities for easy access
export { generateTheme, lightTheme, darkTheme } from './theme';

// BACKWARD COMPATIBILITY: Export default theme for existing files
export { lightTheme as theme } from './theme';

// ==============================================
// 2. ANIMATIONS (Enhanced with missing animations)
// ==============================================

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const float = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, -20px) rotate(1deg); }
  50% { transform: translate(-10px, 10px) rotate(-1deg); }
  75% { transform: translate(15px, 5px) rotate(0.5deg); }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(var(--glow-color), 0.3); }
  50% { box-shadow: 0 0 40px rgba(var(--glow-color), 0.6); }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

export const hoverLift = (amount: number = 4) => css`
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-${amount}px);
    box-shadow: 0 ${amount * 1.5}px ${amount * 3}px rgba(0, 0, 0, 0.15);
  }
`;

export const animationUtils = {
  fadeIn,
  float,
  spin,
  slideUp,
  slideDown,
  scaleIn,
  pulse,
  glow,
  fadeInUp,
  bounce,
  hoverLift
};

// ==============================================
// 3. MIXINS (Enhanced)
// ==============================================

export const glassEffect = css`
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
`;

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
`;

export const responsiveContainer = css`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  
  @media (max-width: 1024px) {
    padding: 0 var(--spacing-lg);
  }
  
  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
  }
  
  @media (max-width: 480px) {
    padding: 0 var(--spacing-sm);
  }
`;

export const textGradient = css`
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// ==============================================
// 4. LAYOUT COMPONENTS (Keep your existing ones + add these)
// ==============================================

export const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  transition: background-color 0.3s ease, color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px);
    opacity: 0.02;
    background-size: 40px 40px;
    animation: ${float} 25s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

export const ContentWrapper = styled.div`
  ${responsiveContainer}
  position: relative;
  z-index: 1;
`;

export const Section = styled.section<{ $spacing?: 'sm' | 'md' | 'lg' | 'xl' }>`
  padding: ${({ $spacing = 'lg' }) => {
    switch ($spacing) {
      case 'sm': return 'var(--spacing-xl) 0';
      case 'md': return 'var(--spacing-2xl) 0';
      case 'lg': return 'var(--spacing-3xl) 0';
      case 'xl': return '5rem 0';
    }
  }};
  
  @media (max-width: 768px) {
    padding: ${({ $spacing = 'lg' }) => {
    switch ($spacing) {
      case 'sm': return 'var(--spacing-lg) 0';
      case 'md': return 'var(--spacing-xl) 0';
      case 'lg': return 'var(--spacing-2xl) 0';
      case 'xl': return 'var(--spacing-3xl) 0';
    }
  }};
  }
`;

export const Container = styled.div<{ $maxWidth?: string; $padding?: boolean }>`
  max-width: ${({ $maxWidth = '1200px' }) => $maxWidth};
  margin: 0 auto;
  width: 100%;
  
  ${({ $padding = true }) => $padding && css`
    ${responsiveContainer}
  `}
`;

export const FlexRow = styled.div<{
  $gap?: string;
  $align?: string;
  $justify?: string;
  $wrap?: boolean;
  $responsive?: boolean;
}>`
  display: flex;
  align-items: ${({ $align = 'center' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
  gap: ${({ $gap = 'var(--spacing-md)' }) => $gap};
  flex-wrap: ${({ $wrap = true }) => $wrap ? 'wrap' : 'nowrap'};
  
  ${({ $responsive = true }) => $responsive && css`
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-sm);
    }
  `}
`;

export const FlexColumn = styled.div<{ $gap?: string; $align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align = 'stretch' }) => $align};
  gap: ${({ $gap = 'var(--spacing-md)' }) => $gap};
`;

export const Grid = styled.div<{
  $columns?: number;
  $minWidth?: string;
  $gap?: string;
  $responsive?: boolean;
}>`
  display: grid;
  gap: ${({ $gap = 'var(--spacing-lg)' }) => $gap};
  
  ${({ $columns, $minWidth = '280px', $responsive = true }) => {
    if ($columns) {
      return css`
        grid-template-columns: repeat(${$columns}, 1fr);
        
        ${$responsive && css`
          @media (max-width: 1024px) {
            grid-template-columns: repeat(${Math.max(1, $columns - 1)}, 1fr);
          }
          
          @media (max-width: 768px) {
            grid-template-columns: repeat(${Math.max(1, Math.ceil($columns / 2))}, 1fr);
          }
          
          @media (max-width: 480px) {
            grid-template-columns: 1fr;
          }
        `}
      `;
    } else {
      return css`
        grid-template-columns: repeat(auto-fit, minmax(${$minWidth}, 1fr));
        
        @media (max-width: 768px) {
          grid-template-columns: repeat(auto-fit, minmax(min(${$minWidth}, 100%), 1fr));
          gap: var(--spacing-md);
        }
        
        @media (max-width: 480px) {
          grid-template-columns: 1fr;
          gap: var(--spacing-sm);
        }
      `;
    }
  }}
`;

// ==============================================
// 5. TYPOGRAPHY COMPONENTS (Enhanced)
// ==============================================

export const Heading1 = styled.h1<{ $responsive?: boolean; $gradient?: boolean }>`
  font-family: var(--font-display);
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: 1px;
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
  transition: color 0.3s ease;
  
  font-size: ${({ $responsive = true }) => $responsive ? 'clamp(2rem, 5vw, 3.5rem)' : '3.5rem'};
  
  ${({ $gradient }) => $gradient && textGradient}
  
  @media (max-width: 768px) {
    font-size: ${({ $responsive = true }) => $responsive ? 'clamp(1.75rem, 6vw, 2.5rem)' : '2.5rem'};
  }
`;

export const Heading2 = styled.h2<{ $responsive?: boolean; $gradient?: boolean }>`
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  transition: color 0.3s ease;
  
  font-size: ${({ $responsive = true }) => $responsive ? 'clamp(1.5rem, 4vw, 2rem)' : '2rem'};
  
  ${({ $gradient }) => $gradient && textGradient}
  
  @media (max-width: 768px) {
    font-size: ${({ $responsive = true }) => $responsive ? 'clamp(1.25rem, 5vw, 1.75rem)' : '1.75rem'};
  }
`;

export const Heading3 = styled.h3<{ $responsive?: boolean }>`
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  transition: color 0.3s ease;
  
  font-size: ${({ $responsive = true }) => $responsive ? 'clamp(1.25rem, 3vw, 1.5rem)' : '1.5rem'};
`;

export const BodyText = styled.p<{ $size?: 'sm' | 'base' | 'lg' | 'xl' }>`
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  transition: color 0.3s ease;
  
  font-size: ${({ $size = 'base' }) => {
    switch ($size) {
      case 'sm': return '0.875rem';
      case 'base': return '1rem';
      case 'lg': return '1.125rem';
      case 'xl': return 'clamp(1.125rem, 2.5vw, 1.25rem)';
    }
  }};
`;

// ==============================================
// 6. COMPONENT EXPORTS (Enhanced with missing components)
// ==============================================

export const BaseButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}>`
  font-family: var(--font-body);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  transition: var(--transition-normal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-sm);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  ${focusRing}
  
  /* Size variants */
  ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return css`
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: 0.75rem;
        `;
      case 'md':
        return css`
          padding: var(--spacing-md) var(--spacing-xl);
          font-size: 0.875rem;
        `;
      case 'lg':
        return css`
          padding: var(--spacing-lg) var(--spacing-2xl);
          font-size: 1rem;
        `;
    }
  }}
  
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  
  /* Variant styles */
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
          color: var(--color-background-secondary);
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
        `;
      case 'secondary':
        return css`
          background: transparent;
          color: var(--color-primary-500);
          border: 1px solid var(--color-border-medium);
          
          &:hover:not(:disabled) {
            background: var(--color-background-tertiary);
            border-color: var(--color-primary-500);
            transform: translateY(-2px);
          }
        `;
      case 'ghost':
        return css`
          background: var(--color-background-tertiary);
          color: var(--color-primary-500);
          
          &:hover:not(:disabled) {
            background: var(--color-border-light);
            transform: translateY(-2px);
          }
        `;
      case 'danger':
        return css`
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.8rem;
  }
`;

export const Card = styled.div<{
  $hover?: boolean;
  $glass?: boolean;
  $padding?: 'sm' | 'md' | 'lg' | 'none';
}>`
  background: ${({ $glass }) =>
    $glass ? 'var(--glass-background)' : 'var(--color-background-secondary)'
  };
  border-radius: var(--radius-lg);
  border: 1px solid ${({ $glass }) =>
    $glass ? 'var(--glass-border)' : 'var(--color-border-light)'
  };
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition-normal);
  position: relative;
  
  ${({ $glass }) => $glass && css`
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
  `}
  
  ${({ $hover }) => $hover && css`
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
  `}
  
  ${({ $padding = 'lg' }) => $padding !== 'none' && css`
    padding: ${() => {
      switch ($padding) {
        case 'sm': return 'var(--spacing-md)';
        case 'md': return 'var(--spacing-lg)';
        case 'lg': return 'var(--spacing-xl)';
        default: return 'var(--spacing-xl)';
      }
    }};
    
    @media (max-width: 768px) {
      padding: ${() => {
      switch ($padding) {
        case 'sm': return 'var(--spacing-sm)';
        case 'md': return 'var(--spacing-md)';
        case 'lg': return 'var(--spacing-lg)';
        default: return 'var(--spacing-lg)';
      }
    }};
    }
  `}
`;

export const CardContent = styled.div<{ $padding?: 'sm' | 'md' | 'lg' }>`
  padding: ${({ $padding = 'lg' }) => {
    switch ($padding) {
      case 'sm': return 'var(--spacing-md)';
      case 'md': return 'var(--spacing-lg)';
      case 'lg': return 'var(--spacing-xl)';
    }
  }};
  
  @media (max-width: 768px) {
    padding: ${({ $padding = 'lg' }) => {
    switch ($padding) {
      case 'sm': return 'var(--spacing-sm)';
      case 'md': return 'var(--spacing-md)';
      case 'lg': return 'var(--spacing-lg)';
    }
  }};
  }
`;

export const HeroSection = styled(Section)`
  background: linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-tertiary) 100%);
  text-align: center;
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  display: flex;
  align-items: center;
  transition: background 0.3s ease;
  
  @media (max-width: 768px) {
    min-height: 50vh;
    padding: var(--spacing-2xl) 0;
  }
`;

export const LoadingContainer = styled.div<{ $minHeight?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $minHeight = '50vh' }) => $minHeight};
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

export const EmptyState = styled.div<{ $minHeight?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${({ $minHeight = '300px' }) => $minHeight};
  padding: var(--spacing-2xl) var(--spacing-xl);
  text-align: center;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  
  h3 {
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
    font-size: 1.25rem;
    transition: color 0.3s ease;
  }
  
  p {
    margin-bottom: var(--spacing-xl);
    max-width: 400px;
    line-height: 1.6;
  }
`;

// Enhanced Input component
export const Input = styled.input<{
  $size?: 'sm' | 'md' | 'lg';
  $error?: boolean;
  $hasIcon?: boolean;
}>`
  font-family: var(--font-body);
  padding: ${({ $size = 'md', $hasIcon }) => {
    const paddingMap = {
      sm: $hasIcon ? 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 3rem' : 'var(--spacing-sm) var(--spacing-md)',
      md: $hasIcon ? 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem' : 'var(--spacing-md)',
      lg: $hasIcon ? 'var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 3rem' : 'var(--spacing-lg)'
    };
    return paddingMap[$size];
  }};
  border: 1px solid ${({ $error }) => $error ? '#ef4444' : 'var(--color-border-medium)'};
  border-radius: var(--radius-sm);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
  width: 100%;
  font-size: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.875rem';
      case 'md': return '1rem';
      case 'lg': return '1.125rem';
    }
  }};
  
  ${focusRing}
  
  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: var(--color-text-muted);
  }
  
  /* Mobile optimization */
  @media (max-width: 768px) {
    padding: var(--spacing-md);
    font-size: 1rem; /* Prevent zoom on iOS */
  }
`;

// Enhanced Navbar
export const NavBar = styled.nav`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: var(--spacing-md) 0;
  transition: background 0.3s ease;
`;

// Login/Page Wrapper
export const AuthPageWrapper = styled(PageContainer) <{ $variant?: 'login' | 'register' | 'default' }>`
  min-height: 100vh;
  display: flex;
  background: ${({ $variant }) => {
    if ($variant === 'login') {
      return css`
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-tertiary) 100%)
      `;
    }
    return 'var(--color-background-primary)';
  }};
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background-primary);
    opacity: 0.8;
    backdrop-filter: blur(0.5px);
    z-index: -1;
    pointer-events: none;
  }
`;

// Simulation Canvas
export const SimulationCanvas = styled.canvas`
  width: 100%;
  height: 500px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border-medium);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  background-color: var(--color-background-secondary);

  &:hover {
    border-color: var(--color-primary-500);
  }
  
  @media (max-width: 768px) {
    height: 400px;
  }
  
  @media (max-width: 480px) {
    height: 320px;
  }
`;

// Enhanced Form Components
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
`;

export const MessageContainer = styled.div<{ $type: 'error' | 'success' | 'warning' | 'info' }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-family: var(--font-body);
  font-weight: 500;
  
  ${({ $type }) => {
    switch ($type) {
      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case 'success':
        return css`
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
          border: 1px solid rgba(34, 197, 94, 0.2);
        `;
      case 'warning':
        return css`
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.2);
        `;
      case 'info':
        return css`
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
          border: 1px solid rgba(59, 130, 246, 0.2);
        `;
    }
  }}

  svg {
    flex-shrink: 0;
  }
`;

// Tab Components (for login/register forms)
export const TabContainer = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xl);
  background: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  background: ${props => props.$active
    ? 'var(--color-background-secondary)'
    : 'transparent'};
  color: ${props => props.$active
    ? 'var(--color-text-primary)'
    : 'var(--color-text-secondary)'};
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? 'var(--shadow-sm)' : 'none'};

  &:hover {
    background: ${props => props.$active
    ? 'var(--color-background-secondary)'
    : 'var(--color-background-tertiary)'};
  }
`;

// Control Button (for simulations)
export const ControlButton = styled(BaseButton)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

// ==============================================
// 7. UTILITY COMPONENTS
// ==============================================

export const Spacer = styled.div<{ $height?: string }>`
  height: ${({ $height = 'var(--spacing-md)' }) => $height};
  flex-shrink: 0;
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: var(--color-border-light);
  margin: var(--spacing-xl) 0;
`;

export const Badge = styled.span<{ $variant?: 'default' | 'success' | 'warning' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $variant = 'default' }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        `;
      case 'warning':
        return css`
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        `;
      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
      default:
        return css`
          background: var(--color-background-tertiary);
          color: var(--color-text-primary);
        `;
    }
  }}
`;

export const LoadingSpinner = styled.div<{ $size?: 'sm' | 'md' | 'lg' }>`
  width: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '24px';
      case 'md': return '48px';
      case 'lg': return '64px';
    }
  }};
  height: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '24px';
      case 'md': return '48px';
      case 'lg': return '64px';
    }
  }};
  border: 4px solid var(--color-border-light);
  border-top: 4px solid var(--color-primary-500);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Dev Mode Indicator
export const DevBadge = styled.span`
  font-size: 0.7em;
  color: #10b981;
  font-weight: 600;
  margin-left: var(--spacing-xs);
`;

// Assessment-specific components
export const TimerCard = styled(Card) <{ $variant?: 'primary' | 'warning' | 'danger' }>`
  background: ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'danger': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))';
    }
  }};
  color: white;
  text-align: center;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
`;

export const QuestionButton = styled(BaseButton) <{ $status: 'unanswered' | 'answered' | 'current' }>`
  aspect-ratio: 1;
  padding: 0;
  min-width: 40px;
  height: 40px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'current':
        return css`
          background: var(--color-primary-500);
          color: white;
          transform: scale(1.05);
          box-shadow: var(--shadow-md);
        `;
      case 'answered':
        return css`
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-text-primary);
          border: 1px solid var(--color-primary-500);
        `;
      default:
        return css`
          background: var(--color-background-tertiary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border-medium);
        `;
    }
  }}
`;

export const WritingTaskContainer = styled(Card)`
  border: 1px dashed var(--color-primary-500);
  background: rgba(59, 130, 246, 0.02);
`;

export const DifficultyBadge = styled(Badge) <{ $difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>`
  ${({ $difficulty = 'intermediate' }) => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#3b82f6',
      advanced: '#8b5cf6',
      expert: '#ef4444'
    };
    const color = colors[$difficulty];
    const rgb = color.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ') || '59, 130, 246';

    return css`
      background: rgba(${rgb}, 0.1);
      color: ${color};
    `;
  }}
`;

// Settings-specific components
export const SettingsCard = styled(Card).attrs({ $hover: true, $glass: true })`
  text-decoration: none;
  display: block;
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-500);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

export const QuickSettingCard = styled(Card).attrs({ $padding: 'lg' })`
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: var(--color-background-tertiary);
    border-color: var(--color-primary-500);
    transform: translateY(-2px);
  }
`;

export const IconContainer = styled.div<{ $color?: string; $size?: 'sm' | 'md' | 'lg' }>`
  ${({ $size = 'md' }) => {
    const sizes = {
      sm: { width: '40px', height: '40px' },
      md: { width: '56px', height: '56px' },
      lg: { width: '72px', height: '72px' }
    };
    return css`
      width: ${sizes[$size].width};
      height: ${sizes[$size].height};
    `;
  }}
  
  background: ${({ $color = 'var(--color-primary-500)' }) =>
    `linear-gradient(135deg, ${$color}, ${$color}dd)`};
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.1);
  }
`;

export const StatusBadge = styled(Badge) <{ $status: 'active' | 'inactive' | 'suspended' }>`
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return css`
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        `;
      case 'inactive':
        return css`
          background: rgba(156, 163, 175, 0.1);
          color: #6b7280;
        `;
      case 'suspended':
        return css`
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
    }
  }}
`;

// ==============================================
// 9. RESPONSIVE BREAKPOINTS
// ==============================================

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const responsive = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
  lg: `@media (max-width: ${breakpoints.lg})`,
  xl: `@media (max-width: ${breakpoints.xl})`,
  below: {
    xs: `@media (max-width: 479px)`,
    sm: `@media (max-width: 639px)`,
    md: `@media (max-width: 767px)`,
    lg: `@media (max-width: 1023px)`,
    xl: `@media (max-width: 1279px)`,
  },
  above: {
    xs: `@media (min-width: ${breakpoints.xs})`,
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`
  }
};

export const utils = {
  // Text utilities
  textGradient,

  // Layout utilities
  responsiveContainer,
  glassEffect,
  focusRing,

  // Animation utilities
  hoverLift,

  // Responsive utilities
  breakpoints,
  responsive,
  media: responsive,

  // CSS mixins
  mixins: {
    glassEffect,
    focusRing,
    responsiveContainer,
    textGradient,
    hoverLift
  }
};

export const media = responsive; // Alias for backward compatibility

// ==============================================
// ERROR CONTAINER
// ==============================================
export const ErrorContainer = styled.div`
  padding: var(--spacing-md);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

// ==============================================
// TEXT AREA
// ==============================================
export const TextArea = styled.textarea<{
  $size?: 'sm' | 'md' | 'lg';
  $error?: boolean;
}>`
  font-family: var(--font-body);
  padding: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return 'var(--spacing-sm) var(--spacing-md)';
      case 'md': return 'var(--spacing-md)';
      case 'lg': return 'var(--spacing-lg)';
    }
  }};
  border: 1px solid ${({ $error }) => $error ? '#ef4444' : 'var(--color-border-medium)'};
  border-radius: var(--radius-sm);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
  width: 100%;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: var(--color-text-muted);
  }
`;

// ==============================================
// MODAL COMPONENTS
// ==============================================
export const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
`;

export const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const ModalContent = styled.div`
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  pointer-events: auto;
  animation: ${scaleIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1001;
  border: 1px solid var(--color-border-light);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
`;

export const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

export const ModalFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
`;

// ==============================================
// HEADER COMPONENTS
// ==============================================

export const Header = styled.header`
  width: 100%;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background 0.3s ease, border-color 0.3s ease;
`;

export const HeaderContent = styled.div`
  ${responsiveContainer}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  z-index: 2;
`;

export const PageWrapper = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  transition: width 0.6s ease;
  border-radius: var(--radius-full);
`;

export const ProgressBar = styled.div`
  height: 8px;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
`;

// Export everything for easy importing
export * from './theme';