// bacteria.types.tsx - Complete Type Definitions with Enhanced Physiology
// Updated: Contains all types needed for the bacteremia simulation with differential equations

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
  EVOLUTION_INTERVAL: 100,
  NUTRIENT_DIFFUSION_RATE: 0.1,
  OXYGEN_DIFFUSION_RATE: 0.15
};

// ============= BASIC BACTERIAL TYPES =============
export type BacterialSpecies = "S_aureus" | "E_coli" | "P_aeruginosa" | "K_pneumoniae" | "S_pyogenes" | "E_faecalis";
export type BacterialShape = "cocci" | "bacilli" | "spirilli" | "vibrio" | "spirochete";
export type GramStain = "positive" | "negative";
export type FlagellarArrangement = "monotrichous" | "amphitrichous" | "lophotrichous" | "peritrichous" | "atrichous";
export type PiliType = "type_I" | "type_IV" | "conjugative" | "none";
export type MetabolicState = "active" | "dormant" | "persister" | "spore" | "VBNC"; // VBNC = Viable But Non-Culturable

// ============= CELL TYPES AND SUBSTANCES =============
export type CellType = "rbc" | "neutrophil" | "macrophage" | "tcell" | "bcell" | "nk" | "platelet" | "dendritic" | "eosinophil" | "basophil";
export type AntibodyType = "IgM" | "IgG" | "IgA" | "IgE" | "IgD";
export type ClotComponent = "fibrin" | "platelet" | "rbc" | "vWF" | "factor_VIII" | "thrombin";
export type AntibioticClass = "penicillin" | "vancomycin" | "ciprofloxacin" | "gentamicin" | "ceftriaxone";
export type PhageStrategy = "lytic" | "lysogenic" | "chronic" | "pseudolysogenic";
export type CytokineType = "IL1" | "IL6" | "TNFa" | "IFNg" | "IL10" | "IL8" | "MCP1" | "GMCSF" | "TGFb";
export type NutrientType = "glucose" | "lactose" | "amino_acids" | "fatty_acids" | "iron" | "oxygen";
export type MetabolicPathway = "glycolysis" | "TCA" | "fermentation" | "beta_oxidation" | "oxidative_phosphorylation";

// ============= CARDIOVASCULAR STATE (NEW FOR PHYSIOLOGY) =============
export interface CardiovascularState {
  heartRate: number;              // beats/min
  strokeVolume: number;           // mL
  cardiacOutput: number;          // L/min
  meanArterialPressure: number;   // mmHg
  systemicVascularResistance: number; // dyn⋅s⋅cm⁻⁵
  arterialTone: number;           // 0=max vasodilation, 1=max vasoconstriction
  venousTone: number;             // 0-1
  capillaryPermeability: number;  // 0-1
  endothelialFunction: number;    // 0-1 (1=healthy)
  bloodFlowRate: number;          // cm/s
  oxygenDelivery: number;         // mL/min
  tissueHypoxia: number;          // 0-1
}

// ============= INFLAMMATORY STATE (NEW FOR PHYSIOLOGY) =============
export interface InflammatoryState {
  TNFalpha: number;               // pg/mL
  IL1beta: number;                // pg/mL
  IL6: number;                    // pg/mL
  IL10: number;                   // pg/mL (anti-inflammatory)
  nitricOxide: number;            // μmol/L
  prostaglandinE2: number;        // ng/mL
  histamine: number;              // ng/mL
  complement: number;             // CH50 units
  lactate: number;                // mmol/L
  endotoxin: number;              // EU/mL
}

// ============= CELL WALL AND MEMBRANE STRUCTURES =============
export interface PeptidoglycanLayer {
  thickness: number;              // nm, Gram+ ~30-100nm, Gram- ~2-7nm
  crosslinking: number;           // 0-1, degree of peptide crosslinks
  teichoicAcids: boolean;         // Gram+ only
  lipoteichoicAcids: boolean;     // Gram+ only
  lysozymeSusceptibility: number; // 0-1
  betaLactamTargets: number;      // PBP (penicillin-binding proteins) count
}

