/**
 * RewardToast — 보상 획득 시 화면 중앙에 잠깐 떠올랐다 사라지는 토스트.
 *
 * AppContext의 pendingReward가 세팅되면 표시 → 애니메이션 후 onDone()으로 clear.
 * 루틴 도장 보상, 메인 퀘스트 마일스톤/완수 보상 등에 사용.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const STAT_ICONS: Record<string, string> = {
  str: '💪', int: '📖', cha: '💬', dex: '🎨', wis: '😌', health: '💧', gold: '🪙',
};

interface Reward {
  label: string;
  stat: string;
  amount: number;
}

interface Props {
  reward: Reward | null;
  onDone: () => void;
}

export default function RewardToast({ reward, onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!reward) return;

    opacity.setValue(0);
    translateY.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -50, duration: 350, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, [reward]);

  if (!reward) return null;

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Text style={styles.icon}>{STAT_ICONS[reward.stat] ?? '✨'}</Text>
      <Text style={styles.plus}>+{reward.amount}</Text>
      <Text style={styles.label} numberOfLines={1}>{reward.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,16,40,0.90)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(240,192,112,0.5)',
    shadowColor: '#F0C070',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  icon: { fontSize: 20 },
  plus: { fontSize: 18, fontWeight: 'bold', color: '#F0C070' },
  label: { fontSize: 13, color: '#EEE', maxWidth: 160 },
});
