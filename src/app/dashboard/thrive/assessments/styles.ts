// src\app\dashboard\thrive\assessments\styles.ts
import styled, { keyframes, css } from 'styled-components';
import { 
  Card, BaseButton, Badge, Grid, FlexRow, FlexColumn,
  animationUtils, glassEffect, textGradient
} from '@/styles/styled-components';

// ==============================================
// PREMIUM ANIMATIONS
// ==============================================

const breathe = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
  50% { transform: scale(1.05) rotate(1deg); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ==============================================
// LAYOUT COMPONENTS
// ==============================================

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%);
`;

export const DashboardHero = styled.section`
  width: 100%;
  background: 
    radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at center, rgba(16, 185, 129, 0.04) 0%, transparent 70%),
    linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  padding: var(--spacing-3xl) 0;

  &::before {
    content: '';
    position: absolute;
    top: 15%;
    right: 8%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
    animation: ${breathe} 8s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 20%;
    left: 5%;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(35px);
    animation: ${float} 12s ease-in-out infinite reverse;
  }
`;

export const ConstrainedContent = styled.div<{ $maxWidth?: string; $padding?: string }>`
  max-width: ${({ $maxWidth = '1400px' }) => $maxWidth};
  margin: 0 auto;
  padding: 0 ${({ $padding = 'var(--spacing-xl)' }) => $padding};
  width: 100%;
  position: relative;
  z-index: 1;
`;

export const Section = styled.section`
  margin: var(--spacing-3xl) 0;
`;

// ==============================================
// PREMIUM WELCOME COMPONENTS
// ==============================================

export const WelcomeBadge = styled(Badge)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  padding: var(--spacing-sm) var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: ${animationUtils.slideUp} 0.6s ease-out;
`;

export const LevelTitle = styled(FlexColumn)`
  align-items: center;
  margin-bottom: var(--spacing-xl);
  
  h1 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.2;
    animation: ${animationUtils.slideUp} 0.8s ease-out 0.2s both;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
`;

export const GradientText = styled.span`
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-size: 200% 200%;
  animation: ${gradientShift} 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const LevelProgressContainer = styled.div`
  max-width: 450px;
  margin: 0 auto var(--spacing-xl);
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.4s both;
`;

export const ProgressBarWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  height: 14px;
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
`;

export const ProgressBar = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  background-size: 200% 100%;
  animation: ${shimmer} 2s ease-in-out infinite;
  border-radius: var(--radius-full);
  position: relative;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    box-shadow: 
      0 0 12px rgba(255, 255, 255, 0.9),
      0 0 24px rgba(59, 130, 246, 0.6);
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

export const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
`;

export const StatPill = styled.div<{ $color: string }>`
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg) var(--spacing-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ $color }) => `${$color}40`};
    box-shadow: 0 8px 32px ${({ $color }) => `${$color}20`};
  }
`;

export const StatValue = styled.div<{ $color: string }>`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ $color }) => $color};
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
`;

export const StatLabel = styled.div`
  fontSize: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

// ==============================================
// PREMIUM ACTION CARDS
// ==============================================

export const ActionCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-xl);
  margin: var(--spacing-3xl) 0;
`;

export const PremiumActionCard = styled(Card)<{ $color: string; $urgent?: boolean }>`
  background: ${({ $urgent, $color }) => $urgent 
    ? `linear-gradient(135deg, ${$color}15, ${$color}05)`
    : 'rgba(255, 255, 255, 0.06)'
  };
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ $urgent, $color }) => $urgent 
    ? `${$color}30` 
    : 'rgba(255, 255, 255, 0.12)'
  };
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: ${({ $color }) => `linear-gradient(180deg, ${$color}08 0%, transparent 100%)`};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 25px 70px ${({ $color }) => `${$color}25`};
    border-color: ${({ $color }) => `${$color}50`};
    
    &::before {
      opacity: 1;
    }
  }

  ${({ $urgent }) => $urgent && css`
    animation: ${pulse} 4s ease-in-out infinite;
  `}
`;

export const ActionIcon = styled.div<{ $color: string }>`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, ${({ $color }) => `${$color}25`}, ${({ $color }) => `${$color}12`});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  border: 2px solid ${({ $color }) => `${$color}40`};
  box-shadow: 0 8px 24px ${({ $color }) => `${$color}20`};
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: linear-gradient(45deg, ${({ $color }) => `${$color}40`}, transparent, ${({ $color }) => `${$color}20`});
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  ${PremiumActionCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    
    &::after {
      opacity: 1;
    }
  }
`;

export const UrgentBadge = styled.div`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  fontSize: 0.7rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  animation: ${pulse} 3s ease-in-out infinite;
`;

export const ActionFooter = styled.div<{ $color: string }>`
  background: rgba(255, 255, 255, 0.08);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-lg);
  transition: all 0.3s ease;

  ${PremiumActionCard}:hover & {
    background: ${({ $color }) => `${$color}10`};
    border-color: ${({ $color }) => `${$color}20`};
  }
`;

// ==============================================
// TRACK PROGRESS CARDS
// ==============================================

export const TrackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: var(--spacing-xl);
  margin: var(--spacing-3xl) 0;
`;

export const TrackCard = styled(Card)<{ $color: string }>`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, 
      ${({ $color }) => $color} 0%, 
      ${({ $color }) => `${$color}80`} var(--progress, 50)%, 
      rgba(255,255,255,0.15) var(--progress, 50)%
    );
    z-index: 2;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px ${({ $color }) => `${$color}20`};
    border-color: ${({ $color }) => `${$color}30`};
  }
`;

