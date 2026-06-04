import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, Character, Quest, Routine } from '../types';

const KEYS = {
  ACTIONS: 'lifealts:actions',
  CHARACTER: 'lifealts:character',
  QUESTS: 'lifealts:quests',
  ROUTINES: 'lifealts:routines',
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
