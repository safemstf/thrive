// src/components/cs/agario/utils/decision-tree.ts

/**
 * DECISION TREE HEURISTICS FOR BLOB INTELLIGENCE
 *
 * Philosophy: Provide hardcoded "instincts" that help blobs survive.
 * These get blended with neural network outputs to create a hybrid system:
 *
 * 1. Decision tree provides baseline survival behaviors
 * 2. Neural network learns when to override these instincts
 * 3. Evolution optimizes the blend weights
 *
 * Key behaviors encoded:
 * - Flee from larger threats
 * - Chase smaller prey when hungry
 * - Seek food when low on energy
 * - Reproduce when conditions are favorable
 * - Avoid obstacles/edges
 * - Don't stay idle
 */

import { Blob, Food, Obstacle } from '../config/agario.types';
import {
  REPRODUCTION_MIN_MASS,
  MIN_AGE_FOR_REPRODUCTION,
  FOOD_FOR_REPRODUCTION,
  WORLD_WIDTH,
  WORLD_HEIGHT
} from '../config/agario.constants';

// ===================== DECISION TREE OUTPUT =====================

export interface HeuristicOutput {
  // Movement suggestion (-1 to 1)
  accelerate: number;    // How much to speed up/slow down
  turn: number;          // Direction to turn (-1 = left, 1 = right)

  // Action suggestion (0 to 1)
  reproduce: number;     // Desire to reproduce

  // Confidence in this recommendation (0 to 1)
  confidence: number;    // How strongly to apply this vs neural net

  // Debug info
  reason: string;        // Why this decision was made
}

// ===================== SITUATION ASSESSMENT =====================

interface SituationAssessment {
  // Threats
  nearestThreat: { blob: Blob; dist: number; angle: number } | null;
  threatLevel: number;  // 0-1

  // Opportunities
  nearestPrey: { blob: Blob; dist: number; angle: number } | null;
  nearestFood: { food: Food; dist: number; angle: number } | null;
  opportunityLevel: number;  // 0-1

  // Self state
  energyLevel: number;  // 0-1 (based on mass)
  canReproduce: boolean;
  isIdle: boolean;
  nearEdge: boolean;
  nearObstacle: { obs: Obstacle; dist: number } | null;

  // Movement
  currentSpeed: number;
  currentAngle: number;
}

/**
 * Assess the current situation for a blob
 */
function assessSituation(
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  currentTick: number
): SituationAssessment {
  const blobRadius = Math.sqrt(blob.mass) * 2.5;
  const visionRange = 200;

  // Find nearest threat (blob 15% larger than us)
  let nearestThreat: SituationAssessment['nearestThreat'] = null;
  let minThreatDist = Infinity;

  // Find nearest prey (blob we can eat - 15% smaller)
  let nearestPrey: SituationAssessment['nearestPrey'] = null;
  let minPreyDist = Infinity;

  for (const other of blobs) {
    if (other.id === blob.id) continue;

    const dx = other.x - blob.x;
    const dy = other.y - blob.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > visionRange) continue;

    const angle = Math.atan2(dy, dx);

    // Is this a threat? (larger than us)
    if (other.mass > blob.mass * 1.15) {
      if (dist < minThreatDist) {
        minThreatDist = dist;
        nearestThreat = { blob: other, dist, angle };
      }
    }

    // Is this prey? (smaller than us)
    if (blob.mass > other.mass * 1.15) {
      if (dist < minPreyDist) {
        minPreyDist = dist;
        nearestPrey = { blob: other, dist, angle };
      }
    }
  }

  // Find nearest food
  let nearestFood: SituationAssessment['nearestFood'] = null;
  let minFoodDist = Infinity;

  for (const f of food) {
    const dx = f.x - blob.x;
    const dy = f.y - blob.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minFoodDist) {
      minFoodDist = dist;
      nearestFood = { food: f, dist, angle: Math.atan2(dy, dx) };
    }
  }

  // Find nearest obstacle
  let nearObstacle: SituationAssessment['nearObstacle'] = null;
  let minObsDist = Infinity;

  for (const obs of obstacles) {
    const dx = obs.x - blob.x;
    const dy = obs.y - blob.y;
    const dist = Math.sqrt(dx * dx + dy * dy) - obs.radius - blobRadius;

    if (dist < minObsDist && dist < 100) {
      minObsDist = dist;
      nearObstacle = { obs, dist };
    }
  }

  // Calculate threat level (0-1)
  const threatLevel = nearestThreat
    ? Math.max(0, 1 - nearestThreat.dist / visionRange) *
      Math.min(2, nearestThreat.blob.mass / blob.mass - 1)
    : 0;

  // Calculate opportunity level (0-1)
  const foodOpp = nearestFood ? Math.max(0, 1 - nearestFood.dist / visionRange) * 0.5 : 0;
  const preyOpp = nearestPrey ? Math.max(0, 1 - nearestPrey.dist / visionRange) * 0.8 : 0;
  const opportunityLevel = Math.max(foodOpp, preyOpp);

  // Energy level (mass-based)
  const energyLevel = Math.min(1, blob.mass / 60);

  // Can reproduce?
  const canReproduce = blob.age >= MIN_AGE_FOR_REPRODUCTION &&
    blob.mass >= REPRODUCTION_MIN_MASS &&
    (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION);

  // Near edge?
  const edgePadding = 100;
  const nearEdge = blob.x < edgePadding || blob.x > WORLD_WIDTH - edgePadding ||
    blob.y < edgePadding || blob.y > WORLD_HEIGHT - edgePadding;

  // Current movement
  const currentSpeed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
  const currentAngle = Math.atan2(blob.vy, blob.vx);

  return {
    nearestThreat,
    threatLevel,
    nearestPrey,
    nearestFood,
    opportunityLevel,
    energyLevel,
    canReproduce,
    isIdle: blob.idleTicks > 50,
    nearEdge,
    nearObstacle,
    currentSpeed,
    currentAngle
  };
}

