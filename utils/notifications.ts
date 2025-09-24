import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }) as any,
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    // @ts-ignore sdk returns object in newer versions as { data }
    const value: string | undefined = (token as any)?.data || (token as any);
    return value || null;
  } catch {
    return null;
  }
}

export async function notifyNow(title: string, body?: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // fire immediately
    });
  } catch {}
}


