import React, { useState, useRef } from 'react';
import styled from 'styled-components';

type Node = { id: number; x: number; y: number; };
type Edge = [number, number];

type VisitStep = { visited: number[]; path: number[] };

const WIDTH = 250;
const HEIGHT = 400;
const NODE_COUNT = 15;
const CONNECT_DIST = 80;

// Generate random nodes and edges
function generateGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * (WIDTH - 40) + 20,
    y: Math.random() * (HEIGHT - 40) + 20,
  }));
  const edges: Edge[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (Math.hypot(dx, dy) < CONNECT_DIST) edges.push([i, j]);
    }
  }
  return { nodes, edges };
}

// DFS steps
function dfsSteps(nodes: Node[], edges: Edge[], start: number): VisitStep[] {
  const adj = nodes.map(_ => [] as number[]);
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
  
  const visited = Array(nodes.length).fill(false);
  const path: number[] = [];
  const steps: VisitStep[] = [];

  function dfs(u: number) {
    visited[u] = true;
    path.push(u);
    steps.push({ visited: [...visited.keys()].filter(i => visited[i]), path: [...path] });
    
    for (const v of adj[u]) {
      if (!visited[v]) {
        dfs(v);
      }
    }
  }

  dfs(start); // Start DFS from node 0

  return steps;
}

export default function GraphExplorer() {
  const [graph, setGraph] = useState(generateGraph());
  const [steps, setSteps] = useState<VisitStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const reset = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    const g = generateGraph();
    setGraph(g);
    setSteps([]);
    setStepIdx(0);
  };

  const startDFS = () => {
    const s = 0; // start at node 0
    const dfs = dfsSteps(graph.nodes, graph.edges, s);
    setSteps(dfs);
    setStepIdx(0);
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setStepIdx(i => {
        if (i < dfs.length - 1) return i + 1;
        intervalRef.current && clearInterval(intervalRef.current);
        return i;
      });
    }, 300);
  };

  const { nodes, edges } = graph;
  const current = steps[stepIdx] || { visited: [], path: [] };

  return (
    <Container>
      <Controls>
        <Button onClick={reset}>New Graph</Button>
        <Button onClick={startDFS}>Explore (DFS)</Button>
      </Controls>
      <SvgArea width={WIDTH} height={HEIGHT}>
        {edges.map(([u, v], i) => (
          <line
            key={i}
            x1={nodes[u].x} y1={nodes[u].y}
            x2={nodes[v].x} y2={nodes[v].y}
            stroke="#888"
          />
        ))}
        {nodes.map(n => (
          <circle
            key={n.id}
            cx={n.x} cy={n.y} r={8}
            fill={current.path.includes(n.id)
              ? '#ffd54f'
              : current.visited.includes(n.id)
              ? '#0a84ff' : '#ccc'}
            stroke="#555"
          />
        ))}
      </SvgArea>
    </Container>
  );
}

const Container = styled.div`
  background: linear-gradient(to bottom, #ffe57f33, #0f346080);
  border-radius: 8px;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  width: 250px; /* Set fixed width */
  height: auto; /* Let the height grow depending on the content */
`;

const Controls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Button = styled.button`
  background: #1af;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
`;

const SvgArea = styled.svg<{ width: number; height: number }>`
  flex: 1;
  background: #fff;
  border-radius: 4px;
`;
