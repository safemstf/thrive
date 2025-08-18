// src/components/dashboard/views/AnalyticsView.tsx - Fixed Integration
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Eye, Users, TrendingUp, Clock, Activity,
  RefreshCw, Download, AlertCircle, Award, Sparkles,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

// Use reusable styled components - no duplication!
import {
  ViewContainer,
  ViewStatsGrid,
  ViewStatCard,
  ViewStatIcon,
  ViewStatContent,
  ViewStatValue,
  ViewStatLabel,
  ViewGrid,
  ViewCard,
  ViewCardHeader,
  ViewCardContent,
  ViewCardTitle,
  ViewCardDescription,
  ViewTag,
  ViewActionGroup,
  ViewAction,
  ProgressContainer,
  ProgressBar,
  ProgressFill,
  ProgressText,
  Card,
  CardContent,
  FlexRow,
  FlexColumn,
  Heading2,
  Heading3,
  BaseButton,
  Badge,
  BodyText
} from '../dashboardStyles';

import styled from 'styled-components';

// Analytics-specific components only
const AnalyticsHeader = styled(Card).attrs({ $glass: true, $padding: 'lg' })`
  margin-bottom: 2rem;
`;

const HeaderControls = styled(FlexRow).attrs({ $gap: '1rem', $align: 'center' })`
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

interface AnalyticsStats {
  portfolioType?: string;
  totalItems?: number;
  recentActivity?: number;
  completionRate?: number;
  weeklyGrowth?: number;
  averageScore?: number;
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
              processedStats.monthlyGrowth * 8
    };
  }, [processedStats, timeRange]);

  return (
    <ViewContainer>
      {/* Header with controls */}
      <AnalyticsHeader>
        <FlexRow $justify="space-between" $align="flex-start" $gap="2rem">
          <FlexColumn>
            <Heading2>
              {stats ? `Insights for your ${processedStats.portfolioType || 'portfolio'}` : 'Demo analytics data'}
            </Heading2>
          </FlexColumn>
          
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
        </FlexRow>
      </AnalyticsHeader>

      {/* Key Metrics Grid */}
      <ViewStatsGrid>
        <ViewStatCard>
          <ViewStatIcon $color="#3b82f6">
            <Eye size={20} />
          </ViewStatIcon>
          <ViewStatContent>
            <ViewStatValue>{timeRangeData.views.toLocaleString()}</ViewStatValue>
            <ViewStatLabel>Total Views</ViewStatLabel>
            <GrowthIndicator value={timeRangeData.growth} />
          </ViewStatContent>
        </ViewStatCard>
        
        <ViewStatCard>
          <ViewStatIcon $color="#10b981">
            <Users size={20} />
          </ViewStatIcon>
          <ViewStatContent>
            <ViewStatValue>{timeRangeData.visitors.toLocaleString()}</ViewStatValue>
            <ViewStatLabel>Unique Visitors</ViewStatLabel>
            <GrowthIndicator value={Math.floor(timeRangeData.growth * 0.7)} />
          </ViewStatContent>
        </ViewStatCard>
        
        <ViewStatCard>
          <ViewStatIcon $color="#8b5cf6">
            <TrendingUp size={20} />
          </ViewStatIcon>
          <ViewStatContent>
            <ViewStatValue>{processedStats.engagementRate}%</ViewStatValue>
            <ViewStatLabel>Engagement Rate</ViewStatLabel>
            <GrowthIndicator value={Math.floor(Math.random() * 10) - 2} />
          </ViewStatContent>
        </ViewStatCard>
        
        <ViewStatCard>
          <ViewStatIcon $color="#f59e0b">
            <Clock size={20} />
          </ViewStatIcon>
          <ViewStatContent>
            <ViewStatValue>{processedStats.averageSessionTime}</ViewStatValue>
            <ViewStatLabel>Avg Session Time</ViewStatLabel>
            <GrowthIndicator value={Math.floor(Math.random() * 15)} suffix="s" />
          </ViewStatContent>
        </ViewStatCard>
      </ViewStatsGrid>

      {/* Content Grid */}
      <ViewGrid $minWidth="320px">
        {/* Performance Overview */}
        <ViewCard>
          <ViewCardHeader>
            <ViewCardTitle>Performance Overview</ViewCardTitle>
            <ViewCardDescription>Key metrics for the selected {timeRange}</ViewCardDescription>
          </ViewCardHeader>
          <ViewCardContent>
            <FlexColumn $gap="1rem">
              <FlexRow $justify="space-between">
                <span>Portfolio Items</span>
                <strong>{processedStats.totalItems}</strong>
              </FlexRow>
              <FlexRow $justify="space-between">
                <span>Completion Rate</span>
                <strong>{processedStats.completionRate}%</strong>
              </FlexRow>
              <FlexRow $justify="space-between">
                <span>Average Score</span>
                <strong>{processedStats.averageScore}%</strong>
              </FlexRow>
              <FlexRow $justify="space-between">
                <span>Growth Rate</span>
                <GrowthIndicator value={timeRangeData.growth} />
              </FlexRow>
            </FlexColumn>
          </ViewCardContent>
        </ViewCard>

        {/* Traffic Sources */}
        <ViewCard>
          <ViewCardHeader>
            <ViewCardTitle>Traffic Sources</ViewCardTitle>
            <ViewCardDescription>Where your visitors come from</ViewCardDescription>
          </ViewCardHeader>
          <ViewCardContent>
            <FlexColumn $gap="1rem">
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
            </FlexColumn>
          </ViewCardContent>
        </ViewCard>

        {/* Recent Achievements */}
        <ViewCard>
          <ViewCardHeader>
            <ViewCardTitle>Recent Achievements</ViewCardTitle>
            <ViewCardDescription>
              {achievements.length > 0 ? `${achievements.length} milestones unlocked` : 'Demo achievements'}
            </ViewCardDescription>
          </ViewCardHeader>
          <ViewCardContent>
            <FlexColumn>
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
            </FlexColumn>
          </ViewCardContent>
        </ViewCard>

        {/* Content Performance */}
        {processedStats.contentPerformance.length > 0 && (
          <ViewCard>
            <ViewCardHeader>
              <ViewCardTitle>Top Performing Content</ViewCardTitle>
              <ViewCardDescription>Your most engaging portfolio pieces</ViewCardDescription>
            </ViewCardHeader>
            <ViewCardContent>
              <FlexColumn>
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
              </FlexColumn>
            </ViewCardContent>
          </ViewCard>
        )}

        {/* Insights */}
        <ViewCard>
          <ViewCardHeader>
            <ViewCardTitle>Key Insights</ViewCardTitle>
            <ViewCardDescription>AI-powered portfolio recommendations</ViewCardDescription>
          </ViewCardHeader>
          <ViewCardContent>
            <FlexColumn>
              <InsightItem>
                <InsightIcon>
                  <TrendingUp size={16} />
                </InsightIcon>
                <InsightContent>
                  <InsightTitle>Growth Opportunity</InsightTitle>
                  <InsightText>
                    Your portfolio has grown {timeRangeData.growth > 0 ? `${timeRangeData.growth}%` : 'steadily'} this {timeRange}. 
                    Consider adding more content to maintain momentum.
                  </InsightText>
                </InsightContent>
              </InsightItem>
              
              <InsightItem>
                <InsightIcon>
                  <Users size={16} />
                </InsightIcon>
                <InsightContent>
                  <InsightTitle>Audience Engagement</InsightTitle>
                  <InsightText>
                    With {processedStats.engagementRate}% engagement rate, your content resonates well with visitors. 
                    Focus on similar content types for better results.
                  </InsightText>
                </InsightContent>
              </InsightItem>
              
              <InsightItem>
                <InsightIcon>
                  <Activity size={16} />
                </InsightIcon>
                <InsightContent>
                  <InsightTitle>Portfolio Health</InsightTitle>
                  <InsightText>
                    Your {processedStats.completionRate}% completion rate shows good progress. 
                    Aim for regular updates to keep your portfolio fresh.
                  </InsightText>
                </InsightContent>
              </InsightItem>
            </FlexColumn>
          </ViewCardContent>
        </ViewCard>
      </ViewGrid>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel>
          <Heading3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>🔧 Debug Information</Heading3>
          <ViewGrid $minWidth="300px">
            <div>
              <strong>Stats Object:</strong>
              <pre style={{ 
                background: 'white', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                fontSize: '0.75rem', 
                overflow: 'auto', 
                maxHeight: '200px' 
              }}>
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Achievements:</strong>
              <pre style={{ 
                background: 'white', 
                padding: '0.75rem', 
                borderRadius: '4px', 
                fontSize: '0.75rem', 
                overflow: 'auto', 
                maxHeight: '200px' 
              }}>
                {JSON.stringify(achievements.slice(0, 2), null, 2)}
              </pre>
            </div>
          </ViewGrid>
        </DebugPanel>
      )}
    </ViewContainer>
  );
};