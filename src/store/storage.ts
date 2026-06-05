/**
 * storage — AsyncStorage 영속화 계층 (앱의 유일한 디스크 I/O 지점).
 *
 * 도메인별 load·save 함수 쌍을 제공한다. 키 목록은 아래 KEYS (+ AppContext의 온보딩 플래그).
 * 새 영속 데이터를 추가할 땐 여기에 KEY + load/save 함수 + 기본값을 같이 만든다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, Character, Inventory, JobChangeEvent, Quest, Routine } from '../types';

const KEYS = {
  ACTIONS: 'lifealts:actions',
  CHARACTER: 'lifealts:character',
  QUESTS: 'lifealts:quests',
  ROUTINES: 'lifealts:routines',
  JOB_HISTORY: 'lifealts:jobhistory',
  INVENTORY: 'lifealts:inventory',
} as const;

async function get<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function loadActions(): Promise<Action[]> {
  return (await get<Action[]>(KEYS.ACTIONS)) ?? [];
}

export async function saveActions(actions: Action[]): Promise<void> {
  await set(KEYS.ACTIONS, actions);
}

export async function addAction(action: Action): Promise<Action[]> {
  const actions = await loadActions();
  const updated = [...actions, action];
  await saveActions(updated);
  return updated;
}

// ─── Character ───────────────────────────────────────────────────────────────

const DEFAULT_CHARACTER: Character = {
  stats: { str: 0, int: 0, cha: 0, dex: 0, wis: 0, health: 0 },
  gold: 0,
  job: 'novice',
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  cosmetics: {},
};

export async function loadCharacter(): Promise<Character> {
  return (await get<Character>(KEYS.CHARACTER)) ?? DEFAULT_CHARACTER;
}

export async function saveCharacter(character: Character): Promise<void> {
  await set(KEYS.CHARACTER, character);
}

// ─── Quests ──────────────────────────────────────────────────────────────────

export async function loadQuests(): Promise<Quest[]> {
  return (await get<Quest[]>(KEYS.QUESTS)) ?? [];
}

export async function saveQuests(quests: Quest[]): Promise<void> {
  await set(KEYS.QUESTS, quests);
}

// ─── Routines ────────────────────────────────────────────────────────────────

export async function loadRoutines(): Promise<Routine[]> {
  return (await get<Routine[]>(KEYS.ROUTINES)) ?? [];
}

export async function saveRoutines(routines: Routine[]): Promise<void> {
  await set(KEYS.ROUTINES, routines);
}

// ─── Job History ───────────────────────────────────────────────────────────────

export async function loadJobHistory(): Promise<JobChangeEvent[]> {
  return (await get<JobChangeEvent[]>(KEYS.JOB_HISTORY)) ?? [];
}

export async function saveJobHistory(history: JobChangeEvent[]): Promise<void> {
  await set(KEYS.JOB_HISTORY, history);
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export const DEFAULT_INVENTORY: Inventory = {
  spentGold: 0,
  streakFreezes: 0,
  ownedTitles: [],
  equippedTitle: null,
};

export async function loadInventory(): Promise<Inventory> {
  const stored = await get<Partial<Inventory>>(KEYS.INVENTORY);
  return { ...DEFAULT_INVENTORY, ...(stored ?? {}) };
}

export async function saveInventory(inv: Inventory): Promise<void> {
  await set(KEYS.INVENTORY, inv);
}
