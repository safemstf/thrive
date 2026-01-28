import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0e1a, #1a1a2e);
  color: #e6eef8;
  padding: 2rem 1rem;
  padding-bottom: 80px;
  box-sizing: border-box;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
    padding-bottom: 80px;
  }
`;

const MaxWidthWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #94a3b8;
`;

const VideoSection = styled.section`
  width: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(5,10,20,0.9));
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(59,130,246,0.22);
  box-shadow: 0 8px 32px rgba(0,0,0,0.32);
  margin-bottom: 1.5rem;
  aspect-ratio: 16 / 9;
  max-height: 65vh;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const SimCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  background: #0a0e1a;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const HUD = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.9rem;
  min-width: 180px;
  pointer-events: none;
`;

const LeaderboardHUD = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.85rem;
  min-width: 220px;
  max-height: 400px;
  overflow-y: auto;
  pointer-events: auto;
`;

const ViewportControls = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ViewportButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
  background: ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.9)'};
  color: ${({ $active }) => $active ? '#22c55e' : '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
    border-color: ${({ $active }) => $active ? 'rgba(34, 197, 94, 0.7)' : 'rgba(59, 130, 246, 0.5)'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
  pointer-events: none;
`;

const ControlsDrawer = styled.div<{ $expanded: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 14, 26, 0.98);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(59, 130, 246, 0.3);
  z-index: 100;
  max-height: ${({ $expanded }) => $expanded ? '70vh' : '60px'};
  transition: max-height 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  marginTop: 1rem;
`;

const DrawerHandle = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  min-height: 0;
`;

const StatCard = styled.div<{ $color?: string }>`
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(59,130,246,0.1);
  color: #e6eef8;
  
  .label {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }
  
  .value {
    font-size: 1.6rem;
    color: ${({ $color = '#3b82f6' }) => $color};
    font-weight: 800;
  }
  
  .change {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.2rem;
  }
`;

const Grid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LeaderboardEntry = styled.div<{ $rank: number; $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ $rank, $selected }) =>
    $selected ? 'rgba(99, 102, 241, 0.2)' :
      $rank === 0 ? 'rgba(251, 191, 36, 0.1)' :
        $rank === 1 ? 'rgba(156, 163, 175, 0.1)' :
          $rank === 2 ? 'rgba(205, 127, 50, 0.1)' :
            'transparent'};
  border-left: 2px solid ${({ $rank, $selected }) =>
    $selected ? '#6366f1' :
      $rank === 0 ? '#fbbf24' :
        $rank === 1 ? '#9ca3af' :
          $rank === 2 ? '#cd7f32' :
            'transparent'};
  margin-bottom: 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.15);
  }
  
  .rank {
    font-weight: 800;
    min-width: 25px;
    color: ${({ $rank }) =>
    $rank === 0 ? '#fbbf24' :
      $rank === 1 ? '#9ca3af' :
        $rank === 2 ? '#cd7f32' :
          '#94a3b8'};
  }
  
  .blob-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  .info {
    flex: 1;
    font-size: 0.8rem;
  }
  
  .gen {
    color: #94a3b8;
    font-size: 0.7rem;
  }
  
  .mass {
    font-weight: 700;
    color: '#3b82f6';
  }
`;

const NeuralNetModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const NeuralNetPanel = styled.div`
  background: linear-gradient(135deg, rgba(10, 14, 26, 0.98), rgba(26, 26, 46, 0.98));
  border-radius: 16px;
  border: 2px solid rgba(59, 130, 246, 0.4);
  padding: 1.5rem;
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    padding: 1rem;
    max-height: 85vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(59, 130, 246, 0.3);
  background: rgba(0, 0, 0, 0.5);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
  }
`;

const CanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95));
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  overflow: hidden;
  margin: 1rem 0;
  min-height: 500px;
  width: 100%;
`;

const NeuralNetCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: pointer;
  touch-action: none;
`;

const BlobInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid #6366f1;
`;

const NeuralNetControls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 8px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)'};
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.3)'};
  color: ${({ $active }) => $active ? '#3b82f6' : '#94a3b8'};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }
`;

export {
  Container,
  MaxWidthWrapper,
  Header,
  Title,
  Subtitle,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  LeaderboardHUD,
  ViewportControls,
  ViewportButton,
  ZoomIndicator,
  ControlsDrawer,
  DrawerHandle,
  DrawerContent,
  StatCard,
  Grid,
  LeaderboardEntry,
  NeuralNetModal,
  NeuralNetPanel,
  CloseButton,
  CanvasWrapper,
  NeuralNetCanvas,
  BlobInfo,
  NeuralNetControls,
  ControlButton,
};
