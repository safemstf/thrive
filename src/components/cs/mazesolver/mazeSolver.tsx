'use client'

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, ChevronDown,
  Grid3X3, Truck, Eye, EyeOff, MapPin,
  Activity, Target, Route, Timer, TrendingUp,
  Cpu, BarChart3, Settings2, Layers, X
} from 'lucide-react';
import { createGlobalStyle } from 'styled-components';

import {
  breadthFirstSearch,
  depthFirstSearch,
  aStarSearch,
  dijkstraSearch,
  greedyBestFirstSearch,
  bidirectionalSearch,
  bmsspSearch,
  AlgorithmResult,
  AlgorithmConfig
} from './algorithms';

import {
  AlgorithmClass, RacingTeam, Racer, RaceStatus, RaceMode,
  RaceCommentary, EnvironmentMode, RaceTrack
} from './mazeTypes';

import { RACING_TEAMS } from './agent';

// ============================================================================
// DESIGN SYSTEM - Clean Professional Theme
// ============================================================================

const theme = {
  colors: {
    bg: {
      primary: '#0f1419',
      secondary: '#1a1f26',
      tertiary: '#242a33',
      elevated: '#2d343f',
    },
    
    accent: {
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#06b6d4',
    },
    
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverse: '#0f1419',
    },
    
    border: {
      subtle: 'rgba(148, 163, 184, 0.1)',
      default: 'rgba(148, 163, 184, 0.2)',
      strong: 'rgba(148, 163, 184, 0.3)',
    },
    
    algorithms: {
      BFS: '#3b82f6',
      DFS: '#8b5cf6',
      AStar: '#22c55e',
      Dijkstra: '#eab308',
      Greedy: '#f97316',
      Bidirectional: '#06b6d4',
      BMSSP: '#ec4899',
    } as Record<AlgorithmClass, string>,
  },
  
  fonts: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  },
  
  radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px' },
};

// ============================================================================
// ALGORITHM METADATA
// ============================================================================

const ALGORITHM_INFO: Record<AlgorithmClass, {
  fullName: string;
  complexity: string;
  description: string;
  characteristics: string[];
}> = {
  BFS: {
    fullName: 'Breadth-First Search',
    complexity: 'O(V + E)',
    description: 'Explores all neighbors at current depth before moving deeper. Guarantees shortest unweighted path.',
    characteristics: ['Optimal', 'Complete', 'High Memory'],
  },
  DFS: {
    fullName: 'Depth-First Search',
    complexity: 'O(V + E)',
    description: 'Explores as far as possible along each branch before backtracking.',
    characteristics: ['Fast', 'Low Memory', 'Non-optimal'],
  },
  AStar: {
    fullName: 'A* Search',
    complexity: 'O(E log V)',
    description: 'Uses heuristics to guide search toward goal. Optimal with admissible heuristic.',
    characteristics: ['Optimal', 'Heuristic-guided', 'Balanced'],
  },
  Dijkstra: {
    fullName: "Dijkstra's Algorithm",
    complexity: 'O(E log V)',
    description: 'Finds shortest paths from source to all vertices in weighted graphs.',
    characteristics: ['Optimal', 'Weighted', 'Exhaustive'],
  },
  Greedy: {
    fullName: 'Greedy Best-First',
    complexity: 'O(n²)',
    description: 'Always expands the node closest to goal. Fast but not guaranteed optimal.',
    characteristics: ['Fast', 'Heuristic', 'Suboptimal'],
  },
  Bidirectional: {
    fullName: 'Bidirectional Search',
    complexity: 'O(b^(d/2))',
    description: 'Searches from both start and goal simultaneously until frontiers meet.',
    characteristics: ['Efficient', 'Dual-front', 'Complex'],
  },
  BMSSP: {
    fullName: 'Jump Point Search',
    complexity: 'O(E log V)',
    description: 'Optimized A* that jumps over intermediate nodes by identifying key turning points.',
    characteristics: ['Optimal', 'Fast', 'Grid-optimized'],
  },
};

// ============================================================================
// DELIVERY TYPES & GENERATION
// ============================================================================

interface DeliveryStop {
  id: number;
  x: number;
  y: number;
  isDepot?: boolean;
}

interface DeliveryRoute {
  stops: DeliveryStop[];
  depot: DeliveryStop;
  width: number;
  height: number;
}

interface DeliveryAgent {
  team: RacingTeam;
  route: number[];
  totalDistance: number;
  currentStopIndex: number;
  position: { x: number; y: number };
  visitedStops: Set<number>;
  finished: boolean;
  finishTime: number;
  progress: number;
}

