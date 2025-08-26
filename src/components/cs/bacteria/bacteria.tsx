import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PlayCircle, PauseCircle, RefreshCw, Activity, Shield, Pill,
  Heart, TrendingUp, AlertTriangle, Microscope, Zap, Info,
  BarChart3, Settings, Dna, Download, Bug, ChevronDown,
  Thermometer, Wind, Droplets, Brain, Timer, FileText,
  Clock, Calendar, ArrowRight, Waves
} from "lucide-react";
import { Line } from "react-chartjs-2";
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// ============= PERFORMANCE CONFIGURATION =============
const PERFORMANCE_CONFIG = {
  MAX_BACTERIA: 300,
  MAX_BLOOD_CELLS: 150,
  MAX_PHAGES: 50,
  MAX_CYTOKINES: 30,
  RENDER_QUALITY: 'adaptive', // 'low', 'medium', 'high', 'adaptive'
  PHYSICS_UPDATE_RATE: 2, // Update physics every N frames
  COLLISION_CHECK_RADIUS: 100, // Only check collisions within this radius
  USE_SPATIAL_HASHING: true,
  BATCH_RENDER: true,
  ADAPTIVE_TIMESTEP: true
};

// ============= TYPE DEFINITIONS =============
type BacterialSpecies = "S_aureus" | "E_coli" | "P_aeruginosa" | "K_pneumoniae" | "S_pyogenes" | "E_faecalis";
type CellType = "rbc" | "neutrophil" | "macrophage" | "lymphocyte" | "platelet";
type AntibioticClass = "penicillin" | "vancomycin" | "ciprofloxacin" | "gentamicin" | "ceftriaxone";

interface Bacterium {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  species: BacterialSpecies;
  gramPositive: boolean;
  health: number;
  replicationTimer: number;
  resistance: Record<AntibioticClass, number>;
  virulence: number;
  adherent: boolean;
  biofilm: boolean;
  phageInfected: boolean;
  opsonized?: boolean;
  generation: number;
  age: number;
  gridKey?: string; // For spatial hashing
}

interface BloodCell {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  type: CellType;
  activated: boolean;
  health: number;
  phagocyticCapacity?: number;
  targetId?: number;
  cytokineProduction?: number;
  age: number;
  gridKey?: string;
}

interface Phage {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  hostSpecificity: BacterialSpecies[];
  attached: boolean;
  targetId?: number;
  burstSize: number;
}

interface Cytokine {
  x: number;
  y: number;
  z: number;
  type: 'IL1' | 'TNF' | 'IFN' | 'IL6' | 'IL10';
  intensity: number;
  radius: number;
  age: number;
}

interface AntibioticZone {
  concentration: number;
  type: AntibioticClass;
  peakTime: number;
  halfLife: number;
}

// ============= SPATIAL HASH GRID =============
class SpatialHashGrid {
  private grid: Map<string, Set<any>>;
  private cellSize: number;

  constructor(cellSize: number = 50) {
    this.grid = new Map();
    this.cellSize = cellSize;
  }

  clear() {
    this.grid.clear();
  }

  getKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    return `${gridX},${gridY}`;
  }

  add(entity: any) {
    const key = this.getKey(entity.x, entity.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(entity);
    entity.gridKey = key;
  }

  remove(entity: any) {
    if (entity.gridKey && this.grid.has(entity.gridKey)) {
      this.grid.get(entity.gridKey)!.delete(entity);
    }
  }

  getNearby(x: number, y: number, radius: number): any[] {
    const results: any[] = [];
    const cellsToCheck = Math.ceil(radius / this.cellSize);
    const centerX = Math.floor(x / this.cellSize);
    const centerY = Math.floor(y / this.cellSize);

    for (let dx = -cellsToCheck; dx <= cellsToCheck; dx++) {
      for (let dy = -cellsToCheck; dy <= cellsToCheck; dy++) {
        const key = `${centerX + dx},${centerY + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach(entity => {
            const dist = Math.sqrt((entity.x - x) ** 2 + (entity.y - y) ** 2);
            if (dist <= radius) {
              results.push(entity);
            }
          });
        }
      }
    }
    return results;
  }

  update(entity: any) {
    const newKey = this.getKey(entity.x, entity.y);
    if (entity.gridKey !== newKey) {
      this.remove(entity);
      this.add(entity);
    }
  }
}

// ============= BACTERIAL PROFILES (SIMPLIFIED BUT COMPLETE) =============
const BACTERIAL_PROFILES = {
  S_aureus: {
    name: "Staphylococcus aureus",
    gramPositive: true,
    color: "#FFD700",
    size: 8,
    virulence: 0.8,
    divisionTime: 0.5,
    speed: 0.3,
    adherence: 0.7,
    defaultResistance: { 
      penicillin: 0.7,
      vancomycin: 0.05,
      ciprofloxacin: 0.3,
      gentamicin: 0.2,
      ceftriaxone: 0.4
    }
  },
  E_coli: {
    name: "Escherichia coli",
    gramPositive: false,
    color: "#00FF00",
    size: 10,
    virulence: 0.6,
    divisionTime: 0.33,
    speed: 0.5,
    adherence: 0.4,
    defaultResistance: {
      penicillin: 0.9,
      vancomycin: 1.0,
      ciprofloxacin: 0.35,
      gentamicin: 0.25,
      ceftriaxone: 0.3
    }
  },
  P_aeruginosa: {
    name: "Pseudomonas aeruginosa",
    gramPositive: false,
    color: "#00CED1",
    size: 12,
    virulence: 0.7,
    divisionTime: 0.58,
    speed: 0.7,
    adherence: 0.8,
    defaultResistance: {
      penicillin: 1.0,
      vancomycin: 1.0,
      ciprofloxacin: 0.4,
      gentamicin: 0.35,
      ceftriaxone: 0.8
    }
  },
  K_pneumoniae: {
    name: "Klebsiella pneumoniae",
    gramPositive: false,
    color: "#8A2BE2",
    size: 10,
    virulence: 0.65,
    divisionTime: 0.42,
    speed: 0.4,
    adherence: 0.5,
    defaultResistance: {
      penicillin: 1.0,
      vancomycin: 1.0,
      ciprofloxacin: 0.4,
      gentamicin: 0.3,
      ceftriaxone: 0.45
    }
  },
  S_pyogenes: {
    name: "Streptococcus pyogenes",
    gramPositive: true,
    color: "#FF4500",
    size: 7,
    virulence: 0.75,
    divisionTime: 0.47,
    speed: 0.35,
    adherence: 0.6,
    defaultResistance: {
      penicillin: 0.0,
      vancomycin: 0.0,
      ciprofloxacin: 0.25,
      gentamicin: 0.4,
      ceftriaxone: 0.05
    }
  },
  E_faecalis: {
    name: "Enterococcus faecalis",
    gramPositive: true,
    color: "#F4A460",
    size: 9,
    virulence: 0.5,
    divisionTime: 0.55,
    speed: 0.25,
    adherence: 0.7,
    defaultResistance: {
      penicillin: 0.4,
      vancomycin: 0.3,
      ciprofloxacin: 0.5,
      gentamicin: 0.6,
      ceftriaxone: 1.0
    }
  }
};

const ANTIBIOTIC_PROFILES = {
  penicillin: {
    name: "Penicillin G",
    class: "β-Lactam",
    color: "rgba(65, 105, 225, 0.3)",
    spectrum: { gramPos: 0.8, gramNeg: 0.3 },
    halfLife: 0.5,
    peakTime: 0.5,
    therapeuticRange: { min: 0.1, max: 10 }
  },
  vancomycin: {
    name: "Vancomycin",
    class: "Glycopeptide",
    color: "rgba(139, 0, 0, 0.3)",
    spectrum: { gramPos: 0.95, gramNeg: 0.0 },
    halfLife: 6,
    peakTime: 2,
    therapeuticRange: { min: 10, max: 20 }
  },
  ciprofloxacin: {
    name: "Ciprofloxacin",
    class: "Fluoroquinolone",
    color: "rgba(255, 20, 147, 0.3)",
    spectrum: { gramPos: 0.7, gramNeg: 0.85 },
    halfLife: 4,
    peakTime: 1,
    therapeuticRange: { min: 0.5, max: 3 }
  },
  gentamicin: {
    name: "Gentamicin",
    class: "Aminoglycoside",
    color: "rgba(46, 139, 87, 0.3)",
    spectrum: { gramPos: 0.6, gramNeg: 0.8 },
    halfLife: 2,
    peakTime: 0.5,
    therapeuticRange: { min: 4, max: 10 }
  },
  ceftriaxone: {
    name: "Ceftriaxone",
    class: "3rd Gen Cephalosporin",
    color: "rgba(255, 140, 0, 0.3)",
    spectrum: { gramPos: 0.85, gramNeg: 0.9 },
    halfLife: 8,
    peakTime: 2,
    therapeuticRange: { min: 20, max: 100 }
  }
};

export default function OptimizedBloodVesselSimulator({ isDark = true }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const spatialGridRef = useRef<SpatialHashGrid>(new SpatialHashGrid(100));
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simulationTime, setSimulationTime] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  
  // Entities
  const bacteriaRef = useRef<Bacterium[]>([]);
  const bloodCellsRef = useRef<BloodCell[]>([]);
  const phagesRef = useRef<Phage[]>([]);
  const cytokinesRef = useRef<Cytokine[]>([]);
  const antibioticsRef = useRef<AntibioticZone[]>([]);
  
  // Performance monitoring
  const [fps, setFps] = useState(60);
  const lastTimeRef = useRef(performance.now());
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('medium');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'microbiology' | 'therapy' | 'immunology'>('microbiology');
  const [selectedSpecies, setSelectedSpecies] = useState<BacterialSpecies[]>(["S_aureus"]);
  const [initialBacterialLoad, setInitialBacterialLoad] = useState(10);
  const [immuneCompetence, setImmuneCompetence] = useState(100);
  const [bloodFlowRate, setBloodFlowRate] = useState(5);
  const [activeAntibiotics, setActiveAntibiotics] = useState<Set<AntibioticClass>>(new Set());
  const [immunoglobulin, setImmunoglobulin] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    totalBacteria: 0,
    gramPositive: 0,
    gramNegative: 0,
    adherentBacteria: 0,
    biofilmCoverage: 0,
    neutrophils: 0,
    macrophages: 0,
    phages: 0,
    cytokineLevel: 0,
    sepsisScore: 0,
    bacteremia: false,
    fps: 60,
    quality: 'medium'
  });

  const WIDTH = 1200;
  const HEIGHT = 600;
  const VESSEL_CENTER_Y = HEIGHT / 2;
  const VESSEL_RADIUS = HEIGHT * 0.35;

  // ============= PERFORMANCE MONITORING =============
  const updatePerformance = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    const currentFps = Math.round(1000 / delta);
    setFps(currentFps);
    
    // Adaptive quality
    if (currentFps < 30 && renderQuality !== 'low') {
      setRenderQuality('low');
      PERFORMANCE_CONFIG.PHYSICS_UPDATE_RATE = 3;
    } else if (currentFps > 50 && renderQuality === 'low') {
      setRenderQuality('medium');
      PERFORMANCE_CONFIG.PHYSICS_UPDATE_RATE = 2;
    } else if (currentFps > 55 && renderQuality === 'medium') {
      setRenderQuality('high');
      PERFORMANCE_CONFIG.PHYSICS_UPDATE_RATE = 1;
    }
    
    lastTimeRef.current = now;
  }, [renderQuality]);

  // ============= OPTIMIZED INITIALIZATION =============
  const initializeSimulation = useCallback(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = WIDTH;
      offscreenCanvasRef.current.height = HEIGHT;
    }
    
    spatialGridRef.current.clear();
    const bacteria: Bacterium[] = [];
    const bloodCells: BloodCell[] = [];
    
    // Initialize bacteria with proper biology
    selectedSpecies.forEach(species => {
      const profile = BACTERIAL_PROFILES[species];
      const loadPerSpecies = Math.min(
        Math.floor(initialBacterialLoad / selectedSpecies.length),
        Math.floor(PERFORMANCE_CONFIG.MAX_BACTERIA / selectedSpecies.length)
      );
      
      for (let i = 0; i < loadPerSpecies; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * VESSEL_RADIUS * 0.9;
        
        const bacterium: Bacterium = {
          id: Math.random(),
          x: WIDTH * 0.1 + Math.random() * WIDTH * 0.8,
          y: VESSEL_CENTER_Y + r * Math.sin(angle),
          z: r * Math.cos(angle),
          vx: bloodFlowRate + (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.2,
          species,
          gramPositive: profile.gramPositive,
          health: 100,
          replicationTimer: profile.divisionTime * 60,
          resistance: {...profile.defaultResistance},
          virulence: profile.virulence,
          adherent: false,
          biofilm: false,
          phageInfected: false,
          opsonized: false,
          generation: 0,
          age: 0
        };
        bacteria.push(bacterium);
        spatialGridRef.current.add(bacterium);
      }
    });
    
    // Initialize blood cells efficiently
    const immuneFactor = immuneCompetence / 100;
    const initialCellCount = Math.min(30 + immuneCompetence, PERFORMANCE_CONFIG.MAX_BLOOD_CELLS);
    
    for (let i = 0; i < initialCellCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * VESSEL_RADIUS * 0.95;
      
      let type: CellType = "rbc";
      if (Math.random() < 0.1 * immuneFactor) {
        type = "neutrophil";
      } else if (Math.random() < 0.05 * immuneFactor) {
        type = "macrophage";
      }
      
      const cell: BloodCell = {
        id: i,
        x: Math.random() * WIDTH,
        y: VESSEL_CENTER_Y + r * Math.sin(angle),
        z: r * Math.cos(angle),
        vx: bloodFlowRate + (Math.random() - 0.5),
        vy: 0,
        type,
        activated: false,
        health: 100,
        phagocyticCapacity: type === "neutrophil" ? 5 : type === "macrophage" ? 10 : 0,
        cytokineProduction: type === "neutrophil" ? 0.3 : type === "macrophage" ? 0.5 : 0,
        age: 0
      };
      bloodCells.push(cell);
      spatialGridRef.current.add(cell);
    }
    
    bacteriaRef.current = bacteria;
    bloodCellsRef.current = bloodCells;
    phagesRef.current = [];
    cytokinesRef.current = [];
    antibioticsRef.current = [];
    setSimulationTime(0);
    setHistory([]);
    frameCountRef.current = 0;
  }, [selectedSpecies, initialBacterialLoad, immuneCompetence, bloodFlowRate]);

  // ============= OPTIMIZED BIOLOGICAL UPDATE =============
  const updateSimulation = useCallback(() => {
    frameCountRef.current++;
    
    // Skip some physics frames for performance
    const shouldUpdatePhysics = frameCountRef.current % PERFORMANCE_CONFIG.PHYSICS_UPDATE_RATE === 0;
    if (!shouldUpdatePhysics) return;
    
    const bacteria = bacteriaRef.current;
    const bloodCells = bloodCellsRef.current;
    const phages = phagesRef.current;
    const cytokines = cytokinesRef.current;
    const antibiotics = antibioticsRef.current;
    const deltaTime = speed * PERFORMANCE_CONFIG.PHYSICS_UPDATE_RATE;
    
    // Population limits
    if (bacteria.length > PERFORMANCE_CONFIG.MAX_BACTERIA) {
      bacteria.splice(PERFORMANCE_CONFIG.MAX_BACTERIA);
    }
    if (cytokines.length > PERFORMANCE_CONFIG.MAX_CYTOKINES) {
      cytokines.splice(PERFORMANCE_CONFIG.MAX_CYTOKINES);
    }
    
    // Update bacteria with biology
    for (let i = bacteria.length - 1; i >= 0; i--) {
      const bacterium = bacteria[i];
      const profile = BACTERIAL_PROFILES[bacterium.species];
      
      bacterium.age += deltaTime / 60;
      
      // Movement
      if (!bacterium.adherent) {
        bacterium.x += bacterium.vx * deltaTime;
        bacterium.y += bacterium.vy * deltaTime;
        
        // Vessel boundary
        const distFromCenter = Math.sqrt(
          Math.pow(bacterium.y - VESSEL_CENTER_Y, 2) + 
          Math.pow(bacterium.z, 2)
        );
        
        if (distFromCenter > VESSEL_RADIUS - 10) {
          // Adherence chance
          if (Math.random() < profile.adherence * 0.01 * deltaTime) {
            bacterium.adherent = true;
            bacterium.vx = 0;
            bacterium.vy = 0;
            
            // Biofilm formation
            if (Math.random() < 0.1 && bacterium.age > 1) {
              bacterium.biofilm = true;
            }
          } else {
            // Bounce
            const angle = Math.atan2(bacterium.y - VESSEL_CENTER_Y, bacterium.z);
            bacterium.y = VESSEL_CENTER_Y + (VESSEL_RADIUS - 15) * Math.sin(angle);
            bacterium.vy *= -0.5;
          }
        }
        
        // Wrap x-axis
        if (bacterium.x > WIDTH) bacterium.x = 0;
        
        // Update spatial hash
        spatialGridRef.current.update(bacterium);
      }
      
      // Antibiotic effects (proper pharmacokinetics)
      antibiotics.forEach(antibiotic => {
        const antibioticProfile = ANTIBIOTIC_PROFILES[antibiotic.type];
        const timeSinceDose = (simulationTime - antibiotic.peakTime * 60) / 60;
        
        if (timeSinceDose >= 0) {
          const peakConc = antibioticProfile.therapeuticRange.max;
          const concentration = peakConc * Math.exp(-0.693 * timeSinceDose / antibiotic.halfLife);
          
          if (concentration > antibioticProfile.therapeuticRange.min) {
            const efficacy = bacterium.gramPositive ? 
              antibioticProfile.spectrum.gramPos : 
              antibioticProfile.spectrum.gramNeg;
            const resistance = bacterium.resistance[antibiotic.type];
            const killRate = efficacy * (1 - resistance) * (concentration / peakConc);
            
            bacterium.health -= killRate * deltaTime * 2;
          }
        }
      });
      
      // Phage infection
      if (bacterium.phageInfected) {
        bacterium.health -= deltaTime;
        if (bacterium.health <= 0 && phages.length < PERFORMANCE_CONFIG.MAX_PHAGES) {
          // Phage burst
          for (let j = 0; j < Math.min(5, PERFORMANCE_CONFIG.MAX_PHAGES - phages.length); j++) {
            phages.push({
              id: Math.random(),
              x: bacterium.x,
              y: bacterium.y,
              z: bacterium.z,
              vx: bloodFlowRate + (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5),
              hostSpecificity: [bacterium.species],
              attached: false,
              burstSize: 30
            });
          }
        }
      }
      
      // Replication (with limits)
      bacterium.replicationTimer -= deltaTime;
      if (bacterium.replicationTimer <= 0 && 
          bacterium.health > 50 && 
          bacteria.length < PERFORMANCE_CONFIG.MAX_BACTERIA) {
        const daughter: Bacterium = {
          ...bacterium,
          id: Math.random(),
          x: bacterium.x + (Math.random() - 0.5) * 10,
          y: bacterium.y + (Math.random() - 0.5) * 10,
          replicationTimer: profile.divisionTime * 60,
          generation: bacterium.generation + 1,
          health: 80,
          age: 0
        };
        bacteria.push(daughter);
        spatialGridRef.current.add(daughter);
        bacterium.replicationTimer = profile.divisionTime * 60;
      }
      
      // Death
      if (bacterium.health <= 0) {
        bacteria.splice(i, 1);
        spatialGridRef.current.remove(bacterium);
        
        // Cytokine release (with limits)
        if ((!bacterium.gramPositive || bacterium.virulence > 0.7) && 
            cytokines.length < PERFORMANCE_CONFIG.MAX_CYTOKINES) {
          cytokines.push({
            x: bacterium.x,
            y: bacterium.y,
            z: bacterium.z,
            type: bacterium.gramPositive ? 'IL1' : 'TNF',
            intensity: bacterium.virulence,
            radius: 30,
            age: 0
          });
        }
      }
    }
    
    // Update blood cells with immune response
    bloodCells.forEach((cell) => {
      cell.age += deltaTime / 60;
      cell.x += cell.vx * deltaTime;
      
      if (cell.x > WIDTH) {
        cell.x = 0;
        cell.y = VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS * 1.8;
      }
      
      spatialGridRef.current.update(cell);
      
      // Immune cell behavior (optimized with spatial hashing)
      if ((cell.type === "neutrophil" || cell.type === "macrophage") && bacteria.length > 0) {
        const nearbyBacteria = spatialGridRef.current.getNearby(
          cell.x, cell.y, PERFORMANCE_CONFIG.COLLISION_CHECK_RADIUS
        ).filter(e => e.species); // Only bacteria have species
        
        if (nearbyBacteria.length > 0) {
          const closest = nearbyBacteria[0] as Bacterium;
          cell.activated = true;
          
          // Chemotaxis
          const dx = closest.x - cell.x;
          const dy = closest.y - cell.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 50) {
            cell.vx = bloodFlowRate * 0.5 + (dx / dist) * 2;
            cell.vy = (dy / dist) * 2;
            
            // Phagocytosis
            if (dist < 20 && cell.phagocyticCapacity && cell.phagocyticCapacity > 0) {
              const phagocytosisRate = closest.opsonized ? 0.02 : 0.01;
              
              if (Math.random() < phagocytosisRate * deltaTime) {
                closest.health -= 30;
                cell.phagocyticCapacity--;
                
                // Opsonization
                if (immunoglobulin && Math.random() < 0.2) {
                  closest.opsonized = true;
                }
              }
            }
          }
        }
      }
    });
    
    // Update phages
    phages.forEach((phage, idx) => {
      phage.x += phage.vx * deltaTime;
      if (phage.x > WIDTH) phage.x = 0;
      
      // Find host bacteria using spatial hash
      const nearbyBacteria = spatialGridRef.current.getNearby(phage.x, phage.y, 30)
        .filter(e => e.species && !e.phageInfected) as Bacterium[];
      
      for (const bacterium of nearbyBacteria) {
        if (phage.hostSpecificity.includes(bacterium.species)) {
          const dist = Math.sqrt(
            Math.pow(bacterium.x - phage.x, 2) + 
            Math.pow(bacterium.y - phage.y, 2)
          );
          if (dist < 15) {
            bacterium.phageInfected = true;
            phages.splice(idx, 1);
            break;
          }
        }
      }
    });
    
    // Update cytokines
    for (let i = cytokines.length - 1; i >= 0; i--) {
      cytokines[i].age += deltaTime / 60;
      cytokines[i].intensity *= Math.pow(0.95, deltaTime);
      if (cytokines[i].intensity < 0.1) {
        cytokines.splice(i, 1);
      }
    }
    
    // Add new blood cells periodically (with limits)
    if (Math.random() < 0.05 * deltaTime && bloodCells.length < PERFORMANCE_CONFIG.MAX_BLOOD_CELLS) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * VESSEL_RADIUS * 0.95;
      const type = Math.random() < 0.9 ? "rbc" : "neutrophil";
      
      const cell: BloodCell = {
        id: Math.random(),
        x: 0,
        y: VESSEL_CENTER_Y + r * Math.sin(angle),
        z: r * Math.cos(angle),
        vx: bloodFlowRate + (Math.random() - 0.5),
        vy: 0,
        type,
        activated: false,
        health: 100,
        phagocyticCapacity: type === "neutrophil" ? 5 : 0,
        age: 0
      };
      bloodCells.push(cell);
      spatialGridRef.current.add(cell);
    }
    
    // Clean old cells
    bloodCellsRef.current = bloodCells.filter(cell => cell.age < 120 && cell.x <= WIDTH);
    
    // Update stats
    updateStats();
    
    // Record history periodically
    if (simulationTime % 60 === 0) {
      setHistory(prev => [...prev.slice(-48), {
        time: simulationTime,
        bacteria: bacteria.length,
        gramPos: bacteria.filter(b => b.gramPositive).length,
        gramNeg: bacteria.filter(b => !b.gramPositive).length,
        adherent: bacteria.filter(b => b.adherent).length,
        cytokines: cytokines.length
      }]);
    }
    
    setSimulationTime(prev => prev + deltaTime);
  }, [speed, immunoglobulin, bloodFlowRate, simulationTime]);

  const updateStats = useCallback(() => {
    const bacteria = bacteriaRef.current;
    const bloodCells = bloodCellsRef.current;
    const cytokines = cytokinesRef.current;
    
    const gramPos = bacteria.filter(b => b.gramPositive).length;
    const gramNeg = bacteria.filter(b => !b.gramPositive).length;
    const adherent = bacteria.filter(b => b.adherent).length;
    const biofilm = bacteria.filter(b => b.biofilm).length;
    
    const bacterialLoad = bacteria.length;
    const cytokineStorm = cytokines.reduce((sum, c) => sum + c.intensity, 0);
    
    // SIRS criteria
    let sirsScore = 0;
    if (bacterialLoad > 100) sirsScore++;
    if (cytokineStorm > 10) sirsScore++;
    if (simulationTime > 360) sirsScore++;
    if (bacterialLoad > 50) sirsScore++;
    
    const sepsisScore = Math.min(100, sirsScore * 25);
    const bacteremia = bacterialLoad > 10;
    
    setStats({
      totalBacteria: bacterialLoad,
      gramPositive: gramPos,
      gramNegative: gramNeg,
      adherentBacteria: adherent,
      biofilmCoverage: adherent > 0 ? (biofilm / adherent) * 100 : 0,
      neutrophils: bloodCells.filter(c => c.type === "neutrophil").length,
      macrophages: bloodCells.filter(c => c.type === "macrophage").length,
      phages: phagesRef.current.length,
      cytokineLevel: cytokineStorm,
      sepsisScore,
      bacteremia,
      fps,
      quality: renderQuality
    });
  }, [fps, renderQuality]);

  // ============= OPTIMIZED RENDERING =============
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!canvas || !offscreenCanvas) return;
    
    const ctx = offscreenCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw vessel walls
    ctx.strokeStyle = '#4a1515';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, VESSEL_CENTER_Y - VESSEL_RADIUS);
    ctx.lineTo(WIDTH, VESSEL_CENTER_Y - VESSEL_RADIUS);
    ctx.moveTo(0, VESSEL_CENTER_Y + VESSEL_RADIUS);
    ctx.lineTo(WIDTH, VESSEL_CENTER_Y + VESSEL_RADIUS);
    ctx.stroke();
    
    // Draw blood flow (low quality skips)
    if (renderQuality !== 'low') {
      ctx.strokeStyle = 'rgba(139, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < WIDTH; x += 50) {
        const offset = (simulationTime * bloodFlowRate) % 50;
        ctx.beginPath();
        ctx.moveTo(x + offset, VESSEL_CENTER_Y - VESSEL_RADIUS * 0.6);
        ctx.lineTo(x + offset + 20, VESSEL_CENTER_Y);
        ctx.lineTo(x + offset, VESSEL_CENTER_Y + VESSEL_RADIUS * 0.6);
        ctx.stroke();
      }
    }
    
    // Draw cytokines (medium/high quality only)
    if (renderQuality !== 'low') {
      cytokinesRef.current.forEach(cytokine => {
        ctx.globalAlpha = cytokine.intensity * 0.3;
        const gradient = ctx.createRadialGradient(
          cytokine.x, cytokine.y, 0,
          cytokine.x, cytokine.y, cytokine.radius
        );
        gradient.addColorStop(0, cytokine.type === 'TNF' ? '#FF6B6B' : '#FFA500');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cytokine.x, cytokine.y, cytokine.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    
    // Batch render blood cells
    ctx.fillStyle = '#8B0000';
    bloodCellsRef.current.filter(c => c.type === 'rbc').forEach(cell => {
      const distFromCenter = Math.sqrt(
        Math.pow(cell.y - VESSEL_CENTER_Y, 2) + Math.pow(cell.z, 2)
      );
      if (distFromCenter < VESSEL_RADIUS) {
        ctx.beginPath();
        ctx.ellipse(cell.x, cell.y, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Neutrophils
    ctx.fillStyle = '#FFC0CB';
    bloodCellsRef.current.filter(c => c.type === 'neutrophil').forEach(cell => {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, cell.activated ? 10 : 8, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Macrophages
    ctx.fillStyle = '#F08080';
    bloodCellsRef.current.filter(c => c.type === 'macrophage').forEach(cell => {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, cell.activated ? 15 : 12, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Batch render bacteria by species
    Object.values(BACTERIAL_PROFILES).forEach(profile => {
      const speciesBacteria = bacteriaRef.current.filter(b => 
        BACTERIAL_PROFILES[b.species].color === profile.color
      );
      
      if (speciesBacteria.length === 0) return;
      
      ctx.fillStyle = profile.color;
      speciesBacteria.forEach(bacterium => {
        ctx.globalAlpha = bacterium.health / 100;
        
        // Adherent indicator
        if (bacterium.adherent) {
          ctx.save();
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(bacterium.x - 6, bacterium.y - 6, 12, 12);
          ctx.setLineDash([]);
          ctx.restore();
        }
        
        ctx.beginPath();
        if (bacterium.gramPositive) {
          ctx.arc(bacterium.x, bacterium.y, profile.size, 0, Math.PI * 2);
        } else {
          ctx.ellipse(bacterium.x, bacterium.y, profile.size * 1.5, profile.size * 0.6, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Biofilm
        if (bacterium.biofilm && renderQuality !== 'low') {
          ctx.strokeStyle = 'rgba(138, 43, 226, 0.4)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, profile.size * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    });
    
    // Draw phages
    if (renderQuality !== 'low') {
      ctx.fillStyle = '#00FF88';
      phagesRef.current.forEach(phage => {
        ctx.beginPath();
        ctx.arc(phage.x, phage.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Copy to main canvas
    const mainCtx = canvas.getContext('2d');
    if (mainCtx) {
      mainCtx.drawImage(offscreenCanvas, 0, 0);
    }
    
    updatePerformance();
  }, [simulationTime, bloodFlowRate, renderQuality, updatePerformance]);

  // ============= ANIMATION LOOP =============
  const animate = useCallback(() => {
    updateSimulation();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateSimulation, render]);

  // ============= EFFECTS =============
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);

  const deployAntibiotic = (type: AntibioticClass) => {
    antibioticsRef.current.push({
      type,
      concentration: ANTIBIOTIC_PROFILES[type].therapeuticRange.max,
      peakTime: simulationTime / 60,
      halfLife: ANTIBIOTIC_PROFILES[type].halfLife
    });
    setActiveAntibiotics(prev => new Set([...prev, type]));
  };

  const handleReset = () => {
    setIsRunning(false);
    initializeSimulation();
    setSimulationTime(0);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Chart data
  const chartData = {
    labels: history.map(h => `${Math.floor(h.time / 60)}h`),
    datasets: [
      {
        label: "Total Bacteria",
        data: history.map(h => h.bacteria),
        borderColor: "#ef4444",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: "Adherent",
        data: history.map(h => h.adherent),
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: '#e2e8f0', font: { size: 11 } }
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      background: isDark ? '#0a0a0a' : '#f5f5f5',
      padding: '1rem',
      borderRadius: '12px'
    }}>
      {/* Performance Monitor */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#fff',
        fontSize: '0.7rem',
        fontFamily: 'monospace',
        zIndex: 100
      }}>
        <div style={{ marginBottom: '0.25rem' }}>FPS: <span style={{ color: fps < 30 ? '#ef4444' : fps < 45 ? '#f59e0b' : '#22c55e' }}>{fps}</span></div>
        <div style={{ marginBottom: '0.25rem' }}>Quality: {renderQuality}</div>
        <div style={{ marginBottom: '0.25rem' }}>Entities: {stats.totalBacteria + stats.neutrophils + stats.macrophages}</div>
        <div>Grid: Active</div>
      </div>
      
      {/* Canvas Container */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: '100%',
            maxWidth: '1200px',
            height: 'auto',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            display: 'block',
            margin: '0 auto'
          }}
        />
        
        {/* HUD */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#fff',
          minWidth: '200px'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Clock size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            {formatTime(simulationTime)}
          </div>
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Bacteremia:</span>
              <span style={{ fontWeight: 600, color: stats.bacteremia ? '#ef4444' : '#22c55e' }}>
                {stats.bacteremia ? 'POSITIVE' : 'Negative'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>CFU/mL:</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.totalBacteria}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Adherent:</span>
              <span style={{ fontWeight: 600, color: '#f59e0b' }}>{stats.adherentBacteria}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Biofilm:</span>
              <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{stats.biofilmCoverage.toFixed(0)}%</span>
            </div>
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Sepsis Risk:</span>
                <span style={{ 
                  fontWeight: 700, 
                  color: stats.sepsisScore > 75 ? '#ef4444' : 
                         stats.sepsisScore > 50 ? '#f59e0b' : 
                         stats.sepsisScore > 25 ? '#fbbf24' : '#22c55e' 
                }}>
                  {stats.sepsisScore.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
          </button>
          
          <button
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <Zap size={14} />
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{speed}x</span>
          </div>
        </div>
      </div>
      
      {/* Tabbed Controls */}
      <div style={{
        background: isDark ? '#1a1a1a' : '#fff',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('microbiology')}
            style={{
              background: activeTab === 'microbiology' ? 'rgba(59, 130, 246, 0.2)' : 'none',
              border: 'none',
              color: activeTab === 'microbiology' ? '#3b82f6' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Microscope size={16} />
            Microbiology
          </button>
          
          <button
            onClick={() => setActiveTab('therapy')}
            style={{
              background: activeTab === 'therapy' ? 'rgba(59, 130, 246, 0.2)' : 'none',
              border: 'none',
              color: activeTab === 'therapy' ? '#3b82f6' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Pill size={16} />
            Antimicrobials
          </button>
          
          <button
            onClick={() => setActiveTab('immunology')}
            style={{
              background: activeTab === 'immunology' ? 'rgba(59, 130, 246, 0.2)' : 'none',
              border: 'none',
              color: activeTab === 'immunology' ? '#3b82f6' : '#94a3b8',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Shield size={16} />
            Immunology
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'microbiology' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  Initial CFU/mL: {initialBacterialLoad}
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={initialBacterialLoad}
                  onChange={(e) => setInitialBacterialLoad(Number(e.target.value))}
                  disabled={isRunning}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  Blood Flow: {bloodFlowRate} cm/s
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={bloodFlowRate}
                  onChange={(e) => setBloodFlowRate(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  Immune Competence: {immuneCompetence}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={immuneCompetence}
                  onChange={(e) => setImmuneCompetence(Number(e.target.value))}
                  disabled={isRunning}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontWeight: 600 }}>
                Select Pathogens
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
                {Object.entries(BACTERIAL_PROFILES).map(([species, profile]) => (
                  <label key={species} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: selectedSpecies.includes(species as BacterialSpecies) ? 
                      'rgba(59, 130, 246, 0.1)' : 'transparent',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedSpecies.includes(species as BacterialSpecies)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSpecies([...selectedSpecies, species as BacterialSpecies]);
                        } else {
                          setSelectedSpecies(selectedSpecies.filter(s => s !== species));
                        }
                      }}
                    />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: profile.color
                    }} />
                    <div style={{ fontSize: '0.8rem', color: isDark ? '#fff' : '#000' }}>{profile.name}</div>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ height: '200px', background: 'rgba(0, 0, 0, 0.5)', padding: '1rem', borderRadius: '8px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
        
        {activeTab === 'therapy' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {Object.entries(ANTIBIOTIC_PROFILES).map(([key, antibiotic]) => (
              <button
                key={key}
                onClick={() => deployAntibiotic(key as AntibioticClass)}
                style={{
                  padding: '1rem',
                  background: activeAntibiotics.has(key as AntibioticClass) ? 
                    'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <Pill size={24} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{antibiotic.name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{antibiotic.class}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>t½: {antibiotic.halfLife}h</div>
              </button>
            ))}
          </div>
        )}
        
        {activeTab === 'immunology' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(255, 105, 180, 0.1)',
              border: '1px solid rgba(255, 105, 180, 0.3)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, color: isDark ? '#fff' : '#000' }}>Neutrophils</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FF69B4' }}>{stats.neutrophils}</div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(205, 92, 92, 0.1)',
              border: '1px solid rgba(205, 92, 92, 0.3)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, color: isDark ? '#fff' : '#000' }}>Macrophages</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#CD5C5C' }}>{stats.macrophages}</div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, color: isDark ? '#fff' : '#000' }}>Cytokines</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                {stats.cytokineLevel.toFixed(1)}
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, color: isDark ? '#fff' : '#000' }}>Phages</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00FF88' }}>{stats.phages}</div>
            </div>
            
            <button
              onClick={() => setImmunoglobulin(!immunoglobulin)}
              style={{
                padding: '1rem',
                background: immunoglobulin ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '8px',
                color: isDark ? '#fff' : '#000',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <Shield size={24} style={{ margin: '0 auto 0.5rem', color: '#8b5cf6' }} />
              <div style={{ fontSize: '0.8rem' }}>Immunoglobulin</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{immunoglobulin ? 'Active' : 'Inactive'}</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}