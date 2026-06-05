// ============================================================================
// 앱 전역 타입 정의 (단일 소스). 다른 파일은 여기서 import 한다.
// 스키마는 2단계(도감·친구·동기화) 확장을 대비해 여유 있게 설계됨.
// ============================================================================

// ─── Stats ───────────────────────────────────────────────────────────────────

export type StatKey = 'str' | 'int' | 'cha' | 'dex' | 'wis' | 'health';

export type Stats = Record<StatKey, number>;

export const STAT_LABELS: Record<StatKey, string> = {
  str: '🏃 힘',
  int: '📖 지능',
  cha: '💬 매력',
  dex: '🎨 손재주',
  wis: '😌 정신',
  health: '💧 건강',
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type ActionType =
  | 'exercise'
  | 'study'
  | 'social'
  | 'create'
  | 'rest'
  | 'health'
  | 'work';

export interface Action {
  id: string;
  ts: string;           // ISO datetime
  type: ActionType;
  stat: StatKey | 'gold' | null;
  amount: number;       // weight: small(1) ~ large(10)
  note: string | null;
  questId: string | null;
  routineId: string | null;
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export interface Routine {
  id: string;
  label: string;
  type: ActionType;
  stat: StatKey | 'gold';
  amount: number;
  active: boolean;
  createdAt: string;
}

// ─── Quests ──────────────────────────────────────────────────────────────────

export type QuestKind = 'daily' | 'main';

export interface Quest {
  id: string;
  kind: QuestKind;
  label: string;
  targetStat: StatKey | 'gold' | null;
  progress: number;
  goal: number;
  done: boolean;
  abandoned: boolean;
  period: string;       // daily: 'YYYY-MM-DD' / main: 'YYYY'
  createdAt: string;
}

// ─── Job History (직업 변천사) ─────────────────────────────────────────────────

export interface JobChangeEvent {
  id: string;
  ts: string;          // ISO datetime — 전환 시각
  from: JobId;
  to: JobId;
}

// ─── Inventory (상점 / 소지품) ──────────────────────────────────────────────────

export interface Inventory {
  spentGold: number;            // 누적 사용 금화 (소지금 = 평생 번 금화 − spentGold)
  streakFreezes: number;        // 보유한 스트릭 복구권 개수
  ownedTitles: string[];        // 구매한 칭호 id 목록
  equippedTitle: string | null; // 착용 중인 칭호 id
}

// ─── Character ────────────────────────────────────────────────────────────────

export type JobId =
  // 단일 직업
  | 'novice'
  | 'warrior'
  | 'mage'
  | 'bard'
  | 'rogue'
  | 'monk'
  | 'naturalist'
  | 'merchant'
  // 조합 직업 (추후 추가)
  | 'paladin'
  | 'alchemist'
  | 'hunter'
  | 'sage'
  | 'healer'
  | 'martial_artist'
  | 'astrologer'
  // 숨은 직업
  | 'adventurer';

export interface Character {
  stats: Stats;
  gold: number;
  job: JobId;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  cosmetics: {
    theme?: string;
  };
}

// ─── Job Definition ──────────────────────────────────────────────────────────

export interface JobDef {
  id: JobId;
  name: string;
  primaryStat: StatKey | 'gold' | null;
  secondaryStat: StatKey | 'gold' | null;
  description: string;
}

// ─── Time of Day ─────────────────────────────────────────────────────────────

export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';
