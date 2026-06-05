import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuthStore } from '@/store/authStore';

/**
 * Clears PIN verification when the app is backgrounded for more than
 * PIN_LOCK_TIMEOUT_MS. This ensures the PIN screen is shown on return,
 * meeting App Store / Play Store security guidelines.
 */
const PIN_LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function usePinAutoLock() {
  const { isPinSet, isPinVerified, clearPinVerified } = useAuthStore();
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!isPinSet) return;

    function handleChange(nextState: AppStateStatus) {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAt.current = Date.now();
      } else if (nextState === 'active') {
        const elapsed = backgroundedAt.current
          ? Date.now() - backgroundedAt.current
          : Infinity;
        if (elapsed >= PIN_LOCK_TIMEOUT_MS && isPinVerified) {
          clearPinVerified();
        }
        backgroundedAt.current = null;
      }
    }

    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [isPinSet, isPinVerified, clearPinVerified]);
}
