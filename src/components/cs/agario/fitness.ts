// src/components/cs/agario/fitness.ts

import { Blob } from './agario.types';
import { INPUT_SIZE, OUTPUT_SIZE } from './agario.constants';

/**
 * Fitness Calculation System
 * 
 * This module handles all fitness calculations for blobs.
 * Fitness determines which blobs are more successful and should
 * pass on their genes to the next generation.
 */

// ===================== FITNESS WEIGHTS =====================

const FITNESS_WEIGHTS = {
  // Survival
  BASE_SURVIVAL_PER_AGE: 1 / 200,
  MAX_SURVIVAL_BONUS: 2,

  // Mass
  MASS_GROWTH_MULTIPLIER: 35,
  MASS_THRESHOLD: 30,

  // Combat
  KILL_BASE_REWARD: 400,
  KILL_SCALING_BASE: 40,
  KILL_SCALING_EXPONENT: 1.5,

  // Food
  FOOD_REWARD: 20,

  // Family
  FAMILY_SIZE_MULTIPLIER: 8,

  // Reproduction
  BIRTH_REWARD: 80,

  // Movement
  MOVEMENT_BONUS_MULTIPLIER: 200,
  EXPLORATION_MULTIPLIER: 100,
  MAX_MOVEMENT_BONUS: 50,
  MAX_EXPLORATION_BONUS: 40,

  // Movement penalties
  LOW_MOVEMENT_THRESHOLD: 0.15,
  LOW_MOVEMENT_PENALTY: 0.5, // 50% reduction
  MODERATE_MOVEMENT_THRESHOLD: 0.3,
  MODERATE_MOVEMENT_PENALTY: 0.7, // 30% reduction

  // Idle penalties
  IDLE_THRESHOLD: 50,
  IDLE_PENALTY_DIVISOR: 200,
  MAX_IDLE_PENALTY: 0.9,

  // Complexity bonuses
  EXTRA_NODE_REWARD: 1,
  EXTRA_CONNECTION_REWARD: 0.3,

  // Specialization bonuses
  SPECIALIZATION: {
    HAS_KILLS: 40,
    HIGH_FOOD: 80,
    FOOD_THRESHOLD: 15,
    HIGH_MASS: 150,
    MASS_THRESHOLD: 80,
    HAS_CHILDREN: 120,
  },

  // Fitness cap
  MAX_FITNESS: 10000,
} as const;

// ===================== HELPER FUNCTIONS =====================

/**
 * Calculate survival fitness based on age
 */
function calculateSurvivalFitness(age: number): number {
  return Math.min(
    age * FITNESS_WEIGHTS.BASE_SURVIVAL_PER_AGE,
    FITNESS_WEIGHTS.MAX_SURVIVAL_BONUS
  );
}

/**
 * Calculate mass growth fitness
 */
function calculateMassFitness(mass: number): number {
  if (mass <= FITNESS_WEIGHTS.MASS_THRESHOLD) return 0;
  
  const massFactor = Math.log2(mass / FITNESS_WEIGHTS.MASS_THRESHOLD);
  return massFactor * FITNESS_WEIGHTS.MASS_GROWTH_MULTIPLIER;
}

/**
 * Calculate combat fitness from kills
 */
function calculateCombatFitness(kills: number): number {
  if (kills === 0) return 0;

  let fitness = kills * FITNESS_WEIGHTS.KILL_BASE_REWARD;
  
  if (kills > 1) {
    fitness += Math.pow(kills, FITNESS_WEIGHTS.KILL_SCALING_EXPONENT) * 
               FITNESS_WEIGHTS.KILL_SCALING_BASE;
  }

  return fitness;
}

/**
 * Calculate food consumption fitness
 */
function calculateFoodFitness(foodEaten: number): number {
  return foodEaten * FITNESS_WEIGHTS.FOOD_REWARD;
}

/**
 * Calculate family size bonus
 */
