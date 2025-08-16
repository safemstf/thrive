// src\app\dashboard\thrive\assessments\page.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Container,
  WelcomeTitle,
  WelcomeSubtitle,
  Section,
} from '@/components/dashboard/dashboardStyles';
import { theme,   Header,
  HeaderContent, PageWrapper } from '@/styles/styled-components';

// Centralized metadata for the 6 assessments
const assessments = [
  {
    id: 'professional-communication',
    title: 'Professional Communication Evaluation',
    description:
      'Assesses clarity, tone, and adaptability in workplace communication.',
  },
  {
    id: 'innovative-problem-solving',
    title: 'Innovation & Creative Problem Solving',
    description:
      'Measures creative thinking, ideation, and innovative solution development.',
  },
  {
    id: 'technical-problem-solving',
    title: 'Technical Problem-Solving Skills',
    description:
      'Evaluates analytical thinking, coding, and debugging capabilities.',
  },
  {
    id: 'leadership-assessment',
    title: 'Leadership & Team Collaboration',
    description:
      'Analyzes decision-making, motivation, and conflict resolution skills.',
  },
  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence Assessment',
    description:
      'Assesses empathy, self-awareness, and interpersonal relationship skills.',
  },
  {
    id: 'time-management',
    title: 'Time Management & Productivity',
    description:
      'Measures organization, prioritization, and execution efficiency.',
  },
];

export default function AssessmentsIndexPage() {
  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderContent>
            <div>
              <WelcomeTitle>Available Assessments</WelcomeTitle>
              <WelcomeSubtitle>
                Choose an assessment to start your journey
              </WelcomeSubtitle>
            </div>
          </HeaderContent>
        </Header>

        <Section
          style={{
            display: 'grid',
            gap: theme.spacing.lg,
          }}
        >
          {assessments.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/thrive/assessments/${a.id}`}
              style={{
                display: 'block',
                padding: theme.spacing.lg,
                borderRadius: theme.borderRadius.lg,
                background: theme.colors.background.secondary,
                textDecoration: 'none',
                color: theme.colors.text.primary,
                boxShadow: theme.shadows.sm,
                transition: theme.transitions.normal,
              }}
            >
              <h3
                style={{
                  marginBottom: theme.spacing.sm,
                }}
              >
                {a.title}
              </h3>
              <p style={{ color: theme.colors.text.secondary }}>
                {a.description}
              </p>
            </Link>
          ))}
        </Section>
      </Container>
    </PageWrapper>
  );
}
