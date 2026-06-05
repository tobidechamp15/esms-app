import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Polls a callback at a given interval, but only while the app is in the
 * foreground. Pauses when backgrounded to conserve battery.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const savedCallback = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    function start() {
      timerRef.current = setInterval(() => {
        savedCallback.current();
      }, intervalMs);
    }

    function stop() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    start();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        stop();
        savedCallback.current(); // immediate refresh on foreground
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
    };
  }, [intervalMs, enabled]);
}
