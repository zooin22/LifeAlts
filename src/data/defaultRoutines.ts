import { ActionType, Routine, StatKey } from '../types';
import { uuid } from '../utils/uuid';

interface RoutineSeed {
  label: string;
  type: ActionType;
  stat: StatKey | 'gold';
  amount: number;
}

export const ROUTINE_SUGGESTIONS: RoutineSeed[] = [
  { label: '🏃 운동 30분',    type: 'exercise', stat: 'str',    amount: 5 },
  { label: '🚶 걷기 30분',    type: 'exercise', stat: 'str',    amount: 3 },
  { label: '📖 독서 30분',    type: 'study',    stat: 'int',    amount: 5 },
  { label: '✏️ 공부 1시간',   type: 'study',    stat: 'int',    amount: 8 },
  { label: '💧 물 8잔',       type: 'health',   stat: 'health', amount: 3 },
  { label: '🥗 식사 챙기기',  type: 'health',   stat: 'health', amount: 4 },
  { label: '🧘 명상 10분',    type: 'rest',     stat: 'wis',    amount: 3 },
  { label: '😴 일찍 자기',    type: 'rest',     stat: 'wis',    amount: 4 },
  { label: '💬 친구와 대화',  type: 'social',   stat: 'cha',    amount: 4 },
  { label: '🤝 새 사람 만남', type: 'social',   stat: 'cha',    amount: 5 },
  { label: '🎨 창작 활동',    type: 'create',   stat: 'dex',    amount: 5 },
  { label: '🎸 악기 연습',    type: 'create',   stat: 'dex',    amount: 4 },
  { label: '💼 업무',         type: 'work',     stat: 'gold',   amount: 5 },
];

export function makeSeedRoutine(seed: RoutineSeed): Routine {
  return {
    id: uuid(),
    label: seed.label,
    type: seed.type,
    stat: seed.stat,
    amount: seed.amount,
    active: true,
    createdAt: new Date().toISOString(),
  };
}
