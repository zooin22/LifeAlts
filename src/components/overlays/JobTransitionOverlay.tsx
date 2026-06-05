/**
 * JobTransitionOverlay — 직업이 바뀔 때 재생되는 4단계 연출.
 *
 * phase 0 감지 → 1 각성 → 2 의미 → 3 기록. (AppContext의 pendingJobChange가 트리거)
 * 타이머로 phase를 진행하고 마지막에 onDone()으로 닫는다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, Animated } from 'react-native';
import { JobId } from '../../types';
import { JOB_MAP } from '../../data/jobs';
import Character from '../Character';

type Phase = 0 | 1 | 2 | 3;

interface Props {
  visible: boolean;
  fromJob: JobId;
  toJob: JobId;
  onDone: () => void;
}

export default function JobTransitionOverlay({ visible, fromJob, toJob, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>(0);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const jobScale = useRef(new Animated.Value(0.5)).current;
  const jobDef = JOB_MAP[toJob];

  useEffect(() => {
    if (!visible) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    overlayOpacity.setValue(0);
    contentOpacity.setValue(0);
    jobScale.setValue(0.5);
    setPhase(0);

    // 오버레이 페이드인
    Animated.timing(overlayOpacity, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    // Phase 0 — 감지 텍스트
    Animated.timing(contentOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }).start();

    const crossfade = (next: Phase, extraAnim?: () => void) =>
      Animated.timing(contentOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setPhase(next);
        contentOpacity.setValue(0);
        extraAnim?.();
        Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });

    // Phase 1 — 각성 (2.2 s)
    timers.push(setTimeout(() => crossfade(1, () => {
      jobScale.setValue(0.55);
      Animated.spring(jobScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 6 }).start();
    }), 2200));

    // Phase 2 — 의미 (4.9 s)
    timers.push(setTimeout(() => crossfade(2), 4900));

    // Phase 3 — 기록 (8.2 s)
    timers.push(setTimeout(() => crossfade(3), 8200));

    // 종료 (10.8 s)
    timers.push(setTimeout(() => {
      Animated.timing(overlayOpacity, { toValue: 0, duration: 700, useNativeDriver: true }).start(() => onDone());
    }, 10800));

    return () => timers.forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  const jobName = jobDef?.name ?? toJob;
  const jobDesc = jobDef?.description ?? '';

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>

          {phase === 0 && (
            <Text style={styles.detectText}>무언가 달라지고 있어...</Text>
          )}

          {phase === 1 && (
            <Animated.View style={[styles.centerCol, { transform: [{ scale: jobScale }] }]}>
              <Text style={styles.awakeLabel}>— 각성 —</Text>
              <Text style={styles.jobNameLarge}>{jobName}</Text>
            </Animated.View>
          )}

          {phase === 2 && (
            <View style={styles.centerCol}>
              <Character job={toJob} size={110} />
              <Text style={styles.jobNameMed}>{jobName}</Text>
              <View style={styles.descBox}>
                <Text style={styles.descText}>"{jobDesc}"</Text>
              </View>
              <Text style={styles.meaningSub}>당신의 삶이 새로운 이야기를 쓰고 있어요.</Text>
            </View>
          )}

          {phase === 3 && (
            <View style={styles.centerCol}>
              <Text style={styles.recordEmoji}>✨</Text>
              <Text style={styles.recordTitle}>기억에 새겨졌습니다</Text>
              <Text style={styles.recordJob}>{jobName}</Text>
            </View>
          )}

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07071A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  centerCol: {
    alignItems: 'center',
  },
  detectText: {
    fontSize: 18,
    color: '#7070A8',
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  awakeLabel: {
    fontSize: 13,
    color: '#7070A8',
    letterSpacing: 4,
    marginBottom: 18,
  },
  jobNameLarge: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#F0C070',
    textShadowColor: 'rgba(240,192,112,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    letterSpacing: 2,
  },
  jobNameMed: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F0C070',
    marginTop: 14,
    marginBottom: 6,
  },
  descBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 10,
    maxWidth: 290,
  },
  descText: {
    color: '#DDD',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 23,
  },
  meaningSub: {
    color: '#6868A0',
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  recordEmoji: {
    fontSize: 48,
    marginBottom: 18,
  },
  recordTitle: {
    fontSize: 18,
    color: '#BBBBCC',
    fontStyle: 'italic',
    marginBottom: 12,
    letterSpacing: 1,
  },
  recordJob: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#F0C070',
    textShadowColor: 'rgba(240,192,112,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