// ===================== ANGLE UTILITIES =====================

/**
 * Calculate the smallest turn needed to face a target angle
 * Returns -1 to 1 (negative = turn left, positive = turn right)
 */
function calculateTurn(currentAngle: number, targetAngle: number): number {
  let diff = targetAngle - currentAngle;

  // Normalize to -PI to PI
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  // Normalize to -1 to 1
  return Math.max(-1, Math.min(1, diff / Math.PI));
}

/**
 * Get angle pointing away from a position
 */
function getFleeAngle(blobX: number, blobY: number, threatX: number, threatY: number): number {
  return Math.atan2(blobY - threatY, blobX - threatX);
}

/**
 * Get angle toward center of world
 */
function getAngleToCenter(blobX: number, blobY: number): number {
  return Math.atan2(WORLD_HEIGHT / 2 - blobY, WORLD_WIDTH / 2 - blobX);
}

// ===================== DECISION TREE =====================

/**
 * Main decision tree function
 * Returns heuristic suggestions based on situation
 */
export function getHeuristicDecision(
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  currentTick: number
): HeuristicOutput {
  const situation = assessSituation(blob, blobs, food, obstacles, currentTick);

  // ========== RULE 1: FLEE FROM IMMEDIATE THREAT ==========
  // Highest priority - survival instinct
  if (situation.threatLevel > 0.5 && situation.nearestThreat) {
    const fleeAngle = getFleeAngle(
      blob.x, blob.y,
      situation.nearestThreat.blob.x, situation.nearestThreat.blob.y
    );

    return {
      accelerate: 1.0,  // Full speed!
      turn: calculateTurn(situation.currentAngle, fleeAngle),
      reproduce: 0,
      confidence: Math.min(1, situation.threatLevel * 1.5),
      reason: 'FLEE: Immediate threat detected'
    };
  }

  // ========== RULE 2: AVOID OBSTACLES ==========
  if (situation.nearObstacle && situation.nearObstacle.dist < 50) {
    const obs = situation.nearObstacle.obs;
    const fleeAngle = getFleeAngle(blob.x, blob.y, obs.x, obs.y);

    return {
      accelerate: 0.5,
      turn: calculateTurn(situation.currentAngle, fleeAngle),
      reproduce: 0,
      confidence: Math.max(0.5, 1 - situation.nearObstacle.dist / 50),
      reason: 'AVOID: Obstacle nearby'
    };
  }

  // ========== RULE 3: AVOID EDGES ==========
  if (situation.nearEdge) {
    const centerAngle = getAngleToCenter(blob.x, blob.y);

    return {
      accelerate: 0.6,
      turn: calculateTurn(situation.currentAngle, centerAngle),
      reproduce: 0,
      confidence: 0.7,
      reason: 'EDGE: Moving toward center'
    };
  }

  // ========== RULE 4: CRITICALLY LOW ENERGY - SEEK FOOD ==========
  if (situation.energyLevel < 0.3 && situation.nearestFood) {
    return {
      accelerate: 0.8,
      turn: calculateTurn(situation.currentAngle, situation.nearestFood.angle),
      reproduce: 0,
      confidence: 0.8,
      reason: 'HUNGRY: Seeking food urgently'
    };
  }

  // ========== RULE 5: CHASE PREY WHEN ABLE ==========
  // Only if we're not starving and prey is nearby
  if (situation.energyLevel > 0.4 && situation.nearestPrey && situation.nearestPrey.dist < 150) {
    return {
      accelerate: 0.9,
      turn: calculateTurn(situation.currentAngle, situation.nearestPrey.angle),
      reproduce: 0,
      confidence: 0.6,
      reason: 'HUNT: Chasing smaller blob'
    };
  }

  // ========== RULE 6: REPRODUCE WHEN CONDITIONS ARE GOOD ==========
  if (situation.canReproduce &&
      situation.energyLevel > 0.6 &&
      situation.threatLevel < 0.2) {
    return {
      accelerate: 0.3,  // Slow down for reproduction
      turn: 0,
      reproduce: 1.0,
      confidence: 0.7,
      reason: 'REPRODUCE: Conditions favorable'
    };
  }

  // ========== RULE 7: SEEK FOOD (DEFAULT) ==========
  if (situation.nearestFood) {
    const urgency = 1 - situation.energyLevel;  // More hungry = more urgent

    return {
      accelerate: 0.5 + urgency * 0.3,
      turn: calculateTurn(situation.currentAngle, situation.nearestFood.angle),
      reproduce: situation.canReproduce ? 0.3 : 0,
      confidence: 0.4 + urgency * 0.3,
      reason: 'FORAGE: Seeking food'
    };
  }

  // ========== RULE 8: IDLE PENALTY - EXPLORE ==========
  if (situation.isIdle) {
    // Random direction to explore
    const exploreAngle = situation.currentAngle + (Math.random() - 0.5) * Math.PI;

    return {
      accelerate: 0.7,
      turn: calculateTurn(situation.currentAngle, exploreAngle),
      reproduce: 0,
      confidence: 0.5,
      reason: 'EXPLORE: Breaking idle state'
    };
  }

  // ========== DEFAULT: MAINTAIN COURSE ==========
  return {
    accelerate: 0.4,
    turn: 0,
    reproduce: situation.canReproduce ? 0.2 : 0,
    confidence: 0.2,
    reason: 'CRUISE: No urgent action needed'
  };
}

