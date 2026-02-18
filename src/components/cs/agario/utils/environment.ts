// src/components/cs/agario/environment.ts

import { BiomeConfig, Food, FoodCluster, Obstacle, TerrainBarrier } from '../config/agario.types';
import {
  MAX_FOOD, FOOD_SPAWN_RATE,
  CLUSTER_DISTANCE, MIN_CLUSTER_SIZE,
  MAX_OBSTACLES, WORLD_WIDTH, WORLD_HEIGHT,
  FOOD_ISLAND_COUNT,
  FOOD_ISLAND_RADIUS_MIN,
  FOOD_ISLAND_RADIUS_MAX,
  FOOD_ISLAND_SPAWN_RATE_MIN,
  FOOD_ISLAND_SPAWN_RATE_MAX,
  FOOD_ISLAND_MAX_FOOD,
  FOOD_ISLAND_RICH_CHANCE,
  FOOD_ISLAND_SCATTER_RATE,
  MOVING_OBSTACLE_RATIO,
  OBSTACLE_SPEED_MIN,
  OBSTACLE_SPEED_MAX,
  OBSTACLE_ORBIT_RADIUS_MIN,
  OBSTACLE_ORBIT_RADIUS_MAX
} from '../config/agario.constants';

/**
 * FOOD ISLAND SYSTEM
 *
 * Instead of food covering the entire map, food spawns from discrete "islands"
 * (sources/springs) that emit food radially. High density at center, low at edges.
 *
 * This creates:
 * - Natural hotspots blobs need to discover
 * - Territory competition
 * - Navigation challenges (find the islands!)
 * - Resource scarcity between islands
 */

// ===================== FOOD ISLAND TYPES =====================

export interface FoodIsland {
  id: number;
  x: number;
  y: number;
  radius: number;           // How far food spreads from center
  spawnRate: number;        // Food per tick at center
  richness: number;         // Food quality multiplier
  currentFood: number;      // Track food currently near this island
  maxFood: number;          // Cap food per island
  color: string;            // For visualization
}

// ===================== FOOD ISLAND MANAGEMENT =====================

let nextIslandId = 0;

/**
 * Create food islands distributed across the world
 * Uses constants from agario.constants.ts for configuration
 */
export const createFoodIslands = (
  worldWidth: number,
  worldHeight: number,
  islandCount: number = FOOD_ISLAND_COUNT
): FoodIsland[] => {
  const islands: FoodIsland[] = [];

  // Create a grid-like distribution with some randomness
  const cols = Math.ceil(Math.sqrt(islandCount * (worldWidth / worldHeight)));
  const rows = Math.ceil(islandCount / cols);

  const cellWidth = worldWidth / cols;
  const cellHeight = worldHeight / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (islands.length >= islandCount) break;

      // Random position within cell (with padding from edges)
      const padding = 0.2;
      const x = cellWidth * (col + padding + Math.random() * (1 - 2 * padding));
      const y = cellHeight * (row + padding + Math.random() * (1 - 2 * padding));

      // Vary island properties using constants
      const isRich = Math.random() < FOOD_ISLAND_RICH_CHANCE;

      // Calculate radius within configured range
      const radiusRange = FOOD_ISLAND_RADIUS_MAX - FOOD_ISLAND_RADIUS_MIN;
      const baseRadius = FOOD_ISLAND_RADIUS_MIN + Math.random() * radiusRange * 0.5;
      const richRadius = FOOD_ISLAND_RADIUS_MIN + radiusRange * 0.5 + Math.random() * radiusRange * 0.5;

      // Calculate spawn rate within configured range
      const spawnRange = FOOD_ISLAND_SPAWN_RATE_MAX - FOOD_ISLAND_SPAWN_RATE_MIN;
      const baseSpawnRate = FOOD_ISLAND_SPAWN_RATE_MIN + Math.random() * spawnRange * 0.4;
      const richSpawnRate = FOOD_ISLAND_SPAWN_RATE_MIN + spawnRange * 0.5 + Math.random() * spawnRange * 0.5;

      islands.push({
        id: nextIslandId++,
        x,
        y,
        radius: isRich ? richRadius : baseRadius,
        spawnRate: isRich ? richSpawnRate : baseSpawnRate,
        richness: isRich ? 1.5 + Math.random() * 0.5 : 0.8 + Math.random() * 0.4,
        currentFood: 0,
        maxFood: isRich ? FOOD_ISLAND_MAX_FOOD * 1.5 : FOOD_ISLAND_MAX_FOOD,
        color: isRich ? '#22c55e' : '#4ade80'
      });
    }
  }

  console.log(`🏝️ Created ${islands.length} food islands`);
  return islands;
};

