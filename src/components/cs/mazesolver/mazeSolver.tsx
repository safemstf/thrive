'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GiLion } from 'react-icons/gi';

type Point = [number, number];

// ─── MAZE GENERATION ──────────────────────────────────────
const generateMaze = (rows: number, cols: number): number[][] => {
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
  function carve(r: number, c: number) {
    const dirs: Point[] = [[2,0],[-2,0],[0,2],[0,-2]];
    dirs.sort(() => Math.random() - .5).forEach(([dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      if (nr>0 && nr<rows && nc>0 && nc<cols && maze[nr][nc]===1) {
        maze[r+dr/2][c+dc/2] = 0;
        maze[nr][nc] = 0;
        carve(nr,nc);
      }
    });
  }
  maze[1][1]=0;
  carve(1,1);
  // add a few loops
  for (let i=0; i<rows*cols*0.04; i++) {
    const r = Math.floor(Math.random()*rows);
    const c = Math.floor(Math.random()*cols);
    if (maze[r][c]===1) {
      const neigh = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        return nr>=0 && nr<rows && nc>=0 && nc<cols && maze[nr][nc]===0;
      });
      if (neigh.length>=2) maze[r][c]=0;
    }
  }
  return maze;
};

// ─── PATHFINDING WITH TRACE ───────────────────────────────────────────
type TraceResult = {
  exploreOrder: Point[];
  solution: Point[];
};

function astarWithTrace(maze: number[][], goal: Point): TraceResult {
  const [gr, gc] = goal;
  const R = maze.length, C = maze[0].length;
  const dirs: Point[] = [[1,0],[-1,0],[0,1],[0,-1]];
  const key = (r:number,c:number) => `${r},${c}`;

  const open = new Set([key(1,1)]);
  const came: Record<string,string> = {};
  const gScore = Array.from({length:R}, ()=>Array(C).fill(Infinity));
  const fScore = Array.from({length:R}, ()=>Array(C).fill(Infinity));
  const exploreOrder: Point[] = [];

  gScore[1][1] = 0;
  fScore[1][1] = Math.abs(gr-1) + Math.abs(gc-1);

  while (open.size) {
    const cur = [...open].reduce((a,b) => {
      const [ar,ac] = a.split(',').map(Number) as Point;
      const [br,bc] = b.split(',').map(Number) as Point;
      return fScore[ar][ac] <= fScore[br][bc] ? a : b;
    });
    open.delete(cur);

    const [r,c] = cur.split(',').map(Number) as Point;
    exploreOrder.push([r,c]);
    if (r===gr && c===gc) break;

    dirs.forEach(([dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=R||nc<0||nc>=C||maze[nr][nc]===1) return;
      const t = gScore[r][c] + 1;
      if (t < gScore[nr][nc]) {
        came[key(nr,nc)] = cur;
        gScore[nr][nc] = t;
        fScore[nr][nc] = t + Math.abs(gr-nr) + Math.abs(gc-nc);
        open.add(key(nr,nc));
      }
    });
  }

  const solution: Point[] = [];
  let p: string|undefined = `${gr},${gc}`;
  while (p && came[p] !== undefined) {
    solution.push(p.split(',').map(Number) as Point);
    p = came[p];
  }
  solution.push([1,1]);
  solution.reverse();

  return { exploreOrder, solution };
}

function bfsWithTrace(maze: number[][], goal: Point): TraceResult {
  const [gr,gc] = goal;
  const R = maze.length, C = maze[0].length;
  const dirs: Point[] = [[1,0],[-1,0],[0,1],[0,-1]];
  const key = (r:number,c:number)=>`${r},${c}`;

  const queue: Point[] = [[1,1]];
  const prev: Record<string,string> = {};
  const visited = Array.from({length:R}, ()=>Array(C).fill(false));
  const exploreOrder: Point[] = [];

  visited[1][1] = true;
  while (queue.length) {
    const [r,c] = queue.shift()!;
    exploreOrder.push([r,c]);
    if (r===gr && c===gc) break;

    dirs.forEach(([dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=R||nc<0||nc>=C||visited[nr][nc]||maze[nr][nc]===1) return;
      visited[nr][nc] = true;
      prev[key(nr,nc)] = `${r},${c}`;
      queue.push([nr,nc]);
    });
  }

  const solution: Point[] = [];
  let p: string|undefined = `${gr},${gc}`;
  while (p && prev[p] !== undefined) {
    solution.push(p.split(',').map(Number) as Point);
    p = prev[p];
  }
  solution.push([1,1]);
  solution.reverse();

  return { exploreOrder, solution };
}

