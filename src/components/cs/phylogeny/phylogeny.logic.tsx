import type {
    MoleculeType,
    MolecularEntity,
    ProtoLifeEntity,
    LivingEntity,
    OrganismTraits,
    Bond,
    SimulationPhase,
    HydrothermalVent,
    Rock,
    EnvironmentZone,
} from './phylogeny.config';

import {
    COLORS,
    RNA_BASES,
    AMINO_ACIDS,
    RNA_LENGTH,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    INITIAL_COUNTS,
    MOLECULE_SPEED,
    COLLISION_DISTANCE,
    BOND_PROBABILITIES,
    PEPTIDE_SIZE_FOR_METABOLISM,
    RNA_SIZE_FOR_REPLICATION,
    LIPID_COUNT_FOR_MEMBRANE,
    PROTOCELL_STABILITY_FOR_LUCA,
    PROTOCELL_MAX_SIZE,
    PROTOCELL_MIN_SIZE,
    PROTOCELL_MERGE_DISTANCE,
    PROTOCELL_MERGE_COOLDOWN,
    EVOLUTION,
    GENOME_REGIONS,
} from './phylogeny.config';

// ==================== SPATIAL HASH GRID ====================

class SpatialHash {
    private cellSize: number;
    private grid: Map<string, Set<number>> = new Map();
    private width: number;
    private height: number;

    constructor(width: number, height: number, cellSize: number = 40) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }

    private getKey(x: number, y: number): string {
        const cx = Math.floor(((x % this.width) + this.width) % this.width / this.cellSize);
        const cy = Math.floor(((y % this.height) + this.height) % this.height / this.cellSize);
        return `${cx},${cy}`;
    }

    clear() {
        this.grid.clear();
    }

    insert(id: number, x: number, y: number) {
        const key = this.getKey(x, y);
        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
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
                const key = `${ncx},${ncy}`;
                const cell = this.grid.get(key);
                if (cell) {
                    for (const id of cell) {
                        results.push(id);
                    }
                }
            }
        }
        return results;
    }
}

// ==================== HELPER FUNCTIONS ====================

export function generateRNA(length: number): string {
    return Array.from({ length }, () => RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)]).join('');
}

export function mutateRNA(rna: string, rate: number): { newRNA: string; mutations: number } {
    let mutations = 0;
    const newRNA = rna
        .split('')
        .map((base) => {
            if (Math.random() < rate) {
                mutations++;
                return RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)];
            }
            return base;
        })
        .join('');
    return { newRNA, mutations };
}

// Convert genome region to 0-1 value
function genomeRegionToValue(genome: string, start: number, end: number): number {
    let value = 0;
    for (let i = start; i < end && i < genome.length; i++) {
        const base = genome[i];
        const baseValue = base === 'A' ? 0 : base === 'U' ? 1 : base === 'C' ? 2 : 3;
        value += baseValue / 4;
    }
    return value / (end - start);
}

// Better genome-to-traits mapping
export function genomeToTraits(genome: string): OrganismTraits {
    const metabolism = genomeRegionToValue(genome, GENOME_REGIONS.METABOLISM[0], GENOME_REGIONS.METABOLISM[1]);
    const speed = genomeRegionToValue(genome, GENOME_REGIONS.SPEED[0], GENOME_REGIONS.SPEED[1]);
    const size = genomeRegionToValue(genome, GENOME_REGIONS.SIZE[0], GENOME_REGIONS.SIZE[1]);
    const predatory = genomeRegionToValue(genome, GENOME_REGIONS.PREDATORY[0], GENOME_REGIONS.PREDATORY[1]);
    const defense = genomeRegionToValue(genome, GENOME_REGIONS.DEFENSE[0], GENOME_REGIONS.DEFENSE[1]);
    const cooperation = genomeRegionToValue(genome, GENOME_REGIONS.COOPERATION[0], GENOME_REGIONS.COOPERATION[1]);

    // Color based on predatory vs cooperation balance
    const hue = predatory > 0.5 ? 0 + predatory * 30 : 120 + cooperation * 60; // Red for predators, green/cyan for cooperators
    const saturation = 60 + metabolism * 30;
    const lightness = 45 + defense * 15;

    return {
        metabolicEfficiency: 0.5 + metabolism * 0.8,
        speed: 0.1 + speed * 0.2,
        size: 10 + size * 12,
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        predatory,
        defense,
        cooperation,
        senseRange: 40 + predatory * 60, // Predators have better senses
    };
}

export function randomPosition(width: number, height: number, padding: number = 40) {
    return {
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
    };
}

export function randomVelocity(maxSpeed: number = MOLECULE_SPEED) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * maxSpeed;
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
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
    return {
        x: ((x % w) + w) % w,
        y: ((y % h) + h) % h,
    };
}

export function getComplexity(type: MoleculeType): number {
    if (['water', 'carbon', 'nitrogen', 'oxygen'].includes(type)) return 1;
    if (['amino_acid', 'nucleotide', 'lipid', 'sugar'].includes(type)) return 2;
    return 3;
}

function lerpToroidal(a: number, b: number, t: number, size: number): number {
    const delta = wrapDelta(b - a, size);
    let result = a + delta * t;
    return ((result % size) + size) % size;
}

// ==================== WORLD CLASS ====================

export class PrimordialWorld {
    width: number;
    height: number;
    time: number = 0;
    phase: SimulationPhase = 'primordial_soup';
    energyField: number[][];
    temperature: number = 85;
    vents: HydrothermalVent[] = [];
    rocks: Rock[] = [];
    zones: EnvironmentZone[] = [];
    rotationSpeed: number = 0.0008;
    
