// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = "resident" | "security" | "admin";
export type UserStatus = "active" | "suspended" | "deleted";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  houseNumber: string;
  streetName: string;
  role: UserRole;
  status: UserStatus;
  pushToken?: string | null;
  notificationPreferences?: {
    pushNotifications: boolean;
    appUpdates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Estate ───────────────────────────────────────────────────────────────────

export interface EstateInfo {
  estateId: string;
  estateName: string;
  bannerImageUrl?: string;
}

// ─── Visit / Access Code ──────────────────────────────────────────────────────

export type VisitStatus =
  | "scheduled"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "expired"
  | "revoked";

export interface Visit {
  id: string;
  residentId: string;
  visitorName: string;
  visitDate: string; // YYYY-MM-DD
  expectedArrivalTime: string; // HH:MM
  accessCode: string; // 5-digit numeric
  qrCodeData: string;
  status: VisitStatus;
  scheduledAt: string;
  expiresAt: string;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitPayload {
  visitorName: string;
  visitDate: string;
  expectedArrivalTime: string;
}

export interface TodayStats {
  expectedToday: number;
  enteredToday: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isPinSet: boolean;
  isPinVerified: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface OtpVerifyResponse {
  otpToken: string;
  isExistingUser: boolean;
}

export interface RegisterPhonePayload {
  firstName: string;
  lastName: string;
  houseNumber: string;
  streetName: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "security_notice"
  | "estate_update"
  | "visitor_alert";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  pushNotifications: boolean;
  appUpdates: boolean;
  pushToken?: string | null;
}

// ─── Concern / Report ─────────────────────────────────────────────────────────

export interface Concern {
  id: string;
  subject: string;
  address: string;
  attachmentUrl?: string | null;
  status: "submitted" | "under_review" | "resolved";
  submittedAt: string;
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
