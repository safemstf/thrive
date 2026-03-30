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
  // Knees — moderate, supports stance without launching
  { parentIdx: PI.PELVIS,  pivotIdx: PI.L_KNEE,  childIdx: PI.L_FOOT,   strength: 2800, minAngle: -0.3, maxAngle: 2.0  },
  { parentIdx: PI.PELVIS,  pivotIdx: PI.R_KNEE,  childIdx: PI.R_FOOT,   strength: 2800, minAngle: -2.0, maxAngle: 0.3  },
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
  lowCoGTime:   number;   // consecutive seconds with CoG < 25%
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
const MAX_HIDDEN = 800;  // room to grow from 600 seed nodes
const MAX_CONNS  = 8000; // room to grow from ~4000+ seed connections

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

// ── Genome Creation ───────────────────────────────────────────
// Seed with hidden nodes from the start — walking requires substantial
// network capacity for CPG patterns, balance feedback, and limb coordination.
// Starting from zero hidden forces evolution to simultaneously discover
// topology AND tune weights, which is too hard with small populations.

// 6-layer deep architecture: 60 + 120 + 120 + 120 + 120 + 60 = 600 hidden neurons
// Large pre-built network provides rich sub-circuits for evolution to tune.
// Walking requires CPG patterns, balance feedback, limb coordination —
// a big network has more capacity to encode these from the start.
// L1 (60):  sensory preprocessing — compress 23 inputs
// L2 (120): deep integration — balance, proprioception
// L3 (120): central pattern generator layer 1
// L4 (120): central pattern generator layer 2
// L5 (120): motor planning
// L6 (60):  motor coordination — map to 10 outputs
const SEED_LAYERS = [60, 120, 120, 120, 120, 60];  // 600 total hidden neurons

export function createInitialGenome(): NEATGenome {
  const nodes: NodeGene[] = [];
  const conns: ConnGene[] = [];

  // Create all layers — tag each node with its layer index
  const layers: number[][] = SEED_LAYERS.map((size, li) => {
    const ids: number[] = [];
    for (let h = 0; h < size; h++) {
      const id = _nextHiddenId++;
      nodes.push({ id, bias: rand(-0.3, 0.3), layer: li });
      ids.push(id);
    }
    return ids;
  });

  // Input → Layer 0 (23×60 = 1380 possible, ~30% ≈ 414 conns)
  for (let i = 0; i < N_INPUT; i++) {
    for (const hid of layers[0]) {
      if (Math.random() < 0.30) {
        conns.push({
          innov: getInnov(i, hid), inNode: i, outNode: hid,
          weight: rand(-1.0, 1.0), enabled: true,
        });
      }
    }
  }

  // Sequential layer → layer connections
  // Low density for wide layers to keep total conns manageable
  // 60→120 (~12%), 120→120 (~10%), 120→120 (~10%), 120→120 (~10%), 120→60 (~15%)
  const seqDensity = [0.12, 0.10, 0.10, 0.10, 0.15];
  for (let l = 0; l < layers.length - 1; l++) {
    const d = seqDensity[l] ?? 0.20;
    for (const src of layers[l]) {
      for (const dst of layers[l + 1]) {
        if (Math.random() < d) {
          conns.push({
            innov: getInnov(src, dst), inNode: src, outNode: dst,
            weight: rand(-1.0, 1.0), enabled: true,
          });
        }
      }
    }
  }

  // Last layer → Outputs (60×10 = 600 possible, ~40% ≈ 240 conns)
  const lastLayer = layers[layers.length - 1];
  for (const hid of lastLayer) {
    for (let o = 0; o < N_OUTPUT; o++) {
      if (Math.random() < 0.40) {
        conns.push({
          innov: getInnov(hid, N_INPUT + o), inNode: hid, outNode: N_INPUT + o,
          weight: rand(-1.0, 1.0), enabled: true,
        });
      }
    }
  }

  // Within-layer lateral connections (~3% for wide layers, ~6% for narrow)
  for (const layer of layers) {
    const d = layer.length > 80 ? 0.03 : 0.06;
    for (let i = 0; i < layer.length; i++) {
      for (let j = i + 1; j < layer.length; j++) {
        if (Math.random() < d) {
          conns.push({
            innov: getInnov(layer[i], layer[j]), inNode: layer[i], outNode: layer[j],
            weight: rand(-0.6, 0.6), enabled: true,
          });
        }
      }
    }
  }

  // Skip connections — skip 1 layer (~3% for wide layers)
  for (let l = 0; l < layers.length - 2; l++) {
    for (const src of layers[l]) {
      for (const dst of layers[l + 2]) {
        if (Math.random() < 0.03) {
          conns.push({
            innov: getInnov(src, dst), inNode: src, outNode: dst,
            weight: rand(-0.7, 0.7), enabled: true,
          });
        }
      }
    }
  }

  // Residual: L0 → last-1 (~2% — skip connection highway)
  if (layers.length >= 4) {
    for (const src of layers[0]) {
      for (const dst of layers[layers.length - 2]) {
        if (Math.random() < 0.02) {
          conns.push({
            innov: getInnov(src, dst), inNode: src, outNode: dst,
            weight: rand(-0.5, 0.5), enabled: true,
          });
        }
      }
    }
  }

  // Input skip to L2 (~3% — fast balance feedback bypass)
  for (let i = 0; i < N_INPUT; i++) {
    for (const hid of layers[2]) {
      if (Math.random() < 0.03) {
        conns.push({
          innov: getInnov(i, hid), inNode: i, outNode: hid,
          weight: rand(-0.5, 0.5), enabled: true,
        });
      }
    }
  }

  // Direct input → output (~6% — reflex arcs)
  for (let i = 0; i < N_INPUT; i++) {
    for (let o = 0; o < N_OUTPUT; o++) {
      if (Math.random() < 0.06) {
        conns.push({
          innov: getInnov(i, N_INPUT + o), inNode: i, outNode: N_INPUT + o,
          weight: rand(-0.3, 0.3), enabled: true,
        });
      }
    }
  }

  return { nodes, conns };
}

