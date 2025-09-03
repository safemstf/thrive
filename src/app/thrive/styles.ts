// src/app/thrive/styles.ts - Theme-Consistent Thrive Styles
import styled, { keyframes, css } from 'styled-components';
import {
  Card, BaseButton, Badge, Grid, FlexRow, FlexColumn, HeroSection,
  Heading1, Heading2, BodyText, Container, animationUtils, glassEffect,
  textGradient, hoverLift
} from '@/styles/styled-components';

// ==============================================
// ENHANCED HERO SECTION WITH FLOATING ELEMENTS
// ==============================================
export const EnhancedHeroSection = styled(HeroSection)`
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at top, rgba(139, 92, 246, 0.08) 0%, transparent 70%),
              radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.06) 0%, transparent 70%),
              radial-gradient(ellipse at bottom right, rgba(16, 185, 129, 0.04) 0%, transparent 70%),
              linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%);
  border-bottom: 1px solid var(--color-border-light);
  
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    z-index: 0;
    animation: ${animationUtils.float} 20s ease-in-out infinite;
  }
  
  &::before {
    top: 10%;
    right: 10%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  }
  
  &::after {
    bottom: 10%;
    left: 5%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
    animation-direction: reverse;
    animation-duration: 15s;
  }
`;

export const HeroBadge = styled(Badge)`
  background: var(--color-background-elevated);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-lg);
  animation: ${animationUtils.slideUp} 0.6s ease-out;
  color: var(--color-text-primary);
`;

export const HeroTitle = styled(Heading1)`
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.2s both;
`;

export const HeroSubtitle = styled(BodyText)`
  font-size: var(--font-size-xl);
  max-width: 900px;
  margin: 0 auto var(--spacing-xl) auto;
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.4s both;
  color: var(--color-text-secondary);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
  }
`;

export const GradientText = styled.span`
  ${textGradient}
`;

// ==============================================
// PREMIUM STATS COMPONENTS
// ==============================================
export const StatsOverview = styled(Grid)`
  margin-bottom: var(--spacing-2xl);
`;

export const StatCard = styled(Card)`
  text-align: center;
  background: var(--color-background-elevated);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--color-primary-400);
  }
`;

export const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  font-family: var(--font-display);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
`;

export const StatLabel = styled.div`
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

export const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  margin: 0 auto var(--spacing-md);
  background: linear-gradient(135deg, ${({ $color }) => $color}30, ${({ $color }) => $color}15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${({ $color }) => $color};
  }
`;

export const LiveIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-success-600);
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--color-success-600);
    border-radius: 50%;
    animation: ${animationUtils.pulse} 2s infinite;
  }
`;

export const ProgressIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-success-600);
  
  .pulse {
    width: 8px;
    height: 8px;
    background: var(--color-success-600);
    border-radius: 50%;
    animation: ${animationUtils.pulse} 2s infinite;
  }
`;

// ==============================================
// ASSESSMENT CARD SYSTEM
// ==============================================
export const AssessmentGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: var(--spacing-xl);
`;

export const AssessmentCardWrapper = styled(Card) <{ $borderColor?: string }>`
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: var(--color-background-elevated);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid ${({ $borderColor }) => $borderColor ? `${$borderColor}60` : 'var(--color-border-light)'};
  box-shadow: var(--shadow-lg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: ${({ $borderColor }) =>
    $borderColor ? `linear-gradient(180deg, ${$borderColor}08 0%, transparent 100%)` :
      'linear-gradient(180deg, var(--color-primary-500)08 0%, transparent 100%)'
  };
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: ${({ $borderColor }) => $borderColor || 'var(--color-primary-500)'};
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

export const AssessmentIcon = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-lg);
  background: radial-gradient(circle, ${({ $color }) => $color}20 0%, ${({ $color }) => $color}08 70%, transparent 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease;
  
  .assessment-card:hover & {
    transform: scale(1.1);
  }
`;

export const AssessmentIconInner = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: var(--color-background-secondary);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $color }) => `${$color}40`};
  
  svg {
    color: ${({ $color }) => $color};
  }
`;

export const AssessmentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
`;

export const AssessmentDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
`;

export const AssessmentMeta = styled.div`
  background: var(--color-background-secondary);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