    // Track total available energy for scarcity
    totalEnergy: number = 0;
    maxEnergy: number = 0;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.energyField = Array(Math.ceil(h / 30))
            .fill(0)
            .map(() => Array(Math.ceil(w / 30)).fill(50 + Math.random() * 30));

        this.vents = [
            { x: w * 0.25, y: h * 0.35, strength: 1.3, phase: 0 },
            { x: w * 0.68, y: h * 0.55, strength: 1.1, phase: Math.PI },
            { x: w * 0.48, y: h * 0.75, strength: 1.2, phase: Math.PI * 0.5 },
        ];

        // Create environmental zones around vents
        for (const vent of this.vents) {
            this.zones.push({
                x: vent.x,
                y: vent.y,
                radius: 60,
                type: 'vent_hot',
                energyRate: 3.0,
                temperature: 100,
                lightLevel: 0,
            });
            this.zones.push({
                x: vent.x,
                y: vent.y,
                radius: 120,
                type: 'vent_warm',
                energyRate: 1.5,
                temperature: 60,
                lightLevel: 0,
            });
        }

        // Open water zone (default)
        this.zones.push({
            x: w / 2,
            y: h / 2,
            radius: Math.max(w, h),
            type: 'open_water',
            energyRate: 0.3,
            temperature: 25,
            lightLevel: 0.2,
        });

        this.createVentTopology();
        this.calculateTotalEnergy();
        this.maxEnergy = this.totalEnergy * 1.2;
    }

    calculateTotalEnergy() {
        this.totalEnergy = 0;
        for (const row of this.energyField) {
            for (const cell of row) {
                this.totalEnergy += cell;
            }
        }
    }

    createVentTopology() {
        for (const vent of this.vents) {
            for (let ring = 0; ring < 2; ring++) {
                const ringRadius = 25 + ring * 20;
                const rocksInRing = 5 + ring * 2;

                for (let i = 0; i < rocksInRing; i++) {
                    const angle = (i / rocksInRing) * Math.PI * 2;
                    const wobble = (Math.random() - 0.5) * 8;
                    const rx = vent.x + Math.cos(angle) * (ringRadius + wobble);
                    const ry = vent.y + Math.sin(angle) * (ringRadius + wobble);

                    this.rocks.push({
                        x: ((rx % this.width) + this.width) % this.width,
                        y: ((ry % this.height) + this.height) % this.height,
                        radius: 5 + Math.random() * 5,
                        roughness: 0.7 + Math.random() * 0.3,
                        type: 'chimney',
                    });
                }
            }

            const boulders = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < boulders; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 70 + Math.random() * 80;
                const rx = vent.x + Math.cos(angle) * dist;
                const ry = vent.y + Math.sin(angle) * dist;

                this.rocks.push({
                    x: ((rx % this.width) + this.width) % this.width,
                    y: ((ry % this.height) + this.height) % this.height,
                    radius: 10 + Math.random() * 12,
                    roughness: 0.4 + Math.random() * 0.4,
                    type: 'boulder',
                });
            }
        }
    }

    getZoneAt(x: number, y: number): EnvironmentZone {
        // Find most specific zone (smallest radius that contains point)
        let bestZone = this.zones[this.zones.length - 1]; // Default to open water
        let bestRadius = Infinity;
        
        for (const zone of this.zones) {
            const dist = toroidalDistance(x, y, zone.x, zone.y, this.width, this.height);
            if (dist < zone.radius && zone.radius < bestRadius) {
                bestZone = zone;
                bestRadius = zone.radius;
            }
        }
        return bestZone;
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

    getCatalyticBonus(x: number, y: number): number {
        let multiplier = 1.0;

        const ventCheck = this.isNearVent(x, y, 100);
        if (ventCheck.near) {
            const ventFactor = 1 - (ventCheck.distance / 100);
            multiplier *= (1 + BOND_PROBABILITIES.vent_multiplier * ventFactor);
        }

        for (const rock of this.rocks) {
            const dist = toroidalDistance(x, y, rock.x, rock.y, this.width, this.height);
            if (dist < rock.radius + 25) {
                const rockFactor = Math.max(0, 1 - (dist - rock.radius) / 25);
                multiplier *= (1 + BOND_PROBABILITIES.rock_multiplier * rockFactor * rock.roughness);
                break;
            }
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
            this.totalEnergy -= consumed;
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
        fx += -this.rotationSpeed * dyC;
        fy += this.rotationSpeed * dxC;

        for (const vent of this.vents) {
            const dx = wrapDelta(x - vent.x, this.width);
            const dy = wrapDelta(y - vent.y, this.height);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5 || dist > 150) continue;

            const pulse = Math.sin(this.time * 0.05 + vent.phase) * 0.25 + 0.75;
            const radialStrength = (1 - dist / 150) * vent.strength * pulse * 0.5;
            const angle = Math.atan2(dy, dx);
            fx += Math.cos(angle) * radialStrength;
            fy += Math.sin(angle) * radialStrength;
        }

        return { fx, fy };
    }

    update() {
        this.time++;

        if (this.temperature > 40) {
            this.temperature *= 0.9998;
        }

        // Energy regeneration - REDUCED for scarcity
        if (this.time % 80 === 0 && this.totalEnergy < this.maxEnergy * 0.8) {
            for (let y = 0; y < this.energyField.length; y++) {
                for (let x = 0; x < this.energyField[y].length; x++) {
                    const cellX = x * 30 + 15;
                    const cellY = y * 30 + 15;
                    const zone = this.getZoneAt(cellX, cellY);
                    
                    let regen = zone.energyRate * 0.5;
                    
                    // Extra boost near vents
                    for (const vent of this.vents) {
                        const dist = toroidalDistance(cellX, cellY, vent.x, vent.y, this.width, this.height);
                        if (dist < 100) {
                            regen += (1 - dist / 100) * 4 * vent.strength;
                        }
                    }

                    const newEnergy = Math.min(80, this.energyField[y][x] + regen);
                    this.totalEnergy += newEnergy - this.energyField[y][x];
                    this.energyField[y][x] = newEnergy;
                }
            }
        }
    }
}

