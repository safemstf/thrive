import React, { useState } from 'react';
import styled from 'styled-components';

export type Instruction = {
  name: string;
  bits: string;
};

type Props = {
  onSubmit: (instr: Instruction) => void;
};

export default function BitManipulationDemo({ onSubmit }: Props) {
  const [bits, setBits] = useState<string>('0000000000000000');

  const toggleBit = (i: number) => {
    const newBits = bits
      .split('')
      .map((b, idx) => (idx === i ? (b === '0' ? '1' : '0') : b))
      .join('');
    setBits(newBits);
  };

  const toDecimal = parseInt(bits, 2);
  const toHex = toDecimal.toString(16).padStart(4, '0').toUpperCase();

  return (
    <Wrapper>
      <Title>Bit Manipulation</Title>
      <BitGrid>
        {bits.split('').map((bit, i) => (
          <Bit key={i} active={bit === '1'} onClick={() => toggleBit(i)}>
            {bit}
          </Bit>
        ))}
      </BitGrid>
      <Info>
        <div>Decimal: {toDecimal}</div>
        <div>Hex: 0x{toHex}</div>
      </Info>
      <SendButton onClick={() => onSubmit({ name: `INSTR ${toHex}`, bits })}>
        ➜ Send
      </SendButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: #333;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 260px;
`;

const Title = styled.h4`
  color: #cff;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const BitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: 20px;
  gap: 4px;
  margin-bottom: 0.5rem;
  width: 100%;
`;

const Bit = styled.div<{ active: boolean }>`
  background: ${({ active }) => (active ? '#0ff' : '#222')};
  color: #000;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
  border: 1px solid #555;
  border-radius: 2px;
  user-select: none;
`;

const Info = styled.div`
  color: #aaffff;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  text-align: center;
`;

const SendButton = styled.button`
  padding: 0.3rem 0.6rem;
  background: #1af;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
`;
