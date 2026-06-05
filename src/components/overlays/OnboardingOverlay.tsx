/**
 * OnboardingOverlay — 첫 실행 4단계 위저드.
 *
 * 0 환영 → 1 첫 루틴 선택 → 2 첫 도장 체험(스탬프 애니) → 3 모험 시작.
 * 마지막에 completeOnboarding(seed) 호출 → 첫 루틴/퀘스트/액션 생성 + 온보딩 플래그 저장.
 * 기획 의도: "첫 5분 안에 첫 도장 경험".
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import Character from '../Character';
import { ROUTINE_SUGGESTIONS } from '../../data/defaultRoutines';
import { useApp } from '../../context/AppContext';

type Step = 0 | 1 | 2 | 3;

const STAT_ICONS: Record<string, string> = {
  str: '💪', int: '📖', cha: '💬', dex: '🎨', wis: '😌', health: '💧', gold: '💰',
};

interface Props {
  visible: boolean;
}

export default function OnboardingOverlay({ visible }: Props) {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<Step>(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [stamped, setStamped] = useState(false);
  const stampScale = React.useRef(new Animated.Value(1)).current;

  const seed = selectedIdx !== null ? ROUTINE_SUGGESTIONS[selectedIdx] : null;

  const handleStamp = () => {
    if (stamped) return;
    Animated.sequence([
      Animated.spring(stampScale, { toValue: 1.4, useNativeDriver: true, speed: 20 }),
      Animated.spring(stampScale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start(() => setStamped(true));
  };

  const handleFinish = async () => {
    if (!seed) return;
    await completeOnboarding(seed);
  };

  const reset = () => {
    setStep(0);
    setSelectedIdx(null);
    setStamped(false);
    stampScale.setValue(1);
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onShow={reset}>
      <View style={styles.root}>

        {/* ─── Step 0: Welcome ─── */}
        {step === 0 && (
          <View style={styles.center}>
            <Character job="novice" size={160} />
            <Text style={styles.mainTitle}>삶의 부캐</Text>
            <Text style={styles.subtitle}>
              오늘 한 일이 캐릭터를 키워요.{'\n'}
              삶에 따라 직업이 변해갑니다.
            </Text>
            <View style={styles.conceptRow}>
              <ConceptChip icon="⚔️" label="수련 기록" />
              <ConceptChip icon="📈" label="스탯 성장" />
              <ConceptChip icon="🎭" label="직업 변화" />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)}>
              <Text style={styles.primaryBtnTxt}>여정 시작하기 →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Step 1: Pick routine ─── */}
        {step === 1 && (
          <View style={styles.stepRoot}>
            <Text style={styles.stepTitle}>오늘 어떤 수련을 시작할까요?</Text>
            <Text style={styles.stepSub}>하나만 골라도 충분해요</Text>
            <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
              {ROUTINE_SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.routineItem, selectedIdx === i && styles.routineItemSelected]}
                  onPress={() => setSelectedIdx(i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.routineIcon}>{STAT_ICONS[s.stat] ?? '✨'}</Text>
                  <Text style={[styles.routineLabel, selectedIdx === i && styles.routineLabelSelected]}>
                    {s.label}
                  </Text>
                  {selectedIdx === i && <Text style={styles.routineCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.primaryBtn, selectedIdx === null && styles.btnDisabled]}
              onPress={() => selectedIdx !== null && setStep(2)}
              activeOpacity={selectedIdx !== null ? 0.8 : 1}
            >
              <Text style={styles.primaryBtnTxt}>이걸로 시작! →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Step 2: First stamp ─── */}
        {step === 2 && seed && (
          <View style={styles.center}>
            <Text style={styles.stepTitle}>도장을 찍어보세요!</Text>
            <Text style={styles.stepSub}>탭해서 첫 번째 수련을 기록해요</Text>

            <Animated.View style={{ transform: [{ scale: stampScale }] }}>
              <TouchableOpacity
                style={[styles.stampBtn, stamped && styles.stampBtnDone]}
                onPress={handleStamp}
                activeOpacity={0.8}
              >
                <Text style={styles.stampIcon}>{STAT_ICONS[seed.stat] ?? '✨'}</Text>
                <Text style={styles.stampLabel}>{seed.label}</Text>
                {stamped && <Text style={styles.stampCheck}>✅ 완료!</Text>}
              </TouchableOpacity>
            </Animated.View>

            {stamped && (
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardTxt}>
                  +{seed.amount} {STAT_ICONS[seed.stat]} 수련 완료!
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, !stamped && styles.btnDisabled]}
              onPress={() => stamped && setStep(3)}
              activeOpacity={stamped ? 0.8 : 1}
            >
              <Text style={styles.primaryBtnTxt}>캐릭터 확인 →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Step 3: Character reveal ─── */}
        {step === 3 && (
          <View style={styles.center}>
            <Character job="novice" size={160} />
            <Text style={styles.jobLabel}>견습생</Text>
            <View style={styles.voiceBox}>
              <Text style={styles.voiceTxt}>
                "안녕하세요! 저는 아직 견습생이에요.{'\n'}
                수련을 이어갈수록 달라질 거예요."
              </Text>
            </View>
            <Text style={styles.hint}>
              매일 수련하면{'\n'}당신에게 맞는 직업으로 변해가요
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
              <Text style={styles.primaryBtnTxt}>모험 시작! ✨</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step indicator dots */}
        <View style={styles.dots}>
          {([0, 1, 2, 3] as Step[]).map((s) => (
            <View key={s} style={[styles.dot, step === s && styles.dotActive]} />
          ))}
        </View>

      </View>
    </Modal>
  );
}

function ConceptChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0E22',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stepRoot: {
    flex: 1,
    width: '100%',
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#F0C070',
    marginTop: 20,
    textShadowColor: 'rgba(240,192,112,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 24,
  },
  conceptRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  chipIcon: { fontSize: 14 },
  chipLabel: { fontSize: 12, color: '#CCC' },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0C070',
    textAlign: 'center',
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  listArea: {
    flex: 1,
    width: '100%',
    marginBottom: 12,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  routineItemSelected: {
    backgroundColor: 'rgba(240,192,112,0.12)',
    borderColor: '#F0C070',
  },
  routineIcon: { fontSize: 20, marginRight: 12 },
  routineLabel: { flex: 1, fontSize: 15, color: '#DDD' },
  routineLabelSelected: { color: '#F0C070', fontWeight: '600' },
  routineCheck: { fontSize: 18, color: '#F0C070' },
  stampBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 3,
    borderColor: '#4A4070',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 28,
  },
  stampBtnDone: {
    backgroundColor: 'rgba(240,192,112,0.15)',
    borderColor: '#F0C070',
  },
  stampIcon: { fontSize: 48, marginBottom: 8 },
  stampLabel: { fontSize: 15, color: '#EEE', textAlign: 'center', paddingHorizontal: 16 },
  stampCheck: { fontSize: 18, color: '#F0C070', marginTop: 8, fontWeight: 'bold' },
  rewardBadge: {
    backgroundColor: 'rgba(240,192,112,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 16,
  },
  rewardTxt: { color: '#F0C070', fontWeight: 'bold', fontSize: 15 },
  jobLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0C070',
    marginTop: 12,
    marginBottom: 14,
  },
  voiceBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: 300,
    marginBottom: 16,
  },
  voiceTxt: {
    color: '#DDD',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  hint: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  primaryBtn: {
    backgroundColor: '#F0C070',
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#F0C070',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: '#444',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnTxt: {
    color: '#1A1A2E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: '#F0C070',
    width: 20,
  },
});
