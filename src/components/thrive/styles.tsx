// src/components/thrive/styles.tsx
'use client';

import styled, { keyframes } from 'styled-components';
import { 
  Container, Header, Card, Badge 
} from '@/styles/styled-components';

// ==============================================
// ANIMATIONS
// ==============================================

export const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

export const slideInRight = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ==============================================
// LAYOUT COMPONENTS
// ==============================================

export const PageWrapper = styled.div`
  width: 100%;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  min-height: 100vh;
  overflow-x: hidden;
`;

export const ContentContainer = styled(Container)`
  padding-bottom: var(--spacing-3xl);
  max-width: 1400px;
  margin: 0 auto;
`;

// ==============================================
// HERO & HEADER COMPONENTS
// ==============================================

export const HeroHeader = styled(Header)`
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.05) 0%,
    rgba(102, 126, 234, 0.02) 100%
  );
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--spacing-xl) 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      var(--color-primary-500),
      var(--color-primary-600),
      var(--color-primary-500)
    );
    animation: ${shimmer} 3s infinite;
  }
`;

export const EnhancedHeroSection = styled.section`
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.03) 0%, 
    rgba(139, 92, 246, 0.03) 100%
  );
  position: relative;
  overflow: hidden;
  padding: var(--spacing-3xl) 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

// ==============================================
// NAVIGATION & TASKBAR
// ==============================================

export const AssessmentTaskbar = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) 0;
  border-bottom: 2px solid var(--color-border-light);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: var(--spacing-xs);
    padding: var(--spacing-md) 0;
  }
`;

export const TaskbarButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active 
    ? 'var(--color-primary-500)' 
    : 'transparent'};
  border: 1px solid ${props => props.$active 
    ? 'var(--color-primary-500)' 
    : 'var(--color-border-medium)'};
  color: ${props => props.$active 
    ? 'white' 
    : 'var(--color-text-secondary)'};
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-family: var(--font-body);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  font-weight: ${props => props.$active ? 500 : 400};
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  white-space: nowrap;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: ${props => props.$active ? '100%' : '0'};
    height: 2px;
    background: var(--color-primary-500);
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.$active 
      ? 'var(--color-primary-600)' 
      : 'var(--color-background-tertiary)'};
    border-color: var(--color-primary-500);
    color: ${props => props.$active 
      ? 'white' 
      : 'var(--color-primary-500)'};
    transform: translateY(-1px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// ==============================================
// ASSESSMENT CARDS
// ==============================================

export const AssessmentGrid = styled.div`
  display: grid;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  animation: ${slideInRight} 0.5s ease-out;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const AssessmentCardWrapper = styled.div<{ $borderColor?: string }>`
  display: block;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
  text-decoration: none;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--color-border-light);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$borderColor || 'var(--color-primary-500)'};
    transition: width 0.3s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    background: var(--color-background-tertiary);
    border-color: ${props => props.$borderColor || 'var(--color-primary-500)'};
    
    &::before {
      width: 100%;
      opacity: 0.1;
    }
    
    &::after {
      left: 100%;
    }
    
    .arrow-icon {
      transform: translateX(4px);
    }
  }
`;

export const AssessmentTitle = styled.h3`
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const AssessmentDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin: 0 0 var(--spacing-md) 0;
`;

export const AssessmentMeta = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

export const SkillIcon = styled.div<{ $type: string }>`
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    const gradients: Record<string, string> = {
      code: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      analytics: 'linear-gradient(135deg, #10b981, #059669)',
      management: 'linear-gradient(135deg, #f59e0b, #d97706)',
      design: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      marketing: 'linear-gradient(135deg, #ef4444, #dc2626)',
      cloud: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    };
    return gradients[props.$type] || gradients.code;
  }};
  color: white;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

// ==============================================
// STATS & METRICS
// ==============================================

export const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-2xl) 0;
`;

export const StatCard = styled(Card)`
  text-align: center;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0.05) 0%, 
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    
    &::before {
      opacity: 1;
    }
  }
`;

export const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-display);
  animation: ${pulse} 3s ease-in-out infinite;
`;

export const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
`;

// ==============================================
// UI COMPONENTS
// ==============================================

export const DifficultyBadge = styled(Badge)<{ $difficulty: string }>`
  background: ${props => {
    const colors: Record<string, string> = {
      beginner: 'linear-gradient(135deg, #10b981, #059669)',
      intermediate: 'linear-gradient(135deg, #f59e0b, #d97706)', 
      expert: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };
    return colors[props.$difficulty] || '#6b7280';
  }};
  color: white;
  border: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CategoryTabs = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-xs);
  background: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  overflow-x: auto;
  
  button {
    padding: var(--spacing-sm) var(--spacing-lg);
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    position: relative;
    
    &.active {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      box-shadow: var(--shadow-sm);
    }
    
    &:hover:not(.active) {
      color: var(--color-text-primary);
    }
    
    &.active::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      width: 80%;
      height: 2px;
      background: var(--color-primary-500);
      transform: translateX(-50%);
    }
  }
`;

export const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  
  .pulse {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

// ==============================================
// LEADERBOARD
// ==============================================

export const LeaderboardCard = styled(Card)`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
`;

export const LeaderboardItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background: ${props => props.$rank <= 3 ? 'var(--glass-background)' : 'transparent'};
  border: 1px solid ${props => props.$rank <= 3 ? 'var(--glass-border)' : 'transparent'};
  margin-bottom: var(--spacing-md);
  transition: var(--transition-normal);
  
  &:hover {
    background: var(--glass-background);
    border-color: var(--glass-border);
    transform: translateY(-2px);
  }
`;

export const RankBadge = styled.div<{ $rank: number }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #9ca3af, #6b7280)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #d97706, #92400e)';
    return 'var(--color-background-tertiary)';
  }};
  color: ${props => props.$rank <= 3 ? 'white' : 'var(--color-text-primary)'};
  margin-right: var(--spacing-lg);
  box-shadow: ${props => props.$rank <= 3 ? 'var(--shadow-md)' : 'var(--shadow-sm)'};
`;

// ==============================================
// BANNERS & ALERTS
// ==============================================

export const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(5, 150, 105, 0.05) 100%
  );
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  animation: ${fadeIn} 0.5s ease-out;
`;

export const WelcomeContent = styled.div`
  margin-bottom: var(--spacing-lg);
`;

export const WelcomeBannerTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-primary);
`;

export const WelcomeBannerText = styled.p`
  color: var(--color-text-secondary);
  margin: 0;
`;

export const WelcomeActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

export const AssessmentButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: ${props => props.$variant === 'primary' 
    ? 'var(--color-primary-500)' 
    : 'transparent'};
  color: ${props => props.$variant === 'primary' 
    ? 'white' 
    : 'var(--color-primary-500)'};
  border: 1px solid var(--color-primary-500);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'primary' 
      ? 'var(--color-primary-600)' 
      : 'var(--color-primary-50)'};
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ==============================================
// GLASS MORPHISM SECTIONS
// ==============================================

export const GlassSection = styled.section`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  margin: var(--spacing-3xl) 0;
  padding: var(--spacing-3xl) var(--spacing-xl);
`;

export const CTASection = styled(GlassSection)`
  text-align: center;
  background: linear-gradient(135deg, var(--glass-background), rgba(59, 130, 246, 0.05));
`;