// ===================== HYBRID BLENDING =====================

/**
 * Blend neural network output with heuristic decision
 *
 * @param nnOutput - Raw neural network outputs [accel, turn, reproduce]
 * @param heuristic - Decision tree recommendations
 * @param blendFactor - How much to trust heuristics (0 = pure NN, 1 = pure heuristic)
 * @returns Blended outputs
 */
export function blendWithHeuristics(
  nnOutput: number[],
  heuristic: HeuristicOutput,
  blendFactor: number = 0.3
): number[] {
  // Adaptive blending: trust heuristics more when they're confident
  const adaptiveBlend = blendFactor * heuristic.confidence;
  const nnWeight = 1 - adaptiveBlend;
  const heuristicWeight = adaptiveBlend;

  return [
    // Acceleration: blend
    nnOutput[0] * nnWeight + heuristic.accelerate * heuristicWeight,

    // Turn: blend
    nnOutput[1] * nnWeight + heuristic.turn * heuristicWeight,

    // Reproduce: take max (if either wants to reproduce, try it)
    Math.max(nnOutput[2] * nnWeight, heuristic.reproduce * heuristicWeight)
  ];
}

// ===================== REWARD SHAPING =====================

/**
 * Calculate a bonus/penalty based on how well the blob followed good heuristics
 * This shapes the fitness landscape to reward "smart" behaviors
 */
export function calculateHeuristicReward(
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  actualAction: { accel: number; turn: number; reproduce: number },
  currentTick: number
): number {
  const heuristic = getHeuristicDecision(blob, blobs, food, obstacles, currentTick);

  // Only reward when heuristic is confident
  if (heuristic.confidence < 0.5) return 0;

  let reward = 0;

  // Reward for following flee advice
  if (heuristic.reason.startsWith('FLEE')) {
    const followedAdvice = actualAction.accel > 0.5 &&
      Math.abs(actualAction.turn - heuristic.turn) < 0.5;
    reward += followedAdvice ? 2 : -1;
  }

  // Reward for following food-seeking advice when hungry
  if (heuristic.reason.startsWith('HUNGRY')) {
    const followedAdvice = Math.abs(actualAction.turn - heuristic.turn) < 0.3;
    reward += followedAdvice ? 1 : -0.5;
  }

  // Small reward for exploring when idle
  if (heuristic.reason.startsWith('EXPLORE')) {
    reward += actualAction.accel > 0.3 ? 0.5 : -0.3;
  }

  return reward;
}

// ===================== SIMPLIFIED INTEGRATION =====================

/**
 * Get heuristic-enhanced outputs for blob simulation
 *
 * Usage in simulation:
 * 1. Get NN outputs: const nnOutputs = blob.genome.activate(inputs);
 * 2. Get heuristic: const enhanced = getEnhancedOutputs(blob, blobs, food, obstacles, nnOutputs, tick);
 * 3. Use enhanced outputs instead of raw NN outputs
 */
export function getEnhancedOutputs(
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  nnOutputs: number[],
  currentTick: number,
  blendFactor: number = 0.25  // Default: 25% heuristic influence
): { outputs: number[]; heuristic: HeuristicOutput } {
  const heuristic = getHeuristicDecision(blob, blobs, food, obstacles, currentTick);
  const outputs = blendWithHeuristics(nnOutputs, heuristic, blendFactor);

  return { outputs, heuristic };
}
