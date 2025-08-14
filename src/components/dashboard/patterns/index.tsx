// src/components/dashboard/patterns/index.tsx - Just the Missing Patterns
import React from 'react';
import styled from 'styled-components';
import { 
  Card, 
  CardContent, 
  BaseButton, 
  Heading1, 
  Heading3,
  BodyText, 
  FlexRow, 
  Grid,
  Badge,
  ProgressBar,
  ProgressFill
} from '@/styles/styled-components';
import { ChevronRight, Plus, Activity, Target } from 'lucide-react';

// ===========================================
// LAYOUT PATTERNS
// ===========================================

export const DashboardLayout = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1.5rem;
  }
`;

// ===========================================
// WELCOME HERO PATTERN
// ===========================================

interface WelcomeHeroProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ 
  title, 
  description, 
  icon
}) => (
  <WelcomeCard>
    <WelcomeIcon>{icon}</WelcomeIcon>
    <WelcomeContent>
      <Heading1>{title}</Heading1>
      <BodyText>{description}</BodyText>
    </WelcomeContent>
  </WelcomeCard>
);

const WelcomeCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const WelcomeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  flex-shrink: 0;
`;

const WelcomeContent = styled.div`
  flex: 1;
`;

// ===========================================
// PORTFOLIO TYPE GRID PATTERN
// ===========================================

interface PortfolioType {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  path: string;
}

interface PortfolioTypeGridProps {
  portfolioTypes: PortfolioType[];
  onTypeSelect: (type: PortfolioType) => void;
}

export const PortfolioTypeGrid: React.FC<PortfolioTypeGridProps> = ({ 
  portfolioTypes, 
  onTypeSelect 
}) => (
  <Grid $minWidth="300px" $gap="1.5rem">
    {portfolioTypes.map((type) => (
      <PortfolioTypeCard 
        key={type.key}
        onClick={() => onTypeSelect(type)}
      >
        <CardHeader>
          <CardIcon>{type.icon}</CardIcon>
          <Heading3>{type.title}</Heading3>
        </CardHeader>
        
        <BodyText>{type.description}</BodyText>
        
        <FeatureList>
          {type.features.map((feature, index) => (
            <Feature key={index}>✓ {feature}</Feature>
          ))}
        </FeatureList>
        
        <CreateButton>
          <Plus size={16} />
          Create {type.title}
        </CreateButton>
      </PortfolioTypeCard>
    ))}
  </Grid>
);

const PortfolioTypeCard = styled(Card)<{ onClick: () => void }>`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #2c2c2c;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.5rem 0;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
`;

const CreateButton = styled(BaseButton)`
  margin-top: auto;
  width: 100%;
  justify-content: center;
`;

// ===========================================
// VIEW NAVIGATION PATTERN
// ===========================================

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface ViewNavigationProps {
  items: NavigationItem[];
  activeView: string;
  onViewChange: (view: string) => void;
}

export const ViewNavigation: React.FC<ViewNavigationProps> = ({ 
  items, 
  activeView, 
  onViewChange 
}) => (
  <ViewToggle>
    {items.map((item) => (
      <ViewButton
        key={item.key}
        $active={activeView === item.key}
        onClick={() => onViewChange(item.key)}
      >
        {item.icon}
        {item.label}
      </ViewButton>
    ))}
  </ViewToggle>
);

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? '#2c2c2c' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-right: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.3s ease;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background: ${props => props.$active ? '#2c2c2c' : '#f8f8f8'};
    color: ${props => props.$active ? 'white' : '#2c2c2c'};
  }
`;

// ===========================================
// STATS OVERVIEW PATTERN
// ===========================================

interface StatsOverviewProps {
  stats: {
    totalItems: number;
    recentActivity: number;
  };
  portfolioConfig?: PortfolioType;
  galleryCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  stats, 
  portfolioConfig, 
  galleryCount 
}) => (
  <StatsGrid>
    <MainStatCard>
      <StatHeader>
        <StatIcon>{portfolioConfig?.icon}</StatIcon>
        <div>
          <StatTitle>Portfolio Items</StatTitle>
          <StatValue>{stats.totalItems}</StatValue>
          <StatLabel>Total</StatLabel>
        </div>
      </StatHeader>
      <ProgressBar>
        <ProgressFill $percentage={75} />
      </ProgressBar>
      <ProgressText>Portfolio Active</ProgressText>
    </MainStatCard>

    <StatCard>
      <StatIcon><Activity size={18} /></StatIcon>
      <div>
        <StatValue>{stats.recentActivity}</StatValue>
        <StatLabel>Activity</StatLabel>
      </div>
    </StatCard>

    <StatCard>
      <StatIcon><Target size={18} /></StatIcon>
      <div>
        <StatValue>{galleryCount}</StatValue>
        <StatLabel>Gallery</StatLabel>
      </div>
    </StatCard>

    <StatCard>
      <StatIcon><Target size={18} /></StatIcon>
      <div>
        <StatValue>Active</StatValue>
        <StatLabel>Status</StatLabel>
      </div>
    </StatCard>
  </StatsGrid>
);

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainStatCard = styled(Card)`
  padding: 2rem;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  flex-shrink: 0;
`;

const StatTitle = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.5rem;
`;

// ===========================================
// QUICK ACTIONS PATTERN
// ===========================================

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => (
  <Card>
    <CardContent>
      <FlexRow $justify="space-between" $align="center">
        <Heading3>Quick Actions</Heading3>
      </FlexRow>
      
      <ActionGrid>
        {actions.map((action, index) => {
          const ActionComponent = action.href ? 'a' : 'button';
          return (
            <ActionCard
              key={index}
              as={ActionComponent}
              href={action.href}
              onClick={action.onClick}
              target={action.external ? '_blank' : undefined}
            >
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionContent>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
              </ActionContent>
              <ChevronRight size={14} />
            </ActionCard>
          );
        })}
      </ActionGrid>
    </CardContent>
  </Card>
);

const ActionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
    transform: translateY(-1px);
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
  text-align: left;
`;

const ActionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
  margin-bottom: 0.125rem;
`;

const ActionDescription = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

// ===========================================
// RECENT ACTIVITY PATTERN
// ===========================================

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    category?: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
  formatTimeAgo: (date: Date) => string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  formatTimeAgo 
}) => (
  <Card>
    <CardContent>
      <FlexRow $justify="space-between" $align="center">
        <Heading3>Recent Activity</Heading3>
        <ViewAllButton>View all</ViewAllButton>
      </FlexRow>
      
      <ActivityList>
        {activities.map((activity) => (
          <ActivityItem key={activity.id}>
            <ActivityIcon><Activity size={14} /></ActivityIcon>
            <ActivityContent>
              <ActivityTitle>{activity.title}</ActivityTitle>
              <ActivityDescription>{activity.description}</ActivityDescription>
              {activity.metadata?.category && (
                <Badge>{activity.metadata.category}</Badge>
              )}
            </ActivityContent>
            <ActivityTime>{formatTimeAgo(activity.timestamp)}</ActivityTime>
          </ActivityItem>
        ))}
      </ActivityList>
    </CardContent>
  </Card>
);

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #2c2c2c;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const ActivityIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 400;
  color: #2c2c2c;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #666;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;