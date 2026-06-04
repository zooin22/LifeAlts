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
