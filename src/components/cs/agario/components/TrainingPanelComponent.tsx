// src/components/cs/agario/components/TrainingPanelComponent.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Square, Download, Upload, Zap, Settings, X, Clock, Target, Network, GitBranch } from 'lucide-react';
import {
  HeadlessTrainer,
  TrainingConfig,
  TrainingProgress,
  TrainingCheckpoint,
  SerializedGenome,
  DEFAULT_TRAINING_CONFIG,
  TRAINING_PRESETS
} from '../utils/headless-trainer';

interface TrainingPanelComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadElites: (elites: SerializedGenome[]) => void;
  isSimulationRunning: boolean;
  onPauseSimulation: () => void;
  onResumeSimulation: () => void;
}

type PresetKey = keyof typeof TRAINING_PRESETS;

export const TrainingPanelComponent: React.FC<TrainingPanelComponentProps> = ({
  isOpen,
  onClose,
  onLoadElites,
  isSimulationRunning,
  onPauseSimulation,
  onResumeSimulation
}) => {
  const trainerRef = useRef<HeadlessTrainer | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [checkpoints, setCheckpoints] = useState<TrainingCheckpoint[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('indefinite');
  const [trainingStartTime, setTrainingStartTime] = useState<number | null>(null);

  // Training config state - default to indefinite preset for continuous training
  const [config, setConfig] = useState<TrainingConfig>({
    ...DEFAULT_TRAINING_CONFIG,
    ...TRAINING_PRESETS.indefinite
  });

  // Apply preset
  const applyPreset = useCallback((presetKey: PresetKey) => {
    const preset = TRAINING_PRESETS[presetKey];
    setSelectedPreset(presetKey);
    setConfig(prev => ({
      ...prev,
      maxGenerations: preset.maxGenerations,
      ticksPerGeneration: preset.ticksPerGeneration,
      eliteCount: preset.eliteCount,
      targetFitness: preset.targetFitness
    }));
  }, []);

  // Format elapsed time
  const formatElapsedTime = useCallback((startTime: number) => {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000) % 60;
    const hours = Math.floor(elapsed / 3600000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  // Estimate remaining time
  const estimateRemainingTime = useCallback(() => {
    if (!progress || !trainingStartTime || progress.generation <= 1) return null;

    // For indefinite training (Infinity maxGenerations), don't estimate time
    if (!isFinite(config.maxGenerations)) return 'Until stopped';

    const elapsed = Date.now() - trainingStartTime;
    const generationsCompleted = progress.generation - 1;
    const msPerGeneration = elapsed / generationsCompleted;
    const remainingGenerations = config.maxGenerations - progress.generation;
    const remainingMs = remainingGenerations * msPerGeneration;

    const seconds = Math.floor(remainingMs / 1000) % 60;
    const minutes = Math.floor(remainingMs / 60000) % 60;
    const hours = Math.floor(remainingMs / 3600000);

    if (hours > 0) {
      return `~${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `~${minutes}m ${seconds}s`;
    }
    return `~${seconds}s`;
  }, [progress, trainingStartTime, config.maxGenerations]);

  // Initialize trainer
  useEffect(() => {
    if (!trainerRef.current) {
      trainerRef.current = new HeadlessTrainer(config);

      trainerRef.current.onProgressUpdate((p) => {
        setProgress(p);
      });

      trainerRef.current.onCheckpointSave((checkpoint) => {
        setCheckpoints(prev => [...prev.slice(-5), checkpoint]); // Keep last 5
      });

      trainerRef.current.onTrainingComplete((elites) => {
        setIsTraining(false);
        console.log('Training complete! Elite count:', elites.length);
      });
    }
  }, [config]);

  const handleStartTraining = useCallback(() => {
    // Pause the main simulation when training starts
    if (isSimulationRunning) {
      onPauseSimulation();
    }

    // Create new trainer with current config
    trainerRef.current = new HeadlessTrainer(config);

    trainerRef.current.onProgressUpdate((p) => {
      setProgress(p);
    });

    trainerRef.current.onCheckpointSave((checkpoint) => {
      setCheckpoints(prev => [...prev.slice(-10), checkpoint]); // Keep last 10
    });

    trainerRef.current.onTrainingComplete((elites) => {
      setIsTraining(false);
      console.log('Training complete! Elite count:', elites.length);
    });

    setIsTraining(true);
    setIsPaused(false);
    setTrainingStartTime(Date.now());
    trainerRef.current.start();
  }, [config, isSimulationRunning, onPauseSimulation]);

  const handlePauseTraining = useCallback(() => {
    if (trainerRef.current) {
      if (isPaused) {
        trainerRef.current.resume();
        setIsPaused(false);
      } else {
        trainerRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  const handleStopTraining = useCallback(() => {
    if (trainerRef.current) {
      trainerRef.current.stop();
      setIsTraining(false);
      setIsPaused(false);
      // Resume simulation when training stops
      onResumeSimulation();
    }
  }, [onResumeSimulation]);

  const handleLoadElites = useCallback(() => {
    if (trainerRef.current && progress?.eliteGenomes) {
      // Stop training if running
      if (isTraining) {
        trainerRef.current.stop();
        setIsTraining(false);
        setIsPaused(false);
      }
      // Load elites and resume simulation
      onLoadElites(progress.eliteGenomes);
      onResumeSimulation();
      onClose();
    }
  }, [progress, onLoadElites, onClose, isTraining, onResumeSimulation]);

  const handleExportCheckpoint = useCallback(() => {
    if (!progress) return;

    const checkpoint: TrainingCheckpoint = {
      version: '1.0',
      timestamp: Date.now(),
      config,
      progress,
      eliteGenomes: progress.eliteGenomes
    };

    const dataStr = JSON.stringify(checkpoint, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportName = `training-checkpoint-gen${progress.generation}-${Date.now()}.json`;

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', exportName);
    link.click();
  }, [progress, config]);

  const handleImportCheckpoint = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const checkpoint = JSON.parse(event.target?.result as string) as TrainingCheckpoint;

        if (trainerRef.current) {
          trainerRef.current.loadCheckpoint(checkpoint);
          setProgress(checkpoint.progress);
          setConfig(checkpoint.config);
        }
      } catch (err) {
        console.error('Failed to load checkpoint:', err);
      }
    };
    reader.readAsText(file);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: '24px',
        width: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={24} color="#fbbf24" />
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem' }}>
              Headless Training
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: showSettings ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: showSettings ? '#818cf8' : '#94a3b8'
              }}
            >
              <Settings size={18} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#94a3b8'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Presets - Always visible when not training */}
        {!isTraining && (
          <div style={{
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
              Training Duration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {(Object.keys(TRAINING_PRESETS) as PresetKey[]).map((key) => {
                const preset = TRAINING_PRESETS[key];
                const isSelected = selectedPreset === key;
                const isIndefinite = key === 'indefinite';
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    style={{
                      padding: '8px 6px',
                      background: isSelected
                        ? isIndefinite
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? isIndefinite
                          ? '1px solid #4ade80'
                          : '1px solid #a78bfa'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: isSelected ? '#fff' : '#94a3b8',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {preset.name}
                    </div>
                    <div style={{
                      fontSize: '0.55rem',
                      opacity: 0.8,
                      marginTop: '2px'
                    }}>
                      {preset.description.split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings Panel - Advanced Options */}
        {showSettings && !isTraining && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
              Advanced Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Max Generations</label>
                <input
                  type="number"
                  value={config.maxGenerations}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxGenerations: parseInt(e.target.value) || 100 }))}
                  disabled={isTraining}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Ticks per Gen</label>
                <input
                  type="number"
                  value={config.ticksPerGeneration}
                  onChange={(e) => setConfig(prev => ({ ...prev, ticksPerGeneration: parseInt(e.target.value) || 1000 }))}
                  disabled={isTraining}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Fitness</label>
                <input
                  type="number"
                  value={config.targetFitness}
                  onChange={(e) => setConfig(prev => ({ ...prev, targetFitness: parseInt(e.target.value) || 500 }))}
                  disabled={isTraining}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    marginTop: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Elite Count</label>
                <input
                  type="number"
                  value={config.eliteCount}
                  onChange={(e) => setConfig(prev => ({ ...prev, eliteCount: parseInt(e.target.value) || 10 }))}
                  disabled={isTraining}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    marginTop: '4px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Display */}
        {progress && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            {/* Time info bar */}
            {isTraining && trainingStartTime && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '8px',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa' }}>
                  <Clock size={14} />
                  <span>Elapsed: {formatElapsedTime(trainingStartTime)}</span>
                </div>
                {estimateRemainingTime() && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                    <Target size={14} />
                    <span>Remaining: {estimateRemainingTime()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Main stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa' }}>
                  {progress.generation}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Generation</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>
                  {progress.bestFitness.toFixed(0)}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Best Fit</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>
                  {progress.avgFitness.toFixed(0)}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Avg Fit</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>
                  {(progress.trainingSpeed / 1000).toFixed(1)}k
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Ticks/s</div>
              </div>
            </div>

            {/* Complexity metrics - key for tracking neural net evolution */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '12px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '0.75rem',
                color: '#a78bfa',
                fontWeight: 600
              }}>
                <Network size={14} />
                Neural Network Complexity
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c4b5fd' }}>
                    {(progress.avgNodes ?? 0).toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8b5cf6' }}>Avg Nodes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c4b5fd' }}>
                    {(progress.avgConnections ?? 0).toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8b5cf6' }}>Avg Conns</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e9d5ff' }}>
                    {progress.maxNodes ?? 0}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8b5cf6' }}>Max Nodes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e9d5ff' }}>
                    {progress.maxConnections ?? 0}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8b5cf6' }}>Max Conns</div>
                </div>
              </div>
              {/* Complexity score bar */}
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.65rem',
                  color: '#8b5cf6',
                  marginBottom: '4px'
                }}>
                  <span>Complexity Score</span>
                  <span style={{ fontWeight: 600, color: '#c4b5fd' }}>
                    {(progress.complexityScore ?? 0).toFixed(1)}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    // Scale: assume complexity score of 100+ is very complex
                    width: `${Math.min(100, ((progress.complexityScore ?? 0) / 100) * 100)}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd)',
                    borderRadius: '3px',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            </div>

            {/* Generation progress bar - only show if not indefinite */}
            {isFinite(config.maxGenerations) ? (
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  <span>Overall Progress</span>
                  <span>Gen {progress.generation} / {config.maxGenerations}</span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(progress.generation / config.maxGenerations) * 100}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            ) : (
              <div style={{
                marginBottom: '8px',
                padding: '8px 12px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#22c55e'
              }}>
                <GitBranch size={14} />
                <span><strong>Indefinite Training</strong> - Gen {progress.generation} (runs until stopped)</span>
              </div>
            )}

            {/* Current generation tick progress */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: '#475569',
                marginBottom: '2px'
              }}>
                <span>Current Gen</span>
                <span>{progress.tick} / {config.ticksPerGeneration}</span>
              </div>
              <div style={{
                height: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(progress.tick / config.ticksPerGeneration) * 100}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  borderRadius: '2px',
                  transition: 'width 0.1s'
                }} />
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#64748b'
            }}>
              <span>Pop: {progress.population}</span>
              <span>Elites: {progress.eliteGenomes?.length || 0}</span>
              <span>Max Lineage: G{progress.maxGeneration}</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px'
        }}>
          {!isTraining ? (
            <button
              onClick={handleStartTraining}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Play size={18} />
              Start Training
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseTraining}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: isPaused
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStopTraining}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <Square size={18} />
              </button>
            </>
          )}
        </div>

        {/* Load Elites Button */}
        {progress?.eliteGenomes && progress.eliteGenomes.length > 0 && (
          <button
            onClick={handleLoadElites}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            <Zap size={18} />
            Load {progress.eliteGenomes.length} Elite Agents into Simulation
          </button>
        )}

        {/* Import/Export */}
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={handleExportCheckpoint}
            disabled={!progress}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: progress ? '#94a3b8' : '#475569',
              cursor: progress ? 'pointer' : 'not-allowed'
            }}
          >
            <Download size={16} />
            Export
          </button>
          <label style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer'
          }}>
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportCheckpoint}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Status Indicator */}
        {isTraining && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#fbbf24',
              animation: 'pulse 1s infinite'
            }} />
            <span>
              <strong>Live simulation paused</strong> - Training running at maximum speed
            </span>
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#94a3b8',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#3b82f6' }}>Headless Training</strong> runs evolution
          without rendering for 10-100x faster training.
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
            <li><strong>Indefinite:</strong> Runs until you stop it - watch complexity grow!</li>
            <li><strong>Extended:</strong> 2-4 hours for complex behaviors</li>
            <li><strong>Overnight:</strong> 8+ hours for highly evolved agents</li>
          </ul>
          <div style={{ marginTop: '8px', color: '#64748b' }}>
            <strong>Complexity Metrics:</strong> Track neural network growth via node/connection counts.
            Higher complexity often indicates more sophisticated behavior patterns.
          </div>
        </div>
      </div>
    </div>
  );
};
