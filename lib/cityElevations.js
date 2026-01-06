// Real-time location search using Nominatim (OpenStreetMap)
export async function searchLocations(query) {
  if (!query || query.length < 3) return [];
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      addressdetails: '1',
      featuretype: 'city'
    });
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AltitudeReady/1.0'
      }
    });
    
    const data = await response.json();
    
    return data.map(result => {
      const addr = result.address || {};
      let displayName;
      
      // Format: "City, State" for US, "City, Country" for others
      if (addr.country_code === 'us') {
        const city = addr.city || addr.town || addr.village || result.name;
        const state = addr.state;
        displayName = state ? `${city}, ${getStateCode(state)}` : city;
      } else {
        const city = addr.city || addr.town || addr.village || result.name;
        const country = addr.country;
        displayName = `${city}, ${country}`;
      }
      
      return {
        displayName,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        fullName: result.display_name
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Get elevation using Open-Meteo API
export async function getElevation(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.elevation && data.elevation.length > 0) {
      // Convert meters to feet
      const meters = data.elevation[0];
      const feet = Math.round(meters * 3.28084);
      return feet;
    }
    
    return null;
  } catch (error) {
    console.error('Elevation error:', error);
    return null;
  }
}

// State name to abbreviation
function getStateCode(state) {
  const codes = {
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
  return codes[state] || state;
}
