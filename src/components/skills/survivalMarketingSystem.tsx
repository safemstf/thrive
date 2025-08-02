// src/components/skills/survivalMarketingSystem.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Skull, Sword, Shield, Crown, Flame, Zap, Target, Trophy,
  TrendingUp, TrendingDown, Users, Clock, Star, Award,
  AlertTriangle, CheckCircle, XCircle, Eye, Heart,
  MessageSquare, Share2, DollarSign, BarChart3
} from 'lucide-react';

// Types for the survival marketing system
interface SkillMarketData {
  skillId: string;
  name: string;
  category: 'technical' | 'creative' | 'strategic' | 'communication';
  currentValue: number; // Market value in points
  demand: number; // 0-100 demand rating
  supply: number; // Number of people with this skill
  volatility: 'stable' | 'rising' | 'falling' | 'volatile';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythical';
  lastWeekChange: number; // Percentage change
  challenges: number; // Active challenges for this skill
  topEarner: string;
  topEarnings: number;
}

interface UserSkillProfile {
  skillId: string;
  level: number; // 1-100
  reputation: number; // Market reputation
  earnings: number;
  winRate: number;
  lastActive: Date;
  marketPosition: 'rising' | 'falling' | 'stable';
  competitorsDefeated: number;
  survivalRank: 'novice' | 'hunter' | 'elite' | 'apex' | 'legend';
}

interface ChallengeArena {
  id: string;
  title: string;
  skillRequired: string;
  stakesLevel: 'low' | 'medium' | 'high' | 'extreme';
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  timeRemaining: string;
  winnerTakeAll: boolean;
  eliminationStyle: boolean;
  currentLeader?: string;
  leaderScore?: number;
}

// Mock data for the survival system
const skillMarketData: SkillMarketData[] = [
  {
    skillId: 'react-performance',
    name: 'React Performance',
    category: 'technical',
    currentValue: 1250,
    demand: 92,
    supply: 234,
    volatility: 'rising',
    rarity: 'rare',
    lastWeekChange: 23.5,
    challenges: 8,
    topEarner: 'CodeNinja',
    topEarnings: 15420
  },
  {
    skillId: 'brand-strategy',
    name: 'Brand Strategy',
    category: 'strategic',
    currentValue: 980,
    demand: 87,
    supply: 156,
    volatility: 'stable',
    rarity: 'uncommon',
    lastWeekChange: 8.2,
    challenges: 12,
    topEarner: 'BrandMaster',
    topEarnings: 12800
  },
  {
    skillId: 'algorithmic-trading',
    name: 'Algorithmic Trading',
    category: 'technical',
    currentValue: 2100,
    demand: 95,
    supply: 67,
    volatility: 'volatile',
    rarity: 'legendary',
    lastWeekChange: -12.3,
    challenges: 3,
    topEarner: 'AlgoQueen',
    topEarnings: 28500
  },
  {
    skillId: 'ux-psychology',
    name: 'UX Psychology',
    category: 'creative',
    currentValue: 850,
    demand: 78,
    supply: 298,
    volatility: 'rising',
    rarity: 'common',
    lastWeekChange: 15.7,
    challenges: 15,
    topEarner: 'MindReader',
    topEarnings: 9600
  }
];

const challenges: ChallengeArena[] = [
  {
    id: '1',
    title: 'Death Match: React vs Vue Performance',
    skillRequired: 'react-performance',
    stakesLevel: 'extreme',
    entryFee: 100,
    prizePool: 5000,
    participants: 23,
    maxParticipants: 25,
    timeRemaining: '6h 23m',
    winnerTakeAll: true,
    eliminationStyle: true,
    currentLeader: 'CodeSlayer',
    leaderScore: 94.2
  },
  {
    id: '2',
    title: 'Brand Survival Challenge',
    skillRequired: 'brand-strategy',
    stakesLevel: 'high',
    entryFee: 50,
    prizePool: 2500,
    participants: 18,
    maxParticipants: 20,
    timeRemaining: '2d 4h',
    winnerTakeAll: false,
    eliminationStyle: false
  },
  {
    id: '3',
    title: 'Algorithm Gladiator Arena',
    skillRequired: 'algorithmic-trading',
    stakesLevel: 'extreme',
    entryFee: 200,
    prizePool: 10000,
    participants: 8,
    maxParticipants: 10,
    timeRemaining: '18h 45m',
    winnerTakeAll: true,
    eliminationStyle: true,
    currentLeader: 'QuantKiller',
    leaderScore: 87.8
  }
];

