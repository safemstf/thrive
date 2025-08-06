// src/components/dashboard/views/GalleryView.tsx - Clean version using shared styles
import React, { useState } from 'react';
import { Upload, Settings, ExternalLink, Image as GalleryIcon } from 'lucide-react';
import type { GalleryPiece } from '@/types/gallery.types';

// Import shared styles from main dashboard styles
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

// Import shared view styles
import {
  ViewContainer,
  ViewStatsGrid,
  ViewStatCard,
  ViewStatIcon,
  ViewStatContent,
  ViewStatValue,
  ViewStatLabel,
  ViewGrid,
  ViewCard,
  ViewCardContent,
  ViewCardTitle,
  ViewCardMeta,
  ViewTag,
  ViewActionGroup,
  ViewAction,
  ViewImageContainer,
  ViewImageOverlay,
  ViewImageAction
} from './viewStyles';

// Import the upload modal
import { ArtworkUploadModal } from '@/components/gallery/utils/uploadModal';

interface GalleryViewProps {
  galleryItems: GalleryPiece[];
  portfolioId?: string;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems, portfolioId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleUploadSuccess = () => {
    setIsModalOpen(false);
    // TODO: Add gallery refresh logic here
  };

  // Calculate stats
  const publicItems = galleryItems.filter(item => item.visibility === 'public').length;
  const averageRating = 4.8; // TODO: Calculate from real data

  return (
    <ViewContainer>
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
        
        {/* Gallery Statistics */}
        <ViewStatsGrid>
          <ViewStatCard>
            <ViewStatIcon $color="#3b82f6">
              <GalleryIcon size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{galleryItems.length}</ViewStatValue>
              <ViewStatLabel>Total Pieces</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
          
          <ViewStatCard>
            <ViewStatIcon $color="#10b981">
              <ExternalLink size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{publicItems}</ViewStatValue>
              <ViewStatLabel>Public</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
          
          <ViewStatCard>
            <ViewStatIcon $color="#f59e0b">
              <Upload size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{averageRating}</ViewStatValue>
              <ViewStatLabel>Avg. Rating</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
        </ViewStatsGrid>
        
        {/* Gallery Grid */}
        <ViewGrid $minWidth="280px">
          {galleryItems.length > 0 ? (
            galleryItems.map(item => (
              <ViewCard key={item.id}>
                <ViewImageContainer>
                  <img src={item.imageUrl} alt={item.title} />
                  <ViewImageOverlay>
                    <ViewImageAction>
                      <ExternalLink size={16} />
                    </ViewImageAction>
                    <ViewImageAction>
                      <Settings size={16} />
                    </ViewImageAction>
                  </ViewImageOverlay>
                </ViewImageContainer>
                
                <ViewCardContent>
                  <ViewCardTitle>{item.title}</ViewCardTitle>
                  <ViewCardMeta>
                    <ViewTag $variant="primary">{item.category}</ViewTag>
                    <ViewTag 
                      $variant={item.visibility === 'public' ? 'success' : 'info'}
                    >
                      {item.visibility}
                    </ViewTag>
                  </ViewCardMeta>
                  
                  <ViewActionGroup>
                    <ViewAction $primary>
                      <ExternalLink size={14} />
                      View
                    </ViewAction>
                    <ViewAction>
                      <Settings size={14} />
                      Edit
                    </ViewAction>
                  </ViewActionGroup>
                </ViewCardContent>
              </ViewCard>
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
        </ViewGrid>
      </Section>

      {isModalOpen && (
        <ArtworkUploadModal
          portfolioId={portfolioId}
          onClose={handleModalClose}
          onSuccess={handleUploadSuccess}
          initialFiles={[]}
        />
      )}
    </ViewContainer>
  );
};