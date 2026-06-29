import { useRouter } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ESTATE_NAME } from "@/constants/api";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-navy">
      <ImageBackground
        source={require("../../../assets/estate-bg.jpg")}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="flex-1 bg-navy/50">
          <SafeAreaView className="flex-1 justify-end pb-8 px-6">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-white mb-4">
                <Text className="text-primary-400">v</Text>entry
              </Text>
              <Text className="text-2xl font-bold text-white mb-3">
                Welcome to {ESTATE_NAME}
              </Text>
              <Text className="text-base text-white/70 leading-6">
                Choose how you'll be using Ventry to get started.
              </Text>
            </View>

            {/* Resident → estate PIN → create account / login */}
            <Pressable
              onPress={() => router.push("/(auth)/estate-pin")}
              className="h-16 bg-[#084BA3] rounded-2xl items-center justify-center mb-3"
            >
              <Text className="text-white text-base font-semibold">I'm a Resident</Text>
              <Text className="text-white/70 text-xs mt-0.5">
                Generate codes and manage your visitors
              </Text>
            </Pressable>

            {/* Security → activate flow (no estate PIN; activated by an officer) */}
            <Pressable
              onPress={() => router.push("/(auth)/activate")}
              className="h-16 rounded-2xl items-center justify-center border border-white/40"
            >
              <Text className="text-white text-base font-semibold">I'm Security</Text>
              <Text className="text-white/60 text-xs mt-0.5">
                Verify visitors and manage estate access
              </Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
