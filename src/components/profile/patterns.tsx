// src/components/profile/patterns/index.tsx - Portfolio Hub Patterns
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Card, 
  CardContent, 
  BaseButton, 
  Heading1,
  Heading2, 
  Heading3,
  BodyText, 
  FlexRow, 
  FlexColumn,
  Grid,
  Badge,
  TabContainer,
  TabButton,
  Input,
  TextArea,
  FormGroup,
  Label
} from '@/styles/styled-components';
import { 
  User, 
  Settings, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Plus,
  ArrowRight,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';

// ===========================================
// LAYOUT PATTERNS
// ===========================================

export const PortfolioHubLayout = styled.div`
  max-width: 1000px;
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
// HEADER PATTERN
// ===========================================

interface HubHeaderProps {
  user: any;
  portfolio?: Portfolio | null;
  hasPortfolio: boolean;
}

export const HubHeader: React.FC<HubHeaderProps> = ({ 
  user, 
  portfolio, 
  hasPortfolio 
}) => (
  <HeaderCard>
    <UserAvatar>
      <User size={24} />
    </UserAvatar>
    <HeaderContent>
      <Heading1>Portfolio Hub</Heading1>
      <BodyText>
        {hasPortfolio 
          ? `Manage your ${portfolio?.kind} portfolio` 
          : 'Create and manage your professional portfolio'
        }
      </BodyText>
      {portfolio && (
        <PortfolioStatus>
          <StatusIndicator $status="active" />
          <span>{portfolio.title}</span>
          <Badge $variant="success">Active</Badge>
        </PortfolioStatus>
      )}
    </HeaderContent>
  </HeaderCard>
);

const HeaderCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #f8f8f8;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  color: #666;
  flex-shrink: 0;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PortfolioStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const StatusIndicator = styled.div<{ $status: 'active' | 'inactive' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$status === 'active' ? '#10b981' : '#6b7280'};
`;

// ===========================================
// ERROR ALERT PATTERN
// ===========================================

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => (
  <AlertCard $variant="error">
    <AlertIcon>
      <AlertCircle size={20} />
    </AlertIcon>
    <AlertContent>
      <AlertTitle>Error</AlertTitle>
      <AlertMessage>{message}</AlertMessage>
    </AlertContent>
    {onDismiss && (
      <AlertClose onClick={onDismiss}>
        <X size={16} />
      </AlertClose>
    )}
  </AlertCard>
);

const AlertCard = styled(Card)<{ $variant: 'error' | 'success' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-left: 4px solid ${props => {
    switch (props.$variant) {
      case 'error': return '#ef4444';
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  background: ${props => {
    switch (props.$variant) {
      case 'error': return 'rgba(239, 68, 68, 0.05)';
      case 'success': return 'rgba(16, 185, 129, 0.05)';
      case 'warning': return 'rgba(245, 158, 11, 0.05)';
      default: return '#f8f8f8';
    }
  }};
`;

const AlertIcon = styled.div`
  color: inherit;
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const AlertMessage = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const AlertClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

// ===========================================
// TAB NAVIGATION PATTERN
// ===========================================

interface Tab {
  key: string;
  label: string;
  description: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => (
  <TabContainer>
    {tabs.map((tab) => (
      <TabButton
        key={tab.key}
        $active={activeTab === tab.key}
        onClick={() => onTabChange(tab.key)}
        title={tab.description}
      >
        {tab.label}
      </TabButton>
    ))}
  </TabContainer>
);

// ===========================================
// WORKSPACE NAVIGATION PATTERN
// ===========================================

interface WorkspaceConfig {
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
}

interface WorkspaceNavigationCardProps {
  workspace?: WorkspaceConfig;
  onNavigate: (path: string) => void;
}

export const WorkspaceNavigationCard: React.FC<WorkspaceNavigationCardProps> = ({ 
  workspace, 
  onNavigate 
}) => {
  if (!workspace) return null;

  return (
    <WorkspaceCard>
      <WorkspaceIcon $color={workspace.color}>
        {workspace.icon}
      </WorkspaceIcon>
      <WorkspaceContent>
        <WorkspaceTitle>{workspace.title}</WorkspaceTitle>
        <WorkspaceDescription>{workspace.description}</WorkspaceDescription>
        <WorkspaceButton onClick={() => onNavigate(workspace.path)}>
          Open {workspace.title}
          <ArrowRight size={16} />
        </WorkspaceButton>
      </WorkspaceContent>
    </WorkspaceCard>
  );
};

const WorkspaceCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const WorkspaceIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: ${props => `${props.$color}15`};
  border: 2px solid ${props => `${props.$color}30`};
  border-radius: 16px;
  font-size: 2.5rem;
  flex-shrink: 0;
`;

const WorkspaceContent = styled.div`
  flex: 1;
`;

const WorkspaceTitle = styled(Heading3)`
  margin-bottom: 0.5rem;
`;

const WorkspaceDescription = styled(BodyText)`
  margin-bottom: 1.5rem;
`;

const WorkspaceButton = styled(BaseButton)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// ===========================================
// PORTFOLIO CREATION FLOW PATTERN
// ===========================================

interface PortfolioCreationFlowProps {
  targetType?: PortfolioKind;
  onSuccess: (data: any) => Promise<any>;
  onCancel?: () => void;
  showTypeSelection?: boolean;
}

export const PortfolioCreationFlow: React.FC<PortfolioCreationFlowProps> = ({ 
  targetType,
  onSuccess,
  onCancel,
  showTypeSelection = false
}) => {
  const [selectedType, setSelectedType] = useState<PortfolioKind>(targetType || 'creative');
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    visibility: 'public' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portfolioTypes = [
    {
      key: 'creative',
      title: 'Creative Portfolio',
      description: 'Showcase artwork, photography, and visual projects',
      icon: '🎨'
    },
    {
      key: 'educational',
      title: 'Teaching Portfolio',
      description: 'Manage courses, curriculum, and educational content',
      icon: '📚'
    },
    {
      key: 'professional',
      title: 'Tech Portfolio',
      description: 'Manage projects, code repositories, and technical work',
      icon: '💻'
    },
    {
      key: 'hybrid',
      title: 'Multi-Portfolio',
      description: 'Combine all portfolio types in one',
      icon: '🚀'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSuccess({
        ...formData,
        kind: selectedType
      });
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreationFlow>
      <CreationHeader>
        <Heading2>Create Your Portfolio</Heading2>
        <BodyText>Set up your professional portfolio to showcase your work</BodyText>
      </CreationHeader>

      {showTypeSelection && (
        <TypeSelectionGrid>
          {portfolioTypes.map((type) => (
            <TypeCard
              key={type.key}
              $selected={selectedType === type.key}
              onClick={() => setSelectedType(type.key as PortfolioKind)}
            >
              <TypeIcon>{type.icon}</TypeIcon>
              <TypeTitle>{type.title}</TypeTitle>
              <TypeDescription>{type.description}</TypeDescription>
            </TypeCard>
          ))}
        </TypeSelectionGrid>
      )}

      <CreationForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Portfolio Title</Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="My Professional Portfolio"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Portfolio Description</Label>
          <TextArea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell visitors about your work and expertise..."
            rows={4}
          />
        </FormGroup>

        <FormActions>
          {onCancel && (
            <BaseButton type="button" $variant="secondary" onClick={onCancel}>
              Cancel
            </BaseButton>
          )}
          <BaseButton type="submit" disabled={isSubmitting || !formData.title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Portfolio'}
          </BaseButton>
        </FormActions>
      </CreationForm>
    </CreationFlow>
  );
};

const CreationFlow = styled(Card)`
  padding: 2rem;
`;

const CreationHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TypeSelectionGrid = styled(Grid)`
  margin-bottom: 2rem;
`;

const TypeCard = styled.div<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  border: 2px solid ${props => props.$selected ? '#2c2c2c' : '#e0e0e0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$selected ? '#f8f8f8' : 'white'};
  
  &:hover {
    border-color: #2c2c2c;
    transform: translateY(-2px);
  }
`;

const TypeIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const TypeTitle = styled(Heading3)`
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
`;

const TypeDescription = styled(BodyText)`
  font-size: 0.875rem;
  margin-bottom: 0;
`;

const CreationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

// ===========================================
// STATS DISPLAY PATTERN
// ===========================================

interface StatsDisplayProps {
  portfolio: Portfolio;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ portfolio }) => (
  <StatsGrid>
    <StatCard>
      <StatLabel>Portfolio Type</StatLabel>
      <StatValue>{portfolio.kind}</StatValue>
    </StatCard>
    <StatCard>
      <StatLabel>Visibility</StatLabel>
      <StatValue>{portfolio.visibility}</StatValue>
    </StatCard>
    <StatCard>
      <StatLabel>Status</StatLabel>
      <StatValue>{portfolio.status}</StatValue>
    </StatCard>
    <StatCard>
      <StatLabel>Created</StatLabel>
      <StatValue>
        {portfolio.createdAt ? new Date(portfolio.createdAt).toLocaleDateString() : 'Unknown'}
      </StatValue>
    </StatCard>
  </StatsGrid>
);

const StatsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c2c2c;
  text-transform: capitalize;
`;

// ===========================================
// SETTINGS PANEL PATTERN
// ===========================================

interface SettingsPanelProps {
  portfolio: Portfolio;
  onUpdate: (updates: Partial<Portfolio>) => Promise<void>;
  onDelete: (deleteContent: boolean) => Promise<void>;
  isUpdating: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  portfolio, 
  onUpdate, 
  onDelete, 
  isUpdating 
}) => {
  const [formData, setFormData] = useState({
    title: portfolio.title,
    bio: portfolio.bio,
    visibility: portfolio.visibility
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  const handleDelete = async (deleteContent: boolean) => {
    await onDelete(deleteContent);
    setShowDeleteConfirm(false);
  };

  return (
    <SettingsCard>
      <SettingsForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Portfolio Title</Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
          />
        </FormGroup>

        <FormActions>
          <BaseButton type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </BaseButton>
        </FormActions>
      </SettingsForm>

      <DangerZone>
        <DangerHeader>
          <Heading3>Danger Zone</Heading3>
          <BodyText>Irreversible actions for your portfolio</BodyText>
        </DangerHeader>
        
        {!showDeleteConfirm ? (
          <BaseButton
            $variant="secondary"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
            Delete Portfolio
          </BaseButton>
        ) : (
          <DeleteConfirmation>
            <BodyText>Are you sure? This action cannot be undone.</BodyText>
            <FlexRow $gap="1rem">
              <BaseButton
                $variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </BaseButton>
              <BaseButton
                $variant="secondary"
                onClick={() => handleDelete(false)}
              >
                Delete Portfolio Only
              </BaseButton>
              <BaseButton
                $variant="secondary"
                onClick={() => handleDelete(true)}
              >
                Delete Everything
              </BaseButton>
            </FlexRow>
          </DeleteConfirmation>
        )}
      </DangerZone>
    </SettingsCard>
  );
};

const SettingsCard = styled(Card)`
  padding: 2rem;
`;

const SettingsForm = styled.form`
  margin-bottom: 3rem;
`;

const DangerZone = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 2rem;
`;

const DangerHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const DeleteConfirmation = styled.div`
  padding: 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
`;

// ===========================================
// UPGRADE PANEL PATTERN
// ===========================================

interface UpgradePanelProps {
  portfolio: Portfolio;
  onUpgrade: (newKind: PortfolioKind) => Promise<void>;
  isUpgrading: boolean;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({ 
  portfolio, 
  onUpgrade, 
  isUpgrading 
}) => {
  const upgradeOptions = [
    {
      from: 'creative',
      to: 'hybrid' as PortfolioKind,
      title: 'Upgrade to Hybrid',
      description: 'Add educational and professional capabilities',
      features: ['Keep all creative features', 'Add learning tracking', 'Add project management']
    },
    {
      from: 'educational',
      to: 'hybrid' as PortfolioKind,
      title: 'Upgrade to Hybrid',
      description: 'Add creative and professional capabilities',
      features: ['Keep all educational features', 'Add artwork galleries', 'Add project portfolios']
    },
    {
      from: 'professional',
      to: 'hybrid' as PortfolioKind,
      title: 'Upgrade to Hybrid',
      description: 'Add creative and educational capabilities',
      features: ['Keep all professional features', 'Add creative showcases', 'Add learning content']
    }
  ];

  const availableUpgrades = upgradeOptions.filter(option => option.from === portfolio.kind);

  if (availableUpgrades.length === 0) {
    return (
      <UpgradeCard>
        <UpgradeHeader>
          <Heading2>Portfolio Upgrade</Heading2>
          <BodyText>Your portfolio is already at the highest tier!</BodyText>
        </UpgradeHeader>
        <UpgradeComplete>
          <CheckCircle size={48} color="#10b981" />
          <Heading3>Hybrid Portfolio Active</Heading3>
          <BodyText>You have access to all portfolio features and capabilities.</BodyText>
        </UpgradeComplete>
      </UpgradeCard>
    );
  }

  return (
    <UpgradeCard>
      <UpgradeHeader>
        <Heading2>Portfolio Upgrade</Heading2>
        <BodyText>Enhance your portfolio with additional capabilities</BodyText>
      </UpgradeHeader>

      <UpgradeOptions>
        {availableUpgrades.map((upgrade) => (
          <UpgradeOption key={upgrade.to}>
            <UpgradeOptionHeader>
              <UpgradeIcon>
                <TrendingUp size={24} />
              </UpgradeIcon>
              <UpgradeOptionContent>
                <UpgradeTitle>{upgrade.title}</UpgradeTitle>
                <UpgradeDescription>{upgrade.description}</UpgradeDescription>
              </UpgradeOptionContent>
            </UpgradeOptionHeader>

            <UpgradeFeatures>
              {upgrade.features.map((feature, index) => (
                <UpgradeFeature key={index}>
                  <CheckCircle size={16} color="#10b981" />
                  {feature}
                </UpgradeFeature>
              ))}
            </UpgradeFeatures>

            <UpgradeAction>
              <BaseButton
                onClick={() => onUpgrade(upgrade.to)}
                disabled={isUpgrading}
                $variant="primary"
              >
                {isUpgrading ? 'Upgrading...' : `Upgrade to ${upgrade.title.split(' ')[2]}`}
              </BaseButton>
            </UpgradeAction>
          </UpgradeOption>
        ))}
      </UpgradeOptions>
    </UpgradeCard>
  );
};

const UpgradeCard = styled(Card)`
  padding: 2rem;
`;

const UpgradeHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const UpgradeComplete = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  gap: 1rem;
`;

const UpgradeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UpgradeOption = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #2c2c2c;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const UpgradeOptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const UpgradeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f0f9ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  color: #3b82f6;
  flex-shrink: 0;
`;

const UpgradeOptionContent = styled.div`
  flex: 1;
`;

const UpgradeTitle = styled(Heading3)`
  margin-bottom: 0.5rem;
`;

const UpgradeDescription = styled(BodyText)`
  margin-bottom: 0;
  color: #666;
`;

const UpgradeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const UpgradeFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #666;
`;

const UpgradeAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;