const SurvivalSkillsMarketplace = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'market' | 'challenges' | 'leaderboard'>('market');
  const [userProfile] = useState<UserSkillProfile>({
    skillId: 'react-performance',
    level: 78,
    reputation: 1847,
    earnings: 12450,
    winRate: 73,
    lastActive: new Date(),
    marketPosition: 'rising',
    competitorsDefeated: 156,
    survivalRank: 'elite'
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'legendary': return '#8b5cf6';
      case 'mythical': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const getVolatilityIcon = (volatility: string) => {
    switch (volatility) {
      case 'rising': return { icon: TrendingUp, color: '#10b981' };
      case 'falling': return { icon: TrendingDown, color: '#ef4444' };
      case 'volatile': return { icon: Zap, color: '#f59e0b' };
      default: return { icon: BarChart3, color: '#6b7280' };
    }
  };

  const getStakesColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'extreme': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSurvivalRankStyle = (rank: string) => {
    switch (rank) {
      case 'novice': return { gradient: 'linear-gradient(135deg, #6b7280, #4b5563)', title: 'Novice' };
      case 'hunter': return { gradient: 'linear-gradient(135deg, #10b981, #059669)', title: 'Hunter' };
      case 'elite': return { gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)', title: 'Elite Hunter' };
      case 'apex': return { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', title: 'Apex Predator' };
      case 'legend': return { gradient: 'linear-gradient(135deg, #ec4899, #be185d)', title: 'Legend' };
      default: return { gradient: 'linear-gradient(135deg, #6b7280, #4b5563)', title: 'Unknown' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.1))',
          animation: 'pulse 3s infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <Skull size={40} style={{ color: '#dc2626' }} />
                Skills Survival Arena
              </h1>
              <p style={{ margin: 0, fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>
                Where only the strongest skills survive. Adapt, compete, or perish.
              </p>
            </div>
            
            {/* User Survival Status */}
            <div style={{
              background: getSurvivalRankStyle(userProfile.survivalRank).gradient,
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {getSurvivalRankStyle(userProfile.survivalRank).title}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {userProfile.competitorsDefeated} Defeated • {userProfile.winRate}% Win Rate
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { id: 'market', label: 'Skill Market', icon: BarChart3 },
              { id: 'challenges', label: 'Death Matches', icon: Sword },
              { id: 'leaderboard', label: 'Survivors', icon: Trophy }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  style={{
                    background: viewMode === tab.id 
                      ? 'rgba(220, 38, 38, 0.3)' 
                      : 'rgba(255,255,255,0.1)',
                    border: viewMode === tab.id 
                      ? '2px solid rgba(220, 38, 38, 0.5)' 
                      : '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill Market View */}
      {viewMode === 'market' && (
        <div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Target size={20} />
              Skill Market Intelligence
            </h2>
            <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.7)' }}>
              Track skill demand, monitor competitors, and identify survival opportunities.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {skillMarketData.map(skill => {
              const volatility = getVolatilityIcon(skill.volatility);
              const VolatilityIcon = volatility.icon;
              
              return (
                <div
                  key={skill.skillId}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: selectedSkill === skill.skillId 
                      ? '2px solid rgba(220, 38, 38, 0.5)' 
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => setSelectedSkill(selectedSkill === skill.skillId ? null : skill.skillId)}
                >
                  {/* Rarity Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: getRarityColor(skill.rarity),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {skill.rarity}
                  </div>

                  {/* Skill Header */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
                    }}>
                      {skill.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                        textTransform: 'capitalize'
                      }}>
                        {skill.category}
                      </span>
                      <VolatilityIcon size={14} color={volatility.color} />
                      <span style={{ color: volatility.color, fontWeight: 'bold' }}>
                        {skill.volatility}
                      </span>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#10b981'
                      }}>
                        ${skill.currentValue}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.7)'
                      }}>
                        Market Value
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: skill.lastWeekChange >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        {skill.lastWeekChange >= 0 ? '+' : ''}{skill.lastWeekChange.toFixed(1)}%
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.7)'
                      }}>
                        7-Day Change
                      </div>
                    </div>
                  </div>

                  {/* Demand/Supply Bars */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      <span>Demand</span>
                      <span>{skill.demand}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: `${skill.demand}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      <span>Competition</span>
                      <span>{skill.supply} hunters</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min((skill.supply / 500) * 100, 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  {/* Top Performer */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          🥇 {skill.topEarner}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                          Alpha Hunter
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontWeight: 'bold',
                          color: '#10b981',
                          marginBottom: '0.25rem'
                        }}>
                          ${skill.topEarnings.toLocaleString()}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                          Lifetime
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button style={{
                    width: '100%',
                    background: skill.challenges > 0 
                      ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                      : 'rgba(107, 114, 128, 0.3)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: skill.challenges > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}>
                    {skill.challenges > 0 ? (
                      <>
                        <Sword size={16} />
                        Enter Arena ({skill.challenges} active)
                      </>
                    ) : (
                      <>
                        <Shield size={16} />
                        No Active Challenges
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Death Matches View */}
      {viewMode === 'challenges' && (
        <div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sword size={20} />
              Active Death Matches
            </h2>
            <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.7)' }}>
              High-stakes competitions where skills are tested to the limit. Entry fees fund massive prize pools.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            {challenges.map(challenge => (
              <div
                key={challenge.id}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: challenge.stakesLevel === 'extreme' 
                    ? '2px solid rgba(220, 38, 38, 0.5)' 
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Stakes Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: getStakesColor(challenge.stakesLevel),
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {challenge.stakesLevel === 'extreme' && <Flame size={12} />}
                  {challenge.stakesLevel}
                </div>

                {/* Challenge Header */}
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: challenge.eliminationStyle ? '#ef4444' : 'white'
                  }}>
                    {challenge.title}
                  </h3>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    Skill Required: <strong>{challenge.skillRequired.replace('-', ' ').toUpperCase()}</strong>
                  </div>
                </div>

                {/* Prize Info */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                      Prize Pool
                    </span>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      ${challenge.prizePool.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    <span>Entry Fee: ${challenge.entryFee}</span>
                    <span>{challenge.winnerTakeAll ? 'Winner Take All' : 'Tiered Rewards'}</span>
                  </div>
                </div>

                {/* Participants */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Participants: </span>
                    <span style={{ fontWeight: 'bold' }}>
                      {challenge.participants}/{challenge.maxParticipants}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#f59e0b'
                  }}>
                    <Clock size={14} />
                    {challenge.timeRemaining}
                  </div>
                </div>

                {/* Current Leader (if applicable) */}
                {challenge.currentLeader && (
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 'bold',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Crown size={14} color="#fbbf24" />
                        {challenge.currentLeader}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.7)'
                      }}>
                        Current Leader
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#8b5cf6'
                    }}>
                      {challenge.leaderScore}%
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button style={{
                  width: '100%',
                  background: challenge.participants >= challenge.maxParticipants
                    ? 'rgba(107, 114, 128, 0.3)'
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: challenge.participants >= challenge.maxParticipants ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}>
                  {challenge.participants >= challenge.maxParticipants ? (
                    <>
                      <XCircle size={16} />
                      Arena Full
                    </>
                  ) : (
                    <>
                      <Sword size={16} />
                      Enter Death Match (${challenge.entryFee})
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard View */}
      {viewMode === 'leaderboard' && (
        <div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Trophy size={20} />
              Survival Leaderboard
            </h2>
            <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.7)' }}>
              The apex predators who dominate the skills arena. These legends have proven their superiority.
            </p>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Hall of Legends
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                Only the strongest survive. Will you join them?
              </p>
            </div>

            {/* Coming Soon for Full Leaderboard */}
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '1rem',
              border: '2px dashed rgba(255,255,255,0.2)'
            }}>
              <Trophy size={48} style={{ marginBottom: '1rem', color: '#6b7280' }} />
              <h4 style={{ marginBottom: '0.5rem', color: '#e5e7eb' }}>
                Leaderboard Coming Soon
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
                We're preparing the ultimate ranking system for skill warriors.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#f59e0b'
              }}>
                <Clock size={16} />
                <span>Battle system initializing...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SurvivalSkillsMarketplace;