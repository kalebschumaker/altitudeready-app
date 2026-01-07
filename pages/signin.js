import { useRouter } from 'next/router';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import Auth from '../components/Auth';
import { createUserProfile } from '../lib/api';
import { searchLocations, getElevation } from '../lib/cityElevations';

export default function SignInPage() {
  const router = useRouter();

  const handleAuthSuccess = async (userData) => {
    try {
      // If userData is provided (new signup), create profile
      if (userData) {
        try {
          const session = await fetchAuthSession();
          const userId = session.tokens?.idToken?.payload?.sub;
          
          if (userId) {
            await createUserProfile({
              userId,
              email: userData.email,
              name: userData.name,
              homeCity: userData.homeCity,
              homeAltitude: userData.homeAltitude
            });
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
        }
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Auth success error:', error);
      // If there's an error, try signing out and redirecting
      await signOut();
      router.push('/signin');
    }
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
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '10px' }}>⛰️ AltitudeReady</h1>
        </div>
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Smart Acclimation for Mountain Athletes</p>
      </div>
      <Auth onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}
