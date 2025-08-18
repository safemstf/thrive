// src/app/dashboard/page.tsx - Redesigned with Golden Ratio & Minimalist Layout
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { usePortfolioManagement } from '@/hooks/usePortfolioManagement';
import { useDashboardLogic } from '@/components/dashboard/dashboardLogic';
import { useOffline } from '@/hooks/useOffline';
import { 
  LayoutDashboard, 
  Image as GalleryIcon, 
  Brush,
  Brain,
  Layers,
  ChevronRight,
  Activity,
  Settings,
  Sparkles,
  BarChart3,
  Code,
  ExternalLink,
  Eye,
  CheckCircle,
  TrendingUp,
  Target,
  Award,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";

// Import view components
import { GalleryView } from '@/components/dashboard/views/GalleryView';
import { LearningView } from '@/components/dashboard/views/learningView';
import { AnalyticsView } from '@/components/dashboard/views/analyticsView';

// Import mock data for fallback
import { createMockPortfolio, createMockGalleryPieces } from '@/data/mockData';

// Import styled components
import styled, { css } from 'styled-components';
import {
  PageContainer,
  LoadingContainer,
  LoadingSpinner,
  ErrorContainer,
  Card,
  CardContent,
  BaseButton,
  Heading1,
  Heading2,
  BodyText,
  FlexRow,
  FlexColumn,
  responsive,
  fadeIn,
  float
} from '@/styles/styled-components';

// ===========================================
// GOLDEN RATIO DESIGN SYSTEM
// ===========================================
const GOLDEN_RATIO = 1.618;

// Golden ratio spacing scale
const GOLDEN_SCALE = {
  xs: `${0.618}rem`,      // 1/φ
  sm: `${1}rem`,          // 1
  md: `${1.618}rem`,      // φ
  lg: `${2.618}rem`,      // φ²
  xl: `${4.236}rem`,      // φ³
  xxl: `${6.854}rem`,     // φ⁴
  xxxl: `${11.09}rem`     // φ⁵
};

// ===========================================
// REDESIGNED DASHBOARD COMPONENTS
// ===========================================

const DashboardContainer = styled(PageContainer)`
  background: var(--color-background-primary);
  min-height: 100vh;
  position: relative;
  
  /* Subtle texture overlay using golden ratio positioning */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 38.2% 61.8%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 61.8% 38.2%, rgba(139, 92, 246, 0.02) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const DashboardContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${GOLDEN_SCALE.lg} ${GOLDEN_SCALE.md};
  
  /* Golden ratio grid structure */
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: ${GOLDEN_SCALE.xl};
  min-height: 100vh;
  
  ${responsive.below.lg} {
    padding: ${GOLDEN_SCALE.md} ${GOLDEN_SCALE.sm};
    gap: ${GOLDEN_SCALE.lg};
  }
  
  ${responsive.below.md} {
    padding: ${GOLDEN_SCALE.sm};
    gap: ${GOLDEN_SCALE.md};
  }
`;

const StatusBar = styled.div<{ $isOffline: boolean }>`
  position: fixed;
  top: ${GOLDEN_SCALE.sm};
  right: ${GOLDEN_SCALE.sm};
  z-index: 1000;
  padding: ${GOLDEN_SCALE.xs} ${GOLDEN_SCALE.sm};
  background: ${props => 
    props.$isOffline 
      ? 'linear-gradient(135deg, var(--color-error-500), var(--color-error-600))' 
      : 'linear-gradient(135deg, var(--color-success-500), var(--color-success-600))'
  };
  color: white;
  border-radius: ${GOLDEN_SCALE.xs};
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
  
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  
  opacity: ${props => props.$isOffline ? 1 : 0};
  transform: translateY(${props => props.$isOffline ? '0' : '-100%'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const HeaderSection = styled.header`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: ${GOLDEN_SCALE.lg};
  margin-bottom: ${GOLDEN_SCALE.md};
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
    gap: ${GOLDEN_SCALE.md};
    text-align: center;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SCALE.xs};
