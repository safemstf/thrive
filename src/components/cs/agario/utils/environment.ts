// src/components/cs/agario/environment-enhanced.ts

import { BiomeConfig, Food, FoodCluster, Obstacle } from '../config/agario.types';
import {
  MAX_FOOD, FOOD_SPAWN_RATE,
  CLUSTER_DISTANCE, MIN_CLUSTER_SIZE,
  MAX_OBSTACLES
} from '../config/agario.constants';

/**
 * ENHANCED FOOD SPAWNING
 * 
 * Features:
 * - Biome-based spawning (rich zones, sparse zones, danger zones)
 * - Cluster-based distribution for realistic foraging
 * - Adaptive spawn rates based on population pressure
 * - Quality variation (some food is more nutritious)
 */



export interface EnvironmentState {
  food: Food[];
  obstacles: Obstacle[];
  biomes: BiomeConfig[];
  spatialGrid: Map<string, Food[]>;
  foodClusters: FoodCluster[];
  tick: number;
  populationPressure: number; // Tracks how much competition there is
}

/**
 * Create biomes for more interesting environment
 */
export const createBiomes = (worldWidth: number, worldHeight: number): BiomeConfig[] => {
  const biomes: BiomeConfig[] = [];

  // Central rich zone (high food, low danger)
  biomes.push({
    name: 'center_rich',
    x: worldWidth * 0.35,
    y: worldHeight * 0.35,
    width: worldWidth * 0.3,
    height: worldHeight * 0.3,
    foodDensity: 1.8,
    foodQuality: 1.2,
    dangerLevel: 0.2,
    color: '#4ade80'
  });

  // Corner sparse zones (low food, medium danger)
  const corners = [
    { x: 0, y: 0 },
    { x: worldWidth * 0.7, y: 0 },
    { x: 0, y: worldHeight * 0.7 },
    { x: worldWidth * 0.7, y: worldHeight * 0.7 }
  ];

  corners.forEach((corner, i) => {
    biomes.push({
      name: `corner_sparse_${i}`,
      x: corner.x,
      y: corner.y,
      width: worldWidth * 0.3,
      height: worldHeight * 0.3,
      foodDensity: 0.4,
      foodQuality: 0.8,
      dangerLevel: 0.5,
      color: '#fbbf24'
    });
  });

  // Edge danger zones (medium food, high danger - obstacles)
  const edges = [
    { x: worldWidth * 0.4, y: 0, w: worldWidth * 0.2, h: worldHeight * 0.15 }, // Top
    { x: worldWidth * 0.4, y: worldHeight * 0.85, w: worldWidth * 0.2, h: worldHeight * 0.15 }, // Bottom
    { x: 0, y: worldHeight * 0.4, w: worldWidth * 0.15, h: worldHeight * 0.2 }, // Left
    { x: worldWidth * 0.85, y: worldHeight * 0.4, w: worldWidth * 0.15, h: worldHeight * 0.2 } // Right
  ];

  edges.forEach((edge, i) => {
    biomes.push({
      name: `edge_danger_${i}`,
      x: edge.x,
      y: edge.y,
      width: edge.w,
      height: edge.h,
      foodDensity: 1.0,
      foodQuality: 1.5, // High reward for high risk
      dangerLevel: 0.8,
      color: '#ef4444'
    });
  });

  return biomes;
};

/**
 * Get biome at specific location
 */
export const getBiomeAt = (
  x: number,
  y: number,
  biomes: BiomeConfig[]
): BiomeConfig | null => {
  for (const biome of biomes) {
    if (x >= biome.x && x <= biome.x + biome.width &&
      y >= biome.y && y <= biome.y + biome.height) {
      return biome;
    }
  }
  return null; // Default/neutral zone
};

/**
 * ENHANCED FOOD SPAWNING with biome awareness
 */
export const spawnFood = (
  currentFood: Food[],
  biomes: BiomeConfig[],
  worldWidth: number,
  worldHeight: number,
  count: number = FOOD_SPAWN_RATE,
  maxFood: number = MAX_FOOD,
  populationPressure: number = 0
): Food[] => {
  const newFood = [...currentFood];

  // Adaptive spawn rate based on pressure
  const adaptiveCount = Math.floor(count * (1 + populationPressure * 0.5));

  for (let i = 0; i < adaptiveCount && newFood.length < maxFood; i++) {
    // Weighted biome selection (prefer high-density biomes)
    let selectedBiome: BiomeConfig | null = null;

    if (biomes.length > 0 && Math.random() < 0.7) {
      // 70% chance to spawn in a biome
      const totalWeight = biomes.reduce((sum, b) => sum + b.foodDensity, 0);
      let rand = Math.random() * totalWeight;

      for (const biome of biomes) {
        rand -= biome.foodDensity;
        if (rand <= 0) {
          selectedBiome = biome;
          break;
        }
      }
    }

    let x, y, mass;

    if (selectedBiome) {
      // Spawn in selected biome
      x = selectedBiome.x + Math.random() * selectedBiome.width;
      y = selectedBiome.y + Math.random() * selectedBiome.height;
      mass = (2 + Math.random() * 2) * selectedBiome.foodQuality;
    } else {
      // Spawn in neutral zone
      x = Math.random() * worldWidth;
      y = Math.random() * worldHeight;
      mass = 2 + Math.random() * 2;
    }

    newFood.push({
      x,
      y,
      mass,
      age: 0
    });
  }

  return newFood;
};

