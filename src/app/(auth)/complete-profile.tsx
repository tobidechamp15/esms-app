import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getEstateStreets } from "@/api/auth";
import { getOtpToken } from "@/api/client";
import { BackHeader, Button } from "@/components/ui";
import { ChevronRight } from "@/components/ui/Icons";
import { useAuthStore } from "@/store/authStore";

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const registerUser = useAuthStore((s) => s.registerUser);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [showStreets, setShowStreets] = useState(false);
  const [error, setError] = useState("");

  const { data: streets = [] } = useQuery({
    queryKey: ["estate-streets"],
    queryFn: getEstateStreets,
  });

  const isValid = firstName && lastName && houseNumber && streetName;

  async function handleSubmit() {
    if (!isValid) return;
    setError("");
    try {
      const otpToken = await getOtpToken();
      if (!otpToken) throw new Error("Session expired. Please start again.");
      await registerUser(
        { firstName, lastName, houseNumber, streetName },
        otpToken,
      );
      router.push("/(auth)/create-pin");
    } catch (err) {
      setError((err as { message?: string }).message ?? "Registration failed.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader
        title="Create Account"
        onBack={() => router.push("/(auth)/phone")}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-8"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-2xl font-bold text-navy mb-1">
            Complete Your Profile
          </Text>
          <Text className="text-sm text-muted mb-8">
            Tell us a few details to set up your account in the estate.
          </Text>

          {/* First Name */}
          <Text className="text-sm font-medium text-navy mb-2">First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#9CA3AF"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          {/* Last Name */}
          <Text className="text-sm font-medium text-navy mb-2">Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#9CA3AF"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          {/* House Number */}
          <Text className="text-sm font-medium text-navy mb-2">
            House Number
          </Text>
          <TextInput
            value={houseNumber}
            onChangeText={setHouseNumber}
            placeholder="e.g. 12, 8b"
            placeholderTextColor="#9CA3AF"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          {/* Street Name dropdown */}
          <Text className="text-sm font-medium text-navy mb-2">
            Street Name
          </Text>
          <TouchableOpacity
            onPress={() => setShowStreets((s) => !s)}
            className="h-14 px-4 border border-border rounded-2xl flex-row items-center justify-between bg-surface mb-1"
          >
            <Text
              className={`text-base ${streetName ? "text-navy" : "text-gray-400"}`}
            >
              {streetName || "Select your street"}
            </Text>
            <ChevronRight size={18} />
          </TouchableOpacity>

          {showStreets && (
            <View className="border border-border rounded-2xl bg-white mb-4 overflow-hidden">
              {streets.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setStreetName(s);
                    setShowStreets(false);
                  }}
                  className="px-4 py-3 border-b border-border last:border-b-0"
                >
                  <Text className="text-base text-navy">{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {error ? (
            <Text className="text-danger text-sm mb-4">{error}</Text>
          ) : null}
          <View className="h-8" />
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            label="Create PIN"
            onPress={handleSubmit}
            disabled={!isValid}
            loading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
