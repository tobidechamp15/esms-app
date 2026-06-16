import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader, Button, NumPad, PinDots } from '@/components/ui';

const PIN_LENGTH = 4;

export default function CreatePinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');

  function handleDigit(d: string) {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      // Auto-advance to confirm step
      setTimeout(() => {
        router.push({ pathname: '/(auth)/confirm-pin', params: { pin: next } });
        setPin('');
      }, 120);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Create Account" />

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-1">
          Create Account PIN
        </Text>
        <Text className="text-sm text-muted mb-10">
          Create a 4 digit PIN you'll use to access your account.
        </Text>
        <PinDots length={PIN_LENGTH} filled={pin.length} />
      </View>

      <View className="px-6 pb-6 gap-4">
        <Button
          label="Confirm PIN"
          onPress={() => {}}
          disabled={pin.length < PIN_LENGTH}
        />
        <NumPad onPress={handleDigit} onDelete={() => setPin((p) => p.slice(0, -1))} />
      </View>
    </SafeAreaView>
  );
}
