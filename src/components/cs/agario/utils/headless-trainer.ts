// src/components/cs/agario/utils/headless-trainer.ts
// Headless training engine - runs evolution without rendering for 10-100x speedup

import { Genome, Neat, NodeType, NodeGene, ConnectionGene } from '../neat';
import { Blob, Food, Obstacle, BiomeConfig, ActivationFunction } from '../config/agario.types';
import {
  WORLD_WIDTH, WORLD_HEIGHT,
  INITIAL_BLOBS, MAX_POPULATION, MAX_FOOD,
  FOOD_SPAWN_RATE, INPUT_SIZE, OUTPUT_SIZE,
  NEAT_CONFIG, NUM_OBSTACLES, BLOB_MAX_MASS
} from '../config/agario.constants';

import { createBlob, giveBirth } from './reproduction';
import { simulateBlob, handleCollisions, applyCoriolisEffect } from './simulation';
import { spawnFood, updateSpatialGrid, getNearbyFood, createBiomes, ageFood } from './environment';
import { calculatePopulationFitness } from './fitness';
import { createEngineeredVisionSystem } from './feature-engineering';

// ===================== TYPES =====================

export interface TrainingConfig {
  populationSize: number;
  maxGenerations: number;
  ticksPerGeneration: number;
  eliteCount: number;           // Top performers to preserve
  mutationRate: number;
  saveInterval: number;         // Save checkpoint every N generations
  targetFitness: number;        // Stop when reached
  parallelWorlds: number;       // Run multiple simulations (future: Web Workers)
}

export interface TrainingProgress {
  generation: number;
  tick: number;
  population: number;
  bestFitness: number;
  avgFitness: number;
  maxGeneration: number;
  eliteGenomes: SerializedGenome[];
  totalBirths: number;
  totalDeaths: number;
  trainingSpeed: number;        // Ticks per second
  // Complexity metrics
  avgNodes: number;             // Average nodes per genome
  avgConnections: number;       // Average connections per genome
  maxNodes: number;             // Most complex genome (nodes)
  maxConnections: number;       // Most complex genome (connections)
  complexityScore: number;      // Combined complexity metric
}

export interface SerializedGenome {
  id: number;
  fitness: number;
  generation: number;
  nodes: Array<{
    id: number;
    type: 'input' | 'hidden' | 'output';
    bias: number;
    activation: string;
  }>;
  connections: Array<{
    innovation: number;
    from: number;
    to: number;
    weight: number;
    enabled: boolean;
  }>;
}

export interface TrainingCheckpoint {
  version: string;
  timestamp: number;
  config: TrainingConfig;
  progress: TrainingProgress;
  eliteGenomes: SerializedGenome[];
}

// ===================== DEFAULT CONFIG =====================

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  populationSize: INITIAL_BLOBS,
  maxGenerations: 10000,          // Allow very long training sessions
  ticksPerGeneration: 5000,       // ~83 seconds of sim time per generation (longer evaluation)
  eliteCount: 15,                 // Preserve more top performers
  mutationRate: 0.3,
  saveInterval: 25,               // Save more frequently
  targetFitness: 1000,            // High target - keep training until stopped
  parallelWorlds: 1
};

// Preset configurations for different training needs
export const TRAINING_PRESETS = {
  quick: {
    name: 'Quick Test',
    description: '5-10 minutes, basic training',
    maxGenerations: 50,
    ticksPerGeneration: 2000,
    eliteCount: 10,
    targetFitness: 200
  },
  standard: {
    name: 'Standard',
    description: '30-60 minutes, good results',
    maxGenerations: 200,
    ticksPerGeneration: 4000,
    eliteCount: 15,
    targetFitness: 400
  },
  extended: {
    name: 'Extended',
    description: '2-4 hours, complex behaviors',
    maxGenerations: 1000,
    ticksPerGeneration: 5000,
    eliteCount: 20,
    targetFitness: 600
  },
  overnight: {
    name: 'Overnight',
    description: '8+ hours, highly evolved agents',
    maxGenerations: 10000,
    ticksPerGeneration: 6000,
    eliteCount: 25,
    targetFitness: 1000
  },
  indefinite: {
    name: 'Indefinite',
    description: 'Run until stopped manually',
    maxGenerations: Infinity,
    ticksPerGeneration: 5000,
    eliteCount: 20,
    targetFitness: Infinity  // Never auto-stop
  }
} as const;

// ===================== HEADLESS TRAINER CLASS =====================

