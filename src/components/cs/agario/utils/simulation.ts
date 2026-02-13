// src/components/cs/agario/utils/simulation.ts

import { Genome } from '../neat';
import {
  Blob, Food, FoodCluster, Obstacle, Log, TerrainZone
} from '../config/agario.types';
import {
  WORLD_WIDTH, WORLD_HEIGHT,
  MAX_POPULATION,
  STARVATION_RATE, MIN_MOVEMENT_THRESHOLD, IDLE_PENALTY_START,
  IDLE_FITNESS_PENALTY, MOVEMENT_REWARD_FACTOR, STARVATION_DEATH_PENALTY,
  IDLE_STARVATION_RATE, IDLE_DEATH_THRESHOLD,
  BASE_STARVATION_INTERVAL,
  SURVIVAL_PRESSURE_INCREASE, MAX_OBSTACLES,
  CLUSTER_UPDATE_INTERVAL,
  VISION_UPDATE_INTERVAL,
  REPRODUCTION_MIN_MASS, REPRODUCTION_COOLDOWN, FOOD_FOR_REPRODUCTION, MIN_AGE_FOR_REPRODUCTION,
  AGING_PENALTY_START,
  MAX_AGE_PENALTY,
  AGE_PENALTY_EXPONENT,
  AGING_PENALTY_RATE,
  MIN_REPRODUCTION_EFFICIENCY,
  AGING_STARVATION_MULTIPLIER,
  BLOB_ACCELERATION,
  BLOB_ROTATION_SPEED,
  BLOB_FRICTION,
  BLOB_BASE_MAX_SPEED,
  BLOB_MASS_SPEED_FACTOR,
  BLOB_MAX_MASS
} from '../config/agario.constants';
import { createEngineeredVisionSystem } from './feature-engineering';
import { getNearbyFood } from './environment';
import { getEnhancedOutputs, calculateHeuristicReward } from './decision-tree';

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
const visionSystem = createEngineeredVisionSystem();

