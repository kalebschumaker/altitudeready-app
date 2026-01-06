// Comprehensive city list for fast autocomplete suggestions - properly capitalized
export const popularCities = {
  // Colorado (Major ski/mountain towns)
  'Denver, CO': 5280,
  'Denver': 5280,
  'Colorado Springs, CO': 6035,
  'Colorado Springs': 6035,
  'Boulder, CO': 5430,
  'Boulder': 5430,
  'Aspen, CO': 7908,
  'Aspen': 7908,
  'Vail, CO': 8150,
  'Vail': 8150,
  'Breckenridge, CO': 9600,
  'Breckenridge': 9600,
  'Leadville, CO': 10152,
  'Leadville': 10152,
  'Telluride, CO': 8750,
  'Telluride': 8750,
  'Steamboat Springs, CO': 6732,
  'Steamboat Springs': 6732,
  'Crested Butte, CO': 8909,
  'Crested Butte': 8909,
  'Winter Park, CO': 9052,
  'Winter Park': 9052,
  'Keystone, CO': 9280,
  'Keystone': 9280,
  'Copper Mountain, CO': 9712,
  'Copper Mountain': 9712,
  'Durango, CO': 6512,
  'Durango': 6512,
  'Glenwood Springs, CO': 5761,
  'Glenwood Springs': 5761,
  'Estes Park, CO': 7522,
  'Estes Park': 7522,
  'Fort Collins, CO': 5003,
  'Fort Collins': 5003,
  'Pueblo, CO': 4692,
  'Pueblo': 4692,
  'Grand Junction, CO': 4586,
  'Grand Junction': 4586,
  
  // Utah
  'Salt Lake City, UT': 4226,
  'Salt Lake City': 4226,
  'Park City, UT': 7000,
  'Park City': 7000,
  'Provo, UT': 4551,
  'Provo': 4551,
  'Moab, UT': 4026,
  'Moab': 4026,
  'St. George, UT': 2880,
  'St. George': 2880,
  'Cedar City, UT': 5840,
  'Cedar City': 5840,
  'Ogden, UT': 4300,
  'Ogden': 4300,
  
  // Wyoming
  'Jackson, WY': 6237,
  'Jackson': 6237,
  'Cheyenne, WY': 6062,
  'Cheyenne': 6062,
  'Casper, WY': 5150,
  'Casper': 5150,
  'Laramie, WY': 7165,
  'Laramie': 7165,
  
  // California
  'Los Angeles, CA': 305,
  'Los Angeles': 305,
  'San Francisco, CA': 52,
  'San Francisco': 52,
  'San Diego, CA': 62,
  'San Diego': 62,
  'Sacramento, CA': 30,
  'Sacramento': 30,
  'Lake Tahoe, CA': 6225,
  'Lake Tahoe': 6225,
  'Mammoth Lakes, CA': 7880,
  'Mammoth Lakes': 7880,
  'Big Bear Lake, CA': 6752,
  'Big Bear Lake': 6752,
  'Fresno, CA': 328,
  'Fresno': 328,
  'San Jose, CA': 82,
  'San Jose': 82,
  'Oakland, CA': 43,
  'Oakland': 43,
  
  // New York
  'New York, NY': 33,
  'New York': 33,
  'NYC': 33,
  'Buffalo, NY': 600,
  'Buffalo': 600,
  'Rochester, NY': 505,
  'Rochester': 505,
  'Albany, NY': 150,
  'Albany': 150,
  
  // Major US Cities
  'Chicago, IL': 594,
  'Chicago': 594,
  'Houston, TX': 80,
  'Houston': 80,
  'Phoenix, AZ': 1086,
  'Phoenix': 1086,
  'Philadelphia, PA': 39,
  'Philadelphia': 39,
  'Seattle, WA': 175,
  'Seattle': 175,
  'Boston, MA': 141,
  'Boston': 141,
  'Atlanta, GA': 1050,
  'Atlanta': 1050,
  'Miami, FL': 6,
  'Miami': 6,
  'Dallas, TX': 430,
  'Dallas': 430,
  'Austin, TX': 489,
  'Austin': 489,
  'Portland, OR': 50,
  'Portland': 50,
  'Las Vegas, NV': 2001,
  'Las Vegas': 2001,
  'Minneapolis, MN': 830,
  'Minneapolis': 830,
  'Detroit, MI': 600,
  'Detroit': 600,
  'Nashville, TN': 597,
  'Nashville': 597,
  'Washington, DC': 410,
  'Washington': 410,
  'San Antonio, TX': 650,
  'San Antonio': 650,
  'Indianapolis, IN': 715,
  'Indianapolis': 715,
  'Charlotte, NC': 751,
  'Charlotte': 751,
  'Columbus, OH': 760,
  'Columbus': 760,
  'Milwaukee, WI': 580,
  'Milwaukee': 580,
  'Kansas City, MO': 910,
  'Kansas City': 910,
  'St. Louis, MO': 465,
  'St. Louis': 465,
  'Pittsburgh, PA': 1223,
  'Pittsburgh': 1223,
  'Cincinnati, OH': 482,
  'Cincinnati': 482,
  'Cleveland, OH': 653,
  'Cleveland': 653,
  'Omaha, NE': 1090,
  'Omaha': 1090,
  'New Orleans, LA': 7,
  'New Orleans': 7,
  'Tampa, FL': 48,
  'Tampa': 48,
  'Orlando, FL': 82,
  'Orlando': 82,
  
  // Arizona
  'Flagstaff, AZ': 6910,
  'Flagstaff': 6910,
  'Tucson, AZ': 2389,
  'Tucson': 2389,
  'Sedona, AZ': 4350,
  'Sedona': 4350,
  
  // New Mexico
  'Santa Fe, NM': 7199,
  'Santa Fe': 7199,
  'Albuquerque, NM': 5312,
  'Albuquerque': 5312,
  'Taos, NM': 6969,
  'Taos': 6969,
  
  // Nevada
  'Reno, NV': 4505,
  'Reno': 4505,
  
  // Idaho
  'Sun Valley, ID': 5920,
  'Sun Valley': 5920,
  'Boise, ID': 2730,
  'Boise': 2730,
  
  // Montana
  'Bozeman, MT': 4820,
  'Bozeman': 4820,
  'Missoula, MT': 3209,
  'Missoula': 3209,
  'Whitefish, MT': 3033,
  'Whitefish': 3033,
  'Billings, MT': 3123,
  'Billings': 3123,
  
  // Oregon
  'Bend, OR': 3623,
  'Bend': 3623,
  'Eugene, OR': 426,
  'Eugene': 426,
  
  // Washington
  'Spokane, WA': 1843,
  'Spokane': 1843,
  'Tacoma, WA': 243,
  'Tacoma': 243,
  
  // Vermont
  'Burlington, VT': 200,
  'Burlington': 200,
  'Stowe, VT': 723,
  'Stowe': 723,
  
  // New Hampshire
  'Manchester, NH': 266,
  'Manchester': 266,
  
  // Maine
  'Portland, ME': 61,
  'Bangor, ME': 159,
  'Bangor': 159,
  
  // North Carolina
  'Asheville, NC': 2134,
  'Asheville': 2134,
  'Raleigh, NC': 315,
  'Raleigh': 315,
  
  // Tennessee
  'Gatlinburg, TN': 1289,
  'Gatlinburg': 1289,
  'Knoxville, TN': 936,
  'Knoxville': 936,
  'Memphis, TN': 337,
  'Memphis': 337,
  
  // Virginia
  'Richmond, VA': 150,
  'Richmond': 150,
  'Virginia Beach, VA': 12,
  'Virginia Beach': 12
};

