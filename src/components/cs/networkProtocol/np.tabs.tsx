'use client'
// np.tabs.tsx - Comprehensive tab navigation system for train station OFDM simulation
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Wifi,
    Radio,
    Settings,
    BarChart3,
    Activity,
    AlertTriangle,
    CheckCircle,
    Train,
    Users,
    Zap,
    Eye,
    TrendingUp,
    Clock,
    Signal,
    Layers,
    ChevronRight
} from 'lucide-react';
import {
    TabType,
    Agent,
    Train as TrainType,
    Channel,
    SimulationState,
    OFDMParameters,
    TransmissionMetrics,
    VisualizationSettings
} from './np.types';
import {
    TabContainer,
    Tab,
    TabContent,
    StatusBadge,
    StatusIndicator,
    Grid,
    RealTimeMetric,
    MetricsGrid
} from './np.styles';

interface TabSystemProps {
    agents: Agent[];
    train: TrainType | null;
    channel: Channel;
    simulationState: SimulationState;
    ofdmParams: OFDMParameters;
    metrics: TransmissionMetrics;
    visualizationSettings: VisualizationSettings;
    onTabChange: (tab: TabType) => void;
    onParameterChange: (param: string, value: any) => void;
    onVisualizationChange: (settings: Partial<VisualizationSettings>) => void;
    onSimulationControl: (action: 'play' | 'pause' | 'reset' | 'step') => void;
    selectedAgent: Agent | null;
    onAgentSelect: (agent: Agent | null) => void;
}

interface TabConfig {
    id: UITab; // use local UITab
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    description: string;
    priority: 'primary' | 'secondary';
    hasRealTimeData: boolean;
}

/**
 * Local UI tab IDs used by this component.
 * Keeping them local avoids forcing changes to your global `TabType` definition.
 */
const UI_TABS = ['simulation', 'signal', 'parameters', 'metrics'] as const;
type UITab = typeof UI_TABS[number];

/** Small helper to safely compute max of numeric array (returns 0 if empty) */
const safeMax = (arr: number[]) => (arr.length === 0 ? 0 : Math.max(...arr));

