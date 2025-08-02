'use client'
// src\app\dashboard\writing\page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  BookOpen, 
  PenTool, 
  FileText, 
  Users, 
  TrendingUp, 
  Award,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Download,
  Edit3,
  Calendar,
  Tag,
  Star,
  ChevronDown,
  Upload,
  Clock,
  User,
  BookMarked,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react';

// Import your existing styled components
import {
  PageContainer,
  ContentWrapper,
  Card,
  CardContent,
  BaseButton,
  Grid as StyledGrid,
  FlexRow,
  FlexColumn,
  Badge,
  TabContainer,
  TabButton,
  Input,
  LoadingContainer,
  EmptyState,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ProgressBar,
  ProgressFill
} from '@/styles/styled-components';

// Types that integrate with your existing portfolio system
type WritingPieceType = 'essay' | 'guide' | 'tutorial' | 'poem' | 'story' | 'article' | 'lesson' | 'research';

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

// Mock data that fits your educational and creative portfolio types
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

// Styled components specific to writing portfolio
const WritingHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    opacity: 0.1;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const HeaderTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: ${props => props.$positive ? '#38a169' : '#e53e3e'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 400px;
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  pointer-events: none;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #2d3748;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem;
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#718096'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#667eea' : '#f7fafc'};
  }
`;

const TagsSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const TagsLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TagChip = styled.button<{ $selected?: boolean }>`
  padding: 0.25rem 0.75rem;
  background: ${props => props.$selected ? '#667eea' : '#f7fafc'};
  color: ${props => props.$selected ? 'white' : '#4a5568'};
  border: 1px solid ${props => props.$selected ? '#667eea' : '#e2e8f0'};
  border-radius: 999px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$selected ? '#5a67d8' : '#edf2f7'};
  }
`;

const WritingGrid = styled.div<{ $viewMode: 'grid' | 'list' }>`
  display: ${props => props.$viewMode === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: ${props => props.$viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : 'none'};
  flex-direction: ${props => props.$viewMode === 'list' ? 'column' : 'row'};
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WritingCard = styled(Card)<{ $featured?: boolean }>`
  position: relative;
  border: ${props => props.$featured ? '2px solid #ffd700' : '1px solid #e2e8f0'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.15);
  }
  
  ${props => props.$featured && `
    &::before {
      content: '⭐ Featured';
      position: absolute;
      top: -1px;
      right: 1rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #744210;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 0 0 6px 6px;
      z-index: 1;
    }
  `}
`;

const CardHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
`;

const TypeBadge = styled(Badge)<{ $type: WritingPieceType }>`
  background: ${props => {
    const typeColors: Record<WritingPieceType, string> = {
      guide: '#e6fffa',
      tutorial: '#f0fff4',
      essay: '#faf5ff',
      poem: '#fff5f5',
      story: '#f7fafc',
      article: '#fffbeb',
      lesson: '#f0f9ff',
      research: '#fef5e7'
    };
    return typeColors[props.$type] || '#f7fafc';
  }};
  color: ${props => {
    const typeColors: Record<WritingPieceType, string> = {
      guide: '#319795',
      tutorial: '#38a169',
      essay: '#805ad5',
      poem: '#e53e3e',
      story: '#4a5568',
      article: '#d69e2e',
      lesson: '#3182ce',
      research: '#dd6b20'
    };
    return typeColors[props.$type] || '#4a5568';
  }};
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0.75rem 0 0.5rem 0;
  line-height: 1.4;
  cursor: pointer;
  
  &:hover {
    color: #667eea;
  }
`;

const CardExcerpt = styled.p`
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
`;

const StatsLeft = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #718096;
`;

const StatsRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #edf2f7;
    color: #4a5568;
  }
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem 1rem 1.5rem;
`;

const AuthorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
`;

const AuthorRole = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

