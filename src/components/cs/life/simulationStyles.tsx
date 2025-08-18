// src/components/cs/life/simulationStyles.tsx
import styled from "styled-components";

export const SimulationContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ $isDark }) => ($isDark ? "#0f172a" : "#f9fafb")};
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: ${({ $isDark }) => 
    $isDark ? "0 4px 12px rgba(2, 6, 23, 0.5)" : "0 4px 12px rgba(0, 0, 0, 0.1)"};
  max-width: fit-content;
  margin: 0 auto;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

export const Controls = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;

  button {
    background-color: ${({ $isDark }) => ($isDark ? "#334155" : "#e2e8f0")};
    color: ${({ $isDark }) => ($isDark ? "#f1f5f9" : "#0f172a")};
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 0.6rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 500;
    box-shadow: ${({ $isDark }) => 
      $isDark ? "0 2px 6px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.1)"};
    
    &:hover {
      background-color: ${({ $isDark }) => ($isDark ? "#475569" : "#cbd5e1")};
      transform: translateY(-2px);
      box-shadow: ${({ $isDark }) => 
        $isDark ? "0 4px 10px rgba(0, 0, 0, 0.4)" : "0 4px 10px rgba(0, 0, 0, 0.15)"};
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &.active {
      background-color: ${({ $isDark }) => ($isDark ? "#4f46e5" : "#6366f1")};
      color: white;
    }
  }
  
  .slider-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    min-width: 140px;
    
    label {
      font-size: 0.8rem;
      color: ${({ $isDark }) => ($isDark ? "#94a3b8" : "#64748b")};
    }
    
    input {
      width: 100%;
    }
  }
`;

export const RuleSelect = styled.select<{ $isDark: boolean }>`
  padding: 0.6rem;
  border-radius: 0.6rem;
  border: 1px solid ${({ $isDark }) => ($isDark ? "#334155" : "#cbd5e1")};
  cursor: pointer;
  background-color: ${({ $isDark }) => ($isDark ? "#1e293b" : "#ffffff")};
  color: ${({ $isDark }) => ($isDark ? "#f1f5f9" : "#0f172a")};
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ $isDark }) => ($isDark ? "#818cf8" : "#4f46e5")};
    box-shadow: 0 0 0 2px ${({ $isDark }) => 
      $isDark ? "rgba(129, 140, 248, 0.3)" : "rgba(79, 70, 229, 0.3)"};
  }
`;

export const SimulationCanvas = styled.canvas<{ $isDark?: boolean }>`
  width: 100%;
  height: 500px;
  border-radius: var(--radius-lg);
  border: 2px solid ${({ $isDark }) => ($isDark ? "#334155" : "#cbd5e1")};
  box-shadow: ${({ $isDark }) => 
    $isDark ? "0 6px 16px rgba(2, 6, 23, 0.5)" : "0 6px 16px rgba(0, 0, 0, 0.1)"};
  transition: all 0.3s ease;
  background-color: ${({ $isDark }) => 
    $isDark ? "var(--color-background-primary)" : "var(--color-background-secondary)"};

  &:hover {
    border-color: ${({ $isDark }) => ($isDark ? "#818cf8" : "#4f46e5")};
  }
  
  @media (max-width: 768px) {
    height: 400px;
  }
  
  @media (max-width: 480px) {
    height: 320px;
  }
`;

export const ControlButton = styled.button<{ $isDark?: boolean }>`
  position: relative;
  overflow: hidden;
  background-color: ${({ $isDark }) => ($isDark ? "#334155" : "#e2e8f0")};
  color: ${({ $isDark }) => ($isDark ? "#f1f5f9" : "#0f172a")};
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 500;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    background-color: ${({ $isDark }) => ($isDark ? "#475569" : "#cbd5e1")};
    transform: translateY(-2px);
  }
`;

export const PatternGallery = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${({ $isDark }) => ($isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(226, 232, 240, 0.5)")};
  border-radius: 0.75rem;
  border: 1px solid ${({ $isDark }) => ($isDark ? "#334155" : "#cbd5e1")};
`;

export const PatternItem = styled.div<{ $isDark: boolean; $active?: boolean }>`
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: ${({ $isDark }) => ($isDark ? "#1e293b" : "#ffffff")};
  border: 1px solid ${({ $isDark, $active }) => 
    $active 
      ? ($isDark ? "#818cf8" : "#4f46e5") 
      : ($isDark ? "#334155" : "#e2e8f0")};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-size: 0.8rem;
  color: ${({ $isDark }) => ($isDark ? "#cbd5e1" : "#334155")};
  
  &:hover {
    transform: translateY(-3px);
    border-color: ${({ $isDark }) => ($isDark ? "#818cf8" : "#4f46e5")};
    box-shadow: ${({ $isDark }) => 
      $isDark ? "0 4px 10px rgba(129, 140, 248, 0.3)" : "0 4px 10px rgba(79, 70, 229, 0.2)"};
  }
  
  &:active {
    transform: translateY(0);
  }
`;


export const SpeedControl = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 160px;
  
  label {
    font-size: 0.85rem;
    color: ${({ $isDark }) => ($isDark ? "#94a3b8" : "#64748b")};
    font-weight: 500;
  }
  
  input[type="range"] {
    width: 100%;
    accent-color: ${({ $isDark }) => ($isDark ? "#818cf8" : "#4f46e5")};
    background: ${({ $isDark }) => ($isDark ? "#334155" : "#e2e8f0")};
    border-radius: 0.5rem;
    height: 6px;
  }
`;

export const StatsDisplay = styled.div<{ $isDark: boolean }>`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: ${({ $isDark }) => ($isDark ? "#94a3b8" : "#64748b")};
  background: ${({ $isDark }) => ($isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(226, 232, 240, 0.5)")};
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  width: 100%;
  
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    span:first-child {
      font-weight: 600;
      color: ${({ $isDark }) => ($isDark ? "#cbd5e1" : "#334155")};
    }
  }
`;

export const PresetContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  background: ${({ $isDark }) => ($isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(226, 232, 240, 0.5)")};
  border-radius: 0.75rem;
  border: 1px solid ${({ $isDark }) => ($isDark ? "#334155" : "#cbd5e1")};
`;

export const PresetButton = styled.button<{ $isDark: boolean; $active?: boolean }>`
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ $isDark }) => ($isDark ? "#475569" : "#cbd5e1")};
  background: ${({ $isDark, $active }) => 
    $active 
      ? ($isDark ? "#4f46e5" : "#6366f1")
      : ($isDark ? "#1e293b" : "#ffffff")};
  color: ${({ $isDark, $active }) => 
    $active ? "#ffffff" : ($isDark ? "#cbd5e1" : "#334155")};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ $isDark }) => ($isDark ? "#818cf8" : "#4f46e5")};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;