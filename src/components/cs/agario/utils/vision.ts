// src/components/cs/agario/utils/vision-enhanced.ts
import { Blob, Food, Obstacle } from '../config/agario.types';
import { VISION_RANGE, REPRODUCTION_COOLDOWN } from '../config/agario.constants';

// Precompute constants
const VISION_RANGE_SQ = VISION_RANGE * VISION_RANGE;
const INV_VISION_RANGE = 1 / VISION_RANGE;

// 8 directional rays (45° apart)
const VISION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315].map(angle => ({
  angle,
  rad: (angle * Math.PI) / 180,
  dx: Math.cos((angle * Math.PI) / 180),
  dy: Math.sin((angle * Math.PI) / 180)
}));

interface VisionRayData {
  foodSignal: number;      // 0-1: closeness of food
  threatSignal: number;    // 0-1: danger level (bigger blob)
  preySignal: number;      // 0-1: opportunity (smaller blob)
  obstacleSignal: number;  // 0-1: wall/obstacle proximity
}

/**
 * ENHANCED VISION SYSTEM
 * 
 * Input design philosophy:
 * - Each ray returns 4 signals (food, threat, prey, obstacle)
 * - Separate channels avoid signal interference
 * - All normalized to [0, 1] or [-1, 1] ranges
 * - Distance-weighted signals (closer = stronger)
 */
