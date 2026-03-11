'use client'

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  PlayCircle, PauseCircle, RefreshCw, Activity,
  BarChart3, Settings, X, Dna, FlaskConical, Zap
} from "lucide-react";
import {
  Chart as ChartJS, LineElement, CategoryScale,
  LinearScale, PointElement, Tooltip, Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import styled, { createGlobalStyle } from "styled-components";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// ─── NBody-style overlay styles ───────────────────────────────────────────────
const BacteriaOverlayStyles = createGlobalStyle`
  .bac-root {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 65vh;
    background: #030712;
    border-radius: 12px;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }
  .bac-root.theater {
    aspect-ratio: unset;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
  }
  .bac-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
    display: block;
  }
  .bac-canvas:active { cursor: grabbing; }

  /* ── top-left mode chips ── */
  .bac-mode-switcher {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 50;
    display: flex;
    gap: 0.3rem;
  }
  .bac-mode-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.28rem 0.65rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.62);
    color: rgba(255,255,255,0.6);
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    font-family: inherit;
  }
  .bac-mode-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .bac-mode-btn.active {
    border-color: #22c55e;
    background: rgba(34,197,94,0.18);
    color: #4ade80;
  }

  /* ── top-right icon buttons ── */
  .bac-top-right {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 50;
    display: flex;
    gap: 0.3rem;
  }
  .bac-icon-btn {
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.62);
    color: rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.15s;
  }
  .bac-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .bac-icon-btn.active {
    background: rgba(34,197,94,0.18);
    border-color: rgba(34,197,94,0.45);
    color: #4ade80;
  }

  /* ── HUD (top-right stats) ── */
  .bac-hud {
    position: absolute;
    top: 3rem;
    right: 0.75rem;
    z-index: 40;
    min-width: 150px;
    background: rgba(3,7,18,0.84);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
    font-size: 0.73rem;
    color: rgba(255,255,255,0.5);
  }
  .bac-hud-title {
    font-weight: 700;
    font-size: 0.78rem;
    color: #e2e8f0;
    margin-bottom: 0.45rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .bac-hud-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.13rem 0;
    gap: 0.6rem;
  }
  .bac-hud-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 0.3rem 0;
  }

  /* ── resistance legend bar ── */
  .bac-legend {
    position: absolute;
    bottom: 3.5rem;
    left: 0.75rem;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(3,7,18,0.75);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 0.3rem 0.6rem;
    font-size: 0.62rem;
    color: rgba(255,255,255,0.45);
  }
  .bac-legend-bar {
    width: 80px;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #ef4444);
  }

  /* ── bottom pill bar ── */
  .bac-bottom-bar {
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: rgba(3,7,18,0.86);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    padding: 0.35rem 0.55rem;
    white-space: nowrap;
  }
  .bac-bar-btn {
    display: flex;
    align-items: center;
    gap: 0.28rem;
    padding: 0.28rem 0.6rem;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(255,255,255,0.55);
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    font-family: inherit;
  }
  .bac-bar-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .bac-bar-btn.primary { background: #22c55e; color: #fff; border-color: rgba(34,197,94,0.4); }
  .bac-bar-btn.primary:hover { background: #16a34a; }
  .bac-bar-btn.danger { background: rgba(239,68,68,0.18); color: #f87171; border-color: rgba(239,68,68,0.25); }
  .bac-bar-btn.active { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.35); color: #4ade80; }
  .bac-bar-btn.warn  { background: rgba(234,179,8,0.15); border-color: rgba(234,179,8,0.3); color: #facc15; }
  .bac-bar-divider {
    width: 1px; height: 20px;
    background: rgba(255,255,255,0.1);
    margin: 0 0.1rem;
    flex-shrink: 0;
  }
  .bac-speed-control {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .bac-slider {
    width: 56px; height: 4px;
    cursor: pointer;
    accent-color: #22c55e;
  }
  .bac-speed-label {
    color: rgba(255,255,255,0.4);
    font-size: 0.68rem;
    font-family: monospace;
    min-width: 1.6rem;
    text-align: right;
  }

  /* ── popup panel ── */
  .bac-panel {
    position: absolute;
    bottom: 3.5rem;
    left: 0.75rem;
    z-index: 60;
    width: clamp(240px, 34vw, 380px);
    background: rgba(3,7,18,0.94);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(34,197,94,0.16);
    border-radius: 12px;
    overflow: hidden;
  }
  .bac-panel-header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-weight: 700;
    font-size: 0.82rem;
    color: #e2e8f0;
  }
  .bac-panel-close {
    margin-left: auto;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.35);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: all 0.15s;
  }
  .bac-panel-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .bac-panel-body {
    padding: 0.65rem 0.85rem;
    max-height: 48vh;
    overflow-y: auto;
  }
  .bac-panel-body::-webkit-scrollbar { width: 3px; }
  .bac-panel-body::-webkit-scrollbar-track { background: transparent; }
  .bac-panel-body::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.4); border-radius: 2px; }

  /* param rows */
  .bac-param-row { padding: 0.45rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .bac-param-row:last-child { border-bottom: none; }
  .bac-param-header {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 0.28rem;
  }
  .bac-param-val { color: #4ade80; font-weight: 700; font-family: monospace; }
  .bac-param-slider {
    width: 100%; height: 4px; accent-color: #22c55e; cursor: pointer; display: block;
  }
  .bac-param-slider:disabled { opacity: 0.45; cursor: not-allowed; }

  /* genetics — resistance histogram */
  .bac-hist { display: flex; align-items: flex-end; gap: 2px; height: 48px; margin-top: 0.4rem; }
  .bac-hist-bar {
    flex: 1; border-radius: 2px 2px 0 0; min-height: 2px;
    transition: height 0.3s;
  }
  .bac-hist-labels {
    display: flex; justify-content: space-between;
    font-size: 0.58rem; color: rgba(255,255,255,0.3);
    margin-top: 0.2rem;
  }

  /* stats grid */
  .bac-stats-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; margin-bottom: 0.65rem;
  }
  .bac-stat-card {
    padding: 0.55rem; background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;
  }
  .bac-stat-label {
    font-size: 0.62rem; color: #94a3b8; font-weight: 700; margin-bottom: 0.18rem;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .bac-stat-value { font-size: 1.25rem; font-weight: 800; line-height: 1; }
  .bac-stat-change { font-size: 0.62rem; color: #64748b; margin-top: 0.18rem; }

  /* zoom badge */
  .bac-zoom {
    position: absolute; bottom: 3.5rem; right: 0.75rem;
    background: rgba(0,0,0,0.65); padding: 0.18rem 0.45rem;
    border-radius: 8px; font-size: 0.65rem; font-family: monospace;
    color: #64748b; z-index: 40;
  }
`;

// ─── Mobile fullscreen overlay ─────────────────────────────────────────────────
const FullscreenOverlay = styled.div<{ $show: boolean }>`
  position: fixed; inset: 0; background: #030712;
  z-index: 10000; display: ${({ $show }) => ($show ? 'flex' : 'none')};
  flex-direction: column;
`;
const FullscreenCanvas = styled.canvas`
  width: 100%; height: 100%; cursor: grab; touch-action: none;
  &:active { cursor: grabbing; }
`;
const FullscreenControls = styled.div`
  position: absolute; bottom: calc(1.5rem + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem;
  background: rgba(0,0,0,0.95); padding: 0.75rem; border-radius: 999px;
  border: 1px solid rgba(34,197,94,0.4); z-index: 100;
`;
const FullscreenButton = styled.button<{ $primary?: boolean }>`
  width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer;
  background: ${({ $primary }) => ($primary ? '#16a34a' : 'rgba(51,65,85,0.8)')};
  color: white; display: flex; align-items: center; justify-content: center;
`;
const ExitButton = styled.button`
  position: absolute; top: calc(1rem + env(safe-area-inset-top)); right: 1rem;
  width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(34,197,94,0.4);
  background: rgba(0,0,0,0.9); color: white; display: flex; align-items: center;
  justify-content: center; cursor: pointer; z-index: 100;
`;

// ─── Simulation types ──────────────────────────────────────────────────────────
interface Bacterium {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  resistance: number; // 0.0 – 1.0
  energy: number;
  generation: number;
  age: number;
}

type SimMode = 'mega-plate' | 'uniform';

// MEGA-plate zone definitions (left → right = low → high antibiotic)
const ZONES = [
  { label: '0×',      minResist: 0.00, bg: 'rgba(59,130,246,0.05)'  },
  { label: '1×MIC',  minResist: 0.20, bg: 'rgba(16,185,129,0.06)' },
  { label: '10×MIC', minResist: 0.42, bg: 'rgba(234,179,8,0.07)'  },
  { label: '100×MIC',minResist: 0.65, bg: 'rgba(239,68,68,0.09)'  },
  { label: '1000×MIC',minResist: 0.87,bg: 'rgba(220,38,38,0.14)'  },
];

// Resistance → color (blue → cyan → green → yellow → red)
function resistColor(r: number): string {
  const stops: [number, number, number][] = [
    [59, 130, 246],   // 0.0 blue
    [6,  182, 212],   // 0.25 cyan
    [34, 197, 94],    // 0.5 green
    [234,179, 8],     // 0.75 yellow
    [239, 68, 68],    // 1.0 red
  ];
  const t = Math.max(0, Math.min(1, r)) * (stops.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = stops[Math.min(i, stops.length - 1)];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  return `rgb(${Math.round(a[0]+f*(b[0]-a[0]))},${Math.round(a[1]+f*(b[1]-a[1]))},${Math.round(a[2]+f*(b[2]-a[2]))})`;
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface BacteriaSimProps {
  isDark?: boolean;
  initialRunning?: boolean;
  initialSpeed?: number;
  isTheaterMode?: boolean;
}

export default function AdvancedBacteremiaSimulator({
  isDark = false,
  initialRunning = false,
  initialSpeed = 1,
  isTheaterMode = false,
}: BacteriaSimProps) {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const theaterCanvasRef = useRef<HTMLCanvasElement>(null);
  const bacteriaRef     = useRef<Bacterium[]>([]);
  const nextIdRef       = useRef(0);

  const PHYSICS_W = 1200;
  const PHYSICS_H = 675;
  const MAX_POP   = 1400;

  // ── Animation timing
  const animRef       = useRef<number | null>(null);
  const lastTimeRef   = useRef<number | null>(null);
  const accumRef      = useRef(0);
  const SIM_STEP_MS   = 1000 / 30; // 30 ticks/s
  const lastRenderRef = useRef<number | null>(null);
  const TARGET_FRAME_MS = 1000 / 60;

  // ── Hot-path refs
  const isRunningRef      = useRef(false);
  const speedRef          = useRef(initialSpeed);
  const simModeRef        = useRef<SimMode>('mega-plate');
  const antibioticOnRef   = useRef(true);
  const mutationRateRef   = useRef(0.018);
  const abStrengthRef     = useRef(5);

  // ── State (UI)
  const [isRunning,     setIsRunning]    = useState(false);
  const [speed,         setSpeed]        = useState(initialSpeed);
  const [simMode,       setSimMode]      = useState<SimMode>('mega-plate');
  const [antibioticOn,  setAntibioticOn] = useState(true);
  const [mutationRate,  setMutationRate] = useState(0.018);
  const [abStrength,    setAbStrength]   = useState(5);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [activePanel,   setActivePanel]  = useState<'none'|'parameters'|'genetics'|'statistics'>('none');
  const [hudVisible,    setHudVisible]   = useState(true);
  const [zoomLevel,     setZoomLevel]    = useState(1);

  // ── Stats
  const statsRef = useRef({ total: 0, maxRes: 0, generation: 0, mutations: 0, colonized: 0 });
  const [stats, setStats] = useState(statsRef.current);
  const totalMutRef = useRef(0);
  const maxGenRef   = useRef(0);
  const tickRef     = useRef(0);

  // ── History (for chart + histogram)
  const historyRef  = useRef<{ t: number; total: number; zones: number[] }[]>([]);
  const [history,   setHistory]   = useState<typeof historyRef.current>([]);
  const [histogram, setHistogram] = useState<number[]>(new Array(10).fill(0));

  // Keep refs in sync
  useEffect(() => { isRunningRef.current    = isRunning;    }, [isRunning]);
  useEffect(() => { speedRef.current        = speed;        }, [speed]);
  useEffect(() => { simModeRef.current      = simMode;      }, [simMode]);
  useEffect(() => { antibioticOnRef.current = antibioticOn; }, [antibioticOn]);
  useEffect(() => { mutationRateRef.current = mutationRate; }, [mutationRate]);
  useEffect(() => { abStrengthRef.current   = abStrength;   }, [abStrength]);

  // Prop sync
  useEffect(() => { setIsRunning(initialRunning); }, [initialRunning]);
  useEffect(() => { setSpeed(initialSpeed);       }, [initialSpeed]);

  // ── Pan / zoom
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const zoomLevelRef = useRef(1);
  const [isPanning,   setIsPanning]   = useState(false);
  const panStartRef   = useRef({ x: 0, y: 0 });
  const touchDistRef  = useRef(0);
  const lastZoomRef   = useRef(1);

  // ── Init bacteria
  const initBacteria = useCallback(() => {
    nextIdRef.current  = 0;
    totalMutRef.current = 0;
    maxGenRef.current   = 0;
    historyRef.current  = [];
    tickRef.current     = 0;

    const bac: Bacterium[] = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      bac.push({
        id:         nextIdRef.current++,
        x:          Math.random() * PHYSICS_W * 0.18,
        y:          Math.random() * PHYSICS_H,
        vx:         (Math.random() - 0.5) * 2,
        vy:         (Math.random() - 0.5) * 2,
        resistance: Math.random() * 0.08,
        energy:     Math.random(),
        generation: 0,
        age:        0,
      });
    }
    bacteriaRef.current = bac;
    setHistory([]);
    setStats({ total: count, maxRes: 0, generation: 0, mutations: 0, colonized: 1 });
  }, []);

  const resetView = useCallback(() => {
    panOffsetRef.current = { x: 0, y: 0 };
    zoomLevelRef.current = 1;
    setZoomLevel(1);
  }, []);

  // ── Core update (hot path — no state reads)
  const updateFixed = useCallback(() => {
    const bac       = bacteriaRef.current;
    const mRate     = mutationRateRef.current;
    const abOn      = antibioticOnRef.current;
    const abStr     = abStrengthRef.current;
    const mode      = simModeRef.current;
    const spd       = speedRef.current;
    const W         = PHYSICS_W;
    const H         = PHYSICS_H;

    const survivors: Bacterium[] = [];
    const newBac:    Bacterium[] = [];
    let mutations = 0;
    let maxGen = maxGenRef.current;

    for (let bi = 0; bi < bac.length; bi++) {
      const b = bac[bi];

      // Random walk
      b.vx += (Math.random() - 0.5) * 0.7 * spd;
      b.vy += (Math.random() - 0.5) * 0.7 * spd;
      const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      const maxS = 2.8 * spd;
      if (s > maxS) { b.vx = b.vx / s * maxS; b.vy = b.vy / s * maxS; }
      b.x += b.vx; b.y += b.vy;
      if (b.x < 2) { b.x = 2; b.vx = Math.abs(b.vx); }
      if (b.x > W - 2) { b.x = W - 2; b.vx = -Math.abs(b.vx); }
      if (b.y < 2) { b.y = 2; b.vy = Math.abs(b.vy); }
      if (b.y > H - 2) { b.y = H - 2; b.vy = -Math.abs(b.vy); }
      b.age++;

      // Antibiotic killing
      let dead = false;
      if (abOn) {
        let minResist = 0;
        if (mode === 'mega-plate') {
          const zi = Math.min(Math.floor(b.x / (W / ZONES.length)), ZONES.length - 1);
          minResist = ZONES[zi].minResist;
        } else {
          minResist = abStr * 0.09;
        }
        if (b.resistance < minResist) {
          const deficit  = minResist - b.resistance;
          const killProb = Math.min(0.11 * deficit * abStr, 0.28);
          if (Math.random() < killProb) dead = true;
        }
      }
      if (!dead && b.age > 700 + Math.random() * 500) dead = true;
      if (dead) continue;

      // Energy + replication
      b.energy += 0.009 + Math.random() * 0.005;
      if (b.energy >= 1.0 && survivors.length + bac.length + newBac.length < MAX_POP) {
        b.energy = 0.05;
        let childRes = b.resistance + (Math.random() - 0.5) * 2 * mRate;
        childRes = Math.max(0, Math.min(1, childRes));
        if (Math.abs(childRes - b.resistance) > mRate * 0.4) mutations++;
        const child: Bacterium = {
          id:         nextIdRef.current++,
          x:          b.x + (Math.random() - 0.5) * 5,
          y:          b.y + (Math.random() - 0.5) * 5,
          vx:         (Math.random() - 0.5) * 2,
          vy:         (Math.random() - 0.5) * 2,
          resistance: childRes,
          energy:     0.1 + Math.random() * 0.2,
          generation: b.generation + 1,
          age:        0,
        };
        if (child.generation > maxGen) maxGen = child.generation;
        newBac.push(child);
      }

      survivors.push(b);
    }

    bacteriaRef.current = [...survivors, ...newBac];
    totalMutRef.current += mutations;
    maxGenRef.current    = maxGen;
    tickRef.current++;
  }, []);

  // ── Render
  const render = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const mode  = simModeRef.current;
    const abOn  = antibioticOnRef.current;
    const bac   = bacteriaRef.current;
    const scaleX = W / PHYSICS_W;
    const scaleY = H / PHYSICS_H;
    const zoneW  = W / ZONES.length;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Zone backgrounds
    if (mode === 'mega-plate' && abOn) {
      ZONES.forEach((zone, i) => {
        ctx.fillStyle = zone.bg;
        ctx.fillRect(i * zoneW, 0, zoneW, H);
        // Divider
        if (i > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.035)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.moveTo(i * zoneW, 0);
          ctx.lineTo(i * zoneW, H);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Zone label
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.font = `${Math.max(9, Math.round(W * 0.009))}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(zone.label, i * zoneW + zoneW / 2, H - 6);
      });
    } else if (mode === 'uniform' && abOn) {
      ctx.fillStyle = 'rgba(239,68,68,0.055)';
      ctx.fillRect(0, 0, W, H);
    }

    // Bacteria
    for (const b of bac) {
      const sx = b.x * scaleX;
      const sy = b.y * scaleY;
      ctx.fillStyle = resistColor(b.resistance);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // ── Sync stats to state
  const syncStats = useCallback(() => {
    const bac = bacteriaRef.current;
    let maxRes = 0;
    const colonized = new Set<number>();
    const hist = new Array(10).fill(0);
    for (const b of bac) {
      if (b.resistance > maxRes) maxRes = b.resistance;
      const zi = Math.min(Math.floor(b.x / (PHYSICS_W / ZONES.length)), ZONES.length - 1);
      colonized.add(zi);
      const bucket = Math.min(Math.floor(b.resistance * 10), 9);
      hist[bucket]++;
    }
    const s = {
      total:     bac.length,
      maxRes,
      generation: maxGenRef.current,
      mutations:  totalMutRef.current,
      colonized:  colonized.size,
    };
    statsRef.current = s;
    setStats(s);
    setHistogram(hist);
  }, []);

  // ── Animation loop
  useEffect(() => {
    let frameId: number;
    const loop = (time: number) => {
      if (!isRunningRef.current) {
        frameId = requestAnimationFrame(loop);
        return;
      }
      if (lastTimeRef.current === null) {
        lastTimeRef.current   = time;
        lastRenderRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accumRef.current += delta;

      let steps = 0;
      while (accumRef.current >= SIM_STEP_MS) {
        updateFixed();
        accumRef.current -= SIM_STEP_MS;
        if (++steps > 8) { accumRef.current = 0; break; }
      }

      if (lastRenderRef.current === null || time - lastRenderRef.current >= TARGET_FRAME_MS) {
        lastRenderRef.current = time;
        const canvas = isMobileFullscreen ? theaterCanvasRef.current : canvasRef.current;
        render(canvas);
        syncStats();

        // Record history every 30 ticks
        if (tickRef.current % 30 === 0) {
          const bac = bacteriaRef.current;
          const zones = new Array(ZONES.length).fill(0);
          for (const b of bac) {
            const zi = Math.min(Math.floor(b.x / (PHYSICS_W / ZONES.length)), ZONES.length - 1);
            zones[zi]++;
          }
          historyRef.current = [...historyRef.current.slice(-120), {
            t: tickRef.current, total: bac.length, zones,
          }];
          setHistory([...historyRef.current]);
        }
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
      lastTimeRef.current   = null;
      accumRef.current      = 0;
      lastRenderRef.current = null;
    };
  }, [updateFixed, render, syncStats, isMobileFullscreen]);

  // ── Main canvas sizing
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta  = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevelRef.current * delta));
    zoomLevelRef.current = newZoom;
    setZoomLevel(newZoom);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr  = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // ── Mobile fullscreen canvas sizing
  useEffect(() => {
    if (!isMobileFullscreen) return;
    const canvas = theaterCanvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isMobileFullscreen]);

  // ── Init on mount / param change
  useEffect(() => {
    initBacteria();
    setTimeout(() => render(canvasRef.current), 50);
  }, [initBacteria]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    initBacteria();
    resetView();
  }, [initBacteria, resetView]);

  // ── Mouse / touch handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y };
  }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const np = { x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y };
    panOffsetRef.current = np;
  }, [isPanning]);
  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchDistRef.current = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      lastZoomRef.current  = zoomLevelRef.current;
    } else {
      setIsPanning(true);
      panStartRef.current = { x: e.touches[0].clientX - panOffsetRef.current.x, y: e.touches[0].clientY - panOffsetRef.current.y };
    }
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      const nz   = Math.max(0.5, Math.min(3, lastZoomRef.current * (dist / (touchDistRef.current || 1))));
      zoomLevelRef.current = nz; setZoomLevel(nz);
    } else if (isPanning) {
      panOffsetRef.current = { x: e.touches[0].clientX - panStartRef.current.x, y: e.touches[0].clientY - panStartRef.current.y };
    }
  }, [isPanning]);
  const handleTouchEnd = useCallback(() => { setIsPanning(false); touchDistRef.current = 0; }, []);

  // ── Chart data
  const chartData = {
    labels: history.map(d => `T${d.t}`),
    datasets: [
      { label: 'Total', data: history.map(d => d.total), borderColor: '#22c55e', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.4 },
      { label: 'Zone 1+', data: history.map(d => (d.zones[1] || 0) + (d.zones[2] || 0) + (d.zones[3] || 0) + (d.zones[4] || 0)), borderColor: '#eab308', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.4 },
      { label: 'Zone 3+', data: history.map(d => (d.zones[3] || 0) + (d.zones[4] || 0)), borderColor: '#ef4444', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.4 },
    ],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const, labels: { boxWidth: 10, padding: 8, font: { size: 9 }, color: '#94a3b8' } } },
    scales: {
      x: { display: false },
      y: { display: true, beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', font: { size: 9 } } },
    },
    animation: { duration: 0 },
  };

  // ── Histogram max
  const histMax = Math.max(1, ...histogram);

  // Resistance bucket colors
  const bucketColors = [
    '#3b82f6','#1e9fce','#0cb6d4','#0ec9a0','#22c55e',
    '#84cc16','#eab308','#f97316','#ef4444','#dc2626',
  ];

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <>
      <BacteriaOverlayStyles />

      <div className={`bac-root${isTheaterMode ? ' theater' : ''}`}>

        {/* Canvas */}
        <canvas
          className="bac-canvas"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Top-left: mode chips */}
        <div className="bac-mode-switcher">
          {(['mega-plate', 'uniform'] as SimMode[]).map(m => (
            <button
              key={m}
              className={`bac-mode-btn${simMode === m ? ' active' : ''}`}
              onClick={() => { setSimMode(m); handleReset(); }}
            >
              {m === 'mega-plate' ? <><FlaskConical size={11} /> MEGA Plate</> : <><Zap size={11} /> Uniform</>}
            </button>
          ))}
        </div>

        {/* Top-right: HUD toggle */}
        <div className="bac-top-right">
          <button
            className={`bac-icon-btn${hudVisible ? ' active' : ''}`}
            onClick={() => setHudVisible(v => !v)}
            title="Toggle HUD"
          >
            <Activity size={15} />
          </button>
        </div>

        {/* HUD */}
        {hudVisible && (
          <div className="bac-hud">
            <div className="bac-hud-title">
              <span style={{ color: '#22c55e' }}>🦠</span> Evolution
            </div>
            <div className="bac-hud-divider" />
            <div className="bac-hud-row">
              <span>Population</span>
              <span style={{ color: '#4ade80', fontWeight: 700 }}>{stats.total}</span>
            </div>
            <div className="bac-hud-row">
              <span>Max Resistance</span>
              <span style={{ color: resistColor(stats.maxRes), fontWeight: 700 }}>
                {(stats.maxRes * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bac-hud-row">
              <span>Generation</span>
              <span style={{ color: '#a78bfa', fontWeight: 700 }}>{stats.generation}</span>
            </div>
            <div className="bac-hud-divider" />
            <div className="bac-hud-row">
              <span>Zones colonised</span>
              <span style={{ color: '#facc15', fontWeight: 700 }}>{stats.colonized} / {ZONES.length}</span>
            </div>
            <div className="bac-hud-row">
              <span>Mutations</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{stats.mutations.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Resistance legend */}
        <div className="bac-legend">
          <span>Sensitive</span>
          <div className="bac-legend-bar" />
          <span>Resistant</span>
        </div>

        {/* Bottom pill bar */}
        <div className="bac-bottom-bar">
          <button
            className={`bac-bar-btn${isRunning ? ' danger' : ' primary'}`}
            onClick={() => setIsRunning(v => !v)}
          >
            {isRunning ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
            {isRunning ? 'Pause' : 'Evolve'}
          </button>

          <button className="bac-bar-btn" onClick={handleReset}>
            <RefreshCw size={14} /> Reset
          </button>

          <div className="bac-bar-divider" />

          <button
            className={`bac-bar-btn${antibioticOn ? ' warn' : ''}`}
            onClick={() => setAntibioticOn(v => !v)}
          >
            <FlaskConical size={14} />
            {antibioticOn ? 'Antibiotic ON' : 'Antibiotic OFF'}
          </button>

          <div className="bac-bar-divider" />

          <div className="bac-speed-control">
            <span className="bac-speed-label">{speed}×</span>
            <input
              type="range" className="bac-slider"
              min={1} max={5} step={1} value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
            />
          </div>

          <div className="bac-bar-divider" />

          <button
            className={`bac-bar-btn${activePanel === 'parameters' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'parameters' ? 'none' : 'parameters')}
          >
            <Settings size={14} /> Params
          </button>

          <button
            className={`bac-bar-btn${activePanel === 'genetics' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'genetics' ? 'none' : 'genetics')}
          >
            <Dna size={14} /> Genetics
          </button>

          <button
            className={`bac-bar-btn${activePanel === 'statistics' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'statistics' ? 'none' : 'statistics')}
          >
            <BarChart3 size={14} /> Stats
          </button>
        </div>

        {/* Parameters panel */}
        {activePanel === 'parameters' && (
          <div className="bac-panel">
            <div className="bac-panel-header">
              <Settings size={15} /> Parameters
              <button className="bac-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="bac-panel-body">
              <div className="bac-param-row">
                <div className="bac-param-header">
                  <span>Mutation Rate</span>
                  <span className="bac-param-val">{(mutationRate * 100).toFixed(1)}%</span>
                </div>
                <input type="range" className="bac-param-slider"
                  min={0.002} max={0.08} step={0.002} value={mutationRate}
                  onChange={e => setMutationRate(Number(e.target.value))} />
              </div>
              <div className="bac-param-row">
                <div className="bac-param-header">
                  <span>Antibiotic Strength</span>
                  <span className="bac-param-val">{abStrength}×</span>
                </div>
                <input type="range" className="bac-param-slider"
                  min={1} max={10} step={1} value={abStrength}
                  onChange={e => setAbStrength(Number(e.target.value))} disabled={!antibioticOn} />
              </div>
              <div className="bac-param-row" style={{ paddingTop: '0.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>Tip: </span>
                Turn off antibiotic to watch unconstrained growth, then turn it back on to see natural selection eliminate sensitive strains.
              </div>
            </div>
          </div>
        )}

        {/* Genetics panel — resistance histogram */}
        {activePanel === 'genetics' && (
          <div className="bac-panel">
            <div className="bac-panel-header">
              <Dna size={15} /> Resistance Distribution
              <button className="bac-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="bac-panel-body">
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                Population by resistance level ({stats.total} bacteria)
              </div>
              <div className="bac-hist">
                {histogram.map((count, i) => (
                  <div
                    key={i}
                    className="bac-hist-bar"
                    style={{
                      height: `${Math.round((count / histMax) * 100)}%`,
                      background: bucketColors[i],
                      opacity: 0.85,
                    }}
                    title={`${(i * 10)}–${(i + 1) * 10}%: ${count}`}
                  />
                ))}
              </div>
              <div className="bac-hist-labels">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>

              <div style={{ marginTop: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {[
                  { label: 'Sensitive (0–20%)', count: histogram.slice(0,2).reduce((a,b)=>a+b,0), color: '#3b82f6' },
                  { label: 'Low resist (20–40%)', count: histogram.slice(2,4).reduce((a,b)=>a+b,0), color: '#06b6d4' },
                  { label: 'Mid resist (40–60%)', count: histogram.slice(4,6).reduce((a,b)=>a+b,0), color: '#22c55e' },
                  { label: 'High resist (60–80%)', count: histogram.slice(6,8).reduce((a,b)=>a+b,0), color: '#eab308' },
                  { label: 'Super-resistant (80+%)', count: histogram.slice(8).reduce((a,b)=>a+b,0), color: '#ef4444' },
                ].map(row => (
                  <div key={row.label} style={{ padding: '0.35rem 0.45rem', background: 'rgba(0,0,0,0.35)', borderRadius: '6px', border: `1px solid ${row.color}25` }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.1rem' }}>{row.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: row.color }}>{row.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Statistics panel */}
        {activePanel === 'statistics' && (
          <div className="bac-panel">
            <div className="bac-panel-header">
              <BarChart3 size={15} /> Statistics
              <button className="bac-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="bac-panel-body">
              <div className="bac-stats-grid">
                <div className="bac-stat-card">
                  <div className="bac-stat-label">Population</div>
                  <div className="bac-stat-value" style={{ color: '#4ade80' }}>{stats.total}</div>
                  <div className="bac-stat-change">of {MAX_POP} max</div>
                </div>
                <div className="bac-stat-card">
                  <div className="bac-stat-label">Max Resistance</div>
                  <div className="bac-stat-value" style={{ color: resistColor(stats.maxRes) }}>
                    {(stats.maxRes * 100).toFixed(0)}%
                  </div>
                  <div className="bac-stat-change">{ZONES.filter(z => z.minResist <= stats.maxRes).length} zones reachable</div>
                </div>
                <div className="bac-stat-card">
                  <div className="bac-stat-label">Generations</div>
                  <div className="bac-stat-value" style={{ color: '#a78bfa' }}>{stats.generation}</div>
                  <div className="bac-stat-change">max lineage depth</div>
                </div>
                <div className="bac-stat-card">
                  <div className="bac-stat-label">Mutations</div>
                  <div className="bac-stat-value" style={{ color: '#f87171' }}>{stats.mutations.toLocaleString()}</div>
                  <div className="bac-stat-change">total events</div>
                </div>
              </div>
              <div style={{ height: '130px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '0.5rem', border: '1px solid rgba(34,197,94,0.1)' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                Green = total · Yellow = in antibiotic zones · Red = high-resistance zones
              </div>
            </div>
          </div>
        )}

        {/* Zoom badge */}
        <div className="bac-zoom">{(zoomLevel * 100).toFixed(0)}%</div>
      </div>

      {/* ── Mobile fullscreen overlay ── */}
      <FullscreenOverlay $show={isMobileFullscreen}>
        <FullscreenCanvas
          ref={theaterCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <div style={{
          position: 'absolute', top: '1rem', left: '1rem', zIndex: 50,
          background: 'rgba(3,7,18,0.82)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(34,197,94,0.18)', borderRadius: '10px',
          padding: '0.6rem 0.75rem', fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', minWidth: '140px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '0.35rem' }}>
            🦠 Generation {stats.generation}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
            <span>Population</span><span style={{ color: '#4ade80', fontWeight: 700 }}>{stats.total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
            <span>Max Resist</span><span style={{ color: resistColor(stats.maxRes), fontWeight: 700 }}>{(stats.maxRes * 100).toFixed(0)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.2rem', paddingTop: '0.3rem' }}>
            <span>Zones</span><span style={{ color: '#facc15', fontWeight: 700 }}>{stats.colonized}/{ZONES.length}</span>
          </div>
        </div>
        <FullscreenControls>
          <FullscreenButton $primary onClick={() => setIsRunning(v => !v)}>
            {isRunning ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
          </FullscreenButton>
          <FullscreenButton onClick={handleReset}><RefreshCw size={20} /></FullscreenButton>
        </FullscreenControls>
        <ExitButton onClick={() => { setIsMobileFullscreen(false); setIsRunning(false); }}>
          <X size={20} />
        </ExitButton>
      </FullscreenOverlay>
    </>
  );
}
