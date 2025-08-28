// bacteria.utils.tsx - Enhanced Utility Functions with Physiology Integration
// Updated: Contains all utility classes and functions for the bacteremia simulation

import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import {
  BacterialSpecies,
  BacterialStrain,
  AntibioticClass,
  PhageLibrary,
  PhageStrategy,
  Genome,
  BACTERIAL_PROFILES,
  ANTIBIOTIC_PROFILES,
  ADVANCED_CONFIG,
  NutrientType,
  MetabolicPathway,
  BacterialToxins,
  SurfaceStructures,
  PeptidoglycanLayer,
  OuterMembrane,
  EnhancedBacterium,
  PatientVitals,
  EpidemiologicalParameters
} from './bacteria.types';

// ============= SPATIAL INDEXING (ENHANCED OCTREE) =============
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

  insert(entity: any): boolean {
    if (!this.contains(entity)) return false;
    
    if (this.entities.size < this.maxEntities || this.depth >= this.maxDepth) {
      this.entities.add(entity);
      entity.gridKey = `${this.bounds.x}_${this.bounds.y}_${this.bounds.z}`;
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

  // Enhanced intersection check with better boundary detection
  intersects(range: { x: number; y: number; z: number; radius: number }): boolean {
    const { x, y, z, size } = this.bounds;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const centerZ = z + size / 2;
    
    const dx = Math.abs(range.x - centerX);
    const dy = Math.abs(range.y - centerY);
    const dz = Math.abs(range.z - centerZ);

    if (dx > (range.radius + size / 2)) return false;
    if (dy > (range.radius + size / 2)) return false;
    if (dz > (range.radius + size / 2)) return false;

    if (dx <= (size / 2)) return true;
    if (dy <= (size / 2)) return true;
    if (dz <= (size / 2)) return true;

    const cornerDist = Math.sqrt(
      Math.pow(dx - size / 2, 2) +
      Math.pow(dy - size / 2, 2) +
      Math.pow(dz - size / 2, 2)
    );

    return cornerDist <= range.radius;
  }

  clear() {
    this.entities.clear();
    if (this.children) {
      this.children.forEach(child => child.clear());
      this.children = null;
    }
  }

  // Get total entity count for debugging
  getEntityCount(): number {
    let count = this.entities.size;
    if (this.children) {
      for (const child of this.children) {
        count += child.getEntityCount();
      }
    }
    return count;
  }
}

// ============= ENHANCED BACTERIAL EVOLUTION ENGINE =============
export class BacterialEvolution {
  private strainLibrary: Map<string, BacterialStrain> = new Map();
  private mutationCounter = 0;
  private generationStats: Map<number, { strains: number; avgFitness: number }> = new Map();

  generateStrain(species: BacterialSpecies, parentStrain?: BacterialStrain): BacterialStrain {
    const baseProfile = BACTERIAL_PROFILES[species];
    const strainId = `${species}_${Date.now()}_${this.mutationCounter++}`;
    
    let genome: Genome;
    let color = baseProfile.color;
    let generation = 0;
    
    if (parentStrain) {
      genome = this.mutateGenome(parentStrain.genome, species);
      color = this.mutateColor(parentStrain.color);
      generation = parentStrain.generation + 1;
    } else {
      genome = this.createBaseGenome(species);
    }

    genome.fitnessCoat = this.calculateFitnessCost(genome);

    const strain: BacterialStrain = {
      id: strainId,
      parentSpecies: species,
      serotype: this.generateSerotype(species),
      genome,
      mutationHistory: parentStrain ? [...parentStrain.mutationHistory, strainId] : [strainId],
      generation,
      color,
      morphology: {
        shape: baseProfile.shape,
        size: this.mutateSize(baseProfile.size, parentStrain?.morphology.size),
        peptidoglycan: this.mutatePeptidoglycan(baseProfile.peptidoglycan, parentStrain?.morphology.peptidoglycan),
        outerMembrane: !baseProfile.gramPositive ? this.mutateOuterMembrane(baseProfile.outerMembrane!, parentStrain?.morphology.outerMembrane) : undefined,
        surface: this.generateSurfaceStructures(species, parentStrain?.morphology.surface)
      },
      epidemiology: this.mutateEpidemiology(baseProfile, parentStrain?.epidemiology)
    };

    this.strainLibrary.set(strainId, strain);
    this.updateGenerationStats(generation, strain);
    return strain;
  }

  private createBaseGenome(species: BacterialSpecies): Genome {
    const baseProfile = BACTERIAL_PROFILES[species];
    
    return {
      chromosomalDNA: {
        size: 2.5 + Math.random() * 2, // Mbp
        GCcontent: 40 + Math.random() * 20, // %
        essentialGenes: 300 + Math.floor(Math.random() * 200)
      },
      plasmids: Math.random() > 0.5 ? [{
        name: `pResistance_${Math.random().toString(36).substr(2, 5)}`,
        size: 5 + Math.random() * 50, // kbp
        copyNumber: Math.floor(1 + Math.random() * 10),
        resistanceGenes: ['blaTEM', 'aacA4'],
        mobilizable: Math.random() > 0.3
      }] : [],
      resistanceGenes: new Map(Object.entries(baseProfile.defaultResistance) as [AntibioticClass, number][]),
      virulenceFactors: {
        toxinProduction: this.generateToxins(species),
        adhesins: this.getSpeciesAdhesins(species),
        invasins: this.getSpeciesInvasins(species),
        biofilmGenes: {
          pgaABCD: Math.random() > 0.5,
          icaADBC: species === 'S_aureus',
          csgAB: species === 'E_coli'
        },
        siderophores: this.getSpeciesSiderophores(species)
      },
      phageResistance: {
        crispr: Math.random() < 0.1,
        restrictionModification: Math.random() < 0.2,
        abortiveInfection: Math.random() < 0.05,
        sie: Math.random() < 0.05
      },
      metabolicCapabilities: {
        pathways: this.getMetabolicPathways(species),
        oxygenRequirement: baseProfile.oxygenRequirement,
        preferredCarbon: this.getPreferredCarbon(species)
      },
      fitnessCoat: 0
    };
  }

  private mutateGenome(parent: Genome, species: BacterialSpecies): Genome {
    const mutated = JSON.parse(JSON.stringify(parent)) as Genome;
    mutated.resistanceGenes = new Map(parent.resistanceGenes);
    
    // Chromosomal mutations
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 10) {
      mutated.chromosomalDNA.GCcontent += (Math.random() - 0.5) * 2;
      mutated.chromosomalDNA.GCcontent = Math.max(30, Math.min(70, mutated.chromosomalDNA.GCcontent));
    }
    
    // Resistance gene mutations - under selection pressure
    mutated.resistanceGenes.forEach((value, key) => {
      if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 50) { // Higher rate under drug pressure
        const delta = (Math.random() - 0.5) * 0.1;
        mutated.resistanceGenes.set(key, Math.max(0, Math.min(1, value + delta)));
      }
    });

    // Acquire new resistance genes
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 5) {
      const antibiotics: AntibioticClass[] = ['penicillin', 'vancomycin', 'ciprofloxacin', 'gentamicin', 'ceftriaxone'];
      const newResistance = antibiotics[Math.floor(Math.random() * antibiotics.length)];
      mutated.resistanceGenes.set(newResistance, Math.random() * 0.3);
    }

    // Virulence factor mutations
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 20) {
      this.mutateVirulenceFactors(mutated.virulenceFactors, species);
    }

    // Phage resistance evolution
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 30) {
      if (!mutated.phageResistance.crispr && Math.random() < 0.1) {
        mutated.phageResistance.crispr = true;
      }
      if (!mutated.phageResistance.restrictionModification && Math.random() < 0.15) {
        mutated.phageResistance.restrictionModification = true;
      }
    }

    // Metabolic mutations
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * 5) {
      this.mutateMetabolism(mutated.metabolicCapabilities);
    }

    return mutated;
  }

  private mutateVirulenceFactors(vf: any, species: BacterialSpecies) {
    // Mutate toxin production levels
    Object.keys(vf.toxinProduction.exotoxins).forEach(toxin => {
      if (vf.toxinProduction.exotoxins[toxin]) {
        vf.toxinProduction.exotoxins[toxin] *= 0.8 + Math.random() * 0.4;
      }
    });

    // Gain/lose adhesins
    if (Math.random() < 0.1) {
      const possibleAdhesins = this.getSpeciesAdhesins(species);
      const newAdhesin = possibleAdhesins[Math.floor(Math.random() * possibleAdhesins.length)];
      if (!vf.adhesins.includes(newAdhesin)) {
        vf.adhesins.push(newAdhesin);
      }
    }

    // Biofilm gene regulation changes
    if (Math.random() < 0.2) {
      vf.biofilmGenes.pgaABCD = !vf.biofilmGenes.pgaABCD;
    }
  }

  private mutateMetabolism(mc: any) {
    // Change preferred carbon sources
    const carbonSources: NutrientType[] = ['glucose', 'lactose', 'amino_acids', 'fatty_acids'];
    if (Math.random() < 0.3) {
      const newCarbon = carbonSources[Math.floor(Math.random() * carbonSources.length)];
      if (!mc.preferredCarbon.includes(newCarbon)) {
        mc.preferredCarbon.push(newCarbon);
      }
    }

    // Rare pathway acquisition
    if (Math.random() < 0.05) {
      const pathways: MetabolicPathway[] = ['glycolysis', 'TCA', 'fermentation', 'beta_oxidation', 'oxidative_phosphorylation'];
      const newPathway = pathways[Math.floor(Math.random() * pathways.length)];
      if (!mc.pathways.includes(newPathway)) {
        mc.pathways.push(newPathway);
      }
    }
  }

  // Helper methods for species-specific traits
  private getSpeciesAdhesins(species: BacterialSpecies): string[] {
    const adhesinMap: { [key in BacterialSpecies]: string[] } = {
      'S_aureus': ['proteinA', 'fibronectinBP', 'collagenBP'],
      'E_coli': ['fimH', 'papG', 'afa', 'sfa'],
      'P_aeruginosa': ['flagellin', 'pilin', 'alginate'],
      'K_pneumoniae': ['fimA', 'kpn', 'mrkD'],
      'S_pyogenes': ['mProtein', 'fba', 'sof'],
      'E_faecalis': ['ace', 'esp', 'gelE']
    };
    return adhesinMap[species] || ['fimH'];
  }

  private getSpeciesInvasins(species: BacterialSpecies): string[] {
    const invasinMap: { [key in BacterialSpecies]: string[] } = {
      'S_aureus': ['agr', 'fnbA', 'fnbB'],
      'E_coli': ['ipaB', 'eae', 'tir'],
      'P_aeruginosa': ['exsA', 'exsC', 'exsE'],
      'K_pneumoniae': ['kfu', 'uge'],
      'S_pyogenes': ['spe', 'ska', 'slo'],
      'E_faecalis': ['cylA', 'efaA']
    };
    return invasinMap[species] || ['ipaB'];
  }

  private getSpeciesSiderophores(species: BacterialSpecies): string[] {
    const siderophoreMap: { [key in BacterialSpecies]: string[] } = {
      'S_aureus': ['staphyloferrin'],
      'E_coli': ['enterobactin', 'salmochelin'],
      'P_aeruginosa': ['pyoverdine', 'pyochelin'],
      'K_pneumoniae': ['enterobactin', 'yersiniabactin'],
      'S_pyogenes': ['streptonigrin'],
      'E_faecalis': ['enterobactin']
    };
    return siderophoreMap[species] || ['enterobactin'];
  }

  private getMetabolicPathways(species: BacterialSpecies): MetabolicPathway[] {
    const pathways: MetabolicPathway[] = ['glycolysis'];
    const oxygenReq = BACTERIAL_PROFILES[species].oxygenRequirement;
    
    if (oxygenReq === 'aerobic' || oxygenReq === 'facultative') {
      pathways.push('TCA', 'oxidative_phosphorylation');
    }
    
    if (oxygenReq === 'facultative') {
      pathways.push('fermentation');
    }
    
    if (species === 'P_aeruginosa') {
      pathways.push('beta_oxidation'); // Can use fatty acids
    }
    
    return pathways;
  }

  private getPreferredCarbon(species: BacterialSpecies): NutrientType[] {
    const preferences: { [key in BacterialSpecies]: NutrientType[] } = {
      'S_aureus': ['glucose', 'amino_acids'],
      'E_coli': ['glucose', 'lactose', 'amino_acids'],
      'P_aeruginosa': ['glucose', 'amino_acids', 'fatty_acids'],
      'K_pneumoniae': ['glucose', 'lactose'],
      'S_pyogenes': ['glucose'],
      'E_faecalis': ['glucose', 'amino_acids']
    };
    return preferences[species] || ['glucose'];
  }

  private generateToxins(species: BacterialSpecies): BacterialToxins {
    const toxins: BacterialToxins = {
      exotoxins: {},
      endotoxin: BACTERIAL_PROFILES[species].gramPositive ? 0 : 1,
      superantigens: []
    };

    switch (species) {
      case 'S_aureus':
        toxins.exotoxins.alphaHemolysin = 0.8 + Math.random() * 0.4;
        toxins.superantigens = ['TSST-1', 'SEB'];
        break;
      case 'S_pyogenes':
        toxins.exotoxins.streptolysinO = 0.7 + Math.random() * 0.6;
        toxins.superantigens = ['SpeA', 'SpeC'];
        break;
      case 'P_aeruginosa':
        toxins.exotoxins.exotoxinA = 0.6 + Math.random() * 0.8;
        break;
      case 'E_coli':
        if (Math.random() < 0.2) { // EHEC strains
          toxins.exotoxins.verotoxin = 0.9 + Math.random() * 0.2;
        }
        break;
    }

    return toxins;
  }

  private generateSerotype(species: BacterialSpecies): string {
    const serotypes: { [key in BacterialSpecies]: string[] } = {
      'S_aureus': ['MRSA-USA300', 'MRSA-USA100', 'MSSA-CC398', 'VRSA'],
      'E_coli': ['O157:H7', 'O104:H4', 'O25:H4-ST131', 'K12'],
      'P_aeruginosa': ['PA01', 'PA14', 'LESB58', 'DK2'],
      'K_pneumoniae': ['K1-ST23', 'K2-ST86', 'ST258', 'ST11'],
      'S_pyogenes': ['M1T1', 'M3T3', 'M12T12', 'M89T89'],
      'E_faecalis': ['V583', 'OG1RF', 'MMH594', 'TX0102']
    };
    
    const options = serotypes[species] || ['WT'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private mutateSize(baseSize: { width: number; length: number }, parentSize?: { width: number; length: number }): { width: number; length: number } {
    if (!parentSize) return baseSize;
    
    const widthDelta = (Math.random() - 0.5) * 0.1;
    const lengthDelta = (Math.random() - 0.5) * 0.1;
    
    return {
      width: Math.max(0.3, Math.min(3.0, parentSize.width + widthDelta)),
      length: Math.max(0.3, Math.min(5.0, parentSize.length + lengthDelta))
    };
  }

  private mutatePeptidoglycan(basePG: PeptidoglycanLayer, parentPG?: PeptidoglycanLayer): PeptidoglycanLayer {
    if (!parentPG) return basePG;
    
    return {
      ...parentPG,
      thickness: Math.max(2, Math.min(120, parentPG.thickness + (Math.random() - 0.5) * 5)),
      crosslinking: Math.max(0.1, Math.min(1.0, parentPG.crosslinking + (Math.random() - 0.5) * 0.1)),
      lysozymeSusceptibility: Math.max(0, Math.min(1, parentPG.lysozymeSusceptibility + (Math.random() - 0.5) * 0.1)),
      betaLactamTargets: Math.max(1, Math.min(10, parentPG.betaLactamTargets + Math.floor((Math.random() - 0.5) * 2)))
    };
  }

  private mutateOuterMembrane(baseOM: OuterMembrane, parentOM?: OuterMembrane): OuterMembrane {
    if (!parentOM) return baseOM;
    
    return {
      ...parentOM,
      porins: Math.max(0, Math.min(10, parentOM.porins + Math.floor((Math.random() - 0.5) * 2))),
      effluxPumps: Math.max(0, Math.min(15, parentOM.effluxPumps + Math.floor((Math.random() - 0.5) * 2)))
    };
  }

  private generateSurfaceStructures(species: BacterialSpecies, parentSurface?: SurfaceStructures): SurfaceStructures {
    const profile = BACTERIAL_PROFILES[species];
    const base = {
      flagella: {
        type: profile.flagella,
        number: profile.flagella === 'peritrichous' ? 8 + Math.floor(Math.random() * 4) : 
                profile.flagella === 'monotrichous' ? 1 : 0,
        motorProteins: profile.flagella !== 'atrichous' ? 15 + Math.floor(Math.random() * 10) : 0,
        chemotaxisReceptors: profile.flagella !== 'atrichous' ? 3 + Math.floor(Math.random() * 4) : 0,
        swimmingSpeed: profile.speed * (0.8 + Math.random() * 0.4)
      },
      pili: {
        type: profile.pili,
        density: profile.pili !== 'none' ? 80 + Math.floor(Math.random() * 40) : 0,
        adhesins: this.getSpeciesAdhesins(species).slice(0, 2),
        twitchingMotility: profile.pili === 'type_IV'
      },
      capsule: {
        present: Math.random() > 0.3,
        thickness: 40 + Math.random() * 80,
        composition: 'polysaccharide' as const,
        phagocytosisResistance: 0.3 + Math.random() * 0.5
      }
    };

    if (parentSurface) {
      // Mutate from parent
      base.flagella.number = Math.max(0, parentSurface.flagella.number + Math.floor((Math.random() - 0.5) * 2));
      base.pili.density = Math.max(0, parentSurface.pili.density + Math.floor((Math.random() - 0.5) * 20));
      base.capsule.thickness = Math.max(10, parentSurface.capsule.thickness + (Math.random() - 0.5) * 20);
      base.capsule.phagocytosisResistance = Math.max(0, Math.min(1, 
        parentSurface.capsule.phagocytosisResistance + (Math.random() - 0.5) * 0.1
      ));
    }

    return base;
  }

  private mutateEpidemiology(baseProfile: any, parentEpi?: EpidemiologicalParameters): EpidemiologicalParameters {
    const base = {
      R0: baseProfile.R0,
      generationTime: baseProfile.divisionTime,
      infectiousPeriod: baseProfile.divisionTime * 10,
      incubationPeriod: baseProfile.divisionTime / 2,
      transmissionRate: 0.01,
      contactRate: 10,
      recoveryRate: 0.1,
      mortalityRate: 0.01,
      ID50: baseProfile.ID50,
      LD50: baseProfile.LD50
    };

    if (parentEpi) {
      base.R0 = Math.max(0.5, parentEpi.R0 + (Math.random() - 0.5) * 0.2);
      base.generationTime = Math.max(10, parentEpi.generationTime + (Math.random() - 0.5) * 5);
      base.ID50 = Math.max(1, parentEpi.ID50 * (0.8 + Math.random() * 0.4));
      base.LD50 = Math.max(100, parentEpi.LD50 * (0.8 + Math.random() * 0.4));
    }

    return base;
  }

  // Enhanced horizontal gene transfer with more realistic mechanics
  horizontalGeneTransfer(donor: BacterialStrain, recipient: BacterialStrain): BacterialStrain | null {
    // Check compatibility
    const phylogeneticDistance = this.calculatePhylogeneticDistance(donor.parentSpecies, recipient.parentSpecies);
    const transferProbability = Math.max(0, 1 - phylogeneticDistance / 2);
    
    if (Math.random() > transferProbability) return null;

    const newGenome = JSON.parse(JSON.stringify(recipient.genome));
    newGenome.resistanceGenes = new Map(recipient.genome.resistanceGenes);
    let transferred = false;

    // Conjugative plasmid transfer
    donor.genome.plasmids.forEach(plasmid => {
      if (plasmid.mobilizable && Math.random() < 0.3) {
        newGenome.plasmids.push({ ...plasmid });
        // Transfer resistance genes from plasmid
        plasmid.resistanceGenes.forEach(gene => {
          const antibioticClass = this.mapGeneToAntibiotic(gene);
          if (antibioticClass) {
            const currentLevel = newGenome.resistanceGenes.get(antibioticClass) || 0;
            newGenome.resistanceGenes.set(antibioticClass, Math.min(1, currentLevel + 0.3));
          }
        });
        transferred = true;
      }
    });

    // Chromosomal gene transfer (less common)
    if (Math.random() < ADVANCED_CONFIG.HGT_RATE * 10) {
      donor.genome.resistanceGenes.forEach((level, antibiotic) => {
        if (Math.random() < 0.1) {
          const currentLevel = newGenome.resistanceGenes.get(antibiotic) || 0;
          newGenome.resistanceGenes.set(antibiotic, Math.max(currentLevel, level * 0.5));
          transferred = true;
        }
      });
    }

    // Transfer virulence factors
    if (Math.random() < 0.05) {
      donor.genome.virulenceFactors.adhesins.forEach(adhesin => {
        if (Math.random() < 0.2 && !newGenome.virulenceFactors.adhesins.includes(adhesin)) {
          newGenome.virulenceFactors.adhesins.push(adhesin);
          transferred = true;
        }
      });
    }

    return transferred ? this.generateStrain(recipient.parentSpecies, {
      ...recipient,
      genome: newGenome
    }) : null;
  }

  private calculatePhylogeneticDistance(species1: BacterialSpecies, species2: BacterialSpecies): number {
    // Simplified phylogenetic distances (0 = same species, 1 = different genus)
    const distances: { [key: string]: number } = {
      'S_aureus-S_pyogenes': 0.8, // Different genera but both Gram+
      'S_aureus-E_faecalis': 0.7,
      'E_coli-K_pneumoniae': 0.3, // Same family
      'E_coli-P_aeruginosa': 0.6, // Different families but both Gram-
      'S_aureus-E_coli': 1.0, // Gram+ vs Gram-
    };
    
    const key1 = `${species1}-${species2}`;
    const key2 = `${species2}-${species1}`;
    
    return distances[key1] || distances[key2] || 0;
  }

  private mapGeneToAntibiotic(gene: string): AntibioticClass | null {
    const geneMap: { [key: string]: AntibioticClass } = {
      'blaTEM': 'penicillin',
      'blaCTX': 'ceftriaxone',
      'vanA': 'vancomycin',
      'vanB': 'vancomycin',
      'aacA4': 'gentamicin',
      'aph3': 'gentamicin',
      'qnrA': 'ciprofloxacin',
      'gyrA': 'ciprofloxacin'
    };
    
    return geneMap[gene] || null;
  }

  calculateFitnessCost(genome: Genome): number {
    let cost = 0;
    
    // Resistance cost - higher resistance = higher cost
    genome.resistanceGenes.forEach(level => {
      cost += level * 0.15;
    });

    // Phage resistance mechanisms cost
    if (genome.phageResistance.crispr) cost += 0.20; // CRISPR is expensive
    if (genome.phageResistance.restrictionModification) cost += 0.10;
    if (genome.phageResistance.abortiveInfection) cost += 0.05;
    
    // Plasmid maintenance cost
    genome.plasmids.forEach(plasmid => {
      cost += 0.02 + (plasmid.size / 1000) * 0.03; // Size-dependent cost
    });
    
    // Virulence factor cost
    const toxinCount = Object.keys(genome.virulenceFactors.toxinProduction.exotoxins).length;
    cost += toxinCount * 0.05;
    
    // Metabolic flexibility benefit (negative cost)
    cost -= genome.metabolicCapabilities.pathways.length * 0.02;
    
    return Math.max(0, Math.min(cost, 0.8)); // Cap at 80% fitness cost
  }

  mutateColor(parentColor: string): string {
    const r = parseInt(parentColor.slice(1, 3), 16);
    const g = parseInt(parentColor.slice(3, 5), 16);
    const b = parseInt(parentColor.slice(5, 7), 16);
    
    const mutationStrength = 30;
    const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * mutationStrength));
    const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * mutationStrength));
    const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * mutationStrength));
    
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }

  private updateGenerationStats(generation: number, strain: BacterialStrain) {
    const current = this.generationStats.get(generation) || { strains: 0, avgFitness: 0 };
    const newFitness = 1 - strain.genome.fitnessCoat;
    
    current.strains++;
    current.avgFitness = ((current.avgFitness * (current.strains - 1)) + newFitness) / current.strains;
    
    this.generationStats.set(generation, current);
  }

  getEvolutionaryStats(): { generations: number; totalStrains: number; fitnessOverTime: Array<{ generation: number; fitness: number }> } {
    return {
      generations: this.generationStats.size,
      totalStrains: this.strainLibrary.size,
      fitnessOverTime: Array.from(this.generationStats.entries()).map(([gen, stats]) => ({
        generation: gen,
        fitness: stats.avgFitness
      }))
    };
  }
}

