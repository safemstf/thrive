// src/components/thrive/utils/employerTools.tsx
import React from 'react';
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';
import {
  Eye,
  Users,
  BarChart3,
  Shield,
  Target,
  Activity,
  Award,
  Clock
} from 'lucide-react';

// Missing styled components that the main page references
export const ViewStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.sm};
  }
`;

export const ViewStatCard = styled.div`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: ${theme.transitions.normal};
  border: 1px solid ${theme.colors.border.glass};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const ViewStatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => themeUtils.alpha(props.$color, 0.1)};
  color: ${props => props.$color};
  flex-shrink: 0;
`;

export const ViewStatContent = styled.div`
  flex: 1;
`;

export const ViewStatValue = styled.div`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.secondary};
`;

export const ViewStatLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
`;

export const ViewGrid = styled.div<{ $minWidth?: string; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ $minWidth = '300px' }) => $minWidth}, 1fr));
  gap: ${({ $gap = theme.spacing.lg }) => $gap};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

export const ViewCard = styled.div`
  ${themeUtils.glass(0.95)}
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.glass};
  overflow: hidden;
  transition: ${theme.transitions.normal};
  ${themeUtils.hoverLift}
`;

export const ViewCardContent = styled.div`
  padding: ${theme.spacing.xl};
`;

export const ViewCardTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.primary};
`;

export const ViewCardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeights.relaxed};
  margin: 0 0 ${theme.spacing.lg} 0;
`;

