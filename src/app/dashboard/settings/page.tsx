// src/app/settings/page.tsx - Lean Settings Hub
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/authProvider';
import { useRouter } from 'next/navigation';
import {
  Settings, Briefcase, User, Gauge, ChevronRight, Shield, Bell, Palette,
  CreditCard, Globe, Lock, Eye, Mail, Smartphone, Database, HelpCircle, LogOut
} from 'lucide-react';

// Reuse existing styled components - no duplication!
import {
  PageContainer,
  Container,
  Grid,
  FlexRow,
  FlexColumn,
  Card,
  BaseButton,
  Heading1,
  Heading2,
  Heading3,
  BodyText,
  Badge,
  SettingsCard,
  QuickSettingCard,
  IconContainer,
  StatusBadge,
  responsive
} from '@/styles/styled-components';

// Import utils for logic
import { utils } from '@/utils';
import { Portfolio, PortfolioStatus } from '@/types/portfolio.types';
import styled from 'styled-components';

// ===========================================
// MINIMAL SETTINGS-SPECIFIC COMPONENTS
// ===========================================

const HeroCard = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
`;

const QuickLinksContainer = styled(FlexRow).attrs({ $gap: 'var(--spacing-sm)', $wrap: true })`
  margin-top: var(--spacing-lg);
`;

const QuickLink = styled(Badge)`
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary-600);
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const SectionHeader = styled(FlexRow).attrs({ $gap: 'var(--spacing-md)', $align: 'center' })`
  margin-bottom: var(--spacing-xl);
`;

const PortfolioInfo = styled(FlexRow).attrs({ $justify: 'space-between', $align: 'center' })`
  gap: var(--spacing-md);
`;

// ===========================================
// SETTINGS DATA & LOGIC
// ===========================================

const MAIN_SETTINGS = [
  {
    id: 'account',
    title: 'Account Management',
    description: 'Comprehensive account settings including profile, security, billing, and privacy controls',
    icon: User,
    color: '#3b82f6',
    href: '/settings/account',
    quickLinks: ['Profile', 'Security', 'Billing', 'Privacy', 'Data Export']
  },
  {
    id: 'dashboard',
    title: 'Dashboard Settings',
    description: 'Customize your dashboard experience with personalized layouts, notifications, and quick access tools',
    icon: Gauge,
    color: '#8b5cf6',
    href: '/dashboard/settings',
    quickLinks: ['Layout', 'Notifications', 'Theme', 'Language', 'Shortcuts']
  }
];

const QUICK_SETTINGS = [
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage email and push notifications',
    icon: Bell,
    color: '#3b82f6'
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Control your data and visibility',
    icon: Shield,
    color: '#10b981'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize theme and display',
    icon: Palette,
    color: '#8b5cf6'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Password and 2FA settings',
    icon: Lock,
    color: '#ef4444'
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Manage subscription and payments',
    icon: CreditCard,
    color: '#f59e0b'
  },
  {
    id: 'data',
    title: 'Data & Storage',
    description: 'Export and manage your data',
    icon: Database,
    color: '#06b6d4'
  }
];

