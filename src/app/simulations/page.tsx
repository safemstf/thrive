// src/app/simulations/page.tsx
'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, RotateCcw, Settings, Brain, Zap, Activity,
  MessageSquare, Calculator, Lightbulb, BarChart3, Shield,
  ArrowRight, CheckCircle, Timer, Sparkles, Award, ChevronRight,
  Globe, Loader2, Users, TrendingUp, Star, Target, Trophy,
  Eye, Code, Cpu, Network, Sliders, Volume2, VolumeX
} from 'lucide-react';

// Import your existing styled components (you'll need to add these to your styles file)
import {
  PageWrapper, HeroSection, HeroTitle, HeroSubtitle, StatsContainer,
  StatItem, StatValue, StatLabel, CTAButtons, PrimaryButton,
  SecondaryButton, GlassSection, SectionTitle, CardsGrid,
  AssessmentCard, CardHeader, CardIcon, CardContent, CardTitle,
  CardDescription, CardMetrics, MetricItem, MetricLabel,
  FeatureGrid, FeatureCard, FeatureIcon, CTASection, CTATitle,
  CTADescription, SecurityFeatures, SecurityFeature, HeroBadge,
  CardFooter, ActionCard, BenefitsList, BenefitItem, LiveIndicator,
  TrustBadge, GradientText, FloatingCard
} from '../thrive/styles';

// AI Model types and interfaces
interface AIModel {
  id: string;
  name: string;
  type: 'language' | 'vision' | 'reasoning' | 'creative' | 'analytical';
  description: string;
  parameters: string;
  speed: number;
  accuracy: number;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  color: string;
  icon: React.ReactNode;
  activeUsers: number;
  avgResponse: number;
}

interface SimulationStats {
  activeModels: number;
  totalInteractions: number;
  avgLatency: number;
  successRate: number;
}

interface Agent {
  id: string;
  modelId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  activity: number;
  lastThought: string;
}

// AI Models data
const AI_MODELS: AIModel[] = [
  {
    id: 'gpt4',
    name: 'GPT-4 Turbo',
    type: 'language',
    description: 'Advanced language model with superior reasoning and creative capabilities',
    parameters: '1.7T',
    speed: 85,
    accuracy: 94,
    complexity: 'extreme',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    icon: <MessageSquare size={24} />,
    activeUsers: 12847,
    avgResponse: 1.2
  },
  {
    id: 'claude',
    name: 'Claude Sonnet',
    type: 'reasoning',
    description: 'Constitutional AI focused on helpful, harmless, and honest interactions',
    parameters: '175B',
    speed: 78,
    accuracy: 91,
    complexity: 'high',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    icon: <Brain size={24} />,
    activeUsers: 8923,
    avgResponse: 0.9
  },
  {
    id: 'dalle',
    name: 'DALL-E 3',
    type: 'vision',
    description: 'State-of-the-art image generation and visual understanding',
    parameters: '12B',
    speed: 65,
    accuracy: 89,
    complexity: 'high',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: <Eye size={24} />,
    activeUsers: 15642,
    avgResponse: 3.4
  },
  {
    id: 'codegen',
    name: 'CodeGen Pro',
    type: 'analytical',
    description: 'Specialized in code generation, debugging, and software engineering',
    parameters: '340B',
    speed: 92,
    accuracy: 87,
    complexity: 'high',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    icon: <Code size={24} />,
    activeUsers: 6754,
    avgResponse: 1.8
  },
  {
    id: 'creativity',
    name: 'CreativeAI',
    type: 'creative',
    description: 'Optimized for creative writing, storytelling, and artistic expression',
    parameters: '67B',
    speed: 71,
    accuracy: 83,
    complexity: 'medium',
    color: 'linear-gradient(135deg, #ec4899, #be185d)',
    icon: <Lightbulb size={24} />,
    activeUsers: 4231,
    avgResponse: 2.1
  },
  {
    id: 'analyst',
    name: 'DataMind',
    type: 'analytical',
    description: 'Specialized in data analysis, mathematical reasoning, and insights',
    parameters: '89B',
    speed: 88,
    accuracy: 96,
    complexity: 'medium',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    icon: <BarChart3 size={24} />,
    activeUsers: 3847,
    avgResponse: 1.5
  }
];

