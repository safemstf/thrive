// ==================== TYPES & INTERFACES ====================

export interface BaseEntity {
    id: number;
    x: number;
    y: number;
    energy: number;
    radius: number;
}

export interface PhysicalEntity extends BaseEntity {
    vx: number;
    vy: number;
    mass: number;
}

export type MoleculeType =
    | 'water'
    | 'carbon'
    | 'nitrogen'
    | 'oxygen'
    | 'amino_acid'
    | 'nucleotide'
    | 'lipid'
    | 'sugar'
    | 'peptide'
    | 'rna_fragment'
    | 'membrane_vesicle';

export interface MolecularEntity extends PhysicalEntity {
    type: MoleculeType;
    symbol: string;
    color: string;
    bonded: boolean;
    bondedTo: Set<number>;
    complexity: number;
}

export interface ProtoLifeEntity extends BaseEntity {
    molecules: Set<number>;
    rnaSequence: string;
    hasMembrane: boolean;
    hasMetabolism: boolean;
    canReplicate: boolean;
    stability: number;
    age: number;
}

// Extended traits for evolution
export interface OrganismTraits {
    metabolicEfficiency: number;  // How well it converts energy
    speed: number;                // Movement speed
    size: number;                 // Body size (radius)
    color: string;                // Visual color
    // NEW evolutionary traits
    predatory: number;            // 0-1: Tendency to hunt (0 = autotroph, 1 = pure predator)
    defense: number;              // 0-1: Resistance to being eaten
    cooperation: number;          // 0-1: Tendency to form colonies
    senseRange: number;           // How far it can detect others
}

export interface LivingEntity extends PhysicalEntity {
    generation: number;
    genome: string;
    birthTime: number;
    isAlive: boolean;
    canMove: boolean;
    parent: number | null;
    children: number[];
    traits: OrganismTraits;
}

// NEW: For endosymbiosis / eukaryotes
export interface EukaryoteEntity extends LivingEntity {
    hasNucleus: boolean;
    hasMitochondria: boolean;    // Absorbed another organism
    hasChloroplast: boolean;     // Absorbed a photosynthetic organism
    organelles: number[];        // IDs of absorbed organisms
    isEukaryote: true;
}

// NEW: Colony / multicellular
export interface ColonyEntity extends BaseEntity {
    members: Set<number>;         // Organism IDs
    cellCount: number;
    specialization: Map<number, 'sensor' | 'motor' | 'digestive' | 'reproductive'>;
    isMulticellular: boolean;
}

export interface Bond {
    mol1: number;
    mol2: number;
    strength: number;
    type: 'covalent' | 'hydrogen' | 'hydrophobic';
    restLength: number;
    k?: number;
}

export type SimulationPhase =
    | 'primordial_soup'
    | 'synthesis'
    | 'polymerization'
    | 'self_assembly'
    | 'proto_life'
    | 'luca_emergence'
    | 'early_life'
    | 'diversification'
    // NEW phases
    | 'predation_emerges'
    | 'endosymbiosis'
    | 'eukaryotes'
    | 'colonial_life'
    | 'multicellular';

export interface PhylogenySimProps {
    isRunning?: boolean;
    speed?: number;
}

export interface HydrothermalVent {
    x: number;
    y: number;
    strength: number;
    phase: number;
}

export interface Rock {
    x: number;
    y: number;
    radius: number;
    roughness: number;
    type: 'chimney' | 'boulder' | 'ridge';
}

// NEW: Environmental zones
export interface EnvironmentZone {
    x: number;
    y: number;
    radius: number;
    type: 'vent_hot' | 'vent_warm' | 'cold_seep' | 'open_water' | 'surface';
    energyRate: number;      // Energy regeneration
    temperature: number;     // Affects metabolism
    lightLevel: number;      // For photosynthesis later
}

// ==================== CONSTANTS ====================

export const COLORS = {
    bg: '#0a0e1a',
    surface: '#111827',
    text: '#f8fafc',
    textMuted: '#64748b',
    water: 'rgba(96, 165, 250, 0.5)',
    carbon: 'rgba(120, 113, 108, 0.7)',
    nitrogen: 'rgba(147, 197, 253, 0.6)',
    oxygen: 'rgba(239, 68, 68, 0.6)',
    amino_acid: 'rgba(236, 72, 153, 0.85)',
    nucleotide: 'rgba(139, 92, 246, 0.9)',
    lipid: 'rgba(250, 204, 21, 0.85)',
    sugar: 'rgba(134, 239, 172, 0.7)',
    peptide: 'rgba(219, 39, 119, 0.9)',
    rna_fragment: 'rgba(124, 58, 237, 1)',
    membrane_vesicle: 'rgba(245, 158, 11, 0.8)',
    proto: 'rgba(236, 72, 153, 0.85)',
    luca: 'rgba(251, 191, 36, 1)',
    organism: 'rgba(59, 130, 246, 0.9)',
    // NEW colors for evolution
    predator: 'rgba(239, 68, 68, 0.9)',
    prey: 'rgba(134, 239, 172, 0.9)',
    eukaryote: 'rgba(168, 85, 247, 0.9)',
    colony: 'rgba(34, 211, 238, 0.9)',
    bond_covalent: 'rgba(139, 92, 246, 0.5)',
    bond_hydrogen: 'rgba(96, 165, 250, 0.4)',
    bond_hydrophobic: 'rgba(250, 204, 21, 0.3)',
    energy: 'rgba(20, 184, 166, 0.12)',
} as const;

