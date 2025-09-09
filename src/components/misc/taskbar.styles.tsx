// src/components/misc/taskbar.styles.tsx

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { AssistantStatus } from "../llm/hoda.avatar";

/* ---------- animations ---------- */
export const fadeIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(4px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

/* ---------- main navigation styles ---------- */
export const NavContainer = styled.nav<{ $isScrolled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.$isScrolled ? 'flex-start' : 'space-between')};
  flex-wrap: wrap;
  gap: ${props => (props.$isScrolled ? '0.4rem' : '0.5rem')};
  max-width: 100%;
  padding-right: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
`;

export const NavButton = styled(Link)<{ $active?: boolean; $isScrolled?: boolean }>`
  background: none;
  border: 1px solid var(--color-primary-500);
  color: ${props => (props.$active ? 'var(--color-background-secondary)' : 'var(--color-primary-500)')};
  background-color: ${props => (props.$active ? 'var(--color-primary-500)' : 'transparent')};
  padding: ${props => (props.$isScrolled ? '0.6rem 1.2rem' : '0.75rem 1.5rem')};
  font-size: ${props => (props.$isScrolled ? '0.9rem' : '1rem')};
  font-family: var(--font-body);
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  &:hover {
    background: var(--color-primary-500);
    color: var(--color-background-secondary);
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  &:active {
    transform: translateY(0);
  }
  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  @media (max-width: 840px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

// User Dropdown Styles
export const UserDropdown = styled.div<{ $isScrolled?: boolean }>`
  position: relative;
  display: inline-block;
`;

export const UserButton = styled.button<{ $isScrolled?: boolean }>`
  background: none;
  border: 1px solid var(--color-primary-500);
  color: var(--color-primary-500);
  background-color: transparent;
  padding: ${props => (props.$isScrolled ? '0.6rem 1.2rem' : '0.75rem 1.5rem')};
  font-size: ${props => (props.$isScrolled ? '0.9rem' : '1rem')};
  font-family: var(--font-body);
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: var(--color-primary-500);
    color: var(--color-background-secondary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 840px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

export const DropdownMenu = styled.div<{ $open: boolean; $isScrolled?: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 220px;
  opacity: ${props => props.$open ? 1 : 0};
  visibility: ${props => props.$open ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$open ? '0' : '-10px'});
  transition: all 0.2s ease;
  overflow: hidden;
`;

export const DropdownHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-background-tertiary);
`;

export const UserName = styled.div`
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
`;

export const UserRole = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.5rem;
  background: var(--color-primary-500);
  color: var(--color-background-secondary);
  border-radius: var(--radius-sm);
  display: inline-block;
  font-weight: 500;
`;

export const UserEmail = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--color-background-tertiary);
  }
  
  &.logout {
    color: #dc2626;
    border-top: 1px solid var(--color-border-light);
    
    &:hover {
      background: #fef2f2;
    }
  }
  
  &.debug {
    border-top: 1px solid var(--color-border-light);
    color: var(--color-text-secondary);
    
    &:hover {
      background: var(--color-background-tertiary);
      color: var(--color-text-primary);
    }
  }
`;

export const DropdownLink = styled(Link)`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s ease;
  text-decoration: none;
  
  &:hover {
    background: var(--color-background-tertiary);
    text-decoration: none;
  }
`;

/* ---------- sidebar toggle button ---------- */
export const SidebarToggle = styled.button<{ $active: boolean; $isScrolled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$active ? 'white' : '#666666'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 1rem;

  &:hover {
    background: ${props => props.$active
    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    : 'rgba(0, 0, 0, 0.08)'};
    transform: scale(1.02);
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

/* ---------- mobile components ---------- */
export const MobileNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const MobileNavButton = styled(Link)<{ $active?: boolean }>`
  background: var(--color-background-secondary);
  border: 1px solid ${props => (props.$active ? 'var(--color-primary-500)' : 'var(--color-border-medium)')};
  color: ${props => (props.$active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)')};
  background-color: ${props => (props.$active ? 'var(--color-background-tertiary)' : 'var(--color-background-secondary)')};
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-family: var(--font-body);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
  font-weight: ${props => (props.$active ? '400' : '300')};
  text-decoration: none;
  display: block;
  text-align: left;
  width: 100%;
  border-radius: var(--radius-lg);
  &:hover {
    border-color: var(--color-primary-500);
    background-color: var(--color-background-tertiary);
    color: var(--color-primary-500);
  }
`;

export const MobileUserSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.9rem;
`;

export const MobileUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: var(--color-background-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-medium);
`;

export const MobileLogoutButton = styled.button`
  background: var(--color-background-secondary);
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-family: var(--font-body);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 300;
  width: 100%;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:hover {
    background: #dc2626;
    color: var(--color-background-secondary);
  }
`;

/* ---------- sidebar styles ---------- */
export const SidebarOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1002;
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  transition: opacity 0.2s ease;
  backdrop-filter: blur(4px);

  @media (min-width: 1025px) {
    display: none;
  }
`;

export const SidebarContainer = styled.aside<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  z-index: 1003;
  
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  
  transform: translateX(${props => props.$visible ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

export const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03));
`;

export const SidebarSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
    margin-top: auto;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
  opacity: 0.8;
`;

export const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 0.5rem;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
`;

export const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SidebarUserName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

export const SidebarUserEmail = styled.div`
  font-size: 0.8rem;
  color: #666666;
  opacity: 0.8;
`;

export const StatusBadge = styled.span<{ $type: 'dev' | 'offline' | 'live' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => {
    switch (props.$type) {
      case 'dev': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'offline': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'live': return 'linear-gradient(135deg, #10b981, #059669)';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px ${props => {
    switch (props.$type) {
      case 'dev': return 'rgba(139, 92, 246, 0.3)';
      case 'offline': return 'rgba(239, 68, 68, 0.3)';
      case 'live': return 'rgba(16, 185, 129, 0.3)';
    }
  }};
  
  svg {
    animation: ${pulse} 2s ease infinite;
  }
`;

export const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

export const QuickActionCard = styled.button<{ $color: string }>`
  background: linear-gradient(135deg, 
    ${props => `${props.$color}08`}, 
    ${props => `${props.$color}03`}
  );
  border: 1px solid ${props => `${props.$color}15`};
  border-radius: 12px;
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: #1a1a1a;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: ${props => `${props.$color}30`};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => `${props.$color}12`};
  }
  
  .action-icon {
    width: 20px;
    height: 20px;
    color: ${props => props.$color};
    margin-bottom: 0.5rem;
  }
  
  .action-title {
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }
  
  .action-desc {
    font-size: 0.7rem;
    color: #666666;
    margin: 0;
    opacity: 0.8;
    line-height: 1.3;
  }
`;

export const PortfolioCard = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, 
    ${props => `${props.$color}08`}, 
    ${props => `${props.$color}03`}
  );
  border: 1px solid ${props => `${props.$color}15`};
  border-radius: 12px;
  padding: 1rem;
