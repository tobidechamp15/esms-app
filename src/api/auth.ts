import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { apiClient, getStoredTokens, saveOtpToken, saveTokens } from "./client";
import {
  AUTH_ENDPOINTS,
  ESTATE_ENDPOINTS,
  STORAGE_KEYS,
} from "@/constants/api";
import { sanitizeUserForStorage } from "@/utils/secureStorage";
import type {
  ApiResponse,
  AuthTokens,
  EstateInfo,
  OtpVerifyResponse,
  RegisterPhonePayload,
  User,
} from "@/types";

// ─── Estate PIN ───────────────────────────────────────────────────────────────

export async function verifyEstatePin(pin: string): Promise<EstateInfo> {
  const { data } = await apiClient.post<ApiResponse<EstateInfo>>(
    ESTATE_ENDPOINTS.VERIFY_PIN,
    { pin },
  );
  return data.data;
}

export async function getEstateInfo(): Promise<EstateInfo> {
  const { data } = await apiClient.get<ApiResponse<EstateInfo>>(
    ESTATE_ENDPOINTS.INFO,
  );
  return data.data;
}

export async function getEstateStreets(): Promise<string[]> {
  const { data } = await apiClient.get<ApiResponse<{ streets: string[] }>>(
    ESTATE_ENDPOINTS.STREETS,
  );
  return data.data.streets;
}

// ─── OTP ──────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<string | undefined> {
  const { data } = await apiClient.post<ApiResponse<{ code?: string }>>(
    AUTH_ENDPOINTS.OTP_SEND,
    { phone },
  );
  // When OTP_BYPASS is enabled server-side, the API returns the code
  // so the frontend can auto-fill it for the tester.
  return data.data?.code;
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<OtpVerifyResponse> {
  const { data } = await apiClient.post<ApiResponse<OtpVerifyResponse>>(
    AUTH_ENDPOINTS.OTP_VERIFY,
    { phone, otp },
  );
  // Persist the short-lived OTP token for the next step
  await saveOtpToken(data.data.otpToken);
  return data.data;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export async function registerWithPhone(
  payload: RegisterPhonePayload,
  otpToken: string,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    AUTH_ENDPOINTS.REGISTER_PHONE,
    payload,
    { headers: { Authorization: `Bearer ${otpToken}` } },
  );
  await saveTokens(data.data.tokens);
  // Store only sanitized user fields
  const safeUser = sanitizeUserForStorage(data.data.user);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(safeUser));
  return data.data;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export async function loginWithPhone(otpToken: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    AUTH_ENDPOINTS.LOGIN_PHONE,
    {},
    { headers: { Authorization: `Bearer ${otpToken}` } },
  );
  await saveTokens(data.data.tokens);
  // Store only sanitized user fields
  const safeUser = sanitizeUserForStorage(data.data.user);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(safeUser));
  return data.data;
}

// ─── Activation (new security officer) ────────────────────────────────────────

export interface ActivateResponse {
  user: User;
  tokens: AuthTokens;
}

export async function verifyActivationCode(
  phone: string,
  code: string,
): Promise<{ phone: string; firstName: string; lastName: string }> {
  const { data } = await apiClient.post<
    ApiResponse<{ phone: string; firstName: string; lastName: string }>
  >(AUTH_ENDPOINTS.ACTIVATE_VERIFY_CODE, { phone, code });
  return data.data;
}

export async function activateAccount(
  phone: string,
  code: string,
  newPin: string,
): Promise<ActivateResponse> {
  const { data } = await apiClient.post<ApiResponse<ActivateResponse>>(
    AUTH_ENDPOINTS.ACTIVATE,
    { phone, code, newPin },
  );
  await saveTokens(data.data.tokens);
  // Store only sanitized user fields
  const safeUser = sanitizeUserForStorage(data.data.user);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(safeUser));
  return data.data;
}

// ─── PIN Reset ────────────────────────────────────────────────────────────────

export interface PinResetResponse {
  tokens: AuthTokens;
}

export async function resetPin(
  phone: string,
  resetCode: string,
  newPin: string,
): Promise<PinResetResponse> {
  const { data } = await apiClient.post<ApiResponse<PinResetResponse>>(
    AUTH_ENDPOINTS.PIN_RESET,
    { phone, resetCode, newPin },
  );
  await saveTokens(data.data.tokens);
  return data.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    const tokens = await getStoredTokens();
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {
      refreshToken: tokens?.refreshToken,
    });
  } catch {
    // best-effort
  }
}

// ─── Get Me ───────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>(AUTH_ENDPOINTS.ME);
  // Store only sanitized user fields
  const safeUser = sanitizeUserForStorage(data.data);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(safeUser));
  return data.data;
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
