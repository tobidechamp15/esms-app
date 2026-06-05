import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useVisitStore } from '@/store/visitStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type ScanAction = 'check_in' | 'check_out';

export default function ScannerScreen() {
  const theme = useTheme();
  const { verifyVisitQR, isLoading } = useVisitStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [action, setAction] = useState<ScanAction>('check_in');
  const [scanned, setScanned] = useState(false);
  const scanLock = useRef(false);

  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(lineAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lineAnim]);

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanLock.current || isLoading) return;
    scanLock.current = true;
    setScanned(true);

    try {
      const result = await verifyVisitQR({ qrCode: data, action });
      Alert.alert(
        action === 'check_in' ? '✅ Checked In' : '✅ Checked Out',
        result.message,
        [
          {
            text: 'View visit',
            onPress: () => router.push(`/(app)/visits/${result.visit.id}`),
          },
          {
            text: 'Scan another',
            onPress: () => {
              setScanned(false);
              scanLock.current = false;
            },
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        '❌ Verification Failed',
        (err as { message?: string }).message ?? 'Invalid or expired QR code.',
        [
          {
            text: 'Try again',
            onPress: () => {
              setScanned(false);
              scanLock.current = false;
            },
          },
        ],
      );
    }
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={[styles.permissionTitle, { color: theme.text }]}>Camera access needed</Text>
          <Text style={[styles.permissionBody, { color: theme.textSecondary }]}>
            ESMS needs camera access to scan visitor QR codes at the gate.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant camera access</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const lineTranslate = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Action toggle */}
      <View style={styles.actionRow}>
        {(['check_in', 'check_out'] as ScanAction[]).map((a) => (
          <Pressable
            key={a}
            style={[styles.actionBtn, action === a && styles.actionBtnActive]}
            onPress={() => {
              setAction(a);
              setScanned(false);
              scanLock.current = false;
            }}>
            <Text style={[styles.actionBtnText, action === a && styles.actionBtnTextActive]}>
              {a === 'check_in' ? '🟢 Check In' : '🔴 Check Out'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line */}
            {!scanned && (
              <Animated.View
                style={[styles.scanLine, { transform: [{ translateY: lineTranslate }] }]}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {scanned ? 'Processing…' : `Point camera at visitor's QR code to ${action === 'check_in' ? 'check in' : 'check out'}`}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const VIEWFINDER_SIZE = 240;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnActive: { backgroundColor: '#fff' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  actionBtnTextActive: { color: '#000' },
  cameraContainer: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewfinder: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    backgroundColor: 'transparent',
    // Clear the overlay within viewfinder
    shadowColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#fff',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3C9FFE',
    shadowColor: '#3C9FFE',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: Spacing.three,
    alignItems: 'center',
  },
  footerText: { color: '#fff', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  // Permission
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.four },
  permissionEmoji: { fontSize: 56, marginBottom: Spacing.three },
  permissionTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.two },
  permissionBody: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.five },
  permissionBtn: {
    backgroundColor: '#3C9FFE',
    borderRadius: Spacing.two,
    paddingVertical: 14,
    paddingHorizontal: Spacing.six,
  },
  permissionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
