// src/components/cs/agario/components/LeaderboardComponent.tsx
import React, { useState, useMemo } from 'react';
import { Trophy, Users, TrendingUp, Target, Heart, Zap, Crown, Baby } from 'lucide-react';
import { LeaderboardHUD, LeaderboardEntry } from '../config/agario.styles';
import { Blob } from '../config/agario.types';
import { 
  MIN_AGE_FOR_REPRODUCTION, 
  REPRODUCTION_MIN_MASS, 
  FOOD_FOR_REPRODUCTION,
  REPRODUCTION_COOLDOWN
} from '../config/agario.constants';

interface LeaderboardComponentProps {
  topBlobs: Blob[];
  selectedBlobId: number | null;
  onSelectBlob: (blob: Blob) => void;
  currentTick: number;
}

type SortMetric = 'fitness' | 'mass' | 'kills' | 'age' | 'children' | 'reproductionRate';

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  topBlobs,
  selectedBlobId,
  onSelectBlob,
  currentTick
}) => {
  const [sortBy, setSortBy] = useState<SortMetric>('fitness');
  const [sortDesc, setSortDesc] = useState(true);

  // Calculate additional metrics for each blob
  const enrichedBlobs = useMemo(() => {
    return topBlobs.map(blob => {
      // Calculate reproduction readiness
      const reproductionCooldown = (currentTick - blob.lastReproductionTick) / REPRODUCTION_COOLDOWN;
      const reproductionReady = Math.min(1, reproductionCooldown);
      
      // Calculate reproductive efficiency (children per unit time)
      const ageInTicks = blob.age;
      const reproductionRate = ageInTicks > 100 ? blob.childrenIds.length / (ageInTicks / 1000) : 0;
      
      // Calculate survival score (composite metric)
      const survivalScore = 
        (blob.mass * 0.3) + 
        (blob.kills * 10) + 
        (blob.childrenIds.length * 15) + 
        (blob.foodEaten * 0.5) +
        (blob.age * 0.1);

      return {
        ...blob,
        reproductionReady,
        reproductionRate,
        survivalScore,
        canReproduce: blob.age >= MIN_AGE_FOR_REPRODUCTION &&
          blob.mass >= REPRODUCTION_MIN_MASS &&
          (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION)
      };
    });
  }, [topBlobs, currentTick]);

  // Sort blobs based on selected metric
  const sortedBlobs = useMemo(() => {
    return [...enrichedBlobs].sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      switch (sortBy) {
        case 'fitness':
          aValue = a.genome.fitness || 0;
          bValue = b.genome.fitness || 0;
          break;
        case 'mass':
          aValue = a.mass;
          bValue = b.mass;
          break;
        case 'kills':
          aValue = a.kills;
          bValue = b.kills;
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'children':
          aValue = a.childrenIds.length;
          bValue = b.childrenIds.length;
          break;
        case 'reproductionRate':
          aValue = a.reproductionRate;
          bValue = b.reproductionRate;
          break;
      }

      return sortDesc ? bValue - aValue : aValue - bValue;
    });
  }, [enrichedBlobs, sortBy, sortDesc]);

  // Handle sort click
  const handleSort = (metric: SortMetric) => {
    if (sortBy === metric) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(metric);
      setSortDesc(true);
    }
  };

  // Get sort icon
  const getSortIcon = (metric: SortMetric) => {
    if (sortBy !== metric) return null;
    return sortDesc ? '↓' : '↑';
  };

  // Get metric color
  const getMetricColor = (value: number, metric: SortMetric): string => {
    switch (metric) {
      case 'fitness':
        return value > 50 ? '#22c55e' : value > 0 ? '#fbbf24' : '#ef4444';
      case 'mass':
        return value > 50 ? '#22c55e' : value > 30 ? '#fbbf24' : '#94a3b8';
      case 'kills':
        return value > 5 ? '#ef4444' : value > 0 ? '#f97316' : '#94a3b8';
      case 'age':
        return value > 500 ? '#8b5cf6' : value > 100 ? '#3b82f6' : '#94a3b8';
      case 'children':
        return value > 5 ? '#ec4899' : value > 0 ? '#8b5cf6' : '#94a3b8';
      case 'reproductionRate':
        return value > 1 ? '#10b981' : value > 0.1 ? '#fbbf24' : '#94a3b8';
      default:
        return '#ffffff';
    }
  };

  // Format metric value
  const formatMetric = (blob: typeof enrichedBlobs[0], metric: SortMetric): string => {
    switch (metric) {
      case 'fitness':
        return blob.genome.fitness.toFixed(1);
      case 'mass':
        return blob.mass.toFixed(1);
      case 'kills':
        return blob.kills.toString();
      case 'age':
        return blob.age.toString();
      case 'children':
        return blob.childrenIds.length.toString();
      case 'reproductionRate':
        return blob.reproductionRate.toFixed(2);
      default:
        return '';
    }
  };

  return (
    <LeaderboardHUD>
      <div style={{ 
        fontWeight: 700, 
        marginBottom: '0.75rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={16} />
          Top Survivors
          <Users size={14} style={{ opacity: 0.5 }} />
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.25rem', 
          fontSize: '0.7rem',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px'
        }}>
          <button
            onClick={() => handleSort('fitness')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: sortBy === 'fitness' ? '#fbbf24' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
            title="Sort by fitness"
          >
            <Zap size={10} />{getSortIcon('fitness')}
          </button>
          <button
            onClick={() => handleSort('mass')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: sortBy === 'mass' ? '#fbbf24' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
            title="Sort by mass"
          >
            <TrendingUp size={10} />{getSortIcon('mass')}
          </button>
          <button
            onClick={() => handleSort('children')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: sortBy === 'children' ? '#fbbf24' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
            title="Sort by children count"
          >
            <Baby size={10} />{getSortIcon('children')}
          </button>
        </div>
      </div>

      {sortedBlobs.map((blob, i) => {
        const isBest = i === 0;
        const isSelected = selectedBlobId === blob.id;
        const metricValue = formatMetric(blob, sortBy);
        const metricColor = getMetricColor(parseFloat(metricValue) || 0, sortBy);

        return (
          <LeaderboardEntry
            key={blob.id}
            $rank={i}
            $selected={isSelected}
            onClick={() => onSelectBlob(blob)}
            style={{
              borderLeft: isBest ? '3px solid #fbbf24' : '3px solid transparent',
              background: isBest ? 'rgba(251, 191, 36, 0.1)' : undefined
            }}
          >
            <div className="rank" style={{ 
              color: isBest ? '#fbbf24' : undefined,
              fontWeight: isBest ? 700 : 600
            }}>
              #{i + 1}
              {isBest && <Crown size={10} style={{ marginLeft: '2px' }} />}
            </div>
            
            <div className="blob-color" style={{ 
              background: blob.color,
              boxShadow: isBest ? `0 0 8px ${blob.color}` : undefined
            }} />
            
            <div className="info" style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontWeight: 600 }}>
                  #{blob.id.toString().slice(-4)} • <span style={{ color: '#22c55e' }}>{blob.mass.toFixed(0)}</span>m
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: metricColor,
                  fontWeight: 600,
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '1px 4px',
                  borderRadius: '3px'
                }}>
                  {metricValue}
                </div>
              </div>
              
              <div className="gen" style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '2px'
              }}>
                <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                  <span title="Age" style={{ color: '#8b5cf6' }}>
                    🕒{blob.age}
                  </span>
                  <span title="Children" style={{ color: '#ec4899' }}>
                    👶{blob.childrenIds.length}
                  </span>
                  <span title="Kills" style={{ color: '#ef4444' }}>
                    ⚔️{blob.kills}
                  </span>
                  <span title="Food eaten" style={{ color: '#10b981' }}>
                    🍎{blob.foodEaten}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '2px' }}>
                  {blob.canReproduce ? (
                    <div title="Ready to reproduce" style={{ color: '#22c55e' }}>
                      <Heart size={10} fill="#22c55e" />
                    </div>
                  ) : (
                    <div title="Not ready to reproduce" style={{ color: '#94a3b8' }}>
                      <Heart size={10} />
                    </div>
                  )}
                  
                  {blob.reproductionReady >= 0.8 && (
                    <div title="Reproduction cooldown ready" style={{ color: '#3b82f6' }}>
                      <Target size={10} />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar for reproduction cooldown */}
              {blob.canReproduce && blob.reproductionReady < 1 && (
                <div style={{ 
                  marginTop: '4px',
                  height: '2px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '1px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${blob.reproductionReady * 100}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              )}
            </div>
          </LeaderboardEntry>
        );
      })}

      {/* Legend */}
      <div style={{ 
        marginTop: '0.75rem', 
        padding: '0.5rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        fontSize: '0.7rem',
        color: '#94a3b8',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.25rem'
      }}>
        <div>🕒 = Age</div>
        <div>👶 = Children</div>
        <div>⚔️ = Kills</div>
        <div>🍎 = Food eaten</div>
      </div>
    </LeaderboardHUD>
  );
};