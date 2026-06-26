// lib/notify.ts
import * as Notifications from "expo-notifications";

export async function notify(title: string, body: string) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") return; // user declined; skip silently
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // fire now
  });
}
