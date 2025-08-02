// src/components/dashboard/dashboardStyles.tsx
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/styles/theme';

// Animations
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Layout Components
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, #e2e8f0 100%);
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing['2xl']};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) { 
    padding: ${theme.spacing.md}; 
  }
`;

// Header Components
export const Header = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  margin-bottom: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Dashboard Content Components
export const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing['2xl']};
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

// Stats Grid Components
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['2xl']};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MainStatCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.glass};
  border: 1px solid ${theme.glass.border};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  }
`;

export const StatCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

export const StatIcon = styled.div<{ $color?: string; $gradient?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => props.$gradient || `${props.$color}20`};
  color: ${props => props.$gradient ? 'white' : props.$color};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${props => props.$gradient ? theme.shadows.sm : 'none'};
  font-size: 1.5rem;
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.sm} 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const StatValue = styled.div`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.xl};
  }
`;

export const StatLabel = styled.div`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

export const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: ${theme.typography.sizes.xs};
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-weight: ${theme.typography.weights.semibold};
  margin-top: ${theme.spacing.xs};
`;

export const StatProgress = styled.div`
  margin-top: ${theme.spacing.md};
`;

export const ProgressBar = styled.div`
  height: 8px;
  background: ${theme.colors.border.light};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ProgressText = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  text-align: right;
  font-weight: ${theme.typography.weights.medium};
`;

// Content Grid Components
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: ${theme.spacing['2xl']};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Section Components
export const Section = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
`;

export const SectionTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const SectionActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const ActionButton = styled.button<{ $primary?: boolean; $variant?: 'primary' | 'secondary' | 'ghost' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: 0.625rem ${theme.spacing.md};
  background: ${props => {
    if (props.$primary || props.$variant === 'primary') {
      return 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
    }
    if (props.$variant === 'ghost') {
      return 'transparent';
    }
    return 'rgba(243, 244, 246, 0.8)';
  }};
  color: ${props => {
    if (props.$primary || props.$variant === 'primary') {
      return 'white';
    }
    return theme.colors.text.primary;
  }};
  border: 1px solid ${props => {
    if (props.$primary || props.$variant === 'primary') {
      return 'transparent';
    }
    if (props.$variant === 'ghost') {
      return theme.colors.border.medium;
    }
    return theme.colors.border.medium;
  }};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.body};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => {
      if (props.$primary || props.$variant === 'primary') {
        return 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
      }
      if (props.$variant === 'ghost') {
        return 'rgba(243, 244, 246, 0.5)';
      }
      return 'rgba(229, 231, 235, 0.8)';
    }};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

export const ViewAllLink = styled.a`
  font-size: ${theme.typography.sizes.sm};
  color: #3b82f6;
  text-decoration: none;
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

// Activity Components
export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.normal};
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(248, 250, 252, 0.8);
    border-color: ${theme.colors.border.medium};
    transform: translateX(4px);
  }
`;

export const ActivityIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  background: ${props => {
    switch (props.$type) {
      case 'gallery_upload': return 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
      case 'concept_complete': return 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';
      case 'project_create': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'achievement_unlock': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: ${theme.shadows.sm};
  font-size: 1.25rem;
`;

export const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ActivityTitle = styled.div`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
`;

export const ActivityDescription = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.sm};
`;

export const ActivityMetadata = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

export const MetadataTag = styled.span`
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: ${theme.typography.sizes.xs};
  padding: 0.25rem ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
`;

export const ActivityTime = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.muted};
  font-weight: ${theme.typography.weights.medium};
  flex-shrink: 0;
`;

// Quick Actions Components
export const QuickActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.md};
  text-decoration: none;
  transition: all ${theme.transitions.normal};
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: #3b82f6;
    background: rgba(248, 250, 252, 0.8);
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const QuickActionIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.normal};
  font-size: 1.5rem;
  
  ${QuickAction}:hover & {
    background: ${props => `${props.$color}25`};
    transform: scale(1.05);
  }
`;

export const QuickActionContent = styled.div`
  flex: 1;
`;

export const QuickActionTitle = styled.div`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
`;

export const QuickActionDescription = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
`;

export const QuickActionArrow = styled.div`
  color: ${theme.colors.text.muted};
  transition: all ${theme.transitions.normal};
  font-size: 1rem;
  
  ${QuickAction}:hover & {
    color: #3b82f6;
    transform: translateX(4px);
  }
`;

// Empty State Components
export const EmptyStateCard = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing['2xl']};
  text-align: center;
  background: rgba(248, 250, 252, 0.8);
  border-radius: ${theme.borderRadius.lg};
  border: 2px dashed ${theme.colors.border.dark};
