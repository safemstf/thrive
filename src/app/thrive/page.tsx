// src/app/thrive/sat/page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

// Wrapper for the entire page with background, typography, and nav
const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  min-height: 100vh;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .taskbar {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .task-button {
    background: #fff;
    border: 2px solid transparent;
    border-radius: 0.75rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #102a43;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: background 0.3s, transform 0.3s;
    text-decoration: none;

    &:hover {
      background: #f0f4f8;
      transform: translateY(-2px);
    }

    &.active {
      border-color: #486581;
      background: #d9e2ec;
    }
  }


  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 2rem;
    width: 100%;
    max-width: 1000px;
    margin-bottom: 4rem;
  }

  .card {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover { transform: translateY(-8px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); }

    .card__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      height: 100%;
      background: #ffffff;
    }

    .text-title { font-size: 1.5rem; font-weight: 600; color: #102a43; margin-bottom: 0.5rem; text-align: center; }
    .text-body  { font-size: 1rem; color: #627d98; text-align: center; }
  }

  .exercises {
    width: 100%;
    max-width: 800px;
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;

    h2 { font-size: 2rem; color: #102a43; margin-bottom: 1rem; text-align: center; }

    ul {
      list-style: disc;
      padding-left: 1.5rem;

      li { margin-bottom: 0.75rem; font-size: 1rem; color: #334e68; }
    }
  }
`;

const navLinks = [
  { href: '/thrive', label: 'Thrive' },
  { href: '/writing', label: 'Writing' },
  { href: '/tutoring', label: 'Tutoring' },
  { href: '/projects', label: 'Projects' },
  { href: '/gallery', label: 'Gallery' },
];

const cards = [
  { href: '/thrive/sat/reading', label: 'Reading', desc: 'Grammar & passage drills' },
  { href: '/thrive/sat/writing', label: 'Writing', desc: 'Essay tips & practice' },
  { href: '/thrive/sat/math', label: 'Math', desc: 'Problem-solving skills' },
  { href: '/thrive/sat/tests', label: 'Practice Tests', desc: 'Full-length, timed exams' },
];

const exercises = [
  'Read an SAT-level passage and summarize the main idea in 2-3 sentences.',
  'Write a timed 50-minute SAT essay on an argument prompt.',
  'Solve 10 medium-difficulty algebra questions in 15 minutes.',
  'Complete 15 vocabulary-in-context questions under timed conditions.',
];

export default function SATHubPage() {
  const currentPath = '/thrive'; // adjust dynamically via router if needed

  return (
    <PageWrapper>

      <div className="cards">
        {cards.map(({ href, label, desc }) => (
          <Link key={href} href={href} className="card">
            <div className="card__content">
              <div className="text-title">{label}</div>
              <div className="text-body">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <section className="exercises">
        <h2>Today's Exercises</h2>
        <ul>
          {exercises.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </section>
    </PageWrapper>
  );
}
