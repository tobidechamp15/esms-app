import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHeader } from "@/components/ui";

// Phase 3 placeholder — full implementation coming in the next phase.
export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Activation Code" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-navy text-base font-semibold mb-1">Activation Code</Text>
        <Text className="text-muted text-sm text-center">
          This screen is coming in the next phase.
        </Text>
      </View>
    </SafeAreaView>
  );
}
