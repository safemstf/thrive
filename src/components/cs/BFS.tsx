import React, { useState, useRef } from 'react';
import styled from 'styled-components';

type Node = { id: number; x: number; y: number };
type Edge = [number, number];
type VisitStep = { visited: number[]; path: number[] };

const WIDTH = 100;
const HEIGHT = 100;
const NODE_COUNT = 15;
const CONNECT_DIST = 0.3; // normalized

function generateGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random(),
    y: Math.random(),
  }));
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (Math.hypot(dx, dy) < CONNECT_DIST) edges.push([i, j]);
    }
  }
  return { nodes, edges };
}

function bfsSteps(nodes: Node[], edges: Edge[]): VisitStep[] {
  const adj = nodes.map(() => [] as number[]);
  edges.forEach(([u,v]) => { adj[u].push(v); adj[v].push(u); });
  const visited = Array(nodes.length).fill(false);
  const parent = Array<number|null>(nodes.length).fill(null);
  const queue = [0];
  visited[0] = true;
  const steps: VisitStep[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    steps.push({ visited: visited.map((v,i) => v ? i : -1).filter(i => i>=0), path: [] });
    if (u === nodes.length - 1) break;
    adj[u].forEach(v => {
      if (!visited[v]) {
        visited[v] = true;
        parent[v] = u;
        queue.push(v);
        steps.push({ visited: visited.map((v,i) => v ? i : -1).filter(i=>i>=0), path: [] });
      }
    });
  }
  const path: number[] = [];
  for (let cur = nodes.length - 1; cur !== null; cur = parent[cur]!) path.unshift(cur);
  steps.push({ visited: path, path });
  return steps;
}

export default function BFSExplorer() {
  const [{ nodes, edges }, setGraph] = useState(generateGraph());
  const [steps, setSteps] = useState<VisitStep[]>([]);
  const [idx, setIdx] = useState(0);
  const timer = useRef<number|null>(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setGraph(generateGraph());
    setSteps([]);
    setIdx(0);
  };

  const start = () => {
    const s = bfsSteps(nodes, edges);
    setSteps(s);
    setIdx(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = window.setInterval(() => setIdx(i => Math.min(i+1, s.length-1)), 300);
  };

  const current = steps[idx] || { visited: [], path: [] };

  return (
    <Wrapper>
      <Header>
        <Title>BFS Explorer <Complexity>O(N+E)</Complexity></Title>
        <Controls>
          <Btn onClick={reset}>Reset</Btn>
          <Btn onClick={start}>{timer.current ? 'Stop' : 'Go'}</Btn>
        </Controls>
      </Header>
      <SvgArea viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {edges.map(([u,v],i) => {
          const a = nodes[u], b = nodes[v];
          return <line key={i} x1={a.x*100} y1={a.y*100} x2={b.x*100} y2={b.y*100} stroke="#888" strokeWidth={0.5}/>;
        })}
        {nodes.map(n => (
          <circle
            key={n.id}
            cx={n.x*100} cy={n.y*100} r={2.5}
            fill={current.path.includes(n.id) ? '#ffd54f' : current.visited.includes(n.id) ? '#0a84ff' : '#ccc'}
            stroke="#333" strokeWidth={0.3}
          />
        ))}
      </SvgArea>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: linear-gradient(to bottom, rgba(255,223,93,0.2), rgba(15,52,96,0.8));
  padding: 0.8rem;
  border-radius: 8px;
  color: #eef;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
`;
const Title = styled.h4`
  margin: 0;
  font-size: 1rem;
`;
const Complexity = styled.span`
  font-size: 0.75rem;
  color: #ffd54f;
  margin-left: 0.4rem;
`;
const Controls = styled.div`
  display: flex;
  gap: 0.4rem;
`;
const Btn = styled.button`
  background: #ffd54f;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  color: #1a1a2e;
  font-size: 0.8rem;
  cursor: pointer;
`;
const SvgArea = styled.svg`
  flex: 1;
  background: #fff;
  border-radius: 4px;
  width: 100%;
  height: 100%;
`;
