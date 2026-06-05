/**
 * 캐릭터 보이스 — 직업 × 상황별 한마디. (기획서 11장)
 * getVoice(job, situation): 해당 직업 문구가 없으면 DEFAULT로 폴백.
 * 문구만 바꾸려면 이 파일만 수정하면 된다.
 */
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
  paladin: {
    complete_one:    '신의 가호가 함께해요.',
    complete_all:    '오늘의 서약, 지켰습니다.',
    inactive:        '서약이 흔들리고 있어요. 다시 일어설 때예요.',
    job_change:      '새로운 사명이 깃들고 있어요.',
    streak_broken:   '기사는 다시 일어나는 존재예요.',
  },
  alchemist: {
    complete_one:    '실험이 진전되고 있어요 ⚗️',
    complete_all:    '오늘의 조합, 성공입니다.',
    inactive:        '플라스크가 굳어가고 있어요. 다시 실험해볼까요?',
    job_change:      '새로운 원소가 깨어나고 있어요.',
    streak_broken:   '실패도 데이터예요. 다시 시작해요.',
  },
  hunter: {
    complete_one:    '발자국이 더 선명해지고 있어요.',
    complete_all:    '오늘 사냥, 완벽했어요.',
    inactive:        '감각이 무뎌지고 있어요. 다시 움직여볼까요?',
    job_change:      '새로운 사냥터가 열리고 있어요.',
    streak_broken:   '잠깐 쉬었을 뿐이에요. 다시 추적해요.',
  },
  sage: {
    complete_one:    '지혜가 한 겹 쌓였어요.',
    complete_all:    '오늘의 통찰, 훌륭했습니다.',
    inactive:        '지식이 먼지를 쌓고 있어요. 다시 열어볼까요?',
    job_change:      '새로운 깨달음이 찾아오고 있어요.',
    streak_broken:   '현자도 쉬는 법을 알아요. 다시 시작해요.',
  },
  healer: {
    complete_one:    '따뜻한 기운이 퍼지고 있어요.',
    complete_all:    '오늘도 잘 돌봐주셨어요 💚',
    inactive:        '치유의 손길이 필요해요. 준비되셨나요?',
    job_change:      '치유의 빛이 달라지고 있어요.',
    streak_broken:   '상처는 천천히 낫는 법이에요.',
  },
  martial_artist: {
    complete_one:    '기가 충만해지고 있어요.',
    complete_all:    '오늘의 수련, 경지에 달했어요.',
    inactive:        '기가 흩어지고 있어요. 다시 모아볼까요?',
    job_change:      '새로운 경지가 열리고 있어요.',
    streak_broken:   '수련은 다시 시작할 수 있어요.',
  },
  astrologer: {
    complete_one:    '별빛이 더 밝아지고 있어요 ✨',
    complete_all:    '오늘 별의 흐름을 잘 읽었어요.',
    inactive:        '별들이 기다리고 있어요. 다시 관측해볼까요?',
    job_change:      '새로운 별자리가 떠오르고 있어요.',
    streak_broken:   '별은 항상 그 자리에 있어요.',
  },
  adventurer: {
    complete_one:    '모험이 무르익고 있어요!',
    complete_all:    '오늘의 대모험, 완료! 🗺️',
    inactive:        '모험이 멈춰 있어요. 다시 떠나볼까요?',
    job_change:      '새로운 지평이 열리고 있어요.',
    streak_broken:   '모험자는 다시 길을 찾아요.',
  },
  novice: {
    complete_one:    '첫 걸음을 내딛었어요.',
    complete_all:    '오늘도 잘 해냈어요! 앞으로가 기대돼요.',
    inactive:        '아직 길을 찾고 있는 중이에요.',
    job_change:      '새로운 직업이 눈앞에 있어요!',
    streak_broken:   '괜찮아요. 오늘이 새로운 시작이에요.',
  },
};

export function getVoice(job: JobId, situation: VoiceSituation): string {
  return VOICES[job]?.[situation] ?? DEFAULT[situation];
}
