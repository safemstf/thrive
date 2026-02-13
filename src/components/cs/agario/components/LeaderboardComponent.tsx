// src/components/cs/agario/components/LeaderboardComponent.tsx
import React, { useState, useMemo } from 'react';
import { Trophy, ChevronDown, ChevronUp, Eye, Brain, Zap } from 'lucide-react';
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
  followedBlobId: number | null;
  onSelectBlob: (blob: Blob) => void;
  onFollowBlob: (blob: Blob) => void;
  onOpenTraining: () => void;
  currentTick: number;
}

type SortMetric = 'fitness' | 'mass' | 'generation' | 'children';

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  topBlobs,
  selectedBlobId,
  followedBlobId,
  onSelectBlob,
  onFollowBlob,
  onOpenTraining,
  currentTick
}) => {
  const [sortBy, setSortBy] = useState<SortMetric>('fitness');
  const [sortDesc, setSortDesc] = useState(true);

  // Enrich blobs with computed data
  const enrichedBlobs = useMemo(() => {
    return topBlobs.map(blob => {
      const canReproduce = blob.age >= MIN_AGE_FOR_REPRODUCTION &&
        blob.mass >= REPRODUCTION_MIN_MASS &&
        (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION) &&
        (currentTick - blob.lastReproductionTick) > REPRODUCTION_COOLDOWN;

      return { ...blob, canReproduce };
    });
  }, [topBlobs, currentTick]);

  // Sort blobs
  const sortedBlobs = useMemo(() => {
    return [...enrichedBlobs].sort((a, b) => {
      let aValue = 0, bValue = 0;
      switch (sortBy) {
        case 'fitness': aValue = a.genome.fitness || 0; bValue = b.genome.fitness || 0; break;
        case 'mass': aValue = a.mass; bValue = b.mass; break;
        case 'generation': aValue = a.generation; bValue = b.generation; break;
        case 'children': aValue = a.childrenIds.length; bValue = b.childrenIds.length; break;
      }
      return sortDesc ? bValue - aValue : aValue - bValue;
    });
  }, [enrichedBlobs, sortBy, sortDesc]);

  const handleSort = (metric: SortMetric) => {
    if (sortBy === metric) setSortDesc(!sortDesc);
    else { setSortBy(metric); setSortDesc(true); }
  };

  const SortButton = ({ metric, label }: { metric: SortMetric; label: string }) => (
    <button
      onClick={() => handleSort(metric)}
      style={{
        background: sortBy === metric ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
        border: 'none',
        color: sortBy === metric ? '#a5b4fc' : '#64748b',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: sortBy === metric ? 600 : 400,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        transition: 'all 0.15s'
      }}
    >
      {label}
      {sortBy === metric && (sortDesc ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
    </button>
  );

  return (
    <LeaderboardHUD>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <Trophy size={14} color="#fbbf24" />
          Leaderboard
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
          {topBlobs.length} shown
        </div>
      </div>

      {/* Sort Controls */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        <SortButton metric="fitness" label="Fitness" />
        <SortButton metric="mass" label="Mass" />
        <SortButton metric="generation" label="Gen" />
        <SortButton metric="children" label="Kids" />
      </div>

      {/* Blob List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {sortedBlobs.map((blob, i) => {
          const isSelected = selectedBlobId === blob.id;
          const isFollowed = followedBlobId === blob.id;
          const isTop = i === 0;

          return (
            <LeaderboardEntry
              key={blob.id}
              $rank={i}
              $selected={isSelected}
              style={{
                background: isFollowed
                  ? 'rgba(34, 197, 94, 0.15)'
                  : isSelected
                    ? 'rgba(99, 102, 241, 0.2)'
                    : isTop
                      ? 'rgba(251, 191, 36, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                borderLeft: isFollowed
                  ? '2px solid #22c55e'
                  : isTop
                    ? '2px solid #fbbf24'
                    : '2px solid transparent',
                padding: '8px 10px',
                borderRadius: '6px',
                transition: 'all 0.15s'
              }}
            >
              {/* Main Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {/* Rank */}
                <div style={{
                  width: '18px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: isTop ? '#fbbf24' : '#64748b'
                }}>
                  {i + 1}
                </div>

                {/* Color Dot */}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: blob.color,
                  boxShadow: `0 0 6px ${blob.color}40`,
                  flexShrink: 0
                }} />

                {/* ID */}
                <div style={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#e2e8f0',
                  width: '40px'
                }}>
                  #{blob.id}
                </div>

                {/* Stats Grid - Compact */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flex: 1,
                  fontSize: '0.7rem'
                }}>
                  {/* Generation */}
                  <div style={{
                    color: blob.generation > 20 ? '#a78bfa' : blob.generation > 10 ? '#818cf8' : '#94a3b8',
                    fontWeight: 600
                  }}>
                    G{blob.generation}
                  </div>

                  {/* Mass */}
                  <div style={{
                    color: blob.mass > 60 ? '#34d399' : blob.mass > 35 ? '#fbbf24' : '#94a3b8'
                  }}>
                    {blob.mass.toFixed(0)}m
                  </div>

                  {/* Children */}
                  <div style={{
                    color: blob.childrenIds.length > 3 ? '#f472b6' : blob.childrenIds.length > 0 ? '#c084fc' : '#64748b'
                  }}>
                    {blob.childrenIds.length}👶
                  </div>

                  {/* Kills */}
                  <div style={{
                    color: blob.kills > 3 ? '#f87171' : blob.kills > 0 ? '#fb923c' : '#64748b'
                  }}>
                    {blob.kills}⚔
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {/* Follow Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowBlob(blob);
                    }}
                    style={{
                      background: isFollowed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      color: isFollowed ? '#22c55e' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.15s'
                    }}
                    title={isFollowed ? 'Stop following' : 'Follow this blob'}
                  >
                    <Eye size={12} />
                  </button>

                  {/* Neural Net Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlob(blob);
                    }}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      color: isSelected ? '#818cf8' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.15s'
                    }}
                    title="View neural network"
                  >
                    <Brain size={12} />
                  </button>
                </div>

                {/* Reproduction Ready Indicator */}
                {blob.canReproduce && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#a855f7',
                    boxShadow: '0 0 6px #a855f7',
                    animation: 'pulse 1.5s infinite',
                    flexShrink: 0
                  }} title="Ready to reproduce" />
                )}
              </div>

              {/* Heuristic Reason (if available) */}
              {blob.lastHeuristicReason && (
                <div style={{
                  marginTop: '4px',
                  fontSize: '0.65rem',
                  color: '#64748b',
                  fontStyle: 'italic',
                  paddingLeft: '30px'
                }}>
                  {blob.lastHeuristicReason}
                </div>
              )}

              {/* Fitness Bar (subtle) */}
              <div style={{
                marginTop: '4px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, (blob.genome.fitness + 50) / 2))}%`,
                  background: blob.genome.fitness > 50
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : blob.genome.fitness > 0
                      ? 'linear-gradient(90deg, #eab308, #facc15)'
                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                  borderRadius: '2px',
                  transition: 'width 0.3s'
                }} />
              </div>
            </LeaderboardEntry>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.7rem',
        color: '#64748b'
      }}>
        <div>
          Max Gen: <span style={{ color: '#a78bfa', fontWeight: 600 }}>
            {Math.max(1, ...topBlobs.map(b => b.generation))}
          </span>
        </div>
        <div>
          Top Fit: <span style={{ color: '#34d399', fontWeight: 600 }}>
            {Math.max(0, ...topBlobs.map(b => b.genome.fitness)).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Train Button */}
      <button
        onClick={onOpenTraining}
        style={{
          marginTop: '10px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '10px',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        title="Open Headless Training - Train faster without rendering"
      >
        <Zap size={14} />
        Headless Training
      </button>
    </LeaderboardHUD>
  );
};