`;

const MainTitle = styled(Heading1)`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 300;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-text-primary), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.div`
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  
  .status-badge {
    padding: 0.25rem 0.75rem;
    background: var(--color-background-tertiary);
    border: 1px solid var(--color-border-light);
    border-radius: ${GOLDEN_SCALE.xs};
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const SyncIndicator = styled.div<{ $syncing: boolean }>`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  
  ${props => props.$syncing && css`
    .sync-icon {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}
`;

// REDESIGNED VIEW NAVIGATION WITH PROPER CONTRAST
const ViewNavigation = styled.nav`
  display: flex;
  background: var(--color-background-secondary);
  border: 2px solid var(--color-border-light);
  border-radius: ${GOLDEN_SCALE.sm};
  padding: 0.375rem;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
  
  ${responsive.below.md} {
    width: 100%;
    justify-self: center;
  }
`;

const ViewTab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SCALE.xs};
  padding: ${GOLDEN_SCALE.sm} ${GOLDEN_SCALE.md};
  border: none;
  border-radius: calc(${GOLDEN_SCALE.sm} - 0.375rem);
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))' 
      : 'transparent'
  };
  color: ${({ $active }) => 
    $active 
      ? 'white' 
      : 'var(--color-text-secondary)'
  };
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  /* Ensure proper contrast */
  ${({ $active }) => !$active && css`
    &:hover {
      background: var(--color-background-tertiary);
      color: var(--color-text-primary);
      transform: translateY(-1px);
    }
  `}
  
  ${({ $active }) => $active && css`
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    
    &:hover {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }
  
  &:active::after {
    width: 100px;
    height: 100px;
  }
  
  ${responsive.below.md} {
    flex: 1;
    justify-content: center;
    padding: ${GOLDEN_SCALE.sm};
  }
`;

// GOLDEN RATIO CONTENT LAYOUT
const MainContent = styled.main`
  display: grid;
  gap: ${GOLDEN_SCALE.xl};
  animation: ${fadeIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
`;

// OVERVIEW LAYOUT WITH GOLDEN RATIO PROPORTIONS
const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: ${GOLDEN_RATIO}fr 1fr;
  gap: ${GOLDEN_SCALE.xl};
  
  ${responsive.below.lg} {
    grid-template-columns: 1fr;
    gap: ${GOLDEN_SCALE.lg};
  }
`;

const MainStatsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SCALE.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${GOLDEN_SCALE.md};
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
  }
`;

const PrimaryStatCard = styled(Card)`
  background: linear-gradient(135deg, 
    var(--color-background-secondary) 0%, 
    var(--color-background-tertiary) 100%
  );
  border: 1px solid var(--color-border-light);
  padding: ${GOLDEN_SCALE.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    opacity: 0.1;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
  
  .stat-header {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.sm};
    margin-bottom: ${GOLDEN_SCALE.md};
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: ${GOLDEN_SCALE.xs};
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
  }
  
  .stat-info h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .stat-info .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: var(--color-primary-50);
    color: var(--color-primary-600);
    border-radius: ${GOLDEN_SCALE.xs};
    border: 1px solid var(--color-primary-200);
    margin-top: 0.25rem;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    margin-bottom: ${GOLDEN_SCALE.xs};
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: ${GOLDEN_SCALE.sm};
  }
  
  .progress-container {
    .progress-bar {
      height: 6px;
      background: var(--color-background-tertiary);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: ${GOLDEN_SCALE.xs};
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
      border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .progress-text {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-align: right;
      font-weight: 500;
    }
  }
`;

const SecondaryStatCard = styled(Card)`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  padding: ${GOLDEN_SCALE.md};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-300);
  }
  
  .stat-header {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.sm};
    margin-bottom: ${GOLDEN_SCALE.sm};
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: ${GOLDEN_SCALE.xs};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .stat-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .stat-value {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    margin-bottom: ${GOLDEN_SCALE.xs};
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin-bottom: ${GOLDEN_SCALE.xs};
  }
  
  .stat-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const SidebarSection = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SCALE.lg};
`;

const ActivityCard = styled(Card)`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  padding: ${GOLDEN_SCALE.md};
  
  .section-header {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.xs};
    margin-bottom: ${GOLDEN_SCALE.md};
    padding-bottom: ${GOLDEN_SCALE.sm};
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: ${GOLDEN_SCALE.sm};
  }
  
  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: ${GOLDEN_SCALE.sm};
    padding: ${GOLDEN_SCALE.sm};
    border-radius: ${GOLDEN_SCALE.xs};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: var(--color-background-tertiary);
      transform: translateX(4px);
    }
  }
  
  .activity-icon {
    width: 32px;
    height: 32px;
    border-radius: ${GOLDEN_SCALE.xs};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .activity-content {
    flex: 1;
    min-width: 0;
  }
  
  .activity-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.125rem;
  }
  
  .activity-description {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
    margin-bottom: 0.25rem;
  }
  
  .activity-time {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
`;

const QuickActionsCard = styled(Card)`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  padding: ${GOLDEN_SCALE.md};
  
  .section-header {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.xs};
    margin-bottom: ${GOLDEN_SCALE.md};
    padding-bottom: ${GOLDEN_SCALE.sm};
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .actions-grid {
    display: flex;
    flex-direction: column;
    gap: ${GOLDEN_SCALE.xs};
  }
  
  .action-item {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.sm};
    padding: ${GOLDEN_SCALE.sm};
    border: 1px solid var(--color-border-light);
    border-radius: ${GOLDEN_SCALE.xs};
    text-decoration: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    background: var(--color-background-primary);
    
    &:hover:not(:disabled) {
      border-color: var(--color-primary-500);
      background: var(--color-background-tertiary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .action-icon {
    width: 32px;
    height: 32px;
    border-radius: ${GOLDEN_SCALE.xs};
    background: var(--color-primary-50);
    color: var(--color-primary-600);
    border: 1px solid var(--color-primary-200);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .action-item:hover .action-icon {
    background: var(--color-primary-100);
    border-color: var(--color-primary-300);
  }
  
  .action-content {
    flex: 1;
  }
  
  .action-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.125rem;
  }
  
  .action-description {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    line-height: 1.3;
  }
  
  .action-arrow {
    color: var(--color-text-secondary);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .action-item:hover .action-arrow {
    color: var(--color-primary-600);
    transform: translateX(2px);
  }
`;

// PORTFOLIO CREATION SCREEN
const CreatePortfolioContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: ${GOLDEN_SCALE.xl} ${GOLDEN_SCALE.md};
`;

const CreateHeader = styled.div`
  margin-bottom: ${GOLDEN_SCALE.xxl};
  
  .create-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto ${GOLDEN_SCALE.lg};
    box-shadow: var(--shadow-xl);
    animation: ${float} 4s ease-in-out infinite;
  }
  
  .create-title {
    margin: 0 0 ${GOLDEN_SCALE.md} 0;
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: 300;
    color: var(--color-text-primary);
  }
  
  .create-description {
    max-width: 500px;
    margin: 0 auto;
    color: var(--color-text-secondary);
    font-size: 1.125rem;
    line-height: 1.6;
  }
