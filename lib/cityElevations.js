// Keep a small list of popular cities for instant suggestions
export const popularCities = {
  'Denver, CO': 5280,
  'Denver': 5280,
  'Aspen, CO': 7908,
  'Aspen': 7908,
  'Vail, CO': 8150,
  'Leadville, CO': 10152,
  'Breckenridge, CO': 9600,
  'Park City, UT': 7000,
  'Salt Lake City, UT': 4226,
  'Jackson, WY': 6237,
  'Los Angeles, CA': 305,
  'San Francisco, CA': 52,
  'New York, NY': 33,
  'Chicago, IL': 594,
  'Seattle, WA': 175,
  'Boston, MA': 141,
  'Miami, FL': 6,
  'Phoenix, AZ': 1086,
  'Atlanta, GA': 1050,
  'Las Vegas, NV': 2001
};

// Search using Nominatim (OpenStreetMap) geocoding API
export async function searchLocations(query) {
  if (!query || query.length < 3) return [];
  
  try {
    // Use Nominatim for location search (free, no API key needed)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AltitudeReady-App' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) return [];
    
    // Format results
    const results = data.map(result => {
      const address = result.address || {};
      let displayName = result.name || result.display_name;
      
      // Create a cleaner display name
      if (address.city || address.town || address.village) {
        const locality = address.city || address.town || address.village;
        const state = address.state;
        const country = address.country;
        
        if (state && country === 'United States') {
          // For US: "Denver, CO"
          const stateAbbr = getStateAbbreviation(state);
          displayName = `${locality}, ${stateAbbr}`;
        } else if (state) {
          // For other countries: "Toronto, Ontario"
          displayName = `${locality}, ${state}`;
        } else {
          // Just city and country: "Paris, France"
          displayName = `${locality}, ${country}`;
        }
      }
      
      return {
        name: result.name || result.display_name,
        displayName: displayName,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        fullAddress: result.display_name
      };
    });
    
    return results;
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

// Get elevation using OpenTopoData
export async function getElevation(latitude, longitude) {
  try {
    // OpenTopoData endpoint (uses SRTM 90m dataset - good worldwide coverage)
    const url = `https://api.opentopodata.org/v1/srtm90m?locations=${latitude},${longitude}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OpenTopoData API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    // Convert meters to feet
    const elevationMeters = data.results[0].elevation;
    if (elevationMeters === null) {
      return null;
    }
    
    const elevationFeet = Math.round(elevationMeters * 3.28084);
    return elevationFeet;
  } catch (error) {
    console.error('Error fetching elevation:', error);
    return null;
  }
}

// Helper function to convert state names to abbreviations
function getStateAbbreviation(stateName) {
  const states = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };
  
  return states[stateName] || stateName;
}

// Fallback: Get popular cities for instant autocomplete
export function getPopularCitySuggestions(query) {
  if (!query || query.length < 2) return [];
  
  const normalized = query.toLowerCase();
  return Object.keys(popularCities)
    .filter(city => city.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map(city => ({
      name: city,
      displayName: city,
      elevation: popularCities[city],
      isPopular: true
    }));
}

// Check if a location is in our popular cities list
export function getPopularCityElevation(cityName) {
  if (!cityName) return null;
  
  // Try exact match first
  if (popularCities[cityName]) {
    return popularCities[cityName];
  }
  
  // Try case-insensitive match
  const normalized = cityName.toLowerCase();
  const matchedKey = Object.keys(popularCities).find(
    key => key.toLowerCase() === normalized
  );
  
  return matchedKey ? popularCities[matchedKey] : null;
}
