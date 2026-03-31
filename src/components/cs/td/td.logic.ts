// ============================================================
// NEAT-inspired Neural Evolution of Walking Ragdolls
// td.logic.ts — Physics · Neural Network · Genetic Algorithm
// ============================================================

// ── Constants ────────────────────────────────────────────────

const GRAVITY          = 750;   // px / s²
const BODY_DAMPING     = 0.984; // velocity damping per step
const CONSTRAINT_ITERS = 14;    // position-constraint iterations (stability)
const GROUND_FRICTION  = 0.40;  // high friction (lower value = more friction) — prevents skating/sliding

// Limb segment lengths (px)
export const L = {
  NECK:      27,
  SPINE:     40,
  THIGH:     37,
  SHIN:      34,
  UPPER_ARM: 28,
  FOREARM:   22,
  FOOT:      14,
};
export const HEAD_RADIUS = 12;
export const STANDING_PELVIS_H = L.SHIN + L.THIGH;                                   // ~71px
export const STANDING_HEAD_H   = L.SHIN + L.THIGH + L.SPINE + L.NECK + HEAD_RADIUS;  // ~150px
// Target center-of-mass height when standing — roughly pelvis height due to heavy pelvis + legs
export const STANDING_COM_H    = STANDING_PELVIS_H - 5;                               // ~66px

// ── Particle indices ─────────────────────────────────────────

export const PI = {
  HEAD:    0,
  CHEST:   1,
  PELVIS:  2,
  L_KNEE:  3,
  L_FOOT:  4,
  R_KNEE:  5,
  R_FOOT:  6,
  L_ELBOW: 7,
  L_HAND:  8,
  R_ELBOW: 9,
  R_HAND:  10,
  L_TOE:   11,
  R_TOE:   12,
} as const;

// ── Types ────────────────────────────────────────────────────

export interface Particle {
  x: number; y: number;
  px: number; py: number; // previous position (verlet)
  mass: number;
}

export interface DistConstraint {
  a: number; b: number;
  restLen: number;
  stiffness: number;
  minOnly?: boolean;  // if true, only enforce when distance < restLen (like a ligament)
  maxOnly?: boolean;  // if true, only enforce when distance > restLen (like a patella)
}

export interface MotorDef {
  parentIdx: number;  // reference particle for angle measurement
  pivotIdx:  number;  // joint pivot
  childIdx:  number;  // particle that gets moved
  strength:  number;
  minAngle:  number;
  maxAngle:  number;
}

// Motor definitions (8 joints — NN output order)
export const MOTORS: MotorDef[] = [
  // Hips — enough to swing legs, not enough to launch into orbit
  { parentIdx: PI.CHEST,   pivotIdx: PI.PELVIS,  childIdx: PI.L_KNEE,   strength: 3400, minAngle: -1.0, maxAngle: 1.5  },
  { parentIdx: PI.CHEST,   pivotIdx: PI.PELVIS,  childIdx: PI.R_KNEE,   strength: 3400, minAngle: -1.5, maxAngle: 1.0  },
  // Knees — stronger, patella prevents backward bend. Range restricted.
  { parentIdx: PI.PELVIS,  pivotIdx: PI.L_KNEE,  childIdx: PI.L_FOOT,   strength: 3200, minAngle: -0.15, maxAngle: 2.2  },
  { parentIdx: PI.PELVIS,  pivotIdx: PI.R_KNEE,  childIdx: PI.R_FOOT,   strength: 3200, minAngle: -2.2,  maxAngle: 0.15 },
  // Shoulders — wider range to allow natural arm swing
  { parentIdx: PI.PELVIS,  pivotIdx: PI.CHEST,   childIdx: PI.L_ELBOW,  strength: 900,  minAngle: -2.2, maxAngle: 2.2  },
  { parentIdx: PI.PELVIS,  pivotIdx: PI.CHEST,   childIdx: PI.R_ELBOW,  strength: 900,  minAngle: -2.2, maxAngle: 2.2  },
  // Elbows — range includes straight and bent positions
  { parentIdx: PI.CHEST,   pivotIdx: PI.L_ELBOW, childIdx: PI.L_HAND,   strength: 700,  minAngle: -1.5, maxAngle: 2.4  },
  { parentIdx: PI.CHEST,   pivotIdx: PI.R_ELBOW, childIdx: PI.R_HAND,   strength: 700,  minAngle: -2.4, maxAngle: 1.5  },
  // Ankles — critical for balance and push-off. Controls shin-to-foot angle.
  { parentIdx: PI.L_KNEE,  pivotIdx: PI.L_FOOT,  childIdx: PI.L_TOE,    strength: 2200, minAngle: -0.6, maxAngle: 0.8  },
  { parentIdx: PI.R_KNEE,  pivotIdx: PI.R_FOOT,  childIdx: PI.R_TOE,    strength: 2200, minAngle: -0.8, maxAngle: 0.6  },
];

export interface Ragdoll {
  particles:   Particle[];
  constraints: DistConstraint[];
  alive:       boolean;
  age:         number;
  startX:      number;
  fitness:     number;
  fitnessScore: number;
  fallTime:     number;
  standingTime: number;
  color:        string;
  footTrail:   Array<{ x: number; y: number; side: 'l' | 'r' }>;
  // Early termination
  terminatedAt: number;   // 0 = still alive, >0 = age at termination
  lowCoGTime:   number;   // consecutive seconds with CoG < threshold
  // Stumble recovery tracking
  wasLow:      boolean;   // was CoG below 30% recently?
  recoveries:  number;    // count of times CoG recovered from low dip
  // Gait tracking — step detection for bipedal walking reward
  lGrounded:   boolean;
  rGrounded:   boolean;
  lLiftX:      number;
  rLiftX:      number;
  stepCount:   number;
  lastStepSide: 'l' | 'r' | null;
  singleSupportTime: number;
}

// ── NEAT — Topology-evolving Neural Network ───────────────────
//
// Node IDs:
//   0  … N_INPUT-1               → sensor inputs  (fixed)
//   N_INPUT … N_INPUT+N_OUTPUT-1 → motor outputs  (fixed)
//   N_INPUT+N_OUTPUT+            → hidden nodes   (grown by evolution)
//
// Connections are stored as a flat list with global innovation numbers
// that align genes during crossover (the core NEAT insight).

export const N_INPUT  = 23;  // 21 base + 2 obstacle proximity sensors
export const N_OUTPUT = 10;  // 8 original + 2 ankle motors

export interface NodeGene {
  id:    number;
  bias:  number;
  layer: number;  // 0-based hidden layer index (for visualization + mutation depth tracking)
}

export interface ConnGene {
  innov:   number;  // global innovation number (crossover alignment key)
  inNode:  number;
  outNode: number;
  weight:  number;
  enabled: boolean;
}

export interface NEATGenome {
  nodes: NodeGene[];  // hidden nodes only (input/output are implicit)
  conns: ConnGene[];  // ALL connections (input→hidden, input→output, hidden→output, hidden→hidden)
}

// ── Innovation Registry (module-level singleton) ──────────────
// Shared across the whole session so identical structural mutations
// in the same generation get the same innovation number.

let _nextHiddenId = N_INPUT + N_OUTPUT;
let _nextInnov    = 0;
const _innovCache = new Map<string, number>();

export function resetNEAT(): void {
  _nextHiddenId = N_INPUT + N_OUTPUT;
  _nextInnov    = 0;
  _innovCache.clear();
}

// ── NEAT state capture/restore — for Web Worker sync ──
export function captureNEATState(): { nextHiddenId: number; nextInnov: number; innovCache: [string, number][] } {
  return {
    nextHiddenId: _nextHiddenId,
    nextInnov:    _nextInnov,
    innovCache:   [..._innovCache.entries()],
  };
}

