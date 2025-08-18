// src/app/dashboard/gallery/edit/[id]/page.tsx - Redesigned with Golden Ratio & Offline
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Trash2, Image as ImageIcon, 
  Lock, Loader2, AlertCircle, Eye, EyeOff, Star,
  Tag, Calendar, Palette, DollarSign, Hash,
  Info, Wifi, WifiOff, RefreshCw, Check, X,
  Upload, Download, Share2, Heart, Camera,
  Edit3, Settings, Archive, Sparkles,
  Brush
} from 'lucide-react';

// Import your existing hook and types
import { useOffline } from '@/hooks/useOffline';
import type { 
  GalleryPiece, 
  GalleryVisibility, 
  ArtworkCategory
} from '@/types/gallery.types';

// Import your styled components and theme system
import {
  PageContainer,
  Card,
  BaseButton,
  Badge,
  LoadingContainer,
  LoadingSpinner,
  Input,
  TextArea,
  Label,
  FormGroup,
  Header,
  HeaderContent,
  Container,
  FlexRow,
  FlexColumn,
  MessageContainer,
  responsive,
  fadeIn,
  float
} from '@/styles/styled-components';
import styled from 'styled-components';

// ===========================================
// GOLDEN RATIO DESIGN SYSTEM
// ===========================================
const GOLDEN_RATIO = 1.618;
const GOLDEN_SCALE = {
  xs: `var(--spacing-xs, 0.618rem)`,
  sm: `var(--spacing-sm, 1rem)`,
  md: `var(--spacing-md, 1.618rem)`,
  lg: `var(--spacing-lg, 2.618rem)`,
  xl: `var(--spacing-xl, 4.236rem)`,
  xxl: `var(--spacing-2xl, 6.854rem)`,
  xxxl: `var(--spacing-3xl, 11.09rem)`
};

// ===========================================
// THEMED STYLED COMPONENTS
// ===========================================

const EditContainer = styled(PageContainer)`
  position: relative;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 38.2% 61.8%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 61.8% 38.2%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const EditHeader = styled(Header)`
  padding: ${GOLDEN_SCALE.lg} 0;
  
  ${responsive.below.md} {
    padding: ${GOLDEN_SCALE.md} 0;
  }
`;

const EditHeaderContent = styled(HeaderContent)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: ${GOLDEN_SCALE.lg};
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
    gap: ${GOLDEN_SCALE.md};
    text-align: center;
  }
`;

const HeaderTitle = styled.div`
  .edit-title {
    margin: 0 0 ${GOLDEN_SCALE.xs} 0;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 300;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, var(--color-text-primary), var(--color-primary-600));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .edit-subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.xs};
  }
`;

const StatusIndicator = styled.div<{ $online: boolean }>`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  padding: ${GOLDEN_SCALE.xs} ${GOLDEN_SCALE.sm};
  background: ${props => props.$online ? 'var(--color-success-50)' : 'var(--color-warning-50)'};
  border: 1px solid ${props => props.$online ? 'var(--color-success-200)' : 'var(--color-warning-200)'};
  color: ${props => props.$online ? 'var(--color-success-600)' : 'var(--color-warning-600)'};
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${GOLDEN_SCALE.sm};
  align-items: center;
  
  ${responsive.below.md} {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${GOLDEN_SCALE.xl} var(--spacing-md);
  position: relative;
  z-index: 1;
  
  display: grid;
  grid-template-columns: ${GOLDEN_RATIO}fr 1fr;
  gap: ${GOLDEN_SCALE.xl};
  
  ${responsive.below.lg} {
    grid-template-columns: 1fr;
    gap: ${GOLDEN_SCALE.lg};
  }
  
  ${responsive.below.md} {
    padding: ${GOLDEN_SCALE.lg} var(--spacing-sm);
  }
`;

const ArtworkPreview = styled(Card).attrs({ $glass: true })`
  height: fit-content;
  position: sticky;
  top: calc(120px + ${GOLDEN_SCALE.lg});
  
  ${responsive.below.lg} {
    position: relative;
    top: auto;
  }
`;

