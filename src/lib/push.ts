import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/constants/api";

/**
 * Ask permission, fetch this device's Expo push token, and register it with
 * the backend so the server can push to this user (e.g. visitor check-in alerts).
 * Safe to call repeatedly — it just refreshes the stored token.
 */
export async function registerPushToken(): Promise<void> {
  // Push is not delivered to simulators/emulators without a real device.
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return; // user declined — skip silently

  // Android needs a channel for heads-up delivery.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;
  if (!projectId) return; // no EAS project configured yet — nothing to register

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await apiClient.post(AUTH_ENDPOINTS.PUSH_TOKEN, { pushToken: token });
  } catch {
    // best-effort — never block app flow on push registration
  }
}
