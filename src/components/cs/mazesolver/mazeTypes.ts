// ============================================================================
// TYPES & INTERFACES - Pathfinding Algorithm Visualization
// ============================================================================

export type AlgorithmClass = 'BFS' | 'DFS' | 'AStar' | 'Dijkstra' | 'Greedy' | 'Bidirectional' | 'BMSSP';
export type RaceStatus = 'preparing' | 'starting' | 'racing' | 'finished';
export type RaceMode = 'sprint' | 'waypoints';
export type EnvironmentMode = 'maze' | 'network';

// ============================================================================
// RACING TEAM / ALGORITHM CONFIGURATION
// ============================================================================

export interface RacingTeam {
  id: AlgorithmClass;
  name: string;
  number: number;
  stable: string;
  jockeyName: string;
  color: string;
  accentColor: string;
  strategy: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  stamina: number;
}

// ============================================================================
// NETWORK/MAP MODE TYPES
// ============================================================================

export interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  connections: string[];
  isStart?: boolean;
  isFinish?: boolean;
  isWaypoint?: boolean;
  waypointIndex?: number;
}

export interface MapEdge {
  from: string;
  to: string;
  weight: number;
}

export interface NetworkMap {
  nodes: Map<string, MapNode>;
  edges: MapEdge[];
  width: number;
  height: number;
  start: string;
  finish: string;
  waypoints: string[];
}

// ============================================================================
// RACER STATE
// ============================================================================

export interface Racer {
  team: RacingTeam;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  heading: number;
  path: [number, number][];
  explored: Set<string>;
  currentTarget: number;
  lapTime: number;
  bestLap: number;
  totalDistance: number;
  currentSpeed: number;
  tire: number;
  fuel: number;
  finished: boolean;
  finishTime: number;
  trail: { x: number; y: number; alpha: number }[];
  telemetry: {
    speed: number[];
    exploration: number[];
    efficiency: number;
  };
  collectedWaypoints: Set<number>;
  targetWaypoint: number | null;
  waypointPath: [number, number][];
  // Network mode specific
  nodePath?: string[];
  currentNodeIndex?: number;
}

// ============================================================================
// UI & COMMENTARY
// ============================================================================

export interface RaceCommentary {
  time: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'milestone';
}

export interface BettingOdds {
  team: AlgorithmClass;
  odds: string;
  movement: 'up' | 'down' | 'stable';
}

// ============================================================================
// SIMULATION CONFIGURATION
// ============================================================================

export interface SimulationConfig {
  environmentMode: EnvironmentMode;
  raceMode: RaceMode;
  waypointCount: number;
  mazeSize: number;
  nodeCount: number;
  animationSpeed: number;
}

// ============================================================================
// MAZE GENERATION
// ============================================================================

export class RaceTrack {
  private cells: Uint8Array;
  public width: number;
  public height: number;
  public start: [number, number];
  public finish: [number, number];
  public waypoints: [number, number][];

  constructor(width: number, height: number, waypointCount: number = 7) {
    this.width = width;
    this.height = height;
    this.cells = new Uint8Array(width * height);
    this.start = [1, 1];
    this.finish = [width - 2, height - 2];
    this.waypoints = [];
    this.generateMaze(waypointCount);
  }

  private generateMaze(waypointCount: number) {
    // Initialize all cells as walls
    this.cells.fill(1);

    // Recursive backtracker maze generation
    const stack: [number, number][] = [];
    const visited = new Set<string>();

    const startX = 1, startY = 1;
    stack.push([startX, startY]);
    visited.add(`${startX},${startY}`);
    this.setCell(startX, startY, 0);

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(cx, cy, visited);

      if (neighbors.length > 0) {
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Carve passage
        this.setCell((cx + nx) / 2, (cy + ny) / 2, 0);
        this.setCell(nx, ny, 0);

        visited.add(`${nx},${ny}`);
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    // Add extra passages for multiple paths
    this.addExtraPassages();

    // Ensure start and finish are open
    this.setCell(this.start[0], this.start[1], 0);
    this.setCell(this.finish[0], this.finish[1], 0);

    // Place waypoints
    this.placeWaypoints(waypointCount);
  }

  private getUnvisitedNeighbors(x: number, y: number, visited: Set<string>): [number, number][] {
    const neighbors: [number, number][] = [];
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx > 0 && nx < this.width - 1 &&
        ny > 0 && ny < this.height - 1 &&
        !visited.has(`${nx},${ny}`)) {
        neighbors.push([nx, ny]);
      }
    }

