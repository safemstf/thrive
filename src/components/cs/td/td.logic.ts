// ============================================================
// NEAT-inspired Neural Evolution of Walking Ragdolls
// td.logic.ts — Physics · Neural Network · Genetic Algorithm
// ============================================================

// ── Constants ────────────────────────────────────────────────

const GRAVITY          = 750;   // px / s²
const BODY_DAMPING     = 0.984; // velocity damping per step
const CONSTRAINT_ITERS = 14;    // position-constraint iterations (stability)
const GROUND_FRICTION  = 0.68;  // horizontal friction on ground contact

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
  // Hips — strong enough to support upper body weight. Range: back-swing ↔ forward-swing around standing (0).
  { parentIdx: PI.CHEST,   pivotIdx: PI.PELVIS,  childIdx: PI.L_KNEE,   strength: 3200, minAngle: -0.9, maxAngle: 1.5  },
  { parentIdx: PI.CHEST,   pivotIdx: PI.PELVIS,  childIdx: PI.R_KNEE,   strength: 3200, minAngle: -1.5, maxAngle: 0.9  },
  // Knees — range includes fully straight (0) and deep bend
  { parentIdx: PI.PELVIS,  pivotIdx: PI.L_KNEE,  childIdx: PI.L_FOOT,   strength: 2600, minAngle: -0.3, maxAngle: 2.4  },
  { parentIdx: PI.PELVIS,  pivotIdx: PI.R_KNEE,  childIdx: PI.R_FOOT,   strength: 2600, minAngle: -2.4, maxAngle: 0.3  },
  // Shoulders — wider range to allow natural arm swing
  { parentIdx: PI.PELVIS,  pivotIdx: PI.CHEST,   childIdx: PI.L_ELBOW,  strength: 900,  minAngle: -2.2, maxAngle: 2.2  },
  { parentIdx: PI.PELVIS,  pivotIdx: PI.CHEST,   childIdx: PI.R_ELBOW,  strength: 900,  minAngle: -2.2, maxAngle: 2.2  },
  // Elbows — range includes straight and bent positions
  { parentIdx: PI.CHEST,   pivotIdx: PI.L_ELBOW, childIdx: PI.L_HAND,   strength: 700,  minAngle: -1.5, maxAngle: 2.4  },
  { parentIdx: PI.CHEST,   pivotIdx: PI.R_ELBOW, childIdx: PI.R_HAND,   strength: 700,  minAngle: -2.4, maxAngle: 1.5  },
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
  standingTime: number;  // seconds spent upright (used in rational standing reward)
  color:        string;
  footTrail:   Array<{ x: number; y: number; side: 'l' | 'r' }>;
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

export const N_INPUT  = 17;  // +2 for center-of-mass balance & vertical velocity
export const N_OUTPUT = 8;
const MAX_HIDDEN = 40;   // cap hidden nodes to prevent bloat
const MAX_CONNS  = 400;  // cap total connections — raised to allow deeper networks

