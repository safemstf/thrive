'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Globe, Shield as ShieldIcon } from 'lucide-react';
import {
  RankingCard, RankingHeader, RankingItem, RankBadge,
  UserInfo, UserName, UserTitle, UserSkills, SkillBadge,
  ScoreDisplay, OverallScore, ScoreBreakdown
} from '@/components/thrive/styles';
import { VerificationBadge } from '@/components/thrive/utils/employerTools';
import { Section } from '@/components/dashboard/dashboardStyles';
import { LeaderboardEntry } from '@/types/thrive.types';

// Mock types (can extend RankedUser / LeaderboardEntry later)
type PerformerInput = {
  id?: string;
  rank?: number;
  name: string;
  title?: string | null;
  skills?: string[];
  verified?: boolean;
  score?: number | string;
  criticalThinking?: number | null;
  linguistic?: number | null;
  technical?: number | null;
  analytical?: number | null;
};

type NormalizedPerformer = {
  key: string;
  rank: number;
  name: string;
  title?: string | null;
  skills: string[];
  verified: boolean;
  overallScore: number | string;
  criticalThinking?: number | null;
  linguistic?: number | null;
  technical?: number | null;
  analytical?: number | null;
};

// Helper to normalize data
function normalizePerformer(p: PerformerInput, idx: number): NormalizedPerformer {
  return {
    key: String(p.id ?? idx),
    rank: p.rank ?? idx + 1,
    name: p.name ?? '—',
    title: p.title ?? '—',
    skills: p.skills ?? [],
    verified: p.verified ?? false,
    overallScore: p.score ?? '—',
    criticalThinking: p.criticalThinking ?? null,
    linguistic: p.linguistic ?? null,
    technical: p.technical ?? null,
    analytical: p.analytical ?? null
  };
}

export type RankingsPageProps = {
  topPerformers: LeaderboardEntry[];
}

export default function RankingsPage() {
  const [topPerformers, setTopPerformers] = useState<PerformerInput[]>([]);

  // Simulate API fetch
  useEffect(() => {
    const mockData: PerformerInput[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        title: 'Software Engineer',
        skills: ['React', 'TypeScript', 'Node.js'],
        verified: true,
        score: 92,
        criticalThinking: 88,
        linguistic: 75,
        technical: 95,
        analytical: 90
      },
      {
        id: '2',
        name: 'Bob Smith',
        title: 'Data Analyst',
        skills: ['SQL', 'Python', 'PowerBI'],
        verified: false,
        score: 85,
        criticalThinking: 80,
        linguistic: 70,
        technical: 88,
        analytical: 84
      }
    ];
    setTopPerformers(mockData);
  }, []);

  const normalized = topPerformers.map(normalizePerformer);

  return (
    <Section>
      <RankingCard>
        <RankingHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={18} />
            <div style={{ fontWeight: 600 }}>Global Professional Rankings</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', marginLeft: '1rem' }}>
              <Globe size={14} />
              Live • Updated hourly
            </div>
          </div>

          <VerificationBadge $verified={true}>
            <ShieldIcon size={12} />
            Verified Only
          </VerificationBadge>
        </RankingHeader>

        <div>
          {normalized.map((p) => (
            <RankingItem key={p.key} $rank={p.rank}>
              <RankBadge $rank={p.rank}>{p.rank}</RankBadge>

              <UserInfo>
                <UserName>
                  {p.name}
                  {p.verified && (
                    <VerificationBadge $verified={true} style={{ marginLeft: '0.5rem' }}>
                      <ShieldIcon size={10} />
                      Verified
                    </VerificationBadge>
                  )}
                </UserName>

                <UserTitle>{p.title ?? '—'}</UserTitle>

                <UserSkills>
                  {p.skills.length > 0 ? (
                    p.skills.map((s, i) => <SkillBadge key={i}>{s}</SkillBadge>)
                  ) : (
                    <SkillBadge>—</SkillBadge>
                  )}
                </UserSkills>
              </UserInfo>

              <ScoreDisplay>
                <OverallScore>{p.overallScore ?? '—'}</OverallScore>
                <ScoreBreakdown>
                  CT:{p.criticalThinking ?? '—'} | L:{p.linguistic ?? '—'} | T:{p.technical ?? '—'} | A:{p.analytical ?? '—'}
                </ScoreBreakdown>
              </ScoreDisplay>
            </RankingItem>
          ))}
        </div>
      </RankingCard>
    </Section>
  );
}
