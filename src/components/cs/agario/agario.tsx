// src/components/cs/agario/agario.tsx
'use client'

import React, {
  useRef, useEffect, useState, useCallback, useMemo
} from "react";

import {
  Genome, Neat
} from './neat';
import {
  Container,
  MaxWidthWrapper,
  VideoSection,
  CanvasContainer,
  SimCanvas,
} from './config/agario.styles';

import {
  TerrainZone, Food, FoodCluster, Obstacle, Log, Blob, NeuralLayout,
  BiomeConfig
} from './config/agario.types';

import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  INITIAL_BLOBS,
  MAX_POPULATION,
  MAX_FOOD,
  FOOD_SPAWN_RATE,



  CLUSTER_UPDATE_INTERVAL,


  SURVIVAL_PRESSURE_INCREASE,

  INPUT_SIZE,
  OUTPUT_SIZE,

  NEAT_CONFIG,
  NUM_OBSTACLES
} from './config/agario.constants';

import { calculatePopulationFitness, getTopBlobs } from './utils/fitness';

import {
  renderSimulation,
  updateCamera,
  getCameraTarget,
  type Camera,
  type RenderContext
} from './utils/rendering';
import { SelectedNodeInfo } from "./config/agario.types";

import {
  simulateBlob,
  handleCollisions,
  updateSurvivalPressure,
  applyCoriolisEffect
} from './utils/simulation';

import { getVision } from './utils/vision';

import {
  createNeuralLayout,
  applyPhysics
} from './utils/neural-net-visualization';

import {
  createBlob,
  giveBirth
} from './utils/reproduction';

import {
  spawnFood,
  clusterFood,
  ageFood,
  updateSpatialGrid,
  getNearbyFood,
  createBiomes,
  calculatePopulationPressure,
  getFoodIslands,
  resetFoodIslands,
  FoodIsland
} from './utils/environment';

