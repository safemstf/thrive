'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Zap, MapPin, Navigation, Building2, Brain, Shuffle, Trophy, Cpu, BarChart3, ChevronDown, ChevronUp, Home, Compass, CheckCircle2, AlertCircle } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

// ==================== CONSTANTS ====================
const COLORS = {
  bg1: '#0a0e1a',
  bg2: '#1a1a2e',
  textPrimary: '#e6eef8',
  textMuted: '#dee5efff',
  accent: '#3b82f6',
  accentSoft: '#60a5fa',
  success: '#22c55e',
  warn: '#fbbf24',
  danger: '#ef4444',
  borderAccent: 'rgba(59, 130, 246, 0.15)',
  road: '#475569'
};

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;

// ==================== TYPES ====================
type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs' | 'bmssp';
type MapMode = 'us-cities' | 'metro' | 'highway' | 'regional';
type AlgorithmStatus = 'idle' | 'running' | 'finished' | 'winner' | 'failed';

interface City {
  id: number;
  name: string;
  x: number;
  y: number;
  connections: number[];
}

interface AlgorithmConfig {
  name: string;
  emoji: string;
  color: string;
  glow: string;
  funFact: string;
}

interface AlgorithmState {
  id: AlgorithmType;
  path: number[];
  explored: Set<number>;
  frontier: number[];
  status: AlgorithmStatus;
  steps: number;
  distance: number;
}

interface shortestPathDemoProps {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
  isTheaterMode?: boolean;
}

// ==================== GRAPH CLASS ====================
class CityGraph {
  cities: City[];
  distances: number[][];

  constructor() {
    this.cities = [];
    this.distances = [];
  }

  initializeCities(mode: MapMode): void {
    switch (mode) {
      case 'us-cities':
        this.cities = this.generateUSCities();
        break;
      case 'metro':
        this.cities = this.generateMetro();
        break;
      case 'highway':
        this.cities = this.generateHighway();
        break;
      case 'regional':
        this.cities = this.generateRegional();
        break;
    }
    this.calculateDistances();
  }

  private generateUSCities(): City[] {
    return [
      { id: 0, name: 'Seattle', x: 150, y: 80, connections: [1, 3, 6] },
      { id: 1, name: 'Portland', x: 140, y: 140, connections: [0, 2, 3] },
      { id: 2, name: 'San Francisco', x: 120, y: 240, connections: [1, 4, 5] },
      { id: 3, name: 'Boise', x: 250, y: 130, connections: [0, 1, 6, 7] },
      { id: 4, name: 'Los Angeles', x: 180, y: 340, connections: [2, 5, 8] },
      { id: 5, name: 'Las Vegas', x: 240, y: 300, connections: [2, 4, 8, 9] },
      { id: 6, name: 'Helena', x: 350, y: 90, connections: [0, 3, 7, 10] },
      { id: 7, name: 'Salt Lake City', x: 320, y: 210, connections: [3, 6, 9, 11] },
      { id: 8, name: 'Phoenix', x: 300, y: 380, connections: [4, 5, 12] },
      { id: 9, name: 'Denver', x: 430, y: 240, connections: [5, 7, 11, 12, 13] },
      { id: 10, name: 'Fargo', x: 520, y: 100, connections: [6, 11, 14] },
      { id: 11, name: 'Omaha', x: 550, y: 220, connections: [7, 9, 10, 13, 15] },
      { id: 12, name: 'Albuquerque', x: 380, y: 360, connections: [8, 9, 13, 16] },
      { id: 13, name: 'Kansas City', x: 630, y: 260, connections: [9, 11, 12, 15, 17] },
      { id: 14, name: 'Minneapolis', x: 650, y: 130, connections: [10, 15, 18] },
      { id: 15, name: 'Des Moines', x: 680, y: 200, connections: [11, 13, 14, 18] },
      { id: 16, name: 'Dallas', x: 580, y: 400, connections: [12, 17, 19] },
      { id: 17, name: 'St. Louis', x: 730, y: 290, connections: [13, 16, 18, 20] },
      { id: 18, name: 'Chicago', x: 780, y: 190, connections: [14, 15, 17, 21] },
      { id: 19, name: 'Houston', x: 650, y: 480, connections: [16, 20, 22] },
      { id: 20, name: 'Memphis', x: 770, y: 360, connections: [17, 19, 21, 23] },
      { id: 21, name: 'Detroit', x: 860, y: 200, connections: [18, 20, 24] },
      { id: 22, name: 'New Orleans', x: 790, y: 470, connections: [19, 23] },
      { id: 23, name: 'Atlanta', x: 880, y: 390, connections: [20, 22, 24, 25] },
      { id: 24, name: 'Cleveland', x: 930, y: 230, connections: [21, 23, 26] },
      { id: 25, name: 'Charlotte', x: 950, y: 360, connections: [23, 26, 27] },
      { id: 26, name: 'Pittsburgh', x: 1000, y: 260, connections: [24, 25, 27, 28] },
      { id: 27, name: 'Washington', x: 1040, y: 320, connections: [25, 26, 28] },
      { id: 28, name: 'New York', x: 1070, y: 250, connections: [26, 27, 29] },
      { id: 29, name: 'Boston', x: 1100, y: 190, connections: [28] }
    ];
  }

