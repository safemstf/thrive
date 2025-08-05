// src/app/dashboard/profile/page.tsx - portfolio Hub
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { 
  type PortfolioKind,
  type Portfolio,
  hasGalleryCapability,
  hasLearningCapability
} from '@/types/portfolio.types';
import { 
  PageWrapper, 
  Container, 
  LoadingContainer,
  PortfolioManagement
} from '@/components/profile/profileStyles';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';
import { PortfolioCreation } from '@/components/portfolio/portfolioCreation';

// Import modular components
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

import { GalleryTabContent } from '@/components/profile/utils/galleryTab';
import { LearningTabContent } from '@/components/profile/utils/learningTab';
import { AnalyticsTabContent } from '@/components/profile/utils/analytics';

import { 
  generateMockUserStats,
  generateMockPortfolioStats,
  showSuccessNotification,
  clearUrlParams,
  UserStats,
  PortfolioStats
} from '@/components/profile/utils/staticMethodsProfile';

import { Loader2, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

type TabType = 'overview' | 'gallery' | 'learning' | 'analytics' | 'settings' | 'upgrade';

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
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  // Handle successful portfolio creation
  const handleCreationSuccess = async (portfolioId: string) => {
    try {
      setShowCreationFromUrl(false);
      setTargetTypeFromUrl(null);
      setShowPortfolioCreation(false);
      setLocalError(null);
      
      await refreshPortfolio();
      showSuccessNotification('Portfolio created successfully!');
      setActiveTab('overview');
    } catch (error) {
      console.error('Error refreshing after creation:', error);
      setLocalError('Portfolio created but failed to refresh. Please reload the page.');
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

  // Handle portfolio upgrade
  const handleUpgradeTabContent = async (newKind: PortfolioKind) => {
    try {
      setLocalError(null);
      await handlePortfolioUpdate({ kind: newKind });
      showSuccessNotification('Portfolio upgraded successfully!');
      setActiveTab('overview');
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

  // Handle upload modal
  const handleUploadClick = () => {
    if (!portfolio || !hasGalleryCapability(portfolio.kind)) {
      setLocalError('Gallery feature not available for this portfolio type');
      return;
    }
    setShowUploadModal(true);
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
      
      // Map the data to what your hook expects
      const portfolioData = {
        title: data.title,
        bio: data.bio || '',
        visibility: data.visibility || 'public' as const,
        specializations: data.specializations || [],
        tags: data.tags || [],
        // Include kind if your API supports it, otherwise handle separately
        ...(data.kind && { kind: data.kind })
      };

      const result = await createPortfolio(portfolioData);
      
      // If kind wasn't handled in creation, update it separately
      if (data.kind && result && !result.kind) {
        try {
          await updatePortfolio({ kind: data.kind });
        } catch (updateError) {
          console.warn('Failed to update portfolio kind:', updateError);
          // Don't fail the entire creation for this
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Portfolio creation failed:', error);
      setLocalError(error.message || 'Failed to create portfolio');
      throw error;
    }
  };

  // Render tab content with error boundaries
  const renderTabContent = () => {
    if (!portfolio) return null;
    
    try {
      switch (activeTab) {
        case 'overview':
          return (
            <PortfolioOverview
              portfolio={portfolio}
              stats={portfolioStats || generateMockPortfolioStats()}
              onEditClick={() => setActiveTab('settings')}
              onUpgradeClick={portfolio.kind !== 'hybrid' ? () => setActiveTab('upgrade') : undefined}
            />
          );

        case 'gallery':
          if (!hasGalleryCapability(portfolio.kind)) {
            return (
              <ComingSoonTab
                title="Gallery Not Available"
                description={`Gallery features are not available for ${portfolio.kind} portfolios. Consider upgrading to a creative or hybrid portfolio.`}
                icon={<AlertCircle />}
              />
            );
          }
          return (
            <GalleryTabContent
              portfolioStats={portfolioStats || generateMockPortfolioStats()}
              onUploadClick={handleUploadClick}
            />
          );

        case 'learning':
          if (!hasLearningCapability(portfolio.kind)) {
            return (
              <ComingSoonTab
                title="Learning Features Not Available"
                description={`Learning features are not available for ${portfolio.kind} portfolios. Consider upgrading to an educational or hybrid portfolio.`}
                icon={<AlertCircle />}
              />
            );
          }
          return (
            <LearningTabContent
              portfolioStats={portfolioStats || generateMockPortfolioStats()}
            />
          );

        case 'analytics':
          return (
            <AnalyticsTabContent
              portfolioStats={portfolioStats || generateMockPortfolioStats()}
              portfolio={portfolio}
            />
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
            onSuccess={handleCreationSuccess}
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
            onSuccess={handleCreationSuccess}
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

        {/* Error Display - Show both portfolio and local errors */}
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

        {/* Upload Modal - Only show if portfolio supports gallery */}
        {showUploadModal && portfolio && hasGalleryCapability(portfolio.kind) && (
          <ArtworkUploadModal
            portfolioId={portfolio.id}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              refreshPortfolio();
              showSuccessNotification('Artwork uploaded successfully!');
            }}
          />
        )}
      </Container>
    </PageWrapper>
  );
}