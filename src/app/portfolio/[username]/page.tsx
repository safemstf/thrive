// app/portfolio/[username]/page.tsx - Premium Integrated Portfolio System
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Globe, Mail, MapPin, Calendar, Github, Linkedin, Twitter,
  Eye, Heart, Share2, Download, ArrowLeft, Grid3X3, List, Layers,
  Star, Award, Camera, Palette, Code, PenTool, Briefcase, Users, 
  TrendingUp, ChevronDown, BookOpen, GraduationCap, Target, Zap, 
  Building, Instagram, ExternalLink, CheckCircle, Clock, BarChart, 
  Trophy, Lightbulb, Play, MessageCircle, ThumbsUp, Send, Filter,
  Search, MoreHorizontal, Bookmark, Flag, Printer, Link2, Copy,
  Settings, Edit, Plus, Minus, ChevronRight, Activity, Shield,
  Brain, Calculator, FileText, Video, Headphones, Monitor, Smartphone
} from 'lucide-react';



// Import from styled-components hub
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  BaseButton, Card, CardContent, Grid, FlexRow, FlexColumn, Badge
} from '@/styles/styled-components';

// Import utilities  
import { utils } from '@/utils';
import styled, { keyframes } from 'styled-components';

// Import types
import type { 
  Portfolio, PortfolioKind, GalleryPiece, ConceptProgress, 
  PortfolioReview, PortfolioAnalytics, Book, PortfolioStats 
} from '@/types/portfolio.types';
import { MOCK_PORTFOLIOS, MOCK_GALLERY, MOCK_REVIEWS, THRIVE_ASSESSMENTS } from '@/data/mockData';

// ==============================================
// GOLDEN RATIO CONSTANTS & ENHANCED ANIMATIONS
// ==============================================

const PHI = 1.618033988749;
const PHI_INVERSE = 0.618033988749;

const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`, 
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
  xl: `${4.236}rem`,
  xxl: `${6.854}rem`,
  xxxl: `${11.089}rem`
};

// Enhanced animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const progressFlow = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

const ProgressBarInner = styled.div<{ $width: number }>`
  width: ${props => props.$width}%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: 6px;
  animation: ${progressFlow} 2s ease-in-out;
  background-size: 200% 100%; /* Required for the animation to work */
`;

const floatingBadge = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-3px) rotate(1deg); }
  75% { transform: translateY(-1px) rotate(-1deg); }
`;

const shimmerEffect = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
`;

// ==============================================
// PREMIUM STYLED COMPONENTS
// ==============================================

const PremiumContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--color-background-primary);
  position: relative;
  overflow-x: hidden;
`;

const FloatingNavigation = styled.div`
  position: fixed;
  top: 50%;
  right: ${GOLDEN_SPACING.lg};
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SPACING.sm};
  
  ${utils.responsive.below.lg} {
    display: none;
  }
`;

const NavDot = styled.button<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${props => props.$active ? 'var(--color-primary-500)' : 'var(--color-border-light)'};
  background: ${props => props.$active ? 'var(--color-primary-500)' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
    border-color: var(--color-primary-500);
  }
