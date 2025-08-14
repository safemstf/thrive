// src/app/dashboard/thrive/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Section, 
  SectionHeader, 
  SectionTitle, 
  ViewAllLink,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  FilterContainer,
  FilterLabel,
  FilterSelect,
  MetricCard,
  MetricValue,
  MetricLabel,
  MetricChange,
  ChartContainer
} from '@/components/dashboard/dashboardStyles';
import { BarChart3, Filter, Download, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { theme, themeUtils } from '@/styles/theme'; // Import themeUtils here
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

  // Top skills data
  const topSkills = {
    labels: ['AI Engineering', 'Cloud Security', 'Data Analytics', 'UX Research', 'Blockchain', 'DevOps', 'Quantum Computing'],
    datasets: [
      {
        label: 'Demand Score',
        data: [92, 87, 85, 78, 76, 74, 68],
        backgroundColor: theme.colors.accent.indigo,
        borderRadius: 4,
      }
    ]
  };

  // Market trends data
  const trendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Tech Industry',
        data: [65, 59, 80, 81, 76, 75, 90],
        borderColor: theme.colors.accent.blue,
        backgroundColor: themeUtils.alpha(theme.colors.accent.blue, 0.1),
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Your Skills',
        data: [45, 52, 60, 75, 70, 78, 85],
        borderColor: theme.colors.accent.cyan,
        backgroundColor: themeUtils.alpha(theme.colors.accent.cyan, 0.1),
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Salary comparison data
  const salaryData = {
    labels: ['Entry', 'Mid', 'Senior', 'Expert'],
    datasets: [
      {
        label: 'AI/ML Specialist',
        data: [85, 110, 155, 220],
        backgroundColor: theme.colors.accent.purple,
      },
      {
        label: 'Industry Average',
        data: [65, 95, 130, 180],
        backgroundColor: theme.colors.accent.rose,
      }
    ]
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
        <div className="filter-group">
          <FilterLabel><Filter size={14} /> Filters</FilterLabel>
          <FilterSelect 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{ background: theme.colors.glass.primary }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </FilterSelect>
          
          <FilterSelect 
            value={skillFilter} 
            onChange={(e) => setSkillFilter(e.target.value)}
            style={{ background: theme.colors.glass.primary }}
          >
            <option value="all">All Skills</option>
            <option value="tech">Technical Skills</option>
            <option value="design">Design Skills</option>
            <option value="business">Business Skills</option>
          </FilterSelect>
          
          <FilterSelect 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ background: theme.colors.glass.primary }}
          >
            <option value="global">Global</option>
            <option value="north-america">North America</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia Pacific</option>
          </FilterSelect>
        </div>
      </FilterContainer>

      {/* Summary Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl
      }}>
        {metrics.map((metric, index) => (
          <MetricCard key={index} style={{ background: theme.colors.glass.card }}>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricValue>{metric.value}</MetricValue>
            <MetricChange positive={metric.positive}>
              {metric.positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {metric.change}
            </MetricChange>
          </MetricCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: theme.spacing.xl,
        marginBottom: theme.spacing.xl
      }}>
        {/* Top Skills Chart */}
        <Card style={{ background: theme.colors.glass.card }}>
          <CardHeader>
            <CardTitle>Top In-Demand Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <Bar 
                data={topSkills} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { 
                      backgroundColor: theme.colors.glass.dark,
                      titleFont: { family: theme.typography.fonts.primary },
                      bodyFont: { family: theme.typography.fonts.primary }
                    }
                  },
                  scales: {
                    y: {
                      grid: { color: themeUtils.alpha(theme.colors.border.medium, 0.2) },
                      ticks: { color: theme.colors.text.secondary }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: theme.colors.text.secondary }
                    }
                  }
                }}
              />
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <span style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.sizes.sm }}>
              Based on market demand signals from 12K+ companies
            </span>
          </CardFooter>
        </Card>

        {/* Market Trends Chart */}
        <Card style={{ background: theme.colors.glass.card }}>
          <CardHeader>
            <CardTitle>Market Trend Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <Line 
                data={trendsData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: { 
                      backgroundColor: theme.colors.glass.dark,
                      titleFont: { family: theme.typography.fonts.primary },
                      bodyFont: { family: theme.typography.fonts.primary }
                    }
                  },
                  scales: {
                    y: {
                      grid: { color: themeUtils.alpha(theme.colors.border.medium, 0.2) },
                      ticks: { color: theme.colors.text.secondary }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: theme.colors.text.secondary }
                    }
                  },
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
            <span style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.sizes.sm }}>
              Trend index compared to industry benchmarks
            </span>
          </CardFooter>
        </Card>

        {/* Salary Comparison Chart */}
        <Card style={{ background: theme.colors.glass.card }}>
          <CardHeader>
            <CardTitle>Salary Benchmark (USD thousands)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <Bar 
                data={salaryData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: { 
                      backgroundColor: theme.colors.glass.dark,
                      titleFont: { family: theme.typography.fonts.primary },
                      bodyFont: { family: theme.typography.fonts.primary }
                    }
                  },
                  scales: {
                    y: {
                      grid: { color: themeUtils.alpha(theme.colors.border.medium, 0.2) },
                      ticks: { 
                        color: theme.colors.text.secondary,
                        callback: (value: string | number) => `$${value}K`
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: theme.colors.text.secondary }
                    }
                  }
                }}
              />
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <span style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.sizes.sm }}>
              Based on 35K+ salary records across tech companies
            </span>
          </CardFooter>
        </Card>

        {/* Skill Gap Analysis */}
        <Card style={{ background: theme.colors.glass.card }}>
          <CardHeader>
            <CardTitle>Your Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: theme.spacing.md,
              padding: `${theme.spacing.md} 0`
            }}>
              {[
                { skill: 'Cloud Architecture', match: 92, needed: 95 },
                { skill: 'AI Prompt Engineering', match: 78, needed: 90 },
                { skill: 'Data Visualization', match: 85, needed: 85 },
                { skill: 'Quantum Computing', match: 45, needed: 70 }
              ].map((item, index) => (
                <div key={index}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.xs
                  }}>
                    <span style={{ fontWeight: theme.typography.weights.medium }}>{item.skill}</span>
                    <span style={{ color: theme.colors.text.tertiary }}>{item.match}% / {item.needed}%</span>
                  </div>
                  <div style={{
                    height: 8,
                    width: '100%',
                    backgroundColor: theme.colors.background.tertiary,
                    borderRadius: theme.borderRadius.full,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${item.match}%`,
                      backgroundColor: item.match >= item.needed 
                        ? theme.colors.accent.emerald 
                        : theme.colors.accent.amber,
                      borderRadius: theme.borderRadius.full
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              color: theme.colors.primary[600],
              fontWeight: theme.typography.weights.medium,
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
              View full gap analysis <ChevronDown size={16} />
            </button>
          </CardFooter>
        </Card>
      </div>
    </Section>
  );
}