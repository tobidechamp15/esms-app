import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/authStore";

export default function PendingApprovalScreen() {
  const theme = useTheme();
  const { logoutUser, user, refreshProfile, isLoading } = useAuthStore();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    inner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Spacing.four,
    },
    icon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: "#FFF3CD",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: Spacing.four,
    },
    iconText: { fontSize: 40 },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
      marginBottom: Spacing.two,
    },
    body: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: Spacing.five,
    },
    name: { color: theme.text, fontWeight: "600" },
    unit: { color: "#3C9FFE", fontWeight: "600" },
    primaryBtn: {
      backgroundColor: "#3C9FFE",
      borderRadius: Spacing.two,
      paddingVertical: 14,
      paddingHorizontal: Spacing.six,
      alignItems: "center",
      marginBottom: Spacing.three,
      minWidth: 200,
    },
    primaryBtnDisabled: { opacity: 0.6 },
    primaryBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
    secondaryBtn: { paddingVertical: 10 },
    secondaryBtnText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "600",
    },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        <View style={s.icon}>
          <Text style={s.iconText}>⏳</Text>
        </View>

        <Text style={s.title}>Awaiting Approval</Text>
        <Text style={s.body}>
          Hi <Text style={s.name}>{user?.name}</Text>! Your account
          {user?.role === "resident" && user?.unitNumber ? (
            <>
              {" "}
              for unit <Text style={s.unit}>{user.unitNumber}</Text>
            </>
          ) : null}{" "}
          is pending review by the estate administrator.{"\n\n"}
          You&apos;ll receive a notification once your account is approved. This
          usually takes 24–48 hours.
        </Text>

        <Pressable
          style={[s.primaryBtn, isLoading && s.primaryBtnDisabled]}
          onPress={() => refreshProfile()}
          disabled={isLoading}
        >
          <Text style={s.primaryBtnText}>
            {isLoading ? "Checking…" : "Check status"}
          </Text>
        </Pressable>

        <Pressable style={s.secondaryBtn} onPress={() => logoutUser()}>
          <Text style={s.secondaryBtnText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
