// src/app/dashboard/writing/writing.styles.ts
import styled from 'styled-components';
import { Card, Badge, Input } from '@/styles/styled-components'; 
import { Search } from 'lucide-react';

// Define local type for writing piece categories
type WritingPieceType = 
  | 'guide' | 'tutorial' | 'essay' | 'poem' 
  | 'story' | 'article' | 'lesson' | 'research';


export const ProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $color }) => 
    $color || 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600))'};
  transition: width 0.6s ease;
  border-radius: var(--radius-full);
`;

export const WritingHeader = styled.div`
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

export const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

export const HeaderTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const HeaderSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
`;

export const StatCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

export const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: ${props => props.$positive ? '#38a169' : '#e53e3e'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

export const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
`;

export const FilterRow = styled.div`
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

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 400px;
`;

export const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

export const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  pointer-events: none;
`;

export const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.875rem;
  color: #2d3748;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 1px var(--color-primary-500);
  }
`;

export const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
`;

export const ViewButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem;
  background: ${props => props.$active ? '#667eea' : 'white'};
  color: ${props => props.$active ? 'white' : '#718096'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#5a67d8' : '#f7fafc'};
  }
`;

export const TagsSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

export const TagsLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TagChip = styled.button<{ $selected?: boolean }>`
  padding: 0.25rem 0.75rem;
  background: ${props => props.$selected ? '#667eea' : '#f7fafc'};
  color: ${props => props.$selected ? 'white' : '#4a5568'};
  border: 1px solid ${props => props.$selected ? '#667eea' : '#e2e8f0'};
  border-radius: 999px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$selected ? '#5a67d8' : '#edf2f7'};
  }
`;

export const WritingGrid = styled.div<{ $viewMode: 'grid' | 'list' }>`
  display: ${props => props.$viewMode === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: ${props => props.$viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : 'none'};
  flex-direction: ${props => props.$viewMode === 'list' ? 'column' : 'row'};
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const WritingCard = styled(Card)<{ $featured?: boolean }>`
  position: relative;
  border: ${props => props.$featured ? '2px solid #ffd700' : '1px solid #e2e8f0'};
  transition: all 0.3s ease;
  overflow: hidden;
  
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

export const CardHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
`;

export const TypeBadge = styled(Badge)<{ $type: WritingPieceType }>`
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

export const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0.75rem 0 0.5rem 0;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #667eea;
  }
`;

export const CardExcerpt = styled.p`
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 1rem;
`;

export const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const CardStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
`;

export const StatsLeft = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #718096;
`;

export const StatsRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button`
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #edf2f7;
    color: #4a5568;
  }
`;

export const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem 1rem 1.5rem;
`;

export const AuthorAvatar = styled.div`
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

export const AuthorInfo = styled.div`
  flex: 1;
`;

export const AuthorName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
`;

export const AuthorRole = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;