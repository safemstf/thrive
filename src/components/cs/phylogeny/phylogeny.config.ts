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

export interface OrganismTraits {
    metabolicEfficiency: number;
    speed: number;
    size: number;
    color: string;
    predatory: number;
    defense: number;
    cooperation: number;
    senseRange: number;
    photosynthetic: number;
    aerobic: number;
    reproductiveStrategy: 'asexual' | 'sexual' | 'both';
    matingDisplay: number;
    geneticCompatibility: number;
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

export interface EukaryoteEntity extends LivingEntity {
    hasNucleus: boolean;
    hasMitochondria: boolean;
    hasChloroplast: boolean;
    organelleGenomes: string[];
    compartments: number;
    ploidy: 1 | 2;
    isEukaryote?: true;
}

export type CellRole = 
    | 'stem'
    | 'sensor'
    | 'motor'
    | 'digestive'
    | 'reproductive'
    | 'structural'
    | 'photosynthetic'
    | 'nerve';

export interface ColonyMember {
    organismId: number;
    role: CellRole;
    position: { x: number; y: number };
    joinTime: number;
}

export interface ColonyEntity extends BaseEntity {
    members: Map<number, ColonyMember>;
    cellCount: number;
    specialization?: Map<number, CellRole>;
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
    | 'predation_emerges'
    | 'endosymbiosis'
    | 'eukaryotes'
    | 'colonial_life'
    | 'cell_differentiation'
    | 'multicellular'
    | 'sexual_reproduction'
    | 'speciation'
    | 'cambrian_explosion';

export type ViewMode = 'molecular' | 'cellular' | 'ecosystem';

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

export interface EnvironmentZone {
    x: number;
    y: number;
    radius: number;
    type: 'vent_hot' | 'vent_warm' | 'cold_seep' | 'open_water' | 'surface' | 'oxygen_rich';
    energyRate: number;
    temperature: number;
    lightLevel: number;
    oxygenLevel: number;
    toxicity: number;
}

export interface Species {
    id: number;
    name: string;
    founderId: number;
    founderGenome: string;
    color: string;
    createdAt: number;
    memberCount: number;
    extinctAt: number | null;
    parentSpeciesId: number | null;
    traits: OrganismTraits;
    children: number[];
    treeX?: number;
    treeY?: number;
}

export type CatastropheType = 
    | 'meteor_impact'
    | 'volcanic_winter'
    | 'oxygen_spike'
    | 'ice_age'
    | 'toxic_bloom'
    | 'solar_flare';

export interface Catastrophe {
    type: CatastropheType;
    startTime: number;
    duration: number;
    intensity: number;
    x: number;
    y: number;
    radius: number;
}

export interface CatastropheConfig {
    name: string;
    description: string;
    icon: string;
    minDuration: number;
    maxDuration: number;
    effects: {
        energyMultiplier?: number;
        deathChance?: number;
        mutationBoost?: number;
    };
}

export interface HistoricalEvent {
    time: number;
    type: 'milestone' | 'speciation' | 'extinction' | 'catastrophe' | 'first_occurrence';
    title: string;
    description: string;
    icon: string;
    speciesId?: number;
}

export interface Camera {
    x: number;
    y: number;
    zoom: number;
    targetX: number;
    targetY: number;
    targetZoom: number;
}

export interface Selection {
    type: 'molecule' | 'protocell' | 'organism' | 'colony' | null;
    id: number | null;
}

export interface SimulationStats {
    time: number;
    totalBorn: number;
    totalDeaths: number;
    predationEvents: number;
    endosymbiosisEvents: number;
    sexualReproductionEvents: number;
    speciationEvents: number;
    extinctionEvents: number;
    maxGeneration: number;
    prokaryoteCount: number;
    eukaryoteCount: number;
    colonyCount: number;
    speciesCount: number;
    livingSpeciesCount: number;
    totalCellsInColonies: number;
    geneticDiversity: number;
}

export interface Milestone {
    id: string;
    name: string;
    description: string;
    icon: string;
    achieved: boolean;
    time: number | null;
}

export interface PhylogenySimProps {
    isRunning?: boolean;
    speed?: number;
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
export const RNA_LENGTH = 40;

// World dimensions (larger than canvas for scrolling)
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1440;
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 720;

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
    cross_type_bond: 0.05,
} as const;

// Protocell constants
export const PROTOCELL = {
    PEPTIDE_FOR_METABOLISM: 2,
    RNA_FOR_REPLICATION: 3,
    LIPID_FOR_MEMBRANE: 4,
    STABILITY_FOR_LUCA: 60,
    MAX_SIZE: 22,
    MIN_SIZE: 4,
    MERGE_DISTANCE: 35,
    MERGE_COOLDOWN: 60,
} as const;

// Evolution parameters
export const EVOLUTION = {
    // Energy & Resources
    BASE_ENERGY_DRAIN: 0.06,
    ENERGY_FROM_ENVIRONMENT: 0.8,
    ENERGY_FROM_PREDATION: 0.6,
    ENERGY_FROM_PHOTOSYNTHESIS: 1.2,
    STARVATION_THRESHOLD: 20,
    
    // Predation
    PREDATION_SIZE_RATIO: 1.3,
    PREDATION_SUCCESS_BASE: 0.3,
    PREDATION_RANGE: 80,
    
    // Reproduction
    ASEXUAL_REPRODUCTION_COST: 45,
    ASEXUAL_REPRODUCTION_COOLDOWN: 400,
    SEXUAL_REPRODUCTION_COST: 60,
    SEXUAL_REPRODUCTION_COOLDOWN: 500,
    MUTATION_RATE: 0.025,
    SEXUAL_MUTATION_RATE: 0.015,
    CROSSOVER_RATE: 0.12,
    MATING_RANGE: 60,
    MATING_DURATION: 80,
    
    // Endosymbiosis
    ENDOSYMBIOSIS_CHANCE: 0.001,
    ENDOSYMBIOSIS_SIZE_RATIO: 2.0,
    ENDOSYMBIOSIS_MIN_GENERATIONS: 5,
    MITOCHONDRIA_BOOST: 1.5,
    CHLOROPLAST_BOOST: 1.8,
    
    // Colony formation
    COLONY_COOPERATION_THRESHOLD: 0.6,
    COLONY_RANGE: 40,
    COLONY_MIN_SIZE: 3,
    COLONY_MAX_SIZE: 12,
    COLONY_COHESION_FORCE: 0.015,
    
    // Cell differentiation
    DIFFERENTIATION_THRESHOLD: 0.4,
    DIFFERENTIATION_MIN_CELLS: 4,
    NERVOUS_SYSTEM_THRESHOLD: 8,
    
    // Speciation
    SPECIATION_THRESHOLD: 0.35,
    MIN_POPULATION_FOR_SPECIATION: 3,
    
    // Catastrophes
    CATASTROPHE_BASE_CHANCE: 0.00008,
    CATASTROPHE_MIN_INTERVAL: 3000,
    
    // Population limits
    MAX_PROKARYOTES: 40,
    MAX_EUKARYOTES: 20,
    MAX_COLONIES: 8,
} as const;

// Genome encoding regions (40 bases total)
export const GENOME_REGIONS = {
    METABOLISM: [0, 4] as const,
    SPEED: [4, 8] as const,
    SIZE: [8, 12] as const,
    PREDATORY: [12, 16] as const,
    DEFENSE: [16, 20] as const,
    COOPERATION: [20, 24] as const,
    PHOTOSYNTHETIC: [24, 28] as const,
    AEROBIC: [28, 32] as const,
    MATING_DISPLAY: [32, 36] as const,
    GENETIC_COMPAT: [36, 40] as const,
} as const;

// Species naming
export const SPECIES_PREFIXES = [
    'Proto', 'Arche', 'Neo', 'Paleo', 'Meta', 'Para', 'Pseudo', 'Eu', 'Micro', 'Macro',
    'Thermo', 'Hydro', 'Photo', 'Chemo', 'Cyano', 'Chloro', 'Rhodo', 'Chromo', 'Halo', 'Acido',
] as const;

export const SPECIES_ROOTS = [
    'bacillus', 'coccus', 'spirillum', 'vibrio', 'filum', 'plasma', 'monas', 'soma', 'zoon', 'phyta',
    'myces', 'thrix', 'nema', 'derma', 'plasma', 'plax', 'caulis', 'lobus', 'cladia', 'spora',
] as const;

export const SPECIES_SUFFIXES = [
    'ensis', 'oides', 'icus', 'alis', 'formis', 'philus', 'troph', 'genes', 'fer', 'cola',
    'vora', 'phaga', 'lyticus', 'plastus', 'chromus', 'dermus', 'cephalus', 'rhiza', 'morpha', 'genus',
] as const;

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
    cell_differentiation: '🔬 Cell Differentiation',
    multicellular: '🌿 Multicellular Life',
    sexual_reproduction: '💕 Sexual Reproduction',
    speciation: '🌳 Speciation',
    cambrian_explosion: '🦑 Cambrian Explosion',
};

export const PHASE_DESCRIPTIONS: Record<SimulationPhase, string> = {
    primordial_soup: 'Simple molecules drift in the ancient ocean',
    synthesis: 'Building blocks form from simple molecules',
    polymerization: 'Complex chains begin to emerge',
    self_assembly: 'Molecules organize into structures',
    proto_life: 'Primitive cell-like structures appear',
    luca_emergence: 'The Last Universal Common Ancestor is born!',
    early_life: 'First organisms begin to reproduce',
    diversification: 'Life forms adapt to different niches',
    predation_emerges: 'Organisms begin hunting each other',
    endosymbiosis: 'Cells engulf other cells symbiotically',
    eukaryotes: 'Complex cells with organelles emerge',
    colonial_life: 'Organisms form cooperative colonies',
    cell_differentiation: 'Cells specialize within colonies',
    multicellular: 'True multicellular organisms appear',
    sexual_reproduction: 'Genetic exchange accelerates evolution',
    speciation: 'Distinct species diverge',
    cambrian_explosion: 'Diversity explodes across the ecosystem',
};

// Molecule visual info with icons/symbols for rendering
export const MOLECULE_INFO: Record<MoleculeType, { 
    label: string; 
    color: string; 
    symbol: string;
    icon: string;
    glowColor: string;
}> = {
    water: { label: 'H₂O', color: '#60a5fa', symbol: 'W', icon: '💧', glowColor: 'rgba(96, 165, 250, 0.3)' },
    carbon: { label: 'C', color: '#78716c', symbol: 'C', icon: 'ite', glowColor: 'rgba(120, 113, 108, 0.3)' },
    nitrogen: { label: 'N₂', color: '#93c5fd', symbol: 'N', icon: '🔵', glowColor: 'rgba(147, 197, 253, 0.3)' },
    oxygen: { label: 'O₂', color: '#ef4444', symbol: 'O', icon: '🔴', glowColor: 'rgba(239, 68, 68, 0.3)' },
    amino_acid: { label: 'Amino Acid', color: '#ec4899', symbol: 'AA', icon: '🔷', glowColor: 'rgba(236, 72, 153, 0.4)' },
    nucleotide: { label: 'Nucleotide', color: '#8b5cf6', symbol: 'Nu', icon: '🟣', glowColor: 'rgba(139, 92, 246, 0.4)' },
    lipid: { label: 'Lipid', color: '#facc15', symbol: 'Li', icon: '🟡', glowColor: 'rgba(250, 204, 21, 0.4)' },
    sugar: { label: 'Sugar', color: '#86efac', symbol: 'Su', icon: '🟢', glowColor: 'rgba(134, 239, 172, 0.3)' },
    peptide: { label: 'Peptide', color: '#db2777', symbol: 'Pep', icon: '⛓️', glowColor: 'rgba(219, 39, 119, 0.5)' },
    rna_fragment: { label: 'RNA', color: '#7c3aed', symbol: 'RNA', icon: '🧬', glowColor: 'rgba(124, 58, 237, 0.5)' },
    membrane_vesicle: { label: 'Vesicle', color: '#f59e0b', symbol: 'Ves', icon: '🫧', glowColor: 'rgba(245, 158, 11, 0.5)' },
};

export const CELL_ROLE_INFO: Record<CellRole, { name: string; symbol: string; color: string; description: string }> = {
    stem: { name: 'Stem Cell', symbol: '◯', color: '#94a3b8', description: 'Undifferentiated cell' },
    sensor: { name: 'Sensor', symbol: '👁', color: '#60a5fa', description: 'Detects environment' },
    motor: { name: 'Motor', symbol: '⚡', color: '#f59e0b', description: 'Provides movement' },
    digestive: { name: 'Digestive', symbol: '🔥', color: '#22c55e', description: 'Processes nutrients' },
    reproductive: { name: 'Reproductive', symbol: '🧬', color: '#ec4899', description: 'Enables reproduction' },
    structural: { name: 'Structural', symbol: '🛡', color: '#6b7280', description: 'Provides support' },
    photosynthetic: { name: 'Photosynthetic', symbol: '☀', color: '#84cc16', description: 'Captures light energy' },
    nerve: { name: 'Nerve', symbol: '⚡', color: '#a855f7', description: 'Transmits signals' },
};

export const CATASTROPHE_CONFIG: Record<CatastropheType, CatastropheConfig> = {
    meteor_impact: {
        name: 'Meteor Impact',
        description: 'A massive asteroid strikes the ocean',
        icon: '☄️',
        minDuration: 400,
        maxDuration: 800,
        effects: { energyMultiplier: 0.3, deathChance: 0.15, mutationBoost: 3.0 },
    },
    volcanic_winter: {
        name: 'Volcanic Winter',
        description: 'Volcanic eruptions block sunlight',
        icon: '🌋',
        minDuration: 600,
        maxDuration: 1200,
        effects: { energyMultiplier: 0.5, deathChance: 0.08, mutationBoost: 1.5 },
    },
    oxygen_spike: {
        name: 'Great Oxygenation',
        description: 'Oxygen levels surge dramatically',
        icon: '💨',
        minDuration: 800,
        maxDuration: 1500,
        effects: { energyMultiplier: 1.2, deathChance: 0.1, mutationBoost: 2.0 },
    },
    ice_age: {
        name: 'Ice Age',
        description: 'Global temperatures plummet',
        icon: '❄️',
        minDuration: 1000,
        maxDuration: 2000,
        effects: { energyMultiplier: 0.4, deathChance: 0.12, mutationBoost: 1.3 },
    },
    toxic_bloom: {
        name: 'Toxic Bloom',
        description: 'Poisonous organisms spread',
        icon: '☠️',
        minDuration: 300,
        maxDuration: 600,
        effects: { energyMultiplier: 0.7, deathChance: 0.2, mutationBoost: 1.8 },
    },
    solar_flare: {
        name: 'Solar Flare',
        description: 'Intense radiation from the sun',
        icon: '☀️',
        minDuration: 200,
        maxDuration: 400,
        effects: { energyMultiplier: 0.8, deathChance: 0.05, mutationBoost: 4.0 },
    },
};

export const MILESTONES: Milestone[] = [
    { id: 'first_peptide', name: 'First Peptide', description: 'Amino acids bonded to form a peptide chain', icon: '⛓️', achieved: false, time: null },
    { id: 'first_rna', name: 'First RNA', description: 'Nucleotides formed an RNA fragment', icon: '🧬', achieved: false, time: null },
    { id: 'first_protocell', name: 'First Protocell', description: 'A membrane-bound structure emerged', icon: '🫧', achieved: false, time: null },
    { id: 'luca', name: 'LUCA Emerges', description: 'The Last Universal Common Ancestor is born', icon: '⭐', achieved: false, time: null },
    { id: 'first_predator', name: 'First Predator', description: 'An organism consumed another', icon: '🦠', achieved: false, time: null },
    { id: 'endosymbiosis', name: 'Endosymbiosis', description: 'A cell engulfed another symbiotically', icon: '🔬', achieved: false, time: null },
    { id: 'first_eukaryote', name: 'First Eukaryote', description: 'A complex cell with organelles emerged', icon: '🧫', achieved: false, time: null },
    { id: 'sexual_reproduction', name: 'Sexual Reproduction', description: 'Organisms exchange genetic material', icon: '💕', achieved: false, time: null },
    { id: 'first_colony', name: 'First Colony', description: 'Organisms formed a cooperative group', icon: '🔗', achieved: false, time: null },
    { id: 'cell_specialization', name: 'Cell Specialization', description: 'Cells began differentiating roles', icon: '🔬', achieved: false, time: null },
    { id: 'nervous_system', name: 'Nervous System', description: 'Neural cells coordinate the colony', icon: '⚡', achieved: false, time: null },
    { id: 'multicellular', name: 'Multicellular Life', description: 'True multicellular organisms appear', icon: '🌿', achieved: false, time: null },
    { id: 'first_species', name: 'First Speciation', description: 'A new species diverged', icon: '🌳', achieved: false, time: null },
    { id: 'ten_species', name: 'Biodiversity', description: '10 species coexist', icon: '🌍', achieved: false, time: null },
    { id: 'mass_extinction', name: 'Mass Extinction', description: 'A catastrophe reshapes life', icon: '💀', achieved: false, time: null },
];

// Visual rendering constants
export const RENDER = {
    // Molecule rendering
    SHOW_MOLECULE_SYMBOLS: true,
    MOLECULE_SYMBOL_MIN_ZOOM: 0.8,
    MOLECULE_GLOW_INTENSITY: 0.4,
    
    // Bond rendering
    BOND_COVALENT_WIDTH: 2,
    BOND_HYDROGEN_WIDTH: 1,
    BOND_HYDROPHOBIC_WIDTH: 1.5,
    
    // Flow visualization (Coriolis effect)
    SHOW_FLOW_PARTICLES: true,
    FLOW_PARTICLE_COUNT: 60,
    FLOW_PARTICLE_SPEED: 0.3,
    
    // Energy field
    SHOW_ENERGY_FIELD: true,
    ENERGY_FIELD_OPACITY: 0.15,
} as const;