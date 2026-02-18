// src/components/cs/agario/components/LeaderboardComponent.tsx
// Compact leaderboard with integrated ecosystem stats
import React, { useState, useMemo } from 'react';
import { Trophy, ChevronDown, ChevronUp, Eye, Brain, Zap, Users, Heart, Skull } from 'lucide-react';
import { LeaderboardHUD } from '../config/agario.styles';
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
  // Stats (previously in StatsDrawer)
  speciesCount?: number;
  totalBirths?: number;
  totalDeaths?: number;
  population?: number;
}

type SortMetric = 'fitness' | 'mass' | 'generation';

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  topBlobs,
  selectedBlobId,
  followedBlobId,
  onSelectBlob,
  onFollowBlob,
  onOpenTraining,
  currentTick,
  speciesCount = 0,
  totalBirths = 0,
  totalDeaths = 0,
  population = 0
}) => {
  const [sortBy, setSortBy] = useState<SortMetric>('fitness');
  const [sortDesc, setSortDesc] = useState(true);

  // Sort blobs
  const sortedBlobs = useMemo(() => {
    return [...topBlobs].sort((a, b) => {
      let aValue = 0, bValue = 0;
      switch (sortBy) {
        case 'fitness': aValue = a.genome.fitness || 0; bValue = b.genome.fitness || 0; break;
        case 'mass': aValue = a.mass; bValue = b.mass; break;
        case 'generation': aValue = a.generation; bValue = b.generation; break;
      }
      return sortDesc ? bValue - aValue : aValue - bValue;
    });
  }, [topBlobs, sortBy, sortDesc]);

  const handleSort = (metric: SortMetric) => {
    if (sortBy === metric) setSortDesc(!sortDesc);
    else { setSortBy(metric); setSortDesc(true); }
  };

  const SortBtn = ({ metric, label }: { metric: SortMetric; label: string }) => (
    <button
      onClick={() => handleSort(metric)}
      style={{
        background: sortBy === metric ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
        border: 'none',
        color: sortBy === metric ? '#a5b4fc' : '#64748b',
        cursor: 'pointer',
        padding: '2px 5px',
        borderRadius: '3px',
        fontSize: '0.65rem',
        fontWeight: sortBy === metric ? 600 : 400,
      }}
    >
      {label}
      {sortBy === metric && (sortDesc ? '↓' : '↑')}
    </button>
  );

  return (
    <LeaderboardHUD style={{ minWidth: '180px', maxWidth: '200px', padding: '8px 10px' }}>
      {/* Compact Stats Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        paddingBottom: '5px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#3b82f6' }}>
          <Users size={9} />{population}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#10b981' }}>
          <Heart size={9} />{totalBirths}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ef4444' }}>
          <Skull size={9} />{totalDeaths}
        </div>
        <div style={{ color: '#a78bfa' }}>{speciesCount}L</div>
      </div>

      {/* Header + Sort */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, fontSize: '0.7rem' }}>
          <Trophy size={10} color="#fbbf24" />
          Top {Math.min(8, topBlobs.length)}
        </div>
        <div style={{ display: 'flex', gap: '1px' }}>
          <SortBtn metric="fitness" label="F" />
          <SortBtn metric="mass" label="M" />
          <SortBtn metric="generation" label="G" />
        </div>
      </div>

      {/* Blob List - Super Compact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {sortedBlobs.slice(0, 8).map((blob, i) => {
          const isSelected = selectedBlobId === blob.id;
          const isFollowed = followedBlobId === blob.id;
          const isTop = i === 0;

          return (
            <div
              key={blob.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 4px',
                borderRadius: '3px',
                fontSize: '0.65rem',
                background: isFollowed
                  ? 'rgba(34, 197, 94, 0.15)'
                  : isSelected
                    ? 'rgba(99, 102, 241, 0.2)'
                    : isTop
                      ? 'rgba(251, 191, 36, 0.08)'
                      : 'transparent',
                borderLeft: isFollowed
                  ? '2px solid #22c55e'
                  : isTop
                    ? '2px solid #fbbf24'
                    : '2px solid transparent',
              }}
            >
              {/* Rank */}
              <span style={{ width: '10px', fontWeight: 700, color: isTop ? '#fbbf24' : '#64748b' }}>
                {i + 1}
              </span>

              {/* Color Dot */}
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: blob.color,
                flexShrink: 0
              }} />

              {/* Stats */}
              <span style={{ color: blob.generation > 15 ? '#a78bfa' : '#94a3b8', flex: 1 }}>
                G{blob.generation} {blob.mass.toFixed(0)}m
              </span>

              {/* Mini buttons */}
              <button
                onClick={(e) => { e.stopPropagation(); onFollowBlob(blob); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1px',
                  cursor: 'pointer',
                  color: isFollowed ? '#22c55e' : '#64748b',
                  display: 'flex'
                }}
                title="Follow"
              >
                <Eye size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectBlob(blob); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1px',
                  cursor: 'pointer',
                  color: isSelected ? '#818cf8' : '#64748b',
                  display: 'flex'
                }}
                title="Neural Net"
              >
                <Brain size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '6px',
        paddingTop: '5px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.6rem',
        color: '#64748b'
      }}>
        <span>Gen: <span style={{ color: '#a78bfa' }}>{Math.max(1, ...topBlobs.map(b => b.generation))}</span></span>
        <span>Fit: <span style={{ color: '#34d399' }}>{Math.max(0, ...topBlobs.map(b => b.genome.fitness)).toFixed(0)}</span></span>
      </div>

      {/* Train Button - Compact */}
      <button
        onClick={onOpenTraining}
        style={{
          marginTop: '6px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '6px',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          border: 'none',
          borderRadius: '5px',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.7rem',
          cursor: 'pointer',
        }}
        title="Headless Training"
      >
        <Zap size={12} />
        Train
      </button>
    </LeaderboardHUD>
  );
};
