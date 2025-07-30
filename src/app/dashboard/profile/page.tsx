// src/app/dashboard/profile/page.tsx 
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useProfileLogic } from '@/components/profile/profileLogic';
import { 
  PageWrapper, 
  Container, 
  Header, 
  ProfileInfo, 
  Avatar, 
  UserName, 
  Role, 
  Email,
  Grid,
  Card,
  CreatePortfolioSection,
  PortfolioManagement,
  LoadingContainer
} from '@/components/profile/profileStyles'
import { RatingReview } from '@/components/ratingReview';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';
import { PortfolioCreation } from '@/components/portfolio/portfolioCreation';
import { 
  User, Mail, Shield, Calendar, Eye, Loader2 
} from 'lucide-react';

export default function PortfolioHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioManagement = usePortfolioManagement();
  
  // Get URL parameters
  const createParam = searchParams.get('create') as 'creative' | 'educational' | null;
  const upgradeParam = searchParams.get('upgrade') as 'creative' | 'educational' | null;
  
  // State for handling URL parameters
  const [showCreationFromUrl, setShowCreationFromUrl] = useState(false);
  const [targetTypeFromUrl, setTargetTypeFromUrl] = useState<'creative' | 'educational' | null>(null);
  
  const {
    // State
    activeTab,
    setActiveTab,
    stats,
    portfolioStats,
    showCreatePortfolio,
    showUploadModal,
    setShowUploadModal,
    
    // Handlers
    handleCreatePortfolio,
    handleUpgradePortfolio,
    
    // Render functions
    renderPortfolioCreation,
    renderPortfolioTabs,
    renderPortfolioContent,
    
    // Utils
    getInitials,
    getPortfolioTypeConfig
  } = useProfileLogic(portfolioManagement);

  // Handle URL parameters
  useEffect(() => {
    if (createParam && !portfolioManagement.portfolio) {
      setTargetTypeFromUrl(createParam);
      setShowCreationFromUrl(true);
      // Clear the URL parameter
      router.replace('/dashboard/profile', { scroll: false });
    } else if (upgradeParam && portfolioManagement.portfolio) {
      // Handle upgrade logic if needed
      console.log('Portfolio upgrade requested for:', upgradeParam);
      // Clear the URL parameter
      router.replace('/dashboard/profile', { scroll: false });
    }
  }, [createParam, upgradeParam, portfolioManagement.portfolio, router]);

  // Handle successful portfolio creation from URL
  const handleCreationSuccess = (portfolioId: string) => {
    setShowCreationFromUrl(false);
    setTargetTypeFromUrl(null);
    // Refresh portfolio management
    portfolioManagement.refreshPortfolio();
    
    // Redirect to appropriate section based on type
    const redirectMap = {
      creative: '/dashboard/gallery',
      educational: '/dashboard/writing'
    };
    
    if (targetTypeFromUrl && redirectMap[targetTypeFromUrl]) {
      router.push(redirectMap[targetTypeFromUrl]);
    }
  };

  if (loading || portfolioManagement.loading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <p>Loading portfolio hub...</p>
      </LoadingContainer>
    );
  }

  const { portfolio } = portfolioManagement;

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

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Avatar>{user?.name ? getInitials(user.name) : <User size={60} />}</Avatar>
          <ProfileInfo>
            <UserName>{user?.name || 'User Profile'}</UserName>
            <Role><Shield size={16} />{user?.role || 'member'}</Role>
            <Email><Mail size={16} />{user?.email || 'user@example.com'}</Email>
          </ProfileInfo>
          {portfolio && (
            <div>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                background: getPortfolioTypeConfig(portfolio.kind)?.color || '#6b7280',
                borderRadius: '50%'
              }} />
              <span>{getPortfolioTypeConfig(portfolio.kind)?.title}</span>
            </div>
          )}
        </Header>

        <Grid>
          <Card>
            <h3><Calendar size={20} />Account Info</h3>
            <p>Member since January 2024</p>
          </Card>

          <Card>
            <h3><Eye size={20} />Visits & Ratings</h3>
            <p>{stats.visits.toLocaleString()} total visits</p>
            <div style={{ marginTop: '0.5rem' }}>
              <RatingReview rating={stats.averageRating} votes={stats.totalRatings} />
            </div>
          </Card>
        </Grid>

        {!portfolio ? (
          <CreatePortfolioSection>
            {renderPortfolioCreation()}
          </CreatePortfolioSection>
        ) : (
          <PortfolioManagement>
            {renderPortfolioTabs()}
            {renderPortfolioContent()}
          </PortfolioManagement>
        )}

        {/* Upload Modal */}
        {showUploadModal && portfolio && (portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
          <ArtworkUploadModal
            portfolioId={portfolio.id}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              portfolioManagement.refreshPortfolio();
            }}
          />
        )}
      </Container>
    </PageWrapper>
  );
}