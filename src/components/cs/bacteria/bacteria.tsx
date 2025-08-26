import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlayCircle, PauseCircle, RefreshCw, Activity, Shield, Pill,
  Heart, TrendingUp, AlertTriangle, Microscope, Zap, Info,
  BarChart3, Settings, Dna, Download, Bug, ChevronDown,
  Thermometer, Wind, Droplets, Brain, Timer, FileText,
  Clock, Calendar, ArrowRight, Waves, GitBranch, Beaker,
  Target, Layers, FlaskConical, Binary, LineChart
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

// ============= ADVANCED CONFIGURATION =============
const ADVANCED_CONFIG = {
  MAX_BACTERIA: 500,
  MAX_BLOOD_CELLS: 200,
  MAX_PHAGES: 100,
  MAX_CYTOKINES: 50,
  USE_WEBGL: false, // Would need WebGL context
  USE_WORKERS: false, // Would need Web Workers
  ENABLE_EVOLUTION: true,
  ENABLE_QUORUM_SENSING: true,
  ENABLE_METABOLIC_STATES: true,
  MUTATION_RATE: 0.001,
  HGT_RATE: 0.0001, // Horizontal gene transfer
  PHYSICS_SUBSTEPS: 2,
  EVOLUTION_INTERVAL: 100 // frames
};

// ============= ENHANCED TYPE DEFINITIONS =============
type BacterialSpecies = "S_aureus" | "E_coli" | "P_aeruginosa" | "K_pneumoniae" | "S_pyogenes" | "E_faecalis";
type CellType = "rbc" | "neutrophil" | "macrophage" | "lymphocyte" | "platelet" | "dendritic";
type AntibioticClass = "penicillin" | "vancomycin" | "ciprofloxacin" | "gentamicin" | "ceftriaxone";
type MetabolicState = "active" | "dormant" | "persister" | "spore";
type PhageStrategy = "lytic" | "lysogenic" | "chronic";

interface Genome {
  resistanceGenes: Map<AntibioticClass, number>;
  virulenceFactors: {
    toxinProduction: number;
    adhesins: number;
    invasins: number;
    biofilmGenes: number;
  };
  phageResistance: {
    crispr: boolean;
    restrictionModification: boolean;
    abortiveInfection: boolean;
  };
  fitnessCoat: number; // Metabolic burden of resistance
}

interface BacterialStrain {
  id: string;
  parentSpecies: BacterialSpecies;
  genome: Genome;
  mutationHistory: string[];
  generation: number;
  color: string;
}

interface EnhancedBacterium {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  strain: BacterialStrain;
  health: number;
  replicationTimer: number;
  metabolicState: MetabolicState;
  quorumSignal: number; // For biofilm coordination
  adherent: boolean;
  biofilm: boolean;
  phageInfected: boolean;
  prophage?: string; // Lysogenic phage ID
  opsonized: boolean;
  complementBound: boolean;
  age: number;
  stressLevel: number; // Triggers persister state
  gridKey?: string;
}

interface PhageLibrary {
  id: string;
  name: string;
  hostRange: BacterialSpecies[];
  strategy: PhageStrategy;
  burstSize: number;
  latencyPeriod: number;
  adsorptionRate: number;
  specificity: number; // 0-1, how specific to target
  evolutionRate: number;
  resistanceBreaking: boolean; // Can evolve to break resistance
}

interface EnhancedPhage {
  id: number;
  libraryId: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  attached: boolean;
  targetId?: number;
  generation: number;
  mutations: string[];
}

interface BloodRheology {
  viscosity: number; // Affected by inflammation
  shearRate: number;
  hematocrit: number;
  fibrinogenLevel: number;
  plateletActivation: number;
}

interface ImmuneResponse {
  innate: {
    neutrophilRecruitment: number;
    macrophageActivation: number;
    complementActivation: number;
    acutePhaseProteins: number;
  };
  adaptive: {
    antibodyProduction: number;
    tcellActivation: number;
    memoryFormation: number;
  };
  cytokineProfile: {
    proInflammatory: number; // IL-1, TNF-α, IL-6
    antiInflammatory: number; // IL-10, TGF-β
    chemokines: number; // IL-8, MCP-1
  };
}

// ============= ADVANCED SPATIAL INDEXING =============
class OctreeNode {
  bounds: { x: number; y: number; z: number; size: number };
  entities: Set<any>;
  children: OctreeNode[] | null;
  maxEntities: number = 8;
  maxDepth: number = 5;
  depth: number;

  constructor(x: number, y: number, z: number, size: number, depth: number = 0) {
    this.bounds = { x, y, z, size };
    this.entities = new Set();
    this.children = null;
    this.depth = depth;
  }

  subdivide() {
    if (this.depth >= this.maxDepth) return;
    const { x, y, z, size } = this.bounds;
    const half = size / 2;
    this.children = [
      new OctreeNode(x, y, z, half, this.depth + 1),
      new OctreeNode(x + half, y, z, half, this.depth + 1),
      new OctreeNode(x, y + half, z, half, this.depth + 1),
      new OctreeNode(x + half, y + half, z, half, this.depth + 1),
      new OctreeNode(x, y, z + half, half, this.depth + 1),
      new OctreeNode(x + half, y, z + half, half, this.depth + 1),
      new OctreeNode(x, y + half, z + half, half, this.depth + 1),
      new OctreeNode(x + half, y + half, z + half, half, this.depth + 1)
    ];
  }

  insert(entity: any) {
    if (!this.contains(entity)) return false;
    
    if (this.entities.size < this.maxEntities || this.depth >= this.maxDepth) {
      this.entities.add(entity);
      return true;
    }

    if (!this.children) this.subdivide();
    
    for (const child of this.children!) {
      if (child.insert(entity)) return true;
    }
    return false;
  }

  contains(entity: any): boolean {
    const { x, y, z, size } = this.bounds;
    return entity.x >= x && entity.x < x + size &&
           entity.y >= y && entity.y < y + size &&
           entity.z >= z && entity.z < z + size;
  }

  query(range: { x: number; y: number; z: number; radius: number }): any[] {
    const results: any[] = [];
    
    if (!this.intersects(range)) return results;
    
    this.entities.forEach(entity => {
      const dist = Math.sqrt(
        Math.pow(entity.x - range.x, 2) +
        Math.pow(entity.y - range.y, 2) +
        Math.pow(entity.z - range.z, 2)
      );
      if (dist <= range.radius) results.push(entity);
    });

    if (this.children) {
      for (const child of this.children) {
        results.push(...child.query(range));
      }
    }

    return results;
  }

