import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resetPin } from "@/api/auth";
import { BackHeader, Button } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";

export default function SecurityScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setupPin = useAuthStore((s) => s.setupPin);

  const [resetCode, setResetCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [repeatPin, setRepeatPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    if (newPin !== repeatPin) {
      setError("PINs do not match.");
      return;
    }
    if (!resetCode || newPin.length < 4) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPin(user!.phone, resetCode, newPin);
      await setupPin(newPin);
      router.push("/(app)/settings");
    } catch (err) {
      setError((err as { message?: string }).message ?? "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Security" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-navy mb-1">
            Reset Your PIN
          </Text>
          <Text className="text-sm text-muted mb-8">
            To reset your account PIN, please contact your estate administrator
            or security office in person. They will verify your identity and
            provide you with a one-time reset code.
          </Text>

          <Text className="text-sm font-medium text-navy mb-2">Enter Code</Text>
          <TextInput
            value={resetCode}
            onChangeText={(t) => setResetCode(t.replace(/\D/g, "").slice(0, 4))}
            placeholder="4-digit reset code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          <Text className="text-sm font-medium text-navy mb-2">New PIN</Text>
          <TextInput
            value={newPin}
            onChangeText={(t) => setNewPin(t.replace(/\D/g, "").slice(0, 4))}
            placeholder="4-digit new PIN"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            secureTextEntry
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          <Text className="text-sm font-medium text-navy mb-2">Repeat PIN</Text>
          <TextInput
            value={repeatPin}
            onChangeText={(t) => setRepeatPin(t.replace(/\D/g, "").slice(0, 4))}
            placeholder="Repeat PIN"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            secureTextEntry
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          {error ? <Text className="text-danger text-sm">{error}</Text> : null}
        </View>

        <View className="px-6 pb-6">
          <Button
            label="Reset PIN"
            onPress={handleReset}
            disabled={!resetCode || newPin.length < 4 || repeatPin.length < 4}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
