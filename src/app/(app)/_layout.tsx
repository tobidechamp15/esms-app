import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

import { Bell, Home, PlusCircle, Settings, Users } from '@/components/ui/Icons';
import { useUnreadCount } from '@/hooks/useQueries';

interface TabIconProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  focused: boolean;
  label: string;
  badge?: number;
}

function TabIcon({ icon: Icon, focused, label, badge }: TabIconProps) {
  const color = focused ? '#1B4FD8' : '#9CA3AF';
  return (
    <View className="items-center pt-1 relative">
      <View>
        <Icon size={22} color={color} />
        {badge && badge > 0 ? (
          <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger items-center justify-center">
            <Text className="text-white text-[9px] font-bold">
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        className={`text-[10px] mt-0.5 ${
          focused ? 'text-primary-500 font-semibold' : 'text-muted'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 68,
          paddingBottom: 10,
          paddingTop: 4,
          borderTopColor: '#E8E9EE',
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="visitors/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Users} focused={focused} label="Visitors" />
          ),
        }}
      />
      <Tabs.Screen
        name="generate/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={PlusCircle} focused={focused} label="Generate" />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={Bell}
              focused={focused}
              label="Alerts"
              badge={unreadCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Settings} focused={focused} label="Settings" />
          ),
        }}
      />
      {/* Hide settings sub-screens from tab bar */}
      <Tabs.Screen name="settings/account" options={{ href: null }} />
      <Tabs.Screen name="settings/security" options={{ href: null }} />
      <Tabs.Screen name="settings/notification-settings" options={{ href: null }} />
      <Tabs.Screen name="settings/legal" options={{ href: null }} />
      <Tabs.Screen name="settings/report-concern" options={{ href: null }} />
    </Tabs>
  );
}
