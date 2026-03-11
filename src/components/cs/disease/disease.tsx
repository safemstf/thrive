'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  PlayCircle, PauseCircle, RefreshCw, Shield, Users, Heart,
  BarChart3, Settings, Zap, Home, Building2, Bug,
  Activity, Network, ChevronUp, ChevronDown,
  X
} from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import styled, { createGlobalStyle } from 'styled-components';
import { DISEASE_PROFILES, type Agent, type SimulationMode } from './disease.types';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// ─── NBody-style overlay styles ──────────────────────────────────────────────
const DiseaseOverlayStyles = createGlobalStyle`
  .dis-root {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 65vh;
    background: #0a0e1a;
    border-radius: 12px;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }
  .dis-root.theater {
    aspect-ratio: unset;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
  }
  .dis-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
    display: block;
  }
  .dis-canvas:active { cursor: grabbing; }

  /* ── top-left disease chips ── */
  .dis-model-switcher {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 50;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    max-width: calc(100% - 6rem);
  }
  .dis-model-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.6rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.62);
    color: rgba(255,255,255,0.65);
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    font-family: inherit;
  }
  .dis-model-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .dis-model-btn.active {
    border-color: var(--dis-color, #3b82f6);
    background: color-mix(in srgb, var(--dis-color, #3b82f6) 20%, rgba(0,0,0,0.6));
    color: #fff;
  }
  .dis-model-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── top-right icon buttons ── */
  .dis-top-right {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 50;
    display: flex;
    gap: 0.3rem;
  }
  .dis-icon-btn {
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
  .dis-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .dis-icon-btn.active {
    background: rgba(59,130,246,0.2);
    border-color: rgba(59,130,246,0.5);
    color: #3b82f6;
  }

  /* ── HUD panel (top-right stats) ── */
  .dis-hud {
    position: absolute;
    top: 3rem;
    right: 0.75rem;
    z-index: 40;
    min-width: 145px;
    background: rgba(5,8,18,0.82);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
    font-size: 0.73rem;
    color: rgba(255,255,255,0.55);
  }
  .dis-hud-title {
    font-weight: 700;
    font-size: 0.78rem;
    color: #e2e8f0;
    margin-bottom: 0.45rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .dis-hud-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.13rem 0;
    gap: 0.6rem;
  }
  .dis-hud-divider {
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 0.3rem 0;
  }

  /* ── bottom pill bar ── */
  .dis-bottom-bar {
    position: absolute;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: rgba(4,7,16,0.84);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 999px;
    padding: 0.35rem 0.55rem;
    white-space: nowrap;
  }
  .dis-bar-btn {
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
  .dis-bar-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .dis-bar-btn.primary { background: #3b82f6; color: #fff; border-color: rgba(59,130,246,0.4); }
  .dis-bar-btn.primary:hover { background: #2563eb; }
  .dis-bar-btn.danger { background: rgba(239,68,68,0.18); color: #f87171; border-color: rgba(239,68,68,0.25); }
  .dis-bar-btn.active { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.35); color: #a5b4fc; }
  .dis-bar-divider {
    width: 1px; height: 20px;
    background: rgba(255,255,255,0.1);
    margin: 0 0.1rem;
    flex-shrink: 0;
  }
  .dis-speed-control {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .dis-slider {
    width: 56px; height: 4px;
    cursor: pointer;
    accent-color: #3b82f6;
  }
  .dis-speed-label {
    color: rgba(255,255,255,0.45);
    font-size: 0.68rem;
    font-family: monospace;
    min-width: 1.6rem;
    text-align: right;
  }

  /* ── popup panel (bottom-left) ── */
  .dis-panel {
    position: absolute;
    bottom: 3.5rem;
    left: 0.75rem;
    z-index: 60;
    width: clamp(240px, 34vw, 380px);
    background: rgba(6,10,22,0.93);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(59,130,246,0.18);
    border-radius: 12px;
    overflow: hidden;
  }
  .dis-panel-header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-weight: 700;
    font-size: 0.82rem;
    color: #e2e8f0;
  }
  .dis-panel-close {
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
  .dis-panel-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .dis-panel-body {
    padding: 0.6rem 0.85rem;
    max-height: 48vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .dis-panel-body::-webkit-scrollbar { width: 3px; }
  .dis-panel-body::-webkit-scrollbar-track { background: transparent; }
  .dis-panel-body::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.4); border-radius: 2px; }

  /* param rows */
  .dis-param-row {
    padding: 0.45rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .dis-param-row:last-child { border-bottom: none; }
  .dis-param-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
    margin-bottom: 0.28rem;
  }
  .dis-param-val { color: #3b82f6; font-weight: 700; font-family: monospace; }
  .dis-param-slider {
    width: 100%; height: 4px;
    accent-color: #3b82f6;
    cursor: pointer;
    display: block;
  }
  .dis-param-slider:disabled { opacity: 0.45; cursor: not-allowed; }
  .dis-param-select {
    width: 100%;
    margin-top: 0.28rem;
    padding: 0.35rem 0.45rem;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.22);
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 0.75rem;
    cursor: pointer;
    font-family: inherit;
  }
  .dis-param-select:disabled { opacity: 0.45; cursor: not-allowed; }

  /* intervention grid */
  .dis-intervention-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem;
  }
  .dis-intervention-card {
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(0,0,0,0.38);
    color: #e2e8f0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
    transition: all 0.15s;
    font-family: inherit;
  }
  .dis-intervention-card:hover { background: rgba(255,255,255,0.05); }
  .dis-intervention-card.active { background: rgba(59,130,246,0.1); }
  .dis-intervention-icon { display: flex; font-size: 1.1rem; }
  .dis-intervention-name { font-size: 0.7rem; font-weight: 700; }
  .dis-intervention-efficacy { font-size: 0.62rem; color: #94a3b8; }

  /* stats grid */
  .dis-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem;
    margin-bottom: 0.65rem;
  }
  .dis-stat-card {
    padding: 0.55rem;
    background: rgba(0,0,0,0.38);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px;
  }
  .dis-stat-label {
    font-size: 0.62rem;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 0.18rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .dis-stat-value { font-size: 1.25rem; font-weight: 800; line-height: 1; }
  .dis-stat-change { font-size: 0.62rem; color: #64748b; margin-top: 0.18rem; }

  /* zoom badge */
  .dis-zoom {
    position: absolute;
    bottom: 3.5rem;
    right: 0.75rem;
    background: rgba(0,0,0,0.65);
    padding: 0.18rem 0.45rem;
    border-radius: 8px;
    font-size: 0.65rem;
    font-family: monospace;
    color: #64748b;
    z-index: 40;
  }
`;

