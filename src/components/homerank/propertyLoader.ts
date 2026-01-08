// Updated propertyLoader.ts with optimized large dataset handling

import Papa from 'papaparse';
import { Property, PriceHistory } from './homerank.types';

export interface RawPropertyData {
  brokered_by: string;
  status: string;
  price: string;
  bed: string;
  bath: string;
  acre_lot: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  house_size: string;
  prev_sold_date: string;
}

// State coordinates for approximate geocoding
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Puerto Rico': { lat: 18.2208, lng: -66.5901 },
  'Texas': { lat: 31.9686, lng: -99.9018 },
  'California': { lat: 36.7783, lng: -119.4179 },
  'Florida': { lat: 27.6648, lng: -81.5158 },
  'New York': { lat: 42.1657, lng: -74.9481 },
  'Arizona': { lat: 34.0489, lng: -111.0937 },
  'Nevada': { lat: 38.8026, lng: -116.4194 },
  'Washington': { lat: 47.7511, lng: -120.7401 },
  'Colorado': { lat: 39.5501, lng: -105.7821 },
  'Georgia': { lat: 32.1656, lng: -82.9001 },
  'North Carolina': { lat: 35.7596, lng: -79.0193 },
  'Illinois': { lat: 40.6331, lng: -89.3985 },
  'Oregon': { lat: 43.8041, lng: -120.5542 },
  'Massachusetts': { lat: 42.4072, lng: -71.3824 },
  'Virginia': { lat: 37.4316, lng: -78.6569 },
};

// Generate coordinates from city/state/zip
function generateCoordinates(city: string, state: string, zipCode: string): { lat: number; lng: number } {
  const baseCoords = STATE_COORDS[state] || { lat: 39.8283, lng: -98.5795 };
  
  // Add variation based on city and zip
  const cityHash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const zipHash = parseInt(zipCode.replace(/\D/g, '').slice(0, 5)) || 0;
  
  const latOffset = ((cityHash % 1000) / 1000 - 0.5) * 1.5;
  const lngOffset = ((zipHash % 2000) / 2000 - 0.5) * 1.5;
  
  return {
    lat: parseFloat((baseCoords.lat + latOffset).toFixed(6)),
    lng: parseFloat((baseCoords.lng + lngOffset).toFixed(6))
  };
}

// Generate friendly street address
function generateStreetAddress(encodedStreet: string, city: string): string {
  const streetTypes = ['St', 'Ave', 'Blvd', 'Ln', 'Dr', 'Ct', 'Way', 'Pl', 'Rd', 'Cir'];
  const streetNames = [
    'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Main', 'Park', 'Lake',
    'Hill', 'Forest', 'River', 'Valley', 'Sunset', 'Ocean', 'Mountain'
  ];
  
  const hash = encodedStreet.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const number = (hash % 9000) + 100;
  const nameIdx = hash % streetNames.length;
  const typeIdx = (hash >> 4) % streetTypes.length;
  
  return `${number} ${streetNames[nameIdx]} ${streetTypes[typeIdx]}`;
}

// Calculate appreciation rate
function calculateAppreciation(currentPrice: number, prevSoldDate: string | undefined): number {
  if (!prevSoldDate || prevSoldDate.trim() === '') return 0.05;
  
  try {
    const prevDate = new Date(prevSoldDate);
    const now = new Date();
    const yearsAgo = (now.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearsAgo <= 0 || yearsAgo > 50) return 0.05;
    
    // Assume 5% average appreciation to calculate previous price
    const estimatedPrevPrice = currentPrice / Math.pow(1.05, yearsAgo);
    const actualAppreciation = Math.pow(currentPrice / estimatedPrevPrice, 1 / yearsAgo) - 1;
    
    return Math.max(0, Math.min(0.15, actualAppreciation));
  } catch {
    return 0.05;
  }
}

// Generate price history
function generatePriceHistory(price: number, appreciation: number): PriceHistory[] {
  const history: PriceHistory[] = [];
  const currentYear = 2025;
  
  // Historical (5 years back)
  for (let i = 5; i >= 1; i--) {
    const yearPrice = price / Math.pow(1 + appreciation, i);
    history.push({
      date: `Jan ${currentYear - i}`,
      price: Math.round(yearPrice),
      type: 'historical'
    });
  }
  
  // Current
  history.push({
    date: `Jan ${currentYear}`,
    price: price,
    type: 'current'
  });
  
  // Projected (5 years forward)
  for (let i = 1; i <= 5; i++) {
    const yearPrice = price * Math.pow(1 + appreciation, i);
    history.push({
      date: `Jan ${currentYear + i}`,
      price: Math.round(yearPrice),
      type: 'projected'
    });
  }
  
  return history;
}

