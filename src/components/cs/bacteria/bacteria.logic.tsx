// bacteria.logic.tsx - Complete Simulation Logic with Enhanced Physiology
// Updated: Contains all simulation controllers with differential equations and coupled systems

import {
  BacterialSpecies,
  EnhancedBacterium,
  EnhancedPhage,
  BloodRheology,
  ImmuneResponse,
  ImmuneCell,
  Antibody,
  BloodClot,
  FatDeposit,
  CellType,
  NutrientType,
  Hemoglobin,
  CytokineType,
  BACTERIAL_PROFILES,
  ANTIBIOTIC_PROFILES,
  ADVANCED_CONFIG,
  Macronutrients,
  DrugPharmacokinetics,
  DrugPharmacodynamics,
  SimulationStats,
  PatientVitals,
  CardiovascularState,
  InflammatoryState,
  BacterialStrain,
  AntibioticClass,
  MetabolicState
} from './bacteria.types';

import {
  OctreeNode,
  BacterialEvolution,
  PhageTherapyEngine,
  calculateSepsisScore,
  calculateOrganDamage,
  calculateCytokineProduction,
  sigmoid,
  hillEquation,
  michaelisMenten,
  clampValue
} from './bacteria.utils';

// ============= SIMULATION STATE MANAGER =============
export class SimulationState {
  // Entities
  bacteria: EnhancedBacterium[] = [];
  immuneCells: ImmuneCell[] = [];
  antibodies: Antibody[] = [];
  bloodClots: BloodClot[] = [];
  fatDeposits: FatDeposit[] = [];
  phages: EnhancedPhage[] = [];
  cytokines: Map<string, any> = new Map();
  hemoglobin: Hemoglobin[] = [];
  
  // Environmental state
  nutrients: Macronutrients;
  bloodRheology: BloodRheology;
  immuneResponse: ImmuneResponse;
  
  // Tracking
  strainMap: Map<string, number> = new Map();
  cellCounts: Map<CellType, number> = new Map();
  
  constructor() {
    this.nutrients = this.initializeNutrients();
    this.bloodRheology = this.initializeRheology();
    this.immuneResponse = this.initializeImmuneResponse();
  }

  // Keep these as protected so tests/subclasses can override; change to public if other modules must call them directly.
  protected initializeNutrients(): Macronutrients {
    return {
      carbohydrates: {
        glucose: 5.0, // mM, normal blood glucose
        lactose: 0.1,
        glycogen: 2.0
      },
      lipids: {
        saturatedFattyAcids: 2.0,
        unsaturatedFattyAcids: {
          cis: 1.5,
          trans: 0.1
        },
        cholesterol: {
          LDL: 3.0,
          HDL: 1.5,
          oxidizedLDL: 0.1
        }
      },
      proteins: {
        albumin: 4.0,
        immunoglobulins: 1.5,
        aminoAcidPool: 2.5,
        acutePhaseProteins: 0.5
      }
    } as unknown as Macronutrients;
  }

  protected initializeRheology(): BloodRheology {
    return {
      viscosity: 3.5, // cP at 37°C
      shearRate: 100,
      shearStress: 0.35,
      hematocrit: 0.45,
      fibrinogenLevel: 3.0,
      plateletActivation: 0,
      vonWillebrandFactor: 1.0,
      rouleauxFormation: 0,
      deformability: 1.0
    } as unknown as BloodRheology;
  }

  protected initializeImmuneResponse(): ImmuneResponse {
    return {
      innate: {
        neutrophilRecruitment: 0,
        macrophageActivation: 0,
        NKcellActivity: 0,
        complementActivation: {
          classical: 0,
          alternative: 0,
          lectin: 0,
          C3a: 0,
          C5a: 0,
          MAC: 0
        },
        acutePhaseProteins: {
          CRP: 5.0,
          SAA: 1.0,
          procalcitonin: 0.05,
          ferritin: 100
        }
      },
      adaptive: {
        antibodyProduction: new Map([
          ['IgM', 0],
          ['IgG', 0],
          ['IgA', 0],
          ['IgE', 0]
        ]),
        tcellActivation: {
          CD4: 0,
          CD8: 0,
          Treg: 0,
          Th1_Th2_ratio: 1.0
        },
        memoryFormation: 0,
        somaticHypermutation: 0,
        affinityMaturation: 0
      },
      cytokineProfile: {
        proInflammatory: new Map([
          ['IL1', 0],
          ['IL6', 0],
          ['TNFa', 0],
          ['IFNg', 0]
        ]),
        antiInflammatory: new Map([
          ['IL10', 0],
          ['TGFb', 0]
        ]),
        chemokines: new Map([
          ['IL8', 0],
          ['MCP1', 0]
        ])
      }
    } as unknown as ImmuneResponse;
  }

  clear() {
    this.bacteria = [];
    this.immuneCells = [];
    this.antibodies = [];
    this.bloodClots = [];
    this.fatDeposits = [];
    this.phages = [];
    this.cytokines.clear();
    this.hemoglobin = [];
    this.strainMap.clear();
    this.cellCounts.clear();
    this.nutrients = this.initializeNutrients();
    this.bloodRheology = this.initializeRheology();
    this.immuneResponse = this.initializeImmuneResponse();
  }

}

// ============= MASTER SIMULATION CONTROLLER =============
export class SimulationController {
  state: SimulationState;
  octree: OctreeNode;
  evolution: BacterialEvolution;
  phageEngine: PhageTherapyEngine;
  bacterialBehavior: BacterialBehavior;
  immuneSystem: ImmuneSystemLogic;
  hemoglobinDynamics: HemoglobinDynamics;
  clottingCascade: ClottingCascade;
  drugDynamics: DrugDynamics;
  
  private activeAntibiotics: Map<string, { dose: number; timeAdministered: number }> = new Map();
  private currentTime: number = 0;
  private cardiovascularState: CardiovascularState;
  private inflammatoryState: InflammatoryState;
  
  constructor() {
    this.state = new SimulationState();
    this.octree = new OctreeNode(0, 0, -300, 1500);
    this.evolution = new BacterialEvolution();
    this.phageEngine = new PhageTherapyEngine();
    this.bacterialBehavior = new BacterialBehavior(this.octree, this.evolution);
    this.immuneSystem = new ImmuneSystemLogic(this.octree);
    this.hemoglobinDynamics = new HemoglobinDynamics();
    this.clottingCascade = new ClottingCascade();
    this.drugDynamics = new DrugDynamics();
    
    // Initialize physiological states
    this.cardiovascularState = {
      heartRate: 75,
      strokeVolume: 70,
      cardiacOutput: 5.25,
      meanArterialPressure: 93,
      systemicVascularResistance: 1200,
      arterialTone: 0.5,
      venousTone: 0.5,
      capillaryPermeability: 0.1,
      endothelialFunction: 1.0,
      bloodFlowRate: 5.0,
      oxygenDelivery: 1000,
      tissueHypoxia: 0
    };
    
    this.inflammatoryState = {
      TNFalpha: 0,
      IL1beta: 0,
      IL6: 0,
      IL10: 0,
      nitricOxide: 0.1,
      prostaglandinE2: 0,
      histamine: 0,
      complement: 0,
      lactate: 1.0,
      endotoxin: 0
    };
  }
  
  update(
    deltaTime: number,
    vesselRadius: number,
    vesselCenterY: number,
    canvasWidth: number
  ) {
    this.currentTime += deltaTime;
    
    // Rebuild spatial index for efficient neighbor queries
    this.octree.clear();
    this.state.bacteria.forEach(b => this.octree.insert(b));
    this.state.immuneCells.forEach(c => this.octree.insert(c));
    
    // Update inflammatory mediators from bacteria and immune activity
    this.updateInflammatoryState(deltaTime);
    
    // Apply antibiotic effects
    this.updateAntibioticEffects(deltaTime);
    
    // Update bacteria with complex behavioral logic
    this.updateBacterialPopulation(deltaTime, vesselRadius, vesselCenterY, canvasWidth);
    
    // Update immune system
    this.updateImmuneSystem(deltaTime, canvasWidth);
    
    // Update other cellular components
    this.updateOtherCellularComponents(deltaTime);
    
    // Handle bacterial division and horizontal gene transfer
    this.handleBacterialReproduction(deltaTime, vesselRadius, vesselCenterY);
    
    // Update blood clotting
    this.updateBloodClotting(deltaTime);
    
    // Apply evolutionary pressure and mutations
    if (ADVANCED_CONFIG.ENABLE_EVOLUTION && this.currentTime % ADVANCED_CONFIG.EVOLUTION_INTERVAL === 0) {
      this.applyEvolutionaryPressure();
    }
  }
  
  // ============= CARDIOVASCULAR DIFFERENTIAL EQUATIONS =============
  updateCardiovascular(
    patientVitals: PatientVitals, 
    bloodFlowRate: number, 
    deltaTime: number
  ): { bloodFlowRate: number; cardiovascularState: CardiovascularState } {
    
    const bacterialLoad = this.state.bacteria.length;
    const biofilmBacteria = this.state.bacteria.filter(b => b.biofilm).length;
    
    // Get inflammatory mediator concentrations
    const TNFalpha = this.inflammatoryState.TNFalpha;
    const IL6 = this.inflammatoryState.IL6;
    const IL1beta = this.inflammatoryState.IL1beta;
    const endotoxin = this.inflammatoryState.endotoxin;
    
    // DIFFERENTIAL EQUATION 1: Vasodilation from inflammatory mediators
    // dArterialTone/dt = -k1*NO - k2*PGE2 - k3*histamine + k4*(baseline_tone - current_tone)
    const nitricOxide = 0.1 + TNFalpha * 0.5 + IL1beta * 0.3;
    const prostaglandinE2 = IL6 * 0.2 + bacterialLoad * 0.01;
    const histamine = Math.min(5, bacterialLoad * 0.02);
    
    const baselineTone = 0.5;
    const k1 = 0.1, k2 = 0.05, k3 = 0.2, k4 = 0.02;
    
    const dArterialTone_dt = -k1 * nitricOxide - k2 * prostaglandinE2 - k3 * histamine + 
                             k4 * (baselineTone - this.cardiovascularState.arterialTone);
    
    this.cardiovascularState.arterialTone = clampValue(
      this.cardiovascularState.arterialTone + dArterialTone_dt * deltaTime, 0.1, 1.0
    );
    
    // DIFFERENTIAL EQUATION 2: Heart rate response 
    // dHR/dt = k1*cytokines + k2*(MAP_target - MAP_current) + k3*temperature - k4*(HR - baseline)
    const temperatureEffect = Math.max(0, patientVitals.temperature - 37) * 10;
    const pressureCompensation = Math.max(0, 90 - this.cardiovascularState.meanArterialPressure) * 2;
    const cytokineEffect = (TNFalpha + IL6 + IL1beta) * 5;
    
    const dHR_dt = cytokineEffect + pressureCompensation + temperatureEffect - 
                   0.1 * (this.cardiovascularState.heartRate - 75);
    
    this.cardiovascularState.heartRate = clampValue(
      this.cardiovascularState.heartRate + dHR_dt * deltaTime, 50, 200
    );
    
    // DIFFERENTIAL EQUATION 3: Stroke volume (Frank-Starling mechanism)
    // SV = SV0 * preload * (1/afterload) * contractility
    const preload = 1 - 0.1 * Math.max(0, endotoxin - 1); // Endotoxin decreases venous return
    const afterload = this.cardiovascularState.arterialTone;
    const contractility = 1 - 0.2 * Math.max(0, TNFalpha - 5); // Myocardial depression
    
    this.cardiovascularState.strokeVolume = 70 * preload * (1 / (1 + afterload)) * contractility;
    
    // Calculate hemodynamic parameters
    this.cardiovascularState.cardiacOutput = 
      (this.cardiovascularState.heartRate * this.cardiovascularState.strokeVolume) / 1000;
    
    this.cardiovascularState.systemicVascularResistance = 
      800 + 400 * this.cardiovascularState.arterialTone;
    
    this.cardiovascularState.meanArterialPressure = 
      (this.cardiovascularState.cardiacOutput * this.cardiovascularState.systemicVascularResistance) / 80;
    
    // DIFFERENTIAL EQUATION 4: Blood flow rate in vessels
    const viscosityEffect = 1 / this.state.bloodRheology.viscosity;
    const pressureGradient = this.cardiovascularState.meanArterialPressure / 100;
    
    const newBloodFlowRate = clampValue(
      5 * pressureGradient * viscosityEffect * (1 - biofilmBacteria / Math.max(1, bacterialLoad) * 0.3),
      1, 15
    );
    
    // Update capillary permeability from inflammation
    this.cardiovascularState.capillaryPermeability = clampValue(
      0.1 + 0.5 * Math.min(1, (TNFalpha + IL1beta) / 10), 0.1, 0.8
    );
    
    // Calculate oxygen delivery
    this.cardiovascularState.oxygenDelivery = this.hemoglobinDynamics.calculateOxygenDelivery(
      this.state.hemoglobin, this.cardiovascularState.cardiacOutput
    );
    
    // Tissue hypoxia
    const oxygenDemand = 250 + bacterialLoad * 2; // Bacteria increase metabolic demand
    this.cardiovascularState.tissueHypoxia = this.hemoglobinDynamics.calculateTissueHypoxia(
      this.cardiovascularState.oxygenDelivery, oxygenDemand
    );
    
    // Update blood rheology based on cardiovascular changes
    this.updateBloodRheology(deltaTime);
    
    return {
      bloodFlowRate: newBloodFlowRate,
      cardiovascularState: this.cardiovascularState
    };
  }
  
