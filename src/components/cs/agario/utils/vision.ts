// src/components/cs/agario/utils/vision.ts
// GRADIENT-BASED VISION SYSTEM
//
// Philosophy: Instead of 8 directional rays with multiple signals each (40 inputs),
// we compute weighted GRADIENTS that encode direction naturally.
//
// This is how bacteria navigate (chemotaxis) - they sense concentration gradients
// and move accordingly. Much simpler and faster to evolve!

import { Blob, Food, Obstacle } from '../config/agario.types';
import { VISION_RANGE } from '../config/agario.constants';

// Precompute constants
const VISION_RANGE_SQ = VISION_RANGE * VISION_RANGE;
const INV_VISION_RANGE = 1 / VISION_RANGE;

/**
 * GRADIENT VISION SYSTEM - 8 INPUTS TOTAL
 *
 * Sensory Inputs (6):
 *   0. attraction_dx  (-1 to 1): X direction toward food/prey
 *   1. attraction_dy  (-1 to 1): Y direction toward food/prey
 *   2. attraction_strength (0 to 1): How much food/prey nearby
 *   3. danger_dx      (-1 to 1): X direction of danger (threats + obstacles + walls)
 *   4. danger_dy      (-1 to 1): Y direction of danger
 *   5. danger_strength (0 to 1): How urgent is the danger
 *
 * State Inputs (2):
 *   6. mass_normalized (0 to 1): How big am I (log scale)
 *   7. reproduction_ready (0 to 1): Can I reproduce
 *
 * Benefits:
 *   - Direction is encoded in the SIGN of dx/dy (no need for 8 separate rays)
 *   - Walls, obstacles, and threats all contribute to ONE danger gradient
 *   - 8 inputs vs 40 = 5x fewer connections = much faster evolution
 *   - Can use larger VISION_RANGE (400+) with better performance
 */
