// src/components/cs/agario/ViewportControlsComponent.tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';
import { ViewportControls, ViewportButton, ZoomIndicator } from '../config/agario.styles';

interface ViewportControlsComponentProps {
  zoom: number;
  followBest: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
  onToggleFollowBest: () => void;
}

export const ViewportControlsComponent: React.FC<ViewportControlsComponentProps> = ({
  zoom,
  followBest,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onToggleFollowBest
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
        <Maximize2 size={20} />
      </ViewportButton>
      <ViewportButton
        $active={followBest}
        onClick={onToggleFollowBest}
        title="Follow Best"
      >
        <Crosshair size={20} />
      </ViewportButton>
    </ViewportControls>
    <ZoomIndicator>
      {(zoom * 100).toFixed(0)}% {followBest && '• Following Best'}
    </ZoomIndicator>
  </>
);