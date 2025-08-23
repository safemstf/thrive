'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { 
  PlayCircle, PauseCircle, RefreshCw, TrendingUp, 
  AlertTriangle, Shield, Users, Heart,
  BarChart3, Settings, Eye, Zap, Home, AlertCircle, Dna, Download,
  Bug, Globe, Calendar, Database, FileText, ChevronDown, Map as MapIcon, Building2,
  Plane, School, ShoppingBag, Building, Activity, User, UserCheck,
  Thermometer, Wind, Droplets, Brain, Timer, Layers, Network, GitBranch
} from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import styled from 'styled-components';

// Import styled components from the styles file
import {
  SimulationContainer,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  DiseaseSelector,
  PlaybackControls,
  SpeedIndicator,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  StatCard,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  GlowButton
} from '../simulationHub.styles';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

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
  location?: number;
  household?: number;
  workplace?: number;
  community?: number;
  mobility: number;
  mask: boolean;
  vaccinated: boolean;
  quarantined: boolean;
  contacts: Set<number>;
  infectionChain?: number[];
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

// Disease Profiles
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
  'smallpox': {
    id: 'smallpox',
    name: 'Smallpox (Historical)',
    pathogen: 'Variola Virus',
    color: '#dc2626',
    transmissionMode: 'Respiratory/Contact',
    r0: { min: 3, max: 7, typical: 5 },
    incubationDays: { min: 7, max: 19, mean: 12 },
    infectiousDays: { min: 7, max: 10, mean: 8 },
    cfr: 0.3,
    ageSpecificCFR: { child: 0.4, adult: 0.3, elderly: 0.35 },
    transmissionProb: 0.08,
    asymptomaticRate: 0.01,
    hospitalizationRate: 0.8,
    vaccineEfficacy: 0.95,
    naturalImmunityDuration: 36500,
    interventions: {
      masks: { efficacy: 0.3 },
      distancing: { efficacy: 0.4 },
      quarantine: { efficacy: 0.95 },
      vaccination: { efficacy: 0.95 },
      lockdown: { efficacy: 0.85 },
      testing: { efficacy: 0.6 }
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
  },
  'monkeypox': {
    id: 'monkeypox',
    name: 'Monkeypox',
    pathogen: 'Monkeypox Virus',
    color: '#059669',
    transmissionMode: 'Contact/Droplet',
    r0: { min: 0.5, max: 2, typical: 1 },
    incubationDays: { min: 5, max: 21, mean: 9 },
    infectiousDays: { min: 14, max: 28, mean: 21 },
    cfr: 0.03,
    ageSpecificCFR: { child: 0.05, adult: 0.02, elderly: 0.04 },
    transmissionProb: 0.02,
    asymptomaticRate: 0.1,
    hospitalizationRate: 0.1,
    vaccineEfficacy: 0.85,
    naturalImmunityDuration: 3650,
    interventions: {
      masks: { efficacy: 0.3 },
      distancing: { efficacy: 0.6 },
      quarantine: { efficacy: 0.9 },
      vaccination: { efficacy: 0.85 },
      lockdown: { efficacy: 0.7 },
      testing: { efficacy: 0.5 }
    }
  }
};

// Additional styled components for network overlay
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

