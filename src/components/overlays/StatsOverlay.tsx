import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { STAT_LABELS, StatKey } from '../../types';
import { JOB_MAP } from '../../data/jobs';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STAT_ORDER: StatKey[] = ['str', 'int', 'cha', 'dex', 'wis', 'health'];
const MAX_STAT = 100;

export default function StatsOverlay({ visible, onClose }: Props) {
  const { character } = useApp();
  const job = JOB_MAP[character.job];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>📊 캐릭터 현황</Text>

          <View style={styles.jobRow}>
            <Text style={styles.jobName}>{job?.name ?? character.job}</Text>
            <Text style={styles.jobDesc}>{job?.description ?? ''}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {STAT_ORDER.map((stat) => {
              const val = character.stats[stat];
              const pct = Math.min((val / MAX_STAT) * 100, 100);
              return (
                <View key={stat} style={styles.statRow}>
                  <Text style={styles.statLabel}>{STAT_LABELS[stat]}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%` as any }]} />
                  </View>
                  <Text style={styles.statVal}>{Math.round(val)}</Text>
                </View>
              );
            })}

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>💰 골드</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    styles.goldFill,
                    { width: `${Math.min((character.gold / MAX_STAT) * 100, 100)}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.statVal}>{Math.round(character.gold)}</Text>
            </View>

            <View style={styles.streakBox}>
              <Text style={styles.streakLabel}>🔥 연속 수련</Text>
              <Text style={styles.streakVal}>{character.streak}일</Text>
              <Text style={styles.streakBest}>(최고 {character.longestStreak}일)</Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>닫기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1E1E2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F0C070',
    marginBottom: 12,
    textAlign: 'center',
  },
  jobRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  jobName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F0C070',
  },
  jobDesc: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    width: 90,
    fontSize: 13,
    color: '#DDD',
  },
  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4A90D9',
    borderRadius: 5,
  },
  goldFill: {
    backgroundColor: '#F0C070',
  },
  statVal: {
    width: 36,
    textAlign: 'right',
    fontSize: 13,
    color: '#F0C070',
  },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  streakLabel: {
    fontSize: 14,
    color: '#DDD',
    flex: 1,
  },
  streakVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  streakBest: {
    fontSize: 12,
    color: '#888',
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeTxt: {
    color: '#F0C070',
    fontSize: 16,
    fontWeight: '600',
  },
});
