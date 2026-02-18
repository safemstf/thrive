
// ===================== TYPES =====================

import { Genome } from "../neat";

type ZoneType = 'safe' | 'neutral' | 'danger';

interface TerrainZone {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ZoneType;
}

// ===================== TERRAIN TOPOLOGY =====================
// Mountains and barriers that create paths, chokepoints, and navigation challenges
// These are NON-LETHAL - they just block movement and force routing decisions

interface TerrainBarrier {
  id: number;
  type: 'mountain' | 'ridge' | 'reef';  // Visual style
  // Polygon points defining the barrier shape
  points: Array<{ x: number; y: number }>;
  // For collision detection - bounding box
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  // Visual properties
  color: string;
  opacity: number;
}

interface Food {
  x: number;
  y: number;
  mass: number;
  age: number;
}

interface FoodCluster {
  x: number;
  y: number;
  totalMass: number;
  count: number;
  radius: number;
  foods: Food[];
}

interface FoodIsland {
  id: number;
  x: number;
  y: number;
  radius: number;
  spawnRate: number;
  richness: number;
  currentFood: number;
  maxFood: number;
  color: string;
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
  // Moving obstacle properties (optional for static obstacles)
  vx?: number;           // Velocity X
  vy?: number;           // Velocity Y
  movementType?: 'static' | 'linear' | 'circular' | 'patrol';
  // For circular movement
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitAngle?: number;
  // For patrol movement
  patrolPoints?: Array<{x: number, y: number}>;
  patrolIndex?: number;
  patrolSpeed?: number;
}

// Ocean currents push blobs around - terrain that affects pathing
interface OceanCurrent {
  id: number;
  x: number;
  y: number;
  radius: number;
  angle: number;        // Current direction in radians
  strength: number;     // Push force
  rotationSpeed: number; // How fast the current swirls (0 = straight, >0 = clockwise)
  type: 'stream' | 'whirlpool' | 'gyre';  // Visual/behavior type
}

interface Log {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  grabbedBy?: number;
}

interface Blob {
  shouldRemove?: boolean;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  genome: Genome;
  generation: number;
  kills: number;
  age: number;
  foodEaten: number;
  distanceTraveled: number;
  lastX: number;
  lastY: number;
  idleTicks: number;
  grabbedLog?: number;
  parentId?: number;
  childrenIds: number[];
  familyLineage: number;
  cachedVision?: number[];
  visionUpdateCounter: number;
  lastReproductionTick: number;
  birthsGiven: number;
  agingEfficiency?: number; // 0.3 to 1.0, multiplier for resource gain
  effectiveAge?: number; // Age adjusted for penalties
  brain?: {
    mutated: boolean;
    hiddenLayers: number[];
  };
  lastHeuristicReason?: string;  // Current AI decision reason

  // Emergent behavior tracking
  dangerEncounters?: number;     // Times near larger blobs
  closeCalls?: number;           // Times mass dropped below 20
  obstacleEncounters?: number;   // Times near obstacles
  directionChanges?: number;     // Significant heading changes
  speedVariance?: number;        // Variance in movement speed
  lastSpeed?: number;            // For tracking speed changes
  lastHeading?: number;          // For tracking direction changes

  // === INTELLIGENCE METRICS ===
  // These measure decision QUALITY, not just outcomes

  // Correct decisions: approaching food, fleeing threats
  correctDecisions?: number;     // Decisions that matched optimal action
  totalDecisions?: number;       // Total decision points evaluated

  // Spatial awareness
  escapedThreats?: number;       // Started fleeing when threat appeared
  pursuedPrey?: number;          // Chased smaller blobs successfully

  // Prediction ability (did action lead to expected outcome?)
  predictedOutcomes?: number;    // Actions that achieved intended goal

  // Adaptability
  behaviorSwitches?: number;     // Changed strategy based on situation
}

export type ActivationFunction = 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu';

export interface BiomeConfig {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  foodDensity: number;
  foodQuality: number;
  dangerLevel: number;
  color?: string;
}

export interface SelectedNodeInfo {
  id: number;
  layer: 'input' | 'hidden' | 'output';
  activation?: number;
  bias?: number;
  connections?: number;
}

interface NeuralNode {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'input' | 'hidden' | 'output';
  label: string;
  activation?: string;
  activationValue?: number;
  vx?: number;
  vy?: number;
  isDragging?: boolean;
  isLocked?: boolean;
}

interface NeuralConnection {
  from: number;
  to: number;
  weight: number;
  enabled: boolean;
  isHighlighted?: boolean;
}

interface NeuralLayout {
  nodes: Map<number, NeuralNode>;
  connections: NeuralConnection[];
}

export type { ZoneType };

export type {
  TerrainZone,
  TerrainBarrier,
  Food,
  FoodCluster,
  FoodIsland,
  Obstacle,
  OceanCurrent,
  Log,
  Blob,
  NeuralNode,
  NeuralConnection,
  NeuralLayout,
};
export type { Genome };