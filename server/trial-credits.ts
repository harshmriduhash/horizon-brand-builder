/**
 * Trial Credits System
 * New users get 5 free trial runs (fast mode)
 * Used to drive first adoption without paywall friction
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface TrialAccount {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  creditsRemaining: number;
  runsCompleted: number;
}

const TRIALS_PATH = join(process.cwd(), 'data', 'trial-accounts.json');

/**
 * Create a trial account for a new user
 */
export async function createTrialAccount(userId: string, email: string): Promise<TrialAccount> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const trial: TrialAccount = {
    userId,
    email,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    creditsRemaining: 5, // 5 free runs
    runsCompleted: 0,
  };

  try {
    const data = await readFile(TRIALS_PATH, 'utf8').catch(() => '[]');
    const trials = JSON.parse(data) as TrialAccount[];
    trials.push(trial);
    await writeFile(TRIALS_PATH, JSON.stringify(trials, null, 2));
  } catch (err) {
    console.error('Failed to create trial account:', err);
  }

  return trial;
}

/**
 * Get trial account for user
 */
export async function getTrialAccount(userId: string): Promise<TrialAccount | null> {
  try {
    const data = await readFile(TRIALS_PATH, 'utf8').catch(() => '[]');
    const trials = JSON.parse(data) as TrialAccount[];
    const trial = trials.find((t) => t.userId === userId);

    if (!trial) return null;

    // Check expiration
    if (new Date(trial.expiresAt) < new Date()) {
      return null; // Trial expired
    }

    return trial;
  } catch (err) {
    console.error('Failed to get trial account:', err);
    return null;
  }
}

/**
 * Consume a trial credit
 */
export async function consumeTrialCredit(userId: string): Promise<boolean> {
  try {
    const data = await readFile(TRIALS_PATH, 'utf8').catch(() => '[]');
    const trials = JSON.parse(data) as TrialAccount[];

    const trial = trials.find((t) => t.userId === userId);
    if (!trial || trial.creditsRemaining <= 0) {
      return false;
    }

    trial.creditsRemaining--;
    trial.runsCompleted++;

    await writeFile(TRIALS_PATH, JSON.stringify(trials, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to consume trial credit:', err);
    return false;
  }
}

/**
 * Check if user has trial credits available
 */
export async function hasTrialCredits(userId: string): Promise<boolean> {
  const trial = await getTrialAccount(userId);
  return trial !== null && trial.creditsRemaining > 0;
}
