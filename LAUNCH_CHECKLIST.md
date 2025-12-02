# 🚀 Launch Checklist

Use this checklist to launch your SaaS in the next 7 days and reach $25k/mo.

## Week 1: Setup & Deploy

### Day 1: Prepare Environment
- [ ] Set up Stripe account (https://stripe.com)
  - [ ] Create test account
  - [ ] Get test API keys (sk_test_...)
  - [ ] Create Pro product ($99/mo)
  - [ ] Create Agency product ($499/mo)
  - [ ] Copy price IDs to docs
- [ ] Set up GitHub secrets
  - [ ] Add STRIPE_SECRET_KEY
  - [ ] Add ANTHROPIC_API_KEY
  - [ ] Add JWT_SECRET
- [ ] Create `.env.local` from `.env.example`
  - [ ] Add all secrets
  - [ ] Test: `npm run server` works locally

### Day 2: Deploy Backend
- [ ] Go to https://render.com
  - [ ] Sign up / log in
  - [ ] Connect GitHub repo
  - [ ] Create new Web Service
  - [ ] Name: `horizon-brand-builder-api`
  - [ ] Set build: `npm install`
  - [ ] Set start: `npx tsx server/app.ts`
  - [ ] Add env vars (copy from `.env.local`)
  - [ ] Deploy
- [ ] Test backend
  - [ ] `curl https://your-api.onrender.com/health`
  - [ ] Should return `{"status":"ok"}`
- [ ] Save backend URL: `https://your-api.onrender.com`

### Day 3: Deploy Frontend
- [ ] Go to https://vercel.com
  - [ ] Sign up / log in
  - [ ] Import GitHub repo
  - [ ] Set Framework: None
  - [ ] Set Output Dir: `public`
  - [ ] Add env var: API_URL = your backend URL
  - [ ] Deploy
- [ ] Test landing page
  - [ ] Open https://your-app.vercel.app
  - [ ] Click "Start Free Trial"
  - [ ] Should see: signup form
- [ ] Save frontend URL

### Day 4: Configure Stripe Webhooks
- [ ] Go to Stripe Dashboard
  - [ ] Webhooks → Add Endpoint
  - [ ] URL: `https://your-api.onrender.com/api/webhooks/stripe`
  - [ ] Select events:
    - [ ] checkout.session.completed
    - [ ] customer.subscription.updated
    - [ ] customer.subscription.deleted
    - [ ] invoice.payment_succeeded
  - [ ] Copy webhook secret (whsec_...)
  - [ ] Add to Render env vars: STRIPE_WEBHOOK_SECRET
- [ ] Test webhook
  - [ ] Render dashboard → click Deploy
  - [ ] Wait for redeploy with new env var
  - [ ] Try checkout flow on landing page
  - [ ] Should see Stripe payment dialog

### Day 5: Test Full Flow
- [ ] Sign up flow
  - [ ] Go to landing page
  - [ ] Click "Start Free Trial"
  - [ ] Enter email
  - [ ] Should get trial account + 5 credits
- [ ] Trial check
  - [ ] GET `/api/trial/USER_ID` should work
  - [ ] Should show `creditsRemaining: 5`
- [ ] Checkout flow
  - [ ] Click "Upgrade to Pro"
  - [ ] Enter email
  - [ ] Should go to Stripe checkout
  - [ ] (Use test card: 4242 4242 4242 4242, any exp, 123 cvv)
  - [ ] Complete payment
  - [ ] Should redirect to success page
- [ ] Webhook test
  - [ ] Check Render logs
  - [ ] Should see webhook event received
  - [ ] Should see "Checkout completed" log

### Day 6: Create Sales Materials
- [ ] Draft pitch email (from SALES_PILOT_KIT.md)
  - [ ] Customize with company name
  - [ ] Add your name
  - [ ] Test send to yourself
- [ ] Create target list
  - [ ] 10 agencies to reach out to
  - [ ] Collect email addresses
  - [ ] Add to spreadsheet
- [ ] Screenshot landing page
  - [ ] Create tweet/LinkedIn post
  - [ ] Share: "Building SaaS for agencies"

### Day 7: First Sales Push
- [ ] Send emails
  - [ ] Cold outreach to 10 agencies (Day 1 template)
  - [ ] Personalize each
  - [ ] Add your calendar link for call
- [ ] Share on social
  - [ ] LinkedIn: Quick video of product
  - [ ] Twitter: Link to landing page
  - [ ] Ask for RT/shares
- [ ] Monitor metrics
  - [ ] Check Render logs for errors
  - [ ] Check Stripe for test transactions
  - [ ] Count landing page visits

---

## Week 2-4: Acquire Pilot Customers

### Week 2: Follow-ups & Calls
- [ ] Follow up emails (Day 2 template from SALES_PILOT_KIT.md)
  - [ ] Send to anyone who didn't respond
  - [ ] Ask specific question about bottleneck
- [ ] Onboarding calls
  - [ ] Walk through product
  - [ ] Show fast mode example
  - [ ] Ask what they need
  - [ ] Offer 50% discount
- [ ] Track in spreadsheet
  - [ ] Name, email, company
  - [ ] Status (interested, call, signed up)
  - [ ] Notes from conversation

### Week 3: Convert Pilots
- [ ] Pilot offers
  - [ ] Send offer email (Day 3 template)
  - [ ] 50% off first 3 months
  - [ ] Free setup call
  - [ ] Priority email support
- [ ] Account setup
  - [ ] Create stripe subscriptions manually
  - [ ] Disable 50% discount after 3 months
  - [ ] Add to customer list
  - [ ] Schedule monthly check-in calls
- [ ] Success metric: 5-10 paid pilots

### Week 4: Feedback & Iteration
- [ ] Collect feedback
  - [ ] Send feedback form to pilots
  - [ ] Monthly 30-min calls with each
  - [ ] Ask: "What would make this 10x better?"
  - [ ] Track feature requests
- [ ] Minor improvements
  - [ ] Fix any bugs pilots report
  - [ ] Add 1-2 most-requested features
  - [ ] Update landing page with testimonial
- [ ] Planning
  - [ ] Plan next 50 outreach targets
  - [ ] Prep case study 1 (best pilot)
  - [ ] Set pricing for month 2

---

## Month 2: Scale to 50 Customers ($5k MRR)

### Week 1-2: Testimonials & Case Studies
- [ ] Finish pilot program (if not already)
  - [ ] Get written testimonial from each
  - [ ] Get permission to use name/logo
  - [ ] Take screenshot of positive feedback
- [ ] Write case study
  - [ ] Pick best pilot customer
  - [ ] Document results: time saved, quality, ROI
  - [ ] Get quote: "This saved us X hours per project"
  - [ ] Get approval from customer
- [ ] Update landing page
  - [ ] Add testimonials section
  - [ ] Add case study link
  - [ ] Update FAQ with real questions pilots asked

### Week 3-4: Direct Outreach at Scale
- [ ] Reach out to 50 more agencies
  - [ ] Send customized emails (include testimonial)
  - [ ] Mention: "10 agencies already using"
  - [ ] Same 50% discount offer
- [ ] Sales process
  - [ ] Schedule calls with interested ones
  - [ ] Walk through product (5-min demo)
  - [ ] Offer free trial first
  - [ ] Close with 50% discount
- [ ] Success metric: 30-50 total customers = $3-5k MRR

---

## Month 3+: Towards $25k/mo

### Ongoing Tasks
- [ ] Weekly
  - [ ] Check Stripe for new subscriptions
  - [ ] Review error logs
  - [ ] Respond to support emails
  - [ ] Monitor uptime (Render dashboard)
- [ ] Monthly
  - [ ] Calculate MRR
  - [ ] Review churn (cancellations)
  - [ ] Get NPS from customers
  - [ ] Plan next outreach batch
  - [ ] Iterate based on feedback
- [ ] Quarterly
  - [ ] Review financials
  - [ ] Assess: profitable? need to raise?
  - [ ] Plan new features/verticals
  - [ ] Update pricing if needed

### Growth Targets
- [ ] Month 3: 50 customers ($5k MRR)
  - [ ] Actions: Direct outreach + 3 case studies
- [ ] Month 6: 150 customers ($15k MRR)
  - [ ] Actions: Add partnership program + content marketing
- [ ] Month 9: 250 customers ($25k MRR)
  - [ ] Actions: Expand to new industries + SEO

---

## Financial Tracking

### Setup
- [ ] Create spreadsheet with columns:
  - Date, Customer, Email, Plan, Payment, MRR Impact
- [ ] Track monthly
  - New customers (MRR +)
  - Churn (MRR -)
  - Total MRR
  - Cumulative revenue

### Metrics to Monitor
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Churn rate (target: <5% for first 6 months)
- [ ] CAC (Customer Acquisition Cost)
- [ ] LTV (Lifetime Value) = avg revenue × (1/churn)
- [ ] Payback period = CAC / (revenue per customer per month)

---

## Operations

### Daily (5 min)
- [ ] Check error logs (Render dashboard)
- [ ] Respond to urgent support emails
- [ ] Monitor social mentions

### Weekly (30 min)
- [ ] Review signups
- [ ] Check failed payments
- [ ] Monitor stripe transactions
- [ ] Plan next 3 outreach targets

### Monthly (2 hours)
- [ ] Audit user feedback
- [ ] Plan feature priorities
- [ ] Review metrics vs goals
- [ ] Update roadmap

---

## Marketing Assets (use templates from SALES_PILOT_KIT.md)

- [ ] Email templates (3 emails)
- [ ] LinkedIn message template
- [ ] Demo video script (2 min)
- [ ] One-pager PDF template
- [ ] Case study template
- [ ] FAQ page
- [ ] Testimonial collection form

---

## Common Milestones

- [ ] **Week 2**: First paid customer
- [ ] **Month 1**: 10 customers ($490 MRR if all pilots)
- [ ] **Month 2**: 30+ customers ($2.5k MRR)
- [ ] **Month 3**: 50+ customers ($5k MRR)
- [ ] **Month 6**: 150+ customers ($15k MRR)
- [ ] **Month 12**: 250+ customers ($25k MRR)

---

## Success Criteria

✅ **Done when:**
- Landing page deployed
- Stripe integration working
- First 10 customers onboarded
- Testimonials collected
- Case study written
- Next batch of 50 outreach scheduled
- MRR > $0 (any paid customer = win)

✅ **Major milestone: $5k MRR**
- 50+ paying customers
- 3+ case studies
- <5% churn
- Payback period < 3 months

✅ **Target: $25k MRR**
- 250+ paying customers
- 10+ case studies
- <5% churn
- Recurring revenue stable

---

## Resources

📚 **Documentation**
- Setup: `docs/DEPLOYMENT.md`
- Sales: `docs/SALES_PILOT_KIT.md`
- Ops: `docs/MONITORING_OPS.md`
- Customer: `docs/CUSTOMER_QUICK_START.md`

🔗 **Platforms**
- Stripe: https://stripe.com
- Render: https://render.com
- Vercel: https://vercel.com
- GitHub: https://github.com

📞 **When you hit milestones:**
- First customer: celebrate! 🎉
- $1k MRR: you have product-market fit
- $5k MRR: start thinking about hiring
- $25k MRR: consider Series A or expand team

---

**You've got this! 🚀 Start with Week 1 Day 1 and work through systematically.**

Check off each box as you complete. Should take ~5-7 days from start to first paid customer.
