// src/components/dashboard/views/AnalyticsView.tsx - Improved Integration
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Eye, Users, TrendingUp, Clock, Activity,
  RefreshCw, Download, AlertCircle, Award, Sparkles,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import styled from 'styled-components';
import { theme } from '@/styles/styled-components';
import { themeUtils } from '@/utils';

interface AnalyticsStats {
  portfolioType?: string;
  totalItems?: number;
  recentActivity?: number;
  completionRate?: number;
  weeklyGrowth?: number;
  averageScore?: number;
  // Enhanced analytics fields
  totalViews?: number;
  uniqueVisitors?: number;
  engagementRate?: number;
  averageSessionTime?: string;
  monthlyGrowth?: number;
  trafficSources?: Array<{ source: string; percentage: number }>;
  contentPerformance?: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    shares: number;
    engagementRate: number;
  }>;
  createdAt?: Date;
  lastActivity?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  type: 'milestone' | 'growth' | 'performance' | 'content';
  icon: string;
}

interface AnalyticsViewProps {
  stats: AnalyticsStats | null;
  achievements: Achievement[];
  formatTimeAgo: (date: Date) => string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  stats, 
  achievements, 
  formatTimeAgo
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'growth'>('views');

  // Process and validate stats with fallbacks
  const processedStats = useMemo(() => {
    const defaultStats = {
      totalViews: 0,
      uniqueVisitors: 0,
      engagementRate: 0,
      averageSessionTime: '0:00',
      totalItems: 0,
      completionRate: 0,
      averageScore: 0,
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      trafficSources: [
        { source: 'Direct', percentage: 45 },
        { source: 'Social Media', percentage: 28 },
        { source: 'Search', percentage: 18 },
        { source: 'Referral', percentage: 9 }
      ],
      contentPerformance: []
    };

    return {
      ...defaultStats,
      ...stats,
      // Ensure we have valid numbers
      totalViews: stats?.totalViews || defaultStats.totalViews,
      uniqueVisitors: stats?.uniqueVisitors || defaultStats.uniqueVisitors,
      engagementRate: stats?.engagementRate || defaultStats.engagementRate,
      averageSessionTime: stats?.averageSessionTime || defaultStats.averageSessionTime,
      totalItems: stats?.totalItems || defaultStats.totalItems,
      completionRate: stats?.completionRate || defaultStats.completionRate,
      averageScore: stats?.averageScore || defaultStats.averageScore,
      weeklyGrowth: stats?.weeklyGrowth || defaultStats.weeklyGrowth,
      monthlyGrowth: stats?.monthlyGrowth || defaultStats.monthlyGrowth,
      trafficSources: stats?.trafficSources || defaultStats.trafficSources,
      contentPerformance: stats?.contentPerformance || defaultStats.contentPerformance
    };
  }, [stats]);

  // Growth indicator component
  const GrowthIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    const color = isNeutral ? '#6b7280' : isPositive ? '#10b981' : '#ef4444';
    const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;
    
