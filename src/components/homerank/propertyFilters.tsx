import React from 'react';
import styled, { keyframes } from 'styled-components';
import { SlidersHorizontal, Search } from 'lucide-react';
import { PropertyFilters as Filters } from './homerank.types';

const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
};

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Sidebar = styled.aside`
  background: white;
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: ${GOLDEN_SPACING.lg};
  border: 1px solid rgba(2,6,23,0.06);
  height: fit-content;
  position: sticky;
  top: ${GOLDEN_SPACING.md};
  animation: ${slideInLeft} 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.sm};
  margin-bottom: ${GOLDEN_SPACING.lg};
  padding-bottom: ${GOLDEN_SPACING.md};
  border-bottom: 2px solid rgba(2,6,23,0.06);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

const SidebarIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
`;

const FilterGroup = styled.div`
  margin-bottom: ${GOLDEN_SPACING.md};
  animation: ${fadeInUp} 0.4s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(2) { animation-delay: 0.05s; }
  &:nth-child(3) { animation-delay: 0.1s; }
  &:nth-child(4) { animation-delay: 0.15s; }
  &:nth-child(5) { animation-delay: 0.2s; }
  &:nth-child(6) { animation-delay: 0.25s; }
  &:nth-child(7) { animation-delay: 0.3s; }
  &:nth-child(8) { animation-delay: 0.35s; }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: ${GOLDEN_SPACING.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem ${GOLDEN_SPACING.sm};
  border: 2px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #0f172a;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem ${GOLDEN_SPACING.sm};
  border: 2px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
`;

const RangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${GOLDEN_SPACING.sm};
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: ${GOLDEN_SPACING.sm} ${GOLDEN_SPACING.md};
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: ${GOLDEN_SPACING.md};
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.35);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 0.65rem ${GOLDEN_SPACING.sm};
  background: transparent;
  color: #64748b;
  border: 2px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${GOLDEN_SPACING.xs};
  
  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
    transform: translateY(-1px);
  }
`;

interface PropertyFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClear: () => void;
  availableStates: string[];
  availableCities: string[];
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFilterChange,
  onClear,
  availableStates,
  availableCities
}) => {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarIconWrapper>
          <SlidersHorizontal size={20} />
        </SidebarIconWrapper>
        <SidebarTitle>Filters</SidebarTitle>
      </SidebarHeader>

      {/* Natural Language Search */}
      <FilterGroup>
        <FilterLabel>🏡 Describe Your Dream Home</FilterLabel>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput
            type="text"
            placeholder="e.g., 3 bed house in Texas under 400k"
            value={filters.searchQuery || ''}
            onChange={(e) => handleChange('searchQuery', e.target.value)}
          />
        </SearchWrapper>
      </FilterGroup>

      {/* State Filter */}
      <FilterGroup>
        <FilterLabel>State</FilterLabel>
        <Select
          value={filters.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
        >
          <option value="">All States</option>
          {availableStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </Select>
      </FilterGroup>

      {/* City Filter */}
      {filters.state && (
        <FilterGroup>
          <FilterLabel>City</FilterLabel>
          <Select
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </Select>
        </FilterGroup>
      )}

      <FilterGroup>
        <FilterLabel>Price Range</FilterLabel>
        <RangeGroup>
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </RangeGroup>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Bedrooms</FilterLabel>
        <Select
          value={filters.bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </Select>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Bathrooms</FilterLabel>
        <Select
          value={filters.bathrooms}
          onChange={(e) => handleChange('bathrooms', e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </Select>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Min Square Feet</FilterLabel>
        <Input
          type="number"
          placeholder="e.g., 1500"
          value={filters.minSqft}
          onChange={(e) => handleChange('minSqft', e.target.value)}
        />
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Status</FilterLabel>
        <Select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </Select>
      </FilterGroup>

      <ApplyButton>Apply Filters</ApplyButton>
      <ClearButton onClick={onClear}>Clear All</ClearButton>
    </Sidebar>
  );
};