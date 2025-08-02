// src/components/profile/utils/overview.tsx - Professional design
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  ExternalLink, Edit3, Globe, Lock, Eye, TrendingUp, Users,
  Share2, Copy, CheckCircle, Settings, ArrowUpRight,
  Brush, GraduationCap, Code, Layers
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';

interface OverviewProps {
  portfolio: Portfolio;
  stats: {
    gallery?: { totalPieces: number; totalViews: number; totalLikes: number; recentUploads: number; };
    learning?: { totalConcepts: number; completed: number; inProgress: number; weeklyStreak: number; averageScore: number; };
    analytics: { weeklyGrowth: number; monthlyViews: number; engagementRate: number; };
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
          capabilities: ['Gallery Management', 'Visual Showcase', 'Client Presentations']
        };
      case 'educational':
        return {
          icon: <GraduationCap size={24} />,
          title: 'Educational Portfolio',
          capabilities: ['Learning Progress', 'Concept Mastery', 'Achievement Tracking']
        };
      case 'professional':
        return {
          icon: <Code size={24} />,
          title: 'Professional Portfolio',
          capabilities: ['Project Showcase', 'Technical Skills', 'Career Timeline']
        };
      case 'hybrid':
        return {
          icon: <Layers size={24} />,
          title: 'Hybrid Portfolio',
          capabilities: ['Multi-discipline Showcase', 'Comprehensive Portfolio', 'All Features Unlocked']
        };
      default:
        return {
          icon: <Layers size={24} />,
          title: 'Portfolio',
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
      <HeroSection>
        <HeroContent>
          <PortfolioHeader>
            <PortfolioIcon>
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
            <ActionIcon>
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
            <ActionIcon>
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
            <ActionIcon>
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
            <ActionIcon>
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
              <CheckCircle size={16} />
              <span>{capability}</span>
            </CapabilityItem>
          ))}
        </CapabilitiesList>
        
        {portfolio.kind !== 'hybrid' && onUpgradeClick && (
          <UpgradePrompt>
            <UpgradeIcon>
              <Layers size={20} />
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

// Professional Styled Components
const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeroSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

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
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  border-radius: 16px;
  color: white;
`;

const PortfolioInfo = styled.div`
  flex: 1;
`;

const PortfolioTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 400;
  margin: 0 0 0.5rem 0;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PortfolioType = styled.div`
  font-size: 1.125rem;
  color: #666666;
  margin-bottom: 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const PortfolioTagline = styled.p`
  font-size: 1rem;
  color: #666666;
  margin: 0;
  line-height: 1.5;
  font-family: 'Work Sans', sans-serif;
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
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(44, 44, 44, 0.3);
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #2c2c2c;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    background: #f8f9fa;
    border-color: #2c2c2c;
  }
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #2c2c2c;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    background: #f8f9fa;
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  margin-bottom: 0.5rem;
  color: #666666;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-family: 'Work Sans', sans-serif;
`;

const QuickActionsSection = styled.section`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 1.5rem 0;
  font-family: 'Work Sans', sans-serif;
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
  background: rgba(255, 255, 255, 0.8);

  &:hover {
    border-color: #2c2c2c;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(44, 44, 44, 0.1);
  color: #2c2c2c;
  border-radius: 12px;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0 0 0.5rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const ActionMeta = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Work Sans', sans-serif;
`;

const ActionArrow = styled.div`
  color: #666666;
  transition: all 0.2s;

  ${QuickActionCard}:hover & {
    color: #2c2c2c;
    transform: translateX(2px);
  }
`;

const CapabilitiesSection = styled.section`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
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
  font-family: 'Work Sans', sans-serif;
  
  svg {
    color: #666666;
    flex-shrink: 0;
  }
`;

const UpgradePrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(44, 44, 44, 0.05);
  border: 1px solid rgba(44, 44, 44, 0.1);
  border-radius: 12px;
`;

const UpgradeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #2c2c2c;
  color: white;
  border-radius: 50%;
`;

const UpgradeContent = styled.div`
  flex: 1;
`;

const UpgradeTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.25rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeButton = styled.button`
  background: #2c2c2c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    background: #1a1a1a;
  }
`;

const UrlSection = styled.section`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
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
  background: ${props => props.$copied ? '#666666' : '#2c2c2c'};
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    background: ${props => props.$copied ? '#4b5563' : '#1a1a1a'};
  }
`;

const UrlHelp = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;