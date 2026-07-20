import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  usePaginatedActivityLogs,
  usePaginatedAnnouncements,
  usePaginatedConcerns,
} from "@/hooks/useQueries";

type Tab = "activity" | "reports" | "announcements";

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(d).toLocaleDateString();
}

function ListFooter({
  isFetching,
  hasMore,
}: {
  isFetching: boolean;
  hasMore: boolean;
}) {
  if (isFetching) {
    return (
      <View className="py-6 items-center">
        <View className="flex-row items-center gap-3">
          <ActivityIndicator size="small" color="#084BA3" />
          <Text className="text-sm text-muted">Loading more...</Text>
        </View>
      </View>
    );
  }
  if (!hasMore) {
    return (
      <View className="py-8 items-center">
        <Text className="text-xs text-muted">— All caught up —</Text>
      </View>
    );
  }
  return <View className="h-4" />;
}

export function SecurityNotifications() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("activity");

  const activity = usePaginatedActivityLogs();
  const reports = usePaginatedConcerns();
  const announcements = usePaginatedAnnouncements();

  const active =
    tab === "activity" ? activity : tab === "reports" ? reports : announcements;

  const handleEndReached = useCallback(() => {
    if (active.hasNextPage && !active.isFetchingNextPage) {
      active.fetchNextPage();
    }
  }, [active]);

  const keyExtractor = useCallback(
    (item: any, index: number) => item.id ?? String(index),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (tab === "activity") {
        return (
          <View className="bg-white border border-border rounded-2xl p-4 mb-2">
            <Text className="text-navy text-sm font-medium">
              {item.description}
            </Text>
            <Text className="text-muted text-xs mt-1">
              {item.actorName} · {timeAgo(item.createdAt)}
            </Text>
          </View>
        );
      }
      if (tab === "reports") {
        return (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/notifications/report" as any,
                params: { id: item.id },
              })
            }
            className="bg-white border border-border rounded-2xl p-4 mb-2"
          >
            <View className="flex-row justify-between items-start">
              <Text
                className="text-navy text-sm font-semibold flex-1 pr-2"
                numberOfLines={1}
              >
                {item.subject}
              </Text>
              <StatusPill status={item.status} />
            </View>
            <Text className="text-muted text-xs mt-1">
              {item.resident
                ? `${item.resident.firstName ?? ""} ${item.resident.lastName ?? ""}`.trim()
                : "Resident"}{" "}
              · {timeAgo(item.createdAt)}
            </Text>
          </Pressable>
        );
      }
      // announcements
      return (
        <View className="bg-white border border-border rounded-2xl p-4 mb-2">
          <Text className="text-navy text-sm font-semibold">
            {item.subject}
          </Text>
          <Text className="text-muted text-sm mt-1" numberOfLines={2}>
            {item.body}
          </Text>
          <Text className="text-muted text-xs mt-2">
            {item.type === "security_notice"
              ? "Security Notice"
              : "Estate Update"}{" "}
            · {item.authorName} · {timeAgo(item.createdAt)}
          </Text>
        </View>
      );
    },
    [tab, router],
  );

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
        {(
          [
            ["activity", "Activity"],
            ["reports", "Reports"],
            ["announcements", "Announcements"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            className={`flex-1 h-9 rounded-2xl items-center justify-center ${
              tab === key ? "bg-[#084BA3]" : "bg-white border border-border"
            }`}
          >
            <Text
              className={`text-xs font-medium ${tab === key ? "text-white" : "text-muted"}`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {active.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1B4FD8" />
        </View>
      ) : active.isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-danger text-sm mb-2">Couldn't load</Text>
          <Pressable
            onPress={() => active.refresh()}
            className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        </View>
      ) : active.items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-muted text-sm text-center">
            {tab === "activity"
              ? "No activity recorded yet."
              : tab === "reports"
                ? "No resident reports yet."
                : "No announcements yet. Tap + New to post one."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={active.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pb-10"
          ListFooterComponent={
            <ListFooter
              isFetching={active.isFetchingNextPage}
              hasMore={active.hasNextPage}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
  };
  return (
    <View
      className={`px-2 py-0.5 rounded-full ${map[status]?.split(" ")[0] ?? "bg-gray-100"}`}
    >
      <Text
        className={`text-[10px] font-semibold capitalize ${map[status]?.split(" ")[1] ?? "text-muted"}`}
      >
        {status.replace("_", " ")}
      </Text>
    </View>
  );
}
