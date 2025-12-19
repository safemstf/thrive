import type {
    MoleculeType, MolecularEntity, ProtoLifeEntity, LivingEntity, OrganismTraits,
    EukaryoteEntity, ColonyEntity, ColonyMember, CellRole, Bond, SimulationPhase,
    ViewMode, HydrothermalVent, Rock, EnvironmentZone, Species, Catastrophe,
    CatastropheType, HistoricalEvent, Camera, Selection, SimulationStats, Milestone,
} from './phylogeny.config';

import {
    COLORS, RNA_BASES, RNA_LENGTH, WORLD_WIDTH, WORLD_HEIGHT, INITIAL_COUNTS,
    MOLECULE_SPEED, COLLISION_DISTANCE, BOND_PROBABILITIES, PROTOCELL, EVOLUTION,
    GENOME_REGIONS, SPECIES_PREFIXES, SPECIES_ROOTS, SPECIES_SUFFIXES,
    CATASTROPHE_CONFIG, MILESTONES,
} from './phylogeny.config';

// ==================== SPATIAL HASH ====================

class SpatialHash {
    private cellSize: number;
    private grid: Map<string, Set<number>> = new Map();
    private width: number;
    private height: number;

    constructor(width: number, height: number, cellSize: number = 50) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }

    private getKey(x: number, y: number): string {
        const cx = Math.floor(((x % this.width) + this.width) % this.width / this.cellSize);
        const cy = Math.floor(((y % this.height) + this.height) % this.height / this.cellSize);
        return `${cx},${cy}`;
    }

    clear() { this.grid.clear(); }

    insert(id: number, x: number, y: number) {
        const key = this.getKey(x, y);
        if (!this.grid.has(key)) this.grid.set(key, new Set());
        this.grid.get(key)!.add(id);
    }

    getNearby(x: number, y: number): number[] {
        const results: number[] = [];
        const cx = Math.floor(((x % this.width) + this.width) % this.width / this.cellSize);
        const cy = Math.floor(((y % this.height) + this.height) % this.height / this.cellSize);
        const maxCx = Math.ceil(this.width / this.cellSize);
        const maxCy = Math.ceil(this.height / this.cellSize);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const ncx = ((cx + dx) % maxCx + maxCx) % maxCx;
                const ncy = ((cy + dy) % maxCy + maxCy) % maxCy;
                const cell = this.grid.get(`${ncx},${ncy}`);
                if (cell) results.push(...cell);
            }
        }
        return results;
    }
}

// ==================== HELPERS ====================

export function generateRNA(length: number): string {
    return Array.from({ length }, () => RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)]).join('');
}

export function mutateRNA(rna: string, rate: number): { newRNA: string; mutations: number } {
    let mutations = 0;
    const newRNA = rna.split('').map((base) => {
        if (Math.random() < rate) {
            mutations++;
            return RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)];
        }
        return base;
    }).join('');
    return { newRNA, mutations };
}

export function crossoverGenomes(genome1: string, genome2: string): string {
    const length = Math.max(genome1.length, genome2.length);
    let result = '';
    let currentParent = Math.random() < 0.5 ? 1 : 2;
    
    for (let i = 0; i < length; i++) {
        if (Math.random() < EVOLUTION.CROSSOVER_RATE) {
            currentParent = currentParent === 1 ? 2 : 1;
        }
        
        const base = currentParent === 1 
            ? (genome1[i] || RNA_BASES[Math.floor(Math.random() * 4)])
            : (genome2[i] || RNA_BASES[Math.floor(Math.random() * 4)]);
        
        if (Math.random() < EVOLUTION.SEXUAL_MUTATION_RATE) {
            result += RNA_BASES[Math.floor(Math.random() * 4)];
        } else {
            result += base;
        }
    }
    return result;
}

export function genomeDistance(g1: string, g2: string): number {
    const length = Math.max(g1.length, g2.length);
    let diff = 0;
    for (let i = 0; i < length; i++) {
        if (g1[i] !== g2[i]) diff++;
    }
    return diff / length;
}

function genomeRegionToValue(genome: string, start: number, end: number): number {
    let value = 0;
    for (let i = start; i < end && i < genome.length; i++) {
        const base = genome[i];
        value += (base === 'A' ? 0 : base === 'U' ? 1 : base === 'C' ? 2 : 3) / 4;
    }
    return value / (end - start);
}

export function genomeToTraits(genome: string): OrganismTraits {
    const metabolism = genomeRegionToValue(genome, ...GENOME_REGIONS.METABOLISM);
    const speed = genomeRegionToValue(genome, ...GENOME_REGIONS.SPEED);
    const size = genomeRegionToValue(genome, ...GENOME_REGIONS.SIZE);
    const predatory = genomeRegionToValue(genome, ...GENOME_REGIONS.PREDATORY);
    const defense = genomeRegionToValue(genome, ...GENOME_REGIONS.DEFENSE);
    const cooperation = genomeRegionToValue(genome, ...GENOME_REGIONS.COOPERATION);
    const photosynthetic = genomeRegionToValue(genome, ...GENOME_REGIONS.PHOTOSYNTHETIC);
    const aerobic = genomeRegionToValue(genome, ...GENOME_REGIONS.AEROBIC);
    const matingDisplay = genomeRegionToValue(genome, ...GENOME_REGIONS.MATING_DISPLAY);
    const geneticCompat = genomeRegionToValue(genome, ...GENOME_REGIONS.GENETIC_COMPAT);

    let hue: number;
    if (predatory > 0.5) hue = 0 + predatory * 25;
    else if (photosynthetic > 0.5) hue = 100 + photosynthetic * 40;
    else if (cooperation > 0.5) hue = 170 + cooperation * 40;
    else hue = 200 + metabolism * 40;

    let reproductiveStrategy: 'asexual' | 'sexual' | 'both' = 'asexual';
    if (matingDisplay > 0.6) reproductiveStrategy = 'sexual';
    else if (matingDisplay > 0.3) reproductiveStrategy = 'both';

    return {
        metabolicEfficiency: 0.5 + metabolism * 0.9,
        speed: 0.06 + speed * 0.2,
        size: 7 + size * 16,
        color: `hsl(${hue}, ${55 + metabolism * 35}%, ${42 + defense * 18}%)`,
        predatory,
        defense,
        cooperation,
        senseRange: 30 + Math.max(predatory, cooperation) * 55,
        photosynthetic,
        aerobic,
        reproductiveStrategy,
        matingDisplay,
        geneticCompatibility: geneticCompat,
    };
}

export function generateSpeciesName(): string {
    const prefix = SPECIES_PREFIXES[Math.floor(Math.random() * SPECIES_PREFIXES.length)];
    const root = SPECIES_ROOTS[Math.floor(Math.random() * SPECIES_ROOTS.length)];
    const suffix = SPECIES_SUFFIXES[Math.floor(Math.random() * SPECIES_SUFFIXES.length)];
    return `${prefix}${root}${suffix}`;
}

export function generateSpeciesColor(parentColor?: string): string {
    if (parentColor) {
        const hue = (parseInt(parentColor.slice(1, 3), 16) + Math.random() * 60 - 30 + 360) % 360;
        return `hsl(${hue}, ${60 + Math.random() * 30}%, ${45 + Math.random() * 20}%)`;
    }
    return `hsl(${Math.random() * 360}, ${60 + Math.random() * 30}%, ${45 + Math.random() * 20}%)`;
}

export function wrapDelta(delta: number, size: number): number {
    const half = size / 2;
    if (delta > half) return delta - size;
    if (delta < -half) return delta + size;
    return delta;
}

export function toroidalDistance(x1: number, y1: number, x2: number, y2: number, w: number, h: number): number {
    const dx = wrapDelta(x2 - x1, w);
    const dy = wrapDelta(y2 - y1, h);
    return Math.sqrt(dx * dx + dy * dy);
}

export function wrapPosition(x: number, y: number, w: number, h: number) {
    return { x: ((x % w) + w) % w, y: ((y % h) + h) % h };
}

export function getComplexity(type: MoleculeType): number {
    if (['water', 'carbon', 'nitrogen', 'oxygen'].includes(type)) return 1;
    if (['amino_acid', 'nucleotide', 'lipid', 'sugar'].includes(type)) return 2;
    return 3;
}

function lerpToroidal(a: number, b: number, t: number, size: number): number {
    return ((a + wrapDelta(b - a, size) * t) % size + size) % size;
}