  intersects(range: { x: number; y: number; z: number; radius: number }): boolean {
    const { x, y, z, size } = this.bounds;
    const xDist = Math.abs(range.x - (x + size / 2));
    const yDist = Math.abs(range.y - (y + size / 2));
    const zDist = Math.abs(range.z - (z + size / 2));

    if (xDist > (range.radius + size / 2)) return false;
    if (yDist > (range.radius + size / 2)) return false;
    if (zDist > (range.radius + size / 2)) return false;

    return true;
  }

  clear() {
    this.entities.clear();
    if (this.children) {
      this.children.forEach(child => child.clear());
      this.children = null;
    }
  }
}

// ============= BACTERIAL EVOLUTION ENGINE =============
class BacterialEvolution {
  private strainLibrary: Map<string, BacterialStrain> = new Map();
  private mutationCounter = 0;

  generateStrain(species: BacterialSpecies, parentStrain?: BacterialStrain): BacterialStrain {
    const baseProfile = BACTERIAL_PROFILES[species];
    const strainId = `${species}_${Date.now()}_${this.mutationCounter++}`;
    
    let genome: Genome;
    let color = baseProfile.color;
    
    if (parentStrain) {
      // Mutate from parent
      genome = this.mutateGenome(parentStrain.genome);
      // Slight color variation for mutants
      color = this.mutateColor(parentStrain.color);
    } else {
      // Create base strain
      genome = {
        resistanceGenes: new Map(Object.entries(baseProfile.defaultResistance) as [AntibioticClass, number][]),
        virulenceFactors: {
          toxinProduction: baseProfile.virulence,
          adhesins: baseProfile.adherence,
          invasins: 0.5,
          biofilmGenes: baseProfile.adherence * 0.8
        },
        phageResistance: {
          crispr: Math.random() < 0.1,
          restrictionModification: Math.random() < 0.2,
          abortiveInfection: Math.random() < 0.05
        },
        fitnessCoat: 0
      };
    }

    // Calculate fitness cost
    genome.fitnessCoat = this.calculateFitnessCost(genome);

    const strain: BacterialStrain = {
      id: strainId,
      parentSpecies: species,
      genome,
      mutationHistory: parentStrain ? [...parentStrain.mutationHistory, strainId] : [strainId],
      generation: parentStrain ? parentStrain.generation + 1 : 0,
      color
    };

    this.strainLibrary.set(strainId, strain);
    return strain;
  }

  mutateGenome(parent: Genome): Genome {
    const mutated = JSON.parse(JSON.stringify(parent)) as Genome;
    mutated.resistanceGenes = new Map(parent.resistanceGenes);
    
    // Resistance mutations
    mutated.resistanceGenes.forEach((value, key) => {
      if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE) {
        const delta = (Math.random() - 0.5) * 0.1;
        mutated.resistanceGenes.set(key, Math.max(0, Math.min(1, value + delta)));
      }
    });

    // Virulence mutations
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE) {
      mutated.virulenceFactors.toxinProduction *= 0.9 + Math.random() * 0.2;
    }

    // Phage resistance evolution
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 10) { // Higher rate under phage pressure
      if (!mutated.phageResistance.crispr && Math.random() < 0.1) {
        mutated.phageResistance.crispr = true;
      }
    }

    return mutated;
  }

  horizontalGeneTransfer(donor: BacterialStrain, recipient: BacterialStrain): BacterialStrain {
    const newGenome = { ...recipient.genome };
    
    // Transfer resistance genes with some probability
    donor.genome.resistanceGenes.forEach((value, key) => {
      if (Math.random() < 0.3) { // 30% chance per gene
        const currentValue = newGenome.resistanceGenes.get(key) || 0;
        newGenome.resistanceGenes.set(key, Math.max(currentValue, value));
      }
    });

    return this.generateStrain(recipient.parentSpecies, {
      ...recipient,
      genome: newGenome
    });
  }

  calculateFitnessCost(genome: Genome): number {
    let cost = 0;
    
    // Resistance costs energy
    genome.resistanceGenes.forEach(level => {
      cost += level * 0.1;
    });

    // CRISPR system costs
    if (genome.phageResistance.crispr) cost += 0.15;
    if (genome.phageResistance.restrictionModification) cost += 0.1;
    
    return Math.min(cost, 0.5); // Cap at 50% fitness reduction
  }

  mutateColor(parentColor: string): string {
    // Parse hex color
    const r = parseInt(parentColor.slice(1, 3), 16);
    const g = parseInt(parentColor.slice(3, 5), 16);
    const b = parseInt(parentColor.slice(5, 7), 16);
    
    // Small mutations
    const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * 20));
    const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * 20));
    const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * 20));
    
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }
}

// ============= PHAGE THERAPY ENGINE =============
class PhageTherapyEngine {
  private phageLibraries: Map<string, PhageLibrary> = new Map();

  constructor() {
    this.initializePhageLibraries();
  }

  initializePhageLibraries() {
    // Staphylococcus phage
    this.phageLibraries.set('phage_K', {
      id: 'phage_K',
      name: 'Phage K',
      hostRange: ['S_aureus'],
      strategy: 'lytic',
      burstSize: 100,
      latencyPeriod: 30,
      adsorptionRate: 0.8,
      specificity: 0.9,
      evolutionRate: 0.001,
      resistanceBreaking: true
    });

    // E. coli phage
    this.phageLibraries.set('T7', {
      id: 'T7',
      name: 'T7 Phage',
      hostRange: ['E_coli'],
      strategy: 'lytic',
      burstSize: 150,
      latencyPeriod: 20,
      adsorptionRate: 0.9,
      specificity: 0.95,
      evolutionRate: 0.002,
      resistanceBreaking: false
    });

    // Broad spectrum phage
    this.phageLibraries.set('cocktail_1', {
      id: 'cocktail_1',
      name: 'Phage Cocktail',
      hostRange: ['P_aeruginosa', 'K_pneumoniae'],
      strategy: 'lytic',
      burstSize: 80,
      latencyPeriod: 40,
      adsorptionRate: 0.7,
      specificity: 0.7,
      evolutionRate: 0.003,
      resistanceBreaking: true
    });

    // Temperate phage
    this.phageLibraries.set('lambda', {
      id: 'lambda',
      name: 'Lambda-like',
      hostRange: ['E_coli', 'K_pneumoniae'],
      strategy: 'lysogenic',
      burstSize: 50,
      latencyPeriod: 60,
      adsorptionRate: 0.6,
      specificity: 0.8,
      evolutionRate: 0.001,
      resistanceBreaking: false
    });
  }

