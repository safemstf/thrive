// src/components/cs/agario/agario.tsx
'use client'

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  PlayCircle, PauseCircle, RefreshCw, Zap, Brain, Trophy,
  Activity, TrendingUp, Users, Target, ChevronUp, ChevronDown,
  ZoomIn, ZoomOut, Maximize2, X
} from "lucide-react";
import styled from 'styled-components';
import { Genome, Neat, NodeType } from './neat';

// ===================== STYLED COMPONENTS (keeping all the same) =====================

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0e1a, #1a1a2e);
  color: #e6eef8;
  padding: 2rem 1rem;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
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

const ViewportButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  background: rgba(0, 0, 0, 0.9);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
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
  max-height: ${({ $expanded }) => $expanded ? '60vh' : '60px'};
  transition: max-height 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
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
    grid-template-columns: 1fr;
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const NeuralNetPanel = styled.div`
  background: linear-gradient(135deg, rgba(10, 14, 26, 0.95), rgba(26, 26, 46, 0.95));
  border-radius: 16px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
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

const NeuralNetCanvas = styled.canvas`
  width: 100%;
  height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
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
  parent?: number;
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
}

interface Obstacle {
  x: number;
  y: number;
  mass: number;
}

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
  const blobs = useRef<Blob[]>([]);
  const food = useRef<Food[]>([]);
  const obstacles = useRef<Obstacle[]>([]);
  const neat = useRef<Neat | null>(null);
  const nextBlobId = useRef(0);

  // Camera/viewport
  const cameraX = useRef(1000);
  const cameraY = useRef(750);
  const cameraZoom = useRef(1);
  const [zoom, setZoom] = useState(1);

  // Panning
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Timing refs
  const TARGET_FPS = 60;
  const TARGET_FRAME_MS = 1000 / TARGET_FPS;
  const lastTimeRef = useRef<number | null>(null);
  const lastRenderRef = useRef<number | null>(null);

  // Physics world
  const WORLD_WIDTH = 2000;
  const WORLD_HEIGHT = 1500;
  const INITIAL_BLOBS = 30;
  const MAX_FOOD = 300;
  const NUM_OBSTACLES = 25;

  // State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [totalKills, setTotalKills] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [avgMass, setAvgMass] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);

  const isRunningRef = useRef(false);
  const speedRef = useRef(1);
  const generationRef = useRef(1);
  const totalDeathsRef = useRef(0);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { setIsRunning(isRunningProp); }, [isRunningProp]);
  useEffect(() => { setSpeed(speedProp); }, [speedProp]);

  // Generate random color
  const randomColor = () => {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Initialize NEAT
  const initNEAT = useCallback(() => {
    neat.current = new Neat(
      12,  // inputs: 8 vision + mass + vx + vy + speed
      3,   // outputs: acceleration, rotation, unused
      INITIAL_BLOBS,
      {
        mutationRate: 0.8,
        elitism: 0.2,
        randomBehaviour: 0.05,
        mutationSize: 0.5,
        addNodeRate: 0.03,
        addConnectionRate: 0.05,
        compatibilityThreshold: 3.0,
        activationFunction: 'leaky_relu',
      }
    );
  }, []);

  // Create blob from genome
  const createBlob = useCallback((genome: Genome, generation: number, parent?: number): Blob => {
    const startX = Math.random() * WORLD_WIDTH;
    const startY = Math.random() * WORLD_HEIGHT;
    return {
      id: nextBlobId.current++,
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      mass: 30,
      color: randomColor(),
      genome,
      generation,
      kills: 0,
      age: 0,
      parent,
      foodEaten: 0,
      distanceTraveled: 0,
      lastX: startX,
      lastY: startY,
      idleTicks: 0,
    };
  }, []);

  // Initialize food
  const spawnFood = useCallback(() => {
    while (food.current.length < MAX_FOOD) {
      food.current.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        mass: 2,
      });
    }
  }, []);

  // Initialize obstacles
  const spawnObstacles = useCallback(() => {
    obstacles.current = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      obstacles.current.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        mass: 40,
      });
    }
  }, []);

  // Initialize simulation
  const initSimulation = useCallback(() => {
    if (!neat.current) initNEAT();

    blobs.current = [];
    food.current = [];
    nextBlobId.current = 0;
    generationRef.current = 1;
    totalDeathsRef.current = 0;

    // Create initial population
    neat.current!.population.forEach(genome => {
      blobs.current.push(createBlob(genome, 1));
    });

    spawnFood();
    spawnObstacles();

    console.log(`Initialized ${blobs.current.length} blobs, ${food.current.length} food, ${obstacles.current.length} obstacles`);

    setGeneration(1);
    setTotalKills(0);
    setTotalDeaths(0);
    setAvgMass(30);
    setBestFitness(0);
    setSelectedBlob(null);
  }, [initNEAT, createBlob, spawnFood, spawnObstacles]);

  // Get vision for a blob (8 directional rays)
  const getVision = useCallback((blob: Blob): number[] => {
    const vision = new Array(12).fill(0);
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const visionRange = 300;

    angles.forEach((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);

      let closestDist = visionRange;
      let closestType = 0;

      // Check food
      for (const f of food.current) {
        const fdx = f.x - blob.x;
        const fdy = f.y - blob.y;
        const dot = fdx * dx + fdy * dy;
        if (dot > 0) {
          const dist = Math.sqrt(fdx * fdx + fdy * fdy);
          const angle = Math.acos(Math.max(-1, Math.min(1, dot / (dist + 0.001))));
          if (angle < Math.PI / 6 && dist < closestDist) {
            closestDist = dist;
            closestType = 0.4;
          }
        }
      }

      // Check obstacles
      for (const obs of obstacles.current) {
        const odx = obs.x - blob.x;
        const ody = obs.y - blob.y;
        const dot = odx * dx + ody * dy;
        if (dot > 0) {
          const dist = Math.sqrt(odx * odx + ody * ody);
          const angle = Math.acos(Math.max(-1, Math.min(1, dot / (dist + 0.001))));
          if (angle < Math.PI / 6 && dist < closestDist) {
            closestDist = dist;
            closestType = -2; // Very dangerous
          }
        }
      }

      // Check other blobs
      for (const other of blobs.current) {
        if (other.id === blob.id) continue;
        const bdx = other.x - blob.x;
        const bdy = other.y - blob.y;
        const dot = bdx * dx + bdy * dy;
        if (dot > 0) {
          const dist = Math.sqrt(bdx * bdx + bdy * bdy);
          const angle = Math.acos(Math.max(-1, Math.min(1, dot / (dist + 0.001))));
          if (angle < Math.PI / 6 && dist < closestDist) {
            closestDist = dist;
            // Can eat if only 15% larger (more aggressive)
            closestType = other.mass < blob.mass * 0.85 ? 1.2 : -1;
          }
        }
      }

      vision[i] = closestType * (1 - closestDist / visionRange);
    });

    // Add self-awareness inputs
    vision[8] = Math.min(blob.mass / 150, 1);
    vision[9] = Math.tanh(blob.vx); // Normalized velocity X
    vision[10] = Math.tanh(blob.vy); // Normalized velocity Y
    const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
    vision[11] = Math.min(speed / 5, 1); // Normalized speed

    return vision;
  }, []);

  // Select parent weighted by fitness
  const selectParent = useCallback(() => {
    // Tournament selection
    const tournamentSize = 5;
    let best: Blob | null = null;

    for (let i = 0; i < tournamentSize; i++) {
      const candidate = blobs.current[Math.floor(Math.random() * blobs.current.length)];
      if (!best || candidate.genome.fitness > best.genome.fitness) {
        best = candidate;
      }
    }

    return best!;
  }, []);

  // Update simulation
  const update = useCallback(() => {
    if (!isRunningRef.current || !neat.current) return;

    const currentSpeed = speedRef.current;
    const blobsToRemove: number[] = [];

    // Update blobs
    for (let i = 0; i < blobs.current.length; i++) {
      const blob = blobs.current[i];
      blob.age++;

      // Calculate distance traveled
      const dx = blob.x - blob.lastX;
      const dy = blob.y - blob.lastY;
      const distMoved = Math.sqrt(dx * dx + dy * dy);
      blob.distanceTraveled += distMoved;
      blob.lastX = blob.x;
      blob.lastY = blob.y;

      // Track idle behavior (camping)
      if (distMoved < 0.5) {
        blob.idleTicks++;
        // Severe penalty for camping
        if (blob.idleTicks > 50) {
          blob.genome.fitness -= 0.5 * (blob.idleTicks - 50) / 10;
        }
      } else {
        blob.idleTicks = 0;
        // Reward exploration
        blob.genome.fitness += distMoved * 0.02;
      }

      // Starvation
      if (blob.age % 400 === 0) {
        blob.mass -= 4;
        if (blob.mass < 15) {
          blobsToRemove.push(i);
          blob.genome.fitness -= 30;
          continue;
        }
      }

      // Get neural network output
      const vision = getVision(blob);
      const output = blob.genome.activate(vision);

      // Apply outputs with more responsive controls
      const acceleration = Math.max(-1, Math.min(1, output[0])) * 0.5 * currentSpeed;
      const rotation = Math.max(-1, Math.min(1, output[1])) * 0.25;

      const currentAngle = Math.atan2(blob.vy, blob.vx) || 0;
      const newAngle = currentAngle + rotation;

      blob.vx += Math.cos(newAngle) * acceleration;
      blob.vy += Math.sin(newAngle) * acceleration;

      // Less friction for more dynamic movement
      const friction = 0.96;
      blob.vx *= friction;
      blob.vy *= friction;

      const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy);
      const maxSpeed = 6 / Math.sqrt(blob.mass / 30);
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

      // Slow mass decay
      blob.mass = Math.max(15, blob.mass - 0.002);
    }

    // Obstacle collisions - DROP BIOMASS AS FOOD
    for (let i = blobs.current.length - 1; i >= 0; i--) {
      const blob = blobs.current[i];

      for (const obs of obstacles.current) {
        const dx = obs.x - blob.x;
        const dy = obs.y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const blobRadius = Math.sqrt(blob.mass) * 3;
        const obsRadius = Math.sqrt(obs.mass) * 3;

        if (dist < blobRadius + obsRadius) {
          // DROP BIOMASS - convert mass to food pellets
          const numPellets = Math.floor(blob.mass / 2); // 2 mass per pellet
          const spreadRadius = 30; // Spread the food around death location

          for (let p = 0; p < numPellets; p++) {
            const angle = (Math.PI * 2 * p) / numPellets;
            const spread = Math.random() * spreadRadius;
            food.current.push({
              x: blob.x + Math.cos(angle) * spread,
              y: blob.y + Math.sin(angle) * spread,
              mass: 2,
            });
          }

          blob.genome.fitness -= 100; // Huge penalty
          blobsToRemove.push(i);
          totalDeathsRef.current++;

          console.log(`💀 Blob #${blob.id} hit obstacle! Dropped ${numPellets} food pellets (${blob.mass.toFixed(0)} mass)`);
          break;
        }
      }
    }

    // Food eating
    for (let i = food.current.length - 1; i >= 0; i--) {
      const f = food.current[i];
      for (const blob of blobs.current) {
        const dx = f.x - blob.x;
        const dy = f.y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const blobRadius = Math.sqrt(blob.mass) * 3;

        if (dist < blobRadius) {
          blob.mass += f.mass;
          blob.foodEaten++;
          blob.genome.fitness += 3; // Good reward
          food.current.splice(i, 1);
          break;
        }
      }
    }

    // Blob eating blob - ONLY 15% size advantage needed
    for (let i = blobs.current.length - 1; i >= 0; i--) {
      const blob = blobs.current[i];
      for (let j = blobs.current.length - 1; j >= 0; j--) {
        if (i === j) continue;
        const other = blobs.current[j];

        const dx = other.x - blob.x;
        const dy = other.y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const blobRadius = Math.sqrt(blob.mass) * 3;

        // Easier to eat (15% advantage instead of 25%)
        if (blob.mass > other.mass * 1.15 && dist < blobRadius) {
          blob.mass += other.mass * 0.8;
          blob.kills++;
          blob.genome.fitness += 40; // Massive reward for active hunting

          // Bonus for hunting moving targets
          const otherSpeed = Math.sqrt(other.vx * other.vx + other.vy * other.vy);
          if (otherSpeed > 1) {
            blob.genome.fitness += 20; // Extra for catching moving prey
          }

          if (!blobsToRemove.includes(j)) {
            blobsToRemove.push(j);
          }

          if (j < i) i--;
          break;
        }
      }
    }

    // Remove dead
    blobsToRemove.sort((a, b) => b - a);
    for (const index of blobsToRemove) {
      blobs.current.splice(index, 1);
    }

    // Spawn offspring
    while (blobs.current.length < INITIAL_BLOBS) {
      const parent = selectParent();
      const childGenome = parent.genome.clone();
      neat.current!.mutate(childGenome);
      childGenome.fitness = 0;
      const child = createBlob(childGenome, parent.generation + 1, parent.id);
      blobs.current.push(child);
    }

    // Respawn food
    spawnFood();

    // Stats
    const kills = blobs.current.reduce((sum, b) => sum + b.kills, 0);
    const avgM = blobs.current.reduce((sum, b) => sum + b.mass, 0) / blobs.current.length;
    const maxGen = Math.max(...blobs.current.map(b => b.generation));
    const best = Math.max(...blobs.current.map(b => b.genome.fitness));

    setTotalKills(kills);
    setTotalDeaths(totalDeathsRef.current);
    setAvgMass(avgM);
    setGeneration(maxGen);
    setBestFitness(best);
  }, [getVision, createBlob, spawnFood, selectParent]);

  // Render neural network - FIXED VERSION
  const renderNeuralNet = useCallback((genome: Genome) => {
    const canvas = neuralNetCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 14, 26, 0.5)';
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

    // Position nodes
    const nodePositions = new Map<number, { x: number, y: number }>();

    const padding = 80;
    const inputX = padding;
    const outputX = width - padding;
    const hiddenX = width / 2;

    // Input nodes
    const inputSpacing = (height - 2 * padding) / (inputNodes.length + 1);
    inputNodes.forEach((id, i) => {
      nodePositions.set(id, { x: inputX, y: padding + inputSpacing * (i + 1) });
    });

    // Output nodes
    const outputSpacing = (height - 2 * padding) / (outputNodes.length + 1);
    outputNodes.forEach((id, i) => {
      nodePositions.set(id, { x: outputX, y: padding + outputSpacing * (i + 1) });
    });

    // Hidden nodes (distribute in middle)
    const hiddenSpacing = hiddenNodes.length > 0 ? (height - 2 * padding) / (hiddenNodes.length + 1) : 0;
    hiddenNodes.forEach((id, i) => {
      const xOffset = (Math.random() - 0.5) * 100; // Add some randomness
      nodePositions.set(id, {
        x: hiddenX + xOffset,
        y: padding + hiddenSpacing * (i + 1)
      });
    });

    // Draw connections
    for (const conn of genome.connections.values()) {
      if (!conn.enabled) continue;

      const fromPos = nodePositions.get(conn.from);
      const toPos = nodePositions.get(conn.to);

      if (!fromPos || !toPos) continue;

      const weight = conn.weight;
      const alpha = Math.min(Math.abs(weight) / 2, 0.8);
      const color = weight > 0 ? `rgba(34, 197, 94, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.min(Math.abs(weight) * 1.5, 4);
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
    }

    // Draw node function
    const drawNode = (id: number, label: string, color: string) => {
      const pos = nodePositions.get(id);
      if (!pos) return;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pos.x, pos.y);
    };

    // Draw input nodes
    const inputLabels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'M', 'Vx', 'Vy', 'Spd'];
    inputNodes.forEach((id, i) => {
      drawNode(id, inputLabels[i] || `I${i}`, 'rgba(59, 130, 246, 0.7)');
    });

    // Draw hidden nodes
    hiddenNodes.forEach((id, i) => {
      const node = genome.nodes.get(id)!;
      const funcLabel = {
        'leaky_relu': 'L',
        'relu': 'R',
        'tanh': 'T',
        'sigmoid': 'S'
      }[node.activationFunction];
      drawNode(id, `H${i}${funcLabel}`, 'rgba(139, 92, 246, 0.7)');
    });

    // Draw output nodes
    const outputLabels = ['Acc', 'Rot', '—'];
    outputNodes.forEach((id, i) => {
      drawNode(id, outputLabels[i] || `O${i}`, 'rgba(34, 197, 94, 0.7)');
    });

    // Draw stats
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Nodes: ${genome.nodes.size} | Connections: ${genome.connections.size}`, 10, height - 10);
  }, []);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Apply camera transform
    const zoom = cameraZoom.current;
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cameraX.current, -cameraY.current);

    // Draw grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1 / zoom;
    const gridSize = 100;
    for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
      ctx.stroke();
    }

    // Draw world border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 3 / zoom;
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Draw food
    ctx.fillStyle = '#22c55e';
    for (const f of food.current) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw obstacles (deadly viruses)
    for (const obs of obstacles.current) {
      const radius = Math.sqrt(obs.mass) * 3;
      const spikes = 12;

      // Spiky circle (more menacing red)
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2 / zoom;

      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        const angle = (Math.PI * 2 * i) / spikes;
        const r = i % 2 === 0 ? radius : radius * 0.7;
        const x = obs.x + Math.cos(angle) * r;
        const y = obs.y + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center skull symbol
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw blobs
    for (const blob of blobs.current) {
      const radius = Math.sqrt(blob.mass) * 3;

      // Blob body
      ctx.fillStyle = blob.color;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();

      // Direction indicator
      const angle = Math.atan2(blob.vy, blob.vx);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3 / zoom;
      ctx.beginPath();
      ctx.moveTo(blob.x, blob.y);
      ctx.lineTo(
        blob.x + Math.cos(angle) * radius * 0.8,
        blob.y + Math.sin(angle) * radius * 0.8
      );
      ctx.stroke();

      // ID number
      if (zoom > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `${14 / zoom}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`#${blob.id}`, blob.x, blob.y);
      }
    }

    ctx.restore();
  }, []);

  // Mouse handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    cameraX.current -= dx / cameraZoom.current;
    cameraY.current -= dy / cameraZoom.current;

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    cameraZoom.current = Math.max(0.3, Math.min(3, cameraZoom.current * delta));
    setZoom(cameraZoom.current);
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    cameraZoom.current = Math.min(3, cameraZoom.current * 1.2);
    setZoom(cameraZoom.current);
  }, []);

  const zoomOut = useCallback(() => {
    cameraZoom.current = Math.max(0.3, cameraZoom.current / 1.2);
    setZoom(cameraZoom.current);
  }, []);

  const resetCamera = useCallback(() => {
    cameraX.current = WORLD_WIDTH / 2;
    cameraY.current = WORLD_HEIGHT / 2;
    cameraZoom.current = 1;
    setZoom(1);
  }, []);

  // Animation loop
  useEffect(() => {
    let frameId: number;

    const loop = (time: number) => {
      if (isRunningRef.current) {
        update();
      }

      // Always render
      if (lastRenderRef.current === null || time - lastRenderRef.current >= TARGET_FRAME_MS) {
        lastRenderRef.current = time;
        render();
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      lastTimeRef.current = null;
      lastRenderRef.current = null;
    };
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

  // Neural net canvas sizing
  useEffect(() => {
    const canvas = neuralNetCanvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 700 * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = '700px';
    canvas.style.height = '400px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // Update neural net visualization
  useEffect(() => {
    if (selectedBlob) {
      renderNeuralNet(selectedBlob.genome);
    }
  }, [selectedBlob, renderNeuralNet]);

  // Initialize
  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  const handleReset = () => {
    setIsRunning(false);
    initSimulation();
    resetCamera();
  };

  // Get top blobs
  const topBlobs = [...blobs.current]
    .sort((a, b) => (b.genome.fitness) - (a.genome.fitness))
    .slice(0, 5);

  return (
    <Container>
      <MaxWidthWrapper>
        <Header>
          <Title>Agar.io TRUE NEAT Evolution 🧬</Title>
          <Subtitle>Brains start SIMPLE and grow COMPLEX • Watch topology evolve!</Subtitle>
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
                Gen {generation}
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Blobs:</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{blobs.current.length}/{INITIAL_BLOBS}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Avg Mass:</span>
                  <span style={{ fontWeight: 600, color: '#fbbf24' }}>{avgMass.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Kills:</span>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{totalKills}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Deaths:</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{totalDeaths}</span>
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
            </ViewportControls>

            <ZoomIndicator>
              {(zoom * 100).toFixed(0)}%
            </ZoomIndicator>
          </CanvasContainer>
        </VideoSection>

        <ControlsDrawer $expanded={drawerExpanded}>
          <DrawerHandle onClick={() => setDrawerExpanded(!drawerExpanded)}>
            {drawerExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            <span>Evolution Statistics</span>
          </DrawerHandle>

          <DrawerContent>
            <Grid $columns={4}>
              <StatCard $color="#3b82f6">
                <div className="label">Population</div>
                <div className="value">{blobs.current.length}</div>
                <div className="change">Constant: {INITIAL_BLOBS}</div>
              </StatCard>

              <StatCard $color="#22c55e">
                <div className="label">Total Kills</div>
                <div className="value">{totalKills}</div>
                <div className="change">Successful hunts</div>
              </StatCard>

              <StatCard $color="#ef4444">
                <div className="label">Total Deaths</div>
                <div className="value">{totalDeaths}</div>
                <div className="change">Obstacle collisions</div>
              </StatCard>

              <StatCard $color="#fbbf24">
                <div className="label">Best Fitness</div>
                <div className="value">{bestFitness.toFixed(0)}</div>
                <div className="change">Top performer</div>
              </StatCard>
            </Grid>
          </DrawerContent>
        </ControlsDrawer>
      </MaxWidthWrapper>

      {/* Neural Network Modal */}
      {selectedBlob && (
        <NeuralNetModal onClick={() => setSelectedBlob(null)}>
          <NeuralNetPanel onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedBlob(null)}>
              <X size={20} />
            </CloseButton>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Brain size={24} color="#6366f1" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Evolved Brain - Blob #{selectedBlob.id}
              </h2>
            </div>

            <BlobInfo>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Generation</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6366f1' }}>{selectedBlob.generation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Complexity</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {selectedBlob.genome.nodes.size}N / {selectedBlob.genome.connections.size}C
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Mass</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>{selectedBlob.mass.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Kills</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{selectedBlob.kills}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Food</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>{selectedBlob.foodEaten}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Fitness</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>{selectedBlob.genome.fitness.toFixed(0)}</div>
                </div>
              </div>
            </BlobInfo>

            <NeuralNetCanvas ref={neuralNetCanvasRef} />

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#22c55e' }}>Green:</strong> Positive weights (approach)
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#ef4444' }}>Red:</strong> Negative weights (avoid)
              </div>
              <div>
                <strong style={{ color: '#8b5cf6' }}>Purple nodes:</strong> Evolved hidden neurons (L=LeakyReLU, R=ReLU, T=Tanh, S=Sigmoid)
              </div>
            </div>
          </NeuralNetPanel>
        </NeuralNetModal>
      )}
    </Container>
  );
}