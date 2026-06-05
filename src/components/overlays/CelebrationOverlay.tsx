/**
 * CelebrationOverlay — 오늘의 모든 루틴을 완수했을 때 뜨는 축하 연출.
 *
 * HomeScreen이 allDone 전환 시점에 1회 표시(prevAllDoneRef로 중복 방지).
 * 캐릭터는 mood="celebrate"로 렌더.
 */
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Character from '../Character';
import { JobId } from '../../types';

interface Props {
  visible: boolean;
  jobId: JobId;
  jobName: string;
  streak: number;
  onClose: () => void;
}

export default function CelebrationOverlay({ visible, jobId, jobName, streak, onClose }: Props) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.7);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.stars}>✨ 🌟 ✨</Text>
          <Text style={styles.title}>오늘 수련 완료!</Text>

          <Character job={jobId} size={120} celebrate={visible} mood="celebrate" />
          <Text style={styles.jobName}>{jobName}</Text>

          <View style={styles.voiceBox}>
            <Text style={styles.voiceTxt}>
              "오늘도 수고했어요!{'\n'}이 순간이 {jobName}를 만들어가요."
            </Text>
          </View>

          {streak > 0 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakTxt}>🔥 {streak}일 연속 수련 중</Text>
            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnTxt}>계속하기</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#12112A',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(240,192,112,0.35)',
    shadowColor: '#F0C070',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  stars: { fontSize: 28, marginBottom: 6 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0C070',
    marginBottom: 16,
    textShadowColor: 'rgba(240,192,112,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  jobName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F0C070',
    marginTop: 10,
    marginBottom: 4,
  },
  voiceBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginVertical: 12,
    maxWidth: 280,
  },
  voiceTxt: {
    color: '#DDD',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 21,
  },
  streakRow: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 14,
  },
  streakTxt: {
    color: '#FF8844',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btn: {
    backgroundColor: '#F0C070',
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnTxt: {
    color: '#1A1A2E',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
