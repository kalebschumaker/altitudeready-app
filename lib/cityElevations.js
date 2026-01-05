// Common US cities and their elevations (in feet)
export const cityElevations = {
  // Colorado
  'denver, co': 5280,
  'denver': 5280,
  'colorado springs, co': 6035,
  'colorado springs': 6035,
  'boulder, co': 5430,
  'boulder': 5430,
  'aspen, co': 7908,
  'aspen': 7908,
  'vail, co': 8150,
  'vail': 8150,
  'breckenridge, co': 9600,
  'breckenridge': 9600,
  'leadville, co': 10152,
  'leadville': 10152,
  
  // California
  'los angeles, ca': 305,
  'los angeles': 305,
  'san francisco, ca': 52,
  'san francisco': 52,
  'san diego, ca': 62,
  'san diego': 62,
  'sacramento, ca': 30,
  'sacramento': 30,
  'lake tahoe, ca': 6225,
  'lake tahoe': 6225,
  
  // New York
  'new york, ny': 33,
  'new york': 33,
  'nyc': 33,
  'buffalo, ny': 600,
  'buffalo': 600,
  
  // Other major cities
  'chicago, il': 594,
  'chicago': 594,
  'houston, tx': 80,
  'houston': 80,
  'phoenix, az': 1086,
  'phoenix': 1086,
  'philadelphia, pa': 39,
  'philadelphia': 39,
  'seattle, wa': 175,
  'seattle': 175,
  'boston, ma': 141,
  'boston': 141,
  'atlanta, ga': 1050,
  'atlanta': 1050,
  'miami, fl': 6,
  'miami': 6,
  'dallas, tx': 430,
  'dallas': 430,
  'austin, tx': 489,
  'austin': 489,
  'portland, or': 50,
  'portland': 50,
  'las vegas, nv': 2001,
  'las vegas': 2001,
  'salt lake city, ut': 4226,
  'salt lake city': 4226,
  'minneapolis, mn': 830,
  'minneapolis': 830,
  'detroit, mi': 600,
  'detroit': 600,
  'nashville, tn': 597,
  'nashville': 597,
  
  // Mountain towns
  'jackson, wy': 6237,
  'jackson': 6237,
  'park city, ut': 7000,
  'park city': 7000,
  'sun valley, id': 5920,
  'sun valley': 5920,
  'telluride, co': 8750,
  'telluride': 8750,
  'mammoth lakes, ca': 7880,
  'mammoth lakes': 7880,
  'flagstaff, az': 6910,
  'flagstaff': 6910,
  'santa fe, nm': 7199,
  'santa fe': 7199,
  'reno, nv': 4505,
  'reno': 4505
};

export function getCityElevation(cityName) {
  if (!cityName) return null;
  
  const normalized = cityName.toLowerCase().trim();
  return cityElevations[normalized] || null;
}

export function searchCities(query) {
  if (!query || query.length < 2) return [];
  
  const normalized = query.toLowerCase();
  return Object.keys(cityElevations)
    .filter(city => city.includes(normalized))
    .slice(0, 10);
}
