import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from './StatusBadge';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { Visit } from '@/types';

const PURPOSE_EMOJI: Record<string, string> = {
  personal: '👤',
  delivery: '📦',
  maintenance: '🔧',
  official: '🏛️',
  other: '📝',
};

interface VisitCardProps {
  visit: Visit;
  onPress?: () => void;
}

export function VisitCard({ visit, onPress }: VisitCardProps) {
  const theme = useTheme();

  const scheduledDate = new Date(visit.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      {/* Left: purpose icon */}
      <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSelected }]}>
        <Text style={styles.purposeEmoji}>
          {PURPOSE_EMOJI[visit.purpose] ?? '📝'}
        </Text>
      </View>

      {/* Center: info */}
      <View style={styles.info}>
        <Text style={[styles.visitorName, { color: theme.text }]} numberOfLines={1}>
          {visit.visitor.name}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
          {formattedDate} · {formattedTime}
        </Text>
        {visit.visitor.vehiclePlate && (
          <Text style={[styles.plate, { color: theme.textSecondary }]}>
            🚗 {visit.visitor.vehiclePlate}
          </Text>
        )}
        {visit.resident?.unitNumber && (
          <Text style={[styles.unit, { color: theme.textSecondary }]}>
            🏠 Unit {visit.resident.unitNumber}
          </Text>
        )}
      </View>

      {/* Right: status */}
      <StatusBadge status={visit.status} size="sm" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  pressed: { opacity: 0.75 },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  purposeEmoji: { fontSize: 20 },
  info: { flex: 1 },
  visitorName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  meta: { fontSize: 13, fontWeight: '500', marginBottom: 1 },
  plate: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  unit: { fontSize: 12, fontWeight: '500', marginTop: 1 },
});
