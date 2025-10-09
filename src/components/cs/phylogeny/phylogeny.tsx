import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Droplets, Sparkles, Dna, Zap } from 'lucide-react';

// ==================== TYPES ====================

interface BaseEntity {
    id: number;
    x: number;
    y: number;
    energy: number;
    radius: number;
}

interface PhysicalEntity extends BaseEntity {
    vx: number;
    vy: number;
    mass: number;
}

type MoleculeType =
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

interface MolecularEntity extends PhysicalEntity {
    type: MoleculeType;
    symbol: string;
    color: string;
    bonded: boolean;
    bondedTo: Set<number>;
    complexity: number;
}

interface ProtoLifeEntity extends BaseEntity {
    molecules: number[];
    rnaSequence: string;
    hasMembrane: boolean;
    hasMetabolism: boolean;
    canReplicate: boolean;
    stability: number;
    age: number;
}

interface OrganismTraits {
    metabolicEfficiency: number;
    speed: number;
    size: number;
    color: string;
}

interface LivingEntity extends PhysicalEntity {
    generation: number;
    genome: string;
    birthTime: number;
    isAlive: boolean;
    canMove: boolean;
    parent: number | null;
    children: number[];
    traits: OrganismTraits;
}

interface Bond {
    mol1: number;
    mol2: number;
    strength: number;
    type: 'covalent' | 'hydrogen' | 'hydrophobic';
    restLength: number;
    k?: number;
}

type SimulationPhase =
    | 'primordial_soup'
    | 'synthesis'
    | 'polymerization'
    | 'self_assembly'
    | 'proto_life'
    | 'luca_emergence'
    | 'early_life'
    | 'diversification';

interface PhylogenySimProps {
    isRunning?: boolean;
    speed?: number;
}

// ==================== CONSTANTS ====================

const COLORS = {
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
};

const RNA_BASES = ['A', 'U', 'C', 'G'] as const;
const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L', 'K', 'M'];
const RNA_LENGTH = 24;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;

const INITIAL_COUNTS = {
    water: 600,
    carbon: 240,
    nitrogen: 180,
    oxygen: 180,
    amino_acid: 120,
    nucleotide: 150,
    lipid: 180,
    sugar: 90,
};

const MOLECULE_SPEED = 0.35;
const COLLISION_DISTANCE = 10;
const UPDATE_INTERVAL = 100;

const BOND_PROBABILITIES = {
    amino_acid_to_peptide: 0.05,
    nucleotide_to_rna: 0.06,
    lipid_to_membrane: 0.08,
    simple_to_building_block: 0.04,
    vent_multiplier: 5.0,
    rock_multiplier: 4.0,
};

const PEPTIDE_SIZE_FOR_METABOLISM = 3;
const RNA_SIZE_FOR_REPLICATION = 5;
const LIPID_COUNT_FOR_MEMBRANE = 6;
const PROTOCELL_STABILITY_FOR_LUCA = 75;

// ==================== HELPER FUNCTIONS ====================

function generateRNA(length: number): string {
    return Array.from({ length }, () => RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)]).join('');
}

function mutateRNA(rna: string, rate: number) {
    const newRNA = rna
        .split('')
        .map((base) => {
            if (Math.random() < rate) {
                return RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)];
            }
            return base;
        })
        .join('');
    return { newRNA };
}

