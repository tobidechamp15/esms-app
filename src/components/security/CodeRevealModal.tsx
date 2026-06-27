import { Modal, Pressable, Text, View } from "react-native";

interface CodeRevealModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  code?: string;
  expiresAt?: string;
  onClose: () => void;
}

export function CodeRevealModal({
  visible,
  title,
  subtitle,
  code,
  expiresAt,
  onClose,
}: CodeRevealModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View className="w-full bg-white rounded-3xl p-6">
          <Text className="text-lg font-bold text-navy mb-1">{title}</Text>
          <Text className="text-sm text-muted mb-5">{subtitle}</Text>

          <View className="bg-primary-50 border border-primary-200 rounded-2xl py-6 items-center mb-5">
            <Text className="text-4xl font-bold text-primary-600 tracking-[10px]">
              {code ?? "----"}
            </Text>
            {expiresAt ? (
              <Text className="text-xs text-muted mt-2">
                Expires {new Date(expiresAt).toLocaleTimeString()} · valid 5 min
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={onClose}
            className="h-12 rounded-2xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white font-semibold">Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
