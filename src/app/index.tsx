import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { STORAGE_KEYS } from "@/constants/api";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isPinSet = useAuthStore((s) => s.isPinSet);
  const isPinVerified = useAuthStore((s) => s.isPinVerified);

  const [estateVerified, setEstateVerified] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEYS.ESTATE_PIN_VERIFIED).then((val) => {
      setEstateVerified(val === "true");
    });
  }, []);

  // Still reading from SecureStore — render nothing to avoid flash
  if (estateVerified === null) return null;

  const isAuthenticated = Boolean(user && tokens);

  // 1. Estate PIN has never been entered — very first launch
  if (!estateVerified) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // 2. Estate known but no account session — returning unauthenticated user
  if (!isAuthenticated) {
    return <Redirect href={"/(auth)/estate-verified" as any} />;
  }

  // 3. Logged in but 4-digit PIN not yet entered this session
  if (isPinSet && !isPinVerified) {
    return <Redirect href="/(auth)/pin-lock" />;
  }

  // 4. Fully authenticated
  return <Redirect href="/(app)/home" />;
}