const PreviewImage = styled.div`
  position: relative;
  aspect-ratio: ${GOLDEN_RATIO}/1;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: ${GOLDEN_SCALE.md};
  border: 2px solid var(--color-border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: var(--color-primary-500);
    transform: scale(1.02);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: linear-gradient(135deg, var(--color-background-tertiary), var(--color-background-secondary));
    color: var(--color-text-secondary);
    gap: ${GOLDEN_SCALE.sm};
    
    .placeholder-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-primary-100);
      color: var(--color-primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const PreviewOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: ${GOLDEN_SCALE.md};
  
  .preview-title {
    margin: 0 0 ${GOLDEN_SCALE.xs} 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }
  
  .preview-meta {
    display: flex;
    gap: ${GOLDEN_SCALE.sm};
    font-size: 0.75rem;
    opacity: 0.9;
  }
`;

const ArtworkStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${GOLDEN_SCALE.sm};
  margin-bottom: ${GOLDEN_SCALE.md};
  
  .stat-item {
    text-align: center;
    padding: ${GOLDEN_SCALE.sm};
    background: var(--color-background-tertiary);
    border-radius: var(--radius-xs);
    border: 1px solid var(--color-border-light);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: var(--color-primary-50);
      border-color: var(--color-primary-200);
      transform: translateY(-1px);
    }
    
    .stat-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      font-family: var(--font-mono);
      margin-bottom: 0.125rem;
    }
    
    .stat-label {
      font-size: 0.625rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
  }
`;

const MetadataSection = styled.div`
  .metadata-title {
    margin: 0 0 ${GOLDEN_SCALE.md} 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.xs};
  }
  
  .metadata-grid {
    display: flex;
    flex-direction: column;
    gap: ${GOLDEN_SCALE.sm};
  }
  
  .metadata-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${GOLDEN_SCALE.sm};
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-xs);
    font-size: 0.875rem;
    
    .metadata-label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    
    .metadata-value {
      color: var(--color-text-primary);
      font-family: var(--font-mono);
      font-weight: 600;
      text-align: right;
    }
  }
`;

const EditForm = styled(Card).attrs({ $glass: true })`
  animation: ${fadeIn} 0.6s ease-out;
`;

const FormSection = styled.div`
  margin-bottom: ${GOLDEN_SCALE.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.sm};
    margin-bottom: ${GOLDEN_SCALE.lg};
    padding-bottom: ${GOLDEN_SCALE.sm};
    border-bottom: 2px solid var(--color-border-light);
  }
  
  .section-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .section-icon {
    padding: ${GOLDEN_SCALE.xs};
    background: var(--color-primary-100);
    color: var(--color-primary-600);
    border-radius: var(--radius-xs);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${GOLDEN_SCALE.md};
  margin-bottom: ${GOLDEN_SCALE.md};
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
  }
`;

const EnhancedFormGroup = styled(FormGroup)`
  position: relative;
  
  .enhanced-label {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.xs};
    margin-bottom: ${GOLDEN_SCALE.sm};
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    
    .label-icon {
      color: var(--color-primary-600);
    }
    
    .required-indicator {
      color: var(--color-error-500);
    }
  }
  
  .field-hint {
    margin-top: ${GOLDEN_SCALE.xs};
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }
`;

const PriceField = styled.div`
  position: relative;
  
  .price-symbol {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    font-weight: 600;
    z-index: 2;
  }
  
  .price-input {
    padding-left: 2.5rem;
  }
`;

const TagManager = styled.div`
  .tag-input-row {
    display: flex;
    gap: ${GOLDEN_SCALE.sm};
    margin-bottom: ${GOLDEN_SCALE.md};
  }
  
  .tag-input {
    flex: 1;
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: ${GOLDEN_SCALE.xs};
  }
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  padding: ${GOLDEN_SCALE.xs} ${GOLDEN_SCALE.sm};
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  
  .remove-tag {
    background: none;
    border: none;
    color: var(--color-primary-600);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    
    &:hover {
      color: var(--color-primary-800);
    }
  }
