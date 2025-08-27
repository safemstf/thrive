// bacteria.utils.tsx
import {
  BacterialSpecies,
  BacterialStrain,
  AntibioticClass,
  PhageLibrary,
  PhageStrategy,
  Genome,
  BACTERIAL_PROFILES,
  ADVANCED_CONFIG
} from './bacteria.types';

// ============= SPATIAL INDEXING =============
export class OctreeNode {
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
export class BacterialEvolution {
  private strainLibrary: Map<string, BacterialStrain> = new Map();
  private mutationCounter = 0;

  generateStrain(species: BacterialSpecies, parentStrain?: BacterialStrain): BacterialStrain {
    const baseProfile = BACTERIAL_PROFILES[species];
    const strainId = `${species}_${Date.now()}_${this.mutationCounter++}`;
    
    let genome: Genome;
    let color = baseProfile.color;
    
    if (parentStrain) {
      genome = this.mutateGenome(parentStrain.genome);
      color = this.mutateColor(parentStrain.color);
    } else {
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
    
    mutated.resistanceGenes.forEach((value, key) => {
      if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE) {
        const delta = (Math.random() - 0.5) * 0.1;
        mutated.resistanceGenes.set(key, Math.max(0, Math.min(1, value + delta)));
      }
    });

    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE) {
      mutated.virulenceFactors.toxinProduction *= 0.9 + Math.random() * 0.2;
    }

    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 10) {
      if (!mutated.phageResistance.crispr && Math.random() < 0.1) {
        mutated.phageResistance.crispr = true;
      }
    }

    return mutated;
  }

  horizontalGeneTransfer(donor: BacterialStrain, recipient: BacterialStrain): BacterialStrain {
    const newGenome = { ...recipient.genome };
    
    donor.genome.resistanceGenes.forEach((value, key) => {
      if (Math.random() < 0.3) {
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
    
    genome.resistanceGenes.forEach(level => {
      cost += level * 0.1;
    });

    if (genome.phageResistance.crispr) cost += 0.15;
    if (genome.phageResistance.restrictionModification) cost += 0.1;
    
    return Math.min(cost, 0.5);
  }

  mutateColor(parentColor: string): string {
    const r = parseInt(parentColor.slice(1, 3), 16);
    const g = parseInt(parentColor.slice(3, 5), 16);
    const b = parseInt(parentColor.slice(5, 7), 16);
    
    const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * 20));
    const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * 20));
    const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * 20));
    
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }
}

// ============= PHAGE THERAPY ENGINE =============
export class PhageTherapyEngine {
  phageLibraries: Map<string, PhageLibrary> = new Map();

  constructor() {
    this.initializePhageLibraries();
  }

  initializePhageLibraries() {
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
      
      if (bacterialStrain.genome.phageResistance.crispr) score *= 0.3;
      if (bacterialStrain.genome.phageResistance.restrictionModification) score *= 0.5;
      
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

// ============= UTILITY FUNCTIONS =============
export const calculateSepsisScore = (
  bacterialLoad: number, 
  cytokineStorm: boolean, 
  simulationTime: number, 
  clottingRisk: number
): number => {
  let sirsScore = 0;
  if (bacterialLoad > 100) sirsScore++;
  if (cytokineStorm) sirsScore++;
  if (simulationTime > 360) sirsScore++;
  if (clottingRisk > 0.5) sirsScore++;
  
  return Math.min(100, sirsScore * 25);
};

export const calculateOrganDamage = (
  sepsisScore: number,
  clottingRisk: number,
  heartRate: number,
  o2Sat: number,
  lactate: number
) => {
  const organDamage = Math.min(sepsisScore / 100 + clottingRisk, 1);
  
  return {
    heart: Math.max(100 - organDamage * 30 - (heartRate > 120 ? 10 : 0), 30),
    lungs: Math.max(100 - organDamage * 35 - (100 - o2Sat), 30),
    kidneys: Math.max(100 - organDamage * 40 - lactate * 5, 20),
    liver: Math.max(100 - organDamage * 35 - clottingRisk * 30, 30),
    brain: Math.max(100 - organDamage * 25 - (o2Sat < 90 ? 15 : 0), 40)
  };
};

export const getHealthColor = (value: number, thresholds: { good: number, warning: number }) => {
  if (value > thresholds.good) return '#22c55e';
  if (value > thresholds.warning) return '#f59e0b';
  return '#ef4444';
};