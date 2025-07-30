// =============================================================================
// src/components/writing/writingStyles.tsx
'use client';
import styled from 'styled-components';

// Types for styled components
type DisplayMode = 'grid' | 'list';

// Main Container
export const PageContainer = styled.div`
  --bg-start: #f8fafc;
  --bg-end: #e2e8f0;
  --primary-color: #2c2c2c;
  --secondary-color: #64748b;
  --accent-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --border-radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
  min-height: 100vh;
  font-family: 'Work Sans', sans-serif;
  color: var(--primary-color);
`;

// Header Components
export const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-sm);
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 1rem;
  }
`;

export const HeaderBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

export const TitleSection = styled.div``;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
`;

export const PageSubtitle = styled.p`
  font-size: 1rem;
  color: var(--secondary-color);
  margin: 0;
`;

export const QuickStats = styled.div`
  display: flex;
  gap: 2rem;
`;

export const QuickStatItem = styled.div`
  text-align: center;
`;

export const QuickStatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-color);
`;

export const QuickStatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

// View Mode Toggle
export const ViewModeToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

export const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--accent-color)' : 'var(--secondary-color)'};
  font-weight: ${({ $active }) => $active ? '500' : '400'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? 'var(--shadow-sm)' : 'none'};
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

// Controls
export const ControlsRight = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const SearchInput = styled.input`
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${({ $active }) => $active ? 'var(--accent-color)' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border: 1px solid ${({ $active }) => $active ? 'var(--accent-color)' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : '#f9fafb'};
    border-color: ${({ $active }) => $active ? '#2563eb' : '#d1d5db'};
  }
`;

export const FilterBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--error-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
`;

export const DisplayToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

export const DisplayButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--primary-color)' : 'var(--secondary-color)'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#e5e7eb'};
  }
`;

// Filter Panel
export const FilterPanel = styled.div`
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

export const FilterSection = styled.div``;

export const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

export const FilterOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const FilterChip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => $active ? 'var(--accent-color)' : '#e5e7eb'};
  background: ${({ $active }) => $active ? 'var(--accent-color)' : 'white'};
  color: ${({ $active }) => $active ? 'white' : 'var(--secondary-color)'};
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : '#f3f4f6'};
  }
`;

export const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TagChip = styled(FilterChip)`
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
`;

export const ClearFiltersButton = styled.button`
  grid-column: 1 / -1;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: var(--secondary-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

// Navigation Tabs
export const NavigationTabs = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

export const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid ${({ $isActive }) => ($isActive ? 'var(--accent-color)' : 'var(--primary-color)')};
  border-radius: var(--border-radius);
  background: ${({ $isActive }) => ($isActive ? 'var(--accent-color)' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? 'white' : 'var(--primary-color)')};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  
  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

// Content Area
export const ContentArea = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Book Components
export const BooksGrid = styled.div<{ $displayMode: DisplayMode }>`
  display: grid;
  grid-template-columns: ${({ $displayMode }) => 
    $displayMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'};
  gap: 1.5rem;
`;

export const BookCard = styled.div<{ $primaryColor: string; $secondaryColor: string }>`
  --icon-color: ${({ $primaryColor }) => $primaryColor};
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ $primaryColor }) => $primaryColor}, ${({ $secondaryColor }) => $secondaryColor});
  }
`;

export const IconContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

export const BookTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0.5rem 0;
  color: var(--primary-color);
`;

export const BookYear = styled.span`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

export const CategoryBadge = styled.span`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: var(--secondary-color);
  border-radius: 999px;
  font-size: 0.75rem;
`;

export const ProgressIndicator = styled.div`
  margin-top: 1rem;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

// Concept Components
export const ConceptsGrid = styled.div<{ $displayMode: DisplayMode }>`
  display: grid;
  grid-template-columns: ${({ $displayMode }) => 
    $displayMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))'};
  gap: 1.5rem;
`;

export const ConceptItemCard = styled.div<{ $hasProgress: boolean }>`
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid ${({ $hasProgress }) => $hasProgress ? 'var(--accent-color)' : '#e2e8f0'};
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

export const ConceptItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

export const ConceptItemTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  flex: 1;
`;

export const AddToPortfolioButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: scale(1.1);
  }
`;

export const ConceptItemDescription = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

export const ConceptItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.813rem;
  color: var(--secondary-color);
`;

export const DifficultyBadge = styled.span<{ $difficulty: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ $difficulty }) => 
    $difficulty === 'beginner' ? '#dbeafe' :
    $difficulty === 'intermediate' ? '#fef3c7' :
    $difficulty === 'advanced' ? '#fee2e2' : '#f3f4f6'};
  color: ${({ $difficulty }) => 
    $difficulty === 'beginner' ? '#1e40af' :
    $difficulty === 'intermediate' ? '#92400e' :
    $difficulty === 'advanced' ? '#991b1b' : '#374151'};
`;

export const ConceptProgress = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.813rem;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ $status }) => 
    $status === 'completed' ? '#d1fae5' :
    $status === 'in-progress' ? '#fef3c7' :
    '#f3f4f6'};
  color: ${({ $status }) => 
    $status === 'completed' ? '#065f46' :
    $status === 'in-progress' ? '#92400e' :
    '#6b7280'};
`;

export const ScoreBadge = styled.span`
  font-weight: 600;
  color: var(--success-color);
`;

// Progress Dashboard Components
export const ProgressDashboard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e5e7eb;
  text-align: center;
`;

export const StatIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: var(--accent-color);
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

export const ProgressBar = styled.div`
  position: relative;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: linear-gradient(90deg, var(--accent-color), var(--success-color));
  transition: width 0.5s ease;
`;

export const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
`;

export const ConceptList = styled.div<{ $displayMode: DisplayMode }>`
  display: ${({ $displayMode }) => $displayMode === 'list' ? 'flex' : 'grid'};
  ${({ $displayMode }) => $displayMode === 'list' 
    ? 'flex-direction: column; gap: 1rem;' 
    : 'grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;'};
`;

export const ConceptCard = styled.div<{ $status?: string }>`
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid ${({ $status }) => 
    $status === 'completed' ? 'var(--success-color)' :
    $status === 'in-progress' ? 'var(--warning-color)' :
    '#e5e7eb'};
  transition: all 0.2s;
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

export const ConceptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

export const ConceptTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
`;

export const ConceptDescription = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

export const ConceptFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const AchievementsSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

// Loading and Error States
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--secondary-color);
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingText = styled.p`
  font-size: 1.125rem;
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`;

export const ErrorIcon = styled.div`
  color: var(--error-color);
`;

export const ErrorTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
`;

export const ErrorMessage = styled.p`
  color: var(--secondary-color);
  max-width: 400px;
`;

export const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 1rem;
  
  &:hover {
    opacity: 0.9;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
`;

export const EmptyMessage = styled.p`
  color: var(--secondary-color);
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
`;

export const CreatePortfolioButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;