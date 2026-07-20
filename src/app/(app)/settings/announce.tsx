import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackHeader, Button } from "@/components/ui";
import { useCreateAnnouncement } from "@/hooks/useQueries";
import type { AnnouncementType } from "@/api/security";

export default function AnnounceScreen() {
  const router = useRouter();
  const create = useCreateAnnouncement();

  const [type, setType] = useState<AnnouncementType>("estate_update");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const valid = subject.trim().length >= 2 && body.trim().length >= 2;

  async function handlePost() {
    setError("");
    try {
      await create.mutateAsync({
        type,
        subject: subject.trim(),
        body: body.trim(),
      });
      router.push("/(app)/notifications");
    } catch (err) {
      setError(
        (err as { message?: string })?.message ??
          "Couldn't publish announcement.",
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="New Announcement" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm font-medium text-navy mb-2">Type</Text>
          <View className="flex-row gap-3 mb-5">
            {(
              [
                ["estate_update", "Estate Update"],
                ["security_notice", "Security Notice"],
              ] as [AnnouncementType, string][]
            ).map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => setType(key)}
                className={`flex-1 h-11 rounded-2xl items-center justify-center ${
                  type === key
                    ? "bg-[#084BA3]"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${type === key ? "text-white" : "text-muted"}`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-sm font-medium text-navy mb-2">Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Announcement subject"
            placeholderTextColor="#9CA3AF"
            className="h-14 px-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          <Text className="text-sm font-medium text-navy mb-2">Message</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write your announcement…"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            className="min-h-[140px] p-4 border border-border rounded-2xl text-base text-navy bg-surface mb-4"
          />

          {error ? <Text className="text-danger text-sm">{error}</Text> : null}
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
    </SafeAreaView>
  );
}