function calculateFamilyFitness(familySize: number): number {
  return familySize * FITNESS_WEIGHTS.FAMILY_SIZE_MULTIPLIER;
}

/**
 * Calculate reproduction success fitness
 */
function calculateReproductionFitness(birthsGiven: number): number {
  if (birthsGiven === 0) return 0;
  return birthsGiven * FITNESS_WEIGHTS.BIRTH_REWARD;
}

/**
 * Calculate movement efficiency fitness and apply penalties
 */
function calculateMovementFitness(
  age: number,
  distanceTraveled: number,
  idleTicks: number
): { fitness: number; multiplier: number } {
  if (age === 0) return { fitness: 0, multiplier: 1 };

  const movementRatio = distanceTraveled / age;
  let fitness = 0;
  let multiplier = 1;

  // Severe penalties for low movement
  if (movementRatio < FITNESS_WEIGHTS.LOW_MOVEMENT_THRESHOLD) {
    multiplier = FITNESS_WEIGHTS.LOW_MOVEMENT_PENALTY;
  } else if (movementRatio < FITNESS_WEIGHTS.MODERATE_MOVEMENT_THRESHOLD) {
    multiplier = FITNESS_WEIGHTS.MODERATE_MOVEMENT_PENALTY;
  }

  // Movement bonus
  const movementBonus = Math.min(
    FITNESS_WEIGHTS.MAX_MOVEMENT_BONUS,
    movementRatio * FITNESS_WEIGHTS.MOVEMENT_BONUS_MULTIPLIER
  );
  fitness += movementBonus;

  // Exploration score
  const explorationScore = Math.min(
    FITNESS_WEIGHTS.MAX_EXPLORATION_BONUS,
    movementRatio * FITNESS_WEIGHTS.EXPLORATION_MULTIPLIER
  );
  fitness += explorationScore;

  return { fitness, multiplier };
}

/**
 * Calculate idle penalty multiplier
 */
function calculateIdlePenalty(idleTicks: number): number {
  if (idleTicks <= FITNESS_WEIGHTS.IDLE_THRESHOLD) return 1;

  const penalty = Math.min(
    FITNESS_WEIGHTS.MAX_IDLE_PENALTY,
    idleTicks / FITNESS_WEIGHTS.IDLE_PENALTY_DIVISOR
  );

  return 1 - penalty;
}

/**
 * Calculate complexity bonus for evolved neural networks
 */
function calculateComplexityFitness(
  nodeCount: number,
  connectionCount: number
): number {
  const baseNodeCount = INPUT_SIZE + OUTPUT_SIZE;
  const baseConnectionCount = INPUT_SIZE * OUTPUT_SIZE;

  const extraNodes = nodeCount - baseNodeCount;
  const extraConnections = connectionCount - baseConnectionCount;

  let fitness = 0;

  if (extraNodes > 0) {
    fitness += extraNodes * FITNESS_WEIGHTS.EXTRA_NODE_REWARD;
  }

  if (extraConnections > 0) {
    fitness += extraConnections * FITNESS_WEIGHTS.EXTRA_CONNECTION_REWARD;
  }

  return fitness;
}

/**
 * Calculate specialization bonuses
 */
function calculateSpecializationFitness(blob: Blob): number {
  const spec = FITNESS_WEIGHTS.SPECIALIZATION;
  
  let fitness = 0;

  // Combat specialist
  if (blob.kills > 0) {
    fitness += spec.HAS_KILLS;
  }

  // Foraging specialist
  if (blob.foodEaten > spec.FOOD_THRESHOLD) {
    fitness += spec.HIGH_FOOD;
  }

  // Growth specialist
  if (blob.mass > spec.MASS_THRESHOLD) {
    fitness += spec.HIGH_MASS;
  }

  // Reproduction specialist
  if (blob.childrenIds.length > 0) {
    fitness += spec.HAS_CHILDREN;
  }

  return fitness;
}

// ===================== MAIN FITNESS CALCULATION =====================

