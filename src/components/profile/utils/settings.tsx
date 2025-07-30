// src/components/profile/utils/settings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Globe, 
  Lock, 
  Users, 
  Palette, 
  Type, 
  Image,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Mail,
  Phone,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Upload,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';

interface SettingsProps {
  portfolio: Portfolio;
  onUpdate: (updates: Partial<Portfolio>) => Promise<void>;
  onDelete?: (deleteGalleryPieces: boolean) => Promise<void>;
  isUpdating?: boolean;
}

interface FormData {
  title: string;
  tagline: string;
  bio: string;
  location: string;
  visibility: 'public' | 'private' | 'unlisted';
  specializations: string[];
  tags: string[];
  socialLinks: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    email?: string;
    phone?: string;
  };
  customization: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    headerImage?: string;
  };
}

export function PortfolioSettings({ portfolio, onUpdate, onDelete, isUpdating = false }: SettingsProps) {
  const [formData, setFormData] = useState<FormData>({
    title: portfolio.title,
    tagline: portfolio.tagline || '',
    bio: portfolio.bio || '',
    location: portfolio.location || '',
    visibility: portfolio.visibility,
    specializations: portfolio.specializations || [],
    tags: portfolio.tags || [],
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      github: '',
      instagram: '',
      email: '',
      phone: ''
    },
    customization: {
      theme: 'light',
      accentColor: '#3b82f6',
      headerImage: undefined
    }
  });

  const [activeSection, setActiveSection] = useState<'basic' | 'social' | 'customization' | 'privacy' | 'danger'>('basic');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteGalleryPieces, setDeleteGalleryPieces] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Track changes
  useEffect(() => {
    const hasBasicChanges = 
      formData.title !== portfolio.title ||
      formData.tagline !== (portfolio.tagline || '') ||
      formData.bio !== (portfolio.bio || '') ||
      formData.location !== (portfolio.location || '') ||
      formData.visibility !== portfolio.visibility ||
      JSON.stringify(formData.specializations) !== JSON.stringify(portfolio.specializations || []) ||
      JSON.stringify(formData.tags) !== JSON.stringify(portfolio.tags || []);

    setHasChanges(hasBasicChanges);
  }, [formData, portfolio]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleCustomizationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value
      }
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaveStatus('saving');
    try {
      await onUpdate({
        title: formData.title,
        tagline: formData.tagline,
        bio: formData.bio,
        location: formData.location,
        visibility: formData.visibility,
        specializations: formData.specializations,
        tags: formData.tags,
        socialLinks: formData.socialLinks
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(deleteGalleryPieces);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: <SettingsIcon size={16} /> },
    { id: 'social', label: 'Social Links', icon: <LinkIcon size={16} /> },
    { id: 'customization', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'privacy', label: 'Privacy & Sharing', icon: <Eye size={16} /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={16} /> }
  ] as const;

  return (
    <SettingsContainer>
      {/* Navigation */}
      <SettingsNav>
        {sections.map(section => (
          <NavButton
            key={section.id}
            $active={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            {section.label}
          </NavButton>
        ))}
      </SettingsNav>

      {/* Content */}
      <SettingsContent>
        {/* Save Button */}
        <SaveBar $visible={hasChanges}>
          <SaveInfo>
            <CheckCircle size={16} />
            You have unsaved changes
          </SaveInfo>
          <SaveButton onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin" />}
            {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </SaveButton>
        </SaveBar>

        {/* Basic Information */}
        {activeSection === 'basic' && (
          <Section>
            <SectionHeader>
              <SectionTitle>Basic Information</SectionTitle>
              <SectionDescription>
                Update your portfolio's basic information and public profile details.
              </SectionDescription>
            </SectionHeader>

            <FormGrid>
              <FormGroup>
                <Label>Portfolio Title *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="My Creative Portfolio"
                  maxLength={100}
                />
                <FieldHelp>This appears as your portfolio's main headline</FieldHelp>
              </FormGroup>

              <FormGroup>
                <Label>Tagline</Label>
                <Input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Visual designer & creative director"
                  maxLength={150}
                />
                <FieldHelp>A brief description of what you do</FieldHelp>
              </FormGroup>

              <FormGroup $span="full">
                <Label>Bio</Label>
                <TextArea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell visitors about yourself, your background, and your work..."
                  rows={4}
                  maxLength={1000}
                />
                <FieldHelp>{formData.bio.length}/1000 characters</FieldHelp>
              </FormGroup>

              <FormGroup>
                <Label>Location</Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </FormGroup>

              <FormGroup>
                <Label>Specializations</Label>
                <TagInput>
                  <TagList>
                    {formData.specializations.map((spec, index) => (
                      <Tag key={index}>
                        {spec}
                        <TagRemove onClick={() => removeSpecialization(spec)}>
                          <X size={12} />
                        </TagRemove>
                      </Tag>
                    ))}
                  </TagList>
                  <TagInputField
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                    placeholder="Add specialization..."
                  />
                  <TagAddButton onClick={addSpecialization} type="button">
                    <Plus size={14} />
                  </TagAddButton>
                </TagInput>
                <FieldHelp>Your main areas of expertise</FieldHelp>
              </FormGroup>

              <FormGroup>
                <Label>Tags</Label>
                <TagInput>
                  <TagList>
                    {formData.tags.map((tag, index) => (
                      <Tag key={index}>
                        {tag}
                        <TagRemove onClick={() => removeTag(tag)}>
                          <X size={12} />
                        </TagRemove>
                      </Tag>
                    ))}
                  </TagList>
                  <TagInputField
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                  />
                  <TagAddButton onClick={addTag} type="button">
                    <Plus size={14} />
                  </TagAddButton>
                </TagInput>
                <FieldHelp>Keywords that describe your work</FieldHelp>
              </FormGroup>
            </FormGrid>
          </Section>
        )}

        {/* Social Links */}
        {activeSection === 'social' && (
          <Section>
            <SectionHeader>
              <SectionTitle>Social Links</SectionTitle>
              <SectionDescription>
                Connect your social media profiles and contact information.
              </SectionDescription>
            </SectionHeader>

            <FormGrid>
              <FormGroup>
                <Label><Globe size={16} /> Website</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.website || ''}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </FormGroup>

              <FormGroup>
                <Label><Mail size={16} /> Email</Label>
                <Input
                  type="email"
                  value={formData.socialLinks.email || ''}
                  onChange={(e) => handleSocialLinkChange('email', e.target.value)}
                  placeholder="contact@yourname.com"
                />
              </FormGroup>

              <FormGroup>
                <Label><Phone size={16} /> Phone</Label>
                <Input
                  type="tel"
                  value={formData.socialLinks.phone || ''}
                  onChange={(e) => handleSocialLinkChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>

              <FormGroup>
                <Label><Twitter size={16} /> Twitter</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </FormGroup>

              <FormGroup>
                <Label><Linkedin size={16} /> LinkedIn</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </FormGroup>

              <FormGroup>
                <Label><Github size={16} /> GitHub</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="https://github.com/username"
                />
              </FormGroup>

              <FormGroup>
                <Label><Instagram size={16} /> Instagram</Label>
                <Input
                  type="url"
                  value={formData.socialLinks.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </FormGroup>
            </FormGrid>
          </Section>
        )}

        {/* Privacy & Sharing */}
        {activeSection === 'privacy' && (
          <Section>
            <SectionHeader>
              <SectionTitle>Privacy & Sharing</SectionTitle>
              <SectionDescription>
                Control who can see your portfolio and how it appears in search results.
              </SectionDescription>
            </SectionHeader>

            <FormGrid>
              <FormGroup $span="full">
                <Label>Portfolio Visibility</Label>
                <VisibilityOptions>
                  <VisibilityOption 
                    $active={formData.visibility === 'public'}
                    onClick={() => handleInputChange('visibility', 'public')}
                  >
                    <VisibilityIcon><Globe size={20} /></VisibilityIcon>
                    <VisibilityContent>
                      <VisibilityTitle>Public</VisibilityTitle>
                      <VisibilityDescription>
                        Anyone can find and view your portfolio
                      </VisibilityDescription>
                    </VisibilityContent>
                  </VisibilityOption>

                  <VisibilityOption 
                    $active={formData.visibility === 'unlisted'}
                    onClick={() => handleInputChange('visibility', 'unlisted')}
                  >
                    <VisibilityIcon><LinkIcon size={20} /></VisibilityIcon>
                    <VisibilityContent>
                      <VisibilityTitle>Unlisted</VisibilityTitle>
                      <VisibilityDescription>
                        Only people with the link can view your portfolio
                      </VisibilityDescription>
                    </VisibilityContent>
                  </VisibilityOption>

                  <VisibilityOption 
                    $active={formData.visibility === 'private'}
                    onClick={() => handleInputChange('visibility', 'private')}
                  >
                    <VisibilityIcon><Lock size={20} /></VisibilityIcon>
                    <VisibilityContent>
                      <VisibilityTitle>Private</VisibilityTitle>
                      <VisibilityDescription>
                        Only you can view your portfolio
                      </VisibilityDescription>
                    </VisibilityContent>
                  </VisibilityOption>
                </VisibilityOptions>
              </FormGroup>
            </FormGrid>
          </Section>
        )}

        {/* Appearance */}
        {activeSection === 'customization' && (
          <Section>
            <SectionHeader>
              <SectionTitle>Appearance</SectionTitle>
              <SectionDescription>
                Customize how your portfolio looks and feels.
              </SectionDescription>
            </SectionHeader>

            <ComingSoonMessage>
              <Palette size={48} />
              <h3>Customization Options Coming Soon</h3>
              <p>We're working on advanced customization features including themes, colors, and layouts.</p>
            </ComingSoonMessage>
          </Section>
        )}

        {/* Danger Zone */}
        {activeSection === 'danger' && onDelete && (
          <Section>
            <SectionHeader>
              <SectionTitle>Danger Zone</SectionTitle>
              <SectionDescription>
                Irreversible actions that will permanently affect your portfolio.
              </SectionDescription>
            </SectionHeader>

            <DangerZone>
              <DangerCard>
                <DangerIcon>
                  <Trash2 size={24} />
                </DangerIcon>
                <DangerContent>
                  <DangerTitle>Delete Portfolio</DangerTitle>
                  <DangerDescription>
                    Permanently delete your portfolio and all associated data. This action cannot be undone.
                  </DangerDescription>
                </DangerContent>
                <DangerButton onClick={() => setShowDeleteConfirm(true)}>
                  Delete Portfolio
                </DangerButton>
              </DangerCard>
            </DangerZone>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <Modal>
                <ModalOverlay onClick={() => setShowDeleteConfirm(false)} />
                <ModalContent>
                  <ModalHeader>
                    <AlertTriangle size={24} color="#dc2626" />
                    <h3>Delete Portfolio</h3>
                  </ModalHeader>
                  <ModalBody>
                    <p>Are you sure you want to delete your portfolio? This action cannot be undone.</p>
                    <CheckboxGroup>
                      <Checkbox
                        type="checkbox"
                        checked={deleteGalleryPieces}
                        onChange={(e) => setDeleteGalleryPieces(e.target.checked)}
                      />
                      <label>Also delete all gallery pieces and uploaded images</label>
                    </CheckboxGroup>
                  </ModalBody>
                  <ModalActions>
                    <ModalButton onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </ModalButton>
                    <ModalButton $danger onClick={handleDelete}>
                      Delete Portfolio
                    </ModalButton>
                  </ModalActions>
                </ModalContent>
              </Modal>
            )}
          </Section>
        )}
      </SettingsContent>
    </SettingsContainer>
  );
}

// Styled Components
const SettingsContainer = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SettingsNav = styled.nav`
  width: 240px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${props => props.$active ? '#eff6ff' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  border-radius: 8px;
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  @media (max-width: 768px) {
    white-space: nowrap;
    margin-bottom: 0;
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  position: relative;
`;

const SaveBar = styled.div<{ $visible: boolean }>`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #3b82f6;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`;

const SaveInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #3b82f6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f8fafc;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const SectionDescription = styled.p`
  color: #6b7280;
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div<{ $span?: 'full' }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  grid-column: ${props => props.$span === 'full' ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FieldHelp = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  min-height: 42px;
  
  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.7;
  }
`;

const TagInputField = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 120px;
  font-size: 0.875rem;
`;

const TagAddButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #2563eb;
  }
