import React, { useMemo, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Home, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { Property, MapBounds } from './homerank.types';

const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
};

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const MapContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(2,6,23,0.06);
  height: 550px;
  position: relative;
  animation: ${scaleIn} 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.12);
  }
`;

const MapCanvas = styled.div<{ $isDragging?: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%);
  overflow: hidden;
  cursor: ${p => p.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
`;

const MapContent = styled.div<{ $zoom: number; $offsetX: number; $offsetY: number }>`
  position: absolute;
  inset: 0;
  transform: scale(${p => p.$zoom}) translate(${p => p.$offsetX}px, ${p => p.$offsetY}px);
  transform-origin: center;
  transition: transform 0.1s ease-out;
  will-change: transform;
`;

const MapGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.6;
`;

const MapControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SPACING.xs};
  z-index: 20;
`;

const MapControlButton = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #475569;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MapLegend = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  padding: ${GOLDEN_SPACING.md};
  border-radius: 12px;
  font-size: 0.85rem;
  color: #475569;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  border: 1px solid rgba(2,6,23,0.06);
  animation: ${slideInLeft} 0.5s ease-out;
`;

const LegendTitle = styled.div`
  font-weight: 700;
  color: #0f172a;
  margin-bottom: ${GOLDEN_SPACING.sm};
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  font-size: 0.95rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.sm};
  margin-bottom: ${GOLDEN_SPACING.xs};
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    transform: translateX(4px);
  }
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${p => p.$color};
  box-shadow: 0 2px 6px ${p => p.$color}40;
  flex-shrink: 0;
`;

const PropertyCluster = styled.div<{ $x: number; $y: number; $size: number }>`
  position: absolute;
  left: ${p => p.$x}%;
  top: ${p => p.$y}%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 5;
  
  &:hover {
    z-index: 101;
    transform: translate(-50%, -50%) scale(1.15);
  }
`;

const ClusterCircle = styled.div<{ $count: number }>`
  width: ${p => Math.min(60, 30 + Math.log(p.$count) * 8)}px;
  height: ${p => Math.min(60, 30 + Math.log(p.$count) * 8)}px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 3px solid white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.3s ease;
  animation: ${pulse} 2s ease infinite;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  }
`;

const PropertyMarker = styled.div<{ $x: number; $y: number; $status: string; $active: boolean }>`
  position: absolute;
  left: ${p => p.$x}%;
  top: ${p => p.$y}%;
  transform: translate(-50%, -100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${p => p.$active ? 100 : 1};
  animation: ${p => p.$active ? pulse : 'none'} 1.5s ease infinite;
  
  &:hover {
    z-index: 101;
    transform: translate(-50%, -100%) scale(1.15);
  }
`;

const MarkerPin = styled.div<{ $status: string }>`
  position: relative;
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
  
  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 14px solid ${p => {
      if (p.$status === 'active') return '#10b981';
      if (p.$status === 'pending') return '#f59e0b';
      return '#64748b';
    }};
  }
`;

const MarkerDot = styled.div<{ $status: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${p => {
    if (p.$status === 'active') return 'linear-gradient(135deg, #10b981, #059669)';
    if (p.$status === 'pending') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #64748b, #475569)';
  }};
  border: 3px solid white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
  
  ${PropertyMarker}:hover & {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  }
`;

const MarkerPopup = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
  padding: ${GOLDEN_SPACING.md};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  min-width: 240px;
  white-space: nowrap;
  pointer-events: none;
  animation: ${scaleIn} 0.2s ease-out;
  border: 1px solid rgba(2,6,23,0.06);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
  }
`;

const PopupPrice = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.4rem;
`;

const PopupAddress = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: ${GOLDEN_SPACING.sm};
  font-weight: 500;
`;

const PopupFeatures = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.sm};
  font-size: 0.85rem;
  color: #475569;
  padding-top: ${GOLDEN_SPACING.xs};
  border-top: 1px solid rgba(2,6,23,0.06);
  font-weight: 500;
`;

const MapStats = styled.div`
  position: absolute;
  top: 20px;
  right: 80px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  padding: ${GOLDEN_SPACING.sm} ${GOLDEN_SPACING.md};
  border-radius: 10px;
  font-size: 0.85rem;
  color: #475569;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(2,6,23,0.06);
  font-weight: 600;
  z-index: 10;
`;

interface PropertyMapProps {
  properties: Property[];
  activeProperty: string | null;
  onPropertyHover: (id: string | null) => void;
  onPropertyClick: (property: Property) => void;
}

