// src/app/dashboard/gallery/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { usePortfolioManager, useGalleryOperations } from '@/services/portfolioService';

// Import modular components
import { 
  GalleryHeader, 
  GalleryGrid, 
  BulkActionBar, 
  FloatingActionButton,
  UploadZone
} from '@/components/gallery/galleryComponents';

// Import business logic hooks
import {
  useGalleryFilters,
  useBulkActions,
  useImageUpload,
  type GalleryMode
} from '@/components/gallery/galleryLogic';

// Import types
import type { GalleryLayout } from '@/types/gallery.types';

// Import upload modal
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';

// Import error boundary
import { ErrorBoundary } from '@/components/gallery/utils/errorBoundary';

// Import analytics/logging
import { trackEvent } from '@/components/gallery/utils/analytics';
import { logger } from '@/components/gallery/utils/logger';

// Import portfolio creation
import { QuickCreateButton } from '@/components/portfolio/portfolioCreation';

export default function GalleryPage() {
  // ============= STATE MANAGEMENT =============
  const [viewLayout, setViewLayout] = useState<GalleryLayout>('masonry');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ============= USE PORTFOLIO MANAGER =============
  const {
    portfolio,
    galleryPieces,
    loading,
    error,
    refresh: refreshPortfolio,
    hasCreativeCapability
  } = usePortfolioManager();

  const { uploadImage, batchUpload, uploading } = useGalleryOperations(portfolio);

  // ============= CUSTOM HOOKS =============
  const {
    filterState,
    filteredItems,
    availableTags,
    updateFilter,
    toggleTag,
    clearFilters,
    hasActiveFilters
  } = useGalleryFilters(galleryPieces || []);

  const {
    selectedItems,
    bulkActionMode,
    setBulkActionMode,
    toggleItemSelection,
    selectAll,
    clearSelection,
    handleBulkAction
  } = useBulkActions();

  const {
    uploadFiles,
    uploadProgress,
    isUploading,
    addFiles,
    removeFile,
    uploadImagesWithProgress,
    resetUpload
  } = useImageUpload();

  // ============= ACCESS CONTROL =============
  useEffect(() => {
    if (!isAuthenticated) {
      logger.info('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    setAccessChecked(true);
  }, [isAuthenticated, router]);

  // ============= EFFECTS =============
  
  // Persist view layout preference
  useEffect(() => {
    const savedLayout = localStorage.getItem('galleryViewLayout') as GalleryLayout;
    if (savedLayout && ['masonry', 'grid', 'list'].includes(savedLayout)) {
      setViewLayout(savedLayout);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('galleryViewLayout', viewLayout);
  }, [viewLayout]);

  // ============= HANDLERS =============
  const handleUploadSuccess = useCallback(async () => {
    logger.info('Upload successful, refreshing gallery');
    setShowUploadModal(false);
    resetUpload();
    await refreshPortfolio();
    trackEvent('upload_success', { count: uploadFiles.length });
  }, [resetUpload, refreshPortfolio, uploadFiles.length]);

  const handleFilesDropped = useCallback(async (files: File[]) => {
    logger.info('Files dropped', { count: files.length });
    trackEvent('files_dropped', { count: files.length });
    addFiles(files);
    setShowUploadModal(true);
  }, [addFiles]);

  const handleBulkActionWithRefresh = useCallback(async (action: any) => {
    try {
      logger.info('Bulk action started', { action, count: selectedItems.size });
      trackEvent('bulk_action_started', { action, count: selectedItems.size });
      
      await handleBulkAction(action);
      
      if (action === 'delete') {
        await refreshPortfolio();
      }
      
      trackEvent('bulk_action_success', { action });
    } catch (err) {
      logger.error('Bulk action failed:', err);
      trackEvent('bulk_action_error', { action, error: err });
    }
  }, [handleBulkAction, selectedItems.size, refreshPortfolio]);

  const handleUploadClick = useCallback(async () => {
    logger.info('Upload button clicked');
    trackEvent('upload_modal_opened', { trigger: 'button' });
    setShowUploadModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    logger.info('Upload modal closed');
    setShowUploadModal(false);
    resetUpload();
    trackEvent('upload_modal_closed');
  }, [resetUpload]);

  const handlePortfolioCreated = useCallback((portfolioId: string) => {
    logger.info('Creative portfolio created, refreshing page');
    refreshPortfolio();
  }, [refreshPortfolio]);

  // ============= ERROR BOUNDARY FALLBACK =============
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <ErrorContainer>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </ErrorContainer>
  );

  // ============= EARLY RETURNS FOR ACCESS CONTROL =============
  if (!isAuthenticated || !accessChecked) {
    return (
      <LoadingContainer>
        <p>Checking authentication...</p>
      </LoadingContainer>
    );
  }

  if (loading) {
    return (
      <LoadingContainer>
        <p>Loading portfolio...</p>
      </LoadingContainer>
    );
  }

  // Show portfolio creation if no portfolio exists
  if (!portfolio) {
    return (
      <PageWrapper>
        <Container>
          <EmptyStateContainer>
            <EmptyStateIcon>🎨</EmptyStateIcon>
            <EmptyStateTitle>Welcome to Your Gallery</EmptyStateTitle>
            <EmptyStateDescription>
              Create a creative portfolio to start showcasing your artwork, photography, and design projects.
            </EmptyStateDescription>
            <QuickCreateButton 
              type="creative"
              size="large"
              onSuccess={handlePortfolioCreated}
            />
          </EmptyStateContainer>
        </Container>
      </PageWrapper>
    );
  }

  // Show upgrade prompt if portfolio lacks creative capability
  if (!hasCreativeCapability) {
    return (
      <PageWrapper>
        <Container>
          <EmptyStateContainer>
            <EmptyStateIcon>📸</EmptyStateIcon>
            <EmptyStateTitle>Upgrade to Creative Portfolio</EmptyStateTitle>
            <EmptyStateDescription>
              Your current portfolio doesn't support gallery features. Upgrade to a creative or hybrid portfolio to access the gallery.
            </EmptyStateDescription>
            <UpgradeButton onClick={() => router.push('/dashboard/profile?upgrade=creative')}>
              Upgrade Portfolio
            </UpgradeButton>
          </EmptyStateContainer>
        </Container>
      </PageWrapper>
    );
  }

  // ============= RENDER =============
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <PageWrapper>
        {/* Header with search, filters, and controls */}
        <GalleryHeader
          galleryMode="portfolio"
          setGalleryMode={() => {}}
          viewLayout={viewLayout}
          setViewLayout={setViewLayout}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          searchQuery={filterState.searchQuery}
          setSearchQuery={(query) => updateFilter({ searchQuery: query })}
          selectedCategory={filterState.selectedCategory}
          setSelectedCategory={(category) => updateFilter({ selectedCategory: category })}
          selectedTags={filterState.selectedTags}
          toggleTag={toggleTag}
          bulkActionMode={bulkActionMode}
          setBulkActionMode={setBulkActionMode}
          hasCreativeCapability={true}
          onUpload={handleUploadClick}
          isAuthenticated={true}
          portfolio={portfolio}
          galleryPieces={galleryPieces}
          filteredItemsCount={filteredItems.length}
        />

        {/* Bulk action bar */}
        {bulkActionMode && selectedItems.size > 0 && (
          <BulkActionBar
            selectedItems={selectedItems}
            onBulkAction={handleBulkActionWithRefresh}
            onCancel={clearSelection}
          />
        )}

        {/* Main gallery content */}
        <GalleryContainer>
          <GalleryGrid
            items={filteredItems}
            viewLayout={viewLayout}
            loading={loading}
            error={error}
            galleryMode="portfolio"
            bulkActionMode={bulkActionMode}
            selectedItems={selectedItems}
            onItemSelect={toggleItemSelection}
            onRetry={refreshPortfolio}
            hasCreativeCapability={true}
            onUpload={handleUploadClick}
            searchQuery={filterState.searchQuery}
            selectedTags={filterState.selectedTags}
            selectedCategory={filterState.selectedCategory}
            portfolio={portfolio}
          />

          {/* Upload Zone - show when no artworks */}
          {filteredItems.length === 0 && 
           !loading && 
           !error && (
            <UploadZone
              onUpload={handleUploadClick}
              onFilesDropped={handleFilesDropped}
            />
          )}
        </GalleryContainer>

        {/* Floating action button */}
        {filteredItems.length > 0 && (
          <FloatingActionButton 
            onClick={handleUploadClick}
            aria-label="Upload artwork"
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <ArtworkUploadModal
            portfolioId={portfolio.id}
            onClose={handleModalClose}
            onSuccess={handleUploadSuccess}
            initialFiles={uploadFiles.length > 0 ? uploadFiles.map((f, index) => ({
              file: f.file,
              id: `upload-${index}-${Date.now()}`,
              preview: f.preview,
              progress: f.progress,
              error: f.error,
              status: f.status === 'success' ? 'complete' as const : 
                     f.status === 'error' ? 'error' as const :
                     f.status === 'uploading' ? 'uploading' as const : 'pending' as const
            })) : undefined}
          />
        )}
      </PageWrapper>
    </ErrorBoundary>
  );
}

// ============= STYLED COMPONENTS =============
const PageWrapper = styled.main`
  min-height: 100vh;
  background-color: var(--bg-primary, #fafafa);
  padding-bottom: 4rem;
  position: relative;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const GalleryContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  
  p {
    color: var(--text-secondary, #666);
    font-size: 1.1rem;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  
  h2 {
    color: var(--text-primary, #1a1a1a);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-secondary, #666);
    margin-bottom: 2rem;
  }
  
  button {
    background-color: var(--primary-color, #3b82f6);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--primary-hover, #2563eb);
      transform: translateY(-1px);
    }
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 3rem 2rem;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const EmptyStateTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 1rem;
`;

const EmptyStateDescription = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary, #666);
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px -4px rgba(139, 92, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -8px rgba(139, 92, 246, 0.4);
  }
`;