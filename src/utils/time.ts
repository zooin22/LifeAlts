/**
 * 시간대 유틸 — "살아있는 세계"(기획서 12장)의 근간.
 * 기기 시각 → 아침/낮/노을/밤 판정 + 시간대별 색 팔레트(TIME_PALETTE).
 * Background.tsx와 HUD 강조색이 이 값을 따라 바뀐다. 구간/색은 여기서 튜닝.
 */
import { useEffect, useState } from 'react';
import { TimeOfDay } from '../types';

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'sunset';
  return 'night';
}

/**
 * 라이브 시간대 훅 — 1분마다 확인해 시간대가 바뀌면 리렌더한다.
 * 앱을 켜둔 채 경계(예: 17시)를 넘으면 배경/강조색이 스스로 갱신된다.
 * 값이 그대로면 setState가 bail-out 되어 불필요한 리렌더는 없다.
 */
export function useTimeOfDay(): TimeOfDay {
  const [tod, setTod] = useState<TimeOfDay>(() => getTimeOfDay());
  useEffect(() => {
    const id = setInterval(() => {
      setTod((prev) => {
        const now = getTimeOfDay();
        return now !== prev ? now : prev;
      });
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return tod;
}

export function getGreeting(t: TimeOfDay): string {
  switch (t) {
    case 'morning': return '좋은 아침이에요';
    case 'day':     return '오늘도 열심히!';
    case 'sunset':  return '노을이 지고 있어요';
    case 'night':   return '별이 뜨는 밤이에요';
  }
}

export const TIME_PALETTE: Record<TimeOfDay, {
  sky: string;
  ground: string;
  accent: string;
  text: string;
}> = {
  morning: { sky: '#FFF0C0', ground: '#F5DEB3', accent: '#F4A460', text: '#4A3000' },
  day:     { sky: '#B0E0FF', ground: '#D4EDDA', accent: '#4A90D9', text: '#0D2B52' },
  sunset:  { sky: '#8B3A62', ground: '#C88060', accent: '#FF6B35', text: '#F8E0D0' },
  night:   { sky: '#0D1B2A', ground: '#1A2A3A', accent: '#4A6FA5', text: '#D0D8FF' },
};
