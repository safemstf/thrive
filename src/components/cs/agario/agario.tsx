// src/components/cs/agario/agario.tsx
'use client'

import React, {
  useRef, useEffect, useState, useCallback
} from "react";

import {
  RefreshCw, Brain, Trophy,
  ChevronUp, ChevronDown,
  ZoomIn, ZoomOut, Maximize2, X, Crosshair, Users, Move, Lock, Unlock
} from "lucide-react";

import {
  Genome, Neat, NodeType, NeatConfig
} from './neat';
import {
  Container,
  MaxWidthWrapper,
  Header,
  Title,
  Subtitle,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  LeaderboardHUD,
  ViewportControls,
  ViewportButton,
  ZoomIndicator,
  ControlsDrawer,
  DrawerHandle,
  DrawerContent,
  StatCard,
  Grid,
  LeaderboardEntry,
  NeuralNetModal,
  NeuralNetPanel,
  CloseButton,
  CanvasWrapper,
  NeuralNetCanvas,
  BlobInfo,
  NeuralNetControls,
  ControlButton,
} from './agario.styles';

import {
  TerrainZone, ZoneType, Food, FoodCluster, Obstacle, Log, Blob, NeuralLayout, NeuralNode, NeuralConnection
} from './agario.types';

import {
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
  NEAT_CONFIG
} from './agario.constants';



// ===================== PROPS INTERFACE =====================

interface AgarioDemoProps {
  isRunning?: boolean;
  speed?: number;
}

// ===================== MAIN COMPONENT =====================

