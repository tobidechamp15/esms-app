import { Stack } from "expo-router";
import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

export default function AuthLayout() {
  // Prevent screen recording on all auth screens to protect PINs and personal data
  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen name="estate-pin" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="confirm-pin" />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="pin-lock"
        options={{ animation: "fade", gestureEnabled: false }}
      />
      <Stack.Screen
        name="estate-verified"
        options={{ animation: "fade", gestureEnabled: false }}
      />
      <Stack.Screen name="forgot-pin" />
    </Stack>
  );
}