  // ============= PATIENT VITALS DIFFERENTIAL EQUATIONS =============
  updatePatientVitals(
    currentVitals: PatientVitals, 
    stats: SimulationStats, 
    deltaTime: number
  ): PatientVitals {
    
    const newVitals = { ...currentVitals };
    
    // DIFFERENTIAL EQUATION 5: Temperature regulation
    // dT/dt = k1*pyrogens - k2*(T - T_baseline)
    const pyrogens = this.inflammatoryState.IL1beta + this.inflammatoryState.TNFalpha * 0.5 + 
                     this.inflammatoryState.IL6 * 0.3;
    const dT_dt = 0.1 * pyrogens - 0.2 * (newVitals.temperature - 37);
    
    newVitals.temperature = clampValue(
      newVitals.temperature + dT_dt * deltaTime, 35, 42
    );
    
    // DIFFERENTIAL EQUATION 6: Respiratory response
    // dRR/dt = k1*(pH_target - pH) + k2*(lactate - baseline) + k3*cytokines - k4*(RR - baseline)
    const metabolicAcidosis = Math.max(0, this.inflammatoryState.lactate - 2);
    const pHCompensation = Math.max(0, 7.35 - newVitals.pH) * 50;
    const inflammatoryDrive = (this.inflammatoryState.TNFalpha + this.inflammatoryState.IL6) * 0.5;
    
    const dRR_dt = pHCompensation + metabolicAcidosis * 2 + inflammatoryDrive - 
                   0.1 * (newVitals.respiratoryRate - 16);
    
    newVitals.respiratoryRate = clampValue(
      newVitals.respiratoryRate + dRR_dt * deltaTime, 8, 40
    );
    
    // DIFFERENTIAL EQUATION 7: Lactate production and clearance
    // dLactate/dt = tissue_hypoxia + bacterial_metabolism - hepatic_clearance
    const tissueHypoxiaContribution = 3 * this.cardiovascularState.tissueHypoxia;
    const bacterialLactate = stats.totalBacteria * 0.015;
    const hepaticClearance = 0.5 * this.inflammatoryState.lactate * (newVitals.organFunction.liver / 100);
    
    const dLactate_dt = tissueHypoxiaContribution + bacterialLactate - hepaticClearance;
    
    this.inflammatoryState.lactate = clampValue(
      this.inflammatoryState.lactate + dLactate_dt * deltaTime, 0.5, 25
    );
    newVitals.lactate = this.inflammatoryState.lactate;
    
    // DIFFERENTIAL EQUATION 8: Acid-base balance
    // Henderson-Hasselbalch equation: pH = 6.1 + log([HCO3-]/0.03*pCO2)
    const metabolicAcid = Math.max(0, newVitals.lactate - 1);
    newVitals.HCO3 = clampValue(24 - metabolicAcid, 8, 35);
    
    // Respiratory compensation
    const expectedPCO2 = 1.5 * newVitals.HCO3 + 8;
    const dPCO2_dt = (expectedPCO2 - newVitals.pCO2) * 0.05;
    newVitals.pCO2 = clampValue(newVitals.pCO2 + dPCO2_dt * deltaTime, 15, 70);
    
    newVitals.pH = clampValue(6.1 + Math.log10(newVitals.HCO3 / (0.03 * newVitals.pCO2)), 6.8, 7.8);
    newVitals.baseExcess = newVitals.HCO3 - 24;
    
    // DIFFERENTIAL EQUATION 9: Inflammatory marker dynamics
    // dCRP/dt = k1*IL6 - k2*(CRP - baseline)
    const dCRP_dt = 3 * this.inflammatoryState.IL6 - 0.1 * (newVitals.crp - 5);
    newVitals.crp = clampValue(newVitals.crp + dCRP_dt * deltaTime, 1, 500);
    
    // dPCT/dt = k1*bacterial_stimulus - k2*(PCT - baseline)
    const bacterialStimulus = stats.totalBacteria * 0.002;
    const dPCT_dt = bacterialStimulus - 0.2 * (newVitals.procalcitonin - 0.05);
    newVitals.procalcitonin = clampValue(newVitals.procalcitonin + dPCT_dt * deltaTime, 0.01, 100);
    
    // Update white blood cell dynamics
    this.updateWBCDynamics(newVitals, deltaTime);
    
    // Update organ function with differential equations
    this.updateOrganFunction(newVitals, deltaTime);
    
    // Calculate composite scores
    newVitals.SOFA_score = this.calculateSOFAScore(newVitals);
    newVitals.overallHealth = Object.values(newVitals.organFunction).reduce((a, b) => a + b, 0) / 5;
    
    // Update cardiovascular vitals from internal state
    newVitals.heartRate = this.cardiovascularState.heartRate;
    newVitals.bloodPressure.MAP = this.cardiovascularState.meanArterialPressure;
    newVitals.bloodPressure.systolic = newVitals.bloodPressure.MAP + 40;
    newVitals.bloodPressure.diastolic = newVitals.bloodPressure.MAP - 25;
    
    return newVitals;
  }
  
  // ============= SUPPORTING METHODS =============
  
  private updateInflammatoryState(deltaTime: number) {
    // Calculate cytokine production from bacteria and immune cells
    const gramNegativeBacteria = this.state.bacteria.filter(b => 
      !BACTERIAL_PROFILES[b.strain.parentSpecies].gramPositive
    );
    
    // Endotoxin from gram-negative bacteria
    this.inflammatoryState.endotoxin = gramNegativeBacteria.reduce((sum, b) => 
      sum + b.strain.genome.virulenceFactors.toxinProduction.endotoxin * (b.health < 50 ? 2 : 1), 0
    ) * 0.1;
    
    // TNF-α production
    const macrophageActivation = this.state.immuneCells
      .filter(c => c.type === 'macrophage')
      .reduce((sum, c) => sum + c.activation, 0) / Math.max(1, this.state.immuneCells.length);
    
    const dTNF_dt = this.inflammatoryState.endotoxin * 10 + macrophageActivation * 5 - 
                    0.3 * this.inflammatoryState.TNFalpha;
    this.inflammatoryState.TNFalpha = Math.max(0, this.inflammatoryState.TNFalpha + dTNF_dt * deltaTime);
    
    // IL-6 production
    const dIL6_dt = this.inflammatoryState.TNFalpha * 2 + this.state.bacteria.length * 0.05 - 
                    0.2 * this.inflammatoryState.IL6;
    this.inflammatoryState.IL6 = Math.max(0, this.inflammatoryState.IL6 + dIL6_dt * deltaTime);
    
    // IL-1β production
    const dIL1_dt = this.inflammatoryState.endotoxin * 8 + macrophageActivation * 3 - 
                    0.25 * this.inflammatoryState.IL1beta;
    this.inflammatoryState.IL1beta = Math.max(0, this.inflammatoryState.IL1beta + dIL1_dt * deltaTime);
    
    // Update state cytokine profile
    this.state.immuneResponse.cytokineProfile.proInflammatory.set('TNFa', this.inflammatoryState.TNFalpha);
    this.state.immuneResponse.cytokineProfile.proInflammatory.set('IL6', this.inflammatoryState.IL6);
    this.state.immuneResponse.cytokineProfile.proInflammatory.set('IL1', this.inflammatoryState.IL1beta);
  }
  
  private updateAntibioticEffects(deltaTime: number) {
    this.activeAntibiotics.forEach((drugInfo, drug) => {
      const profile = ANTIBIOTIC_PROFILES[drug as keyof typeof ANTIBIOTIC_PROFILES];
      if (!profile) return;
      
      const timeSinceDose = this.currentTime - drugInfo.timeAdministered;
      const concentration = this.drugDynamics.calculateDrugConcentration(
        drug, drugInfo.dose, timeSinceDose, 70
      );
      
      this.state.bacteria.forEach(bacterium => {
        const { effect } = this.drugDynamics.calculateDrugEffect(concentration, bacterium, drug);
        this.drugDynamics.applyAntibioticEffect(bacterium, drug, effect, deltaTime);
      });
    });
  }
  
  private updateBacterialPopulation(deltaTime: number, vesselRadius: number, vesselCenterY: number, canvasWidth: number) {
    for (let i = this.state.bacteria.length - 1; i >= 0; i--) {
      const bacterium = this.state.bacteria[i];
      const alive = this.bacterialBehavior.updateBacterium(
        bacterium, this.state, deltaTime, vesselRadius, vesselCenterY, canvasWidth
      );
      
      if (!alive) {
        this.state.bacteria.splice(i, 1);
      }
    }
  }
  
  private updateImmuneSystem(deltaTime: number, canvasWidth: number) {
    for (let i = this.state.immuneCells.length - 1; i >= 0; i--) {
      const cell = this.state.immuneCells[i];
      const alive = this.immuneSystem.updateImmuneCell(cell, this.state, deltaTime, canvasWidth);
      
      if (!alive) {
        this.state.immuneCells.splice(i, 1);
      }
    }
  }
  
  private updateOtherCellularComponents(deltaTime: number) {
    // Update hemoglobin
    this.state.hemoglobin.forEach(hb => {
      this.hemoglobinDynamics.updateHemoglobin(hb, this.state, deltaTime, 250 + this.state.bacteria.length * 2);
    });
    
    // Update antibodies
    for (let i = this.state.antibodies.length - 1; i >= 0; i--) {
      const antibody = this.state.antibodies[i];
      antibody.halfLife -= deltaTime / 60;
      
      if (antibody.halfLife <= 0) {
        this.state.antibodies.splice(i, 1);
      }
    }
  }
  
  private updateBloodRheology(deltaTime: number) {
    const bacterialLoad = this.state.bacteria.length;
    const biofilmBacteria = this.state.bacteria.filter(b => b.biofilm).length;
    
    // Viscosity increases with inflammation and bacterial products
    const targetViscosity = 3.5 + 0.1 * bacterialLoad + 
                           0.3 * biofilmBacteria + 
                           0.2 * this.inflammatoryState.TNFalpha;
    
    const dViscosity_dt = (targetViscosity - this.state.bloodRheology.viscosity) * 0.1;
    this.state.bloodRheology.viscosity = clampValue(
      this.state.bloodRheology.viscosity + dViscosity_dt * deltaTime, 2.5, 8.0
    );
    
    // Platelet activation from endothelial damage
    const endothelialDamage = this.inflammatoryState.TNFalpha * 0.05 + this.inflammatoryState.endotoxin * 0.1;
    this.state.bloodRheology.plateletActivation = clampValue(
      this.state.bloodRheology.plateletActivation + endothelialDamage * deltaTime, 0, 1
    );
  }
  
  private handleBacterialReproduction(deltaTime: number, vesselRadius: number, vesselCenterY: number) {
    const newBacteria: EnhancedBacterium[] = [];
    
    this.state.bacteria.forEach(bacterium => {
      bacterium.replicationTimer -= deltaTime;
      
      if (bacterium.replicationTimer <= 0 && bacterium.ATP > 50 && bacterium.health > 60) {
        // Create daughter cell
        const daughter = this.createDaughterCell(bacterium, vesselRadius, vesselCenterY);
        if (daughter) {
          newBacteria.push(daughter);
        }
        
        // Reset parent
        bacterium.replicationTimer = BACTERIAL_PROFILES[bacterium.strain.parentSpecies].divisionTime * 60;
        bacterium.ATP -= 25;
        bacterium.health -= 5;
      }
    });
    
    this.state.bacteria.push(...newBacteria);
  }
  
  private createDaughterCell(parent: EnhancedBacterium, vesselRadius: number, vesselCenterY: number): EnhancedBacterium | null {
    if (this.state.bacteria.length >= ADVANCED_CONFIG.MAX_BACTERIA) return null;
    
    // Potential for mutation or horizontal gene transfer
    let strain = parent.strain;
    if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE) {
      strain = this.evolution.generateStrain(parent.strain.parentSpecies, parent.strain);
    }
    
    const daughter: EnhancedBacterium = {
      ...parent,
      id: Math.random(),
      x: parent.x + (Math.random() - 0.5) * 10,
      y: parent.y + (Math.random() - 0.5) * 10,
      strain,
      health: 100,
      ATP: 50,
      age: 0,
      replicationTimer: BACTERIAL_PROFILES[strain.parentSpecies].divisionTime * 60,
      nutrientStores: new Map(),
      wasteProducts: new Map(),
      quorumSignal: 0,
      adherent: false,
      biofilm: false,
      biofilmMatrix: { polysaccharides: 0, proteins: 0, eDNA: 0 },
      phageInfected: false,
      opsonized: false,
      complementBound: false,
      antibodyBound: new Map(),
      stressLevel: 0
    };
    
