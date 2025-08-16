// src/components/dashboard/dashboardStyles.tsx - Lean & Reusable
import styled, { css } from 'styled-components';

// Import existing components - no duplication!
import {
  Grid,
  Card,
  CardContent,
  Badge,
  BaseButton,
  PageContainer,
  Container,
  FlexRow,
  FlexColumn,
  Heading1,
  Heading2,
  Heading3,
  BodyText,
  LoadingSpinner,
  LoadingContainer,
  ErrorContainer,
  fadeIn,
  float,
  responsive
} from '@/styles/styled-components';

// ===========================================
// DASHBOARD-SPECIFIC COMPONENTS ONLY
// ===========================================

// Tool Components
export const ToolGrid = styled(Grid).attrs({ 
  $minWidth: '300px', 
  $gap: 'var(--spacing-xl)' 
})``;

export const ToolCard = styled(Card).attrs({ $hover: true, $padding: 'lg' })``;

export const ToolIcon = styled.div<{ $status?: 'active' | 'pending' | 'inactive' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  
  ${({ $status = 'inactive' }) => {
    switch ($status) {
      case 'active':
        return css`
          background: var(--color-primary-500);
          color: white;
        `;
      case 'pending':
        return css`
          background: #f59e0b;
          color: white;
        `;
      default:
        return css`
          background: var(--color-background-tertiary);
          color: var(--color-text-secondary);
        `;
    }
  }}
`;

export const ToolActionButton = styled(BaseButton).attrs({ $variant: 'ghost', $size: 'sm' })<{ 
  $status?: 'active' | 'pending' | 'inactive' 
}>`
  ${({ $status = 'inactive' }) => {
    switch ($status) {
      case 'active':
        return css`
          color: var(--color-primary-600);
          &:hover { background: rgba(59, 130, 246, 0.1); }
        `;
      case 'pending':
        return css`
          color: #f59e0b;
          &:hover { background: rgba(245, 158, 11, 0.1); }
        `;
      default:
        return css`
          color: var(--color-text-secondary);
          cursor: not-allowed;
          opacity: 0.7;
        `;
    }
  }}
`;

// Filter Components
export const FilterContainer = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $gap: 'var(--spacing-md)' 
})`
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
`;

export const FilterSelect = styled.select`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    border-color: var(--color-border-dark);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// Metric Components
export const MetricCard = styled(Card).attrs({ $padding: 'lg' })``;

export const MetricLabel = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--spacing-xs);
`;

export const MetricValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
`;

export const MetricChange = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: ${({ $positive }) => $positive ? '#10b981' : '#ef4444'};
  margin-top: var(--spacing-sm);
`;

export const ChartContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 300px;
`;

// Dashboard Header Components
export const DashboardHeader = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  margin-bottom: var(--spacing-2xl);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  animation: ${fadeIn} 0.4s ease-out;
`;

export const WelcomeSection = styled(FlexColumn).attrs({ $gap: 'var(--spacing-sm)' })`
  flex: 1;
`;

export const WelcomeTitle = styled(Heading1)`
  margin: 0 0 var(--spacing-xs) 0;
  
  ${responsive.below.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const WelcomeSubtitle = styled(BodyText)`
  margin: 0;
  line-height: 1.4;
`;

// View Toggle
export const ViewToggle = styled(FlexRow).attrs({ $gap: '4px' })`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  padding: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  
  ${responsive.below.md} {
    width: 100%;
  }
`;

export const ViewButton = styled(BaseButton).attrs({ $size: 'sm' })<{ $active: boolean }>`
  padding: 0.5rem 0.875rem;
  border-radius: 6px;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
      : 'transparent'
  };
  color: ${({ $active }) => $active ? 'var(--color-primary-600)' : 'var(--color-text-secondary)'};
  font-weight: ${({ $active }) => $active ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
  box-shadow: ${({ $active }) => $active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
        : 'rgba(255, 255, 255, 0.5)'
    };
  }
  
  ${responsive.below.md} {
    flex: 1;
    justify-content: center;
  }
`;

// Stats Components
export const StatsGrid = styled(Grid).attrs({ $responsive: true })`
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  
  ${responsive.below.lg} {
    grid-template-columns: 1fr 1fr;
  }
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
  }
`;

export const MainStatCard = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
`;

export const StatCard = styled(Card).attrs({ $padding: 'md', $hover: true })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const StatHeader = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-sm)', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-md);
`;

export const StatIcon = styled.div<{ $color?: string; $gradient?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  
  ${({ $gradient, $color }) => {
    if ($gradient) {
      return css`
        background: ${$gradient};
        color: white;
        box-shadow: var(--shadow-sm);
      `;
    }
    return css`
      background: ${$color ? `${$color}20` : 'rgba(59, 130, 246, 0.1)'};
      color: ${$color || 'var(--color-primary-600)'};
    `;
  }}
`;

export const StatTitle = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--spacing-xs);
`;

export const StatProgress = styled.div`
  margin-top: var(--spacing-sm);
`;

export const ProgressBar = styled.div`
  height: 6px;
  background: var(--color-border-light);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  transition: width 0.6s ease;
`;

export const ProgressText = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
  font-weight: var(--font-weight-medium);
`;

// Content Layout
export const ContentGrid = styled(Grid).attrs({ 
  $columns: 2, 
  $gap: 'var(--spacing-lg)' 
})`
  grid-template-columns: 1.2fr 0.8fr;
  
  ${responsive.below.lg} {
    grid-template-columns: 1fr;
  }
`;

export const DashboardContent = styled(FlexColumn).attrs({ $gap: 'var(--spacing-xl)' })`
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

// Section Components
export const Section = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
`;

export const SectionHeader = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
`;

export const SectionTitle = styled(Heading3)`
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const SectionActions = styled(FlexRow).attrs({ $gap: 'var(--spacing-xs)' })``;

export const ActionButton = styled(BaseButton)<{ $primary?: boolean }>`
  ${({ $primary }) => $primary && css`
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    color: white;
  `}
`;

export const ViewAllLink = styled.a`
  font-size: var(--font-size-xs);
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--color-primary-700);
  }
