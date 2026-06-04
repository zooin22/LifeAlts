import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Action, Character, Quest, Routine } from '../types';
import {
  addAction as storageAddAction,
  loadActions,
  loadCharacter,
  loadQuests,
  loadRoutines,
  saveCharacter,
  saveQuests,
  saveRoutines,
} from '../store/storage';
import { deriveCharacter } from '../utils/jobEngine';
import { toDateStr, updateStreak } from '../utils/streak';
import { uuid } from '../utils/uuid';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  loading: boolean;
  actions: Action[];
  character: Character;
  routines: Routine[];
  quests: Quest[];
  todayDone: Set<string>;          // routineId → done today
  recordRoutine: (routineId: string) => Promise<void>;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  addMainQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'progress' | 'done' | 'abandoned'>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [character, setCharacter] = useState<Character>({
    stats: { str: 0, int: 0, cha: 0, dex: 0, wis: 0, health: 0 },
    gold: 0,
    job: 'novice',
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    cosmetics: {},
  });
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [todayDone, setTodayDone] = useState<Set<string>>(new Set());

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [storedActions, storedChar, storedRoutines, storedQuests] =
        await Promise.all([
          loadActions(),
          loadCharacter(),
          loadRoutines(),
          loadQuests(),
        ]);

      setActions(storedActions);
      setRoutines(storedRoutines);

      // Re-derive character stats/job from actions
      const derived = deriveCharacter(storedActions, storedChar);
      setCharacter(derived);

      // Reset daily quests if it's a new day
      const today = toDateStr();
      const resetQuests = storedQuests.map((q) =>
        q.kind === 'daily' && q.period !== today
          ? { ...q, done: false, progress: 0, period: today }
          : q,
      );
      setQuests(resetQuests);
      if (resetQuests !== storedQuests) {
        await saveQuests(resetQuests);
      }

      // Today's completed routines
      const doneTodayIds = new Set(
        storedActions
          .filter(
            (a) =>
              a.routineId &&
              a.ts.slice(0, 10) === today,
          )
          .map((a) => a.routineId as string),
      );
      setTodayDone(doneTodayIds);

      setLoading(false);
    })();
  }, []);

  // ── Recompute character whenever actions change ────────────────────────────
  const refreshCharacter = useCallback(
    async (newActions: Action[], prevChar: Character) => {
      const derived = deriveCharacter(newActions, prevChar);
      setCharacter(derived);
      await saveCharacter(derived);
    },
    [],
  );

  // ── Record a routine ──────────────────────────────────────────────────────
  const recordRoutine = useCallback(
    async (routineId: string) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;

      const today = toDateStr();

      // Build action
      const action: Action = {
        id: uuid(),
        ts: new Date().toISOString(),
        type: routine.type,
        stat: routine.stat === 'gold' ? 'gold' : routine.stat,
        amount: routine.amount,
        note: null,
        questId: null,
        routineId,
      };

      const newActions = await storageAddAction(action);
      setActions(newActions);

      // Mark done today
      setTodayDone((prev) => new Set([...prev, routineId]));

      // Update streak
      setCharacter((prev) => {
        const streakResult = updateStreak(
          prev.lastActiveDate,
          prev.streak,
          prev.longestStreak,
        );
        const updated: Character = { ...prev, ...streakResult };
        saveCharacter(updated);
        refreshCharacter(newActions, updated);
        return updated;
      });

      // Tick matching daily quests
      setQuests((prev) => {
        const updated = prev.map((q) => {
          if (
            q.kind === 'daily' &&
            q.period === today &&
            !q.done &&
            q.targetStat === routine.stat
          ) {
            const newProgress = Math.min(q.progress + 1, q.goal);
            return { ...q, progress: newProgress, done: newProgress >= q.goal };
          }
          return q;
        });
        saveQuests(updated);
        return updated;
      });
    },
    [routines, refreshCharacter],
  );

  // ── Add routine ───────────────────────────────────────────────────────────
  const addRoutine = useCallback(
    async (routine: Omit<Routine, 'id' | 'createdAt'>) => {
      const newRoutine: Routine = {
        ...routine,
        id: uuid(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...routines, newRoutine];
      setRoutines(updated);
      await saveRoutines(updated);
    },
    [routines],
  );

  // ── Remove routine ────────────────────────────────────────────────────────
  const removeRoutine = useCallback(
    async (id: string) => {
      const updated = routines.filter((r) => r.id !== id);
      setRoutines(updated);
      await saveRoutines(updated);
    },
    [routines],
  );

  // ── Complete quest ────────────────────────────────────────────────────────
  const completeQuest = useCallback(
    async (id: string) => {
      setQuests((prev) => {
        const updated = prev.map((q) =>
          q.id === id ? { ...q, done: true, progress: q.goal } : q,
        );
        saveQuests(updated);
        return updated;
      });
    },
    [],
  );

  // ── Add main quest ────────────────────────────────────────────────────────
  const addMainQuest = useCallback(
    async (quest: Omit<Quest, 'id' | 'createdAt' | 'progress' | 'done' | 'abandoned'>) => {
      const newQuest: Quest = {
        ...quest,
        id: uuid(),
        progress: 0,
        done: false,
        abandoned: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [...quests, newQuest];
      setQuests(updated);
      await saveQuests(updated);
    },
    [quests],
  );

  return (
    <AppContext.Provider
      value={{
        loading,
        actions,
        character,
        routines,
        quests,
        todayDone,
        recordRoutine,
        addRoutine,
        removeRoutine,
        completeQuest,
        addMainQuest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
