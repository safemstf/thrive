// src/components/dashboard/views/viewStyles.ts - Lean & Reusable
import styled from 'styled-components';

// Import existing components - no duplication!
import {
  Grid,
  Card,
  FlexRow,
  FlexColumn,
  BaseButton,
  Heading2,
  Heading3,
  BodyText,
  Badge,
  EmptyState,
  IconContainer,
  responsive
} from '@/styles/styled-components';

// ===========================================
// VIEW-SPECIFIC COMPONENTS ONLY
// ===========================================

// Base container for all views
export const ViewContainer = styled(FlexColumn).attrs({ $gap: 'var(--spacing-2xl)' })`
  width: 100%;
`;

// Stats grid for view statistics  
export const ViewStatsGrid = styled(Grid).attrs({ 
  $minWidth: '240px', 
  $gap: 'var(--spacing-xl)' 
})`
  margin-bottom: var(--spacing-2xl);
`;

// Individual stat card
export const ViewStatCard = styled(Card).attrs({ $hover: true, $glass: true })`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  
  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-background-secondary);
  }
`;

// Stat icon container
export const ViewStatIcon = styled(IconContainer)<{ $color?: string; $gradient?: string }>`
  ${({ $gradient, $color }) => {
    if ($gradient) {
      return `
        background: ${$gradient};
        color: white;
      `;
    }
    return `
      background: ${$color ? `${$color}20` : 'rgba(59, 130, 246, 0.1)'};
      color: ${$color || 'var(--color-primary-600)'};
      border: 1px solid ${$color ? `${$color}40` : 'rgba(59, 130, 246, 0.2)'};
    `;
  }}
`;

// Stat content wrapper
export const ViewStatContent = styled(FlexColumn).attrs({ $gap: 'var(--spacing-xs)' })`
  flex: 1;
`;

// Stat value display
export const ViewStatValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  line-height: 1.1;
`;

// Stat label
export const ViewStatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// Grid layout for view content
export const ViewGrid = styled(Grid)<{ $minWidth?: string }>`
  ${({ $minWidth = '320px' }) => `
    grid-template-columns: repeat(auto-fill, minmax(${$minWidth}, 1fr));
  `}
`;

// Individual view card
export const ViewCard = styled(Card).attrs({ $hover: true, $glass: true })`
  overflow: hidden;
  
  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-background-secondary);
  }
`;

// Card header section
export const ViewCardHeader = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-lg);
`;

// Card content wrapper
export const ViewCardContent = styled.div`
  padding: var(--spacing-xl);
`;

// Card title
export const ViewCardTitle = styled(Heading3)`
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: 0.025em;
`;

// Card description  
export const ViewCardDescription = styled(BodyText)`
  margin: 0 0 var(--spacing-lg) 0;
  line-height: 1.6;
`;

// Card metadata container
export const ViewCardMeta = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-sm)', 
  $wrap: true 
})`
  margin-bottom: var(--spacing-lg);
`;

// Tag component
export const ViewTag = styled(Badge)`
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// Status indicator
export const StatusIndicator = styled.div<{ $status?: 'completed' | 'in-progress' | 'not-started' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  
  ${({ $status = 'not-started' }) => {
    switch ($status) {
      case 'completed':
        return `
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #16a34a;
        `;
      case 'in-progress':
        return `
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #2563eb;
        `;
      default:
        return `
          background: var(--color-background-tertiary);
          border: 1px solid var(--color-border-medium);
          color: var(--color-text-secondary);
        `;
    }
  }}
`;

// Progress container
export const ProgressContainer = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-sm)', 
  $align: 'center' 
})`
  margin: var(--spacing-lg) 0;
`;

// Progress bar
export const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  overflow: hidden;
  backdrop-filter: blur(4px);
`;

// Progress fill
export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  transition: width var(--transition-normal);
  border-radius: var(--radius-sm);
`;

// Progress text
export const ProgressText = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  min-width: 3rem;
  text-align: right;
`;

// Action group for buttons
export const ViewActionGroup = styled(FlexRow).attrs({ $gap: 'var(--spacing-sm)' })`
  margin-top: var(--spacing-lg);
`;

// Primary action (reuses BaseButton)
export const ViewAction = styled(BaseButton)<{ $primary?: boolean }>`
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ $primary }) => $primary && `
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    color: white;
  `}
`;

// Image container for gallery items
export const ViewImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--color-background-tertiary);
  border-bottom: 1px solid var(--color-border-light);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

// Image overlay for actions
export const ViewImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-normal);
  
  ${ViewImageContainer}:hover & {
    opacity: 1;
  }
`;

// Image action button
export const ViewImageAction = styled(BaseButton).attrs({ $variant: 'ghost' })`
  width: 48px;
  height: 48px;
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text-primary);
  backdrop-filter: blur(8px);
  
  &:hover {
    background: var(--color-background-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

// Re-export existing components for convenience
export {
  Grid,
  Card,
  FlexRow,
  FlexColumn,
  BaseButton,
  Heading2,
  Heading3,
  BodyText,
  Badge,
  EmptyState,
  LoadingContainer,
  LoadingSpinner,
  ErrorContainer
} from '@/styles/styled-components';