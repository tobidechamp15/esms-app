import { Tabs } from "expo-router";
import { Text, View } from "react-native";

import {
  Bell,
  Home,
  PlusCircle,
  QrCode,
  Settings,
  Shield,
  Users,
} from "@/components/ui/Icons";
import { useUnreadCount } from "@/hooks/useQueries";
import { useAuthStore, selectIsSecurity } from "@/store/authStore";

interface TabIconProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  focused: boolean;
  label: string;
  badge?: number;
}

function TabIcon({ icon: Icon, focused, label, badge }: TabIconProps) {
  const color = focused ? "#1B4FD8" : "#9CA3AF";
  return (
    <View className="items-center justify-center pt-1 relative w-full">
      <View>
        <Icon size={22} color={color} />
        {typeof badge === "number" && (
          <View
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center ${
              badge > 0 ? "bg-danger" : "bg-primary"
            }`}
          >
            <Text className="text-white text-[9px] font-bold">
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={{ includeFontPadding: false }}
        className={`text-[10px] mt-0.5 text-center ${
          focused ? "text-primary-500 font-semibold" : "text-muted"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const isSecurity = useAuthStore(selectIsSecurity);

  // `href: null` removes a screen from the tab bar (route still exists).
  const residentOnly = isSecurity ? null : undefined;
  const securityOnly = isSecurity ? undefined : null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 2,
          borderTopColor: "#E8E9EE",
          backgroundColor: "#fff",
          elevation: 9,
          shadowColor: "#161416",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.09,
          shadowRadius: 9,
        },
        tabBarItemStyle: { paddingHorizontal: 2 },
        tabBarShowLabel: false,
      }}
    >
      {/* ── Resident Home ───────────────────────────── */}
      <Tabs.Screen
        name="home/index"
        options={{
          href: residentOnly === null ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home} focused={focused} label="Home" />
          ),
        }}
      />
      {/* ── Security Home (Verify) ──────────────────── */}
      <Tabs.Screen
        name="verify/index"
        options={{
          href: securityOnly === null ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={QrCode} focused={focused} label="Verify" />
          ),
        }}
      />
      {/* ── Visitors (shared) ───────────────────────── */}
      <Tabs.Screen
        name="visitors/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Users} focused={focused} label="Visitors" />
          ),
        }}
      />
      {/* ── Resident Generate ───────────────────────── */}
      <Tabs.Screen
        name="generate/index"
        options={{
          href: residentOnly === null ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={PlusCircle} focused={focused} label="Generate" />
          ),
        }}
      />
      {/* ── Security Support ────────────────────────── */}
      <Tabs.Screen
        name="support/index"
        options={{
          href: securityOnly === null ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Shield} focused={focused} label="Support" />
          ),
        }}
      />
      {/* ── Notifications (shared) ──────────────────── */}
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
      {/* ── Settings (shared) ───────────────────────── */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Settings} focused={focused} label="Settings" />
          ),
        }}
      />

      {/* Hidden sub-screens */}
      <Tabs.Screen name="notifications/announce" options={{ href: null }} />
      <Tabs.Screen name="notifications/report" options={{ href: null }} />
      <Tabs.Screen name="panic/index" options={{ href: null }} />
      <Tabs.Screen name="verify/result" options={{ href: null }} />
      <Tabs.Screen name="verify/scan" options={{ href: null }} />
      <Tabs.Screen name="support/manage" options={{ href: null }} />
      <Tabs.Screen
        name="support/generate-activation"
        options={{ href: null }}
      />
      <Tabs.Screen name="settings/account" options={{ href: null }} />
      <Tabs.Screen name="settings/security" options={{ href: null }} />
      <Tabs.Screen
        name="settings/notification-settings"
        options={{ href: null }}
      />
      <Tabs.Screen name="settings/legal" options={{ href: null }} />
      <Tabs.Screen name="settings/report-concern" options={{ href: null }} />
    </Tabs>
  );
}
