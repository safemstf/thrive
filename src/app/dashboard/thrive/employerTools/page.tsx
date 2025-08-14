// src/app/dashboard/thrive/employerTools/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  HeroSection,
  HeroBadge,
  HeroTitle,
  HeroSubtitle,
  HeroStats,
  StatItem,
  StatValue,
  StatLabel,
  LiveIndicator,
  CTAButtons,
  PrimaryButton,
  SecondaryButton,
  GlassSection,
  SectionTitle,
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  CTASection,
  CTATitle,
  CTADescription,
  CardsGrid,
  AssessmentCard,
  CardIcon,
  CardContent,
  CardTitle,
  CardDescription,
  CardMetrics,
  MetricItem,
  MetricLabel,
  FloatingCard,
  BenefitItem,
  ActionCard
} from '@/app/thrive/styles';
import { 
  Shield, 
  ShieldCheck, 
  FileText,
  UserCheck,
  Brain,
  Bot,
  CandlestickChart,
  BadgeCheck,
  Zap,
  Rocket,
  LayoutDashboard,
  Gauge,
  Lightbulb,
  Sparkles,
  Target,
  CircleDollarSign,
  BadgeDollarSign,
  ArrowRight,
  BarChart,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
  status?: 'active' | 'pending' | 'inactive';
  metrics?: { label: string; value: string }[];
  color: string;
};

const toolColors = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)', // Purple
  'linear-gradient(135deg, #0ea5e9, #0284c7)', // Blue
  'linear-gradient(135deg, #10b981, #059669)', // Green
  'linear-gradient(135deg, #f59e0b, #d97706)', // Amber
  'linear-gradient(135deg, #ec4899, #db2777)', // Pink
  'linear-gradient(135deg, #f97316, #ea580c)', // Orange
  'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Violet
  'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
];

export type EmployerToolsPageProps = {
  onToolAction: (toolId: string) => void;
};