export interface OuterMembrane {
  present: boolean;               // Gram- only
  LPS: {
    lipidA: boolean;              // Endotoxin component
    coreOligosaccharide: boolean;
    Oantigen: string;             // Serotype determinant
  };
  porins: number;                 // Channel proteins for nutrient/antibiotic entry
  effluxPumps: number;            // Active antibiotic expulsion
}

// ============= VIRULENCE FACTORS =============
export interface BacterialToxins {
  exotoxins: {
    alphaHemolysin?: number;      // S. aureus pore-forming toxin
    streptolysinO?: number;       // S. pyogenes
    verotoxin?: number;           // E. coli EHEC
    exotoxinA?: number;           // P. aeruginosa
    enterotoxins?: number;        // Various species
  };
  endotoxin: number;              // LPS from Gram-, measured in EU/mL
  superantigens: string[];        // TSST-1, SEB, etc.
}

export interface SurfaceStructures {
  flagella: {
    type: FlagellarArrangement;
    number: number;
    motorProteins: number;        // MotA/MotB complexes
    chemotaxisReceptors: number;
    swimmingSpeed: number;        // μm/s
  };
  pili: {
    type: PiliType;
    density: number;              // per cell
    adhesins: string[];           // FimH, PapG, etc.
    twitchingMotility: boolean;
  };
  capsule: {
    present: boolean;
    thickness: number;            // nm
    composition: "polysaccharide" | "protein" | "mixed";
    phagocytosisResistance: number; // 0-1
  };
}

// ============= NUTRIENTS AND METABOLISM =============
export interface Macronutrients {
  carbohydrates: {
    glucose: number;              // mM, normal blood: 4-6 mM
    lactose: number;
    glycogen: number;
  };
  lipids: {
    saturatedFattyAcids: number;  // mM
    unsaturatedFattyAcids: {
      cis: number;                // healthy fats
      trans: number;              // inflammatory
    };
    cholesterol: {
      LDL: number;                // "bad" cholesterol
      HDL: number;                // "good" cholesterol
      oxidizedLDL: number;        // atherogenic
    };
  };
  proteins: {
    albumin: number;              // g/dL, normal: 3.5-5.0
    immunoglobulins: number;
    aminoAcidPool: number;        // mM total free amino acids
    acutePhaseProteins: number;   // CRP, SAA, etc.
  };
}

// ============= HEMOGLOBIN AND OXYGEN TRANSPORT =============
export interface Hemoglobin {
  id: number;
  x: number;
  y: number;
  z: number;
  state: "T" | "R";              // T = tense (deoxy), R = relaxed (oxy)
  oxygenSaturation: number;       // 0-4 oxygens bound
  pO2: number;                    // Partial pressure O2, mmHg
  pCO2: number;                   // Partial pressure CO2
  pH: number;                     // Bohr effect
  BPG: number;                    // 2,3-bisphosphoglycerate concentration
  cooperativity: number;          // Hill coefficient ~2.8-3.0
  p50: number;                    // O2 pressure for 50% saturation
}

// ============= EPIDEMIOLOGICAL PARAMETERS =============
export interface EpidemiologicalParameters {
  R0: number;                     // Basic reproduction number
  generationTime: number;         // hours
  infectiousPeriod: number;       // hours
  incubationPeriod: number;       // hours
  transmissionRate: number;       // per contact per hour
  contactRate: number;            // contacts per hour
  recoveryRate: number;           // per hour
  mortalityRate: number;          // case fatality ratio
  ID50: number;                   // Infectious dose 50%, CFU
  LD50: number;                   // Lethal dose 50%, CFU
}

// ============= PHARMACOLOGY =============
export interface DrugPharmacokinetics {
  absorptionRate: number;         // ka, 1/hour
  bioavailability: number;        // F, 0-1
  volumeDistribution: number;     // Vd, L/kg
  clearance: number;              // CL, L/hour
  halfLife: number;               // t½, hours
  proteinBinding: number;         // 0-1
  metabolites: string[];
}

type AntibioticMechanism = "cell_wall" | "protein_synthesis" | "DNA_synthesis" | "RNA_synthesis" | "membrane";

