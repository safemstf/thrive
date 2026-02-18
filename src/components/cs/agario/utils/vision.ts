// src/components/cs/agario/utils/vision.ts
// GRADIENT-BASED VISION SYSTEM
//
// Philosophy: Instead of 8 directional rays with multiple signals each (40 inputs),
// we compute weighted GRADIENTS that encode direction naturally.
//
// This is how bacteria navigate (chemotaxis) - they sense concentration gradients
// and move accordingly. Much simpler and faster to evolve!
//
// ENHANCED: Now includes velocity/momentum inputs for prediction

import { Blob, Food, Obstacle, TerrainBarrier } from '../config/agario.types';
import { VISION_RANGE } from '../config/agario.constants';

// Precompute constants
const VISION_RANGE_SQ = VISION_RANGE * VISION_RANGE;
const INV_VISION_RANGE = 1 / VISION_RANGE;

/**
 * ENHANCED GRADIENT VISION SYSTEM - 12 INPUTS TOTAL
 *
 * Sensory Inputs (6 - spatial):
 *   0. attraction_dx  (-1 to 1): X direction toward food/prey
 *   1. attraction_dy  (-1 to 1): Y direction toward food/prey
 *   2. attraction_strength (0 to 1): How much food/prey nearby
 *   3. danger_dx      (-1 to 1): X direction of danger (threats + obstacles + walls)
 *   4. danger_dy      (-1 to 1): Y direction of danger
 *   5. danger_strength (0 to 1): How urgent is the danger
 *
 * Velocity Inputs (2 - temporal/predictive):
 *   6. threat_approach_rate (-1 to 1): Are threats approaching (-1) or retreating (+1)?
 *   7. prey_approach_rate (-1 to 1): Are prey approaching (+1) or fleeing (-1)?
 *
 * State Inputs (4):
 *   8. mass_normalized (0 to 1): How big am I (log scale)
 *   9. reproduction_ready (0 to 1): Can I reproduce
 *  10. my_speed (0 to 1): How fast am I moving
 *  11. my_heading_alignment (-1 to 1): Am I facing toward attraction or danger?
 *
 * Benefits:
 *   - Velocity inputs enable PREDICTION (key for intelligence!)
 *   - Can distinguish approaching threat from stationary one
 *   - Can track if prey is fleeing or unaware
 *   - Speed awareness helps with energy management
 *   - Heading alignment helps with course correction
 */
