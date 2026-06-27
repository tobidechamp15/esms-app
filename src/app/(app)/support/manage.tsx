import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { BackHeader } from "@/components/ui";
import { CodeRevealModal } from "@/components/security/CodeRevealModal";
import { PinConfirmModal } from "@/components/security/PinConfirmModal";
import {
  listUsers,
  type GeneratedCode,
  type AccountStatusAction,
} from "@/api/security";
import {
  useGenerateResetCode,
  useUpdateAccountStatus,
  useActivityLogs,
} from "@/hooks/useQueries";
import { useAuthStore } from "@/store/authStore";

type PendingAction = {
  action: AccountStatusAction;
  label: string;
  danger?: boolean;
};

export default function ManageAccountScreen() {
  const { id, role } = useLocalSearchParams<{
    id: string;
    role: "resident" | "security";
  }>();
  const selfId = useAuthStore((s) => s.user?.id);
  const isSelf = id === selfId;

  // Pull the user record from the directory cache/endpoint.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["manage-user", id],
    queryFn: () => listUsers({ role, page: 1, limit: 100 }),
    staleTime: 30_000,
  });
  const user = data?.data.find((u) => u.id === id);

  const resetCode = useGenerateResetCode();
  const accountStatus = useUpdateAccountStatus();
  const isSecurityTarget = role === "security";
  const activity = useActivityLogs(isSecurityTarget ? id : undefined);

  const [codeModal, setCodeModal] = useState<GeneratedCode | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [pinError, setPinError] = useState("");

  async function handleResetCode() {
    setPinError("");
    try {
      const result = await resetCode.mutateAsync(id);
      setCodeModal(result);
    } catch {
      /* surfaced via toast elsewhere */
    }
  }

  async function handleConfirmAction(pin: string) {
    if (!pending) return;
    setPinError("");
    try {
      await accountStatus.mutateAsync({
        userId: id,
        action: pending.action,
        pin,
      });
      setPending(null);
      refetch();
    } catch (err) {
      setPinError(
        (err as { message?: string })?.message ??
          "Action failed. Check your PIN.",
      );
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <BackHeader title="Manage Account" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1B4FD8" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !user) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <BackHeader title="Manage Account" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-danger text-sm mb-2">
            Couldn't load this account
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="h-9 px-4 rounded-xl bg-[#084BA3] items-center justify-center"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor =
    user.status === "active"
      ? "text-green-600"
      : user.status === "suspended"
        ? "text-danger"
        : user.status === "pending"
          ? "text-amber-600"
          : "text-muted";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <BackHeader title="Manage Account" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View className="bg-white border border-border rounded-2xl p-5 mt-4">
          <Text className="text-xl font-bold text-navy">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-sm text-muted mt-1">{user.phone}</Text>
          <View className="flex-row items-center gap-3 mt-3">
            <Text className={`text-xs font-semibold capitalize ${statusColor}`}>
              ● {user.status}
            </Text>
            <Text className="text-xs text-muted capitalize">
              {user.role}
              {user.isAdmin ? " · admin" : ""}
            </Text>
          </View>
          {role === "resident" && (user.houseNumber || user.streetName) ? (
            <Text className="text-xs text-muted mt-2">
              No. {user.houseNumber}, {user.streetName}
            </Text>
          ) : null}
        </View>

        {/* Actions */}
        <Text className="text-sm font-semibold text-navy mt-6 mb-3">
          Actions
        </Text>

        {/* Reset PIN code — not allowed for self */}
        <ActionRow
          label={`Reset ${role === "security" ? "Security" : "Resident"} PIN Code`}
          hint={
            isSelf
              ? "You can't generate a code for your own account"
              : "Generates a 4-digit reset code (5 min)"
          }
          disabled={isSelf || resetCode.isPending}
          loading={resetCode.isPending}
          onPress={handleResetCode}
        />

        {/* Suspend / Reactivate */}
        {user.status === "suspended" ? (
          <ActionRow
            label="Reactivate Account"
            hint="Restore access to this account"
            disabled={isSelf}
            onPress={() =>
              setPending({ action: "reactivate", label: "Reactivate Account" })
            }
          />
        ) : (
          <ActionRow
            label="Suspend Account"
            hint={
              isSelf
                ? "You can't suspend your own account"
                : "Temporarily disable access"
            }
            disabled={isSelf || user.isAdmin}
            onPress={() =>
              setPending({
                action: "suspend",
                label: "Suspend Account",
                danger: true,
              })
            }
          />
        )}

        {/* Delete */}
        <ActionRow
          label="Delete Account"
          hint={
            user.isAdmin
              ? "Transfer admin before deleting"
              : "Permanently remove this account"
          }
          danger
          disabled={isSelf || user.isAdmin}
          onPress={() =>
            setPending({
              action: "delete",
              label: "Delete Account",
              danger: true,
            })
          }
        />

        {/* Activity log (security targets only) */}
        {isSecurityTarget && (
          <>
            <Text className="text-sm font-semibold text-navy mt-7 mb-3">
              Activity Log
            </Text>
            {activity.isLoading ? (
              <ActivityIndicator color="#1B4FD8" />
            ) : (activity.data?.data?.length ?? 0) === 0 ? (
              <Text className="text-muted text-sm">
                No recorded activity yet.
              </Text>
            ) : (
              activity.data!.data.map((item) => (
                <View
                  key={item.id}
                  className="bg-white border border-border rounded-2xl p-4 mb-2"
                >
                  <Text className="text-navy text-sm font-medium">
                    {item.description}
                  </Text>
                  <Text className="text-muted text-xs mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <CodeRevealModal
        visible={Boolean(codeModal)}
        title="Reset Code"
        subtitle={`Share this code with ${user.firstName} in person, after verifying their identity. Shown once.`}
        code={codeModal?.code}
        expiresAt={codeModal?.expiresAt}
        onClose={() => setCodeModal(null)}
      />

      <PinConfirmModal
        visible={Boolean(pending)}
        title={pending?.label ?? ""}
        message={`Confirm to ${pending?.label.toLowerCase()} for ${user.firstName} ${user.lastName}.`}
        danger={pending?.danger}
        loading={accountStatus.isPending}
        error={pinError}
        onCancel={() => {
          setPending(null);
          setPinError("");
        }}
        onConfirm={handleConfirmAction}
      />
    </SafeAreaView>
  );
}

function ActionRow({
  label,
  hint,
  danger,
  disabled,
  loading,
  onPress,
}: {
  label: string;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={`bg-white border rounded-2xl p-4 mb-3 flex-row items-center justify-between ${
        disabled
          ? "border-border opacity-50"
          : danger
            ? "border-red-200"
            : "border-border"
      }`}
    >
      <View className="flex-1 pr-3">
        <Text
          className={`text-sm font-semibold ${danger ? "text-danger" : "text-navy"}`}
        >
          {label}
        </Text>
        {hint ? (
          <Text className="text-xs text-muted mt-0.5">{hint}</Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color="#1B4FD8" />
      ) : (
        <Text
          className={`text-lg ${danger ? "text-danger" : "text-primary-500"}`}
        >
          ›
        </Text>
      )}
    </Pressable>
  );
}
