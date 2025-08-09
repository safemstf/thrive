// src\components\apiTest\apiTestStyles.ts - Modern Professional Greyscale Design

import styled from 'styled-components';

// Styled Components - Professional Greyscale Square Design
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
  font-weight: 300;
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

export const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
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
    $status === 'connected' ? '#2c2c2c' : 
    $status === 'disconnected' ? '#666666' : 
    '#999999'};
  color: #f8f8f8;
  font-size: 0.875rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  transition: all 0.2s ease;
`;

export const AuthTokenBadge = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: #2c2c2c;
  border: 1px solid #e0e0e0;
  font-size: 0.875rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    border-color: #2c2c2c;
  }
`;

export const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div<{ $color?: string }>`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
  }
`;

export const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
`;

export const StatContent = styled.div``;

export const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 300;
  line-height: 1;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 300;
`;

export const ProgressCard = styled.div`
  grid-column: span 2;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
  }
`;

export const ProgressBar = styled.div`
  height: 2px;
  background: #f0f0f0;
  margin-bottom: 1rem;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: #2c2c2c;
  transition: width 0.3s ease;
`;

export const ProgressLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const MainCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

export const TabRow = styled.div`
  display: flex;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  overflow-x: auto;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: fit-content;
  padding: 1.5rem 2rem;
  font-size: 0.875rem;
  font-weight: 300;
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#2c2c2c" : "#666")};
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
    background: ${({ $active }) => ($active ? "#2c2c2c" : "transparent")};
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#ffffff" : "#f0f0f0")};
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const CategoryCard = styled.button<{ $active: boolean; $color: string }>`
  background: ${({ $active }) => $active ? '#2c2c2c' : '#ffffff'};
  border: 1px solid ${({ $active }) => $active ? '#2c2c2c' : '#e0e0e0'};
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2c2c2c' : '#f8f8f8'};
    border-color: #2c2c2c;
  }
`;

export const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #666666;
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

export const CategoryProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #f0f0f0;
`;

export const CategoryProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: #666666;
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
  padding: 1rem 1.5rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #2c2c2c;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    background: #f8f8f8;
  }
  
  &::placeholder {
    color: #999999;
    text-transform: uppercase;
    letter-spacing: 1px;
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
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid ${({ $active }) => $active ? '#2c2c2c' : '#e0e0e0'};
  background: ${({ $active }) => $active ? '#2c2c2c' : '#ffffff'};
  color: ${({ $active }) => $active ? '#f8f8f8' : '#666'};
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: ${({ $active }) => $active ? '#2c2c2c' : '#f8f8f8'};
    color: ${({ $active }) => $active ? '#f8f8f8' : '#2c2c2c'};
    border-color: #2c2c2c;
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
  gap: 1rem;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
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
    background: #1a1a1a;
    border-color: #1a1a1a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #2c2c2c;
  
  &:hover:not(:disabled) {
    background: #f8f8f8;
    border-color: #2c2c2c;
  }
`;

export const ActionButton = styled(SecondaryButton)``;

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
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const RouteBadge = styled.span`
  font-size: 0.875rem;
  font-weight: 300;
  color: #666;
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const SelectionControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const SelectButton = styled.button`
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  color: #666;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: #f8f8f8;
    color: #2c2c2c;
    border-color: #2c2c2c;
  }
`;

export const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RouteCard = styled.div<{ $status?: string; $selected?: boolean }>`
  background: #ffffff;
  border: 2px solid ${({ $status, $selected }) => 
    $selected ? '#2c2c2c' :
    $status === 'success' ? '#666666' : 
    $status === 'error' ? '#999999' : 
    $status === 'running' ? '#2c2c2c' : 
    '#e0e0e0'};
  padding: 2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
    border-color: #2c2c2c;
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

export const RouteCheckbox = styled.div`
  padding-top: 0.25rem;
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #2c2c2c;
  }
`;

export const StatusIcon = styled.div`
  color: #666666;
`;

export const RouteInfo = styled.div`
  flex: 1;
