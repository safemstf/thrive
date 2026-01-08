import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, Mic, MicOff, Sparkles, X } from 'lucide-react';

const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
};

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const SearchBarContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto ${GOLDEN_SPACING.lg};
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
  z-index: 10;
`;

const SearchWrapper = styled.div<{ $isListening?: boolean; $hasValue?: boolean }>`
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: ${p => p.$isListening 
    ? '0 20px 60px rgba(102, 126, 234, 0.3)' 
    : '0 8px 24px rgba(0, 0, 0, 0.08)'
  };
  border: 2px solid ${p => p.$isListening 
    ? '#667eea' 
    : p.$hasValue 
      ? 'rgba(102, 126, 234, 0.3)' 
      : 'rgba(2,6,23,0.06)'
  };
  transition: all 0.3s ease;
  overflow: hidden;
  
  ${p => p.$isListening && `
    animation: ${pulse} 2s ease-in-out infinite;
  `}
  
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.1),
      transparent
    );
    ${p => p.$isListening && `
      animation: ${shimmer} 2s infinite;
    `}
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${GOLDEN_SPACING.md} ${GOLDEN_SPACING.lg};
  padding-left: 60px;
  padding-right: 140px;
  border: none;
  font-size: 1.1rem;
  color: #0f172a;
  background: transparent;
  font-weight: 500;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: ${GOLDEN_SPACING.md};
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonGroup = styled.div`
  position: absolute;
  right: ${GOLDEN_SPACING.sm};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: ${GOLDEN_SPACING.xs};
`;

const IconButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $isActive?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  ${p => {
    if (p.$variant === 'primary' || p.$isActive) {
      return `
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      `;
    } else if (p.$variant === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.05);
        }
      `;
    } else {
      return `
        background: rgba(148, 163, 184, 0.1);
        color: #64748b;
        
        &:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: scale(1.05);
        }
      `;
    }
  }}
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
`;

const SuggestionsContainer = styled.div`
  margin-top: ${GOLDEN_SPACING.sm};
  display: flex;
  gap: ${GOLDEN_SPACING.xs};
  flex-wrap: wrap;
  justify-content: center;
`;

const SuggestionChip = styled.button`
  padding: 0.5rem ${GOLDEN_SPACING.sm};
  background: white;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const ListeningIndicator = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem ${GOLDEN_SPACING.md};
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  white-space: nowrap;
  animation: ${pulse} 1.5s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Describe your dream home... (e.g., '3 bed house in Texas under 400k')",
  suggestions = [
    "3 bed house in Texas under 400k",
    "2 bedroom with pool in California",
    "Modern home in Florida",
    "4+ bedrooms under 600k"
  ]
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <SearchBarContainer>
      <SearchWrapper $isListening={isListening} $hasValue={!!value}>
        <SearchIconWrapper>
          {isListening ? (
            <Mic size={24} />
          ) : (
            <Search size={24} />
          )}
        </SearchIconWrapper>

        <SearchInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isListening}
        />

        <ButtonGroup>
          {value && (
            <IconButton
              $variant="danger"
              onClick={handleClear}
              title="Clear search"
            >
              <X size={20} />
            </IconButton>
          )}
          
          <IconButton
            $variant={isListening ? 'primary' : 'secondary'}
            $isActive={isListening}
            onClick={handleVoiceInput}
            title={isListening ? 'Stop listening' : 'Voice search'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </IconButton>

          {onSearch && (
            <IconButton
              $variant="primary"
              onClick={() => onSearch(value)}
              disabled={!value}
              title="Search"
            >
              <Sparkles size={20} />
            </IconButton>
          )}
        </ButtonGroup>

        {isListening && (
          <ListeningIndicator>
            <Mic size={16} />
            Listening... Speak now!
          </ListeningIndicator>
        )}
      </SearchWrapper>

      {!value && suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion, idx) => (
            <SuggestionChip
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </SuggestionChip>
          ))}
        </SuggestionsContainer>
      )}
    </SearchBarContainer>
  );
};