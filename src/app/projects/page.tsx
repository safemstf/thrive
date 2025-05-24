'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Grid } from 'lucide-react';
import MazeSolverDemo from '@/components/cs/mazesolver/mazeSolver';
import NeuralEcosystem from '@/components/cs/ecosystem/neuralEcosystem';

// --- styled nav & button ---
const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  font-weight: 500;
  border: 2px solid #2c2c2c;
  border-radius: 12px;
  background: ${({ $active }) => ($active ? '#2c2c2c' : 'transparent')};
  color: ${({ $active }) => ($active ? '#f8f8f8' : '#2c2c2c')};
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
  text-align: center;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

type ModuleKey = 'maze' | 'ecosystem';

const modules = [
  { key: 'maze', label: 'Maze Solver', component: <MazeSolverDemo /> },
  { key: 'ecosystem', label: 'Ecosystem', component: <NeuralEcosystem /> },
] as const;

export default function ProjectsPage() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<ModuleKey>('maze');

  useEffect(() => {
    setMounted(true);
    const id = (window as any).requestIdleCallback(
      () => setReady(true),
      { timeout: 2000 }
    );
    return () => (window as any).cancelIdleCallback(id);
  }, []);

  return (
    <div className="bg-gradient-to-br from-background-start to-background-end min-h-screen flex flex-col">
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl font-serif text-foreground">
            <Grid size={28} /> Modern Arcade
          </div>
          <h1 className="font-display text-5xl mt-4">Interactive Demos</h1>
          <p className="mt-2 text-muted">Explore computer science concepts hands-on.</p>
        </div>

        <Nav>
          {modules.map(m => (
            <TabButton
              key={m.key}
              $active={active === m.key}
              onClick={() => setActive(m.key)}
            >
              {m.label}
            </TabButton>
          ))}
        </Nav>

        {ready && (
          <div className="glass p-6 rounded-md shadow-md">
            {modules.find(m => m.key === active)?.component}
          </div>
        )}
      </main>
    </div>
  );
}