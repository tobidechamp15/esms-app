import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button, NumPad, PinDots } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import {
  getBiometricStatus,
  getBiometricPromptMessage,
} from "@/utils/biometricAuth";
import type { BiometricType } from "@/utils/biometricAuth";

const PIN_LENGTH = 4;

export default function ActivatePinScreen() {
  const router = useRouter();
  const { phone, code } = useLocalSearchParams<{
    phone: string;
    code: string;
  }>();
  const activateOfficer = useAuthStore((s) => s.activateOfficer);
  const enableBiometrics = useAuthStore((s) => s.enableBiometrics);

  const [step, setStep] = useState<"create" | "confirm" | "biometric">(
    "create",
  );
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Biometric opt-in state
  const [biometricType, setBiometricType] = useState<BiometricType | null>(
    null,
  );
  const [biometricEnabling, setBiometricEnabling] = useState(false);

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

    if (step === "confirm") {
      // Confirm step — check PINs match
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

        // Check biometric availability for opt-in
        const status = await getBiometricStatus();
        if (status.isAvailable) {
          setBiometricType(status.biometryType);
          setStep("biometric");
          setLoading(false);
        } else {
          // No biometrics, go directly to app
          router.replace("/(app)/verify" as any);
        }
      } catch (err) {
        setError((err as { message?: string }).message ?? "Activation failed.");
        setLoading(false);
        setPin("");
        setFirstPin("");
        setStep("create");
      }
      return;
    }
  }

  async function handleEnableBiometrics() {
    setBiometricEnabling(true);
    await enableBiometrics();
    setBiometricEnabling(false);
    router.replace("/(app)/verify" as any);
  }

  function handleSkipBiometrics() {
    router.replace("/(app)/verify" as any);
  }

  // Biometric opt-in screen
  if (step === "biometric") {
    const typeLabel =
      biometricType === "face"
        ? "Face ID"
        : biometricType === "fingerprint"
          ? "Fingerprint"
          : biometricType === "iris"
            ? "Iris Scan"
            : "Biometrics";

    return (
      <SafeAreaView className="flex-1 bg-white">
        <BackHeader title="Create New PIN" />

        <View className="flex-1 px-6 pt-8 justify-center">
          <Text className="text-2xl font-bold text-navy mb-1 text-center">
            Unlock with {typeLabel}
          </Text>
          <Text className="text-sm text-muted mb-8 text-center">
            {getBiometricPromptMessage()}
            {"\n\n"}
            You can unlock Ventry faster using your device's {typeLabel} instead
            of typing your PIN each time.
          </Text>

          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-primary-500/10 items-center justify-center">
              <Text className="text-3xl">
                {biometricType === "face" ? "😊" : "👆"}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-6 gap-3">
          <Button
            label={`Enable ${typeLabel}`}
            onPress={handleEnableBiometrics}
            loading={biometricEnabling}
          />
          <Pressable
            onPress={handleSkipBiometrics}
            className="h-14 rounded-2xl items-center justify-center"
          >
            <Text className="text-muted font-medium">Skip for now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Normal PIN create/confirm UI
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