export const RNA_BASES = ['A', 'U', 'C', 'G'] as const;
export const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L', 'K', 'M'] as const;
export const RNA_LENGTH = 24;
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 720;

// Reduced for performance
export const INITIAL_COUNTS: Record<string, number> = {
    water: 250,
    carbon: 100,
    nitrogen: 80,
    oxygen: 80,
    amino_acid: 70,
    nucleotide: 90,
    lipid: 90,
    sugar: 50,
};

export const MOLECULE_SPEED = 0.4;
export const COLLISION_DISTANCE = 12;
export const UPDATE_INTERVAL = 100;

export const BOND_PROBABILITIES = {
    amino_acid_to_peptide: 0.08,
    nucleotide_to_rna: 0.09,
    lipid_to_membrane: 0.10,
    simple_to_building_block: 0.06,
    vent_multiplier: 6.0,
    rock_multiplier: 5.0,
    cross_type_bond: 0.05,  // Increased for faster protocell diversity
} as const;

// Easier thresholds
export const PEPTIDE_SIZE_FOR_METABOLISM = 2;
export const RNA_SIZE_FOR_REPLICATION = 3;
export const LIPID_COUNT_FOR_MEMBRANE = 4;
export const PROTOCELL_STABILITY_FOR_LUCA = 60;

// Protocell limits
export const PROTOCELL_MAX_SIZE = 22;
export const PROTOCELL_MIN_SIZE = 4;
export const PROTOCELL_MERGE_DISTANCE = 35;  // Reduced to prevent jitter
export const PROTOCELL_MERGE_COOLDOWN = 60;  // Frames before can merge again

// NEW: Evolutionary parameters
export const EVOLUTION = {
    // Energy & Resources
    BASE_ENERGY_DRAIN: 0.06,           // Base metabolism cost per frame
    ENERGY_FROM_ENVIRONMENT: 0.8,      // Max energy from environment per frame
    ENERGY_FROM_PREDATION: 0.6,        // Fraction of prey's energy gained
    STARVATION_THRESHOLD: 20,          // Below this, organism weakens
    
    // Predation
    PREDATION_SIZE_RATIO: 1.3,         // Must be this much bigger to eat
    PREDATION_SUCCESS_BASE: 0.3,       // Base chance to catch prey
    PREDATION_RANGE: 80,               // Detection range for prey
    
    // Reproduction
    REPRODUCTION_ENERGY_COST: 45,
    REPRODUCTION_COOLDOWN: 400,
    MUTATION_RATE: 0.025,
    
    // Endosymbiosis
    ENDOSYMBIOSIS_CHANCE: 0.001,       // Per-frame chance when conditions met
    ENDOSYMBIOSIS_SIZE_RATIO: 2.0,     // Must be 2x bigger to engulf
    
    // Colony formation
    COLONY_COOPERATION_THRESHOLD: 0.6, // Trait value needed to form colonies
    COLONY_RANGE: 40,                  // Range to detect potential colony members
    COLONY_MIN_SIZE: 3,
    COLONY_MAX_SIZE: 12,
    
    // Population limits
    MAX_PROKARYOTES: 40,
    MAX_EUKARYOTES: 20,
    MAX_COLONIES: 8,
} as const;

export const PHASE_LABELS: Record<SimulationPhase, string> = {
    primordial_soup: 'Primordial Soup',
    synthesis: 'Molecular Synthesis',
    polymerization: 'Polymerization',
    self_assembly: 'Self-Assembly',
    proto_life: 'Protocell Formation',
    luca_emergence: '⭐ LUCA Emerged',
    early_life: 'Early Life',
    diversification: 'Diversification',
    predation_emerges: '🦠 Predation Emerges',
    endosymbiosis: '🔬 Endosymbiosis',
    eukaryotes: '🧬 Eukaryotes Emerge',
    colonial_life: '🔗 Colonial Life',
    multicellular: '🌿 Multicellular Life',
};

export const MOLECULE_INFO: Record<string, { label: string; color: string; symbol: string }> = {
    water: { label: 'H₂O', color: '#60a5fa', symbol: 'W' },
    carbon: { label: 'C', color: '#78716c', symbol: 'C' },
    nitrogen: { label: 'N₂', color: '#93c5fd', symbol: 'N' },
    oxygen: { label: 'O₂', color: '#ef4444', symbol: 'O' },
    amino_acid: { label: 'Amino Acid', color: '#ec4899', symbol: 'AA' },
    nucleotide: { label: 'Nucleotide', color: '#8b5cf6', symbol: 'Nu' },
    lipid: { label: 'Lipid', color: '#facc15', symbol: 'Li' },
    sugar: { label: 'Sugar', color: '#86efac', symbol: 'Su' },
    peptide: { label: 'Peptide', color: '#db2777', symbol: 'Pep' },
    rna_fragment: { label: 'RNA', color: '#7c3aed', symbol: 'RNA' },
    membrane_vesicle: { label: 'Vesicle', color: '#f59e0b', symbol: 'Ves' },
};

// Genome encoding for traits
// Genome format: 24 bases (A, U, C, G)
// Positions 0-3: metabolicEfficiency
// Positions 4-7: speed
// Positions 8-11: size
// Positions 12-15: predatory
// Positions 16-19: defense
// Positions 20-23: cooperation
export const GENOME_REGIONS = {
    METABOLISM: [0, 4],
    SPEED: [4, 8],
    SIZE: [8, 12],
    PREDATORY: [12, 16],
    DEFENSE: [16, 20],
    COOPERATION: [20, 24],
} as const;