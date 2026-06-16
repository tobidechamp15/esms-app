import { Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/ui';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useQueries';

export default function NotificationSettingsScreen() {
  const { data: prefs } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  function toggle(key: 'pushNotifications' | 'appUpdates', value: boolean) {
    updatePrefs.mutate({ [key]: value });
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <BackHeader title="Notifications Settings" />

      <View className="mx-6 mt-6 bg-white rounded-2xl border border-border overflow-hidden">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
          <View className="flex-1 mr-4">
            <Text className="text-base font-semibold text-navy">Push Notifications</Text>
            <Text className="text-xs text-muted mt-0.5">
              Receive alerts, visitor updates, and estate notices.
            </Text>
          </View>
          <Switch
            value={prefs?.pushNotifications ?? false}
            onValueChange={(v) => toggle('pushNotifications', v)}
            trackColor={{ true: '#1B4FD8' }}
          />
        </View>

        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-1 mr-4">
            <Text className="text-base font-semibold text-navy">App Updates</Text>
            <Text className="text-xs text-muted mt-0.5">
              Get notified about new features, improvements, and updates.
            </Text>
          </View>
          <Switch
            value={prefs?.appUpdates ?? false}
            onValueChange={(v) => toggle('appUpdates', v)}
            trackColor={{ true: '#1B4FD8' }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