function hashGenome(genome: string): number {
    let hash = 0;
    for (let i = 0; i < genome.length; i++) {
        hash = ((hash << 5) - hash) + genome.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function genomeToTraits(genome: string): OrganismTraits {
    const hash = hashGenome(genome);
    const h1 = (hash & 0xFF) / 255;
    const h2 = ((hash >> 8) & 0xFF) / 255;
    const h3 = ((hash >> 16) & 0xFF) / 255;

    const hue = h1 * 360;
    const saturation = 60 + h2 * 30;
    const lightness = 45 + h3 * 20;

    return {
        metabolicEfficiency: 0.7 + h1 * 0.6,
        speed: 0.15 + h2 * 0.15,
        size: 12 + h3 * 8,
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    };
}

function randomPosition(width: number, height: number, padding: number = 40) {
    return {
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
    };
}

function randomVelocity(maxSpeed: number = MOLECULE_SPEED) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * maxSpeed;
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

function wrapDelta(delta: number, size: number) {
    const half = size / 2;
    if (delta > half) return delta - size;
    if (delta < -half) return delta + size;
    return delta;
}

function toroidalDistance(x1: number, y1: number, x2: number, y2: number, w: number, h: number) {
    const dx = wrapDelta(x2 - x1, w);
    const dy = wrapDelta(y2 - y1, h);
    return Math.sqrt(dx * dx + dy * dy);
}

function averageToroidalPosition(positions: { x: number; y: number }[], w: number, h: number) {
    if (positions.length === 0) return { x: 0, y: 0 };
    const ref = positions[0];
    let sumX = 0;
    let sumY = 0;

    for (const pos of positions) {
        const dx = wrapDelta(pos.x - ref.x, w);
        const dy = wrapDelta(pos.y - ref.y, h);
        sumX += dx;
        sumY += dy;
    }

    let avgX = ref.x + sumX / positions.length;
    let avgY = ref.y + sumY / positions.length;

    avgX = ((avgX % w) + w) % w;
    avgY = ((avgY % h) + h) % h;

    return { x: avgX, y: avgY };
}

function wrapPosition(x: number, y: number, w: number, h: number) {
    return {
        x: ((x % w) + w) % w,
        y: ((y % h) + h) % h,
    };
}

function getComplexity(type: MoleculeType): number {
    if (['water', 'carbon', 'nitrogen', 'oxygen'].includes(type)) return 1;
    if (['amino_acid', 'nucleotide', 'lipid', 'sugar'].includes(type)) return 2;
    return 3;
}

// ==================== WORLD CLASS ====================

interface HydrothermalVent {
    x: number;
    y: number;
    strength: number;
    phase: number;
}

interface Rock {
    x: number;
    y: number;
    radius: number;
    roughness: number;
    type: 'chimney' | 'boulder' | 'ridge';
}

class PrimordialWorld {
    width: number;
    height: number;
    time: number = 0;
    phase: SimulationPhase = 'primordial_soup';
    energyField: number[][];
    temperature: number = 85;
    vents: HydrothermalVent[] = [];
    rocks: Rock[] = [];
    rotationSpeed: number = 0.0008;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.energyField = Array(24)
            .fill(0)
            .map(() => Array(40).fill(70 + Math.random() * 30));

        this.vents = [
            { x: w * 0.25, y: h * 0.35, strength: 1.3, phase: 0 },
            { x: w * 0.68, y: h * 0.55, strength: 1.1, phase: Math.PI },
            { x: w * 0.48, y: h * 0.75, strength: 1.2, phase: Math.PI * 0.5 },
        ];

        this.createVentTopology();
    }

    createVentTopology() {
        for (const vent of this.vents) {
            const chimneyRings = 3;
            for (let ring = 0; ring < chimneyRings; ring++) {
                const ringRadius = 20 + ring * 15;
                const rocksInRing = 8 + ring * 4;

                for (let i = 0; i < rocksInRing; i++) {
                    const angle = (i / rocksInRing) * Math.PI * 2;
                    const wobble = (Math.random() - 0.5) * 10;
                    const rx = vent.x + Math.cos(angle) * (ringRadius + wobble);
                    const ry = vent.y + Math.sin(angle) * (ringRadius + wobble);

                    this.rocks.push({
                        x: ((rx % this.width) + this.width) % this.width,
                        y: ((ry % this.height) + this.height) % this.height,
                        radius: 8 + Math.random() * 8 - ring * 2,
                        roughness: 0.7 + Math.random() * 0.3,
                        type: 'chimney',
                    });
                }
            }

            const channels = 3;
            for (let i = 0; i < channels; i++) {
                const angle = (i / channels) * Math.PI * 2 + Math.random() * 0.5;
                const channelLength = 80 + Math.random() * 60;
                const rocksInChannel = 5 + Math.floor(Math.random() * 6);

                for (let j = 0; j < rocksInChannel; j++) {
                    const dist = 60 + (j / rocksInChannel) * channelLength;
                    const perpOffset = (Math.random() - 0.5) * 25;
                    const rx = vent.x + Math.cos(angle) * dist + Math.sin(angle) * perpOffset;
                    const ry = vent.y + Math.sin(angle) * dist - Math.cos(angle) * perpOffset;

                    this.rocks.push({
                        x: ((rx % this.width) + this.width) % this.width,
                        y: ((ry % this.height) + this.height) % this.height,
                        radius: 12 + Math.random() * 15,
                        roughness: 0.5 + Math.random() * 0.5,
                        type: 'ridge',
                    });
                }
            }

            const boulders = 4 + Math.floor(Math.random() * 4);
            for (let i = 0; i < boulders; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 100 + Math.random() * 120;
                const rx = vent.x + Math.cos(angle) * dist;
                const ry = vent.y + Math.sin(angle) * dist;

                this.rocks.push({
                    x: ((rx % this.width) + this.width) % this.width,
                    y: ((ry % this.height) + this.height) % this.height,
                    radius: 15 + Math.random() * 20,
                    roughness: 0.4 + Math.random() * 0.4,
                    type: 'boulder',
                });
            }
        }
    }

    isNearVent(x: number, y: number, radius: number = 100): { near: boolean; distance: number; vent?: HydrothermalVent } {
        for (const vent of this.vents) {
            const dist = toroidalDistance(x, y, vent.x, vent.y, this.width, this.height);
            if (dist < radius) {
                return { near: true, distance: dist, vent };
            }
        }
        return { near: false, distance: Infinity };
    }

    isNearRock(x: number, y: number, radius: number = 30): { near: boolean; distance: number; rock?: Rock } {
        for (const rock of this.rocks) {
            const dist = toroidalDistance(x, y, rock.x, rock.y, this.width, this.height);
            if (dist < rock.radius + radius) {
                return { near: true, distance: dist, rock };
            }
        }
        return { near: false, distance: Infinity };
    }

    getCatalyticBonus(x: number, y: number): number {
        let multiplier = 1.0;

        const ventCheck = this.isNearVent(x, y, 100);
        if (ventCheck.near) {
            const ventFactor = 1 - (ventCheck.distance / 100);
            multiplier *= (1 + BOND_PROBABILITIES.vent_multiplier * ventFactor);
        }

        const rockCheck = this.isNearRock(x, y, 25);
        if (rockCheck.near && rockCheck.rock) {
            const rockFactor = Math.max(0, 1 - (rockCheck.distance - rockCheck.rock.radius) / 25);
            multiplier *= (1 + BOND_PROBABILITIES.rock_multiplier * rockFactor * rockCheck.rock.roughness);
        }

        return multiplier;
    }

    checkRockCollision(x: number, y: number, radius: number): Rock | null {
        for (const rock of this.rocks) {
            const dist = toroidalDistance(x, y, rock.x, rock.y, this.width, this.height);
            if (dist < rock.radius + radius) {
                return rock;
            }
        }
        return null;
    }

    getEnergyAt(x: number, y: number): number {
        const col = Math.floor(x / 30);
        const row = Math.floor(y / 30);
        return this.energyField[row]?.[col] || 0;
    }

    consumeEnergyAt(x: number, y: number, amount: number): number {
        const col = Math.floor(x / 30);
        const row = Math.floor(y / 30);
        if (this.energyField[row]?.[col] !== undefined) {
            const available = this.energyField[row][col];
            const consumed = Math.min(available, amount);
            this.energyField[row][col] -= consumed;
            return consumed;
        }
        return 0;
    }

    getFlowAt(x: number, y: number): { fx: number; fy: number } {
        let fx = 0;
        let fy = 0;

        const cx = this.width / 2;
        const cy = this.height / 2;
        const dxC = wrapDelta(x - cx, this.width);
        const dyC = wrapDelta(y - cy, this.height);
        const rDist = Math.sqrt(dxC * dxC + dyC * dyC) + 0.0001;
        const rotStrength = this.rotationSpeed * (1 + rDist / Math.max(this.width, this.height));
        fx += -rotStrength * dyC;
        fy += rotStrength * dxC;

        for (const vent of this.vents) {
            const dx = wrapDelta(x - vent.x, this.width);
            const dy = wrapDelta(y - vent.y, this.height);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) continue;

            const maxRadius = 200;
            if (dist > maxRadius) continue;

            const pulse = Math.sin(this.time * 0.05 + vent.phase) * 0.25 + 0.75;

            const radialStrength = (1 - dist / maxRadius) * vent.strength * pulse * 0.8;
            const angle = Math.atan2(dy, dx);
            fx += Math.cos(angle) * radialStrength;
            fy += Math.sin(angle) * radialStrength;

            const circularStrength = Math.sin((dist / maxRadius) * Math.PI) * vent.strength * 0.15;
            fx += -Math.sin(angle) * circularStrength;
            fy += Math.cos(angle) * circularStrength;
        }

        for (const rock of this.rocks) {
            const dxR = wrapDelta(x - rock.x, this.width);
            const dyR = wrapDelta(y - rock.y, this.height);
            const r = Math.sqrt(dxR * dxR + dyR * dyR);

            if (r < rock.radius + 5) {
                const push = 1.2 * (1 - (r - rock.radius) / 5);
                const ang = Math.atan2(dyR, dxR);
                fx += Math.cos(ang) * push;
                fy += Math.sin(ang) * push;
            } else if (r < rock.radius + 40) {
                const eddyStrength = 0.5 * rock.roughness * (1 - (r - rock.radius) / 40);
                const ang = Math.atan2(dyR, dxR);

                fx += -Math.sin(ang) * eddyStrength;
                fy += Math.cos(ang) * eddyStrength;

                const attraction = eddyStrength * 0.2;
                fx -= Math.cos(ang) * attraction;
                fy -= Math.sin(ang) * attraction;
            }
        }

        return { fx, fy };
    }

    update() {
        this.time++;

        if (this.temperature > 40) {
            this.temperature *= 0.9995;
        }

        if (this.time % 40 === 0) {
            for (let y = 0; y < this.energyField.length; y++) {
                for (let x = 0; x < this.energyField[y].length; x++) {
                    let energy = this.energyField[y][x];

                    for (const vent of this.vents) {
                        const cellX = x * 30 + 15;
                        const cellY = y * 30 + 15;
                        const dist = toroidalDistance(cellX, cellY, vent.x, vent.y, this.width, this.height);
                        if (dist < 150) {
                            const bonus = (1 - dist / 150) * 10 * vent.strength;
                            energy += bonus;
                        }
                    }

                    this.energyField[y][x] = Math.min(100, energy + 3);
                }
            }
        }
    }
}

