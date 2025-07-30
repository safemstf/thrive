// src/components/profile/utils/upgrade.tsx
'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Zap, 
  CheckCircle, 
  X, 
  Brush, 
  GraduationCap, 
  Code, 
  Layers,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Shield,
  Camera,
  BookOpen,
  Briefcase,
  Target,
  Award,
  Loader2,
  Crown,
  Sparkles,
  Lock,
  Unlock,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';
import { PORTFOLIO_KINDS, canUpgrade } from '@/types/portfolio.types';

interface UpgradeProps {
  portfolio: Portfolio;
  onUpgrade: (newKind: PortfolioKind) => Promise<void>;
  isUpgrading?: boolean;
}

export function PortfolioUpgrade({ portfolio, onUpgrade, isUpgrading = false }: UpgradeProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState<PortfolioKind>('hybrid');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const getCurrentConfig = () => {
    switch (portfolio.kind) {
      case 'creative':
        return {
          icon: <Brush size={24} />,
          title: 'Creative Portfolio',
          color: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
        };
      case 'educational':
        return {
          icon: <GraduationCap size={24} />,
          title: 'Educational Portfolio',
          color: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
        };
      case 'professional':
        return {
          icon: <Code size={24} />,
          title: 'Professional Portfolio',
          color: '#059669',
          gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
        };
      default:
        return {
          icon: <Layers size={24} />,
          title: 'Portfolio',
          color: '#6b7280',
          gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
        };
    }
  };

  const getUpgradeOptions = (): PortfolioKind[] => {
    if (portfolio.kind === 'hybrid') return [];
    return ['hybrid']; // For now, all paths lead to hybrid
  };

  const getUpgradeConfig = (kind: PortfolioKind) => {
    switch (kind) {
      case 'hybrid':
        return {
          icon: <Layers size={32} />,
          title: 'Hybrid Portfolio',
          color: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
          price: 'Free Upgrade',
          description: 'Combine all portfolio capabilities into one powerful platform',
          features: [
            'Creative gallery & showcase',
            'Learning progress tracking',
            'Professional project display',
            'Advanced analytics',
            'Enhanced customization',
            'Priority support'
          ],
          newFeatures: getNewFeatures()
        };
      default:
        return null;
    }
  };

  const getNewFeatures = () => {
    const current = portfolio.kind;
    const features: string[] = [];
    
    if (current !== 'creative') {
      features.push('Creative gallery & art showcase');
      features.push('Visual portfolio layouts');
    }
    if (current !== 'educational') {
      features.push('Learning progress tracking');
      features.push('Concept mastery analytics');
    }
    if (current !== 'professional') {
      features.push('Professional project showcase');
      features.push('Technical skills display');
    }
    
    return features;
  };

  const currentConfig = getCurrentConfig();
  const upgradeOptions = getUpgradeOptions();

  if (!canUpgrade(portfolio.kind)) {
    return (
      <UpgradeContainer>
        <MaxedOutSection>
          <CrownIcon>
            <Crown size={48} />
          </CrownIcon>
          <MaxedTitle>You're Already at the Top!</MaxedTitle>
          <MaxedDescription>
            Your hybrid portfolio has access to all available features. You're getting the full experience!
          </MaxedDescription>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon $color="#8b5cf6">
                <Brush size={20} />
              </FeatureIcon>
              <FeatureTitle>Creative Studio</FeatureTitle>
              <FeatureDescription>Full gallery management</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon $color="#3b82f6">
                <GraduationCap size={20} />
              </FeatureIcon>
              <FeatureTitle>Learning Center</FeatureTitle>
              <FeatureDescription>Progress tracking</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon $color="#059669">
                <Code size={20} />
              </FeatureIcon>
              <FeatureTitle>Professional Hub</FeatureTitle>
              <FeatureDescription>Project showcase</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon $color="#f59e0b">
                <TrendingUp size={20} />
              </FeatureIcon>
              <FeatureTitle>Advanced Analytics</FeatureTitle>
              <FeatureDescription>Detailed insights</FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </MaxedOutSection>
      </UpgradeContainer>
    );
  }

  const handleUpgrade = async () => {
    try {
      await onUpgrade(selectedUpgrade);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <UpgradeContainer>
      {/* Current Plan Section */}
      <CurrentPlanSection>
        <CurrentPlanHeader>
          <CurrentPlanIcon $gradient={currentConfig.gradient}>
            {currentConfig.icon}
          </CurrentPlanIcon>
          <CurrentPlanInfo>
            <CurrentPlanTitle>Current Plan</CurrentPlanTitle>
            <CurrentPlanName>{currentConfig.title}</CurrentPlanName>
          </CurrentPlanInfo>
        </CurrentPlanHeader>
        <CurrentFeatures>
          {PORTFOLIO_KINDS[portfolio.kind].features.map((feature, index) => (
            <CurrentFeature key={index}>
              <CheckCircle size={16} />
              {feature}
            </CurrentFeature>
          ))}
        </CurrentFeatures>
      </CurrentPlanSection>

      {/* Upgrade Section */}
      <UpgradeSection>
        <UpgradeHeader>
          <Sparkles size={24} />
          <UpgradeTitle>Unlock More Capabilities</UpgradeTitle>
          <UpgradeSubtitle>
            Expand your portfolio with additional features and functionality
          </UpgradeSubtitle>
        </UpgradeHeader>

        {upgradeOptions.map(kind => {
          const config = getUpgradeConfig(kind);
          if (!config) return null;

          return (
            <UpgradeOption
              key={kind}
              $selected={selectedUpgrade === kind}
              onClick={() => setSelectedUpgrade(kind)}
            >
              <UpgradeOptionHeader>
                <UpgradeOptionIcon $gradient={config.gradient}>
                  {config.icon}
                </UpgradeOptionIcon>
                <UpgradeOptionInfo>
                  <UpgradeOptionTitle>{config.title}</UpgradeOptionTitle>
                  <UpgradeOptionPrice>{config.price}</UpgradeOptionPrice>
                </UpgradeOptionInfo>
                <RecommendedBadge>
                  <Star size={14} />
                  Recommended
                </RecommendedBadge>
              </UpgradeOptionHeader>

              <UpgradeDescription>{config.description}</UpgradeDescription>

              {/* New Features You'll Get */}
              <NewFeaturesSection>
                <NewFeaturesTitle>
                  <Plus size={16} />
                  New features you'll unlock:
                </NewFeaturesTitle>
                <NewFeaturesList>
                  {config.newFeatures.map((feature, index) => (
                    <NewFeature key={index}>
                      <Unlock size={14} />
                      {feature}
                    </NewFeature>
                  ))}
                </NewFeaturesList>
              </NewFeaturesSection>

              {/* All Features */}
              <AllFeatures>
                <AllFeaturesTitle>All features included:</AllFeaturesTitle>
                <FeatureColumns>
                  {config.features.map((feature, index) => (
                    <Feature key={index}>
                      <CheckCircle size={14} />
                      {feature}
                    </Feature>
                  ))}
                </FeatureColumns>
              </AllFeatures>

              <UpgradeButton
                onClick={() => setShowConfirmation(true)}
                disabled={isUpgrading}
                $gradient={config.gradient}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    Upgrade to {config.title}
                    <ArrowUpRight size={16} />
                  </>
                )}
              </UpgradeButton>
            </UpgradeOption>
          );
        })}
      </UpgradeSection>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <Modal>
          <ModalOverlay onClick={() => setShowConfirmation(false)} />
          <ModalContent>
            <ModalHeader>
              <Zap size={24} color="#f59e0b" />
              <ModalTitle>Confirm Portfolio Upgrade</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <ConfirmationText>
                You're about to upgrade from <strong>{currentConfig.title}</strong> to{' '}
                <strong>{getUpgradeConfig(selectedUpgrade)?.title}</strong>.
              </ConfirmationText>
              <ConfirmationNote>
                ✅ All your existing content will be preserved<br/>
                ✅ New features will be available immediately<br/>
                ✅ You can continue using all current features
              </ConfirmationNote>
            </ModalBody>
            <ModalActions>
              <ModalButton 
                onClick={() => setShowConfirmation(false)}
                disabled={isUpgrading}
              >
                Cancel
              </ModalButton>
              <ModalButton 
                $primary 
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  'Confirm Upgrade'
                )}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* FAQ Section */}
      <FAQSection>
        <FAQTitle>Frequently Asked Questions</FAQTitle>
        <FAQGrid>
          <FAQItem>
            <FAQQuestion>Will I lose my existing content?</FAQQuestion>
            <FAQAnswer>No! All your current content will be preserved and enhanced with new features.</FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Can I downgrade later?</FAQQuestion>
            <FAQAnswer>While upgrades are recommended, you can contact support if you need to modify your portfolio type.</FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Are there any additional costs?</FAQQuestion>
            <FAQAnswer>No, portfolio upgrades are completely free. You only pay for premium hosting features if you choose them.</FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>How long does the upgrade take?</FAQQuestion>
            <FAQAnswer>Upgrades are instant! New features will be available immediately after confirmation.</FAQAnswer>
          </FAQItem>
        </FAQGrid>
      </FAQSection>
    </UpgradeContainer>
  );
}