function randomPosition(width: number, height: number, padding: number = 50) {
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

// ==================== WORLD ====================

export class PrimordialWorld {
    width = WORLD_WIDTH;
    height = WORLD_HEIGHT;
    time = 0;
    phase: SimulationPhase = 'primordial_soup';
    energyField: number[][];
    oxygenField: number[][];
    temperature = 85;
    vents: HydrothermalVent[] = [];
    rocks: Rock[] = [];
    zones: EnvironmentZone[] = [];
    totalEnergy = 0;
    maxEnergy = 0;
    
    activeCatastrophe: Catastrophe | null = null;
    lastCatastropheTime = 0;

    constructor() {
        const rows = Math.ceil(this.height / 40);
        const cols = Math.ceil(this.width / 40);
        this.energyField = Array(rows).fill(0).map(() => Array(cols).fill(35 + Math.random() * 25));
        this.oxygenField = Array(rows).fill(0).map(() => Array(cols).fill(8 + Math.random() * 12));

        this.vents = [
            { x: this.width * 0.15, y: this.height * 0.25, strength: 1.5, phase: 0 },
            { x: this.width * 0.75, y: this.height * 0.35, strength: 1.3, phase: Math.PI },
            { x: this.width * 0.45, y: this.height * 0.7, strength: 1.4, phase: Math.PI * 0.5 },
            { x: this.width * 0.85, y: this.height * 0.75, strength: 1.2, phase: Math.PI * 1.5 },
            { x: this.width * 0.25, y: this.height * 0.55, strength: 1.1, phase: Math.PI * 0.75 },
        ];

        this.createZones();
        this.createVentTopology();
        this.calculateTotalEnergy();
        this.maxEnergy = this.totalEnergy * 1.4;
    }

    createZones() {
        for (const vent of this.vents) {
            this.zones.push({
                x: vent.x, y: vent.y, radius: 60,
                type: 'vent_hot', energyRate: 4.0, temperature: 120, lightLevel: 0, oxygenLevel: 0.15, toxicity: 0.1,
            });
            this.zones.push({
                x: vent.x, y: vent.y, radius: 130,
                type: 'vent_warm', energyRate: 2.0, temperature: 50, lightLevel: 0, oxygenLevel: 0.3, toxicity: 0,
            });
        }
        
        this.zones.push({
            x: this.width * 0.5, y: this.height * 0.12, radius: 200,
            type: 'oxygen_rich', energyRate: 0.6, temperature: 18, lightLevel: 0.7, oxygenLevel: 0.95, toxicity: 0,
        });
        this.zones.push({
            x: this.width * 0.2, y: this.height * 0.85, radius: 150,
            type: 'surface', energyRate: 0.4, temperature: 15, lightLevel: 1.0, oxygenLevel: 0.8, toxicity: 0,
        });

        this.zones.push({
            x: this.width / 2, y: this.height / 2, radius: Math.max(this.width, this.height),
            type: 'open_water', energyRate: 0.2, temperature: 20, lightLevel: 0.15, oxygenLevel: 0.25, toxicity: 0,
        });
    }

    createVentTopology() {
        for (const vent of this.vents) {
            for (let ring = 0; ring < 2; ring++) {
                const ringRadius = 25 + ring * 22;
                const rocksInRing = 5 + ring * 2;
                for (let i = 0; i < rocksInRing; i++) {
                    const angle = (i / rocksInRing) * Math.PI * 2;
                    const wobble = (Math.random() - 0.5) * 10;
                    this.rocks.push({
                        x: ((vent.x + Math.cos(angle) * (ringRadius + wobble)) % this.width + this.width) % this.width,
                        y: ((vent.y + Math.sin(angle) * (ringRadius + wobble)) % this.height + this.height) % this.height,
                        radius: 4 + Math.random() * 6,
                        roughness: 0.6 + Math.random() * 0.4,
                        type: 'chimney',
                    });
                }
            }
        }
    }

    calculateTotalEnergy() {
        this.totalEnergy = this.energyField.flat().reduce((a, b) => a + b, 0);
    }

    getZoneAt(x: number, y: number): EnvironmentZone {
        let best = this.zones[this.zones.length - 1];
        let bestR = Infinity;
        for (const zone of this.zones) {
            const dist = toroidalDistance(x, y, zone.x, zone.y, this.width, this.height);
            if (dist < zone.radius && zone.radius < bestR) { best = zone; bestR = zone.radius; }
        }
        return best;
    }

    isNearVent(x: number, y: number, radius = 100): { near: boolean; distance: number; vent?: HydrothermalVent } {
        for (const vent of this.vents) {
            const dist = toroidalDistance(x, y, vent.x, vent.y, this.width, this.height);
            if (dist < radius) return { near: true, distance: dist, vent };
        }
        return { near: false, distance: Infinity };
    }

    getCatalyticBonus(x: number, y: number): number {
        let mult = 1.0;
        const ventCheck = this.isNearVent(x, y, 110);
        if (ventCheck.near) mult *= (1 + BOND_PROBABILITIES.vent_multiplier * (1 - ventCheck.distance / 110));
        for (const rock of this.rocks) {
            const dist = toroidalDistance(x, y, rock.x, rock.y, this.width, this.height);
            if (dist < rock.radius + 30) {
                mult *= (1 + BOND_PROBABILITIES.rock_multiplier * Math.max(0, 1 - (dist - rock.radius) / 30) * rock.roughness);
                break;
            }
        }
        return mult;
    }

    checkRockCollision(x: number, y: number, radius: number): Rock | null {
        for (const rock of this.rocks) {
            if (toroidalDistance(x, y, rock.x, rock.y, this.width, this.height) < rock.radius + radius) return rock;
        }
        return null;
    }

    getEnergyAt(x: number, y: number): number {
        const col = Math.floor(x / 40), row = Math.floor(y / 40);
        return this.energyField[row]?.[col] || 0;
    }

    getOxygenAt(x: number, y: number): number {
        const col = Math.floor(x / 40), row = Math.floor(y / 40);
        return this.oxygenField[row]?.[col] || 0;
    }

    consumeEnergyAt(x: number, y: number, amount: number): number {
        const col = Math.floor(x / 40), row = Math.floor(y / 40);
        if (this.energyField[row]?.[col] !== undefined) {
            const consumed = Math.min(this.energyField[row][col], amount);
            this.energyField[row][col] -= consumed;
            this.totalEnergy -= consumed;
            return consumed;
        }
        return 0;
    }

    addOxygenAt(x: number, y: number, amount: number) {
        const col = Math.floor(x / 40), row = Math.floor(y / 40);
        if (this.oxygenField[row]?.[col] !== undefined) {
            this.oxygenField[row][col] = Math.min(100, this.oxygenField[row][col] + amount);
        }
    }

    getFlowAt(x: number, y: number): { fx: number; fy: number } {
        let fx = 0, fy = 0;
        const cx = this.width / 2, cy = this.height / 2;
        
        // Global Coriolis-like rotation
        fx += -0.0006 * wrapDelta(y - cy, this.height);
        fy += 0.0006 * wrapDelta(x - cx, this.width);

        // Vent-driven convection currents
        for (const vent of this.vents) {
            const dx = wrapDelta(x - vent.x, this.width);
            const dy = wrapDelta(y - vent.y, this.height);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5 && dist < 150) {
                const pulse = Math.sin(this.time * 0.04 + vent.phase) * 0.3 + 0.7;
                const strength = (1 - dist / 150) * vent.strength * pulse * 0.4;
                const angle = Math.atan2(dy, dx);
                // Radial outward + tangential rotation
                fx += Math.cos(angle) * strength * 0.6;
                fy += Math.sin(angle) * strength * 0.6;
                // Add rotation around vent
                fx += -Math.sin(angle) * strength * 0.4;
                fy += Math.cos(angle) * strength * 0.4;
            }
        }
        return { fx, fy };
    }

    getCatastropheModifiers(): { energy: number; death: number; mutation: number } {
        if (!this.activeCatastrophe) return { energy: 1, death: 0, mutation: 1 };
        
        const config = CATASTROPHE_CONFIG[this.activeCatastrophe.type];
        const progress = (this.time - this.activeCatastrophe.startTime) / this.activeCatastrophe.duration;
        const intensity = this.activeCatastrophe.intensity * Math.sin(progress * Math.PI);
        
        return {
            energy: config.effects.energyMultiplier ? 1 - (1 - config.effects.energyMultiplier) * intensity : 1,
            death: (config.effects.deathChance || 0) * intensity,
            mutation: config.effects.mutationBoost ? 1 + (config.effects.mutationBoost - 1) * intensity : 1,
        };
    }

    update() {
        this.time++;
        if (this.temperature > 30) this.temperature *= 0.99985;

        if (this.activeCatastrophe) {
            if (this.time > this.activeCatastrophe.startTime + this.activeCatastrophe.duration) {
                this.activeCatastrophe = null;
            }
        }

        if (this.time % 120 === 0 && this.totalEnergy < this.maxEnergy * 0.7) {
            const catMod = this.getCatastropheModifiers();
            for (let y = 0; y < this.energyField.length; y++) {
                for (let x = 0; x < this.energyField[y].length; x++) {
                    const cellX = x * 40 + 20, cellY = y * 40 + 20;
                    const zone = this.getZoneAt(cellX, cellY);
                    let regen = zone.energyRate * 0.35 * catMod.energy;
                    for (const vent of this.vents) {
                        const dist = toroidalDistance(cellX, cellY, vent.x, vent.y, this.width, this.height);
                        if (dist < 100) regen += (1 - dist / 100) * 2.5 * vent.strength;
                    }
                    const newE = Math.min(65, this.energyField[y][x] + regen);
                    this.totalEnergy += newE - this.energyField[y][x];
                    this.energyField[y][x] = newE;
                }
            }
        }

        if (this.time % 180 === 0) {
            for (let y = 0; y < this.oxygenField.length; y++) {
                for (let x = 0; x < this.oxygenField[y].length; x++) {
                    const zone = this.getZoneAt(x * 40 + 20, y * 40 + 20);
                    if (zone.oxygenLevel > 0.5) {
                        this.oxygenField[y][x] = Math.min(100, this.oxygenField[y][x] + zone.oxygenLevel * 1.5);
                    }
                    this.oxygenField[y][x] *= 0.985;
                }
            }
        }
    }

    triggerCatastrophe(type: CatastropheType): Catastrophe {
        const config = CATASTROPHE_CONFIG[type];
        const catastrophe: Catastrophe = {
            type,
            startTime: this.time,
            duration: config.minDuration + Math.random() * (config.maxDuration - config.minDuration),
            intensity: 0.5 + Math.random() * 0.5,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: 200 + Math.random() * 300,
        };
        this.activeCatastrophe = catastrophe;
        this.lastCatastropheTime = this.time;
        return catastrophe;
    }
}

// ==================== MOLECULE ====================

export class Molecule implements MolecularEntity {
    id: number;
    type: MoleculeType;
    symbol: string;
    x: number; y: number;
    vx: number; vy: number;
    energy = 50;
    mass: number;
    color: string;
    radius: number;
    bonded = false;
    bondedTo: Set<number> = new Set();
    complexity: number;
    age = 0;
    inProtoCell: number | null = null;

    constructor(id: number, type: MoleculeType, world: PrimordialWorld) {
        this.id = id;
        this.type = type;
        this.complexity = getComplexity(type);
        
        if (type === 'nucleotide') this.symbol = RNA_BASES[Math.floor(Math.random() * 4)];
        else if (type === 'amino_acid') this.symbol = 'AA';
        else if (type === 'peptide') this.symbol = 'Pep';
        else if (type === 'lipid') this.symbol = 'Li';
        else if (type === 'rna_fragment') this.symbol = 'RNA';
        else this.symbol = type.charAt(0).toUpperCase();

        this.radius = 2 + this.complexity * 1.8;
        let pos = randomPosition(world.width, world.height);
        for (let i = 0; i < 10 && world.checkRockCollision(pos.x, pos.y, this.radius + 2); i++) {
            pos = randomPosition(world.width, world.height);
        }
        const vel = randomVelocity();
        this.x = pos.x; this.y = pos.y;
        this.vx = vel.vx; this.vy = vel.vy;
        this.mass = this.complexity;
        this.color = (COLORS as any)[type] || COLORS.water;
    }