export interface DrugPharmacodynamics {
  mechanism: AntibioticMechanism;      // e.g. 'cell_wall' | ...
  targetSite?: string;                 // PBP, ribosome, gyrase, etc.
  MIC?: Map<BacterialSpecies, number>; // Minimum Inhibitory Concentration, μg/mL
  MBC?: Map<BacterialSpecies, number>; // Minimum Bactericidal Concentration
  timeDependent: boolean;              // vs concentration-dependent
  postAntibioticEffect: number;        // hours
  inoculum_effect?: boolean;
  synergy?: Map<string, number>;       // Drug combinations
  bactericidal?: boolean;
  concentrationTarget?: number;
}


// ============= GENOME AND BACTERIAL STRAIN =============
export interface Genome {
  chromosomalDNA: {
    size: number;                 // Mbp
    GCcontent: number;            // %
    essentialGenes: number;
  };
  plasmids: Array<{
    name: string;
    size: number;                 // kbp
    copyNumber: number;
    resistanceGenes: string[];
    mobilizable: boolean;
  }>;
  resistanceGenes: Map<AntibioticClass, number>;
  virulenceFactors: {
    toxinProduction: BacterialToxins;
    adhesins: string[];
    invasins: string[];
    biofilmGenes: {
      pgaABCD: boolean;           // PNAG synthesis
      icaADBC: boolean;           // PIA synthesis
      csgAB: boolean;             // Curli synthesis
    };
    siderophores: string[];       // Iron acquisition
  };
  phageResistance: {
    crispr: boolean;
    restrictionModification: boolean;
    abortiveInfection: boolean;
    sie: boolean;                 // Superinfection exclusion
  };
  metabolicCapabilities: {
    pathways: MetabolicPathway[];
    oxygenRequirement: "aerobic" | "anaerobic" | "facultative";
    preferredCarbon: NutrientType[];
  };
  fitnessCoat: number;            // Cost of resistance/virulence
}

export interface BacterialStrain {
  id: string;
  parentSpecies: BacterialSpecies;
  serotype: string;
  genome: Genome;
  mutationHistory: string[];
  generation: number;
  color: string;
  morphology: {
    shape: BacterialShape;
    size: { width: number; length: number }; // μm
    peptidoglycan: PeptidoglycanLayer;
    outerMembrane?: OuterMembrane;
    surface: SurfaceStructures;
  };
  epidemiology: EpidemiologicalParameters;
}

// ============= ENHANCED BACTERIUM =============
export interface EnhancedBacterium {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  strain: BacterialStrain;
  health: number;                 // 0-100
  ATP: number;                    // Energy currency
  replicationTimer: number;       // minutes until division
  metabolicState: MetabolicState;
  metabolicRate: number;          // O2 consumption rate
  nutrientStores: Map<NutrientType, number>;
  wasteProducts: Map<string, number>; // Lactate, CO2, etc.
  quorumSignal: number;           // 0-1+ concentration
  adherent: boolean;              // Attached to vessel wall
  biofilm: boolean;               // Part of biofilm
  biofilmMatrix: {
    polysaccharides: number;
    proteins: number;
    eDNA: number;                 // Extracellular DNA
  };
  phageInfected: boolean;
  prophage?: string;              // Integrated phage genome
  opsonized: boolean;             // Antibody-coated
  complementBound: boolean;       // Complement proteins attached
  antibodyBound: Map<AntibodyType, number>;
  age: number;                    // minutes
  stressLevel: number;            // 0-1 environmental stress
  pH: number;                     // Local pH
  temperature: number;            // Local temperature response
  gridKey?: string;               // Spatial indexing
}

// ============= IMMUNE SYSTEM =============
export interface ImmuneCell {
  id: number;
  type: CellType;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  health: number;                 // 0-100
  activation: number;             // 0-1 activation level
  targetId?: number;              // Current target bacteria ID
  phagocytosedCount: number;      // Bacteria consumed
  cytokineProduction: Map<CytokineType, number>;
  receptors: {
    TLR: Map<number, boolean>;    // TLR1-10
    FCR: boolean;                 // Fc receptors
    CR: boolean;                  // Complement receptors
  };
  age: number;                    // minutes
  maturation: number;             // 0-1 maturity level
  exhaustion: number;             // 0-1 T cell exhaustion
  memory: boolean;                // Memory cell status
}