export interface NodeGene {
  id:   number;
  bias: number;
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

export function neatForward(genome: NEATGenome, inputs: Float32Array): Float32Array {
  const act = new Map<number, number>();

  // Set inputs
  for (let i = 0; i < N_INPUT; i++) act.set(i, inputs[i]);

  // Hidden nodes in ascending ID order
  const sortedHidden = [...genome.nodes].sort((a, b) => a.id - b.id);
  for (const n of sortedHidden) {
    let sum = n.bias;
    for (const c of genome.conns) {
      if (c.enabled && c.outNode === n.id) sum += (act.get(c.inNode) ?? 0) * c.weight;
    }
    act.set(n.id, tanhFast(sum));
  }

  // Output nodes
  const outputs = new Float32Array(N_OUTPUT);
  for (let o = 0; o < N_OUTPUT; o++) {
    const outId = N_INPUT + o;
    let sum = 0;
    for (const c of genome.conns) {
      if (c.enabled && c.outNode === outId) sum += (act.get(c.inNode) ?? 0) * c.weight;
    }
    outputs[o] = tanhFast(sum);
  }
  return outputs;
}

// ── Genome Creation ───────────────────────────────────────────
// Start fully connected input→output (no hidden).
// Hidden nodes grow organically via add-node mutations.

export function createInitialGenome(): NEATGenome {
  const conns: ConnGene[] = [];
  for (let i = 0; i < N_INPUT; i++) {
    for (let o = 0; o < N_OUTPUT; o++) {
      conns.push({
        innov:   getInnov(i, N_INPUT + o),
        inNode:  i,
        outNode: N_INPUT + o,
        weight:  rand(-1.5, 1.5),
        enabled: true,
      });
    }
  }
  return { nodes: [], conns };
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
  g.nodes.push({ id: newId, bias: 0 });
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
  const childNodes = [...referencedIds].map(id => allHidden.get(id) ?? { id, bias: 0 });

  return { nodes: childNodes, conns: childConns };
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

  const particles: Particle[] = [
    mkP(px,               headY,   0.6), // 0  head
    mkP(px,               chestY,  1.0), // 1  chest
    mkP(px,               pelvisY, 1.2), // 2  pelvis
    mkP(px - 5,           kneeY,   0.8), // 3  lKnee
    mkP(px - 5,           footY,   0.8), // 4  lFoot
    mkP(px + 5,           kneeY,   0.8), // 5  rKnee
    mkP(px + 5,           footY,   0.8), // 6  rFoot
    mkP(px - L.UPPER_ARM, elbowY,  0.5), // 7  lElbow
    mkP(px - L.UPPER_ARM, handY,   0.4), // 8  lHand
    mkP(px + L.UPPER_ARM, elbowY,  0.5), // 9  rElbow
    mkP(px + L.UPPER_ARM, handY,   0.4), // 10 rHand
    mkP(px - 5 + L.FOOT,  footY,   0.5), // 11 lToe — flat foot for stable base
    mkP(px + 5 + L.FOOT,  footY,   0.5), // 12 rToe
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
    // Spine stabiliser (stiffer = harder to fold torso)
    { a: PI.HEAD,    b: PI.PELVIS,  restLen: L.NECK + L.SPINE, stiffness: 0.25 },
    // Feet — rigid foot segments give a flat base of support (no more chopstick legs)
    { a: PI.L_FOOT,  b: PI.L_TOE,   restLen: L.FOOT, stiffness: 1.0  },
    { a: PI.R_FOOT,  b: PI.R_TOE,   restLen: L.FOOT, stiffness: 1.0  },
    // Ankle cross-braces: knee→toe keeps feet roughly flat, prevents ankle flopping
    { a: PI.L_KNEE,  b: PI.L_TOE,   restLen: Math.sqrt(L.SHIN * L.SHIN + L.FOOT * L.FOOT), stiffness: 0.35 },
    { a: PI.R_KNEE,  b: PI.R_TOE,   restLen: Math.sqrt(L.SHIN * L.SHIN + L.FOOT * L.FOOT), stiffness: 0.35 },
  ];

  return { particles, constraints, alive: true, age: 0, startX, fitness: 0, fitnessScore: 0, fallTime: 0, standingTime: 0, color, footTrail: [] };
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
): void {
  const { particles, constraints } = ragdoll;

  // Motor forces
  MOTORS.forEach((motor, i) => {
    const target  = Math.max(motor.minAngle, Math.min(motor.maxAngle, motorOutputs[i] * 1.3));
    const parent  = particles[motor.parentIdx];
    const pivot   = particles[motor.pivotIdx];
    const child   = particles[motor.childIdx];
    let   err     = target - jointAngle(parent, pivot, child);
    while (err >  Math.PI) err -= 2 * Math.PI;
    while (err < -Math.PI) err += 2 * Math.PI;

    const torque = Math.min(Math.abs(err), 1.2) * Math.sign(err) * motor.strength * dt * dt;
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
    p.y += vy + GRAVITY * dt * dt;
  }

  // Constraint solver
  for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
    for (const c of constraints) {
      const a  = particles[c.a];
      const b  = particles[c.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = Math.sqrt(dx * dx + dy * dy) + 0.0001;
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
  }

  // Core stability — gentle angular spring biasing torso toward vertical.
  // Mimics involuntary postural muscles; makes standing biomechanically achievable
  // without the NN needing to discover basic balance from scratch.
  const chest  = particles[PI.CHEST];
  const pelvis = particles[PI.PELVIS];
  const spDx   = chest.x - pelvis.x;
  const spDy   = chest.y - pelvis.y;
  const spDist = Math.sqrt(spDx * spDx + spDy * spDy) + 0.001;
  const spineAngle = Math.atan2(spDx, pelvis.y - chest.y); // 0 = vertical upright
  const corr = -spineAngle * 0.20;   // enough to help balance but allows forward lean for walking
  chest.x += (-spDy / spDist) * corr;
  chest.y += ( spDx / spDist) * corr;

  ragdoll.age    += dt;

  // Displacement fitness (used for camera tracking / display)
  let maxX = particles[PI.PELVIS].x;
  for (const p of particles) if (p.x > maxX) maxX = p.x;
  ragdoll.fitness = Math.max(0, maxX - ragdoll.startX);

  // Accumulated walking score: forward displacement × uprightness each frame.
  // No floor for crawlers — they get ~0 fitness, forcing evolution toward upright gaits.
  const pelvisH      = Math.max(0, groundY - particles[PI.PELVIS].y);
  const headH        = Math.max(0, groundY - particles[PI.HEAD].y);
  const uprightRatio = Math.min(1, pelvisH / STANDING_PELVIS_H)
                     * Math.min(1, headH / (STANDING_HEAD_H * 0.75));
  const forwardDisp  = Math.max(0, particles[PI.PELVIS].x - particles[PI.PELVIS].px);
  // Track standing time and upright distance separately — combined via rational+exponential in nextGeneration
  if (uprightRatio > 0.4) {
    ragdoll.standingTime += dt;
    ragdoll.fitnessScore += forwardDisp;  // only count distance while sufficiently upright
  }

  // Footprints
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

  // Death conditions:
  // 1) Drifting backward — genuinely stuck
  if (particles[PI.PELVIS].x < ragdoll.startX - 50) ragdoll.alive = false;
  // 2) Head too low for > 0.5s = dead. Minimum height ~43px (60% of standing pelvis).
  //    Can't crawl with head at knee height. 0.5s grace allows brief stumbles.
  //    1.5s age grace for settling + initial stabilization.
  if (ragdoll.age > 1.5) {
    const headTooLow = particles[PI.HEAD].y > groundY - STANDING_PELVIS_H * 0.30;
    if (headTooLow) {
      ragdoll.fallTime += dt;
      if (ragdoll.fallTime > 1.5) ragdoll.alive = false;
    } else {
      ragdoll.fallTime = Math.max(0, ragdoll.fallTime - dt * 3);  // recover 3× faster
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

  return Float32Array.from([
    torsoAngle,
    Math.min(1, Math.max(0, (groundY - pelvis.y) / STANDING_PELVIS_H)),  // pelvis height ratio
    hVel,
    ...jointAngles,
    p[PI.L_FOOT].y >= groundY - 2 ? 1.0 : -1.0,
    p[PI.R_FOOT].y >= groundY - 2 ? 1.0 : -1.0,
    Math.sin(time * 2.8),
    Math.cos(time * 2.8),
    comBalance,   // CoM x offset from feet — balance indicator
    comVVel,      // CoM vertical velocity — falling/rising indicator
  ]);
}

// ── Agent & Simulation ────────────────────────────────────────

// One colour per character slot (0=Batman … 9=Nurse)
export const AGENT_COLORS = [
  '#6b7280', // 0  Batman        — dark grey
  '#ec4899', // 1  Russian Stripper — hot pink
  '#a855f7', // 2  KinkyButtplug   — devil purple
  '#fbbf24', // 3  Spongebob       — yellow
  '#a16207', // 4  Jack Sparrow    — weathered brown
  '#60a5fa', // 5  Elon Musk       — Tesla blue
  '#f97316', // 6  Donald Trump    — orange
  '#818cf8', // 7  Bill Clinton    — indigo
  '#34d399', // 8  Obama           — emerald
  '#e2e8f0', // 9  Nurse           — white
];

export interface Agent {
  ragdoll:    Ragdoll;
  genome:     NEATGenome;
  rank:       number;
  lastInputs: Float32Array | null;
  lastOutputs: Float32Array | null;
}

export interface SimState {
  agents:       Agent[];
  generation:   number;
  time:         number;
  evalDuration: number;
  groundY:      number;
  bestFitness:  number;
  allTimeBest:  number;
  history:      number[];
}

const EVAL_DURATION = 60;
const N_AGENTS      = 10;

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
  return { agents, generation: 1, time: 0, evalDuration: EVAL_DURATION, groundY, bestFitness: 0, allTimeBest: 0, history: [] };
}

const SETTLE_TIME = 0.5; // seconds of settling before NN activates
const ZERO_MOTORS = new Float32Array(8); // all-zero motor outputs

export function stepSim(state: SimState, dt: number): boolean {
  state.time += dt;
  const settling = state.time < SETTLE_TIME;

  for (const agent of state.agents) {
    if (!agent.ragdoll.alive) continue;

    if (settling) {
      // No motor forces — let gravity settle the ragdoll on the ground
      stepRagdoll(agent.ragdoll, state.groundY, dt, ZERO_MOTORS);
    } else {
      const inputs  = getSensorInputs(agent.ragdoll, state.groundY, state.time - SETTLE_TIME);
      const outputs = neatForward(agent.genome, inputs);
      agent.lastInputs  = inputs;
      agent.lastOutputs = outputs;
      stepRagdoll(agent.ragdoll, state.groundY, dt, outputs);
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
    }
  }

  return state.time >= state.evalDuration + SETTLE_TIME
    || state.agents.every(a => !a.ragdoll.alive);
}

export function nextGeneration(state: SimState): void {
  const totalDuration = state.evalDuration + SETTLE_TIME;

  // Apply survival factor to raw metrics
  for (const a of state.agents) {
    const sf = a.ragdoll.alive ? 1.0 : Math.max(0.15, a.ragdoll.age / totalDuration);
    a.ragdoll.fitness       *= sf;
    a.ragdoll.fitnessScore  *= sf;  // upright distance at this point
    a.ragdoll.standingTime  *= sf;
  }

  // Combined fitness: rational standing reward + exponential distance reward.
  // Rational f(t) = 1500·t/(t+15): plateaus ~1500, half-life 15s → rewards balance early.
  // Exponential g(d) = 89.4·(e^(d/400)−1): small distances ~worthless, explodes for large d.
  // Crossover: f(30s) ≈ g(1000px) ≈ 1000. First learn to stand, then distance takes over.
  for (const a of state.agents) {
    const t = a.ragdoll.standingTime;
    const d = a.ragdoll.fitnessScore;  // accumulated upright distance
    const standReward = 1500 * t / (t + 15);
    const distReward  = 89.4 * (Math.exp(Math.min(d / 400, 8)) - 1);
    a.ragdoll.fitnessScore = standReward + distReward;
  }

  // Sort by combined fitness
  const sorted = [...state.agents].sort((a, b) => b.ragdoll.fitnessScore - a.ragdoll.fitnessScore);
  const best   = Math.max(...state.agents.map(a => a.ragdoll.fitness));  // display uses displacement
  state.bestFitness = best;
  if (best > state.allTimeBest) state.allTimeBest = best;
  state.history.push(Math.round(best));

  const [e1, e2, e3] = sorted.map(a => a.genome);

  // Helper: mutate weights + optionally add structure
  function evolve(
    base: NEATGenome,
    rate: number, str: number,
    nodeP = 0, connP = 0,
  ): NEATGenome {
    const g = mutateWeights(base, rate, str);
    // Three rounds of structural mutations — deeper networks need more growth pressure
    for (let i = 0; i < 3; i++) {
      if (nodeP > 0 && g.nodes.length < MAX_HIDDEN && Math.random() < nodeP) addNodeMut(g);
      if (connP > 0 && g.conns.length < MAX_CONNS  && Math.random() < connP) addConnMut(g);
    }
    return g;
  }

  // Generation slots (10 agents):
  // 0     : true elite (exact champion copy)
  // 1     : 2nd elite with tiny mutation
  // 2-3   : NEAT crossovers with aggressive structural growth
  // 4-5   : champion weight mutations + structural growth
  // 6     : champion heavy mutation + forced structural growth
  // 7     : 2nd place with structural growth
  // 8     : deep-structure explorer (champion + very aggressive structural)
  // 9     : wildcard diversity from random top-5 parent
  const e4 = sorted.length > 3 ? sorted[3].genome : e3;
  const nextGenomes: NEATGenome[] = [
    // 0: TRUE ELITE — exact champion genome, no mutations (guaranteed preservation)
    { nodes: e1.nodes.map(n => ({...n})), conns: e1.conns.map(c => ({...c})) },
    // 1: 2nd elite, tiny weight mutation + small structural chance
    evolve(e2, 0.02, 0.05, 0.15, 0.20),
    // 2-3: NEAT crossovers with aggressive structural growth
    evolve(neatCrossover(e1, e2), 0.08, 0.16, 0.35, 0.40),
    evolve(neatCrossover(e1, e3), 0.08, 0.16, 0.35, 0.35),
    // 4-5: champion with increasing weight + structural mutation
    evolve(e1, 0.08, 0.18, 0.25, 0.30),
    evolve(e1, 0.18, 0.40, 0.35, 0.40),
    // 6: champion heavy mutation + forced structural growth (breaks plateaus)
    evolve(e1, 0.30, 0.65, 0.50, 0.55),
    // 7: 2nd place with structural growth
    evolve(e2, 0.14, 0.30, 0.30, 0.35),
    // 8: deep-structure explorer — champion with very aggressive structural mutation
    // This slot specifically exists to push past node count plateaus
    evolve(e1, 0.10, 0.20, 0.65, 0.70),
    // 9: heavily mutated random top-5 parent (structured diversity, not blank slate)
    evolve(sorted[Math.floor(Math.random() * 5)].genome, 0.5, 1.0, 0.55, 0.55),
  ];

  state.agents     = nextGenomes.map((g, i) => makeAgent(g, i, state.groundY));
  state.generation += 1;
  state.time        = 0;
}
