/**
 * Stripe Billing Integration
 * Handles subscriptions, checkout sessions, and webhooks
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
});

export const PRODUCTS = {
  pro: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
    amount: 9900, // $99/month in cents
    description: '500k tokens, 50 runs/month, all features',
  },
  agency: {
    name: 'Agency Plan',
    priceId: process.env.STRIPE_PRICE_AGENCY || 'price_agency_placeholder',
    amount: 49900, // $499/month
    description: '2M tokens, 500 runs/month, team features',
  },
};

/**
 * Create checkout session for new subscription
 */
export async function createCheckoutSession(args: {
  priceId: string;
  customerId?: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string | null; sessionId: string }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: args.customerId ? undefined : args.email,
    customer: args.customerId,
    line_items: [
      {
        price: args.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
  });

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    console.error('Failed to retrieve subscription:', err);
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    return true;
  } catch (err) {
    console.error('Failed to cancel subscription:', err);
    return false;
  }
}

/**
 * Handle webhook event (payment_intent.succeeded, customer.subscription.updated, etc.)
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`✅ Checkout completed. Session: ${session.id}`);
      // TODO: Update user subscription status in DB
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`✅ Subscription updated. ID: ${subscription.id}`);
      // TODO: Update subscription details in DB
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`✅ Subscription deleted. ID: ${subscription.id}`);
      // TODO: Downgrade user to free tier
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`✅ Invoice paid. ID: ${invoice.id}`);
      // TODO: Send receipt email
      break;
    }
    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}
