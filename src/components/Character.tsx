import React from 'react';
import SvgCharacter, { SvgCharacterProps } from './character/SvgCharacter';
import { RIVE_ENABLED } from './character/riveConfig';

// ⬇️ Rive 활성화 시 이 줄의 주석을 해제 (riveConfig.ts 상단 체크리스트 참고)
// import RiveCharacter from './character/RiveCharacter';

/**
 * 캐릭터 파사드 — 앱 전체는 이 컴포넌트만 사용한다.
 * 개발문서 §3 원칙대로 앱은 `job`(→ Rive `job_id`)과
 * `celebrate`(→ Rive `is_success` 트리거)만 넘기고, 렌더 방식(SVG/Rive)은 감춘다.
 *
 * 현재: 직접 만든 SVG 페이퍼돌 (Expo Go 호환).
 * 향후: riveConfig.ts 의 RIVE_ENABLED=true 로 바꾸고 아래 import/return 주석을 해제하면
 *       Rive 상태 머신 렌더로 전환된다. 소비자 코드는 한 줄도 바꿀 필요 없음.
 */
export type CharacterProps = SvgCharacterProps;

export default function Character(props: CharacterProps) {
  if (RIVE_ENABLED) {
    // return <RiveCharacter {...props} />;
  }
  return <SvgCharacter {...props} />;
}
