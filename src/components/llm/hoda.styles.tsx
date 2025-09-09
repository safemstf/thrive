// src/components/llm/hoda.styles.tsx - Consolidated HODA Styles
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

/* ==========================
   CSS CUSTOM PROPERTIES & THEME
   ========================== */

export const HodaTheme = {
    colors: {
        primary: '#4f46e5',
        primaryDark: '#3730a3',
        primaryLight: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        processing: '#8b5cf6',
        neutral: '#6b7280',

        // Surfaces
        white: '#ffffff',
        gray50: '#f9fafb',
        gray100: '#f3f4f6',
        gray200: '#e5e7eb',
        gray300: '#d1d5db',
        gray600: '#6b7280',
        gray700: '#374151',
        gray900: '#111827',

        // Semantic colors
        background: 'rgba(248, 250, 252, 0.8)',
        surface: 'rgba(255, 255, 255, 0.95)',
        overlay: 'rgba(0, 0, 0, 0.6)',
        tooltip: 'rgba(0, 0, 0, 0.8)',
    },

    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        xxl: '2rem',
    },

    radius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
    },

    shadows: {
        sm: '0 2px 8px rgba(139, 92, 246, 0.15)',
        md: '0 4px 12px rgba(139, 92, 246, 0.2)',
        lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.15)',
    },

    transitions: {
        fast: '0.2s ease',
        normal: '0.3s ease',
        slow: '0.5s ease',
    },
};

/* ==========================
   UTILITY MIXINS
   ========================== */

// Responsive design helper
export const breakpoints = {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
};

export const media = {
    mobile: `@media (max-width: ${breakpoints.mobile})`,
    tablet: `@media (max-width: ${breakpoints.tablet})`,
    desktop: `@media (min-width: ${breakpoints.desktop})`,
};

// Motion respect utility
export const respectMotion = (animation: any) => css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
  ${animation}
`;

// Professional mode styling utility
export const professionalStyling = (isProfessional: boolean) => css`
  ${isProfessional && css`
    background: ${HodaTheme.colors.background};
    border: 1px solid rgba(139, 92, 246, 0.1);
  `}
`;

// Focus indicator utility
export const focusIndicator = (color = HodaTheme.colors.primary) => css`
  &:focus {
    outline: 2px solid ${color};
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

// Button interaction states
export const buttonStates = css`
  transition: all ${HodaTheme.transitions.fast};
  
  &:hover {
    filter: brightness(1.05);
    transform: scale(1.02);
  }
  
  &:active {
    filter: brightness(0.95);
    transform: scale(0.98);
  }
  
  ${focusIndicator()}
`;

/* ==========================
   ANIMATION KEYFRAMES (CONSOLIDATED)
   ========================== */

// Subtle movement animations
export const subtleBounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-1px); }
  60% { transform: translateY(-0.5px); }
`;

export const gentlePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
`;

export const subtleShimmer = keyframes`
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(5deg) brightness(1.02); }
`;

export const softGlow = keyframes`
  0%, 100% { box-shadow: 0 0 3px rgba(139, 92, 246, 0.1); }
  50% { box-shadow: 0 0 6px rgba(139, 92, 246, 0.2); }
`;

export const professionalWave = keyframes`
  0%, 100% { filter: brightness(1); }
  25% { filter: brightness(1.05); }
  75% { filter: brightness(1.02); }
`;

export const subtleMoonwalk = keyframes`
  0%, 100% { filter: brightness(1) saturate(1); }
  50% { filter: brightness(1.03) saturate(1.05); }
`;

export const professionalGriddy = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
`;

export const gentleNaynay = keyframes`
  0%, 100% { opacity: 1; }
  33%, 66% { opacity: 0.95; }
`;

// UI animations
export const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const statusPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

export const listeningRipple = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.2); opacity: 0; }
`;

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// Dance move utility function
export const getDanceAnimation = (
    danceMove: string,
    reduceMotion: boolean,
    professionalMode: boolean
) => {
    if (reduceMotion) return '';

    const duration = professionalMode ? '4s' : '2s';

    const animations = {
        bounce: css`${respectMotion(css`${subtleBounce} ${duration} ease-in-out infinite`)}`,
        pulse: css`${respectMotion(css`${gentlePulse} 3s ease-in-out infinite`)}`,
        shimmer: css`${respectMotion(css`${subtleShimmer} 4s ease-in-out infinite`)}`,
        glow: css`${respectMotion(css`${softGlow} 3s ease-in-out infinite`)}`,
        wave: css`${respectMotion(css`${professionalWave} 2s ease-in-out infinite`)}`,
        moonwalk: css`${respectMotion(css`${subtleMoonwalk} 3s ease-in-out infinite`)}`,
        griddy: css`${respectMotion(css`${professionalGriddy} 2s ease-in-out infinite`)}`,
        naynay: css`${respectMotion(css`${gentleNaynay} 1.5s ease-in-out infinite`)}`,
    };

    return animations[danceMove as keyof typeof animations] || '';
};

