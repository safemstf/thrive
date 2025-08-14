// components/gallery/utils/uploadModal.tsx - FIXED VERSION
'use client';

import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { 
  Upload, X, Image as ImageIcon, CheckCircle, 
  AlertCircle, Loader, Eye, EyeOff 
} from 'lucide-react';

import type { BackendGalleryPiece } from '@/types/base.types';
import api from '@/lib/api-client';

interface ArtworkUploadModalProps {
  portfolioId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialFiles?: File[]; 
}

interface UploadResponse {
  success: boolean;
  url: string;
  fileId: string;
  filename: string;
  size: number;
  contentType: string;
  message: string;
}

interface UploadState {
  step: 'select' | 'uploading' | 'details' | 'success' | 'error';
  imageUrl?: string;
  imageFile?: File;
  uploadProgress: number;
  error?: string;
}

interface ArtworkData {
  title: string;
  description: string;
  category: string;
  medium: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  year: number;
  price?: number;
  artist?: string;
}


export function ArtworkUploadModal({ portfolioId, onClose, onSuccess }: ArtworkUploadModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    step: 'select',
    uploadProgress: 0
  });

  const [artworkData, setArtworkData] = useState<ArtworkData>({
    title: '',
    description: '',
    category: 'portrait',
    medium: '',
    tags: [],
    visibility: 'public',
    year: new Date().getFullYear(),
    artist: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIXED: Enhanced image upload with proper error handling
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    console.log('[Upload] Starting image upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);  // Changed from 'image' to 'file' to match backend
    formData.append('type', 'gallery');

    try {
      const response = await fetch('/api/portfolios/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Don't set Content-Type header for FormData
      });

      console.log('[Upload] Response status:', response.status);
      console.log('[Upload] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Upload] Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `HTTP ${response.status}: ${errorText}` };
        }
        
        throw new Error(
          errorData.message || 
          errorData.error || 
          `Upload failed with status ${response.status}`
        );
      }

      const result = await response.json();
      console.log('[Upload] Success response:', result);

      // FIXED: Handle different response formats
      let imageUrl: string | null = null;
      
      if (result.success && result.data?.url) {
        // New format: { success: true, data: { url: "..." } }
        imageUrl = result.data.url;
      } else if (result.url) {
        // Legacy format: { url: "..." }
        imageUrl = result.url;
      } else if (result.fileUrl) {
        // Alternative format: { fileUrl: "..." }
        imageUrl = result.fileUrl;
      }

      if (!imageUrl) {
        console.error('[Upload] No URL in response:', result);
        throw new Error('Upload succeeded but no image URL returned');
      }

      console.log('[Upload] Extracted URL:', imageUrl);
      return imageUrl;

    } catch (error) {
      console.error('[Upload] Network/parsing error:', error);
      throw error;
    }
  }, []);

  const createGalleryPiece = useCallback(async (imageUrl: string): Promise<void> => {
  console.log('[Upload] Creating gallery piece with URL:', imageUrl);

  const requestData = {
    title: artworkData.title.trim(),
    description: artworkData.description.trim(),
    imageUrl: imageUrl,  // FIXED: Changed 'image' to 'imageUrl'
    category: artworkData.category,
    medium: artworkData.medium.trim(),
    tags: artworkData.tags.filter(tag => tag.trim().length > 0),
    visibility: artworkData.visibility,
    year: artworkData.year,
    displayOrder: 0
  };

  console.log('[Upload] Gallery piece request data:', requestData);

  try {
    // FIX 2: Added /me to endpoint
    const response = await fetch('/api/portfolios/me/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestData)
    });

    console.log('[Upload] Gallery response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Upload] Gallery error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `HTTP ${response.status}: ${errorText}` };
      }
      
      throw new Error(
        errorData.message || 
        errorData.error || 
        `Failed to create gallery piece (${response.status})`
      );
    }

    const result = await response.json();
    console.log('[Upload] Gallery piece created:', result);

    if (!result.success && !result.galleryPiece) {
      throw new Error(result.message || 'Failed to create gallery piece');
    }

  } catch (error) {
    console.error('[Upload] Gallery piece creation error:', error);
    throw error;
  }
  }, [artworkData]);

  // File selection handler with validation
  const handleFileSelect = useCallback(async (file: File) => {
    console.log('[Upload] File selected:', file.name);

    // Reset any previous errors
    setUploadState(prev => ({ ...prev, error: undefined }));

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadState({
        step: 'error',
        uploadProgress: 0,
        error: 'Please select a valid image file (JPG, PNG, GIF, WebP)'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState({
        step: 'error',
        uploadProgress: 0,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`
      });
      return;
    }

    // Set uploading state
    setUploadState({
      step: 'uploading',
      uploadProgress: 0,
      imageFile: file
    });

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90)
        }));
      }, 200);

      const uploadRes: UploadResponse = await api.portfolio.images.upload(file, 'gallery');
      clearInterval(progressInterval);

      // Auto-generate title from filename if empty
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const cleanTitle = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      setArtworkData(prev => ({
        ...prev,
        title: prev.title || cleanTitle
      }));

      setUploadState({
        step: 'details',
        uploadProgress: 100,
        imageUrl: uploadRes.url,
        imageFile: file
      });


    } catch (error) {
      console.error('[Upload] Upload process failed:', error);
      setUploadState({
        step: 'error',
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      });
    }
  }, [uploadImage]);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    if (!uploadState.imageUrl) {
      setUploadState(prev => ({
        ...prev,
        step: 'error',
        error: 'No image URL available. Please re-upload your image.'
      }));
      return;
    }

    if (!artworkData.title.trim()) {
      setUploadState(prev => ({
        ...prev,
        step: 'error',
        error: 'Title is required'
      }));
      return;
    }

    setUploadState(prev => ({ ...prev, step: 'uploading', uploadProgress: 0 }));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 15, 90)
        }));
      }, 300);

      await api.portfolio.gallery.add({
        title: artworkData.title.trim(),
        description: artworkData.description.trim(),
        imageUrl: uploadState.imageUrl,
        category: artworkData.category,
        medium: artworkData.medium.trim(),
        tags: artworkData.tags.filter(tag => tag.trim().length > 0),
        visibility: artworkData.visibility,
        year: artworkData.year,
        displayOrder: 0,
        price: artworkData.price,
        artist: artworkData.artist?.trim(),
      });
      
      clearInterval(progressInterval);
      setUploadState({ step: 'success', uploadProgress: 100 });
      
      // Auto-close and refresh after success
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('[Upload] Submit failed:', error);
      setUploadState({
        step: 'error',
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Failed to create artwork'
      });
    }
  }, [uploadState.imageUrl, artworkData, createGalleryPiece, onSuccess]);

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Tag input handler
  const handleTagsChange = useCallback((value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
    
    setArtworkData(prev => ({ ...prev, tags }));
  }, []);

  // Render different steps
  const renderStep = () => {
    switch (uploadState.step) {
      case 'select':
        return (
          <StepContainer>
            <StepHeader>
              <StepTitle>Upload Artwork</StepTitle>
              <StepSubtitle>Select a high-quality image of your artwork</StepSubtitle>
            </StepHeader>
            
            <DropZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon>
                <Upload size={48} />
              </UploadIcon>
              <UploadText>
                <strong>Click to upload</strong> or drag and drop
              </UploadText>
              <UploadSubtext>
                PNG, JPG, GIF, WebP up to 10MB
              </UploadSubtext>
              
              <QualityHints>
                <HintItem>📏 Minimum 1200px on longest side</HintItem>
                <HintItem>🎨 Accurate colors and lighting</HintItem>
                <HintItem>✂️ Properly cropped composition</HintItem>
              </QualityHints>
            </DropZone>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </StepContainer>
        );

      case 'uploading':
        return (
          <StepContainer>
            <StepHeader>
              <StepTitle>
                {uploadState.uploadProgress < 100 ? 'Uploading Image...' : 'Processing...'}
              </StepTitle>
              <StepSubtitle>Please wait while we upload your artwork</StepSubtitle>
            </StepHeader>
            
            <ProgressContainer>
              <ProgressBar progress={uploadState.uploadProgress} />
              <ProgressText>{uploadState.uploadProgress}% complete</ProgressText>
            </ProgressContainer>
            
            <LoadingContainer>
              <Loader size={32} className="animate-spin" />
              <LoadingText>
                {uploadState.uploadProgress < 50 ? 'Uploading to server...' :
                 uploadState.uploadProgress < 90 ? 'Processing image...' :
                 'Almost done...'}
              </LoadingText>
            </LoadingContainer>
          </StepContainer>
        );

      case 'details':
        return (
          <StepContainer>
            <StepHeader>
              <StepTitle>Artwork Details</StepTitle>
              <StepSubtitle>Add information about your artwork</StepSubtitle>
            </StepHeader>
            
            <DetailsLayout>
              <PreviewSection>
                {uploadState.imageUrl && (
                  <PreviewContainer>
                    <PreviewImage src={uploadState.imageUrl} alt="Artwork preview" />
                    <PreviewInfo>
                      <CheckCircle size={16} color="#10b981" />
                      <span>Image uploaded successfully</span>
                    </PreviewInfo>
                  </PreviewContainer>
                )}
              </PreviewSection>

              <FormSection>
                <FormGrid>
                  <FormField>
                    <Label>
                      Title <RequiredMark>*</RequiredMark>
                    </Label>
                    <Input
                      value={artworkData.title}
                      onChange={(e) => setArtworkData(prev => ({ 
                        ...prev, 
                        title: e.target.value 
                      }))}
                      placeholder="Enter artwork title..."
                      required
                    />
                  </FormField>

                  <FormField>
                    <Label>Category</Label>
                    <Select
                      value={artworkData.category}
                      onChange={(e) => setArtworkData(prev => ({ 
                        ...prev, 
                        category: e.target.value 
                      }))}
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                      <option value="abstract">Abstract</option>
                      <option value="digital">Digital Art</option>
                      <option value="photography">Photography</option>
                      <option value="illustration">Illustration</option>
                      <option value="mixed-media">Mixed Media</option>
                      <option value="series">Series</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormField>

                  <FormField>
                    <Label>Medium</Label>
                    <Input
                      value={artworkData.medium}
                      onChange={(e) => setArtworkData(prev => ({ 
                        ...prev, 
                        medium: e.target.value 
                      }))}
                      placeholder="Oil on canvas, Digital, Acrylic..."
                    />
                  </FormField>

                  <FormField>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={artworkData.year}
                      onChange={(e) => setArtworkData(prev => ({ 
                        ...prev, 
                        year: parseInt(e.target.value) || new Date().getFullYear() 
                      }))}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </FormField>

                  <FormField>
                    <Label>Visibility</Label>
                    <VisibilitySelect
                      value={artworkData.visibility}
                      onChange={(e) => setArtworkData(prev => ({ 
                        ...prev, 
                        visibility: e.target.value as any 
                      }))}
                    >
                      <option value="public">
                        🌍 Public - Visible to everyone
                      </option>
                      <option value="unlisted">
                        🔗 Unlisted - Only accessible via direct link
                      </option>
                      <option value="private">
                        🔒 Private - Only visible to you
                      </option>
                    </VisibilitySelect>
                  </FormField>

                  <FormField>
                    <Label>Price (optional)</Label>
                    <PriceInput>
                      <span>$</span>
                      <Input
                        type="number"
                        value={artworkData.price || ''}
                        onChange={(e) => setArtworkData(prev => ({ 
                          ...prev, 
                          price: e.target.value ? parseFloat(e.target.value) : undefined 
                        }))}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        style={{ paddingLeft: '1.5rem' }}
                      />
                    </PriceInput>
                  </FormField>

                  <FormField fullWidth>
                    <Label>Description</Label>
                    <TextArea
                      value={artworkData.description}
                      onChange={(e) => setArtworkData(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      placeholder="Tell the story behind your artwork..."
                      rows={3}
                    />
                  </FormField>

                  <FormField fullWidth>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={artworkData.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="abstract, portrait, nature, oil painting..."
                    />
                    <FieldHint>
                      Add up to 10 tags to help people discover your artwork
                    </FieldHint>
                  </FormField>
                </FormGrid>
              </FormSection>
            </DetailsLayout>

            <ButtonGroup>
              <SecondaryButton 
                onClick={() => setUploadState({ step: 'select', uploadProgress: 0 })}
              >
                Back
              </SecondaryButton>
              <PrimaryButton 
                onClick={handleSubmit} 
                disabled={!artworkData.title.trim()}
              >
                Publish Artwork
              </PrimaryButton>
            </ButtonGroup>
          </StepContainer>
        );

      case 'success':
        return (
          <StepContainer>
            <SuccessContainer>
              <SuccessIcon>
                <CheckCircle size={64} color="#10b981" />
              </SuccessIcon>
              <StepTitle>Artwork Published!</StepTitle>
              <SuccessText>
                Your artwork "{artworkData.title}" has been successfully added to your gallery.
              </SuccessText>
              <SuccessSubtext>
                Redirecting to your gallery...
              </SuccessSubtext>
            </SuccessContainer>
          </StepContainer>
        );

      case 'error':
        return (
          <StepContainer>
            <ErrorContainer>
              <ErrorIcon>
                <AlertCircle size={64} color="#ef4444" />
              </ErrorIcon>
              <StepTitle>Upload Failed</StepTitle>
              <ErrorText>{uploadState.error}</ErrorText>
              <ButtonGroup>
                <SecondaryButton 
                  onClick={() => setUploadState({ step: 'select', uploadProgress: 0 })}
                >
                  Try Again
                </SecondaryButton>
              </ButtonGroup>
            </ErrorContainer>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>
        {renderStep()}
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components (keeping original style but improved)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #333;
  }
`;

const StepContainer = styled.div`
  padding: 2rem;
`;

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-family: 'Cormorant Garamond', serif;
`;

const StepSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;

const DropZone = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  
  &:hover {
    border-color: #2c2c2c;
    background: #f5f5f5;
    transform: translateY(-2px);
  }
`;

const UploadIcon = styled.div`
  color: #9ca3af;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.125rem;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const UploadSubtext = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const QualityHints = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HintItem = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-family: 'Work Sans', sans-serif;
`;

const ProgressContainer = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #2c2c2c, #4a4a4a);
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
`;

const DetailsLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewSection = styled.div``;

const PreviewContainer = styled.div`
  position: relative;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PreviewInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #10b981;
  font-family: 'Work Sans', sans-serif;
`;

const FormSection = styled.div``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div<{ fullWidth?: boolean }>`
  ${props => props.fullWidth && `
    grid-column: 1 / -1;
  `}
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 2px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Work Sans', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-family: 'Work Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
`;

const VisibilitySelect = styled(Select)`
  font-size: 0.875rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: 'Work Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
`;

const PriceInput = styled.div`
  position: relative;
  
  span {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-family: 'Work Sans', sans-serif;
  }
`;

const FieldHint = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-family: 'Work Sans', sans-serif;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const PrimaryButton = styled.button`
  background: #2c2c2c;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  
  &:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: none;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 0.875rem 2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const SuccessIcon = styled.div`
  margin-bottom: 1rem;
`;

const SuccessText = styled.p`
  color: #6b7280;
  font-family: 'Work Sans', sans-serif;
  line-height: 1.6;
  margin-bottom: 0.5rem;
`;

const SuccessSubtext = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  margin: 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorIcon = styled.div`
  margin-bottom: 1rem;
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-family: 'Work Sans', sans-serif;
  margin-bottom: 2rem;
  line-height: 1.6;
  background: #fef2f2;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #fecaca;
`;