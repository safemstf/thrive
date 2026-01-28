// src/components/cs/agario/HUDComponent.tsx
import React from 'react';
import { HUD } from '../config/agario.styles';

interface HUDComponentProps {
  generation: number;
  population: number;
  maxPopulation: number;
  foodCount: number;
  avgMass: number;
  avgAge: number;
  reproductionRate: number;
  totalBirths: number;
  totalDeaths: number;
}

export const HUDComponent: React.FC<HUDComponentProps> = ({
  generation,
  population,
  maxPopulation,
  foodCount,
  avgMass,
  avgAge,
  reproductionRate,
  totalBirths,
  totalDeaths
}) => (
  <HUD>
    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
      Generation {generation}
    </div>
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ opacity: 0.7 }}>Population:</span>
        <span style={{ fontWeight: 600, color: '#3b82f6' }}>{population}/{maxPopulation}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ opacity: 0.7 }}>Food:</span>
        <span style={{ fontWeight: 600, color: '#22c55e' }}>{foodCount}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ opacity: 0.7 }}>Avg Mass:</span>
        <span style={{ fontWeight: 600, color: '#fbbf24' }}>{avgMass.toFixed(1)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ opacity: 0.7 }}>Avg Age:</span>
        <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{avgAge.toFixed(0)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ opacity: 0.7 }}>Reproduction Rate:</span>
        <span style={{ fontWeight: 600, color: '#10b981' }}>{reproductionRate.toFixed(2)}/1000t</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ opacity: 0.7 }}>Births/Deaths:</span>
        <span style={{ fontWeight: 600, color: totalBirths > totalDeaths ? '#10b981' : '#ef4444' }}>
          {totalBirths}/{totalDeaths}
        </span>
      </div>
    </div>
  </HUD>
);