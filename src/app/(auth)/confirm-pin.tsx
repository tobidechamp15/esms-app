import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button, NumPad, PinDots } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import {
  getBiometricStatus,
  getBiometricPromptMessage,
} from "@/utils/biometricAuth";
import type { BiometricType } from "@/utils/biometricAuth";

const PIN_LENGTH = 4;

export default function ConfirmPinScreen() {
  const router = useRouter();
  const { pin: originalPin } = useLocalSearchParams<{ pin: string }>();
  const setupPin = useAuthStore((s) => s.setupPin);
  const enableBiometrics = useAuthStore((s) => s.enableBiometrics);

  const [step, setStep] = useState<"confirm" | "biometric">("confirm");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const role = useAuthStore((s) => s.user?.role);

  // Biometric opt-in state
  const [biometricType, setBiometricType] = useState<BiometricType | null>(
    null,
  );
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabling, setBiometricEnabling] = useState(false);

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

    // Check if biometrics are available — show opt-in prompt
    const status = await getBiometricStatus();
    if (status.isAvailable) {
      setBiometricType(status.biometryType);
      setBiometricAvailable(true);
      setStep("biometric");
      setLoading(false);
    } else {
      // No biometrics available, proceed directly
      if (role === "security") {
        router.replace("/(app)/verify");
      } else {
        router.replace("/(app)/home");
      }
    }
  }

  async function handleEnableBiometrics() {
    setBiometricEnabling(true);
    await enableBiometrics();
    setBiometricEnabling(false);
    if (role === "security") {
      router.replace("/(app)/verify");
    } else {
      router.replace("/(app)/home");
    }
  }

  function handleSkipBiometrics() {
    if (role === "security") {
      router.replace("/(app)/verify");
    } else {
      router.replace("/(app)/home");
    }
  }

  // Biometric opt-in UI
  if (step === "biometric" && biometricAvailable) {
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
        <BackHeader title="Create Account" />

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

          {error ? (
            <Text className="text-danger text-sm mb-4 text-center">
              {error}
            </Text>
          ) : null}
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

  // Normal PIN confirm UI
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
