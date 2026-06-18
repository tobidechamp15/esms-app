import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Clock, Copy, Share, X } from '@/components/ui/Icons';
import { useRevokeVisit, useTodayStats, useTodayVisits } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/authStore';
import type { Visit } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function countdownLabel(expiresAt: string): { label: string; urgent: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: 'Expired', urgent: true };
  const totalSecs = Math.floor(diff / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return { label: `${hrs}h ${mins % 60}m`, urgent: false };
  return {
    label: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
    urgent: mins < 15,
  };
}

// ─── Visit Card ───────────────────────────────────────────────────────────────

function VisitCard({
  visit,
  onRemove,
  onShare,
}: {
  visit: Visit;
  onRemove: () => void;
  onShare: () => void;
}) {
  const { label, urgent } = countdownLabel(visit.expiresAt);

  return (
    <View className="border-b border-border pb-4 mb-4">
      <View className="flex-row justify-between items-start mb-1.5">
        <Text className="text-base font-semibold text-navy flex-1 mr-2">
          {visit.visitorName}
        </Text>
        <View
          className={`flex-row items-center gap-1 px-2 py-1 rounded-full border ${
            urgent
              ? 'border-warning/40 bg-warning/10'
              : 'border-success/40 bg-success/10'
          }`}
        >
          <Clock size={11} color={urgent ? '#D97706' : '#16A34A'} />
          <Text
            className={`text-[11px] font-medium ${
              urgent ? 'text-warning' : 'text-success'
            }`}
          >
            Code expires in {label}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-muted">
        Date: {formatDateShort(visit.visitDate)}
      </Text>
      <Text className="text-sm text-muted">
        Expected Arrival: {visit.expectedArrivalTime}
      </Text>
      <Text className="text-sm text-muted">
        Access Code:{' '}
        <Text className="font-bold text-navy">{visit.accessCode}</Text>
      </Text>

      <View className="flex-row items-center gap-4 mt-3">
        <Pressable
          onPress={() => Clipboard.setStringAsync(visit.accessCode)}
          hitSlop={10}
        >
          <Copy size={20} color="#6B7280" />
        </Pressable>
        <Pressable onPress={onShare} hitSlop={10}>
          <Share size={20} color="#6B7280" />
        </Pressable>
      </View>

      <Pressable
        onPress={onRemove}
        className="mt-3 h-10 bg-danger/10 rounded-xl items-center justify-center"
      >
        <Text className="text-danger text-sm font-semibold">Remove Access</Text>
      </Pressable>
    </View>
  );
}

// ─── Remove Access Modal ──────────────────────────────────────────────────────

