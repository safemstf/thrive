// src/components/dashboard/dashboardStyles.tsx - Greyscale Refined & Elegant Version
import styled, { css, keyframes } from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';


export const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  width: 100%;
`;

export const ToolIcon = styled.div<{ status?: 'active' | 'pending' | 'inactive' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.md};
  background: ${({ status }) => 
    status === 'active' ? theme.colors.accent.cyan : 
    status === 'pending' ? theme.colors.accent.amber : 
    theme.colors.background.tertiary};
  color: ${({ status }) => 
    status === 'active' ? theme.colors.text.inverse : 
    status === 'pending' ? theme.colors.text.primary : 
    theme.colors.text.tertiary};
`;

export const ToolTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
`;

export const ToolDescription = styled.p`
  margin: 0;
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeights.relaxed};
`;

export const ToolActionButton = styled.button<{ status?: 'active' | 'pending' | 'inactive' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: none;
  border: none;
  color: ${({ status }) => 
    status === 'active' ? theme.colors.primary[600] : 
    status === 'pending' ? theme.colors.accent.amber : 
    theme.colors.text.tertiary};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  cursor: ${({ status }) => status !== 'inactive' ? 'pointer' : 'not-allowed'};
  transition: ${theme.transitions.normal};
  border-radius: ${theme.borderRadius.xs};

  &:hover {
    background: ${({ status }) => 
      status !== 'inactive' ? themeUtils.alpha(theme.colors.primary[600], 0.1) : 'none'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  ${({ status }) => status === 'pending' && css`
    &:hover {
      background: ${themeUtils.alpha(theme.colors.accent.amber, 0.1)};
    }
  `}
`;

export const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.lg} 0;
  margin-bottom: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.subtle};

  .filter-group {
    display: flex;
    gap: ${theme.spacing.md};
    align-items: center;
  }
`;

export const FilterLabel = styled.span`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.sm};
`;

export const FilterSelect = styled.select`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xs};
  border: 1px solid ${theme.colors.border.medium};
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};

  &:hover {
    border-color: ${theme.colors.border.dark};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.states.focus};
  }
`;

export const Card = styled.div`
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.glassSubtle};
  border: 1px solid ${theme.colors.glass.border};
  overflow: hidden;
  transition: ${theme.transitions.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.md};
  }
`;

export const CardHeader = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.subtle};
  background: ${theme.colors.glass.subtle};
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
`;

export const CardContent = styled.div`
  padding: ${theme.spacing.lg};
  height: 300px;
`;

export const CardFooter = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.subtle};
  background: ${theme.colors.glass.subtle};
`;

export const MetricCard = styled.div`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.glassSubtle};
  border: 1px solid ${theme.colors.glass.border};
`;

export const MetricLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

export const MetricValue = styled.div`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  line-height: 1.2;
`;

export const MetricChange = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
  color: ${({ positive }) => 
    positive ? theme.colors.accent.emerald : theme.colors.accent.rose};
  margin-top: ${theme.spacing.sm};
`;

export const ChartContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;


// Refined animations - subtler and more elegant
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const gentleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
`;

// Layout Components - Cleaner, more spacious
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.primary[100]} 100%);
  position: relative;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing['2xl']};
  position: relative;
  
  @media (max-width: 768px) { 
    padding: ${theme.spacing.md}; 
  }
`;

// Refined Header - No avatar clutter
export const Header = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['2xl']} ${theme.spacing['2xl']} ${theme.spacing.xl} ${theme.spacing['2xl']};
  margin-bottom: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
  animation: ${fadeInUp} 0.4s ease-out;
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.lg};
    align-items: stretch;
  }
`;

// Simplified welcome section - no avatar
export const WelcomeSection = styled.div`
  flex: 1;
`;

export const WelcomeTitle = styled.h1`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes['3xl']};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  font-weight: ${theme.typography.weights.semibold};
  line-height: 1.2;
  
  @media (max-width: 768px) { 
    font-size: ${theme.typography.sizes['2xl']}; 
  }
