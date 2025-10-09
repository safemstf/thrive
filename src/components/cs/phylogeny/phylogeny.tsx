import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Droplets, Sparkles } from 'lucide-react';

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

// Rich molecular diversity
type MoleculeType = 
  | 'water' | 'carbon' | 'nitrogen' | 'oxygen' // Simple
  | 'amino_acid' | 'nucleotide' | 'lipid' | 'sugar' // Building blocks
  | 'peptide' | 'rna_fragment' | 'membrane_vesicle'; // Complex

interface MolecularEntity extends PhysicalEntity {
  type: MoleculeType;
  symbol: string;
  color: string;
  bonded: boolean;
  bondedTo: Set<number>;
  complexity: number; // 1 = simple, 2 = building block, 3 = complex
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

interface LivingEntity extends PhysicalEntity {
  generation: number;
  genome: string;
  birthTime: number;
  isAlive: boolean;
  canMove: boolean;
  parent: number | null;
  children: number[];
}

interface Bond {
  mol1: number;
  mol2: number;
  strength: number;
  type: 'covalent' | 'hydrogen' | 'hydrophobic';
}

type SimulationPhase = 
  | 'primordial_soup'
  | 'synthesis'
  | 'polymerization'
  | 'self_assembly'
  | 'proto_life'
  | 'luca_emergence'
  | 'early_life';

interface PhylogenySimProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

// ==================== CONSTANTS ====================

const COLORS = {
  bg: '#0a0e1a',
  surface: '#111827',
  text: '#f8fafc',
  textMuted: '#64748b',
  
  // Simple molecules
  water: 'rgba(96, 165, 250, 0.4)',
  carbon: 'rgba(120, 113, 108, 0.6)',
  nitrogen: 'rgba(147, 197, 253, 0.5)',
  oxygen: 'rgba(239, 68, 68, 0.5)',
  
  // Building blocks
  amino_acid: 'rgba(236, 72, 153, 0.7)',
  nucleotide: 'rgba(139, 92, 246, 0.8)',
  lipid: 'rgba(250, 204, 21, 0.7)',
  sugar: 'rgba(134, 239, 172, 0.6)',
  
  // Complex molecules
  peptide: 'rgba(219, 39, 119, 0.8)',
  rna_fragment: 'rgba(124, 58, 237, 0.9)',
  membrane_vesicle: 'rgba(245, 158, 11, 0.6)',
  
  proto: 'rgba(236, 72, 153, 0.7)',
  luca: 'rgba(251, 191, 36, 1)',
  organism: 'rgba(59, 130, 246, 0.8)',
  
  bond_covalent: 'rgba(139, 92, 246, 0.4)',
  bond_hydrogen: 'rgba(96, 165, 250, 0.3)',
  bond_hydrophobic: 'rgba(250, 204, 21, 0.2)',
  
  energy: 'rgba(20, 184, 166, 0.12)',
};

const RNA_BASES = ['A', 'U', 'C', 'G'] as const;
const AMINO_ACIDS = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L', 'K', 'M'];
const RNA_LENGTH = 24;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;

// Many more molecules for interesting chemistry!
const INITIAL_COUNTS = {
  water: 100,
  carbon: 40,
  nitrogen: 30,
  oxygen: 30,
  amino_acid: 20,
  nucleotide: 25,
  lipid: 30,
  sugar: 15,
};

// Chemistry parameters
const MOLECULE_SPEED = 0.35;
const COLLISION_DISTANCE = 10;
const UPDATE_INTERVAL = 100;

// Bond probabilities (per collision)
const BOND_PROBABILITIES = {
  amino_acid_to_peptide: 0.03,
  nucleotide_to_rna: 0.04,
  lipid_to_membrane: 0.05,
  simple_to_building_block: 0.02,
};

// Emergence thresholds
const PEPTIDE_SIZE_FOR_METABOLISM = 3;
const RNA_SIZE_FOR_REPLICATION = 6;
const LIPID_COUNT_FOR_MEMBRANE = 8;
const PROTOCELL_STABILITY_FOR_LUCA = 90;

// ==================== HELPER FUNCTIONS ====================

function generateRNA(length: number): string {
  return Array.from({ length }, () => RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)]).join('');
}

