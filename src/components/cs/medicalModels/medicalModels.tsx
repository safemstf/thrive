// src/components/cs/medicalModels/medicalModels.tsx
// AI-Powered Clinical Decision Support for Acute Vascular Surgery
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Activity, AlertTriangle, Heart, Droplets, Clock, ChevronDown, Stethoscope, Syringe, Brain } from 'lucide-react';

interface MedicalModelsDemoProps {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
}

type ModelType = 'predictive' | 'classification' | 'simulation';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  overflow: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ScrollContent = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: rgba(30, 41, 59, 0.5);
  padding: 0.375rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${p => p.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  color: ${p => p.$active ? '#a5b4fc' : '#94a3b8'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:hover {
    background: ${p => p.$active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(51, 65, 85, 0.5)'};
    color: ${p => p.$active ? '#a5b4fc' : '#e2e8f0'};
  }
  
  svg {
    opacity: 0.8;
  }
`;

const Card = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 1.25rem;
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.3s ease;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 1rem 0;
  
  svg {
    color: #60a5fa;
  }
`;

const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.$cols || 2}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricBox = styled.div<{ $color?: string }>`
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 1rem;
  border-left: 3px solid ${p => p.$color || '#3b82f6'};
`;

const MetricLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div<{ $color?: string }>`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${p => p.$color || '#e2e8f0'};
  font-family: 'JetBrains Mono', monospace;
`;

const MetricUnit = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin-left: 0.25rem;
`;

const Badge = styled.span<{ $variant?: 'critical' | 'warning' | 'success' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${p => {
    switch (p.$variant) {
      case 'critical':
        return `background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);`;
      case 'warning':
        return `background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);`;
      case 'success':
        return `background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);`;
      default:
        return `background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);`;
    }
  }}
`;