// ─── Mobile fullscreen overlay ────────────────────────────────────────────────

const FullscreenOverlay = styled.div<{ $show: boolean }>`
  position: fixed;
  inset: 0;
  background: #0a0e1a;
  z-index: 10000;
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  flex-direction: column;
`;

const FullscreenCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
  
  &:active {
    cursor: grabbing;
  }
`;

const FullscreenControls = styled.div`
  position: absolute;
  bottom: calc(1.5rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(0,0,0,0.95);
  padding: 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(59,130,246,0.5);
  z-index: 100;
`;

const FullscreenButton = styled.button<{ $primary?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${({ $primary }) => ($primary ? '#6366f1' : 'rgba(51,65,85,0.8)')};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExitButton = styled.button`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(59,130,246,0.5);
  z-index: 100;
`;


interface DiseaseSimulationProps {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
  isTheaterMode?: boolean;
}

export default function DiseaseSimulation({
  isDark = false,
  isRunning: isRunningProp = false,
  speed: speedProp = 1,
  isTheaterMode = false
}: DiseaseSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theaterCanvasRef = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const animationRef = useRef<number | null>(null);
  const networkConnections = useRef<Map<number, Set<number>>>(new Map());
  const ticksPerDay = 30;

  // ===== PERFORMANCE FIX: Use refs for values that change every tick =====
  const tickCountRef = useRef(0);
  const statsRef = useRef({
    S: 0, E: 0, I: 0, R: 0, D: 0, V: 0,
    rt: 0, day: 0, newCases: 0, totalCases: 0, peakInfected: 0
  });
  const historyRef = useRef<any[]>([]);

  // ===== Timing refs for fixed-step sim + capped render =====
  const TARGET_FPS = 60;
  const TARGET_FRAME_MS = 1000 / TARGET_FPS;
  const SIM_TPS = 30;
  const SIM_STEP_MS = 1000 / SIM_TPS;
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);
  const lastRenderRef = useRef<number | null>(null);

  // Pan & Zoom refs (avoid state where possible in hot path)
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const zoomLevelRef = useRef(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchStartDistanceRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(1);

  // UI State (these are fine as useState - they don't change every frame)
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('covid19');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('homogeneous');
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'parameters' | 'interventions' | 'statistics'>('none');
  const [hudVisible, setHudVisible] = useState(true);

  const disease = DISEASE_PROFILES[selectedDisease];

  // Parameters
  const [population, setPopulation] = useState(800);
  const [initialInfected, setInitialInfected] = useState(3);
  const [vaccinationRate, setVaccinationRate] = useState(0);

  // Interventions - use refs to avoid callback recreation
  const [socialDistancing, setSocialDistancing] = useState(false);
  const [vaccination, setVaccination] = useState(false);
  const [quarantine, setQuarantine] = useState(false);
  const [maskWearing, setMaskWearing] = useState(false);
  
  // Refs for intervention values (read in update loop)
  const socialDistancingRef = useRef(false);
  const quarantineRef = useRef(false);
  const maskWearingRef = useRef(false);
  const speedRef = useRef(1);
  const isRunningRef = useRef(false);
  const diseaseRef = useRef(disease);

  // Keep refs in sync with state
  useEffect(() => { socialDistancingRef.current = socialDistancing; }, [socialDistancing]);
  useEffect(() => { quarantineRef.current = quarantine; }, [quarantine]);
  useEffect(() => { maskWearingRef.current = maskWearing; }, [maskWearing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { diseaseRef.current = disease; }, [disease]);

  // Statistics state (for UI display only)
  const [stats, setStats] = useState({
    S: 0, E: 0, I: 0, R: 0, D: 0, V: 0,
    rt: 0, day: 0, newCases: 0, totalCases: 0, peakInfected: 0
  });

  // FIXED PHYSICS WORLD
  const PHYSICS_WIDTH = 1200;
  const PHYSICS_HEIGHT = 1000;

  // Generate spatial network
  const generateSpatialNetwork = (agentList: Agent[], width: number, height: number) => {
    const connections = new Map<number, Set<number>>();
    const numClusters = 6;
    const clusters: { x: number; y: number; members: number[] }[] = [];

    for (let i = 0; i < numClusters; i++) {
      clusters.push({ x: Math.random() * width, y: Math.random() * height, members: [] });
    }

    agentList.forEach((agent, idx) => {
      const distances = clusters.map(c => Math.sqrt((agent.x - c.x) ** 2 + (agent.y - c.y) ** 2));
      const closest = distances.indexOf(Math.min(...distances));
      clusters[closest].members.push(idx);
      agent.region = closest;
    });

    clusters.forEach(cluster => {
      cluster.members.forEach(i => {
        if (!connections.has(i)) connections.set(i, new Set());
        const numConnections = 3 + Math.floor(Math.random() * 5);
        for (let j = 0; j < numConnections && j < cluster.members.length; j++) {
          const target = cluster.members[Math.floor(Math.random() * cluster.members.length)];
          if (target !== i) {
            connections.get(i)!.add(target);
            if (!connections.has(target)) connections.set(target, new Set());
            connections.get(target)!.add(i);
          }
        }
      });
    });

    return connections;
  };

  // Update stats using refs (no state dependency)
  const updateStats = useCallback((agentList: Agent[]) => {
    const counts = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0 } as any;
    let newCases = 0;
    const currentTick = tickCountRef.current;

    for (const a of agentList) {
      counts[a.state]++;
      if (a.infectionTime === currentTick) newCases++;
    }

    const totalCases = counts.I + counts.R + counts.D;
    const peakInfected = Math.max(statsRef.current.peakInfected, counts.I);
    const d = diseaseRef.current;
    const rt = counts.I > 0 ? (newCases / counts.I) * d.infectiousDays.mean : 0;

    const newStats = {
      ...counts,
      rt,
      day: Math.floor(currentTick / ticksPerDay),
      newCases,
      totalCases,
      peakInfected
    };

    statsRef.current = newStats;
  }, []);

  // Initialize agents
  const initAgents = useCallback(() => {
    const width = PHYSICS_WIDTH;
    const height = PHYSICS_HEIGHT;
    const newAgents: Agent[] = [];

    for (let i = 0; i < population; i++) {
      newAgents.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        state: "S",
        timer: 0,
        immunity: 0,
        region: Math.floor(Math.random() * 6)
      });
    }

    const infected = new Set<number>();
    while (infected.size < Math.min(initialInfected, newAgents.length)) {
      const idx = Math.floor(Math.random() * newAgents.length);
      if (!infected.has(idx)) {
        newAgents[idx].state = "I";
        newAgents[idx].timer = disease.infectiousDays.mean * ticksPerDay;
        newAgents[idx].infectionTime = 0;
        infected.add(idx);
      }
    }

    if (vaccination && vaccinationRate > 0) {
      const numToVaccinate = Math.floor(population * vaccinationRate);
      let vaccinated = 0;
      for (const agent of newAgents) {
        if (vaccinated >= numToVaccinate) break;
        if (agent.state === "S") {
          agent.state = "V";
          agent.immunity = disease.interventions.vaccination?.efficacy || 0.85;
          vaccinated++;
        }
      }
    }

    if (simulationMode === 'regions') {
      networkConnections.current = generateSpatialNetwork(newAgents, width, height);
    }

    agents.current = newAgents;
    historyRef.current = [];
    tickCountRef.current = 0;
    statsRef.current = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0, rt: 0, day: 0, newCases: 0, totalCases: 0, peakInfected: 0 };
    
    updateStats(newAgents);
    
    // Sync to UI state
    setHistory([]);
    setTickCount(0);
    setStats(statsRef.current);
  }, [population, initialInfected, disease, vaccination, vaccinationRate, simulationMode, updateStats]);

  // ===== CORE UPDATE FUNCTION - NO STATE DEPENDENCIES =====
  const update = useCallback(() => {
    if (!isRunningRef.current) return;

    const width = PHYSICS_WIDTH;
    const height = PHYSICS_HEIGHT;
    const currentTick = tickCountRef.current;
    const d = diseaseRef.current;

    const maskEffect = maskWearingRef.current ? (1 - (d.interventions.masks?.efficacy || 0)) : 1;
    const distanceEffect = socialDistancingRef.current ? (1 - (d.interventions.distancing?.efficacy || 0)) : 1;
    const effectiveTransmissionProb = d.transmissionProb * maskEffect * distanceEffect;
    const speedMultiplier = socialDistancingRef.current ? 0.5 : 1.0;
    const currentSpeed = speedRef.current;

    // Movement
    for (const agent of agents.current) {
      if (!quarantineRef.current || agent.state !== "I") {
        const mobility = speedMultiplier * currentSpeed;
        agent.vx += (Math.random() - 0.5) * 0.5 * mobility;
        agent.vy += (Math.random() - 0.5) * 0.5 * mobility;

        const maxSpeed = 3 * mobility;
        const agentSpeed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
        if (agentSpeed > maxSpeed) {
          agent.vx = (agent.vx / agentSpeed) * maxSpeed;
          agent.vy = (agent.vy / agentSpeed) * maxSpeed;
        }

        agent.x += agent.vx;
        agent.y += agent.vy;

        if (agent.x <= 5 || agent.x >= width - 5) {
          agent.vx *= -0.9;
          agent.x = Math.max(5, Math.min(width - 5, agent.x));
        }
        if (agent.y <= 5 || agent.y >= height - 5) {
          agent.vy *= -0.9;
          agent.y = Math.max(5, Math.min(height - 5, agent.y));
        }
      }

      // State transitions
      if (agent.state === "E" && agent.exposedTimer) {
        agent.exposedTimer--;
        if (agent.exposedTimer <= 0) {
          agent.state = "I";
          agent.timer = Math.floor(d.infectiousDays.mean * ticksPerDay);
        }
      } else if (agent.state === "I") {
        agent.timer--;
        if (agent.timer <= 0) {
          if (Math.random() < d.cfr) {
            agent.state = "D";
            agent.vx = 0;
            agent.vy = 0;
          } else {
            agent.state = "R";
            agent.immunity = 0.95;
          }
        }
      }
    }

    // Transmission
    const infectedAgents = agents.current.filter(a => a.state === "I");
    for (const infected of infectedAgents) {
      for (const susceptible of agents.current) {
        if (susceptible.state !== "S" && susceptible.state !== "V") continue;

        const dx = infected.x - susceptible.x;
        const dy = infected.y - susceptible.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < d.transmissionRadius) {
          let transmissionChance = effectiveTransmissionProb * (1 - distance / d.transmissionRadius);
          if (susceptible.immunity > 0) transmissionChance *= (1 - susceptible.immunity);

          if (Math.random() < transmissionChance) {
            susceptible.state = "E";
            susceptible.exposedTimer = Math.floor(d.incubationDays.mean * ticksPerDay);
            susceptible.infectionTime = currentTick;
          }
        }
      }
    }

    updateStats(agents.current);

    // Record history every 5 ticks
    if (currentTick % 5 === 0) {
      const s = statsRef.current;
      historyRef.current = [...historyRef.current.slice(-200), {
        t: currentTick,
        S: s.S, E: s.E, I: s.I, R: s.R, D: s.D, V: s.V
      }];
    }

    tickCountRef.current++;
  }, [updateStats]); // Only depends on updateStats which is stable

  // Render function - reads from refs
  const render = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const d = diseaseRef.current;
    const pan = panOffsetRef.current;
    const zoom = zoomLevelRef.current;

    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw network connections
    if ((simulationMode === 'regions' || simulationMode === 'households') && networkConnections.current.size > 0) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1 / zoom;
      networkConnections.current.forEach((connections, fromId) => {
        const fromAgent = agents.current[fromId];
        if (!fromAgent) return;
        connections.forEach(toId => {
          if (toId > fromId) {
            const toAgent = agents.current[toId];
            if (!toAgent) return;
            ctx.beginPath();
            ctx.moveTo(fromAgent.x, fromAgent.y);
            ctx.lineTo(toAgent.x, toAgent.y);
            ctx.stroke();
          }
        });
      });
    }

    // Draw agents
    for (const a of agents.current) {
      if (a.state === 'D') continue;

      let size = 3;
      let color = '#3b82f6';

      switch (a.state) {
        case 'S': color = '#3b82f6'; break;
        case 'E': color = '#fbbf24'; size += 0.5; break;
        case 'I': color = d.color; size += 1; break;
        case 'R': color = '#22c55e'; break;
        case 'V': color = '#8b5cf6'; break;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(a.x, a.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [simulationMode]);

  // Touch/mouse handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistanceRef.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      lastZoomRef.current = zoomLevelRef.current;
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      panStartRef.current = { x: touch.clientX - panOffsetRef.current.x, y: touch.clientY - panOffsetRef.current.y };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      if (touchStartDistanceRef.current > 0) {
        const scale = distance / touchStartDistanceRef.current;
        const newZoom = Math.max(0.5, Math.min(3, lastZoomRef.current * scale));
        zoomLevelRef.current = newZoom;
        setZoomLevel(newZoom);
      }
    } else if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      const newPan = { x: touch.clientX - panStartRef.current.x, y: touch.clientY - panStartRef.current.y };
      panOffsetRef.current = newPan;
      setPanOffset(newPan);
    }
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    touchStartDistanceRef.current = 0;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const newPan = { x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y };
    panOffsetRef.current = newPan;
    setPanOffset(newPan);
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevelRef.current * delta));
    zoomLevelRef.current = newZoom;
    setZoomLevel(newZoom);
  }, []);

  const resetView = useCallback(() => {
    panOffsetRef.current = { x: 0, y: 0 };
    zoomLevelRef.current = 1;
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  }, []);

  // Sync props
  useEffect(() => {
    setIsRunning(isRunningProp);
  }, [isRunningProp]);

  useEffect(() => {
    setSpeed(speedProp);
  }, [speedProp]);

  // ===== ANIMATION LOOP - Fixed step simulation + capped render =====
  useEffect(() => {
    let frameId: number;
    
    const loop = (time: number) => {
      if (!isRunningRef.current) {
        frameId = requestAnimationFrame(loop);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
        lastRenderRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accumulatorRef.current += delta;

      // Fixed simulation steps
      let steps = 0;
      while (accumulatorRef.current >= SIM_STEP_MS) {
        update();
        accumulatorRef.current -= SIM_STEP_MS;
        steps++;
        if (steps > 10) { accumulatorRef.current = 0; break; }
      }

      // Throttle rendering
      if (lastRenderRef.current === null || time - lastRenderRef.current >= TARGET_FRAME_MS) {
        lastRenderRef.current = time;
        const canvas = isMobileFullscreen ? theaterCanvasRef.current : canvasRef.current;
        render(canvas);
        
        // Sync UI state periodically (every render, not every tick)
        setStats({ ...statsRef.current });
        setTickCount(tickCountRef.current);
        setHistory([...historyRef.current]);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
      lastRenderRef.current = null;
    };
  }, [update, render, isMobileFullscreen]);

  // Canvas sizing — main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
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

  // Canvas sizing — mobile fullscreen canvas
  useEffect(() => {
    if (!isMobileFullscreen) return;
    const canvas = theaterCanvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isMobileFullscreen]);

  // Initialize on param changes
  useEffect(() => {
    initAgents();
    setTimeout(() => {
      render(canvasRef.current);
    }, 50);
  }, [population, initialInfected, selectedDisease, simulationMode]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    initAgents();
    resetView();
  }, [initAgents, resetView]);

  const enterMobileFullscreen = useCallback(() => {
    setIsMobileFullscreen(true);
    setIsRunning(true);
    resetView();
  }, [resetView]);

  const exitMobileFullscreen = useCallback(() => {
    setIsMobileFullscreen(false);
    setIsRunning(false);
    resetView();
  }, [resetView]);

  const chartData = useMemo(() => ({
    labels: history.map(d => `Day ${Math.floor(d.t / ticksPerDay)}`),
    datasets: [
      { label: "Susceptible", data: history.map(d => d.S), borderColor: "#3b82f6", backgroundColor: "transparent", borderWidth: 2, pointRadius: 0, tension: 0.4 },
      { label: "Exposed", data: history.map(d => d.E || 0), borderColor: "#fbbf24", backgroundColor: "transparent", borderWidth: 2, pointRadius: 0, tension: 0.4 },
      { label: "Infected", data: history.map(d => d.I), borderColor: disease.color, backgroundColor: "transparent", borderWidth: 2, pointRadius: 0, tension: 0.4 },
      { label: "Recovered", data: history.map(d => d.R), borderColor: "#22c55e", backgroundColor: "transparent", borderWidth: 2, pointRadius: 0, tension: 0.4 }
    ]
  }), [history, disease]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const, labels: { boxWidth: 12, padding: 10, font: { size: 10 }, color: '#e2e8f0' } } },
    scales: {
      x: { display: true, grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 6 } },
      y: { display: true, beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
    },
    animation: { duration: 0 }
  };

  // ── Unified NBody-style overlay render ──────────────────────────────────────
  return (
    <>
      <DiseaseOverlayStyles />

      {/* ── Main simulation canvas with floating overlays ── */}
      <div className={`dis-root${isTheaterMode ? ' theater' : ''}`}>

        {/* Canvas */}
        <canvas
          className="dis-canvas"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Top-left: disease profile chips */}
        <div className="dis-model-switcher">
          {Object.values(DISEASE_PROFILES).map(d => (
            <button
              key={d.id}
              className={`dis-model-btn${d.id === selectedDisease ? ' active' : ''}`}
              style={{ '--dis-color': d.color } as React.CSSProperties}
              onClick={() => { setSelectedDisease(d.id); handleReset(); }}
            >
              <span className="dis-model-dot" style={{ background: d.color }} />
              {d.name}
            </button>
          ))}
        </div>

        {/* Top-right: icon buttons */}
        <div className="dis-top-right">
          <button
            className={`dis-icon-btn${hudVisible ? ' active' : ''}`}
            onClick={() => setHudVisible(v => !v)}
            title="Toggle stats HUD"
          >
            <Activity size={15} />
          </button>
          {simulationMode === 'regions' && (
            <button className="dis-icon-btn active" title="Regional network active">
              <Network size={15} />
            </button>
          )}
        </div>

        {/* HUD panel */}
        {hudVisible && (
          <div className="dis-hud">
            <div className="dis-hud-title">
              <span style={{ color: disease.color }}>●</span>
              {disease.name} — Day {stats.day}
            </div>
            <div className="dis-hud-divider" />
            <div className="dis-hud-row">
              <span>Susceptible</span>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>{stats.S}</span>
            </div>
            {stats.E > 0 && (
              <div className="dis-hud-row">
                <span>Exposed</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{stats.E}</span>
              </div>
            )}
            <div className="dis-hud-row">
              <span>Infected</span>
              <span style={{ color: disease.color, fontWeight: 700 }}>{stats.I}</span>
            </div>
            <div className="dis-hud-row">
              <span>Recovered</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>{stats.R}</span>
            </div>
            {stats.D > 0 && (
              <div className="dis-hud-row">
                <span>Deaths</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{stats.D}</span>
              </div>
            )}
            <div className="dis-hud-divider" />
            <div className="dis-hud-row">
              <span>R(t)</span>
              <span style={{ color: stats.rt > 1 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                {stats.rt.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Bottom pill bar */}
        <div className="dis-bottom-bar">
          <button
            className={`dis-bar-btn${isRunning ? ' danger' : ' primary'}`}
            onClick={() => setIsRunning(v => !v)}
          >
            {isRunning ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
            {isRunning ? 'Pause' : 'Run'}
          </button>

          <button className="dis-bar-btn" onClick={handleReset}>
            <RefreshCw size={14} />
            Reset
          </button>

          <div className="dis-bar-divider" />

          <div className="dis-speed-control">
            <span className="dis-speed-label">{speed}×</span>
            <input
              type="range"
              className="dis-slider"
              min={1} max={5} step={1}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
            />
          </div>

          <div className="dis-bar-divider" />

          <button
            className={`dis-bar-btn${activePanel === 'parameters' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'parameters' ? 'none' : 'parameters')}
          >
            <Settings size={14} />
            Params
          </button>

          <button
            className={`dis-bar-btn${activePanel === 'interventions' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'interventions' ? 'none' : 'interventions')}
          >
            <Shield size={14} />
            Intervene
          </button>

          <button
            className={`dis-bar-btn${activePanel === 'statistics' ? ' active' : ''}`}
            onClick={() => setActivePanel(p => p === 'statistics' ? 'none' : 'statistics')}
          >
            <BarChart3 size={14} />
            Stats
          </button>
        </div>

        {/* Parameters panel */}
        {activePanel === 'parameters' && (
          <div className="dis-panel">
            <div className="dis-panel-header">
              <Settings size={15} />
              Parameters
              <button className="dis-panel-close" onClick={() => setActivePanel('none')}>
                <X size={13} />
              </button>
            </div>
            <div className="dis-panel-body">
              <div className="dis-param-row">
                <div className="dis-param-header">
                  <span>Population</span>
                  <span className="dis-param-val">{population}</span>
                </div>
                <input type="range" className="dis-param-slider" min={100} max={2000} step={50} value={population}
                  onChange={e => setPopulation(Number(e.target.value))} disabled={isRunning} />
              </div>
              <div className="dis-param-row">
                <div className="dis-param-header">
                  <span>Initial Cases</span>
                  <span className="dis-param-val">{initialInfected}</span>
                </div>
                <input type="range" className="dis-param-slider" min={1} max={20} value={initialInfected}
                  onChange={e => setInitialInfected(Number(e.target.value))} disabled={isRunning} />
              </div>
              <div className="dis-param-row">
                <div className="dis-param-header"><span>Network Model</span></div>
                <select className="dis-param-select" value={simulationMode}
                  onChange={e => setSimulationMode(e.target.value as SimulationMode)} disabled={isRunning}>
                  <option value="homogeneous">Homogeneous</option>
                  <option value="regions">Regional Clusters</option>
                  <option value="households">Household Structure</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Interventions panel */}
        {activePanel === 'interventions' && (
          <div className="dis-panel">
            <div className="dis-panel-header">
              <Shield size={15} />
              Interventions
              <button className="dis-panel-close" onClick={() => setActivePanel('none')}>
                <X size={13} />
              </button>
            </div>
            <div className="dis-panel-body">
              <div className="dis-intervention-grid">
                {([
                  { key: 'masks',      state: maskWearing,     setState: setMaskWearing,     icon: Shield, label: 'Mask Mandate',      color: '#10b981' },
                  { key: 'distancing', state: socialDistancing, setState: setSocialDistancing, icon: Users,  label: 'Social Distancing', color: '#3b82f6' },
                  { key: 'quarantine', state: quarantine,       setState: setQuarantine,       icon: Home,   label: 'Quarantine',        color: '#f59e0b' },
                  { key: 'vaccination',state: vaccination,      setState: setVaccination,      icon: Heart,  label: 'Vaccination',       color: '#8b5cf6' },
                ] as const).map(intv => {
                  const efficacy = disease.interventions[intv.key as keyof typeof disease.interventions]?.efficacy;
                  return (
                    <button
                      key={intv.key}
                      className={`dis-intervention-card${intv.state ? ' active' : ''}`}
                      style={intv.state ? { borderColor: intv.color } : {}}
                      onClick={() => intv.setState(!intv.state)}
                    >
                      <span className="dis-intervention-icon" style={{ color: intv.color }}>
                        <intv.icon size={18} />
                      </span>
                      <span className="dis-intervention-name">{intv.label}</span>
                      {efficacy && (
                        <span className="dis-intervention-efficacy">{Math.round(efficacy * 100)}% effective</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {vaccination && (
                <div className="dis-param-row" style={{ marginTop: '0.65rem' }}>
                  <div className="dis-param-header">
                    <span>Vaccination Coverage</span>
                    <span className="dis-param-val">{Math.round(vaccinationRate * 100)}%</span>
                  </div>
                  <input type="range" className="dis-param-slider" min={0} max={1} step={0.05} value={vaccinationRate}
                    onChange={e => setVaccinationRate(Number(e.target.value))} disabled={isRunning} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics panel */}
        {activePanel === 'statistics' && (
          <div className="dis-panel">
            <div className="dis-panel-header">
              <BarChart3 size={15} />
              Statistics
              <button className="dis-panel-close" onClick={() => setActivePanel('none')}>
                <X size={13} />
              </button>
            </div>
            <div className="dis-panel-body">
              <div className="dis-stats-grid">
                <div className="dis-stat-card">
                  <div className="dis-stat-label">Attack Rate</div>
                  <div className="dis-stat-value" style={{ color: '#3b82f6' }}>
                    {((stats.totalCases / population) * 100).toFixed(1)}%
                  </div>
                  <div className="dis-stat-change">Total: {stats.totalCases}</div>
                </div>
                <div className="dis-stat-card">
                  <div className="dis-stat-label">R(t)</div>
                  <div className="dis-stat-value" style={{ color: stats.rt > 1 ? '#ef4444' : '#22c55e' }}>
                    {stats.rt.toFixed(2)}
                  </div>
                  <div className="dis-stat-change">{stats.rt > 1 ? 'Growing' : 'Declining'}</div>
                </div>
                <div className="dis-stat-card">
                  <div className="dis-stat-label">Peak Infected</div>
                  <div className="dis-stat-value" style={{ color: '#fbbf24' }}>{stats.peakInfected}</div>
                  <div className="dis-stat-change">{((stats.peakInfected / population) * 100).toFixed(1)}%</div>
                </div>
                <div className="dis-stat-card">
                  <div className="dis-stat-label">Deaths</div>
                  <div className="dis-stat-value" style={{ color: '#dc2626' }}>{stats.D}</div>
                  <div className="dis-stat-change">
                    CFR: {stats.D > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(1) : '0'}%
                  </div>
                </div>
              </div>
              <div style={{ height: '140px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '0.5rem', border: '1px solid rgba(59,130,246,0.12)' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Zoom badge */}
        <div className="dis-zoom">{(zoomLevel * 100).toFixed(0)}%</div>

        {/* Mobile "View Sim" button — visible only on small screens */}
        {!isTheaterMode && (
          <button
            onClick={enterMobileFullscreen}
            style={{
              display: 'none',
              position: 'absolute', inset: 0, width: '100%',
              background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            className="dis-mobile-cta"
          >
            <Activity size={20} /> View Simulation
          </button>
        )}
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
          position: 'absolute', top: '1rem', left: '1rem',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px',
          padding: '0.6rem 0.75rem', fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)',
          minWidth: '130px', zIndex: 50,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '0.4rem' }}>
            <span style={{ color: disease.color }}>●</span> Day {stats.day}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
            <span>S</span><span style={{ color: '#3b82f6', fontWeight: 600 }}>{stats.S}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
            <span>I</span><span style={{ color: disease.color, fontWeight: 600 }}>{stats.I}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
            <span>R</span><span style={{ color: '#22c55e', fontWeight: 600 }}>{stats.R}</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '0.3rem', paddingTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>R(t)</span>
            <span style={{ color: stats.rt > 1 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>{stats.rt.toFixed(2)}</span>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: '1rem',
          background: 'rgba(0,0,0,0.75)', padding: '0.2rem 0.5rem', borderRadius: '8px',
          fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', zIndex: 50,
        }}>
          {(zoomLevel * 100).toFixed(0)}%
        </div>

        <FullscreenControls>
          <FullscreenButton $primary onClick={() => setIsRunning(v => !v)}>
            {isRunning ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
          </FullscreenButton>
          <FullscreenButton onClick={handleReset}>
            <RefreshCw size={20} />
          </FullscreenButton>
          <FullscreenButton onClick={resetView}>
            <Activity size={20} />
          </FullscreenButton>
        </FullscreenControls>

        <ExitButton onClick={exitMobileFullscreen}>
          <X size={20} />
        </ExitButton>
      </FullscreenOverlay>
    </>
  );
}