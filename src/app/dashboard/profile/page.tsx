// src/app/dashboard/profile/page.tsx - Clean modular version (FIXED)
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

// Import our new modular components
import { PortfolioOverview } from '@/components/profile/utils/overview';
import { UpgradeTabContent } from '@/components/profile/utils/upgradeTab';
import ProfessionalSettingsPage from '@/components/profile/utils/settings';

// Import from structureProfile (without AnalyticsTabContent)
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

import { Loader2, Settings as SettingsIcon } from 'lucide-react';

type TabType = 'overview' | 'gallery' | 'learning' | 'analytics' | 'settings' | 'upgrade';

export default function PortfolioHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioManagement = usePortfolioManagement();
  
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPortfolioCreation, setShowPortfolioCreation] = useState(false);
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<PortfolioKind>('creative');
  const [stats, setStats] = useState<UserStats>({ visits: 0, averageRating: 0, totalRatings: 0 });
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  
  // Get URL parameters
  const createParam = searchParams.get('create') as PortfolioKind | null;
  const upgradeParam = searchParams.get('upgrade') as PortfolioKind | null;
  
  // State for handling URL parameters
  const [showCreationFromUrl, setShowCreationFromUrl] = useState(false);
  const [targetTypeFromUrl, setTargetTypeFromUrl] = useState<PortfolioKind | null>(null);

  // Fetch stats on mount and portfolio change
  useEffect(() => {
    setStats(generateMockUserStats());
    if (portfolioManagement.portfolio) {
      setPortfolioStats(generateMockPortfolioStats());
    }
  }, [portfolioManagement.portfolio]);

  // Handle URL parameters for portfolio creation/upgrade
  useEffect(() => {
    if (createParam && !portfolioManagement.portfolio) {
      setTargetTypeFromUrl(createParam);
      setShowCreationFromUrl(true);
      clearUrlParams(router, ['create']);
    } else if (upgradeParam && portfolioManagement.portfolio) {
      setActiveTab('upgrade');
      clearUrlParams(router, ['upgrade']);
    }
  }, [createParam, upgradeParam, portfolioManagement.portfolio, router]);

  // Handle successful portfolio creation
  const handleCreationSuccess = (portfolioId: string) => {
    setShowCreationFromUrl(false);
    setTargetTypeFromUrl(null);
    setShowPortfolioCreation(false);
    
    portfolioManagement.refreshPortfolio();
    showSuccessNotification('Portfolio created successfully!');
    setActiveTab('overview');
  };

  // Handle portfolio updates
  const handlePortfolioUpdate = async (updates: Partial<Portfolio>) => {
    try {
      await portfolioManagement.updatePortfolio(updates);
      showSuccessNotification('Portfolio updated successfully!');
    } catch (error) {
      console.error('Failed to update portfolio:', error);
      throw error;
    }
  };

  // Handle portfolio upgrade
  const handleUpgradeTabContent = async (newKind: PortfolioKind) => {
    try {
      await portfolioManagement.updatePortfolio({ kind: newKind });
      showSuccessNotification('Portfolio upgraded successfully!');
      setActiveTab('overview');
    } catch (error) {
      console.error('Failed to upgrade portfolio:', error);
      throw error;
    }
  };

  // Handle portfolio deletion
  const handlePortfolioDelete = async (deleteGalleryPieces: boolean = false) => {
    try {
      await portfolioManagement.deletePortfolio(deleteGalleryPieces);
      showSuccessNotification('Portfolio deleted successfully');
      setActiveTab('overview');
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      throw error;
    }
  };

  // Handle portfolio type selection for creation
  const handlePortfolioTypeSelect = (type: PortfolioKind) => {
    setSelectedPortfolioType(type);
    setShowPortfolioCreation(true);
  };

  // Handle upload modal
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  // Handle tab changes with proper type casting
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!portfolioManagement.portfolio || !portfolioStats) return null;
    
    const portfolio = portfolioManagement.portfolio;
    
    switch (activeTab) {
      case 'overview':
        return (
          <PortfolioOverview
            portfolio={portfolio}
            stats={portfolioStats}
            onEditClick={() => setActiveTab('settings')}
            onUpgradeClick={portfolio.kind !== 'hybrid' ? () => setActiveTab('upgrade') : undefined}
          />
        );

      case 'gallery':
        return (
          <GalleryTabContent
            portfolioStats={portfolioStats}
            onUploadClick={handleUploadClick}
          />
        );

      case 'learning':
        return (
          <LearningTabContent
            portfolioStats={portfolioStats}
          />
        );

      case 'analytics':
        return (
          <AnalyticsTabContent
            portfolioStats={portfolioStats}
          />
        );

      case 'settings':
        return (
          <ProfessionalSettingsPage
            portfolio={portfolio}
            onUpdate={handlePortfolioUpdate}
            onDelete={handlePortfolioDelete}
            isUpdating={portfolioManagement.isUpdating}
          />
        );

      case 'upgrade':
        return (
          <UpgradeTabContent
            portfolio={portfolio}
            onUpgrade={handleUpgradeTabContent}
            isUpgrading={portfolioManagement.isUpdating}
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
  };

  // Loading state
  if (loading || portfolioManagement.loading) {
    return (
      <PageWrapper>
        <LoadingContainer>
          <Loader2 className="animate-spin" size={48} />
          <p>Loading portfolio hub...</p>
        </LoadingContainer>
      </PageWrapper>
    );
  }

  const { portfolio, error } = portfolioManagement;

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

  return (
    <PageWrapper>
      <Container>
        {/* Header Section */}
        <HeaderSection user={user} portfolio={portfolio} />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Stats Grid */}
        <StatsGrid stats={stats} portfolio={portfolio} />

        {/* Main Content */}
        {!portfolio ? (
          <PortfolioCreationGrid
            onPortfolioTypeSelect={handlePortfolioTypeSelect}
            isCreating={portfolioManagement.isCreating}
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

        {/* Upload Modal */}
        {showUploadModal && portfolio && hasGalleryCapability(portfolio.kind) && (
          <ArtworkUploadModal
            portfolioId={portfolio.id}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              portfolioManagement.refreshPortfolio();
              showSuccessNotification('Artwork uploaded successfully!');
            }}
          />
        )}
      </Container>
    </PageWrapper>
  );
}