import DateTimePicker from '@react-native-community/datetimepicker';
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

import { useVisitStore } from '@/store/visitStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { VisitPurpose } from '@/types';

const PURPOSES: { label: string; value: VisitPurpose; emoji: string }[] = [
  { label: 'Personal', value: 'personal', emoji: '👤' },
  { label: 'Delivery', value: 'delivery', emoji: '📦' },
  { label: 'Maintenance', value: 'maintenance', emoji: '🔧' },
  { label: 'Official', value: 'official', emoji: '🏛️' },
  { label: 'Other', value: 'other', emoji: '📝' },
];

export default function CreateVisitScreen() {
  const theme = useTheme();
  const { createNewVisit, isLoading } = useVisitStore();

  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [purpose, setPurpose] = useState<VisitPurpose>('personal');
  const [purposeNote, setPurposeNote] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30, 0, 0);
    return d;
  });
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4, 0, 0, 0);
    return d;
  });
  const [showScheduledPicker, setShowScheduledPicker] = useState(false);
  const [showExpiresPicker, setShowExpiresPicker] = useState(false);

  async function handleSubmit() {
    if (!visitorName.trim() || !visitorPhone.trim()) {
      Alert.alert('Required fields', 'Visitor name and phone are required.');
      return;
    }
    if (expiresAt <= scheduledAt) {
      Alert.alert('Invalid times', 'Expiry must be after scheduled arrival.');
      return;
    }

    try {
      const visit = await createNewVisit({
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim(),
        visitorVehiclePlate: vehiclePlate.trim() || undefined,
        visitorIdentificationNumber: idNumber.trim() || undefined,
        purpose,
        purposeNote: purposeNote.trim() || undefined,
        scheduledAt: scheduledAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
      router.replace(`/(app)/visits/${visit.id}`);
    } catch {
      // Surfaced by store
    }
  }

  const formatDate = (d: Date) =>
    d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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
    backBtn: { paddingRight: Spacing.two },
    backText: { fontSize: 16, color: '#3C9FFE', fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
    inner: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },
    label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: Spacing.one, marginTop: Spacing.three },
    input: {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      fontSize: 16,
    },
    purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
    purposeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
    },
    purposeBtnActive: { backgroundColor: '#3C9FFE' },
    purposeEmoji: { fontSize: 16 },
    purposeText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
    purposeTextActive: { color: '#fff' },
    dateBtn: {
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 14,
    },
    dateBtnText: { fontSize: 15, color: theme.text, fontWeight: '500' },
    sectionDivider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.backgroundElement, marginTop: Spacing.four, marginBottom: Spacing.one },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginTop: Spacing.three, marginBottom: Spacing.one },
    submitBtn: {
      backgroundColor: '#3C9FFE',
      borderRadius: Spacing.two,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: Spacing.five,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Invite Visitor</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
          <Text style={s.sectionTitle}>Visitor Details</Text>

          <Text style={s.label}>Full name *</Text>
          <TextInput
            style={s.input}
            placeholder="Visitor's full name"
            placeholderTextColor={theme.textSecondary}
            value={visitorName}
            onChangeText={setVisitorName}
            autoCapitalize="words"
          />

          <Text style={s.label}>Phone number *</Text>
          <TextInput
            style={s.input}
            placeholder="+1 234 567 8900"
            placeholderTextColor={theme.textSecondary}
            value={visitorPhone}
            onChangeText={setVisitorPhone}
            keyboardType="phone-pad"
          />

          <Text style={s.label}>Vehicle plate (optional)</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. ABC 1234"
            placeholderTextColor={theme.textSecondary}
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            autoCapitalize="characters"
          />

          <Text style={s.label}>ID / Passport number (optional)</Text>
          <TextInput
            style={s.input}
            placeholder="National ID or passport"
            placeholderTextColor={theme.textSecondary}
            value={idNumber}
            onChangeText={setIdNumber}
          />

          <View style={s.sectionDivider} />
          <Text style={s.sectionTitle}>Visit Purpose</Text>

          <View style={s.purposeGrid}>
            {PURPOSES.map((p) => (
              <Pressable
                key={p.value}
                style={[s.purposeBtn, purpose === p.value && s.purposeBtnActive]}
                onPress={() => setPurpose(p.value)}>
                <Text style={s.purposeEmoji}>{p.emoji}</Text>
                <Text style={[s.purposeText, purpose === p.value && s.purposeTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>Additional notes (optional)</Text>
          <TextInput
            style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Any extra info for the gate…"
            placeholderTextColor={theme.textSecondary}
            value={purposeNote}
            onChangeText={setPurposeNote}
            multiline
            numberOfLines={3}
          />

          <View style={s.sectionDivider} />
          <Text style={s.sectionTitle}>Schedule</Text>

          <Text style={s.label}>Expected arrival</Text>
          <Pressable style={s.dateBtn} onPress={() => setShowScheduledPicker(true)}>
            <Text style={s.dateBtnText}>{formatDate(scheduledAt)}</Text>
          </Pressable>
          {showScheduledPicker && (
            <DateTimePicker
              value={scheduledAt}
              mode="datetime"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowScheduledPicker(false);
                if (date) setScheduledAt(date);
              }}
            />
          )}

          <Text style={s.label}>QR code expires at</Text>
          <Pressable style={s.dateBtn} onPress={() => setShowExpiresPicker(true)}>
            <Text style={s.dateBtnText}>{formatDate(expiresAt)}</Text>
          </Pressable>
          {showExpiresPicker && (
            <DateTimePicker
              value={expiresAt}
              mode="datetime"
              minimumDate={scheduledAt}
              onChange={(_, date) => {
                setShowExpiresPicker(false);
                if (date) setExpiresAt(date);
              }}
            />
          )}

          <Pressable
            style={[s.submitBtn, isLoading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            <Text style={s.submitBtnText}>{isLoading ? 'Creating invite…' : 'Send Invite'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
