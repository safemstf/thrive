// src/components/cs/agario/agario.tsx
'use client'

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  PlayCircle, PauseCircle, RefreshCw, Brain, Trophy,
  TrendingUp, ChevronUp, ChevronDown,
  ZoomIn, ZoomOut, Maximize2, X, Crosshair
} from "lucide-react";
import styled from 'styled-components';
import { Genome, Neat, NodeType } from './neat';

// ===================== STYLED COMPONENTS =====================

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0e1a, #1a1a2e);
  color: #e6eef8;
  padding: 2rem 1rem;
  padding-bottom: 80px;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
    padding-bottom: 80px;
  }
`;

const MaxWidthWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #94a3b8;
`;

const VideoSection = styled.section`
  width: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(5,10,20,0.9));
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(59,130,246,0.22);
  box-shadow: 0 8px 32px rgba(0,0,0,0.32);
  margin-bottom: 1.5rem;
  aspect-ratio: 16 / 9;
  max-height: 65vh;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const SimCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  background: #0a0e1a;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const HUD = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.9rem;
  min-width: 180px;
  pointer-events: none;
`;

const LeaderboardHUD = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.85rem;
  min-width: 220px;
  max-height: 350px;
  overflow-y: auto;
  pointer-events: auto;
`;

const ViewportControls = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ViewportButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
  background: ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.9)'};
  color: ${({ $active }) => $active ? '#22c55e' : '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
    border-color: ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.7)' : 'rgba(59, 130, 246, 0.5)'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
  pointer-events: none;
`;

const ControlsDrawer = styled.div<{ $expanded: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 14, 26, 0.98);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(59, 130, 246, 0.3);
  z-index: 100;
  max-height: ${({ $expanded }) => $expanded ? '70vh' : '60px'};
  transition: max-height 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  marginTop: 1rem;
`;

const DrawerHandle = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  min-height: 0;
`;

const StatCard = styled.div<{ $color?: string }>`
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(59,130,246,0.1);
  color: #e6eef8;
  
  .label {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }
  
  .value {
    font-size: 1.6rem;
    color: ${({ $color = '#3b82f6' }) => $color};
    font-weight: 800;
  }
  
  .change {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.2rem;
  }
`;

const Grid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LeaderboardEntry = styled.div<{ $rank: number; $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $rank, $selected }) =>
    $selected ? 'rgba(99, 102, 241, 0.2)' :
      $rank === 0 ? 'rgba(251, 191, 36, 0.1)' :
        $rank === 1 ? 'rgba(156, 163, 175, 0.1)' :
          $rank === 2 ? 'rgba(205, 127, 50, 0.1)' :
            'transparent'};
  border-left: 2px solid ${({ $rank, $selected }) =>
    $selected ? '#6366f1' :
      $rank === 0 ? '#fbbf24' :
        $rank === 1 ? '#9ca3af' :
          $rank === 2 ? '#cd7f32' :
            'transparent'};
  margin-bottom: 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.15);
  }
  
  .rank {
    font-weight: 800;
    min-width: 25px;
    color: ${({ $rank }) =>
    $rank === 0 ? '#fbbf24' :
      $rank === 1 ? '#9ca3af' :
        $rank === 2 ? '#cd7f32' :
          '#94a3b8'};
  }
  
  .blob-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  .info {
    flex: 1;
    font-size: 0.8rem;
  }
  
  .gen {
    color: #94a3b8;
    font-size: 0.7rem;
  }
  
  .mass {
    font-weight: 700;
    color: #3b82f6;
  }
`;

const NeuralNetModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const NeuralNetPanel = styled.div`
  background: linear-gradient(135deg, rgba(10, 14, 26, 0.98), rgba(26, 26, 46, 0.98));
  border-radius: 16px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  padding: 1.5rem;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    padding: 1rem;
    max-height: 85vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(59, 130, 246, 0.3);
  background: rgba(0, 0, 0, 0.5);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
  }
`;

const CanvasWrapper = styled.div`
  flex: 1;
  min-height: 650px; /* Minimum height */
  position: relative;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95));
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  overflow: hidden;
  margin: 1rem 0;
`;

const NeuralNetCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

const BlobInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid #6366f1;
`;

// ===================== TYPES =====================

