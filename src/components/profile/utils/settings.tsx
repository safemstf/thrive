// src/app/dashboard/settings/page.tsx - Professional Configuration Hub
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/authProvider';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  Eye,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';

import {
  PageWrapper,
  Container,
  Header,
  HeaderContent,
  WelcomeSection,
  WelcomeTitle,
  WelcomeSubtitle,
  ViewToggle,
  ViewButton
} from '@/components/dashboard/dashboardStyles';

import { Card, CardContent } from '@/styles/styled-components';
import styled from 'styled-components';
import { theme } from '@/styles/theme';

// Professional styled components
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

const NotificationBadge = styled.div`
  background: #ef4444;
  color: white;
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
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

const InfoBox = styled.div`
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};

  svg {
    color: #3b82f6;
    flex-shrink: 0;
  }

  p {
    font-size: ${theme.typography.sizes.sm};
    color: #1e40af;
    margin: 0;
    line-height: 1.6;
  }
`;

interface SettingsState {
  notifications: {
    email: boolean;
    portfolio: boolean;
    marketing: boolean;
    weekly: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private';
    showEmail: boolean;
    showActivity: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}
import { 
  type Portfolio
} from '@/types/portfolio.types';

type ProfessionalSettingsPageProps = {
  portfolio: Portfolio;
  onUpdate: (updates: Partial<Portfolio>) => Promise<void>;
  onDelete: (deleteGalleryPieces?: boolean) => Promise<void>;
  isUpdating: boolean;
};

export default function ProfessionalSettingsPage({
  portfolio,
  onUpdate,
  onDelete,
  isUpdating
}: ProfessionalSettingsPageProps) {  const { user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'notifications' | 'privacy' | 'display' | 'account'>('notifications');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      portfolio: true,
      marketing: false,
      weekly: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showActivity: true
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Los_Angeles'
    }
  });

  const handleToggle = (category: keyof SettingsState, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
    setHasChanges(true);
  };

  const handleSelect = (category: keyof SettingsState, setting: string, value: string) => {
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
    setSaving(false);
    setHasChanges(false);
  };

  const sidebarItems = [
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={18} /> },
    { id: 'display', label: 'Display & Preferences', icon: <Palette size={18} /> },
    { id: 'account', label: 'Account Settings', icon: <Settings size={18} /> }
  ];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>Settings & Preferences</WelcomeTitle>
              <WelcomeSubtitle>
                Manage your account settings and configure your experience
              </WelcomeSubtitle>
            </WelcomeSection>
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
            {activeSection === 'notifications' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Bell size={20} />
                    Email Notifications
                  </SectionTitle>
                  <SectionDescription>
                    Choose which emails you'd like to receive from us
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Activity Updates</SettingTitle>
                      <SettingHint>Get notified about portfolio views, comments, and ratings</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.email}
                      onClick={() => handleToggle('notifications', 'email')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Portfolio Milestones</SettingTitle>
                      <SettingHint>Celebrate achievements and track your progress</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.portfolio}
                      onClick={() => handleToggle('notifications', 'portfolio')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Weekly Digest</SettingTitle>
                      <SettingHint>Summary of your portfolio performance and insights</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.weekly}
                      onClick={() => handleToggle('notifications', 'weekly')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Marketing & Updates</SettingTitle>
                      <SettingHint>Product updates, tips, and promotional content</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.marketing}
                      onClick={() => handleToggle('notifications', 'marketing')}
                    />
                  </SettingItem>
                </SettingsSection>

                <InfoBox>
                  <Info size={16} />
                  <p>
                    You can unsubscribe from all emails at any time by clicking the link in the footer of our emails.
                  </p>
                </InfoBox>
              </>
            )}

            {activeSection === 'privacy' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Shield size={20} />
                    Privacy Settings
                  </SectionTitle>
                  <SectionDescription>
                    Control who can see your profile and activity
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Profile Visibility</SettingTitle>
                      <SettingHint>Choose who can view your portfolio</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSelect('privacy', 'profileVisibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="followers">Followers Only</option>
                      <option value="private">Private</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Show Email Address</SettingTitle>
                      <SettingHint>Display your email on your public profile</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.privacy.showEmail}
                      onClick={() => handleToggle('privacy', 'showEmail')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Activity Status</SettingTitle>
                      <SettingHint>Show when you're active on the platform</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.privacy.showActivity}
                      onClick={() => handleToggle('privacy', 'showActivity')}
                    />
                  </SettingItem>
                </SettingsSection>

                <SettingsSection>
                  <SectionTitle>
                    <Shield size={20} />
                    Security
                  </SectionTitle>
                  <SectionDescription>
                    Keep your account secure
                  </SectionDescription>

                  <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <ActionButton>
                      Change Password
                    </ActionButton>
                    <ActionButton>
                      Enable 2FA
                    </ActionButton>
                  </div>
                </SettingsSection>
              </>
            )}

            {activeSection === 'display' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Palette size={20} />
                    Display Preferences
                  </SectionTitle>
                  <SectionDescription>
                    Customize how the platform looks and feels
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Theme</SettingTitle>
                      <SettingHint>Choose your preferred color scheme</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.display.theme}
                      onChange={(e) => handleSelect('display', 'theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Language</SettingTitle>
                      <SettingHint>Select your preferred language</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.display.language}
                      onChange={(e) => handleSelect('display', 'language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </Select>
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Timezone</SettingTitle>
                      <SettingHint>Set your local timezone for accurate timestamps</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.display.timezone}
                      onChange={(e) => handleSelect('display', 'timezone', e.target.value)}
                    >
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/New_York">Eastern Time</option>
                    </Select>
                  </SettingItem>
                </SettingsSection>
              </>
            )}

            {activeSection === 'account' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Settings size={20} />
                    Account Information
                  </SectionTitle>
                  <SectionDescription>
                    Manage your account details and preferences
                  </SectionDescription>

                  <div style={{ 
                    background: '#f9fafb', 
                    padding: theme.spacing.lg, 
                    borderRadius: theme.borderRadius.md,
                    marginBottom: theme.spacing.lg 
                  }}>
                    <div style={{ marginBottom: theme.spacing.md }}>
                      <div style={{ fontWeight: theme.typography.weights.medium }}>Name</div>
                      <div style={{ color: theme.colors.text.secondary }}>{user?.name}</div>
                    </div>
                    <div style={{ marginBottom: theme.spacing.md }}>
                      <div style={{ fontWeight: theme.typography.weights.medium }}>Email</div>
                      <div style={{ color: theme.colors.text.secondary }}>{user?.email}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: theme.typography.weights.medium }}>Member Since</div>
                      <div style={{ color: theme.colors.text.secondary }}>January 2024</div>
                    </div>
                  </div>

                  <ActionButton>
                    <Mail size={16} />
                    Update Email
                  </ActionButton>
                </SettingsSection>

                <SettingsSection>
                  <SectionTitle style={{ color: '#ef4444' }}>
                    <AlertCircle size={20} />
                    Danger Zone
                  </SectionTitle>
                  <SectionDescription>
                    Irreversible actions - please be careful
                  </SectionDescription>

                  <ActionButton $variant="danger">
                    Delete Account
                  </ActionButton>
                </SettingsSection>
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
                gap: theme.spacing.md
              }}>
                <button
                  onClick={() => {
                    window.location.reload();
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
                <ActionButton onClick={handleSave}>
                  {saving ? (
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