// ==================== OVERLAY STYLES ====================
const MzOverlayStyles = createGlobalStyle`
  .mz-root {
    position: relative;
    width: 100%;
    min-height: 420px;
    background: #0a0e1a;
    border-radius: 12px;
    overflow: hidden;
    user-select: none;
  }
  .mz-canvas {
    position: absolute; inset: 0; width: 100%; height: 100%;
    cursor: default; touch-action: none; display: block;
  }

  .mz-chips { position: absolute; top: 0.75rem; left: 0.75rem; z-index: 50;
    display: flex; flex-wrap: wrap; gap: 0.3rem; max-width: calc(100% - 5rem); }
  .mz-chip { display: flex; align-items: center; gap: 0.3rem; padding: 0.28rem 0.6rem;
    border-radius: 999px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.62); color: rgba(255,255,255,0.65);
    font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
    backdrop-filter: blur(8px); font-family: inherit; white-space: nowrap; }
  .mz-chip:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .mz-chip.active { border-color: var(--chip-color, #3b82f6);
    background: color-mix(in srgb, var(--chip-color, #3b82f6) 20%, rgba(0,0,0,0.6)); color: #fff; }

  .mz-top-right { position: absolute; top: 0.75rem; right: 0.75rem; z-index: 50; display: flex; gap: 0.3rem; }
  .mz-icon-btn { width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.62);
    color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center;
    cursor: pointer; backdrop-filter: blur(8px); transition: all 0.15s; }
  .mz-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .mz-icon-btn.active { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.5); color: #3b82f6; }

  .mz-hud { position: absolute; top: 3rem; right: 0.75rem; z-index: 40;
    min-width: 145px; background: rgba(5,8,18,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
    padding: 0.6rem 0.75rem; font-size: 0.73rem; color: rgba(255,255,255,0.55); }
  .mz-hud-title { font-weight: 700; font-size: 0.78rem; color: #e2e8f0;
    margin-bottom: 0.45rem; display: flex; align-items: center; gap: 0.3rem; }
  .mz-hud-row { display: flex; justify-content: space-between; align-items: center;
    padding: 0.13rem 0; gap: 0.6rem; }
  .mz-hud-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.3rem 0; }

  .mz-bar { position: absolute; bottom: 0.75rem; left: 50%; transform: translateX(-50%);
    z-index: 50; display: flex; align-items: center; gap: 0.25rem;
    background: rgba(4,7,16,0.84); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 999px;
    padding: 0.35rem 0.55rem; white-space: nowrap; }
  .mz-bar-btn { display: flex; align-items: center; gap: 0.28rem;
    padding: 0.28rem 0.6rem; border-radius: 999px; border: 1px solid transparent;
    background: transparent; color: rgba(255,255,255,0.55); font-size: 0.72rem;
    font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
  .mz-bar-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .mz-bar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .mz-bar-btn.primary { background: #3b82f6; color: #fff; border-color: rgba(59,130,246,0.4); }
  .mz-bar-btn.primary:hover { background: #2563eb; }
  .mz-bar-btn.danger { background: rgba(239,68,68,0.18); color: #f87171; border-color: rgba(239,68,68,0.25); }
  .mz-bar-btn.active { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.35); color: #a5b4fc; }
  .mz-bar-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 0.1rem; flex-shrink: 0; }
  .mz-speed-ctrl { display: flex; align-items: center; gap: 0.3rem; }
  .mz-slider { width: 56px; height: 4px; cursor: pointer; accent-color: #3b82f6; }
  .mz-speed-label { color: rgba(255,255,255,0.45); font-size: 0.68rem; font-family: monospace; min-width: 1.6rem; text-align: right; }

  .mz-panel { position: absolute; bottom: 3.5rem; left: 0.75rem; z-index: 60;
    width: clamp(220px, 32vw, 380px); background: rgba(6,10,22,0.93);
    backdrop-filter: blur(20px); border: 1px solid rgba(59,130,246,0.18);
    border-radius: 12px; overflow: hidden; }
  .mz-panel-header { display: flex; align-items: center; gap: 0.45rem;
    padding: 0.65rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    font-weight: 700; font-size: 0.82rem; color: #e2e8f0; }
  .mz-panel-close { margin-left: auto; background: transparent; border: none;
    color: rgba(255,255,255,0.35); cursor: pointer; padding: 0.2rem; border-radius: 4px;
    display: flex; align-items: center; transition: all 0.15s; }
  .mz-panel-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .mz-panel-body { padding: 0.6rem 0.85rem; max-height: 48vh; overflow-y: auto; overflow-x: hidden; }
  .mz-panel-body::-webkit-scrollbar { width: 3px; }
  .mz-panel-body::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.4); border-radius: 2px; }

  .mz-panel-label { font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 0.2rem; display: flex; justify-content: space-between; }
  .mz-panel-label span:last-child { color: rgba(255,255,255,0.8); font-family: monospace; }
  .mz-panel-range { width: 100%; accent-color: #3b82f6; cursor: pointer; margin-bottom: 0.75rem; }
  .mz-panel-mode-row { display: flex; gap: 0.4rem; margin-bottom: 0.75rem; }
  .mz-panel-mode-btn { flex: 1; padding: 0.3rem 0.5rem; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.5); font-size: 0.7rem; font-weight: 600; cursor: pointer;
    transition: all 0.15s; font-family: inherit; }
  .mz-panel-mode-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .mz-panel-mode-btn.active { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.5); color: #93c5fd; }
`;

const CELL_SIZE = 16;
const DEFAULT_MAZE_SIZE = 41;
const DEFAULT_STOP_COUNT = 25;
const DELIVERY_WIDTH = 800;
const DELIVERY_HEIGHT = 500;

function generateDeliveryRoute(stopCount: number): DeliveryRoute {
  const padding = 50;
  const stops: DeliveryStop[] = [];
  const minDist = 35;
  
  const depot: DeliveryStop = { id: 0, x: padding + 40, y: DELIVERY_HEIGHT / 2, isDepot: true };
  stops.push(depot);
  
  for (let i = 1; i <= stopCount; i++) {
    let x: number, y: number, attempts = 0;
    do {
      x = padding + Math.random() * (DELIVERY_WIDTH - 2 * padding);
      y = padding + Math.random() * (DELIVERY_HEIGHT - 2 * padding);
      attempts++;
    } while (attempts < 100 && stops.some(s => Math.hypot(s.x - x, s.y - y) < minDist));
    stops.push({ id: i, x, y });
  }
  
  return { stops, depot, width: DELIVERY_WIDTH, height: DELIVERY_HEIGHT };
}

function distance(a: DeliveryStop, b: DeliveryStop): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function calculateTotalDistance(stops: DeliveryStop[], route: number[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const from = stops.find(s => s.id === route[i])!;
    const to = stops.find(s => s.id === route[i + 1])!;
    total += distance(from, to);
  }
  return total;
}

// ============================================================================
// ROUTING ALGORITHMS
// ============================================================================

function calculateDeliveryRoute(algorithmId: AlgorithmClass, deliveryRoute: DeliveryRoute): number[] {
  const { stops, depot } = deliveryRoute;
  const deliveryStops = stops.filter(s => !s.isDepot);
  
  switch (algorithmId) {
    case 'Greedy': return greedyNearestNeighbor(depot, deliveryStops);
    case 'AStar': return aStarTSP(depot, deliveryStops);
    case 'DFS': return dfsRouting(depot, deliveryStops);
    case 'BFS': return bfsConcentricRouting(depot, deliveryStops);
    case 'Dijkstra': return dijkstraRouting(depot, deliveryStops);
    case 'Bidirectional': return bidirectionalRouting(depot, deliveryStops);
    case 'BMSSP': return clusterRouting(depot, deliveryStops);
    default: return greedyNearestNeighbor(depot, deliveryStops);
  }
}