`;

const VisibilitySelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${GOLDEN_SCALE.xs};
  
  .visibility-option {
    padding: ${GOLDEN_SCALE.md};
    border: 1px solid var(--color-border-medium);
    border-radius: var(--radius-xs);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--color-background-secondary);
    
    &.selected {
      border-color: var(--color-primary-500);
      background: var(--color-primary-50);
      color: var(--color-primary-700);
    }
    
    &:hover:not(.selected) {
      border-color: var(--color-primary-300);
      background: var(--color-primary-25);
    }
    
    .option-icon {
      margin-bottom: ${GOLDEN_SCALE.xs};
      padding: ${GOLDEN_SCALE.xs};
      border-radius: 50%;
      background: currentColor;
      color: white;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto ${GOLDEN_SCALE.xs};
    }
    
    .option-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .option-description {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      line-height: 1.3;
    }
  }
`;

const SaveIndicator = styled(MessageContainer)<{ $visible: boolean }>`
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 1000;
  transform: translateY(${({ $visible }) => $visible ? '0' : '100px'});
  opacity: ${({ $visible }) => $visible ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(var(--glass-blur));
`;

// ===========================================
// MAIN COMPONENT
// ===========================================
export default function GalleryEditPage() {
  const router = useRouter();
  const params = useParams();
  const artworkId = params.id as string;

  // Use your existing offline hook
  const { 
    isOffline, 
    isSyncing, 
    hasOfflineData, 
    getOfflineData,
    syncData 
  } = useOffline();

  // State using your GalleryPiece type
  const [artwork, setArtwork] = useState<GalleryPiece | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Form state - using Partial<GalleryPiece> for editing
  const [formData, setFormData] = useState<Partial<GalleryPiece>>({});
  const [tagInput, setTagInput] = useState('');

  // Initialize data
  useEffect(() => {
    const loadArtwork = async () => {
      setLoading(true);
      
      try {
        if (hasOfflineData) {
          const offlineData = getOfflineData();
          // Handle both id and _id formats when searching
          const offlineArtwork = offlineData?.galleryPieces?.find((p: GalleryPiece) => 
            p.id === artworkId || p._id === artworkId
          );
          
          if (offlineArtwork) {
            setArtwork(offlineArtwork);
            setFormData(offlineArtwork);
            setLoading(false);
            return;
          }
        }
        
        // If no offline data found, show error
        console.error('Artwork not found in offline data:', artworkId);
        
      } catch (error) {
        console.error('Failed to load artwork:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArtwork();
  }, [artworkId, hasOfflineData, getOfflineData]);

  // Track changes
  useEffect(() => {
    if (!artwork) return;
    
    const changed = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof GalleryPiece];
      const artworkValue = artwork[key as keyof GalleryPiece];
      return JSON.stringify(formValue) !== JSON.stringify(artworkValue);
    });
    
    setHasChanges(changed);
  }, [formData, artwork]);

  const handleInputChange = (field: keyof GalleryPiece, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSave = async () => {
    if (!artwork || !hasChanges) return;
    
    setSaving(true);
    
    try {
      // Simulate save with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update artwork
      const updatedArtwork = { ...artwork, ...formData, updatedAt: new Date() };
      setArtwork(updatedArtwork);
      
      // Show success indicator
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      
      // Sync offline data if available
      if (hasOfflineData) {
        const offlineData = getOfflineData();
        if (offlineData?.galleryPieces) {
          const updatedPieces = offlineData.galleryPieces.map((p: GalleryPiece) => 
            (p.id === artworkId || p._id === artworkId) ? updatedArtwork : p
          );
          
          syncData({
            ...offlineData,
            galleryPieces: updatedPieces
          });
        }
      }
      
    } catch (error) {
      console.error('Failed to save artwork:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!artwork) return;
    
    if (confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      try {
        // Update offline data by removing the piece
        if (hasOfflineData) {
          const offlineData = getOfflineData();
          if (offlineData?.galleryPieces) {
            const updatedPieces = offlineData.galleryPieces.filter((p: GalleryPiece) => 
              p.id !== artworkId && p._id !== artworkId
            );
            
            syncData({
              ...offlineData,
              galleryPieces: updatedPieces
            });
          }
        }
        
        // Navigate back to gallery
        router.push('/dashboard/gallery');
      } catch (error) {
        console.error('Failed to delete artwork:', error);
      }
    }
  };

  if (loading) {
    return (
      <EditContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading artwork editor...</p>
        </LoadingContainer>
      </EditContainer>
    );
  }

  if (!artwork) {
    return (
      <EditContainer>
        <Container>
          <FlexColumn $align="center" style={{ minHeight: '50vh', justifyContent: 'center', textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--color-error-500)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Artwork not found
            </h2>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              This artwork may have been deleted or doesn't exist.
            </p>
            <BaseButton 
              onClick={() => router.push('/dashboard/gallery')}
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              <ArrowLeft size={16} />
              Back to Gallery
            </BaseButton>
          </FlexColumn>
        </Container>
      </EditContainer>
    );
  }

  return (
    <EditContainer>
      <EditHeader>
        <Container>
          <EditHeaderContent>
            <BaseButton 
              $variant="ghost"
              onClick={() => router.push('/dashboard/gallery')}
            >
              <ArrowLeft size={16} />
              Back to Gallery
            </BaseButton>

            <HeaderTitle>
              <h1 className="edit-title">Edit Artwork</h1>
              <div className="edit-subtitle">
                <span>Last modified {artwork.updatedAt.toLocaleDateString()}</span>
                <StatusIndicator $online={!isOffline}>
                  {isOffline ? <WifiOff size={10} /> : <Wifi size={10} />}
                  {isOffline ? 'Offline Mode' : 'Live Editor'}
                </StatusIndicator>
              </div>
            </HeaderTitle>

            <HeaderActions>
              <BaseButton 
                $variant="danger" 
                onClick={handleDelete}
                disabled={isOffline}
              >
                <Trash2 size={16} />
                Delete
              </BaseButton>
              
              <BaseButton 
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </BaseButton>
            </HeaderActions>
          </EditHeaderContent>
        </Container>
      </EditHeader>

      <MainContent>
        {/* Preview Panel */}
        <ArtworkPreview>
          <PreviewImage>
            {artwork.imageUrl || artwork.thumbnailUrl ? (
              <img 
                src={artwork.imageUrl || artwork.thumbnailUrl} 
                alt={artwork.alt || artwork.title}
              />
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">
                  <ImageIcon size={24} />
                </div>
                <span>No image available</span>
              </div>
            )}
            
            <PreviewOverlay>
              <h3 className="preview-title">{formData.title || artwork.title}</h3>
              <div className="preview-meta">
                <span>{formData.category || artwork.category}</span>
                <span>•</span>
                <span>{formData.year || artwork.year}</span>
              </div>
            </PreviewOverlay>
          </PreviewImage>

          <ArtworkStats>
            {[
              { label: 'Views', value: artwork.views || 0 },
              { label: 'Likes', value: artwork.likes || 0 },
              { label: 'Order', value: artwork.displayOrder || 0 }
            ].map(stat => (
              <div key={stat.label} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </ArtworkStats>

          <MetadataSection>
            <h3 className="metadata-title">
              <Info size={16} />
              Metadata
            </h3>
            <div className="metadata-grid">
              {[
                { 
                  label: 'File Size', 
                  value: artwork.fileSize ? `${(artwork.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown' 
                },
                { 
                  label: 'Dimensions', 
                  value: artwork.dimensions 
                    ? `${artwork.dimensions.width}×${artwork.dimensions.height}${artwork.dimensions.unit}` 
                    : 'Unknown' 
                },
                { label: 'Type', value: artwork.mimeType || 'Unknown' },
                { label: 'Created', value: artwork.createdAt.toLocaleDateString() }
              ].map(item => (
                <div key={item.label} className="metadata-item">
                  <span className="metadata-label">{item.label}</span>
                  <span className="metadata-value">{item.value}</span>
                </div>
              ))}
            </div>
          </MetadataSection>
        </ArtworkPreview>

        {/* Edit Form */}
        <EditForm>
          {/* Basic Information */}
          <FormSection>
            <div className="section-header">
              <div className="section-icon">
                <Edit3 size={16} />
              </div>
              <h2 className="section-title">Basic Information</h2>
            </div>

            <EnhancedFormGroup>
              <div className="enhanced-label">
                <Sparkles size={14} className="label-icon" />
                Title
                <span className="required-indicator">*</span>
              </div>
              <Input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter artwork title"
                required
              />
            </EnhancedFormGroup>

            <EnhancedFormGroup>
              <div className="enhanced-label">
                <Camera size={14} className="label-icon" />
                Artist Name
              </div>
              <Input
                type="text"
                value={formData.artist || ''}
                onChange={(e) => handleInputChange('artist', e.target.value)}
                placeholder="Your name or pseudonym"
              />
            </EnhancedFormGroup>

            <EnhancedFormGroup>
              <div className="enhanced-label">
                <Edit3 size={14} className="label-icon" />
                Description
              </div>
              <TextArea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your artwork, inspiration, or technique..."
              />
              <div className="field-hint">
                Share the story behind your artwork or describe the techniques used.
              </div>
            </EnhancedFormGroup>

            <FormRow>
              <EnhancedFormGroup>
                <div className="enhanced-label">
                  <Palette size={14} className="label-icon" />
                  Category
                </div>
                <select
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--color-border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-background-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value as ArtworkCategory)}
                >
                  <option value="">Select category</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="abstract">Abstract</option>
                  <option value="mixed-media">Mixed Media</option>
                  <option value="Digital">Digital Art</option>
                  <option value="Design">Design</option>
                </select>
              </EnhancedFormGroup>

              <EnhancedFormGroup>
                <div className="enhanced-label">
                  <Brush size={14} className="label-icon" />
                  Medium
                </div>
                <Input
                  type="text"
                  value={formData.medium || ''}
                  onChange={(e) => handleInputChange('medium', e.target.value)}
                  placeholder="e.g., Oil on canvas, Digital, Watercolor"
                />
              </EnhancedFormGroup>
            </FormRow>

            <FormRow>
              <EnhancedFormGroup>
                <div className="enhanced-label">
                  <Calendar size={14} className="label-icon" />
                  Year
                </div>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min={1900}
                  max={new Date().getFullYear()}
                  placeholder="Creation year"
                />
              </EnhancedFormGroup>

              <EnhancedFormGroup>
                <div className="enhanced-label">
                  <DollarSign size={14} className="label-icon" />
                  Price (USD)
                </div>
                <PriceField>
                  <span className="price-symbol">$</span>
                  <Input
                    type="number"
                    className="price-input"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                  />
                </PriceField>
                <div className="field-hint">
                  Leave empty if not for sale
                </div>
              </EnhancedFormGroup>
            </FormRow>
          </FormSection>

          {/* Tags Section */}
          <FormSection>
            <div className="section-header">
              <div className="section-icon">
                <Tag size={16} />
              </div>
              <h2 className="section-title">Tags & Categories</h2>
            </div>

            <TagManager>
              <div className="tag-input-row">
                <Input
                  type="text"
                  className="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags to help organize and discover your work"
                />
                <BaseButton 
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Add Tag
                </BaseButton>
              </div>
              
              <div className="tags-list">
                {formData.tags?.map(tag => (
                  <TagItem key={tag}>
                    <span>{tag}</span>
                    <button 
                      className="remove-tag"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </TagItem>
                ))}
              </div>
            </TagManager>
          </FormSection>

          {/* Visibility Section */}
          <FormSection>
            <div className="section-header">
              <div className="section-icon">
                <Settings size={16} />
              </div>
              <h2 className="section-title">Visibility & Settings</h2>
            </div>

            <EnhancedFormGroup>
              <div className="enhanced-label">
                <Eye size={14} className="label-icon" />
                Visibility
              </div>
              <VisibilitySelector>
                {[
                  { value: 'public', icon: Eye, title: 'Public', description: 'Visible to everyone' },
                  { value: 'private', icon: EyeOff, title: 'Private', description: 'Only visible to you' },
                  { value: 'unlisted', icon: Archive, title: 'Draft', description: 'Work in progress' }
                ].map(option => (
                  <div 
                    key={option.value}
                    className={`visibility-option ${formData.visibility === option.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('visibility', option.value as GalleryVisibility)}
                  >
                    <div className="option-icon">
                      <option.icon size={14} />
                    </div>
                    <div className="option-title">{option.title}</div>
                    <div className="option-description">{option.description}</div>
                  </div>
                ))}
              </VisibilitySelector>
            </EnhancedFormGroup>
          </FormSection>
        </EditForm>
      </MainContent>

      <SaveIndicator $type="success" $visible={showSaved}>
        <Check size={16} />
        Changes saved successfully!
      </SaveIndicator>
    </EditContainer>
  );
}