import * as SecureStore from 'expo-secure-store';

import { apiClient, saveTokens } from './client';
import { AUTH_ENDPOINTS, STORAGE_KEYS } from '@/constants/api';
import type {
  ApiResponse,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
  UserStatus,
} from '@/types';

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    AUTH_ENDPOINTS.REGISTER,
    payload,
  );
  await saveTokens(data.data.tokens);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
  return data.data;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    AUTH_ENDPOINTS.LOGIN,
    payload,
  );
  await saveTokens(data.data.tokens);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
  return data.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  } catch {
    // Best-effort; clear local data regardless
  } finally {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
    ]);
  }
}

// ─── Check Status ─────────────────────────────────────────────────────────────

export interface CheckStatusResponse {
  status: UserStatus;
  user: User;
}

export async function checkStatus(): Promise<CheckStatusResponse> {
  const { data } = await apiClient.get<ApiResponse<CheckStatusResponse>>(
    AUTH_ENDPOINTS.CHECK_STATUS,
  );
  return data.data;
}

// ─── Get Me ───────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);
  // Keep local copy in sync
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(data.data));
  return data.data;
}

// ─── Local user hydration ─────────────────────────────────────────────────────

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
