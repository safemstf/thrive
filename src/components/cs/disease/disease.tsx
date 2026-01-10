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
import styled from 'styled-components';
import { DISEASE_PROFILES, type Agent, type SimulationMode } from './disease.types';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Styled Components
const Container = styled.div<{ $theater?: boolean }>`
  width: 100%;
  min-height: ${({ $theater }) => $theater ? '100vh' : '100vh'};
  background: ${({ $theater }) => $theater ? 'transparent' : 'linear-gradient(to bottom, #0a0e1a, #1a1a2e)'};
  color: #e6eef8;
  padding: ${({ $theater }) => $theater ? '0' : '2rem 1rem'};
  box-sizing: border-box;
  position: relative;

  @media (max-width: 768px) {
    padding: ${({ $theater }) => $theater ? '0' : '1rem 0.75rem'};
  }
`;

const TheaterCanvas = styled.canvas<{ $theater?: boolean }>`
  position: ${({ $theater }) => $theater ? 'fixed' : 'relative'};
  inset: ${({ $theater }) => $theater ? '0' : 'auto'};
  width: 100%;
  height: ${({ $theater }) => $theater ? '100vh' : '100%'};
  display: block;
  cursor: grab;
  touch-action: none;
  z-index: 1;
  
  &:active {
    cursor: grabbing;
  }
`;

const ControlsDrawer = styled.div<{ $expanded: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 14, 26, 0.98);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(59, 130, 246, 0.3);
  z-index: 100;
  max-height: ${({ $expanded }) => $expanded ? '70vh' : '60px'};
  transition: max-height 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
`;

const DrawerHandle = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  min-height: 0;
  
  /* Ensure proper scrolling */
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
    
    &:hover {
      background: rgba(59, 130, 246, 0.7);
    }
  }
`;

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

const MaxWidthWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #94a3b8;
`;

const ViewSimButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    
    &:active {
      transform: scale(0.98);
    }
  }
`;

const VideoSection = styled.section`
  width: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(5,10,20,0.9));
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(59,130,246,0.22);
  box-shadow: 0 8px 32px rgba(0,0,0,0.32);
  margin-bottom: 1.5rem;
  aspect-ratio: 16 / 9;
  max-height: 65vh;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const SimCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
  
  &:active {
    cursor: grabbing;
  }
`;

const HUD = styled.div<{ $theater?: boolean }>`
  position: fixed;
  top: 1rem;
  left: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.9rem;
  z-index: 50;
  margin-top: 120px;
  min-width: 180px;
`;

const NetworkOverlay = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  font-size: 0.75rem;
  color: #fff;
  z-index: 50;
  max-width: 250px;
`;

const ControlsSection = styled.section`
  width: 100%;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(8,12,20,0.6);
  border: 1px solid rgba(59,130,246,0.1);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.15)')};
  background: ${({ $active }) => ($active ? 'rgba(59,130,246,0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#3b82f6' : '#94a3b8')};
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const TabContent = styled.div`
  width: 100%;
`;

const Grid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ParameterControl = styled.div`
  display: block;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-size: 0.9rem;
    font-weight: 700;
    color: #e6eef8;
  }
  
  .value {
    color: #3b82f6;
    font-weight: 800;
    font-size: 0.9rem;
  }
  
  input[type="range"] {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  select {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 4px;
    color: #e2e8f0;
    cursor: pointer;
  }
`;

const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.8rem;
`;

const InterventionCard = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ $active }) => ($active ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.4)')};
  border: 1px solid ${({ $active, $color = '#3b82f6' }) => ($active ? $color : 'rgba(59,130,246,0.15)')};
  color: #e6eef8;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
  min-height: 100px;
  justify-content: center;
  
  .icon {
    font-size: 1.5rem;
    color: ${({ $color = '#3b82f6' }) => $color};
  }
  
  .name {
    font-weight: 800;
    font-size: 0.9rem;
    text-align: center;
  }
  
  .efficacy {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: center;
  }
`;

