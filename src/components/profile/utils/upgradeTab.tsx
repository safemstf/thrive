// src/components/profile/utils/upgradeTab.tsx
'use client';

import React, { useState } from 'react';
import { 
  Zap, CheckCircle, Brush, GraduationCap, Code, Layers,
  ArrowUpRight, Star, Crown, Sparkles, Plus, Unlock, Loader2,
  Images, BookOpen, Briefcase, Palette, Camera, PenTool, FileText
} from 'lucide-react';
import type { Portfolio, PortfolioKind } from '@/types/portfolio.types';

interface UpgradeTabContentProps {
  portfolio: Portfolio;
  onUpgrade: (newKind: PortfolioKind) => Promise<void>;
  isUpgrading?: boolean;
}

// Enhanced portfolio configuration with gallery and writing capabilities
const getPortfolioConfig = (kind: PortfolioKind) => {
  const configs = {
    creative: {
      icon: <Brush size={28} />,
      title: 'Creative Portfolio',
      subtitle: 'For Artists & Designers',
      description: 'Perfect for showcasing artwork, photography, designs, and creative projects with beautiful gallery layouts.',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      features: [
        'Unlimited image galleries',
        'Multiple layout options (grid, masonry, list)',
        'High-resolution image support', 
        'Portfolio showcase pages',
        'Client presentation tools',
        'Social media integration',
        'Custom portfolio themes',
        'Artwork metadata management',
        'Gallery collections'
      ],
      capabilities: ['Gallery Management', 'Visual Showcase', 'Client Presentations'],
      targetUsers: ['Digital Artists', 'Photographers', 'Graphic Designers', 'Illustrators'],
      newFeatures: {
        gallery: ['Advanced gallery layouts', 'Artwork categorization', 'High-res image support'],
        writing: []
      }
    },
    educational: {
      icon: <GraduationCap size={28} />,
      title: 'Educational Portfolio',
      subtitle: 'For Students & Learners',
      description: 'Track academic progress, showcase learning achievements, and demonstrate skill development over time.',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      features: [
        'Learning progress tracking',
        'Concept mastery analytics',
        'Achievement showcase',
        'Study timeline visualization',
        'Skill development tracking',
        'Academic project display',
        'Progress sharing tools',
        'Educational content creation',
        'Study material organization'
      ],
      capabilities: ['Progress Tracking', 'Concept Mastery', 'Learning Analytics'],
      targetUsers: ['Students', 'Academics', 'Researchers', 'Lifelong Learners'],
      newFeatures: {
        gallery: [],
        writing: ['Educational content creation', 'Study guides', 'Research papers']
      }
    },
    professional: {
      icon: <Code size={28} />,
      title: 'Professional Portfolio',
      subtitle: 'For Developers & Professionals',
      description: 'Highlight technical skills, professional experience, and career achievements in a polished format.',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      features: [
        'Code repository integration',
        'Technical project showcase',
        'Professional timeline',
        'Skills & certifications display',
        'Resume integration',
        'Contact & networking tools',
        'Professional analytics',
        'Technical documentation',
        'Career milestone tracking'
      ],
      capabilities: ['Project Showcase', 'Technical Skills', 'Career Timeline'],
      targetUsers: ['Software Developers', 'Engineers', 'Consultants', 'Professionals'],
      newFeatures: {
        gallery: [],
        writing: ['Technical documentation', 'Blog posts', 'Case studies']
      }
    },
    hybrid: {
      icon: <Layers size={28} />,
      title: 'Hybrid Portfolio',
      subtitle: 'All-in-One Solution',
      description: 'The ultimate portfolio combining creative showcase, learning progress, and professional development.',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      features: [
        'All creative portfolio features',
        'All educational portfolio features', 
        'All professional portfolio features',
        'Advanced gallery management',
        'Comprehensive writing system',
        'Unified dashboard',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        'Multi-format content support'
      ],
      capabilities: [
        'Multi-discipline Showcase', 
        'Comprehensive Portfolio', 
        'Gallery & Writing Hub',
        'All Features Unlocked'
      ],
      targetUsers: ['Multi-disciplinary Professionals', 'Freelancers', 'Educators', 'Entrepreneurs'],
      newFeatures: {
        gallery: ['Professional gallery management', 'Advanced layouts', 'Collection organization'],
        writing: ['Full writing system', 'Content management', 'Publishing tools']
      }
    }
  };

  return configs[kind] || configs.creative;
};