// ============= ENHANCED PHAGE THERAPY ENGINE =============
export class PhageTherapyEngine {
  phageLibraries: Map<string, PhageLibrary> = new Map();
  private phageEvolution: Map<string, number> = new Map(); // Track phage evolution

  constructor() {
    this.initializePhageLibraries();
  }

  initializePhageLibraries() {
    // Staphylococcus-specific phages
    this.phageLibraries.set('phage_K', {
      id: 'phage_K',
      name: 'Phage K (Anti-Staph)',
      family: 'Myoviridae',
      hostRange: ['S_aureus'],
      receptorSpecificity: ['teichoicAcid', 'proteinA'],
      strategy: 'lytic',
      genomeType: 'dsDNA',
      genomeSize: 148,
      burstSize: 100,
      latencyPeriod: 30,
      adsorptionRate: 0.8,
      specificity: 0.9,
      evolutionRate: 0.001,
      resistanceBreaking: true,
      temperatureStability: [4, 45],
      pHStability: [6, 8]
    });

    // E. coli phages
    this.phageLibraries.set('T7', {
      id: 'T7',
      name: 'T7 Phage',
      family: 'Podoviridae',
      hostRange: ['E_coli'],
      receptorSpecificity: ['lipopolysaccharide', 'ompF'],
      strategy: 'lytic',
      genomeType: 'dsDNA',
      genomeSize: 40,
      burstSize: 150,
      latencyPeriod: 20,
      adsorptionRate: 0.9,
      specificity: 0.95,
      evolutionRate: 0.002,
      resistanceBreaking: false,
      temperatureStability: [4, 50],
      pHStability: [6.5, 7.5]
    });

    // Broad-spectrum cocktail
    this.phageLibraries.set('cocktail_PAK', {
      id: 'cocktail_PAK',
      name: 'PAK Multi-Species Cocktail',
      family: 'Siphoviridae',
      hostRange: ['P_aeruginosa', 'K_pneumoniae'],
      receptorSpecificity: ['pilus', 'LPS', 'ompK36'],
      strategy: 'lytic',
      genomeType: 'dsDNA',
      genomeSize: 65,
      burstSize: 80,
      latencyPeriod: 40,
      adsorptionRate: 0.7,
      specificity: 0.7,
      evolutionRate: 0.003,
      resistanceBreaking: true,
      temperatureStability: [4, 40],
      pHStability: [6, 8.5]
    });

    // Temperate phage (can lysogenize)
    this.phageLibraries.set('lambda_like', {
      id: 'lambda_like',
      name: 'Lambda-like Temperate',
      family: 'Siphoviridae',
      hostRange: ['E_coli', 'K_pneumoniae'],
      receptorSpecificity: ['maltosePorin', 'lamB'],
      strategy: 'lysogenic',
      genomeType: 'dsDNA',
      genomeSize: 48,
      burstSize: 50,
      latencyPeriod: 60,
      adsorptionRate: 0.6,
      specificity: 0.8,
      evolutionRate: 0.001,
      resistanceBreaking: false,
      temperatureStability: [4, 42],
      pHStability: [6.5, 8]
    });

    // Streptococcus phage
    this.phageLibraries.set('phi_Cp1', {
      id: 'phi_Cp1',
      name: 'φCp-1 (Anti-Strep)',
      family: 'Siphoviridae',
      hostRange: ['S_pyogenes'],
      receptorSpecificity: ['mProtein', 'sof'],
      strategy: 'lytic',
      genomeType: 'dsDNA',
      genomeSize: 55,
      burstSize: 75,
      latencyPeriod: 35,
      adsorptionRate: 0.75,
      specificity: 0.85,
      evolutionRate: 0.002,
      resistanceBreaking: true,
      temperatureStability: [4, 42],
      pHStability: [6.5, 7.5]
    });
  }