export const getVisionEnhanced = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  currentTick: number,
  worldWidth: number,
  worldHeight: number
): number[] => {
  // === 32 directional inputs (8 rays × 4 signals each) ===
  const rayData: VisionRayData[] = new Array(8).fill(null).map(() => ({
    foodSignal: 0,
    threatSignal: 0,
    preySignal: 0,
    obstacleSignal: 0
  }));

  // Process each direction
  for (let i = 0; i < VISION_ANGLES.length; i++) {
    const { dx, dy } = VISION_ANGLES[i];
    
    let closestFood = VISION_RANGE_SQ;
    let closestThreat = VISION_RANGE_SQ;
    let closestPrey = VISION_RANGE_SQ;
    let closestObstacle = VISION_RANGE_SQ;

    // === FOOD DETECTION ===
    const nearbyFood = getNearbyFood(blob.x, blob.y, VISION_RANGE);
    for (const f of nearbyFood) {
      const fdx = f.x - blob.x;
      const fdy = f.y - blob.y;
      const distSq = fdx * fdx + fdy * fdy;

      if (distSq > VISION_RANGE_SQ) continue;

      const dot = fdx * dx + fdy * dy;
      if (dot <= 0) continue;

      const dist = Math.sqrt(distSq);
      const cosAngle = dot / (dist + 0.001);

      if (cosAngle > 0.7 && distSq < closestFood) {
        closestFood = distSq;
        // Exponential falloff: closer food = much stronger signal
        rayData[i].foodSignal = Math.pow(1 - dist * INV_VISION_RANGE, 2);
      }
    }

    // === BLOB DETECTION (Threats vs Prey) ===
    for (const other of blobs) {
      if (other.id === blob.id) continue;

      const bdx = other.x - blob.x;
      const bdy = other.y - blob.y;
      const distSq = bdx * bdx + bdy * bdy;

      if (distSq > VISION_RANGE_SQ) continue;

      const dot = bdx * dx + bdy * dy;
      if (dot <= 0) continue;

      const dist = Math.sqrt(distSq);
      const cosAngle = dot / (dist + 0.001);

      if (cosAngle > 0.65) {
        const massRatio = other.mass / blob.mass;
        const proximity = Math.pow(1 - dist * INV_VISION_RANGE, 2);

        // THREAT: Can eat us (>15% bigger)
        if (massRatio > 1.15) {
          if (distSq < closestThreat) {
            closestThreat = distSq;
            // Stronger signal for bigger threats, closer = MORE urgent
            const threatLevel = Math.min((massRatio - 1) * 2, 1);
            rayData[i].threatSignal = proximity * (0.5 + threatLevel * 0.5);
          }
        }
        // PREY: We can eat them (<87% of our size)
        else if (massRatio < 0.87) {
          if (distSq < closestPrey) {
            closestPrey = distSq;
            // Stronger signal for much smaller prey
            const preyValue = Math.min((1 / massRatio - 1) * 0.5, 1);
            rayData[i].preySignal = proximity * (0.5 + preyValue * 0.5);
          }
        }
        // NEUTRAL: Similar size - very weak signals
        else {
          const neutralProximity = proximity * 0.2;
          if (massRatio > 1.0) {
            rayData[i].threatSignal = Math.max(rayData[i].threatSignal, neutralProximity);
          } else {
            rayData[i].preySignal = Math.max(rayData[i].preySignal, neutralProximity);
          }
        }
      }
    }

    // === OBSTACLE DETECTION ===
    for (const obs of obstacles) {
      const odx = obs.x - blob.x;
      const ody = obs.y - blob.y;
      const distSq = odx * odx + ody * ody;
      const dist = Math.sqrt(distSq);
      const effectiveDist = Math.max(0, dist - obs.radius);
      const effectiveDistSq = effectiveDist * effectiveDist;

      if (effectiveDistSq > VISION_RANGE_SQ) continue;

      const dot = odx * dx + ody * dy;
      if (dot <= 0) continue;

      const cosAngle = dot / (dist + 0.001);

      if (cosAngle > 0.6 && effectiveDistSq < closestObstacle) {
        closestObstacle = effectiveDistSq;
        rayData[i].obstacleSignal = Math.pow(1 - effectiveDist * INV_VISION_RANGE, 1.5);
      }
    }
  }

  // === FLATTEN RAY DATA INTO INPUT ARRAY ===
  const visionInputs: number[] = [];
  for (const ray of rayData) {
    visionInputs.push(
      ray.foodSignal,
      ray.threatSignal,
      ray.preySignal,
      ray.obstacleSignal
    );
  }

  // === STATE INPUTS (8 additional inputs) ===
  const stateInputs = [
    // 1. Mass (log scale for better range)
    Math.min(Math.log10(blob.mass + 1) / 2, 1),
    
    // 2. Speed magnitude (normalized)
    Math.min(Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy) / 8, 1),
    
    // 3. Energy efficiency (mass gained per distance traveled)
    // Requires tracking - for now use mass growth rate
    Math.tanh(blob.mass / 100 - 0.5), // -1 to 1
    
    // 4. Reproduction readiness
    Math.min((currentTick - blob.lastReproductionTick) / REPRODUCTION_COOLDOWN, 1),
    
    // 5-8. Directional wall proximity (N, E, S, W)
    Math.max(0, 1 - blob.y / 200),                    // North wall
    Math.max(0, 1 - (worldWidth - blob.x) / 200),    // East wall  
    Math.max(0, 1 - (worldHeight - blob.y) / 200),   // South wall
    Math.max(0, 1 - blob.x / 200)                     // West wall
  ];

  return [...visionInputs, ...stateInputs];
};

/**
 * COMPACT VERSION: Fewer inputs for faster evolution
 * 
 * 8 rays × 2 signals = 16 vision inputs
 * 6 state inputs
 * Total: 22 inputs (vs 40 in enhanced version)
 */
