'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, DollarSign, Bed, Bath, Maximize, 
  TrendingUp, Home, Target, BarChart3, 
  Info, Heart, Sparkles
} from 'lucide-react';
import { loadPropertyData } from '../../components/homerank/propertyLoader';
import { Property, PropertyFilters as Filters } from '../../components/homerank/homerank.types';
import { PropertyMap } from '../../components/homerank/propertyMap';
import { PropertyFilters } from '../../components/homerank/propertyFilters';
import { PropertyModal } from '../../components/homerank/propertyModal';
import { SearchBar } from '../../components/homerank/searchbar';
import { parseNaturalLanguageQuery, applyParsedQuery, sortByRelevance } from '../../components/homerank/searchParser';
import {
  Page, 
  PropertyActions, 
  PropertyFeatures, 
  Feature,
  PropertyAddress,
  PropertyBadge,
  PropertyCard,
  PropertyGrid,
  PropertyImage,
  PropertyInfo,
  PropertyPrice,
  ResultCount,
  SectionHeader,
  SectionTitleMain,
  ListingsSection, 
  StatCard, 
  StatContent, 
  StatIcon,
  StatLabel,
  StatValue,
  StatsBar,
  MainContent,
  Container,
  ErrorContainer,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  Hero,
  HeroInner,
  HeroIconWrapper,
  HeroText,
  HeroTitle,
  HeroSubtitle,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
  BackgroundPattern,
  FloatingOrb,
  ActionButton,
} from '../../components/homerank/homerank.styles';

