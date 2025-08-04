// src/components/dashboard/enhancedStyles.tsx - Modern Dashboard Styles
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/styles/theme';

// Enhanced animations
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Welcome Card - Hero section
export const WelcomeCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${theme.shadows.sm};
  animation: ${slideInUp} 0.5s ease-out;
  
  h3 {
    margin: 0 0 ${theme.spacing.xs} 0;
    font-size: ${theme.typography.sizes.lg};
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
  }
  
  p {
    margin: 0;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.sizes.sm};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    text-align: center;
  }
`;

// Enhanced Metrics Grid
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  animation: ${slideInUp} 0.6s ease-out 0.1s both;
`;

export const MetricCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  transition: all 0.3s ease;
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

export const MetricIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.3s ease;
  
  ${MetricCard}:hover & {
    background: ${props => `${props.$color}25`};
    transform: scale(1.05);
  }
`;

export const MetricContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const MetricValue = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  line-height: 1;
`;

export const MetricLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
  margin-bottom: 0.25rem;
`;

export const MetricTrend = styled.div<{ $positive?: boolean }>`
  font-size: ${theme.typography.sizes.xs};
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-weight: ${theme.typography.weights.semibold};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Progress Ring Component
export const ProgressRing = styled.div<{ $percentage: number; $size?: number }>`
  width: ${props => props.$size || 48}px;
  height: ${props => props.$size || 48}px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0deg ${props => (props.$percentage / 100) * 360}deg,
    #e5e7eb ${props => (props.$percentage / 100) * 360}deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: white;
  }
  
  &::after {
    content: '${props => props.$percentage}%';
    position: absolute;
    font-size: ${props => (props.$size || 48) * 0.25}px;
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
    z-index: 1;
  }
`;

// Main Grid Layout
export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: ${theme.spacing.xl};
  animation: ${slideInUp} 0.7s ease-out 0.2s both;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const PrimarySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const SecondarySections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

// Activity Feed
export const ActivityFeed = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(248, 250, 252, 0.5);
    margin: 0 -${theme.spacing.sm};
    padding: ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.sm};
    transform: translateX(2px);
  }
`;

export const ActivityIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.sm};
  background: ${props => {
    switch (props.$type) {
      case 'upload': return 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
      case 'view': return 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
      case 'like': return 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)';
      case 'comment': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'skill': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'achievement': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;
`;

export const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ActivityTitle = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  font-size: ${theme.typography.sizes.sm};
  line-height: 1.3;
`;

export const ActivityTime = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.muted};
  font-weight: ${theme.typography.weights.medium};
  flex-shrink: 0;
`;

// Quick Actions
export const QuickActionsGrid = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  
  h4 {
    margin: 0 0 ${theme.spacing.md} 0;
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
  }
`;

export const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  cursor: pointer;
  background: rgba(255, 255, 255, 0.4);
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const QuickActionIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: ${theme.borderRadius.sm};
  transition: all ${theme.transitions.fast};
  flex-shrink: 0;
  
  ${QuickAction}:hover & {
    background: ${props => `${props.$color}25`};
    transform: scale(1.05);
  }
`;

export const QuickActionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const QuickActionTitle = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  font-size: ${theme.typography.sizes.sm};
`;

export const QuickActionDescription = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  line-height: 1.3;
`;

// Insights Card
export const InsightsCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  
  h4 {
    margin: 0 0 ${theme.spacing.md} 0;
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
  }
`;

export const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const InsightItem = styled.div<{ $priority: 'high' | 'medium' | 'low' }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  background: ${props => {
    switch (props.$priority) {
      case 'high': return 'rgba(239, 68, 68, 0.05)';
      case 'medium': return 'rgba(245, 158, 11, 0.05)';
      default: return 'rgba(59, 130, 246, 0.05)';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.$priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#3b82f6';
    }
  }};
`;

export const InsightIcon = styled.div`
  color: ${theme.colors.text.secondary};
  margin-top: 2px;
  flex-shrink: 0;
`;

export const InsightText = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.primary};
  line-height: 1.4;
`;

// Portfolio Preview
export const PortfolioPreview = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  
  h3 {
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
  }
`;

export const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
`;

export const PreviewItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: ${theme.shadows.md};
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: ${theme.spacing.sm};
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${PreviewItem}:hover & {
    opacity: 1;
  }
`;

export const PreviewTitle = styled.div`
  color: white;
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
`;

// Skills Snapshot
export const SkillsSnapshot = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  
  h4 {
    margin: 0 0 ${theme.spacing.md} 0;
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
  }
`;

export const SkillItem = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SkillName = styled.div`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
`;

export const SkillLevel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  color: #3b82f6;
`;

export const SkillProgress = styled.div`
  height: 4px;
  background: ${theme.colors.border.light};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.25rem;
`;

export const SkillProgressBar = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  transition: width 0.8s ease;
`;

// Achievements Banner
export const AchievementsBanner = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  
  h4 {
    margin: 0 0 ${theme.spacing.md} 0;
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.semibold};
    color: ${theme.colors.text.primary};
  }
`;

export const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const AchievementIcon = styled.div<{ $rarity: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$rarity) {
      case 'epic': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'rare': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;`