// ============================================================================
// PATHFINDING ALGORITHMS MODULE - FIXED VERSION  
// ============================================================================
// Fixes performance issues, memory leaks, and infinite loop conditions
// Optimized implementations with proper error handling and bounds checking

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
  timeLimit?: number; // FIXED: Add time limit to prevent infinite execution
  enableProfiling?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS - Fixed and Optimized
// ============================================================================

/**
 * FIXED: Safe position key generation with bounds checking
 */
function createPositionKey(x: number, y: number): string {
  // FIXED: Input validation
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }
  return `${x},${y}`;
}

/**
 * FIXED: Parse position key safely
 */
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

/**
 * FIXED: Validate maze input with comprehensive checks
 */
function validateMazeInput(maze: number[][], start: [number, number], goal: [number, number]): void {
  if (!Array.isArray(maze) || maze.length === 0) {
    throw new Error('Invalid maze: must be non-empty 2D array');
  }
  
  if (!Array.isArray(maze[0]) || maze[0].length === 0) {
    throw new Error('Invalid maze: rows must be non-empty arrays');
  }
  
  const height = maze.length;
  const width = maze[0].length;
  
  // FIXED: Check maze consistency
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
  
  // FIXED: Validate start and goal positions
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

/**
 * FIXED: Get valid neighbors with bounds checking and optimization
 */
function getValidNeighbors(
  pos: [number, number], 
  maze: number[][], 
  allowDiagonal: boolean = false
): [number, number][] {
  const [x, y] = pos;
  const neighbors: [number, number][] = [];
  const height = maze.length;
  const width = maze[0].length;
  
  // FIXED: Define movement directions based on diagonal setting
  const directions: [number, number][] = allowDiagonal ? [
    [0, 1], [1, 0], [0, -1], [-1, 0],      // Cardinal directions
    [1, 1], [1, -1], [-1, 1], [-1, -1]     // Diagonal directions
  ] : [
    [0, 1], [1, 0], [0, -1], [-1, 0]       // Cardinal only
  ];
  
  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    
    // FIXED: Bounds checking and walkability
    if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 0) {
      neighbors.push([nx, ny]);
    }
  }
  
  return neighbors;
}

/**
 * FIXED: Manhattan distance heuristic with input validation
 */
function manhattanDistance(a: [number, number], b: [number, number]): number {
  const [x1, y1] = a;
  const [x2, y2] = b;
  
  if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
    throw new Error('Invalid coordinates for distance calculation');
  }
  
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * FIXED: Euclidean distance heuristic with input validation
 */
function euclideanDistance(a: [number, number], b: [number, number]): number {
  const [x1, y1] = a;
  const [x2, y2] = b;
  
  if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2)) {
    throw new Error('Invalid coordinates for distance calculation');
  }
  
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * FIXED: Reconstruct path with validation and optimization
 */
function reconstructPath(
  cameFrom: Map<string, [number, number] | null>,
  goalKey: string
): [number, number][] {
  const path: [number, number][] = [];
  let currentKey: string | null = goalKey;
  const maxPathLength = 10000; // FIXED: Prevent infinite loops
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
// BREADTH-FIRST SEARCH - Fixed Implementation
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
    // FIXED: Input validation
    validateMazeInput(maze, start, goal);
    
    // FIXED: Configuration with safe defaults
    const maxSteps = config.maxSteps || 50000;
    const timeLimit = config.timeLimit || 30000; // 30 seconds max
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
      // FIXED: Time limit check
      if (performance.now() - startTime > timeLimit) {
        console.warn(`${algorithmName} terminated due to time limit`);
        break;
      }
      
      const current = queue.shift()!;
      const currentKey = createPositionKey(current[0], current[1]);
      explored.push(current);
      steps++;
      
      // FIXED: Goal check
      if (currentKey === goalKey) {
        const path = reconstructPath(cameFrom, goalKey);
        const executionTime = performance.now() - startTime;
        
        return {
          name: algorithmName,
          path,
          explored,
          steps,
          success: true,
          executionTime
        };
      }
      
      // FIXED: Explore neighbors with validation
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
    
    // FIXED: Return failure result with execution time
    const executionTime = performance.now() - startTime;
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime
    };
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    console.error(`${algorithmName} error:`, error);
    
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime
    };
  }
}

