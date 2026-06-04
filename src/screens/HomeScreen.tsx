import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import Background from '../components/Background';
import Character from '../components/Character';
import RecordOverlay from '../components/overlays/RecordOverlay';
import StatsOverlay from '../components/overlays/StatsOverlay';
import QuestOverlay from '../components/overlays/QuestOverlay';
import GuildOverlay from '../components/overlays/GuildOverlay';
import { JOB_MAP } from '../data/jobs';
import { getVoice } from '../data/voices';
import { getGreeting, getTimeOfDay, TIME_PALETTE } from '../utils/time';

type OverlayId = 'record' | 'stats' | 'quest' | 'guild' | null;

export default function HomeScreen() {
  const { loading, character, routines, todayDone } = useApp();
  const [overlay, setOverlay] = useState<OverlayId>(null);

  if (loading) {
    return (
      <View style={styles.loadingBg}>
        <ActivityIndicator size="large" color="#F0C070" />
      </View>
    );
  }

  const tod = getTimeOfDay();
  const palette = TIME_PALETTE[tod];
  const jobDef = JOB_MAP[character.job];

  const activeRoutines = routines.filter((r) => r.active);
  const allDone = activeRoutines.length > 0 && todayDone.size >= activeRoutines.length;
  const anyDone = todayDone.size > 0;
  const situation = allDone ? 'complete_all' : anyDone ? 'complete_one' : 'inactive';
  const voiceLine = getVoice(character.job, situation);

  return (
    <Background>
      <SafeAreaView style={styles.safe}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakTxt}>🔥 {character.streak}일 연속</Text>
          </View>
          <Text style={[styles.greeting, { color: palette.text }]}>
            {getGreeting(tod)}
          </Text>
        </View>

        {/* Character center */}
        <View style={styles.characterArea}>
          <Character job={character.job} size={130} />
          <Text style={[styles.jobName, { color: palette.text }]}>
            {jobDef?.name ?? character.job}
          </Text>
          <View style={styles.voiceBox}>
            <Text style={styles.voiceTxt}>"{voiceLine}"</Text>
          </View>
        </View>

        {/* Today's progress dots */}
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

        {/* Bottom action bar */}
        <View style={styles.actionBar}>
          <ActionBtn icon="⚔️" label="기록"    accent={palette.accent} onPress={() => setOverlay('record')} />
          <ActionBtn icon="📊" label="스탯"    accent={palette.accent} onPress={() => setOverlay('stats')} />
          <ActionBtn icon="📜" label="퀘스트"  accent={palette.accent} onPress={() => setOverlay('quest')} />
          <ActionBtn icon="🏕️" label="길드"    accent={palette.accent} onPress={() => setOverlay('guild')} />
        </View>
      </SafeAreaView>

      <RecordOverlay visible={overlay === 'record'} onClose={() => setOverlay(null)} />
      <StatsOverlay  visible={overlay === 'stats'}  onClose={() => setOverlay(null)} />
      <QuestOverlay  visible={overlay === 'quest'}  onClose={() => setOverlay(null)} />
      <GuildOverlay  visible={overlay === 'guild'}  onClose={() => setOverlay(null)} />
    </Background>
  );
}

function ActionBtn({
  icon,
  label,
  accent,
  onPress,
}: {
  icon: string;
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, { color: accent }]}>{label}</Text>
    </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  streakBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  streakTxt: {
    color: '#FF6B35',
    fontWeight: 'bold',
    fontSize: 14,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  characterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  jobName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  voiceBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 10,
    maxWidth: 280,
  },
  voiceTxt: {
    color: '#EEE',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  dotDone: {
    backgroundColor: '#F0C070',
    borderColor: '#F0C070',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