  private generateMetro(): City[] {
    return [
      { id: 0, name: 'Downtown', x: 600, y: 350, connections: [1, 2, 3, 4] },
      { id: 1, name: 'Midtown', x: 600, y: 250, connections: [0, 5, 6] },
      { id: 2, name: 'Eastside', x: 750, y: 350, connections: [0, 7, 8] },
      { id: 3, name: 'Westside', x: 450, y: 350, connections: [0, 9, 10] },
      { id: 4, name: 'Southport', x: 600, y: 500, connections: [0, 11, 12] },
      { id: 5, name: 'Uptown', x: 600, y: 150, connections: [1, 13] },
      { id: 6, name: 'Financial', x: 700, y: 250, connections: [1, 2, 14] },
      { id: 7, name: 'Tech Hub', x: 850, y: 300, connections: [2, 8, 15] },
      { id: 8, name: 'Innovation Park', x: 800, y: 450, connections: [2, 4, 16] },
      { id: 9, name: 'Arts District', x: 350, y: 300, connections: [3, 10] },
      { id: 10, name: 'University', x: 400, y: 450, connections: [3, 4, 17] },
      { id: 11, name: 'Harbor', x: 550, y: 580, connections: [4, 12, 18] },
      { id: 12, name: 'Airport', x: 700, y: 550, connections: [4, 8, 19] },
      { id: 13, name: 'North End', x: 550, y: 100, connections: [5] },
      { id: 14, name: 'Business Park', x: 800, y: 200, connections: [6, 7] },
      { id: 15, name: 'Suburbs East', x: 950, y: 350, connections: [7] },
      { id: 16, name: 'Industrial', x: 850, y: 500, connections: [8, 12] },
      { id: 17, name: 'Suburbs West', x: 300, y: 500, connections: [10] },
      { id: 18, name: 'Waterfront', x: 500, y: 630, connections: [11] },
      { id: 19, name: 'Cargo Terminal', x: 750, y: 620, connections: [12] }
    ];
  }

  private generateHighway(): City[] {
    const cities: City[] = [];
    const mainHighway = [
      { name: 'City A', x: 150, y: 350 },
      { name: 'City B', x: 300, y: 300 },
      { name: 'City C', x: 450, y: 280 },
      { name: 'City D', x: 600, y: 350 },
      { name: 'City E', x: 750, y: 320 },
      { name: 'City F', x: 900, y: 350 },
      { name: 'City G', x: 1050, y: 340 }
    ];

    const branches = [
      { name: 'North 1', x: 300, y: 180, connectTo: 1 },
      { name: 'North 2', x: 600, y: 200, connectTo: 3 },
      { name: 'North 3', x: 900, y: 200, connectTo: 5 },
      { name: 'South 1', x: 300, y: 450, connectTo: 1 },
      { name: 'South 2', x: 600, y: 500, connectTo: 3 },
      { name: 'South 3', x: 900, y: 480, connectTo: 5 }
    ];

    mainHighway.forEach((city, i) => {
      const connections: number[] = [];
      if (i > 0) connections.push(i - 1);
      if (i < mainHighway.length - 1) connections.push(i + 1);
      cities.push({ id: i, ...city, connections });
    });

    branches.forEach((branch, i) => {
      const id = mainHighway.length + i;
      cities.push({
        id,
        ...branch,
        connections: [branch.connectTo]
      });
      cities[branch.connectTo].connections.push(id);
    });

    return cities;
  }

  private generateRegional(): City[] {
    const cities: City[] = [];
    const regions = [
      { name: 'Region A', cx: 300, cy: 250, cities: 5 },
      { name: 'Region B', cx: 700, cy: 250, cities: 5 },
      { name: 'Region C', cx: 500, cy: 450, cities: 4 }
    ];

    let idCounter = 0;
    regions.forEach((region, regionIdx) => {
      const startId = idCounter;
      const angleStep = (Math.PI * 2) / region.cities;
      
      for (let i = 0; i < region.cities; i++) {
        const angle = i * angleStep;
        const radius = 100;
        const x = region.cx + Math.cos(angle) * radius;
        const y = region.cy + Math.sin(angle) * radius;
        
        const connections: number[] = [];
        if (i > 0) connections.push(idCounter - 1);
        if (i === region.cities - 1) connections.push(startId);
        if (i < region.cities - 1) connections.push(idCounter + 1);

        cities.push({
          id: idCounter,
          name: `${region.name.slice(-1)}${i + 1}`,
          x, y,
          connections
        });
        idCounter++;
      }
    });

    // Connect regions
    cities[2].connections.push(5);
    cities[5].connections.push(2);
    cities[7].connections.push(10);
    cities[10].connections.push(7);

    return cities;
  }

  private calculateDistances(): void {
    const n = this.cities.length;
    this.distances = Array(n).fill(0).map(() => Array(n).fill(Infinity));

    for (let i = 0; i < n; i++) {
      this.distances[i][i] = 0;
    }

    this.cities.forEach(city => {
      city.connections.forEach(connId => {
        const target = this.cities[connId];
        const dist = Math.sqrt(
          Math.pow(city.x - target.x, 2) + Math.pow(city.y - target.y, 2)
        );
        this.distances[city.id][connId] = dist;
      });
    });
  }

