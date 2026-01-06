<meta name="google-adsense-account" content="ca-pub-2012944210056553">
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/router';

export default function Landing() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000
      }}>
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
          onClick={() => router.push('/')}>
            <span style={{ fontSize: '2rem' }}>⛰️</span>
            <span>AltitudeReady</span>
          </div>
          
          {/* Desktop Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            alignItems: 'center'
          }}
          className="desktop-nav">
            <a href="#features" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500 }}>Features</a>
            <a href="#how-it-works" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500 }}>How It Works</a>
            <a href="#pricing" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500 }}>Pricing</a>
            <a href="/calculator" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500 }}>Calculator</a>
            {user ? (
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
            ) : (
              <button
                onClick={() => router.push('/signin')}
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
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'none'
            }}
            className="mobile-menu-btn"
          >
            ☰
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '1rem 2rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>Pricing</a>
              <a href="/calculator" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, padding: '0.5rem 0' }}>Calculator</a>
              {user ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/dashboard'); }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/signin'); }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section style={{
        marginTop: '80px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
            Acclimate Smarter. Perform Better.
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', marginBottom: '2rem', opacity: 0.95 }}>
            Personalized altitude acclimation plans for mountain athletes, travelers, and adventurers. Science-backed guidance to help you thrive at elevation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/calculator')}
              style={{
                background: 'white',
                color: '#2563eb',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Try Calculator
            </button>
<button
  onClick={() => {
    router.push('/signin');
    // This will be handled by the Auth component defaulting to signup mode
  }}
  style={{
    background: 'transparent',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: '2px solid white',
    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
    fontWeight: 600,
    cursor: 'pointer'
  }}
>
  Sign Up Free
</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto 4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>
            Everything You Need to Thrive at Altitude
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: '#6b7280' }}>
            Science-backed features designed to help you acclimate safely and perform at your best
          </p>
        </div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { icon: '📊', title: 'Personalized Plans', desc: 'Custom acclimation timelines based on your home altitude, destination, fitness level, and planned activities.' },
            { icon: '🎯', title: 'Activity Guidance', desc: 'Receive daily recommendations for exercise intensity, pace adjustments, and duration limits as you acclimate.' },
            { icon: '💧', title: 'Hydration & Nutrition', desc: 'Calculate precise fluid and calorie needs based on your altitude and activity level throughout the day.' },
            { icon: '🏔️', title: 'Multi-Location Trips', desc: 'Optimize itineraries hitting multiple elevations to maintain acclimation without over-stressing your body.' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
              <p style={{ color: '#6b7280' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '5rem 2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto 4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>How It Works</h2>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: '#6b7280' }}>Get altitude-ready in four simple steps</p>
        </div>
        
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '3rem' }}>
          {[
            { num: '1', title: 'Enter Your Details', desc: 'Tell us your home altitude, destination, arrival date, and what activities you\'re planning.' },
            { num: '2', title: 'Get Your Custom Plan', desc: 'Receive a personalized day-by-day acclimation schedule with specific activity recommendations.' },
            { num: '3', title: 'Track Your Progress', desc: 'Log symptoms, monitor vital signs, and track sleep quality with smart alerts.' },
            { num: '4', title: 'Perform Your Best', desc: 'Follow your personalized guidance to acclimate safely and reach full performance capacity.' }
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '2rem', alignItems: 'start' }} className="step-container">
              <div style={{
                background: '#2563eb',
                color: 'white',
                width: '60px',
                height: '60px',
                minWidth: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}>
                {step.num}
              </div>
              <div>
                <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing - 2 TIERS ONLY */}
      <section id="pricing" style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto 4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: '#6b7280' }}>Choose the plan that fits your mountain lifestyle</p>
        </div>
        
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'Forever',
              features: ['Basic acclimation calculator', 'Symptom tracker', 'General altitude tips']
            },
            {
              name: 'Pro',
              price: '$0.99',
              period: 'per month',
              featured: true,
              features: ['Personalized acclimation plans', 'Real-time symptom monitoring', 'Activity intensity guidance', 'Hydration & nutrition calculator', 'SpO2 & heart rate integration', 'Multi-location trip planning', 'Remove ads']
            }
          ].map((plan, i) => (
            <div key={i} style={{
              background: 'white',
              border: plan.featured ? '3px solid #2563eb' : '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              position: 'relative'
            }}>
              {plan.featured && (
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
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.5rem)', marginBottom: '1rem' }}>{plan.name}</h3>
              <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: 700, color: '#2563eb', marginBottom: '0.5rem' }}>
                {plan.price}
              </div>
              <div style={{ color: '#6b7280', marginBottom: '2rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{plan.period}</div>
              <ul style={{ listStyle: 'none', marginBottom: '2rem', textAlign: 'left', padding: 0 }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 700, marginRight: '0.5rem' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push('/signin')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: plan.featured ? '#2563eb' : 'white',
                  color: plan.featured ? 'white' : '#2563eb',
                  border: `2px solid #2563eb`,
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                }}
              >
                {plan.price === '$0' ? 'Get Started' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>Ready to Conquer the Mountains?</h2>
        <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', marginBottom: '2rem', opacity: 0.95 }}>
          Join other athletes and adventurers who trust AltitudeReady for their high-altitude pursuits.
        </p>
        <button
          onClick={() => router.push('/calculator')}
          style={{
            background: 'white',
            color: '#2563eb',
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Try Calculator Now
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1f2937', color: 'white', padding: '3rem 2rem 1rem' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Product</h4>
            <div style={{ marginBottom: '0.5rem' }}><a href="#features" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Features</a></div>
            <div style={{ marginBottom: '0.5rem' }}><a href="#pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Pricing</a></div>
            <div><a href="/calculator" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Calculator</a></div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Company</h4>
            <div style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>About Us</a></div>
            <div><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Contact</a></div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Legal</h4>
            <div style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Privacy Policy</a></div>
            <div style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Terms of Service</a></div>
            <div><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Medical Disclaimer</a></div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 'clamp(0.8rem, 2vw, 1rem)'
        }}>
          <p>&copy; 2026 AltitudeReady. All rights reserved. Made with ❤️ at 10,152 feet.</p>
        </div>
      </footer>
    </div>
  );
}
