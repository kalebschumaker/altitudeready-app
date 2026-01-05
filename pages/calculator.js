import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/router';

export default function Calculator() {
  const [user, setUser] = useState(null);
  const [homeAlt, setHomeAlt] = useState('');
  const [destAlt, setDestAlt] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [result, setResult] = useState(null);
  const router = useRouter();

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

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1rem 2rem'
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
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user ? (
              <>
                <span style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>
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
                    cursor: 'pointer'
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
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Calculator */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3rem', color: '#2563eb', marginBottom: '10px' }}>Acclimation Calculator</h1>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Calculate your personalized altitude acclimation plan</p>
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
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '12px' }}>
              <p style={{ margin: 0 }}><strong>Full Intensity Ready:</strong> Day {result.fullIntensity}</p>
            </div>
            
            {!user && (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0' }}>Want to save your plans and track your progress?</p>
                <button
                  onClick={() => router.push('/signin')}
                  style={{
                    background: 'white',
                    color: '#2563eb',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create Free Account
                </button>
              </div>
            )}
          </div>
        )}
        
        <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280' }}>
          <p>Made with ❤️ at 10,152 feet in Leadville, Colorado</p>
        </div>
      </div>
    </div>
  );
}
