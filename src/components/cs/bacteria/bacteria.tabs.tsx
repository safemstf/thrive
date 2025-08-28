// src/components/cs/bacteria/bacteria.tabs.tsx
import React from 'react';
import { styles } from './bacteria.styles';
import { CardiovascularState, SimulationStats, PatientVitals } from './bacteria.types';
import { ANTIBIOTIC_PROFILES } from './bacteria.types';

interface TabProps {
  isDark: boolean;
  cardiovascularState?: CardiovascularState;
  stats?: SimulationStats;
  patientVitals?: PatientVitals;
  selectedAntibiotics?: string[];
  onAntibioticSelect?: (antibiotic: string) => void;
  simulationController?: any;
}

export const PhysiologyTab: React.FC<TabProps> = ({ 
  isDark, cardiovascularState, stats 
}) => {
  if (!cardiovascularState) return null;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', color: styles.colors.physiology.primary, marginBottom: '1rem', fontWeight: 700 }}>
          Cardiovascular Dynamics (Live)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Cardiac Output', value: cardiovascularState.cardiacOutput.toFixed(1), unit: 'L/min', normal: '4-8' },
            { label: 'Stroke Volume', value: cardiovascularState.strokeVolume.toFixed(0), unit: 'mL', normal: '60-100' },
            { label: 'SVR', value: (cardiovascularState.systemicVascularResistance / 80).toFixed(0), unit: 'mmHg⋅min/L', normal: '15-20' },
            { label: 'Arterial Tone', value: (cardiovascularState.arterialTone * 100).toFixed(0), unit: '%', normal: '40-60%' },
            { label: 'O₂ Delivery', value: cardiovascularState.oxygenDelivery.toFixed(0), unit: 'mL/min', normal: '950-1150' },
            { label: 'Tissue Hypoxia', value: (cardiovascularState.tissueHypoxia * 100).toFixed(1), unit: '%', normal: '<5%' }
          ].map(param => (
            <div key={param.label} style={{
              padding: '1rem',
              background: isDark ? styles.colors.physiology.secondary : 'rgba(239, 68, 68, 0.05)',
              borderRadius: '10px',
              border: `1px solid ${styles.colors.physiology.border}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: styles.colors.physiology.primary, marginBottom: '0.5rem', fontWeight: 600 }}>
                {param.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: styles.colors.physiology.primary, marginBottom: '0.25rem' }}>
                {param.value}
              </div>
              <div style={{ fontSize: '0.625rem', color: styles.colors.physiology.primary, opacity: 0.8 }}>
                {param.unit}
              </div>
              <div style={{ fontSize: '0.625rem', color: isDark ? '#64748b' : '#94a3b8', marginTop: '0.25rem' }}>
                Normal: {param.normal}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.125rem', color: '#f59e0b', marginBottom: '1rem', fontWeight: 700 }}>
          Blood Rheology & Microcirculation
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 600 }}>
              Viscosity
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.25rem' }}>
              {stats?.viscosity.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.625rem', color: '#f59e0b', opacity: 0.8 }}>
              cP (Normal: 3-4)
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 600 }}>
              Flow Rate
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.25rem' }}>
              {cardiovascularState.bloodFlowRate.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.625rem', color: '#f59e0b', opacity: 0.8 }}>
              cm/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MicrobiologyTab: React.FC<TabProps> = ({ isDark }) => {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', color: styles.colors.microbiology.primary, marginBottom: '1rem', fontWeight: 700 }}>
          Microbiology Controls
        </h3>
        <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
          Configure initial bacterial populations and environmental conditions
        </p>
        {/* Implementation would continue with parameter controls... */}
      </div>
    </div>
  );
};

export const TherapyTab: React.FC<TabProps> = ({ 
  isDark, selectedAntibiotics = [], onAntibioticSelect 
}) => {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', color: styles.colors.therapy.primary, marginBottom: '1rem', fontWeight: 700 }}>
          Antimicrobial Therapy
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {Object.entries(ANTIBIOTIC_PROFILES).map(([antibiotic, profile]) => {
            const isActive = selectedAntibiotics.includes(antibiotic);
            return (
              <div
                key={antibiotic}
                style={{
                  padding: '1rem',
                  background: isActive ? 
                    'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))' : 
                    isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                  border: `2px solid ${isActive ? '#22c55e' : isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onAntibioticSelect && onAntibioticSelect(antibiotic)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: 700, 
                      color: isActive ? '#22c55e' : isDark ? '#fff' : '#1f2937',
                      fontSize: '1rem',
                      marginBottom: '0.25rem'
                    }}>
                      {profile.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {profile.class}
                    </div>
                  </div>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isActive ? '#22c55e' : '#6b7280'
                  }} />
                </div>
                
                <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
                  <div><strong>Target:</strong> {profile.target}</div>
                  <div><strong>Half-life:</strong> {profile.pharmacokinetics.halfLife}h</div>
                  <div><strong>Spectrum:</strong> G+ {(profile.spectrum.gramPos * 100).toFixed(0)}% | G- {(profile.spectrum.gramNeg * 100).toFixed(0)}%</div>
                  <div style={{ 
                    marginTop: '0.5rem',
                    color: profile.toxicity.nephrotoxicity > 0.3 ? '#f59e0b' : 
                           profile.toxicity.nephrotoxicity > 0.1 ? '#fbbf24' : '#22c55e',
                    fontWeight: 600
                  }}>
                    {profile.toxicity.nephrotoxicity > 0.3 ? 'High nephrotoxicity' :
                     profile.toxicity.nephrotoxicity > 0.1 ? 'Moderate toxicity' : 'Low toxicity'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ImmuneTab: React.FC<TabProps> = ({ isDark, simulationController }) => {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', color: styles.colors.immune.primary, marginBottom: '1rem', fontWeight: 700 }}>
          Immune System Status
        </h3>
        <div style={{
          padding: '1rem',
          background: isDark ? styles.colors.immune.secondary : 'rgba(6, 182, 212, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${styles.colors.immune.border}`
        }}>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '1rem' }}>
            Real-time immune cell populations and activity levels
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {['neutrophil', 'macrophage', 'tcell', 'bcell'].map(cellType => {
              const count = simulationController?.current?.state?.immuneCells?.filter((c: any) => c.type === cellType).length || 0;
              const colors = {
                neutrophil: '#87CEEB',
                macrophage: '#4682B4', 
                tcell: '#9370DB',
                bcell: '#DA70D6'
              };
            
              return (
                <div key={cellType} style={{
                  padding: '0.75rem',
                  background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: `1px solid ${colors[cellType as keyof typeof colors]}`
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors[cellType as keyof typeof colors], marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                    {cellType.replace('cell', ' Cell')}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colors[cellType as keyof typeof colors] }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsTab: React.FC<TabProps> = ({ isDark }) => {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', color: styles.colors.analytics.primary, marginBottom: '1rem', fontWeight: 700 }}>
          Simulation Analytics
        </h3>
        <div style={{
          padding: '1.5rem',
          background: isDark ? styles.colors.analytics.secondary : 'rgba(236, 72, 153, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${styles.colors.analytics.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.125rem', color: styles.colors.analytics.primary, marginBottom: '1rem' }}>
            Advanced Analytics Dashboard
          </div>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            Real-time simulation metrics, bacterial evolution tracking, and physiological parameter analysis would be displayed here in the full implementation.
          </p>
        </div>
      </div>
    </div>
  );
};