export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ?? '';

export const ESTATE_NAME =
  (process.env.EXPO_PUBLIC_ESTATE_NAME as string | undefined) ?? 'Your Estate';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  OTP_SEND:       '/auth/otp/send',
  OTP_VERIFY:     '/auth/otp/verify',
  REGISTER_PHONE: '/auth/register/phone',
  LOGIN_PHONE:    '/auth/login/phone',
  PIN_RESET:      '/auth/pin/reset',
  LOGOUT:         '/auth/logout',
  REFRESH:        '/auth/refresh',
  ME:             '/auth/me',
} as const;

// ─── Estate ───────────────────────────────────────────────────────────────────
export const ESTATE_ENDPOINTS = {
  VERIFY_PIN: '/estates/verify-pin',
  INFO:       '/estates/info',
  STREETS:    '/estates/streets',
} as const;

// ─── Visits ───────────────────────────────────────────────────────────────────
export const VISIT_ENDPOINTS = {
  BASE:         '/visits',
  MY_VISITS:    '/visits/my',
  STATS_TODAY:  '/visits/stats/today',
  VERIFY_CODE:  '/visits/verify-code',
  BY_ID:        (id: string) => `/visits/${id}`,
  REVOKE:       (id: string) => `/visits/${id}/revoke`,
  VERIFY_QR:    '/visits/verify-qr',
} as const;

// ─── Notifications ────────────────────────────────────────────────────────────
export const NOTIFICATION_ENDPOINTS = {
  BASE:         '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ:    (id: string) => `/notifications/${id}/read`,
} as const;

// ─── Users ────────────────────────────────────────────────────────────────────
export const USER_ENDPOINTS = {
  ME:                   '/users/me',
  NOTIFICATION_PREFS:   '/users/me/notification-preferences',
} as const;
export const PIN_ENDPOINTS = {
  SET:                   '/auth/pin/set',
  RESET:   '/auth/pin/reset',
} as const;

// ─── Concerns ─────────────────────────────────────────────────────────────────
export const CONCERN_ENDPOINTS = {
  BASE: '/concerns',
} as const;

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'ventry_access_token',
  REFRESH_TOKEN: 'ventry_refresh_token',
  TOKEN_EXPIRY:  'ventry_token_expiry',
  USER:          'ventry_user',
  PIN_HASH:      'ventry_pin_hash',
  OTP_TOKEN:     'ventry_otp_token',
  ESTATE_PIN_VERIFIED: 'ventry_estate_pin_verified',
} as const;

export const REQUEST_TIMEOUT_MS = 15_000;