/**
 * Spawn food from islands with radial density falloff
 * Center = high density, edges = low density
 */
export const spawnFoodFromIslands = (
  currentFood: Food[],
  islands: FoodIsland[],
  maxFood: number = MAX_FOOD
): Food[] => {
  if (currentFood.length >= maxFood) return currentFood;

  const newFood = [...currentFood];

  for (const island of islands) {
    // Count food near this island
    island.currentFood = currentFood.filter(f => {
      const dist = Math.sqrt((f.x - island.x) ** 2 + (f.y - island.y) ** 2);
      return dist < island.radius * 1.2;
    }).length;

    // Skip if island is at capacity
    if (island.currentFood >= island.maxFood) continue;

    // Spawn rate decreases as island fills up
    const fillRatio = island.currentFood / island.maxFood;
    const adjustedSpawnRate = island.spawnRate * (1 - fillRatio * 0.8);

    // Spawn food with probability based on spawn rate
    const foodToSpawn = Math.floor(adjustedSpawnRate);
    const fractional = adjustedSpawnRate - foodToSpawn;
    const totalSpawn = foodToSpawn + (Math.random() < fractional ? 1 : 0);

    for (let i = 0; i < totalSpawn && newFood.length < maxFood; i++) {
      // Radial spawn with density falloff (more food near center)
      // Use sqrt for uniform distribution, then bias toward center
      const angle = Math.random() * Math.PI * 2;

      // Bias toward center: use lower exponent for more center-heavy distribution
      const normalizedDist = Math.pow(Math.random(), 0.6); // 0.6 = center-biased
      const dist = normalizedDist * island.radius;

      const x = island.x + Math.cos(angle) * dist;
      const y = island.y + Math.sin(angle) * dist;

      // Skip if out of bounds
      if (x < 0 || x > WORLD_WIDTH || y < 0 || y > WORLD_HEIGHT) continue;

      // Food quality based on distance from center (closer = better)
      const qualityMultiplier = 1 + (1 - normalizedDist) * 0.5; // 1.0 to 1.5
      const mass = (2 + Math.random() * 2) * island.richness * qualityMultiplier;

      newFood.push({
        x,
        y,
        mass,
        age: 0
      });
    }
  }

  return newFood;
};

/**
 * Get the nearest food island to a position
 */
export const getNearestIsland = (
  x: number,
  y: number,
  islands: FoodIsland[]
): FoodIsland | null => {
  if (islands.length === 0) return null;

  let nearest = islands[0];
  let nearestDist = Infinity;

  for (const island of islands) {
    const dist = Math.sqrt((x - island.x) ** 2 + (y - island.y) ** 2);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = island;
    }
  }

  return nearest;
};

/**
 * Check if a position is within any food island's radius
 */
export const isInFoodIsland = (
  x: number,
  y: number,
  islands: FoodIsland[]
): boolean => {
  for (const island of islands) {
    const dist = Math.sqrt((x - island.x) ** 2 + (y - island.y) ** 2);
    if (dist < island.radius) return true;
  }
  return false;
};



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

// Global food islands (initialized once)
let globalFoodIslands: FoodIsland[] = [];

/**
 * Initialize or get food islands
 */
export const getFoodIslands = (worldWidth: number, worldHeight: number): FoodIsland[] => {
  if (globalFoodIslands.length === 0) {
    globalFoodIslands = createFoodIslands(worldWidth, worldHeight, FOOD_ISLAND_COUNT);
  }
  return globalFoodIslands;
};