// ── NEAT Structural Mutations ─────────────────────────────────

// Split an existing connection with a new hidden node.
// Old connection disabled; two new connections added.
function addNodeMut(g: NEATGenome): void {
  if (g.nodes.length >= MAX_HIDDEN) return;
  const enabled = g.conns.filter(c => c.enabled);
  if (!enabled.length) return;
  const target  = enabled[Math.floor(Math.random() * enabled.length)];
  target.enabled = false;
  const newId   = _nextHiddenId++;

  // Determine layer for the new node: midpoint between source and dest layers
  const srcNode = g.nodes.find(n => n.id === target.inNode);
  const dstNode = g.nodes.find(n => n.id === target.outNode);
  const srcLayer = target.inNode < N_INPUT ? -1 : (srcNode?.layer ?? 0);
  const dstLayer = target.outNode >= N_INPUT && target.outNode < N_INPUT + N_OUTPUT
    ? SEED_LAYERS.length : (dstNode?.layer ?? SEED_LAYERS.length - 1);
  const newLayer = Math.round((srcLayer + dstLayer) / 2);

  g.nodes.push({ id: newId, bias: 0, layer: Math.max(0, newLayer) });
  g.conns.push(
    { innov: getInnov(target.inNode, newId),      inNode: target.inNode, outNode: newId,         weight: 1.0,           enabled: true },
    { innov: getInnov(newId, target.outNode),      inNode: newId,         outNode: target.outNode, weight: target.weight, enabled: true },
  );
}

