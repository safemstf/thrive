// src/components/gallery/rendering.tsx

import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { 
  Globe, Lock, Link, Eye, EyeOff, ImageOff, Loader2, 
  MoreVertical, X, Check, ChevronDown, Edit3, Trash2 
} from 'lucide-react';

import { GalleryPiece, GalleryVisibility, GalleryLayout, GalleryItemProps, GalleryModalProps } from '@/types/gallery.types';
import { VISIBILITY_CONFIG } from './utils';

// ==================== Gallery Item Component ====================

export const GalleryItem: React.FC<GalleryItemProps> = ({
  piece,
  layout,
  isSelected,
  showPrivateIndicator,
  onQuickAction,
  priority
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  if (layout === 'list') {
    return (
      <ListItem $isSelected={isSelected}>
        <ListImage>
          {imageError ? (
            <ImageErrorBox>
              <ImageOff size={24} />
            </ImageErrorBox>
          ) : (
            <Image
              src={(piece.highResUrl || piece.imageUrl).replace(/^http:\/\//, 'https://')}
              alt={piece.alt! || piece.title! || 'Gallery artwork'}
              width={80}
              height={80}
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          )}
        </ListImage>
        
        <ListInfo>
          <ListTitle>
            {piece.title! || 'Untitled'}
            {showPrivateIndicator && piece.visibility !== 'public' && (
              <VisibilityBadge $visibility={piece.visibility}>
                {piece.visibility === 'private' ? <Lock size={14} /> : <Link size={14} />}
              </VisibilityBadge>
            )}
          </ListTitle>
          {piece.artist && <ListSubtitle>{piece.artist}</ListSubtitle>}
          <ListMeta>
            {piece.medium} • {piece.year}
            {piece.price && ` • $${piece.price.toLocaleString()}`}
          </ListMeta>
        </ListInfo>

        {onQuickAction && (
          <QuickActions>
            <QuickActionButton
              title="Edit"
              onClick={e => {
                e.stopPropagation();
                console.log('List Edit clicked for piece:', piece._id, piece);
                onQuickAction('edit', piece._id);
              }}
            >
              <Edit3 size={16} />
            </QuickActionButton>
            <QuickActionButton
              title="Delete"
              data-variant="danger"
              onClick={e => {
                e.stopPropagation();
                console.log('List Delete clicked for piece:', piece._id, piece);
                onQuickAction('delete', piece._id);
              }}
            >
              <Trash2 size={16} />
            </QuickActionButton>
          </QuickActions>
        )}
      </ListItem>
    );
  }

  return (
    <GridItem $size={piece.size} $layout={layout} $isSelected={isSelected}>
      <ImageContainer>
        {isLoading && (
          <LoadingOverlay>
            <Loader2 className="animate-spin" size={32} />
          </LoadingOverlay>
        )}
        
        {imageError ? (
          <ImageErrorBox>
            <ImageOff size={40} />
            <span>Image unavailable</span>
          </ImageErrorBox>
        ) : (
          <Image
            src={piece.thumbnailUrl.replace(/^http:\/\//, 'https://')}
            alt={piece.alt! || piece.title! || 'Gallery artwork'}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            onError={() => setImageError(true)}
            onLoad={() => setIsLoading(false)}
          />
        )}

        {showPrivateIndicator && piece.visibility !== 'public' && (
          <VisibilityIndicator $visibility={piece.visibility}>
            {piece.visibility === 'private' ? <Lock size={16} /> : <Link size={16} />}
          </VisibilityIndicator>
        )}

        {isSelected && (
          <SelectionOverlay>
            <SelectionCheck>
              <Check size={16} />
            </SelectionCheck>
          </SelectionOverlay>
        )}

        {/* Quick actions overlay for grid view */}
        {onQuickAction && (
          <QuickActionsOverlay className="quick-actions">
            <QuickActionButton
              title="Edit"
              onClick={e => {
                e.stopPropagation();
                console.log('Edit clicked for piece:', piece._id, piece);
                onQuickAction('edit', piece._id);
              }}
            >
              <Edit3 size={16} />
            </QuickActionButton>
            <QuickActionButton
              title="Delete"
              data-variant="danger"
              onClick={e => {
                e.stopPropagation();
                console.log('Delete clicked for piece:', piece._id, piece);
                onQuickAction('delete', piece._id);
              }}
            >
              <Trash2 size={16} />
            </QuickActionButton>
          </QuickActionsOverlay>
        )}
      </ImageContainer>

      <ItemInfo>
        <ItemTitle>{piece.title! || 'Untitled'}</ItemTitle>
        {piece.artist && <ItemArtist>{piece.artist}</ItemArtist>}
        {piece.status === 'available' && piece.price && (
          <ItemPrice>${piece.price.toLocaleString()}</ItemPrice>
        )}
      </ItemInfo>
    </GridItem>
  );
};

// ==================== Visibility Toggle Component ====================
interface VisibilityToggleProps {
  value: GalleryVisibility;
  onChange: (value: GalleryVisibility) => void;
  compact?: boolean;
  disabled?: boolean;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  value,
  onChange,
  compact,
  disabled
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const config = VISIBILITY_CONFIG[value];
  const Icon = { Globe, Lock, Link }[config.icon] || Globe;

  if (compact) {
    return (
      <CompactToggle>
        {Object.entries(VISIBILITY_CONFIG).map(([key, cfg]) => {
          const CompactIcon = { Globe, Lock, Link }[cfg.icon] || Globe;
          return (
            <CompactOption
              key={key}
              $active={value === key}
              onClick={() => !disabled && onChange(key as GalleryVisibility)}
              disabled={disabled}
              title={cfg.label}
            >
              <CompactIcon size={16} />
            </CompactOption>
          );
        })}
      </CompactToggle>
    );
  }

  return (
    <ToggleContainer ref={dropdownRef}>
      <ToggleButton
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Icon size={16} style={{ color: config.color }} />
        <span>{config.label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </ToggleButton>

      {isOpen && (
        <Dropdown>
          {Object.entries(VISIBILITY_CONFIG).map(([key, cfg]) => {
            const OptionIcon = { Globe, Lock, Link }[cfg.icon] || Globe;
            return (
              <DropdownOption
                key={key}
                onClick={() => {
                  onChange(key as GalleryVisibility);
                  setIsOpen(false);
                }}
                $active={value === key}
              >
                <OptionIcon size={16} style={{ color: cfg.color }} />
                <OptionInfo>
                  <OptionLabel>{cfg.label}</OptionLabel>
                  <OptionDesc>{cfg.description}</OptionDesc>
                </OptionInfo>
                {value === key && <Check size={14} />}
              </DropdownOption>
            );
          })}
        </Dropdown>
      )}
    </ToggleContainer>
  );
};

// ==================== Modal Component ====================

export const GalleryModal: React.FC<GalleryModalProps> = ({
  piece,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>

        <ModalImageContainer>
          {imageError ? (
            <ImageErrorBox>
              <ImageOff size={64} />
              <p>Unable to load image</p>
            </ImageErrorBox>
          ) : (
            <Image
              src={piece.highResUrl || piece.imageUrl}
              alt={piece.alt! || piece.title! || 'Gallery artwork'}
              fill
              style={{ objectFit: 'contain' }}
              sizes="100vw"
              priority
              onError={() => setImageError(true)}
            />
          )}
        </ModalImageContainer>

        <ModalInfo>
          <ModalHeader>
            <div>
              <ModalTitle>{piece.title! || 'Untitled'}</ModalTitle>
              {piece.artist && <ModalArtist>by {piece.artist}</ModalArtist>}
            </div>
            {piece.status === 'available' && piece.price && (
              <ModalPrice>${piece.price.toLocaleString()}</ModalPrice>
            )}
          </ModalHeader>

          {piece.description && (
            <ModalDescription>{piece.description}</ModalDescription>
          )}

          <ModalMeta>
            {piece.medium && <MetaItem><strong>Medium:</strong> {piece.medium}</MetaItem>}
            {piece.year && <MetaItem><strong>Year:</strong> {piece.year}</MetaItem>}
            {piece.dimensions && (
              <MetaItem>
                <strong>Dimensions:</strong> {piece.dimensions.width} × {piece.dimensions.height}
                {piece.dimensions.depth && ` × ${piece.dimensions.depth}`} {piece.dimensions.unit}
              </MetaItem>
            )}
          </ModalMeta>

          {/* Enhanced action buttons */}
          <ModalActions>
            {canEdit && onEdit && (
              <ModalActionButton 
                onClick={() => onEdit(piece)} 
                $variant="secondary"
              >
                <Edit3 size={16} />
                Edit Details
              </ModalActionButton>
            )}
            
            {canDelete && onDelete && (
              <ModalActionButton 
                onClick={() => onDelete(piece)} 
                $variant="danger"
              >
                <Trash2 size={16} />
                Delete Artwork
              </ModalActionButton>
            )}
          </ModalActions>
        </ModalInfo>
      </ModalContent>
    </ModalOverlay>
  );
};

// ==================== Styled Components ====================
// Grid/Masonry Items
const GridItem = styled.div<{ $size: string; $layout: string; $isSelected?: boolean }>`
  position: relative;
  cursor: pointer;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  
  ${props => props.$layout === 'masonry' && `
    break-inside: avoid;
    margin-bottom: 1rem;
  `}
  
  ${props => props.$isSelected && `
    box-shadow: 0 0 0 3px #2c2c2c;
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    
    .quick-actions {
      opacity: 1;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f3f4f6;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1;
`;

const ImageErrorBox = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  gap: 0.5rem;
`;

const VisibilityIndicator = styled.div<{ $visibility: string }>`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: ${props => props.$visibility === 'private' ? 'rgba(0,0,0,0.8)' : 'rgba(59,130,246,0.9)'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
`;

const SelectionOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SelectionCheck = styled.div`
  width: 32px;
  height: 32px;
  background: #2c2c2c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const QuickActionsOverlay = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
`;

const ItemInfo = styled.div`
  padding: 1rem;
`;

const ItemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #2c2c2c;
  margin: 0 0 0.25rem;
`;

const ItemArtist = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 0.5rem;
`;

const ItemPrice = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c2c2c;
  margin: 0;
`;

// List View
const ListItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.$isSelected ? '#2c2c2c' : '#e5e7eb'};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ListImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
`;

const ListInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #2c2c2c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ListSubtitle = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0.25rem 0;
`;

const ListMeta = styled.p`
  font-size: 0.75rem;
  color: #999;
  margin: 0;
`;

const VisibilityBadge = styled.span<{ $visibility: string }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: ${props => props.$visibility === 'private' ? '#f3f4f6' : '#dbeafe'};
  color: ${props => props.$visibility === 'private' ? '#666' : '#3b82f6'};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const QuickActionButton = styled.button<{ 'data-variant'?: 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props['data-variant'] === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.9);
        color: white;
        &:hover { background: rgba(220, 38, 38, 0.9); }
      `;
    }
    return `
      background: rgba(255, 255, 255, 0.9);
      color: #374151;
      &:hover { background: white; }
    `;
  }}
`;

// Visibility Toggle
const ToggleContainer = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #d1d5db;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  min-width: 200px;
`;

const DropdownOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? '#f9fafb' : 'white'};
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const OptionInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const OptionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
`;

const OptionDesc = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
`;

const CompactToggle = styled.div`
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
`;

const CompactOption = styled.button<{ $active: boolean }>`
  padding: 0.5rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? 'white' : 'rgba(255,255,255,0.5)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ModalImageContainer = styled.div`
  position: relative;
  flex: 1;
  background: #000;
  
  @media (min-width: 768px) {
    flex: 2;
  }
`;

const ModalInfo = styled.div`
  padding: 2rem;
  overflow-y: auto;
  
  @media (min-width: 768px) {
    flex: 1;
    max-width: 400px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
`;

const ModalArtist = styled.p`
  font-size: 1rem;
  color: #6b7280;
  font-style: italic;
  margin: 0;
`;

const ModalPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const ModalDescription = styled.p`
  font-size: 0.875rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1.5rem;
`;

const ModalMeta = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MetaItem = styled.div`
  font-size: 0.875rem;
  color: #6b7280;

  strong {
    color: #374151;
    font-weight: 500;
  }
`;

const ModalActions = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (min-width: 480px) {
    flex-direction: row;
  }
`;

const ModalActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #2c2c2c;
          color: white;
          &:hover { background: #1a1a1a; }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `;
      case 'secondary':
        return `
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
          &:hover { 
            border-color: #d1d5db;
            background: #f9fafb;
          }
        `;
      default:
        return `
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
          &:hover { 
            border-color: #d1d5db;
            background: #f9fafb;
          }
        `;
    }
  }}
`;