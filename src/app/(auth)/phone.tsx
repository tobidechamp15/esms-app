import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sendOtp } from "@/api/auth";
import { BackHeader, Button } from "@/components/ui";

export default function PhoneScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = phone.replace(/\s/g, "").length >= 10;

  async function handleSendOtp() {
    if (!isValid) return;
    setLoading(true);
    setError("");
    try {
      const formatted = phone.startsWith("+")
        ? phone
        : `+234${phone.replace(/^0/, "")}`;
      const code = await sendOtp(formatted);
      router.push({
        pathname: "/(auth)/otp",
        params: { phone: formatted, code: code ?? "" },
      });
    } catch (err) {
      setError(
        (err as { message?: string }).message ??
          "Failed to send OTP. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Create Account" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-navy mb-1">
            Create your Ventry Account
          </Text>
          <Text className="text-sm text-muted mb-8">
            Enter your phone number to receive a verification code.
          </Text>

          <Text className="text-sm font-medium text-navy mb-2">
            Phone Number
          </Text>
          <TextInput
            ref={inputRef}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setError("");
            }}
            placeholder="Enter your phone number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            autoFocus
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface"
          />
          {error ? (
            <Text className="text-danger text-sm mt-2">{error}</Text>
          ) : null}
        </View>

        <View className="px-6 pb-6">
          <Button
            label="Send OTP"
            onPress={handleSendOtp}
            disabled={!isValid}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
