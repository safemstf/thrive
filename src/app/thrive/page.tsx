// app/thrive/page.tsx - Modernized thrive page with unified design system
'use client';
import React from 'react';
import styled from 'styled-components';
import { 
  Calendar,
  Target,
  TrendingUp,
  Play,
  Code,
  PenTool,
  Brain,
  Users,
  Trophy,
  Zap,
  Clock,
  Star
} from 'lucide-react';
import { useThriveLogic } from '@/components/thrive/thriveLogic';
import {
  PageContainer,
  ContentWrapper,
  Section,
  Heading1,
  Heading2,
  BodyText,
  BaseButton,
  Card,
  CardContent,
  Grid
} from '@/styles/styled-components';
import { theme } from '@/styles/theme';

// Custom styled components for thrive page
const ThriveContainer = styled(PageContainer)`
  background: linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.primary[100]} 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -25%;
    left: -25%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(44, 44, 44, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: drift 30s ease-in-out infinite;
  }
  
  @keyframes drift {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(1deg); }
    66% { transform: translate(-20px, 20px) rotate(-1deg); }
  }
`;

const HeroSection = styled(Section)`
  text-align: center;
  position: relative;
  z-index: 1;
  padding: ${theme.spacing['3xl']} 0 ${theme.spacing['2xl']};
`;

const HeroTitle = styled(Heading1)`
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.accent.blue});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.md};
`;

const HeroSubtitle = styled(BodyText)`
  font-size: ${theme.typography.sizes.xl};
  max-width: 600px;
  margin: 0 auto ${theme.spacing['2xl']};
  color: ${theme.colors.text.secondary};
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing['2xl']};
  flex-wrap: wrap;
  margin-top: ${theme.spacing['2xl']};
  
  @media (max-width: 768px) {
    gap: ${theme.spacing.lg};
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.8);
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.display};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${theme.typography.weights.medium};
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${theme.spacing['3xl']};
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing['2xl']};
  }
`;

const ContentArea = styled.div``;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing['2xl']};
`;

const SectionTitle = styled(Heading2)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
`;

const SkillsGrid = styled(Grid)`
  margin-bottom: ${theme.spacing['3xl']};
`;

const SkillCard = styled(Card)<{ $featured?: boolean }>`
  cursor: pointer;
  transition: ${theme.transitions.normal};
  position: relative;
  background: ${({ $featured }) => 
    $featured 
      ? 'linear-gradient(135deg, rgba(44, 44, 44, 0.05) 0%, rgba(33, 150, 243, 0.05) 100%)'
      : theme.colors.background.secondary
  };
  border: 2px solid ${({ $featured }) => 
    $featured ? theme.colors.primary[500] : theme.colors.border.light
  };
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${({ $featured }) => 
      $featured ? theme.colors.primary[600] : theme.colors.border.medium
    };
  }
  
  ${({ $featured }) => $featured && `
    &::before {
      content: 'Featured';
      position: absolute;
      top: ${theme.spacing.md};
      right: ${theme.spacing.md};
      background: ${theme.colors.primary[500]};
      color: white;
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      border-radius: ${theme.borderRadius.sm};
      font-size: ${theme.typography.sizes.xs};
      font-weight: ${theme.typography.weights.semibold};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 2;
    }
  `}
`;

const SkillIcon = styled.div<{ $color?: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.md};
  background: ${({ $color }) => $color || theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: ${theme.spacing.md};
  transition: ${theme.transitions.normal};
  
  ${SkillCard}:hover & {
    transform: scale(1.1);
  }
`;

const SkillTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fonts.body};
`;

const SkillDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.sm};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.lg};
`;

const SkillMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.sm};
`;

const MetaItem = styled.div`
  text-align: center;
`;

const MetaValue = styled.div`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xs};
`;

const MetaLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${theme.typography.weights.medium};
`;

const ActionButton = styled(BaseButton)`
  width: 100%;
  justify-content: center;
  font-size: ${theme.typography.sizes.sm};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const SidebarCard = styled(Card)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const SidebarTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SessionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.colors.background.tertiary};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.border.light};
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SessionAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.sm};
  flex-shrink: 0;
`;

const SessionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SessionTitle = styled.div`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SessionHost = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
`;

const SessionTime = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.weights.medium};
  text-align: right;
`;

const LeaderItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.sm};
  background: ${({ $rank }) => $rank <= 3 ? theme.colors.background.tertiary : 'transparent'};
  border: 1px solid ${({ $rank }) => $rank <= 3 ? theme.colors.border.medium : 'transparent'};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.background.tertiary};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.bold};
  font-size: ${theme.typography.sizes.sm};
  flex-shrink: 0;
  
  ${({ $rank }) => {
    if ($rank === 1) return `background: linear-gradient(135deg, #ffd700, #ffed4e); color: #92400e;`;
    if ($rank === 2) return `background: linear-gradient(135deg, #c0c0c0, #e5e7eb); color: #374151;`;
    if ($rank === 3) return `background: linear-gradient(135deg, #cd7f32, #d97706); color: white;`;
    return `background: ${theme.colors.background.tertiary}; color: ${theme.colors.text.muted};`;
  }}