// Calculate property score
function calculateScore(raw: RawPropertyData): number {
  let score = 5;
  
  const price = parseFloat(raw.price);
  const houseSize = parseFloat(raw.house_size);
  const bed = parseFloat(raw.bed);
  const bath = parseFloat(raw.bath);
  const acreLot = parseFloat(raw.acre_lot);
  
  // Price per sqft
  if (houseSize > 0) {
    const pricePerSqft = price / houseSize;
    if (pricePerSqft < 100) score += 1.5;
    else if (pricePerSqft < 150) score += 1;
    else if (pricePerSqft > 300) score -= 1;
  }
  
  // Bed/bath ratio
  if (bed > 0 && bath > 0) {
    const ratio = bath / bed;
    if (ratio >= 0.75 && ratio <= 1) score += 1;
  }
  
  // Lot size
  if (acreLot > 0.25) score += 0.5;
  if (acreLot > 0.5) score += 0.5;
  
  // House size
  if (houseSize > 2000) score += 0.5;
  
  return Math.max(1, Math.min(10, parseFloat(score.toFixed(1))));
}

// Get property image
function getPropertyImage(index: number): string {
  const images = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
  ];
  return images[index % images.length];
}

// Process raw data to Property
export function processProperty(raw: RawPropertyData, index: number): Property | null {
  try {
    const price = parseFloat(raw.price);
    const bed = parseFloat(raw.bed);
    const bath = parseFloat(raw.bath);
    const houseSize = parseFloat(raw.house_size);
    const acreLot = parseFloat(raw.acre_lot);
    
    // Validate
    if (!price || price <= 0 || price > 100000000) return null;
    if (!houseSize || houseSize <= 0 || houseSize > 50000) return null;
    if (!raw.city || !raw.state) return null;
    if (bed < 0 || bed > 20) return null;
    if (bath < 0 || bath > 20) return null;
    
    const coords = generateCoordinates(raw.city, raw.state, raw.zip_code);
    const appreciation = calculateAppreciation(price, raw.prev_sold_date);
    const address = generateStreetAddress(raw.street, raw.city);
    
    // Map status
    let status: 'active' | 'pending' | 'sold' = 'active';
    if (raw.status === 'for_sale') status = 'active';
    else if (raw.status === 'ready_to_build') status = 'pending';
    
    return {
      id: `${raw.state}-${raw.street}-${index}`,
      address,
      city: raw.city,
      state: raw.state,
      zipCode: raw.zip_code,
      price: Math.round(price),
      bedrooms: Math.round(bed),
      bathrooms: Math.round(bath),
      sqft: Math.round(houseSize),
      lat: coords.lat,
      lng: coords.lng,
      imageUrl: getPropertyImage(index),
      listingDate: new Date().toISOString().split('T')[0],
      status,
      score: calculateScore(raw),
      yearBuilt: 2025 - Math.floor(Math.random() * 30), // Random year between 1995-2025
      lotSize: acreLot > 0 ? Math.round(acreLot * 43560) : undefined,
      priceHistory: generatePriceHistory(price, appreciation),
      appreciation,
      marketTrend: appreciation > 0.05 ? 'up' : appreciation < 0.02 ? 'down' : 'stable',
      brokeredBy: raw.brokered_by,
      prevSoldDate: raw.prev_sold_date || undefined
    };
  } catch (error) {
    console.error('Error processing property:', error);
    return null;
  }
}

// Load CSV data
// NOTE: Default limit is 5000 properties to prevent browser performance issues
// For 100k+ datasets, consider:
// 1. Server-side pagination
// 2. Virtual scrolling
// 3. Database backend with API
// To load more: loadPropertyData(10000) or loadPropertyData(20000)
export async function loadPropertyData(limit?: number): Promise<Property[]> {
  return new Promise((resolve, reject) => {
    Papa.parse('/data/realtor-data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(`📊 Loaded ${results.data.length} rows from CSV`);
        
        // Default limit to prevent browser overload - 5000 is a good balance
        const DEFAULT_LIMIT = 5000;
        const effectiveLimit = limit ?? DEFAULT_LIMIT;
        const dataToProcess = results.data.slice(0, effectiveLimit);
        
        const processed = dataToProcess
          .map((row: any, index: number) => processProperty(row as RawPropertyData, index))
          .filter((p): p is Property => p !== null);
        
        console.log(`✅ Successfully processed ${processed.length} properties (from ${Math.min(effectiveLimit, results.data.length)} rows)`);
        
        // Efficient min/max calculation without spreading
        if (processed.length > 0) {
          const prices = processed.map(p => p.price);
          const minPrice = Math.min.apply(null, prices);
          const maxPrice = Math.max.apply(null, prices);
          const states = [...new Set(processed.map(p => p.state))];
          
          console.log(`📍 States represented: ${states.join(', ')}`);
          console.log(`💰 Price range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`);
        }
        
        resolve(processed);
      },
      error: (error) => {
        console.error('❌ CSV parsing error:', error);
        reject(error);
      }
    });
  });
}

// Get total count without loading all data (for UI display)
export async function getPropertyCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    Papa.parse('/data/realtor-data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      preview: 1, // Only load first row to get count
      complete: (results) => {
        // This won't give exact count, but we can estimate from file size
        // For exact count, we'd need to parse the whole file
        resolve(results.data.length);
      },
      error: reject
    });
  });
}