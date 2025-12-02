/**
 * Express Backend Server
 * Handles auth, billing, API endpoints
 *
 * Run with: NODE_ENV=development npx tsx server/app.ts
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createCheckoutSession, handleWebhookEvent, verifyWebhookSignature, PRODUCTS } from './stripe.js';
import { createTrialAccount, getTrialAccount, consumeTrialCredit, hasTrialCredits } from './trial-credits.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// ============================================================================
// Auth Endpoints
// ============================================================================

/**
 * POST /api/auth/signup
 * Sign up new user and create trial account
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // TODO: Create user in database
    const userId = `user_${Date.now()}`;

    // Create trial account
    const trial = await createTrialAccount(userId, email);

    return res.json({
      success: true,
      userId,
      trial: {
        creditsRemaining: trial.creditsRemaining,
        expiresAt: trial.expiresAt,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user (placeholder)
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // TODO: Validate credentials and return JWT
    const token = Buffer.from(email).toString('base64');

    return res.json({
      success: true,
      token,
      email,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================================================
// Trial & Usage Endpoints
// ============================================================================

/**
 * GET /api/trial/:userId
 * Get trial account status
 */
app.get('/api/trial/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const trial = await getTrialAccount(userId);

    if (!trial) {
      return res.json({
        hasTrialCredits: false,
        creditsRemaining: 0,
      });
    }

    return res.json({
      hasTrialCredits: trial.creditsRemaining > 0,
      creditsRemaining: trial.creditsRemaining,
      runsCompleted: trial.runsCompleted,
      expiresAt: trial.expiresAt,
    });
  } catch (err) {
    console.error('Trial check error:', err);
    return res.status(500).json({ error: 'Failed to check trial' });
  }
});

/**
 * POST /api/trial/:userId/consume
 * Consume a trial credit (called before running paid feature)
 */
app.post('/api/trial/:userId/consume', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const consumed = await consumeTrialCredit(userId);

    return res.json({
      success: consumed,
      message: consumed ? 'Trial credit consumed' : 'No trial credits available',
    });
  } catch (err) {
    console.error('Consume error:', err);
    return res.status(500).json({ error: 'Failed to consume credit' });
  }
});

// ============================================================================
// Billing Endpoints
// ============================================================================

/**
 * POST /api/billing/checkout
 * Create Stripe checkout session
 */
app.post('/api/billing/checkout', async (req: Request, res: Response) => {
  try {
    const { plan, email, successUrl, cancelUrl } = req.body;

    if (!plan || !email) {
      return res.status(400).json({ error: 'Plan and email required' });
    }

    const product = PRODUCTS[plan as keyof typeof PRODUCTS];
    if (!product) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await createCheckoutSession({
      priceId: product.priceId,
      email,
      successUrl: successUrl || `${process.env.FRONTEND_URL}/billing/success`,
      cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/pricing`,
    });

    return res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.sessionId,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
});

// ============================================================================
// Webhook Endpoints
// ============================================================================

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const body = (req as any).rawBody || req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const event = verifyWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');

    if (!event) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle the event
    await handleWebhookEvent(event);

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Webhook failed' });
  }
});

// ============================================================================
// Health Check
// ============================================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 Horizon Brand Builder Backend`);
  console.log(`📍 Server running at http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/auth/signup`);
  console.log(`  POST /api/auth/login`);
  console.log(`  GET  /api/trial/:userId`);
  console.log(`  POST /api/trial/:userId/consume`);
  console.log(`  POST /api/billing/checkout`);
  console.log(`  POST /api/webhooks/stripe`);
  console.log(`  GET  /health\n`);
});

export default app;
