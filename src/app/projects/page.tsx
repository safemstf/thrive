// src/app/projects/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MazeSolverDemo from '../../components/cs/mazesolver/mazeSolver';
import { Grid } from 'lucide-react';

export default function ProjectsPage() {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
      setMounted(true);
      const id = (window as any)
        .requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => (window as any).cancelIdleCallback(id);
    }, []);

  const demos = [
    { title: 'Maze Solver', component: <MazeSolverDemo /> },

  ];

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

        {ready && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map(({ title, component }) => (
              <div key={title} className="glass p-4 rounded-md shadow-md flex flex-col h-full">
                <h2 className="text-xl font-serif text-foreground mb-2 text-center">{title}</h2>
                <div className="flex-1">{component}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
