// src/app/portfolio/[username]/settings/page.tsx - Portfolio-Specific Settings (FIXED)
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/authProvider';
import {
  Settings,
  Eye,
  EyeOff,
  Palette,
  Link,
  Share2,
  Bell,
  Users,
  Image,
  Layout,
  Globe,
  Lock,
  Heart,
  MessageCircle,
  Star,
  Download,
  Upload,
  Save,
  RefreshCw,
  AlertCircle,
  Info,
  Trash2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

import { theme } from '@/styles/styled-components';
import styled from 'styled-components';
import type { Portfolio } from '@/types/portfolio.types';

// Professional styled components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding: 2rem 1rem;
  font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2c2c2c;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
`;

const WelcomeSection = styled.div``;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

const PortfolioBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const SidebarItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#e5e7eb' : 'transparent'};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${props => props.$active ? theme.typography.weights.medium : theme.typography.weights.normal};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};

  &:hover {
    background: ${props => props.$active ? 'white' : '#f9fafb'};
    border-color: #e5e7eb;
  }

  svg {
    color: ${props => props.$active ? '#3b82f6' : '#9ca3af'};
  }
`;

const SettingsContent = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.light};
  padding: ${theme.spacing.xl};
`;

const SettingsSection = styled.div`
  margin-bottom: ${theme.spacing['2xl']};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SectionDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h4`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 0.25rem 0;
`;

const SettingHint = styled.p`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 48px;
  height: 28px;
  background: ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  border: none;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '23px' : '3px'};
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.primary};
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.primary};
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.primary};
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  ${props => props.$variant === 'danger' ? `
    background: white;
    color: #ef4444;
    border: 1px solid #ef4444;

    &:hover {
      background: #fef2f2;
    }
  ` : props.$variant === 'secondary' ? `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;

    &:hover {
      background: #f9fafb;
    }
  ` : `
    background: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;

    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  `}
`;

const InfoBox = styled.div<{ $type?: 'info' | 'warning' | 'success' }>`
  background: ${props => 
    props.$type === 'warning' ? '#fef3cd' :
    props.$type === 'success' ? '#d1e7dd' :
    '#eff6ff'
  };
  border: 1px solid ${props => 
    props.$type === 'warning' ? '#fecba6' :
    props.$type === 'success' ? '#badbcc' :
    '#dbeafe'
  };
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};

  svg {
    color: ${props => 
      props.$type === 'warning' ? '#f59e0b' :
      props.$type === 'success' ? '#10b981' :
      '#3b82f6'
    };
    flex-shrink: 0;
  }

  p {
    font-size: ${theme.typography.sizes.sm};
    color: ${props => 
      props.$type === 'warning' ? '#92400e' :
      props.$type === 'success' ? '#065f46' :
      '#1e40af'
    };
    margin: 0;
    line-height: 1.6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const FormLabel = styled.label`
  display: block;
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
`;

const URLPreview = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.md};
  font-family: 'Fira Code', monospace;
  font-size: ${theme.typography.sizes.sm};
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const StatCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
`;

// Fixed interface - now properly extends the page component props
interface PortfolioSettingsPageProps {
  params: {
    username: string;
  };
  portfolio?: Portfolio;
  onUpdate?: (updates: Partial<Portfolio>) => Promise<void>;
  onDelete?: (deleteGalleryPieces?: boolean) => Promise<void>;
  isUpdating?: boolean;
}

interface PortfolioSettingsState {
  profile: {
    name: string;
    bio: string;
    location: string;
    website: string;
  };
  privacy: {
    visibility: 'public' | 'unlisted' | 'private';
    allowComments: boolean;
    allowDownloads: boolean;
    showStats: boolean;
  };
  notifications: {
    newFollowers: boolean;
    comments: boolean;
    likes: boolean;
    mentions: boolean;
  };
  display: {
    theme: 'modern' | 'classic' | 'minimal';
    layout: 'grid' | 'masonry' | 'slideshow';
    showCategories: boolean;
    autoPlay: boolean;
  };
}

