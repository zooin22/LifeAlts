import { JobId } from '../types';

export type VoiceSituation =
  | 'complete_one'
  | 'complete_all'
  | 'inactive'
  | 'job_change'
  | 'streak_broken';

type VoiceMap = Record<VoiceSituation, string>;

const DEFAULT: VoiceMap = {
  complete_one:    '오늘도 한 걸음 ✨',
  complete_all:    '오늘의 수련, 완벽했어요',
  inactive:        '잠깐 잠든 것 같아요. 깨워볼까요?',
  job_change:      '무언가 달라지고 있어요…',
  streak_broken:   '괜찮아요. 오늘 다시 시작하면 돼요.',
};

const VOICES: Partial<Record<JobId, VoiceMap>> = {
  warrior: {
    complete_one:    '좋은 수련이었다.',
    complete_all:    '오늘의 단련, 완료다.',
    inactive:        '검이 녹슬고 있다… 다시 들 때가 됐다.',
    job_change:      '새로운 길이 열렸다.',
    streak_broken:   '잠깐 멈췄을 뿐이다. 다시 시작한다.',
  },
  mage: {
    complete_one:    '마나가 차오르네요.',
    complete_all:    '오늘의 연구, 훌륭했습니다.',
    inactive:        '마나가 옅어졌네요. 다시 채워볼까요?',
    job_change:      '새로운 지식이 깨어나고 있어요.',
    streak_broken:   '마법사도 쉴 때가 있죠. 다시 시작해요.',
  },
  bard: {
    complete_one:    '멋진 공연이었어요!',
    complete_all:    '오늘 무대, 완벽했어요 🎵',
    inactive:        '무대가 조용하네요… 당신 이야기가 그리워요.',
    job_change:      '새로운 이야기가 시작돼요.',
    streak_broken:   '잠깐 쉰 거예요. 무대는 항상 열려 있어요.',
  },
  rogue: {
    complete_one:    '깔끔하게 해냈군요.',
    complete_all:    '완벽한 솜씨였어요.',
    inactive:        '손이 굳어가고 있어요. 다시 움직여볼까요?',
    job_change:      '다른 기술이 깨어나고 있어요.',
    streak_broken:   '실수는 누구나 해요. 다시 시작하면 돼요.',
  },
  monk: {
    complete_one:    '내면이 고요해지고 있어요.',
    complete_all:    '오늘의 수행, 충만했습니다.',
    inactive:        '정신이 흔들리고 있어요. 잠시 멈춰볼까요?',
    job_change:      '깨달음이 찾아오고 있어요.',
    streak_broken:   '흔들림도 수행의 일부예요.',
  },
  naturalist: {
    complete_one:    '몸이 고마워하고 있어요.',
    complete_all:    '오늘 몸을 잘 챙겼어요 🌿',
    inactive:        '몸이 좀 지쳐 있는 것 같아요. 챙겨줄까요?',
    job_change:      '자연스러운 변화가 오고 있어요.',
    streak_broken:   '쉬는 것도 건강의 일부예요.',
  },
  merchant: {
    complete_one:    '금화가 쌓이고 있어요 💰',
    complete_all:    '오늘도 장사 잘 됐네요~',
    inactive:        '가게 문을 며칠 닫으셨네요. 손님 떠나요~',
    job_change:      '새로운 거래가 시작돼요.',
    streak_broken:   '영업 재개해요. 손님이 기다려요.',
  },
};

export function getVoice(job: JobId, situation: VoiceSituation): string {
  return VOICES[job]?.[situation] ?? DEFAULT[situation];
}
