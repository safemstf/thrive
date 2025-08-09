// src/app/settings/page.tsx - Enhanced Settings Hub
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/authProvider';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Briefcase,
  User,
  Gauge,
  ChevronRight,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Globe,
  Lock,
  Eye,
  Mail,
  Smartphone,
  Database,
  HelpCircle,
  LogOut
} from 'lucide-react';
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';
import { Portfolio, PortfolioStatus as PortfolioStatusType } from '@/types/portfolio.types';

// Enhanced page wrapper with glassmorphism
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.primary[100]} 100%);
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
  font-family: ${theme.typography.fonts.primary};
  color: ${theme.colors.text.primary};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(44, 44, 44, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.lg} ${theme.spacing.md};
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

// Enhanced header with glassmorphism
const Header = styled.div`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['3xl']} ${theme.spacing['2xl']};
  margin-bottom: ${theme.spacing['2xl']};
  text-align: center;
  border: 1px solid ${theme.colors.border.glass};
  backdrop-filter: blur(${theme.glass.blur});
  
  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
  }
`;

const Title = styled.h1`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes['4xl']};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.md} 0;
  letter-spacing: ${theme.typography.letterSpacing.tight};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes['3xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.text.secondary};
  margin: 0;
  font-weight: ${theme.typography.weights.light};
  line-height: ${theme.typography.lineHeights.relaxed};
  max-width: 600px;
  margin: 0 auto;
`;

// Enhanced grid layouts
const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing['3xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

const QuickSettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

// Enhanced setting cards
const SettingsCard = styled(Link)`
  display: block;
  ${themeUtils.glass(0.95)}
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['2xl']};
  text-decoration: none;
  transition: ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  ${themeUtils.hoverLift}

  &:hover {
    border-color: ${theme.colors.primary[600]};
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-4px);
    
    .card-icon {
      transform: scale(1.1);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
  gap: ${theme.spacing.lg};
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, ${props => props.$color}, ${props => themeUtils.alpha(props.$color, 0.8)});
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: ${theme.transitions.normal};
  box-shadow: ${theme.shadows.md};
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.primary};
`;

const CardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

const QuickLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const QuickLink = styled.span`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.primary[600]};
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-weight: ${theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  border: 1px solid ${themeUtils.alpha(theme.colors.primary[600], 0.2)};
`;

// Section headers
const SectionHeader = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xl} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-family: ${theme.typography.fonts.primary};
`;

const SectionDescription = styled.p`
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text.secondary};
  margin: -${theme.spacing.lg} 0 ${theme.spacing.xl} 0;
  padding-left: calc(24px + ${theme.spacing.md});
`;

// Quick settings cards
const QuickSettingCard = styled.div`
  ${themeUtils.glass(0.8)}
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  transition: ${theme.transitions.fast};
  cursor: pointer;
  
  &:hover {
    background: ${themeUtils.alpha(theme.colors.background.secondary, 0.9)};
    border-color: ${theme.colors.primary[600]};
    transform: translateY(-2px);
  }
`;

const QuickSettingIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  background: ${props => themeUtils.alpha(props.$color, 0.1)};
  border: 1px solid ${props => themeUtils.alpha(props.$color, 0.2)};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  margin-bottom: ${theme.spacing.sm};
`;

const QuickSettingTitle = styled.h4`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const QuickSettingDescription = styled.p`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeights.normal};
`;

// Portfolio section
const PortfolioSection = styled.div`
  margin-top: ${theme.spacing['3xl']};
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const PortfolioCard = styled(Link)`
  display: block;
  ${themeUtils.glass(0.9)}
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  text-decoration: none;
  transition: ${theme.transitions.normal};
  ${themeUtils.hoverLift}

  &:hover {
    border-color: ${theme.colors.primary[600]};
    box-shadow: ${theme.shadows.md};
  }
`;

const PortfolioInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

const PortfolioDetails = styled.div`
  flex: 1;
`;

const PortfolioName = styled.h4`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  font-size: ${theme.typography.sizes.base};
`;

const PortfolioUsername = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const PortfolioStatus = styled.span<{ $status: PortfolioStatusType }>`
  font-size: ${theme.typography.sizes.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  
  ${props => {
    switch (props.$status) {
      case 'active':
        return `
          background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
          color: ${theme.colors.primary[600]};
          border: 1px solid ${themeUtils.alpha(theme.colors.primary[600], 0.2)};
        `;
      case 'inactive':
        return `
          background: ${themeUtils.alpha(theme.colors.primary[400], 0.1)};
          color: ${theme.colors.primary[400]};
          border: 1px solid ${themeUtils.alpha(theme.colors.primary[400], 0.2)};
        `;
      case 'suspended':
        return `
          background: ${themeUtils.alpha(theme.colors.text.tertiary, 0.1)};
          color: ${theme.colors.text.tertiary};
          border: 1px solid ${themeUtils.alpha(theme.colors.text.tertiary, 0.2)};
        `;
      default:
        return `
          background: ${themeUtils.alpha(theme.colors.text.tertiary, 0.1)};
          color: ${theme.colors.text.tertiary};
          border: 1px solid ${themeUtils.alpha(theme.colors.text.tertiary, 0.2)};
        `;
    }
  }}
`;

