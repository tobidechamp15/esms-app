import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QrCode } from "@/components/ui/Icons";
import { useVerifyCode } from "@/hooks/useQueries";
import { useAuthStore } from "@/store/authStore";
import { ESTATE_NAME } from "@/constants/api";

export default function VerifyHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const verify = useVerifyCode();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  })();

  async function handleVerify() {
    if (code.length < 4) return;
    setError("");
    try {
      const result = await verify.mutateAsync({
        accessCode: code,
        action: "check_in",
      });
      router.push({
        pathname: "/(app)/verify/result",
        params: { visitId: result.visit.id, status: result.visit.status },
      });
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Could not verify this code.",
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="px-6 pt-6">
        <Text className="text-2xl font-bold text-navy">
          {greeting}, {user?.firstName || "Officer"} ☀
        </Text>
        <Text className="text-sm text-muted mt-1">{ESTATE_NAME}</Text>
      </View>

      <View className="px-6 mt-8">
        <View className="bg-white border border-border rounded-3xl p-6">
          <View className="w-12 h-12 rounded-2xl bg-primary-50 items-center justify-center mb-4">
            <QrCode size={24} color="#1B4FD8" />
          </View>
          <Text className="text-lg font-bold text-navy mb-1">
            Verify Access Code
          </Text>
          <Text className="text-sm text-muted mb-5">
            Enter a visitor code or scan QR to verify access.
          </Text>

          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter access code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-3 tracking-[6px] text-center"
          />

          {error ? (
            <Text className="text-danger text-sm mb-2">{error}</Text>
          ) : null}

          <Pressable
            onPress={handleVerify}
            disabled={code.length < 4 || verify.isPending}
            className={`h-14 rounded-2xl items-center justify-center mb-3 ${
              code.length < 4 || verify.isPending
                ? "bg-primary-200"
                : "bg-[#084BA3]"
            }`}
          >
            {verify.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Verify Code
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/verify/scan")}
            className="h-14 rounded-2xl items-center justify-center border border-border"
          >
            <Text className="text-navy text-base font-semibold">
              Scan QR Code
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
