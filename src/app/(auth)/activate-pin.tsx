import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button, NumPad, PinDots } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

const PIN_LENGTH = 4;

export default function ActivatePinScreen() {
  const router = useRouter();
  const { phone, code } = useLocalSearchParams<{
    phone: string;
    code: string;
  }>();
  const activateOfficer = useAuthStore((s) => s.activateOfficer);

  const [step, setStep] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleDigit(d: string) {
    if (pin.length >= PIN_LENGTH || loading) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => advance(next), 120);
    }
  }

  async function advance(value: string) {
    setError("");
    if (step === "create") {
      setFirstPin(value);
      setPin("");
      setStep("confirm");
      return;
    }
    // confirm step
    if (value !== firstPin) {
      setError("PINs do not match. Start again.");
      setPin("");
      setFirstPin("");
      setStep("create");
      return;
    }
    try {
      setLoading(true);
      await activateOfficer(phone!, code!, value);
      // Officers never go through the resident "Complete Profile" (which asks for
      // house number / street). Their name comes from the activation-code step;
      // if it's blank they can set it in Settings → Account Information.
      router.replace("/(app)/verify" as any);
    } catch (err) {
      setError((err as { message?: string }).message ?? "Activation failed.");
      setLoading(false);
      setPin("");
      setFirstPin("");
      setStep("create");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Create New PIN" />

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-1">
          {step === "create" ? "Create Your PIN" : "Confirm Your PIN"}
        </Text>
        <Text className="text-sm text-muted mb-10">
          {step === "create"
            ? "Choose a 4-digit PIN you'll use to access Ventry."
            : "Re-enter your 4-digit PIN to confirm."}
        </Text>

        <PinDots
          length={PIN_LENGTH}
          filled={pin.length}
          error={Boolean(error)}
        />
        {error ? (
          <Text className="text-danger text-sm mt-3">{error}</Text>
        ) : null}

        {loading && (
          <View className="flex-row items-center mt-6">
            <ActivityIndicator color="#1B4FD8" />
            <Text className="text-muted text-sm ml-3">
              Activating your account…
            </Text>
          </View>
        )}
      </View>

      <View className="px-6 pb-6 gap-4">
        <NumPad
          onPress={handleDigit}
          onDelete={() => setPin((p) => p.slice(0, -1))}
        />
      </View>
    </SafeAreaView>
  );
}