export const getVisionCompact = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  currentTick: number,
  worldWidth: number,
  worldHeight: number
): number[] => {
  const rays = new Array(8).fill(null).map(() => ({
    attractiveSignal: 0,  // Food + Prey (things to chase)
    repulsiveSignal: 0    // Threats + Obstacles (things to avoid)
  }));

  for (let i = 0; i < VISION_ANGLES.length; i++) {
    const { dx, dy } = VISION_ANGLES[i];
    
    let bestAttraction = 0;
    let bestRepulsion = 0;
    let closestAttractionDistSq = VISION_RANGE_SQ;
    let closestRepulsionDistSq = VISION_RANGE_SQ;

    // FOOD (always attractive)
    const nearbyFood = getNearbyFood(blob.x, blob.y, VISION_RANGE);
    for (const f of nearbyFood) {
      const fdx = f.x - blob.x;
      const fdy = f.y - blob.y;
      const distSq = fdx * fdx + fdy * fdy;

      if (distSq > VISION_RANGE_SQ) continue;

      const dot = fdx * dx + fdy * dy;
      if (dot <= 0) continue;

      const dist = Math.sqrt(distSq);
      const cosAngle = dot / (dist + 0.001);

      if (cosAngle > 0.7 && distSq < closestAttractionDistSq) {
        closestAttractionDistSq = distSq;
        bestAttraction = Math.pow(1 - dist * INV_VISION_RANGE, 2) * 0.8;
      }
    }

    // BLOBS (attractive if prey, repulsive if threat)
    for (const other of blobs) {
      if (other.id === blob.id) continue;

      const bdx = other.x - blob.x;
      const bdy = other.y - blob.y;
      const distSq = bdx * bdx + bdy * bdy;

      if (distSq > VISION_RANGE_SQ) continue;

      const dot = bdx * dx + bdy * dy;
      if (dot <= 0) continue;

      const dist = Math.sqrt(distSq);
      const cosAngle = dot / (dist + 0.001);

      if (cosAngle > 0.65) {
        const massRatio = other.mass / blob.mass;
        const proximity = Math.pow(1 - dist * INV_VISION_RANGE, 2);

        if (massRatio > 1.15) {
          // THREAT
          if (distSq < closestRepulsionDistSq) {
            closestRepulsionDistSq = distSq;
            const threatLevel = Math.min((massRatio - 1) * 2, 1);
            bestRepulsion = proximity * (0.6 + threatLevel * 0.4);
          }
        } else if (massRatio < 0.87) {
          // PREY
          if (distSq < closestAttractionDistSq) {
            closestAttractionDistSq = distSq;
            const preyValue = Math.min((1 / massRatio - 1) * 0.5, 1);
            bestAttraction = Math.max(bestAttraction, proximity * (0.6 + preyValue * 0.4));
          }
        }
      }
    }

    // OBSTACLES (always repulsive)
    for (const obs of obstacles) {
      const odx = obs.x - blob.x;
      const ody = obs.y - blob.y;
      const dist = Math.sqrt(odx * odx + ody * ody);
      const effectiveDist = Math.max(0, dist - obs.radius);
      const effectiveDistSq = effectiveDist * effectiveDist;

      if (effectiveDistSq > VISION_RANGE_SQ) continue;

      const dot = odx * dx + ody * dy;
      if (dot <= 0) continue;

      const cosAngle = dot / (dist + 0.001);

      if (cosAngle > 0.6 && effectiveDistSq < closestRepulsionDistSq) {
        closestRepulsionDistSq = effectiveDistSq;
        bestRepulsion = Math.max(bestRepulsion, Math.pow(1 - effectiveDist * INV_VISION_RANGE, 1.5));
      }
    }

    rays[i].attractiveSignal = bestAttraction;
    rays[i].repulsiveSignal = bestRepulsion;
  }

  // Flatten vision
  const visionInputs: number[] = [];
  for (const ray of rays) {
    visionInputs.push(ray.attractiveSignal, ray.repulsiveSignal);
  }

  // State inputs (6 total)
  const stateInputs = [
    // Mass (log scale)
    Math.min(Math.log10(blob.mass + 1) / 2, 1),
    
    // Speed
    Math.min(Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy) / 8, 1),
    
    // Reproduction readiness
    Math.min((currentTick - blob.lastReproductionTick) / REPRODUCTION_COOLDOWN, 1),
    
    // Wall danger (minimum distance to any wall)
    Math.max(0, 1 - Math.min(blob.x, blob.y, worldWidth - blob.x, worldHeight - blob.y) / 200)
  ];

  return [...visionInputs, ...stateInputs];
};

/**
 * MINIMAL VERSION: Absolute minimum for basic behavior
 * 
 * 8 rays × 1 combined signal = 8 vision inputs
 * 4 state inputs  
 * Total: 12 inputs (fastest evolution, good enough for simple scenarios)
 */