`;

export const EmptyIcon = styled.div`
  color: ${theme.colors.text.muted};
  margin-bottom: ${theme.spacing.md};
  font-size: 3rem;
  animation: ${pulse} 2s infinite;
`;

export const EmptyTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

export const EmptyMessage = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.5;
  max-width: 400px;
;theme.shadows.glass};
  border: 1px solid ${theme.glass.border};
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.lg};
  }
`;

export const WelcomeSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
`;

export const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.xl};
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
  animation: ${float} 3s ease-in-out infinite;
`;

export const WelcomeTitle = styled.h1`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes['4xl']};
  color: ${theme.colors.text.primary};
  margin: 0;
  font-weight: ${theme.typography.weights.bold};
  
  @media (max-width: 768px) { 
    font-size: ${theme.typography.sizes['3xl']}; 
  }
`;

export const WelcomeSubtitle = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.text.secondary};
  margin: ${theme.spacing.xs} 0 0 0;
  line-height: 1.5;
`;

// View Toggle Components
export const ViewToggle = styled.div`
  display: flex;
  background: rgba(243, 244, 246, 0.9);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.md};
  padding: 6px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid ${theme.colors.border.light};
`;

export const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: 0.625rem ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
      : 'transparent'
  };
  color: ${({ $active }) => $active ? '#3b82f6' : theme.colors.text.secondary};
  font-weight: ${({ $active }) => $active ? theme.typography.weights.semibold : theme.typography.weights.medium};
  font-size: ${theme.typography.sizes.sm};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  box-shadow: ${({ $active }) => 
    $active 
      ? '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)' 
      : 'none'
  };
  transform: ${({ $active }) => $active ? 'translateY(-1px)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
        : 'rgba(255, 255, 255, 0.7)'
    };
    color: ${({ $active }) => $active ? '#3b82f6' : theme.colors.text.primary};
  }
  
  &:focus {
    outline: none;
    ring: 2px solid #3b82f6;
    ring-offset: 2px;
  }
`;

// Badge Components
export const Badge = styled.span<{ $variant?: 'primary' | 'secondary' | 'success' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  font-family: ${theme.typography.fonts.body};
  margin-left: ${theme.spacing.sm};
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        `;
      case 'warning':
        return css`
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        `;
      case 'secondary':
        return css`
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
        `;
      default:
        return css`
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
        `;
    }
  }}
`;

// Loading Components
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: ${theme.spacing.lg};
  animation: ${fadeInUp} 0.6s ease-out;
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${theme.colors.border.light};
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.h2`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xl};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.weights.semibold};
  margin: 0;
`;

export const LoadingSubtext = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  text-align: center;
`;

// Error Components
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: ${theme.spacing.md};
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
`;

export const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.md};
  animation: ${pulse} 2s infinite;
`;

export const ErrorTitle = styled.h2`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xl};
  color: #dc2626;
  margin: 0;
  font-weight: ${theme.typography.weights.semibold};
`;

export const ErrorMessage = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
`;

export const RetryButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.75rem ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.body};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  box-shadow: ${theme.shadows.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Create Portfolio Components
export const CreatePortfolioSection = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['3xl']};
  box-shadow: ${theme.shadows.lg};
  border: 1px solid ${theme.glass.border};
  animation: ${fadeInUp} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']};
  }
`;

export const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing['3xl']};
`;

export const CreateIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  color: white;
  margin-bottom: ${theme.spacing['2xl']};
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
  animation: ${float} 3s ease-in-out infinite;
  font-size: 2rem;
`;

export const CreateTitle = styled.h2`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes['4xl']};
  font-weight: ${theme.typography.weights.bold};
  margin: 0 0 ${theme.spacing.md} 0;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const CreateDescription = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xl};
  color: ${theme.colors.text.muted};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
`;

export const PortfolioTypes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

export const PortfolioTypeCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
    transform: translateY(-8px);
    
    &::before {
      opacity: 1;
    }
  }
`;

export const TypeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const TypeIcon = styled.div<{ $gradient: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${props => props.$gradient};
  border-radius: ${theme.borderRadius.xl};
  color: white;
  margin-bottom: ${theme.spacing.md};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-size: 2rem;
`;

export const TypeTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  text-align: center;
`;

export const TypeDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
  margin: 0 0 ${theme.spacing['2xl']} 0;
  text-align: center;
`;

export const TypeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: ${theme.spacing['2xl']};
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.light};
  
  span {
    color: #3b82f6;
    font-size: 1rem;
  }
`;

export const CreateButton = styled.button<{ $gradient: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.$gradient};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.base};
  font-family: ${theme.typography.fonts.body};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  box-shadow: ${theme.shadows.md};

  &:hover {
    opacity: 0.9;
    box-shadow: ${theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