  selectOptimalPhage(bacterialStrain: BacterialStrain, environment?: { temperature: number; pH: number }): PhageLibrary | null {
    let bestPhage: PhageLibrary | null = null;
    let bestScore = 0;

    this.phageLibraries.forEach(phage => {
      if (!phage.hostRange.includes(bacterialStrain.parentSpecies)) return;

      let score = phage.adsorptionRate * phage.specificity;
      
      // Check receptor compatibility
      let receptorMatch = false;
      phage.receptorSpecificity.forEach(receptor => {
        if (this.bacteriumHasReceptor(bacterialStrain, receptor)) {
          receptorMatch = true;
        }
      });
      
      if (!receptorMatch) score *= 0.1;
      
      // Account for bacterial resistance mechanisms
      if (bacterialStrain.genome.phageResistance.crispr) score *= 0.2;
      if (bacterialStrain.genome.phageResistance.restrictionModification) score *= 0.4;
      if (bacterialStrain.genome.phageResistance.sie) score *= 0.6;
      if (bacterialStrain.genome.phageResistance.abortiveInfection) score *= 0.7;
      
      // Resistance-breaking phages
      if (phage.resistanceBreaking) {
        if (bacterialStrain.genome.phageResistance.crispr) score *= 2.0;
        if (bacterialStrain.genome.phageResistance.restrictionModification) score *= 1.5;
      }

      // Environmental conditions
      if (environment) {
        if (environment.temperature < phage.temperatureStability[0] || 
            environment.temperature > phage.temperatureStability[1]) {
          score *= 0.1;
        }
        if (environment.pH < phage.pHStability[0] || 
            environment.pH > phage.pHStability[1]) {
          score *= 0.1;
        }
      }

      // Biofilm penetration penalty
      if (bacterialStrain.parentSpecies === 'P_aeruginosa' || bacterialStrain.parentSpecies === 'S_aureus') {
        score *= 0.7; // These species commonly form biofilms
      }

      if (score > bestScore) {
        bestScore = score;
        bestPhage = phage;
      }
    });

    return bestScore > 0.1 ? bestPhage : null;
  }

