'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, Plus, Grid3x3, Eye, EyeOff, Folder, 
  Calendar, X, Check, Image, Layers, Trash2,
  ChevronRight, Settings, Archive, Save, Loader,
  Tag, DollarSign, Palette, Move, Edit3, Share2,
  Filter, Download, RefreshCw, AlertCircle, LayoutGrid,
  List, Columns
} from 'lucide-react';

// Import your actual components and API
import { api } from '@/lib/api-client';
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';
import type { Portfolio } from '@/types/portfolio.types';
import type { GalleryVisibility } from '@/types/gallery.types';
import type { BackendGalleryPiece } from '@/types/base.types';

// Import styled components
import styled from 'styled-components';
import {
  PageContainer,
  ContentWrapper,
  Card,
  CardContent,
  BaseButton,
  Badge,
  LoadingContainer,
  LoadingSpinner,
  ErrorContainer,
  EmptyState,
  FlexRow,
  FlexColumn,
  Input,
  TextArea,
  Label,
  FormGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  TabContainer,
  TabButton
} from '@/styles/styled-components';

// ============= TYPES =============
type GalleryLayout = 'canvas' | 'grid' | 'masonry' | 'list';

interface GalleryStats {
  totalPieces: number;
  publicPieces: number;
  privatePieces: number;
  unlistedPieces: number;
  categories: Record<string, number>;
  recentUploads: number;
  lastUpdated: string;
}

// ============= STYLED COMPONENTS =============
const StudioHeader = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 40;
  padding: 1rem 2rem;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const HeaderTitle = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchBox = styled.div`
  position: relative;
  width: 280px;
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
  padding-right: 2rem;
  height: 40px;
  font-size: 0.875rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #9ca3af;
  
  &:hover {
    color: #666;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
  }
`;

const MainContent = styled.main`
  padding: 2rem;
  min-height: calc(100vh - 200px);
`;

const GalleryGrid = styled.div<{ $layout: GalleryLayout }>`
  ${({ $layout }) => {
    switch ($layout) {
      case 'grid':
        return `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        `;
      case 'masonry':
        return `
          column-count: 5;
          column-gap: 1.5rem;
          
          @media (max-width: 1400px) { column-count: 4; }
          @media (max-width: 1024px) { column-count: 3; }
          @media (max-width: 768px) { column-count: 2; }
          @media (max-width: 480px) { column-count: 1; }
        `;
      case 'canvas':
        return `
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        `;
      case 'list':
        return `
          display: flex;
          flex-direction: column;
          gap: 1rem;
        `;
      default:
        return '';
    }
  }}
`;

const ArtworkItem = styled.div<{ $layout: GalleryLayout; $selected: boolean }>`
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${({ $layout }) => $layout === 'masonry' && `
    break-inside: avoid;
    margin-bottom: 1.5rem;
  `}
  
  ${({ $layout }) => $layout === 'list' && `
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
  `}
  
  ${({ $selected }) => $selected && `
    box-shadow: 0 0 0 3px #3b82f6;
  `}
  
  &:hover {
    transform: ${({ $layout }) => $layout !== 'list' ? 'translateY(-4px)' : 'none'};
    box-shadow: ${({ $selected }) => $selected 
      ? '0 0 0 3px #3b82f6, 0 8px 24px rgba(0, 0, 0, 0.15)'
      : '0 8px 24px rgba(0, 0, 0, 0.15)'};
  }
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const ArtworkOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1rem;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ArtworkItem}:hover & {
    opacity: 1;
  }
`;

const ArtworkActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ArtworkItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const SelectionCheckbox = styled.input`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 2;
`;

const BulkActionsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
`;

const NotificationToast = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${({ $type }) => {
    switch ($type) {
      case 'success':
        return `
          background: #10b981;
          color: white;
        `;
      case 'error':
        return `
          background: #ef4444;
          color: white;
        `;
      case 'info':
        return `
          background: #3b82f6;
          color: white;
        `;
    }
  }}
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const UploadProgressCard = styled(Card)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 320px;
  z-index: 100;
`;

