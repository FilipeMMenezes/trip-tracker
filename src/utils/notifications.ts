import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Routine, DepartureRecommendation } from '../types/routine';

const NOTIFICATION_PREFIX = 'routine-';

function getNotificationId(routineId: string): string {
  return `${NOTIFICATION_PREFIX}${routineId}`;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('commute', {
      name: 'Commute Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDepartureReminder(
  routine: Routine,
  recommendation: DepartureRecommendation
): Promise<void> {
  if (!recommendation.unlocked) return;

  // Cancel previous notification for this routine (idempotent)
  await cancelRoutineNotification(routine.id);

  const [h, m] = recommendation.suggestedDepartureTime.split(':').map(Number);

  // Fire 15 minutes before the recommended departure time
  let notifyTotalMinutes = h * 60 + m - 15;
  if (notifyTotalMinutes < 0) notifyTotalMinutes += 24 * 60;

  const notifyHour = Math.floor(notifyTotalMinutes / 60) % 24;
  const notifyMinute = notifyTotalMinutes % 60;

  const displayTime = formatHHMMForDisplay(recommendation.suggestedDepartureTime);

  await Notifications.scheduleNotificationAsync({
    identifier: getNotificationId(routine.id),
    content: {
      title: 'Trip Tracker — Commute Reminder',
      body: `Leave in 15 min for ${routine.name} — leave by ${displayTime} to arrive on time`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: notifyHour,
      minute: notifyMinute,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
}

export async function cancelRoutineNotification(routineId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(getNotificationId(routineId));
  } catch {
    // notification may not exist — safe to ignore
  }
}

// "08:15" → "8:15 AM"
function formatHHMMForDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}