// Add a new random connection between two previously unconnected nodes.
function addConnMut(g: NEATGenome): void {
  if (g.conns.length >= MAX_CONNS) return;
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
  ];

  return {
    particles, constraints, alive: true, age: 0, startX, fitness: 0,
    fitnessScore: 0, fallTime: 0, standingTime: 0, color, footTrail: [],
    terminatedAt: 0, lowCoGTime: 0,
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
): void {
  const { particles, constraints } = ragdoll;

  // Motor forces
  MOTORS.forEach((motor, i) => {
    const target  = Math.max(motor.minAngle, Math.min(motor.maxAngle, motorOutputs[i]));
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

  // Core stability — angular spring biasing torso toward vertical.
  // Mimics involuntary postural muscles (vestibular reflex). Strong enough
  // that random NN motor noise can't instantly tip the creature over.
  // The NN's job is BALANCE CORRECTION, not discovering how to stand.
  const chest  = particles[PI.CHEST];
  const pelvis = particles[PI.PELVIS];
  const spDx   = chest.x - pelvis.x;
  const spDy   = chest.y - pelvis.y;
  const spDist = Math.sqrt(spDx * spDx + spDy * spDy) + 0.001;
  const spineAngle = Math.atan2(spDx, pelvis.y - chest.y); // 0 = vertical upright
  const corr = -spineAngle * 0.25;   // strong passive stability — like real postural muscles
  chest.x += (-spDy / spDist) * corr;
  chest.y += ( spDx / spDist) * corr;

  ragdoll.age    += dt;

  // ── Early termination: kill creatures that are fully on the ground ──
  // Threshold lowered to 15% (basically flat) with 0.5s grace period.
  // This gives wobbling/crouching creatures time to recover.
  {
    const etComH = Math.max(0, groundY - getCenterOfMass(particles).y);
    const etRatio = etComH / STANDING_COM_H;
    if (etRatio < 0.15) {
      ragdoll.lowCoGTime += dt;
      if (ragdoll.lowCoGTime > 0.5) {
        ragdoll.alive = false;
        ragdoll.terminatedAt = ragdoll.age;
        return; // dead — skip fitness
      }
    } else {
      ragdoll.lowCoGTime = 0;
    }
  }

  // Displacement fitness (used for camera tracking / display)
  let maxX = particles[PI.PELVIS].x;
  for (const p of particles) if (p.x > maxX) maxX = p.x;
  ragdoll.fitness = Math.max(0, maxX - ragdoll.startX);

  // ── UNIFIED FITNESS — all rewards available simultaneously ────
  // No phases. Everything is rewarded at once, weighted so that:
  //   standing upright = easiest points (foundation)
  //   balance + weight shifting = medium points (builds on standing)
  //   stepping + forward movement = jackpot (builds on balance)
  // Evolution naturally discovers the progression because you can't
  // step without balance and can't balance without standing.

  const com      = getCenterOfMass(particles);
  const comH     = Math.max(0, groundY - com.y);
  const comRatio = Math.min(1, comH / STANDING_COM_H);
  const hVel     = particles[PI.PELVIS].x - particles[PI.PELVIS].px;

  const lOnGround    = particles[PI.L_FOOT].y >= groundY - 2;
  const rOnGround    = particles[PI.R_FOOT].y >= groundY - 2;
  const anyGrounded  = lOnGround || rOnGround;
  const bothGrounded = lOnGround && rOnGround;

  // ── TIER 1: UPRIGHT (always active) ─────────────────────────
  // Continuous quadratic — every bit of height counts
  ragdoll.fitnessScore += 1.5 * comRatio * comRatio;
  if (comRatio > 0.30) ragdoll.fitnessScore += 0.5;  // survival bonus

  // Penalties
  if (!anyGrounded) ragdoll.fitnessScore -= 1.0;  // airborne
  if (particles[PI.HEAD].y > particles[PI.PELVIS].y) ragdoll.fitnessScore -= 0.5;

  // ── TIER 2: POSTURE QUALITY (kicks in at 50% CoG) ──────────
  if (comRatio > 0.50 && anyGrounded) {
    ragdoll.standingTime += dt;
    if (bothGrounded) ragdoll.fitnessScore += 0.8;
    if (particles[PI.HEAD].y < particles[PI.PELVIS].y) ragdoll.fitnessScore += 0.4;
    // Balance — CoM over feet
    const footMidX = (particles[PI.L_FOOT].x + particles[PI.R_FOOT].x) / 2;
    const balErr   = Math.abs(com.x - footMidX);
    if (balErr < 30) ragdoll.fitnessScore += 0.3 * (1 - balErr / 30);
  }

  // ── TIER 3: WEIGHT SHIFTING (kicks in at 55% CoG) ─────────
  if (comRatio > 0.55 && anyGrounded) {
    const singleSupport = (lOnGround && !rOnGround) || (!lOnGround && rOnGround);
    if (singleSupport) {
      ragdoll.singleSupportTime += dt;
      const liftedFootY = lOnGround ? particles[PI.R_FOOT].y : particles[PI.L_FOOT].y;
      const clearance   = Math.max(0, groundY - liftedFootY - 2) / 15;
      ragdoll.fitnessScore += 0.8 + 0.4 * Math.min(1, clearance);

      // Balance on support foot
      const supportFoot = lOnGround ? particles[PI.L_FOOT] : particles[PI.R_FOOT];
      const sBal = Math.abs(com.x - supportFoot.x);
      if (sBal < 20) ragdoll.fitnessScore += 0.3 * (1 - sBal / 20);
    }

    // Hip asymmetry — legs doing different things
    const lHip = jointAngle(particles[PI.CHEST], particles[PI.PELVIS], particles[PI.L_KNEE]);
    const rHip = jointAngle(particles[PI.CHEST], particles[PI.PELVIS], particles[PI.R_KNEE]);
    const hipDiff = Math.abs(lHip - rHip);
    if (hipDiff > 0.1) ragdoll.fitnessScore += 0.2 * Math.min(1, hipDiff);

    // Anti-phase leg swing
    const antiPhase = -lHip * rHip;
    if (antiPhase > 0.02) ragdoll.fitnessScore += 0.3 * Math.min(1, antiPhase);
  }

  // ── TIER 4: STEPPING & LOCOMOTION (kicks in at 50% CoG) ───
  if (comRatio > 0.50 && anyGrounded) {
    // Step detection
    if (ragdoll.lGrounded && !lOnGround) ragdoll.lLiftX = particles[PI.L_FOOT].x;
    if (ragdoll.rGrounded && !rOnGround) ragdoll.rLiftX = particles[PI.R_FOOT].x;

    if (!ragdoll.lGrounded && lOnGround && rOnGround) {
      const d = particles[PI.L_FOOT].x - ragdoll.lLiftX;
      if (d > 2) {
        const q   = Math.min(1, d / 20);
        const alt = ragdoll.lastStepSide !== 'l';
        ragdoll.fitnessScore += alt ? 20.0 * q : 3.0 * q;
        if (alt) { ragdoll.stepCount++; ragdoll.lastStepSide = 'l'; }
      }
    }
    if (!ragdoll.rGrounded && rOnGround && lOnGround) {
      const d = particles[PI.R_FOOT].x - ragdoll.rLiftX;
      if (d > 2) {
        const q   = Math.min(1, d / 20);
        const alt = ragdoll.lastStepSide !== 'r';
        ragdoll.fitnessScore += alt ? 20.0 * q : 3.0 * q;
        if (alt) { ragdoll.stepCount++; ragdoll.lastStepSide = 'r'; }
      }
    }

    // Forward velocity reward (grounded, upright)
    const uprightRatio = Math.min(1, Math.max(0, groundY - particles[PI.PELVIS].y) / STANDING_PELVIS_H);
    ragdoll.fitnessScore += Math.max(0, hVel) * 3.0 * uprightRatio;

    // Distance bonus — must have taken steps
    const dist = Math.max(0, particles[PI.PELVIS].x - ragdoll.startX);
    if (dist > 10 && ragdoll.singleSupportTime > 1.0) {
      ragdoll.fitnessScore += 0.04 * Math.sqrt(dist);
    }
    if (ragdoll.stepCount >= 2) ragdoll.fitnessScore += ragdoll.stepCount * 5.0;
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

// One colour per character slot
export const AGENT_COLORS: string[] = (() => {
  // Generate 15 visually distinct colors via HSL spacing
  const colors: string[] = [];
  for (let i = 0; i < 15; i++) {
    const hue = (i * 137.5) % 360;  // golden angle spacing
    const sat = 55 + (i % 3) * 15;  // vary saturation
    const lit = 50 + (i % 2) * 15;  // vary lightness
    colors.push(`hsl(${hue}, ${sat}%, ${lit}%)`);
  }
  return colors;
})();

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
  ragdoll:    Ragdoll;
  genome:     NEATGenome;
  rank:       number;
  lastInputs: Float32Array | null;
  lastOutputs: Float32Array | null;
}

// No phases — unified fitness. Evolution discovers standing→walking naturally.

export interface SimState {
  agents:       Agent[];
  generation:   number;
  time:         number;
  evalDuration: number;
  groundY:      number;
  bestFitness:  number;
  allTimeBest:  number;
  history:      number[];
  stagnation:   number;  // generations without improvement
  gravityMul:   number;  // 0→1 curriculum: starts low, ramps to full gravity
  species:      Species[];  // NEAT speciation — protects structural innovation
}

const EVAL_DURATION = 20;  // single eval duration — long enough for walking, short enough for fast gens
const N_AGENTS         = 8;

function makeAgent(genome: NEATGenome, i: number, groundY: number): Agent {
  return {
    genome,
    ragdoll:    createRagdoll(120 + i * 4, groundY, AGENT_COLORS[i]),
    rank:       i,
    lastInputs: null,
    lastOutputs: null,
  };
}

export function createSimState(groundY: number): SimState {
  resetNEAT();
  const agents = Array.from({ length: N_AGENTS }, (_, i) =>
    makeAgent(createInitialGenome(), i, groundY)
  );
  return {
    agents, generation: 1, time: 0, evalDuration: EVAL_DURATION,
    groundY, bestFitness: 0, allTimeBest: 0, history: [],
    stagnation: 0,
    gravityMul: 0.90,  // start at 90% gravity — almost Earth
    species: [],       // populated after first generation
  };
}

// No phase advancement — unified fitness handles everything

const SETTLE_TIME = 0.5; // seconds of settling before NN activates
const ZERO_MOTORS = new Float32Array(N_OUTPUT); // all-zero motor outputs

export function stepSim(state: SimState, dt: number): boolean {
  state.time += dt;
  const settling = state.time < SETTLE_TIME;

  for (const agent of state.agents) {
    if (!agent.ragdoll.alive) continue;

    if (settling) {
      stepRagdoll(agent.ragdoll, state.groundY, dt, ZERO_MOTORS, state.gravityMul);
    } else {
      const inputs  = getSensorInputs(agent.ragdoll, state.groundY, state.time - SETTLE_TIME);
      const outputs = neatForward(agent.genome, inputs);
      agent.lastInputs  = inputs;
      agent.lastOutputs = outputs;
      stepRagdoll(agent.ragdoll, state.groundY, dt, outputs, state.gravityMul);
    }
  }

  // Reset fitness reference point after settling (don't penalise settling drift)
  if (settling) {
    for (const agent of state.agents) {
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
      agent.ragdoll.lLiftX        = agent.ragdoll.particles[PI.L_FOOT].x;
      agent.ragdoll.rLiftX        = agent.ragdoll.particles[PI.R_FOOT].x;
    }
  }

  // All-dead early exit — biggest speed win
  const allDead = state.agents.every(a => !a.ragdoll.alive);
  if (allDead) return true;

  return state.time >= state.evalDuration + SETTLE_TIME;
}

export function nextGeneration(state: SimState): void {
  // ── Evaluate & rank ──
  const sorted = [...state.agents].sort((a, b) => b.ragdoll.fitnessScore - a.ragdoll.fitnessScore);
  const bestScore = sorted[0].ragdoll.fitnessScore;
  const best      = Math.max(...state.agents.map(a => a.ragdoll.fitness));
  state.bestFitness = best;

  // Stagnation tracking
  if (bestScore > state.allTimeBest) { state.allTimeBest = bestScore; state.stagnation = 0; }
  else state.stagnation++;
  state.history.push(Math.round(best));

  // ── Speciation — assign agents to species ──
  state.species = assignSpecies(state.agents, state.species);

  // ── Adaptive mutation scaling ──
  const stag   = Math.min(state.stagnation, 80);
  const mutMul = 1.0 + Math.min(2.5, stag / 20);

  function evolve(base: NEATGenome, rate: number, str: number, nodeP = 0, connP = 0): NEATGenome {
    const g = mutateWeights(base, Math.min(0.95, rate * mutMul), str * mutMul);
    const tries = stag > 20 ? 8 : stag > 10 ? 6 : 4;
    for (let i = 0; i < tries; i++) {
      if (nodeP > 0 && g.nodes.length < MAX_HIDDEN && Math.random() < Math.min(0.9, nodeP * mutMul)) addNodeMut(g);
      if (connP > 0 && g.conns.length < MAX_CONNS  && Math.random() < Math.min(0.9, connP * mutMul)) addConnMut(g);
    }
    return g;
  }

  // Mutation parameters — single set, stagnation scales them up
  const pm = { rate: 0.18, str: 0.35, nodeP: 0.15, connP: 0.25 };

  const nextGenomes: NEATGenome[] = [];

  // ── 1. Global elite — champion always survives ──
  nextGenomes.push(cloneGenome(sorted[0].genome));

  // ── 2. Species-proportional reproduction ──
  // Filter out stale species (unless it's the only one)
  const liveSpecies = state.species.filter(sp =>
    sp.staleGens <= MAX_STALE || state.species.length <= 1
  );

  // Calculate adjusted fitness per species (fitness / species_size)
  // This is the NEAT mechanism that protects innovation: small novel species
  // get proportionally more reproduction slots per member.
  const speciesInfo: { sp: Species; adjTotal: number; members: Agent[] }[] = [];
  let grandTotal = 0;
  for (const sp of liveSpecies) {
    const members = sp.memberIndices.map(i => state.agents[i]);
    const adjTotal = members.reduce((s, a) => s + Math.max(0, a.ragdoll.fitnessScore), 0) / members.length;
    grandTotal += adjTotal;
    speciesInfo.push({ sp, adjTotal, members });
  }

  const slotsAvailable = N_AGENTS - 1; // -1 for global elite
  for (const info of speciesInfo) {
    const proportion = grandTotal > 0 ? info.adjTotal / grandTotal : 1 / speciesInfo.length;
    const slots = Math.max(1, Math.round(proportion * slotsAvailable));
    const membersSorted = [...info.members].sort((a, b) => b.ragdoll.fitnessScore - a.ragdoll.fitnessScore);
    const topN = Math.max(2, Math.ceil(membersSorted.length * 0.4));
    const topGenomes = membersSorted.slice(0, topN).map(a => a.genome);

    for (let i = 0; i < slots && nextGenomes.length < N_AGENTS; i++) {
      if (i === 0) {
        // Species elite — best member survives unchanged
        nextGenomes.push(cloneGenome(membersSorted[0].genome));
      } else if (topGenomes.length >= 2 && Math.random() < 0.7) {
        // Crossover within species + mutation
        const a = topGenomes[Math.floor(Math.random() * Math.min(topGenomes.length, 3))];
        const b = topGenomes[Math.floor(Math.random() * topGenomes.length)];
        nextGenomes.push(evolve(neatCrossover(a, b), pm.rate, pm.str, pm.nodeP, pm.connP));
      } else {
        // Mutate a top member
        nextGenomes.push(evolve(cloneGenome(topGenomes[0]), pm.rate * 1.2, pm.str * 1.2, pm.nodeP, pm.connP));
      }
    }
  }

  // ── 3. Fill remaining slots (rounding gaps + fresh blood) ──
  while (nextGenomes.length < N_AGENTS) {
    if (Math.random() < 0.3) {
      nextGenomes.push(createInitialGenome()); // fresh genome — diversity injection
    } else {
      const src = sorted[Math.floor(Math.random() * 3)].genome;
      nextGenomes.push(evolve(cloneGenome(src), 0.20, 0.40, pm.nodeP, pm.connP));
    }
  }
  nextGenomes.length = N_AGENTS; // trim if over

  // ── Finalize generation ──
  state.agents     = nextGenomes.map((g, i) => makeAgent(g, i, state.groundY));
  state.generation += 1;
  state.time        = 0;

  // Gravity curriculum — ramp from 90% → 100% over ~15 generations
  state.gravityMul = Math.min(1.0, 0.90 + 0.10 * (state.generation / 15));
}
