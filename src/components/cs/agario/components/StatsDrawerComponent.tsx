// src/components/cs/agario/StatsDrawerComponent.tsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ControlsDrawer, DrawerHandle, DrawerContent, StatCard, Grid } from '../config/agario.styles';

interface StatsDrawerComponentProps {
  expanded: boolean;
  onToggle: () => void;
  speciesCount: number;
  totalBirths: number;
  totalDeaths: number;
  largestFamily: number;
}

export const StatsDrawerComponent: React.FC<StatsDrawerComponentProps> = ({
  expanded,
  onToggle,
  speciesCount,
  totalBirths,
  totalDeaths,
  largestFamily
}) => (
  <ControlsDrawer $expanded={expanded}>
    <DrawerHandle onClick={onToggle}>
      {expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      <span>Ecosystem Statistics</span>
    </DrawerHandle>
    {expanded && (
      <DrawerContent>
        <Grid $columns={4}>
          <StatCard $color="#3b82f6">
            <div className="label">Lineages</div>
            <div className="value">{speciesCount}</div>
            <div className="change">Family dynasties</div>
          </StatCard>
          <StatCard $color="#10b981">
            <div className="label">Total Births</div>
            <div className="value">{totalBirths}</div>
            <div className="change">Natural reproduction</div>
          </StatCard>
          <StatCard $color="#ef4444">
            <div className="label">Total Deaths</div>
            <div className="value">{totalDeaths}</div>
            <div className="change">Natural selection</div>
          </StatCard>
          <StatCard $color="#fbbf24">
            <div className="label">Largest Family</div>
            <div className="value">{largestFamily}</div>
            <div className="change">Successful lineage</div>
          </StatCard>
        </Grid>
      </DrawerContent>
    )}
  </ControlsDrawer>
);