function greedyNearestNeighbor(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  const route = [depot.id];
  const remaining = new Set(stops.map(s => s.id));
  let current = depot;
  
  while (remaining.size > 0) {
    let nearest: DeliveryStop | null = null, nearestDist = Infinity;
    for (const id of remaining) {
      const stop = stops.find(s => s.id === id)!;
      const d = distance(current, stop);
      if (d < nearestDist) { nearestDist = d; nearest = stop; }
    }
    if (nearest) { route.push(nearest.id); remaining.delete(nearest.id); current = nearest; }
  }
  route.push(depot.id);
  return route;
}

function aStarTSP(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  const route = [depot.id];
  const remaining = [...stops];
  let current = depot;
  
  while (remaining.length > 0) {
    const centroidX = remaining.reduce((sum, s) => sum + s.x, 0) / remaining.length;
    const centroidY = remaining.reduce((sum, s) => sum + s.y, 0) / remaining.length;
    let best: DeliveryStop | null = null, bestScore = Infinity;
    
    for (const stop of remaining) {
      const distToStop = distance(current, stop);
      const distFromStopToCentroid = Math.hypot(stop.x - centroidX, stop.y - centroidY);
      const distToDepot = distance(stop, depot);
      const score = distToStop * 1.0 + distFromStopToCentroid * 0.3 + (remaining.length === 1 ? distToDepot * 0.5 : 0);
      if (score < bestScore) { bestScore = score; best = stop; }
    }
    if (best) { route.push(best.id); remaining.splice(remaining.indexOf(best), 1); current = best; }
  }
  route.push(depot.id);
  return route;
}

function dfsRouting(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  const route = [depot.id];
  const sorted = [...stops].sort((a, b) => {
    const angleA = Math.atan2(a.y - depot.y, a.x - depot.x);
    const angleB = Math.atan2(b.y - depot.y, b.x - depot.x);
    return angleA - angleB;
  });
  for (const stop of sorted) route.push(stop.id);
  route.push(depot.id);
  return route;
}

function bfsConcentricRouting(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  const route = [depot.id];
  const sorted = [...stops].sort((a, b) => distance(depot, a) - distance(depot, b));
  for (const stop of sorted) route.push(stop.id);
  route.push(depot.id);
  return route;
}

function dijkstraRouting(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  const route = [depot.id];
  const remaining = [...stops];
  let current = depot, totalDist = 0;
  
  while (remaining.length > 0) {
    let best: DeliveryStop | null = null, bestScore = Infinity;
    for (const stop of remaining) {
      const distToStop = distance(current, stop);
      const cumulativeDist = totalDist + distToStop;
      const depotPenalty = distance(stop, depot) * (remaining.length / stops.length) * 0.2;
      const score = cumulativeDist + depotPenalty;
      if (score < bestScore) { bestScore = score; best = stop; }
    }
    if (best) {
      totalDist += distance(current, best);
      route.push(best.id);
      remaining.splice(remaining.indexOf(best), 1);
      current = best;
    }
  }
  route.push(depot.id);
  return route;
}

function bidirectionalRouting(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  if (stops.length === 0) return [depot.id, depot.id];
  
  const furthest = stops.reduce((far, s) => distance(depot, s) > distance(depot, far) ? s : far);
  const remaining = new Set(stops.map(s => s.id));
  remaining.delete(furthest.id);
  
  const frontRoute: number[] = [depot.id];
  const backRoute: number[] = [furthest.id];
  let frontCurrent = depot, backCurrent = furthest, frontTurn = true;
  
  while (remaining.size > 0) {
    const current = frontTurn ? frontCurrent : backCurrent;
    let nearest: DeliveryStop | null = null, nearestDist = Infinity;
    for (const id of remaining) {
      const stop = stops.find(s => s.id === id)!;
      const d = distance(current, stop);
      if (d < nearestDist) { nearestDist = d; nearest = stop; }
    }
    if (nearest) {
      if (frontTurn) { frontRoute.push(nearest.id); frontCurrent = nearest; }
      else { backRoute.unshift(nearest.id); backCurrent = nearest; }
      remaining.delete(nearest.id);
    }
    frontTurn = !frontTurn;
  }
  return [...frontRoute, ...backRoute, depot.id];
}

function clusterRouting(depot: DeliveryStop, stops: DeliveryStop[]): number[] {
  if (stops.length === 0) return [depot.id, depot.id];
  
  const quadrants: DeliveryStop[][] = [[], [], [], []];
  for (const stop of stops) {
    const isRight = stop.x > depot.x;
    const isBelow = stop.y > depot.y;
    quadrants[(isRight ? 1 : 0) + (isBelow ? 2 : 0)].push(stop);
  }
  
  const route: number[] = [depot.id];
  for (const quadrant of quadrants) {
    if (quadrant.length === 0) continue;
    const lastId = route[route.length - 1];
    const lastStop = stops.find(s => s.id === lastId) || depot;
    const sorted = [...quadrant].sort((a, b) => distance(lastStop, a) - distance(lastStop, b));
    for (const stop of sorted) route.push(stop.id);
  }
  route.push(depot.id);
  return route;
}

// ============================================================================
// COMPONENTS
// ============================================================================

