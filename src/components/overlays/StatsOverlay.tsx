/**
 * StatsOverlay — 스탯 & 연대기.
 *
 * 스탯 탭: 6스탯 바 차트 + 소지금 + 스트릭(현재/최고).
 * 연대기 탭: 활동 히트맵(최근 5주) + 직업 변천사 타임라인 + 한 줄 일지 + 스탯별 기록.
 */
import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { STAT_LABELS, StatKey, JobId } from '../../types';
import { JOB_MAP } from '../../data/jobs';
import { toDateStr } from '../../utils/streak';

const JOB_EMOJI: Record<JobId, string> = {
  novice: '🌱', warrior: '⚔️', mage: '🔮', bard: '🎵', rogue: '🗡️',
  monk: '☯️', naturalist: '🌿', merchant: '💰', paladin: '🛡️',
  alchemist: '⚗️', hunter: '🏹', sage: '📚', healer: '💚',
  martial_artist: '👊', astrologer: '✨', adventurer: '🗺️',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STAT_ORDER: StatKey[] = ['str', 'int', 'cha', 'dex', 'wis', 'health'];
const MAX_STAT = 100;

const STAT_COLORS: Record<StatKey, string> = {
  str:    '#FF6B6B',
  int:    '#6BA3FF',
  cha:    '#FFB347',
  dex:    '#98D8C8',
  wis:    '#B19CD9',
  health: '#90EE90',
};

function activityColor(count: number): string {
  if (count === 0) return '#1E1E2E';
  if (count <= 1)  return '#3A2A50';
  if (count <= 3)  return '#7A5020';
  return '#F0C070';
}

export default function StatsOverlay({ visible, onClose }: Props) {
  const { character, actions, jobHistory, walletGold } = useApp();
  const [tab, setTab] = useState<'stats' | 'chronicle'>('stats');
  const job = JOB_MAP[character.job];

  // ── Activity calendar (last 35 days) ──────────────────────────────────────
  const { days, activityMap } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayList: string[] = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayList.push(d.toISOString().slice(0, 10));
    }
    const map: Record<string, number> = {};
    actions.forEach(a => {
      const day = a.ts.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return { days: dayList, activityMap: map };
  }, [actions]);

  const todayStr = toDateStr();
  const totalActions = actions.length;
  const activeDays = Object.keys(activityMap).filter(d => activityMap[d] > 0).length;

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
  // Pad start so first day lands on correct column
  const firstDow = new Date(days[0] + 'T00:00:00').getDay();
  const padded = [...Array(firstDow).fill(null), ...days];
  const rows: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    rows.push(padded.slice(i, i + 7));
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />

          {/* Tab selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'stats' && styles.tabBtnActive]}
              onPress={() => setTab('stats')}
            >
              <Text style={[styles.tabTxt, tab === 'stats' && styles.tabTxtActive]}>📊 스탯</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'chronicle' && styles.tabBtnActive]}
              onPress={() => setTab('chronicle')}
            >
              <Text style={[styles.tabTxt, tab === 'chronicle' && styles.tabTxtActive]}>📅 연대기</Text>
            </TouchableOpacity>
          </View>

          {/* ── Stats tab ── */}
          {tab === 'stats' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.jobRow}>
                <Text style={styles.jobName}>{job?.name ?? character.job}</Text>
                <Text style={styles.jobDesc}>{job?.description ?? ''}</Text>
              </View>

              {STAT_ORDER.map((stat) => {
                const val = character.stats[stat];
                const pct = Math.min((val / MAX_STAT) * 100, 100);
                return (
                  <View key={stat} style={styles.statRow}>
                    <Text style={styles.statLabel}>{STAT_LABELS[stat]}</Text>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct}%` as any, backgroundColor: STAT_COLORS[stat] },
                        ]}
                      />
                    </View>
                    <Text style={styles.statVal}>{Math.round(val)}</Text>
                  </View>
                );
              })}

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>🪙 소지금</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      styles.goldFill,
                      { width: `${Math.min((walletGold / MAX_STAT) * 100, 100)}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.statVal}>{walletGold}</Text>
              </View>

              <View style={styles.streakBox}>
                <View style={styles.streakItem}>
                  <Text style={styles.streakNum}>{character.streak}</Text>
                  <Text style={styles.streakLabel}>🔥 현재</Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakItem}>
                  <Text style={styles.streakNum}>{character.longestStreak}</Text>
                  <Text style={styles.streakLabel}>🏆 최고</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* ── Chronicle tab ── */}
          {tab === 'chronicle' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.summaryRow}>
                <SummaryChip icon="⚔️" label="총 기록" value={String(totalActions)} />
                <SummaryChip icon="📅" label="활동일" value={`${activeDays}일`} />
                <SummaryChip icon="🔥" label="최고 연속" value={`${character.longestStreak}일`} />
              </View>

              {/* Calendar grid */}
              <Text style={styles.calLabel}>최근 5주 활동</Text>
              <View style={styles.calContainer}>
                {/* Day of week headers */}
                <View style={styles.calRow}>
                  {DAY_LABELS.map(d => (
                    <Text key={d} style={styles.calDow}>{d}</Text>
                  ))}
                </View>
                {rows.map((row, ri) => (
                  <View key={ri} style={styles.calRow}>
                    {row.map((day, ci) => {
                      if (!day) return <View key={ci} style={styles.calCell} />;
                      const count = activityMap[day] ?? 0;
                      const isToday = day === todayStr;
                      return (
                        <View
                          key={day}
                          style={[
                            styles.calCell,
                            { backgroundColor: activityColor(count) },
                            isToday && styles.calCellToday,
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Legend */}
              <View style={styles.legendRow}>
                {[0, 1, 2, 4].map(c => (
                  <View key={c} style={styles.legendItem}>
                    <View style={[styles.legendCell, { backgroundColor: activityColor(c) }]} />
                    <Text style={styles.legendTxt}>{c === 0 ? '없음' : c <= 1 ? '1회' : c <= 3 ? '2-3회' : '4회+'}</Text>
                  </View>
                ))}
              </View>

              {/* Job journey timeline (직업 변천사) */}
              <Text style={styles.calLabel}>🛤️ 직업 변천사</Text>
              <View style={styles.timeline}>
                {[...jobHistory].reverse().map((ev, i) => {
                  const def = JOB_MAP[ev.to];
                  const isCurrent = i === 0;
                  return (
                    <View key={ev.id} style={styles.tlRow}>
                      <View style={styles.tlLeft}>
                        <View style={[styles.tlDot, isCurrent && styles.tlDotCurrent]}>
                          <Text style={styles.tlEmoji}>{JOB_EMOJI[ev.to] ?? '⭐'}</Text>
                        </View>
                        {i < jobHistory.length - 1 && <View style={styles.tlLine} />}
                      </View>
                      <View style={styles.tlBody}>
                        <View style={styles.tlHeader}>
                          <Text style={styles.tlJob}>{def?.name ?? ev.to}</Text>
                          {isCurrent && <Text style={styles.tlBadge}>현재</Text>}
                        </View>
                        <Text style={styles.tlSub}>
                          {JOB_MAP[ev.from]?.name ?? ev.from}에서 전직 · {formatDate(ev.ts)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                {/* Starting point */}
                <View style={styles.tlRow}>
                  <View style={styles.tlLeft}>
                    <View style={styles.tlDotStart}>
                      <Text style={styles.tlEmoji}>🌱</Text>
                    </View>
                  </View>
                  <View style={styles.tlBody}>
                    <Text style={styles.tlJob}>견습생</Text>
                    <Text style={styles.tlSub}>모험의 시작</Text>
                  </View>
                </View>
              </View>

              {/* Journal notes (한 줄 일지) */}
              {(() => {
                const notes = actions
                  .filter(a => a.note && a.stat === null)
                  .slice()
                  .reverse()
                  .slice(0, 12);
                if (notes.length === 0) return null;
                return (
                  <>
                    <Text style={styles.calLabel}>📖 한 줄 일지</Text>
                    <View style={styles.journalList}>
                      {notes.map(n => (
                        <View key={n.id} style={styles.journalItem}>
                          <Text style={styles.journalDate}>{formatDate(n.ts)}</Text>
                          <Text style={styles.journalText}>{n.note}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                );
              })()}

              {/* Recent activity by stat */}
              <Text style={styles.calLabel}>스탯별 기록 현황</Text>
              {STAT_ORDER.map(stat => {
                const count = actions.filter(a => a.stat === stat).length;
                if (count === 0) return null;
                return (
                  <View key={stat} style={styles.statHistRow}>
                    <Text style={styles.statHistLabel}>{STAT_LABELS[stat]}</Text>
                    <View style={styles.statHistBar}>
                      <View
                        style={[
                          styles.statHistFill,
                          {
                            width: `${Math.min((count / Math.max(...STAT_ORDER.map(s => actions.filter(a => a.stat === s).length), 1)) * 100, 100)}%` as any,
                            backgroundColor: STAT_COLORS[stat],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.statHistCount}>{count}회</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>닫기</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SummaryChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
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
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#555',
    borderRadius: 2, alignSelf: 'center', marginVertical: 12,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: '#F0C070' },
  tabTxt: { color: '#888', fontWeight: '600', fontSize: 14 },
  tabTxtActive: { color: '#1E1E2E' },
  jobRow: { alignItems: 'center', marginBottom: 16 },
  jobName: { fontSize: 18, fontWeight: '700', color: '#F0C070' },
  jobDesc: { fontSize: 12, color: '#AAA', marginTop: 4, textAlign: 'center' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { width: 88, fontSize: 12, color: '#DDD' },
  barBg: {
    flex: 1, height: 10, backgroundColor: '#2A2A3E',
    borderRadius: 5, overflow: 'hidden', marginHorizontal: 8,
  },
  barFill: { height: '100%', borderRadius: 5 },
  goldFill: { backgroundColor: '#F0C070' },
  statVal: { width: 32, textAlign: 'right', fontSize: 12, color: '#F0C070' },
  streakBox: {
    flexDirection: 'row',
    backgroundColor: '#2A2A3E',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    marginBottom: 4,
    justifyContent: 'space-around',
  },
  streakItem: { alignItems: 'center' },
  streakNum: { fontSize: 26, fontWeight: 'bold', color: '#FF8844' },
  streakLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  streakDivider: { width: 1, backgroundColor: '#3A3A5E' },
  // Summary chips
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryChip: {
    flex: 1, backgroundColor: '#2A2A3E',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  summaryIcon: { fontSize: 20, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#F0C070' },
  summaryLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  // Calendar
  calLabel: {
    fontSize: 12, color: '#888', fontWeight: '600',
    letterSpacing: 0.5, marginBottom: 10, marginTop: 4,
  },
  calContainer: { marginBottom: 8 },
  calRow: { flexDirection: 'row', marginBottom: 3 },
  calDow: {
    flex: 1, textAlign: 'center', fontSize: 9,
    color: '#666', marginBottom: 4,
  },
  calCell: {
    flex: 1, aspectRatio: 1, margin: 1.5,
    borderRadius: 3, backgroundColor: '#1E1E2E',
  },
  calCellToday: {
    borderWidth: 1.5, borderColor: '#F0C070',
  },
  legendRow: {
    flexDirection: 'row', gap: 12,
    marginBottom: 20, marginTop: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendCell: { width: 12, height: 12, borderRadius: 2 },
  legendTxt: { fontSize: 10, color: '#666' },
  // Stat history
  statHistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statHistLabel: { width: 82, fontSize: 11, color: '#CCC' },
  statHistBar: {
    flex: 1, height: 8, backgroundColor: '#2A2A3E',
    borderRadius: 4, overflow: 'hidden', marginHorizontal: 8,
  },
  statHistFill: { height: '100%', borderRadius: 4 },
  statHistCount: { width: 30, textAlign: 'right', fontSize: 11, color: '#888' },
  // Job journey timeline
  timeline: { marginBottom: 14 },
  tlRow: { flexDirection: 'row' },
  tlLeft: { width: 44, alignItems: 'center' },
  tlDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#2A2A3E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#3A3A5E',
  },
  tlDotCurrent: { borderColor: '#F0C070', backgroundColor: 'rgba(240,192,112,0.15)' },
  tlDotStart: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#22202E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#2E2E44', borderStyle: 'dashed',
  },
  tlEmoji: { fontSize: 17 },
  tlLine: { flex: 1, width: 2, backgroundColor: '#3A3A5E', marginVertical: 2 },
  tlBody: { flex: 1, paddingBottom: 16, paddingTop: 4, paddingLeft: 4 },
  tlHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tlJob: { fontSize: 15, fontWeight: '700', color: '#EEE' },
  tlBadge: {
    fontSize: 10, color: '#1E1E2E', fontWeight: 'bold',
    backgroundColor: '#F0C070', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 1, overflow: 'hidden',
  },
  tlSub: { fontSize: 11, color: '#888', marginTop: 3 },
  // Journal notes
  journalList: { marginBottom: 14 },
  journalItem: {
    backgroundColor: '#22222F', borderRadius: 10,
    padding: 11, marginBottom: 7,
    borderLeftWidth: 3, borderLeftColor: '#5A4DA0',
  },
  journalDate: { fontSize: 10, color: '#888', marginBottom: 3 },
  journalText: { fontSize: 13, color: '#DDD', lineHeight: 19 },
  closeBtn: {
    marginTop: 14, backgroundColor: '#2A2A3E',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  closeTxt: { color: '#F0C070', fontSize: 15, fontWeight: '600' },
});