export const getVisionMinimal = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  currentTick: number,
  worldWidth: number,
  worldHeight: number
): number[] => {
  const rays = new Array(8).fill(0);

  for (let i = 0; i < VISION_ANGLES.length; i++) {
    const { dx, dy } = VISION_ANGLES[i];
    
    let signal = 0;
    let closestDistSq = VISION_RANGE_SQ;

    // Priority: Threats > Prey > Food > Obstacles
    
    // Check threats first (most important)
    for (const other of blobs) {
      if (other.id === blob.id) continue;
      
      const bdx = other.x - blob.x;
      const bdy = other.y - blob.y;
      const distSq = bdx * bdx + bdy * bdy;
      
      if (distSq > VISION_RANGE_SQ) continue;
      
      const dot = bdx * dx + bdy * dy;
      if (dot <= 0) continue;
      
      const dist = Math.sqrt(distSq);
      const cosAngle = dot / (dist + 0.001);
      
      if (cosAngle > 0.65) {
        const massRatio = other.mass / blob.mass;
        
        if (massRatio > 1.15 && distSq < closestDistSq) {
          // THREAT: negative signal
          closestDistSq = distSq;
          const proximity = 1 - dist * INV_VISION_RANGE;
          const threatLevel = Math.min((massRatio - 1) * 1.5, 1);
          signal = -proximity * (0.7 + threatLevel * 0.3);
        } else if (massRatio < 0.87 && distSq < closestDistSq && signal >= 0) {
          // PREY: positive signal (only if no threat)
          closestDistSq = distSq;
          const proximity = 1 - dist * INV_VISION_RANGE;
          signal = proximity * 0.6;
        }
      }
    }

    // Food (only if no blob detected)
    if (signal === 0) {
      const nearbyFood = getNearbyFood(blob.x, blob.y, VISION_RANGE);
      for (const f of nearbyFood) {
        const fdx = f.x - blob.x;
        const fdy = f.y - blob.y;
        const distSq = fdx * fdx + fdy * fdy;
        
        if (distSq > VISION_RANGE_SQ) continue;
        
        const dot = fdx * dx + fdy * dy;
        if (dot <= 0) continue;
        
        const dist = Math.sqrt(distSq);
        const cosAngle = dot / (dist + 0.001);
        
        if (cosAngle > 0.7 && distSq < closestDistSq) {
          closestDistSq = distSq;
          signal = (1 - dist * INV_VISION_RANGE) * 0.5;
        }
      }
    }

    // Obstacles (only if nothing else detected)
    if (signal === 0) {
      for (const obs of obstacles) {
        const odx = obs.x - blob.x;
        const ody = obs.y - blob.y;
        const dist = Math.sqrt(odx * odx + ody * ody);
        const effectiveDist = Math.max(0, dist - obs.radius);
        
        if (effectiveDist > VISION_RANGE) continue;
        
        const dot = odx * dx + ody * dy;
        if (dot <= 0) continue;
        
        const cosAngle = dot / (dist + 0.001);
        
        if (cosAngle > 0.6) {
          signal = -(1 - effectiveDist * INV_VISION_RANGE) * 0.4;
        }
      }
    }

    rays[i] = signal;
  }

  // State inputs (4 total)
  const stateInputs = [
    Math.min(Math.log10(blob.mass + 1) / 2, 1),
    Math.min((currentTick - blob.lastReproductionTick) / REPRODUCTION_COOLDOWN, 1),
    Math.max(0, 1 - Math.min(blob.x, blob.y, worldWidth - blob.x, worldHeight - blob.y) / 200),
    Math.min(blob.idleTicks / 150, 1) // Idleness penalty
  ];

  return [...rays, ...stateInputs];
};

// Export versions with clear names
export const getVision40Input = getVisionEnhanced;  // 40 inputs (8×4 + 8)
export const getVision20Input = getVisionCompact;   // 20 inputs (8×2 + 4)  ← RECOMMENDED
export const getVision12Input = getVisionMinimal;   // 12 inputs (8×1 + 4)

// Default export: Compact version (best balance)
export const getVision = getVisionCompact;