function RemoveAccessModal({
  visit,
  visible,
  onClose,
  onConfirm,
  isPending,
  didRemove,
}: {
  visit: Visit | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  didRemove: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-navy">
            {didRemove ? 'Access Removed' : 'Remove Access'}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={20} color="#0A1628" />
          </Pressable>
        </View>

        {didRemove ? (
          <>
            <Text className="text-sm text-muted mb-6">
              The visitor's access code has been disabled and can no longer be
              used for entry.
            </Text>
            <Pressable
              onPress={onClose}
              className="h-14 border border-border rounded-2xl items-center justify-center"
            >
              <Text className="text-navy font-semibold">Done</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-sm text-muted mb-4">
              This visitor will no longer be able to use their access code to
              enter the estate.
            </Text>
            {visit && (
              <View className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-4">
                <Text className="text-xs font-bold text-primary-500 mb-1">
                  ventry
                </Text>
                <Text className="text-xs text-muted mb-0.5">Access Code</Text>
                <Text className="text-3xl font-bold text-navy">
                  {visit.accessCode}
                </Text>
              </View>
            )}
            {visit && (
              <View className="bg-surface border border-border rounded-2xl p-4 mb-5">
                <Text className="text-sm font-bold text-navy mb-2">
                  Visit Details
                </Text>
                <Row label="Visitor Name" value={visit.visitorName} />
                <Row label="Visit Date" value={formatDateShort(visit.visitDate)} />
                <Row label="Expected Arrival" value={visit.expectedArrivalTime} />
              </View>
            )}
            <Pressable
              onPress={onConfirm}
              disabled={isPending}
              className="h-14 bg-danger rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-semibold">
                {isPending ? 'Removing...' : 'Remove Access'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-1.5 border-b border-border">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-navy">{value}</Text>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const {
    data: todayVisits = [],
    refetch,
    isRefetching,
  } = useTodayVisits();
  const { data: stats } = useTodayStats();
  const revokeVisit = useRevokeVisit();

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [didRemove, setDidRemove] = useState(false);

  const hour = new Date().getHours();
  const emoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';

  function openRemoveModal(visit: Visit) {
    setSelectedVisit(visit);
    setDidRemove(false);
    setShowModal(true);
  }

  async function confirmRemove() {
    if (!selectedVisit) return;
    await revokeVisit.mutateAsync(selectedVisit.id);
    setDidRemove(true);
  }

  function handleShare(visit: Visit) {
    Sharing.shareAsync(
      `Your Ventry access code: ${visit.accessCode}\nVisitor: ${visit.visitorName}\nDate: ${formatDateShort(visit.visitDate)}\nArrival: ${visit.expectedArrivalTime}\n\nValid for 3 hours from arrival time.`,
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        <View className="px-6 pt-6">
          {/* ── Greeting ── */}
          <Text className="text-2xl font-bold text-navy">
            Hello, {user?.firstName} {emoji}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            No. {user?.houseNumber}, {user?.streetName}
          </Text>

          {/* ── Stats chips ── */}
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1 bg-white rounded-2xl px-4 py-3 border border-border">
              <Text className="text-xs text-muted mb-0.5">Expecting today</Text>
              <Text className="text-2xl font-bold text-navy">
                {stats?.expectedToday ?? 0}
              </Text>
              <Text className="text-xs text-muted">visitors</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl px-4 py-3 border border-border">
              <Text className="text-xs text-muted mb-0.5">Entered today</Text>
              <Text className="text-2xl font-bold text-navy">
                {stats?.enteredToday ?? 0}
              </Text>
              <Text className="text-xs text-muted">visitors</Text>
            </View>
          </View>

          {/* ── Generate CTA Banner ── */}
          <View className="mt-5 bg-primary-50 rounded-3xl p-5 border border-primary-100">
            <Text className="text-sm font-bold text-primary-500 mb-1">
              <Text className="text-primary-400">v</Text>entry
            </Text>
            <Text className="text-xl font-bold text-navy mb-1">
              Create Visit or Entry
            </Text>
            <Text className="text-sm text-muted mb-4 leading-5">
              Generate a code or QR for your visitor to enter the estate.
            </Text>
            <Pressable
              onPress={() => router.push('/(app)/generate')}
              className="h-12 bg-primary-500 rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-sm font-semibold">
                Generate Access Code
              </Text>
            </Pressable>
          </View>

          {/* ── Today's Visitors header ── */}
          <View className="flex-row justify-between items-center mt-7 mb-4">
            <Text className="text-lg font-bold text-navy">Today's Visitors</Text>
            <Pressable onPress={() => router.push('/(app)/visitors')}>
              <Text className="text-sm text-primary-500 font-medium border border-primary-200 rounded-full px-3 py-1.5">
                All Upcoming Visits
              </Text>
            </Pressable>
          </View>

          {/* ── Visit list ── */}
          {todayVisits.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-sm text-center">
                No visitors scheduled for today.{'\n'}Tap Generate to add one.
              </Text>
            </View>
          ) : (
            todayVisits.map((v) => (
              <VisitCard
                key={v.id}
                visit={v}
                onRemove={() => openRemoveModal(v)}
                onShare={() => handleShare(v)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <RemoveAccessModal
        visit={selectedVisit}
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmRemove}
        isPending={revokeVisit.isPending}
        didRemove={didRemove}
      />
    </SafeAreaView>
  );
}