export default function HomeRankPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    minSqft: '',
    status: 'all',
    searchQuery: ''
  });

  // Load property data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadPropertyData(); // Loads default limit (5000)
        setProperties(data);
      } catch (err) {
        console.error('Failed to load property data:', err);
        setError('Failed to load property data. Please check that the CSV file is in the public/data directory.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply natural language search when query changes
  useEffect(() => {
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const parsed = parseNaturalLanguageQuery(filters.searchQuery);
      const newFilters = applyParsedQuery(filters, parsed);
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters);
      }
    }
  }, [filters.searchQuery]);

  // Get available states and cities for filters
  const { availableStates, availableCities } = useMemo(() => {
    const states = [...new Set(properties.map(p => p.state))].sort();
    const cities = filters.state
      ? [...new Set(properties.filter(p => p.state === filters.state).map(p => p.city))].sort()
      : [];
    
    return { availableStates: states, availableCities: cities };
  }, [properties, filters.state]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(prop => {
      if (filters.minPrice && prop.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && prop.price > Number(filters.maxPrice)) return false;
      if (filters.bedrooms && prop.bedrooms < Number(filters.bedrooms)) return false;
      if (filters.bathrooms && prop.bathrooms < Number(filters.bathrooms)) return false;
      if (filters.minSqft && prop.sqft < Number(filters.minSqft)) return false;
      if (filters.status !== 'all' && prop.status !== filters.status) return false;
      if (filters.state && prop.state !== filters.state) return false;
      if (filters.city && prop.city !== filters.city) return false;
      return true;
    });

    // Sort by relevance if there's a search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      filtered = sortByRelevance(filtered, filters.searchQuery);
    }

    return filtered;
  }, [properties, filters]);

  const avgPrice = filteredProperties.length > 0
    ? Math.round(filteredProperties.reduce((sum, p) => sum + p.price, 0) / filteredProperties.length)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minSqft: '',
      status: 'all',
      searchQuery: ''
    });
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, searchQuery: query });
  };

  // Show loading state
  if (loading) {
    return (
      <Page>
        <BackgroundPattern />
        <FloatingOrb $delay={0} $size={300} $top="10%" $left="5%" $color="#667eea" />
        <FloatingOrb $delay={2} $size={250} $top="60%" $left="80%" $color="#f472b6" />
        
        <Hero>
          <HeroInner>
            <HeroIconWrapper>
              <Home size={40} />
            </HeroIconWrapper>
            <HeroText>
              <HeroTitle>
                Home <span>Rank</span>
              </HeroTitle>
              <HeroSubtitle>
                Smart property analysis powered by data-driven insights
              </HeroSubtitle>
            </HeroText>
          </HeroInner>
        </Hero>

        <LoadingContainer>
          <LoadingSpinner size={48} />
          <LoadingText>Loading property data...</LoadingText>
        </LoadingContainer>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page>
        <BackgroundPattern />
        <Hero>
          <HeroInner>
            <HeroIconWrapper>
              <Home size={40} />
            </HeroIconWrapper>
            <HeroText>
              <HeroTitle>
                Home <span>Rank</span>
              </HeroTitle>
            </HeroText>
          </HeroInner>
        </Hero>

        <Container style={{ gridTemplateColumns: '1fr' }}>
          <ErrorContainer>{error}</ErrorContainer>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <BackgroundPattern />
      <FloatingOrb $delay={0} $size={300} $top="10%" $left="5%" $color="#667eea" />
      <FloatingOrb $delay={2} $size={250} $top="60%" $left="80%" $color="#f472b6" />
      <FloatingOrb $delay={1} $size={200} $top="40%" $left="90%" $color="#60a5fa" />
      
      <Hero>
        <HeroInner>
          <HeroIconWrapper>
            <Sparkles size={40} />
          </HeroIconWrapper>
          <HeroText>
            <HeroTitle>
              Home <span>Rank</span>
            </HeroTitle>
            <HeroSubtitle>
              Describe your dream home in plain English and let AI find your perfect match
            </HeroSubtitle>
            <HeroStats>
              <HeroStat>
                <HeroStatValue>{properties.length.toLocaleString()}+</HeroStatValue>
                <HeroStatLabel>Properties</HeroStatLabel>
              </HeroStat>
              <HeroStat>
                <HeroStatValue>{formatPrice(avgPrice)}</HeroStatValue>
                <HeroStatLabel>Avg Value</HeroStatLabel>
              </HeroStat>
              <HeroStat>
                <HeroStatValue>{availableStates.length}</HeroStatValue>
                <HeroStatLabel>States</HeroStatLabel>
              </HeroStat>
            </HeroStats>
          </HeroText>
        </HeroInner>
      </Hero>

      {/* Main Search Bar */}
      <div style={{ padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        <SearchBar
          value={filters.searchQuery || ''}
          onChange={(value) => setFilters({ ...filters, searchQuery: value })}
          onSearch={handleSearch}
        />
      </div>

      <Container>
        <PropertyFilters
          filters={filters}
          onFilterChange={setFilters}
          onClear={clearFilters}
          availableStates={availableStates}
          availableCities={availableCities}
        />

        <MainContent>
          <PropertyMap
            properties={filteredProperties}
            activeProperty={activeProperty}
            onPropertyHover={setActiveProperty}
            onPropertyClick={setSelectedProperty}
          />

          <StatsBar>
            <StatCard>
              <StatIcon $color="#667eea">
                <Target size={28} />
              </StatIcon>
              <StatContent>
                <StatLabel>Filtered Results</StatLabel>
                <StatValue>{filteredProperties.length}</StatValue>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon $color="#10b981">
                <DollarSign size={28} />
              </StatIcon>
              <StatContent>
                <StatLabel>Average Price</StatLabel>
                <StatValue>{formatPrice(avgPrice)}</StatValue>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon $color="#f59e0b">
                <BarChart3 size={28} />
              </StatIcon>
              <StatContent>
                <StatLabel>Average Score</StatLabel>
                <StatValue>
                  {filteredProperties.length > 0
                    ? (filteredProperties.reduce((sum, p) => sum + (p.score || 0), 0) / filteredProperties.length).toFixed(1)
                    : '0.0'
                  }
                </StatValue>
              </StatContent>
            </StatCard>
          </StatsBar>

          <ListingsSection>
            <SectionHeader>
              <SectionTitleMain>
                {filters.searchQuery ? 'Best Matches' : 'Available Properties'}
              </SectionTitleMain>
              <ResultCount>{filteredProperties.length} results</ResultCount>
            </SectionHeader>

            <PropertyGrid>
              {filteredProperties.slice(0, 50).map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  style={{ '--index': idx + 1 } as React.CSSProperties}
                  $active={activeProperty === property.id}
                  onMouseEnter={() => setActiveProperty(property.id)}
                  onMouseLeave={() => setActiveProperty(null)}
                  onClick={() => setSelectedProperty(property)}
                >
                  <PropertyImage $url={property.imageUrl}>
                    <PropertyBadge $status={property.status}>
                      {property.status}
                    </PropertyBadge>
                  </PropertyImage>

                  <PropertyInfo>
                    <PropertyPrice>{formatPrice(property.price)}</PropertyPrice>
                    <PropertyAddress>
                      <MapPin size={16} />
                      {property.address}, {property.city}, {property.state}
                    </PropertyAddress>

                    <PropertyFeatures>
                      <Feature>
                        <Bed size={18} />
                        {property.bedrooms} bd
                      </Feature>
                      <Feature>
                        <Bath size={18} />
                        {property.bathrooms} ba
                      </Feature>
                      <Feature>
                        <Maximize size={18} />
                        {property.sqft.toLocaleString()} sqft
                      </Feature>
                    </PropertyFeatures>
                  </PropertyInfo>
                  
                  <PropertyActions>
                    <ActionButton 
                      $variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(property);
                      }}
                    >
                      <Info size={16} />
                      Details
                    </ActionButton>
                    <ActionButton $variant="secondary">
                      <Heart size={16} />
                      Save
                    </ActionButton>
                  </PropertyActions>
                </PropertyCard>
              ))}
            </PropertyGrid>
          </ListingsSection>
        </MainContent>
      </Container>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </Page>
  );
}