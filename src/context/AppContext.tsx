/**
 * AppContext — 앱의 중앙 상태 저장소 & 비즈니스 로직.
 *
 * 모든 화면은 `useApp()` 으로 여기 접근한다. 핵심 설계:
 *  - 스탯/직업은 저장하지 않고 `actions` 로그에서 매번 파생 계산 (deriveCharacter).
 *  - 한 번의 행동 → 즉시 흐름(퀘스트·스트릭·보상) + 누적 흐름(스탯·직업)으로 갈라짐.
 *  - 영속화는 store/storage.ts 를 통해 AsyncStorage 로.
 * 자세한 흐름은 docs/개발자_가이드.md §4, §6 참고.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, Character, Inventory, JobChangeEvent, JobId, Quest, Routine } from '../types';
import {
  addAction as storageAddAction,
  DEFAULT_INVENTORY,
  loadActions,
  loadCharacter,
  loadInventory,
  loadJobHistory,
  loadQuests,
  loadRoutines,
  saveActions,
  saveCharacter,
  saveInventory,
  saveJobHistory,
  saveQuests,
  saveRoutines,
} from '../store/storage';
import { deriveCharacter } from '../utils/jobEngine';
import { toDateStr, updateStreak } from '../utils/streak';
import { crossedMilestones, milestoneGold } from '../utils/milestones';
import { SHOP_ITEM_MAP } from '../data/shopItems';
import { uuid } from '../utils/uuid';

const KEY_ONBOARDING = 'lifealts:onboarding_done';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JobChange {
  from: JobId;
  to: JobId;
}

interface Reward {
  label: string;
  stat: string;
  amount: number;
}

interface ReturnInfo {
  daysSince: number;
  streakBroken: boolean;
  prevStreak: number;
}

interface AppContextValue {
  loading: boolean;
  actions: Action[];
  character: Character;
  routines: Routine[];
  quests: Quest[];
  jobHistory: JobChangeEvent[];
  inventory: Inventory;
  walletGold: number;
  todayDone: Set<string>;
  isFirstLaunch: boolean;
  pendingJobChange: JobChange | null;
  pendingReward: Reward | null;
  returnInfo: ReturnInfo | null;
  clearJobChange: () => void;
  clearReward: () => void;
  dismissReturn: () => void;
  completeOnboarding: (seed: { label: string; type: string; stat: string; amount: number }) => Promise<void>;
  recordRoutine: (routineId: string) => Promise<void>;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => Promise<Routine>;
  removeRoutine: (id: string) => Promise<void>;
  toggleRoutineActive: (id: string) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  abandonQuest: (id: string) => Promise<void>;
  addJournalNote: (text: string) => Promise<void>;
  addMainQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'progress' | 'done' | 'abandoned'>) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<boolean>;
  equipTitle: (titleId: string | null) => Promise<void>;
  useStreakFreeze: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

/**
 * 메인 퀘스트 진행도가 oldP → newP 로 오를 때 새로 넘은 마일스톤의
 * 금화 보상 action 들과, 토스트로 보여줄 마지막(최고) 보상 정보를 만든다.
 */
