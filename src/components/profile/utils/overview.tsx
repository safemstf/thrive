// src/components/profile/utils/overview.tsx - Improved spacing and content
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { 
  ExternalLink, Edit3, Globe, Eye, TrendingUp, Users,
  Share2, Copy, CheckCircle, Settings, ArrowUpRight,
  Brush, GraduationCap, Code, Layers, BookOpen, Images
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
      {/* Hero Section - Improved spacing */}
      <HeroSection>
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

        <ActionButtonsContainer>
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
        </ActionButtonsContainer>
      </HeroSection>

      {/* Content Overview - New focused stats */}
      <ContentOverviewSection>
        <SectionTitle>Portfolio Content Overview</SectionTitle>
        <ContentStatsGrid>
          {stats.gallery && (
            <ContentStatCard>
              <ContentStatIcon style={{ color: '#8b5cf6' }}>
                <Images size={24} />
              </ContentStatIcon>
              <ContentStatInfo>
                <ContentStatValue>{stats.gallery.totalPieces}</ContentStatValue>
                <ContentStatLabel>Gallery Pieces</ContentStatLabel>
                <ContentStatMeta>{stats.gallery.recentUploads} added recently</ContentStatMeta>
              </ContentStatInfo>
            </ContentStatCard>
          )}

          {stats.learning && (
            <ContentStatCard>
              <ContentStatIcon style={{ color: '#10b981' }}>
                <BookOpen size={24} />
              </ContentStatIcon>
              <ContentStatInfo>
                <ContentStatValue>{stats.learning.completed}/{stats.learning.totalConcepts}</ContentStatValue>
                <ContentStatLabel>Learning Progress</ContentStatLabel>
                <ContentStatMeta>{stats.learning.averageScore}% average score</ContentStatMeta>
              </ContentStatInfo>
            </ContentStatCard>
          )}

          <ContentStatCard>
            <ContentStatIcon style={{ color: '#3b82f6' }}>
              <TrendingUp size={24} />
            </ContentStatIcon>
            <ContentStatInfo>
              <ContentStatValue>+{stats.analytics.weeklyGrowth}%</ContentStatValue>
              <ContentStatLabel>Weekly Growth</ContentStatLabel>
              <ContentStatMeta>Audience engagement up</ContentStatMeta>
            </ContentStatInfo>
          </ContentStatCard>
        </ContentStatsGrid>
      </ContentOverviewSection>

      {/* Quick Actions - Improved */}
      <QuickActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <QuickActionsGrid>
          {(['creative', 'hybrid', 'professional'].includes(portfolio.kind)) && (
            <QuickActionCard onClick={() => router.push('/dashboard/gallery')}>
              <ActionIcon style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <Brush size={20} />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Manage Gallery</ActionTitle>
                <ActionDescription>Upload and organize your creative work</ActionDescription>
                {stats.gallery && (
                  <ActionMeta>{stats.gallery.totalPieces} pieces • {stats.gallery.totalLikes} likes</ActionMeta>
                )}
              </ActionContent>
              <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
            </QuickActionCard>
          )}

          {(['educational', 'hybrid'].includes(portfolio.kind)) && (
            <QuickActionCard onClick={() => router.push('/dashboard/writing')}>
              <ActionIcon style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <GraduationCap size={20} />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>Learning Hub</ActionTitle>
                <ActionDescription>Track your educational achievements</ActionDescription>
                {stats.learning && (
                  <ActionMeta>{stats.learning.completed} completed • {stats.learning.weeklyStreak} day streak</ActionMeta>
                )}
              </ActionContent>
              <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
            </QuickActionCard>
          )}

          <QuickActionCard onClick={() => router.push('/dashboard/analytics')}>
            <ActionIcon style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <TrendingUp size={20} />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Analytics Dashboard</ActionTitle>
              <ActionDescription>View detailed performance insights</ActionDescription>
              <ActionMeta>{stats.analytics.engagementRate}% engagement rate</ActionMeta>
            </ActionContent>
            <ActionArrow><ArrowUpRight size={16} /></ActionArrow>
          </QuickActionCard>

          <QuickActionCard onClick={onEditClick}>
            <ActionIcon style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
              <Settings size={20} />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Portfolio Settings</ActionTitle>
              <ActionDescription>Customize appearance and privacy</ActionDescription>
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
        <SectionTitle>Share Your Portfolio</SectionTitle>
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

// Improved Styled Components with better spacing
const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const HeroSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const PortfolioHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const PortfolioIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  border-radius: 18px;
  color: white;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
  }
`;

const PortfolioInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PortfolioTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 400;
  margin: 0 0 0.75rem 0;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
    margin-bottom: 0.5rem;
  }
`;

const PortfolioType = styled.div`
  font-size: 1.25rem;
  color: #666666;
  margin-bottom: 0.75rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
`;

const PortfolioTagline = styled.p`
  font-size: 1.125rem;
  color: #666666;
  margin: 0;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  color: white;
  border: none;
  padding: 1rem 1.75rem;
  border-radius: 10px;
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
  gap: 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #2c2c2c;
  padding: 1rem 1.75rem;
  border-radius: 10px;
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
  gap: 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  color: #2c2c2c;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    background: #f8f9fa;
  }
`;

const ContentOverviewSection = styled.section`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const ContentStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ContentStatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ContentStatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
`;

const ContentStatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContentStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
  font-family: 'Cormorant Garamond', serif;
`;

const ContentStatLabel = styled.div`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-family: 'Work Sans', sans-serif;
`;

const ContentStatMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  border-radius: 12px;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0 0 0.5rem 0;
  font-family: 'Work Sans', sans-serif;
  line-height: 1.4;
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
  font-family: 'Work Sans', sans-serif;`