    return daughter;
  }
  
  private updateBloodClotting(deltaTime: number) {
    for (let i = this.state.bloodClots.length - 1; i >= 0; i--) {
      const clot = this.state.bloodClots[i];
      const exists = this.clottingCascade.updateClot(clot, this.state, deltaTime);
      
      if (!exists) {
        this.state.bloodClots.splice(i, 1);
      }
    }
  }
  
  private applyEvolutionaryPressure() {
    // Horizontal gene transfer between compatible bacteria
    if (this.state.bacteria.length > 1) {
      for (let i = 0; i < Math.min(5, this.state.bacteria.length / 20); i++) {
        const donor = this.state.bacteria[Math.floor(Math.random() * this.state.bacteria.length)];
        const recipient = this.state.bacteria[Math.floor(Math.random() * this.state.bacteria.length)];
        
        if (donor !== recipient && donor.gridKey?.includes('hgt_ready')) {
          const newStrain = this.evolution.horizontalGeneTransfer(donor.strain, recipient.strain);
          if (newStrain) {
            recipient.strain = newStrain;
          }
        }
      }
    }
  }
  
  private updateWBCDynamics(vitals: PatientVitals, deltaTime: number) {
    // Neutrophil mobilization
    const neutrophilDemand = this.state.bacteria.length * 0.1 + this.inflammatoryState.IL6 * 0.5;
    const neutrophilConsumption = this.state.immuneCells.filter(c => c.type === 'neutrophil').length * 0.01;
    
    const currentNeutrophils = vitals.whiteBloodCells.total * vitals.whiteBloodCells.differential.neutrophils / 100;
    const dNeutrophils_dt = neutrophilDemand - neutrophilConsumption - 0.1 * (currentNeutrophils - 4);
    
    const newNeutrophilCount = clampValue(currentNeutrophils + dNeutrophils_dt * deltaTime, 1, 25);
    
    vitals.whiteBloodCells.total = Math.max(4, Math.min(30, newNeutrophilCount + 3));
    vitals.whiteBloodCells.differential.neutrophils = Math.min(95, 
      (newNeutrophilCount / vitals.whiteBloodCells.total) * 100
    );
    
    const remainder = 100 - vitals.whiteBloodCells.differential.neutrophils;
    vitals.whiteBloodCells.differential.lymphocytes = remainder * 0.6;
    vitals.whiteBloodCells.differential.monocytes = remainder * 0.25;
    vitals.whiteBloodCells.differential.eosinophils = remainder * 0.10;
    vitals.whiteBloodCells.differential.basophils = remainder * 0.05;
  }
  
  private updateOrganFunction(vitals: PatientVitals, deltaTime: number) {
    const sepsisImpact = this.calculateSepsisScore() / 100;
    
    // Heart function
    const cardiacStress = this.inflammatoryState.TNFalpha * 0.1 + 
                         Math.max(0, 90 - this.cardiovascularState.meanArterialPressure) / 90 * 0.2;
    const dHeart_dt = -cardiacStress - sepsisImpact * 0.05;
    vitals.organFunction.heart = clampValue(vitals.organFunction.heart + dHeart_dt * deltaTime, 0, 100);
    
    // Lung function  
    const pulmonaryEdema = this.cardiovascularState.capillaryPermeability * 0.15;
    const dLung_dt = -pulmonaryEdema - sepsisImpact * 0.08;
    vitals.organFunction.lungs = clampValue(vitals.organFunction.lungs + dLung_dt * deltaTime, 0, 100);
    
    // Kidney function
    const renalHypoperfusion = this.cardiovascularState.tissueHypoxia * 0.2;
    const nephrotoxicity = Array.from(this.activeAntibiotics.keys())
      .reduce((sum, drug) => sum + (ANTIBIOTIC_PROFILES[drug as keyof typeof ANTIBIOTIC_PROFILES]?.toxicity?.nephrotoxicity || 0), 0);
    const dKidney_dt = -renalHypoperfusion - nephrotoxicity * 0.1 - sepsisImpact * 0.1;
    vitals.organFunction.kidneys = clampValue(vitals.organFunction.kidneys + dKidney_dt * deltaTime, 0, 100);
    
    // Liver function
    const hepaticStress = sepsisImpact * 0.06 + this.state.bloodClots.length * 0.02;
    const dLiver_dt = -hepaticStress;
    vitals.organFunction.liver = clampValue(vitals.organFunction.liver + dLiver_dt * deltaTime, 0, 100);
    
    // Brain function
    const neurologicImpact = this.cardiovascularState.tissueHypoxia * 0.15 + vitals.lactate * 0.05;
    const dBrain_dt = -neurologicImpact - sepsisImpact * 0.03;
    vitals.organFunction.brain = clampValue(vitals.organFunction.brain + dBrain_dt * deltaTime, 0, 100);
  }
  
  private calculateSOFAScore(vitals: PatientVitals): number {
    let sofa = 0;
    
    // Respiratory
    const pfratio = vitals.pO2 / 0.21;
    if (pfratio < 100) sofa += 4;
    else if (pfratio < 200) sofa += 3;
    else if (pfratio < 300) sofa += 2;
    else if (pfratio < 400) sofa += 1;
    
    // Cardiovascular
    if (this.cardiovascularState.meanArterialPressure < 70) {
      if (this.cardiovascularState.meanArterialPressure < 50) sofa += 4;
      else if (this.cardiovascularState.meanArterialPressure < 60) sofa += 3;
      else sofa += 1;
    }
    
    // Renal, Hepatic, Neurological based on organ function
    sofa += Math.floor((100 - vitals.organFunction.kidneys) / 20);
    sofa += Math.floor((100 - vitals.organFunction.liver) / 20);
    sofa += Math.floor((100 - vitals.organFunction.brain) / 20);
    
    return Math.min(24, sofa);
  }
  
  // ============= PUBLIC API METHODS =============
  
  addBacterium(species: BacterialSpecies, x: number, y: number, z: number, bloodFlowRate: number) {
    if (this.state.bacteria.length >= ADVANCED_CONFIG.MAX_BACTERIA) return;
    
    const strain = this.evolution.generateStrain(species);
    const profile = BACTERIAL_PROFILES[species];
    
    const bacterium: EnhancedBacterium = {
      id: Math.random(),
      x, y, z,
      vx: bloodFlowRate + (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.2,
      vz: 0,
      strain,
      health: 100,
      ATP: 50,
      replicationTimer: profile.divisionTime * 60,
      metabolicState: 'active',
      metabolicRate: 1.0,
      nutrientStores: new Map(),
      wasteProducts: new Map(),
      quorumSignal: 0,
      adherent: false,
      biofilm: false,
      biofilmMatrix: { polysaccharides: 0, proteins: 0, eDNA: 0 },
      phageInfected: false,
      opsonized: false,
      complementBound: false,
      antibodyBound: new Map(),
      age: 0,
      stressLevel: 0,
      pH: 7.4,
      temperature: 37
    };
    
    this.state.bacteria.push(bacterium);
  }
  
  addImmuneCell(x: number, y: number, bloodFlowRate: number) {
    if (this.state.immuneCells.length >= ADVANCED_CONFIG.MAX_BLOOD_CELLS) return;
    
    const cellTypes: CellType[] = ['neutrophil', 'macrophage', 'tcell', 'bcell'];
    const cell: ImmuneCell = {
      id: Math.random(),
      type: cellTypes[Math.floor(Math.random() * cellTypes.length)],
      x, y, z: 0,
      vx: bloodFlowRate * 0.8,
      vy: (Math.random() - 0.5) * 0.3,
      health: 100,
      activation: 0,
      phagocytosedCount: 0,
      cytokineProduction: new Map(),
      receptors: { TLR: new Map(), FCR: false, CR: false },
      age: 0,
      maturation: Math.random(),
      exhaustion: 0,
      memory: false
    };
    
    this.state.immuneCells.push(cell);
  }
  
  addFatDeposit(x: number, y: number, size: number) {
    const deposit: FatDeposit = {
      id: Math.random(),
      x, y, size,
      oxidized: Math.random() > 0.5,
      foamCells: Math.floor(Math.random() * 5),
      plaque: true,
      ruptureRisk: 0.3,
      calcification: 0,
      necrotic_core: 0,
      fibrous_cap_thickness: 5
    };
    
    this.state.fatDeposits.push(deposit);
  }
  
  addAntibiotic(drug: string, dose: number) {
    this.activeAntibiotics.set(drug, { dose, timeAdministered: this.currentTime });
  }
  
  removeAntibiotic(drug: string) {
    this.activeAntibiotics.delete(drug);
  }
  
  private calculateSepsisScore(): number {
    return calculateSepsisScore(
      this.state.bacteria.length,
      this.inflammatoryState.TNFalpha > 15 || this.inflammatoryState.IL6 > 20,
      this.currentTime,
      this.state.bloodRheology.plateletActivation,
      undefined
    );
  }
  
  getStats(): SimulationStats {
    const bacteria = this.state.bacteria;
    const speciesCount = new Map<BacterialSpecies, number>();
    
    bacteria.forEach(b => {
      const count = speciesCount.get(b.strain.parentSpecies) || 0;
      speciesCount.set(b.strain.parentSpecies, count + 1);
    });
    
    const averageResistance = bacteria.length > 0 ? 
      bacteria.reduce((sum, b) => sum + Array.from(b.strain.genome.resistanceGenes.values()).reduce((a, b) => a + b, 0), 0) / bacteria.length / 5 : 0;
    
    return {
      totalBacteria: bacteria.length,
      bacterialSpeciesCount: speciesCount,
      uniqueStrains: new Set(bacteria.map(b => b.strain.id)).size,
      dominantStrain: '',
      averageResistance,
      biofilmCoverage: bacteria.filter(b => b.biofilm).length / Math.max(1, bacteria.length),
      totalBiofilmBiomass: bacteria.reduce((sum, b) => 
        sum + b.biofilmMatrix.polysaccharides + b.biofilmMatrix.proteins + b.biofilmMatrix.eDNA, 0
      ),
      phageCount: this.state.phages.length,
      lysogenicBacteria: bacteria.filter(b => b.prophage).length,
      viscosity: this.state.bloodRheology.viscosity,
      sepsisScore: this.calculateSepsisScore(),
      bacteremia: bacteria.length > 10,
      clottingRisk: this.state.bloodRheology.plateletActivation * 100,
      cytokineStorm: this.inflammatoryState.TNFalpha > 15 || this.inflammatoryState.IL6 > 20,
      SIRS_criteria: 0,
      qSOFA_score: 0,
      DIC_risk: this.clottingCascade.calculateDICRisk(this.state.bloodClots, this.state) * 100
    };
  }
  
  render(ctx: CanvasRenderingContext2D, vesselCenterY: number, vesselRadius: number) {
    // Render all simulation entities with enhanced visuals
    
    // Draw fat deposits first (background)
    this.state.fatDeposits.forEach(deposit => {
      ctx.save();
      const gradient = ctx.createRadialGradient(deposit.x, deposit.y, 0, deposit.x, deposit.y, deposit.size);
      gradient.addColorStop(0, deposit.oxidized ? 'rgba(255, 193, 7, 0.7)' : 'rgba(255, 235, 59, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 235, 59, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(deposit.x, deposit.y, deposit.size, 0, Math.PI * 2);
      ctx.fill();
      
      if (deposit.plaque) {
        ctx.strokeStyle = deposit.ruptureRisk > 0.5 ? 'rgba(255, 99, 71, 0.8)' : 'rgba(255, 193, 7, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });
    
    // Draw blood clots
    this.state.bloodClots.forEach(clot => {
      ctx.save();
      const intensity = Math.min(1, clot.occlusion + 0.3);
      const gradient = ctx.createRadialGradient(clot.x, clot.y, 0, clot.x, clot.y, clot.radius);
      gradient.addColorStop(0, `rgba(139, 0, 0, ${intensity})`);
      gradient.addColorStop(0.5, `rgba(178, 34, 34, ${intensity * 0.8})`);
      gradient.addColorStop(1, `rgba(220, 20, 60, ${intensity * 0.4})`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(clot.x, clot.y, clot.radius, 0, Math.PI * 2);
      ctx.fill();
      
      if (clot.stable) {
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    });
    
    // Draw immune cells
    this.state.immuneCells.forEach(cell => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, cell.health / 100);
      
      const colors: Record<CellType, string> = {
        neutrophil: cell.activation > 0.5 ? '#FFB6C1' : '#87CEEB',
        macrophage: cell.activation > 0.5 ? '#FF6347' : '#4682B4',
        tcell: cell.memory ? '#DDA0DD' : '#9370DB',
        bcell: cell.memory ? '#FF69B4' : '#DA70D6',
        nk: '#FF1493',
        platelet: '#FFF8DC',
        dendritic: '#DDA0DD',
        eosinophil: '#FFA07A',
        basophil: '#8A2BE2',
        rbc: '#DC143C'
      };
      
      ctx.fillStyle = colors[cell.type];
      
      // Activation glow
      if (cell.activation > 0.3) {
        ctx.shadowBlur = 8 + cell.activation * 12;
        ctx.shadowColor = colors[cell.type];
      }
      
      const size = cell.type === 'macrophage' ? 8 : cell.type === 'neutrophil' ? 6 : 5;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Memory cells have special marking
      if (cell.memory) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    // Draw bacteria with enhanced detail
    this.state.bacteria.forEach(bacterium => {
      const distFromCenter = Math.sqrt(
        Math.pow(bacterium.y - vesselCenterY, 2) + 
        Math.pow(bacterium.z, 2)
      );
      
      if (distFromCenter < vesselRadius + 15) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, bacterium.health / 100);
        
        // Biofilm rendering
        if (bacterium.biofilm) {
          const biofilmSize = 12 + (bacterium.biofilmMatrix.polysaccharides + 
                                   bacterium.biofilmMatrix.proteins + 
                                   bacterium.biofilmMatrix.eDNA) * 2;
          const biofilmAlpha = Math.min(0.6, biofilmSize / 25);
          
          ctx.fillStyle = `rgba(100, 200, 100, ${biofilmAlpha})`;
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, biofilmSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Opsonization marking
        if (bacterium.opsonized) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Main bacterial body
        const profile = BACTERIAL_PROFILES[bacterium.strain.parentSpecies];
        let size = profile.shape === 'cocci' ? 4 : 6;
        
        // Stress visualization
        if (bacterium.stressLevel > 0.5) {
          ctx.strokeStyle = `rgba(255, 0, 0, ${bacterium.stressLevel})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, size + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Metabolic state affects appearance
        let alpha = 1;
        switch (bacterium.metabolicState) {
          case 'dormant':
            alpha = 0.7;
            break;
          case 'persister':
            alpha = 0.5;
            break;
          case 'VBNC':
            alpha = 0.3;
            break;
          case 'spore':
            alpha = 0.9;
            size *= 0.8;
            break;
        }
        
        ctx.globalAlpha *= alpha;
        ctx.fillStyle = bacterium.strain.color;
        ctx.beginPath();
        
        if (profile.shape === 'bacilli') {
          // Rod shape
          const length = bacterium.strain.morphology.size.length * 3;
          const width = bacterium.strain.morphology.size.width * 3;
          ctx.ellipse(bacterium.x, bacterium.y, length, width, 0, 0, Math.PI * 2);
        } else {
          // Spherical
          ctx.arc(bacterium.x, bacterium.y, size, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Flagella visualization
        if (bacterium.strain.morphology.surface.flagella.type !== 'atrichous' && bacterium.ATP > 10) {
          ctx.strokeStyle = bacterium.strain.color;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 0.3;
          
          const flagellaCount = bacterium.strain.morphology.surface.flagella.number;
          for (let i = 0; i < Math.min(flagellaCount, 8); i++) {
            const angle = (Math.PI * 2 * i) / flagellaCount;
            const length = 15;
            ctx.beginPath();
            ctx.moveTo(bacterium.x, bacterium.y);
            ctx.lineTo(
              bacterium.x + Math.cos(angle) * length,
              bacterium.y + Math.sin(angle) * length
            );
            ctx.stroke();
          }
        }
        
        ctx.restore();
      }
    });
    
    // Draw antibodies
    this.state.antibodies.forEach(ab => {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = Math.min(1, ab.concentration);
      
      // Y-shaped antibody
      ctx.beginPath();
      ctx.moveTo(ab.x, ab.y - 3);
      ctx.lineTo(ab.x - 2, ab.y);
      ctx.moveTo(ab.x, ab.y - 3);
      ctx.lineTo(ab.x + 2, ab.y);
      ctx.lineTo(ab.x, ab.y + 3);
      ctx.stroke();
      ctx.restore();
    });
    
    // Draw phages if any
    this.state.phages.forEach(phage => {
      ctx.save();
      ctx.fillStyle = 'rgba(138, 43, 226, 0.8)';
      
      if (phage.attached) {
        ctx.fillStyle = 'rgba(255, 69, 0, 0.9)';
      }
      
      ctx.beginPath();
      ctx.arc(phage.x, phage.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Phage tail
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(phage.x, phage.y);
      ctx.lineTo(phage.x - 2, phage.y + 4);
      ctx.stroke();
      
      ctx.restore();
    });
  }
}

// ============= HEMOGLOBIN OXYGEN TRANSPORT =============
export class HemoglobinDynamics {
  updateHemoglobin(hb: Hemoglobin, state: SimulationState, deltaTime: number, tissueO2Demand: number = 250) {
    // Hill equation for cooperative oxygen binding
    const n = hb.cooperativity; // Hill coefficient
    const baseP50 = 26; // mmHg at pH 7.4, normal conditions
    
    // Bohr effect - pH affects oxygen affinity
    const pHEffect = Math.pow(10, 0.4 * (7.4 - hb.pH));
    
    // 2,3-BPG effect - shifts curve right (decreases affinity)
    const bpgEffect = 1 + 0.2 * hb.BPG;
    
    // Temperature effect
    const tempEffect = Math.pow(1.024, (37 - 37)); // Simplified
    
    // Calculate effective P50
    hb.p50 = baseP50 * pHEffect * bpgEffect * tempEffect;
    
    // Hill equation: Y = (pO2^n) / (P50^n + pO2^n)
    const saturation = Math.pow(hb.pO2, n) / (Math.pow(hb.p50, n) + Math.pow(hb.pO2, n));
    hb.oxygenSaturation = Math.floor(saturation * 4); // 0-4 oxygens bound
    
    // Allosteric state transition
    if (hb.oxygenSaturation >= 3) {
      hb.state = 'R'; // Relaxed, high affinity state
    } else if (hb.oxygenSaturation <= 1) {
      hb.state = 'T'; // Tense, low affinity state
    }
    
    // CO2 transport - Bohr effect in reverse
    const deoxyFraction = 1 - (saturation);
    const co2Affinity = 0.3 * deoxyFraction; // Deoxy-Hb binds CO2 better
    
    // Update CO2 based on tissue vs lung environment
    if (tissueO2Demand > 300) {
      // High metabolism tissues - pick up CO2
      hb.pCO2 = Math.min(50, hb.pCO2 + co2Affinity * deltaTime);
      hb.pH = Math.max(7.2, hb.pH - 0.1 * co2Affinity * deltaTime); // CO2 → carbonic acid
    } else if (tissueO2Demand < 100) {
      // Lung environment - release CO2
      hb.pCO2 = Math.max(35, hb.pCO2 - 2 * deltaTime);
      hb.pH = Math.min(7.6, hb.pH + 0.05 * deltaTime);
    }
    
    // 2,3-BPG regulation
    if (hb.pO2 < 60) {
      // Hypoxia increases 2,3-BPG to facilitate O2 release
      hb.BPG = Math.min(2, hb.BPG + 0.1 * deltaTime);
    } else {
      hb.BPG = Math.max(0.5, hb.BPG - 0.05 * deltaTime);
    }
  }
  
  calculateOxygenDelivery(hemoglobinCells: Hemoglobin[], cardiacOutput: number): number {
    if (hemoglobinCells.length === 0) return 0;
    
    // Average oxygen saturation across all Hb molecules
    const totalO2Bound = hemoglobinCells.reduce((sum, hb) => sum + hb.oxygenSaturation, 0);
    const maxO2Capacity = hemoglobinCells.length * 4;
    const avgSaturation = totalO2Bound / maxO2Capacity;
    
    // Oxygen content (mL O2/dL blood)
    const hemoglobinConc = 12; // g/dL, assumed normal
    const o2Content = hemoglobinConc * avgSaturation * 1.34; // mL O2/g Hb
    
    // Oxygen delivery (mL/min)
    const o2Delivery = cardiacOutput * 10 * o2Content; // L/min → dL/min conversion
    
    return o2Delivery;
  }
  
  calculateTissueHypoxia(o2Delivery: number, o2Demand: number): number {
    const o2ExtractionRatio = Math.min(0.75, o2Demand / o2Delivery);
    const hypoxiaLevel = Math.max(0, (o2Demand - o2Delivery) / o2Demand);
    
    return clampValue(hypoxiaLevel, 0, 1);
  }
}

// ============= CLOTTING CASCADE =============
export class ClottingCascade {
  initiateCascade(
    injury: { x: number; y: number; severity: number },
    state: SimulationState
  ): BloodClot | null {
    // Check prerequisites for clot formation
    const plateletCount = state.bloodRheology.plateletActivation;
    const fibrinogenLevel = state.bloodRheology.fibrinogenLevel;
    
    if (plateletCount < 0.3 || fibrinogenLevel < 2.0) return null;
    
    const clot: BloodClot = {
      id: Math.random(),
      x: injury.x,
      y: injury.y,
      radius: 5 + injury.severity * 15,
      components: new Map([
        ['fibrin', 0],
        ['platelet', 0],
        ['rbc', 0],
        ['vWF', 0],
        ['factor_VIII', 0],
        ['thrombin', 0]
      ]),
      occlusion: 0,
      age: 0,
      stable: false,
      fibrinolysis: 0,
      tPA: 0,
      plasmin: 0
    };
    
    // Primary hemostasis - platelet plug formation
    this.formPlateletPlug(clot, state);
    
    // Secondary hemostasis - coagulation cascade
    this.activateCoagulationCascade(clot, state, injury.severity);
    
    return clot;
  }
  
  private formPlateletPlug(clot: BloodClot, state: SimulationState) {
    // von Willebrand Factor mediates initial platelet adhesion
    const vWFLevel = state.bloodRheology.vonWillebrandFactor;
    clot.components.set('vWF', vWFLevel);
    
    // Platelet activation and aggregation
    const plateletActivation = state.bloodRheology.plateletActivation;
    clot.components.set('platelet', plateletActivation);
    
    // Positive feedback - activated platelets recruit more platelets
    state.bloodRheology.plateletActivation = Math.min(1, plateletActivation * 1.1);
    
    // ADP and thromboxane A2 release (simplified)
    clot.radius += plateletActivation * 5;
  }
  
  private activateCoagulationCascade(clot: BloodClot, state: SimulationState, severity: number) {
    // Simplified cascade - normally much more complex
    
    // Intrinsic pathway (contact activation)
    const factorXII = 1.0;
    const factorXI = factorXII * 0.9;
    const factorIX = factorXI * 0.85;
    const factorVIII = 1.0; // Anti-hemophilic factor
    
    // Extrinsic pathway (tissue factor exposure)
    const tissueFactor = severity; // Injury releases tissue factor
    const factorVII = tissueFactor * 0.95;
    
    // Common pathway convergence
    const factorX = (factorIX * factorVIII + factorVII) * 0.6;
    const factorV = 1.0;
    const prothrombin = state.bloodRheology.fibrinogenLevel / 3; // Proportional
    
    // Thrombin generation (key enzyme)
    const thrombin = factorX * factorV * prothrombin * 0.7;
    clot.components.set('thrombin', thrombin);
    
    // Fibrinogen → Fibrin conversion
    const fibrinogen = state.bloodRheology.fibrinogenLevel;
    const fibrin = fibrinogen * thrombin * 0.4;
    clot.components.set('fibrin', fibrin);
    
    // Factor XIII cross-links fibrin (stabilizes clot)
    if (fibrin > 0.5) {
      clot.stable = true;
    }
    
    // Positive feedback loops
    if (thrombin > 0.3) {
      // Thrombin activates factors V, VIII, XI (amplification)
      clot.components.set('factor_VIII', (clot.components.get('factor_VIII') || 0) * 1.2);
    }
    
    // Consume clotting factors
    state.bloodRheology.fibrinogenLevel = Math.max(1, fibrinogen - fibrin * 0.2);
    state.bloodRheology.plateletActivation = Math.max(0.1, 
      state.bloodRheology.plateletActivation - 0.1
    );
  }
  
  updateClot(clot: BloodClot, state: SimulationState, deltaTime: number): boolean {
    clot.age += deltaTime;
    
    // Clot retraction (platelets contract)
    if (clot.stable && clot.age > 30) {
      const retractionRate = 0.01 * deltaTime;
      clot.radius = Math.max(5, clot.radius * (1 - retractionRate));
    }
    
    // Red blood cell entrapment
    if (clot.age < 60) {
      const rbcTrapping = Math.min(0.5, clot.age / 120);
      clot.components.set('rbc', rbcTrapping);
    }
    
    // Fibrinolysis (clot breakdown)
    if (clot.age > 180) { // Start after 3 hours
      // Tissue plasminogen activator (tPA) release
      clot.tPA = Math.min(1, clot.tPA + 0.01 * deltaTime);
      
      // Plasminogen → Plasmin conversion
      clot.plasmin = clot.tPA * 0.6;
      
      // Fibrin degradation
      clot.fibrinolysis = clot.plasmin * 0.1;
      
      const fibrin = clot.components.get('fibrin') || 0;
      const newFibrin = Math.max(0, fibrin - clot.fibrinolysis * deltaTime);
      clot.components.set('fibrin', newFibrin);
      
      // D-dimer production (fibrin degradation product)
      const dDimerProduction = clot.fibrinolysis * deltaTime * 10;
      // Would add to blood markers here
      
      // Clot dissolution
      if (newFibrin < 0.1) {
        return false; // Clot completely dissolved
      }
    }
    
    // Calculate vessel occlusion
    const totalMass = Array.from(clot.components.values()).reduce((a, b) => a + b, 0);
    clot.occlusion = Math.min(1, (clot.radius * totalMass) / 500);
    
    // Risk of embolization
    if (!clot.stable && state.bloodRheology.shearStress > 8) {
      // High shear can dislodge unstable clots
      if (Math.random() < 0.01 * deltaTime) {
        // Embolism event - clot breaks off
        // Could create new clot downstream
        return false;
      }
    }
    
    // Thrombosis complications
    if (clot.occlusion > 0.8) {
      // Significant vessel blockage
      // Would affect local blood flow
      state.bloodRheology.viscosity += 0.1 * deltaTime;
    }
    
    return true;
  }
  
  calculateDICRisk(clots: BloodClot[], state: SimulationState): number {
    // Disseminated Intravascular Coagulation risk
    
    let risk = 0;
    
    // Multiple simultaneous clots
    if (clots.length > 3) {
      risk += clots.length * 0.1;
    }
    
    // Consumption of clotting factors
    if (state.bloodRheology.fibrinogenLevel < 2.0) risk += 0.3;
    if (state.bloodRheology.plateletActivation < 0.2) risk += 0.2;
    
    // Bacterial endotoxin trigger
    const endotoxin = state.immuneResponse.cytokineProfile.proInflammatory.get('TNFa') || 0;
    if (endotoxin > 10) risk += endotoxin * 0.02;
    
    // Tissue factor expression from inflammation
    const inflammation = Array.from(state.immuneResponse.cytokineProfile.proInflammatory.values())
                           .reduce((a, b) => a + b, 0);
    if (inflammation > 20) risk += 0.1;
    
    return clampValue(risk, 0, 1);
  }
}

// ============= PHARMACOKINETICS/PHARMACODYNAMICS =============
export class DrugDynamics {
  private activeConcentrations: Map<string, number> = new Map();
  
  calculateDrugConcentration(
    drug: string,
    dose: number,
    timeAfterDose: number,
    patientWeight: number = 70
  ): number {
    const profile = ANTIBIOTIC_PROFILES[drug as keyof typeof ANTIBIOTIC_PROFILES];
    if (!profile) return 0;
    
    const pk = profile.pharmacokinetics;
    
    // Pharmacokinetic parameters
    const ka = pk.absorptionRate || 0; // 1/hr
    const ke = 0.693 / pk.halfLife; // Elimination rate constant
    const F = pk.bioavailability;
    const Vd = pk.volumeDistribution * patientWeight; // L
    
    let concentration = 0;
    
    if (ka > 0) {
      // Oral administration - first-order absorption
      concentration = (F * dose / Vd) * (ka / (ka - ke)) * 
        (Math.exp(-ke * timeAfterDose) - Math.exp(-ka * timeAfterDose));
    } else {
      // IV administration - immediate distribution
      concentration = (dose / Vd) * Math.exp(-ke * timeAfterDose);
    }
    
    // Protein binding reduces free (active) concentration
    const freeConcentration = concentration * (1 - pk.proteinBinding);
    
    this.activeConcentrations.set(drug, freeConcentration);
    return freeConcentration;
  }
  
  calculateDrugEffect(
    concentration: number,
    bacterium: EnhancedBacterium,
    drug: string
  ): { effect: number; resistance: number } {
    const profile = ANTIBIOTIC_PROFILES[drug as keyof typeof ANTIBIOTIC_PROFILES];
    if (!profile) return { effect: 0, resistance: 0 };
    
    // Get bacterial resistance level
    const baseResistance = bacterium.strain.genome.resistanceGenes.get(drug as AntibioticClass) || 0;
    
    // Calculate MIC with resistance
    let baseMIC = 1; // μg/mL baseline
    
    // Species-specific MIC adjustments
    const speciesProfile = BACTERIAL_PROFILES[bacterium.strain.parentSpecies];
    if (speciesProfile.defaultResistance[drug as AntibioticClass]) {
      baseMIC *= (1 + speciesProfile.defaultResistance[drug as AntibioticClass] * 5);
    }
    
    // Resistance mechanisms increase MIC
    const resistanceFactor = Math.pow(2, baseResistance * 10); // Exponential resistance
    const effectiveMIC = baseMIC * resistanceFactor;
    
    // Biofilm protection reduces effective concentration
    let effectiveConcentration = concentration;
    if (bacterium.biofilm) {
      const matrixThickness = bacterium.biofilmMatrix.polysaccharides + 
                             bacterium.biofilmMatrix.proteins + 
                             bacterium.biofilmMatrix.eDNA;
      const penetration = Math.exp(-matrixThickness / 5);
      effectiveConcentration *= penetration;
    }
    
    // Pharmacodynamic model
    let effect = 0;
    const ratio = effectiveConcentration / effectiveMIC;
    
    if (profile.pharmacodynamics.timeDependent) {
      // Time-dependent killing (β-lactams, vancomycin)
      // Effect depends on time above MIC
      if (ratio > 1) {
        effect = Math.min(1, sigmoid(ratio - 1, 2));
      }
    } else {
      // Concentration-dependent killing (fluoroquinolones, aminoglycosides)
      // Effect depends on peak/MIC or AUC/MIC ratio
      effect = Math.min(1, sigmoid(Math.log(ratio), 1));
    }
    
    // Inoculum effect (high bacterial density reduces efficacy)
    const localDensity = 1; // Would calculate from nearby bacteria
    if (profile.pharmacodynamics.inoculum_effect && localDensity > 100) {
      effect *= Math.max(0.3, 1 - Math.log10(localDensity / 100) * 0.2);
    }
    
    return { effect, resistance: baseResistance };
  }
  
  applyAntibioticEffect(
    bacterium: EnhancedBacterium,
    drug: string,
    effect: number,
    deltaTime: number
  ) {
    if (effect <= 0) return;
    
    const profile = ANTIBIOTIC_PROFILES[drug as keyof typeof ANTIBIOTIC_PROFILES];
    if (!profile) return;
    
    // Mechanism-specific effects
    switch (profile.mechanism) {
      case 'cell_wall':
        this.applyCellWallInhibition(bacterium, effect, deltaTime);
        break;
      case 'protein_synthesis':
        this.applyProteinSynthesisInhibition(bacterium, effect, deltaTime);
        break;
      case 'DNA_synthesis':
        this.applyDNASynthesisInhibition(bacterium, effect, deltaTime);
        break;
      case 'RNA_synthesis':
        this.applyRNASynthesisInhibition(bacterium, effect, deltaTime);
        break;
      case 'membrane':
        this.applyMembraneDisruption(bacterium, effect, deltaTime);
        break;
    }
    
    // Post-antibiotic effect (continued killing after drug removal)
    if (effect > 0.5 && profile.pharmacodynamics.postAntibioticEffect > 0) {
      bacterium.stressLevel += effect * 0.2;
    }
    
    // Selection pressure for resistance
    this.applySelectionPressure(bacterium, drug, effect, deltaTime);
  }
  
  private applyCellWallInhibition(bacterium: EnhancedBacterium, effect: number, deltaTime: number) {
    // β-lactams, vancomycin target cell wall synthesis
    
    // Prevent cell division
    bacterium.replicationTimer += deltaTime * 20 * effect;
    
    // Cause lysis in actively dividing bacteria
    if (bacterium.metabolicState === 'active') {
      const lysisRate = effect * deltaTime * 8;
      bacterium.health -= lysisRate;
      
      // Gram-positive bacteria more susceptible to lysis
      if (BACTERIAL_PROFILES[bacterium.strain.parentSpecies].gramPositive) {
        bacterium.health -= lysisRate * 0.5;
      }
    }
    
    // Less effect on dormant bacteria (no active cell wall synthesis)
    if (bacterium.metabolicState === 'dormant' || bacterium.metabolicState === 'persister') {
      bacterium.health -= effect * deltaTime * 2;
    }
  }
  
  private applyProteinSynthesisInhibition(bacterium: EnhancedBacterium, effect: number, deltaTime: number) {
    // Aminoglycosides, chloramphenicol, etc.
    
    // Reduce metabolic rate
    bacterium.metabolicRate *= (1 - effect * 0.8);
    
    // Bacteriostatic effect primarily
    bacterium.health -= effect * deltaTime * 3;
    
    // Prevent division
    bacterium.replicationTimer += deltaTime * 15 * effect;
    
    // Misfolded proteins cause stress
    bacterium.stressLevel += effect * 0.15;
  }
  
  private applyDNASynthesisInhibition(bacterium: EnhancedBacterium, effect: number, deltaTime: number) {
    // Fluoroquinolones target DNA gyrase/topoisomerase
    
    // Severe division inhibition
    bacterium.replicationTimer += deltaTime * 30 * effect;
    
    // DNA damage leads to bacterial death
    bacterium.health -= effect * deltaTime * 6;
    
    // SOS response activation
    bacterium.stressLevel += effect * 0.3;
    
    // Bactericidal effect
    if (effect > 0.7) {
      bacterium.health -= effect * deltaTime * 4;
    }
  }
  
  private applyRNASynthesisInhibition(bacterium: EnhancedBacterium, effect: number, deltaTime: number) {
    // Rifampin targets RNA polymerase
    
    // Severe metabolic disruption
    bacterium.metabolicRate *= (1 - effect * 0.9);
    
    // Rapid bactericidal effect
    bacterium.health -= effect * deltaTime * 7;
    
    // Prevent all growth
    bacterium.replicationTimer += deltaTime * 25 * effect;
  }
  
  private applyMembraneDisruption(bacterium: EnhancedBacterium, effect: number, deltaTime: number) {
    // Polymyxins, daptomycin disrupt membrane
    
    // Rapid killing
    bacterium.health -= effect * deltaTime * 10;
    
    // ATP leakage
    bacterium.ATP *= (1 - effect * 0.2);
    
    // Ion gradient disruption
    bacterium.stressLevel += effect * 0.4;
  }
  
  private applySelectionPressure(bacterium: EnhancedBacterium, drug: string, effect: number, deltaTime: number) {
    // Sub-lethal concentrations select for resistance
    if (effect > 0.1 && effect < 0.8) {
      const mutationChance = effect * 0.001 * deltaTime; // Higher with moderate pressure
      
      if (Math.random() < mutationChance) {
        const currentResistance = bacterium.strain.genome.resistanceGenes.get(drug as AntibioticClass) || 0;
        const newResistance = Math.min(1, currentResistance + 0.1);
        bacterium.strain.genome.resistanceGenes.set(drug as AntibioticClass, newResistance);
        
        // Fitness cost
        bacterium.strain.genome.fitnessCoat += 0.02;
      }
    }
  }
  
  calculateSynergy(drugs: string[], bacterium: EnhancedBacterium): number {
    // Drug combination effects
    if (drugs.length < 2) return 1;
    
    let synergyFactor = 1;
    
    // β-lactam + aminoglycoside synergy
    const hasBetalactam = drugs.some(d => 
      ['penicillin', 'ceftriaxone'].includes(d)
    );
    const hasAminoglycoside = drugs.some(d => 
      ['gentamicin'].includes(d)
    );
    
    if (hasBetalactam && hasAminoglycoside) {
      // β-lactam damages cell wall, allows aminoglycoside penetration
      synergyFactor *= 1.5;
    }
    
    // Trimethoprim-sulfamethoxazole (if available)
    // Sequential folate pathway inhibition would be highly synergistic
    
    return synergyFactor;
  }
  
  getDrugConcentration(drug: string): number {
    return this.activeConcentrations.get(drug) || 0;
  }
}

// ============= IMMUNE SYSTEM LOGIC =============
export class ImmuneSystemLogic {
  private octree: OctreeNode;
  
  constructor(octree: OctreeNode) {
    this.octree = octree;
  }
  
  updateImmuneCell(
    cell: ImmuneCell,
    state: SimulationState,
    deltaTime: number,
    canvasWidth: number
  ): boolean {
    // Movement with chemotaxis
    this.updateImmuneCellMovement(cell, state, deltaTime, canvasWidth);
    
    // Find nearby targets
    const nearbyBacteria = this.findNearbyBacteria(cell);
    const nearbyInfected = this.findNearbyInfectedCells(cell);
    
    // Cell-specific behavior
    switch (cell.type) {
      case 'neutrophil':
        return this.updateNeutrophil(cell, nearbyBacteria, state, deltaTime);
      case 'macrophage':
        return this.updateMacrophage(cell, nearbyBacteria, state, deltaTime);
      case 'tcell':
        return this.updateTCell(cell, nearbyBacteria, nearbyInfected, state, deltaTime);
      case 'bcell':
        return this.updateBCell(cell, nearbyBacteria, state, deltaTime);
      case 'nk':
        return this.updateNKCell(cell, nearbyInfected, state, deltaTime);
      case 'dendritic':
        return this.updateDendriticCell(cell, nearbyBacteria, state, deltaTime);
    }
    
    // Age-based death
    cell.age += deltaTime;
    
    // Cell-specific lifespans
    const lifespans: Record<string, number> = {
      neutrophil: 300,
      macrophage: 2400,
      tcell: 8760,
      bcell: 8760,
      nk: 1440,
      dendritic: 1440
    };
    
    if (cell.age > (lifespans[cell.type] || 1440)) {
      return false; // Apoptosis
    }
    
    return cell.health > 0;
  }
  
  private updateImmuneCellMovement(
    cell: ImmuneCell,
    state: SimulationState,
    deltaTime: number,
    canvasWidth: number
  ) {
    // Chemotaxis toward inflammatory signals
    const chemokineStrength = this.calculateChemotaxisStrength(cell, state);
    
    if (chemokineStrength > 0.1) {
      const direction = this.getChemotaxisDirection(cell, state);
      cell.vx += direction.x * chemokineStrength * deltaTime;
      cell.vy += direction.y * chemokineStrength * deltaTime;
    }
    
    // Random walk when not following signals
    if (chemokineStrength < 0.2) {
      cell.vx += (Math.random() - 0.5) * 0.5;
      cell.vy += (Math.random() - 0.5) * 0.5;
    }
    
    // Apply movement with viscosity effects
    const viscosityFactor = 1 / Math.max(1, state.bloodRheology.viscosity);
    cell.x += cell.vx * deltaTime * viscosityFactor;
    cell.y += cell.vy * deltaTime * viscosityFactor;
    
    // Velocity damping
    cell.vx *= 0.95;
    cell.vy *= 0.95;
    
    // Boundary wrapping
    if (cell.x > canvasWidth) cell.x = 0;
    if (cell.x < 0) cell.x = canvasWidth;
  }
  
  private calculateChemotaxisStrength(cell: ImmuneCell, state: SimulationState): number {
    const il8 = state.immuneResponse.cytokineProfile.chemokines.get('IL8') || 0;
    const mcp1 = state.immuneResponse.cytokineProfile.chemokines.get('MCP1') || 0;
    const c5a = state.immuneResponse.innate.complementActivation.C5a;
    
    return Math.min(2, (il8 + mcp1 + c5a) / 10);
  }
  
  private getChemotaxisDirection(cell: ImmuneCell, state: SimulationState): { x: number; y: number } {
    // Simplified - move toward highest bacterial density
    let maxDensity = 0;
    let bestDirection = { x: 0, y: 0 };
    
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const testX = cell.x + Math.cos(angle) * 50;
      const testY = cell.y + Math.sin(angle) * 50;
      
      const localBacteria = this.octree.query({
        x: testX, y: testY, z: cell.z || 0, radius: 30
      }).filter(e => e.strain).length;
      
      if (localBacteria > maxDensity) {
        maxDensity = localBacteria;
        bestDirection = { x: Math.cos(angle), y: Math.sin(angle) };
      }
    }
    
    return bestDirection;
  }
  
  private findNearbyBacteria(cell: ImmuneCell): EnhancedBacterium[] {
    return this.octree.query({
      x: cell.x, y: cell.y, z: cell.z || 0, radius: 25
    }).filter(e => e.strain) as EnhancedBacterium[];
  }
  
  private findNearbyInfectedCells(cell: ImmuneCell): any[] {
    // Could find virus-infected cells, etc.
    return [];
  }
  
  private updateNeutrophil(
    cell: ImmuneCell,
    bacteria: EnhancedBacterium[],
    state: SimulationState,
    deltaTime: number
  ): boolean {
    if (bacteria.length > 0) {
      cell.activation = Math.min(1, cell.activation + 0.2 * deltaTime);
      
      // Phagocytosis attempt
      const target = bacteria[0];
      const phagocytosisChance = this.calculatePhagocytosisSuccess(cell, target);
      
      if (Math.random() < phagocytosisChance * deltaTime * 0.1) {
        // Successful phagocytosis
        target.health -= 40;
        cell.phagocytosedCount++;
        
        // Respiratory burst - ROS production
        this.performRespiratoryBurst(cell, state);
        
        // Cytokine release
        cell.cytokineProduction.set('IL8', 
          (cell.cytokineProduction.get('IL8') || 0) + 1.0
        );
        
        // Self-damage from ROS
        cell.health -= 3;
      }
      
      // NETs formation under extreme conditions
      if (cell.phagocytosedCount > 3 && bacteria.length > 5 && Math.random() < 0.005) {
        this.formNET(cell, bacteria, state);
        return false; // Neutrophil dies after NET formation
      }
    } else {
      // Deactivate when no targets
      cell.activation *= 0.98;
    }
    
    // Neutrophils have short lifespan, especially when active
    if (cell.activation > 0.8) {
      cell.health -= 0.5 * deltaTime;
    }
    
    return cell.health > 0;
  }
  
  private updateMacrophage(
    cell: ImmuneCell,
    bacteria: EnhancedBacterium[],
    state: SimulationState,
    deltaTime: number
  ): boolean {
    // Determine polarization state
    const proInflammatory = Array.from(state.immuneResponse.cytokineProfile.proInflammatory.values()).reduce((a, b) => a + b, 0);
    const antiInflammatory = Array.from(state.immuneResponse.cytokineProfile.antiInflammatory.values()).reduce((a, b) => a + b, 0);
    
    const m1Polarization = proInflammatory > antiInflammatory + 5;
    
    if (bacteria.length > 0 && m1Polarization) {
      // M1 - inflammatory macrophage
      cell.activation = Math.min(1, cell.activation + 0.1 * deltaTime);
      
      // Enhanced phagocytosis and killing
      const target = bacteria[0];
      const phagocytosisChance = this.calculatePhagocytosisSuccess(cell, target) * 1.2; // Better than neutrophils
      
      if (Math.random() < phagocytosisChance * deltaTime * 0.08) {
        target.health -= 30;
        cell.phagocytosedCount++;
        
        // Antigen processing and presentation
        cell.maturation += 0.1;
        
        // Pro-inflammatory cytokine production
        cell.cytokineProduction.set('TNFa', 
          (cell.cytokineProduction.get('TNFa') || 0) + 0.5
        );
        cell.cytokineProduction.set('IL1', 
          (cell.cytokineProduction.get('IL1') || 0) + 0.3
        );
      }
      
      // Nitric oxide production
      if (cell.activation > 0.7) {
        const noProduction = cell.activation * deltaTime * 0.1;
        state.cytokines.set('nitricOxide', 
          (state.cytokines.get('nitricOxide') || 0) + noProduction
        );
      }
      
    } else if (!m1Polarization) {
      // M2 - tissue repair macrophage
      cell.activation = Math.max(0, cell.activation - 0.05 * deltaTime);
      
      // Anti-inflammatory cytokines
      cell.cytokineProduction.set('IL10', 
        (cell.cytokineProduction.get('IL10') || 0) + 0.2
      );
      
      // Tissue repair factors
      state.immuneResponse.adaptive.memoryFormation += 0.01 * deltaTime;
    }
    
    return true; // Macrophages are long-lived
  }
  
  private updateTCell(
    cell: ImmuneCell,
    bacteria: EnhancedBacterium[],
    infectedCells: any[],
    state: SimulationState,
    deltaTime: number
  ): boolean {
    // T cells need antigen presentation from APCs
    const nearbyAPCs = this.octree.query({
      x: cell.x, y: cell.y, z: cell.z || 0, radius: 20
    }).filter(e => e.type === 'macrophage' || e.type === 'dendritic')
     .filter(apc => apc.maturation > 0.8);
    
    if (nearbyAPCs.length > 0 && bacteria.length > 0) {
      cell.activation = Math.min(1, cell.activation + 0.05 * deltaTime);
      
      // Helper T cell function
      if (Math.random() < 0.5) { // Assume CD4+
        // Help B cells
        state.immuneResponse.adaptive.tcellActivation.CD4 += 0.1 * deltaTime;
        
        // Cytokine production
        cell.cytokineProduction.set('IFNg',
          (cell.cytokineProduction.get('IFNg') || 0) + 0.3
        );
        
        // Th1/Th2 balance
        const bacterialThreat = bacteria.filter(b => 
          !BACTERIAL_PROFILES[b.strain.parentSpecies].gramPositive
        ).length;
        
        if (bacterialThreat > 0) {
          // Th1 response for intracellular pathogens
          state.immuneResponse.adaptive.tcellActivation.Th1_Th2_ratio *= 1.01;
        } else {
          // Th2 response for extracellular
          state.immuneResponse.adaptive.tcellActivation.Th1_Th2_ratio *= 0.99;
        }
      } else {
        // Cytotoxic T cell (CD8+)
        state.immuneResponse.adaptive.tcellActivation.CD8 += 0.08 * deltaTime;
        
        // Direct bacterial killing (limited)
        if (bacteria.length > 0 && Math.random() < 0.02) {
          bacteria[0].health -= 15;
          
          // Perforin/granzyme release
          cell.cytokineProduction.set('IFNg',
            (cell.cytokineProduction.get('IFNg') || 0) + 0.4
          );
        }
      }
      
      // Memory formation
      if (cell.activation > 0.8 && Math.random() < 0.001) {
        cell.memory = true;
        state.immuneResponse.adaptive.memoryFormation += 0.1;
      }
      
    } else {
      // T cell exhaustion without proper stimulation
      cell.exhaustion += 0.001 * deltaTime;
    }
    
    return cell.exhaustion < 0.9 && cell.health > 0;
  }
  
  private updateBCell(
    cell: ImmuneCell,
    bacteria: EnhancedBacterium[],
    state: SimulationState,
    deltaTime: number
  ): boolean {
    if (bacteria.length > 0 && cell.maturation > 0.6) {
      // Antigen recognition
      const targetSpecies = bacteria[0].strain.parentSpecies;
      
      // T cell help required for full activation
      const tcellHelp = state.immuneResponse.adaptive.tcellActivation.CD4 > 0.3;
      
      if (tcellHelp) {
        cell.activation = Math.min(1, cell.activation + 0.03 * deltaTime);
        
        // Antibody production
        if (cell.activation > 0.5) {
          const antibodyType: any = cell.age < 200 ? 'IgM' : 'IgG'; // Class switching
          
          // Create new antibody
          state.antibodies.push({
            id: Math.random(),
            type: antibodyType,
            subclass: antibodyType === 'IgG' ? 'IgG1' : undefined,
            x: cell.x,
            y: cell.y,
            specificity: `${targetSpecies}_surface`,
            affinity: 50 - cell.maturation * 30, // Lower Kd = higher affinity
            opsonizing: true,
            neutralizing: Math.random() > 0.4,
            concentration: 0.1 + cell.activation,
            halfLife: antibodyType === 'IgG' ? 500 : 100,
            complementFixing: antibodyType === 'IgG'
          });
          
          // Somatic hypermutation
          state.immuneResponse.adaptive.somaticHypermutation += 0.01;
          
          // Affinity maturation
          if (Math.random() < 0.1) {
            state.immuneResponse.adaptive.affinityMaturation += 0.05;
          }
        }
        
        // Plasma cell differentiation
        if (cell.activation > 0.8 && Math.random() < 0.01) {
          // Become antibody factory
          cell.health += 50; // Reset for plasma cell phase
          cell.maturation = 1;
        }
        
        // Memory B cell formation
        if (Math.random() < 0.001) {
          cell.memory = true;
          state.immuneResponse.adaptive.memoryFormation += 0.1;
        }
      }
    }
    
    return true; // B cells are relatively long-lived
  }
  
  private updateNKCell(
    cell: ImmuneCell,
    infectedCells: any[],
    state: SimulationState,
    deltaTime: number
  ): boolean {
    // NK cells respond to stressed/infected cells
    const nearbyStressedBacteria = this.octree.query({
      x: cell.x, y: cell.y, z: cell.z || 0, radius: 25
    }).filter(e => e.strain && e.stressLevel > 0.6) as EnhancedBacterium[];
    
    if (nearbyStressedBacteria.length > 0) {
      cell.activation = Math.min(1, cell.activation + 0.08 * deltaTime);
      
      // Direct cytolysis
      if (Math.random() < cell.activation * deltaTime * 0.05) {
        const target = nearbyStressedBacteria[0];
        target.health -= 25;
        
        // IFN-γ production
        cell.cytokineProduction.set('IFNg',
          (cell.cytokineProduction.get('IFNg') || 0) + 0.4
        );
        
        // Activate macrophages
        state.immuneResponse.innate.macrophageActivation += 0.1;
      }
    }
    
    // NK cells are short-lived but very active
    cell.health -= 0.1 * deltaTime;
    return cell.health > 0;
  }
  
  private updateDendriticCell(
    cell: ImmuneCell,
    bacteria: EnhancedBacterium[],
    state: SimulationState,
    deltaTime: number
  ): boolean {
    // Dendritic cells are professional antigen presenters
    if (bacteria.length > 0) {
      // Antigen uptake
      if (Math.random() < 0.05 * deltaTime) {
        cell.phagocytosedCount++;
        bacteria[0].health -= 10; // Gentle sampling
        
        // Maturation
        cell.maturation = Math.min(1, cell.maturation + 0.2);
      }
      
      // Migration to lymph nodes (simplified as increased activation)
      if (cell.maturation > 0.8) {
        cell.activation = 1;
        
        // Prime T and B cells
        state.immuneResponse.adaptive.tcellActivation.CD4 += 0.2 * deltaTime;
        state.immuneResponse.adaptive.tcellActivation.CD8 += 0.1 * deltaTime;
        
        // Cytokine production
        cell.cytokineProduction.set('IL1', 
          (cell.cytokineProduction.get('IL1') || 0) + 0.3
        );
      }
    }
    
    return true; // Long-lived antigen presenters
  }
  
  private calculatePhagocytosisSuccess(cell: ImmuneCell, bacterium: EnhancedBacterium): number {
    let baseChance = 0.3;
    
    // Opsonization helps
    if (bacterium.opsonized) baseChance *= 2;
    if (bacterium.complementBound) baseChance *= 1.5;
    
    // Capsule hinders
    if (bacterium.strain.morphology.surface.capsule.present) {
      baseChance *= (1 - bacterium.strain.morphology.surface.capsule.phagocytosisResistance);
    }
    
    // Biofilm protection
    if (bacterium.biofilm) {
      const matrixThickness = bacterium.biofilmMatrix.polysaccharides + 
                             bacterium.biofilmMatrix.proteins + 
                             bacterium.biofilmMatrix.eDNA;
      baseChance *= Math.max(0.1, 1 - matrixThickness / 10);
    }
    
    // Size matters
    const size = bacterium.strain.morphology.size.width * bacterium.strain.morphology.size.length;
    baseChance *= Math.max(0.5, 2 - size); // Smaller bacteria easier to phagocytose
    
    return Math.max(0.01, Math.min(0.9, baseChance));
  }
  
  private performRespiratoryBurst(cell: ImmuneCell, state: SimulationState) {
    // Generate ROS
    const rosProduction = 0.5;
    
    // Damage nearby bacteria
    const nearbyBacteria = this.octree.query({
      x: cell.x, y: cell.y, z: cell.z || 0, radius: 15
    }).filter(e => e.strain) as EnhancedBacterium[];
    
    nearbyBacteria.forEach(bacterium => {
      bacterium.health -= rosProduction * 5;
      bacterium.stressLevel += 0.1;
    });
    
    // Self-damage
    cell.health -= rosProduction;
  }
  
  private formNET(cell: ImmuneCell, bacteria: EnhancedBacterium[], state: SimulationState) {
    // Neutrophil Extracellular Traps
    const netRadius = 40;
    
    bacteria.forEach(bacterium => {
      const dist = Math.sqrt(
        Math.pow(bacterium.x - cell.x, 2) +
        Math.pow(bacterium.y - cell.y, 2)
      );
      
      if (dist < netRadius) {
        // Immobilize bacteria
        bacterium.vx *= 0.05;
        bacterium.vy *= 0.05;
        bacterium.stressLevel += 0.4;
        
        // Gradual killing
        bacterium.health -= 0.5;
      }
    });
    
    // NET components
    state.cytokines.set('histones', (state.cytokines.get('histones') || 0) + 1);
    state.cytokines.set('eDNA', (state.cytokines.get('eDNA') || 0) + 2);
  }
}

// ============= BACTERIAL BEHAVIOR ENGINE =============
export class BacterialBehavior {
  private octree: OctreeNode;
  private evolution: BacterialEvolution;
  
  constructor(octree: OctreeNode, evolution: BacterialEvolution) {
    this.octree = octree;
    this.evolution = evolution;
  }
  
  updateBacterium(
    bacterium: EnhancedBacterium,
    state: SimulationState,
    deltaTime: number,
    vesselRadius: number,
    vesselCenterY: number,
    canvasWidth: number
  ): boolean {
    const profile = BACTERIAL_PROFILES[bacterium.strain.parentSpecies];
    
    // Age and environmental stress
    bacterium.age += deltaTime;
    this.updateStressLevel(bacterium, state, deltaTime);
    
    // Metabolic state transitions based on environmental conditions
    this.updateMetabolicState(bacterium, state.nutrients, deltaTime);
    
    // Nutrient consumption and metabolism
    this.performMetabolism(bacterium, state.nutrients, deltaTime);
    
    // Quorum sensing - bacterial communication
    if (ADVANCED_CONFIG.ENABLE_QUORUM_SENSING) {
      this.performQuorumSensing(bacterium, state, profile);
    }
    
    // Movement and motility
    if (!bacterium.adherent) {
      this.updateMovement(bacterium, state.bloodRheology, profile, deltaTime, canvasWidth);
      this.checkVesselBoundary(bacterium, vesselRadius, vesselCenterY, profile);
    }
    
    // Virulence factor expression
    this.expressVirulenceFactors(bacterium, state, deltaTime);
    
    // Biofilm formation and maintenance
    if (bacterium.adherent || bacterium.quorumSignal > 0.8) {
      this.manageBiofilm(bacterium, state, deltaTime);
    }
    
    // DNA repair and stress response
    this.performStressResponse(bacterium, deltaTime);
    
    // Cell division conditions
    if (this.canDivide(bacterium)) {
      return true; // Signal division needed
    }
    
    // Death conditions - multiple failure modes
    if (this.isDead(bacterium)) {
      this.handleBacterialDeath(bacterium, state);
      return false; // Signal death
    }
    
    return true; // Continue living
  }
  
  private updateStressLevel(bacterium: EnhancedBacterium, state: SimulationState, deltaTime: number) {
    let stress = bacterium.stressLevel;
    
    // Environmental stressors
    const tempStress = Math.abs(bacterium.temperature - 37) / 10;
    const pHStress = Math.abs(bacterium.pH - 7.4) / 2;
    const osmotic = Math.max(0, (state.bloodRheology.viscosity - 3.5) / 2);
    
    // Immune pressure
    const nearbyImmune = this.octree.query({
      x: bacterium.x, y: bacterium.y, z: bacterium.z, radius: 30
    }).filter(e => e.type && ['neutrophil', 'macrophage'].includes(e.type)).length;
    
    const immuneStress = Math.min(1, nearbyImmune * 0.2);
    
    // Antibiotic stress (handled by drug dynamics elsewhere)
    
    // Combine stressors
    const totalStress = tempStress + pHStress + osmotic + immuneStress;
    
    // Stress accumulation with recovery
    const dStress_dt = totalStress * 2 - stress * 0.5; // Recovery when stress removed
    bacterium.stressLevel = clampValue(stress + dStress_dt * deltaTime, 0, 1);
  }
  
  private updateMetabolicState(bacterium: EnhancedBacterium, nutrients: Macronutrients, deltaTime: number) {
    const glucoseLevel = nutrients.carbohydrates.glucose;
    const oxygenAvailable = bacterium.strain.genome.metabolicCapabilities.oxygenRequirement !== 'anaerobic';
    const currentState = bacterium.metabolicState;
    
    // State transition logic with hysteresis
    if (bacterium.stressLevel > 0.8 && bacterium.ATP < 20) {
      // Extreme stress → VBNC or persister
      bacterium.metabolicState = bacterium.temperature < 35 ? 'VBNC' : 'persister';
      bacterium.metabolicRate = 0.05;
    } else if (bacterium.stressLevel > 0.6 || glucoseLevel < 2.0) {
      // Moderate stress → dormancy
      if (currentState === 'active') {
        bacterium.metabolicState = 'dormant';
        bacterium.metabolicRate = 0.3;
      }
    } else if (glucoseLevel > 4.0 && bacterium.stressLevel < 0.3 && bacterium.ATP > 30) {
      // Good conditions → active growth
      if (currentState !== 'active') {
        bacterium.metabolicState = 'active';
        bacterium.metabolicRate = 1.0;
      }
    }
    
    // Some species can sporulate
    if (['S_aureus'].includes(bacterium.strain.parentSpecies) && 
        bacterium.stressLevel > 0.9 && Math.random() < 0.001 * deltaTime) {
      bacterium.metabolicState = 'spore';
      bacterium.metabolicRate = 0.01;
      bacterium.health = Math.min(100, bacterium.health + 20); // Spores are resistant
    }
  }
  
  private performMetabolism(bacterium: EnhancedBacterium, nutrients: Macronutrients, deltaTime: number) {
    const consumptionRate = bacterium.metabolicRate * deltaTime;
    const pathways = bacterium.strain.genome.metabolicCapabilities.pathways;
    
    let atpProduced = 0;
    
    // Glucose metabolism
    if (pathways.includes('glycolysis')) {
      const glucoseNeeded = 0.1 * consumptionRate;
      if (nutrients.carbohydrates.glucose >= glucoseNeeded) {
        nutrients.carbohydrates.glucose -= glucoseNeeded;
        bacterium.nutrientStores.set('glucose', (bacterium.nutrientStores.get('glucose') || 0) + glucoseNeeded);
        
        // Glycolysis: glucose → 2 pyruvate + 2 ATP
        atpProduced += 2 * consumptionRate;
        bacterium.wasteProducts.set('pyruvate', (bacterium.wasteProducts.get('pyruvate') || 0) + 0.2 * consumptionRate);
      }
    }
    
    // Oxidative metabolism
    if (pathways.includes('oxidative_phosphorylation') && bacterium.strain.genome.metabolicCapabilities.oxygenRequirement !== 'anaerobic') {
      const pyruvate = bacterium.wasteProducts.get('pyruvate') || 0;
      if (pyruvate > 0.01) {
        const pyruvateCons = Math.min(pyruvate, 0.1 * consumptionRate);
        bacterium.wasteProducts.set('pyruvate', pyruvate - pyruvateCons);
        
        // Oxidative phosphorylation: pyruvate → 36 ATP
        atpProduced += 36 * pyruvateCons * 10;
        bacterium.wasteProducts.set('CO2', (bacterium.wasteProducts.get('CO2') || 0) + pyruvateCons * 3);
      }
    }
    
    // Fermentation (anaerobic backup)
    if (pathways.includes('fermentation')) {
      const pyruvate = bacterium.wasteProducts.get('pyruvate') || 0;
      if (pyruvate > 0.01 && (bacterium.strain.genome.metabolicCapabilities.oxygenRequirement === 'anaerobic' || Math.random() < 0.3)) {
        const pyruvateCons = Math.min(pyruvate, 0.05 * consumptionRate);
        bacterium.wasteProducts.set('pyruvate', pyruvate - pyruvateCons);
        
        // Fermentation: pyruvate → lactate + modest ATP
        atpProduced += 1 * pyruvateCons * 10;
        bacterium.wasteProducts.set('lactate', (bacterium.wasteProducts.get('lactate') || 0) + pyruvateCons);
      }
    }
    
    // Amino acid metabolism
    const aminoAcidNeeded = 0.05 * consumptionRate;
    if (nutrients.proteins.aminoAcidPool >= aminoAcidNeeded) {
      nutrients.proteins.aminoAcidPool -= aminoAcidNeeded;
      bacterium.nutrientStores.set('amino_acids', (bacterium.nutrientStores.get('amino_acids') || 0) + aminoAcidNeeded);
      atpProduced += 4 * consumptionRate; // Amino acid catabolism
    }
    
    // Iron acquisition (critical for growth)
    const ironNeeded = 0.001 * consumptionRate;
    bacterium.nutrientStores.set('iron', (bacterium.nutrientStores.get('iron') || 0) + ironNeeded);
    
    // Update ATP with production and consumption
    bacterium.ATP = clampValue(bacterium.ATP + atpProduced - (0.5 * deltaTime), 0, 100);
  }
  
  private performQuorumSensing(bacterium: EnhancedBacterium, state: SimulationState, profile: any) {
    // Find nearby bacteria of same species
    const nearbyBacteria = this.octree.query({
      x: bacterium.x, y: bacterium.y, z: bacterium.z, radius: 50
    }).filter(e => e.strain?.parentSpecies === bacterium.strain.parentSpecies);
    
    const localDensity = nearbyBacteria.length;
    const threshold = profile.quorumThreshold;
    
    // Update quorum signal concentration
    bacterium.quorumSignal = localDensity / threshold;
    
    // Quorum sensing effects
    if (bacterium.quorumSignal > 1.0) {
      // Activate group behaviors
      
      // Enhanced biofilm formation
      if (bacterium.adherent) {
        bacterium.biofilm = true;
      }
      
      // Coordinate virulence factor expression
      if (bacterium.strain.genome.virulenceFactors.toxinProduction.exotoxins) {
        Object.keys(bacterium.strain.genome.virulenceFactors.toxinProduction.exotoxins).forEach(toxin => {
          const currentLevel = bacterium.strain.genome.virulenceFactors.toxinProduction.exotoxins[toxin as keyof typeof bacterium.strain.genome.virulenceFactors.toxinProduction.exotoxins];
          if (currentLevel) {
            // Boost toxin production at high density
            const newLevel = currentLevel * (1 + bacterium.quorumSignal * 0.5);
            (bacterium.strain.genome.virulenceFactors.toxinProduction.exotoxins as any)[toxin] = newLevel;
          }
        });
      }
      
      // Antibiotic resistance sharing prep
      if (Math.random() < 0.001 && bacterium.strain.genome.plasmids.length > 0) {
        // Mark for horizontal gene transfer
        bacterium.gridKey += '_hgt_ready';
      }
    }
  }
  
  private updateMovement(
    bacterium: EnhancedBacterium,
    rheology: BloodRheology,
    profile: any,
    deltaTime: number,
    canvasWidth: number
  ) {
    const flagellaType = bacterium.strain.morphology.surface.flagella.type;
    const flagellaCount = bacterium.strain.morphology.surface.flagella.number;
    let motilityFactor = 0;
    
    // Flagellar motility
    if (flagellaCount > 0 && bacterium.ATP > 5) {
      switch (flagellaType) {
        case 'monotrichous':
          motilityFactor = 1.2 * Math.min(1, bacterium.ATP / 20); // Efficient
          break;
        case 'peritrichous':
          motilityFactor = 0.8 * Math.min(1, bacterium.ATP / 30); // Many flagella, more ATP cost
          break;
        case 'lophotrichous':
          motilityFactor = 1.0 * Math.min(1, bacterium.ATP / 25);
          break;
        default:
          motilityFactor = 0;
      }
      
      // ATP cost for movement
      bacterium.ATP -= motilityFactor * 0.1 * deltaTime;
    }
    
    // Chemotaxis - move toward nutrients, away from toxins
    if (motilityFactor > 0) {
      const chemotaxisForce = this.calculateChemotaxisForce(bacterium, deltaTime);
      bacterium.vx += chemotaxisForce.x * motilityFactor * 0.1;
      bacterium.vy += chemotaxisForce.y * motilityFactor * 0.1;
    }
    
    // Blood flow influence
    const flowResistance = 1 / Math.max(0.5, rheology.viscosity);
    bacterium.vx += (5 - bacterium.vx) * 0.1 * flowResistance; // Drag toward bulk flow
    
    // Brownian motion (thermal)
    const brownianStrength = 0.5 / (bacterium.strain.morphology.size.width * bacterium.strain.morphology.size.length);
    bacterium.vx += (Math.random() - 0.5) * brownianStrength;
    bacterium.vy += (Math.random() - 0.5) * brownianStrength;
    
    // Apply viscosity damping
    const dampingFactor = Math.exp(-rheology.viscosity * deltaTime / 10);
    bacterium.vx *= dampingFactor;
    bacterium.vy *= dampingFactor;
    
    // Update position
    bacterium.x += bacterium.vx * deltaTime * motilityFactor;
    bacterium.y += bacterium.vy * deltaTime * motilityFactor;
    
    // Boundary wrapping
    if (bacterium.x > canvasWidth) bacterium.x = 0;
    if (bacterium.x < 0) bacterium.x = canvasWidth;
  }
  
  private calculateChemotaxisForce(bacterium: EnhancedBacterium, deltaTime: number): { x: number; y: number } {
    // Simplified chemotaxis - bacteria sense gradients and move accordingly
    const sampleDistance = 5;
    const currentNutrient = this.estimateLocalNutrientLevel(bacterium.x, bacterium.y);
    
    // Sample nearby positions
    const gradientX = this.estimateLocalNutrientLevel(bacterium.x + sampleDistance, bacterium.y) - 
                      this.estimateLocalNutrientLevel(bacterium.x - sampleDistance, bacterium.y);
    const gradientY = this.estimateLocalNutrientLevel(bacterium.x, bacterium.y + sampleDistance) - 
                      this.estimateLocalNutrientLevel(bacterium.x, bacterium.y - sampleDistance);
    
    // Normalize and apply
    const magnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
    if (magnitude > 0.01) {
      return {
        x: gradientX / magnitude,
        y: gradientY / magnitude
      };
    }
    
    return { x: 0, y: 0 };
  }
  
  private estimateLocalNutrientLevel(x: number, y: number): number {
    // Simplified nutrient field - could be enhanced with proper diffusion
    // For now, assume higher nutrients near vessel center, lower near walls
    const vesselCenter = 300; // Approximate
    const distanceFromCenter = Math.abs(y - vesselCenter);
    return Math.max(0.1, 1 - distanceFromCenter / 200);
  }
  
  private checkVesselBoundary(
    bacterium: EnhancedBacterium,
    vesselRadius: number,
    vesselCenterY: number,
    profile: any
  ) {
    const distFromCenter = Math.sqrt(
      Math.pow(bacterium.y - vesselCenterY, 2) + 
      Math.pow(bacterium.z, 2)
    );
    
    if (distFromCenter > vesselRadius - 15) {
      // Check for adherence based on adhesins and surface properties
      const adhesinCount = bacterium.strain.genome.virulenceFactors.adhesins.length;
      const adherenceChance = adhesinCount * 0.15 * (1 - bacterium.stressLevel);
      
      if (Math.random() < adherenceChance && bacterium.ATP > 10) {
        bacterium.adherent = true;
        bacterium.vx = 0;
        bacterium.vy = 0;
        bacterium.vz = 0;
        
        // Position on vessel wall
        const angle = Math.atan2(bacterium.y - vesselCenterY, bacterium.z);
        bacterium.y = vesselCenterY + (vesselRadius - 10) * Math.sin(angle);
        bacterium.z = (vesselRadius - 10) * Math.cos(angle);
      } else {
        // Bounce off wall
        const angle = Math.atan2(bacterium.y - vesselCenterY, bacterium.z);
        bacterium.y = vesselCenterY + (vesselRadius - 20) * Math.sin(angle);
        bacterium.z = (vesselRadius - 20) * Math.cos(angle);
        
        // Elastic collision
        bacterium.vy *= -0.6;
        bacterium.vz *= -0.6;
      }
    }
  }
  
  private expressVirulenceFactors(bacterium: EnhancedBacterium, state: SimulationState, deltaTime: number) {
    const vf = bacterium.strain.genome.virulenceFactors;
    
    // Toxin production - ATP expensive
    if (bacterium.ATP > 20 && bacterium.metabolicState === 'active') {
      // Alpha hemolysin (S. aureus)
      if (vf.toxinProduction.exotoxins.alphaHemolysin && bacterium.ATP > 15) {
        const production = vf.toxinProduction.exotoxins.alphaHemolysin * deltaTime * 0.01;
        state.cytokines.set('alphaHemolysin', 
          (state.cytokines.get('alphaHemolysin') || 0) + production
        );
        bacterium.ATP -= 2 * deltaTime;
      }
      
      // Streptolysin O (S. pyogenes)
      if (vf.toxinProduction.exotoxins.streptolysinO && bacterium.ATP > 12) {
        const production = vf.toxinProduction.exotoxins.streptolysinO * deltaTime * 0.008;
        state.cytokines.set('streptolysinO', 
          (state.cytokines.get('streptolysinO') || 0) + production
        );
        bacterium.ATP -= 1.5 * deltaTime;
      }
      
      // Exotoxin A (P. aeruginosa)
      if (vf.toxinProduction.exotoxins.exotoxinA && bacterium.ATP > 18) {
        const production = vf.toxinProduction.exotoxins.exotoxinA * deltaTime * 0.012;
        state.cytokines.set('exotoxinA', 
          (state.cytokines.get('exotoxinA') || 0) + production
        );
        bacterium.ATP -= 2.5 * deltaTime;
      }
    }
    
    // Endotoxin release (Gram-negative, passive on cell death/stress)
    if (!BACTERIAL_PROFILES[bacterium.strain.parentSpecies].gramPositive && 
        (bacterium.health < 50 || bacterium.stressLevel > 0.6)) {
      const endotoxinRelease = vf.toxinProduction.endotoxin * deltaTime * 0.1 * bacterium.stressLevel;
      state.immuneResponse.innate.acutePhaseProteins.CRP += endotoxinRelease * 5;
      state.immuneResponse.cytokineProfile.proInflammatory.set('TNFa',
        (state.immuneResponse.cytokineProfile.proInflammatory.get('TNFa') || 0) + endotoxinRelease
      );
    }
    
    // Siderophore production (iron acquisition)
    if (bacterium.nutrientStores.get('iron') || 0 < 0.01) {
      vf.siderophores.forEach(siderophore => {
        if (bacterium.ATP > 5) {
          bacterium.ATP -= 0.5 * deltaTime;
          bacterium.nutrientStores.set('iron', 
            (bacterium.nutrientStores.get('iron') || 0) + 0.005 * deltaTime
          );
        }
      });
    }
  }
  
  private manageBiofilm(bacterium: EnhancedBacterium, state: SimulationState, deltaTime: number) {
    const biofilmGenes = bacterium.strain.genome.virulenceFactors.biofilmGenes;
    
    // Initiate biofilm if conditions met
    if (!bacterium.biofilm && bacterium.adherent && bacterium.quorumSignal > 0.8) {
      bacterium.biofilm = true;
    }
    
    if (bacterium.biofilm && bacterium.ATP > 10) {
      // Produce extracellular matrix components
      let matrixProduction = 0.05 * deltaTime;
      
      // Gene-specific production
      if (biofilmGenes.pgaABCD) {
        // PNAG polysaccharide
        bacterium.biofilmMatrix.polysaccharides += matrixProduction;
        bacterium.ATP -= 1 * deltaTime;
      }
      
      if (biofilmGenes.icaADBC) {
        // PIA polysaccharide (S. aureus)
        bacterium.biofilmMatrix.polysaccharides += matrixProduction * 1.2;
        bacterium.ATP -= 1.2 * deltaTime;
      }
      
      if (biofilmGenes.csgAB) {
        // Curli proteins (E. coli)
        bacterium.biofilmMatrix.proteins += matrixProduction * 0.8;
        bacterium.ATP -= 0.8 * deltaTime;
      }
      
      // eDNA release (programmed cell death)
      if (Math.random() < 0.001 * deltaTime && bacterium.health > 50) {
        bacterium.biofilmMatrix.eDNA += 0.1;
        bacterium.health -= 5;
      }
      
      // Biofilm benefits
      const matrixThickness = bacterium.biofilmMatrix.polysaccharides + 
                             bacterium.biofilmMatrix.proteins + 
                             bacterium.biofilmMatrix.eDNA;
      
      // Protection from immune system
      const protection = Math.min(0.9, matrixThickness / 10);
      if (protection > 0.3) {
        bacterium.opsonized = false; // Shed opsonizing antibodies
        bacterium.complementBound = false;
      }
      
      // Reduced antibiotic penetration (handled in drug dynamics)
      
      // Nutrient diffusion limitation in thick biofilms
      if (matrixThickness > 5) {
        bacterium.metabolicRate *= 0.8; // Limited diffusion
      }
    }
  }
  
  private performStressResponse(bacterium: EnhancedBacterium, deltaTime: number) {
    if (bacterium.stressLevel > 0.3 && bacterium.ATP > 5) {
      // Heat shock proteins
      if (Math.abs(bacterium.temperature - 37) > 2) {
        bacterium.ATP -= 2 * deltaTime;
        bacterium.health += 1 * deltaTime; // Repair
      }
      
      // SOS response (DNA repair)
      if (bacterium.stressLevel > 0.6) {
        bacterium.ATP -= 3 * deltaTime;
        bacterium.health += 0.5 * deltaTime;
        
        // May trigger horizontal gene transfer or mutations
        if (Math.random() < ADVANCED_CONFIG.MUTATION_RATE * bacterium.stressLevel * 100) {
          // Stress-induced mutagenesis
          bacterium.strain = this.evolution.generateStrain(
            bacterium.strain.parentSpecies, 
            bacterium.strain
          );
        }
      }
    }
  }
  
  private canDivide(bacterium: EnhancedBacterium): number | boolean {
    return (
      bacterium.ATP > 50 &&
      bacterium.health > 60 &&
      bacterium.replicationTimer <= 0 &&
      bacterium.metabolicState === 'active' &&
      bacterium.nutrientStores.get('amino_acids') || 0 > 0.1 &&
      bacterium.nutrientStores.get('iron') || 0 > 0.001
    );
  }
  
  private isDead(bacterium: EnhancedBacterium): boolean {
    return (
      bacterium.health <= 0 ||
      bacterium.ATP <= 0 ||
      bacterium.age > 3600 * 8 || // 8 hour max lifespan
      (bacterium.stressLevel > 0.95 && bacterium.metabolicState !== 'spore')
    );
  }
  
  private handleBacterialDeath(bacterium: EnhancedBacterium, state: SimulationState) {
    // Release cellular contents
    
    // Endotoxin release from Gram-negative
    if (!BACTERIAL_PROFILES[bacterium.strain.parentSpecies].gramPositive) {
      const endotoxin = bacterium.strain.genome.virulenceFactors.toxinProduction.endotoxin;
      state.immuneResponse.cytokineProfile.proInflammatory.set('TNFa',
        (state.immuneResponse.cytokineProfile.proInflammatory.get('TNFa') || 0) + endotoxin * 2
      );
    }
    
    // DNA release for biofilm
    if (bacterium.biofilm) {
      bacterium.biofilmMatrix.eDNA += 0.5;
    }
    
    // Nutrient release
    const glucose = bacterium.nutrientStores.get('glucose') || 0;
    const aminoAcids = bacterium.nutrientStores.get('amino_acids') || 0;
    
    state.nutrients.carbohydrates.glucose += glucose * 0.5;
    state.nutrients.proteins.aminoAcidPool += aminoAcids * 0.5;
  }
}