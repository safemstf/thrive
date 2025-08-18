// src/components/cs/ants/ants.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import {
  SimulationCanvas,
  Card,
  CardContent,
  BaseButton,
  FlexRow,
  BodyText
} from '@/styles/styled-components';

// IMPORTANT: point this to your pathfinding module (the file you posted).
// It must export `runAlgorithm` and `AlgorithmType` types.
import { runAlgorithm, AlgorithmType } from '../mazesolver/algorithms';

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////
type Strategy = 'random' | 'pheromone' | 'greedy' | 'dijkstra';

interface Ant {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hasFood: boolean;
  colonyId: number;
  // optional path plan for dijkstra/aStar
  plan?: { x: number; y: number }[];
  planIndex?: number;
  lastPlanAlgorithm?: AlgorithmType | 'AStar' | 'Dijkstra' | undefined;
}

interface Colony {
  id: number;
  name: string;
  color: string;
  baseX: number;
  baseY: number;
  foodCollected: number;
  antsCount: number;
  strategy: Strategy;
  alive: boolean;
}

interface FoodSource {
  x: number;
  y: number;
  amount: number;
}

interface Pheromone {
  x: number;
  y: number;
  strength: number;
  colonyId: number;
}

////////////////////////////////////////////////////////////////////////////////
// Constants & configuration
////////////////////////////////////////////////////////////////////////////////
const CANVAS_W = 900;
const CANVAS_H = 600;

const GRID_SIZE = 12; // cell size for grid-based planners
const MAX_PHEROMONES = 1.0;
const PHEROMONE_DECAY = 0.992;

const DEFAULT_ANTS_PER_COLONY = 18;

////////////////////////////////////////////////////////////////////////////////
// Utility helpers
////////////////////////////////////////////////////////////////////////////////
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

const toGrid = (x: number, y: number) => {
  return [Math.floor(x / GRID_SIZE), Math.floor(y / GRID_SIZE)] as [number, number];
};
const fromGrid = (gx: number, gy: number) => {
  return [gx * GRID_SIZE + GRID_SIZE / 2, gy * GRID_SIZE + GRID_SIZE / 2];
};

////////////////////////////////////////////////////////////////////////////////
// Props - controlled by the parent page (app/simulations/page.tsx)
////////////////////////////////////////////////////////////////////////////////
export type AntsSimulationProps = {
  isRunning: boolean;
  speed?: number; // multiplier
  isDark?: boolean;
};