`;

const PortfolioTypesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${GOLDEN_SCALE.lg};
  max-width: 1000px;
  width: 100%;
`;

const PortfolioTypeCard = styled(Card)<{ $disabled?: boolean }>`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  padding: ${GOLDEN_SCALE.lg};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$disabled ? 0.6 : 1};
  
  &:hover:not([disabled]) {
    border-color: var(--color-primary-500);
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
  }
  
  .type-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${GOLDEN_SCALE.md};
    margin-bottom: ${GOLDEN_SCALE.lg};
  }
  
  .type-icon {
    width: 60px;
    height: 60px;
    border-radius: ${GOLDEN_SCALE.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: var(--shadow-md);
  }
  
  .type-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .type-description {
    text-align: center;
    margin: 0 0 ${GOLDEN_SCALE.lg} 0;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
  
  .type-features {
    display: flex;
    flex-direction: column;
    gap: ${GOLDEN_SCALE.xs};
    margin-bottom: ${GOLDEN_SCALE.lg};
  }
  
  .feature {
    display: flex;
    align-items: center;
    gap: ${GOLDEN_SCALE.xs};
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    
    svg {
      color: var(--color-primary-600);
    }
  }
  
  .create-button {
    width: 100%;
    padding: ${GOLDEN_SCALE.sm} ${GOLDEN_SCALE.md};
    border: none;
    border-radius: ${GOLDEN_SCALE.xs};
    font-weight: 600;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }
`;

type DashboardView = 'overview' | 'gallery' | 'learning' | 'analytics';

