/**
 * QuestOverlay — "오늘의 퀘스트" 수행 화면 (상단 카드로 진입).
 *
 * 일일 퀘스트: 라벨로 연결된 루틴을 찾아 [도장] → recordRoutine(루틴 기록).
 * 메인 퀘스트: 완료/포기 + 마일스톤 진행바. (생성은 길드에서 하므로 여기엔 생성 폼 없음)
 * 하단: 한 줄 일지 입력.
 */
import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Quest, Routine } from '../../types';
import { MILESTONE_FRACTIONS, milestoneThreshold } from '../../utils/milestones';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STAT_ICONS: Record<string, string> = {
  str: '💪', int: '📖', cha: '💬', dex: '🎨', wis: '😌', health: '💧', gold: '🪙',
};

// ── Daily quest row: tap 도장 to record the linked routine ──────────────────────
function DailyRow({
  quest,
  routine,
  done,
  onStamp,
}: {
  quest: Quest;
  routine: Routine | undefined;
  done: boolean;
  onStamp: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handle = () => {
    if (done || !routine) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, speed: 20, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start();
    onStamp();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={[styles.card, done && styles.cardDone]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>
            {quest.targetStat ? (STAT_ICONS[quest.targetStat] ?? '⭐') : '🎯'}
          </Text>
          <Text style={[styles.cardLabel, done && styles.cardLabelDone]} numberOfLines={2}>
            {quest.label}
          </Text>
          {done ? (
            <Text style={styles.doneBadge}>✅</Text>
          ) : routine ? (
            <TouchableOpacity style={styles.stampBtn} onPress={handle} activeOpacity={0.8}>
              <Text style={styles.stampBtnTxt}>도장</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

export default function QuestOverlay({ visible, onClose }: Props) {
  const {
    quests, routines, todayDone,
    recordRoutine, completeQuest, abandonQuest, addJournalNote,
  } = useApp();
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const daily = quests.filter(q => q.kind === 'daily');
  const main = quests.filter(q => q.kind === 'main' && !q.abandoned);

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    await addJournalNote(note);
    setNote('');
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1800);
  };

  const routineFor = (q: Quest): Routine | undefined =>
    routines.find(r => r.active && r.label === q.label);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>📜 오늘의 퀘스트</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {daily.length === 0 && main.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>📜</Text>
                  <Text style={styles.empty}>퀘스트가 없어요.</Text>
                  <Text style={styles.emptySub}>🏕️ 길드 의뢰소에서 루틴과 메인 퀘스트를 받아보세요.</Text>
                </View>
              )}

              {/* Daily quests — stampable */}
              {daily.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>일일 퀘스트 · 탭하여 도장</Text>
                  {daily.map(q => {
                    const routine = routineFor(q);
                    const done = routine ? todayDone.has(routine.id) : q.done;
                    return (
                      <DailyRow
                        key={q.id}
                        quest={q}
                        routine={routine}
                        done={done}
                        onStamp={() => routine && recordRoutine(routine.id)}
                      />
                    );
                  })}
                </>
              )}

              {/* Main quests — complete / abandon / milestones */}
              {main.length > 0 && (
                <>
                  <Text style={styles.sectionHeader}>메인 퀘스트</Text>
                  {main.map(item => {
                    const pct = item.goal > 0 ? Math.min(item.progress / item.goal, 1) : 0;
                    return (
                      <View key={item.id} style={[styles.card, styles.cardMain, item.done && styles.cardDone]}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardIcon}>
                            {item.targetStat ? (STAT_ICONS[item.targetStat] ?? '⭐') : '🎯'}
                          </Text>
                          <Text style={[styles.cardLabel, item.done && styles.cardLabelDone]} numberOfLines={2}>
                            {item.label}
                          </Text>
                          {item.done ? (
                            <Text style={styles.doneBadge}>✅</Text>
                          ) : (
                            <>
                              <TouchableOpacity style={styles.completeBtn} onPress={() => completeQuest(item.id)}>
                                <Text style={styles.completeBtnTxt}>완료</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.abandonBtn} onPress={() => abandonQuest(item.id)}>
                                <Text style={styles.abandonBtnTxt}>포기</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                        {item.goal > 1 && (
                          <View style={styles.progressRow}>
                            <View style={styles.barBg}>
                              <View style={[styles.barFill, { width: `${pct * 100}%` as any }]} />
                              {MILESTONE_FRACTIONS.filter(f => f < 1).map(f => {
                                const reached = item.progress >= milestoneThreshold(f, item.goal);
                                return (
                                  <View
                                    key={f}
                                    style={[
                                      styles.milestoneTick,
                                      { left: `${f * 100}%` as any },
                                      reached && styles.milestoneTickReached,
                                    ]}
                                  />
                                );
                              })}
                            </View>
                            <Text style={styles.progressTxt}>{item.progress}/{item.goal}</Text>
                          </View>
                        )}
                        <Text style={styles.milestoneHint}>🎁 25 · 50 · 75 · 100% 달성 시 금화 보상</Text>
                      </View>
                    );
                  })}
                </>
              )}

              {/* 오늘의 한 줄 (선택) */}
              <View style={styles.journalCard}>
                <Text style={styles.journalLabel}>📖 오늘의 한 줄 <Text style={styles.journalOpt}>(선택)</Text></Text>
                <View style={styles.journalRow}>
                  <TextInput
                    style={styles.journalInput}
                    placeholder={noteSaved ? '기록했어요! ✨' : '오늘 어땠나요? 한 줄 남겨보세요'}
                    placeholderTextColor={noteSaved ? '#7AB87A' : '#666'}
                    value={note}
                    onChangeText={setNote}
                    maxLength={80}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.journalBtn, !note.trim() && styles.journalBtnOff]}
                    onPress={handleSaveNote}
                    disabled={!note.trim()}
                  >
                    <Text style={styles.journalBtnTxt}>기록</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeTxt}>닫기</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1E1E2E',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 20, maxHeight: '88%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#555',
    borderRadius: 2, alignSelf: 'center', marginVertical: 12,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#F0C070', marginBottom: 12 },
  addBtn: {
    backgroundColor: '#2A2A4E', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addBtnTxt: { color: '#F0C070', fontSize: 13, fontWeight: '600' },
  // Add form
  addForm: {
    backgroundColor: '#2A2A3E', borderRadius: 14,
    padding: 14, marginBottom: 12,
  },
  input: {
    backgroundColor: '#1E1E2E', borderRadius: 10,
    padding: 12, color: '#EEE', fontSize: 14, marginBottom: 10,
  },
  formRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  formLabel: { color: '#AAA', fontSize: 12, marginBottom: 6, flex: 1 },
  inputSmall: {
    backgroundColor: '#1E1E2E', borderRadius: 8,
    padding: 8, color: '#F0C070', fontSize: 14,
    width: 60, textAlign: 'center',
  },
  statPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  statChip: {
    backgroundColor: '#1E1E2E', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, borderColor: 'transparent',
  },
  statChipActive: { borderColor: '#F0C070', backgroundColor: 'rgba(240,192,112,0.1)' },
  statChipTxt: { color: '#CCC', fontSize: 11 },
  saveBtn: {
    backgroundColor: '#F0C070', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#444' },
  saveBtnTxt: { color: '#1E1E2E', fontWeight: 'bold', fontSize: 14 },
  // Quest items
  sectionHeader: {
    fontSize: 11, color: '#666', marginTop: 8, marginBottom: 6,
    fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#2A2A3E', borderRadius: 12,
    padding: 12, marginBottom: 7,
  },
  cardDone: { opacity: 0.5 },
  cardMain: { borderLeftWidth: 3, borderLeftColor: '#F0C070' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 18, marginRight: 8 },
  cardLabel: { flex: 1, fontSize: 14, color: '#EEE', lineHeight: 20 },
  cardLabelDone: { textDecorationLine: 'line-through', color: '#888' },
  stampBtn: {
    backgroundColor: '#F0C070', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  stampBtnTxt: { color: '#1E1E2E', fontWeight: 'bold', fontSize: 13 },
  completeBtn: {
    backgroundColor: '#F0C070', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  completeBtnTxt: { color: '#1E1E2E', fontWeight: 'bold', fontSize: 12 },
  abandonBtn: {
    backgroundColor: 'transparent', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 5, marginLeft: 4,
  },
  abandonBtnTxt: { color: '#888', fontSize: 12 },
  doneBadge: { fontSize: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  barBg: {
    flex: 1, height: 8, backgroundColor: '#444',
    borderRadius: 4, overflow: 'hidden', marginRight: 8,
  },
  barFill: { height: '100%', backgroundColor: '#F0C070', borderRadius: 4 },
  milestoneTick: {
    position: 'absolute', top: 0, bottom: 0, width: 2,
    marginLeft: -1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  milestoneTickReached: { backgroundColor: 'rgba(255,255,255,0.85)' },
  milestoneHint: { fontSize: 9, color: '#7A6A3A', marginTop: 5 },
  progressTxt: { fontSize: 10, color: '#AAA', width: 38, textAlign: 'right' },
  emptyWrap: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  empty: { color: '#AAA', fontSize: 14, marginBottom: 4 },
  emptySub: { color: '#666', fontSize: 12, textAlign: 'center' },
  // Journal
  journalCard: {
    backgroundColor: '#22222F', borderRadius: 14,
    padding: 12, marginTop: 12, marginBottom: 4,
  },
  journalLabel: { color: '#CCC', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  journalOpt: { color: '#666', fontSize: 11, fontWeight: '400' },
  journalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  journalInput: {
    flex: 1, backgroundColor: '#1A1A24', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, color: '#EEE',
    fontSize: 13, maxHeight: 80, minHeight: 40,
  },
  journalBtn: {
    backgroundColor: '#F0C070', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  journalBtnOff: { backgroundColor: '#3A3A4A' },
  journalBtnTxt: { color: '#1E1E2E', fontWeight: 'bold', fontSize: 13 },
  closeBtn: {
    marginTop: 10, backgroundColor: '#2A2A3E',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  closeTxt: { color: '#F0C070', fontSize: 15, fontWeight: '600' },
});