////////////////////////////////////////////////////////////////////////////////
// Component
////////////////////////////////////////////////////////////////////////////////
const AntsSimulation: React.FC<AntsSimulationProps> = ({ isRunning, speed = 1, isDark = false }) => {
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Refs for simulation state to avoid frequent React updates
  const antsRef = useRef<Map<number, Ant>>(new Map());
  const coloniesRef = useRef<Map<number, Colony>>(new Map());
  const foodRef = useRef<FoodSource[]>([]);
  const pherRef = useRef<Pheromone[]>([]);
  const animRef = useRef<number | null>(null);
  const idCounter = useRef(1);
  const lastTimeRef = useRef<number | null>(null);

  // UI state (coarse updates)
  const [, setTick] = useState(0);
  const [showDebug] = useState(false);

  // Initialize simulation once
  useEffect(() => {
    initSimulation();
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start / stop based on prop
  useEffect(() => {
    if (isRunning) startLoop();
    else stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, speed]);

  // ---------- Initialization ----------
  const initSimulation = () => {
    // Reset containers
    antsRef.current.clear();
    coloniesRef.current.clear();
    pherRef.current = [];

    // Create colonies with strategies (Dijkstra included)
    const colonies: Colony[] = [
      { id: 1, name: 'Red Army', color: '#ef4444', baseX: 80, baseY: 80, foodCollected: 0, antsCount: DEFAULT_ANTS_PER_COLONY, strategy: 'random', alive: true },
      { id: 2, name: 'Blue Hive', color: '#3b82f6', baseX: CANVAS_W - 80, baseY: 80, foodCollected: 0, antsCount: DEFAULT_ANTS_PER_COLONY, strategy: 'pheromone', alive: true },
      { id: 3, name: 'Green Force', color: '#10b981', baseX: 80, baseY: CANVAS_H - 80, foodCollected: 0, antsCount: DEFAULT_ANTS_PER_COLONY, strategy: 'greedy', alive: true },
      { id: 4, name: 'Gold Swarm', color: '#f59e0b', baseX: CANVAS_W - 80, baseY: CANVAS_H - 80, foodCollected: 0, antsCount: DEFAULT_ANTS_PER_COLONY, strategy: 'dijkstra', alive: true },
    ];
    for (const c of colonies) coloniesRef.current.set(c.id, { ...c });

    // Create ants clustered at their bases
    idCounter.current = 1;
    for (const c of colonies) {
      for (let i = 0; i < c.antsCount; i++) {
        spawnAnt(c.id, c.baseX + (Math.random() - 0.5) * 10, c.baseY + (Math.random() - 0.5) * 10);
      }
    }

    // Food sources
    foodRef.current = [
      { x: CANVAS_W * 0.45, y: CANVAS_H * 0.25, amount: 70 },
      { x: CANVAS_W * 0.25, y: CANVAS_H * 0.6, amount: 50 },
      { x: CANVAS_W * 0.72, y: CANVAS_H * 0.55, amount: 70 },
    ];

    // tick UI
    setTick(t => t + 1);
  };

  const spawnAnt = (colonyId: number, x: number, y: number) => {
    const id = idCounter.current++;
    const ant: Ant = {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      hasFood: false,
      colonyId,
    };
    antsRef.current.set(id, ant);
    return ant;
  };

  // ---------- Loop control ----------
  const startLoop = () => {
    if (animRef.current !== null) return;
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(loop);
  };

  const stopLoop = () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    lastTimeRef.current = null;
  };

  // ---------- Main loop ----------
  const loop = (time: number) => {
    const last = lastTimeRef.current ?? time;
    const dt = (time - last) * 0.001 * speed; // seconds scaled by speed
    update(dt);
    render();
    lastTimeRef.current = time;
    animRef.current = requestAnimationFrame(loop);
  };

  // ---------- Update ----------
  const update = (dt: number) => {
    const ants = antsRef.current;
    const food = foodRef.current;
    const pher = pherRef.current;
    const colonies = coloniesRef.current;

    // Update each ant
    for (const ant of ants.values()) {
      const colony = colonies.get(ant.colonyId);
      if (!colony || !colony.alive) continue;

      // If ant has a plan (grid path), follow it
      if (ant.plan && typeof ant.planIndex === 'number' && ant.planIndex < ant.plan.length) {
        const cell = ant.plan[ant.planIndex];
        const [tx, ty] = fromGrid(cell.x, cell.y);
        steerTo(ant, tx, ty, 0.32);
        if (dist(ant.x, ant.y, tx, ty) < GRID_SIZE * 0.6) ant.planIndex!++;
      } else if (ant.hasFood) {
        // return to base
        steerTo(ant, colony.baseX, colony.baseY, 0.36);
        if (Math.random() < 0.25) {
          pher.push({ x: ant.x, y: ant.y, strength: MAX_PHEROMONES, colonyId: colony.id });
        }
      } else {
        // Behavior by strategy
        switch (colony.strategy) {
          case 'random':
            randomBehavior(ant);
            break;
          case 'pheromone':
            pheromoneBehavior(ant, pher);
            break;
          case 'greedy':
            greedyBehavior(ant, food);
            break;
          case 'dijkstra':
            // occasionally request a path plan; cheap window-based planning
            if (!ant.plan || Math.random() < 0.025) {
              requestPlan(ant, food);
            } else {
              // fallback to greedy if no plan
              greedyBehavior(ant, food);
            }
            break;
          default:
            randomBehavior(ant);
        }
      }

      // Integrate velocity with damping
      ant.vx *= 0.92;
      ant.vy *= 0.92;
      ant.x += ant.vx;
      ant.y += ant.vy;

      // bounds
      ant.x = clamp(ant.x, 4, CANVAS_W - 4);
      ant.y = clamp(ant.y, 4, CANVAS_H - 4);

      // slight jitter
      ant.x += (Math.random() - 0.5) * 0.1;
      ant.y += (Math.random() - 0.5) * 0.1;

      // Pickup food
      if (!ant.hasFood) {
        for (const f of food) {
          if (f.amount <= 0) continue;
          if (dist(ant.x, ant.y, f.x, f.y) < 9) {
            ant.hasFood = true;
            f.amount = Math.max(0, f.amount - 1);
            pher.push({ x: ant.x, y: ant.y, strength: MAX_PHEROMONES, colonyId: ant.colonyId });
            break;
          }
        }
      } else {
        // deliver to base
        if (dist(ant.x, ant.y, colony.baseX, colony.baseY) < 12) {
          ant.hasFood = false;
          colony.foodCollected += 1;
        }
      }
    }

    // Pheromone decay
    for (let i = pher.length - 1; i >= 0; i--) {
      pher[i].strength *= PHEROMONE_DECAY;
      if (pher[i].strength < 0.05) pher.splice(i, 1);
    }

    // occasionally compact pheromones (keep memory bounded)
    if (pher.length > 1200) compactPheromones();

    // small UI ping occasionally
    if (Math.random() < 0.02) setTick(t => t + 1);
  };

  // ---------- Steering and behaviors ----------
  function steerTo(ant: Ant, tx: number, ty: number, strength = 0.2) {
    const dx = tx - ant.x;
    const dy = ty - ant.y;
    const d = Math.hypot(dx, dy) || 1;
    ant.vx += (dx / d) * strength;
    ant.vy += (dy / d) * strength;
    // clamp speed
    const speedMag = Math.hypot(ant.vx, ant.vy);
    const max = 2.4;
    if (speedMag > max) {
      ant.vx = (ant.vx / speedMag) * max;
      ant.vy = (ant.vy / speedMag) * max;
    }
  }
  function randomBehavior(ant: Ant) {
    // slightly stronger random kicks + occasional longer glide
    const angle = Math.random() * Math.PI * 2;
    ant.vx += Math.cos(angle) * 0.18;
    ant.vy += Math.sin(angle) * 0.18;

    // bias away from own base occasionally to encourage exploration
    if (Math.random() < 0.06) {
        const col = coloniesRef.current.get(ant.colonyId);
        if (col) steerTo(ant, ant.x + (ant.x - col.baseX) * 0.12, ant.y + (ant.y - col.baseY) * 0.12, 0.18);
    }
    }

  function pheromoneBehavior(ant: Ant, pheromones: Pheromone[]) {
    let best: Pheromone | null = null;
    let bestScore = 0;
    for (const p of pheromones) {
      const d = dist(ant.x, ant.y, p.x, p.y);
      if (d > 140) continue;
      const score = p.strength / (1 + d * 0.02);
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    if (best) {
        // blend towards pheromone plus a random wander factor
        steerTo(ant, best.x + (Math.random() - 0.5) * 12, best.y + (Math.random() - 0.5) * 12, 0.32);
    } else randomBehavior(ant);
    }

  function greedyBehavior(ant: Ant, foods: FoodSource[]) {
    let nearest: FoodSource | null = null;
    let md = Infinity;
    for (const f of foods) {
      if (f.amount <= 0) continue;
      const d = dist(ant.x, ant.y, f.x, f.y);
      if (d < md) {
        md = d;
        nearest = f;
      }
    }
    if (nearest) steerTo(ant, nearest.x, nearest.y, 0.42);
    else randomBehavior(ant);
  }

    // ---------- Path planning integration ----------
  const requestPlan = useCallback((ant: Ant, foods: FoodSource[]) => {
    // no foods -> nothing to plan
    if (!foods || foods.length === 0) return;

    // 1) choose nearest available food
    let best: FoodSource | null = null;
    let bestD = Infinity;
    for (const f of foods) {
        if (f.amount <= 0) continue;
        const d = dist(ant.x, ant.y, f.x, f.y);
        if (d < bestD) {
        bestD = d;
        best = f;
        }
    }
    if (!best) return;

    // 2) map to grid coordinates (global)
    const [agx, agy] = toGrid(ant.x, ant.y);
    const [tgx, tgy] = toGrid(best.x, best.y);

    // 3) build a window that includes both ant and target (prevents OOB goals)
    const margin = 16; // cells radius around the bbox between ant and goal
    const minGridX = Math.min(agx, tgx);
    const minGridY = Math.min(agy, tgy);
    const maxGridX = Math.max(agx, tgx);
    const maxGridY = Math.max(agy, tgy);

    const gridCols = Math.floor(CANVAS_W / GRID_SIZE);
    const gridRows = Math.floor(CANVAS_H / GRID_SIZE);

    const minX = clamp(minGridX - margin, 0, gridCols - 1);
    const minY = clamp(minGridY - margin, 0, gridRows - 1);
    const maxX = clamp(maxGridX + margin, 0, gridCols - 1);
    const maxY = clamp(maxGridY + margin, 0, gridRows - 1);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // Safety: degenerate window -> bail out
    if (width <= 0 || height <= 0) {
        ant.plan = undefined;
        ant.planIndex = undefined;
        ant.lastPlanAlgorithm = undefined;
        return;
    }

    // 4) build local maze (0 = walkable). If you later add obstacles, map them here.
    const maze: number[][] = new Array(height);
    for (let gy = 0; gy < height; gy++) {
        const row: number[] = new Array(width);
        for (let gx = 0; gx < width; gx++) {
        row[gx] = 0; // walkable
        }
        maze[gy] = row;
    }

    // 5) compute local start/goal inside the local maze
    const localStart: [number, number] = [agx - minX, agy - minY];
    const localGoal: [number, number] = [tgx - minX, tgy - minY];

    // Defensive check: ensure start/goal inside window
    if (
        localStart[0] < 0 || localStart[1] < 0 ||
        localStart[0] >= width || localStart[1] >= height ||
        localGoal[0] < 0 || localGoal[1] < 0 ||
        localGoal[0] >= width || localGoal[1] >= height
    ) {
        ant.plan = undefined;
        ant.planIndex = undefined;
        ant.lastPlanAlgorithm = undefined;
        return;
    }

    // 6) select algorithm based on colony strategy
    const colony = coloniesRef.current.get(ant.colonyId);
    const algorithm: AlgorithmType = colony?.strategy === 'dijkstra' ? 'Dijkstra' : 'AStar';

    // 7) run pathfinder safely (timeLimit + maxSteps) and convert path back to global grid coordinates
    try {
        const result = runAlgorithm(algorithm, maze, localStart, localGoal, {
        allowDiagonal: false,
        timeLimit: 180,    // ms - tune as needed
        maxSteps: 20000,
        });

        if (result && result.success && result.path && result.path.length > 0) {
        // convert local path [gx,gy] -> global grid coords (and cap length)
        const MAX_PLAN_LENGTH = 400;
        const plan = result.path.slice(0, MAX_PLAN_LENGTH).map(([gx, gy]) => ({
            x: gx + minX,
            y: gy + minY
        }));

        // Assign plan to ant and mark which algorithm produced it
        ant.plan = plan;
        ant.planIndex = 0;
        ant.lastPlanAlgorithm = algorithm;

        // Optional: if plan is very short, optionally clear and let greedy behavior handle it next tick
        if (plan.length <= 1) {
            // too trivial to follow a plan
            ant.plan = undefined;
            ant.planIndex = undefined;
            ant.lastPlanAlgorithm = undefined;
        }
        } else {
        // planner did not find a path -> clear plan and fallback
        ant.plan = undefined;
        ant.planIndex = undefined;
        ant.lastPlanAlgorithm = undefined;
        }
    } catch (err) {
        // planner threw — swallow and fallback
        ant.plan = undefined;
        ant.planIndex = undefined;
        ant.lastPlanAlgorithm = undefined;
    }
    }, []);


  // ---------- Pheromone maintenance ----------
  function compactPheromones() {
    const store = pherRef.current;
    const cell = 10;
    const map = new Map<string, Pheromone>();
    for (const p of store) {
      const kx = Math.round(p.x / cell);
      const ky = Math.round(p.y / cell);
      const key = `${kx},${ky},${p.colonyId}`;
      const existing = map.get(key);
      if (existing) {
        existing.x = (existing.x + p.x) / 2;
        existing.y = (existing.y + p.y) / 2;
        existing.strength = Math.min(MAX_PHEROMONES, (existing.strength + p.strength) / 2);
      } else {
        map.set(key, { ...p });
      }
    }
    pherRef.current = Array.from(map.values());
  }


  // ---------- Rendering ----------
  function hexToRgba(hex: string, alpha = 1) {
    // support '#rrggbb' or 'rgb(...)' fallback
    if (hex.startsWith('rgb')) {
        // assume input like 'rgb(59,130,246)' or 'rgb(59,130,246,0.8)'
        return hex.includes('(') ? hex : `${hex}`;
    }
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // high-DPI crisp canvas setup
    const dpr = window.devicePixelRatio || 1;
    const cssW = CANVAS_W;
    const cssH = CANVAS_H;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background gradient (subtle)
    const g = ctx.createLinearGradient(0, 0, 0, cssH);
    if (isDark) {
        g.addColorStop(0, '#041122');
        g.addColorStop(1, '#071226');
    } else {
        g.addColorStop(0, '#f8fafc');
        g.addColorStop(1, '#eef2ff');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cssW, cssH);

    // ---- pheromone render (additive, subtle heat map) ----
    // using 'lighter' composite lets overlapping pheromones glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of pherRef.current) {
        const col = coloniesRef.current.get(p.colonyId);
        if (!col) continue;
        const alpha = clamp(p.strength * 0.28, 0, 0.6);
        const r = 10 + p.strength * 14;

        // radial gradient for each pheromone
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        // center stronger + tinted by colony color
        rg.addColorStop(0, hexToRgba(col.color, alpha));
        rg.addColorStop(0.6, hexToRgba(col.color, alpha * 0.25));
        rg.addColorStop(1, hexToRgba(col.color, 0));
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // ---- food ----
    ctx.save();
    for (const f of foodRef.current) {
        ctx.beginPath();
        ctx.fillStyle = '#8b5cf6';
        ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDark ? '#fff' : '#06202a';
        ctx.font = '11px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String(f.amount), f.x, f.y + 22);
    }
    ctx.restore();

    // ---- colonies (bases) with subtle planner ring ----
    for (const c of coloniesRef.current.values()) {
        // base circle
        ctx.beginPath();
        ctx.fillStyle = c.color;
        ctx.arc(c.baseX, c.baseY, 18, 0, Math.PI * 2);
        ctx.fill();

        // subtle planner ring if any ant of this colony has a plan
        const anyPlanned = Array.from(antsRef.current.values()).some(a => a.colonyId === c.id && !!a.lastPlanAlgorithm);
        if (anyPlanned) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = c.color;
        ctx.globalAlpha = 0.12;
        ctx.arc(c.baseX, c.baseY, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        }

        // label under base
        ctx.fillStyle = isDark ? '#cfe9ff' : '#022627';
        ctx.textAlign = 'center';
        ctx.font = '12px Inter';
        ctx.fillText(`${c.name} • ${c.foodCollected}`, c.baseX, c.baseY + 36);
    }

    // ---- ants with short ghost trail + orientation needle ----
    // Use time for subtle per-frame exploration speck flicker
    const now = performance.now();
    for (const ant of antsRef.current.values()) {
        const c = coloniesRef.current.get(ant.colonyId);
        if (!c || !c.alive) continue;

        // motion ghost: draw a short translucent line from previous approx -> current
        // previous pos approximated by reversing a bit of velocity (gives quick 'trail' feel)
        const prevX = ant.x - ant.vx * 2;
        const prevY = ant.y - ant.vy * 2;

        // ghost stroke
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(ant.x, ant.y);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = hexToRgba(c.color, 0.22);
        ctx.stroke();

        // small exploration specks for roaming ants (not carrying and no plan)
        if (!ant.hasFood && (!ant.plan || ant.plan.length === 0)) {
        // flicker probability based on ant id + time for variety without extra state
        const flick = (Math.abs((ant.id * 9973) ^ Math.floor(now * 0.001)) % 100) / 100;
        if (flick < 0.08) {
            ctx.beginPath();
            ctx.fillStyle = hexToRgba(c.color, 0.12);
            const rx = ant.x + (Math.random() - 0.5) * 8;
            const ry = ant.y + (Math.random() - 0.5) * 8;
            ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        }

        // ant body (circle)
        ctx.beginPath();
        ctx.fillStyle = ant.hasFood ? '#ffe082' : c.color;
        ctx.arc(ant.x, ant.y, 3.6, 0, Math.PI * 2);
        ctx.fill();

        // orientation needle: small line in direction of velocity (normalized)
        const vmag = Math.hypot(ant.vx, ant.vy) || 1;
        const nx = (ant.vx / vmag) * 6;
        const ny = (ant.vy / vmag) * 6;
        ctx.beginPath();
        ctx.moveTo(ant.x, ant.y);
        ctx.lineTo(ant.x + nx, ant.y + ny);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.stroke();

        // subtle highlight inner
        ctx.beginPath();
        ctx.arc(ant.x - 0.6, ant.y - 0.6, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();
    }

    // debug overlay (keeps behaviour from before)
    if (showDebug) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,0,0,0.6)';
        ctx.font = '10px Inter';
        ctx.fillText(`ants ${antsRef.current.size} pher ${pherRef.current.length}`, 10, 12);
        ctx.restore();
    }
    };
// ---------- end render ----------


  // ---------- Public UI helpers ----------
  const handleReset = () => {
    stopLoop();
    initSimulation();
  };

  // expose light controls for testing in this component (the parent page also controls start/pause)
  return (
    <Card style={{ padding: 12 }}>
      <CardContent style={{ padding: 8 }}>
        <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <BodyText style={{ fontWeight: 700 }}>Ant Colony — Professional</BodyText>
          <div style={{ display: 'flex', gap: 8 }}>
            <BaseButton onClick={() => isRunning ? null : startLoop()} aria-label="Play">
              <Play size={14} /> Run
            </BaseButton>
            <BaseButton onClick={() => stopLoop()} aria-label="Pause">
              <Pause size={14} /> Pause
            </BaseButton>
            <BaseButton onClick={handleReset} aria-label="Reset">
              Reset
            </BaseButton>
          </div>
        </FlexRow>

        <SimulationCanvas ref={canvasRef} $isDark={isDark} style={{ width: CANVAS_W, height: CANVAS_H }} />

        {/* small status block */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {Array.from(coloniesRef.current.values()).map(c => (
            <div key={c.id} style={{ padding: 6, borderRadius: 6, background: 'rgba(0,0,0,0.03)' }}>
              <div style={{ color: c.color, fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: 12 }}>{c.foodCollected} food • ants: {c.antsCount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AntsSimulation;