// Utility function to safely convert to Date
const ensureDate = (dateInput: any): Date => {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

export default function Dashboard() {
  const router = useRouter();
  const { portfolio, loading, error, hasPortfolio, galleryPieces } = usePortfolioManagement();
  const { portfolioTypeConfig, formatTimeAgo } = useDashboardLogic();
  const { 
    isOffline, 
    isSyncing, 
    hasOfflineData, 
    initializeOfflineMode,
    syncData, 
    getOfflineData 
  } = useOffline();
  
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const hasSyncedRef = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedOfflineRef = useRef<boolean>(false);

  // Enhanced loading timeout
  useEffect(() => {
    if (loading && !hasOfflineData && !loadingTimeout) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Loading timeout - switching to offline mode');
        setLoadingTimeout(true);
      }, 2000);
    } else {
      setLoadingTimeout(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading, hasOfflineData, loadingTimeout]);

  // Auto-switch to offline mode when needed
  useEffect(() => {
    if (!hasPortfolio && !useOfflineMode && !hasInitializedOfflineRef.current) {
      if ((isOffline || loadingTimeout) && !loading) {
        console.log('🔧 Auto-switching to offline mode');
        initializeOfflineMode();
        setUseOfflineMode(true);
        hasInitializedOfflineRef.current = true;
      }
    }
  }, [hasPortfolio, useOfflineMode, isOffline, loadingTimeout, loading, initializeOfflineMode]);

  // Portfolio type configuration
  const PORTFOLIO_TYPES = [
    {
      key: 'creative',
      ...portfolioTypeConfig.creative,
      icon: <Brush size={20} />,
      features: ['Gallery showcase', 'Visual projects'],
      path: '/dashboard/profile?create=creative',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      key: 'educational', 
      ...portfolioTypeConfig.educational,
      icon: <Brain size={20} />,
      features: ['Learning progress', 'Achievement tracking'],
      path: '/dashboard/profile?create=educational',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      key: 'professional',
      ...portfolioTypeConfig.professional,
      icon: <Code size={20} />,
      features: ['Technical skills', 'Project showcase'],
      path: '/dashboard/profile?create=professional',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    {
      key: 'hybrid',
      ...portfolioTypeConfig.hybrid,
      icon: <Layers size={20} />,
      features: ['Multi-disciplinary', 'Flexible format'],
      path: '/dashboard/profile?create=hybrid',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    }
  ];

  // Determine current data source
  const getCurrentDataSource = () => {
    if (hasPortfolio && !isOffline) {
      return { type: 'live', portfolio, galleryPieces: galleryPieces || [] };
    }
    
    if (hasOfflineData || useOfflineMode) {
      const offlineData = getOfflineData();
      if (offlineData) {
        return { 
          type: 'offline', 
          portfolio: offlineData.portfolio, 
          galleryPieces: offlineData.galleryPieces 
        };
      }
    }
    
    return { 
      type: 'demo', 
      portfolio: createMockPortfolio(), 
      galleryPieces: createMockGalleryPieces() 
    };
  };

  const dataSource = getCurrentDataSource();
  const currentPortfolio = dataSource.portfolio;
  const currentGalleryPieces = dataSource.galleryPieces;

  // View availability check
  const isViewAvailable = (view: DashboardView): boolean => {
    if (!currentPortfolio) return view === 'overview';
    
    switch (view) {
      case 'overview':
      case 'analytics':
        return true;
      case 'gallery':
        return currentPortfolio.kind === 'creative' || currentPortfolio.kind === 'hybrid';
      case 'learning':
        return currentPortfolio.kind === 'educational' || currentPortfolio.kind === 'hybrid';
      default:
        return false;
    }
  };

  // Navigation items
  const navigationItems = useMemo(() => [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { key: 'gallery', label: 'Gallery', icon: <GalleryIcon size={16} />, condition: isViewAvailable('gallery') },
    { key: 'learning', label: 'Learning', icon: <Brain size={16} />, condition: isViewAvailable('learning') },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> }
  ].filter(item => item.condition !== false), [currentPortfolio?.kind]);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    if (dataSource.type === 'live') {
      return {
        portfolioType: currentPortfolio?.kind,
        totalItems: currentGalleryPieces?.length || 0,
        recentActivity: 0,
        completionRate: 75,
        weeklyGrowth: 12,
        averageScore: 85,
        totalViews: 1234,
        uniqueVisitors: 567,
        engagementRate: 78
      };
    }
    
    if (dataSource.type === 'offline') {
      const offlineData = getOfflineData();
      return offlineData?.dashboardStats || null;
    }
    
    return {
      portfolioType: currentPortfolio?.kind,
      totalItems: currentGalleryPieces?.length || 0,
      recentActivity: 3,
      completionRate: 75,
      weeklyGrowth: 12,
      averageScore: 85,
      totalViews: 1234,
      uniqueVisitors: 567,
      engagementRate: 78
    };
  }, [dataSource.type, currentPortfolio?.kind, currentGalleryPieces?.length]);

  // Achievements with proper date handling
  const achievements = useMemo(() => {
    if (dataSource.type === 'offline') {
      const offlineData = getOfflineData();
      const offlineAchievements = offlineData?.achievements || [];
      
      return offlineAchievements.map(achievement => ({
        ...achievement,
        unlockedAt: ensureDate(achievement.unlockedAt)
      }));
    }
    
    const now = new Date();
    const portfolioCreatedAt = ensureDate(currentPortfolio?.createdAt) || new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'portfolio-created',
        title: 'Portfolio Created',
        description: `Successfully created your ${currentPortfolio?.kind || 'professional'} portfolio`,
        unlockedAt: portfolioCreatedAt,
        type: 'milestone' as const,
        icon: '🎯'
      },
      {
        id: 'content-creator',
        title: 'Content Creator',
        description: `Added ${dashboardStats?.totalItems || 0} pieces to your portfolio`,
        unlockedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        type: 'content' as const,
        icon: '✨'
      }
    ];
  }, [dataSource.type, currentPortfolio?.kind, currentPortfolio?.createdAt, dashboardStats?.totalItems, getOfflineData]);

  // Sync data when we have live data
  useEffect(() => {
    if (dataSource.type === 'live' && dashboardStats && achievements.length > 0 && !hasSyncedRef.current) {
      console.log('💾 Syncing live data for offline use');
      syncData({
        dashboardStats,
        achievements,
        galleryPieces: currentGalleryPieces,
        portfolio: currentPortfolio
      });
      hasSyncedRef.current = true;
    }
  }, [dataSource.type, !!dashboardStats, achievements.length, syncData]);

  // Quick actions
  const quickActions = useMemo(() => {
    const canEdit = dataSource.type === 'live';
    const canViewPublic = dataSource.type === 'live' && !isOffline;
    
    return [
      {
        title: 'Portfolio Hub',
        description: canEdit ? 'Manage & edit' : 'View only',
        icon: <Settings size={20} />,
        href: canEdit ? '/dashboard/profile' : undefined,
        disabled: !canEdit
      },
      ...(isViewAvailable('gallery') ? [{
        title: 'Gallery',
        description: 'View artwork', 
        icon: <GalleryIcon size={20} />,
        onClick: () => setActiveView('gallery')
      }] : []),
      {
        title: 'Analytics',
        description: 'View insights',
        icon: <BarChart3 size={20} />,
        onClick: () => setActiveView('analytics')
      },
      {
        title: 'View Public',
        description: canViewPublic ? 'See your portfolio' : 'Offline',
        icon: <ExternalLink size={20} />,
        href: canViewPublic ? `/portfolio/${currentPortfolio?.id}` : undefined,
        external: true,
        disabled: !canViewPublic
      }
    ];
  }, [dataSource.type, isOffline, currentPortfolio?.id, isViewAvailable]);

  // Recent activities
  const recentActivities = useMemo(() => {
    const portfolioCreatedAt = ensureDate(currentPortfolio?.createdAt);

    const baseActivities = [
      {
        id: '1',
        title: 'Portfolio created',
        description: `Your ${currentPortfolio?.kind} portfolio is now active`,
        timestamp: portfolioCreatedAt,
        type: 'portfolio' as const,
        metadata: { category: 'Portfolio' }
      }
    ];

    const achievementActivities = achievements.slice(0, 2).map((achievement, index) => {
      const unlockedAt = ensureDate(achievement.unlockedAt);

      return {
        id: `achievement-${index + 2}`,
        title: `Achievement unlocked: ${achievement.title}`,
        description: achievement.description,
        timestamp: unlockedAt,
        type: 'achievement' as const,
        metadata: { category: 'Achievement', icon: achievement.icon }
      };
    });

    return [...baseActivities, ...achievementActivities];
  }, [currentPortfolio?.kind, currentPortfolio?.createdAt, achievements]);

  console.log('Dashboard render:', { 
    loading, 
    error, 
    hasPortfolio, 
    hasOfflineData, 
    isOffline,
    useOfflineMode,
    loadingTimeout,
    dataSource: dataSource.type,
    dashboardStats: !!dashboardStats
  });

  // Loading state
  if (loading && !hasOfflineData && !loadingTimeout && !useOfflineMode) {
    return (
      <ProtectedRoute>
        <DashboardContainer>
          <LoadingContainer>
            <LoadingSpinner />
            <BodyText>Loading dashboard...</BodyText>
            <div style={{ marginTop: GOLDEN_SCALE.md, textAlign: 'center' }}>
              <BodyText style={{ fontSize: '0.875rem', marginBottom: GOLDEN_SCALE.xs }}>
                This is taking longer than usual...
              </BodyText>
              <BaseButton 
                onClick={() => {
                  initializeOfflineMode();
                  setUseOfflineMode(true);
                }}
                $variant="ghost"
              >
                Continue in offline mode
              </BaseButton>
            </div>
          </LoadingContainer>
        </DashboardContainer>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error && !hasOfflineData && !useOfflineMode) {
    return (
      <ProtectedRoute>
        <DashboardContainer>
          <ErrorContainer>
            <Card>
              <CardContent>
                <Heading2>Something went wrong</Heading2>
                <BodyText>{error}</BodyText>
                <FlexRow $gap={GOLDEN_SCALE.md} style={{ marginTop: GOLDEN_SCALE.md }}>
                  <BaseButton onClick={() => window.location.reload()}>
                    Try Again
                  </BaseButton>
                  <BaseButton 
                    $variant="ghost"
                    onClick={() => {
                      initializeOfflineMode();
                      setUseOfflineMode(true);
                    }}
                  >
                    Continue Offline
                  </BaseButton>
                </FlexRow>
              </CardContent>
            </Card>
          </ErrorContainer>
        </DashboardContainer>
      </ProtectedRoute>
    );
  }

  // No portfolio and no offline data - show creation flow
  if (!currentPortfolio) {
    return (
      <ProtectedRoute>
        <DashboardContainer>
          <StatusBar $isOffline={isOffline}>
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            {isOffline ? 'You are offline' : 'Online'}
          </StatusBar>

          <DashboardContent>
            <CreatePortfolioContainer>
              <CreateHeader>
                <div className="create-icon">
                  <Sparkles size={32} />
                </div>
                <h1 className="create-title">Welcome to Your Dashboard</h1>
                <p className="create-description">
                  {isOffline 
                    ? 'You are currently offline. Portfolio creation requires an internet connection.'
                    : 'Create your first portfolio to start tracking your professional journey and showcase your work.'
                  }
                </p>
              </CreateHeader>
              
              <PortfolioTypesGrid>
                {PORTFOLIO_TYPES.map((type) => (
                  <PortfolioTypeCard 
                    key={type.key} 
                    $disabled={isOffline}
                    onClick={() => !isOffline && router.push(type.path)}
                  >
                    <div className="type-header">
                      <div 
                        className="type-icon"
                        style={{ background: type.gradient }}
                      >
                        {type.icon}
                      </div>
                      <h3 className="type-title">{type.title}</h3>
                    </div>
                    
                    <p className="type-description">{type.description}</p>
                    
                    <div className="type-features">
                      {type.features.map((feature, index) => (
                        <div key={index} className="feature">
                          <CheckCircle size={14} />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className="create-button"
                      style={{ 
                        background: isOffline ? 'var(--color-background-tertiary)' : type.gradient,
                        color: isOffline ? 'var(--color-text-secondary)' : 'white'
                      }}
                      disabled={isOffline}
                    >
                      {isOffline ? 'Requires connection' : `Create ${type.title}`}
                    </button>
                  </PortfolioTypeCard>
                ))}
              </PortfolioTypesGrid>
            </CreatePortfolioContainer>
          </DashboardContent>
        </DashboardContainer>
      </ProtectedRoute>
    );
  }

  // Main dashboard with portfolio
  return (
    <ProtectedRoute>
      <DashboardContainer>
        <StatusBar $isOffline={isOffline || dataSource.type !== 'live'}>
          {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
          <span>
            {dataSource.type === 'demo' ? 'Demo mode' :
             dataSource.type === 'offline' ? 'Offline mode' :
             isOffline ? 'You are offline' : 'Online'}
          </span>
          {(dataSource.type === 'demo' || dataSource.type === 'offline') && (
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              • Limited functionality
            </span>
          )}
        </StatusBar>

        <DashboardContent>
          <HeaderSection>
            <TitleGroup>
              <MainTitle>Your Dashboard</MainTitle>
              <Subtitle>
                {currentPortfolio?.title || 'Portfolio'}
                <span className="status-badge">
                  {dataSource.type}
                </span>
              </Subtitle>
            </TitleGroup>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: GOLDEN_SCALE.sm }}>
              <SyncIndicator $syncing={isSyncing}>
                {isSyncing && <RefreshCw size={14} className="sync-icon" />}
                <span>
                  {isSyncing ? 'Syncing...' : 
                   dataSource.type === 'live' ? 'Synced' : 
                   dataSource.type === 'offline' ? 'Cached data' : 'Demo data'}
                </span>
              </SyncIndicator>
              
              <ViewNavigation>
                {navigationItems.map((item) => (
                  <ViewTab
                    key={item.key}
                    $active={activeView === item.key}
                    onClick={() => setActiveView(item.key as DashboardView)}
                  >
                    {item.icon}
                    {item.label}
                  </ViewTab>
                ))}
              </ViewNavigation>
            </div>
          </HeaderSection>

          <MainContent>
            {activeView === 'overview' && (
              <OverviewGrid>
                <MainStatsSection>
                  <StatsGrid>
                    <PrimaryStatCard>
                      <div className="stat-header">
                        <div className="stat-icon">
                          {currentPortfolio?.icon || <LayoutDashboard size={20} />}
                        </div>
                        <div className="stat-info">
                          <h3>Portfolio Performance</h3>
                          <div className="badge">
                            {dataSource.type === 'live' ? 'Live' : 
                             dataSource.type === 'offline' ? 'Cached' : 'Demo'}
                          </div>
                        </div>
                      </div>
                      <div className="stat-value">
                        {dashboardStats?.totalViews?.toLocaleString() || '1,234'}
                      </div>
                      <div className="stat-label">Total Views</div>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${dashboardStats?.completionRate || 75}%` }}
                          />
                        </div>
                        <div className="progress-text">
                          {dashboardStats?.completionRate || 75}% completion
                        </div>
                      </div>
                    </PrimaryStatCard>

                    <SecondaryStatCard>
                      <div className="stat-header">
                        <div 
                          className="stat-icon"
                          style={{ 
                            background: 'var(--color-success-50)',
                            color: 'var(--color-success-600)'
                          }}
                        >
                          <Target size={16} />
                        </div>
                        <div className="stat-title">Portfolio Items</div>
                      </div>
                      <div className="stat-value">{dashboardStats?.totalItems || 0}</div>
                      <div className="stat-label">Total Pieces</div>
                      
                      {/* Enhanced content with breakdown */}
                      <div className="items-breakdown">
                        <div className="breakdown-row">
                          <div className="breakdown-item">
                            <GalleryIcon size={12} />
                            <span>{Math.floor((dashboardStats?.totalItems || 0) * 0.6)}</span>
                            <span className="item-type">Gallery</span>
                          </div>
                          <div className="breakdown-item">
                            <Code size={12} />
                            <span>{Math.floor((dashboardStats?.totalItems || 0) * 0.4)}</span>
                            <span className="item-type">Projects</span>
                          </div>
                        </div>
                        <div className="recent-activity">
                          <div className="activity-dot active"></div>
                          <span>2 added this week</span>
                        </div>
                      </div>
                      
                      <div className="stat-change" style={{ color: 'var(--color-success-600)' }}>
                        <TrendingUp size={12} />
                        +{dashboardStats?.weeklyGrowth || 12}% this week
                      </div>
                    </SecondaryStatCard>

                    <SecondaryStatCard>
                      <div className="stat-header">
                        <div 
                          className="stat-icon"
                          style={{ 
                            background: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)'
                          }}
                        >
                          <Eye size={16} />
                        </div>
                        <div className="stat-title">Engagement</div>
                      </div>
                      <div className="stat-value">{dashboardStats?.engagementRate || 85}%</div>
                      <div className="stat-label">Avg Rate</div>
                      
                      {/* Enhanced engagement metrics */}
                      <div className="engagement-metrics">
                        <div className="metric-row">
                          <div className="metric-item">
                            <Eye size={10} />
                            <span className="metric-value">{dashboardStats?.totalViews || 1234}</span>
                            <span className="metric-label">Views</span>
                          </div>
                          <div className="metric-item">
                            <Activity size={10} />
                            <span className="metric-value">{Math.floor((dashboardStats?.totalViews || 1234) * 0.1)}</span>
                            <span className="metric-label">Actions</span>
                          </div>
                        </div>
                        <div className="engagement-trend">
                          <div className="trend-bar">
                            <div className="trend-fill" style={{ width: `${dashboardStats?.engagementRate || 85}%` }}></div>
                          </div>
                          <span className="trend-label">vs industry avg</span>
                        </div>
                      </div>
                      
                      <div className="stat-change" style={{ color: 'var(--color-success-600)' }}>
                        <TrendingUp size={12} />
                        Excellent performance
                      </div>
                    </SecondaryStatCard>
                  </StatsGrid>
                </MainStatsSection>
                
                <SidebarSection>
                  <ActivityCard>
                    <div className="section-header">
                      <Activity size={18} />
                      <h3 className="section-title">Recent Activity</h3>
                    </div>
                    <div className="activity-list">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <div 
                            className="activity-icon"
                            style={{
                              background: activity.type === 'portfolio' 
                                ? 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))'
                                : 'linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600))'
                            }}
                          >
                            {activity.type === 'portfolio' && <LayoutDashboard size={16} />}
                            {activity.type === 'achievement' && <Award size={16} />}
                          </div>
                          <div className="activity-content">
                            <div className="activity-title">{activity.title}</div>
                            <div className="activity-description">{activity.description}</div>
                            <div className="activity-time">{formatTimeAgo(ensureDate(activity.timestamp))}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ActivityCard>
                  
                  <QuickActionsCard>
                    <div className="section-header">
                      <Plus size={18} />
                      <h3 className="section-title">Quick Actions</h3>
                    </div>
                    <div className="actions-grid">
                      {quickActions.map((action, index) => (
                        <div
                          key={index}
                          className="action-item"
                          style={{ opacity: action.disabled ? 0.6 : 1 }}
                          onClick={action.onClick}
                          {...(action.href && !action.disabled ? {
                            as: 'a',
                            href: action.href,
                            target: action.external ? '_blank' : undefined
                          } : {})}
                        >
                          <div className="action-icon">
                            {action.icon}
                          </div>
                          <div className="action-content">
                            <div className="action-title">{action.title}</div>
                            <div className="action-description">{action.description}</div>
                          </div>
                          <div className="action-arrow">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </QuickActionsCard>
                </SidebarSection>
              </OverviewGrid>
            )}

            {activeView === 'gallery' && isViewAvailable('gallery') && (
              <GalleryView 
                galleryItems={currentGalleryPieces}
                portfolioId={currentPortfolio?.id || 'demo'}
              />
            )}

            {activeView === 'learning' && isViewAvailable('learning') && (
              <LearningView 
                conceptProgress={currentPortfolio?.conceptProgress || []}
                stats={dashboardStats || { 
                  totalItems: 0, 
                  recentActivity: 0, 
                  completionRate: 0, 
                  weeklyGrowth: 0,
                  averageScore: 0
                }}
              />
            )}

            {activeView === 'analytics' && (
              <AnalyticsView 
                stats={dashboardStats}
                achievements={achievements}
                formatTimeAgo={formatTimeAgo}
              />
            )}
          </MainContent>
        </DashboardContent>
      </DashboardContainer>
    </ProtectedRoute>
  );
}