function grantMilestoneRewards(
  quest: Quest,
  oldP: number,
  newP: number,
): { actions: Action[]; reward: Reward | null } {
  const crossed = crossedMilestones(oldP, newP, quest.goal);
  if (crossed.length === 0) return { actions: [], reward: null };

  const actions: Action[] = [];
  let reward: Reward | null = null;
  for (const frac of crossed) {
    const gold = milestoneGold(frac);
    actions.push({
      id: uuid(),
      ts: new Date().toISOString(),
      type: 'work',
      stat: 'gold',
      amount: gold,
      note: '마일스톤 보상',
      questId: quest.id,
      routineId: null,
    });
    const pct = Math.round(frac * 100);
    reward = {
      label: frac >= 1 ? `${quest.label} 완수! 🎉` : `${quest.label} ${pct}% 달성!`,
      stat: 'gold',
      amount: gold,
    };
  }
  return { actions, reward };
}

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
  const [jobHistory, setJobHistory] = useState<JobChangeEvent[]>([]);
  const [inventory, setInventory] = useState<Inventory>(DEFAULT_INVENTORY);
  const [todayDone, setTodayDone] = useState<Set<string>>(new Set());

  // 소지금 = 평생 번 금화(감쇠 없음) − 사용액. (직업 판정용 활동 금화와 별개)
  const lifetimeGold = actions.reduce((s, a) => (a.stat === 'gold' ? s + a.amount : s), 0);
  const walletGold = Math.max(0, lifetimeGold - inventory.spentGold);
  const [pendingJobChange, setPendingJobChange] = useState<{ from: JobId; to: JobId } | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [returnInfo, setReturnInfo] = useState<ReturnInfo | null>(null);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [onboardingDone, storedActions, storedChar, storedRoutines, storedQuests, storedHistory, storedInventory] =
        await Promise.all([
          AsyncStorage.getItem(KEY_ONBOARDING),
          loadActions(),
          loadCharacter(),
          loadRoutines(),
          loadQuests(),
          loadJobHistory(),
          loadInventory(),
        ]);

      if (!onboardingDone) {
        setIsFirstLaunch(true);
      } else if (storedChar.lastActiveDate) {
        const today = toDateStr();
        if (storedChar.lastActiveDate !== today) {
          const lastDate = new Date(storedChar.lastActiveDate + 'T00:00:00');
          const todayDate = new Date(today + 'T00:00:00');
          const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
          if (diffDays >= 2) {
            setReturnInfo({
              daysSince: diffDays,
              streakBroken: diffDays >= 2,
              prevStreak: storedChar.streak,
            });
          }
        }
      }

      setActions(storedActions);
      setRoutines(storedRoutines);
      setJobHistory(storedHistory);
      setInventory(storedInventory);

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

      // Today's completed routines
      const doneTodayIds = new Set(
        storedActions
          .filter((a) => a.routineId && a.ts.slice(0, 10) === today)
          .map((a) => a.routineId as string),
      );
      setTodayDone(doneTodayIds);

      // Auto-generate daily quests from active routines if none exist today
      const hasTodayDailies = resetQuests.some(q => q.kind === 'daily' && q.period === today);
      let finalQuests = resetQuests;
      if (!hasTodayDailies && storedRoutines.some(r => r.active)) {
        const autoQuests: Quest[] = storedRoutines.filter(r => r.active).map(r => ({
          id: uuid(),
          kind: 'daily' as const,
          label: r.label,
          targetStat: r.stat,
          progress: doneTodayIds.has(r.id) ? 1 : 0,
          goal: 1,
          done: doneTodayIds.has(r.id),
          abandoned: false,
          period: today,
          createdAt: new Date().toISOString(),
        }));
        finalQuests = [...resetQuests, ...autoQuests];
      }
      setQuests(finalQuests);
      if (finalQuests !== storedQuests) {
        await saveQuests(finalQuests);
      }

      setLoading(false);
    })();
  }, []);

  // ── Log a job transition (직업 변천사) ──────────────────────────────────────
  const recordJobChange = useCallback((from: JobId, to: JobId) => {
    setJobHistory((prev) => {
      const event: JobChangeEvent = { id: uuid(), ts: new Date().toISOString(), from, to };
      const updated = [...prev, event];
      saveJobHistory(updated);
      return updated;
    });
  }, []);

  // ── Record a routine ──────────────────────────────────────────────────────
  const recordRoutine = useCallback(
    async (routineId: string) => {
      const routine = routines.find((r) => r.id === routineId);
      if (!routine) return;

      const today = toDateStr();
      const prevJob = character.job;

      const routineAction: Action = {
        id: uuid(),
        ts: new Date().toISOString(),
        type: routine.type,
        stat: routine.stat === 'gold' ? 'gold' : routine.stat,
        amount: routine.amount,
        note: null,
        questId: null,
        routineId,
      };

      // Advance quests + collect main-quest milestone reward actions (synchronously)
      const milestoneActions: Action[] = [];
      let milestoneReward: Reward | null = null;
      const updatedQuests = quests.map((q) => {
        if (q.done || q.abandoned) return q;
        // Daily quest matching today + stat
        if (q.kind === 'daily' && q.period === today && q.targetStat === routine.stat) {
          const newProgress = Math.min(q.progress + 1, q.goal);
          return { ...q, progress: newProgress, done: newProgress >= q.goal };
        }
        // Main quest matching stat (or no stat filter) → progress + milestone rewards
        if (q.kind === 'main' && (q.targetStat === routine.stat || q.targetStat === null)) {
          const newProgress = Math.min(q.progress + 1, q.goal);
          const granted = grantMilestoneRewards(q, q.progress, newProgress);
          if (granted.actions.length) {
            milestoneActions.push(...granted.actions);
            milestoneReward = granted.reward;
          }
          return { ...q, progress: newProgress, done: newProgress >= q.goal };
        }
        return q;
      });

      // Persist routine action + any milestone gold rewards in one ledger write
      const newActions = [...actions, routineAction, ...milestoneActions];
      await saveActions(newActions);
      setActions(newActions);
      setTodayDone((prev) => new Set([...prev, routineId]));

      // Streak + derive
      const streakResult = updateStreak(character.lastActiveDate, character.streak, character.longestStreak);
      const withStreak: Character = { ...character, ...streakResult };
      const derived = deriveCharacter(newActions, withStreak);
      setCharacter(derived);
      await saveCharacter(derived);

      if (derived.job !== prevJob) {
        setPendingJobChange({ from: prevJob, to: derived.job });
        recordJobChange(prevJob, derived.job);
      }

      setQuests(updatedQuests);
      await saveQuests(updatedQuests);

      // Milestone reward (if any) takes toast priority over the plain routine reward
      setPendingReward(
        milestoneReward ?? { label: routine.label, stat: String(routine.stat), amount: routine.amount },
      );
    },
    [routines, character, quests, actions],
  );

  const clearJobChange = useCallback(() => setPendingJobChange(null), []);
  const clearReward = useCallback(() => setPendingReward(null), []);
  const dismissReturn = useCallback(() => setReturnInfo(null), []);

  const completeOnboarding = useCallback(async (seed: { label: string; type: string; stat: string; amount: number }) => {
    // Add the first routine
    const firstRoutine: Routine = {
      id: uuid(),
      label: seed.label,
      type: seed.type as any,
      stat: seed.stat as any,
      amount: seed.amount,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const newRoutines = [firstRoutine];
    setRoutines(newRoutines);
    await saveRoutines(newRoutines);

    // Create daily quest for the first routine
    const today = toDateStr();
    const firstQuest: Quest = {
      id: uuid(),
      kind: 'daily',
      label: firstRoutine.label,
      targetStat: firstRoutine.stat,
      progress: 1,
      goal: 1,
      done: true,
      abandoned: false,
      period: today,
      createdAt: new Date().toISOString(),
    };
    setQuests([firstQuest]);
    await saveQuests([firstQuest]);

    // Record the first action
    const action: Action = {
      id: uuid(),
      ts: new Date().toISOString(),
      type: seed.type as any,
      stat: seed.stat as any,
      amount: seed.amount,
      note: null,
      questId: null,
      routineId: firstRoutine.id,
    };
    const newActions = await storageAddAction(action);
    setActions(newActions);
    setTodayDone(new Set([firstRoutine.id]));

    // Derive character
    const defaultChar: Character = {
      stats: { str: 0, int: 0, cha: 0, dex: 0, wis: 0, health: 0 },
      gold: 0, job: 'novice', streak: 1, longestStreak: 1,
      lastActiveDate: toDateStr(), cosmetics: {},
    };
    const derived = deriveCharacter(newActions, defaultChar);
    setCharacter(derived);
    await saveCharacter(derived);

    // Seed job history with the first awakening (견습생 → 첫 직업)
    if (derived.job !== 'novice') {
      const firstEvent: JobChangeEvent = {
        id: uuid(), ts: new Date().toISOString(), from: 'novice', to: derived.job,
      };
      setJobHistory([firstEvent]);
      await saveJobHistory([firstEvent]);
    }

    // Mark onboarding done
    await AsyncStorage.setItem(KEY_ONBOARDING, '1');
    setIsFirstLaunch(false);
  }, []);

  // ── Add routine ───────────────────────────────────────────────────────────
  const addRoutine = useCallback(
    async (routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine> => {
      const newRoutine: Routine = {
        ...routine,
        id: uuid(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...routines, newRoutine];
      setRoutines(updated);
      await saveRoutines(updated);

      // Also add a daily quest for today if not already present
      const today = toDateStr();
      const alreadyHasQuest = quests.some(
        q => q.kind === 'daily' && q.period === today && q.label === newRoutine.label,
      );
      if (!alreadyHasQuest) {
        const newQuest: Quest = {
          id: uuid(),
          kind: 'daily',
          label: newRoutine.label,
          targetStat: newRoutine.stat,
          progress: 0,
          goal: 1,
          done: false,
          abandoned: false,
          period: today,
          createdAt: new Date().toISOString(),
        };
        const updatedQuests = [...quests, newQuest];
        setQuests(updatedQuests);
        await saveQuests(updatedQuests);
      }

      return newRoutine;
    },
    [routines, quests],
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

  // ── Toggle routine active/inactive ────────────────────────────────────────
  const toggleRoutineActive = useCallback(
    async (id: string) => {
      const updated = routines.map((r) => r.id === id ? { ...r, active: !r.active } : r);
      setRoutines(updated);
      await saveRoutines(updated);
    },
    [routines],
  );

  // ── Complete quest ────────────────────────────────────────────────────────
  const completeQuest = useCallback(
    async (id: string) => {
      const quest = quests.find((q) => q.id === id);
      if (!quest || quest.done || quest.abandoned) return;

      const prevJob = character.job;
      // Manual completion jumps to goal → grant every not-yet-claimed milestone
      const granted = grantMilestoneRewards(quest, quest.progress, quest.goal);

      const updatedQuests = quests.map((q) =>
        q.id === id ? { ...q, done: true, progress: q.goal } : q,
      );

      if (granted.actions.length) {
        const newActions = [...actions, ...granted.actions];
        await saveActions(newActions);
        setActions(newActions);
        const derived = deriveCharacter(newActions, character);
        setCharacter(derived);
        await saveCharacter(derived);
        if (derived.job !== prevJob) {
          setPendingJobChange({ from: prevJob, to: derived.job });
          recordJobChange(prevJob, derived.job);
        }
      }

      setQuests(updatedQuests);
      await saveQuests(updatedQuests);
      setPendingReward(
        granted.reward ?? { label: `${quest.label} 완수! 🎉`, stat: String(quest.targetStat ?? 'gold'), amount: 10 },
      );
    },
    [quests, actions, character],
  );

  // ── Abandon quest ─────────────────────────────────────────────────────────
  const abandonQuest = useCallback(
    async (id: string) => {
      setQuests((prev) => {
        const updated = prev.map((q) =>
          q.id === id ? { ...q, abandoned: true } : q,
        );
        saveQuests(updated);
        return updated;
      });
    },
    [],
  );

  // ── Add a journal note (오늘의 한 줄) ───────────────────────────────────────
  // stat=null, amount=0 → computeStats 가 무시한다. 순수 회고 기록.
  const addJournalNote = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const note: Action = {
        id: uuid(),
        ts: new Date().toISOString(),
        type: 'rest',
        stat: null,
        amount: 0,
        note: trimmed,
        questId: null,
        routineId: null,
      };
      const newActions = [...actions, note];
      await saveActions(newActions);
      setActions(newActions);
    },
    [actions],
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

  // ── Shop: purchase / equip / use ───────────────────────────────────────────
  const purchaseItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      const item = SHOP_ITEM_MAP[itemId];
      if (!item) return false;
      if (item.kind === 'title' && inventory.ownedTitles.includes(itemId)) return false;
      if (walletGold < item.cost) return false;

      const next: Inventory = { ...inventory, spentGold: inventory.spentGold + item.cost };
      if (item.kind === 'consumable') {
        next.streakFreezes = inventory.streakFreezes + 1;
      } else if (item.kind === 'title') {
        next.ownedTitles = [...inventory.ownedTitles, itemId];
        next.equippedTitle = itemId; // 구매 시 자동 착용
      }
      setInventory(next);
      await saveInventory(next);
      return true;
    },
    [inventory, walletGold],
  );

  const equipTitle = useCallback(
    async (titleId: string | null) => {
      if (titleId !== null && !inventory.ownedTitles.includes(titleId)) return;
      const next: Inventory = { ...inventory, equippedTitle: titleId };
      setInventory(next);
      await saveInventory(next);
    },
    [inventory],
  );

  // 스트릭 복구권 사용 — 빠진 날을 메워 연속 기록을 잇는다 (어제로 lastActiveDate 설정).
  const useStreakFreeze = useCallback(async () => {
    if (inventory.streakFreezes <= 0) return;
    const nextInv: Inventory = { ...inventory, streakFreezes: inventory.streakFreezes - 1 };
    setInventory(nextInv);
    await saveInventory(nextInv);

    const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
    const nextChar: Character = { ...character, lastActiveDate: yesterday };
    setCharacter(nextChar);
    await saveCharacter(nextChar);
    setReturnInfo(null);
  }, [inventory, character]);

  return (
    <AppContext.Provider
      value={{
        loading,
        actions,
        character,
        routines,
        quests,
        jobHistory,
        inventory,
        walletGold,
        todayDone,
        isFirstLaunch,
        pendingJobChange,
        pendingReward,
        returnInfo,
        clearJobChange,
        clearReward,
        dismissReturn,
        completeOnboarding,
        recordRoutine,
        addRoutine,
        removeRoutine,
        toggleRoutineActive,
        completeQuest,
        abandonQuest,
        addJournalNote,
        addMainQuest,
        purchaseItem,
        equipTitle,
        useStreakFreeze,
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
