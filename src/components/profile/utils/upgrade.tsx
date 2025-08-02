// src/components/profile/utils/upgrade.tsx - Fixed with proper error handling
'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Zap, CheckCircle, Brush, GraduationCap, Code, Layers,
  ArrowUpRight, Star, Crown, Sparkles, Plus, Unlock, Loader2
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';

interface UpgradeProps {
  portfolio: Portfolio;
  onUpgrade: (newKind: PortfolioKind) => Promise<void>;
  isUpgrading?: boolean;
}

// Safe portfolio configuration with fallbacks
const getPortfolioConfig = (kind: PortfolioKind) => {
  const configs = {
    creative: {
      icon: <Brush size={24} />,
      title: 'Creative Portfolio',
      description: 'Showcase your artwork, designs, and creative projects',
      features: ['Image galleries', 'Portfolio showcase', 'Creative collections']
    },
    educational: {
      icon: <GraduationCap size={24} />,
      title: 'Educational Portfolio', 
      description: 'Track your academic progress and learning achievements',
      features: ['Progress tracking', 'Concept mastery', 'Learning analytics']
    },
    professional: {
      icon: <Code size={24} />,
      title: 'Professional Portfolio',
      description: 'Highlight your technical skills and professional experience', 
      features: ['Code repositories', 'Technical projects', 'Professional timeline']
    },
    hybrid: {
      icon: <Layers size={24} />,
      title: 'Hybrid Portfolio',
      description: 'Combine creative works with educational progress',
      features: ['Creative showcase', 'Learning progress', 'Unified dashboard']
    }
  };

  return configs[kind] || {
    icon: <Layers size={24} />,
    title: 'Portfolio',
    description: 'Your portfolio',
    features: ['Basic Portfolio']
  };
};

const canUpgrade = (currentKind: PortfolioKind): boolean => {
  return currentKind !== 'hybrid';
};

