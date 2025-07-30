// src/components/portfolio/portfolioCreation.tsx
'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import { api } from '@/lib/api-client'; // Your existing API client
import {
  User, Brush, GraduationCap, Code, FolderOpen, 
  CheckCircle, ArrowRight, Loader2, X, Plus,
  BookOpen, Camera, Palette, Users, Award,
  PenTool, Brain, Calculator
} from 'lucide-react';
import type { CreatePortfolioDto } from '@/types/portfolio.types';

export interface PortfolioCreationProps {
  targetType: 'creative' | 'educational' | 'professional' | 'hybrid';
  onSuccess?: (portfolioId: string) => void;
  onCancel?: () => void;
  inline?: boolean;
  showCloseButton?: boolean;
}

// Fix: Update the visibility type to include 'unlisted'
type VisibilityType = 'public' | 'private' | 'unlisted';

export const PortfolioCreation: React.FC<PortfolioCreationProps> = ({
  targetType,
  onSuccess,
  onCancel,
  inline = false,
  showCloseButton = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(targetType);
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    bio: '',
    visibility: 'public' as VisibilityType, // Fix: Use the updated type
    specializations: [] as string[],
    tags: [] as string[]
  });

  const { user } = useAuth();
  const router = useRouter();

  const portfolioTypes = {
    creative: {
      id: 'creative',
      title: 'Creative Portfolio',
      subtitle: 'Art • Photography • Design',
      description: 'Showcase your artistic work, photography, and design projects',
      icon: <Brush size={32} />,
      color: '#8b5cf6',
      features: [
        'Image gallery with metadata',
        'Project showcases',
        'Artist statement',
        'Exhibition history',
        'Commission inquiries'
      ],
      defaultName: `${user?.name}'s Creative Portfolio`,
      defaultTagline: 'Showcasing my creative journey'
    },
    educational: {
      id: 'educational',
      title: 'Teaching Portfolio',
      subtitle: 'Education • Curriculum • Training',
      description: 'Document your teaching philosophy, curriculum, and educational impact',
      icon: <GraduationCap size={32} />,
      color: '#3b82f6',
      features: [
        'Teaching philosophy',
        'Curriculum materials',
        'Student outcomes',
        'Professional development',
        'Research publications'
      ],
      defaultName: `${user?.name}'s Teaching Portfolio`,
      defaultTagline: 'Inspiring minds through education'
    },
    professional: {
      id: 'professional',
      title: 'Tech Portfolio',
      subtitle: 'Software • Development • Engineering',
      description: 'Highlight your technical skills, projects, and professional experience',
      icon: <Code size={32} />,
      color: '#059669',
      features: [
        'Code repositories',
        'Technical projects',
        'Skills & certifications',
        'Professional timeline',
        'Contact & resume'
      ],
      defaultName: `${user?.name}'s Tech Portfolio`,
      defaultTagline: 'Building innovative solutions'
    },
    hybrid: {
      id: 'hybrid',
      title: 'Multi-Portfolio',
      subtitle: 'Creative • Teaching • Professional',
      description: 'Combine multiple portfolio types for diverse professional identity',
      icon: <FolderOpen size={32} />,
      color: '#10b981',
      features: [
        'All portfolio features',
        'Customizable sections',
        'Flexible organization',
        'Multiple focus areas',
        'Comprehensive showcase'
      ],
      defaultName: `${user?.name}'s Portfolio`,
      defaultTagline: 'Diverse skills, unified vision'
    }
  };

  const currentType = portfolioTypes[selectedType as keyof typeof portfolioTypes];

  const handleCreate = async () => {
    if (!currentType || !formData.title.trim()) return;

    setIsCreating(true);
    try {
      // Using your existing API client structure
      const portfolioData: CreatePortfolioDto = {
        title: formData.title.trim(),
        tagline: formData.tagline.trim() || undefined,
        bio: formData.bio.trim(),
        visibility: formData.visibility,
        specializations: formData.specializations,
        tags: formData.tags
      };

      const response = await api.portfolio.create(portfolioData);

      if (onSuccess) {
        onSuccess(response.id);
      } else {
        // Redirect to appropriate section
        const redirectMap = {
          creative: '/dashboard/gallery',
          educational: '/dashboard/writing',
          professional: '/dashboard/projects',
          hybrid: '/dashboard/profile'
        };
        router.push(redirectMap[selectedType as keyof typeof redirectMap]);
      }
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsCreating(false);
    }
  };

  // Fix: Update the visibility change handler to use the correct type
  const handleVisibilityChange = (value: VisibilityType) => {
    setFormData(prev => ({ ...prev, visibility: value }));
  };

  const Container = inline ? InlineContainer : ModalContainer;

  return (
    <Container>
      {!inline && <Backdrop onClick={onCancel} />}
      <CreationCard $inline={inline}>
        {showCloseButton && (
          <CloseButton onClick={onCancel}>
            <X size={20} />
          </CloseButton>
        )}

        <Header>
          <HeaderIcon $color={currentType.color}>
            {currentType.icon}
          </HeaderIcon>
          <HeaderText>
            <Title>Create {currentType.title}</Title>
            <Subtitle>{currentType.description}</Subtitle>
          </HeaderText>
        </Header>

        {/* Portfolio Type Selection (only for hybrid) */}
        {targetType === 'hybrid' && (
          <TypeSelection>
            <SectionTitle>Choose Portfolio Type</SectionTitle>
            <TypeGrid>
              {Object.values(portfolioTypes).map((type) => (
                <TypeCard
                  key={type.id}
                  $selected={selectedType === type.id}
                  $color={type.color}
                  onClick={() => setSelectedType(type.id)}
                >
                  <TypeIcon>{type.icon}</TypeIcon>
                  <TypeLabel>{type.title}</TypeLabel>
                  <TypeSubtitle>{type.subtitle}</TypeSubtitle>
                </TypeCard>
              ))}
            </TypeGrid>
          </TypeSelection>
        )}

        {/* Portfolio Details Form */}
        <FormSection>
          <SectionTitle>Portfolio Details</SectionTitle>
          <FormGroup>
            <Label>Portfolio Title</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={currentType.defaultName}
            />
          </FormGroup>
          <FormGroup>
            <Label>Tagline (Optional)</Label>
            <Input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder={currentType.defaultTagline}
            />
          </FormGroup>
          <FormGroup>
            <Label>Bio/Description</Label>
            <TextArea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell visitors about yourself and your work..."
              rows={3}
            />
          </FormGroup>
        </FormSection>

        {/* Visibility Settings */}
        <SettingsSection>
          <SectionTitle>Portfolio Visibility</SectionTitle>
          <RadioGroup>
            <RadioItem>
              <Radio
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={() => handleVisibilityChange('public')}
              />
              <RadioLabel>
                <strong>Public</strong>
                <span>Anyone can view your portfolio</span>
              </RadioLabel>
            </RadioItem>
            <RadioItem>
              <Radio
                type="radio"
                name="visibility"
                value="unlisted"
                checked={formData.visibility === 'unlisted'}
                onChange={() => handleVisibilityChange('unlisted')}
              />
              <RadioLabel>
                <strong>Unlisted</strong>
                <span>Only those with the link can view</span>
              </RadioLabel>
            </RadioItem>
            <RadioItem>
              <Radio
                type="radio"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={() => handleVisibilityChange('private')}
              />
              <RadioLabel>
                <strong>Private</strong>
                <span>Only you can view</span>
              </RadioLabel>
            </RadioItem>
          </RadioGroup>
        </SettingsSection>

        {/* Features Preview */}
        <FeaturesSection>
          <SectionTitle>What You'll Get</SectionTitle>
          <FeaturesList>
            {currentType.features.map((feature, index) => (
              <FeatureItem key={index}>
                <CheckCircle size={16} />
                <span>{feature}</span>
              </FeatureItem>
            ))}
          </FeaturesList>
        </FeaturesSection>

        {/* Action Buttons */}
        <ActionButtons>
          {onCancel && (
            <CancelButton onClick={onCancel} disabled={isCreating}>
              Cancel
            </CancelButton>
          )}
          <CreateButton
            onClick={handleCreate}
            disabled={isCreating || !formData.title.trim()}
            $color={currentType.color}
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Portfolio
                <ArrowRight size={16} />
              </>
            )}
          </CreateButton>
        </ActionButtons>
      </CreationCard>
    </Container>
  );
};