  getDistance(from: number, to: number): number {
    return this.distances[from]?.[to] ?? Infinity;
  }

  getHeuristic(from: number, to: number): number {
    const fromCity = this.cities[from];
    const toCity = this.cities[to];
    if (!fromCity || !toCity) return Infinity;
    
    return Math.sqrt(
      Math.pow(fromCity.x - toCity.x, 2) + Math.pow(fromCity.y - toCity.y, 2)
    );
  }

  getNeighbors(cityId: number): number[] {
    return this.cities[cityId]?.connections ?? [];
  }

  getCityCount(): number {
    return this.cities.length;
  }
}

// ==================== BASE ALGORITHM CLASS ====================
abstract class PathfindingAlgorithm {
  id: AlgorithmType;
  config: AlgorithmConfig;
  graph: CityGraph;
  startCity: number;
  goalCity: number;
  
  path: number[];
  explored: Set<number>;
  frontier: number[];
  status: AlgorithmStatus;
  steps: number;
  distance: number;
  
  protected internalState: any;

  constructor(id: AlgorithmType, config: AlgorithmConfig, graph: CityGraph, start: number, goal: number) {
    this.id = id;
    this.config = config;
    this.graph = graph;
    this.startCity = start;
    this.goalCity = goal;
    
    this.path = [];
    this.explored = new Set();
    this.frontier = [];
    this.status = 'idle';
    this.steps = 0;
    this.distance = 0;
    
    this.internalState = this.initializeState();
  }

  abstract initializeState(): any;
  abstract step(): boolean;

  calculateTotalDistance(path: number[]): number {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      total += this.graph.getDistance(path[i], path[i + 1]);
    }
    return total;
  }

  reconstructPath(cameFrom: Map<number, number>, current: number): number[] {
    const path: number[] = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      path.unshift(current);
    }
    return path;
  }

  markFinished(): void {
    this.status = 'finished';
  }

  markWinner(): void {
    this.status = 'winner';
  }

  markFailed(): void {
    this.status = 'failed';
  }

  isComplete(): boolean {
    return this.status === 'finished' || this.status === 'winner' || this.status === 'failed';
  }

  getState(): AlgorithmState {
    return {
      id: this.id,
      path: this.path,
      explored: this.explored,
      frontier: this.frontier,
      status: this.status,
      steps: this.steps,
      distance: this.distance
    };
  }
}

// ==================== DIJKSTRA ALGORITHM ====================
class DijkstraAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const distances = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const pq: Array<{ city: number; dist: number }> = [];

    distances.set(this.startCity, 0);
    pq.push({ city: this.startCity, dist: 0 });
    this.frontier = [this.startCity];

    return { distances, cameFrom, pq };
  }

  step(): boolean {
    if (this.internalState.pq.length === 0) {
      this.markFailed();
      return false;
    }

    this.internalState.pq.sort((a: { dist: number; }, b: { dist: number; }) => a.dist - b.dist);
    const { city: current, dist: currentDist } = this.internalState.pq.shift()!;
    
    this.frontier = this.internalState.pq.map((item: any) => item.city);
    
    if (this.explored.has(current)) return true;
    
    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const neighbors = this.graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (this.explored.has(neighbor)) return;

      const newDist = currentDist + this.graph.getDistance(current, neighbor);
      const oldDist = this.internalState.distances.get(neighbor) ?? Infinity;

      if (newDist < oldDist) {
        this.internalState.distances.set(neighbor, newDist);
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.pq.push({ city: neighbor, dist: newDist });
      }
    });

    return true;
  }
}

// ==================== A* ALGORITHM ====================
class AStarAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const openSet: Array<{ city: number; f: number }> = [];

    gScore.set(this.startCity, 0);
    fScore.set(this.startCity, this.graph.getHeuristic(this.startCity, this.goalCity));
    openSet.push({ city: this.startCity, f: fScore.get(this.startCity)! });
    this.frontier = [this.startCity];

    return { gScore, fScore, cameFrom, openSet };
  }

  step(): boolean {
    if (this.internalState.openSet.length === 0) {
      this.markFailed();
      return false;
    }

    this.internalState.openSet.sort((a: { f: number; }, b: { f: number; }) => a.f - b.f);
    const { city: current } = this.internalState.openSet.shift()!;
    
    this.frontier = this.internalState.openSet.map((item: any) => item.city);
    
    if (this.explored.has(current)) return true;
    
    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const currentG = this.internalState.gScore.get(current) ?? Infinity;
    const neighbors = this.graph.getNeighbors(current);
    
    neighbors.forEach(neighbor => {
      if (this.explored.has(neighbor)) return;

      const tentativeG = currentG + this.graph.getDistance(current, neighbor);
      const oldG = this.internalState.gScore.get(neighbor) ?? Infinity;

      if (tentativeG < oldG) {
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.gScore.set(neighbor, tentativeG);
        const h = this.graph.getHeuristic(neighbor, this.goalCity);
        const f = tentativeG + h;
        this.internalState.fScore.set(neighbor, f);
        
        const existingIndex = this.internalState.openSet.findIndex((item: any) => item.city === neighbor);
        if (existingIndex >= 0) {
          this.internalState.openSet[existingIndex].f = f;
        } else {
          this.internalState.openSet.push({ city: neighbor, f });
        }
      }
    });

    return true;
  }
}

