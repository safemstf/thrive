import React, { useState, useEffect, useRef } from 'react';
import { readingBank, ReadingPassage } from '@/data/readingBank';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import styled from 'styled-components';

// Shared control button styling
const ControlButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

// Styled Select Trigger
const StyledSelectTrigger = styled(SelectTrigger)`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 9rem;
  background-color: #fff;
  position: relative;
  z-index: 10;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

// Styled Select Content
const StyledSelectContent = styled(SelectContent)`
  background-color: #fff !important;
  z-index: 20;
`;

export function ReadingGame() {
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [paused, setPaused] = useState<boolean>(false);
  const [lexileFilter, setLexileFilter] = useState<'all'|'easy'|'medium'|'hard'>('all');
  const [wordCount, setWordCount] = useState<string>('');
  const timerRef = useRef<number | undefined>(undefined);

  const pickPassage = () => {
    let candidates = readingBank;
    if (lexileFilter === 'easy')    candidates = candidates.filter(p => p.lexile < 1000);
    if (lexileFilter === 'medium')  candidates = candidates.filter(p => p.lexile >= 1000 && p.lexile < 1300);
    if (lexileFilter === 'hard')    candidates = candidates.filter(p => p.lexile >= 1300);
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    setPassage(next);
    setTimeLeft(60);
    setWordCount('');
    setPaused(false);
  };

  useEffect(pickPassage, []);

  useEffect(() => {
    if (!paused && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => window.clearTimeout(timerRef.current);
  }, [timeLeft, paused]);

  if (!passage) return <p>Loading…</p>;

  const onSubmitCount = () => {
    const count = parseInt(wordCount, 10);
    if (!isNaN(count)) {
      alert(`You read ${count} words! 🎉`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <Select onValueChange={(val: string) => setLexileFilter(val as any)}>
          <StyledSelectTrigger>
            <SelectValue placeholder="Filter Lexile" />
          </StyledSelectTrigger>
          <StyledSelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy (&lt;1000)</SelectItem>
            <SelectItem value="medium">Medium (1000–1299)</SelectItem>
            <SelectItem value="hard">Hard (1300+)</SelectItem>
          </StyledSelectContent>
        </Select>

        <ControlButton onClick={pickPassage}>Next Passage</ControlButton>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">{passage.title}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Lexile: <span className="font-medium">{passage.lexile}</span>
        </p>
        <div className="prose max-h-40 overflow-y-auto mb-4">
          {passage.text}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg">
            Time Left: <span className="font-mono">{timeLeft}s</span>
          </p>
          <ControlButton onClick={() => setPaused(p => !p)}>
            {paused ? 'Resume' : 'Pause'}
          </ControlButton>
        </div>
      </div>

      {timeLeft === 0 && (
        <div className="space-y-2">
          <p className="text-green-600 font-semibold">⏱️ Time’s up! How many words did you read?</p>
          <div className="flex space-x-2 items-center">
            <input
              type="number"
              value={wordCount}
              onChange={e => setWordCount(e.target.value)}
              placeholder="Word count"
              className="border rounded px-2 py-1 w-24"
            />
            <ControlButton onClick={() => setPaused(p => !p)}>
              {paused ? 'Resume' : 'Pause'}
            </ControlButton>
            <ControlButton onClick={pickPassage}>
              Next Passage
            </ControlButton>
            <ControlButton onClick={onSubmitCount} disabled={!wordCount}>
              Submit
            </ControlButton>
          </div>
        </div>
      )}
    </div>
  );
}