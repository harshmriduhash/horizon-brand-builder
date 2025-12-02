/**
 * Usage Metering Service
 * Tracks tokens, runs, and costs per user/organization
 * MVP: writes to JSON files; Production: sends to billing DB
 */

import { appendFile, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export interface UsageRecord {
  timestamp: string;
  userId?: string;
  orgId?: string;
  feature: string;
  brand?: string;
  tokensUsed: number;
  costUSD: number;
  success: boolean;
}

const USAGE_LOG_PATH = join(process.cwd(), 'data', 'usage-log.jsonl');

/**
 * Record a usage event
 */
export async function recordUsage(record: Omit<UsageRecord, 'timestamp'>): Promise<void> {
  try {
    const fullRecord: UsageRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };

    const line = JSON.stringify(fullRecord) + '\n';
    await appendFile(USAGE_LOG_PATH, line, { encoding: 'utf8' });
  } catch (err) {
    // Fail silently to avoid breaking feature execution
    // In production, send to monitoring/logging service
    console.warn('⚠️  Usage logging failed:', err instanceof Error ? err.message : 'unknown error');
  }
}

/**
 * Estimate tokens from text (rough: 1 token ~= 4 chars)
 */
export function estimateTokens(text: string | undefined): number {
  if (!text) return 0;
  return Math.ceil((text.length || 0) / 4);
}

/**
 * Estimate cost in USD ($0.02 per 1k tokens)
 */
export function estimateCost(tokensUsed: number): number {
  return Number(((tokensUsed / 1000) * 0.02).toFixed(6));
}

/**
 * Get total usage for a user in current month
 */
export async function getUserMonthlyUsage(userId: string): Promise<{ tokens: number; runs: number; cost: number }> {
  try {
    const data = await readFile(USAGE_LOG_PATH, 'utf8');
    const lines = data.trim().split('\n').filter(Boolean);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = lines
      .map((line) => {
        try {
          return JSON.parse(line) as UsageRecord;
        } catch {
          return null;
        }
      })
      .filter((r) => r && r.userId === userId && new Date(r.timestamp) >= monthStart);

    const stats = records.reduce(
      (acc, r) => ({
        tokens: acc.tokens + (r?.tokensUsed || 0),
        runs: acc.runs + (r && r.success ? 1 : 0),
        cost: acc.cost + (r?.costUSD || 0),
      }),
      { tokens: 0, runs: 0, cost: 0 }
    );

    return stats;
  } catch {
    return { tokens: 0, runs: 0, cost: 0 };
  }
}

/**
 * Clear old usage logs (keep last 90 days)
 */
export async function pruneOldUsageLogs(): Promise<void> {
  try {
    const data = await readFile(USAGE_LOG_PATH, 'utf8');
    const lines = data.trim().split('\n').filter(Boolean);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const recent = lines
      .map((line) => {
        try {
          return JSON.parse(line) as UsageRecord;
        } catch {
          return null;
        }
      })
      .filter((r) => r && new Date(r.timestamp) >= cutoff);

    const cleaned = recent.map((r) => JSON.stringify(r)).join('\n') + '\n';
    await writeFile(USAGE_LOG_PATH, cleaned, 'utf8');
  } catch {
    // Ignore prune errors
  }
}
