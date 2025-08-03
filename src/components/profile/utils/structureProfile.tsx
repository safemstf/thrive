// src/components/profile/utils/structureProfile.tsx
'use client';

import { useRouter } from 'next/navigation';
import { 
  User, Mail, Shield, Calendar, Eye, AlertCircle, CheckCircle,
  Brush, GraduationCap, Code, Layers, BarChart3, Images, BookOpen, 
  Settings, Plus, Upload, ExternalLink, Edit3, Globe, Lock, TrendingUp,
   Trash2, Heart, 
  MessageSquare, Download, Search, Filter, List , Share2, Clock, Loader2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import type { GalleryPiece } from '@/types/gallery.types';
import type { ConceptProgress } from '@/types/educational.types';
import { 
  Header, 
  ProfileInfo, 
  Avatar, 
  UserName, 
  Role, 
  Email,
  Grid,
  Card,
  CreatePortfolioSection
} from '@/components/profile/profileStyles';
import { RatingReview } from '@/components/ratingReview';
import type { Concept, PortfolioKind } from '@/types/portfolio.types';
import { 
  getInitials, 
  getPortfolioTypeConfig, 
  UserStats,
  PortfolioStats 
} from './staticMethodsProfile';

// Import the extracted analytics component
import { AnalyticsTabContent } from './analytics';

interface HeaderSectionProps {
  user: any;
  portfolio: any;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ user, portfolio }) => (
  <Header>
    <Avatar>
      {user?.name ? getInitials(user.name) : <User size={60} />}
    </Avatar>
    <ProfileInfo>
      <UserName>{user?.name || 'User Profile'}</UserName>
      <Role>
        <Shield size={16} />
        {user?.role || 'member'}
      </Role>
      <Email>
        <Mail size={16} />
        {user?.email || 'user@example.com'}
      </Email>
    </ProfileInfo>
    {portfolio && (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          background: getPortfolioTypeConfig(portfolio.kind)?.color || '#6b7280',
          borderRadius: '50%'
        }} />
        <span style={{ color: '#374151', fontWeight: '500' }}>
          {getPortfolioTypeConfig(portfolio.kind)?.title}
        </span>
      </div>
    )}
  </Header>
);

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div style={{
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#dc2626'
    }}>
      <AlertCircle size={20} />
      <span>{error}</span>
    </div>
  );
};

interface StatsGridProps {
  stats: UserStats;
  portfolio: any;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, portfolio }) => (
  <Grid>
    <Card>
      <h3>
        <Calendar size={20} />
        Account Info
      </h3>
      <p>Member since January 2024</p>
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
        {portfolio ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
            <CheckCircle size={16} />
            Portfolio Active
          </div>
        ) : (
          <div style={{ color: '#f59e0b' }}>
            No portfolio created yet
          </div>
        )}
      </div>
    </Card>

    <Card>
      <h3>
        <Eye size={20} />
        Visits & Ratings
      </h3>
      <p>{stats.visits.toLocaleString()} total visits</p>
      <div style={{ marginTop: '0.5rem' }}>
        <RatingReview rating={stats.averageRating} votes={stats.totalRatings} />
      </div>
    </Card>
  </Grid>
);

interface PortfolioCreationGridProps {
  onPortfolioTypeSelect: (type: PortfolioKind) => void;
  isCreating: boolean;
}

export const PortfolioCreationGrid: React.FC<PortfolioCreationGridProps> = ({ 
  onPortfolioTypeSelect, 
  isCreating 
}) => (
  <CreatePortfolioSection>
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <h2 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '700', 
        marginBottom: '1rem', 
        color: '#111827' 
      }}>
        Create Your Portfolio
      </h2>
      <p style={{ 
        fontSize: '1.125rem', 
        color: '#6b7280', 
        maxWidth: '600px', 
        margin: '0 auto' 
      }}>
        Choose the type of portfolio that best represents your journey and goals
      </p>
    </div>
    
    <PortfolioTypeGrid 
      onTypeSelect={onPortfolioTypeSelect}
      isCreating={isCreating}
    />
  </CreatePortfolioSection>
);

interface PortfolioTypeGridProps {
  onTypeSelect: (type: PortfolioKind) => void;
  isCreating: boolean;
}

