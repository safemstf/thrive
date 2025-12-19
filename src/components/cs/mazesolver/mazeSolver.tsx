'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play, Pause, RotateCcw, ChevronDown, ChevronRight,
  Grid3X3, Truck, Eye, EyeOff, MapPin, Zap, Package
} from 'lucide-react';

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
// DESIGN TOKENS - GitHub Dark Theme
// ============================================================================

const tokens = {
  colors: {
    bg: {
      primary: '#0d1117',
      secondary: '#161b22',
      tertiary: '#21262d',
      canvas: '#010409',
    },
    border: {
      subtle: 'rgba(139, 148, 158, 0.1)',
      default: 'rgba(139, 148, 158, 0.2)',
      strong: 'rgba(139, 148, 158, 0.4)',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
      muted: '#6e7681',
    },
    accent: {
      blue: '#58a6ff',
      green: '#3fb950',
      yellow: '#d29922',
      red: '#f85149',
      purple: '#a371f7',
      orange: '#f0883e',
    },
    algorithms: {
      BFS: '#58a6ff',
      DFS: '#a371f7',
      AStar: '#3fb950',
      Dijkstra: '#d29922',
      Greedy: '#f85149',
      Bidirectional: '#79c0ff',
      BMSSP: '#f778ba',
    } as Record<AlgorithmClass, string>,
  },
  fonts: {
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  radius: { sm: '4px', md: '6px', lg: '8px' },
};

// ============================================================================
// DELIVERY TYPES
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

interface DeliveryRacer {
  team: RacingTeam;
  route: number[];
  totalDistance: number;
  currentStopIndex: number;
  position: { x: number; y: number };
  visitedStops: Set<number>;
  trail: { x: number; y: number; alpha: number }[];
  finished: boolean;
  finishTime: number;
  progress: number;
}

// ============================================================================
// ALGORITHM INFO
// ============================================================================

const ALGORITHM_INFO: Record<AlgorithmClass, { fullName: string; complexity: string; mazeDesc: string; deliveryDesc: string }> = {
  BFS: {
    fullName: 'Breadth-First Search',
    complexity: 'O(V + E)',
    mazeDesc: 'Explores all neighbors at current depth before moving deeper. Guarantees shortest path.',
    deliveryDesc: 'Visits stops in concentric rings outward from depot. Systematic but not distance-optimal.',
  },
  DFS: {
    fullName: 'Depth-First Search',
    complexity: 'O(V + E)',
    mazeDesc: 'Explores as far as possible along each branch before backtracking.',
    deliveryDesc: 'Commits to one angular direction, sweeps around. Can create long backtrack routes.',
  },
  AStar: {
    fullName: 'A* Search',
    complexity: 'O(E log V)',
    mazeDesc: 'Uses heuristics to guide search toward goal. Optimal with admissible heuristic.',
    deliveryDesc: 'Balances next-stop proximity with overall route efficiency. Smart adaptive routing.',
  },
  Dijkstra: {
    fullName: "Dijkstra's Algorithm",
    complexity: 'O(E log V)',
    mazeDesc: 'Finds shortest paths from source to all vertices.',
    deliveryDesc: 'Evaluates cumulative distance with depot-return penalty. Thorough but conservative.',
  },
  Greedy: {
    fullName: 'Greedy Nearest Neighbor',
    complexity: 'O(n²)',
    mazeDesc: 'Always expands node closest to goal. Fast but not guaranteed optimal.',
    deliveryDesc: 'Classic TSP heuristic: always go to closest unvisited. Fast but often 20-25% suboptimal.',
  },
  Bidirectional: {
    fullName: 'Bidirectional Planning',
    complexity: 'O(b^(d/2))',
    mazeDesc: 'Searches from both start and goal simultaneously.',
    deliveryDesc: 'Plans from depot AND furthest point inward. Good for elongated delivery areas.',
  },
  BMSSP: {
    fullName: 'Cluster-Based TSP',
    complexity: 'O(n² / k)',
    mazeDesc: 'Hierarchical decomposition with pivot-based computation.',
    deliveryDesc: 'Divides city into quadrants, optimizes each cluster, then connects. Scales well.',
  },
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const CELL_SIZE = 16;
const DEFAULT_MAZE_SIZE = 41;
const DEFAULT_STOP_COUNT = 25;
const DELIVERY_WIDTH = 800;
const DELIVERY_HEIGHT = 500;

// ============================================================================
// DELIVERY ROUTE GENERATION
// ============================================================================

function generateDeliveryRoute(stopCount: number): DeliveryRoute {
  const padding = 40;
  const stops: DeliveryStop[] = [];
  const minDist = 30;

  const depot: DeliveryStop = { id: 0, x: padding + 30, y: DELIVERY_HEIGHT / 2, isDepot: true };
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
// MAIN COMPONENT
// ============================================================================

export default function PathfindingVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>('maze');
  const [track, setTrack] = useState<RaceTrack | null>(null);
  const [deliveryRoute, setDeliveryRoute] = useState<DeliveryRoute | null>(null);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [deliveryRacers, setDeliveryRacers] = useState<DeliveryRacer[]>([]);
  const [raceStatus, setRaceStatus] = useState<RaceStatus>('preparing');

  const [selectedAlgorithms, setSelectedAlgorithms] = useState<AlgorithmClass[]>(['BFS', 'AStar', 'Greedy']);
  const [raceMode, setRaceMode] = useState<RaceMode>('waypoints');
  const [waypointCount, setWaypointCount] = useState(7);
  const [mazeSize, setMazeSize] = useState(DEFAULT_MAZE_SIZE);
  const [stopCount, setStopCount] = useState(DEFAULT_STOP_COUNT);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const [showExploration, setShowExploration] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<RaceCommentary[]>([]);

  const raceStatusRef = useRef(raceStatus);
  const animationSpeedRef = useRef(animationSpeed);
  useEffect(() => { raceStatusRef.current = raceStatus; }, [raceStatus]);
  useEffect(() => { animationSpeedRef.current = animationSpeed; }, [animationSpeed]);

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
      const newRacers: Racer[] = [];

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

        newRacers.push({
          team, position: { x: newTrack.start[0], y: newTrack.start[1] }, velocity: { x: 0, y: 0 },
          heading: 0, path: fullPath, explored: totalExplored, currentTarget: 0, lapTime: 0, bestLap: Infinity,
          totalDistance: 0, currentSpeed: 0, tire: 100, fuel: 100, finished: false, finishTime: 0, trail: [],
          telemetry: { speed: [], exploration: [], efficiency: fullPath.length > 0 ? (fullPath.length / totalExplored.size) * 100 : 0 },
          collectedWaypoints: new Set(), targetWaypoint: null, waypointPath: []
        });
      }
      setRacers(newRacers);
      setDeliveryRacers([]);
      setEventLog([{ time: 0, message: `Maze ${mazeSize}×${mazeSize} with ${wpCount} waypoints`, type: 'info' }]);
    } else {
      const newRoute = generateDeliveryRoute(stopCount);
      setDeliveryRoute(newRoute);
      setTrack(null);

      const newDeliveryRacers: DeliveryRacer[] = selectedAlgorithms.map(algorithmId => {
        const team = RACING_TEAMS[algorithmId];
        const route = calculateDeliveryRoute(algorithmId, newRoute);
        const totalDist = calculateTotalDistance(newRoute.stops, route);
        return {
          team, route, totalDistance: totalDist, currentStopIndex: 0,
          position: { x: newRoute.depot.x, y: newRoute.depot.y },
          visitedStops: new Set([0]), trail: [], finished: false, finishTime: 0, progress: 0
        };
      });
      setDeliveryRacers(newDeliveryRacers);
      setRacers([]);
      setEventLog([{ time: 0, message: `${stopCount} delivery stops generated`, type: 'info' }]);
    }

    setRaceStatus('preparing');
    setExpandedResult(null);
  }, [environmentMode, raceMode, waypointCount, mazeSize, stopCount, selectedAlgorithms, calculateWaypointOrder, runAlgorithm]);

  // Real-time updates when config changes
  useEffect(() => { initializeSimulation(); }, [environmentMode, raceMode, waypointCount, mazeSize, stopCount, selectedAlgorithms]);

  const startAnalysis = () => {
    setRaceStatus('racing');
    setEventLog(prev => [...prev, { time: 0, message: 'Analysis started', type: 'success' }]);
  };

  // Animation loop
  useEffect(() => {
    if (raceStatus !== 'racing') return;

    const animate = () => {
      if (raceStatusRef.current !== 'racing') return;

      if (environmentMode === 'maze') {
        setRacers(prev => {
          const updated = prev.map(racer => {
            if (racer.finished || !racer.path || racer.path.length === 0) {
              return racer.finished ? racer : { ...racer, finished: true, finishTime: Infinity };
            }
            const speed = 0.15 * animationSpeedRef.current;
            const nextTarget = Math.min(racer.currentTarget + speed, racer.path.length - 1);
            if (nextTarget >= racer.path.length - 1) {
              return {
                ...racer, finished: true, finishTime: Date.now(),
                position: { x: racer.path[racer.path.length - 1][0], y: racer.path[racer.path.length - 1][1] },
                currentTarget: racer.path.length - 1
              };
            }
            const ti = Math.floor(nextTarget), t = nextTarget - ti;
            const cur = racer.path[ti], nxt = racer.path[Math.min(ti + 1, racer.path.length - 1)];
            const newX = cur[0] + (nxt[0] - cur[0]) * t, newY = cur[1] + (nxt[1] - cur[1]) * t;
            const newTrail = [...racer.trail, { x: racer.position.x, y: racer.position.y, alpha: 1 }].slice(-30).map(t => ({ ...t, alpha: t.alpha * 0.92 }));
            return { ...racer, position: { x: newX, y: newY }, currentTarget: nextTarget, trail: newTrail };
          });
          if (updated.every(r => r.finished)) {
            setRaceStatus('finished');
            const winner = updated.filter(r => r.finishTime !== Infinity).reduce((a, b) => a.path.length < b.path.length ? a : b, updated[0]);
            if (winner) setEventLog(prev => [...prev, { time: Date.now(), message: `${winner.team.name} wins: ${winner.path.length} steps`, type: 'success' }]);
          }
          return updated;
        });
      } else {
        setDeliveryRacers(prev => {
          const updated = prev.map(racer => {
            if (racer.finished) return racer;
            if (racer.currentStopIndex >= racer.route.length - 1) return { ...racer, finished: true, finishTime: Date.now() };

            const speed = 3 * animationSpeedRef.current;
            let newProgress = racer.progress + speed / 100;
            const curId = racer.route[racer.currentStopIndex], nxtId = racer.route[racer.currentStopIndex + 1];
            const curStop = deliveryRoute?.stops.find(s => s.id === curId);
            const nxtStop = deliveryRoute?.stops.find(s => s.id === nxtId);
            if (!curStop || !nxtStop) return { ...racer, finished: true, finishTime: Infinity };

            let newIdx = racer.currentStopIndex, newVisited = racer.visitedStops;
            if (newProgress >= 1) { newProgress = 0; newIdx++; newVisited = new Set(racer.visitedStops); newVisited.add(nxtId); }

            const fromStop = newIdx === racer.currentStopIndex ? curStop : nxtStop;
            const toStop = deliveryRoute?.stops.find(s => s.id === racer.route[newIdx + 1]) || fromStop;
            const newX = fromStop.x + (toStop.x - fromStop.x) * newProgress;
            const newY = fromStop.y + (toStop.y - fromStop.y) * newProgress;
            const newTrail = [...racer.trail, { x: racer.position.x, y: racer.position.y, alpha: 1 }].slice(-50).map(t => ({ ...t, alpha: t.alpha * 0.95 }));
            return { ...racer, currentStopIndex: newIdx, progress: newProgress, position: { x: newX, y: newY }, visitedStops: newVisited, trail: newTrail };
          });
          if (updated.every(r => r.finished)) {
            setRaceStatus('finished');
            const winner = updated.filter(r => r.finishTime !== Infinity).reduce((a, b) => a.totalDistance < b.totalDistance ? a : b, updated[0]);
            if (winner) setEventLog(prev => [...prev, { time: Date.now(), message: `${winner.team.name} wins: ${Math.round(winner.totalDistance)} distance`, type: 'success' }]);
          }
          return updated;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [raceStatus, environmentMode, deliveryRoute]);

  // Render
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
    ctx.fillStyle = tokens.colors.bg.canvas;
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < track.height; y++) {
      for (let x = 0; x < track.width; x++) {
        ctx.fillStyle = track.getCell(x, y) === 1 ? tokens.colors.bg.tertiary : tokens.colors.bg.secondary;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    if (showExploration) {
      racers.forEach(r => {
        ctx.fillStyle = r.team.color + '20';
        r.explored.forEach(key => { const [x, y] = key.split(',').map(Number); ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2); });
      });
    }

    if (raceMode === 'waypoints') {
      track.waypoints.forEach((wp, idx) => {
        const x = wp[0] * CELL_SIZE + CELL_SIZE / 2, y = wp[1] * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillStyle = tokens.colors.accent.yellow + '40';
        ctx.beginPath(); ctx.arc(x, y, CELL_SIZE * 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = tokens.colors.accent.yellow;
        ctx.beginPath(); ctx.arc(x, y, CELL_SIZE * 0.4, 0, Math.PI * 2); ctx.fill();
        if (showLabels) { ctx.fillStyle = tokens.colors.bg.primary; ctx.font = `bold 8px ${tokens.fonts.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((idx + 1).toString(), x, y); }
      });
    }

    ctx.fillStyle = tokens.colors.accent.green;
    ctx.fillRect(track.start[0] * CELL_SIZE, track.start[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = tokens.colors.accent.red;
    ctx.fillRect(track.finish[0] * CELL_SIZE, track.finish[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    if (showTrails) {
      racers.forEach(r => r.trail.forEach(p => {
        ctx.fillStyle = r.team.color + Math.floor(p.alpha * 200).toString(16).padStart(2, '0');
        ctx.beginPath(); ctx.arc(p.x * CELL_SIZE + CELL_SIZE / 2, p.y * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2); ctx.fill();
      }));
    }

    racers.forEach(r => {
      const x = r.position.x * CELL_SIZE + CELL_SIZE / 2, y = r.position.y * CELL_SIZE + CELL_SIZE / 2;
      ctx.fillStyle = r.team.color + '40'; ctx.beginPath(); ctx.arc(x, y, CELL_SIZE * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = r.team.color; ctx.beginPath(); ctx.arc(x, y, CELL_SIZE * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = tokens.colors.bg.primary; ctx.font = `bold 8px ${tokens.fonts.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(r.team.number.toString(), x, y);
    });
  };

  const renderDelivery = (ctx: CanvasRenderingContext2D, route: DeliveryRoute) => {
    ctx.fillStyle = tokens.colors.bg.canvas;
    ctx.fillRect(0, 0, route.width, route.height);

    if (showExploration) {
      deliveryRacers.forEach(r => {
        ctx.strokeStyle = r.team.color + '30'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath();
        for (let i = 0; i < r.route.length; i++) {
          const stop = route.stops.find(s => s.id === r.route[i]);
          if (stop) { if (i === 0) ctx.moveTo(stop.x, stop.y); else ctx.lineTo(stop.x, stop.y); }
        }
        ctx.stroke(); ctx.setLineDash([]);
      });
    }

    if (showTrails) {
      deliveryRacers.forEach(r => {
        if (r.trail.length > 1) {
          ctx.strokeStyle = r.team.color + '80'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
          ctx.moveTo(r.trail[0].x, r.trail[0].y); r.trail.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
        }
      });
    }

    route.stops.forEach(stop => {
      const visited = deliveryRacers.some(r => r.visitedStops.has(stop.id));
      if (stop.isDepot) {
        ctx.fillStyle = tokens.colors.accent.orange;
        ctx.fillRect(stop.x - 12, stop.y - 12, 24, 24);
        ctx.fillStyle = tokens.colors.bg.primary; ctx.fillRect(stop.x - 8, stop.y - 4, 16, 12);
        ctx.fillStyle = tokens.colors.accent.orange; ctx.fillRect(stop.x - 4, stop.y, 8, 8);
      } else {
        ctx.fillStyle = visited ? tokens.colors.accent.green + '60' : tokens.colors.text.muted;
        ctx.beginPath(); ctx.arc(stop.x, stop.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = visited ? tokens.colors.accent.green : tokens.colors.border.strong; ctx.lineWidth = 2; ctx.stroke();
        if (showLabels) { ctx.fillStyle = visited ? tokens.colors.bg.primary : tokens.colors.text.primary; ctx.font = `bold 8px ${tokens.fonts.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(stop.id.toString(), stop.x, stop.y); }
      }
    });

    deliveryRacers.forEach(r => {
      ctx.fillStyle = r.team.color; ctx.fillRect(r.position.x - 10, r.position.y - 6, 20, 12);
      ctx.fillRect(r.position.x + 6, r.position.y - 4, 6, 8);
      ctx.fillStyle = tokens.colors.bg.canvas; ctx.fillRect(r.position.x + 8, r.position.y - 2, 3, 4);
      ctx.fillStyle = tokens.colors.bg.primary; ctx.font = `bold 8px ${tokens.fonts.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(r.team.number.toString(), r.position.x - 2, r.position.y);
    });
  };

  const canvasWidth = environmentMode === 'maze' ? mazeSize * CELL_SIZE : DELIVERY_WIDTH;
  const canvasHeight = environmentMode === 'maze' ? mazeSize * CELL_SIZE : DELIVERY_HEIGHT;

  const sortedRacers = environmentMode === 'maze'
    ? [...racers].sort((a, b) => { if (a.finished !== b.finished) return a.finished ? -1 : 1; return a.path.length - b.path.length; })
    : [...deliveryRacers].sort((a, b) => { if (a.finished !== b.finished) return a.finished ? -1 : 1; return a.totalDistance - b.totalDistance; });

  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.bg.primary, color: tokens.colors.text.primary, fontFamily: tokens.fonts.sans, padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${tokens.colors.border.subtle}` }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{environmentMode === 'maze' ? 'Pathfinding Algorithm Comparison' : 'Delivery Route Optimization'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: tokens.colors.text.secondary }}>{environmentMode === 'maze' ? 'Compare maze navigation efficiency' : 'Compare TSP routing strategies'}</p>
        </div>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: '14px', color: raceStatus === 'finished' ? tokens.colors.accent.green : tokens.colors.text.secondary, background: tokens.colors.bg.secondary, padding: '6px 12px', borderRadius: tokens.radius.md, border: `1px solid ${tokens.colors.border.subtle}` }}>
          {raceStatus === 'finished' ? '✓ Complete' : raceStatus === 'racing' ? 'Running...' : 'Ready'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: '20px' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Environment */}
          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.border.subtle}`, fontSize: '13px', fontWeight: 500, color: tokens.colors.text.secondary }}>Environment</div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', background: tokens.colors.bg.tertiary, borderRadius: tokens.radius.md, padding: '4px' }}>
                {(['maze', 'network'] as EnvironmentMode[]).map(mode => (
                  <button key={mode} onClick={() => setEnvironmentMode(mode)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: environmentMode === mode ? tokens.colors.bg.secondary : 'transparent', border: 'none', borderRadius: tokens.radius.sm, color: environmentMode === mode ? tokens.colors.text.primary : tokens.colors.text.secondary, cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                    {mode === 'maze' ? <Grid3X3 size={14} /> : <Truck size={14} />}
                    {mode === 'maze' ? 'Maze' : 'Delivery'}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: tokens.colors.text.secondary, marginBottom: '6px' }}>{environmentMode === 'maze' ? `Maze: ${mazeSize}×${mazeSize}` : `Stops: ${stopCount}`}</label>
                <input type="range" min={environmentMode === 'maze' ? 21 : 10} max={environmentMode === 'maze' ? 61 : 100} step={environmentMode === 'maze' ? 10 : 5} value={environmentMode === 'maze' ? mazeSize : stopCount} onChange={(e) => environmentMode === 'maze' ? setMazeSize(Number(e.target.value)) : setStopCount(Number(e.target.value))} style={{ width: '100%', accentColor: tokens.colors.accent.blue }} />
              </div>
            </div>
          </div>

          {/* Mode (maze only) */}
          {environmentMode === 'maze' && (
            <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.border.subtle}`, fontSize: '13px', fontWeight: 500, color: tokens.colors.text.secondary }}>Mode</div>
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', background: tokens.colors.bg.tertiary, borderRadius: tokens.radius.md, padding: '4px' }}>
                  {(['sprint', 'waypoints'] as RaceMode[]).map(mode => (
                    <button key={mode} onClick={() => setRaceMode(mode)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: raceMode === mode ? tokens.colors.bg.secondary : 'transparent', border: 'none', borderRadius: tokens.radius.sm, color: raceMode === mode ? tokens.colors.text.primary : tokens.colors.text.secondary, cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                      {mode === 'sprint' ? <Zap size={14} /> : <MapPin size={14} />}
                      {mode === 'sprint' ? 'Sprint' : 'Waypoints'}
                    </button>
                  ))}
                </div>
                {raceMode === 'waypoints' && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: tokens.colors.text.secondary, marginBottom: '6px' }}>Waypoints: {waypointCount}</label>
                    <input type="range" min={1} max={15} value={waypointCount} onChange={(e) => setWaypointCount(Number(e.target.value))} style={{ width: '100%', accentColor: tokens.colors.accent.yellow }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speed */}
          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, padding: '12px 16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: tokens.colors.text.secondary, marginBottom: '6px' }}>Speed: {animationSpeed}×</label>
            <input type="range" min={0.5} max={5} step={0.5} value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} style={{ width: '100%', accentColor: tokens.colors.accent.blue }} />
          </div>

          {/* Algorithms */}
          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.border.subtle}`, fontSize: '13px', fontWeight: 500, color: tokens.colors.text.secondary }}>Algorithms</div>
            <div style={{ padding: '8px' }}>
              {Object.values(RACING_TEAMS).map(team => (
                <label key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: tokens.radius.md, cursor: 'pointer', background: selectedAlgorithms.includes(team.id) ? tokens.colors.algorithms[team.id] + '15' : 'transparent', border: `1px solid ${selectedAlgorithms.includes(team.id) ? tokens.colors.algorithms[team.id] + '40' : 'transparent'}`, marginBottom: '4px' }}>
                  <input type="checkbox" checked={selectedAlgorithms.includes(team.id)} onChange={(e) => e.target.checked ? setSelectedAlgorithms([...selectedAlgorithms, team.id]) : setSelectedAlgorithms(selectedAlgorithms.filter(t => t !== team.id))} style={{ accentColor: tokens.colors.algorithms[team.id] }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: tokens.colors.algorithms[team.id], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: tokens.colors.bg.primary }}>{team.number}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{team.name}</div>
                    <div style={{ fontSize: '11px', color: tokens.colors.text.muted }}>{ALGORITHM_INFO[team.id].complexity}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${tokens.colors.border.subtle}` }}>
              {[{ key: 'exploration', state: showExploration, set: setShowExploration, label: environmentMode === 'maze' ? 'Exploration' : 'Routes', color: tokens.colors.accent.blue },
              { key: 'trails', state: showTrails, set: setShowTrails, label: 'Trails', color: tokens.colors.accent.purple },
              { key: 'labels', state: showLabels, set: setShowLabels, label: 'Labels', color: tokens.colors.accent.green }
              ].map(opt => (
                <button key={opt.key} onClick={() => opt.set(!opt.state)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: opt.state ? opt.color + '20' : tokens.colors.bg.tertiary, border: `1px solid ${opt.state ? opt.color + '40' : tokens.colors.border.subtle}`, borderRadius: tokens.radius.md, color: opt.state ? opt.color : tokens.colors.text.secondary, cursor: 'pointer', fontSize: '12px' }}>
                  {opt.state ? <Eye size={14} /> : <EyeOff size={14} />} {opt.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', background: tokens.colors.bg.canvas, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
              <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => raceStatus === 'racing' ? setRaceStatus('preparing') : startAnalysis()} disabled={selectedAlgorithms.length === 0} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', background: raceStatus === 'racing' ? tokens.colors.accent.red : tokens.colors.accent.green, border: 'none', borderRadius: tokens.radius.md, color: tokens.colors.bg.primary, cursor: selectedAlgorithms.length === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, opacity: selectedAlgorithms.length === 0 ? 0.5 : 1 }}>
                {raceStatus === 'racing' ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Start</>}
              </button>
              <button onClick={initializeSimulation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', background: tokens.colors.bg.tertiary, border: `1px solid ${tokens.colors.border.default}`, borderRadius: tokens.radius.md, color: tokens.colors.text.primary, cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.border.subtle}`, fontSize: '13px', fontWeight: 500, color: tokens.colors.text.secondary }}>Log</div>
            <div style={{ padding: '8px 12px', maxHeight: '80px', overflowY: 'auto', fontFamily: tokens.fonts.mono, fontSize: '12px' }}>
              {eventLog.slice(-4).reverse().map((e, i) => <div key={i} style={{ padding: '4px 0', color: e.type === 'success' ? tokens.colors.accent.green : tokens.colors.text.secondary }}>{e.message}</div>)}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.border.subtle}`, fontSize: '13px', fontWeight: 500, color: tokens.colors.text.secondary }}>Results</div>
            <div style={{ padding: '8px' }}>
              {sortedRacers.map((r, pos) => {
                const team = r.team, isMaze = environmentMode === 'maze';
                const metric =
                  'path' in r
                    ? r.path?.length
                    : Math.round(r.totalDistance);
                const isWinner = pos === 0 && r.finished;
                return (
                  <div key={team.id} onClick={() => setExpandedResult(expandedResult === team.id ? null : team.id)} style={{ padding: '12px', marginBottom: '4px', background: isWinner ? tokens.colors.algorithms[team.id] + '15' : tokens.colors.bg.tertiary, borderRadius: tokens.radius.md, cursor: 'pointer', border: `1px solid ${isWinner ? tokens.colors.algorithms[team.id] + '40' : 'transparent'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, width: '24px', color: isWinner ? tokens.colors.accent.green : tokens.colors.text.secondary }}>#{pos + 1}</div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: tokens.colors.algorithms[team.id], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: tokens.colors.bg.primary }}>{team.number}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{team.name}</div>
                        <div style={{ fontSize: '11px', color: tokens.colors.text.muted, fontFamily: tokens.fonts.mono }}>{r.finished ? `${metric} ${isMaze ? 'steps' : 'dist'}` : 'Running...'}</div>
                      </div>
                      {expandedResult === team.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    {expandedResult === team.id && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${tokens.colors.border.subtle}`, fontSize: '12px' }}>
                        <div style={{ padding: '8px', background: tokens.colors.bg.primary, borderRadius: tokens.radius.sm, color: tokens.colors.text.secondary, lineHeight: 1.4 }}>
                          {isMaze ? ALGORITHM_INFO[team.id as AlgorithmClass].mazeDesc : ALGORITHM_INFO[team.id as AlgorithmClass].deliveryDesc}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: tokens.colors.bg.secondary, borderRadius: tokens.radius.lg, border: `1px solid ${tokens.colors.border.subtle}`, padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px', color: tokens.colors.text.secondary }}>Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', fontFamily: tokens.fonts.mono }}>
              <div><div style={{ color: tokens.colors.text.muted, marginBottom: '4px' }}>Algorithms</div><div style={{ fontSize: '18px', fontWeight: 600 }}>{sortedRacers.length}</div></div>
              <div><div style={{ color: tokens.colors.text.muted, marginBottom: '4px' }}>Best</div><div style={{ fontSize: '18px', fontWeight: 600, color: tokens.colors.accent.green }}>{environmentMode === 'maze' ? Math.min(...racers.filter(r => r.path?.length > 0).map(r => r.path.length)) || '—' : Math.round(Math.min(...deliveryRacers.map(r => r.totalDistance))) || '—'}</div></div>
              <div><div style={{ color: tokens.colors.text.muted, marginBottom: '4px' }}>Worst</div><div style={{ fontSize: '18px', fontWeight: 600, color: tokens.colors.accent.red }}>{environmentMode === 'maze' ? Math.max(...racers.filter(r => r.path?.length > 0).map(r => r.path.length)) || '—' : Math.round(Math.max(...deliveryRacers.map(r => r.totalDistance))) || '—'}</div></div>
              <div><div style={{ color: tokens.colors.text.muted, marginBottom: '4px' }}>Δ Efficiency</div><div style={{ fontSize: '18px', fontWeight: 600 }}>{environmentMode === 'maze' ? (racers.length > 1 ? `${Math.round((Math.max(...racers.map(r => r.path?.length || 0)) / Math.max(1, Math.min(...racers.filter(r => r.path?.length > 0).map(r => r.path.length))) - 1) * 100)}%` : '—') : (deliveryRacers.length > 1 ? `${Math.round((Math.max(...deliveryRacers.map(r => r.totalDistance)) / Math.max(1, Math.min(...deliveryRacers.map(r => r.totalDistance))) - 1) * 100)}%` : '—')}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}