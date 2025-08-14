// src/components/profile/utils/galleryTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Images, Upload, ExternalLink, Edit3, Share2, Trash2, Eye, Heart,
  Search, List, Grid, AlertCircle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { GalleryPiece } from '@/types/gallery.types';
import type { PortfolioStats } from './staticMethodsProfile';

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
        const response = await api.portfolio.gallery.get();
        
        // Convert backend pieces to frontend format if needed
        const pieces = response.galleryPieces || [];
        const convertedPieces: GalleryPiece[] = pieces.map((piece: any) => ({
          ...piece,
          id: piece._id || piece.id,
          _id: piece._id,
          // Ensure all required GalleryPiece properties exist
          alt: piece.alt || piece.title || 'Gallery artwork',
          size: piece.size || 'medium',
          status: piece.status || 'available', 
          ownerId: piece.ownerId || piece.uploadedBy,
          visibility: piece.visibility || 'private',
          displayOrder: piece.displayOrder || 0,
          views: piece.views || 0,
          likes: piece.likes || 0,
          // Convert date strings to Date objects if needed
          createdAt: typeof piece.createdAt === 'string' ? new Date(piece.createdAt) : piece.createdAt,
          updatedAt: typeof piece.updatedAt === 'string' ? new Date(piece.updatedAt) : piece.updatedAt,
          publishedAt: piece.publishedAt ? (typeof piece.publishedAt === 'string' ? new Date(piece.publishedAt) : piece.publishedAt) : undefined
        }));
        
        setGalleryPieces(convertedPieces);
        
        // Calculate stats from pieces
        if (convertedPieces && convertedPieces.length > 0) {
          const totalViews = convertedPieces.reduce((sum: number, piece: GalleryPiece) => sum + (piece.views || 0), 0);
          const totalLikes = convertedPieces.reduce((sum: number, piece: GalleryPiece) => sum + (piece.likes || 0), 0);
          // Check if piece is featured based on your actual data structure
          const featuredCount = convertedPieces.filter((piece: GalleryPiece) => 
            piece.tags?.includes('featured') || // If you use tags
            piece.status === 'exhibition' ||     // If exhibition pieces are considered featured
            false // Replace with your actual featured logic
          ).length;
          
          setStats({
            totalPieces: convertedPieces.length,
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
      await api.portfolio.gallery.delete(pieceId);
      setGalleryPieces(prev => prev.filter(piece => piece._id !== pieceId));
    } catch (err) {
      console.error('Failed to delete piece:', err);
      alert('Failed to delete piece');
    }
  };

 const handleToggleVisibility = async (pieceId: string, currentVisibility: string) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
    
    try {
      // Use updateGalleryPiece instead of batchUpdateVisibility
      await api.portfolio.gallery.update(pieceId, { visibility: newVisibility });
      
      setGalleryPieces(prev => prev.map(piece => 
        piece._id === pieceId 
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
              <Grid size={16} />
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
            <div key={piece._id} style={{ 
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
                    {piece.title || 'Untitled'}
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
                  onClick={() => handleToggleVisibility(piece._id, piece.visibility)}
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
                    title: piece.title || 'Untitled',
                    text: piece.description || '',
                    url: window.location.origin + '/gallery/' + piece._id
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
                  onClick={() => handleDeletePiece(piece._id)}
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