export interface Antibody {
  id: number;
  type: AntibodyType;
  subclass?: string;              // IgG1-4, etc.
  x: number;
  y: number;
  specificity: string;            // Antigen epitope
  affinity: number;               // Kd, nM (lower = higher affinity)
  boundTo?: number;               // Bacterium ID if bound
  opsonizing: boolean;            // Enhances phagocytosis
  neutralizing: boolean;          // Blocks function
  concentration: number;          // mg/dL
  halfLife: number;               // hours
  complementFixing: boolean;      // Activates complement
}

export interface BloodClot {
  id: number;
  x: number;
  y: number;
  radius: number;
  components: Map<ClotComponent, number>;
  occlusion: number;              // 0-1 vessel blockage
  age: number;                    // minutes
  stable: boolean;                // Fibrin cross-linked
  fibrinolysis: number;           // Clot breakdown rate
  tPA: number;                    // Tissue plasminogen activator
  plasmin: number;                // Active fibrinolytic enzyme
}

export interface FatDeposit {
  id: number;
  x: number;
  y: number;
  size: number;
  oxidized: boolean;              // Inflammatory lipids
  foamCells: number;              // Macrophages full of lipid
  plaque: boolean;                // Atherosclerotic plaque
  ruptureRisk: number;            // 0-1 risk of rupture
  calcification: number;          // 0-1 calcium deposits
  necrotic_core: number;          // Dead tissue size
  fibrous_cap_thickness: number;  // μm protective layer
}

// ============= PHAGE THERAPY =============
export interface PhageLibrary {
  id: string;
  name: string;
  family: string;                 // Myoviridae, Siphoviridae, etc.
  hostRange: BacterialSpecies[];
  receptorSpecificity: string[];  // Host receptors
  strategy: PhageStrategy;
  genomeType: "dsDNA" | "ssDNA" | "dsRNA" | "ssRNA";
  genomeSize: number;             // kbp
  burstSize: number;              // Progeny per infection
  latencyPeriod: number;          // minutes
  adsorptionRate: number;         // 0-1 binding efficiency
  specificity: number;            // 0-1 host specificity
  evolutionRate: number;          // Mutation rate
  resistanceBreaking: boolean;    // Overcomes resistance
  temperatureStability: [number, number]; // min, max °C
  pHStability: [number, number];  // min, max pH
}

export interface EnhancedPhage {
  id: number;
  libraryId: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  attached: boolean;              // Bound to bacterium
  targetId?: number;              // Host bacterium ID
  receptorBound: string;          // Host receptor type
  injectionProgress: number;      // 0-1 genome injection
  generation: number;             // Evolutionary generation
  mutations: string[];            // Accumulated mutations
  fitness: number;                // Relative fitness
}

// ============= BLOOD RHEOLOGY =============
export interface BloodRheology {
  viscosity: number;              // cP (centipoise)
  shearRate: number;              // 1/s
  shearStress: number;            // Pa
  hematocrit: number;             // % RBC volume
  fibrinogenLevel: number;        // g/L
  plateletActivation: number;     // 0-1 activation level
  vonWillebrandFactor: number;    // vWF concentration
  rouleauxFormation: number;      // RBC stacking 0-1
  deformability: number;          // RBC flexibility 0-1
}

