import { useEffect, useRef } from "react";
import { Modal, Text, Vibration, View } from "react-native";
import { useAudioPlayer } from "expo-audio";

import { HoldButton } from "./HoldButton";

// Drop a looping siren file at assets/alarm.mp3 (royalty-free).
// Optional require so the app still runs before the asset is added.
let alarmSource: number | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarmSource = require("../../../assets/alarm.mp3");
} catch {
  alarmSource = null;
}

const VIBRATION_PATTERN = [0, 600, 400, 600, 400];

interface PanicAlarmOverlayProps {
  visible: boolean;
  title?: string;
  body?: string;
  onAcknowledge: () => void;
}

export function PanicAlarmOverlay({
  visible,
  title = "EMERGENCY ALERT",
  body = "Estate security has raised an emergency alert. Stay alert and follow instructions.",
  onAcknowledge,
}: PanicAlarmOverlayProps) {
  // Holds the imperative audio player instance, if sound is available.
  const playerRef = useRef<{
    play?: () => void;
    pause?: () => void;
    remove?: () => void;
    loop?: boolean;
  } | null>(null);
  const active = useRef(false);

  useEffect(() => {
    if (visible && !active.current) {
      active.current = true;
      Vibration.vibrate(VIBRATION_PATTERN, true);
      startSound();
    }
    if (!visible && active.current) {
      stopAll();
    }
    return () => {
      if (active.current) stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function startSound() {
    if (!alarmSource) return; // no asset yet → silent alarm (vibration + visual)
    // Imperative + guarded: a mismatched/broken expo-audio native module
    // must never crash the app — it just degrades to a silent alarm.
    try {
      // Lazy require so a broken module can't break this file at import time.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createAudioPlayer } = require("expo-audio");
      const player = createAudioPlayer(alarmSource);
      player.loop = true;
      player.play();
      playerRef.current = player;
    } catch {
      playerRef.current = null;
    }
  }

  function stopAll() {
    active.current = false;
    Vibration.cancel();
    try {
      playerRef.current?.pause?.();
      playerRef.current?.remove?.();
    } catch {}
    playerRef.current = null;
  }

  function handleAck() {
    stopAll();
    onAcknowledge();
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => {}}>
      <View className="flex-1 bg-danger items-center justify-center px-8">
        <Text className="text-white text-7xl mb-6">⚠️</Text>
        <Text className="text-white text-3xl font-extrabold text-center mb-3">
          {title}
        </Text>
        <Text className="text-white/90 text-base text-center mb-16">
          {body}
        </Text>

        <View className="w-full">
          <HoldButton
            label="Hold to Acknowledge"
            holdingLabel="Keep holding…"
            durationMs={1500}
            color="#7F1D1D"
            onComplete={handleAck}
          />
          <Text className="text-white/70 text-xs text-center mt-3">
            Press and hold to confirm you've seen this alert.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
