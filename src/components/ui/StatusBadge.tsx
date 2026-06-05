import { StyleSheet, Text, View } from 'react-native';
import type { VisitStatus } from '@/types';

const STATUS_CONFIG: Record<
  VisitStatus,
  { label: string; bg: string; text: string; emoji: string }
> = {
  scheduled: { label: 'Scheduled', bg: '#FFF3CD', text: '#856404', emoji: '🕐' },
  checked_in: { label: 'Active', bg: '#D1FAE5', text: '#065F46', emoji: '🟢' },
  checked_out: { label: 'Completed', bg: '#E0E7FF', text: '#3730A3', emoji: '✅' },
  cancelled: { label: 'Cancelled', bg: '#FFE4E6', text: '#9F1239', emoji: '❌' },
  expired: { label: 'Expired', bg: '#F1F5F9', text: '#64748B', emoji: '⏱️' },
};

interface StatusBadgeProps {
  status: VisitStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.emoji, isSmall && styles.emojiSm]}>{cfg.emoji}</Text>
      <Text style={[styles.text, { color: cfg.text }, isSmall && styles.textSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 3 },
  emoji: { fontSize: 12 },
  emojiSm: { fontSize: 10 },
  text: { fontSize: 13, fontWeight: '600' },
  textSm: { fontSize: 11, fontWeight: '600' },
});