interface Cluster {
  x: number;
  y: number;
  count: number;
  properties: Property[];
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  activeProperty,
  onPropertyHover,
  onPropertyClick
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculate map bounds from properties
  const bounds: MapBounds = useMemo(() => {
    if (properties.length === 0) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [properties]);

  // Convert lat/lng to map percentage
  const latLngToPercent = (lat: number, lng: number) => {
    if (bounds.maxLat === bounds.minLat || bounds.maxLng === bounds.minLng) {
      return { x: 50, y: 50 };
    }

    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Cluster properties when zoomed out
  const { clusters, individualMarkers } = useMemo(() => {
    const CLUSTER_THRESHOLD = 3; // Distance threshold for clustering (in %)
    const shouldCluster = zoom < 1.5; // Only cluster when zoomed out

    if (!shouldCluster || properties.length < 10) {
      return {
        clusters: [],
        individualMarkers: properties
      };
    }

    const clustered: Cluster[] = [];
    const unclustered: Property[] = [];
    const processed = new Set<string>();

    properties.forEach((property) => {
      if (processed.has(property.id)) return;

      const pos = latLngToPercent(property.lat, property.lng);
      const nearby: Property[] = [property];
      processed.add(property.id);

      // Find nearby properties
      properties.forEach((other) => {
        if (processed.has(other.id)) return;

        const otherPos = latLngToPercent(other.lat, other.lng);
        const distance = Math.sqrt(
          Math.pow(pos.x - otherPos.x, 2) + Math.pow(pos.y - otherPos.y, 2)
        );

        if (distance < CLUSTER_THRESHOLD) {
          nearby.push(other);
          processed.add(other.id);
        }
      });

      if (nearby.length > 1) {
        // Create cluster
        const avgX = nearby.reduce((sum, p) => sum + latLngToPercent(p.lat, p.lng).x, 0) / nearby.length;
        const avgY = nearby.reduce((sum, p) => sum + latLngToPercent(p.lat, p.lng).y, 0) / nearby.length;

        clustered.push({
          x: avgX,
          y: avgY,
          count: nearby.length,
          properties: nearby
        });
      } else {
        unclustered.push(property);
      }
    });

    return {
      clusters: clustered,
      individualMarkers: unclustered
    };
  }, [properties, zoom, bounds]);

  // Map interaction handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.max(0.5, Math.min(4, prev + delta)));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <MapContainer>
      <MapCanvas
        ref={mapRef}
        $isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <MapContent $zoom={zoom} $offsetX={offset.x} $offsetY={offset.y}>
          <MapGrid />

          {/* Render clusters */}
          {clusters.map((cluster, idx) => (
            <PropertyCluster
              key={`cluster-${idx}`}
              $x={cluster.x}
              $y={cluster.y}
              $size={cluster.count}
              onClick={() => {
                // Zoom into cluster
                setZoom(prev => Math.min(prev + 0.5, 4));
              }}
            >
              <ClusterCircle $count={cluster.count}>
                {cluster.count}
              </ClusterCircle>
            </PropertyCluster>
          ))}

          {/* Render individual markers */}
          {individualMarkers.map((property) => {
            const { x, y } = latLngToPercent(property.lat, property.lng);
            const isActive = activeProperty === property.id;

            return (
              <PropertyMarker
                key={property.id}
                $x={x}
                $y={y}
                $status={property.status}
                $active={isActive}
                onMouseEnter={() => onPropertyHover(property.id)}
                onMouseLeave={() => onPropertyHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertyClick(property);
                }}
              >
                {isActive && (
                  <MarkerPopup>
                    <PopupPrice>{formatPrice(property.price)}</PopupPrice>
                    <PopupAddress>{property.address}</PopupAddress>
                    <PopupFeatures>
                      <span>{property.bedrooms} bd</span>
                      <span>•</span>
                      <span>{property.bathrooms} ba</span>
                      <span>•</span>
                      <span>{property.sqft.toLocaleString()} sf</span>
                    </PopupFeatures>
                  </MarkerPopup>
                )}

                <MarkerPin $status={property.status}>
                  <MarkerDot $status={property.status}>
                    <Home size={14} />
                  </MarkerDot>
                </MarkerPin>
              </PropertyMarker>
            );
          })}
        </MapContent>

        <MapLegend>
          <LegendTitle>
            <Navigation size={18} />
            Property Map
          </LegendTitle>
          <LegendItem>
            <LegendDot $color="#10b981" />
            Active ({properties.filter(p => p.status === 'active').length})
          </LegendItem>
          <LegendItem>
            <LegendDot $color="#f59e0b" />
            Pending ({properties.filter(p => p.status === 'pending').length})
          </LegendItem>
          <LegendItem>
            <LegendDot $color="#64748b" />
            Sold ({properties.filter(p => p.status === 'sold').length})
          </LegendItem>
        </MapLegend>

        <MapStats>
          Showing {individualMarkers.length} properties
          {clusters.length > 0 && `, ${clusters.length} clusters`}
        </MapStats>

        <MapControls>
          <MapControlButton onClick={handleZoomIn}>
            <ZoomIn size={20} />
          </MapControlButton>
          <MapControlButton onClick={handleZoomOut}>
            <ZoomOut size={20} />
          </MapControlButton>
        </MapControls>
      </MapCanvas>
    </MapContainer>
  );
};