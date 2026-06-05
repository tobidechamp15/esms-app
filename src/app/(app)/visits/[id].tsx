import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QRDisplay } from '@/components/ui/QRDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/store/authStore';
import { useVisitStore } from '@/store/visitStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function DetailRow({ label, value }: { label: string; value?: string }) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[detailStyles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 14, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { currentVisit, isLoading, fetchVisitById, cancelVisitById } = useVisitStore();

  useEffect(() => {
    if (id) fetchVisitById(id);
  }, [id]);

  const visit = currentVisit?.id === id ? currentVisit : null;

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  async function handleShare() {
    if (!visit) return;
    await Share.share({
      message: `Your visit pass for ${visit.resident?.unitNumber ?? 'the estate'} has been approved.\n\nVisitor: ${visit.visitor.name}\nScheduled: ${formatDate(visit.scheduledAt)}\n\nPlease show the QR code in the ESMS app at the gate.`,
      title: 'ESMS Visit Pass',
    });
  }

  async function handleCancel() {
    if (!visit) return;
    Alert.alert('Cancel visit?', 'This will revoke the visitor\'s QR code.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelVisitById(visit.id);
          } catch {
            Alert.alert('Error', 'Failed to cancel visit. Please try again.');
          }
        },
      },
    ]);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      gap: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
    },
    backText: { fontSize: 16, color: '#3C9FFE', fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 },
    content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },
    card: { backgroundColor: theme.backgroundElement, borderRadius: Spacing.two, padding: Spacing.three, marginBottom: Spacing.three },
    cardTitle: { fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: Spacing.two, textTransform: 'uppercase', letterSpacing: 0.5 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.backgroundSelected },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
    visitorName: { fontSize: 22, fontWeight: '700', color: theme.text },
    qrSection: { alignItems: 'center', marginVertical: Spacing.four },
    shareBtn: {
      flexDirection: 'row',
      backgroundColor: '#3C9FFE',
      borderRadius: Spacing.two,
      paddingVertical: 14,
      paddingHorizontal: Spacing.four,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.one,
      marginBottom: Spacing.two,
    },
    shareBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    cancelBtn: {
      borderRadius: Spacing.two,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
    },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#FF453A' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });

  if (isLoading && !visit) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingContainer}>
          <ActivityIndicator color="#3C9FFE" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!visit) return null;

  const canCancel =
    (visit.status === 'scheduled' || visit.status === 'checked_in') &&
    (user?.role === 'admin' || visit.residentId === user?.id);

  const showQR = visit.status === 'scheduled' || visit.status === 'checked_in';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Visit Details</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Status + name */}
        <View style={s.statusRow}>
          <Text style={s.visitorName}>{visit.visitor.name}</Text>
          <StatusBadge status={visit.status} />
        </View>

        {/* QR Code */}
        {showQR && (
          <View style={s.qrSection}>
            <QRDisplay value={visit.qrCode} expiresAt={visit.expiresAt} />
          </View>
        )}

        {/* Visitor info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Visitor Info</Text>
          <DetailRow label="Phone" value={visit.visitor.phone} />
          <View style={s.divider} />
          <DetailRow label="Vehicle plate" value={visit.visitor.vehiclePlate} />
          <View style={s.divider} />
          <DetailRow label="ID number" value={visit.visitor.identificationNumber} />
        </View>

        {/* Visit info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Visit Info</Text>
          <DetailRow label="Purpose" value={visit.purpose.charAt(0).toUpperCase() + visit.purpose.slice(1)} />
          {visit.purposeNote && (
            <>
              <View style={s.divider} />
              <DetailRow label="Notes" value={visit.purposeNote} />
            </>
          )}
          <View style={s.divider} />
          <DetailRow label="Scheduled" value={formatDate(visit.scheduledAt)} />
          <View style={s.divider} />
          <DetailRow label="Expires" value={formatDate(visit.expiresAt)} />
          {visit.checkedInAt && (
            <>
              <View style={s.divider} />
              <DetailRow label="Checked in" value={formatDate(visit.checkedInAt)} />
            </>
          )}
          {visit.checkedOutAt && (
            <>
              <View style={s.divider} />
              <DetailRow label="Checked out" value={formatDate(visit.checkedOutAt)} />
            </>
          )}
        </View>

        {/* Resident info (security view) */}
        {visit.resident && user?.role !== 'resident' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Host Resident</Text>
            <DetailRow label="Name" value={visit.resident.name} />
            <View style={s.divider} />
            <DetailRow label="Unit" value={visit.resident.unitNumber} />
          </View>
        )}

        {/* Actions */}
        {showQR && (
          <Pressable style={s.shareBtn} onPress={handleShare}>
            <Text style={s.shareBtnText}>Share Visit Pass</Text>
          </Pressable>
        )}

        {canCancel && (
          <Pressable style={s.cancelBtn} onPress={handleCancel}>
            <Text style={s.cancelBtnText}>Cancel Visit</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
