// src\app\dashboard\settings\page.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/authProvider';
import {
  Bell,
  Shield,
  Palette,
  Settings as SettingsIcon,
  Mail,
  AlertCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { theme } from '@/styles/theme';
import styled from 'styled-components';
import { PageContainer, Container, Heading1 } from '@/styles/styled-components';
import { PageWrapper } from '@/app/thrive/styles';
import { HeaderContent, WelcomeSection, WelcomeTitle, WelcomeSubtitle } from '@/components/dashboard/dashboardStyles';
import { Header } from '@/components/misc/header';



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

type SettingsState = {
  notifications: {
    email: boolean;
    marketing: boolean;
    updates: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
};

export default function GlobalSettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'notifications' | 'display' | 'account'>('notifications');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      marketing: false,
      updates: true
    },
    display: {
      theme: 'light',
      language: 'en'
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setSaving(false);
    setHasChanges(false);
  };

  const sidebarItems = [
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'display', label: 'Display', icon: <Palette size={18} /> },
    { id: 'account', label: 'Account Info', icon: <SettingsIcon size={18} /> }
  ];

  return (
    <PageWrapper>
      <Container>
        <Header title={''}>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>Settings</WelcomeTitle>
              <WelcomeSubtitle>Manage your personal preferences across the platform</WelcomeSubtitle>
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
              <SettingsSection>
                <SectionTitle>
                  <Bell size={20} />
                  Notification Preferences
                </SectionTitle>
                <SectionDescription>
                  Manage what you receive from us
                </SectionDescription>

                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Email Alerts</SettingTitle>
                    <SettingHint>Get notified about major activity</SettingHint>
                  </SettingLabel>
                  <Toggle $active={settings.notifications.email} onClick={() => handleToggle('notifications', 'email')} />
                </SettingItem>

                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Platform Updates</SettingTitle>
                    <SettingHint>Receive important changes and news</SettingHint>
                  </SettingLabel>
                  <Toggle $active={settings.notifications.updates} onClick={() => handleToggle('notifications', 'updates')} />
                </SettingItem>

                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Marketing</SettingTitle>
                    <SettingHint>Get product announcements and tips</SettingHint>
                  </SettingLabel>
                  <Toggle $active={settings.notifications.marketing} onClick={() => handleToggle('notifications', 'marketing')} />
                </SettingItem>
              </SettingsSection>
            )}

            {activeSection === 'display' && (
              <SettingsSection>
                <SectionTitle>
                  <Palette size={20} />
                  Display Settings
                </SectionTitle>
                <SectionDescription>Customize how the app looks for you</SectionDescription>

                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Theme</SettingTitle>
                    <SettingHint>Choose between light or dark mode</SettingHint>
                  </SettingLabel>
                  <Select value={settings.display.theme} onChange={(e) => handleSelect('display', 'theme', e.target.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </Select>
                </SettingItem>

                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Language</SettingTitle>
                    <SettingHint>Select your preferred language</SettingHint>
                  </SettingLabel>
                  <Select value={settings.display.language} onChange={(e) => handleSelect('display', 'language', e.target.value)}>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </Select>
                </SettingItem>
              </SettingsSection>
            )}

            {activeSection === 'account' && (
              <SettingsSection>
                <SectionTitle>
                  <SettingsIcon size={20} />
                  Account Info
                </SectionTitle>
                <SectionDescription>Basic info tied to your user account</SectionDescription>

                <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Name:</strong> {user?.name}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Email:</strong> {user?.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {user?.role}
                  </div>
                </div>

                <ActionButton>
                  <Mail size={16} />
                  Update Email
                </ActionButton>

                <SettingsSection>
                  <SectionTitle style={{ color: '#ef4444' }}>
                    <AlertCircle size={20} />
                    Danger Zone
                  </SectionTitle>
                  <SectionDescription>
                    This action cannot be undone
                  </SectionDescription>
                  <ActionButton $variant="danger">
                    Delete Account
                  </ActionButton>
                </SettingsSection>
              </SettingsSection>
            )}

            {hasChanges && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: 16, marginTop: 24, borderTop: '1px solid #eee' }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ccc',
                    padding: '8px 16px',
                    borderRadius: 4,
                    cursor: 'pointer'
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
