import {
  DarkTheme,
  DefaultTheme,
  Redirect,
  Slot,
  ThemeProvider,
} from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePinAutoLock } from "@/hooks/use-pin-auto-lock";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { hydrate, user, tokens, isPinSet, isPinVerified, isLoading } =
    useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  usePinAutoLock();

  // Block render until SecureStore hydration completes (avoids flash)
  if (isLoading) return null;

  const isAuthenticated = Boolean(user && tokens);
  const needsPinUnlock = isAuthenticated && isPinSet && !isPinVerified;
  const needsPinSetup =
    isAuthenticated && !isPinSet && user?.status === "active";
  const isPending = isAuthenticated && user?.status === "pending";
  const canEnterApp =
    isAuthenticated &&
    (!isPinSet || isPinVerified) &&
    user?.status === "active";

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
      {/* {!isAuthenticated && <Redirect href="/(auth)/login" />}
      {needsPinUnlock && <Redirect href="/(auth)/pin-unlock" />}
      {needsPinSetup && <Redirect href="/(auth)/pin-setup" />}
      {isPending && <Redirect href="/(auth)/pending-approval" />}
      {canEnterApp && <Redirect href="/(app)/dashboard" />} */}

      {!isAuthenticated && <Redirect href="/(auth)/login" />}
      {needsPinUnlock && <Redirect href="/(auth)/pin-unlock" />}
      {needsPinSetup && <Redirect href="/(auth)/pin-setup" />}
      {isPending && <Redirect href="/(auth)/pending-approval" />}
    </ThemeProvider>
  );
}
