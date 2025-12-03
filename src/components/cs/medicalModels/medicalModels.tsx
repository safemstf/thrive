// src/components/cs/medicalModels/medicalModels.tsx
// AI-Powered Clinical Decision Support for Acute Vascular Surgery
import React, { useState, useEffect } from 'react';

interface MedicalModelsDemoProps {
    isDark: boolean;
    isRunning: boolean;
    speed: number;
}

type ModelType = 'predictive' | 'classification' | 'simulation';

const MedicalModelsDemo: React.FC<MedicalModelsDemoProps> = ({ isDark, isRunning, speed }) => {
    const [activeTab, setActiveTab] = useState<ModelType>('predictive');
    const [showAIInsights, setShowAIInsights] = useState(true);

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

    // Classification Model State
    const [imagingData, setImagingData] = useState<{
        modality: 'X-ray' | 'CT Angiography' | 'Doppler Ultrasound' | 'Angiogram';
        vessel: string;
        injuryType: 'Intimal Injury' | 'Laceration' | 'Transection' | 'Thrombosis' | 'Pseudoaneurysm';
        occlusion: number;
        hasCollateral: boolean;
    }>({
        modality: 'CT Angiography',
        vessel: 'Femoral Artery',
        injuryType: 'Laceration',
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

    // ========== CALCULATIONS ==========

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
                compartmentScore > 60 && { type: 'URGENT', msg: 'High Compartment Syndrome Risk - Measure Pressures' }
            ].filter(Boolean)
        };
    };

    const classifyInjury = (injuryType: string, occlusion: number) => {
        let grade, urgency, color, needsSurgery, description, recommendation;

        if (injuryType === 'Transection') {
            grade = 5;
            urgency = 'STAT';
            color = '#dc2626';
            needsSurgery = true;
            description = 'Complete transection with tissue loss';
            recommendation = 'IMMEDIATE operative repair - Life/limb threatening';
        } else if (injuryType === 'Laceration' || occlusion > 75) {
            grade = 4;
            urgency = 'Emergent';
            color = '#ef4444';
            needsSurgery = true;
            description = 'Severe occlusion or active bleeding';
            recommendation = 'Emergent OR within 2 hours - Vascular repair required';
        } else if (injuryType === 'Pseudoaneurysm' || occlusion > 50) {
            grade = 3;
            urgency = 'Urgent';
            color = '#f59e0b';
            needsSurgery = true;
            description = 'Pseudoaneurysm or significant stenosis';
            recommendation = 'Urgent repair within 6-12 hours - OR or endovascular';
        } else if (occlusion > 25) {
            grade = 2;
            urgency = 'Scheduled';
            color = '#3b82f6';
            needsSurgery = false;
            description = 'Intimal injury with moderate stenosis';
            recommendation = 'Close monitoring, possible intervention within 24h';
        } else {
            grade = 1;
            urgency = 'Routine';
            color = '#22c55e';
            needsSurgery = false;
            description = 'Minor intimal irregularity';
            recommendation = 'Observation and serial imaging';
        }

        return { grade, urgency, color, needsSurgery, description, recommendation };
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

        return {
            perfPressure,
            gradient,
            compartmentSyndrome,
            timeLeft,
            tissueStatus,
            statusColor,
            needsFasciotomy: compartmentSyndrome || hemodynamics.compartmentPressure > 30
        };
    };

    const risks = calculateRisks();
    const injury = classifyInjury(imagingData.injuryType, imagingData.occlusion);
    const perfusion = calculatePerfusion();

    // ========== RENDER HELPERS ==========

    const RiskGauge = ({ value, max, label, critical = 60, warning = 30 }: any) => {
        const percentage = (value / max) * 100;
        const color = percentage > critical ? '#dc2626' : percentage > warning ? '#f59e0b' : '#22c55e';

        return (
            <div style={styles.gaugeContainer}>
                <div style={styles.gaugeLabel}>{label}</div>
                <div style={styles.gaugeOuter}>
                    <div style={{
                        ...styles.gaugeFill,
                        width: `${percentage}%`,
                        backgroundColor: color
                    }} />
                </div>
                <div style={{ ...styles.gaugeValue, color }}>{value.toFixed(0)}{max === 100 ? '%' : ''}</div>
            </div>
        );
    };

    const StatusBadge = ({ status, type = 'info' }: any) => {
        const colors = {
            critical: { bg: '#fef2f2', border: '#dc2626', text: '#dc2626' },
            urgent: { bg: '#fef3c7', border: '#f59e0b', text: '#f59e0b' },
            warning: { bg: '#fef9c3', border: '#eab308', text: '#ca8a04' },
            success: { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a' },
            info: { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb' }
        };
        const style = colors[type as keyof typeof colors] || colors.info;

        return (
            <div style={{
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: style.bg,
                border: `1.5px solid ${style.border}`,
                color: style.text,
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block'
            }}>
                {status}
            </div>
        );
    };

    const MetricCard = ({ icon, label, value, unit, status, trend }: any) => (
        <div style={styles.metricCard}>
            <div style={styles.metricIcon}>{icon}</div>
            <div style={styles.metricLabel}>{label}</div>
            <div style={styles.metricValue}>
                {value} <span style={styles.metricUnit}>{unit}</span>
            </div>
            {status && <StatusBadge status={status} type={
                status.includes('CRITICAL') ? 'critical' :
                    status.includes('HIGH') || status.includes('URGENT') ? 'urgent' :
                        status.includes('MODERATE') || status.includes('AT RISK') ? 'warning' : 'success'
            } />}
        </div>
    );

    // ========== TAB CONTENT ==========

    const renderPredictive = () => (
        <div style={styles.tabContent}>
            {/* AI Insights Panel */}
            {showAIInsights && (
                <div style={styles.aiPanel}>
                    <div style={styles.aiHeader}>
                        <div style={styles.aiTitle}>
                            <span style={styles.aiIcon}>🤖</span>
                            AI Clinical Decision Support
                        </div>
                        <button
                            onClick={() => setShowAIInsights(false)}
                            style={styles.closeBtn}
                        >×</button>
                    </div>

                    {risks.criticalAlerts.length > 0 ? (
                        <div style={styles.alertsContainer}>
                            {(risks.criticalAlerts as any[]).map((alert: any, i: number) => (
                                <div key={i} style={{
                                    ...styles.alertCard,
                                    borderLeft: `4px solid ${alert.type === 'CRITICAL' ? '#dc2626' : '#f59e0b'}`
                                }}>
                                    <div style={styles.alertType}>
                                        {alert.type === 'CRITICAL' ? '🚨' : '⚠️'} {alert.type}
                                    </div>
                                    <div style={styles.alertMsg}>{alert.msg}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.aiSuccess}>
                            ✓ No critical alerts detected. Continue monitoring.
                        </div>
                    )}
                </div>
            )}

            {/* Patient Overview */}
            <div style={styles.sectionTitle}>Patient Status Overview</div>
            <div style={styles.metricsGrid}>
                <MetricCard
                    icon="❤️"
                    label="Shock Index"
                    value={risks.shockIndex}
                    status={risks.hemorrhageRisk}
                />
                <MetricCard
                    icon="🦵"
                    label="Limb Status"
                    value={patientData.hoursSinceInjury}
                    unit="hrs"
                    status={risks.limbThreat}
                />
                <MetricCard
                    icon="🩸"
                    label="Hemoglobin"
                    value={patientData.hemoglobin}
                    unit="g/dL"
                    status={patientData.hemoglobin < 10 ? 'LOW' : 'NORMAL'}
                />
                <MetricCard
                    icon="📊"
                    label="MESS Score"
                    value={risks.messScore}
                    status={risks.messScore >= 7 ? 'HIGH RISK' : 'ACCEPTABLE'}
                />
            </div>

            {/* Risk Assessment */}
            <div style={styles.sectionTitle}>AI Risk Stratification</div>
            <div style={styles.riskGrid}>
                <div style={styles.riskCard}>
                    <div style={styles.riskHeader}>
                        <span style={styles.riskTitle}>Hemorrhagic Shock Risk</span>
                        <StatusBadge status={risks.hemorrhageRisk} type={
                            risks.hemorrhageRisk === 'CRITICAL' ? 'critical' :
                                risks.hemorrhageRisk === 'HIGH' ? 'urgent' : 'warning'
                        } />
                    </div>
                    <RiskGauge value={risks.hemorrhageScore} max={150} label="Risk Score" />
                    <div style={styles.riskDetail}>
                        <strong>Clinical Correlation:</strong><br />
                        BP: {patientData.systolicBP}/{patientData.diastolicBP} mmHg<br />
                        HR: {patientData.heartRate} bpm<br />
                        Lactate: {patientData.lactate} mmol/L
                    </div>
                </div>

                <div style={styles.riskCard}>
                    <div style={styles.riskHeader}>
                        <span style={styles.riskTitle}>Infection Risk</span>
                        <StatusBadge status={
                            risks.infectionScore > 60 ? 'HIGH' :
                                risks.infectionScore > 30 ? 'MODERATE' : 'LOW'
                        } type={
                            risks.infectionScore > 60 ? 'urgent' :
                                risks.infectionScore > 30 ? 'warning' : 'success'
                        } />
                    </div>
                    <RiskGauge value={risks.infectionScore} max={100} label="Risk Score %" />
                    <div style={styles.riskDetail}>
                        <strong>Risk Factors:</strong><br />
                        {patientData.hasCatheter && '• Foley catheter (UTI risk)\n'}
                        {patientData.hasOpenWound && '• Open wound\n'}
                        {patientData.wbc > 12 && '• Elevated WBC\n'}
                        {!patientData.hasCatheter && !patientData.hasOpenWound && '• No major risk factors'}
                    </div>
                </div>

                <div style={styles.riskCard}>
                    <div style={styles.riskHeader}>
                        <span style={styles.riskTitle}>Compartment Syndrome</span>
                        <StatusBadge status={
                            risks.compartmentScore > 60 ? 'HIGH' :
                                risks.compartmentScore > 30 ? 'MODERATE' : 'LOW'
                        } type={
                            risks.compartmentScore > 60 ? 'critical' :
                                risks.compartmentScore > 30 ? 'warning' : 'success'
                        } />
                    </div>
                    <RiskGauge value={risks.compartmentScore} max={100} label="Risk Score %" />
                    <div style={styles.riskDetail}>
                        <strong>Clinical Indicators:</strong><br />
                        {patientData.hasLimbIschemia && '• Limb ischemia present\n'}
                        {patientData.hasFracture && '• Fracture present\n'}
                        {patientData.creatineKinase > 1000 && '• Elevated CK\n'}
                        Time since injury: {patientData.hoursSinceInjury}h
                    </div>
                </div>
            </div>

            {/* Interactive Controls - Organized by Data Source */}
            <div style={styles.controlsSection}>
                <div style={styles.sectionTitle}>Patient Data Input</div>

                {/* VITALS SECTION */}
                <div style={styles.dataSourceSection}>
                    <div style={styles.dataSourceHeader}>
                        <span style={styles.dataSourceIcon}>❤️</span>
                        <span style={styles.dataSourceTitle}>Vital Signs</span>
                    </div>

                    <div style={styles.sliderGrid}>
                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>Systolic Blood Pressure</label>
                                <span style={{
                                    ...styles.sliderValue,
                                    color: patientData.systolicBP < 90 ? '#dc2626' : '#0f172a'
                                }}>
                                    {patientData.systolicBP} mmHg
                                </span>
                            </div>
                            <input
                                type="range"
                                min="60"
                                max="180"
                                step="5"
                                value={patientData.systolicBP}
                                onChange={(e) => setPatientData({ ...patientData, systolicBP: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>60</span>
                                <span style={{ color: '#dc2626', fontSize: '11px' }}>Critical: &lt;90</span>
                                <span>180</span>
                            </div>
                        </div>

                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>Diastolic Blood Pressure</label>
                                <span style={styles.sliderValue}>{patientData.diastolicBP} mmHg</span>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="120"
                                step="5"
                                value={patientData.diastolicBP}
                                onChange={(e) => setPatientData({ ...patientData, diastolicBP: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>40</span>
                                <span>120</span>
                            </div>
                        </div>

                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>Heart Rate</label>
                                <span style={{
                                    ...styles.sliderValue,
                                    color: patientData.heartRate > 110 ? '#dc2626' : '#0f172a'
                                }}>
                                    {patientData.heartRate} bpm
                                </span>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="180"
                                step="5"
                                value={patientData.heartRate}
                                onChange={(e) => setPatientData({ ...patientData, heartRate: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>40</span>
                                <span style={{ color: '#dc2626', fontSize: '11px' }}>Tachycardia: &gt;110</span>
                                <span>180</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOOD LABS SECTION */}
                <div style={styles.dataSourceSection}>
                    <div style={styles.dataSourceHeader}>
                        <span style={styles.dataSourceIcon}>🧪</span>
                        <span style={styles.dataSourceTitle}>Blood Laboratory Values</span>
                    </div>

                    <div style={styles.sliderGrid}>
                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>Hemoglobin</label>
                                <span style={{
                                    ...styles.sliderValue,
                                    color: patientData.hemoglobin < 10 ? '#dc2626' : '#0f172a'
                                }}>
                                    {patientData.hemoglobin} g/dL
                                </span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="18"
                                step="0.5"
                                value={patientData.hemoglobin}
                                onChange={(e) => setPatientData({ ...patientData, hemoglobin: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>5</span>
                                <span style={{ color: '#dc2626', fontSize: '11px' }}>Anemia: &lt;10</span>
                                <span>18</span>
                            </div>
                        </div>

                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>White Blood Cell Count</label>
                                <span style={{
                                    ...styles.sliderValue,
                                    color: patientData.wbc > 12 ? '#f59e0b' : '#0f172a'
                                }}>
                                    {patientData.wbc} ×10³/μL
                                </span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="25"
                                step="0.5"
                                value={patientData.wbc}
                                onChange={(e) => setPatientData({ ...patientData, wbc: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>3</span>
                                <span style={{ color: '#f59e0b', fontSize: '11px' }}>Elevated: &gt;12</span>
                                <span>25</span>
                            </div>
                        </div>

                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>Lactate</label>
                                <span style={{
                                    ...styles.sliderValue,
                                    color: patientData.lactate > 4 ? '#dc2626' : patientData.lactate > 2 ? '#f59e0b' : '#0f172a'
                                }}>
                                    {patientData.lactate} mmol/L
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="10"
                                step="0.5"
                                value={patientData.lactate}
                                onChange={(e) => setPatientData({ ...patientData, lactate: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>0.5</span>
                                <span style={{ color: '#dc2626', fontSize: '11px' }}>Critical: &gt;4</span>
                                <span>10</span>
                            </div>
                        </div>

                        <div style={styles.sliderControl}>
                            <div style={styles.sliderTop}>
                                <label style={styles.sliderLabel}>Creatine Kinase (Rhabdomyolysis Marker)</label>
                                <span style={{
                                    ...styles.sliderValue,
                                    color: patientData.creatineKinase > 1000 ? '#dc2626' : '#0f172a'
                                }}>
                                    {patientData.creatineKinase} U/L
                                </span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="5000"
                                step="50"
                                value={patientData.creatineKinase}
                                onChange={(e) => setPatientData({ ...patientData, creatineKinase: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.sliderRange}>
                                <span>50</span>
                                <span style={{ color: '#dc2626', fontSize: '11px' }}>Rhabdo: &gt;1000</span>
                                <span>5000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* IMAGING & CLINICAL FINDINGS SECTION */}
                <div style={styles.dataSourceSection}>
                    <div style={styles.dataSourceHeader}>
                        <span style={styles.dataSourceIcon}>🔍</span>
                        <span style={styles.dataSourceTitle}>Imaging & Clinical Findings</span>
                    </div>

                    <div style={styles.sliderControl}>
                        <div style={styles.sliderTop}>
                            <label style={styles.sliderLabel}>Hours Since Injury (Golden Window)</label>
                            <span style={{
                                ...styles.sliderValue,
                                color: patientData.hoursSinceInjury > 6 ? '#dc2626' : patientData.hoursSinceInjury > 4 ? '#f59e0b' : '#22c55e'
                            }}>
                                {patientData.hoursSinceInjury} hours
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="0.5"
                            value={patientData.hoursSinceInjury}
                            onChange={(e) => setPatientData({ ...patientData, hoursSinceInjury: +e.target.value })}
                            style={styles.slider}
                        />
                        <div style={styles.sliderRange}>
                            <span>0</span>
                            <span style={{ color: '#22c55e', fontSize: '11px' }}>Golden: 0-6h</span>
                            <span style={{ color: '#dc2626', fontSize: '11px' }}>Critical: &gt;6h</span>
                            <span>12</span>
                        </div>
                    </div>

                    <div style={styles.checkboxGrid}>
                        {[
                            { key: 'hasVascularInjury', label: '🩸 Vascular injury on CT angiography', icon: '🔴' },
                            { key: 'hasFracture', label: '🦴 Fracture on X-ray', icon: '🟡' },
                            { key: 'hasLimbIschemia', label: '🦵 Limb ischemia (6 P\'s present)', icon: '🔴' },
                            { key: 'hasCatheter', label: '💉 Foley catheter placed (UTI risk)', icon: '🟡' },
                            { key: 'hasOpenWound', label: '🩹 Open wound/compound fracture', icon: '🔴' }
                        ].map(item => (
                            <label key={item.key} style={styles.checkboxCard}>
                                <input
                                    type="checkbox"
                                    checked={patientData[item.key as keyof typeof patientData] as boolean}
                                    onChange={(e) => setPatientData({ ...patientData, [item.key]: e.target.checked })}
                                    style={styles.checkboxInput}
                                />
                                <span style={styles.checkboxText}>{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderClassification = () => (
        <div style={styles.tabContent}>
            <div style={styles.sectionTitle}>Vascular Injury Classification System</div>

            <div style={styles.twoColumn}>
                <div style={styles.classInputs}>
                    <div style={styles.inputCard}>
                        <h3 style={styles.inputCardTitle}>Imaging Findings</h3>

                        <div style={styles.controlGroup}>
                            <label style={styles.controlLabel}>Imaging Modality</label>
                            <select
                                value={imagingData.modality}
                                onChange={(e) => setImagingData({ ...imagingData, modality: e.target.value as any })}
                                style={styles.select}
                            >
                                <option>X-ray</option>
                                <option>CT Angiography</option>
                                <option>Doppler Ultrasound</option>
                                <option>Angiogram</option>
                            </select>
                            <div style={styles.helperText}>
                                {imagingData.modality === 'CT Angiography' && '✓ Gold standard for trauma vascular imaging'}
                                {imagingData.modality === 'Angiogram' && '✓ Definitive diagnosis + potential intervention'}
                                {imagingData.modality === 'X-ray' && 'ℹ Limited vascular detail, shows fractures'}
                                {imagingData.modality === 'Doppler Ultrasound' && 'ℹ Bedside assessment, good for follow-up'}
                            </div>
                        </div>

                        <div style={styles.controlGroup}>
                            <label style={styles.controlLabel}>Vessel Involved</label>
                            <select
                                value={imagingData.vessel}
                                onChange={(e) => setImagingData({ ...imagingData, vessel: e.target.value })}
                                style={styles.select}
                            >
                                <option>Femoral Artery</option>
                                <option>Popliteal Artery</option>
                                <option>Tibial Arteries</option>
                                <option>Brachial Artery</option>
                                <option>Subclavian Artery</option>
                            </select>
                        </div>

                        <div style={styles.controlGroup}>
                            <label style={styles.controlLabel}>Injury Pattern</label>
                            <select
                                value={imagingData.injuryType}
                                onChange={(e) => setImagingData({ ...imagingData, injuryType: e.target.value as any })}
                                style={styles.select}
                            >
                                <option>Intimal Injury</option>
                                <option>Laceration</option>
                                <option>Transection</option>
                                <option>Thrombosis</option>
                                <option>Pseudoaneurysm</option>
                            </select>
                        </div>

                        <div style={styles.controlGroup}>
                            <label style={styles.controlLabel}>
                                Vessel Occlusion: {imagingData.occlusion}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={imagingData.occlusion}
                                onChange={(e) => setImagingData({ ...imagingData, occlusion: +e.target.value })}
                                style={styles.slider}
                            />
                            <div style={styles.occlusionBar}>
                                <div style={{
                                    ...styles.occlusionFill,
                                    width: `${imagingData.occlusion}%`,
                                    backgroundColor:
                                        imagingData.occlusion > 75 ? '#dc2626' :
                                            imagingData.occlusion > 50 ? '#f59e0b' :
                                                imagingData.occlusion > 25 ? '#3b82f6' : '#22c55e'
                                }} />
                            </div>
                        </div>

                        <label style={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={imagingData.hasCollateral}
                                onChange={(e) => setImagingData({ ...imagingData, hasCollateral: e.target.checked })}
                            />
                            <span>Collateral flow visualized</span>
                        </label>
                    </div>
                </div>

                <div style={styles.classOutput}>
                    <div style={{
                        ...styles.gradeCircle,
                        backgroundColor: injury.color
                    }}>
                        <div style={styles.gradeNumber}>GRADE {injury.grade}</div>
                        <div style={styles.gradeUrgency}>{injury.urgency}</div>
                    </div>

                    <div style={styles.classificationCard}>
                        <div style={styles.classLabel}>Injury Classification</div>
                        <div style={styles.classValue}>{injury.description}</div>
                    </div>

                    <div style={styles.classificationCard}>
                        <div style={styles.classLabel}>Management Recommendation</div>
                        <div style={styles.classValue}>{injury.recommendation}</div>
                    </div>

                    <div style={styles.classificationCard}>
                        <div style={styles.classLabel}>Operative Repair Required</div>
                        <div style={{
                            ...styles.classValue,
                            color: injury.needsSurgery ? '#dc2626' : '#22c55e',
                            fontWeight: 'bold'
                        }}>
                            {injury.needsSurgery ? '✓ YES - Schedule OR' : '✗ No - Medical management'}
                        </div>
                    </div>

                    {imagingData.hasCollateral && (
                        <div style={styles.collateralNote}>
                            <strong>✓ Collateral flow present</strong><br />
                            Better prognosis, improved tissue perfusion despite injury
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Grading Scale */}
            <div style={styles.gradingScale}>
                <div style={styles.sectionTitle}>SVS Injury Grading Reference</div>
                <div style={styles.gradeBar}>
                    {[
                        { g: 1, c: '#22c55e', l: 'Grade I\nMinor' },
                        { g: 2, c: '#3b82f6', l: 'Grade II\nModerate' },
                        { g: 3, c: '#f59e0b', l: 'Grade III\nSevere' },
                        { g: 4, c: '#ef4444', l: 'Grade IV\nCritical' },
                        { g: 5, c: '#dc2626', l: 'Grade V\nLife-Threatening' }
                    ].map(item => (
                        <div
                            key={item.g}
                            style={{
                                ...styles.gradeSegment,
                                backgroundColor: item.c,
                                opacity: item.g === injury.grade ? 1 : 0.3
                            }}
                        >
                            {item.l}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSimulation = () => {
        const pulse = Math.sin(simulationTime / 30) * 0.3 + 1;

        return (
            <div style={styles.tabContent}>
                <div style={styles.sectionTitle}>Hemodynamic Simulation - Patient Education Tool</div>

                {/* Controls */}
                <div style={styles.simControls}>
                    <div style={styles.controlGroup}>
                        <label style={styles.controlLabel}>
                            Proximal BP: {hemodynamics.proximalBP} mmHg
                        </label>
                        <input
                            type="range"
                            min="60"
                            max="180"
                            step="5"
                            value={hemodynamics.proximalBP}
                            onChange={(e) => setHemodynamics({ ...hemodynamics, proximalBP: +e.target.value })}
                            style={styles.slider}
                        />
                    </div>

                    <div style={styles.controlGroup}>
                        <label style={styles.controlLabel}>
                            Distal BP: {hemodynamics.distalBP} mmHg
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="120"
                            step="5"
                            value={hemodynamics.distalBP}
                            onChange={(e) => setHemodynamics({ ...hemodynamics, distalBP: +e.target.value })}
                            style={styles.slider}
                        />
                    </div>

                    <div style={styles.controlGroup}>
                        <label style={styles.controlLabel}>
                            Compartment Pressure: {hemodynamics.compartmentPressure} mmHg
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="60"
                            step="5"
                            value={hemodynamics.compartmentPressure}
                            onChange={(e) => setHemodynamics({ ...hemodynamics, compartmentPressure: +e.target.value })}
                            style={styles.slider}
                        />
                    </div>

                    <div style={styles.controlGroup}>
                        <label style={styles.controlLabel}>
                            Time to Revascularization: {hemodynamics.timeToRevasc} hours
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="0.5"
                            value={hemodynamics.timeToRevasc}
                            onChange={(e) => setHemodynamics({ ...hemodynamics, timeToRevasc: +e.target.value })}
                            style={styles.slider}
                        />
                    </div>
                </div>

                {/* Visualization */}
                <div style={styles.visualization}>
                    <svg width="100%" height="300" viewBox="0 0 900 300" style={styles.svg}>
                        {/* Proximal vessel */}
                        <line x1="50" y1="150" x2="250" y2="150" stroke="#ef4444" strokeWidth="25" opacity="0.8" />
                        <text x="150" y="130" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">
                            {hemodynamics.proximalBP} mmHg
                        </text>

                        {/* Injury */}
                        <circle cx="300" cy="150" r="35" fill="#f59e0b" opacity="0.9" />
                        <text x="300" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                            INJURY
                        </text>

                        {/* Distal vessel */}
                        <line
                            x1="350"
                            y1="150"
                            x2="550"
                            y2="150"
                            stroke="#ef4444"
                            strokeWidth={12 + (hemodynamics.distalBP / hemodynamics.proximalBP) * 13}
                            opacity={0.3 + (hemodynamics.distalBP / hemodynamics.proximalBP) * 0.5}
                        />
                        <text x="450" y="130" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">
                            {hemodynamics.distalBP} mmHg
                        </text>

                        {/* Tissue compartment */}
                        <rect x="600" y="90" width="250" height="120" fill="#94a3b8" opacity="0.2" rx="8" />
                        <text x="725" y="120" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="600">
                            TISSUE COMPARTMENT
                        </text>
                        <text x="725" y="145" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="bold">
                            {hemodynamics.compartmentPressure} mmHg
                        </text>
                        <text x="725" y="170" textAnchor="middle" fill={perfusion.statusColor} fontSize="13" fontWeight="bold">
                            {perfusion.compartmentSyndrome ? '⚠️ COMPARTMENT SYNDROME' : '✓ Normal Pressure'}
                        </text>

                        {/* Blood particles */}
                        {isRunning && [...Array(15)].map((_, i) => {
                            const x = ((simulationTime * 5 + i * 60) % 600) + 50;
                            const opacity = x < 350 ? 0.7 : 0.3 + (hemodynamics.distalBP / hemodynamics.proximalBP) * 0.4;
                            const r = x < 350 ? 3.5 * pulse : 2.5 * (hemodynamics.distalBP / hemodynamics.proximalBP) * pulse;

                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={150 + (Math.random() - 0.5) * 15}
                                    r={r}
                                    fill="#dc2626"
                                    opacity={opacity}
                                />
                            );
                        })}

                        {/* Annotations */}
                        <text x="300" y="220" textAnchor="middle" fill="#3b82f6" fontSize="13" fontWeight="600">
                            Pressure Drop: {perfusion.gradient} mmHg
                        </text>
                        <text x="725" y="220" textAnchor="middle" fill="#8b5cf6" fontSize="13" fontWeight="600">
                            Perfusion Pressure: {perfusion.perfPressure} mmHg
                        </text>
                    </svg>
                </div>

                {/* Metrics */}
                <div style={styles.perfMetrics}>
                    <div style={{ ...styles.perfCard, borderLeft: `4px solid ${perfusion.statusColor}` }}>
                        <div style={styles.perfLabel}>Tissue Status</div>
                        <div style={{ ...styles.perfValue, color: perfusion.statusColor }}>
                            {perfusion.tissueStatus}
                        </div>
                    </div>

                    <div style={styles.perfCard}>
                        <div style={styles.perfLabel}>Perfusion Pressure</div>
                        <div style={styles.perfValue}>
                            {perfusion.perfPressure} mmHg
                        </div>
                        <div style={styles.perfNote}>
                            {perfusion.compartmentSyndrome ? 'CRITICAL - Below 30 mmHg threshold' : 'Adequate perfusion'}
                        </div>
                    </div>

                    <div style={styles.perfCard}>
                        <div style={styles.perfLabel}>Time to Irreversible Damage</div>
                        <div style={{
                            ...styles.perfValue,
                            color: perfusion.timeLeft < 2 ? '#dc2626' : perfusion.timeLeft < 4 ? '#f59e0b' : '#22c55e'
                        }}>
                            {perfusion.timeLeft.toFixed(1)} hours
                        </div>
                        <div style={styles.perfNote}>
                            {perfusion.timeLeft < 2 && 'URGENT - Immediate intervention required'}
                        </div>
                    </div>

                    <div style={styles.perfCard}>
                        <div style={styles.perfLabel}>Fasciotomy Indicated</div>
                        <div style={{
                            ...styles.perfValue,
                            color: perfusion.needsFasciotomy ? '#dc2626' : '#22c55e'
                        }}>
                            {perfusion.needsFasciotomy ? 'YES' : 'NO'}
                        </div>
                    </div>
                </div>

                {/* Patient Explanation */}
                <div style={styles.patientExplanation}>
                    <h3 style={styles.explanationTitle}>🗣️ Explaining to Patient:</h3>
                    <div style={styles.explanationText}>
                        <p>
                            <strong>What's happening:</strong> Your injury has partially blocked blood flow to your limb.
                            The pressure inside your muscle compartment is currently {hemodynamics.compartmentPressure} mmHg.
                        </p>

                        {perfusion.compartmentSyndrome ? (
                            <div style={styles.urgentExplanation}>
                                <strong>⚠️ Why we need to act now:</strong><br />
                                When the pressure in your muscle compartment gets too high, it squeezes your blood vessels
                                like a tourniquet. Your perfusion pressure is only {perfusion.perfPressure} mmHg - below the
                                critical 30 mmHg threshold. Without surgery to release this pressure (fasciotomy), the tissue
                                will start dying within {perfusion.timeLeft.toFixed(1)} hours.
                            </div>
                        ) : (
                            <p style={styles.goodNews}>
                                <strong>✓ Good news:</strong> Your perfusion pressure is adequate at {perfusion.perfPressure} mmHg,
                                meaning blood is still reaching your tissue. We'll monitor you closely and can intervene quickly
                                if things change.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ========== MAIN RENDER ==========

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerTop}>
                    <div>
                        <h1 style={styles.mainTitle}>AI-Powered Clinical Decision Support</h1>
                        <p style={styles.subtitle}>Acute Vascular Surgery • Multi-Modal Assessment & Real-Time Guidance</p>
                    </div>
                    <div style={styles.aiLogo}>
                        <span style={styles.aiLogoText}>AI</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={styles.tabs}>
                {[
                    { id: 'predictive', icon: '📊', title: 'Risk Prediction', desc: 'Multi-modal assessment' },
                    { id: 'classification', icon: '🔍', title: 'Injury Classification', desc: 'Imaging-based grading' },
                    { id: 'simulation', icon: '💉', title: 'Hemodynamics', desc: 'Patient education' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ModelType)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab.id ? styles.tabActive : {})
                        }}
                    >
                        <span style={styles.tabIcon}>{tab.icon}</span>
                        <div style={styles.tabText}>
                            <div style={styles.tabTitle}>{tab.title}</div>
                            <div style={styles.tabDesc}>{tab.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'predictive' && renderPredictive()}
            {activeTab === 'classification' && renderClassification()}
            {activeTab === 'simulation' && renderSimulation()}
        </div>
    );
};

// ========== STYLES ==========

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        padding: '0'
    },
    header: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '24px 32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    mainTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 6px 0',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0,
        fontWeight: '500'
    },
    aiLogo: {
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    aiLogoText: {
        color: 'white',
        fontSize: '20px',
        fontWeight: '800',
        letterSpacing: '1px'
    },
    tabs: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: '4px',
        padding: '16px 32px',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    tab: {
        flex: 1,
        padding: '16px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
        outline: 'none'
    },
    tabActive: {
        backgroundColor: '#eff6ff',
        boxShadow: 'inset 0 0 0 2px #3b82f6'
    },
    tabIcon: {
        fontSize: '24px'
    },
    tabText: {
        textAlign: 'left'
    },
    tabTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '2px'
    },
    tabDesc: {
        fontSize: '12px',
        color: '#64748b'
    },
    tabContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '20px',
        letterSpacing: '-0.3px'
    },
    aiPanel: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '2px solid #e0e7ff'
    },
    aiHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    aiTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    aiIcon: {
        fontSize: '20px'
    },
    closeBtn: {
        border: 'none',
        background: 'none',
        fontSize: '24px',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '0',
        width: '28px',
        height: '28px',
        lineHeight: '28px'
    },
    alertsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    alertCard: {
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#fef2f2'
    },
    alertType: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#dc2626',
        marginBottom: '6px'
    },
    alertMsg: {
        fontSize: '14px',
        color: '#1e293b',
        lineHeight: '1.5'
    },
    aiSuccess: {
        padding: '16px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        color: '#16a34a',
        fontSize: '14px',
        fontWeight: '600'
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
    },
    metricCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    metricIcon: {
        fontSize: '28px',
        marginBottom: '12px'
    },
    metricLabel: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
    },
    metricValue: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '12px'
    },
    metricUnit: {
        fontSize: '16px',
        color: '#64748b',
        fontWeight: '500'
    },
    riskGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
    },
    riskCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    riskHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    riskTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1e293b'
    },
    riskDetail: {
        fontSize: '13px',
        color: '#475569',
        lineHeight: '1.6',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px'
    },
    gaugeContainer: {
        marginBottom: '16px'
    },
    gaugeLabel: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '600',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    gaugeOuter: {
        height: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '6px'
    },
    gaugeFill: {
        height: '100%',
        borderRadius: '5px',
        transition: 'all 0.3s ease'
    },
    gaugeValue: {
        fontSize: '18px',
        fontWeight: '700',
        textAlign: 'right'
    },
    controlsSection: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    dataSourceSection: {
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid #f1f5f9'
    },
    dataSourceHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
    },
    dataSourceIcon: {
        fontSize: '24px'
    },
    dataSourceTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: '-0.2px'
    },
    sliderGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
    },
    sliderControl: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    sliderTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sliderLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
    },
    sliderValue: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#0f172a'
    },
    sliderRange: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#94a3b8',
        marginTop: '4px',
        paddingLeft: '2px',
        paddingRight: '2px'
    },
    checkboxCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '8px',
        border: '2px solid #e2e8f0',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#475569',
        transition: 'all 0.2s',
        backgroundColor: 'white'
    },
    checkboxInput: {
        width: '20px',
        height: '20px',
        cursor: 'pointer'
    },
    checkboxText: {
        flex: 1
    },
    controlsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
    },
    controlGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    controlLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
    },
    select: {
        padding: '10px 14px',
        border: '1.5px solid #cbd5e1',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    slider: {
        width: '100%',
        height: '6px',
        borderRadius: '3px',
        outline: 'none',
        background: '#cbd5e1',
        cursor: 'pointer'
    },
    checkboxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        marginTop: '16px'
    },
    checkbox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        borderRadius: '8px',
        border: '1.5px solid #e2e8f0',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#475569',
        transition: 'all 0.2s'
    },
    twoColumn: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
    },
    classInputs: {},
    inputCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    inputCardTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '20px'
    },
    helperText: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '6px',
        lineHeight: '1.4'
    },
    occlusionBar: {
        height: '20px',
        backgroundColor: '#e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '8px'
    },
    occlusionFill: {
        height: '100%',
        transition: 'all 0.3s ease'
    },
    classOutput: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    gradeCircle: {
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    },
    gradeNumber: {
        color: 'white',
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '4px'
    },
    gradeUrgency: {
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    classificationCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    classLabel: {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
    },
    classValue: {
        fontSize: '15px',
        color: '#1e293b',
        fontWeight: '600',
        lineHeight: '1.5'
    },
    collateralNote: {
        padding: '16px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '1.5px solid #22c55e',
        fontSize: '13px',
        color: '#166534',
        lineHeight: '1.6'
    },
    gradingScale: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    gradeBar: {
        display: 'flex',
        gap: '8px',
        marginTop: '16px'
    },
    gradeSegment: {
        flex: 1,
        padding: '20px 12px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '700',
        textAlign: 'center',
        whiteSpace: 'pre-line',
        transition: 'opacity 0.3s'
    },
    simControls: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
    },
    visualization: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    svg: {
        display: 'block'
    },
    perfMetrics: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    perfCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
    },
    perfLabel: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '10px'
    },
    perfValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px'
    },
    perfNote: {
        fontSize: '12px',
        color: '#64748b',
        lineHeight: '1.4'
    },
    patientExplanation: {
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        padding: '24px',
        border: '2px solid #22c55e'
    },
    explanationTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#166534',
        marginBottom: '16px'
    },
    explanationText: {
        fontSize: '14px',
        color: '#1e293b',
        lineHeight: '1.7'
    },
    urgentExplanation: {
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '2px solid #ef4444',
        color: '#991b1b',
        lineHeight: '1.6'
    },
    goodNews: {
        marginTop: '16px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '2px solid #22c55e',
        lineHeight: '1.6'
    }
};

export default MedicalModelsDemo;