const Button: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ onClick, disabled, variant = 'primary', children, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 18px',
      background: variant === 'primary' ? theme.colors.accent.primary : theme.colors.bg.tertiary,
      border: `1px solid ${variant === 'primary' ? theme.colors.accent.primary : theme.colors.border.default}`,
      borderRadius: theme.radius.md,
      color: variant === 'primary' ? '#fff' : theme.colors.text.secondary,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      fontFamily: theme.fonts.sans,
      transition: 'all 0.15s ease',
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ReactNode;
}> = ({ label, checked, onChange, icon }) => (
  <button
    onClick={onChange}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: checked ? theme.colors.accent.primary + '20' : theme.colors.bg.tertiary,
      border: `1px solid ${checked ? theme.colors.accent.primary + '50' : theme.colors.border.subtle}`,
      borderRadius: theme.radius.sm,
      color: checked ? theme.colors.accent.primary : theme.colors.text.muted,
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 500,
      transition: 'all 0.15s ease',
    }}
  >
    {icon || (checked ? <Eye size={14} /> : <EyeOff size={14} />)}
    {label}
  </button>
);

const StatusBadge: React.FC<{ status: RaceStatus }> = ({ status }) => {
  const config: Record<string, { color: string; label: string }> = {
    preparing: { color: theme.colors.text.muted, label: 'Ready' },
    starting: { color: theme.colors.accent.success, label: 'Running' },
    finished: { color: theme.colors.accent.primary, label: 'Complete' },
    paused: { color: theme.colors.accent.warning, label: 'Paused' },
  };
  
  const { color, label } = config[status] || config.preparing;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: color + '15',
      border: `1px solid ${color}30`,
      borderRadius: theme.radius.lg,
      fontSize: '12px',
      fontWeight: 600,
      color,
      fontFamily: theme.fonts.mono,
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
      }} />
      {label}
    </div>
  );
};

const AlgorithmCard: React.FC<{
  team: RacingTeam;
  selected: boolean;
  onToggle: () => void;
}> = ({ team, selected, onToggle }) => {
  const color = theme.colors.algorithms[team.id];
  const info = ALGORITHM_INFO[team.id];
  
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        background: selected ? color + '12' : theme.colors.bg.tertiary,
        border: `1px solid ${selected ? color + '40' : theme.colors.border.subtle}`,
        borderRadius: theme.radius.md,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: theme.radius.sm,
        background: selected ? color : color + '30',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        color: selected ? '#fff' : color,
        fontFamily: theme.fonts.mono,
      }}>
        {team.number}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: selected ? theme.colors.text.primary : theme.colors.text.secondary,
        }}>
          {team.name}
        </div>
        <div style={{
          fontSize: '11px',
          color: theme.colors.text.muted,
          fontFamily: theme.fonts.mono,
        }}>
          {info.complexity}
        </div>
      </div>
      
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        border: `2px solid ${selected ? color : theme.colors.border.default}`,
        background: selected ? color : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#fff',
      }}>
        {selected && '✓'}
      </div>
    </div>
  );
};

