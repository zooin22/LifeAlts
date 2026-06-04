import { Action, Character, JobId, StatKey, Stats } from '../types';
import { JOBS } from '../data/jobs';

const WINDOW_DAYS = 14;
const DECAY_RATE = 0.9;        // per day
const COMBO_THRESHOLD = 0.7;   // 2nd stat must be >= 70% of 1st
const GOLD_DOMINANCE = 0.4;    // gold fraction to trigger merchant class

/** Returns weighted stat totals from recent actions (rolling window + decay). */
export function computeStats(actions: Action[]): { stats: Stats; gold: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const stats: Stats = { str: 0, int: 0, cha: 0, dex: 0, wis: 0, health: 0 };
  let gold = 0;

  for (const action of actions) {
    const ts = new Date(action.ts).getTime();
    if (ts < cutoff) continue;

    const daysAgo = (now - ts) / (24 * 60 * 60 * 1000);
    const weight = action.amount * Math.pow(DECAY_RATE, daysAgo);

    if (action.stat === 'gold') {
      gold += weight;
    } else if (action.stat) {
      stats[action.stat] += weight;
    }
  }

  return { stats, gold };
}

/** Determines the job based on current weighted stats + gold. */
export function determineJob(stats: Stats, gold: number): JobId {
  const statEntries = Object.entries(stats) as [StatKey, number][];
  const totalStat = statEntries.reduce((s, [, v]) => s + v, 0);
  const totalAll = totalStat + gold;

  // All zeroes — still a novice
  if (totalAll === 0) return 'novice';

  // Check adventurer: all 6 stats non-zero and max/min ratio < 2
  const statValues = statEntries.map(([, v]) => v);
  const maxStat = Math.max(...statValues);
  const minStat = Math.min(...statValues);
  if (minStat > 0 && maxStat / minStat < 2 && gold < totalAll * GOLD_DOMINANCE) {
    return 'adventurer';
  }

  // Sort stats descending
  const sorted = [...statEntries].sort(([, a], [, b]) => b - a);
  const [first, second] = sorted;

  // Gold dominance check (active gold activities only, not passive work)
  if (gold > totalAll * GOLD_DOMINANCE && gold >= (first?.[1] ?? 0)) {
    return 'merchant';
  }

  if (!first || first[1] === 0) return 'novice';

  // Combo job: 2nd stat >= 70% of 1st
  if (second && second[1] >= first[1] * COMBO_THRESHOLD) {
    return findComboJob(first[0], second[0]) ?? singleJob(first[0]);
  }

  return singleJob(first[0]);
}

function singleJob(stat: StatKey): JobId {
  const map: Record<StatKey, JobId> = {
    str: 'warrior',
    int: 'mage',
    cha: 'bard',
    dex: 'rogue',
    wis: 'monk',
    health: 'naturalist',
  };
  return map[stat];
}

function findComboJob(a: StatKey, b: StatKey): JobId | null {
  const combos: [StatKey, StatKey, JobId][] = [
    ['str', 'cha', 'paladin'],
    ['cha', 'str', 'paladin'],
    ['int', 'dex', 'alchemist'],
    ['dex', 'int', 'alchemist'],
    ['str', 'dex', 'hunter'],
    ['dex', 'str', 'hunter'],
    ['int', 'cha', 'sage'],
    ['cha', 'int', 'sage'],
    ['cha', 'wis', 'healer'],
    ['wis', 'cha', 'healer'],
    ['str', 'wis', 'martial_artist'],
    ['wis', 'str', 'martial_artist'],
    ['int', 'wis', 'astrologer'],
    ['wis', 'int', 'astrologer'],
  ];

  const match = combos.find(([x, y]) => x === a && y === b);
  return match ? match[2] : null;
}

/** Rebuilds the character's derived state from actions. Call on every app open or new action. */
export function deriveCharacter(
  actions: Action[],
  existing: Pick<Character, 'streak' | 'longestStreak' | 'lastActiveDate' | 'cosmetics'>,
): Character {
  const { stats, gold } = computeStats(actions);
  const job = determineJob(stats, gold);

  return {
    stats,
    gold,
    job,
    streak: existing.streak,
    longestStreak: existing.longestStreak,
    lastActiveDate: existing.lastActiveDate,
    cosmetics: existing.cosmetics,
  };
}
