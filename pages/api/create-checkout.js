import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug logging
  console.log('=== API ROUTE DEBUG ===');
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('STRIPE_SECRET_KEY first 7 chars:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));
  
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error: Missing STRIPE_SECRET_KEY' 
    });
  }

  try {
    const { priceId, userId, userEmail } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    console.log('Request body:', req.body);

    // Determine if it's a subscription or one-time payment
    const isSubscription = priceId.includes('month') || priceId.includes('year');

    // Base session config
    const sessionConfig = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
    };

    // Add user email if provided
    if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    // Add metadata if user is logged in
    if (userId) {
      sessionConfig.metadata = {
        userId: userId,
      };

      // Add subscription metadata for recurring payments
      if (isSubscription) {
        sessionConfig.subscription_data = {
          metadata: {
            userId: userId,
          },
        };
      }
    }

    console.log('Creating Stripe session with config:', sessionConfig);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created:', session.id);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
