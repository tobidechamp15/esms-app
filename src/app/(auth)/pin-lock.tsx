import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NumPad, PinDots } from "@/components/ui";
import { useAuthStore, selectIsBiometricsEnabled } from "@/store/authStore";
import {
  authenticateWithBiometrics,
  hasBiometricsEnrolled,
} from "@/utils/biometricAuth";

const PIN_LENGTH = 4;

export default function PinLockScreen() {
  const router = useRouter();
  const verifyPin = useAuthStore((s) => s.verifyPin);
  const logoutUser = useAuthStore((s) => s.logoutUser);
  const isBiometricsEnabled = useAuthStore(selectIsBiometricsEnabled);

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  // Check if biometrics are available on mount
  useEffect(() => {
    hasBiometricsEnrolled().then(setBiometricsAvailable);
  }, []);

  // Attempt biometric authentication on mount ONLY if user has opted in
  useEffect(() => {
    if (biometricsAvailable && isBiometricsEnabled) {
      handleBiometricAuth();
    }
  }, [biometricsAvailable, isBiometricsEnabled]);

  async function handleBiometricAuth() {
    const result = await authenticateWithBiometrics();
    if (result.success) {
      router.replace("/(app)/home");
    }
    // Silently fall back to PIN if biometrics fail
  }

  async function handleDigit(d: string) {
    const next = pin + d;
    setPin(next);
    if (next.length < PIN_LENGTH) return;

    const match = await verifyPin(next);
    if (match) {
      router.replace("/(app)/home");
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 items-start">
        <Text className="text-3xl font-bold text-navy mb-1">
          <Text className="text-primary-500">v</Text>entry
        </Text>
        <Text className="text-2xl font-bold text-navy mt-8 mb-1">
          Welcome Back
        </Text>
        <Text
          className={`text-sm mb-10 ${error ? "text-danger" : "text-muted"}`}
        >
          {error || "Enter your 4-digit PIN or use biometrics to continue."}
        </Text>
        <PinDots
          length={PIN_LENGTH}
          filled={pin.length}
          error={Boolean(error)}
        />
      </View>

      <View className="px-6 pb-8 gap-4">
        {biometricsAvailable && isBiometricsEnabled && (
          <Text
            onPress={handleBiometricAuth}
            className="text-center text-sm text-primary-500 font-medium py-2"
          >
            Use Face ID / Fingerprint instead
          </Text>
        )}
        <Text
          onPress={logoutUser}
          className="text-center text-sm text-primary-500 font-medium py-2"
        >
          Log out instead
        </Text>
        <NumPad
          onPress={handleDigit}
          onDelete={() => {
            setPin((p) => p.slice(0, -1));
            setError("");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
