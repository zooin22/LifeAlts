/**
 * SvgCharacter — 직접 그린 SVG 치비 페이퍼돌 (현재 기본 렌더러).
 *
 * 직업별 색 팔레트(JOB_PALETTE) + 액세서리(Accessory/LeftItem)로 의상을 표현하고,
 * mood(idle/happy/sleepy/celebrate)로 표정(Face)을, celebrate로 펄스 바운스를 준다.
 * idle 호흡 애니메이션은 항상 재생. Rive로 교체 시 이 컴포넌트가 폴백이 된다.
 * (앱은 이 파일을 직접 쓰지 않고 ../Character 파사드를 통해 사용)
 */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Rect, Ellipse, Path, G } from 'react-native-svg';
import { JobId } from '../../types';

export type CharacterMood = 'idle' | 'happy' | 'sleepy' | 'celebrate';

interface Palette {
  armor: string;
  trim: string;
  hair: string;
  accessory: string;
}

const JOB_PALETTE: Record<JobId, Palette> = {
  novice:         { armor: '#A0A0A0', trim: '#D0D0D0', hair: '#8B6040', accessory: '#C0C0C0' },
  warrior:        { armor: '#9B2020', trim: '#D4A030', hair: '#2C1810', accessory: '#CC4040' },
  mage:           { armor: '#5B10A0', trim: '#C090FF', hair: '#200050', accessory: '#A060E0' },
  bard:           { armor: '#D4A020', trim: '#FF9000', hair: '#4A2800', accessory: '#FFD040' },
  rogue:          { armor: '#2F4F4F', trim: '#90A090', hair: '#1A1A1A', accessory: '#607060' },
  monk:           { armor: '#EEE8C8', trim: '#FFD700', hair: '#4A3000', accessory: '#D4C090' },
  naturalist:     { armor: '#2A8B2A', trim: '#90EE90', hair: '#2D4A10', accessory: '#60CC60' },
  merchant:       { armor: '#9B7010', trim: '#FFD700', hair: '#3A2800', accessory: '#DDA830' },
  paladin:        { armor: '#7080C8', trim: '#FFD700', hair: '#2A1060', accessory: '#A0B0E0' },
  alchemist:      { armor: '#7A1DC0', trim: '#00FA9A', hair: '#2A0050', accessory: '#90F0B0' },
  hunter:         { armor: '#5A6B2F', trim: '#A06030', hair: '#2A3510', accessory: '#8B6040' },
  sage:           { armor: '#5A4DA0', trim: '#E0E0FF', hair: '#1A1250', accessory: '#B0B0F0' },
  healer:         { armor: '#30B0A8', trim: '#F0FFF0', hair: '#184840', accessory: '#80E0D8' },
  martial_artist: { armor: '#A01010', trim: '#F5F5F5', hair: '#1A0A0A', accessory: '#E04040' },
  astrologer:     { armor: '#1A1980', trim: '#FFD700', hair: '#0A0830', accessory: '#6060D0' },
  adventurer:     { armor: '#9B5010', trim: '#DAA520', hair: '#3A2010', accessory: '#C08040' },
};

// Job accessories rendered on the right side of character
function Accessory({ job, p }: { job: JobId; p: Palette }) {
  switch (job) {
    case 'warrior':
    case 'paladin':
    case 'martial_artist':
      // Sword
      return (
        <G>
          <Rect x={72} y={62} width={5} height={38} rx={2} fill={p.trim} />
          <Rect x={66} y={70} width={17} height={4} rx={2} fill={p.accessory} />
          <Ellipse cx={74.5} cy={60} rx={4} ry={5} fill={p.accessory} />
        </G>
      );
    case 'mage':
    case 'astrologer':
      // Staff
      return (
        <G>
          <Rect x={74} y={52} width={4} height={52} rx={2} fill={p.trim} />
          <Circle cx={76} cy={48} r={8} fill={p.accessory} opacity={0.9} />
          <Circle cx={76} cy={48} r={5} fill={p.trim} opacity={0.8} />
        </G>
      );
    case 'bard':
      // Music note
      return (
        <G>
          <Circle cx={78} cy={72} r={6} fill={p.accessory} />
          <Rect x={83} y={58} width={3} height={15} rx={1} fill={p.accessory} />
        </G>
      );
    case 'rogue':
    case 'hunter':
      // Dagger
      return (
        <G>
          <Rect x={73} y={64} width={4} height={28} rx={1.5} fill={p.trim} />
          <Rect x={69} y={70} width={12} height={3} rx={1} fill={p.accessory} />
        </G>
      );
    case 'monk':
    case 'healer':
      // Prayer beads / orb
      return (
        <G>
          {[0, 1, 2, 3, 4].map(i => (
            <Circle key={i} cx={75} cy={62 + i * 10} r={4} fill={p.accessory} opacity={0.85} />
          ))}
        </G>
      );
    case 'naturalist':
      // Leaf staff
      return (
        <G>
          <Rect x={74} y={56} width={4} height={46} rx={2} fill="#5A7A2A" />
          <Ellipse cx={76} cy={52} rx={9} ry={12} fill="#40B040" opacity={0.9} />
          <Ellipse cx={76} cy={52} rx={6} ry={8} fill="#60D060" opacity={0.7} />
        </G>
      );
    case 'merchant':
      // Coin bag
      return (
        <G>
          <Ellipse cx={76} cy={80} rx={11} ry={14} fill={p.accessory} />
          <Ellipse cx={76} cy={68} rx={6} ry={5} fill={p.trim} />
          <Rect x={73} y={64} width={6} height={5} rx={2} fill="#B8860B" />
        </G>
      );
    case 'alchemist':
      // Flask
      return (
        <G>
          <Rect x={73} y={58} width={6} height={8} rx={2} fill={p.trim} />
          <Ellipse cx={76} cy={74} rx={9} ry={12} fill={p.accessory} opacity={0.85} />
          <Ellipse cx={76} cy={74} rx={7} ry={10} fill={p.trim} opacity={0.4} />
        </G>
      );
    case 'sage':
      // Book
      return (
        <G>
          <Rect x={66} y={64} width={18} height={24} rx={3} fill={p.accessory} />
          <Rect x={68} y={67} width={14} height={2} rx={1} fill={p.trim} opacity={0.8} />
          <Rect x={68} y={72} width={14} height={2} rx={1} fill={p.trim} opacity={0.8} />
          <Rect x={68} y={77} width={10} height={2} rx={1} fill={p.trim} opacity={0.8} />
        </G>
      );
    default:
      // Adventurer: compass
      return (
        <G>
          <Circle cx={76} cy={74} r={10} fill={p.accessory} />
          <Circle cx={76} cy={74} r={7} fill="#DDD" opacity={0.9} />
          <Rect x={75} y={66} width={2} height={8} rx={1} fill="#E04040" />
          <Rect x={72} y={73} width={8} height={2} rx={1} fill="#404040" />
        </G>
      );
  }
}