// ============= MAIN COMPONENT =============
export default function CreativeStudio() {
  // Core state
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [galleryPieces, setGalleryPieces] = useState<BackendGalleryPiece[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  
  // UI state
  const [layout, setLayout] = useState<GalleryLayout>('canvas');
  const [selectedPieces, setSelectedPieces] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<GalleryVisibility | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPiece, setEditingPiece] = useState<BackendGalleryPiece | null>(null);
  
  // Upload progress tracking
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());

  // ============= DATA FETCHING =============
  const loadPortfolioData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch portfolio
      const portfolioData = await api.portfolio.get();
      if (!portfolioData) {
        showNotification('error', 'No portfolio found. Please create a portfolio first.');
        return;
      }
      setPortfolio(portfolioData);

      // Fetch gallery pieces
      const galleryResponse = await api.portfolio.gallery.get({
        page: 1,
        limit: 100,
        visibility: 'all'
      });
      setGalleryPieces(galleryResponse.galleryPieces || []);

      // Fetch stats
      const statsResponse = await api.portfolio.gallery.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

    } catch (error: any) {
      console.error('Failed to load portfolio data:', error);
      showNotification('error', error.message || 'Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // ============= NOTIFICATION SYSTEM =============
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // ============= PIECE MANAGEMENT =============
  const handleUploadSuccess = useCallback(() => {
    setShowUploadModal(false);
    loadPortfolioData();
    showNotification('success', 'Artwork uploaded successfully!');
  }, [loadPortfolioData]);

  const updatePiece = useCallback(async (pieceId: string, updates: Partial<BackendGalleryPiece>) => {
    try {
      setIsSaving(true);
      await api.portfolio.gallery.update(pieceId, updates);
      
      setGalleryPieces(prev => prev.map(p => 
        (p.id === pieceId || p._id === pieceId) ? { ...p, ...updates } : p
      ));
      
      showNotification('success', 'Artwork updated successfully');
      setEditingPiece(null);
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update artwork');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deletePieces = useCallback(async (pieceIds: string[]) => {
    if (!confirm(`Delete ${pieceIds.length} artwork(s)? This cannot be undone.`)) {
      return;
    }

    try {
      setIsSaving(true);
      
      if (pieceIds.length === 1) {
        await api.portfolio.gallery.delete(pieceIds[0]);
      } else {
        await api.portfolio.gallery.batchDelete(pieceIds);
      }

      setGalleryPieces(prev => prev.filter(p => 
        !pieceIds.includes(p.id || p._id || '')
      ));
      setSelectedPieces(new Set());
      showNotification('success', `Deleted ${pieceIds.length} artwork(s)`);

    } catch (error: any) {
      showNotification('error', error.message || 'Failed to delete artworks');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateVisibility = useCallback(async (pieceIds: string[], visibility: GalleryVisibility) => {
    try {
      setIsSaving(true);
      await api.portfolio.gallery.batchUpdateVisibility(pieceIds, visibility);

      setGalleryPieces(prev => prev.map(p => 
        pieceIds.includes(p.id || p._id || '') ? { ...p, visibility } : p
      ));
      
      showNotification('success', `Updated visibility for ${pieceIds.length} artwork(s)`);
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update visibility');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ============= SELECTION HANDLERS =============
  const toggleSelection = useCallback((pieceId: string) => {
    setSelectedPieces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pieceId)) {
        newSet.delete(pieceId);
      } else {
        newSet.add(pieceId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = filteredPieces.map(p => p.id || p._id || '').filter(Boolean);
    setSelectedPieces(new Set(allIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPieces(new Set());
  }, []);

  // ============= FILTERING =============
  const filteredPieces = galleryPieces.filter(piece => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        piece.title?.toLowerCase().includes(query) ||
        piece.description?.toLowerCase().includes(query) ||
        piece.artist?.toLowerCase().includes(query) ||
        piece.tags?.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }

    if (filterVisibility !== 'all' && piece.visibility !== filterVisibility) {
      return false;
    }

    if (filterCategory !== 'all' && piece.category !== filterCategory) {
      return false;
    }

    return true;
  });

  const getPieceId = (piece: BackendGalleryPiece): string => {
    return piece.id || piece._id || '';
  };

  // ============= RENDER =============
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading Creative Studio...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!portfolio) {
    return (
      <PageContainer>
        <ErrorContainer>
          <AlertCircle size={48} color="#ef4444" />
          <h2>No Portfolio Found</h2>
          <p>Please create a portfolio to access the Creative Studio.</p>
          <BaseButton onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </BaseButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <StudioHeader>
        <HeaderTop>
          <FlexRow $gap="2rem" $align="center">
            <HeaderTitle>Creative Studio</HeaderTitle>
            {stats && (
              <StatsRow>
                <span>{stats.totalPieces} artworks</span>
                <span>•</span>
                <span>{stats.publicPieces} public</span>
                <span>•</span>
                <span>{stats.privatePieces} private</span>
              </StatsRow>
            )}
          </FlexRow>

          <HeaderActions>
            <SearchBox>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <ClearButton onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </ClearButton>
              )}
            </SearchBox>

            <TabContainer>
              <TabButton
                $active={layout === 'canvas'}
                onClick={() => setLayout('canvas')}
              >
                <Layers size={16} />
                Canvas
              </TabButton>
              <TabButton
                $active={layout === 'grid'}
                onClick={() => setLayout('grid')}
              >
                <LayoutGrid size={16} />
                Grid
              </TabButton>
              <TabButton
                $active={layout === 'masonry'}
                onClick={() => setLayout('masonry')}
              >
                <Columns size={16} />
                Masonry
              </TabButton>
              <TabButton
                $active={layout === 'list'}
                onClick={() => setLayout('list')}
              >
                <List size={16} />
                List
              </TabButton>
            </TabContainer>

            {selectedPieces.size > 0 && (
              <BulkActionsBar>
                <span>{selectedPieces.size} selected</span>
                <BaseButton
                  $variant="ghost"
                  onClick={() => updateVisibility(Array.from(selectedPieces), 'public')}
                  style={{ padding: '0.5rem', minHeight: 'auto' }}
                >
                  <Eye size={16} />
                </BaseButton>
                <BaseButton
                  $variant="ghost"
                  onClick={() => updateVisibility(Array.from(selectedPieces), 'private')}
                  style={{ padding: '0.5rem', minHeight: 'auto' }}
                >
                  <EyeOff size={16} />
                </BaseButton>
                <BaseButton
                  $variant="ghost"
                  onClick={() => deletePieces(Array.from(selectedPieces))}
                  style={{ padding: '0.5rem', minHeight: 'auto', color: '#ef4444' }}
                >
                  <Trash2 size={16} />
                </BaseButton>
                <button
                  onClick={clearSelection}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer',
                    textDecoration: 'underline' 
                  }}
                >
                  Clear
                </button>
              </BulkActionsBar>
            )}

            <BaseButton onClick={() => setShowUploadModal(true)}>
              <Plus size={16} />
              Add Artwork
            </BaseButton>

            <BaseButton $variant="ghost" onClick={loadPortfolioData}>
              <RefreshCw size={16} />
            </BaseButton>
          </HeaderActions>
        </HeaderTop>

        <FiltersBar>
          <Filter size={16} color="#666" />
          <FilterSelect
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value as any)}
          >
            <option value="all">All visibility</option>
            <option value="public">Public only</option>
            <option value="private">Private only</option>
            <option value="unlisted">Unlisted only</option>
          </FilterSelect>

          <FilterSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="abstract">Abstract</option>
            <option value="digital">Digital Art</option>
            <option value="photography">Photography</option>
          </FilterSelect>

          {filteredPieces.length !== galleryPieces.length && (
            <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: 'auto' }}>
              Showing {filteredPieces.length} of {galleryPieces.length}
            </span>
          )}

          {filteredPieces.length > 0 && (
            <button
              onClick={selectAll}
              style={{ 
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Select All
            </button>
          )}
        </FiltersBar>
      </StudioHeader>

      <MainContent>
        {filteredPieces.length === 0 ? (
          <EmptyState>
            <Image size={64} color="#d1d5db" />
            <h3>
              {searchQuery || filterVisibility !== 'all' || filterCategory !== 'all' 
                ? 'No artworks match your filters' 
                : 'Your gallery is empty'}
            </h3>
            <p>
              {searchQuery || filterVisibility !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by uploading your first artwork'}
            </p>
            {!searchQuery && filterVisibility === 'all' && filterCategory === 'all' && (
              <BaseButton onClick={() => setShowUploadModal(true)}>
                Upload Artwork
              </BaseButton>
            )}
          </EmptyState>
        ) : (
          <GalleryGrid $layout={layout}>
            {filteredPieces.map((piece) => {
              const pieceId = getPieceId(piece);
              const isSelected = selectedPieces.has(pieceId);
              
              return (
                <ArtworkItem
                  key={pieceId}
                  $layout={layout}
                  $selected={isSelected}
                  onClick={() => layout === 'list' ? null : toggleSelection(pieceId)}
                >
                  <SelectionCheckbox
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(pieceId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {layout === 'list' ? (
                    <FlexRow $gap="1rem" style={{ width: '100%' }}>
                      <img 
                        src={piece.thumbnailUrl || piece.imageUrl}
                        alt={piece.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <FlexColumn $gap="0.5rem" style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>{piece.title}</h3>
                        {piece.description && (
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                            {piece.description}
                          </p>
                        )}
                        <FlexRow $gap="1rem">
                          <Badge $variant={
                            piece.visibility === 'public' ? 'success' :
                            piece.visibility === 'private' ? 'error' : 'warning'
                          }>
                            {piece.visibility}
                          </Badge>
                          {piece.category && <span style={{ fontSize: '0.875rem', color: '#666' }}>{piece.category}</span>}
                          {piece.year && <span style={{ fontSize: '0.875rem', color: '#666' }}>{piece.year}</span>}
                        </FlexRow>
                      </FlexColumn>
                      <FlexRow $gap="0.5rem">
                        <ActionButton onClick={(e) => {
                          e.stopPropagation();
                          setEditingPiece(piece);
                        }}>
                          <Edit3 size={16} />
                        </ActionButton>
                        <ActionButton onClick={(e) => {
                          e.stopPropagation();
                          deletePieces([pieceId]);
                        }}>
                          <Trash2 size={16} color="#ef4444" />
                        </ActionButton>
                      </FlexRow>
                    </FlexRow>
                  ) : (
                    <>
                      <ArtworkImage 
                        src={piece.thumbnailUrl || piece.imageUrl}
                        alt={piece.title}
                      />
                      
                      <ArtworkActions>
                        <ActionButton onClick={(e) => {
                          e.stopPropagation();
                          const newVisibility = piece.visibility === 'public' ? 'private' : 'public';
                          updateVisibility([pieceId], newVisibility);
                        }}>
                          {piece.visibility === 'public' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </ActionButton>
                        <ActionButton onClick={(e) => {
                          e.stopPropagation();
                          setEditingPiece(piece);
                        }}>
                          <Edit3 size={16} />
                        </ActionButton>
                      </ArtworkActions>
                      
                      <ArtworkOverlay>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{piece.title}</h3>
                        {piece.artist && (
                          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>{piece.artist}</p>
                        )}
                      </ArtworkOverlay>
                      
                      {piece.visibility !== 'public' && (
                        <Badge 
                          $variant={piece.visibility === 'private' ? 'error' : 'warning'}
                          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                        >
                          {piece.visibility}
                        </Badge>
                      )}
                    </>
                  )}
                </ArtworkItem>
              );
            })}
          </GalleryGrid>
        )}
      </MainContent>

      {/* Upload Modal */}
      {showUploadModal && portfolio && (
        <ArtworkUploadModal
          portfolioId={portfolio.id || portfolio._id || ''}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Edit Modal */}
      {editingPiece && (
        <EditArtworkModal
          piece={editingPiece}
          onSave={updatePiece}
          onClose={() => setEditingPiece(null)}
          isSaving={isSaving}
        />
      )}

      {/* Notifications */}
      {notification && (
        <NotificationToast $type={notification.type}>
          {notification.type === 'success' && <Check size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.message}
        </NotificationToast>
      )}

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <UploadProgressCard>
          <CardContent $padding="md">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Uploading...</h3>
            {Array.from(uploadingFiles.entries()).map(([filename, progress]) => (
              <div key={filename} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{filename}</div>
                <div style={{ background: '#f0f0f0', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      background: '#3b82f6', 
                      height: '100%', 
                      width: `${progress}%`,
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </UploadProgressCard>
      )}
    </PageContainer>
  );
}

// ============= EDIT MODAL COMPONENT =============
interface EditModalProps {
  piece: BackendGalleryPiece;
  onSave: (id: string, updates: Partial<BackendGalleryPiece>) => void;
  onClose: () => void;
  isSaving: boolean;
}

function EditArtworkModal({ piece, onSave, onClose, isSaving }: EditModalProps) {
  const [formData, setFormData] = useState({
    title: piece.title || '',
    description: piece.description || '',
    artist: piece.artist || '',
    category: piece.category || '',
    visibility: piece.visibility || 'public',
    year: piece.year || new Date().getFullYear(),
    price: piece.price || 0,
    tags: piece.tags?.join(', ') || '',
    medium: piece.medium || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pieceId = piece.id || piece._id || '';
    
    onSave(pieceId, {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      year: parseInt(formData.year.toString()),
      price: parseFloat(formData.price.toString()) || undefined
    });
  };

  return (
    <Modal $isOpen={true}>
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <FlexRow $justify="space-between">
            <ModalTitle>Edit Artwork</ModalTitle>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            >
              <X size={20} />
            </button>
          </FlexRow>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <Label>Title *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Artist</Label>
                <Input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                />
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <FilterSelect
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  <option value="">Select category</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="abstract">Abstract</option>
                  <option value="digital">Digital Art</option>
                  <option value="photography">Photography</option>
                </FilterSelect>
              </FormGroup>

              <FormGroup>
                <Label>Visibility</Label>
                <FilterSelect
                  value={formData.visibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as GalleryVisibility }))}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </FilterSelect>
              </FormGroup>

              <FormGroup>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                />
              </FormGroup>

              <FormGroup>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Medium</Label>
              <Input
                type="text"
                value={formData.medium}
                onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                placeholder="Oil on canvas, Digital, Watercolor..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Tags (comma-separated)</Label>
              <Input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="abstract, landscape, oil painting..."
              />
            </FormGroup>
          </ModalBody>
          
          <ModalFooter>
            <BaseButton type="button" $variant="secondary" onClick={onClose}>
              Cancel
            </BaseButton>
            <BaseButton type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </BaseButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}