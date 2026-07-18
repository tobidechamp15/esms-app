// components/visits/VisitShareCard.tsx
// Renders a shareable image card with QR code, access code, and visit details.
// Uses react-native-view-shot to capture the card as a PNG, then expo-sharing
// to share it via the native share sheet.

import * as Sharing from "expo-sharing";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Share, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[m - 1]} ${y}`;
}

function formatTime(t: string) {
  const [h, min] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisitShareCardProps {
  accessCode: string;
  qrCodeData: string;
  visitorName: string;
  visitDate: string; // YYYY-MM-DD
  arrivalTime: string; // HH:MM (24h)
  estateName?: string;
  /** When true, automatically shares on mount (for scenarios where the component
   *  is rendered dynamically only when sharing) */
  autoShare?: boolean;
  /** Called after share completes (success or fallback) — useful for cleanup */
  onShareComplete?: () => void;
}

export interface VisitShareCardRef {
  share: () => Promise<void>;
}

// ─── Card Visual Content (rendered inside ViewShot for capture) ───────────────

function ShareCardContent({
  accessCode,
  qrCodeData,
  visitorName,
  visitDate,
  arrivalTime,
  estateName,
}: VisitShareCardProps) {
  const codeLength = accessCode.length;
  const codeFontSize = codeLength > 5 ? 28 : 36;

  return (
    <View
      style={{
        width: 340,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        // Shadow (iOS)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Shadow (Android)
        elevation: 4,
      }}
    >
      {/* ── Header: Ventry branding ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: "#084BA3",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
            v
          </Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#0A1628" }}>
          entry
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 10, color: "#9CA3AF" }}>ACCESS PASS</Text>
      </View>

      {/* ── QR + Access Code row ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#F8F9FC",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        {/* QR Code */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 8,
            marginRight: 16,
          }}
        >
          <QRCode
            value={qrCodeData}
            size={88}
            backgroundColor="#fff"
            color="#0A1628"
          />
        </View>

        {/* Access Code */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 10,
              color: "#6B7280",
              marginBottom: 4,
              letterSpacing: 1,
            }}
          >
            ACCESS CODE
          </Text>
          <Text
            style={{
              fontSize: codeFontSize,
              fontWeight: "800",
              color: "#0A1628",
              letterSpacing: codeLength > 5 ? 4 : 6,
              fontVariant: ["tabular-nums"],
            }}
          >
            {accessCode}
          </Text>
        </View>
      </View>

      {/* ── Visit Details ── */}
      <View
        style={{
          backgroundColor: "#F8F9FC",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: "#6B7280",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Visit Details
        </Text>

        <DetailRow label="Visitor" value={visitorName} />
        <DetailRow label="Date" value={formatDate(visitDate)} />
        <DetailRow label="Arrival" value={formatTime(arrivalTime)} />
        {estateName ? <DetailRow label="Estate" value={estateName} /> : null}
      </View>

      {/* ── Footer ── */}
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          Show this code at the estate gate for entry.
        </Text>
        <Text style={{ fontSize: 10, color: "#D1D5DB", marginTop: 4 }}>
          Valid for 3 hours from arrival time
        </Text>
      </View>

      {/* ── Bottom branding bar ── */}
      <View
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 9,
            color: "#D1D5DB",
            letterSpacing: 1,
          }}
        >
          VENTRY — SECURE ESTATE ACCESS
        </Text>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: 13, color: "#6B7280" }}>{label}</Text>
      <Text
        style={{ fontSize: 13, fontWeight: "600", color: "#0A1628" }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── VisitShareCard Component ─────────────────────────────────────────────────

const VisitShareCard = forwardRef<VisitShareCardRef, VisitShareCardProps>(
  function VisitShareCard(props, ref) {
    const { autoShare, onShareComplete } = props;
    const viewShotRef = useRef<ViewShot>(null);
    const sharedRef = useRef(false);

    const share = useCallback(async () => {
      sharedRef.current = true;
      try {
        // 1. Check if native sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          await fallbackTextShare(props);
          onShareComplete?.();
          return;
        }

        // 2. Capture the card as a PNG image
        const viewShot = viewShotRef.current;
        if (!viewShot?.capture) {
          await fallbackTextShare(props);
          onShareComplete?.();
          return;
        }

        const uri = await viewShot.capture();
        if (!uri) {
          await fallbackTextShare(props);
          onShareComplete?.();
          return;
        }

        // 3. Share the image via native share sheet
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Ventry Access Pass",
          UTI: "public.png",
        });
      } catch {
        // Fallback: share as text if anything fails
        await fallbackTextShare(props);
      }
      onShareComplete?.();
    }, [props, onShareComplete]);

    useImperativeHandle(ref, () => ({ share }), [share]);

    // Auto-share on mount when autoShare is true
    useEffect(() => {
      if (autoShare) {
        share();
      }
    }, [autoShare, share]);

    return (
      // Rendered off-screen — only needed for the PNG capture
      <View style={{ position: "absolute", left: -9999, top: -9999 }}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
          <ShareCardContent {...props} />
        </ViewShot>
      </View>
    );
  },
);

async function fallbackTextShare(props: VisitShareCardProps) {
  await Share.share({
    message: [
      `Your Ventry access code: ${props.accessCode}`,
      `Visitor: ${props.visitorName}`,
      `Date: ${formatDate(props.visitDate)}`,
      `Arrival: ${formatTime(props.arrivalTime)}`,
      props.estateName ? `Estate: ${props.estateName}` : "",
      "",
      "Valid for 3 hours from arrival time. Show this code at the estate gate.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export default VisitShareCard;
