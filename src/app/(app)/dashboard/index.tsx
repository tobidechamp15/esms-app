import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VisitCard } from '@/components/ui/VisitCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useVisitStore } from '@/store/visitStore';
import { usePolling } from '@/hooks/use-polling';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { user, logoutUser } = useAuthStore();
  const { visits, isLoading, fetchVisits, fetchAllVisits } = useVisitStore();

  const isSecurityOrAdmin = user?.role === 'security' || user?.role === 'admin';

  const load = () =>
    isSecurityOrAdmin ? fetchAllVisits({ limit: 10 }) : fetchVisits({ limit: 10 });

  useEffect(() => {
    load();
  }, []);

  // Auto-refresh every 60 s while app is foregrounded
  usePolling(load, 60_000);

  const scheduled = visits.filter((v) => v.status === 'scheduled').length;
  const checkedIn = visits.filter((v) => v.status === 'checked_in').length;
  const today = visits.filter((v) => {
    const d = new Date(v.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const recentVisits = visits.slice(0, 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {isSecurityOrAdmin ? 'Control Panel' : 'Good day,'}
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.name?.split(' ')[0] ?? 'User'} 👋
            </Text>
          </View>
          <Pressable onPress={() => logoutUser()} style={[styles.signOutBtn, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.signOutText, { color: theme.textSecondary }]}>Sign out</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Today" value={today} color="#3C9FFE" />
          <StatCard label="Scheduled" value={scheduled} color="#FF9F0A" />
          <StatCard label="Active" value={checkedIn} color="#32D74B" />
        </View>

        {/* Quick action — only for residents */}
        {!isSecurityOrAdmin && (
          <Pressable
            style={styles.inviteBtn}
            onPress={() => router.push('/(app)/visits/create')}>
            <Text style={styles.inviteBtnText}>+ Invite a Visitor</Text>
          </Pressable>
        )}

        {/* Scanner shortcut for security */}
        {isSecurityOrAdmin && (
          <Pressable
            style={[styles.inviteBtn, { backgroundColor: '#32D74B' }]}
            onPress={() => router.push('/(app)/scanner')}>
            <Text style={styles.inviteBtnText}>📷 Scan Visitor QR</Text>
          </Pressable>
        )}

        {/* Recent visits */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Visits</Text>
          <Pressable onPress={() => router.push('/(app)/visits')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {isLoading && !visits.length ? (
          <ActivityIndicator color="#3C9FFE" style={{ marginTop: Spacing.four }} />
        ) : recentVisits.length === 0 ? (
          <EmptyState
            emoji="🏠"
            title="No visits yet"
            subtitle={isSecurityOrAdmin ? 'No visits have been logged today.' : 'Invite your first visitor to get started.'}
          />
        ) : (
          recentVisits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onPress={() => router.push(`/(app)/visits/${visit.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.four },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 24, fontWeight: '700' },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  signOutText: { fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.four },
  statCard: { flex: 1, borderRadius: Spacing.two, paddingVertical: Spacing.three, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  inviteBtn: {
    backgroundColor: '#3C9FFE',
    borderRadius: Spacing.two,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  inviteBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, color: '#3C9FFE', fontWeight: '600' },
});
