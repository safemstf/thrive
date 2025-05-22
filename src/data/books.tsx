// src/data/books.tsx
import React, { ReactNode } from 'react';

export type Category =
  | 'math'
  | 'math-workbook'
  | 'english'
  | 'english-workbook'
  | 'life-science'
  | 'physical-science'
  | 'earth-science'
  | 'ap-physics'
  | 'ap-biology'
  | 'ap-chemistry'
  | 'calculus-ab'
  | 'calculus-bc';

export interface Book {
  id: string;
  title: string;
  year: string;
  category: Category;
  colors: {
    primary: string;
    secondary: string;
  };
  excerpt: string;
  link?: string;
  description: ReactNode;
}

export const books: Book[] = [
  // SAT Guides
  {
    id: 'sat-math-guide',
    title: 'SAT Math Guide',
    year: '2025',
    category: 'math',
    colors: { primary: '#1C3E6E', secondary: '#2A5CA5' },
    excerpt: 'Master algebra, geometry, and data analysis.',
    description: (
      <>
        <p>Master algebra, geometry, and data analysis.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
  {
    id: 'sat-english-guide',
    title: 'SAT English Guide',
    year: '2025',
    category: 'english',
    colors: { primary: '#4B2D83', secondary: '#6B4199' },
    excerpt: 'Tackle comprehension passages and grammar.',
    description: (
      <>
        <p>Tackle comprehension passages and grammar.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },

  // Middle School Science Workbooks
  {
    id: 'life-science-ms',
    title: 'Life Science Workbook',
    year: '2024',
    category: 'life-science',
    colors: { primary: '#2E7D32', secondary: '#43A047' },
    excerpt: 'Explore cells, ecosystems, and heredity.',
    description: (
      <>
        <p>Explore cells, ecosystems, and heredity.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
  {
    id: 'physical-science-ms',
    title: 'Physical Science Workbook',
    year: '2024',
    category: 'physical-science',
    colors: { primary: '#0C3B2E', secondary: '#136F63' },
    excerpt: 'Learn forces, energy, and matter concepts.',
    description: (
      <>
        <p>Learn forces, energy, and matter concepts.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
  {
    id: 'earth-science-ms',
    title: 'Earth Science Workbook',
    year: '2024',
    category: 'earth-science',
    colors: { primary: '#37474F', secondary: '#546E7A' },
    excerpt: 'Investigate rocks, weather patterns, and systems.',
    description: (
      <>
        <p>Investigate rocks, weather patterns, and systems.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },

  // AP Science Guides
  {
    id: 'ap-physics-guide',
    title: 'AP Physics Success Guide',
    year: '2025',
    category: 'ap-physics',
    colors: { primary: '#1565C0', secondary: '#1E88E5' },
    excerpt: 'Mechanics & E&M: explanations & problem sets.',
    description: (
      <>
        <p>Conceptual explanations & problem sets for mechanics &amp; E&amp;M.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
  {
    id: 'ap-biology-guide',
    title: 'AP Biology Success Guide',
    year: '2025',
    category: 'ap-biology',
    colors: { primary: '#2E7D32', secondary: '#43A047' },
    excerpt: 'From molecular biology to ecology: high-yield practice.',
    description: (
      <>
        <p>High-yield summaries &amp; practice from molecular biology to ecology.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
  {
    id: 'ap-chemistry-guide',
    title: 'AP Chemistry Success Guide',
    year: '2025',
    category: 'ap-chemistry',
    colors: { primary: '#37474F', secondary: '#546E7A' },
    excerpt: 'Stoichiometry, thermodynamics & kinetics with examples.',
    description: (
      <>
        <p>Stoichiometry, thermodynamics, kinetics with examples.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },

  // AP Calculus Guides
  {
    id: 'calculus-ab-guide',
    title: 'AP Calculus AB Guide',
    year: '2025',
    category: 'calculus-ab',
    colors: { primary: '#7D1935', secondary: '#9C2542' },
    excerpt: 'Step-by-step limits, derivatives & integrals.',
    description: (
      <>
        <p>Limits, derivatives, integrals step-by-step.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
  {
    id: 'calculus-bc-guide',
    title: 'AP Calculus BC Guide',
    year: '2025',
    category: 'calculus-bc',
    colors: { primary: '#512A5B', secondary: '#6A1B9A' },
    excerpt: 'Series, parametrized eqns & advanced integration.',
    description: (
      <>
        <p>Series, parametric eqns., advanced integration.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },

  // Writing Workbooks
  {
    id: 'writing-grammar-workbook',
    title: 'Writing Grammar Workbook',
    year: '2025',
    category: 'english-workbook',
    colors: { primary: '#48304D', secondary: '#5F4668' },
    excerpt: 'Drills for punctuation & sentence structure.',
    description: (
      <>
        <p>Practice drills for punctuation, sentence structure.</p>
        <p><em>Online preview in the works…</em></p>
      </>
    ),
  },
];
