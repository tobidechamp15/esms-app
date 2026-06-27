import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

import { NumPad, PinDots } from "@/components/ui";

const PIN_LENGTH = 4;

interface PinConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: (pin: string) => void;
}

export function PinConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  loading,
  error,
  onCancel,
  onConfirm,
}: PinConfirmModalProps) {
  const [pin, setPin] = useState("");

  function handleDigit(d: string) {
    if (pin.length >= PIN_LENGTH || loading) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => onConfirm(next), 120);
    }
  }

  function handleClose() {
    setPin("");
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-8">
          <Text className={`text-lg font-bold mb-1 ${danger ? "text-danger" : "text-navy"}`}>
            {title}
          </Text>
          <Text className="text-sm text-muted mb-6">{message}</Text>

          <Text className="text-sm font-medium text-navy mb-3 text-center">
            Enter your PIN to confirm
          </Text>
          <PinDots length={PIN_LENGTH} filled={pin.length} error={Boolean(error)} />
          {error ? (
            <Text className="text-danger text-sm mt-3 text-center">{error}</Text>
          ) : null}

          {loading ? (
            <View className="flex-row items-center justify-center mt-5">
              <ActivityIndicator color="#1B4FD8" />
              <Text className="text-muted text-sm ml-3">Working…</Text>
            </View>
          ) : (
            <View className="mt-5">
              <NumPad onPress={handleDigit} onDelete={() => setPin((p) => p.slice(0, -1))} />
            </View>
          )}

          <Pressable onPress={handleClose} className="h-12 items-center justify-center mt-2">
            <Text className="text-muted font-medium">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