function mutateRNA(rna: string, rate: number) {
  const mutations: Array<{pos: number, from: string, to: string}> = [];
  const newRNA = rna.split('').map((base, i) => {
    if (Math.random() < rate) {
      const newBase = RNA_BASES[Math.floor(Math.random() * RNA_BASES.length)];
      if (newBase !== base) {
        mutations.push({ pos: i, from: base, to: newBase });
        return newBase;
      }
    }
    return base;
  }).join('');
  return { newRNA, mutations };
}

function randomPosition(width: number, height: number, padding: number = 40) {
  return { 
    x: padding + Math.random() * (width - 2 * padding), 
    y: padding + Math.random() * (height - 2 * padding) 
  };
}

function randomVelocity(maxSpeed: number = MOLECULE_SPEED) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * maxSpeed;
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

function constrainPosition(x: number, y: number, vx: number, vy: number, w: number, h: number, pad: number = 40) {
  let newX = x, newY = y, newVx = vx, newVy = vy;
  if (newX < pad) { newX = pad; newVx = Math.abs(vx) * 0.7; }
  if (newX > w - pad) { newX = w - pad; newVx = -Math.abs(vx) * 0.7; }
  if (newY < pad) { newY = pad; newVy = Math.abs(vy) * 0.7; }
  if (newY > h - pad) { newY = h - pad; newVy = -Math.abs(vy) * 0.7; }
  return { x: newX, y: newY, vx: newVx, vy: newVy };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
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
  phase: number; // For pulsing effect
}

class PrimordialWorld {
  width: number;
  height: number;
  time: number = 0;
  phase: SimulationPhase = 'primordial_soup';
  energyField: number[][];
  temperature: number = 85; // Hot early Earth
  vents: HydrothermalVent[] = [];

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.energyField = Array(24).fill(0).map(() => Array(40).fill(70 + Math.random() * 30));
    
    // Create hydrothermal vents
    this.vents = [
      { x: w * 0.25, y: h * 0.3, strength: 1.2, phase: 0 },
      { x: w * 0.65, y: h * 0.5, strength: 1.0, phase: Math.PI },
      { x: w * 0.45, y: h * 0.75, strength: 1.1, phase: Math.PI * 0.5 },
    ];
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

  // Get convection flow at position (Rayleigh-Bénard style circulation)
  getFlowAt(x: number, y: number): { fx: number, fy: number } {
    let fx = 0, fy = 0;
    
    for (const vent of this.vents) {
      const dx = x - vent.x;
      const dy = y - vent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) continue; // Dead zone at vent
      
      const maxRadius = 250;
      if (dist > maxRadius) continue;
      
      // Pulsing effect
      const pulse = Math.sin(this.time * 0.05 + vent.phase) * 0.3 + 0.7;
      
      // Radial outward flow from vent (hot fluid rises and spreads)
      const radialStrength = (1 - dist / maxRadius) * vent.strength * pulse;
      const angle = Math.atan2(dy, dx);
      
      // Outward radial component
      const radialFx = Math.cos(angle) * radialStrength * 0.4;
      const radialFy = Math.sin(angle) * radialStrength * 0.4;
      
      // Rotational component (convection cells)
      const rotationalStrength = Math.sin(dist / maxRadius * Math.PI) * vent.strength * 0.2;
      const tangentialFx = -Math.sin(angle) * rotationalStrength;
      const tangentialFy = Math.cos(angle) * rotationalStrength;
      
      fx += radialFx + tangentialFx;
      fy += radialFy + tangentialFy;
    }
    
