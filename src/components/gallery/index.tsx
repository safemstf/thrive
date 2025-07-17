// src/components/gallery/index.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Upload, Grid, List, Filter, Search, X, Loader2, 
  AlertCircle, RefreshCw, Plus, Download, Share2 
} from 'lucide-react';
import { useAuth } from '@/providers/authProvider';
import { useInfiniteGalleryPieces } from '@/hooks/useGalleryApi';

import {
   GalleryViewConfig,
   GalleryPiece,
   GalleryFilters,
   GalleryVisibility,
   GalleryLayout,
   GalleryUploadFile,
   GalleryUploadOptions,
 } from '@/types/gallery.types';

import { 
  filterGalleryPieces, 
  sortGalleryPieces, 
  canUserEditPiece,
  validateImage,
  generatePreview,
  compressImage,
  GALLERY_CONSTANTS,
    batchUpdateVisibility,    // Now uses portfolio API
  batchDeletePieces,        // Now uses portfolio API
  deleteGalleryPiece,       // New import
  updatePieceVisibility,    // New import
  deleteGalleryPieceWithConfirmation 
} from './utils';
import { GalleryItem, GalleryModal, VisibilityToggle } from './rendering';
import { ImageOff } from 'lucide-react';

// ==================== Component Interfaces ====================
interface GalleryProps {
  mode: 'public' | 'private' | 'manage' | 'portfolio';
  initialFilters?: Partial<GalleryFilters>;
  viewConfig?: Partial<GalleryViewConfig>;
  portfolioUserId?: string; // For viewing specific user's portfolio
}

type UploadStatus = 'pending' | 'error' | 'uploading' | 'complete' | 'processing';

interface GalleryState {
  selectedPiece: GalleryPiece | null;
  selectedItems: Set<string>;
  isSelectionMode: boolean;
  showUploader: boolean;
  uploadFiles: GalleryUploadFile[];
  filters: GalleryFilters;
  viewConfig: GalleryViewConfig;
  status?: UploadStatus;
  portfolioMode?: 'viewing' | 'editing';
}

