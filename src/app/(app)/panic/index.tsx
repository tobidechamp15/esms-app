import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

import { ChevronLeft } from "@/components/ui/Icons";
import { usePanic } from "@/hooks/useQueries";
import { PanicAlarmOverlay } from "@/components/security/PanicAlarmOverlay";
import { useAuthStore, selectIsSecurity } from "@/store/authStore";

const COUNTDOWN = 10;

export default function PanicScreen() {
  const router = useRouter();
  const panic = usePanic();
  const isSecurity = useAuthStore(selectIsSecurity);
  const isFocused = useIsFocused();

  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [fired, setFired] = useState(false);
  const firedRef = useRef(false);
  const pulse = useRef(new Animated.Value(1)).current;

  // Reset countdown state when screen gains focus
  useEffect(() => {
    if (isFocused) {
      setSeconds(COUNTDOWN);
      setFired(false);
      firedRef.current = false;
    }
  }, [isFocused]);

  // Pulsing ring animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Countdown — auto-fires at zero
  useEffect(() => {
    if (fired) return;
    if (seconds <= 0) {
      fire();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, fired]);

  async function fire() {
    if (firedRef.current) return;
    firedRef.current = true;
    setFired(true); // officer's own screen goes into the alarm state
    try {
      await panic.mutateAsync();
    } catch {
      /* surfaced via toast; alarm UI still shows */
    }
  }

  function cancel() {
    firedRef.current = true; // stop any pending fire
    if (isSecurity) {
      router.replace("/(app)/verify");
    } else {
      router.replace("/(app)/home");
    }
  }

  // After firing, the officer sees the same full-screen alarm; acknowledging returns home.
  if (fired) {
    return (
      <PanicAlarmOverlay
        visible
        title="EMERGENCY ALERT ACTIVE"
        body="You raised an emergency alert. All residents and officers have been notified."
        onAcknowledge={() => {
          setFired(false);
          router.replace(isSecurity ? "/(app)/verify" : "/(app)/home");
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#B91C1C" }} edges={["top"]}>
      <View className="px-5 pt-2">
        <Pressable onPress={cancel} hitSlop={12} className="p-2 -ml-2">
          <ChevronLeft size={22} color="#fff" />
        </Pressable>
      </View>

      <View className="items-center px-8 mt-2">
        <Text className="text-white text-2xl font-bold">Emergency Alert</Text>
        <Text className="text-white/80 text-sm text-center mt-2">
          Emergency alert will be sent to all residents automatically.
        </Text>
      </View>

      {/* Countdown ring */}
      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={{ transform: [{ scale: pulse }] }}
          className="w-64 h-64 rounded-full items-center justify-center"
        >
          <View className="w-56 h-56 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <View className="w-44 h-44 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <View className="w-36 h-36 rounded-full items-center justify-center bg-danger border border-white/30">
                <Text className="text-white text-5xl font-extrabold">{seconds}s</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <View className="px-6 pb-6 gap-3">
        <Pressable
          onPress={cancel}
          className="h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
        >
          <Text className="text-white text-base font-semibold">Cancel Alert</Text>
        </Pressable>
        <Pressable
          onPress={fire}
          className="h-14 rounded-2xl items-center justify-center bg-[#084BA3]"
        >
          <Text className="text-white text-base font-semibold">Skip Countdown</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
