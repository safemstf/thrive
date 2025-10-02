'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  PlayCircle, PauseCircle, RefreshCw, Shield, Users, Heart,
  BarChart3, Settings, Zap, Home, Building2,
  Bug, ChevronDown, Download, Activity, Network, Maximize, X
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Types
interface Agent {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: "S" | "E" | "I" | "R" | "D" | "V";
  timer: number;
  immunity: number;
  age: number;
  ageGroup: 'child' | 'adult' | 'elderly';
  exposedTimer?: number;
  infectedBy?: number;
  infectionTime?: number;
  community?: number;
  mobility: number;
  mask: boolean;
  vaccinated: boolean;
  quarantined: boolean;
  contacts: Set<number>;
}

type SimulationMode = 'well-mixed' | 'spatial-network' | 'age-structured' | 'mobility-network' | 'small-world' | 'scale-free';

interface DiseaseProfile {
  id: string;
  name: string;
  pathogen: string;
  color: string;
  transmissionMode: string;
  r0: { min: number; max: number; typical: number };
  incubationDays: { min: number; max: number; mean: number };
  infectiousDays: { min: number; max: number; mean: number };
  cfr: number;
  ageSpecificCFR: { child: number; adult: number; elderly: number };
  transmissionProb: number;
  asymptomaticRate: number;
  hospitalizationRate: number;
  vaccineEfficacy: number;
  naturalImmunityDuration: number;
  interventions: {
    masks: { efficacy: number };
    distancing: { efficacy: number };
    quarantine: { efficacy: number };
    vaccination: { efficacy: number };
    lockdown: { efficacy: number };
    testing: { efficacy: number };
  };
}

const DISEASE_PROFILES: Record<string, DiseaseProfile> = {
  'covid19': {
    id: 'covid19',
    name: 'COVID-19 (SARS-CoV-2)',
    pathogen: 'Coronavirus',
    color: '#ef4444',
    transmissionMode: 'Airborne/Droplet',
    r0: { min: 2, max: 8, typical: 3.5 },
    incubationDays: { min: 2, max: 14, mean: 5 },
    infectiousDays: { min: 5, max: 10, mean: 7 },
    cfr: 0.01,
    ageSpecificCFR: { child: 0.001, adult: 0.005, elderly: 0.08 },
    transmissionProb: 0.06,
    asymptomaticRate: 0.3,
    hospitalizationRate: 0.05,
    vaccineEfficacy: 0.85,
    naturalImmunityDuration: 180,
    interventions: {
      masks: { efficacy: 0.5 },
      distancing: { efficacy: 0.6 },
      quarantine: { efficacy: 0.8 },
      vaccination: { efficacy: 0.85 },
      lockdown: { efficacy: 0.75 },
      testing: { efficacy: 0.4 }
    }
  },
  'influenza': {
    id: 'influenza',
    name: 'Seasonal Influenza',
    pathogen: 'Influenza Virus',
    color: '#3b82f6',
    transmissionMode: 'Airborne/Droplet',
    r0: { min: 1, max: 2, typical: 1.3 },
    incubationDays: { min: 1, max: 4, mean: 2 },
    infectiousDays: { min: 3, max: 7, mean: 5 },
    cfr: 0.001,
    ageSpecificCFR: { child: 0.0001, adult: 0.0005, elderly: 0.005 },
    transmissionProb: 0.04,
    asymptomaticRate: 0.2,
    hospitalizationRate: 0.01,
    vaccineEfficacy: 0.6,
    naturalImmunityDuration: 365,
    interventions: {
      masks: { efficacy: 0.4 },
      distancing: { efficacy: 0.5 },
      quarantine: { efficacy: 0.7 },
      vaccination: { efficacy: 0.6 },
      lockdown: { efficacy: 0.6 },
      testing: { efficacy: 0.3 }
    }
  },
  'measles': {
    id: 'measles',
    name: 'Measles',
    pathogen: 'Measles Virus',
    color: '#f59e0b',
    transmissionMode: 'Airborne',
    r0: { min: 12, max: 18, typical: 15 },
    incubationDays: { min: 7, max: 21, mean: 10 },
    infectiousDays: { min: 4, max: 8, mean: 6 },
    cfr: 0.002,
    ageSpecificCFR: { child: 0.003, adult: 0.001, elderly: 0.002 },
    transmissionProb: 0.15,
    asymptomaticRate: 0.05,
    hospitalizationRate: 0.02,
    vaccineEfficacy: 0.97,
    naturalImmunityDuration: 36500,
    interventions: {
      masks: { efficacy: 0.2 },
      distancing: { efficacy: 0.3 },
      quarantine: { efficacy: 0.9 },
      vaccination: { efficacy: 0.97 },
      lockdown: { efficacy: 0.8 },
      testing: { efficacy: 0.5 }
    }
  },
  'ebola': {
    id: 'ebola',
    name: 'Ebola',
    pathogen: 'Ebola Virus',
    color: '#7c3aed',
    transmissionMode: 'Contact/Bodily Fluids',
    r0: { min: 1.5, max: 2.5, typical: 2 },
    incubationDays: { min: 2, max: 21, mean: 8 },
    infectiousDays: { min: 7, max: 14, mean: 10 },
    cfr: 0.5,
    ageSpecificCFR: { child: 0.6, adult: 0.45, elderly: 0.7 },
    transmissionProb: 0.03,
    asymptomaticRate: 0.02,
    hospitalizationRate: 0.95,
    vaccineEfficacy: 0.75,
    naturalImmunityDuration: 3650,
    interventions: {
      masks: { efficacy: 0.2 },
      distancing: { efficacy: 0.7 },
      quarantine: { efficacy: 0.98 },
      vaccination: { efficacy: 0.75 },
      lockdown: { efficacy: 0.9 },
      testing: { efficacy: 0.7 }
    }
  }
};

