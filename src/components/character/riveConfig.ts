import { JobId } from '../../types';

/**
 * Rive 통합 설정 — 개발문서 §3 "캐릭터 렌더 (Rive 기반 상태 머신 제어)" 기준.
 *
 * 앱 코드는 애니메이션을 직접 제어하지 않는다. 오직 아래 두 입력(input)만
 * `.riv` 파일의 상태 머신(State Machine)에 전달하고, 의상 전환·성장 연출은
 * Rive 에디터 내부 로직이 알아서 처리한다.
 *
 * ── Rive 전환 체크리스트 ───────────────────────────────────────────────
 *  ✅ 1. `rive-react-native` 설치 완료 (v9.8.3)
 *
 *  남은 단계:
 *  2. Rive 에디터에서 `character.riv` 제작:
 *       - 베이스 캐릭터 + 직업별 의상 레이어 (페이퍼돌)
 *       - 상태 머신 이름: STATE_MACHINE (= 'State Machine 1')
 *       - Number input  `job_id`    (아래 JOB_ID_MAP 숫자값과 일치)
 *       - Number input  `mood`      (0 idle / 1 happy / 2 sleepy / 3 celebrate)
 *       - Trigger input `is_success` (퀘스트 완수 성장 연출)
 *       - 기본 idle(숨쉬기) 애니메이션
 *  3. 완성된 파일을 `assets/character.riv` 에 배치
 *  4. `npx expo prebuild` 후 개발 빌드 생성 (네이티브 모듈 링크)
 *  5. 이 파일의 `RIVE_ENABLED = true` 로 변경
 *  → Character.tsx 파사드가 자동으로 RiveCharacter 를 렌더한다. 소비자 코드 변경 없음.
 */

/** .riv 에셋 + 네이티브 모듈이 준비되면 true 로. 현재는 SVG 폴백. */
export const RIVE_ENABLED = false;

/** Rive 에디터에서 만든 상태 머신 이름. */
export const STATE_MACHINE = 'State Machine 1';

/** 상태 머신 입력 이름 — 에디터에서 동일하게 명명해야 함. */
export const RIVE_INPUTS = {
  jobId: 'job_id',       // Number: 현재 직업
  success: 'is_success', // Trigger: 퀘스트 완수 성장 연출
  mood: 'mood',          // Number: 표정 (0 idle / 1 happy / 2 sleepy / 3 celebrate)
} as const;

/** 표정 → Rive `mood` 숫자값. SvgCharacter 의 CharacterMood 와 1:1. */
export const MOOD_MAP = {
  idle: 0,
  happy: 1,
  sleepy: 2,
  celebrate: 3,
} as const;

export type CharacterMood = keyof typeof MOOD_MAP;

export function moodToRiveId(mood: CharacterMood): number {
  return MOOD_MAP[mood] ?? 0;
}

/**
 * JobId → Rive `job_id` 숫자값.
 * Rive 에디터의 의상 전환 분기와 1:1 매칭. 순서/숫자 바뀌면 에디터도 같이 수정.
 */
export const JOB_ID_MAP: Record<JobId, number> = {
  novice:         0,
  warrior:        1,
  mage:           2,
  bard:           3,
  rogue:          4,
  monk:           5,
  naturalist:     6,
  merchant:       7,
  paladin:        8,
  alchemist:      9,
  hunter:         10,
  sage:           11,
  healer:         12,
  martial_artist: 13,
  astrologer:     14,
  adventurer:     15,
};

export function jobToRiveId(job: JobId): number {
  return JOB_ID_MAP[job] ?? 0;
}