export const simulateBlob = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  logs: Log[],
  tick: number,
  spatialGrid: Map<string, Food[]>,
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  giveBirth: (parent: Blob) => boolean,
  visionSystem: ReturnType<typeof createEngineeredVisionSystem>  // ✅ Add vision system
): Blob => {
  // Age increment
  blob.age++;
  blob.visionUpdateCounter++;

  // Neural network decision
  let inputs: number[];
  if (!blob.cachedVision || blob.visionUpdateCounter >= VISION_UPDATE_INTERVAL) {
    // ✅ Use the vision system here
    inputs = visionSystem.getVision(
      blob,
      blobs,
      food,
      obstacles,
      getNearbyFood,  // This should be your spatial grid function
      tick,
      WORLD_WIDTH,
      WORLD_HEIGHT
    );
    blob.cachedVision = inputs;
    blob.visionUpdateCounter = 0;
  } else {
    inputs = blob.cachedVision;
  }

  // ==================== AGING PENALTY CALCULATION ====================
  // Calculate aging penalty only if blob is old enough
  if (blob.age > AGING_PENALTY_START) {
    const effectiveAge = blob.age - AGING_PENALTY_START;
    blob.effectiveAge = effectiveAge;

    // Exponential aging penalty: more severe as blob gets older
    // Formula: efficiency = MAX_AGE_PENALTY + (1 - MAX_AGE_PENALTY) * exp(-rate * age^exponent)
    const ageFactor = Math.min(effectiveAge * AGING_PENALTY_RATE, 10); // Cap to prevent overflow
    const expPenalty = Math.pow(ageFactor, AGE_PENALTY_EXPONENT);
    blob.agingEfficiency = MAX_AGE_PENALTY + (1 - MAX_AGE_PENALTY) * Math.exp(-expPenalty);

    // Clamp to reasonable minimum
    blob.agingEfficiency = Math.max(MIN_REPRODUCTION_EFFICIENCY, blob.agingEfficiency);

    // Apply small fitness penalty for aging (encourages reproduction before aging)
    if (tick % 100 === 0) {
      const agePenalty = (1 - blob.agingEfficiency) * 0.5;
      blob.genome.fitness -= agePenalty;
    }
  } else {
    blob.agingEfficiency = 1.0; // Full efficiency when young
    blob.effectiveAge = 0;
  }

  // Get raw neural network outputs
  const rawOutputs = blob.genome.activate(inputs);

  // Blend with decision tree heuristics for smarter behavior
  // Blend factor: 0.3 = 30% heuristic influence, 70% neural network
  // This helps early generations survive while still allowing evolution
  const { outputs: enhancedOutputs, heuristic } = getEnhancedOutputs(
    blob, blobs, food, obstacles, rawOutputs, tick, 0.3
  );

  // Store heuristic reason for display in UI
  blob.lastHeuristicReason = heuristic.reason;

  // Apply heuristic-based reward shaping (helps evolution learn good behaviors)
  if (tick % 20 === 0) {
    const heuristicReward = calculateHeuristicReward(
      blob, blobs, food, obstacles,
      { accel: enhancedOutputs[0], turn: enhancedOutputs[1], reproduce: enhancedOutputs[2] },
      tick
    );
    blob.genome.fitness += heuristicReward * 0.5;  // Scaled down to not dominate
  }

  const acceleration = Math.tanh(enhancedOutputs[0]) * BLOB_ACCELERATION;
  const rotation = Math.tanh(enhancedOutputs[1]) * BLOB_ROTATION_SPEED;
  const reproduceSignal = Math.tanh(enhancedOutputs[2]);

  // ==================== AGING-AFFECTED REPRODUCTION ====================
  // Old blobs have harder time reproducing
  if (reproduceSignal > 0.7) {
    const baseCanReproduce =
      blob.age >= MIN_AGE_FOR_REPRODUCTION &&
      blob.mass >= REPRODUCTION_MIN_MASS &&
      (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION) &&
      (tick - blob.lastReproductionTick) > REPRODUCTION_COOLDOWN;

    // Apply aging penalty to reproduction: old blobs need more resources
    const canReproduce = baseCanReproduce &&
      (blob.agingEfficiency > MIN_REPRODUCTION_EFFICIENCY ||
        blob.mass > REPRODUCTION_MIN_MASS * 1.5);

    if (canReproduce) {
      giveBirth(blob);
    } else if (blob.agingEfficiency <= MIN_REPRODUCTION_EFFICIENCY) {
      // Penalize very old blobs for trying to reproduce
      blob.genome.fitness -= 2;
    }
  }

  // Movement physics
  const currentAngle = Math.atan2(blob.vy, blob.vx) || Math.random() * Math.PI * 2;
  const newAngle = currentAngle + rotation;

  blob.vx += Math.cos(newAngle) * acceleration;
  blob.vy += Math.sin(newAngle) * acceleration;

  blob.vx *= BLOB_FRICTION;
  blob.vy *= BLOB_FRICTION;

  const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
  const maxSpeed = BLOB_BASE_MAX_SPEED / Math.sqrt(blob.mass / BLOB_MASS_SPEED_FACTOR);
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

      // Graduated idle punishment
      if (blob.idleTicks > IDLE_PENALTY_START) {
        // Fitness penalty (every 5 ticks to reduce spam)
        if (tick % 5 === 0) {
          blob.genome.fitness -= IDLE_FITNESS_PENALTY;
        }

        // Gradual mass loss (every 10 ticks)
        if (tick % 10 === 0) {
          blob.mass -= IDLE_STARVATION_RATE * 3; // ~0.45 mass per 10 ticks
        }

        // Kill blob if idle for too long
        if (blob.idleTicks > IDLE_DEATH_THRESHOLD) {
          blob.shouldRemove = true;
          blob.genome.fitness -= 30;
        }
      }
    } else {
      // Moving! Reset idle counter and reward
      blob.idleTicks = 0;
      blob.genome.fitness += distMoved * MOVEMENT_REWARD_FACTOR;
    }
  }
  blob.lastX = blob.x;
  blob.lastY = blob.y;

  // ==================== AGING-AFFECTED STARVATION ====================
  // Apply increased starvation with age
  if (tick % BASE_STARVATION_INTERVAL === 0) {
    let baseMassLoss = STARVATION_RATE;

    // Increase starvation rate with age
    if (blob.age > AGING_PENALTY_START) {
      const ageStarvationMultiplier = 1 + (blob.effectiveAge * AGING_STARVATION_MULTIPLIER);
      baseMassLoss *= ageStarvationMultiplier;
    }

    // Extra starvation for idle blobs (1.5x, not 2x)
    if (blob.idleTicks > IDLE_PENALTY_START) {
      baseMassLoss *= 1.5;
    }

    blob.mass = Math.max(10, blob.mass - baseMassLoss);
  }

  // Check for death from starvation
  // Lower threshold = more forgiving
  const starvationThreshold = blob.age > AGING_PENALTY_START ? 14 : 12;
  if (blob.mass <= starvationThreshold) {
    blob.shouldRemove = true;
    blob.genome.fitness += STARVATION_DEATH_PENALTY;
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
): { updatedBlobs: Blob[], updatedFood: Food[], kills: number, deadBlobIds: Set<number> } => {
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

  // === FOOD EATING WITH AGING PENALTY ===
  for (let i = updatedFood.length - 1; i >= 0; i--) {
    const f = updatedFood[i];

    for (const blob of blobs) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;

      // AABB broad-phase check
      if (Math.abs(blob.x - f.x) > blobRadius) continue;
      if (Math.abs(blob.y - f.y) > blobRadius) continue;

      // Distance squared check
      const distSq = distanceSquared(blob.x, blob.y, f.x, f.y);
      const radiusSq = blobRadius * blobRadius;

      if (distSq < radiusSq) {
        // Apply aging penalty to food absorption
        const massGained = f.mass * (blob.agingEfficiency || 1.0);
        blob.mass = Math.min(BLOB_MAX_MASS, blob.mass + massGained); // Cap mass!
        blob.foodEaten++;

        // Fitness reward reduced for old blobs
        const fitnessGain = 2 * (blob.agingEfficiency || 1.0);
        blob.genome.fitness += fitnessGain;

        updatedFood.splice(i, 1);
        break;
      }
    }
  }

  // === BLOB EATING BLOB WITH AGING PENALTY ===
  for (const blob of blobs) {
    if (blobsToRemove.has(blob.id)) continue;

    const blobRadius = Math.sqrt(blob.mass) * 2.5;
    const nearbyBlobs = getNearbyBlobs(blob.x, blob.y, blobRadius * 2, blobSpatialGrid);

    for (const other of nearbyBlobs) {
      if (blob.id === other.id || blobsToRemove.has(other.id)) continue;

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
        // Apply aging penalty to kill absorption
        const massGained = other.mass * 0.7 * (blob.agingEfficiency || 1.0);
        blob.mass = Math.min(BLOB_MAX_MASS, blob.mass + massGained); // Cap mass!
        blob.kills++;

        // Fitness reward reduced for old blobs
        const fitnessGain = 35 * (blob.agingEfficiency || 1.0);
        blob.genome.fitness += fitnessGain;

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

// ===================== CORIOLIS EFFECT =====================

/**
 * Apply Coriolis-like deflection to blob movement
 *
 * This simulates a weak planetary rotation effect:
 * - Northern hemisphere: deflects movement clockwise (right)
 * - Southern hemisphere: deflects movement counter-clockwise (left)
 * - Equator: minimal effect (calm zone)
 * - Effect scales with speed (faster = more deflection)
 * - Effect scales with latitude (stronger towards poles)
 *
 * This creates subtle curved trajectories that blobs must learn to navigate
 */
export const applyCoriolisEffect = (
  blob: Blob,
  worldWidth: number,
  worldHeight: number,
  strength: number = 0.015,
  hemisphereSplit: number = 0.5,
  equatorCalm: number = 0.1,
  latitudeScaling: boolean = true
): void => {
  // Calculate "latitude" - normalized Y position (0 = top/north, 1 = bottom/south)
  const normalizedY = blob.y / worldHeight;

  // Distance from equator (0 at equator, 1 at poles)
  const equatorY = hemisphereSplit;
  const distFromEquator = Math.abs(normalizedY - equatorY) / Math.max(equatorY, 1 - equatorY);

  // Determine hemisphere: negative = north (clockwise), positive = south (counter-clockwise)
  const hemisphere = normalizedY < equatorY ? -1 : 1;

  // Calculate effect strength based on latitude
  let effectStrength = strength;

  // Calm zone at equator - reduced effect
  if (distFromEquator < equatorCalm) {
    effectStrength *= distFromEquator / equatorCalm;
  }

  // Scale with latitude if enabled (stronger at poles)
  if (latitudeScaling) {
    effectStrength *= 0.3 + distFromEquator * 0.7; // 30% at equator, 100% at poles
  }

  // Coriolis only affects moving objects - scale with speed
  const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
  if (speed < 0.1) return; // No effect when nearly stationary

  // Apply perpendicular deflection to velocity
  // Coriolis force is perpendicular to velocity direction
  const deflectionX = -blob.vy * effectStrength * hemisphere;
  const deflectionY = blob.vx * effectStrength * hemisphere;

  blob.vx += deflectionX;
  blob.vy += deflectionY;
};