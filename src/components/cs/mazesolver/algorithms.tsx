// src\components\cs\mazesolver\algorithms.tsx
import { AlgorithmClass } from "./mazeTypes";

export interface AlgorithmResult {
  name: string;
  path: [number, number][];
  explored: [number, number][];
  steps: number;
  success: boolean;
  executionTime: number;
  memoryUsage?: number;
}

export interface AlgorithmConfig {
  maxSteps?: number;
  allowDiagonal?: boolean;
  heuristicWeight?: number;
  timeLimit?: number;
  enableProfiling?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function createPositionKey(x: number, y: number): string {
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }
  return `${x},${y}`;
}

function parsePositionKey(key: string): [number, number] {
  const parts = key.split(',');
  if (parts.length !== 2) {
    throw new Error(`Invalid position key: ${key}`);
  }
  
  const x = parseInt(parts[0], 10);
  const y = parseInt(parts[1], 10);
  
  if (isNaN(x) || isNaN(y)) {
    throw new Error(`Invalid coordinates in key: ${key}`);
  }
  
  return [x, y];
}

function validateMazeInput(maze: number[][], start: [number, number], goal: [number, number]): void {
  if (!Array.isArray(maze) || maze.length === 0) {
    throw new Error('Invalid maze: must be non-empty 2D array');
  }
  
  if (!Array.isArray(maze[0]) || maze[0].length === 0) {
    throw new Error('Invalid maze: rows must be non-empty arrays');
  }
  
  const height = maze.length;
  const width = maze[0].length;
  
  for (let y = 0; y < height; y++) {
    if (!Array.isArray(maze[y]) || maze[y].length !== width) {
      throw new Error(`Invalid maze: row ${y} has inconsistent length`);
    }
    
    for (let x = 0; x < width; x++) {
      if (maze[y][x] !== 0 && maze[y][x] !== 1) {
        throw new Error(`Invalid maze: cell (${x}, ${y}) must be 0 or 1`);
      }
    }
  }
  
  const [startX, startY] = start;
  const [goalX, goalY] = goal;
  
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    throw new Error(`Start position (${startX}, ${startY}) is out of bounds`);
  }
  
  if (goalX < 0 || goalX >= width || goalY < 0 || goalY >= height) {
    throw new Error(`Goal position (${goalX}, ${goalY}) is out of bounds`);
  }
  
  if (maze[startY][startX] !== 0) {
    throw new Error(`Start position (${startX}, ${startY}) is not walkable`);
  }
  
  if (maze[goalY][goalX] !== 0) {
    throw new Error(`Goal position (${goalX}, ${goalY}) is not walkable`);
  }
}

function getValidNeighbors(
  pos: [number, number], 
  maze: number[][], 
  allowDiagonal: boolean = false
): [number, number][] {
  const [x, y] = pos;
  const neighbors: [number, number][] = [];
  const height = maze.length;
  const width = maze[0].length;
  
  const directions: [number, number][] = allowDiagonal ? [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ] : [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ];
  
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    
    if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 0) {
      neighbors.push([nx, ny]);
    }
  }
  
  return neighbors;
}

function manhattanDistance(a: [number, number], b: [number, number]): number {
  const [x1, y1] = a;
  const [x2, y2] = b;
  
  if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
    throw new Error('Invalid coordinates for distance calculation');
  }
  
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function reconstructPath(
  cameFrom: Map<string, [number, number] | null>,
  goalKey: string
): [number, number][] {
  const path: [number, number][] = [];
  let currentKey: string | null = goalKey;
  const maxPathLength = 10000;
  let pathLength = 0;
  
  while (currentKey && pathLength < maxPathLength) {
    pathLength++;
    
    try {
      const position = parsePositionKey(currentKey);
      path.unshift(position);
      
      const parent = cameFrom.get(currentKey);
      currentKey = parent ? createPositionKey(parent[0], parent[1]) : null;
    } catch (error) {
      console.warn('Error reconstructing path:', error);
      break;
    }
  }
  
  if (pathLength >= maxPathLength) {
    console.warn('Path reconstruction terminated due to length limit');
  }
  
  return path;
}

// ============================================================================
// BFS, DFS, A*, Dijkstra (keeping these concise)
// ============================================================================