// ==================== BFS ALGORITHM ====================
class BFSAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const queue: number[] = [this.startCity];
    const cameFrom = new Map<number, number>();
    this.frontier = [this.startCity];
    return { queue, cameFrom };
  }

  step(): boolean {
    if (this.internalState.queue.length === 0) {
      this.markFailed();
      return false;
    }

    const current = this.internalState.queue.shift()!;
    this.frontier = [...this.internalState.queue];
    
    if (this.explored.has(current)) return true;
    
    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const neighbors = this.graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (!this.explored.has(neighbor) && !this.internalState.cameFrom.has(neighbor)) {
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.queue.push(neighbor);
      }
    });

    return true;
  }
}

// ==================== DFS ALGORITHM ====================
class DFSAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const stack: number[] = [this.startCity];
    const cameFrom = new Map<number, number>();
    this.frontier = [this.startCity];
    return { stack, cameFrom };
  }

  step(): boolean {
    if (this.internalState.stack.length === 0) {
      this.markFailed();
      return false;
    }

    const current = this.internalState.stack.pop()!;
    this.frontier = [...this.internalState.stack];
    
    if (this.explored.has(current)) return true;
    
    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const neighbors = this.graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (!this.explored.has(neighbor) && !this.internalState.cameFrom.has(neighbor)) {
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.stack.push(neighbor);
      }
    });

    return true;
  }
}

// ==================== BMSSP ALGORITHM (Bounded Multi-Source Shortest Path) ====================
// Based on "Breaking the Sorting Barrier for Directed Single-Source Shortest Paths" (2025)
// This is a simplified visualization-friendly version
class BMSSPAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    // Calculate k parameter based on graph size (from paper's √n heuristic)
    const k = Math.max(3, Math.ceil(Math.sqrt(this.graph.getCityCount())));
    
    // Initialize multiple pivot points (multi-source aspect)
    const pivots = new Set<number>();
    pivots.add(this.startCity);
    
    // Select additional pivots distributed across the graph
    const cityCount = this.graph.getCityCount();
    for (let i = 1; i < k && i < cityCount; i++) {
      const pivotId = Math.floor((i / k) * cityCount);
      if (pivotId !== this.startCity) {
        pivots.add(pivotId);
      }
    }
    
    // bd = bounded distance map (key data structure from paper)
    const bd = new Map<number, number>();
    bd.set(this.startCity, 0);
    
    // W = working set of vertices (from FindPivots procedure)
    const W = new Set(pivots);
    const frontier = Array.from(pivots);
    const cameFrom = new Map<number, number>();
    
    this.frontier = frontier;
    
    return { 
      pivots, 
      bd, 
      W, 
      frontier, 
      cameFrom, 
      iterationsWithoutProgress: 0,
      k
    };
  }

  step(): boolean {
    if (this.internalState.frontier.length === 0 || 
        this.internalState.iterationsWithoutProgress > this.graph.getCityCount() * 2) {
      this.markFailed();
      return false;
    }

    // Batch processing: process multiple nodes at once (key optimization)
    const batchSize = Math.min(3, this.internalState.frontier.length);
    const batch = this.internalState.frontier.splice(0, batchSize);
    
    for (const current of batch) {
      this.explored.add(current);
      this.steps++;
      this.internalState.iterationsWithoutProgress++;
      
      // Check if we reached the goal
      if (current === this.goalCity) {
        this.path = this.reconstructPath(this.internalState.cameFrom, current);
        this.distance = this.calculateTotalDistance(this.path);
        this.markFinished();
        return false;
      }
      
      const currentDist = this.internalState.bd.get(current) ?? Infinity;
      
      // Relax edges (similar to Dijkstra but with bounded distance)
      const neighbors = this.graph.getNeighbors(current);
      for (const nextId of neighbors) {
        const edgeCost = this.graph.getDistance(current, nextId);
        const newDist = currentDist + edgeCost;
        
        // Update if we found a shorter path
        if (!this.internalState.bd.has(nextId) || newDist < this.internalState.bd.get(nextId)!) {
          this.internalState.bd.set(nextId, newDist);
          this.internalState.cameFrom.set(nextId, current);
          this.internalState.iterationsWithoutProgress = 0;
          
          // Add to frontier and working set
          if (!this.explored.has(nextId) && !this.internalState.frontier.includes(nextId)) {
            this.internalState.frontier.push(nextId);
            this.internalState.W.add(nextId);
          }
        }
      }
    }
    
    // Sort frontier by bounded distance (maintains priority)
    this.internalState.frontier.sort((a: number, b: number) => 
      (this.internalState.bd.get(a) ?? Infinity) - (this.internalState.bd.get(b) ?? Infinity)
    );
    
    this.frontier = [...this.internalState.frontier];
    
    return true;
  }
}

