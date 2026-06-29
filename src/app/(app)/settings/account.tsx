import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { BackHeader, Button } from "@/components/ui";
import { Lock, Upload, X } from "@/components/ui/Icons";
import { useDeleteAccount, useUpdateProfile } from "@/hooks/useQueries";
import { useAuthStore, selectIsAdmin } from "@/store/authStore";

function Field({
  label, value, locked, editable, onChangeText,
}: {
  label: string; value: string; locked?: boolean; editable?: boolean; onChangeText?: (t: string) => void;
}) {
  return (
    <View className="px-4 py-3 border-b border-border flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-xs text-muted mb-0.5">{label}</Text>
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            className="text-base font-semibold text-navy p-0"
            placeholderTextColor="#9CA3AF"
          />
        ) : (
          <Text className="text-base font-semibold text-navy">{value || "—"}</Text>
        )}
      </View>
      {locked && !editable ? <Lock size={18} color="#9CA3AF" /> : null}
    </View>
  );
}

export default function AccountInfoScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logoutUser = useAuthStore((s) => s.logoutUser);
  const deleteAccount = useDeleteAccount();
  const updateProfile = useUpdateProfile();
  const isAdmin = useAuthStore(selectIsAdmin);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  }

  async function handleSave() {
    setError("");
    try {
      const updated = await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setUser(updated);
      setEditing(false);
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Couldn't save changes.");
    }
  }

  async function handleDelete() {
    await deleteAccount.mutateAsync();
    await logoutUser();
    router.replace("/(auth)/welcome");
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <BackHeader title="Account Information" />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        {/* Photo */}
        <Pressable onPress={editing ? pickImage : undefined} className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-white border border-border items-center justify-center overflow-hidden">
            {photo ? (
              <Image source={{ uri: photo }} className="w-24 h-24" />
            ) : (
              <Upload size={26} color="#9CA3AF" />
            )}
          </View>
          <Text className="text-sm text-muted mt-2">Click to upload image</Text>
        </Pressable>

        {/* Fields */}
        <View className="bg-white rounded-2xl border border-border overflow-hidden">
          <Field label="First Name" value={firstName} editable={editing} onChangeText={setFirstName} locked />
          <Field label="Last Name" value={lastName} editable={editing} onChangeText={setLastName} locked />
          <Field label="Phone Number" value={user.phone} locked />
          {user.houseNumber ? <Field label="House Number" value={`No. ${user.houseNumber}`} locked /> : null}
          {user.streetName ? <Field label="Street Name" value={user.streetName} locked /> : null}
        </View>

        {error ? <Text className="text-danger text-sm mt-3 text-center">{error}</Text> : null}
      </ScrollView>

      <View className="px-6 pb-6 gap-3">
        {editing ? (
          <Button label="Save Changes" onPress={handleSave} loading={updateProfile.isPending} />
        ) : (
          <Pressable
            onPress={() => setEditing(true)}
            className="h-14 rounded-2xl items-center justify-center border border-border"
          >
            <Text className="text-navy font-semibold">Edit Profile</Text>
          </Pressable>
        )}

        {!editing && (
          isAdmin ? (
            <Pressable
              onPress={() => router.push("/(app)/support")}
              className="h-14 bg-[#084BA3] rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-semibold">Transfer Admin Access</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowDelete(true)}
              className="h-14 bg-danger rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-semibold">Delete Account?</Text>
            </Pressable>
          )
        )}
      </View>

      {/* Delete confirm */}
      <Modal visible={showDelete} transparent animationType="slide" onRequestClose={() => setShowDelete(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setShowDelete(false)} />
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
          <View className="flex-row items-start justify-between">
            <Text className="text-xl font-bold text-navy">Delete Account?</Text>
            <Pressable onPress={() => setShowDelete(false)} hitSlop={10}><X size={20} color="#9CA3AF" /></Pressable>
          </View>
          <Text className="text-sm text-muted mt-1 mb-6">
            This permanently removes your account. This can't be undone.
          </Text>
          <Pressable onPress={handleDelete} className="h-14 bg-danger rounded-2xl items-center justify-center">
            <Text className="text-white font-semibold">Delete permanently</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
