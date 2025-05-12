// TSPVisualizer.tsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';

type Point = { id: number; x: number; y: number };
type Step = { visited: number[]; path: number[] };

const NODE_COUNT = 24;

function generatePoints(): Point[] {
  return Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
}

function nnSteps(points: Point[]): Step[] {
  const unvisited = new Set(points.map(p => p.id));
  const path: number[] = [];
  const steps: Step[] = [];
  let current = 0;
  path.push(current);
  unvisited.delete(current);
  steps.push({ visited: [...path], path: [...path] });

  while (unvisited.size) {
    let nearest: number | null = null;
    let bestDist = Infinity;
    const cp = points[current];
    for (let v of unvisited) {
      const vp = points[v];
      const d = Math.hypot(cp.x - vp.x, cp.y - vp.y);
      if (d < bestDist) {
        bestDist = d;
        nearest = v;
      }
    }
    if (nearest === null) break;
    current = nearest;
    path.push(current);
    unvisited.delete(current);
    steps.push({ visited: [...path], path: [...path] });
  }

  path.push(path[0]);
  steps.push({ visited: [...path], path: [...path] });
  return steps;
}

export default function TSPVisualizer() {
  const [points, setPoints] = useState(generatePoints());
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const reset = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    const pts = generatePoints();
    setPoints(pts);
    setSteps([]);
    setStepIdx(0);
  };

  const start = () => {
    const s = nnSteps(points);
    setSteps(s);
    setStepIdx(0);
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setStepIdx(i => Math.min(i + 1, s.length - 1));
    }, 150);
  };

  const current = steps[stepIdx] || { visited: [], path: [] };

  return (
    <Wrapper>
      <Header>
        <Title>Traveling Salesman (NN) <Complexity>O(n²)</Complexity></Title>
        <Controls>
          <Btn onClick={reset}>New</Btn>
          <Btn onClick={start}>Go</Btn>
        </Controls>
      </Header>
      <SvgArea viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {current.path.map((id, i) => {
          const a = points[id];
          const b = points[current.path[i + 1]];
          if (!b) return null;
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#ffd54f"
              strokeWidth={1.2}
            />
          );
        })}
        {points.map(p => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={1.5}
            fill={current.visited.includes(p.id) ? '#0a84ff' : '#ccc'}
            stroke="#333"
            strokeWidth={0.3}
          />
        ))}
      </SvgArea>
    </Wrapper>
  );
}

// Styles
const Wrapper = styled.div`
  background: linear-gradient(to bottom, rgba(255,183,77,0.15), rgba(24,38,53,0.85));
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
  margin-bottom: 0.5rem;
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
