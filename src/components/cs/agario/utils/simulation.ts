// src/components/cs/agario/utils/simulation-optimized.ts

import { Genome } from '../neat';
import { 
  Blob, Food, FoodCluster, Obstacle, Log, TerrainZone 
} from '../config/agario.types';
import { 
  WORLD_WIDTH, WORLD_HEIGHT,
  MAX_POPULATION,
  STARVATION_RATE, MIN_MOVEMENT_THRESHOLD, IDLE_PENALTY_START, 
  IDLE_FITNESS_PENALTY, MOVEMENT_REWARD_FACTOR, STARVATION_DEATH_PENALTY,
  BASE_STARVATION_INTERVAL,
  SURVIVAL_PRESSURE_INCREASE, MAX_OBSTACLES,
  CLUSTER_UPDATE_INTERVAL,
  VISION_UPDATE_INTERVAL,
  REPRODUCTION_MIN_MASS, REPRODUCTION_COOLDOWN, FOOD_FOR_REPRODUCTION, MIN_AGE_FOR_REPRODUCTION
} from '../config/agario.constants';

/**
 * Optimized simulation with spatial grid for collisions
 */

// ===================== SPATIAL GRID UTILITIES =====================

const COLLISION_GRID_SIZE = 150; // Slightly larger cells for blob collisions

interface BlobSpatialGrid {
  grid: Map<string, Blob[]>;
  gridSize: number;
}

/**
 * Create spatial grid for blobs (for O(n) collision detection)
 */
export function createBlobSpatialGrid(blobs: Blob[], gridSize: number = COLLISION_GRID_SIZE): BlobSpatialGrid {
  const grid = new Map<string, Blob[]>();
  
  for (const blob of blobs) {
    const radius = Math.sqrt(blob.mass) * 2.5;
    
    // Add blob to all cells it might occupy
    const minX = Math.floor((blob.x - radius) / gridSize);
    const maxX = Math.floor((blob.x + radius) / gridSize);
    const minY = Math.floor((blob.y - radius) / gridSize);
    const maxY = Math.floor((blob.y + radius) / gridSize);
    
    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const key = `${gx},${gy}`;
        if (!grid.has(key)) {
          grid.set(key, []);
        }
        grid.get(key)!.push(blob);
      }
    }
  }
  
  return { grid, gridSize };
}

/**
 * Get nearby blobs from spatial grid
 */
function getNearbyBlobs(
  x: number, 
  y: number, 
  radius: number,
  spatialGrid: BlobSpatialGrid
): Blob[] {
  const { grid, gridSize } = spatialGrid;
  const nearbyBlobs = new Set<Blob>();
  
  const minX = Math.floor((x - radius) / gridSize);
  const maxX = Math.floor((x + radius) / gridSize);
  const minY = Math.floor((y - radius) / gridSize);
  const maxY = Math.floor((y + radius) / gridSize);
  
  for (let gx = minX; gx <= maxX; gx++) {
    for (let gy = minY; gy <= maxY; gy++) {
      const key = `${gx},${gy}`;
      const blobs = grid.get(key);
      if (blobs) {
        blobs.forEach(b => nearbyBlobs.add(b));
      }
    }
  }
  
  return Array.from(nearbyBlobs);
}

// ===================== DISTANCE UTILITIES =====================

/**
 * Squared distance (avoids sqrt for performance)
 */
function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * Regular distance (only use when necessary)
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(distanceSquared(x1, y1, x2, y2));
}

// ===================== BLOB SIMULATION =====================

