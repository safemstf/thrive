// app/unauthorized/page.tsx
"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f8f8;
  padding: 1rem;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 500px;
  font-family: "Work Sans", sans-serif;
  padding: 3rem 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #d32f2f;
  margin-bottom: 1rem;
  letter-spacing: 1px;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: "Work Sans", sans-serif;
  letter-spacing: 1px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${({ $variant = 'primary' }) => 
    $variant === 'primary' 
      ? `
        background: #2c2c2c;
        color: #ffffff;
        border: 1px solid #2c2c2c;
        
        &:hover {
          background: #1a1a1a;
        }
      `
      : `
        background: transparent;
        color: #2c2c2c;
        border: 1px solid #2c2c2c;
        
        &:hover {
          background: #f5f5f5;
        }
      `
  }
`;

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <PageWrapper>
      <Card>
        <Title>Access Denied</Title>
        <Message>
          You don't have permission to access this page. This area is restricted to administrators only.
        </Message>
        <ButtonGroup>
          <Button $variant="primary" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button $variant="secondary" onClick={() => router.back()}>
            Go Back
          </Button>
        </ButtonGroup>
      </Card>
    </PageWrapper>
  );
}

