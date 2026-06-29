import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button } from "@/components/ui";
import { ChevronRight } from "@/components/ui/Icons";
import { SuccessSheet } from "@/components/ui/SuccessSheet";
import { useCreateAnnouncement } from "@/hooks/useQueries";
import type { AnnouncementType } from "@/api/security";

const TYPES: { key: AnnouncementType; label: string }[] = [
  { key: "estate_update", label: "Estate Update" },
  { key: "security_notice", label: "Security Notice" },
];

export default function AnnounceScreen() {
  const router = useRouter();
  const create = useCreateAnnouncement();

  const [type, setType] = useState<AnnouncementType | null>(null);
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [published, setPublished] = useState(false);

  const valid = Boolean(type) && subject.trim().length >= 2;

  async function handlePost() {
    if (!type) return;
    setError("");
    try {
      // subject doubles as the announcement body per the single-field Figma design
      await create.mutateAsync({
        type,
        subject: subject.trim(),
        body: subject.trim(),
      });
      setPublished(true);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ??
          "Couldn't publish announcement.",
      );
    }
  }

  const typeLabel = TYPES.find((t) => t.key === type)?.label;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Create Announcement" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type dropdown */}
          <Text className="text-sm text-muted mb-2">Announcement Type</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="h-14 px-4 border border-border rounded-2xl bg-surface flex-row items-center justify-between mb-5"
          >
            <Text
              className={
                typeLabel ? "text-navy text-base" : "text-muted text-base"
              }
            >
              {typeLabel ?? "Select announcement type"}
            </Text>
            <View style={{ transform: [{ rotate: "90deg" }] }}>
              <ChevronRight size={18} />
            </View>
          </Pressable>

          {/* Single Subject textarea */}
          <Text className="text-sm text-muted mb-2">Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Write your announcement here…"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            className="min-h-[200px] p-4 border border-border rounded-2xl text-base text-navy bg-surface"
          />

          {error ? (
            <Text className="text-danger text-sm mt-3">{error}</Text>
          ) : null}
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            label="Publish Announcement"
            onPress={handlePost}
            disabled={!valid}
            loading={create.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Type picker sheet */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setPickerOpen(false)}
        />
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
          <Text className="text-lg font-bold text-navy mb-4">
            Announcement Type
          </Text>
          {TYPES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => {
                setType(t.key);
                setPickerOpen(false);
              }}
              className="h-14 rounded-2xl border border-border items-start justify-center px-4 mb-2"
            >
              <Text className="text-navy text-base">{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Published success sheet */}
      <SuccessSheet
        visible={published}
        title="Announcement Published"
        message="Your announcement has been shared with all residents."
        onClose={() => {
          setPublished(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