interface Blob {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  genome: Genome;
  generation: number;
  kills: number;
  age: number;
  foodEaten: number;
  distanceTraveled: number;
  lastX: number;
  lastY: number;
  idleTicks: number;
}

interface Food {
  x: number;
  y: number;
  mass: number;
  age: number;
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

// ===================== CONSTANTS =====================

const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 3000;
const INITIAL_BLOBS = 30;
const MAX_FOOD = 3000;
const FOOD_SPAWN_RATE = 50;
const NUM_OBSTACLES = 50;
const EVOLUTION_INTERVAL = 1000;

const INPUT_SIZE = 12;  // 8 vision + mass + vx + vy + wall
const OUTPUT_SIZE = 3;  // acceleration, rotation, (split - future)

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

  // Simulation state refs
  const blobsRef = useRef<Blob[]>([]);
  const foodRef = useRef<Food[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const neatRef = useRef<Neat | null>(null);
  const nextBlobIdRef = useRef(0);
  const tickCountRef = useRef(0);
  const totalDeathsRef = useRef(0);

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

  // Stats for display
  const [stats, setStats] = useState({
    generation: 1,
    totalKills: 0,
    totalDeaths: 0,
    avgMass: 30,
    bestFitness: 0,
    speciesCount: 1,
    avgNodes: INPUT_SIZE + OUTPUT_SIZE,
    avgConnections: INPUT_SIZE * OUTPUT_SIZE,
    tickCount: 0
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

  // ===================== INITIALIZATION =====================

  const createBlob = useCallback((genome: Genome, generation: number, parentId?: number): Blob => {
    const x = Math.random() * WORLD_WIDTH;
    const y = Math.random() * WORLD_HEIGHT;
    return {
      id: nextBlobIdRef.current++,
      x, y,
      vx: 0, vy: 0,
      mass: 30,
      color: randomColor(),
      genome,
      generation,
      kills: 0,
      age: 0,
      foodEaten: 0,
      distanceTraveled: 0,
      lastX: x, lastY: y,
      idleTicks: 0
    };
  }, [randomColor]);

  const initNEAT = useCallback(() => {
    neatRef.current = new Neat(INPUT_SIZE, OUTPUT_SIZE, INITIAL_BLOBS, {
      mutationRate: 0.8,
      elitism: 0.5,
      mutationSize: 0.5,
      addNodeRate: 0.30,
      addConnectionRate: 0.5,
      compatibilityThreshold: 3.0
    });
  }, []);

  const spawnFood = useCallback((count: number = FOOD_SPAWN_RATE) => {
    for (let i = 0; i < count && foodRef.current.length < MAX_FOOD; i++) {
      foodRef.current.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        mass: 2 + Math.random() * 2,
        age: 0
      });
    }
  }, []);

  const initObstacles = useCallback(() => {
    obstaclesRef.current = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      obstaclesRef.current.push({
        x: 100 + Math.random() * (WORLD_WIDTH - 200),
        y: 100 + Math.random() * (WORLD_HEIGHT - 200),
        radius: 20 + Math.random() * 20
      });
    }
  }, []);

  const initSimulation = useCallback(() => {
    initNEAT();

    blobsRef.current = [];
    foodRef.current = [];
    nextBlobIdRef.current = 0;
    tickCountRef.current = 0;
    totalDeathsRef.current = 0;

    // Create initial blobs from NEAT population
    for (const genome of neatRef.current!.population) {
      blobsRef.current.push(createBlob(genome, 1));
    }

    // Spawn initial food
    for (let i = 0; i < MAX_FOOD; i++) {
      foodRef.current.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        mass: 2 + Math.random() * 2,
        age: 0
      });
    }

    initObstacles();

    setStats({
      generation: 1,
      totalKills: 0,
      totalDeaths: 0,
      avgMass: 30,
      bestFitness: 0,
      speciesCount: 1,
      avgNodes: INPUT_SIZE + OUTPUT_SIZE + 1,
      avgConnections: (INPUT_SIZE + 1) * OUTPUT_SIZE,
      tickCount: 0
    });

    setSelectedBlob(null);