export const simulateBlob = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  logs: Log[],
  tick: number,
  spatialGrid: Map<string, Food[]>,
  getVision: (blob: Blob) => number[],
  giveBirth: (parent: Blob) => boolean
): Blob => {
  // Age increment
  blob.age++;
  blob.visionUpdateCounter++;

  // Neural network decision
  let inputs: number[];
  if (!blob.cachedVision || blob.visionUpdateCounter >= VISION_UPDATE_INTERVAL) {
    inputs = getVision(blob);
    blob.cachedVision = inputs;
    blob.visionUpdateCounter = 0;
  } else {
    inputs = blob.cachedVision;
  }

  const outputs = blob.genome.activate(inputs);

  const acceleration = Math.tanh(outputs[0]) * 0.45;
  const rotation = Math.tanh(outputs[1]) * 0.2;
  const reproduceSignal = Math.tanh(outputs[2]);

  // Neural network controlled reproduction
  if (reproduceSignal > 0.7) {
    const canReproduce =
      blob.age >= MIN_AGE_FOR_REPRODUCTION &&
      blob.mass >= REPRODUCTION_MIN_MASS &&
      (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION) &&
      (tick - blob.lastReproductionTick) > REPRODUCTION_COOLDOWN;

    if (canReproduce) {
      giveBirth(blob);
    } else {
      blob.genome.fitness -= 1;
    }
  }

  // Movement physics
  const currentAngle = Math.atan2(blob.vy, blob.vx) || Math.random() * Math.PI * 2;
  const newAngle = currentAngle + rotation;

  blob.vx += Math.cos(newAngle) * acceleration;
  blob.vy += Math.sin(newAngle) * acceleration;

  blob.vx *= 0.95;
  blob.vy *= 0.95;

  const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
  const maxSpeed = 5 / Math.sqrt(blob.mass / 30);
  if (speed > maxSpeed) {
    blob.vx = (blob.vx / speed) * maxSpeed;
    blob.vy = (blob.vy / speed) * maxSpeed;
  }

  blob.x += blob.vx;
  blob.y += blob.vy;

  // Wrap around
  if (blob.x < 0) blob.x += WORLD_WIDTH;
  if (blob.x > WORLD_WIDTH) blob.x -= WORLD_WIDTH;
  if (blob.y < 0) blob.y += WORLD_HEIGHT;
  if (blob.y > WORLD_HEIGHT) blob.y -= WORLD_HEIGHT;

  // Movement tracking (optimized with squared distance)
  const distMovedSq = distanceSquared(blob.x, blob.y, blob.lastX, blob.lastY);
  const wrapThresholdSq = (WORLD_WIDTH / 2) * (WORLD_WIDTH / 2);
  
  if (distMovedSq < wrapThresholdSq) {
    const distMoved = Math.sqrt(distMovedSq); // Only calc sqrt when needed
    blob.distanceTraveled += distMoved;

    if (distMoved < MIN_MOVEMENT_THRESHOLD) {
      blob.idleTicks++;
      if (blob.idleTicks > IDLE_PENALTY_START) {
        blob.genome.fitness -= IDLE_FITNESS_PENALTY;
        if (tick % 10 === 0) {
          const idleStarvation = (blob.idleTicks - IDLE_PENALTY_START) * 0.1;
          blob.mass = Math.max(20, blob.mass - idleStarvation);
        }
      }
    } else {
      blob.idleTicks = 0;
      blob.genome.fitness += distMoved * MOVEMENT_REWARD_FACTOR;
    }
  }
  blob.lastX = blob.x;
  blob.lastY = blob.y;

  // Starvation
  if (tick % BASE_STARVATION_INTERVAL === 0) {
    const baseMassLoss = STARVATION_RATE;
    blob.mass = Math.max(15, blob.mass - baseMassLoss);

    if (blob.mass <= 7) {
      blob.shouldRemove = true;
      blob.genome.fitness += STARVATION_DEATH_PENALTY;
    }
  }

  return blob;
};

// ===================== OPTIMIZED COLLISION DETECTION =====================

/**
 * Optimized collision detection with:
 * - Spatial grid for O(n) instead of O(n²)
 * - Broad-phase AABB checks
 * - Distance squared comparisons
 */
