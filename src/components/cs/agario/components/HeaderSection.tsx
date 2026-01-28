// src/components/cs/agario/HeaderSection.tsx
import React from 'react';
import { Header, Title, Subtitle } from '../config/agario.styles';

interface HeaderSectionProps {
  speciesCount: number;
  population: number;
  largestFamily: number;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  speciesCount,
  population,
  largestFamily
}) => (
  <Header>
    <Title>🧬 Natural Selection Simulator</Title>
    <Subtitle>
      {speciesCount} lineages • {population} blobs • {largestFamily} largest family
    </Subtitle>
  </Header>
);