export default function EmployerToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [stats] = useState([
    { value: '78%', label: 'Reduced Hiring Time', live: true },
    { value: '42%', label: 'Lower Cost Per Hire', live: false },
    { value: '92%', label: 'Candidate Satisfaction', live: true },
    { value: '65%', label: 'Diversity Increase', live: false },
  ]);

  // Updated tools for the AI-driven market
  const tools: Tool[] = [
    {
      id: 'ai-screening',
      title: 'AI Resume Screening',
      description: 'Automatically screen resumes using AI to identify top candidates based on skills and experience',
      icon: <FileText size={24} />,
      actionLabel: 'Start Screening',
      status: 'active',
      metrics: [
        { label: 'Accuracy', value: '95%' },
        { label: 'Time Saved', value: '15h/week' }
      ],
      color: toolColors[0]
    },
    {
      id: 'candidate-matching',
      title: 'AI Talent Matching',
      description: 'Match candidates to roles using predictive algorithms and skills analysis',
      icon: <UserCheck size={24} />,
      actionLabel: 'Find Matches',
      status: 'active',
      metrics: [
        { label: 'Match Rate', value: '89%' },
        { label: 'Quality Score', value: '4.7/5' }
      ],
      color: toolColors[1]
    },
    {
      id: 'skills-forecasting',
      title: 'Skills Gap Forecasting',
      description: 'Predict future skill requirements and identify current gaps in your workforce',
      icon: <Brain size={24} />,
      actionLabel: 'Analyze Gaps',
      status: 'active',
      metrics: [
        { label: 'Predictive Accuracy', value: '92%' },
        { label: 'Gaps Identified', value: '12.5 avg' }
      ],
      color: toolColors[2]
    },
    {
      id: 'bias-detection',
      title: 'Bias Detection',
      description: 'Identify and eliminate unconscious bias in job descriptions and hiring processes',
      icon: <ShieldCheck size={24} />,
      actionLabel: 'Detect Bias',
      status: 'active',
      metrics: [
        { label: 'Bias Reduction', value: '74%' },
        { label: 'Diversity Gain', value: '38%' }
      ],
      color: toolColors[3]
    },
    {
      id: 'virtual-interview',
      title: 'AI Interview Assistant',
      description: 'Conduct and analyze interviews with AI-powered insights and sentiment analysis',
      icon: <Bot size={24} />,
      actionLabel: 'Start Interview',
      status: 'pending',
      metrics: [
        { label: 'Coming Soon', value: 'Q3 2024' }
      ],
      color: toolColors[4]
    },
    {
      id: 'retention-analytics',
      title: 'Retention Predictor',
      description: 'Predict employee retention risks and identify factors influencing turnover',
      icon: <BarChart size={24} />,
      actionLabel: 'Predict Retention',
      status: 'pending',
      metrics: [
        { label: 'Launch Date', value: 'Aug 2024' }
      ],
      color: toolColors[5]
    },
    {
      id: 'market-intelligence',
      title: 'Market Intelligence',
      description: 'Real-time insights on talent market trends, salary benchmarks, and competitor analysis',
      icon: <CandlestickChart size={24} />,
      actionLabel: 'View Insights',
      status: 'inactive',
      color: toolColors[6]
    },
    {
      id: 'skills-validation',
      title: 'Blockchain Credential Verification',
      description: 'Verify candidate credentials and skills using blockchain technology',
      icon: <BadgeCheck size={24} />,
      actionLabel: 'Verify Credentials',
      status: 'active',
      metrics: [
        { label: 'Verification Speed', value: '2.4 min' },
        { label: 'Fraud Detection', value: '100%' }
      ],
      color: toolColors[7]
    },
  ];

  const handleToolAction = (toolId: string) => {
    setActiveTool(toolId);
    // keep this internal for now — page components should not accept custom props in app routes
    console.log(`Action triggered for tool: ${toolId}`);
    // If you absolutely need to notify an outer consumer, move the interactive panel into a subcomponent
    // that accepts a callback prop and render that subcomponent from a parent that isn't a page route.
  };

  const handleRequestDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDemoModal(true);
  };

  // Animation variants with proper easing types
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <HeroSection className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <HeroBadge className="inline-flex items-center mb-6">
              <Zap size={16} className="mr-2 animate-pulse" />
              AI-POWERED HIRING SUITE
            </HeroBadge>
            
            <HeroTitle className="mb-6">
              Transform Your Talent Acquisition with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">AI Intelligence</span>
            </HeroTitle>
            
            <HeroSubtitle className="max-w-3xl mx-auto text-xl text-gray-700">
              Future-ready solutions that help enterprise employers find, verify, and retain top talent in the AI era. 
              Our platform uses machine learning to solve today's biggest hiring challenges.
            </HeroSubtitle>
          </motion.div>

          <HeroStats className="mt-16 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <StatItem key={index}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
                {stat.live && <LiveIndicator />}
              </StatItem>
            ))}
          </HeroStats>

          <CTAButtons className="mt-12">
            <PrimaryButton onClick={handleRequestDemo}>
              <Rocket size={18} className="mr-2" />
              Request Enterprise Demo
            </PrimaryButton>
            <SecondaryButton>
              <LayoutDashboard size={18} className="mr-2" />
              Explore All Features
            </SecondaryButton>
          </CTAButtons>
        </div>
      </HeroSection>

      {/* rest of the component unchanged... */}
      {/* Tools grid, ROI, CTA sections (same as your original) */}
      <GlassSection className="py-16">
        {/* ... */}
        {/* Keeping your layout; see original code for full details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle className="text-center mb-4">
            <Target size={32} className="mr-3" />
            AI-Powered Employer Tools
          </SectionTitle>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-16">
            Future-ready solutions designed to transform your talent acquisition process
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tools.map((tool) => (
              <motion.div key={tool.id} variants={itemVariants} whileHover={{ y: -10 }}>
                <AssessmentCard 
                  $color={tool.color}
                  className="h-full flex flex-col"
                  onClick={() => tool.status === 'active' && handleToolAction(tool.id)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <CardIcon $color={tool.color}>{tool.icon}</CardIcon>
                    <CardContent>
                      <CardTitle>{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardContent>
                  </div>

                  {tool.metrics && (
                    <CardMetrics>
                      {tool.metrics.map((metric, idx) => (
                        <MetricItem key={idx}>
                          <MetricLabel>{metric.label}</MetricLabel>
                          <MetricLabel>{metric.value}</MetricLabel>
                        </MetricItem>
                      ))}
                    </CardMetrics>
                  )}

                  <div className="mt-auto pt-4">
                    <PrimaryButton className="w-full" disabled={tool.status !== 'active'}>
                      {tool.actionLabel}
                      <ArrowRight size={16} className="ml-2" />
                    </PrimaryButton>
                    {tool.status === 'pending' && <div className="text-center mt-3 text-sm text-amber-600 font-medium">Coming Soon</div>}
                    {tool.status === 'inactive' && <div className="text-center mt-3 text-sm text-purple-600 font-medium">Premium Feature</div>}
                  </div>
                </AssessmentCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </GlassSection>

      {/* ROI Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 text-center border border-blue-100">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-100 text-blue-800 py-2 px-6 rounded-full inline-flex items-center text-sm font-medium mb-6">
              <CircleDollarSign size={16} className="mr-2" />
              PROVEN ROI
            </div>
            
            <h2 className="text-3xl font-bold mb-6">Average Results from Our Enterprise Clients</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">78%</div>
                <div className="text-gray-600">Reduced time-to-hire</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">$1.4M</div>
                <div className="text-gray-600">Annual hiring cost savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">65%</div>
                <div className="text-gray-600">Increase in diversity</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-amber-600 mb-2">92%</div>
                <div className="text-gray-600">Candidate satisfaction</div>
              </div>
            </div>
            
            <ActionCard className="max-w-lg mx-auto mt-10">
              <BadgeDollarSign size={24} className="text-amber-600" />
              <div className="text-left">
                <h3 className="font-bold">Calculate your potential savings</h3>
                <p className="text-sm text-gray-600">Use our ROI calculator to estimate your savings</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-gray-500" />
            </ActionCard>
          </div>
        </div>
      </div>

      {/* Enterprise CTA Section */}
      <CTASection className="my-20">
        <div className="max-w-4xl mx-auto text-center">
          <CTATitle className="mb-6">
            Ready to Transform Your Hiring?
          </CTATitle>
          
          <CTADescription className="mb-10">
            Join leading enterprises that have reduced hiring costs by 42% and improved candidate 
            quality by 65% with our AI-powered platform.
          </CTADescription>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <PrimaryButton 
              className="px-8 py-4 text-lg"
              onClick={handleRequestDemo}
            >
              <Rocket size={20} className="mr-2" />
              Request Enterprise Demo
            </PrimaryButton>
            <SecondaryButton className="px-8 py-4 text-lg">
              <BarChart size={20} className="mr-2" />
              View Case Studies
            </SecondaryButton>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <BenefitItem>
              <div className="bg-green-100 text-green-800 rounded-full p-1">
                <ShieldCheck size={16} />
              </div>
              <span>SOC 2 Type II Certified</span>
            </BenefitItem>
            <BenefitItem>
              <div className="bg-blue-100 text-blue-800 rounded-full p-1">
                <Users size={16} />
              </div>
              <span>GDPR & CCPA Compliant</span>
            </BenefitItem>
            <BenefitItem>
              <div className="bg-purple-100 text-purple-800 rounded-full p-1">
                <Sparkles size={16} />
              </div>
              <span>Ethical AI Framework</span>
            </BenefitItem>
          </div>
        </div>
      </CTASection>
    </div>
  );
}