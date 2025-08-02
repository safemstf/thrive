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

export const GalleryTabContent: React.FC<GalleryTabContentProps> = ({ 
  portfolioStats, 
  onUploadClick 
}) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPieces: 0,
    totalViews: 0,
    totalLikes: 0,
    featuredCount: 0
  });

  // Fetch gallery data
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch gallery pieces
        const pieces = await api.portfolio.getMyGalleryPieces();
        setGalleryPieces(pieces || []);
        
        // Calculate stats from pieces (using correct property names)
        if (pieces && pieces.length > 0) {
          const totalViews = pieces.reduce((sum, piece) => sum + (piece.views || 0), 0);
          const totalLikes = pieces.reduce((sum, piece) => sum + (piece.likes || 0), 0);
          // Check if piece is featured based on your actual data structure
          const featuredCount = pieces.filter(piece => 
            piece.tags?.includes('featured') || // If you use tags
            piece.status === 'exhibition' ||     // If exhibition pieces are considered featured
            false // Replace with your actual featured logic
          ).length;
          
          setStats({
            totalPieces: pieces.length,
            totalViews,
            totalLikes,
            featuredCount
          });
        }
      } catch (err) {
        console.error('Failed to fetch gallery data:', err);
        setError('Failed to load gallery data');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  // Filter pieces based on search and status
  const filteredPieces = galleryPieces.filter(piece => {
    const matchesSearch = searchQuery === '' || 
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && piece.visibility === 'public') ||
      (filterStatus === 'draft' && piece.visibility === 'private');
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeletePiece = async (pieceId: string) => {
    if (!confirm('Are you sure you want to delete this piece?')) return;
    
    try {
      await api.portfolio.deleteGalleryPiece(pieceId);
      setGalleryPieces(prev => prev.filter(piece => piece.id !== pieceId));
    } catch (err) {
      console.error('Failed to delete piece:', err);
      alert('Failed to delete piece');
    }
  };

  const handleToggleVisibility = async (pieceId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    
    try {
      await api.portfolio.updateGalleryPieceVisibility(pieceId, newVisibility as any);
      setGalleryPieces(prev => prev.map(piece => 
        piece.id === pieceId 
          ? { ...piece, visibility: newVisibility as any }
          : piece
      ));
    } catch (err) {
      console.error('Failed to update visibility:', err);
      alert('Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem',
        color: '#6b7280'
      }}>
        <Loader2 size={24} style={{ marginRight: '0.5rem' }} />
        Loading gallery...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem',
        color: '#ef4444',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <AlertCircle size={48} />
        <div>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Images size={24} />
            Gallery Management
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
            {filteredPieces.length} of {galleryPieces.length} pieces • Manage your artwork collection
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onUploadClick}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1rem', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <Upload size={16} />
            Upload New
          </button>
          <button 
            onClick={() => router.push('/dashboard/gallery')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              background: 'white', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <ExternalLink size={16} />
            Full Editor
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.totalPieces}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Pieces</div>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.totalViews.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Views</div>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.totalLikes}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Likes</div>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.featuredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Featured</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center', 
          flexWrap: 'wrap' 
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af' 
            }} />
            <input
              type="text"
              placeholder="Search pieces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.5rem',
                background: viewMode === 'grid' ? '#3b82f6' : 'white',
                color: viewMode === 'grid' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Grid/>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem',
                background: viewMode === 'list' ? '#3b82f6' : 'white',
                color: viewMode === 'list' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {filteredPieces.length === 0 ? (
        <div style={{ 
          background: '#f9fafb', 
          border: '2px dashed #d1d5db', 
          borderRadius: '12px', 
          padding: '3rem', 
          textAlign: 'center' 
        }}>
          <Images size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            {galleryPieces.length === 0 ? 'No artwork yet' : 'No pieces found'}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first artwork to get started'
            }
          </p>
          <button 
            onClick={onUploadClick}
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Upload size={16} />
            Upload First Piece
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          {filteredPieces.map((piece, index) => (
            <div key={piece.id} style={{ 
              padding: '1rem', 
              borderBottom: index < filteredPieces.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: piece.imageUrl ? `url(${piece.imageUrl})` : 'linear-gradient(45deg, #f3f4f6, #e5e7eb)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                flexShrink: 0,
                position: 'relative'
              }}>
                {!piece.imageUrl && <Images size={20} />}
                {(piece.tags?.includes('featured') || piece.status === 'exhibition') && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '2px', 
                    right: '2px', 
                    color: '#fbbf24',
                    background: 'white',
                    borderRadius: '50%',
                    padding: '2px'
                  }}>
                    ⭐
                  </div>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    {piece.title}
                  </h3>
                  <span style={{
                    background: piece.visibility === 'public' ? '#dcfce7' : '#fef3c7',
                    color: piece.visibility === 'public' ? '#16a34a' : '#d97706',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {piece.visibility === 'public' ? 'published' : 'draft'}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  {piece.description || 'No description'}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.75rem', 
                  color: '#9ca3af' 
                }}>
                  <span>{piece.category || 'Uncategorized'}</span>
                  <span>{formatDate(piece.createdAt)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Eye size={12} />
                    {piece.views || 0} views
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Heart size={12} />
                    {piece.likes || 0} likes
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  onClick={() => handleToggleVisibility(piece.id, piece.visibility)}
                  title={`Make ${piece.visibility === 'public' ? 'private' : 'public'}`}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    borderRadius: '4px'
                  }}
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => navigator.share ? navigator.share({
                    title: piece.title,
                    text: piece.description,
                    url: window.location.origin + '/gallery/' + piece.id
                  }) : null}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    borderRadius: '4px'
                  }}
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeletePiece(piece.id)}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#ef4444',
                    borderRadius: '4px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
