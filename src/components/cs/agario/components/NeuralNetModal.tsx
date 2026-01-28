// src/components/cs/agario/NeuralNetModalComponent.tsx
import React from 'react';
import {
  Brain, Move, Lock, RefreshCw, X,
  Eye, EyeOff, Network, Zap, GitBranch,
  Maximize2, Minus, Plus, Download
} from 'lucide-react';
import {
  NeuralNetModal as ModalWrapper,
  NeuralNetPanel,
  CloseButton,
  NeuralNetCanvas,
  CanvasWrapper,
  BlobInfo,
  NeuralNetControls,
  ControlButton,
  StatsContainer,
  StatsGrid,
  StatItem,
  SectionTitle,
  Instructions,
  ZoomControls,
  ZoomButton
} from '../config/agario.styles';
import { Blob } from '../config/agario.types';
import {
  MIN_AGE_FOR_REPRODUCTION,
  REPRODUCTION_MIN_MASS,
  FOOD_FOR_REPRODUCTION
} from '../config/agario.constants';

interface NeuralNetModalComponentProps {
  selectedBlob: Blob;
  familySize: number;
  onClose: () => void;
  neuralNetCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  neuralNetMode: 'physics' | 'fixed';
  showActivations: boolean;
  showWeights: boolean;
  zoomLevel: number;
  onToggleNeuralNetMode: () => void;
  onToggleShowActivations: () => void;
  onToggleShowWeights: () => void;
  onResetLayout: () => void;
  onLogLayoutInfo: () => void;
  onExportNetwork: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onNeuralNetMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onNeuralNetMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onNeuralNetMouseUp: () => void;
  onNeuralNetWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  neuralNodeCount?: number;
  neuralConnectionCount?: number;
  selectedNodeInfo?: {
    id: number;
    layer: 'input' | 'hidden' | 'output';
    activation?: number;
    bias?: number;
    connections?: number;
  } | null;
}

