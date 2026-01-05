import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import Auth from '../components/Auth';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [homeAlt, setHomeAlt] = useState('');
  const [destAlt, setDestAlt] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [result, setResult] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const calculatePlan = async (e) => {
    e.preventDefault();
    
    const altChange = parseInt(destAlt) - parseInt(homeAlt);
    const baseDays = Math.max(1, Math.floor(altChange / 1000));
    const multipliers = { light: 0.7, moderate: 1.0, intense: 1.3, extreme: 1.6 };
    const recDays = Math.ceil(baseDays * multipliers[activityLevel]);
    
    setResult({
      altitudeChange: altChange,
      recommendedDays: recDays,
      firstActivity: Math.max(1, Math.ceil(recDays * 0.3)),
      fullIntensity: Math.max(2, recDays)
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ textAlign: 'center', paddingTop: '40px', color: 'white' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>⛰️ AltitudeReady</h1>
          <p style={{ fontSize: '1.2rem' }}>Smart Acclimation for Mountain Athletes</p>
        </div>
        <Auth onAuthSuccess={checkUser} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{ fontSize: '3rem', color: '#2563eb', marginBottom: '10px' }}>⛰️ AltitudeReady</h1>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Welcome, {user.signInDetails?.loginId || 'User'}!</p>
        </div>
        <button 
          onClick={handleSignOut}
          style={{
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #2563eb',
            color: '#2563eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Sign Out
        </button>
      </div>

      <form onSubmit={calculatePlan} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937' }}>
            Home Altitude (feet)
          </label>
          <input 
            type="number" 
            value={homeAlt}
            onChange={(e) => setHomeAlt(e.target.value)}
            required
            placeholder="e.g., 500"
            style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937' }}>
            Destination Altitude (feet)
          </label>
          <input 
            type="number" 
            value={destAlt}
            onChange={(e) => setDestAlt(e.target.value)}
            required
            placeholder="e.g., 10000"
            style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937' }}>
            Activity Level
          </label>
          <select 
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
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
            padding: '14px', 
            background: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            cursor: 'pointer' 
          }}
        >
          Calculate My Plan
        </button>
      </form>
      
      {result && (
        <div style={{ 
          marginTop: '30px', 
          padding: '30px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.8rem' }}>Your Acclimation Plan</h2>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '12px' }}>
            <p style={{ margin: 0 }}><strong>Altitude Change:</strong> {result.altitudeChange.toLocaleString()} feet</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '12px' }}>
            <p style={{ margin: 0 }}><strong>Recommended Acclimation:</strong> {result.recommendedDays} days</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '12px' }}>
            <p style={{ margin: 0 }}><strong>Start Light Activities:</strong> Day {result.firstActivity}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px' }}>
            <p style={{ margin: 0 }}><strong>Full Intensity Ready:</strong> Day {result.fullIntensity}</p>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280' }}>
        <p>Made with ❤️ at 10,152 feet in Leadville, Colorado</p>
      </div>
    </div>
  );
}