  selectOptimalPhage(bacterialStrain: BacterialStrain): PhageLibrary | null {
    let bestPhage: PhageLibrary | null = null;
    let bestScore = 0;

    this.phageLibraries.forEach(phage => {
      if (!phage.hostRange.includes(bacterialStrain.parentSpecies)) return;

      let score = phage.adsorptionRate * phage.specificity;
      
      // Reduce score if bacteria has resistance
      if (bacterialStrain.genome.phageResistance.crispr) score *= 0.3;
      if (bacterialStrain.genome.phageResistance.restrictionModification) score *= 0.5;
      
      // Bonus for resistance-breaking phages
      if (phage.resistanceBreaking && bacterialStrain.genome.phageResistance.crispr) {
        score *= 1.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPhage = phage;
      }
    });

    return bestPhage;
  }

  generatePhageCocktail(targetSpecies: BacterialSpecies[]): PhageLibrary[] {
    const cocktail: PhageLibrary[] = [];
    const usedHosts = new Set<BacterialSpecies>();

    targetSpecies.forEach(species => {
      if (usedHosts.has(species)) return;

      this.phageLibraries.forEach(phage => {
        if (phage.hostRange.includes(species) && cocktail.length < 3) {
          cocktail.push(phage);
          phage.hostRange.forEach(host => usedHosts.add(host));
        }
      });
    });

    return cocktail;
  }
}

// ============= ENHANCED BACTERIAL PROFILES =============
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
    },
    quorumThreshold: 50,
    metabolicFlexibility: 0.7
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
    },
    quorumThreshold: 30,
    metabolicFlexibility: 0.9
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
    },
    quorumThreshold: 40,
    metabolicFlexibility: 0.8
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
    },
    quorumThreshold: 35,
    metabolicFlexibility: 0.6
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
    },
    quorumThreshold: 45,
    metabolicFlexibility: 0.5
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
    },
    quorumThreshold: 55,
    metabolicFlexibility: 0.6
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
    therapeuticRange: { min: 0.1, max: 10 },
    resistancePressure: 0.8
  },
  vancomycin: {
    name: "Vancomycin",
    class: "Glycopeptide",
    color: "rgba(139, 0, 0, 0.3)",
    spectrum: { gramPos: 0.95, gramNeg: 0.0 },
    halfLife: 6,
    peakTime: 2,
    therapeuticRange: { min: 10, max: 20 },
    resistancePressure: 0.6
  },
  ciprofloxacin: {
    name: "Ciprofloxacin",
    class: "Fluoroquinolone",
    color: "rgba(255, 20, 147, 0.3)",
    spectrum: { gramPos: 0.7, gramNeg: 0.85 },
    halfLife: 4,
    peakTime: 1,
    therapeuticRange: { min: 0.5, max: 3 },
    resistancePressure: 0.7
  },
  gentamicin: {
    name: "Gentamicin",
    class: "Aminoglycoside",
    color: "rgba(46, 139, 87, 0.3)",
    spectrum: { gramPos: 0.6, gramNeg: 0.8 },
    halfLife: 2,
    peakTime: 0.5,
    therapeuticRange: { min: 4, max: 10 },
    resistancePressure: 0.5
  },
  ceftriaxone: {
    name: "Ceftriaxone",
    class: "3rd Gen Cephalosporin",
    color: "rgba(255, 140, 0, 0.3)",
    spectrum: { gramPos: 0.85, gramNeg: 0.9 },
    halfLife: 8,
    peakTime: 2,
    therapeuticRange: { min: 20, max: 100 },
    resistancePressure: 0.9
  }
};

