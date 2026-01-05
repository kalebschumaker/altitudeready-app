import { useRouter } from 'next/router';
import Auth from '../components/Auth';

export default function SignInPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', paddingTop: '40px', color: 'white' }}>
        <div 
          onClick={() => router.push('/')}
          style={{ 
            display: 'inline-block',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>⛰️ AltitudeReady</h1>
        </div>
        <p style={{ fontSize: '1.2rem' }}>Smart Acclimation for Mountain Athletes</p>
      </div>
      <Auth onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}
