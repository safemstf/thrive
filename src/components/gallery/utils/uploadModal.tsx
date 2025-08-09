// components/gallery/utils/uploadModal.tsx - Clean Component Logic
import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { X, Upload, Image as ImageIcon, DollarSign, Tag, Calendar, Palette } from 'lucide-react';
import { useAuth } from '@/providers/authProvider';
import type { ArtworkCategory, GalleryVisibility, GalleryUploadFile } from '@/types/gallery.types';
import { getGalleryPieceId } from '@/types/portfolio.types';

// Import all styled components
import {
  ModalOverlay, ModalContent, ModalHeader, HeaderContent, ModalTitle, ModalSubtitle,
  CloseButton, StepIndicator, StepNumber, StepLine, ModalBody, FormContent,
  UploadSection, UploadArea, UploadIconWrapper, UploadText, UploadHint,
  PreviewContainer, PreviewImage, PreviewOverlay, ChangeButton, ImageInfo,
  ImageName, ImageSize, GuidelinesCard, GuidelineTitle, GuidelineList,
  GuidelineItem, GuidelineIcon, GuidelineText, TwoColumnLayout, LeftColumn,
  RightColumn, PreviewSection, FormSection, SectionTitle, FormGroup, FormRow,
  Label, RequiredStar, Input, TextArea, Select, PriceInputWrapper, PriceSymbol,
  FieldHint, ErrorMessage, ErrorIcon, ErrorText, ModalFooter, FooterContent,
  PrimaryButton, SecondaryButton, LoadingSpinner, ArrowIcon, AuthPrompt,
  AuthIcon, AuthTitle, AuthDescription, AuthActions
} from './uploadModalStyles';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(firstFile.file);
      }

      if (!formData.title && firstFile.file.name) {
        const nameWithoutExtension = firstFile.file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({
          ...prev,
          title: nameWithoutExtension.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
      }
    }
  }, [initialFiles, formData.title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setImageUploadError(null);
    
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    if (!formData.title && file.name) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({
        ...prev,
        title: nameWithoutExtension.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      setImageUploadError('Please select an image to upload');
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const imageFormData = new FormData();
      imageFormData.append('file', selectedFile);
      
      const imageUploadResponse = await api.portfolio.images.uploadRaw(imageFormData);
      
      if (!imageUploadResponse?.url) {
        throw new Error('Image upload failed - no URL returned');
      }
      
      setImageUrl(imageUploadResponse.url);
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Image upload error:', error);
      let errorMessage = 'Failed to upload image. Please try again.';

      if (error.message?.includes('413')) {
        errorMessage = 'File is too large. Please choose an image under 10MB.';
      } else if (error.message?.includes('415')) {
        errorMessage = 'Unsupported file type. Please choose a JPG, PNG, or GIF image.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      setImageUploadError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const submitArtwork = async () => {
    if (!imageUrl) {
      setError('Image URL is missing. Please go back and re-upload the image.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for your artwork');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 50)
        .slice(0, 10);

      const galleryPieceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: imageUrl,
        category: formData.category,
        medium: formData.medium.trim(),
        tags: tagsArray,
        visibility: 'public' as GalleryVisibility,
        year: formData.year,
        displayOrder: 0,
        ...(formData.price && !isNaN(parseFloat(formData.price)) && {
          price: parseFloat(formData.price)
        }),
        ...(formData.artist.trim() && formData.artist.trim() !== user?.name && {
          artist: formData.artist.trim()
        }),
      };

      const galleryResponse = await api.portfolio.gallery.add(galleryPieceData);
      console.log('Gallery piece created:', getGalleryPieceId(galleryResponse));
      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      
      let errorMessage = 'Failed to create artwork. Please try again.';
      if (error.message?.includes('401')) {
        errorMessage = 'Authentication failed. Please refresh and try again.';
      } else if (error.message?.includes('403')) {
        errorMessage = 'You do not have permission to upload to this portfolio.';
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isAuthenticated) {
    return (
      <ModalOverlay onClick={handleBackdropClick}>
        <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <ModalHeader>
            <HeaderContent>
              <ModalTitle>Authentication Required</ModalTitle>
              <ModalSubtitle>Please sign in to upload artwork</ModalSubtitle>
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
                You need to be signed in to upload and share your artwork.
              </AuthDescription>
              <AuthActions>
                <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                <PrimaryButton onClick={() => window.location.href = '/login'}>
                  Sign In
                </PrimaryButton>
              </AuthActions>
            </AuthPrompt>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  const renderUploadStep = () => (
    <>
      <ModalHeader>
        <HeaderContent>
          <StepIndicator>
            <StepNumber $active>1</StepNumber>
            <StepLine />
            <StepNumber>2</StepNumber>
          </StepIndicator>
          <ModalTitle>Upload Artwork</ModalTitle>
          <ModalSubtitle>Select a high-quality image</ModalSubtitle>
        </HeaderContent>
        <CloseButton onClick={onClose} type="button">
          <X size={20} />
        </CloseButton>
      </ModalHeader>
      
      <ModalBody>
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
                  <Upload size={32} />
                </UploadIconWrapper>
                <UploadText>Drop image here or click to browse</UploadText>
                <UploadHint>JPG, PNG, GIF up to 10MB</UploadHint>
              </UploadArea>
            )}
          </UploadSection>
          
          <GuidelinesCard>
            <GuidelineTitle>Quality Guidelines</GuidelineTitle>
            <GuidelineList>
              <GuidelineItem>
                <GuidelineIcon>📏</GuidelineIcon>
                <GuidelineText>Minimum 1200px on longest side</GuidelineText>
              </GuidelineItem>
              <GuidelineItem>
                <GuidelineIcon>🎨</GuidelineIcon>
                <GuidelineText>Accurate color representation</GuidelineText>
              </GuidelineItem>
              <GuidelineItem>
                <GuidelineIcon>✂️</GuidelineIcon>
                <GuidelineText>Properly cropped, minimal background</GuidelineText>
              </GuidelineItem>
            </GuidelineList>
          </GuidelinesCard>
          
          {imageUploadError && (
            <ErrorMessage>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorText>{imageUploadError}</ErrorText>
            </ErrorMessage>
          )}
        </FormContent>
        
        <ModalFooter>
          <FooterContent>
            <SecondaryButton onClick={onClose} disabled={isUploadingImage}>
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              onClick={uploadImage}
              disabled={isUploadingImage || !selectedFile}
            >
              {isUploadingImage ? (
                <>
                  <LoadingSpinner />
                  Uploading...
                </>
              ) : (
                <>
                  Continue
                  <ArrowIcon>→</ArrowIcon>
                </>
              )}
            </PrimaryButton>
          </FooterContent>
        </ModalFooter>
      </ModalBody>
    </>
  );

  const renderMetadataStep = () => (
    <>
      <ModalHeader>
        <HeaderContent>
          <StepIndicator>
            <StepNumber>1</StepNumber>
            <StepLine $completed />
            <StepNumber $active>2</StepNumber>
          </StepIndicator>
          <ModalTitle>Artwork Details</ModalTitle>
          <ModalSubtitle>Add information about your artwork</ModalSubtitle>
        </HeaderContent>
        <CloseButton onClick={onClose} type="button">
          <X size={20} />
        </CloseButton>
      </ModalHeader>
      
      <ModalBody>
        <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); submitArtwork(); }}>
          <FormContent>
            <TwoColumnLayout>
              <LeftColumn>
                {preview && (
                  <PreviewSection>
                    <PreviewContainer>
                      <PreviewImage src={preview} alt="Preview" />
                    </PreviewContainer>
                  </PreviewSection>
                )}
              </LeftColumn>
              
              <RightColumn>
                <FormSection>
                  <SectionTitle>Basic Information</SectionTitle>
                  
                  <FormGroup>
                    <Label>
                      Title <RequiredStar>*</RequiredStar>
                    </Label>
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
                      placeholder="Your name or pseudonym"
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
                </FormSection>

                <FormSection>
                  <SectionTitle>Classification</SectionTitle>
                  
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
                        placeholder="Oil, Digital, Acrylic..."
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
                      <PriceInputWrapper>
                        <PriceSymbol>$</PriceSymbol>
                        <Input
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          style={{ paddingLeft: '2rem' }}
                        />
                      </PriceInputWrapper>
                      <FieldHint>Leave empty if not for sale</FieldHint>
                    </FormGroup>
                  </FormRow>
                  
                  <FormGroup>
                    <Label>Tags</Label>
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="abstract, portrait, nature (comma separated)"
                      maxLength={200}
                    />
                    <FieldHint>Add up to 10 tags to help discovery</FieldHint>
                  </FormGroup>
                </FormSection>
              </RightColumn>
            </TwoColumnLayout>
            
            {error && (
              <ErrorMessage>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorText>{error}</ErrorText>
              </ErrorMessage>
            )}
          </FormContent>
          
          <ModalFooter>
            <FooterContent>
              <SecondaryButton 
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
              >
                <ArrowIcon style={{ transform: 'rotate(180deg)' }}>→</ArrowIcon>
                Back
              </SecondaryButton>
              <PrimaryButton 
                type="submit" 
                disabled={isSubmitting || !formData.title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    Publishing...
                  </>
                ) : (
                  'Publish Artwork'
                )}
              </PrimaryButton>
            </FooterContent>
          </ModalFooter>
        </form>
      </ModalBody>
    </>
  );

  return (
    <ModalOverlay onClick={handleBackdropClick}>
      <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {currentStep === 1 ? renderUploadStep() : renderMetadataStep()}
      </ModalContent>
    </ModalOverlay>
  );
};