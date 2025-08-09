// src/app/thrive/page.tsx - Modern Glassmorphism Thrive Hub
'use client';

import React, { useState } from 'react';
import { 
  Target,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  Zap,
  Star,
  Play,
  Code,
  PenTool,
  Brain,
  Briefcase,
  Megaphone,
  Calendar,
  Award
} from 'lucide-react';

import {
  PageWrapper,
  HeroSection,
  HeroTitle,
  HeroSubtitle,
  StatsBar,
  StatItem,
  StatValue,
  StatLabel,
  CardsSection,
  Card,
  CardContent,
  CardIcon,
  CardTitle,
  CardDescription,
  ExercisesSection,
  ExercisesContainer,
  ExercisesTitle,
  LeaderboardSection,
  ScoresList,
  ScoreItem,
  RankBadge,
  PlayerInfo,
  PlayerName,
  PlayerScore,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  ActionButton
} from './styles';

// Mock data - replace with real data from your logic hook
const mockStats = {
  onlineUsers: 247,
  activeSessions: 12,
  completedToday: 89
};

const skillCategories = [
  {
    id: 'coding',
    title: 'Coding Challenges',
    description: 'Master programming skills through hands-on coding exercises and algorithmic challenges',
    icon: Code,
    color: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    participants: 1247,
    difficulty: 'All Levels'
  },
  {
    id: 'design',
    title: 'Design Workshop',
    description: 'Develop your creative skills with design thinking and visual communication projects',
    icon: PenTool,
    color: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    participants: 892,
    difficulty: 'Beginner+'
  },
  {
    id: 'writing',
    title: 'Content Creation',
    description: 'Enhance your writing and storytelling abilities through structured writing challenges',
    icon: Brain,
    color: 'linear-gradient(135deg, #059669, #10b981)',
    participants: 634,
    difficulty: 'Intermediate'
  },
  {
    id: 'business',
    title: 'Business Strategy',
    description: 'Learn strategic thinking and business analysis through real-world case studies',
    icon: Briefcase,
    color: 'linear-gradient(135deg, #dc2626, #ef4444)',
    participants: 456,
    difficulty: 'Advanced'
  },
  {
    id: 'marketing',
    title: 'Digital Marketing',
    description: 'Master modern marketing techniques and data-driven campaign optimization',
    icon: Megaphone,
    color: 'linear-gradient(135deg, #ea580c, #f97316)',
    participants: 723,
    difficulty: 'All Levels'
  },
  {
    id: 'leadership',
    title: 'Leadership Skills',
    description: 'Build leadership capabilities through team challenges and management simulations',
    icon: Users,
    color: 'linear-gradient(135deg, #374151, #4b5563)',
    participants: 389,
    difficulty: 'Advanced'
  }
];

const mockLeaderboard = [
  { rank: 1, name: 'Alex Chen', score: 2847 },
  { rank: 2, name: 'Sarah Johnson', score: 2634 },
  { rank: 3, name: 'Mike Rodriguez', score: 2521 },
  { rank: 4, name: 'Emma Thompson', score: 2389 },
  { rank: 5, name: 'David Kim', score: 2276 },
  { rank: 6, name: 'Lisa Wang', score: 2184 },
  { rank: 7, name: 'James Wilson', score: 2097 },
  { rank: 8, name: 'Maria Garcia', score: 1998 }
];

export default function ThrivePage() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Add navigation or modal logic here
    console.log(`Selected category: ${categoryId}`);
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading Thrive Hub...</LoadingText>
        </LoadingContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <HeroSection>
        <HeroTitle>Skills Development Arena</HeroTitle>
        <HeroSubtitle>
          Sharpen your professional skills through engaging challenges, collaborative learning, 
          and real-world practice in a supportive community environment.
        </HeroSubtitle>
        
        <StatsBar>
          <StatItem>
            <StatValue>{mockStats.onlineUsers}</StatValue>
            <StatLabel>Active Now</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{mockStats.activeSessions}</StatValue>
            <StatLabel>Live Sessions</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{mockStats.completedToday}</StatValue>
            <StatLabel>Completed Today</StatLabel>
          </StatItem>
        </StatsBar>
      </HeroSection>

      <CardsSection>
        <div className="cards">
          {skillCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent>
                  <CardIcon $color={category.color}>
                    <IconComponent size={28} />
                  </CardIcon>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '1rem',
                    width: '100%',
                    fontSize: '0.75rem',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <span>{category.participants} participants</span>
                    <span>{category.difficulty}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardsSection>

      <ExercisesSection>
        <ExercisesContainer>
          <ExercisesTitle>
            <Trophy size={28} style={{ marginRight: '0.5rem' }} />
            Community Leaderboard
          </ExercisesTitle>
          
          <LeaderboardSection>
            <h3>
              <Star size={20} />
              Top Performers This Week
            </h3>
            <ScoresList>
              {mockLeaderboard.map((player) => (
                <ScoreItem key={player.rank} $rank={player.rank}>
                  <RankBadge $rank={player.rank}>
                    {player.rank}
                  </RankBadge>
                  <PlayerInfo>
                    <PlayerName>{player.name}</PlayerName>
                    <PlayerScore>{player.score.toLocaleString()} pts</PlayerScore>
                  </PlayerInfo>
                </ScoreItem>
              ))}
            </ScoresList>
          </LeaderboardSection>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <ActionButton $variant="primary">
              <Play size={16} />
              Start Challenge
            </ActionButton>
            <ActionButton $variant="secondary">
              <Calendar size={16} />
              View Schedule
            </ActionButton>
            <ActionButton $variant="secondary">
              <Award size={16} />
              My Progress
            </ActionButton>
          </div>
        </ExercisesContainer>
      </ExercisesSection>
    </PageWrapper>
  );
}