/**
 * Calculate comprehensive fitness for a blob
 * 
 * @param blob - The blob to calculate fitness for
 * @param familySize - Number of family members (same lineage)
 * @returns The calculated fitness value
 */
export function calculateBlobFitness(blob: Blob, familySize: number): number {
  let fitness = 0;

  // 1. Base survival
  fitness += calculateSurvivalFitness(blob.age);

  // 2. Mass growth
  fitness += calculateMassFitness(blob.mass);

  // 3. Combat success
  fitness += calculateCombatFitness(blob.kills);

  // 4. Food consumption
  fitness += calculateFoodFitness(blob.foodEaten);

  // 5. Family size bonus
  fitness += calculateFamilyFitness(familySize);

  // 6. Reproduction success
  fitness += calculateReproductionFitness(blob.birthsGiven);

  // 7. Movement efficiency (includes penalties)
  const { fitness: movementFitness, multiplier: movementMultiplier } = 
    calculateMovementFitness(blob.age, blob.distanceTraveled, blob.idleTicks);
  
  fitness *= movementMultiplier; // Apply movement penalty first
  fitness += movementFitness;    // Then add movement bonus

  // 8. Idle penalty (multiplicative)
  fitness *= calculateIdlePenalty(blob.idleTicks);

  // 9. Neural network complexity
  fitness += calculateComplexityFitness(
    blob.genome.nodes.size,
    blob.genome.connections.size
  );

  // 10. Specialization bonuses
  fitness += calculateSpecializationFitness(blob);

  // 11. Cap fitness to prevent overflow
  fitness = Math.min(fitness, FITNESS_WEIGHTS.MAX_FITNESS);

  return fitness;
}

/**
 * Calculate fitness for all blobs in a population
 * 
 * @param blobs - Array of all blobs
 * @returns Map of blob ID to calculated fitness
 */
export function calculatePopulationFitness(blobs: Blob[]): Map<number, number> {
  const fitnessMap = new Map<number, number>();

  // Build family size map
  const familySizes = new Map<number, number>();
  for (const blob of blobs) {
    familySizes.set(
      blob.familyLineage,
      (familySizes.get(blob.familyLineage) || 0) + 1
    );
  }

  // Calculate fitness for each blob
  for (const blob of blobs) {
    const familySize = familySizes.get(blob.familyLineage) || 1;
    const fitness = calculateBlobFitness(blob, familySize);
    
    // Update blob's genome fitness
    blob.genome.fitness = fitness;
    
    fitnessMap.set(blob.id, fitness);
  }

  return fitnessMap;
}

/**
 * Get fitness statistics for the population
 */
export function getFitnessStats(blobs: Blob[]): {
  min: number;
  max: number;
  avg: number;
  median: number;
  total: number;
} {
  if (blobs.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, total: 0 };
  }

  const fitnesses = blobs.map(b => b.genome.fitness).sort((a, b) => a - b);
  
  const min = fitnesses[0];
  const max = fitnesses[fitnesses.length - 1];
  const total = fitnesses.reduce((sum, f) => sum + f, 0);
  const avg = total / fitnesses.length;
  const median = fitnesses[Math.floor(fitnesses.length / 2)];

  return { min, max, avg, median, total };
}

/**
 * Get top N blobs by fitness
 */
export function getTopBlobs(blobs: Blob[], count: number): Blob[] {
  return [...blobs]
    .sort((a, b) => b.genome.fitness - a.genome.fitness)
    .slice(0, count);
}

/**
 * Calculate fitness percentile for a blob
 * 
 * @param blob - The blob to check
 * @param blobs - All blobs in population
 * @returns Percentile (0-100)
 */
export function getFitnessPercentile(blob: Blob, blobs: Blob[]): number {
  const sorted = [...blobs].sort((a, b) => a.genome.fitness - b.genome.fitness);
  const index = sorted.findIndex(b => b.id === blob.id);
  
  if (index === -1) return 0;
  
  return (index / sorted.length) * 100;
}

// Export weights for tuning
export { FITNESS_WEIGHTS };