export const getVision = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  currentTick: number,
  worldWidth: number,
  worldHeight: number,
  barriers: TerrainBarrier[] = []  // Non-lethal terrain to sense as soft danger
): number[] => {

  // === ATTRACTION GRADIENT (food + prey) ===
  let attractionX = 0;
  let attractionY = 0;
  let attractionTotal = 0;

  // === DANGER GRADIENT (threats + obstacles + walls) ===
  let dangerX = 0;
  let dangerY = 0;
  let dangerTotal = 0;

  // === VELOCITY-BASED INPUTS (for prediction) ===
  let threatApproachSum = 0;
  let threatWeightSum = 0;
  let preyApproachSum = 0;
  let preyWeightSum = 0;

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

    // === VELOCITY ANALYSIS ===
    // Calculate relative velocity (positive = approaching, negative = retreating)
    const relVelX = other.vx - blob.vx;
    const relVelY = other.vy - blob.vy;
    // Dot product with direction vector: positive = approaching
    const approachRate = (relVelX * ndx + relVelY * ndy);
    // Normalize to [-1, 1] range
    const normalizedApproach = Math.tanh(approachRate * 0.5);

    if (massRatio > 1.15) {
      // THREAT: They can eat us - add to danger gradient
      // Bigger threat = stronger danger signal
      const threatLevel = Math.min((massRatio - 1) * 2, 1);
      const weight = proximity * (0.5 + threatLevel * 0.5) * other.mass * 0.1;

      // Danger points TOWARD the threat (we'll flee opposite direction)
      dangerX += ndx * weight;
      dangerY += ndy * weight;
      dangerTotal += weight;

      // Track threat approach rate (approaching = more urgent!)
      threatApproachSum += normalizedApproach * weight;
      threatWeightSum += weight;
    }
    else if (massRatio < 0.87) {
      // PREY: We can eat them - add to attraction gradient
      const preyValue = Math.min((1 / massRatio - 1) * 0.5, 1);
      const weight = proximity * (0.5 + preyValue * 0.5) * other.mass * 0.5;

      attractionX += ndx * weight;
      attractionY += ndy * weight;
      attractionTotal += weight;

      // Track prey approach rate (fleeing = harder to catch)
      preyApproachSum += normalizedApproach * weight;
      preyWeightSum += weight;
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

    // Moving obstacles: check if it has velocity
    const obsVx = (obs as any).vx || 0;
    const obsVy = (obs as any).vy || 0;
    if (obsVx !== 0 || obsVy !== 0) {
      const relVelX = obsVx - blob.vx;
      const relVelY = obsVy - blob.vy;
      const approachRate = (relVelX * (dx / dist) + relVelY * (dy / dist));
      const normalizedApproach = Math.tanh(approachRate * 0.5);
      threatApproachSum += normalizedApproach * weight;
      threatWeightSum += weight;
    }
  }

  // --- TERRAIN BARRIER DANGER ---
  // Non-lethal barriers (mountains, ridges, reefs) create navigation challenges
  // Blobs sense them as "soft danger" to encourage routing around them
  for (const barrier of barriers) {
    // Quick bounding box distance check
    const barrierCenterX = (barrier.minX + barrier.maxX) / 2;
    const barrierCenterY = (barrier.minY + barrier.maxY) / 2;
    const barrierRadius = Math.max(
      barrier.maxX - barrier.minX,
      barrier.maxY - barrier.minY
    ) / 2;

    const dx = barrierCenterX - blob.x;
    const dy = barrierCenterY - blob.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveDist = Math.max(1, dist - barrierRadius);

    if (effectiveDist > VISION_RANGE) continue;

    // Closer = more significant (but less urgent than lethal obstacles)
    // Using gentler falloff since barriers are non-lethal
    const proximity = Math.pow(1 - effectiveDist * INV_VISION_RANGE, 1.2);
    // Barrier danger is weaker than obstacle danger (0.25 vs 0.5)
    // This creates a "preference to avoid" without panic
    const weight = proximity * barrierRadius * 0.25;

    // Danger points toward barrier center
    if (dist > 1) {
      dangerX += (dx / dist) * weight;
      dangerY += (dy / dist) * weight;
      dangerTotal += weight;
    }
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

  // === VELOCITY INPUTS ===
  // Threat approach: positive = threats are approaching, negative = retreating
  const threatApproach = threatWeightSum > 0.01
    ? threatApproachSum / threatWeightSum
    : 0;

  // Prey approach: positive = prey approaching us, negative = fleeing
  const preyApproach = preyWeightSum > 0.01
    ? preyApproachSum / preyWeightSum
    : 0;

  // === STATE INPUTS ===

  // Mass (log scale for better range)
  const massNormalized = Math.min(Math.log10(blob.mass + 1) / 2.5, 1);

  // Reproduction readiness
  const reproductionCooldown = 200; // Should match REPRODUCTION_COOLDOWN
  const reproReady = Math.min((currentTick - (blob.lastReproductionTick || 0)) / reproductionCooldown, 1);

  // My current speed (normalized)
  const mySpeed = Math.min(Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy) / 5, 1);

  // Heading alignment: am I facing toward the most important thing?
  // Positive = facing attraction, negative = facing danger
  let headingAlignment = 0;
  if (mySpeed > 0.1) {
    const headingX = blob.vx / (mySpeed * 5);
    const headingY = blob.vy / (mySpeed * 5);

    // If attraction is stronger, check alignment with attraction
    // If danger is stronger, check alignment AWAY from danger
    if (attrStrength > dangStrength && attrStrength > 0.1) {
      headingAlignment = headingX * attrDx + headingY * attrDy;
    } else if (dangStrength > 0.1) {
      // We want to be facing AWAY from danger, so negate
      headingAlignment = -(headingX * dangDx + headingY * dangDy);
    }
  }

  // === RETURN 12 INPUTS ===
  return [
    attrDx,           // 0: Attraction direction X (-1 to 1)
    attrDy,           // 1: Attraction direction Y (-1 to 1)
    attrStrength,     // 2: Attraction strength (0 to 1)
    dangDx,           // 3: Danger direction X (-1 to 1)
    dangDy,           // 4: Danger direction Y (-1 to 1)
    dangStrength,     // 5: Danger strength (0 to 1)
    threatApproach,   // 6: Threat approach rate (-1 to 1) - PREDICTIVE
    preyApproach,     // 7: Prey approach rate (-1 to 1) - PREDICTIVE
    massNormalized,   // 8: Mass awareness (0 to 1)
    reproReady,       // 9: Reproduction readiness (0 to 1)
    mySpeed,          // 10: My current speed (0 to 1)
    headingAlignment  // 11: Am I facing the right direction? (-1 to 1)
  ];
};

// Input labels for neural net visualization
export const VISION_INPUT_LABELS = [
  'AttrX',      // 0: Attraction direction X
  'AttrY',      // 1: Attraction direction Y
  'AttrStr',    // 2: Attraction strength
  'DangX',      // 3: Danger direction X
  'DangY',      // 4: Danger direction Y
  'DangStr',    // 5: Danger strength
  'ThreatVel',  // 6: Threat approach rate (PREDICTIVE!)
  'PreyVel',    // 7: Prey approach rate (PREDICTIVE!)
  'Mass',       // 8: Mass awareness
  'Repro',      // 9: Reproduction readiness
  'Speed',      // 10: My current speed
  'Heading'     // 11: Heading alignment
];

// Export for backwards compatibility during transition
export const getVisionGradient = getVision;
