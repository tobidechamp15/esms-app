import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import { getEstateInfo } from "@/api/auth";
import { ESTATE_NAME, STORAGE_KEYS } from "@/constants/api";
import type { EstateInfo } from "@/types";

export default function EstateVerifiedScreen() {
  const router = useRouter();
  const [estate, setEstate] = useState<EstateInfo | null>(null);

  useEffect(() => {
    getEstateInfo()
      .then(setEstate)
      .catch(() => {});
  }, []);

  const estateName = estate?.estateName ?? ESTATE_NAME;

  return (
    <View className="flex-1 bg-navy">
      <ImageBackground
        source={require("../../../assets/estate-bg.jpg")}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="flex-1 bg-navy/50">
          {/* // Inside your component, add this row at the bottom before logout: */}
          {__DEV__ && (
            <Pressable
              onPress={async () => {
                await SecureStore.deleteItemAsync(
                  STORAGE_KEYS.ESTATE_PIN_VERIFIED,
                );
                router.replace("/(auth)/welcome");
              }}
              className="px-6 py-4 border-b border-border bg-white mt-[120px]"
            >
              <Text className="text-orange-500 font-medium">
                [DEV] Reset Estate PIN
              </Text>
            </Pressable>
          )}
          <SafeAreaView className="flex-1 justify-end pb-8 px-6">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-white mb-4">
                <Text className="text-primary-400">v</Text>entry
              </Text>
              <Text className="text-2xl font-bold text-white mb-3">
                Welcome to {estateName}
              </Text>
              <Text className="text-base text-white/70 leading-6">
                Manage visitors, generate access codes, and enjoy seamless entry
                into your estate.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <View
                onTouchEnd={() => router.push("/(auth)/login")}
                className="flex-1 h-14 bg-white/10 border border-white/20 rounded-2xl items-center justify-center"
              >
                <Text className="text-white text-base font-semibold">
                  Login
                </Text>
              </View>
              <View
                onTouchEnd={() => router.push("/(auth)/phone")}
                className="flex-1 h-14 bg-[#084BA3] rounded-2xl items-center justify-center"
              >
                <Text className="text-white text-base font-semibold">
                  Create Account
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
