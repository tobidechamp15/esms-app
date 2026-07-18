import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createVisit,
  getPastVisits,
  getTodayStats,
  getTodayVisits,
  getUpcomingVisits,
  revokeVisit,
  verifyAccessCode,
} from "@/api/visits";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from "@/api/notifications";
import {
  deleteAccount,
  getNotificationPreferences,
  submitConcern,
  updateNotificationPreferences,
  updateProfile,
} from "@/api/users";
import type {
  AppNotification,
  CreateVisitPayload,
  PaginatedResponse,
  Visit,
} from "@/types";
import {
  generateActivationCode,
  generateResetCode,
  updateAccountStatus,
  transferAdmin,
  getActivityLogs,
  getAnnouncements,
  createAnnouncement,
  triggerPanic,
  updateConcernStatus,
  getConcerns,
  getConcern,
  type AccountStatusAction,
} from "@/api/security";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  todayVisits: ["visits", "today"] as const,
  upcomingVisits: ["visits", "upcoming"] as const,
  pastVisits: ["visits", "past"] as const,
  todayStats: ["visits", "stats", "today"] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread"] as const,
  notifPrefs: ["user", "notification-preferences"] as const,
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
    queryFn: () => getUpcomingVisits(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePastVisits(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.pastVisits, search ?? ""],
    queryFn: () => getPastVisits({ search }),
    staleTime: 60_000,
  });
}

/** Paginated past visits — loads 5 per page, infinite scroll via fetchNextPage() */
export function usePaginatedPastVisits(search?: string) {
  const query = useInfiniteQuery<PaginatedResponse<Visit>>({
    queryKey: [...queryKeys.pastVisits, "paginated", search ?? ""],
    queryFn: ({ pageParam }) =>
      getPastVisits({ search, page: pageParam as number, limit: 5 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 60_000,
  });

  const items: Visit[] = query.data?.pages.flatMap((p) => p.data) ?? [];
  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refresh: query.refetch,
    isError: query.isError,
  };
}

/** Paginated upcoming visits — loads 5 per page, infinite scroll via fetchNextPage() */
export function usePaginatedUpcomingVisits() {
  const query = useInfiniteQuery<PaginatedResponse<Visit>>({
    queryKey: [...queryKeys.upcomingVisits, "paginated"],
    queryFn: ({ pageParam }) =>
      getUpcomingVisits({ page: pageParam as number, limit: 5 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const items: Visit[] = query.data?.pages.flatMap((p) => p.data) ?? [];
  return {
    items,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refresh: query.refetch,
    isError: query.isError,
  };
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

const NOTIF_PAGE_SIZE = 5;

/**
 * Paginated notifications hook using useInfiniteQuery with skeleton-ready state.
 * Loads 5 items per page, fetches more on demand via fetchNextPage().
 */
export function usePaginatedNotifications() {
  const query = useInfiniteQuery<PaginatedResponse<AppNotification>>({
    queryKey: [...queryKeys.notifications, "paginated"],
    queryFn: ({ pageParam }) =>
      getNotifications(pageParam as number, NOTIF_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Flatten all pages into a single list
  const items: AppNotification[] =
    query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.meta?.total ?? 0;

  return {
    items,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: !!query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refresh: query.refetch,
    isError: query.isError,
  };
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

// ─── Security Hooks ───────────────────────────────────────────────────────────

export function useActivityLogs(userId?: string) {
  return useQuery({
    queryKey: ["activity-logs", userId ?? "all"],
    queryFn: () => getActivityLogs({ userId }),
    staleTime: 30_000,
  });
}

export function useAnnouncements(page = 1) {
  return useQuery({
    queryKey: ["announcements", page],
    queryFn: () => getAnnouncements(page),
    staleTime: 30_000,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useGenerateResetCode() {
  return useMutation({
    mutationFn: (userId: string) => generateResetCode(userId),
  });
}

export function useGenerateActivationCode() {
  return useMutation({ mutationFn: generateActivationCode });
}

export function useUpdateAccountStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      action,
      pin,
    }: {
      userId: string;
      action: AccountStatusAction;
      pin: string;
    }) => updateAccountStatus(userId, action, pin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["directory"] }),
  });
}

export function useTransferAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetUserId,
      pin,
    }: {
      targetUserId: string;
      pin: string;
    }) => transferAdmin(targetUserId, pin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["directory"] }),
  });
}

export function usePanic() {
  return useMutation({ mutationFn: triggerPanic });
}

export function useUpdateConcernStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "submitted" | "under_review" | "resolved";
    }) => updateConcernStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concerns"] }),
  });
}

export function useConcerns(status?: string) {
  return useQuery({
    queryKey: ["concerns", status ?? "all"],
    queryFn: () => getConcerns({ status }),
    staleTime: 30_000,
  });
}

export function useConcern(id: string) {
  return useQuery({
    queryKey: ["concern", id],
    queryFn: () => getConcern(id),
    enabled: Boolean(id),
  });
}
