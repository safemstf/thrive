import React, { useState, useEffect, useRef } from 'react';
import { readingBank, ReadingPassage } from '@/data/readingBank';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import styled from 'styled-components';

const Container = styled.div`
  font-family: 'Work Sans', sans-serif;
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  color: #2c2c2c;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  margin-bottom: 2rem;
  color: #2c2c2c;
`;

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  width: 100%;
  max-width: 600px;
`;

const ControlButton = styled.button`
  background: #2c2c2c;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 400;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(44, 44, 44, 0.2);

  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(44, 44, 44, 0.3);
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

const StyledSelectTrigger = styled(SelectTrigger)`
  background: white;
  border: 2px solid #e0e0e0;
  color: #2c2c2c;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 400;
  border-radius: 6px;
  min-width: 160px;

  &:hover {
    border-color: #2c2c2c;
  }

  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
`;

const StyledSelectContent = styled(SelectContent)`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Work Sans', sans-serif;
`;

const PassageCard = styled.div`
  width: 100%;
  max-width: 700px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const PassageHeader = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e8e8e8;
`;

const PassageTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
  text-align: center;
`;

const LexileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const LexileBadge = styled.span<{ $level: 'easy' | 'medium' | 'hard' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $level }) => {
    switch ($level) {
      case 'easy':
        return `
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        `;
      case 'medium':
        return `
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        `;
      case 'hard':
        return `
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        `;
    }
  }}
`;

const PassageContent = styled.div`
  padding: 2rem;
`;

const TextArea = styled.div`
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.7;
  font-size: 1rem;
  color: #333;
  text-align: justify;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const TimerSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
`;

const TimerDisplay = styled.div<{ $urgent: boolean }>`
  font-size: 1.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $urgent }) => $urgent ? '#dc2626' : '#2c2c2c'};
  transition: color 0.3s ease;
`;

const TimerValue = styled.span`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1.4rem;
  font-weight: 600;
`;

const CompletionSection = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  text-align: center;
`;

const CompletionTitle = styled.h3`
  font-size: 1.3rem;
  color: #059669;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const InputSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
`;

const WordCountInput = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  width: 120px;
  text-align: center;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.1rem;
`;

export function ReadingGame() {
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [paused, setPaused] = useState<boolean>(false);
  const [lexileFilter, setLexileFilter] = useState<'all'|'easy'|'medium'|'hard'>('all');
  const [wordCount, setWordCount] = useState<string>('');
  const timerRef = useRef<number | undefined>(undefined);

  const getLexileLevel = (lexile: number): 'easy' | 'medium' | 'hard' => {
    if (lexile < 1000) return 'easy';
    if (lexile < 1300) return 'medium';
    return 'hard';
  };

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

  useEffect(pickPassage, [lexileFilter]);

  useEffect(() => {
    if (!paused && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => window.clearTimeout(timerRef.current);
  }, [timeLeft, paused]);

  const onSubmitCount = () => {
    const count = parseInt(wordCount, 10);
    if (!isNaN(count)) {
      alert(`Great job! You read ${count} words! 🎉`);
      setWordCount('');
    }
  };

  if (!passage) {
    return (
      <Container>
        <LoadingMessage>Loading reading passage...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Speed Reading Challenge</Title>
      
      <ControlPanel>
        <Select onValueChange={(val: string) => setLexileFilter(val as any)} defaultValue="all">
          <StyledSelectTrigger>
            <SelectValue placeholder="Filter Level" />
          </StyledSelectTrigger>
          <StyledSelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy (&lt;1000)</SelectItem>
            <SelectItem value="medium">Medium (1000–1299)</SelectItem>
            <SelectItem value="hard">Hard (1300+)</SelectItem>
          </StyledSelectContent>
        </Select>
        <ControlButton onClick={pickPassage}>New Passage</ControlButton>
      </ControlPanel>

      <PassageCard>
        <PassageHeader>
          <PassageTitle>{passage.title}</PassageTitle>
          <LexileInfo>
            Lexile Score: <strong>{passage.lexile}</strong>
            <LexileBadge $level={getLexileLevel(passage.lexile)}>
              {getLexileLevel(passage.lexile)}
            </LexileBadge>
          </LexileInfo>
        </PassageHeader>
        
        <PassageContent>
          <TextArea>
            {passage.text}
          </TextArea>
          
          <TimerSection>
            <TimerDisplay $urgent={timeLeft <= 10}>
              ⏱️ Time Remaining: 
              <TimerValue>{timeLeft}s</TimerValue>
            </TimerDisplay>
            <ControlButton onClick={() => setPaused(p => !p)}>
              {paused ? '▶️ Resume' : '⏸️ Pause'}
            </ControlButton>
          </TimerSection>
        </PassageContent>
      </PassageCard>

      {timeLeft === 0 && (
        <CompletionSection>
          <CompletionTitle>
            ⏱️ Time's Up!
          </CompletionTitle>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            How many words were you able to read?
          </p>
          
          <InputSection>
            <WordCountInput
              type="number"
              value={wordCount}
              onChange={e => setWordCount(e.target.value)}
              placeholder="Word count"
              min="0"
              autoFocus
            />
            <ControlButton onClick={onSubmitCount} disabled={!wordCount}>
              Submit Score
            </ControlButton>
            <ControlButton onClick={pickPassage}>
              Try Another
            </ControlButton>
          </InputSection>
        </CompletionSection>
      )}
    </Container>
  );
}