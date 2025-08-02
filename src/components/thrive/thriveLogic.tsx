// src/app/thrive/thriveLogic.tsx - Separated logic for better organization
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/authProvider';
import { 
  Calculator,
  PenTool,
  Brain,
  BarChart3
} from 'lucide-react';

// Types
export interface SkillChallenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  participants: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  featured: boolean;
  component: React.ComponentType;
}

export interface LiveSession {
  title: string;
  host: string;
  time: string;
  participants: number;
}

export interface LeaderboardEntry {
  name: string;
  score: string;
  rank: number;
}

// Challenge Components
export const MathChallenge = () => {
  const [problem, setProblem] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const generateProblem = () => {
    const operations = [
      { op: '+', fn: (a: number, b: number) => a + b },
      { op: '-', fn: (a: number, b: number) => a - b },
      { op: '×', fn: (a: number, b: number) => a * b }
    ];
    const { op, fn } = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    setProblem(`${a} ${op} ${b} = ${fn(a, b)}`);
  };
  
  useEffect(() => {
    generateProblem();
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [expression, correctAnswer] = problem.split(' = ');
    if (parseInt(answer) === parseInt(correctAnswer)) {
      setScore(prev => prev + 1);
      generateProblem();
      setAnswer('');
    }
  };
  
  return (
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ marginBottom: '2rem', color: '#2c2c2c' }}>Mathematical Reasoning</h3>
      <div style={{ 
        fontSize: '1.5rem', 
        marginBottom: '1.5rem', 
        fontWeight: '600',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        Verify: {problem.split(' = ')[0]} = ?
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            textAlign: 'center',
            width: '120px',
            marginRight: '1rem',
            fontFamily: 'Work Sans, sans-serif'
          }}
          placeholder="Answer"
          autoFocus
        />
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2c2c2c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Work Sans, sans-serif',
            fontWeight: '500'
          }}
        >
          Verify
        </button>
      </form>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        maxWidth: '200px', 
        margin: '0 auto',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <div><strong>{score}</strong> Correct</div>
        <div><strong>{timeLeft}s</strong> Remaining</div>
      </div>
    </div>
  );
};

export const WritingChallenge = () => {
  const [prompt] = useState('Describe a technological innovation that could improve remote collaboration');
  const [response, setResponse] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const wordCount = response.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', color: '#2c2c2c' }}>Professional Writing</h3>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '1.5rem',
        border: '1px solid #e9ecef'
      }}>
        <strong>Prompt:</strong> {prompt}
      </div>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your response here..."
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '1rem',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '1rem',
          fontFamily: 'Work Sans, sans-serif',
          lineHeight: '1.5',
          resize: 'vertical'
        }}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '1rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <div><strong>{wordCount}</strong> words</div>
        <div><strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong> remaining</div>
      </div>
    </div>
  );
};

export const ComingSoonChallenge = ({ title }: { title: string }) => (
  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
    <h3>{title}</h3>
    <p>Coming soon - Advanced exercises and professional development challenges</p>
  </div>
);

// Main hook for thrive logic
export const useThriveLogic = () => {
  const { user } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [onlineUsers] = useState(247);
  const [activeSessions] = useState(12);
  const [completedToday] = useState(89);
  
  const skillChallenges: SkillChallenge[] = [
    {
      id: 'math-reasoning',
      title: 'Mathematical Reasoning',
      description: 'Sharpen analytical thinking with mathematical problem-solving exercises',
      icon: Calculator,
      participants: 45,
      difficulty: 'Intermediate',
      category: 'Analytics',
      featured: true,
      component: MathChallenge
    },
    {
      id: 'professional-writing',
      title: 'Professional Writing',
      description: 'Develop clear, persuasive communication skills for business contexts',
      icon: PenTool,
      participants: 67,
      difficulty: 'Advanced',
      category: 'Communication',
      featured: false,
      component: WritingChallenge
    },
    {
      id: 'logic-puzzles',
      title: 'Logic & Strategy',
      description: 'Enhance critical thinking through structured problem-solving',
      icon: Brain,
      participants: 34,
      difficulty: 'Intermediate',
      category: 'Strategy',
      featured: false,
      component: () => <ComingSoonChallenge title="Logic & Strategy Challenge" />
    },
    {
      id: 'data-interpretation',
      title: 'Data Analysis',
      description: 'Practice interpreting charts, graphs, and statistical information',
      icon: BarChart3,
      participants: 28,
      difficulty: 'Advanced',
      category: 'Analytics',
      featured: false,
      component: () => <ComingSoonChallenge title="Data Analysis Challenge" />
    }
  ];
  
  const liveSessions: LiveSession[] = [
    { title: 'Advanced Excel Techniques', host: 'Sarah Chen', time: '2:30 PM', participants: 18 },
    { title: 'Design Thinking Workshop', host: 'Michael Torres', time: '3:00 PM', participants: 12 },
    { title: 'Technical Writing Masterclass', host: 'Dr. Amanda Foster', time: '4:00 PM', participants: 22 },
    { title: 'Project Management Essentials', host: 'David Kim', time: '5:00 PM', participants: 15 }
  ];
  
  const leaderboard: LeaderboardEntry[] = [
    { name: 'Alexandra M.', score: '2,840 pts', rank: 1 },
    { name: 'Robert C.', score: '2,756 pts', rank: 2 },
    { name: 'Jennifer L.', score: '2,623 pts', rank: 3 },
    { name: 'Marcus T.', score: '2,445 pts', rank: 4 },
    { name: 'Elena R.', score: '2,381 pts', rank: 5 }
  ];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const openChallenge = (challengeId: string) => {
    setSelectedChallenge(challengeId);
  };
  
  const closeChallenge = () => {
    setSelectedChallenge(null);
  };
  
  const selectedChallengeData = skillChallenges.find(c => c.id === selectedChallenge);
  
  return {
    user,
    selectedChallenge,
    onlineUsers,
    activeSessions,
    completedToday,
    skillChallenges,
    liveSessions,
    leaderboard,
    selectedChallengeData,
    getInitials,
    openChallenge,
    closeChallenge
  };
};