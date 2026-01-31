// src/components/cs/agario/utils/reproduction.ts

import { Genome } from '../neat';
import { Blob } from '../config/agario.types';
import {
  MAX_POPULATION, REPRODUCTION_MIN_MASS, REPRODUCTION_COOLDOWN,
  FOOD_FOR_REPRODUCTION, MIN_AGE_FOR_REPRODUCTION,
  WORLD_WIDTH,
  WORLD_HEIGHT
} from '../config/agario.constants';

// ===================== COLOR INHERITANCE SYSTEM =====================

/**
 * Parse HSL color string to components
 */
function parseHSL(color: string): { h: number, s: number, l: number } | null {
  // Handle hsl(h, s%, l%) format
  const hslMatch = color.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%?,\s*(\d+(?:\.\d+)?)%?\)/);
  if (hslMatch) {
    return {
      h: parseFloat(hslMatch[1]),
      s: parseFloat(hslMatch[2]),
      l: parseFloat(hslMatch[3])
    };
  }

  // Handle hex colors - convert to HSL
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: l * 100 };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  return null;
}

/**
 * Mutate a color slightly - children inherit parent color with small variations
 * This creates visible family lines where you can see speciation happening
 */
export function mutateColor(parentColor: string, mutationStrength: number = 0.05): string {
  const hsl = parseHSL(parentColor);

  if (!hsl) {
    // If we can't parse, return a random color
    return `hsl(${Math.random() * 360}, 70%, 55%)`;
  }

  // Small hue mutation (±5-15 degrees typically)
  // This means family lines drift slowly through the color spectrum
  const hueMutation = (Math.random() - 0.5) * 2 * 20 * mutationStrength;
  let newH = (hsl.h + hueMutation + 360) % 360;

  // Very slight saturation/lightness variation (keeps families similar but not identical)
  const satMutation = (Math.random() - 0.5) * 2 * 10 * mutationStrength;
  const lightMutation = (Math.random() - 0.5) * 2 * 8 * mutationStrength;

  let newS = Math.max(40, Math.min(90, hsl.s + satMutation));
  let newL = Math.max(35, Math.min(70, hsl.l + lightMutation));

  return `hsl(${newH.toFixed(1)}, ${newS.toFixed(1)}%, ${newL.toFixed(1)}%)`;
}

/**
 * Generate a founder color for a new species/lineage
 * Uses distinct hues to make different lineages easily distinguishable
 */
export function generateFounderColor(): string {
  // Use golden ratio to generate well-distributed hues
  const goldenRatio = 0.618033988749895;
  const hue = (Math.random() + goldenRatio) % 1 * 360;

  // High saturation, medium lightness for vibrant, visible colors
  const saturation = 60 + Math.random() * 25; // 60-85%
  const lightness = 45 + Math.random() * 15;  // 45-60%

  return `hsl(${hue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
}

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

  // Use founder color for new lineages (no parent), otherwise use provided color
  const blobColor = color ?? generateFounderColor();

  const blob: Blob = {
    id: getNextId ? getNextId() : Date.now() + Math.random(),
    x: blobX,
    y: blobY,
    vx: 0,
    vy: 0,
    mass: 30,
    color: blobColor,
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

  // Mutate color slightly - children inherit parent's color with small variation
  // This creates visible family lines where speciation is apparent
  const babyColor = mutateColor(parent.color, 0.08);

  const baby = createBlobFn(
    babyGenome,
    parent.generation + 1,
    parent.id,
    bx,
    by,
    babyColor,  // Use mutated color instead of exact parent color
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