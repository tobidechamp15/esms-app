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
import type { UserRole } from '@/types';

const ROLES: { label: string; value: Extract<UserRole, 'resident' | 'security'> }[] = [
  { label: 'Resident', value: 'resident' },
  { label: 'Security Officer', value: 'security' },
];

export default function RegisterScreen() {
  const theme = useTheme();
  const { registerUser, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'resident' as Extract<UserRole, 'resident' | 'security'>,
    unitNumber: '',
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    const { name, email, password, confirmPassword, phone, role, unitNumber } = form;

    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (role === 'resident' && !unitNumber.trim()) {
      Alert.alert('Unit number required', 'Please enter your unit number.');
      return;
    }

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
        unitNumber: role === 'resident' ? unitNumber.trim() : undefined,
      });
      router.replace('/(auth)/pin-setup');
    } catch {
      // Error surfaced by store
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inner: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: Spacing.six },
    heading: { marginBottom: Spacing.five },
    title: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: Spacing.one },
    subtitle: { fontSize: 15, color: theme.textSecondary },
    label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: Spacing.one, marginTop: Spacing.three },
    input: {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      fontSize: 16,
    },
    roleRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
    roleBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: Spacing.two,
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
    },
    roleBtnActive: { backgroundColor: '#3C9FFE' },
    roleBtnText: { fontSize: 14, fontWeight: '600', color: theme.textSecondary },
    roleBtnTextActive: { color: '#fff' },
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
          <View style={s.heading}>
            <Text style={s.title}>Create account</Text>
            <Text style={s.subtitle}>Join ESMS to manage estate visits</Text>
          </View>

          <Text style={s.label}>Full name *</Text>
          <TextInput
            style={s.input}
            placeholder="John Doe"
            placeholderTextColor={theme.textSecondary}
            value={form.name}
            onChangeText={(v) => update('name', v)}
            autoCapitalize="words"
            autoComplete="name"
          />

          <Text style={s.label}>Email address *</Text>
          <TextInput
            style={s.input}
            placeholder="john@example.com"
            placeholderTextColor={theme.textSecondary}
            value={form.email}
            onChangeText={(v) => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={s.label}>Phone number *</Text>
          <TextInput
            style={s.input}
            placeholder="+1 234 567 8900"
            placeholderTextColor={theme.textSecondary}
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Text style={s.label}>Password *</Text>
          <TextInput
            style={s.input}
            placeholder="Min. 8 characters"
            placeholderTextColor={theme.textSecondary}
            value={form.password}
            onChangeText={(v) => update('password', v)}
            secureTextEntry
            autoComplete="new-password"
          />

          <Text style={s.label}>Confirm password *</Text>
          <TextInput
            style={s.input}
            placeholder="Repeat password"
            placeholderTextColor={theme.textSecondary}
            value={form.confirmPassword}
            onChangeText={(v) => update('confirmPassword', v)}
            secureTextEntry
            autoComplete="new-password"
          />

          <Text style={s.label}>Account type *</Text>
          <View style={s.roleRow}>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                style={[s.roleBtn, form.role === r.value && s.roleBtnActive]}
                onPress={() => update('role', r.value)}>
                <Text style={[s.roleBtnText, form.role === r.value && s.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {form.role === 'resident' && (
            <>
              <Text style={s.label}>Unit / House number *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. A12 or Block 3 Flat 2"
                placeholderTextColor={theme.textSecondary}
                value={form.unitNumber}
                onChangeText={(v) => update('unitNumber', v)}
                autoCapitalize="characters"
              />
            </>
          )}

          <Pressable
            style={[s.primaryBtn, isLoading && s.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}>
            <Text style={s.primaryBtnText}>{isLoading ? 'Creating account…' : 'Create account'}</Text>
          </Pressable>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account?</Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={s.footerLink}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