// ==================== MOLECULE CLASS ====================

export class Molecule implements MolecularEntity {
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
    age: number = 0;
    inProtoCell: number | null = null;

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

        this.radius = 2 + this.complexity * 1.5;

        let pos = randomPosition(world.width, world.height);
        for (let attempts = 0; attempts < 10; attempts++) {
            if (!world.checkRockCollision(pos.x, pos.y, this.radius + 2)) break;
            pos = randomPosition(world.width, world.height);
        }

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
        this.age++;
        
        const movementReduction = Math.min(this.bondedTo.size * 0.2, 0.8);
        const speedMult = 1 - movementReduction;

        const flow = world.getFlowAt(this.x, this.y);
        this.vx += flow.fx * 0.08;
        this.vy += flow.fy * 0.08;

        const newX = this.x + this.vx * speedMult;
        const newY = this.y + this.vy * speedMult;

        const collision = world.checkRockCollision(newX, newY, this.radius);
        if (collision) {
            const dx = wrapDelta(this.x - collision.x, world.width);
            const dy = wrapDelta(this.y - collision.y, world.height);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.001) {
                const nx = dx / dist;
                const ny = dy / dist;
                const dot = this.vx * nx + this.vy * ny;
                this.vx = (this.vx - 2 * dot * nx) * 0.5;
                this.vy = (this.vy - 2 * dot * ny) * 0.5;
            }
        } else {
            this.x = newX;
            this.y = newY;
        }

        const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
        this.x = wrapped.x;
        this.y = wrapped.y;

        this.vx *= 0.992;
        this.vy *= 0.992;
    }
}

// ==================== PROTOCELL CLASS ====================

export class ProtoCell implements ProtoLifeEntity {
    id: number;
    molecules: Set<number>;
    rnaSequence: string = '';
    hasMembrane: boolean = false;
    hasMetabolism: boolean = false;
    canReplicate: boolean = false;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    vx: number = 0;
    vy: number = 0;
    energy: number;
    radius = 28;
    stability: number = 0;
    age = 0;
    lastMergeTime = 0;  // For merge cooldown
    
    peptideCount = 0;
    rnaCount = 0;
    lipidCount = 0;
    aminoAcidCount = 0;
    nucleotideCount = 0;
    sugarCount = 0;

    constructor(id: number, mols: number[], x: number, y: number) {
        this.id = id;
        this.molecules = new Set(mols);
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.energy = 100;
    }

    canMerge(worldTime: number): boolean {
        return worldTime - this.lastMergeTime > PROTOCELL_MERGE_COOLDOWN;
    }

    update(world: PrimordialWorld, moleculeMap: Map<number, Molecule>) {
        this.age++;

        const mols: Molecule[] = [];
        for (const id of this.molecules) {
            const mol = moleculeMap.get(id);
            if (mol) {
                mol.inProtoCell = this.id;
                mols.push(mol);
            }
        }

        if (mols.length < this.molecules.size) {
            this.molecules = new Set(mols.map(m => m.id));
        }

        if (mols.length > 0) {
            let sumX = 0, sumY = 0;
            const refX = mols[0].x;
            const refY = mols[0].y;
            
            for (const m of mols) {
                sumX += wrapDelta(m.x - refX, world.width);
                sumY += wrapDelta(m.y - refY, world.height);
            }
            
            this.targetX = ((refX + sumX / mols.length) % world.width + world.width) % world.width;
            this.targetY = ((refY + sumY / mols.length) % world.height + world.height) % world.height;
        }

        // Smoother interpolation - REDUCED jitter
        const smoothing = 0.05;  // Lower = smoother
        this.x = lerpToroidal(this.x, this.targetX, smoothing, world.width);
        this.y = lerpToroidal(this.y, this.targetY, smoothing, world.height);

        // Count types
        this.peptideCount = 0;
        this.rnaCount = 0;
        this.lipidCount = 0;
        this.aminoAcidCount = 0;
        this.nucleotideCount = 0;
        this.sugarCount = 0;

        for (const m of mols) {
            switch (m.type) {
                case 'peptide': this.peptideCount++; break;
                case 'rna_fragment': this.rnaCount++; break;
                case 'lipid': 
                case 'membrane_vesicle': this.lipidCount++; break;
                case 'amino_acid': this.aminoAcidCount++; break;
                case 'nucleotide': this.nucleotideCount++; break;
                case 'sugar': this.sugarCount++; break;
            }
        }

        this.hasMembrane = this.lipidCount >= LIPID_COUNT_FOR_MEMBRANE;
        this.hasMetabolism = this.peptideCount >= PEPTIDE_SIZE_FOR_METABOLISM;
        this.canReplicate = this.rnaCount >= RNA_SIZE_FOR_REPLICATION;

        const rnaMols = mols.filter((m) => m.type === 'nucleotide' || m.type === 'rna_fragment');
        this.rnaSequence = rnaMols.map((m) => m.symbol).join('');

        let baseStability = 10;
        if (this.hasMembrane) baseStability += 25;
        if (this.hasMetabolism) baseStability += 20;
        if (this.canReplicate) baseStability += 20;
        
        const typeCount = [this.lipidCount > 0, this.peptideCount > 0, this.rnaCount > 0, 
                          this.aminoAcidCount > 0, this.nucleotideCount > 0].filter(Boolean).length;
        baseStability += typeCount * 5;
        baseStability += Math.min(mols.length * 0.3, 8);

        this.stability = Math.min(100, baseStability + this.age * 0.03);
        
        this.energy += world.consumeEnergyAt(this.x, this.y, this.hasMetabolism ? 3 : 1.5);
        this.energy = Math.min(150, this.energy);

        // Keep molecules nearby
        for (const mol of mols) {
            const dx = wrapDelta(this.x - mol.x, world.width);
            const dy = wrapDelta(this.y - mol.y, world.height);
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > this.radius * 0.6) {
                const pull = 0.025;
                mol.vx += (dx / dist) * pull;
                mol.vy += (dy / dist) * pull;
            }
        }

