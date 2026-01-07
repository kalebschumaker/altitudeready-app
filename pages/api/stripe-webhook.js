import Stripe from 'stripe';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Disable body parsing - we need the raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('✅ Webhook verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// Handle successful checkout
async function handleCheckoutComplete(session) {
  console.log('💳 Checkout completed:', session.id);
  
  const userId = session.metadata?.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.log('⚠️ No userId in metadata - skipping user update');
    return;
  }

  let subscriptionTier = 'pro';
  let subscriptionStatus = 'active';

  // If no subscription ID, it's a one-time payment (lifetime)
  if (!subscriptionId) {
    subscriptionTier = 'lifetime';
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: 'AltitudeReady-Users',
      Key: { userId },
      UpdateExpression: 'set subscriptionTier = :tier, stripeCustomerId = :customerId, stripeSubscriptionId = :subId, subscriptionStatus = :status, updatedAt = :updated',
      ExpressionAttributeValues: {
        ':tier': subscriptionTier,
        ':customerId': customerId,
        ':subId': subscriptionId || 'lifetime',
        ':status': subscriptionStatus,
        ':updated': new Date().toISOString()
      }
    }));

    console.log(`✅ Updated user ${userId} to ${subscriptionTier}`);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

// Handle subscription updates (status changes, plan changes)
async function handleSubscriptionUpdate(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  const status = subscription.status; // active, canceled, past_due, etc.

  if (!userId) {
    console.log('⚠️ No userId in subscription metadata');
    return;
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: 'AltitudeReady-Users',
      Key: { userId },
      UpdateExpression: 'set subscriptionStatus = :status, updatedAt = :updated',
      ExpressionAttributeValues: {
        ':status': status,
        ':updated': new Date().toISOString()
      }
    }));

    console.log(`✅ Updated subscription status for user ${userId} to ${status}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.log('⚠️ No userId in subscription metadata');
    return;
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: 'AltitudeReady-Users',
      Key: { userId },
      UpdateExpression: 'set subscriptionStatus = :status, subscriptionTier = :tier, updatedAt = :updated',
      ExpressionAttributeValues: {
        ':status': 'canceled',
        ':tier': 'free',
        ':updated': new Date().toISOString()
      }
    }));

    console.log(`✅ Downgraded user ${userId} to free tier`);
  } catch (error) {
    console.error('Error canceling subscription:', error);
  }
}

// Handle successful payment (renewal)
async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded:', invoice.id);
  
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    console.log('Not a subscription payment, skipping');
    return;
  }

  // Get subscription to find userId
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (userId) {
      await docClient.send(new UpdateCommand({
        TableName: 'AltitudeReady-Users',
        Key: { userId },
        UpdateExpression: 'set subscriptionStatus = :status, updatedAt = :updated',
        ExpressionAttributeValues: {
          ':status': 'active',
          ':updated': new Date().toISOString()
        }
      }));

      console.log(`✅ Renewed subscription for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  console.log('⚠️ Payment failed:', invoice.id);
  
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (userId) {
      await docClient.send(new UpdateCommand({
        TableName: 'AltitudeReady-Users',
        Key: { userId },
        UpdateExpression: 'set subscriptionStatus = :status, updatedAt = :updated',
        ExpressionAttributeValues: {
          ':status': 'past_due',
          ':updated': new Date().toISOString()
        }
      }));

      console.log(`⚠️ Marked user ${userId} subscription as past_due`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
