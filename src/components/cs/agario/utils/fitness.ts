// src/components/cs/agario/fitness.ts

import { Blob } from '../config/agario.types';
import { INPUT_SIZE, OUTPUT_SIZE } from '../config/agario.constants';

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
  BASE_SURVIVAL_PER_AGE: 1 / 2000,
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
  BIRTH_REWARD: 10,

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

  // === INTELLIGENCE REWARDS ===
  // These reward SMART behavior, not just any behavior

  // Efficiency: food per distance (rewards directed movement, not random wandering)
  EFFICIENCY_MULTIPLIER: 500,
  MIN_DISTANCE_FOR_EFFICIENCY: 100, // Must travel at least this much

  // Danger survival: bonus for surviving while near threats
  DANGER_SURVIVAL_BONUS: 100,
  DANGER_ENCOUNTER_THRESHOLD: 5, // Must have encountered danger this many times

  // Growth rate: mass gained per tick alive (rewards fast learners)
  GROWTH_RATE_MULTIPLIER: 1000,
  MIN_AGE_FOR_GROWTH_RATE: 200,

  // Close call survival: escaped near-death situations
  CLOSE_CALL_BONUS: 50,

  // === EMERGENT BEHAVIOR REWARDS ===
  // These reward behaviors that indicate learned intelligence

  // Velocity variance: rewards blobs that change speed (hunting, fleeing)
  // Low variance = boring constant movement, high variance = reactive behavior
  VELOCITY_VARIANCE_MULTIPLIER: 100,

  // Directional changes: rewards blobs that turn (seeking, avoiding)
  DIRECTION_CHANGE_MULTIPLIER: 50,

  // Success rate: food eaten / distance traveled (efficiency)
  SUCCESS_RATE_MULTIPLIER: 300,

  // Survival despite obstacles: bonus for surviving when obstacles present
  OBSTACLE_SURVIVAL_BONUS: 80,

  // === INTELLIGENCE QUALITY METRICS ===
  // These are the MOST important - they measure decision quality, not luck

  // Decision accuracy: % of decisions matching optimal (most important!)
  DECISION_ACCURACY_MULTIPLIER: 800,  // High weight - this IS intelligence

  // Specific intelligent behaviors
  THREAT_ESCAPE_BONUS: 100,           // Recognized and fled from threat
  PREY_PURSUIT_BONUS: 80,             // Recognized and chased prey

  // Adaptability: changing strategy appropriately
  BEHAVIOR_SWITCH_BONUS: 50,          // Changed behavior when situation changed

  // === NOVELTY / DIVERSITY ===
  // Prevent convergence to single strategy - encourage diverse behaviors

  // Unique behavior bonus (calculated at population level)
  NOVELTY_MULTIPLIER: 100,            // Bonus for being behaviorally unique

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

// ===================== INTELLIGENCE FITNESS =====================

/**
 * Calculate efficiency fitness - rewards directed movement toward food
 * A blob that travels 100 units and eats 10 food is smarter than one
 * that travels 1000 units and eats 10 food
 */
function calculateEfficiencyFitness(blob: Blob): number {
  if (blob.distanceTraveled < FITNESS_WEIGHTS.MIN_DISTANCE_FOR_EFFICIENCY) {
    return 0;
  }

  if (blob.foodEaten === 0) {
    return 0;
  }

  // Food per unit distance traveled (higher = more efficient)
  const efficiency = blob.foodEaten / (blob.distanceTraveled / 100);

  return Math.min(efficiency * FITNESS_WEIGHTS.EFFICIENCY_MULTIPLIER, 200);
}

/**
 * Calculate growth rate fitness - rewards fast learners
 * Mass gained per tick alive shows how quickly the blob figured things out
 */
function calculateGrowthRateFitness(blob: Blob): number {
  if (blob.age < FITNESS_WEIGHTS.MIN_AGE_FOR_GROWTH_RATE) {
    return 0;
  }

  const startingMass = 30; // Initial mass
  const massGained = Math.max(0, blob.mass - startingMass);
  const growthRate = massGained / blob.age;

  return Math.min(growthRate * FITNESS_WEIGHTS.GROWTH_RATE_MULTIPLIER, 150);
}

/**
 * Calculate danger awareness fitness
 * Rewards blobs that have encountered dangers and survived
 * (tracked via dangerEncounters field on blob)
 */
function calculateDangerAwarenessFitness(blob: Blob): number {
  const dangerEncounters = (blob as any).dangerEncounters || 0;

  if (dangerEncounters < FITNESS_WEIGHTS.DANGER_ENCOUNTER_THRESHOLD) {
    return 0;
  }

  // Survived multiple danger encounters = smart blob
  return Math.min(dangerEncounters * 10, FITNESS_WEIGHTS.DANGER_SURVIVAL_BONUS);
}