// Fishtank simulation component
const Fishtank = ({ selectedModels, isRunning, speed }: {
  selectedModels: string[];
  isRunning: boolean;
  speed: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize agents when selected models change
  useEffect(() => {
    const newAgents: Agent[] = [];
    selectedModels.forEach((modelId, index) => {
      const model = AI_MODELS.find(m => m.id === modelId);
      if (model) {
        // Create multiple agents per model for more activity
        for (let i = 0; i < 3; i++) {
          newAgents.push({
            id: `${modelId}-${i}`,
            modelId,
            x: Math.random() * 600 + 50,
            y: Math.random() * 300 + 50,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 8 + (model.complexity === 'extreme' ? 6 : model.complexity === 'high' ? 4 : 2),
            color: model.color.includes('gradient') ? 
              ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][index % 6] : 
              model.color,
            activity: Math.random(),
            lastThought: ''
          });
        }
      }
    });
    setAgents(newAgents);
  }, [selectedModels]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      setAgents(prev => prev.map(agent => {
        const canvas = canvasRef.current;
        if (!canvas) return agent;

        let newX = agent.x + agent.vx * speed;
        let newY = agent.y + agent.vy * speed;
        let newVx = agent.vx;
        let newVy = agent.vy;

        // Bounce off walls
        if (newX <= agent.size || newX >= canvas.width - agent.size) {
          newVx = -newVx;
          newX = Math.max(agent.size, Math.min(canvas.width - agent.size, newX));
        }
        if (newY <= agent.size || newY >= canvas.height - agent.size) {
          newVy = -newVy;
          newY = Math.max(agent.size, Math.min(canvas.height - agent.size, newY));
        }

        // Update activity (simulates AI thinking)
        const newActivity = Math.max(0, Math.min(1, agent.activity + (Math.random() - 0.5) * 0.1));

        return {
          ...agent,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          activity: newActivity
        };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, speed]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw agents
    agents.forEach(agent => {
      const model = AI_MODELS.find(m => m.id === agent.modelId);
      if (!model) return;

      // Draw agent body
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, agent.size, 0, 2 * Math.PI);
      ctx.fillStyle = agent.color;
      ctx.fill();

      // Draw activity indicator (glow effect)
      if (agent.activity > 0.5) {
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.size + 5, 0, 2 * Math.PI);
        ctx.fillStyle = `${agent.color}${Math.floor(agent.activity * 50).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }

      // Draw connections between nearby agents
      agents.forEach(otherAgent => {
        if (otherAgent.id !== agent.id) {
          const distance = Math.sqrt(
            Math.pow(agent.x - otherAgent.x, 2) + Math.pow(agent.y - otherAgent.y, 2)
          );
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(agent.x, agent.y);
            ctx.lineTo(otherAgent.x, otherAgent.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 - (distance / 100) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
    });
  }, [agents]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Fishtank Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} />
          <span style={{ fontWeight: '600' }}>AI Model Ecosystem</span>
          <LiveIndicator />
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          {agents.length} active agents
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={700}
        height={400}
        style={{
          width: '100%',
          height: '400px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.3), rgba(51, 65, 85, 0.3))',
          borderRadius: '0.5rem',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      />

      {/* Model indicators at bottom */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        {selectedModels.map(modelId => {
          const model = AI_MODELS.find(m => m.id === modelId);
          if (!model) return null;
          return (
            <div key={modelId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: 'white'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: model.color.includes('gradient') ? '#3b82f6' : model.color
              }} />
              {model.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple animated counter
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
};

// Main component
export default function SimulationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt4', 'claude']);
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Generate simulation stats
  const simulationStats = useMemo<SimulationStats>(() => ({
    activeModels: selectedModels.length,
    totalInteractions: Math.floor(Math.random() * 10000) + 50000,
    avgLatency: Math.random() * 2 + 0.5,
    successRate: Math.floor(Math.random() * 5) + 95
  }), [selectedModels]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSelectedModels(['gpt4', 'claude']);
    setSpeed(1);
    setIsRunning(true);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem'
        }}>
          <Loader2 size={48} className="animate-spin" />
          <p style={{ color: '#6b7280' }}>Initializing AI simulation environment...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroBadge>
          <Sparkles size={16} />
          <span>Live AI Model Ecosystem</span>
          <TrustBadge>
            <Activity size={12} />
            Active
          </TrustBadge>
        </HeroBadge>
        <HeroTitle>
          Explore AI Models in a
          <GradientText> Living Digital Environment</GradientText>
        </HeroTitle>
        <HeroSubtitle>
          Watch different AI models interact, compete, and collaborate in real-time. 
          Observe their behaviors, performance patterns, and emergent dynamics in our interactive simulation fishtank.
        </HeroSubtitle>
        
        <StatsContainer>
          <StatItem>
            <StatValue>
              <AnimatedCounter value={simulationStats.activeModels} />
            </StatValue>
            <StatLabel>Active Models</StatLabel>
          </StatItem>
          <StatItem>
            <LiveIndicator />
            <StatValue>
              <AnimatedCounter value={simulationStats.totalInteractions} duration={1500} />
            </StatValue>
            <StatLabel>Total Interactions</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {simulationStats.avgLatency.toFixed(1)}s
            </StatValue>
            <StatLabel>Avg Response Time</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              {simulationStats.successRate}%
            </StatValue>
            <StatLabel>Success Rate</StatLabel>
          </StatItem>
        </StatsContainer>

        {/* Simulation Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginTop: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <PrimaryButton onClick={handlePlayPause}>
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Pause' : 'Play'}
          </PrimaryButton>
          <SecondaryButton onClick={handleReset}>
            <RotateCcw size={18} />
            Reset
          </SecondaryButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
            <span style={{ fontSize: '0.875rem' }}>Speed:</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ fontSize: '0.875rem', minWidth: '30px' }}>{speed.toFixed(1)}x</span>
          </div>
          <SecondaryButton onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </SecondaryButton>
        </div>

        <BenefitsList>
          <BenefitItem>
            <CheckCircle size={16} color="#10b981" />
            <span>Real-time simulation • Interactive controls • Multiple AI models</span>
          </BenefitItem>
        </BenefitsList>
      </HeroSection>

      {/* Fishtank Section */}
      <GlassSection>
        <SectionTitle>
          <Brain size={28} />
          AI Model Fishtank
          <LiveIndicator />
        </SectionTitle>
        <Fishtank 
          selectedModels={selectedModels} 
          isRunning={isRunning} 
          speed={speed} 
        />
      </GlassSection>

      {/* AI Models Selection */}
      <GlassSection>
        <SectionTitle>
          <Cpu size={28} />
          Available AI Models
          <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '1rem' }}>
            Click to add/remove models from the simulation
          </span>
        </SectionTitle>
        <CardsGrid>
          {AI_MODELS.map((model) => {
            const isSelected = selectedModels.includes(model.id);
            
            return (
              <AssessmentCard
                key={model.id}
                $color={model.color}
                onClick={() => handleModelToggle(model.id)}
                style={{
                  opacity: isSelected ? 1 : 0.7,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(148, 163, 184, 0.2)'
                }}
              >
                <CardHeader>
                  <CardIcon $color={model.color}>
                    {model.icon}
                  </CardIcon>
                  <CardContent>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {model.name}
                      {isSelected && <CheckCircle size={16} color="#10b981" />}
                    </CardTitle>
                    <CardDescription>{model.description}</CardDescription>
                  </CardContent>
                </CardHeader>
                
                <CardMetrics>
                  <MetricItem>
                    <MetricLabel>
                      <Users size={14} />
                      {model.activeUsers.toLocaleString()} active
                    </MetricLabel>
                    <MetricLabel>
                      <Timer size={14} />
                      {model.avgResponse}s avg
                    </MetricLabel>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>
                      <Zap size={14} />
                      Speed: {model.speed}%
                    </MetricLabel>
                    <MetricLabel>
                      <Target size={14} />
                      Accuracy: {model.accuracy}%
                    </MetricLabel>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>
                      <Network size={14} />
                      {model.parameters} parameters
                    </MetricLabel>
                    <MetricLabel>
                      <BarChart3 size={14} />
                      {model.complexity} complexity
                    </MetricLabel>
                  </MetricItem>
                </CardMetrics>

                <CardFooter>
                  <ActionCard>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: isSelected ? '#10b981' : '#6b7280'
                    }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {isSelected ? 'Active in Simulation' : 'Add to Simulation'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {model.type} model
                      </div>
                    </div>
                    <ChevronRight size={16} />
                  </ActionCard>
                </CardFooter>
              </AssessmentCard>
            );
          })}
        </CardsGrid>
      </GlassSection>

      {/* Features Section */}
      <GlassSection>
        <SectionTitle>
          <Shield size={28} />
          Simulation Features
        </SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon><Activity size={24} /></FeatureIcon>
            <CardTitle>Real-time Interaction</CardTitle>
            <CardDescription>
              Watch AI models interact with each other in real-time, forming dynamic networks and behavioral patterns.
            </CardDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon><Brain size={24} /></FeatureIcon>
            <CardTitle>Behavioral Analysis</CardTitle>
            <CardDescription>
              Observe emergent behaviors, decision-making patterns, and collaborative dynamics between different AI architectures.
            </CardDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon><BarChart3 size={24} /></FeatureIcon>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Track performance indicators, response times, and success rates across different model types and configurations.
            </CardDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon><Settings size={24} /></FeatureIcon>
            <CardTitle>Interactive Controls</CardTitle>
            <CardDescription>
              Adjust simulation parameters, add or remove models, and experiment with different environmental conditions.
            </CardDescription>
          </FeatureCard>
        </FeatureGrid>
      </GlassSection>

      {/* CTA Section */}
      <CTASection>
        <CTATitle>Ready to Explore AI Model Dynamics?</CTATitle>
        <CTADescription>
          Dive deeper into AI behavior with advanced simulation tools and detailed analytics.
        </CTADescription>
        <CTAButtons>
          <PrimaryButton
            onClick={() => router.push('/dashboard/simulations')}
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            <Brain size={20} />
            Advanced Simulations
          </PrimaryButton>
        </CTAButtons>
        <SecurityFeatures>
          <SecurityFeature><CheckCircle size={16} color="#10b981" /> Real-time updates</SecurityFeature>
          <SecurityFeature><CheckCircle size={16} color="#10b981" /> Interactive controls</SecurityFeature>
          <SecurityFeature><CheckCircle size={16} color="#10b981" /> Multiple AI models</SecurityFeature>
        </SecurityFeatures>
      </CTASection>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        
        /* Respect reduced-motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </PageWrapper>
  );
}