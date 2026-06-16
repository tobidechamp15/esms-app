import { apiClient } from './client';
import { NOTIFICATION_ENDPOINTS } from '@/constants/api';
import type { ApiResponse, AppNotification, PaginatedResponse } from '@/types';

export async function getNotifications(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<AppNotification>> {
  const { data } = await apiClient.get<PaginatedResponse<AppNotification>>(
    NOTIFICATION_ENDPOINTS.BASE,
    { params: { page, limit } },
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_READ(id));
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
    NOTIFICATION_ENDPOINTS.UNREAD_COUNT,
  );
  return data.data.count;
}
