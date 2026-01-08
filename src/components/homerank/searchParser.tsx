import { Property, PropertyFilters } from './homerank.types';

/**
 * Natural Language Search Parser
 * Parses user's natural language description and extracts filter criteria
 * Foundation for "Text-to-Home" feature
 */

interface ParsedQuery {
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  city?: string;
  keywords: string[];
}

// Common state abbreviations and full names
const STATE_MAP: Record<string, string> = {
  'tx': 'Texas',
  'texas': 'Texas',
  'ca': 'California',
  'california': 'California',
  'fl': 'Florida',
  'florida': 'Florida',
  'ny': 'New York',
  'new york': 'New York',
  'az': 'Arizona',
  'arizona': 'Arizona',
  'nv': 'Nevada',
  'nevada': 'Nevada',
  'wa': 'Washington',
  'washington': 'Washington',
  'co': 'Colorado',
  'colorado': 'Colorado',
  'ga': 'Georgia',
  'georgia': 'Georgia',
  'nc': 'North Carolina',
  'north carolina': 'North Carolina',
  'pr': 'Puerto Rico',
  'puerto rico': 'Puerto Rico',
};

/**
 * Parse natural language query into structured filters
 */
export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  const parsed: ParsedQuery = { keywords: [] };

  // Extract bedrooms
  const bedroomPatterns = [
    /(\d+)\s*(?:bed|bedroom|br|bd)/i,
    /(\d+)bd/i,
    /(\d+)br/i
  ];
  for (const pattern of bedroomPatterns) {
    const match = lower.match(pattern);
    if (match) {
      parsed.bedrooms = parseInt(match[1]);
      break;
    }
  }

  // Extract bathrooms
  const bathroomPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:bath|bathroom|ba)/i,
    /(\d+(?:\.\d+)?)ba/i
  ];
  for (const pattern of bathroomPatterns) {
    const match = lower.match(pattern);
    if (match) {
      parsed.bathrooms = parseFloat(match[1]);
      break;
    }
  }

  // Extract price
  const pricePatterns = [
    /under\s*\$?(\d+)k/i,
    /below\s*\$?(\d+)k/i,
    /less than\s*\$?(\d+)k/i,
    /\$(\d+)k\s*(?:or less|max|maximum)/i,
    /max\s*\$?(\d+)k/i,
    /\$(\d+),?(\d{3})/i,
  ];
  for (const pattern of pricePatterns) {
    const match = lower.match(pattern);
    if (match) {
      if (match[2]) {
        // Full price like $400,000
        parsed.maxPrice = parseInt(match[1] + match[2]);
      } else {
        // Price in thousands like 400k
        parsed.maxPrice = parseInt(match[1]) * 1000;
      }
      break;
    }
  }

  // Extract minimum price
  const minPricePatterns = [
    /over\s*\$?(\d+)k/i,
    /above\s*\$?(\d+)k/i,
    /more than\s*\$?(\d+)k/i,
    /min\s*\$?(\d+)k/i,
  ];
  for (const pattern of minPricePatterns) {
    const match = lower.match(pattern);
    if (match) {
      parsed.minPrice = parseInt(match[1]) * 1000;
      break;
    }
  }

  // Extract state
  for (const [key, value] of Object.entries(STATE_MAP)) {
    const pattern = new RegExp(`\\b${key}\\b`, 'i');
    if (pattern.test(lower)) {
      parsed.state = value;
      break;
    }
  }

  // Extract keywords for features
  const featureKeywords = [
    'pool', 'garage', 'yard', 'garden', 'basement', 'deck', 
    'patio', 'balcony', 'fireplace', 'modern', 'luxury',
    'renovated', 'new', 'updated', 'spacious', 'cozy'
  ];
  
  for (const keyword of featureKeywords) {
    if (lower.includes(keyword)) {
      parsed.keywords.push(keyword);
    }
  }

  return parsed;
}

/**
 * Apply parsed query to filters
 */
