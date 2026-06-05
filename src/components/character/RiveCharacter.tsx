// Character.tsx 파사드가 RIVE_ENABLED=true 일 때만 dynamic require 로 로드된다.
// → Metro 번들에 포함되지 않으므로 Expo Go 안전. dev build 전용.
// 활성화 순서: riveConfig.ts 체크리스트 참고.
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Rive, { RiveRef, Fit, Alignment } from 'rive-react-native';
import { JobId } from '../../types';
import SvgCharacter, { CharacterMood } from './SvgCharacter';
import { STATE_MACHINE, RIVE_INPUTS, jobToRiveId, moodToRiveId } from './riveConfig';

// Rive 에디터에서 내보낸 캐릭터 에셋. assets/character.riv 에 배치.
const RIVE_ASSET = require('../../../assets/character.riv');

export interface RiveCharacterProps {
  job: JobId;
  size?: number;
  /** 퀘스트 완수 성장 연출 트리거 (Rive `is_success`). */
  celebrate?: boolean;
  /** 표정 (Rive `mood` Number input). */
  mood?: CharacterMood;
}

/**
 * 개발문서 §3 구조: 앱은 애니메이션을 직접 제어하지 않고
 * `job_id`(Number) 와 `is_success`(Trigger) 입력만 상태 머신에 전달한다.
 * 의상 전환·성장 액션은 Rive 내부 상태 머신이 처리.
 */
export default function RiveCharacter({ job, size = 160, celebrate = false, mood = 'idle' }: RiveCharacterProps) {
  const riveRef = useRef<RiveRef>(null);

  // 직업 변경 → job_id 숫자 입력 갱신 → 상태 머신이 의상 전환
  useEffect(() => {
    riveRef.current?.setInputState(STATE_MACHINE, RIVE_INPUTS.jobId, jobToRiveId(job));
  }, [job]);

  // 표정 변경 → mood 숫자 입력 갱신
  useEffect(() => {
    riveRef.current?.setInputState(STATE_MACHINE, RIVE_INPUTS.mood, moodToRiveId(mood));
  }, [mood]);

  // 퀘스트 완수 → is_success 트리거 발동 → 성장 연출 재생
  useEffect(() => {
    if (celebrate) {
      riveRef.current?.fireState(STATE_MACHINE, RIVE_INPUTS.success);
    }
  }, [celebrate]);

  return (
    <View style={{ width: size, height: size * 1.55 }}>
      <Rive
        ref={riveRef}
        source={RIVE_ASSET}
        stateMachineName={STATE_MACHINE}
        fit={Fit.Contain}
        alignment={Alignment.Center}
        autoplay
        style={{ width: '100%', height: '100%' }}
        // 에셋 로드 실패 시 SVG 폴백으로 자연스럽게 떨어지도록
        onError={() => { /* no-op: 파사드가 폴백 처리 */ }}
      />
    </View>
  );
}
