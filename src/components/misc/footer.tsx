// src/components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

// Styled button for the footer
const BackButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

export function Footer() {
  return (
    <footer className="footer">
      <div className="container text-center flex flex-col items-center gap-4 py-6">
        <Link href="/">
          <BackButton>Home</BackButton>
        </Link>
        <p>© {new Date().getFullYear()} Learn Morra. All rights reserved.</p>
      </div>
    </footer>
  );
}