export const TrackHeader = styled(FlexRow)<{ $color: string }>`
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  .track-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, ${({ $color }) => `${$color}25`}, ${({ $color }) => `${$color}12`});
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${({ $color }) => `${$color}30`};
    transition: transform 0.3s ease;
  }
  
  ${TrackCard}:hover .track-icon {
    transform: scale(1.1);
  }
`;

export const TrackBadge = styled(Badge)<{ $color: string }>`
  background: linear-gradient(135deg, ${({ $color }) => `${$color}20`}, ${({ $color }) => `${$color}10`});
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => `${$color}30`};
  font-size: 0.75rem;
  font-weight: 600;
`;

export const ProgressSection = styled.div`
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const ProgressTrack = styled.div<{ $color: string; $progress: number }>`
  background: rgba(255, 255, 255, 0.1);
  height: 10px;
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
  margin-top: var(--spacing-sm);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${({ $progress }) => $progress}%;
    height: 100%;
    background: linear-gradient(90deg, ${({ $color }) => $color}, ${({ $color }) => `${$color}80`});
    border-radius: var(--radius-full);
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 15px ${({ $color }) => `${$color}40`};
  }
`;

export const NextUpSection = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// ==============================================
// FEATURED ASSESSMENT
// ==============================================

export const FeaturedCard = styled(Card)`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(16, 185, 129, 0.06));
  border: 1px solid rgba(16, 185, 129, 0.35);
  position: relative;
  overflow: hidden;
  margin: var(--spacing-3xl) 0;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
    animation: ${float} 20s linear infinite;
    pointer-events: none;
  }
`;

export const FeaturedBadge = styled.div`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  z-index: 2;
`;

export const FeaturedIcon = styled.div`
  width: 88px;
  height: 88px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(16, 185, 129, 0.15));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(16, 185, 129, 0.5);
  box-shadow: 
    0 8px 32px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  ${FeaturedCard}:hover & {
    transform: scale(1.05) rotate(-3deg);
  }
`;

export const FeatureMetrics = styled(FlexRow)`
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  
  .metric {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    font-weight: 600;
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
`;

// ==============================================
// QUICK ASSESSMENT CARDS
// ==============================================

export const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-3xl) 0;
`;

export const QuickCard = styled(Card)<{ $color: string }>`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${({ $color }) => `${$color}15`}, transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 45px ${({ $color }) => `${$color}20`};
    border-color: ${({ $color }) => `${$color}40`};
    
    &::before {
      left: 100%;
    }
  }
`;

export const QuickIcon = styled.div<{ $color: string }>`
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, ${({ $color }) => `${$color}25`}, ${({ $color }) => `${$color}12`});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ $color }) => `${$color}30`};
  transition: all 0.3s ease;

  ${QuickCard}:hover & {
    transform: scale(1.1);
    box-shadow: 0 4px 16px ${({ $color }) => `${$color}30`};
  }
`;

// ==============================================
// MOTIVATION SECTION
// ==============================================

export const MotivationCard = styled(Card)`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.12));
  border: 1px solid rgba(59, 130, 246, 0.25);
  text-align: center;
  position: relative;
  overflow: hidden;
  margin: var(--spacing-3xl) 0;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 50%);
    animation: ${float} 25s linear infinite;
    pointer-events: none;
  }
`;

export const MotivationIcon = styled.div`
  width: 84px;
  height: 84px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  box-shadow: 
    0 12px 40px rgba(59, 130, 246, 0.4),
    0 4px 16px rgba(139, 92, 246, 0.3);
  position: relative;
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05) rotate(-2deg);
  }

  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.6), transparent, rgba(139, 92, 246, 0.4));
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  ${MotivationCard}:hover &::after {
    opacity: 1;
  }
`;

// ==============================================
// SECTION HEADERS
// ==============================================

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  
  .icon-title {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }
  
  h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
  }
  
  p {
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 0 auto;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

// ==============================================
// UTILITY COMPONENTS
// ==============================================

export const LivePulse = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: ${pulse} 2s infinite;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
  }
`;

export const MetricHighlight = styled.div<{ $color: string }>`
  background: ${({ $color }) => `${$color}15`};
  border: 1px solid ${({ $color }) => `${$color}25`};
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const GlowButton = styled(BaseButton)<{ $glowColor?: string }>`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  ${({ $glowColor }) => $glowColor && css`
    box-shadow: 0 0 20px ${$glowColor}40;
    
    &:hover {
      box-shadow: 0 0 30px ${$glowColor}60;
    }
  `}
`;

// ==============================================
// RESPONSIVE UTILITIES
// ==============================================

export const ResponsiveGrid = styled.div<{ 
  $minWidth?: string; 
  $gap?: string;
  $columns?: number;
}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ $minWidth = '300px' }) => $minWidth}, 1fr));
  gap: ${({ $gap = 'var(--spacing-xl)' }) => $gap};
  
  ${({ $columns }) => $columns && css`
    @media (min-width: 1200px) {
      grid-template-columns: repeat(${$columns}, 1fr);
    }
  `}
`;

export const MobileStack = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    
    > * {
      width: 100%;
    }
  }
`;

// ==============================================
// ENHANCED CARD VARIANTS
// ==============================================

export const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

export const InteractiveCard = styled(GlassCard)`
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  &:active {
    transform: translateY(-2px) scale(0.99);
  }
`;

// ==============================================
// EXPORT CLEAN ALIASES
// ==============================================

export {
  FlexRow,
  FlexColumn,
  Grid,
  BaseButton,
  Badge,
  Card,
  CardContent
} from '@/styles/styled-components';