// Search popular cities for autocomplete - case insensitive search
export function searchCities(query) {
  if (!query || query.length < 2) return [];
  
  const normalized = query.toLowerCase();
  return Object.keys(popularCities)
    .filter(city => city.toLowerCase().includes(normalized))
    .slice(0, 10);
}

// Get elevation from popular cities list - case insensitive lookup
export function getCityElevation(cityName) {
  if (!cityName) return null;
  
  // First try exact match (preserving case)
  if (popularCities[cityName]) {
    return popularCities[cityName];
  }
  
  // Then try case-insensitive match
  const normalized = cityName.toLowerCase();
  const matchedKey = Object.keys(popularCities).find(
    key => key.toLowerCase() === normalized
  );
  
  return matchedKey ? popularCities[matchedKey] : null;
}

// NEW: Get elevation for ANY location using Open-Meteo API
export async function getElevationByName(locationName) {
  try {
    // Step 1: Geocode the location name to get lat/lng
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      return null;
    }
    
    const location = geocodeData.results[0];
    const { latitude, longitude, name, admin1 } = location;
    
    // Step 2: Get elevation for the lat/lng
    const elevationUrl = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
    const elevationResponse = await fetch(elevationUrl);
    const elevationData = await elevationResponse.json();
    
    if (!elevationData.elevation || elevationData.elevation.length === 0) {
      return null;
    }
    
    // Convert meters to feet
    const elevationMeters = elevationData.elevation[0];
    const elevationFeet = Math.round(elevationMeters * 3.28084);
    
    return {
      name: name,
      displayName: admin1 ? `${name}, ${admin1}` : name,
      elevation: elevationFeet,
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Error fetching elevation:', error);
    return null;
  }
}

// NEW: Search for locations with autocomplete
export async function searchLocationsAPI(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results) return [];
    
    return data.results.map(result => ({
      name: result.name,
      displayName: result.admin1 ? `${result.name}, ${result.admin1}` : result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}