// Styled Components
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0e1a, #1a1a2e);
  color: #e6eef8;
  padding: 2rem 1rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const MaxWidthWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
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
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
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

const HUD = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.9rem;
  z-index: 12;
  min-width: 180px;
`;

const NetworkOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  font-size: 0.75rem;
  color: #fff;
  z-index: 10;
  max-width: 250px;
`;

const PlaybackControls = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 1.25rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: rgba(0,0,0,0.85);
  padding: 0.6rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(59,130,246,0.3);
  z-index: 12;
  
  button {
    background: transparent;
    border: none;
    color: #e6eef8;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    min-width: 44px;
    min-height: 44px;
    justify-content: center;
  }
`;

const ControlsSection = styled.section`
  width: 100%;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(8,12,20,0.6);
  border: 1px solid rgba(59,130,246,0.1);
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
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
  
  @media (max-width: 768px) {
    gap: 0.3rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
    min-height: 44px;
  }
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
    gap: 0.75rem;
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
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    min-height: 90px;
    
    .name {
      font-size: 0.85rem;
    }
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
}


export default function DiseaseSimulation({
  isDark = false,
  isRunning: isRunningProp = false,
  speed: speedProp = 1
}: DiseaseSimulationProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const animationRef = useRef<number | null>(null);
  const networkConnections = useRef<Map<number, Set<number>>>(new Map());
  const ticksPerDay = 30;


  // Pan & Zoom
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchStartDistanceRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(1);

  // State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('covid19');
  const [activeTab, setActiveTab] = useState<'parameters' | 'interventions' | 'statistics'>('parameters');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('spatial-network');

  const disease = DISEASE_PROFILES[selectedDisease];

  // Parameters
  const [population, setPopulation] = useState(800);
  const [initialInfected, setInitialInfected] = useState(3);
  const [vaccinationRate, setVaccinationRate] = useState(0);
  const [contactRate, setContactRate] = useState(12);
  const [testingRate, setTestingRate] = useState(0);
  const [travelRate, setTravelRate] = useState(0.01);

  // Interventions
  const [socialDistancing, setSocialDistancing] = useState(false);
  const [vaccination, setVaccination] = useState(false);
  const [quarantine, setQuarantine] = useState(false);
  const [maskWearing, setMaskWearing] = useState(false);
  const [lockdown, setLockdown] = useState(false);
  const [contactTracing, setContactTracing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    S: 0, E: 0, I: 0, R: 0, D: 0, V: 0,
    rt: 0,
    day: 0,
    newCases: 0,
    totalCases: 0,
    peakInfected: 0,
    activeOutbreaks: 0,
    superspreaderEvents: 0
  });

  const canvasWidth = useRef(1200);
  const canvasHeight = useRef(675);

  // Network generation (simplified for brevity)
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
      agent.community = closest;
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
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    const newAgents: Agent[] = [];

    for (let i = 0; i < population; i++) {
      const rand = Math.random();
      let ageGroup: 'child' | 'adult' | 'elderly';
      let age: number;
      let mobility: number;

      if (rand < 0.2) {
        ageGroup = 'child';
        age = Math.floor(Math.random() * 18);
        mobility = 1.5;
      } else if (rand < 0.85) {
        ageGroup = 'adult';
        age = 18 + Math.floor(Math.random() * 47);
        mobility = 1.0;
      } else {
        ageGroup = 'elderly';
        age = 65 + Math.floor(Math.random() * 35);
        mobility = 0.5;
      }

      newAgents.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2 * mobility,
        vy: (Math.random() - 0.5) * 2 * mobility,
        state: "S",
        timer: 0,
        immunity: 0,
        age,
        ageGroup,
        mobility,
        mask: false,
        vaccinated: false,
        quarantined: false,
        contacts: new Set(),
        community: Math.floor(Math.random() * 6)
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
      const sortedByAge = [...newAgents].sort((a, b) => b.age - a.age);
      for (const agent of sortedByAge) {
        if (vaccinated >= numToVaccinate) break;
        if (agent.state === "S") {
          agent.state = "V";
          agent.immunity = disease.vaccineEfficacy;
          agent.vaccinated = true;
          vaccinated++;
        }
      }
    }

    if (simulationMode === 'spatial-network') {
      networkConnections.current = generateSpatialNetwork(newAgents, width, height);
    }

    agents.current = newAgents;
    setHistory([]);
    setTickCount(0);
    updateStats(newAgents);
  }, [population, initialInfected, disease, vaccination, vaccinationRate, simulationMode]);

  const updateStats = (agentList: Agent[]) => {
    const counts = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0 };
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
      peakInfected,
      activeOutbreaks: 0,
      superspreaderEvents: 0
    });
  };

  const update = useCallback(() => {
    if (!isRunning) return;

    const width = canvasWidth.current;
    const height = canvasHeight.current;

    const maskEffect = maskWearing ? (1 - disease.interventions.masks.efficacy) : 1;
    const distanceEffect = socialDistancing ? (1 - disease.interventions.distancing.efficacy) : 1;
    const lockdownEffect = lockdown ? (1 - disease.interventions.lockdown.efficacy) : 1;
    const effectiveTransmissionProb = disease.transmissionProb * maskEffect * distanceEffect * lockdownEffect;
    const speedMultiplier = lockdown ? 0.1 : (socialDistancing ? 0.5 : 1.0);

    for (const agent of agents.current) {
      if (!agent.quarantined) {
        const mobility = agent.mobility * speedMultiplier * speed;
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
          if (quarantine && Math.random() > disease.asymptomaticRate) {
            agent.quarantined = true;
          }
        }
      } else if (agent.state === "I") {
        agent.timer--;
        if (agent.timer <= 0) {
          const cfr = disease.ageSpecificCFR[agent.ageGroup];
          if (Math.random() < cfr) {
            agent.state = "D";
            agent.vx = 0;
            agent.vy = 0;
          } else {
            agent.state = "R";
            agent.immunity = 0.95;
            agent.quarantined = false;
          }
        }
      }
    }

    if (simulationMode === 'spatial-network' && networkConnections.current.size > 0) {
      for (const infected of agents.current.filter(a => a.state === "I")) {
        const connections = networkConnections.current.get(infected.id) || new Set();
        for (const targetId of connections) {
          const susceptible = agents.current[targetId];
          if (!susceptible || (susceptible.state !== "S" && susceptible.state !== "V")) continue;

          let transmissionChance = effectiveTransmissionProb;
          if (susceptible.immunity > 0) transmissionChance *= (1 - susceptible.immunity);

          if (Math.random() < transmissionChance) {
            susceptible.state = "E";
            susceptible.exposedTimer = Math.floor(disease.incubationDays.mean * ticksPerDay);
            susceptible.infectedBy = infected.id;
            susceptible.infectionTime = tickCount;
          }
        }
      }
    } else {
      for (const infected of agents.current.filter(a => a.state === "I")) {
        for (const susceptible of agents.current) {
          if (susceptible.state !== "S" && susceptible.state !== "V") continue;

          const dx = infected.x - susceptible.x;
          const dy = infected.y - susceptible.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50) {
            let transmissionChance = effectiveTransmissionProb * (1 - distance / 50);
            if (susceptible.immunity > 0) transmissionChance *= (1 - susceptible.immunity);

            if (Math.random() < transmissionChance) {
              susceptible.state = "E";
              susceptible.exposedTimer = Math.floor(disease.incubationDays.mean * ticksPerDay);
              susceptible.infectionTime = tickCount;
            }
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
  }, [isRunning, speed, disease, socialDistancing, maskWearing, quarantine, lockdown, tickCount, simulationMode, stats]);

  const render = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    if (simulationMode === 'spatial-network' && networkConnections.current.size > 0) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
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

    for (const a of agents.current) {
      if (a.state === 'D') continue;
      let size = a.ageGroup === 'child' ? 2.5 : a.ageGroup === 'elderly' ? 3.5 : 3;
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

  // Touch handlers
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
  // Sync isRunning prop with internal state
  useEffect(() => {
    setIsRunning(isRunningProp);
  }, [isRunningProp]);

  // Sync speed prop with internal state
  useEffect(() => {
    setSpeed(speedProp);
  }, [speedProp]);

  // Optional: Use isDark for theme adjustments
  useEffect(() => {
    if (isDark) {
      // Apply dark theme colors if you want different rendering for dark mode
      // For example, you could adjust the canvas background or particle colors
    }
  }, [isDark]);

  useEffect(() => {
    const animate = () => {
      update();
      if (!isFullscreen) render(canvasRef.current);
      else render(fullscreenCanvasRef.current);
      if (isRunning) animationRef.current = requestAnimationFrame(animate);
    };
    if (isRunning) animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRunning, update, render, isFullscreen]);

  useEffect(() => {
    const canvas = isFullscreen ? fullscreenCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvasWidth.current = rect.width;
      canvasHeight.current = rect.height;
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
  }, [isFullscreen, handleWheel]);

  useEffect(() => {
    initAgents();
    setTimeout(() => render(canvasRef.current), 50);
  }, [population, initialInfected, selectedDisease, simulationMode]);

  const handleReset = () => {
    setIsRunning(false);
    setTickCount(0);
    setHistory([]);
    initAgents();
    resetView();
    setTimeout(() => {
      if (!isFullscreen) render(canvasRef.current);
      else render(fullscreenCanvasRef.current);
    }, 100);
  };

  const enterFullscreen = () => {
    setIsFullscreen(true);
    setIsRunning(true);
    resetView();
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
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

  return (
    <>
      <Container>
        <MaxWidthWrapper>
          <Header>
            <Title>Epidemic Simulation</Title>
            <Subtitle>Configure parameters and interventions below</Subtitle>
          </Header>

          <ViewSimButton onClick={enterFullscreen}>
            <Maximize size={24} />
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

              {simulationMode === 'spatial-network' && (
                <NetworkOverlay>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Network size={14} />
                    Spatial Network
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                    Clustered neighbors + bridges
                  </div>
                </NetworkOverlay>
              )}

              <PlaybackControls>
                <button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
                </button>
                <button onClick={handleReset}>
                  <RefreshCw size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', borderLeft: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <Zap size={14} />
                  <input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: '100px' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '35px' }}>{speed}x</span>
                </div>
              </PlaybackControls>
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
                      <span className="value" style={{ textTransform: 'capitalize' }}>{simulationMode.replace('-', ' ')}</span>
                    </div>
                    <select value={simulationMode} onChange={(e) => setSimulationMode(e.target.value as SimulationMode)} disabled={isRunning}>
                      <option value="well-mixed">Well-Mixed (Random)</option>
                      <option value="spatial-network">Spatial Network</option>
                      <option value="age-structured">Age-Structured</option>
                      <option value="small-world">Small-World Network</option>
                      <option value="scale-free">Scale-Free Network</option>
                      <option value="mobility-network">Mobility Network</option>
                    </select>
                  </ParameterControl>

                  <ParameterControl>
                    <div className="header">
                      <span className="label">Contact Rate</span>
                      <span className="value">{contactRate}/day</span>
                    </div>
                    <input type="range" min={1} max={30} value={contactRate} onChange={(e) => setContactRate(Number(e.target.value))} />
                  </ParameterControl>

                  <ParameterControl>
                    <div className="header">
                      <span className="label">Testing Rate</span>
                      <span className="value">{(testingRate * 100).toFixed(0)}%/day</span>
                    </div>
                    <input type="range" min={0} max={0.2} step={0.01} value={testingRate} onChange={(e) => setTestingRate(Number(e.target.value))} />
                  </ParameterControl>

                  <ParameterControl>
                    <div className="header">
                      <span className="label">Travel Rate</span>
                      <span className="value">{(travelRate * 100).toFixed(1)}%</span>
                    </div>
                    <input type="range" min={0} max={0.05} step={0.001} value={travelRate} onChange={(e) => setTravelRate(Number(e.target.value))} />
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
                      { key: 'vaccination', state: vaccination, setState: setVaccination, icon: Heart, label: 'Vaccination', color: '#8b5cf6' },
                      { key: 'lockdown', state: lockdown, setState: setLockdown, icon: Building2, label: 'Lockdown', color: '#ef4444' },
                      { key: 'testing', state: contactTracing, setState: setContactTracing, icon: Activity, label: 'Contact Tracing', color: '#06b6d4' }
                    ].map(intervention => (
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
                        <div className="efficacy">
                          {Math.round((disease.interventions[intervention.key as keyof typeof disease.interventions]?.efficacy || 0) * 100)}% effective
                        </div>
                      </InterventionCard>
                    ))}
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

      <FullscreenOverlay $show={isFullscreen}>
        <FullscreenCanvas
          ref={fullscreenCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        <HUD>
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

        <div style={{ position: 'absolute', bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: '1rem', background: 'rgba(0,0,0,0.9)', padding: '0.5rem 0.8rem', borderRadius: '18px', border: '1px solid rgba(59,130,246,0.5)', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>
          {(zoomLevel * 100).toFixed(0)}%
        </div>

        <div style={{ position: 'absolute', bottom: 'calc(6rem + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textAlign: 'center' }}>
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
            <Maximize size={20} />
          </FullscreenButton>
        </FullscreenControls>

        <ExitButton onClick={exitFullscreen}>
          <X size={20} />
        </ExitButton>
      </FullscreenOverlay>
    </>
  );
}