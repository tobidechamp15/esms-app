// Base URL is loaded from environment; fallback points to local dev server
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ??
  'http://localhost:3000/api/v1';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  CHECK_STATUS: '/auth/status',
} as const;

// ─── Visits ───────────────────────────────────────────────────────────────────
export const VISIT_ENDPOINTS = {
  BASE: '/visits',
  BY_ID: (id: string) => `/visits/${id}`,
  VERIFY_QR: '/visits/verify-qr',
  MY_VISITS: '/visits/my',
} as const;

// ─── Users ────────────────────────────────────────────────────────────────────
export const USER_ENDPOINTS = {
  BASE: '/users',
  BY_ID: (id: string) => `/users/${id}`,
  PROFILE: '/users/profile',
} as const;

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'esms_access_token',
  REFRESH_TOKEN: 'esms_refresh_token',
  TOKEN_EXPIRY: 'esms_token_expiry',
  USER: 'esms_user',
  PIN_HASH: 'esms_pin_hash',
} as const;

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const REQUEST_TIMEOUT_MS = 15_000;
export const QR_EXPIRY_BUFFER_MS = 30_000; // show warning 30 s before QR expires
