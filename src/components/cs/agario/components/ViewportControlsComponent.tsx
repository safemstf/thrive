// src/components/cs/agario/ViewportControlsComponent.tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Crosshair, RotateCcw } from 'lucide-react';
import { ViewportControls, ViewportButton, ZoomIndicator } from '../config/agario.styles';

interface ViewportControlsComponentProps {
  zoom: number;
  followBest: boolean;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onToggleFollowBest: () => void;
  onToggleFullscreen: () => void;
}

export const ViewportControlsComponent: React.FC<ViewportControlsComponentProps> = ({
  zoom,
  followBest,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onToggleFollowBest,
  onToggleFullscreen
}) => (
  <>
    <ViewportControls>
      <ViewportButton onClick={onZoomIn} title="Zoom In">
        <ZoomIn size={20} />
      </ViewportButton>
      <ViewportButton onClick={onZoomOut} title="Zoom Out">
        <ZoomOut size={20} />
      </ViewportButton>
      <ViewportButton onClick={onResetCamera} title="Reset View">
        <RotateCcw size={20} />
      </ViewportButton>
      <ViewportButton
        $active={followBest}
        onClick={onToggleFollowBest}
        title="Follow Best"
      >
        <Crosshair size={20} />
      </ViewportButton>
      <ViewportButton
        $active={isFullscreen}
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </ViewportButton>
    </ViewportControls>
    <ZoomIndicator>
      {(zoom * 100).toFixed(0)}% {followBest && '• Following'} {isFullscreen && '• Fullscreen'}
    </ZoomIndicator>
  </>
);