    console.log(`🚀 Initialized: ${blobsRef.current.length} blobs, ${foodRef.current.length} food, ${obstaclesRef.current.length} obstacles`);
  }, [initNEAT, createBlob, initObstacles]);

  // ===================== VISION SYSTEM =====================

  const getVision = useCallback((blob: Blob): number[] => {
    const inputs = new Array(INPUT_SIZE).fill(0);
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const visionRange = 280;

    angles.forEach((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);

      let bestSignal = 0;
      let closestDist = visionRange;

      // Check food
      for (const f of foodRef.current) {
        const fdx = f.x - blob.x;
        const fdy = f.y - blob.y;
        const dist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (dist > visionRange) continue;

        const dot = fdx * dx + fdy * dy;
        if (dot > 0) {
          const cosAngle = dot / (dist + 0.001);
          if (cosAngle > 0.7 && dist < closestDist) {
            closestDist = dist;
            bestSignal = 0.5 * (1 - dist / visionRange);
          }
        }
      }

      // Check obstacles (dangerous!)
      for (const obs of obstaclesRef.current) {
        const odx = obs.x - blob.x;
        const ody = obs.y - blob.y;
        const dist = Math.sqrt(odx * odx + ody * ody);
        const effectiveDist = dist - obs.radius;
        if (effectiveDist > visionRange) continue;

        const dot = odx * dx + ody * dy;
        if (dot > 0) {
          const cosAngle = dot / (dist + 0.001);
          if (cosAngle > 0.6 && effectiveDist < closestDist) {
            closestDist = Math.max(0, effectiveDist);
            bestSignal = -1.0 * (1 - closestDist / visionRange);
          }
        }
      }

      // Check other blobs
      for (const other of blobsRef.current) {
        if (other.id === blob.id) continue;

        const bdx = other.x - blob.x;
        const bdy = other.y - blob.y;
        const dist = Math.sqrt(bdx * bdx + bdy * bdy);
        if (dist > visionRange) continue;

        const dot = bdx * dx + bdy * dy;
        if (dot > 0) {
          const cosAngle = dot / (dist + 0.001);
          if (cosAngle > 0.6 && dist < closestDist) {
            closestDist = dist;
            if (blob.mass > other.mass * 1.15) {
              bestSignal = 0.9 * (1 - dist / visionRange); // Prey!
            } else if (other.mass > blob.mass * 1.15) {
              bestSignal = -0.8 * (1 - dist / visionRange); // Threat!
            } else {
              bestSignal = 0.1 * (1 - dist / visionRange); // Similar
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

    return inputs;
  }, []);

  // ===================== UPDATE LOOP =====================

  const update = useCallback(() => {
    if (!isRunningRef.current || !neatRef.current) return;

    tickCountRef.current++;
    const tick = tickCountRef.current;

    // Spawn food continuously
    spawnFood();

    // Age food
    for (let i = foodRef.current.length - 1; i >= 0; i--) {
      foodRef.current[i].age++;
      if (foodRef.current[i].age > 5000) {
        foodRef.current.splice(i, 1);
      }
    }

    const blobsToRemove: Set<number> = new Set();
    let killsThisTick = 0;

    // Update each blob
    for (const blob of blobsRef.current) {
      if (blobsToRemove.has(blob.id)) continue;

      blob.age++;

      // Neural network decision
      const inputs = getVision(blob);
      const outputs = blob.genome.activate(inputs);

      // Apply outputs
      const acceleration = Math.tanh(outputs[0]) * 0.45;
      const rotation = Math.tanh(outputs[1]) * 0.2;

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
        if (distMoved < 0.3) {
          blob.idleTicks++;
          if (blob.idleTicks > 100) blob.genome.fitness -= 0.1;
        } else {
          blob.idleTicks = 0;
          blob.genome.fitness += distMoved * 0.01;
        }
      }
      blob.lastX = blob.x;
      blob.lastY = blob.y;

      // Starvation
      if (tick % 200 === 0) {
        blob.mass = Math.max(15, blob.mass - 2);
        if (blob.mass <= 15) {
          blobsToRemove.add(blob.id);
          blob.genome.fitness -= 20;
        }
      }
    }

    // Obstacle collisions - DROP FOOD ON DEATH
    for (const blob of blobsRef.current) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;

      for (const obs of obstaclesRef.current) {
        const dist = distance(blob.x, blob.y, obs.x, obs.y);

        if (dist < blobRadius + obs.radius) {
          // Drop food pellets!
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

          blob.genome.fitness -= 50;
          blobsToRemove.add(blob.id);
          totalDeathsRef.current++;
          console.log(`💀 Blob #${blob.id} hit obstacle! Dropped ${pelletCount} food`);
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

    // Blob eating blob (15% size advantage needed)
    for (const blob of blobsRef.current) {
      if (blobsToRemove.has(blob.id)) continue;

      const blobRadius = Math.sqrt(blob.mass) * 2.5;

      for (const other of blobsRef.current) {
        if (blob.id === other.id || blobsToRemove.has(other.id)) continue;

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

    // Remove dead blobs
    blobsRef.current = blobsRef.current.filter(b => !blobsToRemove.has(b.id));

    // Survival fitness with diminishing returns
    for (const blob of blobsRef.current) {
      // Reset fitness to 0 and calculate based on achievements
      blob.genome.fitness = 0;

      // === BASE SURVIVAL (small reward for not dying) ===
      blob.genome.fitness += Math.min(blob.age / 100, 1); // Max +1 per 100 ticks

      // === MASS GROWTH (logarithmic, rewards growth but with diminishing returns) ===
      if (blob.mass > 30) {
        const massFactor = Math.log2(blob.mass / 30); // Double mass = +1 point
        blob.genome.fitness += massFactor * 10; // 10 points per doubling
      }

      // === KILLS (major reward, exponential) ===
      if (blob.kills > 0) {
        // Exponential reward for multiple kills
        blob.genome.fitness += blob.kills * 100; // Base 100 per kill
        if (blob.kills > 1) {
          blob.genome.fitness += Math.pow(blob.kills, 1.5) * 50; // Bonus for multiple kills
        }
      }

      // === FOOD EATING (high reward, encourages active hunting) ===
      blob.genome.fitness += blob.foodEaten * 25; // 25 points per food

      // === MOVEMENT EFFICIENCY (rewards exploration, not just wandering) ===
      if (blob.age > 0) {
        const explorationScore = (blob.distanceTraveled / blob.age) * 100;
        blob.genome.fitness += Math.min(explorationScore, 50); // Cap at 50
      }

      // === COMPLEXITY BONUS (rewards evolved brains, even from start) ===
      const baseNodeCount = INPUT_SIZE + OUTPUT_SIZE;
      const baseConnectionCount = INPUT_SIZE * OUTPUT_SIZE;

      const extraNodes = blob.genome.nodes.size - baseNodeCount;
      const extraConnections = blob.genome.connections.size - baseConnectionCount;

      if (extraNodes > 0) {
        blob.genome.fitness += extraNodes * 2; // +2 per extra node
      }

      if (extraConnections > 0) {
        blob.genome.fitness += extraConnections * 0.5; // +0.5 per extra connection
      }

      // === SPECIALIZATION BONUS (rewards focused behavior) ===
      const specializationScore =
        (blob.kills > 0 ? 50 : 0) +
        (blob.foodEaten > 10 ? 100 : 0) +
        (blob.mass > 100 ? 200 : 0);
      blob.genome.fitness += specializationScore;

      // === PENALTIES (discourage passive/slow behavior) ===
      const movementRatio = blob.distanceTraveled / Math.max(blob.age, 1);
      if (movementRatio < 0.1) { // Too idle
        blob.genome.fitness *= 0.8; // 20% penalty
      }

      if (blob.idleTicks > 50) { // Been idle too long
        blob.genome.fitness *= 0.9;
      }

      // Cap fitness growth to prevent runaway leaders
      blob.genome.fitness = Math.min(blob.genome.fitness, 5000);
    }

    // Evolution cycle
    // Evolution cycle - only when we have enough blobs and enough time has passed
    if (tick % EVOLUTION_INTERVAL === 0 && blobsRef.current.length > INITIAL_BLOBS * 0.5) {
      // Don't evolve if the best blob is too young (let it develop)
      const bestBlob = [...blobsRef.current].sort((a, b) => b.genome.fitness - a.genome.fitness)[0];
      if (bestBlob && bestBlob.age > 300) { // Minimum age requirement
        runEvolution();
      }
    }

    // Repopulate - when blob dies, spawn child of a fit survivor
    while (blobsRef.current.length < INITIAL_BLOBS && blobsRef.current.length > 0) {
      // Tournament selection
      let best: Blob | null = null;
      for (let i = 0; i < 5; i++) {
        const candidate = blobsRef.current[Math.floor(Math.random() * blobsRef.current.length)];
        if (!best || candidate.genome.fitness > best.genome.fitness) {
          best = candidate;
        }
      }

      const childGenome = best!.genome.clone();
      neatRef.current!.mutate(childGenome);
      childGenome.fitness = 0;

      const child = createBlob(childGenome, best!.generation + 1, best!.id);
      blobsRef.current.push(child);
    }

    // Update stats
    const avgMass = blobsRef.current.reduce((s, b) => s + b.mass, 0) / Math.max(blobsRef.current.length, 1);
    const bestFitness = Math.max(0, ...blobsRef.current.map(b => b.genome.fitness));
    const maxGen = Math.max(1, ...blobsRef.current.map(b => b.generation));
    const neatStats = neatRef.current!.getStats();

    setStats(prev => ({
      generation: maxGen,
      totalKills: prev.totalKills + killsThisTick,
      totalDeaths: totalDeathsRef.current,
      avgMass,
      bestFitness,
      speciesCount: neatStats.speciesCount,
      avgNodes: neatStats.avgNodes,
      avgConnections: neatStats.avgConnections,
      tickCount: tick
    }));
  }, [getVision, spawnFood, createBlob, distance]);

  const runEvolution = useCallback(() => {
    if (!neatRef.current || blobsRef.current.length === 0) return;

    console.log('🧬 Running NEAT evolution...');

    // 1. Sort blobs by fitness
    const sortedBlobs = [...blobsRef.current].sort((a, b) =>
      b.genome.fitness - a.genome.fitness
    );

    console.log(`🏆 Best fitness this cycle: ${sortedBlobs[0]?.genome.fitness.toFixed(1)}`);

    // 2. Get genomes from current blobs for NEAT
    const currentGenomes = blobsRef.current.map(b => b.genome);

    // 3. Give NEAT ALL genomes, not just filtered ones
    neatRef.current.population = currentGenomes;

    // 4. Let NEAT do its evolution (this includes speciation, crossover, mutation)
    neatRef.current.evolve();

    // 5. Get the NEW population from NEAT
    const evolvedGenomes = neatRef.current.population;

    // 6. Create new blobs from evolved genomes
    const newBlobs: Blob[] = [];

    // Use tournament selection to assign parents for lineage tracking
    for (let i = 0; i < Math.min(evolvedGenomes.length, INITIAL_BLOBS); i++) {
      const genome = evolvedGenomes[i];

      // Find a parent blob for this genome (using tournament selection)
      let parent: Blob | null = null;
      for (let j = 0; j < 3; j++) {
        const candidate = sortedBlobs[Math.floor(Math.random() * sortedBlobs.length)];
        if (!parent || candidate.genome.fitness > parent.genome.fitness) {
          parent = candidate;
        }
      }

      const newBlob = createBlob(
        genome,
        (parent ? parent.generation + 1 : 1),
        parent?.id
      );

      // If this is an elite genome (first few), give it some starting advantage
      if (i < Math.min(3, sortedBlobs.length)) {
        const eliteParent = sortedBlobs[i];
        newBlob.mass = Math.max(30, eliteParent.mass * 0.5); // Start with some mass
        newBlob.color = eliteParent.color; // Keep same color for visual tracking
      }

      newBlobs.push(newBlob);
    }

    // Replace the population
    blobsRef.current = newBlobs;

    // Update selected blob if it was removed
    if (selectedBlob && !newBlobs.find(b => b.id === selectedBlob.id)) {
      setSelectedBlob(null);
    }

    const stats = neatRef.current.getStats();
    console.log(`🧬 Gen ${stats.generation}: ${stats.speciesCount} species`);
    console.log(`   Avg nodes: ${stats.avgNodes.toFixed(1)}, connections: ${stats.avgConnections.toFixed(1)}`);
    console.log(`   Complexity increased? Previous best: ${sortedBlobs[0]?.genome.nodes.size}N/${sortedBlobs[0]?.genome.connections.size}C`);
  }, [createBlob, selectedBlob]);

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

    // Food
    for (const f of foodRef.current) {
      const alpha = Math.min(1, f.age / 30);
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, Math.sqrt(f.mass) * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Obstacles (spiky)
    for (const obs of obstaclesRef.current) {
      const spikes = 12;
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2 / cam.zoom;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (Math.PI * 2 * i) / (spikes * 2);
        const r = i % 2 === 0 ? obs.radius : obs.radius * 0.65;
        const x = obs.x + Math.cos(angle) * r;
        const y = obs.y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#7f1d1d';
      ctx.font = `bold ${16 / cam.zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☠', obs.x, obs.y);
    }

    // Blobs
    for (const blob of blobsRef.current) {
      const radius = Math.sqrt(blob.mass) * 2.5;

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

  // Neural net visualization
  const renderNeuralNet = useCallback((genome: Genome) => {
    const canvas = neuralNetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get container size
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    // Update canvas size to match container
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Reset transform and clear canvas
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply DPR scaling once
    ctx.scale(dpr, dpr);

    const width = containerWidth;
    const height = containerHeight;

    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(10, 14, 26, 0.95)');
    gradient.addColorStop(1, 'rgba(26, 26, 46, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Organize nodes by type
    const inputNodes: number[] = [];
    const hiddenNodes: number[] = [];
    const outputNodes: number[] = [];

    for (const [id, node] of genome.nodes) {
      if (node.type === NodeType.INPUT) inputNodes.push(id);
      else if (node.type === NodeType.HIDDEN) hiddenNodes.push(id);
      else if (node.type === NodeType.OUTPUT) outputNodes.push(id);
    }

    // Sort nodes
    inputNodes.sort((a, b) => a - b);
    hiddenNodes.sort((a, b) => a - b);
    outputNodes.sort((a, b) => a - b);

    // Adaptive layout based on container size
    const padding = Math.max(40, Math.min(width * 0.05, 80));
    const verticalSpacing = Math.max(40, Math.min(height * 0.05, 60));
    const nodeRadius = Math.max(6, Math.min(width * 0.008, 12));

    // Layout hidden nodes in columns based on available space
    const maxHiddenColumns = Math.max(1, Math.floor((width - 2 * padding) / 150));
    const hiddenColumns: number[][] = Array(maxHiddenColumns).fill(null).map(() => []);

    hiddenNodes.forEach((id, index) => {
      const col = index % maxHiddenColumns;
      hiddenColumns[col].push(id);
    });

    // Calculate positions
    const nodePositions = new Map<number, { x: number; y: number; radius: number }>();

    // Input nodes (left)
    const inputX = padding;
    const inputHeight = Math.max(100, (inputNodes.length - 1) * verticalSpacing);
    const inputYStart = (height - inputHeight) / 2;

    inputNodes.forEach((id, i) => {
      nodePositions.set(id, {
        x: inputX,
        y: inputYStart + i * verticalSpacing,
        radius: nodeRadius
      });
    });

    // Hidden nodes (middle columns)
    const availableWidth = width - 2 * padding;
    const columnSpacing = availableWidth / (maxHiddenColumns + 1);

    hiddenColumns.forEach((column, colIndex) => {
      const colX = padding + (colIndex + 1) * columnSpacing;
      const colHeight = Math.max(50, (column.length - 1) * verticalSpacing);
      const colYStart = (height - colHeight) / 2;

      column.forEach((id, rowIndex) => {
        // Add slight vertical jitter for better visual separation
        const yJitter = column.length > 1 ? (Math.random() - 0.5) * 15 : 0;
        nodePositions.set(id, {
          x: colX + (Math.random() * 20 - 10), // Small random horizontal offset
          y: colYStart + rowIndex * verticalSpacing + yJitter,
          radius: nodeRadius * 1.2 // Slightly larger hidden nodes
        });
      });
    });

    // Output nodes (right)
    const outputX = width - padding;
    const outputHeight = Math.max(100, (outputNodes.length - 1) * verticalSpacing);
    const outputYStart = (height - outputHeight) / 2;

    outputNodes.forEach((id, i) => {
      nodePositions.set(id, {
        x: outputX,
        y: outputYStart + i * verticalSpacing,
        radius: nodeRadius
      });
    });

    // Draw connections first (background)
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.lineCap = 'round';

    for (const conn of genome.connections.values()) {
      if (!conn.enabled) continue;

      const from = nodePositions.get(conn.from);
      const to = nodePositions.get(conn.to);
      if (!from || !to) continue;

      const weight = conn.weight;
      const strength = Math.min(Math.abs(weight), 1);
      const lineWidth = 1 + strength * 3;

      // Color based on weight
      const hue = weight > 0 ? 140 : 0; // Green for positive, red for negative
      const saturation = 70;
      const lightness = 40 + strength * 40;
      const alpha = 0.3 + strength * 0.5;

      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = lineWidth;

      // Draw curved connection
      const startX = from.x;
      const startY = from.y;
      const endX = to.x;
      const endY = to.y;

      // Control points for curve
      const midX = (startX + endX) / 2;
      const curveHeight = Math.abs(endY - startY) * 0.3;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + (midX - startX) * 0.5, startY + curveHeight,
        endX - (endX - midX) * 0.5, endY - curveHeight,
        endX, endY
      );
      ctx.stroke();

      // Arrowhead for direction
      if (strength > 0.2) {
        const angle = Math.atan2(endY - to.y, endX - to.x);
        const arrowSize = 4 + strength * 5;
        const arrowX = endX - Math.cos(angle) * (to.radius + 2);
        const arrowY = endY - Math.sin(angle) * (to.radius + 2);

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

    ctx.restore();

    // Draw nodes
    const inputLabels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'M', 'Vx', 'Vy', 'Wall'];
    const outputLabels = ['Acc', 'Rot', 'Split'];

    // Node drawing function
    const drawNode = (id: number, label: string, type: 'input' | 'hidden' | 'output') => {
      const pos = nodePositions.get(id);
      if (!pos) return;

      const { x, y, radius } = pos;

      // Colors by type
      const colors = {
        input: { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
        hidden: { main: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },
        output: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' }
      };

      const color = colors[type];

      // Glow effect
      ctx.save();
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
      gradient.addColorStop(0, color.glow);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Main node
      ctx.fillStyle = color.main;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(9, nodeRadius * 1.2)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    };

    // Draw all nodes
    inputNodes.forEach((id, i) =>
      drawNode(id, inputLabels[i] || `I${i}`, 'input')
    );

    hiddenNodes.forEach((id) => {
      const node = genome.nodes.get(id);
      let label = 'H';
      if (node) {
        const actMap: Record<string, string> = {
          'tanh': 'T', 'sigmoid': 'S', 'relu': 'R', 'leaky_relu': 'L'
        };
        label = actMap[node.activation] || 'H';
      }
      drawNode(id, label, 'hidden');
    });

    outputNodes.forEach((id, i) =>
      drawNode(id, outputLabels[i] || `O${i}`, 'output')
    );

    // Draw legends and info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';

    // Stats at bottom
    const statsText = `Nodes: ${genome.nodes.size} • Connections: ${genome.connections.size} • Fitness: ${genome.fitness.toFixed(0)}`;
    ctx.fillText(statsText, 10, height - 10);

    // Connection legend
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(10, height - 30, 12, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(10, height - 20, 12, 4);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px sans-serif';
    ctx.fillText('Positive', 28, height - 26);
    ctx.fillText('Negative', 28, height - 16);
  }, []);

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

  // Neural net canvas
  useEffect(() => {
    if (!selectedBlob) return;

    const updateCanvas = () => {
      const canvas = neuralNetCanvasRef.current;
      if (!canvas) return;

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

      const currentBlob = blobsRef.current.find(b => b.id === selectedBlob.id);
      if (currentBlob) {
        renderNeuralNet(currentBlob.genome);
      }
    };

    // Initial update
    updateCanvas();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateCanvas);
    const container = neuralNetCanvasRef.current?.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [selectedBlob, renderNeuralNet]);

  // Initialize on mount
  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  // ===================== RENDER JSX =====================

  const topBlobs = [...blobsRef.current]
    .sort((a, b) => b.genome.fitness - a.genome.fitness)
    .slice(0, 5);

  return (
    <Container>
      <MaxWidthWrapper>
        <Header>
          <Title>🧬 NEAT</Title>
          <Subtitle>
            Gen {stats.generation} • {stats.speciesCount} species
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
                Gen {stats.generation}
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Blobs:</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{blobsRef.current.length}/{INITIAL_BLOBS}</span>
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
                  <span style={{ opacity: 0.7 }}>Kills:</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.totalKills}</span>
                </div>
              </div>
            </HUD>

            <LeaderboardHUD>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} />
                Top Performers
                <Brain size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </div>
              {topBlobs.map((blob, i) => (
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
                      G{blob.generation} • {blob.genome.nodes.size}N/{blob.genome.connections.size}C • {blob.genome.fitness.toFixed(0)}pts
                    </div>
                  </div>
                </LeaderboardEntry>
              ))}
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
            <span>Evolution Statistics</span>
          </DrawerHandle>

          {drawerExpanded && (
            <DrawerContent>
              <Grid $columns={4}>
                <StatCard $color="#3b82f6">
                  <div className="label">Species</div>
                  <div className="value">{stats.speciesCount}</div>
                  <div className="change">Diversity groups</div>
                </StatCard>

                <StatCard $color="#22c55e">
                  <div className="label">Total Kills</div>
                  <div className="value">{stats.totalKills}</div>
                  <div className="change">Successful hunts</div>
                </StatCard>

                <StatCard $color="#ef4444">
                  <div className="label">Total Deaths</div>
                  <div className="value">{stats.totalDeaths}</div>
                  <div className="change">Obstacles + eaten</div>
                </StatCard>

                {/* <StatCard $color="#fbbf24">
                  <div className="label">Best Fitness</div>
                  <div className="value">{stats.bestFitness.toFixed(0)}</div>
                  <div className="change">Top performer</div>
                </StatCard> */}

                {/* <StatCard $color="#a855f7">
                  <div className="label">Avg Nodes</div>
                  <div className="value">{stats.avgNodes.toFixed(1)}</div>
                  <div className="change">Brain complexity</div>
                </StatCard>

                <StatCard $color="#6366f1">
                  <div className="label">Avg Connections</div>
                  <div className="value">{stats.avgConnections.toFixed(1)}</div>
                  <div className="change">Neural pathways</div>
                </StatCard>

                <StatCard $color="#ec4899">
                  <div className="label">Generation</div>
                  <div className="value">{stats.generation}</div>
                  <div className="change">Evolution cycles</div>
                </StatCard> */}

                <StatCard $color="#14b8a6">
                  <div className="label">Tick</div>
                  <div className="value">{stats.tickCount}</div>
                  <div className="change">Sim time</div>
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
              <Brain size={24} color="#6366f1" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Neural Network - Blob #{selectedBlob.id}
              </h2>
            </div>

            <BlobInfo>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Generation</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f1' }}>{selectedBlob.generation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Complexity</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {selectedBlob.genome.nodes.size}N / {selectedBlob.genome.connections.size}C
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mass</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>{selectedBlob.mass.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kills</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>{selectedBlob.kills}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Food Eaten</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>{selectedBlob.foodEaten}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fitness</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24' }}>
                    {selectedBlob.genome.fitness.toFixed(0)}
                  </div>
                </div>
              </div>
            </BlobInfo>

            <CanvasWrapper>
              <NeuralNetCanvas ref={neuralNetCanvasRef} />
            </CanvasWrapper>

            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#94a3b8',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem'
            }}>
              <div>
                <strong style={{ color: '#22c55e' }}>Green connections:</strong> Positive weights
              </div>
              <div>
                <strong style={{ color: '#ef4444' }}>Red connections:</strong> Negative weights
              </div>
              <div>
                <strong style={{ color: '#8b5cf6' }}>Purple nodes:</strong> Hidden neurons
              </div>
              <div>
                <strong style={{ color: '#3b82f6' }}>Blue nodes:</strong> Input sensors
              </div>
              <div>
                <strong style={{ color: '#10b981' }}>Green nodes:</strong> Output actions
              </div>
            </div>
          </NeuralNetPanel>
        </NeuralNetModal>
      )}
    </Container>
  );
}