const ResultRow: React.FC<{
  position: number;
  team: RacingTeam;
  metric: number;
  unit: string;
  finished: boolean;
  expanded: boolean;
  onToggle: () => void;
  isMaze: boolean;
  explored?: number;
}> = ({ position, team, metric, unit, finished, expanded, onToggle, isMaze, explored }) => {
  const color = theme.colors.algorithms[team.id];
  const info = ALGORITHM_INFO[team.id];
  
  return (
    <div style={{
      marginBottom: '6px',
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      background: theme.colors.bg.tertiary,
      border: `1px solid ${theme.colors.border.subtle}`,
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: theme.radius.sm,
          background: position === 1 && finished ? theme.colors.accent.success + '20' : theme.colors.bg.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 600,
          color: position === 1 && finished ? theme.colors.accent.success : theme.colors.text.muted,
          fontFamily: theme.fonts.mono,
        }}>
          {position}
        </div>
        
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 700,
          color: '#fff',
        }}>
          {team.number}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            color: theme.colors.text.primary,
          }}>
            {team.name}
          </div>
        </div>
        
        <div style={{
          fontSize: '13px',
          fontFamily: theme.fonts.mono,
          color: finished ? theme.colors.text.primary : theme.colors.text.muted,
          fontWeight: 600,
        }}>
          {finished ? `${metric.toLocaleString()} ${unit}` : '...'}
        </div>
        
        <ChevronDown 
          size={14} 
          style={{
            color: theme.colors.text.muted,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
      </div>
      
      {expanded && (
        <div style={{
          padding: '0 14px 14px',
          borderTop: `1px solid ${theme.colors.border.subtle}`,
        }}>
          <p style={{
            margin: '12px 0 0',
            fontSize: '12px',
            color: theme.colors.text.secondary,
            lineHeight: 1.5,
          }}>
            {info.description}
          </p>
          
          {explored !== undefined && (
            <div style={{
              marginTop: '10px',
              fontSize: '11px',
              color: theme.colors.text.muted,
              fontFamily: theme.fonts.mono,
            }}>
              Cells explored: {explored.toLocaleString()}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {info.characteristics.map((c, i) => (
              <span key={i} style={{
                padding: '3px 8px',
                background: color + '15',
                borderRadius: theme.radius.sm,
                fontSize: '10px',
                fontWeight: 500,
                color,
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PathfindingVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>('maze');
  const [track, setTrack] = useState<RaceTrack | null>(null);
  const [deliveryRoute, setDeliveryRoute] = useState<DeliveryRoute | null>(null);
  const [agents, setAgents] = useState<Racer[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [status, setStatus] = useState<RaceStatus>('preparing');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<AlgorithmClass[]>(['BFS', 'AStar', 'Greedy']);
  const [raceMode, setRaceMode] = useState<RaceMode>('waypoints');
  const [waypointCount, setWaypointCount] = useState(7);
  const [mazeSize, setMazeSize] = useState(DEFAULT_MAZE_SIZE);
  const [stopCount, setStopCount] = useState(DEFAULT_STOP_COUNT);
  const [animationSpeed, setAnimationSpeed] = useState(1.5);
  
  const [showExploration, setShowExploration] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'none' | 'settings' | 'algos' | 'results'>('none');

  const statusRef = useRef(status);
  const speedRef = useRef(animationSpeed);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { speedRef.current = animationSpeed; }, [animationSpeed]);
  
  const calculateWaypointOrder = useCallback((
    start: [number, number], waypoints: [number, number][], algorithmId: AlgorithmClass, finish: [number, number]
  ): number[] => {
    const order: number[] = [];
    const remaining = new Set(waypoints.map((_, i) => i));
    let current = start;
    
    if (algorithmId === 'Greedy' || algorithmId === 'DFS') {
      while (remaining.size > 0) {
        let nearest = -1, nearestDist = Infinity;
        for (const i of remaining) {
          const dist = Math.abs(waypoints[i][0] - current[0]) + Math.abs(waypoints[i][1] - current[1]);
          if (dist < nearestDist) { nearestDist = dist; nearest = i; }
        }
        if (nearest !== -1) { order.push(nearest); remaining.delete(nearest); current = waypoints[nearest]; }
        else break;
      }
    } else {
      while (remaining.size > 0) {
        let best = -1, bestScore = Infinity;
        for (const i of remaining) {
          const d1 = Math.abs(waypoints[i][0] - current[0]) + Math.abs(waypoints[i][1] - current[1]);
          const d2 = Math.abs(waypoints[i][0] - finish[0]) + Math.abs(waypoints[i][1] - finish[1]);
          const score = d1 + d2 * 0.3;
          if (score < bestScore) { bestScore = score; best = i; }
        }
        if (best !== -1) { order.push(best); remaining.delete(best); current = waypoints[best]; }
        else break;
      }
    }
    return order;
  }, []);
  
  const runAlgorithm = useCallback((
    algorithmId: AlgorithmClass, maze: number[][], start: [number, number], goal: [number, number], config: AlgorithmConfig
  ): AlgorithmResult => {
    switch (algorithmId) {
      case 'BFS': return breadthFirstSearch(maze, start, goal, config);
      case 'DFS': return depthFirstSearch(maze, start, goal, config);
      case 'AStar': return aStarSearch(maze, start, goal, config);
      case 'Dijkstra': return dijkstraSearch(maze, start, goal, config);
      case 'Greedy': return greedyBestFirstSearch(maze, start, goal, config);
      case 'Bidirectional': return bidirectionalSearch(maze, start, goal, config);
      case 'BMSSP': return bmsspSearch(maze, start, goal, config);
      default: return breadthFirstSearch(maze, start, goal, config);
    }
  }, []);
  
  const initializeSimulation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    if (environmentMode === 'maze') {
      const wpCount = raceMode === 'waypoints' ? waypointCount : 0;
      const newTrack = new RaceTrack(mazeSize, mazeSize, wpCount);
      setTrack(newTrack);
      setDeliveryRoute(null);
      
      const maze = newTrack.to2DArray();
      const config: AlgorithmConfig = { maxSteps: 100000, allowDiagonal: false, timeLimit: 5000 };
      const newAgents: Racer[] = [];
      
      for (const algorithmId of selectedAlgorithms) {
        const team = RACING_TEAMS[algorithmId];
        let fullPath: [number, number][] = [];
        let totalExplored = new Set<string>();
        
        if (raceMode === 'waypoints' && newTrack.waypoints.length > 0) {
          const wpOrder = calculateWaypointOrder(newTrack.start, newTrack.waypoints, algorithmId, newTrack.finish);
          let currentPos = newTrack.start;
          for (const wpIdx of wpOrder) {
            const wpPos = newTrack.waypoints[wpIdx];
            const result = runAlgorithm(algorithmId, maze, currentPos, wpPos, config);
            if (result.success && result.path.length > 0) {
              fullPath = fullPath.concat(result.path.slice(fullPath.length > 0 ? 1 : 0));
              result.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
              currentPos = wpPos;
            }
          }
          const finalResult = runAlgorithm(algorithmId, maze, currentPos, newTrack.finish, config);
          if (finalResult.success && finalResult.path.length > 0) {
            fullPath = fullPath.concat(finalResult.path.slice(1));
            finalResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
          }
        } else {
          const result = runAlgorithm(algorithmId, maze, newTrack.start, newTrack.finish, config);
          fullPath = result.path;
          result.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
        }
        
        newAgents.push({
          team, position: { x: newTrack.start[0], y: newTrack.start[1] }, velocity: { x: 0, y: 0 },
          heading: 0, path: fullPath, explored: totalExplored, currentTarget: 0, lapTime: 0, bestLap: Infinity,
          totalDistance: 0, currentSpeed: 0, tire: 100, fuel: 100, finished: false, finishTime: 0, trail: [],
          telemetry: { speed: [], exploration: [], efficiency: fullPath.length > 0 ? (fullPath.length / totalExplored.size) * 100 : 0 },
          collectedWaypoints: new Set(), targetWaypoint: null, waypointPath: []
        });
      }
      setAgents(newAgents);
      setDeliveryAgents([]);
    } else {
      const newRoute = generateDeliveryRoute(stopCount);
      setDeliveryRoute(newRoute);
      setTrack(null);
      
      const newDeliveryAgents: DeliveryAgent[] = selectedAlgorithms.map(algorithmId => {
        const team = RACING_TEAMS[algorithmId];
        const route = calculateDeliveryRoute(algorithmId, newRoute);
        const totalDist = calculateTotalDistance(newRoute.stops, route);
        return {
          team, route, totalDistance: totalDist, currentStopIndex: 0,
          position: { x: newRoute.depot.x, y: newRoute.depot.y },
          visitedStops: new Set([0]), finished: false, finishTime: 0, progress: 0
        };
      });
      setDeliveryAgents(newDeliveryAgents);
      setAgents([]);
    }
    
    setStatus('preparing');
    setExpandedResult(null);
    setElapsedTime(0);
  }, [environmentMode, raceMode, waypointCount, mazeSize, stopCount, selectedAlgorithms, calculateWaypointOrder, runAlgorithm]);
  
  useEffect(() => { initializeSimulation(); }, [environmentMode, raceMode, waypointCount, mazeSize, stopCount, selectedAlgorithms]);
  
  const startAnalysis = () => {
    setStatus('starting');
    startTimeRef.current = Date.now();
  };
  
  // Animation loop
  useEffect(() => {
    if (status !== 'starting') return;
    
    const animate = () => {
      if (statusRef.current !== 'starting') return;
      
      setElapsedTime(Date.now() - startTimeRef.current);
      
      if (environmentMode === 'maze') {
        setAgents(prev => {
          const updated = prev.map(agent => {
            if (agent.finished || !agent.path || agent.path.length === 0) {
              return agent.finished ? agent : { ...agent, finished: true, finishTime: Infinity };
            }
            
            const speed = 0.2 * speedRef.current;
            const nextTarget = Math.min(agent.currentTarget + speed, agent.path.length - 1);
            
            if (nextTarget >= agent.path.length - 1) {
              return {
                ...agent, finished: true, finishTime: Date.now(),
                position: { x: agent.path[agent.path.length - 1][0], y: agent.path[agent.path.length - 1][1] },
                currentTarget: agent.path.length - 1
              };
            }
            
            const ti = Math.floor(nextTarget), t = nextTarget - ti;
            const cur = agent.path[ti], nxt = agent.path[Math.min(ti + 1, agent.path.length - 1)];
            const newX = cur[0] + (nxt[0] - cur[0]) * t;
            const newY = cur[1] + (nxt[1] - cur[1]) * t;
            
            return { ...agent, position: { x: newX, y: newY }, currentTarget: nextTarget };
          });
          
          if (updated.every(a => a.finished)) setStatus('finished');
          return updated;
        });
      } else {
        setDeliveryAgents(prev => {
          const updated = prev.map(agent => {
            if (agent.finished) return agent;
            if (agent.currentStopIndex >= agent.route.length - 1) {
              return { ...agent, finished: true, finishTime: Date.now() };
            }
            
            const speed = 4 * speedRef.current;
            let newProgress = agent.progress + speed / 100;
            const curId = agent.route[agent.currentStopIndex], nxtId = agent.route[agent.currentStopIndex + 1];
            const curStop = deliveryRoute?.stops.find(s => s.id === curId);
            const nxtStop = deliveryRoute?.stops.find(s => s.id === nxtId);
            if (!curStop || !nxtStop) return { ...agent, finished: true, finishTime: Infinity };
            
            let newIdx = agent.currentStopIndex, newVisited = agent.visitedStops;
            if (newProgress >= 1) { 
              newProgress = 0; 
              newIdx++; 
              newVisited = new Set(agent.visitedStops); 
              newVisited.add(nxtId);
            }
            
            const fromStop = newIdx === agent.currentStopIndex ? curStop : nxtStop;
            const toStop = deliveryRoute?.stops.find(s => s.id === agent.route[newIdx + 1]) || fromStop;
            const newX = fromStop.x + (toStop.x - fromStop.x) * newProgress;
            const newY = fromStop.y + (toStop.y - fromStop.y) * newProgress;
            
            return { ...agent, currentStopIndex: newIdx, progress: newProgress, position: { x: newX, y: newY }, visitedStops: newVisited };
          });
          
          if (updated.every(a => a.finished)) setStatus('finished');
          return updated;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [status, environmentMode, deliveryRoute]);
  
  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (environmentMode === 'maze' && track) renderMaze(ctx, track);
    else if (environmentMode === 'network' && deliveryRoute) renderDelivery(ctx, deliveryRoute);
  });
  
  const renderMaze = (ctx: CanvasRenderingContext2D, track: RaceTrack) => {
    const w = track.width * CELL_SIZE, h = track.height * CELL_SIZE;
    
    ctx.fillStyle = theme.colors.bg.primary;
    ctx.fillRect(0, 0, w, h);
    
    // Draw grid
    for (let y = 0; y < track.height; y++) {
      for (let x = 0; x < track.width; x++) {
        const isWall = track.getCell(x, y) === 1;
        ctx.fillStyle = isWall ? theme.colors.bg.elevated : theme.colors.bg.secondary;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
    
    // Draw exploration (only when running or finished)
    if (showExploration && status !== 'preparing') {
      agents.forEach(a => {
        ctx.fillStyle = a.team.color + '25';
        a.explored.forEach(key => {
          const [x, y] = key.split(',').map(Number);
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        });
      });
    }
    
    // Draw paths (only when running or finished)
    if (showPaths && status !== 'preparing') {
      agents.forEach(a => {
        if (!a.path || a.path.length < 2) return;
        
        // Only draw up to current position
        const pathEnd = Math.min(Math.ceil(a.currentTarget) + 1, a.path.length);
        if (pathEnd < 2) return;
        
        ctx.strokeStyle = a.team.color + '80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.path[0][0] * CELL_SIZE + CELL_SIZE / 2, a.path[0][1] * CELL_SIZE + CELL_SIZE / 2);
        for (let i = 1; i < pathEnd; i++) {
          ctx.lineTo(a.path[i][0] * CELL_SIZE + CELL_SIZE / 2, a.path[i][1] * CELL_SIZE + CELL_SIZE / 2);
        }
        ctx.stroke();
      });
    }
    
    // Draw waypoints
    if (raceMode === 'waypoints') {
      track.waypoints.forEach((wp, idx) => {
        const x = wp[0] * CELL_SIZE + CELL_SIZE / 2;
        const y = wp[1] * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.fillStyle = theme.colors.accent.warning;
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        if (showLabels) {
          ctx.fillStyle = theme.colors.text.inverse;
          ctx.font = `bold 9px ${theme.fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((idx + 1).toString(), x, y);
        }
      });
    }
    
    // Draw start/finish
    ctx.fillStyle = theme.colors.accent.success;
    ctx.fillRect(track.start[0] * CELL_SIZE + 2, track.start[1] * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    
    ctx.fillStyle = theme.colors.accent.error;
    ctx.fillRect(track.finish[0] * CELL_SIZE + 2, track.finish[1] * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    
    // Draw agents (only when running or finished)
    if (status !== 'preparing') {
      agents.forEach(a => {
        const x = a.position.x * CELL_SIZE + CELL_SIZE / 2;
        const y = a.position.y * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.fillStyle = a.team.color;
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = `bold 8px ${theme.fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.team.number.toString(), x, y);
      });
    }
  };
  
  const renderDelivery = (ctx: CanvasRenderingContext2D, route: DeliveryRoute) => {
    ctx.fillStyle = theme.colors.bg.primary;
    ctx.fillRect(0, 0, route.width, route.height);
    
    // Grid
    ctx.strokeStyle = theme.colors.border.subtle;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < route.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, route.height);
      ctx.stroke();
    }
    for (let y = 0; y < route.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(route.width, y);
      ctx.stroke();
    }
    
    // Draw planned routes (only when running or finished)
    if (showExploration && status !== 'preparing') {
      deliveryAgents.forEach(a => {
        ctx.strokeStyle = a.team.color + '30';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let i = 0; i < a.route.length; i++) {
          const stop = route.stops.find(s => s.id === a.route[i]);
          if (stop) {
            if (i === 0) ctx.moveTo(stop.x, stop.y);
            else ctx.lineTo(stop.x, stop.y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }
    
    // Draw completed paths (only when running or finished)
    if (showPaths && status !== 'preparing') {
      deliveryAgents.forEach(a => {
        if (a.currentStopIndex < 1) return;
        ctx.strokeStyle = a.team.color + '70';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= a.currentStopIndex; i++) {
          const stop = route.stops.find(s => s.id === a.route[i]);
          if (stop) {
            if (i === 0) ctx.moveTo(stop.x, stop.y);
            else ctx.lineTo(stop.x, stop.y);
          }
        }
        ctx.stroke();
      });
    }
    
    // Draw stops
    route.stops.forEach(stop => {
      const visited = status !== 'preparing' && deliveryAgents.some(a => a.visitedStops.has(stop.id));
      
      if (stop.isDepot) {
        ctx.fillStyle = theme.colors.accent.primary;
        ctx.beginPath();
        ctx.moveTo(stop.x, stop.y - 12);
        ctx.lineTo(stop.x + 12, stop.y + 6);
        ctx.lineTo(stop.x - 12, stop.y + 6);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = `bold 8px ${theme.fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('D', stop.x, stop.y);
      } else {
        ctx.fillStyle = visited ? theme.colors.accent.success : theme.colors.bg.tertiary;
        ctx.strokeStyle = visited ? theme.colors.accent.success : theme.colors.border.strong;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(stop.x, stop.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        if (showLabels) {
          ctx.fillStyle = visited ? '#fff' : theme.colors.text.secondary;
          ctx.font = `bold 8px ${theme.fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(stop.id.toString(), stop.x, stop.y);
        }
      }
    });
    
    // Draw vehicles (only when running or finished)
    if (status !== 'preparing') {
      deliveryAgents.forEach(a => {
        ctx.fillStyle = a.team.color;
        ctx.beginPath();
        ctx.arc(a.position.x, a.position.y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = `bold 9px ${theme.fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.team.number.toString(), a.position.x, a.position.y);
      });
    }
  };
  
  const canvasWidth = environmentMode === 'maze' ? mazeSize * CELL_SIZE : DELIVERY_WIDTH;
  const canvasHeight = environmentMode === 'maze' ? mazeSize * CELL_SIZE : DELIVERY_HEIGHT;
  
  const sortedResults = useMemo(() => {
    if (environmentMode === 'maze') {
      return [...agents].sort((a, b) => {
        if (a.finished !== b.finished) return a.finished ? -1 : 1;
        return (a.path?.length || Infinity) - (b.path?.length || Infinity);
      });
    }
    return [...deliveryAgents].sort((a, b) => {
      if (a.finished !== b.finished) return a.finished ? -1 : 1;
      return a.totalDistance - b.totalDistance;
    });
  }, [agents, deliveryAgents, environmentMode]);
  
  const stats = useMemo(() => {
    if (environmentMode === 'maze') {
      const lengths = agents.filter(a => a.path?.length > 0).map(a => a.path.length);
      return {
        best: lengths.length > 0 ? Math.min(...lengths) : 0,
        worst: lengths.length > 0 ? Math.max(...lengths) : 0,
      };
    }
    const distances = deliveryAgents.map(a => a.totalDistance);
    return {
      best: distances.length > 0 ? Math.round(Math.min(...distances)) : 0,
      worst: distances.length > 0 ? Math.round(Math.max(...distances)) : 0,
    };
  }, [agents, deliveryAgents, environmentMode]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (status === 'starting') setStatus('preparing');
        else startAnalysis();
      } else if (e.key === 'r' || e.key === 'R') {
        initializeSimulation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, initializeSimulation]);
  
  return (
    <>
      <MzOverlayStyles />

      <div className="mz-root" style={{ height: canvasHeight + 80 }}>
        <canvas ref={canvasRef} className="mz-canvas" width={canvasWidth} height={canvasHeight} />

        {/* Top-left: environment chips */}
        <div className="mz-chips">
          {(['maze', 'network'] as EnvironmentMode[]).map(mode => (
            <button key={mode} className={`mz-chip${environmentMode === mode ? ' active' : ''}`}
              style={environmentMode === mode ? { '--chip-color': '#3b82f6' } as React.CSSProperties : {}}
              onClick={() => setEnvironmentMode(mode)}>
              {mode === 'maze' ? <Grid3X3 size={12} /> : <Truck size={12} />}
              {mode === 'maze' ? 'Maze' : 'Delivery'}
            </button>
          ))}
        </div>

        {/* Top-right: toggle buttons */}
        <div className="mz-top-right">
          <button className={`mz-icon-btn${showExploration ? ' active' : ''}`} onClick={() => setShowExploration(!showExploration)} title="Exploration">
            <Eye size={14} />
          </button>
          <button className={`mz-icon-btn${showPaths ? ' active' : ''}`} onClick={() => setShowPaths(!showPaths)} title="Paths">
            <Route size={14} />
          </button>
          <button className={`mz-icon-btn${showLabels ? ' active' : ''}`} onClick={() => setShowLabels(!showLabels)} title="Labels">
            <Layers size={14} />
          </button>
        </div>

        {/* Stats HUD */}
        {stats.best > 0 && (
          <div className="mz-hud">
            <div className="mz-hud-title"><TrendingUp size={13} /> Results</div>
            <div className="mz-hud-divider" />
            <div className="mz-hud-row"><span>Best</span><span style={{ color: '#22c55e', fontWeight: 700 }}>{stats.best.toLocaleString()}</span></div>
            <div className="mz-hud-row"><span>Worst</span><span style={{ color: '#ef4444', fontWeight: 700 }}>{stats.worst.toLocaleString()}</span></div>
            <div className="mz-hud-row"><span>Δ</span><span style={{ color: '#fbbf24', fontWeight: 700 }}>{Math.round((stats.worst / stats.best - 1) * 100)}%</span></div>
          </div>
        )}

        {/* Bottom pill bar */}
        <div className="mz-bar">
          <button
            className={`mz-bar-btn${status === 'starting' ? ' danger' : ' primary'}`}
            onClick={() => status === 'starting' ? setStatus('preparing') : startAnalysis()}
            disabled={selectedAlgorithms.length === 0}
          >
            {status === 'starting' ? <><Pause size={13} />Pause</> : <><Play size={13} />{status === 'finished' ? 'Restart' : 'Start'}</>}
          </button>

          <button className="mz-bar-btn" onClick={initializeSimulation}>
            <RotateCcw size={13} />Reset
          </button>

          <div className="mz-bar-divider" />

          <div className="mz-speed-ctrl">
            <span className="mz-speed-label">{animationSpeed}×</span>
            <input type="range" className="mz-slider" min={0.5} max={5} step={0.5}
              value={animationSpeed} onChange={e => setAnimationSpeed(Number(e.target.value))} />
          </div>

          <div className="mz-bar-divider" />

          <button className={`mz-bar-btn${activePanel === 'settings' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'settings' ? 'none' : 'settings')}>
            <Settings2 size={13} />Setup
          </button>

          <button className={`mz-bar-btn${activePanel === 'algos' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'algos' ? 'none' : 'algos')}>
            <Cpu size={13} />Algos
          </button>

          <button className={`mz-bar-btn${activePanel === 'results' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'results' ? 'none' : 'results')}>
            <BarChart3 size={13} />Results
          </button>
        </div>

        {/* Settings panel */}
        {activePanel === 'settings' && (
          <div className="mz-panel">
            <div className="mz-panel-header">
              <Settings2 size={15} />Setup
              <button className="mz-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="mz-panel-body">
              <div className="mz-panel-label">
                <span>{environmentMode === 'maze' ? 'Grid Size' : 'Stops'}</span>
                <span>{environmentMode === 'maze' ? `${mazeSize}×${mazeSize}` : stopCount}</span>
              </div>
              <input
                type="range"
                className="mz-panel-range"
                min={environmentMode === 'maze' ? 21 : 10}
                max={environmentMode === 'maze' ? 61 : 100}
                step={environmentMode === 'maze' ? 10 : 5}
                value={environmentMode === 'maze' ? mazeSize : stopCount}
                onChange={(e) => environmentMode === 'maze'
                  ? setMazeSize(Number(e.target.value))
                  : setStopCount(Number(e.target.value))
                }
              />
              {environmentMode === 'maze' && (
                <>
                  <div className="mz-panel-label"><span>Race Mode</span></div>
                  <div className="mz-panel-mode-row">
                    {(['sprint', 'waypoints'] as RaceMode[]).map(mode => (
                      <button key={mode} className={`mz-panel-mode-btn${raceMode === mode ? ' active' : ''}`}
                        onClick={() => setRaceMode(mode)}>
                        {mode === 'sprint' ? 'Direct' : 'Waypoints'}
                      </button>
                    ))}
                  </div>
                  {raceMode === 'waypoints' && (
                    <>
                      <div className="mz-panel-label">
                        <span>Waypoints</span>
                        <span>{waypointCount}</span>
                      </div>
                      <input
                        type="range"
                        className="mz-panel-range"
                        min={1}
                        max={15}
                        value={waypointCount}
                        onChange={(e) => setWaypointCount(Number(e.target.value))}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Algorithms panel */}
        {activePanel === 'algos' && (
          <div className="mz-panel">
            <div className="mz-panel-header">
              <Cpu size={15} />Algorithms ({selectedAlgorithms.length})
              <button className="mz-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="mz-panel-body">
              {Object.values(RACING_TEAMS).map(team => (
                <div key={team.id} style={{ marginBottom: '6px' }}>
                  <AlgorithmCard
                    team={team}
                    selected={selectedAlgorithms.includes(team.id)}
                    onToggle={() => {
                      if (selectedAlgorithms.includes(team.id)) {
                        setSelectedAlgorithms(selectedAlgorithms.filter(t => t !== team.id));
                      } else {
                        setSelectedAlgorithms([...selectedAlgorithms, team.id]);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results panel */}
        {activePanel === 'results' && (
          <div className="mz-panel" style={{ left: 'auto', right: '0.75rem', bottom: '3.5rem' }}>
            <div className="mz-panel-header">
              <BarChart3 size={15} />Results
              <button className="mz-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="mz-panel-body">
              {sortedResults.map((r, pos) => {
                const isMaze = environmentMode === 'maze';
                const metric = isMaze
                  ? ('path' in r ? r.path?.length || 0 : 0)
                  : ('totalDistance' in r ? Math.round(r.totalDistance) : 0);
                const explored = isMaze && 'explored' in r ? r.explored.size : undefined;

                return (
                  <ResultRow
                    key={r.team.id}
                    position={pos + 1}
                    team={r.team}
                    metric={metric}
                    unit={isMaze ? 'steps' : 'dist'}
                    finished={r.finished}
                    expanded={expandedResult === r.team.id}
                    onToggle={() => setExpandedResult(expandedResult === r.team.id ? null : r.team.id)}
                    isMaze={isMaze}
                    explored={explored}
                  />
                );
              })}
              {sortedResults.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                  Select algorithms to compare
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}