import React, { useState, useEffect, useRef } from 'react';
import { readingBank, ReadingPassage } from '@/data/readingBank';

export function ReadingGame() {
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // pick a random passage (or by lexile filter)
    const candidates = readingBank;
    setPassage(candidates[Math.floor(Math.random() * candidates.length)]);
    setTimeLeft(60); // 1 minute per passage
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft]);

  if (!passage) return <p>Loading passage…</p>;

  return (
    <div>
      <h2>Reading Passage: {passage.title}</h2>
      <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
        Lexile level: {passage.lexile}
      </p>
      <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {passage.text}
      </div>
      <p style={{ marginTop: '1rem' }}>
        Time left: <strong>{timeLeft}s</strong>
      </p>
      {timeLeft === 0 && (
        <p style={{ color: 'green' }}>⏱️ Time’s up! How many words did you read?</p>
      )}
    </div>
  );
}