// ==================== MOLECULE CLASS ====================

class Molecule implements MolecularEntity {
    id: number;
    type: MoleculeType;
    symbol: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    energy: number;
    mass: number;
    color: string;
    radius: number;
    bonded = false;
    bondedTo: Set<number> = new Set();
    complexity: number;

    constructor(id: number, type: MoleculeType, world: PrimordialWorld) {
        this.id = id;
        this.type = type;
        this.complexity = getComplexity(type);

        if (type === 'nucleotide') {
            this.symbol = RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)];
        } else if (type === 'amino_acid') {
            this.symbol = AMINO_ACIDS[Math.floor(Math.random() * AMINO_ACIDS.length)];
        } else if (type === 'peptide') {
            this.symbol = 'PEP';
        } else if (type === 'rna_fragment') {
            this.symbol = 'RNA';
        } else if (type === 'membrane_vesicle') {
            this.symbol = 'MEM';
        } else {
            this.symbol = type.charAt(0).toUpperCase();
        }

        let attempts = 0;
        let pos;
        this.radius = 2 + this.complexity;

        do {
            pos = randomPosition(world.width, world.height);
            attempts++;
        } while (world.checkRockCollision(pos.x, pos.y, this.radius + 2) && attempts < 20);

        const vel = randomVelocity();
        this.x = pos.x;
        this.y = pos.y;
        this.vx = vel.vx;
        this.vy = vel.vy;
        this.energy = 50;
        this.mass = this.complexity;
        this.color = (COLORS as any)[type] || COLORS.water;
    }

    update(world: PrimordialWorld) {
        const movementReduction = Math.min(this.bondedTo.size * 0.15, 0.7);

        const flow = world.getFlowAt(this.x, this.y);
        this.vx += flow.fx * 0.1;
        this.vy += flow.fy * 0.1;

        if (this.complexity >= 2) {
            const rockCheck = world.isNearRock(this.x, this.y, 35);
            if (rockCheck.near && rockCheck.rock) {
                const distFromSurface = rockCheck.distance - rockCheck.rock.radius;
                if (distFromSurface > 0 && distFromSurface < 35) {
                    const dx = wrapDelta(rockCheck.rock.x - this.x, world.width);
                    const dy = wrapDelta(rockCheck.rock.y - this.y, world.height);
                    const dist = rockCheck.distance;
                    const attraction = 0.025 * (1 - distFromSurface / 35) * rockCheck.rock.roughness;
                    this.vx += (dx / dist) * attraction;
                    this.vy += (dy / dist) * attraction;
                }
            }
        }

        const newX = this.x + this.vx * (1 - movementReduction);
        const newY = this.y + this.vy * (1 - movementReduction);

        const collision = world.checkRockCollision(newX, newY, this.radius);

        if (collision) {
            const dx = wrapDelta(this.x - collision.x, world.width);
            const dy = wrapDelta(this.y - collision.y, world.height);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.001) {
                const nx = dx / dist;
                const ny = dy / dist;

                const dot = this.vx * nx + this.vy * ny;
                this.vx = this.vx - 2 * dot * nx;
                this.vy = this.vy - 2 * dot * ny;

                this.vx *= 0.6;
                this.vy *= 0.6;

                const pushDist = collision.radius + this.radius + 1;
                this.x = collision.x + nx * pushDist;
                this.y = collision.y + ny * pushDist;
            }
        } else {
            this.x = newX;
            this.y = newY;
        }

        const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
        this.x = wrapped.x;
        this.y = wrapped.y;

        this.vx *= 0.995;
        this.vy *= 0.995;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        // Glow effect for complex molecules
        if (this.complexity >= 2 && this.bondedTo.size > 0) {
            const glowPulse = Math.sin(time * 0.03 + this.id * 0.5) * 0.2 + 0.8;
            ctx.fillStyle = `${this.color}40`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2.2 * glowPulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // Main molecule body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight for 3D effect
        if (this.complexity >= 2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Symbol for complex molecules
        if (this.complexity === 3) {
            ctx.fillStyle = COLORS.text;
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, this.x, this.y);
        }
    }
}

// ==================== PROTOCELL CLASS ====================

class ProtoCell implements ProtoLifeEntity {
    id: number;
    molecules: number[];
    rnaSequence: string = '';
    hasMembrane: boolean = false;
    hasMetabolism: boolean = false;
    canReplicate: boolean = false;
    x: number;
    y: number;
    energy: number;
    radius = 28;
    stability: number = 0;
    age = 0;
    peptideCount = 0;
    rnaCount = 0;
    lipidCount = 0;

    constructor(id: number, mols: number[], x: number, y: number) {
        this.id = id;
        this.molecules = mols;
        this.x = x;
        this.y = y;
        this.energy = 100;
    }