/**
 * Reset food islands (call when reinitializing simulation)
 */
export const resetFoodIslands = (worldWidth: number, worldHeight: number): FoodIsland[] => {
  nextIslandId = 0;
  globalFoodIslands = createFoodIslands(worldWidth, worldHeight, FOOD_ISLAND_COUNT);
  return globalFoodIslands;
};

/**
 * FOOD SPAWNING - Now uses island system!
 * Backward compatible: still accepts biomes param but uses islands internally
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
  // Get or create food islands
  const islands = getFoodIslands(worldWidth, worldHeight);

  // Use the island-based spawning system
  let newFood = spawnFoodFromIslands(currentFood, islands, maxFood);

  // Occasionally spawn a small amount of food outside islands (configured scatter rate)
  // This gives blobs some crumbs to follow between islands
  const scatteredCount = Math.floor(count * FOOD_ISLAND_SCATTER_RATE * (1 + populationPressure));
  for (let i = 0; i < scatteredCount && newFood.length < maxFood; i++) {
    const x = Math.random() * worldWidth;
    const y = Math.random() * worldHeight;

    // Only spawn if NOT in an island (to keep islands as primary sources)
    if (!isInFoodIsland(x, y, islands)) {
      newFood.push({
        x,
        y,
        mass: 1 + Math.random() * 1.5, // Smaller, less nutritious
        age: 0
      });
    }
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

// ===================== MOVING OBSTACLES =====================
// Obstacles that move require PREDICTION to avoid - key for intelligence!

/**
 * Create obstacles with optional movement patterns
 * Some are static, some move in patterns - blobs must PREDICT to survive
 */
export function createObstacles(
  count: number,
  worldWidth: number,
  worldHeight: number
): Obstacle[] {
  const obstacles: Obstacle[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * worldWidth;
    const y = Math.random() * worldHeight;
    const radius = 20 + Math.random() * 25;

    // Decide if this obstacle moves
    const isMoving = Math.random() < MOVING_OBSTACLE_RATIO;

    if (!isMoving) {
      // Static obstacle
      obstacles.push({ x, y, radius, movementType: 'static', vx: 0, vy: 0 });
    } else {
      // Moving obstacle - choose movement pattern
      const patternRoll = Math.random();

      if (patternRoll < 0.4) {
        // Circular/orbital movement (40%)
        const orbitRadius = OBSTACLE_ORBIT_RADIUS_MIN +
          Math.random() * (OBSTACLE_ORBIT_RADIUS_MAX - OBSTACLE_ORBIT_RADIUS_MIN);
        const orbitSpeed = (OBSTACLE_SPEED_MIN +
          Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)) * 0.01;
        const orbitAngle = Math.random() * Math.PI * 2;

        obstacles.push({
          x,
          y,
          radius,
          movementType: 'circular',
          vx: 0,
          vy: 0,
          orbitCenterX: x,
          orbitCenterY: y,
          orbitRadius,
          orbitSpeed: orbitSpeed * (Math.random() > 0.5 ? 1 : -1), // Random direction
          orbitAngle
        });
      } else if (patternRoll < 0.7) {
        // Linear bouncing movement (30%)
        const speed = OBSTACLE_SPEED_MIN +
          Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN);
        const angle = Math.random() * Math.PI * 2;

        obstacles.push({
          x,
          y,
          radius,
          movementType: 'linear',
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed
        });
      } else {
        // Patrol between points (30%)
        const numPoints = 2 + Math.floor(Math.random() * 3); // 2-4 patrol points
        const patrolPoints: Array<{x: number, y: number}> = [];

        // Create patrol points in a rough path
        let px = x;
        let py = y;
        for (let j = 0; j < numPoints; j++) {
          patrolPoints.push({ x: px, y: py });
          // Next point within reasonable distance
          px = Math.max(50, Math.min(worldWidth - 50,
            px + (Math.random() - 0.5) * 400));
          py = Math.max(50, Math.min(worldHeight - 50,
            py + (Math.random() - 0.5) * 400));
        }

        obstacles.push({
          x,
          y,
          radius,
          movementType: 'patrol',
          vx: 0,
          vy: 0,
          patrolPoints,
          patrolIndex: 0,
          patrolSpeed: OBSTACLE_SPEED_MIN +
            Math.random() * (OBSTACLE_SPEED_MAX - OBSTACLE_SPEED_MIN)
        });
      }
    }
  }

  return obstacles;
}

