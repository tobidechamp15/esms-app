import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/use-theme';

function TabBarIcon({
  iosName,
  androidName,
  color,
}: {
  iosName: SFSymbol;
  androidName: string;
  color: string | { toString(): string };
}) {
  return (
    <SymbolView
      name={{ ios: iosName, android: androidName as any, web: androidName as any }}
      tintColor={String(color)}
      size={24}
    />
  );
}

export default function AppLayout() {
  const { user, tokens, isPinSet, isPinVerified } = useAuthStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const isAuthenticated = Boolean(user && tokens);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (isPinSet && !isPinVerified) return <Redirect href="/(auth)/pin-unlock" />;
  if (user?.status === 'pending') return <Redirect href="/(auth)/pending-approval" />;

  const isSecurityOrAdmin = user?.role === 'security' || user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3C9FFE',
        tabBarInactiveTintColor: String(theme.textSecondary),
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: String(theme.background),
            borderTopColor: String(theme.backgroundElement),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            height: Platform.OS === 'ios' ? 80 + insets.bottom : 64,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabBarIcon iosName="house.fill" androidName="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="visits/index"
        options={{
          title: 'Visits',
          tabBarIcon: ({ color }) => (
            <TabBarIcon iosName="person.2.fill" androidName="people" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="visits/create"
        options={{
          title: 'Invite',
          tabBarIcon: ({ color }) => (
            <TabBarIcon iosName="plus.circle.fill" androidName="add_circle" color={color} />
          ),
          href: isSecurityOrAdmin ? null : '/(app)/visits/create',
        }}
      />
      <Tabs.Screen
        name="visits/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="scanner/index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => (
            <TabBarIcon iosName="qrcode.viewfinder" androidName="qr_code_scanner" color={color} />
          ),
          href: isSecurityOrAdmin ? '/(app)/scanner' : null,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabBarIcon iosName="person.circle.fill" androidName="account_circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
