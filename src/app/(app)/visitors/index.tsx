import * as Clipboard from "expo-clipboard";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { Copy, Search, ShareIcon, X } from "@/components/ui/Icons";
import VisitShareCard, {
  type VisitShareCardRef,
} from "@/components/visits/VisitShareCard";
import {
  usePaginatedPastVisits,
  usePaginatedUpcomingVisits,
  usePaginatedAllPastVisits,
  usePaginatedAllUpcomingVisits,
  useRevokeVisit,
} from "@/hooks/useQueries";
import { ESTATE_NAME } from "@/constants/api";
import { useAuthStore, selectIsSecurity } from "@/store/authStore";
import type { Visit, VisitStatus } from "@/types";

type Tab = "past" | "upcoming";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: VisitStatus): string {
  const map: Record<VisitStatus, string> = {
    scheduled: "Scheduled",
    checked_in: "Visitor Arrived",
    checked_out: "Visitor Left",
    cancelled: "Cancelled",
    expired: "Code Expired",
    revoked: "Access Removed",
  };
  return map[status];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View className="border-b border-border py-4 px-1">
      <View className="h-5 w-40 rounded-md bg-gray-200 mb-2" />
      <View className="h-3 w-56 rounded-md bg-gray-100 mb-1.5" />
      <View className="h-3 w-48 rounded-md bg-gray-100 mb-1.5" />
      <View className="h-3 w-36 rounded-md bg-gray-100" />
    </View>
  );
}

function ListSkeleton() {
  return (
    <View className="px-6 pt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

// ─── List Footer ──────────────────────────────────────────────────────────────

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
        <Text className="text-xs text-muted">— All loaded —</Text>
      </View>
    );
  }
  return <View className="h-4" />;
}

// ─── Past Card ────────────────────────────────────────────────────────────────

function PastCard({ visit }: { visit: Visit }) {
  const arrivedAt = visit.checkedInAt
    ? new Date(visit.checkedInAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <View className="border-b border-border py-4">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-base font-semibold text-navy flex-1 mr-2">
          {visit.visitorName}
        </Text>
        <View className="border border-border rounded-full px-2.5 py-1">
          <Text className="text-xs text-muted">
            {statusLabel(visit.status)}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-muted">
        Date: {formatDateShort(visit.visitDate)}
      </Text>
      {arrivedAt && (
        <Text className="text-sm text-muted">Visitor Arrived: {arrivedAt}</Text>
      )}
      <Text className="text-sm text-muted">
        Access Code:{" "}
        <Text className="font-bold text-navy">{visit.accessCode}</Text>
      </Text>
    </View>
  );
}

// ─── Upcoming Card ────────────────────────────────────────────────────────────

function UpcomingCard({
  visit,
  onRemove,
  onShare,
}: {
  visit: Visit;
  onRemove: () => void;
  onShare: () => void;
}) {
  return (
    <View className="border-b border-border py-4">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-base font-semibold text-navy flex-1 mr-2">
          {visit.visitorName}
        </Text>
        <View className="flex-row items-center gap-1 border border-border rounded-full px-2.5 py-1">
          <Text className="text-[11px] text-muted">🕐 Countdown Inactive</Text>
        </View>
      </View>
      <Text className="text-sm text-muted">
        Date: {formatDateShort(visit.visitDate)}
      </Text>
      <Text className="text-sm text-muted">
        Expected Arrival: {visit.expectedArrivalTime}
      </Text>
      <Text className="text-sm text-muted">
        Access Code:{" "}
        <Text className="font-bold text-navy">{visit.accessCode}</Text>
      </Text>

      <View className="flex-row gap-4 mt-2.5">
        <Pressable
          onPress={() => Clipboard.setStringAsync(visit.accessCode)}
          hitSlop={10}
        >
          <Copy size={20} color="#6B7280" />
        </Pressable>
        <Pressable onPress={onShare} hitSlop={10}>
          <ShareIcon size={20} color="#6B7280" />
        </Pressable>
      </View>

      <Pressable
        onPress={onRemove}
        className="mt-3 h-10 bg-danger/10 rounded-xl items-center justify-center"
      >
        <Text className="text-danger text-sm font-semibold">Remove Access</Text>
      </Pressable>
    </View>
  );
}

// ─── Remove Modal ─────────────────────────────────────────────────────────────

