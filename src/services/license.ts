/**
 * License & Plan Validation Service
 * MVP: Validates LICENSE_KEY from env or checks local dev mode
 * Production: Will validate against billing backend
 */

export interface PlanTier {
  name: 'free' | 'pro' | 'agency' | 'enterprise';
  monthlyPrice: number;
  tokensPerMonth: number;
  runsPerMonth: number;
  canUseProfessional: boolean;
  canUseResearch: boolean;
  canUseAgents: boolean;
  canExport: boolean;
}

const PLAN_TIERS: Record<string, PlanTier> = {
  free: {
    name: 'free',
    monthlyPrice: 0,
    tokensPerMonth: 50000,
    runsPerMonth: 5,
    canUseProfessional: false,
    canUseResearch: false,
    canUseAgents: false,
    canExport: false,
  },
  pro: {
    name: 'pro',
    monthlyPrice: 99,
    tokensPerMonth: 500000,
    runsPerMonth: 50,
    canUseProfessional: true,
    canUseResearch: true,
    canUseAgents: true,
    canExport: true,
  },
  agency: {
    name: 'agency',
    monthlyPrice: 499,
    tokensPerMonth: 2000000,
    runsPerMonth: 500,
    canUseProfessional: true,
    canUseResearch: true,
    canUseAgents: true,
    canExport: true,
  },
  enterprise: {
    name: 'enterprise',
    monthlyPrice: 0, // custom
    tokensPerMonth: 10000000,
    runsPerMonth: 10000,
    canUseProfessional: true,
    canUseResearch: true,
    canUseAgents: true,
    canExport: true,
  },
};

/**
 * Get user's plan (MVP: reads from env or falls back to free)
 * Production: fetch from billing backend
 */
export function getUserPlan(userId?: string): PlanTier {
  const licenseKey = process.env.LICENSE_KEY;
  const plan = process.env.USER_PLAN as string | undefined;

  // Allow local dev mode
  if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL === 'true') {
    return PLAN_TIERS['pro'];
  }

  // Paid user with license key
  if (licenseKey) {
    return PLAN_TIERS[plan?.toLowerCase() || 'pro'] || PLAN_TIERS['pro'];
  }

  // Default to free tier
  return PLAN_TIERS['free'];
}

/**
 * Check if feature is available for current user
 */
export function canUseFeature(feature: 'professional' | 'research' | 'agents' | 'export'): boolean {
  const plan = getUserPlan();

  switch (feature) {
    case 'professional':
      return plan.canUseProfessional;
    case 'research':
      return plan.canUseResearch;
    case 'agents':
      return plan.canUseAgents;
    case 'export':
      return plan.canExport;
    default:
      return false;
  }
}

/**
 * Enforce feature access; throw if not allowed
 */
export function ensurePaidFeature(featureName: string, feature: 'professional' | 'research' | 'agents' | 'export'): void {
  if (!canUseFeature(feature)) {
    const plan = getUserPlan();
    throw new Error(
      `❌ ${featureName} requires a paid plan. Current plan: ${plan.name}. ` +
      `Upgrade at: https://horizon-brand-builder.app/pricing or set LICENSE_KEY env var.`
    );
  }
}

export const PLANS = PLAN_TIERS;
