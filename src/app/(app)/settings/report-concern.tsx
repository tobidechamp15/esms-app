import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader, Button } from '@/components/ui';
import { Upload, X } from '@/components/ui/Icons';
import { useSubmitConcern } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/authStore';

export default function ReportConcernScreen() {
  const user = useAuthStore((s) => s.user);
  const submit = useSubmitConcern();

  const [subject, setSubject] = useState('');
  const [attachment, setAttachment] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const address = `No. ${user?.houseNumber}, ${user?.streetName}`;

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() ?? 'attachment.jpg';
      const ext = filename.split('.').pop() ?? 'jpg';
      setAttachment({
        uri: asset.uri,
        name: filename,
        type: `image/${ext}`,
      });
    }
  }

  async function handleSubmit() {
    if (!subject.trim()) return;
    await submit.mutateAsync({
      subject: subject.trim(),
      address,
      attachment: attachment ?? undefined,
    });
    setSubject('');
    setAttachment(null);
    setShowSuccess(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Report a Concern" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subject */}
          <Text className="text-sm font-medium text-navy mb-2">Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Briefly describe the issue"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="px-4 pt-4 border border-border rounded-2xl text-base text-navy bg-surface mb-5"
            style={{ minHeight: 140 }}
          />

          {/* Address (locked) */}
          <Text className="text-sm font-medium text-navy mb-2">Address</Text>
          <View className="h-14 px-4 border border-border rounded-2xl flex-row items-center justify-between bg-surface mb-5">
            <Text className="text-base text-navy flex-1">{address}</Text>
            <Text className="text-lg">🔒</Text>
          </View>

          {/* Attachment */}
          <Text className="text-sm font-medium text-navy mb-2">
            Attachment (Optional)
          </Text>
          {attachment ? (
            <View className="border border-border rounded-2xl p-3 mb-5 flex-row items-center gap-3">
              <Image
                source={{ uri: attachment.uri }}
                className="w-16 h-16 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-navy" numberOfLines={1}>
                  {attachment.name}
                </Text>
                <Text className="text-xs text-muted mt-0.5">Tap to change</Text>
              </View>
              <Pressable
                onPress={() => setAttachment(null)}
                hitSlop={10}
                className="p-1"
              >
                <X size={18} color="#6B7280" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickImage}
              className="border border-dashed border-border rounded-2xl p-5 mb-5 items-center gap-2"
            >
              <Upload size={28} color="#9CA3AF" />
              <Text className="text-sm font-medium text-navy">
                Click to upload
              </Text>
              <Text className="text-xs text-muted">
                PNG, JPG or GIF (max. 5MB)
              </Text>
            </Pressable>
          )}

          <View className="h-4" />
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            label="Submit Report"
            onPress={handleSubmit}
            disabled={!subject.trim()}
            loading={submit.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Success modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuccess(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setShowSuccess(false)}
        />
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-navy">Report Submitted</Text>
            <Pressable onPress={() => setShowSuccess(false)} hitSlop={12}>
              <X size={20} color="#0A1628" />
            </Pressable>
          </View>
          <Text className="text-sm text-muted mb-6">
            Your concern has been sent to the estate security team. They will
            review it and take appropriate action if needed.
          </Text>
          <Pressable
            onPress={() => setShowSuccess(false)}
            className="h-14 border border-border rounded-2xl items-center justify-center"
          >
            <Text className="text-navy font-semibold">Done</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