`;

export const WelcomeSubtitle = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

// Cleaner view toggle - GREYSCALE
export const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: ${theme.borderRadius.md};
  padding: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
      : 'transparent'
  };
  color: ${({ $active }) => $active ? theme.colors.primary[600] : theme.colors.text.secondary};
  font-weight: ${({ $active }) => $active ? theme.typography.weights.medium : theme.typography.weights.normal};
  font-size: ${theme.typography.sizes.sm};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  box-shadow: ${({ $active }) => 
    $active 
      ? '0 1px 3px rgba(0, 0, 0, 0.1)' 
      : 'none'
  };
  
  &:hover {
    background: ${({ $active }) => 
      $active 
        ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' 
        : 'rgba(255, 255, 255, 0.5)'
    };
    color: ${({ $active }) => $active ? theme.colors.primary[600] : theme.colors.text.primary};
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

// Refined badge - GREYSCALE
export const Badge = styled.span<{ $variant?: 'primary' | 'secondary' | 'success' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: ${theme.borderRadius.full};
  font-size: 0.625rem;
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.body};
  margin-left: ${theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: ${theme.colors.primary[200]};
          color: ${theme.colors.primary[700]};
        `;
      case 'warning':
        return css`
          background: ${theme.colors.primary[300]};
          color: ${theme.colors.primary[800]};
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[600]};
        `;
      default:
        return css`
          background: ${theme.colors.primary[200]};
          color: ${theme.colors.primary[700]};
        `;
    }
  }}
`;

// Loading states - GREYSCALE
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: ${theme.spacing.md};
  animation: ${fadeInUp} 0.4s ease-out;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.border.light};
  border-top: 3px solid ${theme.colors.primary[600]};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.weights.medium};
  margin: 0;
`;

export const LoadingSubtext = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  text-align: center;
`;

// Error components - GREYSCALE
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: ${theme.spacing.md};
  text-align: center;
  animation: ${fadeInUp} 0.4s ease-out;
`;

export const ErrorIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.sm};
`;

export const ErrorTitle = styled.h2`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.primary[700]};
  margin: 0;
  font-weight: ${theme.typography.weights.medium};
`;

export const ErrorMessage = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
`;

export const RetryButton = styled.button`
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
  color: white;
  border: none;
  padding: 0.625rem ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.sm};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

// Create Portfolio - GREYSCALE
export const CreatePortfolioSection = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['3xl']};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']};
  }
`;

export const CreateHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing['3xl']};
`;

export const CreateIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
  border-radius: 50%;
  color: white;
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  animation: ${gentleFloat} 4s ease-in-out infinite;
`;

export const CreateTitle = styled.h2`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.semibold};
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.primary};
`;

export const CreateDescription = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text.secondary};
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
`;

export const PortfolioTypes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const PortfolioTypeCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${theme.colors.primary[600]};
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

export const TypeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const TypeIcon = styled.div<{ $gradient: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${props => props.$gradient};
  border-radius: ${theme.borderRadius.md};
  color: white;
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
`;

export const TypeTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  text-align: center;
`;

export const TypeDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
  margin: 0 0 ${theme.spacing.lg} 0;
  text-align: center;
  font-size: ${theme.typography.sizes.sm};
`;

export const TypeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: ${theme.spacing.lg};
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.light};
  
  svg {
    color: ${theme.colors.primary[600]};
  }
`;

export const CreateButton = styled.button<{ $gradient: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  width: 100%;
  padding: 0.75rem ${theme.spacing.md};
  background: ${props => props.$gradient};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  font-size: ${theme.typography.sizes.sm};
  font-family: ${theme.typography.fonts.body};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

// Dashboard Content
export const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  animation: ${fadeInUp} 0.4s ease-out 0.1s both;
`;

// Stats Grid - more refined
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MainStatCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
`;

export const StatCard = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

export const StatIcon = styled.div<{ $color?: string; $gradient?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => {
    if (props.$gradient) return props.$gradient;
    if (props.$color) return `${props.$color}20`;
    return `${theme.colors.primary[600]}20`;
  }};
  color: ${props => {
    if (props.$gradient) return 'white';
    if (props.$color) return props.$color;
    return theme.colors.primary[600];
  }};
  border-radius: ${theme.borderRadius.sm};
  box-shadow: ${props => props.$gradient ? theme.shadows.sm : 'none'};
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatTitle = styled.h4`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.xs} 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const StatValue = styled.div`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.lg};
  }
`;

export const StatLabel = styled.div`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

export const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.625rem;
  color: ${props => props.$positive ? theme.colors.primary[600] : theme.colors.primary[700]};
  font-weight: ${theme.typography.weights.medium};
  margin-top: 2px;
`;

export const StatProgress = styled.div`
  margin-top: ${theme.spacing.sm};
`;