// Styled Components
const UpgradeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CurrentPlanSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CurrentPlanHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CurrentPlanIcon = styled.div<{ $gradient: string }>`
  width: 64px;
  height: 64px;
  background: ${props => props.$gradient};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const CurrentPlanInfo = styled.div`
  flex: 1;
`;

const CurrentPlanTitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const CurrentPlanName = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
`;

const CurrentFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const CurrentFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
`;

const UpgradeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const UpgradeHeader = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const UpgradeTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const UpgradeSubtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const UpgradeOption = styled.div<{ $selected: boolean }>`
  background: white;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 20px;
  padding: 2.5rem;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const UpgradeOptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
`;

const UpgradeOptionIcon = styled.div<{ $gradient: string }>`
  width: 80px;
  height: 80px;
  background: ${props => props.$gradient};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
`;

const UpgradeOptionInfo = styled.div`
  flex: 1;
`;

const UpgradeOptionTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const UpgradeOptionPrice = styled.div`
  font-size: 1.125rem;
  color: #10b981;
  font-weight: 600;
`;

const RecommendedBadge = styled.div`
  position: absolute;
  top: -8px;
  right: 0;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
`;

const UpgradeDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const NewFeaturesSection = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #dbeafe;
`;

const NewFeaturesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 1rem;
`;

const NewFeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NewFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e40af;
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
`;

const AllFeatures = styled.div`
  margin-bottom: 2rem;
`;

const AllFeaturesTitle = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const FeatureColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
`;

const UpgradeButton = styled.button<{ $gradient: string }>`
  background: ${props => props.$gradient};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const MaxedOutSection = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  border: 2px solid #e5e7eb;
`;

const CrownIcon = styled.div`
  color: #f59e0b;
  margin-bottom: 1.5rem;
`;

const MaxedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const MaxedDescription = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 3rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FeatureIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
`;

const FeatureTitle = styled.h4`
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  position: relative;
  z-index: 1;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 2rem 1rem 2rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ModalBody = styled.div`
  padding: 0 2rem 1rem 2rem;
`;

const ConfirmationText = styled.p`
  color: #374151;
  margin: 0 0 1rem 0;
  line-height: 1.6;
`;

const ConfirmationNote = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
  color: #0c4a6e;
  line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 2rem 2rem 2rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const FAQSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FAQTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2rem 0;
  text-align: center;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FAQItem = styled.div`
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
`;

const FAQQuestion = styled.h4`
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
`;

const FAQAnswer = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;