  private bacteriumHasReceptor(strain: BacterialStrain, receptor: string): boolean {
    const receptorMap: { [key: string]: boolean } = {
      'teichoicAcid': BACTERIAL_PROFILES[strain.parentSpecies].gramPositive,
      'proteinA': strain.parentSpecies === 'S_aureus',
      'lipopolysaccharide': !BACTERIAL_PROFILES[strain.parentSpecies].gramPositive,
      'ompF': strain.parentSpecies === 'E_coli',
      'ompK36': strain.parentSpecies === 'K_pneumoniae',
      'pilus': strain.morphology.surface.pili.type !== 'none',
      'maltosePorin': ['E_coli', 'K_pneumoniae'].includes(strain.parentSpecies),
      'lamB': strain.parentSpecies === 'E_coli',
      'mProtein': strain.parentSpecies === 'S_pyogenes',
      'sof': strain.parentSpecies === 'S_pyogenes'
    };
    
    return receptorMap[receptor] || false;
  }

  generatePhageCocktail(
    targetSpecies: BacterialSpecies[],
    maxPhages: number = 3
    ): PhageLibrary[] {
      const cocktail: PhageLibrary[] = [];
      const coveredSpecies = new Set<BacterialSpecies>();
      const selectedIds = new Set<string>();

      // First pass: pick the best-scoring phage for each target species
      for (const species of targetSpecies) {
        if (coveredSpecies.has(species) || cocktail.length >= maxPhages) continue;

        let bestPhage: PhageLibrary | null = null;
        let bestScore = -Infinity;

        for (const phage of this.phageLibraries.values()) {
          if (selectedIds.has(phage.id)) continue; // already chosen
          if (!phage.hostRange.includes(species)) continue;

          const score =
            phage.adsorptionRate *
            phage.specificity *
            (phage.resistanceBreaking ? 1.2 : 1.0);

          if (score > bestScore) {
            bestScore = score;
            bestPhage = phage;
          }
        }

        if (bestPhage) {
          cocktail.push(bestPhage);
          selectedIds.add(bestPhage.id);
          bestPhage.hostRange.forEach((host: BacterialSpecies) =>
            coveredSpecies.add(host)
          );
        }
      }

      // Second pass: add broad-spectrum phages to fill remaining slots
      for (const phage of this.phageLibraries.values()) {
        if (cocktail.length >= maxPhages) break;
        if (selectedIds.has(phage.id)) continue;

        const newCoverage = phage.hostRange.filter(host => !coveredSpecies.has(host));
        if (newCoverage.length > 1) {
          cocktail.push(phage);
          selectedIds.add(phage.id);
          phage.hostRange.forEach((host: BacterialSpecies) =>
            coveredSpecies.add(host)
          );
        }
      }

      return cocktail;
    }


