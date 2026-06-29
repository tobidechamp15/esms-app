import { Modal, Pressable, Text, View } from "react-native";
import { X } from "@/components/ui/Icons";

interface SuccessSheetProps {
  visible: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onClose: () => void;
}

/**
 * Bottom-sheet confirmation shown after a successful action
 * (e.g. "Announcement Published", "Access Code Created", "Report Submitted").
 */
export function SuccessSheet({
  visible,
  title,
  message,
  actionLabel = "Done",
  onClose,
}: SuccessSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
        <View className="self-center w-10 h-1 rounded-full bg-border mb-5" />
        <View className="flex-row items-start justify-between">
          <Text className="text-xl font-bold text-navy flex-1 pr-3">{title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={20} color="#9CA3AF" />
          </Pressable>
        </View>
        <Text className="text-sm text-muted mt-1 mb-6">{message}</Text>
        <Pressable
          onPress={onClose}
          className="h-14 rounded-2xl items-center justify-center border border-border"
        >
          <Text className="text-navy font-semibold">{actionLabel}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
