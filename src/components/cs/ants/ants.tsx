// src/components/cs/ants/ants.tsx
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Zap, Sparkles, Map as MapIcon, TrendingUp, Award, Brain, Circle, Grid3x3, Shuffle, Eye, EyeOff, Volume2, VolumeX, Trophy, Flame, Target, Cpu, BarChart3, Timer, Activity, ChevronDown, ChevronUp, Info } from 'lucide-react';

// Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1500;

// Types
type AlgorithmType = 'greedy' | 'twoOpt' | 'annealing' | 'genetic' | 'antColony';
type CityMode = 'random' | 'circle' | 'grid' | 'clusters' | 'spiral';
type ThemeMode = 'cyber' | 'neon' | 'matrix' | 'sunset';

interface City {
  x: number;
  y: number;
  id: number;
}

interface Algorithm {
  id: AlgorithmType;
  name: string;
  emoji: string;
  color: string;
  glow: string;
  tour: number[];
  distance: number;
  bestDistance: number;
  iterations: number;
  improvements: number;
  status: 'idle' | 'running' | 'finished' | 'winner';
  description: string;
  funFact: string;
  temperature?: number;
  particles?: Particle[];
  history?: number[];
  improvementRate?: number;
  lastImprovement?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// Props interface for the component
interface TSPAlgorithmRaceProps {
  isRunning: boolean;
  speed: number;
}

// Enhanced Theme configurations with BLUE Matrix (matching your Matrix Rain)
const themes: Record<ThemeMode, any> = {
  matrix: {
    bg: 'rgba(0, 0, 0, 0.85)', // Semi-transparent for matrix rain
    grid: 'rgba(59, 130, 246, 0.02)', // Blue grid to match rain
    city: '#3b82f6', // Blue cities
    glow: 'rgba(59, 130, 246, 0.6)', // Blue glow
    text: '#3b82f6', // Blue text
    panel: 'rgba(0, 10, 20, 0.9)', // Dark blue panel
    border: 'rgba(59, 130, 246, 0.3)' // Blue border
  },
  cyber: {
    bg: '#0a0f1b',
    grid: 'rgba(0, 255, 255, 0.03)',
    city: '#00ffff',
    glow: 'rgba(0, 255, 255, 0.4)',
    text: '#00ffff',
    panel: 'rgba(10, 15, 27, 0.95)',
    border: 'rgba(0, 255, 255, 0.3)'
  },
  neon: {
    bg: '#0a0a0a',
    grid: 'rgba(255, 0, 255, 0.03)',
    city: '#ff00ff',
    glow: 'rgba(255, 0, 255, 0.4)',
    text: '#ff00ff',
    panel: 'rgba(10, 10, 10, 0.95)',
    border: 'rgba(255, 0, 255, 0.3)'
  },
  sunset: {
    bg: '#1a0f1f',
    grid: 'rgba(255, 100, 50, 0.03)',
    city: '#ff6432',
    glow: 'rgba(255, 100, 50, 0.4)',
    text: '#ff6432',
    panel: 'rgba(26, 15, 31, 0.95)',
    border: 'rgba(255, 100, 50, 0.3)'
  }
};

// Enhanced Algorithm configurations with Matrix-blue colors
const algorithmConfigs = {
  greedy: {
    name: 'Greedy',
    emoji: '🏃',
    color: '#3b82f6', // Blue
    glow: '#60a5fa',
    description: 'Fast & furious, picks nearest city',
    funFact: 'O(n²) complexity - Quick but not optimal'
  },
  twoOpt: {
    name: '2-Opt',
    emoji: '✂️',
    color: '#06b6d4', // Cyan
    glow: '#22d3ee',
    description: 'The perfectionist, keeps tweaking',
    funFact: 'Improves by swapping edge pairs'
  },
  annealing: {
    name: 'Simulated Annealing',
    emoji: '🔥',
    color: '#f59e0b', // Amber
    glow: '#fbbf24',
    description: 'Hot-headed but cools down',
    funFact: 'Escapes local minima with probability'
  },
  genetic: {
    name: 'Genetic',
    emoji: '🧬',
    color: '#8b5cf6', // Violet
    glow: '#a78bfa',
    description: 'Darwin\'s favorite algorithm',
    funFact: 'Evolves solutions through generations'
  },
  antColony: {
    name: 'Ant Colony',
    emoji: '🐜',
    color: '#10b981', // Emerald
    glow: '#34d399',
    description: 'Follow the pheromone highway',
    funFact: 'Inspired by real ant behavior'
  }
};

// TSP Algorithms
class TSP {
  static distance(cities: City[], tour: number[]): number {
    let d = 0;
    for (let i = 0; i < tour.length; i++) {
      const a = cities[tour[i]];
      const b = cities[tour[(i + 1) % tour.length]];
      d += Math.hypot(b.x - a.x, b.y - a.y);
    }
    return d;
  }

