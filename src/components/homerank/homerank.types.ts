// Shared types for HomeRank application

export interface PriceHistory {
  date: string;
  price: number;
  type: 'historical' | 'current' | 'projected';
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lat: number;
  lng: number;
  imageUrl: string;
  listingDate: string;
  status: 'active' | 'pending' | 'sold';
  score?: number;
  yearBuilt?: number;
  lotSize?: number;
  priceHistory: PriceHistory[];
  appreciation: number;
  marketTrend: 'up' | 'down' | 'stable';
  brokeredBy: string;
  prevSoldDate?: string;
}

export interface PropertyFilters {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minSqft: string;
  status: string;
  state?: string;
  city?: string;
  searchQuery?: string; // For text-to-home natural language search
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapState {
  zoom: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
}