export function breadthFirstSearch(
  maze: number[][], 
  start: [number, number], 
  goal: [number, number],
  config: AlgorithmConfig = {}
): AlgorithmResult {
  const startTime = performance.now();
  const algorithmName = 'BFS';
  
  try {
    validateMazeInput(maze, start, goal);
    
    const maxSteps = config.maxSteps || 50000;
    const timeLimit = config.timeLimit || 30000;
    const allowDiagonal = config.allowDiagonal || false;
    
    const queue: [number, number][] = [start];
    const visited = new Set<string>();
    const cameFrom = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    visited.add(startKey);
    cameFrom.set(startKey, null);
    
    let steps = 0;
    
    while (queue.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) break;
      
      const current = queue.shift()!;
      const currentKey = createPositionKey(current[0], current[1]);
      explored.push(current);
      steps++;
      
      if (currentKey === goalKey) {
        return {
          name: algorithmName,
          path: reconstructPath(cameFrom, goalKey),
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const neighbors = getValidNeighbors(current, maze, allowDiagonal);
      for (const neighbor of neighbors) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        if (!visited.has(neighborKey)) {
          visited.add(neighborKey);
          cameFrom.set(neighborKey, current);
          queue.push(neighbor);
        }
      }
    }
    
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: performance.now() - startTime
    };
  }
}

export function depthFirstSearch(
  maze: number[][], 
  start: [number, number], 
  goal: [number, number],
  config: AlgorithmConfig = {}
): AlgorithmResult {
  const startTime = performance.now();
  const algorithmName = 'DFS';
  
  try {
    validateMazeInput(maze, start, goal);
    
    const maxSteps = config.maxSteps || 50000;
    const timeLimit = config.timeLimit || 30000;
    
    const stack: [number, number][] = [start];
    const visited = new Set<string>();
    const cameFrom = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    cameFrom.set(startKey, null);
    
    let steps = 0;
    
    while (stack.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) break;
      
      const current = stack.pop()!;
      const currentKey = createPositionKey(current[0], current[1]);
      
      if (visited.has(currentKey)) continue;
      
      visited.add(currentKey);
      explored.push(current);
      steps++;
      
      if (currentKey === goalKey) {
        return {
          name: algorithmName,
          path: reconstructPath(cameFrom, goalKey),
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const neighbors = getValidNeighbors(current, maze, false);
      for (const neighbor of neighbors.reverse()) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        if (!visited.has(neighborKey) && !cameFrom.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          stack.push(neighbor);
        }
      }
    }
    
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: performance.now() - startTime
    };
  }
}

export function aStarSearch(
  maze: number[][], 
  start: [number, number], 
  goal: [number, number],
  config: AlgorithmConfig = {}
): AlgorithmResult {
  const startTime = performance.now();
  const algorithmName = 'A*';
  
  try {
    validateMazeInput(maze, start, goal);
    
    const maxSteps = config.maxSteps || 50000;
    const timeLimit = config.timeLimit || 30000;
    const heuristicWeight = config.heuristicWeight || 1.0;
    
    const openSet: { position: [number, number]; fScore: number }[] = [];
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const cameFrom = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    const startHeuristic = manhattanDistance(start, goal) * heuristicWeight;
    
    openSet.push({ position: start, fScore: startHeuristic });
    gScore.set(startKey, 0);
    fScore.set(startKey, startHeuristic);
    cameFrom.set(startKey, null);
    
    let steps = 0;
    
    while (openSet.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) break;
      
      openSet.sort((a, b) => a.fScore - b.fScore);
      const currentNode = openSet.shift()!;
      const current = currentNode.position;
      const currentKey = createPositionKey(current[0], current[1]);
      
      if (closedSet.has(currentKey)) continue;
      
      closedSet.add(currentKey);
      explored.push(current);
      steps++;
      
      if (currentKey === goalKey) {
        return {
          name: algorithmName,
          path: reconstructPath(cameFrom, goalKey),
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const neighbors = getValidNeighbors(current, maze, false);
      for (const neighbor of neighbors) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        if (closedSet.has(neighborKey)) continue;
        
        const currentGScore = gScore.get(currentKey) || 0;
        const tentativeGScore = currentGScore + 1;
        
        const existingGScore = gScore.get(neighborKey);
        if (existingGScore === undefined || tentativeGScore < existingGScore) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          
          const heuristic = manhattanDistance(neighbor, goal) * heuristicWeight;
          const newFScore = tentativeGScore + heuristic;
          fScore.set(neighborKey, newFScore);
          
          if (!openSet.some(node => createPositionKey(node.position[0], node.position[1]) === neighborKey)) {
            openSet.push({ position: neighbor, fScore: newFScore });
          }
        }
      }
    }
    
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: performance.now() - startTime
    };
  }
}