interface LearningTabContentProps {
  portfolioStats: PortfolioStats;
}

export const LearningTabContent: React.FC<LearningTabContentProps> = ({ portfolioStats }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [conceptProgresses, setConceptProgresses] = useState<ConceptProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalConcepts: 0,
    completedCount: 0,
    averageScore: 0,
    progressPercentage: 0
  });

  // Fetch learning data
  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's concept progress from portfolio
        const userConceptProgresses = await api.portfolio.getMyConcepts();
        setConceptProgresses(userConceptProgresses || []);
        
        // Calculate stats from concept progress
        if (userConceptProgresses && userConceptProgresses.length > 0) {
          const completedCount = userConceptProgresses.filter(cp => 
            cp.status === 'completed'
          ).length;
          
          // Calculate average score from completed concepts
          const completedProgresses = userConceptProgresses.filter(cp => 
            cp.status === 'completed' && cp.score
          );
          const averageScore = completedProgresses.length > 0 
            ? Math.round(completedProgresses.reduce((sum, cp) => 
                sum + (cp.score || 0), 0) / completedProgresses.length)
            : 0;
          
          setStats({
            totalConcepts: userConceptProgresses.length,
            completedCount,
            averageScore,
            progressPercentage: userConceptProgresses.length > 0 
              ? Math.round((completedCount / userConceptProgresses.length) * 100)
              : 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch learning data:', err);
        setError('Failed to load learning data');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  // Filter concept progresses based on search
  const filteredProgresses = conceptProgresses.filter(cp => {
    const matchesSearch = searchQuery === '' || 
      cp.conceptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'not-started': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'completed': return '#dcfce7';
      case 'in-progress': return '#fef3c7';
      case 'not-started': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const handleUpdateProgress = async (conceptId: string, newStatus: string) => {
    try {
      await api.portfolio.updateConceptProgress(conceptId, { status: newStatus });
      setConceptProgresses(prev => prev.map(cp => 
        cp.conceptId === conceptId 
          ? { ...cp, status: newStatus as any }
          : cp
      ));
      
      // Update stats
      const updatedProgresses = conceptProgresses.map(cp => 
        cp.conceptId === conceptId ? { ...cp, status: newStatus as any } : cp
      );
      const completedCount = updatedProgresses.filter(cp => cp.status === 'completed').length;
      
      setStats(prev => ({
        ...prev,
        completedCount,
        progressPercentage: updatedProgresses.length > 0 
          ? Math.round((completedCount / updatedProgresses.length) * 100)
          : 0
      }));
    } catch (err) {
      console.error('Failed to update progress:', err);
      alert('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem',
        color: '#6b7280'
      }}>
        <Loader2 size={24} style={{ marginRight: '0.5rem' }} />
        Loading learning progress...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem',
        color: '#ef4444',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <AlertCircle size={48} />
        <div>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} />
            Learning Progress
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
            {stats.completedCount} of {stats.totalConcepts} concepts completed • Track your learning journey
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => router.push('/writing?create=new')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1rem', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <Plus size={16} />
            Add Content
          </button>
          <button 
            onClick={() => router.push('/writing')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              background: 'white', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <ExternalLink size={16} />
            Learning Center
          </button>
        </div>
      </div>

      {/* Progress Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.completedCount}/{stats.totalConcepts}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Completed</div>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.averageScore}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Avg Score</div>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {stats.progressPercentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Progress</div>
        </div>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            {conceptProgresses.filter(cp => cp.status === 'in-progress').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>In Progress</div>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Learning Content */}
      {filteredProgresses.length === 0 ? (
        <div style={{ 
          background: '#f9fafb', 
          border: '2px dashed #d1d5db', 
          borderRadius: '12px', 
          padding: '3rem', 
          textAlign: 'center' 
        }}>
          <BookOpen size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            {conceptProgresses.length === 0 ? 'No learning content yet' : 'No content found'}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Start your learning journey by adding educational content'
            }
          </p>
          <button 
            onClick={() => router.push('/writing')}
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <BookOpen size={16} />
            Explore Learning Center
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          {filteredProgresses.map((progress, index) => (
            <div key={progress.conceptId} style={{ 
              padding: '1rem', 
              borderBottom: index < filteredProgresses.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: getStatusBackground(progress.status),
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getStatusColor(progress.status),
                flexShrink: 0,
                fontWeight: '700',
                fontSize: '0.875rem'
              }}>
                {progress.status === 'completed' ? '✓' : 
                 progress.status === 'in-progress' ? (progress.score || 0) + '%' : '○'}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    Concept {progress.conceptId.slice(-8)} {/* Show last 8 chars of ID */}
                  </h3>
                  <span style={{
                    background: getStatusBackground(progress.status),
                    color: getStatusColor(progress.status),
                    padding: '0.125rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {progress.status.replace('-', ' ')}
                  </span>
                </div>
                
                {progress.notes && (
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    {progress.notes}
                  </p>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.75rem', 
                  color: '#9ca3af' 
                }}>
                  {progress.startedAt && (
                    <span>Started: {formatDate(progress.startedAt)}</span>
                  )}
                  {progress.completedAt && (
                    <span>Completed: {formatDate(progress.completedAt)}</span>
                  )}
                  {progress.score && (
                    <span>Score: {progress.score}%</span>
                  )}
                  {progress.attempts && (
                    <span>Attempts: {progress.attempts}</span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  onClick={() => handleUpdateProgress(progress.conceptId, 
                    progress.status === 'completed' ? 'in-progress' : 'completed'
                  )}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    borderRadius: '4px'
                  }}
                  title={`Mark as ${progress.status === 'completed' ? 'in progress' : 'completed'}`}
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => navigator.share ? navigator.share({
                    title: `Concept ${progress.conceptId}`,
                    text: progress.notes || 'Learning progress',
                    url: window.location.origin + '/concept/' + progress.conceptId
                  }) : null}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#6b7280',
                    borderRadius: '4px'
                  }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface AnalyticsTabContentProps {
  portfolioStats: PortfolioStats;
}

export const AnalyticsTabContent: React.FC<AnalyticsTabContentProps> = ({ portfolioStats }) => (
  <div>
    <h2 style={{ 
      margin: '0 0 2rem 0', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem' 
    }}>
      <TrendingUp size={24} />
      Analytics & Insights
    </h2>
    
    {/* Quick Stats Grid */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '1.5rem', 
      marginBottom: '2rem' 
    }}>
      <AnalyticsCard
        title="Monthly Views"
        value={portfolioStats.analytics.monthlyViews.toLocaleString()}
        trend={`+${portfolioStats.analytics.weeklyGrowth}%`}
        trendColor="#10b981"
      />
      <AnalyticsCard
        title="Engagement Rate"
        value={`${portfolioStats.analytics.engagementRate}%`}
        trend="↗ Growing"
        trendColor="#3b82f6"
      />
      <AnalyticsCard
        title="Weekly Growth"
        value={`+${portfolioStats.analytics.weeklyGrowth}%`}
        trend="vs last week"
        trendColor="#f59e0b"
      />
    </div>
    
    {/* Placeholder for charts */}
    <div style={{ 
      background: '#f8fafc', 
      border: '2px dashed #d1d5db', 
      borderRadius: '12px', 
      padding: '4rem', 
      textAlign: 'center' 
    }}>
      <BarChart3 size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
      <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Analytics Dashboard</h3>
      <p style={{ color: '#6b7280' }}>Detailed portfolio analytics and insights coming soon</p>
    </div>
  </div>
);

interface AnalyticsCardProps {
  title: string;
  value: string;
  trend: string;
  trendColor: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, trend, trendColor }) => (
  <div style={{ 
    background: 'white', 
    padding: '1.5rem', 
    borderRadius: '12px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
  }}>
    <h4 style={{ 
      margin: '0 0 0.5rem 0', 
      fontSize: '0.875rem', 
      color: '#6b7280', 
      fontWeight: '500' 
    }}>
      {title}
    </h4>
    <div style={{ 
      fontSize: '2rem', 
      fontWeight: '700', 
      color: '#111827', 
      marginBottom: '0.5rem' 
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: '0.875rem', 
      color: trendColor, 
      fontWeight: '500' 
    }}>
      {trend}
    </div>
  </div>
);

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