// Left-hand shield for paladin/warrior, or just hand otherwise
function LeftItem({ job, p }: { job: JobId; p: Palette }) {
  if (job === 'paladin' || job === 'warrior') {
    return (
      <G>
        <Path
          d="M22 66 Q14 72 14 84 Q14 98 22 106 Q26 110 30 106 Q38 98 38 84 Q38 72 30 66 Z"
          fill={p.armor}
          opacity={0.95}
        />
        <Path
          d="M24 70 Q18 76 18 84 Q18 96 24 103 Q26 106 30 103 Q36 96 36 84 Q36 76 30 70 Z"
          fill={p.trim}
          opacity={0.6}
        />
        <Circle cx={26} cy={86} r={5} fill={p.trim} opacity={0.9} />
      </G>
    );
  }
  return null;
}

// Mood-dependent facial expression (eyes / brows / mouth). viewBox 100×155.
function Face({ mood, hair, skinDark }: { mood: CharacterMood; hair: string; skinDark: string }) {
  const nose = <Circle cx={50} cy={41} r={1.5} fill={skinDark} opacity={0.6} />;

  if (mood === 'sleepy') {
    return (
      <G>
        {/* Droopy half-closed eyes */}
        <Path d="M35 35 Q41 38 47 35" stroke="#333" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <Path d="M53 35 Q59 38 65 35" stroke="#333" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        {/* Relaxed brows */}
        <Path d="M36 28 Q41 27 46 28" stroke={hair} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <Path d="M54 28 Q59 27 64 28" stroke={hair} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {nose}
        {/* Small calm mouth */}
        <Path d="M46 47 Q50 49 54 47" stroke="#D4826A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* zzz */}
        <Path d="M82 24 h6 l-6 7 h6" stroke="#9AB0D0" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M88 16 h4 l-4 5 h4" stroke="#9AB0D0" strokeWidth={1.1} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
      </G>
    );
  }

  if (mood === 'happy' || mood === 'celebrate') {
    return (
      <G>
        {/* Happy closed caret eyes ^_^ */}
        <Path d="M35 36 Q41 30 47 36" stroke="#333" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <Path d="M53 36 Q59 30 65 36" stroke="#333" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        {/* Raised brows */}
        <Path d="M36 25 Q41 22 46 24" stroke={hair} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Path d="M54 24 Q59 22 64 25" stroke={hair} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {nose}
        {/* Big open smile */}
        <Path d="M43 45 Q50 55 57 45 Z" fill="#B85543" />
        <Path d="M45 46 Q50 50.5 55 46" stroke="#FF9E8A" strokeWidth={1} fill="none" opacity={0.6} />
        {mood === 'celebrate' && (
          <G>
            <Path d="M26 18 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5 Z" fill="#FFD54A" />
            <Path d="M78 14 l1.2 2.4 l2.4 1.2 l-2.4 1.2 l-1.2 2.4 l-1.2 -2.4 l-2.4 -1.2 l2.4 -1.2 Z" fill="#FFD54A" />
          </G>
        )}
      </G>
    );
  }

  // idle (default) — open round chibi eyes, gentle smile
  return (
    <G>
      <Ellipse cx={41} cy={34} rx={5.5} ry={6.5} fill="#333" />
      <Ellipse cx={59} cy={34} rx={5.5} ry={6.5} fill="#333" />
      <Circle cx={43} cy={31} r={2} fill="#FFF" opacity={0.95} />
      <Circle cx={61} cy={31} r={2} fill="#FFF" opacity={0.95} />
      <Circle cx={44.5} cy={33} r={1} fill="#FFF" opacity={0.7} />
      <Circle cx={62.5} cy={33} r={1} fill="#FFF" opacity={0.7} />
      <Path d="M36 26 Q41 23 46 25" stroke={hair} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M54 25 Q59 23 64 26" stroke={hair} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {nose}
      <Path d="M45 46 Q50 51 55 46" stroke="#D4826A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </G>
  );
}

