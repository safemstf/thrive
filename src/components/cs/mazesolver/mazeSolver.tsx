import React, { useEffect, useState, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { GiLion } from 'react-icons/gi';

const generateMaze = (rows: number, cols: number): number[][] => {
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
  const carve = (r: number, c: number) => {
    const dirs: [number, number][] = [[2,0],[-2,0],[0,2],[0,-2]];
    for (const [dr, dc] of dirs.sort(() => Math.random() - 0.5)) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < rows && nc > 0 && nc < cols && maze[nr][nc] === 1) {
        maze[r + dr/2][c + dc/2] = 0;
        maze[nr][nc] = 0;
        carve(nr, nc);
      }
    }
  };

  maze[1][1] = 0;
  carve(1, 1);

  // random loops
  for (let i = 0; i < rows * cols * 0.04; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (maze[r][c] === 1) {
      const neighbors = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        return nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0;
      });
      if (neighbors.length >= 2) maze[r][c] = 0;
    }
  }

  return maze;
};

const exploreMaze = (maze: number[][], goal: [number, number]): [number, number][] => {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const path: [number, number][] = [];
  const stack: [number, number][] = [[1,1]];
  visited[1][1] = true;
  const dirs: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    path.push([r, c]);
    if (r === goal[0] && c === goal[1]) break;
    const neighbors = dirs
      .map(([dr, dc]) => [r+dr, c+dc] as [number,number])
      .filter(([nr, nc]) => nr >=0 && nr < rows && nc >=0 && nc < cols && !visited[nr][nc] && maze[nr][nc] === 0)
      .sort(() => Math.random() - 0.5);
    for (const [nr, nc] of neighbors) {
      visited[nr][nc] = true;
      stack.push([nr, nc]);
    }
  }
  return path;
};

export default function MazeSolverDemo() {
  const [maze, setMaze] = useState<number[][]>([]);
  const [path, setPath] = useState<[number, number][]>([]);
  const [agentIdx, setAgentIdx] = useState(0);
  const [goal, setGoal] = useState<[number, number] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const intervalRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);

  const placeGoal = (m: number[][]): [number, number] => {
    for (let r = m.length-1; r >=0; r--) {
      for (let c = m[0].length-1; c >=0; c--) {
        if (m[r][c] === 0) return [r, c];
      }
    }
    return [m.length-2, m[0].length-2];
  };

  const resetMaze = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    const rows = 21, cols = 21;
    const m = generateMaze(rows, cols);
    const g = placeGoal(m);
    const p = exploreMaze(m, g);
    setMaze(m);
    setGoal(g);
    setPath(p);
    setAgentIdx(0);

    intervalRef.current = window.setInterval(() => {
      setAgentIdx(i => {
        if (i < p.length - 1) return i + 1;
        clearInterval(intervalRef.current);
        timeoutRef.current = window.setTimeout(resetMaze, 2000);
        return i;
      });
    }, 80);
  };

  useEffect(() => {
    resetMaze();
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const agentPos = useMemo(() => path[agentIdx] ?? null, [path, agentIdx]);

  return (
    <>
      <Wrapper>
        <ClickableArea onClick={() => setShowModal(true)}>
          <Grid rows={maze.length} cols={maze[0]?.length || 0}>
            {maze.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                const isAgent = agentPos?.[0] === r && agentPos?.[1] === c;
                const isPath = path.slice(0, agentIdx+1).some(([pr, pc]) => pr===r && pc===c);
                const isGoal = goal?.[0]===r && goal?.[1]===c;
                return (
                  <Cell key={key} wall={cell===1} path={isPath} goal={isGoal}>
                    {isAgent && <GiLion color="#f90" size={14} />}
                    {isGoal && '🎯'}
                  </Cell>
                );
              })
            )}
          </Grid>
        </ClickableArea>

        <Legend>
          <Item><Box wall={false} /> Open</Item>
          <Item><Box wall={true} /> Wall</Item>
          <Item><Box path={true} /> Explored</Item>
          <Item><GiLion color="#f90" size={16} /> Agent</Item>
          <Item><span>🎯</span> Goal</Item>
        </Legend>

        <Button onClick={resetMaze}>Explore New Map</Button>
      </Wrapper>

      {showModal && (
        <ModalBackdrop onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <LargeGrid rows={maze.length} cols={maze[0]?.length || 0}>
              {maze.map((row, r) =>
                row.map((cell, c) => {
                  const key = `modal-${r}-${c}`;
                  const isAgent = agentPos?.[0] === r && agentPos?.[1] === c;
                  const isPath = path.slice(0, agentIdx+1).some(([pr, pc]) => pr===r && pc===c);
                  const isGoal = goal?.[0]===r && goal?.[1]===c;
                  return (
                    <LargeCell key={key} wall={cell===1} path={isPath} goal={isGoal}>
                      {isAgent && <GiLion color="#f90" size={22} />}
                      {isGoal && '🎯'}
                    </LargeCell>
                  );
                })
              )}
            </LargeGrid>
          </ModalContent>
        </ModalBackdrop>
      )}
    </>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  scale: 0.8;
`;

const ClickableArea = styled.div`
  cursor: pointer;
`;

const Grid = styled.div<{ rows: number; cols: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.cols}, 15px);
  grid-template-rows: repeat(${props => props.rows}, 15px);
  gap: 2px;
`;

const Cell = styled.div<{ wall?: boolean; path?: boolean; goal?: boolean }>`
  width: 15px;
  height: 15px;
  background: ${({ wall, path, goal }) => {
    if (goal) return '#ff0';
    if (wall) return '#333';
    if (path) return '#0f0';
    return '#eee';
  }};
  border: 1px solid #999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Legend = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: white;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: white;
`;

const Box = styled.div<{ wall?: boolean; path?: boolean }>`
  width: 16px;
  height: 16px;
  background: ${({ wall, path }) => wall ? '#333' : path ? '#0f0' : '#eee'};
  border: 1px solid #999;
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  background: #0a84ff;
  color: #fff;
  border: none;
  border-radius: 4px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #111;
  padding: 1rem;
  border-radius: 8px;
  max-height: 90vh;
  overflow: auto;
`;

const LargeGrid = styled(Grid)`
  grid-template-columns: repeat(${props => props.cols}, 24px);
  grid-template-rows: repeat(${props => props.rows}, 24px);
  gap: 3px;
`;

const LargeCell = styled(Cell)`
  width: 24px;
  height: 24px;
  font-size: 1rem;
`;
