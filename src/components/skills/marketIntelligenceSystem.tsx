// src/components/skills/marketIntelligenceSystem.tsx - Professional Version
'use client';

import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Users, Clock, 
  Activity, AlertCircle, Target, Award, Filter,
  ArrowUpRight, ArrowDownRight, Eye, DollarSign,
  Briefcase, ChevronRight, Info
} from 'lucide-react';

import styled from 'styled-components';

// Professional styled components
const SystemContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
`;

const SystemHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin: 0 0 2rem 0;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
`;

const NavButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#0f172a' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border: 1px solid ${props => props.$active ? '#0f172a' : 'transparent'};
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#1e293b' : '#f1f5f9'};
    color: ${props => props.$active ? 'white' : '#0f172a'};
  }
`;

const ContentArea = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const MarketCard = styled.div<{ $highlight?: boolean }>`
  background: white;
  border: 1px solid ${props => props.$highlight ? '#dbeafe' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  ${props => props.$highlight && `
    background: #f0f9ff;
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const MarketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const MarketInfo = styled.div`
  flex: 1;
`;

const MarketName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
`;

const MarketCategory = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const TrendIndicator = styled.div<{ $trend: 'up' | 'down' | 'stable' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  
  ${props => {
    switch (props.$trend) {
      case 'up':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'down':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
`;

const MetricBox = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.$primary ? `
    background: #0f172a;
    color: white;
    border: 1px solid #0f172a;
    
    &:hover {
      background: #1e293b;
    }
  ` : `
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
    }
  `}
`;

const InsightPanel = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
`;

const InsightTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const InsightContent = styled.p`
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
`;

const CompetitorCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CompetitorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CompetitorName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const CompetitorRank = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
`;

const CompetitorStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

// Types for the professional system
interface SkillMarket {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  demandScore: number;
  supply: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  opportunities: number;
  averageSalary: number;
  growthRate: number;
}

interface MarketCompetitor {
  id: string;
  name: string;
  rank: number;
  marketShare: number;
  revenue: number;
  skillMatch: number;
}

interface MarketOpportunity {
  id: string;
  title: string;
  company: string;
  salary: string;
  requiredSkills: string[];
  matchScore: number;
  deadline: string;
}

const MarketIntelligenceSystem = () => {
  const [activeView, setActiveView] = useState<'market' | 'opportunities' | 'competitors' | 'insights'>('market');
  
  const [skillMarkets] = useState<SkillMarket[]>([
    {
      id: '1',
      name: 'React & Frontend Development',
      category: 'Technical',
      currentValue: 125000,
      demandScore: 92,
      supply: 23400,
      trend: 'up',
      changePercent: 23.5,
      opportunities: 847,
      averageSalary: 135000,
      growthRate: 18.2
    },
    {
      id: '2',
      name: 'Strategic Brand Management',
      category: 'Business',
      currentValue: 98000,
      demandScore: 87,
      supply: 15600,
      trend: 'stable',
      changePercent: 8.2,
      opportunities: 423,
      averageSalary: 105000,
      growthRate: 12.5
    },
    {
      id: '3',
      name: 'Data Analytics & Business Intelligence',
      category: 'Analytics',
      currentValue: 145000,
      demandScore: 95,
      supply: 8900,
      trend: 'up',
      changePercent: 31.2,
      opportunities: 1243,
      averageSalary: 155000,
      growthRate: 28.7
    },
    {
      id: '4',
      name: 'UX Research & Design',
      category: 'Design',
      currentValue: 115000,
      demandScore: 78,
      supply: 29800,
      trend: 'down',
      changePercent: -5.3,
      opportunities: 567,
      averageSalary: 120000,
      growthRate: 8.9
    }
  ]);

  const [competitors] = useState<MarketCompetitor[]>([
    {
      id: '1',
      name: 'TechCorp Solutions',
      rank: 1,
      marketShare: 24.5,
      revenue: 4500000,
      skillMatch: 87
    },
    {
      id: '2',
      name: 'Digital Innovations Inc',
      rank: 2,
      marketShare: 18.3,
      revenue: 3200000,
      skillMatch: 92
    },
    {
      id: '3',
      name: 'NextGen Analytics',
      rank: 3,
      marketShare: 15.7,
      revenue: 2800000,
      skillMatch: 78
    }
  ]);

  const [opportunities] = useState<MarketOpportunity[]>([
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'Tech Innovations Inc',
      salary: '$130k - $160k',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
      matchScore: 92,
      deadline: '5 days'
    },
    {
      id: '2',
      title: 'Data Analytics Manager',
      company: 'Global Analytics Corp',
      salary: '$140k - $180k',
      requiredSkills: ['Python', 'SQL', 'Tableau', 'Leadership'],
      matchScore: 85,
      deadline: '1 week'
    },
    {
      id: '3',
      title: 'Brand Strategy Director',
      company: 'Creative Brands Ltd',
      salary: '$120k - $150k',
      requiredSkills: ['Brand Management', 'Marketing', 'Strategy', 'Team Leadership'],
      matchScore: 78,
      deadline: '2 weeks'
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight size={16} />;
      case 'down': return <ArrowDownRight size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <SystemContainer>
      <SystemHeader>
        <HeaderContent>
          <Title>
            <BarChart3 size={32} />
            Market Intelligence Platform
          </Title>
          <Subtitle>
            Real-time market analysis, competitive insights, and career opportunities
          </Subtitle>
          
          <NavigationTabs>
            <NavButton 
              $active={activeView === 'market'} 
              onClick={() => setActiveView('market')}
            >
              <TrendingUp size={16} />
              Market Analysis
            </NavButton>
            <NavButton 
              $active={activeView === 'opportunities'} 
              onClick={() => setActiveView('opportunities')}
            >
              <Briefcase size={16} />
              Opportunities
            </NavButton>
            <NavButton 
              $active={activeView === 'competitors'} 
              onClick={() => setActiveView('competitors')}
            >
              <Users size={16} />
              Competitors
            </NavButton>
            <NavButton 
              $active={activeView === 'insights'} 
              onClick={() => setActiveView('insights')}
            >
              <AlertCircle size={16} />
              Insights
            </NavButton>
          </NavigationTabs>
        </HeaderContent>
      </SystemHeader>

      <ContentArea>
        {/* Market Analysis View */}
        {activeView === 'market' && (
          <>
            <InsightPanel>
              <InsightHeader>
                <InsightIcon>
                  <AlertCircle size={20} />
                </InsightIcon>
                <InsightTitle>Market Intelligence Summary</InsightTitle>
              </InsightHeader>
              <InsightContent>
                Data Analytics skills are experiencing 31.2% growth with high demand-to-supply ratio. 
                Frontend development remains strong with 847 active opportunities. Consider upskilling 
                in high-growth areas to maximize career potential.
              </InsightContent>
            </InsightPanel>

            {skillMarkets.map(market => (
              <MarketCard key={market.id} $highlight={market.demandScore > 90}>
                <MarketHeader>
                  <MarketInfo>
                    <MarketName>{market.name}</MarketName>
                    <MarketCategory>{market.category}</MarketCategory>
                  </MarketInfo>
                  <TrendIndicator $trend={market.trend}>
                    {getTrendIcon(market.trend)}
                    {market.changePercent > 0 ? '+' : ''}{market.changePercent}%
                  </TrendIndicator>
                </MarketHeader>

                <MetricsGrid>
                  <MetricBox>
                    <MetricValue>${(market.currentValue / 1000).toFixed(0)}k</MetricValue>
                    <MetricLabel>Avg Salary</MetricLabel>
                  </MetricBox>
                  <MetricBox>
                    <MetricValue>{market.demandScore}%</MetricValue>
                    <MetricLabel>Demand</MetricLabel>
                  </MetricBox>
                  <MetricBox>
                    <MetricValue>{market.opportunities}</MetricValue>
                    <MetricLabel>Open Roles</MetricLabel>
                  </MetricBox>
                  <MetricBox>
                    <MetricValue>{market.growthRate}%</MetricValue>
                    <MetricLabel>Growth Rate</MetricLabel>
                  </MetricBox>
                </MetricsGrid>

                <ActionBar>
                  <ActionButton $primary>
                    <Eye size={16} />
                    View Details
                  </ActionButton>
                  <ActionButton>
                    <Target size={16} />
                    Track Skill
                  </ActionButton>
                  <ActionButton>
                    <ChevronRight size={16} />
                    Opportunities
                  </ActionButton>
                </ActionBar>
              </MarketCard>
            ))}
          </>
        )}

        {/* Opportunities View */}
        {activeView === 'opportunities' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {opportunities.map(opp => (
              <CompetitorCard key={opp.id}>
                <CompetitorHeader>
                  <div>
                    <CompetitorName>{opp.title}</CompetitorName>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                      {opp.company} • {opp.salary}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Match Score
                    </div>
                    <CompetitorRank>{opp.matchScore}%</CompetitorRank>
                  </div>
                </CompetitorHeader>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap',
                  margin: '1rem 0'
                }}>
                  {opp.requiredSkills.map((skill, idx) => (
                    <span key={idx} style={{
                      padding: '0.25rem 0.75rem',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      fontSize: '0.813rem',
                      color: '#475569'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <ActionBar>
                  <ActionButton $primary>
                    Apply Now
                  </ActionButton>
                  <ActionButton>
                    <Info size={16} />
                    More Info
                  </ActionButton>
                </ActionBar>
              </CompetitorCard>
            ))}
          </div>
        )}

        {/* Competitors View */}
        {activeView === 'competitors' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {competitors.map(comp => (
              <CompetitorCard key={comp.id}>
                <CompetitorHeader>
                  <div>
                    <CompetitorName>{comp.name}</CompetitorName>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                      Rank #{comp.rank} • {comp.marketShare}% market share
                    </p>
                  </div>
                  <Award size={24} color={comp.rank === 1 ? '#f59e0b' : '#94a3b8'} />
                </CompetitorHeader>

                <CompetitorStats>
                  <StatItem>
                    <StatValue>${(comp.revenue / 1000000).toFixed(1)}M</StatValue>
                    <StatLabel>Revenue</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{comp.marketShare}%</StatValue>
                    <StatLabel>Market Share</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{comp.skillMatch}%</StatValue>
                    <StatLabel>Skill Match</StatLabel>
                  </StatItem>
                </CompetitorStats>

                <ActionBar>
                  <ActionButton>
                    <BarChart3 size={16} />
                    Analyze
                  </ActionButton>
                  <ActionButton>
                    <Users size={16} />
                    Compare
                  </ActionButton>
                </ActionBar>
              </CompetitorCard>
            ))}
          </div>
        )}

        {/* Insights View */}
        {activeView === 'insights' && (
          <div>
            <InsightPanel>
              <InsightHeader>
                <InsightIcon>
                  <TrendingUp size={20} />
                </InsightIcon>
                <InsightTitle>Key Market Insights</InsightTitle>
              </InsightHeader>
              <InsightContent>
                Based on current market trends, professionals with combined technical and business 
                acumen are commanding 25% higher salaries. The convergence of data analytics and 
                strategic decision-making skills presents the highest growth opportunity.
              </InsightContent>
            </InsightPanel>

            <InsightPanel>
              <InsightHeader>
                <InsightIcon>
                  <Target size={20} />
                </InsightIcon>
                <InsightTitle>Recommended Actions</InsightTitle>
              </InsightHeader>
              <InsightContent>
                1. Focus on high-demand skills with low supply ratios for maximum leverage<br />
                2. Build a portfolio demonstrating practical application of trending technologies<br />
                3. Network within high-growth sectors showing 20%+ year-over-year expansion
              </InsightContent>
            </InsightPanel>
          </div>
        )}
      </ContentArea>
    </SystemContainer>
  );
};

export default MarketIntelligenceSystem;