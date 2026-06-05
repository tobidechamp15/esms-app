import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { QR_EXPIRY_BUFFER_MS as BUFFER } from '@/constants/api';

interface QRDisplayProps {
  value: string;
  expiresAt: string; // ISO date string
  size?: number;
}

function useCountdown(expiresAt: string) {
  const expiry = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() => expiry - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = expiry - Date.now();
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  return remaining;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return 'Expired';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function QRDisplay({ value, expiresAt, size = 220 }: QRDisplayProps) {
  const theme = useTheme();
  const remaining = useCountdown(expiresAt);

  const isExpired = remaining <= 0;
  const isWarning = !isExpired && remaining <= BUFFER;

  const statusColor = isExpired ? '#FF453A' : isWarning ? '#FF9F0A' : '#32D74B';

  return (
    <View style={styles.wrapper}>
      {/* QR card */}
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {isExpired ? (
          <View style={[styles.expiredOverlay, { width: size, height: size }]}>
            <Text style={styles.expiredEmoji}>⏱️</Text>
            <Text style={styles.expiredText}>QR Code Expired</Text>
          </View>
        ) : (
          <View style={[styles.qrWrapper, { padding: 16, backgroundColor: '#fff', borderRadius: 12 }]}>
            <QRCode
              value={value}
              size={size}
              color="#000"
              backgroundColor="#fff"
              // Embed the ESMS logo in the centre
              logo={require('@/assets/images/icon.png')}
              logoSize={size * 0.18}
              logoBackgroundColor="#fff"
              logoBorderRadius={8}
              logoMargin={4}
              quietZone={4}
            />
          </View>
        )}
      </View>

      {/* Countdown */}
      <View style={[styles.countdownRow, { backgroundColor: `${statusColor}20` }]}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={[styles.countdownText, { color: statusColor }]}>
          {isExpired ? 'This pass has expired' : `Expires in ${formatDuration(remaining)}`}
        </Text>
      </View>

      {/* Hint */}
      {!isExpired && (
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Present this code to the security officer at the gate
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: Spacing.two },
  card: { borderRadius: Spacing.three, overflow: 'hidden' },
  qrWrapper: {},
  expiredOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  expiredEmoji: { fontSize: 48 },
  expiredText: { fontSize: 16, fontWeight: '700', color: '#FF453A' },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  countdownText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