        this.radius = Math.max(22, 18 + mols.length * 0.7);
    }

    shouldSplit(): boolean {
        return this.molecules.size > PROTOCELL_MAX_SIZE;
    }

    split(nextId: number, moleculeMap: Map<number, Molecule>, world: PrimordialWorld): ProtoCell | null {
        const molArray = Array.from(this.molecules);
        if (molArray.length < PROTOCELL_MIN_SIZE * 2) return null;

        const halfSize = Math.floor(molArray.length / 2);
        const newMols = molArray.slice(halfSize);
        
        this.molecules = new Set(molArray.slice(0, halfSize));

        const angle = Math.random() * Math.PI * 2;
        const offset = this.radius + 15;  // Increased offset
        const newX = ((this.x + Math.cos(angle) * offset) % world.width + world.width) % world.width;
        const newY = ((this.y + Math.sin(angle) * offset) % world.height + world.height) % world.height;

        const newProto = new ProtoCell(nextId, newMols, newX, newY);
        newProto.lastMergeTime = world.time;  // Prevent immediate re-merge
        
        for (const molId of newMols) {
            const mol = moleculeMap.get(molId);
            if (mol) mol.inProtoCell = nextId;
        }

        return newProto;
    }

    canBecomeLUCA(): boolean {
        return (
            this.hasMembrane &&
            this.hasMetabolism &&
            this.canReplicate &&
            this.stability >= PROTOCELL_STABILITY_FOR_LUCA &&
            this.age > 120
        );
    }

    emergeLUCA(world: PrimordialWorld): LUCAEntity {
        let genome = this.rnaSequence;
        if (genome.length < RNA_LENGTH) genome += generateRNA(RNA_LENGTH - genome.length);
        else genome = genome.slice(0, RNA_LENGTH);
        return new LUCAEntity(this.id, this.x, this.y, genome, world.time);
    }

    getDiversity(): number {
        let count = 0;
        if (this.lipidCount > 0) count++;
        if (this.peptideCount > 0) count++;
        if (this.rnaCount > 0) count++;
        if (this.aminoAcidCount > 0) count++;
        if (this.nucleotideCount > 0) count++;
        if (this.sugarCount > 0) count++;
        return count;
    }
}

// ==================== LUCA CLASS ====================

export class LUCAEntity implements LivingEntity {
    id: number;
    x: number;
    y: number;
    vx = 0;
    vy = 0;
    energy = 150;
    mass = 8;
    radius = 35;
    generation = 0;
    genome: string;
    birthTime: number;
    isAlive = true;
    parent = null;
    children: number[] = [];
    canMove = false;
    lastReproduction = 0;
    traits: OrganismTraits;
    age = 0;

    constructor(id: number, x: number, y: number, rna: string, birthTime: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.genome = rna;
        this.birthTime = birthTime;
        this.lastReproduction = birthTime;
        this.traits = {
            metabolicEfficiency: 1.2,
            speed: 0.15,
            size: 35,
            color: COLORS.luca,
            predatory: 0,
            defense: 0.5,
            cooperation: 0.5,
            senseRange: 60,
        };
    }

    update(world: PrimordialWorld) {
        if (!this.isAlive) return;
        this.age++;

        // Get energy from environment (reduced from before)
        const zone = world.getZoneAt(this.x, this.y);
        const envEnergy = world.consumeEnergyAt(this.x, this.y, 3 * this.traits.metabolicEfficiency);
        this.energy += envEnergy * (zone.energyRate / 2);
        
        // Metabolism cost
        this.energy -= EVOLUTION.BASE_ENERGY_DRAIN;

        if (this.energy <= 0) {
            this.isAlive = false;
            return;
        }

        if (this.energy > 80 && !this.canMove) {
            this.canMove = true;
            const vel = randomVelocity(0.1);
            this.vx = vel.vx;
            this.vy = vel.vy;
        }

        if (this.canMove) {
            const flow = world.getFlowAt(this.x, this.y);
            this.vx += flow.fx * 0.05;
            this.vy += flow.fy * 0.05;

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
                    this.vx = (this.vx - 2 * dot * nx) * 0.6;
                    this.vy = (this.vy - 2 * dot * ny) * 0.6;
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
        return this.energy >= EVOLUTION.REPRODUCTION_ENERGY_COST + 30 && 
               world.time - this.lastReproduction >= EVOLUTION.REPRODUCTION_COOLDOWN;
    }

    reproduce(childId: number, world: PrimordialWorld): OrganismEntity {
        const { newRNA } = mutateRNA(this.genome, EVOLUTION.MUTATION_RATE);
        const angle = Math.random() * Math.PI * 2;
        const dist = this.radius + 25;
        
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
        this.energy -= EVOLUTION.REPRODUCTION_ENERGY_COST;
        this.lastReproduction = world.time;
        
        return offspring;
    }
}

// ==================== ORGANISM CLASS ====================

export class OrganismEntity implements LivingEntity {
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
    age = 0;
    