    return (
      <GrowthBadge $color={color}>
        <Icon size={12} />
        {isPositive ? '+' : ''}{value}{suffix}
      </GrowthBadge>
    );
  };

  // Time range specific data
  const timeRangeData = useMemo(() => {
    const multiplier = timeRange === 'week' ? 0.25 : timeRange === 'month' ? 1 : 12;
    return {
      views: Math.floor(processedStats.totalViews * multiplier),
      visitors: Math.floor(processedStats.uniqueVisitors * multiplier),
      growth: timeRange === 'week' ? processedStats.weeklyGrowth : 
              timeRange === 'month' ? processedStats.monthlyGrowth :
              processedStats.monthlyGrowth * 8 // Rough yearly estimate
    };
  }, [processedStats, timeRange]);

  console.log('🔍 Enhanced Analytics Debug:', {
    originalStats: stats,
    processedStats,
    achievements: achievements?.length || 0,
    timeRange,
    timeRangeData
  });

  return (
    <AnalyticsContainer>
      {/* Header with controls */}
      <AnalyticsHeader>
        <HeaderContent>
          <Title>Portfolio Analytics</Title>
          <Subtitle>
            {stats ? `Insights for your ${processedStats.portfolioType || 'portfolio'}` : 'Demo analytics data'}
          </Subtitle>
        </HeaderContent>
        
        <HeaderControls>
          <TimeRangeSelector>
            {(['week', 'month', 'year'] as const).map((range) => (
              <TimeButton
                key={range}
                $active={timeRange === range}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </TimeButton>
            ))}
          </TimeRangeSelector>
          
          <MetricSelector>
            {(['views', 'engagement', 'growth'] as const).map((metric) => (
              <MetricButton
                key={metric}
                $active={selectedMetric === metric}
                onClick={() => setSelectedMetric(metric)}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </MetricButton>
            ))}
          </MetricSelector>
        </HeaderControls>
      </AnalyticsHeader>

      {/* Key Metrics Grid */}
      <MetricsGrid>
        <MetricCard>
          <MetricIcon $color="#3b82f6"><Eye size={24} /></MetricIcon>
          <MetricContent>
            <MetricValue>{timeRangeData.views.toLocaleString()}</MetricValue>
            <MetricLabel>Total Views</MetricLabel>
            <GrowthIndicator value={timeRangeData.growth} />
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon $color="#10b981"><Users size={24} /></MetricIcon>
          <MetricContent>
            <MetricValue>{timeRangeData.visitors.toLocaleString()}</MetricValue>
            <MetricLabel>Unique Visitors</MetricLabel>
            <GrowthIndicator value={Math.floor(timeRangeData.growth * 0.8)} />
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon $color="#8b5cf6"><TrendingUp size={24} /></MetricIcon>
          <MetricContent>
            <MetricValue>{processedStats.engagementRate}%</MetricValue>
            <MetricLabel>Engagement Rate</MetricLabel>
            <GrowthIndicator value={Math.floor(processedStats.engagementRate - 75)} />
          </MetricContent>
        </MetricCard>

        <MetricCard>
          <MetricIcon $color="#f59e0b"><Clock size={24} /></MetricIcon>
          <MetricContent>
            <MetricValue>{processedStats.averageSessionTime}</MetricValue>
            <MetricLabel>Avg Session Time</MetricLabel>
            <GrowthIndicator value={15} suffix="s" />
          </MetricContent>
        </MetricCard>
      </MetricsGrid>

      {/* Content Grid */}
      <ContentGrid>
        {/* Performance Overview */}
        <ContentCard>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardSubtitle>Key metrics for the selected {timeRange}</CardSubtitle>
          </CardHeader>
          
          <PerformanceList>
            <PerformanceItem>
              <PerformanceLabel>Portfolio Items</PerformanceLabel>
              <PerformanceValue>{processedStats.totalItems}</PerformanceValue>
            </PerformanceItem>
            <PerformanceItem>
              <PerformanceLabel>Completion Rate</PerformanceLabel>
              <PerformanceValue>{processedStats.completionRate}%</PerformanceValue>
            </PerformanceItem>
            <PerformanceItem>
              <PerformanceLabel>Average Score</PerformanceLabel>
              <PerformanceValue>{processedStats.averageScore}%</PerformanceValue>
            </PerformanceItem>
            <PerformanceItem>
              <PerformanceLabel>Growth Rate</PerformanceLabel>
              <PerformanceValue>
                <GrowthIndicator value={timeRangeData.growth} />
              </PerformanceValue>
            </PerformanceItem>
          </PerformanceList>
        </ContentCard>

        {/* Traffic Sources */}
        <ContentCard>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardSubtitle>Where your visitors come from</CardSubtitle>
          </CardHeader>
          
          <TrafficList>
            {processedStats.trafficSources.map((item) => (
              <TrafficItem key={item.source}>
                <TrafficInfo>
                  <TrafficSource>{item.source}</TrafficSource>
                  <TrafficPercentage>{item.percentage}%</TrafficPercentage>
                </TrafficInfo>
                <ProgressBar>
                  <ProgressFill $percentage={item.percentage} />
                </ProgressBar>
              </TrafficItem>
            ))}
          </TrafficList>
        </ContentCard>

        {/* Recent Achievements */}
        <ContentCard>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardSubtitle>
              {achievements.length > 0 ? `${achievements.length} milestones unlocked` : 'Demo achievements'}
            </CardSubtitle>
          </CardHeader>
          
          <AchievementsList>
            {(achievements.length > 0 ? achievements : [
              {
                id: '1',
                title: 'Portfolio Created',
                description: 'Successfully set up your portfolio',
                unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                type: 'milestone' as const,
                icon: '🎯'
              },
              {
                id: '2',
                title: 'First Views',
                description: 'Your portfolio received its first views',
                unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                type: 'growth' as const,
                icon: '👁️'
              },
              {
                id: '3',
                title: 'High Engagement',
                description: 'Achieved excellent engagement metrics',
                unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                type: 'performance' as const,
                icon: '📈'
              }
            ]).slice(0, 5).map((achievement) => (
              <AchievementItem key={achievement.id}>
                <AchievementIcon>{achievement.icon}</AchievementIcon>
                <AchievementContent>
                  <AchievementTitle>{achievement.title}</AchievementTitle>
                  <AchievementDescription>{achievement.description}</AchievementDescription>
                  <AchievementTime>
                    {achievement.unlockedAt ? 
                      formatTimeAgo(achievement.unlockedAt) : 
                      'Recently'
                    }
                  </AchievementTime>
                </AchievementContent>
                <AchievementBadge $type={achievement.type}>
                  {achievement.type}
                </AchievementBadge>
              </AchievementItem>
            ))}
          </AchievementsList>
        </ContentCard>

        {/* Content Performance */}
        {processedStats.contentPerformance.length > 0 && (
          <ContentCard>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardSubtitle>Your most engaging portfolio pieces</CardSubtitle>
            </CardHeader>
            
            <ContentPerformanceList>
              {processedStats.contentPerformance.slice(0, 5).map((content) => (
                <ContentPerformanceItem key={content.id}>
                  <ContentInfo>
                    <ContentTitle>{content.title}</ContentTitle>
                    <ContentStats>
                      {content.views} views • {content.likes} likes • {content.engagementRate}% engagement
                    </ContentStats>
                  </ContentInfo>
                  <ContentValue>{content.views}</ContentValue>
                </ContentPerformanceItem>
              ))}
            </ContentPerformanceList>
          </ContentCard>
        )}

        {/* Insights */}
        <ContentCard>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardSubtitle>AI-powered portfolio recommendations</CardSubtitle>
          </CardHeader>
          
          <InsightsList>
            <InsightItem>
              <InsightIcon><TrendingUp size={16} /></InsightIcon>
              <InsightContent>
                <InsightTitle>Growth Opportunity</InsightTitle>
                <InsightText>
                  Your portfolio has grown {timeRangeData.growth > 0 ? `${timeRangeData.growth}%` : 'steadily'} this {timeRange}. 
                  Consider adding more content to maintain momentum.
                </InsightText>
              </InsightContent>
            </InsightItem>

            <InsightItem>
              <InsightIcon><Users size={16} /></InsightIcon>
              <InsightContent>
                <InsightTitle>Audience Engagement</InsightTitle>
                <InsightText>
                  With {processedStats.engagementRate}% engagement rate, your content resonates well with visitors. 
                  Focus on similar content types for better results.
                </InsightText>
              </InsightContent>
            </InsightItem>

            <InsightItem>
              <InsightIcon><Activity size={16} /></InsightIcon>
              <InsightContent>
                <InsightTitle>Portfolio Health</InsightTitle>
                <InsightText>
                  Your {processedStats.completionRate}% completion rate shows good progress. 
                  Aim for regular updates to keep your portfolio fresh.
                </InsightText>
              </InsightContent>
            </InsightItem>
          </InsightsList>
        </ContentCard>
      </ContentGrid>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel>
          <DebugTitle>🔧 Debug Information</DebugTitle>
          <DebugGrid>
            <DebugItem>
              <strong>Stats Object:</strong>
              <pre>{JSON.stringify(stats, null, 2)}</pre>
            </DebugItem>
            <DebugItem>
              <strong>Achievements:</strong>
              <pre>{JSON.stringify(achievements.slice(0, 2), null, 2)}</pre>
            </DebugItem>
            <DebugItem>
              <strong>Processed Stats:</strong>
              <pre>{JSON.stringify(processedStats, null, 2)}</pre>
            </DebugItem>
          </DebugGrid>
        </DebugPanel>
      )}
    </AnalyticsContainer>
  );
};

