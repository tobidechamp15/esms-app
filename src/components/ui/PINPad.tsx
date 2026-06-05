import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const PIN_LENGTH = 6;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

interface PINPadProps {
  onComplete: (pin: string) => void | Promise<void>;
}

export function PINPad({ onComplete }: PINPadProps) {
  const theme = useTheme();
  const [pin, setPin] = useState<string[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const finalPin = pin.join('');
      // Brief visual feedback before callback
      const timeout = setTimeout(() => {
        onComplete(finalPin);
        setPin([]);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [pin, onComplete]);

  function handleKey(key: string) {
    if (key === '') return;
    if (key === 'del') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    setPin((prev) => [...prev, key]);
  }

  const s = StyleSheet.create({
    container: { alignItems: 'center', width: '100%' },
    dotsRow: { flexDirection: 'row', gap: 14, marginBottom: Spacing.five },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.textSecondary,
    },
    dotFilled: { backgroundColor: '#3C9FFE', borderColor: '#3C9FFE' },
    grid: { gap: Spacing.two, width: '100%', maxWidth: 280 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
    key: {
      flex: 1,
      aspectRatio: 1,
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyPressed: { backgroundColor: theme.backgroundSelected },
    keyText: { fontSize: 24, fontWeight: '600', color: theme.text },
    delText: { fontSize: 18 },
    keyEmpty: { flex: 1 },
  });

  return (
    <View style={s.container}>
      {/* Dots */}
      <Animated.View style={[s.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View key={i} style={[s.dot, i < pin.length && s.dotFilled]} />
        ))}
      </Animated.View>

      {/* Keypad */}
      <View style={s.grid}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((key, ki) => {
              if (key === '') return <View key={ki} style={s.keyEmpty} />;
              return (
                <Pressable
                  key={ki}
                  style={({ pressed }) => [s.key, pressed && s.keyPressed]}
                  onPress={() => handleKey(key)}>
                  {key === 'del' ? (
                    <Text style={[s.keyText, s.delText]}>⌫</Text>
                  ) : (
                    <Text style={s.keyText}>{key}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
