// src/app/dashboard/thrive/employerTools/page.tsx - Fixed offline compatible
'use client';

import React, { useState } from 'react';
import { 
  Building2, Users, FileCheck, Download, Share2, 
  Eye, Shield, BarChart3, Settings, ExternalLink
} from 'lucide-react';

// Import from styled-components hub
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  Card, CardContent, Grid, FlexRow, FlexColumn, Badge, BaseButton
} from '@/styles/styled-components';

// Import mock data
import { EMPLOYER_TOOLS, EMPLOYER_PLATFORM_METRICS } from '@/data/mockData';

import styled from 'styled-components';
import { getIconComponent } from '@/utils';

// ==============================================
// STYLED COMPONENTS
// ==============================================

const ToolsContainer = styled(PageContainer)`
  background: linear-gradient(135deg, 
    var(--color-background-primary) 0%, 
    var(--color-background-tertiary) 100%
  );
`;

const ToolCard = styled(Card)`
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-500);
  }
`;

const ToolIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
`;

const StatusBadge = styled(Badge)<{ $status: 'active' | 'coming-soon' | 'beta' }>`
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `background: rgba(34, 197, 94, 0.1); color: #16a34a;`;
      case 'beta':
        return `background: rgba(245, 158, 11, 0.1); color: #d97706;`;
      case 'coming-soon':
        return `background: rgba(156, 163, 175, 0.1); color: #6b7280;`;
    }
  }}
`;

// ==============================================
// MOCK DATA
// ==============================================


const PLATFORM_METRICS = {
  verifiedCandidates: 15420,
  partnerCompanies: 247,
  monthlyAssessments: 8930,
  averageVerificationTime: '2.3s'
};

// ==============================================
// COMPONENTS
// ==============================================

const ToolCardComponent: React.FC<{ tool: typeof EMPLOYER_TOOLS[0]; onAction: (id: string) => void }> = ({ 
  tool, 
  onAction 
}) => {
  const Icon = getIconComponent(tool.icon);
  
  return (
    <ToolCard onClick={() => onAction(tool.id)}>
      <CardContent>
        <FlexRow $justify="space-between" $align="flex-start" style={{ marginBottom: 'var(--spacing-md)' }}>
          <ToolIcon $color={tool.color}>
            <Icon size={24} />
          </ToolIcon>
          <StatusBadge $status={tool.status}>
            {tool.status === 'coming-soon' ? 'Coming Soon' : tool.status}
          </StatusBadge>
        </FlexRow>
        
        <h3 style={{ 
          margin: '0 0 var(--spacing-sm)', 
          fontSize: '1.25rem',
          color: 'var(--color-text-primary)'
        }}>
          {tool.title}
        </h3>
        
        <BodyText style={{ 
          margin: '0 0 var(--spacing-lg)', 
          color: 'var(--color-text-secondary)' 
        }}>
          {tool.description}
        </BodyText>
        
        <FlexColumn $gap="var(--spacing-xs)">
          {tool.features.map((feature, index) => (
            <FlexRow key={index} $gap="var(--spacing-xs)" $align="center">
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-primary-500)'
              }} />
              <span style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)' 
              }}>
                {feature}
              </span>
            </FlexRow>
          ))}
        </FlexColumn>
        
        <FlexRow $justify="space-between" $align="center" style={{ marginTop: 'var(--spacing-lg)' }}>
          <BaseButton 
            $variant={tool.status === 'active' ? 'primary' : 'secondary'}
            $size="sm"
            disabled={tool.status === 'coming-soon'}
          >
            {tool.status === 'active' ? 'Launch Tool' : 
             tool.status === 'beta' ? 'Try Beta' : 'Notify Me'}
          </BaseButton>
          
          {tool.status === 'active' && (
            <ExternalLink size={16} style={{ color: 'var(--color-text-secondary)' }} />
          )}
        </FlexRow>
      </CardContent>
    </ToolCard>
  );
};

// ==============================================
// MAIN COMPONENT
// ==============================================

export default function EmployerToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolAction = (toolId: string) => {
    setSelectedTool(toolId);
    console.log('Tool action:', toolId);
    
    // Handle offline actions
    switch (toolId) {
      case 'candidate-verification':
        alert('Candidate Verification tool would launch here');
        break;
      case 'bulk-assessment':
        alert('Bulk Assessment portal would open here');
        break;
      case 'skills-analytics':
        alert('Skills Analytics dashboard would load here');
        break;
      default:
        alert(`${toolId} tool would launch here`);
    }
  };

  return (
    <ToolsContainer>
      <ContentWrapper>
        {/* Hero Section */}
        <Section>
          <FlexRow $justify="space-between" $align="center" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div>
              <Heading1>Employer Tools</Heading1>
              <BodyText $size="lg" style={{ marginBottom: 0 }}>
                Powerful tools to streamline your hiring and team development process
              </BodyText>
            </div>
            <Badge style={{ 
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
              color: 'white',
              padding: 'var(--spacing-sm) var(--spacing-lg)'
            }}>
              <Building2 size={16} />
              Enterprise Ready
            </Badge>
          </FlexRow>

          {/* Platform Metrics */}
          <Grid $columns={4} $gap="var(--spacing-lg)" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: 'var(--color-primary-600)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {EMPLOYER_PLATFORM_METRICS.verifiedCandidates.toLocaleString()}
                </div>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Verified Candidates
                </BodyText>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: 'var(--color-primary-600)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {EMPLOYER_PLATFORM_METRICS.partnerCompanies}
                </div>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Partner Companies
                </BodyText>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: 'var(--color-primary-600)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {EMPLOYER_PLATFORM_METRICS.monthlyAssessments.toLocaleString()}
                </div>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Monthly Assessments
                </BodyText>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: 'var(--color-primary-600)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {EMPLOYER_PLATFORM_METRICS.averageVerificationTime}
                </div>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Avg Verification Time
                </BodyText>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* Tools Grid */}
        <Section>
          <Heading2>Available Tools</Heading2>
          <BodyText style={{ marginBottom: 'var(--spacing-xl)' }}>
            Comprehensive suite of tools designed for modern hiring teams
          </BodyText>

          <Grid $minWidth="350px" $gap="var(--spacing-xl)">
            {EMPLOYER_TOOLS.map((tool) => (
              <ToolCardComponent 
                key={tool.id} 
                tool={tool} 
                onAction={handleToolAction}
              />
            ))}
          </Grid>
        </Section>

        {/* Enterprise Contact */}
        <Section>
          <Card style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <CardContent>
              <Heading2 style={{ marginBottom: 'var(--spacing-md)' }}>
                Need Custom Enterprise Solutions?
              </Heading2>
              <BodyText style={{ 
                marginBottom: 'var(--spacing-xl)',
                maxWidth: '600px',
                margin: '0 auto var(--spacing-xl)'
              }}>
                Get in touch with our enterprise team to discuss custom integrations, 
                white-label solutions, and volume pricing.
              </BodyText>
              <FlexRow $justify="center" $gap="var(--spacing-md)">
                <BaseButton $variant="primary">
                  <Building2 size={16} />
                  Contact Enterprise Team
                </BaseButton>
                <BaseButton $variant="secondary">
                  <Download size={16} />
                  Download Documentation
                </BaseButton>
              </FlexRow>
            </CardContent>
          </Card>
        </Section>
      </ContentWrapper>
    </ToolsContainer>
  );
}