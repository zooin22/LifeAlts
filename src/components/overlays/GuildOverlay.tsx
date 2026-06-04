import React, { useState } from 'react';
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
import { ROUTINE_SUGGESTIONS } from '../../data/defaultRoutines';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STAT_ICONS: Record<string, string> = {
  str: '🏃', int: '📖', cha: '💬', dex: '🎨', wis: '😌', health: '💧', gold: '💰',
};

export default function GuildOverlay({ visible, onClose }: Props) {
  const { routines, addRoutine, removeRoutine } = useApp();
  const [tab, setTab] = useState<'mine' | 'add'>('mine');

  const suggestions = ROUTINE_SUGGESTIONS.filter(
    (s) => !routines.some((r) => r.label === s.label),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>🏕️ 길드 의뢰소</Text>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'mine' && styles.tabActive]}
              onPress={() => setTab('mine')}
            >
              <Text style={[styles.tabTxt, tab === 'mine' && styles.tabTxtActive]}>내 루틴</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'add' && styles.tabActive]}
              onPress={() => setTab('add')}
            >
              <Text style={[styles.tabTxt, tab === 'add' && styles.tabTxtActive]}>추가하기</Text>
            </TouchableOpacity>
          </View>

          {tab === 'mine' ? (
            <FlatList
              data={routines}
              keyExtractor={(r) => r.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text style={styles.rowIcon}>{STAT_ICONS[item.stat] ?? '✨'}</Text>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeRoutine(item.id)}
                  >
                    <Text style={styles.deleteTxt}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>아직 루틴이 없어요. '추가하기'에서 골라보세요!</Text>
              }
            />
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(s) => s.label}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    addRoutine({ label: item.label, type: item.type, stat: item.stat, amount: item.amount, active: true });
                    setTab('mine');
                  }}
                >
                  <Text style={styles.rowIcon}>{STAT_ICONS[item.stat] ?? '✨'}</Text>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.addLabel}>+ 추가</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>추가할 수 있는 루틴을 모두 등록했어요!</Text>
              }
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
    maxHeight: '75%',
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2A2A3E',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#F0C070',
  },
  tabTxt: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTxtActive: {
    color: '#1E1E2E',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#EEE',
  },
  deleteBtn: {
    backgroundColor: '#6B1A1A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteTxt: {
    color: '#FFB0A0',
    fontSize: 12,
    fontWeight: '600',
  },
  addLabel: {
    color: '#F0C070',
    fontWeight: '600',
    fontSize: 13,
  },
  empty: {
    color: '#AAA',
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 14,
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
