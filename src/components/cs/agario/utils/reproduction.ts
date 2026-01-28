// src/components/cs/agario/utils/reproduction.ts

import { Genome } from '../neat';
import { Blob } from '../config/agario.types';
import {
  MAX_POPULATION, REPRODUCTION_MIN_MASS, REPRODUCTION_COOLDOWN,
  FOOD_FOR_REPRODUCTION, MIN_AGE_FOR_REPRODUCTION,
  WORLD_WIDTH,
  WORLD_HEIGHT
} from '../config/agario.constants';

export const createBlob = (
  genome: Genome,
  generation: number,
  parentId?: number,
  x?: number,
  y?: number,
  color?: string,
  familyLineage?: number,
  getNextId?: () => number
): Blob => {
  const blobX = x ?? Math.random() * WORLD_WIDTH;
  const blobY = y ?? Math.random() * WORLD_HEIGHT;

  const blob: Blob = {
    id: getNextId ? getNextId() : Date.now() + Math.random(),
    x: blobX,
    y: blobY,
    vx: 0,
    vy: 0,
    mass: 30,
    color: color ?? `hsl(${Math.random() * 360}, 70%, 55%)`,
    genome,
    generation,
    kills: 0,
    age: 0,
    foodEaten: 0,
    distanceTraveled: 0,
    lastX: blobX,
    lastY: blobY,
    idleTicks: 0,
    visionUpdateCounter: 0,
    parentId,
    childrenIds: [],
    familyLineage: familyLineage ?? Date.now(),
    lastReproductionTick: 0, // Start at 0, not Date.now()
    birthsGiven: 0,
    cachedVision: undefined,
    shouldRemove: false // Add this field
  };

  return blob;
};

export const giveBirth = (
  parent: Blob,
  blobs: Blob[],
  mutateGenome: (genome: Genome) => Genome,
  createBlobFn: typeof createBlob,
  currentTick: number  // Add currentTick parameter (simulation tick)
): { success: boolean, baby?: Blob, updatedParent?: Blob, updatedBlobs?: Blob[] } => {
  if (blobs.length >= MAX_POPULATION) {
    return { success: false };
  }

  // Use simulation ticks, not Date.now()
  const canReproduce =
    parent.age >= MIN_AGE_FOR_REPRODUCTION &&
    parent.mass >= REPRODUCTION_MIN_MASS &&
    (parent.kills > 0 || parent.foodEaten >= FOOD_FOR_REPRODUCTION) &&
    (currentTick - parent.lastReproductionTick) > REPRODUCTION_COOLDOWN;

  if (!canReproduce) {
    return { success: false };
  }

  // Create baby genome with mutations
  const babyGenome = mutateGenome(parent.genome.clone());
  babyGenome.fitness = 0;

  // Create baby near parent
  const angle = Math.random() * Math.PI * 2;
  const distance = 60 + Math.random() * 40;
  const bx = parent.x + Math.cos(angle) * distance;
  const by = parent.y + Math.sin(angle) * distance;

  const baby = createBlobFn(
    babyGenome,
    parent.generation + 1,
    parent.id,
    bx,
    by,
    parent.color,
    parent.familyLineage
  );
  baby.mass = 25;

  // Parent loses mass for reproduction
  const updatedParent = {
    ...parent,
    mass: Math.max(30, parent.mass * 0.7),
    lastReproductionTick: currentTick,  // Use simulation tick
    birthsGiven: parent.birthsGiven + 1,
    childrenIds: [...parent.childrenIds, baby.id]
  };

  // Neural network gets bonus for successful reproduction
  updatedParent.genome.fitness += 50;

  // Replace the parent in the array
  const updatedBlobs = blobs.map(b => b.id === parent.id ? updatedParent : b);
  updatedBlobs.push(baby);

  return {
    success: true,
    baby,
    updatedParent,
    updatedBlobs
  };
};