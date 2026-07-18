import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMarkRead, usePaginatedNotifications } from "@/hooks/useQueries";
import { useAuthStore, selectIsSecurity } from "@/store/authStore";
import { SecurityNotifications } from "@/components/security/SecurityNotifications";
import type { AppNotification } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days >= 7)
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days > 1) return `${days} days ago`;
  if (days === 1) return "Yesterday";
  if (hrs > 0) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} min ago`;
  return "Just now";
}

function typeLabel(type: AppNotification["type"]): string {
  switch (type) {
    case "security_notice":
      return "Security Notice";
    case "estate_update":
      return "Estate Update";
    case "visitor_alert":
      return "Visitor Alert";
  }
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  onRead,
}: {
  notif: AppNotification;
  onRead: () => void;
}) {
  return (
    <Pressable
      onPress={!notif.isRead ? onRead : undefined}
      className={`px-6 py-4 border-b border-border ${
        !notif.isRead ? "bg-primary-50/60" : "bg-white"
      }`}
    >
      <View className="flex-row justify-between items-start mb-1.5">
        <Text className="text-sm font-bold text-navy flex-1 mr-3">
          {typeLabel(notif.type)}
        </Text>
        <Text className="text-xs text-muted">{timeAgo(notif.createdAt)}</Text>
      </View>
      <Text className="text-sm text-muted leading-5">{notif.body}</Text>

      {/* Unread dot */}
      {!notif.isRead && (
        <View className="absolute top-4 right-5 w-2 h-2 rounded-full bg-[#084BA3]" />
      )}
    </Pressable>
  );
}

// ─── Skeleton Component ───────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View className="px-6 py-4 border-b border-border bg-white">
      {/* Title skeleton */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="h-4 w-28 rounded-md bg-gray-200" />
        <View className="h-3 w-16 rounded-md bg-gray-100" />
      </View>
      {/* Body skeleton — 2 lines */}
      <View className="h-3 w-full rounded-md bg-gray-100 mb-2" />
      <View className="h-3 w-3/4 rounded-md bg-gray-100" />
    </View>
  );
}

function NotificationSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-36 rounded-md bg-gray-200" />
          <View className="h-5 w-6 rounded-full bg-gray-200" />
        </View>
        <View className="h-3 w-64 rounded-md bg-gray-100 mt-3" />
      </View>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

// ─── Footer (loading more indicator) ──────────────────────────────────────────

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

// ─── Notifications Screen ─────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const isSecurity = useAuthStore(selectIsSecurity);
  if (isSecurity) return <SecurityNotifications />;
  return <ResidentNotifications />;
}

function ResidentNotifications() {
  const {
    items: notifications,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refresh,
    isError,
  } = usePaginatedNotifications();
  const markRead = useMarkRead();

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotifCard notif={item} onRead={() => markRead.mutate(item.id)} />
    ),
    [markRead],
  );

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  // Initial loading skeleton
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl font-bold text-navy">Notifications</Text>
          {unread > 0 && (
            <View className="bg-[#084BA3] rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-bold">{unread}</Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-muted mt-1">
          Stay updated with important notices from estate management and
          security.
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-3">🔔</Text>
          <Text className="text-base font-semibold text-navy mb-1">
            No notifications yet
          </Text>
          <Text className="text-sm text-muted text-center px-8">
            Estate updates and security notices will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          onRefresh={refresh}
          refreshing={false}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <ListFooter isFetching={isFetchingNextPage} hasMore={hasNextPage} />
          }
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}

      {isError && notifications.length === 0 && (
        <View className="absolute inset-0 items-center justify-center bg-white/80">
          <Text className="text-danger text-sm font-medium mb-2">
            Couldn't load notifications
          </Text>
          <Pressable
            onPress={() => refresh()}
            className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
