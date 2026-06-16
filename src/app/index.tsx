import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const isPinSet = useAuthStore((s) => s.isPinSet);
  const isPinVerified = useAuthStore((s) => s.isPinVerified);

  const isAuthenticated = Boolean(user && tokens);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isPinSet && !isPinVerified) {
    return <Redirect href="/(auth)/pin-lock" />;
  }

  return <Redirect href="/(app)/home" />;
}