    update(world: PrimordialWorld) {
        this.age++;
        const speedMult = 1 - Math.min(this.bondedTo.size * 0.22, 0.85);
        const flow = world.getFlowAt(this.x, this.y);
        this.vx += flow.fx * 0.07;
        this.vy += flow.fy * 0.07;

        const newX = this.x + this.vx * speedMult;
        const newY = this.y + this.vy * speedMult;
        const collision = world.checkRockCollision(newX, newY, this.radius);
        
        if (collision) {
            const dx = wrapDelta(this.x - collision.x, world.width);
            const dy = wrapDelta(this.y - collision.y, world.height);
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const nx = dx / dist, ny = dy / dist;
            const dot = this.vx * nx + this.vy * ny;
            this.vx = (this.vx - 2 * dot * nx) * 0.5;
            this.vy = (this.vy - 2 * dot * ny) * 0.5;
        } else {
            this.x = newX; this.y = newY;
        }

        const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
        this.x = wrapped.x; this.y = wrapped.y;
        this.vx *= 0.991; this.vy *= 0.991;
    }
}

// ==================== PROTOCELL ====================

export class ProtoCell implements ProtoLifeEntity {
    id: number;
    molecules: Set<number>;
    rnaSequence = '';
    hasMembrane = false;
    hasMetabolism = false;
    canReplicate = false;
    x: number; y: number;
    targetX: number; targetY: number;
    energy = 100;
    radius = 24;
    stability = 0;
    age = 0;
    lastMergeTime = 0;
    peptideCount = 0; rnaCount = 0; lipidCount = 0;

    constructor(id: number, mols: number[], x: number, y: number) {
        this.id = id;
        this.molecules = new Set(mols);
        this.x = x; this.y = y;
        this.targetX = x; this.targetY = y;
    }

    canMerge(t: number): boolean { return t - this.lastMergeTime > PROTOCELL.MERGE_COOLDOWN; }

    update(world: PrimordialWorld, moleculeMap: Map<number, Molecule>) {
        this.age++;
        const mols: Molecule[] = [];
        for (const id of this.molecules) {
            const mol = moleculeMap.get(id);
            if (mol) { mol.inProtoCell = this.id; mols.push(mol); }
        }
        if (mols.length < this.molecules.size) this.molecules = new Set(mols.map(m => m.id));

        if (mols.length > 0) {
            const refX = mols[0].x, refY = mols[0].y;
            let sumX = 0, sumY = 0;
            for (const m of mols) {
                sumX += wrapDelta(m.x - refX, world.width);
                sumY += wrapDelta(m.y - refY, world.height);
            }
            this.targetX = ((refX + sumX / mols.length) % world.width + world.width) % world.width;
            this.targetY = ((refY + sumY / mols.length) % world.height + world.height) % world.height;
        }

        this.x = lerpToroidal(this.x, this.targetX, 0.035, world.width);
        this.y = lerpToroidal(this.y, this.targetY, 0.035, world.height);

        this.peptideCount = 0; this.rnaCount = 0; this.lipidCount = 0;
        for (const m of mols) {
            if (m.type === 'peptide') this.peptideCount++;
            else if (m.type === 'rna_fragment' || m.type === 'nucleotide') this.rnaCount++;
            else if (m.type === 'lipid' || m.type === 'membrane_vesicle') this.lipidCount++;
        }

        this.hasMembrane = this.lipidCount >= PROTOCELL.LIPID_FOR_MEMBRANE;
        this.hasMetabolism = this.peptideCount >= PROTOCELL.PEPTIDE_FOR_METABOLISM;
        this.canReplicate = this.rnaCount >= PROTOCELL.RNA_FOR_REPLICATION;
        this.rnaSequence = mols.filter(m => m.type === 'nucleotide' || m.type === 'rna_fragment').map(m => m.symbol).join('');

        let baseStab = 8;
        if (this.hasMembrane) baseStab += 28;
        if (this.hasMetabolism) baseStab += 22;
        if (this.canReplicate) baseStab += 22;
        const diversity = [this.lipidCount > 0, this.peptideCount > 0, this.rnaCount > 0].filter(Boolean).length;
        baseStab += diversity * 10 + Math.min(mols.length * 0.35, 10);
        this.stability = Math.min(100, baseStab + this.age * 0.05);

        this.energy += world.consumeEnergyAt(this.x, this.y, this.hasMetabolism ? 2.2 : 1.0);
        this.energy = Math.min(150, this.energy);

        for (const mol of mols) {
            const dx = wrapDelta(this.x - mol.x, world.width);
            const dy = wrapDelta(this.y - mol.y, world.height);
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (dist > this.radius * 0.45) {
                mol.vx += (dx / dist) * 0.018;
                mol.vy += (dy / dist) * 0.018;
            }
        }
        this.radius = Math.max(18, 14 + mols.length * 0.9);
    }

    shouldSplit(): boolean { return this.molecules.size > PROTOCELL.MAX_SIZE; }

    split(nextId: number, moleculeMap: Map<number, Molecule>, world: PrimordialWorld): ProtoCell | null {
        const arr = Array.from(this.molecules);
        if (arr.length < PROTOCELL.MIN_SIZE * 2) return null;
        const half = Math.floor(arr.length / 2);
        const newMols = arr.slice(half);
        this.molecules = new Set(arr.slice(0, half));
        
        const angle = Math.random() * Math.PI * 2;
        const newX = ((this.x + Math.cos(angle) * (this.radius + 25)) % world.width + world.width) % world.width;
        const newY = ((this.y + Math.sin(angle) * (this.radius + 25)) % world.height + world.height) % world.height;
        const newP = new ProtoCell(nextId, newMols, newX, newY);
        newP.lastMergeTime = world.time;
        for (const molId of newMols) {
            const mol = moleculeMap.get(molId);
            if (mol) mol.inProtoCell = nextId;
        }
        return newP;
    }

    canBecomeLUCA(): boolean {
        return this.hasMembrane && this.hasMetabolism && this.canReplicate && 
               this.stability >= PROTOCELL.STABILITY_FOR_LUCA && this.age > 80;
    }

    emergeLUCA(world: PrimordialWorld, speciesId: number): LUCAEntity {
        let genome = this.rnaSequence;
        while (genome.length < RNA_LENGTH) genome += generateRNA(1);
        return new LUCAEntity(this.id, this.x, this.y, genome.slice(0, RNA_LENGTH), world.time, speciesId);
    }
}

// ==================== LUCA ====================

export class LUCAEntity implements LivingEntity {
    id: number;
    x: number; y: number;
    vx = 0; vy = 0;
    energy = 160;
    mass = 9;
    radius = 35;
    generation = 0;
    genome: string;
    birthTime: number;
    isAlive = true;
    parent = null;
    children: number[] = [];
    canMove = false;
    lastReproduction: number;
    traits: OrganismTraits;
    age = 0;
    entityType: 'luca' = 'luca';
    speciesId: number;
    isMating = false;
    mateId: number | null = null;
    matingProgress = 0;

    constructor(id: number, x: number, y: number, rna: string, birthTime: number, speciesId: number) {
        this.id = id;
        this.x = x; this.y = y;
        this.genome = rna;
        this.birthTime = birthTime;
        this.lastReproduction = birthTime;
        this.speciesId = speciesId;
        this.traits = {
            metabolicEfficiency: 1.3, speed: 0.1, size: 35, color: COLORS.luca,
            predatory: 0, defense: 0.5, cooperation: 0.5, senseRange: 65,
            photosynthetic: 0.1, aerobic: 0.3,
            reproductiveStrategy: 'asexual', matingDisplay: 0, geneticCompatibility: 0,
        };
    }

    update(world: PrimordialWorld) {
        if (!this.isAlive) return;
        this.age++;
        
        const zone = world.getZoneAt(this.x, this.y);
        const catMod = world.getCatastropheModifiers();
        this.energy += world.consumeEnergyAt(this.x, this.y, 2.2 * this.traits.metabolicEfficiency) * (zone.energyRate / 2) * catMod.energy;
        this.energy -= EVOLUTION.BASE_ENERGY_DRAIN * 0.7;

        if (catMod.death > 0 && Math.random() < catMod.death * 0.01) {
            this.isAlive = false; return;
        }

        if (this.energy <= 0) { this.isAlive = false; return; }

        if (this.energy > 65 && !this.canMove) {
            this.canMove = true;
            const vel = randomVelocity(0.06);
            this.vx = vel.vx; this.vy = vel.vy;
        }

        if (this.canMove) {
            const flow = world.getFlowAt(this.x, this.y);
            this.vx += flow.fx * 0.035;
            this.vy += flow.fy * 0.035;
            
            const newX = this.x + this.vx;
            const newY = this.y + this.vy;
            if (!world.checkRockCollision(newX, newY, this.radius)) {
                this.x = newX; this.y = newY;
            } else {
                this.vx *= -0.5; this.vy *= -0.5;
            }
            this.vx *= 0.98; this.vy *= 0.98;
            const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
            this.x = wrapped.x; this.y = wrapped.y;
        }
    }

    canReproduce(world: PrimordialWorld): boolean {
        return this.energy >= EVOLUTION.ASEXUAL_REPRODUCTION_COST + 25 && 
               world.time - this.lastReproduction >= EVOLUTION.ASEXUAL_REPRODUCTION_COOLDOWN * 0.7;
    }

    reproduce(childId: number, world: PrimordialWorld, speciesId: number): ProkaryoteEntity {
        const catMod = world.getCatastropheModifiers();
        const { newRNA } = mutateRNA(this.genome, EVOLUTION.MUTATION_RATE * catMod.mutation);
        const angle = Math.random() * Math.PI * 2;
        const offspring = new ProkaryoteEntity(childId, 
            this.x + Math.cos(angle) * (this.radius + 22),
            this.y + Math.sin(angle) * (this.radius + 22),
            1, this.id, newRNA, world.time, speciesId);
        this.children.push(childId);
        this.energy -= EVOLUTION.ASEXUAL_REPRODUCTION_COST;
        this.lastReproduction = world.time;
        return offspring;
    }
}

// ==================== PROKARYOTE ====================

