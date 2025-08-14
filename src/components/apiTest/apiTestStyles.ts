// src/components/apiTest/apiTestStyles.ts - Greyscale with Status Colors

import styled from 'styled-components';

// ==================== COLOR VARIABLES ====================
const colors = {
  // Base greyscale palette
  primary: '#2c2c2c',
  secondary: '#666666',
  tertiary: '#999999',
  background: '#fafafa',
  surface: '#ffffff',
  surfaceHover: '#f8f8f8',
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  text: '#2c2c2c',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Status colors for testing feedback
  success: '#16a34a',      // Green for success
  successLight: '#dcfce7', // Light green background
  successBorder: '#bbf7d0', // Green border
  
  error: '#dc2626',        // Red for errors
  errorLight: '#fef2f2',   // Light red background
  errorBorder: '#fecaca',  // Red border
  
  warning: '#ea580c',      // Orange for warnings
  warningLight: '#fff7ed', // Light orange background
  warningBorder: '#fed7aa', // Orange border
  
  running: '#2563eb',      // Blue for running
  runningLight: '#eff6ff', // Light blue background
  runningBorder: '#bfdbfe', // Blue border
  
  pending: '#64748b',      // Slate for pending
  pendingLight: '#f8fafc', // Light slate background
  pendingBorder: '#e2e8f0', // Slate border
};

// ==================== BASE STYLES ====================
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  padding: 2rem 1rem;
  font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${colors.text};
`;

export const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const HeaderLeft = styled.div``;

export const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: ${colors.primary};
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export const PageSubtitle = styled.p`
  font-size: 1rem;
  color: ${colors.secondary};
  margin: 0;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ConnectionBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: ${({ $status }) => 
    $status === 'connected' ? colors.success : 
    $status === 'disconnected' ? colors.error : 
    colors.warning};
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const AuthTokenBadge = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: ${colors.success};
  color: #ffffff;
  border: 1px solid ${colors.success};
  font-size: 0.875rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #15803d;
    border-color: #15803d;
  }
`;

export const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div<{ $color?: string }>`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.surfaceHover};
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const StatIcon = styled.div<{ $statusColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $statusColor }) => $statusColor || colors.secondary};
`;

export const StatContent = styled.div``;

export const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 300;
  line-height: 1;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${colors.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 300;
`;

export const MainCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const TabRow = styled.div`
  display: flex;
  background: ${colors.surfaceHover};
  border-bottom: 1px solid ${colors.border};
  overflow-x: auto;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: fit-content;
  padding: 1.5rem 2rem;
  font-size: 0.875rem;
  font-weight: 300;
  border: none;
  background: ${({ $active }) => ($active ? colors.surface : "transparent")};
  color: ${({ $active }) => ($active ? colors.primary : colors.secondary)};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Work Sans', sans-serif;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? colors.primary : "transparent")};
  }

  &:hover {
    background: ${({ $active }) => ($active ? colors.surface : colors.borderLight)};
    color: ${colors.primary};
  }
`;

export const TabContent = styled.div`
  padding: 2rem;
`;

export const ControlPanel = styled.div`
  margin-bottom: 2rem;
`;

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const CategoryCard = styled.button<{ $active: boolean; $color: string }>`
  background: ${({ $active }) => $active ? colors.primary : colors.surface};
  border: 1px solid ${({ $active }) => $active ? colors.primary : colors.border};
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  color: ${({ $active }) => $active ? '#ffffff' : colors.text};
  
  &:hover {
    background: ${({ $active }) => $active ? colors.primary : colors.surfaceHover};
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.borderLight};
  color: ${colors.secondary};
`;

export const CategoryName = styled.div`
  font-weight: 300;
  color: inherit;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.875rem;
`;

export const CategoryStats = styled.div`
  font-size: 0.875rem;
  color: inherit;
  font-weight: 300;
  opacity: 0.7;
`;

export const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: 1px solid ${colors.primary};
  background: ${colors.primary};
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: #1a1a1a;
    border-color: #1a1a1a;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  color: ${colors.primary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover:not(:disabled) {
    background: ${colors.surfaceHover};
    border-color: ${colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const RouteSection = styled.div``;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 300;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RouteCard = styled.div<{ $status?: string; $selected?: boolean }>`
  background: ${({ $status }) => {
    switch ($status) {
      case 'success': return colors.successLight;
      case 'error': return colors.errorLight;
      case 'running': return colors.runningLight;
      case 'pending': return colors.pendingLight;
      default: return colors.surface;
    }
  }};
  border: 2px solid ${({ $status, $selected }) => {
    if ($selected) return colors.primary;
    switch ($status) {
      case 'success': return colors.successBorder;
      case 'error': return colors.errorBorder;
      case 'running': return colors.runningBorder;
      case 'pending': return colors.pendingBorder;
      default: return colors.border;
    }
  }};
  padding: 2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $status }) => {
      switch ($status) {
        case 'success': return colors.successLight;
        case 'error': return colors.errorLight;
        case 'running': return colors.runningLight;
        case 'pending': return colors.pendingLight;
        default: return colors.surfaceHover;
      }
    }};
    border-color: ${({ $status }) => {
      switch ($status) {
        case 'success': return colors.success;
        case 'error': return colors.error;
        case 'running': return colors.running;
        case 'pending': return colors.pending;
        default: return colors.primary;
      }
    }};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

export const RouteLeft = styled.div`
  display: flex;
  gap: 1.5rem;
  flex: 1;
`;

export const StatusIcon = styled.div<{ $status?: string }>`
  color: ${({ $status }) => {
    switch ($status) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'running': return colors.running;
      case 'pending': return colors.pending;
      default: return colors.tertiary;
    }
  }};
