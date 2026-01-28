// src/components/cs/agario/environment.ts

import { Food, FoodCluster } from '../config/agario.types';
import { 
  MAX_FOOD, FOOD_SPAWN_RATE,
  CLUSTER_DISTANCE, MIN_CLUSTER_SIZE,
  SURVIVAL_PRESSURE_INCREASE, MAX_OBSTACLES
} from '../config/agario.constants';

export const spawnFood = (
  currentFood: Food[],
  count: number = FOOD_SPAWN_RATE,
  maxFood: number = MAX_FOOD,
  worldWidth: number,
  worldHeight: number,
  getZoneAt?: (x: number, y: number) => string
): Food[] => {
  const newFood = [...currentFood];

  for (let i = 0; i < count && newFood.length < maxFood; i++) {
    let x = Math.random() * worldWidth;
    let y = Math.random() * worldHeight;

    if (getZoneAt) {
      const zone = getZoneAt(x, y);
      if (zone === 'danger' && Math.random() < 0.7) {
        x = Math.random() * worldWidth;
        y = Math.random() * worldHeight;
      }
    }

    newFood.push({
      x, y,
      mass: 2 + Math.random() * 2,
      age: 0
    });
  }

  return newFood;
};

export const clusterFood = (
  food: Food[],
  clusterDistance: number = CLUSTER_DISTANCE,
  minClusterSize: number = MIN_CLUSTER_SIZE
): FoodCluster[] => {
  const clusters: FoodCluster[] = [];
  const processed = new Set<Food>();

  for (const f of food) {
    if (processed.has(f)) continue;

    const nearby: Food[] = [f];
    processed.add(f);

    for (const other of food) {
      if (processed.has(other)) continue;

      const dist = Math.sqrt((f.x - other.x) ** 2 + (f.y - other.y) ** 2);
      if (dist < clusterDistance) {
        nearby.push(other);
        processed.add(other);
      }
    }

    if (nearby.length >= minClusterSize) {
      const totalMass = nearby.reduce((sum, f) => sum + f.mass, 0);
      const centerX = nearby.reduce((sum, f) => sum + f.x, 0) / nearby.length;
      const centerY = nearby.reduce((sum, f) => sum + f.y, 0) / nearby.length;

      clusters.push({
        x: centerX,
        y: centerY,
        totalMass,
        count: nearby.length,
        radius: Math.sqrt(totalMass) * 3,
        foods: nearby
      });
    } else {
      for (const f2 of nearby) {
        processed.delete(f2);
      }
    }
  }

  return clusters;
};

export const ageFood = (food: Food[], maxAge: number = 5000): Food[] => {
  return food.filter(f => {
    f.age++;
    return f.age <= maxAge;
  });
};

export const updateSpatialGrid = (
  food: Food[],
  gridSize: number
): Map<string, Food[]> => {
  const spatialGrid = new Map<string, Food[]>();

  for (const f of food) {
    const key = `${Math.floor(f.x / gridSize)},${Math.floor(f.y / gridSize)}`;
    if (!spatialGrid.has(key)) {
      spatialGrid.set(key, []);
    }
    spatialGrid.get(key)!.push(f);
  }

  return spatialGrid;
};

export const getNearbyFood = (
  x: number,
  y: number,
  range: number,
  spatialGrid: Map<string, Food[]>,
  gridSize: number
): Food[] => {
  const nearby: Food[] = [];
  const cellRange = Math.ceil(range / gridSize);
  const centerX = Math.floor(x / gridSize);
  const centerY = Math.floor(y / gridSize);

  for (let dx = -cellRange; dx <= cellRange; dx++) {
    for (let dy = -cellRange; dy <= cellRange; dy++) {
      const key = `${centerX + dx},${centerY + dy}`;
      const cellFood = spatialGrid.get(key);
      if (cellFood) {
        nearby.push(...cellFood);
      }
    }
  }

  return nearby;
};