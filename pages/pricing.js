import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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

const handleCheckout = async (priceId, planName) => {
  console.log('=== CHECKOUT DEBUG ===');
  console.log('User object:', user);
  console.log('Price ID:', priceId);
  console.log('Plan name:', planName);
  
  setLoading(true);

  try {
    let userId = null;
    let userEmail = null;

    // Check if user is logged in
    if (user) {
      console.log('User is logged in');
      userId = user.userId;
      userEmail = user.signInDetails?.loginId;
    } else {
      console.log('User is NOT logged in - proceeding with guest checkout');
    }

    console.log('Calling API with:', { priceId, userId, userEmail });

    // Create checkout session (works for both logged in and guest users)
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceId,
        userId: userId,
        userEmail: userEmail,
      }),
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);

    if (data.url) {
      console.log('Redirecting to Stripe:', data.url);
      window.location.href = data.url;
    } else {
      console.error('No URL returned from API');
      alert('Error: No checkout URL received');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Error creating checkout session: ' + error.message);
    setLoading(false);
  }
};

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'Forever',
      priceId: null,
      features: ['Basic acclimation calculator', 'General altitude tips', '1 Trip', 'Activity intensity guidance'],
    },
    {
      name: 'Pro Monthly',
      price: '$0.99',
      period: 'per month',
      priceId: 'price_1SmhGbBuBTWWyHXeBZKuwYbS', // Replace with your actual Price ID
      features: ['Everything in Free', 'Unlimited Trips', 'Remove Ads', 'Priority Support'],
    },
    {
      name: 'Lifetime',
      price: '$10.00',
      period: 'one-time',
      priceId: 'price_1SmhHEBuBTWWyHXeHyqMbamU', // Replace with your actual Price ID
      features: ['Everything in Pro', 'Lifetime Access', 'All Future Features', 'VIP Support'],
    },
  ];

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
            <img 
              src="/logo_notext.png" 
              alt="AltitudeReady Logo" 
              style={{ 
                width: 'clamp(50px, 8vw, 70px)', 
                height: 'clamp(50px, 8vw, 70px)',
                objectFit: 'contain'
              }} 
            />
            <span>AltitudeReady</span>
          </div>
          
          <button
            onClick={() => router.push(user ? '/dashboard' : '/auth/signin')}
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
            {user ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Pricing Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem', color: '#1f2937' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: '#6b7280' }}>
            Choose the plan that fits your mountain lifestyle
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                border: plan.featured ? '3px solid #2563eb' : '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#f59e0b',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {plan.badge}
                </div>
              )}
              
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>{plan.name}</h3>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.5rem' }}>
                {plan.price}
              </div>
              <div style={{ color: '#6b7280', marginBottom: '2rem' }}>{plan.period}</div>
              
              <ul style={{ listStyle: 'none', marginBottom: '2rem', textAlign: 'left', padding: 0, flexGrow: 1 }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 700, marginRight: '0.5rem' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => plan.priceId ? handleCheckout(plan.priceId, plan.name) : router.push('/auth/signin')}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: plan.featured ? '#2563eb' : 'white',
                  color: plan.featured ? 'white' : '#2563eb',
                  border: `2px solid #2563eb`,
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Processing...' : (plan.price === '$0' ? 'Get Started Free' : 'Subscribe Now')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
