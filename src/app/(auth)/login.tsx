import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { loginUser, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    try {
      await loginUser({ email: email.trim().toLowerCase(), password });
      // Navigation is handled by root _layout guard
    } catch (err) {
      Alert.alert('Login failed', (err as { message?: string }).message ?? 'Invalid credentials.');
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inner: { flexGrow: 1, paddingHorizontal: Spacing.four, justifyContent: 'center', paddingBottom: Spacing.six },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: '#3C9FFE',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.four,
      alignSelf: 'center',
    },
    logoText: { fontSize: 28, fontWeight: '800', color: '#fff' },
    heading: { marginBottom: Spacing.five, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: Spacing.one },
    subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center' },
    label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: Spacing.one, marginTop: Spacing.three },
    input: {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      fontSize: 16,
    },
    forgotRow: { alignItems: 'flex-end', marginTop: Spacing.one },
    forgotText: { fontSize: 13, color: '#3C9FFE', fontWeight: '600' },
    primaryBtn: {
      backgroundColor: '#3C9FFE',
      borderRadius: Spacing.two,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: Spacing.five,
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.four, gap: 4 },
    footerText: { fontSize: 14, color: theme.textSecondary },
    footerLink: { fontSize: 14, fontWeight: '600', color: '#3C9FFE' },
  });

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <Text style={s.logoText}>E</Text>
          </View>

          <View style={s.heading}>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to ESMS to continue</Text>
          </View>

          <Text style={s.label}>Email address</Text>
          <TextInput
            style={s.input}
            placeholder="john@example.com"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="Your password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <View style={s.forgotRow}>
            <Pressable>
              <Text style={s.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={[s.primaryBtn, isLoading && s.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}>
            <Text style={s.primaryBtnText}>{isLoading ? 'Signing in…' : 'Sign in'}</Text>
          </Pressable>

          <View style={s.footer}>
            <Text style={s.footerText}>Don&apos;t have an account?</Text>
            <Pressable onPress={() => router.replace('/(auth)/register')}>
              <Text style={s.footerLink}>Create one</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
