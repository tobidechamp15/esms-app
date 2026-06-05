// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'resident' | 'security' | 'admin';

export type UserStatus = 'pending' | 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  unitNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Visit ───────────────────────────────────────────────────────────────────

export type VisitStatus = 'scheduled' | 'checked_in' | 'checked_out' | 'cancelled' | 'expired';

export type VisitPurpose =
  | 'personal'
  | 'delivery'
  | 'maintenance'
  | 'official'
  | 'other';

export interface Visitor {
  name: string;
  phone: string;
  vehiclePlate?: string;
  identificationNumber?: string;
}

export interface Visit {
  id: string;
  residentId: string;
  resident?: Pick<User, 'id' | 'name' | 'unitNumber'>;
  visitor: Visitor;
  purpose: VisitPurpose;
  purposeNote?: string;
  status: VisitStatus;
  qrCode: string;
  scheduledAt: string;
  expiresAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  checkedInByUserId?: string;
  checkedOutByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitPayload {
  visitorName: string;
  visitorPhone: string;
  visitorVehiclePlate?: string;
  visitorIdentificationNumber?: string;
  purpose: VisitPurpose;
  purposeNote?: string;
  scheduledAt: string;
  expiresAt: string;
}

export interface VerifyQRPayload {
  qrCode: string;
  action: 'check_in' | 'check_out';
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Extract<UserRole, 'resident' | 'security'>;
  unitNumber?: string;
}

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

// ─── Visit Store ──────────────────────────────────────────────────────────────

export interface VisitState {
  visits: Visit[];
  currentVisit: Visit | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

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
