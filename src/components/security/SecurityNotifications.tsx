import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useActivityLogs, useAnnouncements, useConcerns } from "@/hooks/useQueries";

type Tab = "activity" | "reports" | "announcements";

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(d).toLocaleDateString();
}

export function SecurityNotifications() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("activity");

  const activity = useActivityLogs();
  const reports = useConcerns();
  const announcements = useAnnouncements();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="px-6 pt-6 pb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-navy">Notifications</Text>
        {tab === "announcements" && (
          <Pressable
            onPress={() => router.push("/(app)/notifications/announce" as any)}
            className="h-9 px-3 rounded-xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white text-xs font-semibold">+ New</Text>
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 gap-2 mb-4">
        {([["activity", "Activity"], ["reports", "Reports"], ["announcements", "Announcements"]] as [Tab, string][]).map(
          ([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              className={`flex-1 h-9 rounded-2xl items-center justify-center ${
                tab === key ? "bg-[#084BA3]" : "bg-white border border-border"
              }`}
            >
              <Text className={`text-xs font-medium ${tab === key ? "text-white" : "text-muted"}`}>{label}</Text>
            </Pressable>
          ),
        )}
      </View>

      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        {/* ACTIVITY */}
        {tab === "activity" && (
          <Section
            loading={activity.isLoading}
            error={activity.isError}
            empty={(activity.data?.data?.length ?? 0) === 0}
            emptyText="No activity recorded yet."
            onRetry={activity.refetch}
          >
            {activity.data?.data.map((item) => (
              <View key={item.id} className="bg-white border border-border rounded-2xl p-4 mb-2">
                <Text className="text-navy text-sm font-medium">{item.description}</Text>
                <Text className="text-muted text-xs mt-1">
                  {item.actorName} · {timeAgo(item.createdAt)}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <Section
            loading={reports.isLoading}
            error={reports.isError}
            empty={(reports.data?.data?.length ?? 0) === 0}
            emptyText="No resident reports yet."
            onRetry={reports.refetch}
          >
            {reports.data?.data.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push({ pathname: "/(app)/notifications/report" as any, params: { id: c.id } })}
                className="bg-white border border-border rounded-2xl p-4 mb-2"
              >
                <View className="flex-row justify-between items-start">
                  <Text className="text-navy text-sm font-semibold flex-1 pr-2" numberOfLines={1}>
                    {c.subject}
                  </Text>
                  <StatusPill status={c.status} />
                </View>
                <Text className="text-muted text-xs mt-1">
                  {c.resident ? `${c.resident.firstName ?? ""} ${c.resident.lastName ?? ""}`.trim() : "Resident"} · {timeAgo(c.createdAt)}
                </Text>
              </Pressable>
            ))}
          </Section>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <Section
            loading={announcements.isLoading}
            error={announcements.isError}
            empty={(announcements.data?.data?.length ?? 0) === 0}
            emptyText="No announcements yet. Tap + New to post one."
            onRetry={announcements.refetch}
          >
            {announcements.data?.data.map((a) => (
              <View key={a.id} className="bg-white border border-border rounded-2xl p-4 mb-2">
                <Text className="text-navy text-sm font-semibold">{a.subject}</Text>
                <Text className="text-muted text-sm mt-1" numberOfLines={2}>{a.body}</Text>
                <Text className="text-muted text-xs mt-2">
                  {a.type === "security_notice" ? "Security Notice" : "Estate Update"} · {a.authorName} · {timeAgo(a.createdAt)}
                </Text>
              </View>
            ))}
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  loading, error, empty, emptyText, onRetry, children,
}: {
  loading: boolean; error: boolean; empty: boolean; emptyText: string; onRetry: () => void; children: React.ReactNode;
}) {
  if (loading) return <ActivityIndicator color="#1B4FD8" className="mt-8" />;
  if (error)
    return (
      <View className="items-center mt-8">
        <Text className="text-danger text-sm mb-2">Couldn't load</Text>
        <Pressable onPress={onRetry} className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center">
          <Text className="text-white text-sm font-medium">Retry</Text>
        </Pressable>
      </View>
    );
  if (empty) return <Text className="text-muted text-sm text-center mt-8">{emptyText}</Text>;
  return <>{children}</>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
  };
  return (
    <View className={`px-2 py-0.5 rounded-full ${map[status]?.split(" ")[0] ?? "bg-gray-100"}`}>
      <Text className={`text-[10px] font-semibold capitalize ${map[status]?.split(" ")[1] ?? "text-muted"}`}>
        {status.replace("_", " ")}
      </Text>
    </View>
  );
}
