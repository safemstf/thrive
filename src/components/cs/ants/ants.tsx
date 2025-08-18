// src\components\cs\ants\ants.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, BarChart3, Zap, Users, Trophy, Crown, Star, Shield, Activity } from 'lucide-react';

// ============================================================================
// USER-INTEGRATED ANT COLONY SIMULATION
// Each user becomes a special ant with unique behaviors and stats
// ============================================================================

// Import mock user data types
interface UserProfile {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  specialization?: string;
  score?: number;
  verified?: boolean;
  kind?: 'creative' | 'professional' | 'educational';
  stats?: {
    totalViews?: number;
    averageRating?: number;
    totalPieces?: number;
  };
}

// Mock user profiles from your data
const USER_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alice_creates',
    specialization: 'Creative Director',
    score: 125000,
    verified: true,
    kind: 'creative',
    stats: { totalViews: 125000, averageRating: 4.9, totalPieces: 42 }
  },
  {
    id: '2',
    name: 'Robert Chen',
    username: 'bob_codes',
    specialization: 'Software Architect',
    score: 67000,
    verified: true,
    kind: 'professional',
    stats: { totalViews: 67000, averageRating: 4.8, totalPieces: 28 }
  },
  {
    id: '3',
    name: 'Charlie Davis',
    username: 'charlie_learns',
    specialization: 'Full-Stack Developer',
    score: 28000,
    verified: false,
    kind: 'educational',
    stats: { totalViews: 28000, averageRating: 4.6, totalPieces: 15 }
  },
  {
    id: '4',
    name: 'Sarah Chen',
    username: 'sarah_codes',
    specialization: 'Full-Stack Development',
    score: 12450,
    verified: true,
    kind: 'professional'
  },
  {
    id: '5',
    name: 'Alex Rodriguez',
    username: 'alex_designs',
    specialization: 'UI/UX Design',
    score: 11920,
    verified: true,
    kind: 'creative'
  },
  {
    id: '6',
    name: 'Maria Santos',
    username: 'maria_data',
    specialization: 'Data Science',
    score: 11680,
    verified: false,
    kind: 'professional'
  }
];

// Constants
const CANVAS_W = 900;
const CANVAS_H = 600;
const GRID_SIZE = 15;
const PHEROMONE_DECAY = 0.995;
const MAX_REGULAR_ANTS = 100;
const MAX_USER_ANTS = USER_PROFILES.length;
const SPATIAL_GRID_SIZE = 30;
const USER_ANT_SIZE = 6; // Larger than regular ants

// Grid dimensions
const GRID_COLS = Math.ceil(CANVAS_W / GRID_SIZE);
const GRID_ROWS = Math.ceil(CANVAS_H / GRID_SIZE);
const PHEROMONE_GRID_SIZE = GRID_COLS * GRID_ROWS;

// Types
type Strategy = 'random' | 'pheromone' | 'greedy' | 'smart' | 'leader';
type AntType = 'regular' | 'user' | 'vip';

interface Colony {
  id: number;
  name: string;
  color: string;
  baseX: number;
  baseY: number;
  foodCollected: number;
  strategy: Strategy;
  r: number;
  g: number;
  b: number;
  userAnts: number[];
}

interface FoodSource {
  x: number;
  y: number;
  amount: number;
  quality: number; // 1-5, affects ant behavior
}

interface UserAnt {
  userId: string;
  antIndex: number;
  profile: UserProfile;
  personalBest: number;
  currentStreak: number;
  achievements: string[];
}

// Props
interface Props {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

// Professional color scheme based on user types
const getUserColor = (kind?: string, verified?: boolean): string => {
  if (verified) {
    switch (kind) {
      case 'creative': return '#f59e0b'; // Gold for verified creative
      case 'professional': return '#3b82f6'; // Blue for verified professional
      case 'educational': return '#10b981'; // Green for verified educational
      default: return '#8b5cf6'; // Purple for verified unknown
    }
  }
  switch (kind) {
    case 'creative': return '#fbbf24';
    case 'professional': return '#60a5fa';
    case 'educational': return '#34d399';
    default: return '#a78bfa';
  }
};

export default function UserIntegratedAntsSimulation({ 
  isRunning = false, 
  speed = 1, 
  isDark = false 
}: Props) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Typed arrays for performance
  const antPositionsRef = useRef<Float32Array>(new Float32Array((MAX_REGULAR_ANTS + MAX_USER_ANTS) * 2));
  const antVelocitiesRef = useRef<Float32Array>(new Float32Array((MAX_REGULAR_ANTS + MAX_USER_ANTS) * 2));
  const antStatesRef = useRef<Uint8Array>(new Uint8Array((MAX_REGULAR_ANTS + MAX_USER_ANTS) * 5)); // hasFood, colonyId, targetFood, active, antType
  const antScoresRef = useRef<Float32Array>(new Float32Array(MAX_REGULAR_ANTS + MAX_USER_ANTS)); // Performance scores
  
