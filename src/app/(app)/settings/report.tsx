import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader } from "@/components/ui";
import { useConcern, useUpdateConcernStatus } from "@/hooks/useQueries";

const STATUSES: {
  key: "submitted" | "under_review" | "resolved";
  label: string;
}[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Reviews" },
  { key: "resolved", label: "Resolved" },
];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading, isError, refetch } = useConcern(id!);
  const updateStatus = useUpdateConcernStatus();

  async function setStatus(status: "submitted" | "under_review" | "resolved") {
    try {
      await updateStatus.mutateAsync({ id: id!, status });
      refetch();
    } catch {
      /* surfaced via toast */
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <BackHeader title="Resident Report" />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1B4FD8" />
        </View>
      ) : isError || !report ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-danger text-sm mb-2">
            Couldn't load this report
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" contentContainerClassName="pb-10">
          <View className="bg-white border border-border rounded-2xl p-5 mt-4">
            <Text className="text-lg font-bold text-navy mb-1">
              {report.subject}
            </Text>
            <Text className="text-sm text-muted">{report.address}</Text>
            {report.resident ? (
              <Text className="text-xs text-muted mt-3">
                From {report.resident.firstName} {report.resident.lastName} ·{" "}
                {report.resident.phone}
              </Text>
            ) : null}
            <Text className="text-xs text-muted mt-1">
              {new Date(report.submittedAt).toLocaleString()}
            </Text>
            {/* {report.attachmentUrl ? (
              <Image
                source={{ uri: report.attachmentUrl }}
                className="w-full h-48 rounded-xl mt-4"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../../../../assets/phone.png")}
                className="w-full h-48 rounded-xl mt-4"
                resizeMode="cover"
              />
            )} */}
          </View>

          <Text className="text-sm font-semibold text-navy mt-6 mb-3">
            Update Status
          </Text>
          {STATUSES.map((s) => {
            const active = report.status === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setStatus(s.key)}
                disabled={updateStatus.isPending}
                className={`h-12 rounded-2xl items-center justify-center mb-2 border ${
                  active
                    ? "bg-[#084BA3] border-[#084BA3]"
                    : "bg-white border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${active ? "text-white" : "text-navy"}`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
