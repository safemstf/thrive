// src\components\profile\profileStyles.tsx
'use client';

import styled, { keyframes } from 'styled-components';

// Animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const float = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, -20px) rotate(1deg); }
  50% { transform: translate(-10px, 10px) rotate(-1deg); }
  75% { transform: translate(15px, 5px) rotate(0.5deg); }
`;

// Layout Components
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%);
  position: relative;
  font-family: 'Work Sans', sans-serif;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(44, 44, 44, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: ${float} 25s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  color: #666666;
  position: relative;
  z-index: 1;
  
  p {
    font-family: 'Work Sans', sans-serif;
    font-size: 1rem;
    margin: 0;
  }
`;

// Header Components
export const Header = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
`;

export const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', serif;
  box-shadow: 0 8px 24px rgba(44, 44, 44, 0.2);
  flex-shrink: 0;
`;

export const ProfileInfo = styled.div`
  flex: 1;
`;

export const UserName = styled.h1`
  font-size: 2.25rem;
  margin: 0 0 0.5rem;
  font-weight: 400;
  color: #2c2c2c;
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
`;

export const Role = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(44, 44, 44, 0.1);
  color: #2c2c2c;
  padding: 0.25rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: 1rem;
  font-family: 'Work Sans', sans-serif;
`;

export const Email = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #666666;
  font-family: 'Work Sans', sans-serif;
`;

// Grid and Cards
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Work Sans', sans-serif;
  }
  
  p {
    color: #666666;
    line-height: 1.6;
    margin: 0;
    font-family: 'Work Sans', sans-serif;
  }
`;

// Portfolio Creation and Management
export const CreatePortfolioSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 4rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

export const PortfolioManagement = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

// Tab Components
export const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 2rem;
  overflow: auto;
  border: 1px solid #f0f0f0;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.$active ? '#2c2c2c' : '#666666'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  white-space: nowrap;
  box-shadow: ${props => props.$active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'};

  &:hover {
    background: ${props => props.$active ? 'white' : '#f0f0f0'};
  }
`;

// Button Components
export const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(44, 44, 44, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: #2c2c2c;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f8f9fa;
    border-color: #2c2c2c;
  }
`;

// Stats Components
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
  }
`;

export const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Cormorant Garamond', serif;
  color: #2c2c2c;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-family: 'Work Sans', sans-serif;
`;

// Portfolio Type Cards
export const PortfolioTypeCard = styled.div<{ $active?: boolean }>`
  padding: 2.5rem;
  border: 2px solid ${props => props.$active ? '#2c2c2c' : '#e5e7eb'};
  border-radius: 16px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #2c2c2c;
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
`;

export const PortfolioTypeIcon = styled.div<{ $color?: string }>`
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  color: ${props => props.$color || '#2c2c2c'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color ? `${props.$color}20` : 'rgba(44, 44, 44, 0.1)'};
  border-radius: 16px;
  transition: all 0.3s ease;
`;

export const PortfolioTypeTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
`;

export const PortfolioTypeDescription = styled.p`
  color: #666666;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-family: 'Work Sans', sans-serif;
`;

export const FeatureList = styled.div`
  margin-bottom: 2rem;
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
  
  span {
    color: #374151;
  }
`;

// Form Components
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.2s ease;
  background: white;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

// Utility Components
export const EmptyState = styled.div`
  background: #f8fafc;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  
  svg {
    color: #9ca3af;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666666;
    margin-bottom: 1.5rem;
    font-family: 'Work Sans', sans-serif;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
  font-family: 'Work Sans', sans-serif;
`;

export const SuccessMessage = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  text-align: center;
  font-family: 'Work Sans', sans-serif;
`;

// Progress Components
export const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #2c2c2c 0%, #666666 100%);
  transition: width 0.8s ease;
`;

// Section Components
export const SectionHeader = styled.div`
  display: flex;
  justify-content: 'space-between';
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  h2 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Work Sans', sans-serif;
    color: #2c2c2c;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

// Responsive Grid
export const ResponsiveGrid = styled.div<{ $minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${props => props.$minWidth || '280px'}, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;