export const ProgressBar = styled.div`
  height: 6px;
  background: ${theme.colors.border.light};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.xs};
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%);
  transition: width 0.6s ease;
`;

export const ProgressText = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.text.secondary};
  text-align: right;
  font-weight: ${theme.typography.weights.medium};
`;

// Content Grid
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Section Components
export const Section = styled.div`
  background: ${theme.glass.background};
  backdrop-filter: blur(${theme.glass.blur});
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.glass.border};
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
`;

export const SectionTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export const SectionActions = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

export const ActionButton = styled.button<{ $primary?: boolean; $variant?: 'primary' | 'secondary' | 'ghost' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 0.5rem 0.75rem;
  background: ${props => {
    if (props.$primary || props.$variant === 'primary') {
      return `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%)`;
    }
    if (props.$variant === 'ghost') {
      return 'transparent';
    }
    return 'rgba(243, 244, 246, 0.8)';
  }};
  color: ${props => {
    if (props.$primary || props.$variant === 'primary') {
      return 'white';
    }
    return theme.colors.text.primary;
  }};
  border: 1px solid ${props => {
    if (props.$primary || props.$variant === 'primary') {
      return 'transparent';
    }
    return theme.colors.border.light;
  }};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.body};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const ViewAllLink = styled.a`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.primary[600]};
  text-decoration: none;
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.primary[700]};
  }
`;

// Activity Components - GREYSCALE
export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: rgba(248, 250, 252, 0.6);
    transform: translateX(2px);
  }
`;

export const ActivityIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.sm};
  background: ${props => {
    switch (props.$type) {
      case 'gallery_upload': return `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%)`;
      case 'concept_complete': return `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[700]} 100%)`;
      case 'project_create': return `linear-gradient(135deg, ${theme.colors.primary[400]} 0%, ${theme.colors.primary[500]} 100%)`;
      case 'achievement_unlock': return `linear-gradient(135deg, ${theme.colors.primary[300]} 0%, ${theme.colors.primary[400]} 100%)`;
      default: return `linear-gradient(135deg, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[600]} 100%)`;
    }
  }};
  color: white;
  box-shadow: ${theme.shadows.sm};
`;

export const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ActivityTitle = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  font-size: ${theme.typography.sizes.xs};
`;

export const ActivityDescription = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.text.secondary};
  line-height: 1.3;
  margin-bottom: ${theme.spacing.xs};
`;

export const ActivityMetadata = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

export const MetadataTag = styled.span`
  background: ${theme.colors.primary[200]};
  color: ${theme.colors.primary[700]};
  font-size: 0.5rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: ${theme.typography.weights.medium};
`;

export const ActivityTime = styled.div`
  font-size: 0.5rem;
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.weights.medium};
  flex-shrink: 0;
`;

// Quick Actions - GREYSCALE
export const QuickActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  
  &:hover {
    border-color: ${theme.colors.primary[600]};
    background: rgba(248, 250, 252, 0.6);
    transform: translateY(-1px);
  }
`;

export const QuickActionIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${theme.colors.primary[200]};
  color: ${theme.colors.primary[700]};
  border-radius: ${theme.borderRadius.sm};
  transition: all ${theme.transitions.fast};
  
  ${QuickAction}:hover & {
    background: ${theme.colors.primary[300]};
  }
`;

export const QuickActionContent = styled.div`
  flex: 1;
`;

export const QuickActionTitle = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: 2px;
  font-size: ${theme.typography.sizes.xs};
`;

export const QuickActionDescription = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.text.secondary};
  line-height: 1.3;
`;

export const QuickActionArrow = styled.div`
  color: ${theme.colors.text.tertiary};
  transition: all ${theme.transitions.fast};
  
  ${QuickAction}:hover & {
    color: ${theme.colors.primary[600]};
    transform: translateX(2px);
  }
`;

// Empty State - minimal
export const EmptyStateCard = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['2xl']};
  text-align: center;
  background: rgba(248, 250, 252, 0.6);
  border-radius: ${theme.borderRadius.md};
  border: 2px dashed ${theme.colors.border.light};
`;

export const EmptyIcon = styled.div`
  color: ${theme.colors.text.tertiary};
  margin-bottom: ${theme.spacing.sm};
  opacity: 0.6;
`;

export const EmptyTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

export const EmptyMessage = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.md} 0;
  line-height: 1.4;
  max-width: 300px;
  font-size: ${theme.typography.sizes.sm};
`;