    return neighbors;
  }

  private addExtraPassages() {
    const attempts = Math.floor(this.width * this.height * 0.06);

    for (let i = 0; i < attempts; i++) {
      const x = 2 + Math.floor(Math.random() * (this.width - 4));
      const y = 2 + Math.floor(Math.random() * (this.height - 4));

      if (this.getCell(x, y) === 1) {
        let openNeighbors = 0;
        for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          if (this.getCell(x + dx, y + dy) === 0) openNeighbors++;
        }

        if (openNeighbors >= 2) {
          this.setCell(x, y, 0);
        }
      }
    }
  }

  private placeWaypoints(count: number) {
    const candidates: [number, number][] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getCell(x, y) === 0) {
          const isStart = x === this.start[0] && y === this.start[1];
          const isFinish = x === this.finish[0] && y === this.finish[1];

          if (!isStart && !isFinish) {
            candidates.push([x, y]);
          }
        }
      }
    }

    // Distribute waypoints across sectors for good coverage
    const sectors = Math.ceil(Math.sqrt(count));
    const sectorWidth = Math.floor(this.width / sectors);
    const sectorHeight = Math.floor(this.height / sectors);

    this.waypoints = [];

    for (let i = 0; i < count && candidates.length > 0; i++) {
      const sectorX = (i % sectors) * sectorWidth + sectorWidth / 2;
      const sectorY = Math.floor(i / sectors) * sectorHeight + sectorHeight / 2;

      let bestCandidate = candidates[0];
      let bestDist = Infinity;

      for (const candidate of candidates) {
        const dist = Math.abs(candidate[0] - sectorX) + Math.abs(candidate[1] - sectorY);
        if (dist < bestDist) {
          bestDist = dist;
          bestCandidate = candidate;
        }
      }

      this.waypoints.push(bestCandidate);
      candidates.splice(candidates.indexOf(bestCandidate), 1);
    }
  }

  getCell(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 1;
    return this.cells[y * this.width + x];
  }

  setCell(x: number, y: number, value: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[y * this.width + x] = value;
    }
  }

  to2DArray(): number[][] {
    const maze: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.getCell(x, y));
      }
      maze.push(row);
    }
    return maze;
  }
}

// ============================================================================
// NETWORK MAP GENERATION
// ============================================================================

export function generateNetworkMap(nodeCount: number, waypointCount: number): NetworkMap {
  const nodes = new Map<string, MapNode>();
  const edges: MapEdge[] = [];
  const width = 800;
  const height = 500;
  const padding = 50;

  // Node name pools
  const nodeNames = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi',
    'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
    'Nova', 'Apex', 'Nexus', 'Core', 'Hub', 'Node', 'Link', 'Port',
    'Gate', 'Relay', 'Beacon', 'Tower', 'Base', 'Station', 'Terminal', 'Junction'
  ];

  // Generate nodes with minimum spacing
  const usedPositions: { x: number; y: number }[] = [];
  const minDist = 70;

  for (let i = 0; i < nodeCount; i++) {
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      x = padding + Math.random() * (width - 2 * padding);
      y = padding + Math.random() * (height - 2 * padding);
      attempts++;
    } while (
      attempts < maxAttempts &&
      usedPositions.some(p => Math.hypot(p.x - x, p.y - y) < minDist)
    );

    usedPositions.push({ x, y });

    const id = `node_${i}`;
    nodes.set(id, {
      id,
      name: nodeNames[i % nodeNames.length],
      x,
      y,
      connections: []
    });
  }

  // Generate edges using proximity-based connections
  const nodeArray = Array.from(nodes.values());

  for (let i = 0; i < nodeArray.length; i++) {
    const node = nodeArray[i];
    const distances = nodeArray
      .filter((_, j) => j !== i)
      .map(other => ({
        node: other,
        dist: Math.hypot(node.x - other.x, node.y - other.y)
      }))
      .sort((a, b) => a.dist - b.dist);

    // Connect to 2-4 nearest neighbors
    const connectionCount = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < Math.min(connectionCount, distances.length); j++) {
      const other = distances[j].node;

      if (!node.connections.includes(other.id)) {
        node.connections.push(other.id);
        other.connections.push(node.id);

        edges.push({
          from: node.id,
          to: other.id,
          weight: Math.round(distances[j].dist / 10)
        });
      }
    }
  }

  // Set start and finish (maximally far apart)
  let maxDist = 0;
  let startId = nodeArray[0].id;
  let finishId = nodeArray[1].id;

  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const dist = Math.hypot(
        nodeArray[i].x - nodeArray[j].x,
        nodeArray[i].y - nodeArray[j].y
      );
      if (dist > maxDist) {
        maxDist = dist;
        startId = nodeArray[i].id;
        finishId = nodeArray[j].id;
      }
    }
  }

  nodes.get(startId)!.isStart = true;
  nodes.get(finishId)!.isFinish = true;

  // Place waypoints
  const waypointNodeIds: string[] = [];
  const availableNodes = nodeArray.filter(n => n.id !== startId && n.id !== finishId);

  // Shuffle for random distribution
  for (let i = availableNodes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableNodes[i], availableNodes[j]] = [availableNodes[j], availableNodes[i]];
  }

  for (let i = 0; i < Math.min(waypointCount, availableNodes.length); i++) {
    const node = availableNodes[i];
    node.isWaypoint = true;
    node.waypointIndex = i;
    waypointNodeIds.push(node.id);
  }

  return {
    nodes,
    edges,
    width,
    height,
    start: startId,
    finish: finishId,
    waypoints: waypointNodeIds
  };
}