`;

// Activity Components
export const ActivityList = styled(FlexColumn).attrs({ $gap: 'var(--spacing-sm)' })``;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  
  &:hover {
    background: rgba(248, 250, 252, 0.6);
    transform: translateX(2px);
  }
`;

export const ActivityIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: white;
  box-shadow: var(--shadow-sm);
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'gallery_upload': return 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))';
      case 'concept_complete': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'project_create': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'achievement_unlock': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))';
    }
  }};
`;

export const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ActivityTitle = styled.div`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 2px;
  font-size: var(--font-size-xs);
`;

export const ActivityDescription = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.3;
  margin-bottom: var(--spacing-xs);
`;

export const ActivityMetadata = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-xs)', 
  $wrap: true 
})``;

export const MetadataTag = styled(Badge)`
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary-600);
  font-size: var(--font-size-xs);
  padding: 0.125rem 0.375rem;
`;

export const ActivityTime = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
`;

// Quick Actions
export const QuickActionGrid = styled(FlexColumn).attrs({ $gap: '0.5rem' })``;

export const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.75rem;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: var(--transition-fast);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  
  &:hover {
    border-color: var(--color-primary-500);
    background: rgba(248, 250, 252, 0.6);
    transform: translateY(-1px);
  }
`;

export const QuickActionIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary-600);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  
  ${QuickAction}:hover & {
    background: rgba(59, 130, 246, 0.2);
  }
`;

export const QuickActionContent = styled.div`
  flex: 1;
`;

export const QuickActionTitle = styled.div`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 2px;
  font-size: var(--font-size-xs);
`;

export const QuickActionDescription = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.3;
`;

export const QuickActionArrow = styled.div`
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
  
  ${QuickAction}:hover & {
    color: var(--color-primary-600);
    transform: translateX(2px);
  }
`;

// Portfolio Creation Components  
export const CreatePortfolioSection = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-lg);
  animation: ${fadeIn} 0.6s ease-out;
`;

export const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3lg);
`;

export const CreateIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: 50%;
  color: white;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  animation: ${float} 4s ease-in-out infinite;
`;

export const CreateTitle = styled(Heading2)`
  margin: 0 0 var(--spacing-md) 0;
`;

export const CreateDescription = styled(BodyText)`
  max-width: 500px;
  margin: 0 auto;
`;

export const PortfolioTypes = styled(Grid).attrs({ 
  $minWidth: '280px', 
  $gap: 'var(--spacing-lg)' 
})``;

export const PortfolioTypeCard = styled(Card).attrs({ $hover: true, $padding: 'lg' })`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  cursor: pointer;
  
  &:hover {
    border-color: var(--color-primary-500);
    transform: translateY(-2px);
  }
`;

export const TypeHeader = styled(FlexColumn).attrs({ 
  $gap: 'var(--spacing-md)', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-lg);
`;

export const TypeIcon = styled.div<{ $gradient: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${props => props.$gradient};
  border-radius: var(--radius-md);
  color: white;
  box-shadow: var(--shadow-sm);
`;

export const TypeTitle = styled(Heading3)`
  margin: 0;
  text-align: center;
`;

export const TypeDescription = styled(BodyText)`
  text-align: center;
  margin: 0 0 var(--spacing-lg) 0;
`;

export const TypeFeatures = styled(FlexColumn).attrs({ $gap: '0.5rem' })`
  margin-bottom: var(--spacing-lg);
`;

export const Feature = styled(FlexRow).attrs({ 
  $gap: '0.5rem', 
  $align: 'center' 
})`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  
  svg {
    color: var(--color-primary-600);
  }
`;

export const CreateButton = styled(BaseButton).attrs({ 
  $variant: 'primary', 
  $fullWidth: true 
})<{ $gradient?: string }>`
  ${({ $gradient }) => $gradient && css`
    background: ${$gradient};
  `}
`;

// Empty State
export const EmptyStateCard = styled(Card).attrs({ $padding: 'lg' })`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(248, 250, 252, 0.6);
  border: 2px dashed var(--color-border-light);
`;

export const EmptyIcon = styled.div`
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  opacity: 0.6;
`;

export const EmptyTitle = styled(Heading3)`
  margin: 0 0 var(--spacing-xs) 0;
`;

export const EmptyMessage = styled(BodyText)`
  margin: 0 0 var(--spacing-md) 0;
  max-width: 300px;
`;

// Re-export existing components for convenience
export {
  Grid,
  Card, 
  CardContent,
  Badge,
  BaseButton,
  PageContainer,
  Container,
  FlexRow,
  FlexColumn,
  Heading1,
  Heading2, 
  Heading3,
  BodyText,
  LoadingSpinner,
  LoadingContainer,
  ErrorContainer
} from '@/styles/styled-components';