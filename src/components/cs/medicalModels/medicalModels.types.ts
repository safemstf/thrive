// ============================================================================
// MEDICAL MODELS TYPES FOR ACUTE VASCULAR MEDICINE
// ============================================================================

// ============= PREDICTIVE MODELS =============

export interface DVTRiskFactors {
  age: number;
  bmi: number;
  previousDVT: boolean;
  recentSurgery: boolean;
  immobilization: boolean;
  cancer: boolean;
  pregnancy: boolean;
  oralContraceptives: boolean;
  smoking: boolean;
  familyHistory: boolean;
}

export interface DVTRiskScore {
  score: number;
  risk: 'Low' | 'Moderate' | 'High';
  probability: number; // 0-100
  recommendation: string;
}

export interface PEPrediction {
  wellsScore: number;
  pesiScore: number;
  risk: 'Low' | 'Intermediate' | 'High';
  mortality30Day: number; // percentage
  recommendation: string;
}

export interface StrokeRiskFactors {
  age: number;
  hypertension: boolean;
  diabetes: boolean;
  strokeHistory: boolean;
  vascularDisease: boolean;
  atrialFibrillation: boolean;
  congestiveHeartFailure: boolean;
  sex: 'male' | 'female';
}

export interface StrokeRiskScore {
  chadsVascScore: number;
  annualStrokeRisk: number; // percentage
  anticoagulationRecommended: boolean;
  recommendation: string;
}

// ============= CLASSIFICATION MODELS =============

export interface PADClassification {
  anklebrachialIndex: number; // ABI
  stage: 'Normal' | 'Borderline' | 'Mild' | 'Moderate' | 'Severe';
  fontaineStage: number; // 1-4
  symptoms: string[];
  intervention: string;
}

export interface AneurysmData {
  location: 'Abdominal Aorta' | 'Thoracic Aorta' | 'Popliteal' | 'Femoral' | 'Carotid';
  diameter: number; // mm
  growthRate: number; // mm/year
  classification: string;
  ruptureRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  surgeryRecommended: boolean;
  timeToSurgery: string;
}

export interface VascularUltrasoundFindings {
  vesselDiameter: number;
  peakSystolicVelocity: number;
  endDiastolicVelocity: number;
  resistivityIndex: number;
  stenosis: number; // percentage
  classification: string;
}

// ============= SIMULATION MODELS =============

export interface BloodFlowParameters {
  vesselDiameter: number; // mm
  bloodPressure: number; // mmHg
  heartRate: number; // bpm
  viscosity: number; // cP
  stenosis: number; // 0-100%
  plaqueBurden: number; // 0-100%
}

export interface BloodFlowMetrics {
  flowRate: number; // mL/min
  velocity: number; // cm/s
  wallShearStress: number; // dynes/cm²
  turbulence: number; // 0-1
  pressureDrop: number; // mmHg
  ischemiaRisk: 'Low' | 'Moderate' | 'High';
}

export interface ThrombusSimulation {
  plateletCount: number;
  fibrinogenLevel: number;
  anticoagulantLevel: number;
  endothelialDamage: number; // 0-100
  stasisDegree: number; // 0-100
  thrombusSize: number; // mm
  embolizationRisk: number; // 0-100
}

export interface AnticoagulationModel {
  drug: 'Warfarin' | 'Heparin' | 'LMWH' | 'DOAC';
  dose: number;
  inr: number; // International Normalized Ratio
  targetINR: { min: number; max: number };
  bleedingRisk: number; // 0-100
  efficacy: number; // 0-100
  adjustmentNeeded: boolean;
  recommendation: string;
}

// ============= PATIENT DATA =============

export interface VascularPatient {
  age: number;
  sex: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  bmi: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  smokingStatus: 'Never' | 'Former' | 'Current';
  diabetesMellitus: boolean;
  hypertension: boolean;
  hyperlipidemia: boolean;
  chronicKidneyDisease: boolean;
  coronaryArteryDisease: boolean;
  previousStroke: boolean;
  peripheralArteryDisease: boolean;
}

// ============= MODEL TYPES =============

export type ModelType = 'predictive' | 'classification' | 'simulation';

export type PredictiveModelName =
  | 'DVT Risk Calculator'
  | 'PE Risk Assessment'
  | 'Stroke Risk (CHA₂DS₂-VASc)'
  | 'AAA Rupture Risk';

export type ClassificationModelName =
  | 'PAD Classification'
  | 'Aneurysm Grading'
  | 'Carotid Stenosis Grading'
  | 'Chronic Limb Ischemia';

export type SimulationModelName =
  | 'Blood Flow Dynamics'
  | 'Thrombosis Formation'
  | 'Anticoagulation Model'
  | 'Stent Deployment';

// ============= UI STATE =============

export interface MedicalModelsState {
  activeTab: ModelType;
  selectedPredictiveModel: PredictiveModelName | null;
  selectedClassificationModel: ClassificationModelName | null;
  selectedSimulationModel: SimulationModelName | null;
  isSimulationRunning: boolean;
  simulationSpeed: number;
}

// ============= VISUALIZATION =============

export interface VisualizationData {
  type: '2d' | '3d' | 'chart' | 'gauge';
  data: number[] | { x: number; y: number }[];
  labels?: string[];
  colors?: string[];
  ranges?: { min: number; max: number; label: string; color: string }[];
}

// ============= MODEL RESULTS =============

export interface ModelResult {
  modelName: string;
  timestamp: Date;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  confidence: number; // 0-100
  explanation: string;
  clinicalRelevance: string;
  references?: string[];
}

// ============= CONSTANTS =============

export const RISK_THRESHOLDS = {
  low: { max: 33, color: '#22c55e', label: 'Low Risk' },
  moderate: { min: 34, max: 66, color: '#f59e0b', label: 'Moderate Risk' },
  high: { min: 67, color: '#ef4444', label: 'High Risk' }
} as const;

export const ABI_CLASSIFICATION = {
  normal: { min: 0.91, max: 1.3, label: 'Normal', color: '#22c55e' },
  borderline: { min: 0.71, max: 0.9, label: 'Borderline', color: '#f59e0b' },
  mild: { min: 0.51, max: 0.7, label: 'Mild PAD', color: '#fb923c' },
  moderate: { min: 0.31, max: 0.5, label: 'Moderate PAD', color: '#f97316' },
  severe: { min: 0, max: 0.3, label: 'Severe PAD', color: '#ef4444' }
} as const;

export const ANEURYSM_THRESHOLDS = {
  abdominalAorta: {
    normal: 20,
    small: 30,
    moderate: 45,
    large: 55,
    critical: 70
  },
  thoracicAorta: {
    normal: 30,
    small: 40,
    moderate: 50,
    large: 60,
    critical: 70
  }
} as const;