/**
 * Calculate close call bonus
 * Rewards blobs that survived near-death (low mass) situations
 */
function calculateCloseCallFitness(blob: Blob): number {
  const closeCalls = blob.closeCalls || 0;

  return Math.min(closeCalls * FITNESS_WEIGHTS.CLOSE_CALL_BONUS, 150);
}

// ===================== EMERGENT BEHAVIOR FITNESS =====================

/**
 * Calculate behavioral complexity fitness
 * Rewards blobs that show varied, reactive behavior
 */
function calculateBehavioralFitness(blob: Blob): number {
  let fitness = 0;

  // Speed variance: blobs that change speed are reacting to environment
  const speedVariance = blob.speedVariance || 0;
  fitness += Math.min(speedVariance * 0.5, FITNESS_WEIGHTS.VELOCITY_VARIANCE_MULTIPLIER);

  // Direction changes: blobs that turn are seeking/avoiding
  const dirChanges = blob.directionChanges || 0;
  const changeRatio = blob.age > 0 ? dirChanges / blob.age : 0;
  // Sweet spot: not too few (idle) not too many (spinning)
  if (changeRatio > 0.01 && changeRatio < 0.2) {
    fitness += FITNESS_WEIGHTS.DIRECTION_CHANGE_MULTIPLIER;
  }

  return fitness;
}

/**
 * Calculate obstacle survival fitness
 * Rewards blobs that encountered obstacles but survived
 */
function calculateObstacleSurvivalFitness(blob: Blob): number {
  const obstacleEncounters = blob.obstacleEncounters || 0;

  // Must have encountered obstacles to get bonus
  if (obstacleEncounters < 5) return 0;

  // Bonus scales with encounters survived
  return Math.min(obstacleEncounters * 2, FITNESS_WEIGHTS.OBSTACLE_SURVIVAL_BONUS);
}

// ===================== INTELLIGENCE QUALITY FITNESS =====================

/**
 * THE MOST IMPORTANT FITNESS COMPONENT
 *
 * This measures decision quality - how often the neural network
 * makes decisions that match what an "optimal" agent would do.
 *
 * Decision accuracy is the core measure of intelligence:
 * - A random agent gets ~50% accuracy
 * - A perfect agent gets 100% accuracy
 * - Evolution should push accuracy higher over time
 */
