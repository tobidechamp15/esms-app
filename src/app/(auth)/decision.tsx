import { useRouter } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { ESTATE_NAME } from "@/constants/api";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../../assets/estate-bg.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.75)"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 justify-end px-6 pb-8">
          {/* Logo + Headline */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-white mb-4">
              <Text className="text-primary-400">v</Text>entry
            </Text>

            <Text className="text-2xl font-bold text-white mb-3">
              Welcome to {ESTATE_NAME}
            </Text>

            <Text className="text-base text-white leading-6">
              Manage visitors, generate access codes, and enjoy seamless entry
              into your estate.
            </Text>
          </View>

          {/* Primary CTA */}
          {/* <Pressable
            onPress={() => router.push("/(auth)/estate-pin")}
            className="h-14 bg-primary-500 rounded-2xl items-center justify-center mb-4"
          >
            <Text className="text-white text-base font-semibold">
              Enter Estate PIN
            </Text>
          </Pressable> */}

          {/* Secondary Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="flex-1 h-14 bg-white/10 border border-white/20 rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">Login</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(auth)/estate-pin")}
              className="flex-1 h-14 bg-primary-500 rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base font-semibold">
                Create Account
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}
