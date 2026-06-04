import React from 'react';
import Svg, { Circle, Rect, Ellipse } from 'react-native-svg';
import { JobId } from '../types';

const JOB_COLORS: Record<JobId, { body: string; accent: string; hair: string }> = {
  novice:         { body: '#808080', accent: '#A0A0A0', hair: '#6B4226' },
  warrior:        { body: '#8B1A1A', accent: '#CD853F', hair: '#2C1810' },
  mage:           { body: '#4B0082', accent: '#9370DB', hair: '#1A0030' },
  bard:           { body: '#DAA520', accent: '#FF8C00', hair: '#4A2800' },
  rogue:          { body: '#2F4F4F', accent: '#696969', hair: '#1A1A1A' },
  monk:           { body: '#F5F5DC', accent: '#FFD700', hair: '#4A3000' },
  naturalist:     { body: '#228B22', accent: '#90EE90', hair: '#2D4A10' },
  merchant:       { body: '#8B6914', accent: '#FFD700', hair: '#3A2800' },
  paladin:        { body: '#4169E1', accent: '#FFD700', hair: '#2A1060' },
  alchemist:      { body: '#6A0DAD', accent: '#00FA9A', hair: '#2A0050' },
  hunter:         { body: '#556B2F', accent: '#8B4513', hair: '#2A3510' },
  sage:           { body: '#483D8B', accent: '#E6E6FA', hair: '#1A1250' },
  healer:         { body: '#20B2AA', accent: '#F0FFF0', hair: '#184840' },
  martial_artist: { body: '#8B0000', accent: '#F5F5F5', hair: '#1A0A0A' },
  astrologer:     { body: '#191970', accent: '#FFD700', hair: '#0A0830' },
  adventurer:     { body: '#8B4513', accent: '#DAA520', hair: '#3A2010' },
};

interface CharacterProps {
  job: JobId;
  size?: number;
}

export default function Character({ job, size = 160 }: CharacterProps) {
  const c = JOB_COLORS[job] ?? JOB_COLORS.novice;
  const skin = '#F5CBA7';

  return (
    <Svg width={size} height={size * 1.8} viewBox="0 0 100 180">
      {/* Hair */}
      <Circle cx="50" cy="22" r="20" fill={c.hair} />
      {/* Head */}
      <Circle cx="50" cy="24" r="18" fill={skin} />
      {/* Eyes */}
      <Circle cx="44" cy="22" r="2.5" fill="#333" />
      <Circle cx="56" cy="22" r="2.5" fill="#333" />
      {/* Mouth */}
      <Ellipse cx="50" cy="30" rx="4" ry="1.8" fill="#D4826A" />
      {/* Neck */}
      <Rect x="44" y="40" width="12" height="10" rx="4" fill={skin} />
      {/* Body */}
      <Rect x="28" y="48" width="44" height="54" rx="8" fill={c.body} />
      {/* Body accent stripe */}
      <Rect x="43" y="48" width="14" height="54" rx="2" fill={c.accent} opacity={0.35} />
      {/* Belt */}
      <Rect x="28" y="94" width="44" height="8" rx="4" fill={c.accent} opacity={0.85} />
      {/* Left arm */}
      <Rect x="10" y="50" width="16" height="40" rx="7" fill={c.body} />
      {/* Right arm */}
      <Rect x="74" y="50" width="16" height="40" rx="7" fill={c.body} />
      {/* Left hand */}
      <Circle cx="18" cy="93" r="7" fill={skin} />
      {/* Right hand */}
      <Circle cx="82" cy="93" r="7" fill={skin} />
      {/* Left leg */}
      <Rect x="32" y="100" width="16" height="54" rx="7" fill={c.body} />
      {/* Right leg */}
      <Rect x="52" y="100" width="16" height="54" rx="7" fill={c.body} />
      {/* Left foot */}
      <Ellipse cx="40" cy="157" rx="13" ry="6" fill={c.accent} />
      {/* Right foot */}
      <Ellipse cx="60" cy="157" rx="13" ry="6" fill={c.accent} />
    </Svg>
  );
}