export class HeadlessTrainer {
  private config: TrainingConfig;
  private neat: Neat;
  private blobs: Blob[] = [];
  private food: Food[] = [];
  private obstacles: Obstacle[] = [];
  private biomes: BiomeConfig[] = [];
  private spatialGrid: Map<string, Food[]> = new Map();

  private nextBlobId = 0;
  private tick = 0;
  private generation = 1;
  private totalBirths = 0;
  private totalDeaths = 0;

  private isRunning = false;
  private isPaused = false;
  private startTime = 0;
  private ticksProcessed = 0;

  private eliteGenomes: SerializedGenome[] = [];
  private onProgress?: (progress: TrainingProgress) => void;
  private onCheckpoint?: (checkpoint: TrainingCheckpoint) => void;
  private onComplete?: (elites: SerializedGenome[]) => void;

  constructor(config: Partial<TrainingConfig> = {}) {
    this.config = { ...DEFAULT_TRAINING_CONFIG, ...config };
    this.neat = new Neat(INPUT_SIZE, OUTPUT_SIZE, this.config.populationSize, NEAT_CONFIG);
    this.initialize();
  }

  // ===================== INITIALIZATION =====================

  private initialize(): void {
    // Initialize biomes
    this.biomes = createBiomes(WORLD_WIDTH, WORLD_HEIGHT);

    // Initialize blobs from NEAT population
    this.blobs = [];
    for (const genome of this.neat.population) {
      const blob = createBlob(
        genome,
        1,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => this.nextBlobId++
      );
      this.blobs.push(blob);
    }

    // Initialize food
    this.food = spawnFood(
      [],
      this.biomes,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      MAX_FOOD / 2,
      MAX_FOOD,
      0
    );

    // Initialize obstacles
    this.obstacles = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      this.obstacles.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        radius: 20 + Math.random() * 20
      });
    }

    // Initialize spatial grid
    this.spatialGrid = updateSpatialGrid(this.food, 100);

    // Reset counters
    this.tick = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
  }

  // ===================== GENOME SERIALIZATION =====================

  private serializeGenome(genome: Genome, gen: number): SerializedGenome {
    const nodes: SerializedGenome['nodes'] = [];
    const connections: SerializedGenome['connections'] = [];

    // Serialize nodes - convert NodeType enum to string
    genome.nodes.forEach((node, id) => {
      let typeStr: 'input' | 'hidden' | 'output' = 'hidden';
      if (node.type === NodeType.INPUT) typeStr = 'input';
      else if (node.type === NodeType.OUTPUT) typeStr = 'output';
      else if (node.type === NodeType.HIDDEN) typeStr = 'hidden';

      nodes.push({
        id,
        type: typeStr,
        bias: 0, // NodeGene doesn't have bias, default to 0
        activation: node.activation || 'tanh'
      });
    });

    // Serialize connections
    genome.connections.forEach((conn, innovation) => {
      connections.push({
        innovation,
        from: conn.from,
        to: conn.to,
        weight: conn.weight,
        enabled: conn.enabled
      });
    });

    return {
      id: 0, // Genome doesn't have id, use 0
      fitness: genome.fitness,
      generation: gen,
      nodes,
      connections
    };
  }

  public static deserializeGenome(serialized: SerializedGenome, neat: Neat): Genome {
    const genome = new Genome(INPUT_SIZE, OUTPUT_SIZE);
    genome.fitness = serialized.fitness;

    // Clear default nodes and add serialized ones
    genome.nodes.clear();
    for (const node of serialized.nodes) {
      // Convert string type back to NodeType enum
      let nodeType: NodeType = NodeType.HIDDEN;
      if (node.type === 'input') nodeType = NodeType.INPUT;
      else if (node.type === 'output') nodeType = NodeType.OUTPUT;
      else if (node.type === 'hidden') nodeType = NodeType.HIDDEN;

      const nodeGene = new NodeGene(
        node.id,
        nodeType,
        node.activation as ActivationFunction
      );
      genome.nodes.set(node.id, nodeGene);
    }

    // Add connections using ConnectionGene class
    genome.connections.clear();
    for (const conn of serialized.connections) {
      const connGene = new ConnectionGene(
        conn.innovation,
        conn.from,
        conn.to,
        conn.weight,
        conn.enabled
      );
      genome.connections.set(conn.innovation, connGene);
    }

    return genome;
  }

  // ===================== SINGLE TICK UPDATE =====================

  private updateTick(): void {
    this.tick++;
    const tick = this.tick;
    const GRID_SIZE = 100;

    // Update spatial grid periodically
    if (tick % 5 === 0) {
      this.spatialGrid = updateSpatialGrid(this.food, GRID_SIZE);
    }

    // Spawn and age food
    this.food = spawnFood(
      this.food,
      this.biomes,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      FOOD_SPAWN_RATE,
      MAX_FOOD,
      this.blobs.length / MAX_POPULATION
    );
    this.food = ageFood(this.food);

    // Create vision system
    const visionSystem = createEngineeredVisionSystem();

    // Create giveBirth wrapper
    const giveBirthWrapper = (parent: Blob): boolean => {
      const result = giveBirth(
        parent,
        this.blobs,
        (genome: Genome) => {
          const mutated = genome.clone();
          this.neat.mutate(mutated);
          return mutated;
        },
        (genome, generation, parentId, x, y, color, familyLineage) => {
          return createBlob(
            genome,
            generation,
            parentId,
            x,
            y,
            color,
            familyLineage,
            () => this.nextBlobId++
          );
        },
        tick
      );

      if (result.success) {
        this.blobs = result.updatedBlobs!;
        this.totalBirths++;
        return true;
      }
      return false;
    };

    // Simulate each blob
    for (const blob of this.blobs) {
      simulateBlob(
        blob,
        this.blobs,
        this.food,
        this.obstacles,
        [],  // No logs in headless mode
        tick,
        this.spatialGrid,
        (x, y, range) => getNearbyFood(x, y, range, this.spatialGrid, GRID_SIZE),
        giveBirthWrapper,
        visionSystem
      );

      // Apply Coriolis effect
      applyCoriolisEffect(blob, WORLD_WIDTH, WORLD_HEIGHT);
    }

    // Track deaths
    const deadBlobsBefore = this.blobs.filter(b => b.shouldRemove).length;

    // Handle collisions
    const collisionResult = handleCollisions(
      this.blobs,
      this.obstacles,
      this.food,
      { current: this.totalDeaths }
    );

    this.blobs = collisionResult.updatedBlobs;
    this.food = collisionResult.updatedFood;

    // Remove dead blobs
    const deadBlobIds = new Set([
      ...this.blobs.filter(b => b.shouldRemove).map(b => b.id),
      ...(collisionResult.deadBlobIds || [])
    ]);

    this.totalDeaths += deadBlobIds.size;
    this.blobs = this.blobs.filter(b => !deadBlobIds.has(b.id));

    // Calculate fitness
    calculatePopulationFitness(this.blobs);
  }

  // ===================== GENERATION EVOLUTION =====================

  private evolveGeneration(): void {
    // Sort blobs by fitness
    const sortedBlobs = [...this.blobs].sort(
      (a, b) => (b.genome.fitness || 0) - (a.genome.fitness || 0)
    );

    // Extract elite genomes
    this.eliteGenomes = sortedBlobs
      .slice(0, this.config.eliteCount)
      .map(blob => this.serializeGenome(blob.genome, blob.generation));

    // Log generation stats
    const maxGen = Math.max(1, ...this.blobs.map(b => b.generation));
    const bestFitness = sortedBlobs[0]?.genome.fitness || 0;
    const avgFitness = this.blobs.reduce((s, b) => s + (b.genome.fitness || 0), 0) / Math.max(this.blobs.length, 1);

    console.log(`Gen ${this.generation}: Best=${bestFitness.toFixed(1)}, Avg=${avgFitness.toFixed(1)}, MaxLineage=${maxGen}, Pop=${this.blobs.length}`);

    // Check for target fitness reached (skip if Infinity for indefinite training)
    if (isFinite(this.config.targetFitness) && bestFitness >= this.config.targetFitness) {
      console.log(`🎯 Target fitness ${this.config.targetFitness} reached!`);
      this.stop();
      this.onComplete?.(this.eliteGenomes);
      return;
    }

    // Evolve NEAT population
    // Take top performers and create next generation
    const eliteGenomes = sortedBlobs
      .slice(0, Math.min(this.config.eliteCount, sortedBlobs.length))
      .map(b => b.genome);

    // Reset and repopulate
    this.generation++;
    this.tick = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;

    // Create new population from elites
    this.blobs = [];

    // Preserve elites unchanged
    for (const genome of eliteGenomes) {
      const blob = createBlob(
        genome.clone(),
        this.generation,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => this.nextBlobId++
      );
      this.blobs.push(blob);
    }

    // Fill rest with mutated offspring
    while (this.blobs.length < this.config.populationSize) {
      // Select random elite parent
      const parent = eliteGenomes[Math.floor(Math.random() * eliteGenomes.length)];
      const offspring = parent.clone();

      // Mutate
      this.neat.mutate(offspring);

      const blob = createBlob(
        offspring,
        this.generation,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => this.nextBlobId++
      );
      this.blobs.push(blob);
    }

    // Reset food
    this.food = spawnFood(
      [],
      this.biomes,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      MAX_FOOD / 2,
      MAX_FOOD,
      0
    );

    // Save checkpoint
    if (this.generation % this.config.saveInterval === 0) {
      this.saveCheckpoint();
    }

    // Check max generations (skip if Infinity for indefinite training)
    if (isFinite(this.config.maxGenerations) && this.generation >= this.config.maxGenerations) {
      console.log(`📊 Max generations (${this.config.maxGenerations}) reached`);
      this.stop();
      this.onComplete?.(this.eliteGenomes);
    }
  }

  // ===================== TRAINING LOOP =====================

  public async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.ticksProcessed = 0;

    console.log(`🚀 Starting headless training...`);
    console.log(`   Population: ${this.config.populationSize}`);
    console.log(`   Max Generations: ${this.config.maxGenerations}`);
    console.log(`   Ticks/Gen: ${this.config.ticksPerGeneration}`);
    console.log(`   Target Fitness: ${this.config.targetFitness}`);

    // Run training loop
    while (this.isRunning && !this.isPaused) {
      // Run batch of ticks (for better performance)
      const BATCH_SIZE = 100;
      for (let i = 0; i < BATCH_SIZE && this.tick < this.config.ticksPerGeneration; i++) {
        this.updateTick();
        this.ticksProcessed++;
      }

      // Check if generation complete
      if (this.tick >= this.config.ticksPerGeneration) {
        this.evolveGeneration();
      }

      // Report progress periodically
      if (this.ticksProcessed % 500 === 0) {
        this.reportProgress();
      }

      // Yield to allow UI updates (if running in browser)
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  public pause(): void {
    this.isPaused = true;
    console.log('⏸️ Training paused');
  }

  public resume(): void {
    if (!this.isRunning) return;
    this.isPaused = false;
    console.log('▶️ Training resumed');
    this.start();
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    console.log('⏹️ Training stopped');
  }

  // ===================== COMPLEXITY METRICS =====================

  private calculateComplexityMetrics(): {
    avgNodes: number;
    avgConnections: number;
    maxNodes: number;
    maxConnections: number;
    complexityScore: number;
  } {
    if (this.blobs.length === 0) {
      return { avgNodes: 0, avgConnections: 0, maxNodes: 0, maxConnections: 0, complexityScore: 0 };
    }

    let totalNodes = 0;
    let totalConnections = 0;
    let maxNodes = 0;
    let maxConnections = 0;

    for (const blob of this.blobs) {
      const nodeCount = blob.genome.nodes.size;
      const connectionCount = blob.genome.connections.size;

      totalNodes += nodeCount;
      totalConnections += connectionCount;

      if (nodeCount > maxNodes) maxNodes = nodeCount;
      if (connectionCount > maxConnections) maxConnections = connectionCount;
    }

    const avgNodes = totalNodes / this.blobs.length;
    const avgConnections = totalConnections / this.blobs.length;

    // Combined complexity score: weighted combination of nodes and connections
    // Connections are weighted more as they represent actual computation paths
    const complexityScore = avgNodes * 1.0 + avgConnections * 2.0;

    return { avgNodes, avgConnections, maxNodes, maxConnections, complexityScore };
  }

  // ===================== PROGRESS REPORTING =====================

  private reportProgress(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const ticksPerSecond = this.ticksProcessed / elapsed;

    const sortedBlobs = [...this.blobs].sort(
      (a, b) => (b.genome.fitness || 0) - (a.genome.fitness || 0)
    );

    const complexity = this.calculateComplexityMetrics();

    const progress: TrainingProgress = {
      generation: this.generation,
      tick: this.tick,
      population: this.blobs.length,
      bestFitness: sortedBlobs[0]?.genome.fitness || 0,
      avgFitness: this.blobs.reduce((s, b) => s + (b.genome.fitness || 0), 0) / Math.max(this.blobs.length, 1),
      maxGeneration: Math.max(1, ...this.blobs.map(b => b.generation)),
      eliteGenomes: this.eliteGenomes,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      trainingSpeed: ticksPerSecond,
      // Complexity metrics
      avgNodes: complexity.avgNodes,
      avgConnections: complexity.avgConnections,
      maxNodes: complexity.maxNodes,
      maxConnections: complexity.maxConnections,
      complexityScore: complexity.complexityScore
    };

    this.onProgress?.(progress);
  }

  // ===================== CHECKPOINTS =====================

  private saveCheckpoint(): void {
    const complexity = this.calculateComplexityMetrics();

    const checkpoint: TrainingCheckpoint = {
      version: '1.0',
      timestamp: Date.now(),
      config: this.config,
      progress: {
        generation: this.generation,
        tick: this.tick,
        population: this.blobs.length,
        bestFitness: this.eliteGenomes[0]?.fitness || 0,
        avgFitness: this.blobs.reduce((s, b) => s + (b.genome.fitness || 0), 0) / Math.max(this.blobs.length, 1),
        maxGeneration: Math.max(1, ...this.blobs.map(b => b.generation)),
        eliteGenomes: this.eliteGenomes,
        totalBirths: this.totalBirths,
        totalDeaths: this.totalDeaths,
        trainingSpeed: 0,
        // Complexity metrics
        avgNodes: complexity.avgNodes,
        avgConnections: complexity.avgConnections,
        maxNodes: complexity.maxNodes,
        maxConnections: complexity.maxConnections,
        complexityScore: complexity.complexityScore
      },
      eliteGenomes: this.eliteGenomes
    };

    this.onCheckpoint?.(checkpoint);
    console.log(`💾 Checkpoint saved at generation ${this.generation}`);
  }

  public loadCheckpoint(checkpoint: TrainingCheckpoint): void {
    this.config = checkpoint.config;
    this.generation = checkpoint.progress.generation;
    this.eliteGenomes = checkpoint.eliteGenomes;

    // Recreate population from elite genomes
    this.blobs = [];
    for (const serialized of checkpoint.eliteGenomes) {
      const genome = HeadlessTrainer.deserializeGenome(serialized, this.neat);
      const blob = createBlob(
        genome,
        serialized.generation,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => this.nextBlobId++
      );
      this.blobs.push(blob);
    }

    // Fill rest with mutated offspring
    while (this.blobs.length < this.config.populationSize) {
      const parent = this.blobs[Math.floor(Math.random() * this.blobs.length)];
      const offspring = parent.genome.clone();
      this.neat.mutate(offspring);

      const blob = createBlob(
        offspring,
        this.generation,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => this.nextBlobId++
      );
      this.blobs.push(blob);
    }

    console.log(`📂 Loaded checkpoint from generation ${this.generation}`);
  }

  // ===================== EVENT HANDLERS =====================

  public onProgressUpdate(callback: (progress: TrainingProgress) => void): void {
    this.onProgress = callback;
  }

  public onCheckpointSave(callback: (checkpoint: TrainingCheckpoint) => void): void {
    this.onCheckpoint = callback;
  }

  public onTrainingComplete(callback: (elites: SerializedGenome[]) => void): void {
    this.onComplete = callback;
  }

  // ===================== GETTERS =====================

  public getEliteGenomes(): SerializedGenome[] {
    return this.eliteGenomes;
  }

  public getProgress(): TrainingProgress {
    const sortedBlobs = [...this.blobs].sort(
      (a, b) => (b.genome.fitness || 0) - (a.genome.fitness || 0)
    );

    const complexity = this.calculateComplexityMetrics();

    return {
      generation: this.generation,
      tick: this.tick,
      population: this.blobs.length,
      bestFitness: sortedBlobs[0]?.genome.fitness || 0,
      avgFitness: this.blobs.reduce((s, b) => s + (b.genome.fitness || 0), 0) / Math.max(this.blobs.length, 1),
      maxGeneration: Math.max(1, ...this.blobs.map(b => b.generation)),
      eliteGenomes: this.eliteGenomes,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      trainingSpeed: 0,
      // Complexity metrics
      avgNodes: complexity.avgNodes,
      avgConnections: complexity.avgConnections,
      maxNodes: complexity.maxNodes,
      maxConnections: complexity.maxConnections,
      complexityScore: complexity.complexityScore
    };
  }

  public isTraining(): boolean {
    return this.isRunning && !this.isPaused;
  }
}

// ===================== QUICK TRAINING HELPER =====================

export async function trainHeadless(
  config: Partial<TrainingConfig> = {},
  onProgress?: (progress: TrainingProgress) => void
): Promise<SerializedGenome[]> {
  return new Promise((resolve) => {
    const trainer = new HeadlessTrainer(config);

    if (onProgress) {
      trainer.onProgressUpdate(onProgress);
    }

    trainer.onTrainingComplete((elites) => {
      resolve(elites);
    });

    trainer.start();
  });
}
