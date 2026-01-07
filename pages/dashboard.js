import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { createTrip, getUserTrips, deleteTrip, getUserProfile, updateUserProfile } from '../lib/api';
import { searchLocations, getElevation } from '../lib/cityElevations';
 
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState(null);
  
  const [tripName, setTripName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [homeAltitude, setHomeAltitude] = useState('');
  const [destinationAltitude, setDestinationAltitude] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  
  const [destSearchResults, setDestSearchResults] = useState([]);
  const [destSearchLoading, setDestSearchLoading] = useState(false);
  const destSearchTimerRef = useRef(null);
  
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
  router.push('/signin');  // Changed from /auth/signin to /signin
}
    setLoading(false);
  };

  const handleDestinationSearch = (value) => {
    setDestinationName(value);
    if (destSearchTimerRef.current) clearTimeout(destSearchTimerRef.current);
    if (value.length < 3) {
      setDestSearchResults([]);
      return;
    }
    setDestSearchLoading(true);
    destSearchTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      setDestSearchResults(results.slice(0, 5));
      setDestSearchLoading(false);
    }, 400);
  };

  const handleDestinationSelect = async (location) => {
    setDestinationName(location.displayName);
    setDestSearchResults([]);
    setDestSearchLoading(true);
    const elevation = await getElevation(location.lat, location.lon);
    if (elevation) setDestinationAltitude(elevation.toString());
    setDestSearchLoading(false);
  };

  const getDayByDayPlan = (trip) => {
    if (!trip) return [];
    const plan = [];
    const firstActivityDay = Math.max(1, Math.ceil(trip.recommendedDays * 0.3));
    const moderateActivityDay = Math.max(2, Math.ceil(trip.recommendedDays * 0.6));
    for (let day = 1; day <= trip.recommendedDays; day++) {
      let activity, intensity, tips;
      if (day < firstActivityDay) {
        activity = "Rest & Acclimate";
        intensity = 0;
        tips = ["Light walking only", "Stay hydrated", "Monitor symptoms", "Avoid alcohol"];
      } else if (day < moderateActivityDay) {
        activity = "Light Activity";
        intensity = 30;
        tips = ["Easy hiking or walking", "Keep heart rate low", "Rest if symptoms appear", "Continue high fluid intake"];
      } else if (day < trip.recommendedDays) {
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

  const getSymptomGuide = () => ({
    normal: ["Shortness of breath during activity", "Mild fatigue", "Slight headache (day 1-2)", "Increased urination", "Sleep disturbances"],
    warning: ["Persistent headache", "Nausea or vomiting", "Dizziness", "Extreme fatigue", "Loss of appetite"],
    emergency: ["Severe headache not relieved by medication", "Confusion or difficulty thinking", "Shortness of breath at rest", "Coughing up pink/frothy fluid", "Unable to walk straight"]
  });

  const calculateHydration = (altChange) => Math.round((2 * (1 + (altChange / 10000))) * 10) / 10;
  const calculateCalories = (altChange) => Math.round((altChange / 1000) * 10);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await createTrip({
        userId, tripName, destinationName,
        homeAltitude: parseInt(homeAltitude) || 0,
        destinationAltitude: parseInt(destinationAltitude),
        arrivalDate, departureDate, activityLevel
      });
      if (response.success) {
        setTrips([response.data, ...trips]);
        setShowAddTrip(false);
        setTripName(''); setDestinationName(''); setDestinationAltitude('');
        setArrivalDate(''); setDepartureDate(''); setActivityLevel('moderate');
        setDestSearchResults([]);
      } else {
        alert(`Error creating trip: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
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
      alert('Error deleting trip');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(userId, {
        name: editName,
        homeCity: editHomeCity,
        homeAltitude: parseInt(editHomeAltitude)
      });
      setUserProfile({ ...userProfile, name: editName, homeCity: editHomeCity, homeAltitude: parseInt(editHomeAltitude) });
      setHomeAltitude(editHomeAltitude);
      setShowEditProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
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

  const handleManageSubscription = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
      else alert('Error creating portal session');
    } catch (error) {
      alert('Error opening subscription management');
    }
    setSaving(false);
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
      <style jsx>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .action-buttons { flex-direction: column !important; }
          .action-buttons button { width: 100% !important; }
          .header-buttons { flex-direction: column !important; gap: 0.5rem !important; }
          .header-buttons button { padding: 0.5rem 1rem !important; fontSize: 0.9rem !important; }
        }
      `}</style>

      <header style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem)', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div onClick={() => router.push('/')} style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <img src="/logo_notext.png" alt="AltitudeReady Logo" style={{ width: 'clamp(50px, 8vw, 70px)', height: 'clamp(50px, 8vw, 70px)', objectFit: 'contain' }} />
            <span>AltitudeReady</span>
          </div>
          <div className="header-buttons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => router.push('/calculator')} style={{ background: 'white', color: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '2px solid #2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Calculator</button>
            <button onClick={handleSignOut} style={{ background: '#dc2626', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Sign Out</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 2rem) 4rem' }}>
        <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '1rem', color: '#1f2937' }}>Welcome Back! 👋</h1>
          {userProfile?.name && <p style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 600, marginBottom: '0.5rem', color: '#2563eb' }}>{userProfile.name}</p>}
          {userProfile?.homeCity && <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginBottom: '0.5rem', color: '#6b7280' }}>📍 {userProfile.homeCity}</p>}
          <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', color: '#9ca3af' }}>{user.signInDetails?.loginId || 'User'}</p>
        </div>

        {userProfile && (
          <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: '#1f2937' }}>Subscription</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: userProfile.subscriptionTier !== 'free' ? '1px solid #e5e7eb' : 'none', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Current Plan</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: userProfile.subscriptionTier === 'free' ? '#6b7280' : '#2563eb', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {userProfile.subscriptionTier || 'Free'}
                  {userProfile.subscriptionTier === 'lifetime' && <span style={{ fontSize: '1.5rem' }}>⭐</span>}
                  {userProfile.subscriptionTier === 'pro' && <span style={{ fontSize: '1.5rem' }}>✨</span>}
                </div>
                {userProfile.subscriptionStatus && userProfile.subscriptionStatus !== 'active' && userProfile.subscriptionTier !== 'free' && (
                  <div style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.375rem 0.875rem', background: userProfile.subscriptionStatus === 'past_due' ? '#fef3c7' : '#fee2e2', color: userProfile.subscriptionStatus === 'past_due' ? '#92400e' : '#991b1b', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {userProfile.subscriptionStatus.replace('_', ' ')}
                  </div>
                )}
              </div>
              {userProfile.subscriptionTier === 'free' && (
                <button onClick={() => router.push('/#pricing')} style={{ background: '#2563eb', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}>Upgrade to Pro</button>
              )}
            </div>
            {userProfile.subscriptionTier === 'pro' && userProfile.stripeCustomerId && (
              <div style={{ paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Manage your subscription, update payment methods, or view billing history</div>
                <button onClick={handleManageSubscription} disabled={saving} style={{ background: 'white', color: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '2px solid #2563eb', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', opacity: saving ? 0.7 : 1 }}>{saving ? 'Loading...' : 'Manage Subscription'}</button>
              </div>
            )}
            {userProfile.subscriptionTier === 'lifetime' && (
              <div style={{ paddingTop: '1.5rem', color: '#6b7280', fontSize: '0.95rem', fontStyle: 'italic' }}>🎉 You're a lifetime member! Enjoy unlimited access to all features forever.</div>
            )}
          </div>
        )}

        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button onClick={() => { setEditName(userProfile?.name || ''); setEditHomeCity(userProfile?.homeCity || ''); setEditHomeAltitude(userProfile?.homeAltitude?.toString() || ''); setShowEditProfile(true); }} style={{ background: 'white', color: '#2563eb', padding: '1rem 2rem', borderRadius: '12px', border: '2px solid #2563eb', fontWeight: 600, cursor: 'pointer', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚙️ Edit Profile</button>
          <button onClick={() => setShowAddTrip(true)} style={{ background: '#2563eb', color: 'white', padding: '1rem 2rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>+ Add Trip</button>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Trips</div>
            <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: 700 }}>{trips.length}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Upcoming Trips</div>
            <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: 700 }}>{trips.filter(t => new Date(t.arrivalDate) > new Date()).length}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: 'clamp(1.5rem, 3vw, 2rem)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Past Trips</div>
            <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: 700 }}>{trips.filter(t => new Date(t.departureDate) < new Date()).length}</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: '#1f2937' }}>Your Trips</h2>
          {trips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏔️</div>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No trips yet</p>
              <p>Start planning your altitude adventures!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {trips.map((trip) => (
                <div key={trip.tripId}>
                  <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: 'clamp(1rem, 3vw, 1.5rem)', transition: 'all 0.3s', background: expandedTrip === trip.tripId ? '#f9fafb' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>{trip.tripName || trip.destinationName}</h3>
                        <p style={{ color: '#6b7280', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>📍 {trip.destinationName} • {trip.destinationAltitude?.toLocaleString()} ft</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.tripId); }} style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Delete</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Altitude Change</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 600, color: '#2563eb' }}>{trip.altitudeChange?.toLocaleString()} ft</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Acclimation Days</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 600, color: '#2563eb' }}>{trip.recommendedDays} days</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Arrival Date</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 600, color: '#1f2937' }}>{new Date(trip.arrivalDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Departure Date</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 600, color: '#1f2937' }}>{new Date(trip.departureDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedTrip(expandedTrip === trip.tripId ? null : trip.tripId); }} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: expandedTrip === trip.tripId ? '#2563eb' : '#eff6ff', borderRadius: '8px', border: 'none', textAlign: 'center', color: expandedTrip === trip.tripId ? 'white' : '#2563eb', fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', cursor: 'pointer', transition: 'all 0.3s' }}>
                      {expandedTrip === trip.tripId ? '▲ Hide Acclimation Plan' : '▼ View Detailed Acclimation Plan'}
                    </button>
                  </div>
                  {expandedTrip === trip.tripId && (
                    <div style={{ marginTop: '1rem', padding: 'clamp(1rem, 3vw, 2rem)', background: 'white', borderRadius: '12px', border: '2px solid #2563eb', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}>
                      <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginBottom: '1.5rem', color: '#1f2937' }}>Your Acclimation Timeline</h3>
                      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                        {getDayByDayPlan(trip).map((day) => (
                          <div key={day.day} style={{ padding: 'clamp(0.8rem, 2vw, 1rem)', background: '#f9fafb', borderRadius: '8px', border: '2px solid #e5e7eb', display: 'flex', gap: '1rem', alignItems: 'start', flexWrap: 'wrap' }}>
                            <div style={{ width: 'clamp(40px, 10vw, 50px)', height: 'clamp(40px, 10vw, 50px)', minWidth: '40px', background: day.intensity === 0 ? '#fee2e2' : day.intensity < 50 ? '#fef3c7' : day.intensity < 100 ? '#dbeafe' : '#d1fae5', color: day.intensity === 0 ? '#dc2626' : day.intensity < 50 ? '#f59e0b' : day.intensity < 100 ? '#3b82f6' : '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>{day.day}</div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ fontWeight: 600, fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', marginBottom: '0.5rem', color: '#1f2937' }}>{day.activity}</div>
                              <div style={{ marginBottom: '0.75rem', background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${day.intensity}%`, height: '100%', background: day.intensity === 0 ? '#dc2626' : day.intensity < 50 ? '#f59e0b' : day.intensity < 100 ? '#3b82f6' : '#10b981', transition: 'width 0.3s' }}></div>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#6b7280' }}>
                                {day.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                      <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginBottom: '1rem', color: '#1f2937' }}>💧 Hydration & Nutrition</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
                          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#1e40af', marginBottom: '0.5rem' }}>Daily Water Intake</div>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' }}>{calculateHydration(trip.altitudeChange)}L</div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>per day at {trip.destinationAltitude?.toLocaleString()} ft</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
                          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#92400e', marginBottom: '0.5rem' }}>Calorie Increase</div>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#78350f', marginBottom: '0.5rem' }}>+{calculateCalories(trip.altitudeChange)}%</div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>higher caloric needs</div>
                        </div>
                      </div>
                      <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginBottom: '1rem', color: '#1f2937' }}>🏥 Altitude Sickness Symptoms</h3>
                      {(() => {
                        const symptoms = getSymptomGuide();
                        return (
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>✅</span>
                                <h4 style={{ fontSize: '1rem', color: '#065f46', margin: 0 }}>Normal Symptoms</h4>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534', lineHeight: 1.6, fontSize: '0.85rem' }}>
                                {symptoms.normal.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                <h4 style={{ fontSize: '1rem', color: '#92400e', margin: 0 }}>Warning Signs</h4>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: 1.6, fontSize: '0.85rem' }}>
                                {symptoms.warning.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px', border: '2px solid #dc2626' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>🚨</span>
                                <h4 style={{ fontSize: '1rem', color: '#991b1b', margin: 0 }}>Emergency - Seek Medical Help</h4>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f1d1d', lineHeight: 1.6, fontWeight: 600, fontSize: '0.85rem' }}>
                                {symptoms.emergency.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddTrip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', marginBottom: '1.5rem', color: '#1f2937' }}>Add New Trip</h2>
            <form onSubmit={handleAddTrip}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Trip Name</label>
                <input type="text" value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g., Colorado Ski Trip" style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Destination *</label>
                <input type="text" value={destinationName} onChange={(e) => handleDestinationSearch(e.target.value)} required placeholder="Type at least 3 characters..." style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }} />
                {destSearchLoading && <div style={{ padding: '10px', fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>Searching...</div>}
                {destSearchResults.length > 0 && !destSearchLoading && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '2px solid #2563eb', borderRadius: '8px', marginTop: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto' }}>
                    {destSearchResults.map((location, i) => (
                      <div key={i} onClick={() => handleDestinationSelect(location)} style={{ padding: '12px', cursor: 'pointer', borderBottom: i < destSearchResults.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }} onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                        📍 {location.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Home Alt (ft) *</label>
                  <input type="number" value={homeAltitude} onChange={(e) => setHomeAltitude(e.target.value)} required placeholder="500" style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Dest Alt (ft) *</label>
                  <input type="number" value={destinationAltitude} onChange={(e) => setDestinationAltitude(e.target.value)} required placeholder="Auto-filled" style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Arrival Date *</label>
                  <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} required style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>Departure Date *</label>
                  <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Activity Level *</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} style={{ width: '100%', padding: 'clamp(0.65rem, 2vw, 0.75rem)', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: 'clamp(0.9rem, 2vw, 1rem)', boxSizing: 'border-box' }}>
                  <option value="light">Light (walking, sightseeing)</option>
                  <option value="moderate">Moderate (hiking, casual skiing)</option>
                  <option value="intense">Intense (running, hard skiing)</option>
                  <option value="extreme">Extreme (racing, mountaineering)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => { setShowAddTrip(false); setDestSearchResults([]); }} style={{ flex: 1, minWidth: '120px', padding: 'clamp(0.65rem, 2vw, 0.75rem)', background: 'white', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, minWidth: '120px', padding: 'clamp(0.65rem, 2vw, 0.75rem)', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 'clamp(0.9rem, 2vw, 1rem)', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Add Trip'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Home City</label>
                <input type="text" value={editHomeCity} onChange={(e) => setEditHomeCity(e.target.value)} placeholder="e.g., Denver, CO" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Home Altitude (feet)</label>
                <input type="number" value={editHomeAltitude} onChange={(e) => setEditHomeAltitude(e.target.value)} placeholder="5280" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>Note: Email cannot be changed for security reasons</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowEditProfile(false)} style={{ flex: 1, padding: '0.75rem', background: 'white', color: '#6b7280', border: '2px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