/**
 * Update moving obstacles each tick
 * Returns the updated obstacle array
 */
export function updateObstacles(
  obstacles: Obstacle[],
  worldWidth: number,
  worldHeight: number
): Obstacle[] {
  for (const obs of obstacles) {
    if (!obs.movementType || obs.movementType === 'static') {
      continue;
    }

    switch (obs.movementType) {
      case 'circular': {
        // Orbit around center point
        if (obs.orbitAngle !== undefined && obs.orbitSpeed !== undefined &&
            obs.orbitCenterX !== undefined && obs.orbitCenterY !== undefined &&
            obs.orbitRadius !== undefined) {
          obs.orbitAngle += obs.orbitSpeed;

          const newX = obs.orbitCenterX + Math.cos(obs.orbitAngle) * obs.orbitRadius;
          const newY = obs.orbitCenterY + Math.sin(obs.orbitAngle) * obs.orbitRadius;

          // Update velocity for vision system to use
          obs.vx = newX - obs.x;
          obs.vy = newY - obs.y;

          obs.x = newX;
          obs.y = newY;
        }
        break;
      }

      case 'linear': {
        // Move and bounce off walls
        obs.x += obs.vx || 0;
        obs.y += obs.vy || 0;

        // Bounce off walls
        if (obs.x < obs.radius || obs.x > worldWidth - obs.radius) {
          obs.vx = -(obs.vx || 0);
          obs.x = Math.max(obs.radius, Math.min(worldWidth - obs.radius, obs.x));
        }
        if (obs.y < obs.radius || obs.y > worldHeight - obs.radius) {
          obs.vy = -(obs.vy || 0);
          obs.y = Math.max(obs.radius, Math.min(worldHeight - obs.radius, obs.y));
        }
        break;
      }

      case 'patrol': {
        // Move toward current patrol point
        if (obs.patrolPoints && obs.patrolPoints.length > 0 &&
            obs.patrolIndex !== undefined && obs.patrolSpeed !== undefined) {
          const target = obs.patrolPoints[obs.patrolIndex];
          const dx = target.x - obs.x;
          const dy = target.y - obs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 10) {
            // Reached target, move to next
            obs.patrolIndex = (obs.patrolIndex + 1) % obs.patrolPoints.length;
          } else {
            // Move toward target
            const speed = obs.patrolSpeed;
            obs.vx = (dx / dist) * speed;
            obs.vy = (dy / dist) * speed;
            obs.x += obs.vx;
            obs.y += obs.vy;
          }
        }
        break;
      }
    }

    // Keep within world bounds
    obs.x = Math.max(obs.radius, Math.min(worldWidth - obs.radius, obs.x));
    obs.y = Math.max(obs.radius, Math.min(worldHeight - obs.radius, obs.y));
  }

  return obstacles;
}

// ===================== TERRAIN TOPOLOGY SYSTEM =====================
// Mountains and barriers that create paths, chokepoints, and navigation challenges
// These are NON-LETHAL - blobs bounce off them, forcing routing decisions
//
// Design Philosophy:
// - Create natural "corridors" that reward directional navigation
// - Chokepoints where blobs must make decisions
// - Resource-rich areas behind barriers (risk vs reward)
// - Break up the "circular movement is optimal" strategy

let nextBarrierId = 0;

/**
 * Generate terrain barriers that create interesting topology
 * Creates mountain ranges, ridges, and passages
 */
