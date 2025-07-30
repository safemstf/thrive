// src/components/profile/utils/overview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  ExternalLink, 
  Edit3, 
  Globe, 
  Lock, 
  Eye, 
  TrendingUp, 
  Calendar,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Copy,
  CheckCircle,
  BarChart3,
  Target,
  Award,
  Zap,
  Star,
  ArrowUpRight,
  Download,
  Settings,
  Brush,
  GraduationCap,
  Code,
  Layers
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';

interface OverviewProps {
  portfolio: Portfolio;
  stats: {
    gallery?: {
      totalPieces: number;
      totalViews: number;
      totalLikes: number;
      recentUploads: number;
    };
    learning?: {
      totalConcepts: number;
      completed: number;
      inProgress: number;
      weeklyStreak: number;
      averageScore: number;
    };
    analytics: {
      weeklyGrowth: number;
      monthlyViews: number;
      engagementRate: number;
    };
  };
  onEditClick: () => void;
  onUpgradeClick?: () => void;
}

export function PortfolioOverview({ portfolio, stats, onEditClick, onUpgradeClick }: OverviewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    setPortfolioUrl(`${window.location.origin}/portfolio/${portfolio.username}`);
  }, [portfolio.username]);

  const getPortfolioConfig = (type: PortfolioKind) => {
    switch (type) {
      case 'creative':
        return {
          icon: <Brush size={24} />,
          title: 'Creative Portfolio',
          color: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          capabilities: ['Gallery Management', 'Visual Showcase', 'Client Presentations']
        };
      case 'educational':
        return {
          icon: <GraduationCap size={24} />,
          title: 'Educational Portfolio',
          color: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          capabilities: ['Learning Progress', 'Concept Mastery', 'Achievement Tracking']
        };
      case 'professional':
        return {
          icon: <Code size={24} />,
          title: 'Professional Portfolio',
          color: '#059669',
          gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          capabilities: ['Project Showcase', 'Technical Skills', 'Career Timeline']
        };
      case 'hybrid':
        return {
          icon: <Layers size={24} />,
          title: 'Hybrid Portfolio',
          color: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
          capabilities: ['Multi-discipline Showcase', 'Comprehensive Portfolio', 'All Features Unlocked']
        };
      default:
        return {
          icon: <Layers size={24} />,
          title: 'Portfolio',
          color: '#6b7280',
          gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
          capabilities: ['Basic Portfolio']
        };
    }
  };

  const config = getPortfolioConfig(portfolio.kind);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleSharePortfolio = () => {
    if (navigator.share) {
      navigator.share({
        title: portfolio.title,
        text: portfolio.tagline || 'Check out my portfolio',
        url: portfolioUrl,
      });
    } else {
      handleCopyUrl();
    }
  };

  return (
    <OverviewContainer>
      {/* Hero Section */}
      <HeroSection $gradient={config.gradient}>
        <HeroContent>
          <PortfolioHeader>
            <PortfolioIcon style={{ color: 'white' }}>
              {config.icon}
            </PortfolioIcon>
            <PortfolioInfo>
              <PortfolioTitle>{portfolio.title}</PortfolioTitle>
              <PortfolioType>{config.title}</PortfolioType>
              {portfolio.tagline && (
                <PortfolioTagline>{portfolio.tagline}</PortfolioTagline>
              )}
            </PortfolioInfo>
          </PortfolioHeader>

          <ActionButtons>
            <PrimaryButton onClick={() => window.open(portfolioUrl, '_blank')}>
              <Globe size={16} />
              View Live Portfolio
              <ArrowUpRight size={14} />
            </PrimaryButton>
            <SecondaryButton onClick={onEditClick}>
              <Edit3 size={16} />
              Edit Portfolio
            </SecondaryButton>
            <ShareButton onClick={handleSharePortfolio}>
              {copied ? <CheckCircle size={16} /> : <Share2 size={16} />}
              {copied ? 'Copied!' : 'Share'}
            </ShareButton>
          </ActionButtons>
        </HeroContent>

        <HeroStats>
          <StatCard>
            <StatIcon><Eye size={20} /></StatIcon>
            <StatValue>{stats.analytics.monthlyViews.toLocaleString()}</StatValue>
            <StatLabel>Monthly Views</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><TrendingUp size={20} /></StatIcon>
            <StatValue>+{stats.analytics.weeklyGrowth}%</StatValue>
            <StatLabel>Weekly Growth</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><Users size={20} /></StatIcon>
            <StatValue>{stats.analytics.engagementRate}%</StatValue>
            <StatLabel>Engagement</StatLabel>
          </StatCard>
        </HeroStats>
      </HeroSection>

      {/* Quick Actions */}
      <QuickActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <QuickActionsGrid>
          <QuickActionCard onClick={() => router.push('/dashboard/gallery')}>
            <ActionIcon $color="#8b5cf6">
              <Brush size={20} />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Manage Gallery</ActionTitle>
              <ActionDescription>Upload and organize your creative work</ActionDescription>
              {stats.gallery && (
                <ActionMeta>{stats.gallery.totalPieces} pieces</ActionMeta>
              )}
            </ActionContent>
            <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
          </QuickActionCard>

          <QuickActionCard onClick={() => router.push('/dashboard/writing')}>
            <ActionIcon $color="#3b82f6">
              <GraduationCap size={20} />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Learning Progress</ActionTitle>
              <ActionDescription>Track your educational achievements</ActionDescription>
              {stats.learning && (
                <ActionMeta>{stats.learning.completed} concepts completed</ActionMeta>
              )}
            </ActionContent>
            <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
          </QuickActionCard>

          <QuickActionCard onClick={() => router.push('/dashboard/projects')}>
            <ActionIcon $color="#059669">
              <Code size={20} />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Tech Projects</ActionTitle>
              <ActionDescription>Showcase your development work</ActionDescription>
              <ActionMeta>Coming soon</ActionMeta>
            </ActionContent>
            <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
          </QuickActionCard>

          <QuickActionCard onClick={onEditClick}>
            <ActionIcon $color="#f59e0b">
              <Settings size={20} />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Portfolio Settings</ActionTitle>
              <ActionDescription>Customize your portfolio appearance</ActionDescription>
              <ActionMeta>Privacy: {portfolio.visibility}</ActionMeta>
            </ActionContent>
            <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
          </QuickActionCard>
        </QuickActionsGrid>
      </QuickActionsSection>

      {/* Portfolio Capabilities */}
      <CapabilitiesSection>
        <SectionTitle>Portfolio Capabilities</SectionTitle>
        <CapabilitiesList>
          {config.capabilities.map((capability, index) => (
            <CapabilityItem key={index}>
              <CheckCircle size={16} color="#10b981" />
              <span>{capability}</span>
            </CapabilityItem>
          ))}
        </CapabilitiesList>
        
        {portfolio.kind !== 'hybrid' && onUpgradeClick && (
          <UpgradePrompt>
            <UpgradeIcon>
              <Zap size={20} />
            </UpgradeIcon>
            <UpgradeContent>
              <UpgradeTitle>Unlock More Features</UpgradeTitle>
              <UpgradeDescription>
                Upgrade to a hybrid portfolio to access all creative, educational, and professional features.
              </UpgradeDescription>
            </UpgradeContent>
            <UpgradeButton onClick={onUpgradeClick}>
              Upgrade Portfolio
            </UpgradeButton>
          </UpgradePrompt>
        )}
      </CapabilitiesSection>

      {/* Portfolio URL Section */}
      <UrlSection>
        <SectionTitle>Portfolio URL</SectionTitle>
        <UrlContainer>
          <UrlInput value={portfolioUrl} readOnly />
          <CopyButton onClick={handleCopyUrl} $copied={copied}>
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </CopyButton>
        </UrlContainer>
        <UrlHelp>
          Share this link to showcase your portfolio to clients, employers, or collaborators.
        </UrlHelp>
      </UrlSection>
    </OverviewContainer>
  );
}