    // Behavior state
    huntTarget: number | null = null;
    fleeFrom: number | null = null;

    constructor(id: number, x: number, y: number, gen: number, parent: number | null, rna: string, birthTime: number) {
        this.id = id;
        this.name = this.generateName(gen, id);
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

    private generateName(gen: number, id: number): string {
        const prefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const prefix = prefixes[gen % prefixes.length];
        return `${prefix}${(id % 100).toString().padStart(2, '0')}`;
    }

    // Check if this organism can eat another
    canEat(other: OrganismEntity): boolean {
        if (!this.isAlive || !other.isAlive) return false;
        if (this.traits.predatory < 0.3) return false;  // Not predatory enough
        if (this.radius < other.radius * EVOLUTION.PREDATION_SIZE_RATIO) return false;  // Too small
        return true;
    }

    // Attempt to eat another organism
    tryEat(other: OrganismEntity): boolean {
        if (!this.canEat(other)) return false;
        
        // Success based on relative traits
        const attackPower = this.traits.predatory * (this.radius / other.radius);
        const defensePower = other.traits.defense * (1 + other.traits.speed);
        const successChance = EVOLUTION.PREDATION_SUCCESS_BASE * (attackPower / (attackPower + defensePower));
        
        if (Math.random() < successChance) {
            // Successful predation!
            this.energy += other.energy * EVOLUTION.ENERGY_FROM_PREDATION;
            other.isAlive = false;
            other.canMove = false;
            return true;
        }
        return false;
    }

    update(world: PrimordialWorld, allOrganisms?: OrganismEntity[]) {
        if (!this.isAlive) return;
        this.age++;

        // Get energy from environment
        const zone = world.getZoneAt(this.x, this.y);
        const baseEnergy = world.consumeEnergyAt(this.x, this.y, 1.5 * this.traits.metabolicEfficiency);
        
        // Non-predators get more from environment (autotrophs)
        const autotrophBonus = (1 - this.traits.predatory) * 0.5;
        this.energy += baseEnergy * (1 + autotrophBonus);

        // Movement and behavior
        if (this.canMove && allOrganisms) {
            const flow = world.getFlowAt(this.x, this.y);
            this.vx += flow.fx * 0.06;
            this.vy += flow.fy * 0.06;

            // Predator behavior: hunt smaller organisms
            if (this.traits.predatory > 0.4) {
                let nearestPrey: OrganismEntity | null = null;
                let nearestDist = this.traits.senseRange;
                
                for (const other of allOrganisms) {
                    if (other.id === this.id || !other.isAlive) continue;
                    if (!this.canEat(other)) continue;
                    
                    const dist = toroidalDistance(this.x, this.y, other.x, other.y, world.width, world.height);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestPrey = other;
                    }
                }
                
                if (nearestPrey) {
                    // Move toward prey
                    const dx = wrapDelta(nearestPrey.x - this.x, world.width);
                    const dy = wrapDelta(nearestPrey.y - this.y, world.height);
                    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
                    this.vx += (dx / dist) * this.traits.speed * 0.3;
                    this.vy += (dy / dist) * this.traits.speed * 0.3;
                }
            }
            
            // Prey behavior: flee from larger organisms
            if (this.traits.defense > 0.3) {
                for (const other of allOrganisms) {
                    if (other.id === this.id || !other.isAlive) continue;
                    if (other.traits.predatory < 0.3) continue;
                    if (other.radius < this.radius * EVOLUTION.PREDATION_SIZE_RATIO) continue;
                    
                    const dist = toroidalDistance(this.x, this.y, other.x, other.y, world.width, world.height);
                    if (dist < this.traits.senseRange * 0.8) {
                        // Flee!
                        const dx = wrapDelta(this.x - other.x, world.width);
                        const dy = wrapDelta(this.y - other.y, world.height);
                        const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
                        this.vx += (dx / d) * this.traits.speed * 0.4;
                        this.vy += (dy / d) * this.traits.speed * 0.4;
                    }
                }
            }

            // Random wandering
            if (Math.random() < 0.02) {
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
            }

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
                    this.vx = (this.vx - 2 * dot * nx) * 0.6;
                    this.vy = (this.vy - 2 * dot * ny) * 0.6;
                }
            } else {
                this.x = newX;
                this.y = newY;
            }

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const maxSpeed = this.traits.speed * 1.5;
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }

            this.vx *= 0.98;
            this.vy *= 0.98;

            const wrapped = wrapPosition(this.x, this.y, world.width, world.height);
            this.x = wrapped.x;
            this.y = wrapped.y;
        }

        // Energy costs - predators pay more
        const sizeCost = this.traits.size / 15;
        const speedCost = this.traits.speed / 0.2;
        const predatoryCost = 1 + this.traits.predatory * 0.5;
        this.energy -= EVOLUTION.BASE_ENERGY_DRAIN * sizeCost * speedCost * predatoryCost;
        
        // Starvation
        if (this.energy < EVOLUTION.STARVATION_THRESHOLD) {
            this.traits.speed *= 0.99;  // Weaken
        }
        
        if (this.energy <= 0) {
            this.isAlive = false;
            this.canMove = false;
        }
    }

    canReproduce(world: PrimordialWorld): boolean {
        return this.isAlive && 
               this.energy >= EVOLUTION.REPRODUCTION_ENERGY_COST + 20 && 
               world.time - this.lastReproduction >= EVOLUTION.REPRODUCTION_COOLDOWN;
    }

    reproduce(childId: number, world: PrimordialWorld): OrganismEntity {
        const { newRNA } = mutateRNA(this.genome, EVOLUTION.MUTATION_RATE);
        const angle = Math.random() * Math.PI * 2;
        const dist = this.radius + 18;
        
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
        this.energy -= EVOLUTION.REPRODUCTION_ENERGY_COST;
        this.lastReproduction = world.time;
        
        return offspring;
    }
}