const StatCard = styled.div<{ $color?: string }>`
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(59,130,246,0.1);
  color: #e6eef8;
  
  .label {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }
  
  .value {
    font-size: 1.6rem;
    color: ${({ $color = '#3b82f6' }) => $color};
    font-weight: 800;
  }
  
  .change {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.2rem;
  }
`;

const DiseaseSelector = styled.div`
  margin-bottom: 1.5rem;
`;

const DiseaseButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ $selected, $color }) => ($selected ? `${$color}20` : 'rgba(0,0,0,0.3)')};
  border: 1px solid ${({ $selected, $color }) => ($selected ? $color : 'rgba(59,130,246,0.2)')};
  border-radius: 10px;
  color: white;
  cursor: pointer;
  text-align: left;
  margin-bottom: 0.5rem;
  
  .disease-icon {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
  }
  
  .disease-info {
    flex: 1;
  }
  
  .disease-name {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }
  
  .disease-stats {
    font-size: 0.75rem;
    color: #94a3b8;
  }
`;

interface DiseaseSimulationProps {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
  isTheaterMode?: boolean;
}



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

  // ===== timing refs & constants for fixed-step sim + capped render =====
  const TARGET_FPS = 80;
  const TARGET_FRAME_MS = 1000 / TARGET_FPS;
  const SIM_TPS = 30; // logical ticks per second
  const SIM_STEP_MS = 1000 / SIM_TPS;
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);
  const lastRenderRef = useRef<number | null>(null);
  // ===================================================================

  // Pan & Zoom
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchStartDistanceRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(1);

  // State
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('covid19');
  const [activeTab, setActiveTab] = useState<'parameters' | 'interventions' | 'statistics'>('parameters');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('homogeneous');
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);

  const disease = DISEASE_PROFILES[selectedDisease];

  // Parameters
  const [population, setPopulation] = useState(800);
  const [initialInfected, setInitialInfected] = useState(3);
  const [vaccinationRate, setVaccinationRate] = useState(0);

  // Interventions
  const [socialDistancing, setSocialDistancing] = useState(false);
  const [vaccination, setVaccination] = useState(false);
  const [quarantine, setQuarantine] = useState(false);
  const [maskWearing, setMaskWearing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    S: 0, E: 0, I: 0, R: 0, D: 0, V: 0,
    rt: 0,
    day: 0,
    newCases: 0,
    totalCases: 0,
    peakInfected: 0
  });

  // FIXED PHYSICS WORLD
  const PHYSICS_WIDTH = 1200;
  const PHYSICS_HEIGHT = 1000;

  const canvasWidth = PHYSICS_WIDTH;
  const canvasHeight = PHYSICS_HEIGHT;

  // Generate spatial network
  const generateSpatialNetwork = (agents: Agent[], width: number, height: number) => {
    const connections = new Map<number, Set<number>>();
    const numClusters = 6;
    const clusters: { x: number; y: number; members: number[] }[] = [];

    for (let i = 0; i < numClusters; i++) {
      clusters.push({ x: Math.random() * width, y: Math.random() * height, members: [] });
    }

    agents.forEach((agent, idx) => {
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
    setHistory([]);
    setTickCount(0);
    updateStats(newAgents);
  }, [population, initialInfected, disease, vaccination, vaccinationRate, simulationMode]);

  const updateStats = (agentList: Agent[]) => {
    const counts = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0 } as any;
    let newCases = 0;

    for (const a of agentList) {
      counts[a.state]++;
      if (a.infectionTime === tickCount) newCases++;
    }

    const totalCases = counts.I + counts.R + counts.D;
    const peakInfected = Math.max(stats.peakInfected, counts.I);
    const rt = counts.I > 0 ? (newCases / counts.I) * disease.infectiousDays.mean : 0;

    setStats({
      ...counts,
      rt,
      day: Math.floor(tickCount / ticksPerDay),
      newCases,
      totalCases,
      peakInfected
    });
  };

  const update = useCallback(() => {
    if (!isRunning) return;

    // Use FIXED physics boundaries
    const width = PHYSICS_WIDTH;
    const height = PHYSICS_HEIGHT;

    const maskEffect = maskWearing ? (1 - (disease.interventions.masks?.efficacy || 0)) : 1;
    const distanceEffect = socialDistancing ? (1 - (disease.interventions.distancing?.efficacy || 0)) : 1;
    const effectiveTransmissionProb = disease.transmissionProb * maskEffect * distanceEffect;
    const speedMultiplier = socialDistancing ? 0.5 : 1.0;

    for (const agent of agents.current) {
      if (!quarantine || agent.state !== "I") {
        const mobility = speedMultiplier * speed;
        agent.vx += (Math.random() - 0.5) * 0.5 * mobility;
        agent.vy += (Math.random() - 0.5) * 0.5 * mobility;

        const maxSpeed = 3 * mobility;
        const currentSpeed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
        if (currentSpeed > maxSpeed) {
          agent.vx = (agent.vx / currentSpeed) * maxSpeed;
          agent.vy = (agent.vy / currentSpeed) * maxSpeed;
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

      if (agent.state === "E" && agent.exposedTimer) {
        agent.exposedTimer--;
        if (agent.exposedTimer <= 0) {
          agent.state = "I";
          agent.timer = Math.floor(disease.infectiousDays.mean * ticksPerDay);
        }
      } else if (agent.state === "I") {
        agent.timer--;
        if (agent.timer <= 0) {
          if (Math.random() < disease.cfr) {
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
    for (const infected of agents.current.filter(a => a.state === "I")) {
      for (const susceptible of agents.current) {
        if (susceptible.state !== "S" && susceptible.state !== "V") continue;

        const dx = infected.x - susceptible.x;
        const dy = infected.y - susceptible.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < disease.transmissionRadius) {
          let transmissionChance = effectiveTransmissionProb * (1 - distance / disease.transmissionRadius);
          if (susceptible.immunity > 0) transmissionChance *= (1 - susceptible.immunity);

          if (Math.random() < transmissionChance) {
            susceptible.state = "E";
            susceptible.exposedTimer = Math.floor(disease.incubationDays.mean * ticksPerDay);
            susceptible.infectionTime = tickCount;
          }
        }
      }
    }

    updateStats(agents.current);

    if (tickCount % 5 === 0) {
      setHistory(prev => [...prev.slice(-200), {
        t: tickCount,
        S: stats.S,
        E: stats.E,
        I: stats.I,
        R: stats.R,
        D: stats.D,
        V: stats.V
      }]);
    }

    setTickCount(prev => prev + 1);
  }, [isRunning, speed, disease, socialDistancing, maskWearing, quarantine, tickCount, stats]);

  const render = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear entire canvas once
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save state and apply transforms
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw network connections
    if ((simulationMode === 'regions' || simulationMode === 'households') && networkConnections.current.size > 0) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1 / zoomLevel;
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
        case 'I': color = disease.color; size += 1; break;
        case 'R': color = '#22c55e'; break;
        case 'V': color = '#8b5cf6'; break;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(a.x, a.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [disease, simulationMode, panOffset, zoomLevel]);

  // Touch/mouse handlers (unchanged)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistanceRef.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      lastZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      panStartRef.current = { x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y };
    }
  }, [panOffset, zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      if (touchStartDistanceRef.current > 0) {
        const scale = distance / touchStartDistanceRef.current;
        setZoomLevel(Math.max(0.5, Math.min(3, lastZoomRef.current * scale)));
      }
    } else if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      setPanOffset({ x: touch.clientX - panStartRef.current.x, y: touch.clientY - panStartRef.current.y });
    }
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    touchStartDistanceRef.current = 0;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  const resetView = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  // Sync props
  useEffect(() => {
    setIsRunning(isRunningProp);
  }, [isRunningProp]);

  useEffect(() => {
    setSpeed(speedProp);
  }, [speedProp]);

  // ===== Animation loop (fixed-step simulation + capped render) =====
  useEffect(() => {
    const loop = (time: number) => {
      if (!isRunning) return;

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
        const canvas = isTheaterMode ? theaterCanvasRef.current : canvasRef.current;
        render(canvas);
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    if (isRunning) {
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
      lastRenderRef.current = null;
      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
      lastRenderRef.current = null;
    };
  }, [isRunning, update, render, isTheaterMode]);
  // ================================================================

  // Canvas sizing
  useEffect(() => {
    const canvas = isTheaterMode ? theaterCanvasRef.current : canvasRef.current;
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
  }, [isTheaterMode, handleWheel]);

  useEffect(() => {
    initAgents();
    setTimeout(() => {
      const canvas = isTheaterMode ? theaterCanvasRef.current : canvasRef.current;
      render(canvas);
    }, 50);
  }, [population, initialInfected, selectedDisease, simulationMode]);

  const handleReset = () => {
    setIsRunning(false);
    setTickCount(0);
    setHistory([]);
    initAgents();
    resetView();
  };

  const enterMobileFullscreen = () => {
    setIsMobileFullscreen(true);
    setIsRunning(true);
    resetView();
  };

  const exitMobileFullscreen = () => {
    setIsMobileFullscreen(false);
    setIsRunning(false);
    resetView();
  };

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

  // Theater mode rendering
  if (isTheaterMode) {
    return (
      <Container $theater>
        <TheaterCanvas
          ref={theaterCanvasRef}
          $theater
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <HUD $theater>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Day {stats.day}
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Susceptible:</span>
              <span style={{ fontWeight: 600, color: '#3b82f6' }}>{stats.S}</span>
            </div>
            {stats.E > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Exposed:</span>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>{stats.E}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Infected:</span>
              <span style={{ fontWeight: 600, color: disease.color }}>{stats.I}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Recovered:</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.R}</span>
            </div>
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>R(t):</span>
                <span style={{ fontWeight: 700, color: stats.rt > 1 ? '#ef4444' : '#22c55e' }}>
                  {stats.rt.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </HUD>

        {simulationMode === 'regions' && (
          <NetworkOverlay>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={14} />
              Regional Network
            </div>
          </NetworkOverlay>
        )}

        <ControlsDrawer $expanded={drawerExpanded}>
          <DrawerHandle onClick={() => setDrawerExpanded(!drawerExpanded)}>
            {drawerExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            <span>Controls & Settings</span>
          </DrawerHandle>

          <DrawerContent>
            <MaxWidthWrapper>
              <SectionTitle>
                <Bug size={20} />
                Disease Selection
              </SectionTitle>

              <DiseaseSelector>
                {Object.values(DISEASE_PROFILES).map(d => (
                  <DiseaseButton
                    key={d.id}
                    $color={d.color}
                    $selected={d.id === selectedDisease}
                    onClick={() => {
                      setSelectedDisease(d.id);
                      handleReset();
                    }}
                  >
                    <div className="disease-icon" />
                    <div className="disease-info">
                      <div className="disease-name">{d.name}</div>
                      <div className="disease-stats">
                        R₀: {d.r0.typical} | CFR: {(d.cfr * 100).toFixed(1)}% | {d.transmissionMode}
                      </div>
                    </div>
                  </DiseaseButton>
                ))}
              </DiseaseSelector>

              <TabContainer>
                <Tab $active={activeTab === 'parameters'} onClick={() => setActiveTab('parameters')}>
                  <Settings size={16} />
                  Parameters
                </Tab>
                <Tab $active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')}>
                  <Shield size={16} />
                  Interventions
                </Tab>
                <Tab $active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')}>
                  <BarChart3 size={16} />
                  Statistics
                </Tab>
              </TabContainer>

              <TabContent>
                {activeTab === 'parameters' && (
                  <Grid $columns={3}>
                    <ParameterControl>
                      <div className="header">
                        <span className="label">Population</span>
                        <span className="value">{population}</span>
                      </div>
                      <input type="range" min={100} max={2000} step={50} value={population} onChange={(e) => setPopulation(Number(e.target.value))} disabled={isRunning} />
                    </ParameterControl>

                    <ParameterControl>
                      <div className="header">
                        <span className="label">Initial Cases</span>
                        <span className="value">{initialInfected}</span>
                      </div>
                      <input type="range" min={1} max={20} value={initialInfected} onChange={(e) => setInitialInfected(Number(e.target.value))} disabled={isRunning} />
                    </ParameterControl>

                    <ParameterControl>
                      <div className="header">
                        <span className="label">Network Model</span>
                      </div>
                      <select value={simulationMode} onChange={(e) => setSimulationMode(e.target.value as SimulationMode)} disabled={isRunning}>
                        <option value="homogeneous">Homogeneous</option>
                        <option value="regions">Regional Clusters</option>
                        <option value="households">Household Structure</option>
                      </select>
                    </ParameterControl>
                  </Grid>
                )}

                {activeTab === 'interventions' && (
                  <div>
                    <InterventionGrid>
                      {[
                        { key: 'masks', state: maskWearing, setState: setMaskWearing, icon: Shield, label: 'Mask Mandate', color: '#10b981' },
                        { key: 'distancing', state: socialDistancing, setState: setSocialDistancing, icon: Users, label: 'Social Distancing', color: '#3b82f6' },
                        { key: 'quarantine', state: quarantine, setState: setQuarantine, icon: Home, label: 'Quarantine', color: '#f59e0b' },
                        { key: 'vaccination', state: vaccination, setState: setVaccination, icon: Heart, label: 'Vaccination', color: '#8b5cf6' }
                      ].map(intervention => {
                        const efficacy = disease.interventions[intervention.key as keyof typeof disease.interventions]?.efficacy;
                        return (
                          <InterventionCard
                            key={intervention.key}
                            $active={intervention.state}
                            $color={intervention.color}
                            onClick={() => intervention.setState(!intervention.state)}
                          >
                            <div className="icon">
                              <intervention.icon size={24} />
                            </div>
                            <div className="name">{intervention.label}</div>
                            {efficacy && (
                              <div className="efficacy">
                                {Math.round(efficacy * 100)}% effective
                              </div>
                            )}
                          </InterventionCard>
                        );
                      })}
                    </InterventionGrid>

                    {vaccination && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <ParameterControl>
                          <div className="header">
                            <span className="label">Vaccination Coverage</span>
                            <span className="value">{Math.round(vaccinationRate * 100)}%</span>
                          </div>
                          <input type="range" min={0} max={1} step={0.05} value={vaccinationRate} onChange={(e) => setVaccinationRate(Number(e.target.value))} disabled={isRunning} />
                        </ParameterControl>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'statistics' && (
                  <div>
                    <Grid $columns={4}>
                      <StatCard $color="#3b82f6">
                        <div className="label">Attack Rate</div>
                        <div className="value">{((stats.totalCases / population) * 100).toFixed(1)}%</div>
                        <div className="change">Total: {stats.totalCases}</div>
                      </StatCard>

                      <StatCard $color={stats.rt > 1 ? '#ef4444' : '#22c55e'}>
                        <div className="label">R(t)</div>
                        <div className="value">{stats.rt.toFixed(2)}</div>
                        <div className="change">{stats.rt > 1 ? 'Growing' : 'Declining'}</div>
                      </StatCard>

                      <StatCard $color="#fbbf24">
                        <div className="label">Peak Infected</div>
                        <div className="value">{stats.peakInfected}</div>
                        <div className="change">{((stats.peakInfected / population) * 100).toFixed(1)}%</div>
                      </StatCard>

                      <StatCard $color="#dc2626">
                        <div className="label">Case Fatality</div>
                        <div className="value">{stats.D > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(1) : '0'}%</div>
                        <div className="change">Deaths: {stats.D}</div>
                      </StatCard>
                    </Grid>

                    <div style={{ height: '250px', background: 'rgba(0, 0, 0, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '1rem' }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                )}
              </TabContent>
            </MaxWidthWrapper>
          </DrawerContent>
        </ControlsDrawer>
      </Container>
    );
  }

  // Normal mode rendering
  return (
    <>
      <Container>
        <MaxWidthWrapper>
          <Header>
            <Title>Epidemic Simulation</Title>
            <Subtitle>Configure parameters and interventions below</Subtitle>
          </Header>

          <ViewSimButton onClick={enterMobileFullscreen}>
            <Activity size={24} />
            View Simulation
          </ViewSimButton>

          <VideoSection>
            <CanvasContainer>
              <SimCanvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              <HUD>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Day {stats.day}
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Susceptible:</span>
                    <span style={{ fontWeight: 600, color: '#3b82f6' }}>{stats.S}</span>
                  </div>
                  {stats.E > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.7 }}>Exposed:</span>
                      <span style={{ fontWeight: 600, color: '#fbbf24' }}>{stats.E}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Infected:</span>
                    <span style={{ fontWeight: 600, color: disease.color }}>{stats.I}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Recovered:</span>
                    <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.R}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.7 }}>R(t):</span>
                      <span style={{ fontWeight: 700, color: stats.rt > 1 ? '#ef4444' : '#22c55e' }}>
                        {stats.rt.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </HUD>
            </CanvasContainer>
          </VideoSection>

          <ControlsSection>
            <SectionTitle>
              <Bug size={20} />
              Disease Selection
            </SectionTitle>

            <DiseaseSelector>
              {Object.values(DISEASE_PROFILES).map(d => (
                <DiseaseButton
                  key={d.id}
                  $color={d.color}
                  $selected={d.id === selectedDisease}
                  onClick={() => {
                    setSelectedDisease(d.id);
                    handleReset();
                  }}
                >
                  <div className="disease-icon" />
                  <div className="disease-info">
                    <div className="disease-name">{d.name}</div>
                    <div className="disease-stats">
                      R₀: {d.r0.typical} | CFR: {(d.cfr * 100).toFixed(1)}% | {d.transmissionMode}
                    </div>
                  </div>
                </DiseaseButton>
              ))}
            </DiseaseSelector>
          </ControlsSection>

          <ControlsSection>
            <TabContainer>
              <Tab $active={activeTab === 'parameters'} onClick={() => setActiveTab('parameters')}>
                <Settings size={16} />
                Parameters
              </Tab>
              <Tab $active={activeTab === 'interventions'} onClick={() => setActiveTab('interventions')}>
                <Shield size={16} />
                Interventions
              </Tab>
              <Tab $active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')}>
                <BarChart3 size={16} />
                Statistics
              </Tab>
            </TabContainer>

            <TabContent>
              {activeTab === 'parameters' && (
                <Grid $columns={3}>
                  <ParameterControl>
                    <div className="header">
                      <span className="label">Population Size</span>
                      <span className="value">{population}</span>
                    </div>
                    <input type="range" min={100} max={2000} step={50} value={population} onChange={(e) => setPopulation(Number(e.target.value))} disabled={isRunning} />
                  </ParameterControl>

                  <ParameterControl>
                    <div className="header">
                      <span className="label">Initial Cases</span>
                      <span className="value">{initialInfected}</span>
                    </div>
                    <input type="range" min={1} max={20} value={initialInfected} onChange={(e) => setInitialInfected(Number(e.target.value))} disabled={isRunning} />
                  </ParameterControl>

                  <ParameterControl>
                    <div className="header">
                      <span className="label">Network Model</span>
                    </div>
                    <select value={simulationMode} onChange={(e) => setSimulationMode(e.target.value as SimulationMode)} disabled={isRunning}>
                      <option value="homogeneous">Homogeneous</option>
                      <option value="regions">Regional Clusters</option>
                      <option value="households">Household Structure</option>
                    </select>
                  </ParameterControl>
                </Grid>
              )}

              {activeTab === 'interventions' && (
                <div>
                  <InterventionGrid>
                    {[
                      { key: 'masks', state: maskWearing, setState: setMaskWearing, icon: Shield, label: 'Mask Mandate', color: '#10b981' },
                      { key: 'distancing', state: socialDistancing, setState: setSocialDistancing, icon: Users, label: 'Social Distancing', color: '#3b82f6' },
                      { key: 'quarantine', state: quarantine, setState: setQuarantine, icon: Home, label: 'Quarantine', color: '#f59e0b' },
                      { key: 'vaccination', state: vaccination, setState: setVaccination, icon: Heart, label: 'Vaccination', color: '#8b5cf6' }
                    ].map(intervention => {
                      const efficacy = disease.interventions[intervention.key as keyof typeof disease.interventions]?.efficacy;
                      return (
                        <InterventionCard
                          key={intervention.key}
                          $active={intervention.state}
                          $color={intervention.color}
                          onClick={() => intervention.setState(!intervention.state)}
                        >
                          <div className="icon">
                            <intervention.icon size={24} />
                          </div>
                          <div className="name">{intervention.label}</div>
                          {efficacy && (
                            <div className="efficacy">
                              {Math.round(efficacy * 100)}% effective
                            </div>
                          )}
                        </InterventionCard>
                      );
                    })}
                  </InterventionGrid>

                  {vaccination && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <ParameterControl>
                        <div className="header">
                          <span className="label">Vaccination Coverage</span>
                          <span className="value">{Math.round(vaccinationRate * 100)}%</span>
                        </div>
                        <input type="range" min={0} max={1} step={0.05} value={vaccinationRate} onChange={(e) => setVaccinationRate(Number(e.target.value))} disabled={isRunning} />
                      </ParameterControl>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'statistics' && (
                <div>
                  <Grid $columns={4}>
                    <StatCard $color="#3b82f6">
                      <div className="label">Attack Rate</div>
                      <div className="value">{((stats.totalCases / population) * 100).toFixed(1)}%</div>
                      <div className="change">Total cases: {stats.totalCases}</div>
                    </StatCard>

                    <StatCard $color={stats.rt > 1 ? '#ef4444' : '#22c55e'}>
                      <div className="label">R(t)</div>
                      <div className="value">{stats.rt.toFixed(2)}</div>
                      <div className="change">{stats.rt > 1 ? 'Outbreak growing' : 'Outbreak declining'}</div>
                    </StatCard>

                    <StatCard $color="#fbbf24">
                      <div className="label">Peak Infected</div>
                      <div className="value">{stats.peakInfected}</div>
                      <div className="change">{((stats.peakInfected / population) * 100).toFixed(1)}% of population</div>
                    </StatCard>

                    <StatCard $color="#dc2626">
                      <div className="label">Case Fatality</div>
                      <div className="value">{stats.D > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(1) : '0'}%</div>
                      <div className="change">Deaths: {stats.D}</div>
                    </StatCard>
                  </Grid>

                  <div style={{ height: '250px', background: 'rgba(0, 0, 0, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '1rem' }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}
            </TabContent>
          </ControlsSection>
        </MaxWidthWrapper>
      </Container>

      {/* Mobile Fullscreen Overlay */}
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

        <HUD $theater>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Day {stats.day}</div>
          <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>S:</span>
              <span style={{ fontWeight: 600, color: '#3b82f6' }}>{stats.S}</span>
            </div>
            {stats.E > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>E:</span>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>{stats.E}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>I:</span>
              <span style={{ fontWeight: 600, color: disease.color }}>{stats.I}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>R:</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.R}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ opacity: 0.7 }}>R(t):</span>
              <span style={{ fontWeight: 700, color: stats.rt > 1 ? '#ef4444' : '#22c55e' }}>{stats.rt.toFixed(2)}</span>
            </div>
          </div>
        </HUD>

        <div style={{ position: 'absolute', bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: '1rem', background: 'rgba(0,0,0,0.9)', padding: '0.5rem 0.8rem', borderRadius: '18px', border: '1px solid rgba(59,130,246,0.5)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', zIndex: 50 }}>
          {(zoomLevel * 100).toFixed(0)}%
        </div>

        <div style={{ position: 'absolute', bottom: 'calc(6rem + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textAlign: 'center', zIndex: 50 }}>
          Pinch to zoom • Drag to pan
        </div>

        <FullscreenControls>
          <FullscreenButton $primary onClick={() => setIsRunning(!isRunning)}>
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