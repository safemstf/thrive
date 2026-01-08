import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Home, TrendingUp, Info, MapPin, Bed, Bath, Maximize, Calendar } from 'lucide-react';
import { Property } from './homerank.types';

const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
  xl: `${4.236}rem`,
};

const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  animation: ${modalFadeIn} 0.3s ease-out;
  overflow-y: auto;
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalSlideUp} 0.4s ease-out;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: ${GOLDEN_SPACING.lg};
  border-bottom: 1px solid rgba(2,6,23,0.06);
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 20px 20px 0 0;
`;

const ModalClose = styled.button`
  position: absolute;
  top: ${GOLDEN_SPACING.md};
  right: ${GOLDEN_SPACING.md};
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ef4444;
    color: white;
    transform: scale(1.05);
  }
`;

const ModalImageContainer = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: ${GOLDEN_SPACING.md};
`;

const ModalImage = styled.div<{ $url: string }>`
  width: 100%;
  height: 100%;
  background: url(${p => p.$url}) center/cover;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
`;

const ModalPrice = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
  margin-top: ${GOLDEN_SPACING.xs};
`;

const ModalBody = styled.div`
  padding: ${GOLDEN_SPACING.lg};
`;

const Section = styled.div`
  margin-bottom: ${GOLDEN_SPACING.xl};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 ${GOLDEN_SPACING.md} 0;
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.sm};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${GOLDEN_SPACING.md};
`;

const DetailCard = styled.div`
  padding: ${GOLDEN_SPACING.md};
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid rgba(2,6,23,0.06);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const DetailLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${GOLDEN_SPACING.xs};
`;

const DetailValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  background: #f8fafc;
  border-radius: 12px;
  padding: ${GOLDEN_SPACING.md};
  position: relative;
  border: 1px solid rgba(2,6,23,0.06);
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.md};
  margin-top: ${GOLDEN_SPACING.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const ChartLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
`;

const ChartLegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.$color};
`;

const ProjectionCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${GOLDEN_SPACING.md};
  margin-top: ${GOLDEN_SPACING.md};
`;

const ProjectionCard = styled.div<{ $trend: 'up' | 'down' | 'stable' }>`
  padding: ${GOLDEN_SPACING.md};
  background: ${p => {
    if (p.$trend === 'up') return 'linear-gradient(135deg, #10b98110, #05966910)';
    if (p.$trend === 'down') return 'linear-gradient(135deg, #ef444410, #dc262610)';
    return 'linear-gradient(135deg, #64748b10, #47556910)';
  }};
  border-radius: 12px;
  border: 1px solid ${p => {
    if (p.$trend === 'up') return '#10b98130';
    if (p.$trend === 'down') return '#ef444430';
    return '#64748b30';
  }};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectionYear = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: ${GOLDEN_SPACING.xs};
`;

const ProjectionPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: ${GOLDEN_SPACING.xs};
`;

const ProjectionChange = styled.div<{ $positive: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${p => p.$positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Price projection chart component
  const PriceChart = () => {
    const width = 800;
    const height = 250;
    const padding = 40;
    
    const prices = property.priceHistory.map(h => h.price);
    const minPrice = Math.min(...prices) * 0.9;
    const maxPrice = Math.max(...prices) * 1.1;
    
    const xScale = (index: number) => {
      return padding + (index / (property.priceHistory.length - 1)) * (width - 2 * padding);
    };
    
    const yScale = (price: number) => {
      return height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
    };
    
    const currentIndex = property.priceHistory.findIndex(h => h.type === 'current');
    
    return (
      <ChartContainer>
        <ChartSVG viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + ratio * (height - 2 * padding)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Historical line */}
          <path
            d={property.priceHistory.slice(0, currentIndex + 1).map((h, i) => {
              const x = xScale(i);
              const y = yScale(h.price);
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Projected line */}
          <path
            d={property.priceHistory.slice(currentIndex).map((h, i) => {
              const x = xScale(currentIndex + i);
              const y = yScale(h.price);
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="8,4"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {property.priceHistory.map((h, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(h.price)}
                r="5"
                fill={h.type === 'projected' ? '#10b981' : '#667eea'}
                stroke="white"
                strokeWidth="2"
              />
              {i % 2 === 0 && (
                <text
                  x={xScale(i)}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {h.date}
                </text>
              )}
            </g>
          ))}
          
          {/* Current price marker */}
          <line
            x1={xScale(currentIndex)}
            y1={padding}
            x2={xScale(currentIndex)}
            y2={height - padding}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        </ChartSVG>
        
        <ChartLegend>
          <ChartLegendItem>
            <ChartLegendDot $color="#667eea" />
            Historical Price
          </ChartLegendItem>
          <ChartLegendItem>
            <ChartLegendDot $color="#10b981" />
            Projected Price
          </ChartLegendItem>
          <ChartLegendItem>
            <ChartLegendDot $color="#f59e0b" />
            Current Value
          </ChartLegendItem>
        </ChartLegend>
      </ChartContainer>
    );
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalClose onClick={onClose}>
          <X size={20} />
        </ModalClose>
        
        <ModalHeader>
          <ModalImageContainer>
            <ModalImage $url={property.imageUrl} />
          </ModalImageContainer>
          <ModalTitle>
            <MapPin size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            {property.address}
          </ModalTitle>
          <div style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
            {property.city}, {property.state} {property.zipCode}
          </div>
          <ModalPrice>{formatPrice(property.price)}</ModalPrice>
        </ModalHeader>

        <ModalBody>
          <Section>
            <SectionTitle>
              <Home size={20} />
              Property Details
            </SectionTitle>
            <DetailGrid>
              <DetailCard>
                <DetailLabel>
                  <Bed size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Bedrooms
                </DetailLabel>
                <DetailValue>{property.bedrooms}</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>
                  <Bath size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Bathrooms
                </DetailLabel>
                <DetailValue>{property.bathrooms}</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>
                  <Maximize size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Square Feet
                </DetailLabel>
                <DetailValue>{property.sqft.toLocaleString()}</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Year Built
                </DetailLabel>
                <DetailValue>{property.yearBuilt}</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>Lot Size</DetailLabel>
                <DetailValue>{property.lotSize?.toLocaleString()} sqft</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>Status</DetailLabel>
                <DetailValue style={{ textTransform: 'capitalize' }}>{property.status}</DetailValue>
              </DetailCard>
            </DetailGrid>
          </Section>

          <Section>
            <SectionTitle>
              <TrendingUp size={20} />
              Price Projection Analysis
            </SectionTitle>
            <PriceChart />
            
            <ProjectionCards>
              {[1, 3, 5].map(years => {
                const futurePrice = property.price * Math.pow(1 + property.appreciation, years);
                const change = ((futurePrice - property.price) / property.price) * 100;
                
                return (
                  <ProjectionCard key={years} $trend="up">
                    <ProjectionYear>{years} Year{years > 1 ? 's' : ''}</ProjectionYear>
                    <ProjectionPrice>{formatPrice(Math.round(futurePrice))}</ProjectionPrice>
                    <ProjectionChange $positive={true}>
                      <TrendingUp size={16} />
                      +{change.toFixed(1)}%
                    </ProjectionChange>
                  </ProjectionCard>
                );
              })}
            </ProjectionCards>
          </Section>

          <Section>
            <SectionTitle>
              <Info size={20} />
              Investment Insights
            </SectionTitle>
            <DetailGrid>
              <DetailCard>
                <DetailLabel>Annual Appreciation</DetailLabel>
                <DetailValue>{(property.appreciation * 100).toFixed(1)}%</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>Market Trend</DetailLabel>
                <DetailValue style={{ 
                  textTransform: 'capitalize', 
                  color: property.marketTrend === 'up' ? '#10b981' : '#64748b' 
                }}>
                  {property.marketTrend}
                </DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>HomeRank Score</DetailLabel>
                <DetailValue>{property.score}/10</DetailValue>
              </DetailCard>
              <DetailCard>
                <DetailLabel>Price per Sqft</DetailLabel>
                <DetailValue>${Math.round(property.price / property.sqft)}</DetailValue>
              </DetailCard>
            </DetailGrid>
          </Section>
        </ModalBody>
      </Modal>
    </ModalOverlay>
  );
};