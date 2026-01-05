import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      router.push('/signin');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' }}>
            Welcome back! 👋
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
            {user.signInDetails?.loginId || 'User'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>
              📊 My Plans
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Your saved acclimation plans will appear here.
            </p>
            <button
              onClick={() => router.push('/calculator')}
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Create New Plan
            </button>
          </div>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>
              ⚙️ Settings
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Manage your profile and preferences.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Coming soon...
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>
              🎯 Upgrade
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Get Pro or Athlete features for advanced tracking.
            </p>
            <button
              onClick={() => router.push('/#pricing')}
              style={{
                background: 'white',
                color: '#2563eb',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #2563eb',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
