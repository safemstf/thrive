// ===================== CONSTANTS =====================

import { NeatConfig } from "../neat";

const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 2000;
const INITIAL_BLOBS = 70;
const MAX_POPULATION = 200;
const MAX_FOOD = 1900;
const FOOD_SPAWN_RATE = 10;
const NUM_OBSTACLES = INITIAL_BLOBS;
const NUM_LOGS = 0;
const VISION_RANGE = 210;
const VISION_UPDATE_INTERVAL = 2;

// Natural reproduction
const REPRODUCTION_MIN_MASS = 20;
const REPRODUCTION_COOLDOWN = 200;
const FOOD_FOR_REPRODUCTION = 30;
const MIN_AGE_FOR_REPRODUCTION = 200;
const REPRODUCTION_READY_THRESHOLD = 0.5; // Neural network threshold for reproduction

// Survival pressure
const MAX_OBSTACLES = 0;

// Food clustering
const CLUSTER_DISTANCE = 70;
const MIN_CLUSTER_SIZE = 7;
const CLUSTER_UPDATE_INTERVAL = 10;

const STARVATION_RATE = 1.2;
const MIN_MOVEMENT_THRESHOLD = 0.5;
const IDLE_PENALTY_START = 20;
const IDLE_FITNESS_PENALTY = 0.2;
const MOVEMENT_REWARD_FACTOR = 0.23;
const STARVATION_DEATH_PENALTY = -30;

// Increase the base starvation rate
const BASE_STARVATION_INTERVAL = 150;

// Update survival pressure to increase faster
const SURVIVAL_PRESSURE_INCREASE = 0.001;

// Neural IO sizes
const INPUT_SIZE = 14;
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

  STARVATION_RATE,
  MIN_MOVEMENT_THRESHOLD,
  IDLE_PENALTY_START,
  IDLE_FITNESS_PENALTY,
  MOVEMENT_REWARD_FACTOR,
  STARVATION_DEATH_PENALTY,

  BASE_STARVATION_INTERVAL,
  SURVIVAL_PRESSURE_INCREASE,

  INPUT_SIZE,
  OUTPUT_SIZE,

  NEURAL_NET_CONFIG,
  REPRODUCTION_READY_THRESHOLD,
};
