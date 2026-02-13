
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