// ==================== RENDERER CLASS ====================
class GraphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private graph: CityGraph;

  constructor(canvas: HTMLCanvasElement, graph: CityGraph) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.graph = graph;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(algorithms: PathfindingAlgorithm[], startCity: number, goalCity: number): void {
    this.clear();
    this.drawConnections();
    this.drawAlgorithmStates(algorithms);
    this.drawCities(algorithms, startCity, goalCity);
  }

  private drawConnections(): void {
    this.ctx.strokeStyle = COLORS.road;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.3;

    this.graph.cities.forEach(city => {
      city.connections.forEach(connId => {
        const target = this.graph.cities[connId];
        if (target) {
          this.ctx.beginPath();
          this.ctx.moveTo(city.x, city.y);
          this.ctx.lineTo(target.x, target.y);
          this.ctx.stroke();
        }
      });
    });

    this.ctx.globalAlpha = 1;
  }

  private drawAlgorithmStates(algorithms: PathfindingAlgorithm[]): void {
    algorithms.forEach(algo => {
      // Draw explored nodes
      algo.explored.forEach(cityId => {
        const city = this.graph.cities[cityId];
        if (city) {
          this.ctx.fillStyle = algo.config.color;
          this.ctx.globalAlpha = 0.15;
          this.ctx.beginPath();
          this.ctx.arc(city.x, city.y, 30, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });

      // Draw frontier nodes
      this.ctx.globalAlpha = 0.3;
      algo.frontier.forEach(cityId => {
        const city = this.graph.cities[cityId];
        if (city) {
          this.ctx.strokeStyle = algo.config.color;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(city.x, city.y, 25, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      });

      // Draw path
      if (algo.path.length > 1) {
        this.ctx.globalAlpha = 0.7;
        this.ctx.strokeStyle = algo.config.color;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = algo.config.glow;
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();
        this.ctx.moveTo(this.graph.cities[algo.path[0]].x, this.graph.cities[algo.path[0]].y);
        for (let i = 1; i < algo.path.length; i++) {
          const city = this.graph.cities[algo.path[i]];
          this.ctx.lineTo(city.x, city.y);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }

      this.ctx.globalAlpha = 1;
    });
  }

  private drawCities(algorithms: PathfindingAlgorithm[], startCity: number, goalCity: number): void {
    this.graph.cities.forEach(city => {
      const isStart = city.id === startCity;
      const isGoal = city.id === goalCity;

      if (isStart) {
        this.ctx.fillStyle = COLORS.success;
        this.ctx.shadowColor = COLORS.success;
      } else if (isGoal) {
        this.ctx.fillStyle = COLORS.danger;
        this.ctx.shadowColor = COLORS.danger;
      } else {
        this.ctx.fillStyle = COLORS.textMuted;
        this.ctx.shadowColor = 'transparent';
      }

      this.ctx.shadowBlur = isStart || isGoal ? 15 : 0;
      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, isStart || isGoal ? 12 : 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      if (isStart || isGoal) {
        this.ctx.fillStyle = COLORS.textPrimary;
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(city.name, city.x, city.y - 25);
      }
    });
  }
}

// ==================== SIMULATION CONTROLLER ====================
class SimulationController {
  private graph: CityGraph;
  private algorithms: PathfindingAlgorithm[];
  private renderer: GraphRenderer;
  private startCity: number;
  private goalCity: number;
  private winner: AlgorithmType | null;

  constructor(canvas: HTMLCanvasElement) {
    this.graph = new CityGraph();
    this.algorithms = [];
    this.renderer = new GraphRenderer(canvas, this.graph);
    this.startCity = 0;
    this.goalCity = 0;
    this.winner = null;
  }

  initialize(mapMode: MapMode, selectedAlgos: AlgorithmType[], algorithmConfigs: Record<AlgorithmType, AlgorithmConfig>): void {
    this.graph.initializeCities(mapMode);
    
    const cityCount = this.graph.getCityCount();
    
    // ✨ RANDOM CITY SELECTION
    // Pick random start city
    this.startCity = Math.floor(Math.random() * cityCount);
    
    // Pick random goal city that's different from start and reasonably far
    let attempts = 0;
    do {
      this.goalCity = Math.floor(Math.random() * cityCount);
      attempts++;
    } while (
      (this.goalCity === this.startCity || 
      this.graph.getHeuristic(this.startCity, this.goalCity) < 200) && 
      attempts < 20
    );
    
    // Fallback if we can't find a good pair
    if (this.goalCity === this.startCity) {
      this.goalCity = (this.startCity + Math.floor(cityCount / 2)) % cityCount;
    }
    
    this.winner = null;

    this.algorithms = selectedAlgos.map(algoType => {
      const config = algorithmConfigs[algoType];
      return this.createAlgorithm(algoType, config);
    });
  }

  private createAlgorithm(type: AlgorithmType, config: AlgorithmConfig): PathfindingAlgorithm {
    switch (type) {
      case 'dijkstra':
        return new DijkstraAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'astar':
        return new AStarAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'bfs':
        return new BFSAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'dfs':
        return new DFSAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'bmssp':
        return new BMSSPAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
    }
  }

  step(): void {
    let anyRunning = false;

    this.algorithms.forEach(algo => {
      if (!algo.isComplete()) {
        const continueRunning = algo.step();
        if (continueRunning || !algo.isComplete()) {
          anyRunning = true;
        }
        
        // Check for winner
        if (algo.status === 'finished' && !this.winner) {
          this.winner = algo.id;
          algo.markWinner();
        }
      }
    });

    // If we have a winner, mark others as finished or failed
    if (this.winner) {
      this.algorithms.forEach(algo => {
        if (algo.id !== this.winner && algo.status === 'running') {
          if (algo.path.length > 0) {
            algo.markFinished();
          } else {
            algo.markFailed();
          }
        }
      });
    }
  }

  render(): void {
    this.renderer.render(this.algorithms, this.startCity, this.goalCity);
  }

  getAlgorithmStates(): AlgorithmState[] {
    return this.algorithms.map(algo => algo.getState());
  }

  getWinner(): AlgorithmType | null {
    return this.winner;
  }

  getCities(): City[] {
    return this.graph.cities;
  }

  getStartCity(): number {
    return this.startCity;
  }

  getGoalCity(): number {
    return this.goalCity;
  }
}

// ==================== STYLED COMPONENTS ====================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gentlePulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 50%, ${COLORS.bg1} 100%);
  color: ${COLORS.textPrimary};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${COLORS.borderAccent};
  display: flex;
  align-items: center;
  gap: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-wrap: wrap;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Badge = styled.div`
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 24px;
  font-size: 0.875rem;
  border: 1px solid ${COLORS.borderAccent};
  font-weight: 500;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
  }
`;

const CanvasArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
  padding: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.35), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
  
  @media (max-width: 768px) {
    min-height: 400px;
    padding: 1rem;
  }
`;

const RouteInfo = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    left: 1rem;
    top: 1rem;
  }
`;

const CityLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WinnerBanner = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.95);
  backdrop-filter: blur(20px);
  padding: 2rem 3rem;
  border-radius: 16px;
  border: 2px solid ${({ $color }) => $color};
  box-shadow: 0 0 40px ${({ $color }) => $color}80;
  text-align: center;
  animation: ${gentlePulse} 2s ease-in-out infinite;
  z-index: 100;
`;

const WinnerTitle = styled.h2<{ $color: string }>`
  font-size: 2rem;
  margin: 0 0 1rem 0;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
`;

const WinnerStats = styled.div`
  font-size: 1rem;
  color: ${COLORS.textMuted};
  margin-top: 0.5rem;
`;

const Sidebar = styled.div`
  width: 400px;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  &::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.22); border-radius: 3px; }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PlayButton = styled.button<{ $playing?: boolean }>`
  flex: 1;
  padding: 0.875rem;
  background: ${({ $playing }) => $playing
    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
  };
  border: 1px solid ${({ $playing }) => $playing ? COLORS.warn : COLORS.success};
  border-radius: 12px;
  color: ${COLORS.textPrimary};
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $playing }) => 
      $playing ? 'rgba(251, 191, 36, 0.3)' : 'rgba(34, 197, 94, 0.3)'
    };
  }
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  padding: 0.875rem;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
      : 'rgba(0,0,0,0.3)'
  };
  border: 1px solid ${({ $active }) => $active ? COLORS.accent : COLORS.borderAccent};
  border-radius: 12px;
  color: ${COLORS.textPrimary};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-color: ${COLORS.accent};
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: ${COLORS.textMuted};
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0,0,0,0.3);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${COLORS.accent};
    cursor: pointer;
    box-shadow: 0 0 10px ${COLORS.accent};
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${COLORS.accent};
    cursor: pointer;
    box-shadow: 0 0 10px ${COLORS.accent};
    border: none;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
  color: ${COLORS.textPrimary};
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const ModeButton = styled.button<{ $active?: boolean }>`
  padding: 0.875rem;
  background: ${({ $active }) => 
    $active 
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)'
      : 'rgba(0,0,0,0.3)'
  };
  border: 1px solid ${({ $active }) => $active ? COLORS.accent : COLORS.borderAccent};
  border-radius: 12px;
  color: ${COLORS.textPrimary};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-color: ${COLORS.accent};
  }