export class ProkaryoteEntity implements LivingEntity {
    id: number;
    name: string;
    x: number; y: number;
    vx: number; vy: number;
    energy = 70;
    mass = 3;
    radius: number;
    generation: number;
    genome: string;
    birthTime: number;
    isAlive = true;
    parent: number | null;
    parent2: number | null = null;
    children: number[] = [];
    canMove = true;
    lastReproduction: number;
    traits: OrganismTraits;
    age = 0;
    entityType: 'prokaryote' = 'prokaryote';
    speciesId: number;
    inColony: number | null = null;
    
    isMating = false;
    mateId: number | null = null;
    matingProgress = 0;

    constructor(id: number, x: number, y: number, gen: number, parent: number | null, rna: string, birthTime: number, speciesId: number) {
        this.id = id;
        this.name = `${['α','β','γ','δ','ε','ζ','η','θ','ι','κ'][gen % 10]}${(id % 100).toString().padStart(2, '0')}`;
        this.x = x; this.y = y;
        this.generation = gen;
        this.genome = rna;
        this.parent = parent;
        this.birthTime = birthTime;
        this.lastReproduction = birthTime;
        this.speciesId = speciesId;
        this.traits = genomeToTraits(rna);
        this.radius = this.traits.size;
        const vel = randomVelocity(this.traits.speed);
        this.vx = vel.vx; this.vy = vel.vy;
    }

    canEat(other: ProkaryoteEntity | EukaryoteOrganism): boolean {
        if (!this.isAlive || !other.isAlive) return false;
        if (this.traits.predatory < 0.35) return false;
        return this.radius >= other.radius * EVOLUTION.PREDATION_SIZE_RATIO;
    }

    tryEat(other: ProkaryoteEntity | EukaryoteOrganism): boolean {
        if (!this.canEat(other)) return false;
        const attack = this.traits.predatory * (this.radius / other.radius);
        const defense = other.traits.defense * (1 + other.traits.speed);
        if (Math.random() < EVOLUTION.PREDATION_SUCCESS_BASE * (attack / (attack + defense))) {
            this.energy += other.energy * EVOLUTION.ENERGY_FROM_PREDATION;
            other.isAlive = false;
            return true;
        }
        return false;
    }

    canEngulf(other: ProkaryoteEntity): boolean {
        if (!this.isAlive || !other.isAlive) return false;
        if (this.generation < EVOLUTION.ENDOSYMBIOSIS_MIN_GENERATIONS) return false;
        if (other.generation < EVOLUTION.ENDOSYMBIOSIS_MIN_GENERATIONS) return false;
        if (this.radius < other.radius * EVOLUTION.ENDOSYMBIOSIS_SIZE_RATIO) return false;
        return other.traits.aerobic > 0.4 || other.traits.photosynthetic > 0.4;
    }

    canMateWith(other: ProkaryoteEntity, speciesMap: Map<number, Species>): boolean {
        if (!this.isAlive || !other.isAlive) return false;
        if (this.isMating || other.isMating) return false;
        if (this.traits.reproductiveStrategy === 'asexual') return false;
        if (other.traits.reproductiveStrategy === 'asexual') return false;
        
        const genomeDist = genomeDistance(this.genome, other.genome);
        const compatThreshold = 1 - Math.max(this.traits.geneticCompatibility, other.traits.geneticCompatibility);
        
        return genomeDist < compatThreshold * 0.5;
    }

    update(world: PrimordialWorld, allOrganisms?: (ProkaryoteEntity | EukaryoteOrganism)[]) {
        if (!this.isAlive) return;
        this.age++;

        const zone = world.getZoneAt(this.x, this.y);
        const catMod = world.getCatastropheModifiers();
        let baseEnergy = world.consumeEnergyAt(this.x, this.y, 1.0 * this.traits.metabolicEfficiency) * catMod.energy;
        baseEnergy *= (1 + (1 - this.traits.predatory) * 0.35);
        
        if (this.traits.photosynthetic > 0.3 && zone.lightLevel > 0.2) {
            const photoE = zone.lightLevel * this.traits.photosynthetic * EVOLUTION.ENERGY_FROM_PHOTOSYNTHESIS;
            this.energy += photoE;
            world.addOxygenAt(this.x, this.y, photoE * 0.25);
        }
        
        if (this.traits.aerobic > 0.3) {
            baseEnergy *= (1 + this.traits.aerobic * world.getOxygenAt(this.x, this.y) * 0.008);
        }
        
        this.energy += baseEnergy;

        if (catMod.death > 0 && Math.random() < catMod.death * 0.015) {
            this.isAlive = false; return;
        }

        if (this.isMating) {
            this.matingProgress++;
            if (this.matingProgress >= EVOLUTION.MATING_DURATION) {
                this.isMating = false;
                this.mateId = null;
                this.matingProgress = 0;
            }
        }

        if (this.canMove && allOrganisms && !this.inColony && !this.isMating) {
            const flow = world.getFlowAt(this.x, this.y);
            this.vx += flow.fx * 0.045;
            this.vy += flow.fy * 0.045;

            if (this.traits.predatory > 0.4) {
                let nearestPrey: ProkaryoteEntity | EukaryoteOrganism | null = null;
                let nearestDist = this.traits.senseRange;
                for (const other of allOrganisms) {
                    if (other.id === this.id || !other.isAlive || !this.canEat(other)) continue;
                    const dist = toroidalDistance(this.x, this.y, other.x, other.y, world.width, world.height);
                    if (dist < nearestDist) { nearestDist = dist; nearestPrey = other; }
                }
                if (nearestPrey) {
                    const dx = wrapDelta(nearestPrey.x - this.x, world.width);
                    const dy = wrapDelta(nearestPrey.y - this.y, world.height);
                    const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
                    this.vx += (dx / d) * this.traits.speed * 0.22;
                    this.vy += (dy / d) * this.traits.speed * 0.22;
                }
            }

            if (this.traits.defense > 0.3) {
                for (const other of allOrganisms) {
                    if (other.id === this.id || !other.isAlive || other.traits.predatory < 0.35) continue;
                    if (other.radius < this.radius * EVOLUTION.PREDATION_SIZE_RATIO) continue;
                    const dist = toroidalDistance(this.x, this.y, other.x, other.y, world.width, world.height);
                    if (dist < this.traits.senseRange * 0.65) {
                        const dx = wrapDelta(this.x - other.x, world.width);
                        const dy = wrapDelta(this.y - other.y, world.height);
                        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
                        this.vx += (dx / d) * this.traits.speed * 0.32;
                        this.vy += (dy / d) * this.traits.speed * 0.32;
                    }
                }
            }

            if (Math.random() < 0.018) {
                this.vx += (Math.random() - 0.5) * 0.07;
                this.vy += (Math.random() - 0.5) * 0.07;
            }

            const newX = this.x + this.vx;
            const newY = this.y + this.vy;
            if (!world.checkRockCollision(newX, newY, this.radius)) {
                this.x = newX; this.y = newY;
            } else {
                this.vx *= -0.5; this.vy *= -0.5;
            }

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const maxSpeed = this.traits.speed * 1.35;
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
            this.vx *= 0.98; this.vy *= 0.98;
            const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
            this.x = wrapped.x; this.y = wrapped.y;
        }

        const sizeCost = this.radius / 11;
        const speedCost = this.traits.speed / 0.14;
        const predatoryCost = 1 + this.traits.predatory * 0.35;
        this.energy -= EVOLUTION.BASE_ENERGY_DRAIN * sizeCost * speedCost * predatoryCost;

        if (this.energy < EVOLUTION.STARVATION_THRESHOLD) this.traits.speed *= 0.994;
        if (this.energy <= 0) { this.isAlive = false; this.canMove = false; }
    }

    canReproduce(world: PrimordialWorld): boolean {
        if (!this.isAlive || this.isMating) return false;
        const cost = this.traits.reproductiveStrategy === 'sexual' 
            ? EVOLUTION.SEXUAL_REPRODUCTION_COST 
            : EVOLUTION.ASEXUAL_REPRODUCTION_COST;
        const cooldown = this.traits.reproductiveStrategy === 'sexual'
            ? EVOLUTION.SEXUAL_REPRODUCTION_COOLDOWN
            : EVOLUTION.ASEXUAL_REPRODUCTION_COOLDOWN;
        return this.energy >= cost + 12 && world.time - this.lastReproduction >= cooldown;
    }

    reproduceAsexual(childId: number, world: PrimordialWorld, speciesId: number): ProkaryoteEntity {
        const catMod = world.getCatastropheModifiers();
        const { newRNA } = mutateRNA(this.genome, EVOLUTION.MUTATION_RATE * catMod.mutation);
        const angle = Math.random() * Math.PI * 2;
        const offspring = new ProkaryoteEntity(childId,
            this.x + Math.cos(angle) * (this.radius + 14),
            this.y + Math.sin(angle) * (this.radius + 14),
            this.generation + 1, this.id, newRNA, world.time, speciesId);
        this.children.push(childId);
        this.energy -= EVOLUTION.ASEXUAL_REPRODUCTION_COST;
        this.lastReproduction = world.time;
        return offspring;
    }

    reproduceSexual(mate: ProkaryoteEntity, childId: number, world: PrimordialWorld, speciesId: number): ProkaryoteEntity {
        const childGenome = crossoverGenomes(this.genome, mate.genome);
        const angle = Math.random() * Math.PI * 2;
        const midX = (this.x + mate.x) / 2;
        const midY = (this.y + mate.y) / 2;
        
        const offspring = new ProkaryoteEntity(childId,
            midX + Math.cos(angle) * 20,
            midY + Math.sin(angle) * 20,
            Math.max(this.generation, mate.generation) + 1,
            this.id, childGenome, world.time, speciesId);
        offspring.parent2 = mate.id;
        
        this.children.push(childId);
        mate.children.push(childId);
        
        const cost = EVOLUTION.SEXUAL_REPRODUCTION_COST / 2;
        this.energy -= cost;
        mate.energy -= cost;
        this.lastReproduction = world.time;
        mate.lastReproduction = world.time;
        
        return offspring;
    }
}

// ==================== EUKARYOTE ====================

export class EukaryoteOrganism implements EukaryoteEntity {
    id: number;
    name: string;
    x: number; y: number;
    vx: number; vy: number;
    energy = 110;
    mass = 6;
    radius: number;
    generation: number;
    genome: string;
    birthTime: number;
    isAlive = true;
    parent: number | null;
    parent2: number | null = null;
    children: number[] = [];
    canMove = true;
    lastReproduction: number;
    traits: OrganismTraits;
    age = 0;
    entityType: 'eukaryote' = 'eukaryote';
    speciesId: number;
    inColony: number | null = null;
    
