// src/components/thrive/mathGame.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import styled from 'styled-components';
import { MathJax } from 'better-react-mathjax';
import { questionBank, Question } from '@/data/questionBank';
import { evaluateAnswer } from '@/utils/mathUtils';

const Container = styled.div`
  font-family: 'Work Sans', sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  color: #2c2c2c;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  color: #2c2c2c;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 400;
  letter-spacing: 0.5px;
`;

const LevelIndicator = styled.div`
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuestionContainer = styled.div`
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .MathJax {
    font-size: 1.4rem !important;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
  align-items: center;
`;

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  text-align: center;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
`;

const Button = styled.button`
  background: #2c2c2c;
  border: none;
  color: white;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 400;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(44, 44, 44, 0.2);
  
  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(44, 44, 44, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Feedback = styled.div<{ $correct: boolean }>`
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  font-size: 1.1rem;
  max-width: 400px;
  width: 100%;
  
  ${({ $correct }) => $correct ? `
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
  ` : `
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  `}
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2c2c2c, #4a4a4a);
  width: ${({ $progress }) => $progress}%;
  transition: width 0.5s ease;
`;

const NoQuestionsMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  font-size: 1.1rem;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  max-width: 500px;
  width: 100%;
`;

const Hint = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-style: italic;
`;

export function MathGameComponent() {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New: Adaptive Learning State
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [history, setHistory] = useState<{ question: Question, correct: boolean }[]>([]);

  const totalQuestions = questionBank.length;
  const progress = Math.min((level / totalQuestions) * 100, 100);

  // Load question when level changes
  useEffect(() => {
    const idx = level - 1;
    const newPuzzle = idx < questionBank.length ? questionBank[idx] : null;
    setPuzzle(newPuzzle);
    setInput('');
    setFeedback(null);
  }, [level]);

  // Move to next level with adaptive logic
  function nextQuestion() {
    let nextLevel = level + 1;

    if (streak >= 3 && nextLevel < totalQuestions) {
      nextLevel += 1;
      setStreak(0); // reward: skip ahead
    }

    setLevel(nextLevel);
  }

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!puzzle || isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const { correct, formatted } = evaluateAnswer(input, puzzle.answer);
      setLastCorrect(correct);
      setHistory(h => [...h, { question: puzzle, correct }]);

      if (correct) {
        setStreak(s => s + 1);
        setFeedback('✅ Excellent! Moving to the next level...');
        setTimeout(() => {
          nextQuestion();
        }, 1500);
      } else {
        setStreak(0);
        setMistakes(m => [...m, puzzle]);
        setFeedback(`❌ Not quite right. The correct answer is ${formatted}`);
      }

      setIsSubmitting(false);
    }, 300);
  };

  return (
    <Container>
      <Title>Sharpen your maths</Title>

      {puzzle ? (
        <>
          <LevelIndicator>
            Level {level} of {totalQuestions}
          </LevelIndicator>

          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>

          <QuestionContainer>
            <MathJax dynamic>{'`' + puzzle.question + '`'}</MathJax>
          </QuestionContainer>

          <Form onSubmit={handleSubmit}>
            <InputContainer>
              <Input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Enter your answer"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </InputContainer>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking...' : 'Submit Answer'}
            </Button>
            <Hint>
              Enter your answer as a number, fraction, or expression
            </Hint>
            <Hint>
              Streak: {streak} | Mistakes: {mistakes.length}
            </Hint>
          </Form>

          {feedback && (
            <Feedback $correct={lastCorrect}>
              {feedback}
            </Feedback>
          )}
        </>
      ) : (
        <NoQuestionsMessage>
          <h3>🎉 Congratulations!</h3>
          <p>You've completed all available questions. Check back soon for more challenges!</p>
        </NoQuestionsMessage>
      )}
    </Container>
  );
}