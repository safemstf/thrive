// src/components/profile/utils/analytics.tsx
'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, BarChart3, Users, Eye, Heart, Share2, 
  Calendar, Clock, Globe, Target, Zap, Award
} from 'lucide-react';
import type { PortfolioStats } from './staticMethodsProfile';

interface AnalyticsTabContentProps {
  portfolioStats: PortfolioStats;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactElement;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{ color: '#6b7280' }}>{icon}</div>
        {change && (
          <span style={{ 
            fontSize: '0.875rem', 
            color: getChangeColor(),
            fontWeight: '600'
          }}>
            {change}
          </span>
        )}
      </div>
      
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: '700', 
        color: '#111827', 
        marginBottom: '0.5rem',
        lineHeight: '1'
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      <h4 style={{ 
        margin: '0 0 0.25rem 0', 
        fontSize: '0.875rem', 
        color: '#374151', 
        fontWeight: '600'
      }}>
        {title}
      </h4>
      
      {description && (
        <p style={{
          margin: 0,
          fontSize: '0.75rem',
          color: '#6b7280',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      )}
    </div>
  );
};

export const AnalyticsTabContent: React.FC<AnalyticsTabContentProps> = ({ portfolioStats }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ 
            margin: '0 0 0.5rem 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#111827'
          }}>
            <BarChart3 size={28} />
            Portfolio Analytics
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#6b7280', 
            fontSize: '0.875rem' 
          }}>
            Comprehensive insights into your portfolio performance and audience engagement
          </p>
        </div>

        {/* Time Range Selector */}
        <div style={{ 
          display: 'flex', 
          background: '#f3f4f6', 
          borderRadius: '8px', 
          padding: '4px' 
        }}>
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '0.5rem 1rem',
                background: timeRange === range ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: timeRange === range ? '600' : '400',
                color: timeRange === range ? '#111827' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {range === '7d' ? '7 Days' : 
               range === '30d' ? '30 Days' : 
               range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 1rem 0' 
        }}>
          Portfolio Performance
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <MetricCard
            title="Total Portfolio Views"
            value={portfolioStats.analytics.monthlyViews * 3.2}
            change="+24%"
            changeType="positive"
            icon={<Eye size={20} />}
            description="Unique visits to your portfolio"
          />
          <MetricCard
            title="Engagement Rate"
            value={`${portfolioStats.analytics.engagementRate}%`}
            change="+5.2%"
            changeType="positive"
            icon={<Users size={20} />}
            description="Visitors who interact with content"
          />
          <MetricCard
            title="Average Session Time"
            value="3:24"
            change="+18%"
            changeType="positive"
            icon={<Clock size={20} />}
            description="Time spent viewing portfolio"
          />
          <MetricCard
            title="Global Reach"
            value={47}
            change="+3"
            changeType="positive"
            icon={<Globe size={20} />}
            description="Countries viewing portfolio"
          />
        </div>
      </div>

      {/* Content Performance */}
      {(portfolioStats.gallery || portfolioStats.learning) && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Content Performance
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {portfolioStats.gallery && (
              <>
                <MetricCard
                  title="Gallery Impressions"
                  value={portfolioStats.gallery.totalViews}
                  change="+12%"
                  changeType="positive"
                  icon={<Eye size={20} />}
                  description="Views across all gallery pieces"
                />
                <MetricCard
                  title="Artwork Engagement"
                  value={portfolioStats.gallery.totalLikes}
                  change="+8%"
                  changeType="positive"
                  icon={<Heart size={20} />}
                  description="Likes and interactions"
                />
                <MetricCard
                  title="Top Performing Piece"
                  value={`${Math.round(portfolioStats.gallery.totalViews * 0.24)}`}
                  change="Leading"
                  changeType="positive"
                  icon={<Award size={20} />}
                  description="Views on most popular work"
                />
              </>
            )}
            
            {portfolioStats.learning && (
              <MetricCard
                title="Learning Progress"
                value={`${Math.round((portfolioStats.learning.completed / portfolioStats.learning.totalConcepts) * 100)}%`}
                change={`+${portfolioStats.learning.weeklyStreak} streak`}
                changeType="positive"
                icon={<Target size={20} />}
                description="Completion rate and momentum"
              />
            )}
          </div>
        </div>
      )}

      {/* Social & Growth Metrics */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 1rem 0' 
        }}>
          Growth & Social Impact
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <MetricCard
            title="Growth Rate"
            value={`+${portfolioStats.analytics.weeklyGrowth}%`}
            change="vs last period"
            changeType="positive"
            icon={<TrendingUp size={20} />}
            description="Portfolio view growth rate"
          />
          <MetricCard
            title="Social Shares"
            value={127}
            change="+23%"
            changeType="positive"
            icon={<Share2 size={20} />}
            description="Portfolio shared on social media"
          />
          <MetricCard
            title="Professional Inquiries"
            value={8}
            change="+3"
            changeType="positive"
            icon={<Zap size={20} />}
            description="Contact form submissions"
          />
          <MetricCard
            title="Return Visitors"
            value="34%"
            change="+7%"
            changeType="positive"
            icon={<Users size={20} />}
            description="Visitors returning to portfolio"
          />
        </div>
      </div>

      {/* Insights Panel */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        border: '1px solid #e2e8f0',
        borderRadius: '12px', 
        padding: '2rem',
        textAlign: 'left'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 1rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Zap size={20} />
          Key Insights & Recommendations
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#059669' }}>✓ Strong Performance:</strong> Your portfolio engagement rate of {portfolioStats.analytics.engagementRate}% is above average. Visitors are actively engaging with your content.
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#0ea5e9' }}>📈 Growth Opportunity:</strong> Consider optimizing your most viewed content and creating similar pieces to capitalize on audience interest.
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <strong style={{ color: '#7c3aed' }}>🎯 Next Steps:</strong> Focus on improving session time by adding more interactive elements or detailed project descriptions.
          </div>
        </div>
      </div>
    </div>
  );
};