const Grid = styled.div<{ $columns: number; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: ${props => props.$gap || '1rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;


// Main Component
export default function DiseaseSimulation({ isDark = false, isRunning: externalRunning = true, speed: externalSpeed = 1 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const animationRef = useRef<number | null>(null);
  const networkConnections = useRef<Map<number, Set<number>>>(new Map());
  const ticksPerDay = 30;

  // State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('covid19');
  const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'interventions' | 'statistics'>('parameters');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('spatial-network');

  // Get current disease profile
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

  // Canvas dimensions
  const canvasWidth = useRef(1200);
  const canvasHeight = useRef(675);

  // Network Generation Functions
  const generateSpatialNetwork = (agents: Agent[], width: number, height: number) => {
    const connections = new Map<number, Set<number>>();
    const numClusters = 6;
    const clusters: { x: number; y: number; radius: number; members: number[] }[] = [];
    
    for (let i = 0; i < numClusters; i++) {
      clusters.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 100 + Math.random() * 50,
        members: []
      });
    }
    
    agents.forEach((agent, idx) => {
      const distances = clusters.map(c => 
        Math.sqrt((agent.x - c.x) ** 2 + (agent.y - c.y) ** 2)
      );
      const closest = distances.indexOf(Math.min(...distances));
      clusters[closest].members.push(idx);
      agent.community = closest;
    });
    
    clusters.forEach((cluster, clusterIdx) => {
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
      
      if (clusterIdx < clusters.length - 1) {
        const nextCluster = clusters[(clusterIdx + 1) % clusters.length];
        const bridgeCount = 1 + Math.floor(Math.random() * 3);
        for (let b = 0; b < bridgeCount; b++) {
          if (cluster.members.length > 0 && nextCluster.members.length > 0) {
            const from = cluster.members[Math.floor(Math.random() * cluster.members.length)];
            const to = nextCluster.members[Math.floor(Math.random() * nextCluster.members.length)];
            if (!connections.has(from)) connections.set(from, new Set());
            if (!connections.has(to)) connections.set(to, new Set());
            connections.get(from)!.add(to);
            connections.get(to)!.add(from);
          }
        }
      }
    });
    
    return connections;
  };

  const generateSmallWorldNetwork = (agents: Agent[], k: number = 4, p: number = 0.1) => {
    const connections = new Map<number, Set<number>>();
    const n = agents.length;
    
    agents.forEach((_, i) => {
      if (!connections.has(i)) connections.set(i, new Set());
      
      for (let j = 1; j <= k / 2; j++) {
        const neighbor1 = (i + j) % n;
        const neighbor2 = (i - j + n) % n;
        
        connections.get(i)!.add(neighbor1);
        connections.get(i)!.add(neighbor2);
        
        if (!connections.has(neighbor1)) connections.set(neighbor1, new Set());
        if (!connections.has(neighbor2)) connections.set(neighbor2, new Set());
        
        connections.get(neighbor1)!.add(i);
        connections.get(neighbor2)!.add(i);
      }
    });
    
    agents.forEach((_, i) => {
      const neighbors = Array.from(connections.get(i) || []);
      neighbors.forEach(j => {
        if (Math.random() < p && j > i) {
          connections.get(i)!.delete(j);
          connections.get(j)!.delete(i);
          
          let newTarget = Math.floor(Math.random() * n);
          while (newTarget === i || connections.get(i)!.has(newTarget)) {
            newTarget = Math.floor(Math.random() * n);
          }
          
          connections.get(i)!.add(newTarget);
          if (!connections.has(newTarget)) connections.set(newTarget, new Set());
          connections.get(newTarget)!.add(i);
        }
      });
    });
    
    return connections;
  };

  const generateScaleFreeNetwork = (agents: Agent[]) => {
    const connections = new Map<number, Set<number>>();
    const m = 3;
    
    for (let i = 0; i < m + 1; i++) {
      connections.set(i, new Set());
      for (let j = 0; j < m + 1; j++) {
        if (i !== j) connections.get(i)!.add(j);
      }
    }
    
    for (let i = m + 1; i < agents.length; i++) {
      connections.set(i, new Set());
      const degrees = Array.from(connections.entries()).map(([node, conns]) => ({
        node,
        degree: conns.size
      }));
      
      const targets = new Set<number>();
      while (targets.size < m) {
        const totalDegree = degrees.reduce((sum, d) => sum + d.degree, 0);
        let random = Math.random() * totalDegree;
        
        for (const { node, degree } of degrees) {
          random -= degree;
          if (random <= 0 && !targets.has(node) && node !== i) {
            targets.add(node);
            break;
          }
        }
      }
      
      targets.forEach(target => {
        connections.get(i)!.add(target);
        connections.get(target)!.add(i);
      });
    }
    
    return connections;
  };

  // Initialize agents
  const initAgents = useCallback(() => {
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    const newAgents: Agent[] = [];
    
    const ageDistribution = { child: 0.2, adult: 0.65, elderly: 0.15 };
    
    for (let i = 0; i < population; i++) {
      const rand = Math.random();
      let ageGroup: 'child' | 'adult' | 'elderly';
      let age: number;
      let mobility: number;
      
      if (rand < ageDistribution.child) {
        ageGroup = 'child';
        age = Math.floor(Math.random() * 18);
        mobility = 1.5;
      } else if (rand < ageDistribution.child + ageDistribution.adult) {
        ageGroup = 'adult';
        age = 18 + Math.floor(Math.random() * 47);
        mobility = 1.0;
      } else {
        ageGroup = 'elderly';
        age = 65 + Math.floor(Math.random() * 35);
        mobility = 0.5;
      }
      
      let x = Math.random() * width;
      let y = Math.random() * height;
      
      if (simulationMode === 'age-structured') {
        const sectionWidth = width / 3;
        if (ageGroup === 'child') x = Math.random() * sectionWidth;
        else if (ageGroup === 'adult') x = sectionWidth + Math.random() * sectionWidth;
        else x = 2 * sectionWidth + Math.random() * sectionWidth;
      }
      
      newAgents.push({
        id: i,
        x,
        y,
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
        household: Math.floor(i / 4),
        workplace: Math.floor(Math.random() * (population / 20)),
        community: Math.floor(Math.random() * 6)
      });
    }

    const infectionSeeds = Math.min(initialInfected, newAgents.length);
    const infected = new Set<number>();
    
    while (infected.size < infectionSeeds) {
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

    if (simulationMode === 'spatial-network' || simulationMode === 'mobility-network') {
      networkConnections.current = generateSpatialNetwork(newAgents, width, height);
    } else if (simulationMode === 'small-world') {
      networkConnections.current = generateSmallWorldNetwork(newAgents, 6, 0.1);
    } else if (simulationMode === 'scale-free') {
      networkConnections.current = generateScaleFreeNetwork(newAgents);
    }

    agents.current = newAgents;
    setHistory([]);
    setTickCount(0);
    updateStats(newAgents);
  }, [population, initialInfected, disease, vaccination, vaccinationRate, simulationMode]);

  // Update statistics
  const updateStats = (agentList: Agent[]) => {
    const counts = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0 };
    let newCases = 0;
    const outbreakClusters = new Set<number>();
    
    for (const a of agentList) {
      counts[a.state]++;
      if (a.infectionTime === tickCount) {
        newCases++;
      }
      if (a.state === 'I' && a.community !== undefined) {
        outbreakClusters.add(a.community);
      }
    }
    
    const totalCases = counts.I + counts.R + counts.D;
    const peakInfected = Math.max(stats.peakInfected, counts.I);
    
    const infectiousCount = counts.I;
    const recentInfections = agentList.filter(a => 
      a.infectionTime && tickCount - a.infectionTime < ticksPerDay
    ).length;
    const rt = infectiousCount > 0 ? (recentInfections / infectiousCount) * (disease.infectiousDays.mean / 1) : 0;
    
    setStats({
      ...counts,
      rt,
      day: Math.floor(tickCount / ticksPerDay),
      newCases,
      totalCases,
      peakInfected,
      activeOutbreaks: outbreakClusters.size,
      superspreaderEvents: stats.superspreaderEvents + (newCases > 10 ? 1 : 0)
    });
  };

  // Update simulation
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
        
        if (Math.random() < travelRate && agent.community !== undefined) {
          agent.community = Math.floor(Math.random() * 6);
          agent.x = Math.random() * width;
          agent.y = Math.random() * height;
        }
      }
      
      if (agent.state === "E" && agent.exposedTimer) {
        agent.exposedTimer--;
        if (agent.exposedTimer <= 0) {
          agent.state = "I";
          agent.timer = Math.floor(disease.infectiousDays.mean * ticksPerDay * (0.75 + Math.random() * 0.5));
          
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
      
      if (agent.state === "R" && agent.immunity > 0) {
        agent.immunity -= 1 / (disease.naturalImmunityDuration * ticksPerDay);
        if (agent.immunity <= 0) {
          agent.state = "S";
        }
      }
    }
    
    const useNetworkTransmission = ['spatial-network', 'small-world', 'scale-free'].includes(simulationMode);
    
    if (useNetworkTransmission && networkConnections.current.size > 0) {
      for (const infected of agents.current.filter(a => a.state === "I")) {
        const connections = networkConnections.current.get(infected.id) || new Set();
        
        for (const targetId of connections) {
          const susceptible = agents.current[targetId];
          if (!susceptible || (susceptible.state !== "S" && susceptible.state !== "V")) continue;
          
          let transmissionChance = effectiveTransmissionProb;
          
          if (susceptible.immunity > 0) {
            transmissionChance *= (1 - susceptible.immunity);
          }
          
          if (susceptible.ageGroup === 'elderly') transmissionChance *= 1.5;
          if (susceptible.ageGroup === 'child') transmissionChance *= 0.8;
          
          if (contactTracing && infected.contacts.has(targetId)) {
            transmissionChance *= 0.3;
          }
          
          if (Math.random() < transmissionChance) {
            susceptible.state = "E";
            susceptible.exposedTimer = Math.floor(disease.incubationDays.mean * ticksPerDay * (0.5 + Math.random()));
            susceptible.infectedBy = infected.id;
            susceptible.infectionTime = tickCount;
            infected.contacts.add(targetId);
          }
        }
      }
    } else {
      for (const infected of agents.current.filter(a => a.state === "I")) {
        const contactRadius = 50;
        
        for (const susceptible of agents.current) {
          if (susceptible.state !== "S" && susceptible.state !== "V") continue;
          
          const dx = infected.x - susceptible.x;
          const dy = infected.y - susceptible.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < contactRadius) {
            let transmissionChance = effectiveTransmissionProb * (1 - distance / contactRadius);
            
            if (susceptible.immunity > 0) {
              transmissionChance *= (1 - susceptible.immunity);
            }
            
            if (Math.random() < transmissionChance) {
              susceptible.state = "E";
              susceptible.exposedTimer = Math.floor(disease.incubationDays.mean * ticksPerDay * (0.5 + Math.random()));
              susceptible.infectedBy = infected.id;
              susceptible.infectionTime = tickCount;
            }
          }
        }
      }
    }
    
    if (testingRate > 0) {
      const testsToday = Math.floor(population * testingRate / ticksPerDay);
      for (let t = 0; t < testsToday; t++) {
        const idx = Math.floor(Math.random() * agents.current.length);
        const agent = agents.current[idx];
        if (agent.state === "I" && !agent.quarantined) {
          agent.quarantined = true;
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
        V: stats.V,
        rt: stats.rt
      }]);
    }
    
    setTickCount(prev => prev + 1);
  }, [isRunning, speed, disease, socialDistancing, maskWearing, quarantine, lockdown, contactTracing, testingRate, travelRate, tickCount, simulationMode, population, stats]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth.current;
    canvas.height = canvasHeight.current;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (['spatial-network', 'small-world', 'scale-free'].includes(simulationMode) && networkConnections.current.size > 0) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      
      networkConnections.current.forEach((connections, fromId) => {
        const fromAgent = agents.current[fromId];
        if (!fromAgent) return;
        
        connections.forEach(toId => {
          if (toId > fromId) {
            const toAgent = agents.current[toId];
            if (!toAgent) return;
            
            if ((fromAgent.state === 'I' && toAgent.state === 'E') || 
                (fromAgent.state === 'E' && toAgent.state === 'I')) {
              ctx.strokeStyle = `${disease.color}30`;
              ctx.lineWidth = 2;
            } else {
              ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
              ctx.lineWidth = 0.5;
            }
            
            ctx.beginPath();
            ctx.moveTo(fromAgent.x, fromAgent.y);
            ctx.lineTo(toAgent.x, toAgent.y);
            ctx.stroke();
          }
        });
      });
    }

    if (simulationMode === 'age-structured') {
      const sectionWidth = canvas.width / 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 10]);
      
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * sectionWidth, 0);
        ctx.lineTo(i * sectionWidth, canvas.height);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '12px monospace';
      ctx.fillText('Children', sectionWidth * 0.5 - 30, 20);
      ctx.fillText('Adults', sectionWidth * 1.5 - 25, 20);
      ctx.fillText('Elderly', sectionWidth * 2.5 - 30, 20);
    }

    ctx.globalAlpha = 0.08;
    for (const a of agents.current) {
      if (a.state === 'I') {
        const pulseScale = 1 + 0.2 * Math.sin(tickCount * 0.1);
        const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 30 * pulseScale);
        gradient.addColorStop(0, disease.color + '60');
        gradient.addColorStop(1, disease.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 30 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    for (const a of agents.current) {
      if (a.state === 'D') continue;
      
      ctx.beginPath();
      
      let size = a.ageGroup === 'child' ? 2.5 : a.ageGroup === 'elderly' ? 3.5 : 3;
      let color = '#3b82f6';
      
      switch (a.state) {
        case 'S':
          color = '#3b82f6';
          break;
        case 'E':
          color = '#fbbf24';
          size += 0.5;
          break;
        case 'I':
          color = disease.color;
          size += 1;
          ctx.shadowColor = disease.color;
          ctx.shadowBlur = 15;
          break;
        case 'R':
          color = '#22c55e';
          break;
        case 'V':
          color = '#8b5cf6';
          break;
      }
      
      if (a.quarantined) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(a.x - 6, a.y - 6, 12, 12);
        ctx.setLineDash([]);
      }
      
      if (a.mask) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(a.x - 3, a.y, 6, 2);
      }
      
      ctx.fillStyle = color;
      ctx.arc(a.x, a.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = '#4b5563';
    for (const a of agents.current.filter(a => a.state === 'D')) {
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [disease, simulationMode, tickCount]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      update();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, update, render]);

  // Initialize on mount
  useEffect(() => {
    initAgents();
    setTimeout(() => render(), 50);
  }, []);

  // Re-initialize when parameters change
  useEffect(() => {
    initAgents();
    setTimeout(() => render(), 50);
  }, [population, initialInfected, selectedDisease, simulationMode]);

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setTickCount(0);
    setHistory([]);
    initAgents();
    setTimeout(() => render(), 100);
  };

  // Handle export
  const handleExport = () => {
    const data = {
      metadata: {
        disease: disease.name,
        date: new Date().toISOString(),
        parameters: {
          population,
          initialInfected,
          vaccinationCoverage: vaccinationRate,
          contactRate,
          simulationMode
        },
        interventions: {
          socialDistancing,
          maskWearing,
          quarantine,
          vaccination,
          lockdown,
          contactTracing
        }
      },
      epidemiology: {
        basicReproductionNumber: disease.r0.typical,
        effectiveReproductionNumber: stats.rt,
        attackRate: ((stats.totalCases / population) * 100).toFixed(2) + '%',
        caseFatalityRate: (stats.D > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(2) : '0') + '%',
        peakInfected: stats.peakInfected,
        daysToEnd: stats.day
      },
      timeline: history,
      finalState: stats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epidemic_simulation_${disease.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart data
  const chartData = useMemo(() => ({
    labels: history.map(d => `Day ${Math.floor(d.t / ticksPerDay)}`),
    datasets: [
      {
        label: "Susceptible",
        data: history.map(d => d.S),
        borderColor: "#3b82f6",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Exposed",
        data: history.map(d => d.E || 0),
        borderColor: "#fbbf24",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Infected",
        data: history.map(d => d.I),
        borderColor: disease.color,
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Recovered",
        data: history.map(d => d.R),
        borderColor: "#22c55e",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Vaccinated",
        data: history.map(d => d.V),
        borderColor: "#8b5cf6",
        backgroundColor: "transparent",
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  }), [history, disease]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11 },
          color: '#e2e8f0'
        }
      },
      tooltip: { enabled: true }
    },
    scales: {
      x: { 
        display: true,
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: { 
        display: true,
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    },
    animation: { duration: 0 }
  };

  return (
    <SimulationContainer $isDark={isDark}>
      <VideoSection>
        <CanvasContainer>
          <SimCanvas ref={canvasRef} />
          
          <HUD $isDark={isDark}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
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
              {stats.V > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Vaccinated:</span>
                  <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{stats.V}</span>
                </div>
              )}
              {stats.D > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Deaths:</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.D}</span>
                </div>
              )}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>R(t):</span>
                  <span style={{ 
                    fontWeight: 700, 
                    color: stats.rt > 1 ? '#ef4444' : '#22c55e' 
                  }}>
                    {stats.rt.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </HUD>

          {['spatial-network', 'small-world', 'scale-free'].includes(simulationMode) && (
            <NetworkOverlay>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Network size={14} />
                Network Model
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                {simulationMode === 'well-mixed' && (
                  <>Well-Mixed <span style={{ opacity: 0.6 }}>— everyone meets everyone</span></>
                )}
                {simulationMode === 'spatial-network' && (
                  <>Spatial Network <span style={{ opacity: 0.6 }}>— clustered neighbors + bridges</span></>
                )}
                {simulationMode === 'age-structured' && (
                  <>Age-Structured <span style={{ opacity: 0.6 }}>— contacts by age groups</span></>
                )}
                {simulationMode === 'small-world' && (
                  <>Watts–Strogatz Small-World <span style={{ opacity: 0.6 }}>— mostly local, a few shortcuts</span></>
                )}
                {simulationMode === 'scale-free' && (
                  <>Barabási–Albert Scale-Free <span style={{ opacity: 0.6 }}>— hubs with many links</span></>
                )}
                {simulationMode === 'mobility-network' && (
                  <>Mobility Network <span style={{ opacity: 0.6 }}>— people move between regions</span></>
                )}
              </div>
            </NetworkOverlay>
          )}
          
          <DiseaseSelector>
            <button
              onClick={() => setShowDiseaseDropdown(!showDiseaseDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              <Bug size={16} style={{ color: disease.color }} />
              {disease.name}
              <ChevronDown size={14} />
            </button>
            
            {showDiseaseDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '0.5rem',
                minWidth: '280px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 100
              }}>
                {Object.values(DISEASE_PROFILES).map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDisease(d.id);
                      setShowDiseaseDropdown(false);
                      handleReset();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem',
                      background: d.id === selectedDisease ? `${d.color}20` : 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderRadius: '4px',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (d.id !== selectedDisease) {
                        e.currentTarget.style.background = `${d.color}10`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (d.id !== selectedDisease) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: d.color,
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        R₀: {d.r0.typical} | CFR: {(d.cfr * 100).toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DiseaseSelector>
          
          <PlaybackControls>
            <button onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
            </button>
            
            <button onClick={handleReset}>
              <RefreshCw size={24} />
            </button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0 1rem',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={14} />
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '35px' }}>
                {speed}x
              </span>
            </div>
          </PlaybackControls>
          
          <SpeedIndicator>
            <Zap size={14} style={{ marginRight: '0.5rem' }} />
            {speed}x Speed
          </SpeedIndicator>
        </CanvasContainer>
      </VideoSection>
      
      <ControlsSection $isDark={isDark}>
        <TabContainer>
          <Tab 
            $active={activeTab === 'parameters'}
            onClick={() => setActiveTab('parameters')}
          >
            <Settings size={16} style={{ marginRight: '0.5rem' }} />
            Parameters
          </Tab>
          <Tab 
            $active={activeTab === 'interventions'}
            onClick={() => setActiveTab('interventions')}
          >
            <Shield size={16} style={{ marginRight: '0.5rem' }} />
            Interventions
          </Tab>
          <Tab 
            $active={activeTab === 'statistics'}
            onClick={() => setActiveTab('statistics')}
          >
            <BarChart3 size={16} style={{ marginRight: '0.5rem' }} />
            Statistics
          </Tab>
        </TabContainer>
        
        <TabContent>
          {activeTab === 'parameters' && (
            <Grid $columns={3} $gap="1.5rem">
              <ParameterControl>
                <div className="header">
                  <span className="label">Population Size</span>
                  <span className="value">{population}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={population}
                  onChange={(e) => setPopulation(Number(e.target.value))}
                  disabled={isRunning}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Initial Cases</span>
                  <span className="value">{initialInfected}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={initialInfected}
                  onChange={(e) => setInitialInfected(Number(e.target.value))}
                  disabled={isRunning}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Network Model</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>
                    {simulationMode.replace('-', ' ')}
                  </span>
                </div>
                <select
                  value={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.value as SimulationMode)}
                  disabled={isRunning}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '4px',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  <option value="well-mixed" style={{ color: '#000', background: '#fff' }}>
                    Well-Mixed (Random)
                  </option>
                  <option value="spatial-network" style={{ color: '#000', background: '#fff' }}>
                    Spatial Network
                  </option>
                  <option value="age-structured" style={{ color: '#000', background: '#fff' }}>
                    Age-Structured
                  </option>
                  <option value="small-world" style={{ color: '#000', background: '#fff' }}>
                    Small-World Network
                  </option>
                  <option value="scale-free" style={{ color: '#000', background: '#fff' }}>
                    Scale-Free Network
                  </option>
                  <option value="mobility-network" style={{ color: '#000', background: '#fff' }}>
                    Mobility Network
                  </option>
                </select>

              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Contact Rate</span>
                  <span className="value">{contactRate}/day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={contactRate}
                  onChange={(e) => setContactRate(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Testing Rate</span>
                  <span className="value">{(testingRate * 100).toFixed(0)}%/day</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.2}
                  step={0.01}
                  value={testingRate}
                  onChange={(e) => setTestingRate(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Travel Rate</span>
                  <span className="value">{(travelRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.05}
                  step={0.001}
                  value={travelRate}
                  onChange={(e) => setTravelRate(Number(e.target.value))}
                />
              </ParameterControl>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <GlowButton onClick={handleExport} $color="#3b82f6">
                  <Download size={14} style={{ marginRight: '0.5rem' }} />
                  Export Data
                </GlowButton>
              </div>
            </Grid>
          )}
          
          {activeTab === 'interventions' && (
            <div>
              <InterventionGrid>
                {[
                  { key: 'masks', state: maskWearing, setState: setMaskWearing, icon: <Shield />, label: 'Mask Mandate', color: '#10b981' },
                  { key: 'distancing', state: socialDistancing, setState: setSocialDistancing, icon: <Users />, label: 'Social Distancing', color: '#3b82f6' },
                  { key: 'quarantine', state: quarantine, setState: setQuarantine, icon: <Home />, label: 'Quarantine', color: '#f59e0b' },
                  { key: 'vaccination', state: vaccination, setState: setVaccination, icon: <Heart />, label: 'Vaccination', color: '#8b5cf6' },
                  { key: 'lockdown', state: lockdown, setState: setLockdown, icon: <Building2 />, label: 'Lockdown', color: '#ef4444' },
                  { key: 'testing', state: contactTracing, setState: setContactTracing, icon: <Activity />, label: 'Contact Tracing', color: '#06b6d4' }
                ].map(intervention => (
                  <InterventionCard
                    key={intervention.key}
                    $active={intervention.state}
                    $color={intervention.color}
                    onClick={() => intervention.setState(!intervention.state)}
                  >
                    <div className="icon">
                      {React.cloneElement(intervention.icon, { size: 24 })}
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
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={vaccinationRate}
                      onChange={(e) => setVaccinationRate(Number(e.target.value))}
                      disabled={isRunning}
                    />
                  </ParameterControl>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'statistics' && (
            <div>
              <Grid $columns={4} $gap="1rem" style={{ marginBottom: '1.5rem' }}>
                <StatCard $color="#3b82f6">
                  <div className="label">Attack Rate</div>
                  <div className="value">
                    {((stats.totalCases / population) * 100).toFixed(1)}%
                  </div>
                  <div className="change">Total cases: {stats.totalCases}</div>
                </StatCard>
                
                <StatCard $color={stats.rt > 1 ? '#ef4444' : '#22c55e'}>
                  <div className="label">R(t)</div>
                  <div className="value">{stats.rt.toFixed(2)}</div>
                  <div className="change">
                    {stats.rt > 1 ? 'Outbreak growing' : 'Outbreak declining'}
                  </div>
                </StatCard>
                
                <StatCard $color="#fbbf24">
                  <div className="label">Peak Infected</div>
                  <div className="value">{stats.peakInfected}</div>
                  <div className="change">
                    {((stats.peakInfected / population) * 100).toFixed(1)}% of population
                  </div>
                </StatCard>
                
                <StatCard $color="#dc2626">
                  <div className="label">Case Fatality</div>
                  <div className="value">
                    {stats.D > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(1) : '0'}%
                  </div>
                  <div className="change">Deaths: {stats.D}</div>
                </StatCard>
              </Grid>
              
              <div style={{ 
                height: '250px',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
        </TabContent>
      </ControlsSection>
    </SimulationContainer>
  );
}