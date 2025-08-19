// ============================================================================
// DISEASE PROFILES with Real Epidemiological Data
// ============================================================================

export type DiseaseProfile = {
  id: string;
  name: string;
  pathogen: string;
  r0: { min: number; max: number; typical: number };
  incubationDays: { min: number; max: number; mean: number };
  infectiousDays: { min: number; max: number; mean: number };
  cfr: number;
  transmissionMode: string;
  transmissionRadius: number; // in pixels
  transmissionProb: number; // base probability per contact
  color: string;
  interventions: {
    vaccination?: { efficacy: number };
    masks?: { efficacy: number };
    distancing?: { efficacy: number };
    quarantine?: { efficacy: number };
  };
};

export const DISEASE_PROFILES: Record<string, DiseaseProfile> = {
  covid19: {
    id: 'covid19',
    name: 'COVID-19 (Delta)',
    pathogen: 'SARS-CoV-2',
    r0: { min: 5.0, max: 9.0, typical: 6.5 },
    incubationDays: { min: 2, max: 14, mean: 5 },
    infectiousDays: { min: 5, max: 10, mean: 7 },
    cfr: 0.015,
    transmissionMode: 'Airborne/Droplet',
    transmissionRadius: 25,
    transmissionProb: 0.045,
    color: '#ef4444',
    interventions: {
      vaccination: { efficacy: 0.85 },
      masks: { efficacy: 0.65 },
      distancing: { efficacy: 0.75 },
      quarantine: { efficacy: 0.90 }
    }
  },
  tuberculosis: {
    id: 'tuberculosis',
    name: 'Tuberculosis',
    pathogen: 'M. tuberculosis',
    r0: { min: 0.5, max: 4.0, typical: 2.0 },
    incubationDays: { min: 30, max: 365, mean: 180 },
    infectiousDays: { min: 180, max: 730, mean: 365 },
    cfr: 0.15,
    transmissionMode: 'Airborne',
    transmissionRadius: 20,
    transmissionProb: 0.008,
    color: '#a855f7',
    interventions: {
      vaccination: { efficacy: 0.50 },
      masks: { efficacy: 0.70 },
      distancing: { efficacy: 0.40 },
      quarantine: { efficacy: 0.95 }
    }
  },
  influenza: {
    id: 'influenza',
    name: 'Seasonal Flu',
    pathogen: 'Influenza A/B',
    r0: { min: 1.0, max: 2.0, typical: 1.3 },
    incubationDays: { min: 1, max: 4, mean: 2 },
    infectiousDays: { min: 3, max: 7, mean: 5 },
    cfr: 0.001,
    transmissionMode: 'Droplet',
    transmissionRadius: 18,
    transmissionProb: 0.025,
    color: '#3b82f6',
    interventions: {
      vaccination: { efficacy: 0.60 },
      masks: { efficacy: 0.50 },
      distancing: { efficacy: 0.60 },
      quarantine: { efficacy: 0.80 }
    }
  },
  measles: {
    id: 'measles',
    name: 'Measles',
    pathogen: 'Morbillivirus',
    r0: { min: 12, max: 18, typical: 15 },
    incubationDays: { min: 7, max: 21, mean: 10 },
    infectiousDays: { min: 4, max: 8, mean: 6 },
    cfr: 0.002,
    transmissionMode: 'Airborne',
    transmissionRadius: 35,
    transmissionProb: 0.095,
    color: '#f59e0b',
    interventions: {
      vaccination: { efficacy: 0.97 },
      masks: { efficacy: 0.30 },
      distancing: { efficacy: 0.40 },
      quarantine: { efficacy: 0.95 }
    }
  },
  sars: {
    id: 'sars',
    name: 'SARS',
    pathogen: 'SARS-CoV',
    r0: { min: 2.0, max: 4.0, typical: 3.0 },
    incubationDays: { min: 2, max: 7, mean: 4 },
    infectiousDays: { min: 7, max: 10, mean: 8 },
    cfr: 0.10,
    transmissionMode: 'Droplet',
    transmissionRadius: 22,
    transmissionProb: 0.035,
    color: '#dc2626',
    interventions: {
      vaccination: { efficacy: 0.00 },
      masks: { efficacy: 0.80 },
      distancing: { efficacy: 0.85 },
      quarantine: { efficacy: 0.95 }
    }
  }
};

// ============================================================================
// TYPES
// ============================================================================

export type Agent = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: "S" | "E" | "I" | "R" | "D" | "V";
  timer: number;
  exposedTimer?: number;
  infectedBy?: number;
  infectionTime?: number;
  immunity: number;
  region?: number;
  household?: number;
};

export type SimulationMode = 'homogeneous' | 'regions' | 'households';
