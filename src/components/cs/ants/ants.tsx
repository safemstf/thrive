// src\components\cs\ants\ants.tsx

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Play, Pause, RotateCcw, Trophy, Zap, Activity, 
  Radio, Users, DollarSign, TrendingUp, Flag,
  Volume2, VolumeX, Gauge, Navigation, MapPin,
  Timer, Award, Eye, Layers, Sparkles, ChevronUp,
  ChevronDown, Info, Settings, Maximize2, Target,
  CheckCircle2, Circle, Gamepad2, Brain, GitBranch,
  Cpu, Route, Map as MapIcon, Globe, Shuffle, TrendingDown, Sliders
} from 'lucide-react';

// Import from the simulation hub!
import {
  SimulationContainer,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  DiseaseSelector,
  PlaybackControls,
  SpeedIndicator,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  StatCard,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  GlowButton,
  MatrixOverlay
} from '../simulationHub.styles';

// ============================================================================
// ADDITIONAL STYLED COMPONENTS FOR TSP
// ============================================================================

// Keyframes need to be defined first
const dataFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const matrixGlow = keyframes`
  0% {
    box-shadow: 0 0 0px rgba(0,255,0,0.06);
    transform: translateY(0);
    opacity: 0.95;
  }
  50% {
    box-shadow: 0 0 24px rgba(0,255,0,0.18);
    transform: translateY(-2px);
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 0px rgba(0,255,0,0.06);
    transform: translateY(0);
    opacity: 0.95;
  }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Header = styled.header`
  background: linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 2rem;
  padding: 2rem;
  
  @media (max-width: 1400px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const CardHeader = styled.div<{ $color?: string }>`
  padding: 1rem 1.25rem;
  background: ${props => props.$color || 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const AlgorithmSelector = styled.label<{ $selected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${props => props.$selected ? `${props.$color}20` : 'transparent'};
  border: 1px solid ${props => props.$selected ? props.$color : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: ${props => `${props.$color}15`};
    border-color: ${props => props.$color};
  }
`;

const LeaderboardItem = styled.div<{ $position: number; $color: string }>`
  padding: 0.875rem;
  background: ${props => props.$position === 0 ? 'rgba(251, 191, 36, 0.1)' : 'transparent'};
  border-left: 3px solid ${props => props.$color};
  display: flex;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Commentary = styled.div<{ $type: 'normal' | 'exciting' | 'critical' }>`
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  background: ${props => 
    props.$type === 'exciting' ? 'rgba(251, 191, 36, 0.1)' : 
    props.$type === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(255, 255, 255, 0.05)'
  };
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  color: ${props => 
    props.$type === 'exciting' ? '#fbbf24' : 
    props.$type === 'critical' ? '#ef4444' : 
    '#e2e8f0'
  };
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'};
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.2)' : 'transparent'};
  color: ${props => props.$active ? '#3b82f6' : '#94a3b8'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
  
  &:hover {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }
`;

// ============================================================================
// TYPES AND CONFIGURATION
// ============================================================================

const CANVAS_WIDTH = 820;
const CANVAS_HEIGHT = 820;
const INITIAL_CITY_COUNT = 20;

type AlgorithmType = 'NearestNeighbor' | 'TwoOpt' | 'SimulatedAnnealing' | 'Genetic' | 'AntColony' | 'NeuralSOM';

interface City {
  id: number;
  x: number;
  y: number;
  name: string;
}

interface Tour {
  path: number[];
  distance: number;
  improvements: number;
}

interface AlgorithmRacer {
  id: AlgorithmType;
  name: string;
  color: string;
  accentColor: string;
  description: string;
  currentTour: Tour;
  bestTour: Tour;
  iterations: number;
  exploredPaths: number;
  temperature?: number;
  generation?: number;
  pheromones?: number[][];
  neurons?: SOMNeuron[];
  population?: Tour[];
  status: 'running' | 'converged' | 'finished';
  convergenceTime?: number;
  efficiency: number;
}

interface SOMNeuron {
  x: number;
  y: number;
  weights: number[];
}

export type AntsSimulationProps = {
  isRunning: boolean;
  speed: number;
  isDark?: boolean;
};

// ============================================================================
// ALGORITHM IMPLEMENTATIONS
// ============================================================================

class TSPAlgorithms {
  static calculateDistance(cities: City[], tour: number[]): number {
    let distance = 0;
    for (let i = 0; i < tour.length; i++) {
      const from = cities[tour[i]];
      const to = cities[tour[(i + 1) % tour.length]];
      distance += Math.hypot(to.x - from.x, to.y - from.y);
    }
    return distance;
  }

  static nearestNeighbor(cities: City[], startCity: number = 0): Tour {
    const unvisited = new Set(cities.map((_, i) => i));
    const path: number[] = [startCity];
    unvisited.delete(startCity);
    let current = startCity;

    while (unvisited.size > 0) {
      let nearest = -1;
      let nearestDist = Infinity;

      for (const city of unvisited) {
        const dist = Math.hypot(cities[city].x - cities[current].x, cities[city].y - cities[current].y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = city;
        }
      }

      if (nearest !== -1) {
        path.push(nearest);
        unvisited.delete(nearest);
        current = nearest;
      }
    }

    return {
      path,
      distance: this.calculateDistance(cities, path),
      improvements: 0
    };
  }

  static twoOpt(cities: City[], tour: Tour, maxIterations: number = 1): Tour {
    let improved = false;
    let currentPath = [...tour.path];
    let improvements = tour.improvements;

    for (let iter = 0; iter < maxIterations; iter++) {
      improved = false;
      
      for (let i = 1; i < currentPath.length - 2; i++) {
        for (let j = i + 1; j < currentPath.length; j++) {
          if (j - i === 1) continue;

          const newPath = [...currentPath];
          for (let k = 0; k < (j - i) / 2; k++) {
            const temp = newPath[i + k];
            newPath[i + k] = newPath[j - k - 1];
            newPath[j - k - 1] = temp;
          }

          const newDistance = this.calculateDistance(cities, newPath);
          const currentDistance = this.calculateDistance(cities, currentPath);

          if (newDistance < currentDistance) {
            currentPath = newPath;
            improvements++;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
      
      if (!improved) break;
    }

    return {
      path: currentPath,
      distance: this.calculateDistance(cities, currentPath),
      improvements
    };
  }

  static simulatedAnnealing(cities: City[], tour: Tour, temperature: number, coolingRate: number = 0.995): { tour: Tour; temperature: number } {
    const currentPath = [...tour.path];
    const n = currentPath.length;

    const i = Math.floor(Math.random() * (n - 1)) + 1;
    const j = Math.floor(Math.random() * (n - 1)) + 1;
    
    if (i !== j) {
      const newPath = [...currentPath];
      [newPath[i], newPath[j]] = [newPath[j], newPath[i]];

      const currentDistance = this.calculateDistance(cities, currentPath);
      const newDistance = this.calculateDistance(cities, newPath);
      const delta = newDistance - currentDistance;

      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        return {
          tour: {
            path: newPath,
            distance: newDistance,
            improvements: tour.improvements + (delta < 0 ? 1 : 0)
          },
          temperature: temperature * coolingRate
        };
      }
    }

    return {
      tour: {
        ...tour,
        distance: this.calculateDistance(cities, tour.path)
      },
      temperature: temperature * coolingRate
    };
  }

  static geneticAlgorithm(cities: City[], population: Tour[], generation: number): { population: Tour[]; best: Tour } {
    const populationSize = 30;
    const mutationRate = 0.02;
    const eliteSize = 5;

    if (population.length === 0) {
      for (let i = 0; i < populationSize; i++) {
        const path = cities.map((_, i) => i);
        for (let j = path.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [path[j], path[k]] = [path[k], path[j]];
        }
        population.push({
          path,
          distance: this.calculateDistance(cities, path),
          improvements: 0
        });
      }
    }

    population.sort((a, b) => a.distance - b.distance);
    const newPopulation: Tour[] = population.slice(0, eliteSize);

    while (newPopulation.length < populationSize) {
      const parent1 = population[Math.floor(Math.random() * eliteSize)];
      const parent2 = population[Math.floor(Math.random() * eliteSize)];
      const child = this.crossover(parent1.path, parent2.path);

      if (Math.random() < mutationRate) {
        const i = Math.floor(Math.random() * child.length);
        const j = Math.floor(Math.random() * child.length);
        [child[i], child[j]] = [child[j], child[i]];
      }

      newPopulation.push({
        path: child,
        distance: this.calculateDistance(cities, child),
        improvements: generation
      });
    }

    return {
      population: newPopulation,
      best: newPopulation[0]
    };
  }

  static crossover(parent1: number[], parent2: number[]): number[] {
    const size = parent1.length;
    const child: number[] = new Array(size).fill(-1);
    
    const start = Math.floor(Math.random() * size);
    const end = Math.floor(Math.random() * size);
    
    const segStart = Math.min(start, end);
    const segEnd = Math.max(start, end);
    
    for (let i = segStart; i <= segEnd; i++) {
      child[i] = parent1[i];
    }
    
    let currentPos = 0;
    for (let i = 0; i < size; i++) {
      if (!child.includes(parent2[i])) {
        while (child[currentPos] !== -1) {
          currentPos++;
        }
        child[currentPos] = parent2[i];
      }
    }
    
    return child;
  }

  static antColonyOptimization(cities: City[], pheromones: number[][], numAnts: number = 10): { tour: Tour; pheromones: number[][] } {
    const n = cities.length;
    const alpha = 1;
    const beta = 2;
    const evaporationRate = 0.1;
    const Q = 100;

    if (!pheromones || pheromones.length === 0) {
      pheromones = Array(n).fill(null).map(() => Array(n).fill(1));
    }

    const tours: Tour[] = [];

    for (let ant = 0; ant < numAnts; ant++) {
      const visited = new Set<number>();
      const tour: number[] = [];
      let current = Math.floor(Math.random() * n);
      
      tour.push(current);
      visited.add(current);

      while (visited.size < n) {
        const probabilities: number[] = [];
        let sum = 0;

        for (let city = 0; city < n; city++) {
          if (!visited.has(city)) {
            const distance = Math.hypot(cities[city].x - cities[current].x, cities[city].y - cities[current].y);
            const pheromone = pheromones[current][city];
            const probability = Math.pow(pheromone, alpha) * Math.pow(1 / distance, beta);
            probabilities.push(probability);
            sum += probability;
          } else {
            probabilities.push(0);
          }
        }

        let random = Math.random() * sum;
        let next = -1;
        
        for (let city = 0; city < n; city++) {
          if (!visited.has(city)) {
            random -= probabilities[city];
            if (random <= 0) {
              next = city;
              break;
            }
          }
        }

        if (next === -1) {
          for (let city = 0; city < n; city++) {
            if (!visited.has(city)) {
              next = city;
              break;
            }
          }
        }

        if (next !== -1) {
          tour.push(next);
          visited.add(next);
          current = next;
        }
      }

      tours.push({
        path: tour,
        distance: this.calculateDistance(cities, tour),
        improvements: 0
      });
    }

    const newPheromones = pheromones.map(row => row.map(p => p * (1 - evaporationRate)));

    for (const tour of tours) {
      const deposit = Q / tour.distance;
      for (let i = 0; i < tour.path.length; i++) {
        const from = tour.path[i];
        const to = tour.path[(i + 1) % tour.path.length];
        newPheromones[from][to] += deposit;
        newPheromones[to][from] += deposit;
      }
    }

    const bestTour = tours.reduce((best, current) => 
      current.distance < best.distance ? current : best
    );

    return { tour: bestTour, pheromones: newPheromones };
  }

  static selfOrganizingMap(cities: City[], neurons: SOMNeuron[], tour: Tour, learningRate: number = 0.8): { neurons: SOMNeuron[]; tour: Tour } {
    const n = cities.length;
    
    if (!neurons || neurons.length === 0) {
      neurons = [];
      const numNeurons = n * 2;
      for (let i = 0; i < numNeurons; i++) {
        const angle = (i / numNeurons) * Math.PI * 2;
        const radius = 200;
        neurons.push({
          x: CANVAS_WIDTH / 2 + Math.cos(angle) * radius,
          y: CANVAS_HEIGHT / 2 + Math.sin(angle) * radius,
          weights: [CANVAS_WIDTH / 2 + Math.cos(angle) * radius, CANVAS_HEIGHT / 2 + Math.sin(angle) * radius]
        });
      }
    }

    const city = cities[Math.floor(Math.random() * n)];
    
    let bmuIndex = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < neurons.length; i++) {
      const dist = Math.hypot(neurons[i].weights[0] - city.x, neurons[i].weights[1] - city.y);
      if (dist < minDist) {
        minDist = dist;
        bmuIndex = i;
      }
    }

    const neighborhoodRadius = neurons.length / 4;
    for (let i = 0; i < neurons.length; i++) {
      const circularDist = Math.min(
        Math.abs(i - bmuIndex),
        neurons.length - Math.abs(i - bmuIndex)
      );
      
      if (circularDist < neighborhoodRadius) {
        const influence = Math.exp(-circularDist * circularDist / (2 * neighborhoodRadius * neighborhoodRadius));
        const lr = learningRate * influence;
        
        neurons[i].weights[0] += lr * (city.x - neurons[i].weights[0]);
        neurons[i].weights[1] += lr * (city.y - neurons[i].weights[1]);
        neurons[i].x = neurons[i].weights[0];
        neurons[i].y = neurons[i].weights[1];
      }
    }

    const cityToNeuron: Map<number, number> = new Map();
    
    for (let c = 0; c < cities.length; c++) {
      let nearest = 0;
      let nearestDist = Infinity;
      
      for (let n = 0; n < neurons.length; n++) {
        const dist = Math.hypot(neurons[n].x - cities[c].x, neurons[n].y - cities[c].y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = n;
        }
      }
      
      cityToNeuron.set(c, nearest);
    }

    const sortedCities = Array.from(cityToNeuron.entries())
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);

    return {
      neurons,
      tour: {
        path: sortedCities,
        distance: this.calculateDistance(cities, sortedCities),
        improvements: tour.improvements + 1
      }
    };
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TSPAlgorithmChampionship({
  isRunning,
  isDark = true,
}: AntsSimulationProps){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  const [cities, setCities] = useState<City[]>([]);
  const [cityCount, setCityCount] = useState(INITIAL_CITY_COUNT);
  const [racers, setRacers] = useState<AlgorithmRacer[]>([]);
  const [raceStatus, setRaceStatus] = useState<'preparing' | 'starting' | 'racing' | 'finished'>('preparing');
  const [raceTime, setRaceTime] = useState(0);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<AlgorithmType[]>(['NearestNeighbor', 'TwoOpt', 'SimulatedAnnealing']);
  const [raceMode, setRaceMode] = useState<'sprint' | 'quality' | 'exploration'>('quality');
  const [commentary, setCommentary] = useState<{ time: number; message: string; type: 'normal' | 'exciting' | 'critical' }[]>([]);
  const [showPaths, setShowPaths] = useState(true);
  const [showNeurons, setShowNeurons] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'metrics' | 'history'>('settings');

  const algorithmDefinitions: Record<AlgorithmType, Omit<AlgorithmRacer, 'currentTour' | 'bestTour' | 'iterations' | 'exploredPaths' | 'status' | 'efficiency'>> = {
    NearestNeighbor: {
      id: 'NearestNeighbor',
      name: 'Nearest Neighbor',
      color: '#10b981',
      accentColor: '#34d399',
      description: 'Greedy approach'
    },
    TwoOpt: {
      id: 'TwoOpt',
      name: '2-Opt Local Search',
      color: '#3b82f6',
      accentColor: '#60a5fa',
      description: 'Edge swapping'
    },
    SimulatedAnnealing: {
      id: 'SimulatedAnnealing',
      name: 'Simulated Annealing',
      color: '#ef4444',
      accentColor: '#f87171',
      description: 'Probabilistic optimization',
      temperature: 1000
    },
    Genetic: {
      id: 'Genetic',
      name: 'Genetic Algorithm',
      color: '#8b5cf6',
      accentColor: '#a78bfa',
      description: 'Evolution-based',
      generation: 0,
      population: []
    },
    AntColony: {
      id: 'AntColony',
      name: 'Ant Colony',
      color: '#f59e0b',
      accentColor: '#fbbf24',
      description: 'Swarm intelligence',
      pheromones: []
    },
    NeuralSOM: {
      id: 'NeuralSOM',
      name: 'Neural SOM',
      color: '#14b8a6',
      accentColor: '#2dd4bf',
      description: 'Self-organizing map',
      neurons: []
    }
  };

  const generateCities = useCallback((count: number) => {
    const newCities: City[] = [];
    const margin = 50;
    const cityNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];

    for (let i = 0; i < count; i++) {
  let x: number = 0;
  let y: number = 0;
  let attempts = 0;

  do {
    x = margin + Math.random() * (CANVAS_WIDTH - 2 * margin);
    y = margin + Math.random() * (CANVAS_HEIGHT - 2 * margin);
    attempts++;

    const tooClose = newCities.some((city: City) =>
      Math.hypot(city.x - x, city.y - y) < 40
    );

    if (!tooClose || attempts > 100) break;
  } while (true);

  newCities.push({
    id: i,
    x,
    y,
    name: cityNames[i] || `City-${i}`
  });
      }

    return newCities;
  }, []);

  const initializeRace = useCallback(() => {
    const newCities = generateCities(cityCount);
    setCities(newCities);

    const newRacers: AlgorithmRacer[] = selectedAlgorithms.map(algType => {
      const def = algorithmDefinitions[algType];
      const initialTour = TSPAlgorithms.nearestNeighbor(newCities, 0);
      
      return {
        ...def,
        currentTour: initialTour,
        bestTour: initialTour,
        iterations: 0,
        exploredPaths: 1,
        status: 'running',
        efficiency: 100
      };
    });

    setRacers(newRacers);
    setRaceStatus('preparing');
    setRaceTime(0);
    setCommentary([{
      time: 0,
      message: `Welcome to the TSP Championship! ${cityCount} cities to optimize!`,
      type: 'normal'
    }]);
  }, [cityCount, selectedAlgorithms]);

  const updateRacers = useCallback(() => {
    if (raceStatus !== 'racing') return;

    setRacers(prevRacers => {
      const updated = prevRacers.map(racer => {
        if (racer.status !== 'running') return racer;

        let newRacer = { ...racer };
        newRacer.iterations++;

        // Update each algorithm based on its type
        switch (racer.id) {
          case 'NearestNeighbor':
            if (newRacer.iterations === 1) {
              newRacer.status = 'converged';
              newRacer.convergenceTime = raceTime;
            }
            break;

          case 'TwoOpt':
            const improved = TSPAlgorithms.twoOpt(cities, newRacer.currentTour, 5);
            newRacer.currentTour = improved;
            newRacer.exploredPaths += 5;
            
            if (improved.distance < newRacer.bestTour.distance) {
              newRacer.bestTour = improved;
            }
            
            if (improved.improvements === newRacer.currentTour.improvements && newRacer.iterations > 10) {
              newRacer.status = 'converged';
              newRacer.convergenceTime = raceTime;
            }
            break;

          case 'SimulatedAnnealing':
            const result = TSPAlgorithms.simulatedAnnealing(
              cities, 
              newRacer.currentTour, 
              newRacer.temperature || 1000
            );
            newRacer.currentTour = result.tour;
            newRacer.temperature = result.temperature;
            newRacer.exploredPaths++;
            
            if (result.tour.distance < newRacer.bestTour.distance) {
              newRacer.bestTour = result.tour;
            }
            
            if (newRacer.temperature! < 0.1) {
              newRacer.status = 'converged';
              newRacer.convergenceTime = raceTime;
            }
            break;

          case 'Genetic':
            const genResult = TSPAlgorithms.geneticAlgorithm(cities, newRacer.population || [], newRacer.generation || 0);
            newRacer.currentTour = genResult.best;
            newRacer.population = genResult.population;
            newRacer.generation = (newRacer.generation || 0) + 1;
            newRacer.exploredPaths += 30;
            
            if (genResult.best.distance < newRacer.bestTour.distance) {
              newRacer.bestTour = genResult.best;
            }
            
            if (newRacer.generation > 50) {
              newRacer.status = 'converged';
              newRacer.convergenceTime = raceTime;
            }
            break;

          case 'AntColony':
            const acoResult = TSPAlgorithms.antColonyOptimization(
              cities,
              newRacer.pheromones || [],
              10
            );
            newRacer.currentTour = acoResult.tour;
            newRacer.pheromones = acoResult.pheromones;
            newRacer.exploredPaths += 10;
            
            if (acoResult.tour.distance < newRacer.bestTour.distance) {
              newRacer.bestTour = acoResult.tour;
            }
            
            if (newRacer.iterations > 30) {
              newRacer.status = 'converged';
              newRacer.convergenceTime = raceTime;
            }
            break;

          case 'NeuralSOM':
            const somResult = TSPAlgorithms.selfOrganizingMap(
              cities,
              newRacer.neurons || [],
              newRacer.currentTour,
              Math.max(0.1, 0.8 - newRacer.iterations * 0.01)
            );
            newRacer.currentTour = somResult.tour;
            newRacer.neurons = somResult.neurons;
            newRacer.exploredPaths++;
            
            if (somResult.tour.distance < newRacer.bestTour.distance) {
              newRacer.bestTour = somResult.tour;
            }
            
            if (newRacer.iterations > 80) {
              newRacer.status = 'converged';
              newRacer.convergenceTime = raceTime;
            }
            break;
        }

        const optimalEstimate = cities.length * 100;
        newRacer.efficiency = Math.round((optimalEstimate / newRacer.bestTour.distance) * 100);

        return newRacer;
      });

      if (updated.every(r => r.status !== 'running')) {
        setRaceStatus('finished');
        
        const winner = updated.reduce((best, current) => 
          current.bestTour.distance < best.bestTour.distance ? current : best
        );
        
        setCommentary(prev => [...prev, {
          time: raceTime,
          message: `Race complete! ${winner.name} wins with distance ${winner.bestTour.distance.toFixed(2)}!`,
          type: 'exciting'
        }]);
      }

      return updated;
    });

    setRaceTime(prev => prev + 16);
  }, [cities, raceStatus, raceTime]);

  const renderVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid background
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw neurons if enabled and available
    if (showNeurons) {
      racers.forEach(racer => {
        if (racer.neurons && racer.neurons.length > 0) {
          ctx.fillStyle = `${racer.color}20`;
          racer.neurons.forEach(neuron => {
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });
    }

    // Draw paths
    if (showPaths) {
      racers.forEach((racer, index) => {
        const tour = racer.currentTour.path;
        if (tour.length === 0) return;

        ctx.strokeStyle = racer.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 - index * 0.1;
        
        ctx.beginPath();
        for (let i = 0; i < tour.length; i++) {
          const city = cities[tour[i]];
          const nextCity = cities[tour[(i + 1) % tour.length]];
          
          if (i === 0) {
            ctx.moveTo(city.x, city.y);
          }
          ctx.lineTo(nextCity.x, nextCity.y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.globalAlpha = 1;
      });
    }

    // Draw cities
    cities.forEach((city) => {
      const gradient = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, 15);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(city.x - 15, city.y - 15, 30, 30);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0a0a0a';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(city.id.toString(), city.x, city.y);
    });

    // Highlight best tour
    if (racers.length > 0) {
      const bestRacer = racers.reduce((best, current) => 
        current.bestTour.distance < best.bestTour.distance ? current : best
      );
      
      const tour = bestRacer.bestTour.path;
      ctx.strokeStyle = bestRacer.accentColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.8;
      
      ctx.beginPath();
      for (let i = 0; i < tour.length; i++) {
        const city = cities[tour[i]];
        if (i === 0) {
          ctx.moveTo(city.x, city.y);
        } else {
          ctx.lineTo(city.x, city.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    if (raceStatus === 'starting') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      const lights = 3 - Math.floor((Date.now() % 3000) / 1000);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < lights ? '#ef4444' : '#374151';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH/2 + (i - 1) * 40, CANVAS_HEIGHT/2, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [cities, racers, showPaths, showNeurons, raceStatus]);

  useEffect(() => {
    let frameId: number;
    
    const animate = () => {
      for (let i = 0; i < speed; i++) {
        updateRacers();
      }
      renderVisualization();
      frameId = requestAnimationFrame(animate);
    };

    if (raceStatus === 'racing') {
      frameId = requestAnimationFrame(animate);
    } else {
      renderVisualization();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [raceStatus, speed, updateRacers, renderVisualization]);

  useEffect(() => {
    initializeRace();
  }, [initializeRace]);

  const startRace = () => {
    setRaceStatus('starting');
    setCommentary(prev => [...prev, {
      time: raceTime,
      message: 'Algorithms initializing optimization strategies!',
      type: 'exciting'
    }]);
    
    setTimeout(() => {
      setRaceStatus('racing');
      setCommentary(prev => [...prev, {
        time: raceTime,
        message: "THE RACE BEGINS! Who will find the optimal tour?",
        type: 'exciting'
      }]);
    }, 2000);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <SimulationContainer $isDark={true} ref={wrapperRef}>
      <MatrixOverlay />
      
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Radio size={24} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, fontFamily: 'Courier New', textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}>
              TSP Algorithm Championship
            </h1>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              background: 'rgba(59, 130, 246, 0.2)', 
              borderRadius: '9999px',
              fontSize: '0.75rem',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontFamily: 'Courier New'
            }}>
              {cityCount} Cities • {selectedAlgorithms.length} Algorithms
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: 'none', 
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <div style={{ 
              fontFamily: 'Courier New', 
              fontSize: '1.25rem', 
              fontWeight: 700,
              color: '#3b82f6',
              textShadow: '0 0 5px rgba(59, 130, 246, 0.5)'
            }}>
              {formatTime(raceTime)}
            </div>
          </div>
        </div>
      </Header>

      <MainGrid>
        <Panel>
          <Card>
            <CardHeader $color="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)">
              <Cpu size={16} />
              Select Algorithms
            </CardHeader>
            <CardContent>
              {Object.entries(algorithmDefinitions).map(([key, def]) => (
                <AlgorithmSelector
                  key={key}
                  $selected={selectedAlgorithms.includes(key as AlgorithmType)}
                  $color={def.color}
                >
                  <input
                    type="checkbox"
                    checked={selectedAlgorithms.includes(key as AlgorithmType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAlgorithms([...selectedAlgorithms, key as AlgorithmType]);
                      } else {
                        setSelectedAlgorithms(selectedAlgorithms.filter(a => a !== key));
                      }
                      setTimeout(initializeRace, 0);
                    }}
                  />
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: def.color,
                    boxShadow: `0 0 10px ${def.color}60`
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{def.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{def.description}</div>
                  </div>
                </AlgorithmSelector>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader $color="linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)">
              <MapIcon size={16} />
              Problem Settings
            </CardHeader>
            <CardContent>
              <ParameterControl>
                <div className="header">
                  <span className="label">City Count</span>
                  <span className="value">{cityCount}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={cityCount}
                  onChange={(e) => {
                    setCityCount(Number(e.target.value));
                    setTimeout(initializeRace, 0);
                  }}
                />
              </ParameterControl>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ModeButton 
                  $active={raceMode === 'sprint'}
                  onClick={() => setRaceMode('sprint')}
                >
                  <Zap size={14} />
                  Sprint
                </ModeButton>
                <ModeButton 
                  $active={raceMode === 'quality'}
                  onClick={() => setRaceMode('quality')}
                >
                  <Trophy size={14} />
                  Quality
                </ModeButton>
                <ModeButton 
                  $active={raceMode === 'exploration'}
                  onClick={() => setRaceMode('exploration')}
                >
                  <Globe size={14} />
                  Explorer
                </ModeButton>
              </div>
            </CardContent>
          </Card>
        </Panel>

        <Panel>
          <VideoSection>
            <CanvasContainer>
              <SimCanvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
              
              <HUD $isDark={true}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 8, 
                      background: 'linear-gradient(135deg,#3b82f6,#2563eb)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Route size={20} />
                    </div>
                    <div>
                    <div style={{ fontWeight: 900, fontSize: '14px' }}>TSP SOLVER</div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>
                        Mode: {raceMode.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {racers.slice(0, 3).map(racer => (
                    <div key={racer.id} style={{ 
                      display: 'flex', gap: 6, alignItems: 'center', 
                      background: `${racer.color}15`, 
                      padding: '6px 10px', 
                      borderRadius: 6, 
                      border: `1px solid ${racer.color}40` 
                    }}>
                      <div style={{ 
                        width: 8, height: 8, borderRadius: '50%', 
                        background: racer.color 
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700 }}>
                        {racer.bestTour.distance.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </HUD>

              <PlaybackControls>
                <button onClick={() => setRaceStatus(raceStatus === 'racing' ? 'preparing' : 'racing')} title={raceStatus === 'racing' ? 'Pause' : 'Play'}>
                  {raceStatus === 'racing' ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Sliders size={16} />
                  <input 
                    type="range" min={0.5} max={5} step={0.5} 
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))} 
                  />
                  <div style={{ minWidth: 48, textAlign: 'right', fontWeight: 900, fontFamily: 'Courier New' }}>
                    {speed.toFixed(1)}x
                  </div>
                </div>
                <button onClick={toggleFullscreen}>
                  <Maximize2 size={18} />
                </button>
              </PlaybackControls>

              <SpeedIndicator>OPTIMIZATION SPEED: {speed.toFixed(1)}x</SpeedIndicator>
            </CanvasContainer>
          </VideoSection>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            <GlowButton
              onClick={() => raceStatus === 'preparing' ? startRace() : setRaceStatus('preparing')}
              $color={raceStatus === 'racing' ? '#ef4444' : '#3b82f6'}
            >
              {raceStatus === 'racing' ? (
                <>
                  <Pause size={16} />
                  Pause
                </>
              ) : raceStatus === 'starting' ? (
                <>
                  <Zap size={16} />
                  Starting...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Start Race
                </>
              )}
            </GlowButton>
            
            <GlowButton onClick={initializeRace} $color="#8b5cf6">
              <Shuffle size={16} />
              New Cities
            </GlowButton>
          </div>
        </Panel>

        <Panel>
          <Card>
            <CardHeader $color="linear-gradient(90deg, #f59e0b 0%, #d97706 100%)">
              <Trophy size={16} />
              Algorithm Rankings
            </CardHeader>
            <CardContent>
              {racers
                .sort((a, b) => a.bestTour.distance - b.bestTour.distance)
                .map((racer, position) => (
                  <LeaderboardItem
                    key={racer.id}
                    $position={position}
                    $color={racer.color}
                  >
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, width: '32px' }}>
                      {position === 0 && racer.status === 'converged' ? '🏆' : `${position + 1}.`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          backgroundColor: racer.color 
                        }} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Courier New' }}>
                          {racer.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem', fontFamily: 'Courier New' }}>
                        Distance: {racer.bestTour.distance.toFixed(2)}
                      </div>
                      {racer.status === 'converged' && (
                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                          ✓ Converged
                        </div>
                      )}
                    </div>
                  </LeaderboardItem>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader $color="linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)">
              <Radio size={16} />
              Race Commentary
            </CardHeader>
            <CardContent>
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {commentary.slice(-5).reverse().map((comment, i) => (
                  <Commentary key={i} $type={comment.type}>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                      [{formatTime(comment.time)}]
                    </span>{' '}
                    {comment.message}
                  </Commentary>
                ))}
              </div>
            </CardContent>
          </Card>
        </Panel>
      </MainGrid>

      <ControlsSection $isDark={true}>
        <TabContainer>
          <Tab $active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
            <Settings size={16} style={{ marginRight: 8 }} />
            VIEW OPTIONS
          </Tab>
          <Tab $active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')}>
            <Gauge size={16} style={{ marginRight: 8 }} />
            METRICS
          </Tab>
          <Tab $active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
            <Activity size={16} style={{ marginRight: 8 }} />
            HISTORY
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === 'settings' && (
            <InterventionGrid>
              <InterventionCard 
                $active={showPaths} 
                onClick={() => setShowPaths(!showPaths)}
                $color="#3b82f6"
              >
                <div className="icon"><Eye size={20} /></div>
                <div className="name">Show Paths</div>
                <div className="efficacy">{showPaths ? 'ON' : 'OFF'}</div>
              </InterventionCard>
              
              <InterventionCard 
                $active={showNeurons} 
                onClick={() => setShowNeurons(!showNeurons)}
                $color="#14b8a6"
              >
                <div className="icon"><Brain size={20} /></div>
                <div className="name">Show Neurons</div>
                <div className="efficacy">{showNeurons ? 'ON' : 'OFF'}</div>
              </InterventionCard>
            </InterventionGrid>
          )}

          {activeTab === 'metrics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {racers.map(racer => (
                <StatCard key={racer.id} $color={racer.color}>
                  <div className="label">{racer.name}</div>
                  <div className="value">{racer.efficiency}%</div>
                  <div className="change">
                    {racer.exploredPaths} paths • {racer.iterations} iterations
                  </div>
                </StatCard>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              Race history will appear here after completion
            </div>
          )}
        </TabContent>
      </ControlsSection>
    </SimulationContainer>
  );
}