const ChevronIcon = styled.div`
  color: ${theme.colors.text.tertiary};
  transition: ${theme.transitions.fast};
  
  ${PortfolioCard}:hover & {
    color: ${theme.colors.primary[600]};
    transform: translateX(4px);
  }
`;

export default function SettingsHub() {
  const { user } = useAuth();
  const router = useRouter();

  const mainSettings = [
    {
      id: 'account',
      title: 'Account Management',
      description: 'Comprehensive account settings including profile, security, billing, and privacy controls',
      icon: User,
      color: theme.colors.primary[600],
      href: '/settings/account',
      quickLinks: ['Profile', 'Security', 'Billing', 'Privacy', 'Data Export']
    },
    {
      id: 'dashboard',
      title: 'Dashboard Settings',
      description: 'Customize your dashboard experience with personalized layouts, notifications, and quick access tools',
      icon: Gauge,
      color: theme.colors.primary[500],
      href: '/dashboard/settings',
      quickLinks: ['Layout', 'Notifications', 'Theme', 'Language', 'Shortcuts']
    }
  ];

  const quickSettings = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage email and push notifications',
      icon: Bell,
      color: theme.colors.primary[600]
    },
    {
      id: 'privacy',
      title: 'Privacy',
      description: 'Control your data and visibility',
      icon: Shield,
      color: theme.colors.primary[700]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize theme and display',
      icon: Palette,
      color: theme.colors.primary[500]
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password and 2FA settings',
      icon: Lock,
      color: theme.colors.primary[800]
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Manage subscription and payments',
      icon: CreditCard,
      color: theme.colors.primary[400]
    },
    {
      id: 'data',
      title: 'Data & Storage',
      description: 'Export and manage your data',
      icon: Database,
      color: theme.colors.primary[300]
    }
  ];

  // Create proper Portfolio objects that match the interface
  const createMockPortfolio = (id: string, name: string, username: string, status: PortfolioStatusType = 'active'): Portfolio => ({
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

  // Use actual portfolios from user context or create type-safe mock data
  const userPortfolios: Portfolio[] = user?.portfolios || [
    createMockPortfolio('1', 'Creative Portfolio', 'johndoe', 'active'),
    createMockPortfolio('2', 'Photography Work', 'johndoe-photos', 'active'),
    createMockPortfolio('3', 'Design Projects', 'johndoe-design', 'inactive')
  ];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>Settings Center</Title>
          <Subtitle>
            Manage all your account, dashboard, and portfolio settings in one centralized location
          </Subtitle>
        </Header>

        {/* Main Settings */}
        <SectionHeader>
          <Settings size={24} />
          Main Settings
        </SectionHeader>
        <SectionDescription>
          Access comprehensive settings for your account and dashboard experience
        </SectionDescription>

        <SettingsGrid>
          {mainSettings.map((setting) => (
            <SettingsCard key={setting.id} href={setting.href}>
              <CardHeader>
                <CardContent>
                  <CardTitle>{setting.title}</CardTitle>
                  <CardDescription>{setting.description}</CardDescription>
                  <QuickLinks>
                    {setting.quickLinks.map((link) => (
                      <QuickLink key={link}>{link}</QuickLink>
                    ))}
                  </QuickLinks>
                </CardContent>
                <CardIcon $color={setting.color} className="card-icon">
                  <setting.icon size={28} />
                </CardIcon>
              </CardHeader>
            </SettingsCard>
          ))}
        </SettingsGrid>

        {/* Quick Settings */}
        <SectionHeader>
          <Gauge size={24} />
          Quick Settings
        </SectionHeader>
        <SectionDescription>
          Rapidly access your most frequently used settings
        </SectionDescription>

        <QuickSettingsGrid>
          {quickSettings.map((setting) => (
            <QuickSettingCard key={setting.id}>
              <QuickSettingIcon $color={setting.color}>
                <setting.icon size={20} />
              </QuickSettingIcon>
              <QuickSettingTitle>{setting.title}</QuickSettingTitle>
              <QuickSettingDescription>{setting.description}</QuickSettingDescription>
            </QuickSettingCard>
          ))}
        </QuickSettingsGrid>

        {/* Portfolio Settings */}
        {userPortfolios.length > 0 && (
          <PortfolioSection>
            <SectionHeader>
              <Briefcase size={24} />
              Portfolio Settings
            </SectionHeader>
            <SectionDescription>
              Configure settings for each of your portfolios individually
            </SectionDescription>
            
            <PortfolioGrid>
              {userPortfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  href={`/portfolio/${portfolio.username}/settings`}
                >
                  <PortfolioInfo>
                    <PortfolioDetails>
                      <PortfolioName>{portfolio.name || portfolio.title}</PortfolioName>
                      <PortfolioUsername>@{portfolio.username}</PortfolioUsername>
                      <PortfolioStatus $status={portfolio.status}>
                        {portfolio.status}
                      </PortfolioStatus>
                    </PortfolioDetails>
                    <ChevronIcon>
                      <ChevronRight size={20} />
                    </ChevronIcon>
                  </PortfolioInfo>
                </PortfolioCard>
              ))}
            </PortfolioGrid>
          </PortfolioSection>
        )}
      </Container>
    </PageWrapper>
  );
}