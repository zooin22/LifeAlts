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
import { Quest } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QuestOverlay({ visible, onClose }: Props) {
  const { quests, completeQuest } = useApp();
  const daily = quests.filter((q) => q.kind === 'daily');
  const main = quests.filter((q) => q.kind === 'main' && !q.abandoned);
  const combined = [...daily, ...main];

  function renderItem({ item, index }: { item: Quest; index: number }) {
    const isFirstMain = index === daily.length && main.length > 0;
    const pct = item.goal > 0 ? Math.min(item.progress / item.goal, 1) : 0;

    return (
      <>
        {isFirstMain && (
          <Text style={styles.sectionHeader}>메인 퀘스트</Text>
        )}
        <View style={[styles.card, item.done && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, item.done && styles.cardLabelDone]}>
              {item.label}
            </Text>
            {item.kind === 'main' && !item.done && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => completeQuest(item.id)}
              >
                <Text style={styles.completeBtnTxt}>완료</Text>
              </TouchableOpacity>
            )}
            {item.done && <Text style={styles.doneBadge}>✅</Text>}
          </View>
          {item.goal > 1 && (
            <View style={styles.progressRow}>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct * 100}%` as any }]} />
              </View>
              <Text style={styles.progressTxt}>{item.progress}/{item.goal}</Text>
            </View>
          )}
        </View>
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>📜 퀘스트</Text>

          <FlatList
            data={combined}
            keyExtractor={(q) => q.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              daily.length > 0 ? (
                <Text style={styles.sectionHeader}>일일 퀘스트</Text>
              ) : null
            }
            ListEmptyComponent={
              <Text style={styles.empty}>진행 중인 퀘스트가 없어요.</Text>
            }
          />

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
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  cardDone: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    flex: 1,
    fontSize: 15,
    color: '#EEE',
  },
  cardLabelDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completeBtn: {
    backgroundColor: '#F0C070',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeBtnTxt: {
    color: '#1E1E2E',
    fontWeight: 'bold',
    fontSize: 13,
  },
  doneBadge: {
    fontSize: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F0C070',
    borderRadius: 3,
  },
  progressTxt: {
    fontSize: 11,
    color: '#AAA',
    width: 40,
    textAlign: 'right',
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