export function applyParsedQuery(
  currentFilters: PropertyFilters,
  parsedQuery: ParsedQuery
): PropertyFilters {
  const newFilters: PropertyFilters = { ...currentFilters };

  if (parsedQuery.bedrooms !== undefined) {
    newFilters.bedrooms = parsedQuery.bedrooms.toString();
  }

  if (parsedQuery.bathrooms !== undefined) {
    newFilters.bathrooms = Math.floor(parsedQuery.bathrooms).toString();
  }

  if (parsedQuery.minPrice !== undefined) {
    newFilters.minPrice = parsedQuery.minPrice.toString();
  }

  if (parsedQuery.maxPrice !== undefined) {
    newFilters.maxPrice = parsedQuery.maxPrice.toString();
  }

  if (parsedQuery.state) {
    newFilters.state = parsedQuery.state;
  }

  if (parsedQuery.city) {
    newFilters.city = parsedQuery.city;
  }

  return newFilters;
}

/**
 * Score properties based on how well they match the search query
 * Higher score = better match
 */
export function scorePropertyMatch(property: Property, query: string): number {
  const parsed = parseNaturalLanguageQuery(query);
  let score = 100;

  // Exact bedroom match gets bonus
  if (parsed.bedrooms !== undefined) {
    if (property.bedrooms === parsed.bedrooms) {
      score += 50;
    } else if (Math.abs(property.bedrooms - parsed.bedrooms) === 1) {
      score += 20;
    } else {
      score -= 30;
    }
  }

  // Exact bathroom match gets bonus
  if (parsed.bathrooms !== undefined) {
    if (property.bathrooms === parsed.bathrooms) {
      score += 30;
    } else if (Math.abs(property.bathrooms - parsed.bathrooms) <= 0.5) {
      score += 10;
    } else {
      score -= 20;
    }
  }

  // Price match
  if (parsed.maxPrice !== undefined) {
    if (property.price <= parsed.maxPrice) {
      score += 40;
      // Bonus for being well under budget
      if (property.price <= parsed.maxPrice * 0.9) {
        score += 20;
      }
    } else {
      score -= 50;
    }
  }

  if (parsed.minPrice !== undefined) {
    if (property.price >= parsed.minPrice) {
      score += 30;
    } else {
      score -= 40;
    }
  }

  // State match
  if (parsed.state && property.state === parsed.state) {
    score += 60;
  }

  // City match
  if (parsed.city && property.city.toLowerCase() === parsed.city.toLowerCase()) {
    score += 80;
  }

  // Keyword bonus (for future expansion with property descriptions)
  for (const keyword of parsed.keywords) {
    const addressMatch = property.address.toLowerCase().includes(keyword);
    const cityMatch = property.city.toLowerCase().includes(keyword);
    if (addressMatch || cityMatch) {
      score += 10;
    }
  }

  return score;
}

/**
 * Sort properties by relevance to search query
 */
export function sortByRelevance(properties: Property[], query: string): Property[] {
  if (!query.trim()) {
    return properties;
  }

  const scored = properties.map(property => ({
    property,
    score: scorePropertyMatch(property, query)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map(item => item.property);
}

/**
 * Generate helpful search suggestions based on available properties
 */
export function generateSearchSuggestions(properties: Property[]): string[] {
  const suggestions: string[] = [];

  // Get common bedroom counts
  const bedroomCounts = [...new Set(properties.map(p => p.bedrooms))].sort();
  if (bedroomCounts.length > 0) {
    suggestions.push(`${bedroomCounts[0]} bedroom home under $300k`);
  }

  // Get states with most properties
  const stateCounts = properties.reduce((acc, p) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([state]) => state);

  if (topStates.length > 0) {
    suggestions.push(`3 bed 2 bath in ${topStates[0]}`);
  }

  // Average price suggestion
  const avgPrice = Math.round(
    properties.reduce((sum, p) => sum + p.price, 0) / properties.length
  );
  const avgPriceK = Math.round(avgPrice / 1000);
  suggestions.push(`house under ${avgPriceK}k with pool`);

  return suggestions;
}