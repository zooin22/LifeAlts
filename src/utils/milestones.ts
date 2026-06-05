/**
 * 메인 퀘스트 마일스톤 보상 — 기획서 8장 "메인(마일스톤 보상)".
 *
 * 목표 진행도가 25/50/75/100% 지점을 넘을 때 금화 보상을 지급한다.
 * 보상은 actions 원장에 reward action 으로 적립되어 파생 스탯/골드 모델과 일관됨.
 * (메인 퀘스트는 "조정불가" 라 목표를 낮춰 보상을 파밍하는 악용이 어렵다.)
 */

export const MILESTONE_FRACTIONS = [0.25, 0.5, 0.75, 1.0] as const;

const MILESTONE_GOLD: Record<number, number> = {
  0.25: 3,
  0.5: 5,
  0.75: 8,
  1.0: 15, // 완수 보너스
};

/** 해당 비율의 마일스톤이 달성되는 진행도(횟수). 최소 1. */
export function milestoneThreshold(frac: number, goal: number): number {
  return Math.max(1, Math.ceil(goal * frac));
}

/**
 * 진행도가 oldP → newP 로 오를 때 새로 넘은 마일스톤 비율 목록.
 * 작은 목표(예: goal 1~3)는 여러 비율이 같은 threshold 로 겹치므로,
 * threshold 당 가장 높은 비율 하나만 인정한다.
 */
export function crossedMilestones(oldP: number, newP: number, goal: number): number[] {
  const byThreshold = new Map<number, number>(); // threshold → 최고 비율
  for (const f of MILESTONE_FRACTIONS) {
    byThreshold.set(milestoneThreshold(f, goal), f); // 뒤(높은 비율)가 덮어씀
  }
  const result: number[] = [];
  for (const [t, f] of byThreshold) {
    if (oldP < t && newP >= t) result.push(f);
  }
  return result.sort((a, b) => a - b);
}

/** 마일스톤 비율의 금화 보상. */
export function milestoneGold(frac: number): number {
  return MILESTONE_GOLD[frac] ?? 5;
}

/** 진행도가 이미 넘긴 마일스톤 비율 목록 (UI 표시용). */
export function reachedMilestones(progress: number, goal: number): Set<number> {
  const reached = new Set<number>();
  for (const f of MILESTONE_FRACTIONS) {
    if (progress >= milestoneThreshold(f, goal)) reached.add(f);
  }
  return reached;
}