// Quick Portfolio Creation Button Component
export const QuickCreateButton: React.FC<{
  type: 'creative' | 'educational';
  onSuccess?: (portfolioId: string) => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ type, onSuccess, size = 'medium' }) => {
  const [showCreation, setShowCreation] = useState(false);

  const config = {
    creative: {
      title: 'Create Creative Portfolio',
      subtitle: 'Start showcasing your art',
      icon: <Brush size={size === 'large' ? 24 : size === 'medium' ? 20 : 16} />,
      color: '#8b5cf6'
    },
    educational: {
      title: 'Create Teaching Portfolio',
      subtitle: 'Document your education impact',
      icon: <GraduationCap size={size === 'large' ? 24 : size === 'medium' ? 20 : 16} />,
      color: '#3b82f6'
    }
  };

  const currentConfig = config[type];

  return (
    <>
      <QuickButton
        onClick={() => setShowCreation(true)}
        $color={currentConfig.color}
        $size={size}
      >
        <ButtonIcon>{currentConfig.icon}</ButtonIcon>
        <ButtonText $size={size}>
          <ButtonTitle>{currentConfig.title}</ButtonTitle>
          {size !== 'small' && <ButtonSubtitle>{currentConfig.subtitle}</ButtonSubtitle>}
        </ButtonText>
        <ArrowRight size={16} />
      </QuickButton>

      {showCreation && (
        <PortfolioCreation
          targetType={type}
          onSuccess={(portfolioId) => {
            setShowCreation(false);
            onSuccess?.(portfolioId);
          }}
          onCancel={() => setShowCreation(false)}
          showCloseButton={true}
        />
      )}
    </>
  );
};

