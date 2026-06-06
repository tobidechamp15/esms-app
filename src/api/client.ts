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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getStoredTokens(): Promise<AuthTokens | null> {
  try {
    const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);
    if (!accessToken || !refreshToken || !expiresAtStr) return null;
    return { accessToken, refreshToken, expiresAt: Number(expiresAtStr) };
  } catch {
    return null;
  }
}

async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    SecureStore.setItemAsync(
      STORAGE_KEYS.TOKEN_EXPIRY,
      String(tokens.expiresAt),
    ),
  ]);
}

async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
  ]);
}

// ─── Client ───────────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor — attach access token ────────────────────────────────

apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const tokens = await getStoredTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — handle 401 / token refresh ───────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, and not on auth endpoints themselves
    const isAuthEndpoint =
      originalRequest?.url?.startsWith(AUTH_ENDPOINTS.LOGIN) ||
      originalRequest?.url?.startsWith(AUTH_ENDPOINTS.REGISTER) ||
      originalRequest?.url?.startsWith(AUTH_ENDPOINTS.REFRESH);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in-flight
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

        const { data } = await axios.post<{ data: AuthTokens }>(
          `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
          { refreshToken: tokens.refreshToken },
        );

        await saveTokens(data.data);
        flushQueue(null, data.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        await clearTokens();
        // Signal auth store to log out; import lazily to avoid circular deps
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise error shape
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

export { apiClient, clearTokens, getStoredTokens, saveTokens };