// ============= IMMUNE RESPONSE =============
export interface ImmuneResponse {
  innate: {
    neutrophilRecruitment: number;
    macrophageActivation: number;
    NKcellActivity: number;
    complementActivation: {
      classical: number;
      alternative: number;
      lectin: number;
      C3a: number;                // Anaphylatoxin
      C5a: number;                // Anaphylatoxin
      MAC: number;                // Membrane attack complex
    };
    acutePhaseProteins: {
      CRP: number;                // mg/L
      SAA: number;                // Serum amyloid A
      procalcitonin: number;      // ng/mL
      ferritin: number;           // ng/mL
    };
  };
  adaptive: {
    antibodyProduction: Map<AntibodyType, number>;
    tcellActivation: {
      CD4: number;                // Helper T cells
      CD8: number;                // Cytotoxic T cells
      Treg: number;               // Regulatory T cells
      Th1_Th2_ratio: number;      // Immune response balance
    };
    memoryFormation: number;      // 0-1 memory development
    somaticHypermutation: number; // 0-1 antibody evolution
    affinityMaturation: number;   // 0-1 antibody improvement
  };
  cytokineProfile: {
    proInflammatory: Map<CytokineType, number>;
    antiInflammatory: Map<CytokineType, number>;
    chemokines: Map<string, number>; // Chemotactic factors
  };
}

// ============= PATIENT VITALS =============
export interface PatientVitals {
  heartRate: number;              // beats/min
  bloodPressure: { 
    systolic: number; 
    diastolic: number; 
    MAP: number;                  // Mean arterial pressure
  };
  temperature: number;            // °C
  respiratoryRate: number;        // breaths/min
  oxygenSaturation: number;       // %
  pO2: number;                    // Partial pressure O2, mmHg
  pCO2: number;                   // Partial pressure CO2, mmHg
  pH: number;                     // Blood pH
  HCO3: number;                   // Bicarbonate, mEq/L
  baseExcess: number;             // mEq/L
  whiteBloodCells: {
    total: number;                // 10³/μL
    differential: {
      neutrophils: number;        // %
      lymphocytes: number;        // %
      monocytes: number;          // %
      eosinophils: number;        // %
      basophils: number;          // %
    };
  };
  crp: number;                    // C-reactive protein, mg/L
  procalcitonin: number;          // ng/mL
  lactate: number;                // mmol/L
  glucose: number;                // mmol/L
  creatinine: number;             // mg/dL - kidney function
  bilirubin: number;              // mg/dL - liver function
  troponin: number;               // ng/mL - heart damage
  organFunction: {
    heart: number;                // 0-100% function
    lungs: number;                // 0-100% function
    kidneys: number;              // 0-100% function
    liver: number;                // 0-100% function
    brain: number;                // 0-100% function
  };
  SOFA_score: number;             // Sequential Organ Failure Assessment 0-24
  overallHealth: number;          // 0-100% composite health
}

// ============= SIMULATION STATISTICS =============
export interface SimulationStats {
  totalBacteria: number;
  bacterialSpeciesCount: Map<BacterialSpecies, number>;
  uniqueStrains: number;
  dominantStrain: string;
  averageResistance: number;      // 0-1 average resistance level
  biofilmCoverage: number;        // 0-1 proportion in biofilms
  totalBiofilmBiomass: number;
  phageCount: number;
  lysogenicBacteria: number;      // Bacteria with prophages
  viscosity: number;              // Blood viscosity cP
  sepsisScore: number;            // 0-100 sepsis severity
  bacteremia: boolean;            // Significant bacterial load
  clottingRisk: number;           // 0-100 thrombosis risk
  cytokineStorm: boolean;         // Uncontrolled inflammation
  SIRS_criteria: number;          // 0-4 SIRS criteria met
  qSOFA_score: number;            // 0-3 quick SOFA
  DIC_risk: number;               // 0-100 disseminated intravascular coagulation
}

