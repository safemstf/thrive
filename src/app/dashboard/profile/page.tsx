// src/app/dashboard/profile/page.tsx - Refactored with Patterns
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { api } from '@/lib/api-client'; // Import the API interface
import { 
  type PortfolioKind,
  type Portfolio
} from '@/types/portfolio.types';

// Import reusable patterns
import {
  PortfolioHubLayout,
  HubHeader,
  WorkspaceNavigationCard,
  TabNavigation,
  PortfolioCreationFlow,
  SettingsPanel,
  UpgradePanel,
  StatsDisplay,
  ErrorAlert
} from '@/components/profile/patterns';

import { 
  PageContainer,
  LoadingContainer,
  LoadingSpinner,
  BodyText,
  Card,
  CardContent
} from '@/styles/styled-components';

import { Loader2, ExternalLink } from 'lucide-react';

type TabType = 'overview' | 'settings' | 'upgrade';

export default function PortfolioHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    portfolio,
    loading: portfolioLoading,
    error: portfolioError,
    isCreating,
    isUpdating,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolio,
    hasPortfolio
  } = usePortfolioManagement();
  
  // Simplified state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // URL parameter handling
  const createParam = searchParams.get('create') as PortfolioKind | null;
  const upgradeParam = searchParams.get('upgrade') as PortfolioKind | null;

  // Handle URL parameters
  useEffect(() => {
    if (upgradeParam && hasPortfolio && !portfolioLoading) {
      setActiveTab('upgrade');
      router.replace('/dashboard/profile'); // Clear URL params
    }
  }, [upgradeParam, hasPortfolio, portfolioLoading, router]);

  // Clear errors on tab change
  useEffect(() => {
    setLocalError(null);
  }, [activeTab]);

  // Workspace configuration
  const getWorkspaceConfig = (kind: string) => {
    const configs = {
      creative: {
        title: 'Creative Studio',
        description: 'Manage artwork, photography, and visual projects',
        path: '/dashboard/gallery',
        icon: '🎨',
        color: '#8b5cf6'
      },
      educational: {
        title: 'Teaching Portfolio',
        description: 'Manage courses, curriculum, and educational content',
        path: '/dashboard/writing',
        icon: '📚',
        color: '#3b82f6'
      },
      professional: {
        title: 'Tech Portfolio',
        description: 'Manage projects, code repositories, and technical work',
        path: '/dashboard/projects',
        icon: '💻',
        color: '#059669'
      },
      hybrid: {
        title: 'Multi-Portfolio Dashboard',
        description: 'Access all your creative, educational, and professional tools',
        path: '/dashboard',
        icon: '🚀',
        color: '#10b981'
      }
    };
    return configs[kind as keyof typeof configs];
  };

  // Portfolio operations
  const handlePortfolioCreate = async (data: {
    title: string;
    bio: string;
    kind: PortfolioKind;
    visibility: 'public' | 'private' | 'unlisted';
  }) => {
    try {
      setLocalError(null);
      
      // Use the proper API interface
      const result = await api.portfolio.create({
        title: data.title,
        bio: data.bio,
        kind: data.kind,
        visibility: data.visibility,
        specializations: [],
        tags: []
      });
      
      // Refresh the portfolio data
      await refreshPortfolio();
      
      // Redirect to workspace after creation
      const workspace = getWorkspaceConfig(data.kind);
      if (workspace) {
        setTimeout(() => router.push(workspace.path), 1500);
      }
      
      return result;
    } catch (error: any) {
      setLocalError(error.message || 'Failed to create portfolio');
      throw error;
    }
  };

  const handlePortfolioUpdate = async (updates: Partial<Portfolio>) => {
    try {
      setLocalError(null);
      
      // Use the proper API interface
      await api.portfolio.update(updates);
      await refreshPortfolio();
    } catch (error: any) {
      setLocalError(error.message || 'Failed to update portfolio');
      throw error;
    }
  };

  const handlePortfolioUpgrade = async (newKind: PortfolioKind) => {
    try {
      setLocalError(null);
      
      // Use the proper API interface
      await api.portfolio.upgrade(newKind, true);
      await refreshPortfolio();
      
      // Redirect to new workspace if different
      const workspace = getWorkspaceConfig(newKind);
      if (workspace && newKind !== portfolio?.kind) {
        setTimeout(() => router.push(workspace.path), 1500);
      }
    } catch (error: any) {
      setLocalError(error.message || 'Failed to upgrade portfolio');
    }
  };

  const handlePortfolioDelete = async (deleteContent: boolean = false) => {
    try {
      setLocalError(null);
      
      // Use the proper API interface
      await api.portfolio.delete(deleteContent);
      await refreshPortfolio();
      setActiveTab('overview');
    } catch (error: any) {
      setLocalError(error.message || 'Failed to delete portfolio');
      throw error;
    }
  };

  // Navigation tabs
  const tabs = [
    { key: 'overview', label: 'Overview', description: 'Portfolio summary' },
    { key: 'settings', label: 'Settings', description: 'Configure portfolio' },
    ...(portfolio?.kind !== 'hybrid' ? [
      { key: 'upgrade', label: 'Upgrade', description: 'Enhance capabilities' }
    ] : [])
  ];

  // Loading states
  if (authLoading || portfolioLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <BodyText>Loading portfolio hub...</BodyText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Authentication check
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Portfolio creation flow from URL
  if (createParam && !hasPortfolio) {
    return (
      <PageContainer>
        <PortfolioHubLayout>
          <PortfolioCreationFlow
            targetType={createParam}
            onSuccess={handlePortfolioCreate}
            onCancel={() => router.push('/dashboard/profile')}
          />
        </PortfolioHubLayout>
      </PageContainer>
    );
  }

  // Main portfolio hub interface
  return (
    <PageContainer>
      <PortfolioHubLayout>
        {/* Header */}
        <HubHeader
          user={user}
          portfolio={portfolio}
          hasPortfolio={hasPortfolio}
        />

        {/* Error Display */}
        {(portfolioError || localError) && (
          <ErrorAlert
            message={portfolioError || localError || ''}
            onDismiss={() => setLocalError(null)}
          />
        )}

        {/* Main Content */}
        {!hasPortfolio ? (
          <PortfolioCreationFlow
            onSuccess={handlePortfolioCreate}
            showTypeSelection={true}
          />
        ) : (
          <>
            {/* Tab Navigation */}
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabType)}
            />

            {/* Tab Content */}
            {activeTab === 'overview' && portfolio && (
              <>
                <StatsDisplay portfolio={portfolio} />
                
                {/* Workspace Navigation */}
                <WorkspaceNavigationCard
                  workspace={getWorkspaceConfig(portfolio.kind)}
                  onNavigate={(path) => router.push(path)}
                />
              </>
            )}

            {activeTab === 'settings' && portfolio && (
              <SettingsPanel
                portfolio={portfolio}
                onUpdate={handlePortfolioUpdate}
                onDelete={handlePortfolioDelete}
                isUpdating={isUpdating}
              />
            )}

            {activeTab === 'upgrade' && portfolio && (
              <UpgradePanel
                portfolio={portfolio}
                onUpgrade={handlePortfolioUpgrade}
                isUpgrading={isUpdating}
              />
            )}
          </>
        )}
      </PortfolioHubLayout>
    </PageContainer>
  );
}