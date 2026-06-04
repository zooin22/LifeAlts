import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../../context/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STAT_ICONS: Record<string, string> = {
  str: '🏃', int: '📖', cha: '💬', dex: '🎨', wis: '😌', health: '💧', gold: '💰',
};

export default function RecordOverlay({ visible, onClose }: Props) {
  const { routines, todayDone, recordRoutine } = useApp();
  const active = routines.filter((r) => r.active);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>⚔️ 오늘의 수련</Text>

          {active.length === 0 ? (
            <Text style={styles.empty}>등록된 루틴이 없어요. 길드에서 추가해보세요!</Text>
          ) : (
            <FlatList
              data={active}
              keyExtractor={(r) => r.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const done = todayDone.has(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.row, done && styles.rowDone]}
                    onPress={() => { if (!done) recordRoutine(item.id); }}
                    activeOpacity={done ? 1 : 0.7}
                  >
                    <Text style={styles.rowIcon}>{STAT_ICONS[item.stat] ?? '✨'}</Text>
                    <Text style={[styles.rowLabel, done && styles.rowLabelDone]}>
                      {item.label}
                    </Text>
                    {done && <Text style={styles.check}>✅</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          )}

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
    maxHeight: '70%',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  empty: {
    color: '#AAA',
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowDone: {
    opacity: 0.5,
  },
  rowIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: '#EEE',
  },
  rowLabelDone: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  check: {
    fontSize: 18,
  },
  closeBtn: {
    marginTop: 12,
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
