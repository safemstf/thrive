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
} from './config/agario.styles';

import {
  TerrainZone, ZoneType, Food, FoodCluster, Obstacle, Log, Blob, NeuralLayout, NeuralNode, NeuralConnection
} from './config/agario.types';

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
  updateSurvivalPressure
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
  getNearbyFood
} from './utils/environment';

import { HeaderSection } from "./components/HeaderSection";
import { HUDComponent } from "./components/HUDComponent";
import { LeaderboardComponent } from "./components/LeaderboardComponent";
import { NeuralNetModalComponent } from "./components/NeuralNetModal";
import { StatsDrawerComponent } from "./components/StatsDrawerComponent";
import { ViewportControlsComponent } from "./components/ViewportControlsComponent";

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

  const getZoneAt = useCallback((x: number, y: number): string => {  // Return string instead of ZoneType
    for (const zone of terrainZonesRef.current) {
      if (x >= zone.x && x < zone.x + zone.width &&
        y >= zone.y && y < zone.y + zone.height) {
        return zone.type;  // Already a string
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

    // 3. Initialize blobs with proper IDs
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
        () => nextBlobIdRef.current++  // Use the ID generator
      );
      blobsRef.current.push(blob);
    }

    // 4. Initialize food
    foodRef.current = spawnFood(
      [],
      MAX_FOOD,
      MAX_FOOD,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      getZoneAt
    );

    // 5. Initialize obstacles
    obstaclesRef.current = [];
    for (let i = 0; i < 20; i++) {
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
  }, [createBlob, spawnFood, getZoneAt, updateSpatialGrid]);

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
      foodClustersRef.current = clusterFood(foodRef.current);
    }

    // Spawn food
    foodRef.current = spawnFood(
      foodRef.current,
      FOOD_SPAWN_RATE,
      MAX_FOOD,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      getZoneAt
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
            () => nextBlobIdRef.current++  // Pass ID generator
          );
        },
        tick  // Pass current simulation tick
      );

      if (result.success) {
        // Update the blobs array
        blobsRef.current = result.updatedBlobs!;
        totalBirthsRef.current++;

        // Ensure nextBlobIdRef is ahead of the new baby's ID
        if (result.baby) {
          nextBlobIdRef.current = Math.max(nextBlobIdRef.current, result.baby.id + 1);
        }
        return true;
      }

      return false;
    };

    // Update each blob
    for (const blob of blobsRef.current) {
      simulateBlob(
        blob,
        blobsRef.current,
        foodRef.current,
        obstaclesRef.current,
        logsRef.current,
        tick,
        spatialGridRef.current,
        (blob: Blob) => getVision(
          blob,
          blobsRef.current,
          foodRef.current,
          obstaclesRef.current,
          (x: number, y: number, range: number) => getNearbyFood(x, y, range, spatialGridRef.current, GRID_SIZE),
          tick,
          WORLD_WIDTH,
          WORLD_HEIGHT
        ),
        giveBirthWrapper  // Use the wrapper, not the original
      );
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

    // Remove dead blobs (from both simulateBlob and collisions)
    const allDeadBlobs = new Set([...deadBlobs, ...collisionResult.deadBlobIds || []]);
    blobsRef.current = blobsRef.current.filter(b => !allDeadBlobs.has(b.id));

    // Calculate fitness using modular system
    calculatePopulationFitness(blobsRef.current);

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
  }, [getZoneAt, updateSurvivalPressure, calculatePopulationFitness, handleCollisions, simulateBlob, getVision, getNearbyFood, spawnFood, clusterFood, ageFood, updateSpatialGrid, giveBirth]);

  // ===================== INTERACTIVE NEURAL NET VISUALIZATION =====================;

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

  const handleToggleShowWeights = () => {
    setShowWeights(!showWeights);
  };

  const handleExportNetwork = () => {
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
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  const handleNeuralNetWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 0.001;
    const newZoom = zoomLevel - (e.deltaY * zoomFactor);
    setZoomLevel(Math.max(0.5, Math.min(3.0, newZoom)));
  };

  // Add these helper functions near your other helper functions (around line 100)

  const calculateNodeCount = (blob: Blob): number => {
    if (!blob.genome) return 0;

    let count = 0;
    // Count all nodes in the genome
    count = blob.genome.nodes.size || 0;

    // Fallback calculation if nodes size is 0
    if (count === 0) {
      count += INPUT_SIZE; // Input nodes
      // Estimate hidden nodes based on typical network structure
      count += 8; // Typical hidden nodes
      count += OUTPUT_SIZE; // Output nodes
    }

    return count;
  };

  const calculateConnectionCount = (blob: Blob): number => {
    if (!blob.genome) return 0;

    // Get connections from genome
    const connections = blob.genome.connections.size || 0;

    // Fallback calculation if connections size is 0
    if (connections === 0) {
      // Simple estimation: input->hidden + hidden->output
      return INPUT_SIZE * 8 + 8 * OUTPUT_SIZE; // Approximate
    }

    return connections;
  };

  const detectNodeAtPosition = (x: number, y: number, layout: NeuralLayout | null): SelectedNodeInfo | null => {
    if (!layout) return null;

    for (const node of layout.nodes.values()) {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance < node.radius) {
        // Count connections for this node
        const outgoingConnections = layout.connections.filter(conn => conn.from === node.id).length;
        const incomingConnections = layout.connections.filter(conn => conn.to === node.id).length;
        const totalConnections = outgoingConnections + incomingConnections;

        return {
          id: node.id,
          layer: node.type as 'input' | 'hidden' | 'output',
          activation: node.activationValue,
          connections: totalConnections
        };
      }
    }

    return null;
  };

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

    if (e.button === 0 && !e.shiftKey) {
      const canvas = neuralNetCanvasRef.current;
      if (canvas && selectedBlob) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Call a function to detect if a node was clicked
        const clickedNode = detectNodeAtPosition(x, y, neuralLayout);
        if (clickedNode) {
          setSelectedNodeInfo(clickedNode);
        } else {
          setSelectedNodeInfo(null);
        }
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
  }, [neuralLayout, neuralNetMode, draggingNodeId, applyPhysics, showWeights]);
  
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

    // Apply zoom transformation
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-width / 2, -height / 2);

    renderDynamicNeuralNet(ctx, neuralLayout, width, height);

    ctx.restore();
  }, [neuralLayout, renderDynamicNeuralNet, zoomLevel]);

  // cleanup function
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  // ===================== RENDERING =====================

  // Optimize render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Skip rendering if nothing changed (optional optimization)
    if (!isRunningRef.current && !followBest) return;

    // Camera following
    if (followBest && blobsRef.current.length > 0) {
      const target = getCameraTarget(blobsRef.current, 'best');
      if (target) {
        updateCamera(cameraRef.current, target, 0.08);
      }
    }

    // Render using modular system
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
      renderCtx
    );
  }, [followBest, selectedBlob, getCameraTarget, updateCamera, renderSimulation]);

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

  const topBlobs = getTopBlobs(blobsRef.current, 12);

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
        <HeaderSection
          speciesCount={stats.speciesCount}
          population={stats.population}
          largestFamily={stats.largestFamily}
        />

        <VideoSection>
          <CanvasContainer>
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
              onSelectBlob={setSelectedBlob}
              currentTick={tickCountRef.current}

            />

            <ViewportControlsComponent
              zoom={zoom}
              followBest={followBest}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetCamera={resetCamera}
              onToggleFollowBest={() => setFollowBest(!followBest)}
            />
          </CanvasContainer>
        </VideoSection>

        <StatsDrawerComponent
          expanded={drawerExpanded}
          onToggle={() => setDrawerExpanded(!drawerExpanded)}
          speciesCount={stats.speciesCount}
          totalBirths={stats.totalBirths}
          totalDeaths={stats.totalDeaths}
          largestFamily={stats.largestFamily}
        />
      </MaxWidthWrapper>

      {selectedBlob && (
        <NeuralNetModalComponent
          selectedBlob={selectedBlob}
          familySize={blobsRef.current.filter(b => b.familyLineage === selectedBlob.familyLineage).length}
          onClose={() => setSelectedBlob(null)}
          neuralNetCanvasRef={neuralNetCanvasRef}
          neuralNetMode={neuralNetMode}
          showActivations={showActivations}
          showWeights={showWeights} // Add this state
          zoomLevel={zoomLevel} // Add this state
          onToggleNeuralNetMode={() => setNeuralNetMode(neuralNetMode === 'physics' ? 'fixed' : 'physics')}
          onToggleShowActivations={() => setShowActivations(!showActivations)}
          onToggleShowWeights={() => setShowWeights(!showWeights)} // Add this handler
          onResetLayout={handleResetLayout}
          onLogLayoutInfo={logLayoutInfo}
          onExportNetwork={handleExportNetwork} // Add this handler
          onZoomIn={handleZoomIn} // Add this handler
          onZoomOut={handleZoomOut} // Add this handler
          onResetZoom={handleResetZoom} // Add this handler
          onNeuralNetMouseDown={handleNeuralNetMouseDown}
          onNeuralNetMouseMove={handleNeuralNetMouseMove}
          onNeuralNetMouseUp={handleNeuralNetMouseUp}
          onNeuralNetWheel={handleNeuralNetWheel} // Add this handler
          neuralNodeCount={calculateNodeCount(selectedBlob)} // Add this function
          neuralConnectionCount={calculateConnectionCount(selectedBlob)} // Add this function
          selectedNodeInfo={selectedNodeInfo} // Add this state
        />
      )}
    </Container>
  );
}