import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";

export default function VerifyResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ok?: string;
    visitorName?: string;
    residentName?: string;
    houseNumber?: string;
    streetName?: string;
    status?: string;
    action?: string;
    message?: string;
    error?: string;
  }>();

  const approved = params.ok === "1";
  const actionLabel = params.action === "check_out" ? "Check-out" : "Check-in";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center px-8">
        <View
          className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
            approved ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`text-5xl ${approved ? "text-green-600" : "text-danger"}`}
          >
            {approved ? "✓" : "✕"}
          </Text>
        </View>

        <Text
          className={`text-2xl font-bold mb-2 ${approved ? "text-green-700" : "text-danger"}`}
        >
          {approved ? `${actionLabel} Approved` : "Access Denied"}
        </Text>

        {approved ? (
          <View className="w-full bg-white border border-border rounded-2xl p-5 mt-4">
            <Row label="Visitor" value={params.visitorName} />
            <Row label="Host" value={params.residentName} />
            {params.houseNumber || params.streetName ? (
              <Row
                label="Address"
                value={`No. ${params.houseNumber ?? "—"}, ${params.streetName ?? ""}`}
              />
            ) : null}
            <Row label="Status" value={params.status} capitalize />
          </View>
        ) : (
          <Text className="text-sm text-muted text-center mt-2">
            {params.error ?? "This code is invalid, expired, or already used."}
          </Text>
        )}
      </View>

      <View className="px-6 pb-6 gap-3">
        <Button
          label="Verify Another"
          onPress={() => router.replace("/(app)/verify")}
        />
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) {
  return (
    <View className="flex-row justify-between py-2 border-b border-border last:border-0">
      <Text className="text-sm text-muted">{label}</Text>
      <Text
        className={`text-sm font-medium text-navy ${capitalize ? "capitalize" : ""}`}
      >
        {value || "—"}
      </Text>
    </View>
  );
}