    return { fx, fy };
  }

  update() {
    this.time++;
    
    // Slowly cool down
    if (this.temperature > 40) {
      this.temperature *= 0.9995;
    }
    
    // Energy replenishment from vents
    if (this.time % 40 === 0) {
      for (let y = 0; y < this.energyField.length; y++) {
        for (let x = 0; x < this.energyField[y].length; x++) {
          let energy = this.energyField[y][x];
          
          // Higher energy near vents
          for (const vent of this.vents) {
            const cellX = x * 30 + 15;
            const cellY = y * 30 + 15;
            const dist = distance(cellX, cellY, vent.x, vent.y);
            if (dist < 150) {
              const bonus = (1 - dist / 150) * 8 * vent.strength;
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
    
    // Symbol assignment
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
    
    const pos = randomPosition(world.width, world.height);
    const vel = randomVelocity();
    this.x = pos.x;
    this.y = pos.y;
    this.vx = vel.vx;
    this.vy = vel.vy;
    this.energy = 50;
    this.mass = this.complexity;
    this.color = COLORS[type] || COLORS.water;
    this.radius = 2 + this.complexity;
  }

  update(world: PrimordialWorld) {
    // Movement affected by bonding
    const movementReduction = Math.min(this.bondedTo.size * 0.15, 0.7);
    
    // Apply convection flow from hydrothermal vents
    const flow = world.getFlowAt(this.x, this.y);
    this.vx += flow.fx * 0.08;
    this.vy += flow.fy * 0.08;
    
    this.x += this.vx * (1 - movementReduction);
    this.y += this.vy * (1 - movementReduction);
    const result = constrainPosition(this.x, this.y, this.vx, this.vy, world.width, world.height);
    this.x = result.x; this.y = result.y; this.vx = result.vx; this.vy = result.vy;
    this.vx *= 0.996;
    this.vy *= 0.996;
  }

  distanceTo(other: Molecule): number {
    return distance(this.x, this.y, other.x, other.y);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Glow for complex molecules
    if (this.complexity >= 2 && this.bondedTo.size > 0) {
      ctx.fillStyle = `${this.color}30`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Label for complex molecules
    if (this.complexity === 3) {
      ctx.fillStyle = COLORS.text;
      ctx.font = '7px monospace';
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
  radius = 25;
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
    
    // Update position based on molecules
    const mols = this.molecules.map(id => moleculeMap.get(id)).filter(m => m) as Molecule[];
    if (mols.length > 0) {
      this.x = mols.reduce((sum, m) => sum + m.x, 0) / mols.length;
      this.y = mols.reduce((sum, m) => sum + m.y, 0) / mols.length;
    }
    
    // Count components
    this.peptideCount = mols.filter(m => m.type === 'peptide').length;
    this.rnaCount = mols.filter(m => m.type === 'rna_fragment').length;
    this.lipidCount = mols.filter(m => m.type === 'lipid' || m.type === 'membrane_vesicle').length;
    
    // Check for membrane
    this.hasMembrane = this.lipidCount >= LIPID_COUNT_FOR_MEMBRANE;
    
    // Check for metabolism (peptides can catalyze)
    this.hasMetabolism = this.peptideCount >= PEPTIDE_SIZE_FOR_METABOLISM;
    
    // Check for replication capability
    this.canReplicate = this.rnaCount >= RNA_SIZE_FOR_REPLICATION;
    
    // Build RNA sequence
    const rnaMols = mols.filter(m => m.type === 'nucleotide' || m.type === 'rna_fragment');
    this.rnaSequence = rnaMols.map(m => m.symbol).join('');
    
    // Calculate stability
    let baseStability = 20;
    if (this.hasMembrane) baseStability += 30;
    if (this.hasMetabolism) baseStability += 25;
    if (this.canReplicate) baseStability += 25;
    
    this.stability = Math.min(100, baseStability + (this.age * 0.1));
    
    this.energy += world.consumeEnergyAt(this.x, this.y, this.hasMetabolism ? 2 : 1);
  }

  canBecomeLUCA(): boolean {
    return this.hasMembrane && 
           this.hasMetabolism && 
           this.canReplicate && 
           this.stability >= PROTOCELL_STABILITY_FOR_LUCA;
  }

  emergeLUCA(world: PrimordialWorld): LUCAEntity {
    let genome = this.rnaSequence;
    if (genome.length < RNA_LENGTH) genome += generateRNA(RNA_LENGTH - genome.length);
    else genome = genome.slice(0, RNA_LENGTH);
    return new LUCAEntity(this.id, this.x, this.y, genome, world.time);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pulse = Math.sin(this.age * 0.04) * 0.15 + 0.85;
    
    // Membrane
    if (this.hasMembrane) {
      ctx.strokeStyle = COLORS.membrane_vesicle;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = COLORS.proto;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    
    // Components indicators
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    let y = this.y - this.radius - 15;
    
    if (this.hasMembrane) {
      ctx.fillStyle = COLORS.membrane_vesicle;
      ctx.fillText('🧫 Membrane', this.x, y);
      y += 10;
    }
    if (this.hasMetabolism) {
      ctx.fillStyle = COLORS.peptide;
      ctx.fillText('⚡ Metabolism', this.x, y);
      y += 10;
    }
    if (this.canReplicate) {
      ctx.fillStyle = COLORS.rna_fragment;
      ctx.fillText('🧬 Replication', this.x, y);
    }
    
    // Stability bar
    const pct = this.stability / 100;
    const barW = 36;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(this.x - barW / 2, this.y + this.radius + 8, barW, 3);
    
    const stabilityColor = this.canBecomeLUCA() ? COLORS.luca : COLORS.proto;
    ctx.fillStyle = stabilityColor;
    ctx.fillRect(this.x - barW / 2, this.y + this.radius + 8, barW * pct, 3);
  }
}

// ==================== LUCA & ORGANISM ====================

class LUCAEntity implements LivingEntity {
  id: number;
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  energy = 100;
  mass = 5;
  radius = 22;
  generation = 0;
  genome: string;
  birthTime: number;
  isAlive = true;
  parent = null;
  children: number[] = [];
  canMove = false;
  lastReproduction = 0;

  constructor(id: number, x: number, y: number, rna: string, birthTime: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.genome = rna;
    this.birthTime = birthTime;
    this.lastReproduction = birthTime;
  }

  update(world: PrimordialWorld) {
    if (!this.isAlive) return;
    
    this.energy += world.consumeEnergyAt(this.x, this.y, 2.5);
    this.energy -= 0.06;
    
    if (this.energy <= 0) this.isAlive = false;
    
    if (this.energy > 70 && !this.canMove) {
      this.canMove = true;
      const vel = randomVelocity(0.15);
      this.vx = vel.vx;
      this.vy = vel.vy;
    }
    
    if (this.canMove) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;
      const result = constrainPosition(this.x, this.y, this.vx, this.vy, world.width, world.height);
      this.x = result.x; this.y = result.y; this.vx = result.vx; this.vy = result.vy;
    }
  }

  canReproduce(world: PrimordialWorld): boolean {
    return this.energy >= 70 && (world.time - this.lastReproduction) >= 400;
  }

  reproduce(childId: number, world: PrimordialWorld): OrganismEntity {
    const { newRNA } = mutateRNA(this.genome, 0.015);
    const angle = Math.random() * Math.PI * 2;
    const dist = 38;
    const offspring = new OrganismEntity(childId, this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, 1, this.id, newRNA, world.time);
    this.children.push(childId);
    this.energy -= 28;
    this.lastReproduction = world.time;
    return offspring;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const pulse = Math.sin(time * 0.02) * 0.3 + 0.7;
    
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2.2);
    gradient.addColorStop(0, `${COLORS.luca}40`);
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 2.2 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = COLORS.luca;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LUCA', this.x, this.y - this.radius - 10);
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
    const vel = randomVelocity(0.22);
    this.vx = vel.vx;
    this.vy = vel.vy;
  }

  update(world: PrimordialWorld) {
    if (!this.isAlive) return;
    this.energy += world.consumeEnergyAt(this.x, this.y, 1.5);
    if (this.canMove) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.98;
      this.vy *= 0.98;
      const result = constrainPosition(this.x, this.y, this.vx, this.vy, world.width, world.height);
      this.x = result.x; this.y = result.y; this.vx = result.vx; this.vy = result.vy;
    }
    this.energy -= 0.09;
    if (this.energy <= 0) {
      this.isAlive = false;
      this.canMove = false;
    }
  }

  canReproduce(world: PrimordialWorld): boolean {
    return this.energy >= 65 && (world.time - this.lastReproduction) >= 400;
  }

  reproduce(childId: number, world: PrimordialWorld): OrganismEntity {
    const { newRNA } = mutateRNA(this.genome, 0.02);
    const angle = Math.random() * Math.PI * 2;
    const dist = 32;
    const offspring = new OrganismEntity(childId, this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, this.generation + 1, this.id, newRNA, world.time);
    this.children.push(childId);
    this.energy -= 22;
    this.lastReproduction = world.time;
    return offspring;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.fillStyle = COLORS.organism;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x, this.y - this.radius - 5);
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

  constructor() {
    this.world = new PrimordialWorld(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.initMolecules();
  }

  initMolecules() {
    // Create diverse primordial soup
    for (const [type, count] of Object.entries(INITIAL_COUNTS)) {
      for (let i = 0; i < count; i++) {
        const mol = new Molecule(this.nextId++, type as MoleculeType, this.world);
        this.molecules.push(mol);
        this.moleculeMap.set(mol.id, mol);
      }
    }
  }

  // Check collisions and create bonds/new molecules
  checkChemistry() {
    const molecules = this.molecules;
    
    for (let i = 0; i < molecules.length; i++) {
      for (let j = i + 1; j < molecules.length; j++) {
        const mol1 = molecules[i];
        const mol2 = molecules[j];
        
        if (mol1.bondedTo.has(mol2.id)) continue;
        
        const dist = mol1.distanceTo(mol2);
        
        if (dist < COLLISION_DISTANCE) {
          this.tryReaction(mol1, mol2);
        }
      }
    }
  }

  tryReaction(mol1: Molecule, mol2: Molecule) {
    // Amino acids → Peptide
    if (mol1.type === 'amino_acid' && mol2.type === 'amino_acid') {
      if (Math.random() < BOND_PROBABILITIES.amino_acid_to_peptide) {
        this.createComplexMolecule('peptide', [mol1, mol2]);
        if (this.world.phase === 'primordial_soup') this.world.phase = 'synthesis';
      }
    }
    
    // Nucleotides → RNA fragment
    else if (mol1.type === 'nucleotide' && mol2.type === 'nucleotide') {
      if (Math.random() < BOND_PROBABILITIES.nucleotide_to_rna) {
        this.createComplexMolecule('rna_fragment', [mol1, mol2]);
        if (this.world.phase === 'synthesis') this.world.phase = 'polymerization';
      }
    }
    
    // Lipids → Membrane vesicle
    else if (mol1.type === 'lipid' && mol2.type === 'lipid') {
      if (Math.random() < BOND_PROBABILITIES.lipid_to_membrane) {
        this.createBond(mol1, mol2, 'hydrophobic');
      }
    }
    
    // Simple molecules can form building blocks
    else if (mol1.complexity === 1 && mol2.complexity === 1) {
      if (Math.random() < BOND_PROBABILITIES.simple_to_building_block * 0.5) {
        // Randomly create a building block
        const buildingBlocks: MoleculeType[] = ['amino_acid', 'nucleotide', 'sugar'];
        const newType = buildingBlocks[Math.floor(Math.random() * buildingBlocks.length)];
        this.createComplexMolecule(newType, [mol1, mol2]);
      }
    }
  }

  createBond(mol1: Molecule, mol2: Molecule, type: Bond['type']) {
    const bond: Bond = {
      mol1: mol1.id,
      mol2: mol2.id,
      strength: 0.6 + Math.random() * 0.4,
      type
    };
    this.bonds.push(bond);
    mol1.bondedTo.add(mol2.id);
    mol2.bondedTo.add(mol1.id);
    mol1.bonded = true;
    mol2.bonded = true;
  }

  createComplexMolecule(type: MoleculeType, reactants: Molecule[]) {
    // Average position
    const x = reactants.reduce((sum, m) => sum + m.x, 0) / reactants.length;
    const y = reactants.reduce((sum, m) => sum + m.y, 0) / reactants.length;
    
    // Create new complex molecule
    const newMol = new Molecule(this.nextId++, type, this.world);
    newMol.x = x;
    newMol.y = y;
    newMol.vx = reactants[0].vx * 0.5;
    newMol.vy = reactants[0].vy * 0.5;
    
    this.molecules.push(newMol);
    this.moleculeMap.set(newMol.id, newMol);
    
    // Remove reactants
    reactants.forEach(mol => {
      this.molecules = this.molecules.filter(m => m.id !== mol.id);
      this.moleculeMap.delete(mol.id);
    });
  }

  // Find clusters for protocell formation
  tryFormProtoCells() {
    if (this.lucaBorn || this.protoCells.length > 0) return;
    
    // Look for clusters with diverse components
    const complexMols = this.molecules.filter(m => m.complexity >= 2 && m.bonded);
    if (complexMols.length < 10) return;
    
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
      
      if (cluster.length >= 10) {
        clusters.push(cluster);
      }
    }
    
    if (clusters.length > 0) {
      const cluster = clusters[0];
      const mols = cluster.map(id => this.moleculeMap.get(id)).filter(m => m) as Molecule[];
      const centerX = mols.reduce((sum, m) => sum + m.x, 0) / mols.length;
      const centerY = mols.reduce((sum, m) => sum + m.y, 0) / mols.length;
      
      const proto = new ProtoCell(this.nextId++, cluster, centerX, centerY);
      this.protoCells.push(proto);
      this.world.phase = 'self_assembly';
    }
  }

  update() {
    this.world.update();
    
    this.molecules.forEach(m => m.update(this.world));
    
    if (!this.lucaBorn) {
      this.checkChemistry();
      this.tryFormProtoCells();
    }
    
    this.protoCells = this.protoCells.filter(p => {
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
      if (this.luca.canReproduce(this.world) && this.organisms.length < 6) {
        const offspring = this.luca.reproduce(this.nextId++, this.world);
        this.organisms.push(offspring);
        this.world.phase = 'early_life';
      }
    }
    
    this.organisms.forEach(o => o.update(this.world));
    
    const fertile = this.organisms.filter(o => o.canReproduce(this.world) && o.isAlive);
    if (fertile.length > 0 && this.organisms.length < 15) {
      const parent = fertile[Math.floor(Math.random() * fertile.length)];
      const child = parent.reproduce(this.nextId++, this.world);
      this.organisms.push(child);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, this.world.width, this.world.height);
    
    // Energy field
    for (let y = 0; y < this.world.energyField.length; y++) {
      for (let x = 0; x < this.world.energyField[y].length; x++) {
        const energy = this.world.energyField[y][x];
        const alpha = (energy / 100) * 0.12;
        ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
        ctx.fillRect(x * 30, y * 30, 30, 30);
      }
    }
    
    // Draw hydrothermal vents
    for (const vent of this.world.vents) {
      const pulse = Math.sin(this.world.time * 0.05 + vent.phase) * 0.3 + 0.7;
      
      // Outer glow
      const gradient = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 60);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.15)');
      gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(vent.x, vent.y, 60 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Vent core
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.beginPath();
      ctx.arc(vent.x, vent.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Heat shimmer effect
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.4 * pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vent.x, vent.y, 20 + pulse * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Bonds
    for (const bond of this.bonds) {
      const mol1 = this.moleculeMap.get(bond.mol1);
      const mol2 = this.moleculeMap.get(bond.mol2);
      if (mol1 && mol2) {
        ctx.strokeStyle = COLORS[`bond_${bond.type}`];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mol1.x, mol1.y);
        ctx.lineTo(mol2.x, mol2.y);
        ctx.stroke();
      }
    }
    
    if (!this.lucaBorn) {
      this.molecules.forEach(m => m.draw(ctx));
    }
    this.protoCells.forEach(p => p.draw(ctx));
    if (this.luca) this.luca.draw(ctx, this.world.time);
    this.organisms.forEach(o => o.draw(ctx));
  }
}

// ==================== REACT COMPONENT ====================

function LegendItem({ color, label, isSquare = false }: { color: string, label: string, isSquare?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
      <div style={{
        width: isSquare ? '12px' : '8px',
        height: isSquare ? '12px' : '8px',
        borderRadius: isSquare ? '2px' : '50%',
        background: color,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        flexShrink: 0
      }} />
      <span style={{ color: COLORS.textMuted }}>{label}</span>
    </div>
  );
}

export default function LUCASimulation({ 
  isRunning: externalIsRunning, 
  speed: externalSpeed = 1,
}: PhylogenySimProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SimulationEngine | null>(null);
  
  const [internalIsRunning, setInternalIsRunning] = useState(true);
  const [, forceUpdate] = useState({});
  
  const isRunning = externalIsRunning !== undefined ? externalIsRunning : internalIsRunning;

  useEffect(() => {
    engineRef.current = new SimulationEngine();
    forceUpdate({});
  }, []);

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
    luca_emergence: 'LUCA Emerges',
    early_life: 'Early Life',
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      padding: '3rem 2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em'
          }}>
            The Origin of Life
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: '0.9rem', margin: 0 }}>
            {phaseLabels[engine.world.phase]}
          </p>
        </div>

        <div style={{
          background: COLORS.surface,
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '2rem',
          border: `1px solid rgba(255, 255, 255, 0.05)`
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Legend */}
        <div style={{
          background: COLORS.surface,
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: `1px solid rgba(255, 255, 255, 0.05)`
        }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: COLORS.text
          }}>
            Legend
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Simple Molecules */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>
                Simple Molecules
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <LegendItem color={COLORS.water} label="Water (H₂O)" />
                <LegendItem color={COLORS.carbon} label="Carbon" />
                <LegendItem color={COLORS.nitrogen} label="Nitrogen" />
                <LegendItem color={COLORS.oxygen} label="Oxygen" />
              </div>
            </div>

            {/* Building Blocks */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>
                Building Blocks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <LegendItem color={COLORS.amino_acid} label="Amino Acids" />
                <LegendItem color={COLORS.nucleotide} label="Nucleotides" />
                <LegendItem color={COLORS.lipid} label="Lipids" />
                <LegendItem color={COLORS.sugar} label="Sugars" />
              </div>
            </div>

            {/* Complex Molecules */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>
                Complex Structures
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <LegendItem color={COLORS.peptide} label="Peptides" />
                <LegendItem color={COLORS.rna_fragment} label="RNA Fragments" />
                <LegendItem color={COLORS.membrane_vesicle} label="Membrane Vesicles" />
              </div>
            </div>

            {/* Life Forms */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>
                Life Forms
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <LegendItem color={COLORS.proto} label="Protocells" />
                <LegendItem color={COLORS.luca} label="LUCA" />
                <LegendItem color={COLORS.organism} label="Early Organisms" />
              </div>
            </div>

            {/* Environment */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem', color: COLORS.textMuted }}>
                Environment
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <LegendItem color={COLORS.energy} label="Energy Field" isSquare />
                <LegendItem color="rgba(239, 68, 68, 0.8)" label="Hydrothermal Vents" />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
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
              fontWeight: 500
            }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={() => {
              engineRef.current = new SimulationEngine();
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
              fontWeight: 500
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <div style={{ 
            marginLeft: 'auto', 
            fontSize: '0.875rem', 
            color: COLORS.textMuted,
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            gap: '1rem'
          }}>
            <span><Droplets size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />{engine.molecules.length}</span>
            <span><Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />{engine.bonds.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}