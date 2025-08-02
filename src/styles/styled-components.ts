// src/styles/styled-components.ts - Professional styled components
import styled, { css, keyframes } from 'styled-components';
import { theme } from './theme';

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

// Base mixins
export const glassEffect = css`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
`;

export const hoverLift = css`
  transition: transform ${theme.transitions.normal}, box-shadow ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

// Layout components
export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%);
  font-family: 'Work Sans', sans-serif;
  position: relative;
  
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

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

export const Section = styled.section`
  padding: 4rem 0;
  
  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

// Typography components
export const Heading1 = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  font-weight: 400;
  color: #2c2c2c;
  letter-spacing: 1px;
  line-height: 1.2;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const Heading2 = styled.h2`
  font-family: 'Work Sans', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

export const Heading3 = styled.h3`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 1rem;
`;

export const BodyText = styled.p`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.125rem;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

// Button components
export const BaseButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  font-family: 'Work Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
          color: white;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(44, 44, 44, 0.3);
          }
        `;
      case 'secondary':
        return css`
          background: transparent;
          color: #2c2c2c;
          border: 1px solid #d1d5db;
          
          &:hover:not(:disabled) {
            background: #f8f9fa;
            border-color: #2c2c2c;
            transform: translateY(-2px);
          }
        `;
      case 'ghost':
        return css`
          background: rgba(44, 44, 44, 0.05);
          color: #2c2c2c;
          
          &:hover:not(:disabled) {
            background: rgba(44, 44, 44, 0.1);
            transform: translateY(-2px);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Card components
export const Card = styled.div<{ $hover?: boolean; $glass?: boolean }>`
  background: ${({ $glass }) => $glass ? 'rgba(255, 255, 255, 0.9)' : 'white'};
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  ${({ $glass }) => $glass && css`
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  `}
  
  ${({ $hover }) => $hover && css`
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  `}
`;

export const CardContent = styled.div<{ $padding?: 'sm' | 'md' | 'lg' }>`
  padding: ${({ $padding = 'lg' }) => {
    switch ($padding) {
      case 'sm': return '1rem';
      case 'md': return '1.5rem';
      case 'lg': return '2rem';
    }
  }};
`;

// Grid components
export const Grid = styled.div<{ $columns?: number; $minWidth?: string; $gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ $minWidth = '280px' }) => $minWidth}, 1fr));
  gap: ${({ $gap = '1.5rem' }) => $gap};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const FlexGrid = styled.div<{ $minWidth?: string; $gap?: string }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ $gap = '1.5rem' }) => $gap};
  
  > * {
    flex: 1 1 ${({ $minWidth = '280px' }) => $minWidth};
  }
  
  @media (max-width: 768px) {
    > * {
      flex: 1 1 100%;
    }
  }
`;

// Input components
export const Input = styled.input`
  font-family: 'Work Sans', sans-serif;
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #2c2c2c;
  transition: all 0.2s ease;
  width: 100%;
  
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
  font-family: 'Work Sans', sans-serif;
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #2c2c2c;
  transition: all 0.2s ease;
  width: 100%;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

// Form components
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  font-family: 'Work Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Container components
export const Container = styled.div<{ $maxWidth?: string }>`
  max-width: ${({ $maxWidth = '1200px' }) => $maxWidth};
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

// Navigation components
export const NavBar = styled.nav`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
`;

export const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

export const NavBrand = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  text-decoration: none;
`;

export const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export const NavLink = styled.a`
  font-family: 'Work Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: #2c2c2c;
  }
`;

// Tab components
export const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 2rem;
  overflow: auto;
  border: 1px solid #f0f0f0;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal components
export const Modal = styled.div<{ $isOpen?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  z-index: 1;
`;

export const ModalHeader = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f0f0f0;
`;

export const ModalTitle = styled.h2`
  font-family: 'Work Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

export const ModalBody = styled.div`
  padding: 2rem;
`;

export const ModalFooter = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

// Loading components
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  color: #666666;
  font-family: 'Work Sans', sans-serif;
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #2c2c2c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error components
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  color: #666666;
  font-family: 'Work Sans', sans-serif;
  
  h2 {
    color: #2c2c2c;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

// Empty state components
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 3rem 2rem;
  text-align: center;
  color: #666666;
  font-family: 'Work Sans', sans-serif;
  
  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  p {
    margin-bottom: 2rem;
    max-width: 400px;
    line-height: 1.6;
  }
`;

// Badge components
export const Badge = styled.span<{ $variant?: 'default' | 'success' | 'warning' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $variant = 'default' }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        `;
      case 'warning':
        return css`
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        `;
      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
      default:
        return css`
          background: rgba(44, 44, 44, 0.1);
          color: #2c2c2c;
        `;
    }
  }}
`;

// Divider component
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: #f0f0f0;
  margin: 2rem 0;
`;

// Utility components
export const Spacer = styled.div<{ $height?: string }>`
  height: ${({ $height = '1rem' }) => $height};
`;

export const FlexRow = styled.div<{ $gap?: string; $align?: string; $justify?: string }>`
  display: flex;
  align-items: ${({ $align = 'center' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
  gap: ${({ $gap = '1rem' }) => $gap};
  flex-wrap: wrap;
`;

export const FlexColumn = styled.div<{ $gap?: string; $align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align = 'stretch' }) => $align};
  gap: ${({ $gap = '1rem' }) => $gap};
`;

// Progress components
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color || 'linear-gradient(90deg, #2c2c2c 0%, #666666 100%)'};
  transition: width 0.8s ease;
  border-radius: 4px;
`;

// Status indicator
export const StatusIndicator = styled.div<{ $status: 'online' | 'offline' | 'busy' | 'away' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  ${({ $status }) => {
    switch ($status) {
      case 'online':
        return css`background: #10b981;`;
      case 'busy':
        return css`background: #ef4444;`;
      case 'away':
        return css`background: #f59e0b;`;
      default:
        return css`background: #6b7280;`;
    }
  }}
`;