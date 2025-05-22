// src/app/page.tsx
'use client';

import React from 'react';
import styled from 'styled-components';

import DataEntryCardfrom from '@/components/reviews/reviewResponses';
import ReviewResponses from '@/components/reviews/reviewResponses';

const Main = styled.main`
  background: linear-gradient(
    var(--gradient-angle),
    var(--background-start),
    var(--background-end)
  );
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
`;

const Section = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  display: flex;
  justify-content: center;
`;

export default function HomePage() {
  return (
    <Main>
      {/* Full Reviews List */}
      <Section>
        <ReviewResponses />
      </Section>
    </Main>
  );
}