    update(world: PrimordialWorld, moleculeMap: Map<number, Molecule>) {
        this.age++;

        const mols = this.molecules.map((id) => moleculeMap.get(id)).filter((m) => m) as Molecule[];
        if (mols.length > 0) {
            const positions = mols.map((m) => ({ x: m.x, y: m.y }));
            const avg = averageToroidalPosition(positions, world.width, world.height);
            this.x = avg.x;
            this.y = avg.y;
        }

        this.peptideCount = mols.filter((m) => m.type === 'peptide').length;
        this.rnaCount = mols.filter((m) => m.type === 'rna_fragment').length;
        this.lipidCount = mols.filter((m) => m.type === 'lipid' || m.type === 'membrane_vesicle').length;

        this.hasMembrane = this.lipidCount >= LIPID_COUNT_FOR_MEMBRANE;
        this.hasMetabolism = this.peptideCount >= PEPTIDE_SIZE_FOR_METABOLISM;
        this.canReplicate = this.rnaCount >= RNA_SIZE_FOR_REPLICATION;

        const rnaMols = mols.filter((m) => m.type === 'nucleotide' || m.type === 'rna_fragment');
        this.rnaSequence = rnaMols.map((m) => m.symbol).join('');

        let baseStability = 20;
        if (this.hasMembrane) baseStability += 30;
        if (this.hasMetabolism) baseStability += 25;
        if (this.canReplicate) baseStability += 25;

        this.stability = Math.min(100, baseStability + this.age * 0.1);
        this.energy += world.consumeEnergyAt(this.x, this.y, this.hasMetabolism ? 2 : 1);
    }

    canBecomeLUCA(): boolean {
        return (
            this.hasMembrane &&
            this.hasMetabolism &&
            this.canReplicate &&
            this.stability >= PROTOCELL_STABILITY_FOR_LUCA
        );
    }

    emergeLUCA(world: PrimordialWorld): LUCAEntity {
        let genome = this.rnaSequence;
        if (genome.length < RNA_LENGTH) genome += generateRNA(RNA_LENGTH - genome.length);
        else genome = genome.slice(0, RNA_LENGTH);
        return new LUCAEntity(this.id, this.x, this.y, genome, world.time);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const pulse = Math.sin(this.age * 0.04) * 0.15 + 0.85;

        // Outer glow
        ctx.fillStyle = `${COLORS.proto}20`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        if (this.hasMembrane) {
            // Solid membrane
            ctx.strokeStyle = COLORS.membrane_vesicle;
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Inner fill
            ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Dashed membrane (incomplete)
            ctx.strokeStyle = COLORS.proto;
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }

        // Labels
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        let y = this.y - this.radius - 18;

        if (this.hasMembrane) {
            ctx.fillStyle = COLORS.membrane_vesicle;
            ctx.fillText('🧫 Membrane', this.x, y);
            y += 11;
        }
        if (this.hasMetabolism) {
            ctx.fillStyle = COLORS.peptide;
            ctx.fillText('⚡ Metabolism', this.x, y);
            y += 11;
        }
        if (this.canReplicate) {
            ctx.fillStyle = COLORS.rna_fragment;
            ctx.fillText('🧬 Replication', this.x, y);
        }

        // Stability bar
        const pct = this.stability / 100;
        const barW = 40;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - barW / 2, this.y + this.radius + 10, barW, 4);

        const stabilityColor = this.canBecomeLUCA() ? COLORS.luca : COLORS.proto;
        ctx.fillStyle = stabilityColor;
        ctx.fillRect(this.x - barW / 2, this.y + this.radius + 10, barW * pct, 4);
    }
}

// ==================== LUCA & ORGANISM ====================

class LUCAEntity implements LivingEntity {
    id: number;
    x: number;
    y: number;
    vx = 0;
    vy = 0;
    energy = 120;
    mass = 8;
    radius = 32;
    generation = 0;
    genome: string;
    birthTime: number;
    isAlive = true;
    parent = null;
    children: number[] = [];
    canMove = false;
    lastReproduction = 0;
    traits: OrganismTraits;

    constructor(id: number, x: number, y: number, rna: string, birthTime: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.genome = rna;
        this.birthTime = birthTime;
        this.lastReproduction = birthTime;
        this.traits = {
            metabolicEfficiency: 1.0,
            speed: 0.2,
            size: 32,
            color: COLORS.luca,
        };
    }

    update(world: PrimordialWorld) {
        if (!this.isAlive) return;

        this.energy += world.consumeEnergyAt(this.x, this.y, 3);
        this.energy -= 0.05;

        if (this.energy <= 0) this.isAlive = false;

        if (this.energy > 80 && !this.canMove) {
            this.canMove = true;
            const vel = randomVelocity(0.12);
            this.vx = vel.vx;
            this.vy = vel.vy;
        }

        if (this.canMove) {
            const newX = this.x + this.vx;
            const newY = this.y + this.vy;

            const collision = world.checkRockCollision(newX, newY, this.radius);
            if (collision) {
                const dx = wrapDelta(this.x - collision.x, world.width);
                const dy = wrapDelta(this.y - collision.y, world.height);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0.001) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const dot = this.vx * nx + this.vy * ny;
                    this.vx = this.vx - 2 * dot * nx;
                    this.vy = this.vy - 2 * dot * ny;
                    this.vx *= 0.7;
                    this.vy *= 0.7;
                }
            } else {
                this.x = newX;
                this.y = newY;
            }

            this.vx *= 0.98;
            this.vy *= 0.98;

            const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
            this.x = wrapped.x;
            this.y = wrapped.y;
        }
    }

    canReproduce(world: PrimordialWorld): boolean {
        return this.energy >= 80 && world.time - this.lastReproduction >= 350;
    }

    reproduce(childId: number, world: PrimordialWorld): OrganismEntity {
        const { newRNA } = mutateRNA(this.genome, 0.02);
        const angle = Math.random() * Math.PI * 2;
        const dist = 45;
        const offspring = new OrganismEntity(
            childId,
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            1,
            this.id,
            newRNA,
            world.time
        );
        this.children.push(childId);
        this.energy -= 35;
        this.lastReproduction = world.time;
        return offspring;
    }

    draw(ctx: CanvasRenderingContext2D, time: number) {
        const pulse = Math.sin(time * 0.03) * 0.25 + 0.75;

        // Massive outer glow
        const gradient1 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
        gradient1.addColorStop(0, `${COLORS.luca}30`);
        gradient1.addColorStop(0.5, `${COLORS.luca}15`);
        gradient1.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Middle glow
        const gradient2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 1.8);
        gradient2.addColorStop(0, `${COLORS.luca}60`);
        gradient2.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = COLORS.luca;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bright outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Rotating particles
        for (let i = 0; i < 8; i++) {
            const angle = (time * 0.02 + i * Math.PI / 4);
            const px = this.x + Math.cos(angle) * (this.radius + 12);
            const py = this.y + Math.sin(angle) * (this.radius + 12);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // LUCA label
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText('LUCA', this.x, this.y - this.radius - 18);
        ctx.fillText('LUCA', this.x, this.y - this.radius - 18);

        ctx.font = '10px system-ui';
        ctx.fillStyle = COLORS.textMuted;
        ctx.fillText('Last Universal Common Ancestor', this.x, this.y - this.radius - 6);
    }
}

