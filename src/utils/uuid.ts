/** 간단한 로컬 고유 ID 생성기 (timestamp + 랜덤). 서버 없는 1단계엔 충분. */
export function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
