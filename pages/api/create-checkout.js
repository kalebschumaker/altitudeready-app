import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, userEmail } = req.body;

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

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
