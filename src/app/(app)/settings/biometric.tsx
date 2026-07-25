import { useState, useEffect } from "react";
import { Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader } from "@/components/ui";
import { useAuthStore, selectIsBiometricsEnabled } from "@/store/authStore";
import { getBiometricStatus } from "@/utils/biometricAuth";

export default function BiometricSettingsScreen() {
  const isBiometricsEnabled = useAuthStore(selectIsBiometricsEnabled);
  const enableBiometrics = useAuthStore((s) => s.enableBiometrics);
  const disableBiometrics = useAuthStore((s) => s.disableBiometrics);

  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    getBiometricStatus().then((status) => {
      if (status.isAvailable) {
        setBiometricAvailable(true);
        if (status.biometryType === "face") {
          setBiometricLabel("Face ID");
        } else if (status.biometryType === "fingerprint") {
          setBiometricLabel("Fingerprint");
        } else if (status.biometryType === "iris") {
          setBiometricLabel("Iris Scan");
        }
      }
    });
  }, []);

  async function handleToggle(value: boolean) {
    if (value) {
      await enableBiometrics();
    } else {
      await disableBiometrics();
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <BackHeader title="Biometrics" />

      <View className="mx-6 mt-6">
        {biometricAvailable ? (
          <View className="bg-white rounded-2xl border border-border overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-1 mr-4">
                <Text className="text-base font-semibold text-navy">
                  {biometricLabel}
                </Text>
                <Text className="text-xs text-muted mt-0.5">
                  Use {biometricLabel.toLowerCase()} to unlock Ventry instead of
                  typing your PIN.
                </Text>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleToggle}
                trackColor={{ true: "#1B4FD8" }}
              />
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl border border-border px-4 py-6 items-center">
            <Text className="text-base text-muted text-center">
              Biometrics are not available on this device.
            </Text>
            <Text className="text-xs text-muted mt-2 text-center">
              Make sure you have Face ID or a fingerprint set up in your device
              settings.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
