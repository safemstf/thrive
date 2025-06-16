// components/gallery/utils/uploadModal.tsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { UploadIcon, X, Loader2 } from '@/components/ui/icons';
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
    artist: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // First upload the image
      const uploadResponse = await api.gallery.uploadImage(selectedFile, {
        title: formData.title,
        portfolioId
      });
      
      if (!uploadResponse || !uploadResponse.url) {
        throw new Error('Upload failed - no URL returned');
      }
      
      // Then create the gallery piece
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await api.gallery.create({
        title: formData.title,
        description: formData.description || '',
        imageUrl: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
        category: formData.category,
        medium: formData.medium || '',
        tags: tagsArray,
        price: formData.price ? parseFloat(formData.price) : undefined,
        status: 'exhibition' as GalleryStatus,
        visibility: 'public',
        artist: formData.artist || '',
        year: formData.year,
        displayOrder: 0,
        alt: formData.title,
        size: 'medium',
        ownerId: '', // Will be set by backend
        uploadedBy: '' // Will be set by backend
      });
      
      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload artwork');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Upload Artwork</h2>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
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
                  <ChangeButton
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </ChangeButton>
                </PreviewContainer>
              ) : (
                <UploadArea onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon size={48} />
                  <UploadText>Click to select an image</UploadText>
                  <UploadHint>JPG, PNG, GIF up to 10MB</UploadHint>
                </UploadArea>
              )}
            </UploadSection>
            
            <FormSection>
              <FormGroup>
                <Label>Title *</Label>
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
                  placeholder="Artist name"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your artwork"
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
                  <Label>Price (optional)</Label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label>Tags</Label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Comma separated tags"
                />
              </FormGroup>
            </FormSection>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </ModalBody>
          
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                'Upload Artwork'
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: #111827;
    background: #f3f4f6;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const UploadSection = styled.div`
  margin-bottom: 2rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f9fafb;
  }
`;

const UploadText = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: #111827;
`;

const UploadHint = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const PreviewContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  background: #f3f4f6;
`;

const ChangeButton = styled.button`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #dc2626;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;