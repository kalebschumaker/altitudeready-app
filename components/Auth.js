import { useState } from 'react';
import { signIn, signUp, signOut, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'confirm'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Auto sign in after confirmation
      await signIn({ username: email, password: password });
      onAuthSuccess();
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
      await signIn({ username: email, password: password });
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem'
    },
    button: {
      width: '100%',
      padding: '14px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px'
    },
    secondaryButton: {
      width: '100%',
      padding: '14px',
      background: 'white',
      color: '#2563eb',
      border: '2px solid #2563eb',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px'
    },
    error: {
      padding: '12px',
      background: '#fee2e2',
      color: '#991b1b',
      borderRadius: '8px',
      marginBottom: '15px'
    }
  };

  if (mode === 'confirm') {
    return (
      <div style={styles.container}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Confirm Your Email</h2>
        <p style={{ marginBottom: '20px', color: '#6b7280' }}>
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
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Account</h2>
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
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Sign In</h2>
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