export const handleCollisionsOptimized = (
  blobs: Blob[],
  obstacles: Obstacle[],
  food: Food[],
  totalDeathsRef: { current: number }
): { updatedBlobs: Blob[], updatedFood: Food[], kills: number, deadBlobIds: Set<number>} => {
  const blobsToRemove = new Set<number>();
  const updatedFood = [...food];
  let kills = 0;

  // Create spatial grid for blob-blob collisions
  const blobSpatialGrid = createBlobSpatialGrid(blobs);

  // === OBSTACLE COLLISIONS ===
  for (const blob of blobs) {
    if (blobsToRemove.has(blob.id)) continue;

    const blobRadius = Math.sqrt(blob.mass) * 2.5;

    for (const obs of obstacles) {
      // Use squared distance for initial check
      const distSq = distanceSquared(blob.x, blob.y, obs.x, obs.y);
      const collisionDistSq = (blobRadius + obs.radius) ** 2;

      if (distSq < collisionDistSq) {
        // Drop food pellets
        const pelletCount = Math.floor(blob.mass / 3);
        for (let p = 0; p < pelletCount; p++) {
          const angle = (Math.PI * 2 * p) / pelletCount;
          const spread = 15 + Math.random() * 25;
          updatedFood.push({
            x: blob.x + Math.cos(angle) * spread,
            y: blob.y + Math.sin(angle) * spread,
            mass: 2.5,
            age: 0
          });
        }

        blob.genome.fitness -= 40;
        blobsToRemove.add(blob.id);
        totalDeathsRef.current++;
        break;
      }
    }
  }

  // === FOOD EATING ===
  for (let i = updatedFood.length - 1; i >= 0; i--) {
    const f = updatedFood[i];

    for (const blob of blobs) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;
      
      // AABB broad-phase check (very fast)
      if (Math.abs(blob.x - f.x) > blobRadius) continue;
      if (Math.abs(blob.y - f.y) > blobRadius) continue;

      // Distance squared check
      const distSq = distanceSquared(blob.x, blob.y, f.x, f.y);
      const radiusSq = blobRadius * blobRadius;

      if (distSq < radiusSq) {
        blob.mass += f.mass;
        blob.foodEaten++;
        blob.genome.fitness += 2;
        updatedFood.splice(i, 1);
        break;
      }
    }
  }

  // === BLOB EATING BLOB (OPTIMIZED WITH SPATIAL GRID) ===
  for (const blob of blobs) {
    if (blobsToRemove.has(blob.id)) continue;

    const blobRadius = Math.sqrt(blob.mass) * 2.5;
    
    // Only check nearby blobs using spatial grid (HUGE OPTIMIZATION)
    const nearbyBlobs = getNearbyBlobs(blob.x, blob.y, blobRadius * 2, blobSpatialGrid);

    for (const other of nearbyBlobs) {
      if (blob.id === other.id || blobsToRemove.has(other.id)) continue;

      // Must be significantly larger to eat
      if (blob.mass <= other.mass * 1.15) continue;

      // AABB broad-phase check
      const otherRadius = Math.sqrt(other.mass) * 2.5;
      const maxDist = blobRadius * 0.8;
      
      if (Math.abs(blob.x - other.x) > maxDist) continue;
      if (Math.abs(blob.y - other.y) > maxDist) continue;

      // Distance squared check
      const distSq = distanceSquared(blob.x, blob.y, other.x, other.y);
      const collisionDistSq = (blobRadius * 0.8) ** 2;

      if (distSq < collisionDistSq) {
        // Eat!
        blob.mass += other.mass * 0.7;
        blob.kills++;
        blob.genome.fitness += 35;
        kills++;

        // Drop some food
        const pelletCount = Math.floor(other.mass / 6);
        for (let p = 0; p < pelletCount; p++) {
          const angle = Math.random() * Math.PI * 2;
          const spread = 10 + Math.random() * 15;
          updatedFood.push({
            x: other.x + Math.cos(angle) * spread,
            y: other.y + Math.sin(angle) * spread,
            mass: 2,
            age: 0
          });
        }

        other.genome.fitness -= 15;
        blobsToRemove.add(other.id);
        totalDeathsRef.current++;
      }
    }
  }

  const updatedBlobs = blobs.filter(b => !blobsToRemove.has(b.id));

  return { updatedBlobs, updatedFood, kills, deadBlobIds: blobsToRemove };
};

// Keep the old version for backwards compatibility
export const handleCollisions = handleCollisionsOptimized;

// ===================== SURVIVAL PRESSURE =====================

export const updateSurvivalPressure = (
  obstacles: Obstacle[],
  survivalPressure: number
): Obstacle[] => {
  const newObstacles = [...obstacles];
  
  if (newObstacles.length < MAX_OBSTACLES && Math.random() < survivalPressure * 0.5) {
    newObstacles.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      radius: 15 + Math.random() * 20
    });
  }
  
  return newObstacles;
};