export const ViewActionGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ViewAction = styled.button<{ $primary?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  font-size: ${theme.typography.sizes.sm};
  font-family: ${theme.typography.fonts.primary};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]});
    color: ${theme.colors.text.inverse};
    border: 1px solid ${theme.colors.primary[600]};
    
    &:hover {
      background: linear-gradient(135deg, ${theme.colors.primary[700]}, ${theme.colors.primary[800]});
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.md};
    }
  ` : `
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border.medium};
    
    &:hover {
      background: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
      border-color: ${theme.colors.primary[600]};
      transform: translateY(-1px);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

export const VerificationBadge = styled.span<{ $verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  margin-left: ${theme.spacing.sm};
  
  ${props => props.$verified ? `
    background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
    color: ${theme.colors.primary[600]};
    border: 1px solid ${themeUtils.alpha(theme.colors.primary[600], 0.2)};
  ` : `
    background: ${themeUtils.alpha(theme.colors.text.tertiary, 0.1)};
    color: ${theme.colors.text.tertiary};
    border: 1px solid ${themeUtils.alpha(theme.colors.text.tertiary, 0.2)};
  `}
`;

// Employer Tools specific components
const ToolHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const ToolIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: ${props => themeUtils.alpha(props.$color, 0.1)};
  border: 1px solid ${props => themeUtils.alpha(props.$color, 0.2)};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  flex-shrink: 0;
`;

const ToolFeatures = styled.div`
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.5)};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.glass};
`;

const ToolFeature = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Tool data
interface EmployerTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  features: string[];
  actionText: string;
  onAction: () => void;
}

const employerTools: EmployerTool[] = [
  {
    id: 'candidate-analytics',
    title: 'Candidate Analytics',
    description: 'Deep dive into candidate assessment results with detailed breakdowns of critical thinking, communication, and technical problem-solving capabilities.',
    icon: Eye,
    color: '#2c2c2c',
    features: [
      'Detailed skill breakdowns',
      'Industry benchmarking',
      'Predictive performance metrics',
      'Custom reporting'
    ],
    actionText: 'Access Tool',
    onAction: () => console.log('Opening candidate analytics')
  },
  {
    id: 'bulk-assessment',
    title: 'Bulk Assessment',
    description: 'Efficiently evaluate multiple candidates simultaneously with customizable assessment batteries tailored to specific roles and requirements.',
    icon: Users,
    color: '#666666',
    features: [
      'Batch candidate processing',
      'Role-specific assessments',
      'Automated scoring',
      'Comparative rankings'
    ],
    actionText: 'Start Batch',
    onAction: () => console.log('Starting bulk assessment')
  },
  {
    id: 'hiring-intelligence',
    title: 'Hiring Intelligence',
    description: 'Market intelligence and hiring trends specific to your industry, role requirements, and competitive landscape analysis.',
    icon: BarChart3,
    color: '#1a1a1a',
    features: [
      'Market salary data',
      'Skill availability trends',
      'Competitive analysis',
      'Hiring recommendations'
    ],
    actionText: 'View Insights',
    onAction: () => console.log('Opening hiring intelligence')
  },
  {
    id: 'verification-portal',
    title: 'Verification Portal',
    description: 'Instantly verify candidate credentials, assessment results, and professional certifications through our secure blockchain-verified system.',
    icon: Shield,
    color: '#999999',
    features: [
      'Instant verification',
      'Blockchain security',
      'Fraud detection',
      'Certificate validation'
    ],
    actionText: 'Verify Now',
    onAction: () => console.log('Opening verification portal')
  },
  {
    id: 'custom-assessments',
    title: 'Custom Assessments',
    description: 'Create bespoke assessment protocols tailored to your organization\'s specific needs, culture, and performance requirements.',
    icon: Target,
    color: '#2c2c2c',
    features: [
      'Custom question banks',
      'Company-specific scenarios',
      'Cultural fit evaluation',
      'Performance prediction'
    ],
    actionText: 'Build Assessment',
    onAction: () => console.log('Opening custom assessment builder')
  },
  {
    id: 'api-integration',
    title: 'API Integration',
    description: 'Seamlessly integrate our assessment platform with your existing ATS, HRIS, and recruiting workflows through robust APIs.',
    icon: Activity,
    color: '#666666',
    features: [
      'RESTful API access',
      'Webhook notifications',
      'ATS integration',
      'Real-time sync'
    ],
    actionText: 'View Docs',
    onAction: () => console.log('Opening API documentation')
  }
];

// Stats data
interface EmployerStat {
  id: string;
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

const employerStats: EmployerStat[] = [
  {
    id: 'verified-employers',
    value: '1,247',
    label: 'Verified Employers',
    icon: Shield,
    color: '#2c2c2c'
  },
  {
    id: 'hiring-accuracy',
    value: '89%',
    label: 'Hiring Accuracy',
    icon: Users,
    color: '#666666'
  },
  {
    id: 'time-reduction',
    value: '67%',
    label: 'Time Reduction',
    icon: Clock,
    color: '#1a1a1a'
  },
  {
    id: 'satisfaction-rate',
    value: '94%',
    label: 'Satisfaction Rate',
    icon: Award,
    color: '#999999'
  }
];

// Main component
interface EmployerToolsProps {
  onToolAction?: (toolId: string) => void;
}

export const EmployerTools: React.FC<EmployerToolsProps> = ({ onToolAction }) => {
  const handleToolAction = (tool: EmployerTool) => {
    if (onToolAction) {
      onToolAction(tool.id);
    } else {
      tool.onAction();
    }
  };

  return (
    <>
      {/* Employer Stats */}
      <ViewStatsGrid>
        {employerStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <ViewStatCard key={stat.id}>
              <ViewStatIcon $color={stat.color}>
                <IconComponent size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{stat.value}</ViewStatValue>
                <ViewStatLabel>{stat.label}</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
          );
        })}
      </ViewStatsGrid>

      {/* Employer Tools Grid */}
      <ViewGrid $minWidth="350px">
        {employerTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <ViewCard key={tool.id}>
              <ViewCardContent>
                <ToolHeader>
                  <ToolIcon $color={tool.color}>
                    <IconComponent size={24} />
                  </ToolIcon>
                  <ViewCardTitle>{tool.title}</ViewCardTitle>
                </ToolHeader>
                <ViewCardDescription>
                  {tool.description}
                </ViewCardDescription>
                <ToolFeatures>
                  {tool.features.map((feature, index) => (
                    <ToolFeature key={index}>• {feature}</ToolFeature>
                  ))}
                </ToolFeatures>
                <ViewActionGroup>
                  <ViewAction $primary onClick={() => handleToolAction(tool)}>
                    {tool.actionText}
                  </ViewAction>
                </ViewActionGroup>
              </ViewCardContent>
            </ViewCard>
          );
        })}
      </ViewGrid>
    </>
  );
};

export default EmployerTools;