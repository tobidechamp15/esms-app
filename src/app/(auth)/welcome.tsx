import { useRouter } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ESTATE_NAME } from "@/constants/api";

export default function WelcomeScreen() {
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
                Manage visitors, generate access codes, and enjoy seamless entry
                into your estate.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/estate-pin")}
              className="h-14 bg-primary-500 rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">
                Enter Estate PIN
              </Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