export default function SettingsHub() {
  const { user } = useAuth();
  const router = useRouter();

  // Create mock portfolios for demo (replace with real data)
  const createMockPortfolio = (id: string, name: string, username: string, status: PortfolioStatus = 'active'): Portfolio => ({
    id,
    userId: user?.id || 'user-1',
    username,
    name,
    title: name,
    bio: `This is ${name} portfolio`,
    kind: 'creative',
    visibility: 'public',
    status,
    specializations: [],
    tags: [],
    showContactInfo: false,
    settings: {
      allowReviews: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 12,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 0,
      uniqueVisitors: 0,
      totalPieces: 0,
      totalReviews: 0,
      viewsThisWeek: 0,
      viewsThisMonth: 0,
      shareCount: 0,
      savedCount: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const userPortfolios: Portfolio[] = user?.portfolios || [
    createMockPortfolio('1', 'Creative Portfolio', 'johndoe', 'active'),
    createMockPortfolio('2', 'Photography Work', 'johndoe-photos', 'active'),
    createMockPortfolio('3', 'Design Projects', 'johndoe-design', 'inactive')
  ];

  return (
    <PageContainer>
      <Container>
        {/* Hero Section */}
        <HeroCard>
          <Heading1 $responsive>Settings Center</Heading1>
          <BodyText $size="lg" style={{ margin: '0 auto', maxWidth: '600px' }}>
            Manage all your account, dashboard, and portfolio settings in one centralized location
          </BodyText>
        </HeroCard>

        {/* Main Settings */}
        <SectionHeader>
          <Settings size={24} />
          <Heading2 style={{ margin: 0 }}>Main Settings</Heading2>
        </SectionHeader>
        
        <BodyText style={{ 
          marginLeft: '3rem', 
          marginTop: '-var(--spacing-lg)', 
          marginBottom: 'var(--spacing-xl)',
          color: 'var(--color-text-secondary)'
        }}>
          Access comprehensive settings for your account and dashboard experience
        </BodyText>

        <Grid $columns={2} $responsive $gap="var(--spacing-xl)" style={{ marginBottom: 'var(--spacing-3xl)' }}>
          {MAIN_SETTINGS.map((setting) => (
            <SettingsCard key={setting.id} href={setting.href} as={Link}>
              <FlexRow $justify="space-between" $align="flex-start" $gap="var(--spacing-lg)">
                <FlexColumn $gap="var(--spacing-md)" style={{ flex: 1 }}>
                  <Heading3 style={{ margin: 0 }}>{setting.title}</Heading3>
                  <BodyText style={{ margin: 0 }}>{setting.description}</BodyText>
                  <QuickLinksContainer>
                    {setting.quickLinks.map((link) => (
                      <QuickLink key={link}>{link}</QuickLink>
                    ))}
                  </QuickLinksContainer>
                </FlexColumn>
                <IconContainer $color={setting.color} $size="md">
                  <setting.icon size={28} />
                </IconContainer>
              </FlexRow>
            </SettingsCard>
          ))}
        </Grid>

        {/* Quick Settings */}
        <SectionHeader>
          <Gauge size={24} />
          <Heading2 style={{ margin: 0 }}>Quick Settings</Heading2>
        </SectionHeader>
        
        <BodyText style={{ 
          marginLeft: '3rem', 
          marginTop: '-var(--spacing-lg)', 
          marginBottom: 'var(--spacing-xl)',
          color: 'var(--color-text-secondary)'
        }}>
          Rapidly access your most frequently used settings
        </BodyText>

        <Grid $columns={3} $responsive $gap="var(--spacing-lg)" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          {QUICK_SETTINGS.map((setting) => (
            <QuickSettingCard key={setting.id}>
              <IconContainer $color={setting.color} $size="sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <setting.icon size={20} />
              </IconContainer>
              <Heading3 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: 'var(--font-size-sm)' }}>
                {setting.title}
              </Heading3>
              <BodyText style={{ margin: 0, fontSize: 'var(--font-size-xs)', lineHeight: 1.4 }}>
                {setting.description}
              </BodyText>
            </QuickSettingCard>
          ))}
        </Grid>

        {/* Portfolio Settings */}
        {userPortfolios.length > 0 && (
          <div>
            <SectionHeader>
              <Briefcase size={24} />
              <Heading2 style={{ margin: 0 }}>Portfolio Settings</Heading2>
            </SectionHeader>
            
            <BodyText style={{ 
              marginLeft: '3rem', 
              marginTop: '-var(--spacing-lg)', 
              marginBottom: 'var(--spacing-xl)',
              color: 'var(--color-text-secondary)'
            }}>
              Configure settings for each of your portfolios individually
            </BodyText>
            
            <Grid $minWidth="300px" $responsive>
              {userPortfolios.map((portfolio) => (
                <SettingsCard key={portfolio.id} href={`/portfolio/${portfolio.username}/settings`} as={Link}>
                  <PortfolioInfo>
                    <FlexColumn $gap="var(--spacing-xs)" style={{ flex: 1 }}>
                      <Heading3 style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>
                        {portfolio.name || portfolio.title}
                      </Heading3>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-text-secondary)' 
                      }}>
                        @{portfolio.username}
                      </div>
                      <StatusBadge $status={portfolio.status}>
                        {portfolio.status}
                      </StatusBadge>
                    </FlexColumn>
                    <div style={{ 
                      color: 'var(--color-text-secondary)', 
                      transition: 'var(--transition-fast)' 
                    }}>
                      <ChevronRight size={20} />
                    </div>
                  </PortfolioInfo>
                </SettingsCard>
              ))}
            </Grid>
          </div>
        )}
      </Container>
    </PageContainer>
  );
}