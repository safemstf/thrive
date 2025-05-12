// app/projects/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled, { css } from 'styled-components';

import AlgorithmVisualizer from '@/components/cs/algorithmVisualizer';
import BFSExplorer from '@/components/cs/BFS';
import CPUPipelineSimulator from '@/components/cs/CPUPipeline';
import GraphExplorer from '@/components/cs/graphExplorer';
import MazeSolverDemo from '@/components/cs/mazesolver/mazeSolver';
import TSPVisualizer from '@/components/cs/tspvisualizer';

// Glassmorphic styles
const glass = css`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: var(--foreground);
  box-shadow: var(--box-shadow-sm);
`;

const MainButton = styled.button`
  ${glass}
  flex: 1;
  min-width: 150px;
  padding: 1.2rem;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
  border: none;
  outline: none;
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--box-shadow-md);
    background: var(--accent-secondary);
    color: white;
  }

  &:active {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProjectsPage: React.FC = () => {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = (window as any).requestIdleCallback(
      () => setReady(true),
      { timeout: 2000 }
    );
    return () => (window as any).cancelIdleCallback(id);
  }, []);

  return (
    <Page>
      <Container>
        <Header>Modern Arcade</Header>
        <MainButton onClick={() => router.push('/')} aria-label="Go Home">
          Home
        </MainButton>
        {ready && (
          <DemoGrid>
            <GoldenCard size="large">
              <DemoTitle>Maze Solver</DemoTitle>
              <MazeSolverDemo />
            </GoldenCard>

            <GoldenCard size="medium">
              <DemoTitle>Algorithm Visualizer</DemoTitle>
              <AlgorithmVisualizer />
            </GoldenCard>

            <GoldenCard size="small">
              <DemoTitle>Graph Explorer</DemoTitle>
              <GraphExplorer />
            </GoldenCard>

            <GoldenCard size="medium">
              <DemoTitle>CPU Pipeline</DemoTitle>
              <CPUPipelineSimulator />
            </GoldenCard>

            <GoldenCard size="large">
              <DemoTitle>TS Problem</DemoTitle>
              <TSPVisualizer />
            </GoldenCard>

            <GoldenCard size="large">
              <DemoTitle>BFS Explorer</DemoTitle>
              <BFSExplorer />
            </GoldenCard>
          </DemoGrid>
        )}
      </Container>
    </Page>
  );
};

const Page = styled.section`
  min-height: 100vh;
  background: linear-gradient(120deg, #10161a, #1a2a35);
  padding: 4rem 2rem;
  display: flex;
  justify-content: center;
  align-items: start;
`;

const Container = styled.div`
  width: 100%;
  max-width: 960px;
`;

const Header = styled.h1`
  font-size: 2.4rem;
  color: #d0f0ff;
  margin-bottom: 2rem;
  text-shadow: 0 0 8px rgba(0,255,255,0.2);
  text-align: center;
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const GoldenCard = styled.div<{ size: 'large' | 'medium' | 'small' | 'tiny' }>`
  background: #182126;
  border-radius: 10px;
  border: 1px solid #2d3e46;
  padding: 1rem;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  min-height: ${({ size }) => {
    switch (size) {
      case 'large': return '500px';
      case 'medium': return '400px';
      case 'small': return '310px';
      case 'tiny': return '200px';
      default: return '300px';
    }
  }};
`;

const DemoTitle = styled.h2`
  font-size: 1.5rem;
  color: #aeeeff;
  margin: 0 0 1rem;
  text-align: center;
`;

export default ProjectsPage;
