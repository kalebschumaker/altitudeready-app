import { useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { createTrip, getUserTrips, deleteTrip, getUserProfile, updateUserProfile } from '../lib/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Trip form
  const [tripName, setTripName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [homeAltitude, setHomeAltitude] = useState('');
  const [destinationAltitude, setDestinationAltitude] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  
  // Edit profile form
  const [editName, setEditName] = useState('');
  const [editHomeCity, setEditHomeCity] = useState('');
  const [editHomeAltitude, setEditHomeAltitude] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const session = await fetchAuthSession();
      const sub = session.tokens?.idToken?.payload?.sub;
      setUserId(sub);
      
      if (sub) {
        try {
          const profileResponse = await getUserProfile(sub);
          if (profileResponse.success && profileResponse.data) {
            setUserProfile(profileResponse.data);
            setHomeAltitude(profileResponse.data.homeAltitude?.toString() || '');
          }
        } catch (profileError) {
          console.log('No user profile found yet, will create on first trip');
        }
        
        const tripsResponse = await getUserTrips(sub);
        if (tripsResponse.success) {
          setTrips(tripsResponse.data || []);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/signin');
    }
    setLoading(false);
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tripData = {
        userId,
        tripName,
        destinationName,
        homeAltitude: parseInt(homeAltitude) || 0,
        destinationAltitude: parseInt(destinationAltitude),
        arrivalDate,
        departureDate,
        activityLevel
      };

      const response = await createTrip(tripData);
      
      if (response.success) {
        setTrips([response.data, ...trips]);
        setShowAddTrip(false);
        setTripName('');
        setDestinationName('');
        setDestinationAltitude('');
        setArrivalDate('');
        setDepartureDate('');
        setActivityLevel('moderate');
      } else {
        alert(`Error creating trip: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert(`Error creating trip: ${error.message || 'Please try again.'}`);
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
      alert('Error deleting trip');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(userId, {
        homeCity: editHomeCity,
        homeAltitude: parseInt(editHomeAltitude)
      });
      setUserProfile({
        ...userProfile,
        name: editName,
        homeCity: editHomeCity,
        homeAltitude: parseInt(editHomeAltitude)
      });
      setShowEditProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1.5rem 2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
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
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Calculator
            </button>
            <button
              onClick={handleSignOut}
              style={{
                background: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        {/* Welcome Section */}
        <div style={{ 
          background: 'white', 
          padding: '2.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>Welcome Back! 👋</h1>
          {userProfile?.name && (
            <p style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: '#2563eb' }}>
              {userProfile.name}
            </p>
          )}
          {userProfile?.homeCity && (
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#6b7280' }}>
              📍 {userProfile.homeCity}
            </p>
          )}
          <p style={{ fontSize: '1rem', color: '#9ca3af' }}>
            {user.signInDetails?.loginId || 'User'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setEditName(userProfile?.name || '');
              setEditHomeCity(userProfile?.homeCity || '');
              setEditHomeAltitude(userProfile?.homeAltitude?.toString() || '');
              setShowEditProfile(true);
            }}
            style={{
              background: 'white',
              color: '#2563eb',
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: '2px solid #2563eb',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ⚙️ Edit Profile
          </button>
          
          <button
            onClick={() => setShowAddTrip(true)}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
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
          marginBottom: '3rem'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            padding: '2rem', 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Trips</div>
            <div style={{ fontSize: '3rem', fontWeight: 700 }}>{trips.length}</div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            padding: '2rem', 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Upcoming Trips</div>
            <div style={{ fontSize: '3rem', fontWeight: 700 }}>
              {trips.filter(t => new Date(t.arrivalDate) > new Date()).length}
            </div>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white', 
            padding: '2rem', 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Past Trips</div>
            <div style={{ fontSize: '3rem', fontWeight: 700 }}>
              {trips.filter(t => new Date(t.departureDate) < new Date()).length}
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div style={{ 
          background: 'white', 
          padding: '2.5rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>Your Trips</h2>
          
          {trips.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              color: '#6b7280' 
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏔️</div>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No trips yet</p>
              <p>Start planning your altitude adventures!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {trips.map((trip) => (
                <div key={trip.tripId} style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
                        {trip.tripName || trip.destinationName}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                        📍 {trip.destinationName} • {trip.destinationAltitude?.toLocaleString()} ft
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTrip(trip.tripId)}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Altitude Change</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2563eb' }}>
                        {trip.altitudeChange?.toLocaleString()} ft
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Acclimation Days</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2563eb' }}>
                        {trip.recommendedDays} days
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Arrival Date</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937' }}>
                        {new Date(trip.arrivalDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Departure Date</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937' }}>
                        {new Date(trip.departureDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>Add New Trip</h2>
            <form onSubmit={handleAddTrip}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Trip Name
                </label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g., Colorado Ski Trip"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Destination *
                </label>
                <input
                  type="text"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  required
                  placeholder="e.g., Aspen, CO"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                    Home Altitude (ft) *
                  </label>
                  <input
                    type="number"
                    value={homeAltitude}
                    onChange={(e) => setHomeAltitude(e.target.value)}
                    required
                    placeholder="500"
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                    Destination Altitude (ft) *
                  </label>
                  <input
                    type="number"
                    value={destinationAltitude}
                    onChange={(e) => setDestinationAltitude(e.target.value)}
                    required
                    placeholder="8000"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                    Arrival Date *
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                    Departure Date *
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Activity Level *
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
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="intense">Intense</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
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
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
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
                    fontSize: '1rem',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Add Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Home City
                </label>
                <input
                  type="text"
                  value={editHomeCity}
                  onChange={(e) => setEditHomeCity(e.target.value)}
                  placeholder="e.g., Denver, CO"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Home Altitude (feet)
                </label>
                <input
                  type="number"
                  value={editHomeAltitude}
                  onChange={(e) => setEditHomeAltitude(e.target.value)}
                  placeholder="5280"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Note: Email cannot be changed for security reasons
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
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
                    fontSize: '1rem',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