// ============= BACTERIAL PROFILES =============
export const BACTERIAL_PROFILES = {
  S_aureus: {
    name: "Staphylococcus aureus",
    gramPositive: true as const,
    shape: "cocci" as BacterialShape,
    color: "#FFD700",
    size: { width: 0.8, length: 0.8 },
    arrangement: "clusters",
    peptidoglycan: {
      thickness: 30,
      crosslinking: 0.7,
      teichoicAcids: true,
      lipoteichoicAcids: true,
      lysozymeSusceptibility: 0.6,
      betaLactamTargets: 4
    },
    flagella: "atrichous" as FlagellarArrangement,
    pili: "none" as PiliType,
    virulence: 0.8,
    divisionTime: 30,
    speed: 0,
    adherence: 0.7,
    R0: 2.5,
    ID50: 100,
    LD50: 100000,
    defaultResistance: { 
      penicillin: 0.7,
      vancomycin: 0.05,
      ciprofloxacin: 0.3,
      gentamicin: 0.2,
      ceftriaxone: 0.4
    },
    quorumThreshold: 50,
    metabolicFlexibility: 0.7,
    oxygenRequirement: "facultative" as const
  },
  E_coli: {
    name: "Escherichia coli",
    gramPositive: false as const,
    shape: "bacilli" as BacterialShape,
    color: "#00FF00",
    size: { width: 1.0, length: 2.0 },
    arrangement: "single",
    peptidoglycan: {
      thickness: 7,
      crosslinking: 0.5,
      teichoicAcids: false,
      lipoteichoicAcids: false,
      lysozymeSusceptibility: 0.8,
      betaLactamTargets: 6
    },
    outerMembrane: {
      present: true,
      LPS: {
        lipidA: true,
        coreOligosaccharide: true,
        Oantigen: "O157"
      },
      porins: 3,
      effluxPumps: 5,
    },
    flagella: "peritrichous" as FlagellarArrangement,
    pili: "type_I" as PiliType,
    virulence: 0.6,
    divisionTime: 20,
    speed: 30,
    adherence: 0.4,
    R0: 3.0,
    ID50: 1000,
    LD50: 1000000,
    defaultResistance: {
      penicillin: 0.9,
      vancomycin: 1.0,
      ciprofloxacin: 0.35,
      gentamicin: 0.25,
      ceftriaxone: 0.3
    },
    quorumThreshold: 30,
    metabolicFlexibility: 0.9,
    oxygenRequirement: "facultative" as const
  },
  P_aeruginosa: {
    name: "Pseudomonas aeruginosa",
    gramPositive: false as const,
    shape: "bacilli" as BacterialShape,
    color: "#00CED1",
    size: { width: 0.7, length: 2.5 },
    arrangement: "single",
    peptidoglycan: {
      thickness: 5,
      crosslinking: 0.4,
      teichoicAcids: false,
      lipoteichoicAcids: false,
      lysozymeSusceptibility: 0.3,
      betaLactamTargets: 5
    },
    outerMembrane: {
      present: true,
      LPS: {
        lipidA: true,
        coreOligosaccharide: true,
        Oantigen: "O11"
      },
      porins: 2,
      effluxPumps: 8
    },
    flagella: "monotrichous" as FlagellarArrangement,
    pili: "type_IV" as PiliType,
    virulence: 0.7,
    divisionTime: 35,
    speed: 50,
    adherence: 0.8,
    R0: 2.0,
    ID50: 500,
    LD50: 500000,
    defaultResistance: {
      penicillin: 1.0,
      vancomycin: 1.0,
      ciprofloxacin: 0.4,
      gentamicin: 0.35,
      ceftriaxone: 0.8
    },
    quorumThreshold: 40,
    metabolicFlexibility: 0.8,
    oxygenRequirement: "aerobic" as const
  },
  K_pneumoniae: {
    name: "Klebsiella pneumoniae",
    gramPositive: false as const,
    shape: "bacilli" as BacterialShape,
    color: "#8A2BE2",
    size: { width: 1.0, length: 2.0 },
    arrangement: "single",
    peptidoglycan: {
      thickness: 6,
      crosslinking: 0.5,
      teichoicAcids: false,
      lipoteichoicAcids: false,
      lysozymeSusceptibility: 0.7,
      betaLactamTargets: 5
    },
    outerMembrane: {
      present: true,
      LPS: {
         lipidA: true,
        coreOligosaccharide: true,
        Oantigen: "O1"
      },
      porins: 3,
      effluxPumps: 6
    },
    flagella: "atrichous" as FlagellarArrangement,
    pili: "type_I" as PiliType,
    virulence: 0.65,
    divisionTime: 25,
    speed: 0,
    adherence: 0.5,
    R0: 2.2,
    ID50: 1000,
    LD50: 1000000,
    defaultResistance: {
      penicillin: 1.0,
      vancomycin: 1.0,
      ciprofloxacin: 0.4,
      gentamicin: 0.3,
      ceftriaxone: 0.45
    },
    quorumThreshold: 35,
    metabolicFlexibility: 0.6,
    oxygenRequirement: "facultative" as const
  },
  S_pyogenes: {
    name: "Streptococcus pyogenes",
    gramPositive: true as const,
    shape: "cocci" as BacterialShape,
    color: "#FF4500",
    size: { width: 0.7, length: 0.7 },
    arrangement: "chains",
    peptidoglycan: {
      thickness: 25,
      crosslinking: 0.6,
      teichoicAcids: true,
      lipoteichoicAcids: true,
      lysozymeSusceptibility: 0.7,
      betaLactamTargets: 4
    },
    flagella: "atrichous" as FlagellarArrangement,
    pili: "none" as PiliType,
    virulence: 0.75,
    divisionTime: 28,
    speed: 0,
    adherence: 0.6,
    R0: 4.0,
    ID50: 10,
    LD50: 10000,
    defaultResistance: {
      penicillin: 0.0,
      vancomycin: 0.0,
      ciprofloxacin: 0.25,
      gentamicin: 0.4,
      ceftriaxone: 0.05
    },
    quorumThreshold: 45,
    metabolicFlexibility: 0.5,
    oxygenRequirement: "facultative" as const
  },
  E_faecalis: {
    name: "Enterococcus faecalis",
    gramPositive: true as const,
    shape: "cocci" as BacterialShape,
    color: "#F4A460",
    size: { width: 0.9, length: 0.9 },
    arrangement: "pairs",
    peptidoglycan: {
      thickness: 35,
      crosslinking: 0.5,
      teichoicAcids: true,
      lipoteichoicAcids: true,
      lysozymeSusceptibility: 0.4,
      betaLactamTargets: 5
    },
    flagella: "atrichous" as FlagellarArrangement,
    pili: "conjugative" as PiliType,
    virulence: 0.5,
    divisionTime: 33,
    speed: 0,
    adherence: 0.7,
    R0: 1.8,
    ID50: 10000,
    LD50: 10000000,
    defaultResistance: {
      penicillin: 0.4,
      vancomycin: 0.3,
      ciprofloxacin: 0.5,
      gentamicin: 0.6,
      ceftriaxone: 1.0
    },
    quorumThreshold: 55,
    metabolicFlexibility: 0.6,
    oxygenRequirement: "facultative" as const
  }
};

