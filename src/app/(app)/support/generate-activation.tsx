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
import { CodeRevealModal } from "@/components/security/CodeRevealModal";
import { useGenerateActivationCode } from "@/hooks/useQueries";
import type { GeneratedCode } from "@/api/security";

export default function GenerateActivationScreen() {
  const router = useRouter();
  const generate = useGenerateActivationCode();

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [codeModal, setCodeModal] = useState<GeneratedCode | null>(null);

  const isValid = /^(?:\+234|234|0)[789]\d{9}$/.test(phone.trim());

  async function handleGenerate() {
    setError("");
    try {
      const result = await generate.mutateAsync({
        phone: phone.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setCodeModal(result);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ??
          "Could not generate activation code.",
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Add Security Officer" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <Text className="text-2xl font-bold text-navy mb-1">
            New Security Officer
          </Text>
          <Text className="text-sm text-muted mb-8">
            Generate a one-time activation code. The new officer enters it in
            the app to set their PIN. The code expires in 5 minutes.
          </Text>

          <Text className="text-sm font-medium text-navy mb-2">
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+234 000 000 0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            autoCapitalize="none"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          <Text className="text-sm font-medium text-navy mb-2">
            First Name (optional)
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#9CA3AF"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          <Text className="text-sm font-medium text-navy mb-2">
            Last Name (optional)
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#9CA3AF"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          {error ? <Text className="text-danger text-sm">{error}</Text> : null}
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            label="Generate Activation Code"
            onPress={handleGenerate}
            disabled={!isValid}
            loading={generate.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      <CodeRevealModal
        visible={Boolean(codeModal)}
        title="Activation Code"
        subtitle={`Share this code with the new officer for ${codeModal?.phone ?? ""} in person. Shown once.`}
        code={codeModal?.code}
        expiresAt={codeModal?.expiresAt}
        onClose={() => {
          setCodeModal(null);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