/* ==========================
   WRAPPER COMPONENTS
   ========================== */

export const WrapperContainer = styled.div`
  pointer-events: none;
  z-index: 9999;
  
  * {
    pointer-events: auto;
  }
`;

export const AvatarContainer = styled.div<{ $reduceMotion: boolean }>`
  position: fixed;
  bottom: ${HodaTheme.spacing.xxl};
  right: ${HodaTheme.spacing.xxl};
  z-index: 1000;
  
  transform: none !important;
  transition: none !important;
  
  ${props => !props.$reduceMotion && css`
    &:hover {
      animation: ${softGlow} 2s ease-in-out;
    }
  `}
  
  .hoda-fixed-avatar {
    transform: none !important;
    transition: filter ${HodaTheme.transitions.fast}, box-shadow ${HodaTheme.transitions.fast};
  }
  
  .hoda-fixed-avatar:focus {
    outline: 3px solid ${HodaTheme.colors.primaryLight};
    outline-offset: 3px;
  }
`;

export const StatusTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: ${HodaTheme.colors.tooltip};
  color: white;
  padding: ${HodaTheme.spacing.sm} ${HodaTheme.spacing.md};
  border-radius: ${HodaTheme.radius.md};
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity ${HodaTheme.transitions.fast};
  margin-bottom: ${HodaTheme.spacing.sm};
  
  ${AvatarContainer}:hover & {
    opacity: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${HodaTheme.colors.tooltip};
  }
`;

export const FullContainer = styled.div<{ $isMinimized: boolean; $reduceMotion: boolean }>`
  position: fixed;
  bottom: ${HodaTheme.spacing.xxl};
  right: calc(${HodaTheme.spacing.xxl} + 80px); /* Offset to avoid avatar collision */
  width: ${props => props.$isMinimized ? '300px' : '420px'};
  max-height: ${props => props.$isMinimized ? '48px' : '600px'};
  background: ${HodaTheme.colors.white};
  border-radius: ${HodaTheme.radius.xl};
  box-shadow: ${HodaTheme.shadows.lg};
  border: 1px solid rgba(139, 92, 246, 0.2);
  overflow: hidden;
  z-index: 1001;
  
  transition: ${props => props.$reduceMotion ? 'none' : `all ${HodaTheme.transitions.normal}`};
  
  ${props => !props.$reduceMotion && css`
    animation: ${slideUp} ${HodaTheme.transitions.normal};
  `}
  
  ${media.tablet} {
    bottom: ${HodaTheme.spacing.lg};
    right: ${HodaTheme.spacing.lg};
    left: ${HodaTheme.spacing.lg};
    width: auto;
  }
  
  ${media.mobile} {
    bottom: 0;
    right: 0;
    left: 0;
    border-radius: ${HodaTheme.radius.xl} ${HodaTheme.radius.xl} 0 0;
    max-height: ${props => props.$isMinimized ? '48px' : '80vh'};
  }
