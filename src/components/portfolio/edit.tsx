'use client';

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  Save, Upload, X, Globe, Lock, Link as LinkIcon, 
  Plus, Trash2, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { useAuth } from '@/providers/authProvider';
import { useMyPortfolio, useUpdatePortfolio, useUploadPortfolioImage } from '@/hooks/usePortfolioQueries';
import { VisibilityToggle } from '@/components/gallery/rendering';
import { UpdatePortfolioDto, PortfolioVisibility } from '@/types/portfolio.types';
import { Gallery } from '@/components/gallery'; // Import the Gallery component

export default function PortfolioEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  // Fetch portfolio data
  const { data: portfolio, isLoading } = useMyPortfolio();
  const updateMutation = useUpdatePortfolio();
  const uploadImageMutation = useUploadPortfolioImage();

  // Form state
  const [formData, setFormData] = useState<UpdatePortfolioDto>({
    title: portfolio?.title || '',
    tagline: portfolio?.tagline || '',
    bio: portfolio?.bio || '',
    visibility: portfolio?.visibility || 'public',
    location: portfolio?.location || '',
    specializations: portfolio?.specializations || [],
    tags: portfolio?.tags || [],
    socialLinks: portfolio?.socialLinks || {},
    contactEmail: portfolio?.contactEmail || '',
    showContactInfo: portfolio?.showContactInfo || false,
    settings: portfolio?.settings || {
      allowReviews: true,
      requireReviewApproval: false,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'masonry',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: false,
    }
  });

  const [newSpecialization, setNewSpecialization] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ==================== Event Handlers ====================
  const handleInputChange = (field: keyof UpdatePortfolioDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (setting: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [setting]: value }
    }));
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    try {
      const result = await uploadImageMutation.mutateAsync({ file, type });
      handleInputChange(type === 'profile' ? 'profileImage' : 'coverImage', result.url);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  const handleSave = async () => {
    if (!portfolio?.id) return;
    
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({ id: portfolio.id, data: formData });
      router.push(`/portfolio/${user?.username || user?.id}`);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization && !formData.specializations?.includes(newSpecialization)) {
      handleInputChange('specializations', [...(formData.specializations || []), newSpecialization]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    handleInputChange('specializations', formData.specializations?.filter(s => s !== spec) || []);
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      handleInputChange('tags', [...(formData.tags || []), newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange('tags', formData.tags?.filter(t => t !== tag) || []);
  };

  // ==================== Loading State ====================
  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader2 className="animate-spin" size={48} />
        <p>Loading portfolio...</p>
      </LoadingContainer>
    );
  }

  // ==================== Main Render ====================
  return (
    <Container>
      <Header>
        <h1>Edit Portfolio</h1>
        <HeaderActions>
          <PreviewButton onClick={() => router.push(`/portfolio/${user?.username || user?.id}`)}>
            <Eye size={18} />
            Preview
          </PreviewButton>
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </SaveButton>
        </HeaderActions>
      </Header>

      <Form>
        {/* Basic Information Section */}
        <Section>
          <SectionTitle>Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>Portfolio Title</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Your Portfolio Name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Tagline</Label>
            <Input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="A brief description of what you do"
            />
          </FormGroup>

          <FormGroup>
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell your story..."
              rows={6}
            />
          </FormGroup>

          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </FormGroup>
        </Section>

        {/* Images Section */}
        <Section>
          <SectionTitle>Images</SectionTitle>
          
          <ImagesGrid>
            <ImageUpload>
              <Label>Profile Image</Label>
              <ImagePreview 
                onClick={() => profileImageRef.current?.click()}
                $hasImage={!!formData.profileImage}
              >
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" />
                ) : (
                  <>
                    <Upload size={32} />
                    <span>Upload Profile Image</span>
                  </>
                )}
              </ImagePreview>
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                style={{ display: 'none' }}
              />
            </ImageUpload>

            <ImageUpload>
              <Label>Cover Image</Label>
              <ImagePreview 
                onClick={() => coverImageRef.current?.click()}
                $hasImage={!!formData.coverImage}
              >
                {formData.coverImage ? (
                  <img src={formData.coverImage} alt="Cover" />
                ) : (
                  <>
                    <Upload size={32} />
                    <span>Upload Cover Image</span>
                  </>
                )}
              </ImagePreview>
              <input
                ref={coverImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                style={{ display: 'none' }}
              />
            </ImageUpload>
          </ImagesGrid>
        </Section>

        {/* Gallery Management Section */}
        <Section>
          <SectionTitle>Gallery Management</SectionTitle>
          <Gallery 
            mode="manage"
            viewConfig={{
              layout: 'grid',
              itemsPerPage: 12,
              enableSelection: true,
              enableQuickEdit: true
            }}
          />
        </Section>

        {/* Visibility Section */}
        <Section>
          <SectionTitle>Visibility Settings</SectionTitle>
          
          <FormGroup>
            <Label>Portfolio Visibility</Label>
            <VisibilityToggle
              value={formData.visibility as PortfolioVisibility}
              onChange={(v) => handleInputChange('visibility', v)}
            />
          </FormGroup>

          <SettingsGrid>
            <Toggle>
              <input
                type="checkbox"
                checked={formData.showContactInfo}
                onChange={(e) => handleInputChange('showContactInfo', e.target.checked)}
              />
              <span>Show Contact Information</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={formData.settings?.showStats}
                onChange={(e) => handleSettingChange('showStats', e.target.checked)}
              />
              <span>Show Portfolio Statistics</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={formData.settings?.showPrices}
                onChange={(e) => handleSettingChange('showPrices', e.target.checked)}
              />
              <span>Show Artwork Prices</span>
            </Toggle>
          </SettingsGrid>
        </Section>

        {/* Specializations & Tags Section */}
        <Section>
          <SectionTitle>Specializations & Tags</SectionTitle>
          
          <FormGroup>
            <Label>Specializations</Label>
            <TagInput>
              <Input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                placeholder="Add specialization..."
              />
              <AddButton onClick={addSpecialization}>
                <Plus size={16} />
              </AddButton>
            </TagInput>
            <TagList>
              {formData.specializations?.map((spec, idx) => (
                <Tag key={idx}>
                  {spec}
                  <button onClick={() => removeSpecialization(spec)}>
                    <X size={14} />
                  </button>
                </Tag>
              ))}
            </TagList>
          </FormGroup>

          <FormGroup>
            <Label>Tags</Label>
            <TagInput>
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
              />
              <AddButton onClick={addTag}>
                <Plus size={16} />
              </AddButton>
            </TagInput>
            <TagList>
              {formData.tags?.map((tag, idx) => (
                <Tag key={idx}>
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X size={14} />
                  </button>
                </Tag>
              ))}
            </TagList>
          </FormGroup>
        </Section>

        {/* Review Settings Section */}
        <Section>
          <SectionTitle>Review Settings</SectionTitle>
          
          <SettingsGrid>
            <Toggle>
              <input
                type="checkbox"
                checked={formData.settings?.allowReviews}
                onChange={(e) => handleSettingChange('allowReviews', e.target.checked)}
              />
              <span>Allow Reviews</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={formData.settings?.requireReviewApproval}
                onChange={(e) => handleSettingChange('requireReviewApproval', e.target.checked)}
                disabled={!formData.settings?.allowReviews}
              />
              <span>Require Review Approval</span>
            </Toggle>

            <Toggle>
              <input
                type="checkbox"
                checked={formData.settings?.allowAnonymousReviews}
                onChange={(e) => handleSettingChange('allowAnonymousReviews', e.target.checked)}
                disabled={!formData.settings?.allowReviews}
              />
              <span>Allow Anonymous Reviews</span>
            </Toggle>
          </SettingsGrid>
        </Section>
      </Form>
    </Container>
  );
}

// ==================== Styled Components ====================
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  color: #666;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const PreviewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #4b5563;
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

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #1a1a1a;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
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
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUpload = styled.div``;

const ImagePreview = styled.div<{ $hasImage: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.$hasImage ? 'auto' : '16/9'};
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  span {
    font-size: 0.875rem;
    color: #4b5563;
  }
`;

const TagInput = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AddButton = styled.button`
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 999px;
  font-size: 0.875rem;

  button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #3730a3;
    padding: 0;
    transition: color 0.2s;

    &:hover {
      color: #1e1b4b;
    }
  }
`;