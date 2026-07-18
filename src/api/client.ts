import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

import {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  REQUEST_TIMEOUT_MS,
  STORAGE_KEYS,
} from "@/constants/api";
import type { ApiError, AuthTokens } from "@/types";

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function getStoredTokens(): Promise<AuthTokens | null> {
  try {
    const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);
    if (!accessToken || !refreshToken || !expiresAtStr) return null;

    const expiresAt = Number(expiresAtStr);

    // Staleness check: reject tokens that are already expired at the storage level
    if (Date.now() > expiresAt) {
      await clearTokens();
      return null;
    }

    return { accessToken, refreshToken, expiresAt };
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    SecureStore.setItemAsync(
      STORAGE_KEYS.TOKEN_EXPIRY,
      String(tokens.expiresAt),
    ),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
    SecureStore.deleteItemAsync(STORAGE_KEYS.OTP_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.PIN_HASH),
  ]);
}

export async function getOtpToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.OTP_TOKEN);
}

export async function saveOtpToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.OTP_TOKEN, token);
}

export async function clearOtpToken(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.OTP_TOKEN);
}

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor — attach access token ────────────────────────────────

apiClient.interceptors.request.use(async (config) => {
  // Respect an explicitly-provided Authorization header (OTP token on login/register)
  if (config.headers.Authorization) return config;

  const tokens = await getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// ─── Response interceptor — 401 / token refresh ───────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/otp") ||
      originalRequest?.url?.includes(AUTH_ENDPOINTS.REFRESH) ||
      originalRequest?.url?.includes(AUTH_ENDPOINTS.LOGIN_PHONE) ||
      originalRequest?.url?.includes(AUTH_ENDPOINTS.REGISTER_PHONE);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const tokens = await getStoredTokens();
        if (!tokens?.refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post<{ data: { tokens: AuthTokens } }>(
          `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
          { refreshToken: tokens.refreshToken },
        );

        const newTokens = data.data.tokens;
        await saveTokens(newTokens);
        flushQueue(null, newTokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError: ApiError = {
      message:
        (error.response?.data as Record<string, string> | undefined)?.message ??
        error.message ??
        "An unexpected error occurred.",
      code: (error.response?.data as Record<string, string> | undefined)?.code,
      statusCode: error.response?.status,
      errors: (
        error.response?.data as
          | Record<string, Record<string, string[]>>
          | undefined
      )?.errors,
    };

    return Promise.reject(apiError);
  },
);
