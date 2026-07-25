import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { apiClient, clearTokens, getStoredTokens } from "@/api/client";
import {
  getMe,
  getStoredUser,
  activateAccount,
  loginWithPhone,
  logout,
  registerWithPhone,
} from "@/api/auth";
import { registerPushToken } from "@/lib/push";
import { PIN_ENDPOINTS, STORAGE_KEYS } from "@/constants/api";
import type { AuthState, RegisterPhonePayload, User } from "@/types";

// ─── PIN helpers ──────────────────────────────────────────────────────────────

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AuthActions {
  hydrate: () => Promise<void>;
  registerUser: (
    payload: RegisterPhonePayload,
    otpToken: string,
  ) => Promise<void>;
  loginUser: (otpToken: string) => Promise<void>;
  activateOfficer: (phone: string, code: string, pin: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  clearPinVerified: () => void;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  resetEstatePin: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isPinSet: false,
  isPinVerified: false,
  isBiometricsEnabled: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const [user, tokens, pinHash, biometricPref] = await Promise.all([
        getStoredUser(),
        getStoredTokens(),
        SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH),
        SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED),
      ]);
      set({
        user,
        tokens,
        isPinSet: Boolean(pinHash),
        isPinVerified: false,
        isBiometricsEnabled: biometricPref === "true",
        isLoading: false,
      });
      if (user && tokens) {
        get()
          .refreshProfile()
          .catch(() => {});
      }
    } catch {
      set({ isLoading: false });
    }
  },

  registerUser: async (payload, otpToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await registerWithPhone(payload, otpToken);
      set({ user, tokens, isLoading: false });
      registerPushToken(); // fire-and-forget device token registration
    } catch (err) {
      const message =
        (err as { message?: string }).message ?? "Registration failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  loginUser: async (otpToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await loginWithPhone(otpToken);
      const pinHash = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
      const biometricPref = await SecureStore.getItemAsync(
        STORAGE_KEYS.BIOMETRIC_ENABLED,
      );
      set({
        user,
        tokens,
        isPinSet: Boolean(pinHash),
        isBiometricsEnabled: biometricPref === "true",
        isLoading: false,
      });
      registerPushToken(); // fire-and-forget device token registration
    } catch (err) {
      const message = (err as { message?: string }).message ?? "Login failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  activateOfficer: async (phone, code, pin) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await activateAccount(phone, code, pin);
      // Mirror the new PIN into device SecureStore so the PIN lock works offline.
      const hash = await hashPin(pin);
      await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, hash);
      set({
        user,
        tokens,
        isPinSet: true,
        isPinVerified: true,
        isLoading: false,
      });
      registerPushToken(); // fire-and-forget device token registration
    } catch (err) {
      const message =
        (err as { message?: string }).message ?? "Activation failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logoutUser: async () => {
    set({ isLoading: true });
    try {
      await logout();
    } catch {}
    await clearTokens();
    set({ ...initialState });
  },

  setupPin: async (pin) => {
    const hash = await hashPin(pin);
    await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, hash);
    try {
      await apiClient.post(PIN_ENDPOINTS.SET, { pin });
    } catch {
      // Non-fatal — device-side PIN still works even if backend call fails
    }
    set({ isPinSet: true, isPinVerified: true });
  },

  verifyPin: async (pin) => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
    if (!stored) return false;
    const hash = await hashPin(pin);
    const match = hash === stored;
    if (match) set({ isPinVerified: true });
    return match;
  },

  clearPinVerified: () => set({ isPinVerified: false }),

  refreshProfile: async () => {
    try {
      const user = await getMe();
      set({ user });
    } catch {}
  },
  resetEstatePin: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ESTATE_PIN_VERIFIED);
  },
  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),

  enableBiometrics: async () => {
    await SecureStore.setItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED, "true");
    set({ isBiometricsEnabled: true });
  },

  disableBiometrics: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
    set({ isBiometricsEnabled: false });
  },
}));

export const selectUser = (s: AuthState & AuthActions) => s.user;
export const selectIsAuthenticated = (s: AuthState & AuthActions) =>
  Boolean(s.user && s.tokens);
export const selectIsSecurity = (s: AuthState & AuthActions) =>
  s.user?.role === "security" || s.user?.role === "admin";
export const selectIsAdmin = (s: AuthState & AuthActions) =>
  s.user?.role === "admin" || Boolean(s.user?.isAdmin);
export const selectIsBiometricsEnabled = (s: AuthState & AuthActions) =>
  s.isBiometricsEnabled;
