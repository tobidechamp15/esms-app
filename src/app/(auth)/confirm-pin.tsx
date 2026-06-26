import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button, NumPad, PinDots } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

const PIN_LENGTH = 4;

export default function ConfirmPinScreen() {
  const router = useRouter();
  const { pin: originalPin } = useLocalSearchParams<{ pin: string }>();
  const setupPin = useAuthStore((s) => s.setupPin);

  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const role = useAuthStore((s) => s.user?.role);

  function handleDigit(d: string) {
    if (confirm.length >= PIN_LENGTH) return;
    setConfirm((p) => p + d);
    setError("");
  }

  async function handleContinue() {
    if (confirm !== originalPin) {
      setError("PINs do not match. Try again.");
      setConfirm("");
      return;
    }
    setLoading(true);
    await setupPin(confirm);
    if (role === "security") {
      router.replace("/(app)/verify");
    } else {
      router.replace("/(app)/home");
    }
  }
  // useEffect(() => {
  //   if (role === "security") {
  //     router.replace("/(app)/verify");
  //   }
  // }, [role]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Create Account" />

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-1">Confirm PIN</Text>
        <Text className="text-sm text-muted mb-10">Re-enter your PIN</Text>
        <PinDots
          length={PIN_LENGTH}
          filled={confirm.length}
          error={Boolean(error)}
        />
        {error ? (
          <Text className="text-danger text-sm mt-4">{error}</Text>
        ) : null}
      </View>

      <View className="px-6 pb-6 gap-4">
        <Button
          label="Continue to Home"
          onPress={handleContinue}
          disabled={confirm.length < PIN_LENGTH}
          loading={loading}
        />
        <NumPad
          onPress={handleDigit}
          onDelete={() => setConfirm((p) => p.slice(0, -1))}
        />
      </View>
    </SafeAreaView>
  );
}