export function PortfolioUpgrade({ portfolio, onUpgrade, isUpgrading = false }: UpgradeProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState<PortfolioKind>('hybrid');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Safe access to portfolio configuration
  const currentConfig = getPortfolioConfig(portfolio.kind);
  
  const getUpgradeOptions = (): PortfolioKind[] => {
    if (portfolio.kind === 'hybrid') return [];
    return ['hybrid']; // For now, all paths lead to hybrid
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
              <FeatureIcon>
                <Brush size={20} />
              </FeatureIcon>
              <FeatureTitle>Creative Studio</FeatureTitle>
              <FeatureDescription>Full gallery management</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>
                <GraduationCap size={20} />
              </FeatureIcon>
              <FeatureTitle>Learning Center</FeatureTitle>
              <FeatureDescription>Progress tracking</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>
                <Code size={20} />
              </FeatureIcon>
              <FeatureTitle>Professional Hub</FeatureTitle>
              <FeatureDescription>Project showcase</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>
                <Sparkles size={20} />
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

  const hybridConfig = getPortfolioConfig('hybrid');
  const newFeatures = getNewFeatures();
  const allHybridFeatures = [
    'Creative gallery & showcase',
    'Learning progress tracking', 
    'Professional project display',
    'Advanced analytics',
    'Enhanced customization',
    'Priority support'
  ];

  return (
    <UpgradeContainer>
      {/* Current Plan Section */}
      <CurrentPlanSection>
        <CurrentPlanHeader>
          <CurrentPlanIcon>
            {currentConfig.icon}
          </CurrentPlanIcon>
          <CurrentPlanInfo>
            <CurrentPlanTitle>Current Plan</CurrentPlanTitle>
            <CurrentPlanName>{currentConfig.title}</CurrentPlanName>
          </CurrentPlanInfo>
        </CurrentPlanHeader>
        <CurrentFeatures>
          {currentConfig.features.map((feature, index) => (
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
          if (kind !== 'hybrid') return null;

          return (
            <UpgradeOption
              key={kind}
              $selected={selectedUpgrade === kind}
              onClick={() => setSelectedUpgrade(kind)}
            >
              <UpgradeOptionHeader>
                <UpgradeOptionIcon>
                  {hybridConfig.icon}
                </UpgradeOptionIcon>
                <UpgradeOptionInfo>
                  <UpgradeOptionTitle>{hybridConfig.title}</UpgradeOptionTitle>
                  <UpgradeOptionPrice>Free Upgrade</UpgradeOptionPrice>
                </UpgradeOptionInfo>
                <RecommendedBadge>
                  <Star size={14} />
                  Recommended
                </RecommendedBadge>
              </UpgradeOptionHeader>

              <UpgradeDescription>{hybridConfig.description}</UpgradeDescription>

              {/* New Features You'll Get */}
              {newFeatures.length > 0 && (
                <NewFeaturesSection>
                  <NewFeaturesTitle>
                    <Plus size={16} />
                    New features you'll unlock:
                  </NewFeaturesTitle>
                  <NewFeaturesList>
                    {newFeatures.map((feature, index) => (
                      <NewFeature key={index}>
                        <Unlock size={14} />
                        {feature}
                      </NewFeature>
                    ))}
                  </NewFeaturesList>
                </NewFeaturesSection>
              )}

              {/* All Features */}
              <AllFeatures>
                <AllFeaturesTitle>All features included:</AllFeaturesTitle>
                <FeatureColumns>
                  {allHybridFeatures.map((feature, index) => (
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
              >
                {isUpgrading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    Upgrade to {hybridConfig.title}
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
              <Zap size={24} />
              <ModalTitle>Confirm Portfolio Upgrade</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <ConfirmationText>
                You're about to upgrade from <strong>{currentConfig.title}</strong> to{' '}
                <strong>{hybridConfig.title}</strong>.
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

// Professional Styled Components
const UpgradeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CurrentPlanSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const CurrentPlanHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CurrentPlanIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
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
  color: #666666;
  margin-bottom: 0.25rem;
  font-family: 'Work Sans', sans-serif;
`;

const CurrentPlanName = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
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
  font-family: 'Work Sans', sans-serif;
  
  svg {
    color: #666666;
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
  font-weight: 600;
  color: #2c2c2c;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeSubtitle = styled.p`
  font-size: 1.125rem;
  color: #666666;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeOption = styled.div<{ $selected: boolean }>`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border: 2px solid ${props => props.$selected ? '#2c2c2c' : '#e5e7eb'};
  border-radius: 16px;
  padding: 2.5rem;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #2c2c2c;
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

const UpgradeOptionIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 25px rgba(44, 44, 44, 0.15);
`;

const UpgradeOptionInfo = styled.div`
  flex: 1;
`;

const UpgradeOptionTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeOptionPrice = styled.div`
  font-size: 1.125rem;
  color: #666666;
  font-weight: 600;
  font-family: 'Work Sans', sans-serif;
`;

const RecommendedBadge = styled.div`
  position: absolute;
  top: -8px;
  right: 0;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 4px 12px rgba(44, 44, 44, 0.3);
  font-family: 'Work Sans', sans-serif;
`;

const UpgradeDescription = styled.p`
  font-size: 1rem;
  color: #666666;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const NewFeaturesSection = styled.div`
  background: rgba(44, 44, 44, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(44, 44, 44, 0.1);
`;

const NewFeaturesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 1rem;
  font-family: 'Work Sans', sans-serif;
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
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  
  svg {
    color: #666666;
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
  font-family: 'Work Sans', sans-serif;
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
  font-family: 'Work Sans', sans-serif;
  
  svg {
    color: #666666;
    flex-shrink: 0;
  }
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
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
  box-shadow: 0 4px 15px rgba(44, 44, 44, 0.1);
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(44, 44, 44, 0.15);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const MaxedOutSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const CrownIcon = styled.div`
  color: #2c2c2c;
  margin-bottom: 1.5rem;
`;

const MaxedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 1rem;
  font-family: 'Work Sans', sans-serif;
`;

const MaxedDescription = styled.p`
  font-size: 1.125rem;
  color: #666666;
  margin-bottom: 3rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Work Sans', sans-serif;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(44, 44, 44, 0.1);
  color: #2c2c2c;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
`;

const FeatureTitle = styled.h4`
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  font-family: 'Work Sans', sans-serif;
`;

const FeatureDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;

// Modal Components (continuing with professional styling)
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
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;

const ModalBody = styled.div`
  padding: 0 2rem 1rem 2rem;
`;

const ConfirmationText = styled.p`
  color: #374151;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

const ConfirmationNote = styled.div`
  background: rgba(44, 44, 44, 0.05);
  border: 1px solid rgba(44, 44, 44, 0.1);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
  color: #2c2c2c;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
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
  font-family: 'Work Sans', sans-serif;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(44, 44, 44, 0.3);
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`;

const FAQTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 2rem 0;
  text-align: center;
  font-family: 'Work Sans', sans-serif;
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
  }
`;

const FAQQuestion = styled.h4`
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
`;

const FAQAnswer = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  line-height: 1.5;
  font-family: 'Work Sans', sans-serif;
`;