class OrganismEntity implements LivingEntity {
    id: number;
    name: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    energy = 80;
    mass = 3;
    radius = 15;
    generation: number;
    genome: string;
    birthTime: number;
    isAlive = true;
    parent: number | null;
    children: number[] = [];
    canMove = true;
    lastReproduction: number;
    traits: OrganismTraits;

    constructor(id: number, x: number, y: number, gen: number, parent: number | null, rna: string, birthTime: number) {
        this.id = id;
        this.name = String.fromCharCode(65 + (id % 26));
        this.x = x;
        this.y = y;
        this.generation = gen;
        this.genome = rna;
        this.parent = parent;
        this.birthTime = birthTime;
        this.lastReproduction = birthTime;
        this.traits = genomeToTraits(rna);
        this.radius = this.traits.size;
        const vel = randomVelocity(this.traits.speed);
        this.vx = vel.vx;
        this.vy = vel.vy;
    }

    update(world: PrimordialWorld) {
        if (!this.isAlive) return;

        this.energy += world.consumeEnergyAt(this.x, this.y, 1.8 * this.traits.metabolicEfficiency);

        if (this.canMove) {
            const newX = this.x + this.vx;
            const newY = this.y + this.vy;

            const collision = world.checkRockCollision(newX, newY, this.radius);
            if (collision) {
                const dx = wrapDelta(this.x - collision.x, world.width);
                const dy = wrapDelta(this.y - collision.y, world.height);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0.001) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const dot = this.vx * nx + this.vy * ny;
                    this.vx = this.vx - 2 * dot * nx;
                    this.vy = this.vy - 2 * dot * ny;
                    this.vx *= 0.7;
                    this.vy *= 0.7;
                }
            } else {
                this.x = newX;
                this.y = newY;
            }

            this.vx *= 0.98;
            this.vy *= 0.98;

            const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
            this.x = wrapped.x;
            this.y = wrapped.y;
        }

        this.energy -= 0.1 * (this.traits.size / 15) * (this.traits.speed / 0.2);
        if (this.energy <= 0) {
            this.isAlive = false;
            this.canMove = false;
        }
    }

    canReproduce(world: PrimordialWorld): boolean {
        return this.energy >= 70 && world.time - this.lastReproduction >= 350;
    }

    reproduce(childId: number, world: PrimordialWorld): OrganismEntity {
        const { newRNA } = mutateRNA(this.genome, 0.025);
        const angle = Math.random() * Math.PI * 2;
        const dist = this.radius + 20;
        const offspring = new OrganismEntity(
            childId,
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            this.generation + 1,
            this.id,
            newRNA,
            world.time
        );
        this.children.push(childId);
        this.energy -= 30;
        this.lastReproduction = world.time;
        return offspring;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.isAlive) {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.25)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Glow based on energy
        const glowAlpha = Math.min(0.4, this.energy / 200);
        ctx.fillStyle = `${this.traits.color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = this.traits.color;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = COLORS.text;
        ctx.font = `${Math.max(9, this.radius * 0.6)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(this.name, this.x, this.y - this.radius - 6);
        ctx.fillText(this.name, this.x, this.y - this.radius - 6);

        // Generation indicator
        ctx.font = '7px system-ui';
        ctx.fillStyle = COLORS.textMuted;
        ctx.fillText(`Gen ${this.generation}`, this.x, this.y + this.radius + 10);
    }
}

// ==================== SIMULATION ENGINE ====================

class SimulationEngine {
    world: PrimordialWorld;
    molecules: Molecule[] = [];
    bonds: Bond[] = [];
    protoCells: ProtoCell[] = [];
    luca: LUCAEntity | null = null;
    organisms: OrganismEntity[] = [];
    nextId = 0;
    lucaBorn = false;
    moleculeMap: Map<number, Molecule> = new Map();
    bondSpringK: number = 0.02;
    bondBreakProbability: number = 0.012;
    totalBorn = 0;
    maxGeneration = 0;

