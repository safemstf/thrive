// src/components/hubs/skillsMarketplace.tsx - Hub Integration Component
'use client';

import React, { useState } from 'react';
import { 
  Swords, 
  Trophy, 
  Target, 
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Flame,
  ArrowRight,
  Zap
} from 'lucide-react';

interface SkillsMarketplaceHubProps {
  userPortfolio: any;
  skillsData: {
    activeChallenge: boolean;
    currentBounty: number;
    rank: string;
    earnings: number;
    winRate: number;
    nextChallenge: string;
  };
  onChallengeComplete: (bounty: number) => void;
}

// Mini challenges for the hub view
const quickChallenges = [
  {
    id: '1',
    title: 'React Performance Sprint',
    description: 'Optimize React components for maximum performance',
    bounty: 850,
    timeLimit: '2h',
    difficulty: 'Elite',
    participants: 23
  },
  {
    id: '2',
    title: 'Brand Strategy Duel',
    description: 'Create a winning brand positioning strategy',
    bounty: 650,
    timeLimit: '4h',
    difficulty: 'Advanced',
    participants: 18
  },
  {
    id: '3',
    title: 'Algorithm Combat',
    description: 'Solve complex algorithmic challenges',
    bounty: 1200,
    timeLimit: '1h',
    difficulty: 'Legendary',
    participants: 45
  }
];

const leaderboardPreview = [
  { name: 'CodeNinja', earnings: 12400, rank: 1, badge: 'Apex Predator' },
  { name: 'DesignMaster', earnings: 11200, rank: 2, badge: 'Elite Hunter' },
  { name: 'AlgoQueen', earnings: 10800, rank: 3, badge: 'Elite Hunter' }
];

export const SkillsMarketplaceHub: React.FC<SkillsMarketplaceHubProps> = ({
  userPortfolio,
  skillsData,
  onChallengeComplete
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      case 'Elite': return '#8b5cf6';
      case 'Legendary': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const getRankGradient = (rank: string) => {
    switch (rank) {
      case 'Apex Predator': return 'linear-gradient(135deg, #ffd700, #ff6b6b)';
      case 'Elite Hunter': return 'linear-gradient(135deg, #8b5cf6, #3b82f6)';
      default: return 'linear-gradient(135deg, #10b981, #059669)';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      borderRadius: '1rem',
      padding: '2rem',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Arena Header */}
      <div style={{
        background: 'rgba(220, 38, 38, 0.1)',
        border: '2px solid rgba(220, 38, 38, 0.3)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(220, 38, 38, 0.05), rgba(239, 68, 68, 0.05))',
          animation: 'pulse 3s infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Swords size={32} style={{ color: '#dc2626' }} />
                Skills Survival Arena
              </h2>
              <p style={{
                margin: 0,
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                Prove your skills in combat. Only the strongest survive.
              </p>
            </div>

            {/* User Battle Status */}
            <div style={{
              background: getRankGradient(skillsData.rank),
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                {skillsData.rank}
              </div>
              <div style={{
                fontSize: '0.875rem',
                opacity: 0.9,
                marginBottom: '0.5rem'
              }}>
                Win Rate: {skillsData.winRate}%
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                ${skillsData.earnings.toLocaleString()} Earned
              </div>
            </div>
          </div>

          {/* Arena Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#dc2626',
                marginBottom: '0.25rem'
              }}>
                {quickChallenges.length}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Active Battles
              </div>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '0.25rem'
              }}>
                ${quickChallenges.reduce((sum, c) => sum + c.bounty, 0).toLocaleString()}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Prize Pool
              </div>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '0.25rem'
              }}>
                {quickChallenges.reduce((sum, c) => sum + c.participants, 0)}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Competitors
              </div>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#8b5cf6',
                marginBottom: '0.25rem'
              }}>
                87%
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Survival Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Battles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}>
        {/* Active Challenges */}
        <div>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Target size={20} />
            Quick Battles
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {quickChallenges.map(challenge => (
              <div
                key={challenge.id}
                style={{
                  background: selectedChallenge === challenge.id 
                    ? 'rgba(220, 38, 38, 0.2)'
                    : 'rgba(0,0,0,0.4)',
                  border: selectedChallenge === challenge.id
                    ? '2px solid rgba(220, 38, 38, 0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedChallenge(
                  selectedChallenge === challenge.id ? null : challenge.id
                )}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
                    }}>
                      {challenge.title}
                    </h4>
                    <p style={{
                      margin: 0,
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    }}>
                      {challenge.description}
                    </p>
                  </div>
                  
                  <div style={{
                    background: getDifficultyColor(challenge.difficulty),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginLeft: '1rem'
                  }}>
                    {challenge.difficulty}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      ${challenge.bounty}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      Bounty
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#f59e0b'
                    }}>
                      {challenge.timeLimit}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      Time Limit
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#8b5cf6'
                    }}>
                      {challenge.participants}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      Hunters
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChallengeComplete(challenge.bounty);
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Swords size={16} />
                  Enter Battle
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Leaderboard Preview */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Trophy size={18} />
              Top Survivors
            </h4>
            
            {leaderboardPreview.map((hunter, index) => (
              <div
                key={hunter.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index === 0 
                    ? 'linear-gradient(135deg, #ffd700, #ff6b6b)'
                    : getRankGradient(hunter.badge),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: '0.875rem'
                }}>
                  {hunter.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    {hunter.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    ${hunter.earnings.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            
            <button style={{
              width: '100%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}>
              View Full Leaderboard
            </button>
          </div>

          {/* Arena Status */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Flame size={18} />
              Arena Status
            </h4>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              fontSize: '0.875rem'
            }}>
              <span>Active Hunters:</span>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>156</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              fontSize: '0.875rem'
            }}>
              <span>Battles Today:</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>47</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <span>Total Bounties:</span>
              <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>$24.5K</span>
            </div>
            
            <div style={{
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                Next Death Match
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                Starting in 23 minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link to Full Arena */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <a
          href="/dashboard/skills-arena"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: 'white',
            textDecoration: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            transition: 'all 0.2s'
          }}
        >
          <Swords size={20} />
          Enter Full Arena
          <ArrowRight size={20} />
        </a>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
