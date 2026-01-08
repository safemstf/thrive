// src/components/cs/mazesolver/algorithms.tsx
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
  return `${x},${y}`;
}

function parsePositionKey(key: string): [number, number] {
  const parts = key.split(',');
  return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
}

function validateMazeInput(maze: number[][], start: [number, number], goal: [number, number]): void {
  if (!Array.isArray(maze) || maze.length === 0) {
    throw new Error('Invalid maze: must be non-empty 2D array');
  }
  
  const height = maze.length;
  const width = maze[0].length;
  const [startX, startY] = start;
  const [goalX, goalY] = goal;
  
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    throw new Error(`Start position out of bounds`);
  }
  
  if (goalX < 0 || goalX >= width || goalY < 0 || goalY >= height) {
    throw new Error(`Goal position out of bounds`);
  }
  
  if (maze[startY][startX] !== 0) {
    throw new Error(`Start position is not walkable`);
  }
  
  if (maze[goalY][goalX] !== 0) {
    throw new Error(`Goal position is not walkable`);
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
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function reconstructPath(
  cameFrom: Map<string, [number, number] | null>,
  goalKey: string
): [number, number][] {
  const path: [number, number][] = [];
  let currentKey: string | null = goalKey;
  
  while (currentKey) {
    const position = parsePositionKey(currentKey);
    path.unshift(position);
    const parent = cameFrom.get(currentKey);
    currentKey = parent ? createPositionKey(parent[0], parent[1]) : null;
  }
  
  return path;
}

// ============================================================================
// BREADTH-FIRST SEARCH
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

// ============================================================================
// DEPTH-FIRST SEARCH
// ============================================================================

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

// ============================================================================
// A* SEARCH
// ============================================================================

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
    const cameFrom = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    const startHeuristic = manhattanDistance(start, goal) * heuristicWeight;
    
    openSet.push({ position: start, fScore: startHeuristic });
    gScore.set(startKey, 0);
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
          
          openSet.push({ position: neighbor, fScore: newFScore });
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

// ============================================================================
// DIJKSTRA'S ALGORITHM (FIXED - uses lazy initialization)
// ============================================================================

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
    
    // Use lazy initialization - only process reachable cells
    const openSet: { position: [number, number]; distance: number }[] = [];
    const closedSet = new Set<string>();
    const distances = new Map<string, number>();
    const cameFrom = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    // Only initialize start node - discover others as we go
    openSet.push({ position: start, distance: 0 });
    distances.set(startKey, 0);
    cameFrom.set(startKey, null);
    
    let steps = 0;
    
    while (openSet.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) break;
      
      // Find minimum distance node
      openSet.sort((a, b) => a.distance - b.distance);
      const currentNode = openSet.shift()!;
      const current = currentNode.position;
      const currentKey = createPositionKey(current[0], current[1]);
      
      // Skip if already processed (duplicates may exist in openSet)
      if (closedSet.has(currentKey)) continue;
      
      closedSet.add(currentKey);
      explored.push(current);
      steps++;
      
      // Goal reached
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
      
      const currentDist = distances.get(currentKey) || 0;
      const neighbors = getValidNeighbors(current, maze, false);
      
      for (const neighbor of neighbors) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        if (closedSet.has(neighborKey)) continue;
        
        const tentativeDist = currentDist + 1;
        const existingDist = distances.get(neighborKey);
        
        if (existingDist === undefined || tentativeDist < existingDist) {
          distances.set(neighborKey, tentativeDist);
          cameFrom.set(neighborKey, current);
          openSet.push({ position: neighbor, distance: tentativeDist });
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

// ============================================================================
// GREEDY BEST-FIRST SEARCH
// ============================================================================

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

// ============================================================================
// BIDIRECTIONAL SEARCH
// ============================================================================

export function bidirectionalSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
): AlgorithmResult {
  const startTime = performance.now();
  
  const forwardQueue: [number, number][] = [start];
  const backwardQueue: [number, number][] = [goal];
  const forwardVisited = new Map<string, [number, number] | null>();
  const backwardVisited = new Map<string, [number, number] | null>();
  const explored: [number, number][] = [];
  
  forwardVisited.set(`${start[0]},${start[1]}`, null);
  backwardVisited.set(`${goal[0]},${goal[1]}`, null);
  
  let steps = 0;
  const maxSteps = config?.maxSteps || 50000;
  
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
  while ((forwardQueue.length > 0 || backwardQueue.length > 0) && steps < maxSteps) {
    // Forward step
    if (forwardQueue.length > 0) {
      const current = forwardQueue.shift()!;
      const currentKey = `${current[0]},${current[1]}`;
      explored.push(current);
      steps++;
      
      if (backwardVisited.has(currentKey)) {
        // Build path
        const forwardPath: [number, number][] = [];
        let curr: [number, number] | null = current;
        while (curr) {
          forwardPath.unshift(curr);
          curr = forwardVisited.get(`${curr[0]},${curr[1]}`) || null;
        }
        
        const backwardPath: [number, number][] = [];
        curr = backwardVisited.get(currentKey) || null;
        while (curr) {
          backwardPath.push(curr);
          curr = backwardVisited.get(`${curr[0]},${curr[1]}`) || null;
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
      
      for (const [dx, dy] of directions) {
        const nx = current[0] + dx;
        const ny = current[1] + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && 
            maze[ny][nx] === 0 && !forwardVisited.has(neighborKey)) {
          forwardVisited.set(neighborKey, current);
          forwardQueue.push([nx, ny]);
        }
      }
    }
    
    // Backward step
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
          curr = forwardVisited.get(`${curr[0]},${curr[1]}`) || null;
        }
        
        const backwardPath: [number, number][] = [];
        curr = backwardVisited.get(currentKey) || null;
        while (curr) {
          backwardPath.push(curr);
          curr = backwardVisited.get(`${curr[0]},${curr[1]}`) || null;
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
      
      for (const [dx, dy] of directions) {
        const nx = current[0] + dx;
        const ny = current[1] + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && 
            maze[ny][nx] === 0 && !backwardVisited.has(neighborKey)) {
          backwardVisited.set(neighborKey, current);
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
// JUMP POINT SEARCH (JPS) - FIXED IMPLEMENTATION
// ============================================================================

/**
 * Jump Point Search - an optimization of A* for uniform-cost grids.
 * It identifies "jump points" where the optimal path might change direction,
 * reducing the number of nodes in the open list while still finding optimal paths.
 * 
 * This is a simplified 4-directional JPS that works correctly for cardinal movement.
 */

function isWalkable(maze: number[][], x: number, y: number): boolean {
  const height = maze.length;
  const width = maze[0].length;
  return x >= 0 && x < width && y >= 0 && y < height && maze[y][x] === 0;
}

/**
 * Jump in a cardinal direction until we hit a wall, find the goal,
 * or find a forced neighbor (a position where we might need to turn).
 */
function jump(
  maze: number[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  goal: [number, number],
  explored: Set<string>
): [number, number] | null {
  const nx = x + dx;
  const ny = y + dy;
  
  // Hit a wall
  if (!isWalkable(maze, nx, ny)) {
    return null;
  }
  
  explored.add(`${nx},${ny}`);
  
  // Found goal
  if (nx === goal[0] && ny === goal[1]) {
    return [nx, ny];
  }
  
  // Check for forced neighbors based on direction
  if (dx !== 0 && dy === 0) {
    // Horizontal movement - check for vertical forced neighbors
    // Forced neighbor exists if there's a wall adjacent to us and open space ahead-diagonal
    if ((!isWalkable(maze, nx, ny - 1) && isWalkable(maze, nx + dx, ny - 1)) ||
        (!isWalkable(maze, nx, ny + 1) && isWalkable(maze, nx + dx, ny + 1))) {
      return [nx, ny];
    }
  } else if (dy !== 0 && dx === 0) {
    // Vertical movement - check for horizontal forced neighbors
    if ((!isWalkable(maze, nx - 1, ny) && isWalkable(maze, nx - 1, ny + dy)) ||
        (!isWalkable(maze, nx + 1, ny) && isWalkable(maze, nx + 1, ny + dy))) {
      return [nx, ny];
    }
  }
  
  // Continue jumping in the same direction
  return jump(maze, nx, ny, dx, dy, goal, explored);
}

/**
 * Find successors (jump points) from a given position
 */
function identifySuccessors(
  maze: number[][],
  current: [number, number],
  goal: [number, number],
  explored: Set<string>
): [number, number][] {
  const successors: [number, number][] = [];
  const [x, y] = current;
  
  // Check all 4 cardinal directions
  const directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  
  for (const [dx, dy] of directions) {
    const jumpPoint = jump(maze, x, y, dx, dy, goal, explored);
    if (jumpPoint) {
      successors.push(jumpPoint);
    }
  }
  
  return successors;
}

/**
 * Reconstruct path with intermediate points between jump points
 */
function reconstructJPSPath(
  cameFrom: Map<string, [number, number] | null>,
  goal: [number, number]
): [number, number][] {
  const jumpPoints: [number, number][] = [];
  let curr: [number, number] | null = goal;
  
  // First, get all jump points
  while (curr) {
    jumpPoints.unshift(curr);
    const key = createPositionKey(curr[0], curr[1]);
    curr = cameFrom.get(key) || null;
  }
  
  // Now fill in intermediate cells between jump points
  const fullPath: [number, number][] = [];
  
  for (let i = 0; i < jumpPoints.length; i++) {
    const current = jumpPoints[i];
    
    if (i === 0) {
      fullPath.push(current);
      continue;
    }
    
    const prev = jumpPoints[i - 1];
    const dx = Math.sign(current[0] - prev[0]);
    const dy = Math.sign(current[1] - prev[1]);
    
    // Fill in cells from prev to current (exclusive of prev, inclusive of current)
    let px = prev[0] + dx;
    let py = prev[1] + dy;
    
    while (px !== current[0] || py !== current[1]) {
      fullPath.push([px, py]);
      if (px !== current[0]) px += dx;
      if (py !== current[1]) py += dy;
    }
    fullPath.push(current);
  }
  
  return fullPath;
}

export function bmsspSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config: AlgorithmConfig = {}
): AlgorithmResult {
  const startTime = performance.now();
  const algorithmName = 'JPS';
  
  try {
    validateMazeInput(maze, start, goal);
    
    const maxSteps = config.maxSteps || 50000;
    const timeLimit = config.timeLimit || 30000;
    
    const heuristic = (a: [number, number], b: [number, number]) =>
      Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    
    const openSet: { pos: [number, number]; f: number; g: number }[] = [];
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const cameFrom = new Map<string, [number, number] | null>();
    const exploredSet = new Set<string>();
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    gScore.set(startKey, 0);
    cameFrom.set(startKey, null);
    openSet.push({ pos: start, f: heuristic(start, goal), g: 0 });
    exploredSet.add(startKey);
    
    let steps = 0;
    
    while (openSet.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) break;
      
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = createPositionKey(current.pos[0], current.pos[1]);
      
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);
      steps++;
      
      // Goal check
      if (currentKey === goalKey) {
        const path = reconstructJPSPath(cameFrom, goal);
        const explored: [number, number][] = Array.from(exploredSet).map(parsePositionKey);
        
        return {
          name: algorithmName,
          path,
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      // Find jump point successors
      const successors = identifySuccessors(maze, current.pos, goal, exploredSet);
      
      for (const successor of successors) {
        const successorKey = createPositionKey(successor[0], successor[1]);
        if (closedSet.has(successorKey)) continue;
        
        // Calculate actual distance (Manhattan since we're moving cardinally)
        const dist = Math.abs(successor[0] - current.pos[0]) + Math.abs(successor[1] - current.pos[1]);
        const tentativeG = (gScore.get(currentKey) || 0) + dist;
        const existingG = gScore.get(successorKey);
        
        if (existingG === undefined || tentativeG < existingG) {
          gScore.set(successorKey, tentativeG);
          cameFrom.set(successorKey, current.pos);
          
          const f = tentativeG + heuristic(successor, goal);
          openSet.push({ pos: successor, f, g: tentativeG });
        }
      }
    }
    
    const explored: [number, number][] = Array.from(exploredSet).map(parsePositionKey);
    
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime: performance.now() - startTime
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

// Alias for backward compatibility
export const jpsSearch = bmsspSearch;

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
  const algorithmFunction = algorithmRegistry[algorithmName];
  if (!algorithmFunction) {
    throw new Error(`Unknown algorithm: ${algorithmName}`);
  }
  return algorithmFunction(maze, start, goal, config);
}

export function getAvailableAlgorithms(): AlgorithmClass[] {
  return Object.keys(algorithmRegistry) as AlgorithmClass[];
}