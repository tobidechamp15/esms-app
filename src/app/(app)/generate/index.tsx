import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { Copy, QrCode, X } from "@/components/ui/Icons";
import { useCreateVisit } from "@/hooks/useQueries";
import type { Visit } from "@/types";
import { notify } from "@/lib/notify";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatTimeDisplay(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function toTimeString(d: Date): string {
  return d.toTimeString().slice(0, 5);
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  chip,
}: {
  label: string;
  value: string;
  chip?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-2.5 border-b border-border">
      <Text className="text-sm text-muted">{label}</Text>
      {chip ? (
        <View className="flex-row items-center gap-1 border border-border rounded-full px-2.5 py-1">
          <Text className="text-[11px] text-muted">🕐 {value}</Text>
        </View>
      ) : (
        <Text className="text-sm font-semibold text-navy">{value}</Text>
      )}
    </View>
  );
}
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      setToast(message);
      setTimeout(() => setToast(null), 2000);
    }
  }, []);

  return { toast, showToast };
}
// ─── Success Modal ────────────────────────────────────────────────────────────

function AccessCodeModal({
  visit,
  visitDate,
  arrivalTime,
  onClose,
}: {
  visit: Visit;
  visitDate: Date;
  arrivalTime: Date;
  onClose: () => void;
}) {
  const [showQr, setShowQr] = useState(false);

  async function handleShare() {
    await Share.share({
      message: `Your Ventry access code: ${visit.accessCode}\nVisitor: ${visit.visitorName}\nDate: ${formatDateDisplay(visitDate)}\nArrival: ${formatTimeDisplay(arrivalTime)}\n\nValid for 3 hours from arrival time.`,
    });
  }
  const { toast, showToast } = useToast();

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xl font-bold text-navy">
            Access Code Created
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={20} color="#0A1628" />
          </Pressable>
        </View>
        <Text className="text-sm text-muted mb-5">
          Your visitor access code has been created. Share it with your guest
          for entry into the estate.
        </Text>

        {/* Code / QR card */}
        <View className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-xs font-bold text-primary-500 mb-1">
              <Text className="text-primary-400">v</Text>entry
            </Text>
            <Text className="text-xs text-muted mb-1">Access Code</Text>
            <Text className="text-4xl font-bold text-navy tracking-widest">
              {visit.accessCode}
            </Text>
          </View>
          {showQr ? (
            <QRCode value={visit.qrCodeData} size={84} />
          ) : (
            <View className="w-20 h-20 bg-white rounded-xl items-center justify-center border border-border">
              <QrCode size={36} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Visit Details */}
        <View className="bg-surface border border-border rounded-2xl p-4 mb-5">
          <Text className="text-sm font-bold text-navy mb-1">
            Visit Details
          </Text>
          <DetailRow label="Visitor Name" value={visit.visitorName} />
          <DetailRow label="Visit Date" value={formatDateDisplay(visitDate)} />
          <DetailRow
            label="Expected Arrival Time"
            value={formatTimeDisplay(arrivalTime)}
          />
          <DetailRow label="Status" value="Countdown Inactive" chip />
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mb-3">
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(visit.accessCode);
              showToast("Access code copied!");
            }}
            className="flex-1 h-12 border border-border rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Copy size={16} color="#0A1628" />
            <Text className="text-sm font-medium text-navy">Copy Code</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowQr((s) => !s)}
            className="flex-1 h-12 border border-border rounded-2xl flex-row items-center justify-center gap-2"
          >
            <QrCode size={16} color="#0A1628" />
            <Text className="text-sm font-medium text-navy">
              {showQr ? "Hide QR" : "Generate QR"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleShare}
          className="h-14 bg-[#084BA3] rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-semibold text-base">
            Share Access Code
          </Text>
        </Pressable>
      </View>
      {toast && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            backgroundColor: "rgba(10,22,40,0.9)",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            zIndex: 999,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
            {toast}
          </Text>
        </View>
      )}
    </Modal>
  );
}

// ─── Generate Screen ──────────────────────────────────────────────────────────

export default function GenerateScreen() {
  const createVisit = useCreateVisit();

  const [visitorName, setVisitorName] = useState("");
  const [visitDate, setVisitDate] = useState(new Date());
  const [arrivalTime, setArrivalTime] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [createdVisit, setCreatedVisit] = useState<Visit | null>(null);
  const [error, setError] = useState("");

  const isValid = visitorName.trim().length > 0;

  async function handleGenerate() {
    if (!isValid) return;
    setError("");
    try {
      const visit = await createVisit.mutateAsync({
        visitorName: visitorName.trim(),
        visitDate: toDateString(visitDate),
        expectedArrivalTime: toTimeString(arrivalTime),
      });

      setCreatedVisit(visit);
      await notify(
        "Visitor code generated",
        `Code for ${visit.visitorName} is ready. Valid for ${toDateString(visitDate)}.`,
      );
    } catch (err) {
      setError(
        (err as { message?: string }).message ?? "Failed to generate code.",
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-bold text-navy mb-1">
          Generate Access Code
        </Text>
        <Text className="text-sm text-muted mb-8">
          Create an access code for your visitor to enter the estate.
        </Text>

        {/* Visitor Name */}
        <Text className="text-sm font-medium text-navy mb-2">
          Visitor's Name
        </Text>
        <TextInput
          value={visitorName}
          onChangeText={(t) => {
            setVisitorName(t);
            setError("");
          }}
          placeholder="Enter visitor's full name"
          placeholderTextColor="#9CA3AF"
          className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-white mb-5"
          returnKeyType="done"
        />

        {/* Visit Date */}
        <Text className="text-sm font-medium text-navy mb-2">Visit Date</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="h-14 px-4 border border-border rounded-2xl flex-row items-center justify-between bg-white mb-5"
        >
          <Text className="text-base text-navy">
            {formatDateDisplay(visitDate)}
          </Text>
          <Text className="text-xl">📅</Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={visitDate}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowDatePicker(false);
              if (d) setVisitDate(d);
            }}
          />
        )}

        {/* Arrival Time */}
        <Text className="text-sm font-medium text-navy mb-2">
          Expected Arrival Time
        </Text>
        <Pressable
          onPress={() => setShowTimePicker(true)}
          className="h-14 px-4 border border-border rounded-2xl flex-row items-center justify-between bg-white mb-5"
        >
          <Text className="text-base text-navy">
            {formatTimeDisplay(arrivalTime)}
          </Text>
          <Text className="text-xl">🕐</Text>
        </Pressable>

        {showTimePicker && (
          <DateTimePicker
            value={arrivalTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, t) => {
              setShowTimePicker(false);
              if (t) setArrivalTime(t);
            }}
          />
        )}

        {/* Info note */}
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <Text className="text-sm text-muted leading-5">
            The access code can be shared with your visitor and will remain
            valid for <Text className="font-bold text-navy">3 hours</Text> from
            the selected arrival time.
          </Text>
        </View>

        {error ? (
          <Text className="text-danger text-sm mb-3">{error}</Text>
        ) : null}
        <View className="h-8" />
      </ScrollView>

      <View className="px-6 pb-6">
        <Button
          label="Generate Access Code"
          onPress={handleGenerate}
          disabled={!isValid}
          loading={createVisit.isPending}
        />
      </View>

      {createdVisit && (
        <AccessCodeModal
          visit={createdVisit}
          visitDate={visitDate}
          arrivalTime={arrivalTime}
          onClose={() => {
            setCreatedVisit(null);
            setVisitorName("");
          }}
        />
      )}
    </SafeAreaView>
  );
}
