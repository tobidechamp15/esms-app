import { apiClient } from "./client";
import { VISIT_ENDPOINTS } from "@/constants/api";
import type {
  ApiResponse,
  CreateVisitPayload,
  PaginatedResponse,
  TodayStats,
  Visit,
} from "@/types";

export interface GetVisitsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function createVisit(payload: CreateVisitPayload): Promise<Visit> {
  const { data } = await apiClient.post<ApiResponse<Visit>>(
    VISIT_ENDPOINTS.BASE,
    payload,
  );
  return data.data;
}

export async function getMyVisits(
  params: GetVisitsParams = {},
): Promise<PaginatedResponse<Visit>> {
  const { data } = await apiClient.get<PaginatedResponse<Visit>>(
    VISIT_ENDPOINTS.MY_VISITS,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(params.status ? { status: params.status } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function getTodayVisits(): Promise<Visit[]> {
  const result = await getMyVisits({ status: "scheduled", limit: 50 });
  const today = new Date().toISOString().slice(0, 10);
  return result.data.filter((v) => v.visitDate === today);
}

export async function getPastVisits(
  params: GetVisitsParams = {},
): Promise<PaginatedResponse<Visit>> {
  const { data } = await apiClient.get<PaginatedResponse<Visit>>(
    VISIT_ENDPOINTS.MY_VISITS,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        status: ['scheduled', 'checked_in', 'checked_out', 'cancelled', 'expired', 'revoked'],
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function getUpcomingVisits(): Promise<Visit[]> {
  const result = await getMyVisits({ status: "scheduled", limit: 50 });
  const today = new Date().toISOString().slice(0, 10);
  return result.data.filter((v) => v.visitDate >= today);
}

export async function getVisitById(id: string): Promise<Visit> {
  const { data } = await apiClient.get<ApiResponse<Visit>>(
    VISIT_ENDPOINTS.BY_ID(id),
  );
  return data.data;
}

export async function revokeVisit(id: string): Promise<Visit> {
  const { data } = await apiClient.patch<ApiResponse<Visit>>(
    VISIT_ENDPOINTS.REVOKE(id),
  );
  return data.data;
}

export async function getTodayStats(): Promise<TodayStats> {
  const { data } = await apiClient.get<ApiResponse<TodayStats>>(
    VISIT_ENDPOINTS.STATS_TODAY,
  );
  return data.data;
}

export interface VerifyCodePayload {
  accessCode: string;
  action: "check_in" | "check_out";
}

export interface VerifyCodeResponse {
  visit: Visit;
  message: string;
}

export async function verifyAccessCode(
  payload: VerifyCodePayload,
): Promise<VerifyCodeResponse> {
  const { data } = await apiClient.post<ApiResponse<VerifyCodeResponse>>(
    VISIT_ENDPOINTS.VERIFY_CODE,
    payload,
  );
  return data.data;
}

export async function verifyQRCode(
  payload: VerifyCodePayload,
): Promise<VerifyCodeResponse> {
  const { data } = await apiClient.post<ApiResponse<VerifyCodeResponse>>(
    VISIT_ENDPOINTS.VERIFY_QR,
    payload,
  );
  return data.data;
}
