/**
 * ReturnOverlay — 며칠 만에 돌아온 사용자를 위한 복귀 환영.
 *
 * 2일+ 공백 시 AppContext가 returnInfo를 세팅 → 이 오버레이 표시.
 * 끊긴 스트릭은 "박제"(최고 기록 보존)하고, 복구권 보유 시 사용 버튼 제공.
 * 톤: "채찍은 하는 사람에게, 환대는 돌아온 사람에게."
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Character from '../Character';

interface ReturnInfo {
  daysSince: number;
  streakBroken: boolean;
  prevStreak: number;
}

interface Props {
  visible: boolean;
  info: ReturnInfo;
  freezes: number;
  onUseFreeze: () => void;
  onDismiss: () => void;
}

export default function ReturnOverlay({ visible, info, freezes, onUseFreeze, onDismiss }: Props) {
  const { daysSince, streakBroken, prevStreak } = info;
  const canFreeze = streakBroken && prevStreak > 1 && freezes > 0;

  const isLongAbsence = daysSince >= 7;
  const isReturn = daysSince >= 2;

  const title = isLongAbsence
    ? `${daysSince}일을 기다렸어요`
    : `${daysSince}일 만에 돌아왔군요`;

  const message = isLongAbsence
    ? `오랫동안 보고 싶었어요.\n돌아와줘서 정말 고마워요.`
    : `며칠 쉬었군요. 쉬는 것도 수련의 일부예요.\n오늘부터 다시 시작해볼까요?`;

  const streakMsg = streakBroken && prevStreak > 1
    ? `이전 연속 기록: 🔥 ${prevStreak}일 — 박제됩니다`
    : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Character job="novice" size={100} />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {streakMsg && (
            <View style={styles.streakBox}>
              <Text style={styles.streakTxt}>{streakMsg}</Text>
            </View>
          )}

          <Text style={styles.encouragement}>
            채찍은 하는 사람에게,{'\n'}환대는 돌아온 사람에게.
          </Text>

          {canFreeze && (
            <TouchableOpacity style={styles.freezeBtn} onPress={onUseFreeze}>
              <Text style={styles.freezeTxt}>🧊 복구권으로 연속 기록 지키기 (보유 {freezes})</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btn} onPress={onDismiss}>
            <Text style={styles.btnTxt}>다시 시작하기 ✨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#12112A',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(240,192,112,0.2)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0C070',
    marginTop: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  streakBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 14,
  },
  streakTxt: {
    fontSize: 13,
    color: '#FF8844',
    textAlign: 'center',
  },
  encouragement: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  freezeBtn: {
    backgroundColor: 'rgba(120,184,255,0.15)',
    borderWidth: 1,
    borderColor: '#6BA3FF',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  freezeTxt: { color: '#9CC4FF', fontWeight: '700', fontSize: 13 },
  btn: {
    backgroundColor: '#F0C070',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#1A1A2E',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
