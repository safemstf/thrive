// src/components/cs/agario/vision.ts

import { Blob, Food, Obstacle } from '../config/agario.types';
import { VISION_RANGE, REPRODUCTION_COOLDOWN } from '../config/agario.constants';

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
  const INPUT_SIZE = 14;
  const inputs = new Array(INPUT_SIZE).fill(0);
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  angles.forEach((angle, i) => {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    let bestSignal = 0;
    let closestDist = VISION_RANGE;

    // Check food
    const nearbyFood = getNearbyFood(blob.x, blob.y, VISION_RANGE);
    for (const f of nearbyFood) {
      const fdx = f.x - blob.x;
      const fdy = f.y - blob.y;
      const dist = Math.sqrt(fdx * fdx + fdy * fdy);
      if (dist > VISION_RANGE) continue;

      const dot = fdx * dx + fdy * dy;
      if (dot > 0) {
        const cosAngle = dot / (dist + 0.001);
        if (cosAngle > 0.7 && dist < closestDist) {
          closestDist = dist;
          bestSignal = 0.5 * (1 - dist / VISION_RANGE);
        }
      }
    }

    // Check obstacles
    for (const obs of obstacles) {
      const odx = obs.x - blob.x;
      const ody = obs.y - blob.y;
      const dist = Math.sqrt(odx * odx + ody * ody);
      const effectiveDist = dist - obs.radius;
      if (effectiveDist > VISION_RANGE) continue;

      const dot = odx * dx + ody * dy;
      if (dot > 0) {
        const cosAngle = dot / (dist + 0.001);
        if (cosAngle > 0.6 && effectiveDist < closestDist) {
          closestDist = Math.max(0, effectiveDist);
          bestSignal = -1.0 * (1 - closestDist / VISION_RANGE);
        }
      }
    }
    
    // Check other blobs
    if (Math.abs(bestSignal) < 0.5) {
      for (const other of blobs) {
        if (other.id === blob.id) continue;

        const bdx = other.x - blob.x;
        const bdy = other.y - blob.y;
        const dist = Math.sqrt(bdx * bdx + bdy * bdy);
        if (dist > VISION_RANGE) continue;

        const dot = bdx * dx + bdy * dy;
        if (dot > 0) {
          const cosAngle = dot / (dist + 0.001);
          if (cosAngle > 0.6 && dist < closestDist) {
            closestDist = dist;

            const isFamily = other.familyLineage === blob.familyLineage;
            const massRatio = other.mass / blob.mass;

            if (isFamily) {
              bestSignal = 0.3 * (1 - dist / VISION_RANGE);
            } else if (massRatio < 0.87) {
              const advantage = (1 / massRatio) - 1;
              const advantageFactor = Math.min(1, advantage * 0.5);
              bestSignal = (0.5 + advantageFactor * 0.4) * (1 - dist / VISION_RANGE);
            } else if (massRatio > 1.15) {
              const threat = massRatio - 1;
              const threatFactor = Math.min(1, threat * 0.3);
              bestSignal = -(0.5 + threatFactor * 0.3) * (1 - dist / VISION_RANGE);
            } else {
              const sizeDiff = (massRatio - 1) * 5;
              bestSignal = sizeDiff * 0.1 * (1 - dist / VISION_RANGE);
            }
          }
        }
      }
    }

    inputs[i] = bestSignal;
  });

  // Self-awareness
  inputs[8] = Math.min(blob.mass / 100, 1) - 0.3;
  inputs[9] = blob.vx / 5;
  inputs[10] = blob.vy / 5;

  // Wall proximity
  const wallDist = Math.min(blob.x, blob.y, worldWidth - blob.x, worldHeight - blob.y);
  inputs[11] = Math.max(0, 1 - wallDist / 150);

  // Idle state
  inputs[12] = Math.min(1, blob.idleTicks / 200);

  // Reproduction readiness
  const reproductionCooldown = (currentTick - blob.lastReproductionTick) / REPRODUCTION_COOLDOWN;
  const reproductionReady = Math.min(1, reproductionCooldown);
  inputs[13] = reproductionReady;

  return inputs;
};