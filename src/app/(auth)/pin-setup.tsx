import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PINPad } from '@/components/ui/PINPad';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type Step = 'create' | 'confirm';

export default function PinSetupScreen() {
  const theme = useTheme();
  const { setupPin } = useAuthStore();
  const [step, setStep] = useState<Step>('create');
  const [firstPin, setFirstPin] = useState('');

  async function handlePinComplete(pin: string) {
    if (step === 'create') {
      setFirstPin(pin);
      setStep('confirm');
      return;
    }

    // Confirm step
    if (pin !== firstPin) {
      Alert.alert('PIN mismatch', 'The PINs you entered do not match. Please try again.');
      setStep('create');
      setFirstPin('');
      return;
    }

    await setupPin(pin);
    router.replace('/(app)/dashboard');
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
    title: { fontSize: 26, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: Spacing.one },
    subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: Spacing.six },
    stepIndicator: { flexDirection: 'row', gap: 8, marginBottom: Spacing.five },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.backgroundElement },
    dotActive: { backgroundColor: '#3C9FFE' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        <View style={s.stepIndicator}>
          <View style={[s.dot, s.dotActive]} />
          <View style={[s.dot, step === 'confirm' && s.dotActive]} />
        </View>

        <Text style={s.title}>
          {step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
        </Text>
        <Text style={s.subtitle}>
          {step === 'create'
            ? 'Set a 6-digit PIN to secure your account'
            : 'Enter the same PIN to confirm'}
        </Text>

        <PINPad onComplete={handlePinComplete} key={step} />
      </View>
    </SafeAreaView>
  );
}