// ============= MAIN COMPONENT =============
export default function AdvancedBacteremiaSimulator({ isDark = true, isRunning: externalRunning = true, speed: externalSpeed = 1}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const octreeRef = useRef<OctreeNode>(new OctreeNode(0, 0, -300, 1500));
  const evolutionEngineRef = useRef<BacterialEvolution>(new BacterialEvolution());
  const phageEngineRef = useRef<PhageTherapyEngine>(new PhageTherapyEngine());
  
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simulationTime, setSimulationTime] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  
  // Entities
  const bacteriaRef = useRef<EnhancedBacterium[]>([]);
  const bloodCellsRef = useRef<any[]>([]);
  const phagesRef = useRef<EnhancedPhage[]>([]);
  const cytokinesRef = useRef<any[]>([]);
  const antibioticsRef = useRef<any[]>([]);
  
  // Advanced tracking
  const strainMapRef = useRef<Map<string, number>>(new Map()); // Strain ID -> count
  const rheologyRef = useRef<BloodRheology>({
    viscosity: 1.0,
    shearRate: 100,
    hematocrit: 0.45,
    fibrinogenLevel: 3.0,
    plateletActivation: 0
  });
  const immuneResponseRef = useRef<ImmuneResponse>({
    innate: {
      neutrophilRecruitment: 0,
      macrophageActivation: 0,
      complementActivation: 0,
      acutePhaseProteins: 0
    },
    adaptive: {
      antibodyProduction: 0,
      tcellActivation: 0,
      memoryFormation: 0
    },
    cytokineProfile: {
      proInflammatory: 0,
      antiInflammatory: 0,
      chemokines: 0
    }
  });
  
  // UI State
  const [activeTab, setActiveTab] = useState<'microbiology' | 'therapy' | 'evolution' | 'rheology'>('microbiology');
  const [selectedSpecies, setSelectedSpecies] = useState<BacterialSpecies[]>(["S_aureus"]);
  const [phageTherapyMode, setPhageTherapyMode] = useState<'off' | 'targeted' | 'cocktail'>('off');
  const [selectedPhages, setSelectedPhages] = useState<string[]>([]);
  
  // Parameters
  const [initialBacterialLoad, setInitialBacterialLoad] = useState(10);
  const [immuneCompetence, setImmuneCompetence] = useState(100);
  const [bloodFlowRate, setBloodFlowRate] = useState(5);
  const [evolutionEnabled, setEvolutionEnabled] = useState(true);
  const [quorumSensingEnabled, setQuorumSensingEnabled] = useState(true);
  
  // Statistics
  const [stats, setStats] = useState({
    totalBacteria: 0,
    uniqueStrains: 0,
    dominantStrain: '',
    averageResistance: 0,
    biofilmCoverage: 0,
    phageCount: 0,
    lysogenicBacteria: 0,
    viscosity: 1.0,
    sepsisScore: 0,
    bacteremia: false,
    clottingRisk: 0,
    cytokineStorm: false
  });

  // Patient vitals and status
  const [patientVitals, setPatientVitals] = useState({
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 37.0,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    whiteBloodCells: 7.5,
    crp: 5.0, // C-reactive protein
    procalcitonin: 0.05,
    lactate: 1.0,
    organFunction: {
      heart: 100,
      lungs: 100,
      kidneys: 100,
      liver: 100,
      brain: 100
    },
    overallHealth: 100
  });

  const WIDTH = 1200;
  const HEIGHT = 600;
  const VESSEL_CENTER_Y = HEIGHT / 2;
  const VESSEL_RADIUS = HEIGHT * 0.35;

  // ============= INITIALIZATION =============
  const initializeSimulation = useCallback(() => {
    octreeRef.current.clear();
    const bacteria: EnhancedBacterium[] = [];
    
    // Initialize bacteria with strains
    selectedSpecies.forEach(species => {
      const loadPerSpecies = Math.min(
        Math.floor(initialBacterialLoad / selectedSpecies.length),
        Math.floor(ADVANCED_CONFIG.MAX_BACTERIA / selectedSpecies.length)
      );
      
      const baseStrain = evolutionEngineRef.current.generateStrain(species);
      
      for (let i = 0; i < loadPerSpecies; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * VESSEL_RADIUS * 0.9;
        const z = r * Math.cos(angle);
        
        const bacterium: EnhancedBacterium = {
          id: Math.random(),
          x: WIDTH * 0.1 + Math.random() * WIDTH * 0.8,
          y: VESSEL_CENTER_Y + r * Math.sin(angle),
          z,
          vx: bloodFlowRate + (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.2,
          strain: baseStrain,
          health: 100,
          replicationTimer: BACTERIAL_PROFILES[species].divisionTime * 60,
          metabolicState: 'active',
          quorumSignal: 0,
          adherent: false,
          biofilm: false,
          phageInfected: false,
          opsonized: false,
          complementBound: false,
          age: 0,
          stressLevel: 0
        };
        
        bacteria.push(bacterium);
        octreeRef.current.insert(bacterium);
      }
    });
    
    bacteriaRef.current = bacteria;
    bloodCellsRef.current = [];
    phagesRef.current = [];
    cytokinesRef.current = [];
    antibioticsRef.current = [];
    strainMapRef.current.clear();
    
    // Reset blood rheology
    rheologyRef.current = {
      viscosity: 1.0,
      shearRate: 100,
      hematocrit: 0.45,
      fibrinogenLevel: 3.0,
      plateletActivation: 0
    };
    
    setSimulationTime(0);
    setHistory([]);
    frameCountRef.current = 0;
  }, [selectedSpecies, initialBacterialLoad, bloodFlowRate]);

  // ============= ADVANCED UPDATE LOOP =============
  const updateSimulation = useCallback(() => {
    frameCountRef.current++;
    const bacteria = bacteriaRef.current;
    const deltaTime = speed;
    
    // Rebuild octree
    octreeRef.current.clear();
    bacteria.forEach(b => octreeRef.current.insert(b));
    
    // Update bacteria with advanced features
    for (let i = bacteria.length - 1; i >= 0; i--) {
      const bacterium = bacteria[i];
      const profile = BACTERIAL_PROFILES[bacterium.strain.parentSpecies];
      
      bacterium.age += deltaTime / 60;
      bacterium.stressLevel *= 0.99; // Stress decays
      
      // Metabolic state transitions
      if (ADVANCED_CONFIG.ENABLE_METABOLIC_STATES) {
        if (bacterium.stressLevel > 0.7 && bacterium.metabolicState === 'active') {
          bacterium.metabolicState = 'persister';
          bacterium.health = Math.min(100, bacterium.health + 20); // Persisters are tougher
        } else if (bacterium.stressLevel < 0.3 && bacterium.metabolicState === 'persister') {
          bacterium.metabolicState = 'active';
        }
      }
      
      // Quorum sensing
      if (ADVANCED_CONFIG.ENABLE_QUORUM_SENSING && quorumSensingEnabled) {
        const nearbyBacteria = octreeRef.current.query({
          x: bacterium.x,
          y: bacterium.y,
          z: bacterium.z,
          radius: 50
        }).filter(e => e.strain);
        
        const sameSpeciesCount = nearbyBacteria.filter(
          b => b.strain.parentSpecies === bacterium.strain.parentSpecies
        ).length;
        
        bacterium.quorumSignal = sameSpeciesCount / profile.quorumThreshold;
        
        // Biofilm formation triggered by quorum sensing
        if (bacterium.quorumSignal > 1 && bacterium.adherent && !bacterium.biofilm) {
          bacterium.biofilm = true;
        }
      }
      
      // Movement (affected by blood viscosity)
      if (!bacterium.adherent) {
        const viscosityFactor = 1 / rheologyRef.current.viscosity;
        bacterium.x += bacterium.vx * deltaTime * viscosityFactor;
        bacterium.y += bacterium.vy * deltaTime * viscosityFactor;
        
        if (bacterium.x > WIDTH) bacterium.x = 0;
        
        // Vessel boundary with adherence
        const distFromCenter = Math.sqrt(
          Math.pow(bacterium.y - VESSEL_CENTER_Y, 2) + 
          Math.pow(bacterium.z, 2)
        );
        
        if (distFromCenter > VESSEL_RADIUS - 10) {
          const adherenceChance = bacterium.strain.genome.virulenceFactors.adhesins * 0.01 * deltaTime;
          if (Math.random() < adherenceChance) {
            bacterium.adherent = true;
            bacterium.vx = 0;
            bacterium.vy = 0;
          } else {
            bacterium.y = VESSEL_CENTER_Y + (VESSEL_RADIUS - 15) * Math.sin(Math.atan2(bacterium.y - VESSEL_CENTER_Y, bacterium.z));
            bacterium.vy *= -0.5;
          }
        }
      }
      
      // Evolution through replication
      bacterium.replicationTimer -= deltaTime * (1 - bacterium.strain.genome.fitnessCoat);
      
      if (bacterium.replicationTimer <= 0 && bacterium.health > 50 && bacteria.length < ADVANCED_CONFIG.MAX_BACTERIA) {
        let daughterStrain = bacterium.strain;
        
        // Chance of mutation
        if (ADVANCED_CONFIG.ENABLE_EVOLUTION && evolutionEnabled && Math.random() < ADVANCED_CONFIG.MUTATION_RATE) {
          daughterStrain = evolutionEngineRef.current.generateStrain(
            bacterium.strain.parentSpecies,
            bacterium.strain
          );
        }
        
        const daughter: EnhancedBacterium = {
          ...bacterium,
          id: Math.random(),
          x: bacterium.x + (Math.random() - 0.5) * 10,
          y: bacterium.y + (Math.random() - 0.5) * 10,
          strain: daughterStrain,
          replicationTimer: profile.divisionTime * 60,
          health: 80,
          age: 0,
          stressLevel: 0
        };
        
        bacteria.push(daughter);
        bacterium.replicationTimer = profile.divisionTime * 60;
      }
      
      // Horizontal gene transfer
      if (ADVANCED_CONFIG.ENABLE_EVOLUTION && Math.random() < ADVANCED_CONFIG.HGT_RATE * deltaTime) {
        const nearbyBacteria = octreeRef.current.query({
          x: bacterium.x,
          y: bacterium.y,
          z: bacterium.z,
          radius: 20
        }).filter(e => e.strain && e.id !== bacterium.id);
        
        if (nearbyBacteria.length > 0) {
          const donor = nearbyBacteria[0];
          bacterium.strain = evolutionEngineRef.current.horizontalGeneTransfer(
            donor.strain,
            bacterium.strain
          );
        }
      }
      
      // Death
      if (bacterium.health <= 0) {
        bacteria.splice(i, 1);
        
        // Release damage-associated molecular patterns (DAMPs)
        if (bacterium.strain.genome.virulenceFactors.toxinProduction > 0.5) {
          cytokinesRef.current.push({
            x: bacterium.x,
            y: bacterium.y,
            z: bacterium.z,
            type: bacterium.strain.parentSpecies.includes('aureus') ? 'IL1' : 'TNF',
            intensity: bacterium.strain.genome.virulenceFactors.toxinProduction,
            radius: 40,
            age: 0
          });
        }
      }
    }
    
    // Update phages with advanced behavior
    const phages = phagesRef.current;
    phages.forEach((phage, idx) => {
      phage.x += phage.vx * deltaTime;
      if (phage.x > WIDTH) phage.x = 0;
      
      const library = phageEngineRef.current['phageLibraries'].get(phage.libraryId);
      if (!library) return;
      
      // Find susceptible bacteria
      const nearbyBacteria = octreeRef.current.query({
        x: phage.x,
        y: phage.y,
        z: phage.z,
        radius: 30
      }).filter(e => e.strain && !e.phageInfected) as EnhancedBacterium[];
      
      for (const bacterium of nearbyBacteria) {
        if (!library.hostRange.includes(bacterium.strain.parentSpecies)) continue;
        
        // Check phage resistance
        let infectionChance = library.adsorptionRate;
        if (bacterium.strain.genome.phageResistance.crispr) infectionChance *= 0.2;
        if (bacterium.strain.genome.phageResistance.restrictionModification) infectionChance *= 0.5;
        
        if (Math.random() < infectionChance * deltaTime) {
          if (library.strategy === 'lytic') {
            bacterium.phageInfected = true;
            bacterium.health -= 5; // Initial damage
          } else if (library.strategy === 'lysogenic') {
            bacterium.prophage = phage.libraryId;
            // Lysogenic conversion can provide benefits
            bacterium.strain.genome.virulenceFactors.toxinProduction *= 1.2;
          }
          phages.splice(idx, 1);
          break;
        }
      }
    });
    
    // Update blood rheology based on inflammation
    const totalCytokines = cytokinesRef.current.reduce((sum, c) => sum + c.intensity, 0);
    rheologyRef.current.viscosity = 1.0 + Math.min(totalCytokines * 0.01, 0.5);
    rheologyRef.current.fibrinogenLevel = 3.0 + totalCytokines * 0.1;
    rheologyRef.current.plateletActivation = Math.min(totalCytokines * 0.05, 1);
    
    // Update immune response
    immuneResponseRef.current.cytokineProfile.proInflammatory = totalCytokines * 0.6;
    immuneResponseRef.current.cytokineProfile.antiInflammatory = totalCytokines * 0.2;
    immuneResponseRef.current.innate.complementActivation = Math.min(bacteria.length * 0.01, 1);
    
    // Update strain tracking
    strainMapRef.current.clear();
    bacteria.forEach(b => {
      const count = strainMapRef.current.get(b.strain.id) || 0;
      strainMapRef.current.set(b.strain.id, count + 1);
    });
    
    updateStats();
    setSimulationTime(prev => prev + deltaTime);
  }, [speed, quorumSensingEnabled, evolutionEnabled]);

  const updateStats = useCallback(() => {
    const bacteria = bacteriaRef.current;
    
    // Find dominant strain
    let dominantStrain = '';
    let maxCount = 0;
    strainMapRef.current.forEach((count, strainId) => {
      if (count > maxCount) {
        maxCount = count;
        dominantStrain = strainId;
      }
    });
    
    // Calculate average resistance
    let totalResistance = 0;
    let resistanceCount = 0;
    bacteria.forEach(b => {
      b.strain.genome.resistanceGenes.forEach(level => {
        totalResistance += level;
        resistanceCount++;
      });
    });
    
    const averageResistance = resistanceCount > 0 ? totalResistance / resistanceCount : 0;
    
    // Calculate clotting risk
    const clottingRisk = Math.min(
      rheologyRef.current.fibrinogenLevel / 10 * 
      rheologyRef.current.plateletActivation,
      1.0
    );
    
    // Sepsis scoring
    const bacterialLoad = bacteria.length;
    const cytokineStorm = immuneResponseRef.current.cytokineProfile.proInflammatory > 50;
    let sirsScore = 0;
    if (bacterialLoad > 100) sirsScore++;
    if (cytokineStorm) sirsScore++;
    if (simulationTime > 360) sirsScore++;
    if (clottingRisk > 0.5) sirsScore++;
    
    const sepsisScore = Math.min(100, sirsScore * 25);
    
    // Update patient vitals based on infection
    const infectionSeverity = bacterialLoad / 100; // 0-5 scale
    const inflammationLevel = immuneResponseRef.current.cytokineProfile.proInflammatory;
    
    // Calculate vital changes
    const newHeartRate = 75 + Math.min(infectionSeverity * 20 + inflammationLevel * 0.5, 60);
    const newTemp = 37.0 + Math.min(infectionSeverity * 0.5 + inflammationLevel * 0.02, 3.5);
    const newRespRate = 16 + Math.min(infectionSeverity * 4 + inflammationLevel * 0.1, 20);
    const newO2Sat = Math.max(98 - infectionSeverity * 3 - inflammationLevel * 0.1, 70);
    
    // Blood pressure changes (septic shock causes drop)
    const shockFactor = sepsisScore > 75 ? 0.8 : 1.0;
    const newSystolic = Math.max((120 + infectionSeverity * 10) * shockFactor, 70);
    const newDiastolic = Math.max((80 + infectionSeverity * 5) * shockFactor, 40);
    
    // Lab values
    const newWBC = 7.5 + infectionSeverity * 8 + Math.random();
    const newCRP = 5 + infectionSeverity * 50 + inflammationLevel * 0.5;
    const newProcalcitonin = 0.05 + infectionSeverity * 2 + (bacterialLoad > 50 ? 1 : 0);
    const newLactate = 1.0 + (sepsisScore / 100) * 3 + (shockFactor < 1 ? 2 : 0);
    
    // Organ function (deteriorates with sepsis)
    const organDamage = Math.min(sepsisScore / 100 + clottingRisk, 1);
    const heartFunction = Math.max(100 - organDamage * 30 - (newHeartRate > 120 ? 10 : 0), 30);
    const lungFunction = Math.max(100 - organDamage * 35 - (100 - newO2Sat), 30);
    const kidneyFunction = Math.max(100 - organDamage * 40 - newLactate * 5, 20);
    const liverFunction = Math.max(100 - organDamage * 35 - clottingRisk * 30, 30);
    const brainFunction = Math.max(100 - organDamage * 25 - (newO2Sat < 90 ? 15 : 0), 40);
    
    // Overall health score
    const organAverage = (heartFunction + lungFunction + kidneyFunction + liverFunction + brainFunction) / 5;
    const vitalPenalty = (newHeartRate > 100 ? 5 : 0) + (newTemp > 38.5 ? 10 : 0) + 
                        (newO2Sat < 95 ? 10 : 0) + (newLactate > 2 ? 15 : 0);
    const overallHealth = Math.max(organAverage - vitalPenalty, 0);
    
    setPatientVitals({
      heartRate: Math.round(newHeartRate),
      bloodPressure: { 
        systolic: Math.round(newSystolic), 
        diastolic: Math.round(newDiastolic) 
      },
      temperature: Math.round(newTemp * 10) / 10,
      respiratoryRate: Math.round(newRespRate),
      oxygenSaturation: Math.round(newO2Sat),
      whiteBloodCells: Math.round(newWBC * 10) / 10,
      crp: Math.round(newCRP * 10) / 10,
      procalcitonin: Math.round(newProcalcitonin * 100) / 100,
      lactate: Math.round(newLactate * 10) / 10,
      organFunction: {
        heart: Math.round(heartFunction),
        lungs: Math.round(lungFunction),
        kidneys: Math.round(kidneyFunction),
        liver: Math.round(liverFunction),
        brain: Math.round(brainFunction)
      },
      overallHealth: Math.round(overallHealth)
    });
    
    setStats({
      totalBacteria: bacterialLoad,
      uniqueStrains: strainMapRef.current.size,
      dominantStrain: dominantStrain.substring(0, 15) + '...',
      averageResistance: averageResistance,
      biofilmCoverage: bacteria.filter(b => b.biofilm).length / Math.max(1, bacteria.filter(b => b.adherent).length) * 100,
      phageCount: phagesRef.current.length,
      lysogenicBacteria: bacteria.filter(b => b.prophage).length,
      viscosity: rheologyRef.current.viscosity,
      sepsisScore,
      bacteremia: bacterialLoad > 10,
      clottingRisk: clottingRisk * 100,
      cytokineStorm
    });
  }, [simulationTime]);

  // ============= RENDERING =============
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw vessel with viscosity indication
    const viscosityColor = Math.floor(255 - (rheologyRef.current.viscosity - 1) * 200);
    ctx.strokeStyle = `rgb(${74}, ${viscosityColor / 3}, ${viscosityColor / 3})`;
    ctx.lineWidth = 3 + rheologyRef.current.viscosity;
    ctx.beginPath();
    ctx.moveTo(0, VESSEL_CENTER_Y - VESSEL_RADIUS);
    ctx.lineTo(WIDTH, VESSEL_CENTER_Y - VESSEL_RADIUS);
    ctx.moveTo(0, VESSEL_CENTER_Y + VESSEL_RADIUS);
    ctx.lineTo(WIDTH, VESSEL_CENTER_Y + VESSEL_RADIUS);
    ctx.stroke();
    
    // Draw bacteria with strain colors
    bacteriaRef.current.forEach(bacterium => {
      const distFromCenter = Math.sqrt(
        Math.pow(bacterium.y - VESSEL_CENTER_Y, 2) + 
        Math.pow(bacterium.z, 2)
      );
      
      if (distFromCenter < VESSEL_RADIUS + 10) {
        ctx.save();
        ctx.globalAlpha = bacterium.health / 100;
        
        // Color based on strain
        ctx.fillStyle = bacterium.strain.color;
        
        // Visual indicators
        if (bacterium.adherent) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(bacterium.x - 8, bacterium.y - 8, 16, 16);
          ctx.setLineDash([]);
        }
        
        if (bacterium.prophage) {
          // Lysogenic bacteria have a halo
          ctx.strokeStyle = '#00FF88';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, 12, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        if (bacterium.metabolicState === 'persister') {
          // Persisters are darker
          ctx.globalAlpha *= 0.5;
        }
        
        // Draw bacterium
        const size = BACTERIAL_PROFILES[bacterium.strain.parentSpecies].size;
        ctx.beginPath();
        if (bacterium.strain.genome.virulenceFactors.biofilmGenes > 0.7 && bacterium.biofilm) {
          // Enhanced biofilm visualization
          const gradient = ctx.createRadialGradient(bacterium.x, bacterium.y, 0, bacterium.x, bacterium.y, size * 2);
          gradient.addColorStop(0, bacterium.strain.color);
          gradient.addColorStop(1, 'rgba(138, 43, 226, 0.3)');
          ctx.fillStyle = gradient;
          ctx.arc(bacterium.x, bacterium.y, size * 1.5, 0, Math.PI * 2);
        } else {
          ctx.arc(bacterium.x, bacterium.y, size, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Quorum sensing visualization
        if (bacterium.quorumSignal > 0.5) {
          ctx.strokeStyle = `rgba(255, 255, 0, ${bacterium.quorumSignal * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, 20 * bacterium.quorumSignal, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    });
    
    // Draw phages
    ctx.fillStyle = '#00FF88';
    phagesRef.current.forEach(phage => {
      ctx.beginPath();
      ctx.moveTo(phage.x, phage.y - 5);
      ctx.lineTo(phage.x - 3, phage.y + 3);
      ctx.lineTo(phage.x + 3, phage.y + 3);
      ctx.closePath();
      ctx.fill();
    });
    
  }, []);

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
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, animate]);

  // ============= PHAGE THERAPY DEPLOYMENT =============
  const deployPhageTherapy = useCallback(() => {
    const phages = phagesRef.current;
    
    if (phageTherapyMode === 'targeted') {
      // Deploy specific phages
      selectedPhages.forEach(phageId => {
        for (let i = 0; i < 20; i++) {
          phages.push({
            id: Math.random(),
            libraryId: phageId,
            x: Math.random() * WIDTH * 0.2,
            y: VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS,
            z: (Math.random() - 0.5) * VESSEL_RADIUS,
            vx: bloodFlowRate + Math.random() * 2,
            vy: (Math.random() - 0.5),
            attached: false,
            generation: 0,
            mutations: []
          });
        }
      });
    } else if (phageTherapyMode === 'cocktail') {
      // Auto-generate cocktail
      const targetSpecies = Array.from(new Set(bacteriaRef.current.map(b => b.strain.parentSpecies)));
      const cocktail = phageEngineRef.current.generatePhageCocktail(targetSpecies);
      
      cocktail.forEach(phageLib => {
        for (let i = 0; i < 15; i++) {
          phages.push({
            id: Math.random(),
            libraryId: phageLib.id,
            x: Math.random() * WIDTH * 0.2,
            y: VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS,
            z: (Math.random() - 0.5) * VESSEL_RADIUS,
            vx: bloodFlowRate + Math.random() * 2,
            vy: (Math.random() - 0.5),
            attached: false,
            generation: 0,
            mutations: []
          });
        }
      });
    }
  }, [phageTherapyMode, selectedPhages, bloodFlowRate]);

  const handleReset = () => {
    setIsRunning(false);
    initializeSimulation();
    setSimulationTime(0);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1600px',
      margin: '0 auto',
      background: isDark ? '#0a0a0a' : '#f5f5f5',
      padding: '1rem',
      borderRadius: '12px'
    }}>
      {/* Advanced Stats Display */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.95)',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#fff',
        fontSize: '0.65rem',
        fontFamily: 'monospace',
        zIndex: 100,
        maxWidth: '250px'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#3b82f6' }}>
          <Dna size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Evolution Metrics
        </div>
        <div>Strains: {stats.uniqueStrains}</div>
        <div>Dominant: {stats.dominantStrain}</div>
        <div>Avg Resistance: {(stats.averageResistance * 100).toFixed(1)}%</div>
        <div>Lysogenic: {stats.lysogenicBacteria}</div>
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#ef4444' }}>
            <Droplets size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Blood Rheology
          </div>
          <div>Viscosity: {stats.viscosity.toFixed(2)}</div>
          <div>Clotting Risk: {stats.clottingRisk.toFixed(0)}%</div>
          <div>Cytokine Storm: {stats.cytokineStorm ? 'YES' : 'No'}</div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Canvas Container */}
        <div style={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            style={{
              width: '100%',
              height: 'auto',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              display: 'block'
            }}
          />
          
          {/* HUD */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.95)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#fff',
            minWidth: '180px'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Clock size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Hour {Math.floor(simulationTime / 60)}
            </div>
            <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CFU/mL:</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.totalBacteria}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phages:</span>
                <span style={{ fontWeight: 600, color: '#00FF88' }}>{stats.phageCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Biofilm:</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{stats.biofilmCoverage.toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sepsis:</span>
                <span style={{ 
                  fontWeight: 700, 
                  color: stats.sepsisScore > 75 ? '#ef4444' : stats.sepsisScore > 50 ? '#f59e0b' : '#22c55e'
                }}>
                  {stats.sepsisScore.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '1rem',
            background: 'rgba(0, 0, 0, 0.95)',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <button onClick={() => setIsRunning(!isRunning)} style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}>
              {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
            </button>
            <button onClick={handleReset} style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}>
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
                style={{ width: '80px' }}
              />
              <span>{speed}x</span>
            </div>
          </div>
        </div>
        
        {/* Patient Health Monitor Panel */}
        <div style={{
          width: '320px',
          background: isDark ? '#0f0f0f' : '#f9f9f9',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          height: 'fit-content'
        }}>
          {/* Patient Header */}
          <div style={{
            textAlign: 'center',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <h3 style={{
              margin: 0,
              color: '#3b82f6',
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '0.5rem'
            }}>
              Patient Monitor
            </h3>
            <div style={{
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}>
              ID: P-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
            </div>
          </div>
          
          {/* Overall Health */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Overall Health
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: patientVitals.overallHealth > 70 ? '#22c55e' : 
                     patientVitals.overallHealth > 40 ? '#f59e0b' : '#ef4444'
            }}>
              {patientVitals.overallHealth}%
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '0.5rem'
            }}>
              <div style={{
                width: `${patientVitals.overallHealth}%`,
                height: '100%',
                background: patientVitals.overallHealth > 70 ? '#22c55e' : 
                           patientVitals.overallHealth > 40 ? '#f59e0b' : '#ef4444',
                transition: 'all 0.5s ease'
              }} />
            </div>
          </div>
          
          {/* Heart Visual */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            position: 'relative'
          }}>
            <Heart 
              size={48} 
              color={patientVitals.heartRate > 100 ? '#ef4444' : '#ec4899'}
              fill={patientVitals.heartRate > 100 ? '#ef4444' : '#ec4899'}
              style={{
                animation: `pulse ${60000 / patientVitals.heartRate}ms ease-in-out infinite`
              }}
            />
            <style>
              {`@keyframes pulse { 
                0% { transform: scale(1); opacity: 1; } 
                50% { transform: scale(1.1); opacity: 0.8; } 
                100% { transform: scale(1); opacity: 1; }
              }`}
            </style>
            <div style={{
              position: 'absolute',
              bottom: '0.5rem',
              fontSize: '0.7rem',
              color: '#fff'
            }}>
              {patientVitals.heartRate} BPM
            </div>
          </div>
          
          {/* Vital Signs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            fontSize: '0.7rem'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ color: '#94a3b8' }}>BP</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>
                {patientVitals.bloodPressure.systolic}/{patientVitals.bloodPressure.diastolic}
              </div>
            </div>
            
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ color: '#94a3b8' }}>Temp</div>
              <div style={{ 
                color: patientVitals.temperature > 38 ? '#ef4444' : '#fff',
                fontWeight: 600 
              }}>
                {patientVitals.temperature}°C
              </div>
            </div>
            
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <div style={{ color: '#94a3b8' }}>SpO₂</div>
              <div style={{ 
                color: patientVitals.oxygenSaturation < 95 ? '#f59e0b' : '#fff',
                fontWeight: 600 
              }}>
                {patientVitals.oxygenSaturation}%
              </div>
            </div>
            
            <div style={{
              background: 'rgba(251, 146, 60, 0.1)',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(251, 146, 60, 0.3)'
            }}>
              <div style={{ color: '#94a3b8' }}>RR</div>
              <div style={{ 
                color: patientVitals.respiratoryRate > 20 ? '#f59e0b' : '#fff',
                fontWeight: 600 
              }}>
                {patientVitals.respiratoryRate}/min
              </div>
            </div>
          </div>
          
          {/* Lab Values */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.65rem'
          }}>
            <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: '0.5rem' }}>
              Lab Results
            </div>
            <div style={{ display: 'grid', gap: '0.25rem', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>WBC:</span>
                <span style={{ 
                  color: patientVitals.whiteBloodCells > 11 ? '#f59e0b' : '#fff' 
                }}>
                  {patientVitals.whiteBloodCells} ×10⁹/L
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>CRP:</span>
                <span style={{ 
                  color: patientVitals.crp > 10 ? '#ef4444' : '#fff' 
                }}>
                  {patientVitals.crp} mg/L
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>PCT:</span>
                <span style={{ 
                  color: patientVitals.procalcitonin > 0.5 ? '#ef4444' : '#fff' 
                }}>
                  {patientVitals.procalcitonin} ng/mL
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Lactate:</span>
                <span style={{ 
                  color: patientVitals.lactate > 2 ? '#ef4444' : '#fff' 
                }}>
                  {patientVitals.lactate} mmol/L
                </span>
              </div>
            </div>
          </div>
          
          {/* Organ Function */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.75rem',
            borderRadius: '4px',
            fontSize: '0.65rem'
          }}>
            <div style={{ fontWeight: 600, color: '#8b5cf6', marginBottom: '0.5rem' }}>
              Organ Function
            </div>
            {Object.entries(patientVitals.organFunction).map(([organ, value]) => (
              <div key={organ} style={{ marginBottom: '0.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  color: '#94a3b8',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ textTransform: 'capitalize' }}>{organ}</span>
                  <span style={{
                    color: value > 70 ? '#22c55e' : value > 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    {value}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${value}%`,
                    height: '100%',
                    background: value > 70 ? '#22c55e' : value > 40 ? '#f59e0b' : '#ef4444',
                    transition: 'all 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Clinical Status */}
          <div style={{
            background: stats.bacteremia ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.1)',
            padding: '0.5rem',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: stats.bacteremia ? '#ef4444' : '#22c55e',
            border: `1px solid ${stats.bacteremia ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.3)'}`
          }}>
            {stats.bacteremia ? 
              (stats.sepsisScore > 50 ? 'SEPSIS ALERT' : 'BACTEREMIA DETECTED') : 
              'NO BACTEREMIA'}
          </div>
        </div>
      </div>
      
      {/* Advanced Control Tabs */}
      <div style={{
        background: isDark ? '#1a1a1a' : '#fff',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          paddingBottom: '0.5rem'
        }}>
          {['microbiology', 'therapy', 'evolution', 'rheology'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                background: activeTab === tab ? 'rgba(59, 130, 246, 0.2)' : 'none',
                border: 'none',
                color: activeTab === tab ? '#3b82f6' : '#94a3b8',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              {tab === 'microbiology' && <Microscope size={14} />}
              {tab === 'therapy' && <Beaker size={14} />}
              {tab === 'evolution' && <GitBranch size={14} />}
              {tab === 'rheology' && <Droplets size={14} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'microbiology' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.875rem' }}>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={evolutionEnabled}
                    onChange={(e) => setEvolutionEnabled(e.target.checked)}
                  />
                  Enable Evolution
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={quorumSensingEnabled}
                    onChange={(e) => setQuorumSensingEnabled(e.target.checked)}
                  />
                  Quorum Sensing
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>
                Select Pathogens
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
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
                    cursor: 'pointer',
                    fontSize: '0.75rem'
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
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: profile.color
                    }} />
                    <div style={{ color: isDark ? '#fff' : '#000' }}>{profile.name}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'therapy' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>
                Phage Therapy Mode
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['off', 'targeted', 'cocktail'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPhageTherapyMode(mode as any)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: phageTherapyMode === mode ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {phageTherapyMode === 'targeted' && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.75rem' }}>
                  Select Phage Libraries
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {['phage_K', 'T7', 'cocktail_1', 'lambda'].map(phageId => (
                    <label key={phageId} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: selectedPhages.includes(phageId) ? 
                        'rgba(0, 255, 136, 0.1)' : 'transparent',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.7rem'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedPhages.includes(phageId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPhages([...selectedPhages, phageId]);
                          } else {
                            setSelectedPhages(selectedPhages.filter(p => p !== phageId));
                          }
                        }}
                      />
                      {phageId}
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={deployPhageTherapy}
              disabled={phageTherapyMode === 'off'}
              style={{
                padding: '0.75rem 1.5rem',
                background: phageTherapyMode !== 'off' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '4px',
                color: '#fff',
                cursor: phageTherapyMode !== 'off' ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Target size={16} />
              Deploy Phage Therapy
            </button>
          </div>
        )}
        
        {activeTab === 'evolution' && (
          <div style={{ fontSize: '0.8rem' }}>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#3b82f6' }}>
                <GitBranch size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Strain Evolution Status
              </div>
              <div style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                <div>Active Strains: {stats.uniqueStrains}</div>
                <div>Dominant Strain: {stats.dominantStrain}</div>
                <div>Average Resistance Level: {(stats.averageResistance * 100).toFixed(1)}%</div>
                <div>Lysogenic Conversions: {stats.lysogenicBacteria}</div>
              </div>
            </div>
            
            <div style={{ color: isDark ? '#94a3b8' : '#4b5563', lineHeight: 1.5 }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Evolution Features:</strong>
              </p>
              <ul style={{ marginLeft: '1rem', listStyle: 'disc' }}>
                <li>Point mutations during replication (rate: {(ADVANCED_CONFIG.MUTATION_RATE * 100).toFixed(2)}%)</li>
                <li>Horizontal gene transfer between nearby bacteria</li>
                <li>Phage resistance evolution (CRISPR, restriction-modification)</li>
                <li>Fitness cost of resistance mechanisms</li>
                <li>Metabolic state transitions (active, persister, dormant)</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'rheology' && (
          <div style={{ fontSize: '0.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>
                  <Droplets size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Blood Properties
                </div>
                <div style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  <div>Viscosity: {rheologyRef.current.viscosity.toFixed(2)} cP</div>
                  <div>Fibrinogen: {rheologyRef.current.fibrinogenLevel.toFixed(1)} g/L</div>
                  <div>Platelet Activation: {(rheologyRef.current.plateletActivation * 100).toFixed(0)}%</div>
                  <div>Clotting Risk: {stats.clottingRisk.toFixed(0)}%</div>
                </div>
              </div>
              
              <div style={{ padding: '0.75rem', background: 'rgba(251, 146, 60, 0.1)', borderRadius: '4px', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#fb923c' }}>
                  <Activity size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Immune Response
                </div>
                <div style={{ color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  <div>Pro-inflammatory: {immuneResponseRef.current.cytokineProfile.proInflammatory.toFixed(1)}</div>
                  <div>Anti-inflammatory: {immuneResponseRef.current.cytokineProfile.antiInflammatory.toFixed(1)}</div>
                  <div>Complement: {(immuneResponseRef.current.innate.complementActivation * 100).toFixed(0)}%</div>
                  <div>Cytokine Storm: {stats.cytokineStorm ? 'Active' : 'None'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}