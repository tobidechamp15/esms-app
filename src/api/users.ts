import { apiClient } from './client';
import { CONCERN_ENDPOINTS, USER_ENDPOINTS } from '@/constants/api';
import type { ApiResponse, Concern, NotificationPreferences, User } from '@/types';

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(USER_ENDPOINTS.ME, payload);
  return data.data;
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete(USER_ENDPOINTS.ME);
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<ApiResponse<NotificationPreferences>>(
    USER_ENDPOINTS.NOTIFICATION_PREFS,
  );
  return data.data;
}

export async function updateNotificationPreferences(
  payload: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const { data } = await apiClient.patch<ApiResponse<NotificationPreferences>>(
    USER_ENDPOINTS.NOTIFICATION_PREFS,
    payload,
  );
  return data.data;
}

export async function submitConcern(
  subject: string,
  address: string,
  attachment?: { uri: string; name: string; type: string },
): Promise<Concern> {
  const form = new FormData();
  form.append('subject', subject);
  form.append('address', address);
  if (attachment) {
    form.append('attachment', {
      uri: attachment.uri,
      name: attachment.name,
      type: attachment.type,
    } as unknown as Blob);
  }

  const { data } = await apiClient.post<ApiResponse<Concern>>(
    CONCERN_ENDPOINTS.BASE,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}