// ==================== Main Gallery Component ====================
export const Gallery: React.FC<GalleryProps> = ({
  mode = 'public',
  initialFilters = {},
  viewConfig: initialViewConfig = {},
  portfolioUserId
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [state, setState] = useState<GalleryState>({
    selectedPiece: null,
    selectedItems: new Set(),
    isSelectionMode: false,
    showUploader: false,
    uploadFiles: [],
    filters: {
      visibility: mode === 'public' ? 'public' : 'all',
      ...initialFilters
    },
    viewConfig: {
      layout: 'masonry',
      itemsPerPage: GALLERY_CONSTANTS.ITEMS_PER_PAGE,
      showPrivateIndicator: mode !== 'public',
      enableSelection: mode === 'manage',
      enableQuickEdit: mode === 'manage',
      ...initialViewConfig
    },
    portfolioMode: mode === 'portfolio' ? 'viewing' : undefined
  });

  // Destructure state for easier access
  const { 
    selectedPiece, 
    selectedItems, 
    isSelectionMode, 
    showUploader, 
    uploadFiles, 
    filters, 
    viewConfig 
  } = state;

  // API data fetching
  const galleryData = useInfiniteGalleryPieces(
    {
      ...filters,
      limit: viewConfig.itemsPerPage,
      artist: mode === 'private' ? user?.id : portfolioUserId || undefined
    },
    { enabled: mode === 'public' || isAuthenticated || mode === 'portfolio' }
  );

  const { 
    data, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    refetch 
  } = galleryData;

  const pieces = data?.pages.flatMap(page => page.pieces) ?? [];
  const filteredPieces = filterGalleryPieces(pieces, filters);
  const sortedPieces = sortGalleryPieces(filteredPieces);

  // ==================== State Updaters ====================
  const updateState = (newState: Partial<GalleryState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // ==================== Event Handlers ====================
  const handlePieceClick = useCallback((piece: GalleryPiece) => {
    if (isSelectionMode) {
      setState(prev => {
        const newSet = new Set(prev.selectedItems);
        newSet.has(piece.id) ? newSet.delete(piece.id) : newSet.add(piece.id);
        return { ...prev, selectedItems: newSet };
      });
    } else {
      updateState({ selectedPiece: piece });
    }
  }, [isSelectionMode]);

  const handleQuickAction = useCallback((pieceId: string) => {
    router.push(`/dashboard/gallery/edit/${pieceId}`);
  }, [router]);

  const handleBulkAction = useCallback(async (action: 'visibility' | 'delete', value?: GalleryVisibility) => {
    if (selectedItems.size === 0) return;
    
    try {
      if (action === 'visibility' && value) {
        await batchUpdateVisibility(Array.from(selectedItems), value);
      } else if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedItems.size} items?`)) return;
        await batchDeletePieces(Array.from(selectedItems));
      }
      
      updateState({ 
        selectedItems: new Set(),
        isSelectionMode: false 
      });
      refetch();
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  }, [selectedItems, refetch]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, GALLERY_CONSTANTS.MAX_UPLOAD_FILES);
    
    const processedFiles = await Promise.all(
      fileArray.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const validation = validateImage(file);
        if (!validation.isValid) {
          const uploadFile: GalleryUploadFile = {
            file,
            id,
            progress: 0,
            status: 'error' as const,
            error: validation.errors[0]
          };
          return uploadFile;
        }

        try {
          const preview = await generatePreview(file);
          const uploadFile: GalleryUploadFile = {
            file,
            id,
            progress: 0,
            status: 'pending' as const,
            preview
          };
          return uploadFile;
        } catch (error) {
          console.error('Preview generation failed:', error);
          const uploadFile: GalleryUploadFile = {
            file,
            id,
            progress: 0,
            status: 'pending' as const
          };
          return uploadFile;
        }
      })
    );

    updateState({ 
      uploadFiles: [...uploadFiles, ...processedFiles],
      showUploader: true
    });
  }, [uploadFiles]);

  const handleUpload = useCallback(async (options: GalleryUploadOptions) => {
    const validFiles = uploadFiles.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    // Update file statuses
    updateState({
      uploadFiles: uploadFiles.map(f => 
        validFiles.some(vf => vf.id === f.id) 
          ? { ...f, status: 'uploading' as const }
          : f
      )
    });

    try {
      for (const uploadFile of validFiles) {
        const formData = new FormData();
        let fileToUpload = uploadFile.file;
        
        if (options.optimizeImages && options.maxWidth && options.maxHeight) {
          fileToUpload = await compressImage(
            uploadFile.file,
            options.maxWidth,
            options.maxHeight,
            options.quality
          );
        }
        
        formData.append('file', fileToUpload);
        formData.append('visibility', options.visibility);
        formData.append('generateThumbnail', String(options.generateThumbnail));
        
        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          updateState({
            uploadFiles: uploadFiles.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'complete' as const, progress: 100 }
                : f
            )
          });
        } else {
          throw new Error('Upload failed');
        }
      }

      // Clear completed files after delay
      setTimeout(() => {
        updateState({ 
          uploadFiles: uploadFiles.filter(f => f.status !== 'complete'),
          showUploader: false
        });
        refetch();
      }, 2000);
    } catch (error) {
      updateState({
        uploadFiles: uploadFiles.map(f => 
          validFiles.some(vf => vf.id === f.id) 
            ? { ...f, status: 'error' as const, error: 'Upload failed' }
            : f
        )
      });
    }
  }, [uploadFiles, refetch]);

  // ==================== Render Components ====================
  const renderEmptyState = () => (
    <EmptyState>
      <EmptyIcon>
        <ImageOff size={48} />
      </EmptyIcon>
      <EmptyTitle>
        {mode === 'public' 
          ? "No public artworks available" 
          : mode === 'portfolio'
          ? "This portfolio is empty"
          : "Your gallery is empty"}
      </EmptyTitle>
      <EmptyText>
        {mode === 'public'
          ? "Check back later for new content."
          : mode === 'portfolio'
          ? "No artwork has been added to this portfolio yet."
          : "Start by uploading your first artwork."}
      </EmptyText>
      {mode !== 'public' && mode !== 'portfolio' && (
        <EmptyAction onClick={() => fileInputRef.current?.click()}>
          <Upload size={20} />
          Upload Artwork
        </EmptyAction>
      )}
    </EmptyState>
  );

  const renderLoadingState = () => (
    <LoadingState>
      <Loader2 className="animate-spin" size={48} />
      <LoadingText>Loading gallery...</LoadingText>
    </LoadingState>
  );

  const renderErrorState = () => (
    <ErrorState>
      <AlertCircle size={48} color="#ef4444" />
      <ErrorText>{error?.message || 'Failed to load gallery'}</ErrorText>
      <RetryButton onClick={() => refetch()}>
        <RefreshCw size={16} />
        Retry
      </RetryButton>
    </ErrorState>
  );

  const renderGalleryControls = () => (
  <ControlsBar>
    <ControlsLeft>
      <SearchBox>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search gallery..."
          value={filters.searchQuery || ''}
          onChange={(e) => updateState({ 
            filters: { ...filters, searchQuery: e.target.value } 
          })}
        />
        {filters.searchQuery && (
          <button onClick={() => updateState({ 
            filters: { ...filters, searchQuery: '' } 
          })}>
            <X size={16} />
          </button>
        )}
      </SearchBox>

      {(mode === 'manage' || mode === 'private' || mode === 'portfolio') && (
        <FilterButton>
          <Filter size={18} />
          Filters
        </FilterButton>
      )}
    </ControlsLeft>

    <ControlsRight>
      <ViewToggle>
        <ViewButton
          $active={viewConfig.layout === 'grid'}
          onClick={() => updateState({ 
            viewConfig: { ...viewConfig, layout: 'grid' } 
          })}
        >
          <Grid size={18} />
        </ViewButton>
        <ViewButton
          $active={viewConfig.layout === 'masonry'}
          onClick={() => updateState({ 
            viewConfig: { ...viewConfig, layout: 'masonry' } 
          })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="2" width="8" height="10" />
            <rect x="12" y="2" width="10" height="6" />
            <rect x="12" y="10" width="10" height="12" />
            <rect x="2" y="14" width="8" height="8" />
          </svg>
        </ViewButton>
        <ViewButton
          $active={viewConfig.layout === 'list'}
          onClick={() => updateState({ 
            viewConfig: { ...viewConfig, layout: 'list' } 
          })}
        >
          <List size={18} />
        </ViewButton>
      </ViewToggle>

      {/* Show upload controls for both manage and private modes */}
      {(mode === 'manage' || mode === 'private') && renderManagementControls()}
      
      {mode === 'portfolio' && user?.id === portfolioUserId && (
        <ActionButton 
          onClick={() => router.push('/dashboard/portfolio/edit')}
          $variant="primary"
        >
          Edit Portfolio
        </ActionButton>
      )}
    </ControlsRight>
  </ControlsBar>
 );


   const renderManagementControls = () => {
  if (isSelectionMode) {
    return (
      <SelectionActions>
        <SelectionInfo>
          {selectedItems.size} selected
        </SelectionInfo>
        <VisibilityToggle
          value="public"
          onChange={(v) => handleBulkAction('visibility', v)}
          compact
        />
        <ActionButton 
          onClick={() => handleBulkAction('delete')} 
          $variant="danger"
        >
          Delete
        </ActionButton>
        <ActionButton onClick={() => updateState({ 
          isSelectionMode: false, 
          selectedItems: new Set() 
        })}>
          Cancel
        </ActionButton>
      </SelectionActions>
    );
  }
  
  return (
    <>
      <ActionButton onClick={() => updateState({ isSelectionMode: true })}>
        Select
      </ActionButton>
      <ActionButton 
        onClick={() => fileInputRef.current?.click()}
        $variant="primary"
      >
        <Plus size={18} />
        Upload
      </ActionButton>
    </>
  );
  };
  const renderUploaderModal = () => (
    <UploaderModal>
      <UploaderContent>
        <UploaderHeader>
          <button onClick={() => updateState({ showUploader: false })}>
            <X size={24} />
          </button>
        </UploaderHeader>
        
        <UploadArea>
          {uploadFiles.map(file => (
            <UploadFileItem key={file.id}>
              {file.preview && <img src={file.preview} alt="" />}
              <span>{file.file.name}</span>
              {file.error && <ErrorText>{file.error}</ErrorText>}
              {file.status === 'uploading' && (
                <ProgressBar value={file.progress} max={100} />
              )}
            </UploadFileItem>
          ))}
        </UploadArea>

        <UploadActions>
          <VisibilityToggle
            value="private"
            onChange={(v) => console.log('Visibility:', v)}
          />
          <ActionButton 
            $variant="primary"
            onClick={() => handleUpload({
              visibility: 'private',
              generateThumbnail: true,
              optimizeImages: true,
              preserveMetadata: false,
              quality: 0.9,
              maxWidth: 2000,
              maxHeight: 2000
            })}
          >
            Upload {uploadFiles.filter(f => f.status === 'pending').length} Files
          </ActionButton>
        </UploadActions>
      </UploaderContent>
    </UploaderModal>
  );

  // ==================== Effects ====================
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ==================== Main Render ====================
  if (isLoading) return renderLoadingState();
  if (error && pieces.length === 0) return renderErrorState();
  if (pieces.length === 0 && !showUploader) return renderEmptyState();

  return (
    <Container>
      {/* Portfolio Header for Portfolio Mode */}
      {mode === 'portfolio' && portfolioUserId && (
        <PortfolioHeader>
          <PortfolioInfo>
            <h1>Portfolio</h1>
            <p>Explore this artist's collection</p>
          </PortfolioInfo>
          <ShareButton>
            <Share2 size={18} />
            Share Portfolio
          </ShareButton>
        </PortfolioHeader>
      )}

      {/* Gallery Controls */}
      {((mode !== 'public' && isAuthenticated) || filters.searchQuery) && renderGalleryControls()}
      {/* Gallery Grid */}
      <GalleryGrid $layout={viewConfig.layout}>
        {sortedPieces.map((piece, index) => (
          <div key={piece.id} onClick={() => handlePieceClick(piece)}>
            <GalleryItem
              piece={piece}
              layout={viewConfig.layout}
              isSelected={selectedItems.has(piece.id)}
              showPrivateIndicator={viewConfig.showPrivateIndicator && mode !== 'portfolio'}
              onQuickAction={viewConfig.enableQuickEdit ? handleQuickAction : undefined}
              priority={index < 4}
            />
          </div>
        ))}
      </GalleryGrid>

      {/* Load More Button */}
      {hasNextPage && (
        <LoadMoreSection>
          {isFetchingNextPage ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <LoadMoreButton onClick={() => fetchNextPage()}>
              Load More
            </LoadMoreButton>
          )}
        </LoadMoreSection>
      )}

      {/* Artwork Detail Modal */}
      {selectedPiece && (
        <GalleryModal
          piece={selectedPiece}
          onClose={() => updateState({ selectedPiece: null })}
          onEdit={
            canUserEditPiece(selectedPiece, user?.id, user?.role)
              ? () => router.push(`/dashboard/gallery/edit/${selectedPiece.id}`)
              : undefined
          }
          canEdit={canUserEditPiece(selectedPiece, user?.id, user?.role)}
        />
      )}

      {/* Upload Modal */}
      {showUploader && renderUploaderModal()}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={GALLERY_CONSTANTS.ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />
    </Container>
  );
};

// ==================== Styled Components ====================
const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: #f8f8f8;
`;

const PortfolioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PortfolioInfo = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: #111827;
  }
  
  p {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 1rem;
`;

const ControlsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  flex: 1;
  max-width: 400px;

  input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: 0.875rem;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 0.25rem;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: ${props => props.$active ? '#2c2c2c' : '#666'};
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    background: ${props => props.$active ? 'white' : 'rgba(255,255,255,0.5)'};
  }
`;

const ActionButton = styled.button<{ $variant?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #2c2c2c;
          color: white;
          &:hover { background: #1a1a1a; }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `;
      default:
        return `
          background: white;
          color: #2c2c2c;
          border: 1px solid #e5e7eb;
          &:hover { 
            border-color: #d1d5db;
            background: #f9fafb;
          }
        `;
    }
  }}
`;

const SelectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SelectionInfo = styled.span`
  font-size: 0.875rem;
  color: #666;
`;

const GalleryGrid = styled.div<{ $layout: string }>`
  ${props => {
    switch (props.$layout) {
      case 'masonry':
        return `
          column-count: 1;
          column-gap: 1rem;
          
          @media (min-width: 640px) {
            column-count: 2;
          }
          
          @media (min-width: 1024px) {
            column-count: 3;
          }
          
          @media (min-width: 1536px) {
            column-count: 4;
          }

          > div {
            break-inside: avoid;
            margin-bottom: 1rem;
          }
        `;
      case 'list':
        return `
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        `;
      default:
        return `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        `;
    }
  }}
`;

// State Components
const CenteredState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
`;

const LoadingState = styled(CenteredState)`
  gap: 1rem;
  color: #666;
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
`;

const ErrorState = styled(CenteredState)`
  gap: 1rem;
`;

const ErrorText = styled.p`
  font-size: 1.125rem;
  color: #ef4444;
  max-width: 500px;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1a1a1a;
  }
`;

const EmptyState = styled(CenteredState)`
  gap: 1rem;
`;

const EmptyIcon = styled.div`
  color: #d1d5db;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const EmptyAction = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1a1a1a;
  }
`;

const LoadMoreSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const LoadMoreButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

// Uploader Components
const UploaderModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const UploaderContent = styled.div`
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const UploaderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }
`;

const UploadArea = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
`;

const UploadFileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
    background: #f3f4f6;
  }

  span {
    flex: 1;
    font-size: 0.875rem;
  }
`;

const ProgressBar = styled.progress`
  width: 100%;
  height: 8px;
  appearance: none;

  &::-webkit-progress-bar {
    background: #e5e7eb;
    border-radius: 4px;
  }
  &::-webkit-progress-value {
    background: #2c2c2c;
    border-radius: 4px;
  }
`;

const UploadActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
`;

export default Gallery;