'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from './styles';
import { questionBank, Question } from '@/data/questionBank';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { ReadingGame } from '@/components/thrive/readingGame';

// Leaderboard placeholder
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

const modules = [
  { key: 'math',   label: 'Math' },
  { key: 'reading', label: 'Reading' },
];

type ActiveModule = 'math' | 'reading';

function MathGame() {
  const [level, setLevel] = useState<number>(1);
  const [puzzle, setPuzzle] = useState<Question | null>(null);
  const [input, setInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    const idx = level - 1;
    setPuzzle(idx < questionBank.length ? questionBank[idx] : null);
    setInput('');
    setFeedback(null);
  }, [level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle) return;
    const userVal = parseFloat(input.trim());
    if (!isNaN(userVal) && Math.abs(userVal - puzzle.answer) < 1e-3) {
      setFeedback('Correct!');
      setLevel(l => l + 1);
    } else {
      const correct = Number.isInteger(puzzle.answer)
        ? puzzle.answer.toString()
        : puzzle.answer.toFixed(3);
      setFeedback(`Oops, the right answer was ${correct}`);
    }
  };

  return (
    <div>
      <h2>Math Puzzle (Level {level})</h2>
      {puzzle ? (
        <>
          <div style={{ margin: '1rem 0' }}>
            <MathJax dynamic>
              {'`' + puzzle.question + '`'}
            </MathJax>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
              required
            />
            <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
              Submit
            </button>
          </form>
          {feedback && <p style={{ marginTop: '1rem' }}>{feedback}</p>}
        </>
      ) : (
        <p>No more questions available. Come back later!</p>
      )}
    </div>
  );
}

export default function SATHubPage() {
  const [active, setActive] = useState<ActiveModule>('math');
  const config = { loader: { load: ['input/asciimath', 'output/chtml'] } };

  return (
    <MathJaxContext config={config}>
      <PageWrapper>
        <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {modules.map(m => (
            <button
              key={m.key}
              onClick={() => setActive(m.key as ActiveModule)}
              style={{
                padding: '0.5rem 1rem',
                background: active === m.key ? '#102a43' : '#fff',
                color: active === m.key ? '#fff' : '#102a43',
                borderRadius: '0.5rem',
                border: '1px solid #102a43',
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <section className="exercises">
          {active === 'math' && <MathGame />}
          {active === 'reading' && <ReadingGame />}
          <TopScores />
        </section>

        <div className="cards">
          {/* keep drill cards or other resources here if needed */}
        </div>
      </PageWrapper>
    </MathJaxContext>
  );
}
