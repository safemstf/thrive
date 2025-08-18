// src/components/dashboard/dashboardStyles.tsx - Updated with Theme System
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
// UPDATED DASHBOARD-SPECIFIC COMPONENTS
// ===========================================

// Dashboard Header Components
export const DashboardHeader = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  margin-bottom: var(--spacing-2xl);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
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

// UPDATED View Toggle - Using Theme System
export const ViewToggle = styled(FlexRow).attrs({ $gap: 'var(--spacing-xs)' })`
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
  
  ${responsive.below.md} {
    width: 100%;
  }
`;

export const ViewButton = styled(BaseButton).attrs({ $size: 'sm' })<{ $active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: none;
  background: ${({ $active }) => 
    $active 
      ? 'var(--color-background-secondary)' 
      : 'transparent'
  };
  color: ${({ $active }) => 
    $active 
      ? 'var(--color-text-primary)' 
      : 'var(--color-text-secondary)'
  };
  font-weight: ${({ $active }) => 
    $active 
      ? 'var(--font-weight-semibold)' 
      : 'var(--font-weight-medium)'
  };
  box-shadow: ${({ $active }) => 
    $active 
      ? 'var(--shadow-sm)' 
      : 'none'
  };
  transition: var(--transition-fast);
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'var(--color-background-secondary)' 
        : 'var(--color-background-tertiary)'
    };
    color: ${({ $active }) => 
      $active 
        ? 'var(--color-text-primary)' 
        : 'var(--color-text-primary)'
    };
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${responsive.below.md} {
    flex: 1;
    justify-content: center;
  }
`;

// Stats Components - Updated colors
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
  border: 1px solid var(--glass-border);
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-500);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

export const StatCard = styled(Card).attrs({ $padding: 'md', $hover: true })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  transition: var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary-500);
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
  transition: var(--transition-normal);
  
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
      border: 1px solid ${$color ? `${$color}40` : 'var(--color-primary-200)'};
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
  background: var(--color-background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  transition: width 0.6s ease;
  border-radius: var(--radius-full);
`;

export const ProgressText = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
  font-weight: var(--font-weight-medium);
`;

// Metric Components - Updated
export const MetricValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
  font-family: var(--font-mono);
`;

export const MetricLabel = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--spacing-xs);
`;

export const MetricChange = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: ${({ $positive }) => 
    $positive ? 'var(--color-success-600)' : 'var(--color-error-600)'};
  margin-top: var(--spacing-sm);
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

// Section Components - Updated
export const Section = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-300);
  }
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
  color: var(--color-text-primary);
`;

// Activity Components - Updated
export const ActivityList = styled(FlexColumn).attrs({ $gap: 'var(--spacing-sm)' })``;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  border: 1px solid transparent;
  
  &:hover {
    background: var(--color-background-tertiary);
    border-color: var(--color-border-light);
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
  flex-shrink: 0;
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'gallery_upload': 
      case 'gallery':
        return 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))';
      case 'concept_complete': 
      case 'learning':
        return 'linear-gradient(135deg, var(--color-success-500), var(--color-success-600))';
      case 'project_create': 
      case 'portfolio':
        return 'linear-gradient(135deg, var(--color-purple-500), var(--color-purple-600))';
      case 'achievement_unlock': 
      case 'achievement':
        return 'linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600))';
      default: 
        return 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))';
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
  font-size: var(--font-size-sm);
`;

export const ActivityDescription = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: var(--spacing-xs);
`;

export const ActivityTime = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
`;

// Quick Actions - Updated
export const QuickActionGrid = styled(FlexColumn).attrs({ $gap: '0.5rem' })``;

export const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: var(--transition-fast);
  cursor: pointer;
  background: var(--color-background-secondary);
  
  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-background-tertiary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const QuickActionIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  border: 1px solid var(--color-primary-200);
  
  ${QuickAction}:hover & {
    background: var(--color-primary-100);
    border-color: var(--color-primary-300);
  }
`;

