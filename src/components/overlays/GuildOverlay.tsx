/**
 * GuildOverlay — "길드 의뢰소". 퀘스트를 "받는"(생성하는) 곳.
 *
 * 3탭: 내 루틴(관리·일시정지·삭제) / 루틴 추가(추천+직접만들기) / 메인 퀘스트(생성).
 * 기획서의 "받기(길드) → 수행/완수(퀘스트)" 사이클에서 '받기' 담당.
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ROUTINE_SUGGESTIONS } from '../../data/defaultRoutines';
import { ActionType, StatKey } from '../../types';
import { STAT_LABELS } from '../../types';

const STAT_TO_TYPE: Record<StatKey | 'gold', ActionType> = {
  str: 'exercise', int: 'study', cha: 'social',
  dex: 'create', wis: 'rest', health: 'health', gold: 'work',
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STAT_ICONS: Record<string, string> = {
  str: '🏃', int: '📖', cha: '💬', dex: '🎨', wis: '😌', health: '💧', gold: '💰',
};

const STAT_OPTIONS: (StatKey | 'gold')[] = ['str', 'int', 'cha', 'dex', 'wis', 'health', 'gold'];
const MAIN_STAT_OPTIONS: (StatKey | 'gold' | null)[] = ['str', 'int', 'cha', 'dex', 'wis', 'health', 'gold', null];

const AMOUNT_OPTIONS: { label: string; value: number }[] = [
  { label: '소량', value: 1 },
  { label: '보통', value: 3 },
  { label: '많음', value: 5 },
];

export default function GuildOverlay({ visible, onClose }: Props) {
  const { routines, quests, addRoutine, removeRoutine, toggleRoutineActive, addMainQuest } = useApp();
  const [tab, setTab] = useState<'mine' | 'add' | 'main'>('mine');
  const [showCustom, setShowCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customStat, setCustomStat] = useState<StatKey | 'gold'>('str');
  const [customAmount, setCustomAmount] = useState(3);
  // Main quest form
  const [mainLabel, setMainLabel] = useState('');
  const [mainGoal, setMainGoal] = useState('7');
  const [mainStat, setMainStat] = useState<StatKey | 'gold' | null>('str');

  const suggestions = ROUTINE_SUGGESTIONS.filter(
    (s) => !routines.some((r) => r.label === s.label),
  );
  const activeMains = quests.filter((q) => q.kind === 'main' && !q.abandoned);

  const handleAddCustom = async () => {
    if (!customLabel.trim()) return;
    await addRoutine({
      label: customLabel.trim(),
      type: STAT_TO_TYPE[customStat],
      stat: customStat,
      amount: customAmount,
      active: true,
    });
    setCustomLabel('');
    setCustomStat('str');
    setCustomAmount(3);
    setShowCustom(false);
    setTab('mine');
  };

  const handleAddMain = async () => {
    if (!mainLabel.trim()) return;
    await addMainQuest({
      kind: 'main',
      label: mainLabel.trim(),
      targetStat: mainStat,
      goal: Math.max(1, parseInt(mainGoal) || 7),
      period: new Date().getFullYear().toString(),
    });
    setMainLabel('');
    setMainGoal('7');
    setMainStat('str');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>🏕️ 길드 의뢰소</Text>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, tab === 'mine' && styles.tabActive]}
                onPress={() => setTab('mine')}
              >
                <Text style={[styles.tabTxt, tab === 'mine' && styles.tabTxtActive]} numberOfLines={1}>내 루틴</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === 'add' && styles.tabActive]}
                onPress={() => setTab('add')}
              >
                <Text style={[styles.tabTxt, tab === 'add' && styles.tabTxtActive]} numberOfLines={1}>루틴 추가</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === 'main' && styles.tabActive]}
                onPress={() => setTab('main')}
              >
                <Text style={[styles.tabTxt, tab === 'main' && styles.tabTxtActive]} numberOfLines={1}>메인 퀘스트</Text>
              </TouchableOpacity>
            </View>

            {tab === 'mine' && (
              <FlatList
                data={routines}
                keyExtractor={(r) => r.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={[styles.row, !item.active && styles.rowInactive]}>
                    <Text style={styles.rowIcon}>{STAT_ICONS[item.stat] ?? '✨'}</Text>
                    <View style={styles.rowInfo}>
                      <Text style={[styles.rowLabel, !item.active && styles.rowLabelInactive]}>
                        {item.label}
                      </Text>
                      <Text style={styles.rowStat}>
                        {item.stat === 'gold' ? '💰 골드' : STAT_LABELS[item.stat as StatKey]}
                        {!item.active ? ' · 일시정지' : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, item.active && styles.toggleBtnActive]}
                      onPress={() => toggleRoutineActive(item.id)}
                    >
                      <Text style={styles.toggleTxt}>{item.active ? '⏸' : '▶'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeRoutine(item.id)}
                    >
                      <Text style={styles.deleteTxt}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.empty}>아직 루틴이 없어요. '루틴 추가'에서 골라보세요!</Text>
                }
              />
            )}

            {tab === 'add' && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Custom routine form */}
                <TouchableOpacity
                  style={styles.customToggle}
                  onPress={() => setShowCustom(v => !v)}
                >
                  <Text style={styles.customToggleTxt}>{showCustom ? '✕ 취소' : '✏️ 직접 만들기'}</Text>
                </TouchableOpacity>

                {showCustom && (
                  <View style={styles.customForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="루틴 이름 (예: 팔굽혀펴기 30개)"
                      placeholderTextColor="#666"
                      value={customLabel}
                      onChangeText={setCustomLabel}
                      maxLength={30}
                    />
                    <Text style={styles.formLabel}>스탯</Text>
                    <View style={styles.statPicker}>
                      {STAT_OPTIONS.map(s => (
                        <TouchableOpacity
                          key={s}
                          style={[styles.statChip, customStat === s && styles.statChipActive]}
                          onPress={() => setCustomStat(s)}
                        >
                          <Text style={styles.statChipTxt}>
                            {s === 'gold' ? '💰 골드' : STAT_LABELS[s as StatKey]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.formLabel}>기여도</Text>
                    <View style={styles.amountRow}>
                      {AMOUNT_OPTIONS.map(({ label, value }) => (
                        <TouchableOpacity
                          key={value}
                          style={[styles.amountChip, customAmount === value && styles.amountChipActive]}
                          onPress={() => setCustomAmount(value)}
                        >
                          <Text style={[styles.amountTxt, customAmount === value && styles.amountTxtActive]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={[styles.saveBtn, !customLabel.trim() && styles.saveBtnDisabled]}
                      onPress={handleAddCustom}
                    >
                      <Text style={styles.saveBtnTxt}>루틴 등록</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {suggestions.length > 0 && (
                  <Text style={styles.sectionLabel}>추천 루틴</Text>
                )}
                {suggestions.map(item => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.row}
                    onPress={() => {
                      addRoutine({ label: item.label, type: item.type, stat: item.stat, amount: item.amount, active: true });
                      setTab('mine');
                    }}
                  >
                    <Text style={styles.rowIcon}>{STAT_ICONS[item.stat] ?? '✨'}</Text>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      <Text style={styles.rowStat}>
                        {item.stat === 'gold' ? '💰 골드' : STAT_LABELS[item.stat as StatKey]}
                      </Text>
                    </View>
                    <Text style={styles.addLabel}>+ 추가</Text>
                  </TouchableOpacity>
                ))}
                {suggestions.length === 0 && !showCustom && (
                  <Text style={styles.empty}>추천 루틴을 모두 등록했어요!</Text>
                )}
              </ScrollView>
            )}

            {tab === 'main' && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.customForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="장기 목표 (예: 30일 운동 챌린지)"
                    placeholderTextColor="#666"
                    value={mainLabel}
                    onChangeText={setMainLabel}
                    maxLength={40}
                  />
                  <View style={styles.formRowBetween}>
                    <Text style={styles.formLabel}>목표 횟수</Text>
                    <TextInput
                      style={styles.inputSmall}
                      keyboardType="number-pad"
                      value={mainGoal}
                      onChangeText={setMainGoal}
                      maxLength={3}
                    />
                  </View>
                  <Text style={styles.formLabel}>관련 스탯</Text>
                  <View style={styles.statPicker}>
                    {MAIN_STAT_OPTIONS.map(s => (
                      <TouchableOpacity
                        key={String(s)}
                        style={[styles.statChip, mainStat === s && styles.statChipActive]}
                        onPress={() => setMainStat(s)}
                      >
                        <Text style={styles.statChipTxt}>
                          {s === null ? '없음' : s === 'gold' ? '💰 골드' : STAT_LABELS[s as StatKey]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.saveBtn, !mainLabel.trim() && styles.saveBtnDisabled]}
                    onPress={handleAddMain}
                  >
                    <Text style={styles.saveBtnTxt}>메인 퀘스트 받기</Text>
                  </TouchableOpacity>
                </View>

                {activeMains.length > 0 && (
                  <Text style={styles.sectionLabel}>진행 중인 의뢰</Text>
                )}
                {activeMains.map(q => (
                  <View key={q.id} style={styles.row}>
                    <Text style={styles.rowIcon}>
                      {q.targetStat ? (STAT_ICONS[q.targetStat] ?? '⭐') : '🎯'}
                    </Text>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowLabel}>{q.label}</Text>
                      <Text style={styles.rowStat}>{q.done ? '완수 ✅' : `진행 ${q.progress}/${q.goal}`}</Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.mainHint}>받은 퀘스트는 '오늘의 퀘스트' 화면에서 수행·완수해요.</Text>
              </ScrollView>
            )}

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
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#555',
    borderRadius: 2, alignSelf: 'center', marginVertical: 12,
  },
  title: {
    fontSize: 20, fontWeight: 'bold', color: '#F0C070',
    marginBottom: 12, textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row', backgroundColor: '#2A2A3E',
    borderRadius: 10, padding: 4, marginBottom: 14,
  },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 2, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#F0C070' },
  tabTxt: { color: '#888', fontWeight: '600', fontSize: 13 },
  tabTxtActive: { color: '#1E1E2E' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2A2A3E', borderRadius: 12,
    padding: 12, marginBottom: 8,
  },
  rowIcon: { fontSize: 20, marginRight: 10 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, color: '#EEE' },
  rowStat: { fontSize: 11, color: '#888', marginTop: 2 },
  rowInactive: { opacity: 0.55 },
  rowLabelInactive: { color: '#888' },
  toggleBtn: {
    backgroundColor: '#2A2A5E', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, marginRight: 6,
  },
  toggleBtnActive: { backgroundColor: '#1A3A2A' },
  toggleTxt: { fontSize: 14 },
  deleteBtn: {
    backgroundColor: '#6B1A1A', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  deleteTxt: { color: '#FFB0A0', fontSize: 12, fontWeight: '600' },
  addLabel: { color: '#F0C070', fontWeight: '600', fontSize: 13 },
  empty: { color: '#AAA', textAlign: 'center', marginVertical: 24, fontSize: 14 },
  sectionLabel: {
    fontSize: 11, color: '#666', fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
    textTransform: 'uppercase',
  },
  // Custom form
  customToggle: {
    alignSelf: 'flex-start', backgroundColor: '#2A2A4E',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    marginBottom: 12,
  },
  customToggleTxt: { color: '#F0C070', fontSize: 13, fontWeight: '600' },
  customForm: {
    backgroundColor: '#2A2A3E', borderRadius: 14,
    padding: 14, marginBottom: 14,
  },
  input: {
    backgroundColor: '#1E1E2E', borderRadius: 10,
    padding: 12, color: '#EEE', fontSize: 14, marginBottom: 12,
  },
  formLabel: { color: '#AAA', fontSize: 12, marginBottom: 6 },
  formRowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  inputSmall: {
    backgroundColor: '#1E1E2E', borderRadius: 8,
    padding: 8, color: '#F0C070', fontSize: 14,
    width: 60, textAlign: 'center',
  },
  mainHint: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 4 },
  statPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  statChip: {
    backgroundColor: '#1E1E2E', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, borderColor: 'transparent',
  },
  statChipActive: { borderColor: '#F0C070', backgroundColor: 'rgba(240,192,112,0.1)' },
  statChipTxt: { color: '#CCC', fontSize: 11 },
  amountRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  amountChip: {
    flex: 1, backgroundColor: '#1E1E2E', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  amountChipActive: { borderColor: '#F0C070', backgroundColor: 'rgba(240,192,112,0.1)' },
  amountTxt: { color: '#AAA', fontSize: 13, fontWeight: '600' },
  amountTxtActive: { color: '#F0C070' },
  saveBtn: {
    backgroundColor: '#F0C070', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#444' },
  saveBtnTxt: { color: '#1E1E2E', fontWeight: 'bold', fontSize: 14 },
  closeBtn: {
    marginTop: 12, backgroundColor: '#2A2A3E',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  closeTxt: { color: '#F0C070', fontSize: 15, fontWeight: '600' },
});