  calculatePhageKinetics(phage: PhageLibrary, bacterialDensity: number, temperature: number = 37): {
    adsorption: number;
    burst: number;
    lysisTime: number;
    multiplicity: number;
  } {
    // Temperature effects
    const tempFactor = this.calculateTemperatureEffect(temperature, phage.temperatureStability);
    
    // Adsorption follows mass action kinetics: dP/dt = -k*P*B
    const adsorption = phage.adsorptionRate * bacterialDensity * tempFactor * 1e-9; // per phage per minute
    
    // Burst size affected by host physiology and temperature
    const hostMetabolism = Math.random() * 0.5 + 0.5; // Simplified host health factor
    const burst = Math.floor(phage.burstSize * hostMetabolism * tempFactor);
    
    // Lysis time varies with temperature and multiplicity of infection
    const multiplicity = Math.min(10, bacterialDensity / 1000); // Simplified MOI
    const lysisTime = phage.latencyPeriod * (0.8 + Math.random() * 0.4) / tempFactor * (1 + multiplicity * 0.1);
    
    return { adsorption, burst, lysisTime, multiplicity };
  }

  private calculateTemperatureEffect(temperature: number, stability: [number, number]): number {
    const [minTemp, maxTemp] = stability;
    const optimal = (minTemp + maxTemp) / 2;
    
    if (temperature < minTemp || temperature > maxTemp) {
      return 0.1; // Very poor survival
    }
    
    // Gaussian-like curve with optimum at midpoint
    const deviation = Math.abs(temperature - optimal) / ((maxTemp - minTemp) / 2);
    return Math.exp(-deviation * deviation);
  }

