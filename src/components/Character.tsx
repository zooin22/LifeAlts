import React from 'react';
import SvgCharacter, { SvgCharacterProps } from './character/SvgCharacter';
import { RIVE_ENABLED } from './character/riveConfig';

export type CharacterProps = SvgCharacterProps;

export default function Character(props: CharacterProps) {
  if (RIVE_ENABLED) {
    // Template-literal require: Metro 정적 분석 우회 → Expo Go 안전.
    // assets/character.riv + dev build 준비 후 RIVE_ENABLED=true 로 전환.
    const mod = 'RiveCharacter';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RiveChar = require(`./character/${mod}`).default as React.ComponentType<CharacterProps>;
    return <RiveChar {...props} />;
  }
  return <SvgCharacter {...props} />;
}