`;

const AlgoCheckbox = styled.label<{ $active?: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ $active }) => 
    $active ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'
  };
  border: 1px solid ${({ $active, $color }) => 
    $active ? $color : COLORS.borderAccent
  };
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0,0,0,0.4);
    border-color: ${({ $color }) => $color};
    transform: translateX(4px);
  }

  input {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

const AlgoEmoji = styled.span`
  font-size: 1.75rem;
`;

const AlgoDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const AlgoName = styled.div<{ $color: string; $active?: boolean }>`
  font-weight: 700;
  font-size: 1rem;
  color: ${({ $active, $color }) => $active ? $color : COLORS.textMuted};
  transition: color 0.3s ease;
`;

const AlgoDescription = styled.div`
  font-size: 0.8rem;
  color: ${COLORS.textMuted};
  opacity: 0.7;
`;

const Leaderboard = styled.div<{ $expanded?: boolean }>`
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  overflow: hidden;
  max-height: ${({ $expanded }) => $expanded ? '600px' : '400px'};
  transition: max-height 0.3s ease;
`;

const LeaderboardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(0,0,0,0.4);
  border-bottom: 1px solid ${COLORS.borderAccent};
`;

const LeaderboardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
  color: ${COLORS.textPrimary};
`;

const ExpandButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${COLORS.accent};
  }
`;