  static greedy(cities: City[]): number[] {
    const n = cities.length;
    const unvisited = new Set(Array.from({length: n}, (_, i) => i));
    const path = [0];
    unvisited.delete(0);
    
    while (unvisited.size > 0) {
      const current = path[path.length - 1];
      let nearest = -1;
      let minDist = Infinity;
      
      for (const city of unvisited) {
        const d = Math.hypot(cities[city].x - cities[current].x, cities[city].y - cities[current].y);
        if (d < minDist) {
          minDist = d;
          nearest = city;
        }
      }
      
      if (nearest !== -1) {
        path.push(nearest);
        unvisited.delete(nearest);
      }
    }
    
    return path;
  }

  static twoOpt(cities: City[], tour: number[]): { path: number[], improved: boolean } {
    const newTour = [...tour];
    const n = tour.length;
    
    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j - i === 1) continue;
        
        const candidate = [...newTour];
        for (let k = 0; k < (j - i) / 2; k++) {
          [candidate[i + k], candidate[j - k - 1]] = [candidate[j - k - 1], candidate[i + k]];
        }
        
        if (this.distance(cities, candidate) < this.distance(cities, newTour)) {
          return { path: candidate, improved: true };
        }
      }
    }
    
    return { path: newTour, improved: false };
  }

  static simulatedAnnealing(cities: City[], tour: number[], temp: number): { path: number[], accepted: boolean } {
    const newTour = [...tour];
    const n = tour.length;
    
    const i = 1 + Math.floor(Math.random() * (n - 2));
    const j = 1 + Math.floor(Math.random() * (n - 2));
    
    if (i !== j) {
      [newTour[i], newTour[j]] = [newTour[j], newTour[i]];
      
      const delta = this.distance(cities, newTour) - this.distance(cities, tour);
      if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
        return { path: newTour, accepted: true };
      }
    }
    
    return { path: tour, accepted: false };
  }

  static genetic(cities: City[], population: number[][]): { best: number[], population: number[][] } {
    if (population.length === 0) {
      const pop: number[][] = [];
      for (let i = 0; i < 20; i++) {
        const tour = Array.from({length: cities.length}, (_, i) => i);
        for (let j = tour.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [tour[j], tour[k]] = [tour[k], tour[j]];
        }
        pop.push(tour);
      }
      population = pop;
    }

    const sorted = [...population].sort((a, b) => 
      this.distance(cities, a) - this.distance(cities, b)
    );
    
    const newPop: number[][] = sorted.slice(0, 5);
    
    while (newPop.length < 20) {
      const parent1 = sorted[Math.floor(Math.random() * 10)];
      const parent2 = sorted[Math.floor(Math.random() * 10)];
      
      const start = Math.floor(Math.random() * parent1.length);
      const end = Math.floor(Math.random() * parent1.length);
      const child = new Array(parent1.length).fill(-1);
      
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        child[i] = parent1[i];
      }
      
      let ptr = 0;
      for (const city of parent2) {
        if (!child.includes(city)) {
          while (child[ptr] !== -1) ptr++;
          child[ptr] = city;
        }
      }
      
      if (Math.random() < 0.1) {
        const i = Math.floor(Math.random() * child.length);
        const j = Math.floor(Math.random() * child.length);
        [child[i], child[j]] = [child[j], child[i]];
      }
      
      newPop.push(child);
    }
    
    return { best: sorted[0], population: newPop };
  }

  static antColony(cities: City[], pheromones: number[][], ants: number = 10): { best: number[], pheromones: number[][] } {
    const n = cities.length;
    
    if (!pheromones || pheromones.length === 0) {
      pheromones = Array(n).fill(null).map(() => Array(n).fill(1));
    }
    
    const tours: number[][] = [];
    
    for (let ant = 0; ant < ants; ant++) {
      const tour: number[] = [];
      const unvisited = new Set(Array.from({length: n}, (_, i) => i));
      
      let current = Math.floor(Math.random() * n);
      tour.push(current);
      unvisited.delete(current);
      
      while (unvisited.size > 0) {
        const probabilities: [number, number][] = [];
        let sum = 0;
        
        for (const next of unvisited) {
          const distance = Math.hypot(cities[next].x - cities[current].x, cities[next].y - cities[current].y);
          const pheromone = pheromones[current][next];
          const probability = Math.pow(pheromone, 1) * Math.pow(1 / distance, 2);
          probabilities.push([next, probability]);
          sum += probability;
        }
        
        let random = Math.random() * sum;
        let chosen = probabilities[0][0];
        
        for (const [city, prob] of probabilities) {
          random -= prob;
          if (random <= 0) {
            chosen = city;
            break;
          }
        }
        
        tour.push(chosen);
        unvisited.delete(chosen);
        current = chosen;
      }
      
      tours.push(tour);
    }
    
    const evaporation = 0.1;
    const newPheromones = pheromones.map(row => row.map(p => p * (1 - evaporation)));
    
    for (const tour of tours) {
      const distance = this.distance(cities, tour);
      const deposit = 100 / distance;
      
      for (let i = 0; i < tour.length; i++) {
        const from = tour[i];
        const to = tour[(i + 1) % tour.length];
        newPheromones[from][to] += deposit;
        newPheromones[to][from] += deposit;
      }
    }
    
    const bestTour = tours.reduce((best, tour) => 
      this.distance(cities, tour) < this.distance(cities, best) ? tour : best
    );
    
    return { best: bestTour, pheromones: newPheromones };
  }
}

