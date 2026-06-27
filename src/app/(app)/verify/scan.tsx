import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button } from "@/components/ui";
import { useVerifyCode } from "@/hooks/useQueries";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const verify = useVerifyCode();
  const [scanned, setScanned] = useState(false);
  const lock = useRef(false);

  async function onScan({ data }: { data: string }) {
    if (lock.current) return;
    lock.current = true;
    setScanned(true);

    // QR encodes the access code (qrCodeData === accessCode). Extract digits.
    const code = (data.match(/\d{4,6}/)?.[0] ?? data).trim();

    try {
      const result = await verify.mutateAsync({
        accessCode: code,
        action: "check_in",
      });
      router.replace({
        pathname: "/(app)/verify/result",
        params: {
          ok: "1",
          action: "check_in",
          visitorName: result.visit.visitorName,
          residentName: (result.visit as any).residentName,
          houseNumber: (result.visit as any).houseNumber,
          streetName: (result.visit as any).streetName,
          status: result.visit.status,
          message: result.message,
        },
      });
    } catch (err) {
      router.replace({
        pathname: "/(app)/verify/result",
        params: {
          ok: "0",
          error: (err as { message?: string })?.message ?? "Invalid code.",
        },
      });
    }
  }

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <BackHeader title="Scan QR Code" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1B4FD8" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <BackHeader title="Scan QR Code" />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-navy text-base font-semibold mb-2 text-center">
            Camera access needed
          </Text>
          <Text className="text-muted text-sm text-center mb-6">
            Allow camera access to scan visitor QR codes.
          </Text>
          <Button label="Grant Camera Access" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <BackHeader title="Scan QR Code" />
      <View className="flex-1">
        {!scanned && (
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onScan}
          />
        )}
        {scanned && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#fff" />
            <Text className="text-white text-sm mt-3">Verifying…</Text>
          </View>
        )}
      </View>
      <View className="px-6 pb-6">
        <Pressable
          onPress={() => router.replace("/(app)/verify")}
          className="h-12 items-center justify-center"
        >
          <Text className="text-white font-medium">
            Enter code manually instead
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
