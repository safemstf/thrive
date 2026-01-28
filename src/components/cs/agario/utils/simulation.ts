// src/components/cs/agario/simulation.ts

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
  // Update blob logic from the update loop
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

  // Movement tracking
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const distMoved = distance(blob.x, blob.y, blob.lastX, blob.lastY);
  if (distMoved < WORLD_WIDTH / 2) {
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

export const handleCollisions = (
  blobs: Blob[],
  obstacles: Obstacle[],
  food: Food[],
  totalDeathsRef: { current: number }
): { updatedBlobs: Blob[], updatedFood: Food[], kills: number, deadBlobIds: Set<number>} => {
  const blobsToRemove = new Set<number>();
  const updatedFood = [...food];
  let kills = 0;

  // Obstacle collisions
  for (const blob of blobs) {
    if (blobsToRemove.has(blob.id)) continue;

    const blobRadius = Math.sqrt(blob.mass) * 2.5;

    for (const obs of obstacles) {
      const dist = distance(blob.x, blob.y, obs.x, obs.y);

      if (dist < blobRadius + obs.radius) {
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

  // Food eating
  for (let i = updatedFood.length - 1; i >= 0; i--) {
    const f = updatedFood[i];

    for (const blob of blobs) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;
      const dist = distance(blob.x, blob.y, f.x, f.y);

      if (dist < blobRadius) {
        blob.mass += f.mass;
        blob.foodEaten++;
        blob.genome.fitness += 2;
        updatedFood.splice(i, 1);
        break;
      }
    }
  }

  // Blob eating blob
  for (const blob of blobs) {
    if (blobsToRemove.has(blob.id)) continue;

    const blobRadius = Math.sqrt(blob.mass) * 2.5;

    for (const other of blobs) {
      if (blob.id === other.id || blobsToRemove.has(other.id)) continue;

      if (blob.mass > other.mass * 1.15) {
        const dist = distance(blob.x, blob.y, other.x, other.y);

        if (dist < blobRadius * 0.8) {
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
  }

  const updatedBlobs = blobs.filter(b => !blobsToRemove.has(b.id));

  return { updatedBlobs, updatedFood, kills, deadBlobIds: blobsToRemove };
};

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

// Helper function
const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};