// City generation
const generateCities = (count: number, mode: CityMode): City[] => {
  const cities: City[] = [];
  const margin = 60;
  
  switch (mode) {
    case 'circle':
      const centerX = CANVAS_WIDTH / 2;
      const centerY = CANVAS_HEIGHT / 2;
      const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) / 2 - margin * 2;
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        cities.push({
          id: i,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      break;
      
    case 'grid':
      const cols = Math.ceil(Math.sqrt(count * (CANVAS_WIDTH / CANVAS_HEIGHT)));
      const rows = Math.ceil(count / cols);
      const spacingX = (CANVAS_WIDTH - 2 * margin) / Math.max(1, cols - 1);
      const spacingY = (CANVAS_HEIGHT - 2 * margin) / Math.max(1, rows - 1);
      
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        cities.push({
          id: i,
          x: margin + col * spacingX,
          y: margin + row * spacingY
        });
      }
      break;
      
    case 'clusters':
      const numClusters = Math.max(3, Math.floor(count / 5));
      const clusters: { x: number, y: number }[] = [];
      
      for (let i = 0; i < numClusters; i++) {
        clusters.push({
          x: margin * 2 + Math.random() * (CANVAS_WIDTH - margin * 4),
          y: margin * 2 + Math.random() * (CANVAS_HEIGHT - margin * 4)
        });
      }
      
      for (let i = 0; i < count; i++) {
        const cluster = clusters[i % numClusters];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 80;
        cities.push({
          id: i,
          x: Math.max(margin, Math.min(CANVAS_WIDTH - margin, cluster.x + Math.cos(angle) * dist)),
          y: Math.max(margin, Math.min(CANVAS_HEIGHT - margin, cluster.y + Math.sin(angle) * dist))
        });
      }
      break;
      
    case 'spiral':
      const spiralCenterX = CANVAS_WIDTH / 2;
      const spiralCenterY = CANVAS_HEIGHT / 2;
      const maxRadius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) / 2 - margin;
      
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const angle = t * Math.PI * 6;
        const r = t * maxRadius;
        cities.push({
          id: i,
          x: spiralCenterX + Math.cos(angle) * r,
          y: spiralCenterY + Math.sin(angle) * r
        });
      }
      break;
      
    default:
      for (let i = 0; i < count; i++) {
        cities.push({
          id: i,
          x: margin + Math.random() * (CANVAS_WIDTH - 2 * margin),
          y: margin + Math.random() * (CANVAS_HEIGHT - 2 * margin)
        });
      }
  }
  
  return cities;
};

