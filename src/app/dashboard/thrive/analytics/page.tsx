// src/app/dashboard/thrive/analytics/page.tsx - Lean & Efficient
'use client';

import React, { useState } from 'react';
import { BarChart3, Filter, Download, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Reuse existing styled components - no duplication!
import {
  Section,
  SectionHeader,
  SectionTitle,
  ViewAllLink,
  Card,
  CardContent,
  FilterContainer,
  FilterSelect,
  MetricCard,
  MetricValue,
  MetricLabel,
  MetricChange,
  ChartContainer,
  Grid,
  FlexRow,
  FlexColumn,
  BaseButton,
  Heading3,
  BodyText
} from '@/components/dashboard/dashboardStyles';

import styled from 'styled-components';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ===========================================
// ANALYTICS-SPECIFIC COMPONENTS ONLY
// ===========================================

const MetricsGrid = styled(Grid).attrs({ 
  $minWidth: '240px', 
  $gap: 'var(--spacing-lg)' 
})`
  margin-bottom: var(--spacing-xl);
`;

const ChartsGrid = styled(Grid).attrs({ 
  $minWidth: '500px', 
  $gap: 'var(--spacing-xl)' 
})`
  margin-bottom: var(--spacing-xl);
`;

const SkillGapItem = styled(FlexColumn).attrs({ $gap: 'var(--spacing-xs)' })``;

const SkillGapHeader = styled(FlexRow).attrs({ $justify: 'space-between' })`
  margin-bottom: var(--spacing-xs);
`;

const SkillGapBar = styled.div`
  height: 8px;
  width: 100%;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
`;

const SkillGapFill = styled.div<{ $percentage: number; $isComplete: boolean }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$isComplete ? '#10b981' : '#f59e0b'};
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
`;

const FilterGroup = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-md)', 
  $align: 'center' 
})``;

const FilterLabel = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-xs)', 
  $align: 'center' 
})`
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
`;

const CardFooter = styled.div`
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-background-tertiary);
`;

const SkillGapContainer = styled(FlexColumn).attrs({ $gap: 'var(--spacing-md)' })`
  padding: var(--spacing-md) 0;