export function dijkstraSearch(
  maze: number[][], 
  start: [number, number], 
  goal: [number, number],
  config: AlgorithmConfig = {}
): AlgorithmResult {
  const startTime = performance.now();
  const algorithmName = 'Dijkstra';
  
  try {
    validateMazeInput(maze, start, goal);
    
    const maxSteps = config.maxSteps || 50000;
    const timeLimit = config.timeLimit || 30000;
    
    const unvisited: { position: [number, number]; distance: number }[] = [];
    const distances = new Map<string, number>();
    const previous = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    const height = maze.length;
    const width = maze[0].length;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (maze[y][x] === 0) {
          const pos: [number, number] = [x, y];
          const key = createPositionKey(x, y);
          const distance = key === startKey ? 0 : Infinity;
          
          distances.set(key, distance);
          previous.set(key, null);
          unvisited.push({ position: pos, distance });
        }
      }
    }
    
    let steps = 0;
    
    while (unvisited.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) break;
      
      unvisited.sort((a, b) => a.distance - b.distance);
      const currentNode = unvisited.shift()!;
      const current = currentNode.position;
      const currentKey = createPositionKey(current[0], current[1]);
      
      explored.push(current);
      steps++;
      
      const currentDistance = distances.get(currentKey);
      if (currentDistance === undefined || currentDistance === Infinity) break;
      
      if (currentKey === goalKey) {
        return {
          name: algorithmName,
          path: reconstructPath(previous, goalKey),
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const neighbors = getValidNeighbors(current, maze, false);
      for (const neighbor of neighbors) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        const neighborDistance = distances.get(neighborKey);
        
        if (neighborDistance !== undefined) {
          const altDistance = currentDistance + 1;
          
          if (altDistance < neighborDistance) {
            distances.set(neighborKey, altDistance);
            previous.set(neighborKey, current);
            
            const neighborNode = unvisited.find(node => 
              createPositionKey(node.position[0], node.position[1]) === neighborKey
            );
            if (neighborNode) {
              neighborNode.distance = altDistance;
            }
          }
        }
      }
    }
    
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: performance.now() - startTime
    };
  }
}

export function greedyBestFirstSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
): AlgorithmResult {
  const startTime = performance.now();
  
  const heuristic = (a: [number, number], b: [number, number]) => 
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  
  const openSet: { pos: [number, number]; h: number }[] = [];
  const visited = new Set<string>();
  const cameFrom = new Map<string, [number, number] | null>();
  const explored: [number, number][] = [];
  
  openSet.push({ pos: start, h: heuristic(start, goal) });
  cameFrom.set(`${start[0]},${start[1]}`, null);
  
  let steps = 0;
  const maxSteps = config?.maxSteps || 50000;
  
  while (openSet.length > 0 && steps < maxSteps) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift()!;
    const currentKey = `${current.pos[0]},${current.pos[1]}`;
    
    if (visited.has(currentKey)) continue;
    
    visited.add(currentKey);
    explored.push(current.pos);
    steps++;
    
    if (current.pos[0] === goal[0] && current.pos[1] === goal[1]) {
      const path: [number, number][] = [];
      let curr: [number, number] | null = goal;
      
      while (curr) {
        path.unshift(curr);
        const parent = cameFrom.get(`${curr[0]},${curr[1]}`);
        curr = parent || null;
      }
      
      return {
        name: 'Greedy',
        path,
        explored,
        steps,
        success: true,
        executionTime: performance.now() - startTime
      };
    }
    
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dx, dy] of directions) {
      const nx = current.pos[0] + dx;
      const ny = current.pos[1] + dy;
      
      if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && 
          maze[ny][nx] === 0 && !visited.has(`${nx},${ny}`)) {
        cameFrom.set(`${nx},${ny}`, current.pos);
        openSet.push({ pos: [nx, ny], h: heuristic([nx, ny], goal) });
      }
    }
  }
  
  return {
    name: 'Greedy',
    path: [],
    explored,
    steps,
    success: false,
    executionTime: performance.now() - startTime
  };
}

