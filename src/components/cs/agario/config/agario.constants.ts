// ===================== CONSTANTS =====================

import { NeatConfig } from "../neat";

const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 2000;
const INITIAL_BLOBS = 70;
const MAX_POPULATION = 300;
const MAX_FOOD = 1500;
const FOOD_SPAWN_RATE = 100;
const NUM_OBSTACLES = 0;  // Start with 0 for curriculum learning - let them learn to eat first!
const NUM_LOGS = 0;
const VISION_RANGE = 500; // Increased! Gradient vision is more efficient
const VISION_UPDATE_INTERVAL = 2;

// Natural reproduction
const REPRODUCTION_MIN_MASS = 20;
const REPRODUCTION_COOLDOWN = 200;
const FOOD_FOR_REPRODUCTION = 30;
const MIN_AGE_FOR_REPRODUCTION = 200;
const REPRODUCTION_READY_THRESHOLD = 0.5; // Neural network threshold for reproduction

// Survival pressure
const MAX_OBSTACLES = 30;

// Food clustering
const CLUSTER_DISTANCE = 3;
const MIN_CLUSTER_SIZE = 7;
const CLUSTER_UPDATE_INTERVAL = 10;

// Food Islands - where food spawns from
const FOOD_ISLAND_COUNT = 10;           // Number of food sources across map
const FOOD_ISLAND_RADIUS_MIN = 150;    // Minimum island spread radius
const FOOD_ISLAND_RADIUS_MAX = 350;    // Maximum island spread radius
const FOOD_ISLAND_SPAWN_RATE_MIN = 3;  // Min food per tick at center
const FOOD_ISLAND_SPAWN_RATE_MAX = 12; // Max food per tick at center
const FOOD_ISLAND_MAX_FOOD = 150;      // Max food per island
const FOOD_ISLAND_RICH_CHANCE = 0.3;   // 30% chance of rich island
const FOOD_ISLAND_SCATTER_RATE = 0.05; // 5% food spawns outside islands

// Starvation & Movement - BALANCED IDLE PUNISHMENT
const STARVATION_RATE = 0.6;               // Moderate starvation
const MIN_MOVEMENT_THRESHOLD = 0.2;        // Sensitive movement detection
const IDLE_PENALTY_START = 50;             // Give them time to figure it out
const IDLE_FITNESS_PENALTY = 0.5;          // Moderate fitness penalty
const MOVEMENT_REWARD_FACTOR = 0.5;        // Reward movement well
const STARVATION_DEATH_PENALTY = -80;      // Moderate death penalty
const IDLE_STARVATION_RATE = 0.15;         // Gradual mass loss when idle
const IDLE_DEATH_THRESHOLD = 2000;          // Die after 200 idle ticks (gives time to learn)

// Aging system constants
export const AGING_PENALTY_START = 2000; // Ticks before aging penalties start
export const AGING_PENALTY_RATE = 0.01; // Base aging penalty multiplier
export const MAX_AGE_PENALTY = 0.5; // Maximum penalty (50% efficiency at oldest)
export const AGING_STARVATION_MULTIPLIER = 0.0005; // Additional starvation per age
export const AGE_PENALTY_EXPONENT = 2.5; // Exponential curve for aging penalty
export const MIN_REPRODUCTION_EFFICIENCY = 0.3; // Minimum efficiency for reproduction

// Base starvation interval
const BASE_STARVATION_INTERVAL = 120;      // Moderate frequency

// Update survival pressure to increase faster
const SURVIVAL_PRESSURE_INCREASE = 0.01;

// Movement physics
const BLOB_ACCELERATION = 0.3;        // Was 0.45 - how fast blobs accelerate
const BLOB_ROTATION_SPEED = 0.15;     // Was 0.2 - how fast blobs turn
const BLOB_FRICTION = 0.92;           // Was 0.95 - velocity damping (lower = slower)
const BLOB_BASE_MAX_SPEED = 3;      // Was 5 - max speed for a blob of mass 30
const BLOB_MASS_SPEED_FACTOR = 30;    // Mass at which speed = base max speed
const BLOB_MAX_MASS = 120;            // Maximum mass cap - prevents blobs from getting too big