export function createTerrainBarriers(
  worldWidth: number,
  worldHeight: number
): TerrainBarrier[] {
  const barriers: TerrainBarrier[] = [];

  // Create 3-5 major mountain ranges that span significant portions of the map
  const numRanges = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < numRanges; i++) {
    // Each range is a series of connected peaks
    const rangeStartX = Math.random() * worldWidth * 0.8 + worldWidth * 0.1;
    const rangeStartY = Math.random() * worldHeight * 0.8 + worldHeight * 0.1;

    // Range direction (mostly horizontal or vertical with some variation)
    const isHorizontal = Math.random() > 0.5;
    const rangeLength = 400 + Math.random() * 600;
    const rangeAngle = isHorizontal
      ? (Math.random() - 0.5) * 0.5  // Mostly horizontal
      : Math.PI / 2 + (Math.random() - 0.5) * 0.5;  // Mostly vertical

    // Create peaks along the range
    const numPeaks = 3 + Math.floor(Math.random() * 4);
    const peakSpacing = rangeLength / numPeaks;

    for (let j = 0; j < numPeaks; j++) {
      const peakDist = j * peakSpacing + (Math.random() - 0.5) * peakSpacing * 0.3;
      const peakX = rangeStartX + Math.cos(rangeAngle) * peakDist;
      const peakY = rangeStartY + Math.sin(rangeAngle) * peakDist;

      // Skip if too close to edge
      if (peakX < 100 || peakX > worldWidth - 100 ||
          peakY < 100 || peakY > worldHeight - 100) continue;

      // Create a roughly circular mountain with irregular edges
      const peakRadius = 40 + Math.random() * 60;
      const numPoints = 6 + Math.floor(Math.random() * 4);
      const points: Array<{ x: number; y: number }> = [];

      for (let k = 0; k < numPoints; k++) {
        const angle = (k / numPoints) * Math.PI * 2;
        const radius = peakRadius * (0.7 + Math.random() * 0.6);
        points.push({
          x: peakX + Math.cos(angle) * radius,
          y: peakY + Math.sin(angle) * radius
        });
      }

      // Calculate bounding box
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);

      barriers.push({
        id: nextBarrierId++,
        type: 'mountain',
        points,
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
        color: `hsl(${30 + Math.random() * 20}, ${30 + Math.random() * 20}%, ${25 + Math.random() * 15}%)`,
        opacity: 0.8
      });
    }

    // Create ridges connecting peaks (narrow barriers)
    for (let j = 0; j < numPeaks - 1; j++) {
      const ridge = createRidgeBetweenPeaks(
        rangeStartX + Math.cos(rangeAngle) * j * peakSpacing,
        rangeStartY + Math.sin(rangeAngle) * j * peakSpacing,
        rangeStartX + Math.cos(rangeAngle) * (j + 1) * peakSpacing,
        rangeStartY + Math.sin(rangeAngle) * (j + 1) * peakSpacing,
        15 + Math.random() * 25  // Ridge width
      );
      if (ridge) barriers.push(ridge);
    }
  }

  // Add some isolated reef/rock formations for variety
  const numReefs = 5 + Math.floor(Math.random() * 5);
  for (let i = 0; i < numReefs; i++) {
    const reef = createReef(
      100 + Math.random() * (worldWidth - 200),
      100 + Math.random() * (worldHeight - 200),
      30 + Math.random() * 50
    );
    barriers.push(reef);
  }

  return barriers;
}

/**
 * Create a ridge (narrow barrier) between two points
 */
function createRidgeBetweenPeaks(
  x1: number, y1: number,
  x2: number, y2: number,
  width: number
): TerrainBarrier | null {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length < 20) return null;

  // Perpendicular direction
  const perpX = -dy / length;
  const perpY = dx / length;

  const halfWidth = width / 2;

  const points = [
    { x: x1 + perpX * halfWidth, y: y1 + perpY * halfWidth },
    { x: x2 + perpX * halfWidth, y: y2 + perpY * halfWidth },
    { x: x2 - perpX * halfWidth, y: y2 - perpY * halfWidth },
    { x: x1 - perpX * halfWidth, y: y1 - perpY * halfWidth },
  ];

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  return {
    id: nextBarrierId++,
    type: 'ridge',
    points,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    color: `hsl(${25 + Math.random() * 15}, ${25 + Math.random() * 15}%, ${30 + Math.random() * 10}%)`,
    opacity: 0.7
  };
}

