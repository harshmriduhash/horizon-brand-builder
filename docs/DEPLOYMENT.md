# Deployment Guide

Deploy Horizon Brand Builder SaaS in 30 minutes using Vercel + Render.

## Prerequisites

- GitHub account (for code)
- Stripe account (for payments)
- Supabase account (for database)
- Vercel account (for frontend)
- Render account (for backend)

## Step 1: Prepare Environment Variables

Create `.env.production` with:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_AGENCY=price_xxxxx

# Database (Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx

# LLM
ANTHROPIC_API_KEY=sk-ant-xxxxx

# URLs
FRONTEND_URL=https://horizon-brand-builder.app
API_URL=https://api.horizon-brand-builder.app

# Auth
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
```

## Step 2: Deploy Backend (Render)

1. Go to https://render.com
2. Connect GitHub repo
3. Create New → Web Service
4. Configure:
   - Name: `horizon-brand-builder-api`
   - Region: us-east
   - Branch: main
   - Build Command: `npm install`
   - Start Command: `npx tsx server/app.ts`
   - Environment: Add all env vars from `.env.production`
5. Deploy

Backend URL: `https://horizon-brand-builder-api.onrender.com`

## Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Connect GitHub repo
3. Create Project
4. Configure:
   - Framework: None (static HTML)
   - Build Command: `npm run build` (if applicable)
   - Output Directory: `public`
5. Environment Variables:
   - API_URL: `https://horizon-brand-builder-api.onrender.com`
6. Deploy

Frontend URL: `https://horizon-brand-builder.app`

## Step 4: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add Endpoint:
   - URL: `https://horizon-brand-builder-api.onrender.com/api/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
3. Copy webhook secret to STRIPE_WEBHOOK_SECRET

## Step 5: Verify Deployment

```bash
# Test backend
curl https://horizon-brand-builder-api.onrender.com/health

# Test signup flow
curl -X POST https://horizon-brand-builder-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test Stripe checkout
curl -X POST https://horizon-brand-builder-api.onrender.com/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro","email":"test@example.com","successUrl":"https://example.com/success","cancelUrl":"https://example.com/cancel"}'
```

## Maintenance

### Monthly Tasks

- Monitor Stripe transactions
- Review usage metrics
- Check error logs (Render dashboard)
- Backup database (Supabase)

### Scaling

If traffic increases:
- Upgrade Render plan
- Enable Vercel analytics
- Add database connection pooling (Supabase)
- Set up CDN caching

## Cost Estimate

- Render: $7/month (starter)
- Vercel: Free (hobby) or $20/month (pro)
- Supabase: $25/month (free tier may work)
- Stripe: 2.9% + $0.30 per transaction
- Domain: $12/year

**Total: ~$52-55/month fixed + variable payment fees**