// ==================== SIMULATION ENGINE ====================

export class SimulationEngine {
    world: PrimordialWorld;
    molecules: Molecule[] = [];
    bonds: Bond[] = [];
    protoCells: ProtoCell[] = [];
    luca: LUCAEntity | null = null;
    organisms: OrganismEntity[] = [];
    nextId = 0;
    lucaBorn = false;
    moleculeMap: Map<number, Molecule> = new Map();
    spatialHash: SpatialHash;
    
    bondSpringK: number = 0.015;
    bondBreakProbability: number = 0.008;
    maxBonds: number = 350;
    maxProtoCells: number = 6;
    
    totalBorn = 0;
    totalDeaths = 0;
    predationEvents = 0;
    maxGeneration = 0;
    frameCount = 0;
    
    moleculeCounts: Map<MoleculeType, number> = new Map();

    constructor() {
        this.world = new PrimordialWorld(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.spatialHash = new SpatialHash(CANVAS_WIDTH, CANVAS_HEIGHT, COLLISION_DISTANCE * 2);
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
            const count = this.moleculeCounts.get(mol.type) || 0;
            this.moleculeCounts.set(mol.type, count + 1);
        }
    }

    rebuildSpatialHash() {
        this.spatialHash.clear();
        for (const mol of this.molecules) {
            this.spatialHash.insert(mol.id, mol.x, mol.y);
        }
    }

    applyBondForces() {
        if (this.bonds.length === 0) return;

        const maxForce = 0.4;

        for (let i = this.bonds.length - 1; i >= 0; i--) {
            const b = this.bonds[i];
            const m1 = this.moleculeMap.get(b.mol1);
            const m2 = this.moleculeMap.get(b.mol2);
            if (!m1 || !m2) {
                this.bonds.splice(i, 1);
                continue;
            }

            const dx = wrapDelta(m2.x - m1.x, this.world.width);
            const dy = wrapDelta(m2.y - m1.y, this.world.height);
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const rest = b.restLength || 8;

            if (dist > rest * 3.5 && Math.random() < this.bondBreakProbability) {
                this.breakBond(i);
                continue;
            }

            const force = -this.bondSpringK * (dist - rest);
            const clampedForce = Math.max(-maxForce, Math.min(maxForce, force));
            
            const ux = dx / dist;
            const uy = dy / dist;

            const totalMass = m1.mass + m2.mass;
            const r1 = m2.mass / totalMass;
            const r2 = m1.mass / totalMass;

            m1.vx += ux * clampedForce * r1;
            m1.vy += uy * clampedForce * r1;
            m2.vx -= ux * clampedForce * r2;
            m2.vy -= uy * clampedForce * r2;
        }
    }

    breakBond(index: number) {
        const bond = this.bonds[index];
        this.bonds.splice(index, 1);

        const m1 = this.moleculeMap.get(bond.mol1);
        const m2 = this.moleculeMap.get(bond.mol2);
        
        if (m1) {
            m1.bondedTo.delete(bond.mol2);
            m1.bonded = m1.bondedTo.size > 0;
        }
        if (m2) {
            m2.bondedTo.delete(bond.mol1);
            m2.bonded = m2.bondedTo.size > 0;
        }
    }

    checkChemistry() {
        const checked = new Set<string>();

        for (const mol1 of this.molecules) {
            const nearby = this.spatialHash.getNearby(mol1.x, mol1.y);
            
            for (const id2 of nearby) {
                if (id2 <= mol1.id) continue;
                
                const key = `${mol1.id}-${id2}`;
                if (checked.has(key)) continue;
                checked.add(key);

                const mol2 = this.moleculeMap.get(id2);
                if (!mol2) continue;
                if (mol1.bondedTo.has(mol2.id)) continue;

                const dist = toroidalDistance(mol1.x, mol1.y, mol2.x, mol2.y, this.world.width, this.world.height);

                if (dist < COLLISION_DISTANCE) {
                    this.tryReaction(mol1, mol2);
                }
            }
        }
    }

