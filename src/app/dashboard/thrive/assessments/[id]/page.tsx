'use client';
// src/app/dashboard/thrive/assessments/[id]/page.tsx

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AssessmentRunner } from '../AssessmentRunner';
import { getAssessmentDefinition } from '@/data/assessmentQuestions';
import { getAssessmentById } from '@/data/mockData';
import styled from 'styled-components';
import { ArrowLeft, AlertCircle } from 'lucide-react';

// Fallback for unknown / not-yet-implemented assessments
const NotBuilt = styled.div`
  min-height: 100vh;
  background: #faf7f2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  padding: 2rem;
  text-align: center;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid rgba(26,18,8,0.12);
  border-radius: 8px;
  background: white;
  color: #3d2e18;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover { background: #f4f1ec; }
`;

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const definition = getAssessmentDefinition(id);
  const meta = getAssessmentById(id);
  const title = meta?.title ?? id;

  const handleBack = () => {
    router.push('/dashboard/thrive');
  };

  if (!definition) {
    return (
      <NotBuilt>
        <AlertCircle size={32} style={{ color: '#b45309' }} />
        <h2 style={{ fontFamily: 'DM Serif Display, serif', color: '#1a1208', margin: 0 }}>
          Coming Soon
        </h2>
        <p style={{ color: '#7a6a56', maxWidth: 380, margin: 0, lineHeight: 1.6 }}>
          <strong>{title}</strong> is not yet available. We're working on it — check back soon.
        </p>
        <BackBtn onClick={handleBack}>
          <ArrowLeft size={16} /> Back to Assessments
        </BackBtn>
      </NotBuilt>
    );
  }

  return <AssessmentRunner definition={definition} title={title} onBack={handleBack} />;
}
