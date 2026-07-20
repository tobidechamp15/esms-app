import { apiClient } from "./client";
import {
  SECURITY_ENDPOINTS,
  ACTIVITY_ENDPOINTS,
  ANNOUNCEMENT_ENDPOINTS,
  PANIC_ENDPOINTS,
  ADMIN_USER_ENDPOINTS,
  CONCERN_STATUS_ENDPOINT,
} from "@/constants/api";
import type { ApiResponse, PaginatedResponse, User } from "@/types";

// ─── Code generation ──────────────────────────────────────────────────────────

export interface GeneratedCode {
  code: string;
  expiresAt: string;
  phone: string;
}

/** Generate a single-use PIN reset code for a resident or security account. */
export async function generateResetCode(
  userId: string,
): Promise<GeneratedCode> {
  const { data } = await apiClient.post<ApiResponse<GeneratedCode>>(
    SECURITY_ENDPOINTS.RESET_CODE(userId),
  );
  return data.data;
}

/** Generate a security activation code for a new (or pending) officer. */
export async function generateActivationCode(payload: {
  phone: string;
  firstName?: string;
  lastName?: string;
}): Promise<GeneratedCode> {
  const { data } = await apiClient.post<ApiResponse<GeneratedCode>>(
    SECURITY_ENDPOINTS.ACTIVATION_CODE,
    payload,
  );
  return data.data;
}

// ─── Account lifecycle ────────────────────────────────────────────────────────

export type AccountStatusAction = "suspend" | "reactivate" | "delete";

export async function updateAccountStatus(
  userId: string,
  action: AccountStatusAction,
  pin: string,
): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.patch<
    ApiResponse<{ id: string; status: string }>
  >(SECURITY_ENDPOINTS.ACCOUNT_STATUS(userId), { action, pin });
  return data.data;
}

export async function transferAdmin(
  targetUserId: string,
  pin: string,
): Promise<{ newAdminId: string }> {
  const { data } = await apiClient.post<ApiResponse<{ newAdminId: string }>>(
    SECURITY_ENDPOINTS.TRANSFER_ADMIN,
    { targetUserId, pin },
  );
  return data.data;
}

// ─── Directory (residents / security) ─────────────────────────────────────────

export async function listUsers(params: {
  role?: "resident" | "security";
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    ADMIN_USER_ENDPOINTS.LIST,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        ...(params.role ? { role: params.role } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

// ─── Activity logs ────────────────────────────────────────────────────────────

export interface ActivityLogItem {
  id: string;
  actorName: string;
  action: string;
  description: string;
  createdAt: string;
}

export async function getActivityLogs(
  params: {
    userId?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<PaginatedResponse<ActivityLogItem>> {
  const { data } = await apiClient.get<PaginatedResponse<ActivityLogItem>>(
    ACTIVITY_ENDPOINTS.BASE,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.userId ? { userId: params.userId } : {}),
      },
    },
  );
  return data;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export type AnnouncementType = "estate_update" | "security_notice";

export interface Announcement {
  id: string;
  type: AnnouncementType;
  subject: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export async function getAnnouncements(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Announcement>> {
  const { data } = await apiClient.get<PaginatedResponse<Announcement>>(
    ANNOUNCEMENT_ENDPOINTS.BASE,
    { params: { page, limit } },
  );
  return data;
}

export async function createAnnouncement(payload: {
  type: AnnouncementType;
  subject: string;
  body: string;
}): Promise<Announcement> {
  const { data } = await apiClient.post<ApiResponse<Announcement>>(
    ANNOUNCEMENT_ENDPOINTS.BASE,
    payload,
  );
  return data.data;
}

// ─── Panic ────────────────────────────────────────────────────────────────────

export async function triggerPanic(): Promise<{ notificationId: string }> {
  const { data } = await apiClient.post<
    ApiResponse<{ notificationId: string }>
  >(PANIC_ENDPOINTS.BASE);
  return data.data;
}

// ─── Concern status ───────────────────────────────────────────────────────────

export async function updateConcernStatus(
  id: string,
  status: "submitted" | "under_review" | "resolved",
): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.patch<
    ApiResponse<{ id: string; status: string }>
  >(CONCERN_STATUS_ENDPOINT(id), { status });
  return data.data;
}

// ─── Resident reports (concerns) ──────────────────────────────────────────────

export interface ConcernResident {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  houseNumber?: string;
  streetName?: string;
}

export interface Concern {
  id: string;
  subject: string;
  address: string;
  attachmentUrl?: string | null;
  status: "submitted" | "under_review" | "resolved";
  submittedAt: string;
  createdAt: string;
  resident: ConcernResident | null;
}

export async function getConcerns(
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<Concern>> {
  const { data } = await apiClient.get<PaginatedResponse<Concern>>(
    "/concerns",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return data;
}

export async function getConcern(id: string): Promise<Concern> {
  const { data } = await apiClient.get<ApiResponse<Concern>>(`/concerns/${id}`);
  return data.data;
}
