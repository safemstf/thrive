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
  getNearbyFood,
  createBiomes,
  calculatePopulationPressure
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
  const biomesRef = useRef<BiomeConfig[]>([]);
  const populationPressureRef = useRef(0);
  
  const [showWeights, setShowWeights] = useState<boolean>(false);
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

  // Neural viewport state
  const [neuralViewport, setNeuralViewport] = useState({ x: 0, y: 0, scale: 1 });
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

  const topBlobs = useMemo(() => {
    return getTopBlobs(blobsRef.current, 12);
  }, [Math.floor(stats.tickCount / 30), stats.population]);

  const familySize = useMemo(() => {
    if (!selectedBlob) return 0;
    return blobsRef.current.filter(b =>
      b.familyLineage === selectedBlob.familyLineage
    ).length;
  }, [selectedBlob?.familyLineage, stats.population]);

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
    neatRef.current = new Neat(INPUT_SIZE, OUTPUT_SIZE, INITIAL_BLOBS, NEAT_CONFIG);

    terrainZonesRef.current = [
      { x: 200, y: 200, width: 300, height: 300, type: 'safe' },
      { x: 800, y: 400, width: 400, height: 400, type: 'safe' },
      { x: 400, y: 800, width: 300, height: 300, type: 'danger' },
      { x: 1000, y: 100, width: 400, height: 400, type: 'danger' }
    ];

    biomesRef.current = createBiomes(WORLD_WIDTH, WORLD_HEIGHT);

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

    foodRef.current = spawnFood(
      [],
      biomesRef.current,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      MAX_FOOD / 2,
      MAX_FOOD,
      0
    );

    obstaclesRef.current = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      obstaclesRef.current.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        radius: 20 + Math.random() * 20
      });
    }

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

    tickCountRef.current = 0;
    totalDeathsRef.current = 0;
    totalBirthsRef.current = 0;
    survivalPressureRef.current = 0;

    spatialGridRef.current = updateSpatialGrid(foodRef.current, GRID_SIZE);

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

    if (tick % 5 === 0) {
      spatialGridRef.current = updateSpatialGrid(foodRef.current, GRID_SIZE);
    }

    if (tick % CLUSTER_UPDATE_INTERVAL === 0) {
      foodClustersRef.current = clusterFood(foodRef.current, spatialGridRef.current, GRID_SIZE);
    }

    populationPressureRef.current = calculatePopulationPressure(
      blobsRef.current.length,
      foodRef.current.length
    );

    foodRef.current = spawnFood(
      foodRef.current,
      biomesRef.current,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      FOOD_SPAWN_RATE,
      MAX_FOOD,
      populationPressureRef.current
    );

    foodRef.current = ageFood(foodRef.current);

    if (tick % 200 === 0) {
      survivalPressureRef.current += SURVIVAL_PRESSURE_INCREASE;
      obstaclesRef.current = updateSurvivalPressure(
        obstaclesRef.current,
        survivalPressureRef.current
      );
    }

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
        giveBirthWrapper
      );
    }

    const deadBlobs = new Set<number>();
    for (const blob of blobsRef.current) {
      if (blob.shouldRemove) {
        deadBlobs.add(blob.id);
        totalDeathsRef.current++;
      }
    }

    const collisionResult = handleCollisions(
      blobsRef.current,
      obstaclesRef.current,
      foodRef.current,
      totalDeathsRef
    );

    blobsRef.current = collisionResult.updatedBlobs;
    foodRef.current = collisionResult.updatedFood;

    const allDeadBlobs = new Set([...deadBlobs, ...collisionResult.deadBlobIds || []]);
    blobsRef.current = blobsRef.current.filter(b => !allDeadBlobs.has(b.id));

    calculatePopulationFitness(blobsRef.current);

    if (tick % 10 === 0) {
      const avgMass = blobsRef.current.reduce((s, b) => s + b.mass, 0) / Math.max(blobsRef.current.length, 1);
      const avgAge = blobsRef.current.reduce((s, b) => s + b.age, 0) / Math.max(blobsRef.current.length, 1);
      const bestFitness = Math.max(0, ...blobsRef.current.map(b => b.genome.fitness));
      const maxGen = Math.max(1, ...blobsRef.current.map(b => b.generation));

      const familySizes = new Map<number, number>();
      for (const blob of blobsRef.current) {
        familySizes.set(blob.familyLineage, (familySizes.get(blob.familyLineage) || 0) + 1);
      }
      const largestFamily = Math.max(0, ...Array.from(familySizes.values()));

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

  // ===================== NEURAL NET VISUALIZATION =====================

  const updateNodeActivations = useCallback((layout: NeuralLayout, inputs: number[], outputs: number[]) => {
    const newNodes = new Map(layout.nodes);

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
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(neuralViewport.x, neuralViewport.y);
    ctx.scale(neuralViewport.scale, neuralViewport.scale);

    // Grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 1 / neuralViewport.scale;

    const gridSize = 50;
    const viewLeft = -neuralViewport.x / neuralViewport.scale;
    const viewTop = -neuralViewport.y / neuralViewport.scale;
    const viewRight = viewLeft + width / neuralViewport.scale;
    const viewBottom = viewTop + height / neuralViewport.scale;

    const startX = Math.floor(viewLeft / gridSize) * gridSize;
    const startY = Math.floor(viewTop / gridSize) * gridSize;

    for (let x = startX; x <= viewRight; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, viewTop);
      ctx.lineTo(x, viewBottom);
      ctx.stroke();
    }

    for (let y = startY; y <= viewBottom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(viewLeft, y);
      ctx.lineTo(viewRight, y);
      ctx.stroke();
    }

    // Connections
    ctx.lineCap = 'round';

    for (const conn of layout.connections) {
      const fromNode = layout.nodes.get(conn.from);
      const toNode = layout.nodes.get(conn.to);

      if (!fromNode || !toNode) continue;

      const weight = conn.weight;
      const strength = Math.min(Math.abs(weight), 1);
      const baseLineWidth = 1 + strength * 2;
      const lineWidth = baseLineWidth / neuralViewport.scale;

      const isHovering = hoveringConnection &&
        hoveringConnection.from === conn.from &&
        hoveringConnection.to === conn.to;

      const hue = weight > 0 ? 140 : 0;
      const saturation = 70;
      const lightness = 40 + strength * 40;
      const alpha = isHovering ? 0.9 : 0.2 + strength * 0.5;

      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = isHovering ? lineWidth * 1.5 : lineWidth;

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

      if (strength > 0.3) {
        const angle = Math.atan2(endY - controlY2, endX - controlX2);
        const arrowSize = (3 + strength * 4) / neuralViewport.scale;
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

    // Nodes
    for (const node of layout.nodes.values()) {
      const isHovering = hoveringNodeId === node.id;
      const isDragging = draggingNodeId === node.id;

      let color = '';

      if (node.type === 'input') {
        color = '#3b82f6';
      } else if (node.type === 'hidden') {
        color = '#8b5cf6';
      } else {
        color = '#10b981';
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
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isDragging ? '#fbbf24' : isHovering ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = (isDragging ? 3 : isHovering ? 2 : 1) / neuralViewport.scale;
      ctx.stroke();

      if (node.isLocked) {
        const lockSize = 6 / neuralViewport.scale;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, lockSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      const fontSize = Math.max(10, node.radius * 0.6) / neuralViewport.scale;
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      if (showActivations && node.activationValue !== undefined) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${9 / neuralViewport.scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(node.activationValue.toFixed(2), node.x, node.y + node.radius + 14 / neuralViewport.scale);
      }
    }

    ctx.restore();

    // UI overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(8, height - 38, 250, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.fillText(`Zoom: ${(neuralViewport.scale * 100).toFixed(0)}% • Shift+Drag to pan`, 16, height - 20);
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

  // ===================== NEURAL NET MOUSE HANDLERS =====================

  const handleNeuralNetMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldX = (screenX - neuralViewport.x) / neuralViewport.scale;
    const worldY = (screenY - neuralViewport.y) / neuralViewport.scale;

    for (const node of neuralLayout.nodes.values()) {
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < node.radius) {
        if (!node.isLocked || node.type === 'hidden') {
          setDraggingNodeId(node.id);
        }
        return;
      }
    }

    if (e.shiftKey || e.button === 1) {
      setNeuralPanning(true);
      neuralLastMouseRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    }
  }, [neuralLayout, neuralViewport]);

  const handleNeuralNetMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!neuralLayout || !neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

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

    const worldX = (screenX - neuralViewport.x) / neuralViewport.scale;
    const worldY = (screenY - neuralViewport.y) / neuralViewport.scale;

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

    canvas.style.cursor = e.shiftKey ? 'grab' : 'default';

    let foundHover = false;
    for (const node of neuralLayout.nodes.values()) {
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < node.radius) {
        setHoveringNodeId(node.id);
        foundHover = true;
        if (!node.isLocked || node.type === 'hidden') {
          canvas.style.cursor = 'pointer';
        }
        break;
      }
    }

    if (!foundHover) {
      setHoveringNodeId(null);
    }

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

    if (neuralNetCanvasRef.current) {
      neuralNetCanvasRef.current.style.cursor = 'default';
    }
  }, [draggingNodeId, neuralLayout]);

  const handleNeuralNetWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (!neuralNetCanvasRef.current) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldXBefore = (mouseX - neuralViewport.x) / neuralViewport.scale;
    const worldYBefore = (mouseY - neuralViewport.y) / neuralViewport.scale;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3.0, neuralViewport.scale * zoomFactor));

    const newX = mouseX - worldXBefore * newScale;
    const newY = mouseY - worldYBefore * newScale;

    setNeuralViewport({
      x: newX,
      y: newY,
      scale: newScale
    });
  }, [neuralViewport]);

  const handleResetNeuralView = useCallback(() => {
    if (!neuralNetCanvasRef.current || !neuralLayout) return;

    const canvas = neuralNetCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const node of neuralLayout.nodes.values()) {
      minX = Math.min(minX, node.x - node.radius);
      maxX = Math.max(maxX, node.x + node.radius);
      minY = Math.min(minY, node.y - node.radius);
      maxY = Math.max(maxY, node.y + node.radius);
    }

    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;

    const padding = 80;
    const scaleX = (width - padding * 2) / layoutWidth;
    const scaleY = (height - padding * 2) / layoutHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setNeuralViewport({
      x: width / 2 - centerX * scale,
      y: height / 2 - centerY * scale,
      scale
    });
  }, [neuralLayout]);

  // ===================== OTHER HANDLERS =====================

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
        
        // Reset viewport
        setTimeout(() => handleResetNeuralView(), 100);
      }
    }
  }, [selectedBlob, handleResetNeuralView]);

  const logLayoutInfo = useCallback(() => {
    if (!neuralLayout) {
      console.log('No neural layout');
      return;
    }

    console.log('Neural Layout Info:');
    console.log(`- Total nodes: ${neuralLayout.nodes.size}`);
    console.log(`- Total connections: ${neuralLayout.connections.length}`);
    console.log(`- Viewport:`, neuralViewport);
  }, [neuralLayout, neuralViewport]);

  // ===================== EFFECTS =====================

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

    setTimeout(() => handleResetNeuralView(), 100);
  }, [selectedBlob?.id, updateNodeActivations, handleResetNeuralView]);

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

    renderDynamicNeuralNet(ctx, neuralLayout, width, height);
  }, [neuralLayout, renderDynamicNeuralNet, neuralViewport]);

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

    if (!isRunningRef.current && !followBest) return;

    if (followBest && blobsRef.current.length > 0) {
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
      renderCtx
    );
  }, [followBest, selectedBlob]);

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

  useEffect(() => {
    initSimulation();
    setIsRunning(true);
  }, [initSimulation]);

  const handleToggleFollowBest = useCallback(() => setFollowBest(prev => !prev), []);
  const handleToggleDrawer = useCallback(() => setDrawerExpanded(prev => !prev), []);
  const handleCloseModal = useCallback(() => setSelectedBlob(null), []);
  const handleToggleNeuralNetMode = useCallback(() => setNeuralNetMode(prev => prev === 'physics' ? 'fixed' : 'physics'), []);
  const handleToggleShowActivations = useCallback(() => setShowActivations(prev => !prev), []);
  const handleToggleShowWeights = useCallback(() => setShowWeights(prev => !prev), []);

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
              onToggleFollowBest={handleToggleFollowBest}
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
          zoomLevel={neuralViewport.scale}
          onToggleNeuralNetMode={handleToggleNeuralNetMode}
          onToggleShowActivations={handleToggleShowActivations}
          onToggleShowWeights={handleToggleShowWeights}
          onResetLayout={handleResetLayout}
          onLogLayoutInfo={logLayoutInfo}
          onExportNetwork={handleExportNetwork}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onResetZoom={handleResetNeuralView}
          onNeuralNetMouseDown={handleNeuralNetMouseDown}
          onNeuralNetMouseMove={handleNeuralNetMouseMove}
          onNeuralNetMouseUp={handleNeuralNetMouseUp}
          onNeuralNetWheel={handleNeuralNetWheel}
          neuralNodeCount={calculateNodeCount(selectedBlob)}
          neuralConnectionCount={calculateConnectionCount(selectedBlob)}
          selectedNodeInfo={selectedNodeInfo}
        />
      )}
    </Container>
  );
}