/**
 * Create a small reef/rock formation
 */
function createReef(x: number, y: number, radius: number): TerrainBarrier {
  const numPoints = 5 + Math.floor(Math.random() * 3);
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const r = radius * (0.6 + Math.random() * 0.8);
    points.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r
    });
  }

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  return {
    id: nextBarrierId++,
    type: 'reef',
    points,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    color: `hsl(${200 + Math.random() * 40}, ${20 + Math.random() * 20}%, ${35 + Math.random() * 15}%)`,
    opacity: 0.6
  };
}

/**
 * Check if a point is inside a terrain barrier (polygon)
 */
export function isPointInBarrier(x: number, y: number, barrier: TerrainBarrier): boolean {
  // Quick bounding box check first
  if (x < barrier.minX || x > barrier.maxX ||
      y < barrier.minY || y > barrier.maxY) {
    return false;
  }

  // Ray casting algorithm for polygon containment
  const points = barrier.points;
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;

    if (((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a circle (blob) collides with a barrier
 * Returns the push-out vector if collision, null otherwise
 */
export function checkBarrierCollision(
  x: number, y: number, radius: number,
  barrier: TerrainBarrier
): { pushX: number; pushY: number } | null {
  // Quick bounding box check with radius
  if (x + radius < barrier.minX || x - radius > barrier.maxX ||
      y + radius < barrier.minY || y - radius > barrier.maxY) {
    return null;
  }

  // Check if center is inside
  if (isPointInBarrier(x, y, barrier)) {
    // Find nearest edge and push out
    const center = {
      x: (barrier.minX + barrier.maxX) / 2,
      y: (barrier.minY + barrier.maxY) / 2
    };

    const dx = x - center.x;
    const dy = y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Push toward the nearest edge
    return {
      pushX: (dx / dist) * (radius + 10),
      pushY: (dy / dist) * (radius + 10)
    };
  }

  // Check if edge intersects with circle
  const points = barrier.points;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    // Distance from point to line segment
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) continue;

    // Project point onto line segment
    let t = Math.max(0, Math.min(1,
      ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSq
    ));

    const closestX = p1.x + t * dx;
    const closestY = p1.y + t * dy;

    const distX = x - closestX;
    const distY = y - closestY;
    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < radius) {
      // Collision! Push out along the normal
      const pushDist = radius - dist + 2;
      return {
        pushX: (distX / dist) * pushDist,
        pushY: (distY / dist) * pushDist
      };
    }
  }

  return null;
}

/**
 * Apply barrier collisions to a blob
 * Modifies blob position to keep it outside all barriers
 */
export function applyBarrierCollisions(
  blob: { x: number; y: number; vx: number; vy: number; mass: number },
  barriers: TerrainBarrier[]
): void {
  const radius = Math.sqrt(blob.mass) * 2.5;

  for (const barrier of barriers) {
    const collision = checkBarrierCollision(blob.x, blob.y, radius, barrier);

    if (collision) {
      // Push blob out of barrier
      blob.x += collision.pushX;
      blob.y += collision.pushY;

      // Reflect velocity (bounce)
      const pushMag = Math.sqrt(collision.pushX * collision.pushX + collision.pushY * collision.pushY);
      if (pushMag > 0) {
        const normalX = collision.pushX / pushMag;
        const normalY = collision.pushY / pushMag;

        // Reflect velocity across normal
        const dot = blob.vx * normalX + blob.vy * normalY;
        if (dot < 0) {  // Only reflect if moving toward barrier
          blob.vx -= 2 * dot * normalX * 0.6;  // 0.6 = energy loss
          blob.vy -= 2 * dot * normalY * 0.6;
        }
      }
    }
  }
}