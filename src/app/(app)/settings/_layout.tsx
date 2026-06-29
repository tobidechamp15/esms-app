import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account" />
      <Stack.Screen name="security" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="report" />
      <Stack.Screen name="announce" />
      <Stack.Screen name="report-concern" />
    </Stack>
  );
}
