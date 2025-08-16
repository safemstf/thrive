'use client'
// src/app/dashboard/writing/page.tsx
import React, { useState } from 'react';
import { 
  BookOpen, PenTool, FileText, Users, TrendingUp, Plus, Filter, Grid, List,
  Eye, Heart, MessageSquare, Share2, Download, Edit3, Calendar, Tag, 
  Clock, BookMarked, Loader2, X, RefreshCw, Upload, Search
} from 'lucide-react';

// Use modular components from our main styled-components system
import {
  PageContainer, ContentWrapper, Card, BaseButton, Grid as StyledGrid, FlexRow, 
  Badge, Input, EmptyState, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalTitle, ModalBody, ProgressBar, HeroSection, Container,
  Heading2, BodyText
} from '@/styles/styled-components';

// Only import truly custom styles that we can't replace
import {
  WritingHeader, HeaderContent, HeaderTitle, HeaderSubtitle,
  TagChip, WritingGrid, WritingCard, TypeBadge, ActionButton,
  AuthorSection, AuthorAvatar, AuthorInfo, AuthorName, AuthorRole, ProgressFill
} from './writing.styles';

type WritingPieceType = 'guide' | 'tutorial' | 'essay' | 'article' | 'poem' | 'story' | 'lesson' | 'research';

interface WritingPiece {
  id: string;
  title: string;
  type: WritingPieceType;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  stats: {
    views: number;
    likes: number;
    comments: number;
    downloads: number;
    shares: number;
  };
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  portfolioId?: string;
  visibility: 'public' | 'private' | 'unlisted';
}

interface WritingStats {
  totalPieces: number;
  totalViews: number;
  totalLikes: number;
  publishedThisMonth: number;
  averageReadTime: number;
  totalDownloads: number;
  engagementRate: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  recentActivity: Array<{
    type: 'published' | 'updated' | 'liked' | 'commented';
    title: string;
    date: string;
  }>;
}

