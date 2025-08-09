// src/components/dashboard/views/viewStyles.ts - Modern Glassmorphism Design System
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';

// Base container for all views
export const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing['2xl']};
  width: 100%;
`;

// Stats grid for view statistics
export const ViewStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing['2xl']};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

// Individual stat card - Modern glass morphism
export const ViewStatCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.md};
  ${themeUtils.hoverLift}
  
  &:hover {
    border-color: ${theme.colors.primary[600]};
    background: ${themeUtils.alpha(theme.colors.background.secondary, 0.95)};
  }
`;

// Stat icon container - Modern design with color support
export const ViewStatIcon = styled.div<{ $color?: string; $gradient?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: ${props => {
    if (props.$gradient) return props.$gradient;
    if (props.$color) return themeUtils.alpha(props.$color, 0.1);
    return theme.colors.background.tertiary;
  }};
  border: 1px solid ${props => {
    if (props.$color) return themeUtils.alpha(props.$color, 0.2);
    return theme.colors.border.glass;
  }};
  color: ${props => {
    if (props.$gradient) return theme.colors.text.inverse;
    if (props.$color) return props.$color;
    return theme.colors.text.secondary;
  }};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};
  flex-shrink: 0;
`;

// Stat content wrapper
export const ViewStatContent = styled.div`
  flex: 1;
`;

// Stat value display
export const ViewStatValue = styled.div`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.normal};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.secondary};
  line-height: ${theme.typography.lineHeights.tight};
`;

// Stat label
export const ViewStatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.light};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  font-family: ${theme.typography.fonts.primary};
`;

// Grid layout for view content
export const ViewGrid = styled.div<{ $minWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${props => props.$minWidth || '320px'}, 1fr));
  gap: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

// Individual view card - Modern glass design
export const ViewCard = styled.div`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  ${themeUtils.hoverLift}
  
  &:hover {
    border-color: ${theme.colors.primary[600]};
    background: ${themeUtils.alpha(theme.colors.background.secondary, 0.95)};
  }
`;

// Card header section
export const ViewCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
`;

// Card content wrapper
export const ViewCardContent = styled.div`
  padding: ${theme.spacing.xl};
`;

// Card title
export const ViewCardTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.secondary};
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

// Card description
export const ViewCardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
  font-family: ${theme.typography.fonts.primary};
`;

// Card metadata container
export const ViewCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

// Tag component - Modern glass design
export const ViewTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.8)};
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.md};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  font-family: ${theme.typography.fonts.primary};
  backdrop-filter: blur(${theme.glass.blurSubtle});
`;

// Status indicator - Modern design with status variants
export const StatusIndicator = styled.div<{ $status?: 'completed' | 'in-progress' | 'not-started' | string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => {
    switch (props.$status) {
      case 'completed':
        return themeUtils.alpha(theme.colors.accent.emerald, 0.1);
      case 'in-progress':
        return themeUtils.alpha(theme.colors.accent.blue, 0.1);
      case 'not-started':
        return theme.colors.background.tertiary;
      default:
        return theme.colors.background.tertiary;
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'completed':
        return themeUtils.alpha(theme.colors.accent.emerald, 0.3);
      case 'in-progress':
        return themeUtils.alpha(theme.colors.accent.blue, 0.3);
      case 'not-started':
        return theme.colors.border.glass;
      default:
        return theme.colors.border.glass;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed':
        return theme.colors.accent.emerald;
      case 'in-progress':
        return theme.colors.accent.blue;
      case 'not-started':
        return theme.colors.text.secondary;
      default:
        return theme.colors.text.secondary;
    }
  }};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};
`;

// Progress container
export const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.lg} 0;
`;

// Progress bar - Modern glass design
export const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${themeUtils.alpha(theme.colors.border.light, 0.6)};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  backdrop-filter: blur(${theme.glass.blurSubtle});
`;

// Progress fill - Gradient design
export const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(90deg, ${theme.colors.primary[600]} 0%, ${theme.colors.accent.blue} 100%);
  transition: width ${theme.transitions.normal};
  border-radius: ${theme.borderRadius.sm};
`;

// Progress text
export const ProgressText = styled.span`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
  min-width: 3rem;
  text-align: right;
  font-family: ${theme.typography.fonts.primary};
`;

// Action group for buttons
export const ViewActionGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

// Individual action button - Modern glass design
export const ViewAction = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.sizes.sm};
  background: ${props => props.$primary ? theme.colors.primary[600] : themeUtils.alpha(theme.colors.background.secondary, 0.8)};
  color: ${props => props.$primary ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: 1px solid ${props => props.$primary ? theme.colors.primary[600] : theme.colors.border.glass};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.primary};
  backdrop-filter: blur(${theme.glass.blurSubtle});
  
  &:hover {
    background: ${props => props.$primary ? theme.colors.primary[700] : theme.colors.background.tertiary};
    border-color: ${theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.glassSubtle};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Image container for gallery items
export const ViewImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: ${theme.colors.background.tertiary};
  border-bottom: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${theme.transitions.normal};
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

// Image overlay for actions - Modern glass
export const ViewImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${themeUtils.alpha(theme.colors.primary[800], 0.7)};
  backdrop-filter: blur(${theme.glass.blur});
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  opacity: 0;
  transition: opacity ${theme.transitions.normal};
  
  ${ViewImageContainer}:hover & {
    opacity: 1;
  }
`;

// Image action button - Modern glass design
export const ViewImageAction = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.background.secondary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

// Empty state styling - Modern glass design
export const EmptyStateCard = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['4xl']} ${theme.spacing['2xl']};
  ${themeUtils.glass(0.8)}
  border: 2px dashed ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

export const EmptyIcon = styled.div`
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.text.tertiary};
  opacity: 0.7;
`;

export const EmptyTitle = styled.h3`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.secondary};
`;

export const EmptyMessage = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.xl} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
  max-width: 400px;
  font-family: ${theme.typography.fonts.primary};
`;

// Additional modern components

// Glass card variant for special content
export const GlassCard = styled.div`
  ${themeUtils.glass(0.85)}
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  ${themeUtils.hoverLift}
  
  &:hover {
    background: ${themeUtils.alpha(theme.colors.background.secondary, 0.95)};
    border-color: ${theme.colors.primary[600]};
  }
`;

// Modern button variants
export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary[600]};
  color: ${theme.colors.text.inverse};
  border: 1px solid ${theme.colors.primary[600]};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  text-transform: uppercase;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.primary[700]};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  ${themeUtils.glass(0.8)}
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  text-transform: uppercase;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    border-color: ${theme.colors.primary[600]};
    color: ${theme.colors.text.primary};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.glassSubtle};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;