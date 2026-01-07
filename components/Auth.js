import { useState, useEffect, useRef } from 'react';
import { signIn, signUp, signOut, confirmSignUp, fetchAuthSession } from 'aws-amplify/auth';
import { searchLocations, getElevation } from '../lib/cityElevations';
import { useRouter } from 'next/router';

export default function Auth({ onAuthSuccess }) {
  const router = useRouter();
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homeAltitude, setHomeAltitude] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const citySearchTimerRef = useRef(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);

  // Check for ?mode=login URL parameter
  useEffect(() => {
    if (router.query.mode === 'login') {
      setMode('signin');
    }
  }, [router.query.mode]);

  const handleCitySearch = (value) => {
    setHomeCity(value);
    
    if (citySearchTimerRef.current) {
      clearTimeout(citySearchTimerRef.current);
    }
    
    if (value.length < 3) {
      setCitySearchResults([]);
      return;
    }
    
    setCitySearchLoading(true);
    
    citySearchTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      setCitySearchResults(results.slice(0, 5));
      setCitySearchLoading(false);
    }, 400);
  };

  const handleCitySelect = async (location) => {
    setHomeCity(location.displayName);
    setCitySearchResults([]);
    setCitySearchLoading(true);
    
    const elevation = await getElevation(location.lat, location.lon);
    if (elevation) {
      setHomeAltitude(elevation.toString());
    }
    setCitySearchLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: name
          }
        }
      });
      
      setTempUserData({ email, name, homeCity, homeAltitude });
      setMode('confirm');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode
      });
      
      await signIn({ username: email, password: password });
      onAuthSuccess(tempUserData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          onAuthSuccess();
          return;
        }
      } catch (err) {
        // No existing session, continue with sign in
      }

      await signIn({ username: email, password: password });
      onAuthSuccess();
    } catch (err) {
      if (err.message.includes('already a signed in user')) {
        try {
          await signOut();
          await signIn({ username: email, password: password });
          onAuthSuccess();
        } catch (retryErr) {
          setError(retryErr.message);
          setLoading(false);
        }
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '50px auto',
      padding: 'clamp(1.5rem, 4vw, 2rem)',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    input: {
      width: '100%',
      padding: 'clamp(10px, 2vw, 12px)',
      marginBottom: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: 'clamp(12px, 3vw, 14px)',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px'
    },
    secondaryButton: {
      width: '100%',
      padding: 'clamp(12px, 3vw, 14px)',
      background: 'white',
      color: '#2563eb',
      border: '2px solid #2563eb',
      borderRadius: '8px',
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px'
    },
    error: {
      padding: '12px',
      background: '#fee2e2',
      color: '#991b1b',
      borderRadius: '8px',
      marginBottom: '15px',
      fontSize: 'clamp(0.85rem, 2vw, 0.9rem)'
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '2px solid #2563eb',
      borderRadius: '8px',
      marginTop: '4px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 10,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    suggestionItem: {
      padding: '12px',
      cursor: 'pointer',
      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
      borderBottom: '1px solid #e5e7eb'
    }
  };

  if (mode === 'confirm') {
    return (
      <div style={styles.container}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: 'clamp(1.3rem, 4vw, 1.5rem)' }}>Confirm Your Email</h2>
        <p style={{ marginBottom: '20px', color: '#6b7280', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          We sent a confirmation code to {email}
        </p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleConfirmSignUp}>
          <input
            type="text"
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm Email'}
          </button>
        </form>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div style={styles.container}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: 'clamp(1.3rem, 4vw, 1.5rem)' }}>Create Account</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            minLength={8}
          />
          
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Home City (type at least 3 characters)"
              value={homeCity}
              onChange={(e) => handleCitySearch(e.target.value)}
              style={styles.input}
              required
            />
            
            {citySearchLoading && (
              <div style={{ padding: '10px', fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                Searching...
              </div>
            )}
            
            {citySearchResults.length > 0 && !citySearchLoading && (
              <div style={styles.suggestions}>
                {citySearchResults.map((location, i) => (
                  <div
                    key={i}
                    onClick={() => handleCitySelect(location)}
                    style={styles.suggestionItem}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    📍 {location.displayName}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <input
            type="number"
            placeholder="Home Altitude (feet)"
            value={homeAltitude}
            onChange={(e) => setHomeAltitude(e.target.value)}
            style={styles.input}
            required
          />
          <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', color: '#6b7280', marginTop: '-10px', marginBottom: '15px' }}>
            💡 Start typing your city above - we'll auto-fill the altitude
          </p>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => setMode('signin')}
          >
            Already have an account? Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center', fontSize: 'clamp(1.3rem, 4vw, 1.5rem)' }}>Sign In</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => setMode('signup')}
        >
          Don't have an account? Sign Up
        </button>
      </form>
    </div>
  );
}
