// src\components\apiTest\apiTestStyles.ts

import styled from 'styled-components';

// Styled Components - Light Theme to match Taskbar design
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding: 2rem 1rem;
  font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2c2c2c;
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
  font-weight: 700;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

export const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

export const ConnectionBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 400;
  background: ${({ $status }) => 
    $status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 
    $status === 'disconnected' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(59, 130, 246, 0.1)'};
  color: ${({ $status }) => 
    $status === 'connected' ? '#10b981' : 
    $status === 'disconnected' ? '#ef4444' : 
    '#3b82f6'};
  border: 1px solid currentColor;
`;

export const AuthTokenBadge = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 400;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
  }
`;

export const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div<{ $color?: string }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  ${({ $color }) => $color && `
    border-color: ${$color}33;
    background: ${$color}08;
    
    svg {
      color: ${$color};
    }
  `}
`;

export const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StatContent = styled.div``;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: #2c2c2c;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
  font-weight: 300;
`;

export const ProgressCard = styled.div`
  grid-column: span 2;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const ProgressBar = styled.div`
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
`;

export const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

export const ProgressLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  font-weight: 300;
`;

export const MainCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
`;

export const TabRow = styled.div`
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: fit-content;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: ${({ $active }) => ($active ? "400" : "300")};
  border: none;
  background: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#2c2c2c" : "#666")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Work Sans', sans-serif;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? "#2c2c2c" : "transparent")};
  }

  &:hover {
    background: ${({ $active }) => ($active ? "white" : "#f3f4f6")};
    color: #2c2c2c;
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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const CategoryCard = styled.button<{ $active: boolean; $color: string }>`
  background: ${({ $active }) => $active ? 'white' : '#fafafa'};
  border: 2px solid ${({ $active, $color }) => $active ? $color : '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ $active }) => $active ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none'};
  
  &:hover {
    background: white;
    border-color: ${({ $color }) => $color};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}15`};
  border-radius: 12px;
  color: ${({ $color }) => $color};
`;

export const CategoryName = styled.div`
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
`;

export const CategoryStats = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

export const CategoryProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f3f4f6;
`;

export const CategoryProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

export const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #2c2c2c;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

export const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => $active ? '#3b82f6' : '#e5e7eb'};
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.1)' : 'white'};
  color: ${({ $active }) => $active ? '#3b82f6' : '#666'};
  font-size: 0.813rem;
  font-weight: ${({ $active }) => $active ? '400' : '300'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.2)' : '#f9fafb'};
    color: ${({ $active }) => $active ? '#3b82f6' : '#2c2c2c'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 2px;
  border: 1px solid #2c2c2c;
  background: #2c2c2c;
  color: #f8f8f8;
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: white;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  
  &:hover:not(:disabled) {
    background: #f8f8f8;
  }
`;

export const ActionButton = styled(SecondaryButton)``;

export const RouteSection = styled.div``;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const RouteBadge = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: #666;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
`;

export const SelectionControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SelectButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
  color: #666;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  
  &:hover {
    background: #f9fafb;
    color: #2c2c2c;
    border-color: #d1d5db;
  }
`;

export const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RouteCard = styled.div<{ $status?: string; $selected?: boolean }>`
  background: white;
  border: 2px solid ${({ $status, $selected }) => 
    $selected ? '#3b82f6' :
    $status === 'success' ? '#10b98133' : 
    $status === 'error' ? '#ef444433' : 
    $status === 'running' ? '#3b82f633' : 
    '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
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
  gap: 1rem;
  flex: 1;
`;

export const RouteCheckbox = styled.div`
  padding-top: 0.125rem;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

export const StatusIcon = styled.div``;

export const RouteInfo = styled.div`
  flex: 1;
`;

export const RouteName = styled.div`
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 0.375rem;
  font-size: 1rem;
`;

export const RouteEndpoint = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
`;

export const EndpointPath = styled.span`
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #666;
`;

export const RouteDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 300;
`;

export const MethodBadge = styled.span<{ $method: string }>`
  font-weight: 500;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ $method }) => 
    $method === 'GET' ? 'rgba(59, 130, 246, 0.2)' :
    $method === 'POST' ? 'rgba(16, 185, 129, 0.2)' :
    $method === 'PUT' || $method === 'PATCH' ? 'rgba(245, 158, 11, 0.2)' :
    $method === 'DELETE' ? 'rgba(239, 68, 68, 0.2)' :
    'rgba(156, 163, 175, 0.2)'};
  color: ${({ $method }) => 
    $method === 'GET' ? '#3b82f6' :
    $method === 'POST' ? '#10b981' :
    $method === 'PUT' || $method === 'PATCH' ? '#f59e0b' :
    $method === 'DELETE' ? '#ef4444' :
    '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const RouteTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const RouteTag = styled.div<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: ${({ $type }) => 
    $type === 'auth' ? 'rgba(245, 158, 11, 0.1)' :
    $type === 'skip' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(156, 163, 175, 0.1)'};
  color: ${({ $type }) => 
    $type === 'auth' ? '#f59e0b' :
    $type === 'skip' ? '#ef4444' :
    '#6b7280'};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

export const RouteActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ResponseTime = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.813rem;
  color: ${({ $status }) => $status === 'success' ? '#10b981' : '#ef4444'};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const TestButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #666;
  font-size: 0.813rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    background: #2c2c2c;
    color: #f8f8f8;
    border-color: #2c2c2c;
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

export const RouteDetails = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

export const DetailSection = styled.div``;

export const DetailTitle = styled.div`
  font-size: 0.813rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CodeBlock = styled.pre`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  overflow: auto;
  max-height: 200px;
  color: #374151;
`;

export const ResponseSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

export const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

export const ResponseStatus = styled.div<{ $success: boolean }>`
  font-weight: 600;
  color: ${({ $success }) => $success ? '#10b981' : '#ef4444'};
`;

export const ResponseMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.813rem;
  color: #666;
`;

export const ResponseBody = styled.div``;

export const ErrorSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
`;

export const ErrorTitle = styled.div`
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.5rem;
`;

export const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
`;

// Configuration Tab Styles
export const ConfigSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

export const ConfigCard = styled.div`
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

export const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;

export const ConfigTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

export const ConfigStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $connected }) => $connected ? '#10b981' : '#ef4444'};
  font-size: 0.875rem;