export default function WritingPortfolioSystem() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title' | 'reads'>('newest');
  const [writingPieces, setWritingPieces] = useState<WritingPiece[]>(mockWritingPieces);
  const [stats, setStats] = useState<WritingStats>(mockStats);
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
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => piece.tags.includes(tag));
    
    return matchesSearch && matchesType && matchesCategory && matchesDifficulty && matchesTags;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stats.views - a.stats.views;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'reads':
        return b.stats.views - a.stats.views;
      default: // newest
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  // Get all available tags and categories
  const allTags = Array.from(new Set(writingPieces.flatMap(piece => piece.tags)));
  const allCategories = Array.from(new Set(writingPieces.map(piece => piece.category)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
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
      guide: BookOpen,
      tutorial: PenTool,
      essay: FileText,
      article: FileText,
      poem: Edit3,
      story: BookMarked,
      lesson: Users,
      research: TrendingUp
    };
    const Icon = iconMap[type] || FileText;
    return <Icon size={14} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return '#38a169';
      case 'intermediate': return '#d69e2e';
      case 'advanced': return '#e53e3e';
      default: return '#718096';
    }
  };

  const openPieceModal = (piece: WritingPiece) => {
    setSelectedPiece(piece);
  };

  const closePieceModal = () => {
    setSelectedPiece(null);
  };

  return (
    <PageContainer>
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
        {/* Stats Section */}
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalPieces}</StatValue>
            <StatLabel>Total Pieces</StatLabel>
            <StatChange $positive={true}>
              <TrendingUp size={12} />
              +{stats.publishedThisMonth} this month
            </StatChange>
          </StatCard>
          
          <StatCard>
            <StatValue>{formatNumber(stats.totalViews)}</StatValue>
            <StatLabel>Total Views</StatLabel>
            <StatChange $positive={true}>
              <Eye size={12} />
              +{stats.engagementRate}% engagement
            </StatChange>
          </StatCard>
          
          <StatCard>
            <StatValue>{formatNumber(stats.totalLikes)}</StatValue>
            <StatLabel>Total Likes</StatLabel>
            <StatChange $positive={true}>
              <Heart size={12} />
              {((stats.totalLikes / stats.totalViews) * 100).toFixed(1)}% rate
            </StatChange>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.averageReadTime}m</StatValue>
            <StatLabel>Avg Read Time</StatLabel>
            <StatChange>
              <Clock size={12} />
              Per piece
            </StatChange>
          </StatCard>
        </StatsGrid>

        {/* Filters Section */}
        <FilterSection>
          <FilterRow>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search writing pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>

            <FilterControls>
              <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="guide">Guides</option>
                <option value="tutorial">Tutorials</option>
                <option value="essay">Essays</option>
                <option value="poem">Poetry</option>
                <option value="story">Stories</option>
                <option value="lesson">Lessons</option>
                <option value="research">Research</option>
              </FilterSelect>

              <FilterSelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </FilterSelect>

              <FilterSelect value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </FilterSelect>

              <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
                <option value="reads">Most Read</option>
              </FilterSelect>

              <BaseButton 
                $variant="ghost" 
                onClick={() => setShowFilters(!showFilters)}
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Filter size={16} />
                Filters
                {selectedTags.length > 0 && (
                  <Badge style={{ marginLeft: '0.5rem' }}>
                    {selectedTags.length}
                  </Badge>
                )}
              </BaseButton>

              <ViewToggle>
                <ViewButton $active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                  <Grid size={16} />
                </ViewButton>
                <ViewButton $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                  <List size={16} />
                </ViewButton>
              </ViewToggle>
            </FilterControls>
          </FilterRow>

          {showFilters && (
            <TagsSection>
              <TagsLabel>Filter by Tags:</TagsLabel>
              <TagsContainer>
                {allTags.map(tag => (
                  <TagChip
                    key={tag}
                    $selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </TagChip>
                ))}
              </TagsContainer>
              {(selectedTags.length > 0 || filterType !== 'all' || filterCategory !== 'all' || filterDifficulty !== 'all') && (
                <BaseButton 
                  $variant="ghost" 
                  onClick={clearFilters}
                  style={{ marginTop: '1rem', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                >
                  Clear All Filters
                </BaseButton>
              )}
            </TagsSection>
          )}
        </FilterSection>

        {/* Results Info */}
        <FlexRow style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
          <div style={{ color: '#718096', fontSize: '0.875rem' }}>
            Showing {filteredPieces.length} of {writingPieces.length} pieces
          </div>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#718096' }}>
              <Loader2 size={16} className="animate-spin" />
              Loading...
            </div>
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
              <BaseButton onClick={clearFilters} $variant="secondary">
                Clear Filters
              </BaseButton>
            )}
          </EmptyState>
        ) : (
          <WritingGrid $viewMode={viewMode}>
            {filteredPieces.map(piece => (
              <WritingCard key={piece.id} $featured={piece.featured} $hover>
                <CardHeader>
                  <FlexRow style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
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

                  <CardTitle onClick={() => openPieceModal(piece)}>
                    {piece.title}
                  </CardTitle>

                  <CardExcerpt>{piece.excerpt}</CardExcerpt>

                  <CardMeta>
                    <MetaItem>
                      <Calendar size={12} />
                      {formatDate(piece.publishedAt)}
                    </MetaItem>
                    <MetaItem>
                      <Clock size={12} />
                      {piece.readTime} min read
                    </MetaItem>
                    <MetaItem>
                      <Tag size={12} />
                      {piece.category}
                    </MetaItem>
                  </CardMeta>

                  {/* Tags */}
                  <TagsContainer style={{ marginBottom: '1rem' }}>
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
                  </TagsContainer>
                </CardHeader>

                <AuthorSection>
                  <AuthorAvatar>
                    {piece.author.name.charAt(0)}
                  </AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>{piece.author.name}</AuthorName>
                    <AuthorRole>{piece.author.role}</AuthorRole>
                  </AuthorInfo>
                </AuthorSection>

                <CardStats>
                  <StatsLeft>
                    <MetaItem>
                      <Eye size={12} />
                      {formatNumber(piece.stats.views)}
                    </MetaItem>
                    <MetaItem>
                      <Heart size={12} />
                      {piece.stats.likes}
                    </MetaItem>
                    <MetaItem>
                      <MessageSquare size={12} />
                      {piece.stats.comments}
                    </MetaItem>
                    <MetaItem>
                      <Download size={12} />
                      {piece.stats.downloads}
                    </MetaItem>
                  </StatsLeft>
                  
                  <StatsRight>
                    <ActionButton title="Share">
                      <Share2 size={14} />
                    </ActionButton>
                    <ActionButton title="Download">
                      <Download size={14} />
                    </ActionButton>
                    <ActionButton title="Like">
                      <Heart size={14} />
                    </ActionButton>
                  </StatsRight>
                </CardStats>
              </WritingCard>
            ))}
          </WritingGrid>
        )}

        {/* Load More Button */}
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

        {/* Top Categories Section */}
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a202c' }}>
            Popular Categories
          </h2>
          <StyledGrid $minWidth="200px" $gap="1rem">
            {stats.topCategories.map(category => (
              <Card key={category.name} $hover style={{ padding: '1.5rem', textAlign: 'center' }}>
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

        {/* Recent Activity Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a202c' }}>
            Recent Activity
          </h2>
          <Card style={{ padding: '1.5rem' }}>
            {stats.recentActivity.map((activity, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '0.75rem 0',
                borderBottom: index < stats.recentActivity.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: (() => {
                    switch (activity.type) {
                      case 'published': return '#e6fffa';
                      case 'updated': return '#f0fff4';
                      case 'liked': return '#fff5f5';
                      case 'commented': return '#faf5ff';
                      default: return '#f7fafc';
                    }
                  })(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: (() => {
                    switch (activity.type) {
                      case 'published': return '#319795';
                      case 'updated': return '#38a169';
                      case 'liked': return '#e53e3e';
                      case 'commented': return '#805ad5';
                      default: return '#4a5568';
                    }
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
              </div>
            ))}
          </Card>
        </div>
      </ContentWrapper>

      {/* Piece Detail Modal */}
      {selectedPiece && (
        <Modal $isOpen={true}>
          <ModalOverlay onClick={closePieceModal} />
          <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <ModalHeader>
              <div>
                <ModalTitle>{selectedPiece.title}</ModalTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
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
                </div>
              </div>
              <button 
                onClick={closePieceModal}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  color: '#718096'
                }}
              >
                <X size={24} />
              </button>
            </ModalHeader>
            
            <ModalBody>
              <div style={{ marginBottom: '1.5rem' }}>
                <AuthorSection style={{ padding: 0, marginBottom: '1rem' }}>
                  <AuthorAvatar>
                    {selectedPiece.author.name.charAt(0)}
                  </AuthorAvatar>
                  <AuthorInfo>
                    <AuthorName>{selectedPiece.author.name}</AuthorName>
                    <AuthorRole>{selectedPiece.author.role}</AuthorRole>
                  </AuthorInfo>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                    {formatDate(selectedPiece.publishedAt)}
                  </div>
                </AuthorSection>
                
                <p style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {selectedPiece.excerpt}
                </p>
                
                <TagsContainer style={{ marginBottom: '1.5rem' }}>
                  {selectedPiece.tags.map(tag => (
                    <TagChip key={tag} style={{ fontSize: '0.75rem' }}>
                      {tag}
                    </TagChip>
                  ))}
                </TagsContainer>
                
                <div style={{ 
                  background: '#f7fafc', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                    gap: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {formatNumber(selectedPiece.stats.views)}
                      </div>
                      <div style={{ color: '#718096' }}>Views</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {selectedPiece.stats.likes}
                      </div>
                      <div style={{ color: '#718096' }}>Likes</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {selectedPiece.stats.comments}
                      </div>
                      <div style={{ color: '#718096' }}>Comments</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {selectedPiece.stats.downloads}
                      </div>
                      <div style={{ color: '#718096' }}>Downloads</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  color: '#4a5568', 
                  lineHeight: '1.7',
                  fontSize: '1rem'
                }}>
                  <p>This is where the full content of the piece would be displayed. The content would be rendered from the piece's content field, which could include formatted text, images, code blocks, and other rich media depending on the type of writing piece.</p>
                  
                  <p>For educational content, this might include step-by-step instructions, examples, exercises, and additional resources. For creative writing, it would display the full story, poem, or essay with proper formatting.</p>
                  
                  <p>The modal provides a focused reading experience while maintaining easy access to piece metadata, author information, and engagement statistics.</p>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}