import { HeaderSection } from "./components/HeaderSection";
import { HUDComponent } from "./components/HUDComponent";
import { LeaderboardComponent } from "./components/LeaderboardComponent";
import { NeuralNetModalComponent } from "./components/NeuralNetModal";
import { StatsDrawerComponent } from "./components/StatsDrawerComponent";
import { ViewportControlsComponent } from "./components/ViewportControlsComponent";
import { TrainingPanelComponent } from "./components/TrainingPanelComponent";
import { createEngineeredVisionSystem } from "./utils/feature-engineering";
import { SerializedGenome, HeadlessTrainer } from "./utils/headless-trainer";

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
  const biomesRef = useRef<BiomeConfig[]>([]);
  const foodIslandsRef = useRef<FoodIsland[]>([]);
  const populationPressureRef = useRef(0);
  const [showWeights, setShowWeights] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<SelectedNodeInfo | null>(null);

  // Spatial grid for performance
  const GRID_SIZE = 100;
  const spatialGridRef = useRef<Map<string, Food[]>>(new Map());

  // Camera
  const cameraRef = useRef<Camera>({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 0.9 });
  const [zoom, setZoom] = useState(0.9);
  const [followBest, setFollowBest] = useState(false);
  const [followedBlobId, setFollowedBlobId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Panning
  const [isPanning, setIsPanning] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // UI State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const [showTrainingPanel, setShowTrainingPanel] = useState(false);

  // Neural net visualization state
  const [neuralLayout, setNeuralLayout] = useState<NeuralLayout | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const [hoveringNodeId, setHoveringNodeId] = useState<number | null>(null);
  const [hoveringConnection, setHoveringConnection] = useState<{ from: number, to: number } | null>(null);
  const [neuralNetMode, setNeuralNetMode] = useState<'physics' | 'fixed'>('physics');
  const [showActivations, setShowActivations] = useState(true);
  const [lastInputs, setLastInputs] = useState<number[]>([]);
  const [lastOutputs, setLastOutputs] = useState<number[]>([]);

  const [neuralNetDragging, setNeuralNetDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<number | null>(null);
  // Replace the simple zoomLevel state with full viewport control
  const [neuralViewport, setNeuralViewport] = useState({
    x: 0,
    y: 0,
    scale: 1
  });
  const [neuralPanning, setNeuralPanning] = useState(false);
  const neuralLastMouseRef = useRef({ x: 0, y: 0 });

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

  // ===================== MEMOIZED CALCULATIONS =====================

  // Memoize top blobs - only recalculate every 30 ticks
  const topBlobs = useMemo(() => {
    return getTopBlobs(blobsRef.current, 12);
  }, [Math.floor(stats.tickCount / 30), stats.population]);

  // Memoize family size calculation
  const familySize = useMemo(() => {
    if (!selectedBlob) return 0;
    return blobsRef.current.filter(b =>
      b.familyLineage === selectedBlob.familyLineage
    ).length;
  }, [selectedBlob?.familyLineage, stats.population]);

  // Memoize node counts for neural network
  const calculateNodeCount = useCallback((blob: Blob): number => {
    if (!blob.genome) return 0;
    const count = blob.genome.nodes.size || 0;
    return count === 0 ? INPUT_SIZE + 8 + OUTPUT_SIZE : count;
  }, []);

  const calculateConnectionCount = useCallback((blob: Blob): number => {
    if (!blob.genome) return 0;
    const connections = blob.genome.connections.size || 0;
    return connections === 0 ? INPUT_SIZE * 8 + 8 * OUTPUT_SIZE : connections;
  }, []);

  // ===================== HELPER FUNCTIONS =====================

  const getZoneAt = useCallback((x: number, y: number): string => {
    for (const zone of terrainZonesRef.current) {
      if (x >= zone.x && x < zone.x + zone.width &&
        y >= zone.y && y < zone.y + zone.height) {
        return zone.type;
      }
    }
    return 'neutral';
  }, []);

  // ===================== INITIALIZATION =====================
  const initSimulation = useCallback(() => {
    // 1. Initialize NEAT
    neatRef.current = new Neat(INPUT_SIZE, OUTPUT_SIZE, INITIAL_BLOBS, NEAT_CONFIG);

    // 2. Initialize terrain zones
    terrainZonesRef.current = [
      { x: 200, y: 200, width: 300, height: 300, type: 'safe' },
      { x: 800, y: 400, width: 400, height: 400, type: 'safe' },
      { x: 400, y: 800, width: 300, height: 300, type: 'danger' },
      { x: 1000, y: 100, width: 400, height: 400, type: 'danger' }
    ];

    // 3. Initialize biomes and food islands
    biomesRef.current = createBiomes(WORLD_WIDTH, WORLD_HEIGHT);
    foodIslandsRef.current = resetFoodIslands(WORLD_WIDTH, WORLD_HEIGHT);

    // 4. Initialize blobs with proper IDs
    blobsRef.current = [];
    for (const genome of neatRef.current.population) {
      const blob = createBlob(
        genome,
        1,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => nextBlobIdRef.current++
      );
      blobsRef.current.push(blob);
    }

    // 5. Initialize food
    foodRef.current = spawnFood(
      [],
      biomesRef.current,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      MAX_FOOD / 2,  // Start with half capacity
      MAX_FOOD,
      0  // Initial population pressure
    );

    // 5.5 Initialize obstacles
    obstaclesRef.current = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      obstaclesRef.current.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        radius: 20 + Math.random() * 20
      });
    }

    // 6. Initialize logs
    logsRef.current = [];
    for (let i = 0; i < 10; i++) {
      logsRef.current.push({
        id: nextLogIdRef.current++,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        width: 40 + Math.random() * 30,
        height: 15,
        rotation: Math.random() * Math.PI * 2
      });
    }

    // 7. Reset counters
    tickCountRef.current = 0;
    totalDeathsRef.current = 0;
    totalBirthsRef.current = 0;
    survivalPressureRef.current = 0;

    // 8. Initialize spatial grid
    spatialGridRef.current = updateSpatialGrid(foodRef.current, GRID_SIZE);

    // 9. Update stats
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
  }, [getZoneAt]);

  // ===================== UPDATE LOOP =====================

  const update = useCallback(() => {
    if (!isRunningRef.current || !neatRef.current) return;

    tickCountRef.current++;
    const tick = tickCountRef.current;

    // Update spatial grid
    if (tick % 5 === 0) {
      spatialGridRef.current = updateSpatialGrid(foodRef.current, GRID_SIZE);
    }

    // Update food clusters
    if (tick % CLUSTER_UPDATE_INTERVAL === 0) {
      foodClustersRef.current = clusterFood(foodRef.current, spatialGridRef.current, GRID_SIZE);
    }

    // Calculate population pressure
    populationPressureRef.current = calculatePopulationPressure(
      blobsRef.current.length,
      foodRef.current.length
    );

    // Spawn food
    foodRef.current = spawnFood(
      foodRef.current,
      biomesRef.current,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      FOOD_SPAWN_RATE,
      MAX_FOOD,
      populationPressureRef.current
    );


    // Age food
    foodRef.current = ageFood(foodRef.current);

    // Update survival pressure
    if (tick % 200 === 0) {
      survivalPressureRef.current += SURVIVAL_PRESSURE_INCREASE;
      obstaclesRef.current = updateSurvivalPressure(
        obstaclesRef.current,
        survivalPressureRef.current
      );
    }

    // Create a wrapper for giveBirth that matches the expected signature
    const giveBirthWrapper = (parent: Blob): boolean => {
      const result = giveBirth(
        parent,
        blobsRef.current,
        (genome: Genome) => {
          if (neatRef.current) {
            const mutated = genome.clone();
            neatRef.current.mutate(mutated);
            return mutated;
          }
          return genome;
        },
        (genome: Genome, generation: number, parentId?: number, x?: number, y?: number, color?: string, familyLineage?: number) => {
          return createBlob(
            genome,
            generation,
            parentId,
            x,
            y,
            color,
            familyLineage,
            () => nextBlobIdRef.current++
          );
        },
        tick
      );

      if (result.success) {
        blobsRef.current = result.updatedBlobs!;
        totalBirthsRef.current++;

        if (result.baby) {
          nextBlobIdRef.current = Math.max(nextBlobIdRef.current, result.baby.id + 1);
        }
        return true;
      }

      return false;
    };

    // Update each blob
    const visionSystem = createEngineeredVisionSystem();

    for (const blob of blobsRef.current) {
      simulateBlob(
        blob,
        blobsRef.current,
        foodRef.current,
        obstaclesRef.current,
        logsRef.current,
        tick,
        spatialGridRef.current,
        (x: number, y: number, range: number) =>
          getNearbyFood(x, y, range, spatialGridRef.current, GRID_SIZE),
        giveBirthWrapper,
        visionSystem  // ✅ Pass the vision system
      );

      // Apply weak Coriolis effect - subtle curved trajectories
      applyCoriolisEffect(blob, WORLD_WIDTH, WORLD_HEIGHT);
    }

    const deadBlobs = new Set<number>();
    for (const blob of blobsRef.current) {
      if (blob.shouldRemove) {
        deadBlobs.add(blob.id);
        totalDeathsRef.current++;
      }
    }

    // Handle collisions
    const collisionResult = handleCollisions(
      blobsRef.current,
      obstaclesRef.current,
      foodRef.current,
      totalDeathsRef
    );

    blobsRef.current = collisionResult.updatedBlobs;
    foodRef.current = collisionResult.updatedFood;

    // Remove dead blobs
    const allDeadBlobs = new Set([...deadBlobs, ...collisionResult.deadBlobIds || []]);
    blobsRef.current = blobsRef.current.filter(b => !allDeadBlobs.has(b.id));

    // Calculate fitness
    calculatePopulationFitness(blobsRef.current);

    // Update stats every 10 ticks for performance
    if (tick % 10 === 0) {
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

      // Reproduction rate
      const reproductionRate = totalBirthsRef.current / (tickCountRef.current / 1000);
      const killsThisTick = collisionResult.kills || 0;

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
    }
  }, [getZoneAt]);

  // ===================== INTERACTIVE NEURAL NET VISUALIZATION =====================

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

    // Apply viewport transform
    ctx.save();
    ctx.translate(neuralViewport.x, neuralViewport.y);
    ctx.scale(neuralViewport.scale, neuralViewport.scale);

    // Draw grid in world space
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
    ctx.lineWidth = 1 / neuralViewport.scale;

    const gridSize = 40;
    const startX = Math.floor(-neuralViewport.x / neuralViewport.scale / gridSize) * gridSize;
    const startY = Math.floor(-neuralViewport.y / neuralViewport.scale / gridSize) * gridSize;
    const endX = startX + (width / neuralViewport.scale) + gridSize;
    const endY = startY + (height / neuralViewport.scale) + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Draw connections (your existing code, but lines scale with viewport)
    ctx.lineCap = 'round';

    for (const conn of layout.connections) {
      const fromNode = layout.nodes.get(conn.from);
      const toNode = layout.nodes.get(conn.to);

      if (!fromNode || !toNode) continue;

      const weight = conn.weight;
      const strength = Math.min(Math.abs(weight), 1);
      const lineWidth = (1 + strength * 2) / neuralViewport.scale;

      const isHovering = hoveringConnection &&
        hoveringConnection.from === conn.from &&
        hoveringConnection.to === conn.to;

      const hue = weight > 0 ? 140 : 0;
      const saturation = 70;
      const lightness = 40 + strength * 40;
      const alpha = isHovering ? 0.9 : 0.2 + strength * 0.5;

      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = isHovering ? lineWidth + 2 : lineWidth;

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
      ctx.lineWidth = lineWidth;

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

      if (showActivations && node.activationValue !== undefined) {
        const activation = node.activationValue;
        const intensity = Math.min(Math.abs(activation) * 0.8 + 0.2, 1);

        if (activation > 0) {
          color = `rgb(${Math.floor(59 * intensity)}, ${Math.floor(130 * intensity)}, ${Math.floor(246 * intensity)})`;
        } else {
          color = `rgb(${Math.floor(239 * intensity)}, ${Math.floor(68 * intensity)}, ${Math.floor(68 * intensity)})`;
        }
      }

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

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isDragging ? '#fbbf24' : isHovering ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = (isDragging ? 3 : isHovering ? 2 : 1) / neuralViewport.scale;
      ctx.stroke();

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

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, node.radius * 0.6)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      if (showActivations && node.activationValue !== undefined) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.activationValue.toFixed(2), node.x, node.y + node.radius + 14);
      }
    }

    // Draw weight tooltip
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

          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.beginPath();
          ctx.roundRect(midX - 45, midY - 18, 90, 36, 6);
          ctx.fill();

          ctx.strokeStyle = conn.weight > 0 ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();

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
    ctx.restore();

    // Draw UI elements (zoom indicator, controls) in screen space
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, height - 40, 180, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`Zoom: ${(neuralViewport.scale * 100).toFixed(0)}%`, 20, height - 20);
    ctx.fillText(`Pan: ${neuralViewport.x.toFixed(0)}, ${neuralViewport.y.toFixed(0)}`, 100, height - 20);
  }, [neuralViewport, hoveringNodeId, draggingNodeId, hoveringConnection, showActivations]);

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

  const handleExportNetwork = useCallback(() => {
    if (!selectedBlob) return;

    const networkData = {
      blobId: selectedBlob.id,
      familyLineage: selectedBlob.familyLineage,
      generation: selectedBlob.generation,
      brain: selectedBlob.brain || selectedBlob.genome,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(networkData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `blob-${selectedBlob.id}-network.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [selectedBlob]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1.0);
  }, []);

  const handleNeuralNetWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (!neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3.0, neuralViewport.scale * zoomFactor));

    // Calculate new viewport position to zoom toward mouse
    const worldX = (mouseX - neuralViewport.x) / neuralViewport.scale;
    const worldY = (mouseY - neuralViewport.y) / neuralViewport.scale;

    const newX = mouseX - worldX * newScale;
    const newY = mouseY - worldY * newScale;

    setNeuralViewport({
      x: newX,
      y: newY,
      scale: newScale
    });
  }, [neuralViewport]);


  // Neural net mouse event handlers (all wrapped in useCallback)
  const handleNeuralNetMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to world coordinates
    const worldX = (x - neuralViewport.x) / neuralViewport.scale;
    const worldY = (y - neuralViewport.y) / neuralViewport.scale;

    // Check if clicking on a node
    let nodeClicked = false;
    for (const node of neuralLayout.nodes.values()) {
      if (node.isLocked && node.type !== 'hidden') continue;

      const distance = Math.sqrt(
        (worldX - node.x) ** 2 + (worldY - node.y) ** 2
      );

      if (distance < node.radius) {
        setDraggingNodeId(node.id);
        nodeClicked = true;

        if (e.shiftKey) {
          const newNodes = new Map(neuralLayout.nodes);
          const updatedNode = { ...node, isLocked: !node.isLocked };
          newNodes.set(node.id, updatedNode);
          setNeuralLayout({ ...neuralLayout, nodes: newNodes });
        }
        return;
      }
    }

    // If no node clicked, start panning (only with middle mouse or space+left)
    if (!nodeClicked && (e.button === 1 || (e.button === 0 && e.shiftKey))) {
      setNeuralPanning(true);
      neuralLastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [neuralLayout, neuralViewport, draggingNodeId]);

  const handleNeuralNetMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle viewport panning
    if (neuralPanning) {
      const dx = e.clientX - neuralLastMouseRef.current.x;
      const dy = e.clientY - neuralLastMouseRef.current.y;

      setNeuralViewport(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));

      neuralLastMouseRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Convert to world coordinates
    const worldX = (x - neuralViewport.x) / neuralViewport.scale;
    const worldY = (y - neuralViewport.y) / neuralViewport.scale;

    // Handle node dragging
    if (draggingNodeId !== null) {
      const newNodes = new Map(neuralLayout.nodes);
      const node = newNodes.get(draggingNodeId);

      if (node && !node.isLocked) {
        node.x = worldX;
        node.y = worldY;
        node.isDragging = true;
        setNeuralLayout({ ...neuralLayout, nodes: newNodes });
      }
      return;
    }

    // Update hover state
    let foundHover = false;
    for (const node of neuralLayout.nodes.values()) {
      const distance = Math.sqrt(
        (worldX - node.x) ** 2 + (worldY - node.y) ** 2
      );
      if (distance < node.radius) {
        setHoveringNodeId(node.id);
        foundHover = true;
        break;
      }
    }

    if (!foundHover) {
      setHoveringNodeId(null);
    }

    // Check connection hover
    let foundConnHover = null;
    for (const conn of neuralLayout.connections) {
      const fromNode = neuralLayout.nodes.get(conn.from);
      const toNode = neuralLayout.nodes.get(conn.to);

      if (!fromNode || !toNode) continue;

      const distance = distanceToLine(worldX, worldY, fromNode.x, fromNode.y, toNode.x, toNode.y);
      if (distance < 10) {
        foundConnHover = { from: conn.from, to: conn.to };
        break;
      }
    }

    setHoveringConnection(foundConnHover);
  }, [neuralLayout, neuralViewport, draggingNodeId, neuralPanning, distanceToLine]);

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
    setNeuralPanning(false);
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
  }, [neuralLayout, neuralNetMode, draggingNodeId]);

  // Update neural layout when selected blob changes
  useEffect(() => {
    if (!selectedBlob || !neuralNetCanvasRef.current) return;

    const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
    if (!currentBlob) return;

    const container = neuralNetCanvasRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

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
  }, [selectedBlob, updateNodeActivations]);

  // Update activations periodically
  useEffect(() => {
    if (!selectedBlob || !neuralNetCanvasRef.current) return;

    const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
    if (!currentBlob) return;

    const container = neuralNetCanvasRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

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
  }, [selectedBlob, updateNodeActivations]);

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
  }, [selectedBlob, neuralLayout]);

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

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Viewport transform is now inside renderDynamicNeuralNet
    renderDynamicNeuralNet(ctx, neuralLayout, width, height);
  }, [neuralLayout, renderDynamicNeuralNet, neuralViewport]); // Add neuralViewport dependency

  // cleanup function
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ===================== RENDERING =====================

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (!isRunningRef.current && !followBest && !followedBlobId) return;

    // Camera following logic
    if (followedBlobId !== null) {
      // Follow a specific blob
      const targetBlob = blobsRef.current.find(b => b.id === followedBlobId);
      if (targetBlob) {
        updateCamera(cameraRef.current, { x: targetBlob.x, y: targetBlob.y }, 0.08);
      } else {
        // Blob died, clear follow
        setFollowedBlobId(null);
      }
    } else if (followBest && blobsRef.current.length > 0) {
      const target = getCameraTarget(blobsRef.current, 'best');
      if (target) {
        updateCamera(cameraRef.current, target, 0.08);
      }
    }

    const renderCtx: RenderContext = {
      ctx,
      camera: cameraRef.current,
      width,
      height,
      selectedBlobId: selectedBlob?.id,
      currentTick: tickCountRef.current
    };

    renderSimulation(
      blobsRef.current,
      foodRef.current,
      foodClustersRef.current,
      obstaclesRef.current,
      logsRef.current,
      terrainZonesRef.current,
      renderCtx,
      foodIslandsRef.current  // Pass food islands for visualization
    );
  }, [followBest, followedBlobId, selectedBlob]);

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

  // ===================== ADDITIONAL CALLBACKS =====================

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
      }
    }
  }, [selectedBlob]);

  const logLayoutInfo = useCallback(() => {
    if (!neuralLayout) {
      console.log('No neural layout');
      return;
    }

    console.log('Neural Layout Info:');
    console.log(`- Total nodes: ${neuralLayout.nodes.size}`);
    console.log(`- Total connections: ${neuralLayout.connections.length}`);

    console.log('Node positions:');
    for (const node of neuralLayout.nodes.values()) {
      console.log(`  Node ${node.id} (${node.type}): (${node.x.toFixed(1)}, ${node.y.toFixed(1)})`);
    }

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

  const handleToggleFollowBest = useCallback(() => {
    setFollowBest(prev => !prev);
    setFollowedBlobId(null); // Clear specific follow when toggling follow best
  }, []);

  const handleFollowBlob = useCallback((blob: Blob) => {
    if (followedBlobId === blob.id) {
      // Toggle off if already following this blob
      setFollowedBlobId(null);
      setFollowBest(false);
    } else {
      setFollowedBlobId(blob.id);
      setFollowBest(false); // Disable follow best when following specific blob
    }
  }, [followedBlobId]);

  const handleToggleFullscreen = useCallback(() => {
    if (!canvasContainerRef.current) return;

    if (!document.fullscreenElement) {
      canvasContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Failed to exit fullscreen:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleDrawer = useCallback(() => {
    setDrawerExpanded(prev => !prev);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedBlob(null);
  }, []);

  const handleToggleNeuralNetMode = useCallback(() => {
    setNeuralNetMode(prev => prev === 'physics' ? 'fixed' : 'physics');
  }, []);

  const handleToggleShowActivations = useCallback(() => {
    setShowActivations(prev => !prev);
  }, []);

  const handleToggleShowWeights = useCallback(() => {
    setShowWeights(prev => !prev);
  }, []);

  const handleToggleTrainingPanel = useCallback(() => {
    setShowTrainingPanel(prev => !prev);
  }, []);

  // Load trained elite agents into the live simulation
  const handleLoadElites = useCallback((elites: SerializedGenome[]) => {
    if (!neatRef.current || elites.length === 0) return;

    console.log(`Loading ${elites.length} elite agents into simulation...`);

    // Create new blobs from elite genomes
    const newBlobs: Blob[] = [];

    for (const serialized of elites) {
      // Deserialize the genome
      const genome = HeadlessTrainer.deserializeGenome(serialized, neatRef.current);

      // Create blob with the trained genome
      const blob = createBlob(
        genome,
        serialized.generation,
        undefined,
        Math.random() * WORLD_WIDTH,
        Math.random() * WORLD_HEIGHT,
        undefined,
        undefined,
        () => nextBlobIdRef.current++
      );

      newBlobs.push(blob);
    }

    // Replace current population with trained elites
    // Keep some existing blobs if population is small
    const keepExisting = Math.max(0, Math.min(5, blobsRef.current.length));
    const existingToKeep = blobsRef.current
      .sort((a, b) => (b.genome.fitness || 0) - (a.genome.fitness || 0))
      .slice(0, keepExisting);

    blobsRef.current = [...newBlobs, ...existingToKeep];

    console.log(`Loaded ${newBlobs.length} elite agents + kept ${keepExisting} existing = ${blobsRef.current.length} total`);
  }, []);

  // ===================== RENDER JSX =====================

  return (
    <Container>
      <MaxWidthWrapper>
        <HeaderSection
          speciesCount={stats.speciesCount}
          population={stats.population}
          largestFamily={stats.largestFamily}
        />

        <VideoSection>
          <CanvasContainer ref={canvasContainerRef}>
            <SimCanvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            <HUDComponent
              generation={stats.generation}
              population={stats.population}
              maxPopulation={MAX_POPULATION}
              foodCount={foodRef.current.length}
              avgMass={stats.avgMass}
              avgAge={stats.avgAge}
              reproductionRate={stats.reproductionRate}
              totalBirths={stats.totalBirths}
              totalDeaths={stats.totalDeaths}
            />

            <LeaderboardComponent
              topBlobs={topBlobs}
              selectedBlobId={selectedBlob?.id || null}
              followedBlobId={followedBlobId}
              onSelectBlob={setSelectedBlob}
              onFollowBlob={handleFollowBlob}
              onOpenTraining={handleToggleTrainingPanel}
              currentTick={tickCountRef.current}
            />

            <ViewportControlsComponent
              zoom={zoom}
              followBest={followBest}
              isFullscreen={isFullscreen}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetCamera={resetCamera}
              onToggleFollowBest={handleToggleFollowBest}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </CanvasContainer>
        </VideoSection>

        <StatsDrawerComponent
          expanded={drawerExpanded}
          onToggle={handleToggleDrawer}
          speciesCount={stats.speciesCount}
          totalBirths={stats.totalBirths}
          totalDeaths={stats.totalDeaths}
          largestFamily={stats.largestFamily}
        />
      </MaxWidthWrapper>

      {selectedBlob && (
        <NeuralNetModalComponent
          selectedBlob={selectedBlob}
          familySize={familySize}
          onClose={handleCloseModal}
          neuralNetCanvasRef={neuralNetCanvasRef}
          neuralNetMode={neuralNetMode}
          showActivations={showActivations}
          showWeights={showWeights}
          zoomLevel={zoomLevel}
          onToggleNeuralNetMode={handleToggleNeuralNetMode}
          onToggleShowActivations={handleToggleShowActivations}
          onToggleShowWeights={handleToggleShowWeights}
          onResetLayout={handleResetLayout}
          onLogLayoutInfo={logLayoutInfo}
          onExportNetwork={handleExportNetwork}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onNeuralNetMouseDown={handleNeuralNetMouseDown}
          onNeuralNetMouseMove={handleNeuralNetMouseMove}
          onNeuralNetMouseUp={handleNeuralNetMouseUp}
          onNeuralNetWheel={handleNeuralNetWheel}
          neuralNodeCount={calculateNodeCount(selectedBlob)}
          neuralConnectionCount={calculateConnectionCount(selectedBlob)}
          selectedNodeInfo={selectedNodeInfo}
        />
      )}

      {/* Training Panel */}
      <TrainingPanelComponent
        isOpen={showTrainingPanel}
        onClose={() => setShowTrainingPanel(false)}
        onLoadElites={handleLoadElites}
        isSimulationRunning={isRunning}
        onPauseSimulation={() => setIsRunning(false)}
        onResumeSimulation={() => setIsRunning(true)}
      />
    </Container>
  );
}