`;

export const ConfigContent = styled.div`
  padding: 1.5rem;
`;

export const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const ConfigLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

export const ConfigValue = styled.div`
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #374151;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
`;

export const TokenDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    color: #2c2c2c;
  }
`;

export const ConfigActions = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  background: white;
`;

export const QuickLinks = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

export const QuickLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: 'Work Sans', sans-serif;
  
  &:hover {
    background: #f9fafb;
    color: #2c2c2c;
    border-color: #d1d5db;
  }
`;

export const SetupSteps = styled.div`
  padding: 1.5rem;
`;

export const SetupStep = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2c2c2c;
  color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

export const StepContent = styled.div`
  flex: 1;
`;

export const StepTitle = styled.div`
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
`;

export const CodeSnippet = styled.code`
  display: block;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.813rem;
  color: #3b82f6;
  margin-bottom: 0.25rem;
`;

export const StepNote = styled.div`
  font-size: 0.813rem;
  color: #f59e0b;
  font-style: italic;
`;

// Integration Tab Styles
export const IntegrationSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

export const IntegrationCard = styled.div`
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;

export const CardIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

export const CardContent = styled.div`
  padding: 1.5rem;
  
  p {
    margin: 0 0 1rem 0;
    color: #666;
    line-height: 1.6;
  }
`;

export const CodeExample = styled.pre`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  overflow: auto;
  color: #374151;
  line-height: 1.6;
`;

// Diagnostics Tab Styles
export const DiagnosticsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

export const DiagnosticCard = styled.div<{ $type: 'warning' | 'error' | 'info' | 'success' }>`
  background: white;
  border: 1px solid ${({ $type }) => 
    $type === 'warning' ? '#f59e0b' :
    $type === 'error' ? '#ef4444' :
    $type === 'info' ? '#3b82f6' :
    '#10b981'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const DiagnosticHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  
  svg {
    color: inherit;
  }
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c2c2c;
  }
`;

export const DiagnosticList = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const DiagnosticItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  strong {
    color: #2c2c2c;
    font-size: 0.875rem;
  }
  
  span {
    color: #666;
    font-size: 0.813rem;
    font-weight: 300;
  }
`;

export const DebugCommands = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const DebugCommand = styled.div``;

export const CommandTitle = styled.div`
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

export const HealthChecks = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HealthCheck = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const HealthIcon = styled.div<{ $status: boolean }>`
  color: ${({ $status }) => $status ? '#10b981' : '#ef4444'};
`;

export const HealthLabel = styled.div`
  flex: 1;
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

export const HealthStatus = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c2c2c;
`;