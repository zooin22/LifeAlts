import { TimeOfDay } from '../types';

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'sunset';
  return 'night';
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