export const QuickActionContent = styled.div`
  flex: 1;
`;

export const QuickActionTitle = styled.div`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 2px;
  font-size: var(--font-size-sm);
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

// Portfolio Creation Components - Updated  
export const CreatePortfolioSection = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  animation: ${fadeIn} 0.6s ease-out;
`;

export const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3xl);
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
  box-shadow: var(--shadow-lg);
  animation: ${float} 4s ease-in-out infinite;
`;

export const CreateTitle = styled(Heading2)`
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
`;

export const CreateDescription = styled(BodyText)`
  max-width: 500px;
  margin: 0 auto;
  color: var(--color-text-secondary);
`;

export const PortfolioTypes = styled(Grid).attrs({ 
  $minWidth: '280px', 
  $gap: 'var(--spacing-lg)' 
})``;

export const PortfolioTypeCard = styled(Card).attrs({ $hover: true, $padding: 'lg' })`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-500);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
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
  color: var(--color-text-primary);
`;

export const TypeDescription = styled(BodyText)`
  text-align: center;
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-text-secondary);
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
    
    &:hover:not(:disabled) {
      background: ${$gradient};
      filter: brightness(1.1);
    }
  `}
`;

// Offline Status Components - Updated
export const OfflineIndicator = styled.div<{ $isOffline: boolean }>`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  padding: var(--spacing-sm) var(--spacing-md);
  background: ${props => 
    props.$isOffline 
      ? 'linear-gradient(135deg, var(--color-error-500), var(--color-error-600))' 
      : 'linear-gradient(135deg, var(--color-success-500), var(--color-success-600))'
  };
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-lg);
  transform: translateY(${props => props.$isOffline ? '0' : '-100px'});
  transition: transform 0.3s ease;
  
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const SyncStatus = styled.div<{ $syncing: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  
  ${props => props.$syncing && css`
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
`;

// ===========================================
// SHARED VIEW COMPONENTS (Used by all views)
// ===========================================

// Base container for all views
export const ViewContainer = styled(FlexColumn).attrs({ $gap: 'var(--spacing-2xl)' })`
  width: 100%;
`;

// Stats grid for views
export const ViewStatsGrid = styled(Grid).attrs({ 
  $minWidth: '240px', 
  $gap: 'var(--spacing-lg)' 
})`
  margin-bottom: var(--spacing-2xl);
`;

// Individual view stat card
export const ViewStatCard = styled(Card).attrs({ $hover: true, $glass: true })`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-background-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

// View stat icon container
export const ViewStatIcon = styled.div<{ $color?: string; $gradient?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  flex-shrink: 0;
  
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
      border: 1px solid ${$color ? `${$color}40` : 'var(--color-primary-200)'};
    `;
  }}
`;

// View stat content wrapper
export const ViewStatContent = styled(FlexColumn).attrs({ $gap: 'var(--spacing-xs)' })`
  flex: 1;
`;

// View stat value display
export const ViewStatValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  line-height: 1.1;
`;

// View stat label
export const ViewStatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

// Grid layout for view content
export const ViewGrid = styled(Grid)<{ $minWidth?: string }>`
  ${({ $minWidth = '320px' }) => `
    grid-template-columns: repeat(auto-fill, minmax(${$minWidth}, 1fr));
  `}
  gap: var(--spacing-lg);
`;

// Individual view card
export const ViewCard = styled(Card).attrs({ $hover: true })`
  overflow: hidden;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-background-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

// View card header section
export const ViewCardHeader = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
`;

// View card content wrapper
export const ViewCardContent = styled.div`
  padding: var(--spacing-lg);
`;

// View card title
export const ViewCardTitle = styled(Heading3)`
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: 0.025em;
  color: var(--color-text-primary);
`;

// View card description  
export const ViewCardDescription = styled(BodyText)`
  margin: 0;
  line-height: 1.6;
  color: var(--color-text-secondary);
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
        return css`
          background: var(--color-success-50);
          border: 1px solid var(--color-success-200);
          color: var(--color-success-600);
        `;
      case 'in-progress':
        return css`
          background: var(--color-primary-50);
          border: 1px solid var(--color-primary-200);
          color: var(--color-primary-600);
        `;
      default:
        return css`
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
  margin: var(--spacing-md) 0;
`;

// Action group for buttons
export const ViewActionGroup = styled(FlexRow).attrs({ $gap: 'var(--spacing-sm)' })`
  margin-top: var(--spacing-lg);
`;

// Primary action (reuses BaseButton)
export const ViewAction = styled(BaseButton)<{ $primary?: boolean }>`
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${({ $primary }) => $primary && css`
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
    }
  `}
`;

