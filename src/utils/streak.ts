/**
 * 연속 기록(스트릭) 유틸.
 * - 같은 날 다시 기록 → 변화 없음
 * - 어제 기록했으면 → +1
 * - 그 외(공백) → 1로 리셋
 * 공백을 메우려면 스트릭 복구권(AppContext.useStreakFreeze)으로 lastActiveDate를 어제로 당긴다.
 */

/** Date → 'YYYY-MM-DD' (로컬 날짜 비교용 키). */
export function toDateStr(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function updateStreak(
  lastActiveDate: string | null,
  streak: number,
  longestStreak: number,
): { streak: number; longestStreak: number; lastActiveDate: string } {
  const today = toDateStr();
  if (lastActiveDate === today) {
    return { streak, longestStreak, lastActiveDate: today };
  }
  const yesterday = toDateStr(new Date(Date.now() - 86_400_000));
  const newStreak = lastActiveDate === yesterday ? streak + 1 : 1;
  return {
    streak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastActiveDate: today,
  };
}
