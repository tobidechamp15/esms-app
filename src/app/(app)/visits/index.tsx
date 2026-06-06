import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { VisitCard } from "@/components/ui/VisitCard";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";
import { useVisitStore } from "@/store/visitStore";
import type { VisitStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: VisitStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Active", value: "checked_in" },
  { label: "Done", value: "checked_out" },
  { label: "Cancelled", value: "cancelled" },
];

export default function VisitsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    visits,
    isLoading,
    isFetching,
    pagination,
    fetchVisits,
    fetchAllVisits,
  } = useVisitStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "all">("all");

  const isSecurityOrAdmin = user?.role === "security" || user?.role === "admin";

  const load = (replace = true) => {
    const params = {
      page: replace ? 1 : pagination.page + 1,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: search.trim() || undefined,
    };
    return isSecurityOrAdmin
      ? fetchAllVisits(params, replace)
      : fetchVisits(params, replace);
  };

  useEffect(() => {
    load(true);
  }, [statusFilter]);

  function handleEndReached() {
    if (pagination.hasMore && !isFetching) load(false);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View
        style={[styles.header, { borderBottomColor: theme.backgroundElement }]}
      >
        <Text style={[styles.title, { color: theme.text }]}>Visits</Text>
        {!isSecurityOrAdmin && (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push("/(app)/visits/create")}
          >
            <Text style={styles.addBtnText}>+ New</Text>
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by visitor name…"
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load(true)}
          returnKeyType="search"
        />
      </View>

      {/* Status filter pills */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.filterPill,
              { backgroundColor: theme.backgroundElement },
              statusFilter === item.value && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter(item.value)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: theme.textSecondary },
                statusFilter === item.value && styles.filterPillTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {/* List */}
      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => load(true)} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color="#3C9FFE"
              style={{ marginTop: Spacing.six }}
            />
          ) : (
            <EmptyState
              emoji="📋"
              title="No visits found"
              subtitle="Try adjusting your filters or search."
            />
          )
        }
        ListFooterComponent={
          isFetching ? (
            <ActivityIndicator
              color="#3C9FFE"
              style={{ marginVertical: Spacing.three }}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <VisitCard
            visit={item}
            onPress={() => router.push(`/(app)/visits/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 24, fontWeight: "700" },
  addBtn: {
    backgroundColor: "#3C9FFE",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  searchContainer: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  searchInput: { paddingVertical: 10, fontSize: 15 },
  filterList: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterPillActive: { backgroundColor: "#3C9FFE" },
  filterPillText: { fontSize: 13, fontWeight: "600" },
  filterPillTextActive: { color: "#fff" },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
});