export interface SvgCharacterProps {
  job: JobId;
  size?: number;
  /** When true, plays a brief celebratory bounce — the SVG analogue of Rive's `is_success` trigger. */
  celebrate?: boolean;
  /** Facial expression driven by app state (slumber → sleepy, all done → happy). */
  mood?: CharacterMood;
}

export default function SvgCharacter({ job, size = 160, celebrate = false, mood = 'idle' }: SvgCharacterProps) {
  const p = JOB_PALETTE[job] ?? JOB_PALETTE.novice;
  const skin = '#F5CBA7';
  const skinDark = '#E8B090';
  // Scale: viewBox is 100×155
  const vw = 100;
  const vh = 155;

  // Idle breathing + celebrate pulse (SVG analogue of Rive state-machine animations)
  const breathe = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  useEffect(() => {
    if (!celebrate) return;
    pulse.setValue(0);
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 16 }),
      Animated.spring(pulse, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 10 }),
    ]).start();
  }, [celebrate, pulse]);

  const bodyTranslateY = breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });
  const bodyScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Animated.View style={{ transform: [{ translateY: bodyTranslateY }, { scale: bodyScale }] }}>
      <Svg
        width={size}
        height={size * (vh / vw)}
        viewBox={`0 0 ${vw} ${vh}`}
      >
        {/* ── HAIR (behind head) ── */}
        <Ellipse cx={50} cy={30} rx={27} ry={24} fill={p.hair} />
        {/* Side hair */}
        <Ellipse cx={26} cy={42} rx={8} ry={14} fill={p.hair} />
        <Ellipse cx={74} cy={42} rx={8} ry={14} fill={p.hair} />

        {/* ── HEAD ── */}
        <Ellipse cx={50} cy={32} rx={24} ry={26} fill={skin} />

        {/* ── FACE ── */}
        {/* Cheek blush */}
        <Ellipse cx={33} cy={40} rx={7} ry={5} fill="#FFB0B0" opacity={0.5} />
        <Ellipse cx={67} cy={40} rx={7} ry={5} fill="#FFB0B0" opacity={0.5} />

        {/* ── FACE EXPRESSION (mood-driven) ── */}
        <Face mood={mood} hair={p.hair} skinDark={skinDark} />

        {/* ── NECK ── */}
        <Rect x={44} y={56} width={12} height={8} rx={3} fill={skin} />

        {/* ── BODY ── */}
        <Rect x={31} y={62} width={38} height={46} rx={7} fill={p.armor} />
        {/* Chest emblem */}
        <Ellipse cx={50} cy={80} rx={8} ry={9} fill={p.trim} opacity={0.4} />
        <Ellipse cx={50} cy={80} rx={5} ry={6} fill={p.trim} opacity={0.6} />
        {/* Belt */}
        <Rect x={31} y={100} width={38} height={7} rx={3} fill={p.trim} opacity={0.8} />
        {/* Belt buckle */}
        <Rect x={46} y={101} width={8} height={5} rx={2} fill={p.armor} />

        {/* ── LEFT ARM ── */}
        <Rect x={14} y={64} width={15} height={36} rx={7} fill={p.armor} />
        <Circle cx={21.5} cy={102} r={7} fill={skin} />

        {/* ── RIGHT ARM ── */}
        <Rect x={71} y={64} width={15} height={36} rx={7} fill={p.armor} />
        <Circle cx={78.5} cy={102} r={7} fill={skin} />

        {/* ── LEGS ── */}
        <Rect x={34} y={106} width={14} height={36} rx={6} fill={p.armor} />
        <Rect x={52} y={106} width={14} height={36} rx={6} fill={p.armor} />
        {/* Boots */}
        <Ellipse cx={41} cy={144} rx={11} ry={7} fill={p.trim} opacity={0.85} />
        <Ellipse cx={59} cy={144} rx={11} ry={7} fill={p.trim} opacity={0.85} />
        <Ellipse cx={41} cy={142} rx={9} ry={5} fill={p.armor} opacity={0.6} />
        <Ellipse cx={59} cy={142} rx={9} ry={5} fill={p.armor} opacity={0.6} />

        {/* ── JOB ACCESSORY (right) ── */}
        <Accessory job={job} p={p} />

        {/* ── JOB ACCESSORY (left shield) ── */}
        <LeftItem job={job} p={p} />
      </Svg>
    </Animated.View>
  );
}