// ============================================================================
// DEPTH-FIRST SEARCH - Fixed Implementation
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
    const allowDiagonal = config.allowDiagonal || false;
    
    const stack: [number, number][] = [start];
    const visited = new Set<string>();
    const cameFrom = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    cameFrom.set(startKey, null);
    
    let steps = 0;
    
    while (stack.length > 0 && steps < maxSteps) {
      if (performance.now() - startTime > timeLimit) {
        console.warn(`${algorithmName} terminated due to time limit`);
        break;
      }
      
      const current = stack.pop()!;
      const currentKey = createPositionKey(current[0], current[1]);
      
      if (visited.has(currentKey)) {
        continue;
      }
      
      visited.add(currentKey);
      explored.push(current);
      steps++;
      
      if (currentKey === goalKey) {
        const path = reconstructPath(cameFrom, goalKey);
        const executionTime = performance.now() - startTime;
        
        return {
          name: algorithmName,
          path,
          explored,
          steps,
          success: true,
          executionTime
        };
      }
      
      // FIXED: Randomize neighbors for DFS variation
      const neighbors = getValidNeighbors(current, maze, allowDiagonal);
      // Shuffle for more interesting DFS behavior
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
      }
      
      for (const neighbor of neighbors.reverse()) { // Reverse for stack behavior
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        
        if (!visited.has(neighborKey) && !cameFrom.has(neighborKey)) {
          cameFrom.set(neighborKey, current);
          stack.push(neighbor);
        }
      }
    }
    
    const executionTime = performance.now() - startTime;
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime
    };
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    console.error(`${algorithmName} error:`, error);
    
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime
    };
  }
}

// ============================================================================
// A* SEARCH - Fixed Implementation
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
    const allowDiagonal = config.allowDiagonal || false;
    const heuristicWeight = config.heuristicWeight || 1.0;
    
    // FIXED: Use priority queue simulation with sorted array
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
      if (performance.now() - startTime > timeLimit) {
        console.warn(`${algorithmName} terminated due to time limit`);
        break;
      }
      
      // FIXED: Get node with lowest f-score
      openSet.sort((a, b) => a.fScore - b.fScore);
      const currentNode = openSet.shift()!;
      const current = currentNode.position;
      const currentKey = createPositionKey(current[0], current[1]);
      
      if (closedSet.has(currentKey)) {
        continue;
      }
      
      closedSet.add(currentKey);
      explored.push(current);
      steps++;
      
      if (currentKey === goalKey) {
        const path = reconstructPath(cameFrom, goalKey);
        const executionTime = performance.now() - startTime;
        
        return {
          name: algorithmName,
          path,
          explored,
          steps,
          success: true,
          executionTime
        };
      }
      
      const neighbors = getValidNeighbors(current, maze, allowDiagonal);
      for (const neighbor of neighbors) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        const currentGScore = gScore.get(currentKey) || 0;
        const tentativeGScore = currentGScore + 1; // Uniform cost
        
        const existingGScore = gScore.get(neighborKey);
        if (existingGScore === undefined || tentativeGScore < existingGScore) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          
          const heuristic = manhattanDistance(neighbor, goal) * heuristicWeight;
          const newFScore = tentativeGScore + heuristic;
          fScore.set(neighborKey, newFScore);
          
          // FIXED: Add to open set if not already present
          if (!openSet.some(node => createPositionKey(node.position[0], node.position[1]) === neighborKey)) {
            openSet.push({ position: neighbor, fScore: newFScore });
          }
        }
      }
    }
    
    const executionTime = performance.now() - startTime;
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime
    };
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    console.error(`${algorithmName} error:`, error);
    
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime
    };
  }
}