function dfsWithTrace(maze: number[][], goal: Point): TraceResult {
  const [gr,gc] = goal;
  const R = maze.length, C = maze[0].length;
  const dirs: Point[] = [[1,0],[-1,0],[0,1],[0,-1]];
  const key = (r:number,c:number)=>`${r},${c}`;

  const stack: Point[] = [[1,1]];
  const prev: Record<string,string> = {};
  const visited = Array.from({length:R}, ()=>Array(C).fill(false));
  const exploreOrder: Point[] = [];

  visited[1][1] = true;
  while (stack.length) {
    const [r,c] = stack.pop()!;
    exploreOrder.push([r,c]);
    if (r===gr && c===gc) break;

    dirs.forEach(([dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=R||nc<0||nc>=C||visited[nr][nc]||maze[nr][nc]===1) return;
      visited[nr][nc] = true;
      prev[key(nr,nc)] = `${r},${c}`;
      stack.push([nr,nc]);
    });
  }

  const solution: Point[] = [];
  let p: string|undefined = `${gr},${gc}`;
  while (p && prev[p] !== undefined) {
    solution.push(p.split(',').map(Number) as Point);
    p = prev[p];
  }
  solution.push([1,1]);
  solution.reverse();

  return { exploreOrder, solution };
}

// ─── COMPONENT ─────────────────────────────────────────────
export default function MazeSolver() {
  const [rows, setRows] = useState(21);
  const [cols, setCols] = useState(21);
  const [speed, setSpeed] = useState(80);
  const [mode, setMode] = useState<'DFS'|'BFS'|'A*'>('A*');
  const [maze, setMaze] = useState<number[][]>([]);
  const [exploreOrder, setExploreOrder] = useState<Point[]>([]);
  const [solution, setSolution] = useState<Point[]>([]);
  const [agentTrail, setAgentTrail] = useState<Point[]>([]);
  const [idx, setIdx] = useState(0);
  const [goal, setGoal] = useState<Point>([0,0]);
  const [isRunning, setIsRunning] = useState(false);
  const ref = useRef<number | undefined>(undefined);

  const placeGoal = (m:number[][]):Point=>{
    for(let r=m.length-1;r>=0;r--)
      for(let c=m[0].length-1;c>=0;c--)
        if(m[r][c]===0) return [r,c];
    return [m.length-2,m[0].length-2];
  };

  const buildTrail = useCallback((m: number[][], order: Point[]): Point[] => {
    const trail: Point[] = [];
    let curr: Point = [1,1];
    const dirs: Point[] = [[1,0],[-1,0],[0,1],[0,-1]];

    const bfsPath = (start: Point, end: Point): Point[] => {
      const [sr, sc] = start, [er, ec] = end;
      const R = m.length, C = m[0].length;
      const q: Point[] = [[sr,sc]];
      const prev: Record<string,string> = {};
      const vis = Array.from({length:R}, () => Array(C).fill(false));
      vis[sr][sc] = true;
      while (q.length) {
        const [r,c] = q.shift()!;
        if (r===er && c===ec) break;
        for (let [dr,dc] of dirs) {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=R||nc<0||nc>=C||vis[nr][nc]||m[nr][nc]===1) continue;
          vis[nr][nc] = true;
          prev[`${nr},${nc}`] = `${r},${c}`;
          q.push([nr,nc]);
        }
      }
      const path: Point[] = [];
      let pstr = `${er},${ec}`;
      while (pstr) {
        const [pr,pc] = pstr.split(',').map(Number) as Point;
        path.push([pr,pc]);
        pstr = prev[pstr];
      }
      return path.reverse();
    };

    for (const next of order) {
      const segment = bfsPath(curr, next);
      trail.push(...segment.slice(1));
      curr = next;
    }
    return trail;
  }, []);

  const reset = useCallback(() => {
    if (ref.current !== undefined) {
      clearInterval(ref.current);
      setIsRunning(false);
    }

    const m = generateMaze(rows, cols);
    const g = placeGoal(m);

    let trace: TraceResult;
    if (mode === 'BFS') {
      trace = bfsWithTrace(m, g);
    } else if (mode === 'A*') {
      trace = astarWithTrace(m, g);
    } else {
      trace = dfsWithTrace(m, g);
    }

    setMaze(m);
    setGoal(g);
    setExploreOrder(trace.exploreOrder);
    setSolution(trace.solution);
    
    const trail = buildTrail(m, trace.exploreOrder);
    setAgentTrail(trail);
    setIdx(0);

    setIsRunning(true);
    ref.current = window.setInterval(() => {
      setIdx(i => {
        if (i < trail.length - 1) return i + 1;
        clearInterval(ref.current);
        setIsRunning(false);
        return i;
      });
    }, speed);

  }, [rows, cols, mode, speed, buildTrail]);

  useEffect(() => { 
    reset(); 
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [reset]);

  const agent = useMemo(() => agentTrail[idx] ?? null, [agentTrail, idx]);
  const currentExplored = useMemo(() => {
    const explored = new Set<string>();
    for (let i = 0; i <= idx && i < agentTrail.length; i++) {
      const [r, c] = agentTrail[i];
      explored.add(`${r},${c}`);
    }
    return explored;
  }, [agentTrail, idx]);

  const isInSolution = useMemo(() => {
    const solutionSet = new Set(solution.map(([r,c]) => `${r},${c}`));
    return solutionSet;
  }, [solution]);

  return (
    <div style={{
      background: '#f8f8f8',
      color: '#2c2c2c',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: "'Work Sans', sans-serif"
    }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'end',
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '300', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Algorithm
          </label>
          <select 
            value={mode} 
            onChange={e => setMode(e.target.value as any)}
            style={{
              background: 'none',
              border: '1px solid #2c2c2c',
              color: '#2c2c2c',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              fontFamily: "'Work Sans', sans-serif",
              letterSpacing: '1px',
              cursor: 'pointer',
              fontWeight: '300'
            }}
          >
            <option>DFS</option>
            <option>BFS</option>
            <option>A*</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '300', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Size: {rows}×{cols}
          </label>
          <input
            type="range"
            min={15}
            max={41}
            step={2}
            value={rows}
            onChange={e => {
              const v = +e.target.value;
              setRows(v);
              setCols(v);
            }}
            style={{
              width: '150px',
              height: '2px',
              background: '#e0e0e0',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '300', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Speed: {speed}ms
          </label>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={speed}
            onChange={e => setSpeed(+e.target.value)}
            style={{
              width: '150px',
              height: '2px',
              background: '#e0e0e0',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        <button
          onClick={reset}
          disabled={isRunning}
          style={{
            background: 'none',
            border: '1px solid #2c2c2c',
            color: isRunning ? '#999' : '#2c2c2c',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontFamily: "'Work Sans', sans-serif",
            letterSpacing: '1px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            fontWeight: '300',
            borderColor: isRunning ? '#999' : '#2c2c2c'
          }}
          onMouseEnter={e => {
            if (!isRunning) {
              e.currentTarget.style.background = '#2c2c2c';
              e.currentTarget.style.color = '#f8f8f8';
            }
          }}
          onMouseLeave={e => {
            if (!isRunning) {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#2c2c2c';
            }
          }}
        >
          {isRunning ? 'Running...' : 'New Maze'}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
        fontSize: '0.9rem',
        fontWeight: '300',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        <span>Explored: {Math.min(idx + 1, agentTrail.length)} / {exploreOrder.length}</span>
        <span>Solution Length: {solution.length}</span>
        <span>Progress: {Math.round((idx / Math.max(agentTrail.length - 1, 1)) * 100)}%</span>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
        fontSize: '0.8rem',
        fontWeight: '300',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', background: '#2c2c2c', border: '1px solid #ccc' }}></div>
          <span>Wall</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', background: '#e8f4f8', border: '1px solid #ccc' }}></div>
          <span>Explored</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', background: '#4a90e2', border: '1px solid #ccc' }}></div>
          <span>Solution Path</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', background: '#f39c12', border: '1px solid #ccc' }}></div>
          <span>Goal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GiLion size={16} color="#e74c3c" />
          <span>Agent</span>
        </div>
      </div>

      {/* Maze Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 16px)`,
        gridTemplateRows: `repeat(${rows}, 16px)`,
        gap: '1px',
        border: '2px solid #2c2c2c',
        padding: '8px',
        background: '#ccc',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isAgent = agent?.[0] === r && agent?.[1] === c;
            const isGoal = goal[0] === r && goal[1] === c;
            const coord = `${r},${c}`;
            const isExplored = currentExplored.has(coord);
            const inSolution = isInSolution.has(coord);
            
            let bg = '#f8f8f8'; // open space
            if (cell === 1) bg = '#2c2c2c'; // wall
            else if (isGoal) bg = '#f39c12'; // goal
            else if (inSolution && isExplored) bg = '#4a90e2'; // solution path
            else if (isExplored) bg = '#1dd8'; // explored

            return (
              <div
                key={key}
                style={{
                  width: '16px',
                  height: '16px',
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {isAgent && <GiLion color="#e74c3c" size={12} />}
              </div>
            );
          })
        )}
      </div>

      {/* Algorithm Info */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #e0e0e0',
        background: '#fafafa',
        maxWidth: '600px',
        margin: '2rem auto 0',
        fontSize: '0.9rem',
        lineHeight: '1.6'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontWeight: '300', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {mode} Algorithm
        </h3>
        {mode === 'DFS' && (
          <p>Depth-First Search explores as far as possible along each branch before backtracking. It uses a stack (LIFO) and may not find the shortest path.</p>
        )}
        {mode === 'BFS' && (
          <p>Breadth-First Search explores all neighbors at the current depth before moving to nodes at the next depth. It uses a queue (FIFO) and guarantees the shortest path.</p>
        )}
        {mode === 'A*' && (
          <p>A* is an informed search algorithm that uses a heuristic to guide its search. It combines the cost to reach a node with an estimate of the cost to reach the goal, often finding the optimal path more efficiently than BFS.</p>
        )}
      </div>
    </div>
  );
}