export function bidirectionalSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
): AlgorithmResult {
  const startTime = performance.now();
  
  const forwardQueue: [number, number][] = [start];
  const backwardQueue: [number, number][] = [goal];
  const forwardVisited = new Set<string>();
  const backwardVisited = new Set<string>();
  const forwardCameFrom = new Map<string, [number, number] | null>();
  const backwardCameFrom = new Map<string, [number, number] | null>();
  const explored: [number, number][] = [];
  
  forwardVisited.add(`${start[0]},${start[1]}`);
  backwardVisited.add(`${goal[0]},${goal[1]}`);
  forwardCameFrom.set(`${start[0]},${start[1]}`, null);
  backwardCameFrom.set(`${goal[0]},${goal[1]}`, null);
  
  let steps = 0;
  const maxSteps = config?.maxSteps || 50000;
  
  while ((forwardQueue.length > 0 || backwardQueue.length > 0) && steps < maxSteps) {
    if (forwardQueue.length > 0) {
      const current = forwardQueue.shift()!;
      const currentKey = `${current[0]},${current[1]}`;
      explored.push(current);
      steps++;
      
      if (backwardVisited.has(currentKey)) {
        const forwardPath: [number, number][] = [];
        let curr: [number, number] | null = current;
        while (curr) {
          forwardPath.unshift(curr);
          const parent = forwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        const backwardPath: [number, number][] = [];
        curr = backwardCameFrom.get(currentKey) || null;
        while (curr) {
          backwardPath.push(curr);
          const parent = backwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        return {
          name: 'Bidirectional',
          path: [...forwardPath, ...backwardPath],
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const nx = current[0] + dx;
        const ny = current[1] + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && 
            maze[ny][nx] === 0 && !forwardVisited.has(neighborKey)) {
          forwardVisited.add(neighborKey);
          forwardCameFrom.set(neighborKey, current);
          forwardQueue.push([nx, ny]);
        }
      }
    }
    
    if (backwardQueue.length > 0) {
      const current = backwardQueue.shift()!;
      const currentKey = `${current[0]},${current[1]}`;
      explored.push(current);
      steps++;
      
      if (forwardVisited.has(currentKey)) {
        const forwardPath: [number, number][] = [];
        let curr: [number, number] | null = current;
        while (curr) {
          forwardPath.unshift(curr);
          const parent = forwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        const backwardPath: [number, number][] = [];
        curr = backwardCameFrom.get(currentKey) || null;
        while (curr) {
          backwardPath.push(curr);
          const parent = backwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        return {
          name: 'Bidirectional',
          path: [...forwardPath, ...backwardPath.slice(1)],
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const nx = current[0] + dx;
        const ny = current[1] + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && 
            maze[ny][nx] === 0 && !backwardVisited.has(neighborKey)) {
          backwardVisited.add(neighborKey);
          backwardCameFrom.set(neighborKey, current);
          backwardQueue.push([nx, ny]);
        }
      }
    }
  }
  
  return {
    name: 'Bidirectional',
    path: [],
    explored,
    steps,
    success: false,
    executionTime: performance.now() - startTime
  };
}

// ============================================================================
// FULL BMSSP IMPLEMENTATION FROM THE PAPER
// ============================================================================

/**
 * Data structure from Lemma 3.3
 * Supports Insert, BatchPrepend, and Pull operations
 */
class BMSSPDataStructure {
  private d0: Array<Array<[string, number]>> = [];
  private d1: Array<Array<[string, number]>> = [];
  private d1UpperBounds: number[] = [];
  private M: number;
  private B: number;
  private keyToValue: Map<string, number> = new Map();

  constructor(M: number, B: number) {
    this.M = M;
    this.B = B;
    this.d1.push([]);
    this.d1UpperBounds.push(B);
  }

  insert(key: string, value: number): void {
    const existingValue = this.keyToValue.get(key);
    if (existingValue !== undefined) {
      if (value >= existingValue) return;
      this.delete(key, existingValue);
    }

    this.keyToValue.set(key, value);

    let blockIdx = 0;
    for (let i = 0; i < this.d1UpperBounds.length; i++) {
      if (this.d1UpperBounds[i] >= value) {
        blockIdx = i;
        break;
      }
    }

    this.d1[blockIdx].push([key, value]);

    if (this.d1[blockIdx].length > this.M) {
      this.split(blockIdx);
    }
  }

  private delete(key: string, value: number): void {
    for (const block of this.d0) {
      const idx = block.findIndex(([k, v]) => k === key && v === value);
      if (idx !== -1) {
        block.splice(idx, 1);
        return;
      }
    }

    for (let i = 0; i < this.d1.length; i++) {
      const block = this.d1[i];
      const idx = block.findIndex(([k, v]) => k === key && v === value);
      if (idx !== -1) {
        block.splice(idx, 1);
        if (block.length === 0 && this.d1.length > 1) {
          this.d1.splice(i, 1);
          this.d1UpperBounds.splice(i, 1);
        }
        return;
      }
    }
  }

  private split(blockIdx: number): void {
    const block = this.d1[blockIdx];
    block.sort((a, b) => a[1] - b[1]);
    const mid = Math.floor(block.length / 2);
    
    const block1 = block.slice(0, mid);
    const block2 = block.slice(mid);
    
    const upperBound1 = block1[block1.length - 1][1];
    
    this.d1[blockIdx] = block1;
    this.d1UpperBounds[blockIdx] = upperBound1;
    
    this.d1.splice(blockIdx + 1, 0, block2);
    this.d1UpperBounds.splice(blockIdx + 1, 0, this.d1UpperBounds[blockIdx + 1] || this.B);
  }

  batchPrepend(pairs: Array<[string, number]>): void {
    if (pairs.length === 0) return;

    const keyMap = new Map<string, number>();
    for (const [key, value] of pairs) {
      const existing = keyMap.get(key);
      if (existing === undefined || value < existing) {
        keyMap.set(key, value);
      }
      
      const globalExisting = this.keyToValue.get(key);
      if (globalExisting === undefined || value < globalExisting) {
        this.keyToValue.set(key, value);
      }
    }

    const uniquePairs = Array.from(keyMap.entries());
    uniquePairs.sort((a, b) => a[1] - b[1]);

    if (uniquePairs.length <= this.M) {
      this.d0.unshift(uniquePairs);
    } else {
      const blocks: Array<Array<[string, number]>> = [];
      for (let i = 0; i < uniquePairs.length; i += Math.ceil(this.M / 2)) {
        blocks.push(uniquePairs.slice(i, i + Math.ceil(this.M / 2)));
      }
      this.d0.unshift(...blocks);
    }
  }

  pull(): { keys: Set<string>, upperBound: number } {
    const result: Array<[string, number]> = [];
    
    while (this.d0.length > 0 && result.length < this.M) {
      const block = this.d0[0];
      if (result.length + block.length <= this.M) {
        result.push(...block);
        this.d0.shift();
      } else {
        const take = this.M - result.length;
        result.push(...block.slice(0, take));
        this.d0[0] = block.slice(take);
        break;
      }
    }
    
    while (this.d1.length > 0 && result.length < this.M) {
      const block = this.d1[0];
      if (result.length + block.length <= this.M) {
        result.push(...block);
        this.d1.shift();
        this.d1UpperBounds.shift();
      } else {
        const take = this.M - result.length;
        result.push(...block.slice(0, take));
        this.d1[0] = block.slice(take);
        break;
      }
    }

    result.sort((a, b) => a[1] - b[1]);
    const finalResult = result.slice(0, Math.min(this.M, result.length));
    
    for (const [key] of finalResult) {
      this.keyToValue.delete(key);
    }

    let upperBound = this.B;
    if (this.d0.length > 0 || this.d1.length > 0) {
      const remaining = [...this.d0.flat(), ...this.d1.flat()];
      if (remaining.length > 0) {
        upperBound = Math.min(...remaining.map(([, v]) => v));
      }
    }

    return {
      keys: new Set(finalResult.map(([k]) => k)),
      upperBound
    };
  }

  isEmpty(): boolean {
    return this.d0.length === 0 && this.d1.every(block => block.length === 0);
  }
}

/**
 * Algorithm 1: FindPivots
 */
function findPivots(
  maze: number[][],
  B: number,
  S: Set<string>,
  bd: Map<string, number>,
  k: number
): { P: Set<string>, W: Set<string> } {
  let W = new Set<string>(S);
  const Wi: Set<string>[] = [new Set(S)];
  
  // Relax for k steps (Line 4-11)
  for (let i = 1; i <= k; i++) {
    const WiNew = new Set<string>();
    
    for (const uKey of Wi[i - 1]) {
      const [ux, uy] = parsePositionKey(uKey);
      const neighbors = getValidNeighbors([ux, uy], maze, false);
      
      for (const [vx, vy] of neighbors) {
        const vKey = createPositionKey(vx, vy);
        const bdU = bd.get(uKey) || Infinity;
        const bdV = bd.get(vKey) || Infinity;
        
        // Line 7: bd[u] + w_uv <= bd[v]
        if (bdU + 1 <= bdV) {
          bd.set(vKey, bdU + 1);
          
          // Line 9: bd[u] + w_uv < B
          if (bdU + 1 < B) {
            WiNew.add(vKey);
            W.add(vKey);
          }
        }
      }
    }
    
    Wi.push(WiNew);
    
    // Line 12-14: Early termination
    if (W.size > k * S.size) {
      return { P: S, W };
    }
  }
  
  // Line 15: Build forest F
  const F = new Map<string, string>();
  const roots = new Set<string>();
  
  for (const vKey of W) {
    const [vx, vy] = parsePositionKey(vKey);
    const bdV = bd.get(vKey) || Infinity;
    
    const neighbors = getValidNeighbors([vx, vy], maze, false);
    for (const [ux, uy] of neighbors) {
      const uKey = createPositionKey(ux, uy);
      const bdU = bd.get(uKey) || Infinity;
      
      if (W.has(uKey) && bdV === bdU + 1) {
        F.set(vKey, uKey);
        break;
      }
    }
    
    if (!F.has(vKey) && S.has(vKey)) {
      roots.add(vKey);
    }
  }
  
  // Line 16: Find pivots with trees >= k vertices
  const P = new Set<string>();
  
  const getTreeSize = (root: string): number => {
    let size = 1;
    const stack = [root];
    const visited = new Set<string>([root]);
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      for (const [child, parent] of F.entries()) {
        if (parent === node && !visited.has(child)) {
          visited.add(child);
          stack.push(child);
          size++;
        }
      }
    }
    
    return size;
  };
  
  for (const root of roots) {
    if (getTreeSize(root) >= k) {
      P.add(root);
    }
  }
  
  return { P, W };
}

/**
 * Algorithm 2: BaseCase
 */
function baseCase(
  maze: number[][],
  B: number,
  S: Set<string>,
  bd: Map<string, number>,
  k: number
): { BPrime: number, U: Set<string> } {
  if (S.size !== 1) {
    throw new Error('BaseCase requires S to be a singleton');
  }
  
  const x = Array.from(S)[0];
  const U0 = new Set<string>([x]);
  
  // Line 3: Initialize binary heap
  const heap: Array<[string, number]> = [[x, bd.get(x) || 0]];
  const inHeap = new Set<string>([x]);
  
  // Line 4-13: Main loop
  while (heap.length > 0 && U0.size < k + 1) {
    heap.sort((a, b) => a[1] - b[1]);
    const [uKey, uDist] = heap.shift()!;
    inHeap.delete(uKey);
    U0.add(uKey);
    
    const [ux, uy] = parsePositionKey(uKey);
    const neighbors = getValidNeighbors([ux, uy], maze, false);
    
    for (const [vx, vy] of neighbors) {
      const vKey = createPositionKey(vx, vy);
      const bdU = bd.get(uKey) || Infinity;
      const bdV = bd.get(vKey) || Infinity;
      
      // Line 8: bd[u] + w_uv <= bd[v] and bd[u] + w_uv < B
      if (bdU + 1 <= bdV && bdU + 1 < B) {
        bd.set(vKey, bdU + 1);
        
        if (!inHeap.has(vKey)) {
          heap.push([vKey, bdU + 1]);
          inHeap.add(vKey);
        } else {
          const idx = heap.findIndex(([k]) => k === vKey);
          if (idx !== -1) {
            heap[idx][1] = bdU + 1;
          }
        }
      }
    }
  }
  
  // Line 14-17: Return
  if (U0.size <= k) {
    return { BPrime: B, U: U0 };
  } else {
    const distances = Array.from(U0).map(key => bd.get(key) || Infinity);
    const BPrime = Math.max(...distances);
    const U = new Set(Array.from(U0).filter(key => (bd.get(key) || Infinity) < BPrime));
    return { BPrime, U };
  }
}

/**
 * Algorithm 3: BMSSP (Main recursive algorithm)
 */
function bmsspRecursive(
  maze: number[][],
  l: number,
  B: number,
  S: Set<string>,
  bd: Map<string, number>,
  k: number,
  t: number
): { BPrime: number, U: Set<string> } {
  // Line 2-3: Base case
  if (l === 0) {
    return baseCase(maze, B, S, bd, k);
  }
  
  // Line 4: FindPivots
  const { P, W } = findPivots(maze, B, S, bd, k);
  
  // Line 5-6: Initialize data structure
  const M = Math.pow(2, (l - 1) * t);
  const D = new BMSSPDataStructure(M, B);
  
  for (const x of P) {
    D.insert(x, bd.get(x) || Infinity);
  }
  
  // Line 7: Initialize
  let i = 0;
  const BPrimeVals: number[] = [];
  let U = new Set<string>();
  
  const minPivotDist = P.size > 0 ? Math.min(...Array.from(P).map(x => bd.get(x) || Infinity)) : B;
  BPrimeVals.push(minPivotDist);
  
  // Line 8-21: Main loop
  while (U.size < k * Math.pow(2, l * t) && !D.isEmpty()) {
    i++;
    
    // Line 10: Pull from D
    const { keys: Si, upperBound: Bi } = D.pull();
    
    // Line 11: Recursive call
    const result = bmsspRecursive(maze, l - 1, Bi, Si, bd, k, t);
    const BPrimei = result.BPrime;
    const Ui = result.U;
    
    // Line 12: Add to U
    for (const u of Ui) {
      U.add(u);
    }
    
    BPrimeVals.push(BPrimei);
    
    // Line 13-20: Relax edges
    const K: Array<[string, number]> = [];
    
    for (const uKey of Ui) {
      const [ux, uy] = parsePositionKey(uKey);
      const neighbors = getValidNeighbors([ux, uy], maze, false);
      
      for (const [vx, vy] of neighbors) {
        const vKey = createPositionKey(vx, vy);
        const bdU = bd.get(uKey) || Infinity;
        const bdV = bd.get(vKey) || Infinity;
        
        // Line 15: bd[u] + w_uv <= bd[v]
        if (bdU + 1 <= bdV) {
          bd.set(vKey, bdU + 1);
          
          // Line 17: bd[u] + w_uv ∈ [Bi, B)
          if (bdU + 1 >= Bi && bdU + 1 < B) {
            D.insert(vKey, bdU + 1);
          } 
          // Line 19: bd[u] + w_uv ∈ [B'i, Bi)
          else if (bdU + 1 >= BPrimei && bdU + 1 < Bi) {
            K.push([vKey, bdU + 1]);
          }
        }
      }
    }
    
    // Line 21: Batch prepend
    const batchPairs: Array<[string, number]> = [...K];
    for (const x of Si) {
      const bdX = bd.get(x) || Infinity;
      if (bdX >= BPrimei && bdX < Bi) {
        batchPairs.push([x, bdX]);
      }
    }
    D.batchPrepend(batchPairs);
  }
  
  // Line 22: Final update
  const BPrime = Math.min(...BPrimeVals, B);
  for (const x of W) {
    const bdX = bd.get(x) || Infinity;
    if (bdX < BPrime) {
      U.add(x);
    }
  }
  
  return { BPrime, U };
}

/**
 * BMSSP wrapper for single-source shortest path
 */
export function bmsspSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config: AlgorithmConfig = {}
): AlgorithmResult {
  const startTime = performance.now();
  const algorithmName = 'BMSSP';
  
  try {
    validateMazeInput(maze, start, goal);
    
    const timeLimit = config.timeLimit || 30000;
    const height = maze.length;
    const width = maze[0].length;
    const n = height * width;
    
    // Parameters from paper
    const t = Math.max(1, Math.floor(Math.log2(Math.log2(n)) / 3)); // t = log^(1/3) n
    const k = Math.max(2, Math.ceil(Math.sqrt(n))); // k parameter
    const l = Math.max(1, Math.ceil(Math.log2(n) / t)); // Depth
    
    // Initialize bd (boundary distances)
    const bd = new Map<string, number>();
    const startKey = createPositionKey(start[0], start[1]);
    bd.set(startKey, 0);
    
    // Initialize all walkable cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (maze[y][x] === 0) {
          const key = createPositionKey(x, y);
          if (!bd.has(key)) {
            bd.set(key, Infinity);
          }
        }
      }
    }
    
    const S = new Set([startKey]);
    const B = Infinity; // No boundary limit
    
    // Run BMSSP
    const { U } = bmsspRecursive(maze, l, B, S, bd, k, t);
    
    // Extract explored cells
    const explored: [number, number][] = Array.from(U).map(parsePositionKey);
    
    // Build path to goal using bd values
    const goalKey = createPositionKey(goal[0], goal[1]);
    const goalDist = bd.get(goalKey);
    
    if (goalDist === undefined || goalDist === Infinity) {
      return {
        name: algorithmName,
        path: [],
        explored,
        steps: explored.length,
        success: false,
        executionTime: performance.now() - startTime
      };
    }
    
    // Reconstruct path
    const path: [number, number][] = [];
    let current = goal;
    let currentKey = goalKey;
    
    while (currentKey !== startKey) {
      path.unshift(current);
      
      const [cx, cy] = current;
      const neighbors = getValidNeighbors([cx, cy], maze, false);
      
      let bestNeighbor: [number, number] | null = null;
      let bestDist = Infinity;
      
      for (const neighbor of neighbors) {
        const nKey = createPositionKey(neighbor[0], neighbor[1]);
        const nDist = bd.get(nKey) || Infinity;
        if (nDist < bestDist) {
          bestDist = nDist;
          bestNeighbor = neighbor;
        }
      }
      
      if (!bestNeighbor) break;
      
      current = bestNeighbor;
      currentKey = createPositionKey(current[0], current[1]);
    }
    
    path.unshift(start);
    
    const executionTime = performance.now() - startTime;
    
    return {
      name: algorithmName,
      path,
      explored,
      steps: explored.length,
      success: path.length > 0,
      executionTime
    };
    
  } catch (error) {
    console.error(`${algorithmName} error:`, error);
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: performance.now() - startTime
    };
  }
}