`;

const LeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LeaderName = styled.div`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.sizes.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeaderScore = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.md};
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(Card)`
  background: ${theme.colors.background.secondary};
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: ${theme.shadows.lg};
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.light};
  position: relative;
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  color: ${theme.colors.text.secondary};
  
  &:hover {
    background: ${theme.colors.border.light};
    color: ${theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
`;

export default function ModernThriveHub() {
  const {
    selectedChallenge,
    onlineUsers,
    activeSessions,
    completedToday,
    skillChallenges,
    liveSessions,
    leaderboard,
    selectedChallengeData,
    getInitials,
    openChallenge,
    closeChallenge
  } = useThriveLogic();

  const getSkillColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'coding': return 'linear-gradient(135deg, #2563eb, #3b82f6)';
      case 'design': return 'linear-gradient(135deg, #7c3aed, #a855f7)';
      case 'writing': return 'linear-gradient(135deg, #059669, #10b981)';
      case 'business': return 'linear-gradient(135deg, #dc2626, #ef4444)';
      case 'marketing': return 'linear-gradient(135deg, #ea580c, #f97316)';
      default: return 'linear-gradient(135deg, #374151, #4b5563)';
    }
  };

  const getSkillIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'coding': return Code;
      case 'design': return PenTool;
      case 'writing': return Brain;
      case 'business': return Users;
      case 'marketing': return Target;
      default: return Zap;
    }
  };
  
  return (
    <ThriveContainer>
      <ContentWrapper>
        <HeroSection>
          <HeroTitle>Skills Development Arena</HeroTitle>
          <HeroSubtitle>
            Sharpen your professional skills through engaging challenges, collaborative learning, and real-world practice
          </HeroSubtitle>
          <StatsBar>
            <StatItem>
              <StatValue>{onlineUsers}</StatValue>
              <StatLabel>Active Now</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{activeSessions}</StatValue>
              <StatLabel>Live Sessions</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{completedToday}</StatValue>
              <StatLabel>Completed Today</StatLabel>
            </StatItem>
          </StatsBar>
        </HeroSection>
        
        <MainContent>
          <ContentArea>
            <SectionTitle>
              <Target size={24} />
              Featured Challenges
            </SectionTitle>
            
            <SkillsGrid $minWidth="320px">
              {skillChallenges.map((challenge) => {
                const IconComponent = getSkillIcon(challenge.category);
                return (
                  <SkillCard 
                    key={challenge.id} 
                    $featured={challenge.featured}
                    onClick={() => openChallenge(challenge.id)}
                  >
                    <CardContent>
                      <SkillIcon $color={getSkillColor(challenge.category)}>
                        <IconComponent size={28} />
                      </SkillIcon>
                      <SkillTitle>{challenge.title}</SkillTitle>
                      <SkillDescription>{challenge.description}</SkillDescription>
                      <SkillMeta>
                        <MetaItem>
                          <MetaValue>{challenge.participants}</MetaValue>
                          <MetaLabel>Participants</MetaLabel>
                        </MetaItem>
                        <MetaItem>
                          <MetaValue>{challenge.difficulty}</MetaValue>
                          <MetaLabel>Level</MetaLabel>
                        </MetaItem>
                        <MetaItem>
                          <MetaValue>{challenge.category}</MetaValue>
                          <MetaLabel>Category</MetaLabel>
                        </MetaItem>
                      </SkillMeta>
                      <ActionButton $variant="primary">
                        <Play size={16} />
                        Start Challenge
                      </ActionButton>
                    </CardContent>
                  </SkillCard>
                );
              })}
            </SkillsGrid>
          </ContentArea>
          
          <Sidebar>
            <SidebarCard>
              <CardContent>
                <SidebarTitle>
                  <Calendar size={20} />
                  Live Sessions
                </SidebarTitle>
                {liveSessions.map((session, index) => (
                  <SessionItem key={index}>
                    <SessionAvatar>
                      {getInitials(session.host)}
                    </SessionAvatar>
                    <SessionInfo>
                      <SessionTitle>{session.title}</SessionTitle>
                      <SessionHost>with {session.host}</SessionHost>
                    </SessionInfo>
                    <SessionTime>
                      <Clock size={12} />
                      {session.time}
                    </SessionTime>
                  </SessionItem>
                ))}
              </CardContent>
            </SidebarCard>
            
            <SidebarCard>
              <CardContent>
                <SidebarTitle>
                  <Trophy size={20} />
                  Leaderboard
                </SidebarTitle>
                {leaderboard.map((leader, index) => (
                  <LeaderItem key={index} $rank={leader.rank}>
                    <RankBadge $rank={leader.rank}>
                      {leader.rank}
                    </RankBadge>
                    <LeaderInfo>
                      <LeaderName>{leader.name}</LeaderName>
                      <LeaderScore>
                        <Star size={12} />
                        {leader.score}
                      </LeaderScore>
                    </LeaderInfo>
                  </LeaderItem>
                ))}
              </CardContent>
            </SidebarCard>
          </Sidebar>
        </MainContent>
      </ContentWrapper>
      
      <Modal $isOpen={!!selectedChallenge}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Challenge Details</ModalTitle>
            <CloseButton onClick={closeChallenge}>×</CloseButton>
          </ModalHeader>
          <ModalBody>
            {selectedChallengeData && <selectedChallengeData.component />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </ThriveContainer>
  );
}