export const getVision = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  currentTick: number,
  worldWidth: number,
  worldHeight: number
): number[] => {

  // === ATTRACTION GRADIENT (food + prey) ===
  let attractionX = 0;
  let attractionY = 0;
  let attractionTotal = 0;

  // === DANGER GRADIENT (threats + obstacles + walls) ===
  let dangerX = 0;
  let dangerY = 0;
  let dangerTotal = 0;

  // --- FOOD ATTRACTION ---
  const nearbyFood = getNearbyFood(blob.x, blob.y, VISION_RANGE);
  for (const f of nearbyFood) {
    const dx = f.x - blob.x;
    const dy = f.y - blob.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > VISION_RANGE_SQ || distSq < 1) continue;

    const dist = Math.sqrt(distSq);
    // Closer food = stronger pull (inverse square falloff)
    const weight = Math.pow(1 - dist * INV_VISION_RANGE, 2) * f.mass;

    // Normalize direction and weight it
    attractionX += (dx / dist) * weight;
    attractionY += (dy / dist) * weight;
    attractionTotal += weight;
  }

  // --- BLOB DETECTION (prey vs threat) ---
  for (const other of blobs) {
    if (other.id === blob.id) continue;

    // Skip family members (they're neutral)
    if (other.familyLineage === blob.familyLineage) continue;

    const dx = other.x - blob.x;
    const dy = other.y - blob.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > VISION_RANGE_SQ || distSq < 1) continue;

    const dist = Math.sqrt(distSq);
    const proximity = Math.pow(1 - dist * INV_VISION_RANGE, 2);
    const massRatio = other.mass / blob.mass;

    // Normalize direction
    const ndx = dx / dist;
    const ndy = dy / dist;

    if (massRatio > 1.15) {
      // THREAT: They can eat us - add to danger gradient
      // Bigger threat = stronger danger signal
      const threatLevel = Math.min((massRatio - 1) * 2, 1);
      const weight = proximity * (0.5 + threatLevel * 0.5) * other.mass * 0.1;

      // Danger points TOWARD the threat (we'll flee opposite direction)
      dangerX += ndx * weight;
      dangerY += ndy * weight;
      dangerTotal += weight;
    }
    else if (massRatio < 0.87) {
      // PREY: We can eat them - add to attraction gradient
      const preyValue = Math.min((1 / massRatio - 1) * 0.5, 1);
      const weight = proximity * (0.5 + preyValue * 0.5) * other.mass * 0.5;

      attractionX += ndx * weight;
      attractionY += ndy * weight;
      attractionTotal += weight;
    }
    // Similar size = neutral, ignore
  }

  // --- OBSTACLE DANGER ---
  for (const obs of obstacles) {
    const dx = obs.x - blob.x;
    const dy = obs.y - blob.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveDist = Math.max(1, dist - obs.radius);

    if (effectiveDist > VISION_RANGE) continue;

    // Closer = more dangerous (exponential falloff for obstacles)
    const proximity = Math.pow(1 - effectiveDist * INV_VISION_RANGE, 1.5);
    const weight = proximity * obs.radius * 0.5; // Bigger obstacles = more danger

    // Danger points toward obstacle
    dangerX += (dx / dist) * weight;
    dangerY += (dy / dist) * weight;
    dangerTotal += weight;
  }

  // --- WALL DANGER ---
  // Walls are sensed as danger gradients pointing TOWARD the wall
  const wallProximityRange = Math.min(VISION_RANGE, 200);

  // North wall (y = 0)
  if (blob.y < wallProximityRange) {
    const proximity = Math.pow(1 - blob.y / wallProximityRange, 2);
    const weight = proximity * 50;
    dangerY -= weight; // Danger points toward wall (negative Y)
    dangerTotal += weight;
  }

  // South wall (y = worldHeight)
  if (blob.y > worldHeight - wallProximityRange) {
    const proximity = Math.pow(1 - (worldHeight - blob.y) / wallProximityRange, 2);
    const weight = proximity * 50;
    dangerY += weight; // Danger points toward wall (positive Y)
    dangerTotal += weight;
  }

  // West wall (x = 0)
  if (blob.x < wallProximityRange) {
    const proximity = Math.pow(1 - blob.x / wallProximityRange, 2);
    const weight = proximity * 50;
    dangerX -= weight; // Danger points toward wall (negative X)
    dangerTotal += weight;
  }

  // East wall (x = worldWidth)
  if (blob.x > worldWidth - wallProximityRange) {
    const proximity = Math.pow(1 - (worldWidth - blob.x) / wallProximityRange, 2);
    const weight = proximity * 50;
    dangerX += weight; // Danger points toward wall (positive X)
    dangerTotal += weight;
  }

  // === NORMALIZE GRADIENTS ===

  // Attraction gradient: normalize to [-1, 1] range
  let attrDx = 0, attrDy = 0, attrStrength = 0;
  if (attractionTotal > 0.01) {
    const attrMag = Math.sqrt(attractionX * attractionX + attractionY * attractionY);
    if (attrMag > 0.01) {
      attrDx = attractionX / attrMag; // Unit direction
      attrDy = attractionY / attrMag;
    }
    // Strength is normalized by a reasonable max value
    attrStrength = Math.min(attractionTotal / 100, 1);
  }

  // Danger gradient: normalize to [-1, 1] range
  let dangDx = 0, dangDy = 0, dangStrength = 0;
  if (dangerTotal > 0.01) {
    const dangMag = Math.sqrt(dangerX * dangerX + dangerY * dangerY);
    if (dangMag > 0.01) {
      dangDx = dangerX / dangMag; // Unit direction
      dangDy = dangerY / dangMag;
    }
    dangStrength = Math.min(dangerTotal / 100, 1);
  }

  // === STATE INPUTS ===

  // Mass (log scale for better range)
  const massNormalized = Math.min(Math.log10(blob.mass + 1) / 2.5, 1);

  // Reproduction readiness
  const reproductionCooldown = 200; // Should match REPRODUCTION_COOLDOWN
  const reproReady = Math.min((currentTick - (blob.lastReproductionTick || 0)) / reproductionCooldown, 1);

  // === RETURN 8 INPUTS ===
  return [
    attrDx,        // 0: Attraction direction X (-1 to 1)
    attrDy,        // 1: Attraction direction Y (-1 to 1)
    attrStrength,  // 2: Attraction strength (0 to 1)
    dangDx,        // 3: Danger direction X (-1 to 1)
    dangDy,        // 4: Danger direction Y (-1 to 1)
    dangStrength,  // 5: Danger strength (0 to 1)
    massNormalized, // 6: Mass awareness (0 to 1)
    reproReady     // 7: Reproduction readiness (0 to 1)
  ];
};

// Input labels for neural net visualization
export const VISION_INPUT_LABELS = [
  'AttrX',   // Attraction direction X
  'AttrY',   // Attraction direction Y
  'AttrStr', // Attraction strength
  'DangX',   // Danger direction X
  'DangY',   // Danger direction Y
  'DangStr', // Danger strength
  'Mass',    // Mass awareness
  'Repro'    // Reproduction readiness
];

// Export for backwards compatibility during transition
export const getVisionGradient = getVision;