  evolvePhage(phage: PhageLibrary, hostResistance: number): PhageLibrary {
    const evolved = JSON.parse(JSON.stringify(phage));
    evolved.id = `${phage.id}_evolved_${Date.now()}`;
    
    // Counter-evolution to overcome resistance
    if (hostResistance > 0.5) {
      evolved.adsorptionRate = Math.min(1, evolved.adsorptionRate * 1.1);
      evolved.resistanceBreaking = true;
      evolved.specificity = Math.max(0.3, evolved.specificity * 0.95); // Trade-off
    }
    
    // Random mutations
    if (Math.random() < evolved.evolutionRate) {
      evolved.burstSize += Math.floor((Math.random() - 0.5) * 20);
      evolved.latencyPeriod += Math.floor((Math.random() - 0.5) * 10);
      evolved.adsorptionRate += (Math.random() - 0.5) * 0.1;
      
      // Bounds checking
      evolved.burstSize = Math.max(10, Math.min(300, evolved.burstSize));
      evolved.latencyPeriod = Math.max(15, Math.min(120, evolved.latencyPeriod));
      evolved.adsorptionRate = Math.max(0.1, Math.min(1, evolved.adsorptionRate));
    }
    
    return evolved;
  }
}

// ============= PHYSIOLOGICAL CALCULATION UTILITIES =============
export const calculateSepsisScore = (
  bacterialLoad: number, 
  cytokineStorm: boolean, 
  simulationTime: number, 
  clottingRisk: number,
  vitals?: PatientVitals
): number => {
  let score = 0;
  
  // Bacterial load contribution (0-40 points)
  if (bacterialLoad > 200) score += 40;
  else if (bacterialLoad > 100) score += 30;
  else if (bacterialLoad > 50) score += 20;
  else if (bacterialLoad > 10) score += 10;
  
  // Cytokine storm (0-30 points)
  if (cytokineStorm) score += 30;
  
  // Time progression - sepsis worsens over time (0-15 points)
  const timeHours = simulationTime / 60;
  if (timeHours > 12) score += 15;
  else if (timeHours > 6) score += 10;
  else if (timeHours > 2) score += 5;
  
  // Coagulation dysfunction (0-15 points)
  score += clottingRisk * 15;
  
  // Vital signs contribution if available
  if (vitals) {
    // Temperature
    if (vitals.temperature > 38.3 || vitals.temperature < 36) score += 5;
    
    // Heart rate
    if (vitals.heartRate > 90) score += 5;
    
    // Respiratory rate
    if (vitals.respiratoryRate > 20) score += 5;
    
    // Hypotension
    if (vitals.bloodPressure.systolic < 90) score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

export const calculateOrganDamage = (
  sepsisScore: number,
  clottingRisk: number,
  heartRate: number,
  o2Sat: number,
  lactate: number,
  bacterialToxins: number = 0
) => {
  const baseDamage = sepsisScore / 100;
  const toxinDamage = Math.min(0.3, bacterialToxins / 10);
  
  return {
    heart: Math.max(20, 100 - baseDamage * 25 - (heartRate > 120 ? 15 : 0) - clottingRisk * 20),
    lungs: Math.max(20, 100 - baseDamage * 30 - Math.max(0, 95 - o2Sat) * 2 - toxinDamage * 50),
    kidneys: Math.max(10, 100 - baseDamage * 35 - lactate * 8 - clottingRisk * 15),
    liver: Math.max(15, 100 - baseDamage * 28 - clottingRisk * 25 - toxinDamage * 40),
    brain: Math.max(30, 100 - baseDamage * 20 - (o2Sat < 90 ? 20 : 0) - lactate * 5)
  };
};

export const getHealthColor = (value: number, thresholds: { good: number, warning: number }) => {
  if (value > thresholds.good) return '#22c55e';  // Green
  if (value > thresholds.warning) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

// ============= PHARMACOKINETIC UTILITIES =============
export const calculateDrugHalfLife = (clearance: number, volumeDistribution: number): number => {
  // t½ = 0.693 × Vd / CL
  return (0.693 * volumeDistribution) / clearance;
};

export const calculateSteadyStateTime = (halfLife: number): number => {
  // Approximately 5 half-lives to reach steady state
  return halfLife * 5;
};

export const calculateDrugAccumulation = (
  dose: number,
  interval: number,
  halfLife: number,
  time: number
): number => {
  // Accumulation factor for multiple dosing
  const k = 0.693 / halfLife;
  const accumulationFactor = 1 / (1 - Math.exp(-k * interval));
  return dose * accumulationFactor * (1 - Math.exp(-k * time));
};

// ============= BIOFILM CALCULATION UTILITIES =============
export const calculateBiofilmPenetration = (
  antibioticMW: number,
  biofilmThickness: number,
  matrixDensity: number
): number => {
  // Simplified biofilm penetration model
  // Larger molecules and denser biofilms reduce penetration
  const diffusionCoeff = Math.max(0.01, 1 - (antibioticMW / 1000));
  const thicknessPenalty = Math.exp(-biofilmThickness / 50);
  const densityPenalty = Math.max(0.1, 1 - matrixDensity);
  
  return diffusionCoeff * thicknessPenalty * densityPenalty;
};

export const calculateQuorumSensingStrength = (
  bacterialDensity: number,
  species: BacterialSpecies,
  distance: number
): number => {
  const baseThreshold = BACTERIAL_PROFILES[species].quorumThreshold;
  const localDensity = Math.max(0, bacterialDensity - Math.pow(distance / 10, 2));
  return Math.min(2, localDensity / baseThreshold);
};

// ============= IMMUNE RESPONSE UTILITIES =============
export const calculateCytokineProduction = (
  bacterialLoad: number,
  species: BacterialSpecies[],
  immuneActivation: number
): { [key: string]: number } => {
  const gramNegativeCount = species.filter(s => !BACTERIAL_PROFILES[s].gramPositive).length;
  const gramPositiveCount = species.length - gramNegativeCount;
  
  return {
    TNFa: Math.min(50, bacterialLoad * 0.1 + gramNegativeCount * 5) * immuneActivation,
    IL6: Math.min(100, bacterialLoad * 0.15 + gramPositiveCount * 3) * immuneActivation,
    IL1: Math.min(30, bacterialLoad * 0.08 + gramNegativeCount * 4) * immuneActivation,
    IL10: Math.min(20, immuneActivation * 10 * (immuneActivation > 0.8 ? 1 : 0.3)), // Anti-inflammatory response
    IFNg: Math.min(25, bacterialLoad * 0.05) * immuneActivation
  };
};

export const calculateAntibodyAffinity = (
  antigenExposure: number,
  timeElapsed: number,
  somaticMutations: number
): number => {
  // Affinity maturation over time with somatic hypermutation
  const baseLnKd = 6; // ln(1000 nM) - initial low affinity
  const maturationRate = 0.1;
  const mutationBonus = somaticMutations * 0.05;
  
  const lnKd = baseLnKd - (maturationRate * Math.log(1 + antigenExposure * timeElapsed) + mutationBonus);
  return Math.exp(lnKd); // Return Kd in nM (lower = higher affinity)
};

// ============= MATHEMATICAL UTILITIES =============
export const sigmoid = (x: number, k: number = 1, x0: number = 0): number => {
  return 1 / (1 + Math.exp(-k * (x - x0)));
};

export const hillEquation = (concentration: number, kd: number, hillCoeff: number): number => {
  const cNorm = Math.pow(concentration, hillCoeff);
  const kdNorm = Math.pow(kd, hillCoeff);
  return cNorm / (cNorm + kdNorm);
};

export const michaelisMenten = (substrate: number, vmax: number, km: number): number => {
  return (vmax * substrate) / (km + substrate);
};

// ============= VALIDATION UTILITIES =============
export const validatePhysiologicalBounds = (vitals: PatientVitals): PatientVitals => {
  return {
    ...vitals,
    heartRate: Math.max(30, Math.min(250, vitals.heartRate)),
    temperature: Math.max(30, Math.min(45, vitals.temperature)),
    respiratoryRate: Math.max(5, Math.min(60, vitals.respiratoryRate)),
    oxygenSaturation: Math.max(50, Math.min(100, vitals.oxygenSaturation)),
    pH: Math.max(6.8, Math.min(7.8, vitals.pH)),
    lactate: Math.max(0.5, Math.min(30, vitals.lactate)),
    creatinine: Math.max(0.3, Math.min(15, vitals.creatinine)),
    bilirubin: Math.max(0.1, Math.min(50, vitals.bilirubin))
  };
};

export const clampValue = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};


// ============= HELPER FUNCTIONS =============
export const formatTime = (minutes: number): string => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

export const formatRealTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

export const getSeverityColor = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value < thresholds.low) return '#22c55e';
    if (value < thresholds.medium) return '#f59e0b';
    if (value < thresholds.high) return '#f97316';
    return '#ef4444';
  };

export const getSeverityIcon = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value < thresholds.low) return <CheckCircle size={14} />;
    if (value < thresholds.medium) return <AlertCircle size={14} />;
    if (value < thresholds.high) return <AlertTriangle size={14} />;
    return <XCircle size={14} />;
  };