`;

export const PortfolioHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const PortfolioIndicator = styled.span<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: ${p => p.$color ? `${p.$color}15` : 'rgba(0, 0, 0, 0.05)'};
  color: ${p => p.$color ?? '#666666'};
`;

export const PortfolioTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
`;

export const PortfolioSubtitle = styled.div`
  font-size: 0.7rem;
  color: #666666;
  opacity: 0.7;
`;

export const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.$active ? '#1a1a1a' : '#666666'};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.08)' : 'transparent'};
  
  &:hover {
    background: rgba(59, 130, 246, 0.06);
    color: #1a1a1a;
    transform: translateX(4px);
  }
  
  svg {
    flex-shrink: 0;
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666666;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a1a;
    transform: translateY(-1px);
  }
  
  &.logout {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.15);
    margin-top: 0.5rem;
    
    &:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.08));
      border-color: rgba(239, 68, 68, 0.25);
    }
  }
  
  svg {
    flex-shrink: 0;
  }
`;

/* ---------- Hoda sidebar styles ---------- */
export const SidebarHodaSection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.03));
`;

export const SidebarHodaHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const SidebarHodaInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SidebarHodaName = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

export const SidebarHodaStatus = styled.div<{ $status: AssistantStatus }>`
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  display: inline-block;
  
  color: ${props => {
    switch (props.$status) {
      case 'idle': return '#059669';
      case 'listening': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'speaking': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'loading': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
  
  background: ${props => {
    switch (props.$status) {
      case 'idle': return 'rgba(5, 150, 105, 0.1)';
      case 'listening': return 'rgba(59, 130, 246, 0.1)';
      case 'processing': return 'rgba(139, 92, 246, 0.1)';
      case 'speaking': return 'rgba(245, 158, 11, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      case 'loading': return 'rgba(139, 92, 246, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'idle': return 'rgba(5, 150, 105, 0.2)';
      case 'listening': return 'rgba(59, 130, 246, 0.2)';
      case 'processing': return 'rgba(139, 92, 246, 0.2)';
      case 'speaking': return 'rgba(245, 158, 11, 0.2)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      case 'loading': return 'rgba(139, 92, 246, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
`;

export const SidebarHodaDescription = styled.p`
  font-size: 0.75rem;
  color: #666666;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  opacity: 0.8;
`;

/* Debug components - only used in dropdown now */
export const DebugPanel = styled.div<{ $open: boolean }>`
  position: fixed;
  z-index: 99999;
  width: 320px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 96px);
  overflow: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-secondary);
  box-shadow: var(--shadow-lg);
  transition: transform 200ms ease, opacity 160ms ease, left 200ms ease, top 200ms ease, right 200ms ease, bottom 200ms ease;
  ${p => !p.$open && `
    right: 16px;
    bottom: 64px;
    transform: translateY(8px);
    opacity: 0;
    pointer-events: none;
  `}
  ${p => p.$open && `
    left: 50%;
    top: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
    opacity: 1;
    pointer-events: auto;
  `}
  font-family: var(--font-mono);
  font-size: 12px;
  @media (max-width: 480px) {
    ${p => p.$open ? `
      left: 12px;
      right: 12px;
      top: auto;
      bottom: 72px;
      transform: translateY(0);
      max-height: 45vh;
    ` : `
      left: 12px;
      right: 12px;
      bottom: 72px;
      transform: translateY(8px);
      opacity: 0;
      pointer-events: none;
    `}
  }
`;

export const DebugContent = styled.div`
  padding: 12px;
  color: var(--color-text-primary);
`;

export const DebugHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

export const DebugAction = styled.button`
  padding: 6px 8px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-tertiary);
  cursor: pointer;
`;

export const KeyRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  border-top: 1px dashed var(--color-border-light);
  &:first-of-type { border-top: none; padding-top: 0; }
`;