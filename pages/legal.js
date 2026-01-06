import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Legal() {
  const [activeTab, setActiveTab] = useState('privacy');
  const router = useRouter();

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
            <span style={{ fontSize: '2rem' }}>⛰️</span>
            <span>AltitudeReady</span>
          </div>
          
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'white',
              color: '#2563eb',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '2px solid #2563eb',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Back to Home
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#1f2937', textAlign: 'center' }}>
          Legal Information
        </h1>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'privacy' ? '#2563eb' : 'transparent',
              color: activeTab === 'privacy' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'privacy' ? '3px solid #2563eb' : '3px solid transparent',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            Privacy Policy
          </button>
          
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'terms' ? '#2563eb' : 'transparent',
              color: activeTab === 'terms' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'terms' ? '3px solid #2563eb' : '3px solid transparent',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            Terms of Service
          </button>
          
          <button
            onClick={() => setActiveTab('disclaimer')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'disclaimer' ? '#2563eb' : 'transparent',
              color: activeTab === 'disclaimer' ? 'white' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'disclaimer' ? '3px solid #2563eb' : '3px solid transparent',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'all 0.3s'
            }}
          >
            Medical Disclaimer
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'privacy' && <PrivacyPolicy />}
          {activeTab === 'terms' && <TermsOfService />}
          {activeTab === 'disclaimer' && <MedicalDisclaimer />}
        </div>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div style={{ lineHeight: 1.8, color: '#374151' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#1f2937' }}>Privacy Policy</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>
        <strong>Last Updated:</strong> January 6, 2026
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>1. Information We Collect</h3>
        <p style={{ marginBottom: '1rem' }}>
          We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Account information (email address, name, home city, home altitude)</li>
          <li>Trip information (destinations, dates, altitude data, activity levels)</li>
          <li>Usage data (how you interact with our service)</li>
          <li>Device and browser information</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>2. How We Use Your Information</h3>
        <p style={{ marginBottom: '1rem' }}>We use the information we collect to:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Provide, maintain, and improve our altitude acclimation planning services</li>
          <li>Generate personalized acclimation recommendations</li>
          <li>Send you service-related communications</li>
          <li>Respond to your questions and requests</li>
          <li>Monitor and analyze usage patterns to improve our service</li>
          <li>Protect against fraudulent or unauthorized use</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>3. Data Storage and Security</h3>
        <p style={{ marginBottom: '1rem' }}>
          Your data is stored securely using AWS (Amazon Web Services) infrastructure with industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>4. Information Sharing</h3>
        <p style={{ marginBottom: '1rem' }}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and prevent fraud</li>
          <li>With service providers who assist in operating our service (e.g., AWS, authentication services)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>5. Cookies and Tracking</h3>
        <p style={{ marginBottom: '1rem' }}>
          We use cookies and similar tracking technologies to enhance your experience. This includes:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Authentication cookies to keep you logged in</li>
          <li>Analytics to understand how you use our service</li>
          <li>Advertising cookies (Google AdSense) to display relevant ads to free users</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          You can control cookies through your browser settings, but some features may not function properly if you disable them.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>6. Your Rights</h3>
        <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          To exercise these rights, please contact us at privacy@altitudeready.com
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>7. Children's Privacy</h3>
        <p style={{ marginBottom: '1rem' }}>
          Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>8. Changes to This Policy</h3>
        <p style={{ marginBottom: '1rem' }}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>
      </section>

      <section>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>9. Contact Us</h3>
        <p style={{ marginBottom: '1rem' }}>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p style={{ marginBottom: '0.5rem' }}>Email: privacy@altitudeready.com</p>
        <p>Cloud City Technology LLC, Leadville, Colorado</p>
      </section>
    </div>
  );
}