`;

const VisibilityOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VisibilityOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
  }
`;

const VisibilityIcon = styled.div`
  color: #6b7280;
`;

const VisibilityContent = styled.div`
  flex: 1;
`;

const VisibilityTitle = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const VisibilityDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ComingSoonMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  
  h3 {
    margin: 1rem 0 0.5rem 0;
    color: #374151;
  }
`;

const DangerZone = styled.div`
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
`;

const DangerCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
`;

const DangerIcon = styled.div`
  color: #dc2626;
`;

const DangerContent = styled.div`
  flex: 1;
`;

const DangerTitle = styled.h4`
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 0.25rem 0;
`;

const DangerDescription = styled.p`
  color: #991b1b;
  margin: 0;
  font-size: 0.875rem;
`;

const DangerButton = styled.button`
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #b91c1c;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  position: relative;
  z-index: 1;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  
  h3 {
    margin: 0;
    color: #111827;
  }
`;

const ModalBody = styled.div`
  padding: 0 1.5rem 1rem 1.5rem;
  
  p {
    color: #6b7280;
    margin: 0 0 1rem 0;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    color: #374151;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$danger ? '#dc2626' : '#d1d5db'};
  background: ${props => props.$danger ? '#dc2626' : 'white'};
  color: ${props => props.$danger ? 'white' : '#374151'};
  
  &:hover {
    background: ${props => props.$danger ? '#b91c1c' : '#f9fafb'};
  }
`;