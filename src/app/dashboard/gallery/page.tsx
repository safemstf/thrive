// src/app/dashboard/gallery/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';

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
  useGalleryData,
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

export default function GalleryPage() {
  // ============= STATE MANAGEMENT =============
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('public');
  const [viewLayout, setViewLayout] = useState<GalleryLayout>('masonry');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ============= CUSTOM HOOKS =============
  const {
    galleryPieces,
    collections,
    portfolio,
    loading,
    error,
    fetchData,
    createPortfolio,
    refreshData,
    setGalleryPieces
  } = useGalleryData();

  const {
    filterState,
    filteredItems,
    availableTags,
    updateFilter,
    toggleTag,
    clearFilters,
    hasActiveFilters
  } = useGalleryFilters(galleryPieces);

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

  // ============= MEMOIZED VALUES =============
  const hasCreativeCapability = useMemo(() => 
    portfolio && (portfolio.kind === 'creative' || portfolio.kind === 'hybrid'),
    [portfolio]
  );
  
  const canUpload = useMemo(() => {
    // Must be authenticated and in portfolio mode
    if (!isAuthenticated || galleryMode !== 'portfolio') {
      return false;
  }
  
  // If no portfolio exists, allow upload (modal will handle creation)
  if (!portfolio) {
    return true;
  }
  
  // If portfolio exists, check if it supports creative work
  return portfolio.kind === 'creative' || portfolio.kind === 'hybrid';
}, [isAuthenticated, galleryMode, portfolio]);

  // ============= EFFECTS =============
  
  // Auto-detect portfolio mode if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setGalleryMode('portfolio');
      trackEvent('gallery_mode_switched', { mode: 'portfolio', auto: true });
    } else {
      setGalleryMode('public');
      trackEvent('gallery_mode_switched', { mode: 'public', auto: true });
    }
  }, [isAuthenticated]);

  // Fetch data when mode changes
  useEffect(() => {
    fetchData(galleryMode);
  }, [galleryMode, fetchData]);

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
  const handleCreatePortfolio = useCallback(async (type: 'creative' | 'hybrid') => {
    try {
      trackEvent('portfolio_create_started', { type });
      await createPortfolio(type);
      await refreshData(galleryMode);
      trackEvent('portfolio_create_success', { type });
    } catch (err) {
      logger.error('Error creating portfolio:', err);
      trackEvent('portfolio_create_error', { type, error: err });
    }
  }, [createPortfolio, refreshData, galleryMode]);

  const handleUploadSuccess = useCallback(async () => {
    setShowUploadModal(false);
    resetUpload();
    await refreshData(galleryMode);
    trackEvent('upload_success', { mode: galleryMode });
  }, [resetUpload, refreshData, galleryMode]);

  const handleFilesDropped = useCallback(async (files: File[]) => {
    if (!canUpload) {
      logger.warn('Upload attempted without permission');
      return;
    }
    
    trackEvent('files_dropped', { count: files.length });
    addFiles(files);
    setShowUploadModal(true);
  }, [canUpload, addFiles]);

  const handleBulkActionWithRefresh = useCallback(async (action: any) => {
    try {
      trackEvent('bulk_action_started', { action, count: selectedItems.size });
      await handleBulkAction(action);
      
      if (action === 'delete') {
        await refreshData(galleryMode);
      }
      
      trackEvent('bulk_action_success', { action });
    } catch (err) {
      logger.error('Bulk action failed:', err);
      trackEvent('bulk_action_error', { action, error: err });
    }
  }, [handleBulkAction, selectedItems.size, refreshData, galleryMode]);

// Replace your handleUploadClick function in page.tsx with this:

const handleUploadClick = useCallback(() => {
  // More detailed logging for debugging
  logger.info('Upload button clicked', {
    isAuthenticated,
    galleryMode,
    hasCreativeCapability,
    portfolio: portfolio ? { id: portfolio.id, kind: portfolio.kind } : null,
    canUpload
  });

  // Basic checks that should match the button visibility logic
  if (!isAuthenticated) {
    logger.warn('Upload blocked: User not authenticated');
    return;
  }

  if (galleryMode !== 'portfolio') {
    logger.warn('Upload blocked: Not in portfolio mode', { currentMode: galleryMode });
    return;
  }

  // Allow upload even if portfolio doesn't exist yet - the modal will handle creation
  // OR if portfolio exists and has creative capability
  const canProceed = !portfolio || hasCreativeCapability;
  
  if (!canProceed) {
    logger.warn('Upload blocked: Portfolio exists but lacks creative capability', {
      portfolioKind: portfolio?.kind
    });
    // You might want to show a message to upgrade portfolio here
    alert('This portfolio type doesn\'t support artwork uploads. Please upgrade to a Creative or Hybrid portfolio.');
    return;
  }
  
  logger.info('Opening upload modal');
  trackEvent('upload_modal_opened', { trigger: 'button' });
  setShowUploadModal(true);
}, [isAuthenticated, galleryMode, portfolio, hasCreativeCapability]);

  const handleModalClose = useCallback(() => {
    setShowUploadModal(false);
    resetUpload();
    trackEvent('upload_modal_closed');
  }, [resetUpload]);

  // ============= ERROR BOUNDARY FALLBACK =============
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <ErrorContainer>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </ErrorContainer>
  );

  // ============= RENDER =============
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <PageWrapper>
        {/* Header with search, filters, and controls */}
        <GalleryHeader
          galleryMode={galleryMode}
          setGalleryMode={setGalleryMode}
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
          hasCreativeCapability={!!hasCreativeCapability}
          onUpload={handleUploadClick}
          isAuthenticated={isAuthenticated}
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
            galleryMode={galleryMode}
            bulkActionMode={bulkActionMode}
            selectedItems={selectedItems}
            onItemSelect={toggleItemSelection}
            onRetry={() => fetchData(galleryMode)}
            hasCreativeCapability={!!hasCreativeCapability}
            onUpload={handleUploadClick}
            searchQuery={filterState.searchQuery}
            selectedTags={filterState.selectedTags}
            selectedCategory={filterState.selectedCategory}
            portfolio={portfolio}
          />

          {/* Upload Zone - show for authenticated users with creative capability */}
          {canUpload && 
           filteredItems.length === 0 && 
           !loading && 
           !error && (
            <UploadZone
              onUpload={handleUploadClick}
              onFilesDropped={handleFilesDropped}
            />
          )}
        </GalleryContainer>

        {/* Floating action button */}
        {canUpload && filteredItems.length > 0 && (
          <FloatingActionButton 
            onClick={handleUploadClick}
            aria-label="Upload artwork"
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && isAuthenticated && (
          <ArtworkUploadModal
            portfolioId={portfolio?.id}
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

const GalleryContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
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