// src/app/dashboard/profile/page.tsx - Clean Portfolio Hub (Management Only)
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { 
  type PortfolioKind,
  type Portfolio
} from '@/types/portfolio.types';
import { 
  PageWrapper, 
  Container, 
  LoadingContainer,
  PortfolioManagement
} from '@/components/profile/profileStyles';
import { PortfolioCreation } from '@/components/portfolio/portfolioCreation';

// Import modular components - MANAGEMENT FOCUSED ONLY
import { PortfolioOverview } from '@/components/profile/utils/overview';
import { UpgradeTabContent } from '@/components/profile/utils/upgradeTab';
import ProfessionalSettingsPage from '@/components/profile/utils/settings';

// Import from structure
import { 
  HeaderSection,
  ErrorDisplay,
  StatsGrid,
  PortfolioCreationGrid,
  PortfolioTabs,
  ComingSoonTab
} from '@/components/profile/utils/structureProfile';

// REMOVED: Gallery and Learning tab components (they have dedicated pages now)

import { 
  generateMockUserStats,
  generateMockPortfolioStats,
  showSuccessNotification,
  clearUrlParams,
  UserStats,
  PortfolioStats
} from '@/components/profile/utils/staticMethodsProfile';

import { Loader2, Settings as SettingsIcon, AlertCircle, ExternalLink } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

// FOCUSED TAB TYPES - Only management-related, NO CONTENT CREATION
type TabType = 'overview' | 'settings' | 'upgrade';

