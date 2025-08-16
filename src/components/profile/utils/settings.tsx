// src\components\profile\utils\settings.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/authProvider';
import type { Portfolio } from '@/types/portfolio.types';
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
  RefreshCw,
  User,
  Lock,
  CreditCard,
  Download,
  Trash2
} from 'lucide-react';

import { theme } from '@/styles/styled-components';
import styled from 'styled-components';

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

const AccountCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const AccountDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const AccountLabel = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
`;

const AccountValue = styled.div`
  color: ${theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

interface SettingsState {
  notifications: {
    email: boolean;
    marketing: boolean;
    security: boolean;
    weekly: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    analyticsOptOut: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}


type Props = {
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
}: Props) {  const { user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'privacy' | 'display' | 'security' | 'billing'>('account');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      marketing: false,
      security: true,
      weekly: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      analyticsOptOut: false
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
    { id: 'account', label: 'Account Info', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
    { id: 'display', label: 'Display', icon: <Palette size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> }
  ];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>Account Settings</WelcomeTitle>
              <WelcomeSubtitle>
                Manage your account preferences and global settings
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
            {activeSection === 'account' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <User size={20} />
                    Account Information
                  </SectionTitle>
                  <SectionDescription>
                    Your basic account details and personal information
                  </SectionDescription>

                  <AccountCard>
                    <AccountDetail>
                      <AccountLabel>Full Name</AccountLabel>
                      <AccountValue>{user?.name}</AccountValue>
                    </AccountDetail>
                    <AccountDetail>
                      <AccountLabel>Email Address</AccountLabel>
                      <AccountValue>{user?.email}</AccountValue>
                    </AccountDetail>
                    <AccountDetail>
                      <AccountLabel>Account Type</AccountLabel>
                      <AccountValue>{user?.role || 'User'}</AccountValue>
                    </AccountDetail>
                    <AccountDetail>
                      <AccountLabel>Member Since</AccountLabel>
                      <AccountValue>January 2024</AccountValue>
                    </AccountDetail>
                    <AccountDetail>
                      <AccountLabel>Last Login</AccountLabel>
                      <AccountValue>2 hours ago</AccountValue>
                    </AccountDetail>
                  </AccountCard>

                  <ButtonGroup>
                    <ActionButton>
                      <Mail size={16} />
                      Update Email
                    </ActionButton>
                    <ActionButton $variant="secondary">
                      <User size={16} />
                      Edit Profile
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>

                <InfoBox $type="info">
                  <Info size={16} />
                  <p>
                    Account settings affect your entire platform experience. For portfolio-specific settings, 
                    visit your portfolio settings page.
                  </p>
                </InfoBox>
              </>
            )}

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
                      <SettingTitle>Account Activity</SettingTitle>
                      <SettingHint>Login alerts, password changes, and security updates</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.email}
                      onClick={() => handleToggle('notifications', 'email')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Security Alerts</SettingTitle>
                      <SettingHint>Important security notifications and suspicious activity</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.notifications.security}
                      onClick={() => handleToggle('notifications', 'security')}
                    />
                  </SettingItem>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Weekly Summary</SettingTitle>
                      <SettingHint>Weekly digest of your account activity and updates</SettingHint>
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
                    Security notifications cannot be disabled for your account protection. 
                    You can unsubscribe from marketing emails at any time.
                  </p>
                </InfoBox>
              </>
            )}

            {activeSection === 'privacy' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Eye size={20} />
                    Privacy Controls
                  </SectionTitle>
                  <SectionDescription>
                    Control your privacy and data sharing preferences
                  </SectionDescription>

                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Public Profile</SettingTitle>
                      <SettingHint>Allow others to find your public profile</SettingHint>
                    </SettingLabel>
                    <Select 
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSelect('privacy', 'profileVisibility', e.target.value)}
                    >
                      <option value="public">Public</option>
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
                      <SettingTitle>Opt out of Analytics</SettingTitle>
                      <SettingHint>Disable usage analytics and tracking</SettingHint>
                    </SettingLabel>
                    <Toggle 
                      $active={settings.privacy.analyticsOptOut}
                      onClick={() => handleToggle('privacy', 'analyticsOptOut')}
                    />
                  </SettingItem>
                </SettingsSection>

                <ButtonGroup>
                  <ActionButton $variant="secondary">
                    <Download size={16} />
                    Download My Data
                  </ActionButton>
                </ButtonGroup>
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
                      <option value="de">Deutsch</option>
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
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="Europe/London">London Time</option>
                      <option value="Europe/Paris">Central European Time</option>
                    </Select>
                  </SettingItem>
                </SettingsSection>
              </>
            )}

            {activeSection === 'security' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <Shield size={20} />
                    Security Settings
                  </SectionTitle>
                  <SectionDescription>
                    Keep your account secure with these settings
                  </SectionDescription>

                  <ButtonGroup>
                    <ActionButton>
                      <Lock size={16} />
                      Change Password
                    </ActionButton>
                    <ActionButton $variant="secondary">
                      <Shield size={16} />
                      Enable 2FA
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>

                <InfoBox $type="warning">
                  <AlertCircle size={16} />
                  <p>
                    Two-factor authentication adds an extra layer of security to your account. 
                    We recommend enabling it for better protection.
                  </p>
                </InfoBox>
              </>
            )}

            {activeSection === 'billing' && (
              <>
                <SettingsSection>
                  <SectionTitle>
                    <CreditCard size={20} />
                    Billing & Subscription
                  </SectionTitle>
                  <SectionDescription>
                    Manage your subscription and billing information
                  </SectionDescription>

                  <AccountCard>
                    <AccountDetail>
                      <AccountLabel>Current Plan</AccountLabel>
                      <AccountValue>Free Tier</AccountValue>
                    </AccountDetail>
                    <AccountDetail>
                      <AccountLabel>Monthly Usage</AccountLabel>
                      <AccountValue>12 / 100 API calls</AccountValue>
                    </AccountDetail>
                    <AccountDetail>
                      <AccountLabel>Next Billing Date</AccountLabel>
                      <AccountValue>-</AccountValue>
                    </AccountDetail>
                  </AccountCard>

                  <ButtonGroup>
                    <ActionButton>
                      Upgrade Plan
                    </ActionButton>
                    <ActionButton $variant="secondary">
                      <Download size={16} />
                      Download Invoice
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>

                <SettingsSection>
                  <SectionTitle style={{ color: '#ef4444' }}>
                    <AlertCircle size={20} />
                    Danger Zone
                  </SectionTitle>
                  <SectionDescription>
                    Irreversible actions - please be careful
                  </SectionDescription>

                  <ButtonGroup>
                    <ActionButton $variant="danger">
                      <Trash2 size={16} />
                      Delete Account
                    </ActionButton>
                  </ButtonGroup>
                </SettingsSection>

                <InfoBox $type="warning">
                  <AlertCircle size={16} />
                  <p>
                    <strong>Account Deletion:</strong> This action cannot be undone. All your data, 
                    portfolios, and gallery pieces will be permanently deleted.
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