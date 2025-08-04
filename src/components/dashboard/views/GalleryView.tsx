import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, Settings, ExternalLink, Image as GalleryIcon } from 'lucide-react';
import type { GalleryPiece } from '@/types/gallery.types';
import { theme } from '@/styles/theme';
import {
  Section,
  SectionHeader,
  SectionTitle,
  SectionActions,
  ActionButton,
  Badge,
  EmptyStateCard,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage
} from '../dashboardStyles';

// Import the upload modal
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';

interface GalleryViewProps {
  galleryItems: GalleryPiece[];
  /** Optional portfolio ID to associate uploads with */
  portfolioId?: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems, portfolioId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleUploadSuccess = () => {
    // optionally refresh gallery items here
    setIsModalOpen(false);
  };

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <GalleryIcon size={20} />
          Gallery Management
          <Badge>{galleryItems.length} pieces</Badge>
        </SectionTitle>
        <SectionActions>
          <ActionButton $primary onClick={handleUploadClick}>
            <Upload size={16} />
            Upload New
          </ActionButton>
          <ActionButton>
            <Settings size={16} />
          </ActionButton>
        </SectionActions>
      </SectionHeader>
      
      <GalleryStats>
        <GalleryStatCard>
          <StatValue>{galleryItems.length}</StatValue>
          <StatLabel>Total Pieces</StatLabel>
        </GalleryStatCard>
        <GalleryStatCard>
          <StatValue>{galleryItems.filter(item => item.visibility === 'public').length}</StatValue>
          <StatLabel>Public</StatLabel>
        </GalleryStatCard>
        <GalleryStatCard>
          <StatValue>4.8</StatValue>
          <StatLabel>Avg. Rating</StatLabel>
        </GalleryStatCard>
      </GalleryStats>
      
      <GalleryGrid>
        {galleryItems.length > 0 ? (
          galleryItems.map(item => (
            <GalleryCard key={item.id}>
              <GalleryImageContainer>
                <GalleryImage src={item.imageUrl} alt={item.title} />
                <GalleryOverlay>
                  <GalleryAction>
                    <ExternalLink size={16} />
                  </GalleryAction>
                  <GalleryAction>
                    <Settings size={16} />
                  </GalleryAction>
                </GalleryOverlay>
              </GalleryImageContainer>
              <GalleryCardContent>
                <GalleryItemTitle>{item.title}</GalleryItemTitle>
                <GalleryItemMeta>
                  <CategoryTag>{item.category}</CategoryTag>
                  <VisibilityIndicator $public={item.visibility === 'public'}>
                    {item.visibility}
                  </VisibilityIndicator>
                </GalleryItemMeta>
              </GalleryCardContent>
            </GalleryCard>
          ))
        ) : (
          <EmptyStateCard>
            <EmptyIcon>
              <GalleryIcon size={48} />
            </EmptyIcon>
            <EmptyTitle>Your gallery awaits</EmptyTitle>
            <EmptyMessage>
              Upload your first artwork to start building your creative portfolio
            </EmptyMessage>
            <ActionButton $primary onClick={handleUploadClick}>
              <Upload size={16} />
              Upload first piece
            </ActionButton>
          </EmptyStateCard>
        )}
      </GalleryGrid>

      {isModalOpen && (
        <ArtworkUploadModal
          portfolioId={portfolioId}
          onClose={handleModalClose}
          onSuccess={handleUploadSuccess}
          initialFiles={[]}
        />
      )}
    </Section>
  );
};

// Gallery-specific styled components
const GalleryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['2xl']};
`;

const GalleryStatCard = styled.div`
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  border: 1px solid ${theme.colors.border.light};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
`;

const GalleryCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${theme.colors.border.light};
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.lg};
    border-color: #3b82f6;
  }
`;

const GalleryImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  
  ${GalleryCard}:hover & {
    transform: scale(1.05);
  }
`;

const GalleryOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  opacity: 0;
  transition: opacity ${theme.transitions.normal};
  
  ${GalleryCard}:hover & {
    opacity: 1;
  }
`;

const GalleryAction = styled.button`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const GalleryCardContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const GalleryItemTitle = styled.h4`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.3;
`;

const GalleryItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CategoryTag = styled.span`
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  padding: 0.25rem ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
`;

const VisibilityIndicator = styled.span<{ $public: boolean }>`
  font-size: ${theme.typography.sizes.xs};
  color: ${props => props.$public ? '#059669' : theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
  text-transform: capitalize; 
`;