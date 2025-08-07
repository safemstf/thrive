// components/gallery/utils/uploadModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { UploadIcon, X, Loader2 } from '@/components/ui/icons';
import { useAuth } from '@/providers/authProvider';
import type { ArtworkCategory, GalleryPiece, GalleryStatus, GalleryUploadFile, GalleryVisibility } from '@/types/gallery.types';

interface ArtworkUploadModalProps {
  portfolioId?: string;
  onClose: () => void;
  onSuccess: () => void;
  initialFiles?: GalleryUploadFile[];
}

export const ArtworkUploadModal: React.FC<ArtworkUploadModalProps> = ({
  portfolioId,
  onClose,
  onSuccess,
  initialFiles
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'portrait' as ArtworkCategory,
    medium: '',
    tags: '',
    price: '',
    artist: user?.name || '',
    year: new Date().getFullYear()
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial files from drag & drop
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const firstFile = initialFiles[0];
      setSelectedFile(firstFile.file);
      
      if (firstFile.preview) {
        setPreview(firstFile.preview);
      } else {
        // Create preview if not provided
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(firstFile.file);
      }

      // Auto-populate title from filename if not set
      if (!formData.title && firstFile.file.name) {
        const nameWithoutExtension = firstFile.file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({
          ...prev,
          title: nameWithoutExtension.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
      }
    }
  }, [initialFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-populate title from filename if not set
      if (!formData.title && file.name) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({
          ...prev,
          title: nameWithoutExtension.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simplified portfolio resolution
  const resolvePortfolioId = async (): Promise<string> => {
    console.log('Resolving portfolio ID...');
    
    // If portfolioId is provided, use it
    if (portfolioId) {
      console.log('Using provided portfolio ID:', portfolioId);
      return portfolioId;
    }

    try {
      // Try to get user's existing portfolio
      console.log('Fetching user portfolio...');
      const existingPortfolio = await api.portfolio.get();
      
      if (existingPortfolio && existingPortfolio.id) {
        console.log('Found existing portfolio:', existingPortfolio.id);
        return existingPortfolio.id;
      }
    } catch (error: any) {
      console.log('No existing portfolio found or error fetching:', error.message);
      // Continue to create new portfolio
    }

    // Create a new portfolio
    console.log('Creating new portfolio...');
    try {
      const newPortfolio = await api.portfolio.create({
        title: `${user?.name || 'My'} Portfolio`,
        bio: 'Welcome to my creative portfolio. I\'m excited to share my artistic journey with you.',
        kind: 'creative',
        visibility: 'public',
        specializations: [],
        tags: [],
        tagline: 'Sharing my creative journey',
        settings: {
          allowComments: true,
          showStats: true,
        },
      });
      
      console.log('Created new portfolio:', newPortfolio.id);
      return newPortfolio.id;
    } catch (createError: any) {
      console.error('Failed to create portfolio:', createError);
      
      // If creation failed due to existing portfolio, try to fetch again
      if (createError.status === 409 || createError.message?.includes('already exists')) {
        console.log('Portfolio exists, retrying fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        try {
          const retryPortfolio = await api.portfolio.get();
          if (retryPortfolio && retryPortfolio.id) {
            console.log('Retrieved portfolio on retry:', retryPortfolio.id);
            return retryPortfolio.id;
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      
      throw new Error(`Failed to resolve portfolio: ${createError.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('You must be logged in to upload artwork');
      return;
    }

    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for your artwork');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('Starting upload process...');

      // Step 1: Resolve portfolio ID
      const resolvedPortfolioId = await resolvePortfolioId();
      console.log('Portfolio ID resolved:', resolvedPortfolioId);

      // Step 2: Upload the image file
      console.log('Uploading image file...');
      const imageFormData = new FormData();
      imageFormData.append('file', selectedFile);
      
      const imageUploadResponse = await api.portfolio.images.uploadRaw(imageFormData);
      
      if (!imageUploadResponse?.url) {
        throw new Error('Image upload failed - no URL returned');
      }
      
      console.log('Image uploaded successfully:', imageUploadResponse.url);

      // Step 3: Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 50) // Validate tag length
        .slice(0, 10); // Limit to 10 tags

      // Step 4: Create the gallery piece with metadata
      console.log('Creating gallery piece...');
      const galleryPieceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: imageUploadResponse.url,
        category: formData.category,
        medium: formData.medium.trim(),
        tags: tagsArray,
        visibility: 'public' as GalleryVisibility,
        year: formData.year,
        displayOrder: 0,
        // Add price if provided
        ...(formData.price && !isNaN(parseFloat(formData.price)) && {
          price: parseFloat(formData.price)
        }),
        // Add artist if different from user name
        ...(formData.artist.trim() && formData.artist.trim() !== user?.name && {
          artist: formData.artist.trim()
        }),
      };

      const galleryResponse = await api.portfolio.gallery.add(galleryPieceData);
      console.log('Gallery piece created successfully:', galleryResponse.id);

      // Success!
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload artwork. Please try again.';

      // Handle specific error cases
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to upload to this portfolio.';
        } else if (error.message.includes('413') || error.message.includes('file too large')) {
          errorMessage = 'File is too large. Please choose an image under 10MB.';
        } else if (error.message.includes('415') || error.message.includes('unsupported')) {
          errorMessage = 'Unsupported file type. Please choose a JPG, PNG, or GIF image.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Early return if not authenticated
  if (!isAuthenticated) {
    return (
      <ModalOverlay onClick={handleBackdropClick}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <HeaderContent>
              <ModalTitle>Authentication Required</ModalTitle>
              <ModalSubtitle>Please log in to upload artwork</ModalSubtitle>
            </HeaderContent>
            <CloseButton onClick={onClose} type="button">
              <X size={20} />
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <AuthPrompt>
              <AuthIcon>🔒</AuthIcon>
              <AuthTitle>Sign In Required</AuthTitle>
              <AuthDescription>
                You need to be signed in to upload and share your artwork with the community.
              </AuthDescription>
              <AuthActions>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
              </AuthActions>
            </AuthPrompt>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={handleBackdropClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>Upload Artwork</ModalTitle>
            <ModalSubtitle>
              {initialFiles && initialFiles.length > 0 
                ? `Ready to upload ${selectedFile?.name || 'your image'}`
                : 'Share your creative work with the community'
              }
            </ModalSubtitle>
          </HeaderContent>
          <CloseButton onClick={onClose} type="button">
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormContent>
              <UploadSection>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                {preview ? (
                  <PreviewContainer>
                    <PreviewImage src={preview} alt="Preview" />
                    <PreviewOverlay>
                      <ChangeButton
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Image
                      </ChangeButton>
                    </PreviewOverlay>
                    {selectedFile && (
                      <ImageInfo>
                        <ImageName>{selectedFile.name}</ImageName>
                        <ImageSize>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</ImageSize>
                      </ImageInfo>
                    )}
                  </PreviewContainer>
                ) : (
                  <UploadArea onClick={() => fileInputRef.current?.click()}>
                    <UploadIconWrapper>
                      <UploadIcon size={32} />
                    </UploadIconWrapper>
                    <UploadText>Drop an image here or click to browse</UploadText>
                    <UploadHint>JPG, PNG, GIF up to 10MB</UploadHint>
                  </UploadArea>
                )}
              </UploadSection>
              
              <FormSection>
                <SectionTitle>Artwork Details</SectionTitle>
                
                <FormGroup>
                  <Label>Title <RequiredStar>*</RequiredStar></Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter artwork title"
                    required
                    maxLength={100}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Artist Name</Label>
                  <Input
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    placeholder="Your name or artist pseudonym"
                    maxLength={50}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell the story behind your artwork..."
                    rows={3}
                    maxLength={1000}
                  />
                  <FieldHint>{formData.description.length}/1000 characters</FieldHint>
                </FormGroup>
                
                <FormRow>
                  <FormGroup>
                    <Label>Category</Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                      <option value="abstract">Abstract</option>
                      <option value="series">Series</option>
                      <option value="mixed-media">Mixed Media</option>
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Medium</Label>
                    <Input
                      name="medium"
                      value={formData.medium}
                      onChange={handleInputChange}
                      placeholder="e.g., Oil on canvas, Digital, Acrylic"
                      maxLength={50}
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <Label>Year Created</Label>
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
                    <Label>Price (USD)</Label>
                    <PriceInput>
                      <PriceSymbol>$</PriceSymbol>
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        style={{ paddingLeft: '1.75rem' }}
                      />
                    </PriceInput>
                    <FieldHint>Leave empty if not for sale</FieldHint>
                  </FormGroup>
                </FormRow>
                
                <FormGroup>
                  <Label>Tags</Label>
                  <Input
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="abstract, landscape, portrait (comma separated)"
                    maxLength={200}
                  />
                  <FieldHint>Add up to 10 tags to help people discover your work</FieldHint>
                </FormGroup>
              </FormSection>
              
              {error && (
                <ErrorMessage>
                  <ErrorIcon>⚠️</ErrorIcon>
                  <ErrorText>{error}</ErrorText>
                </ErrorMessage>
              )}
            </FormContent>
            
            <ModalFooter>
              <FooterContent>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>
                  Cancel
                </Button>
                <SubmitButton type="submit" disabled={isUploading || !selectedFile || !formData.title.trim()}>
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon size={16} />
                      Upload Artwork
                    </>
                  )}
                </SubmitButton>
              </FooterContent>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components (keeping all existing styles - same as before)
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #111827;
`;

const ModalSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 1rem;
  
  &:hover {
    color: #374151;
    background: #f9fafb;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const FormContent = styled.div`
  padding: 1.5rem 2rem;
`;

const UploadSection = styled.div`
  margin-bottom: 2rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8faff;
  }
`;

const UploadIconWrapper = styled.div`
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const UploadText = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
`;

const UploadHint = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const PreviewContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
`;

const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${PreviewContainer}:hover & {
    opacity: 1;
  }
`;

const ChangeButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f9fafb;
    transform: translateY(-1px);
  }
`;

const ImageInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: end;
`;

const ImageName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ImageSize = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RequiredStar = styled.span`
  color: #ef4444;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s;
  background: white;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const PriceInput = styled.div`
  position: relative;
`;

const PriceSymbol = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
  z-index: 1;
`;

const FieldHint = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const ErrorIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
`;

const ErrorText = styled.span`
  line-height: 1.4;
`;

const ModalFooter = styled.div`
  padding: 1rem 2rem 1.5rem 2rem;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
  background: #fafbfc;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Authentication prompt styles
const AuthPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  gap: 1rem;
`;

const AuthIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const AuthTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const AuthDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 300px;
  margin: 0;
`;

const AuthActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;