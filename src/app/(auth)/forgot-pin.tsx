import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resetPin } from '@/api/auth';
import { BackHeader, Button, NumPad, PinDots } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const PIN_LENGTH = 4;
type Step = 'form' | 'newPin' | 'confirmPin';

export default function ForgotPinScreen() {
  const router = useRouter();
  const setupPin = useAuthStore((s) => s.setupPin);

  const [step, setStep] = useState<Step>('form');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmP, setConfirmP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (!phone || resetCode.length < PIN_LENGTH || newPin !== confirmP) {
      setError('Please check your entries.');
      return;
    }
    setLoading(true); setError('');
    try {
      await resetPin(phone.startsWith('+') ? phone : `+234${phone.replace(/^0/, '')}`, resetCode, newPin);
      await setupPin(newPin);
      router.replace('/(app)/home');
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Reset failed. Check your code.');
    } finally { setLoading(false); }
  }

  return (
<SafeAreaView className="flex-1 bg-white">
  <BackHeader title="Forgot PIN" />
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    className="flex-1"
  >
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      // iOS: auto-insets + auto-scrolls the focused input into view
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
    >
      <Text className="text-2xl font-bold text-navy mb-1">Reset Your PIN</Text>
      <Text className="text-sm text-muted mb-8">
        To reset your account PIN, please contact your estate administrator or
        security office in person. They will verify your identity and provide you
        with a one-time reset code.
      </Text>

      <Text className="text-sm font-medium text-navy mb-2">Phone Number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+234 000 000 0000"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
      />

      <Text className="text-sm font-medium text-navy mb-2">Enter Code</Text>
      <TextInput
        value={resetCode}
        onChangeText={(t) => setResetCode(t.replace(/\D/g, '').slice(0, 4))}
        placeholder="4-digit reset code"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
      />

      <Text className="text-sm font-medium text-navy mb-2">New PIN</Text>
      <TextInput
        value={newPin}
        onChangeText={(t) => setNewPin(t.replace(/\D/g, '').slice(0, 4))}
        placeholder="4-digit new PIN"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        secureTextEntry
        className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
      />

      <Text className="text-sm font-medium text-navy mb-2">Repeat PIN</Text>
      <TextInput
        value={confirmP}
        onChangeText={(t) => setConfirmP(t.replace(/\D/g, '').slice(0, 4))}
        placeholder="Repeat PIN"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        secureTextEntry
        className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
      />

      {error ? <Text className="text-danger text-sm">{error}</Text> : null}
    </ScrollView>

    <View className="px-6 pb-2">
      <Button
        label="Reset PIN"
        onPress={handleReset}
        disabled={!phone || resetCode.length < 4 || newPin.length < 4 || confirmP.length < 4}
        loading={loading}
      />
    </View>
  </KeyboardAvoidingView>
</SafeAreaView>
  );
}
