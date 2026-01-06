import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { getUserProfile } from '../lib/api';
import { searchLocations, getElevation } from '../lib/cityElevations';
import GoogleAd from '../components/GoogleAd';

export default function Calculator() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [homeLocation, setHomeLocation] = useState('');
  const [homeAlt, setHomeAlt] = useState('');
  const [homeSuggestions, setHomeSuggestions] = useState([]);
  const [homeLoading, setHomeLoading] = useState(false);
  const [destLocation, setDestLocation] = useState('');
  const [destAlt, setDestAlt] = useState('');
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [destLoading, setDestLoading] = useState(false);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [fitnessLevel, setFitnessLevel] = useState('average');
  const [result, setResult] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const homeTimerRef = useRef(null);
  const destTimerRef = useRef(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const session = await fetchAuthSession();
      const userId = session.tokens?.idToken?.payload?.sub;
      
      if (userId) {
        const profileResponse = await getUserProfile(userId);
        if (profileResponse.success && profileResponse.data) {
          setUserProfile(profileResponse.data);
          if (profileResponse.data.homeCity) {
            setHomeLocation(profileResponse.data.homeCity);
            setHomeAlt(profileResponse.data.homeAltitude?.toString() || '');
          }
        }
      }
    } catch (err) {
      setUser(null);
    }
  };

  const handleHomeLocationChange = (value) => {
    setHomeLocation(value);
    
    if (homeTimerRef.current) {
      clearTimeout(homeTimerRef.current);
    }
    
    if (value.length < 3) {
      setHomeSuggestions([]);
      return;
    }
    
    setHomeLoading(true);
    
    homeTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      setHomeSuggestions(results.slice(0, 3));
      setHomeLoading(false);
    }, 400);
  };

  const handleHomeLocationSelect = async (location) => {
    setHomeLocation(location.displayName);
    setHomeSuggestions([]);
    setHomeLoading(true);
    
    const elevation = await getElevation(location.lat, location.lon);
    if (elevation) {
      setHomeAlt(elevation.toString());
    }
    setHomeLoading(false);
  };

  const handleDestLocationChange = (value) => {
    setDestLocation(value);
    
    if (destTimerRef.current) {
      clearTimeout(destTimerRef.current);
    }
    
    if (value.length < 3) {
      setDestSuggestions([]);
      return;
    }
    
    setDestLoading(true);
    
    destTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      setDestSuggestions(results.slice(0, 3));
      setDestLoading(false);
    }, 400);
  };

  const handleDestLocationSelect = async (location) => {
    setDestLocation(location.displayName);
    setDestSuggestions([]);
    setDestLoading(true);
    
    const elevation = await getElevation(location.lat, location.lon);
    if (elevation) {
      setDestAlt(elevation.toString());
    }
    setDestLoading(false);
  };

  const calculatePlan = async (e) => {
    e.preventDefault();
    
    const home = parseInt(homeAlt);
    const dest = parseInt(destAlt);
    const altChange = dest - home;
    const baseDays = Math.max(1, Math.floor(altChange / 1000));
    const multipliers = { light: 0.7, moderate: 1.0, intense: 1.3, extreme: 1.6 };
    
    const fitnessMultipliers = { 
      beginner: 1.3,
      average: 1.0,
      fit: 0.8,
      athlete: 0.7
    };
    
    const recDays = Math.ceil(baseDays * multipliers[activityLevel] * fitnessMultipliers[fitnessLevel]);
    
    const firstActivityDay = Math.max(1, Math.ceil(recDays * 0.3));
    const moderateActivityDay = Math.max(2, Math.ceil(recDays * 0.6));
    const fullIntensityDay = Math.max(2, recDays);
    
    let riskLevel = 'Low';
    let riskColor = '#10b981';
    if (altChange > 8000) {
      riskLevel = 'High';
      riskColor = '#ef4444';
    } else if (altChange > 5000) {
      riskLevel = 'Moderate-High';
      riskColor = '#f59e0b';
    } else if (altChange > 2000) {
      riskLevel = 'Moderate';
      riskColor = '#f59e0b';
    }
    
    const baseHydration = 2;
    const altitudeMultiplier = 1 + (altChange / 10000);
    const recommendedHydration = Math.round(baseHydration * altitudeMultiplier * 10) / 10;
    
    const calorieIncrease = Math.round((altChange / 1000) * 10);
    
    setResult({
      altitudeChange: altChange,
      recommendedDays: recDays,
      firstActivity: firstActivityDay,
      moderateActivity: moderateActivityDay,
      fullIntensity: fullIntensityDay,
      riskLevel,
      riskColor,
      hydration: recommendedHydration,
      calorieIncrease,
      homeAltitude: home,
      destAltitude: dest,
      homeLocation,
      destLocation
    });

    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement && window.innerWidth < 768) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const getDayByDayPlan = () => {
    if (!result) return [];
    
    const plan = [];
    for (let day = 1; day <= result.recommendedDays; day++) {
      let activity, intensity, tips;
      
      if (day < result.firstActivity) {
        activity = "Rest & Acclimate";
        intensity = 0;
        tips = ["Light walking only", "Stay hydrated", "Monitor symptoms", "Avoid alcohol"];
      } else if (day < result.moderateActivity) {
        activity = "Light Activity";
        intensity = 30;
        tips = ["Easy hiking or walking", "Keep heart rate low", "Rest if symptoms appear", "Continue high fluid intake"];
      } else if (day < result.fullIntensity) {
        activity = "Moderate Activity";
        intensity = 60;
        tips = ["Moderate hiking/skiing", "70-80% of normal intensity", "Take breaks as needed", "Watch for altitude sickness"];
      } else {
        activity = "Full Intensity";
        intensity = 100;
        tips = ["All activities OK", "Listen to your body", "Maintain hydration", "Recovery is key"];
      }
      
      plan.push({ day, activity, intensity, tips });
    }
    
    return plan;
  };

  const getSymptomGuide = () => {
    return {
      normal: ["Shortness of breath during activity", "Mild fatigue", "Slight headache (day 1-2)", "Increased urination", "Sleep disturbances"],
      warning: ["Persistent headache", "Nausea or vomiting", "Dizziness", "Extreme fatigue", "Loss of appetite"],
      emergency: ["Severe headache not relieved by medication", "Confusion or difficulty thinking", "Shortness of breath at rest", "Coughing up pink/frothy fluid", "Unable to walk straight"]
    };
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header - keeping the same */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div 
            onClick={() => router.push('/')}
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '2rem' }}>⛰️</span>
            <span>AltitudeReady</span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="desktop-nav">
            {user ? (
              <>
                <span style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  {user.signInDetails?.loginId || 'User'}
                </span>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                  }}
                >
                  Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/signin')}
                style={{
                  background: 'white',
                  color: '#2563eb',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '2px solid #2563eb',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                }}
              >
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'none'
            }}
            className="mobile-menu-btn"
          >
            ☰
          </button>
        </nav>

        {mobileMenuOpen && (
          <div style={{
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '1rem 2rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user ? (
                <>
                  <span style={{ padding: '0.5rem 0', color: '#6b7280' }}>
                    {user.signInDetails?.loginId || 'User'}
                  </span>
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/signin'); }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* Calculator */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2563eb', marginBottom: '10px' }}>Acclimation Calculator</h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: '#6b7280' }}>Get your personalized altitude acclimation plan with detailed recommendations</p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={calculatePlan} style={{ 
            background: 'white', 
            padding: 'clamp(1.5rem, 4vw, 2rem)', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>Enter Your Details</h3>
            
            {/* Home Location */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                Home Location
              </label>
              <input 
                type="text" 
                value={homeLocation}
                onChange={(e) => handleHomeLocationChange(e.target.value)}
                placeholder="Type at least 3 characters..."
                style={{ 
                  width: '100%', 
                  padding: 'clamp(10px, 2vw, 12px)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              />
              
              {homeLoading && (
                <div style={{ 
                  padding: '10px', 
                  fontSize: '0.85rem', 
                  color: '#6b7280',
                  fontStyle: 'italic' 
                }}>
                  Searching...
                </div>
              )}
              
              {homeSuggestions.length > 0 && !homeLoading && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {homeSuggestions.map((location, i) => (
                    <div
                      key={i}
                      onClick={() => handleHomeLocationSelect(location)}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        borderBottom: i < homeSuggestions.length - 1 ? '1px solid #e5e7eb' : 'none',
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      📍 {location.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Home Altitude */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                Home Altitude (feet)
              </label>
              <input 
                type="number" 
                value={homeAlt}
                onChange={(e) => setHomeAlt(e.target.value)}
                required
                placeholder="Auto-filled from location"
                style={{ 
                  width: '100%', 
                  padding: 'clamp(10px, 2vw, 12px)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Destination Location */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                Destination Location
              </label>
              <input 
                type="text" 
                value={destLocation}
                onChange={(e) => handleDestLocationChange(e.target.value)}
                placeholder="Type at least 3 characters..."
                style={{ 
                  width: '100%', 
                  padding: 'clamp(10px, 2vw, 12px)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              />
              
              {destLoading && (
                <div style={{ 
                  padding: '10px', 
                  fontSize: '0.85rem', 
                  color: '#6b7280',
                  fontStyle: 'italic' 
                }}>
                  Searching...
                </div>
              )}
              
              {destSuggestions.length > 0 && !destLoading && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {destSuggestions.map((location, i) => (
                    <div
                      key={i}
                      onClick={() => handleDestLocationSelect(location)}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        borderBottom: i < destSuggestions.length - 1 ? '1px solid #e5e7eb' : 'none',
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      📍 {location.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Altitude */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                Destination Altitude (feet)
              </label>
              <input 
                type="number" 
                value={destAlt}
                onChange={(e) => setDestAlt(e.target.value)}
                required
                placeholder="Auto-filled from location"
                style={{ 
                  width: '100%', 
                  padding: 'clamp(10px, 2vw, 12px)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Current Fitness Level */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                Current Fitness Level
              </label>
              <select 
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: 'clamp(10px, 2vw, 12px)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              >
                <option value="beginner">Beginner (Little regular exercise)</option>
                <option value="average">Average (Exercise 1-2x per week)</option>
                <option value="fit">Fit (Exercise 3-4x per week)</option>
                <option value="athlete">Athlete (Daily training)</option>
              </select>
            </div>
            
            {/* Activity Level at Destination */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                Activity Level at Destination
              </label>
              <select 
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: 'clamp(10px, 2vw, 12px)', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              >
                <option value="light">Light (walking, sightseeing)</option>
                <option value="moderate">Moderate (hiking, casual skiing)</option>
                <option value="intense">Intense (running, hard skiing)</option>
                <option value="extreme">Extreme (racing, mountaineering)</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: 'clamp(12px, 3vw, 14px)', 
                background: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: 'clamp(1rem, 2vw, 1.1rem)', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              Calculate My Plan
            </button>
          </form>

          {/* Ad - Only show to non-Pro users when no results */}
          {!user && !result && (
            <div style={{ marginTop: '2rem' }}>
              <GoogleAd 
                slot="1234567890" 
                format="auto"
                style={{ minHeight: '250px' }}
              />
            </div>
          )}
        </div>

        {/* Results section - Keep everything else the same from the original file */}
        {result && (
          <div id="results-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Copy all the results sections from your original file here */}
            {/* I'm keeping this part exactly as you had it */}
          </div>
        )}
        
        {!result && (
          <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
            <p>Made with ❤️ at 10,152 feet in Leadville, Colorado</p>
          </div>
        )}
      </div>
    </div>
  );
}
