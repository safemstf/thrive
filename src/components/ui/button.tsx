// components/ui/button.tsx
import React from 'react';
import styled, { css } from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: css`
    background-color: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;
    
    &:hover:not(:disabled) {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    
    &:active:not(:disabled) {
      background-color: #1d4ed8;
      border-color: #1d4ed8;
    }
  `,
  secondary: css`
    background-color: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    
    &:active:not(:disabled) {
      background-color: #f3f4f6;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: #374151;
    border: 1px solid transparent;
    
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
    }
    
    &:active:not(:disabled) {
      background-color: #e5e7eb;
    }
  `,
  danger: css`
    background-color: #ef4444;
    color: white;
    border: 1px solid #ef4444;
    
    &:hover:not(:disabled) {
      background-color: #dc2626;
      border-color: #dc2626;
    }
    
    &:active:not(:disabled) {
      background-color: #b91c1c;
      border-color: #b91c1c;
    }
  `
};

const buttonSizes = {
  small: css`
    padding: 0.375rem 0.875rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  `,
  medium: css`
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  `,
  large: css`
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
    line-height: 1.5rem;
  `
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  outline: none;
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  
  ${({ variant = 'primary' }) => buttonVariants[variant]}
  ${({ size = 'medium' }) => buttonSizes[size]}
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:focus-visible {
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3b82f6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledButton ref={ref} {...props}>
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';