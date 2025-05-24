'use client';
import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const WORD_LIST = [
  'apple','bingo','crane','drift','eagle','flute','grasp','hover','input','jolly',
  'knock','lunar','mango','noble','ocean','pride','quest','raven','shark','tiger',
  'urban','vivid','woven','xenon','yacht','zebra','amber','blink','cider','dough',
  'ember','fancy','gloom','hinge','ideal','jelly','karma','lemon','mirth','nexus',
  'orbit','pixel','quill','roast','satin','tempo','union','vapor','youth'
];

const pickSolution = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

// Animations
const flipAnimation = keyframes`
  0% { transform: rotateX(0); }
  50% { transform: rotateX(-90deg); }
  100% { transform: rotateX(0); }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 60%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  80% { transform: translateY(-5px); }
`;

const fadeInScale = keyframes`
  0% { 
    opacity: 0; 
    transform: scale(0.8);
  }
  100% { 
    opacity: 1; 
    transform: scale(1);
  }
`;

export default function Wordle() {
  const [solution, setSolution] = useState(pickSolution);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [invalidWord, setInvalidWord] = useState(false);
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0, maxStreak: 0 });
  const [showStats, setShowStats] = useState(false);
  const [animatingRow, setAnimatingRow] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setSolution(pickSolution);
    setGuesses([]);
    setCurrent('');
    setMessage(null);
    setGameState('playing');
    setInvalidWord(false);
    setAnimatingRow(null);
  };

  useEffect(() => {
    containerRef.current?.focus();
  }, [solution]);

  useEffect(() => {
    if (invalidWord) {
      const timer = setTimeout(() => setInvalidWord(false), 600);
      return () => clearTimeout(timer);
    }
  }, [invalidWord]);

    const isValidWord = (word: string) => word.length === WORD_LENGTH;

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    if (gameState !== 'playing') return;

    if (key === 'Enter') {
      if (current.length !== WORD_LENGTH) {
        setInvalidWord(true);
        return;
      }
      
      if (!isValidWord(current)) {
        setInvalidWord(true);
        setMessage('❌ Not a valid word!');
        setTimeout(() => setMessage(null), 2000);
        return;
      }

      const newGuesses = [...guesses, current];
      setGuesses(newGuesses);
      setAnimatingRow(newGuesses.length - 1);
      
      setTimeout(() => {
        setAnimatingRow(null);
        
        if (current === solution) {
          setMessage('🎉 Brilliant! You got it!');
          setGameState('won');
          setStats(prev => ({
            played: prev.played + 1,
            won: prev.won + 1,
            streak: prev.streak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
          }));
        } else if (newGuesses.length >= MAX_GUESSES) {
          setMessage(`😅 Nice try! The word was ${solution.toUpperCase()}`);
          setGameState('lost');
          setStats(prev => ({
            ...prev,
            played: prev.played + 1,
            streak: 0
          }));
        }
      }, 300);
      
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

  const getKeyboardStatus = (letter: string) => {
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === letter) {
          const status = getStatus(guess, i);
          if (status === 'correct') return 'correct';
          if (status === 'present') return 'present';
          if (status === 'absent') return 'absent';
        }
      }
    }
    return 'unused';
  };

  const keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <Container
      tabIndex={0}
      onKeyDown={handleKey}
      ref={containerRef}
    >
      <Header>
        <HeaderContent>
          <Title>WORDLE</Title>
          <Subtitle>Guess the 5-letter word</Subtitle>
        </HeaderContent>
        <Controls>
          <IconButton onClick={() => setShowStats(true)} title="Statistics">
            📊
          </IconButton>
          <ControlButton onClick={reset}>New Game</ControlButton>
        </Controls>
      </Header>

      <GameBoard $shake={invalidWord}>
        {Array.from({ length: MAX_GUESSES }).map((_, row) => {
          const guess = guesses[row] || '';
          const isCurrent = row === guesses.length && gameState === 'playing';
          const isAnimating = animatingRow === row;
          
          return (
            <Row key={row} $shake={invalidWord && isCurrent}>
              {Array.from({ length: WORD_LENGTH }).map((_, col) => {
                const char = (isCurrent ? current : guess)[col] || '';
                const status = guess && !isCurrent ? getStatus(guess, col) : undefined;
                const hasChar = Boolean(char);
                
                return (
                  <Cell 
                    key={col} 
                    $status={status}
                    $hasChar={hasChar}
                    $flip={isAnimating}
                    $delay={col * 100}
                  >
                    {char.toUpperCase()}
                  </Cell>
                );
              })}
            </Row>
          );
        })}
      </GameBoard>

      <VirtualKeyboard>
        {keyboard.map((row, rowIndex) => (
          <KeyboardRow key={rowIndex}>
            {rowIndex === 2 && (
              <SpecialKey
                $status="unused"
                onClick={() => handleKey({ key: 'Enter' } as KeyboardEvent<HTMLDivElement>)}
              >
                ENTER
              </SpecialKey>
            )}
            {row.map(letter => (
              <Key
                key={letter}
                $status={getKeyboardStatus(letter)}
                onClick={() => handleKey({ key: letter } as KeyboardEvent<HTMLDivElement>)}
              >
                {letter.toUpperCase()}
              </Key>
            ))}
            {rowIndex === 2 && (
              <SpecialKey
                $status="unused"
                onClick={() => handleKey({ key: 'Backspace' } as KeyboardEvent<HTMLDivElement>)}
              >
                ⌫
              </SpecialKey>
            )}
          </KeyboardRow>
        ))}
      </VirtualKeyboard>

      {message && (
        <MessageContainer $gameOver={gameState !== 'playing'}>
          <Message>{message}</Message>
          {gameState !== 'playing' && (
            <MessageActions>
              <ControlButton onClick={reset}>Play Again</ControlButton>
              <ControlButton onClick={() => setShowStats(true)}>View Stats</ControlButton>
            </MessageActions>
          )}
        </MessageContainer>
      )}

      {showStats && (
        <StatsOverlay onClick={() => setShowStats(false)}>
          <StatsModal onClick={(e) => e.stopPropagation()}>
            <StatsHeader>
              <h3>Statistics</h3>
              <CloseButton onClick={() => setShowStats(false)}>×</CloseButton>
            </StatsHeader>
            <StatsGrid>
              <StatItem>
                <StatNumber>{stats.played}</StatNumber>
                <StatLabel>Played</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</StatNumber>
                <StatLabel>Win Rate</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{stats.streak}</StatNumber>
                <StatLabel>Current Streak</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{stats.maxStreak}</StatNumber>
                <StatLabel>Max Streak</StatLabel>
              </StatItem>
            </StatsGrid>
          </StatsModal>
        </StatsOverlay>
      )}

      <Instructions>
        💡 Type letters and press Enter to guess. Green = correct, Yellow = wrong position, Gray = not in word
      </Instructions>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  outline: none;
  font-family: 'Work Sans', sans-serif;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