export default function PortfolioSettingsPage({
  params,
  portfolio,
  onUpdate,
  onDelete,
  isUpdating
}: PortfolioSettingsPageProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'privacy' | 'notifications' | 'display' | 'analytics' | 'danger'>('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { username } = params;
  
  const [settings, setSettings] = useState<PortfolioSettingsState>({
    profile: {
      name: portfolio?.title || '',
      bio: portfolio?.bio || '',
      location: '',
      website: ''
    },
    privacy: {
      visibility: 'public',
      allowComments: true,
      allowDownloads: false,
      showStats: true
    },
    notifications: {
      newFollowers: true,
      comments: true,
      likes: true,
      mentions: true
    },
    display: {
      theme: 'modern',
      layout: 'grid',
      showCategories: true,
      autoPlay: false
    }
  });

  const portfolioUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'}/portfolio/${portfolio?.username || username}`;

  const handleToggle = (category: keyof PortfolioSettingsState, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
    setHasChanges(true);
  };

  const handleSelect = (category: keyof PortfolioSettingsState, setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleInputChange = (category: keyof PortfolioSettingsState, setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (onUpdate) {
      await onUpdate({
        title: settings.profile.name,
        bio: settings.profile.bio
      });
    }
    setSaving(false);
    setHasChanges(false);
  };

  const copyPortfolioUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile Info', icon: <Settings size={18} /> },
    { id: 'privacy', label: 'Privacy & Sharing', icon: <Eye size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'display', label: 'Display & Theme', icon: <Palette size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <Users size={18} /> },
    { id: 'danger', label: 'Danger Zone', icon: <Trash2 size={18} /> }
  ];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>Portfolio Settings</WelcomeTitle>
              <WelcomeSubtitle>
                Customize your portfolio appearance and behavior
              </WelcomeSubtitle>
            </WelcomeSection>
            
            <PortfolioBadge>
              <Globe size={16} />
              {portfolio?.username || username}
            </PortfolioBadge>
          </HeaderContent>
        </Header>

        <SettingsGrid>
          <SettingsSidebar>
            {sidebarItems.map(item => (
              <SidebarItem
                key={item.id}
                $active={activeSection === item.id}
                onClick={() => setActiveSection(item.id as any)}
              >
                {item.icon}
                {item.label}
              </SidebarItem>
            ))}
          </SettingsSidebar>

          <SettingsContent>
            {activeSection === 'profile' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Settings size={20} />
                    Portfolio Information
                  </SectionTitle>
                  <SectionDescription>
                    Basic information displayed on your portfolio
                  </SectionDescription>

                  <FormGroup>
                    <FormLabel>Portfolio Name</FormLabel>
                    <Input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                      placeholder="Your portfolio name"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Bio / Description</FormLabel>
                    <Textarea
                      value={settings.profile.bio}
                      onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                      placeholder="Tell visitors about yourself and your work..."
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Location</FormLabel>
                    <Input
                      type="text"
                      value={settings.profile.location}
                      onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Website</FormLabel>
                    <Input
                      type="url"
                      value={settings.profile.website}
                      onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </FormGroup>
                </SettingsSection>

                <SettingsSection>
                  <SectionTitle>
                    <Link size={20} />
                    Portfolio URL
                  </SectionTitle>
                  <SectionDescription>
                    Share your portfolio with this link
                  </SectionDescription>

                  <URLPreview>
                    <span>{portfolioUrl}</span>
                    <CopyButton onClick={copyPortfolioUrl}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </CopyButton>
                  </URLPreview>

                  <ButtonGroup>
                    <ActionButton $variant="secondary">
                      <ExternalLink size={16} />
                      Preview Portfolio
                    </ActionButton>
                    <ActionButton $variant="secondary">
                      <Share2 size={16} />
                      Share Portfolio
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>
              </>
            )}

            {activeSection === 'privacy' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Eye size={20} />
                    Visibility Settings
                  </SectionTitle>
                  <SectionDescription>
                    Control who can see your portfolio and gallery
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Portfolio Visibility</SettingTitle>
                      <SettingHint>Who can view your portfolio</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.privacy.visibility}
                      onChange={(e) => handleSelect('privacy', 'visibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted (link only)</option>
                      <option value="private">Private</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Allow Comments</SettingTitle>
                      <SettingHint>Let visitors leave comments on your work</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.privacy.allowComments}
                      onClick={() => handleToggle('privacy', 'allowComments')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Allow Downloads</SettingTitle>
                      <SettingHint>Let visitors download your images</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.privacy.allowDownloads}
                      onClick={() => handleToggle('privacy', 'allowDownloads')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Show Statistics</SettingTitle>
                      <SettingHint>Display view counts and engagement metrics</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.privacy.showStats}
                      onClick={() => handleToggle('privacy', 'showStats')}
                    />
                  </SettingItem>
                </SettingsSection>

                <InfoBox>
                  <Info size={16} />
                  <p>
                    Private portfolios are only visible to you. Unlisted portfolios can be accessed 
                    by anyone with the direct link but won't appear in search results.
                  </p>
                </InfoBox>
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Bell size={20} />
                    Portfolio Notifications
                  </SectionTitle>
                  <SectionDescription>
                    Choose what portfolio activities you want to be notified about
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>New Followers</SettingTitle>
                      <SettingHint>When someone follows your portfolio</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.newFollowers}
                      onClick={() => handleToggle('notifications', 'newFollowers')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Comments</SettingTitle>
                      <SettingHint>When someone comments on your work</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.comments}
                      onClick={() => handleToggle('notifications', 'comments')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Likes & Reactions</SettingTitle>
                      <SettingHint>When someone likes your gallery pieces</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.likes}
                      onClick={() => handleToggle('notifications', 'likes')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Mentions</SettingTitle>
                      <SettingHint>When someone mentions your portfolio</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.mentions}
                      onClick={() => handleToggle('notifications', 'mentions')}
                    />
                  </SettingItem>
                </SettingsSection>
              </>
            )}

            {activeSection === 'display' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Palette size={20} />
                    Theme & Layout
                  </SectionTitle>
                  <SectionDescription>
                    Customize how your portfolio looks to visitors
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Portfolio Theme</SettingTitle>
                      <SettingHint>Overall visual style of your portfolio</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.display.theme}
                      onChange={(e) => handleSelect('display', 'theme', e.target.value)}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Gallery Layout</SettingTitle>
                      <SettingHint>How your gallery pieces are arranged</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.display.layout}
                      onChange={(e) => handleSelect('display', 'layout', e.target.value)}
                    >
                      <option value="grid">Grid</option>
                      <option value="masonry">Masonry</option>
                      <option value="slideshow">Slideshow</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Show Categories</SettingTitle>
                      <SettingHint>Display category filters on your portfolio</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.display.showCategories}
                      onClick={() => handleToggle('display', 'showCategories')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Auto-play Slideshow</SettingTitle>
                      <SettingHint>Automatically advance through gallery pieces</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.display.autoPlay}
                      onClick={() => handleToggle('display', 'autoPlay')}
                    />
                  </SettingItem>
                </SettingsSection>
              </>
            )}

            {activeSection === 'analytics' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Users size={20} />
                    Portfolio Analytics
                  </SectionTitle>
                  <SectionDescription>
                    Insights about your portfolio performance
                  </SectionDescription>

                  <StatsGrid>
                    <StatCard>
                      <StatValue>1,234</StatValue>
                      <StatLabel>Total Views</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>89</StatValue>
                      <StatLabel>Followers</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>456</StatValue>
                      <StatLabel>Likes</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatValue>23</StatValue>
                      <StatLabel>Comments</StatLabel>
                    </StatCard>
                  </StatsGrid>

                  <ButtonGroup>
                    <ActionButton $variant="secondary">
                      <Download size={16} />
                      Export Analytics
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>
              </>
            )}

            {activeSection === 'danger' && (
              <>
                <SettingsSection>
                  <SectionTitle style={{ color: '#ef4444' }}>
                    <Trash2 size={20} />
                    Danger Zone
                  </SectionTitle>
                  <SectionDescription>
                    Irreversible actions for your portfolio
                  </SectionDescription>

                  <ButtonGroup>
                    <ActionButton $variant="danger" onClick={() => onDelete?.(false)}>
                      <Trash2 size={16} />
                      Delete Portfolio Only
                    </ActionButton>
                    <ActionButton $variant="danger" onClick={() => onDelete?.(true)}>
                      <Trash2 size={16} />
                      Delete Portfolio & Gallery
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>

                <InfoBox $type="warning">
                  <AlertCircle size={16} />
                  <p>
                    <strong>Portfolio Deletion:</strong> This will permanently delete your portfolio. 
                    You can choose to keep or delete your gallery pieces. This action cannot be undone.
                  </p>
                </InfoBox>
              </>
            )}

            {hasChanges && (
              <div style={{ 
                position: 'sticky', 
                bottom: 0, 
                background: 'white',
                padding: theme.spacing.lg,
                borderTop: `1px solid ${theme.colors.border.light}`,
                marginTop: theme.spacing.xl,
                marginLeft: `-${theme.spacing.xl}`,
                marginRight: `-${theme.spacing.xl}`,
                marginBottom: `-${theme.spacing.xl}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing.md,
                boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    background: 'white',
                    border: `1px solid ${theme.colors.border.medium}`,
                    borderRadius: theme.borderRadius.sm,
                    cursor: 'pointer',
                    fontFamily: theme.typography.fonts.body,
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.medium
                  }}
                >
                  Discard Changes
                </button>
                <ActionButton onClick={handleSave} disabled={saving || isUpdating}>
                  {saving || isUpdating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </ActionButton>
              </div>
            )}
          </SettingsContent>
        </SettingsGrid>
      </Container>
    </PageWrapper>
  );
}