const PortfolioTypeGrid: React.FC<PortfolioTypeGridProps> = ({ onTypeSelect, isCreating }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto'
  }}>
    {(['creative', 'educational', 'professional', 'hybrid'] as PortfolioKind[]).map((type) => {
      const config = getPortfolioTypeConfig(type);
      return (
        <PortfolioTypeCard
          key={type}
          type={type}
          config={config}
          onSelect={() => onTypeSelect(type)}
          isCreating={isCreating}
        />
      );
    })}
  </div>
);

interface PortfolioTypeCardProps {
  type: PortfolioKind;
  config: ReturnType<typeof getPortfolioTypeConfig>;
  onSelect: () => void;
  isCreating: boolean;
}

const PortfolioTypeCard: React.FC<PortfolioTypeCardProps> = ({ 
  type, 
  config, 
  onSelect, 
  isCreating 
}) => (
  <div 
    onClick={onSelect}
    style={{ 
      padding: '2.5rem', 
      border: '2px solid #e5e7eb', 
      borderRadius: '20px', 
      cursor: isCreating ? 'not-allowed' : 'pointer',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      opacity: isCreating ? 0.7 : 1
    }}
    onMouseEnter={(e) => {
      if (!isCreating) {
        e.currentTarget.style.borderColor = config.color;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.1)`;
      }
    }}
    onMouseLeave={(e) => {
      if (!isCreating) {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: config.gradient
    }} />
    
    <div style={{ 
      marginBottom: '1.5rem', 
      color: config.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '64px',
      height: '64px',
      background: `${config.color}20`,
      borderRadius: '16px'
    }}>
      {config.icon}
    </div>
    
    <h3 style={{ 
      fontSize: '1.5rem', 
      fontWeight: '700', 
      marginBottom: '1rem',
      color: '#111827'
    }}>
      {config.title}
    </h3>
    
    <p style={{ 
      color: '#6b7280', 
      marginBottom: '2rem',
      lineHeight: '1.6'
    }}>
      {config.description}
    </p>
    
    <div style={{ marginBottom: '2rem' }}>
      {config.features.map((feature: string) => (
        <div key={feature} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '0.75rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{ color: '#374151' }}>{feature}</span>
        </div>
      ))}
    </div>
    
    <button 
      style={{ 
        background: config.gradient, 
        color: 'white', 
        border: 'none', 
        padding: '1rem 2rem', 
        borderRadius: '12px',
        width: '100%',
        cursor: isCreating ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        fontSize: '1rem',
        transition: 'transform 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
      disabled={isCreating}
    >
      {isCreating ? 'Creating...' : `Create ${config.title}`}
    </button>
  </div>
);

interface PortfolioTabsProps {
  portfolio: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PortfolioTabs: React.FC<PortfolioTabsProps> = ({ 
  portfolio, 
  activeTab, 
  onTabChange 
}) => {
  if (!portfolio) return null;

  const tabs: { id: string; label: string; icon: React.ReactElement }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
  ];

  // Add tabs based on portfolio capabilities
  if (['creative', 'hybrid', 'professional'].includes(portfolio.kind)) {
    tabs.push({ id: 'gallery', label: 'Gallery', icon: <Images size={16} /> });
  }
  
  if (['educational', 'hybrid'].includes(portfolio.kind)) {
    tabs.push({ id: 'learning', label: 'Learning', icon: <BookOpen size={16} /> });
  }

  tabs.push(
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  );

  if (portfolio.kind !== 'hybrid') {
    tabs.push({ id: 'upgrade', label: 'Upgrade', icon: <Plus size={16} /> });
  }

  return (
    <div style={{ 
      display: 'flex', 
      background: '#f8fafc', 
      borderRadius: '12px', 
      padding: '6px', 
      marginBottom: '2rem', 
      overflow: 'auto' 
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: activeTab === tab.id ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === tab.id ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

interface GalleryTabContentProps {
  portfolioStats: PortfolioStats;
  onUploadClick: () => void;
}


interface LearningTabContentProps {
  portfolioStats: PortfolioStats;
}


// AnalyticsTabContent is now imported directly from './analytics' where needed

interface ComingSoonTabProps {
  title: string;
  description: string;
  icon: React.ReactElement;
}

export const ComingSoonTab: React.FC<ComingSoonTabProps> = ({ title, description, icon }) => (
  <div style={{ 
    background: '#f8fafc', 
    border: '2px dashed #d1d5db', 
    borderRadius: '12px', 
    padding: '4rem', 
    textAlign: 'center' 
  }}>
    <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>
      {React.cloneElement(icon)}
    </div>
    <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ color: '#6b7280' }}>{description}</p>
  </div>
);