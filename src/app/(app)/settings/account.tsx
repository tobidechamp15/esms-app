import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BackHeader, Button } from '@/components/ui';
import { Lock, X } from '@/components/ui/Icons';
import { useDeleteAccount } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/authStore';

function InfoRow({ label, value, locked }: { label: string; value: string; locked?: boolean }) {
  return (
    <View className="px-4 py-3 border-b border-border flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-xs text-muted mb-0.5">{label}</Text>
        <Text className="text-base font-semibold text-navy">{value}</Text>
      </View>
      {locked && <Lock size={18} color="#9CA3AF" />}
    </View>
  );
}

export default function AccountInfoScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logoutUser = useAuthStore((s) => s.logoutUser);
  const deleteAccount = useDeleteAccount();
  const [showDelete, setShowDelete] = useState(false);

  async function handleDelete() {
    await deleteAccount.mutateAsync();
    await logoutUser();
    router.replace('/(auth)/welcome');
  }

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <BackHeader title="Account Information" />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-border overflow-hidden">
          <InfoRow label="First Name" value={user.firstName} />
          <InfoRow label="Last Name" value={user.lastName} />
          <InfoRow label="Phone Number" value={user.phone} locked />
          <InfoRow label="House Number" value={`No. ${user.houseNumber}`} locked />
          <InfoRow label="Street Name" value={user.streetName} locked />
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Pressable
          onPress={() => setShowDelete(true)}
          className="h-14 bg-danger rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-semibold">Delete Account?</Text>
        </Pressable>
      </View>

      {/* Delete confirm */}
      <Modal visible={showDelete} transparent animationType="slide" onRequestClose={() => setShowDelete(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setShowDelete(false)} />
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-navy">Delete Account?</Text>
            <Pressable onPress={() => setShowDelete(false)} hitSlop={12}><X size={20} /></Pressable>
          </View>
          <Text className="text-sm text-muted mb-6">
            Your account and all your data will be permanently removed. This action cannot be undone.
          </Text>
          <Pressable
            onPress={handleDelete}
            className="h-14 bg-danger rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-semibold">
              {deleteAccount.isPending ? 'Deleting...' : 'Delete Account?'}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
