// =============================================================================
// src\components\profile\profileLogic.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import type { ReactElement } from 'react';
import {
  Brush, Brain, Layers, BarChart3, Images, BookOpen, 
  Settings, Plus, Check, X, ChevronRight, Upload, ExternalLink,
  Edit3, Globe, Lock, Loader2, Activity, CheckCircle, Clock,
  Camera, Award, TrendingUp, ArrowUpRight
} from 'lucide-react';

type PortfolioKind = 'creative' | 'educational' | 'hybrid';
type TabType = 'overview' | 'gallery' | 'learning' | 'analytics' | 'settings' | 'create';

interface PortfolioStats {
  gallery: {
    totalPieces: number;
    totalViews: number;
    totalLikes: number;
    recentUploads: number;
  };
  learning: {
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
}

interface CreatePortfolioData {
  title: string;
  bio: string;
  visibility: 'public' | 'private';
  kind: PortfolioKind;
}

export function useProfileLogic(portfolioManagement: any) {
  const [stats, setStats] = useState({ visits: 0, averageRating: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [createPortfolioData, setCreatePortfolioData] = useState<CreatePortfolioData>({
    title: '',
    bio: '',
    visibility: 'public',
    kind: 'creative'
  });

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { portfolio, createPortfolio, updatePortfolio } = portfolioManagement;

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('create');
    if (action === 'creative' && !portfolio) {
      setCreatePortfolioData(prev => ({ ...prev, kind: 'creative' }));
      setShowCreatePortfolio(true);
    }
  }, [searchParams, portfolio]);

  // Fetch data
  useEffect(() => {
    fetchUserStats();
    if (portfolio) {
      fetchPortfolioStats();
    }
  }, [portfolio]);

  const fetchUserStats = async () => {
    // Mock data for now
    setStats({
      visits: Math.floor(Math.random() * 1000) + 100,
      averageRating: Math.random() * 2 + 3,
      totalRatings: Math.floor(Math.random() * 50) + 10
    });
  };

  const fetchPortfolioStats = async () => {
    // Mock data for now
    const stats: PortfolioStats = {
      gallery: {
        totalPieces: Math.floor(Math.random() * 50) + 10,
        totalViews: Math.floor(Math.random() * 1000) + 100,
        totalLikes: Math.floor(Math.random() * 100) + 20,
        recentUploads: Math.floor(Math.random() * 5) + 1
      },
      learning: {
        totalConcepts: Math.floor(Math.random() * 50) + 20,
        completed: Math.floor(Math.random() * 30) + 10,
        inProgress: Math.floor(Math.random() * 10) + 3,
        weeklyStreak: Math.floor(Math.random() * 14) + 1,
        averageScore: Math.floor(Math.random() * 30) + 70
      },
      analytics: {
        weeklyGrowth: Math.floor(Math.random() * 25) + 5,
        monthlyViews: Math.floor(Math.random() * 1000) + 500,
        engagementRate: Math.floor(Math.random() * 20) + 15
      }
    };
    setPortfolioStats(stats);
  };

  // Handlers
  const handleCreatePortfolio = useCallback(async () => {
    try {
      await createPortfolio({
        title: createPortfolioData.title || `${user?.name}'s Portfolio`,
        bio: createPortfolioData.bio || '',
        visibility: createPortfolioData.visibility,
        kind: createPortfolioData.kind
      });
      setShowCreatePortfolio(false);
      setActiveTab('overview');
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  }, [createPortfolioData, createPortfolio, user]);

  const handleUpgradePortfolio = useCallback(async (newKind: PortfolioKind) => {
    if (!portfolio) return;
    try {
      await updatePortfolio({ kind: newKind });
    } catch (error) {
      console.error('Error upgrading portfolio:', error);
    }
  }, [portfolio, updatePortfolio]);

  // Utils
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getPortfolioTypeConfig = (type: PortfolioKind) => {
    switch (type) {
      case 'creative':
        return {
          icon: <Brush size={24} />,
          title: 'Creative Portfolio',
          color: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          description: 'Showcase your artwork, designs, and creative projects',
          features: ['Image galleries', 'Portfolio showcase', 'Creative collections']
        };
      case 'educational':
        return {
          icon: <Brain size={24} />,
          title: 'Educational Portfolio',
          color: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          description: 'Track your academic progress and learning achievements',
          features: ['Progress tracking', 'Concept mastery', 'Learning analytics']
        };
      case 'hybrid':
        return {
          icon: <Layers size={24} />,
          title: 'Hybrid Portfolio',
          color: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
          description: 'Combine creative works with educational progress',
          features: ['Creative showcase', 'Learning progress', 'Unified dashboard']
        };
      default:
        // Fallback for any unexpected portfolio types
        return {
          icon: <Layers size={24} />,
          title: 'Portfolio',
          color: '#6b7280',
          gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
          description: 'Your portfolio',
          features: ['Portfolio management']
        };
    }
  };

  // Render functions
  const renderPortfolioCreation = () => (
    <div>
      {!showCreatePortfolio ? (
        <div>
          <h2>Create Your Portfolio</h2>
          <p>Choose the type of portfolio that best represents your journey</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {(['creative', 'educational', 'hybrid'] as PortfolioKind[]).map(type => {
              const config = getPortfolioTypeConfig(type);
              return (
                <div 
                  key={type}
                  onClick={() => {
                    setCreatePortfolioData(prev => ({ ...prev, kind: type }));
                    setShowCreatePortfolio(true);
                  }}
                  style={{ 
                    padding: '2rem', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    background: 'white'
                  }}
                >
                  <div style={{ marginBottom: '1rem', color: config.color }}>{config.icon}</div>
                  <h3>{config.title}</h3>
                  <p>{config.description}</p>
                  <div style={{ marginBottom: '1rem' }}>
                    {config.features.map(feature => (
                      <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Check size={14} style={{ color: '#10b981' }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button style={{ 
                    background: config.gradient, 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '8px',
                    width: '100%',
                    cursor: 'pointer'
                  }}>
                    Create {config.title}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button onClick={() => setShowCreatePortfolio(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3>Create {getPortfolioTypeConfig(createPortfolioData.kind)?.title}</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Portfolio Title</label>
              <input
                type="text"
                value={createPortfolioData.title}
                onChange={(e) => setCreatePortfolioData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your portfolio title"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Bio</label>
              <textarea
                value={createPortfolioData.bio}
                onChange={(e) => setCreatePortfolioData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell others about yourself..."
                rows={4}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                onClick={() => setShowCreatePortfolio(false)}
                style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePortfolio}
                disabled={!createPortfolioData.title.trim()}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  opacity: !createPortfolioData.title.trim() ? 0.6 : 1
                }}
              >
                Create Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPortfolioTabs = () => {
    if (!portfolio) return null;

    const tabs: { id: TabType; label: string; icon: ReactElement }[] = [
      { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    ];

    if (portfolio.kind === 'creative' || portfolio.kind === 'hybrid') {
      tabs.push({ id: 'gallery', label: 'Gallery', icon: <Images size={16} /> });
    }
    
    if (portfolio.kind === 'educational' || portfolio.kind === 'hybrid') {
      tabs.push({ id: 'learning', label: 'Learning', icon: <BookOpen size={16} /> });
    }

    tabs.push(
      { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
    );

    if (portfolio.kind === 'creative' || portfolio.kind === 'educational') {
      tabs.push({ id: 'create', label: 'Upgrade', icon: <Plus size={16} /> });
    }

    return (
      <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '12px', padding: '6px', marginBottom: '2rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  const renderPortfolioContent = () => {
    if (!portfolio || !portfolioStats) return null;
    
    const config = getPortfolioTypeConfig(portfolio.kind);
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>{portfolio.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: config.color }}>
                    {config.icon}
                    {config.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    {portfolio.visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                    {portfolio.visibility}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => window.open(`/portfolio/${portfolio.username}`, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <ExternalLink size={16} />
                  View Public
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: config.gradient, padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                    {config.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#111827' }}>Portfolio Type</h4>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{config.title}</p>
                  </div>
                </div>
                {(portfolio.kind === 'creative' || portfolio.kind === 'educational') && (
                  <button 
                    onClick={() => setActiveTab('create')}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Upgrade to Hybrid <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#8b5cf620', padding: '0.75rem', borderRadius: '12px', color: '#8b5cf6' }}>
                      <Images size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#111827' }}>Gallery</h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{portfolioStats.gallery.totalPieces} pieces</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('gallery')}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Manage Gallery <ChevronRight size={14} />
                  </button>
                </div>
              )}
              {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#3b82f620', padding: '0.75rem', borderRadius: '12px', color: '#3b82f6' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#111827' }}>Learning</h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{portfolioStats.learning.completed}/{portfolioStats.learning.totalConcepts} completed</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('learning')}
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Continue Learning <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Images size={24} />
                Gallery Management
                <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                  {portfolioStats.gallery.totalPieces} pieces
                </span>
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Upload size={16} />
                  Upload Artwork
                </button>
                <button 
                  onClick={() => router.push('/dashboard/gallery')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <ExternalLink size={16} />
                  Full Gallery View
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.gallery.totalPieces}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Pieces</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.gallery.totalViews}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Views</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.gallery.totalLikes}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Likes</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.gallery.recentUploads}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>This Week</div>
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
              <Images size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Gallery management interface coming soon</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Upload Artwork
              </button>
            </div>
          </div>
        );
      case 'learning':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={24} />
                Learning Progress
                <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                  {portfolioStats.learning.completed} completed
                </span>
              </h2>
              <button 
                onClick={() => router.push('/dashboard/writing')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <ExternalLink size={16} />
                Open Learning Center
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <BookOpen size={24} style={{ color: '#3b82f6' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.learning.totalConcepts}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Concepts</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle size={24} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.learning.completed}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock size={24} style={{ color: '#f59e0b' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.learning.inProgress}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Progress</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Activity size={24} style={{ color: '#8b5cf6' }} />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.learning.weeklyStreak}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Day Streak</div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Overall Progress</h3>
              <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${(portfolioStats.learning.completed / portfolioStats.learning.totalConcepts) * 100}%`,
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    transition: 'width 0.8s ease'
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                {((portfolioStats.learning.completed / portfolioStats.learning.totalConcepts) * 100).toFixed(1)}% Complete
                • Average Score: {portfolioStats.learning.averageScore}%
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Detailed learning analytics coming soon</p>
              <button 
                onClick={() => router.push('/dashboard/writing')}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Continue Learning
              </button>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} />
              Analytics & Insights
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Portfolio Performance</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: '600', fontSize: '0.875rem' }}>
                    <ArrowUpRight size={16} />
                    +{portfolioStats.analytics.weeklyGrowth}%
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.analytics.monthlyViews}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Monthly Views</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{portfolioStats.analytics.engagementRate}%</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Engagement Rate</div>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Portfolio Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(portfolio.kind === 'creative' || portfolio.kind === 'hybrid') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#8b5cf620', padding: '0.5rem', borderRadius: '8px', color: '#8b5cf6' }}>
                        <Images size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#111827' }}>Gallery</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{portfolioStats.gallery.totalPieces} pieces</div>
                      </div>
                    </div>
                  )}
                  {(portfolio.kind === 'educational' || portfolio.kind === 'hybrid') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#3b82f620', padding: '0.5rem', borderRadius: '8px', color: '#3b82f6' }}>
                        <BookOpen size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#111827' }}>Learning</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{portfolioStats.learning.completed} completed</div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#10b98120', padding: '0.5rem', borderRadius: '8px', color: '#10b981' }}>
                      <Award size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>Rating</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stats.averageRating.toFixed(1)} stars</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '2px dashed #d1d5db', borderRadius: '12px', padding: '4rem', textAlign: 'center' }}>
              <BarChart3 size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280' }}>Advanced analytics charts and insights will be displayed here</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={24} />
              Portfolio Settings
            </h2>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Basic Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Portfolio Title</label>
                    <input
                      type="text"
                      defaultValue={portfolio.title}
                      placeholder="Enter portfolio title"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Bio</label>
                    <textarea
                      defaultValue={portfolio.bio}
                      placeholder="Tell others about your work..."
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Visibility</h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Current: <strong>{portfolio.visibility}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { value: 'public', icon: <Globe size={16} />, label: 'Public', desc: 'Visible to everyone' },
                    { value: 'private', icon: <Lock size={16} />, label: 'Private', desc: 'Only visible to you' }
                  ].map(option => (
                    <div
                      key={option.value}
                      onClick={() => updatePortfolio({ visibility: option.value as 'public' | 'private' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: `2px solid ${portfolio.visibility === option.value ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: portfolio.visibility === option.value ? '#eff6ff' : 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      {option.icon}
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{option.label}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{option.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>Portfolio Type</h3>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: config.gradient, padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
                      {config.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{config.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{config.description}</div>
                    </div>
                  </div>
                  {(portfolio.kind === 'creative' || portfolio.kind === 'educational') && (
                    <button 
                      onClick={() => setActiveTab('create')}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem' }}
                    >
                      Upgrade to Hybrid Portfolio
                    </button>
                  )}
                </div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <button 
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'create':
        return (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={24} />
              Upgrade to Hybrid Portfolio
            </h2>
            
            <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
              <Layers size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upgrade to Hybrid Portfolio</h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Combine your {portfolio.kind} portfolio with additional capabilities. 
                Get access to both creative showcases and learning progress tracking.
              </p>
              
              <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={20} style={{ color: '#10b981' }} />
                  <span>Keep all your existing content</span>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={20} style={{ color: '#10b981' }} />
                  <span>Access to creative galleries</span>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={20} style={{ color: '#10b981' }} />
                  <span>Learning progress tracking</span>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={20} style={{ color: '#10b981' }} />
                  <span>Enhanced analytics and insights</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => handleUpgradePortfolio('hybrid')}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer' 
                  }}
                >
                  Upgrade Portfolio
                </button>
                <button 
                  onClick={() => setActiveTab('overview')}
                  style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return {
    // State
    activeTab,
    setActiveTab,
    stats,
    portfolioStats,
    showCreatePortfolio,
    showUploadModal,
    setShowUploadModal,
    createPortfolioData,
    setCreatePortfolioData,
    
    // Handlers
    handleCreatePortfolio,
    handleUpgradePortfolio,
    
    // Render functions
    renderPortfolioCreation,
    renderPortfolioTabs,
    renderPortfolioContent,
    
    // Utils
    getInitials,
    getPortfolioTypeConfig
  };
}