// ============================================================================
// ALGORITHM REGISTRY
// ============================================================================

export type AlgorithmFunction = (
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
) => AlgorithmResult;

const algorithmRegistry: Record<AlgorithmClass, AlgorithmFunction> = {
  'BFS': breadthFirstSearch,
  'DFS': depthFirstSearch,
  'AStar': aStarSearch,
  'Dijkstra': dijkstraSearch,
  'Greedy': greedyBestFirstSearch,
  'Bidirectional': bidirectionalSearch,
  'BMSSP': bmsspSearch
};

export function runAlgorithm(
  algorithmName: AlgorithmClass,
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
): AlgorithmResult {
  try {
    const algorithmFunction = algorithmRegistry[algorithmName];
    
    if (!algorithmFunction) {
      throw new Error(`Unknown algorithm: ${algorithmName}`);
    }
    
    return algorithmFunction(maze, start, goal, config);
  } catch (error) {
    console.error(`Error running algorithm ${algorithmName}:`, error);
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: 0
    };
  }
}

export function getAvailableAlgorithms(): AlgorithmClass[] {
  return Object.keys(algorithmRegistry) as AlgorithmClass[];
}

export function compareAlgorithms(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  algorithms: AlgorithmClass[] = ['BFS', 'DFS', 'AStar', 'Dijkstra', 'Greedy', 'Bidirectional'],
  config?: AlgorithmConfig
): AlgorithmResult[] {
  const results: AlgorithmResult[] = [];
  
  try {
    validateMazeInput(maze, start, goal);
  } catch (error) {
    console.error('Invalid input for algorithm comparison:', error);
    return algorithms.map(name => ({
      name,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime: 0
    }));
  }
  
  for (const algorithm of algorithms) {
    try {
      const result = runAlgorithm(algorithm, maze, start, goal, config);
      results.push(result);
    } catch (error) {
      console.error(`Error running ${algorithm}:`, error);
      results.push({
        name: algorithm,
        path: [],
        explored: [],
        steps: 0,
        success: false,
        executionTime: 0
      });
    }
  }
  
  return results;
}