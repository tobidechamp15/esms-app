import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { Search } from "@/components/ui/Icons";
import { listUsers } from "@/api/security";
import { useAuthStore, selectIsAdmin } from "@/store/authStore";

type Tab = "resident" | "security";

export default function SupportScreen() {
  const router = useRouter();
  const isAdmin = useAuthStore(selectIsAdmin);
  const [tab, setTab] = useState<Tab>("resident");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["directory", tab, search],
    queryFn: () => listUsers({ role: tab, search }),
    staleTime: 30_000,
  });

  const users = data?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="px-6 pt-6 pb-3">
        <Text className="text-2xl font-bold text-navy">Support</Text>
        <Text className="text-sm text-muted mt-1">
          Manage residents and security personnel within the estate.
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 gap-3 mb-4">
        {(["resident", "security"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 h-9 rounded-2xl items-center justify-center ${
              tab === t ? "bg-[#084BA3]" : "bg-white border border-border"
            }`}
          >
            <Text className={`text-sm font-medium ${tab === t ? "text-white" : "text-muted"}`}>
              {t === "resident" ? "Estate Residents" : "Estate Security"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Generate activation code (security tab, any active security) */}
      {tab === "security" && (
        <View className="px-6 mb-4">
          <Pressable
            onPress={() => router.push("/(app)/support/generate-activation")}
            className="h-12 rounded-2xl items-center justify-center bg-primary-50 border border-primary-200"
          >
            <Text className="text-primary-600 text-sm font-semibold">
              Generate Security Activation Code
            </Text>
          </Pressable>
        </View>
      )}

      {/* Search */}
      <View className="mx-6 mb-4 h-12 flex-row items-center bg-white border border-border rounded-2xl px-3">
        <Search size={18} color="#9CA3AF" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for any name"
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-sm text-navy"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1B4FD8" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-danger text-sm mb-2">Couldn't load the directory</Text>
          <Pressable onPress={() => refetch()} className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center">
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
          {users.length === 0 ? (
            <Text className="text-muted text-sm text-center mt-8">No {tab}s found.</Text>
          ) : (
            users.map((u) => (
              <Pressable
                key={u.id}
                onPress={() =>
                  router.push({ pathname: "/(app)/support/manage", params: { id: u.id, role: tab } })
                }
                className="bg-white border border-border rounded-2xl p-4 mb-3 flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-navy font-semibold">
                    {u.firstName} {u.lastName}
                  </Text>
                  <Text className="text-muted text-xs mt-0.5">{u.phone}</Text>
                </View>
                <Text className="text-primary-600 text-sm font-medium">Manage Account</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