function calculateIntelligenceFitness(blob: Blob): number {
  let fitness = 0;

  const totalDecisions = blob.totalDecisions || 0;
  const correctDecisions = blob.correctDecisions || 0;

  // Need enough decisions to measure accurately
  if (totalDecisions < 10) return 0;

  // Decision accuracy: percentage of correct decisions
  const accuracy = correctDecisions / totalDecisions;

  // Heavily reward high accuracy
  // accuracy of 0.5 (random) = 0 bonus
  // accuracy of 0.7 = 160 bonus
  // accuracy of 0.9 = 320 bonus
  const accuracyBonus = Math.max(0, (accuracy - 0.5) * 2) * FITNESS_WEIGHTS.DECISION_ACCURACY_MULTIPLIER;
  fitness += accuracyBonus;

  // Threat escape: showed understanding of danger
  const escapedThreats = blob.escapedThreats || 0;
  if (escapedThreats > 0) {
    fitness += Math.min(escapedThreats * 10, FITNESS_WEIGHTS.THREAT_ESCAPE_BONUS);
  }

  // Prey pursuit: showed understanding of opportunity
  const pursuedPrey = blob.pursuedPrey || 0;
  if (pursuedPrey > 0) {
    fitness += Math.min(pursuedPrey * 8, FITNESS_WEIGHTS.PREY_PURSUIT_BONUS);
  }

  // Behavior switching: showed adaptability
  const behaviorSwitches = blob.behaviorSwitches || 0;
  // Sweet spot: some switches good, too many is random
  const switchRatio = blob.age > 0 ? behaviorSwitches / blob.age : 0;
  if (switchRatio > 0.005 && switchRatio < 0.05) {
    fitness += FITNESS_WEIGHTS.BEHAVIOR_SWITCH_BONUS;
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

  // === INTELLIGENCE REWARDS ===
  // These reward SMART behavior, making evolution favor intelligence

  // 11. Efficiency - food per distance (directed hunting)
  fitness += calculateEfficiencyFitness(blob);

  // 12. Growth rate - how fast did they figure things out
  fitness += calculateGrowthRateFitness(blob);

  // 13. Danger awareness - survived dangerous situations
  fitness += calculateDangerAwarenessFitness(blob);

  // 14. Close calls - survived near-death
  fitness += calculateCloseCallFitness(blob);

  // === EMERGENT BEHAVIOR REWARDS ===
  // These reward behaviors that emerge from learning

  // 15. Behavioral complexity - varied, reactive movement
  fitness += calculateBehavioralFitness(blob);

  // 16. Obstacle survival - navigated around hazards
  fitness += calculateObstacleSurvivalFitness(blob);

  // === INTELLIGENCE QUALITY (MOST IMPORTANT) ===
  // This is the key to evolving actual intelligence

  // 17. Intelligence - decision accuracy and situational awareness
  fitness += calculateIntelligenceFitness(blob);

  // 18. Cap fitness to prevent overflow
  fitness = Math.min(fitness, FITNESS_WEIGHTS.MAX_FITNESS);

  return fitness;
}

/**
 * Calculate a behavioral fingerprint for a blob
 * Used for novelty search - blobs with unique behaviors get bonuses
 */
function getBehavioralFingerprint(blob: Blob): number[] {
  // Create a vector representing the blob's behavioral characteristics
  const totalDec = blob.totalDecisions || 1;
  const accuracy = (blob.correctDecisions || 0) / totalDec;
  const escapeRate = (blob.escapedThreats || 0) / Math.max(1, blob.dangerEncounters || 1);
  const huntRate = (blob.pursuedPrey || 0) / Math.max(1, blob.age / 100);
  const switchRate = (blob.behaviorSwitches || 0) / Math.max(1, blob.age);
  const speedVar = (blob.speedVariance || 0) / Math.max(1, blob.age);
  const dirChangeRate = (blob.directionChanges || 0) / Math.max(1, blob.age);

  return [
    accuracy,
    escapeRate,
    huntRate,
    switchRate * 100,
    speedVar,
    dirChangeRate * 10
  ];
}

/**
 * Calculate behavioral distance between two blobs
 */
function behavioralDistance(fp1: number[], fp2: number[]): number {
  let sumSq = 0;
  for (let i = 0; i < fp1.length; i++) {
    const diff = fp1[i] - fp2[i];
    sumSq += diff * diff;
  }
  return Math.sqrt(sumSq);
}

/**
 * Calculate fitness for all blobs in a population
 * Includes novelty bonus for behavioral diversity
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

  // Calculate base fitness for each blob
  for (const blob of blobs) {
    const familySize = familySizes.get(blob.familyLineage) || 1;
    const fitness = calculateBlobFitness(blob, familySize);
    blob.genome.fitness = fitness;
    fitnessMap.set(blob.id, fitness);
  }

  // === NOVELTY BONUS ===
  // Reward blobs that have unique behavioral profiles
  // This prevents convergence to a single "winning" strategy
  // OPTIMIZATION: Only calculate for a sample when population is large

  if (blobs.length > 5) {
    // Calculate behavioral fingerprints
    const fingerprints = new Map<number, number[]>();
    for (const blob of blobs) {
      fingerprints.set(blob.id, getBehavioralFingerprint(blob));
    }

    // For large populations, sample to reduce O(n²) overhead
    const MAX_NOVELTY_SAMPLE = 30;
    const blobsToEvaluate = blobs.length > MAX_NOVELTY_SAMPLE
      ? blobs.slice().sort(() => Math.random() - 0.5).slice(0, MAX_NOVELTY_SAMPLE)
      : blobs;

    // For each blob, calculate average distance to K nearest neighbors
    const K = Math.min(5, Math.floor(blobsToEvaluate.length / 3));

    for (const blob of blobsToEvaluate) {
      const myFp = fingerprints.get(blob.id)!;
      const distances: number[] = [];

      for (const other of blobsToEvaluate) {
        if (other.id === blob.id) continue;
        const otherFp = fingerprints.get(other.id)!;
        distances.push(behavioralDistance(myFp, otherFp));
      }

      // Sort and take K nearest
      distances.sort((a, b) => a - b);
      const kNearest = distances.slice(0, K);
      const avgDistance = kNearest.length > 0
        ? kNearest.reduce((a, b) => a + b, 0) / kNearest.length
        : 0;

      // Novelty bonus: higher distance = more unique = bonus
      // Scale so reasonable diversity gets ~50-100 bonus
      const noveltyBonus = Math.min(avgDistance * FITNESS_WEIGHTS.NOVELTY_MULTIPLIER, 150);

      // Add novelty bonus to fitness
      blob.genome.fitness += noveltyBonus;
      fitnessMap.set(blob.id, blob.genome.fitness);
    }
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
export const getTopBlobs = (blobs: Blob[], count: number, sortBy: 'fitness' | 'mass' | 'kills' | 'children' = 'fitness'): Blob[] => {
  return [...blobs]
    .sort((a, b) => {
      switch (sortBy) {
        case 'fitness':
          return (b.genome.fitness || 0) - (a.genome.fitness || 0);
        case 'mass':
          return b.mass - a.mass;
        case 'kills':
          return b.kills - a.kills;
        case 'children':
          return b.childrenIds.length - a.childrenIds.length;
        default:
          return (b.genome.fitness || 0) - (a.genome.fitness || 0);
      }
    })
    .slice(0, count);
};

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