const mockWritingPieces: WritingPiece[] = [
  {
    id: '1',
    title: 'The Art of Mathematical Problem Solving',
    type: 'guide',
    excerpt: 'A comprehensive approach to tackling complex mathematical problems using proven strategies and techniques.',
    content: '...',
    publishedAt: '2024-07-15',
    updatedAt: '2024-07-20',
    tags: ['mathematics', 'problem-solving', 'education', 'strategy'],
    category: 'Educational Guides',
    difficulty: 'intermediate',
    readTime: 15,
    status: 'published',
    featured: true,
    stats: { views: 2847, likes: 189, comments: 45, downloads: 278, shares: 67 },
    author: { name: 'Dr. Sarah Chen', role: 'Mathematics Professor' },
    visibility: 'public'
  },
  {
    id: '2',
    title: 'Effective Essay Writing Techniques',
    type: 'tutorial',
    excerpt: 'Master the fundamentals of essay structure, argumentation, and persuasive writing with this step-by-step guide.',
    content: '...',
    publishedAt: '2024-07-10',
    updatedAt: '2024-07-12',
    tags: ['writing', 'essays', 'academic', 'structure'],
    category: 'Writing Skills',
    difficulty: 'beginner',
    readTime: 12,
    status: 'published',
    featured: false,
    stats: { views: 1456, likes: 98, comments: 23, downloads: 156, shares: 34 },
    author: { name: 'Prof. Michael Rodriguez', role: 'English Literature' },
    visibility: 'public'
  },
  {
    id: '3',
    title: 'Moonlight Sonata in Words',
    type: 'poem',
    excerpt: 'A contemplative piece exploring the intersection of music and nature through lyrical verse.',
    content: '...',
    publishedAt: '2024-07-05',
    updatedAt: '2024-07-05',
    tags: ['poetry', 'nature', 'music', 'reflection'],
    category: 'Creative Writing',
    readTime: 4,
    status: 'published',
    featured: true,
    stats: { views: 823, likes: 67, comments: 12, downloads: 23, shares: 19 },
    author: { name: 'Elena Kowalski', role: 'Poet & Artist' },
    visibility: 'public'
  },
  {
    id: '4',
    title: 'Advanced Chemistry Lab Protocols',
    type: 'lesson',
    excerpt: 'Comprehensive safety procedures and experimental techniques for advanced organic chemistry laboratories.',
    content: '...',
    publishedAt: '2024-06-28',
    updatedAt: '2024-07-01',
    tags: ['chemistry', 'laboratory', 'safety', 'protocols'],
    category: 'Science Education',
    difficulty: 'advanced',
    readTime: 22,
    status: 'published',
    featured: false,
    stats: { views: 1891, likes: 134, comments: 28, downloads: 267, shares: 45 },
    author: { name: 'Dr. James Wilson', role: 'Chemistry Professor' },
    visibility: 'public'
  },
  {
    id: '5',
    title: 'The Digital Age Story',
    type: 'story',
    excerpt: 'A short fiction exploring human connection in an increasingly digital world.',
    content: '...',
    publishedAt: '2024-06-20',
    updatedAt: '2024-06-20',
    tags: ['fiction', 'technology', 'humanity', 'digital age'],
    category: 'Creative Writing',
    readTime: 8,
    status: 'published',
    featured: false,
    stats: { views: 645, likes: 42, comments: 8, downloads: 15, shares: 12 },
    author: { name: 'Maya Patel', role: 'Creative Writer' },
    visibility: 'public'
  },
  {
    id: '6',
    title: 'Research Methods in Social Sciences',
    type: 'research',
    excerpt: 'An analytical overview of quantitative and qualitative research methodologies in contemporary social science.',
    content: '...',
    publishedAt: '2024-06-15',
    updatedAt: '2024-06-18',
    tags: ['research', 'methodology', 'social science', 'analysis'],
    category: 'Academic Research',
    difficulty: 'advanced',
    readTime: 28,
    status: 'published',
    featured: true,
    stats: { views: 3214, likes: 256, comments: 67, downloads: 423, shares: 89 },
    author: { name: 'Dr. Amanda Thompson', role: 'Research Director' },
    visibility: 'public'
  }
];

const mockStats: WritingStats = {
  totalPieces: 24,
  totalViews: 18456,
  totalLikes: 1247,
  publishedThisMonth: 6,
  averageReadTime: 14.5,
  totalDownloads: 1567,
  engagementRate: 8.4,
  topCategories: [
    { name: 'Educational Guides', count: 8, percentage: 33 },
    { name: 'Creative Writing', count: 6, percentage: 25 },
    { name: 'Science Education', count: 5, percentage: 21 },
    { name: 'Academic Research', count: 3, percentage: 13 },
    { name: 'Writing Skills', count: 2, percentage: 8 }
  ],
  recentActivity: [
    { type: 'published', title: 'The Art of Mathematical Problem Solving', date: '2024-07-15' },
    { type: 'updated', title: 'Effective Essay Writing Techniques', date: '2024-07-12' },
    { type: 'liked', title: 'Moonlight Sonata in Words', date: '2024-07-10' },
    { type: 'commented', title: 'Advanced Chemistry Lab Protocols', date: '2024-07-08' }
  ]
};