// Coriolis Effect - subtle global rotational influence on movement
// Instead of discrete currents, this creates a planet-like deflection
const CORIOLIS_STRENGTH = 0.015;      // Very subtle deflection (0.01-0.03 range)
const CORIOLIS_HEMISPHERE_SPLIT = 0.5; // Y position where rotation flips (0.5 = middle)
const CORIOLIS_EQUATOR_CALM = 0.1;    // Width of calm zone at equator (0-1)
const CORIOLIS_LATITUDE_SCALING = true; // Stronger effect towards poles

// Neural IO sizes
// Gradient vision: 6 sensory + 2 state = 8 inputs (down from 40!)
const INPUT_SIZE = 8;
const OUTPUT_SIZE = 3;

// Neural net visualization
const NEURAL_NET_CONFIG = {
  nodeRadius: 16,
  minSpacing: 60,
  maxSpacing: 100,
  springStrength: 0.08,
  repulsionStrength: 80,
  damping: 0.9,
  maxForce: 8,
  connectionWidth: 2.5,
  hiddenLayerColumns: 3,
} as const;

// ===================== EXPORTS =====================

// NEAT Configuration
const NEAT_CONFIG: NeatConfig = {
  mutationRate: 0.8,
  elitism: 0.3,
  mutationSize: 0.4,
  addNodeRate: 0.5,
  addConnectionRate: 0.5,
  compatibilityThreshold: 3.0
};


export {
  NEAT_CONFIG,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  INITIAL_BLOBS,
  MAX_POPULATION,
  MAX_FOOD,
  FOOD_SPAWN_RATE,
  NUM_OBSTACLES,
  NUM_LOGS,
  VISION_RANGE,
  VISION_UPDATE_INTERVAL,

  REPRODUCTION_MIN_MASS,
  REPRODUCTION_COOLDOWN,
  FOOD_FOR_REPRODUCTION,
  MIN_AGE_FOR_REPRODUCTION,

  MAX_OBSTACLES,

  CLUSTER_DISTANCE,
  MIN_CLUSTER_SIZE,
  CLUSTER_UPDATE_INTERVAL,

  // Food Island exports
  FOOD_ISLAND_COUNT,
  FOOD_ISLAND_RADIUS_MIN,
  FOOD_ISLAND_RADIUS_MAX,
  FOOD_ISLAND_SPAWN_RATE_MIN,
  FOOD_ISLAND_SPAWN_RATE_MAX,
  FOOD_ISLAND_MAX_FOOD,
  FOOD_ISLAND_RICH_CHANCE,
  FOOD_ISLAND_SCATTER_RATE,

  STARVATION_RATE,
  MIN_MOVEMENT_THRESHOLD,
  IDLE_PENALTY_START,
  IDLE_FITNESS_PENALTY,
  MOVEMENT_REWARD_FACTOR,
  STARVATION_DEATH_PENALTY,
  IDLE_STARVATION_RATE,
  IDLE_DEATH_THRESHOLD,

  BASE_STARVATION_INTERVAL,
  SURVIVAL_PRESSURE_INCREASE,

  INPUT_SIZE,
  OUTPUT_SIZE,

  NEURAL_NET_CONFIG,
  REPRODUCTION_READY_THRESHOLD,

  // Movement physics exports
  BLOB_ACCELERATION,
  BLOB_ROTATION_SPEED,
  BLOB_FRICTION,
  BLOB_BASE_MAX_SPEED,
  BLOB_MASS_SPEED_FACTOR,
  BLOB_MAX_MASS,

  // Coriolis Effect exports
  CORIOLIS_STRENGTH,
  CORIOLIS_HEMISPHERE_SPLIT,
  CORIOLIS_EQUATOR_CALM,
  CORIOLIS_LATITUDE_SCALING,
};
