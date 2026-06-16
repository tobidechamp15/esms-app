import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { AlertTriangle, Bell, ChevronRight, Lock, LogOut, Settings, Shield, Upload } from '@/components/ui/Icons';
import { useAuthStore } from '@/store/authStore';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, onPress, danger }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-6 py-4 border-b border-border bg-white"
    >
      <View className="mr-4">{icon}</View>
      <Text className={`flex-1 text-base ${danger ? 'text-danger font-medium' : 'text-navy'}`}>
        {label}
      </Text>
      {!danger && <ChevronRight size={18} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const logoutUser = useAuthStore((s) => s.logoutUser);
  const [showLogout, setShowLogout] = useState(false);

  async function handleLogout() {
    setShowLogout(false);
    await logoutUser();
    router.replace('/(auth)/welcome');
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-navy">Settings</Text>
        <Text className="text-sm text-muted mt-0.5">
          Manage your account, estate details, and app preferences.
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-2">
          <SettingRow
            icon={<Settings size={22} color="#0A1628" />}
            label="Account Information"
            onPress={() => router.push('/(app)/settings/account')}
          />
          <SettingRow
            icon={<Shield size={22} color="#0A1628" />}
            label="Security"
            onPress={() => router.push('/(app)/settings/security')}
          />
          <SettingRow
            icon={<Bell size={22} color="#0A1628" />}
            label="Notifications Settings"
            onPress={() => router.push('/(app)/settings/notification-settings')}
          />
          <SettingRow
            icon={<Lock size={22} color="#0A1628" />}
            label="Legal & Privacy"
            onPress={() => router.push('/(app)/settings/legal')}
          />
          <SettingRow
            icon={<AlertTriangle size={22} color="#0A1628" />}
            label="Report a Concern"
            onPress={() => router.push('/(app)/settings/report-concern')}
          />
          <SettingRow
            icon={<Text className="text-xl">👍</Text>}
            label="Rate Our App"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Upload size={22} color="#0A1628" />}
            label="App Update"
            onPress={() => {}}
          />
          <SettingRow
            icon={<LogOut size={22} color="#DC2626" />}
            label="Logout"
            onPress={() => setShowLogout(true)}
            danger
          />
        </View>
      </ScrollView>

      {/* Logout confirm modal */}
      <Modal visible={showLogout} transparent animationType="slide" onRequestClose={() => setShowLogout(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setShowLogout(false)} />
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
          <Text className="text-xl font-bold text-navy mb-1">Log Out?</Text>
          <Text className="text-sm text-muted mb-6">Sign out of your Ventry account.</Text>
          <Pressable
            onPress={handleLogout}
            className="h-14 bg-danger rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-semibold">Log Out</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
