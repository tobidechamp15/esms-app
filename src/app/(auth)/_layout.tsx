import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="estate-pin" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="confirm-pin" />
      <Stack.Screen name="login" />
      <Stack.Screen name="pin-lock" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="forgot-pin" />
    </Stack>
  );
}