export default function WritingPortfolioSystem() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title' | 'reads'>('newest');
  const [writingPieces] = useState<WritingPiece[]>(mockWritingPieces);
  const [stats] = useState<WritingStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<WritingPiece | null>(null);

  // Filter and search logic
  const filteredPieces = writingPieces.filter(piece => {
    const matchesSearch = searchQuery === '' || 
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      piece.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || piece.type === filterType;
    const matchesCategory = filterCategory === 'all' || piece.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || piece.difficulty === filterDifficulty;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => piece.tags.includes(tag));
    
    return matchesSearch && matchesType && matchesCategory && matchesDifficulty && matchesTags;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular': return b.stats.views - a.stats.views;
      case 'title': return a.title.localeCompare(b.title);
      case 'reads': return b.stats.views - a.stats.views;
      default: return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  const allTags = Array.from(new Set(writingPieces.flatMap(piece => piece.tags)));
  const allCategories = Array.from(new Set(writingPieces.map(piece => piece.category)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterDifficulty('all');
    setSelectedTags([]);
    setSearchQuery('');
  };

  const getTypeIcon = (type: WritingPieceType) => {
    const iconMap: Record<WritingPieceType, React.ComponentType<any>> = {
      guide: BookOpen, tutorial: PenTool, essay: FileText, article: FileText,
      poem: Edit3, story: BookMarked, lesson: Users, research: TrendingUp
    };
    const Icon = iconMap[type] || FileText;
    return <Icon size={14} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  const getDifficultyColor = (difficulty?: string) => {
    const colors = {
      beginner: '#38a169', intermediate: '#d69e2e', advanced: '#e53e3e'
    };
    return colors[difficulty as keyof typeof colors] || '#718096';
  };

  const FilterSelect = ({ value, onChange, children }: any) => (
    <select 
      value={value} 
      onChange={onChange}
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
        background: 'white',
        fontSize: '0.875rem',
        color: '#2d3748'
      }}
    >
      {children}
    </select>
  );

  return (
    <PageContainer>
      {/* Hero Header */}
      <WritingHeader>
        <HeaderContent>
          <HeaderTitle>Writing Portfolio</HeaderTitle>
          <HeaderSubtitle>
            Discover comprehensive guides, creative works, and educational resources crafted by educators, writers, and researchers.
          </HeaderSubtitle>
          <BaseButton $variant="secondary" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Plus size={20} />
            Create New Piece
          </BaseButton>
        </HeaderContent>
      </WritingHeader>

      <ContentWrapper>
        {/* Stats Section - Using modular Grid */}
        <StyledGrid $columns={4} $gap="1.5rem" style={{ margin: '3rem 0' }}>
          {[
            { value: stats.totalPieces, label: 'Total Pieces', icon: TrendingUp, change: `+${stats.publishedThisMonth} this month` },
            { value: formatNumber(stats.totalViews), label: 'Total Views', icon: Eye, change: `+${stats.engagementRate}% engagement` },
            { value: formatNumber(stats.totalLikes), label: 'Total Likes', icon: Heart, change: `${((stats.totalLikes / stats.totalViews) * 100).toFixed(1)}% rate` },
            { value: `${stats.averageReadTime}m`, label: 'Avg Read Time', icon: Clock, change: 'Per piece' }
          ].map((stat, index) => (
            <Card key={index} $hover $padding="lg" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#718096', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#38a169', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <stat.icon size={12} />
                {stat.change}
              </div>
            </Card>
          ))}
        </StyledGrid>

        {/* Filters Section - Using modular Card */}
        <Card $padding="lg" style={{ marginBottom: '2rem' }}>
          <FlexRow $gap="1rem" $justify="space-between">
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '300px', maxWidth: '400px' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', pointerEvents: 'none' }} size={20} />
              <Input
                type="text"
                placeholder="Search writing pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Controls */}
            <FlexRow $gap="1rem" $responsive={false}>
              <FilterSelect value={filterType} onChange={(e: any) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="guide">Guides</option>
                <option value="tutorial">Tutorials</option>
                <option value="essay">Essays</option>
                <option value="poem">Poetry</option>
                <option value="story">Stories</option>
                <option value="lesson">Lessons</option>
                <option value="research">Research</option>
              </FilterSelect>

              <FilterSelect value={filterCategory} onChange={(e: any) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FilterSelect>

              <FilterSelect value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
                <option value="reads">Most Read</option>
              </FilterSelect>

              <BaseButton $variant="ghost" onClick={() => setShowFilters(!showFilters)} $size="sm">
                <Filter size={16} />
                Filters
                {selectedTags.length > 0 && <Badge style={{ marginLeft: '0.5rem' }}>{selectedTags.length}</Badge>}
              </BaseButton>

              {/* View Toggle */}
              <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                {['grid', 'list'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'grid' | 'list')}
                    style={{
                      padding: '0.5rem',
                      background: viewMode === mode ? '#667eea' : 'white',
                      color: viewMode === mode ? 'white' : '#718096',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {mode === 'grid' ? <Grid size={16} /> : <List size={16} />}
                  </button>
                ))}
              </div>
            </FlexRow>
          </FlexRow>

          {/* Tag Filters */}
          {showFilters && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.75rem' }}>
                Filter by Tags:
              </div>
              <FlexRow $gap="0.5rem">
                {allTags.map(tag => (
                  <TagChip
                    key={tag}
                    $selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </TagChip>
                ))}
              </FlexRow>
              {(selectedTags.length > 0 || filterType !== 'all' || filterCategory !== 'all' || filterDifficulty !== 'all') && (
                <BaseButton $variant="ghost" onClick={clearFilters} $size="sm" style={{ marginTop: '1rem' }}>
                  Clear All Filters
                </BaseButton>
              )}
            </div>
          )}
        </Card>

        {/* Results Info */}
        <FlexRow $justify="space-between" style={{ marginBottom: '1.5rem' }}>
          <BodyText $size="sm" style={{ color: '#718096', margin: 0 }}>
            Showing {filteredPieces.length} of {writingPieces.length} pieces
          </BodyText>
          {loading && (
            <FlexRow $gap="0.5rem" $responsive={false}>
              <Loader2 size={16} className="animate-spin" />
              <span style={{ color: '#718096' }}>Loading...</span>
            </FlexRow>
          )}
        </FlexRow>

        {/* Writing Grid */}
        {filteredPieces.length === 0 ? (
          <EmptyState>
            <BookOpen size={48} style={{ color: '#cbd5e0', marginBottom: '1rem' }} />
            <h3>No pieces found</h3>
            <p>
              {searchQuery || selectedTags.length > 0 || filterType !== 'all' || filterCategory !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your search criteria or clearing filters'
                : 'Start creating your first writing piece to showcase your work'
              }
            </p>
            {(searchQuery || selectedTags.length > 0 || filterType !== 'all' || filterCategory !== 'all' || filterDifficulty !== 'all') && (
              <BaseButton onClick={clearFilters} $variant="secondary">Clear Filters</BaseButton>
            )}
          </EmptyState>
        ) : (
          <WritingGrid $viewMode={viewMode}>
            {filteredPieces.map(piece => (
              <WritingCard key={piece.id} $featured={piece.featured}>
                {/* Card Header */}
                <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                  <FlexRow $justify="space-between" $responsive={false} style={{ marginBottom: '0.75rem' }}>
                    <TypeBadge $type={piece.type}>
                      {getTypeIcon(piece.type)}
                      {piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}
                    </TypeBadge>
                    {piece.difficulty && (
                      <Badge style={{ 
                        background: `${getDifficultyColor(piece.difficulty)}20`,
                        color: getDifficultyColor(piece.difficulty),
                        fontSize: '0.75rem'
                      }}>
                        {piece.difficulty}
                      </Badge>
                    )}
                  </FlexRow>

                  <h3 
                    onClick={() => setSelectedPiece(piece)}
                    style={{
                      fontSize: '1.25rem', fontWeight: '600', color: '#1a202c',
                      margin: '0.75rem 0 0.5rem 0', lineHeight: '1.4', cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#667eea'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#1a202c'}
                  >
                    {piece.title}
                  </h3>

                  <p style={{ color: '#4a5568', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {piece.excerpt}
                  </p>

                  {/* Meta Info */}
                  <FlexRow $gap="1rem" $responsive={false} style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '1rem' }}>
                    <FlexRow $gap="0.25rem" $responsive={false}>
                      <Calendar size={12} />
                      {formatDate(piece.publishedAt)}
                    </FlexRow>
                    <FlexRow $gap="0.25rem" $responsive={false}>
                      <Clock size={12} />
                      {piece.readTime} min read
                    </FlexRow>
                    <FlexRow $gap="0.25rem" $responsive={false}>
                      <Tag size={12} />
                      {piece.category}
                    </FlexRow>
                  </FlexRow>

                  {/* Tags */}
                  <FlexRow $gap="0.5rem" style={{ marginBottom: '1rem' }}>
                    {piece.tags.slice(0, 3).map(tag => (
                      <TagChip key={tag} style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem' }}>
                        {tag}
                      </TagChip>
                    ))}
                    {piece.tags.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                        +{piece.tags.length - 3} more
                      </span>
                    )}
                  </FlexRow>
                </div>

                {/* Author Section */}
                <AuthorSection>
                  <AuthorAvatar>{piece.author.name.charAt(0)}</AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>{piece.author.name}</AuthorName>
                    <AuthorRole>{piece.author.role}</AuthorRole>
                  </AuthorInfo>
                </AuthorSection>

                {/* Stats Footer */}
                <FlexRow $justify="space-between" style={{ padding: '1rem 1.5rem', background: '#f7fafc', borderTop: '1px solid #e2e8f0' }}>
                  <FlexRow $gap="1rem" $responsive={false} style={{ fontSize: '0.75rem', color: '#718096' }}>
                    <FlexRow $gap="0.25rem" $responsive={false}><Eye size={12} />{formatNumber(piece.stats.views)}</FlexRow>
                    <FlexRow $gap="0.25rem" $responsive={false}><Heart size={12} />{piece.stats.likes}</FlexRow>
                    <FlexRow $gap="0.25rem" $responsive={false}><MessageSquare size={12} />{piece.stats.comments}</FlexRow>
                    <FlexRow $gap="0.25rem" $responsive={false}><Download size={12} />{piece.stats.downloads}</FlexRow>
                  </FlexRow>
                  
                  <FlexRow $gap="0.5rem" $responsive={false}>
                    <ActionButton title="Share"><Share2 size={14} /></ActionButton>
                    <ActionButton title="Download"><Download size={14} /></ActionButton>
                    <ActionButton title="Like"><Heart size={14} /></ActionButton>
                  </FlexRow>
                </FlexRow>
              </WritingCard>
            ))}
          </WritingGrid>
        )}

        {/* Load More */}
        {filteredPieces.length > 0 && filteredPieces.length >= 12 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <BaseButton $variant="secondary" onClick={() => setLoading(true)}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading More...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Load More Pieces
                </>
              )}
            </BaseButton>
          </div>
        )}

        {/* Top Categories */}
        <div style={{ marginTop: '4rem' }}>
          <Heading2>Popular Categories</Heading2>
          <StyledGrid $minWidth="200px" $gap="1rem">
            {stats.topCategories.map(category => (
              <Card key={category.name} $padding="lg" style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  {category.name}
                </h3>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea', marginBottom: '0.5rem' }}>
                  {category.count}
                </div>
                <ProgressBar style={{ marginBottom: '0.5rem' }}>
                  <ProgressFill $percentage={category.percentage} $color="#667eea" />
                </ProgressBar>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                  {category.percentage}% of total
                </div>
              </Card>
            ))}
          </StyledGrid>
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <Heading2>Recent Activity</Heading2>
          <Card $padding="lg">
            {stats.recentActivity.map((activity, index) => (
              <FlexRow key={index} $gap="1rem" style={{ 
                padding: '0.75rem 0',
                borderBottom: index < stats.recentActivity.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: (() => {
                    const backgrounds = {
                      published: '#e6fffa', updated: '#f0fff4', liked: '#fff5f5', commented: '#faf5ff'
                    };
                    return backgrounds[activity.type as keyof typeof backgrounds] || '#f7fafc';
                  })(),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: (() => {
                    const colors = {
                      published: '#319795', updated: '#38a169', liked: '#e53e3e', commented: '#805ad5'
                    };
                    return colors[activity.type as keyof typeof colors] || '#4a5568';
                  })()
                }}>
                  {activity.type === 'published' && <Upload size={16} />}
                  {activity.type === 'updated' && <Edit3 size={16} />}
                  {activity.type === 'liked' && <Heart size={16} />}
                  {activity.type === 'commented' && <MessageSquare size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2d3748' }}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} "{activity.title}"
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                    {formatDate(activity.date)}
                  </div>
                </div>
              </FlexRow>
            ))}
          </Card>
        </div>
      </ContentWrapper>

      {/* Modal */}
      {selectedPiece && (
        <Modal $isOpen={true}>
          <ModalOverlay $isOpen={true} onClick={() => setSelectedPiece(null)} />
          <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <ModalHeader>
              <div>
                <ModalTitle>{selectedPiece.title}</ModalTitle>
                <FlexRow $gap="1rem" $responsive={false} style={{ marginTop: '0.5rem' }}>
                  <TypeBadge $type={selectedPiece.type}>
                    {getTypeIcon(selectedPiece.type)}
                    {selectedPiece.type.charAt(0).toUpperCase() + selectedPiece.type.slice(1)}
                  </TypeBadge>
                  {selectedPiece.difficulty && (
                    <Badge style={{ 
                      background: `${getDifficultyColor(selectedPiece.difficulty)}20`,
                      color: getDifficultyColor(selectedPiece.difficulty)
                    }}>
                      {selectedPiece.difficulty}
                    </Badge>
                  )}
                  <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                    {selectedPiece.readTime} min read
                  </span>
                </FlexRow>
              </div>
              <button 
                onClick={() => setSelectedPiece(null)}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0.5rem', borderRadius: '4px', color: '#718096'
                }}
              >
                <X size={24} />
              </button>
            </ModalHeader>
            
            <ModalBody>
              <AuthorSection style={{ padding: 0, marginBottom: '1rem' }}>
                <AuthorAvatar>{selectedPiece.author.name.charAt(0)}</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>{selectedPiece.author.name}</AuthorName>
                  <AuthorRole>{selectedPiece.author.role}</AuthorRole>
                </AuthorInfo>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                  {formatDate(selectedPiece.publishedAt)}
                </div>
              </AuthorSection>
              
              <BodyText style={{ marginBottom: '1.5rem' }}>{selectedPiece.excerpt}</BodyText>
              
              <FlexRow $gap="0.5rem" style={{ marginBottom: '1.5rem' }}>
                {selectedPiece.tags.map(tag => (
                  <TagChip key={tag} style={{ fontSize: '0.75rem' }}>{tag}</TagChip>
                ))}
              </FlexRow>
              
              <Card $padding="md" style={{ background: '#f7fafc', marginBottom: '1.5rem' }}>
                <StyledGrid $columns={4} $gap="1rem" style={{ fontSize: '0.875rem' }}>
                  {[
                    { label: 'Views', value: formatNumber(selectedPiece.stats.views) },
                    { label: 'Likes', value: selectedPiece.stats.likes },
                    { label: 'Comments', value: selectedPiece.stats.comments },
                    { label: 'Downloads', value: selectedPiece.stats.downloads }
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>{stat.value}</div>
                      <div style={{ color: '#718096' }}>{stat.label}</div>
                    </div>
                  ))}
                </StyledGrid>
              </Card>
              
              <BodyText style={{ lineHeight: '1.7' }}>
                This is where the full content of the piece would be displayed. The content would be rendered from the piece's content field, which could include formatted text, images, code blocks, and other rich media depending on the type of writing piece.
              </BodyText>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}