function TermsOfService() {
  return (
    <div style={{ lineHeight: 1.8, color: '#374151' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#1f2937' }}>Terms of Service</h2>
      <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>
        <strong>Last Updated:</strong> January 6, 2026
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>1. Acceptance of Terms</h3>
        <p style={{ marginBottom: '1rem' }}>
          By accessing or using AltitudeReady ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>2. Description of Service</h3>
        <p style={{ marginBottom: '1rem' }}>
          AltitudeReady provides educational information and tools to help users plan for altitude acclimation. The Service includes:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Altitude acclimation calculators</li>
          <li>Trip planning and tracking tools</li>
          <li>Educational content about altitude sickness</li>
          <li>Personalized recommendations based on user input</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>3. User Accounts</h3>
        <p style={{ marginBottom: '1rem' }}>
          To use certain features, you must create an account. You are responsible for:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and complete information</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>4. Acceptable Use</h3>
        <p style={{ marginBottom: '1rem' }}>You agree not to:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Use the Service for any illegal purpose</li>
          <li>Attempt to gain unauthorized access to the Service</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Upload malicious code or content</li>
          <li>Scrape, spider, or harvest content without permission</li>
          <li>Use the Service to provide medical advice to others</li>
          <li>Misrepresent your affiliation with any person or entity</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>5. Subscription and Payments</h3>
        <p style={{ marginBottom: '1rem' }}>
          Certain features require a paid subscription. By subscribing, you agree to:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Pay all fees associated with your subscription</li>
          <li>Automatic renewal unless you cancel before the renewal date</li>
          <li>No refunds for partial subscription periods</li>
          <li>Price changes with 30 days notice</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>6. Intellectual Property</h3>
        <p style={{ marginBottom: '1rem' }}>
          The Service and its content are protected by copyright, trademark, and other intellectual property laws. You may not:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Copy, modify, or distribute our content without permission</li>
          <li>Use our trademarks without authorization</li>
          <li>Reverse engineer or attempt to extract source code</li>
          <li>Create derivative works based on the Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>7. Third-Party Links and Services</h3>
        <p style={{ marginBottom: '1rem' }}>
          The Service may contain links to third-party websites and services (e.g., affiliate links to outdoor gear retailers). We are not responsible for:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>The content or privacy practices of third-party sites</li>
          <li>Products or services offered by third parties</li>
          <li>Transactions between you and third-party vendors</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>8. Disclaimer of Warranties</h3>
        <p style={{ marginBottom: '1rem' }}>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>The Service will be uninterrupted or error-free</li>
          <li>The information provided is accurate or complete</li>
          <li>Defects will be corrected</li>
          <li>The Service is free of viruses or harmful components</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>9. Limitation of Liability</h3>
        <p style={{ marginBottom: '1rem' }}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Any indirect, incidental, or consequential damages</li>
          <li>Loss of profits, data, or business opportunities</li>
          <li>Personal injury or property damage related to your use of the Service</li>
          <li>Any damages exceeding the amount you paid us in the past 12 months</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>10. Indemnification</h3>
        <p style={{ marginBottom: '1rem' }}>
          You agree to indemnify and hold harmless AltitudeReady, Cloud City Technology LLC, and our affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>11. Termination</h3>
        <p style={{ marginBottom: '1rem' }}>
          We may terminate or suspend your account at any time for any reason, including violation of these Terms. Upon termination:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Your right to use the Service immediately ceases</li>
          <li>You remain liable for any outstanding fees</li>
          <li>We may delete your data after a reasonable period</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>12. Governing Law</h3>
        <p style={{ marginBottom: '1rem' }}>
          These Terms are governed by the laws of the State of Colorado, USA, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Lake County, Colorado.
        </p>
      </section>

      <section>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>13. Contact</h3>
        <p style={{ marginBottom: '1rem' }}>
          Questions about these Terms? Contact us at:
        </p>
        <p style={{ marginBottom: '0.5rem' }}>Email: legal@altitudeready.com</p>
        <p>Cloud City Technology LLC, Leadville, Colorado</p>
      </section>
    </div>
  );
}

function MedicalDisclaimer() {
  return (
    <div style={{ lineHeight: 1.8, color: '#374151' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#1f2937' }}>Medical Disclaimer</h2>
      
      <div style={{
        background: '#fee2e2',
        border: '2px solid #dc2626',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.3rem', color: '#991b1b', marginBottom: '1rem' }}>⚠️ IMPORTANT NOTICE</h3>
        <p style={{ color: '#7f1d1d', fontWeight: 600, fontSize: '1.1rem' }}>
          AltitudeReady is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before traveling to high altitudes.
        </p>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>1. Educational Purpose Only</h3>
        <p style={{ marginBottom: '1rem' }}>
          AltitudeReady provides educational information and general guidelines about altitude acclimation based on publicly available research and medical literature. The Service:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Is for informational and educational purposes only</li>
          <li>Does not constitute medical advice</li>
          <li>Should not be used as a substitute for professional medical consultation</li>
          <li>Cannot account for individual health conditions or circumstances</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>2. Individual Variation</h3>
        <p style={{ marginBottom: '1rem' }}>
          Altitude acclimation varies significantly between individuals based on many factors including:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Age and overall health status</li>
          <li>Pre-existing medical conditions</li>
          <li>Medications and supplements</li>
          <li>Genetics and prior altitude exposure</li>
          <li>Sleep quality and hydration status</li>
          <li>Physical fitness level</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          Our recommendations are general guidelines and may not be appropriate for your specific situation.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>3. Consult Healthcare Providers</h3>
        <p style={{ marginBottom: '1rem' }}>
          You should consult with a qualified healthcare provider before traveling to high altitude if you:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Have cardiovascular disease or heart conditions</li>
          <li>Have respiratory conditions (asthma, COPD, etc.)</li>
          <li>Are pregnant or planning to become pregnant</li>
          <li>Have a history of altitude sickness</li>
          <li>Take prescription medications</li>
          <li>Have diabetes or other chronic conditions</li>
          <li>Are over 60 years of age</li>
          <li>Plan to engage in strenuous activity at altitude</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>4. Medication Information</h3>
        <p style={{ marginBottom: '1rem' }}>
          Any information about medications (such as acetazolamide/Diamox, dexamethasone, or nifedipine):
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Is for informational purposes only</li>
          <li>Requires a prescription from a licensed healthcare provider</li>
          <li>May have contraindications or side effects</li>
          <li>Should only be used under medical supervision</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          Never take prescription medications without consulting your doctor first.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>5. Emergency Medical Care</h3>
        <p style={{ marginBottom: '1rem' }}>
          Altitude sickness can be life-threatening. Seek immediate medical attention if you experience:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Severe headache unrelieved by medication</li>
          <li>Confusion or altered mental status</li>
          <li>Loss of coordination or difficulty walking</li>
          <li>Shortness of breath at rest</li>
          <li>Coughing up pink or frothy fluid</li>
          <li>Blue lips or fingernails</li>
        </ul>
        <p style={{ marginBottom: '1rem', fontWeight: 600, color: '#dc2626' }}>
          Call emergency services (911 in the US) immediately if you or someone with you experiences these symptoms.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>6. No Doctor-Patient Relationship</h3>
        <p style={{ marginBottom: '1rem' }}>
          Use of AltitudeReady does not create a doctor-patient relationship. We are not your healthcare providers and cannot:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Diagnose medical conditions</li>
          <li>Prescribe medications</li>
          <li>Provide personalized medical advice</li>
          <li>Replace consultation with qualified medical professionals</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>7. Accuracy of Information</h3>
        <p style={{ marginBottom: '1rem' }}>
          While we strive to provide accurate and up-to-date information:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Medical research and guidelines evolve over time</li>
          <li>Information may become outdated</li>
          <li>Errors or omissions may occur</li>
          <li>Individual circumstances may require different approaches</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          Always verify information with current medical literature and your healthcare provider.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>8. Assumption of Risk</h3>
        <p style={{ marginBottom: '1rem' }}>
          By using AltitudeReady, you acknowledge that:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Travel to high altitude carries inherent risks</li>
          <li>You are responsible for your own health and safety decisions</li>
          <li>You will seek appropriate medical care when needed</li>
          <li>You will not rely solely on our Service for medical decisions</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>9. International Users</h3>
        <p style={{ marginBottom: '1rem' }}>
          Medical guidelines and emergency protocols vary by country. Information provided may be based on US medical standards. Always familiarize yourself with local medical resources and emergency services at your destination.
        </p>
      </section>

      <section>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>10. Sources and References</h3>
        <p style={{ marginBottom: '1rem' }}>
          Our recommendations are based on publicly available medical literature, including:
        </p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>CDC Travel Health Guidelines</li>
          <li>Wilderness Medical Society Clinical Practice Guidelines</li>
          <li>Published peer-reviewed research on altitude medicine</li>
          <li>Recommendations from altitude medicine specialists</li>
        </ul>
        <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
          Last reviewed by medical literature: January 2026
        </p>
      </section>
    </div>
  );
}