`;

const HeroSection = styled.section<{ $kind: PortfolioKind }>`
  min-height: ${100 * PHI_INVERSE}vh;
  position: relative;
  background: ${props => {
    const gradients = {
      creative: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)',
      professional: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(34, 197, 94, 0.05) 100%)',
      educational: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)',
      hybrid: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 25%, rgba(59, 130, 246, 0.05) 50%, rgba(34, 197, 94, 0.05) 75%, rgba(245, 158, 11, 0.05) 100%)'
    };
    return gradients[props.$kind];
  }};
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at ${100 * PHI_INVERSE}% ${100 * PHI_INVERSE}%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at ${100 * PHI}% ${100 * PHI_INVERSE}%, rgba(139, 92, 246, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const KindBadge = styled.div<{ $kind: PortfolioKind }>`
  position: absolute;
  top: ${GOLDEN_SPACING.xl};
  right: ${GOLDEN_SPACING.xl};
  background: ${props => {
    const gradients = {
      creative: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      professional: 'linear-gradient(135deg, #3b82f6, #10b981)', 
      educational: 'linear-gradient(135deg, #f59e0b, #22c55e)',
      hybrid: 'linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6, #22c55e)'
    };
    return gradients[props.$kind];
  }};
  color: white;
  padding: ${GOLDEN_SPACING.sm} ${GOLDEN_SPACING.lg};
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.875rem;
  z-index: 10;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${floatingBadge} 6s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  
  ${utils.responsive.below.md} {
    top: ${GOLDEN_SPACING.lg};
    right: ${GOLDEN_SPACING.lg};
    font-size: 0.75rem;
    padding: ${GOLDEN_SPACING.xs} ${GOLDEN_SPACING.sm};
  }
`;

const HeroContent = styled.div`
  padding: ${GOLDEN_SPACING.xxxl} 0;
  animation: ${fadeInUp} 0.8s ease;
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr ${400 * PHI}px;
  gap: ${GOLDEN_SPACING.xxl};
  align-items: center;
  
  ${utils.responsive.below.lg} {
    grid-template-columns: 1fr;
    gap: ${GOLDEN_SPACING.xl};
    text-align: center;
  }
`;

const ProfileImageContainer = styled.div`
  position: relative;
  justify-self: center;
  
  ${utils.responsive.below.lg} {
    order: -1;
  }
`;

const ProfileImage = styled.div`
  width: ${400 * PHI}px;
  height: ${400 * PHI}px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  border: 8px solid var(--color-background-primary);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    z-index: -1;
  }
  
  ${utils.responsive.below.lg} {
    width: 300px;
    height: 300px;
  }
  
  ${utils.responsive.below.md} {
    width: 250px;
    height: 250px;
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: ${GOLDEN_SPACING.lg};
  right: ${GOLDEN_SPACING.lg};
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: ${GOLDEN_SPACING.xs} ${GOLDEN_SPACING.sm};
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  animation: ${pulseGlow} 3s ease-in-out infinite;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    animation: ${pulseGlow} 2s ease-in-out infinite;
  }
`;

const HeroInfo = styled.div`
  animation: ${slideInLeft} 0.8s ease 0.2s both;
`;

const Name = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin: 0 0 ${GOLDEN_SPACING.sm};
  background: linear-gradient(135deg, var(--color-text-primary), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin: 0 0 ${GOLDEN_SPACING.sm};
  
  ${utils.responsive.below.md} {
    font-size: 1.5rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.25rem;
  color: var(--color-primary-600);
  font-style: italic;
  margin: 0 0 ${GOLDEN_SPACING.lg};
  font-weight: 500;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.lg};
  margin: 0 0 ${GOLDEN_SPACING.lg};
  flex-wrap: wrap;
  
  ${utils.responsive.below.lg} {
    justify-content: center;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  
  svg {
    color: var(--color-primary-500);
  }
`;

const SpecializationTags = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.xs};
  margin: 0 0 ${GOLDEN_SPACING.xl};
  flex-wrap: wrap;
  
  ${utils.responsive.below.lg} {
    justify-content: center;
  }
`;

const SpecTag = styled(Badge)`
  background: var(--glass-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  color: var(--color-text-primary);
  font-weight: 500;
  padding: ${GOLDEN_SPACING.xs} ${GOLDEN_SPACING.sm};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &::before {
      left: 100%;
    }
  }
`;

const SocialLinksContainer = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.sm};
  margin: 0 0 ${GOLDEN_SPACING.xl};
  
  ${utils.responsive.below.lg} {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  width: ${50 * PHI}px;
  height: ${50 * PHI}px;
  border-radius: 50%;
  background: var(--glass-background);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  svg {
    position: relative;
    z-index: 1;
    transition: color 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
    
    svg {
      color: white;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.md};
  
  ${utils.responsive.below.lg} {
    justify-content: center;
  }
  
  ${utils.responsive.below.sm} {
    flex-direction: column;
    gap: ${GOLDEN_SPACING.sm};
  }
`;

const PremiumButton = styled(BaseButton)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border: none;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    
    &::before {
      left: 100%;
    }
  }
`;

const StatsSection = styled.section`
  background: var(--glass-background);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  margin: ${GOLDEN_SPACING.xxl} 0;
  padding: ${GOLDEN_SPACING.xl};
  animation: ${scaleIn} 0.6s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-primary-500), transparent);
    animation: ${shimmerEffect} 3s ease-in-out infinite;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${GOLDEN_SPACING.lg};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${GOLDEN_SPACING.lg};
  border-radius: 16px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    
    &::before {
      opacity: 0.05;
    }
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: ${GOLDEN_SPACING.xs};
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--font-display);
  position: relative;
  z-index: 1;
`;

const StatLabel = styled.div`
  color: var(--color-text-secondary);
  font-weight: 500;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${GOLDEN_SPACING.xs};
`;

const ThriveSection = styled.section`
  background: linear-gradient(135deg, 
    var(--glass-background) 0%, 
    rgba(59, 130, 246, 0.02) 100%
  );
  border-radius: 24px;
  padding: ${GOLDEN_SPACING.xxl};
  margin: ${GOLDEN_SPACING.xxl} 0;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
`;

const AssessmentCard = styled.div`
  background: var(--color-background-secondary);
  border-radius: 20px;
  padding: ${GOLDEN_SPACING.xl};
  border: 1px solid var(--color-border-light);
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
    border-radius: 20px 20px 0 0;
  }
`;

const ScoreDisplay = styled.div`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PercentileRank = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: ${GOLDEN_SPACING.xs} ${GOLDEN_SPACING.sm};
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
`;

// ==============================================
// ENHANCED CONTENT COMPONENTS
// ==============================================

const ThriveAssessments: React.FC<{ assessments: any[] }> = ({ assessments }) => (
  <ThriveSection>
    <FlexRow $justify="space-between" $align="center" style={{ marginBottom: GOLDEN_SPACING.xl }}>
      <div>
        <Heading2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: GOLDEN_SPACING.sm }}>
          <Target size={28} color="var(--color-primary-500)" />
          Thrive Assessments
        </Heading2>
        <p style={{ 
          margin: `${GOLDEN_SPACING.xs} 0 0`,
          color: 'var(--color-text-secondary)'
        }}>
          Industry-recognized skill certifications
        </p>
      </div>
      <BaseButton $variant="secondary" $size="sm">
        <ExternalLink size={16} />
        View All Results
      </BaseButton>
    </FlexRow>

    <Grid $columns={assessments.length > 1 ? 2 : 1} $gap={GOLDEN_SPACING.lg}>
      {assessments.map((assessment, index) => (
        <AssessmentCard key={assessment.id}>
          <FlexRow $justify="space-between" $align="start" style={{ marginBottom: GOLDEN_SPACING.lg }}>
            <div>
              <h3 style={{ 
                margin: `0 0 ${GOLDEN_SPACING.xs}`,
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                {assessment.title}
              </h3>
              <p style={{ 
                margin: 0,
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem'
              }}>
                Completed {new Date(assessment.completedAt).toLocaleDateString()}
              </p>
            </div>
            <PercentileRank>
              <Trophy size={14} />
              Top {100 - assessment.percentile}%
            </PercentileRank>
          </FlexRow>

          <FlexRow $gap={GOLDEN_SPACING.xl} $align="center" style={{ marginBottom: GOLDEN_SPACING.lg }}>
            <div style={{ textAlign: 'center' }}>
              <ScoreDisplay>{assessment.score}</ScoreDisplay>
              <div style={{ 
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Overall Score
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                marginBottom: GOLDEN_SPACING.sm,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Performance
                </span>
                <span style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--color-primary-600)',
                  fontWeight: 600
                }}>
                  {assessment.score}/100
                </span>
              </div>
              <div style={{
                width: '100%',
                height: 12,
                background: 'var(--color-background-tertiary)',
                borderRadius: 6,
                overflow: 'hidden'
              }}>
              <ProgressBarInner $width={assessment.score} />
              </div>
            </div>
          </FlexRow>

          <div style={{ marginBottom: GOLDEN_SPACING.lg }}>
            <h4 style={{ 
              margin: `0 0 ${GOLDEN_SPACING.sm}`,
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              Skills Assessed
            </h4>
            <FlexRow $gap={GOLDEN_SPACING.xs} $wrap>
              {assessment.skills.map((skill: string, skillIndex: number) => (
                <Badge key={skillIndex} $variant="default" style={{ fontSize: '0.75rem' }}>
                  {skill}
                </Badge>
              ))}
            </FlexRow>
          </div>

          <FlexRow $justify="space-between" $align="center">
            <div style={{ 
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: GOLDEN_SPACING.xs
            }}>
              <Clock size={14} />
              {assessment.timeSpent} minutes
            </div>
            <Badge style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              fontWeight: 600
            }}>
              {assessment.certification}
            </Badge>
          </FlexRow>
        </AssessmentCard>
      ))}
    </Grid>
  </ThriveSection>
);

const ReviewsSection: React.FC<{ reviews: PortfolioReview[] }> = ({ reviews }) => (
  <section style={{ margin: `${GOLDEN_SPACING.xxl} 0` }}>
    <FlexRow $justify="space-between" $align="center" style={{ marginBottom: GOLDEN_SPACING.xl }}>
      <div>
        <Heading2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: GOLDEN_SPACING.sm }}>
          <Star size={28} color="var(--color-primary-500)" />
          Client Reviews
        </Heading2>
        <p style={{ 
          margin: `${GOLDEN_SPACING.xs} 0 0`,
          color: 'var(--color-text-secondary)'
        }}>
          {reviews.length} reviews • 4.9 average rating
        </p>
      </div>
      <BaseButton $variant="secondary" $size="sm">
        <MessageCircle size={16} />
        Write Review
      </BaseButton>
    </FlexRow>

    <Grid $columns={reviews.length > 1 ? 2 : 1} $gap={GOLDEN_SPACING.lg}>
      {reviews.map((review) => (
        <Card key={review.id} style={{
          background: 'var(--color-background-secondary)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent style={{ padding: GOLDEN_SPACING.xl }}>
            <div style={{
              fontSize: '4rem',
              color: 'var(--color-primary-500)',
              position: 'absolute',
              top: GOLDEN_SPACING.md,
              left: GOLDEN_SPACING.md,
              fontFamily: 'serif',
              lineHeight: 1,
              opacity: 0.1
            }}>
              "
            </div>
            
            <FlexRow $justify="space-between" $align="start" style={{ marginBottom: GOLDEN_SPACING.md }}>
              <div>
                <FlexRow $gap={GOLDEN_SPACING.xs} style={{ marginBottom: GOLDEN_SPACING.xs }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={16} 
                      fill={star <= review.rating ? 'var(--color-primary-500)' : 'none'}
                      color={star <= review.rating ? 'var(--color-primary-500)' : 'var(--color-border-light)'}
                    />
                  ))}
                </FlexRow>
                {review.title && (
                  <h4 style={{ 
                    margin: `0 0 ${GOLDEN_SPACING.sm}`,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}>
                    {review.title}
                  </h4>
                )}
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)'
              }}>
                {new Date(review.createdAt!).toLocaleDateString()}
              </div>
            </FlexRow>

            <p style={{ 
              fontSize: '1rem',
              lineHeight: PHI,
              marginBottom: GOLDEN_SPACING.lg,
              position: 'relative',
              zIndex: 1
            }}>
              {review.comment}
            </p>

            <FlexRow $justify="space-between" $align="center">
              <div>
                <div style={{ fontWeight: 600 }}>{review.reviewerName}</div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  Verified Client
                </div>
              </div>
              
              {review.helpfulCount > 0 && (
                <FlexRow $gap={GOLDEN_SPACING.sm}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: GOLDEN_SPACING.xs,
                    fontSize: '0.875rem'
                  }}>
                    <ThumbsUp size={14} />
                    {review.helpfulCount}
                  </button>
                </FlexRow>
              )}
            </FlexRow>

            {review.artistResponse && (
              <div style={{
                marginTop: GOLDEN_SPACING.lg,
                padding: GOLDEN_SPACING.md,
                background: 'var(--glass-background)',
                borderRadius: 12,
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: GOLDEN_SPACING.xs,
                  color: 'var(--color-primary-600)'
                }}>
                  Artist Response:
                </div>
                <p style={{ 
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  {review.artistResponse.comment}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </Grid>
  </section>
);

// ==============================================
// MAIN COMPONENT
// ==============================================

export default function PremiumPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [activeSection, setActiveSection] = useState(0);
  const [viewMode, setViewMode] = useState<'masonry' | 'grid' | 'list'>('masonry');
  
  const portfolio = MOCK_PORTFOLIOS[username];
  const galleryPieces = MOCK_GALLERY[username] || [];
  const reviews = MOCK_REVIEWS[username] || [];
  const assessments = THRIVE_ASSESSMENTS[username] || [];

  // Scroll tracking for navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[data-section]');
      let current = 0;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          current = index;
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getKindIcon = (kind: PortfolioKind) => {
    const icons = {
      creative: <Palette size={18} />,
      professional: <Briefcase size={18} />,
      educational: <GraduationCap size={18} />,
      hybrid: <Zap size={18} />
    };
    return icons[kind];
  };

  const getKindLabel = (kind: PortfolioKind) => {
    const labels = {
      creative: 'Creative Portfolio',
      professional: 'Professional Portfolio', 
      educational: 'Learning Portfolio',
      hybrid: 'Hybrid Portfolio'
    };
    return labels[kind];
  };

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${portfolio.name} - Portfolio`,
          text: portfolio.bio.substring(0, 100),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Add toast notification here
      }
    } catch (err) {
      console.log('Share failed');
    }
  }, [portfolio]);

  if (!portfolio) {
    return (
      <PremiumContainer>
        <ContentWrapper>
          <div style={{ 
            textAlign: 'center', 
            padding: `${GOLDEN_SPACING.xxxl} 0`,
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h1>Portfolio Not Found</h1>
            <p>The portfolio you're looking for doesn't exist.</p>
            <BaseButton onClick={() => router.back()}>
              <ArrowLeft size={16} />
              Go Back
            </BaseButton>
          </div>
        </ContentWrapper>
      </PremiumContainer>
    );
  }

  return (
    <PremiumContainer>
      {/* Floating Navigation */}
      <FloatingNavigation>
        {['hero', 'stats', 'thrive', 'gallery', 'reviews'].map((section, index) => (
          <NavDot 
            key={section}
            $active={activeSection === index}
            onClick={() => {
              const element = document.querySelector(`[data-section="${section}"]`);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            title={section.charAt(0).toUpperCase() + section.slice(1)}
          />
        ))}
      </FloatingNavigation>

      {/* Hero Section */}
      <HeroSection $kind={portfolio.kind} data-section="hero">
        <KindBadge $kind={portfolio.kind}>
          {getKindIcon(portfolio.kind)}
          {getKindLabel(portfolio.kind)}
        </KindBadge>
        
        <ContentWrapper>
          <HeroContent>
            <HeroGrid>
              <HeroInfo>
                <Name>{portfolio.name}</Name>
                <Title>{portfolio.title}</Title>
                {portfolio.tagline && <Tagline>"{portfolio.tagline}"</Tagline>}

                <MetaInfo>
                  {portfolio.location && (
                    <MetaItem>
                      <MapPin size={18} />
                      {portfolio.location}
                    </MetaItem>
                  )}
                  {portfolio.yearsOfExperience && (
                    <MetaItem>
                      <Clock size={18} />
                      {portfolio.yearsOfExperience} years experience
                    </MetaItem>
                  )}
                  <MetaItem>
                    <Star size={18} />
                    {portfolio.stats.averageRating}/5.0 ({portfolio.stats.totalReviews} reviews)
                  </MetaItem>
                </MetaInfo>

                <SpecializationTags>
                  {portfolio.specializations.slice(0, 5).map((spec, index) => (
                    <SpecTag key={index}>{spec}</SpecTag>
                  ))}
                </SpecializationTags>

                <SocialLinksContainer>
                  {portfolio.socialLinks?.github && (
                    <SocialLink href={portfolio.socialLinks.github} target="_blank">
                      <Github size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks?.linkedin && (
                    <SocialLink href={portfolio.socialLinks.linkedin} target="_blank">
                      <Linkedin size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks?.twitter && (
                    <SocialLink href={portfolio.socialLinks.twitter} target="_blank">
                      <Twitter size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks?.instagram && (
                    <SocialLink href={portfolio.socialLinks.instagram} target="_blank">
                      <Instagram size={20} />
                    </SocialLink>
                  )}
                  {portfolio.socialLinks?.website && (
                    <SocialLink href={portfolio.socialLinks.website} target="_blank">
                      <Globe size={20} />
                    </SocialLink>
                  )}
                </SocialLinksContainer>

                <ActionButtons>
                  <PremiumButton>
                    <Mail size={18} />
                    Contact Me
                  </PremiumButton>
                  <BaseButton onClick={handleShare} $variant="secondary">
                    <Share2 size={18} />
                    Share Profile
                  </BaseButton>
                </ActionButtons>
              </HeroInfo>

              <ProfileImageContainer>
                <ProfileImage>
                  <Image
                    src={portfolio.profileImage || ''}
                    alt={`${portfolio.name}'s profile`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <StatusIndicator>
                    Available for work
                  </StatusIndicator>
                </ProfileImage>
              </ProfileImageContainer>
            </HeroGrid>
          </HeroContent>
        </ContentWrapper>
      </HeroSection>

      <ContentWrapper>
        {/* Enhanced Stats Section */}
        <StatsSection data-section="stats">
          <Heading2 style={{ 
            textAlign: 'center', 
            marginBottom: GOLDEN_SPACING.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: GOLDEN_SPACING.sm
          }}>
            <BarChart size={28} />
            Portfolio Analytics
          </Heading2>
          
          <StatsGrid>
            <StatCard>
              <StatNumber>{utils.data.formatNumber(portfolio.stats.totalViews)}</StatNumber>
              <StatLabel>
                <Eye size={18} />
                Profile Views
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{utils.data.formatNumber(portfolio.stats.uniqueVisitors)}</StatNumber>
              <StatLabel>
                <Users size={18} />
                Unique Visitors
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolio.stats.averageRating}</StatNumber>
              <StatLabel>
                <Star size={18} />
                Average Rating
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolio.stats.totalPieces}</StatNumber>
              <StatLabel>
                <Palette size={18} />
                Portfolio Pieces
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolio.stats.responseRate}%</StatNumber>
              <StatLabel>
                <MessageCircle size={18} />
                Response Rate
              </StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{portfolio.stats.responseTime}</StatNumber>
              <StatLabel>
                <Clock size={18} />
                Response Time
              </StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsSection>

        {/* Thrive Assessment Results */}
        {assessments.length > 0 && (
          <div data-section="thrive">
            <ThriveAssessments assessments={assessments} />
          </div>
        )}

        {/* About Section */}
        <section style={{ margin: `${GOLDEN_SPACING.xxl} 0` }}>
          <Heading2 style={{ marginBottom: GOLDEN_SPACING.lg }}>About</Heading2>
          <BodyText $size="lg" style={{ 
            lineHeight: PHI,
            maxWidth: '800px',
            fontSize: '1.125rem'
          }}>
            {portfolio.bio}
          </BodyText>
        </section>

        {/* Gallery Section */}
        {galleryPieces.length > 0 && (
          <section data-section="gallery" style={{ margin: `${GOLDEN_SPACING.xxl} 0` }}>
            <FlexRow $justify="space-between" $align="center" style={{ marginBottom: GOLDEN_SPACING.xl }}>
              <div>
                <Heading2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: GOLDEN_SPACING.sm }}>
                  <Palette size={28} />
                  Featured Work
                </Heading2>
                <p style={{ 
                  margin: `${GOLDEN_SPACING.xs} 0 0`,
                  color: 'var(--color-text-secondary)'
                }}>
                  {galleryPieces.length} pieces • Recently updated
                </p>
              </div>
              
              <FlexRow $gap={GOLDEN_SPACING.sm}>
                <BaseButton $variant="secondary" $size="sm">
                  <Grid3X3 size={16} />
                  View Gallery
                </BaseButton>
                <BaseButton $variant="secondary" $size="sm">
                  <Filter size={16} />
                  Filter
                </BaseButton>
              </FlexRow>
            </FlexRow>

            <Grid $columns={2} $gap={GOLDEN_SPACING.lg}>
            {galleryPieces.slice(0, 4).map((piece) => (
              <Card key={piece.id} style={{ 
                overflow: 'hidden', 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ position: 'relative', height: '300px' }}>
                  <Image
                    src={piece.imageUrl}
                    alt={piece.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {/* Fixed featured check */}
                  {portfolio.featuredPieces && portfolio.featuredPieces.includes(piece._id) && (
                    <div style={{
                      position: 'absolute',
                      top: GOLDEN_SPACING.sm,
                      right: GOLDEN_SPACING.sm,
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: `${GOLDEN_SPACING.xs} ${GOLDEN_SPACING.sm}`,
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Star size={12} />
                      Featured
                    </div>
                  )}
                </div>
                <CardContent style={{ padding: GOLDEN_SPACING.lg }}>
                  <h3 style={{ margin: `0 0 ${GOLDEN_SPACING.xs}`, fontSize: '1.25rem' }}>
                    {piece.title}
                  </h3>
                  <p style={{ 
                    margin: `0 0 ${GOLDEN_SPACING.md}`,
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5
                  }}>
                    {piece.description}
                  </p>
                  <FlexRow $justify="space-between" $align="center">
                    {/* Fixed variant to 'default' */}
                    <Badge $variant="default">{piece.category}</Badge>
                    <FlexRow $gap={GOLDEN_SPACING.sm}>
                      <span style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)'
                      }}>
                        <Eye size={14} /> 
                        {/* Fixed to use piece.views */}
                        {utils.data.formatNumber(piece.views || 0)}
                      </span>
                      <span style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)'
                      }}>
                        <Heart size={14} /> 
                        {/* Fixed to use piece.likes */}
                        {piece.likes || 0}
                      </span>
                    </FlexRow>
                  </FlexRow>
                </CardContent>
              </Card>
            ))}
          </Grid>
          </section>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div data-section="reviews">
            <ReviewsSection reviews={reviews} />
          </div>
        )}
      </ContentWrapper>
    </PremiumContainer>
  );
}