    tryReaction(mol1: Molecule, mol2: Molecule) {
        if (this.bonds.length >= this.maxBonds) return;

        const avgX = (mol1.x + mol2.x) / 2;
        const avgY = (mol1.y + mol2.y) / 2;
        const catalyticBonus = this.world.getCatalyticBonus(avgX, avgY);

        if (mol1.type === 'amino_acid' && mol2.type === 'amino_acid') {
            if (Math.random() < BOND_PROBABILITIES.amino_acid_to_peptide * catalyticBonus) {
                this.createComplexMolecule('peptide', [mol1, mol2]);
                if (this.world.phase === 'primordial_soup') this.world.phase = 'synthesis';
            }
        }
        else if (mol1.type === 'nucleotide' && mol2.type === 'nucleotide') {
            if (Math.random() < BOND_PROBABILITIES.nucleotide_to_rna * catalyticBonus) {
                this.createComplexMolecule('rna_fragment', [mol1, mol2]);
                if (this.world.phase === 'synthesis') this.world.phase = 'polymerization';
            }
        }
        else if (mol1.type === 'lipid' && mol2.type === 'lipid') {
            if (Math.random() < BOND_PROBABILITIES.lipid_to_membrane * catalyticBonus) {
                this.createBond(mol1, mol2, 'hydrophobic');
            }
        }
        else if (mol1.complexity >= 2 && mol2.complexity >= 2 && mol1.type !== mol2.type) {
            if (Math.random() < BOND_PROBABILITIES.cross_type_bond * catalyticBonus) {
                this.createBond(mol1, mol2, 'hydrogen');
            }
        }
        else if (
            (mol1.type === 'amino_acid' && mol2.type === 'peptide') ||
            (mol1.type === 'peptide' && mol2.type === 'amino_acid') ||
            (mol1.type === 'peptide' && mol2.type === 'peptide')
        ) {
            if (Math.random() < BOND_PROBABILITIES.amino_acid_to_peptide * catalyticBonus * 0.6) {
                this.createBond(mol1, mol2, 'covalent');
            }
        }
        else if (
            (mol1.type === 'nucleotide' && mol2.type === 'rna_fragment') ||
            (mol1.type === 'rna_fragment' && mol2.type === 'nucleotide') ||
            (mol1.type === 'rna_fragment' && mol2.type === 'rna_fragment')
        ) {
            if (Math.random() < BOND_PROBABILITIES.nucleotide_to_rna * catalyticBonus * 0.6) {
                this.createBond(mol1, mol2, 'hydrogen');
            }
        }
        else if (mol1.complexity === 1 && mol2.complexity === 1) {
            if (Math.random() < BOND_PROBABILITIES.simple_to_building_block * catalyticBonus) {
                const buildingBlocks: MoleculeType[] = ['amino_acid', 'nucleotide', 'sugar', 'lipid'];
                const newType = buildingBlocks[Math.floor(Math.random() * buildingBlocks.length)];
                this.createComplexMolecule(newType, [mol1, mol2]);
            }
        }
    }

    createBond(mol1: Molecule, mol2: Molecule, type: Bond['type']) {
        const dist = toroidalDistance(mol1.x, mol1.y, mol2.x, mol2.y, this.world.width, this.world.height);
        
        const bond: Bond = {
            mol1: mol1.id,
            mol2: mol2.id,
            strength: 0.6 + Math.random() * 0.4,
            type,
            restLength: Math.max(6, dist),
        };
        
        this.bonds.push(bond);
        mol1.bondedTo.add(mol2.id);
        mol2.bondedTo.add(mol1.id);
        mol1.bonded = true;
        mol2.bonded = true;
    }

    createComplexMolecule(type: MoleculeType, reactants: Molecule[]) {
        let refX = reactants[0].x;
        let refY = reactants[0].y;
        let sumDx = 0, sumDy = 0;
        
        for (const r of reactants) {
            sumDx += wrapDelta(r.x - refX, this.world.width);
            sumDy += wrapDelta(r.y - refY, this.world.height);
        }
        
        const avgX = ((refX + sumDx / reactants.length) % this.world.width + this.world.width) % this.world.width;
        const avgY = ((refY + sumDy / reactants.length) % this.world.height + this.world.height) % this.world.height;

        const newMol = new Molecule(this.nextId++, type, this.world);
        newMol.x = avgX;
        newMol.y = avgY;
        newMol.vx = (reactants[0].vx + reactants[1].vx) * 0.4;
        newMol.vy = (reactants[0].vy + reactants[1].vy) * 0.4;

        this.molecules.push(newMol);
        this.moleculeMap.set(newMol.id, newMol);

        const reactantIds = new Set(reactants.map((r) => r.id));
        const newBonds: Bond[] = [];
        const seenKeys = new Set<string>();

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

            newBonds.push({ ...b, mol1: nm1, mol2: nm2 });
        }

        this.bonds = newBonds;

        for (const mol of reactants) {
            const idx = this.molecules.indexOf(mol);
            if (idx >= 0) this.molecules.splice(idx, 1);
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

    checkProtoCellCollisions() {
        for (let i = 0; i < this.protoCells.length; i++) {
            for (let j = i + 1; j < this.protoCells.length; j++) {
                const p1 = this.protoCells[i];
                const p2 = this.protoCells[j];
                
                // Check cooldowns
                if (!p1.canMerge(this.world.time) || !p2.canMerge(this.world.time)) continue;
                
                const dist = toroidalDistance(p1.x, p1.y, p2.x, p2.y, this.world.width, this.world.height);
                
                if (dist < PROTOCELL_MERGE_DISTANCE) {
                    this.mergeProtoCells(p1, p2);
                    return;
                }
            }
        }
    }

    mergeProtoCells(p1: ProtoCell, p2: ProtoCell) {
        for (const molId of p2.molecules) {
            p1.molecules.add(molId);
            const mol = this.moleculeMap.get(molId);
            if (mol) mol.inProtoCell = p1.id;
        }
        
        p1.x = (p1.x + p2.x) / 2;
        p1.y = (p1.y + p2.y) / 2;
        p1.targetX = p1.x;
        p1.targetY = p1.y;
        p1.energy = Math.min(150, p1.energy + p2.energy * 0.5);
        p1.lastMergeTime = this.world.time;
        
        const idx = this.protoCells.indexOf(p2);
        if (idx >= 0) this.protoCells.splice(idx, 1);
    }

    tryFormProtoCells() {
        if (this.lucaBorn) return;
        if (this.protoCells.length >= this.maxProtoCells) return;

        const complexMols = this.molecules.filter((m) => m.complexity >= 2 && m.bonded && !m.inProtoCell);
        if (complexMols.length < 5) return;

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
                
                const currentMol = this.moleculeMap.get(currentId);
                if (!currentMol || currentMol.inProtoCell) continue;
                
                cluster.push(currentId);

                for (const bondedId of currentMol.bondedTo) {
                    if (!visited.has(bondedId)) {
                        stack.push(bondedId);
                    }
                }
            }

            if (cluster.length >= 5) {
                clusters.push(cluster);
            }
        }