const AlertBox = styled.div<{ $critical?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  border-radius: 10px;
  background: ${p => p.$critical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
  border: 1px solid ${p => p.$critical ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'};
  margin-bottom: 0.5rem;
  animation: ${fadeIn} 0.3s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertIcon = styled.div<{ $critical?: boolean }>`
  color: ${p => p.$critical ? '#f87171' : '#fbbf24'};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div<{ $critical?: boolean }>`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${p => p.$critical ? '#f87171' : '#fbbf24'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const AlertMessage = styled.div`
  font-size: 0.8rem;
  color: #e2e8f0;
  line-height: 1.4;
`;

const SliderGroup = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const SliderLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #94a3b8;
`;

const SliderValue = styled.span<{ $warning?: boolean; $critical?: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: ${p => p.$critical ? '#f87171' : p.$warning ? '#fbbf24' : '#e2e8f0'};
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  appearance: none;
  background: #334155;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const SliderHints = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.65rem;
  color: #64748b;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.2);
  }
  
  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #6366f1;
  }
  
  span {
    font-size: 0.8rem;
    color: #cbd5e1;
  }
`;

const GaugeContainer = styled.div`
  margin-bottom: 0.75rem;
`;

const GaugeBar = styled.div`
  height: 8px;
  background: #1e293b;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.375rem;
`;

const GaugeFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${p => p.$width}%;
  background: ${p => p.$color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const GaugeLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
  
  option {
    background: #1e293b;
  }
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GradeCircle = styled.div<{ $color: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${p => p.$color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 32px ${p => p.$color}40;
`;

const GradeNumber = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
`;

const GradeUrgency = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ResultCard = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ResultLabel = styled.div`
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.375rem;
`;

const ResultValue = styled.div<{ $color?: string }>`
  font-size: 0.9rem;
  color: ${p => p.$color || '#e2e8f0'};
  font-weight: 600;
  line-height: 1.5;
`;

const GradeScale = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const GradeSegment = styled.div<{ $color: string; $active: boolean }>`
  flex: 1;
  padding: 0.75rem 0.5rem;
  background: ${p => p.$color};
  border-radius: 6px;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
  opacity: ${p => p.$active ? 1 : 0.3};
  transition: opacity 0.3s ease;
  white-space: pre-line;
`;

const SimulationSVG = styled.svg`
  width: 100%;
  height: 200px;
  display: block;
  margin: 1rem 0;
`;

const PerfGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const PerfCard = styled.div<{ $borderColor?: string }>`
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  padding: 1rem;
  border-left: 3px solid ${p => p.$borderColor || '#3b82f6'};
`;

const PatientBox = styled.div<{ $urgent?: boolean }>`
  background: ${p => p.$urgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
  border: 1px solid ${p => p.$urgent ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)'};
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1rem;
`;

const PatientTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 0.75rem 0;
`;

const PatientText = styled.p`
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalModelsDemo: React.FC<MedicalModelsDemoProps> = ({ isDark = true, isRunning = true, speed = 1 }) => {
  const [activeTab, setActiveTab] = useState<ModelType>('predictive');
  
  // Predictive Model State
  const [patientData, setPatientData] = useState({
    systolicBP: 95,
    diastolicBP: 60,
    heartRate: 115,
    hemoglobin: 10.5,
    lactate: 3.5,
    wbc: 14.2,
    creatineKinase: 850,
    hoursSinceInjury: 4,
    hasVascularInjury: true,
    hasFracture: true,
    hasLimbIschemia: true,
    hasCatheter: true,
    hasOpenWound: false
  });

  // Classification State
  const [imagingData, setImagingData] = useState({
    modality: 'CT Angiography',
    vessel: 'Femoral Artery',
    injuryType: 'Laceration' as 'Intimal Injury' | 'Laceration' | 'Transection' | 'Thrombosis' | 'Pseudoaneurysm',
    occlusion: 75,
    hasCollateral: true
  });

  // Simulation State
  const [hemodynamics, setHemodynamics] = useState({
    proximalBP: 120,
    distalBP: 40,
    compartmentPressure: 25,
    timeToRevasc: 6
  });

  const [simulationTime, setSimulationTime] = useState(0);

  useEffect(() => {
    if (isRunning && activeTab === 'simulation') {
      const interval = setInterval(() => {
        setSimulationTime(prev => (prev + speed * 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed, activeTab]);

  // Calculations
  const calculateRisks = () => {
    const shockIndex = patientData.heartRate / patientData.systolicBP;
    const hemorrhageRisk = shockIndex > 1 ? 'CRITICAL' : shockIndex > 0.7 ? 'HIGH' : shockIndex > 0.5 ? 'MODERATE' : 'LOW';

    let infectionScore = 0;
    if (patientData.hasCatheter) infectionScore += 25;
    if (patientData.hasOpenWound) infectionScore += 30;
    if (patientData.wbc > 12) infectionScore += 25;
    if (patientData.hasVascularInjury) infectionScore += 20;

    let compartmentScore = 0;
    if (patientData.hasLimbIschemia) compartmentScore += 40;
    if (patientData.creatineKinase > 1000) compartmentScore += 30;
    if (patientData.hasFracture) compartmentScore += 20;
    if (patientData.hoursSinceInjury > 4) compartmentScore += 10;

    let messScore = 0;
    if (patientData.hasFracture) messScore += 3;
    if (patientData.hasLimbIschemia) {
      if (patientData.hoursSinceInjury < 6) messScore += 1;
      else if (patientData.hoursSinceInjury < 12) messScore += 2;
      else messScore += 3;
    }
    if (patientData.systolicBP < 90) messScore += 2;

    const limbThreat = patientData.hoursSinceInjury > 6 ? 'CRITICAL' :
      patientData.hoursSinceInjury > 4 ? 'THREATENED' : 'AT RISK';

    return {
      shockIndex: shockIndex.toFixed(2),
      hemorrhageRisk,
      hemorrhageScore: shockIndex * 100,
      infectionScore: Math.min(100, infectionScore),
      compartmentScore: Math.min(100, compartmentScore),
      messScore,
      limbThreat,
      criticalAlerts: [
        patientData.systolicBP < 90 && { type: 'CRITICAL', msg: 'Hypotensive - Hemorrhagic Shock' },
        shockIndex > 1 && { type: 'CRITICAL', msg: 'Shock Index >1.0 - Massive Hemorrhage' },
        patientData.lactate > 4 && { type: 'URGENT', msg: 'Elevated Lactate - Tissue Hypoperfusion' },
        patientData.hoursSinceInjury > 6 && { type: 'URGENT', msg: 'Prolonged Ischemia >6h - Amputation Risk' },
        compartmentScore > 60 && { type: 'URGENT', msg: 'High Compartment Syndrome Risk' }
      ].filter(Boolean) as { type: string; msg: string }[]
    };
  };

  const classifyInjury = () => {
    const { injuryType, occlusion } = imagingData;
    
    if (injuryType === 'Transection') {
      return { grade: 5, urgency: 'STAT', color: '#dc2626', needsSurgery: true,
        description: 'Complete transection with tissue loss',
        recommendation: 'IMMEDIATE operative repair - Life/limb threatening' };
    } else if (injuryType === 'Laceration' || occlusion > 75) {
      return { grade: 4, urgency: 'Emergent', color: '#ef4444', needsSurgery: true,
        description: 'Severe occlusion or active bleeding',
        recommendation: 'Emergent OR within 2 hours - Vascular repair required' };
    } else if (injuryType === 'Pseudoaneurysm' || occlusion > 50) {
      return { grade: 3, urgency: 'Urgent', color: '#f59e0b', needsSurgery: true,
        description: 'Pseudoaneurysm or significant stenosis',
        recommendation: 'Urgent repair within 6-12 hours' };
    } else if (occlusion > 25) {
      return { grade: 2, urgency: 'Scheduled', color: '#3b82f6', needsSurgery: false,
        description: 'Intimal injury with moderate stenosis',
        recommendation: 'Close monitoring, possible intervention within 24h' };
    } else {
      return { grade: 1, urgency: 'Routine', color: '#22c55e', needsSurgery: false,
        description: 'Minor intimal irregularity',
        recommendation: 'Observation and serial imaging' };
    }
  };

  const calculatePerfusion = () => {
    const perfPressure = hemodynamics.distalBP - hemodynamics.compartmentPressure;
    const gradient = hemodynamics.proximalBP - hemodynamics.distalBP;
    const compartmentSyndrome = perfPressure < 30;
    const timeLeft = Math.max(0, 6 - hemodynamics.timeToRevasc);

    let tissueStatus = 'Viable', statusColor = '#22c55e';
    if (perfPressure < 30 || timeLeft < 2) {
      tissueStatus = 'Critical';
      statusColor = '#dc2626';
    } else if (perfPressure < 40 || timeLeft < 4) {
      tissueStatus = 'At Risk';
      statusColor = '#f59e0b';
    }

    return { perfPressure, gradient, compartmentSyndrome, timeLeft, tissueStatus, statusColor,
      needsFasciotomy: compartmentSyndrome || hemodynamics.compartmentPressure > 30 };
  };

  const risks = calculateRisks();
  const injury = classifyInjury();
  const perfusion = calculatePerfusion();

  const getVariant = (level: string): 'critical' | 'warning' | 'success' | 'info' => {
    if (level.includes('CRITICAL')) return 'critical';
    if (level.includes('HIGH') || level.includes('URGENT') || level.includes('THREATENED')) return 'warning';
    if (level.includes('LOW') || level.includes('NORMAL') || level.includes('ACCEPTABLE')) return 'success';
    return 'info';
  };

  // Render tabs
  const renderPredictive = () => (
    <>
      {/* Alerts */}
      {risks.criticalAlerts.length > 0 && (
        <Card>
          <CardTitle><AlertTriangle size={18} /> AI Clinical Alerts</CardTitle>
          {risks.criticalAlerts.map((alert, i) => (
            <AlertBox key={i} $critical={alert.type === 'CRITICAL'}>
              <AlertIcon $critical={alert.type === 'CRITICAL'}>
                <AlertTriangle size={18} />
              </AlertIcon>
              <AlertContent>
                <AlertTitle $critical={alert.type === 'CRITICAL'}>{alert.type}</AlertTitle>
                <AlertMessage>{alert.msg}</AlertMessage>
              </AlertContent>
            </AlertBox>
          ))}
        </Card>
      )}

      {/* Metrics */}
      <Grid $cols={4}>
        <MetricBox $color={risks.hemorrhageRisk === 'CRITICAL' ? '#ef4444' : risks.hemorrhageRisk === 'HIGH' ? '#f59e0b' : '#3b82f6'}>
          <MetricLabel>Shock Index</MetricLabel>
          <MetricValue>{risks.shockIndex}</MetricValue>
          <Badge $variant={getVariant(risks.hemorrhageRisk)}>{risks.hemorrhageRisk}</Badge>
        </MetricBox>
        <MetricBox $color={risks.limbThreat === 'CRITICAL' ? '#ef4444' : '#f59e0b'}>
          <MetricLabel>Limb Status</MetricLabel>
          <MetricValue>{patientData.hoursSinceInjury}<MetricUnit>hrs</MetricUnit></MetricValue>
          <Badge $variant={getVariant(risks.limbThreat)}>{risks.limbThreat}</Badge>
        </MetricBox>
        <MetricBox $color={patientData.hemoglobin < 10 ? '#ef4444' : '#22c55e'}>
          <MetricLabel>Hemoglobin</MetricLabel>
          <MetricValue>{patientData.hemoglobin}<MetricUnit>g/dL</MetricUnit></MetricValue>
          <Badge $variant={patientData.hemoglobin < 10 ? 'warning' : 'success'}>{patientData.hemoglobin < 10 ? 'LOW' : 'NORMAL'}</Badge>
        </MetricBox>
        <MetricBox $color={risks.messScore >= 7 ? '#ef4444' : '#3b82f6'}>
          <MetricLabel>MESS Score</MetricLabel>
          <MetricValue>{risks.messScore}</MetricValue>
          <Badge $variant={risks.messScore >= 7 ? 'critical' : 'success'}>{risks.messScore >= 7 ? 'HIGH RISK' : 'ACCEPTABLE'}</Badge>
        </MetricBox>
      </Grid>

      {/* Risk Gauges */}
      <TwoColumn>
        <Card>
          <CardTitle><Heart size={18} /> Hemorrhagic Shock Risk</CardTitle>
          <GaugeContainer>
            <GaugeBar>
              <GaugeFill 
                $width={Math.min(100, risks.hemorrhageScore / 1.5)} 
                $color={risks.hemorrhageScore > 90 ? '#ef4444' : risks.hemorrhageScore > 45 ? '#f59e0b' : '#22c55e'} 
              />
            </GaugeBar>
            <GaugeLabel>
              <span style={{ color: '#94a3b8' }}>Risk Score</span>
              <span style={{ color: risks.hemorrhageScore > 90 ? '#f87171' : '#e2e8f0', fontWeight: 700 }}>{risks.hemorrhageScore.toFixed(0)}%</span>
            </GaugeLabel>
          </GaugeContainer>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
            BP: {patientData.systolicBP}/{patientData.diastolicBP} mmHg<br/>
            HR: {patientData.heartRate} bpm • Lactate: {patientData.lactate} mmol/L
          </div>
        </Card>

        <Card>
          <CardTitle><Activity size={18} /> Compartment Syndrome Risk</CardTitle>
          <GaugeContainer>
            <GaugeBar>
              <GaugeFill 
                $width={risks.compartmentScore} 
                $color={risks.compartmentScore > 60 ? '#ef4444' : risks.compartmentScore > 30 ? '#f59e0b' : '#22c55e'} 
              />
            </GaugeBar>
            <GaugeLabel>
              <span style={{ color: '#94a3b8' }}>Risk Score</span>
              <span style={{ color: risks.compartmentScore > 60 ? '#f87171' : '#e2e8f0', fontWeight: 700 }}>{risks.compartmentScore}%</span>
            </GaugeLabel>
          </GaugeContainer>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {patientData.hasLimbIschemia && '• Limb ischemia present\n'}
            {patientData.hasFracture && '• Fracture present\n'}
            Time since injury: {patientData.hoursSinceInjury}h
          </div>
        </Card>
      </TwoColumn>

      {/* Controls */}
      <Card>
        <CardTitle><Stethoscope size={18} /> Patient Data Input</CardTitle>
        
        <Grid $cols={3}>
          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Systolic BP</SliderLabel>
              <SliderValue $critical={patientData.systolicBP < 90}>{patientData.systolicBP} mmHg</SliderValue>
            </SliderHeader>
            <Slider type="range" min="60" max="180" step="5" value={patientData.systolicBP}
              onChange={(e) => setPatientData({ ...patientData, systolicBP: +e.target.value })} />
            <SliderHints><span>60</span><span style={{ color: '#f87171' }}>Critical: &lt;90</span><span>180</span></SliderHints>
          </SliderGroup>

          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Heart Rate</SliderLabel>
              <SliderValue $warning={patientData.heartRate > 110}>{patientData.heartRate} bpm</SliderValue>
            </SliderHeader>
            <Slider type="range" min="40" max="180" step="5" value={patientData.heartRate}
              onChange={(e) => setPatientData({ ...patientData, heartRate: +e.target.value })} />
            <SliderHints><span>40</span><span style={{ color: '#fbbf24' }}>Tachy: &gt;110</span><span>180</span></SliderHints>
          </SliderGroup>

          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Hemoglobin</SliderLabel>
              <SliderValue $critical={patientData.hemoglobin < 10}>{patientData.hemoglobin} g/dL</SliderValue>
            </SliderHeader>
            <Slider type="range" min="5" max="18" step="0.5" value={patientData.hemoglobin}
              onChange={(e) => setPatientData({ ...patientData, hemoglobin: +e.target.value })} />
            <SliderHints><span>5</span><span style={{ color: '#f87171' }}>Anemia: &lt;10</span><span>18</span></SliderHints>
          </SliderGroup>

          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Lactate</SliderLabel>
              <SliderValue $critical={patientData.lactate > 4} $warning={patientData.lactate > 2}>{patientData.lactate} mmol/L</SliderValue>
            </SliderHeader>
            <Slider type="range" min="0.5" max="10" step="0.5" value={patientData.lactate}
              onChange={(e) => setPatientData({ ...patientData, lactate: +e.target.value })} />
            <SliderHints><span>0.5</span><span style={{ color: '#f87171' }}>Critical: &gt;4</span><span>10</span></SliderHints>
          </SliderGroup>

          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Hours Since Injury</SliderLabel>
              <SliderValue $critical={patientData.hoursSinceInjury > 6} $warning={patientData.hoursSinceInjury > 4}>{patientData.hoursSinceInjury}h</SliderValue>
            </SliderHeader>
            <Slider type="range" min="0" max="12" step="0.5" value={patientData.hoursSinceInjury}
              onChange={(e) => setPatientData({ ...patientData, hoursSinceInjury: +e.target.value })} />
            <SliderHints><span>0</span><span style={{ color: '#4ade80' }}>Golden: 0-6h</span><span>12</span></SliderHints>
          </SliderGroup>

          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Creatine Kinase</SliderLabel>
              <SliderValue $critical={patientData.creatineKinase > 1000}>{patientData.creatineKinase} U/L</SliderValue>
            </SliderHeader>
            <Slider type="range" min="50" max="5000" step="50" value={patientData.creatineKinase}
              onChange={(e) => setPatientData({ ...patientData, creatineKinase: +e.target.value })} />
            <SliderHints><span>50</span><span style={{ color: '#f87171' }}>Rhabdo: &gt;1000</span><span>5000</span></SliderHints>
          </SliderGroup>
        </Grid>

        <div style={{ marginTop: '1rem' }}>
          <SliderLabel style={{ marginBottom: '0.75rem', display: 'block' }}>Clinical Findings</SliderLabel>
          <CheckboxGrid>
            {[
              { key: 'hasVascularInjury', label: 'Vascular injury on CT' },
              { key: 'hasFracture', label: 'Fracture on X-ray' },
              { key: 'hasLimbIschemia', label: 'Limb ischemia (6 Ps)' },
              { key: 'hasCatheter', label: 'Foley catheter' },
              { key: 'hasOpenWound', label: 'Open wound' }
            ].map(item => (
              <Checkbox key={item.key}>
                <input type="checkbox" checked={patientData[item.key as keyof typeof patientData] as boolean}
                  onChange={(e) => setPatientData({ ...patientData, [item.key]: e.target.checked })} />
                <span>{item.label}</span>
              </Checkbox>
            ))}
          </CheckboxGrid>
        </div>
      </Card>
    </>
  );

  const renderClassification = () => (
    <>
      <TwoColumn>
        <Card>
          <CardTitle><Stethoscope size={18} /> Imaging Findings</CardTitle>
          
          <SliderGroup>
            <SliderLabel>Imaging Modality</SliderLabel>
            <Select value={imagingData.modality} onChange={(e) => setImagingData({ ...imagingData, modality: e.target.value })}>
              <option>X-ray</option>
              <option>CT Angiography</option>
              <option>Doppler Ultrasound</option>
              <option>Angiogram</option>
            </Select>
          </SliderGroup>

          <SliderGroup>
            <SliderLabel>Vessel Involved</SliderLabel>
            <Select value={imagingData.vessel} onChange={(e) => setImagingData({ ...imagingData, vessel: e.target.value })}>
              <option>Femoral Artery</option>
              <option>Popliteal Artery</option>
              <option>Tibial Arteries</option>
              <option>Brachial Artery</option>
              <option>Subclavian Artery</option>
            </Select>
          </SliderGroup>

          <SliderGroup>
            <SliderLabel>Injury Pattern</SliderLabel>
            <Select value={imagingData.injuryType} onChange={(e) => setImagingData({ ...imagingData, injuryType: e.target.value as any })}>
              <option>Intimal Injury</option>
              <option>Laceration</option>
              <option>Transection</option>
              <option>Thrombosis</option>
              <option>Pseudoaneurysm</option>
            </Select>
          </SliderGroup>

          <SliderGroup>
            <SliderHeader>
              <SliderLabel>Vessel Occlusion</SliderLabel>
              <SliderValue $critical={imagingData.occlusion > 75} $warning={imagingData.occlusion > 50}>{imagingData.occlusion}%</SliderValue>
            </SliderHeader>
            <Slider type="range" min="0" max="100" step="5" value={imagingData.occlusion}
              onChange={(e) => setImagingData({ ...imagingData, occlusion: +e.target.value })} />
          </SliderGroup>

          <Checkbox>
            <input type="checkbox" checked={imagingData.hasCollateral}
              onChange={(e) => setImagingData({ ...imagingData, hasCollateral: e.target.checked })} />
            <span>Collateral flow visualized</span>
          </Checkbox>
        </Card>

        <Card>
          <CardTitle><Brain size={18} /> AI Classification Result</CardTitle>
          
          <GradeCircle $color={injury.color}>
            <GradeNumber>GRADE {injury.grade}</GradeNumber>
            <GradeUrgency>{injury.urgency}</GradeUrgency>
          </GradeCircle>

          <ResultCard>
            <ResultLabel>Injury Classification</ResultLabel>
            <ResultValue>{injury.description}</ResultValue>
          </ResultCard>

          <ResultCard>
            <ResultLabel>Management Recommendation</ResultLabel>
            <ResultValue>{injury.recommendation}</ResultValue>
          </ResultCard>

          <ResultCard>
            <ResultLabel>Operative Repair Required</ResultLabel>
            <ResultValue $color={injury.needsSurgery ? '#f87171' : '#4ade80'}>
              {injury.needsSurgery ? '✓ YES - Schedule OR' : '✗ No - Medical management'}
            </ResultValue>
          </ResultCard>

          {imagingData.hasCollateral && (
            <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.8rem', color: '#4ade80' }}>
              ✓ Collateral flow present — Better prognosis
            </div>
          )}
        </Card>
      </TwoColumn>

      <Card>
        <CardTitle>SVS Injury Grading Reference</CardTitle>
        <GradeScale>
          {[
            { g: 1, c: '#22c55e', l: 'Grade I\nMinor' },
            { g: 2, c: '#3b82f6', l: 'Grade II\nModerate' },
            { g: 3, c: '#f59e0b', l: 'Grade III\nSevere' },
            { g: 4, c: '#ef4444', l: 'Grade IV\nCritical' },
            { g: 5, c: '#dc2626', l: 'Grade V\nLife-Threat' }
          ].map(item => (
            <GradeSegment key={item.g} $color={item.c} $active={item.g === injury.grade}>
              {item.l}
            </GradeSegment>
          ))}
        </GradeScale>
      </Card>
    </>
  );

  const renderSimulation = () => {
    const pulse = Math.sin(simulationTime / 30) * 0.3 + 1;

    return (
      <>
        <Card>
          <CardTitle><Syringe size={18} /> Hemodynamic Parameters</CardTitle>
          <Grid $cols={4}>
            <SliderGroup>
              <SliderHeader>
                <SliderLabel>Proximal BP</SliderLabel>
                <SliderValue>{hemodynamics.proximalBP} mmHg</SliderValue>
              </SliderHeader>
              <Slider type="range" min="60" max="180" step="5" value={hemodynamics.proximalBP}
                onChange={(e) => setHemodynamics({ ...hemodynamics, proximalBP: +e.target.value })} />
            </SliderGroup>

            <SliderGroup>
              <SliderHeader>
                <SliderLabel>Distal BP</SliderLabel>
                <SliderValue $warning={hemodynamics.distalBP < 60}>{hemodynamics.distalBP} mmHg</SliderValue>
              </SliderHeader>
              <Slider type="range" min="0" max="120" step="5" value={hemodynamics.distalBP}
                onChange={(e) => setHemodynamics({ ...hemodynamics, distalBP: +e.target.value })} />
            </SliderGroup>

            <SliderGroup>
              <SliderHeader>
                <SliderLabel>Compartment Pressure</SliderLabel>
                <SliderValue $critical={hemodynamics.compartmentPressure > 30}>{hemodynamics.compartmentPressure} mmHg</SliderValue>
              </SliderHeader>
              <Slider type="range" min="0" max="60" step="5" value={hemodynamics.compartmentPressure}
                onChange={(e) => setHemodynamics({ ...hemodynamics, compartmentPressure: +e.target.value })} />
            </SliderGroup>

            <SliderGroup>
              <SliderHeader>
                <SliderLabel>Time to Revasc</SliderLabel>
                <SliderValue $critical={hemodynamics.timeToRevasc > 6}>{hemodynamics.timeToRevasc}h</SliderValue>
              </SliderHeader>
              <Slider type="range" min="0" max="12" step="0.5" value={hemodynamics.timeToRevasc}
                onChange={(e) => setHemodynamics({ ...hemodynamics, timeToRevasc: +e.target.value })} />
            </SliderGroup>
          </Grid>
        </Card>

        <Card>
          <CardTitle><Activity size={18} /> Blood Flow Visualization</CardTitle>
          <SimulationSVG viewBox="0 0 800 200">
            {/* Proximal vessel */}
            <line x1="40" y1="100" x2="200" y2="100" stroke="#ef4444" strokeWidth="20" opacity="0.8" />
            <text x="120" y="80" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">{hemodynamics.proximalBP} mmHg</text>

            {/* Injury */}
            <circle cx="250" cy="100" r="28" fill="#f59e0b" opacity="0.9" />
            <text x="250" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">INJURY</text>

            {/* Distal vessel */}
            <line x1="300" y1="100" x2="480" y2="100" stroke="#ef4444"
              strokeWidth={10 + (hemodynamics.distalBP / hemodynamics.proximalBP) * 10}
              opacity={0.3 + (hemodynamics.distalBP / hemodynamics.proximalBP) * 0.5} />
            <text x="390" y="80" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">{hemodynamics.distalBP} mmHg</text>

            {/* Tissue compartment */}
            <rect x="520" y="60" width="240" height="80" fill="#334155" opacity="0.3" rx="8" />
            <text x="640" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">TISSUE COMPARTMENT</text>
            <text x="640" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="700">{hemodynamics.compartmentPressure} mmHg</text>
            <text x="640" y="135" textAnchor="middle" fill={perfusion.statusColor} fontSize="10" fontWeight="700">
              {perfusion.compartmentSyndrome ? '⚠️ COMPARTMENT SYNDROME' : '✓ Normal'}
            </text>

            {/* Blood particles */}
            {isRunning && [...Array(12)].map((_, i) => {
              const x = ((simulationTime * 4 + i * 50) % 500) + 40;
              const opacity = x < 300 ? 0.7 : 0.3 + (hemodynamics.distalBP / hemodynamics.proximalBP) * 0.4;
              const r = x < 300 ? 3 * pulse : 2.5 * (hemodynamics.distalBP / hemodynamics.proximalBP) * pulse;
              return <circle key={i} cx={x} cy={100 + (Math.random() - 0.5) * 12} r={r} fill="#dc2626" opacity={opacity} />;
            })}

            {/* Labels */}
            <text x="250" y="165" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">Gradient: {perfusion.gradient} mmHg</text>
            <text x="640" y="165" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">Perfusion: {perfusion.perfPressure} mmHg</text>
          </SimulationSVG>
        </Card>

        <PerfGrid>
          <PerfCard $borderColor={perfusion.statusColor}>
            <MetricLabel>Tissue Status</MetricLabel>
            <MetricValue $color={perfusion.statusColor}>{perfusion.tissueStatus}</MetricValue>
          </PerfCard>
          <PerfCard>
            <MetricLabel>Perfusion Pressure</MetricLabel>
            <MetricValue>{perfusion.perfPressure}<MetricUnit>mmHg</MetricUnit></MetricValue>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
              {perfusion.compartmentSyndrome ? 'Below 30 mmHg threshold' : 'Adequate perfusion'}
            </div>
          </PerfCard>
          <PerfCard $borderColor={perfusion.timeLeft < 2 ? '#ef4444' : perfusion.timeLeft < 4 ? '#f59e0b' : '#22c55e'}>
            <MetricLabel>Time to Damage</MetricLabel>
            <MetricValue $color={perfusion.timeLeft < 2 ? '#f87171' : perfusion.timeLeft < 4 ? '#fbbf24' : '#4ade80'}>
              {perfusion.timeLeft.toFixed(1)}<MetricUnit>hrs</MetricUnit>
            </MetricValue>
          </PerfCard>
          <PerfCard $borderColor={perfusion.needsFasciotomy ? '#ef4444' : '#22c55e'}>
            <MetricLabel>Fasciotomy</MetricLabel>
            <MetricValue $color={perfusion.needsFasciotomy ? '#f87171' : '#4ade80'}>
              {perfusion.needsFasciotomy ? 'INDICATED' : 'NOT NEEDED'}
            </MetricValue>
          </PerfCard>
        </PerfGrid>

        <PatientBox $urgent={perfusion.compartmentSyndrome}>
          <PatientTitle>
            <Droplets size={18} style={{ color: perfusion.compartmentSyndrome ? '#f87171' : '#4ade80' }} />
            Patient Education
          </PatientTitle>
          <PatientText>
            {perfusion.compartmentSyndrome ? (
              <>
                <strong>⚠️ Why we need to act now:</strong> The pressure in your muscle compartment ({hemodynamics.compartmentPressure} mmHg) is squeezing your blood vessels.
                Your perfusion pressure is only {perfusion.perfPressure} mmHg — below the critical 30 mmHg threshold.
                Without surgery to release this pressure (fasciotomy), tissue damage will occur within {perfusion.timeLeft.toFixed(1)} hours.
              </>
            ) : (
              <>
                <strong>✓ Good news:</strong> Your perfusion pressure is adequate at {perfusion.perfPressure} mmHg, meaning blood is reaching your tissue.
                We'll monitor you closely and can intervene quickly if things change.
              </>
            )}
          </PatientText>
        </PatientBox>
      </>
    );
  };

  return (
    <Container>
      <ScrollContent>
        <TabBar>
          <Tab $active={activeTab === 'predictive'} onClick={() => setActiveTab('predictive')}>
            <Activity size={18} /> Risk Prediction
          </Tab>
          <Tab $active={activeTab === 'classification'} onClick={() => setActiveTab('classification')}>
            <Brain size={18} /> Injury Classification
          </Tab>
          <Tab $active={activeTab === 'simulation'} onClick={() => setActiveTab('simulation')}>
            <Syringe size={18} /> Hemodynamics
          </Tab>
        </TabBar>

        {activeTab === 'predictive' && renderPredictive()}
        {activeTab === 'classification' && renderClassification()}
        {activeTab === 'simulation' && renderSimulation()}
      </ScrollContent>
    </Container>
  );
};

export default MedicalModelsDemo;