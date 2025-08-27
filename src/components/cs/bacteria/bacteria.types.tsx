// bacteria.types.tsx
// ============= CONFIGURATION =============
export const ADVANCED_CONFIG = {
  MAX_BACTERIA: 500,
  MAX_BLOOD_CELLS: 200,
  MAX_PHAGES: 100,
  MAX_CYTOKINES: 50,
  USE_WEBGL: false,
  USE_WORKERS: false,
  ENABLE_EVOLUTION: true,
  ENABLE_QUORUM_SENSING: true,
  ENABLE_METABOLIC_STATES: true,
  MUTATION_RATE: 0.001,
  HGT_RATE: 0.0001,
  PHYSICS_SUBSTEPS: 2,
  EVOLUTION_INTERVAL: 100
};

// ============= TYPE DEFINITIONS =============
export type BacterialSpecies = "S_aureus" | "E_coli" | "P_aeruginosa" | "K_pneumoniae" | "S_pyogenes" | "E_faecalis";
export type CellType = "rbc" | "neutrophil" | "macrophage" | "tcell" | "bcell" | "platelet" | "dendritic";
export type AntibodyType = "IgM" | "IgG" | "IgA" | "IgE";
export type ClotComponent = "fibrin" | "platelet" | "rbc" | "fat";
export type AntibioticClass = "penicillin" | "vancomycin" | "ciprofloxacin" | "gentamicin" | "ceftriaxone";
export type MetabolicState = "active" | "dormant" | "persister" | "spore";
export type PhageStrategy = "lytic" | "lysogenic" | "chronic";

export interface Genome {
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
  fitnessCoat: number;
}

export interface BacterialStrain {
  id: string;
  parentSpecies: BacterialSpecies;
  genome: Genome;
  mutationHistory: string[];
  generation: number;
  color: string;
}

export interface EnhancedBacterium {
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
  quorumSignal: number;
  adherent: boolean;
  biofilm: boolean;
  phageInfected: boolean;
  prophage?: string;
  opsonized: boolean;
  complementBound: boolean;
  age: number;
  stressLevel: number;
  gridKey?: string;
}

export interface ImmuneCell {
  id: number;
  type: CellType;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  health: number;
  activation: number;
  targetId?: number;
  phagocytosedCount: number;
  cytokineProduction: number;
  age: number;
  maturation: number; // For dendritic cells and T cells
}

export interface Antibody {
  id: number;
  type: AntibodyType;
  x: number;
  y: number;
  specificity: BacterialSpecies | null;
  boundTo?: number;
  opsonizing: boolean;
  concentration: number;
}

export interface BloodClot {
  id: number;
  x: number;
  y: number;
  radius: number;
  components: Map<ClotComponent, number>;
  occlusion: number; // 0-1, how much vessel is blocked
  age: number;
  stable: boolean;
}

export interface FatDeposit {
  id: number;
  x: number;
  y: number;
  size: number;
  oxidized: boolean; // Oxidized LDL triggers inflammation
  foamCells: number; // Macrophages that consumed fat
  plaque: boolean; // Atherosclerotic plaque
  ruptureRisk: number;
}

export interface PhageLibrary {
  id: string;
  name: string;
  hostRange: BacterialSpecies[];
  strategy: PhageStrategy;
  burstSize: number;
  latencyPeriod: number;
  adsorptionRate: number;
  specificity: number;
  evolutionRate: number;
  resistanceBreaking: boolean;
}

export interface EnhancedPhage {
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

export interface BloodRheology {
  viscosity: number;
  shearRate: number;
  hematocrit: number;
  fibrinogenLevel: number;
  plateletActivation: number;
}

export interface ImmuneResponse {
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
    proInflammatory: number;
    antiInflammatory: number;
    chemokines: number;
  };
}

export interface PatientVitals {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  whiteBloodCells: number;
  crp: number;
  procalcitonin: number;
  lactate: number;
  organFunction: {
    heart: number;
    lungs: number;
    kidneys: number;
    liver: number;
    brain: number;
  };
  overallHealth: number;
}

export interface SimulationStats {
  totalBacteria: number;
  uniqueStrains: number;
  dominantStrain: string;
  averageResistance: number;
  biofilmCoverage: number;
  phageCount: number;
  lysogenicBacteria: number;
  viscosity: number;
  sepsisScore: number;
  bacteremia: boolean;
  clottingRisk: number;
  cytokineStorm: boolean;
}

// ============= DATA PROFILES =============
export const BACTERIAL_PROFILES = {
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

export const ANTIBIOTIC_PROFILES = {
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