`;

const HeaderContent = styled.div`
  text-align: left;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: #2c2c2c;
  font-weight: 700;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
  font-weight: 400;
`;

const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const IconButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;

  &:hover {
    background: #e9ecef;
    transform: translateY(-1px);
  }
`;

const ControlButton = styled.button`
  background: #2c2c2c;
  border: none;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(44, 44, 44, 0.2);

  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(44, 44, 44, 0.3);
  }
`;

const GameBoard = styled.div<{ $shake: boolean }>`
  display: grid;
  grid-template-rows: repeat(${MAX_GUESSES}, 1fr);
  gap: 8px;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  
  ${({ $shake }) => $shake && css`
    animation: ${shakeAnimation} 0.6s ease-in-out;
  `}
`;

const Row = styled.div<{ $shake?: boolean }>`
  display: grid;
  grid-template-columns: repeat(${WORD_LENGTH}, 1fr);
  gap: 8px;
  
  ${({ $shake }) => $shake && css`
    animation: ${shakeAnimation} 0.6s ease-in-out;
  `}
`;

const Cell = styled.div<{ 
  $status?: 'correct' | 'present' | 'absent'; 
  $hasChar: boolean;
  $flip?: boolean;
  $delay?: number;
}>`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  border: 3px solid ${({ $hasChar, $status }) => 
    $status ? 'transparent' : $hasChar ? '#2c2c2c' : '#d3d6da'};
  border-radius: 4px;
  background: ${({ $status }) => {
    switch ($status) {
      case 'correct': return '#6aaa64';
      case 'present': return '#c9b458';
      case 'absent': return '#787c7e';
      default: return 'white';
    }
  }};
  color: ${({ $status, $hasChar }) => $status ? 'white' : $hasChar ? '#2c2c2c' : '#787c7e'};
  text-transform: uppercase;
  transition: all 0.3s ease;
  position: relative;
  
  ${({ $hasChar }) => $hasChar && css`
    animation: ${pulseAnimation} 0.3s ease;
  `}
  
  ${({ $flip, $delay = 0 }) => $flip && css`
    animation: ${flipAnimation} 0.6s ease-in-out ${$delay}ms;
  `}

  &:hover {
    transform: ${({ $status }) => $status ? 'none' : 'scale(1.05)'};
  }
`;

const VirtualKeyboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 1rem 0;
`;

const KeyboardRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
`;

const Key = styled.button<{ $status: 'correct' | 'present' | 'absent' | 'unused' }>`
  background: ${({ $status }) => {
    switch ($status) {
      case 'correct': return '#6aaa64';
      case 'present': return '#c9b458';
      case 'absent': return '#787c7e';
      default: return '#d3d6da';
    }
  }};
  color: ${({ $status }) => $status !== 'unused' ? 'white' : '#2c2c2c'};
  border: none;
  border-radius: 4px;
  padding: 0.75rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 30px;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

const SpecialKey = styled(Key)`
  background: #818384;
  color: white;
  font-size: 0.7rem;
  padding: 0.75rem 1rem;
  min-width: auto;
`;

const MessageContainer = styled.div<{ $gameOver: boolean }>`
  text-align: center;
  padding: 1.5rem;
  background: ${({ $gameOver }) => $gameOver ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' : 'transparent'};
  border-radius: 12px;
  margin: 1rem 0;
  animation: ${fadeInScale} 0.5s ease-out;
  
  ${({ $gameOver }) => $gameOver && css`
    border: 2px solid #dee2e6;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  `}
`;

const Message = styled.div`
  color: #2c2c2c;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  animation: ${bounceAnimation} 0.8s ease-out;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const StatsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeInScale} 0.3s ease-out;
`;

const StatsModal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

const StatsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #2c2c2c;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  
  &:hover {
    color: #2c2c2c;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;
`;

const StatItem = styled.div`
  padding: 1rem 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c2c2c;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Instructions = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.8rem;
  margin-top: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.4;
`;