// Styled Components
const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeroSection = styled.div<{ $gradient: string }>`
  background: ${props => props.$gradient};
  border-radius: 20px;
  padding: 2.5rem;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const HeroContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const PortfolioHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
`;

const PortfolioIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const PortfolioInfo = styled.div`
  flex: 1;
`;

const PortfolioTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PortfolioType = styled.div`
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
`;

const PortfolioTagline = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatIcon = styled.div`
  margin-bottom: 0.5rem;
  opacity: 0.8;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

const QuickActionsSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1.5rem 0;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const QuickActionCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ActionIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  border-radius: 12px;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
`;

const ActionMeta = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ActionArrow = styled.div`
  color: #6b7280;
  transition: all 0.2s;

  ${QuickActionCard}:hover & {
    color: #3b82f6;
    transform: translateX(2px);
  }
`;

const CapabilitiesSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CapabilitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CapabilityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
`;

const UpgradePrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
`;

const UpgradeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f59e0b;
  color: white;
  border-radius: 50%;
`;

const UpgradeContent = styled.div`
  flex: 1;
`;

const UpgradeTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.25rem 0;
`;

const UpgradeDescription = styled.p`
  font-size: 0.875rem;
  color: #b45309;
  margin: 0;
`;

const UpgradeButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d97706;
  }
`;

const UrlSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const UrlContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
`;

const CopyButton = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.$copied ? '#10b981' : '#3b82f6'};
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$copied ? '#059669' : '#2563eb'};
  }
`;

const UrlHelp = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;