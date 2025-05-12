import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import BitManipulationDemo, { Instruction as BitInstr } from './bitManipulationDemo';

// Pipeline stages
const STAGES = ['Fetch', 'Decode', 'Execute', 'Memory', 'WriteBack'] as const;

interface PipelineInstr {
  id: number;
  name: string;
  bits: string;
}

export default function CPUPipelineSimulator() {
  const [queue, setQueue] = useState<PipelineInstr[]>([]);
  const [pipeline, setPipeline] = useState<Array<PipelineInstr | null>>(Array(STAGES.length).fill(null));
  const cycleRef = useRef<number>(0);
  const nextId = useRef(1);

  // Tick the pipeline each cycle
useEffect(() => {
  cycleRef.current = window.setInterval(() => {
    setPipeline(prev => {
      // 1) Create a fresh array of nulls, same length as STAGES
      const nextArr: (PipelineInstr | null)[] = Array(STAGES.length).fill(null);
      // 2) Shift everything one stage forward
      for (let i = STAGES.length - 1; i > 0; i--) {
        nextArr[i] = prev[i - 1];
      }
      // 3) Inject the new instruction in Fetch
      nextArr[0] = queue[0] || null;
      return nextArr;
    });

    setQueue(prev => (prev.length ? prev.slice(1) : []));
  }, 1000);

  return () => clearInterval(cycleRef.current);
}, [queue]);

  const handleSubmit = (instr: BitInstr) => {
    setQueue(prev => [
      ...prev,
      { id: nextId.current++, name: instr.name, bits: instr.bits }
    ]);
  };

  return (
    <Container>
      <Header>
        <Title>CPU Pipeline Simulator</Title>
        <Usage>
          Toggle bits to craft a 16-bit opcode, then click Send. Your opcodes queue up and step through the five stages every second. Manual entry only—no automatic ALU/calculations yet.
        </Usage>
      </Header>
      <Content>
        <PipelineArea>
          {STAGES.map((stage, idx) => (
            <StageColumn key={stage}>
              <StageLabel>{stage}</StageLabel>
              {pipeline[idx] ? (
                <InstrBox>
                  <InstrName>{pipeline[idx]!.name}</InstrName>
                  <Bits>{pipeline[idx]!.bits}</Bits>
                </InstrBox>
              ) : (
                <EmptySlot>—</EmptySlot>
              )}
            </StageColumn>
          ))}
        </PipelineArea>

        <SideArea>
          <QueueSection>
            <QueueTitle>Instruction Queue</QueueTitle>
            {queue.length ? (
              <QueueGrid>
                {queue.map(i => (
                  <QueueItem key={i.id}>
                    <InstrName>{i.name}</InstrName>
                    <SmallBits>{i.bits}</SmallBits>
                  </QueueItem>
                ))}
              </QueueGrid>
            ) : (
              <QueueEmpty>Empty</QueueEmpty>
            )}
          </QueueSection>

          <BitManipulationDemo onSubmit={handleSubmit} />
        </SideArea>
      </Content>
    </Container>
  );
}

// Styled
const Container = styled.div`
  background: #222;
  color: #eef;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 0.75rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const Usage = styled.p`
  font-size: 0.8rem;
  color: #ccc;
  margin: 0.4rem 0;
  line-height: 1.2;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PipelineArea = styled.div`
  display: grid;
  grid-template-columns: repeat(${STAGES.length}, 1fr);
  gap: 0.4rem;
  scale: 0.85;
  margin-left: -22px;
  `;

const SideArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StageColumn = styled.div`
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 0.4rem;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StageLabel = styled.div`
  font-weight: bold;
  margin-bottom: 0.2rem;
  font-size: 0.8rem;
`;

const InstrBox = styled.div`
  background: #0a84ff;
  color: #fff;
  padding: 0.25rem;
  border-radius: 4px;
  width: 100%;
  text-align: center;
  animation: ${keyframes`
    from { opacity: 0.5; transform: translateY(-2px); }
    to { opacity: 1; transform: translateY(0); }
  `} 0.3s ease-out;
`;

const InstrName = styled.div`
  font-size: 0.85rem;
  font-weight: bold;
`;

const Bits = styled.div`
  font-size: 0.6rem;
  margin-top: 0.15rem;
  word-break: break-all;
`;

const EmptySlot = styled.div`
  color: #555;
  margin-top: 0.8rem;
`;

const QueueSection = styled.div`
  background: #333;
  padding: 0.4rem;
  border-radius: 4px;
`;

const QueueTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.3rem;
  text-align: center;
  font-size: 0.9rem;
`;

const QueueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 0.3rem;
`;

const QueueItem = styled.div`
  background: #444;
  color: #cff;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-align: center;
`;

const SmallBits = styled.div`
  font-size: 0.55rem;
  color: #aaa;
  margin-top: 0.1rem;
`;

const QueueEmpty = styled.div`
  color: #777;
  font-style: italic;
  text-align: center;
`;