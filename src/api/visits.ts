import { apiClient } from './client';
import { VISIT_ENDPOINTS } from '@/constants/api';
import type {
  ApiResponse,
  CreateVisitPayload,
  PaginatedResponse,
  VerifyQRPayload,
  Visit,
} from '@/types';

// ─── Create Visit ─────────────────────────────────────────────────────────────

export async function createVisit(payload: CreateVisitPayload): Promise<Visit> {
  const { data } = await apiClient.post<ApiResponse<Visit>>(VISIT_ENDPOINTS.BASE, payload);
  return data.data;
}

// ─── Get Visits ───────────────────────────────────────────────────────────────

export interface GetVisitsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function getVisits(params: GetVisitsParams = {}): Promise<PaginatedResponse<Visit>> {
  const { data } = await apiClient.get<PaginatedResponse<Visit>>(VISIT_ENDPOINTS.MY_VISITS, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

// ─── Get All Visits (security / admin) ───────────────────────────────────────

export async function getAllVisits(params: GetVisitsParams = {}): Promise<PaginatedResponse<Visit>> {
  const { data } = await apiClient.get<PaginatedResponse<Visit>>(VISIT_ENDPOINTS.BASE, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

// ─── Get Visit By Id ──────────────────────────────────────────────────────────

export async function getVisitById(id: string): Promise<Visit> {
  const { data } = await apiClient.get<ApiResponse<Visit>>(VISIT_ENDPOINTS.BY_ID(id));
  return data.data;
}

// ─── Cancel Visit ─────────────────────────────────────────────────────────────

export async function cancelVisit(id: string): Promise<Visit> {
  const { data } = await apiClient.patch<ApiResponse<Visit>>(
    `${VISIT_ENDPOINTS.BY_ID(id)}/cancel`,
  );
  return data.data;
}

// ─── Verify QR ────────────────────────────────────────────────────────────────

export interface VerifyQRResponse {
  visit: Visit;
  message: string;
}

export async function verifyQR(payload: VerifyQRPayload): Promise<VerifyQRResponse> {
  const { data } = await apiClient.post<ApiResponse<VerifyQRResponse>>(
    VISIT_ENDPOINTS.VERIFY_QR,
    payload,
  );
  return data.data;
}