// Styled Components (keeping all the existing styles)
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const InlineContainer = styled.div`
  width: 100%;
`;

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const CreationCard = styled.div<{ $inline: boolean }>`
  position: relative;
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.$inline ? 
    '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};
  border: 1px solid #e5e7eb;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: #e5e7eb;
    transform: scale(1.05);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
`;

const HeaderIcon = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${props => props.$color}, ${props => props.$color}dd);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const TypeSelection = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const TypeCard = styled.button<{ $selected: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border: 2px solid ${props => props.$selected ? props.$color : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.$selected ? `${props.$color}08` : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: ${props => props.$color};
    transform: translateY(-2px);
  }
`;

const TypeIcon = styled.div`
  margin-bottom: 0.75rem;
  color: #374151;
`;

const TypeLabel = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const TypeSubtitle = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const FormSection = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SettingsSection = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RadioItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const Radio = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #3b82f6;
`;

const RadioLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  
  strong {
    color: #374151;
    margin-bottom: 0.25rem;
  }
  
  span {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
`;

const CheckboxLabel = styled.label`
  color: #374151;
  cursor: pointer;
`;

const FeaturesSection = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #059669;
  font-size: 0.875rem;

  svg {
    flex-shrink: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  padding: 2rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CreateButton = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$color};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$color}dd;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const QuickButton = styled.button<{ $color: string; $size: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: ${props => 
    props.$size === 'large' ? '2rem' : 
    props.$size === 'medium' ? '1.5rem' : '1rem'};
  background: linear-gradient(135deg, ${props => props.$color}08, ${props => props.$color}04);
  border: 2px solid ${props => props.$color}20;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;

  &:hover {
    background: linear-gradient(135deg, ${props => props.$color}12, ${props => props.$color}08);
    border-color: ${props => props.$color}40;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -8px ${props => props.$color}40;
  }
`;

const ButtonIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ButtonText = styled.div<{ $size: string }>`
  flex: 1;
`;

const ButtonTitle = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ButtonSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;