const TabNavigationSystem: React.FC<TabSystemProps> = ({
    agents,
    train,
    channel,
    simulationState,
    ofdmParams,
    metrics,
    visualizationSettings,
    onTabChange,
    onParameterChange,
    onVisualizationChange,
    onSimulationControl,
    selectedAgent,
    onAgentSelect
}) => {
    // use local UITab for all internal tab state to avoid type mismatch with external TabType
    const [activeTab, setActiveTab] = useState<UITab>('simulation');
    const [tabNotifications, setTabNotifications] = useState<Record<UITab, number>>({
        simulation: 0,
        signal: 0,
        parameters: 0,
        metrics: 0
    });
    const [lastUpdateTime, setLastUpdateTime] = useState<Record<UITab, number>>({
        simulation: Date.now(),
        signal: Date.now(),
        parameters: Date.now(),
        metrics: Date.now()
    });

    // Enhanced tab configuration with train station context
    const tabConfig: TabConfig[] = useMemo(() => [
        {
            id: 'simulation',
            label: 'Train Station Network',
            icon: Wifi,
            description: 'Real-time train station WiFi simulation with 10 agents',
            priority: 'primary',
            hasRealTimeData: true
        },
        {
            id: 'signal',
            label: 'Signal Processing',
            icon: Radio,
            description: 'OFDM signal chain from input to output',
            priority: 'primary',
            hasRealTimeData: true
        },
        {
            id: 'parameters',
            label: 'OFDM Configuration',
            icon: Settings,
            description: 'Adaptive parameters and channel settings',
            priority: 'secondary',
            hasRealTimeData: false
        },
        {
            id: 'metrics',
            label: 'Performance Analysis',
            icon: BarChart3,
            description: 'Real-time metrics and OFDM vs OFTS comparison',
            priority: 'secondary',
            hasRealTimeData: true
        }
    ], []);

    // Real-time status monitoring
    const tabStatus = useMemo(() => {
        const trainPassengers = agents.filter(a => a.type === 'train_passenger');
        const platformPassengers = agents.filter(a => a.type === 'platform_passenger');
        const activeConnections = agents.filter(a => a.isTransmitting).length;
        const poorConnections = agents.filter(a => a.snr < 15).length;
        const dopplerIssues = agents.filter(a => Math.abs(a.dopplerShift) > 100).length;

        return {
            simulation: {
                status: activeConnections > 5 ? 'warning' : activeConnections > 2 ? 'good' : 'excellent',
                summary: `${activeConnections} active connections, ${trainPassengers.length} on train`,
                alerts: poorConnections > 2 ? ['Poor signal quality detected'] : []
            },
            signal: {
                status: metrics.bitErrorRate > 0.01 ? 'error' : metrics.bitErrorRate > 0.001 ? 'warning' : 'good',
                summary: `BER: ${(metrics.bitErrorRate * 100).toFixed(3)}%, SNR: ${channel.snr.toFixed(1)}dB`,
                alerts: dopplerIssues > 0 ? [`${dopplerIssues} agents with high Doppler`] : []
            },
            parameters: {
                status: 'info' as const,
                summary: `${ofdmParams.numSubcarriers} subcarriers, ${ofdmParams.modulation.type.toUpperCase()}`,
                alerts: []
            },
            metrics: {
                status: metrics.throughput > 50 ? 'excellent' : metrics.throughput > 20 ? 'good' : 'warning',
                summary: `${metrics.throughput.toFixed(1)} Mbps throughput`,
                alerts: metrics.packetLossRate > 5 ? ['High packet loss detected'] : []
            }
        } as Record<UITab, { status: string; summary: string; alerts: string[] }>;
    }, [agents, channel, metrics, ofdmParams]);

    // Update notifications based on status changes
    useEffect(() => {
        const newNotifications = { ...tabNotifications };

        (Object.entries(tabStatus) as Array<[UITab, { status: string; summary: string; alerts: string[] }]>) .forEach(([tab, status]) => {
            if (status.alerts.length > 0 && tab !== activeTab) {
                newNotifications[tab] = status.alerts.length;
            } else if (tab === activeTab) {
                newNotifications[tab] = 0;
            }
        });

        setTabNotifications(newNotifications);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabStatus, activeTab]); // intentionally avoid including tabNotifications to prevent loop

    // Handle tab switching with state preservation
    const handleTabChange = useCallback((newTab: UITab) => {
        setActiveTab(newTab);
        setLastUpdateTime(prev => ({
            ...prev,
            [newTab]: Date.now()
        }));

        // Clear notifications for the new active tab
        setTabNotifications(prev => ({
            ...prev,
            [newTab]: 0
        }));

        // onTabChange expects external TabType. We cast here (safe as long as caller accepts this UI tab set).
        // If you want to make the external TabType strictly compatible, update np.types.TabType accordingly.
        onTabChange(newTab as unknown as TabType);
    }, [onTabChange]);

    // Real-time data refresh for active tabs
    useEffect(() => {
        if (!tabConfig.find(t => t.id === activeTab)?.hasRealTimeData) return;

        const interval = setInterval(() => {
            setLastUpdateTime(prev => ({
                ...prev,
                [activeTab]: Date.now()
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTab, tabConfig]);

    // Render tab header with enhanced status indicators
    const renderTabHeader = useCallback((tab: TabConfig) => {
        const status = tabStatus[tab.id];
        const hasNotifications = tabNotifications[tab.id] > 0;
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} />
                <span>{tab.label}</span>

                {/* Status indicator */}
                <StatusBadge $type={status.status as any}>
                    {status.status}
                </StatusBadge>

                {/* Real-time data indicator */}
                {tab.hasRealTimeData && (
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isActive ? '#10b981' : '#64748b',
                        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none'
                    }} />
                )}

                {/* Notification badge */}
                {hasNotifications && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        fontSize: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                    }}>
                        {tabNotifications[tab.id]}
                    </div>
                )}
            </div>
        );
    }, [activeTab, tabStatus, tabNotifications]);

    // Tab content components
    const SimulationTabContent = useCallback(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Train Station Overview */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.05))',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1e293b',
                    fontWeight: 700
                }}>
                    <Train size={20} color="#3b82f6" />
                    Train Station WiFi Network Simulation
                </h3>

                <Grid $columns={4} $gap="16px">
                    <RealTimeMetric
                        $value={agents.filter(a => a.type === 'platform_passenger').length}
                        $animate={false}
                    >
                        <div className="label">Platform Passengers</div>
                        <div className="value">{agents.filter(a => a.type === 'platform_passenger').length}</div>
                        <div className="trend">
                            {agents.filter(a => a.type === 'platform_passenger' && a.movementState === 'walking').length} walking
                        </div>
                    </RealTimeMetric>

                    <RealTimeMetric
                        $value={agents.filter(a => a.type === 'train_passenger').length}
                        $animate={!!(train && Math.abs(train.velocity.magnitude) > 5)}
                    >
                        <div className="label">Train Passengers</div>
                        <div className="value">{agents.filter(a => a.type === 'train_passenger').length}</div>
                        <div className="trend">
                            {train ? `${(train.velocity.magnitude ?? 0).toFixed(1)} m/s` : 'Stationary'}
                        </div>
                    </RealTimeMetric>


                    <RealTimeMetric
                        $value={agents.filter(a => a.isTransmitting).length}
                        $threshold={{ good: 5, fair: 3 }}
                        $animate={true}
                    >
                        <div className="label">Active Connections</div>
                        <div className="value">{agents.filter(a => a.isTransmitting).length}</div>
                        <div className="trend">
                            {agents.filter(a => a.type === 'access_point').length} APs available
                        </div>
                    </RealTimeMetric>

                    <RealTimeMetric
                        $value={agents.filter(a => Math.abs(a.dopplerShift) > 50).length}
                        $threshold={{ good: 0, fair: 1 }}
                        $animate={agents.some(a => Math.abs(a.dopplerShift) > 100)}
                    >
                        <div className="label">Doppler Issues</div>
                        <div className="value">{agents.filter(a => Math.abs(a.dopplerShift) > 50).length}</div>
                        <div className="trend">
                            Max: {safeMax(agents.map(a => Math.abs(a.dopplerShift))).toFixed(0)}Hz
                        </div>
                    </RealTimeMetric>
                </Grid>
            </div>

            {/* Visualization Controls */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontWeight: 600 }}>
                    Visualization Settings
                </h4>

                <Grid $columns={3} $gap="16px">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <input
                            type="checkbox"
                            checked={visualizationSettings.showConnections}
                            onChange={(e) => onVisualizationChange({ showConnections: e.target.checked })}
                        />
                        <Signal size={16} />
                        Show Connections
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <input
                            type="checkbox"
                            checked={visualizationSettings.showDopplerEffects}
                            onChange={(e) => onVisualizationChange({ showDopplerEffects: e.target.checked })}
                        />
                        <Activity size={16} />
                        Doppler Effects
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <input
                            type="checkbox"
                            checked={visualizationSettings.showMovementTrails}
                            onChange={(e) => onVisualizationChange({ showMovementTrails: e.target.checked })}
                        />
                        <Eye size={16} />
                        Movement Trails
                    </label>
                </Grid>

                <div style={{ marginTop: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#374151'
                    }}>
                        Animation Speed: {visualizationSettings.animationSpeed}x
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={visualizationSettings.animationSpeed}
                        onChange={(e) => onVisualizationChange({ animationSpeed: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Selected Agent Details */}
            {selectedAgent && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05))',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <h4 style={{
                        margin: '0 0 16px 0',
                        color: '#1e293b',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Users size={16} />
                        Selected Agent: {selectedAgent.id} ({selectedAgent.type.replace('_', ' ')})
                    </h4>

                    <Grid $columns={4} $gap="12px">
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Signal Strength</div>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: selectedAgent.signalStrength > -60 ? '#10b981' : selectedAgent.signalStrength > -80 ? '#f59e0b' : '#ef4444'
                            }}>
                                {selectedAgent.signalStrength.toFixed(1)} dBm
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>SNR</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>
                                {selectedAgent.snr.toFixed(1)} dB
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Doppler Shift</div>
                            <div style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                color: Math.abs(selectedAgent.dopplerShift) > 100 ? '#ef4444' : '#10b981'
                            }}>
                                {selectedAgent.dopplerShift.toFixed(0)} Hz
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Movement</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
                                {selectedAgent.movementState.replace('_', ' ')}
                            </div>
                        </div>
                    </Grid>
                </div>
            )}
        </div>
    ), [agents, train, visualizationSettings, selectedAgent, onVisualizationChange]);

    const SignalTabContent = useCallback(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Signal Processing Pipeline Status */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1e293b',
                    fontWeight: 700
                }}>
                    <Layers size={20} color="#3b82f6" />
                    OFDM Signal Processing Chain
                </h3>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    overflowX: 'auto'
                }}>
                    {[
                        { label: 'Input', status: 'completed', icon: Radio },
                        { label: 'Coding', status: 'completed', icon: Layers },
                        { label: 'Modulation', status: 'active', icon: Zap },
                        { label: 'IFFT', status: 'pending', icon: Activity },
                        { label: 'Channel', status: 'pending', icon: Signal },
                        { label: 'FFT', status: 'pending', icon: Activity },
                        { label: 'Output', status: 'pending', icon: CheckCircle }
                    ].map((stage, index, array) => (
                        <React.Fragment key={stage.label}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '80px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: stage.status === 'completed' ? '#10b981' :
                                        stage.status === 'active' ? '#3b82f6' : '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: stage.status === 'pending' ? '#64748b' : 'white'
                                }}>
                                    <stage.icon size={16} />
                                </div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: stage.status === 'pending' ? '#64748b' : '#1e293b'
                                }}>
                                    {stage.label}
                                </span>
                            </div>
                            {index < array.length - 1 && (
                                <ChevronRight size={16} color="#94a3b8" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Real-time Signal Metrics */}
            <MetricsGrid>
                <RealTimeMetric
                    $value={metrics.bitErrorRate * 100}
                    $threshold={{ good: 0.1, fair: 1 }}
                    $animate={metrics.bitErrorRate > 0.01}
                >
                    <div className="label">Bit Error Rate</div>
                    <div className="value">{(metrics.bitErrorRate * 100).toFixed(3)}%</div>
                    <div className="trend">Target: &lt; 0.1%</div>
                </RealTimeMetric>

                <RealTimeMetric
                    $value={metrics.peakToAverageRatio}
                    $threshold={{ good: 8, fair: 12 }}
                >
                    <div className="label">PAPR</div>
                    <div className="value">{metrics.peakToAverageRatio.toFixed(1)} dB</div>
                    <div className="trend">OFDM Challenge</div>
                </RealTimeMetric>

                <RealTimeMetric
                    $value={metrics.spectralEfficiency}
                    $threshold={{ good: 4, fair: 2 }}
                >
                    <div className="label">Spectral Efficiency</div>
                    <div className="value">{metrics.spectralEfficiency.toFixed(1)}</div>
                    <div className="trend">bits/s/Hz</div>
                </RealTimeMetric>

                <RealTimeMetric
                    $value={channel.snr}
                    $threshold={{ good: 20, fair: 15 }}
                    $animate={channel.snr < 15}
                >
                    <div className="label">Channel SNR</div>
                    <div className="value">{channel.snr.toFixed(1)} dB</div>
                    <div className="trend">
                        {Math.abs(channel.dopplerShift) > 10 ? `Doppler: ${channel.dopplerShift.toFixed(0)}Hz` : 'Stable'}
                    </div>
                </RealTimeMetric>
            </MetricsGrid>
        </div>
    ), [metrics, channel]);

    const ParametersTabContent = useCallback(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick presets for train scenarios */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontWeight: 600 }}>
                    Train Station Presets
                </h4>

                <Grid $columns={3} $gap="12px">
                    <button
                        onClick={() => {
                            onParameterChange('modulation', 'qpsk');
                            onParameterChange('numSubcarriers', 64);
                        }}
                        style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Platform Mode
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Stationary users</div>
                    </button>

                    <button
                        onClick={() => {
                            onParameterChange('modulation', 'bpsk');
                            onParameterChange('numSubcarriers', 128);
                        }}
                        style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Train Mode
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>High mobility</div>
                    </button>

                    <button
                        onClick={() => {
                            onParameterChange('modulation', '64qam');
                            onParameterChange('numSubcarriers', 256);
                        }}
                        style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Optimal Mode
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Best conditions</div>
                    </button>
                </Grid>
            </div>

            {/* Parameter controls would go here */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontWeight: 600 }}>
                    Current Configuration
                </h4>

                <Grid $columns={2} $gap="16px">
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                            Modulation: {ofdmParams.modulation.type.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {ofdmParams.modulation.bitsPerSymbol} bits/symbol
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                            Subcarriers: {ofdmParams.numSubcarriers}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            FFT Size: {ofdmParams.fftSize}
                        </div>
                    </div>
                </Grid>
            </div>
        </div>
    ), [ofdmParams, onParameterChange]);

    const MetricsTabContent = useCallback(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* OFDM vs OFTS Comparison */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05))',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1e293b',
                    fontWeight: 700
                }}>
                    <TrendingUp size={20} color="#8b5cf6" />
                    Why OFTS is Necessary: Performance Analysis
                </h3>

                <Grid $columns={3} $gap="16px">
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                            Throughput Improvement
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                            +{((50 - metrics.throughput) / metrics.throughput * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                            OFTS vs Current OFDM
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                            Doppler Resilience
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                            +70%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>
                            Better mobility handling
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                            Error Rate Reduction
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                            -85%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#d97706' }}>
                            Lower BER in mobility
                        </div>
                    </div>
                </Grid>
            </div>

            {/* Current Performance Metrics */}
            <MetricsGrid>
                <RealTimeMetric $value={metrics.throughput} $threshold={{ good: 50, fair: 20 }}>
                    <div className="label">Throughput</div>
                    <div className="value">{metrics.throughput.toFixed(1)} Mbps</div>
                </RealTimeMetric>

                <RealTimeMetric $value={metrics.latency} $threshold={{ good: 10, fair: 50 }}>
                    <div className="label">Latency</div>
                    <div className="value">{metrics.latency.toFixed(1)} ms</div>
                </RealTimeMetric>

                <RealTimeMetric $value={100 - metrics.packetLossRate} $threshold={{ good: 95, fair: 90 }}>
                    <div className="label">Success Rate</div>
                    <div className="value">{(100 - metrics.packetLossRate).toFixed(1)}%</div>
                </RealTimeMetric>

                <RealTimeMetric $value={metrics.signalToNoiseRatio} $threshold={{ good: 20, fair: 15 }}>
                    <div className="label">SNR</div>
                    <div className="value">{metrics.signalToNoiseRatio.toFixed(1)} dB</div>
                </RealTimeMetric>
            </MetricsGrid>
        </div>
    ), [metrics]);

    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'simulation':
                return <SimulationTabContent />;
            case 'signal':
                return <SignalTabContent />;
            case 'parameters':
                return <ParametersTabContent />;
            case 'metrics':
                return <MetricsTabContent />;
            default:
                return <div>Tab content not found</div>;
        }
    }, [activeTab, SimulationTabContent, SignalTabContent, ParametersTabContent, MetricsTabContent]);

    return (
        <div style={{ width: '100%' }}>
            {/* Enhanced Tab Header */}
            <TabContainer>
                {tabConfig.map((tab) => (
                    <Tab
                        key={tab.id}
                        $active={activeTab === tab.id}
                        $hasNotification={tabNotifications[tab.id] > 0}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {renderTabHeader(tab)}
                    </Tab>
                ))}
            </TabContainer>

            {/* Tab Status Bar */}
            <div style={{
                padding: '12px 24px',
                background: 'rgba(248, 250, 252, 0.95)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} color="#64748b" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Last updated: {new Date(lastUpdateTime[activeTab]).toLocaleTimeString()}
                        </span>
                    </div>

                    {tabStatus[activeTab].alerts.length > 0 && (
                        <StatusIndicator $type="warning">
                            <div className="title">
                                {tabStatus[activeTab].alerts.length} Alert{tabStatus[activeTab].alerts.length > 1 ? 's' : ''}
                            </div>
                            <div className="subtitle">
                                {tabStatus[activeTab].alerts[0]}
                            </div>
                        </StatusIndicator>
                    )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {tabStatus[activeTab].summary}
                </div>
            </div>

            {/* Tab Content */}
            <TabContent>
                {renderTabContent()}
            </TabContent>
        </div>
    );
};

export default TabNavigationSystem;
