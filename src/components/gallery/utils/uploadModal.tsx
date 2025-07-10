// components/gallery/utils/uploadModal.tsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { UploadIcon, X, Loader2 } from '@/components/ui/icons';
import { useAuth } from '@/providers/authProvider';
import type { ArtworkCategory, GalleryStatus } from '@/types/gallery.types';

interface ArtworkUploadModalProps {
  portfolioId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ArtworkUploadModal: React.FC<ArtworkUploadModalProps> = ({
  portfolioId,
  onClose,
  onSuccess
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'painting' as ArtworkCategory,
    medium: '',
    tags: '',
    price: '',
    artist: user?.name || '',
    year: new Date().getFullYear()
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // SIMPLIFIED FRONTEND - components/gallery/utils/uploadModal.tsx
// Update the handleSubmit function to send everything in one request

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
    
    // Parse tags
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Send everything in one request
    const uploadResponse = await api.gallery.uploadImage(selectedFile, {
      // Gallery piece data
      title: formData.title,
      description: formData.description,
      category: formData.category,
      medium: formData.medium,
      tags: tagsArray.join(','), // Send as comma-separated string
      price: formData.price || '',
      artist: formData.artist || user?.name || '',
      year: formData.year.toString(),
      portfolioId: portfolioId || '',
      
      // Upload settings
      visibility: 'public',
      generateThumbnail: 'true',
      optimizeImages: 'true',
      preserveMetadata: 'false',
      quality: '0.9',
      maxWidth: '2000',
      maxHeight: '2000'
    });
    
    if (!uploadResponse || !uploadResponse.url) {
      throw new Error('Upload failed - no URL returned');
    }
    
    console.log('Upload and gallery piece creation successful!');
    onSuccess();
  } catch (error) {
    console.error('Upload error:', error);
    let errorMessage = 'Failed to upload artwork';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Handle authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('NO_AUTH_TOKEN')) {
      errorMessage = 'Authentication failed. Please try logging out and back in.';
    }
    
    setError(errorMessage);
  } finally {
    setIsUploading(false);
  }
};

// ALTERNATIVE: Two-step process with better error handling
const handleSubmitTwoStep = async (e: React.FormEvent) => {
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
  
  let uploadedUrl: string | null = null;
  let uploadedThumbnailUrl: string | null = null;
  
  try {
    // Step 1: Upload the image file
    console.log('Step 1: Uploading image file...');
    const uploadResponse = await api.gallery.uploadImage(selectedFile, {
      title: formData.title,
      generateThumbnail: 'true',
      optimizeImages: 'true',
      quality: '0.9'
    });
    
    if (!uploadResponse || !uploadResponse.url) {
      throw new Error('Upload failed - no URL returned');
    }
    
    uploadedUrl = uploadResponse.url;
    uploadedThumbnailUrl = uploadResponse.thumbnailUrl || uploadResponse.url;
    
    console.log('Step 1 complete: Image uploaded successfully');
    
    // Step 2: Create the gallery piece record
    console.log('Step 2: Creating gallery piece record...');
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    await api.gallery.create({
      title: formData.title,
      description: formData.description || '',
      imageUrl: uploadedUrl,
      thumbnailUrl: uploadedThumbnailUrl,
      category: formData.category,
      medium: formData.medium || '',
      tags: tagsArray,
      price: formData.price ? parseFloat(formData.price) : undefined,
      status: 'exhibition' as GalleryStatus,
      visibility: 'public',
      artist: formData.artist || user?.name || '',
      year: formData.year,
      displayOrder: 0,
      alt: formData.title,
      size: 'medium',
      ownerId: user?.id || '',
      uploadedBy: user?.id || '',
      portfolioId: portfolioId
    });
    
    console.log('Step 2 complete: Gallery piece created successfully!');
    onSuccess();
  } catch (error) {
    console.error('Upload error:', error);
    
    // If we uploaded the file but failed to create the record,
    // we might want to clean up the uploaded file
    if (uploadedUrl && error instanceof Error && error.message.includes('gallery.create')) {
      console.error('File was uploaded but gallery record creation failed');
      // Optionally: Call a cleanup endpoint to delete the orphaned file
    }
    
    let errorMessage = 'Failed to upload artwork';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('NO_AUTH_TOKEN')) {
      errorMessage = 'Authentication failed. Please try logging out and back in.';
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
            <ModalSubtitle>Share your creative work with the community</ModalSubtitle>
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
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Artist Name</Label>
                  <Input
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    placeholder="Your name or artist pseudonym"
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
                  />
                </FormGroup>
                
                <FormRow>
                  <FormGroup>
                    <Label>Category</Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="painting">Painting</option>
                      <option value="drawing">Drawing</option>
                      <option value="digital">Digital Art</option>
                      <option value="photography">Photography</option>
                      <option value="sculpture">Sculpture</option>
                      <option value="mixed_media">Mixed Media</option>
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Medium</Label>
                    <Input
                      name="medium"
                      value={formData.medium}
                      onChange={handleInputChange}
                      placeholder="e.g., Oil on canvas, Digital, Acrylic"
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
                  />
                  <FieldHint>Add tags to help people discover your work</FieldHint>
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
                <SubmitButton type="submit" disabled={isUploading || !selectedFile}>
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

// Styled Components (keeping all the same styles but removing debug section)
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