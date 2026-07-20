import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const NAVY = "#0A1628";
const ACCENT = "#1B4FD8";
const ACCENT_GLOW = "#3D6BFF";

const LETTERS = ["e", "n", "t", "r", "y"] as const;
const LETTER_STAGGER = 90;
const V_SETTLE = 600;
const GLOW_START = V_SETTLE + LETTERS.length * LETTER_STAGGER;

/** One trailing letter — owns its own hooks (correct rules-of-hooks pattern). */
function Letter({
  char,
  index,
  glow,
}: {
  char: string;
  index: number;
  glow: SharedValue<number>;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    const at = V_SETTLE + index * LETTER_STAGGER;
    opacity.value = withDelay(
      at,
      withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      at,
      withTiming(0, { duration: 320, easing: Easing.out(Easing.back(1.2)) }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    textShadowColor: ACCENT_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6 + glow.value * 18,
  }));

  return (
    <Animated.Text style={[styles.wordmark, styles.white, style]}>
      {char}
    </Animated.Text>
  );
}

/**
 * Animated splash: "v" fades + scales in, then e-n-t-r-y reveal one letter at a
 * time, followed by a pulsing accent glow. Plays once, then calls onFinish —
 * no routing decisions (app/index.tsx handles that).
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const containerOpacity = useSharedValue(1);
  const vOpacity = useSharedValue(0);
  const vScale = useSharedValue(0.92);
  const glow = useSharedValue(0);

  useEffect(() => {
    vOpacity.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    vScale.value = withTiming(1, {
      duration: V_SETTLE,
      easing: Easing.out(Easing.back(1.4)),
    });

    glow.value = withDelay(
      GLOW_START,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.35, {
            duration: 600,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        3,
        true,
      ),
    );

    containerOpacity.value = withDelay(
      GLOW_START + 1700,
      withTiming(
        0,
        { duration: 400, easing: Easing.in(Easing.cubic) },
        (done) => {
          if (done) runOnJS(onFinish)();
        },
      ),
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));
  const vStyle = useAnimatedStyle(() => ({
    opacity: vOpacity.value,
    transform: [{ scale: vScale.value }],
    textShadowColor: ACCENT_GLOW,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6 + glow.value * 18,
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + glow.value * 0.5,
    transform: [{ scale: 1 + glow.value * 0.12 }],
  }));

  return (
    <Animated.View style={[styles.fill, containerStyle]}>
      <View style={styles.center}>
        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
        <View style={styles.row}>
          <Animated.Text style={[styles.wordmark, styles.accent, vStyle]}>
            v
          </Animated.Text>
          {LETTERS.map((ch, i) => (
            <Letter key={ch + i} char={ch} index={i} glow={glow} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
    zIndex: 999,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "baseline" },
  wordmark: { fontSize: 46, fontWeight: "800", letterSpacing: -1 },
  accent: { color: ACCENT },
  white: { color: "#FFFFFF" },
  glow: {
    position: "absolute",
    width: 240,
    height: 120,
    borderRadius: 120,
    backgroundColor: ACCENT_GLOW,
  },
});