// ============= ANTIBIOTIC PROFILES =============

interface AntibioticProfile {
  name: string;
  class: string;
  color?: string;
  mechanism: AntibioticMechanism;      // top-level mechanism (matches your object)
  target?: string;
  spectrum: { gramPos: number; gramNeg: number };
  pharmacokinetics: DrugPharmacokinetics;
  pharmacodynamics: Omit<DrugPharmacodynamics, 'mechanism' | 'targetSite'>; // keep pharmacodynamics shape
  therapeuticRange?: { min: number; max: number };
  resistancePressure?: number;
  toxicity: Record<string, any>;
}
export const ANTIBIOTIC_PROFILES: Record<string, AntibioticProfile> = {
  penicillin: {
    name: "Penicillin G",
    class: "β-Lactam",
    color: "rgba(65, 105, 225, 0.3)",
    mechanism: "cell_wall" as const,
    target: "PBP",
    spectrum: { gramPos: 0.8, gramNeg: 0.3 },
    pharmacokinetics: {
      absorptionRate: 0.5,
      bioavailability: 0.6,
      volumeDistribution: 0.2,
      clearance: 20,
      halfLife: 0.5,
      proteinBinding: 0.6,
      metabolites: ["penicilloic_acid"]
    },
    pharmacodynamics: {
      timeDependent: true,
      postAntibioticEffect: 0,
      bactericidal: true,
      concentrationTarget: 4
      
    },
    therapeuticRange: { min: 0.1, max: 10 },
    resistancePressure: 0.8,
    toxicity: {
      therapeutic_index: 100,
      nephrotoxicity: 0,
      hepatotoxicity: 0,
      ototoxicity: 0,
      QT_prolongation: false
    }
  },
  vancomycin: {
    name: "Vancomycin",
    class: "Glycopeptide",
    color: "rgba(139, 0, 0, 0.3)",
    mechanism: "cell_wall" as const,
    target: "D-Ala-D-Ala",
    spectrum: { gramPos: 0.95, gramNeg: 0.0 },
    pharmacokinetics: {
      absorptionRate: 0,
      bioavailability: 0,
      volumeDistribution: 0.7,
      clearance: 5,
      halfLife: 6,
      proteinBinding: 0.5,
      metabolites: []
    },
    pharmacodynamics: {
      timeDependent: true,
      postAntibioticEffect: 2,
      bactericidal: true,
      concentrationTarget: 4
    },
    therapeuticRange: { min: 10, max: 20 },
    resistancePressure: 0.6,
    toxicity: {
      therapeutic_index: 5,
      nephrotoxicity: 0.3,
      hepatotoxicity: 0,
      ototoxicity: 0.2,
      QT_prolongation: false
    }
  },
  ciprofloxacin: {
    name: "Ciprofloxacin",
    class: "Fluoroquinolone",
    color: "rgba(255, 20, 147, 0.3)",
    mechanism: "DNA_synthesis" as const,
    target: "DNA gyrase",
    spectrum: { gramPos: 0.7, gramNeg: 0.85 },
    pharmacokinetics: {
      absorptionRate: 2,
      bioavailability: 0.7,
      volumeDistribution: 2.5,
      clearance: 25,
      halfLife: 4,
      proteinBinding: 0.3,
      metabolites: ["desethyl_ciprofloxacin"]
    },
    pharmacodynamics: {
      timeDependent: false,
      postAntibioticEffect: 4,
      bactericidal: true,
      concentrationTarget: 10
    },
    therapeuticRange: { min: 0.5, max: 3 },
    resistancePressure: 0.7,
    toxicity: {
      therapeutic_index: 20,
      nephrotoxicity: 0.1,
      hepatotoxicity: 0.1,
      ototoxicity: 0,
      QT_prolongation: true
    }
  },
  gentamicin: {
    name: "Gentamicin",
    class: "Aminoglycoside",
    color: "rgba(46, 139, 87, 0.3)",
    mechanism: "protein_synthesis" as const,
    target: "30S ribosome",
    spectrum: { gramPos: 0.6, gramNeg: 0.8 },
    pharmacokinetics: {
      absorptionRate: 0,
      bioavailability: 0,
      volumeDistribution: 0.25,
      clearance: 8,
      halfLife: 2,
      proteinBinding: 0.1,
      metabolites: []
    },
    pharmacodynamics: {
      timeDependent: false,
      postAntibioticEffect: 6,
      bactericidal: true,
      concentrationTarget: 10
    },
    therapeuticRange: { min: 4, max: 10 },
    resistancePressure: 0.5,
    toxicity: {
      therapeutic_index: 3,
      nephrotoxicity: 0.4,
      hepatotoxicity: 0,
      ototoxicity: 0.5,
      QT_prolongation: false
    }
  },
  ceftriaxone: {
    name: "Ceftriaxone",
    class: "3rd Gen Cephalosporin",
    color: "rgba(255, 140, 0, 0.3)",
    mechanism: "cell_wall" as const,
    target: "PBP",
    spectrum: { gramPos: 0.85, gramNeg: 0.9 },
    pharmacokinetics: {
      absorptionRate: 0,
      bioavailability: 0,
      volumeDistribution: 0.15,
      clearance: 1.5,
      halfLife: 8,
      proteinBinding: 0.9,
      metabolites: []
    },
    pharmacodynamics: {
      timeDependent: true,
      postAntibioticEffect: 0,
      bactericidal: true,
      concentrationTarget: 4
    },
    therapeuticRange: { min: 20, max: 100 },
    resistancePressure: 0.9,
    toxicity: {
      therapeutic_index: 50,
      nephrotoxicity: 0.05,
      hepatotoxicity: 0.1,
      ototoxicity: 0,
      QT_prolongation: false
    }
  }
};