/**
 * CLUSTER-BASED SPAWNING
 * Sometimes spawn food in clusters for more interesting foraging
 */
export const spawnFoodCluster = (
  currentFood: Food[],
  centerX: number,
  centerY: number,
  clusterSize: number = 10,
  spread: number = 50
): Food[] => {
  const newFood = [...currentFood];

  for (let i = 0; i < clusterSize; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * spread;

    newFood.push({
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
      mass: 2 + Math.random() * 2,
      age: 0
    });
  }

  return newFood;
};

/**
 * ENHANCED CLUSTERING with better performance
 */
export const clusterFoodEnhanced = (
  food: Food[],
  spatialGrid: Map<string, Food[]>,
  gridSize: number,
  clusterDistance: number = CLUSTER_DISTANCE,
  minClusterSize: number = MIN_CLUSTER_SIZE
): FoodCluster[] => {
  const clusters: FoodCluster[] = [];
  const processed = new Set<Food>();

  // Use spatial grid for faster clustering
  for (const [key, cellFood] of spatialGrid) {
    for (const f of cellFood) {
      if (processed.has(f)) continue;

      const nearby: Food[] = [f];
      processed.add(f);

      // Only check nearby cells
      const [cx, cy] = key.split(',').map(Number);
      const cellRange = Math.ceil(clusterDistance / gridSize);

      for (let dx = -cellRange; dx <= cellRange; dx++) {
        for (let dy = -cellRange; dy <= cellRange; dy++) {
          const neighborKey = `${cx + dx},${cy + dy}`;
          const neighborFood = spatialGrid.get(neighborKey);

          if (!neighborFood) continue;

          for (const other of neighborFood) {
            if (processed.has(other)) continue;

            const dist = Math.sqrt((f.x - other.x) ** 2 + (f.y - other.y) ** 2);
            if (dist < clusterDistance) {
              nearby.push(other);
              processed.add(other);
            }
          }
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
      }
    }
  }

  return clusters;
};

/**
 * ENHANCED FOOD AGING with quality degradation
 */
export const ageFoodEnhanced = (
  food: Food[],
  maxAge: number = 5000,
  degradationRate: number = 0.998 // 0.2% mass loss per tick
): Food[] => {
  return food.filter(f => {
    f.age++;

    // Gradually lose mass as food ages (makes old food less attractive)
    if (f.age > maxAge * 0.5) {
      f.mass *= degradationRate;
    }

    // Remove when too old or too small
    return f.age <= maxAge && f.mass > 0.5;
  });
};

/**
 * DYNAMIC OBSTACLES
 * Spawn obstacles based on biome danger levels
 */
export const spawnObstacles = (
  worldWidth: number,
  worldHeight: number,
  biomes: BiomeConfig[],
  maxObstacles: number = MAX_OBSTACLES
): Obstacle[] => {
  const obstacles: Obstacle[] = [];

  // Add border obstacles (prevent wall-hugging)
  const borderPadding = 50;
  const borderObstacleCount = 12;

  for (let i = 0; i < borderObstacleCount; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
      case 0: // Top
        x = Math.random() * worldWidth;
        y = borderPadding;
        break;
      case 1: // Right
        x = worldWidth - borderPadding;
        y = Math.random() * worldHeight;
        break;
      case 2: // Bottom
        x = Math.random() * worldWidth;
        y = worldHeight - borderPadding;
        break;
      default: // Left
        x = borderPadding;
        y = Math.random() * worldHeight;
    }

    obstacles.push({
      x,
      y,
      radius: 20 + Math.random() * 30
    });
  }

  // Add biome-based obstacles
  for (const biome of biomes) {
    const obstacleCount = Math.floor(biome.dangerLevel * 5);

    for (let i = 0; i < obstacleCount && obstacles.length < maxObstacles; i++) {
      obstacles.push({
        x: biome.x + Math.random() * biome.width,
        y: biome.y + Math.random() * biome.height,
        radius: 15 + Math.random() * 40
      });
    }
  }

  return obstacles;
};

/**
 * SPATIAL GRID SYSTEM (optimized)
 */
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

/**
 * GET NEARBY FOOD (optimized with spatial grid)
 */