`;

export const RouteInfo = styled.div`
  flex: 1;
`;

export const RouteName = styled.div`
  font-weight: 300;
  color: ${colors.primary};
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const RouteDescription = styled.div`
  font-size: 0.875rem;
  color: ${colors.secondary};
  margin-bottom: 1rem;
  font-weight: 300;
  line-height: 1.6;
`;

export const MethodBadge = styled.span<{ $method: string }>`
  font-weight: 300;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: ${({ $method }) => {
    switch ($method.toUpperCase()) {
      case 'GET': return colors.success;
      case 'POST': return colors.running;
      case 'PUT': return colors.warning;
      case 'DELETE': return colors.error;
      default: return colors.secondary;
    }
  }};
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 0;
`;

export const RouteTags = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const RouteTag = styled.div<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: ${({ $type }) => {
    switch ($type) {
      case 'auth': return colors.warning;
      case 'public': return colors.success;
      default: return colors.borderLight;
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'auth': return '#ffffff';
      case 'public': return '#ffffff';
      default: return colors.secondary;
    }
  }};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 300;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const RouteActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const TestButton = styled.button<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ $status }) => {
    switch ($status) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'running': return colors.running;
      default: return colors.border;
    }
  }};
  background: ${({ $status }) => {
    switch ($status) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'running': return colors.running;
      default: return colors.surface;
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'success': return '#ffffff';
      case 'error': return '#ffffff';
      case 'running': return '#ffffff';
      default: return colors.secondary;
    }
  }};
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover:not(:disabled) {
    background: ${({ $status }) => {
      switch ($status) {
        case 'success': return '#15803d';
        case 'error': return '#b91c1c';
        case 'running': return '#1d4ed8';
        default: return colors.primary;
      }
    }};
    color: #ffffff;
    border-color: ${({ $status }) => {
      switch ($status) {
        case 'success': return '#15803d';
        case 'error': return '#b91c1c';
        case 'running': return '#1d4ed8';
        default: return colors.primary;
      }
    }};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const ResponseSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${colors.border};
`;

export const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ResponseStatus = styled.div<{ $success: boolean }>`
  font-weight: 300;
  color: ${({ $success }) => $success ? colors.success : colors.error};
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${({ $success }) => $success ? colors.success : colors.error};
    border-radius: 50%;
  }
`;

export const ResponseBody = styled.div``;

export const CodeBlock = styled.pre`
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.border};
  padding: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.813rem;
  overflow: auto;
  max-height: 250px;
  color: ${colors.primary};
  line-height: 1.6;
`;

export const ErrorSection = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: ${colors.errorLight};
  border: 1px solid ${colors.errorBorder};
  border-left: 4px solid ${colors.error};
`;

export const ErrorTitle = styled.div`
  font-weight: 300;
  color: ${colors.error};
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ErrorMessage = styled.div`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.6;
`;

// Configuration Tab Styles
export const ConfigSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
`;

export const ConfigCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.surfaceHover};
`;

export const ConfigTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 300;
  color: ${colors.primary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ConfigStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ $connected }) => $connected ? colors.success : colors.error};
  font-size: 0.875rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ConfigContent = styled.div`
  padding: 2rem;
`;

export const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const ConfigLabel = styled.div`
  font-size: 0.875rem;
  color: ${colors.secondary};
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ConfigValue = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: ${colors.primary};
  text-align: right;
  max-width: 60%;
  word-break: break-all;
  font-weight: 400;
`;

export const TokenDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: ${colors.successLight};
  border: 1px solid ${colors.successBorder};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
  color: ${colors.success};
  
  &:hover {
    background: ${colors.success};
    color: #ffffff;
    border-color: ${colors.success};
  }
`;

export const ConfigActions = styled.div`
  padding: 2rem;
  border-top: 1px solid ${colors.border};
  display: flex;
  gap: 1rem;
  background: ${colors.surfaceHover};
`;

export const QuickLinks = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

export const QuickLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  color: ${colors.secondary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: ${colors.surfaceHover};
    color: ${colors.primary};
    border-color: ${colors.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;