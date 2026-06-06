import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot, { captureRef, type ViewShotRef } from "react-native-view-shot";

import { QRDisplay } from "@/components/ui/QRDisplay";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";
import { useVisitStore } from "@/store/visitStore";

function DetailRow({ label, value }: { label: string; value?: string }) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[detailStyles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: { fontSize: 14, fontWeight: "500" },
  value: {
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
});

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { currentVisit, isLoading, fetchVisitById, cancelVisitById } =
    useVisitStore();
  const shareCardRef = useRef<ViewShotRef>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    if (id) fetchVisitById(id);
  }, [id]);

  const visit = currentVisit?.id === id ? currentVisit : null;

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const PURPOSE_LABELS: Record<string, string> = {
    personal: "Personal Visit",
    delivery: "Delivery",
    maintenance: "Maintenance",
    official: "Official Visit",
    other: "Other",
  };

  async function handleShare() {
    if (!visit) return;
    setIsSharing(true);
    setShowShareCard(true);

    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const uri = await captureRef(shareCardRef, {
          format: "png",
          quality: 1,
          result: "tmpfile",
        });

        setShowShareCard(false);

        const cacheDir = (FileSystem as any).cacheDirectory as string | null;
        const dest = `${cacheDir ?? "/tmp/"}esms-visit-pass-${visit.id}.png`;
        await FileSystem.copyAsync({ from: uri, to: dest });

        await Sharing.shareAsync(dest, {
          mimeType: "image/png",
          dialogTitle: "Share Visit Pass",
          UTI: "public.png",
        });
      } else {
        setShowShareCard(false);
        await Share.share({
          title: "ESMS Visit Pass",
          message: buildShareMessage(visit, formatDate),
        });
      }
    } catch (err) {
      setShowShareCard(false);
      console.log("Image share failed, falling back to text:", err);
      try {
        await Share.share({
          title: "ESMS Visit Pass",
          message: buildShareMessage(visit, formatDate),
        });
      } catch {
        Alert.alert("Share failed", "Could not share the visit pass.");
      }
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCancel() {
    if (!visit) return;
    Alert.alert("Cancel visit?", "This will revoke the visitor's QR code.", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelVisitById(visit.id);
          } catch {
            Alert.alert("Error", "Failed to cancel visit. Please try again.");
          }
        },
      },
    ]);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      gap: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
    },
    backText: { fontSize: 16, color: "#3C9FFE", fontWeight: "600" },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      flex: 1,
    },
    content: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.six,
    },
    card: {
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      padding: Spacing.three,
      marginBottom: Spacing.three,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.textSecondary,
      marginBottom: Spacing.two,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.backgroundSelected,
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.three,
    },
    visitorName: { fontSize: 22, fontWeight: "700", color: theme.text },
    qrSection: { alignItems: "center", marginVertical: Spacing.four },
    shareBtn: {
      backgroundColor: "#3C9FFE",
      borderRadius: Spacing.two,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.two,
      opacity: isSharing ? 0.7 : 1,
    },
    shareBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
    cancelBtn: {
      borderRadius: Spacing.two,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: theme.backgroundElement,
    },
    cancelBtnText: { fontSize: 15, fontWeight: "600", color: "#FF453A" },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    shareCardOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      zIndex: 999,
      elevation: 999,
    },
    shareCard: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 24,
      width: "100%",
      alignItems: "center",
    },
    shareCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    shareCardAppName: {
      fontSize: 16,
      fontWeight: "800",
      color: "#3C9FFE",
      letterSpacing: 1,
    },
    shareCardTitle: {
      fontSize: 13,
      color: "#94a3b8",
      fontWeight: "500",
      marginBottom: 20,
    },
    shareCardVisitorName: {
      fontSize: 22,
      fontWeight: "800",
      color: "#0f172a",
      marginBottom: 4,
      textAlign: "center",
    },
    shareCardPurpose: {
      fontSize: 14,
      color: "#64748b",
      fontWeight: "500",
      marginBottom: 20,
    },
    shareCardQR: {
      marginBottom: 20,
    },
    shareCardInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "#e2e8f0",
    },
    shareCardInfoLabel: {
      fontSize: 13,
      color: "#94a3b8",
      fontWeight: "500",
    },
    shareCardInfoValue: {
      fontSize: 13,
      color: "#0f172a",
      fontWeight: "600",
      maxWidth: "60%",
      textAlign: "right",
    },
    shareCardFooter: {
      marginTop: 16,
      fontSize: 11,
      color: "#cbd5e1",
      textAlign: "center",
    },
    shareCardLogoBadge: {
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: "#3C9FFE",
      alignItems: "center",
      justifyContent: "center",
    },
    shareCardLogoText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 14,
    },
  });

  if (isLoading && !visit) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingContainer}>
          <ActivityIndicator color="#3C9FFE" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!visit) return null;

  const canCancel =
    (visit.status === "scheduled" || visit.status === "checked_in") &&
    (user?.role === "admin" || visit.residentId === user?.id);

  const showQR = visit.status === "scheduled" || visit.status === "checked_in";

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <Text style={s.headerTitle}>Visit Details</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Status + name */}
        <View style={s.statusRow}>
          <Text style={s.visitorName}>{visit.visitor.name}</Text>
          <StatusBadge status={visit.status} />
        </View>

        {/* QR Code */}
        {showQR && (
          <View style={s.qrSection}>
            <QRDisplay value={visit.qrCode} expiresAt={visit.expiresAt} />
          </View>
        )}

        {/* Visitor info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Visitor Info</Text>
          <DetailRow label="Phone" value={visit.visitor.phone} />
          <View style={s.divider} />
          <DetailRow label="Vehicle plate" value={visit.visitor.vehiclePlate} />
          <View style={s.divider} />
          <DetailRow
            label="ID number"
            value={visit.visitor.identificationNumber}
          />
        </View>

        {/* Visit info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Visit Info</Text>
          <DetailRow
            label="Purpose"
            value={PURPOSE_LABELS[visit.purpose] ?? visit.purpose}
          />
          {visit.purposeNote && (
            <>
              <View style={s.divider} />
              <DetailRow label="Notes" value={visit.purposeNote} />
            </>
          )}
          <View style={s.divider} />
          <DetailRow label="Scheduled" value={formatDate(visit.scheduledAt)} />
          <View style={s.divider} />
          <DetailRow label="Expires" value={formatDate(visit.expiresAt)} />
          {visit.checkedInAt && (
            <>
              <View style={s.divider} />
              <DetailRow
                label="Checked in"
                value={formatDate(visit.checkedInAt)}
              />
            </>
          )}
          {visit.checkedOutAt && (
            <>
              <View style={s.divider} />
              <DetailRow
                label="Checked out"
                value={formatDate(visit.checkedOutAt)}
              />
            </>
          )}
        </View>

        {/* Resident info (security view) */}
        {visit.resident && user?.role !== "resident" && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Host Resident</Text>
            <DetailRow label="Name" value={visit.resident.name} />
            <View style={s.divider} />
            <DetailRow label="Unit" value={visit.resident.unitNumber} />
          </View>
        )}

        {/* Actions */}
        {showQR && (
          <Pressable
            style={s.shareBtn}
            onPress={handleShare}
            disabled={isSharing}
          >
            <Text style={s.shareBtnText}>
              {isSharing ? "Preparing…" : "↑ Share Visit Pass"}
            </Text>
          </Pressable>
        )}

        {canCancel && (
          <Pressable style={s.cancelBtn} onPress={handleCancel}>
            <Text style={s.cancelBtnText}>Cancel Visit</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Share Card Modal Overlay */}
      {showQR && showShareCard && (
        <View style={s.shareCardOverlay}>
          <View collapsable={false}>
            <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
              <View style={s.shareCard} renderToHardwareTextureAndroid>
                <View style={s.shareCardHeader}>
                  <View style={s.shareCardLogoBadge}>
                    <Text style={s.shareCardLogoText}>E</Text>
                  </View>
                  <Text style={s.shareCardAppName}>ESMS</Text>
                </View>
                <Text style={s.shareCardTitle}>Estate Visitor Pass</Text>
                <Text style={s.shareCardVisitorName}>{visit.visitor.name}</Text>
                <Text style={s.shareCardPurpose}>
                  {PURPOSE_LABELS[visit.purpose] ?? visit.purpose}
                </Text>
                <View style={s.shareCardQR}>
                  <QRDisplay
                    value={visit.qrCode}
                    expiresAt={visit.expiresAt}
                    size={180}
                  />
                </View>
                <View style={{ width: "100%" }}>
                  <View style={s.shareCardInfoRow}>
                    <Text style={s.shareCardInfoLabel}>Phone</Text>
                    <Text style={s.shareCardInfoValue}>
                      {visit.visitor.phone}
                    </Text>
                  </View>
                  {visit.visitor.vehiclePlate && (
                    <View style={s.shareCardInfoRow}>
                      <Text style={s.shareCardInfoLabel}>Vehicle</Text>
                      <Text style={s.shareCardInfoValue}>
                        {visit.visitor.vehiclePlate}
                      </Text>
                    </View>
                  )}
                  <View style={s.shareCardInfoRow}>
                    <Text style={s.shareCardInfoLabel}>Scheduled</Text>
                    <Text style={s.shareCardInfoValue}>
                      {formatDate(visit.scheduledAt)}
                    </Text>
                  </View>
                  <View style={s.shareCardInfoRow}>
                    <Text style={s.shareCardInfoLabel}>Expires</Text>
                    <Text style={s.shareCardInfoValue}>
                      {formatDate(visit.expiresAt)}
                    </Text>
                  </View>
                  {visit.resident?.unitNumber && (
                    <View style={s.shareCardInfoRow}>
                      <Text style={s.shareCardInfoLabel}>Unit</Text>
                      <Text style={s.shareCardInfoValue}>
                        {visit.resident.unitNumber}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={s.shareCardFooter}>
                  Present this QR code to the security officer at the gate
                </Text>
              </View>
            </ViewShot>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function buildShareMessage(
  visit: any,
  formatDate: (iso?: string) => string,
): string {
  const lines = [
    "🏠 ESMS — Estate Visitor Pass",
    "─────────────────────────",
    `👤 Visitor:   ${visit.visitor.name}`,
    `📞 Phone:     ${visit.visitor.phone}`,
  ];

  if (visit.visitor.vehiclePlate) {
    lines.push(`🚗 Vehicle:   ${visit.visitor.vehiclePlate}`);
  }

  lines.push(
    `📋 Purpose:   ${visit.purpose.charAt(0).toUpperCase() + visit.purpose.slice(1)}`,
    `📅 Scheduled: ${formatDate(visit.scheduledAt)}`,
    `⏱️  Expires:   ${formatDate(visit.expiresAt)}`,
  );

  if (visit.resident?.unitNumber) {
    lines.push(`🏠 Unit:      ${visit.resident.unitNumber}`);
  }

  lines.push(
    "─────────────────────────",
    "Please present this pass to the security officer at the gate.",
    "Open the ESMS app to view your QR code.",
  );

  return lines.join("\n");
}