`;

export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState('30d');
  const [skillFilter, setSkillFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('global');

  // Summary metrics data
  const metrics = [
    { label: 'Total Skills Tracked', value: '1,248', change: '+4.2%', positive: true },
    { label: 'In-Demand Skills', value: '327', change: '+12.1%', positive: true },
    { label: 'Emerging Skills', value: '42', change: '+8.7%', positive: true },
    { label: 'Declining Skills', value: '18', change: '-3.2%', positive: false },
  ];

  // Chart data with CSS variables
  const topSkills = {
    labels: ['AI Engineering', 'Cloud Security', 'Data Analytics', 'UX Research', 'Blockchain', 'DevOps', 'Quantum Computing'],
    datasets: [
      {
        label: 'Demand Score',
        data: [92, 87, 85, 78, 76, 74, 68],
        backgroundColor: '#6366f1',
        borderRadius: 4,
      }
    ]
  };

  const trendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Tech Industry',
        data: [65, 59, 80, 81, 76, 75, 90],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Your Skills',
        data: [45, 52, 60, 75, 70, 78, 85],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const salaryData = {
    labels: ['Entry', 'Mid', 'Senior', 'Expert'],
    datasets: [
      {
        label: 'AI/ML Specialist',
        data: [85, 110, 155, 220],
        backgroundColor: '#8b5cf6',
      },
      {
        label: 'Industry Average',
        data: [65, 95, 130, 180],
        backgroundColor: '#f43f5e',
      }
    ]
  };

  const skillGapData = [
    { skill: 'Cloud Architecture', match: 92, needed: 95 },
    { skill: 'AI Prompt Engineering', match: 78, needed: 90 },
    { skill: 'Data Visualization', match: 85, needed: 85 },
    { skill: 'Quantum Computing', match: 45, needed: 70 }
  ];

  // Chart options with CSS variables
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: 'var(--font-body)' },
        bodyFont: { family: 'var(--font-body)' }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: 'var(--color-text-secondary)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--color-text-secondary)' }
      }
    }
  };

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <BarChart3 size={18} />
          Skills Analytics & Market Intelligence
        </SectionTitle>
        <ViewAllLink>
          <Download size={14} />
          Export Report
        </ViewAllLink>
      </SectionHeader>

      <FilterContainer>
        <FilterGroup>
          <FilterLabel>
            <Filter size={14} /> 
            Filters
          </FilterLabel>
          <FilterSelect 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </FilterSelect>
          
          <FilterSelect 
            value={skillFilter} 
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="all">All Skills</option>
            <option value="tech">Technical Skills</option>
            <option value="design">Design Skills</option>
            <option value="business">Business Skills</option>
          </FilterSelect>
          
          <FilterSelect 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="global">Global</option>
            <option value="north-america">North America</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia Pacific</option>
          </FilterSelect>
        </FilterGroup>
      </FilterContainer>

      {/* Summary Metrics Grid */}
      <MetricsGrid>
        {metrics.map((metric, index) => (
          <MetricCard key={index}>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricValue>{metric.value}</MetricValue>
            <MetricChange $positive={metric.positive}>
              {metric.positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {metric.change}
            </MetricChange>
          </MetricCard>
        ))}
      </MetricsGrid>

      {/* Charts Grid */}
      <ChartsGrid>
        {/* Top Skills Chart */}
        <Card>
          <CardContent>
            <Heading3 style={{ margin: '0 0 var(--spacing-lg) 0' }}>
              Top In-Demand Skills
            </Heading3>
            <ChartContainer>
              <Bar data={topSkills} options={chartOptions} />
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <BodyText style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Based on market demand signals from 12K+ companies
            </BodyText>
          </CardFooter>
        </Card>

        {/* Market Trends Chart */}
        <Card>
          <CardContent>
            <Heading3 style={{ margin: '0 0 var(--spacing-lg) 0' }}>
              Market Trend Comparison
            </Heading3>
            <ChartContainer>
              <Line 
                data={trendsData} 
                options={{
                  ...chartOptions,
                  elements: {
                    point: {
                      radius: 4,
                      hoverRadius: 6
                    }
                  }
                }}
              />
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <BodyText style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Trend index compared to industry benchmarks
            </BodyText>
          </CardFooter>
        </Card>

        {/* Salary Comparison Chart */}
        <Card>
          <CardContent>
            <Heading3 style={{ margin: '0 0 var(--spacing-lg) 0' }}>
              Salary Benchmark (USD thousands)
            </Heading3>
            <ChartContainer>
              <Bar 
                data={salaryData} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: { 
                        color: 'var(--color-text-secondary)',
                        callback: (value: string | number) => `$${value}K`
                      }
                    }
                  }
                }}
              />
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <BodyText style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Based on 35K+ salary records across tech companies
            </BodyText>
          </CardFooter>
        </Card>

        {/* Skill Gap Analysis */}
        <Card>
          <CardContent>
            <Heading3 style={{ margin: '0 0 var(--spacing-lg) 0' }}>
              Your Skill Gap Analysis
            </Heading3>
            <SkillGapContainer>
              {skillGapData.map((item, index) => (
                <SkillGapItem key={index}>
                  <SkillGapHeader>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {item.skill}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {item.match}% / {item.needed}%
                    </span>
                  </SkillGapHeader>
                  <SkillGapBar>
                    <SkillGapFill 
                      $percentage={item.match} 
                      $isComplete={item.match >= item.needed}
                    />
                  </SkillGapBar>
                </SkillGapItem>
              ))}
            </SkillGapContainer>
          </CardContent>
          <CardFooter>
            <BaseButton $variant="ghost">
              View full gap analysis 
              <ChevronDown size={16} />
            </BaseButton>
          </CardFooter>
        </Card>
      </ChartsGrid>
    </Section>
  );
}