// src/components/cs/disease/biologyEngine.ts
// Compact compartment engine and sampling helpers for the simulator.
// Drop this file into src/components/cs/disease/ and import functions:
// import { DiseaseProfile, infectAgent, applyTransitions, setRandomFn } from './biologyEngine'

export type Compartments = 'SIR' | 'SEIR' | 'SLIR' | 'S' | 'SEIRS';

export type DiseaseProfile = {
  id?: string;
  name?: string;
  compartments?: Compartments;
  baseTransmissibility?: number;
  incubationMeanDays?: number;
  incubationSdDays?: number;
  infectiousMeanDays: number;
  infectiousSdDays?: number;
  latencyMeanDays?: number;
  severity?: number;
  immuneEscape?: number;
  reinfectionProbability?: number;
  typicalContactRadius?: number;
  dispersionK?: number;
  notes?: string;
  provenance?: { source: string; date: string };
};

// Minimal agent interface used by the engine (your richer Agent is compatible)
export type EngineAgent = {
  id: number;
  state: string; // 'S'|'E'|'I'|'R'|'L' etc.
  timer: number;
  infectivity?: number;
};

// RNG hook (use setRandomFn to inject deterministic RNG)
let random = () => Math.random();
export function setRandomFn(fn: () => number) { random = fn; }

// Box-Muller normal sampler
function randNormal(mean = 0, sd = 1) {
  const u1 = Math.max(1e-12, random());
  const u2 = Math.max(1e-12, random());
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * sd + mean;
}

// Sample duration (days -> ticks)
export function sampleDurationTicks(meanDays: number, sdDays: number | undefined, ticksPerDay: number) {
  if (!sdDays || sdDays <= 0) return Math.max(1, Math.round(meanDays * ticksPerDay));
  const d = Math.max(0.2, randNormal(meanDays, sdDays));
  return Math.max(1, Math.round(d * ticksPerDay));
}

// Approximate per-agent infectivity variation (lognormal approximation)
export function sampleInfectivityMultiplier(dispersionK?: number) {
  if (!dispersionK || dispersionK <= 0) return 1;
  const cv = 1 / Math.sqrt(dispersionK);
  const mu = -0.5 * Math.log(1 + cv * cv);
  const sigma = Math.sqrt(Math.log(1 + cv * cv));
  return Math.exp(randNormal(mu, sigma));
}

// Transition logic for one agent (non-destructive)
export function transition(agent: EngineAgent, profile: DiseaseProfile, ticksPerDay = 50) {
  const comps = profile.compartments || 'SIR';
  switch (comps) {
    case 'SEIR':
      if (agent.state === 'E') {
        if (agent.timer <= 0) {
          agent.state = 'I';
          agent.timer = sampleDurationTicks(profile.infectiousMeanDays || 1, profile.infectiousSdDays, ticksPerDay);
          if (profile.dispersionK) agent.infectivity = sampleInfectivityMultiplier(profile.dispersionK);
        }
      } else if (agent.state === 'I') {
        if (agent.timer <= 0) {
          agent.state = 'R';
          agent.timer = 0;
        }
      }
      break;

    case 'SLIR':
      if (agent.state === 'L') {
        if (agent.timer <= 0) {
          agent.state = 'I';
          agent.timer = sampleDurationTicks(profile.infectiousMeanDays || 1, profile.infectiousSdDays, ticksPerDay);
          if (profile.dispersionK) agent.infectivity = sampleInfectivityMultiplier(profile.dispersionK);
        }
      } else if (agent.state === 'I') {
        if (agent.timer <= 0) {
          agent.state = 'R';
          agent.timer = 0;
        }
      }
      break;

    case 'SIR':
    default:
      if (agent.state === 'I') {
        if (agent.timer <= 0) {
          agent.state = 'R';
          agent.timer = 0;
        }
      }
      break;
  }
}

// applyTransitions: decrement timers then run transition() for each agent
export function applyTransitions(agents: EngineAgent[], profile: DiseaseProfile, ticksPerDay = 50) {
  for (const a of agents) {
    if (a.timer > 0) a.timer--;
  }
  for (const a of agents) transition(a, profile, ticksPerDay);
}

// Infect agent helper — sets state/timer/infectivity appropriately
export function infectAgent(agent: EngineAgent, profile: DiseaseProfile, ticksPerDay = 50) {
  const comps = profile.compartments || 'SIR';
  const incMean = profile.incubationMeanDays || 0;
  const incSd = profile.incubationSdDays || 0;
  const infMean = profile.infectiousMeanDays || 1;
  const infSd = profile.infectiousSdDays || 0;

  if (comps === 'SEIR') {
    agent.state = 'E';
    agent.timer = sampleDurationTicks(incMean || 1, incSd, ticksPerDay);
    agent.infectivity = profile.dispersionK ? sampleInfectivityMultiplier(profile.dispersionK) : 1;
  } else if (comps === 'SLIR') {
    agent.state = 'L';
    agent.timer = sampleDurationTicks(profile.latencyMeanDays || incMean || 1, profile.infectiousSdDays || 0, ticksPerDay);
    agent.infectivity = profile.dispersionK ? sampleInfectivityMultiplier(profile.dispersionK) : 1;
  } else {
    agent.state = 'I';
    agent.timer = sampleDurationTicks(infMean, infSd, ticksPerDay);
    agent.infectivity = profile.dispersionK ? sampleInfectivityMultiplier(profile.dispersionK) : 1;
  }
}

// export default small helper
export default { sampleDurationTicks, sampleInfectivityMultiplier, transition, applyTransitions, infectAgent };