// Styled Components
const AnalyticsContainer = styled.div`
  padding: 0;
  max-width: 100%;
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const TimeButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#374151'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#2563eb' : '#f3f4f6'};
  }
`;

const MetricSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const MetricButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#374151'};
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const MetricIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: ${props => props.$color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const GrowthBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
`;

const CardTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const PerformanceList = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
`;

const PerformanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PerformanceLabel = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const PerformanceValue = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const TrafficList = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
`;

const TrafficItem = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TrafficInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TrafficSource = styled.span`
  font-weight: 500;
  color: #374151;
`;

const TrafficPercentage = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
`;

const AchievementsList = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
`;

const AchievementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AchievementIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const AchievementContent = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const AchievementDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const AchievementTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const AchievementBadge = styled.div<{ $type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => {
    switch (props.$type) {
      case 'milestone': return '#ddd6fe';
      case 'growth': return '#dcfce7';
      case 'performance': return '#fef3c7';
      case 'content': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'milestone': return '#7c3aed';
      case 'growth': return '#16a34a';
      case 'performance': return '#d97706';
      case 'content': return '#2563eb';
      default: return '#6b7280';
    }
  }};
`;

const ContentPerformanceList = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
`;

const ContentPerformanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ContentInfo = styled.div`
  flex: 1;
`;

const ContentTitle = styled.div`
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ContentStats = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ContentValue = styled.div`
  font-weight: 600;
  color: #374151;
`;

const InsightsList = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
`;

const InsightItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InsightIcon = styled.div`
  color: #3b82f6;
  margin-top: 2px;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const InsightText = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;

const DebugPanel = styled.div`
  margin-top: 3rem;
  padding: 1.5rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
`;

const DebugTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #92400e;
`;

const DebugGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const DebugItem = styled.div`
  pre {
    background: white;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
  }
  
  strong {
    color: #92400e;
    font-size: 0.875rem;
  }
`;