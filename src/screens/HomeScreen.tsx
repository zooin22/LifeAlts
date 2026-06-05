/**
 * HomeScreen — 메인 화면.
 *
 * 구성: 시간대 배경 + 상단 HUD(퀘스트 카드·스트릭·스탯) + 중앙 캐릭터 + 바텀 네비.
 * 라우터 없이 `tab` 상태 하나로 어떤 오버레이를 띄울지 결정한다(각 오버레이는 Modal).
 * 퀘스트 화면은 네비 버튼이 아니라 상단 "오늘의 퀘스트" 카드로 진입한다.
 * pendingJobChange/pendingReward/returnInfo/showCelebration 등 일회성 신호로 연출을 띄운다.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import Background from '../components/Background';
import Character from '../components/Character';
import StatsOverlay from '../components/overlays/StatsOverlay';
import ShopOverlay from '../components/overlays/ShopOverlay';
import QuestOverlay from '../components/overlays/QuestOverlay';
import GuildOverlay from '../components/overlays/GuildOverlay';
import JobTransitionOverlay from '../components/overlays/JobTransitionOverlay';
import OnboardingOverlay from '../components/overlays/OnboardingOverlay';
import ReturnOverlay from '../components/overlays/ReturnOverlay';
import CelebrationOverlay from '../components/overlays/CelebrationOverlay';
import RewardToast from '../components/RewardToast';
import { JOB_MAP } from '../data/jobs';
import { SHOP_ITEM_MAP } from '../data/shopItems';
import { requestNotificationPermission, scheduleDailyReminder } from '../utils/notifications';
import { getVoice } from '../data/voices';
import { getSlumberMessage } from '../utils/jobEngine';
import { useTimeOfDay, TIME_PALETTE } from '../utils/time';
import { StatKey } from '../types';

type TabId = 'home' | 'stats' | 'shop' | 'guild' | 'quest';

// 'quest' 는 네비 버튼이 아니라 상단 퀘스트 카드로만 진입한다.
const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home',  icon: '🏠', label: '홈' },
  { id: 'stats', icon: '📊', label: '스탯' },
  { id: 'shop',  icon: '🛒', label: '상점' },   // 가운데 돌출 버튼 (준비 중)
  { id: 'guild', icon: '🏕️', label: '길드' },
];

const TOP_STATS: { key: StatKey; icon: string }[] = [
  { key: 'str',    icon: '💪' },
  { key: 'int',    icon: '📖' },
  { key: 'health', icon: '❤️' },
];

export default function HomeScreen() {
  const {
    loading, character, routines, quests, todayDone, actions,
    walletGold, inventory,
    isFirstLaunch, pendingJobChange, clearJobChange,
    pendingReward, clearReward,
    returnInfo, dismissReturn, useStreakFreeze,
  } = useApp();
  const [tab, setTab] = useState<TabId>('home');
  const [showCelebration, setShowCelebration] = useState(false);
  const prevAllDoneRef = useRef(false);
  const tod = useTimeOfDay(); // 라이브 시간대 (경계 넘으면 자동 리렌더) — 훅이므로 early return 위에 위치

  // Derived values (safe before early return since hooks are above)
  const activeRoutines = routines.filter((r) => r.active);
  const allDone = activeRoutines.length > 0 && todayDone.size >= activeRoutines.length;

  // All hooks must be before any conditional return
  useEffect(() => {
    if (!loading && !isFirstLaunch) {
      requestNotificationPermission().then(granted => {
        if (granted) scheduleDailyReminder(9, 0);
      });
    }
  }, [loading, isFirstLaunch]);

  useEffect(() => {
    if (!loading && allDone && !prevAllDoneRef.current) {
      setShowCelebration(true);
    }
    if (!loading) prevAllDoneRef.current = allDone;
  }, [loading, allDone]);

  if (loading) {
    return (
      <View style={styles.loadingBg}>
        <ActivityIndicator size="large" color="#F0C070" />
      </View>
    );
  }

  const palette = TIME_PALETTE[tod];
  const jobDef = JOB_MAP[character.job];
  const equippedTitle = inventory.equippedTitle ? SHOP_ITEM_MAP[inventory.equippedTitle] : null;
  const situation = allDone ? 'complete_all' : todayDone.size > 0 ? 'complete_one' : 'inactive';
  const slumberMsg = situation === 'inactive'
    ? getSlumberMessage(actions, jobDef?.primaryStat ?? null)
    : null;
  const voiceLine = slumberMsg ?? getVoice(character.job, situation);
  const mood: 'idle' | 'happy' | 'sleepy' = allDone ? 'happy' : slumberMsg ? 'sleepy' : 'idle';
  const todayDailies = quests.filter((q) => q.kind === 'daily').slice(0, 3);

  const closeOverlay = () => setTab('home');

  return (
    <Background>
      <SafeAreaView style={styles.safe}>

        {/* ─── TOP HUD ─── */}
        <View style={styles.topHud}>

          {/* Quest scroll card — pressable, opens 퀘스트/수련 screen */}
          <TouchableOpacity style={styles.questCard} onPress={() => setTab('quest')} activeOpacity={0.7}>
            <View style={styles.questCardHeader}>
              <Text style={styles.questTitle}>오늘의 퀘스트</Text>
              <Text style={styles.questChevron}>›</Text>
            </View>
            {todayDailies.length === 0 ? (
              <Text style={styles.questEmpty}>퀘스트가 없어요</Text>
            ) : (
              todayDailies.map((q) => {
                const r = activeRoutines.find((ar) => ar.label === q.label);
                const done = r ? todayDone.has(r.id) : q.done;
                return (
                  <View key={q.id} style={styles.questRow}>
                    <Text style={styles.questCheck}>{done ? '☑' : '☐'}</Text>
                    <Text
                      style={[styles.questLabel, done && styles.questLabelDone]}
                      numberOfLines={1}
                    >
                      {q.label}
                    </Text>
                  </View>
                );
              })
            )}
            <Text style={styles.questTapHint}>탭하여 도장 찍기</Text>
          </TouchableOpacity>

          {/* Streak badge (center) — taps to open StatsOverlay */}
          <TouchableOpacity style={styles.streakCenter} onPress={() => setTab('stats')} activeOpacity={0.85}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
            </View>
            <Text style={styles.streakNum}>{character.streak}일 연속!</Text>
          </TouchableOpacity>

          {/* Stats (right) — taps to open StatsOverlay */}
          <TouchableOpacity style={styles.statsRight} onPress={() => setTab('stats')} activeOpacity={0.85}>
            {TOP_STATS.map(({ key, icon }) => (
              <View key={key} style={styles.statChip}>
                <Text style={styles.statIcon}>{icon}</Text>
                <Text style={styles.statVal}>{Math.round(character.stats[key])}</Text>
              </View>
            ))}
            <View style={[styles.statChip, styles.goldChip]}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={[styles.statVal, styles.goldVal]}>
                {walletGold.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* ─── CHARACTER AREA ─── */}
        <View style={styles.characterArea}>
          <Character job={character.job} size={190} celebrate={allDone} mood={mood} />

          <View style={styles.nameBadge}>
            <Text style={styles.jobName}>
              {equippedTitle ? `${equippedTitle.icon} ${equippedTitle.name} ` : ''}
              {jobDef?.name ?? character.job}
            </Text>
          </View>

          <View style={styles.voiceBox}>
            <Text style={styles.voiceTxt}>"{voiceLine}"</Text>
          </View>

          {/* Today progress dots */}
          {activeRoutines.length > 0 && (
            <View style={styles.dotsRow}>
              {activeRoutines.map((r) => (
                <View
                  key={r.id}
                  style={[styles.dot, todayDone.has(r.id) && styles.dotDone]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ─── BOTTOM TAB BAR ─── */}
        <View style={styles.tabBar}>
          {TABS.map(({ id, icon, label }) => {
            const active = tab === id;
            return (
              <TouchableOpacity
                key={id}
                style={styles.tabItem}
                onPress={() => setTab(id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabIcon, active && { color: palette.accent }]}>
                  {icon}
                </Text>
                <Text style={[styles.tabLabel, active && { color: palette.accent }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </SafeAreaView>

      <StatsOverlay  visible={tab === 'stats'}  onClose={closeOverlay} />
      <QuestOverlay  visible={tab === 'quest'}  onClose={closeOverlay} />
      <GuildOverlay  visible={tab === 'guild'}  onClose={closeOverlay} />
      <ShopOverlay   visible={tab === 'shop'}   onClose={closeOverlay} />

      {pendingJobChange && (
        <JobTransitionOverlay
          visible
          fromJob={pendingJobChange.from}
          toJob={pendingJobChange.to}
          onDone={clearJobChange}
        />
      )}

      <RewardToast reward={pendingReward} onDone={clearReward} />

      {returnInfo && (
        <ReturnOverlay
          visible
          info={returnInfo}
          freezes={inventory.streakFreezes}
          onUseFreeze={useStreakFreeze}
          onDismiss={dismissReturn}
        />
      )}

      <CelebrationOverlay
        visible={showCelebration}
        jobId={character.job}
        jobName={jobDef?.name ?? character.job}
        streak={character.streak}
        onClose={() => setShowCelebration(false)}
      />

      <OnboardingOverlay visible={isFirstLaunch} />
    </Background>
  );
}

const styles = StyleSheet.create({
  loadingBg: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* ── Top HUD ── */
  topHud: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },

  /* Quest card */
  questCard: {
    backgroundColor: 'rgba(255, 245, 210, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 140,
    minWidth: 120,
    borderWidth: 1.5,
    borderColor: 'rgba(180, 130, 30, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  questCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  questTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B4A10',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  questChevron: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#9B6A10',
    marginLeft: 3,
    marginTop: -2,
  },
  questTapHint: {
    fontSize: 8,
    color: '#A07A30',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  questEmpty: {
    fontSize: 10,
    color: '#9B7A30',
    textAlign: 'center',
    paddingVertical: 4,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  questCheck: {
    fontSize: 12,
    color: '#4A7A30',
    marginRight: 4,
    lineHeight: 16,
  },
  questLabel: {
    fontSize: 11,
    color: '#4A3010',
    flex: 1,
    lineHeight: 16,
  },
  questLabelDone: {
    textDecorationLine: 'line-through',
    color: '#9B7A50',
  },

  /* Streak badge */
  streakCenter: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 4,
  },
  streakBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 200, 60, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  streakFire: {
    fontSize: 26,
  },
  streakNum: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* Stats right */
  statsRight: {
    alignItems: 'flex-end',
    gap: 5,
    paddingTop: 2,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 54,
  },
  goldChip: {
    backgroundColor: 'rgba(80, 60, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  statIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  statVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  goldVal: {
    color: '#FFD700',
  },

  /* ── Character area ── */
  characterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  nameBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginTop: 8,
  },
  jobName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F0C070',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  voiceBox: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    maxWidth: 280,
  },
  voiceTxt: {
    color: '#EEE',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  dotDone: {
    backgroundColor: '#F0C070',
    borderColor: '#F0C070',
  },

  /* ── Bottom tab bar ── */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,8,20,0.82)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 14 : 22,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
    color: '#888',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
  },
});
