'use client';

import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import styled from 'styled-components';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const WORD_LIST = [
  /* expanded list */
  'apple','bingo','crane','drift','eagle','flute','grasp','hover','input','jolly',
  'knock','lunar','mango','noble','ocean','pride','quest','raven','shark','tiger',
  'urban','vivid','woven','xenon','yacht','zebra','amber','blink','cider','dough',
  'ember','fancy','gloom','hinge','ideal','jelly','karma','lemon','mirth','nexus',
  'orbit','pixel','quill','roast','satin','tempo','union','vapor','youth'
];
const pickSolution = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

export default function Wordle() {
  const [solution, setSolution] = useState(pickSolution);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setSolution(pickSolution);
    setGuesses([]);
    setCurrent('');
    setMessage(null);
  };

  useEffect(() => {
    containerRef.current?.focus();
  }, [solution]);

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    if (message) return;
    if (key === 'Enter') {
      if (current.length !== WORD_LENGTH) return;
      setGuesses(prev => [...prev, current]);
      if (current === solution) setMessage('🎉 You guessed it!');
      else if (guesses.length + 1 >= MAX_GUESSES)
        setMessage(`❌ Out of guesses. Answer was ${solution.toUpperCase()}`);
      setCurrent('');
    } else if (key === 'Backspace') {
      setCurrent(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key) && current.length < WORD_LENGTH) {
      setCurrent(prev => prev + key.toLowerCase());
    }
  };

  const getStatus = (guess: string, idx: number) => {
    const letter = guess[idx];
    if (letter === solution[idx]) return 'correct';
    if (solution.includes(letter)) return 'present';
    return 'absent';
  };

  return (
    <Container
      tabIndex={0}
      onKeyDown={handleKey}
      ref={containerRef}
    >
      <Header>
        <Title>Wordle</Title>
        <ControlButton onClick={reset}>New Game</ControlButton>
      </Header>
      <Grid>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const guess = guesses[row] || '';
          const isCurrent = row === guesses.length;
          return (
            <Row key={row}>
              {Array.from({ length: WORD_LENGTH }).map((_, col) => {
                const char = (isCurrent ? current : guess)[col] || '';
                const status = guess && !isCurrent ? getStatus(guess, col) : undefined;
                return <Cell key={col} $status={status}>{char.toUpperCase()}</Cell>;
              })}
            </Row>
          );
        })}
      </Grid>
      {message && <Message>{message}</Message>}
    </Container>
  );
}

const Container = styled.div`
  background: #fff;
  border: 1px solid #2c2c2c;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  margin: 2rem auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  outline: none;
  font-family: 'Press Start 2P', cursive; /* cool pixel font */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #2c2c2c;
  letter-spacing: 2px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-rows: repeat(${MAX_GUESSES}, 1fr);
  gap: 6px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(${WORD_LENGTH}, 1fr);
  gap: 6px;
`;

const Cell = styled.div<{ $status?: 'correct' | 'present' | 'absent' }>`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  border: 2px solid #2c2c2c;
  background: ${({ $status }) =>
    $status === 'correct' ? '#6aaa64' : $status === 'present' ? '#c9b458' : $status === 'absent' ? '#787c7e' : 'transparent'};
  color: ${({ $status }) => ($status ? '#fff' : '#2c2c2c')};
  text-transform: uppercase;
`;

const ControlButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.5rem 1rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 300;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

const Message = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: #2c2c2c;
`;
