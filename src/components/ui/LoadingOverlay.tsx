import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface LoadingOverlayProps {
  message?: string;
  visible?: boolean;
}

export function LoadingOverlay({ message, visible = true }: LoadingOverlayProps) {
  const theme = useTheme();
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <ActivityIndicator size="large" color="#3C9FFE" />
        {message && (
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 120,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
