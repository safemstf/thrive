// src/components/profile/utils/learningTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Plus, ExternalLink, Edit3, Share2, Search,
  AlertCircle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { ConceptProgress } from '@/types/educational.types';
import type { PortfolioStats } from './staticMethodsProfile';

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
        const response = await api.portfolio.concepts.get();
        const userConceptProgresses = response.concepts || [];
        setConceptProgresses(userConceptProgresses);
        
        // Calculate stats from concept progress
        if (userConceptProgresses.length > 0) {
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

  const handleUpdateProgress = async (conceptId: string, newStatus: "started" | "in-progress" | "completed" ) => {
    try {
      await api.portfolio.concepts.updateProgress(conceptId, { status: newStatus });
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
                    Concept {progress.conceptId.slice(-8)}
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