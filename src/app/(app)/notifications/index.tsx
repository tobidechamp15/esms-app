import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMarkRead, useNotifications } from "@/hooks/useQueries";
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

// ─── Notifications Screen ─────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1B4FD8" />
        </View>
      ) : notifications.length === 0 ? (
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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {notifications.map((n) => (
            <NotifCard
              key={n.id}
              notif={n}
              onRead={() => markRead.mutate(n.id)}
            />
          ))}
          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