    constructor() {
        this.world = new PrimordialWorld(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.initMolecules();
    }

    initMolecules() {
        for (const [type, count] of Object.entries(INITIAL_COUNTS)) {
            for (let i = 0; i < count; i++) {
                const mol = new Molecule(this.nextId++, type as MoleculeType, this.world);
                this.molecules.push(mol);
                this.moleculeMap.set(mol.id, mol);
            }
        }
    }

    applyBondForces() {
        if (this.bonds.length === 0) return;

        const maxForce = 0.6;
        const breakThreshold = 3.0;

        for (let i = this.bonds.length - 1; i >= 0; i--) {
            const b = this.bonds[i];
            const m1 = this.moleculeMap.get(b.mol1);
            const m2 = this.moleculeMap.get(b.mol2);
            if (!m1 || !m2) continue;

            const dx = wrapDelta(m2.x - m1.x, this.world.width);
            const dy = wrapDelta(m2.y - m1.y, this.world.height);
            const dist = Math.sqrt(dx * dx + dy * dy) + 1e-6;
            const rest = b.restLength || Math.max(4, dist);
            const k = b.k ?? this.bondSpringK;

            if (dist > rest * breakThreshold) {
                if (Math.random() < this.bondBreakProbability) {
                    this.breakBond(b);
                    continue;
                }
            }

            const fs = -k * (dist - rest);
            const fclamped = Math.max(-maxForce, Math.min(maxForce, fs));
            const ux = dx / dist;
            const uy = dy / dist;

            const invMass1 = 1 / Math.max(1, m1.mass);
            const invMass2 = 1 / Math.max(1, m2.mass);
            const totalInv = invMass1 + invMass2;
            const a1 = (fclamped * invMass1) / totalInv;
            const a2 = -(fclamped * invMass2) / totalInv;

            m1.vx += ux * a1;
            m1.vy += uy * a1;
            m2.vx += ux * a2;
            m2.vy += uy * a2;

            m1.vx *= 0.999;
            m1.vy *= 0.999;
            m2.vx *= 0.999;
            m2.vy *= 0.999;
        }
    }

    breakBond(bond: Bond) {
        this.bonds = this.bonds.filter((b) => b !== bond);

        for (const mol of this.moleculeMap.values()) {
            mol.bondedTo.clear();
            mol.bonded = false;
        }

        for (const b of this.bonds) {
            const m1 = this.moleculeMap.get(b.mol1);
            const m2 = this.moleculeMap.get(b.mol2);
            if (m1 && m2) {
                m1.bondedTo.add(m2.id);
                m2.bondedTo.add(m1.id);
                m1.bonded = true;
                m2.bonded = true;
            }
        }
    }

    checkChemistry() {
        for (let i = 0; i < this.molecules.length; i++) {
            for (let j = i + 1; j < this.molecules.length; j++) {
                const mol1 = this.molecules[i];
                const mol2 = this.molecules[j];

                if (mol1.bondedTo.has(mol2.id)) continue;

                const dist = toroidalDistance(mol1.x, mol1.y, mol2.x, mol2.y, this.world.width, this.world.height);

                if (dist < COLLISION_DISTANCE) {
                    this.tryReaction(mol1, mol2);
                }
            }
        }
    }

    tryReaction(mol1: Molecule, mol2: Molecule) {
        const avgX = (mol1.x + mol2.x) / 2;
        const avgY = (mol1.y + mol2.y) / 2;
        const catalyticBonus = this.world.getCatalyticBonus(avgX, avgY);

        if (mol1.type === 'amino_acid' && mol2.type === 'amino_acid') {
            if (Math.random() < BOND_PROBABILITIES.amino_acid_to_peptide * catalyticBonus) {
                this.createComplexMolecule('peptide', [mol1, mol2]);
                if (this.world.phase === 'primordial_soup') this.world.phase = 'synthesis';
            }
        } else if (mol1.type === 'nucleotide' && mol2.type === 'nucleotide') {
            if (Math.random() < BOND_PROBABILITIES.nucleotide_to_rna * catalyticBonus) {
                this.createComplexMolecule('rna_fragment', [mol1, mol2]);
                if (this.world.phase === 'synthesis') this.world.phase = 'polymerization';
            }
        } else if (mol1.type === 'lipid' && mol2.type === 'lipid') {
            if (Math.random() < BOND_PROBABILITIES.lipid_to_membrane * catalyticBonus) {
                this.createBond(mol1, mol2, 'hydrophobic');
            }
        } else if (
            (mol1.type === 'amino_acid' && mol2.type === 'peptide') ||
            (mol1.type === 'peptide' && mol2.type === 'amino_acid') ||
            (mol1.type === 'peptide' && mol2.type === 'peptide')
        ) {
            if (Math.random() < BOND_PROBABILITIES.amino_acid_to_peptide * catalyticBonus * 0.8) {
                this.createBond(mol1, mol2, 'covalent');
            }
        } else if (
            (mol1.type === 'nucleotide' && mol2.type === 'rna_fragment') ||
            (mol1.type === 'rna_fragment' && mol2.type === 'nucleotide') ||
            (mol1.type === 'rna_fragment' && mol2.type === 'rna_fragment')
        ) {
            if (Math.random() < BOND_PROBABILITIES.nucleotide_to_rna * catalyticBonus * 0.8) {
                this.createBond(mol1, mol2, 'hydrogen');
            }
        } else if (mol1.complexity === 1 && mol2.complexity === 1) {
            if (Math.random() < BOND_PROBABILITIES.simple_to_building_block * catalyticBonus) {
                const buildingBlocks: MoleculeType[] = ['amino_acid', 'nucleotide', 'sugar'];
                const newType = buildingBlocks[Math.floor(Math.random() * buildingBlocks.length)];
                this.createComplexMolecule(newType, [mol1, mol2]);
            }
        }
    }

    createBond(mol1: Molecule, mol2: Molecule, type: Bond['type']) {
        const rest = toroidalDistance(mol1.x, mol1.y, mol2.x, mol2.y, this.world.width, this.world.height);
        const bond: Bond = {
            mol1: mol1.id,
            mol2: mol2.id,
            strength: 0.6 + Math.random() * 0.4,
            type,
            restLength: Math.max(4, rest),
        };
        this.bonds.push(bond);
        mol1.bondedTo.add(mol2.id);
        mol2.bondedTo.add(mol1.id);
        mol1.bonded = true;
        mol2.bonded = true;
    }

    createComplexMolecule(type: MoleculeType, reactants: Molecule[]) {
        const positions = reactants.map((r) => ({ x: r.x, y: r.y }));
        const avg = averageToroidalPosition(positions, this.world.width, this.world.height);

        const newMol = new Molecule(this.nextId++, type, this.world);
        newMol.x = avg.x;
        newMol.y = avg.y;
        newMol.vx = reactants[0].vx * 0.5;
        newMol.vy = reactants[0].vy * 0.5;

        this.molecules.push(newMol);
        this.moleculeMap.set(newMol.id, newMol);

        const reactantIds = new Set(reactants.map((r) => r.id));
        const seenKeys = new Set<string>();
        const newBonds: Bond[] = [];

        for (const b of this.bonds) {
            const aIsReact = reactantIds.has(b.mol1);
            const bIsReact = reactantIds.has(b.mol2);

            if (aIsReact && bIsReact) continue;

            let nm1 = b.mol1;
            let nm2 = b.mol2;
            if (aIsReact) nm1 = newMol.id;
            if (bIsReact) nm2 = newMol.id;
            if (nm1 === nm2) continue;

            const key = nm1 < nm2 ? `${nm1}-${nm2}` : `${nm2}-${nm1}`;
            if (seenKeys.has(key)) continue;
            seenKeys.add(key);

            let rest = b.restLength ?? 6;
            if (nm1 === newMol.id && this.moleculeMap.has(nm2)) {
                const other = this.moleculeMap.get(nm2)!;
                rest = toroidalDistance(newMol.x, newMol.y, other.x, other.y, this.world.width, this.world.height);
            } else if (nm2 === newMol.id && this.moleculeMap.has(nm1)) {
                const other = this.moleculeMap.get(nm1)!;
                rest = toroidalDistance(newMol.x, newMol.y, other.x, other.y, this.world.width, this.world.height);
            }

            newBonds.push({
                mol1: nm1,
                mol2: nm2,
                strength: b.strength,
                type: b.type,
                restLength: Math.max(4, rest),
                k: b.k,
            });
        }

        this.bonds = newBonds;

        for (const mol of reactants) {
            this.molecules = this.molecules.filter((m) => m.id !== mol.id);
            this.moleculeMap.delete(mol.id);
        }

        for (const mol of this.moleculeMap.values()) {
            mol.bondedTo.clear();
            mol.bonded = false;
        }

        for (const b of this.bonds) {
            const m1 = this.moleculeMap.get(b.mol1);
            const m2 = this.moleculeMap.get(b.mol2);
            if (m1 && m2) {
                m1.bondedTo.add(m2.id);
                m2.bondedTo.add(m1.id);
                m1.bonded = true;
                m2.bonded = true;
            }
        }
    }

    tryFormProtoCells() {
        if (this.lucaBorn) return;

        const complexMols = this.molecules.filter((m) => m.complexity >= 2 && m.bonded);
        if (complexMols.length < 8) return;

        if (this.protoCells.length >= 4) return;

        const visited = new Set<number>();
        const clusters: number[][] = [];

        for (const mol of complexMols) {
            if (visited.has(mol.id)) continue;

            const cluster: number[] = [];
            const stack = [mol.id];

            while (stack.length > 0) {
                const currentId = stack.pop()!;
                if (visited.has(currentId)) continue;

                visited.add(currentId);
                cluster.push(currentId);

                const currentMol = this.moleculeMap.get(currentId);
                if (currentMol) {
                    for (const bondedId of currentMol.bondedTo) {
                        if (!visited.has(bondedId)) {
                            stack.push(bondedId);
                        }
                    }
                }
            }

            if (cluster.length >= 8) {
                clusters.push(cluster);
            }
        }

        const numToForm = Math.min(2, clusters.length, 4 - this.protoCells.length);
        for (let i = 0; i < numToForm; i++) {
            const cluster = clusters[i];
            const mols = cluster.map((id) => this.moleculeMap.get(id)).filter((m) => m) as Molecule[];
            const positions = mols.map((m) => ({ x: m.x, y: m.y }));
            const center = averageToroidalPosition(positions, this.world.width, this.world.height);

            const proto = new ProtoCell(this.nextId++, cluster, center.x, center.y);
            this.protoCells.push(proto);
            this.world.phase = 'self_assembly';
        }
    }

    update() {
        this.world.update();
        this.molecules.forEach((m) => m.update(this.world));
        this.applyBondForces();

        if (!this.lucaBorn) {
            this.checkChemistry();
            this.tryFormProtoCells();
        }

        this.protoCells = this.protoCells.filter((p) => {
            p.update(this.world, this.moleculeMap);
            if (!this.lucaBorn && p.canBecomeLUCA()) {
                this.luca = p.emergeLUCA(this.world);
                this.lucaBorn = true;
                this.world.phase = 'luca_emergence';
                return false;
            }
            if (p.stability > 30) {
                this.world.phase = 'proto_life';
            }
            return true;
        });

        if (this.luca && this.luca.isAlive) {
            this.luca.update(this.world);
            if (this.luca.canReproduce(this.world) && this.organisms.length < 8) {
                const offspring = this.luca.reproduce(this.nextId++, this.world);
                this.organisms.push(offspring);
                this.totalBorn++;
                this.world.phase = 'early_life';
            }
        }

        this.organisms.forEach((o) => o.update(this.world));

        const fertile = this.organisms.filter((o) => o.canReproduce(this.world) && o.isAlive);
        if (fertile.length > 0 && this.organisms.length < 25) {
            const parent = fertile[Math.floor(Math.random() * fertile.length)];
            const child = parent.reproduce(this.nextId++, this.world);
            this.organisms.push(child);
            this.totalBorn++;
            this.maxGeneration = Math.max(this.maxGeneration, child.generation);
            if (this.organisms.length > 12) {
                this.world.phase = 'diversification';
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, this.world.width, this.world.height);

        for (let y = 0; y < this.world.energyField.length; y++) {
            for (let x = 0; x < this.world.energyField[y].length; x++) {
                const energy = this.world.energyField[y][x];
                const alpha = (energy / 100) * 0.12;
                ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
                ctx.fillRect(x * 30, y * 30, 30, 30);
            }
        }

        for (const vent of this.world.vents) {
            const pulse = Math.sin(this.world.time * 0.05 + vent.phase) * 0.3 + 0.7;

            const gradient = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 80);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.2)');
            gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 80 * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 100, 50, 0.9)';
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(255, 150, 80, ${0.5 * pulse})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, 15 + pulse * 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (const rock of this.world.rocks) {
            const alpha = rock.type === 'chimney' ? 0.25 : rock.type === 'ridge' ? 0.2 : 0.15;
            ctx.fillStyle = `rgba(70, 70, 80, ${alpha})`;
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(100, 100, 110, ${alpha + 0.1})`;
            ctx.lineWidth = rock.type === 'chimney' ? 2 : 1.5;
            ctx.stroke();

            if (rock.roughness > 0.6) {
                ctx.fillStyle = `rgba(90, 90, 100, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(rock.x - rock.radius * 0.3, rock.y - rock.radius * 0.3, rock.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (const bond of this.bonds) {
            const mol1 = this.moleculeMap.get(bond.mol1);
            const mol2 = this.moleculeMap.get(bond.mol2);
            if (mol1 && mol2) {
                ctx.strokeStyle = (COLORS as any)[`bond_${bond.type}`] || COLORS.bond_covalent;
                ctx.lineWidth = 1.5;

                const dx = wrapDelta(mol2.x - mol1.x, this.world.width);
                const dy = wrapDelta(mol2.y - mol1.y, this.world.height);

                ctx.beginPath();
                ctx.moveTo(mol1.x, mol1.y);
                ctx.lineTo(mol1.x + dx, mol1.y + dy);
                ctx.stroke();
            }
        }

        if (!this.lucaBorn) {
            this.molecules.forEach((m) => m.draw(ctx, this.world.time));
        }
        this.protoCells.forEach((p) => p.draw(ctx));
        if (this.luca) this.luca.draw(ctx, this.world.time);
        this.organisms.forEach((o) => o.draw(ctx));
    }
}

// ==================== REACT COMPONENT ====================

function LegendItem({ color, label, isSquare = false }: { color: string; label: string; isSquare?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div
                style={{
                    width: isSquare ? '12px' : '8px',
                    height: isSquare ? '12px' : '8px',
                    borderRadius: isSquare ? '2px' : '50%',
                    background: color,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    flexShrink: 0,
                }}
            />
            <span style={{ color: COLORS.textMuted }}>{label}</span>
        </div>
    );
}

export default function LUCASimulation({ isRunning: externalIsRunning, speed: externalSpeed = 1 }: PhylogenySimProps = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<SimulationEngine | null>(null);

    const [internalIsRunning, setInternalIsRunning] = useState(true);
    const [, forceUpdate] = useState({});

    const [rotation, setRotation] = useState(0.0008);
    const [bondK, setBondK] = useState(0.02);
    const [breakProb, setBreakProb] = useState(0.012);

    const isRunning = externalIsRunning !== undefined ? externalIsRunning : internalIsRunning;

    useEffect(() => {
        engineRef.current = new SimulationEngine();
        if (engineRef.current) {
            engineRef.current.world.rotationSpeed = rotation;
            engineRef.current.bondSpringK = bondK;
            engineRef.current.bondBreakProbability = breakProb;
        }
        forceUpdate({});
    }, []);

    useEffect(() => {
        if (!engineRef.current) return;
        engineRef.current.world.rotationSpeed = rotation;
        engineRef.current.bondSpringK = bondK;
        engineRef.current.bondBreakProbability = breakProb;
    }, [rotation, bondK, breakProb]);

    useEffect(() => {
        if (!isRunning || !engineRef.current) return;

        const interval = setInterval(() => {
            const engine = engineRef.current;
            if (!engine) return;

            engine.update();

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx) engine.draw(ctx);
        }, UPDATE_INTERVAL / externalSpeed);

        return () => clearInterval(interval);
    }, [isRunning, externalSpeed]);

    const engine = engineRef.current;
    if (!engine) return null;

    const phaseLabels: Record<SimulationPhase, string> = {
        primordial_soup: 'Primordial Soup',
        synthesis: 'Molecular Synthesis',
        polymerization: 'Polymerization',
        self_assembly: 'Self-Assembly',
        proto_life: 'Protocell Formation',
        luca_emergence: '⭐ LUCA Has Emerged!',
        early_life: 'Early Life',
        diversification: 'Diversification & Evolution',
    };

    const aliveOrganisms = engine.organisms.filter((o) => o.isAlive).length;
    const uniqueColors = new Set(engine.organisms.filter((o) => o.isAlive).map((o) => o.traits.color)).size;

    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh',
                background: COLORS.bg,
                color: COLORS.text,
                padding: '3rem 2rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                        The Origin of Life: Hydrothermal Vent Simulation
                    </h1>
                    <p style={{ color: COLORS.textMuted, fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                        {phaseLabels[engine.world.phase]}
                    </p>

                    {engine.lucaBorn && (
                        <div style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '6px',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            gap: '1rem',
                            fontSize: '0.85rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Dna size={16} style={{ color: COLORS.luca }} />
                                <span><strong>Total Born:</strong> {engine.totalBorn}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={16} style={{ color: COLORS.organism }} />
                                <span><strong>Alive:</strong> {aliveOrganisms}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={16} style={{ color: COLORS.rna_fragment }} />
                                <span><strong>Max Gen:</strong> {engine.maxGeneration}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🎨</span>
                                <span><strong>Species:</strong> {uniqueColors}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        background: COLORS.surface,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '2rem',
                        border: `1px solid rgba(255, 255, 255, 0.05)`,
                    }}
                >
                    <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>

                <div
                    style={{
                        background: COLORS.surface,
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: `1px solid rgba(255, 255, 255, 0.05)`,
                    }}
                >
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: COLORS.text }}>Legend</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>Simple Molecules</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <LegendItem color={COLORS.water} label="Water (H₂O)" />
                                <LegendItem color={COLORS.carbon} label="Carbon" />
                                <LegendItem color={COLORS.nitrogen} label="Nitrogen" />
                                <LegendItem color={COLORS.oxygen} label="Oxygen" />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>Building Blocks</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <LegendItem color={COLORS.amino_acid} label="Amino Acids" />
                                <LegendItem color={COLORS.nucleotide} label="Nucleotides" />
                                <LegendItem color={COLORS.lipid} label="Lipids" />
                                <LegendItem color={COLORS.sugar} label="Sugars" />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>Complex Structures</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <LegendItem color={COLORS.peptide} label="Peptides" />
                                <LegendItem color={COLORS.rna_fragment} label="RNA Fragments" />
                                <LegendItem color={COLORS.membrane_vesicle} label="Membrane Vesicles" />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>Life Forms</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <LegendItem color={COLORS.proto} label="Protocells" />
                                <LegendItem color={COLORS.luca} label="LUCA (huge golden glow!)" />
                                <LegendItem color="hsl(200, 70%, 55%)" label="Evolved Organisms" />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>Environment</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <LegendItem color={COLORS.energy} label="Energy Field" isSquare />
                                <LegendItem color="rgba(255, 100, 50, 0.9)" label="Hydrothermal Vents" />
                                <LegendItem color="rgba(70, 70, 80, 0.25)" label="Mineral Chimneys" />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setInternalIsRunning(!internalIsRunning)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: COLORS.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            {isRunning ? <Pause size={14} /> : <Play size={14} />}
                            {isRunning ? 'Pause' : 'Play'}
                        </button>

                        <button
                            onClick={() => {
                                engineRef.current = new SimulationEngine();
                                if (engineRef.current) {
                                    engineRef.current.world.rotationSpeed = rotation;
                                    engineRef.current.bondSpringK = bondK;
                                    engineRef.current.bondBreakProbability = breakProb;
                                }
                                forceUpdate({});
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: COLORS.textMuted,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>

                        <div
                            style={{
                                marginLeft: 'auto',
                                fontSize: '0.875rem',
                                color: COLORS.textMuted,
                                fontVariantNumeric: 'tabular-nums',
                                display: 'flex',
                                gap: '1rem',
                            }}
                        >
                            <span>
                                <Droplets size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                {engine.molecules.length}
                            </span>
                            <span>
                                <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                {engine.bonds.length}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <label style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                Global Rotation: <strong style={{ color: COLORS.text }}>{rotation.toFixed(4)}</strong>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={0.005}
                                step={0.0001}
                                value={rotation}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </label>

                        <label style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                Bond Stiffness: <strong style={{ color: COLORS.text }}>{bondK.toFixed(3)}</strong>
                            </div>
                            <input
                                type="range"
                                min={0.001}
                                max={0.08}
                                step={0.001}
                                value={bondK}
                                onChange={(e) => setBondK(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </label>

                        <label style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                Bond Break Probability: <strong style={{ color: COLORS.text }}>{breakProb.toFixed(3)}</strong>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={0.05}
                                step={0.001}
                                value={breakProb}
                                onChange={(e) => setBreakProb(Number(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}