    hasNucleus = true;
    hasMitochondria: boolean;
    hasChloroplast: boolean;
    organelleGenomes: string[] = [];
    compartments: number;
    ploidy: 1 | 2 = 2;
    
    isMating = false;
    mateId: number | null = null;
    matingProgress = 0;

    constructor(
        id: number, x: number, y: number, gen: number, parent: number | null,
        hostGenome: string, symbiontGenome: string,
        hasMito: boolean, hasChloro: boolean, birthTime: number, speciesId: number
    ) {
        this.id = id;
        this.name = `Ε${(id % 100).toString().padStart(2, '0')}`;
        this.x = x; this.y = y;
        this.generation = gen;
        this.genome = crossoverGenomes(hostGenome, symbiontGenome);
        this.parent = parent;
        this.birthTime = birthTime;
        this.lastReproduction = birthTime;
        this.speciesId = speciesId;
        this.hasMitochondria = hasMito;
        this.hasChloroplast = hasChloro;
        this.organelleGenomes = [symbiontGenome];
        this.compartments = 2 + (hasMito ? 1 : 0) + (hasChloro ? 1 : 0);
        
        this.traits = genomeToTraits(this.genome);
        this.traits.size *= 1.45;
        this.radius = this.traits.size;
        
        if (hasMito) {
            this.traits.metabolicEfficiency *= EVOLUTION.MITOCHONDRIA_BOOST;
            this.traits.aerobic = Math.min(1, this.traits.aerobic + 0.45);
        }
        if (hasChloro) {
            this.traits.photosynthetic = Math.min(1, this.traits.photosynthetic + 0.55);
        }
        
        this.traits.reproductiveStrategy = 'sexual';
        this.traits.matingDisplay = Math.min(1, this.traits.matingDisplay + 0.3);
        
        const vel = randomVelocity(this.traits.speed * 0.8);
        this.vx = vel.vx; this.vy = vel.vy;
    }

    update(world: PrimordialWorld, allOrganisms?: (ProkaryoteEntity | EukaryoteOrganism)[]) {
        if (!this.isAlive) return;
        this.age++;

        const zone = world.getZoneAt(this.x, this.y);
        const catMod = world.getCatastropheModifiers();
        let baseEnergy = world.consumeEnergyAt(this.x, this.y, 1.8 * this.traits.metabolicEfficiency) * catMod.energy;
        
        if (this.hasMitochondria) {
            baseEnergy *= EVOLUTION.MITOCHONDRIA_BOOST * (1 + world.getOxygenAt(this.x, this.y) * 0.004);
        }
        
        if (this.hasChloroplast && zone.lightLevel > 0.2) {
            const photoE = zone.lightLevel * this.traits.photosynthetic * EVOLUTION.CHLOROPLAST_BOOST;
            this.energy += photoE;
            world.addOxygenAt(this.x, this.y, photoE * 0.4);
        }
        
        this.energy += baseEnergy;

        if (catMod.death > 0 && Math.random() < catMod.death * 0.012) {
            this.isAlive = false; return;
        }

        if (this.isMating) {
            this.matingProgress++;
            if (this.matingProgress >= EVOLUTION.MATING_DURATION) {
                this.isMating = false;
                this.mateId = null;
                this.matingProgress = 0;
            }
        }

        if (this.canMove && !this.inColony && !this.isMating) {
            const flow = world.getFlowAt(this.x, this.y);
            this.vx += flow.fx * 0.035;
            this.vy += flow.fy * 0.035;

            if (Math.random() < 0.012) {
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vy += (Math.random() - 0.5) * 0.05;
            }

            const newX = this.x + this.vx;
            const newY = this.y + this.vy;
            if (!world.checkRockCollision(newX, newY, this.radius)) {
                this.x = newX; this.y = newY;
            } else {
                this.vx *= -0.5; this.vy *= -0.5;
            }
            this.vx *= 0.98; this.vy *= 0.98;
            const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
            this.x = wrapped.x; this.y = wrapped.y;
        }

        this.energy -= EVOLUTION.BASE_ENERGY_DRAIN * (this.radius / 14) * 0.7;
        if (this.energy <= 0) { this.isAlive = false; this.canMove = false; }
    }

    canReproduce(world: PrimordialWorld): boolean {
        return this.isAlive && !this.isMating &&
               this.energy >= EVOLUTION.SEXUAL_REPRODUCTION_COST + 25 &&
               world.time - this.lastReproduction >= EVOLUTION.SEXUAL_REPRODUCTION_COOLDOWN * 1.1;
    }

    reproduce(childId: number, world: PrimordialWorld, mate?: EukaryoteOrganism): EukaryoteOrganism {
        const childGenome = mate 
            ? crossoverGenomes(this.genome, mate.genome)
            : mutateRNA(this.genome, EVOLUTION.MUTATION_RATE).newRNA;
        
        const angle = Math.random() * Math.PI * 2;
        const offspring = new EukaryoteOrganism(childId,
            this.x + Math.cos(angle) * (this.radius + 22),
            this.y + Math.sin(angle) * (this.radius + 22),
            this.generation + 1, this.id,
            childGenome, this.organelleGenomes[0] || '',
            this.hasMitochondria, this.hasChloroplast, world.time, this.speciesId);
        
        if (mate) {
            offspring.parent2 = mate.id;
            mate.children.push(childId);
            mate.energy -= EVOLUTION.SEXUAL_REPRODUCTION_COST / 2;
            mate.lastReproduction = world.time;
        }
        
        this.children.push(childId);
        this.energy -= EVOLUTION.SEXUAL_REPRODUCTION_COST / (mate ? 2 : 1);
        this.lastReproduction = world.time;
        
        return offspring;
    }
}

// ==================== COLONY ====================

export class Colony implements ColonyEntity {
    id: number;
    x: number; y: number;
    energy = 0;
    radius: number;
    members: Map<number, ColonyMember> = new Map();
    cellCount = 0;
    isMulticellular = false;
    founderId: number;
    colonyGenome: string;
    speciesId: number;
    age = 0;
    cohesion = 0.25;
    differentiationLevel = 0;
    hasNervousSystem = false;

    constructor(id: number, founder: ProkaryoteEntity | EukaryoteOrganism) {
        this.id = id;
        this.founderId = founder.id;
        this.colonyGenome = founder.genome;
        this.speciesId = founder.speciesId;
        this.x = founder.x;
        this.y = founder.y;
        this.radius = founder.radius * 1.6;
        this.addMember(founder, 'stem', 0);
    }

    addMember(org: ProkaryoteEntity | EukaryoteOrganism, role: CellRole, worldTime: number) {
        this.members.set(org.id, {
            organismId: org.id,
            role,
            position: { x: wrapDelta(org.x - this.x, WORLD_WIDTH), y: wrapDelta(org.y - this.y, WORLD_HEIGHT) },
            joinTime: worldTime,
        });
        org.inColony = this.id;
        this.cellCount = this.members.size;
        this.updateRadius();
    }

    updateRadius() { this.radius = 22 + this.cellCount * 9; }

    differentiate(organisms: Map<number, ProkaryoteEntity | EukaryoteOrganism>) {
        if (this.cellCount < EVOLUTION.DIFFERENTIATION_MIN_CELLS) return;
        if (this.cohesion < EVOLUTION.DIFFERENTIATION_THRESHOLD) return;

        let changed = 0;
        for (const [id, member] of this.members) {
            if (member.role !== 'stem') continue;
            const org = organisms.get(id);
            if (!org) continue;

            let bestRole: CellRole = 'stem';
            if (org.traits.senseRange > 50 && Math.random() < 0.25) bestRole = 'sensor';
            else if (org.traits.speed > 0.14 && Math.random() < 0.25) bestRole = 'motor';
            else if (org.traits.metabolicEfficiency > 0.8 && Math.random() < 0.2) bestRole = 'digestive';
            else if (org.traits.cooperation > 0.6 && Math.random() < 0.15) bestRole = 'reproductive';
            else if (org.traits.defense > 0.5 && Math.random() < 0.2) bestRole = 'structural';
            else if (org.traits.photosynthetic > 0.4) bestRole = 'photosynthetic';
            else if (this.cellCount >= EVOLUTION.NERVOUS_SYSTEM_THRESHOLD && Math.random() < 0.1) bestRole = 'nerve';

            if (bestRole !== 'stem') {
                member.role = bestRole;
                changed++;
            }
        }

        if (changed > 0) {
            this.differentiationLevel = Math.min(1, this.differentiationLevel + changed * 0.12);
            if (this.differentiationLevel > 0.5) this.isMulticellular = true;
            
            let nerveCount = 0;
            for (const [, m] of this.members) if (m.role === 'nerve') nerveCount++;
            this.hasNervousSystem = nerveCount >= 2;
        }
    }

    update(world: PrimordialWorld, organisms: Map<number, ProkaryoteEntity | EukaryoteOrganism>) {
        this.age++;
        
        let sumX = 0, sumY = 0, count = 0;
        const memberOrgs: (ProkaryoteEntity | EukaryoteOrganism)[] = [];
        
        for (const [id] of this.members) {
            const org = organisms.get(id);
            if (org && org.isAlive) {
                memberOrgs.push(org);
                sumX += wrapDelta(org.x - this.x, world.width);
                sumY += wrapDelta(org.y - this.y, world.height);
                count++;
            } else {
                this.members.delete(id);
            }
        }
        
        this.cellCount = count;
        if (count === 0) return;

        this.x = ((this.x + sumX / count) % world.width + world.width) % world.width;
        this.y = ((this.y + sumY / count) % world.height + world.height) % world.height;

        for (const org of memberOrgs) {
            const dx = wrapDelta(this.x - org.x, world.width);
            const dy = wrapDelta(this.y - org.y, world.height);
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            
            if (dist > this.radius * 0.25 && dist < this.radius * 2) {
                org.vx += (dx / dist) * EVOLUTION.COLONY_COHESION_FORCE * this.cohesion;
                org.vy += (dy / dist) * EVOLUTION.COLONY_COHESION_FORCE * this.cohesion;
            }
        }

        this.cohesion = Math.min(1, this.cohesion + 0.00025);
        this.energy = memberOrgs.reduce((sum, o) => sum + o.energy, 0);
        this.updateRadius();

        if (this.age % 80 === 0) this.differentiate(organisms);
    }
}