  // User ant mapping
  const userAntsRef = useRef<Map<number, UserAnt>>(new Map());
  
  // Pheromone grids
  const pheromoneGridsRef = useRef<Float32Array[]>([]);
  
  // Entity refs
  const coloniesRef = useRef<Colony[]>([]);
  const foodRef = useRef<FoodSource[]>([]);
  const activeAntsRef = useRef<number>(0);
  
  // Animation
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  
  // State
  const [stats, setStats] = useState({
    fps: 0,
    regularAnts: 0,
    userAnts: 0,
    totalFood: 0,
    topPerformer: null as UserProfile | null,
    colonies: [] as { name: string; food: number; color: string; userCount: number }[]
  });
  const [showUserLabels, setShowUserLabels] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [quality, setQuality] = useState<'performance' | 'balanced' | 'quality'>('balanced');
  
  // Initialize simulation with user ants
  const initSimulation = useCallback(() => {
    // Reset arrays
    antPositionsRef.current.fill(0);
    antVelocitiesRef.current.fill(0);
    antStatesRef.current.fill(0);
    antScoresRef.current.fill(0);
    userAntsRef.current.clear();
    
    // Initialize colonies with better positioning
    const colonies: Colony[] = [
      { 
        id: 0, 
        name: 'Creative Hive', 
        color: '#f59e0b', 
        baseX: 150, 
        baseY: 150, 
        foodCollected: 0, 
        strategy: 'smart',
        r: 245, g: 158, b: 11,
        userAnts: []
      },
      { 
        id: 1, 
        name: 'Tech Colony', 
        color: '#3b82f6', 
        baseX: CANVAS_W - 150, 
        baseY: 150, 
        foodCollected: 0, 
        strategy: 'leader',
        r: 59, g: 130, b: 246,
        userAnts: []
      },
      { 
        id: 2, 
        name: 'Learning Nest', 
        color: '#10b981', 
        baseX: CANVAS_W / 2, 
        baseY: CANVAS_H - 100, 
        foodCollected: 0, 
        strategy: 'pheromone',
        r: 16, g: 185, b: 129,
        userAnts: []
      }
    ];
    
    coloniesRef.current = colonies;
    
    // Initialize pheromone grids
    pheromoneGridsRef.current = colonies.map(() => 
      new Float32Array(PHEROMONE_GRID_SIZE)
    );
    
    // Spawn ants
    let antIndex = 0;
    const positions = antPositionsRef.current;
    const velocities = antVelocitiesRef.current;
    const states = antStatesRef.current;
    const scores = antScoresRef.current;
    
    // First, spawn USER ANTS - one per user profile
    USER_PROFILES.forEach((profile, profileIndex) => {
      if (antIndex >= MAX_REGULAR_ANTS + MAX_USER_ANTS) return;
      
      // Assign user to colony based on their type
      let colonyId = 0;
      if (profile.kind === 'professional') colonyId = 1;
      else if (profile.kind === 'educational') colonyId = 2;
      
      const colony = colonies[colonyId];
      colony.userAnts.push(antIndex);
      
      // Position near colony base
      const angle = (profileIndex / USER_PROFILES.length) * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      positions[antIndex * 2] = colony.baseX + Math.cos(angle) * dist;
      positions[antIndex * 2 + 1] = colony.baseY + Math.sin(angle) * dist;
      
      // Initial velocity
      velocities[antIndex * 2] = (Math.random() - 0.5) * 3;
      velocities[antIndex * 2 + 1] = (Math.random() - 0.5) * 3;
      
      // State: [hasFood, colonyId, targetFood, active, antType]
      states[antIndex * 5] = 0; // hasFood
      states[antIndex * 5 + 1] = colonyId; // colonyId
      states[antIndex * 5 + 2] = 255; // no target
      states[antIndex * 5 + 3] = 1; // active
      states[antIndex * 5 + 4] = 2; // antType: 2 = user ant
      
      // Initialize score based on user stats
      scores[antIndex] = (profile.score || 0) / 1000;
      
      // Map user ant
      userAntsRef.current.set(antIndex, {
        userId: profile.id,
        antIndex,
        profile,
        personalBest: 0,
        currentStreak: 0,
        achievements: []
      });
      
      antIndex++;
    });
    
    // Then spawn regular ants
    const regularAntsPerColony = Math.floor((MAX_REGULAR_ANTS - antIndex) / colonies.length);
    
    for (let colonyId = 0; colonyId < colonies.length; colonyId++) {
      const colony = colonies[colonyId];
      for (let i = 0; i < regularAntsPerColony; i++) {
        if (antIndex >= MAX_REGULAR_ANTS) break;
        
        // Position near base
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 25;
        positions[antIndex * 2] = colony.baseX + Math.cos(angle) * dist;
        positions[antIndex * 2 + 1] = colony.baseY + Math.sin(angle) * dist;
        
        // Random initial velocity
        velocities[antIndex * 2] = (Math.random() - 0.5) * 2;
        velocities[antIndex * 2 + 1] = (Math.random() - 0.5) * 2;
        
        // State
        states[antIndex * 5] = 0; // hasFood
        states[antIndex * 5 + 1] = colonyId; // colonyId
        states[antIndex * 5 + 2] = 255; // no target
        states[antIndex * 5 + 3] = 1; // active
        states[antIndex * 5 + 4] = 0; // antType: 0 = regular ant
        
        antIndex++;
      }
    }
    
    activeAntsRef.current = antIndex;
    
    // Initialize high-quality food sources
    foodRef.current = [
      { x: CANVAS_W * 0.5, y: CANVAS_H * 0.25, amount: 120, quality: 5 },
      { x: CANVAS_W * 0.25, y: CANVAS_H * 0.5, amount: 100, quality: 4 },
      { x: CANVAS_W * 0.75, y: CANVAS_H * 0.5, amount: 100, quality: 4 },
      { x: CANVAS_W * 0.2, y: CANVAS_H * 0.8, amount: 80, quality: 3 },
      { x: CANVAS_W * 0.8, y: CANVAS_H * 0.8, amount: 80, quality: 3 },
      { x: CANVAS_W * 0.5, y: CANVAS_H * 0.6, amount: 60, quality: 2 }
    ];
    
    updateStats();
  }, []);
  