function RemoveModal({
  visit,
  visible,
  onClose,
  onConfirm,
  isPending,
  didRemove,
}: {
  visit: Visit | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  didRemove: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-navy">
            {didRemove ? "Access Removed" : "Remove Access"}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={20} color="#0A1628" />
          </Pressable>
        </View>
        {didRemove ? (
          <>
            <Text className="text-sm text-muted mb-6">
              The visitor's access code has been disabled and can no longer be
              used for entry.
            </Text>
            <Pressable
              onPress={onClose}
              className="h-14 border border-border rounded-2xl items-center justify-center"
            >
              <Text className="text-navy font-semibold">Done</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-sm text-muted mb-4">
              This visitor will no longer be able to use their access code to
              enter the estate.
            </Text>
            {visit && (
              <View className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-5">
                <Text className="text-xs font-bold text-primary-500 mb-1">
                  ventry
                </Text>
                <Text className="text-xs text-muted mb-0.5">Access Code</Text>
                <Text className="text-3xl font-bold text-navy tracking-widest">
                  {visit.accessCode}
                </Text>
              </View>
            )}
            <Pressable
              onPress={onConfirm}
              disabled={isPending}
              className="h-14 bg-danger rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-semibold">
                {isPending ? "Removing..." : "Remove Access"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

// ─── Visitors Screen ──────────────────────────────────────────────────────────

export default function VisitorsScreen() {
  const isSecurity = useAuthStore(selectIsSecurity);
  const { tab: initialTab } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(
    initialTab === "upcoming" ? "upcoming" : "past",
  );
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Visit | null>(null);
  const [didRemove, setDidRemove] = useState(false);
  const [sharingVisit, setSharingVisit] = useState<Visit | null>(null);
  const shareCardRef = useRef<VisitShareCardRef>(null);

  // Security sees ALL estate visits; residents see only their own
  const past = isSecurity
    ? usePaginatedAllPastVisits(search)
    : usePaginatedPastVisits(search);
  const upcoming = isSecurity
    ? usePaginatedAllUpcomingVisits()
    : usePaginatedUpcomingVisits();

  const revokeVisit = useRevokeVisit();

  function openRemove(v: Visit) {
    setRemoveTarget(v);
    setDidRemove(false);
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    await revokeVisit.mutateAsync(removeTarget.id);
    setDidRemove(true);
  }

  const handleEndReached = useCallback(() => {
    if (tab === "past") {
      if (past.hasNextPage && !past.isFetchingNextPage) past.fetchNextPage();
    } else {
      if (upcoming.hasNextPage && !upcoming.isFetchingNextPage)
        upcoming.fetchNextPage();
    }
  }, [tab, past, upcoming]);

  const active = tab === "past" ? past : upcoming;

  const renderItem = useCallback(
    ({ item }: { item: Visit }) => {
      if (tab === "past") return <PastCard visit={item} />;
      return (
        <UpcomingCard
          visit={item}
          onRemove={() => openRemove(item)}
          onShare={() => setSharingVisit(item)}
        />
      );
    },
    [tab],
  );

  const keyExtractor = useCallback((item: Visit) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-6 pt-6 pb-3">
        <Text className="text-2xl font-bold text-navy">
          {isSecurity
            ? tab === "past"
              ? "Estate Past Visits"
              : "Estate Upcoming Visits"
            : tab === "past"
              ? "Past Visitors"
              : "All Upcoming Visits"}
        </Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row px-6 gap-3 mb-4">
        {(["past", "upcoming"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setTab(t);
              setSearch("");
            }}
            className={`flex-1 h-9 rounded-2xl items-center justify-center ${
              tab === t ? "bg-[#084BA3]" : "bg-white border border-border"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                tab === t ? "text-white" : "text-muted"
              }`}
            >
              {t === "past" ? "Past Visitors" : "Upcoming"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search (past only) */}
      {tab === "past" && (
        <View className="mx-6 mb-4 h-12 flex-row items-center bg-white border border-border rounded-2xl px-3">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for any visitor's name"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-sm text-navy"
            returnKeyType="search"
          />
        </View>
      )}

      {/* Content */}
      {active.isLoading ? (
        <ListSkeleton />
      ) : active.isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-danger text-sm font-medium mb-2">
            Couldn't load visits
          </Text>
          <Pressable
            onPress={() => active.refresh()}
            className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        </View>
      ) : active.items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-muted text-sm">
            {tab === "past"
              ? search
                ? `No results for "${search}"`
                : "No past visitors yet."
              : "No upcoming visits."}
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
          contentContainerClassName="px-6 pb-8"
          ListFooterComponent={
            <ListFooter
              isFetching={active.isFetchingNextPage}
              hasMore={active.hasNextPage}
            />
          }
        />
      )}

      {/* Hidden share card */}
      {sharingVisit && (
        <VisitShareCard
          ref={shareCardRef}
          accessCode={sharingVisit.accessCode}
          qrCodeData={sharingVisit.qrCodeData}
          visitorName={sharingVisit.visitorName}
          visitDate={sharingVisit.visitDate}
          arrivalTime={sharingVisit.expectedArrivalTime}
          estateName={ESTATE_NAME}
          autoShare
          onShareComplete={() => setSharingVisit(null)}
        />
      )}

      <RemoveModal
        visit={removeTarget}
        visible={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemove}
        isPending={revokeVisit.isPending}
        didRemove={didRemove}
      />
    </SafeAreaView>
  );
}