// Tag component
export const ViewTag = styled(Badge)`
  background: var(--color-background-tertiary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-border-light);
  
  &:hover {
    background: var(--color-background-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

// Empty State Components
export const EmptyStateCard = styled(Card).attrs({ $padding: 'lg' })`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--color-background-tertiary);
  border: 2px dashed var(--color-border-medium);
  min-height: 200px;
`;

export const EmptyIcon = styled.div`
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  opacity: 0.6;
`;

export const EmptyTitle = styled(Heading3)`
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-text-primary);
`;

export const EmptyMessage = styled(BodyText)`
  margin: 0 0 var(--spacing-md) 0;
  max-width: 300px;
  color: var(--color-text-secondary);
`;

// Analytics-specific components
export const GrowthBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
`;

export const TimeRangeSelector = styled.div`
  display: flex;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
`;

export const TimeButton = styled.button<{ $active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: ${props => props.$active ? 'var(--color-primary-500)' : 'var(--color-background-secondary)'};
  color: ${props => props.$active ? 'white' : 'var(--color-text-primary)'};
  font-weight: ${props => props.$active ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)'};
  cursor: pointer;
  transition: var(--transition-fast);
  
  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-600)' : 'var(--color-background-tertiary)'};
  }
`;

export const MetricSelector = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

export const MetricButton = styled.button<{ $active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid ${props => props.$active ? 'var(--color-primary-500)' : 'var(--color-border-medium)'};
  background: ${props => props.$active ? 'var(--color-primary-50)' : 'var(--color-background-secondary)'};
  color: ${props => props.$active ? 'var(--color-primary-600)' : 'var(--color-text-primary)'};
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary-500);
    background: var(--color-primary-50);
  }
`;

export const ViewAllLink = styled.a`
  font-size: var(--font-size-sm);
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  
  &:hover {
    color: var(--color-primary-700);
    text-decoration: underline;
  }
`;

// Filter Components
export const FilterContainer = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $gap: 'var(--spacing-md)' 
})`
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  
  ${responsive.below.md} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FilterSelect = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  min-width: 140px;

  &:hover {
    border-color: var(--color-border-dark);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  option {
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
  }
`;

// Metric Components
export const MetricCard = styled(Card).attrs({ $padding: 'lg' })`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  transition: var(--transition-normal);
  
  &:hover {
    border-color: var(--color-primary-300);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

export const ChartContainer = styled.div`
  position: relative;
  height: 300px;
  width: 100%;
  margin: var(--spacing-md) 0;
  
  canvas {
    border-radius: var(--radius-sm);
  }
  
  ${responsive.below.md} {
    height: 250px;
  }
`;

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
          background: var(--color-warning-500);
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
          color: var(--color-warning-600);
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

// Section Actions
export const SectionActions = styled(FlexRow).attrs({ $gap: 'var(--spacing-xs)' })``;

export const ActionButton = styled(BaseButton)<{ $primary?: boolean }>`
  ${({ $primary }) => $primary && css`
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    color: white;
  `}
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