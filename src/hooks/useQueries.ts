import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createVisit,
  getPastVisits,
  getTodayStats,
  getTodayVisits,
  getUpcomingVisits,
  revokeVisit,
  verifyAccessCode,
} from '@/api/visits';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from '@/api/notifications';
import {
  deleteAccount,
  getNotificationPreferences,
  submitConcern,
  updateNotificationPreferences,
  updateProfile,
} from '@/api/users';
import type { CreateVisitPayload } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  todayVisits:    ['visits', 'today']                   as const,
  upcomingVisits: ['visits', 'upcoming']                as const,
  pastVisits:     ['visits', 'past']                    as const,
  todayStats:     ['visits', 'stats', 'today']          as const,
  notifications:  ['notifications']                     as const,
  unreadCount:    ['notifications', 'unread']           as const,
  notifPrefs:     ['user', 'notification-preferences']  as const,
};

// ─── Visit Hooks ──────────────────────────────────────────────────────────────

export function useTodayVisits() {
  return useQuery({
    queryKey: queryKeys.todayVisits,
    queryFn: getTodayVisits,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useUpcomingVisits() {
  return useQuery({
    queryKey: queryKeys.upcomingVisits,
    queryFn: getUpcomingVisits,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePastVisits(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.pastVisits, search ?? ''],
    queryFn: () => getPastVisits({ search }),
    staleTime: 60_000,
  });
}

export function useTodayStats() {
  return useQuery({
    queryKey: queryKeys.todayStats,
    queryFn: getTodayStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVisitPayload) => createVisit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todayVisits });
      qc.invalidateQueries({ queryKey: queryKeys.upcomingVisits });
      qc.invalidateQueries({ queryKey: queryKeys.todayStats });
    },
  });
}

export function useRevokeVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeVisit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.todayVisits });
      qc.invalidateQueries({ queryKey: queryKeys.upcomingVisits });
      qc.invalidateQueries({ queryKey: queryKeys.todayStats });
    },
  });
}

export function useVerifyCode() {
  return useMutation({ mutationFn: verifyAccessCode });
}

// ─── Notification Hooks ───────────────────────────────────────────────────────

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: [...queryKeys.notifications, page],
    queryFn: () => getNotifications(page),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: getUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

// ─── User / Settings Hooks ────────────────────────────────────────────────────

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifPrefs,
    queryFn: getNotificationPreferences,
    staleTime: 300_000,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifPrefs }),
  });
}

export function useUpdateProfile() {
  return useMutation({ mutationFn: updateProfile });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: deleteAccount });
}

export function useSubmitConcern() {
  return useMutation({
    mutationFn: ({
      subject,
      address,
      attachment,
    }: {
      subject: string;
      address: string;
      attachment?: { uri: string; name: string; type: string };
    }) => submitConcern(subject, address, attachment),
  });
}