// ==================== SIMULATION ENGINE ====================

export class SimulationEngine {
    world: PrimordialWorld;
    molecules: Molecule[] = [];
    bonds: Bond[] = [];
    protoCells: ProtoCell[] = [];
    luca: LUCAEntity | null = null;
    prokaryotes: ProkaryoteEntity[] = [];
    eukaryotes: EukaryoteOrganism[] = [];
    colonies: Colony[] = [];
    species: Map<number, Species> = new Map();
    
    nextId = 0;
    nextSpeciesId = 0;
    lucaBorn = false;
    moleculeMap: Map<number, Molecule> = new Map();
    organismMap: Map<number, ProkaryoteEntity | EukaryoteOrganism> = new Map();
    spatialHash: SpatialHash;
    
    maxBonds = 280;
    maxProtoCells = 5;
    
    stats: SimulationStats;
    milestones: Milestone[];
    eventHistory: HistoricalEvent[] = [];
    viewMode: ViewMode = 'molecular';
    camera: Camera = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 1, targetX: WORLD_WIDTH / 2, targetY: WORLD_HEIGHT / 2, targetZoom: 1 };
    selection: Selection = { type: null, id: null };
    frameCount = 0;
    moleculeCounts: Map<MoleculeType, number> = new Map();

    constructor() {
        this.world = new PrimordialWorld();
        this.spatialHash = new SpatialHash(WORLD_WIDTH, WORLD_HEIGHT, COLLISION_DISTANCE * 2.5);
        this.milestones = JSON.parse(JSON.stringify(MILESTONES));
        this.stats = {
            time: 0, totalBorn: 0, totalDeaths: 0, predationEvents: 0,
            endosymbiosisEvents: 0, sexualReproductionEvents: 0, speciationEvents: 0,
            extinctionEvents: 0, maxGeneration: 0, prokaryoteCount: 0,
            eukaryoteCount: 0, colonyCount: 0, speciesCount: 0, livingSpeciesCount: 0,
            totalCellsInColonies: 0, geneticDiversity: 0,
        };
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
        this.updateMoleculeCounts();
    }

    updateMoleculeCounts() {
        this.moleculeCounts.clear();
        for (const mol of this.molecules) {
            this.moleculeCounts.set(mol.type, (this.moleculeCounts.get(mol.type) || 0) + 1);
        }
    }

    achieveMilestone(id: string) {
        const m = this.milestones.find(m => m.id === id);
        if (m && !m.achieved) {
            m.achieved = true;
            m.time = this.world.time;
            this.eventHistory.push({
                time: this.world.time,
                type: 'milestone',
                title: m.name,
                description: m.description,
                icon: m.icon,
            });
        }
    }

    addEvent(type: HistoricalEvent['type'], title: string, description: string, icon: string, speciesId?: number) {
        this.eventHistory.push({ time: this.world.time, type, title, description, icon, speciesId });
        if (this.eventHistory.length > 100) this.eventHistory.shift();
    }

    createSpecies(founder: ProkaryoteEntity | EukaryoteOrganism | LUCAEntity, parentSpeciesId: number | null = null): Species {
        const parentSpecies = parentSpeciesId ? this.species.get(parentSpeciesId) : null;
        const species: Species = {
            id: this.nextSpeciesId++,
            name: generateSpeciesName(),
            founderId: founder.id,
            founderGenome: founder.genome,
            color: generateSpeciesColor(parentSpecies?.color),
            createdAt: this.world.time,
            memberCount: 1,
            extinctAt: null,
            parentSpeciesId,
            traits: { ...founder.traits },
            children: [],
        };
        
        this.species.set(species.id, species);
        
        if (parentSpecies) {
            parentSpecies.children.push(species.id);
        }
        
        this.stats.speciationEvents++;
        this.addEvent('speciation', `New Species: ${species.name}`, 
            `Diverged from ${parentSpecies?.name || 'ancestor'}`, '🌿', species.id);
        
        return species;
    }

    checkSpeciation(organism: ProkaryoteEntity | EukaryoteOrganism) {
        const species = this.species.get(organism.speciesId);
        if (!species) return;
        
        const genomeDist = genomeDistance(organism.genome, species.founderGenome);
        
        if (genomeDist > EVOLUTION.SPECIATION_THRESHOLD) {
            const allOrgs = [...this.prokaryotes, ...this.eukaryotes].filter(o => o.isAlive);
            let similarCount = 0;
            for (const other of allOrgs) {
                if (genomeDistance(organism.genome, other.genome) < EVOLUTION.SPECIATION_THRESHOLD * 0.5) {
                    similarCount++;
                }
            }
            
            if (similarCount >= EVOLUTION.MIN_POPULATION_FOR_SPECIATION) {
                const newSpecies = this.createSpecies(organism, organism.speciesId);
                organism.speciesId = newSpecies.id;
                
                for (const other of allOrgs) {
                    if (genomeDistance(organism.genome, other.genome) < EVOLUTION.SPECIATION_THRESHOLD * 0.5) {
                        other.speciesId = newSpecies.id;
                    }
                }
                
                this.achieveMilestone('first_species');
                if (this.world.phase === 'diversification') {
                    this.world.phase = 'speciation';
                }
            }
        }
    }

    updateSpeciesStats() {
        for (const species of this.species.values()) {
            species.memberCount = 0;
        }
        
        const allOrgs = [...this.prokaryotes, ...this.eukaryotes].filter(o => o.isAlive);
        for (const org of allOrgs) {
            const species = this.species.get(org.speciesId);
            if (species) species.memberCount++;
        }
        
        for (const species of this.species.values()) {
            if (species.memberCount === 0 && !species.extinctAt) {
                species.extinctAt = this.world.time;
                this.stats.extinctionEvents++;
                this.addEvent('extinction', `Extinction: ${species.name}`, 
                    `Species went extinct`, '💀', species.id);
            }
        }
        
        this.stats.speciesCount = this.species.size;
        this.stats.livingSpeciesCount = Array.from(this.species.values()).filter(s => !s.extinctAt).length;
        
        if (this.stats.livingSpeciesCount >= 10) {
            this.achieveMilestone('ten_species');
        }
    }

    rebuildSpatialHash() {
        this.spatialHash.clear();
        for (const mol of this.molecules) {
            this.spatialHash.insert(mol.id, mol.x, mol.y);
        }
    }

    applyBondForces() {
        for (let i = this.bonds.length - 1; i >= 0; i--) {
            const b = this.bonds[i];
            const m1 = this.moleculeMap.get(b.mol1);
            const m2 = this.moleculeMap.get(b.mol2);
            if (!m1 || !m2) { this.bonds.splice(i, 1); continue; }

            const dx = wrapDelta(m2.x - m1.x, this.world.width);
            const dy = wrapDelta(m2.y - m1.y, this.world.height);
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const rest = b.restLength || 8;

            if (dist > rest * 3.5 && Math.random() < 0.007) {
                this.bonds.splice(i, 1);
                m1.bondedTo.delete(b.mol2); m2.bondedTo.delete(b.mol1);
                m1.bonded = m1.bondedTo.size > 0; m2.bonded = m2.bondedTo.size > 0;
                continue;
            }

            const force = Math.max(-0.35, Math.min(0.35, -0.014 * (dist - rest)));
            const ux = dx / dist, uy = dy / dist;
            const total = m1.mass + m2.mass;
            m1.vx += ux * force * m2.mass / total;
            m1.vy += uy * force * m2.mass / total;
            m2.vx -= ux * force * m1.mass / total;
            m2.vy -= uy * force * m1.mass / total;
        }
    }

    checkChemistry() {
        const checked = new Set<string>();
        for (const mol1 of this.molecules) {
            for (const id2 of this.spatialHash.getNearby(mol1.x, mol1.y)) {
                if (id2 <= mol1.id) continue;
                const key = `${mol1.id}-${id2}`;
                if (checked.has(key)) continue;
                checked.add(key);
                const mol2 = this.moleculeMap.get(id2);
                if (!mol2 || mol1.bondedTo.has(mol2.id)) continue;
                if (toroidalDistance(mol1.x, mol1.y, mol2.x, mol2.y, this.world.width, this.world.height) < COLLISION_DISTANCE) {
                    this.tryReaction(mol1, mol2);
                }
            }
        }
    }

    tryReaction(mol1: Molecule, mol2: Molecule) {
        if (this.bonds.length >= this.maxBonds) return;
        const bonus = this.world.getCatalyticBonus((mol1.x + mol2.x) / 2, (mol1.y + mol2.y) / 2);

        if (mol1.type === 'amino_acid' && mol2.type === 'amino_acid') {
            if (Math.random() < BOND_PROBABILITIES.amino_acid_to_peptide * bonus) {
                this.createComplexMolecule('peptide', [mol1, mol2]);
                this.achieveMilestone('first_peptide');
                if (this.world.phase === 'primordial_soup') this.world.phase = 'synthesis';
            }
        } else if (mol1.type === 'nucleotide' && mol2.type === 'nucleotide') {
            if (Math.random() < BOND_PROBABILITIES.nucleotide_to_rna * bonus) {
                this.createComplexMolecule('rna_fragment', [mol1, mol2]);
                this.achieveMilestone('first_rna');
                if (this.world.phase === 'synthesis') this.world.phase = 'polymerization';
            }
        } else if (mol1.type === 'lipid' && mol2.type === 'lipid') {
            if (Math.random() < BOND_PROBABILITIES.lipid_to_membrane * bonus) {
                this.createBond(mol1, mol2, 'hydrophobic');
            }
        } else if (mol1.complexity >= 2 && mol2.complexity >= 2 && mol1.type !== mol2.type) {
            if (Math.random() < BOND_PROBABILITIES.cross_type_bond * bonus) {
                this.createBond(mol1, mol2, 'hydrogen');
            }
        } else if (mol1.complexity === 1 && mol2.complexity === 1) {
            if (Math.random() < BOND_PROBABILITIES.simple_to_building_block * bonus) {
                const types: MoleculeType[] = ['amino_acid', 'nucleotide', 'sugar', 'lipid'];
                this.createComplexMolecule(types[Math.floor(Math.random() * types.length)], [mol1, mol2]);
            }
        }
    }

    createBond(mol1: Molecule, mol2: Molecule, type: Bond['type']) {
        const dist = toroidalDistance(mol1.x, mol1.y, mol2.x, mol2.y, this.world.width, this.world.height);
        this.bonds.push({ mol1: mol1.id, mol2: mol2.id, strength: 0.7, type, restLength: Math.max(6, dist) });
        mol1.bondedTo.add(mol2.id); mol2.bondedTo.add(mol1.id);
        mol1.bonded = true; mol2.bonded = true;
    }

    createComplexMolecule(type: MoleculeType, reactants: Molecule[]) {
        const refX = reactants[0].x, refY = reactants[0].y;
        let sumDx = 0, sumDy = 0;
        for (const r of reactants) {
            sumDx += wrapDelta(r.x - refX, this.world.width);
            sumDy += wrapDelta(r.y - refY, this.world.height);
        }
        const avgX = ((refX + sumDx / reactants.length) % this.world.width + this.world.width) % this.world.width;
        const avgY = ((refY + sumDy / reactants.length) % this.world.height + this.world.height) % this.world.height;

        const newMol = new Molecule(this.nextId++, type, this.world);
        newMol.x = avgX; newMol.y = avgY;
        newMol.vx = (reactants[0].vx + reactants[1].vx) * 0.4;
        newMol.vy = (reactants[0].vy + reactants[1].vy) * 0.4;
        this.molecules.push(newMol);
        this.moleculeMap.set(newMol.id, newMol);

        const reactantIds = new Set(reactants.map(r => r.id));
        this.bonds = this.bonds.filter(b => !(reactantIds.has(b.mol1) && reactantIds.has(b.mol2)));
        for (const mol of reactants) {
            const idx = this.molecules.indexOf(mol);
            if (idx >= 0) this.molecules.splice(idx, 1);
            this.moleculeMap.delete(mol.id);
        }
    }

    tryFormProtoCells() {
        if (this.lucaBorn || this.protoCells.length >= this.maxProtoCells) return;
        const complexMols = this.molecules.filter(m => m.complexity >= 2 && m.bonded && !m.inProtoCell);
        if (complexMols.length < 5) return;

        const visited = new Set<number>();
        const clusters: number[][] = [];
        
        for (const mol of complexMols) {
            if (visited.has(mol.id)) continue;
            const cluster: number[] = [];
            const stack = [mol.id];
            while (stack.length > 0) {
                const id = stack.pop()!;
                if (visited.has(id)) continue;
                visited.add(id);
                const m = this.moleculeMap.get(id);
                if (!m || m.inProtoCell) continue;
                cluster.push(id);
                for (const bondedId of m.bondedTo) if (!visited.has(bondedId)) stack.push(bondedId);
            }
            if (cluster.length >= 5) clusters.push(cluster);
        }

        clusters.sort((a, b) => b.length - a.length);
        if (clusters.length > 0) {
            const cluster = clusters[0];
            const mols = cluster.map(id => this.moleculeMap.get(id)).filter(Boolean) as Molecule[];
            const refX = mols[0].x, refY = mols[0].y;
            let sumDx = 0, sumDy = 0;
            for (const m of mols) {
                sumDx += wrapDelta(m.x - refX, this.world.width);
                sumDy += wrapDelta(m.y - refY, this.world.height);
            }
            const cx = ((refX + sumDx / mols.length) % this.world.width + this.world.width) % this.world.width;
            const cy = ((refY + sumDy / mols.length) % this.world.height + this.world.height) % this.world.height;
            
            const proto = new ProtoCell(this.nextId++, cluster, cx, cy);
            this.protoCells.push(proto);
            for (const m of mols) m.inProtoCell = proto.id;
            
            this.achieveMilestone('first_protocell');
            if (['polymerization', 'synthesis'].includes(this.world.phase)) this.world.phase = 'self_assembly';
        }
    }

    checkSexualReproduction() {
        const allProkaryotes = this.prokaryotes.filter(p => p.isAlive && !p.isMating && p.canReproduce(this.world));
        
        for (const p1 of allProkaryotes) {
            if (p1.traits.reproductiveStrategy === 'asexual') continue;
            
            for (const p2 of allProkaryotes) {
                if (p1.id >= p2.id) continue;
                if (!p1.canMateWith(p2, this.species)) continue;
                
                const dist = toroidalDistance(p1.x, p1.y, p2.x, p2.y, this.world.width, this.world.height);
                if (dist > EVOLUTION.MATING_RANGE) continue;
                
                p1.isMating = true;
                p1.mateId = p2.id;
                p2.isMating = true;
                p2.mateId = p1.id;
                
                const speciesId = Math.random() < 0.5 ? p1.speciesId : p2.speciesId;
                const child = p1.reproduceSexual(p2, this.nextId++, this.world, speciesId);
                this.prokaryotes.push(child);
                this.organismMap.set(child.id, child);
                this.stats.totalBorn++;
                this.stats.sexualReproductionEvents++;
                this.stats.maxGeneration = Math.max(this.stats.maxGeneration, child.generation);
                
                this.achieveMilestone('sexual_reproduction');
                if (this.world.phase === 'diversification') {
                    this.world.phase = 'sexual_reproduction';
                }
                
                return;
            }
        }
    }

    checkEndosymbiosis() {
        const allProk = this.prokaryotes.filter(p => p.isAlive && !p.inColony);
        
        for (let i = 0; i < allProk.length; i++) {
            const host = allProk[i];
            for (let j = i + 1; j < allProk.length; j++) {
                const symbiont = allProk[j];
                
                const dist = toroidalDistance(host.x, host.y, symbiont.x, symbiont.y, this.world.width, this.world.height);
                if (dist > host.radius + symbiont.radius) continue;
                
                let canEngulf = host.canEngulf(symbiont);
                let actualHost = host, actualSymbiont = symbiont;
                
                if (!canEngulf && symbiont.canEngulf(host)) {
                    canEngulf = true;
                    actualHost = symbiont;
                    actualSymbiont = host;
                }
                
                if (canEngulf && Math.random() < EVOLUTION.ENDOSYMBIOSIS_CHANCE) {
                    const hasMito = actualSymbiont.traits.aerobic > 0.4;
                    const hasChloro = actualSymbiont.traits.photosynthetic > 0.4;
                    
                    const newSpecies = this.createSpecies(actualHost, actualHost.speciesId);
                    
                    const eukaryote = new EukaryoteOrganism(
                        this.nextId++, actualHost.x, actualHost.y,
                        Math.max(actualHost.generation, actualSymbiont.generation) + 1,
                        actualHost.id, actualHost.genome, actualSymbiont.genome,
                        hasMito, hasChloro, this.world.time, newSpecies.id
                    );
                    
                    this.eukaryotes.push(eukaryote);
                    this.organismMap.set(eukaryote.id, eukaryote);
                    
                    actualHost.isAlive = false;
                    actualSymbiont.isAlive = false;
                    
                    this.stats.endosymbiosisEvents++;
                    this.achieveMilestone('endosymbiosis');
                    this.achieveMilestone('first_eukaryote');
                    
                    this.addEvent('first_occurrence', 'Endosymbiosis!',
                        `${actualHost.name} engulfed ${actualSymbiont.name}`, '🔬');
                    
                    if (!['eukaryotes', 'colonial_life', 'multicellular'].includes(this.world.phase)) {
                        this.world.phase = 'endosymbiosis';
                    }
                    
                    return;
                }
            }
        }
    }

    checkColonyFormation() {
        const eligibleOrgs = [...this.prokaryotes, ...this.eukaryotes]
            .filter(o => o.isAlive && !o.inColony && o.traits.cooperation > EVOLUTION.COLONY_COOPERATION_THRESHOLD);
        
        for (const org1 of eligibleOrgs) {
            for (const org2 of eligibleOrgs) {
                if (org1.id >= org2.id) continue;
                
                const dist = toroidalDistance(org1.x, org1.y, org2.x, org2.y, this.world.width, this.world.height);
                if (dist > EVOLUTION.COLONY_RANGE) continue;
                
                let similarity = 0;
                const minLen = Math.min(org1.genome.length, org2.genome.length);
                for (let i = 0; i < minLen; i++) {
                    if (org1.genome[i] === org2.genome[i]) similarity++;
                }
                similarity /= minLen;
                
                if (similarity > 0.55 && Math.random() < 0.008 * org1.traits.cooperation * org2.traits.cooperation) {
                    const colony = new Colony(this.nextId++, org1);
                    colony.addMember(org2, 'stem', this.world.time);
                    this.colonies.push(colony);
                    
                    this.achieveMilestone('first_colony');
                    if (!['colonial_life', 'multicellular', 'cell_differentiation'].includes(this.world.phase)) {
                        this.world.phase = 'colonial_life';
                    }
                    return;
                }
            }
        }
        
        for (const colony of this.colonies) {
            if (colony.cellCount >= EVOLUTION.COLONY_MAX_SIZE) continue;
            
            for (const org of eligibleOrgs) {
                if (org.inColony) continue;
                
                const dist = toroidalDistance(org.x, org.y, colony.x, colony.y, this.world.width, this.world.height);
                if (dist > EVOLUTION.COLONY_RANGE * 1.4) continue;
                
                let similarity = 0;
                const minLen = Math.min(org.genome.length, colony.colonyGenome.length);
                for (let i = 0; i < minLen; i++) {
                    if (org.genome[i] === colony.colonyGenome[i]) similarity++;
                }
                similarity /= minLen;
                
                if (similarity > 0.5 && Math.random() < 0.004 * org.traits.cooperation) {
                    colony.addMember(org, 'stem', this.world.time);
                    break;
                }
            }
        }
    }

    checkPredation() {
        const allOrgs = [...this.prokaryotes, ...this.eukaryotes].filter(o => o.isAlive);
        
        for (const predator of allOrgs) {
            if (predator.traits.predatory < 0.35 || predator.entityType === 'eukaryote') continue;
            
            for (const prey of allOrgs) {
                if (predator.id === prey.id || !prey.isAlive) continue;
                if (prey.entityType !== 'prokaryote') continue;
                
                const dist = toroidalDistance(predator.x, predator.y, prey.x, prey.y, this.world.width, this.world.height);
                if (dist < predator.radius + prey.radius) {
                    if ((predator as ProkaryoteEntity).tryEat(prey as ProkaryoteEntity)) {
                        this.stats.predationEvents++;
                        this.stats.totalDeaths++;
                        this.achieveMilestone('first_predator');
                        
                        if (['diversification', 'early_life'].includes(this.world.phase)) {
                            this.world.phase = 'predation_emerges';
                        }
                        return;
                    }
                }
            }
        }
    }

    checkCatastrophes() {
        if (this.world.activeCatastrophe) return;
        if (this.world.time - this.world.lastCatastropheTime < EVOLUTION.CATASTROPHE_MIN_INTERVAL) return;
        
        if (this.prokaryotes.filter(p => p.isAlive).length < 15) return;
        
        if (Math.random() < EVOLUTION.CATASTROPHE_BASE_CHANCE) {
            const types: CatastropheType[] = ['meteor_impact', 'volcanic_winter', 'oxygen_spike', 'ice_age', 'toxic_bloom', 'solar_flare'];
            const type = types[Math.floor(Math.random() * types.length)];
            const catastrophe = this.world.triggerCatastrophe(type);
            const config = CATASTROPHE_CONFIG[type];
            
            this.addEvent('catastrophe', config.name, config.description, config.icon);
            this.achieveMilestone('mass_extinction');
        }
    }

    updateViewMode() {
        const totalOrgs = this.prokaryotes.filter(p => p.isAlive).length + this.eukaryotes.filter(e => e.isAlive).length;
        
        if (totalOrgs > 40 || this.colonies.length > 5) {
            this.viewMode = 'ecosystem';
        } else if (totalOrgs > 12 || this.lucaBorn) {
            this.viewMode = 'cellular';
        } else {
            this.viewMode = 'molecular';
        }
    }

    update() {
        this.frameCount++;
        this.world.update();
        this.rebuildSpatialHash();

        for (const mol of this.molecules) mol.update(this.world);
        this.applyBondForces();

        if (!this.lucaBorn && this.frameCount % 2 === 0) this.checkChemistry();
        if (!this.lucaBorn && this.frameCount % 12 === 0) this.tryFormProtoCells();

        for (let i = this.protoCells.length - 1; i >= 0; i--) {
            const p = this.protoCells[i];
            p.update(this.world, this.moleculeMap);
            
            if (p.shouldSplit()) {
                const newP = p.split(this.nextId++, this.moleculeMap, this.world);
                if (newP) this.protoCells.push(newP);
            }
            
            if (!this.lucaBorn && p.canBecomeLUCA()) {
                const lucaSpecies = this.createSpecies({ id: this.nextId, genome: p.rnaSequence, traits: {} as OrganismTraits } as any, null);
                this.luca = p.emergeLUCA(this.world, lucaSpecies.id);
                this.lucaBorn = true;
                this.world.phase = 'luca_emergence';
                this.achieveMilestone('luca');
                this.addEvent('first_occurrence', 'LUCA Emerges!', 'The Last Universal Common Ancestor', '⭐');
                
                for (const molId of p.molecules) {
                    const mol = this.moleculeMap.get(molId);
                    if (mol) {
                        const idx = this.molecules.indexOf(mol);
                        if (idx >= 0) this.molecules.splice(idx, 1);
                        this.moleculeMap.delete(molId);
                    }
                }
                this.protoCells.splice(i, 1);
            } else if (p.molecules.size < PROTOCELL.MIN_SIZE) {
                for (const molId of p.molecules) {
                    const mol = this.moleculeMap.get(molId);
                    if (mol) mol.inProtoCell = null;
                }
                this.protoCells.splice(i, 1);
            }
            
            if (p.stability > 30 && this.world.phase === 'self_assembly') this.world.phase = 'proto_life';
        }

        if (this.luca?.isAlive) {
            this.luca.update(this.world);
            if (this.luca.canReproduce(this.world) && this.prokaryotes.length < EVOLUTION.MAX_PROKARYOTES) {
                const offspring = this.luca.reproduce(this.nextId++, this.world, this.luca.speciesId);
                this.prokaryotes.push(offspring);
                this.organismMap.set(offspring.id, offspring);
                this.stats.totalBorn++;
                if (this.world.phase === 'luca_emergence') this.world.phase = 'early_life';
            }
        }

        const allOrgs = [...this.prokaryotes, ...this.eukaryotes];
        for (const org of this.prokaryotes) org.update(this.world, allOrgs);
        for (const org of this.eukaryotes) org.update(this.world, allOrgs);

        if (this.frameCount % 3 === 0) this.checkPredation();
        if (this.frameCount % 8 === 0) this.checkSexualReproduction();
        if (this.frameCount % 12 === 0) this.checkEndosymbiosis();
        if (this.frameCount % 18 === 0) this.checkColonyFormation();
        if (this.frameCount % 200 === 0) this.checkCatastrophes();

        for (let i = this.colonies.length - 1; i >= 0; i--) {
            const colony = this.colonies[i];
            colony.update(this.world, this.organismMap);
            
            if (colony.cellCount < EVOLUTION.COLONY_MIN_SIZE) {
                for (const [id] of colony.members) {
                    const org = this.organismMap.get(id);
                    if (org) org.inColony = null;
                }
                this.colonies.splice(i, 1);
            }
            
            if (colony.isMulticellular) {
                this.achieveMilestone('cell_specialization');
                if (colony.hasNervousSystem) {
                    this.achieveMilestone('nervous_system');
                }
                if (colony.differentiationLevel > 0.7 && colony.cellCount >= 10) {
                    this.achieveMilestone('multicellular');
                    if (this.world.phase !== 'multicellular' && this.world.phase !== 'cambrian_explosion') {
                        this.world.phase = 'multicellular';
                    }
                } else if (this.world.phase === 'colonial_life') {
                    this.world.phase = 'cell_differentiation';
                }
            }
        }

        const fertileProk = this.prokaryotes.filter(o => o.canReproduce(this.world) && !o.isMating && 
            (o.traits.reproductiveStrategy === 'asexual' || o.traits.reproductiveStrategy === 'both'));
        if (fertileProk.length > 0 && this.prokaryotes.length < EVOLUTION.MAX_PROKARYOTES) {
            const parent = fertileProk[Math.floor(Math.random() * fertileProk.length)];
            const child = parent.reproduceAsexual(this.nextId++, this.world, parent.speciesId);
            this.prokaryotes.push(child);
            this.organismMap.set(child.id, child);
            this.stats.totalBorn++;
            this.stats.maxGeneration = Math.max(this.stats.maxGeneration, child.generation);
            
            if (this.frameCount % 50 === 0) this.checkSpeciation(child);
            
            if (this.prokaryotes.length > 12 && this.world.phase === 'early_life') {
                this.world.phase = 'diversification';
            }
        }

        const fertileEuk = this.eukaryotes.filter(o => o.canReproduce(this.world) && !o.isMating);
        if (fertileEuk.length > 0 && this.eukaryotes.length < EVOLUTION.MAX_EUKARYOTES) {
            const parent = fertileEuk[Math.floor(Math.random() * fertileEuk.length)];
            let mate: EukaryoteOrganism | undefined;
            for (const other of fertileEuk) {
                if (other.id === parent.id) continue;
                const dist = toroidalDistance(parent.x, parent.y, other.x, other.y, this.world.width, this.world.height);
                if (dist < EVOLUTION.MATING_RANGE * 1.5) { mate = other; break; }
            }
            
            const child = parent.reproduce(this.nextId++, this.world, mate);
            this.eukaryotes.push(child);
            this.organismMap.set(child.id, child);
            this.stats.totalBorn++;
            if (mate) this.stats.sexualReproductionEvents++;
            
            if (this.eukaryotes.length > 4 && this.world.phase === 'endosymbiosis') {
                this.world.phase = 'eukaryotes';
            }
        }

        if (this.frameCount % 40 === 0) {
            const beforeProk = this.prokaryotes.length;
            this.prokaryotes = this.prokaryotes.filter(o => o.isAlive || o.age < 120);
            this.stats.totalDeaths += beforeProk - this.prokaryotes.length;
            
            const beforeEuk = this.eukaryotes.length;
            this.eukaryotes = this.eukaryotes.filter(o => o.isAlive || o.age < 160);
            this.stats.totalDeaths += beforeEuk - this.eukaryotes.length;
            
            this.organismMap.clear();
            for (const o of this.prokaryotes) this.organismMap.set(o.id, o);
            for (const o of this.eukaryotes) this.organismMap.set(o.id, o);
            
            this.updateMoleculeCounts();
            this.updateSpeciesStats();
        }

        this.stats.time = this.world.time;
        this.stats.prokaryoteCount = this.prokaryotes.filter(p => p.isAlive).length;
        this.stats.eukaryoteCount = this.eukaryotes.filter(e => e.isAlive).length;
        this.stats.colonyCount = this.colonies.length;
        this.stats.totalCellsInColonies = this.colonies.reduce((sum, c) => sum + c.cellCount, 0);

        if (this.stats.livingSpeciesCount >= 8 && this.colonies.some(c => c.isMulticellular) && 
            this.world.phase === 'multicellular') {
            this.world.phase = 'cambrian_explosion';
        }

        if (this.frameCount % 25 === 0) this.updateViewMode();
    }

    getPhylogeneticTree(): { nodes: any[]; links: any[] } {
        const nodes: any[] = [];
        const links: any[] = [];
        
        const speciesArray = Array.from(this.species.values());
        const rootSpecies = speciesArray.filter(s => !s.parentSpeciesId);
        
        let y = 0;
        const positionSpecies = (species: Species, x: number) => {
            species.treeX = x;
            species.treeY = y;
            nodes.push({
                id: species.id,
                name: species.name,
                x: x,
                y: y,
                color: species.color,
                extinct: !!species.extinctAt,
                memberCount: species.memberCount,
            });
            y += 40;
            
            for (const childId of species.children) {
                const child = this.species.get(childId);
                if (child) {
                    links.push({
                        source: species.id,
                        target: childId,
                    });
                    positionSpecies(child, x + 100);
                }
            }
        };
        
        for (const root of rootSpecies) {
            positionSpecies(root, 50);
            y += 20;
        }
        
        return { nodes, links };
    }
}

export type { MoleculeType, SimulationPhase, ViewMode, CellRole, Species, Catastrophe };