import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
}

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-[#084BA3]",
    secondary: "bg-navy",
    danger: "bg-danger",
    ghost: "bg-border",
  };
  const textVariants: Record<string, string> = {
    primary: "text-white",
    secondary: "text-white",
    danger: "text-white",
    ghost: "text-navy",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`h-14 rounded-2xl items-center justify-center ${variants[variant]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ─── Pin Dots ─────────────────────────────────────────────────────────────────

interface PinDotsProps {
  length: number;
  filled: number;
  error?: boolean;
  size?: number;
}

export function PinDots({ length, filled, error, size = 16 }: PinDotsProps) {
  return (
    <View
      className="flex-row gap-3 py-2 px-4 rounded-lg "
      style={{
        alignSelf: "flex-start",
        backgroundColor: "#EAECF0",
        borderRadius: 8,
      }}
    >
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          className={`border-2 ${
            i < filled
              ? error
                ? "bg-danger border-danger"
                : "bg-navy border-navy"
              : "bg-white border-gray-300"
          }`}
        />
      ))}
    </View>
  );
}

// ─── NumPad ───────────────────────────────────────────────────────────────────

interface NumPadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
}

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
] as const;

export function NumPad({ onPress, onDelete }: NumPadProps) {
  return (
    <View className="gap-2.5">
      {ROWS.map((row, ri) => (
        <View key={ri} className="flex-row gap-2.5">
          {row.map((key, ki) => (
            <Pressable
              key={ki}
              onPress={() => {
                if (!key) return;
                if (key === "⌫") onDelete();
                else onPress(key);
              }}
              disabled={!key}
              className={`flex-1 h-16 rounded-2xl items-center justify-center ${
                key ? "bg-white border border-border active:bg-surface" : ""
              }`}
            >
              <Text className="text-2xl font-medium text-navy">{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Back Header ──────────────────────────────────────────────────────────────

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
}

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="#0A1628"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BackHeader({ title, onBack }: BackHeaderProps) {
  const router = useRouter();
  return (
    <View className="flex-row items-center px-4 pt-3 pb-3 border-b border-border bg-white">
      <Pressable
        onPress={onBack ?? (() => router.back())}
        className="p-2 -ml-2 mr-2"
        hitSlop={12}
      >
        <ChevronLeftIcon />
      </Pressable>
      {title ? (
        <Text className="flex-1 text-center text-base font-semibold text-navy mr-8">
          {title}
        </Text>
      ) : null}
    </View>
  );
}
