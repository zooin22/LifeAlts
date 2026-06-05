/**
 * Background — 전체 화면 SVG 풍경 배경.
 *
 * 기기 시각(time.ts의 useTimeOfDay)에 따라 아침/낮/노을/밤 4개 씬으로 색이 바뀐다.
 * useTimeOfDay 훅이 경계를 넘으면 스스로 리렌더 → 앱을 켜둔 채로도 배경이 자동 전환된다.
 * 하늘 그라데이션 + 해/달 + 별(밤) + 구름 + 언덕 + 길 + 나무로 구성. children을 위에 얹는다.
 */
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Ellipse,
  Circle,
} from 'react-native-svg';
import { useTimeOfDay } from '../utils/time';

const { width: W, height: H } = Dimensions.get('window');

const SCENES = {
  morning: {
    skyA: '#FFBB88', skyB: '#FFD8A8',
    cloud: '#FFF8F0',
    hill2: '#7A9E52', hill1: '#6A8E42', hillfg: '#8BAE5A',
    ground: '#8AAA48', path: '#CCA87A',
    sun: '#FFD056', sunGlow: '#FFE87A',
  },
  day: {
    skyA: '#5BBCF8', skyB: '#A8DEFF',
    cloud: '#FFFFFF',
    hill2: '#4A9E28', hill1: '#3A8E18', hillfg: '#5AAE38',
    ground: '#4A8A28', path: '#C0A068',
    sun: '#FFE050', sunGlow: '#FFF080',
  },
  sunset: {
    skyA: '#E85820', skyB: '#F5A030',
    cloud: '#FF9960',
    hill2: '#6B4828', hill1: '#5A3818', hillfg: '#7A5838',
    ground: '#6A5828', path: '#B88858',
    sun: '#FFAA30', sunGlow: '#FFD060',
  },
  night: {
    skyA: '#060618', skyB: '#0E0E30',
    cloud: '#1A1A3A',
    hill2: '#0A1A0A', hill1: '#081208', hillfg: '#0E1E0E',
    ground: '#0A1408', path: '#3A3028',
    sun: '#E8E8FF', sunGlow: '#B8B8D8',
  },
};

export default function Background({ children }: { children: React.ReactNode }) {
  const tod = useTimeOfDay();
  const s = SCENES[tod];
  const isNight = tod === 'night';

  return (
    <View style={styles.root}>
      <Svg
        width={W}
        height={H}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${W} ${H}`}
      >
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.skyA} />
            <Stop offset="1" stopColor={s.skyB} />
          </LinearGradient>
          <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.ground} />
            <Stop offset="1" stopColor={s.hill1} />
          </LinearGradient>
          <LinearGradient id="path" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.path} stopOpacity="0.9" />
            <Stop offset="1" stopColor={s.path} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={W} height={H} fill="url(#sky)" />

        {/* Sun / Moon */}
        <Circle cx={W * 0.75} cy={H * 0.12} r={isNight ? 22 : 36} fill={s.sunGlow} opacity={0.35} />
        <Circle cx={W * 0.75} cy={H * 0.12} r={isNight ? 16 : 28} fill={s.sun} opacity={0.9} />

        {/* Stars at night */}
        {isNight && [
          [0.1, 0.05], [0.3, 0.08], [0.5, 0.04], [0.65, 0.10], [0.85, 0.07],
          [0.2, 0.15], [0.45, 0.13], [0.78, 0.18], [0.15, 0.22], [0.6, 0.20],
        ].map(([cx, cy], i) => (
          <Circle key={i} cx={W * cx} cy={H * cy} r={1.5} fill="#FFFFFF" opacity={0.8} />
        ))}

        {/* Clouds */}
        {!isNight && (
          <>
            <Ellipse cx={W * 0.18} cy={H * 0.14} rx={38} ry={16} fill={s.cloud} opacity={0.75} />
            <Ellipse cx={W * 0.15} cy={H * 0.16} rx={28} ry={14} fill={s.cloud} opacity={0.75} />
            <Ellipse cx={W * 0.55} cy={H * 0.09} rx={30} ry={13} fill={s.cloud} opacity={0.65} />
            <Ellipse cx={W * 0.58} cy={H * 0.11} rx={24} ry={11} fill={s.cloud} opacity={0.65} />
          </>
        )}

        {/* Far hill */}
        <Path
          d={`M0,${H * 0.52} Q${W * 0.25},${H * 0.35} ${W * 0.5},${H * 0.48} Q${W * 0.75},${H * 0.38} ${W},${H * 0.5} L${W},${H} L0,${H} Z`}
          fill={s.hill2}
          opacity={0.7}
        />

        {/* Mid hill */}
        <Path
          d={`M0,${H * 0.6} Q${W * 0.3},${H * 0.44} ${W * 0.55},${H * 0.56} Q${W * 0.78},${H * 0.46} ${W},${H * 0.58} L${W},${H} L0,${H} Z`}
          fill={s.hill1}
          opacity={0.85}
        />

        {/* Foreground ground */}
        <Path
          d={`M0,${H * 0.7} Q${W * 0.5},${H * 0.65} ${W},${H * 0.7} L${W},${H} L0,${H} Z`}
          fill="url(#ground)"
        />

        {/* Winding stone path */}
        <Path
          d={`M${W * 0.38},${H} Q${W * 0.4},${H * 0.88} ${W * 0.44},${H * 0.78} Q${W * 0.47},${H * 0.72} ${W * 0.5},${H * 0.68}`}
          stroke={s.path}
          strokeWidth={W * 0.12}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />
        <Path
          d={`M${W * 0.38},${H} Q${W * 0.4},${H * 0.88} ${W * 0.44},${H * 0.78} Q${W * 0.47},${H * 0.72} ${W * 0.5},${H * 0.68}`}
          stroke="url(#path)"
          strokeWidth={W * 0.10}
          strokeLinecap="round"
          fill="none"
        />

        {/* Trees left */}
        <Rect x={W * 0.04} y={H * 0.58} width={8} height={28} rx={3} fill={s.hill1} />
        <Ellipse cx={W * 0.055} cy={H * 0.56} rx={16} ry={20} fill={s.hillfg} opacity={0.9} />
        <Rect x={W * 0.13} y={H * 0.62} width={6} height={22} rx={3} fill={s.hill1} />
        <Ellipse cx={W * 0.145} cy={H * 0.60} rx={13} ry={16} fill={s.hillfg} opacity={0.85} />

        {/* Trees right */}
        <Rect x={W * 0.88} y={H * 0.60} width={8} height={26} rx={3} fill={s.hill1} />
        <Ellipse cx={W * 0.895} cy={H * 0.58} rx={15} ry={18} fill={s.hillfg} opacity={0.9} />
        <Rect x={W * 0.80} y={H * 0.64} width={6} height={20} rx={3} fill={s.hill1} />
        <Ellipse cx={W * 0.815} cy={H * 0.62} rx={12} ry={15} fill={s.hillfg} opacity={0.85} />

        {/* Ground overlay for depth */}
        <Rect
          x={0} y={H * 0.85} width={W} height={H * 0.15}
          fill={s.ground}
          opacity={0.6}
        />
      </Svg>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