  // Update pheromone
  const addPheromone = useCallback((x: number, y: number, colonyId: number, strength: number) => {
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    
    if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
      const index = gridY * GRID_COLS + gridX;
      const grid = pheromoneGridsRef.current[colonyId];
      if (grid) {
        grid[index] = Math.min(1, grid[index] + strength);
      }
    }
  }, []);
  
  // Get pheromone gradient
  const getPheromonGradient = useCallback((x: number, y: number, colonyId: number): [number, number] => {
    let maxStrength = 0;
    let bestDx = 0;
    let bestDy = 0;
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const testX = x + dx * GRID_SIZE;
        const testY = y + dy * GRID_SIZE;
        const gridX = Math.floor(testX / GRID_SIZE);
        const gridY = Math.floor(testY / GRID_SIZE);
        
        if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
          const index = gridY * GRID_COLS + gridX;
          const strength = pheromoneGridsRef.current[colonyId]?.[index] || 0;
          
          if (strength > maxStrength) {
            maxStrength = strength;
            bestDx = dx;
            bestDy = dy;
          }
        }
      }
    }
    
    const mag = Math.sqrt(bestDx * bestDx + bestDy * bestDy) || 1;
    return [bestDx / mag, bestDy / mag];
  }, []);
  
  // Update ant behavior with user ant special behaviors
  const updateAnts = useCallback((dt: number) => {
    const positions = antPositionsRef.current;
    const velocities = antVelocitiesRef.current;
    const states = antStatesRef.current;
    const scores = antScoresRef.current;
    const colonies = coloniesRef.current;
    const foods = foodRef.current;
    
    for (let i = 0; i < activeAntsRef.current; i++) {
      if (states[i * 5 + 3] === 0) continue; // Skip inactive
      
      const x = positions[i * 2];
      const y = positions[i * 2 + 1];
      let vx = velocities[i * 2];
      let vy = velocities[i * 2 + 1];
      
      const hasFood = states[i * 5] === 1;
      const colonyId = states[i * 5 + 1];
      const antType = states[i * 5 + 4];
      const colony = colonies[colonyId];
      
      if (!colony) continue;
      
      // Special behavior for user ants
      const isUserAnt = antType === 2;
      const userAnt = isUserAnt ? userAntsRef.current.get(i) : null;
      
      // Base speed multiplier for user ants based on their stats
      const speedMultiplier = isUserAnt ? 1.2 + (scores[i] / 1000) : 1.0;
      
      if (hasFood) {
        // Return to base
        const dx = colony.baseX - x;
        const dy = colony.baseY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
          const returnSpeed = isUserAnt ? 0.6 : 0.5;
          vx += (dx / dist) * returnSpeed * speedMultiplier;
          vy += (dy / dist) * returnSpeed * speedMultiplier;
          
          // User ants drop stronger pheromones
          if (i % 3 === 0) {
            addPheromone(x, y, colonyId, isUserAnt ? 1.0 : 0.8);
          }
        }
        
        // Check if reached base
        if (dist < 20) {
          states[i * 5] = 0; // Drop food
          colony.foodCollected++;
          
          // User ants get bonus points
          if (userAnt) {
            scores[i] += 10;
            userAnt.personalBest = Math.max(userAnt.personalBest, scores[i]);
            userAnt.currentStreak++;
            
            // Achievement check
            if (userAnt.currentStreak === 10 && !userAnt.achievements.includes('streak10')) {
              userAnt.achievements.push('streak10');
            }
          }
        }
      } else {
        // Look for food - user ants are smarter
        if (isUserAnt && userAnt) {
          // User ants can sense high-quality food from farther away
          let bestFood = -1;
          let bestScore = 0;
          
          for (let f = 0; f < foods.length; f++) {
            if (foods[f].amount <= 0) continue;
            const dx = foods[f].x - x;
            const dy = foods[f].y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const score = foods[f].quality / (1 + dist * 0.01);
            
            if (score > bestScore) {
              bestScore = score;
              bestFood = f;
            }
          }
          
          if (bestFood >= 0) {
            const food = foods[bestFood];
            const dx = food.x - x;
            const dy = food.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            vx += (dx / dist) * 0.5 * speedMultiplier;
            vy += (dy / dist) * 0.5 * speedMultiplier;
          } else {
            // Follow pheromones
            const [gdx, gdy] = getPheromonGradient(x, y, colonyId);
            if (gdx !== 0 || gdy !== 0) {
              vx += gdx * 0.4 * speedMultiplier;
              vy += gdy * 0.4 * speedMultiplier;
            } else {
              // Explorer behavior
              vx += (Math.random() - 0.5) * 0.6;
              vy += (Math.random() - 0.5) * 0.6;
            }
          }
        } else {
          // Regular ant behavior
          switch (colony.strategy) {
            case 'pheromone': {
              const [gdx, gdy] = getPheromonGradient(x, y, colonyId);
              if (gdx !== 0 || gdy !== 0) {
                vx += gdx * 0.3;
                vy += gdy * 0.3;
              } else {
                vx += (Math.random() - 0.5) * 0.5;
                vy += (Math.random() - 0.5) * 0.5;
              }
              break;
            }
            case 'smart': {
              // Check for nearby food
              let foundFood = false;
              for (const food of foods) {
                if (food.amount <= 0) continue;
                const dx = food.x - x;
                const dy = food.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 60) {
                  vx += (dx / dist) * 0.5;
                  vy += (dy / dist) * 0.5;
                  foundFood = true;
                  break;
                }
              }
              
              if (!foundFood) {
                const [gdx, gdy] = getPheromonGradient(x, y, colonyId);
                if (gdx !== 0 || gdy !== 0) {
                  vx += gdx * 0.35;
                  vy += gdy * 0.35;
                } else {
                  vx += (Math.random() - 0.5) * 0.4;
                  vy += (Math.random() - 0.5) * 0.4;
                }
              }
              break;
            }
            default:
              vx += (Math.random() - 0.5) * 0.5;
              vy += (Math.random() - 0.5) * 0.5;
          }
        }
        
        // Check for food pickup
        for (let f = 0; f < foods.length; f++) {
          const food = foods[f];
          if (food.amount <= 0) continue;
          
          const dx = food.x - x;
          const dy = food.y - y;
          const pickupDist = isUserAnt ? 15 : 10; // User ants can pick up from slightly farther
          
          if (dx * dx + dy * dy < pickupDist * pickupDist) {
            states[i * 5] = 1; // Pick up food
            food.amount--;
            
            // Bonus for high-quality food
            if (userAnt) {
              scores[i] += food.quality * 2;
            }
            
            addPheromone(x, y, colonyId, 1.0);
            break;
          }
        }
      }
      
      // Apply velocity with user ant advantages
      const maxSpeed = isUserAnt ? 4.5 : (hasFood ? 2.5 : 3.5);
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }
      
      vx *= 0.95;
      vy *= 0.95;
      
      // Update position
      positions[i * 2] = Math.max(5, Math.min(CANVAS_W - 5, x + vx * dt));
      positions[i * 2 + 1] = Math.max(5, Math.min(CANVAS_H - 5, y + vy * dt));
      
      velocities[i * 2] = vx;
      velocities[i * 2 + 1] = vy;
    }
    
    // Decay pheromones
    for (const grid of pheromoneGridsRef.current) {
      for (let i = 0; i < grid.length; i++) {
        grid[i] *= PHEROMONE_DECAY;
        if (grid[i] < 0.01) grid[i] = 0;
      }
    }
  }, [addPheromone, getPheromonGradient]);
  
  // Professional rendering with user ant highlights
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    if (isDark) {
      gradient.addColorStop(0, '#0a0f1b');
      gradient.addColorStop(0.5, '#0f1729');
      gradient.addColorStop(1, '#0a0f1b');
    } else {
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(0.5, '#f1f5f9');
      gradient.addColorStop(1, '#f8fafc');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    const positions = antPositionsRef.current;
    const states = antStatesRef.current;
    const scores = antScoresRef.current;
    const colonies = coloniesRef.current;
    const foods = foodRef.current;
    
    // Render pheromones with quality settings
    if (quality !== 'performance') {
      ctx.save();
      ctx.globalAlpha = 0.25;
      
      for (let colonyId = 0; colonyId < colonies.length; colonyId++) {
        const grid = pheromoneGridsRef.current[colonyId];
        const colony = colonies[colonyId];
        
        for (let y = 0; y < GRID_ROWS; y++) {
          for (let x = 0; x < GRID_COLS; x++) {
            const strength = grid[y * GRID_COLS + x];
            if (strength > 0.01) {
              ctx.fillStyle = `rgba(${colony.r}, ${colony.g}, ${colony.b}, ${strength * 0.4})`;
              ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
          }
        }
      }
      
      ctx.restore();
    }
    
    // Render food sources with quality indicators
    for (const food of foods) {
      if (food.amount <= 0) continue;
      
      const size = 4 + Math.sqrt(food.amount) * 1.5;
      
      // Quality glow
      if (quality === 'quality') {
        const glowGradient = ctx.createRadialGradient(food.x, food.y, 0, food.x, food.y, size * 3);
        const qualityColor = food.quality === 5 ? '#fbbf24' : food.quality >= 3 ? '#8b5cf6' : '#60a5fa';
        glowGradient.addColorStop(0, qualityColor + '40');
        glowGradient.addColorStop(1, qualityColor + '00');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(food.x - size * 3, food.y - size * 3, size * 6, size * 6);
      }
      
      // Food body with quality color
      const foodColor = food.quality === 5 ? '#fbbf24' : food.quality >= 3 ? '#8b5cf6' : '#60a5fa';
      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.arc(food.x, food.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Quality stars
      if (food.quality === 5) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', food.x, food.y + 3);
      }
      
      // Food amount
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(food.amount.toString(), food.x, food.y + size + 10);
    }
    
    // Render colony bases with professional design
    for (const colony of colonies) {
      // Base glow
      if (quality !== 'performance') {
        const baseGradient = ctx.createRadialGradient(
          colony.baseX, colony.baseY, 0,
          colony.baseX, colony.baseY, 35
        );
        baseGradient.addColorStop(0, `rgba(${colony.r}, ${colony.g}, ${colony.b}, 0.4)`);
        baseGradient.addColorStop(1, `rgba(${colony.r}, ${colony.g}, ${colony.b}, 0)`);
        ctx.fillStyle = baseGradient;
        ctx.fillRect(colony.baseX - 35, colony.baseY - 35, 70, 70);
      }
      
      // Base circle
      ctx.strokeStyle = colony.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(colony.baseX, colony.baseY, 18, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = colony.color + '20';
      ctx.fill();
      
      // Colony icon
      ctx.fillStyle = colony.color;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = colony.id === 0 ? '🎨' : colony.id === 1 ? '💻' : '📚';
      ctx.fillText(icon, colony.baseX, colony.baseY);
      
      // Colony info
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(colony.name, colony.baseX, colony.baseY + 32);
      ctx.font = '9px sans-serif';
      ctx.fillText(`Food: ${colony.foodCollected} | Users: ${colony.userAnts.length}`, colony.baseX, colony.baseY + 44);
    }
    
    // Render ants with user ant special effects
    for (let i = 0; i < activeAntsRef.current; i++) {
      if (states[i * 5 + 3] === 0) continue; // Skip inactive
      
      const x = positions[i * 2];
      const y = positions[i * 2 + 1];
      const hasFood = states[i * 5] === 1;
      const colonyId = states[i * 5 + 1];
      const antType = states[i * 5 + 4];
      const colony = colonies[colonyId];
      
      if (!colony) continue;
      
      const isUserAnt = antType === 2;
      const userAnt = isUserAnt ? userAntsRef.current.get(i) : null;
      
      if (isUserAnt && userAnt) {
        // USER ANT - Special rendering
        const profile = userAnt.profile;
        const antColor = getUserColor(profile.kind, profile.verified);
        
        // Verified glow
        if (profile.verified && quality !== 'performance') {
          const glowSize = hasFood ? 15 : 12;
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          glowGradient.addColorStop(0, antColor + '60');
          glowGradient.addColorStop(1, antColor + '00');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(x - glowSize, y - glowSize, glowSize * 2, glowSize * 2);
        }
        
        // User ant body (larger)
        ctx.fillStyle = hasFood ? '#fbbf24' : antColor;
        ctx.beginPath();
        ctx.arc(x, y, USER_ANT_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // White border for visibility
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Verification badge
        if (profile.verified) {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✓', x + 4, y - 2);
        }
        
        // Score indicator
        if (scores[i] > 50) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⭐', x, y - 10);
        }
        
        // Username label
        if (showUserLabels) {
          ctx.save();
          ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          
          // Background for readability
          const textWidth = ctx.measureText(profile.username).width;
          ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x - textWidth / 2 - 2, y + 10, textWidth + 4, 10);
          
          ctx.fillStyle = antColor;
          ctx.fillText(profile.username, x, y + 18);
          ctx.restore();
        }
      } else {
        // REGULAR ANT - Simple rendering
        ctx.fillStyle = hasFood ? '#fbbf24' : colony.color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        if (quality === 'quality') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(x - 1, y - 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Update FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current > 1000) {
      fpsRef.current = Math.round(frameCountRef.current * 1000 / (now - lastTimeRef.current));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      updateStats();
    }
  }, [isDark, quality, showUserLabels]);
  
  // Update statistics
  const updateStats = useCallback(() => {
    const userAntsList = Array.from(userAntsRef.current.values());
    const topPerformer = userAntsList.length > 0 
      ? userAntsList.reduce((best, current) => 
          antScoresRef.current[current.antIndex] > antScoresRef.current[best.antIndex] ? current : best
        ).profile
      : null;
    
    const totalFood = foodRef.current.reduce((sum, f) => sum + f.amount, 0);
    
    const colonyStats = coloniesRef.current.map(c => ({
      name: c.name,
      food: c.foodCollected,
      color: c.color,
      userCount: c.userAnts.length
    }));
    
    setStats({
      fps: fpsRef.current,
      regularAnts: activeAntsRef.current - userAntsList.length,
      userAnts: userAntsList.length,
      totalFood,
      topPerformer,
      colonies: colonyStats
    });
  }, []);
  
  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const dt = Math.min(0.1, (timestamp - lastTimeRef.current) / 1000) * speed;
    lastTimeRef.current = timestamp;
    
    updateAnts(dt);
    render();
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [updateAnts, render, speed, isRunning]);
  
  // Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    ctxRef.current = ctx;
    initSimulation();
    render();
  }, [initSimulation, render]);
  
  // Control animation
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);
  
  // Professional container styles
  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: isDark 
      ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(59, 130, 246, 0.1)'
      : '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 100px rgba(59, 130, 246, 0.05)'
  };
  
  const headerStyle = {
    background: isDark 
      ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '1.5rem',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
  };
  
  const buttonStyle = {
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem'
  };
  
  return (
    <div style={containerStyle}>
      {/* Professional Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ 
              margin: '0 0 0.25rem 0',
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Users size={24} />
              Community Ant Colony
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              Watch your portfolio compete in real-time • {stats.userAnts} user ants active
            </p>
          </div>
          
          {/* Performance Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '999px',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Zap size={14} />
            Optimized • {stats.fps} FPS
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div style={{ 
        padding: '1rem 1.5rem',
        background: isDark ? '#0f172a' : '#f8fafc',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        display: 'flex', 
        gap: '0.75rem', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          onClick={() => initSimulation()}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white'
          }}
        >
          <RotateCcw size={16} />
          Reset Colony
        </button>
        
        <button
          onClick={() => setShowUserLabels(!showUserLabels)}
          style={{
            ...buttonStyle,
            backgroundColor: showUserLabels ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
            color: showUserLabels ? 'white' : (isDark ? '#f9fafb' : '#374151')
          }}
        >
          <Users size={16} />
          User Labels
        </button>
        
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          style={{
            ...buttonStyle,
            backgroundColor: showLeaderboard ? '#8b5cf6' : (isDark ? '#374151' : '#e5e7eb'),
            color: showLeaderboard ? 'white' : (isDark ? '#f9fafb' : '#374151')
          }}
        >
          <Trophy size={16} />
          Leaderboard
        </button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.875rem', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={14} />
            Quality:
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f9fafb' : '#374151',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="performance">Performance</option>
            <option value="balanced">Balanced</option>
            <option value="quality">Quality</option>
          </select>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: showLeaderboard ? '1fr 320px' : '1fr', height: '600px' }}>
        {/* Canvas */}
        <div style={{ position: 'relative', background: isDark ? '#0a0f1b' : '#f8fafc' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: quality === 'performance' ? 'pixelated' : 'auto'
            }}
          />
          
          {/* Top Performer Badge */}
          {stats.topPerformer && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9))',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Crown size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Top Performer</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '700' }}>
                {stats.topPerformer.name}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                @{stats.topPerformer.username}
              </div>
            </div>
          )}
        </div>
        
        {/* Leaderboard Sidebar */}
        {showLeaderboard && (
          <div style={{
            background: isDark ? '#0f172a' : '#ffffff',
            borderLeft: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            padding: '1.5rem',
            overflowY: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.125rem',
              fontWeight: '700',
              color: isDark ? '#f1f5f9' : '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Trophy size={18} />
              Live Rankings
            </h3>
            
            {/* Colony Rankings */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: isDark ? '#94a3b8' : '#64748b',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Colony Performance
              </h4>
              
              {stats.colonies
                .sort((a, b) => b.food - a.food)
                .map((colony, index) => (
                  <div key={colony.name} style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: index === 0 
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))'
                      : isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '8px',
                    border: index === 0
                      ? '1px solid #fbbf24'
                      : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: colony.color
                        }} />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {colony.name}
                        </span>
                        {index === 0 && <Crown size={14} color="#fbbf24" />}
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                        {colony.food}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: isDark ? '#64748b' : '#94a3b8',
                      marginTop: '0.25rem'
                    }}>
                      {colony.userCount} active users
                    </div>
                  </div>
                ))}
            </div>
            
            {/* User Rankings */}
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: isDark ? '#94a3b8' : '#64748b',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Top Users
              </h4>
              
              {Array.from(userAntsRef.current.values())
                .sort((a, b) => antScoresRef.current[b.antIndex] - antScoresRef.current[a.antIndex])
                .slice(0, 5)
                .map((userAnt, index) => (
                  <div key={userAnt.userId} style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                            #{index + 1}
                          </span>
                          <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {userAnt.profile.name}
                          </span>
                          {userAnt.profile.verified && (
                            <Shield size={12} color="#3b82f6" />
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                          @{userAnt.profile.username}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>
                          {Math.round(antScoresRef.current[userAnt.antIndex])}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                          points
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Statistics Bar */}
      <div style={{
        background: isDark ? '#0f172a' : '#f8fafc',
        borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '0.25rem' }}>
            Total Ants
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
            {stats.regularAnts + stats.userAnts}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '0.25rem' }}>
            User Ants
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>
            {stats.userAnts}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '0.25rem' }}>
            Food Remaining
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6' }}>
            {stats.totalFood}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '0.25rem' }}>
            Performance
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
            {stats.fps} FPS
          </div>
        </div>
      </div>
    </div>
  );
}