`;

export const AssessmentAction = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${({ $color }) => $color}08, ${({ $color }) => $color}04);
  border: 1px solid ${({ $color }) => `${$color}20`};
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
`;

export const PopularBadge = styled.div<{ $color: string }>`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-background-elevated);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${({ $color }) => $color};
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  border: 1px solid ${({ $color }) => `${$color}40`};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ValidatedBadge = styled.div`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-success-500)15;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--color-success-600);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  border: 1px solid var(--color-success-500)30;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// ==============================================
// CATEGORY NAVIGATION
// ==============================================
export const CategoryTabs = styled(FlexRow)`
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
`;

export const CategoryTab = styled(BaseButton) <{ $isActive: boolean }>`
  ${({ $isActive }) => $isActive ? css`
    background: var(--color-primary-500);
    color: white;
    box-shadow: var(--shadow-lg);
  ` : css`
    background: var(--color-background-elevated);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--color-border-light);
    color: var(--color-text-primary);
    
    &:hover {
      background: var(--color-primary-500)20;
      transform: translateY(-2px);
    }
  `}
  
  transition: all 0.3s ease;
`;

// ==============================================
// LEADERBOARD SYSTEM
// ==============================================
export const LeaderboardCard = styled(Card) <{ $padding?: string }>`
  background: var(--color-background-elevated);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  padding: ${({ $padding = 'lg' }) => `var(--spacing-${$padding})`};
`;

export const LeaderboardItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  
  ${({ $rank }) => $rank <= 3 ? css`
    background: var(--color-primary-500)15;
    border: 1px solid var(--color-primary-500)30;
  ` : css`
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-light);
  `}
  
  &:hover {
    transform: translateX(8px);
    box-shadow: var(--shadow-md);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const RankBadge = styled.div<{ $rank: number }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  border: 3px solid var(--color-background-secondary);
  box-shadow: var(--shadow-md);
  
  ${({ $rank }) => {
    if ($rank === 1) return css`background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1f2937;`;
    if ($rank === 2) return css`background: linear-gradient(135deg, #d1d5db, #9ca3af); color: #1f2937;`;
    if ($rank === 3) return css`background: linear-gradient(135deg, #fdba74, #fb923c); color: #1f2937;`;
    return css`
      background: linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400)); 
      color: white;
    `;
  }}
`;

// ==============================================
// CTA AND FEATURE COMPONENTS
// ==============================================
export const CTASection = styled(Card)`
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--color-primary-500)10;
  margin: var(--spacing-xl) auto;
  max-width: 900px;
  border: 1px solid var(--color-primary-500)30;
  box-shadow: var(--shadow-xl);
  position: relative;
  border-radius: var(--radius-xl);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, var(--color-primary-500)08 0%, transparent 70%);
    pointer-events: none;
    border-radius: inherit;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

export const FeatureCard = styled(Card)`
  background: var(--color-background-elevated);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--color-primary-400);
  }
`;

export const FeatureIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--color-background-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  border: 2px solid ${({ $color }) => $color};
  transition: transform 0.3s ease;
  
  .feature-card:hover & {
    transform: scale(1.1);
  }
  
  svg {
    color: ${({ $color }) => $color};
  }
`;

// ==============================================
// UTILITY COMPONENTS
// ==============================================
export const MetricRow = styled(FlexRow)`
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const MetricItem = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const AnimatedCounter = styled.span`
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
`;

export const PlayerInfo = styled(FlexColumn)`
  flex: 1;
`;

export const PlayerName = styled.span`
  font-weight: 600;
  color: var(--color-text-primary);
`;

export const PlayerScore = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

// ==============================================
// EXPORT ALIASES FOR COMPATIBILITY
// ==============================================
export const PageWrapper = Container;
export const ContentContainer = Container;
export const ContentWrapper = Container;
export const Section = styled.section`
  margin-bottom: var(--spacing-3xl);
`;

// Clean re-exports from the hub
export {
  // Layout
  FlexRow,
  FlexColumn,
  Grid,

  // Typography  
  Heading1,
  Heading2,
  BodyText,

  // Interactive
  BaseButton,
  Card,
  CardContent,
  Badge,

  // Utility
  LoadingContainer,
  Spacer,
  Divider,
} from '@/styles/styled-components';