'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import styled from 'styled-components';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { questionBank, Question } from '@/data/questionBank';
import { ReadingGame } from '@/components/thrive/readingGame';
import Wordle from '@/components/thrive/wordle';
import { PageWrapper } from './styles';
import { MathGameComponent } from '@/components/thrive/mathGame';
// Placeholder component for coming soon games
const ComingSoon = styled.div`
  padding: 2rem;
  text-align: center;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  border: 1px dashed #2c2c2c;
  border-radius: 8px;
  margin: 1rem 0;
`;

// --- styled nav & button ---
const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 300;
  border: 1px solid #2c2c2c;
  border-radius: 12px;
  background: ${({ $active }) => ($active ? '#2c2c2c' : 'transparent')};
  color: ${({ $active }) => ($active ? '#f8f8f8' : '#2c2c2c')};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

// --- modules and types ---
const modules = [
  { key: 'math', label: 'Math' },
  { key: 'reading', label: 'Reading' },
  { key: 'wordle', label: 'Wordle' },
  { key: 'scrabble', label: 'Scrabble' },
  { key: 'arabicWordle', label: 'Wordle Arabic' },
  { key: 'arabicTree', label: 'Arabic Word Tree' },
] as const;

type ActiveModule = typeof modules[number]['key'];

// --- TopScores ---
const TopScores = () => {
  const dummy = [
    { name: 'Alice', level: 23 },
    { name: 'Bob', level: 19 },
    { name: 'Carol', level: 15 },
  ];
  return (
    <div className="leaderboard">
      <h3>Top Scores</h3>
      <ul className="scores">
        {dummy.map((s, i) => (
          <li key={i}>{s.name}: Level {s.level}</li>
        ))}
      </ul>
    </div>
  );
};



// --- Page component ---
export default function SATHubPage() {
  const [active, setActive] = useState<ActiveModule>('math');
  const config = { loader: { load: ['input/asciimath', 'output/chtml'] } };

  return (
    <MathJaxContext config={config}>
      <PageWrapper>
        <Nav>
          {modules.map(m => (
            <TabButton key={m.key} $active={active === m.key} onClick={() => setActive(m.key)}>
              {m.label}
            </TabButton>
          ))}
        </Nav>

        <section className="exercises">
          {active === 'math' && <MathGameComponent/>}
          {active === 'reading' && <ReadingGame />}
          {active === 'wordle' && <Wordle />}
          {active === 'scrabble' && <ComingSoon>Scrabble coming soon!</ComingSoon>}
          {active === 'arabicWordle' && <ComingSoon>Arabic Wordle coming soon!</ComingSoon>}
          {active === 'arabicTree' && <ComingSoon>Arabic Word Tree coming soon!</ComingSoon>}

          <TopScores />
        </section>
      </PageWrapper>
    </MathJaxContext>
  );
}