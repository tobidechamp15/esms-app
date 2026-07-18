import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "@/store/authStore";
import { registerPushToken } from "@/lib/push";
import { PanicAlarmOverlay } from "@/components/security/PanicAlarmOverlay";
import { AnimatedSplash } from "@/components/AnimatedSplash";

SplashScreen.preventAutoHideAsync();

// Module-scoped: true only on a genuine cold start (resets when the JS context is destroyed).
let hasPlayedSplash = false;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [panicVisible, setPanicVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(!hasPlayedSplash);

  useEffect(() => {
    hydrate()
      .then(() => {
        if (useAuthStore.getState().tokens) registerPushToken();
      })
      .finally(() => SplashScreen.hideAsync());
  }, []);

  // Raise the full-screen alarm when a panic push arrives or is tapped.
  useEffect(() => {
    const isPanic = (n: any) =>
      n?.request?.content?.data?.type === "panic_alert";

    const recv = Notifications.addNotificationReceivedListener((n) => {
      if (isPanic(n)) setPanicVisible(true);
    });
    const resp = Notifications.addNotificationResponseReceivedListener((r) => {
      if (isPanic(r.notification)) setPanicVisible(true);
    });
    // Cold-start: app opened by tapping a panic push.
    Notifications.getLastNotificationResponseAsync().then((r) => {
      if (r && isPanic(r.notification)) setPanicVisible(true);
    });
    return () => {
      recv.remove();
      resp.remove();
    };
  }, []);

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {showSplash && (
          <AnimatedSplash
            onFinish={() => {
              hasPlayedSplash = true;
              setShowSplash(false);
            }}
          />
        )}
        <PanicAlarmOverlay
          visible={panicVisible}
          onAcknowledge={() => setPanicVisible(false)}
        />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: "none" }} />
          <Stack.Screen name="(app)" options={{ animation: "none" }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
