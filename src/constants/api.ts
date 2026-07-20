/**
 * API Configuration
 *
 * Provides validated API configuration for the Ventry app.
 * In production builds, enforces HTTPS requirement.
 */

function validateApiUrl(url: string | undefined): string {
  if (!url) return "";

  // In development (Expo Go / local), allow HTTP for local testing
  if (__DEV__) return url;

  // In production builds, HTTPS is MANDATORY
  if (!url.startsWith("https://")) {
    console.error(
      "[SECURITY] API_BASE_URL must use HTTPS in production builds. " +
        "Set EXPO_PUBLIC_API_BASE_URL to an https:// URL.",
    );
    // Return empty to force connection failure rather than sending data over HTTP
    return "";
  }

  return url;
}

export const API_BASE_URL = validateApiUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined,
);

export const ESTATE_NAME =
  (process.env.EXPO_PUBLIC_ESTATE_NAME as string | undefined) ?? "Your Estate";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  OTP_SEND: "/auth/otp/send",
  OTP_VERIFY: "/auth/otp/verify",
  REGISTER_PHONE: "/auth/register/phone",
  LOGIN_PHONE: "/auth/login/phone",
  PIN_RESET: "/auth/pin/reset",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
  ACTIVATE: "/auth/activate",
  ACTIVATE_VERIFY_CODE: "/auth/activate/verify-code",
  PUSH_TOKEN: "/users/me/push-token",
} as const;

// ─── Security (management) ────────────────────────────────────────────────────
export const SECURITY_ENDPOINTS = {
  ACTIVATION_CODE: "/security/activation-code",
  RESET_CODE: (id: string) => `/security/users/${id}/reset-code`,
  ACCOUNT_STATUS: (id: string) => `/security/users/${id}/status`,
  TRANSFER_ADMIN: "/security/admin/transfer",
} as const;

export const ACTIVITY_ENDPOINTS = {
  BASE: "/activity-logs",
} as const;

export const ANNOUNCEMENT_ENDPOINTS = {
  BASE: "/announcements",
} as const;

export const PANIC_ENDPOINTS = {
  BASE: "/panic",
} as const;

// List users (existing admin route) + concern status
export const ADMIN_USER_ENDPOINTS = {
  LIST: "/admin/users",
} as const;
export const CONCERN_STATUS_ENDPOINT = (id: string) => `/concerns/${id}/status`;

// ─── Estate ───────────────────────────────────────────────────────────────────
export const ESTATE_ENDPOINTS = {
  VERIFY_PIN: "/estates/verify-pin",
  INFO: "/estates/info",
  STREETS: "/estates/streets",
} as const;

// ─── Visits ───────────────────────────────────────────────────────────────────
export const VISIT_ENDPOINTS = {
  BASE: "/visits",
  MY_VISITS: "/visits/my",
  STATS_TODAY: "/visits/stats/today",
  VERIFY_CODE: "/visits/verify-code",
  BY_ID: (id: string) => `/visits/${id}`,
  REVOKE: (id: string) => `/visits/${id}/revoke`,
  VERIFY_QR: "/visits/verify-qr",
} as const;

// ─── Notifications ────────────────────────────────────────────────────────────
export const NOTIFICATION_ENDPOINTS = {
  BASE: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  BY_ID: (id: string) => `/notifications/${id}`,
} as const;

// ─── Users ────────────────────────────────────────────────────────────────────
export const USER_ENDPOINTS = {
  ME: "/users/me",
  NOTIFICATION_PREFS: "/users/me/notification-preferences",
} as const;
export const PIN_ENDPOINTS = {
  SET: "/auth/pin/set",
  RESET: "/auth/pin/reset",
} as const;

// ─── Concerns ─────────────────────────────────────────────────────────────────
export const CONCERN_ENDPOINTS = {
  BASE: "/concerns",
} as const;

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "ventry_access_token",
  REFRESH_TOKEN: "ventry_refresh_token",
  TOKEN_EXPIRY: "ventry_token_expiry",
  USER: "ventry_user",
  PIN_HASH: "ventry_pin_hash",
  OTP_TOKEN: "ventry_otp_token",
  ESTATE_PIN_VERIFIED: "ventry_estate_pin_verified",
} as const;

export const REQUEST_TIMEOUT_MS = 15_000;