`;

export const HeaderBar = styled.div`
  background: linear-gradient(135deg, ${HodaTheme.colors.primaryLight}, ${HodaTheme.colors.primary});
  color: white;
  padding: ${HodaTheme.spacing.md} ${HodaTheme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${HodaTheme.spacing.sm};
  font-weight: 600;
  font-size: 0.875rem;
`;

export const HeaderControls = styled.div`
  display: flex;
  gap: ${HodaTheme.spacing.xs};
`;

export const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: ${HodaTheme.radius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: background ${HodaTheme.transitions.fast};
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  ${focusIndicator('white')}
  
  &:active {
    transform: scale(0.95);
  }
`;

export const ContentContainer = styled.div`
  /* Let child components handle their own layout */
`;

export const LoadingBox = styled.div`
  padding: ${HodaTheme.spacing.xxl};
  text-align: center;
  color: ${HodaTheme.colors.primaryLight};
  font-weight: 500;
  font-size: 0.875rem;
  
  &::after {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid ${HodaTheme.colors.gray200};
    border-top-color: ${HodaTheme.colors.primaryLight};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-left: ${HodaTheme.spacing.sm};
  }
`;


/* ==========================
   CONTENT SECTIONS
   ========================== */


export const Section = styled.section`
  margin-bottom: ${HodaTheme.spacing.xxl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${HodaTheme.spacing.sm};
  margin: 0 0 ${HodaTheme.spacing.lg} 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${HodaTheme.colors.gray700};
`;

/* ==========================
   INTERACTIVE ELEMENTS
   ========================== */

export const KeyBadge = styled.code`
  background: ${HodaTheme.colors.gray100};
  border: 1px solid ${HodaTheme.colors.gray300};
  border-radius: ${HodaTheme.radius.sm};
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  color: ${HodaTheme.colors.gray700};
`;

export const QuickCommandGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${HodaTheme.spacing.md};
`;

export const QuickCommand = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${HodaTheme.spacing.lg};
  padding: ${HodaTheme.spacing.lg};
  background: ${HodaTheme.colors.gray50};
  border: 1px solid ${HodaTheme.colors.gray200};
  border-radius: ${HodaTheme.radius.lg};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all ${HodaTheme.transitions.fast};

  &:hover {
    background: ${props => props.$clickable ? '#f1f5f9' : HodaTheme.colors.gray50};
    border-color: ${props => props.$clickable ? HodaTheme.colors.primary : HodaTheme.colors.gray200};
  }
  
  ${props => props.$clickable && focusIndicator()}
`;

export const CommandIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: ${HodaTheme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${HodaTheme.colors.primary};
  flex-shrink: 0;
`;

export const CommandInfo = styled.div`
  flex: 1;
`;

export const CommandText = styled.div`
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.875rem;
  color: ${HodaTheme.colors.primary};
  font-weight: 600;
  margin-bottom: ${HodaTheme.spacing.xs};
`;

export const CommandDesc = styled.div`
  font-size: 0.875rem;
  color: ${HodaTheme.colors.gray600};
`;

export const TryButton = styled.div`
  color: ${HodaTheme.colors.primary};
  flex-shrink: 0;
`;

/* ==========================
   AVATAR SPECIFIC COMPONENTS
   ========================== */

export const Container = styled.div<{ $position: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${HodaTheme.spacing.md};
  
  ${props => props.$position === 'embedded' ? css`
    position: relative;
    padding: ${HodaTheme.spacing.lg};
  ` : css`
    position: relative;
  `}
`;

export const StatusMessage = styled.div`
  padding: ${HodaTheme.spacing.sm} ${HodaTheme.spacing.md};
  background: rgba(239, 68, 68, 0.05);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: ${HodaTheme.radius.lg};
  font-size: 0.875rem;
  text-align: center;
  max-width: 200px;
`;

export const TTSContainer = styled.div`
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
`;

/* ==========================
   ADDITIONAL HELP COMPONENTS
   ========================== */

export const StepList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${HodaTheme.spacing.lg};
`;

export const Step = styled.li`
  display: flex;
  gap: ${HodaTheme.spacing.lg};
`;

export const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${HodaTheme.colors.primary}, ${HodaTheme.colors.primaryDark});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

export const StepContent = styled.div`
  flex: 1;
`;

export const StepTitle = styled.h4`
  margin: 0 0 ${HodaTheme.spacing.xs} 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${HodaTheme.colors.gray700};
`;

export const StepDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${HodaTheme.colors.gray600};
  line-height: 1.5;
`;

export const InfoBox = styled.div`
  display: flex;
  gap: ${HodaTheme.spacing.lg};
  padding: ${HodaTheme.spacing.lg};
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: ${HodaTheme.radius.lg};
  color: #1e40af;
`;

export const InfoContent = styled.div``;

export const InfoTitle = styled.h4`
  margin: 0 0 ${HodaTheme.spacing.xs} 0;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const InfoDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.8;
`;

/* ==========================
   UTILITY FUNCTIONS
   ========================== */

// Status color utility
export const getStatusColor = (status: string): string => {
    const colors = {
        listening: HodaTheme.colors.success,
        speaking: '#3b82f6',
        processing: HodaTheme.colors.warning,
        error: HodaTheme.colors.error,
        loading: HodaTheme.colors.processing,
        default: HodaTheme.colors.neutral,
    };
    return colors[status as keyof typeof colors] || colors.default;
};

/* ==========================
   GLOBAL STYLES
   ========================== */

export const HodaGlobalStyles = createGlobalStyle`
  .hoda-fixed-avatar {
    position: static !important;
    transform: none !important;
    transition: filter ${HodaTheme.transitions.fast}, box-shadow ${HodaTheme.transitions.fast} !important;
  }
  
  .hoda-embedded {
    position: static !important;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .hoda-fixed-avatar,
    .hoda-fixed-avatar *,
    .hoda-embedded,
    .hoda-embedded * {
      animation: none !important;
      transition: none !important;
    }
  }
`;

/* ==========================
   EXPORTS
   ========================== */

export default {
    theme: HodaTheme,
    animations: {
        subtleBounce,
        gentlePulse,
        subtleShimmer,
        softGlow,
        professionalWave,
        subtleMoonwalk,
        professionalGriddy,
        gentleNaynay,
        slideUp,
        statusPulse,
        listeningRipple,
        spin,
    },
    utilities: {
        getDanceAnimation,
        respectMotion,
        professionalStyling,
        focusIndicator,
        buttonStates,
        getStatusColor,
    },
    media,
    breakpoints,
};