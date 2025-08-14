// src/hooks/useThrive.ts
import { useMemo, useState, useEffect } from 'react';
import type {
  PlatformStats,
  LeaderboardEntry,
  Assessment,
  AssessmentCategory
} from '@/types/thrive.types';
import {
  ASSESSMENT_ROUTES,
  ASSESSMENTS,
  ASSESSMENT_CATEGORIES
} from '@/data/thrive-assessments';

/**
 * Light-weight client Question type used for mock question sets.
 * Move to your types file if you want global typing.
 */
export type Question = {
  id: string;
  assessmentId: string;
  prompt: string;
  options?: string[]; // multiple choice
  answer?: string | number | string[]; // optional correct answer (client mock)
  timeLimitSecs?: number;
  points?: number;
  explanation?: string;
};

// ----------------
// Stats Hook (client-simulated)
// ----------------
export function useThriveStats(active: boolean = true) {
  const [stats, setStats] = useState<PlatformStats>({
    verifiedProfessionals: 23847,
    activeSessions: 342,
    completedToday: 89,
    employerTrust: 91
  });

  useEffect(() => {
    if (!active) return undefined; // don't start interval when not active

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        // small, bounded random walk to simulate live changes
        activeSessions: Math.max(0, prev.activeSessions + Math.floor(Math.random() * 3) - 1),
        completedToday: prev.completedToday + Math.floor(Math.random() * 2)
      }));
    }, 30000); // same interval as before

    return () => clearInterval(interval);
  }, [active]); // restart/cleanup when active changes

  return stats;
}
// ----------------
// Leaderboard (static/mock)
// ----------------
export function useThriveLeaderboard() {
  // memoize static leaderboard
  return useMemo<LeaderboardEntry[]>(
    () => [
      { rank: 1, name: 'Dr. Sarah Chen', score: 2947, verified: true },
      { rank: 2, name: 'Marcus Johnson', score: 2834, verified: true },
      { rank: 3, name: 'Elena Rodriguez', score: 2721, verified: true },
      { rank: 4, name: 'James Park', score: 2589, verified: false },
      { rank: 5, name: 'Dr. Aisha Patel', score: 2476, verified: true },
      { rank: 6, name: 'Lisa Wang', score: 2384, verified: true },
      { rank: 7, name: 'David Kim', score: 2297, verified: false },
      { rank: 8, name: 'Maria Garcia', score: 2198, verified: true }
    ],
    []
  );
}

// ----------------
// Assessments & Categories (client-side)
// ----------------
export function useThriveAssessments(filter?: {
  categoryId?: string;
  difficulty?: string;
  skillType?: string;
}) {
  const routes = ASSESSMENT_ROUTES;
  const categories = useMemo<AssessmentCategory[]>(() => ASSESSMENT_CATEGORIES, []);
  const assessments = useMemo<Assessment[]>(() => {
    return ASSESSMENTS.filter(a => {
      let ok = true;
      if (filter?.categoryId) ok = ok && a.skillType === filter.categoryId;
      if (filter?.difficulty) ok = ok && a.difficulty === filter.difficulty;
      if (filter?.skillType) ok = ok && a.skillType === filter.skillType;
      return ok;
    });
  }, [filter]);

  return { routes, categories, assessments };
}

// ----------------
// Questions: client-side mock pools for each assessment
// Useful for running the flow locally when server is down.
// ----------------
export function useThriveQuestions() {
  // simple mock question set keyed by assessment id
  const questions = useMemo<Record<string, Question[]>>(
    () => ({
      'wg-001': [
        {
          id: 'wg-q1',
          assessmentId: 'wg-001',
          prompt:
            'If all florps are bligs and some bligs are zorks, can we conclude that some florps are zorks?',
          options: ['Yes', 'No', 'Cannot tell'],
          answer: 'Cannot tell',
          timeLimitSecs: 90,
          points: 2,
          explanation: 'All florps -> bligs, but only some bligs -> zorks, so not guaranteed.'
        },
        {
          id: 'wg-q2',
          assessmentId: 'wg-001',
          prompt:
            'Evaluate the argument: "Most employees who finish on time are productive; Alice finished on time; therefore Alice is productive."',
          options: ['Strong', 'Weak', 'Invalid'],
          answer: 'Weak',
          timeLimitSecs: 90,
          points: 2
        }
      ],
      'rm-001': [
        {
          id: 'rm-q1',
          assessmentId: 'rm-001',
          prompt: 'Select the missing tile in the matrix (mock question: choose pattern B).',
          options: ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D'],
          answer: 'Pattern B',
          timeLimitSecs: 120,
          points: 3
        }
      ],
      'crt-001': [
        {
          id: 'crt-q1',
          assessmentId: 'crt-001',
          prompt: 'A bat and a ball cost $1.10. The bat costs $1.00 more than the ball. How much does the ball cost?',
          options: ['$0.05', '$0.10', '$0.15', '$0.20'],
          answer: '$0.05',
          timeLimitSecs: 30,
          points: 3,
          explanation: 'Ball = $0.05; bat = $1.05; difference $1.00.'
        },
        {
          id: 'crt-q2',
          assessmentId: 'crt-001',
          prompt: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
          options: ['5 minutes', '100 minutes', '20 minutes', '50 minutes'],
          answer: '5 minutes',
          timeLimitSecs: 30,
          points: 3
        }
      ],
      'num-001': [
        {
          id: 'num-q1',
          assessmentId: 'num-001',
          prompt: 'If revenue grew from 200 to 260, what is the percent increase?',
          options: ['20%', '25%', '30%', '22%'],
          answer: '30%',
          timeLimitSecs: 60,
          points: 2,
          explanation: '260/200 = 1.30 → 30% increase.'
        }
      ],
      'code-001': [
        {
          id: 'code-q1',
          assessmentId: 'code-001',
          prompt: 'Write a function that reverses a string. (This is a placeholder prompt — in UI you would open a coding editor.)',
          timeLimitSecs: 1800,
          points: 10
        }
      ],
      'sjt-001': [
        {
          id: 'sjt-q1',
          assessmentId: 'sjt-001',
          prompt: 'A team member misses deadlines frequently. What would you do first?',
          options: [
            'Confront them publicly',
            'Talk privately to understand issues',
            'Escalate to manager immediately',
            'Ignore it for now'
          ],
          answer: 'Talk privately to understand issues',
          timeLimitSecs: 90,
          points: 3
        }
      ],
      'rr-001': [
        {
          id: 'rr-q1',
          assessmentId: 'rr-001',
          prompt: 'What is the next number in the sequence: 2, 4, 8, 16, ?',
          options: ['18', '24', '32', '30'],
          answer: '32',
          timeLimitSecs: 15,
          points: 1
        }
      ]
    }),
    []
  );

  function getQuestionsForAssessment(assessmentId: string) {
    return questions[assessmentId] ?? [];
  }

  return { getQuestionsForAssessment, allQuestions: questions };
}

// ----------------
// Utility: find assessment by id
// ----------------
export function getAssessmentById(id: string): Assessment | undefined {
  return ASSESSMENTS.find(a => a.id === id);
}
