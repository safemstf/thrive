// src/components/thrive/utils/employerTools.tsx - Revamped with Modular System
import React from 'react';
import {
  Grid, Card, FlexRow, FlexColumn, BaseButton, Badge, IconContainer
} from '@/styles/styled-components';
import {
  Eye, Users, BarChart3, Shield, Target, Activity, Award, Clock
} from 'lucide-react';

// ==============================================
// INTERFACES
// ==============================================
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

interface EmployerStat {
  id: string;
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

interface EmployerToolsProps {
  onToolAction?: (toolId: string) => void;
}

// ==============================================
// DATA
// ==============================================
const employerStats: EmployerStat[] = [
  {
    id: 'verified-employers',
    value: '1,247',
    label: 'Verified Employers',
    icon: Shield,
    color: 'var(--color-primary-500)'
  },
  {
    id: 'hiring-accuracy',
    value: '89%',
    label: 'Hiring Accuracy', 
    icon: Users,
    color: 'var(--color-primary-600)'
  },
  {
    id: 'time-reduction',
    value: '67%',
    label: 'Time Reduction',
    icon: Clock,
    color: 'var(--color-primary-700)'
  },
  {
    id: 'satisfaction-rate',
    value: '94%',
    label: 'Satisfaction Rate',
    icon: Award,
    color: 'var(--color-primary-800)'
  }
];

const employerTools: EmployerTool[] = [
  {
    id: 'candidate-analytics',
    title: 'Candidate Analytics',
    description: 'Deep dive into candidate assessment results with detailed breakdowns of critical thinking, communication, and technical problem-solving capabilities.',
    icon: Eye,
    color: 'var(--color-primary-500)',
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
    color: 'var(--color-primary-600)',
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
    color: 'var(--color-primary-700)',
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
    color: 'var(--color-primary-800)',
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
    color: 'var(--color-primary-500)',
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
    color: 'var(--color-primary-600)',
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

// ==============================================
// MAIN COMPONENT
// ==============================================
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
      {/* Employer Stats - Using Modular Grid */}
      <Grid $columns={4} $gap="var(--spacing-md)" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {employerStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.id} $hover $padding="lg">
              <FlexRow $gap="var(--spacing-sm)" $responsive={false}>
                <IconContainer $color={stat.color} $size="sm">
                  <IconComponent size={20} />
                </IconContainer>
                <FlexColumn $gap="var(--spacing-xs)">
                  <div style={{ 
                    fontSize: 'var(--font-size-xl)', 
                    fontWeight: 'var(--font-weight-bold)', 
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-display)'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-xs)', 
                    color: 'var(--color-text-secondary)',
                    fontWeight: 'var(--font-weight-medium)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.label}
                  </div>
                </FlexColumn>
              </FlexRow>
            </Card>
          );
        })}
      </Grid>

      {/* Employer Tools Grid - Using Modular Grid */}
      <Grid $minWidth="350px" $gap="var(--spacing-lg)">
        {employerTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card key={tool.id} $hover $padding="lg">
              <FlexColumn $gap="var(--spacing-lg)">
                {/* Tool Header */}
                <FlexRow $gap="var(--spacing-lg)" $responsive={false}>
                  <IconContainer $color={tool.color} $size="lg">
                    <IconComponent size={24} />
                  </IconContainer>
                  <h3 style={{ 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    fontFamily: 'var(--font-body)'
                  }}>
                    {tool.title}
                  </h3>
                </FlexRow>

                {/* Description */}
                <p style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {tool.description}
                </p>

                {/* Features */}
                <Card $padding="md" style={{ 
                  background: 'rgba(247, 250, 252, 0.5)',
                  border: '1px solid var(--color-border-light)'
                }}>
                  <FlexColumn $gap="var(--spacing-xs)">
                    {tool.features.map((feature, index) => (
                      <div key={index} style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-text-secondary)'
                      }}>
                        • {feature}
                      </div>
                    ))}
                  </FlexColumn>
                </Card>

                {/* Action Button */}
                <BaseButton 
                  $variant="primary" 
                  $fullWidth 
                  onClick={() => handleToolAction(tool)}
                >
                  {tool.actionText}
                </BaseButton>
              </FlexColumn>
            </Card>
          );
        })}
      </Grid>
    </>
  );
};

// ==============================================
// VERIFICATION BADGE COMPONENT (Simplified)
// ==============================================
export const VerificationBadge: React.FC<{ verified: boolean; children: React.ReactNode }> = ({ 
  verified, 
  children 
}) => (
  <Badge 
    $variant={verified ? 'success' : 'default'}
    style={{ 
      fontSize: 'var(--font-size-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginLeft: 'var(--spacing-sm)'
    }}
  >
    <FlexRow $gap="var(--spacing-xs)" $responsive={false}>
      {verified && <Shield size={12} />}
      {children}
    </FlexRow>
  </Badge>
);

export default EmployerTools;