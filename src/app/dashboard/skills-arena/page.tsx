// src/app/dashboard/skills-arena/page.tsx - Standalone Skills Arena Page
'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import SurvivalSkillsMarketplace from '@/components/skills/survivalMarketingSystem';

export default function SkillsArenaPage() {
  return (
    <ProtectedRoute>
      <SurvivalSkillsMarketplace />
    </ProtectedRoute>
  );
}