export const getNearbyFood = (
  x: number,
  y: number,
  range: number,
  spatialGrid: Map<string, Food[]>,
  gridSize: number
): Food[] => {
  const nearby: Food[] = [];
  const rangeSq = range * range;
  const cellRange = Math.ceil(range / gridSize);
  const centerX = Math.floor(x / gridSize);
  const centerY = Math.floor(y / gridSize);

  for (let dx = -cellRange; dx <= cellRange; dx++) {
    for (let dy = -cellRange; dy <= cellRange; dy++) {
      const key = `${centerX + dx},${centerY + dy}`;
      const cellFood = spatialGrid.get(key);

      if (cellFood) {
        for (const f of cellFood) {
          const distSq = (f.x - x) ** 2 + (f.y - y) ** 2;
          if (distSq <= rangeSq) {
            nearby.push(f);
          }
        }
      }
    }
  }

  return nearby;
};

/**
 * CALCULATE POPULATION PRESSURE
 * Higher pressure = more spawns, harder survival
 */
export const calculatePopulationPressure = (
  blobCount: number,
  foodCount: number,
  targetBlobCount: number = 100,
  targetFoodPerBlob: number = 50
): number => {
  const blobRatio = blobCount / targetBlobCount;
  const foodRatio = foodCount / (blobCount * targetFoodPerBlob);

  // Pressure increases when:
  // - Many blobs (competition)
  // - Little food (scarcity)
  const pressure = Math.max(0, Math.min(1,
    (blobRatio * 0.7) + ((1 - foodRatio) * 0.3)
  ));

  return pressure;
};

/**
 * COMPLETE ENVIRONMENT UPDATE
 * Call this every tick to update the entire environment
 */
export const updateEnvironment = (
  state: EnvironmentState,
  blobCount: number,
  worldWidth: number,
  worldHeight: number,
  gridSize: number = 100
): EnvironmentState => {
  state.tick++;

  // Calculate population pressure
  state.populationPressure = calculatePopulationPressure(
    blobCount,
    state.food.length
  );

  // Age existing food
  state.food = ageFoodEnhanced(state.food);

  // Spawn new food (adaptive to pressure)
  state.food = spawnFood(
    state.food,
    state.biomes,
    FOOD_SPAWN_RATE,
    MAX_FOOD,
    worldWidth,
    worldHeight,
    state.populationPressure
  );

  // Occasionally spawn food clusters (creates hotspots)
  if (state.tick % 200 === 0 && state.food.length < MAX_FOOD * 0.8) {
    const x = Math.random() * worldWidth;
    const y = Math.random() * worldHeight;
    state.food = spawnFoodCluster(state.food, x, y, 15, 60);
  }

  // Update spatial grid for fast lookups
  state.spatialGrid = updateSpatialGrid(state.food, gridSize);

  // Update food clusters
  state.foodClusters = clusterFoodEnhanced(
    state.food,
    state.spatialGrid,
    gridSize
  );

  return state;
};

/**
 * INITIALIZE ENVIRONMENT
 */
export const initializeEnvironment = (
  worldWidth: number,
  worldHeight: number
): EnvironmentState => {
  const biomes = createBiomes(worldWidth, worldHeight);
  const obstacles = spawnObstacles(worldWidth, worldHeight, biomes);

  // Initial food spawn
  let food: Food[] = [];
  food = spawnFood(
    food,
    biomes,
    MAX_FOOD / 2, // Start with half capacity
    MAX_FOOD,
    worldWidth,
    worldHeight,
    0
  );

  const spatialGrid = updateSpatialGrid(food, 100);
  const foodClusters = clusterFoodEnhanced(food, spatialGrid, 100);

  return {
    food,
    obstacles,
    biomes,
    spatialGrid,
    foodClusters,
    tick: 0,
    populationPressure: 0
  };
};

/**
 * GET ENVIRONMENT STATS
 */
export const getEnvironmentStats = (state: EnvironmentState) => {
  const avgFoodMass = state.food.reduce((sum, f) => sum + f.mass, 0) / state.food.length;
  const avgFoodAge = state.food.reduce((sum, f) => sum + f.age, 0) / state.food.length;

  // Count food per biome
  const biomeDistribution: Record<string, number> = {};
  for (const f of state.food) {
    const biome = getBiomeAt(f.x, f.y, state.biomes);
    const biomeName = biome?.name || 'neutral';
    biomeDistribution[biomeName] = (biomeDistribution[biomeName] || 0) + 1;
  }

  return {
    tick: state.tick,
    foodCount: state.food.length,
    clusterCount: state.foodClusters.length,
    obstacleCount: state.obstacles.length,
    populationPressure: state.populationPressure,
    avgFoodMass,
    avgFoodAge,
    biomeDistribution
  };
};

// Export original functions for backward compatibility
export const clusterFood = clusterFoodEnhanced;
export const ageFood = ageFoodEnhanced;