// Define what each portfolio type can access
const getCapabilities = (kind: PortfolioKind) => {
  const capabilities = {
    creative: { hasGallery: true, hasWriting: false },
    educational: { hasGallery: false, hasWriting: true },
    professional: { hasGallery: false, hasWriting: true },
    hybrid: { hasGallery: true, hasWriting: true }
  };
  
  return capabilities[kind] || { hasGallery: false, hasWriting: false };
};

export const UpgradeTabContent: React.FC<UpgradeTabContentProps> = ({ 
  portfolio, 
  onUpgrade, 
  isUpgrading = false 
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<PortfolioKind>('hybrid');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentConfig = getPortfolioConfig(portfolio.kind);
  const currentCapabilities = getCapabilities(portfolio.kind);
  
  // Get available upgrade options
  const getUpgradeOptions = (): PortfolioKind[] => {
    if (portfolio.kind === 'hybrid') return [];
    
    const options: PortfolioKind[] = [];
    
    // Always show hybrid as the premium option
    options.push('hybrid');
    
    // Add other specific upgrades based on current type
    if (portfolio.kind === 'educational') {
      options.unshift('creative', 'professional');
    } else if (portfolio.kind === 'creative') {
      options.unshift('professional', 'educational');
    } else if (portfolio.kind === 'professional') {
      options.unshift('creative', 'educational');
    }
    
    return options;
  };

  const getNewFeatures = (targetKind: PortfolioKind) => {
    const targetConfig = getPortfolioConfig(targetKind);
    const targetCapabilities = getCapabilities(targetKind);
    const newFeatures: string[] = [];
    
    // Add gallery features if not currently available
    if (!currentCapabilities.hasGallery && targetCapabilities.hasGallery) {
      newFeatures.push(...targetConfig.newFeatures.gallery);
    }
    
    // Add writing features if not currently available
    if (!currentCapabilities.hasWriting && targetCapabilities.hasWriting) {
      newFeatures.push(...targetConfig.newFeatures.writing);
    }
    
    // Add other features that are new in the target kind
    const currentFeatures = currentConfig.features;
    const additionalFeatures = targetConfig.features.filter(feature => 
      !currentFeatures.some(currentFeature => 
        currentFeature.toLowerCase().includes(feature.toLowerCase().split(' ')[0])
      )
    );
    
    newFeatures.push(...additionalFeatures);
    
    return [...new Set(newFeatures)]; // Remove duplicates
  };

  const upgradeOptions = getUpgradeOptions();

  const handleUpgrade = async () => {
    try {
      await onUpgrade(selectedUpgrade);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  // If already at hybrid level
  if (portfolio.kind === 'hybrid') {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(15px)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ color: '#6366f1', marginBottom: '1.5rem' }}>
            <Crown size={64} />
          </div>
          <h2 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '1rem',
            fontFamily: 'system-ui, sans-serif'
          }}>
            You're at the Top!
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#6b7280', 
            marginBottom: '3rem', 
            maxWidth: '600px', 
            margin: '0 auto 3rem auto',
            lineHeight: '1.6'
          }}>
            Your hybrid portfolio has access to all available features including advanced gallery management, comprehensive writing tools, and professional showcase capabilities.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              { 
                icon: <Camera size={24} />, 
                title: 'Gallery Studio', 
                desc: 'Advanced gallery management & showcase',
                features: ['Masonry & Grid Layouts', 'Collections & Categories', 'High-res Support']
              },
              { 
                icon: <PenTool size={24} />, 
                title: 'Writing Hub', 
                desc: 'Complete writing & publishing system',
                features: ['Rich Text Editor', 'Content Analytics', 'Publishing Tools']
              },
              { 
                icon: <BookOpen size={24} />, 
                title: 'Learning Center', 
                desc: 'Progress tracking & analytics',
                features: ['Progress Tracking', 'Skill Analytics', 'Achievement System']
              },
              { 
                icon: <Briefcase size={24} />, 
                title: 'Professional Hub', 
                desc: 'Career & project showcase',
                features: ['Project Timeline', 'Skills Display', 'Professional Analytics']
              },
              { 
                icon: <Sparkles size={24} />, 
                title: 'Advanced Features', 
                desc: 'Premium tools & integrations',
                features: ['Custom Themes', 'API Access', 'Priority Support']
              }
            ].map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '2rem 1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: '#6366f1',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  {feature.icon}
                </div>
                <h4 style={{ 
                  fontWeight: '600', 
                  color: '#111827', 
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.1rem'
                }}>
                  {feature.title}
                </h4>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  margin: '0 0 1rem 0',
                  lineHeight: '1.4'
                }}>
                  {feature.desc}
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: '#6366f1'
                }}>
                  {feature.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Current Plan Section */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(15px)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            background: currentConfig.gradient,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
          }}>
            {currentConfig.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              marginBottom: '0.25rem',
              fontWeight: '500'
            }}>
              Current Portfolio
            </div>
            <h3 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: '#111827', 
              margin: '0 0 0.25rem 0'
            }}>
              {currentConfig.title}
            </h3>
            <div style={{ 
              fontSize: '1rem', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {currentConfig.subtitle}
            </div>
          </div>
        </div>
        
        {/* Current capabilities */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {currentConfig.capabilities.map((capability, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              fontSize: '0.875rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              <CheckCircle size={16} style={{ color: currentConfig.color, flexShrink: 0 }} />
              {capability}
            </div>
          ))}
        </div>

        {/* Current feature access */}
        <div style={{ 
          background: `${currentConfig.color}08`,
          border: `1px solid ${currentConfig.color}20`,
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: currentConfig.color,
            marginBottom: '0.75rem'
          }}>
            Current Access:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: currentCapabilities.hasGallery ? '#059669' : '#6b7280'
            }}>
              <Camera size={14} />
              Gallery {currentCapabilities.hasGallery ? '✓' : '✗'}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: currentCapabilities.hasWriting ? '#059669' : '#6b7280'
            }}>
              <FileText size={14} />
              Writing {currentCapabilities.hasWriting ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <Sparkles size={28} style={{ color: '#6366f1' }} />
          <h2 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '700', 
            color: '#111827',
            margin: 0
          }}>
            Upgrade Your Portfolio
          </h2>
        </div>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Unlock new capabilities including advanced gallery management and comprehensive writing tools to showcase your work professionally.
        </p>
      </div>

      {/* Upgrade Options Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {upgradeOptions.map(kind => {
          const config = getPortfolioConfig(kind);
          const capabilities = getCapabilities(kind);
          const newFeatures = getNewFeatures(kind);
          const isRecommended = kind === 'hybrid';
          
          return (
            <div
              key={kind}
              onClick={() => setSelectedUpgrade(kind)}
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(15px)',
                border: `2px solid ${selectedUpgrade === kind ? config.color : '#e5e7eb'}`,
                borderRadius: '20px',
                padding: '2.5rem',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (selectedUpgrade !== kind) {
                  e.currentTarget.style.borderColor = config.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedUpgrade !== kind) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Gradient accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: config.gradient
              }} />
              
              {/* Recommended badge */}
              {isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '20px',
                  background: config.gradient,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <Star size={12} />
                  Most Popular
                </div>
              )}
              
              {/* Header */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: config.gradient,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginBottom: '1.5rem',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}>
                  {config.icon}
                </div>
                
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: '#111827',
                  margin: '0 0 0.5rem 0'
                }}>
                  {config.title}
                </h3>
                
                <div style={{ 
                  fontSize: '1rem', 
                  color: config.color,
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  {config.subtitle}
                </div>
                
                <p style={{ 
                  color: '#6b7280', 
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {config.description}
                </p>
              </div>

              {/* Feature Access */}
              <div style={{ 
                background: `${config.color}08`,
                border: `1px solid ${config.color}20`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: config.color,
                  marginBottom: '0.75rem'
                }}>
                  You'll Get Access To:
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: capabilities.hasGallery ? '#059669' : '#6b7280'
                  }}>
                    <Camera size={16} />
                    <span style={{ fontWeight: '500' }}>
                      Gallery {capabilities.hasGallery ? '✓' : '✗'}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: capabilities.hasWriting ? '#059669' : '#6b7280'
                  }}>
                    <FileText size={16} />
                    <span style={{ fontWeight: '500' }}>
                      Writing {capabilities.hasWriting ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              {/* New Features */}
              {newFeatures.length > 0 && (
                <div style={{ 
                  background: `${config.color}06`,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  border: `1px solid ${config.color}15`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: config.color
                  }}>
                    <Plus size={16} />
                    New features you'll unlock:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {newFeatures.slice(0, 4).map((feature, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#374151'
                      }}>
                        <Unlock size={14} style={{ color: config.color, flexShrink: 0 }} />
                        {feature}
                      </div>
                    ))}
                    {newFeatures.length > 4 && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: config.color,
                        fontWeight: '500',
                        marginTop: '0.25rem'
                      }}>
                        +{newFeatures.length - 4} more features
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Features */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Everything included:
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr',
                  gap: '0.75rem'
                }}>
                  {config.capabilities.map((feature, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}>
                      <CheckCircle size={14} style={{ color: config.color, flexShrink: 0 }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={isUpgrading}
                style={{ 
                  background: config.gradient,
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isUpgrading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: isUpgrading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isUpgrading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUpgrading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }
                }}
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
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <Zap size={24} style={{ color: '#6366f1' }} />
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#111827',
                  margin: 0
                }}>
                  Confirm Portfolio Upgrade
                </h3>
              </div>
              
              <p style={{ 
                color: '#374151', 
                margin: '0 0 1rem 0',
                lineHeight: '1.6'
              }}>
                You're about to upgrade from <strong>{currentConfig.title}</strong> to{' '}
                <strong>{getPortfolioConfig(selectedUpgrade).title}</strong>.
              </p>
              
              {/* Feature Preview */}
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#065f46',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  What you'll gain:
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#065f46',
                  lineHeight: '1.6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {(() => {
                    const targetCapabilities = getCapabilities(selectedUpgrade);
                    const gains = [];
                    
                    if (!currentCapabilities.hasGallery && targetCapabilities.hasGallery) {
                      gains.push('🎨 Advanced Gallery Management');
                    }
                    if (!currentCapabilities.hasWriting && targetCapabilities.hasWriting) {
                      gains.push('✍️ Comprehensive Writing System');
                    }
                    gains.push('✅ All existing content preserved');
                    gains.push('🚀 New features available immediately');
                    gains.push('💰 Completely free upgrade');
                    
                    return gains.map((gain, index) => (
                      <div key={index}>{gain}</div>
                    ));
                  })()}
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.875rem',
                color: '#1e40af',
                lineHeight: '1.5'
              }}>
                <strong>Note:</strong> This upgrade will expand your portfolio capabilities while maintaining all your existing content and settings.
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              padding: '1rem 2rem 2rem 2rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isUpgrading}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isUpgrading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isUpgrading ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: getPortfolioConfig(selectedUpgrade).gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: isUpgrading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isUpgrading ? 0.7 : 1
                }}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  'Confirm Upgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(15px)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#111827',
          margin: '0 0 2rem 0',
          textAlign: 'center'
        }}>
          Frequently Asked Questions
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem'
        }}>
          {[
            {
              q: "What's the difference between Gallery and Writing?",
              a: "Gallery provides advanced image management, collections, and visual showcase features. Writing includes a comprehensive content creation system with rich text editing, analytics, and publishing tools."
            },
            {
              q: "Will I lose my existing content?",
              a: "No! All your current content will be preserved and enhanced with new features. Your upgrade only adds capabilities, never removes anything."
            },
            {
              q: "Are there any additional costs?",
              a: "Portfolio upgrades are completely free. You only pay for premium hosting features if you choose them later."
            },
            {
              q: "How long does the upgrade take?",
              a: "Upgrades are instant! New features will be available immediately after confirmation. No downtime or waiting periods."
            },
            {
              q: "Can I access both Gallery and Writing?",
              a: "Yes! The Hybrid Portfolio includes both advanced gallery management and comprehensive writing tools, plus all other features."
            },
            {
              q: "Can I downgrade later?",
              a: "While upgrades are recommended for the best experience, you can contact support if you need to modify your portfolio type."
            }
          ].map((faq, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <h4 style={{ 
                fontWeight: '600', 
                color: '#111827',
                margin: '0 0 0.75rem 0',
                fontSize: '0.875rem'
              }}>
                {faq.q}
              </h4>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};