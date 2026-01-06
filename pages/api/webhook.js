import Stripe from 'stripe';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Disable body parsing, need raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutComplete(session) {
  const userId = session.metadata.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  let subscriptionTier = 'pro';
  let subscriptionStatus = 'active';

  // If it's a one-time payment (lifetime), no subscription ID
  if (!subscriptionId) {
    subscriptionTier = 'lifetime';
  }

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

  console.log(`Updated user ${userId} to ${subscriptionTier}`);
}

async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata.userId;
  const status = subscription.status; // active, canceled, past_due, etc.

  await docClient.send(new UpdateCommand({
    TableName: 'AltitudeReady-Users',
    Key: { userId },
    UpdateExpression: 'set subscriptionStatus = :status, updatedAt = :updated',
    ExpressionAttributeValues: {
      ':status': status,
      ':updated': new Date().toISOString()
    }
  }));

  console.log(`Updated subscription status for user ${userId} to ${status}`);
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  // You could send an email notification here
  console.log(`Payment failed for customer ${customerId}`);
}
