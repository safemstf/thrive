// src/app/dashboard/gallery/edit/[id]/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import { 
  ArrowLeft, Save, Trash2, Image as ImageIcon, 
  Lock, Loader2, AlertCircle 
} from 'lucide-react';
import { useMyGalleryPieces, useUpdateGalleryPiece, useDeleteGalleryPiece } from '@/hooks/useGalleryApi';
import { useAuth } from '@/providers/authProvider';
import { Button } from '@/components/ui/button';
import { VisibilityToggle } from '@/components/gallery/rendering';
import type { GalleryPiece, GalleryVisibility } from '@/types/gallery.types';

export default function GalleryEditPage() {
  const router = useRouter();
  const params = useParams();
  const pieceId = params.id as string;
  const { user } = useAuth();
  
  // API hooks - Get all pieces and find the one we need
  const { data: allPieces, isLoading, error } = useMyGalleryPieces();
  const updateMutation = useUpdateGalleryPiece();
  const deleteMutation = useDeleteGalleryPiece();
  
  // Find the specific piece from all pieces
  const piece = useMemo(() => {
    return allPieces?.find(p => p.id === pieceId);
  }, [allPieces, pieceId]);
  
  // Form state - Updated to match actual GalleryPiece type
  const [formData, setFormData] = useState<Partial<GalleryPiece>>({
    title: '',
    description: '',
    category: undefined, // Fixed: use undefined instead of empty string
    medium: '',
    year: new Date().getFullYear(),
    visibility: 'private',
    tags: [],
    displayOrder: 0,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form with piece data
  useEffect(() => {
    if (piece) {
      setFormData({
        title: piece.title || '',
        description: piece.description || '',
        category: piece.category || undefined, // Fixed: use undefined instead of empty string
        medium: piece.medium || '',
        year: piece.year || new Date().getFullYear(),
        visibility: piece.visibility || 'private',
        tags: piece.tags || [],
        displayOrder: piece.displayOrder || 0,
        // Add any other fields that are supported by your API
      });
    }
  }, [piece]);
  
  // Check for changes
  useEffect(() => {
    if (piece) {
      const changed = Object.keys(formData).some(key => {
        const formValue = formData[key as keyof typeof formData];
        const pieceValue = piece[key as keyof GalleryPiece];
        return JSON.stringify(formValue) !== JSON.stringify(pieceValue);
      });
      setHasChanges(changed);
    }
  }, [formData, piece]);
  
  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle category field specially to ensure type safety
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value === '' ? undefined : value as any // Allow empty string to become undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value
      }));
    }
  };
  
  const handleVisibilityChange = (visibility: GalleryVisibility) => {
    setFormData(prev => ({ ...prev, visibility }));
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
    if (!piece || !hasChanges) return;
    
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        pieceId: piece.id, // Updated to use pieceId
        updates: formData
      });
      router.push('/dashboard/gallery');
    } catch (error) {
      console.error('Failed to update piece:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!piece) return;
    
    if (window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(piece.id);
        router.push('/dashboard/gallery');
      } catch (error) {
        console.error('Failed to delete piece:', error);
      }
    }
  };
  
  // Check permissions - simplified since these are your own pieces
  const canEdit = piece && user;
  
  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <p>Loading artwork...</p>
      </LoadingContainer>
    );
  }
  
  if (error || !piece) {
    return (
      <ErrorContainer>
        <AlertCircle size={48} />
        <h2>Artwork not found</h2>
        <p>This artwork may have been deleted or doesn't exist.</p>
        <Button onClick={() => router.push('/dashboard/gallery')}>
          Back to Gallery
        </Button>
      </ErrorContainer>
    );
  }
  
  if (!canEdit) {
    return (
      <ErrorContainer>
        <Lock size={48} />
        <h2>Access Denied</h2>
        <p>You don't have permission to edit this artwork.</p>
        <Button onClick={() => router.push('/dashboard/gallery')}>
          Back to Gallery
        </Button>
      </ErrorContainer>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton onClick={() => router.push('/dashboard/gallery')}>
          <ArrowLeft size={20} />
          Back to Gallery
        </BackButton>
        
        <HeaderActions>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={16} />
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </HeaderActions>
      </Header>
      
      <Content>
        <ImageSection>
          <ImagePreview>
            {piece.imageUrl ? (
              <img src={piece.imageUrl} alt={piece.title} />
            ) : (
              <ImagePlaceholder>
                <ImageIcon size={48} />
              </ImagePlaceholder>
            )}
          </ImagePreview>
          
          <ImageInfo>
            <InfoItem>
              <strong>Uploaded:</strong> {piece.createdAt ? new Date(piece.createdAt).toLocaleDateString() : 'Unknown'}
            </InfoItem>
            <InfoItem>
              <strong>Last Updated:</strong> {piece.updatedAt ? new Date(piece.updatedAt).toLocaleDateString() : 'Unknown'}
            </InfoItem>
            {piece.displayOrder !== undefined && (
              <InfoItem>
                <strong>Display Order:</strong> {piece.displayOrder}
              </InfoItem>
            )}
            {piece.views !== undefined && (
              <InfoItem>
                <strong>Views:</strong> {piece.views}
              </InfoItem>
            )}
            {piece.likes !== undefined && (
              <InfoItem>
                <strong>Likes:</strong> {piece.likes}
              </InfoItem>
            )}
            {piece.fileSize && (
              <InfoItem>
                <strong>File Size:</strong> {(piece.fileSize / 1024 / 1024).toFixed(2)} MB
              </InfoItem>
            )}
            {piece.dimensions && (
              <InfoItem>
                <strong>Dimensions:</strong> {piece.dimensions.width} × {piece.dimensions.height}
                {piece.dimensions.depth && ` × ${piece.dimensions.depth}`} {piece.dimensions.unit}
              </InfoItem>
            )}
          </ImageInfo>
        </ImageSection>
        
        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Artwork title"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your artwork..."
              rows={4}
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label>Category</Label>
              <Input
                name="category"
                value={formData.category || ''} // Convert undefined to empty string for input
                onChange={handleInputChange}
                placeholder="e.g., Painting, Digital Art"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Medium</Label>
              <Input
                name="medium"
                value={formData.medium}
                onChange={handleInputChange}
                placeholder="e.g., Oil on canvas"
              />
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label>Year</Label>
              <Input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Display Order</Label>
              <Input
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                placeholder="Lower numbers appear first"
              />
            </FormGroup>
          </FormRow>
          
          <FormGroup>
            <Label>Tags</Label>
            <TagInput>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags..."
              />
              <Button type="button" onClick={handleAddTag} size="small">
                Add
              </Button>
            </TagInput>
            <TagList>
              {formData.tags?.map(tag => (
                <Tag key={tag}>
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>×</button>
                </Tag>
              ))}
            </TagList>
          </FormGroup>
          
          <SectionTitle>Visibility & Settings</SectionTitle>
          
          <FormGroup>
            <Label>Visibility</Label>
            <VisibilityToggle
              value={formData.visibility || 'private'}
              onChange={handleVisibilityChange}
            />
            <VisibilityHelp>
              <strong>Public:</strong> Visible to everyone<br/>
              <strong>Private:</strong> Only visible to you<br/>
              <strong>Unlisted:</strong> Not shown in public galleries but accessible via direct link
            </VisibilityHelp>
          </FormGroup>
          
          {/* Additional metadata display */}
          <SectionTitle>Metadata</SectionTitle>
          
          <MetadataGrid>
            <MetadataItem>
              <MetadataLabel>File Type</MetadataLabel>
              <MetadataValue>{piece.mimeType || 'Unknown'}</MetadataValue>
            </MetadataItem>
            
            <MetadataItem>
              <MetadataLabel>Original Filename</MetadataLabel>
              <MetadataValue>{piece.originalFileName || 'N/A'}</MetadataValue>
            </MetadataItem>
            
            {piece.alt && (
              <MetadataItem>
                <MetadataLabel>Alt Text</MetadataLabel>
                <MetadataValue>{piece.alt}</MetadataValue>
              </MetadataItem>
            )}
            
            {piece.shareToken && (
              <MetadataItem>
                <MetadataLabel>Share Token</MetadataLabel>
                <MetadataValue>{piece.shareToken}</MetadataValue>
              </MetadataItem>
            )}
          </MetadataGrid>
        </FormSection>
      </Content>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ImageSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
`;

const ImagePreview = styled.div`
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const ImageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  
  strong {
    color: #374151;
  }
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
  
  &:not(:first-child) {
    margin-top: 2.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 999px;
  font-size: 0.875rem;
  color: #374151;
  
  button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    
    &:hover {
      color: #374151;
    }
  }
`;

const VisibilityHelp = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  line-height: 1.4;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const MetadataItem = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const MetadataLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const MetadataValue = styled.div`
  font-size: 0.875rem;
  color: #374151;
  word-break: break-all;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
  
  h2 {
    font-size: 1.5rem;
    color: #111827;
    margin: 0;
  }
  
  p {
    color: #6b7280;
    max-width: 400px;
  }
`;