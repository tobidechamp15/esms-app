import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sendOtp, verifyOtp } from "@/api/auth";
import { getOtpToken } from "@/api/client";
import { BackHeader, Button, NumPad, PinDots } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

const PIN_LENGTH = 4;

type Step = "phone" | "otp" | "pin";

export default function LoginScreen() {
  const router = useRouter();
  const loginUser = useAuthStore((s) => s.loginUser);
  const verifyPin = useAuthStore((s) => s.verifyPin);
  const isPinSet = useAuthStore((s) => s.isPinSet);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — send OTP
  async function handleSendOtp() {
    setLoading(true);
    setError("");
    try {
      const formatted = phone.startsWith("+")
        ? phone
        : `+234${phone.replace(/^0/, "")}`;
      await sendOtp(formatted);
      setPhone(formatted);
      setStep("otp");
    } catch (err) {
      setError((err as { message?: string }).message ?? "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — verify OTP
  async function handleVerifyOtp() {
    setLoading(true);
    setError("");
    try {
      const result = await verifyOtp(phone, otp);
      if (!result.isExistingUser) {
        setError("No account found. Please create an account first.");
        return;
      }
      // OTP verified; if PIN is set on device, show PIN entry
      if (isPinSet) {
        setStep("pin");
      } else {
        // No PIN set on this device — log in, then force PIN creation
        const token = await getOtpToken();
        await loginUser(token!);
        router.replace("/(auth)/create-pin"); // ← was '/(app)/home'
      }
    } catch {
      setError("Invalid or expired OTP code.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 — verify device PIN
  async function handleVerifyPin(digit: string) {
    const next = pin + digit;
    setPin(next);
    if (next.length < PIN_LENGTH) return;

    const match = await verifyPin(next);
    if (match) {
      const token = await getOtpToken();
      await loginUser(token!);
      router.replace("/(app)/home");
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Log in to Account" />

      {step === "phone" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-bold text-navy mb-1">
              Welcome Back
            </Text>
            <Text className="text-sm text-muted mb-8">
              Enter your phone number and PIN to access your estate account.
            </Text>
            <Text className="text-sm font-medium text-navy mb-2">
              Phone Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                setError("");
              }}
              placeholder="+234 000 000 0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              autoFocus
              className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface"
            />
            {error ? (
              <Text className="text-danger text-sm mt-2">{error}</Text>
            ) : null}
          </View>
          <View className="px-6 pb-6 gap-3">
            <Button
              label="Continue"
              onPress={handleSendOtp}
              disabled={phone.length < 10}
              loading={loading}
            />
            <Text
              onPress={() => router.push("/(auth)/forgot-pin")}
              className="text-center text-sm text-primary-500 font-medium py-2"
            >
              Forgot PIN?
            </Text>
          </View>
        </KeyboardAvoidingView>
      )}

      {step === "otp" && (
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-navy mb-1">
            Verify Your Number
          </Text>
          <Text className="text-sm text-muted mb-10">
            Enter the 6-digit code sent to{" "}
            <Text className="text-primary-500 font-medium">{phone}</Text>
          </Text>
          <PinDots length={6} filled={otp.length} error={Boolean(error)} />
          {error ? (
            <Text className="text-danger text-sm mt-4">{error}</Text>
          ) : null}
          <View className="flex-1" />
          <View className="gap-4">
            <Button
              label="Verify Code"
              onPress={handleVerifyOtp}
              disabled={otp.length < 6}
              loading={loading}
            />
            <NumPad
              onPress={(d) => {
                if (otp.length < 6) {
                  setOtp((p) => p + d);
                  setError("");
                }
              }}
              onDelete={() => setOtp((p) => p.slice(0, -1))}
            />
          </View>
        </View>
      )}

      {step === "pin" && (
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-navy mb-1">
            Welcome Back
          </Text>
          <Text className="text-sm text-muted mb-10">
            Enter your 4-digit account PIN.
          </Text>
          <PinDots
            length={PIN_LENGTH}
            filled={pin.length}
            error={Boolean(error)}
          />
          {error ? (
            <Text className="text-danger text-sm mt-4">{error}</Text>
          ) : null}
          <View className="flex-1" />
          <NumPad
            onPress={handleVerifyPin}
            onDelete={() => {
              setPin((p) => p.slice(0, -1));
              setError("");
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
