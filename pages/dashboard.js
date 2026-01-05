import { useState, useEffect } from 'react';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { createTrip, getUserTrips, deleteTrip, getUserProfile } from '../lib/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Form state
  const [tripName, setTripName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [homeAltitude, setHomeAltitude] = useState('');
  const [destinationAltitude, setDestinationAltitude] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

    const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const sub = session.tokens?.idToken?.payload?.sub;
      
      setUser(currentUser);
      setUserId(sub);
      
      if (sub) {
        // Load user profile
        const profileResponse = await getUserProfile(sub);
        if (profileResponse.success && profileResponse.data) {
          setUserProfile(profileResponse.data);
          setHomeAltitude(profileResponse.data.homeAltitude?.toString() || '');
        }
        
        loadTrips(sub);
      }
    } catch (err) {
      router.push('/signin');
    }
    setLoading(false);
  };

 const [userProfile, setUserProfile] = useState(null);
  
  const loadTrips = async (uid) => {
    try {
      const response = await getUserTrips(uid);
      if (response.success) {
        setTrips(response.data);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tripData = {
        userId,
        tripName,
        destinationName,
        homeAltitude: homeAltitude ? parseInt(homeAltitude) : (userProfile?.homeAltitude || 0),
        destinationAltitude: parseInt(destinationAltitude),
        arrivalDate,
        departureDate,
        activityLevel
      };

      const response = await createTrip(tripData);
      
      if (response.success) {
        setTrips([response.data, ...trips]);
        setShowAddTrip(false);
        // Reset form
        setTripName('');
        setDestinationName('');
        setHomeAltitude('');
        setDestinationAltitude('');
        setArrivalDate('');
        setDepartureDate('');
        setActivityLevel('moderate');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Error creating trip. Please try again.');
    }
    setSaving(false);
  };

      const response = await createTrip(tripData);
      
      if (response.success) {
        setTrips([response.data, ...trips]);
        setShowAddTrip(false);
        setTripName('');
        setDestinationName('');
        setHomeAltitude('');
        setDestinationAltitude('');
        setArrivalDate('');
        setDepartureDate('');
        setActivityLevel('moderate');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Error creating trip. Please try again.');
    }
    setSaving(false);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteTrip(userId, tripId);
      setTrips(trips.filter(t => t.tripId !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const getCurrentTrip = () => {
    const now = new Date();
    return trips.find(trip => {
      const arrival = new Date(trip.arrivalDate);
      const departure = new Date(trip.departureDate);
      return now >= arrival && now <= departure;
    });
  };

  const getUpcomingTrips = () => {
    const now = new Date();
    return trips.filter(trip => new Date(trip.arrivalDate) > now)
      .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));
  };

  const getPastTrips = () => {
    const now = new Date();
    return trips.filter(trip => new Date(trip.departureDate) < now)
      .sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate));
  };

  const getAcclimationProgress = (trip) => {
    const now = new Date();
    const arrival = new Date(trip.arrivalDate);
    const fullIntensity = new Date(trip.fullIntensityDate);
    
    const totalDays = Math.ceil((fullIntensity - arrival) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now - arrival) / (1000 * 60 * 60 * 24));
    
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    
    return { progress, daysPassed, totalDays };
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStats = () => {
    const totalTrips = trips.length;
    const upcomingCount = getUpcomingTrips().length;
    const completedCount = getPastTrips().length;
    const totalAltitudeGain = trips.reduce((sum, trip) => sum + (trip.altitudeChange || 0), 0);
    
    return { totalTrips, upcomingCount, completedCount, totalAltitudeGain };
  };

  const getTipForProgress = (progress) => {
    if (progress < 30) {
      return {
        title: "Take It Easy",
        tips: [
          "Rest and allow your body to adjust",
          "Drink 3-4 liters of water daily",
          "Avoid alcohol and caffeine",
          "Light walking only - no strenuous activity",
          "Monitor for headaches, nausea, or dizziness"
        ],
        color: '#ef4444'
      };
    } else if (progress < 70) {
      return {
        title: "Light Activities OK",
        tips: [
          "Start with light hikes or easy skiing",
          "Keep intensity at 60-70% of normal",
          "Continue hydrating well",
          "Listen to your body - rest if needed",
          "Gradually increase activity duration"
        ],
        color: '#f59e0b'
      };
    } else if (progress < 100) {
      return {
        title: "Ramping Up",
        tips: [
          "Increase to moderate intensity activities",
          "You can push harder but watch for symptoms",
          "Maintain high fluid intake",
          "You're almost fully acclimated!",
          "Consider altitude training techniques"
        ],
        color: '#10b981'
      };
    } else {
      return {
        title: "Fully Acclimated!",
        tips: [
          "Ready for full intensity activities",
          "Your body has adapted to the altitude",
          "Continue staying hydrated",
          "Enjoy your activities at 100%",
          "Monitor recovery between sessions"
        ],
        color: '#8b5cf6'
      };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛰️</div>
        <h2 style={{ color: '#2563eb' }}>Loading your dashboard...</h2>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentTrip = getCurrentTrip();
  const upcomingTrips = getUpcomingTrips();
  const pastTrips = getPastTrips();
  const stats = getStats();

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
          maxWidth: '1400px',
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
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/calculator')}
              style={{
                background: 'white',
                color: '#2563eb',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #2563eb',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Calculator
            </button>
            <button
              onClick={handleSignOut}
              style={{
                background: 'white',
                color: '#dc2626',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #dc2626',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' }}>
              Welcome back! 👋
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
              {user.signInDetails?.loginId || 'User'}
            </p>
          </div>
          <button
            onClick={() => setShowAddTrip(true)}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
            }}
          >
            + Add Trip
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Trips</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.totalTrips}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Upcoming Trips</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.upcomingCount}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Completed</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.completedCount}</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Altitude Gain</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.totalAltitudeGain.toLocaleString()}<span style={{ fontSize: '1rem' }}> ft</span></div>
          </div>
        </div>

        {/* Current Trip Acclimation Tracker */}
        {currentTrip && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '3px solid #2563eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#dbeafe', color: '#2563eb', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                  🎯 ACTIVE TRIP
                </div>
                <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {currentTrip.tripName}
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                  {currentTrip.destinationName} • {currentTrip.destinationAltitude.toLocaleString()} ft
                </p>
              </div>
            </div>

            {(() => {
              const { progress, daysPassed, totalDays } = getAcclimationProgress(currentTrip);
              const daysUntilFull = getDaysUntil(currentTrip.fullIntensityDate);
              const tipData = getTipForProgress(progress);
              
              return (
                <>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1f2937' }}>Acclimation Progress</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: tipData.color }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{
                      background: '#e5e7eb',
                      height: '40px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        background: `linear-gradient(90deg, ${tipData.color} 0%, ${tipData.color}dd 100%)`,
                        height: '100%',
                        width: `${progress}%`,
                        transition: 'width 0.5s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '15px',
                        color: 'white',
                        fontWeight: 700
                      }}>
                        {progress > 10 && `Day ${daysPassed}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                      <span>Arrival</span>
                      <span>Day {Math.floor(totalDays / 2)}</span>
                      <span>Fully Acclimated</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>Altitude Change</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937' }}>{currentTrip.altitudeChange.toLocaleString()} ft</div>
                    </div>
                    <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>Days Into Trip</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937' }}>{daysPassed} / {totalDays}</div>
                    </div>
                    <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>Full Intensity Ready</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937' }}>
                        {daysUntilFull > 0 ? `${daysUntilFull} days` : 'Now!'}
                      </div>
                    </div>
                    <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>Activity Level</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', textTransform: 'capitalize' }}>
                        {currentTrip.activityLevel}
                      </div>
                    </div>
                  </div>

                  {/* Tips Section */}
                  <div style={{
                    background: `${tipData.color}15`,
                    border: `2px solid ${tipData.color}`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: tipData.color, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {progress >= 100 ? '🎉' : progress >= 70 ? '💪' : progress >= 30 ? '⚡' : '🧘'}
                      {tipData.title}
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                      {tipData.tips.map((tip, i) => (
                        <li key={i} style={{ color: '#1f2937', fontSize: '1rem' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>
              📅 Upcoming Trips
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {upcomingTrips.map(trip => {
                const daysUntil = getDaysUntil(trip.arrivalDate);
                
                return (
                  <div key={trip.tripId} style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => handleDeleteTrip(trip.tripId)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: '#fee2e2',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        width: '35px',
                        height: '35px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete trip"
                    >
                      🗑️
                    </button>
                    
                    <div style={{ marginBottom: '1rem', paddingRight: '40px' }}>
                      <h3 style={{ fontSize: '1.4rem', color: '#2563eb', marginBottom: '0.5rem', fontWeight: 700 }}>
                        {trip.tripName}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '1rem' }}>{trip.destinationName}</p>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.9rem',
                      color: '#6b7280'
                    }}>
                      <div>📍 {trip.destinationAltitude.toLocaleString()} ft</div>
                      <div>📈 +{trip.altitudeChange.toLocaleString()} ft</div>
                      <div>📆 {new Date(trip.arrivalDate).toLocaleDateString()}</div>
                      <div>⏱️ {trip.recommendedDays} days</div>
                    </div>

                    <div style={{
                      padding: '1rem',
                      background: daysUntil <= 7 ? '#fef3c7' : '#dbeafe',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: `2px solid ${daysUntil <= 7 ? '#f59e0b' : '#2563eb'}`
                    }}>
                      <div style={{ fontWeight: 700, color: daysUntil <= 7 ? '#f59e0b' : '#2563eb', fontSize: '1.1rem' }}>
                        {daysUntil === 0 ? 'Departing Today!' : daysUntil === 1 ? 'Departing Tomorrow!' : `${daysUntil} days until departure`}
                      </div>
                      {daysUntil <= 7 && daysUntil > 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '0.25rem' }}>
                          🎯 Start preparing!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Trips */}
        {pastTrips.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>
              📚 Past Trips
            </h2>
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {pastTrips.map(trip => (
                <div key={trip.tripId} style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '2px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      ✓
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                        {trip.tripName}
                      </h3>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {trip.destinationName} • {new Date(trip.arrivalDate).toLocaleDateString()} to {new Date(trip.departureDate).toLocaleDateString()}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {trip.destinationAltitude.toLocaleString()} ft • +{trip.altitudeChange.toLocaleString()} ft gain
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTrip(trip.tripId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                    title="Delete trip"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Trips Message */}
        {trips.length === 0 && (
          <div style={{
            background: 'white',
            padding: '4rem 2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏔️</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#1f2937' }}>
              Ready for your first adventure?
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Add your first trip to start tracking your altitude acclimation and get personalized recommendations
            </p>
            <button
              onClick={() => setShowAddTrip(true)}
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '1.25rem 2.5rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
              }}
            >
              Add Your First Trip
            </button>
          </div>
        )}
      </div>

      {/* Add Trip Modal */}
      {showAddTrip && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Add New Trip</h2>
            
            <form onSubmit={handleAddTrip}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Trip Name
                </label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g., Aspen Ski Trip"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Destination
                </label>
                <input
                  type="text"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  placeholder="e.g., Aspen, Colorado"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Home Altitude (ft)
                  </label>
                  <input
                    type="number"
                    value={homeAltitude}
                    onChange={(e) => setHomeAltitude(e.target.value)}
                    placeholder="500"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Destination Altitude (ft)
                  </label>
                  <input
                    type="number"
                    value={destinationAltitude}
                    onChange={(e) => setDestinationAltitude(e.target.value)}
                    placeholder="8000"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="light">Light (walking, sightseeing)</option>
                  <option value="moderate">Moderate (hiking, casual skiing)</option>
                  <option value="intense">Intense (running, hard skiing)</option>
                  <option value="extreme">Extreme (racing, mountaineering)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Adding...' : 'Add Trip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTrip(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