        clusters.sort((a, b) => b.length - a.length);
        
        const numToForm = Math.min(1, clusters.length, this.maxProtoCells - this.protoCells.length);
        for (let i = 0; i < numToForm; i++) {
            const cluster = clusters[i];
            
            const mols = cluster.map((id) => this.moleculeMap.get(id)).filter((m) => m) as Molecule[];
            
            let refX = mols[0].x, refY = mols[0].y;
            let sumDx = 0, sumDy = 0;
            for (const m of mols) {
                sumDx += wrapDelta(m.x - refX, this.world.width);
                sumDy += wrapDelta(m.y - refY, this.world.height);
            }
            const centerX = ((refX + sumDx / mols.length) % this.world.width + this.world.width) % this.world.width;
            const centerY = ((refY + sumDy / mols.length) % this.world.height + this.world.height) % this.world.height;

            const proto = new ProtoCell(this.nextId++, cluster, centerX, centerY);
            this.protoCells.push(proto);
            
            for (const mol of mols) {
                mol.inProtoCell = proto.id;
            }
            
            if (this.world.phase === 'polymerization' || this.world.phase === 'synthesis') {
                this.world.phase = 'self_assembly';
            }
        }
    }

    // Check for predation between organisms
    checkPredation() {
        const aliveOrganisms = this.organisms.filter(o => o.isAlive);
        
        for (const predator of aliveOrganisms) {
            if (predator.traits.predatory < 0.3) continue;
            
            for (const prey of aliveOrganisms) {
                if (predator.id === prey.id) continue;
                if (!predator.canEat(prey)) continue;
                
                const dist = toroidalDistance(predator.x, predator.y, prey.x, prey.y, 
                                             this.world.width, this.world.height);
                
                // Must be touching to eat
                if (dist < predator.radius + prey.radius) {
                    if (predator.tryEat(prey)) {
                        this.predationEvents++;
                        this.totalDeaths++;
                        
                        if (this.world.phase === 'diversification' || this.world.phase === 'early_life') {
                            this.world.phase = 'predation_emerges';
                        }
                        return; // One predation event per frame
                    }
                }
            }
        }
    }

    update() {
        this.frameCount++;
        this.world.update();

        this.rebuildSpatialHash();

        for (const mol of this.molecules) {
            mol.update(this.world);
        }

        this.applyBondForces();

        if (!this.lucaBorn && this.frameCount % 2 === 0) {
            this.checkChemistry();
        }

        if (!this.lucaBorn && this.frameCount % 20 === 0) {
            this.tryFormProtoCells();
        }

        if (this.frameCount % 15 === 0 && this.protoCells.length > 1) {
            this.checkProtoCellCollisions();
        }

        for (let i = this.protoCells.length - 1; i >= 0; i--) {
            const p = this.protoCells[i];
            p.update(this.world, this.moleculeMap);
            
            if (p.shouldSplit()) {
                const newProto = p.split(this.nextId++, this.moleculeMap, this.world);
                if (newProto) {
                    this.protoCells.push(newProto);
                }
            }
            
            if (!this.lucaBorn && p.canBecomeLUCA()) {
                this.luca = p.emergeLUCA(this.world);
                this.lucaBorn = true;
                this.world.phase = 'luca_emergence';
                
                for (const molId of p.molecules) {
                    const mol = this.moleculeMap.get(molId);
                    if (mol) {
                        const idx = this.molecules.indexOf(mol);
                        if (idx >= 0) this.molecules.splice(idx, 1);
                        this.moleculeMap.delete(molId);
                    }
                }
                
                this.protoCells.splice(i, 1);
                continue;
            }
            
            if (p.molecules.size < PROTOCELL_MIN_SIZE || p.stability < 5) {
                for (const molId of p.molecules) {
                    const mol = this.moleculeMap.get(molId);
                    if (mol) mol.inProtoCell = null;
                }
                this.protoCells.splice(i, 1);
                continue;
            }

            if (p.stability > 35 && this.world.phase === 'self_assembly') {
                this.world.phase = 'proto_life';
            }
        }

        // Update LUCA
        if (this.luca && this.luca.isAlive) {
            this.luca.update(this.world);
            
            if (this.luca.canReproduce(this.world) && this.organisms.length < EVOLUTION.MAX_PROKARYOTES) {
                const offspring = this.luca.reproduce(this.nextId++, this.world);
                this.organisms.push(offspring);
                this.totalBorn++;
                this.world.phase = 'early_life';
            }
        }

        // Update organisms with predation awareness
        for (const o of this.organisms) {
            o.update(this.world, this.organisms);
        }

        // Check predation
        if (this.frameCount % 3 === 0) {
            this.checkPredation();
        }

        // Reproduction
        const fertile = this.organisms.filter((o) => o.canReproduce(this.world));
        if (fertile.length > 0 && this.organisms.length < EVOLUTION.MAX_PROKARYOTES) {
            const parent = fertile[Math.floor(Math.random() * fertile.length)];
            const child = parent.reproduce(this.nextId++, this.world);
            this.organisms.push(child);
            this.totalBorn++;
            this.maxGeneration = Math.max(this.maxGeneration, child.generation);
            
            if (this.organisms.length > 12 && this.world.phase === 'early_life') {
                this.world.phase = 'diversification';
            }
        }

        // Cleanup dead
        if (this.frameCount % 60 === 0) {
            const before = this.organisms.length;
            this.organisms = this.organisms.filter(o => o.isAlive || o.age < 200);
            this.totalDeaths += before - this.organisms.length;
            this.updateMoleculeCounts();
        }
    }
}