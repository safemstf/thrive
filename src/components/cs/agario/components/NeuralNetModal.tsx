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
  const canReproduce = selectedBlob.age >= MIN_AGE_FOR_REPRODUCTION &&
    selectedBlob.mass >= REPRODUCTION_MIN_MASS &&
    (selectedBlob.kills > 0 || selectedBlob.foodEaten >= FOOD_FOR_REPRODUCTION);

  return (
    <ModalWrapper onClick={onClose}>
      <NeuralNetPanel onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Brain size={24} color="#6366f6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Interactive Neural Network - Blob #{selectedBlob.id} (Lineage {selectedBlob.familyLineage})
          </h2>
        </div>

        <NeuralNetControls>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ControlButton
              $active={neuralNetMode === 'physics'}
              onClick={onToggleNeuralNetMode}
              title="Toggle physics simulation (nodes move freely vs fixed positions)"
            >
              {neuralNetMode === 'physics' ? <Move size={16} /> : <Lock size={16} />}
              {neuralNetMode === 'physics' ? 'Physics Mode' : 'Fixed Mode'}
            </ControlButton>

            <ControlButton
              $active={showActivations}
              onClick={onToggleShowActivations}
              title="Toggle activation values display"
            >
              {showActivations ? <EyeOff size={16} /> : <Eye size={16} />}
              {showActivations ? 'Hide Activations' : 'Show Activations'}
            </ControlButton>

            <ControlButton
              $active={showWeights}
              onClick={onToggleShowWeights}
              title="Toggle weight values display"
            >
              <Zap size={16} />
              {showWeights ? 'Hide Weights' : 'Show Weights'}
            </ControlButton>

            <ControlButton
              onClick={onResetLayout}
              title="Reset node positions to default layout"
            >
              <RefreshCw size={16} />
              Reset Layout
            </ControlButton>

            <ControlButton
              onClick={onExportNetwork}
              title="Export network as JSON"
            >
              <Download size={16} />
              Export
            </ControlButton>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ZoomControls>
              <ZoomButton onClick={onZoomOut} title="Zoom out">
                <Minus size={14} />
              </ZoomButton>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '60px', textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <ZoomButton onClick={onZoomIn} title="Zoom in">
                <Plus size={14} />
              </ZoomButton>
              <ZoomButton onClick={onResetZoom} title="Reset zoom">
                <Maximize2 size={14} />
              </ZoomButton>
            </ZoomControls>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Click + Drag: Move nodes</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Shift+Click: Lock/Unlock</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Scroll: Zoom</span>
            </div>
          </div>
        </NeuralNetControls>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', marginBottom: '1rem' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <StatsContainer>
              <SectionTitle>
                <Network size={16} />
                Network Structure
              </SectionTitle>
              <StatsGrid>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Nodes</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {neuralNodeCount}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Connections</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                    {neuralConnectionCount}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Hidden Layers</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                    {selectedBlob.brain?.hiddenLayers?.length || 1}
                  </div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mutated</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedBlob.brain?.mutated ? '#10b981' : '#94a3b8' }}>
                    {selectedBlob.brain?.mutated ? 'YES' : 'NO'}
                  </div>
                </StatItem>
              </StatsGrid>

              {selectedNodeInfo && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <SectionTitle>
                    <Brain size={16} />
                    Selected Node
                  </SectionTitle>
                  <StatsGrid>
                    <StatItem>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Layer</div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 700, 
                        color: selectedNodeInfo.layer === 'input' ? '#3b82f6' : 
                               selectedNodeInfo.layer === 'hidden' ? '#8b5cf6' : '#10b981'
                      }}>
                        {selectedNodeInfo.layer.toUpperCase()}
                      </div>
                    </StatItem>
                    <StatItem>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {selectedNodeInfo.id}
                      </div>
                    </StatItem>
                    {selectedNodeInfo.activation !== undefined && (
                      <StatItem>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Activation</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>
                          {selectedNodeInfo.activation.toFixed(3)}
                        </div>
                      </StatItem>
                    )}
                    {selectedNodeInfo.connections !== undefined && (
                      <StatItem>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Connections</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e' }}>
                          {selectedNodeInfo.connections}
                        </div>
                      </StatItem>
                    )}
                  </StatsGrid>
                </div>
              )}
            </StatsContainer>

            <BlobInfo>
              <SectionTitle>
                <GitBranch size={16} />
                Blob Statistics
              </SectionTitle>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Generation</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6366f6' }}>{selectedBlob.generation}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Family Size</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e' }}>{familySize}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Children</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{selectedBlob.childrenIds.length}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Age</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6' }}>{selectedBlob.age}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mass</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e' }}>{selectedBlob.mass.toFixed(1)}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Food Eaten</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{selectedBlob.foodEaten}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kills</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444' }}>{selectedBlob.kills}</div>
                </StatItem>
                <StatItem>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Can Reproduce?</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: canReproduce ? '#10b981' : '#ef4444' }}>
                    {canReproduce ? 'YES' : 'NO'}
                  </div>
                </StatItem>
              </div>
            </BlobInfo>
          </div>
        </div>

        <Instructions>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
            <div>
              <strong style={{ color: '#fbbf24' }}>Natural Reproduction:</strong> Blobs reproduce only when they achieve enough food ({FOOD_FOR_REPRODUCTION}+) or get kills.
            </div>
            <div>
              <strong style={{ color: '#22c55e' }}>Family Protection:</strong> Blobs won't attack their own family lineage.
            </div>
            <div>
              <strong style={{ color: '#3b82f6' }}>Interactive Network:</strong> Drag nodes to rearrange • Shift+click to lock • Scroll to zoom
            </div>
          </div>
        </Instructions>
      </NeuralNetPanel>
    </ModalWrapper>
  );
};