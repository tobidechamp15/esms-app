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

import { BackHeader, Button } from "@/components/ui";

export default function ActivateScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const isValid = /^\+[1-9]\d{6,14}$/.test(phone.trim()) && code.length === 4;

  function handleContinue() {
    router.push({
      pathname: "/(auth)/activate-pin",
      params: { phone: phone.trim(), code },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <BackHeader title="Activate Account" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <Text className="text-2xl font-bold text-navy mb-1">Activate Your Account</Text>
          <Text className="text-sm text-muted mb-8">
            Enter the temporary activation code provided by your estate
            administrator or another security officer. This code can only be
            used once and expires in 5 minutes.
          </Text>

          <Text className="text-sm font-medium text-navy mb-2">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+234 000 000 0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            autoCapitalize="none"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          <Text className="text-sm font-medium text-navy mb-2">Activation Code</Text>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 4))}
            placeholder="4-digit code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface tracking-[6px] text-center"
          />
        </ScrollView>

        <View className="px-6 pb-6">
          <Button label="Continue" onPress={handleContinue} disabled={!isValid} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