export const NeuralNetModalComponent: React.FC<NeuralNetModalComponentProps> = ({
  selectedBlob,
  familySize,
  onClose,
  neuralNetCanvasRef,
  neuralNetMode,
  showActivations,
  showWeights,
  zoomLevel,
  onToggleNeuralNetMode,
  onToggleShowActivations,
  onToggleShowWeights,
  onResetLayout,
  onLogLayoutInfo,
  onExportNetwork,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onNeuralNetMouseDown,
  onNeuralNetMouseMove,
  onNeuralNetMouseUp,
  onNeuralNetWheel,
  neuralNodeCount = 0,
  neuralConnectionCount = 0,
  selectedNodeInfo
}) => {
  // Calculate reproduction eligibility
  const canReproduce = selectedBlob.age >= MIN_AGE_FOR_REPRODUCTION &&
    selectedBlob.mass >= REPRODUCTION_MIN_MASS &&
    (selectedBlob.kills > 0 || selectedBlob.foodEaten >= FOOD_FOR_REPRODUCTION);

  // Get layer color helper
  const getLayerColor = (layer: 'input' | 'hidden' | 'output') => {
    switch (layer) {
      case 'input': return '#3b82f6';
      case 'hidden': return '#8b5cf6';
      case 'output': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <ModalWrapper onClick={onClose}>
      <NeuralNetPanel onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={24} color="#6366f6" />
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                lineHeight: 1.2
              }}>
                Neural Network Visualization
              </h2>
              <div style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                marginTop: '0.25rem'
              }}>
                Blob #{selectedBlob.id} • Lineage {selectedBlob.familyLineage} • Gen {selectedBlob.generation}
              </div>
            </div>
          </div>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </div>

        {/* Main Controls */}
        <NeuralNetControls>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ControlButton
              $active={neuralNetMode === 'physics'}
              onClick={onToggleNeuralNetMode}
              title={neuralNetMode === 'physics'
                ? 'Switch to fixed layout'
                : 'Enable physics simulation'}
            >
              {neuralNetMode === 'physics' ? <Move size={16} /> : <Lock size={16} />}
              {neuralNetMode === 'physics' ? 'Physics' : 'Fixed'}
            </ControlButton>

            <ControlButton
              $active={showActivations}
              onClick={onToggleShowActivations}
              title="Toggle activation values on nodes"
            >
              {showActivations ? <Eye size={16} /> : <EyeOff size={16} />}
              Activations
            </ControlButton>

            <ControlButton
              $active={showWeights}
              onClick={onToggleShowWeights}
              title="Toggle weight values on connections"
            >
              <Zap size={16} />
              Weights
            </ControlButton>

            <ControlButton
              onClick={onResetLayout}
              title="Reset all nodes to default positions"
            >
              <RefreshCw size={16} />
              Reset
            </ControlButton>

            <ControlButton
              onClick={onExportNetwork}
              title="Download network structure as JSON"
            >
              <Download size={16} />
              Export
            </ControlButton>
          </div>

          {/* Zoom & Instructions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <ZoomControls>
              <ZoomButton onClick={onZoomOut} title="Zoom out (Ctrl + Scroll)">
                <Minus size={14} />
              </ZoomButton>
              <span style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                minWidth: '60px',
                textAlign: 'center',
                fontWeight: 600
              }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <ZoomButton onClick={onZoomIn} title="Zoom in (Ctrl + Scroll)">
                <Plus size={14} />
              </ZoomButton>
              <ZoomButton onClick={onResetZoom} title="Reset to 100%">
                <Maximize2 size={14} />
              </ZoomButton>
            </ZoomControls>

            <div style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span>Drag: Move</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Shift+Click: Lock</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Scroll: Zoom</span>
            </div>
          </div>
        </NeuralNetControls>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '1rem',
          marginBottom: '1rem',
          minHeight: '500px'
        }}>
          {/* Canvas */}
          <CanvasWrapper>
            <NeuralNetCanvas
              ref={neuralNetCanvasRef}
              onMouseDown={onNeuralNetMouseDown}
              onMouseMove={onNeuralNetMouseMove}
              onMouseUp={onNeuralNetMouseUp}
              onMouseLeave={onNeuralNetMouseUp}
              onWheel={onNeuralNetWheel}
            />
          </CanvasWrapper>

          {/* Sidebar Stats */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto',
            maxHeight: '600px'
          }}>
            {/* Network Structure */}
            <StatsContainer>
              <SectionTitle>
                <Network size={16} />
                Network Architecture
              </SectionTitle>
              <StatsGrid>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Nodes
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {neuralNodeCount}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Connections
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>
                    {neuralConnectionCount}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Hidden Layers
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                    {selectedBlob.brain?.hiddenLayers?.length || 1}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mutation
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: selectedBlob.brain?.mutated ? '#10b981' : '#64748b'
                  }}>
                    {selectedBlob.brain?.mutated ? 'Yes' : 'No'}
                  </div>
                </StatItem>
              </StatsGrid>
            </StatsContainer>

            {/* Selected Node Info */}
            {selectedNodeInfo && (
              <StatsContainer>
                <SectionTitle>
                  <Brain size={16} />
                  Selected Node
                </SectionTitle>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getLayerColor(selectedNodeInfo.layer)
                    }} />
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: getLayerColor(selectedNodeInfo.layer),
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {selectedNodeInfo.layer}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      marginLeft: 'auto'
                    }}>
                      ID: {selectedNodeInfo.id}
                    </span>
                  </div>

                  <StatsGrid>
                    {selectedNodeInfo.activation !== undefined && (
                      <StatItem>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Activation</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                          {selectedNodeInfo.activation.toFixed(3)}
                        </div>
                      </StatItem>
                    )}
                    {selectedNodeInfo.bias !== undefined && (
                      <StatItem>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Bias</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>
                          {selectedNodeInfo.bias.toFixed(3)}
                        </div>
                      </StatItem>
                    )}
                    {selectedNodeInfo.connections !== undefined && (
                      <StatItem>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Connections</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                          {selectedNodeInfo.connections}
                        </div>
                      </StatItem>
                    )}
                  </StatsGrid>
                </div>
              </StatsContainer>
            )}

            {/* Blob Statistics */}
            <BlobInfo>
              <SectionTitle>
                <GitBranch size={16} />
                Blob Performance
              </SectionTitle>
              <StatsGrid>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Generation</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f6' }}>
                    {selectedBlob.generation}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Family Size</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                    {familySize}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Children</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                    {selectedBlob.childrenIds.length}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Age</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {selectedBlob.age}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mass</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                    {selectedBlob.mass.toFixed(1)}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Food Eaten</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                    {selectedBlob.foodEaten}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kills</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                    {selectedBlob.kills}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Can Reproduce</div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: canReproduce ? '#10b981' : '#64748b'
                  }}>
                    {canReproduce ? 'Yes' : 'No'}
                  </div>
                </StatItem>
              </StatsGrid>

              {/* Reproduction Requirements */}
              {!canReproduce && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.75rem',
                  color: '#fca5a5'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Needs to reproduce:
                  </div>
                  <div>
                    {selectedBlob.age < MIN_AGE_FOR_REPRODUCTION &&
                      `• Age ${MIN_AGE_FOR_REPRODUCTION}+ (currently ${selectedBlob.age})`}
                    {selectedBlob.mass < REPRODUCTION_MIN_MASS &&
                      `• Mass ${REPRODUCTION_MIN_MASS}+ (currently ${selectedBlob.mass.toFixed(1)})`}
                    {selectedBlob.kills === 0 && selectedBlob.foodEaten < FOOD_FOR_REPRODUCTION &&
                      `• ${FOOD_FOR_REPRODUCTION}+ food eaten or 1+ kill`}
                  </div>
                </div>
              )}
            </BlobInfo>
          </div>
        </div>

        {/* Footer Instructions */}
        <Instructions>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.85rem'
          }}>
            <div>
              <strong style={{ color: '#3b82f6' }}>Interactive Controls:</strong> Drag nodes to rearrange • Shift+click to lock/unlock • Scroll to zoom in/out
            </div>
            <div>
              <strong style={{ color: '#22c55e' }}>Family System:</strong> Blobs protect their lineage and won't attack family members
            </div>
            <div>
              <strong style={{ color: '#fbbf24' }}>Reproduction:</strong> Requires {FOOD_FOR_REPRODUCTION}+ food or kills to reproduce naturally
            </div>
          </div>
        </Instructions>
      </NeuralNetPanel>
    </ModalWrapper>
  );
};