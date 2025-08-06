// src/components/dashboard/views/viewStyles.tsx
import styled from 'styled-components';
import { theme } from '@/styles/theme';

// Shared view components that extend base styles
export const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

export const ViewStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['2xl']};
`;

export const ViewStatCard = styled.div`
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const ViewStatIcon = styled.div<{ $gradient?: string; $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => props.$gradient || `${props.$color || '#3b82f6'}20`};
  color: ${props => props.$gradient ? 'white' : (props.$color || '#3b82f6')};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${props => props.$gradient ? theme.shadows.sm : 'none'};
`;

export const ViewStatContent = styled.div`
  flex: 1;
`;

export const ViewStatValue = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.xl};
  }
`;

export const ViewStatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

export const ViewGrid = styled.div<{ $minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${props => props.$minWidth || '280px'}, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ViewCard = styled.div<{ $status?: string; $borderColor?: string }>`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => 
    props.$borderColor || 
    (props.$status === 'completed' ? '#10b981' :
     props.$status === 'in-progress' ? '#f59e0b' :
     theme.colors.border.light)
  };
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
    border-color: #3b82f6;
  }
`;

export const ViewCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

export const ViewCardContent = styled.div`
  padding: ${theme.spacing.lg};
`;

export const ViewCardTitle = styled.h4`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.3;
`;

export const ViewCardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

export const ViewCardDescription = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.md};
`;

// Status indicators
export const StatusIndicator = styled.div<{ $status: string; $size?: 'sm' | 'md' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size === 'sm' ? '28px' : '36px'};
  height: ${props => props.$size === 'sm' ? '28px' : '36px'};
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#d1fae5';
      case 'in-progress': return '#fef3c7';
      case 'public': return '#dcfce7';
      case 'private': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#065f46';
      case 'in-progress': return '#92400e';
      case 'public': return '#166534';
      case 'private': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  }};
`;

// Tags and badges
export const ViewTag = styled.span<{ $variant?: 'primary' | 'success' | 'warning' | 'info' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  text-transform: capitalize;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'warning':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'info':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      default:
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
        `;
    }
  }}
`;

// Progress indicators
export const ProgressContainer = styled.div`
  margin: ${theme.spacing.sm} 0;
`;

export const ProgressBar = styled.div`
  height: 6px;
  background: ${theme.colors.border.light};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.xs};
`;

export const ProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: ${props => props.$color || 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'};
  transition: width 0.8s ease;
`;

export const ProgressText = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  text-align: right;
  font-weight: ${theme.typography.weights.semibold};
`;

// Action buttons
export const ViewActionGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

export const ViewAction = styled.button<{ $primary?: boolean; $variant?: 'secondary' | 'ghost' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => {
    if (props.$primary) return 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
    if (props.$variant === 'ghost') return 'transparent';
    return 'rgba(243, 244, 246, 0.8)';
  }};
  color: ${props => props.$primary ? 'white' : theme.colors.text.primary};
  border: 1px solid ${props => {
    if (props.$primary) return 'transparent';
    if (props.$variant === 'ghost') return 'transparent';
    return theme.colors.border.light;
  }};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$primary ? '0 4px 8px rgba(59, 130, 246, 0.3)' : theme.shadows.sm};
    background: ${props => {
      if (props.$primary) return 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
      if (props.$variant === 'ghost') return 'rgba(243, 244, 246, 0.5)';
      return 'rgba(255, 255, 255, 0.9)';
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Image containers for gallery
export const ViewImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
  border-radius: ${theme.borderRadius.md};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

export const ViewImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  opacity: 0;
  transition: opacity ${theme.transitions.normal};
  
  ${ViewCard}:hover & {
    opacity: 1;
  }
`;

export const ViewImageAction = styled.button`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;