// src/components/thrive/styles.tsx
'use client';

import styled, { keyframes } from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';
import { Card } from '@/styles/styled-components';

/* Animations */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

/* Welcome banner */
export const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, 
    ${themeUtils.alpha(theme.colors.primary[600], 0.08)},
    ${themeUtils.alpha(theme.colors.primary[400], 0.04)}
  );
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  animation: ${slideUp} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      ${themeUtils.alpha('#fff', 0.1)}, 
      transparent
    );
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`;

export const WelcomeContent = styled.div` flex: 1; `;
export const WelcomeBannerTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;
export const WelcomeBannerText = styled.p`
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;
export const WelcomeActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

/* Assessments */
export const AssessmentCard = styled(Card)<{ 
  $difficulty: 'novice' | 'intermediate' | 'expert' | 'master';
  $highlighted?: boolean;
}>`
  ${themeUtils.glass(0.95)}
  border: 2px solid ${props => {
    if (props.$highlighted) return theme.colors.primary[400];
    switch (props.$difficulty) {
      case 'novice': return theme.colors.primary[300];
      case 'intermediate': return theme.colors.primary[400];
      case 'expert': return theme.colors.primary[500];
      case 'master': return theme.colors.primary[600];
    }
  }};
  background: ${props => {
    const baseAlpha = props.$highlighted ? 0.08 : 0.04;
    switch (props.$difficulty) {
      case 'novice': return themeUtils.alpha(theme.colors.primary[300], baseAlpha);
      case 'intermediate': return themeUtils.alpha(theme.colors.primary[400], baseAlpha);
      case 'expert': return themeUtils.alpha(theme.colors.primary[500], baseAlpha);
      case 'master': return themeUtils.alpha(theme.colors.primary[600], baseAlpha);
    }
  }};
  border-radius: ${theme.borderRadius.xl};
  position: relative;
  transition: all ${theme.transitions.slow};
  transform: translateY(0);
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px ${themeUtils.alpha(theme.colors.primary[600], 0.25)};
    border-color: ${theme.colors.primary[400]};
  }
  
  &::before {
    content: '${props => props.$difficulty.toUpperCase()}';
    position: absolute;
    top: ${theme.spacing.md};
    right: ${theme.spacing.md};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => {
      switch (props.$difficulty) {
        case 'novice': return theme.colors.primary[300];
        case 'intermediate': return theme.colors.primary[400];
        case 'expert': return theme.colors.primary[500];
        case 'master': return theme.colors.primary[600];
      }
    }};
    color: ${props => props.$difficulty === 'novice' ? theme.colors.primary[700] : theme.colors.text.inverse};
    font-size: ${theme.typography.sizes.xs};
    font-weight: ${theme.typography.weights.bold};
    border-radius: ${theme.borderRadius.sm};
    letter-spacing: 0.05em;
    z-index: 2;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.$difficulty) {
        case 'novice': return 'linear-gradient(90deg, #10b981, #059669)';
        case 'intermediate': return 'linear-gradient(90deg, #f59e0b, #d97706)';
        case 'expert': return 'linear-gradient(90deg, #ef4444, #dc2626)';
        case 'master': return 'linear-gradient(90deg, #8b5cf6, #7c3aed)';
      }
    }};
    border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
  }

  ${props => props.$highlighted && `
    animation: ${pulse} 2s ease-in-out infinite;
    box-shadow: 0 0 30px ${themeUtils.alpha(theme.colors.primary[500], 0.3)};
  `}
`;

export const AssessmentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

export const AssessmentIcon = styled.div<{ $skillType?: string }>`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${theme.shadows.lg};
  flex-shrink: 0;
  transition: transform ${theme.transitions.slow};
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
  }
`;

export const AssessmentContent = styled.div` flex: 1; `;
export const AssessmentTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.secondary};
  line-height: ${theme.typography.lineHeights.tight};
`;
export const AssessmentDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

export const AssessmentMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.5)};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.glass};
  backdrop-filter: blur(10px);
`;

export const MetricItem = styled.div` text-align: center; `;
export const MetricValue = styled.div`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.secondary};
`;
export const MetricLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.weights.medium};
`;

export const AssessmentButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: all ${theme.transitions.slow};
  position: relative;
  overflow: hidden;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]});
    color: ${theme.colors.text.inverse};
    border: none;
    box-shadow: ${theme.shadows.lg};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, ${themeUtils.alpha('#fff', 0.2)}, transparent);
      transition: left 0.6s;
    }
    
    &:hover {
      background: linear-gradient(135deg, ${theme.colors.primary[700]}, ${theme.colors.primary[800]});
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.xl};
      
      &::before {
        left: 100%;
      }
    }
  ` : `
    ${themeUtils.glass(0.8)}
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border.glass};
    
    &:hover {
      background: ${theme.colors.background.tertiary};
      border-color: ${theme.colors.primary[400]};
      color: ${theme.colors.text.primary};
      transform: translateY(-1px);
    }
  `}
`;

/* Rankings */
export const RankingCard = styled(Card)`
  ${themeUtils.glass(0.95)}
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
`;

export const RankingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, 
    ${themeUtils.alpha(theme.colors.primary[600], 0.05)},
    ${themeUtils.alpha(theme.colors.primary[400], 0.02)}
  );
  border-bottom: 1px solid ${theme.colors.border.glass};
`;

export const RankingItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.glass};
  transition: all ${theme.transitions.slow};
  background: ${props => {
    if (props.$rank <= 3) {
      return themeUtils.alpha(theme.colors.primary[400], 0.04);
    }
    return 'transparent';
  }};
  
  &:hover {
    background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.5)};
    transform: translateX(8px);
    box-shadow: inset 4px 0 0 ${theme.colors.primary[400]};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const RankBadge = styled.div<{ $rank: number }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.bold};
  font-size: ${theme.typography.sizes.lg};
  flex-shrink: 0;
  
  background: ${props => {
    if (props.$rank === 1) return `linear-gradient(135deg, #fbbf24, #f59e0b)`;
    if (props.$rank === 2) return `linear-gradient(135deg, #d1d5db, #9ca3af)`;
    if (props.$rank === 3) return `linear-gradient(135deg, #fdba74, #fb923c)`;
    return `linear-gradient(135deg, ${theme.colors.primary[400]}, ${theme.colors.primary[500]})`;
  }};
  
  color: ${props => {
    if (props.$rank <= 3) return '#1f2937';
    return theme.colors.text.inverse;
  }};
  
  border: 3px solid ${theme.colors.background.secondary};
  box-shadow: ${theme.shadows.lg};
  transition: transform ${theme.transitions.normal};
  
  &:hover {
    transform: scale(1.1);
  }
`;

/* User info + badges */
export const UserInfo = styled.div` flex: 1; min-width: 0; `;
export const UserName = styled.div`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;
export const UserTitle = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;
export const UserSkills = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;
export const SkillBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  border: 1px solid ${themeUtils.alpha(theme.colors.primary[600], 0.2)};
`;
export const ScoreDisplay = styled.div` text-align: right; flex-shrink: 0; `;
export const OverallScore = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fonts.secondary};
`;
export const ScoreBreakdown = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
  font-family: monospace;
`;

/* Export animations in case other files need them */
export { slideUp, pulse, shimmer };