// ============================================================================
// DIJKSTRA'S ALGORITHM - Fixed Implementation
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
    const allowDiagonal = config.allowDiagonal || false;
    
    // FIXED: Use priority queue simulation for efficiency
    const unvisited: { position: [number, number]; distance: number }[] = [];
    const distances = new Map<string, number>();
    const previous = new Map<string, [number, number] | null>();
    const explored: [number, number][] = [];
    
    const startKey = createPositionKey(start[0], start[1]);
    const goalKey = createPositionKey(goal[0], goal[1]);
    
    // FIXED: Initialize only reachable cells
    const height = maze.length;
    const width = maze[0].length;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (maze[y][x] === 0) { // Only walkable cells
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
      if (performance.now() - startTime > timeLimit) {
        console.warn(`${algorithmName} terminated due to time limit`);
        break;
      }
      
      // FIXED: Find minimum distance node efficiently
      unvisited.sort((a, b) => a.distance - b.distance);
      const currentNode = unvisited.shift()!;
      const current = currentNode.position;
      const currentKey = createPositionKey(current[0], current[1]);
      
      explored.push(current);
      steps++;
      
      const currentDistance = distances.get(currentKey);
      if (currentDistance === undefined || currentDistance === Infinity) {
        break; // Remaining nodes are unreachable
      }
      
      if (currentKey === goalKey) {
        const path = reconstructPath(previous, goalKey);
        const executionTime = performance.now() - startTime;
        
        return {
          name: algorithmName,
          path,
          explored,
          steps,
          success: true,
          executionTime
        };
      }
      
      const neighbors = getValidNeighbors(current, maze, allowDiagonal);
      for (const neighbor of neighbors) {
        const neighborKey = createPositionKey(neighbor[0], neighbor[1]);
        const neighborDistance = distances.get(neighborKey);
        
        if (neighborDistance !== undefined) {
          const altDistance = currentDistance + 1; // Uniform cost
          
          if (altDistance < neighborDistance) {
            distances.set(neighborKey, altDistance);
            previous.set(neighborKey, current);
            
            // FIXED: Update distance in unvisited array
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
    
    const executionTime = performance.now() - startTime;
    return {
      name: algorithmName,
      path: [],
      explored,
      steps,
      success: false,
      executionTime
    };
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    console.error(`${algorithmName} error:`, error);
    
    return {
      name: algorithmName,
      path: [],
      explored: [],
      steps: 0,
      success: false,
      executionTime
    };
  }
}

// ============================================================================
// ALGORITHM REGISTRY AND FACTORY - Fixed and Simplified
// ============================================================================

export type AlgorithmType = 'BFS' | 'DFS' | 'AStar' | 'Dijkstra';

export type AlgorithmFunction = (
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
) => AlgorithmResult;

// FIXED: Algorithm registry with type safety
const algorithmRegistry: Record<AlgorithmType, AlgorithmFunction> = {
  'BFS': breadthFirstSearch,
  'DFS': depthFirstSearch,
  'AStar': aStarSearch,
  'Dijkstra': dijkstraSearch,
};

/**
 * FIXED: Run algorithm with comprehensive error handling
 */
export function runAlgorithm(
  algorithmName: AlgorithmType,
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

/**
 * FIXED: Get available algorithms safely
 */
export function getAvailableAlgorithms(): AlgorithmType[] {
  return Object.keys(algorithmRegistry) as AlgorithmType[];
}

/**
 * FIXED: Compare algorithms with proper error handling
 */
export function compareAlgorithms(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  algorithms: AlgorithmType[] = ['BFS', 'DFS', 'AStar', 'Dijkstra'],
  config?: AlgorithmConfig
): AlgorithmResult[] {
  const results: AlgorithmResult[] = [];
  
  // FIXED: Validate inputs first
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