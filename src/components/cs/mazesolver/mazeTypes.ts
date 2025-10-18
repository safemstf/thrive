export type AlgorithmClass = 'BFS' | 'DFS' | 'AStar' | 'Dijkstra' | 'Greedy' | 'Bidirectional' |'BMSSP';
export type RaceStatus = 'preparing' | 'starting' | 'racing' | 'finished';
export type RaceMode = 'sprint' | 'flags';

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
  collectedFlags: Set<number>;
  targetFlag: number | null;
  flagPath: [number, number][];
}

export interface RaceCommentary {
  time: number;
  message: string;
  type: 'exciting' | 'normal' | 'critical';
}

export interface BettingOdds {
  team: AlgorithmClass;
  odds: string;
  movement: 'up' | 'down' | 'stable';
}

export class RaceTrack {
  private cells: Uint8Array;
  public width: number;
  public height: number;
  public start: [number, number];
  public finish: [number, number];
  public flags: [number, number][];
  
  constructor(width: number, height: number, flagCount: number = 7) {
    this.width = width;
    this.height = height;
    this.cells = new Uint8Array(width * height);
    this.start = [1, 1];
    this.finish = [width - 2, height - 2];
    this.flags = [];
    this.generateProfessionalTrack(flagCount);
  }
  
  private generateProfessionalTrack(flagCount: number) {
    this.cells.fill(1);
    
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
        
        this.setCell((cx + nx) / 2, (cy + ny) / 2, 0);
        this.setCell(nx, ny, 0);
        
        visited.add(`${nx},${ny}`);
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }
    
    this.addOvertakingLanes();
    
    this.setCell(this.start[0], this.start[1], 0);
    this.setCell(this.finish[0], this.finish[1], 0);
    
    this.placeFlags(flagCount);
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
  
  private addOvertakingLanes() {
    const attempts = Math.floor(this.width * this.height * 0.05);
    
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
  
  private placeFlags(count: number) {
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
    
    const sectors = Math.ceil(Math.sqrt(count));
    const sectorWidth = Math.floor(this.width / sectors);
    const sectorHeight = Math.floor(this.height / sectors);
    
    this.flags = [];
    
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
      
      this.flags.push(bestCandidate);
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
  
  // Convert to 2D array for the imported algorithms
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
