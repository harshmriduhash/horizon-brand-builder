# SaaS & Monitoring Setup

Complete monitoring and ops setup for production.

## 🔍 Monitoring Stack

### 1. Error Tracking (Sentry)

Install Sentry:

```bash
npm install @sentry/node @sentry/tracing
```

Configure in `server/app.ts`:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 2. Logs & Analytics (LogDNA / Datadog)

LogDNA setup:

```bash
npm install @logdna/browser
```

```typescript
const logdna = require('@logdna/browser');

logdna.init({
  apiKey: process.env.LOGDNA_API_KEY,
  environment: process.env.NODE_ENV,
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, { userId: req.body.userId });
  next();
});
```

### 3. Metrics & Dashboards (Prometheus + Grafana)

Track key metrics:

```typescript
import prometheus from 'prom-client';

// Metrics
const requestCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status'],
});

const runDuration = new prometheus.Histogram({
  name: 'brand_run_duration_seconds',
  help: 'Brand strategy run duration',
  labelNames: ['mode'],
  buckets: [10, 30, 60, 300],
});

// Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

## 📊 Key KPIs to Track

### Business Metrics
- Daily Active Users (DAU)
- Monthly Recurring Revenue (MRR)
- Churn Rate
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Net Revenue Retention (NRR)

### Product Metrics
- Trial-to-paid conversion rate
- Average runs per user per month
- Token usage vs plan quota
- Mode popularity (Fast vs Pro vs Research)
- Feature adoption rate

### Technical Metrics
- API response time (target: <2s)
- Error rate (target: <0.5%)
- Uptime (target: 99.9%)
- Database query time
- Webhook success rate

## 📈 Set Up Dashboards

### Render Dashboard
- Go to Service → Metrics
- Monitor:
  - CPU usage
  - Memory usage
  - Response time
  - Errors

### Vercel Dashboard
- Go to Project → Analytics
- Monitor:
  - Page views
  - Load time
  - Bounce rate
  - Conversion funnel

### Stripe Dashboard
- Go to Reporting → All transactions
- Track:
  - MRR
  - Churn
  - Refunds
  - Customer growth

## 🔔 Alerts & Escalation

Set up alerts for:

1. **Critical Issues** (immediate action)
   - API down (uptime check fails)
   - High error rate (>5% errors)
   - Database connection failure
   - Stripe webhook failures

2. **Performance Issues** (24h response)
   - Response time >5s
   - Memory usage >80%
   - High token usage detected
   - Disk space low

3. **Business Metrics** (weekly review)
   - Churn spike
   - Conversion drop
   - Token quota approaching
   - Refund spike

## 🛡️ Security & Compliance

### Secrets Management
```bash
# Never commit secrets!
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### Regular Audits
- [ ] Weekly: Check error logs
- [ ] Weekly: Review new signups
- [ ] Monthly: Audit user permissions
- [ ] Monthly: Review database backups
- [ ] Quarterly: Security audit
- [ ] Quarterly: Dependency updates

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests
});

app.use('/api/', limiter);
```

## 🔄 Backup & Recovery

### Database Backups
- Supabase: automatic daily backups
- Retention: 30 days
- Test restore: monthly

### Code Backups
- GitHub: primary storage
- Automatic daily: via GitHub Actions
- Tag releases: for easy rollback

### Disaster Recovery Plan

If production goes down:
1. Check Render & Vercel dashboards
2. Check error logs in Sentry
3. Revert to last stable commit
4. Notify customers (status page)
5. Post-mortem within 24h

## 📞 Escalation Plan

**Tier 1** (Automated monitoring)
- Uptime checks
- Error tracking
- Performance alerts

**Tier 2** (Engineering team)
- API errors
- Database issues
- Deployment failures

**Tier 3** (On-call rotation)
- Customer data loss
- Security incidents
- Extended downtime (>1h)

## 🚀 Continuous Improvement

Weekly reviews:
- Error logs for patterns
- Customer feedback
- Performance metrics
- Cost analysis

Monthly:
- Dependency updates
- Security patches
- Infrastructure scaling needs
- Feature popularity

Quarterly:
- Strategic direction
- Roadmap planning
- Financial review
- Customer interviews
