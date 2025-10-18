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
    molecules: number[];
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
    | 'diversification';

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

export const INITIAL_COUNTS: Record<string, number> = {
    water: 600,
    carbon: 240,
    nitrogen: 180,
    oxygen: 180,
    amino_acid: 120,
    nucleotide: 150,
    lipid: 180,
    sugar: 90,
};

export const MOLECULE_SPEED = 0.35;
export const COLLISION_DISTANCE = 10;
export const UPDATE_INTERVAL = 100;

export const BOND_PROBABILITIES = {
    amino_acid_to_peptide: 0.05,
    nucleotide_to_rna: 0.06,
    lipid_to_membrane: 0.08,
    simple_to_building_block: 0.04,
    vent_multiplier: 5.0,
    rock_multiplier: 4.0,
} as const;

export const PEPTIDE_SIZE_FOR_METABOLISM = 3;
export const RNA_SIZE_FOR_REPLICATION = 5;
export const LIPID_COUNT_FOR_MEMBRANE = 6;
export const PROTOCELL_STABILITY_FOR_LUCA = 75;

export const PHASE_LABELS: Record<SimulationPhase, string> = {
    primordial_soup: 'Primordial Soup',
    synthesis: 'Molecular Synthesis',
    polymerization: 'Polymerization',
    self_assembly: 'Self-Assembly',
    proto_life: 'Protocell Formation',
    luca_emergence: '⭐ LUCA Has Emerged!',
    early_life: 'Early Life',
    diversification: 'Diversification & Evolution',
};