`;

export const RouteName = styled.div`
  font-weight: 300;
  color: #2c2c2c;
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const RouteEndpoint = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

export const EndpointPath = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: #666;
  font-weight: 400;
`;

export const RouteDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 300;
  line-height: 1.6;
`;

export const MethodBadge = styled.span<{ $method: string }>`
  font-weight: 300;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  color: #2c2c2c;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  background: #f0f0f0;
  color: #666666;
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

export const ResponseTime = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666666;
  font-weight: 300;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const TestButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #666;
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;

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
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

export const DetailSection = styled.div``;

export const DetailTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 300;
  color: #666;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const CodeBlock = styled.pre`
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.813rem;
  overflow: auto;
  max-height: 250px;
  color: #2c2c2c;
  line-height: 1.6;
`;

export const ResponseSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
`;

export const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ResponseStatus = styled.div<{ $success: boolean }>`
  font-weight: 300;
  color: #2c2c2c;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ResponseMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

export const ResponseBody = styled.div``;

export const ErrorSection = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
`;

export const ErrorTitle = styled.div`
  font-weight: 300;
  color: #2c2c2c;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ErrorMessage = styled.div`
  color: #666666;
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
  background: #ffffff;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

export const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f8f8;
`;

export const ConfigTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 300;
  color: #2c2c2c;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ConfigStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #666666;
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
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const ConfigLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ConfigValue = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: #2c2c2c;
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
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
  
  &:hover {
    background: #e0e0e0;
    color: #2c2c2c;
  }
`;

export const ConfigActions = styled.div`
  padding: 2rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  background: #f8f8f8;
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
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: #f8f8f8;
    color: #2c2c2c;
    border-color: #2c2c2c;
  }
`;

export const SetupSteps = styled.div`
  padding: 2rem;
`;

export const SetupStep = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  background: #2c2c2c;
  color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 300;
  flex-shrink: 0;
  font-size: 1.125rem;
`;

export const StepContent = styled.div`
  flex: 1;
`;

export const StepTitle = styled.div`
  font-weight: 300;
  color: #2c2c2c;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 1rem;
`;

export const CodeSnippet = styled.code`
  display: block;
  padding: 1rem 1.5rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-weight: 400;
`;

export const StepNote = styled.div`
  font-size: 0.875rem;
  color: #666666;
  font-style: italic;
  font-weight: 300;
`;

// Integration Tab Styles
export const IntegrationSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
`;

export const IntegrationCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f8f8;
`;

export const CardIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 300;
  color: #2c2c2c;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const CardContent = styled.div`
  padding: 2rem;
  
  p {
    margin: 0 0 1.5rem 0;
    color: #666;
    line-height: 1.6;
    font-weight: 300;
  }
`;

export const CodeExample = styled.pre`
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.813rem;
  overflow: auto;
  color: #2c2c2c;
  line-height: 1.6;
  font-weight: 400;
`;

// Diagnostics Tab Styles
export const DiagnosticsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

export const DiagnosticCard = styled.div<{ $type: 'warning' | 'error' | 'info' | 'success' }>`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

export const DiagnosticHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f8f8;
  
  svg {
    color: #666666;
  }
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 300;
    color: #2c2c2c;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

export const DiagnosticList = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const DiagnosticItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  strong {
    color: #2c2c2c;
    font-size: 0.875rem;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  span {
    color: #666;
    font-size: 0.875rem;
    font-weight: 300;
    line-height: 1.6;
  }
`;

export const DebugCommands = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const DebugCommand = styled.div``;

export const CommandTitle = styled.div`
  font-weight: 300;
  color: #2c2c2c;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const HealthChecks = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const HealthCheck = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const HealthIcon = styled.div<{ $status: boolean }>`
  color: #666666;
`;

export const HealthLabel = styled.div`
  flex: 1;
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const HealthStatus = styled.div`
  font-size: 0.875rem;
  font-weight: 300;
  color: #2c2c2c;
  text-transform: uppercase;
  letter-spacing: 1px;
`;