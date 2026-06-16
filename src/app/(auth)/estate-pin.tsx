import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { verifyEstatePin } from "@/api/auth";
import { BackHeader, Button, NumPad, PinDots } from "@/components/ui";

const PIN_LENGTH = 6;

export default function EstatePinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleDigit(d: string) {
    if (pin.length >= PIN_LENGTH) return;
    setPin((p) => p + d);
    setError("");
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
    setError("");
  }

  async function handleConfirm() {
    if (pin.length < PIN_LENGTH) return;
    setLoading(true);
    try {
      await verifyEstatePin(pin);
      // Estate PIN verified — proceed to phone registration
      router.push("/(auth)/decision");
    } catch {
      setError("Invalid estate PIN. Confirm youre using the correct app.");
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Estate PIN" />

      <View className="flex-1 px-6 pt-8 ">
        <Text className="text-2xl font-bold text-navy mb-1">
          Type in your 6-digit PIN!
        </Text>
        <Text
          className={`text-sm mb-10 ${error ? "text-danger" : "text-muted"}`}
        >
          {error || "Enter the PIN provided by your estate management."}
        </Text>

        <PinDots
          length={PIN_LENGTH}
          filled={pin.length}
          error={Boolean(error)}
        />
      </View>

      <View className="px-6 pb-6 gap-4">
        <Button
          label="Confirm Estate PIN"
          onPress={handleConfirm}
          disabled={pin.length < PIN_LENGTH}
          loading={loading}
        />
        <NumPad onPress={handleDigit} onDelete={handleDelete} />
      </View>
    </SafeAreaView>
  );
}
