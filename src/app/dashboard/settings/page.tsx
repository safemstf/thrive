// src/app/settings/page.tsx - Central Settings Hub (FIXED)
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
  Globe
} from 'lucide-react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { Portfolio } from '@/types/portfolio.types';

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
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: 3rem;
`;

const SettingsCard = styled(Link)`
  display: block;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$color};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const CardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.6;
`;

const QuickLinks = styled.div`
  margin-top: ${theme.spacing.sm};
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const QuickLink = styled.span`
  font-size: ${theme.typography.sizes.xs};
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
`;

const PortfolioSection = styled.div`
  margin-top: 3rem;
`;

const SectionHeader = styled.h2`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
`;

const PortfolioCard = styled(Link)`
  display: block;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const PortfolioName = styled.h4`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const PortfolioUsername = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

export default function SettingsHub() {
  const { user } = useAuth();
  const router = useRouter();

  const mainSettings = [
    {
      id: 'quick',
      title: 'Quick Settings',
      description: 'Access your most-used settings from the dashboard',
      icon: Gauge,
      color: '#3b82f6',
      href: '/dashboard/settings',
      quickLinks: ['Notifications', 'Theme', 'Language']
    },
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Comprehensive account management including security, billing, and profile',
      icon: User,
      color: '#10b981',
      href: '/settings/account',
      quickLinks: ['Profile', 'Security', 'Billing', 'Privacy']
    }
  ];

  // Create proper Portfolio objects that match the interface
  const createMockPortfolio = (id: string, name: string, username: string): Portfolio => ({
    id,
    userId: user?.id || 'user-1',
    username,
    name,
    title: name,
    bio: `This is ${name} portfolio`,
    kind: 'creative',
    visibility: 'public',
    status: 'active',
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
    createMockPortfolio('1', 'My Portfolio', 'johndoe'),
    createMockPortfolio('2', 'Photography', 'johndoe-photos')
  ];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>Settings Center</Title>
          <Subtitle>
            Manage all your account and portfolio settings in one place
          </Subtitle>
        </Header>

        <SettingsGrid>
          {mainSettings.map((setting) => (
            <SettingsCard key={setting.id} href={setting.href}>
              <CardHeader>
                <div style={{ flex: 1 }}>
                  <CardTitle>{setting.title}</CardTitle>
                  <CardDescription>{setting.description}</CardDescription>
                  <QuickLinks>
                    {setting.quickLinks.map((link) => (
                      <QuickLink key={link}>{link}</QuickLink>
                    ))}
                  </QuickLinks>
                </div>
                <CardIcon $color={setting.color}>
                  <setting.icon size={24} />
                </CardIcon>
              </CardHeader>
            </SettingsCard>
          ))}
        </SettingsGrid>

        {userPortfolios.length > 0 && (
          <PortfolioSection>
            <SectionHeader>
              <Briefcase size={24} />
              Portfolio Settings
            </SectionHeader>
            <PortfolioGrid>
              {userPortfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  href={`/portfolio/${portfolio.username}/settings`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <PortfolioName>{portfolio.name || portfolio.title}</PortfolioName>
                      <PortfolioUsername>@{portfolio.username}</PortfolioUsername>
                    </div>
                    <ChevronRight size={20} color="#9ca3af" />
                  </div>
                </PortfolioCard>
              ))}
            </PortfolioGrid>
          </PortfolioSection>
        )}
      </Container>
    </PageWrapper>
  );
}