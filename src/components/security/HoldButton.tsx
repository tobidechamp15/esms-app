import { useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";

interface HoldButtonProps {
  label: string;
  holdingLabel?: string;
  durationMs?: number;
  color?: string;       // bg when idle
  onComplete: () => void;
}

/**
 * Press-and-HOLD to trigger. Prevents accidental/pocket activation.
 * Fills a progress ring over `durationMs`; releasing early cancels.
 */
export function HoldButton({
  label,
  holdingLabel = "Keep holding…",
  durationMs = 1500,
  color = "#DC2626",
  onComplete,
}: HoldButtonProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);

  function start() {
    setHolding(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setHolding(false);
        progress.setValue(0);
        onComplete();
      }
    });
  }

  function cancel() {
    setHolding(false);
    Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  }

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Pressable onPressIn={start} onPressOut={cancel}>
      <View
        style={{ backgroundColor: color }}
        className="h-16 rounded-2xl items-center justify-center overflow-hidden"
      >
        <Animated.View
          style={{ width, position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.25)" }}
        />
        <Text className="text-white text-base font-bold">
          {holding ? holdingLabel : label}
        </Text>
      </View>
    </Pressable>
  );
}
