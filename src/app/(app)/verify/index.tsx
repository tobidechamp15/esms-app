import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrCode, X } from "@/components/ui/Icons";
import { useVerifyCode, usePanic } from "@/hooks/useQueries";
import { useAuthStore } from "@/store/authStore";
import { ESTATE_NAME } from "@/constants/api";

const CODE_LENGTH = 5;
const PANIC_HOLD_MS = 1200;

export default function VerifyHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const verify = useVerifyCode();
  const panic = usePanic();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [panicSent, setPanicSent] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  })();

  // ── Panic: press-and-hold the megaphone (kept deliberate to avoid misfires) ──
  const panicProgress = useRef(new Animated.Value(0)).current;
  function panicStart() {
    Animated.timing(panicProgress, {
      toValue: 1,
      duration: PANIC_HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        panicProgress.setValue(0);
        handlePanic();
      }
    });
  }
  function panicCancel() {
    Animated.timing(panicProgress, { toValue: 0, duration: 120, useNativeDriver: false }).start();
  }
  async function handlePanic() {
    try {
      await panic.mutateAsync();
      setPanicSent(true);
      setTimeout(() => setPanicSent(false), 4000);
    } catch {
      /* surfaced via toast */
    }
  }

  async function handleVerify() {
    if (code.length < 4) return;
    setError("");
    try {
      const result = await verify.mutateAsync({ accessCode: code, action: "check_in" });
      router.push({
        pathname: "/(app)/verify/result",
        params: {
          ok: "1",
          action: "check_in",
          visitorName: result.visit.visitorName,
          residentName: (result.visit as any).residentName,
          houseNumber: (result.visit as any).houseNumber,
          streetName: (result.visit as any).streetName,
          status: result.visit.status,
          message: result.message,
        },
      });
    } catch (err) {
      setError((err as { message?: string }).message ?? "Could not verify this code.");
    }
  }

  const cells = Array.from({ length: CODE_LENGTH });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Profile setup banner ── */}
      {showBanner && (
        <View className="flex-row items-center justify-between px-6 py-3 bg-surface border-b border-border">
          <Text className="text-xs text-muted flex-1">
            Please set up your{" "}
            <Text
              className="text-navy font-semibold underline"
              onPress={() => router.push("/(auth)/complete-profile")}
            >
              profile
            </Text>{" "}
            so we can know you better!
          </Text>
          <Pressable onPress={() => setShowBanner(false)} hitSlop={10} className="ml-3">
            <X size={16} color="#9CA3AF" />
          </Pressable>
        </View>
      )}

      {/* ── Header: greeting + red panic megaphone ── */}
      <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-border">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-bold text-navy">
            {greeting}, {user?.firstName || "Officer"} ☀️
          </Text>
          <Text className="text-sm text-muted mt-1">{ESTATE_NAME}</Text>
        </View>

        {/* Press-and-hold megaphone */}
        <Pressable onPressIn={panicStart} onPressOut={panicCancel} hitSlop={8}>
          <View className="w-14 h-14 rounded-full bg-danger items-center justify-center overflow-hidden shadow">
            <Animated.View
              style={{
                position: "absolute",
                left: 0, right: 0, bottom: 0,
                height: panicProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                backgroundColor: "rgba(0,0,0,0.25)",
              }}
            />
            <Text className="text-2xl">📢</Text>
          </View>
        </Pressable>
      </View>

      {panicSent ? (
        <Text className="text-green-600 text-xs text-center mt-2 px-6">
          Emergency alert sent to residents and officers.
        </Text>
      ) : null}

      {/* ── Verify card ── */}
      <View className="px-6 mt-6">
        <View className="bg-white border border-border rounded-3xl p-6">
          <Text className="text-lg font-bold text-navy mb-1">Verify Access Code</Text>
          <Text className="text-sm text-muted mb-6">
            Enter a visitor code or scan QR to verify access.
          </Text>

          {/* 5 underline cells (tapping focuses the hidden input) */}
          <Pressable onPress={() => inputRef.current?.focus()} className="mb-6">
            <View className="flex-row justify-between">
              {cells.map((_, i) => (
                <View key={i} className="items-center" style={{ width: 48 }}>
                  <Text className="text-2xl font-bold text-navy h-9">
                    {code[i] ?? ""}
                  </Text>
                  <View
                    className="h-[2px] w-full"
                    style={{ backgroundColor: i < code.length ? "#1B4FD8" : "#E5E7EB" }}
                  />
                </View>
              ))}
            </View>
            {/* hidden input that actually captures digits */}
            <TextInput
              ref={inputRef}
              value={code}
              maxLength={CODE_LENGTH}
              onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, CODE_LENGTH))}
              keyboardType="number-pad"
              autoFocus
              style={{ position: "absolute", opacity: 0, height: 1, width: 1 }}
            />
          </Pressable>

          {error ? <Text className="text-danger text-sm mb-3 text-center">{error}</Text> : null}

          <Pressable
            onPress={handleVerify}
            disabled={code.length < 4 || verify.isPending}
            className={`h-14 rounded-2xl items-center justify-center mb-3 ${
              code.length < 4 || verify.isPending ? "bg-primary-200" : "bg-[#084BA3]"
            }`}
          >
            {verify.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Verify Code</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/verify/scan")}
            className="h-14 rounded-2xl items-center justify-center border border-border flex-row gap-2"
          >
            <QrCode size={18} color="#1B2A4A" />
            <Text className="text-navy text-base font-semibold">Scan QR Code</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