export default function AgarioDemo({
  isRunning: isRunningProp = false,
  speed: speedProp = 1
}: AgarioDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuralNetCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Simulation state refs
  const blobsRef = useRef<Blob[]>([]);
  const foodRef = useRef<Food[]>([]);
  const foodClustersRef = useRef<FoodCluster[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const logsRef = useRef<Log[]>([]);
  const terrainZonesRef = useRef<TerrainZone[]>([]);
  const neatRef = useRef<Neat | null>(null);
  const nextBlobIdRef = useRef(0);
  const nextLogIdRef = useRef(0);
  const tickCountRef = useRef(0);
  const totalDeathsRef = useRef(0);
  const totalBirthsRef = useRef(0);
  const survivalPressureRef = useRef(0);

  // Spatial grid for performance
  const GRID_SIZE = 100;
  const spatialGridRef = useRef<Map<string, Food[]>>(new Map());

  // Camera
  const cameraRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 0.9 });
  const [zoom, setZoom] = useState(0.9);
  const [followBest, setFollowBest] = useState(false);

  // Panning
  const [isPanning, setIsPanning] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // UI State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);

  // Neural net visualization state
  const [neuralLayout, setNeuralLayout] = useState<NeuralLayout | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const [hoveringNodeId, setHoveringNodeId] = useState<number | null>(null);
  const [hoveringConnection, setHoveringConnection] = useState<{ from: number, to: number } | null>(null);
  const [neuralNetMode, setNeuralNetMode] = useState<'physics' | 'fixed'>('physics');
  const [showActivations, setShowActivations] = useState(true);
  const [lastInputs, setLastInputs] = useState<number[]>([]);
  const [lastOutputs, setLastOutputs] = useState<number[]>([]);

  // Stats for display
  const [stats, setStats] = useState({
    generation: 1,
    totalKills: 0,
    totalDeaths: 0,
    totalBirths: 0,
    avgMass: 30,
    bestFitness: 0,
    speciesCount: 1,
    avgNodes: INPUT_SIZE + OUTPUT_SIZE,
    avgConnections: INPUT_SIZE * OUTPUT_SIZE,
    tickCount: 0,
    population: INITIAL_BLOBS,
    largestFamily: 0,
    survivalPressure: 0,
    avgAge: 0,
    reproductionRate: 0
  });

  // Refs for animation loop
  const isRunningRef = useRef(false);
  const speedRef = useRef(1);

  // Sync state with refs
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Sync props to state
  useEffect(() => { setIsRunning(isRunningProp); }, [isRunningProp]);
  useEffect(() => { setSpeed(speedProp); }, [speedProp]);

  // ===================== HELPER FUNCTIONS =====================

  const randomColor = useCallback(() => {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 55%)`;
  }, []);

  const distance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getZoneAt = useCallback((x: number, y: number): ZoneType => {
    for (const zone of terrainZonesRef.current) {
      if (x >= zone.x && x < zone.x + zone.width &&
        y >= zone.y && y < zone.y + zone.height) {
        return zone.type;
      }
    }
    return 'neutral';
  }, []);

  // Spatial grid helpers
  const getGridKey = useCallback((x: number, y: number): string => {
    const gx = Math.floor(x / GRID_SIZE);
    const gy = Math.floor(y / GRID_SIZE);
    return `${gx},${gy}`;
  }, []);

  const updateSpatialGrid = useCallback(() => {
    spatialGridRef.current.clear();

    for (const food of foodRef.current) {
      const key = getGridKey(food.x, food.y);
      if (!spatialGridRef.current.has(key)) {
        spatialGridRef.current.set(key, []);
      }
      spatialGridRef.current.get(key)!.push(food);
    }
  }, [getGridKey]);

  const getNearbyFood = useCallback((x: number, y: number, range: number): Food[] => {
    const nearby: Food[] = [];
    const cellRange = Math.ceil(range / GRID_SIZE);
    const centerX = Math.floor(x / GRID_SIZE);
    const centerY = Math.floor(y / GRID_SIZE);

    for (let dx = -cellRange; dx <= cellRange; dx++) {
      for (let dy = -cellRange; dy <= cellRange; dy++) {
        const key = `${centerX + dx},${centerY + dy}`;
        const cellFood = spatialGridRef.current.get(key);
        if (cellFood) {
          nearby.push(...cellFood);
        }
      }
    }

    return nearby;
  }, []);

  // ===================== FOOD CLUSTERING (LOD SYSTEM) =====================

  const clusterFood = useCallback(() => {
    const clusters: FoodCluster[] = [];
    const processed = new Set<Food>();

    for (const food of foodRef.current) {
      if (processed.has(food)) continue;

      const nearby: Food[] = [food];
      processed.add(food);

      for (const other of foodRef.current) {
        if (processed.has(other)) continue;

        const dist = distance(food.x, food.y, other.x, other.y);
        if (dist < CLUSTER_DISTANCE) {
          nearby.push(other);
          processed.add(other);
        }
      }

      if (nearby.length >= MIN_CLUSTER_SIZE) {
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
        for (const f of nearby) {
          processed.delete(f);
        }
      }
    }

    foodClustersRef.current = clusters;
  }, [distance]);

  // ===================== NATURAL REPRODUCTION SYSTEM =====================

  const createBlob = useCallback((genome: Genome, generation: number, parentId?: number, x?: number, y?: number): Blob => {
    const blobX = x ?? Math.random() * WORLD_WIDTH;
    const blobY = y ?? Math.random() * WORLD_HEIGHT;

    const parent = parentId !== undefined ? blobsRef.current.find(b => b.id === parentId) : undefined;

    const blob: Blob = {
      id: nextBlobIdRef.current++,
      x: blobX,
      y: blobY,
      vx: 0,
      vy: 0,
      mass: 30,
      color: parent?.color ?? randomColor(),
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
      familyLineage: parent?.familyLineage ?? nextBlobIdRef.current - 1,
      lastReproductionTick: 0,
      birthsGiven: 0
    };

    if (parent) {
      parent.childrenIds.push(blob.id);
    }

    return blob;
  }, [randomColor]);

  const giveBirth = useCallback((parent: Blob) => {
    if (blobsRef.current.length >= MAX_POPULATION) return false;

    // Check reproduction conditions
    const currentTick = tickCountRef.current;
    const canReproduce =
      parent.age >= MIN_AGE_FOR_REPRODUCTION &&
      parent.mass >= REPRODUCTION_MIN_MASS &&
      (parent.kills > 0 || parent.foodEaten >= FOOD_FOR_REPRODUCTION) &&
      (currentTick - parent.lastReproductionTick) > REPRODUCTION_COOLDOWN;

    if (!canReproduce) return false;

    // Create baby genome with mutations
    const babyGenome = parent.genome.clone();
    neatRef.current!.mutate(babyGenome);
    babyGenome.fitness = 0;

    // Create baby near parent
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const bx = parent.x + Math.cos(angle) * distance;
    const by = parent.y + Math.sin(angle) * distance;

    const baby = createBlob(babyGenome, parent.generation + 1, parent.id, bx, by);
    baby.mass = 25;

    // Parent loses mass for reproduction
    parent.mass = Math.max(30, parent.mass * 0.7);
    parent.lastReproductionTick = currentTick;
    parent.birthsGiven++;

    blobsRef.current.push(baby);
    totalBirthsRef.current++;

    console.log(`👶 Blob #${baby.id} born to parent #${parent.id} (${parent.birthsGiven} children, lineage ${baby.familyLineage})`);
    return true;
  }, [createBlob]);

  // ===================== INITIALIZATION =====================

  const initNEAT = useCallback(() => {
    neatRef.current = new Neat(INPUT_SIZE, OUTPUT_SIZE, INITIAL_BLOBS, NEAT_CONFIG);
  }, []);

  const spawnFood = useCallback((count: number = FOOD_SPAWN_RATE) => {
    for (let i = 0; i < count && foodRef.current.length < MAX_FOOD; i++) {
      let x = Math.random() * WORLD_WIDTH;
      let y = Math.random() * WORLD_HEIGHT;

      const zone = getZoneAt(x, y);
      if (zone === 'danger' && Math.random() < 0.7) {
        x = Math.random() * WORLD_WIDTH;
        y = Math.random() * WORLD_HEIGHT;
      }

      foodRef.current.push({
        x, y,
        mass: 2 + Math.random() * 2,
        age: 0
      });
    }
  }, [getZoneAt]);

  const initTerrainZones = useCallback(() => {
    terrainZonesRef.current = [];

    // Create safe zones
    for (let i = 0; i < 3; i++) {
      terrainZonesRef.current.push({
        x: Math.random() * (WORLD_WIDTH - 600),
        y: Math.random() * (WORLD_HEIGHT - 600),
        width: 300 + Math.random() * 300,
        height: 300 + Math.random() * 300,
        type: 'safe'
      });
    }

    // Create danger zones
    for (let i = 0; i < 2; i++) {
      terrainZonesRef.current.push({
        x: Math.random() * (WORLD_WIDTH - 600),
        y: Math.random() * (WORLD_HEIGHT - 600),
        width: 400 + Math.random() * 400,
        height: 400 + Math.random() * 400,
        type: 'danger'
      });
    }
  }, []);

  const initObstacles = useCallback(() => {
    obstaclesRef.current = [];

    for (let i = 0; i < NUM_OBSTACLES; i++) {
      const x = 100 + Math.random() * (WORLD_WIDTH - 200);
      const y = 100 + Math.random() * (WORLD_HEIGHT - 200);
      const zone = getZoneAt(x, y);

      if (zone === 'safe' && Math.random() < 0.6) continue;

      obstaclesRef.current.push({
        x, y,
        radius: 20 + Math.random() * 20
      });
    }
  }, [getZoneAt]);

  const initLogs = useCallback(() => {
    logsRef.current = [];

    for (let i = 0; i < NUM_LOGS; i++) {
      logsRef.current.push({
        id: nextLogIdRef.current++,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        width: 40 + Math.random() * 30,
        height: 15,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }, []);

  const initSimulation = useCallback(() => {
    initNEAT();
    initTerrainZones();

    blobsRef.current = [];
    foodRef.current = [];
    nextBlobIdRef.current = 0;
    nextLogIdRef.current = 0;
    tickCountRef.current = 0;
    totalDeathsRef.current = 0;
    totalBirthsRef.current = 0;
    survivalPressureRef.current = 0;

    // Create initial blobs from NEAT population
    for (const genome of neatRef.current!.population) {
      blobsRef.current.push(createBlob(genome, 1));
    }

    // Spawn initial food
    for (let i = 0; i < MAX_FOOD; i++) {
      spawnFood(1);
    }

    initObstacles();
    initLogs();

    setStats({
      generation: 1,
      totalKills: 0,
      totalDeaths: 0,
      totalBirths: 0,
      avgMass: 30,
      bestFitness: 0,
      speciesCount: 1,
      avgNodes: INPUT_SIZE + OUTPUT_SIZE,
      avgConnections: INPUT_SIZE * OUTPUT_SIZE,
      tickCount: 0,
      population: INITIAL_BLOBS,
      largestFamily: 0,
      survivalPressure: 0,
      avgAge: 0,
      reproductionRate: 0
    });

    setSelectedBlob(null);

    console.log(`🚀 Initialized: ${blobsRef.current.length} blobs, ${foodRef.current.length} food`);
  }, [initNEAT, createBlob, initObstacles, initLogs, initTerrainZones, spawnFood]);

  // ===================== VISION SYSTEM =====================

  const getVision = useCallback((blob: Blob): number[] => {
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
      for (const obs of obstaclesRef.current) {
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
        for (const other of blobsRef.current) {
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
              } else if (massRatio < 0.87) {  // I'm > 1.15× their size
                // Encode how much bigger I am in the signal strength
                const advantage = (1 / massRatio) - 1;  // 0 to ~inf
                const advantageFactor = Math.min(1, advantage * 0.5); // Cap at 1
                bestSignal = (0.5 + advantageFactor * 0.4) * (1 - dist / VISION_RANGE);
              } else if (massRatio > 1.15) {  // They're > 1.15× my size
                // Encode how much bigger they are
                const threat = massRatio - 1;  // 0 to ~inf
                const threatFactor = Math.min(1, threat * 0.3); // Cap at 1
                bestSignal = -(0.5 + threatFactor * 0.3) * (1 - dist / VISION_RANGE);
              } else {
                // Similar size - encode the small difference
                const sizeDiff = (massRatio - 1) * 5; // Amplify small differences
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
    const wallDist = Math.min(blob.x, blob.y, WORLD_WIDTH - blob.x, WORLD_HEIGHT - blob.y);
    inputs[11] = Math.max(0, 1 - wallDist / 150);

    // Zone awareness
    const zone = getZoneAt(blob.x, blob.y);
    inputs[12] = zone === 'safe' ? 0.5 : zone === 'danger' ? -0.5 : 0;

    // Log grabbing
    inputs[13] = blob.grabbedLog !== undefined ? 1 : 0;

    // Nearby log
    let nearestLog = Infinity;
    for (const log of logsRef.current) {
      if (log.grabbedBy !== undefined && log.grabbedBy !== blob.id) continue;
      const dist = distance(blob.x, blob.y, log.x, log.y);
      if (dist < nearestLog) nearestLog = dist;
    }
    inputs[14] = nearestLog < 100 ? (1 - nearestLog / 100) : 0;

    // Family nearby
    let familyNearby = 0;
    for (const other of blobsRef.current) {
      if (other.id === blob.id) continue;
      if (other.familyLineage === blob.familyLineage) {
        const dist = distance(blob.x, blob.y, other.x, other.y);
        if (dist < VISION_RANGE) {
          familyNearby = Math.max(familyNearby, 1 - dist / VISION_RANGE);
        }
      }
    }
    inputs[15] = familyNearby;

    inputs[16] = Math.min(1, blob.idleTicks / 200); // Normalized idle time (0-1)

    return inputs;
  }, [getNearbyFood, getZoneAt, distance]);

  // ===================== UPDATE LOOP =====================

  const update = useCallback(() => {
    if (!isRunningRef.current || !neatRef.current) return;

    tickCountRef.current++;
    const tick = tickCountRef.current;

    // Update spatial grid every 5 frames
    if (tick % 5 === 0) {
      updateSpatialGrid();
    }

    // Update food clusters every 10 frames
    if (tick % CLUSTER_UPDATE_INTERVAL === 0) {
      clusterFood();
    }

    // Spawn food
    spawnFood();

    // Age food
    for (let i = foodRef.current.length - 1; i >= 0; i--) {
      foodRef.current[i].age++;
      if (foodRef.current[i].age > 5000) {
        foodRef.current.splice(i, 1);
      }
    }

    // Increase survival pressure slowly
    if (tick % 200 === 0) {
      survivalPressureRef.current += SURVIVAL_PRESSURE_INCREASE;

      if (obstaclesRef.current.length < MAX_OBSTACLES && Math.random() < survivalPressureRef.current * 0.5) {
        obstaclesRef.current.push({
          x: Math.random() * WORLD_WIDTH,
          y: Math.random() * WORLD_HEIGHT,
          radius: 15 + Math.random() * 20
        });
      }
    }

    const blobsToRemove: Set<number> = new Set();
    let killsThisTick = 0;

    // Update each blob
    for (const blob of blobsRef.current) {
      if (blobsToRemove.has(blob.id)) continue;

      blob.age++;
      blob.visionUpdateCounter++;

      // Neural network decision
      let inputs: number[];
      if (!blob.cachedVision || blob.visionUpdateCounter >= VISION_UPDATE_INTERVAL) {
        inputs = getVision(blob);
        blob.cachedVision = inputs;
        blob.visionUpdateCounter = 0;
      } else {
        inputs = blob.cachedVision;
      }

      const outputs = blob.genome.activate(inputs);

      // Apply outputs
      const acceleration = Math.tanh(outputs[0]) * 0.45;
      const rotation = Math.tanh(outputs[1]) * 0.2;
      const grabSignal = Math.tanh(outputs[2]);

      // Grab/Drop log
      if (grabSignal > 0.6 && blob.grabbedLog === undefined) {
        for (const log of logsRef.current) {
          if (log.grabbedBy !== undefined) continue;
          const dist = distance(blob.x, blob.y, log.x, log.y);
          if (dist < 50) {
            log.grabbedBy = blob.id;
            blob.grabbedLog = log.id;
            blob.genome.fitness += 5;
            break;
          }
        }
      } else if (grabSignal < -0.6 && blob.grabbedLog !== undefined) {
        const log = logsRef.current.find(l => l.id === blob.grabbedLog);
        if (log) {
          log.grabbedBy = undefined;
          blob.grabbedLog = undefined;
        }
      }

      // Move grabbed log
      if (blob.grabbedLog !== undefined) {
        const log = logsRef.current.find(l => l.id === blob.grabbedLog);
        if (log) {
          log.x = blob.x;
          log.y = blob.y;
        }
      }

      const currentAngle = Math.atan2(blob.vy, blob.vx) || Math.random() * Math.PI * 2;
      const newAngle = currentAngle + rotation;

      blob.vx += Math.cos(newAngle) * acceleration;
      blob.vy += Math.sin(newAngle) * acceleration;

      // Friction
      blob.vx *= 0.95;
      blob.vy *= 0.95;

      // Speed limit
      const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
      const maxSpeed = 5 / Math.sqrt(blob.mass / 30);
      if (speed > maxSpeed) {
        blob.vx = (blob.vx / speed) * maxSpeed;
        blob.vy = (blob.vy / speed) * maxSpeed;
      }

      // Move
      blob.x += blob.vx;
      blob.y += blob.vy;

      // Wrap around
      if (blob.x < 0) blob.x += WORLD_WIDTH;
      if (blob.x > WORLD_WIDTH) blob.x -= WORLD_WIDTH;
      if (blob.y < 0) blob.y += WORLD_HEIGHT;
      if (blob.y > WORLD_HEIGHT) blob.y -= WORLD_HEIGHT;

      // Track movement
      const distMoved = distance(blob.x, blob.y, blob.lastX, blob.lastY);
      if (distMoved < WORLD_WIDTH / 2) {
        blob.distanceTraveled += distMoved;

        if (distMoved < MIN_MOVEMENT_THRESHOLD) {
          blob.idleTicks++;
          // Start penalizing sooner and more severely
          if (blob.idleTicks > IDLE_PENALTY_START) {
            blob.genome.fitness -= IDLE_FITNESS_PENALTY;
            // Apply gradual starvation when idle
            if (tick % 10 === 0) {
              const idleStarvation = (blob.idleTicks - IDLE_PENALTY_START) * 0.1;
              blob.mass = Math.max(20, blob.mass - idleStarvation);
            }
          }
        } else {
          blob.idleTicks = 0;
          // Reward movement more
          blob.genome.fitness += distMoved * MOVEMENT_REWARD_FACTOR;
        }
      }
      blob.lastX = blob.x;
      blob.lastY = blob.y;

      // Starvation
      if (tick % BASE_STARVATION_INTERVAL === 0) {
        // Base starvation - everyone loses mass
        const baseMassLoss = STARVATION_RATE;
        blob.mass = Math.max(15, blob.mass - baseMassLoss);

        // // Additional penalty for low movement
        // if (blob.idleTicks > 50) {
        //   blob.mass = Math.max(15, blob.mass - (blob.idleTicks / 10));
        // }

        if (blob.mass <= 7) {
          blobsToRemove.add(blob.id);
          blob.genome.fitness += STARVATION_DEATH_PENALTY;
          console.log(`💀 Blob #${blob.id} starved to death after ${blob.idleTicks} idle ticks`);
        }
      }

      // Natural reproduction attempt (2% chance per tick if conditions met)
      if (blobsRef.current.length < MAX_POPULATION && Math.random() < 0.02) {
        giveBirth(blob);
      }
    }

    // Obstacle collisions
    for (const blob of blobsRef.current) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;

      for (const obs of obstaclesRef.current) {
        const dist = distance(blob.x, blob.y, obs.x, obs.y);

        if (dist < blobRadius + obs.radius) {
          // Drop food pellets
          const pelletCount = Math.floor(blob.mass / 3);
          for (let p = 0; p < pelletCount; p++) {
            const angle = (Math.PI * 2 * p) / pelletCount;
            const spread = 15 + Math.random() * 25;
            foodRef.current.push({
              x: blob.x + Math.cos(angle) * spread,
              y: blob.y + Math.sin(angle) * spread,
              mass: 2.5,
              age: 0
            });
          }

          blob.genome.fitness -= 40;
          blobsToRemove.add(blob.id);
          totalDeathsRef.current++;
          break;
        }
      }
    }

    // Food eating
    for (let i = foodRef.current.length - 1; i >= 0; i--) {
      const f = foodRef.current[i];

      for (const blob of blobsRef.current) {
        if (blobsToRemove.has(blob.id)) continue;

        const blobRadius = Math.sqrt(blob.mass) * 2.5;
        const dist = distance(blob.x, blob.y, f.x, f.y);

        if (dist < blobRadius) {
          blob.mass += f.mass;
          blob.foodEaten++;
          blob.genome.fitness += 2;
          foodRef.current.splice(i, 1);
          break;
        }
      }
    }

    // Blob eating blob (NO FAMILY EATING)
    for (const blob of blobsRef.current) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;

      for (const other of blobsRef.current) {
        if (blob.id === other.id || blobsToRemove.has(other.id)) continue;

        // // Don't eat family
        // if (blob.familyLineage === other.familyLineage) continue;

        if (blob.mass > other.mass * 1.15) {
          const dist = distance(blob.x, blob.y, other.x, other.y);

          if (dist < blobRadius * 0.8) {
            // Eat!
            blob.mass += other.mass * 0.7;
            blob.kills++;
            blob.genome.fitness += 35;
            killsThisTick++;

            // Drop some food
            const pelletCount = Math.floor(other.mass / 6);
            for (let p = 0; p < pelletCount; p++) {
              const angle = Math.random() * Math.PI * 2;
              const spread = 10 + Math.random() * 15;
              foodRef.current.push({
                x: other.x + Math.cos(angle) * spread,
                y: other.y + Math.sin(angle) * spread,
                mass: 2,
                age: 0
              });
            }

            other.genome.fitness -= 15;
            blobsToRemove.add(other.id);
            totalDeathsRef.current++;
          }
        }
      }
    }

    // Remove dead blobs - NO REPLACEMENT FROM THIN AIR
    blobsRef.current = blobsRef.current.filter(b => !blobsToRemove.has(b.id));

    // Calculate fitness

    for (const blob of blobsRef.current) {
      blob.genome.fitness = 0;

      // Base survival
      blob.genome.fitness += Math.min(blob.age / 200, 2);

      // Mass growth
      if (blob.mass > 30) {
        const massFactor = Math.log2(blob.mass / 30);
        blob.genome.fitness += massFactor * 35;
      }

      // Kills
      if (blob.kills > 0) {
        blob.genome.fitness += blob.kills * 400;
        if (blob.kills > 1) {
          blob.genome.fitness += Math.pow(blob.kills, 1.5) * 40;
        }
      }

      // Food eating
      blob.genome.fitness += blob.foodEaten * 20;

      // Family bonus
      const familySize = blobsRef.current.filter(b => b.familyLineage === blob.familyLineage).length;
      blob.genome.fitness += familySize * 8;

      // Reproduction bonus
      if (blob.birthsGiven > 0) {
        blob.genome.fitness += blob.birthsGiven * 80;
      }

      // Movement efficiency and penalties
      if (blob.age > 0) {
        const movementRatio = blob.distanceTraveled / Math.max(blob.age, 1);
        const explorationScore = movementRatio * 100;

        // Severe penalty for low movement
        if (movementRatio < 0.15) {
          blob.genome.fitness *= 0.5; // 50% reduction for being stationary
        } else if (movementRatio < 0.3) {
          blob.genome.fitness *= 0.7; // 30% reduction for low movement
        }

        // Add movement-based bonus
        const movementBonus = Math.min(50, movementRatio * 200);
        blob.genome.fitness += movementBonus;

        // Add exploration score
        blob.genome.fitness += Math.min(explorationScore, 40);
      }

      // Idle ticks penalty
      if (blob.idleTicks > 50) {
        // Exponential penalty for long idle periods
        const idlePenalty = Math.min(0.9, blob.idleTicks / 200);
        blob.genome.fitness *= (1 - idlePenalty);
      }

      // Complexity bonus (smaller to avoid bloat)
      const baseNodeCount = INPUT_SIZE + OUTPUT_SIZE;
      const baseConnectionCount = INPUT_SIZE * OUTPUT_SIZE;
      const extraNodes = blob.genome.nodes.size - baseNodeCount;
      const extraConnections = blob.genome.connections.size - baseConnectionCount;

      if (extraNodes > 0) blob.genome.fitness += extraNodes * 1;
      if (extraConnections > 0) blob.genome.fitness += extraConnections * 0.3;

      // Specialization bonus
      const specializationScore =
        (blob.kills > 0 ? 40 : 0) +
        (blob.foodEaten > 15 ? 80 : 0) +
        (blob.mass > 80 ? 150 : 0) +
        (blob.childrenIds.length > 0 ? 120 : 0);
      blob.genome.fitness += specializationScore;

      // Cap fitness
      blob.genome.fitness = Math.min(blob.genome.fitness, 10000);
    }

    // Update stats
    const avgMass = blobsRef.current.reduce((s, b) => s + b.mass, 0) / Math.max(blobsRef.current.length, 1);
    const avgAge = blobsRef.current.reduce((s, b) => s + b.age, 0) / Math.max(blobsRef.current.length, 1);
    const bestFitness = Math.max(0, ...blobsRef.current.map(b => b.genome.fitness));
    const maxGen = Math.max(1, ...blobsRef.current.map(b => b.generation));

    // Family stats
    const familySizes = new Map<number, number>();
    for (const blob of blobsRef.current) {
      familySizes.set(blob.familyLineage, (familySizes.get(blob.familyLineage) || 0) + 1);
    }
    const largestFamily = Math.max(0, ...Array.from(familySizes.values()));

    // Reproduction rate (births per 1000 ticks)
    const reproductionRate = totalBirthsRef.current / (tickCountRef.current / 1000);

    setStats(prev => ({
      generation: maxGen,
      totalKills: prev.totalKills + killsThisTick,
      totalDeaths: totalDeathsRef.current,
      totalBirths: totalBirthsRef.current,
      avgMass,
      bestFitness,
      speciesCount: familySizes.size,
      avgNodes: blobsRef.current.reduce((s, b) => s + b.genome.nodes.size, 0) / Math.max(blobsRef.current.length, 1),
      avgConnections: blobsRef.current.reduce((s, b) => s + b.genome.connections.size, 0) / Math.max(blobsRef.current.length, 1),
      tickCount: tick,
      population: blobsRef.current.length,
      largestFamily,
      survivalPressure: survivalPressureRef.current,
      avgAge,
      reproductionRate
    }));
  }, [getVision, spawnFood, createBlob, distance, getZoneAt, updateSpatialGrid, clusterFood, giveBirth]);

  // ===================== INTERACTIVE NEURAL NET VISUALIZATION =====================

  // Update the createNeuralLayout function to use actual container dimensions
  const createNeuralLayout = useCallback((genome: Genome, width: number, height: number): NeuralLayout => {
    const nodes = new Map<number, NeuralNode>();
    const connections: NeuralConnection[] = [];

    // Categorize nodes
    const inputNodes: number[] = [];
    const hiddenNodes: number[] = [];
    const outputNodes: number[] = [];

    for (const [id, node] of genome.nodes) {
      if (node.type === NodeType.INPUT) inputNodes.push(id);
      else if (node.type === NodeType.HIDDEN) hiddenNodes.push(id);
      else if (node.type === NodeType.OUTPUT) outputNodes.push(id);
    }

    inputNodes.sort((a, b) => a - b);
    hiddenNodes.sort((a, b) => a - b);
    outputNodes.sort((a, b) => a - b);

    // Use actual container dimensions
    const nodeRadius = Math.min(16, width * 0.015);

    // Position input nodes (left side)
    const inputX = width * 0.15;
    const inputSpacing = Math.min(60, height / Math.max(inputNodes.length, 8));
    const inputHeight = (inputNodes.length - 1) * inputSpacing;
    const inputYStart = (height - inputHeight) / 2;

    inputNodes.forEach((id, i) => {
      const node = genome.nodes.get(id)!;
      nodes.set(id, {
        id,
        x: inputX,
        y: inputYStart + i * inputSpacing,
        radius: nodeRadius,
        type: 'input',
        label: i < 17 ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'M', 'Vx', 'Vy', 'Wall', 'Zone', 'Grab', 'Log', 'Fam', 'Idle'][i] : `I${i}`,
        activation: node.activation,
        isLocked: true,
        vx: 0,
        vy: 0
      });
    });

    // Position hidden nodes (center, in columns)
    const hiddenColumnCount = Math.min(4, Math.max(1, Math.floor(hiddenNodes.length / 3)));
    const columnWidth = (width * 0.7) / (hiddenColumnCount + 2);
    const hiddenColumns: number[][] = Array(hiddenColumnCount).fill(null).map(() => []);

    hiddenNodes.forEach((id, index) => {
      const col = index % hiddenColumnCount;
      hiddenColumns[col].push(id);
    });

    hiddenColumns.forEach((column, colIndex) => {
      const colX = width * 0.25 + (colIndex + 1) * columnWidth;
      const colSpacing = Math.min(70, height / Math.max(column.length, 6));
      const colHeight = (column.length - 1) * colSpacing;
      const colYStart = (height - colHeight) / 2;

      column.forEach((id, rowIndex) => {
        const node = genome.nodes.get(id)!;
        const activationMap: Record<string, string> = {
          'tanh': 'T', 'sigmoid': 'S', 'relu': 'R', 'leaky_relu': 'L'
        };
        const label = activationMap[node.activation] || 'H';

        nodes.set(id, {
          id,
          x: colX + (Math.random() * 30 - 15), // Add some random spread
          y: colYStart + rowIndex * colSpacing + (Math.random() * 20 - 10),
          radius: nodeRadius * 1.3,
          type: 'hidden',
          label,
          activation: node.activation,
          isLocked: false,
          vx: 0,
          vy: 0
        });
      });
    });

    // Position output nodes (right side)
    const outputX = width * 0.85;
    const outputSpacing = Math.min(60, height / Math.max(outputNodes.length, 8));
    const outputHeight = (outputNodes.length - 1) * outputSpacing;
    const outputYStart = (height - outputHeight) / 2;

    outputNodes.forEach((id, i) => {
      const node = genome.nodes.get(id)!;
      nodes.set(id, {
        id,
        x: outputX,
        y: outputYStart + i * outputSpacing,
        radius: nodeRadius,
        type: 'output',
        label: ['Acc', 'Rot', 'Grab'][i] || `O${i}`,
        activation: node.activation,
        isLocked: true,
        vx: 0,
        vy: 0
      });
    });

    // Create connections
    for (const conn of genome.connections.values()) {
      if (conn.enabled) {
        connections.push({
          from: conn.from,
          to: conn.to,
          weight: conn.weight,
          enabled: conn.enabled
        });
      }
    }

    return { nodes, connections };
  }, []);


  const applyPhysics = useCallback((layout: NeuralLayout, deltaTime: number = 1) => {
    if (neuralNetMode === 'fixed') return layout;

    const newNodes = new Map(layout.nodes);
    const nodesArray = Array.from(newNodes.values());

    // Apply spring forces for connections
    for (const conn of layout.connections) {
      const fromNode = newNodes.get(conn.from);
      const toNode = newNodes.get(conn.to);

      if (!fromNode || !toNode || fromNode.isLocked || toNode.isLocked) continue;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const targetDistance = NEURAL_NET_CONFIG.minSpacing * 1.5;
        const force = (distance - targetDistance) * NEURAL_NET_CONFIG.springStrength;

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        // Apply force to both nodes
        fromNode.vx = (fromNode.vx || 0) + fx * deltaTime;
        fromNode.vy = (fromNode.vy || 0) + fy * deltaTime;
        toNode.vx = (toNode.vx || 0) - fx * deltaTime;
        toNode.vy = (toNode.vy || 0) - fy * deltaTime;
      }
    }

    // Apply repulsion between all nodes
    for (let i = 0; i < nodesArray.length; i++) {
      const nodeA = nodesArray[i];
      if (nodeA.isLocked) continue;

      for (let j = i + 1; j < nodesArray.length; j++) {
        const nodeB = nodesArray[j];
        if (nodeB.isLocked) continue;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = nodeA.radius + nodeB.radius + 20;

        if (distance < minDistance && distance > 0) {
          const force = NEURAL_NET_CONFIG.repulsionStrength / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          nodeA.vx = (nodeA.vx || 0) - fx * deltaTime;
          nodeA.vy = (nodeA.vy || 0) - fy * deltaTime;
          nodeB.vx = (nodeB.vx || 0) + fx * deltaTime;
          nodeB.vy = (nodeB.vy || 0) + fy * deltaTime;
        }
      }
    }

    // Update positions and apply damping
    for (const node of nodesArray) {
      if (node.isLocked || node.isDragging) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }

      node.vx = (node.vx || 0) * NEURAL_NET_CONFIG.damping;
      node.vy = (node.vy || 0) * NEURAL_NET_CONFIG.damping;

      // Limit velocity
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > NEURAL_NET_CONFIG.maxForce) {
        node.vx = (node.vx / speed) * NEURAL_NET_CONFIG.maxForce;
        node.vy = (node.vy / speed) * NEURAL_NET_CONFIG.maxForce;
      }

      // Update position
      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;

      // Keep within bounds
      const padding = 50;
      node.x = Math.max(padding, Math.min(750, node.x));
      node.y = Math.max(padding, Math.min(550, node.y));
    }

    return { ...layout, nodes: newNodes };
  }, [neuralNetMode]);

  const updateNodeActivations = useCallback((layout: NeuralLayout, inputs: number[], outputs: number[]) => {
    const newNodes = new Map(layout.nodes);

    // Update input node activations
    const inputNodes = Array.from(newNodes.values())
      .filter(n => n.type === 'input')
      .sort((a, b) => {
        const aNum = parseInt(a.label.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.label.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      });

    inputNodes.forEach((node, i) => {
      if (i < inputs.length) {
        node.activationValue = inputs[i];
      }
    });

    // Update output node activations
    const outputNodes = Array.from(newNodes.values())
      .filter(n => n.type === 'output')
      .sort((a, b) => {
        const aNum = parseInt(a.label.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.label.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      });

    outputNodes.forEach((node, i) => {
      if (i < outputs.length) {
        node.activationValue = outputs[i];
      }
    });

    return { ...layout, nodes: newNodes };
  }, []);

  const renderDynamicNeuralNet = useCallback((
    ctx: CanvasRenderingContext2D,
    layout: NeuralLayout,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle background pattern
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw connections first (so they're behind nodes)
    ctx.lineCap = 'round';

    for (const conn of layout.connections) {
      const fromNode = layout.nodes.get(conn.from);
      const toNode = layout.nodes.get(conn.to);

      if (!fromNode || !toNode) continue;

      const weight = conn.weight;
      const strength = Math.min(Math.abs(weight), 1);
      const lineWidth = 1 + strength * 2;

      const isHovering = hoveringConnection &&
        hoveringConnection.from === conn.from &&
        hoveringConnection.to === conn.to;

      const hue = weight > 0 ? 140 : 0;
      const saturation = 70;
      const lightness = 40 + strength * 40;
      const alpha = isHovering ? 0.9 : 0.2 + strength * 0.5;

      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = isHovering ? lineWidth + 2 : lineWidth;

      // Draw curved connection
      const startX = fromNode.x;
      const startY = fromNode.y;
      const endX = toNode.x;
      const endY = toNode.y;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const controlX1 = startX + (midX - startX) * 0.5;
      const controlY1 = startY + (midY - startY) * 0.5 + 30;
      const controlX2 = endX - (endX - midX) * 0.5;
      const controlY2 = endY - (endY - midY) * 0.5 - 30;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
      ctx.stroke();

      // Draw arrow head for strong connections
      if (strength > 0.3) {
        const angle = Math.atan2(endY - controlY2, endX - controlX2);
        const arrowSize = 3 + strength * 4;
        const arrowX = endX - Math.cos(angle) * (toNode.radius + 2);
        const arrowY = endY - Math.sin(angle) * (toNode.radius + 2);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw nodes
    for (const node of layout.nodes.values()) {
      const isHovering = hoveringNodeId === node.id;
      const isDragging = draggingNodeId === node.id;

      // Node colors based on type and activation
      let color = '';
      let glowColor = '';

      if (node.type === 'input') {
        color = '#3b82f6';
        glowColor = 'rgba(59, 130, 246, 0.3)';
      } else if (node.type === 'hidden') {
        color = '#8b5cf6';
        glowColor = 'rgba(139, 92, 246, 0.3)';
      } else {
        color = '#10b981';
        glowColor = 'rgba(16, 185, 129, 0.3)';
      }

      // If showing activations and node has activation value
      if (showActivations && node.activationValue !== undefined) {
        const activation = node.activationValue;
        const intensity = Math.min(Math.abs(activation) * 0.8 + 0.2, 1);

        if (activation > 0) {
          color = `rgb(${Math.floor(59 * intensity)}, ${Math.floor(130 * intensity)}, ${Math.floor(246 * intensity)})`;
        } else {
          color = `rgb(${Math.floor(239 * intensity)}, ${Math.floor(68 * intensity)}, ${Math.floor(68 * intensity)})`;
        }
      }

      // Draw glow effect for hovering/dragging
      if (isHovering || isDragging) {
        ctx.save();
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 2.5
        );
        glowGradient.addColorStop(0, isDragging ? 'rgba(251, 191, 36, 0.6)' : 'rgba(59, 130, 246, 0.5)');
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw node
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isDragging ? '#fbbf24' : isHovering ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = isDragging ? 3 : isHovering ? 2 : 1;
      ctx.stroke();

      // Draw lock icon for locked nodes
      if (node.isLocked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', node.x, node.y);
      }

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, node.radius * 0.6)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Draw activation value if available
      if (showActivations && node.activationValue !== undefined) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.activationValue.toFixed(2), node.x, node.y + node.radius + 14);
      }
    }

    // Draw weight value for hovering connection
    if (hoveringConnection) {
      const conn = layout.connections.find(c =>
        c.from === hoveringConnection.from && c.to === hoveringConnection.to
      );

      if (conn) {
        const fromNode = layout.nodes.get(conn.from);
        const toNode = layout.nodes.get(conn.to);

        if (fromNode && toNode) {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          // Draw tooltip background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.beginPath();
          ctx.roundRect(midX - 45, midY - 18, 90, 36, 6);
          ctx.fill();

          // Draw tooltip border
          ctx.strokeStyle = conn.weight > 0 ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw tooltip text
          ctx.fillStyle = conn.weight > 0 ? '#22c55e' : '#ef4444';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Weight: ${conn.weight.toFixed(3)}`, midX, midY - 4);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(`${conn.from} → ${conn.to}`, midX, midY + 8);
        }
      }
    }
  }, [hoveringNodeId, draggingNodeId, hoveringConnection, showActivations]);

  const distanceToLine = useCallback((px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Neural net mouse event handlers
  const handleNeuralNetMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate the correct coordinates considering canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    console.log(`Mouse down at (${x}, ${y})`); // Debug log

    // Check if clicking on a node
    for (const node of neuralLayout.nodes.values()) {
      if (node.isLocked && node.type !== 'hidden') continue; // Only hidden nodes are draggable

      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance < node.radius) {
        setDraggingNodeId(node.id);

        // Toggle lock on shift+click
        if (e.shiftKey) {
          const newNodes = new Map(neuralLayout.nodes);
          const updatedNode = { ...node, isLocked: !node.isLocked };
          newNodes.set(node.id, updatedNode);
          setNeuralLayout({ ...neuralLayout, nodes: newNodes });
        }

        console.log(`Clicked on node ${node.id} at (${node.x}, ${node.y}), radius: ${node.radius}`);
        return;
      }
    }

    // Check if clicking on a connection (for potential future features)
    for (const conn of neuralLayout.connections) {
      const fromNode = neuralLayout.nodes.get(conn.from);
      const toNode = neuralLayout.nodes.get(conn.to);

      if (!fromNode || !toNode) continue;

      // Simple line distance check
      const distance = distanceToLine(x, y, fromNode.x, fromNode.y, toNode.x, toNode.y);
      if (distance < 15) {
        console.log(`Clicked on connection ${conn.from} -> ${conn.to}`);
        break;
      }
    }
  }, [neuralLayout]);


  const handleNeuralNetMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate the correct coordinates considering canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Update dragging node position
    if (draggingNodeId !== null) {
      const newNodes = new Map(neuralLayout.nodes);
      const node = newNodes.get(draggingNodeId);

      if (node && !node.isLocked) {
        node.x = x;
        node.y = y;
        node.isDragging = true;
        setNeuralLayout({ ...neuralLayout, nodes: newNodes });

        console.log(`Dragging node ${node.id} to (${x}, ${y})`); // Debug log
      }
    }

    // Check for hovering over nodes
    let foundHover = false;
    for (const node of neuralLayout.nodes.values()) {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance < node.radius) {
        setHoveringNodeId(node.id);
        foundHover = true;
        break;
      }
    }

    if (!foundHover) {
      setHoveringNodeId(null);
    }

    // Check for hovering over connections
    let foundConnHover = null;
    for (const conn of neuralLayout.connections) {
      const fromNode = neuralLayout.nodes.get(conn.from);
      const toNode = neuralLayout.nodes.get(conn.to);

      if (!fromNode || !toNode) continue;

      const distance = distanceToLine(x, y, fromNode.x, fromNode.y, toNode.x, toNode.y);
      if (distance < 10) {
        foundConnHover = { from: conn.from, to: conn.to };
        break;
      }
    }

    setHoveringConnection(foundConnHover);
  }, [neuralLayout, draggingNodeId]);

  const handleNeuralNetMouseUp = useCallback(() => {
    if (draggingNodeId !== null && neuralLayout) {
      const newNodes = new Map(neuralLayout.nodes);
      const node = newNodes.get(draggingNodeId);
      if (node) {
        node.isDragging = false;
      }
      setNeuralLayout({ ...neuralLayout, nodes: newNodes });
    }
    setDraggingNodeId(null);
  }, [draggingNodeId, neuralLayout]);

  // Neural net physics animation
  useEffect(() => {
    if (!neuralLayout || neuralNetMode === 'fixed' || draggingNodeId !== null) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updatePhysics = () => {
      setNeuralLayout(prev => {
        if (!prev) return prev;
        return applyPhysics(prev, 0.3);
      });
    };

    const physicsLoop = () => {
      updatePhysics();
      if (neuralLayout && neuralNetMode === 'physics' && draggingNodeId === null) {
        animationFrameRef.current = requestAnimationFrame(physicsLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(physicsLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [neuralLayout, neuralNetMode, draggingNodeId, applyPhysics]);

  // Update neural layout when selected blob changes
  useEffect(() => {
    if (!selectedBlob || !neuralNetCanvasRef.current) return;

    const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
    if (!currentBlob) return;

    // Get the actual container dimensions
    const container = neuralNetCanvasRef.current.parentElement;
    if (!container) return;

    // Use the container's dimensions or defaults
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    console.log(`Creating layout with dimensions: ${width}x${height}`);

    const newLayout = createNeuralLayout(currentBlob.genome, width, height);
    setNeuralLayout(newLayout);

    if (currentBlob.cachedVision) {
      setLastInputs(currentBlob.cachedVision);
      const outputs = currentBlob.genome.activate(currentBlob.cachedVision);
      setLastOutputs(outputs);

      setNeuralLayout(prev => {
        if (!prev) return prev;
        return updateNodeActivations(prev, currentBlob.cachedVision || [], outputs);
      });
    }
  }, [selectedBlob, createNeuralLayout, updateNodeActivations]);

  // Update activations periodically
  useEffect(() => {
    if (!selectedBlob || !neuralNetCanvasRef.current) return;

    const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
    if (!currentBlob) return;

    // Get container dimensions
    const container = neuralNetCanvasRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Create new layout with actual dimensions
    const newLayout = createNeuralLayout(currentBlob.genome, width, height);
    setNeuralLayout(newLayout);

    // Get current inputs/outputs
    if (currentBlob.cachedVision) {
      setLastInputs(currentBlob.cachedVision);
      const outputs = currentBlob.genome.activate(currentBlob.cachedVision);
      setLastOutputs(outputs);

      // Update activations
      setNeuralLayout(prev => {
        if (!prev) return prev;
        return updateNodeActivations(prev, currentBlob.cachedVision || [], outputs);
      });
    }
  }, [selectedBlob, createNeuralLayout, updateNodeActivations]);

  // Handle neural net canvas resizing
  useEffect(() => {
    if (!neuralNetCanvasRef.current || !selectedBlob) return;

    const canvas = neuralNetCanvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && neuralLayout) {
          // Recreate layout with new dimensions
          const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
          if (currentBlob) {
            const newLayout = createNeuralLayout(currentBlob.genome, width, height);
            setNeuralLayout(newLayout);
          }
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, [selectedBlob, neuralLayout, createNeuralLayout]);

  // Render neural net canvas
  useEffect(() => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    // Set canvas size to match container
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    renderDynamicNeuralNet(ctx, neuralLayout, width, height);
  }, [neuralLayout, renderDynamicNeuralNet]);


  // ===================== RENDERING =====================

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Follow best blob
    if (followBest && blobsRef.current.length > 0) {
      const best = blobsRef.current.reduce((a, b) =>
        a.genome.fitness > b.genome.fitness ? a : b
      );
      cameraRef.current.x += (best.x - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (best.y - cameraRef.current.y) * 0.08;
    }

    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    const cam = cameraRef.current;
    ctx.translate(width / 2, height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    // Draw terrain zones
    if (cam.zoom > 0.4) {
      for (const zone of terrainZonesRef.current) {
        ctx.fillStyle =
          zone.type === 'safe' ? 'rgba(34, 197, 94, 0.06)' :
            zone.type === 'danger' ? 'rgba(239, 68, 68, 0.06)' :
              'rgba(100, 100, 100, 0.02)';

        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

        if (cam.zoom > 0.6) {
          ctx.strokeStyle =
            zone.type === 'safe' ? 'rgba(34, 197, 94, 0.12)' :
              zone.type === 'danger' ? 'rgba(239, 68, 68, 0.12)' :
                'rgba(100, 100, 100, 0.08)';
          ctx.lineWidth = 1 / cam.zoom;
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        }
      }
    }

    // Grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 1 / cam.zoom;
    for (let x = 0; x <= WORLD_WIDTH; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 4 / cam.zoom;
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Food - LOD System
    const clusteredFoodIds = new Set<Food>();

    for (const cluster of foodClustersRef.current) {
      for (const f of cluster.foods) {
        clusteredFoodIds.add(f);
      }

      const gradient = ctx.createRadialGradient(
        cluster.x, cluster.y, 0,
        cluster.x, cluster.y, cluster.radius
      );
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
      gradient.addColorStop(0.7, 'rgba(34, 197, 94, 0.6)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cluster.x, cluster.y, cluster.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 2 / cam.zoom;
      ctx.stroke();

      if (cam.zoom > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `bold ${Math.max(10, cluster.radius * 0.4) / cam.zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`×${cluster.count}`, cluster.x, cluster.y);
      }
    }

    // Individual food
    for (const f of foodRef.current) {
      if (clusteredFoodIds.has(f)) continue;

      const alpha = Math.min(1, f.age / 30);
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, Math.sqrt(f.mass) * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Logs
    for (const log of logsRef.current) {
      ctx.save();
      ctx.translate(log.x, log.y);
      ctx.rotate(log.rotation);

      const gradient = ctx.createLinearGradient(-log.width / 2, 0, log.width / 2, 0);
      gradient.addColorStop(0, '#8b4513');
      gradient.addColorStop(0.3, '#a0522d');
      gradient.addColorStop(0.7, '#8b4513');
      gradient.addColorStop(1, '#654321');

      ctx.fillStyle = gradient;
      ctx.fillRect(-log.width / 2, -log.height / 2, log.width, log.height);

      ctx.strokeStyle = 'rgba(101, 67, 33, 0.5)';
      ctx.lineWidth = 1 / cam.zoom;
      for (let i = 0; i < 3; i++) {
        const y = -log.height / 2 + (log.height / 4) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(-log.width / 2, y);
        ctx.lineTo(log.width / 2, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2 / cam.zoom;
      ctx.strokeRect(-log.width / 2, -log.height / 2, log.width, log.height);

      if (log.grabbedBy !== undefined) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3 / cam.zoom;
        ctx.strokeRect(-log.width / 2 - 3, -log.height / 2 - 3, log.width + 6, log.height + 6);
      }

      ctx.restore();
    }

    // Obstacles
    for (const obs of obstaclesRef.current) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2 / cam.zoom;
      ctx.stroke();

      if (cam.zoom > 0.5) {
        ctx.fillStyle = '#7f1d1d';
        ctx.font = `bold ${Math.min(16, obs.radius) / cam.zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', obs.x, obs.y);
      }
    }

    // Family connections
    if (cam.zoom > 0.6) {
      for (const blob of blobsRef.current) {
        for (const childId of blob.childrenIds) {
          const child = blobsRef.current.find(b => b.id === childId);
          if (child) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
            ctx.lineWidth = 1 / cam.zoom;
            ctx.setLineDash([5 / cam.zoom, 5 / cam.zoom]);
            ctx.beginPath();
            ctx.moveTo(blob.x, blob.y);
            ctx.lineTo(child.x, child.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
    }

    // Blobs
    for (const blob of blobsRef.current) {
      const radius = Math.sqrt(blob.mass) * 2.5;

      // Health indicator
      const health = blob.mass / 100;
      if (health < 0.5) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 3 / cam.zoom;
        ctx.setLineDash([5 / cam.zoom, 5 / cam.zoom]);
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = blob.color;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2 / cam.zoom;
      ctx.stroke();

      // Direction
      const angle = Math.atan2(blob.vy, blob.vx);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3 / cam.zoom;
      ctx.beginPath();
      ctx.moveTo(blob.x, blob.y);
      ctx.lineTo(blob.x + Math.cos(angle) * radius * 0.8, blob.y + Math.sin(angle) * radius * 0.8);
      ctx.stroke();

      // Log indicator
      if (blob.grabbedLog !== undefined) {
        ctx.fillStyle = 'rgba(139, 69, 19, 0.7)';
        ctx.beginPath();
        ctx.arc(blob.x, blob.y - radius - 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ID
      if (cam.zoom > 0.5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold ${11 / cam.zoom}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${blob.id}`, blob.x, blob.y);
      }

      // Selection
      if (selectedBlob?.id === blob.id) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3 / cam.zoom;
        ctx.setLineDash([5 / cam.zoom, 5 / cam.zoom]);
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [followBest, selectedBlob]);

  // ===================== EVENT HANDLERS =====================

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    cameraRef.current.x -= dx / cameraRef.current.zoom;
    cameraRef.current.y -= dy / cameraRef.current.zoom;

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setFollowBest(false);
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    cameraRef.current.zoom = Math.max(0.25, Math.min(3, cameraRef.current.zoom * delta));
    setZoom(cameraRef.current.zoom);
  }, []);

  const zoomIn = useCallback(() => {
    cameraRef.current.zoom = Math.min(3, cameraRef.current.zoom * 1.2);
    setZoom(cameraRef.current.zoom);
  }, []);

  const zoomOut = useCallback(() => {
    cameraRef.current.zoom = Math.max(0.25, cameraRef.current.zoom / 1.2);
    setZoom(cameraRef.current.zoom);
  }, []);

  const resetCamera = useCallback(() => {
    cameraRef.current = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 0.9 };
    setZoom(0.9);
    setFollowBest(false);
  }, []);

  // ===================== EFFECTS =====================

  // Animation loop
  useEffect(() => {
    let frameId: number;
    let lastUpdate = 0;
    const updateInterval = 1000 / 60;

    const loop = (time: number) => {
      if (isRunningRef.current) {
        const elapsed = time - lastUpdate;
        const updates = Math.floor(elapsed / updateInterval * speedRef.current);

        for (let i = 0; i < Math.min(updates, 10); i++) {
          update();
        }

        if (updates > 0) lastUpdate = time;
      }

      render();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [update, render]);

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Initialize on mount
  useEffect(() => {
    initSimulation();
    setIsRunning(true);
  }, [initSimulation]);

  // ===================== RENDER JSX =====================

  const topBlobs = [...blobsRef.current]
    .sort((a, b) => b.genome.fitness - a.genome.fitness)
    .slice(0, 12);

  const handleResetLayout = useCallback(() => {
    if (selectedBlob && neuralNetCanvasRef.current) {
      const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
      if (currentBlob) {
        const container = neuralNetCanvasRef.current.parentElement;
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        const newLayout = createNeuralLayout(currentBlob.genome, width, height);
        setNeuralLayout(newLayout);
        console.log('Layout reset');
      }
    }
  }, [selectedBlob, createNeuralLayout]);

  const logLayoutInfo = useCallback(() => {
    if (!neuralLayout) {
      console.log('No neural layout');
      return;
    }

    console.log('Neural Layout Info:');
    console.log(`- Total nodes: ${neuralLayout.nodes.size}`);
    console.log(`- Total connections: ${neuralLayout.connections.length}`);

    // Log node positions
    console.log('Node positions:');
    for (const node of neuralLayout.nodes.values()) {
      console.log(`  Node ${node.id} (${node.type}): (${node.x.toFixed(1)}, ${node.y.toFixed(1)})`);
    }

    // Check canvas dimensions
    if (neuralNetCanvasRef.current) {
      const canvas = neuralNetCanvasRef.current;
      console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
      console.log(`Canvas style: ${canvas.style.width}x${canvas.style.height}`);

      const container = canvas.parentElement;
      if (container) {
        console.log(`Container dimensions: ${container.clientWidth}x${container.clientHeight}`);
      }
    }
  }, [neuralLayout]);

  return (
    <Container>
      <MaxWidthWrapper>
        <Header>
          <Title>🧬 Natural Selection Simulator</Title>
          <Subtitle>
            {stats.speciesCount} lineages • {stats.population} blobs • {stats.largestFamily} largest family
          </Subtitle>
        </Header>

        <VideoSection>
          <CanvasContainer>
            <SimCanvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            <HUD>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Generation {stats.generation}
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Population:</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{stats.population}/{MAX_POPULATION}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Food:</span>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{foodRef.current.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Avg Mass:</span>
                  <span style={{ fontWeight: 600, color: '#fbbf24' }}>{stats.avgMass.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Avg Age:</span>
                  <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{stats.avgAge.toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Reproduction Rate:</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>{stats.reproductionRate.toFixed(2)}/1000t</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Births/Deaths:</span>
                  <span style={{ fontWeight: 600, color: stats.totalBirths > stats.totalDeaths ? '#10b981' : '#ef4444' }}>
                    {stats.totalBirths}/{stats.totalDeaths}
                  </span>
                </div>
              </div>
            </HUD>

            <LeaderboardHUD>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} />
                Top Survivors
                <Users size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </div>
              {topBlobs.map((blob, i) => {
                const familySize = blobsRef.current.filter(b => b.familyLineage === blob.familyLineage).length;
                const canReproduce = blob.age >= MIN_AGE_FOR_REPRODUCTION &&
                  blob.mass >= REPRODUCTION_MIN_MASS &&
                  (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION);

                return (
                  <LeaderboardEntry
                    key={blob.id}
                    $rank={i}
                    $selected={selectedBlob?.id === blob.id}
                    onClick={() => setSelectedBlob(blob)}
                  >
                    <div className="rank">#{i + 1}</div>
                    <div className="blob-color" style={{ background: blob.color }} />
                    <div className="info">
                      <div>#{blob.id} • <span className="mass">{blob.mass.toFixed(0)}</span>m</div>
                      <div className="gen">
                        Age: {blob.age} • {blob.childrenIds.length}👶 • {canReproduce ? '🎯' : '⏳'}
                      </div>
                    </div>
                  </LeaderboardEntry>
                );
              })}
            </LeaderboardHUD>

            <ViewportControls>
              <ViewportButton onClick={zoomIn} title="Zoom In">
                <ZoomIn size={20} />
              </ViewportButton>
              <ViewportButton onClick={zoomOut} title="Zoom Out">
                <ZoomOut size={20} />
              </ViewportButton>
              <ViewportButton onClick={resetCamera} title="Reset View">
                <Maximize2 size={20} />
              </ViewportButton>
              <ViewportButton
                $active={followBest}
                onClick={() => setFollowBest(!followBest)}
                title="Follow Best"
              >
                <Crosshair size={20} />
              </ViewportButton>
            </ViewportControls>

            <ZoomIndicator>
              {(zoom * 100).toFixed(0)}% {followBest && '• Following Best'}
            </ZoomIndicator>
          </CanvasContainer>
        </VideoSection>

        <ControlsDrawer $expanded={drawerExpanded}>
          <DrawerHandle onClick={() => setDrawerExpanded(!drawerExpanded)}>
            {drawerExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            <span>Ecosystem Statistics</span>
          </DrawerHandle>

          {drawerExpanded && (
            <DrawerContent>
              <Grid $columns={4}>
                <StatCard $color="#3b82f6">
                  <div className="label">Lineages</div>
                  <div className="value">{stats.speciesCount}</div>
                  <div className="change">Family dynasties</div>
                </StatCard>

                <StatCard $color="#10b981">
                  <div className="label">Total Births</div>
                  <div className="value">{stats.totalBirths}</div>
                  <div className="change">Natural reproduction</div>
                </StatCard>

                <StatCard $color="#ef4444">
                  <div className="label">Total Deaths</div>
                  <div className="value">{stats.totalDeaths}</div>
                  <div className="change">Natural selection</div>
                </StatCard>

                <StatCard $color="#fbbf24">
                  <div className="label">Largest Family</div>
                  <div className="value">{stats.largestFamily}</div>
                  <div className="change">Successful lineage</div>
                </StatCard>
              </Grid>
            </DrawerContent>
          )}
        </ControlsDrawer>
      </MaxWidthWrapper>

      {/* Neural Network Modal */}
      {selectedBlob && (
        <NeuralNetModal onClick={() => setSelectedBlob(null)}>
          <NeuralNetPanel onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedBlob(null)}>
              <X size={20} />
            </CloseButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Brain size={24} color="#6366f6" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Interactive Neural Network - Blob #{selectedBlob.id} (Lineage {selectedBlob.familyLineage})
              </h2>
            </div>

            <NeuralNetControls>
              <ControlButton
                $active={neuralNetMode === 'physics'}
                onClick={() => setNeuralNetMode(neuralNetMode === 'physics' ? 'fixed' : 'physics')}
                title="Toggle physics simulation"
              >
                {neuralNetMode === 'physics' ? <Move size={16} /> : <Lock size={16} />}
                {neuralNetMode === 'physics' ? 'Physics Mode' : 'Fixed Mode'}
              </ControlButton>

              <ControlButton
                $active={showActivations}
                onClick={() => setShowActivations(!showActivations)}
                title="Toggle activation values"
              >
                <Brain size={16} />
                {showActivations ? 'Hide Activations' : 'Show Activations'}
              </ControlButton>

              <ControlButton
                onClick={handleResetLayout}
                title="Reset layout"
              >
                <RefreshCw size={16} />
                Reset Layout
              </ControlButton>

              <ControlButton
                onClick={logLayoutInfo}
                title="Debug layout info"
              >
                <Brain size={16} />
                Debug Info
              </ControlButton>

              <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Click & drag hidden nodes to move</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>Shift+Click to lock/unlock</span>
              </div>
            </NeuralNetControls>

            <BlobInfo>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Generation</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f6' }}>{selectedBlob.generation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Family Size</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                    {blobsRef.current.filter(b => b.familyLineage === selectedBlob.familyLineage).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Children</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{selectedBlob.childrenIds.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Age</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>{selectedBlob.age}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mass</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>{selectedBlob.mass.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Food Eaten</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{selectedBlob.foodEaten}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kills</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>{selectedBlob.kills}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Can Reproduce?</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedBlob.age >= MIN_AGE_FOR_REPRODUCTION && selectedBlob.mass >= REPRODUCTION_MIN_MASS && (selectedBlob.kills > 0 || selectedBlob.foodEaten >= FOOD_FOR_REPRODUCTION) ? '#10b981' : '#ef4444' }}>
                    {selectedBlob.age >= MIN_AGE_FOR_REPRODUCTION && selectedBlob.mass >= REPRODUCTION_MIN_MASS && (selectedBlob.kills > 0 || selectedBlob.foodEaten >= FOOD_FOR_REPRODUCTION) ? 'YES' : 'NO'}
                  </div>
                </div>
              </div>
            </BlobInfo>

            <CanvasWrapper>
              <NeuralNetCanvas
                ref={neuralNetCanvasRef}
                onMouseDown={handleNeuralNetMouseDown}
                onMouseMove={handleNeuralNetMouseMove}
                onMouseUp={handleNeuralNetMouseUp}
                onMouseLeave={handleNeuralNetMouseUp}
              />
            </CanvasWrapper>

            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#fbbf24' }}>Natural Reproduction:</strong> Blobs reproduce only when they achieve enough food ({FOOD_FOR_REPRODUCTION}+) or get kills. No blobs from thin air!
                </div>
                <div>
                  <strong style={{ color: '#22c55e' }}>Family Protection:</strong> Blobs won't attack their own family lineage. Cooperation is key!
                </div>
                <div>
                  <strong style={{ color: '#3b82f6' }}>Interactive Network:</strong> Drag hidden nodes to rearrange. Shift+click to lock/unlock.
                </div>
              </div>
            </div>
          </NeuralNetPanel>
        </NeuralNetModal>
      )}
    </Container>
  );
}