export function restoreNEATState(s: { nextHiddenId: number; nextInnov: number; innovCache: [string, number][] }): void {
  _nextHiddenId = s.nextHiddenId;
  _nextInnov    = s.nextInnov;
  _innovCache.clear();
  for (const [k, v] of s.innovCache) _innovCache.set(k, v);
}

function getInnov(inNode: number, outNode: number): number {
  const key = `${inNode}|${outNode}`;
  if (!_innovCache.has(key)) _innovCache.set(key, _nextInnov++);
  return _innovCache.get(key)!;
}

function rand(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

function tanhFast(x: number): number {
  if (x >  5) return  1;
  if (x < -5) return -1;
  const x2 = x * x;
  return x * (27 + x2) / (27 + 9 * x2);
}

// ── NEAT Forward Pass ─────────────────────────────────────────
// Hidden nodes are evaluated in ascending ID order.
// Because NEAT's "add node" mutation always creates a new node with
// a higher ID than its source connection's endpoints, ascending-ID
// order IS a valid topological order for any acyclic NEAT genome.
//
// Optimised: pre-group connections by target node to avoid O(nodes * conns).

export function neatForward(genome: NEATGenome, inputs: Float32Array): Float32Array {
  // Build target→connections lookup (fast for repeated evals in the same generation)
  const incomingMap = new Map<number, ConnGene[]>();
  for (const c of genome.conns) {
    if (!c.enabled) continue;
    let arr = incomingMap.get(c.outNode);
    if (!arr) { arr = []; incomingMap.set(c.outNode, arr); }
    arr.push(c);
  }

  const act = new Map<number, number>();

  // Set inputs
  for (let i = 0; i < N_INPUT; i++) act.set(i, inputs[i]);

  // Hidden nodes in ascending ID order
  const sortedHidden = [...genome.nodes].sort((a, b) => a.id - b.id);
  for (const n of sortedHidden) {
    let sum = n.bias;
    const incoming = incomingMap.get(n.id);
    if (incoming) {
      for (const c of incoming) sum += (act.get(c.inNode) ?? 0) * c.weight;
    }
    act.set(n.id, tanhFast(sum));
  }

  // Output nodes
  const outputs = new Float32Array(N_OUTPUT);
  for (let o = 0; o < N_OUTPUT; o++) {
    const outId = N_INPUT + o;
    let sum = 0;
    const incoming = incomingMap.get(outId);
    if (incoming) {
      for (const c of incoming) sum += (act.get(c.inNode) ?? 0) * c.weight;
    }
    outputs[o] = tanhFast(sum);
  }
  return outputs;
}

// ── Multi-Architecture System ────────────────────────────────
// 4 architecture types compete simultaneously, each evolving
// independently with 4 agents. Which topology discovers walking first?

export type ArchType = 'minimal' | 'wide' | 'deep' | 'dense';
export const ARCH_TYPES: ArchType[] = ['minimal', 'wide', 'deep', 'dense'];
export const POP_SIZE = 4;  // agents per population (fixed, never changes)

export interface ArchConfig {
  name:      string;
  label:     string;     // short HUD label
  color:     string;     // group accent color
  layers:    number[];
  maxHidden: number;
  maxConns:  number;
  inputDensity:  number;
  seqDensity:    number[];
  outputDensity: number;
  lateralDensity: number;
  skipDensity:    number;
  directDensity:  number;
}

export const ARCH_CONFIGS: Record<ArchType, ArchConfig> = {
  minimal: {
    name: 'Minimal', label: 'MIN', color: '#f0a050',
    layers: [8, 16, 8],  // 32 nodes — fast, classic NEAT
    maxHidden: 100, maxConns: 1000,
    inputDensity: 0.60, seqDensity: [0.50, 0.60],
    outputDensity: 0.70, lateralDensity: 0.10,
    skipDensity: 0.08, directDensity: 0.10,
  },
  wide: {
    name: 'Wide', label: 'WIDE', color: '#50c0c0',
    layers: [40, 80, 40],  // 160 nodes — broad feature extraction
    maxHidden: 250, maxConns: 3000,
    inputDensity: 0.25, seqDensity: [0.18, 0.25],
    outputDensity: 0.35, lateralDensity: 0.05,
    skipDensity: 0.04, directDensity: 0.05,
  },
  deep: {
    name: 'Deep', label: 'DEEP', color: '#e06080',
    layers: [20, 30, 30, 30, 30, 20],  // 160 nodes — hierarchical
    maxHidden: 250, maxConns: 3000,
    inputDensity: 0.30, seqDensity: [0.20, 0.15, 0.15, 0.15, 0.22],
    outputDensity: 0.35, lateralDensity: 0.04,
    skipDensity: 0.03, directDensity: 0.04,
  },
  dense: {
    name: 'Dense', label: 'DNSE', color: '#80c050',
    layers: [30, 60, 30],  // 120 nodes — heavily interconnected
    maxHidden: 200, maxConns: 2500,
    inputDensity: 0.40, seqDensity: [0.30, 0.35],
    outputDensity: 0.50, lateralDensity: 0.15,
    skipDensity: 0.08, directDensity: 0.08,
  },
};

export function createGenomeForArch(arch: ArchType): NEATGenome {
  const cfg = ARCH_CONFIGS[arch];
  const nodes: NodeGene[] = [];
  const conns: ConnGene[] = [];

  // Create layers
  const layers: number[][] = cfg.layers.map((size, li) => {
    const ids: number[] = [];
    for (let h = 0; h < size; h++) {
      const id = _nextHiddenId++;
      nodes.push({ id, bias: rand(-0.3, 0.3), layer: li });
      ids.push(id);
    }
    return ids;
  });

  // Input → Layer 0
  for (let i = 0; i < N_INPUT; i++) {
    for (const hid of layers[0]) {
      if (Math.random() < cfg.inputDensity)
        conns.push({ innov: getInnov(i, hid), inNode: i, outNode: hid, weight: rand(-1, 1), enabled: true });
    }
  }

  // Sequential layer → layer
  for (let l = 0; l < layers.length - 1; l++) {
    const d = cfg.seqDensity[l] ?? 0.20;
    for (const src of layers[l])
      for (const dst of layers[l + 1])
        if (Math.random() < d)
          conns.push({ innov: getInnov(src, dst), inNode: src, outNode: dst, weight: rand(-1, 1), enabled: true });
  }

  // Last layer → Outputs
  for (const hid of layers[layers.length - 1])
    for (let o = 0; o < N_OUTPUT; o++)
      if (Math.random() < cfg.outputDensity)
        conns.push({ innov: getInnov(hid, N_INPUT + o), inNode: hid, outNode: N_INPUT + o, weight: rand(-1, 1), enabled: true });

  // Within-layer lateral
  for (const layer of layers)
    for (let i = 0; i < layer.length; i++)
      for (let j = i + 1; j < layer.length; j++)
        if (Math.random() < cfg.lateralDensity)
          conns.push({ innov: getInnov(layer[i], layer[j]), inNode: layer[i], outNode: layer[j], weight: rand(-0.6, 0.6), enabled: true });

  // Skip connections (skip 1 layer)
  for (let l = 0; l < layers.length - 2; l++)
    for (const src of layers[l])
      for (const dst of layers[l + 2])
        if (Math.random() < cfg.skipDensity)
          conns.push({ innov: getInnov(src, dst), inNode: src, outNode: dst, weight: rand(-0.7, 0.7), enabled: true });

  // Direct input → output (reflex arcs)
  for (let i = 0; i < N_INPUT; i++)
    for (let o = 0; o < N_OUTPUT; o++)
      if (Math.random() < cfg.directDensity)
        conns.push({ innov: getInnov(i, N_INPUT + o), inNode: i, outNode: N_INPUT + o, weight: rand(-0.3, 0.3), enabled: true });

  return { nodes, conns };
}

// Legacy alias for any remaining references
export function createInitialGenome(): NEATGenome {
  return createGenomeForArch('minimal');
}

// ── NEAT Structural Mutations ─────────────────────────────────

// Split an existing connection with a new hidden node.
// Old connection disabled; two new connections added.
function addNodeMut(g: NEATGenome): void {
  if (g.nodes.length >= 300) return; // hard cap (per-arch limits enforced by caller)
  const enabled = g.conns.filter(c => c.enabled);
  if (!enabled.length) return;
  const target  = enabled[Math.floor(Math.random() * enabled.length)];
  target.enabled = false;
  const newId   = _nextHiddenId++;

  // Determine layer for the new node: midpoint between source and dest layers
  const srcNode = g.nodes.find(n => n.id === target.inNode);
  const dstNode = g.nodes.find(n => n.id === target.outNode);
  const maxLayer = Math.max(1, ...g.nodes.map(n => n.layer ?? 0)) + 1;
  const srcLayer = target.inNode < N_INPUT ? -1 : (srcNode?.layer ?? 0);
  const dstLayer = target.outNode >= N_INPUT && target.outNode < N_INPUT + N_OUTPUT
    ? maxLayer : (dstNode?.layer ?? maxLayer - 1);
  const newLayer = Math.round((srcLayer + dstLayer) / 2);

  g.nodes.push({ id: newId, bias: 0, layer: Math.max(0, newLayer) });
  g.conns.push(
    { innov: getInnov(target.inNode, newId),      inNode: target.inNode, outNode: newId,         weight: 1.0,           enabled: true },
    { innov: getInnov(newId, target.outNode),      inNode: newId,         outNode: target.outNode, weight: target.weight, enabled: true },
  );
}

// Add a new random connection between two previously unconnected nodes.
function addConnMut(g: NEATGenome): void {
  if (g.conns.length >= 4000) return; // hard cap (per-arch limits enforced by caller)
  const existing = new Set(g.conns.map(c => `${c.inNode}|${c.outNode}`));
  const sources  = [...Array.from({ length: N_INPUT }, (_, i) => i), ...g.nodes.map(n => n.id)];
  const targets  = [...g.nodes.map(n => n.id), ...Array.from({ length: N_OUTPUT }, (_, i) => N_INPUT + i)];
  for (let attempt = 0; attempt < 30; attempt++) {
    const src = sources[Math.floor(Math.random() * sources.length)];
    const dst = targets[Math.floor(Math.random() * targets.length)];
    if (src === dst || existing.has(`${src}|${dst}`)) continue;
    g.conns.push({ innov: getInnov(src, dst), inNode: src, outNode: dst, weight: rand(-1, 1), enabled: true });
    break;
  }
}

// ── Weight Mutation ───────────────────────────────────────────

function mutateWeights(g: NEATGenome, rate: number, str: number): NEATGenome {
  return {
    nodes: g.nodes.map(n => ({
      ...n,
      bias: Math.random() < rate ? n.bias + rand(-str, str) : n.bias,
    })),
    conns: g.conns.map(c => ({
      ...c,
      weight: Math.random() < rate
        ? (Math.random() < 0.08
            ? rand(-2, 2)  // random reset
            : Math.max(-3, Math.min(3, c.weight + rand(-str, str))))
        : c.weight,
    })),
  };
}

// ── NEAT Crossover ────────────────────────────────────────────
// g1 is assumed fitter — disjoint/excess genes come from g1.

function neatCrossover(g1: NEATGenome, g2: NEATGenome): NEATGenome {
  const g2Map = new Map(g2.conns.map(c => [c.innov, c]));
  const childConns: ConnGene[] = g1.conns.map(c1 => {
    const c2 = g2Map.get(c1.innov);
    if (c2) {
      const base    = Math.random() < 0.5 ? c1 : c2;
      const enabled = (c1.enabled && c2.enabled) || Math.random() < 0.75;
      return { ...base, enabled };
    }
    return { ...c1 }; // disjoint/excess: inherit from fitter parent
  });

  // Hidden nodes: union of both parents, pruned to only those referenced
  const referencedIds = new Set(
    childConns.flatMap(c => [c.inNode, c.outNode]).filter(id => id >= N_INPUT + N_OUTPUT)
  );
  const allHidden = new Map([...g2.nodes, ...g1.nodes].map(n => [n.id, n])); // g1 wins on conflict
  const childNodes = [...referencedIds].map(id => allHidden.get(id) ?? { id, bias: 0, layer: 2 });

  return { nodes: childNodes, conns: childConns };
}

// ── Genome Cloning ──────────────────────────────────────────

function cloneGenome(g: NEATGenome): NEATGenome {
  return { nodes: g.nodes.map(n => ({ ...n })), conns: g.conns.map(c => ({ ...c })) };
}

// ── Speciation ──────────────────────────────────────────────
// NEAT's key insight: protect structural innovation by grouping
// similar genomes into species. Each species competes internally,
// preventing new topologies from being eliminated before they
// can optimize their weights.

export interface Species {
  id:             number;
  representative: NEATGenome;
  memberIndices:  number[];    // indices into agents array
  bestFitness:    number;
  staleGens:      number;
}

const COMPAT_C1        = 1.0;   // disjoint/excess gene coefficient
const COMPAT_C3        = 0.4;   // weight difference coefficient
const COMPAT_THRESHOLD = 3.0;   // distance threshold for same species
const MAX_STALE        = 15;    // kill species stale for this many gens

function compatDistance(g1: NEATGenome, g2: NEATGenome): number {
  const map1 = new Map(g1.conns.map(c => [c.innov, c]));
  const map2 = new Map(g2.conns.map(c => [c.innov, c]));

  let matching = 0, weightDiff = 0, disjoint = 0;
  for (const [innov, c1] of map1) {
    const c2 = map2.get(innov);
    if (c2) { matching++; weightDiff += Math.abs(c1.weight - c2.weight); }
    else disjoint++;
  }
  for (const innov of map2.keys()) {
    if (!map1.has(innov)) disjoint++;
  }

  const N = Math.max(g1.conns.length, g2.conns.length, 1);
  const avgW = matching > 0 ? weightDiff / matching : 0;
  return (COMPAT_C1 * disjoint / N) + (COMPAT_C3 * avgW);
}

function assignSpecies(agents: Agent[], prev: Species[]): Species[] {
  const next: Species[] = [];
  let nextId = prev.length > 0 ? Math.max(...prev.map(s => s.id)) + 1 : 0;

  // Build representative list from previous species
  const reps = prev.map(s => ({
    id: s.id, genome: s.representative,
    staleGens: s.staleGens, bestFitness: s.bestFitness,
  }));

  for (let i = 0; i < agents.length; i++) {
    let placed = false;
    for (const rep of reps) {
      if (compatDistance(agents[i].genome, rep.genome) < COMPAT_THRESHOLD) {
        let sp = next.find(s => s.id === rep.id);
        if (!sp) {
          sp = {
            id: rep.id, representative: rep.genome,
            memberIndices: [], bestFitness: rep.bestFitness, staleGens: rep.staleGens,
          };
          next.push(sp);
        }
        sp.memberIndices.push(i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      next.push({
        id: nextId++, representative: agents[i].genome,
        memberIndices: [i], bestFitness: 0, staleGens: 0,
      });
    }
  }

  // Update each species' representative and staleness
  for (const sp of next) {
    const repIdx = sp.memberIndices[Math.floor(Math.random() * sp.memberIndices.length)];
    sp.representative = agents[repIdx].genome;

    const best = Math.max(...sp.memberIndices.map(i => agents[i].ragdoll.fitnessScore));
    if (best > sp.bestFitness) {
      sp.bestFitness = best;
      sp.staleGens = 0;
    } else {
      sp.staleGens++;
    }
  }

  return next;
}

// ── Ragdoll factory ──────────────────────────────────────────

function mkP(x: number, y: number, mass = 1.0): Particle {
  return { x, y, px: x, py: y, mass };
}

export function createRagdoll(startX: number, groundY: number, color: string): Ragdoll {
  const gy      = groundY;
  const px      = startX;
  const footY   = gy;
  const kneeY   = gy - L.SHIN;
  const pelvisY = kneeY - L.THIGH + 6;
  const chestY  = pelvisY - L.SPINE;
  const headY   = chestY - L.NECK - HEAD_RADIUS;
  const elbowY  = chestY + 8;
  const handY   = elbowY + L.FOREARM;

  // Mass distribution tuned for low center of mass:
  // Heavy pelvis + legs anchor the body; light head/arms reduce top-heaviness.
  // Total mass ≈ 9.8 — CoM sits roughly at pelvis height for natural stability.
  const particles: Particle[] = [
    mkP(px,               headY,   0.4), // 0  head — light (less top-heavy)
    mkP(px,               chestY,  0.9), // 1  chest
    mkP(px,               pelvisY, 1.6), // 2  pelvis — heaviest (anchors CoM low)
    mkP(px - 5,           kneeY,   0.9), // 3  lKnee
    mkP(px - 5,           footY,   1.0), // 4  lFoot — heavier feet = better ground contact
    mkP(px + 5,           kneeY,   0.9), // 5  rKnee
    mkP(px + 5,           footY,   1.0), // 6  rFoot
    mkP(px - L.UPPER_ARM, elbowY,  0.3), // 7  lElbow — light arms
    mkP(px - L.UPPER_ARM, handY,   0.2), // 8  lHand
    mkP(px + L.UPPER_ARM, elbowY,  0.3), // 9  rElbow
    mkP(px + L.UPPER_ARM, handY,   0.2), // 10 rHand
    mkP(px - 5 + L.FOOT,  footY,   0.6), // 11 lToe — heavy for ground stability
    mkP(px + 5 + L.FOOT,  footY,   0.6), // 12 rToe
  ];

  const constraints: DistConstraint[] = [
    { a: PI.HEAD,    b: PI.CHEST,   restLen: L.NECK,      stiffness: 1.0  },
    { a: PI.CHEST,   b: PI.PELVIS,  restLen: L.SPINE,     stiffness: 1.0  },
    { a: PI.PELVIS,  b: PI.L_KNEE,  restLen: L.THIGH,     stiffness: 1.0  },
    { a: PI.L_KNEE,  b: PI.L_FOOT,  restLen: L.SHIN,      stiffness: 1.0  },
    { a: PI.PELVIS,  b: PI.R_KNEE,  restLen: L.THIGH,     stiffness: 1.0  },
    { a: PI.R_KNEE,  b: PI.R_FOOT,  restLen: L.SHIN,      stiffness: 1.0  },
    { a: PI.CHEST,   b: PI.L_ELBOW, restLen: L.UPPER_ARM, stiffness: 0.92 },
    { a: PI.L_ELBOW, b: PI.L_HAND,  restLen: L.FOREARM,   stiffness: 0.92 },
    { a: PI.CHEST,   b: PI.R_ELBOW, restLen: L.UPPER_ARM, stiffness: 0.92 },
    { a: PI.R_ELBOW, b: PI.R_HAND,  restLen: L.FOREARM,   stiffness: 0.92 },
    // Spine stabiliser — stiff! Prevents torso from folding like wet noodle
    { a: PI.HEAD,    b: PI.PELVIS,  restLen: L.NECK + L.SPINE, stiffness: 0.85 },
    // Leg ligaments (minOnly): pelvis-foot can't get shorter than 75% of leg = mild knee bend max
    // This is the anti-crab: you CANNOT deep squat, but you CAN swing (distance gets longer)
    { a: PI.PELVIS,  b: PI.L_FOOT,  restLen: (L.THIGH + L.SHIN) * 0.75, stiffness: 0.9, minOnly: true },
    { a: PI.PELVIS,  b: PI.R_FOOT,  restLen: (L.THIGH + L.SHIN) * 0.75, stiffness: 0.9, minOnly: true },
    // Torso-knee ligaments: chest-knee can't collapse below 70%
    { a: PI.CHEST,   b: PI.L_KNEE,  restLen: (L.SPINE + L.THIGH) * 0.70, stiffness: 0.7, minOnly: true },
    { a: PI.CHEST,   b: PI.R_KNEE,  restLen: (L.SPINE + L.THIGH) * 0.70, stiffness: 0.7, minOnly: true },
    // Feet — rigid foot segments give a flat base of support
    { a: PI.L_FOOT,  b: PI.L_TOE,   restLen: L.FOOT, stiffness: 1.0  },
    { a: PI.R_FOOT,  b: PI.R_TOE,   restLen: L.FOOT, stiffness: 1.0  },
    // Ankle cross-braces: knee→toe keeps feet roughly flat, prevents ankle flopping
    { a: PI.L_KNEE,  b: PI.L_TOE,   restLen: Math.sqrt(L.SHIN * L.SHIN + L.FOOT * L.FOOT), stiffness: 0.45 },
    { a: PI.R_KNEE,  b: PI.R_TOE,   restLen: Math.sqrt(L.SHIN * L.SHIN + L.FOOT * L.FOOT), stiffness: 0.45 },
    // Patella constraints — prevent knee hyperextension (knee bending backward).
    // Max distance from pelvis to foot = full leg length. Knee MUST flex forward only.
    { a: PI.PELVIS,  b: PI.L_FOOT,  restLen: L.THIGH + L.SHIN,       stiffness: 0.95, maxOnly: true },
    { a: PI.PELVIS,  b: PI.R_FOOT,  restLen: L.THIGH + L.SHIN,       stiffness: 0.95, maxOnly: true },
    // Back stiffener — head-to-pelvis cross-brace. Prevents slouching/folding.
    { a: PI.HEAD,    b: PI.PELVIS,  restLen: (L.NECK + L.SPINE) * 0.92, stiffness: 0.92, minOnly: true },
  ];

  return {
    particles, constraints, alive: true, age: 0, startX, fitness: 0,
    fitnessScore: 0, fallTime: 0, standingTime: 0, color, footTrail: [],
    terminatedAt: 0, lowCoGTime: 0, wasLow: false, recoveries: 0,
    lGrounded: true, rGrounded: true, lLiftX: startX, rLiftX: startX,
    stepCount: 0, lastStepSide: null, singleSupportTime: 0,
  };
}

// ── Physics step ─────────────────────────────────────────────

function bearing(ax: number, ay: number, bx: number, by: number): number {
  return Math.atan2(by - ay, bx - ax);
}

function jointAngle(parent: Particle, pivot: Particle, child: Particle): number {
  // Measure from the continuation of parent→pivot line, so 0 = fully extended (standing straight).
  // Old code used pivot→parent which put standing at ±π — outside all motor ranges.
  let d = bearing(pivot.x, pivot.y, child.x, child.y)
        - bearing(parent.x, parent.y, pivot.x, pivot.y);
  while (d >  Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function stepRagdoll(
  ragdoll: Ragdoll,
  groundY: number,
  dt: number,
  motorOutputs: Float32Array,
  gravityMul: number = 1.0,
  mode: LocomotionMode = 'bipedal',
): void {
  const { particles, constraints } = ragdoll;

  // Motor forces — scale depends on mode
  // Bipedal: damped to 50% (stability reflexes handle the rest)
  // Free: full power (NN has total control, no reflexes to help)
  const MOTOR_SCALE = mode === 'free' ? 1.0 : 0.5;
  MOTORS.forEach((motor, i) => {
    const raw     = motorOutputs[i] * MOTOR_SCALE;
    const target  = Math.max(motor.minAngle, Math.min(motor.maxAngle, raw));
    const parent  = particles[motor.parentIdx];
    const pivot   = particles[motor.pivotIdx];
    const child   = particles[motor.childIdx];
    let   err     = target - jointAngle(parent, pivot, child);
    while (err >  Math.PI) err -= 2 * Math.PI;
    while (err < -Math.PI) err += 2 * Math.PI;

    const torque = Math.min(Math.abs(err), 1.0) * Math.sign(err) * motor.strength * dt * dt;
    const dx   = child.x - pivot.x;
    const dy   = child.y - pivot.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
    const fx   = (-dy / dist) * torque;
    const fy   = ( dx / dist) * torque;

    child.x += fx / child.mass;
    child.y += fy / child.mass;
    pivot.x -= fx * 0.18 / pivot.mass;
    pivot.y -= fy * 0.18 / pivot.mass;
  });

  // Verlet + gravity
  for (const p of particles) {
    const vx = (p.x - p.px) * BODY_DAMPING;
    const vy = (p.y - p.py) * BODY_DAMPING;
    p.px = p.x; p.py = p.y;
    p.x += vx;
    p.y += vy + GRAVITY * gravityMul * dt * dt;
  }

  // Constraint solver
  for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
    for (const c of constraints) {
      const a  = particles[c.a];
      const b  = particles[c.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = Math.sqrt(dx * dx + dy * dy) + 0.0001;
      // minOnly: only push apart when too close (like a ligament), allow stretching
      if (c.minOnly && d >= c.restLen) continue;
      // maxOnly: only pull together when too far (like a patella), allow compression
      if (c.maxOnly && d <= c.restLen) continue;
      const k  = (d - c.restLen) / d * c.stiffness;
      const tm = a.mass + b.mass;
      a.x += dx * k * (b.mass / tm);
      a.y += dy * k * (b.mass / tm);
      b.x -= dx * k * (a.mass / tm);
      b.y -= dy * k * (a.mass / tm);
    }
    for (const p of particles) {
      if (p.y >= groundY) {
        p.y  = groundY;
        const vx = (p.x - p.px) * GROUND_FRICTION;
        p.px = p.x - vx;
        p.py = p.y;
      }
    }
    // Obstacle collisions — push particles out of hurdle rectangles
    const obstacles = getObstaclesNear(ragdoll.particles[PI.PELVIS].x, 200, ragdoll.startX, groundY);
    for (const obs of obstacles) {
      const top = obs.groundY - obs.h;
      for (const p of particles) {
        // Is particle inside obstacle rect?
        if (p.x >= obs.x && p.x <= obs.x + obs.w && p.y >= top && p.y <= obs.groundY) {
          // Push to nearest edge (top, left, or right — not bottom since ground is there)
          const dTop   = p.y - top;
          const dLeft  = p.x - obs.x;
          const dRight = (obs.x + obs.w) - p.x;
          const minD   = Math.min(dTop, dLeft, dRight);
          if (minD === dTop) {
            p.y  = top;
            p.py = p.y;           // zero vertical velocity
          } else if (minD === dLeft) {
            p.x  = obs.x - 0.5;
            const vx = (p.x - p.px) * GROUND_FRICTION;
            p.px = p.x - vx;
          } else {
            p.x  = obs.x + obs.w + 0.5;
            const vx = (p.x - p.px) * GROUND_FRICTION;
            p.px = p.x - vx;
          }
        }
      }
    }
  }

  // ── PASSIVE STABILITY SYSTEM (Bipedal mode only) ──────────────
  // In bipedal mode: involuntary balance reflexes keep creature standing.
  // In free mode: NN has total control — no reflexes, full freedom.
  if (mode === 'bipedal') {
    // 1. Core stability — angular spring biasing spine toward vertical.
    const chest  = particles[PI.CHEST];
    const pelvis = particles[PI.PELVIS];
    const spDx   = chest.x - pelvis.x;
    const spDy   = chest.y - pelvis.y;
    const spDist = Math.sqrt(spDx * spDx + spDy * spDy) + 0.001;
    const spineAngle = Math.atan2(spDx, pelvis.y - chest.y);
    const coreCorr = -spineAngle * 0.50;
    chest.x += (-spDy / spDist) * coreCorr;
    chest.y += ( spDx / spDist) * coreCorr;

    // 2. Vestibular balance reflex — keeps CoM over feet (ankle strategy).
    {
      const lFoot = particles[PI.L_FOOT];
      const rFoot = particles[PI.R_FOOT];
      const footMidX = (lFoot.x + rFoot.x) / 2;
      const comResult = getCenterOfMass(particles);
      const comErr = comResult.x - footMidX;
      const pelvisH = groundY - pelvis.y;
      const isStanding = (lFoot.y >= groundY - 3 || rFoot.y >= groundY - 3) && pelvisH > 15;
      if (isStanding) {
        const ankleStr = 0.12 * Math.min(1, Math.abs(comErr) / 25);
        const ankleForce = -Math.sign(comErr) * ankleStr;
        pelvis.x += ankleForce;
        chest.x  += ankleForce * 0.6;
        particles[PI.HEAD].x += ankleForce * 0.4;
        for (const [kneeIdx, footIdx] of [[PI.L_KNEE, PI.L_FOOT], [PI.R_KNEE, PI.R_FOOT]] as [number, number][]) {
          const knee = particles[kneeIdx];
          const foot = particles[footIdx];
          if (foot.y >= groundY - 3) {
            const legDy = knee.y - pelvis.y;
            if (legDy > 0) {
              knee.y -= 0.08;
              knee.x += (pelvis.x - knee.x) * 0.02;
            }
          }
        }
      }
    }

    // 3. Head stabilisation — anti-nod reflex.
    {
      const head = particles[PI.HEAD];
      const chest2 = particles[PI.CHEST];
      if (head.y > chest2.y) {
        const headCorr = (head.y - chest2.y) * 0.15;
        head.y -= headCorr;
        head.x += (chest2.x - head.x) * 0.05;
      }
    }
  }
  // Free mode: no stability reflexes. NN has full control over the body.

  ragdoll.age    += dt;

  // ── SHARED: compute basic metrics ──
  const com      = getCenterOfMass(particles);
  const comH     = Math.max(0, groundY - com.y);
  const comRatio = Math.min(1, comH / STANDING_COM_H);
  const hVel     = particles[PI.PELVIS].x - particles[PI.PELVIS].px;
  const lOnGround    = particles[PI.L_FOOT].y >= groundY - 2;
  const rOnGround    = particles[PI.R_FOOT].y >= groundY - 2;
  const anyGrounded  = lOnGround || rOnGround;

  // ── EARLY TERMINATION ──
  if (mode === 'free') {
    // Free mode: very lenient — only kill if truly flat & stuck for 3+ seconds
    if (comRatio < 0.05) {
      ragdoll.lowCoGTime += dt;
      if (ragdoll.lowCoGTime > 3.0) {
        ragdoll.alive = false;
        ragdoll.terminatedAt = ragdoll.age;
        return;
      }
    } else {
      ragdoll.lowCoGTime = Math.max(0, ragdoll.lowCoGTime - dt);
    }
  } else {
    // Bipedal mode: strict posture-based termination
    const etRatio = comRatio;
    if (etRatio < 0.30) {
      ragdoll.wasLow = true;
    } else if (ragdoll.wasLow && etRatio > 0.45) {
      ragdoll.wasLow = false;
      ragdoll.recoveries++;
      ragdoll.fitnessScore += 15.0;
    }
    const hasWalked = ragdoll.stepCount >= 1 || ragdoll.recoveries > 0;
    const termThreshold = hasWalked ? 0.10 : 0.12;
    const graceTime     = hasWalked ? 1.2  : 0.7;
    const headBelowPelvis = particles[PI.HEAD].y > particles[PI.PELVIS].y;
    if (headBelowPelvis && etRatio < 0.30 && ragdoll.age > 2.0) {
      ragdoll.lowCoGTime += dt * 1.5;
    }
    if (etRatio < termThreshold) {
      ragdoll.lowCoGTime += dt;
      if (ragdoll.lowCoGTime > graceTime) {
        ragdoll.alive = false;
        ragdoll.terminatedAt = ragdoll.age;
        return;
      }
    } else {
      ragdoll.lowCoGTime = Math.max(0, ragdoll.lowCoGTime - dt * 2);
    }
  }

  // ── DISPLACEMENT FITNESS (camera tracking / display — both modes) ──
  let maxX = particles[PI.PELVIS].x;
  for (const p of particles) if (p.x > maxX) maxX = p.x;
  ragdoll.fitness = Math.max(0, maxX - ragdoll.startX);

  // ═══════════════════════════════════════════════════════════════
  // ── FITNESS FUNCTION — branches on mode ──
  // ═══════════════════════════════════════════════════════════════

  if (mode === 'free') {
    // ── FREE LOCOMOTION FITNESS ──────────────────────────────────
    // Reward ANY forward movement. No posture gates, no anti-crawl.
    // Creatures can crawl, hop, drag, roll — whatever works.

    const dist = Math.max(0, particles[PI.PELVIS].x - ragdoll.startX);

    // Forward velocity — primary reward signal
    ragdoll.fitnessScore += Math.max(0, hVel) * 8.0;

    // Distance accumulated (sqrt prevents runaway from falling forward)
    ragdoll.fitnessScore += 0.08 * Math.sqrt(Math.max(0, dist));

    // Soft upright bonus — not required, but being higher IS slightly better
    ragdoll.fitnessScore += 0.3 * comRatio;

    // Survival bonus — staying alive = more time to move
    ragdoll.fitnessScore += 0.1;

    // Limb movement bonus — reward any coordinated motion
    const lHip = jointAngle(particles[PI.CHEST], particles[PI.PELVIS], particles[PI.L_KNEE]);
    const rHip = jointAngle(particles[PI.CHEST], particles[PI.PELVIS], particles[PI.R_KNEE]);
    const hipActivity = Math.abs(lHip) + Math.abs(rHip);
    if (hipActivity > 0.3) ragdoll.fitnessScore += 0.15 * Math.min(1, hipActivity / 2);

    // Arm usage bonus — using all limbs for locomotion
    const lArm = Math.abs(particles[PI.L_HAND].x - particles[PI.L_HAND].px);
    const rArm = Math.abs(particles[PI.R_HAND].x - particles[PI.R_HAND].px);
    if (lArm + rArm > 0.3) ragdoll.fitnessScore += 0.1;

  } else {
    // ── BIPEDAL FITNESS (4-tier posture-gated system) ────────────

    const bothGrounded = lOnGround && rOnGround;
    const headAbove = particles[PI.HEAD].y < particles[PI.PELVIS].y;

    // TIER 1: UPRIGHT (always active)
    ragdoll.fitnessScore += 1.5 * comRatio * comRatio;
    if (comRatio > 0.30) ragdoll.fitnessScore += 0.5;
    ragdoll.fitnessScore += 0.15 * comRatio;
    if (!anyGrounded) ragdoll.fitnessScore -= 1.0;
    if (!headAbove) ragdoll.fitnessScore -= 1.5;
    if (comRatio < 0.45 && hVel > 0.5) ragdoll.fitnessScore -= 2.0 * hVel;

    // TIER 2: POSTURE QUALITY (55% CoG + head above)
    if (comRatio > 0.55 && anyGrounded && headAbove) {
      ragdoll.standingTime += dt;
      if (bothGrounded) ragdoll.fitnessScore += 1.0;
      ragdoll.fitnessScore += 0.5;
      const footMidX = (particles[PI.L_FOOT].x + particles[PI.R_FOOT].x) / 2;
      const balErr   = Math.abs(com.x - footMidX);
      if (balErr < 30) ragdoll.fitnessScore += 0.4 * (1 - balErr / 30);
    }

    // TIER 3: WEIGHT SHIFTING (60% CoG + head above)
    if (comRatio > 0.60 && anyGrounded && headAbove) {
      const singleSupport = (lOnGround && !rOnGround) || (!lOnGround && rOnGround);
      if (singleSupport) {
        ragdoll.singleSupportTime += dt;
        const liftedFootY = lOnGround ? particles[PI.R_FOOT].y : particles[PI.L_FOOT].y;
        const clearance   = Math.max(0, groundY - liftedFootY - 2) / 15;
        ragdoll.fitnessScore += 1.0 + 0.5 * Math.min(1, clearance);
        const supportFoot = lOnGround ? particles[PI.L_FOOT] : particles[PI.R_FOOT];
        const sBal = Math.abs(com.x - supportFoot.x);
        if (sBal < 20) ragdoll.fitnessScore += 0.4 * (1 - sBal / 20);
      }
      const lHip = jointAngle(particles[PI.CHEST], particles[PI.PELVIS], particles[PI.L_KNEE]);
      const rHip = jointAngle(particles[PI.CHEST], particles[PI.PELVIS], particles[PI.R_KNEE]);
      const hipDiff = Math.abs(lHip - rHip);
      if (hipDiff > 0.1) ragdoll.fitnessScore += 0.3 * Math.min(1, hipDiff);
      const antiPhase = -lHip * rHip;
      if (antiPhase > 0.02) ragdoll.fitnessScore += 0.4 * Math.min(1, antiPhase);
    }

    // TIER 4: STEPPING & LOCOMOTION (60% CoG + head above)
    if (comRatio > 0.60 && anyGrounded && headAbove) {
      if (ragdoll.lGrounded && !lOnGround) ragdoll.lLiftX = particles[PI.L_FOOT].x;
      if (ragdoll.rGrounded && !rOnGround) ragdoll.rLiftX = particles[PI.R_FOOT].x;
      if (!ragdoll.lGrounded && lOnGround && rOnGround) {
        const d = particles[PI.L_FOOT].x - ragdoll.lLiftX;
        if (d > 2) {
          const q   = Math.min(1, d / 20);
          const alt = ragdoll.lastStepSide !== 'l';
          ragdoll.fitnessScore += alt ? 25.0 * q : 4.0 * q;
          if (alt) { ragdoll.stepCount++; ragdoll.lastStepSide = 'l'; }
        }
      }
      if (!ragdoll.rGrounded && rOnGround && lOnGround) {
        const d = particles[PI.R_FOOT].x - ragdoll.rLiftX;
        if (d > 2) {
          const q   = Math.min(1, d / 20);
          const alt = ragdoll.lastStepSide !== 'r';
          ragdoll.fitnessScore += alt ? 25.0 * q : 4.0 * q;
          if (alt) { ragdoll.stepCount++; ragdoll.lastStepSide = 'r'; }
        }
      }
      const uprightGate = Math.min(1, Math.max(0, (comRatio - 0.55) / 0.35));
      ragdoll.fitnessScore += Math.max(0, hVel) * 5.0 * uprightGate;
      const dist = Math.max(0, particles[PI.PELVIS].x - ragdoll.startX);
      if (dist > 10 && ragdoll.singleSupportTime > 1.0) {
        ragdoll.fitnessScore += 0.06 * Math.sqrt(dist) * uprightGate;
      }
      if (ragdoll.stepCount >= 2) ragdoll.fitnessScore += ragdoll.stepCount * 8.0;
      if (ragdoll.stepCount >= 4) ragdoll.fitnessScore += (ragdoll.stepCount - 3) * 12.0;
    }
  }

  // Update ground contact
  ragdoll.lGrounded = lOnGround;
  ragdoll.rGrounded = rOnGround;

  // Footprints
  if (anyGrounded) {
    for (const [fi, side] of [[PI.L_FOOT, 'l'], [PI.R_FOOT, 'r']] as [number, 'l'|'r'][]) {
      const f = particles[fi];
      if (f.y >= groundY - 2) {
        const trail = ragdoll.footTrail;
        const last  = trail[trail.length - 1];
        if (!last || Math.abs(f.x - last.x) > 10) {
          trail.push({ x: f.x, y: f.y, side });
          if (trail.length > 300) trail.shift();
        }
      }
    }
  }
}

// ── Center of mass ────────────────────────────────────────────

function getCenterOfMass(particles: Particle[]): { x: number; y: number; px: number; py: number } {
  let mx = 0, my = 0, mpx = 0, mpy = 0, tm = 0;
  for (const p of particles) {
    mx  += p.x  * p.mass;
    my  += p.y  * p.mass;
    mpx += p.px * p.mass;
    mpy += p.py * p.mass;
    tm  += p.mass;
  }
  return { x: mx / tm, y: my / tm, px: mpx / tm, py: mpy / tm };
}

// ── Sensor inputs ─────────────────────────────────────────────

export function getSensorInputs(ragdoll: Ragdoll, groundY: number, time: number): Float32Array {
  const p      = ragdoll.particles;
  const pelvis = p[PI.PELVIS];
  const chest  = p[PI.CHEST];
  const torsoAngle = Math.atan2(chest.x - pelvis.x, pelvis.y - chest.y) / Math.PI;
  const hVel       = (pelvis.x - pelvis.px) / (GRAVITY * 0.001 * 180);
  const jointAngles = MOTORS.map(m =>
    jointAngle(p[m.parentIdx], p[m.pivotIdx], p[m.childIdx]) / Math.PI
  );

  // Center of mass relative to base of support — critical for balance
  const com = getCenterOfMass(p);
  const footMidX   = (p[PI.L_FOOT].x + p[PI.R_FOOT].x + p[PI.L_TOE].x + p[PI.R_TOE].x) / 4;
  const comBalance = (com.x - footMidX) / 40;        // + = leaning forward of feet
  const comVVel    = (com.py - com.y) / 5;            // + = rising (verlet: prev-cur)

  // Ankle angles (shin-to-foot)
  const lAnkle = jointAngle(p[PI.L_KNEE], p[PI.L_FOOT], p[PI.L_TOE]) / Math.PI;
  const rAnkle = jointAngle(p[PI.R_KNEE], p[PI.R_FOOT], p[PI.R_TOE]) / Math.PI;

  return Float32Array.from([
    torsoAngle,
    Math.min(1, Math.max(0, (groundY - pelvis.y) / STANDING_PELVIS_H)),  // pelvis height ratio
    hVel,
    ...jointAngles,
    p[PI.L_FOOT].y >= groundY - 2 ? 1.0 : -1.0,
    p[PI.R_FOOT].y >= groundY - 2 ? 1.0 : -1.0,
    Math.sin(time * 2.0),    // primary gait clock (~walking cadence)
    Math.cos(time * 2.0),
    comBalance,   // CoM x offset from feet — balance indicator
    comVVel,      // CoM vertical velocity — falling/rising indicator
    lAnkle,       // left ankle angle
    rAnkle,       // right ankle angle
    Math.sin(time * 4.0),    // double-time harmonic (for faster gaits / sub-phase control)
    Math.cos(time * 4.0),
    // Obstacle proximity sensors
    ...(() => {
      const obs = getObstaclesNear(pelvis.x, 150, ragdoll.startX, groundY);
      // Find the next obstacle ahead of pelvis
      const ahead = obs.filter(o => o.x + o.w > pelvis.x).sort((a, b) => a.x - b.x);
      const next = ahead[0];
      if (next) {
        const dist = Math.max(0, next.x - pelvis.x) / 100;  // normalized distance (0 = on top, 1 = 100px away)
        const h    = next.h / OBSTACLE_H_MAX;                 // normalized height (0-1)
        return [Math.min(1, dist), h];
      }
      return [1.0, 0.0];  // no obstacle ahead
    })(),
  ]);
}

// ── Agent & Simulation ────────────────────────────────────────

// AGENT_COLORS is defined below after ArchConfig (architecture-aware coloring)

// ── Obstacles ──────────────────────────────────────────────────
// Disabled for now — creatures need to learn flat-ground walking first.
// Obstacles will be reintroduced once bipedal gait emerges.

export interface Obstacle {
  x: number;      // left edge (world coords)
  w: number;      // width
  h: number;      // height above ground
  groundY: number; // ground Y at this obstacle
}

const OBSTACLE_H_MAX = 22;  // kept for sensor normalization

export function getObstaclesNear(_worldX: number, _range: number, _startX: number, _groundY: number): Obstacle[] {
  return [];  // no obstacles — flat ground only
}

export interface Agent {
  ragdoll:     Ragdoll;
  genome:      NEATGenome;
  rank:        number;      // rank within population (0 = pop champion)
  globalIdx:   number;      // index across all agents (0-15)
  archType:    ArchType;    // which architecture this agent belongs to
  lastInputs:  Float32Array | null;
  lastOutputs: Float32Array | null;
}

// ── Population — one per architecture, evolves independently ──

export interface Population {
  archType:    ArchType;
  agents:      Agent[];     // always exactly POP_SIZE (4)
  species:     Species[];
  generation:  number;
  bestFitness: number;
  allTimeBest: number;
  stagnation:  number;
  history:     number[];
}

export type LocomotionMode = 'bipedal' | 'free';

export interface SimState {
  populations:  Population[];
  time:         number;
  evalDuration: number;
  groundY:      number;
  gravityMul:   number;
  globalGen:    number;     // shared generation counter
  mode:         LocomotionMode;
}

const EVAL_DURATION = 20;

// ── Agent colors per architecture ──
// 4 agents per arch, each with a variation of the arch's accent color
export function getAgentColor(archType: ArchType, indexInPop: number): string {
  const cfg = ARCH_CONFIGS[archType];
  // Parse base HSL from hex-ish color, generate variations
  const baseHues: Record<ArchType, number> = { minimal: 35, wide: 175, deep: 340, dense: 90 };
  const hue = baseHues[archType];
  const sat = 55 + (indexInPop % 2) * 15;
  const lit = 45 + indexInPop * 8;
  return `hsl(${hue}, ${sat}%, ${lit}%)`;
}

// Legacy export — flat list for rendering
export const AGENT_COLORS: string[] = (() => {
  const colors: string[] = [];
  for (const arch of ARCH_TYPES) {
    for (let i = 0; i < POP_SIZE; i++) {
      colors.push(getAgentColor(arch, i));
    }
  }
  return colors;
})();

function makeAgent(genome: NEATGenome, rankInPop: number, globalIdx: number, groundY: number, archType: ArchType): Agent {
  return {
    genome, archType,
    ragdoll:     createRagdoll(100 + globalIdx * 6, groundY, AGENT_COLORS[globalIdx]),
    rank:        rankInPop,
    globalIdx,
    lastInputs:  null,
    lastOutputs: null,
  };
}

function createPopulation(archType: ArchType, popIndex: number, groundY: number): Population {
  const baseIdx = popIndex * POP_SIZE;
  const agents = Array.from({ length: POP_SIZE }, (_, i) =>
    makeAgent(createGenomeForArch(archType), i, baseIdx + i, groundY, archType)
  );
  return {
    archType, agents,
    species: [], generation: 1,
    bestFitness: 0, allTimeBest: 0, stagnation: 0, history: [],
  };
}

export function createSimState(groundY: number, mode: LocomotionMode = 'bipedal'): SimState {
  resetNEAT();
  const populations = ARCH_TYPES.map((arch, i) => createPopulation(arch, i, groundY));
  return {
    populations, time: 0, evalDuration: EVAL_DURATION,
    groundY, gravityMul: 0.90, globalGen: 1, mode,
  };
}

// ── Helper: get all agents flat (for rendering & physics) ──
export function getAllAgents(state: SimState): Agent[] {
  return state.populations.flatMap(p => p.agents);
}

const SETTLE_TIME = 0.5;
const ZERO_MOTORS = new Float32Array(N_OUTPUT);

export function stepSim(state: SimState, dt: number): boolean {
  state.time += dt;
  const settling = state.time < SETTLE_TIME;
  const allAgents = getAllAgents(state);

  for (const agent of allAgents) {
    if (!agent.ragdoll.alive) continue;
    if (settling) {
      stepRagdoll(agent.ragdoll, state.groundY, dt, ZERO_MOTORS, state.gravityMul, state.mode);
    } else {
      const inputs  = getSensorInputs(agent.ragdoll, state.groundY, state.time - SETTLE_TIME);
      const outputs = neatForward(agent.genome, inputs);
      agent.lastInputs  = inputs;
      agent.lastOutputs = outputs;
      stepRagdoll(agent.ragdoll, state.groundY, dt, outputs, state.gravityMul, state.mode);
    }
  }

  // Reset fitness after settling
  if (settling) {
    for (const agent of allAgents) {
      agent.ragdoll.startX       = agent.ragdoll.particles[PI.PELVIS].x;
      agent.ragdoll.fitness       = 0;
      agent.ragdoll.fitnessScore  = 0;
      agent.ragdoll.fallTime      = 0;
      agent.ragdoll.standingTime  = 0;
      agent.ragdoll.stepCount     = 0;
      agent.ragdoll.lastStepSide  = null;
      agent.ragdoll.singleSupportTime = 0;
      agent.ragdoll.terminatedAt  = 0;
      agent.ragdoll.lowCoGTime    = 0;
      agent.ragdoll.wasLow        = false;
      agent.ragdoll.recoveries    = 0;
      agent.ragdoll.lLiftX        = agent.ragdoll.particles[PI.L_FOOT].x;
      agent.ragdoll.rLiftX        = agent.ragdoll.particles[PI.R_FOOT].x;
    }
  }

  const allDead = allAgents.every(a => !a.ragdoll.alive);
  if (allDead) return true;
  return state.time >= state.evalDuration + SETTLE_TIME;
}

// ── Per-population evolution ─────────────────────────────────
// Each population evolves independently. Always produces exactly POP_SIZE genomes.

function evolvePopulation(pop: Population, groundY: number, popIndex: number): void {
  const cfg  = ARCH_CONFIGS[pop.archType];
  const sorted = [...pop.agents].sort((a, b) => b.ragdoll.fitnessScore - a.ragdoll.fitnessScore);
  const best   = Math.max(...pop.agents.map(a => a.ragdoll.fitness));
  const bestScore = sorted[0].ragdoll.fitnessScore;

  pop.bestFitness = best;
  if (bestScore > pop.allTimeBest) { pop.allTimeBest = bestScore; pop.stagnation = 0; }
  else pop.stagnation++;
  pop.history.push(Math.round(best));

  // Speciation within this population
  pop.species = assignSpecies(pop.agents, pop.species);

  const stag   = Math.min(pop.stagnation, 80);
  const mutMul = 1.0 + Math.min(2.5, stag / 20);

  function evolve(base: NEATGenome, rate: number, str: number, nodeP = 0, connP = 0): NEATGenome {
    const g = mutateWeights(base, Math.min(0.95, rate * mutMul), str * mutMul);
    const tries = stag > 20 ? 6 : stag > 10 ? 4 : 3;
    for (let i = 0; i < tries; i++) {
      if (nodeP > 0 && g.nodes.length < cfg.maxHidden && Math.random() < Math.min(0.9, nodeP * mutMul)) addNodeMut(g);
      if (connP > 0 && g.conns.length < cfg.maxConns  && Math.random() < Math.min(0.9, connP * mutMul)) addConnMut(g);
    }
    return g;
  }

  const pm = { rate: 0.18, str: 0.35, nodeP: 0.15, connP: 0.25 };
  const nextGenomes: NEATGenome[] = [];

  // Slot 0: elite — champion survives unchanged
  nextGenomes.push(cloneGenome(sorted[0].genome));

  // Slot 1: crossover of top 2
  if (sorted.length >= 2) {
    nextGenomes.push(evolve(neatCrossover(sorted[0].genome, sorted[1].genome), pm.rate, pm.str, pm.nodeP, pm.connP));
  } else {
    nextGenomes.push(evolve(cloneGenome(sorted[0].genome), pm.rate, pm.str, pm.nodeP, pm.connP));
  }

  // Slot 2: mutated champion
  nextGenomes.push(evolve(cloneGenome(sorted[0].genome), pm.rate * 1.3, pm.str * 1.3, pm.nodeP * 1.5, pm.connP * 1.5));

  // Slot 3: fresh genome OR mutated second-best (based on stagnation)
  if (stag > 15 || Math.random() < 0.2) {
    nextGenomes.push(createGenomeForArch(pop.archType));
  } else {
    const base = sorted.length >= 2 ? sorted[1].genome : sorted[0].genome;
    nextGenomes.push(evolve(cloneGenome(base), pm.rate * 1.5, pm.str * 1.5, pm.nodeP * 2, pm.connP * 2));
  }

  // Rebuild agents with new genomes — always exactly POP_SIZE
  const baseIdx = popIndex * POP_SIZE;
  pop.agents = nextGenomes.map((g, i) =>
    makeAgent(g, i, baseIdx + i, groundY, pop.archType)
  );
  pop.generation += 1;
}

export function nextGeneration(state: SimState): void {
  state.populations.forEach((pop, i) => evolvePopulation(pop, state.groundY, i));
  state.globalGen += 1;
  state.time = 0;
  // Gravity curriculum
  state.gravityMul = Math.min(1.0, 0.90 + 0.10 * (state.globalGen / 15));
}

// ── Headless bulk training ───────────────────────────────────
// Runs N generations without rendering for fast training.

// Headless training: faster DT (2× normal), skip foot trails, tight loop.
// Returns synchronously — caller should chunk via setTimeout for UI updates.
export function trainHeadless(
  state: SimState,
  generations: number,
  onProgress?: (gen: number, total: number) => void,
): void {
  const DT = 1 / 30;  // 2× larger timestep = half the steps = ~2× faster physics
  const maxSteps = 1000; // 20s / (1/30) ≈ 600, cap at 1000 for safety
  for (let g = 0; g < generations; g++) {
    // Clear foot trails (saves memory & allocation during headless)
    for (const pop of state.populations) {
      for (const agent of pop.agents) {
        agent.ragdoll.footTrail.length = 0;
      }
    }
    // Run one full evaluation
    state.time = 0;
    let steps = 0;
    while (steps++ < maxSteps) {
      if (stepSim(state, DT)) break;
    }
    nextGeneration(state);
    if (onProgress && g % 5 === 0) onProgress(g, generations);
  }
  if (onProgress) onProgress(generations, generations);
}
