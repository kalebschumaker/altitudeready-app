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

  // Refs for debounce timers
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

  // Keep all your other functions (getDayByDayPlan, getSymptomGuide) exactly as they were
  // Then continue with the return statement and JSX

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
      {/* Header */}
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
            marginBottom: '2rem'
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
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)' 
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
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)'
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
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)' 
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
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)' 
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
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)'
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
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)' 
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
                style={{ width: '100%', padding: 'clamp(10px, 2vw, 12px)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
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
                style={{ width: '100%', padding: 'clamp(10px, 2vw, 12px)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
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
        </div>

        {/* Results section - keeping the same as before */}
        {result && (
          <div id="results-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* All your existing results display code goes here - I'll keep it the same */}
            {/* Summary Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 'clamp(1.2rem, 3vw, 1.5rem)', borderRadius: '12px' }}>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.9 }}>Altitude Change</div>
                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2rem)', fontWeight: 700, marginTop: '0.5rem' }}>{result.altitudeChange.toLocaleString()}</div>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.9 }}>feet</div>
                {result.homeLocation && result.destLocation && (
                  <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', marginTop: '0.5rem', opacity: 0.8 }}>
                    {result.homeLocation} → {result.destLocation}
                  </div>
                )}
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: 'clamp(1.2rem, 3vw, 1.5rem)', borderRadius: '12px' }}>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.9 }}>Acclimation Time</div>
                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2rem)', fontWeight: 700, marginTop: '0.5rem' }}>{result.recommendedDays}</div>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.9 }}>days</div>
              </div>
              
              <div style={{ background: `linear-gradient(135deg, ${result.riskColor} 0%, ${result.riskColor}cc 100%)`, color: 'white', padding: 'clamp(1.2rem, 3vw, 1.5rem)', borderRadius: '12px' }}>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.9 }}>Risk Level</div>
                <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2rem)', fontWeight: 700, marginTop: '0.5rem' }}>{result.riskLevel}</div>
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.9 }}>altitude sickness</div>
              </div>
            </div>

            {/* Rest of results sections unchanged - keeping all the day-by-day plan, hydration, symptoms sections exactly as they were */}
            <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2rem)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: '#1f2937' }}>Your Acclimation Timeline</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                  <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.5rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>⚠️ First Light Activity</div>
                  <div style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', fontWeight: 700, color: '#78350f' }}>Day {result.firstActivity}</div>
                </div>
                
                <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                  <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>💪 Moderate Intensity</div>
                  <div style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', fontWeight: 700, color: '#1e3a8a' }}>Day {result.moderateActivity}</div>
                </div>
                
                <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                  <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '0.5rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>🎯 Full Intensity Ready</div>
                  <div style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', fontWeight: 700, color: '#064e3b' }}>Day {result.fullIntensity}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.3rem)', marginBottom: '1rem', color: '#1f2937' }}>Day-by-Day Activity Guide</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {getDayByDayPlan().map((day) => (
                  <div key={day.day} style={{
                    padding: 'clamp(0.8rem, 2vw, 1rem)',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'start'
                  }}>
                    <div style={{
                      width: 'clamp(40px, 10vw, 50px)',
                      height: 'clamp(40px, 10vw, 50px)',
                      minWidth: 'clamp(40px, 10vw, 50px)',
                      background: day.intensity === 0 ? '#fee2e2' : day.intensity < 50 ? '#fef3c7' : day.intensity < 100 ? '#dbeafe' : '#d1fae5',
                      color: day.intensity === 0 ? '#dc2626' : day.intensity < 50 ? '#f59e0b' : day.intensity < 100 ? '#3b82f6' : '#10b981',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 'clamp(1rem, 3vw, 1.2rem)'
                    }}>
                      {day.day}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', marginBottom: '0.5rem', color: '#1f2937' }}>
                        {day.activity}
                      </div>
                      <div style={{ 
                        marginBottom: '0.75rem',
                        background: '#e5e7eb',
                        height: '8px',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${day.intensity}%`,
                          height: '100%',
                          background: day.intensity === 0 ? '#dc2626' : day.intensity < 50 ? '#f59e0b' : day.intensity < 100 ? '#3b82f6' : '#10b981',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#6b7280' }}>
                        {day.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hydration & Nutrition - keeping exactly as before */}
            <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2rem)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: '#1f2937' }}>💧 Hydration & Nutrition</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                  <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>💧</div>
                  <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#1e40af', marginBottom: '0.5rem' }}>
                    Daily Water Intake
                  </div>
                  <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                    {result.hydration}L
                  </div>
                  <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#6b7280' }}>
                    per day at {result.destAltitude.toLocaleString()} ft
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                  <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>🍽️</div>
                  <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#92400e', marginBottom: '0.5rem' }}>
                    Calorie Increase
                  </div>
                  <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, color: '#78350f', marginBottom: '0.5rem' }}>
                    +{result.calorieIncrease}%
                  </div>
                  <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#6b7280' }}>
                    higher caloric needs
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #10b981' }}>
                <h4 style={{ color: '#065f46', marginBottom: '0.75rem', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>💡 Nutrition Tips</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534', lineHeight: 1.8, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                  <li>Eat smaller, more frequent meals to aid digestion</li>
                  <li>Focus on complex carbohydrates for sustained energy</li>
                  <li>Avoid heavy, fatty foods in the first few days</li>
                  <li>Consider electrolyte supplements with increased hydration</li>
                  <li>Limit caffeine and alcohol consumption</li>
                </ul>
              </div>
            </div>

            {/* Symptom Guide - keeping exactly as before */}
            <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2rem)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: '#1f2937' }}>🏥 Altitude Sickness Symptom Guide</h2>



            {/* Ad - Before affiliate section */}
            {!user && (
              <div style={{ marginBottom: '2rem' }}>
                <GoogleAd 
                  slot="1122334455" 
                  format="auto"
                  style={{ minHeight: '250px' }}
                />
              </div>
            )}

            {/* Affiliate Recommendations Section - NEW */}
              
              {(() => {
                const symptoms = getSymptomGuide();
                return (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ padding: '1.5rem', background: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.2rem)', color: '#065f46', margin: 0 }}>Normal Symptoms</h3>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534', lineHeight: 1.8, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                        {symptoms.normal.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    
                    <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.2rem)', color: '#92400e', margin: 0 }}>Warning Signs - Take It Easy</h3>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: 1.8, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                        {symptoms.warning.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fde68a', borderRadius: '6px', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', color: '#92400e' }}>
                        <strong>Action:</strong> Rest immediately, descend if symptoms worsen, increase hydration
                      </div>
                    </div>
                    
                    <div style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: '8px', border: '2px solid #dc2626' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🚨</span>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.2rem)', color: '#991b1b', margin: 0 }}>Emergency - Seek Medical Help</h3>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d', lineHeight: 1.8, fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                        {symptoms.emergency.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fca5a5', borderRadius: '6px', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', color: '#7f1d1d', fontWeight: 600 }}>
                        <strong>URGENT:</strong> Descend immediately and seek emergency medical care
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {!user && (
              <div style={{ marginTop: '2rem', padding: 'clamp(1.5rem, 4vw, 2rem)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
                <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.5rem)', marginBottom: '1rem' }}>Want to save your plan and track your progress?</h3>
                <p style={{ marginBottom: '1.5rem', opacity: 0.95, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Create a free account to save trips, get real-time acclimation tracking, and access advanced features.</p>
                <button
                  onClick={() => router.push('/signin')}
                  style={{
                    background: 'white',
                    color: '#2563eb',
                    padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)'
                  }}
                >
                  Create Free Account
                </button>
              </div>
            )}
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
