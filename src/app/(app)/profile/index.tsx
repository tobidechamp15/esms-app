import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function SettingsRow({
  label,
  value,
  onPress,
  destructive,
  disabled,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundSelected },
        pressed && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={[styles.rowLabel, { color: destructive ? '#FF453A' : theme.text }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text>
      )}
      {onPress && !value && (
        <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
      )}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundElement }]}>
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, isPinSet, setupPin, logoutUser } = useAuthStore();

  function handleChangePIN() {
    Alert.alert(
      'Change PIN',
      'You will be asked to set a new 6-digit PIN.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/(auth)/pin-setup') },
      ],
    );
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logoutUser() },
    ]);
  }

  const ROLE_LABELS: Record<string, string> = {
    resident: 'Resident',
    security: 'Security Officer',
    admin: 'Administrator',
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending Approval',
    active: 'Active',
    suspended: 'Suspended',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar header */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: '#3C9FFE' }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Account info */}
        <Section title="ACCOUNT">
          <SettingsRow label="Role" value={ROLE_LABELS[user?.role ?? ''] ?? user?.role} />
          <SettingsRow label="Status" value={STATUS_LABELS[user?.status ?? ''] ?? user?.status} />
          {user?.unitNumber && (
            <SettingsRow label="Unit" value={user.unitNumber} />
          )}
          <SettingsRow label="Phone" value={user?.phone} />
        </Section>

        {/* Security */}
        <Section title="SECURITY">
          <SettingsRow
            label={isPinSet ? 'Change PIN' : 'Set up PIN'}
            onPress={handleChangePIN}
          />
        </Section>

        {/* Danger zone */}
        <Section title="SESSION">
          <SettingsRow label="Sign out" onPress={handleSignOut} destructive />
        </Section>

        <Text style={[styles.version, { color: theme.textSecondary }]}>
          ESMS v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: Spacing.six },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.five },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 14, fontWeight: '500' },
  section: { marginBottom: Spacing.three, paddingHorizontal: Spacing.four },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.one },
  sectionCard: { borderRadius: Spacing.two, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressed: { opacity: 0.6 },
  rowDisabled: { opacity: 0.4 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '500' },
  chevron: { fontSize: 20, fontWeight: '300' },
  version: { textAlign: 'center', fontSize: 12, marginTop: Spacing.three },
});
