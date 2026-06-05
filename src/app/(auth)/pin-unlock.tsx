import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PINPad } from '@/components/ui/PINPad';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const MAX_ATTEMPTS = 5;

export default function PinUnlockScreen() {
  const theme = useTheme();
  const { verifyPin, logoutUser, user } = useAuthStore();
  const [attempts, setAttempts] = useState(0);

  async function handlePinComplete(pin: string) {
    const match = await verifyPin(pin);

    if (match) {
      router.replace('/(app)/dashboard');
      return;
    }

    const next = attempts + 1;
    setAttempts(next);

    if (next >= MAX_ATTEMPTS) {
      Alert.alert(
        'Too many attempts',
        'You have exceeded the maximum PIN attempts. Please log in again.',
        [{ text: 'OK', onPress: () => logoutUser() }],
      );
    } else {
      Alert.alert('Incorrect PIN', `${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`);
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#3C9FFE',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.three,
    },
    avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
    title: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: Spacing.one, textAlign: 'center' },
    subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: Spacing.six },
    signOutLink: { marginTop: Spacing.five },
    signOutText: { fontSize: 14, color: '#3C9FFE', fontWeight: '600', textAlign: 'center' },
  });

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>

        <Text style={s.title}>Welcome back, {user?.name?.split(' ')[0]}!</Text>
        <Text style={s.subtitle}>Enter your PIN to continue</Text>

        <PINPad onComplete={handlePinComplete} key={attempts} />

        <Pressable style={s.signOutLink} onPress={() => logoutUser()}>
          <Text style={s.signOutText}>Sign in with different account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
