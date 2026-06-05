import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * expo-notifications 는 SDK 53+ 부터 Expo Go 에서 푸시 기능이 제거되어,
 * 모듈을 import 하는 것만으로도 크래시한다. 우리는 로컬 알림만 쓰지만 안전하게:
 *  - Expo Go 에서는 expo-notifications 를 절대 로드하지 않고 전부 no-op.
 *  - dev build / standalone 에서만 지연 로드해서 사용.
 * (개발 빌드로 전환하면 알림이 자동으로 켜진다.)
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let _notif: typeof import('expo-notifications') | null = null;
let _handlerSet = false;

function getNotif(): typeof import('expo-notifications') | null {
  if (isExpoGo) return null;
  if (!_notif) {
    // 지연 require: Expo Go 가 아닐 때만 모듈을 평가한다.
    _notif = require('expo-notifications');
  }
  return _notif;
}

function ensureHandler(N: typeof import('expo-notifications')) {
  if (_handlerSet) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  _handlerSet = true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const N = getNotif();
  if (!N) return false;
  ensureHandler(N);

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('daily', {
      name: '일일 수련 알림',
      importance: N.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await N.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour = 9, minute = 0): Promise<void> {
  const N = getNotif();
  if (!N) return;

  // Cancel any existing daily reminders first
  await cancelDailyReminder();

  await N.scheduleNotificationAsync({
    content: {
      title: '삶의 부캐',
      body: '오늘 수련은 아직이에요. 캐릭터가 기다리고 있어요! ⚔️',
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  const N = getNotif();
  if (!N) return;

  const scheduled = await N.getAllScheduledNotificationsAsync();
  const dailies = scheduled.filter(n => n.content.data?.type === 'daily_reminder');
  await Promise.all(dailies.map(n => N.cancelScheduledNotificationAsync(n.identifier)));
}

export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  const N = getNotif();
  if (!N) return;

  await N.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