const LeaderboardItem = styled.div<{ $rank: number; $isWinner?: boolean; $color: string; $failed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${({ $rank, $isWinner, $failed }) => 
    $failed ? 'rgba(239, 68, 68, 0.05)' :
    $isWinner ? 'rgba(34, 197, 94, 0.1)' :
    $rank === 0 ? 'rgba(251, 191, 36, 0.1)' :
    'transparent'
  };
  border-bottom: 1px solid ${COLORS.borderAccent};
  transition: background 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(59, 130, 246, 0.05);
  }
`;

const Rank = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
`;

const AlgoInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AlgoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AlgoNameInBoard = styled.span<{ $color: string }>`
  font-weight: 700;
  font-size: 1rem;
  color: ${({ $color }) => $color};
`;

const AlgoStatus = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: ${COLORS.textMuted};
  flex-wrap: wrap;
`;

const StatValue = styled.span`
  color: ${COLORS.textPrimary};
  font-weight: 600;
`;

// ==================== REACT COMPONENT ====================
export default function ShortestPathAlgorithmDemo({
  isDark = false,
  isRunning: isRunningProp = false,
  speed: speedProp = 3,
  isTheaterMode = false
}: shortestPathDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SimulationController | null>(null);
  const frameRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(isRunningProp);
  const [localSpeed, setLocalSpeed] = useState(speedProp);
  const [showStats, setShowStats] = useState(true);
  const [expandedStats, setExpandedStats] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>('us-cities');
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>([
    'dijkstra', 'astar', 'bfs', 'dfs', 'bmssp'
  ]);

  const [algorithmStates, setAlgorithmStates] = useState<AlgorithmState[]>([]);
  const [winner, setWinner] = useState<AlgorithmType | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [startCity, setStartCity] = useState(0);
  const [goalCity, setGoalCity] = useState(0);

  // Sync with external props
  useEffect(() => {
    setIsPlaying(isRunningProp);
  }, [isRunningProp]);

  useEffect(() => {
    setLocalSpeed(speedProp);
  }, [speedProp]);

  const algorithmConfigs: Record<AlgorithmType, AlgorithmConfig> = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      emoji: '🔵',
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.6)',
      funFact: 'Guarantees shortest path using distances'
    },
    astar: {
      name: 'A* Search',
      emoji: '⭐',
      color: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.6)',
      funFact: 'Uses heuristics to find path faster'
    },
    bfs: {
      name: 'Breadth-First Search',
      emoji: '🌊',
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.6)',
      funFact: 'Explores level by level'
    },
    dfs: {
      name: 'Depth-First Search',
      emoji: '🌲',
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.6)',
      funFact: 'Dives deep before backtracking'
    },
    bmssp: {
      name: 'BMSSP (2025)',
      emoji: '⚡',
      color: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.6)',
      funFact: 'Bounded Multi-Source • Breaks O(m + n log n) barrier!'
    }
  };

  // Initialize controller and simulation
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!controllerRef.current) {
      controllerRef.current = new SimulationController(canvasRef.current);
    }

    controllerRef.current.initialize(mapMode, selectedAlgos, algorithmConfigs);
    
    // Get initial state
    setAlgorithmStates(controllerRef.current.getAlgorithmStates());
    setWinner(controllerRef.current.getWinner());
    setCities(controllerRef.current.getCities());
    setStartCity(controllerRef.current.getStartCity());
    setGoalCity(controllerRef.current.getGoalCity());
    
    controllerRef.current.render();
  }, [mapMode, selectedAlgos]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!controllerRef.current) return;

      for (let i = 0; i < localSpeed; i++) {
        controllerRef.current.step();
      }
      
      controllerRef.current.render();
      setAlgorithmStates(controllerRef.current.getAlgorithmStates());
      setWinner(controllerRef.current.getWinner());
      
      if (isPlaying) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, localSpeed]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (controllerRef.current && canvasRef.current) {
      controllerRef.current.initialize(mapMode, selectedAlgos, algorithmConfigs);
      setAlgorithmStates(controllerRef.current.getAlgorithmStates());
      setWinner(controllerRef.current.getWinner());
      setCities(controllerRef.current.getCities());
      setStartCity(controllerRef.current.getStartCity());
      setGoalCity(controllerRef.current.getGoalCity());
      controllerRef.current.render();
    }
  };

  const mapModeIcons: Record<MapMode, React.ReactElement> = {
    'us-cities': <Compass size={18} />,
    'metro': <Building2 size={18} />,
    'highway': <Navigation size={18} />,
    'regional': <MapPin size={18} />
  };

  const winnerConfig = winner ? algorithmConfigs[winner] : null;
  const winnerState = algorithmStates.find(a => a.id === winner);

  return (
    <MainContainer>
      <Header>
        <Title>
          <Cpu size={32} />
          City Route Finder
        </Title>
        
        <Badge>
          {cities.length} Cities • {selectedAlgos.length} Algorithms • Random Routes
        </Badge>
      </Header>

      <MainContent>
        <CanvasArea>
          {cities.length > 0 && (
            <RouteInfo>
              <CityLabel $color={COLORS.success}>
                <Home size={16} />
                {cities[startCity]?.name}
              </CityLabel>
              <span>→</span>
              <CityLabel $color={COLORS.danger}>
                <MapPin size={16} />
                {cities[goalCity]?.name}
              </CityLabel>
            </RouteInfo>
          )}
          
          {winner && winnerConfig && winnerState && (
            <WinnerBanner $color={winnerConfig.color}>
              <WinnerTitle $color={winnerConfig.color}>
                <Trophy size={32} />
                {winnerConfig.name} Wins!
              </WinnerTitle>
              <WinnerStats>
                Found route in {winnerState.steps} steps • {winnerState.path.length} cities • {winnerState.distance.toFixed(0)}px distance
              </WinnerStats>
            </WinnerBanner>
          )}
          
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '8px'
            }}
          />
        </CanvasArea>

        <Sidebar>
          <ControlsSection>
            <PlayButton $playing={isPlaying} onClick={handlePlay}>
              {isPlaying ? <><Pause size={22} />Pause</> : <><Play size={22} />Find Routes</>}
            </PlayButton>
            
            <ControlButton onClick={handleReset} title="Reset with new random cities">
              <Shuffle size={22} />
            </ControlButton>
            
            <ControlButton $active={showStats} onClick={() => setShowStats(!showStats)}>
              <BarChart3 size={22} />
            </ControlButton>
          </ControlsSection>

          {showStats && (
            <Leaderboard $expanded={expandedStats}>
              <LeaderboardHeader>
                <LeaderboardTitle>
                  <Trophy size={20} />
                  Algorithm Performance
                </LeaderboardTitle>
                <ExpandButton onClick={() => setExpandedStats(!expandedStats)}>
                  {expandedStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </ExpandButton>
              </LeaderboardHeader>
              
              {[...algorithmStates]
                .sort((a, b) => {
                  if (a.status === 'failed' && b.status !== 'failed') return 1;
                  if (a.status !== 'failed' && b.status === 'failed') return -1;
                  if (a.path.length === 0 && b.path.length === 0) return a.steps - b.steps;
                  if (a.path.length === 0) return 1;
                  if (b.path.length === 0) return -1;
                  return a.steps - b.steps;
                })
                .map((algo, idx) => {
                  const config = algorithmConfigs[algo.id];
                  return (
                    <LeaderboardItem
                      key={algo.id}
                      $rank={idx}
                      $isWinner={algo.status === 'winner'}
                      $color={config.color}
                      $failed={algo.status === 'failed'}
                    >
                      <Rank>
                        {algo.status === 'failed' ? <AlertCircle size={20} color={COLORS.danger} /> :
                         idx === 0 && algo.status === 'winner' ? '🏆' : 
                         idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </Rank>
                      
                      <AlgoInfo>
                        <AlgoHeader>
                          <span style={{ fontSize: '1.5rem' }}>{config.emoji}</span>
                          <AlgoNameInBoard $color={config.color}>
                            {config.name}
                          </AlgoNameInBoard>
                          {algo.status === 'running' && (
                            <AlgoStatus $color={config.color} />
                          )}
                          {algo.status === 'winner' && (
                            <CheckCircle2 size={18} color={COLORS.success} />
                          )}
                        </AlgoHeader>
                        
                        <Stats>
                          <span>Steps: <StatValue>{algo.steps}</StatValue></span>
                          <span>Route: <StatValue>{algo.path.length > 0 ? `${algo.path.length} cities` : '-'}</StatValue></span>
                          {algo.distance > 0 && (
                            <span>Distance: <StatValue>{algo.distance.toFixed(0)}px</StatValue></span>
                          )}
                        </Stats>
                      </AlgoInfo>
                    </LeaderboardItem>
                  );
                })}
            </Leaderboard>
          )}

          <Section>
            <Label>
              <Zap size={16} />
              Speed: {localSpeed}x
            </Label>
            <Slider
              type="range"
              min="1"
              max="10"
              step="1"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(Number(e.target.value))}
            />
          </Section>

          <Section>
            <SectionTitle>
              <Compass size={18} />
              Map Layout
            </SectionTitle>
            
            <ButtonGrid>
              {Object.entries(mapModeIcons).map(([mode, icon]) => (
                <ModeButton
                  key={mode}
                  $active={mapMode === mode}
                  onClick={() => {
                    setMapMode(mode as MapMode);
                  }}
                >
                  {icon}
                  <span style={{ textTransform: 'capitalize' }}>
                    {mode === 'us-cities' ? 'US Cities' : mode}
                  </span>
                </ModeButton>
              ))}
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>
              <Brain size={18} />
              Algorithms
            </SectionTitle>
            
            {Object.entries(algorithmConfigs).map(([id, config]) => (
              <AlgoCheckbox
                key={id}
                $active={selectedAlgos.includes(id as AlgorithmType)}
                $color={config.color}
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
                />
                <AlgoEmoji>{config.emoji}</AlgoEmoji>
                <AlgoDetails>
                  <AlgoName
                    $color={config.color}
                    $active={selectedAlgos.includes(id as AlgorithmType)}
                  >
                    {config.name}
                  </AlgoName>
                  <AlgoDescription>
                    {config.funFact}
                  </AlgoDescription>
                </AlgoDetails>
              </AlgoCheckbox>
            ))}
          </Section>
        </Sidebar>
      </MainContent>
    </MainContainer>
  );
}