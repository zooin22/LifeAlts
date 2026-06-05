/**
 * 직업 정의 — 16종 (단일 8 + 조합 7 + 숨은 1).
 * 판정 로직은 utils/jobEngine.ts. 여기엔 표시용 이름/설명/대표 스탯만.
 * 새 직업 추가 시 types의 JobId, jobEngine 매핑, SvgCharacter 팔레트, voices도 함께 갱신.
 */
import { JobDef } from '../types';

export const JOBS: JobDef[] = [
  {
    id: 'novice',
    name: '견습생',
    primaryStat: null,
    secondaryStat: null,
    description: '아직 자신의 길을 찾고 있어요.',
  },
  {
    id: 'warrior',
    name: '전사',
    primaryStat: 'str',
    secondaryStat: null,
    description: '몸을 단련하고 강인함을 추구합니다.',
  },
  {
    id: 'mage',
    name: '마법사',
    primaryStat: 'int',
    secondaryStat: null,
    description: '지식을 탐구하고 배움에 열중합니다.',
  },
  {
    id: 'bard',
    name: '음유시인',
    primaryStat: 'cha',
    secondaryStat: null,
    description: '사람들과 교류하며 이야기를 나눕니다.',
  },
  {
    id: 'rogue',
    name: '도적',
    primaryStat: 'dex',
    secondaryStat: null,
    description: '손재주와 창의력으로 무언가를 만듭니다.',
  },
  {
    id: 'monk',
    name: '수도사',
    primaryStat: 'wis',
    secondaryStat: null,
    description: '내면을 가꾸고 마음의 평화를 추구합니다.',
  },
  {
    id: 'naturalist',
    name: '자연인',
    primaryStat: 'health',
    secondaryStat: null,
    description: '몸의 건강을 챙기며 자연스러운 삶을 삽니다.',
  },
  {
    id: 'merchant',
    name: '상인',
    primaryStat: 'gold',
    secondaryStat: null,
    description: '일에 집중하며 금화를 쌓아갑니다.',
  },
  // 조합 직업
  {
    id: 'paladin',
    name: '성기사',
    primaryStat: 'str',
    secondaryStat: 'cha',
    description: '강함과 따뜻함을 함께 갖춘 사람.',
  },
  {
    id: 'alchemist',
    name: '연금술사',
    primaryStat: 'int',
    secondaryStat: 'dex',
    description: '지식을 손으로 구현하는 창조자.',
  },
  {
    id: 'hunter',
    name: '사냥꾼',
    primaryStat: 'str',
    secondaryStat: 'dex',
    description: '몸과 손이 함께 움직이는 행동파.',
  },
  {
    id: 'sage',
    name: '현자',
    primaryStat: 'int',
    secondaryStat: 'cha',
    description: '지혜로 사람의 마음을 움직입니다.',
  },
  {
    id: 'healer',
    name: '치유사',
    primaryStat: 'cha',
    secondaryStat: 'wis',
    description: '사람과 교류하며 마음을 어루만집니다.',
  },
  {
    id: 'martial_artist',
    name: '무도가',
    primaryStat: 'str',
    secondaryStat: 'wis',
    description: '강인한 몸과 고요한 정신을 겸비했습니다.',
  },
  {
    id: 'astrologer',
    name: '점성술사',
    primaryStat: 'int',
    secondaryStat: 'wis',
    description: '사유와 통찰로 세계를 바라봅니다.',
  },
  // 숨은 직업
  {
    id: 'adventurer',
    name: '모험가',
    primaryStat: null,
    secondaryStat: null,
    description: '모든 것을 골고루 — 삶 자체를 모험으로.',
  },
];

export const JOB_MAP = Object.fromEntries(JOBS.map((j) => [j.id, j])) as Record<
  string,
  JobDef
>;