export default function PortfolioHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Portfolio management with proper error handling
  const {
    portfolio,
    loading: portfolioLoading,
    error: portfolioError,
    isCreating,
    isUpdating,
    isDeleting,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolio,
    hasPortfolio
  } = usePortfolioManagement();
  
  // Local state - SIMPLIFIED TO MANAGEMENT ONLY
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showPortfolioCreation, setShowPortfolioCreation] = useState(false);
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<PortfolioKind>('creative');
  const [stats, setStats] = useState<UserStats>({ visits: 0, averageRating: 0, totalRatings: 0 });
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // URL parameters
  const createParam = searchParams.get('create') as PortfolioKind | null;
  const upgradeParam = searchParams.get('upgrade') as PortfolioKind | null;
  
  // State for URL parameter handling
  const [showCreationFromUrl, setShowCreationFromUrl] = useState(false);
  const [targetTypeFromUrl, setTargetTypeFromUrl] = useState<PortfolioKind | null>(null);

  // Generate stats when portfolio changes
  useEffect(() => {
    setStats(generateMockUserStats());
    if (portfolio) {
      setPortfolioStats(generateMockPortfolioStats());
    } else {
      setPortfolioStats(null);
    }
  }, [portfolio]);

  // Handle URL parameters
  useEffect(() => {
    if (createParam && !hasPortfolio && !portfolioLoading) {
      setTargetTypeFromUrl(createParam);
      setShowCreationFromUrl(true);
      clearUrlParams(router, ['create']);
    } else if (upgradeParam && hasPortfolio && !portfolioLoading) {
      setActiveTab('upgrade');
      clearUrlParams(router, ['upgrade']);
    }
  }, [createParam, upgradeParam, hasPortfolio, portfolioLoading, router]);

  // Clear local errors when switching tabs
  useEffect(() => {
    setLocalError(null);
  }, [activeTab]);

  // Handle successful portfolio creation - REDIRECT TO APPROPRIATE WORKSPACE
  const handleCreationSuccess = async (portfolioId: string, portfolioKind: PortfolioKind) => {
    try {
      setShowCreationFromUrl(false);
      setTargetTypeFromUrl(null);
      setShowPortfolioCreation(false);
      setLocalError(null);
      
      await refreshPortfolio();
      showSuccessNotification('Portfolio created successfully!');
      
      // REDIRECT to the appropriate specialized workspace
      const redirectPath = getWorkspaceRedirect(portfolioKind);
      if (redirectPath) {
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500); // Give user time to see success message
      } else {
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error refreshing after creation:', error);
      setLocalError('Portfolio created but failed to refresh. Please reload the page.');
    }
  };

  // NEW: Determine where to redirect after portfolio creation
  const getWorkspaceRedirect = (portfolioKind: PortfolioKind): string | null => {
    switch (portfolioKind) {
      case 'creative':
        return '/dashboard/gallery'; // Creative workspace
      case 'educational':
        return '/dashboard/writing'; // Learning workspace
      case 'professional':
        return '/dashboard/projects'; // Tech workspace
      case 'hybrid':
        return '/dashboard'; // Main dashboard with all views
      default:
        return null; // Stay on current page
    }
  };

  // Handle portfolio updates with better error handling
  const handlePortfolioUpdate = async (updates: Partial<Portfolio>) => {
    if (!portfolio?.id) {
      setLocalError('No portfolio available to update');
      return;
    }

    try {
      setLocalError(null);
      await updatePortfolio(updates);
      showSuccessNotification('Portfolio updated successfully!');
    } catch (error: any) {
      console.error('Failed to update portfolio:', error);
      setLocalError(error.message || 'Failed to update portfolio');
      throw error;
    }
  };

  // Handle portfolio upgrade - WITH WORKSPACE REDIRECT
  const handleUpgradeTabContent = async (newKind: PortfolioKind) => {
    try {
      setLocalError(null);
      await handlePortfolioUpdate({ kind: newKind });
      showSuccessNotification('Portfolio upgraded successfully!');
      
      // Redirect to the new workspace if different from current
      const redirectPath = getWorkspaceRedirect(newKind);
      if (redirectPath && newKind !== portfolio?.kind) {
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        setActiveTab('overview');
      }
    } catch (error: any) {
      console.error('Failed to upgrade portfolio:', error);
      setLocalError(error.message || 'Failed to upgrade portfolio');
    }
  };

  // Handle portfolio deletion with confirmation
  const handlePortfolioDelete = async (deleteGalleryPieces: boolean = false) => {
    try {
      setLocalError(null);
      await deletePortfolio(deleteGalleryPieces);
      showSuccessNotification('Portfolio deleted successfully');
      setActiveTab('overview');
    } catch (error: any) {
      console.error('Failed to delete portfolio:', error);
      setLocalError(error.message || 'Failed to delete portfolio');
      throw error;
    }
  };

  // Handle portfolio type selection
  const handlePortfolioTypeSelect = (type: PortfolioKind) => {
    setSelectedPortfolioType(type);
    setShowPortfolioCreation(true);
    setLocalError(null);
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  // Handle portfolio creation with proper data mapping
  const handleCreatePortfolio = async (data: {
    title: string;
    tagline?: string;
    bio?: string;
    visibility?: 'public' | 'private' | 'unlisted';
    specializations?: string[];
    tags?: string[];
    kind?: PortfolioKind;
  }) => {
    try {
      setLocalError(null);
      
      const portfolioData = {
        title: data.title,
        bio: data.bio || '',
        visibility: data.visibility || 'public' as const,
        specializations: data.specializations || [],
        tags: data.tags || [],
        ...(data.kind && { kind: data.kind })
      };

      const result = await createPortfolio(portfolioData);
      
      if (data.kind && result && !result.kind) {
        try {
          await updatePortfolio({ kind: data.kind });
        } catch (updateError) {
          console.warn('Failed to update portfolio kind:', updateError);
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Portfolio creation failed:', error);
      setLocalError(error.message || 'Failed to create portfolio');
      throw error;
    }
  };

  // NEW: Get workspace info for current portfolio
  const getWorkspaceInfo = (portfolioKind: string) => {
    switch (portfolioKind) {
      case 'creative':
        return {
          title: 'Creative Studio',
          description: 'Manage your artwork, photography, and visual projects',
          path: '/dashboard/gallery',
          icon: '🎨',
          color: '#8b5cf6'
        };
      case 'educational':
        return {
          title: 'Teaching Portfolio', 
          description: 'Manage courses, curriculum, and educational content',
          path: '/dashboard/writing',
          icon: '📚',
          color: '#3b82f6'
        };
      case 'professional':
        return {
          title: 'Tech Portfolio',
          description: 'Manage projects, code repositories, and technical work',
          path: '/dashboard/projects', 
          icon: '💻',
          color: '#059669'
        };
      case 'hybrid':
        return {
          title: 'Multi-Portfolio Dashboard',
          description: 'Access all your creative, educational, and professional tools',
          path: '/dashboard',
          icon: '🚀',
          color: '#10b981'
        };
      default:
        return null;
    }
  };

  // Render tab content - MANAGEMENT FOCUSED ONLY
  const renderTabContent = () => {
    if (!portfolio) return null;
    
    const workspaceInfo = getWorkspaceInfo(portfolio.kind);
    
    try {
      switch (activeTab) {
        case 'overview':
          return (
            <>
              <PortfolioOverview
                portfolio={portfolio}
                stats={portfolioStats || generateMockPortfolioStats()}
                onEditClick={() => setActiveTab('settings')}
                onUpgradeClick={portfolio.kind !== 'hybrid' ? () => setActiveTab('upgrade') : undefined}
              />
              
              {/* NEW: Workspace Navigation Card */}
              {workspaceInfo && (
                <WorkspaceNavigationCard>
                  <WorkspaceIcon $color={workspaceInfo.color}>
                    {workspaceInfo.icon}
                  </WorkspaceIcon>
                  <WorkspaceContent>
                    <WorkspaceTitle>{workspaceInfo.title}</WorkspaceTitle>
                    <WorkspaceDescription>
                      {workspaceInfo.description}
                    </WorkspaceDescription>
                    <WorkspaceButton 
                      onClick={() => router.push(workspaceInfo.path)}
                    >
                      Open {workspaceInfo.title}
                      <ExternalLink size={16} />
                    </WorkspaceButton>
                  </WorkspaceContent>
                </WorkspaceNavigationCard>
              )}
            </>
          );

        case 'settings':
          return (
            <ProfessionalSettingsPage
              portfolio={portfolio}
              onUpdate={handlePortfolioUpdate}
              onDelete={handlePortfolioDelete}
              isUpdating={isUpdating}
            />
          );

        case 'upgrade':
          return (
            <UpgradeTabContent
              portfolio={portfolio}
              onUpgrade={handleUpgradeTabContent}
              isUpgrading={isUpdating}
            />
          );

        default:
          return (
            <ComingSoonTab
              title="Feature Coming Soon"
              description="This section is being developed and will be available soon"
              icon={<SettingsIcon />}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <ComingSoonTab
          title="Error Loading Content"
          description="There was an error loading this section. Please try refreshing the page."
          icon={<AlertCircle />}
        />
      );
    }
  };

  // Show loading spinner
  if (authLoading || portfolioLoading) {
    return (
      <PageWrapper>
        <LoadingContainer>
          <Loader2 className="animate-spin" size={48} />
          <p>Loading portfolio hub...</p>
        </LoadingContainer>
      </PageWrapper>
    );
  }

  // Handle authentication required
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Show creation modal from URL parameter
  if (showCreationFromUrl && targetTypeFromUrl) {
    return (
      <PageWrapper>
        <Container>
          <PortfolioCreation
            targetType={targetTypeFromUrl}
            onSuccess={(portfolioId) => handleCreationSuccess(portfolioId, targetTypeFromUrl)}
            onCancel={() => {
              setShowCreationFromUrl(false);
              setTargetTypeFromUrl(null);
            }}
            inline={true}
            showCloseButton={true}
          />
        </Container>
      </PageWrapper>
    );
  }

  // Show portfolio creation modal
  if (showPortfolioCreation) {
    return (
      <PageWrapper>
        <Container>
          <PortfolioCreation
            targetType={selectedPortfolioType}
            onSuccess={(portfolioId) => handleCreationSuccess(portfolioId, selectedPortfolioType)}
            onCancel={() => setShowPortfolioCreation(false)}
            inline={true}
            showCloseButton={true}
          />
        </Container>
      </PageWrapper>
    );
  }

  // Main render
  return (
    <PageWrapper>
      <Container>
        {/* Header Section */}
        <HeaderSection user={user} portfolio={portfolio} />

        {/* Error Display */}
        <ErrorDisplay error={portfolioError || localError} />

        {/* Stats Grid */}
        <StatsGrid stats={stats} portfolio={portfolio} />

        {/* Main Content */}
        {!hasPortfolio ? (
          <PortfolioCreationGrid
            onPortfolioTypeSelect={handlePortfolioTypeSelect}
            isCreating={isCreating}
          />
        ) : (
          <PortfolioManagement>
            <PortfolioTabs
              portfolio={portfolio}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            {renderTabContent()}
          </PortfolioManagement>
        )}
      </Container>
    </PageWrapper>
  );
}

// NEW: Styled components for workspace navigation
const WorkspaceNavigationCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border: 1px solid ${theme.glass.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-top: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const WorkspaceIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${props => `${props.$color}15`};
  border: 2px solid ${props => `${props.$color}30`};
  border-radius: ${theme.borderRadius.lg};
  font-size: 2.5rem;
  flex-shrink: 0;
`;

const WorkspaceContent = styled.div`
  flex: 1;
`;

const WorkspaceTitle = styled.h3`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const WorkspaceDescription = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.5;
`;

const WorkspaceButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
  
  &:active {
    transform: translateY(0);
  }
`;