export default function TSPAlgorithmRace({ isRunning, speed }: TSPAlgorithmRaceProps) {
  // REMOVED: const [isClient, setIsClient] = useState(false);
  // Since this component is dynamically imported with ssr: false, 
  // we don't need client-side initialization checks
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(isRunning);
  const [localSpeed, setLocalSpeed] = useState(speed);
  const [cities, setCities] = useState<City[]>([]);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>(['greedy', 'twoOpt', 'annealing']);
  const [cityCount, setCityCount] = useState(12);
  const [cityMode, setCityMode] = useState<CityMode>('random');
  const [theme, setTheme] = useState<ThemeMode>('matrix');
  const [showTrails, setShowTrails] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [expandedStats, setExpandedStats] = useState(false);
  
  const frameRef = useRef<number>(0);
  const tempRef = useRef(100);
  const populationRef = useRef<Record<string, number[][]>>({});
  const pheromonesRef = useRef<number[][]>([]);
  const timeRef = useRef(0);
  const trailsRef = useRef<Map<string, Array<{x: number, y: number, alpha: number}>>>(new Map());

  // REMOVED: useEffect(() => { setIsClient(true); }, []);

  // Use prop values when available
  useEffect(() => {
    setIsPlaying(isRunning);
  }, [isRunning]);

  useEffect(() => {
    setLocalSpeed(speed);
  }, [speed]);

  // Initialize simulation (runs immediately since this is client-only)
  const initializeSimulation = useCallback(() => {
    const newCities = generateCities(cityCount, cityMode);
    setCities(newCities);
    
    tempRef.current = 100;
    populationRef.current = {};
    pheromonesRef.current = [];
    timeRef.current = 0;
    trailsRef.current.clear();
    setWinner(null);
    
    const algos: Algorithm[] = [];
    
    for (const [id, config] of Object.entries(algorithmConfigs)) {
      if (selectedAlgos.includes(id as AlgorithmType)) {
        const initialTour = TSP.greedy(newCities);
        algos.push({
          id: id as AlgorithmType,
          ...config,
          tour: initialTour,
          distance: TSP.distance(newCities, initialTour),
          bestDistance: TSP.distance(newCities, initialTour),
          iterations: 0,
          improvements: 0,
          status: 'idle',
          particles: [],
          history: [],
          improvementRate: 0,
          lastImprovement: 0
        });
      }
    }
    
    setAlgorithms(algos);
  }, [cityCount, cityMode, selectedAlgos]);

  // Update algorithms with history tracking
  const updateAlgorithms = useCallback(() => {
    if (cities.length === 0) return;
    
    setAlgorithms(prev => {
      const updated = prev.map(algo => {
        if (algo.status !== 'running') return algo;
        
        let newTour = algo.tour;
        let improved = false;
        
        switch (algo.id) {
          case 'greedy':
            if (algo.iterations === 0) {
              return { ...algo, status: 'finished' as const, iterations: 1 };
            }
            break;
            
          case 'twoOpt':
            const twoOptResult = TSP.twoOpt(cities, algo.tour);
            newTour = twoOptResult.path;
            improved = twoOptResult.improved;
            
            if (!improved && algo.iterations > 10) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1 };
            }
            break;
            
          case 'annealing':
            const annealingResult = TSP.simulatedAnnealing(cities, algo.tour, tempRef.current);
            newTour = annealingResult.path;
            improved = annealingResult.accepted;
            tempRef.current *= 0.995;
            
            if (tempRef.current < 0.1) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1, temperature: tempRef.current };
            }
            break;
            
          case 'genetic':
            const population = populationRef.current[algo.id] || [];
            const geneticResult = TSP.genetic(cities, population);
            populationRef.current[algo.id] = geneticResult.population;
            newTour = geneticResult.best;
            improved = TSP.distance(cities, newTour) < algo.bestDistance;
            
            if (algo.iterations > 50) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1 };
            }
            break;
            
          case 'antColony':
            const antResult = TSP.antColony(cities, pheromonesRef.current, 10);
            pheromonesRef.current = antResult.pheromones;
            newTour = antResult.best;
            improved = TSP.distance(cities, newTour) < algo.bestDistance;
            
            if (algo.iterations > 30) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1 };
            }
            break;
        }
        
        const newDistance = TSP.distance(cities, newTour);
        
        // Track history
        const history = [...(algo.history || []), newDistance];
        if (history.length > 50) history.shift();
        
        // Calculate improvement rate
        const improvementRate = improved ? 
          ((algo.bestDistance - newDistance) / algo.bestDistance * 100) : 
          algo.improvementRate || 0;
        
        // Add particles for improvements
        let particles = algo.particles || [];
        if (improved && newDistance < algo.bestDistance) {
          const cityIdx = newTour[Math.floor(Math.random() * newTour.length)];
          const city = cities[cityIdx];
          for (let i = 0; i < 5; i++) {
            particles.push({
              x: city.x,
              y: city.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 1,
              color: algo.glow
            });
          }
        }
        
        // Update particles
        particles = particles
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02 }))
          .filter(p => p.life > 0);
        
        return {
          ...algo,
          tour: newTour,
          distance: newDistance,
          bestDistance: Math.min(algo.bestDistance, newDistance),
          iterations: algo.iterations + 1,
          improvements: improved ? algo.improvements + 1 : algo.improvements,
          temperature: algo.id === 'annealing' ? tempRef.current : algo.temperature,
          particles,
          history,
          improvementRate: improved ? improvementRate : algo.improvementRate,
          lastImprovement: improved ? algo.iterations : algo.lastImprovement
        };
      });
      
      // Check for winner
      if (updated.every(a => a.status === 'finished') && !winner) {
        const champion = updated.reduce((best, current) => 
          current.bestDistance < best.bestDistance ? current : best
        );
        setWinner(champion.id);
        updated.forEach(a => {
          if (a.id === champion.id) a.status = 'winner';
        });
      }
      
      return updated;
    });
  }, [cities, winner]);

  // Enhanced render with Blue Matrix theme
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentTheme = themes[theme];
    
    // Background (semi-transparent for matrix theme)
    ctx.fillStyle = currentTheme.bg;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Matrix-style grid with blue theme
    if (theme === 'matrix') {
      // Digital rain effect grid with BLUE
      const gridSize = 30;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)'; // Blue grid
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      
      // Random matrix characters with Arabic influence
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; // Blue characters
      ctx.font = '12px monospace';
      const matrixChars = '01░▒▓█الم';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        ctx.fillText(char, x, y);
      }
    } else {
      // Original animated grid for other themes
      const gridOffset = (timeRef.current * 0.05) % 50;
      ctx.strokeStyle = currentTheme.grid;
      ctx.lineWidth = 1;
      
      for (let x = -gridOffset; x <= CANVAS_WIDTH + 50; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = -gridOffset; y <= CANVAS_HEIGHT + 50; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }
    
    // Draw pheromone trails for ant colony
    const antAlgo = algorithms.find(a => a.id === 'antColony');
    if (antAlgo && pheromonesRef.current.length > 0 && showTrails) {
      const maxPheromone = Math.max(...pheromonesRef.current.flat());
      for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
          const intensity = pheromonesRef.current[i]?.[j] / maxPheromone || 0;
          if (intensity > 0.1) {
            ctx.strokeStyle = theme === 'matrix' ? 
              `rgba(59, 130, 246, ${intensity * 0.4})` : // Blue pheromones for matrix
              `${antAlgo.glow}${Math.floor(intensity * 40).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = intensity * 4;
            ctx.beginPath();
            ctx.moveTo(cities[i].x, cities[i].y);
            ctx.lineTo(cities[j].x, cities[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    // Draw algorithm paths
    algorithms.forEach((algo) => {
      if (algo.tour.length === 0) return;
      
      // Trail effect
      if (showTrails) {
        const trail = trailsRef.current.get(algo.id) || [];
        trail.forEach((point, i) => {
          ctx.fillStyle = `${algo.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fill();
          point.alpha *= 0.98;
        });
        
        if (trail.length > 100) trail.shift();
      }
      
      // Main path
      ctx.strokeStyle = algo.color;
      ctx.lineWidth = algo.status === 'winner' ? 4 : 2;
      ctx.shadowColor = algo.glow;
      ctx.shadowBlur = algo.status === 'winner' ? 20 : 10;
      
      ctx.beginPath();
      for (let i = 0; i <= algo.tour.length; i++) {
        const cityIdx = algo.tour[i % algo.tour.length];
        const city = cities[cityIdx];
        if (i === 0) {
          ctx.moveTo(city.x, city.y);
        } else {
          ctx.lineTo(city.x, city.y);
        }
        
        // Add to trail
        if (showTrails && i > 0 && Math.random() < 0.1) {
          let trail = trailsRef.current.get(algo.id);
          if (!trail) {
            trail = [];
            trailsRef.current.set(algo.id, trail);
          }
          trail.push({ x: city.x, y: city.y, alpha: 0.5 });
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Draw particles
      algo.particles?.forEach(p => {
        ctx.fillStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Draw cities with Matrix theme enhancements
    cities.forEach((city, idx) => {
      // Glow
      const gradient = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, 25);
      gradient.addColorStop(0, currentTheme.glow);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(city.x - 25, city.y - 25, 50, 50);
      
      // City circle
      ctx.fillStyle = currentTheme.city;
      ctx.strokeStyle = theme === 'matrix' ? '#001122' : '#000';
      ctx.lineWidth = 2;
      ctx.shadowColor = currentTheme.glow;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(city.x, city.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // City number
      ctx.fillStyle = theme === 'matrix' ? '#fff' : '#000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(city.id.toString(), city.x, city.y);
    });
    
    timeRef.current++;
  }, [cities, algorithms, theme, showTrails]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      for (let i = 0; i < localSpeed; i++) {
        updateAlgorithms();
      }
      render();
      
      if (isPlaying) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      render();
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, localSpeed, updateAlgorithms, render]);

  // Initialize on mount - runs immediately since this is client-only
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  const handlePlay = () => {
    if (!isPlaying) {
      setAlgorithms(prev => prev.map(a => ({ ...a, status: 'running' })));
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    initializeSimulation();
  };

  const cityModeIcons = {
    random: <Sparkles size={18} />,
    circle: <Circle size={18} />,
    grid: <Grid3x3 size={18} />,
    clusters: <MapIcon size={18} />,
    spiral: <TrendingUp size={18} />
  };

  const currentTheme = themes[theme];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: theme === 'matrix' ? 'transparent' : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px',
        background: currentTheme.panel,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '28px', 
          fontWeight: 700,
          color: currentTheme.text,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textShadow: theme === 'matrix' ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
        }}>
          <Cpu size={32} />
          TSP Algorithm Battle Arena
        </h1>
        
        <div style={{ 
          padding: '8px 16px',
          background: `${currentTheme.city}22`,
          borderRadius: '24px',
          fontSize: '14px',
          border: `1px solid ${currentTheme.border}`,
          fontWeight: 500
        }}>
          {cities.length} Cities • {algorithms.length} Algorithms
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          {Object.keys(themes).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t as ThemeMode)}
              style={{
                padding: '8px 16px',
                background: theme === t ? themes[t as ThemeMode].city : 'transparent',
                border: `2px solid ${theme === t ? themes[t as ThemeMode].city : currentTheme.border}`,
                borderRadius: '8px',
                color: theme === t ? (t === 'matrix' ? '#000' : '#000') : currentTheme.text,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '24px', overflow: 'hidden' }}>
        {/* Canvas and Stats Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Canvas */}
          <div style={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: currentTheme.panel,
            borderRadius: '16px',
            border: `1px solid ${currentTheme.border}`,
            position: 'relative'
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '12px'
              }}
            />
            
            {/* Overlay Stats */}
            {showStats && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: currentTheme.panel,
                borderRadius: '12px',
                padding: expandedStats ? '20px' : '16px',
                border: `1px solid ${currentTheme.border}`,
                minWidth: expandedStats ? '400px' : '360px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: expandedStats ? '16px' : '12px'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: 600,
                    color: currentTheme.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Trophy size={20} />
                    Live Leaderboard
                  </h3>
                  <button
                    onClick={() => setExpandedStats(!expandedStats)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: currentTheme.text,
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {expandedStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                {[...algorithms]
                  .sort((a, b) => a.bestDistance - b.bestDistance)
                  .map((algo, idx) => (
                    <div key={algo.id} style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: idx === 0 && algo.status === 'winner' ? 
                        `${algo.color}15` : 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      border: `1px solid ${idx === 0 && algo.status === 'winner' ? 
                        algo.color : 'transparent'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        fontSize: '20px',
                        minWidth: '30px',
                        textAlign: 'center'
                      }}>
                        {idx === 0 && algo.status === 'winner' ? '🏆' : 
                         idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{ fontSize: '24px' }}>{algo.emoji}</span>
                          <span style={{ 
                            fontWeight: 600, 
                            fontSize: '16px',
                            color: algo.color
                          }}>
                            {algo.name}
                          </span>
                          {algo.status === 'running' && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: algo.color,
                              animation: 'pulse 1s infinite'
                            }}/>
                          )}
                        </div>
                        
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#94a3b8',
                          display: 'flex',
                          gap: '16px'
                        }}>
                          <span>Distance: <strong style={{ color: currentTheme.text }}>
                            {algo.bestDistance.toFixed(0)}
                          </strong></span>
                          <span>Improvements: <strong style={{ color: currentTheme.text }}>
                            {algo.improvements}
                          </strong></span>
                          {expandedStats && (
                            <>
                              <span>Iterations: <strong style={{ color: currentTheme.text }}>
                                {algo.iterations}
                              </strong></span>
                              {algo.improvementRate && algo.improvementRate > 0 && (
                                <span>Rate: <strong style={{ color: '#10b981' }}>
                                  {algo.improvementRate.toFixed(1)}%
                                </strong></span>
                              )}
                            </>
                          )}
                        </div>
                        
                        {expandedStats && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {algo.description}
                            </div>
                            {algo.temperature !== undefined && (
                              <div style={{ 
                                marginTop: '4px',
                                fontSize: '12px',
                                color: '#ef4444'
                              }}>
                                Temperature: {algo.temperature.toFixed(2)}°
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Winner Announcement */}
            {winner && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: currentTheme.panel,
                borderRadius: '16px',
                padding: '32px',
                border: `2px solid ${algorithms.find(a => a.id === winner)?.color}`,
                textAlign: 'center',
                boxShadow: `0 0 40px ${algorithms.find(a => a.id === winner)?.glow}`
              }}>
                <h2 style={{ 
                  fontSize: '36px', 
                  margin: '0 0 16px 0',
                  color: algorithms.find(a => a.id === winner)?.color
                }}>
                  🎉 Victory! 🎉
                </h2>
                <p style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
                  {algorithms.find(a => a.id === winner)?.emoji} {algorithms.find(a => a.id === winner)?.name} Algorithm Wins!
                </p>
                <p style={{ fontSize: '16px', color: '#94a3b8' }}>
                  Final Distance: {algorithms.find(a => a.id === winner)?.bestDistance.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div style={{
          width: '400px',
          background: currentTheme.panel,
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${currentTheme.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto'
        }}>
          {/* Play Controls */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePlay}
              style={{
                flex: 1,
                padding: '14px',
                background: isPlaying ? '#ef4444' : currentTheme.city,
                border: 'none',
                borderRadius: '10px',
                color: theme === 'matrix' ? '#fff' : 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              {isPlaying ? 'Pause' : 'Start Race'}
            </button>
            
            <button
              onClick={handleReset}
              style={{
                padding: '14px',
                background: 'rgba(255,255,255,0.1)',
                border: `2px solid ${currentTheme.border}`,
                borderRadius: '10px',
                color: currentTheme.text,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Shuffle size={22} />
            </button>
            
            <button
              onClick={() => setShowTrails(!showTrails)}
              style={{
                padding: '14px',
                background: showTrails ? `${currentTheme.city}22` : 'rgba(255,255,255,0.1)',
                border: `2px solid ${showTrails ? currentTheme.city : currentTheme.border}`,
                borderRadius: '10px',
                color: currentTheme.text,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {showTrails ? <Eye size={22} /> : <EyeOff size={22} />}
            </button>
            
            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                padding: '14px',
                background: showStats ? `${currentTheme.city}22` : 'rgba(255,255,255,0.1)',
                border: `2px solid ${showStats ? currentTheme.city : currentTheme.border}`,
                borderRadius: '10px',
                color: currentTheme.text,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <BarChart3 size={22} />
            </button>
          </div>

          {/* Speed Control */}
          <div>
            <label style={{ 
              fontSize: '14px', 
              color: '#94a3b8', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '12px',
              fontWeight: 500
            }}>
              <Zap size={16} />
              Simulation Speed: {localSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(Number(e.target.value))}
              style={{ 
                width: '100%',
                accentColor: currentTheme.city
              }}
            />
          </div>

          {/* City Configuration */}
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              color: currentTheme.text,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapIcon size={18} />
              City Configuration
            </h3>
            
            <label style={{ 
              fontSize: '14px', 
              color: '#94a3b8', 
              marginBottom: '8px', 
              display: 'block',
              fontWeight: 500
            }}>
              Number of Cities: {cityCount}
            </label>
            <input
              type="range"
              min="5"
              max="25"
              value={cityCount}
              onChange={(e) => setCityCount(Number(e.target.value))}
              style={{ 
                width: '100%', 
                marginBottom: '16px',
                accentColor: currentTheme.city
              }}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.entries(cityModeIcons).map(([mode, icon]) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCityMode(mode as CityMode);
                    setTimeout(initializeSimulation, 0);
                  }}
                  style={{
                    padding: '12px',
                    background: cityMode === mode ? `${currentTheme.city}22` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${cityMode === mode ? currentTheme.city : currentTheme.border}`,
                    borderRadius: '10px',
                    color: currentTheme.text,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {icon}
                  <span style={{ textTransform: 'capitalize' }}>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm Selection */}
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              marginBottom: '12px', 
              color: currentTheme.text,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Brain size={18} />
              Select Algorithms
            </h3>
            
            {Object.entries(algorithmConfigs).map(([id, config]) => (
              <label
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  marginBottom: '10px',
                  background: selectedAlgos.includes(id as AlgorithmType) ? 
                    `${config.color}15` : 
                    'rgba(255,255,255,0.05)',
                  border: `2px solid ${selectedAlgos.includes(id as AlgorithmType) ? 
                    config.color : 'transparent'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAlgos.includes(id as AlgorithmType)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAlgos([...selectedAlgos, id as AlgorithmType]);
                    } else {
                      setSelectedAlgos(selectedAlgos.filter(a => a !== id));
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '24px' }}>{config.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: 600,
                    color: selectedAlgos.includes(id as AlgorithmType) ? 
                      config.color : currentTheme.text
                  }}>
                    {config.name}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#94a3b8',
                    marginTop: '2px'
                  }}>
                    {config.funFact}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}